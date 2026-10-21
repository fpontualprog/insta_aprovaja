
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
function svgArt(title,kind,body,page,total,format='Feed'){
 const story=format==='Stories';
 const W=1080,H=story?1920:1350;
 const c={navy:'#071b43',blue:kind==='Mapa mental'?'#087f8c':'#1453a1',orange:'#ff9418',pale:'#f2f6fc',ink:'#10254b'};
 const xml=s=>esc(String(s??''));
 function linesFor(value,maxChars,maxLines=8){
  const words=String(value||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const out=[];let line='';
  for(let word of words){
   if(word.length>maxChars){
    if(line){out.push(line);line='';}
    while(word.length>maxChars){out.push(word.slice(0,maxChars));word=word.slice(maxChars);}
   }
   const next=line?line+' '+word:word;
   if(next.length>maxChars){if(line)out.push(line);line=word;}else line=next;
  }
  if(line)out.push(line);
  return out.slice(0,maxLines);
 }
 const titleLines=linesFor(title,story?20:23,2);
 const titleStart=story?490:440;
 const titleSize=story?58:62;
 const titleSvg=titleLines.map((t,i)=>'<text x="72" y="'+(titleStart+i*(titleSize+10))+'" font-family="Arial,sans-serif" font-size="'+titleSize+'" font-weight="800" fill="'+(i===titleLines.length-1?'#ffad35':'#ffffff')+'">'+xml(t)+'</text>').join('');
 const shortText=story
  ? (kind==='Questão comentada'?'Tente responder antes de conferir o gabarito.':kind==='Mapa mental'?'Revise o tema em quatro pontos essenciais.':kind==='Concursos abertos'?'Confira o edital e os prazos na fonte oficial.':kind==='Planejamento de estudos'?'Teoria, questões e revisão: avance um passo por vez.':kind==='Motivação e disciplina'?'Constância hoje. Mais preparo no dia da prova.':kind==='Divulgação da plataforma'?'Organize sua preparação gratuitamente na AprovaJá.':'Uma dica objetiva para sua próxima prova.')
  : (kind==='Questão comentada'?'QUESTÃO DE REVISÃO  •  RESPONDA ANTES DE CONFERIR':kind==='Mapa mental'?'CONCEITO  •  REGRAS  •  EXCEÇÕES  •  PROVA':kind==='Concursos abertos'?'OPORTUNIDADES: CONFIRA SEMPRE O EDITAL OFICIAL':kind==='Planejamento de estudos'?'TEORIA  •  QUESTÕES  •  REVISÃO':kind==='Motivação e disciplina'?'UM PASSO DE CADA VEZ. MANTENHA A CONSTÂNCIA.':kind==='Divulgação da plataforma'?'ORGANIZE SEUS ESTUDOS GRATUITAMENTE.':'RESUMO PRÁTICO PARA REVISAR ANTES DA PROVA.');
 const copyLines=linesFor(shortText,story?24:36,story?4:3);
 const copySize=story?34:30;
 const copyStart=story?900:850;
 const copySvg=copyLines.map((t,i)=>'<text x="72" y="'+(copyStart+i*(copySize+18))+'" font-family="Arial,sans-serif" font-size="'+copySize+'" font-weight="'+(i===0?'700':'500')+'" fill="'+c.ink+'">'+xml(t)+'</text>').join('');
 const footerY=story?1570:1115;
 const footerHeight=story?240:170;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c.navy+'"/><stop offset="1" stop-color="'+c.blue+'"/></linearGradient><linearGradient id="or" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ffb12b"/><stop offset="1" stop-color="#ff8317"/></linearGradient></defs><rect width="'+W+'" height="'+H+'" fill="#f4f7fc"/><rect width="'+W+'" height="'+(story?760:650)+'" fill="url(#bg)"/><circle cx="1015" cy="115" r="220" fill="#fff" opacity=".05"/><circle cx="1015" cy="115" r="160" fill="none" stroke="'+c.orange+'" stroke-width="4"/><g transform="translate(62 40)"><path d="M0 42 L24 0 L48 0 L26 42Z" fill="#ff951a"/><path d="M26 42 L56 9 L80 56 L60 56 L49 34 L34 56 L8 56Z" fill="#fff"/><path d="M33 56 L45 38 L54 56Z" fill="#ff951a"/><text x="94" y="27" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#fff">APROVAJÁ</text><text x="96" y="52" font-family="Arial,sans-serif" font-size="15" letter-spacing="4" font-weight="700" fill="#fff">CONCURSOS</text><text x="96" y="75" font-family="Arial,sans-serif" font-size="16" fill="#fff">@aprovaja_seuconcurso</text></g><rect x="62" y="155" width="360" height="48" rx="24" fill="url(#or)"/><text x="242" y="187" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="800" fill="'+c.navy+'">'+xml(kind.toUpperCase())+'</text>'+titleSvg+'<rect x="52" y="'+(story?800:730)+'" width="976" height="'+(story?600:330)+'" rx="34" fill="#fff"/><rect x="52" y="'+(story?800:730)+'" width="16" height="'+(story?600:330)+'" rx="8" fill="'+c.orange+'"/>'+copySvg+'<rect x="52" y="'+footerY+'" width="976" height="'+footerHeight+'" rx="30" fill="url(#bg)"/><text x="90" y="'+(footerY+55)+'" font-family="Arial,sans-serif" font-size="'+(story?31:28)+'" font-weight="800" fill="#fff">'+(story?'APRENDA. REVISE. AVANCE.':'SALVE PARA REVISAR ANTES DA PROVA')+'</text><text x="90" y="'+(footerY+105)+'" font-family="Arial,sans-serif" font-size="'+(story?25:23)+'" fill="#fff">Acesse grátis: aprovajaconcurso.netlify.app</text><rect x="790" y="'+(H-90)+'" width="238" height="48" rx="24" fill="'+c.orange+'"/><text x="909" y="'+(H-59)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" font-weight="800" fill="'+c.navy+'">APROVAJÁ CONCURSOS</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function summarySvgArt(p){
 const W=1080,H=1080;
 const xml=v=>esc(String(v??''));
 const raw=Array.isArray(p.keyPoints)?p.keyPoints.map(String).filter(x=>x.trim()):[];
 const fallback=String(p.captionBody||'').split(/\\n+/).map(x=>x.replace(/^\\s*(?:[-•*]|\\d+[.)])\\s*/,'').trim()).filter(x=>x.length>18);
 const points=raw.length?raw:fallback;
 while(points.length<3)points.push('Revise a regra central e suas exceções na fonte oficial.');
 const shown=points.slice(0,5);
 const wrap=(value,max)=>{const words=String(value||'').trim().split(/\\s+/);const lines=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(next.length>max&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines};
 const fit=(value,maxChars,maxLines,maxFont,minFont)=>{const lines=wrap(value,maxChars);const font=Math.max(minFont,Math.min(maxFont,Math.floor(maxFont*maxLines/Math.max(maxLines,lines.length))));const out=lines.slice(0,maxLines);if(lines.length>maxLines&&out.length)out[out.length-1]=out[out.length-1].replace(/[.,;:]?$/,'…');return {lines:out,font}};
 const title=fit(p.title||'Resumo do conteúdo',22,2,52,36);
 const titleSvg=title.lines.map((t,i)=>'<text x="70" y="'+(240+i*(title.font+8))+'" font-family="Arial,sans-serif" font-size="'+title.font+'" font-weight="800" fill="'+(i===title.lines.length-1?'#ff9e1b':'#ffffff')+'">'+xml(t)+'</text>').join('');
 const boxY=375,boxH=510,pad=22,rowH=(boxH-pad*2)/shown.length;
 const rows=shown.map((point,i)=>{
  const cy=boxY+pad+i*rowH+rowH/2;
  const fitted=fit(point,48,2,24,17);
  const startY=cy-((fitted.lines.length-1)*(fitted.font+5))/2+fitted.font*.35;
  return '<circle cx="100" cy="'+cy+'" r="25" fill="#ff9e1b"/><text x="100" y="'+(cy+9)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="800" fill="#071b43">'+(i+1)+'</text>'+fitted.lines.map((line,j)=>'<text x="150" y="'+(startY+j*(fitted.font+5))+'" font-family="Arial,sans-serif" font-size="'+fitted.font+'" font-weight="'+(j===0?'700':'500')+'" fill="#10254b">'+xml(line)+'</text>').join('');
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 1080 1080"><defs><linearGradient id="navy" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#061a3a"/><stop offset="1" stop-color="#0b3970"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#navy)"/><path d="M790 0H1080V350Z" fill="#ff9e1b"/><rect x="52" y="38" width="590" height="76" rx="20" fill="#ff9e1b"/><text x="82" y="87" font-family="Arial,sans-serif" font-size="36" font-weight="900" fill="#071b43">APROVAJÁ</text><text x="370" y="86" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#071b43">REVISÃO PARA CONCURSOS</text><text x="70" y="180" font-family="Arial,sans-serif" font-size="24" font-weight="800" letter-spacing="2" fill="#ffb347">'+xml(String(p.discipline||'RESUMO PARA CONCURSOS').toUpperCase().slice(0,36))+'</text>'+titleSvg+'<rect x="48" y="'+boxY+'" width="984" height="'+boxH+'" rx="28" fill="#f5f7fb"/>'+rows+'<rect x="48" y="905" width="984" height="112" rx="25" fill="#ff9e1b"/><text x="82" y="950" font-family="Arial,sans-serif" font-size="27" font-weight="900" fill="#071b43">TESTE SEUS CONHECIMENTOS!</text><text x="82" y="985" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#071b43">Mais conteúdo e revisão na plataforma AprovaJá</text><text x="540" y="1050" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#ffffff">APROVAJACONCURSO.NETLIFY.APP</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function modalitySvgArt(p){
 const W=1080,H=1080,kind=String(p.kind||''),title=String(p.title||kind);
 const escXml=s=>esc(String(s??''));
 const points=(p.keyPoints||[]).map(String).filter(Boolean);
 const fallback=String(p.captionBody||'').split(/\\n+/).map(s=>s.replace(/^[-•*\\d.) ]+/,'').trim()).filter(s=>s.length>12);
 while(points.length<3&&fallback.length)points.push(fallback.shift());
 while(points.length<3)points.push('Confira a regra aplicável na fonte oficial.');
 const wrap=(value,max)=>{const words=String(value||'').trim().split(/\\s+/);const lines=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(next.length>max&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines};
 const fitted=(value,maxChars,maxLines,minFont=15,maxFont=27)=>{const lines=wrap(value,maxChars);const font=Math.max(minFont,Math.min(maxFont,Math.floor(maxFont*(maxLines/Math.max(maxLines,lines.length)))));const shown=lines.slice(0,maxLines);if(lines.length>maxLines&&shown.length)shown[shown.length-1]=shown[shown.length-1].replace(/[.,;:]?$/,'…');return {lines:shown,font}};
 const titleFit=fitted(title,24,2,34,58);
 const titleSvg=titleFit.lines.map((t,i)=>'<text x="70" y="'+(235+i*(titleFit.font+8))+'" font-family="Arial,sans-serif" font-size="'+titleFit.font+'" font-weight="800" fill="'+(i===titleFit.lines.length-1?'#ff9e1b':'#ffffff')+'">'+escXml(t)+'</text>').join('');
 const typeLabel=kind.toLocaleUpperCase('pt-BR').slice(0,42);
 let body='';
 if(kind==='Mapa mental'){
  const mm=p.mindMap&&Array.isArray(p.mindMap.branches)?p.mindMap:null;
  const branches=(mm?mm.branches:points.map((x,i)=>({title:['PONTO-CHAVE 1','PONTO-CHAVE 2','PONTO-CHAVE 3'][i]||'PONTO-CHAVE',description:x}))).filter(x=>x&&(x.title||x.description)).slice(0,8);
  while(branches.length<3)branches.push({title:'PONTO-CHAVE',description:'Confira a regra aplicável na fonte oficial.'});
  const count=branches.length;
  const layouts={
   3:[{x:250,y:600},{x:830,y:600},{x:540,y:835}],
   4:[{x:260,y:570},{x:820,y:570},{x:260,y:825},{x:820,y:825}],
   5:[{x:540,y:475},{x:230,y:650},{x:850,y:650},{x:330,y:855},{x:750,y:855}],
   6:[{x:260,y:510},{x:820,y:510},{x:260,y:690},{x:820,y:690},{x:260,y:870},{x:820,y:870}],
   7:[{x:260,y:480},{x:820,y:480},{x:260,y:635},{x:820,y:635},{x:260,y:790},{x:820,y:790},{x:540,y:930}],
   8:[{x:260,y:460},{x:820,y:460},{x:260,y:610},{x:820,y:610},{x:260,y:760},{x:820,y:760},{x:260,y:910},{x:820,y:910}]
  };
  const pos=layouts[Math.min(8,Math.max(3,count))];
  const cardW=count<=4?350:count<=6?285:250;
  const cardH=count<=4?145:count<=6?125:108;
  const titleSize=count<=5?18:15,descSize=count<=5?15:12;
  const titleChars=count<=5?22:27,descChars=count<=5?30:34;
  const descMax=count<=5?3:2;
  const cards=branches.map((br,i)=>{
   const q=pos[i],head=wrap(br.title||'PONTO-CHAVE',titleChars),desc=wrap(br.description||'',descChars);
   const headMax=2,headLines=head.slice(0,headMax),descLines=desc.slice(0,descMax);
   if(head.length>headMax&&headLines.length)headLines[headLines.length-1]=headLines[headLines.length-1].replace(/[.,;:]?$/,'…');
   if(desc.length>descMax&&descLines.length)descLines[descLines.length-1]=descLines[descLines.length-1].replace(/[.,;:]?$/,'…');
   const top=q.y-cardH/2,headY=top+25,descY=headY+headLines.length*(titleSize+3)+8;
   return '<rect x="'+(q.x-cardW/2)+'" y="'+top+'" width="'+cardW+'" height="'+cardH+'" rx="17" fill="'+(i%2?'#fff0d6':'#f5f7fb')+'"/>'+headLines.map((t,j)=>'<text x="'+q.x+'" y="'+(headY+j*(titleSize+3))+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+titleSize+'" font-weight="900" fill="#10254b">'+escXml(t)+'</text>').join('')+descLines.map((t,j)=>'<text x="'+q.x+'" y="'+(descY+j*(descSize+4))+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+descSize+'" fill="#10254b">'+escXml(t)+'</text>').join('');
  }).join('');
  const center=count<=4?680:675;
  const links=pos.map(q=>'<line x1="540" y1="'+center+'" x2="'+q.x+'" y2="'+q.y+'" stroke="#ff9e1b" stroke-width="5"/>').join('');
  const centerLines=wrap(String(mm?.central||title),14).slice(0,3);
  body=links+cards+'<circle cx="540" cy="'+center+'" r="73" fill="#ff9e1b" stroke="#071b43" stroke-width="5"/>'+centerLines.map((t,i)=>'<text x="540" y="'+(center-14+i*21)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="900" fill="#071b43">'+escXml(t)+'</text>').join('');
 }else{
  const heads=kind==='Questão comentada'?['QUESTÃO','ALTERNATIVAS','COMENTÁRIO']:kind==='Dica de prova'?['PEGADINHA','REGRA CORRETA','COMO CAI']:kind==='Planejamento de estudos'?['META','ROTINA','PRÁTICA']:kind==='Divulgação da plataforma'?['RECURSOS','ORGANIZAÇÃO','ACESSO']:kind==='Motivação e disciplina'?['ROTINA','CONSTÂNCIA','PROGRESSO']:kind==='Concursos abertos'?['EDITAL','VAGAS','PRAZOS']:['PONTO-CHAVE','APLICAÇÃO','ATENÇÃO'];
  const items=points.slice(0,4);
  const cardY=410,cardH=540,topPad=28,usable=cardH-topPad*2,rowH=Math.floor(usable/items.length);
  body=items.map((item,i)=>{const y=cardY+topPad+i*rowH;const head=heads[i]||'PONTO-CHAVE';const headLines=wrap(head,38).slice(0,1);const maxLines=Math.max(1,Math.floor((rowH-52)/25));const fittedBody=fitted(item,49,maxLines,15,23);return '<circle cx="105" cy="'+(y+10)+'" r="24" fill="#ff9e1b"/><text x="105" y="'+(y+18)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="900" fill="#071b43">'+(i+1)+'</text>'+headLines.map((t,j)=>'<text x="150" y="'+(y+5+j*22)+'" font-family="Arial,sans-serif" font-size="18" font-weight="900" fill="#ff9e1b">'+escXml(t)+'</text>').join('')+fittedBody.lines.map((t,j)=>'<text x="150" y="'+(y+34+j*(fittedBody.font+5))+'" font-family="Arial,sans-serif" font-size="'+fittedBody.font+'" fill="#ffffff">'+escXml(t)+'</text>').join('')}).join('');
 }
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#071b43"/><circle cx="990" cy="70" r="200" fill="#1453a1" opacity=".6"/><path d="M790 0H1080V330Z" fill="#ff9418"/><rect x="52" y="38" width="590" height="76" rx="20" fill="#ff9e1b"/><text x="82" y="87" font-family="Arial,sans-serif" font-size="36" font-weight="900" fill="#071b43">APROVAJÁ</text><text x="370" y="86" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#071b43">REVISÃO PARA CONCURSOS</text><text x="70" y="180" font-family="Arial,sans-serif" font-size="22" font-weight="800" letter-spacing="2" fill="#ffb347">'+escXml(typeLabel)+'</text>'+titleSvg+'<rect x="34" y="395" width="1012" height="565" rx="28" fill="'+(kind==='Mapa mental'?'#0b3970':'#102c53')+'"/>'+body+'<line x1="60" y1="1000" x2="1020" y2="1000" stroke="#ff9e1b" stroke-width="4"/><text x="540" y="1045" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="700" fill="#ffffff">APROVAJACONCURSO.NETLIFY.APP</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function generateArts(p){
 const visualKinds=['Resumo de conteúdo','Dica de prova','Questão comentada','Mapa mental','Planejamento de estudos','Divulgação da plataforma','Motivação e disciplina','Concursos abertos'];
 return [visualKinds.includes(p.kind)?(p.kind==='Resumo de conteúdo'?summarySvgArt(p):modalitySvgArt(p)):svgArt(p.title,p.kind,p.captionBody,1,1,p.format||'Feed')];
}
function makePost(topic,kind,date,time,format='Carrossel'){const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:topic.trim(),kind,format,date,time,brief:'Conteúdo educativo para candidatos a concursos públicos. Identidade visual azul-marinho, branco e laranja.',status:'Pendente'};p.captionBody=topicBody(p.title,kind);p.caption=makeCaption(p);p.images=generateArts(p);return p}
function render(){const filter=$('filter').value;const monthFilter=$('monthFilter')?.value||localDate(new Date()).slice(0,7);const list=posts.filter(p=>(!p.date||p.date.slice(0,7)===monthFilter)&&(filter==='all'||filter==='Pendente'?(filter==='all'||p.status==='Pendente'||p.needsApproval):p.status===filter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$('count').textContent=posts.length;$('pendingCount').textContent=posts.filter(p=>p.status==='Pendente'||p.needsApproval).length;$('approvedCount').textContent=posts.filter(p=>p.status==='Aprovada'&&!p.needsApproval).length;$('publishedCount').textContent=posts.filter(p=>p.status==='Publicada').length;const host=$('posts');if(!list.length){host.className='posts-empty';host.innerHTML='<div class="empty-icon">✦</div><strong>Agenda vazia</strong><p>Gere as pautas para montar o calendário mensal.</p>';return}host.className='';host.innerHTML=list.map(p=>{const needsApproval=!!p.needsApproval||p.status==='Pendente';return '<article class="post-card layout-'+esc((p.kind||'dica').toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'"><div class="post-top"><div><h3>'+esc(p.title)+'</h3><div class="meta">'+esc(p.kind)+' · '+esc(p.format||'Carrossel')+'<br>'+esc(formatDate(p.date))+' às '+esc(p.time)+'</div></div><span class="status '+esc(p.status)+'">'+esc(needsApproval?'Aguardando aprovação':p.status==='Aprovada'?'Na fila de publicação':p.status)+'</span></div><p class="post-caption">'+esc(needsApproval?'Prévia da pauta. Aprove para gerar o texto, a legenda e as artes.':p.caption||'')+'</p>'+(p.images&&p.images.length?'<div class="post-images">'+p.images.map((src,i)=>'<a href="'+src+'" download="aprovaja-arte-'+(i+1)+'.svg" target="_blank" rel="noopener"><img src="'+src+'" alt="Arte '+(i+1)+' do carrossel"><span>Baixar arte '+(i+1)+'</span></a>').join('')+'</div>':'')+'<div class="post-actions">'+(needsApproval?'<button class="small-btn" data-action="edit" data-id="'+p.id+'">Alterar</button><button class="small-btn approve-btn" data-action="approve" data-id="'+p.id+'">Aprovar e gerar conteúdo</button><button class="small-btn" data-action="reject" data-id="'+p.id+'">Reprovar</button>':'<button class="small-btn" data-action="copy" data-id="'+p.id+'">Copiar legenda</button>')+(p.status==='Aprovada'&&!needsApproval?'<button class="small-btn publish-btn" data-publish-id="'+p.id+'">Publicar agora</button><button class="small-btn" data-action="published" data-id="'+p.id+'">Marcar publicada</button>':'')+'<button class="small-btn" data-action="delete" data-id="'+p.id+'">Excluir</button></div></article>'}).join('')}function setDefaultDate(){const d=new Date();d.setDate(d.getDate()+((2-d.getDay()+7)%7||7));$('date').value=localDate(d);$('bulkStart').value=localDate(d)}
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
 if(!currentSession?.access_token||!supabaseClient){toast('Entre com a conta administradora para gerar conteúdo com IA.');integrationStatus('Entre com a conta administradora para usar o DeepSeek.',true);return;}
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
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},
    body:JSON.stringify({topic,kind,discipline:'Concursos públicos',brief:'Crie conteúdo educativo conciso e correto para Instagram sobre esta matéria. Tipo de publicação: '+kind+'.'})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error('Falha de IA no tema "'+topic+'": '+(data.error||'HTTP '+response.status));
   const ai=data.content||{};
   if(!String(ai.captionBody||'').trim())throw new Error('A IA retornou conteúdo vazio para: '+topic);
   const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),title:String(ai.title||topic),kind,format:'Feed',date:localDate(d),time,brief:'Gerado com IA a partir da pauta: '+topic,status:'Pendente',needsApproval:false,captionBody:String(ai.captionBody).trim(),aiHashtags:Array.isArray(ai.hashtags)?ai.hashtags:[],imageText:String(ai.imageText||'')};
   p.keyPoints=Array.isArray(ai.keyPoints)?ai.keyPoints:[];p.mindMap=ai.mindMap&&typeof ai.mindMap==='object'?ai.mindMap:null;p.discipline='Concursos públicos';p.imageText=String(ai.imageText||'');p.caption=makeCaption(p);p.images=generateArts(p);newPosts.push(p);
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
$('posts').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const p=posts.find(x=>x.id===b.dataset.id);if(!p)return;switch(b.dataset.action){case'edit':{const title=prompt('Edite o tema da publicação:',p.title);if(title===null)return;if(!title.trim()){toast('O tema não pode ficar vazio.');return}p.title=title.trim();if(save())toast('Tema atualizado.');break}case'approve':if(p.needsApproval||p.status==='Pendente'){if(!String(p.captionBody||'').trim())p.captionBody=topicBody(p.title,p.kind);p.caption=makeCaption(p);if(!p.images||!p.images.length)p.images=generateArts(p);p.needsApproval=false;p.status='Aprovada';if(save())toast('Aprovada e adicionada à fila de publicação com o conteúdo gerado preservado.')}break;case'reject':posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação reprovada e retirada da agenda.');break;case'published':p.status='Publicada';if(save())toast('Status atualizado.');break;case'delete':if(confirm('Excluir esta publicação e suas artes?')){posts=posts.filter(x=>x.id!==p.id);if(save())toast('Publicação excluída.')}break;case'copy':copyCaption(p);break}});

const CONTESTS_URL='https://raw.githubusercontent.com/fpontualprog/aprovaja/main/data/concursos_elegiveis.json';
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function contestSvg(title,body,page,total){const lines=wrapWords(title,24).slice(0,3);const bodyLines=wrapWords(body,31).slice(0,7);const titleSvg=lines.map((l,i)=>'<text x="70" y="'+(390+i*64)+'" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#ffffff">'+esc(l)+'</text>').join('');const bodySvg=bodyLines.map((l,i)=>'<text x="76" y="'+(650+i*42)+'" font-family="Arial,sans-serif" font-size="27" fill="#102c63">'+esc(l)+'</text>').join('');const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#f4f7fc"/><rect width="1080" height="300" fill="#102c63"/><circle cx="1020" cy="70" r="200" fill="#ff9e18"/><text x="70" y="95" font-family="Arial,sans-serif" font-size="31" font-weight="700" fill="#ffffff">APROVAJÁ CONCURSOS</text><text x="70" y="150" font-family="Arial,sans-serif" font-size="22" fill="#ffffff">@aprovaja_seuconcurso</text><rect x="70" y="205" width="420" height="54" rx="27" fill="#ff9e18"/><text x="94" y="241" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#102c63">'+(page===1?'5 CONCURSOS PARA CONHECER':page===total?'ACOMPANHE NA APROVAJÁ':'OPORTUNIDADE '+(page-1))+'</text>'+titleSvg+'<rect x="60" y="560" width="960" height="470" rx="28" fill="#e8f1ff"/>'+bodySvg+'<rect x="60" y="1100" width="960" height="5" fill="#ff9e18"/><text x="70" y="1160" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#102c63">Confira as informações na fonte oficial</text><text x="70" y="1215" font-family="Arial,sans-serif" font-size="22" fill="#52627a">Acesse a página do concurso pelo link da legenda.</text><rect x="900" y="1260" width="110" height="55" rx="27" fill="#102c63"/><text x="930" y="1296" font-family="Arial,sans-serif" font-size="22" fill="#ffffff">'+page+'/'+total+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function makeContestCarousel(contests){const total=7;const today=localDate(new Date());const p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:'5 concursos públicos para acompanhar',kind:'Concursos abertos',format:'Feed',date:today,time:'10:00',brief:'Seleção aleatória da base de concursos do AprovaJá.',status:'Pendente'};const slides=[{title:'5 concursos públicos para acompanhar',body:'Seleção aleatória de oportunidades disponíveis na base. Verifique o edital e a situação atual das inscrições.',url:'https://aprovajaconcurso.netlify.app'}];contests.forEach(c=>{const body=[c.uf?'Estado: '+c.uf:'',c.vagas?'Vagas: '+c.vagas:'',c.nivel?'Escolaridade: '+c.nivel:'',c.salario?'Remuneração: '+c.salario:'',c.inscricao_ate?'Prazo informado: '+c.inscricao_ate:'','Situação deve ser confirmada na fonte oficial.'].filter(Boolean).join('\n');slides.push({title:c.concurso||'Concurso público',body,url:c.edital_url||c.fonte_url||c.banca_url||'https://aprovajaconcurso.netlify.app'})});slides.push({title:'Veja mais oportunidades na AprovaJá',body:'Consulte informações, confira os editais oficiais e organize sua preparação.',url:'https://aprovajaconcurso.netlify.app'});p.contests=contests;p.captionBody=slides.map((s,i)=>(i===0?'CAPA':i===6?'ACESSE A APROVAJÁ':'CONCURSO '+i)+': '+s.title+'\n'+s.body+(s.url?'\nFonte/link: '+s.url:'')).join('\n\n');p.caption=makeCaption(p);p.images=slides.map((s,i)=>contestSvg(s.title,s.body,i+1,total));return p}
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
        canvas.height = img.naturalHeight > 1500 ? 1920 : 1350;
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
function mindMapSvgData(map){
 const W=1200,H=850, cx=600,cy=420;
 const branches=(map?.branches||[]).slice(0,6);
 const colors=['#1453a1','#087f8c','#d97706','#4f46a5','#0f766e','#be185d'];
 const nodes=branches.map((b,i)=>{
  const angle=-Math.PI/2+i*2*Math.PI/Math.max(branches.length,1);
  const x=cx+330*Math.cos(angle),y=cy+265*Math.sin(angle);
  const lines=[String(b.label||'Tópico'),...(b.children||[]).slice(0,3).map(String)];
  const startY=y-(lines.length-1)*18;
  const text=lines.map((line,j)=>'<text x="'+x+'" y="'+(startY+j*36)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+(j===0?22:17)+'" font-weight="'+(j===0?800:500)+'" fill="'+(j===0?'#ffffff':'#eef4ff')+'">'+esc(line.slice(0,29))+'</text>').join('');
  return '<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="'+colors[i%colors.length]+'" stroke-width="7" stroke-linecap="round"/><rect x="'+(x-125)+'" y="'+(y-85)+'" width="250" height="170" rx="24" fill="'+colors[i%colors.length]+'"/>'+text;
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><rect width="100%" height="100%" fill="#f4f7fc"/>'+nodes+'<circle cx="'+cx+'" cy="'+cy+'" r="112" fill="#071b43" stroke="#ff9418" stroke-width="8"/><text x="'+cx+'" y="'+(cy-8)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#ffffff">'+esc(String(map?.central||'MAPA MENTAL').slice(0,24))+'</text><text x="'+cx+'" y="'+(cy+32)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#ffb347">APROVAJÁ</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
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
   p.images=generateArts(p);
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
  modal.innerHTML='<div class="artwork-modal-backdrop" data-close-artwork></div><section class="artwork-modal-dialog" role="dialog" aria-modal="true" aria-label="Visualização ampliada da arte"><div class="artwork-modal-head"><strong id="artworkModalTitle">Prévia da arte</strong><button type="button" class="artwork-modal-close" aria-label="Fechar visualização" data-close-artwork>×</button></div><div class="artwork-modal-body"><img id="artworkModalImage" alt="Arte ampliada AprovaJá"></div><div class="artwork-modal-actions"><a id="artworkModalDownload" class="btn primary" download="arte-aprovaja.svg">Baixar arte</a><button type="button" class="btn secondary" data-close-artwork>Fechar</button></div></section>';
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
