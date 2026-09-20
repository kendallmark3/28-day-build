require('./h.js')('day25',async c=>{
  const {page,rec,fs,REPO}=c;
  const full=(o)=>Object.assign({id:1,created:'x',outcome:'Ready one',inputs:'i',outputs:'o',constraints:'c',criteria:'The page shows a button',stop:'Stop when it shows'},o||{});
  const st0={intents:[],evidence:[],reviews:[],capabilities:[],progress:{}};
  // ---- pure
  await c.start(null);
  const p=await page.evaluate(()=>{
    const E=emptyState(0);const S=sampleState(0);const ids=onboardingSteps(E).map(x=>x.id);
    const cond=(patch)=>onboardingSteps(Object.assign({},E,patch)).map(x=>x.done?1:0).join('');
    const ready={id:1,outcome:'a',inputs:'i',outputs:'o',constraints:'c',criteria:'The page shows a button',stop:'s',consequence:''};
    const bare={id:2,outcome:'b',inputs:'',outputs:'',constraints:'',criteria:'',stop:'',consequence:''};
    const cap=(uses)=>Object.assign(builtInCapabilities()[0],{uses});
    return {ids,empty:cond({}),bare:cond({intents:[bare]}),ready:cond({intents:[ready]}),ev:cond({evidence:[{intentId:1,claim:'c',label:'observed'}]}),rv:cond({reviews:[{intentId:1,criteria:[]}]}),stakes:cond({intents:[Object.assign({},bare,{consequence:'low'})]}),use:cond({capabilities:[cap([{date:'d',success:true}])]}),fail:cond({capabilities:[cap([{date:'d',success:false}])]}),sample:onboardingSteps(S).map(x=>x.done?1:0).join(''),
      fields:onboardingSteps(E).every(x=>x.title&&x.why.length>30&&x.todo.length>15&&x.view&&x.link),tour:sampleTour(),tour2:JSON.stringify(sampleTour())===JSON.stringify(sampleTour())};});
  rec('B1a onboardingSteps: six steps in order (intent, ready, evidence, review, stakes, capability), each with a title, a why sentence, a to-do, a view, and a link text',p.ids.join()==='intent,ready,evidence,review,stakes,capability'&&p.fields,p.ids.join());
  rec('B1b done comes from the data only: empty 000000; an incomplete intent 100000; a ready intent 110000; evidence 000100... each step alone: evidence 001000, review 000100, a consequence level 100010, a successful use 000001; an unsuccessful use counts for nothing; the sample 111111',p.empty==='000000'&&p.bare==='100000'&&p.ready==='110000'&&p.ev==='001000'&&p.rv==='000100'&&p.stakes==='100010'&&p.use==='000001'&&p.fail==='000000'&&p.sample==='111111',JSON.stringify([p.empty,p.bare,p.ready,p.ev,p.rv,p.stakes,p.use,p.fail,p.sample]));
  rec('B1c sampleTour gives three lines: ready 100% with medium consequence all minimums met; ready 100% with low consequence and 1 minimum open; not ready 38% with no consequence and 4 required items to fix; deterministic',p.tour.length===3&&/: ready, 100%\. Medium consequence, all minimums met\.$/.test(p.tour[0])&&/: ready, 100%\. Low consequence, 1 minimum open\.$/.test(p.tour[1])&&/: not ready, 38%\. No consequence set\. 4 required items to fix\.$/.test(p.tour[2])&&p.tour2,JSON.stringify(p.tour.map(x=>x.slice(-50))));
  rec('B1d logic.js still has no page, storage, clock, or random use',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(fs.readFileSync(REPO+'/app/logic.js','utf8')),'');
  // ---- defaults and links
  const dflt=await page.evaluate(()=>({view:['start','intents','review'].filter(n=>!document.getElementById('view-'+n).hidden).join(),nav:[...document.querySelectorAll('nav a')].map(a=>a.textContent).join()}));
  rec('B2a Start is the first navigation item, and the default view is still Intents',dflt.nav.startsWith('Start,Intents')&&dflt.view==='intents',JSON.stringify(dflt));
  const dash=await page.evaluate(()=>{const a=document.querySelector('#nextStep a');return {t:document.getElementById('nextStep').textContent,href:a&&a.getAttribute('href')};});
  await page.click('#nextStep a');await c.wait(150);
  rec('B2b the empty dashboard\'s next step ends with a link "New here? Open Start." that opens the Start view',/New here\? Open Start\.$/.test(dash.t)&&dash.href==='#start'&&(await page.evaluate(()=>!document.getElementById('view-start').hidden)),dash.t);
  // ---- the view (empty)
  const v=await page.evaluate(()=>({h2:document.querySelector('#view-start h2').textContent,text:document.querySelector('#view-start .panel').textContent,summary:document.getElementById('stepsSummary').textContent,steps:[...document.querySelectorAll('#steps > li')].map(li=>({id:li.dataset.step,t:li.querySelector('h4').textContent,badge:li.querySelector('.badge').textContent,why:li.querySelector('.claimtext').textContent,href:li.querySelector('a').getAttribute('href'),link:li.querySelector('a').textContent}))}));
  rec('B3a the Start view states the rule "Prompt to explore. Write intent to repeat." and the loop "Intent, Result, Evidence, Refined Intent, Better Result"',v.h2==='Start here'&&/Prompt to explore\. Write intent to repeat\./.test(v.text)&&/Intent, Result, Evidence, Refined Intent, Better Result/.test(v.text),'');
  rec('B3b six steps, all To do for an empty project, each with its why sentence and a link (Intents, Review, Review, Review, Review, Capabilities); the summary says "0 of 6 steps done. Next: write an intent."',v.steps.length===6&&v.steps.every(s=>s.badge==='To do'&&s.why.length>30)&&v.steps.map(s=>s.href).join()==='#intents,#review,#review,#review,#review,#capabilities'&&/^0 of 6 steps done\. Next: write an intent\./.test(v.summary)&&/Go to Intents$/.test(v.summary),v.summary);
  const prim=await page.$$eval('#view-start button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('B3c the Start view has exactly one filled button (Load the sample project)',prim.length===1&&prim[0]==='Load the sample project',JSON.stringify(prim));
  // ---- sample project
  await page.click('#loadSample');
  const dlg=await page.evaluate(()=>({open:document.getElementById('resetDialog').open,msg:document.getElementById('resetMsg').textContent}));
  await page.click('#resetConfirm');await c.wait(200);
  const after=await page.evaluate(()=>({sum:document.getElementById('stepsSummary').textContent,badges:[...document.querySelectorAll('#steps .badge')].map(b=>b.textContent),status:document.getElementById('startStatus').textContent,tour:[...document.querySelectorAll('#tour li')].map(l=>l.textContent),view:!document.getElementById('view-start').hidden}));
  rec('B4a "Load the sample project" opens the reset confirmation; once confirmed the view stays on Start, says the sample was loaded, shows all six steps Done, and the summary says all six are done',dlg.open&&/replaced by sample records|3 sample intents/.test(dlg.msg)&&after.view&&after.badges.every(b=>b==='Done')&&/^All 6 steps done\./.test(after.sum)&&/^Sample project loaded\./.test(after.status),JSON.stringify(after.sum));
  rec('B4b the tour on the Start view equals sampleTour() and lists the three sample intents',JSON.stringify(after.tour)===JSON.stringify(p.tour)&&after.tour.length===3,'');
  // tour equals what the Review view shows
  await c.view('review');const ids=(await c.stored()).intents.map(i=>i.id);const seen=[];
  for(const id of ids){await page.select('#reviewIntent',String(id));await c.wait(100);seen.push(await page.evaluate(()=>({r:document.getElementById('readinessSummary').textContent,g:document.getElementById('guardrailSummary').textContent||'none'})));}
  rec('B4c ...and agrees with the Review view: 100% Ready with medium all met; 100% Ready with low "1 of 1 ... open"; 38% Not ready with no guardrail',/100%\. Ready\./.test(seen[0].r)&&/all minimums for medium consequence are met/.test(seen[0].g)&&/100%\. Ready\./.test(seen[1].r)&&/1 of 1 minimums for low consequence are open/.test(seen[1].g)&&/38%\. Not ready yet\./.test(seen[2].r)&&seen[2].g==='none',JSON.stringify(seen.map(x=>x.r)));
  // ---- the journey: only the Start view's own links and instructions
  await c.start(null,1280,800,'#start');
  const sum=()=>c.text('#stepsSummary');
  const doneCount=()=>page.$$eval('#steps .badge',b=>b.filter(x=>x.textContent==='Done').length);
  const log=[await sum()];
  await page.click('#steps li[data-step="intent"] a');await c.wait(120);
  await page.click('#submitBtn');await c.wait(120);
  await c.view('start');log.push(await sum());
  const afterIntent=await doneCount();
  await page.click('#steps li[data-step="evidence"] a');await c.wait(120);
  await page.$eval('#claimText',e=>{e.value='The report page loads';});await page.$eval('#claimLabel',e=>{e.value='observed';});await page.click('#claimSave');await c.wait(120);
  await c.view('start');log.push(await sum());
  await page.click('#steps li[data-step="review"] a');await c.wait(120);
  await page.$eval('#notChecked',e=>{e.value='Other browsers';});await page.click('#reviewSave');await c.wait(120);
  await c.view('start');log.push(await sum());
  await page.click('#steps li[data-step="stakes"] a');await c.wait(120);
  await page.select('#consequence','low');await c.wait(120);
  await c.view('start');log.push(await sum());
  await page.click('#steps li[data-step="capability"] a');await c.wait(120);
  await page.click('#capList > li:nth-child(1) button[aria-label^="Record a successful use"]');await c.wait(120);
  await c.view('start');log.push(await sum());
  rec('B5 the journey: starting empty and using only the Start view\'s links and instructions (write the example intent, add a labelled claim, record a review, set a consequence, record a successful use), the summary goes 0, 2 (the example intent is also ready), 3, 4, 5, then "All 6 steps done."',/^0 of 6/.test(log[0])&&/^2 of 6 steps done\. Next: record evidence, and label it\./.test(log[1])&&afterIntent===2&&/^3 of 6/.test(log[2])&&/^4 of 6/.test(log[3])&&/^5 of 6/.test(log[4])&&/^All 6 steps done\./.test(log[5])&&(await doneCount())===6,JSON.stringify(log.map(x=>x.slice(0,34))));
  // ---- keyboard, phone, desktop nav
  await c.start(null,1280,800,'#start');
  await page.keyboard.press('Tab');await page.focus('#loadSample');
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;});
  await page.keyboard.press('Enter');await c.wait(150);
  rec('B6a keyboard: the Load button has a visible outline and Enter opens the confirmation',ol&&(await page.$eval('#resetDialog',d=>d.open)),'');
  await page.keyboard.press('Escape');
  for(const [w,h] of [[375,812],[1280,800]]){await c.start(null,w,h);const m=await page.evaluate(()=>({save:Math.round(document.getElementById('submitBtn').getBoundingClientRect().bottom+scrollY),vh:innerHeight,rows:new Set([...document.querySelectorAll('nav a')].map(a=>Math.round(a.getBoundingClientRect().top))).size}));
    rec('B6b with seven navigation items the Save intent button is still inside the window at '+w+'x'+h+' (nav rows: '+m.rows+')',m.save<=m.vh,JSON.stringify(m));}
  await c.start(null,375,812,'#start');
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('B6c the Start view has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','start-375'));
  await c.start(null,1280,800,'#start');await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','start-1280'));
});
