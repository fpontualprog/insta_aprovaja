/* Geração e publicação direta do Top 10 — Supabase + Instagram */
(function(){
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let records=[];
 const statusLabel={aguardando_validacao:"Aguardando publicação",pronto:"Pronto",publicando:"Publicando",publicado:"Publicado",sem_concursos_validos:"Sem concursos",falha:"Falha"};
 function render(){
  if(typeof window.renderMonthlySchedule!=="function")return;
  const body=document.getElementById("monthlyScheduleRows");if(!body)return;
  const month=document.getElementById("monthFilter")?.value||new Date().toISOString().slice(0,7);
  body.querySelectorAll(".top10-recurring-agenda").forEach(x=>x.remove());
  records.filter(r=>String(r.agendado_para||"").slice(0,7)===month).forEach(r=>{
   const d=new Date(r.agendado_para),tr=document.createElement("tr");tr.className="top10-recurring-agenda";
   tr.innerHTML='<td>'+d.toLocaleDateString("pt-BR",{timeZone:"America/Recife"})+'</td><td>09:00</td><td><strong>'+esc(r.titulo)+'</strong><br><small>Top 10 por remuneração — inscrições vigentes</small></td><td>Instagram · Feed</td><td>'+esc(statusLabel[r.status]||r.status)+'</td>';
   body.appendChild(tr);
  });
 }
 async function refresh(){
  if(typeof supabaseClient==="undefined"||!supabaseClient)return;
  const {data:{session}}=await supabaseClient.auth.getSession();if(!session)return;
  try{const {data,error}=await supabaseClient.functions.invoke("instagram-top10-agenda",{method:"GET"});if(error)throw error;if(data?.ok){records=data.agenda||[];render()}}
  catch(e){console.error("Agenda Top 10:",e);const el=document.getElementById("contestMonitorStatus");if(el)el.textContent="Agenda Top 10: "+(e.message||"falha ao consultar Supabase")}
 }
 function moneyValue(v){
  if(typeof v==="number")return v;
  const raw=String(v??"").replace(/[^0-9,.-]/g,"");const normalized=raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw;const n=Number(normalized);
  return Number.isFinite(n)?n:0;
 }
 function moneyLabel(v){return moneyValue(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
 function dateLabel(v){
  if(!v)return "—";const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m?m[3]+"/"+m[2]+"/"+m[1]:String(v);
 }
 function concursosHtml(list,uf,pageNo,pageTotal){
  const rows=list.map(c=>'<tr><td class="org"><strong>'+esc(c.orgao||"Órgão não informado")+'</strong>'+(c.cargo?'<small>'+esc(c.cargo)+'</small>':'')+'</td><td>'+esc(c.vagas||"—")+'</td><td class="salary">'+esc(moneyLabel(c.remuneracao))+'</td><td class="deadline">'+esc(dateLabel(c.inscricoes_fim))+'</td></tr>').join("");
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;font-family:Arial,sans-serif;background:#071a35;color:#fff}.canvas{width:1080px;height:1350px;padding:58px 58px 36px;background:linear-gradient(145deg,#06152d,#0c2b50)}.eyebrow{color:#ff9d24;font-size:23px;font-weight:800;letter-spacing:3px;text-transform:uppercase}.title{font-size:62px;line-height:1.02;font-weight:900;margin:22px 0 12px}.accent{color:#ff9d24}.subtitle{font-size:25px;color:#dce7f5;margin-bottom:34px}table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;color:#10213a;border-radius:18px;overflow:hidden}th{background:#f28c1b;color:#081a33;text-align:left;font-size:21px;padding:18px 14px;font-weight:900}td{padding:18px 14px;border-bottom:1px solid #e5eaf0;font-size:21px;font-weight:700;vertical-align:middle}tr:last-child td{border-bottom:0}.org{width:47%}.org small{display:block;font-size:16px;font-weight:500;color:#52647a;margin-top:5px}.salary{white-space:nowrap;color:#0b315c;font-weight:900}.deadline{white-space:nowrap}.note{font-size:18px;color:#d3deed;margin-top:24px}</style></head><body><main class="canvas"><div class="eyebrow">APROVAJÁ CONCURSOS</div><div class="title">CONCURSOS <span class="accent">'+esc(uf)+'</span></div><div class="subtitle">Todos os concursos detectados nesta UF · Página '+pageNo+' de '+pageTotal+'</div><table><thead><tr><th>Órgão / Cargo</th><th>Vagas</th><th>Remuneração</th><th>Inscrições até</th></tr></thead><tbody>'+rows+'</tbody></table><div class="note">Relação extraída da tabela de detecção do APROVAJÁ. Consulte o edital oficial.</div></main></body></html>';
 }
 function concursosPages(list){
  const groups=new Map();
  list.forEach(c=>{const uf=String(c.uf||"Nacional").trim().toUpperCase();if(!groups.has(uf))groups.set(uf,[]);groups.get(uf).push(c);});
  const pages=[];
  for(const [uf,items] of groups){
   const chunks=[];for(let i=0;i<items.length;i+=8)chunks.push(items.slice(i,i+8));
   chunks.forEach((chunk,i)=>pages.push({uf,html:concursosHtml(chunk,uf,i+1,chunks.length)}));
  }
  return pages;
 }
 async function generateAndPublish(button){
  if(button.disabled)return;
  button.disabled=true;const original=button.textContent;button.textContent="Buscando concursos…";
  try{
   const {data:sessionData,error:sessionError}=await supabaseClient.auth.getSession();if(sessionError)throw sessionError;
   const token=sessionData?.session?.access_token;if(!token)throw new Error("Entre novamente com a conta administradora.");
   const scope=document.getElementById("top10Scope")?.value||"nacional";
   const ufs=scope==="regional"?Array.from(document.getElementById("top10Uf")?.selectedOptions||[]).map(o=>o.value):[];
   if(scope==="regional"&&!ufs.length)throw new Error("Selecione ao menos uma UF no filtro regional.");
   const response=await fetch("https://nukddukqilhsdklocout.supabase.co/functions/v1/instagram-top10-agenda",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_PUBLISHABLE_KEY,"Authorization":"Bearer "+token},body:JSON.stringify({scope,ufs})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.ok)throw new Error(data.error||("HTTP "+response.status));
   const contests=Array.isArray(data.concursos)?data.concursos:[];
   if(!contests.length){alert("Não há concursos detectados para a(s) UF(s) selecionada(s). Nenhuma publicação foi gerada ou enviada.");await refresh();return;}
   if(typeof htmlEditorialToImage!=="function"||typeof publishApprovedImage!=="function")throw new Error("O gerador de arte ou o publicador do Instagram não está disponível nesta versão do painel.");
   button.textContent="Gerando arte…";
   const stateNames=Array.from(new Set(contests.map(c=>String(c.uf||"Nacional").trim().toUpperCase())));
   const post={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:"Concursos detectados por Estado",kind:"Concursos abertos",format:"Carrossel",date:new Date().toISOString().slice(0,10),time:"09:00",brief:"Relação completa de concursos detectados — "+stateNames.join(", "),status:"Aprovada",needsApproval:false,captionBody:"Confira a relação de todos os concursos detectados "+(scope==="regional"?"para "+stateNames.join(", "):"na base do APROVAJÁ")+". A listagem é apresentada por Estado, sem ranking ou classificação por remuneração. Consulte sempre o edital oficial.\n\nPrepare-se com o APROVAJÁ Concursos! Acesse a plataforma: https://aprovajaconcurso.netlify.app/\n\nSiga @aprovaja_seuconcurso",aiHashtags:["#AprovaJá","#ConcursosPúblicos","#ConcursosAbertos","#Oportunidades"],concursosDetectados:contests};
   post.caption=typeof makeCaption==="function"?makeCaption(post):post.captionBody;
   const pages=concursosPages(contests),imageUrls=[];
   for(let i=0;i<pages.length;i++){
    button.textContent="Gerando arte "+(i+1)+"/"+pages.length+"…";
    const renderedImage=await htmlEditorialToImage(pages[i].html,post);
    const imageBlob=await imageDataToJpegBlob(renderedImage);
    const objectPath='publicacoes/concursos-'+pages[i].uf+'-'+Date.now()+'-'+i+'.jpg';
    const {error:storageError}=await supabaseClient.storage.from('instagram-publicacoes').upload(objectPath,imageBlob,{contentType:'image/jpeg',upsert:false});
    if(storageError)throw new Error('Falha ao salvar a página '+(i+1)+' no Storage: '+storageError.message);
    const {data:publicData}=supabaseClient.storage.from('instagram-publicacoes').getPublicUrl(objectPath);
    if(!publicData?.publicUrl)throw new Error('O Storage não retornou a URL pública da página '+(i+1)+'.');
    imageUrls.push(publicData.publicUrl);
   }
   const agendaId=data.agenda?.id;
   if(!agendaId)throw new Error('A pauta foi gerada, mas não retornou o identificador para salvar as artes na agenda.');
   const {error:agendaSaveError}=await supabaseClient.from('instagram_agenda_publicacoes')
    .update({imagem_url:imageUrls[0],legenda:post.caption,atualizado_em:new Date().toISOString()})
    .eq('id',agendaId);
   if(agendaSaveError)throw new Error('As imagens foram enviadas ao Storage, mas não foram vinculadas à agenda: '+agendaSaveError.message);
   post.images=imageUrls;
   post.top10Scope=scope;post.top10Ufs=ufs;
   posts.push(post);
   if(!save())toast('Artes salvas no Storage. O navegador não conseguiu guardar uma cópia local da pauta.');
   button.textContent="Publicando no Instagram…";
   await publishApprovedImage(post.id,button,{skipConfirm:true});
   const published=posts.find(p=>p.id===post.id);
   if(published?.status==="Publicada")alert("Relação completa de concursos por Estado gerada e publicada no Instagram. ID: "+published.instagramMediaId);
   else alert("As artes foram geradas, mas a publicação não foi confirmada. Consulte o status de integração antes de tentar novamente.");
   await refresh();
  }catch(e){alert("Não foi possível gerar e publicar o Top 10: "+(e?.message||"erro inesperado"));console.error(e)}
  finally{button.disabled=false;button.textContent=original;}
 }
 document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("monthFilter")?.addEventListener("change",render);
  const scopeSelect=document.getElementById("top10Scope"),ufField=document.getElementById("top10UfField");
  const syncFilterVisibility=()=>{if(ufField)ufField.hidden=scopeSelect?.value!=="regional"};
  scopeSelect?.addEventListener("change",syncFilterVisibility);syncFilterVisibility();
  document.getElementById("prepareTop10")?.addEventListener("click",e=>generateAndPublish(e.currentTarget));
  const wait=()=>{if(typeof supabaseClient==="undefined"||!supabaseClient){setTimeout(wait,200);return}
   supabaseClient.auth.onAuthStateChange((event,session)=>{if(session)refresh();else{records=[];render()}});
   refresh();
  };wait();
 });
 window.addEventListener("supabase-admin-session-ready",refresh);
 window.refreshTop10Agenda=refresh;
})();