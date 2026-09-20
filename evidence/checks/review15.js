// Day 15 review script: written from the criteria text only. Reads, never modifies, the app.
const h=require('./h.js');
h('review15',async c=>{
  const {page,rec,fs,REPO,KEY}=c;const src=f=>fs.readFileSync(REPO+'/'+f,'utf8');
  const raw=()=>page.evaluate(k=>localStorage.getItem(k),KEY);
  const oldIntent=(id,o)=>({id,created:'2026-02-02T02:02:02.000Z',outcome:o,inputs:'I-'+id,outputs:'O-'+id,constraints:'C-'+id,criteria:'K-'+id,stop:'S-'+id});
  // 1
  await c.start(null);await page.click('#submitBtn');
  let j=JSON.parse(await raw());const shape=s=>s.version===2&&['projects','intents','evidence','reviews','capabilities'].every(k=>Array.isArray(s[k]))&&s.progress&&typeof s.progress==='object'&&!Array.isArray(s.progress);
  const afterSave=shape(j);
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');
  const afterReset=shape(JSON.parse(await raw()));
  rec('R-1 stored shape after first save AND after reset',afterSave&&afterReset,JSON.stringify({afterSave,afterReset}));
  // 2
  await c.start({intents:[oldIntent(101,'Old A'),oldIntent(102,'Old B')]});
  const counts=await page.evaluate(()=>{location.hash='#overview';return null;});await c.wait(150);
  const ov=await page.$$eval('#modelCounts li',ls=>Object.fromEntries(ls.map(l=>[l.querySelector('span').textContent,+l.querySelector('strong').textContent])));
  await c.view('intents');await page.$eval('#outcome',e=>{e.value='Trigger save';});await page.click('#submitBtn');
  const s2=JSON.parse(await raw());const a=s2.intents.find(i=>i.id===101);
  rec('R-2 old shape: values intact after a save; Overview shows 1 project, 2 capabilities, 0 evidence, 0 reviews',a&&a.inputs==='I-101'&&a.outputs==='O-101'&&a.constraints==='C-101'&&a.criteria==='K-101'&&a.stop==='S-101'&&a.created==='2026-02-02T02:02:02.000Z'&&ov.Projects===1&&ov.Capabilities===2&&ov['Evidence records']===0&&ov.Reviews===0&&ov.Intents===2,JSON.stringify(ov));
  // 3
  const logic=src('app/logic.js');const code=logic.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
  const names=['emptyState','normalizeState','makeIntent','makeEvidence','makeReview','makeCapability'];
  const present=names.every(n=>new RegExp('function '+n+'\\(').test(code));
  const banned=['document','window','localStorage','sessionStorage','fetch(','XMLHttpRequest','Math.random','Date.now','new Date()','navigator'].filter(t=>code.includes(t));
  const p3=await page.evaluate(()=>{const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};
    const inputs={makeIntent:[{outcome:'x',inputs:'y'},{id:1,now:5}],makeEvidence:[{intentId:1,claim:'c',label:'assumed',source:'s'},{id:'e',now:5}],makeReview:[{intentId:1,criteria:[{text:'t',status:'met'}]},{id:'r',now:5}],makeCapability:[{name:'n',level:'skill'},{id:'k',now:5}],normalizeState:[{intents:[{id:1,outcome:'z'}],evidence:[{intentId:1,claim:'c',label:'nope'}]},5],emptyState:[5]};
    const out={};for(const [k,args] of Object.entries(inputs)){const before=JSON.stringify(args);const f=window[k]||eval(k);args.forEach(deep);let a,b,err='';try{a=JSON.stringify(f(...args));b=JSON.stringify(f(...args));}catch(e){err=e.message;}out[k]=!err&&a===b&&JSON.stringify(args)===before;}
    return out;});
  rec('R-3 six functions exist; same output twice; frozen inputs unchanged; logic.js has no page/storage/clock/random/network token',present&&banned.length===0&&Object.values(p3).every(Boolean),JSON.stringify({present,banned,p3}));
  // 4
  const d4=await page.evaluate(()=>normalizeState({intents:[{id:1,outcome:'keep'},{id:2,outcome:'   '}],evidence:[{intentId:1,claim:'c',label:'Observed'},{intentId:1,claim:'ok',label:'observed'}],reviews:[{intentId:1},{intentId:1,criteria:[]}],capabilities:[{id:'c9',name:'n',level:'skill',uses:'none'},{id:'c8',name:'m',level:'trigger',uses:[]}]},9));
  rec('R-4 drops and counts: 1 intent, 1 evidence, 1 review, 1 capability = 4; keeps the valid ones',d4.skipped===4&&d4.state.intents.length===1&&d4.state.evidence.length===1&&d4.state.evidence[0].label==='observed'&&d4.state.reviews.length===1&&d4.state.capabilities.some(x=>x.id==='c8'),JSON.stringify({sk:d4.skipped}));
  // 5
  const bi=await page.evaluate(()=>emptyState(0).capabilities.filter(x=>x.builtIn));
  await c.start({intents:[],capabilities:[]});await page.click('#submitBtn');const s5=JSON.parse(await raw());
  rec('R-5 two built-ins with all fields, level skill, no uses, not promoted; restored when stored capabilities are missing',bi.length===2&&bi.every(b=>['purpose','procedure','output','checks','owner','version'].every(f=>b[f]&&b[f].trim())&&b.level==='skill'&&b.uses.length===0&&b.promoted===false)&&s5.capabilities.map(x=>x.name).sort().join('|')==='Evidence-first review|Intent check',JSON.stringify(s5.capabilities.map(x=>x.name)));
  // 6
  await c.start(null);await page.click('#resetSample');const msg=await c.text('#resetMsg');await page.click('#resetConfirm');const s6=JSON.parse(await raw());
  const labs=new Set(s6.evidence.map(e=>e.label));
  rec('R-6 reset: >=3 intents; all three labels; >=1 review; uses on both built-ins; exactly one promoted; progress ticked; message says evidence/reviews/capabilities are replaced',s6.intents.length>=3&&labs.size===3&&s6.reviews.length>=1&&s6.capabilities.every(k=>k.uses.length>0)&&s6.capabilities.filter(k=>k.promoted).length===1&&Object.keys(s6.progress.days||{}).length>0&&/Evidence, reviews, and capability records are replaced too/.test(msg),msg.slice(0,70));
  // 7
  await c.view('overview');const nav=await page.$$eval('nav a',a=>a.map(x=>x.textContent));const ov7=await page.$$eval('#modelCounts li',ls=>Object.fromEntries(ls.map(l=>[l.querySelector('span').textContent,+l.querySelector('strong').textContent])));const head=await page.$$eval('#view-overview h3',h=>h.map(x=>x.textContent));
  rec('R-7 nav has Overview; "Data model" panel; five counts equal the stored data',nav.includes('Overview')&&head.includes('Data model')&&ov7.Projects===s6.projects.length&&ov7.Intents===s6.intents.length&&ov7['Evidence records']===s6.evidence.length&&ov7.Reviews===s6.reviews.length&&ov7.Capabilities===s6.capabilities.length,JSON.stringify(ov7));
  // 8
  await c.start(null);
  const pay=['<iframe srcdoc="<script>parent.__p=1</script>"></iframe>','<details open ontoggle=window.__p=1>x</details>','<a href="javascript:window.__p=1">click</a>','<style>body{display:none}</style>','<meta http-equiv=refresh content="0;url=about:blank">'];
  for(const p of pay){for(const f of ['outcome','inputs','outputs','constraints','criteria','stop'])await page.$eval('#'+f,(e,v)=>{e.value=v;},p);await page.click('#submitBtn');}
  const x8=await page.evaluate(()=>({flag:window.__p||null,bad:document.querySelectorAll('#intentList iframe,#intentList details,#intentList a,#intentList style,#actionStatus iframe,#actionStatus style,body>meta').length,bodyVisible:getComputedStyle(document.body).display!=='none',text:document.querySelector('#intentList li span').textContent.slice(0,30)}));
  rec('R-8 five different hostile payloads: shown as text, nothing runs or restyles the page',x8.flag===null&&x8.bad===0&&x8.bodyVisible&&/^</.test(x8.text),JSON.stringify(x8));
  // 9 (clock frozen)
  await c.start(null);await page.evaluate(()=>{Date.now=()=>1700000000000;});
  await page.evaluate(()=>{const f=document.getElementById('intentForm');for(let i=0;i<4;i++)f.requestSubmit();});
  const ids=JSON.parse(await raw()).intents.map(i=>i.id);
  rec('R-9 clock frozen, four saves: four distinct ids',ids.length===4&&new Set(ids).size===4,JSON.stringify(ids));
  // 10 (quota injected)
  await c.start(null);await page.$eval('#outcome',e=>{e.value='before quota';});await page.click('#submitBtn');const before=await raw();
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};});
  await page.$eval('#outcome',e=>{e.value='will not fit';});await page.click('#submitBtn');
  const m10=await c.text('#formError');
  rec('R-10 injected QuotaExceededError: message says full, not blocked; earlier data unchanged',/full/i.test(m10)&&!/blocking/i.test(m10)&&(await raw())===before,m10);
  // 11
  await c.start(null);
  const closed=[];
  for(const dlg of ['openJira','resetSample']){await page.click('#'+dlg);await page.evaluate(()=>{location.hash='#about';});await c.wait(150);closed.push(await page.evaluate(()=>!document.querySelector('dialog[open]')));await page.evaluate(()=>{location.hash='#intents';});await c.wait(150);}
  rec('R-11 Jira modal and reset confirmation both close when the view changes',closed.every(Boolean),JSON.stringify(closed));
  // 12
  await c.start({intents:[oldIntent(1,'First')]});
  const p2=await c.browser.newPage();await p2.goto(c.URL,{waitUntil:'load'});
  await p2.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.intents.push({id:77,created:'x',outcome:'Written by tab two directly',inputs:'',outputs:'',constraints:'',criteria:'',stop:''});localStorage.setItem(k,JSON.stringify(s));},KEY);
  await c.wait(300);const l12=await page.$$eval('#intentList li > span',l=>l.map(x=>x.textContent));await p2.close();
  rec('R-12 another tab writes storage directly: this tab lists the new intent without reload',l12.includes('Written by tab two directly'),JSON.stringify(l12));
  // 13
  await c.start({intents:[oldIntent(1,'One'),oldIntent(2,'Two')]});await page.click('#intentList li:nth-child(2) > button');
  await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.intents=s.intents.filter(i=>i.id!==2);localStorage.setItem(k,JSON.stringify(s));},KEY);
  await page.$eval('#outcome',e=>{e.value='Two, edited after removal';});await page.click('#submitBtn');
  const s13=JSON.parse(await raw());const msg13=await c.text('#actionStatus');
  rec('R-13 edit target removed elsewhere: saved as new, and the message says the original no longer exists',s13.intents.some(i=>i.outcome==='Two, edited after removal')&&/no longer exists/.test(msg13)&&!/^Updated/.test(msg13),msg13.slice(0,80));
  // archived criteria that name the nav or the view set
  const arch=src('intent/archive/intent-tracker.md');
  const navLine=(arch.match(/^- The navigation bar shows [^\n]*$/m)||[''])[0];
  const viewLine=(arch.match(/any view beyond [^,;\n]*/)||[''])[0];
  await c.start(null);const navNow=await page.$$eval('nav a',a=>a.map(x=>x.textContent));
  const said=(navLine.match(/"([^"]+)"/g)||[]).map(x=>x.replace(/"/g,''));
  const stale=said.length>0&&JSON.stringify(said)!==JSON.stringify(navNow);
  console.log('INFO archived nav criterion lists '+JSON.stringify(said)+' ; app nav now '+JSON.stringify(navNow)+' ; archived non-goal "'+viewLine+'"');
  rec('R-A1 archived nav criterion still equals the app nav (INFORMATION: expected to fail if stale)',!stale,'stale='+stale);
  // spot-check two archived criteria independently: Save button in window at load, no horizontal scroll on every view at 375
  const geo=[];for(const [w,hh] of [[1280,800],[375,812]]){await c.start(null,w,hh);geo.push(await page.evaluate(()=>{const r=document.getElementById('submitBtn').getBoundingClientRect();return Math.round(r.bottom+scrollY)<=innerHeight;}));}
  rec('R-A2 archived: Save button fully inside the window at load, 1280x800 and 375x812',geo.every(Boolean),JSON.stringify(geo));
  const hs=[];for(const v of ['intents','overview','references','about']){await c.start(null,375,812,'#'+v);hs.push(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));}
  rec('R-A3 archived: no horizontal scroll at 375px on all four views',hs.every(Boolean),JSON.stringify(hs));
  rec('R-net no request left the app origin during the whole review',c.reqs.filter(u=>!u.startsWith(c.URL)&&!u.startsWith('data:')&&!u.startsWith('blob:')).length===0,'');
});
