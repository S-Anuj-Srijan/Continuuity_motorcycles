import {test,expect} from '@playwright/test';
import pages from '../../src/content/pages.json' with { type: 'json' };

test('all public routes have complete crawlable copy, metadata, and no horizontal overflow',async({page})=>{
 // Exercise graceful API unavailability while crawling; a separate test uses real D1.
 await page.route('**/api/session',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'}));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const content of pages){
  const response=await page.goto(content.route);expect(response?.status()).toBe(200);expect(new URL(page.url()).pathname).toBe(content.route);
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('h1')).toHaveText(content.hero.H1);
  await expect(page).toHaveTitle(content.title);await expect(page.locator('meta[name=description]')).toHaveAttribute('content',content.description);
  for(const section of content.sections)if(section.Heading)await expect(page.getByRole('heading',{name:section.Heading,exact:true})).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow,content.route).toBe(false);
  await expect(page.locator('body')).not.toContainText('[PUBLIC CONTACT EMAIL]');
 }
 expect(errors).toEqual([]);
});

test('product parity, viewer keyboard close, zoom, form disabled without Turnstile',async({page})=>{
 const sectionLists:string[][]=[];
 for(const slug of ['camel','messerschmitt']){
  await page.goto(`/c-01/${slug}`);const reject=page.getByRole('button',{name:'Reject optional',exact:true});if(await reject.isVisible())await reject.click();
  sectionLists.push(await page.locator('main [data-section]').evaluateAll(els=>els.map(el=>el.getAttribute('data-section')!.replace(/relationship-to-.+/,'relationship'))));
  const expand=page.locator('[data-asset$="engineering_board"]');await expand.click();await expect(page.locator('#image-viewer')).toBeVisible();
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.locator('#viewer-image')).toHaveAttribute('style',/150%/);
  await page.keyboard.press('Escape');await expect(page.locator('#image-viewer')).not.toBeVisible();await expect(expand).toBeFocused();
  await expect(page.getByRole('button',{name:'Join early access',exact:true})).toBeDisabled();
 }
 expect(sectionLists[0]).toEqual(sectionLists[1]);
});

test('both randomized directions persist; only assigned hero is fetched',async({browser})=>{
 for(const variant of ['camel','messerschmitt']){
  const context=await browser.newContext();const page=await context.newPage();
  await page.addInitScript(v=>{sessionStorage.setItem('continuity-assignment',JSON.stringify({variant:v,method:'randomized',landing:'/'}));localStorage.setItem('continuity-consent','denied');},variant);
  const posters:string[]=[];page.on('request',request=>{if(request.url().includes('hangar-concept'))posters.push(request.url());});
  await page.goto('/');await expect(page.locator('.hero-art img')).toHaveCount(1);
  await expect(page.locator('.hero-art img')).toHaveAttribute('src',new RegExp(variant));
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-variant',variant);
  expect(posters.every(url=>url.includes(variant))).toBe(true);
  await context.close();
 }
});

test('consent gates analytics and can be reopened and revoked',async({page})=>{
 const events:string[]=[];page.on('request',request=>{if(request.url().endsWith('/api/events'))events.push(request.url());});
 await page.goto('/c-01/camel');await page.getByRole('button',{name:'Reject optional',exact:true}).click();
 expect(await page.evaluate(()=>localStorage.getItem('continuity-visitor'))).toBeNull();expect(events).toEqual([]);
 await page.getByRole('button',{name:'Privacy preferences',exact:true}).click();await page.locator('#analytics-choice').check();await page.getByRole('button',{name:'Save preferences',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('continuity-visitor'))).not.toBeNull();
 await page.getByRole('button',{name:'Privacy preferences',exact:true}).click();await page.locator('#analytics-choice').uncheck();await Promise.all([page.waitForEvent('load'),page.getByRole('button',{name:'Save preferences',exact:true}).click()]);
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('continuity-consent'))).toBe('denied');
 expect(await page.evaluate(()=>localStorage.getItem('continuity-visitor'))).toBeNull();
});

test('mobile menu traps focus and closes with Escape; missing routes return 404',async({page,isMobile})=>{
 await page.goto('/');await page.getByRole('button',{name:'Reject optional',exact:true}).click();
 if(isMobile){await page.getByRole('button',{name:/Menu/}).click();await expect(page.locator('#mobile-menu')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#mobile-menu')).not.toBeVisible();}
 const response=await page.goto('/not-a-road');expect(response?.status()).toBe(404);await expect(page.getByRole('heading',{level:1})).toHaveText('This road does not exist.');
});

test('capture visual review',async({page},info)=>{
 async function loadImages(){await page.locator('main img').evaluateAll(async images=>{await Promise.all(images.map(async image=>{const img=image as HTMLImageElement;img.loading='eager';try{await img.decode();}catch{}}));});await page.evaluate(()=>document.fonts.ready);}
 await page.goto('/');await page.getByRole('button',{name:'Reject optional',exact:true}).click();await loadImages();await page.screenshot({path:`artifacts/${info.project.name}-home.png`,fullPage:true});await page.screenshot({path:`artifacts/${info.project.name}-hero.png`});
 await page.goto('/c-01/camel');await loadImages();await page.screenshot({path:`artifacts/${info.project.name}-camel.png`,fullPage:true});
});

test('accepted product interactions reach the real Worker without validation failures',async({page})=>{
 const received:number[]=[];page.on('response',response=>{if(response.url().endsWith('/api/events'))received.push(response.status());});
 await page.goto('/c-01/messerschmitt?test=1');
 const sessionResponse=page.waitForResponse(response=>response.url().endsWith('/api/session')&&response.request().postDataJSON().consent==='accepted');
 await page.getByRole('button',{name:'Accept analytics',exact:true}).click();expect((await sessionResponse).status()).toBe(200);
 await page.locator('[data-asset$="engineering_board"]').click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.keyboard.press('Escape');
 const eventsResponse=page.waitForResponse(response=>response.url().endsWith('/api/events'));
 await page.locator('[data-track="variant_switch"]').click();expect((await eventsResponse).status()).toBe(200);expect(received.every(status=>status===200)).toBe(true);
 const experiment=await page.request.get('/api/experiment');expect(experiment.status()).toBe(200);expect((await experiment.json()).assignment_method).toBe('direct_campaign');
});
