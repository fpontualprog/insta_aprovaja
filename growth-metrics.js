(() => {
  'use strict';
  const STORAGE_KEY = 'aprovaja-growth-metrics-v1';
  const GOAL_STORAGE_KEY = 'aprovaja-weekly-growth-goal-v1';
  const GOAL_BASELINE = { date: '2026-10-31', followers: 278 };
  const $ = (id) => document.getElementById(id);
  const number = (id) => Math.max(0, Number($(id)?.value || 0));
  const read = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  let entries = read();
  const fmt = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);
  const pct = (a, b) => b > 0 ? (a / b * 100).toFixed(1).replace('.', ',') + '%' : '—';

  function render() {
    const totals = entries.reduce((acc, item) => {
      ['reach','nonFollowers','views','shares','saves','comments','profileVisits','followers','linkClicks'].forEach(k => acc[k] += Number(item[k] || 0));
      return acc;
    }, {reach:0,nonFollowers:0,views:0,shares:0,saves:0,comments:0,profileVisits:0,followers:0,linkClicks:0});
    $('growthMetricsCount').textContent = fmt(entries.length);
    $('growthReachTotal').textContent = fmt(totals.reach);
    $('growthNonFollowers').textContent = pct(totals.nonFollowers, totals.reach);
    $('growthSharesSaves').textContent = fmt(totals.shares + totals.saves);
    $('growthProfileVisits').textContent = fmt(totals.profileVisits);
    $('growthFollowers').textContent = fmt(totals.followers);
    $('growthLinkClicks').textContent = fmt(totals.linkClicks);
    const body = $('growthMetricsRows');
    body.replaceChildren();
    if (!entries.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.className = 'growth-empty';
      td.textContent = 'Nenhum resultado registrado. Lance os dados do Instagram Insights após a publicação.';
      tr.append(td); body.append(tr); return;
    }
    [...entries].sort((a,b) => (b.date || '').localeCompare(a.date || '')).forEach(item => {
      const tr = document.createElement('tr');
      const values = [
        item.date || '—', item.title || 'Sem título', item.format || '—',
        fmt(item.reach), fmt(item.nonFollowers), fmt(item.views),
        fmt(item.shares), fmt(item.saves)
      ];
      values.forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
  }

  function readGoalEntries() {
    try {
      const saved = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [{ date: GOAL_BASELINE.date, followers: GOAL_BASELINE.followers, baseline: true }];
  }
  let goalEntries = readGoalEntries();

  function renderGoal() {
    const sorted = [...goalEntries].sort((a,b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const first = sorted[0];
    const elapsedDays = Math.max(0, Math.floor((new Date(latest.date + 'T12:00:00Z') - new Date(GOAL_BASELINE.date + 'T12:00:00Z')) / 86400000));
    const gain = Number(latest.followers) - GOAL_BASELINE.followers;
    const expectedGain = elapsedDays / 7 * 100;
    const pace = elapsedDays > 0 ? gain / elapsedDays * 7 : 0;
    const progress = expectedGain > 0 ? Math.max(0, Math.min(100, gain / expectedGain * 100)) : 0;
    $('growthGoalBaseline').textContent = fmt(GOAL_BASELINE.followers);
    $('growthGoalCurrent').textContent = fmt(latest.followers);
    $('growthGoalGain').textContent = (gain > 0 ? '+' : '') + fmt(gain);
    $('growthGoalPace').textContent = elapsedDays > 0 ? fmt(Math.round(pace)) + '/sem.' : '—';
    $('growthGoalPercent').textContent = Math.round(progress) + '%';
    $('growthGoalBar').style.width = progress + '%';
    $('growthGoalStatus').textContent = elapsedDays === 0 ? 'Aguardando primeira semana' : (pace >= 100 ? 'Meta semanal no ritmo ou superada' : 'Abaixo do ritmo da meta');
    const nextMilestone = new Date(GOAL_BASELINE.date + 'T12:00:00Z');
    nextMilestone.setUTCDate(nextMilestone.getUTCDate() + (Math.floor(elapsedDays / 7) + 1) * 7);
    const milestoneTarget = GOAL_BASELINE.followers + (Math.floor(elapsedDays / 7) + 1) * 100;
    $('growthGoalNext').textContent = 'Próximo marco: ' + fmt(milestoneTarget) + ' seguidores até ' + nextMilestone.toLocaleDateString('pt-BR', {timeZone:'UTC'}) + '.';
    const body = $('growthGoalRows');
    body.replaceChildren();
    sorted.forEach((item,index) => {
      const previous = sorted[index - 1];
      const days = previous ? Math.max(1, Math.floor((new Date(item.date + 'T12:00:00Z') - new Date(previous.date + 'T12:00:00Z')) / 86400000)) : 0;
      const delta = previous ? Number(item.followers) - Number(previous.followers) : 0;
      const tr = document.createElement('tr');
      [new Date(item.date + 'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC'}), fmt(item.followers), previous ? ((delta > 0 ? '+' : '') + fmt(delta)) : 'Linha de base', previous ? fmt(Math.round(delta / days * 7)) + '/sem.' : '—'].forEach(value => {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      });
      body.append(tr);
    });
    $('growthGoalMessage').textContent = sorted.length > 1 ? 'Última medição: ' + new Date(latest.date + 'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC'}) + '. A comparação considera a variação entre medições e calcula o ritmo equivalente a sete dias.' : 'Linha de base registrada. Faça uma nova medição para iniciar a comparação semanal.';
  }

  function initGoal() {
    const form = $('growthGoalForm');
    if (!form) return;
    const date = $('growthGoalDate');
    if (date && !date.value) {
      const now = new Date();
      date.value = [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const followers = Number($('growthGoalFollowers').value);
      const measurementDate = date.value;
      if (!Number.isInteger(followers) || followers < 0 || !measurementDate) return;
      if (measurementDate < GOAL_BASELINE.date) {
        $('growthGoalMessage').textContent = 'A data da medição não pode ser anterior à linha de base de 31/10/2026.';
        return;
      }
      const existing = goalEntries.findIndex(item => item.date === measurementDate);
      const record = {date:measurementDate,followers};
      if (existing >= 0) goalEntries[existing] = record; else goalEntries.push(record);
      goalEntries.sort((a,b) => a.date.localeCompare(b.date));
      try {
        localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalEntries));
        renderGoal();
        $('growthGoalMessage').textContent = 'Medição registrada neste navegador.';
        $('growthGoalFollowers').value = '';
      } catch {
        $('growthGoalMessage').textContent = 'Não foi possível salvar a medição no armazenamento local.';
      }
    });
    renderGoal();
  }

  function init() {
    const form = $('growthMetricsForm');
    if (!form) return;
    const date = $('growthMetricDate');
    if (date && !date.value) {
      const now = new Date();
      date.value = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = $('growthMetricTitle').value.trim();
      if (!title) return;
      entries.push({
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
        date: date.value, title, format: $('growthMetricFormat').value,
        reach: number('growthMetricReach'), nonFollowers: number('growthMetricNonFollowers'),
        views: number('growthMetricViews'), shares: number('growthMetricShares'),
        saves: number('growthMetricSaves'), comments: number('growthMetricComments'),
        profileVisits: number('growthMetricProfileVisits'), followers: number('growthMetricFollowers'),
        linkClicks: number('growthMetricLinkClicks')
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        form.reset();
        if (date) {
          const now = new Date();
          date.value = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
        }
        render();
        $('growthMetricsStatus').textContent = 'Resultado registrado neste navegador.';
      } catch (error) {
        $('growthMetricsStatus').textContent = 'Não foi possível salvar. O armazenamento local pode estar cheio.';
      }
    });
    $('growthMetricsExport')?.addEventListener('click', () => {
      const header = ['data','publicacao','formato','alcance','nao_seguidores','visualizacoes','compartilhamentos','salvamentos','comentarios','visitas_perfil','novos_seguidores','cliques_link'];
      const rows = entries.map(x => [x.date,x.title,x.format,x.reach,x.nonFollowers,x.views,x.shares,x.saves,x.comments,x.profileVisits,x.followers,x.linkClicks]);
      const csv = [header, ...rows].map(row => row.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(';')).join('\n');
      const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'}));
      const a = document.createElement('a'); a.href = url; a.download = 'aprovaja-insights-instagram.csv'; a.click(); URL.revokeObjectURL(url);
    });
    $('growthMetricsClear')?.addEventListener('click', () => {
      if (!window.confirm('Apagar todos os registros de desempenho salvos neste navegador?')) return;
      entries = [];
      localStorage.removeItem(STORAGE_KEY);
      render();
      $('growthMetricsStatus').textContent = 'Registros locais apagados.';
    });
    render();
    initGoal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
