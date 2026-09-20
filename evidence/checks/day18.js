require('./h.js')('day18',async c=>{
  const {page,rec,fs,REPO}=c;
  await c.start(null);
  // ---- model
  const m=await page.evaluate(()=>{
    const counts=Object.fromEntries(CONSEQUENCES.map(l=>[l,GUARDRAIL_MINIMUMS[l].length]));
    const st=sampleState(1000);const it=st.intents[0];
    const n=l=>guardrailStatus(Object.assign({},it,{consequence:l}),st).items;
    const ids={low:n('low').map(x=>x.id),medium:n('medium').map(x=>x.id),high:n('high').map(x=>x.id)};
    const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};
    const fs2=deep(sampleState(2000));const a=JSON.stringify(guardrailStatus(fs2.intents[0],fs2)),b=JSON.stringify(guardrailStatus(fs2.intents[0],fs2));
    let crash=[];for(const bad of [undefined,null,{},{consequence:'high'},{id:1,consequence:'low'},{id:1,consequence:'bogus'}]){try{guardrailStatus(bad,{evidence:[],reviews:[]});}catch(e){crash.push(e.message);}}
    return {counts,lens:[n('low').length,n('medium').length,n('high').length],ids,same:a===b,crash,unset:guardrailStatus({id:1,consequence:''},st),src:GUARDRAIL_SOURCE,kinds:n('high').map(x=>x.kind)};});
  rec('G1a the table gives low 2, medium 2 more, high 2 more; guardrailStatus lists 2, 4, and 6 minimums',JSON.stringify(m.counts)==='{"low":2,"medium":2,"high":2}'&&JSON.stringify(m.lens)==='[2,4,6]',JSON.stringify(m.lens));
  rec('G1b each higher level includes every minimum of the lower ones, in order',m.ids.medium.slice(0,2).join()===m.ids.low.join()&&m.ids.high.slice(0,4).join()===m.ids.medium.join(),JSON.stringify(m.ids));
  rec('G1c guardrailStatus is deterministic, leaves frozen input alone, does not crash on odd input; unset gives no items; the source is business rule 6 and the glossary',m.same&&m.crash.length===0&&m.unset.items.length===0&&m.unset.level===''&&/business-rules\.md, rule 6/.test(m.src)&&/glossary\.md, Guardrail/.test(m.src),JSON.stringify(m.crash));
  const src=fs.readFileSync(REPO+'/app/logic.js','utf8');
  rec('G1d logic.js still has no page, storage, clock, or random use',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(src),'');
  // ---- sample intents in the view
  await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');
  const read=()=>page.evaluate(()=>({sel:document.getElementById('consequence').value,items:[...document.querySelectorAll('#guardrailList li')].map(l=>({b:l.querySelector('.badge').textContent,t:l.childNodes[1].textContent.trim()})),sum:document.getElementById('guardrailSummary').textContent,empty:!document.getElementById('guardrailEmpty').hidden,appr:!document.getElementById('approvalBox').hidden}));
  const a=await read();
  rec('G2a sample medium intent: 4 minimums (Check yourself, then three Met); the summary says all minimums for medium consequence are met and cites business rule 6',a.sel==='medium'&&a.items.length===4&&a.items.map(x=>x.b).join()==='Check yourself,Met,Met,Met'&&/^Guardrail: all minimums for medium consequence are met\. Source: context\/business-rules\.md, rule 6/.test(a.sum),JSON.stringify(a.items.map(x=>x.b)));
  const ids=(await c.stored()).intents.map(i=>i.id);
  await page.select('#reviewIntent',String(ids[1]));await c.wait(100);const b=await read();
  rec('G2b sample low intent: 2 minimums (Check yourself, Open), summary says 1 of 1 open',b.sel==='low'&&b.items.length===2&&b.items[0].b==='Check yourself'&&b.items[1].b==='Open'&&/Guardrail: 1 of 1 minimums for low consequence are open\./.test(b.sum),JSON.stringify(b.items));
  await page.select('#reviewIntent',String(ids[2]));await c.wait(100);const d=await read();
  rec('G2c the draft sample (no level): the section says to choose a level, and shows no minimums or summary',d.sel===''&&d.empty&&d.items.length===0&&d.sum==='','');
  // ---- choose a level
  await page.select('#consequence','medium');await c.wait(150);const e=await read();
  rec('G3a choosing medium shows 4 minimums: the evidence, readiness, and review ones Open for the draft; the message and stored level follow',e.items.length===4&&e.items.map(x=>x.b).join()==='Check yourself,Open,Open,Open'&&(await c.text('#guardrailStatus'))==='Consequence set to medium: Draft: onboarding checklist for new engineers.'&&(await c.stored()).intents[2].consequence==='medium',JSON.stringify(e.items.map(x=>x.b)));
  await page.reload({waitUntil:'load'});await c.view('review');await page.select('#reviewIntent',String(ids[2]));await c.wait(100);
  rec('G3b the level survives a reload',(await read()).sel==='medium','');
  await page.select('#consequence','');await c.wait(100);
  rec('G3c clearing the level removes the minimums and says "Consequence cleared"',(await read()).items.length===0&&/^Consequence cleared/.test(await c.text('#guardrailStatus')),'');
  // ---- high, approval
  await page.select('#reviewIntent',String(ids[0]));await c.wait(100);await page.select('#consequence','high');await c.wait(150);
  const h=await read();
  rec('G4a high shows 6 minimums with the assumed-claims and approval ones Open, and the approver field with a statement that the app cannot verify who approved',h.items.length===6&&h.items[4].b==='Open'&&h.items[5].b==='Open'&&h.appr&&/cannot verify who approved/.test(await c.text('#approvalBox')),JSON.stringify(h.items.map(x=>x.b)));
  await page.click('#recordApproval');
  rec('G4b recording an empty name is refused with a message and stores nothing',/^Type the approver's name first\./.test(await c.text('#guardrailStatus'))&&((await c.stored()).intents[0].approver||'')==='','');
  await page.$eval('#approver',x=>{x.value='Dana Reyes';});await page.click('#recordApproval');await c.wait(100);
  const h2=await read();
  rec('G4c a named approval is stored, shown, marks approval Met, and is announced',(await c.stored()).intents[0].approver==='Dana Reyes'&&h2.items[5].b==='Met'&&(await c.text('#guardrailStatus'))==='Approval recorded: Dana Reyes.'&&(await page.$eval('#approver',x=>x.value))==='Dana Reyes',JSON.stringify(h2.items.map(x=>x.b)));
  rec('G4d with approval given but an assumed claim left, the summary says 1 of 5 open',/Guardrail: 1 of 5 minimums for high consequence are open\./.test(h2.sum),h2.sum.slice(0,80));
  // relabel the assumed claim -> auto minimum flips
  const sel=await page.$$('#evidenceList select');await sel[2].select('observed');await c.wait(200);
  const h3=await read();
  rec('G5a relabelling the assumed claim to observed flips that minimum to Met without a reload; all minimums are now met',h3.items[4].b==='Met'&&/all minimums for high consequence are met/.test(h3.sum),JSON.stringify(h3.items.map(x=>x.b)));
  // low intent: add evidence via the form
  await page.select('#reviewIntent',String(ids[1]));await c.wait(100);
  await page.$eval('#claimText',x=>{x.value='The report has 3 issues';});await page.$eval('#claimLabel',x=>{x.value='observed';});await page.click('#claimSave');await c.wait(150);
  const l2=await read();
  rec('G5b adding an evidence claim flips the low intent\'s evidence minimum to Met and the summary to all met',l2.items[1].b==='Met'&&/all minimums for low consequence are met/.test(l2.sum),JSON.stringify(l2.items.map(x=>x.b)));
  // readiness flips the ready minimum
  await page.select('#reviewIntent',String(ids[2]));await c.wait(100);await page.select('#consequence','medium');await c.wait(100);
  await page.click('#editFromReview');await c.wait(250);
  for(const [id,v] of [['outputs','A checklist page'],['constraints','Under one page'],['criteria','The page lists 5 steps'],['stop','Stop when it lists 5 steps']])await page.$eval('#'+id,(x,val)=>{x.value=val;},v);
  await page.click('#submitBtn');await c.view('review');await page.select('#reviewIntent',String(ids[2]));await c.wait(100);
  const r2=await read();
  rec('G5c fixing the draft intent flips the "readiness check passes" minimum to Met',r2.items[2].b==='Met'&&r2.items[1].b==='Open'&&r2.items[3].b==='Open',JSON.stringify(r2.items.map(x=>x.b)));
  rec('G5d editing the intent did not lose its consequence level',r2.sel==='medium','');
  // ---- hostile approver name
  await page.select('#reviewIntent',String(ids[0]));await c.wait(100);
  await page.$eval('#approver',x=>{x.value='<img src=x onerror=window.__g=1><b>Eve</b>';});await page.click('#recordApproval');await c.wait(100);
  const hz=await page.evaluate(()=>({flag:window.__g||null,imgs:document.querySelectorAll('#guardrailStatus img,#guardrailStatus b,#guardrailList img').length,msg:document.getElementById('guardrailStatus').textContent}));
  rec('G6 a hostile approver name is shown as text and nothing runs',hz.flag===null&&hz.imgs===0&&/^Approval recorded: <img/.test(hz.msg),JSON.stringify(hz).slice(0,120));
  // ---- model storage
  const mm=await page.evaluate(()=>{const r=normalizeState({intents:[{id:1,outcome:'a',consequence:'extreme',approver:'X'},{id:2,outcome:'b',consequence:'high',approver:'Y'},{id:3,outcome:'c'}]},0).state.intents;return {c:r.map(x=>x.consequence),a:r.map(x=>x.approver),samples:sampleIntents(0).map(x=>x.consequence),mk:makeIntent({outcome:'o',consequence:'low',approver:'  Sam '},{id:1,now:0})};});
  rec('G7 an invalid stored consequence becomes not set; a valid one and the approver are kept; old data gets an empty approver; the sample intents are medium, low, and not set; makeIntent trims the approver',JSON.stringify(mm.c)==='["","high",""]'&&JSON.stringify(mm.a)==='["X","Y",""]'&&JSON.stringify(mm.samples)==='["medium","low",""]'&&mm.mk.approver==='Sam'&&mm.mk.consequence==='low',JSON.stringify(mm));
  // ---- guardrails do not block
  await c.view('intents');const before=(await c.stored()).intents.length;await page.$eval('#outcome',x=>{x.value='Saved while a high intent has open minimums';});await page.click('#submitBtn');
  rec('G8 nothing is blocked: with a high-consequence intent that has open minimums, Save intent still works',(await c.stored()).intents.length===before+1,'');
  // ---- keyboard
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');await page.select('#reviewIntent',String((await c.stored()).intents[2].id));await c.wait(100);
  await page.focus('#consequence');await page.keyboard.type('h');await c.wait(150);
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {id:document.activeElement.id,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0,box:!document.getElementById('approvalBox').hidden};});
  await page.keyboard.press('Tab');await page.keyboard.type('Kim Lee');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await c.wait(150);
  rec('G9 keyboard only: type "h" to choose High (outlined), the approver box appears, type a name, Tab to Record approval, Enter records it',ol.id==='consequence'&&ol.ol&&ol.box&&(await c.stored()).intents[2].approver==='Kim Lee'&&(await c.text('#guardrailStatus'))==='Approval recorded: Kim Lee.',JSON.stringify(ol));
  // ---- phone and one filled button
  const prim=await page.$$eval('#view-review button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('G10a the Review view still has exactly one filled button',prim.length===1&&prim[0]==='Save claim',JSON.stringify(prim));
  await c.start(null,375,812);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('review');await page.select('#consequence','high');await c.wait(100);
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('G10b the Review view with a high-consequence intent has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','guardrails-375'));
});
