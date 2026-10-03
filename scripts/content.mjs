import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
const source = readFileSync('website_struct/continuity_website_content_master.txt', 'utf8').replace(/\r/g, '');
const chunks = source.split(/={20,}\n/);
const pages = [];
const fieldNames = ['SEO title','Meta description','Eyebrow','H1','Descriptor','Heading','Body','Opening','Core copy','Primary CTA','Secondary CTA','CTA','CTAs','Camel','Messerschmitt','Camel card','Messerschmitt card','Visual'];
function fields(text) {
  const result = {};
  const re = new RegExp('^(' + fieldNames.join('|') + '):\\n', 'gm');
  const matches = [...text.matchAll(re)];
  matches.forEach((m,i) => { result[m[1]] = text.slice(m.index + m[0].length, matches[i+1]?.index ?? text.length).trim(); });
  return result;
}
for (let i=0; i<chunks.length; i++) {
  const route = chunks[i].match(/^URL: (.+)$/m)?.[1];
  if (!route) continue;
  let text = chunks[i+1]?.trim() || '';
  const isArticle = route.startsWith('/journal/');
  const isLegal = ['/privacy','/terms'].includes(route);
  const faqAt = text.search(/^[A-Z0-9 -]+ FAQ\n/m);
  const faq = faqAt < 0 ? [] : text.slice(faqAt).split('\n\n').slice(1).filter(Boolean).map(p => { const [q,...a] = p.split('\n'); return {q,a:a.join('\n')}; });
  if (faqAt >= 0) text = text.slice(0,faqAt).trim();
  const parts = text.split(/^SECTION — (.+)\n/gm);
  const heroText = parts[0].replace(/^HERO\n/gm,'').replace(/CURRENT STATUS TABLE\n[\s\S]*$/,'');
  const hero = fields(heroText);
  const sections = [];
  for (let s=1;s<parts.length;s+=2) sections.push({ key:parts[s], ...fields(parts[s+1]) });
  const statusText = text.match(/CURRENT STATUS TABLE\n([\s\S]*?)(?=SECTION —|$)/)?.[1];
  const status = statusText?.trim().split('\n').filter(Boolean).map(l=>l.split(' — ')) || [];
  let article = [];
  if (isArticle) {
    const opening = text.split('Opening:\n')[1] || '';
    article = opening.trim().split('\n\n').map((p,i)=>({type: i>0 && !/[.!:—]$/.test(p) && p.length<100 && !['It is reference.','stance, proportion and focus.'].includes(p) ? 'h2':'p', text:p}));
    hero.Body = article.shift()?.text || '';
  }
  let legal = [];
  if(isLegal) {
    const body = text.split(/(?:Opening|Core copy):\n/)[1] || '';
    legal = body.split('Still required:')[0].trim().split('\n\n').map(p => {
      const match=p.match(/^([^\n]+):\n([\s\S]*)$/);
      return match ? {heading:match[1],body:match[2]} : {heading:'',body:p};
    });
    hero.Body = legal.shift()?.body || '';
  }
  if(route==='/journal') hero.Body = hero.Body.split('\n\nCategories:')[0];
  if(route==='/about') sections.splice(sections.findIndex(s=>s.key==='CONTACT'),1);
  const description = hero['Meta description'] || (isLegal ? hero.Body.split('\n')[0] : 'Continuity Motors C-01 development.');
  pages.push({route,title:hero['SEO title'],description,hero,sections,faq,status,article,legal,isArticle,isLegal});
}
mkdirSync('src/content',{recursive:true});
writeFileSync('src/content/pages.json',JSON.stringify(pages,null,2)+'\n');
mkdirSync('src/styles',{recursive:true});
copyFileSync('website_struct/continuity_colour_tokens.css','src/styles/tokens.css');
mkdirSync('migrations',{recursive:true});
copyFileSync('website_struct/continuity_schema.sql','migrations/0001_initial.sql');
console.log(`Imported ${pages.length} pages from the unchanged content master.`);
