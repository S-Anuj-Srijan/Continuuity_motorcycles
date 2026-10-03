import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

test('home remains usable on a throttled connection and records local web-vitals observations',async({page},info)=>{
 test.setTimeout(60000);
 await page.addInitScript(()=>{
  localStorage.setItem('continuity-consent','denied');
  (window as any).__vitals={cls:0,lcp:0};
  new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!(entry as any).hadRecentInput)(window as any).__vitals.cls+=(entry as any).value;}).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>{const entries=list.getEntries();(window as any).__vitals.lcp=entries[entries.length-1].startTime;}).observe({type:'largest-contentful-paint',buffered:true});
 });
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Network.enable');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.locator('.hero-art img').evaluate(async element=>{await (element as HTMLImageElement).decode();});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(700);
 const metrics=await page.evaluate(()=>({...((window as any).__vitals),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,bytes:(e as PerformanceResourceTiming).transferSize}))}));
 mkdirSync('artifacts',{recursive:true});writeFileSync(`artifacts/${info.project.name}-performance.json`,JSON.stringify(metrics,null,2));
 expect(metrics.cls).toBeLessThan(.1);
 expect(metrics.lcp).toBeGreaterThan(0);
 // This local synthetic observation is not a production field Core Web Vitals claim.
});
