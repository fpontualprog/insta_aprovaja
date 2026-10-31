(() => {
  'use strict';
  const STORAGE_KEY = 'aprovaja-growth-metrics-v1';
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
