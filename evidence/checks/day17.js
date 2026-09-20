require('./h.js')('day17',async c=>{
  const {page,rec,fs,REPO}=c;
  const iv=(id,o,rest)=>Object.assign({id,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'',outputs:'',constraints:'',criteria:'',stop:''},rest||{});
  await c.start(null);
  // ---- pure function
  const shape=await page.evaluate(()=>{const r=checkIntent(sampleIntents(0)[0]);return {ids:r.checks.map(x=>x.id),n:r.checks.length,fields:r.checks.every(x=>typeof x.pass==='boolean'&&x.message&&x.source&&typeof x.required==='boolean'&&x.label),req:r.checks.filter(x=>x.required).map(x=>x.id),score:r.score,ready:r.ready};});
  rec('V1a checkIntent returns eight checks, each with a pass flag, message, label, and source rule; the required five are outcome, constraints, criteria, stop, checkable',shape.n===8&&shape.fields&&JSON.stringify(shape.ids)==='["outcome","inputs","outputs","constraints","criteria","stop","checkable","clear"]'&&JSON.stringify(shape.req)==='["outcome","constraints","criteria","stop","checkable"]',JSON.stringify(shape.ids));
  const pure=await page.evaluate(()=>{const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};
    const i=deep({id:1,outcome:'Ship it easy',inputs:'a',outputs:'b',constraints:'c',criteria:'It is fast\nThe page shows "OK"',stop:'Done when good'});
    const a=JSON.stringify(checkIntent(i)),b=JSON.stringify(checkIntent(i));
    let crash=[];for(const bad of [undefined,null,5,'text',[],{},{id:1},{outcome:5,criteria:null,stop:{},inputs:['x']},{outcome:'x',criteria:'\n\n  \n'}]){try{checkIntent(bad);}catch(e){crash.push(String(bad)+': '+e.message);}}
    return {same:a===b,crash};});
  rec('V1b checkIntent is deterministic, leaves a frozen input alone, and does not crash on undefined, null, numbers, text, arrays, missing or non-text fields',pure.same&&pure.crash.length===0,JSON.stringify(pure.crash));
  const src=fs.readFileSync(REPO+'/app/logic.js','utf8');
  rec('V1c logic.js still has no page, storage, clock, or random use',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(src),'');
  // ---- scores
  const sc=await page.evaluate(()=>sampleIntents(0).map(i=>{const r=checkIntent(i);return [r.score,r.ready];}));
  rec('V2a the three sample intents score 100, 100, and 38, and are ready, ready, and not ready',JSON.stringify(sc)==='[[100,true],[100,true],[38,false]]',JSON.stringify(sc));
  const ex=fs.readFileSync(REPO+'/context/example-intent.md','utf8');
  const part=h=>{const m=ex.match(new RegExp('## '+h+'\\n([\\s\\S]*?)(?=\\n## |$)'));return m[1].trim();};
  const fromFile={outcome:part('Intent'),inputs:part('Inputs'),outputs:part('Outputs'),constraints:part('Constraints'),criteria:part('Success criteria'),stop:part('Stop when')};
  for(const k of Object.keys(fromFile)){if(k!=='outcome')fromFile[k]=fromFile[k].split('\n').map(l=>l.replace(/^- /,'')).join('\n');}
  const exr=await page.evaluate(i=>{const r=checkIntent(i);return {score:r.score,ready:r.ready,fails:r.checks.filter(x=>!x.pass).map(x=>x.id)};},fromFile);
  rec('V2b the example intent in context/example-intent.md scores 100 and is ready (the app\'s own check accepts its own example)',exr.score===100&&exr.ready&&exr.fails.length===0,JSON.stringify(exr));
  const cases=await page.evaluate(()=>{const base={id:1,outcome:'Export a report so that people can share it',inputs:'a',outputs:'b',constraints:'c',criteria:'The page shows a button\nThe file has 3 columns',stop:'Stop when both pass'};
    const f=(o)=>{const r=checkIntent(Object.assign({},base,o));return {s:r.score,r:r.ready,fail:r.checks.filter(x=>!x.pass).map(x=>x.id)};};
    return {noConstraintNoStop:f({constraints:'',stop:''}),uncheckable:f({criteria:'It should be intuitive and fast\nThe page shows a button'}),vagueOutcome:f({outcome:'Make it easy to export'}),onlyOutcome:f({inputs:'',outputs:'',constraints:'',criteria:'',stop:''}),noCriteria:f({criteria:''})};});
  rec('V2c exact scores: missing constraints and stop 75; an uncheckable criterion 88; a vague outcome 88; only an outcome 25; missing criteria 75 (criteria and checkable both fail); a vague outcome is still ready; the rest are not',cases.noConstraintNoStop.s===75&&cases.uncheckable.s===88&&cases.vagueOutcome.s===88&&cases.onlyOutcome.s===25&&cases.noCriteria.s===75&&!cases.noCriteria.r&&cases.vagueOutcome.r&&!cases.noConstraintNoStop.r&&!cases.uncheckable.r&&!cases.onlyOutcome.r,JSON.stringify({a:cases.noConstraintNoStop.s,b:cases.uncheckable.s,c:cases.vagueOutcome.s,d:cases.onlyOutcome.s,e:cases.noCriteria.s}));
  const msg=await page.evaluate(()=>{const r=checkIntent({outcome:'Make it easy and fast',inputs:'a',outputs:'b',constraints:'c',criteria:'It is intuitive\nIt is robust\nIt is smooth\nIt is modern\nThe button shows "Go"',stop:'When it is good'});return {check:r.checks.find(x=>x.id==='checkable').message,clear:r.checks.find(x=>x.id==='clear').message};});
  rec('V3 the criteria failure names up to three uncheckable lines and "and 1 more"; the clarity failure names the vague words',/"It is intuitive"; "It is robust"; "It is smooth" and 1 more\./.test(msg.check)&&/"easy"/.test(msg.clear)&&/"fast"/.test(msg.clear)&&/"good"/.test(msg.clear),JSON.stringify(msg));
  // ---- the view
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');
  const ui1=await page.evaluate(()=>({sum:document.getElementById('readinessSummary').textContent,rows:[...document.querySelectorAll('#readinessList li')].map(l=>({b:l.querySelector('.badge').textContent,src:l.querySelector('.src').textContent})),next:document.getElementById('readinessNext').textContent}));
  rec('V4a the first sample intent: "Readiness: 100%. Ready.", eight Pass rows each with a source, and the all-clear next step',ui1.sum==='Readiness: 100%. Ready.'&&ui1.rows.length===8&&ui1.rows.every(r=>r.b==='Pass'&&/^Source: context\//.test(r.src))&&/All required checks pass/.test(ui1.next),JSON.stringify(ui1).slice(0,200));
  await page.select('#reviewIntent',(await c.stored()).intents[2].id+'');await c.wait(100);
  const ui2=await page.evaluate(()=>({sum:document.getElementById('readinessSummary').textContent,fix:[...document.querySelectorAll('#readinessList li')].filter(l=>l.querySelector('.badge').textContent==='Fix').map(l=>l.textContent.replace(/\s+/g,' ').trim().slice(0,60)),next:document.getElementById('readinessNext').textContent}));
  rec('V4b the draft sample: "Readiness: 38%. Not ready yet.", five Fix rows, and "Fix 4 required items: constraints, success criteria, stop condition, every criterion can be checked."',ui2.sum==='Readiness: 38%. Not ready yet.'&&ui2.fix.length===5&&ui2.next==='Fix 4 required items: constraints, success criteria, stop condition, every criterion can be checked.',JSON.stringify(ui2));
  // edit from review
  await page.click('#editFromReview');await c.wait(250);
  const ed=await page.evaluate(()=>({view:['intents','review'].filter(n=>!document.getElementById('view-'+n).hidden),outcome:document.getElementById('outcome').value,label:document.getElementById('submitBtn').textContent,focus:document.activeElement.id}));
  rec('V5a "Edit this intent" opens the draft in the Intents view in edit mode with focus on the outcome',JSON.stringify(ed.view)==='["intents"]'&&/^Draft: onboarding/.test(ed.outcome)&&ed.label==='Update intent'&&ed.focus==='outcome',JSON.stringify(ed));
  for(const [id,v] of [['outputs','A checklist page'],['constraints','Under one page'],['criteria','The page lists 5 steps\nEach step has an owner'],['stop','Stop when both criteria pass']])await page.$eval('#'+id,(e,x)=>{e.value=x;},v);
  await page.click('#submitBtn');await c.view('review');await page.select('#reviewIntent',(await c.stored()).intents[2].id+'');await c.wait(100);
  rec('V5b after fixing and updating it, the Review view shows 100% and Ready',(await c.text('#readinessSummary'))==='Readiness: 100%. Ready.',await c.text('#readinessSummary'));
  // hostile text and storage
  await c.start({intents:[iv(1,'<b>x</b>',{criteria:'<img src=x onerror=window.__r=1> is intuitive'})]},1280,800,'#review');
  const h=await page.evaluate(()=>({flag:window.__r||null,imgs:document.querySelectorAll('#readinessList img,#readinessList b').length,txt:document.getElementById('readinessList').textContent.includes('<img src=x')}));
  rec('V6a text from the intent in a failing check is shown as text and nothing runs',h.flag===null&&h.imgs===0&&h.txt,JSON.stringify(h));
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');
  const raw=await page.evaluate(k=>localStorage.getItem(k),c.KEY);
  rec('V6b readiness is not stored: no score, ready flag, or list of checks in the stored data',!/"score"|"ready"|readiness/i.test(raw)&&!/"checks":\s*\[/.test(raw),'');
  // repeatable via the UI: reload gives the same
  await page.reload({waitUntil:'load'});await c.view('review');
  rec('V6c the same intent gives the same summary after a reload',(await c.text('#readinessSummary'))==='Readiness: 100%. Ready.','');
  // one filled button, keyboard, phone
  const prim=await page.$$eval('#view-review button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('V7a the Review view still has exactly one filled button (Edit this intent is a secondary button)',prim.length===1&&prim[0]==='Save claim',JSON.stringify(prim));
  await c.start(null,375,812);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('V7b the Review view with readiness has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await page.focus('#reviewIntent');let reached=false;for(let i=0;i<4;i++){await page.keyboard.press('Tab');if((await page.evaluate(()=>document.activeElement.id))==='editFromReview'){reached=true;break;}}
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;});
  rec('V7c the Edit this intent button is reachable by keyboard right after the intent selector, with a visible outline',reached&&ol,'');
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','readiness-375'));
});
