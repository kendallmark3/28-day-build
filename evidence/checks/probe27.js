// Day 27 adversarial probes, round 2: the surfaces added since Day 14. Set PROBE_JSON=<file> to save rows.
const rows=[];
require('./h.js')('probe27',async c=>{
  const {page,rec,fs,browser,KEY}=c;
  const row=(id,attack,expected,ok,got)=>{rows.push({id,attack,expected,result:ok?'HOLDS':'BREAKS',got:String(got).slice(0,220)});rec(id+' '+attack,ok,got);};
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
  const saved=(await c.stored()).intents.length;
  row('Q7','an accidental double-click on "Save intent" (the form resets to the example after the first save)','one intent is saved, not two',saved===1,'intents saved: '+saved);
  if(process.env.PROBE_JSON)fs.writeFileSync(process.env.PROBE_JSON,JSON.stringify(rows,null,1));
});
