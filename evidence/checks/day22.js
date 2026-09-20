require('./h.js')('day22',async c=>{
  const {page,rec,fs,REPO}=c;
  const iv=(id,o,rest)=>Object.assign({id,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'i',outputs:'o',constraints:'c',criteria:'',stop:'s'},rest||{});
  await c.start(null);
  // ---- pure
  const p=await page.evaluate(()=>{const s=sampleState(0);const r=s.reviews[0];return {rev:sampleUsage('cap-evidence-review'),chk:sampleUsage('cap-intent-check'),none:sampleUsage('nope'),one:describeReview({criteria:[{text:'t',status:'met'}],findings:[{text:'x',label:'observed'}],notChecked:'Nothing else.'},{outcome:'Short'}),ids:[nextReviewId([],5),nextReviewId([{id:'rv-5-0'}],5),nextReviewId([{id:'rv-5-0'},{id:'rv-5-1'}],5)],clip:[clip('abcdef',6),clip('abcdefg',6),clip(undefined,5)],data:{statuses:r.criteria.map(x=>x.status),labels:r.findings.map(x=>x.label),nc:r.notChecked,out:s.intents[0].outcome}};});
  const d=p.data;const met=d.statuses.filter(x=>x==='met').length,un=d.statuses.filter(x=>x==='unmet').length,ut=d.statuses.filter(x=>x==='untested').length;
  const clipped=d.out.length>60?d.out.slice(0,57)+'…':d.out;
  const expectedRev='Review of "'+clipped+'": '+met+' met, '+un+' unmet, '+ut+' untested. '+d.labels.length+' findings ('+d.labels.filter(x=>x==='observed').length+' observed, '+d.labels.filter(x=>x==='inferred').length+' inferred, '+d.labels.filter(x=>x==='assumed').length+' assumed). Not checked: '+d.nc;
  rec('W1a sampleUsage for the review skill equals a sentence built independently from the sample review (2 met, 1 unmet, 1 untested; 3 findings, one per label; the gap)',p.rev===expectedRev,p.rev);
  rec('W1b sampleUsage for the intent check reads: Run on "Draft: onboarding checklist for new engineers": 38%, not ready. Fix 4 required items: constraints, success criteria, stop condition, every criterion can be checked.',p.chk==='Run on "Draft: onboarding checklist for new engineers": 38%, not ready. Fix 4 required items: constraints, success criteria, stop condition, every criterion can be checked.'&&p.none==='',p.chk);
  rec('W1c describeReview says "1 finding" for one; nextReviewId never repeats an id; clip shortens with an ellipsis and tolerates undefined',/1 finding \(1 observed, 0 inferred, 0 assumed\)/.test(p.one)&&p.ids.join()==='rv-5-0,rv-5-1,rv-5-2'&&p.clip.join('|')==='abcdef|abc…|',JSON.stringify([p.one,p.ids,p.clip]));
  const src=fs.readFileSync(REPO+'/app/logic.js','utf8');
  rec('W1d logic.js still has no page, storage, clock, or random use',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(src),'');
  // ---- cards
  await page.click('#resetSample');await page.click('#resetConfirm');await c.view('capabilities');
  const cards=await page.$$eval('#capList > li',ls=>ls.map(l=>({id:l.dataset.cap,h4:[...l.querySelectorAll('h4')].map(x=>x.textContent),sample:(l.querySelector('.sample')||{}).textContent})));
  rec('W2a both cards show a Sample usage that equals sampleUsage and the data; and the review card\'s numbers equal the sample review actually listed on the Review view',cards.length===2&&cards.every(k=>k.h4.includes('Sample usage'))&&cards[0].sample===p.chk&&cards[1].sample===p.rev,JSON.stringify(cards.map(k=>(k.sample||'').slice(0,40))));
  await c.view('review');
  const listed=await page.$eval('#reviewList li .claimtext',e=>e.textContent);
  rec('W2b ...and the Review view lists that same sample review with the same counts ("2 met, 1 unmet, 1 untested")',/2 met, 1 unmet, 1 untested/.test(listed)&&/2 met, 1 unmet, 1 untested/.test(p.rev),listed);
  // ---- form
  const f=await page.evaluate(()=>({rows:[...document.querySelectorAll('#criteriaRows .crow')].map(r=>({t:r.querySelector('label').textContent,v:r.querySelector('select').value,opts:[...r.querySelectorAll('option')].map(o=>o.textContent).join()})),boxes:['fObserved','fInferred','fAssumed','notChecked','reviewSummary'].every(i=>!!document.getElementById(i)),req:/required/.test(document.querySelector('label[for=notChecked]').textContent),btn:document.getElementById('reviewSave').className,shown:!document.getElementById('reviewForm').hidden}));
  const crits=(await c.stored()).intents[0].criteria.split('\n');
  rec('W3a the form has one row per criterion (labels equal the four criteria, default Untested, options Untested/Met/Unmet), three finding boxes, a required Not checked box, a summary, and a secondary button',f.shown&&JSON.stringify(f.rows.map(r=>r.t))===JSON.stringify(crits)&&f.rows.every(r=>r.v==='untested'&&r.opts==='Untested,Met,Unmet')&&f.boxes&&f.req&&/secondary/.test(f.btn),JSON.stringify(f.rows.length));
  const n0=(await c.stored()).reviews.length;
  await page.click('#reviewSave');
  rec('W3b recording without Not checked is refused with a message, focus moves to the box, and nothing is stored',/Say what was not checked/.test(await c.text('#reviewError'))&&(await page.evaluate(()=>document.activeElement.id))==='notChecked'&&(await c.stored()).reviews.length===n0,'');
  await page.select('#crit-0','met');await page.select('#crit-2','unmet');await page.select('#crit-3','unmet');
  await page.$eval('#fObserved',e=>{e.value='The button is there\nThe file downloads';});await page.$eval('#fInferred',e=>{e.value='The query is fast';});await page.$eval('#fAssumed',e=>{e.value='';});
  await page.$eval('#notChecked',e=>{e.value='Other browsers';});await page.$eval('#reviewSummary',e=>{e.value='Mostly fine';});
  await page.click('#reviewSave');await c.wait(150);
  const st=await c.stored();const rv=st.reviews[st.reviews.length-1];
  const valid=await page.evaluate(k=>normalizeState(JSON.parse(localStorage.getItem(k)),0).skipped,c.KEY);
  rec('W3c the review is stored valid for the selected intent: statuses as chosen, findings labelled by the box they were typed in (two observed, one inferred, none assumed), the gap, and the summary',rv.intentId===st.intents[0].id&&rv.criteria.map(x=>x.status).join()==='met,untested,unmet,unmet'&&rv.findings.map(x=>x.label+':'+x.text).join('|')==='observed:The button is there|observed:The file downloads|inferred:The query is fast'&&rv.notChecked==='Other browsers'&&rv.summary==='Mostly fine'&&valid===0,JSON.stringify(rv.criteria.map(x=>x.status)));
  rec('W3d it is listed under Reviews and the message reads "Review saved: 1 met, 2 unmet, 1 untested."',(await c.text('#reviewStatus'))==='Review saved: 1 met, 2 unmet, 1 untested.'&&(await page.$$eval('#reviewList > li',l=>l.length))===2,await c.text('#reviewStatus'));
  rec('W3e the form is reset afterwards (statuses back to Untested, boxes empty)',await page.evaluate(()=>[...document.querySelectorAll('#criteriaRows select')].every(s=>s.value==='untested')&&['fObserved','fInferred','fAssumed','notChecked','reviewSummary'].every(i=>document.getElementById(i).value==='')),'');
  // ---- no criteria
  await page.select('#reviewIntent',String(st.intents[2].id));await c.wait(120);
  const none=await page.evaluate(()=>({msg:!document.getElementById('reviewFormNone').hidden,form:document.getElementById('reviewForm').hidden}));
  rec('W4 an intent with no success criteria shows "nothing to review yet" and no form',none.msg&&none.form,JSON.stringify(none));
  // ---- guardrail
  await c.start({intents:[iv(1,'Guarded',{criteria:'The page shows a button',consequence:'medium',inputs:'a',outputs:'b',constraints:'c',stop:'d'})]},1280,800,'#review');
  const g=()=>page.$$eval('#guardrailList li',l=>l.map(x=>x.querySelector('.badge').textContent));
  const g0=await g();
  await page.$eval('#notChecked',e=>{e.value='Everything else';});await page.click('#reviewSave');await c.wait(150);
  const g1=await g();
  rec('W5 recording a review flips the medium guardrail\'s review minimum from Open to Met without a reload (the readiness minimum is already Met for this complete intent)',g0.join()==='Check yourself,Open,Met,Open'&&g1.join()==='Check yourself,Open,Met,Met',g0.join()+' -> '+g1.join());
  // ---- hostile text, phone, keyboard, one filled button
  await c.start({intents:[iv(1,'Hostile',{criteria:'<img src=x onerror=window.__w=1> shows '+'Z'.repeat(250)})]},375,812,'#review');
  await page.$eval('#fObserved',e=>{e.value='<svg onload=window.__w=1>';});await page.$eval('#notChecked',e=>{e.value='<script>window.__w=1</script>';});await page.click('#reviewSave');await c.wait(150);
  const hz=await page.evaluate(()=>({flag:window.__w||null,bad:document.querySelectorAll('#criteriaRows img,#reviewList svg,#reviewList script,#reviewList img').length,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,shown:document.getElementById('reviewList').textContent.includes('<svg onload')}));
  rec('W6a hostile text in a criterion, a finding, and the gap is shown as text, nothing runs, and a 250-character unbroken criterion causes no horizontal scroll at 375px',hz.flag===null&&hz.bad===0&&hz.shown&&hz.sw<=hz.cw,JSON.stringify(hz));
  await c.start({intents:[iv(1,'Kbd',{criteria:'The page shows a button\nThe file has 3 columns'})]},1280,800,'#review');
  await page.focus('#crit-0');await page.keyboard.type('m');
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {v:document.activeElement.value,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};});
  await page.focus('#notChecked');await page.keyboard.type('By keyboard');await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await c.wait(150);
  const kr=(await c.stored()).reviews;
  rec('W6b keyboard only: type "m" on a status (outlined), type the gap, Tab to Record review, Enter: a review with the first criterion Met is stored',ol.v==='met'&&ol.ol&&kr.length===1&&kr[0].criteria[0].status==='met'&&kr[0].notChecked==='By keyboard',JSON.stringify(ol));
  const prim=await page.$$eval('#view-review button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('W6c the Review view still shows exactly one filled button (Save claim)',prim.length===1&&prim[0]==='Save claim',JSON.stringify(prim));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','record-review'));
});
