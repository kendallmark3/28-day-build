require('./h.js')('day20',async c=>{
  const {page,rec,fs,REPO}=c;
  const panel=()=>page.evaluate(()=>({h3:[...document.querySelectorAll('#view-overview h3')].map(h=>h.textContent),caption:document.querySelector('#flow').previousElementSibling.textContent,stages:[...document.querySelectorAll('#flow > li')].map(li=>({id:li.dataset.stage,name:li.querySelector('h4').textContent,what:li.querySelector('p').textContent,count:li.querySelector('.flowcount strong').textContent,detail:li.querySelector('.flowcount span').textContent,href:(li.querySelector('a')||{}).href?li.querySelector('a').getAttribute('href'):null,link:(li.querySelector('a')||{}).textContent||''}))}));
  await c.start(null);
  // ---- pure
  const p=await page.evaluate(()=>{const e=flowStages(emptyState(0),7);const s=flowStages(sampleState(1000),7);const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};const fz=deep(sampleState(5));return {empty:e.map(x=>[x.id,x.count,x.rest,x.view]),sample:s.map(x=>[x.id,x.count,x.rest]),same:JSON.stringify(flowStages(fz,7))===JSON.stringify(flowStages(fz,7)),len:e.length};});
  rec('O1a flowStages: six stages in order Intent, Context, Build, Evidence, Review, Capability; an empty project gives 0, 7 (the context count passed in), 0, 0, 0, 0 promoted of 2',JSON.stringify(p.empty.map(x=>x[0]))==='["intent","context","build","evidence","review","capability"]'&&JSON.stringify(p.empty.map(x=>x[1]))==='[0,7,0,0,0,0]'&&p.empty[5][2]===' of 2 promoted'&&p.empty[0][2]===' saved, 0 ready',JSON.stringify(p.empty));
  rec('O1b sample data: 3 intents (2 ready), 8 of 28 days, 3 claims (1 assumed), 1 review, 1 of 2 promoted; deterministic on frozen input',JSON.stringify(p.sample)==='[["intent",3," saved, 2 ready"],["context",7," files the app follows"],["build",8," of 28 days done"],["evidence",3," claims, 1 assumed"],["review",1," review recorded"],["capability",1," of 2 promoted"]]'&&p.same,JSON.stringify(p.sample));
  const src=fs.readFileSync(REPO+'/app/logic.js','utf8');
  rec('O1c logic.js still has no page, storage, clock, or random use',!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(src),'');
  // ---- the view
  await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');
  const v=await panel();
  rec('O2a the Overview has a "How it fits together" panel with a caption about Review sharpening the next Intent, and the six stages in order, each with a description',v.h3.includes('How it fits together')&&/What you learn at Review sharpens your next Intent/.test(v.caption)&&v.stages.map(s=>s.name).join()==='Intent,Context,Build,Evidence,Review,Capability'&&v.stages.every(s=>s.what.length>15),JSON.stringify(v.stages.map(s=>s.name)));
  rec('O2b the counts read as sentences and match the stored data: "3 saved, 2 ready", "7 files the app follows", "8 of 28 days done", "3 claims, 1 assumed", "1 review recorded", "1 of 2 promoted"',JSON.stringify(v.stages.map(s=>s.count+s.detail))==='["3 saved, 2 ready","7 files the app follows","8 of 28 days done","3 claims, 1 assumed","1 review recorded","1 of 2 promoted"]',JSON.stringify(v.stages.map(s=>s.count+s.detail)));
  const st=await c.stored();
  rec('O2c ...and equal the stored data itself (intents, evidence, reviews, ticked days, promoted capabilities)',+v.stages[0].count===st.intents.length&&+v.stages[3].count===st.evidence.length&&+v.stages[4].count===st.reviews.length&&+v.stages[2].count===Object.keys(st.progress.days).length&&+v.stages[5].count===st.capabilities.filter(x=>x.promoted).length,'');
  rec('O3a links: Intent to #intents, Context to #references, Evidence and Review to #review; Build and Capability have none',JSON.stringify(v.stages.map(s=>s.href))==='["#intents","#references",null,"#review","#review",null]',JSON.stringify(v.stages.map(s=>s.href)));
  const opened=[];
  for(const id of ['intent','context','evidence','review']){await c.view('overview');await page.click('#flow li[data-stage="'+id+'"] a');await c.wait(150);opened.push((await page.evaluate(()=>['intents','review','overview','references','about'].filter(n=>!document.getElementById('view-'+n).hidden))).join());}
  rec('O3b each link opens its view (Intents, References, Review, Review)',JSON.stringify(opened)==='["intents","references","review","review"]',JSON.stringify(opened));
  // ---- live update
  await c.view('intents');await page.click('#submitBtn');await c.view('overview');
  const v2=await panel();
  rec('O4 after saving an intent, the Intent stage reads "4 saved, 3 ready" without a reload',v2.stages[0].count+v2.stages[0].detail==='4 saved, 3 ready','');
  await c.view('review');const sel=await page.$$('#evidenceList select');await sel[2].select('observed');await c.wait(150);await c.view('overview');
  rec('O4b after relabelling the assumed claim, the Evidence stage reads "3 claims, 0 assumed"',(await panel()).stages[3].count+(await panel()).stages[3].detail==='3 claims, 0 assumed','');
  // ---- semantics and styling
  const sem=await page.evaluate(()=>{const ol=document.getElementById('flow');return {tag:ol.tagName,items:ol.children.length,allLi:[...ol.children].every(x=>x.tagName==='LI'),arrows:document.querySelectorAll('#flow .arrow,#flow img,#flow svg,#view-overview script,#view-overview img').length,after:getComputedStyle(document.querySelector('#flow li'),'::after').content};});
  const css=fs.readFileSync(REPO+'/app/styles.css','utf8');
  rec('O5a the flow is an ordered list of six items; arrows are CSS-generated with empty alternative text (hidden from assistive technology), and there is no image, svg, or script',sem.tag==='OL'&&sem.items===6&&sem.allLi&&sem.arrows===0&&sem.after!=='none'&&/content:"\\2193" \/ ""/.test(css),JSON.stringify(sem));
  // keyboard
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');
  const got=[];for(let i=0;i<20&&got.length<4;i++){await page.keyboard.press('Tab');const r=await page.evaluate(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {t:e.closest('#flow')?e.textContent:'',ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};});if(r.t)got.push(r);}
  rec('O5b the four stage links are reachable by keyboard in order (Intents, References, Review, Review), each with a visible outline',got.length===4&&got.map(g=>g.t).join()==='Go to Intents,Go to References,Go to Review,Go to Review'&&got.every(g=>g.ol),JSON.stringify(got.map(g=>g.t)));
  // layout
  const lay=async(w,h)=>{await c.start(null,w,h);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');return page.evaluate(()=>{const li=[...document.querySelectorAll('#flow > li')].map(x=>x.getBoundingClientRect());return {minW:Math.round(Math.min(...li.map(r=>r.width))),stacked:li.every((r,i)=>i===0||r.top>li[i-1].bottom-1),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});};
  const desk=await lay(1280,800);const ph=await lay(375,812);
  rec('O6a the six stages stack in order at both 1280px and 375px (no mid-word breaking: each card is wider than 250px), with no horizontal scroll at either width',desk.stacked&&desk.minW>250&&desk.sw<=desk.cw&&ph.stacked&&ph.minW>250&&ph.sw<=ph.cw,JSON.stringify({desk,ph}));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','flow-375'));
  await lay(1280,800);await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','flow-1280'));
  const ext=c.reqs.filter(u=>!u.startsWith(c.URL)&&!u.startsWith('data:')&&!u.startsWith('blob:'));
  rec('O6b no request left the app\'s own origin',ext.length===0,JSON.stringify(ext));
});
