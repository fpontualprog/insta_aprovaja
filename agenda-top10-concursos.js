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
 function top10Html(list,scope="nacional",ufs=[]){
  const rows=list.map((c,i)=>'<tr><td class="rank">'+(i+1)+'</td><td class="org">'+esc(c.orgao||"Órgão não informado")+(c.uf?' ('+esc(c.uf)+')':'')+'</td><td class="salary">'+esc(moneyLabel(c.remuneracao))+'</td><td class="deadline">'+esc(dateLabel(c.inscricoes_fim))+'</td></tr>').join("");
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;font-family:Arial,sans-serif;background:#071a35;color:#fff}.canvas{width:1080px;height:1350px;padding:58px 58px 36px;background:linear-gradient(145deg,#06152d,#0c2b50)}.eyebrow{color:#ff9d24;font-size:23px;font-weight:800;letter-spacing:3px;text-transform:uppercase}.title{font-size:66px;line-height:1.02;font-weight:900;margin:18px 0 12px}.subtitle{font-size:25px;color:#dce7f5;margin-bottom:34px}.accent{color:#ff9d24}table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;color:#10213a;border-radius:18px;overflow:hidden}th{background:#f28c1b;color:#081a33;text-align:left;font-size:22px;padding:21px 16px;font-weight:900}td{padding:20px 16px;border-bottom:1px solid #e5eaf0;font-size:23px;font-weight:700}tr:last-child td{border-bottom:0}.rank{width:65px;color:#ed8211;font-size:28px;font-weight:900}.org{width:45%}.salary{white-space:nowrap;color:#0b315c;font-weight:900}.deadline{white-space:nowrap}.note{font-size:18px;color:#d3deed;margin-top:24px}</style></head><body><main class="canvas"><div class="eyebrow">APROVAJÁ CONCURSOS</div><div class="title">TOP 10 <span class="accent">CONCURSOS</span></div><div class="subtitle">'+(scope==="regional"?"Ranking regional · "+esc(ufs.join(", "))+" · ":"Ranking nacional · ")+"Inscrições abertas · Ordenados pela maior remuneração"+'</div><table><thead><tr><th>#</th><th>Órgão</th><th>Salário</th><th>Inscrições até</th></tr></thead><tbody>'+rows+'</tbody></table><div class="note">Confira o edital e os prazos de inscrição nos canais oficiais de cada órgão.</div></main></body></html>';
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
   if(!contests.length){alert("Não há concursos cadastrados com inscrições vigentes. Nenhuma publicação foi gerada ou enviada.");await refresh();return;}
   if(typeof htmlEditorialToImage!=="function"||typeof publishApprovedImage!=="function")throw new Error("O gerador de arte ou o publicador do Instagram não está disponível nesta versão do painel.");
   button.textContent="Gerando arte…";
   const post={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:"Top 10 concursos com inscrições abertas",kind:"Concursos abertos",format:"Feed",date:new Date().toISOString().slice(0,10),time:"09:00",brief:scope==="regional"?"Top 10 regional por maior remuneração — "+ufs.join(", "):"Top 10 nacional por maior remuneração",status:"Aprovada",needsApproval:false,captionBody:"Confira 10 oportunidades de concursos com inscrições vigentes, organizadas pela maior remuneração. Os valores e prazos foram extraídos dos concursos cadastrados no AprovaJá. Consulte sempre o edital oficial.\n\nPrepare-se com o APROVAJÁ Concursos! Acesse a plataforma: https://aprovajaconcurso.netlify.app/\n\nSiga @aprovaja_seuconcurso",aiHashtags:["#AprovaJá","#ConcursosPúblicos","#ConcursosAbertos","#Concurseiro"],concursosTop10:contests};
   post.caption=typeof makeCaption==="function"?makeCaption(post):post.captionBody;
   const renderedImage=await htmlEditorialToImage(top10Html(contests,scope,ufs),post);
   const imageBlob=await imageDataToJpegBlob(renderedImage);
   const objectPath='publicacoes/top10-'+Date.now()+'-'+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2))+'.jpg';
   const {error:storageError}=await supabaseClient.storage.from('instagram-publicacoes').upload(objectPath,imageBlob,{contentType:'image/jpeg',upsert:false});
   if(storageError)throw new Error('Falha ao salvar a arte no Storage: '+storageError.message);
   const {data:publicData}=supabaseClient.storage.from('instagram-publicacoes').getPublicUrl(objectPath);
   if(!publicData?.publicUrl)throw new Error('O Storage não retornou a URL pública da arte.');
   const agendaId=data.agenda?.id;
   if(!agendaId)throw new Error('A pauta foi gerada, mas não retornou o identificador para salvar a arte na agenda.');
   const {error:agendaSaveError}=await supabaseClient.from('instagram_agenda_publicacoes')
    .update({imagem_url:publicData.publicUrl,legenda:post.caption,atualizado_em:new Date().toISOString()})
    .eq('id',agendaId);
   if(agendaSaveError)throw new Error('A imagem foi enviada ao Storage, mas não foi vinculada à agenda: '+agendaSaveError.message);
   post.images=[publicData.publicUrl];
   post.top10Scope=scope;post.top10Ufs=ufs;
   posts.push(post);
   if(!save())toast('Arte salva no Storage. O navegador não conseguiu guardar uma cópia local da pauta.');
   button.textContent="Publicando no Instagram…";
   await publishApprovedImage(post.id,button,{skipConfirm:true});
   const published=posts.find(p=>p.id===post.id);
   if(published?.status==="Publicada")alert("Top 10 gerado e publicado no Instagram. ID: "+published.instagramMediaId);
   else alert("A arte foi gerada, mas a publicação não foi confirmada. Consulte o status de integração antes de tentar novamente.");
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