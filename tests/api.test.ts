import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index';
import {validateEvents} from '../worker/validation';

function harness(){
 const db=new DatabaseSync(':memory:');
 for(const file of readdirSync('migrations').sort())db.exec(readFileSync(`migrations/${file}`,'utf8'));
 const prepare=(sql:string)=>{
  let bindings:any[]=[];
  const statement={bind(...values:any[]){bindings=values;return statement;},async first(){return db.prepare(sql).get(...bindings)||null;},async run(){return db.prepare(sql).run(...bindings);},sql,values:()=>bindings};return statement;
 };
 const env:any={DB:{prepare,async batch(statements:any[]){db.exec('BEGIN');try{const out=statements.map(s=>db.prepare(s.sql).run(...s.values()));db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}},API_LIMITER:{limit:async()=>({success:true})},LEAD_LIMITER:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('asset')}};
 let cookie='';
 const request=async(path:string,payload?:unknown,origin='https://test.example')=>{
  const response=await worker.fetch(new Request(`https://test.example${path}`,{method:payload===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:payload===undefined?undefined:JSON.stringify(payload)}),env);
  const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return response;
 };
 return {db,env,request};
}
const session={variant:'camel',landing_path:'/',consent:'accepted',viewport_width:1400,viewport_height:900};
const event=(name='product_view',extra={})=>({event_id:crypto.randomUUID(),event_name:name,occurred_at:new Date().toISOString(),client_seq:1,product_id:'c01_camel',page_path:'/c-01/camel',...extra});

test('session persists assignment and treats direct entry separately',async()=>{
 const {request,db}=harness();
 const first=await request('/api/session',session);assert.equal(first.status,200);const one=await first.json() as any;
 const next=await request('/api/session',{...session,variant:'messerschmitt',landing_path:'/c-01/messerschmitt'});assert.equal((await next.json() as any).variant,'camel');
 assert.equal((await (await request('/api/experiment')).json() as any).session_id,one.session_id);
 assert.equal((db.prepare('SELECT COUNT(*) AS n FROM sessions').get() as any).n,1);
 const direct=harness();const response=await direct.request('/api/session',{...session,landing_path:'/c-01/messerschmitt'});const data=await response.json() as any;assert.equal(data.variant,'messerschmitt');assert.equal(data.assignment_method,'direct_campaign');
});
test('event retries do not inflate rollups; switch-back and exposure order are retained',async()=>{
 const {request,db}=harness();await request('/api/session',session);
 const events=[event(),event('section_engagement',{section_id:'engineering',elapsed_ms:18000}),event('session_summary',{elapsed_ms:21000}),event('scroll_summary',{value_num:75}),event('variant_switch',{metadata:{destination:'c01_messerschmitt'}}),event('product_view',{product_id:'c01_messerschmitt',page_path:'/c-01/messerschmitt'}),event('product_view')];
 assert.equal((await request('/api/events',{events})).status,200);assert.equal((await request('/api/events',{events})).status,200);
 const row=db.prepare("SELECT * FROM session_product_summary WHERE product_id='c01_camel'").get() as any;
 assert.equal(row.engineering_active_ms,18000);assert.equal(row.product_active_ms,21000);assert.equal(row.returned_after_switch,1);assert.equal(row.max_scroll_pct,75);
 assert.equal((db.prepare('SELECT COUNT(*) AS n FROM events').get() as any).n,7);
 assert.equal((db.prepare('SELECT exposure_order_json FROM sessions').get() as any).exposure_order_json,'["c01_camel","c01_messerschmitt"]');
});
test('consent denial blocks events and persistent visitor IDs',async()=>{
 const {request,db}=harness();await request('/api/session',{...session,consent:'denied',visitor_id:crypto.randomUUID()});
 assert.equal((await request('/api/events',{events:[event()]})).status,403);
 assert.equal((db.prepare('SELECT COUNT(*) AS n FROM visitors').get() as any).n,0);
});
test('PII, unknown names, oversized batches, cross-origin and malformed values are rejected',async()=>{
 assert.throws(()=>validateEvents([event('asset_open',{metadata:{email:'person@example.com'}})]));
 assert.throws(()=>validateEvents([event('made_up')]));assert.throws(()=>validateEvents(Array.from({length:26},()=>event())));
 assert.throws(()=>validateEvents([event('section_engagement',{section_id:'person@example.com'})]));
 assert.throws(()=>validateEvents([event('scroll_summary',{value_num:101})]));
 const {request}=harness();assert.equal((await request('/api/session',session,'https://evil.example')).status,403);
 assert.equal((await request('/api/unknown',{})).status,404);
});
test('lead requires configured verified Turnstile; duplicate leads create one conversion',async()=>{
 const {request,env,db}=harness();await request('/api/session',session);
 const lead={email:' Rider@Example.com ',turnstile_token:'test-token',marketing_consent:true,product_id:'c01_camel'};
 assert.equal((await request('/api/lead',lead)).status,503);
 env.TURNSTILE_SECRET_KEY='unit-test-secret';
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(JSON.stringify({success:false}));assert.equal((await request('/api/lead',lead)).status,400);
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:'evil.example',action:'early_access'}));assert.equal((await request('/api/lead',lead)).status,400);
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:'test.example',action:'early_access'}));
  assert.equal((await request('/api/lead',lead)).status,200);assert.equal((await request('/api/lead',lead)).status,200);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM conversions').get() as any).n,1);
  assert.equal((db.prepare('SELECT email_normalized FROM leads').get() as any).email_normalized,'rider@example.com');
  assert.equal((db.prepare('SELECT lead_submitted FROM session_product_summary').get() as any).lead_submitted,1);
 }finally{globalThis.fetch=original;}
});
test('abuse guard blocks excessive requests',async()=>{const {env,request}=harness();env.API_LIMITER.limit=async()=>({success:false});assert.equal((await request('/api/session',session)).status,429);});

test('conversion failure rolls back the lead rather than leaving partial registration',async()=>{
 const {request,env,db}=harness();await request('/api/session',session);env.TURNSTILE_SECRET_KEY='unit-test-secret';
 db.exec("CREATE TRIGGER fail_conversion BEFORE INSERT ON conversions BEGIN SELECT RAISE(ABORT,'test transaction'); END;");
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:'test.example',action:'early_access'}));const response=await request('/api/lead',{email:'rider@example.com',turnstile_token:'test-token',marketing_consent:true});assert.equal(response.status,503);assert.equal((db.prepare('SELECT COUNT(*) AS n FROM leads').get() as any).n,0);}finally{globalThis.fetch=original;}
});
