// shared harness for per-day test files
const puppeteer=require('puppeteer-core');const fs=require('fs');
const URL=process.env.APP_URL||'http://127.0.0.1:8092/';const KEY='intent-workbench-v1';const REPO=require('path').resolve(__dirname,'../..');
module.exports=async function(name,fn){
  const results=[];const rec=(n,ok,d)=>{results.push(ok);console.log((ok?'PASS':'FAIL')+' | '+n+(d?' | '+String(d).slice(0,220):''));};
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
  const page=await browser.newPage();const errors=[];const reqs=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>reqs.push(r.url()));
  const ctx={page,browser,URL,KEY,REPO,rec,reqs,errors,fs,
    // open the app with a given stored state (object -> JSON, string -> raw, null -> cleared)
    async start(state,w=1280,h=800,hash=''){await page.setViewport({width:w,height:h});await page.goto(URL+hash,{waitUntil:'load'});
      await page.evaluate((k,s)=>{localStorage.clear();if(s!==null&&s!==undefined)localStorage.setItem(k,typeof s==='string'?s:JSON.stringify(s));},KEY,state);await page.reload({waitUntil:'load'});},
    async go(hash){await page.goto(URL+hash,{waitUntil:'load'});},
    async view(v){await page.evaluate(x=>{location.hash='#'+x;},v);await new Promise(r=>setTimeout(r,120));},
    stored:()=>page.evaluate(k=>{const d=localStorage.getItem(k);return d?JSON.parse(d):null;},KEY),
    wait:ms=>new Promise(r=>setTimeout(r,ms)),
    text:sel=>page.$eval(sel,e=>e.textContent.replace(/\s+/g,' ').trim()),
    shot:(p)=>page.screenshot({path:p}),
  };
  try{await fn(ctx);}catch(e){console.log('FAIL | SCRIPT ERROR | '+e.message);results.push(false);}
  rec('no console errors',errors.length===0,JSON.stringify(errors));
  await browser.close();
  console.log('SUMMARY '+name+': '+results.filter(Boolean).length+'/'+results.length);
};
