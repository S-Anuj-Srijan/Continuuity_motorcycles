import {body,keys,uuid,validPath,validateEvents,validateLead,campaign,HttpError} from './validation';
export interface Env {DB:D1Database;ASSETS:Fetcher;TURNSTILE_SECRET_KEY?:string;TURNSTILE_HOSTNAME?:string;API_LIMITER:RateLimit;LEAD_LIMITER:RateLimit;}
interface Session {session_id:string;visitor_id:string|null;assigned_variant_id:string;assignment_method:string;analytics_consent:string;entry_product_id:string|null;utm_source:string|null;experiment_version:string;}
const json=(data:unknown,status=200,headers:HeadersInit={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff',...headers}});
async function getSession(request:Request,env:Env){const id=request.headers.get('cookie')?.match(/(?:^|;\s*)cm_session=([^;]+)/)?.[1];if(!uuid(id))return null;return env.DB.prepare('SELECT * FROM sessions WHERE session_id=?').bind(id).first<Session>();}
function publicSession(s:Session){return {session_id:s.session_id,variant:s.assigned_variant_id.endsWith('_messerschmitt')?'messerschmitt':'camel',assignment_method:s.assignment_method,experiment_id:'c01_direction_v1',experiment_version:s.experiment_version,entry_product_id:s.entry_product_id,utm_source:s.utm_source};}
async function sessionRoute(request:Request,env:Env){
  const data=await body(request,8192);keys(data,['variant','landing_path','consent','visitor_id','viewport_width','viewport_height','is_test_traffic','referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term']);
  if(!validPath(data.landing_path)||!['accepted','denied'].includes(String(data.consent))||!['camel','messerschmitt'].includes(String(data.variant)))throw new HttpError(400,'Invalid session context');
  if(data.visitor_id!=null&&!uuid(data.visitor_id))throw new HttpError(400,'Invalid visitor');
  for(const size of [data.viewport_width,data.viewport_height])if(size!=null&&(!Number.isInteger(size)||Number(size)<0||Number(size)>20000))throw new HttpError(400,'Invalid viewport');
  const now=new Date().toISOString(),accepted=data.consent==='accepted',visitor=accepted&&uuid(data.visitor_id)?data.visitor_id:null;
  const existing=await getSession(request,env);
  const statements:D1PreparedStatement[]=[];
  if(visitor)statements.push(env.DB.prepare('INSERT INTO visitors(visitor_id,first_seen_at,last_seen_at,analytics_consent,consent_updated_at) VALUES(?,?,?,?,?) ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at=excluded.last_seen_at, analytics_consent=excluded.analytics_consent,consent_updated_at=excluded.consent_updated_at').bind(visitor,now,now,data.consent,now));
  if(existing){
    statements.push(env.DB.prepare('UPDATE sessions SET analytics_consent=?,visitor_id=?,last_activity_at=?,utm_source=COALESCE(utm_source,?),utm_medium=COALESCE(utm_medium,?),utm_campaign=COALESCE(utm_campaign,?),utm_content=COALESCE(utm_content,?),utm_term=COALESCE(utm_term,?),viewport_width=COALESCE(viewport_width,?),viewport_height=COALESCE(viewport_height,?) WHERE session_id=?').bind(data.consent,visitor,now,...['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k=>accepted?campaign(data[k]):null),accepted?data.viewport_width??null:null,accepted?data.viewport_height??null:null,existing.session_id));
    if(!accepted&&existing.visitor_id)statements.push(env.DB.prepare('UPDATE visitors SET analytics_consent=?,consent_updated_at=? WHERE visitor_id=?').bind('denied',now,existing.visitor_id));
    await env.DB.batch(statements);
    return json(publicSession(existing));
  }
  const direct=data.landing_path.match(/^\/c-01\/(camel|messerschmitt)$/)?.[1];
  const variant=direct||String(data.variant),method=direct?'direct_campaign':'randomized',id=crypto.randomUUID();
  const referrer=accepted&&typeof data.referrer==='string'&&/^(?:[a-z0-9-]+\.)+[a-z]{2,24}$/i.test(data.referrer)&&data.referrer.length<200?data.referrer:null;
  statements.push(env.DB.prepare(`INSERT INTO sessions(session_id,visitor_id,experiment_id,assigned_variant_id,assignment_method,experiment_version,started_at,last_activity_at,landing_path,entry_product_id,referrer_domain,utm_source,utm_medium,utm_campaign,utm_content,utm_term,viewport_width,viewport_height,device_type,analytics_consent,is_test_traffic) VALUES(?,?,'c01_direction_v1',?,?,'1',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,visitor,`c01_direction_v1_${variant}`,method,now,now,data.landing_path,direct?`c01_${direct}`:null,referrer,...['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k=>accepted?campaign(data[k]):null),accepted?data.viewport_width??null:null,accepted?data.viewport_height??null:null,accepted?(Number(data.viewport_width)<768?'mobile':'desktop'):null,data.consent,data.is_test_traffic===true?1:0));
  await env.DB.batch(statements);
  const headers=new Headers({'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'});
  const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
  headers.append('Set-Cookie',`cm_session=${id}; Path=/; HttpOnly; SameSite=Strict${secure}`);
  headers.append('Set-Cookie',`cm_variant=${variant}; Path=/; SameSite=Strict${secure}`);
  return new Response(JSON.stringify({session_id:id,variant,assignment_method:method,experiment_id:'c01_direction_v1',experiment_version:'1',entry_product_id:direct?`c01_${direct}`:null,utm_source:accepted?campaign(data.utm_source):null}),{headers});
}
async function eventRoute(request:Request,env:Env){
  const data=await body(request);keys(data,['events']);const events=validateEvents(data.events);
  const session=await getSession(request,env);if(!session)throw new HttpError(401,'Session required');if(session.analytics_consent!=='accepted')throw new HttpError(403,'Analytics consent required');
  const statements=events.map(e=>env.DB.prepare(`INSERT OR IGNORE INTO events(event_id,session_id,visitor_id,event_name,occurred_at,client_seq,experiment_id,variant_id,experiment_version,product_id,page_path,section_id,asset_id,elapsed_ms,value_num,metadata_json) VALUES(?,?,?,?,?,?,'c01_direction_v1',?,?,?,?,?,?,?,?,?)`).bind(e.event_id,session.session_id,session.visitor_id,e.event_name,e.occurred_at,e.client_seq,session.assigned_variant_id,session.experiment_version,e.product_id??null,e.page_path,e.section_id??null,e.asset_id??null,e.elapsed_ms??null,e.value_num??null,JSON.stringify(e.metadata||{})));
  statements.push(env.DB.prepare('UPDATE sessions SET last_activity_at=? WHERE session_id=?').bind(new Date().toISOString(),session.session_id));
  await env.DB.batch(statements);return json({accepted:events.length});
}
async function leadRoute(request:Request,env:Env){
  const lead=validateLead(await body(request,8192));
  const session=await getSession(request,env);if(!session)throw new HttpError(401,'Session required');
  if(!env.TURNSTILE_SECRET_KEY)throw new HttpError(503,'Registration is not configured');
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:lead.token}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new HttpError(502,'Security verification unavailable');
  const verified=await response.json<{success:boolean;hostname?:string;action?:string}>();
  if(!verified.success||verified.hostname!==(env.TURNSTILE_HOSTNAME||new URL(request.url).hostname)||verified.action!=='early_access')throw new HttpError(400,'Security verification failed');
  const id=crypto.randomUUID(),conversion=crypto.randomUUID(),now=new Date().toISOString();
  // D1 batch is transactional. The conversion SELECT matches only the newly inserted ID;
  // duplicate emails cannot create a second conversion or reveal registration status.
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO leads(lead_id,session_id,product_id,experiment_id,variant_id,email,email_normalized,marketing_consent,analytics_consent,created_at) VALUES(?,?,?,'c01_direction_v1',?,?,?,1,?,?)`).bind(id,session.session_id,lead.product,session.assigned_variant_id,lead.email,lead.email,session.analytics_consent,now),
    env.DB.prepare(`INSERT INTO conversions(conversion_id,session_id,lead_id,product_id,experiment_id,variant_id,conversion_type,occurred_at) SELECT ?,session_id,lead_id,product_id,experiment_id,variant_id,'early_access',? FROM leads WHERE lead_id=?`).bind(conversion,now,id)
  ]);
  return json({ok:true});
}
export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
    try{
      if(!['/api/session','/api/events','/api/lead','/api/experiment'].includes(url.pathname))throw new HttpError(404,'Not found');
      if(request.method!==(url.pathname==='/api/experiment'?'GET':'POST'))return json({error:'Method not allowed'},405,{Allow:url.pathname==='/api/experiment'?'GET':'POST'});
      if(request.method==='POST'&&request.headers.get('origin')!==url.origin)throw new HttpError(403,'Same-origin requests required');
      if(!env.DB)throw new HttpError(503,'Service is not configured');
      const key=request.headers.get('CF-Connecting-IP')||'local';
      const limiter=url.pathname==='/api/lead'?env.LEAD_LIMITER:env.API_LIMITER;
      if(!limiter)throw new HttpError(503,'Abuse protection is not configured');
      if(!(await limiter.limit({key})).success)return json({error:'Please try again shortly'},429,{'Retry-After':'60'});
      if(url.pathname==='/api/session')return await sessionRoute(request,env);
      if(url.pathname==='/api/events')return await eventRoute(request,env);
      if(url.pathname==='/api/lead')return await leadRoute(request,env);
      const session=await getSession(request,env);if(!session)throw new HttpError(401,'Session required');return json(publicSession(session));
    }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);return json({error:'Service temporarily unavailable'},503);}
  }
};
