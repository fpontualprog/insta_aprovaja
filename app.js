
const KEY='insta-aprovaja-posts-v1';const $=id=>document.getElementById(id);let posts=load();let pendingAIContent=null;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(posts));render();return true}catch(e){toast('O armazenamento do navegador está cheio. Exclua publicações antigas e tente novamente.');return false}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
function formatDate(v){if(!v)return 'Data não definida';const [y,m,d]=v.split('-');return d+'/'+m+'/'+y}
function localDate(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
const PLATFORM_URL='https://aprovajaconcurso.netlify.app';
function makeCaption(p){
 const tags=Array.isArray(p.aiHashtags)&&p.aiHashtags.length?p.aiHashtags.map(t=>String(t).startsWith('#')?String(t):'#'+String(t).replace(/\\s+/g,'')).join(' '):'#AprovaJá #ConcursosPúblicos #Concurseiro #DicasDeConcurso #EstudeGrátis';
 const promo='📚 Conheça o AprovaJá: uma plataforma gratuita para organizar sua preparação para concursos. Acesse: '+PLATFORM_URL;
 const call=p.kind==='Divulgação da plataforma'?'Sua preparação pode começar hoje. Conheça as ferramentas gratuitas do AprovaJá!':p.kind==='Questão de revisão'?'Comente sua resposta antes de conferir o material. Salve para revisar!':'Salve esta dica para revisar antes da prova e compartilhe com quem também está estudando.';
 return p.title+'\n\n'+p.captionBody+'\n\n'+call+'\n\n'+promo+'\n\n'+tags;
}
function topicBody(topic,kind){
 if(kind==='Divulgação da plataforma')return 'Está se preparando para concursos? Conheça o AprovaJá, organize seus estudos e acompanhe conteúdos de revisão. A plataforma está em fase de testes e é gratuita.';
 if(kind==='Questão de revisão')return 'DESAFIO RÁPIDO\nTema: '+topic+'.\n\nPense na regra prevista na Constituição ou na lei e tente responder: qual é o conceito ou requisito central deste assunto?\n\nConfira a letra da lei ou uma questão de banca antes de publicar o gabarito.';
 return 'RESUMO RÁPIDO\nTema: '+topic+'.\n\n• Conceito: identifique a definição principal.\n• Atenção: memorize a regra central e as exceções mais cobradas.\n• Na prova: observe os termos que podem mudar o sentido da afirmação.\n\nRevise a legislação ou o material de referência aplicável.';
}
function wrapWords(text,max){const words=text.split(/\s+/),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length>max){lines.push(line);line=word}else line=(line+' '+word).trim()}if(line)lines.push(line);return lines}
function sanitizeEditorialHtml(html){
 const parsed=new DOMParser().parseFromString(String(html||""),"text/html");
 parsed.querySelectorAll("script,iframe,object,embed,form,link[rel='stylesheet'],meta[http-equiv='refresh'],base").forEach(n=>n.remove());
 parsed.querySelectorAll("*").forEach(el=>{
  [...el.attributes].forEach(attr=>{
   const name=attr.name.toLowerCase(),value=attr.value.trim();
   if(name.startsWith("on")||name==="srcdoc"||name==="formaction"||
      ((name==="href"||name==="src"||name==="xlink:href")&&/^javascript:/i.test(value))||
      (name==="style"&&/expression\s*\(|javascript\s*:/i.test(value))) el.removeAttribute(attr.name);
  });
 });
 return parsed;
}
let html2canvasLoader;
function loadHtml2Canvas(){
 if(window.html2canvas)return Promise.resolve(window.html2canvas);
 if(!html2canvasLoader)html2canvasLoader=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
  script.onload=()=>window.html2canvas?resolve(window.html2canvas):reject(new Error("O renderizador de imagem não carregou."));
  script.onerror=()=>reject(new Error("Não foi possível carregar o renderizador de imagem."));
  document.head.appendChild(script);
 });
 return html2canvasLoader;
}
const APROVAJA_LOGO_DATA_URL="data:image/webp;base64,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";
function htmlEditorialToImage(html,post){
 const render=await loadHtml2Canvas();
 const parsed=sanitizeEditorialHtml(html);
 const frame=document.createElement("iframe");
 frame.setAttribute("aria-hidden","true");
 frame.tabIndex=-1;
 frame.style.cssText="position:fixed;left:-12000px;top:0;width:1080px;height:1350px;border:0;visibility:hidden";
 document.body.appendChild(frame);
 try{
  const doc=frame.contentDocument;
  const sourceDoc=parsed.documentElement;
  doc.open();
  if(sourceDoc.querySelector("body")){
   doc.write("<!doctype html>"+sourceDoc.outerHTML);
  }else{
   doc.write("<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body>"+parsed.body.innerHTML+"</body></html>");
  }
  doc.close();
  if(!doc.querySelector("meta[name='viewport']")){
   const viewport=doc.createElement("meta");viewport.name="viewport";viewport.content="width=1080,initial-scale=1";doc.head.appendChild(viewport);
  }
  doc.documentElement.style.width="1080px";
  doc.body.style.width="1080px";
  const brandFooter=doc.createElement("div");
  brandFooter.setAttribute("data-aprovaja-brand-footer","true");
  brandFooter.style.cssText="box-sizing:border-box;width:1080px;min-height:142px;padding:16px 34px;background:#05070b;color:#fff;display:flex;align-items:center;justify-content:center;gap:22px;font-family:Arial,sans-serif;text-align:left;";
  const logoImage=doc.createElement("img");
  logoImage.src=APROVAJA_LOGO_DATA_URL;
  logoImage.alt="Logo oficial AprovaJá";
  logoImage.style.cssText="display:block;width:100px;height:100px;object-fit:contain;flex:0 0 100px;";
  const brandCopy=doc.createElement("div");
  brandCopy.style.cssText="display:flex;flex-direction:column;gap:7px;max-width:780px;";
  const brandName=doc.createElement("div");
  brandName.textContent="AprovaJá";
  brandName.style.cssText="font-size:32px;line-height:1.05;font-weight:800;letter-spacing:-.5px;color:#fff;";
  const brandTagline=doc.createElement("div");
  brandTagline.textContent="Prepare-se para concursos com a AprovaJá — plataforma gratuita.";
  brandTagline.style.cssText="font-size:20px;line-height:1.25;font-weight:600;color:#f2f5fb;";
  brandCopy.append(brandName,brandTagline);
  brandFooter.append(logoImage,brandCopy);
  doc.body.appendChild(brandFooter);
  await new Promise(resolve=>{if(logoImage.complete)resolve();else{logoImage.onload=resolve;logoImage.onerror=resolve;}});
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const width=1080;
  const height=Math.ceil(Math.max(doc.body.scrollHeight,doc.documentElement.scrollHeight));
  if(!height||height>1350)throw new Error("A arte com o rodapé oficial da AprovaJá excedeu 1080 × 1350 px. Gere novamente com conteúdo principal mais compacto, deixando espaço para a marca no final.");
  const canvas=await render(doc.documentElement,{width,height,scale:1,backgroundColor:null,windowWidth:width,windowHeight:height,scrollX:0,scrollY:0,useCORS:false,allowTaint:false});
  if(canvas.width!==width||canvas.height!==height)throw new Error("A renderização alterou as dimensões da arte. Gere novamente.");
  return canvas.toDataURL("image/png");
 }finally{frame.remove();}
}

function makePost(topic,kind,date,time,format='Carrossel'){const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:topic.trim(),kind,format,date,time,brief:'Conteúdo educativo para candidatos a concursos públicos. Identidade visual azul-marinho, branco e laranja.',status:'Pendente'};p.captionBody=topicBody(p.title,kind);p.caption=makeCaption(p);p.images=[];return p}
function renderPublishedHistory(){
 const host=$('publishedHistory');
 if(!host)return;
 const published=posts.filter(p=>p.status==='Publicada').sort((a,b)=>(b.publishedAt||((b.date||'')+'T'+(b.time||'00:00'))).localeCompare(a.publishedAt||((a.date||'')+'T'+(a.time||'00:00'))));
 const rows=published.map(p=>{
  const actual=p.publishedAt?new Date(p.publishedAt):null;
  const date=actual&&!Number.isNaN(actual.getTime())?formatDate(localDate(actual)):formatDate(p.date);
  const time=actual&&!Number.isNaN(actual.getTime())?[String(actual.getHours()).padStart(2,'0'),String(actual.getMinutes()).padStart(2,'0')].join(':'):(p.time||'—');
  const code=p.instagramMediaId||p.id||'—';
  return '<tr><td>'+esc(date)+'</td><td>'+esc(time)+'</td><td>'+esc(p.kind||'Não informado')+'</td><td><code title="'+esc(code)+'">'+esc(code)+'</code></td></tr>';
 }).join('');
 host.innerHTML='<div class="table-wrap"><table class="published-table"><thead><tr><th>Data</th><th>Horário</th><th>Tipo</th><th>Código</th></tr></thead><tbody>'+(rows||'<tr><td colspan="4">Nenhuma publicação marcada como publicada neste navegador.</td></tr>')+'</tbody></table></div><p class="hint history-note">'+(published.length?'Total: '+published.length+' publicação(ões).':'O histórico atual é local ao navegador. Publicações feitas em outro computador ou em outra versão do site não aparecem aqui automaticamente.')+'</p>';
}

function render(){const filter=$('filter').value;const monthFilter=$('monthFilter')?.value||localDate(new Date()).slice(0,7);const list=posts.filter(p=>(!p.date||p.date.slice(0,7)===monthFilter)&&(filter==='all'||filter==='Pendente'?(filter==='all'||p.status==='Pendente'||p.needsApproval):p.status===filter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$('count').textContent=posts.length;$('pendingCount').textContent=posts.filter(p=>p.status==='Pendente'||p.needsApproval).length;$('approvedCount').textContent=posts.filter(p=>p.status==='Aprovada'&&!p.needsApproval).length;$('publishedCount').textContent=posts.filter(p=>p.status==='Publicada').length;renderPublishedHistory();const host=$('posts');if(!list.length){host.className='posts-empty';host.innerHTML='<div class="empty-icon">✦</div><strong>Agenda vazia</strong><p>Gere as pautas para montar o calendário mensal.</p>';return}host.className='';host.classList.toggle('posts-grid',filter==='Aprovada');host.innerHTML=list.map(p=>{const needsApproval=!!p.needsApproval||p.status==='Pendente';return '<article class="post-card layout-'+esc((p.kind||'dica').toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'"><div class="post-top"><div><h3>'+esc(p.title)+'</h3><div class="meta">'+(p.status==='Aprovada'?'<strong>Data:</strong> ':'')+esc(formatDate(p.date))+(p.status==='Aprovada'?'<br><strong>Horário:</strong> ':' às ')+esc(p.time)+(p.status==='Aprovada'?'<br><strong>Tipo:</strong> ':' · ')+esc(p.kind)+' · '+esc(p.format||'Feed')+'</div></div><span class="status '+esc(p.status)+'">'+esc(needsApproval?'Aguardando aprovação':p.status==='Aprovada'?'Na fila de publicação':p.status)+'</span></div><p class="post-caption">'+esc(needsApproval?'Prévia da pauta. Aprove para gerar o texto, a legenda e as artes.':p.caption||'')+'</p>'+(p.images&&p.images.length?'<div class="post-images">'+p.images.map((src,i)=>'<a href="'+src+'" download="aprovaja-arte-'+(i+1)+'.png" target="_blank" rel="noopener"><img src="'+src+'" alt="Arte '+(i+1)+' do carrossel"><span>Baixar arte '+(i+1)+'</span></a>').join('')+'</div>':'')+'<div class="post-actions">'+(needsApproval?'<button class="small-btn" data-action="edit" data-id="'+p.id+'">Alterar</button><button class="small-btn approve-btn" data-action="approve" data-id="'+p.id+'">Aprovar e gerar conteúdo</button><button class="small-btn" data-action="reject" data-id="'+p.id+'">Reprovar</button>':'<button class="small-btn" data-action="copy" data-id="'+p.id+'">Copiar legenda</button>')+(p.status==='Aprovada'&&!needsApproval?'<button class="small-btn publish-btn" data-publish-id="'+p.id+'">Publicar agora</button><button class="small-btn" data-action="published" data-id="'+p.id+'">Marcar publicada</button>':'')+'<button class="small-btn" data-action="delete" data-id="'+p.id+'">Excluir</button></div></article>'}).join('')}function setDefaultDate(){const d=new Date();d.setDate(d.getDate()+((2-d.getDay()+7)%7||7));$('date').value=localDate(d);$('bulkStart').value=localDate(d)}
const RANDOM_EDITORIAL_KINDS=['Dica de prova','Questão comentada','Mapa mental','Planejamento de estudos','Divulgação da plataforma','Motivação e disciplina'];
function randomItem(items){return items[Math.floor(Math.random()*items.length)]}

const pasteTopicsBtn=document.getElementById('pasteTopicsBtn');
const clearTopicsBtn=document.getElementById('clearTopicsBtn');
if(pasteTopicsBtn){
 pasteTopicsBtn.addEventListener('click',async()=>{
  const box=document.getElementById('bulkTopics');
  const status=document.getElementById('pasteStatus');
  try{
   if(!navigator.clipboard||!navigator.clipboard.readText) throw new Error('clipboard indisponível');
   const clip=await navigator.clipboard.readText();
   if(!clip.trim()){status.textContent='A área de transferência está vazia. Copie os temas primeiro e tente novamente.';return;}
   box.value=box.value.trim()?box.value.trimEnd()+'\n'+clip.trim():clip.trim();
   box.focus();
   status.textContent='Texto colado no campo. Confira os temas e clique em “Gerar todas as pautas”.';
   toast('Temas importados da área de transferência.');
  }catch(err){
   status.textContent='O navegador bloqueou o acesso à área de transferência. Clique no campo, use Ctrl + V ou clique com o botão direito e escolha Colar. Se continuar, permita o acesso à área de transferência nas permissões do site.';
   box.focus();
  }
 });
}
if(clearTopicsBtn){
 clearTopicsBtn.addEventListener('click',()=>{
  document.getElementById('bulkTopics').value='';
  document.getElementById('bulkTopics').focus();
  const status=document.getElementById('pasteStatus');
  if(status)status.textContent='Campo de temas limpo.';
 });
}

function editorialForDate(d){switch(d.getDay()){case 2:return 'Questão comentada';case 4:return randomItem(['Dica de prova','Mapa mental']);case 6:return 'Concursos abertos';case 0:return randomItem(['Planejamento de estudos','Divulgação da plataforma']);default:return null}}
function nextEditorialDate(d){const x=new Date(d);while(!editorialForDate(x))x.setDate(x.getDate()+1);return x}
function editorialForDate(d){switch(d.getDay()){case 2:return 'Questão comentada';case 4:return randomItem(['Dica de prova','Mapa mental']);case 6:return 'Concursos abertos';case 0:return randomItem(['Planejamento de estudos','Divulgação da plataforma']);default:return null}}
function nextEditorialDate(d){const x=new Date(d);while(!editorialForDate(x))x.setDate(x.getDate()+1);return x}
$('generateBatch').addEventListener('click',async()=>{
 const topics=$('bulkTopics').value.split(/\n|;/).map(x=>x.trim()).filter(Boolean);
 if(!topics.length){toast('Insira os temas antes de gerar a agenda.');return}
 if(topics.length>10){toast('Para usar IA em lote, gere no máximo 10 temas por vez.');return}
 if(!supabaseConnected||!supabaseClient){toast('O painel ainda não está conectado ao Supabase.');integrationStatus('Aguarde a conexão com o Supabase antes de gerar conteúdo.',true);return;}
 const startValue=$('bulkStart').value||localDate(new Date());
 $('monthFilter').value=startValue.slice(0,7);
 const startDate=new Date(startValue+'T12:00:00');
 const month=startDate.getMonth(),year=startDate.getFullYear();
 let cursor=nextEditorialDate(startDate);
 const slots=[];
 while(cursor.getMonth()===month&&cursor.getFullYear()===year){
   slots.push(new Date(cursor));
   cursor.setDate(cursor.getDate()+1);
   cursor=nextEditorialDate(cursor);
 }
 if(!slots.length){toast('Não há datas editoriais restantes neste mês. Escolha o próximo mês.');return}
 if(topics.length>slots.length){toast('Há '+topics.length+' temas, mas só '+slots.length+' datas editoriais disponíveis neste mês. Reduza os temas ou escolha outro mês.');return}
 const button=$('generateBatch');
 const original=button.textContent;
 button.disabled=true;
 const newPosts=[];
 try{
  for(let i=0;i<topics.length;i++){
   button.textContent='IA gerando '+(i+1)+'/'+topics.length+'…';
   const topic=topics[i],d=slots[i],kind=editorialForDate(d);
   const time=kind==='Questão comentada'?'12:15':kind==='Dica de prova'||kind==='Mapa mental'?'19:30':kind==='Concursos abertos'?'10:00':'18:30';
   const {data:sessionData,error:sessionError}=await supabaseClient.auth.getSession();
   if(sessionError)throw sessionError;
   const token=sessionData?.session?.access_token;
   if(!token)throw new Error('Sua sessão expirou. Entre novamente.');
   const response=await fetch(SUPABASE_URL+'/functions/v1/generate-instagram-content',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization': token ? 'Bearer '+token : 'Bearer '+SUPABASE_PUBLISHABLE_KEY,'apikey':SUPABASE_PUBLISHABLE_KEY},
    body:JSON.stringify({topic,kind,discipline:'Concursos públicos',brief:'Crie conteúdo educativo conciso e correto para Instagram sobre esta matéria. Tipo de publicação: '+kind+'.'})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error('Falha de IA no tema "'+topic+'": '+(data.error||'HTTP '+response.status));
   const ai=data.content||{};
   if(!String(ai.captionBody||'').trim())throw new Error('A IA retornou conteúdo vazio para: '+topic);
   const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:String(ai.title||topic),kind,format:'Feed',date:localDate(d),time,brief:'Gerado com IA a partir da pauta: '+topic,status:'Pendente',needsApproval:false,captionBody:String(ai.captionBody).trim(),aiHashtags:Array.isArray(ai.hashtags)?ai.hashtags:[],imageText:String(ai.imageText||'')};
   p.keyPoints=Array.isArray(ai.keyPoints)?ai.keyPoints:[];p.mindMap=ai.mindMap&&typeof ai.mindMap==='object'?ai.mindMap:null;p.discipline='Concursos públicos';p.imageText=String(ai.imageText||'');p.caption=makeCaption(p);if(!String(ai.html||'').trim())throw new Error('A IA não retornou HTML para a arte: '+topic);p.images=[await htmlEditorialToImage(ai.html,p)];p.generatedHtml=String(ai.html);newPosts.push(p);
  }
  posts.push(...newPosts);
  if(!save()){posts.splice(-newPosts.length,newPosts.length);throw new Error('Não foi possível salvar as publicações no navegador.');}
  toast(newPosts.length+' publicação(ões) gerada(s) com IA e salva(s) na agenda.');
  $('bulkTopics').value='';
  $('generatedPreview').innerHTML='<p class="hint">Publicações geradas pelo DeepSeek e adicionadas à agenda. Revise cada conteúdo antes de aprovar e publicar.</p>';
  $('posts').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){
  hostMessage=error?.message||'Não foi possível gerar o lote com IA.';
  toast(hostMessage);
  $('pasteStatus').textContent=hostMessage;
  if(newPosts.length){posts.push(...newPosts);save();}
 }finally{button.disabled=false;button.textContent=original;}
});
$('posts').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const p=posts.find(x=>x.id===b.dataset.id);if(!p)return;switch(b.dataset.action){case'edit':{const title=prompt('Edite o tema da publicação:',p.title);if(title===null)return;if(!title.trim()){toast('O tema não pode ficar vazio.');return}p.title=title.trim();if(save())toast('Tema atualizado.');break}case'approve':if(p.needsApproval||p.status==='Pendente'){if(!p.images||!p.images.length){toast('Esta publicação ainda não tem arte HTML do DeepSeek. Gere novamente o conteúdo com IA antes de aprovar.');break;}p.caption=makeCaption(p);p.needsApproval=false;p.status='Aprovada';if(save())toast('Aprovada e adicionada à fila de publicação com a arte HTML preservada.')}break;case'reject':posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação reprovada e retirada da agenda.');break;case'published':p.status='Publicada';if(save())toast('Status atualizado.');break;case'delete':if(confirm('Excluir esta publicação e suas artes?')){posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação excluída.')}break;case'copy':copyCaption(p);break}});

const CONTESTS_URL='https://raw.githubusercontent.com/fpontualprog/aprovaja/main/data/concursos_elegiveis.json';
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const contestGeneratorButton=$('generateContests');
if(contestGeneratorButton)contestGeneratorButton.addEventListener('click',()=>{const status=$('contestStatus');if(status)status.textContent='A geração de artes para concursos será reativada quando este fluxo usar HTML gerado pelo DeepSeek. Nenhuma arte predefinida será criada.';toast('Este fluxo ainda precisa ser integrado ao HTML do DeepSeek.');});
$('filter').addEventListener('change',render);$('monthFilter').addEventListener('change',render);setDefaultDate();$('monthFilter').value=localDate(new Date()).slice(0,7);render();


// --- Integração segura com Supabase Auth, Storage e Instagram ---
const SUPABASE_URL = 'https://nukddukqilhsdklocout.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vPQVdnjlEY9g0vZKjeb58A_OIhkIiqH';
const INSTAGRAM_PUBLISH_URL = SUPABASE_URL + '/functions/v1/instagram-publish';
let supabaseClient = null;
let currentSession = null;
let supabaseConnected = false;
let publishBusy = false;

function integrationStatus(message, isError=false) {
  const el = document.getElementById('instagramStatus');
  if (!el) return;
  el.dataset.connection = isError ? 'error' : (supabaseConnected ? 'connected' : 'disconnected');
  el.textContent = (isError ? '● ERRO — ' : (supabaseConnected ? '● SUPABASE CONECTADO — ' : '○ CONECTANDO — ')) + message;
  el.classList.toggle('integration-error', !!isError);
  const panel = document.getElementById('instagramIntegration');
  if (panel) panel.classList.toggle('is-connected', supabaseConnected && !isError);
}
async function initializeSupabaseConnection() {
  try {
    if (!window.supabase?.createClient) throw new Error('A biblioteca Supabase não carregou. Atualize a página.');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    // A conexão é validada por uma chamada leve de saúde do Auth, sem exigir login.
    const response = await fetch(SUPABASE_URL + '/auth/v1/health', {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('O Supabase respondeu HTTP ' + response.status + '.');
    supabaseConnected = true;
    integrationStatus('Conexão com o Supabase estabelecida.');
  } catch (error) {
    supabaseConnected = false;
    integrationStatus(error?.message || 'Não foi possível conectar ao Supabase.', true);
  }
}
function imageDataToJpegBlob(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Preserve as dimensões e a proporção originais; não esticar nem recortar a arte.
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        if (!width || !height) throw new Error('A imagem gerada não possui dimensões válidas.');
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) throw new Error('O navegador não disponibilizou o canvas.');
        // JPEG não suporta transparência; o fundo branco só aparece nas áreas transparentes.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível converter a arte para JPEG.')), 'image/jpeg', 1.0);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem gerada pelo HTML para conversão.'));
    img.src = dataUrl;
  });
}
async function signInInstagramAdmin(event) {
  event.preventDefault();
  const email = document.getElementById('instagramEmail').value.trim();
  const password = document.getElementById('instagramPassword').value;
  const button = document.getElementById('instagramLoginButton');
  button.disabled = true;
  integrationStatus('Validando a sessão do administrador…');
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentSession = data.session;
    document.getElementById('instagramPassword').value = '';
    updateAuthUI();
    integrationStatus('Sessão iniciada. A função do servidor ainda verificará se esta conta é o administrador autorizado.');
    toast('Sessão Supabase iniciada.');
  } catch (error) {
    currentSession = null;
    updateAuthUI();
    integrationStatus('Não foi possível entrar: ' + (error?.message || 'verifique as credenciais e se o usuário existe no Supabase Auth.'), true);
  } finally { button.disabled = false; }
}
async function signOutInstagramAdmin() {
  try {
    await supabaseClient.auth.signOut();
  } finally {
    currentSession = null;
    updateAuthUI();
    integrationStatus('Sessão encerrada. Entre novamente para publicar.');
  }
}
async function publishApprovedImage(postId, button) {
  if (publishBusy) return;
  const post = posts.find(item => item.id === postId);
  if (!post || post.status !== 'Aprovada' || post.needsApproval) {
    integrationStatus('Aprove a publicação antes de enviá-la.', true); return;
  }
  if (!currentSession) {
    integrationStatus('Entre com a conta administradora do Supabase antes de publicar.', true); return;
  }
  if (!Array.isArray(post.images) || !post.images.length) {
    integrationStatus('Esta publicação não contém artes para enviar.', true); return;
  }
  if (post.images.length > 10) {
    integrationStatus('O Instagram permite até 10 imagens por carrossel. Reduza o número de artes.', true); return;
  }
  if (!confirm('Publicar AGORA no Instagram?\n\n' + post.title + '\n' + post.images.length + (post.images.length === 1 ? ' imagem' : ' imagens') + '\n\nA data e o horário planejados não serão considerados.')) return;
  publishBusy = true;
  button.disabled = true;
  const originalLabel = button.textContent;
  button.textContent = 'Publicando agora…';
  try {
    const { data: refreshed, error: refreshError } = await supabaseClient.auth.getSession();
    if (refreshError) throw refreshError;
    currentSession = refreshed.session;
    if (!currentSession?.access_token) throw new Error('A sessão expirou. Entre novamente.');
    const imageUrls = [];
    for (let i = 0; i < post.images.length; i++) {
      integrationStatus('Preparando imagem ' + (i + 1) + ' de ' + post.images.length + '…');
      const jpegBlob = await imageDataToJpegBlob(post.images[i]);
      const objectPath = 'publicacoes/' + Date.now() + '-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) + '-' + (i + 1) + '.jpg';
      const { error: uploadError } = await supabaseClient.storage
        .from('instagram-publicacoes')
        .upload(objectPath, jpegBlob, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw new Error('Falha ao enviar a imagem ' + (i + 1) + ' ao Storage: ' + uploadError.message);
      const { data: publicData } = supabaseClient.storage.from('instagram-publicacoes').getPublicUrl(objectPath);
      if (!publicData?.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem ' + (i + 1) + '.');
      imageUrls.push(publicData.publicUrl);
    }
    integrationStatus('Enviando solicitação de publicação imediata ao Instagram…');
    const response = await fetch(INSTAGRAM_PUBLISH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Authorization': 'Bearer ' + currentSession.access_token
      },
      body: JSON.stringify({ image_urls: imageUrls, caption: post.caption || makeCaption(post) })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      const detail = result.error || result.message || ('HTTP ' + response.status);
      throw new Error(detail + (result.stage ? ' (etapa: ' + result.stage + ')' : ''));
    }
    post.status = 'Publicada';
    post.instagramMediaId = result.media_id;
    post.publishedAt = new Date().toISOString();
    if (save()) {
      integrationStatus('Instagram confirmou a publicação imediata de ' + imageUrls.length + (imageUrls.length === 1 ? ' imagem' : ' imagens') + ' em @' + (result.instagram_username || 'aprovaja_seuconcurso') + '.');
      toast('Instagram confirmou a publicação.');
    }
  } catch (error) {
    integrationStatus('Não foi possível confirmar a publicação: ' + (error?.message || 'erro inesperado') + '. Confira o Instagram antes de tentar novamente para evitar duplicidade.', true);
  } finally {
    publishBusy = false;
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  initializeSupabaseConnection();
});
 
// Listener delegado registrado imediatamente: também funciona para cards criados dinamicamente.
document.getElementById('posts')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-publish-id]');
  if (!button) return;
  event.preventDefault();
  publishApprovedImage(button.dataset.publishId, button);
});



// Gerador pedagógico gratuito: roda no navegador, sem API paga e sem enviar dados para terceiros.
function localEducationalContent(topic, kind, brief) {
 const t=topic.trim(), extra=brief.trim();
 const lower=t.toLocaleLowerCase('pt-BR');
 const mapTopics=[
  {keys:['constitucional','controle de constitucionalidade'],central:'Controle de constitucionalidade',branches:[['Modelos',['Difuso: caso concreto','Concentrado: ação própria','Preventivo e repressivo']],['Parâmetros',['Constituição como referência','Bloco de constitucionalidade quando aplicável']],['Controle difuso',['Qualquer juiz ou tribunal','Respeito à reserva de plenário','Efeitos em regra inter partes']],['Controle concentrado',['Competência definida pela Constituição','Legitimados específicos','Efeitos conforme ação e decisão']],['Atenção na prova',['Legitimidade ativa varia por ação','Não confundir efeitos e competência']]]},
  {keys:['ordem social'],central:'Ordem social — CF/88',branches:[['Fundamento',['Primado do trabalho','Bem-estar e justiça sociais']],['Seguridade social',['Saúde','Previdência social','Assistência social']],['Educação e cultura',['Direito à educação','Proteção cultural']],['Meio ambiente',['Direito ao ambiente equilibrado','Dever do poder público e da coletividade']],['Família e grupos',['Família, criança e adolescente','Pessoa idosa e povos indígenas']],['Prova',['Localizar o tema na Constituição','Diferenciar saúde, previdência e assistência']]]},
  {keys:['administração pública','princípios'],central:'Princípios da Administração Pública',branches:[['LIMPE',['Legalidade','Impessoalidade','Moralidade','Publicidade','Eficiência']],['Legalidade',['Atuação conforme o ordenamento','Competência e finalidade']],['Impessoalidade',['Finalidade pública','Vedação à promoção pessoal']],['Moralidade e publicidade',['Ética e probidade','Transparência com exceções legais']],['Eficiência',['Qualidade e resultados','Uso responsável dos recursos']],['Prova',['Princípios expressos no art. 37, caput','Há também princípios reconhecidos pela doutrina']]]},
  {keys:['ato administrativo','atos administrativos'],central:'Atos administrativos',branches:[['Elementos',['Competência','Finalidade','Forma','Motivo','Objeto']],['Atributos',['Presunção de legitimidade','Imperatividade quando cabível','Autoexecutoriedade em hipóteses admitidas','Tipicidade']],['Anulação',['Ilegalidade','Controle administrativo ou judicial']],['Revogação',['Conveniência e oportunidade','Ato válido e limites jurídicos']],['Convalidação',['Defeitos sanáveis','Respeito aos requisitos legais']],['Pegadinhas',['Anulação não é revogação','Nem todo ato tem todos os atributos']]]},
  {keys:['orçamento','afo','financeira'],central:'AFO — ciclo orçamentário',branches:[['Planejamento',['PPA: diretrizes, objetivos e metas','LDO: prioridades e orientação','LOA: estima receita e fixa despesa']],['Princípios',['Unidade e universalidade','Anualidade','Exclusividade com exceções constitucionais']],['Execução',['Empenho','Liquidação','Pagamento']],['Controle',['Controle interno e externo','Fiscalização contábil, financeira e orçamentária']],['Responsabilidade fiscal',['Planejamento e transparência','Metas e limites legais']],['Prova',['Distinguir PPA, LDO e LOA','Observar a ordem dos estágios da despesa']]]},
  {keys:['contabilidade pública','despesa pública'],central:'Despesa pública',branches:[['Estágios',['Empenho','Liquidação','Pagamento']],['Empenho',['Reserva dotação','Cria obrigação de pagamento pendente ou não de condição']],['Liquidação',['Verifica direito do credor','Confere origem e objeto']],['Pagamento',['Após regular liquidação','Ordem de pagamento pela autoridade competente']],['Créditos',['Orçamentários e adicionais','Observar autorização e finalidade']],['Prova',['Não inverter liquidação e pagamento','Distinguir restos a pagar processados e não processados']]]},
  {keys:['português','funções da linguagem'],central:'Funções da linguagem',branches:[['Referencial',['Foco no contexto e na informação','Linguagem objetiva']],['Emotiva',['Foco no emissor','Marcas de subjetividade']],['Conativa',['Foco no receptor','Imperativo e apelo']],['Fática',['Canal de comunicação','Testa ou mantém contato']],['Metalinguística',['Código explica o próprio código','Definições e explicações linguísticas']],['Poética',['Forma da mensagem em destaque','Ritmo, figuras e escolhas expressivas']]]},
  {keys:['conjunto','matemática','raciocínio lógico'],central:'Raciocínio lógico — método de resolução',branches:[['Compreensão',['Identifique dados e restrições','Traduza o enunciado']],['Estratégia',['Liste casos possíveis','Use tabela ou diagrama']],['Cálculo',['Execute operações passo a passo','Confira unidades e sinais']],['Verificação',['Teste o resultado no enunciado','Elimine contradições']],['Prova',['Atenção a “todo”, “algum” e “nenhum”','Diferencie condição necessária e suficiente']]]}
 ];
 let found=mapTopics.find(m=>m.keys.some(k=>lower.includes(k)));
 let branches=found?found.branches:[
  ['Conceito',['Definição e finalidade de '+t,'Fundamento teórico ou normativo']],['Elementos principais',['Regras centrais do assunto','Classificações e características']],['Requisitos e aplicação',['Quando se aplica','Quem é competente e quais são os limites']],['Exceções e limites',['Exceções relevantes','Condições que alteram a regra']],['Como cai na prova',['Compare conceitos próximos','Treine questões da banca']],['Revisão',['Explique sem consultar o material','Registre erros e revise depois']]
 ];
 const central=found?found.central:t;
 let body='';
 if(kind==='Mapa mental'){
  body='MAPA MENTAL: '+central+'\n\n'+branches.map((b,i)=>(i+1)+'. '+b[0]+'\n'+b[1].map(x=>'   • '+x).join('\n')).join('\n\n')+'\n\nNota: mapa-base para estudo; confira legislação, doutrina e edital aplicáveis.';
 } else if(kind==='Questão comentada'){
  body='QUESTÃO-MODELO DE REVISÃO\nTema: '+t+'\n\nEnunciado: assinale a alternativa que melhor representa uma conduta adequada ao estudar '+t+'.\n\nA) Aplicar a regra sem verificar requisitos ou exceções.\nB) Distinguir conceito, fundamento, requisitos e exceções antes de concluir.\nC) Considerar todos os conceitos próximos como sinônimos.\nD) Ignorar a fonte normativa ou bibliográfica.\n\nGabarito: B.\nComentário: a análise de um tema jurídico ou técnico exige identificar a regra aplicável e seus limites. As alternativas A, C e D propõem generalizações ou omitem etapas essenciais. Esta é uma questão didática genérica, não uma questão oficial de banca.\n\nPonto de revisão: '+t+'.';
 } else if(kind==='Planejamento de estudos'){
  body='ROTEIRO DE ESTUDO — '+t+'\n\n1. Teoria (25 min): leia o conceito, os fundamentos e a terminologia.\n2. Organização (15 min): transforme o conteúdo em tópicos ou mapa mental.\n3. Questões (20 min): resolva itens da banca do seu concurso.\n4. Caderno de erros (10 min): explique por que errou e registre a regra correta.\n5. Revisão espaçada: retome em 24 horas, 7 dias e 30 dias.\n\nMeta: compreender e aplicar, não apenas reler.';
 } else if(kind==='Divulgação da plataforma'){
  body='A sua preparação pode ser mais organizada. Na AprovaJá, reúna seus temas, planeje a rotina e transforme cada sessão de estudo em um próximo passo.\n\nAcesse gratuitamente: '+PLATFORM_URL+'\n\nEscolha uma meta realista para hoje e acompanhe sua evolução.';
 } else if(kind==='Motivação e disciplina'){
  body='ESTUDO POSSÍVEL, PROGRESSO REAL\n\nEscolha uma parte concreta de '+t+'. Estude por 25 minutos, anote uma dúvida e resolva algumas questões. Ao terminar, registre o que aprendeu e qual será o próximo passo.\n\nA constância nasce de metas claras e sustentáveis, não da obrigação de fazer tudo de uma vez.';
 } else if(kind==='Concursos abertos'){
  body='PAUTA: '+t+'\n\nAntes de divulgar esta oportunidade, confirme no site oficial do órgão e no edital: situação do concurso, período de inscrição, cargos, vagas, remuneração, banca, requisitos e link oficial.\n\nNão publique datas, quantitativos ou salários sem fonte verificável. Este texto é um checklist editorial, não uma notícia confirmada.';
 } else {
  body='RESUMO PARA CONCURSOS — '+t+'\n\n1. CONCEITO\nIdentifique a definição do tema e sua finalidade. Registre os termos técnicos que diferenciam esse assunto de outros semelhantes.\n\n2. REGRAS CENTRAIS\nOrganize as regras em ordem lógica. Para cada uma, identifique requisitos, efeitos e quem tem competência para aplicá-la.\n\n3. EXCEÇÕES E LIMITES\nVerifique exceções, prazos, condições e situações em que a regra geral não se aplica. São pontos que costumam exigir atenção em questões objetivas.\n\n4. COMO REVISAR\nExplique o assunto com suas próprias palavras, compare conceitos próximos e resolva questões da banca do seu concurso.\n\n5. CONFERÊNCIA\nValide conceitos e referências na legislação, bibliografia ou fonte oficial aplicável. Este roteiro é uma base de estudo, não substitui a conferência da fonte.';
 }
 if(extra) body+='\n\nORIENTAÇÃO ADICIONAL\n'+extra;
 const flashcards=[
  {question:'Qual é o conceito central de '+t+'?',answer:'Defina o tema com base no material oficial ou bibliografia indicada.'},
  {question:'Quais são os principais elementos de '+t+'?',answer:branches.slice(0,3).map(b=>b[0]).join('; ')+'.'},
  {question:'Qual exceção ou limite merece atenção em '+t+'?',answer:'Confira as exceções expressas na norma, no edital ou na referência utilizada.'},
  {question:'Como revisar '+t+' para concurso?',answer:'Recupere o conteúdo sem consulta, resolva questões e registre os erros.'}
 ];
 return {title:t,captionBody:body,imageText:branches.slice(0,3).map(b=>b[0]).join(' • '),storyText:'Revise '+t+': identifique a regra, os limites e as exceções.',mindMap:{central,branches:branches.map(b=>({label:b[0],children:b[1]}))},flashcards,hashtags:['AprovaJa','ConcursosPublicos','EstudosParaConcursos','Revisao']};
}
$('postForm')?.addEventListener('submit', async e=>{
 e.preventDefault();
 const topic=$('title').value.trim();
 const kind=$('kind').value;
 const brief=$('brief').value.trim();
 const date=$('date').value;
 if(!topic||!brief||!date){toast('Preencha Matéria, Síntese do Conteúdo e Data de publicação.');return;}
 if(!currentSession?.access_token||!supabaseClient){toast('Entre com a conta administradora para gerar conteúdo com IA.');integrationStatus('Entre com a conta administradora para usar o DeepSeek.',true);return;}
 const button=$('generateAI'),host=$('generatedPreview');
 const discipline=$('aiDiscipline')?.value.trim()||'Concursos públicos';
 button.disabled=true;button.textContent='Gerando com IA…';
 host.innerHTML='<p class="hint">Consultando o DeepSeek com segurança. Aguarde…</p>';
 try{
   const {data:sessionData,error:sessionError}=await supabaseClient.auth.getSession();
   if(sessionError)throw sessionError;
   const token=sessionData?.session?.access_token;
   if(!token)throw new Error('Sua sessão expirou. Entre novamente.');
   const response=await fetch(SUPABASE_URL+'/functions/v1/generate-instagram-content',{
     method:'POST',
     headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},
     body:JSON.stringify({topic,kind,discipline,brief})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'Falha na geração com IA (HTTP '+response.status+').');
   const ai=data.content||{};
   const body=String(ai.captionBody||'').trim();
   if(!body)throw new Error('A IA retornou uma resposta sem síntese. Tente novamente.');
   const p=makePost(topic,kind,date,$('time').value||'12:15','Feed');
   p.title=String(ai.title||topic);
   p.captionBody=body;
   p.aiHashtags=Array.isArray(ai.hashtags)?ai.hashtags:[];
   p.imageText=String(ai.imageText||'');
   p.keyPoints=Array.isArray(ai.keyPoints)?ai.keyPoints:[];
   p.mindMap=ai.mindMap&&typeof ai.mindMap==='object'?ai.mindMap:null;
   p.discipline=discipline;
   p.brief=brief;
   p.caption=makeCaption(p);
   p.images=[await htmlEditorialToImage(ai.html,p)];
   p.generatedHtml=String(ai.html);
   p.status='Pendente';
   p.needsApproval=false;
   posts.push(p);
   if(!save()){posts.pop();throw new Error('Não foi possível salvar a publicação no navegador.');}
   const warning=ai.reviewNote?'<p class="hint"><strong>Revisão editorial:</strong> '+esc(ai.reviewNote)+'</p>':'';
   host.innerHTML='<p class="hint"><strong>Conteúdo gerado pela IA (DeepSeek)</strong> e salvo na agenda. Revise antes de aprovar e publicar.</p><div class="image-preview">'+p.images.map(src=>'<div class="image-thumb"><img src="'+src+'" alt="Prévia da arte AprovaJá"><span>Arte para o feed</span></div>').join('')+'</div><p><strong>Legenda pronta:</strong></p><p class="hint" style="white-space:pre-wrap">'+esc(p.caption)+'</p>'+warning+'<div class="actions"><button type="button" class="btn secondary" id="copyPreviewCaption">Copiar legenda</button></div>';
   $('copyPreviewCaption')?.addEventListener('click',()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(p.caption).then(()=>toast('Legenda copiada.')).catch(()=>toast('Não foi possível copiar automaticamente.'));else toast('Selecione e copie a legenda acima.');});
   $('monthFilter').value=date.slice(0,7);
   $('posts').scrollIntoView({behavior:'smooth',block:'start'});
   toast('A IA gerou o conteúdo e a publicação foi salva na agenda.');
 }catch(error){
   host.innerHTML='<p class="hint integration-error">'+esc(error?.message||'Não foi possível gerar conteúdo com IA.')+'</p>';
   toast(error?.message||'Falha na geração com IA.');
 }finally{button.disabled=false;button.textContent='Gerar Conteúdo Com IA';}
});

function openArtworkPopup(src,title){
 let modal=document.getElementById('artworkModal');
 if(!modal){
  modal=document.createElement('div');modal.id='artworkModal';modal.className='artwork-modal';
  modal.innerHTML='<div class="artwork-modal-backdrop" data-close-artwork></div><section class="artwork-modal-dialog" role="dialog" aria-modal="true" aria-label="Visualização ampliada da arte"><div class="artwork-modal-head"><strong id="artworkModalTitle">Prévia da arte</strong><button type="button" class="artwork-modal-close" aria-label="Fechar visualização" data-close-artwork>×</button></div><div class="artwork-modal-body"><img id="artworkModalImage" alt="Arte ampliada AprovaJá"></div><div class="artwork-modal-actions"><a id="artworkModalDownload" class="btn primary" download="arte-aprovaja.png">Baixar arte</a><button type="button" class="btn secondary" data-close-artwork>Fechar</button></div></section>';
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{if(e.target.closest('[data-close-artwork]'))modal.classList.remove('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('open');});
 }
 document.getElementById('artworkModalTitle').textContent=title||'Prévia da arte';
 document.getElementById('artworkModalImage').src=src;
 document.getElementById('artworkModalDownload').href=src;
 modal.classList.add('open');
}
document.addEventListener('click',e=>{
 const img=e.target.closest('.post-images img, .image-preview img, .generated-grid img');
 if(!img)return;
 e.preventDefault();
 const link=img.closest('a');
 const title=img.alt||link?.querySelector('span')?.textContent||'Prévia da arte';
 openArtworkPopup(img.currentSrc||img.src,title);
});
