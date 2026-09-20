// Day 27: round-2 attacks on the surfaces added since Day 14, traceability, documentation-versus-reality, and run instructions.
require('./h.js')('day27',async c=>{
  const {page,rec,fs,browser,KEY,REPO}=c;
  const row=(id,attack,expected,ok,got)=>{rec(id+' '+attack+' -> '+expected,ok,got);};
  const iv=(id,o,rest)=>Object.assign({id,created:'x',outcome:o,inputs:'i',outputs:'o',constraints:'c',criteria:'The page shows a button',stop:'s'},rest||{});
  const base=()=>({intents:[iv(1,'One',{consequence:'high'})],evidence:[{id:'e1',intentId:1,claim:'C',label:'assumed',source:'',created:'x'}],capabilities:[]});
  const full=()=>page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};});
  const snap=()=>page.evaluate(k=>localStorage.getItem(k),KEY);
  // ---- Q1: storage full during each new write action
  const actions={
    'save a claim':async()=>{await c.view('review');await page.$eval('#claimText',e=>{e.value='new claim';});await page.$eval('#claimLabel',e=>{e.value='observed';});await full();await page.click('#claimSave');return ['#evidenceError'];},
    'relabel a claim':async()=>{await c.view('review');await full();const s=await page.$$('#evidenceList select');await s[0].select('observed');await c.wait(120);return ['#evidenceStatus'];},
    'record a review':async()=>{await c.view('review');await page.$eval('#notChecked',e=>{e.value='gap';});await full();await page.click('#reviewSave');return ['#reviewError'];},
    'set a consequence':async()=>{await c.view('review');await full();await page.select('#consequence','low');await c.wait(120);return ['#guardrailStatus'];},
    'record an approval':async()=>{await c.view('review');await page.$eval('#approver',e=>{e.value='Dana';});await full();await page.click('#recordApproval');await c.wait(120);return ['#guardrailStatus'];},
    'add a capability':async()=>{await c.view('capabilities');await page.$eval('#capName',e=>{e.value='New thing';});await full();await page.click('#capAdd');return ['#capError'];},
    'record a use':async()=>{await c.view('capabilities');await full();await page.click('#capList > li:nth-child(1) button[aria-label^="Record a successful use"]');await c.wait(120);return ['#capStatus'];},
    'tick a day':async()=>{await c.view('overview');await full();await page.click('#days > li:nth-child(3) input');await c.wait(120);return ['#progressStatus'];}
  };
  let n=0;
  for(const [name,fn] of Object.entries(actions)){
    n++;await c.start(base(),1280,800);const before=await snap();const errsBefore=c.errors.length;
    const sels=await fn();const after=await snap();
    const msg=(await Promise.all(sels.map(s=>page.$eval(s,e=>e.textContent).catch(()=>'')))).join(' ');
    const threw=c.errors.length>errsBefore;
    row('Q1.'+n,'storage full while you '+name,'a "storage is full" message, data unchanged, no error',/full/i.test(msg)&&after===before&&!threw,JSON.stringify({msg:msg.slice(0,70),same:after===before,threw}));
    c.errors.length=0;
  }
  // ---- Q2: a large store
  const big={intents:Array.from({length:3000},(_,i)=>iv(i+1,'Intent number '+(i+1),{consequence:['low','medium','high',''][i%4]})),evidence:Array.from({length:6000},(_,i)=>({id:'e'+i,intentId:(i%3000)+1,claim:'Claim '+i,label:['observed','inferred','assumed'][i%3],source:'s',created:'x'})),reviews:Array.from({length:500},(_,i)=>({id:'r'+i,intentId:i+1,created:'2026-01-01T00:00:00.000Z',criteria:[{text:'The page shows a button',status:'met'}],findings:[],notChecked:'n',summary:''}))};
  const t0=Date.now();await c.start(big,1280,800);const loadMs=Date.now()-t0;
  const t1=Date.now();await c.view('review');const revMs=Date.now()-t1;
  const t2=Date.now();await c.view('overview');const ovMs=Date.now()-t2;
  const t3=Date.now();await c.view('intents');await page.click('#submitBtn');await c.wait(50);const saveMs=Date.now()-t3;
  row('Q2','a large store: 3,000 intents, 6,000 evidence records, 500 reviews','load, Review, Overview, and a save each under 3 seconds',loadMs<3000&&revMs<3000&&ovMs<3000&&saveMs<3000,JSON.stringify({loadMs,revMs,ovMs,saveMs}));
  // ---- Q3: two tabs, both open, both write
  await c.start(base(),1280,800);
  const p2=await browser.newPage();await p2.goto(c.URL+'#review',{waitUntil:'load'});
  await page.bringToFront();await c.view('review');await page.$eval('#claimText',e=>{e.value='from tab one';});await page.$eval('#claimLabel',e=>{e.value='observed';});await page.click('#claimSave');await c.wait(150);
  await p2.bringToFront();await p2.$eval('#claimText',e=>{e.value='from tab two';});await p2.$eval('#claimLabel',e=>{e.value='inferred';});await p2.click('#claimSave');await new Promise(r=>setTimeout(r,200));
  const claims=(await c.stored()).evidence.map(e=>e.claim);await p2.close();
  row('Q3','two open tabs each add a different claim','both claims are kept (no lost update)',claims.includes('from tab one')&&claims.includes('from tab two'),JSON.stringify(claims));
  // ---- Q4: storage blocks reads AND writes
  const p3=await browser.newPage();await p3.evaluateOnNewDocument(()=>{const boom=()=>{throw new DOMException('blocked','SecurityError');};Storage.prototype.getItem=boom;Storage.prototype.setItem=boom;Storage.prototype.removeItem=boom;});
  const errs3=[];p3.on('pageerror',e=>errs3.push(String(e)));await p3.goto(c.URL,{waitUntil:'load'});
  const b3=await p3.evaluate(()=>({banner:!document.getElementById('problemBanner').hidden,txt:document.getElementById('problemText').textContent,views:['start','intents'].filter(n=>!document.getElementById('view-'+n).hidden).join()}));
  await p3.close();
  row('Q4','storage blocks reads as well as writes (getItem, setItem, and removeItem all throw)','the app loads, shows the blocked-storage banner, and throws nothing',b3.banner&&/blocking local storage/.test(b3.txt)&&errs3.length===0&&b3.views==='intents',JSON.stringify({b3,errs:errs3.length}));
  // ---- Q5: quotes and angle brackets in names used inside attributes
  await c.start(null,1280,800,'#capabilities');
  await page.$eval('#capName',e=>{e.value='"><img src=x onerror=window.__q=1> \' name';});await page.click('#capAdd');await c.wait(150);
  const q5=await page.evaluate(()=>({flag:window.__q||null,imgs:document.querySelectorAll('#capList img,#capList [onerror]').length,aria:[...document.querySelectorAll('#capList button')].filter(b=>/onerror/.test(b.getAttribute('aria-label')||'')).length}));
  row('Q5','a name containing quotes and an <img onerror> is used in button aria-labels','shown as literal text, nothing runs, no element or attribute injected',q5.flag===null&&q5.imgs===0&&q5.aria>0,JSON.stringify(q5));
  // ---- Q6: an accidental double-click on "Record a successful use"
  await c.start(base(),1280,800,'#capabilities');
  await page.evaluate(()=>{const b=document.querySelector('#capList > li:nth-child(1) button[aria-label^="Record a successful use"]');b.click();document.querySelector('#capList > li:nth-child(1) button[aria-label^="Record a successful use"]').click();});
  await c.wait(150);
  const uses=(await c.stored()).capabilities.find(x=>x.id==='cap-intent-check').uses.length;
  row('Q6','an accidental double-click on "Record a successful use"','one use is recorded (one gesture must not satisfy "2 successful uses")',uses===1,'uses recorded: '+uses);
  // ---- Q7: an accidental double-click on "Save intent"
  await c.start(null,1280,800);
  await page.evaluate(()=>{const b=document.getElementById('submitBtn');b.click();b.click();});await c.wait(150);
  const saved7=(await c.stored()).intents.length;
  row('Q7','an accidental double-click on "Save intent" (the form resets to the example after the first save)','one intent is saved, not two',saved7===1,'intents saved: '+saved7);
  // ---- T1: every criterion maps to a check
  const tr=require('./traceability.js').verify();
  rec('T1 every success criterion (archived and active) maps to an existing automated check; the mapping fails if one is added without a check',tr.problems.length===0&&tr.nA===53&&tr.nC>=83,tr.problems.join(' | ')||(tr.nA+' archived + '+tr.nC+' active'));
  // ---- D1: architecture.md says what is true
  const arch=fs.readFileSync(REPO+'/context/architecture.md','utf8');
  const builtPart=arch.slice(arch.indexOf('Built:'),arch.indexOf('Not built:'));const notPart=arch.slice(arch.indexOf('Not built:'),arch.indexOf('## Architectural rule'));
  await c.start(null);const navNames=await page.$$eval('nav a',a=>a.map(x=>x.textContent));
  const missingBuilt=navNames.filter(n=>!new RegExp(n+' view').test(builtPart));
  const stale=['Context Library','Evidence & Review','Capability Library','28-Day Progress','Readiness score'].filter(w=>notPart.includes(w));
  rec('D1 architecture.md: no "as of Day" wording; every view in the navigation is listed as built ('+navNames.join(', ')+'); none of the old "planned" modules is still called not built',!/as of Day/i.test(arch)&&missingBuilt.length===0&&stale.length===0&&/Export and import/.test(notPart),JSON.stringify({missingBuilt,stale}));
  // ---- D2..D4: run instructions
  const cp=require('child_process');
  const shPath=REPO+'/run-app.sh';const executable=(fs.statSync(shPath).mode&0o111)!==0;
  const bat=fs.readFileSync(REPO+'/run-app.bat','utf8');
  const readme=fs.readFileSync(REPO+'/README.md','utf8'),appReadme=fs.readFileSync(REPO+'/app/README.md','utf8');
  rec('D2 run-app.sh is executable and serves app/ on a given port; run-app.bat does the same for Windows; README.md and app/README.md tell a newcomer to run them, and app/README.md no longer says to copy the starter',executable&&/http\.server/.test(fs.readFileSync(shPath,'utf8'))&&/\bapp\b/.test(fs.readFileSync(shPath,'utf8'))&&/http\.server/.test(bat)&&/%~dp0app/.test(bat)&&/run-app\.sh/.test(readme)&&/run-app\.bat/.test(readme)&&/run-app\.sh/.test(appReadme)&&appReadme.indexOf('Copy the contents of')===-1,'');
  const PORT=8397;const startAt=Date.now();
  const srv=cp.spawn('bash',[shPath,String(PORT)],{cwd:REPO,stdio:'ignore'});
  let ok=false,ms=0,body='';
  for(let i=0;i<40&&!ok;i++){await c.wait(100);try{const r=await fetch('http://127.0.0.1:'+PORT+'/');if(r.ok){body=await r.text();ok=true;ms=Date.now()-startAt;}}catch(e){}}
  rec('D3 ./run-app.sh 8397 starts a server that returns the app\'s page ("IntentWorkbench") within 3 seconds',ok&&/IntentWorkbench/.test(body)&&ms<3000,ms+' ms');
  const openAt=Date.now();const pg=await browser.newPage();await pg.goto('http://127.0.0.1:'+PORT+'/',{waitUntil:'load'});await pg.waitForSelector('#submitBtn');const usable=Date.now()-openAt;
  await pg.$eval('#submitBtn',b=>b.click());await new Promise(r=>setTimeout(r,120));
  const saved=await pg.evaluate(()=>document.querySelectorAll('#intentList li').length);await pg.close();
  srv.kill();try{cp.execSync('pkill -f "http.server '+PORT+'"');}catch(e){}
  rec('D4 opened from the script\'s server, the app loads and works (Save intent on the example adds an intent) in '+(ms+usable)+' ms from starting the script: far inside the "under 3 minutes" criterion for two commands',saved===1&&ms+usable<3000,ms+' + '+usable+' ms');
  // ---- D5: no overclaiming words in what the app shows
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');
  let all='';for(const v of ['start','intents','review','capabilities','overview','references','about']){await c.view(v);all+=' '+await page.evaluate(()=>document.querySelector('main').innerText);}
  await c.view('intents');await page.click('#openJira');all+=' '+await page.evaluate(()=>document.getElementById('jiraDialog').innerText);await page.keyboard.press('Escape');
  const over=(all.match(/\b(guarantee[sd]?|foolproof|unbreakable|bulletproof|100% (safe|secure)|AI-powered|intelligent|revolutionary|seamless)\b/gi)||[]);
  rec('D5 nothing the app shows uses an overclaiming word (guarantee, foolproof, bulletproof, AI-powered, intelligent, seamless, and similar)',over.length===0,JSON.stringify(over));
});
