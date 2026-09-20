require('./h.js')('day11',async c=>{
  const {page,rec,REPO,fs}=c;
  const intent=(id,o)=>({id,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'in',outputs:'out',constraints:'c',criteria:'k',stop:'s'});
  // 1 stored shape after the first save
  await c.start(null);await page.click('#submitBtn');
  const st1=await c.stored();
  rec('M1 after the first save the stored data has version 2 and all five record arrays and a progress object',st1.version===2&&['projects','intents','evidence','reviews','capabilities'].every(k=>Array.isArray(st1[k]))&&typeof st1.progress==='object'&&st1.intents.length===1,JSON.stringify(Object.keys(st1)));
  // 2 old shape loads with every value intact, others created
  const old={intents:[Object.assign(intent(11,'Old one'),{inputs:'keep me',outputs:'and me',constraints:'con',criteria:'cri',stop:'sto'}),intent(12,'Old two')]};
  await c.start(old);
  const n=await page.evaluate(k=>normalizeState(JSON.parse(localStorage.getItem(k)),0),c.KEY);
  const i0=n.state.intents[0];
  rec('M2a old-shape data: every intent value is intact',n.skipped===0&&n.state.intents.length===2&&i0.inputs==='keep me'&&i0.outputs==='and me'&&i0.constraints==='con'&&i0.criteria==='cri'&&i0.stop==='sto'&&i0.id===11&&i0.created==='2026-01-01T00:00:00.000Z','');
  rec('M2b old-shape data: one project, two built-in capabilities, no evidence or reviews',n.state.projects.length===1&&n.state.capabilities.length===2&&n.state.evidence.length===0&&n.state.reviews.length===0&&n.state.version===2,'');
  rec('M2c the app lists the old intents and, after one save, stores them all in the new shape',JSON.stringify(await page.$$eval('#intentList li > span',l=>l.map(x=>x.textContent)))==='["Old one","Old two"]'&&(await(async()=>{await page.click('#submitBtn');const s=await c.stored();return s.version===2&&s.intents.length===3&&s.intents[0].inputs==='keep me';})()),'');
  // 3 purity
  const logic=fs.readFileSync(REPO+'/app/logic.js','utf8');
  rec('M3a logic.js never touches the page or storage or the clock (no document, window, localStorage, or Date.now())',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(/.test(logic),'');
  const pure=await page.evaluate(()=>{
    const out={};const fns={
      emptyState:()=>emptyState(1000),
      makeIntent:()=>makeIntent({outcome:' a ',inputs:'b'},{id:1,now:1000}),
      makeEvidence:()=>makeEvidence({intentId:1,claim:'x',label:'observed',source:'s'},{id:'e1',now:1000}),
      makeReview:()=>makeReview({intentId:1,criteria:[{text:'t',status:'met'}]},{id:'r1',now:1000}),
      makeCapability:()=>makeCapability({name:'n',level:'skill'},{id:'c1',now:1000}),
      normalizeState:()=>normalizeState({intents:[{id:1,outcome:'o'}]},1000),
      sampleState:()=>sampleState(1000)};
    for(const [k,f] of Object.entries(fns))out[k]=JSON.stringify(f())===JSON.stringify(f());
    const input={intents:[{id:1,outcome:'o',inputs:'i'}],evidence:[{intentId:1,claim:'c',label:'bogus'}]};const before=JSON.stringify(input);normalizeState(input,1000);out.inputUnchanged=JSON.stringify(input)===before;
    const mi=makeIntent({outcome:'  padded  '},{id:5,now:0});out.trim=mi.outcome==='padded'&&mi.projectId==='project-1'&&mi.created==='1970-01-01T00:00:00.000Z';
    return out;});
  rec('M3b the six model functions and normalizeState/sampleState give the same output for the same input',['emptyState','makeIntent','makeEvidence','makeReview','makeCapability','normalizeState','sampleState'].every(k=>pure[k]),JSON.stringify(pure));
  rec('M3c normalizeState does not change its input; makeIntent trims and sets the project and date from what it is given',pure.inputUnchanged&&pure.trim,'');
  // 4 drops invalid, counts them
  const dirty={intents:[{id:1,outcome:'ok'},{id:2,outcome:''},{id:3,outcome:'ok3'},null],
    evidence:[{id:'e1',intentId:1,claim:'fine',label:'observed'},{id:'e2',intentId:1,claim:'bad label',label:'guess'},{id:'e3',intentId:99,claim:'no such intent',label:'observed'},{id:'e4',intentId:3,claim:'',label:'assumed'}],
    reviews:[{id:'r1',intentId:1,criteria:[{text:'a',status:'met'}]},{id:'r2',intentId:1,criteria:[{text:'a',status:'passed'}]},{id:'r3',intentId:42,criteria:[]}],
    capabilities:[{id:'x1',name:'Mine',level:'workflow',uses:[{date:'d',success:true}]},{id:'x2',name:'Bad level',level:'wizard',uses:[]},{id:'x3',name:'Bad use',level:'skill',uses:[{date:'d'}]}]};
  const dn=await page.evaluate(d=>normalizeState(d,0),dirty);
  rec('M4a invalid records are dropped and counted: 2 intents (empty outcome, null), 3 evidence (bad label, missing intent, empty claim), 2 reviews (bad status, missing intent), 2 capabilities (bad level, bad use) = 9',dn.skipped===9,dn.skipped);
  rec('M4b valid records are kept: 2 intents, 1 evidence, 1 review, the user capability plus the 2 built-ins',dn.state.intents.length===2&&dn.state.evidence.length===1&&dn.state.evidence[0].id==='e1'&&dn.state.reviews.length===1&&dn.state.capabilities.length===3&&dn.state.capabilities.some(x=>x.id==='x1'&&x.level==='workflow'),JSON.stringify(dn.state.capabilities.map(x=>x.id)));
  // 5 built-ins
  const bi=await page.evaluate(()=>emptyState(0).capabilities);
  const fields=['purpose','procedure','output','checks','owner','version'];
  rec('M5a two built-in capabilities, "Intent check" and "Evidence-first review", each with purpose, procedure, output, checks, owner, version, level skill, no uses, not promoted',bi.length===2&&bi[0].name==='Intent check'&&bi[1].name==='Evidence-first review'&&bi.every(b=>fields.every(f=>b[f].trim().length>0)&&b.level==='skill'&&b.uses.length===0&&b.promoted===false),'');
  const readd=await page.evaluate(()=>normalizeState({intents:[],capabilities:[{id:'cap-intent-check',name:'renamed by damage',level:'business',uses:[{date:'d',success:true}],promoted:true}]},0).state.capabilities);
  rec('M5b built-ins are added back if missing; a stored built-in keeps its uses, promotion, and level but gets its descriptive text back',readd.length===2&&readd[0].name==='Intent check'&&readd[0].promoted===true&&readd[0].uses.length===1&&readd[0].level==='business'&&readd[1].id==='cap-evidence-review','');
  // 6 sample data and reset
  await c.start({intents:[intent(1,'Mine A'),intent(2,'Mine B')]});
  await page.click('#resetSample');
  const msg=await c.text('#resetMsg');await page.click('#resetConfirm');
  const ss=await c.stored();
  rec('M6a the reset confirmation says evidence, reviews, and capability records are replaced too',/Evidence, reviews, and capability records are replaced too/.test(msg),msg);
  rec('M6b after a reset: at least 3 intents, evidence in each of the three labels, at least 1 review',ss.intents.length>=3&&LABELS(ss).every(Boolean)&&ss.reviews.length>=1,JSON.stringify({i:ss.intents.length,e:ss.evidence.map(x=>x.label),r:ss.reviews.length}));
  function LABELS(s){return ['observed','inferred','assumed'].map(l=>s.evidence.some(e=>e.label===l));}
  rec('M6c after a reset: both built-in capabilities have uses, exactly one is promoted, and progress days are ticked',ss.capabilities.length===2&&ss.capabilities.every(x=>x.uses.length>0)&&ss.capabilities.filter(x=>x.promoted).length===1&&Object.keys(ss.progress.days).length>=1,JSON.stringify({p:ss.capabilities.map(x=>x.promoted),d:Object.keys(ss.progress.days).length}));
  const valid=await page.evaluate(k=>{const raw=JSON.parse(localStorage.getItem(k));const r=normalizeState(raw,0);return {skipped:r.skipped,same:r.state.intents.length===raw.intents.length&&r.state.evidence.length===raw.evidence.length&&r.state.reviews.length===raw.reviews.length&&r.state.capabilities.length===raw.capabilities.length};},c.KEY);
  rec('M6d the sample state is fully valid: normalizing it drops nothing',valid.skipped===0&&valid.same,JSON.stringify(valid));
  // 7 Overview
  await page.click('nav a[href="#overview"]');await c.wait(150);
  const nav=await page.$$eval('nav a',a=>a.map(x=>x.textContent));
  const cnt=await page.$$eval('#modelCounts li',ls=>Object.fromEntries(ls.map(l=>[l.querySelector('span').textContent,l.querySelector('strong').textContent])));
  const heading=await page.$$eval('#view-overview h3',h=>h.map(x=>x.textContent));
  const want={Projects:String(ss.projects.length),Intents:String(ss.intents.length),'Evidence records':String(ss.evidence.length),Reviews:String(ss.reviews.length),Capabilities:String(ss.capabilities.length)};
  rec('M7 the Overview view has a "Data model" panel whose five counts match the stored data',nav.includes('Overview')&&heading.includes('Data model')&&JSON.stringify(cnt)===JSON.stringify(want),JSON.stringify(cnt));
  await c.start(null,375,812,'#overview');
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('M8 Overview has no horizontal scroll at 375px; a fresh store shows 1 project, 0 intents, 0 evidence, 0 reviews, 2 capabilities',ow.sw<=ow.cw&&JSON.stringify(await page.$$eval('#modelCounts strong',s=>s.map(x=>x.textContent)))==='["1","0","0","0","2"]',JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','overview-375'));
});
