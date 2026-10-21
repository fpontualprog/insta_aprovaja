
const KEY='insta-aprovaja-posts-v1';const $=id=>document.getElementById(id);let posts=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(posts));render();return true}catch(e){toast('O armazenamento do navegador está cheio. Exclua publicações antigas e tente novamente.');return false}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
function formatDate(v){if(!v)return 'Data não definida';const [y,m,d]=v.split('-');return d+'/'+m+'/'+y}
function localDate(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
const PLATFORM_URL='https://aprovajaconcurso.netlify.app';
function makeCaption(p){const call=p.kind==='Concursos abertos'?'Confira requisitos, prazos e informações no edital oficial. Acompanhe mais oportunidades na AprovaJá.':p.kind==='Divulgação da plataforma'?'Conheça a AprovaJá e organize sua preparação.':p.kind==='Planejamento de estudos'?'Salve este planejamento e adapte à sua rotina.':p.kind==='Questão comentada'?'Responda antes de conferir o gabarito. Salve para revisar e compartilhe com quem também está estudando.':'Salve este conteúdo para revisar antes da prova.';return p.title+'\n\n'+p.captionBody+'\n\n'+call+'\n\n📚 Organize seus estudos gratuitamente na plataforma AprovaJá: '+PLATFORM_URL+'\n\n#AprovaJa #ConcursosPublicos #Concurseiros #EstudosParaConcursos'}
function topicBody(topic,kind){if(kind==='Concursos abertos')return 'Oportunidade em destaque: '+topic+'. Antes de se inscrever, confira o edital oficial, o período de inscrições, os cargos, as vagas e a remuneração. Não publique prazos ou números sem confirmação em fonte oficial.';if(kind==='Questão comentada')return 'QUESTÃO DE REVISÃO\nTema: '+topic+'.\n\nLeia o enunciado com atenção, identifique a regra aplicável e tente responder antes de consultar o material de revisão.\n\nNota editorial: inserir questão e gabarito verificados antes de publicar.';if(kind==='Mapa mental')return 'MAPA DE REVISÃO\nTema central: '+topic+'.\n\n1. Conceito e fundamento.\n2. Regras principais.\n3. Exceções importantes.\n4. Como o tema costuma ser cobrado.\n\nRevise a legislação ou bibliografia aplicável antes de publicar.';if(kind==='Planejamento de estudos')return 'ROTEIRO DE ESTUDO\nTema: '+topic+'.\n\n1. Estude a teoria.\n2. Faça questões da banca do seu concurso.\n3. Registre os erros.\n4. Revise em 24 horas e novamente na semana seguinte.';if(kind==='Divulgação da plataforma')return 'Organize seus estudos sobre '+topic+' com uma rotina de teoria, questões e revisão. Conheça a plataforma AprovaJá: aprov ajaconcurso.netlify.app'.replace('aprov ajaconcurso','aprovajaconcurso');if(kind==='Motivação e disciplina')return 'Seu próximo avanço começa com uma ação possível. Escolha um ponto de '+topic+', estude por um bloco curto e termine resolvendo algumas questões. Consistência é melhor que esperar pelo momento perfeito.';return 'RESUMO PARA CONCURSOS\nTema: '+topic+'.\n\n• Conceito central: identifique a definição e seu fundamento.\n• Pontos-chave: organize as regras, requisitos e exceções.\n• Atenção à banca: diferencie regra geral e exceções.\n• Revisão ativa: explique o assunto sem consultar o material e resolva questões.\n\nConfira a legislação e o material de referência antes de publicar.'}
function wrapWords(text,max){const words=text.split(/\s+/),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length>max){lines.push(line);line=word}else line=(line+' '+word).trim()}if(line)lines.push(line);return lines}
function svgArt(title,kind,body,page,total){
 const palette=kind==='Questão comentada'?{a:'#102c63',b:'#0b1735',accent:'#ff9e18',panel:'#fff3dd'}:kind==='Mapa mental'?{a:'#0d5c56',b:'#1769d2',accent:'#ffbf47',panel:'#e7f7f4'}:kind==='Motivação e disciplina'?{a:'#5b2c83',b:'#102c63',accent:'#ff9e18',panel:'#f2eaff'}:kind==='Concursos abertos'?{a:'#102c63',b:'#1769d2',accent:'#ff9e18',panel:'#e8f1ff'}:kind==='Divulgação da plataforma'?{a:'#102c63',b:'#174b9b',accent:'#ff9e18',panel:'#fff3dd'}:{a:'#102c63',b:'#1769d2',accent:'#ff9e18',panel:'#e8f1ff'};
 const centered=(text,y,size,color,weight='600')=>'<text x="540" y="'+y+'" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="'+color+'">'+esc(text)+'</text>';
 const wrapSvg=(text,max,limit)=>wrapWords(text,max).slice(0,limit);
 const clean=String(body||'').replace(/\n/g,' ').replace(/•/g,'·');
 const titleLines=wrapSvg(title,24,3);
 const titleSvg=titleLines.map((line,i)=>centered(line,380+i*72,58,'#ffffff','800')).join('');
 let keyText='';
 if(kind==='Mapa mental'){
   const nodes=wrapSvg(clean.replace(/^MAPA DE REVISÃO\s*/i,'').replace(/^Tema central:\s*/i,''),24,4);
   const labels=['CONCEITO','REGRAS','EXCEÇÕES','NA PROVA'];
   keyText='<g font-family="Montserrat, Poppins, Arial, sans-serif" text-anchor="middle"><path d="M540 620 V680 M540 680 H285 V725 M540 680 H795 V725 M285 805 V845 H540 V890 M795 805 V845 H540" fill="none" stroke="'+palette.a+'" stroke-width="6" stroke-linecap="round"/><rect x="240" y="550" width="600" height="86" rx="24" fill="'+palette.a+'"/><text x="540" y="603" font-size="32" font-weight="800" fill="#fff">MAPA MENTAL</text>'+labels.map((lab,i)=>{const x=i===0?285:i===1?795:i===2?285:795;const y=i<2?725:890;const nodeText=nodes[i]||lab;return '<rect x="'+(x-205)+'" y="'+(y-48)+'" width="410" height="110" rx="22" fill="#fff" stroke="'+palette.accent+'" stroke-width="5"/><text x="'+x+'" y="'+(y-8)+'" font-size="24" font-weight="800" fill="'+palette.a+'">'+lab+'</text><text x="'+x+'" y="'+(y+28)+'" font-size="19" fill="#18243b">'+esc(nodeText.slice(0,25))+'</text>'}).join('')+'</g>';
 } else {
   const snippets=wrapSvg(clean,30,4);
   keyText='<rect x="100" y="570" width="880" height="450" rx="34" fill="'+palette.panel+'"/>'+snippets.map((line,i)=>centered(line,660+i*76, i===0?34:30,'#10243e',i===0?'800':'600')).join('');
 }
 const content=page===1?'APROVAJÁ CONCURSOS':page===total?'SALVE • REVISE • COMPARTILHE':kind==='Mapa mental'?'VISÃO GERAL':page===2?'IDEIA-CHAVE':'PONTO IMPORTANTE';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+palette.a+'"/><stop offset="1" stop-color="'+palette.b+'"/></linearGradient></defs><rect width="1080" height="1350" fill="#f7f9fd"/><rect width="1080" height="300" fill="url(#bg)"/><circle cx="1000" cy="70" r="200" fill="'+palette.accent+'" opacity=".92"/><text x="540" y="85" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="29" font-weight="800" fill="#ffffff">A▶ APROVAJÁ CONCURSOS</text><text x="540" y="132" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="22" fill="#ffffff">@aprovaja_seuconcurso</text><rect x="300" y="190" width="480" height="58" rx="29" fill="'+palette.accent+'"/><text x="540" y="228" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="23" font-weight="800" fill="#102c63">'+esc(content)+'</text>'+titleSvg+keyText+'<rect x="60" y="1100" width="960" height="5" rx="2" fill="'+palette.accent+'"/><text x="540" y="1160" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="25" font-weight="800" fill="#102c63">CONCURSOS PÚBLICOS • ESTUDO OBJETIVO</text><text x="540" y="1200" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="20" fill="#1769d2">Acesse grátis: aprovajaconcurso.netlify.app</text><rect x="465" y="1260" width="150" height="55" rx="27" fill="#102c63"/><text x="540" y="1296" text-anchor="middle" font-family="Montserrat, Poppins, Arial, sans-serif" font-size="22" fill="#ffffff">'+page+'/'+total+'</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function generateArts(p){return [svgArt(p.title,p.kind,p.captionBody,1,1)]}
function makePost(topic,kind,date,time,format='Carrossel'){const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:topic.trim(),kind,format,date,time,brief:'Conteúdo educativo para candidatos a concursos públicos. Identidade visual azul-marinho, branco e laranja.',status:'Pendente'};p.captionBody=topicBody(p.title,kind);p.caption=makeCaption(p);p.images=generateArts(p);return p}
function render(){const filter=$('filter').value;const monthFilter=$('monthFilter')?.value||localDate(new Date()).slice(0,7);const list=posts.filter(p=>(!p.date||p.date.slice(0,7)===monthFilter)&&(filter==='all'||filter==='Pendente'?(filter==='all'||p.status==='Pendente'||p.needsApproval):p.status===filter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$('count').textContent=posts.length;$('pendingCount').textContent=posts.filter(p=>p.status==='Pendente'||p.needsApproval).length;$('approvedCount').textContent=posts.filter(p=>p.status==='Aprovada'&&!p.needsApproval).length;$('publishedCount').textContent=posts.filter(p=>p.status==='Publicada').length;const host=$('posts');if(!list.length){host.className='posts-empty';host.innerHTML='<div class="empty-icon">✦</div><strong>Agenda vazia</strong><p>Gere as pautas para montar o calendário mensal.</p>';return}host.className='';host.innerHTML=list.map(p=>{const needsApproval=!!p.needsApproval||p.status==='Pendente';return '<article class="post-card layout-'+esc((p.kind||'dica').toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'"><div class="post-top"><div><h3>'+esc(p.title)+'</h3><div class="meta">'+esc(p.kind)+' · '+esc(p.format||'Carrossel')+'<br>'+esc(formatDate(p.date))+' às '+esc(p.time)+'</div></div><span class="status '+esc(p.status)+'">'+esc(needsApproval?'Aguardando aprovação':p.status==='Aprovada'?'Na fila de publicação':p.status)+'</span></div><p class="post-caption">'+esc(needsApproval?'Prévia da pauta. Aprove para gerar o texto, a legenda e as artes.':p.caption||'')+'</p>'+(p.images&&p.images.length?'<div class="post-images">'+p.images.map((src,i)=>'<a href="'+src+'" download="aprovaja-arte-'+(i+1)+'.svg" target="_blank" rel="noopener"><img src="'+src+'" alt="Arte '+(i+1)+' do carrossel"><span>Baixar arte '+(i+1)+'</span></a>').join('')+'</div>':'')+'<div class="post-actions">'+(needsApproval?'<button class="small-btn" data-action="edit" data-id="'+p.id+'">Alterar</button><button class="small-btn approve-btn" data-action="approve" data-id="'+p.id+'">Aprovar e gerar conteúdo</button><button class="small-btn" data-action="reject" data-id="'+p.id+'">Reprovar</button>':'<button class="small-btn" data-action="copy" data-id="'+p.id+'">Copiar legenda</button>')+(p.status==='Aprovada'&&!needsApproval?'<button class="small-btn publish-btn" data-publish-id="'+p.id+'">Publicar agora</button><button class="small-btn" data-action="published" data-id="'+p.id+'">Marcar publicada</button>':'')+'<button class="small-btn" data-action="delete" data-id="'+p.id+'">Excluir</button></div></article>'}).join('')}function setDefaultDate(){const d=new Date();d.setDate(d.getDate()+((2-d.getDay()+7)%7||7));$('date').value=localDate(d);$('bulkStart').value=localDate(d)}
$('postForm').addEventListener('submit',e=>{e.preventDefault();const title=$('title').value.trim();if(!title||!$('date').value){toast('Informe título e data.');return}const p=makePost(title,$('kind').value,$('date').value,$('time').value,$('format').value);posts.push(p);if(!save()){posts.pop();return}e.target.reset();setDefaultDate();$('generatedPreview').innerHTML='<p class="hint">Artes geradas e anexadas à publicação na fila.</p>';toast('Conteúdo e artes gerados automaticamente.')});
$('suggestBtn').addEventListener('click',()=>{const ideas={'Questão comentada':['Questão de Direito Constitucional','Questão CEBRASPE: certo ou errado?'],'Dica de prova':['Princípios da Administração Pública','Controle de constitucionalidade'],'Mapa mental':['Poderes administrativos','Organização político-administrativa'],'Planejamento de estudos':['Como organizar a semana de estudos'],'Divulgação da plataforma':['Como organizar sua preparação'],'Motivação e disciplina':['Constância nos estudos'],'Concursos abertos':['Concursos abertos no Nordeste']};const kind=$('kind').value;const title=(ideas[kind]||ideas['Dica de prova'])[0];$('title').value=title;const preview=makePost(title,kind,$('date').value||localDate(new Date()),$('time').value,$('format').value);const host=$('generatedPreview');host.innerHTML='<p class="hint"><strong>Prévia gerada: '+esc(kind)+'.</strong> Edite o título no campo acima e clique em “Criar publicação” para salvá-la na agenda.</p><div class="image-preview">'+preview.images.map((src,i)=>'<div class="image-thumb"><img src="'+src+'" alt="Prévia da arte '+(i+1)+'"><span>Arte '+(i+1)+'/'+preview.images.length+'</span></div>').join('')+'</div><p class="hint">'+esc(preview.captionBody)+'</p>';host.scrollIntoView({behavior:'smooth',block:'nearest'});toast('Prévia visual gerada e exibida abaixo do formulário. Ainda não foi salva na agenda.');});
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
$('generateBatch').addEventListener('click',()=>{
 const topics=$('bulkTopics').value.split(/\n|;/).map(x=>x.trim()).filter(Boolean);
 if(!topics.length){toast('Insira os temas antes de gerar a agenda.');return}
 if(topics.length>30){toast('Gere no máximo 30 temas por lote.');return}
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
 const newPosts=topics.map((topic,i)=>{
   const d=slots[i];const kind=editorialForDate(d);
   const time=kind==='Questão comentada'?'12:15':kind==='Dica de prova'||kind==='Mapa mental'?'19:30':kind==='Concursos abertos'?'10:00':'18:30';
   const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:topic,kind,format:'Carrossel',date:localDate(d),time,brief:'Conteúdo para revisão de concursos públicos.',status:'Pendente',needsApproval:true,caption:'',captionBody:topicBody(topic,kind),images:[]};p.images=generateArts(p);return p;
 });
 posts.push(...newPosts);
 if(!save()){posts.splice(-newPosts.length,newPosts.length);return}
 toast('Lista mensal criada. Aprove ou reprove cada publicação.');
 $('bulkTopics').value='';
 $('generatedPreview').innerHTML='<p class="hint">Lista mensal criada. Em “Novas Publicações”, revise cada pauta: aprove para gerar texto, legenda, hashtags e artes; reprove para retirá-la da agenda.</p>';
 $('posts').scrollIntoView({behavior:'smooth',block:'start'});
});
$('posts').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const p=posts.find(x=>x.id===b.dataset.id);if(!p)return;switch(b.dataset.action){case'edit':{const title=prompt('Edite o tema da publicação:',p.title);if(title===null)return;if(!title.trim()){toast('O tema não pode ficar vazio.');return}p.title=title.trim();if(save())toast('Tema atualizado.');break}case'approve':if(p.needsApproval||p.status==='Pendente'){p.captionBody=topicBody(p.title,p.kind);p.caption=makeCaption(p);if(!p.images||!p.images.length)p.images=generateArts(p);p.needsApproval=false;p.status='Aprovada';if(save())toast('Aprovada e adicionada à fila de publicação com texto e artes.')}break;case'reject':posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação reprovada e retirada da agenda.');break;case'published':p.status='Publicada';if(save())toast('Status atualizado.');break;case'delete':if(confirm('Excluir esta publicação e suas artes?')){posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação excluída.')}break;case'copy':copyCaption(p);break}});

const CONTESTS_URL='https://raw.githubusercontent.com/fpontualprog/aprovaja/main/data/concursos_elegiveis.json';
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function contestSvg(title,body,page,total){const lines=wrapWords(title,24).slice(0,3);const bodyLines=wrapWords(body,31).slice(0,7);const titleSvg=lines.map((l,i)=>'<text x="70" y="'+(390+i*64)+'" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#ffffff">'+esc(l)+'</text>').join('');const bodySvg=bodyLines.map((l,i)=>'<text x="76" y="'+(650+i*42)+'" font-family="Arial,sans-serif" font-size="27" fill="#102c63">'+esc(l)+'</text>').join('');const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#f4f7fc"/><rect width="1080" height="300" fill="#102c63"/><circle cx="1020" cy="70" r="200" fill="#ff9e18"/><text x="70" y="95" font-family="Arial,sans-serif" font-size="31" font-weight="700" fill="#ffffff">APROVAJÁ CONCURSOS</text><text x="70" y="150" font-family="Arial,sans-serif" font-size="22" fill="#ffffff">@aprovaja_seuconcurso</text><rect x="70" y="205" width="420" height="54" rx="27" fill="#ff9e18"/><text x="94" y="241" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#102c63">'+(page===1?'5 CONCURSOS PARA CONHECER':page===total?'ACOMPANHE NA APROVAJÁ':'OPORTUNIDADE '+(page-1))+'</text>'+titleSvg+'<rect x="60" y="560" width="960" height="470" rx="28" fill="#e8f1ff"/>'+bodySvg+'<rect x="60" y="1100" width="960" height="5" fill="#ff9e18"/><text x="70" y="1160" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#102c63">Confira as informações na fonte oficial</text><text x="70" y="1215" font-family="Arial,sans-serif" font-size="22" fill="#52627a">Acesse a página do concurso pelo link da legenda.</text><rect x="900" y="1260" width="110" height="55" rx="27" fill="#102c63"/><text x="930" y="1296" font-family="Arial,sans-serif" font-size="22" fill="#ffffff">'+page+'/'+total+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function makeContestCarousel(contests){const total=7;const today=localDate(new Date());const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:'5 concursos públicos para acompanhar',kind:'Concursos abertos',format:'Carrossel',date:today,time:'10:00',brief:'Seleção aleatória da base de concursos do AprovaJá.',status:'Pendente'};const slides=[{title:'5 concursos públicos para acompanhar',body:'Seleção aleatória de oportunidades disponíveis na base. Verifique o edital e a situação atual das inscrições.',url:'https://aprovajaconcurso.netlify.app'}];contests.forEach(c=>{const body=[c.uf?'Estado: '+c.uf:'',c.vagas?'Vagas: '+c.vagas:'',c.nivel?'Escolaridade: '+c.nivel:'',c.salario?'Remuneração: '+c.salario:'',c.inscricao_ate?'Prazo informado: '+c.inscricao_ate:'','Situação deve ser confirmada na fonte oficial.'].filter(Boolean).join('\n');slides.push({title:c.concurso||'Concurso público',body,url:c.edital_url||c.fonte_url||c.banca_url||'https://aprovajaconcurso.netlify.app'})});slides.push({title:'Veja mais oportunidades na AprovaJá',body:'Consulte informações, confira os editais oficiais e organize sua preparação.',url:'https://aprovajaconcurso.netlify.app'});p.contests=contests;p.captionBody=slides.map((s,i)=>(i===0?'CAPA':i===6?'ACESSE A APROVAJÁ':'CONCURSO '+i)+': '+s.title+'\n'+s.body+(s.url?'\nFonte/link: '+s.url:'')).join('\n\n');p.caption=makeCaption(p);p.images=slides.map((s,i)=>contestSvg(s.title,s.body,i+1,total));return p}
$('generateContests').addEventListener('click',async()=>{const status=$('contestStatus');status.textContent='Consultando a base pública de concursos do AprovaJá…';const b=$('generateContests');b.disabled=true;try{const response=await fetch(CONTESTS_URL,{cache:'no-store'});if(!response.ok)throw new Error('A base de concursos não respondeu (HTTP '+response.status+').');const data=await response.json();const today=localDate(new Date());const eligible=(Array.isArray(data)?data:[]).filter(c=>{if(!c||!c.concurso||!c.inscricao_ate)return false;const deadline=String(c.inscricao_ate).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(deadline)||deadline<today)return false;const status=String(c.situacao_prazo||'').toLowerCase();return !status.includes('vencido')&&!status.includes('sem_data')});const unique=[...new Map(eligible.map(c=>[String(c.concurso).trim().toLowerCase(),c])).values()];if(unique.length<5)throw new Error('Há apenas '+unique.length+' registros elegíveis com data válida. Não criarei um carrossel incompleto nem inventarei concursos.');const picked=shuffle(unique).slice(0,5);const post=makeContestCarousel(picked);posts.push(post);if(!save()){posts.pop();return}status.textContent='Carrossel criado com 5 concursos sorteados. A situação de inscrição ainda precisa de confirmação oficial.';toast('Carrossel de 5 concursos gerado com 7 artes.')}catch(e){status.textContent=e.message+' Confira o repositório e a atualização da base.';toast('Não foi possível gerar o carrossel de concursos.')}finally{b.disabled=false}});

$('filter').addEventListener('change',render);$('monthFilter').addEventListener('change',render);setDefaultDate();$('monthFilter').value=localDate(new Date()).slice(0,7);render();


// --- Integração segura com Supabase Auth, Storage e Instagram ---
const SUPABASE_URL = 'https://nukddukqilhsdklocout.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vPQVdnjlEY9g0vZKjeb58A_OIhkIiqH';
const INSTAGRAM_PUBLISH_URL = SUPABASE_URL + '/functions/v1/instagram-publish';
let supabaseClient = null;
let currentSession = null;
let publishBusy = false;

function integrationStatus(message, isError=false) {
  const el = document.getElementById('instagramStatus');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('integration-error', !!isError);
}
function updateAuthUI() {
  const form = document.getElementById('instagramLoginForm');
  const signed = document.getElementById('instagramSignedIn');
  const emailLabel = document.getElementById('instagramSignedEmail');
  const loginEmail = document.getElementById('instagramEmail');
  if (form) form.hidden = !!currentSession;
  if (signed) signed.hidden = !currentSession;
  if (emailLabel) emailLabel.textContent = currentSession?.user?.email || '';
  if (loginEmail && currentSession?.user?.email) loginEmail.value = currentSession.user.email;
}
function svgToJpegBlob(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('O navegador não disponibilizou o canvas.');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível converter a arte para JPEG.')), 'image/jpeg', 0.92);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Não foi possível carregar a arte SVG para conversão.'));
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
      const jpegBlob = await svgToJpegBlob(post.images[i]);
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
  const loginForm = document.getElementById('instagramLoginForm');
  const logoutButton = document.getElementById('instagramLogoutButton');
  if (!loginForm || !window.supabase?.createClient) {
    integrationStatus('O módulo de autenticação não carregou. Atualize a página e tente novamente.', true);
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const { data } = await supabaseClient.auth.getSession();
  currentSession = data?.session || null;
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    updateAuthUI();
  });
  updateAuthUI();
  loginForm.addEventListener('submit', signInInstagramAdmin);
  logoutButton?.addEventListener('click', signOutInstagramAdmin);
  if (currentSession) integrationStatus('Sessão Supabase recuperada. A autorização administrativa será conferida pelo servidor.');
  else integrationStatus('Entre com a conta administradora do Supabase para habilitar a publicação.');
});
 
// Listener delegado registrado imediatamente: também funciona para cards criados dinamicamente.
document.getElementById('posts')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-publish-id]');
  if (!button) return;
  event.preventDefault();
  publishApprovedImage(button.dataset.publishId, button);
});
