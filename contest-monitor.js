(()=>{
 const $=id=>document.getElementById(id);
 const fn="concursos-instagram-painel";
 const fmtDate=v=>{if(!v)return "—";const d=new Date(v+"T12:00:00");return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString("pt-BR")};
 const fmtMoney=v=>{if(v===null||v===undefined||v==="")return "Não informado";if(typeof v==="number")return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});return String(v)};
 const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const setStatus=(s,bad=false)=>{const el=$("contestMonitorStatus");if(el){el.textContent=s;el.classList.toggle("integration-error",bad)}};
 function paintStats(s={}){const vals=[s.detectados??0,s.fila??0,s.publicados??0,s.falhas??0];const labels=["Identificados","Na fila","Publicados","Falhas"];const el=$("contestMonitorStats");if(el)el.innerHTML=labels.map((l,i)=>'<article><span>'+l+'</span><strong>'+vals[i]+'</strong></article>').join("")}
 function paintRows(rows=[]){const body=$("contestMonitorRows");if(!body)return;if(!rows.length){body.innerHTML='<tr><td colspan="7" class="contest-empty">Nenhum concurso registrado ainda. Clique em “Sincronizar concursos da API”.</td></tr>';return}
 body.innerHTML=rows.map(r=>{const c=r.concurso_snapshot||{};const status=r.status||"detectado";const link=r.instagram_permalink?'<a href="'+safe(r.instagram_permalink)+'" target="_blank" rel="noopener">Ver publicação</a>':(r.erro_ultima_tentativa?'<span class="integration-error">'+safe(r.erro_ultima_tentativa)+'</span>':"Aguardando fluxo de publicação");return '<tr><td>'+new Date(r.detectado_em).toLocaleString("pt-BR")+'</td><td><strong>'+safe(c.orgao||"Órgão não informado")+'</strong><br><span class="meta">'+safe(c.cargo||"Cargo não informado")+(c.uf?" · "+safe(c.uf):"")+'</span></td><td>'+safe(c.vagas??"—")+'</td><td>'+safe(fmtMoney(c.remuneracao))+'</td><td>'+fmtDate(c.inscricoes_fim)+'</td><td><span class="status '+safe(status)+'">'+safe(status.replaceAll("_"," "))+'</span></td><td>'+link+'</td></tr>'}).join("")}
 async function invoke(method){if(typeof supabaseClient==="undefined"||!supabaseClient){throw new Error("Cliente Supabase ainda não inicializado.")}const {data:sessionData,error:sessionError}=await supabaseClient.auth.getSession();if(sessionError)throw sessionError;if(!sessionData.session?.access_token)throw new Error("Entre com a conta administradora do painel.");const {data,error}=await supabaseClient.functions.invoke(fn,{method,body:method==="POST"?{}:undefined});if(error)throw error;if(!data?.ok)throw new Error(data?.error||"Não foi possível consultar o monitor.");return data}
 async function load(){setStatus("Consultando o histórico no Supabase…");try{const d=await invoke("GET");paintStats(d.stats);paintRows(d.concursos);setStatus("Atualizado em "+new Date(d.atualizado_em).toLocaleString("pt-BR")+".")}catch(e){setStatus(e.message||"Falha ao carregar o painel.",true);const body=$("contestMonitorRows");if(body)body.innerHTML='<tr><td colspan="7">'+safe(e.message||"Falha de conexão")+'</td></tr>'}}
 async function sync(){const b=$("syncContestMonitor");if(b)b.disabled=true;setStatus("Consultando a API pública e registrando novos concursos…");try{const d=await invoke("POST");setStatus("Sincronização concluída. Concursos na API: "+d.total_api+".");await load()}catch(e){setStatus(e.message||"Falha na sincronização.",true)}finally{if(b)b.disabled=false}}
 document.addEventListener("DOMContentLoaded",()=>{
  $("refreshContestMonitor")?.addEventListener("click",load);
  $("syncContestMonitor")?.addEventListener("click",sync);
  const waitForClient=()=>{if(typeof supabaseClient==="undefined"||!supabaseClient){setTimeout(waitForClient,150);return}
    supabaseClient.auth.onAuthStateChange((event,session)=>{if(session)load();else{paintStats({});paintRows([]);setStatus("Entre com a conta administradora para consultar o histórico.")}});
    supabaseClient.auth.getSession().then(({data})=>{if(data.session)load()});
  };waitForClient();
 });
 window.addEventListener("supabase-admin-session-ready",load);
})();