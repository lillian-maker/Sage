import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.SAGE_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SAGE_PREVIEW_URL||'http://localhost:8895/redesign/';
const out='.impeccable/review/studio';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage(),checks=[],errors=[];
const check=(pass,name)=>checks.push({pass:!!pass,name});
const canonical=['存量GMV增长','新品证据到商业验证','供需补货与交付','新市场与合规上架','客户旅程与复购','需求到数据产品与业务工具','质量与账号重大事件','经营复盘与能力组合更新','Shopify运营'];
page.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[1440,900],[1366,768],[390,844],[375,667],[320,568]]){
 await page.setViewportSize({width,height});await page.goto(base+'index.html');await page.waitForLoadState('networkidle');
 check(await page.locator('#studio-team img').evaluateAll(imgs=>imgs.length>=3&&imgs.every(img=>{const r=img.getBoundingClientRect();return img.naturalWidth>0&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&r.width>=44;})),'portraits in initial viewport '+width+'x'+height);
 await page.screenshot({path:out+'/portraits-'+width+'.png'});
}
for(const width of [1440,1024,768,390,320]){
 await page.setViewportSize({width,height:1100});await page.goto(base+'index.html');
 check(await page.locator('#studio-scenarios,#studio-motion,.studio-demo-label,.studio-timeline').count()===0,'removed controls / '+width);
 await page.locator('#studio-prev').click();
 for(let scene=0;scene<9;scene++){
  check(await page.locator('#studio-breadcrumb').innerText()===canonical[scene],'canonical heading '+width+'/'+scene);
  check(await page.locator('#studio-breadcrumb').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=18),'prominent heading '+width+'/'+scene);
  for(let step=0;step<5;step++){
   await page.locator('[data-studio-step="'+step+'"]').click();
   check(await page.locator('#studio-panel').getAttribute('data-step')===String(step),'manual stage '+width+'/'+scene+'/'+step);
   check(await page.locator('.studio-row').count()===3,'evidence rows '+width+'/'+scene+'/'+step);
   check(await page.locator('#studio-team img').count()>1,'collaboration '+width+'/'+scene+'/'+step);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+width+'/'+scene+'/'+step);
  }
  await page.locator('#studio-next').click();
 }
 check(await page.locator('#studio-breadcrumb').innerText()===canonical[0],'wrap to first / '+width);
 check(await page.locator('#studio-panel').getAttribute('data-step')==='4','remember chosen stage / '+width);
 await page.locator('#studio-next').click();await page.locator('[data-studio-step="0"]').click();
 check(await page.locator('#studio-steps').evaluate(e=>{const a=e.querySelector('[aria-current="step"]').getBoundingClientRect(),r=e.getBoundingClientRect();return a.left>=r.left-1&&a.right<=r.right+1;}),'active stage visible / '+width);
 await page.locator('#hero-heading').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/home-'+width+'.png'});
}
await page.locator('#studio-next').focus();await page.keyboard.press('Enter');
check(await page.locator('#studio-breadcrumb').innerText()===canonical[2],'keyboard next scene');
await page.locator('#hero-heading').click();await page.mouse.move(0,0);await page.waitForTimeout(9500);
check(await page.locator('#studio-breadcrumb').innerText()===canonical[2],'reduced motion holds scene');
check(await page.locator('.cinema-caption,.cinema-controls,.case-index').count()===0,'no rotating copy beneath recording');
await page.goto(base+'team.html');
check(JSON.stringify(await page.locator('.tp-scene-button strong').allTextContents())===JSON.stringify(canonical),'team canonical names');
for(const route of ['team','pricing','enterprise','docs','download','trial','auth','profile','product']){
 const r=await page.goto(base+route+'.html');check(r.status()===200,'route '+route);
}
await context.close();
const moving=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
const live=await moving.newPage();live.on('pageerror',e=>errors.push(e.message));
await live.goto(base+'index.html');await live.waitForTimeout(3800);
check(await live.locator('#studio-breadcrumb').innerText()===canonical[2],'auto advances scene');
check(await live.locator('#studio-panel').getAttribute('data-step')==='0','does not auto advance inner stage');
await live.locator('[data-studio-step="2"]').click();await live.waitForTimeout(3800);
check(await live.locator('#studio-breadcrumb').innerText()===canonical[2],'interaction holds scene');
check(await live.locator('#studio-panel').getAttribute('data-step')==='2','clicked stage remains selected');
await live.locator('#hero-heading').click();await live.mouse.move(0,0);await live.waitForTimeout(3800);
check(await live.locator('#studio-breadcrumb').innerText()===canonical[3],'leaving resumes scene rotation');
await live.locator('#studio-prev').click();
check(await live.locator('#studio-panel').getAttribute('data-step')==='2','return restores manual stage');
check(errors.length===0,'no runtime errors');await browser.close();
const report={at:new Date().toISOString(),checks:checks.length,passed:checks.filter(x=>x.pass).length,failures:checks.filter(x=>!x.pass),errors};
fs.writeFileSync(out+'/audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.failures.length?1:0;
