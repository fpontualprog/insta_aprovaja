(()=>{"use strict";
const $=id=>document.getElementById(id);
const KEY="aprovaja-campaign-tracker-v1";
const links={
 campPlatformLink:"https://aprovajaconcurso.netlify.app/?utm_source=email&utm_medium=email&utm_campaign=apresentacao_aprovaja&utm_content=plataforma",
 campInstagramLink:"https://www.instagram.com/aprovaja_seuconcurso/?utm_source=email&utm_medium=email&utm_campaign=apresentacao_aprovaja&utm_content=instagram",
 campWhatsappLink:"https://whatsapp.com/channel/0029Vb6Ol6y9xVJZ2RZYVh0p?utm_source=email&utm_medium=email&utm_campaign=apresentacao_aprovaja&utm_content=whatsapp"
};
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function showWorkspace(which){
 document.querySelectorAll("[data-workspace-tab]").forEach(b=>{const active=b.dataset.workspaceTab===which;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active))});
 const instagram=$("instagramWorkspace"),campaign=$("campaignWorkspace");
 if(instagram)instagram.hidden=which!=="instagram";
 if(campaign)campaign.hidden=which!=="campaign";
 try{sessionStorage.setItem("aprovaja-active-workspace",which)}catch{}
}
function setVal(id,v){if($(id)&&v!==undefined&&v!==null)$(id).value=v}
function refreshMetrics(){
 $("campSent").textContent=String(Number($("campSentInput").value)||0);
 $("campPlatformClicks").textContent="—";
 $("campChannelClicks").textContent="—";
}
function save(){
 const data={name:$("campName").value,date:$("campDate").value,audience:$("campAudience").value,sent:$("campSentInput").value,delivered:$("campDelivered").value,opened:$("campOpened").value,clicked:$("campClicked").value,savedAt:new Date().toISOString()};
 try{localStorage.setItem(KEY,JSON.stringify(data));$("campStatus").textContent="Acompanhamento salvo neste navegador em "+new Date().toLocaleString("pt-BR")+". Os indicadores dependem dos dados informados.";refreshMetrics()}catch{$("campStatus").textContent="Não foi possível salvar neste navegador."}
}
document.querySelectorAll("[data-workspace-tab]").forEach(b=>b.addEventListener("click",()=>showWorkspace(b.dataset.workspaceTab)));
Object.entries(links).forEach(([id,url])=>{if($(id))$(id).value=url});
const today=new Date();if($("campDate"))$("campDate").value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
const saved=load();["campName","campDate","campAudience","campSentInput","campDelivered","campOpened","campClicked"].forEach(id=>setVal(id,saved[({campName:"name",campDate:"date",campAudience:"audience",campSentInput:"sent",campDelivered:"delivered",campOpened:"opened",campClicked:"clicked"})[id]]));
$("campSave")?.addEventListener("click",save);
$("campReset")?.addEventListener("click",()=>{["campSentInput","campDelivered","campOpened","campClicked"].forEach(id=>$(id).value="0");$("campStatus").textContent="Métricas zeradas no formulário; clique em Salvar acompanhamento para gravar.";refreshMetrics()});
["campSentInput"].forEach(id=>$(id)?.addEventListener("input",refreshMetrics));
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{const field=$(b.dataset.copy);try{await navigator.clipboard.writeText(field.value);b.textContent="Copiado";setTimeout(()=>b.textContent="Copiar link "+(b.dataset.copy==="campPlatformLink"?"da plataforma":b.dataset.copy==="campInstagramLink"?"do Instagram":"do WhatsApp"),1600)}catch{$(b.dataset.copy).select();$("campStatus").textContent="Selecione e copie o link manualmente (Ctrl+C)."}}));
refreshMetrics();let initial="instagram";try{const v=sessionStorage.getItem("aprovaja-active-workspace");if(v==="campaign"||v==="instagram")initial=v}catch{}showWorkspace(initial);
})();