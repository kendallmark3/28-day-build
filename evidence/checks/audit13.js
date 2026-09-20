// Day 13 usability audit. Usage: node audit13.js <label> <outfile.json>
const puppeteer=require('puppeteer-core');
const URL=process.env.APP_URL||'http://127.0.0.1:8092/';const KEY='intent-workbench-v1';
const rows=[];const row=(area,item,rule,ok,detail)=>{rows.push({area,item,rule,result:ok?'PASS':'FAIL',detail});console.log((ok?'PASS':'FAIL')+' | '+area+' | '+item+' | '+detail);};
const MSG=/\b(Saved|Updated|Downloaded|Reset|Cancelled|Edit cancelled|loaded into)\b/;
(async()=>{
 const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
 const cdp=await b.target().createCDPSession();const DL=require('os').tmpdir()+'/aud-dl-'+Date.now();require('fs').mkdirSync(DL,{recursive:true});
 await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL,eventsEnabled:false});
 const page=await b.newPage();
 const start=async(w,h,seedN=0,hash='')=>{await page.setViewport({width:w,height:h});await page.goto(URL+hash,{waitUntil:'load'});
   await page.evaluate((k,n)=>{localStorage.clear();if(n){localStorage.setItem(k,JSON.stringify({intents:Array.from({length:n},(_,i)=>({id:i+1,created:'x',outcome:'Seed intent '+(i+1),inputs:'i',outputs:'o',constraints:'c',criteria:'k',stop:'s'}))}));}},KEY,seedN);
   await page.reload({waitUntil:'load'});};
 // messages visible in the window right now (live regions / status), with their text
 const shown=()=>page.evaluate(()=>[...document.querySelectorAll('[role=status],[aria-live],.status')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return e.textContent.trim()&&cs.display!=='none'&&r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight;}).map(e=>e.textContent.replace(/\s+/g,' ').trim()));
 const live=()=>page.evaluate(()=>[...document.querySelectorAll('[role=status],[aria-live],.status')].map(e=>({txt:e.textContent.trim().slice(0,60),live:e.getAttribute('aria-live')||e.getAttribute('role')||(e.closest('[aria-live]')?'inherited':'')})));
 const feedback=async(item,vw,vh)=>{const m=await shown();const hit=m.filter(t=>MSG.test(t));const lv=await live();
   row('Next actions',item+' ('+vw+'x'+vh+')','status message naming the action, in the window, in a live region',hit.length>0,hit.length?JSON.stringify(hit[0].slice(0,70)):'nothing in the window names the action; live regions in window: '+JSON.stringify(m.map(t=>t.slice(0,40))));};

 // ---------- Navigation
 for(const v of ['intents','references','about']){
   await start(1280,800,0,'#'+v);
   for(const t of ['intents','references','about'].filter(x=>x!==v)){
     await page.click('nav a[href="#'+t+'"]');await new Promise(r=>setTimeout(r,120));
     const shownView=await page.evaluate(()=>['intents','references','about'].filter(n=>!document.getElementById('view-'+n).hidden));
     row('Navigation','from '+v+' to '+t,'reachable in one action',JSON.stringify(shownView)==='["'+t+'"]',JSON.stringify(shownView));
     await page.click('nav a[href="#'+v+'"]');await new Promise(r=>setTimeout(r,120));
   }
 }
 // ---------- Empty states
 await start(1280,800,0);
 const es=await page.$eval('#emptyState',e=>({vis:!e.hidden&&e.offsetParent!==null,t:e.textContent}));
 row('Empty states','Saved intents, no intents','says what belongs and what to do',es.vis&&/outcome/i.test(es.t)&&/Save intent/.test(es.t),JSON.stringify(es.t.slice(0,60)));
 const dn=await page.$eval('#nextStep',e=>e.textContent);
 row('Empty states','Dashboard, no intents','names the next action',/Next step: save the example/.test(dn),dn);
 await page.click('#openJira');await page.$eval('#jiraText',t=>{t.value='PROJ-1: Tiny\nAs a user, I want a report so that I can share it.\nAcceptance Criteria\n- The page shows a button labelled "Export"\nDependencies\n- Data from the database\nDeliverables\n- A report file\nConstraints\n- Only admins may export\nDone when the report downloads';});await page.click('#jiraBuild');
 const nf=await page.$$eval('#jiraNofit li',l=>l.map(x=>x.textContent));
 row('Empty states','Jira "What didn\'t fit", nothing left over','says so',nf.length===1&&/Every line of your story was placed/.test(nf[0]),JSON.stringify(nf));
 await page.click('#jiraBack');await page.$eval('#jiraText',t=>{t.value='  ';});await page.click('#jiraBuild');
 const je=await page.$eval('#jiraError',e=>({vis:!e.hidden,t:e.textContent}));
 row('Empty states','Jira modal, nothing pasted','says what to do',je.vis&&/Paste a Jira story/.test(je.t),je.t);
 await page.click('#jiraClose1');
 // ---------- Next actions: each view ends with a link to the next action
 for(const v of ['references','about']){
   await start(1280,800,0,'#'+v);
   const cta=await page.evaluate(x=>{const c=document.getElementById('view-'+x);const as=[...c.querySelectorAll('a[href="#intents"]')];return as.map(a=>a.textContent.trim());},v);
   row('Next actions',v+' view content links to Intents','content ends with a link to the next action',cta.length>0,JSON.stringify(cta));
 }
 // ---------- Next actions: after each action, message in the window
 for(const [w,h] of [[1280,800],[375,812]]){
   await start(w,h,0);await page.click('#submitBtn');await feedback('Save (create)',w,h);
   await start(w,h,6);
   await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
   await page.click('#intentList li:nth-child(5) > button');
   await page.$eval('#outcome',e=>{e.value='Seed intent 5 edited';});await page.click('#submitBtn');await feedback('Update (edit)',w,h);
 }
 await start(1280,800,3);await page.click('#intentList li:nth-child(2) > button');await page.click('#cancelEdit');await feedback('Cancel edit',1280,800);
 await start(1280,800,0);await page.click('#openJira');await page.click('#jiraBuild');await page.click('#jiraUse');await feedback('Use in form',1280,800);
 const saveVis=await page.evaluate(()=>{const r=document.getElementById('submitBtn').getBoundingClientRect();return {bottom:Math.round(r.bottom),vh:innerHeight};});
 row('Next actions','After "Use in form", the Save button is in the window','next action visible',saveVis.bottom<=saveVis.vh,JSON.stringify(saveVis));
 await start(1280,800,0);await page.click('#openJira');await page.click('#jiraBuild');await page.click('#jiraDownload');await new Promise(r=>setTimeout(r,400));
 const dm=await page.evaluate(()=>[...document.querySelectorAll('#jiraDialog [role=status],#jiraDialog [aria-live],#jiraDialog .status')].filter(e=>e.textContent.trim()).map(e=>e.textContent.trim()));
 row('Next actions','Download (in the modal)','status message naming the action, in a live region',dm.some(t=>/Downloaded/.test(t)),JSON.stringify(dm));
 await start(1280,800,3);await page.click('#resetSample');await page.click('#resetConfirm');await feedback('Reset to sample data',1280,800);
 console.log('\n'+rows.filter(r=>r.result==='PASS').length+' pass, '+rows.filter(r=>r.result==='FAIL').length+' fail, '+rows.length+' rows');
 require('fs').writeFileSync(process.argv[3],JSON.stringify(rows,null,1));
 await b.close();
})().catch(e=>{console.error('SCRIPT ERROR',e);process.exit(1);});
