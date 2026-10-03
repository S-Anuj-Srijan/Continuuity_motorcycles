import type {ClientEvent,EventName} from './events';
declare global { interface Window { dataLayer:unknown[];gtag?:(...args:unknown[])=>void;clarity?:((...args:unknown[])=>void)&{q?:unknown[][]};turnstile?:{render:(container:string,options:Record<string,unknown>)=>string;reset:(id?:string)=>void}; } }
export const storage={get(key:string){try{return localStorage.getItem(key);}catch{return null;}},set(key:string,value:string){try{localStorage.setItem(key,value);}catch{}},remove(key:string){try{localStorage.removeItem(key);}catch{}}};
export const tab={get(key:string){try{return sessionStorage.getItem(key);}catch{return null;}},set(key:string,value:string){try{sessionStorage.setItem(key,value);}catch{}}};
export const consent=()=>storage.get('continuity-consent')==='accepted';
export let session:Record<string,any>|null=null;
let queue:ClientEvent[]=[];
let sequence=Number(tab.get('continuity-seq')||'0');
let pending:Promise<void>|null=null;
let inFlight=false;
let recordedConsent:boolean|null=null;
export async function ensureSession(){
  const requestedConsent=consent();
  if(pending){await pending;if(recordedConsent!==requestedConsent)return ensureSession();return;}
  pending=(async()=>{
    const assignment=JSON.parse(tab.get('continuity-assignment')||'null')||{variant:document.documentElement.dataset.variant||'camel',method:'randomized',landing:location.pathname};
    let visitor=storage.get('continuity-visitor');
    if(consent()&&!visitor){visitor=crypto.randomUUID();storage.set('continuity-visitor',visitor);}
    const q=new URLSearchParams(location.search);
    if(q.get('test')==='1')tab.set('continuity-test','1');
    const utms=Object.fromEntries(['source','medium','campaign','content','term'].map(k=>[`utm_${k}`,q.get(`utm_${k}`)]));
    if(!tab.get('continuity-context'))tab.set('continuity-context',JSON.stringify({...utms,referrer:document.referrer?new URL(document.referrer).hostname:null}));
    const context=JSON.parse(tab.get('continuity-context')||'{}');
    const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({variant:assignment.variant,landing_path:assignment.landing.replace(/\/$/,'')||'/',consent:consent()?'accepted':'denied',visitor_id:consent()?visitor:null,viewport_width:innerWidth,viewport_height:innerHeight,is_test_traffic:tab.get('continuity-test')==='1',...context})});
    if(!response.ok)throw new Error('session unavailable');
    session=await response.json();
    recordedConsent=requestedConsent;
    tab.set('continuity-assignment',JSON.stringify({...assignment,variant:session!.variant,method:session!.assignment_method}));
  })().catch(()=>{session=null;}).finally(()=>{pending=null;});
  return pending;
}
function context(){return {product_id:document.body.dataset.product||undefined,experiment_id:'c01_direction_v1',variant_id:session?.variant||document.documentElement.dataset.variant,entry_product:session?.entry_product_id||'none'};}
export function track(name:EventName,payload:Partial<ClientEvent>={}){
  if(!consent())return;
  sequence++;tab.set('continuity-seq',String(sequence));
  queue.push({...payload,event_id:crypto.randomUUID(),event_name:name,occurred_at:new Date().toISOString(),client_seq:sequence,page_path:document.body.dataset.page||location.pathname,product_id:payload.product_id||document.body.dataset.product||undefined});
  if(queue.length>100)queue=queue.slice(-100);
  const gaName=name==='product_view'?'view_item':name==='product_card_click'||name==='variant_switch'?'select_item':name==='lead_submit'?'generate_lead':null;
  if(gaName)window.gtag?.('event',gaName,{...context(),...(payload.product_id?{items:[{item_id:payload.product_id,item_category:'Electric motorcycle concept'}]}:{})});
  if(['variant_switch','technical_hotspot_open','asset_open','cta_click','lead_submit'].includes(name))window.clarity?.('event',name);
  if(queue.length>=20)void flush();
}
export async function flush(exit=false){
  if(!consent()||!queue.length||inFlight)return;
  if(!session){if(exit)return;await ensureSession();if(!session)return;}
  inFlight=true;
  const batch=queue.splice(0,25),body=JSON.stringify({events:batch});
  if(exit&&navigator.sendBeacon('/api/events',new Blob([body],{type:'application/json'}))){inFlight=false;return;}
  try{const response=await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true});if(!response.ok&&response.status>=500)queue.unshift(...batch);}catch{queue.unshift(...batch);}finally{inFlight=false;}
}
export function clearQueue(){queue=[];}
let analyticsLoaded=false;
export function activateAnalytics(){
  if(!consent()||analyticsLoaded)return;
  analyticsLoaded=true;
  const add=(src:string)=>{const script=document.createElement('script');script.async=true;script.src=src;document.head.append(script);};
  const ga=document.body.dataset.ga,clarity=document.body.dataset.clarity;
  if(ga&&/^G-[A-Z0-9]+$/.test(ga)){
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    const safeLocation=location.origin+location.pathname;
    const acquisition=JSON.parse(tab.get('continuity-context')||'{}');
    const campaignFields=Object.fromEntries(['source','medium','campaign','content','term'].flatMap(k=>{const value=acquisition[`utm_${k}`];return typeof value==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(value)?[[`campaign_${k==='campaign'?'name':k}`,value]]:[];}));
    window.gtag('config',ga,{...context(),...campaignFields,page_location:safeLocation,page_referrer:document.referrer?new URL(document.referrer).origin:'',allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true});
    add(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`);
  }
  if(clarity&&/^[a-z0-9]+$/i.test(clarity)){
    const stub:NonNullable<Window['clarity']>=(...args)=>{(stub.q ||= []).push(args);};
    window.clarity=window.clarity||stub;
    window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
    for(const [key,value] of Object.entries(context()))if(value)window.clarity('set',key,value);
    window.clarity('set','entry_source',session?.utm_source||'direct');
    add(`https://www.clarity.ms/tag/${clarity}`);
  }
}
