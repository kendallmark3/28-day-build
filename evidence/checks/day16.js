require('./h.js')('day16',async c=>{
  const {page,rec}=c;
  const iv=(id,o)=>({id,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'i',outputs:'o',constraints:'c',criteria:'k',stop:'s'});
  const ev=(id,intentId,claim,label,source)=>({id,intentId,claim,label,source:source||'',created:'2026-01-01T00:00:00.000Z'});
  const vis=async()=>page.evaluate(()=>['intents','review','overview','references','about'].filter(n=>!document.getElementById('view-'+n).hidden));
  // sample state
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');
  await page.click('nav a[href="#review"]');await c.wait(150);
  rec('E1a a Review nav item opens the Review view',JSON.stringify(await vis())==='["review"]','');
  const parts=await page.evaluate(()=>({select:!!document.getElementById('reviewIntent'),list:!!document.getElementById('evidenceList'),form:['claimText','claimLabel','claimSource'].every(i=>!!document.getElementById(i)),reviews:!!document.getElementById('reviewList')}));
  rec('E1b the view has an intent selector, an evidence list, a claim form (claim, label, source), and a reviews list',Object.values(parts).every(Boolean),JSON.stringify(parts));
  const badges=await page.$$eval('#evidenceList .badge',b=>b.map(x=>x.textContent));
  const findingBadges=await page.$$eval('#reviewList .badge',b=>b.map(x=>x.textContent));
  rec('E2 sample evidence shows Observed, Inferred, Assumed badges, and the review findings show all three too',JSON.stringify(badges)==='["Observed","Inferred","Assumed"]'&&JSON.stringify([...new Set(findingBadges)].sort())==='["Assumed","Inferred","Observed"]',JSON.stringify({badges,findingBadges}));
  rec('E6a the summary says: 3 claims: 1 observed, 1 inferred, 1 assumed. 1 assumed claim still needs confirming.',(await c.text('#epistemic'))==='3 claims: 1 observed, 1 inferred, 1 assumed. 1 assumed claim still needs confirming.',await c.text('#epistemic'));
  // add claim: refusals
  const n0=(await c.stored()).evidence.length;
  await page.$eval('#claimText',e=>{e.value='A claim with no label';});await page.click('#claimSave');
  const e1=await c.text('#evidenceError');const shown1=await page.$eval('#evidenceError',e=>!e.hidden);
  await page.$eval('#claimText',e=>{e.value='';});await page.$eval('#claimLabel',e=>{e.value='observed';});await page.click('#claimSave');
  const e2=await c.text('#evidenceError');
  rec('E3a a claim without a label is refused with a message to choose observed, inferred, or assumed; nothing saved',shown1&&/Choose whether this claim is observed, inferred, or assumed/.test(e1)&&/Write the claim first/.test(e2)&&(await c.stored()).evidence.length===n0,e1+' | '+e2);
  // add claim
  await page.$eval('#claimText',e=>{e.value='The query uses an index';});await page.$eval('#claimLabel',e=>{e.value='inferred';});await page.$eval('#claimSource',e=>{e.value='Read the query plan';});await page.click('#claimSave');
  const st=await c.stored();const added=st.evidence[st.evidence.length-1];
  const valid=await page.evaluate(k=>normalizeState(JSON.parse(localStorage.getItem(k)),0).skipped,c.KEY);
  const lastBadge=await page.$$eval('#evidenceList li',l=>{const x=l[l.length-1];return {b:x.querySelector('.badge').textContent,t:x.querySelector('.claimtext').textContent,s:x.querySelector('.note').textContent};});
  rec('E3b a saved claim appears with its label and source, is stored as a valid record for the selected intent, and the status reads "Evidence saved: ... (Inferred)."',lastBadge.b==='Inferred'&&lastBadge.t==='The query uses an index'&&/Read the query plan/.test(lastBadge.s)&&added.claim==='The query uses an index'&&added.label==='inferred'&&added.intentId===st.intents[0].id&&valid===0&&(await c.text('#evidenceStatus'))==='Evidence saved: The query uses an index (Inferred).',await c.text('#evidenceStatus'));
  rec('E3c the form is cleared after saving and focus returns to the claim box',(await page.$eval('#claimText',e=>e.value))===''&&(await page.evaluate(()=>document.activeElement.id))==='claimText','');
  // change label
  const sels=await page.$$('#evidenceList select');
  await sels[2].select('observed');await c.wait(150);
  const st2=await c.stored();const changed=st2.evidence.find(e=>e.claim==='Customers open the CSV in a spreadsheet application.');
  const badge2=await page.$$eval('#evidenceList .badge',b=>b.map(x=>x.textContent));
  rec('E4 changing a label updates the stored record and the badge, and the status says so',changed.label==='observed'&&badge2[2]==='Observed'&&/^Label changed to observed: Customers open the CSV/.test(await c.text('#evidenceStatus')),await c.text('#evidenceStatus'));
  rec('E6b the summary follows: 4 claims: 2 observed, 2 inferred, 0 assumed. (no confirming sentence)',(await c.text('#epistemic'))==='4 claims: 2 observed, 2 inferred, 0 assumed.',await c.text('#epistemic'));
  // pure summary
  const sm=await page.evaluate(()=>[epistemicSummary([]),epistemicSummary([{label:'assumed'}]),epistemicSummary([{label:'assumed'},{label:'assumed'},{label:'observed'}]),epistemicSummary([{label:'observed'}])]);
  rec('E6c epistemicSummary: none, singular, plural, and no assumptions',sm[0]==='No claims recorded yet.'&&sm[1]==='1 claim: 0 observed, 0 inferred, 1 assumed. 1 assumed claim still needs confirming.'&&/3 claims.*2 assumed claims still need confirming\./.test(sm[2])&&sm[3]==='1 claim: 0 observed, 0 inferred, 0 assumed.'.replace('0 observed, 0 inferred, 0 assumed','1 observed, 0 inferred, 0 assumed'),JSON.stringify(sm));
  // empty states
  await c.start(null,1280,800,'#review');
  const emptyMsg=await page.evaluate(()=>({t:document.getElementById('reviewEmpty').textContent,vis:!document.getElementById('reviewEmpty').hidden,link:!!document.querySelector('#reviewEmpty a[href="#intents"]'),body:document.getElementById('reviewBody').hidden}));
  rec('E7a no intents: says to save an intent first, links to Intents, and hides the form',emptyMsg.vis&&/Save an intent first/.test(emptyMsg.t)&&emptyMsg.link&&emptyMsg.body,JSON.stringify(emptyMsg));
  await c.start({intents:[iv(1,'One')]},1280,800,'#review');
  const em2=await page.evaluate(()=>({vis:!document.getElementById('evidenceEmpty').hidden,t:document.getElementById('evidenceEmpty').textContent}));
  rec('E7b an intent with no evidence: says what to add and to label each claim',em2.vis&&/Add a claim/.test(em2.t)&&/observed, inferred, or assumed/.test(em2.t),em2.t);
  // two intents
  await c.start({intents:[iv(1,'First intent'),iv(2,'Second intent')],evidence:[ev('a',1,'Claim for one','observed'),ev('b',2,'Claim for two','assumed')]},1280,800,'#review');
  const first=await page.$$eval('#evidenceList .claimtext',l=>l.map(x=>x.textContent));
  await page.select('#reviewIntent','2');await c.wait(100);
  const second=await page.$$eval('#evidenceList .claimtext',l=>l.map(x=>x.textContent));
  rec('E8 choosing another intent shows only that intent\'s evidence',JSON.stringify(first)==='["Claim for one"]'&&JSON.stringify(second)==='["Claim for two"]',JSON.stringify({first,second}));
  // persistence and hostile text
  await page.$eval('#claimText',e=>{e.value='<img src=x onerror=window.__z=1><script>window.__z=1</script>';});await page.$eval('#claimLabel',e=>{e.value='assumed';});await page.$eval('#claimSource',e=>{e.value='"><svg onload=window.__z=1>';});await page.click('#claimSave');
  await page.reload({waitUntil:'load'});await c.view('review');await page.select('#reviewIntent','2');await c.wait(100);
  const hostile=await page.evaluate(()=>({flag:window.__z||null,bad:document.querySelectorAll('#evidenceList img,#evidenceList script,#evidenceList svg').length,txt:[...document.querySelectorAll('#evidenceList .claimtext')].map(x=>x.textContent)}));
  rec('E9a evidence survives a reload; hostile HTML in a claim and source is shown as text and nothing runs',hostile.flag===null&&hostile.bad===0&&hostile.txt.length===2&&/^<img/.test(hostile.txt[1]),JSON.stringify(hostile).slice(0,160));
  // keyboard
  await c.start({intents:[iv(1,'Kbd')]},1280,800,'#review');
  await page.focus('#claimText');await page.keyboard.type('Typed by keyboard');await page.keyboard.press('Tab');
  await page.keyboard.type('i');
  const ol1=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {id:document.activeElement.id,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0,val:document.activeElement.value};});
  await page.keyboard.press('Tab');await page.keyboard.type('by hand');await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  const saved=(await c.stored()).evidence;
  rec('E9b keyboard only: type a claim, choose a label by typing its first letter, add a source, press Save claim; focused select has a visible outline',ol1.id==='claimLabel'&&ol1.ol&&saved.length===1&&saved[0].claim==='Typed by keyboard'&&saved[0].label==='inferred'&&saved[0].source==='by hand',JSON.stringify({ol1,saved:saved.map(s=>s.label)}));
  // one filled button on the view
  const prim=await page.$$eval('#view-review button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('E9c the Review view shows exactly one filled button',prim.length===1&&prim[0]==='Save claim',JSON.stringify(prim));
  // end link
  const endLink=await page.evaluate(()=>{const p=[...document.querySelector('#view-review .panel').children];const last=p[p.length-1];return last.querySelector('a[href="#overview"]')?last.textContent:'';});
  rec('E10 the Review view ends with a link to the next action',/Next: see the whole picture/.test(endLink),endLink);
  // phone
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');
  await c.start(await c.stored(),375,812,'#review');
  const ph=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('E11 the Review view (with sample data and a long claim) has no horizontal scroll at 375px',ph.sw<=ph.cw,JSON.stringify(ph));
  await page.$eval('#claimText',e=>{e.value='L'.repeat(300);});await page.$eval('#claimLabel',e=>{e.value='observed';});await page.click('#claimSave');
  const ph2=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('E11b ...and after saving a 300-character unbroken claim',ph2.sw<=ph2.cw,JSON.stringify(ph2));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','review-375'));
  // model
  const m=await page.evaluate(()=>{
    const mk=(f)=>normalizeState({intents:[{id:1,outcome:'o'}],reviews:[{intentId:1,criteria:[{text:'t',status:'met'}],findings:f}]},0);
    const good=mk([{text:'x',label:'observed'}]),none=normalizeState({intents:[{id:1,outcome:'o'}],reviews:[{intentId:1,criteria:[]}]},0);
    const bad1=mk([{text:'x',label:'guess'}]),bad2=mk([{text:'',label:'observed'}]),bad3=mk('notalist');
    const s=sampleState(5);const sn=normalizeState(s,5);
    return {good:[good.skipped,good.state.reviews.length],none:[none.skipped,none.state.reviews.length,none.state.reviews[0].findings.length],bad:[bad1.skipped,bad2.skipped,bad3.skipped],labels:[...new Set(s.reviews[0].findings.map(f=>f.label))].sort(),sampleDrops:sn.skipped,idNew:nextEvidenceId([{id:'ev-1-0'},{id:'ev-1-1'}],1)};});
  rec('E12 review findings: valid kept; a review without findings still loads; unlabelled, wrongly labelled, and malformed findings drop the review and are counted; the sample review has all three labels and loses nothing',JSON.stringify(m.good)==='[0,1]'&&JSON.stringify(m.none)==='[0,1,0]'&&JSON.stringify(m.bad)==='[1,1,1]'&&JSON.stringify(m.labels)==='["assumed","inferred","observed"]'&&m.sampleDrops===0,JSON.stringify(m));
  rec('E13 nextEvidenceId never repeats an existing id',m.idNew==='ev-1-2',m.idNew);
  // F4 wording
  await c.start(null);await page.click('#resetSample');
  const rmsg=await c.text('#resetMsg');
  rec('E14 with no saved intents, the reset confirmation says other records are replaced (Day 15 finding F4)',/replaced/.test(rmsg)&&/^You have no saved intents/.test(rmsg),rmsg);
});
