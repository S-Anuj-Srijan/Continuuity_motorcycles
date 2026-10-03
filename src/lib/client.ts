import {track,flush,consent,storage,tab,session,ensureSession,activateAnalytics,clearQueue} from './analytics';
import type {EventName} from './events';
const $=<T extends Element=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const variant=document.documentElement.dataset.variant||'camel';
const heroTemplate=$<HTMLTemplateElement>(`template[data-hero-variant="${variant}"]`);
if(heroTemplate)heroTemplate.parentElement!.append(heroTemplate.content.cloneNode(true));
const boardTemplate=$<HTMLTemplateElement>(`template[data-board-variant="${variant}"]`);
if(boardTemplate)boardTemplate.parentElement!.append(boardTemplate.content.cloneNode(true));
document.querySelectorAll<HTMLElement>('[data-product-order]').forEach(grid=>{
  const first=grid.querySelector(`[data-product="c01_${variant}"]`);if(first)grid.prepend(first);
  grid.querySelectorAll<HTMLElement>('.card-label span:first-child').forEach((label,index)=>label.textContent=`0${index+1} / C-01`);
});
const dialogOpen=(dialog:HTMLDialogElement)=>{dialog.showModal();};
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog=>{
  dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
});
$('.menu-button').addEventListener('click',()=>dialogOpen($('#mobile-menu')));
const header=$('.site-header');
const updateHeader=()=>header.classList.toggle('is-scrolled',scrollY>40);
window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();
window.addEventListener('storage',event=>{if(event.key==='continuity-consent')location.reload();});
const banner=$('#consent-banner'),preferences=$<HTMLDialogElement>('#consent-dialog');
banner.hidden=storage.get('continuity-consent')!==null;
function showPreferences(){ $<HTMLInputElement>('#analytics-choice').checked=consent();dialogOpen(preferences); }
document.querySelectorAll('[data-consent-open],[data-consent-manage]').forEach(b=>b.addEventListener('click',showPreferences));
async function setConsent(value:string){
  const hadConsent=consent();storage.set('continuity-consent',value);banner.hidden=true;preferences.close();
  if(value==='denied'){
    clearQueue();storage.remove('continuity-visitor');
    window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied'});
    window.clarity?.('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});
    for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(/^(_ga|_clck|_clsk)/.test(name))document.cookie=`${name}=; Max-Age=0; Path=/`;}
    await ensureSession();if(hadConsent)location.reload();
  }else{await ensureSession();activateAnalytics();startTracking();}
}
document.querySelectorAll<HTMLElement>('[data-consent]').forEach(b=>b.addEventListener('click',()=>void setConsent(b.dataset.consent!)));
$('#save-consent').addEventListener('click',()=>void setConsent($<HTMLInputElement>('#analytics-choice').checked?'accepted':'denied'));
const viewer=$<HTMLDialogElement>('#image-viewer'),viewerImage=$<HTMLImageElement>('#viewer-image'),stage=$('#viewer-stage');
let zoom=1,assetId='',viewerActive=0,lastTick=performance.now(),lastInput=Date.now();
function setZoom(next:number){zoom=Math.min(4,Math.max(1,next));viewerImage.style.width=`${zoom*100}%`;track('asset_zoom',{asset_id:assetId,value_num:zoom});}
document.querySelectorAll<HTMLElement>('[data-asset]').forEach(button=>button.addEventListener('click',()=>{
  assetId=button.dataset.asset!;viewerImage.src=button.dataset.src!;viewerImage.alt=button.dataset.alt!;zoom=1;viewerActive=0;viewerImage.style.width='100%';$('#viewer-title').textContent=assetId.replaceAll('_',' ');dialogOpen(viewer);track('asset_open',{asset_id:assetId,product_id:`c01_${assetId.split('_')[0]}`});
}));
viewer.addEventListener('close',()=>{track('viewer_active_ms',{asset_id:assetId,elapsed_ms:Math.round(viewerActive)});viewerImage.removeAttribute('src');});
document.querySelectorAll<HTMLElement>('[data-zoom]').forEach(b=>b.addEventListener('click',()=>setZoom(b.dataset.zoom==='in'?zoom+.5:b.dataset.zoom==='out'?zoom-.5:1)));
viewer.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')setZoom(zoom+.5);if(e.key==='-')setZoom(zoom-.5);});
let drag:{x:number;y:number;left:number;top:number}|null=null;
stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&zoom>1){drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);e.preventDefault();}});
stage.addEventListener('pointermove',e=>{if(drag){stage.scrollLeft=drag.left-e.clientX+drag.x;stage.scrollTop=drag.top-e.clientY+drag.y;}});
stage.addEventListener('pointerup',()=>{drag=null;});
let pinchDistance=0,pinchZoom=1;
stage.addEventListener('touchstart',e=>{if(e.touches.length===2){pinchDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);pinchZoom=zoom;}},{passive:true});
stage.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinchDistance){e.preventDefault();zoom=Math.min(4,Math.max(1,pinchZoom*Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)/pinchDistance));viewerImage.style.width=`${zoom*100}%`;}},{passive:false});
stage.addEventListener('touchend',()=>{if(pinchDistance){track('asset_zoom',{asset_id:assetId,value_num:zoom});pinchDistance=0;}});
document.querySelectorAll<HTMLAnchorElement>('[data-track]').forEach(link=>link.addEventListener('click',()=>{track(link.dataset.track as EventName,{product_id:link.closest<HTMLElement>('[data-product]')?.dataset.product||undefined,metadata:link.dataset.destination?{destination:link.dataset.destination}:undefined});void flush(true);}));
document.querySelectorAll<HTMLDetailsElement>('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)track('spec_expand',{section_id:'faq'});}));
document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',async()=>{try{const url=location.origin+location.pathname;if(navigator.share)await navigator.share({title:document.title,url});else{await navigator.clipboard.writeText(url);button.textContent='Link copied';}track('share_click');}catch{button.textContent='Share unavailable — copy the page address';}}));
const watched=new Map<HTMLElement,{visible:boolean;viewed:boolean;ms:number}>();
let trackingStarted=false,maxScroll=0,productActive=0;
function emitSection(el:HTMLElement,state:{ms:number}){if(state.ms>0){track('section_engagement',{section_id:el.dataset.section,product_id:el.dataset.product||undefined,elapsed_ms:Math.round(state.ms)});state.ms=0;}}
function startTracking(){
  if(trackingStarted||!consent())return;trackingStarted=true;
  if(session&&tab.get('continuity-started')!==session.session_id){track('session_start');tab.set('continuity-started',session.session_id);}
  if(document.body.dataset.product)track('product_view');
  if(location.pathname==='/')track('hero_impression',{product_id:`c01_${variant}`,asset_id:`${variant}_poster_hangar`});
  if(location.pathname==='/engineering')track('engineering_page_view');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const el=entry.target as HTMLElement,state=watched.get(el)!;state.visible=entry.isIntersecting;if(state.visible&&!state.viewed){state.viewed=true;track(el.dataset.section==='product-card'?'product_card_impression':el.dataset.section==='early-access'?'early_access_impression':'section_view',{section_id:el.dataset.section,product_id:el.dataset.product||undefined});}if(!state.visible)emitSection(el,state);}},{threshold:[0,.01,.5]});
  document.querySelectorAll<HTMLElement>('[data-section]').forEach(el=>{watched.set(el,{visible:false,viewed:false,ms:0});observer.observe(el);});
}
for(const name of ['pointerdown','keydown','scroll','touchstart'])window.addEventListener(name,()=>{lastInput=Date.now();},{passive:true});
setInterval(()=>{
  const now=performance.now(),delta=Math.min(1500,now-lastTick);lastTick=now;
  if(document.hidden||Date.now()-lastInput>30000||!consent())return;
  if(viewer.open){viewerActive+=delta;return;}
  if(document.body.dataset.product)productActive+=delta;
  maxScroll=Math.max(maxScroll,Math.min(100,(scrollY+innerHeight)/document.documentElement.scrollHeight*100));
  for(const [el,state] of watched){if(!state.visible)continue;const rect=el.getBoundingClientRect(),visible=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));if(visible/Math.min(rect.height,innerHeight)>=.5)state.ms+=delta;}
},1000);
function summarize(){for(const [el,state] of watched)emitSection(el,state);if(document.body.dataset.product){track('scroll_summary',{value_num:maxScroll});track('session_summary',{elapsed_ms:Math.round(productActive)});productActive=0;}void flush(true);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)summarize();else lastTick=performance.now();});
window.addEventListener('pagehide',summarize);
setInterval(()=>{for(const [el,state] of watched)emitSection(el,state);void flush();},15000);
void ensureSession().then(()=>{activateAnalytics();startTracking();});
const form=$<HTMLFormElement>('#lead-form');
if(form){
  let token='',widget:string|undefined,formStarted=false;
  const status=$('#form-status'),email=$<HTMLInputElement>('#email'),submit=form.querySelector<HTMLButtonElement>('[type=submit]')!;
  form.addEventListener('focusin',()=>{if(!formStarted){formStarted=true;track('lead_form_start');}});
  email.addEventListener('invalid',()=>{status.textContent='Enter a valid email address.';email.setAttribute('aria-invalid','true');track('lead_form_error',{metadata:{error_code:'invalid_email'}});});
  email.addEventListener('input',()=>email.removeAttribute('aria-invalid'));
  if(form.dataset.sitekey){
    const load=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;load.disconnect();const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{widget=window.turnstile?.render('#turnstile-widget',{sitekey:form.dataset.sitekey,theme:'dark',action:'early_access',callback:(value:string)=>{token=value;},'expired-callback':()=>{token='';},'error-callback':()=>{token='';status.textContent='Security verification could not load. Please try again.';}});};script.onerror=()=>{status.textContent='Security verification could not load. Please check your connection.';};document.head.append(script);},{rootMargin:'300px'});load.observe(form);
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    if(!token){status.textContent='Please complete the security verification.';track('lead_form_error',{metadata:{error_code:'verification_required'}});return;}
    submit.disabled=true;status.textContent='Joining…';
    try{await ensureSession();const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.value,turnstile_token:token,marketing_consent:true,product_id:document.body.dataset.product||null})});if(!response.ok)throw new Error('submission_failed');status.textContent="You're on the list. We'll write when there is something worth showing.";track('lead_submit');email.value='';void flush();}catch{status.textContent='Something went wrong. Please try again.';track('lead_form_error',{metadata:{error_code:'server_error'}});}finally{submit.disabled=false;token='';window.turnstile?.reset(widget);}
  });
}
