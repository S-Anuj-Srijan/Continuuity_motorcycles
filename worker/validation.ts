import {EVENT_NAMES,products,sections,assetIds,type ClientEvent} from '../src/lib/events';
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
export const validPath=(v:unknown):v is string=>typeof v==='string'&&/^\/(?:c-01(?:\/(?:camel|messerschmitt))?|engineering|design|development|about|privacy|terms|journal(?:\/(?:what-is-a-retro-electric-motorcycle|what-makes-an-electric-cafe-racer|can-electric-motorcycles-feel-mechanical|visible-electric-motorcycle-powertrain|how-electric-motorcycle-powertrain-works))?)?$/.test(v);
export function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))throw new HttpError(400,'Expected an object');return value as Record<string,unknown>;}
export function keys(value:Record<string,unknown>,allowed:string[]){if(Object.keys(value).some(k=>!allowed.includes(k)))throw new HttpError(400,'Unexpected field');}
export async function body(request:Request,max=32768){
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'JSON required');
  if(Number(request.headers.get('content-length')||0)>max)throw new HttpError(413,'Payload too large');
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Body required');
  let length=0,text='';const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new HttpError(413,'Payload too large');}text+=decoder.decode(value,{stream:true});}
  try{return object(JSON.parse(text+decoder.decode()));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Invalid JSON');}
}
export function validateEvents(input:unknown):ClientEvent[]{
  if(!Array.isArray(input)||!input.length||input.length>25)throw new HttpError(400,'Send 1 to 25 events');
  return input.map(value=>{
    const e=object(value);keys(e,['event_id','event_name','occurred_at','client_seq','product_id','page_path','section_id','asset_id','elapsed_ms','value_num','metadata']);
    if(!uuid(e.event_id)||!EVENT_NAMES.includes(e.event_name as never)||!validPath(e.page_path)||typeof e.occurred_at!=='string'||!Number.isFinite(Date.parse(e.occurred_at))||Math.abs(Date.now()-Date.parse(e.occurred_at))>86400000||!Number.isSafeInteger(e.client_seq)||Number(e.client_seq)<1)throw new HttpError(400,'Invalid event');
    if(e.product_id!==undefined&&!products.includes(e.product_id as never))throw new HttpError(400,'Invalid product');
    if(e.section_id!==undefined&&!sections.includes(e.section_id as never))throw new HttpError(400,'Invalid section');
    if(e.asset_id!==undefined&&!assetIds.includes(String(e.asset_id)))throw new HttpError(400,'Invalid asset');
    if(e.elapsed_ms!==undefined&&(!Number.isSafeInteger(e.elapsed_ms)||Number(e.elapsed_ms)<0||Number(e.elapsed_ms)>3600000))throw new HttpError(400,'Invalid duration');
    if(e.value_num!==undefined&&(typeof e.value_num!=='number'||!Number.isFinite(e.value_num)||e.value_num<0||e.value_num>100))throw new HttpError(400,'Invalid value');
    if(e.metadata!==undefined){const m=object(e.metadata);keys(m,['destination','error_code']);if(m.destination!==undefined&&!products.includes(m.destination as never))throw new HttpError(400,'Invalid destination');if(m.error_code!==undefined&&!['invalid_email','verification_required','server_error'].includes(String(m.error_code)))throw new HttpError(400,'Invalid error code');}
    return e as unknown as ClientEvent;
  });
}
export const campaign=(v:unknown)=>typeof v==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(v)?v:null;
export function validateLead(value:Record<string,unknown>){
  keys(value,['email','turnstile_token','marketing_consent','product_id']);
  if(typeof value.email!=='string'||value.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()))throw new HttpError(400,'Enter a valid email address');
  if(typeof value.turnstile_token!=='string'||!value.turnstile_token||value.turnstile_token.length>2048)throw new HttpError(400,'Security verification required');
  if(value.marketing_consent!==true)throw new HttpError(400,'Update consent required');
  if(value.product_id!=null&&!products.includes(value.product_id as never))throw new HttpError(400,'Invalid product');
  return {email:value.email.trim().toLowerCase(),token:value.turnstile_token,product:value.product_id as string|null||null};
}
