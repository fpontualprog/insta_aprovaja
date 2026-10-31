/* Agenda persistente de publicações Top 10 — Supabase */
(function(){
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let records=[];
 const statusLabel={aguardando_validacao:"Aguardando validação",pronto:"Pronto para gerar arte",publicando:"Publicando",publicado:"Publicado",sem_concursos_validos:"Sem concursos válidos",falha:"Falha"};
 function render(){
  if(typeof window.renderMonthlySchedule!=="function")return;
  const body=document.getElementById("monthlyScheduleRows");if(!body)return;
  const month=document.getElementById("monthFilter")?.value||new Date().toISOString().slice(0,7);
  const original=body.querySelectorAll(".top10-recurring-agenda");original.forEach(x=>x.remove());
  const items=records.filter(r=>String(r.agendado_para||"").slice(0,7)===month);
  for(const r of items){
   const d=new Date(r.agendado_para);
   const tr=document.createElement("tr");tr.className="top10-recurring-agenda";
   tr.innerHTML='<td>'+d.toLocaleDateString("pt-BR",{timeZone:"America/Recife"})+'</td><td>09:00</td><td><strong>'+esc(r.titulo)+'</strong><br><small>Seleção dos 10 maiores salários, com inscrições vigentes e fonte oficial</small></td><td>Instagram · Feed</td><td>'+esc(statusLabel[r.status]||r.status)+'</td>';
   body.appendChild(tr);
  }
 }
 async function refresh(){
  if(typeof supabaseClient==="undefined"||!supabaseClient)return;
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session)return;
  try{
   const {data,error}=await supabaseClient.functions.invoke("instagram-top10-agenda",{method:"GET"});
   if(error)throw error;
   if(data?.ok){records=data.agenda||[];render()}
  }catch(e){console.error("Agenda Top 10:",e);const el=document.getElementById("contestMonitorStatus");if(el)el.textContent="Agenda Top 10: "+(e.message||"falha ao consultar Supabase")}
 }
 document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("monthFilter")?.addEventListener("change",render);
  document.getElementById("prepareTop10")?.addEventListener("click",async()=>{
   const b=document.getElementById("prepareTop10");b.disabled=true;b.textContent="Validando concursos…";
   try{
    const {data,error}=await supabaseClient.functions.invoke("instagram-top10-agenda",{method:"POST",body:{}});
    if(error)throw error;
    if(!data?.ok)throw new Error(data?.error||"Não foi possível preparar a pauta");
    await refresh();
    const msg=data.quantidade?data.quantidade+" concursos válidos preparados.": "Nenhum concurso passou na validação; a publicação foi bloqueada.";
    alert(msg);
   }catch(e){alert(e.message||"Falha ao preparar Top 10")}
   finally{b.disabled=false;b.textContent="Preparar Top 10 da próxima pauta"}
  });
  const wait=()=>{if(typeof supabaseClient==="undefined"||!supabaseClient){setTimeout(wait,200);return}
   supabaseClient.auth.onAuthStateChange((event,session)=>{if(session)refresh();else{records=[];render()}});
   refresh();
  };wait();
 });
 window.addEventListener("supabase-admin-session-ready",refresh);
 window.refreshTop10Agenda=refresh;
})();