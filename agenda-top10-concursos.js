/* Pauta recorrente APROVAJÁ — Top 10 concursos */
(function(){
  const pad=n=>String(n).padStart(2,"0");
  const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  function rowsForMonth(month){
    const [y,m]=month.split("-").map(Number);
    const start=new Date(y,m-1,1,12), end=new Date(y,m,0,12);
    const anchor=new Date(2026,10,3,12); // primeira publicação futura: 03/11/2026
    const rows=[];
    for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
      const day=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()))/86400000);
      if(day>=0&&day%3===0) rows.push({date:iso(d),time:"09:00"});
    }
    return rows;
  }
  function install(){
    if(typeof window.renderMonthlySchedule!=="function"||window.__top10AgendaInstalled)return false;
    const original=window.renderMonthlySchedule;
    window.renderMonthlySchedule=function(){
      original();
      const month=document.getElementById("monthFilter")?.value||iso(new Date()).slice(0,7);
      const body=document.getElementById("monthlyScheduleRows");
      if(!body)return;
      const scheduled=rowsForMonth(month);
      if(!scheduled.length)return;
      const tr=scheduled.map(x=>'<tr class="top10-recurring-agenda"><td>'+x.date.split("-").reverse().join("/")+'</td><td>'+x.time+'</td><td class="schedule-title-cell"><strong>Top 10 concursos com inscrições abertas — maiores remunerações</strong><br><small>Selecionar até 10 oportunidades válidas da listagem existente; ordenar por remuneração.</small></td><td>Instagram · Feed</td><td><span class="schedule-status Pendente">Recorrente · validação/publicação pendentes</span></td></tr>').join("");
      body.insertAdjacentHTML("beforeend",tr);
    };
    window.__top10AgendaInstalled=true;
    window.renderMonthlySchedule();
    document.getElementById("monthFilter")?.addEventListener("change",()=>window.renderMonthlySchedule());
    return true;
  }
  if(!install()){
    document.addEventListener("DOMContentLoaded",install,{once:true});
    let n=0;const retry=setInterval(()=>{if(install()||++n>40)clearInterval(retry)},250);
  }
})();