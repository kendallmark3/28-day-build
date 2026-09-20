const puppeteer=require('puppeteer-core');
const URL=process.env.APP_URL||'http://127.0.0.1:8092/';const EXPECT_NAV=['Start','Intents','Review','Capabilities','Overview','References','About'];const fs=require('fs');const REPO=require('path').resolve(__dirname,'../..');function loadBook(){
  try{if(process.env.BOOK_TEXT_FILE)return fs.readFileSync(process.env.BOOK_TEXT_FILE,'utf8');}catch(e){}
  try{const pdf=REPO+'/book/The-Ultimate-Guide-to-Claude.pdf';if(fs.existsSync(pdf))return require('child_process').execFileSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8',maxBuffer:64*1024*1024});}catch(e){}
  return null;
}

const BOOK=loadBook();
const results=[];const rec=(n,ok,d)=>{results.push({n,ok});console.log((ok?'PASS':'FAIL')+' | '+n+' | '+d);};const skip=n=>console.log('SKIP | '+n+' | needs the book text: put the PDF at book/ (with pdftotext installed) or set BOOK_TEXT_FILE');
const KEY='intent-workbench-v1';
const IDS=['outcome','inputs','outputs','constraints','criteria','stop'];
(async()=>{
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
  const page=await browser.newPage();
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(String(e)));
  const reqs=[];page.on('request',r=>reqs.push(r.url()));
  await page.setViewport({width:1280,height:800});
  await page.goto(URL,{waitUntil:'load'});
  await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'load'});
  const vals=()=>page.evaluate(ids=>ids.map(i=>document.getElementById(i).value),IDS);
  const outcomes=()=>page.$$eval('#intentList li > span',l=>l.map(x=>x.textContent));
  const stored=()=>page.evaluate(k=>{const d=localStorage.getItem(k);return d?JSON.parse(d).intents:null;},KEY);
  const label=()=>page.$eval('#submitBtn',b=>b.textContent);
  const setVal=(id,v)=>page.$eval('#'+id,(e,v)=>{e.value=v;},v);

  // New: sample text
  const DEF=await vals();
  rec('S1 on load all six fields hold non-empty sample text; outcome starts "Example:"',DEF.every(v=>v.trim().length>0)&&DEF[0].startsWith('Example:'),JSON.stringify(DEF));
  const emptyMsg=await page.$eval('#emptyState',e=>({vis:!e.hidden&&e.offsetParent!==null,t:e.textContent}));
  rec('C5 empty state visible, says what belongs, points to form',emptyMsg.vis&&/outcome/i.test(emptyMsg.t)&&/form/i.test(emptyMsg.t),emptyMsg.t.slice(0,60)+'...');
  await page.click('#submitBtn');
  let o=await outcomes();let st=await stored();
  rec('S2 Save on the untouched sample form: list gains 1 item showing the sample outcome',o.length===1&&o[0]===DEF[0]&&st&&st.length===1&&IDS.every((k,i)=>st[0][k]===DEF[i].trim()),JSON.stringify(o));
  rec('S3 after a save the form is back to the sample text',JSON.stringify(await vals())===JSON.stringify(DEF),'label='+await label());
  await page.reload({waitUntil:'load'});
  rec('S4 sample text present again after reload',JSON.stringify(await vals())===JSON.stringify(DEF),'');
  rec('C4 saved intent survives reload',JSON.stringify(await outcomes())===JSON.stringify([DEF[0]]),'');

  // C1, C7a, C12a
  const labeled=await page.$$eval('#intentForm label[for]',ls=>ls.filter(l=>{const c=document.getElementById(l.getAttribute('for'));return c&&/^(INPUT|TEXTAREA)$/.test(c.tagName)&&l.textContent.trim();}).map(l=>l.textContent.trim()));
  rec('C1 six labeled fields',labeled.length===6,labeled.join(' | '));
  const prim=await page.$$eval('button:not(.secondary)',bs=>bs.filter(b=>b.offsetParent!==null).map(b=>b.textContent.trim()));
  rec('C7a exactly one visible primary button "Save intent"',prim.length===1&&prim[0]==='Save intent',JSON.stringify(prim));
  rec('C12a Cancel hidden in create mode',await page.$eval('#cancelEdit',b=>b.hidden||b.offsetParent===null),'');

  // C2 refusal: clear outcome
  const before=JSON.stringify(await stored());
  await setVal('outcome','');await page.click('#submitBtn');
  rec('C2a cleared outcome refused, visible message, stored data unchanged',(await page.$eval('#formError',e=>!e.hidden))&&JSON.stringify(await stored())===before,await page.$eval('#formError',e=>e.textContent));
  await setVal('outcome','   ');await page.click('#submitBtn');
  rec('C2b whitespace-only outcome refused',(await outcomes()).length===1,'');
  // other five optional
  await setVal('outcome','Outcome only');for(const i of IDS.slice(1))await setVal(i,'');
  await page.click('#submitBtn');
  o=await outcomes();
  rec('C3 outcome-only intent saves and is listed; other five fields optional',o.length===2&&o[1]==='Outcome only',JSON.stringify(o));
  rec('C5b empty state hidden once an intent exists',await page.$eval('#emptyState',e=>e.hidden),'');

  // C6 keyboard
  await page.reload({waitUntil:'load'});
  const seq=[];
  for(let i=0;i<EXPECT_NAV.length+8;i++){await page.keyboard.press('Tab');seq.push(await page.evaluate(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {id:e.id||(e.tagName==='A'?'':e.tagName),ol:s.outlineStyle,w:parseFloat(s.outlineWidth)};}));}
  rec('C6a Tab: the nav links, Jira button, then 6 fields + button in order, each with visible outline',seq.map(s=>s.id||'A').join(',')===EXPECT_NAV.map(()=>'A').join(',')+',openJira,outcome,inputs,outputs,constraints,criteria,stop,submitBtn'&&seq.every(s=>s.ol!=='none'&&s.w>0),seq.map(s=>s.id+':'+s.ol+' '+s.w).join(', '));
  await page.reload({waitUntil:'load'});
  await page.focus('#outcome');await page.keyboard.press('End');await page.keyboard.type(' (keyboard)');
  for(let i=0;i<5;i++)await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  o=await outcomes();
  rec('C6b edited sample saved with keyboard only',o.length===3&&o[2]===DEF[0]+' (keyboard)',JSON.stringify(o[2]));

  // Edit criteria 9-12 with defaults
  await page.reload({waitUntil:'load'});
  const editBtns=await page.$$eval('#intentList li > button',bs=>bs.map(b=>b.textContent.trim()));
  rec('C9a every listed intent has an Edit button',editBtns.length===3&&editBtns.every(t=>t==='Edit'),JSON.stringify(editBtns));
  let reached=false;
  for(let i=0;i<20;i++){await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement.classList.contains('edit'))){reached=true;break;}}
  const olEdit=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;});
  rec('C9b Edit reachable by Tab with visible outline',reached&&olEdit,'');
  await page.keyboard.press('Enter');
  const s0=(await stored())[0];
  rec('C9c Enter on Edit replaces the sample with the intent\'s six values',JSON.stringify(await vals())===JSON.stringify(IDS.map(k=>s0[k])),'');
  rec('C9d label "Update intent", title "Edit intent"',(await label())==='Update intent'&&(await page.$eval('#formTitle',e=>e.textContent))==='Edit intent','');
  rec('C12b Cancel visible in edit mode',await page.$eval('#cancelEdit',b=>!b.hidden&&b.offsetParent!==null),'');
  await setVal('outcome','');await page.click('#submitBtn');
  const b2=await stored();
  rec('C10b empty outcome refused in edit mode; stored data unchanged',(await page.$eval('#formError',e=>!e.hidden))&&b2[0].outcome===s0.outcome,'');
  await setVal('outcome','Edited intent');await setVal('stop','new stop');await page.click('#submitBtn');
  o=await outcomes();const a2=await stored();
  rec('C10a update in place: same count, new outcome, same position',o.length===3&&o[0]==='Edited intent'&&o[1]==='Outcome only',JSON.stringify(o));
  rec('C10c id and created preserved, stop updated, inputs kept',a2[0].id===b2[0].id&&a2[0].created===b2[0].created&&a2[0].stop==='new stop'&&a2[0].inputs===s0.inputs,'');
  rec('C10d after Update: create mode with sample text restored',(await label())==='Save intent'&&JSON.stringify(await vals())===JSON.stringify(DEF)&&(await page.$eval('#cancelEdit',b=>b.hidden)),'');
  await page.reload({waitUntil:'load'});
  rec('C11 edited values survive reload',(await outcomes())[0]==='Edited intent'&&(await stored())[0].stop==='new stop','');

  // Cancel restores sample, not empty
  const snap=JSON.stringify(await stored());
  await page.click('#intentList li:nth-child(2) > button');
  const editVals=await vals();
  await page.$eval('#inputs',e=>{e.value='typed then cancelled';});
  await page.click('#cancelEdit');
  rec('C12c Cancel restores sample text in all six fields, "Save intent", hides Cancel, stored data unchanged',editVals[0]==='Outcome only'&&JSON.stringify(await vals())===JSON.stringify(DEF)&&(await label())==='Save intent'&&(await page.$eval('#cancelEdit',b=>b.hidden))&&JSON.stringify(await stored())===snap,'');

  // safety & layout
  await setVal('outcome','<img src=x onerror=window.__x=1>');await page.click('#submitBtn');
  const xss=await page.evaluate(()=>({flag:window.__x||null,imgs:document.querySelectorAll('#intentList img').length}));
  rec('extra: HTML in outcome rendered as text',xss.flag===null&&xss.imgs===0,JSON.stringify(xss));
  await setVal('outcome','x'.repeat(200));await page.click('#submitBtn');
  for(const [w,h] of [[1280,800],[375,812]]){
    await page.setViewport({width:w,height:h});await page.reload({waitUntil:'load'});
    const m=await page.evaluate(()=>{const r=document.getElementById('submitBtn').getBoundingClientRect();return {bottom:Math.round(r.bottom+scrollY),vh:innerHeight,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
    rec('C7b Save button fully in window at load, '+w+'x'+h,m.bottom<=m.vh,'bottom='+m.bottom+' vh='+m.vh);
    if(w===375){const clip=await page.evaluate(ids=>ids.map(i=>{const e=document.getElementById(i);return {i,clipped:e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1};}),IDS);
      rec('S5 sample text fully visible in all six fields at 375px (no clipping)',clip.every(c=>!c.clipped),JSON.stringify(clip.filter(c=>c.clipped)));}
    if(w===375)rec('C8 no horizontal scroll at 375px (samples, Edit buttons, 200-char outcome)',m.sw<=m.cw,'scrollWidth='+m.sw+' clientWidth='+m.cw);
    await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X',String(w)),fullPage:true});
  }

  // ===== Navigation, References, About =====
  await page.setViewport({width:1280,height:800});
  await page.goto(URL,{waitUntil:'load'});
  const vis=()=>page.evaluate(()=>['intents','references','about'].filter(v=>{const e=document.getElementById('view-'+v);return !e.hidden&&e.offsetParent!==null;}));
  const cur=()=>page.$$eval('nav a',as=>as.filter(a=>a.getAttribute('aria-current')==='page').map(a=>a.textContent.trim()));
  const navTxt=await page.$$eval('nav a',as=>as.map(a=>a.textContent.trim()));
  const navTop=await page.$eval('nav',n=>{const r=n.getBoundingClientRect();return {top:Math.round(r.top+scrollY),h:Math.round(r.height)};});
  rec('N1a nav shows Intents, References, About near the top',JSON.stringify(navTxt)===JSON.stringify(EXPECT_NAV)&&navTop.top<200,JSON.stringify({navTxt,navTop}));
  rec('N2a on load only Intents is shown; nav marks it current',JSON.stringify(await vis())==='["intents"]'&&JSON.stringify(await cur())==='["Intents"]',JSON.stringify(await vis()));
  // N4 typed text retained
  await page.$eval('#outcome',e=>{e.value='typed before leaving';});
  await page.click('nav a[href="#references"]');await new Promise(r=>setTimeout(r,150));
  rec('N2b clicking References shows only References; form hidden; nav marks it current',JSON.stringify(await vis())==='["references"]'&&JSON.stringify(await cur())==='["References"]'&&(await page.$eval('#intentForm',f=>f.offsetParent===null)),JSON.stringify(await vis()));
  rec('N3a URL fragment follows the view',(await page.evaluate(()=>location.hash))==='#references','');
  const navTop2=await page.$eval('nav',n=>Math.round(n.getBoundingClientRect().top+scrollY));
  rec('N1b nav still at top on References view',navTop2===navTop.top,String(navTop2));
  await page.click('nav a[href="#about"]');await new Promise(r=>setTimeout(r,150));
  rec('N2c About shows only About',JSON.stringify(await vis())==='["about"]'&&JSON.stringify(await cur())==='["About"]','');
  await page.goBack();await new Promise(r=>setTimeout(r,150));
  rec('N3b Back returns to the previous view (References)',JSON.stringify(await vis())==='["references"]'&&(await page.evaluate(()=>location.hash))==='#references','');
  await page.click('nav a[href="#intents"]');await new Promise(r=>setTimeout(r,150));
  rec('N4 text typed in the form survives leaving and returning',(await page.$eval('#outcome',e=>e.value))==='typed before leaving','');
  // N3c open URL with fragment
  const p2=await browser.newPage();await p2.setViewport({width:1280,height:800});await p2.goto(URL+'#references',{waitUntil:'load'});
  rec('N3c opening a URL ending #references shows References',JSON.stringify(await p2.evaluate(()=>['intents','references','about'].filter(v=>!document.getElementById('view-'+v).hidden)))==='["references"]','');
  await p2.goto(URL+'#nonsense',{waitUntil:'load'});
  rec('N3d unknown fragment falls back to Intents',JSON.stringify(await p2.evaluate(()=>['intents','references','about'].filter(v=>!document.getElementById('view-'+v).hidden)))==='["intents"]','');
  await p2.close();
  // N5 keyboard nav
  await page.goto(URL,{waitUntil:'load'});
  for(let t=0;t<=EXPECT_NAV.indexOf('References');t++)await page.keyboard.press('Tab');
  const focusedNav=await page.evaluate(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {t:e.textContent.trim(),ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};});
  await page.keyboard.press('Enter');await new Promise(r=>setTimeout(r,150));
  rec('N5 nav item reached by Tab, visible outline, Enter switches view',focusedNav.t==='References'&&focusedNav.ol&&JSON.stringify(await vis())==='["references"]',JSON.stringify(focusedNav));
  // N7 references content vs the book
  const refs=await page.evaluate(()=>{const v=document.getElementById('view-references');
    return {links:[...v.querySelectorAll('a[href^="http"]')].map(a=>({href:a.getAttribute('href'),target:a.target,rel:a.rel,text:a.textContent.trim()})),
      articles:[...[...v.querySelectorAll('h3')].find(h=>h.textContent.startsWith('Articles')).nextElementSibling.querySelectorAll('li')].map(li=>li.textContent.trim()),
      artLinks:[...[...v.querySelectorAll('h3')].find(h=>h.textContent.startsWith('Articles')).nextElementSibling.querySelectorAll('a')].length,
      repo:[...[...v.querySelectorAll('h3')].find(h=>h.textContent==='In this repository').nextElementSibling.querySelectorAll('code')].map(c=>c.textContent.trim())};});
  // parse Appendix E article titles from book text
  if(!BOOK){skip('N7a the 10 article titles equal those in the book');}else{
  const ae=BOOK.slice(BOOK.indexOf('Articles on LearnTeachMaster.org\n'));
  const blk=ae.slice(ae.indexOf('\n')+1,ae.indexOf('Starter code'));
  const bookArticles=[];let cur2=null;
  for(const ln of blk.split('\n')){ if(/^\s*The Ultimate Guide to Claude\s+\d+\s*$/.test(ln))continue; const m=ln.match(/^\s*•\s+(.*\S)\s*$/); if(m){cur2=m[1];bookArticles.push(cur2);} else if(cur2&&ln.trim()&&!/^Starter/.test(ln.trim())){bookArticles[bookArticles.length-1]+=' '+ln.trim();} }
  const norm=t=>t.replace(/\s+/g,' ').replace(/[’‘]/g,"'").trim();
  rec('N7a the 10 article titles equal those in the book\'s Appendix E, in order, exactly',bookArticles.length===10&&JSON.stringify(refs.articles.map(norm))===JSON.stringify(bookArticles.map(norm)),'book='+bookArticles.length+' page='+refs.articles.length);
  }
  const ALLOWED=['https://intent-driven-engineering.com','https://learnteachmaster.org','https://github.com/kendallmark3/intent-drive-starter','https://github.com/kendallmark3/intent-driven-plugin','https://github.com/kendallmark3/whackamole','https://docs.claude.com'];
  const CTXF=['architecture.md','business-rules.md','example-intent.md','glossary.md','non-goals.md','security.md','ux-standard.md'];const CTX=CTXF.map(f=>'https://github.com/kendallmark3/28-day-build/blob/main/context/'+f);
  rec('N7b exactly the 6 links the book states plus the 6 context-file links; no article links',JSON.stringify(refs.links.map(l=>l.href).sort())===JSON.stringify([...ALLOWED,...CTX].sort())&&refs.artLinks===0,JSON.stringify(refs.links.map(l=>l.href)));
  rec('N7c every external link opens in new tab with rel noopener noreferrer and has link text',refs.links.every(l=>l.target==='_blank'&&/noopener/.test(l.rel)&&/noreferrer/.test(l.rel)&&l.text.length>3),'');
  const repoOk=refs.repo.map(p=>({p,ok:fs.existsSync(REPO+'/'+p)}));
  rec('N7d every "In this repository" entry exists in the repo (the book is not one of them: it is not in the public repository)',repoOk.length===5&&repoOk.every(r=>r.ok),JSON.stringify(repoOk.filter(r=>!r.ok)));
  if(!BOOK){skip('N7e each linked address appears in the book text');}else{
  const inBook=['intent-driven-engineering.com','learnteachmaster.org','kendallmark3/intent-drive-starter','kendallmark3/intent-driven-plugin','kendallmark3/whackamole','docs.claude.com'].map(u=>[u,BOOK.toLowerCase().includes(u)]);
  rec('N7e each linked address appears in the book text',inBook.every(x=>x[1]),JSON.stringify(inBook.filter(x=>!x[1])));
  }
  // N6 About
  await page.goto(URL+'#about',{waitUntil:'load'});
  const about=await page.evaluate(()=>{const v=document.getElementById('view-about');const h=n=>{const e=[...v.querySelectorAll('h3')].find(x=>x.textContent.trim()===n);return e?e.nextElementSibling.textContent.trim():null;};return {learn:h('Learn'),teach:h('Teach'),master:h('Master'),all:v.textContent,links:v.querySelectorAll('a').length};});
  const sentences=t=>(t||'').split(/[.!?]["”]?\s/).filter(x=>x.trim()).length;
  rec('N6 About explains Learn, Teach, Master (1-3 sentences each) and names the book',[about.learn,about.teach,about.master].every(t=>t&&sentences(t)>=1&&sentences(t)<=3)&&/The Ultimate Guide to Claude/.test(about.all),JSON.stringify([sentences(about.learn),sentences(about.teach),sentences(about.master)]));
  const q1='learn how the system works, teach what you have learned, and through repetition master the underlying principles';
  const q2='You do not master intent by reading about it. You master it by writing one, running it, watching what happens, and writing a better one.';
  if(!BOOK){skip('N6b quoted passages match the book verbatim');}else
  rec('N6b quoted passages match the book verbatim',BOOK.replace(/\s+/g,' ').includes(q1)&&BOOK.replace(/\s+/g,' ').includes(q2)&&about.all.includes(q1)&&about.all.includes(q2),'');
  // network
  const external=reqs.filter(u=>!u.startsWith(URL)&&!u.startsWith('data:'));
  rec('N9 the app made no network requests outside its own origin',external.length===0,JSON.stringify(external));
  // layout on each view
  for(const [w,h] of [[1280,800],[375,812]]){
    await page.setViewport({width:w,height:h});
    for(const v of ['references','about']){await page.goto(URL+'#'+v,{waitUntil:'load'});
      const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
      rec('N8 no horizontal scroll on '+v+' at '+w+'px',m.sw<=m.cw,JSON.stringify(m));
      await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X',v+w),fullPage:true});}
  }

  // ===== Jira modal =====
  const DL=require('os').tmpdir()+'/jira-dl-'+Date.now();fs.mkdirSync(DL,{recursive:true});
  const cdp=await browser.target().createCDPSession();
  await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL,eventsEnabled:false});
  await page.setViewport({width:1280,height:800});
  await page.goto(URL,{waitUntil:'load'});
  await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'load'});
  const inDialog=()=>page.evaluate(()=>{const d=document.getElementById('jiraDialog');return d.open&&d.contains(document.activeElement);});
  await page.click('#openJira');
  rec('J1a button opens a modal dialog; focus is inside it',(await page.$eval('#jiraDialog',d=>d.open&&d.matches(':modal')))&&await inDialog(),'');
  await page.keyboard.press('Escape');
  rec('J1b Esc closes it and focus returns to the button',!(await page.$eval('#jiraDialog',d=>d.open))&&(await page.evaluate(()=>document.activeElement.id))==='openJira','');
  await page.click('#openJira');await page.click('#jiraClose1');
  rec('J1c Close button closes it and focus returns to the button',!(await page.$eval('#jiraDialog',d=>d.open))&&(await page.evaluate(()=>document.activeElement.id))==='openJira','');
  await page.click('#openJira');
  const sample=await page.evaluate(()=>STORY_SAMPLE);
  rec('J2a modal opens with the example story, marked as an example',(await page.$eval('#jiraText',t=>t.value))===sample&&(await page.$eval('#jiraExampleTag',e=>!e.hidden&&e.offsetParent!==null)),'');
  await page.click('#jiraBuild');
  const badges=await page.$$eval('#jiraFields .badge',bs=>bs.map(b=>b.textContent));
  rec('J2b Build on the untouched example fills six fields, each labelled From your story / Suggested / Not found',badges.length===6&&badges.every(b=>['From your story','Suggested','Not found'].includes(b)),JSON.stringify(badges));
  const V=await page.evaluate(ids=>Object.fromEntries(ids.map(i=>[i,document.getElementById('jf-'+i).value])),IDS);
  const B=await page.evaluate(ids=>Object.fromEntries(ids.map(i=>[i,document.getElementById('jb-'+i).textContent])),IDS);
  const critLines=['The Reports page has an "Export CSV" button','The CSV contains one row per user with columns: user, logins, last_seen','The export should be fast','Shows an error message if the month has no data'];
  rec('J3a outcome has "export a monthly usage report as a CSV" and "so that"',/export a monthly usage report as a CSV/i.test(V.outcome)&&/so that/.test(V.outcome),V.outcome);
  rec('J3b inputs have "analytics database" and the mockup URL',/analytics database/.test(V.inputs)&&V.inputs.includes('https://example.com/mockups/142'),JSON.stringify(V.inputs));
  rec('J3c constraints contain "PDF export"',/PDF export/.test(V.constraints),V.constraints);
  rec('J3d criteria contain all four acceptance criteria lines',critLines.every(l=>V.criteria.split('\n').includes(l)),'');
  rec('J3e outputs and stop are labelled Suggested; outcome, inputs, constraints, criteria From your story',B.outputs==='Suggested'&&B.stop==='Suggested'&&['outcome','inputs','constraints','criteria'].every(k=>B[k]==='From your story'),JSON.stringify(B));
  // J4 markup variants give the same fields
  const variants=await page.evaluate(()=>{
    const heads=['Description','Acceptance Criteria','Dependencies','Out of scope'];
    const conv=(fh,bullet)=>STORY_SAMPLE.split('\n').map(l=>{const t=l.trim();if(heads.includes(t))return fh(t);if(/^- /.test(l))return bullet+l.slice(2);return l;}).join('\n');
    const pick=t=>{const r=analyzeStory(t);return JSON.stringify(Object.fromEntries(Object.entries(r.fields).map(([k,v])=>[k,[v.source,v.text]])));};
    return {base:pick(STORY_SAMPLE),jira:pick(conv(h=>'h2. '+h,'* ')),md:pick(conv(h=>'## '+h,'- ')),bold:pick(conv(h=>'*'+h+'*','* ')),colon:pick(conv(h=>h+':','- '))};
  });
  rec('J4 Jira markup (h2. / *), Markdown (##), bold headings, and "Heading:" give the same six fields',['jira','md','bold','colon'].every(k=>variants[k]===variants.base),Object.keys(variants).filter(k=>variants[k]!==variants.base).join(',')||'all equal');
  // J6 notes
  const notesList=await page.$$eval('#jiraNotes li',ls=>ls.map(l=>({tag:l.querySelector('.tag').textContent,text:l.textContent})));
  const TAGS=['Security','Missing','Uncheckable','Ambiguity','Stop','Scope','Size','Consequence','Limits'];
  rec('J6a every note starts with one of the nine tags',notesList.length>0&&notesList.every(n=>TAGS.includes(n.tag)),JSON.stringify(notesList.map(n=>n.tag)));
  rec('J6b example: Uncheckable note names "fast"; Ambiguity note names "easy"; a Stop note exists',notesList.some(n=>n.tag==='Uncheckable'&&/"fast"/.test(n.text))&&notesList.some(n=>n.tag==='Ambiguity'&&/"easy"/.test(n.text))&&notesList.some(n=>n.tag==='Stop'),'');
  rec('J6c the last note is a Limits note',notesList[notesList.length-1].tag==='Limits','');
  const nofit=await page.$$eval('#jiraNofit li',ls=>ls.map(l=>l.textContent));
  rec('J6d "What didn\'t fit" lists the unplaced description line',nofit.length===1&&/Customers keep asking/.test(nofit[0]),JSON.stringify(nofit));
  // J10 not stored
  const ls1=await page.evaluate(()=>JSON.stringify(localStorage));
  rec('J10a the pasted story is not in localStorage',!/PROJ-142|analytics database|Customers keep asking/.test(ls1),ls1.slice(0,80));
  // J8 download with an edit
  await page.$eval('#jf-outcome',e=>{e.value=e.value+' (edited)';});
  await page.click('#jiraDownload');
  let file=null;for(let i=0;i<40&&!file;i++){await new Promise(r=>setTimeout(r,150));file=fs.readdirSync(DL).find(f=>f.endsWith('.md'));}
  const md=file?fs.readFileSync(DL+'/'+file,'utf8'):'';
  rec('J8a downloaded file is named with the Jira key',file==='intent-proj-142.md',String(file));
  const order=['## Intent','## Inputs','## Outputs','## Constraints','## Success criteria','## Stop when'].map(h=>md.indexOf(h));
  rec('J8b file has the six template sections in order',order.every((x,i)=>x>=0&&(i===0||x>order[i-1]))&&md.startsWith('# Intent: Export monthly usage report'),JSON.stringify(order));
  rec('J8c file holds the modal\'s current (edited) text and the Status line',/\(edited\)/.test(md)&&/^Status: DRAFT/m.test(md)&&/Source: Jira story PROJ-142/.test(md),md.split('\n').slice(0,5).join(' | '));
  console.log('--- downloaded file ---\n'+md+'--- end ---');
  // J5 empty and no-sections stories
  await page.click('#jiraBack');
  await page.$eval('#jiraText',t=>{t.value='   \n  ';});await page.click('#jiraBuild');
  rec('J5a whitespace-only story refused with a visible message',(await page.$eval('#jiraError',e=>!e.hidden&&e.textContent.length>5))&&(await page.$eval('#jiraStep2',e=>e.hidden)),'');
  await page.$eval('#jiraText',t=>{t.value='Make the login page nicer\nUsers are confused by it.';});await page.click('#jiraBuild');
  const ns=await page.evaluate(ids=>({v:Object.fromEntries(ids.map(i=>[i,document.getElementById('jf-'+i).value])),b:Object.fromEntries(ids.map(i=>[i,document.getElementById('jb-'+i).textContent])),tags:[...document.querySelectorAll('#jiraNotes .tag')].map(t=>t.textContent)}),IDS);
  rec('J5b story with no sections: outcome from first line, the rest Not found, notes explain',ns.v.outcome==='Make the login page nicer'&&['inputs','outputs','constraints','criteria','stop'].every(k=>ns.b[k]==='Not found')&&ns.tags.includes('Missing')&&ns.tags.includes('Stop'),JSON.stringify(ns.b));
  await page.click('#jiraDownload');
  let f2=null;for(let i=0;i<40&&!f2;i++){await new Promise(r=>setTimeout(r,150));f2=fs.readdirSync(DL).find(f=>f.endsWith('.md')&&f!=='intent-proj-142.md');}
  const md2=f2?fs.readFileSync(DL+'/'+f2,'utf8'):'';
  rec('J8d empty fields appear as TODO lines; Status names what is missing',(md2.match(/TODO: not found/g)||[]).length===5&&/Still missing: constraints, success criteria, stop condition/.test(md2),String(f2)+' | '+md2.split('\n').find(l=>l.startsWith('Status')));
  // J7 secret
  await page.click('#jiraBack');
  await page.$eval('#jiraText',t=>{t.value='PROJ-9: Rotate the service account\nAs an admin, I want to rotate the key so that leaks are contained.\nCurrent password: hunter2';});await page.click('#jiraBuild');
  const t7=await page.$$eval('#jiraNotes .tag',ts=>ts.map(t=>t.textContent));
  rec('J7 a story with "password: hunter2" gets a Security note first (and a Consequence note)',t7[0]==='Security'&&t7.includes('Consequence'),JSON.stringify(t7));
  // J11 html in story
  await page.click('#jiraBack');
  await page.$eval('#jiraText',t=>{t.value='<img src=x onerror=window.__y=1> Fix the thing';});await page.click('#jiraBuild');
  const x=await page.evaluate(()=>({flag:window.__y||null,imgs:document.querySelectorAll('#jiraDialog img').length,shown:document.getElementById('jf-outcome').value}));
  rec('J11 HTML in the story is shown as text, not run',x.flag===null&&x.imgs===0&&x.shown.includes('<img'),JSON.stringify(x));
  // J9 use in form
  await page.click('#jiraBack');
  await page.$eval('#jiraText',(t,s)=>{t.value=s;},sample);await page.click('#jiraBuild');
  const modalVals=await page.evaluate(ids=>ids.map(i=>document.getElementById('jf-'+i).value.trim()),IDS);
  await page.click('#jiraUse');
  const formVals=await page.evaluate(ids=>ids.map(i=>document.getElementById(i).value),IDS);
  rec('J9a Use in form copies the six fields into the main form and closes the modal',JSON.stringify(formVals)===JSON.stringify(modalVals)&&!(await page.$eval('#jiraDialog',d=>d.open)),'');
  const grown=await page.$eval('#criteria',e=>e.clientHeight>60);
  rec('J9b the multi-line success criteria are fully visible in the main form (field grew)',grown,'');
  await page.click('#submitBtn');
  const stAfter=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).intents,KEY);
  const last=stAfter[stAfter.length-1];
  rec('J9c Save intent adds it to the list with all six parts, criteria kept as separate lines',last.outcome===modalVals[0]&&last.criteria.split('\n').length===4&&last.stop===modalVals[5],JSON.stringify(last.criteria.split('\n').length));
  rec('J9d the form returns to the example text and normal size after saving',JSON.stringify(await vals())===JSON.stringify(DEF)&&(await page.$eval('#criteria',e=>e.clientHeight<60)),'');
  // J12 keyboard-only flow
  await page.goto(URL,{waitUntil:'load'});
  for(let i=0;i<20;i++){await page.keyboard.press('Tab');if((await page.evaluate(()=>document.activeElement.id))==='openJira')break;}
  await page.keyboard.press('Enter');
  const kOpen=await page.$eval('#jiraDialog',d=>d.open);
  await page.keyboard.press('Tab');
  const focusBuild=await page.evaluate(()=>document.activeElement.id);
  await page.keyboard.press('Enter');
  const kResult=await page.$eval('#jiraStep2',e=>!e.hidden);
  const seen=[];
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');seen.push(await page.evaluate(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {id:e.id,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};}));}
  await page.keyboard.press('Escape');
  const kClosed=!(await page.$eval('#jiraDialog',d=>d.open));
  rec('J12 keyboard only: open, build, reach all six fields and 4 buttons with visible outlines, Esc closes',kOpen&&focusBuild==='jiraBuild'&&kResult&&['jf-outcome','jf-inputs','jf-outputs','jf-constraints','jf-criteria','jf-stop','jiraDownload','jiraUse','jiraBack','jiraClose2'].every(id=>seen.some(s=>s.id===id))&&seen.filter(s=>s.id&&/^jf-|^jira/.test(s.id)).every(s=>s.ol)&&kClosed,seen.map(s=>s.id+(s.ol?'':'!')).join(','));
  // J13 mobile modal
  await page.setViewport({width:375,height:812});await page.goto(URL,{waitUntil:'load'});
  await page.click('#openJira');
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','modal-step1-375')});
  await page.click('#jiraBuild');
  const mm=await page.evaluate(()=>{const d=document.getElementById('jiraDialog');const r=d.getBoundingClientRect();return {dsw:d.scrollWidth,dcw:d.clientWidth,left:Math.round(r.left),right:Math.round(r.right),vw:innerWidth,psw:document.documentElement.scrollWidth,pcw:document.documentElement.clientWidth};});
  rec('J13 at 375px the open modal fits the screen and needs no horizontal scrolling',mm.dsw<=mm.dcw&&mm.left>=0&&mm.right<=mm.vw&&mm.psw<=mm.pcw,JSON.stringify(mm));
  await page.$eval('#jiraDialog',d=>{d.scrollTop=0;});
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','modal-step2-375')});
  await page.setViewport({width:1280,height:800});
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','modal-step2-1280')});
  // network: nothing left the origin
  const ext=reqs.filter(u=>!u.startsWith(URL)&&!u.startsWith('data:')&&!u.startsWith('blob:'));
  rec('J10b no request outside the app\'s own origin during the whole run, including the modal',ext.length===0,JSON.stringify(ext));

  // ===== Dashboard (Day 7) =====
  await page.setViewport({width:1280,height:800});
  await page.goto(URL,{waitUntil:'load'});
  await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'load'});
  const dash=()=>page.evaluate(()=>({saved:document.getElementById('statSaved').textContent,gaps:document.getElementById('statGaps').textContent,next:document.getElementById('nextStep').textContent}));
  const saveWith=async(o)=>{for(const k of IDS)await page.$eval('#'+k,(e,v)=>{e.value=v;},o[k]||'');await page.click('#submitBtn');};
  const labelsTxt=await page.$$eval('.dash .stat span',s=>s.map(x=>x.textContent));
  rec('D1a dashboard labels are "Intents saved" and "Missing a constraint or stop condition"',JSON.stringify(labelsTxt)==='["Intents saved","Missing a constraint or stop condition"]','');
  const attrs=await page.$eval('.dash',d=>({live:d.getAttribute('aria-live'),lbl:d.getAttribute('aria-label')}));
  rec('D1b dashboard is a labelled polite live region',attrs.live==='polite'&&attrs.lbl==='Dashboard',JSON.stringify(attrs));
  let d0=await dash();
  rec('D2 no intents: 0 saved, 0 missing, next step says save the example or start from a Jira story',d0.saved==='0'&&d0.gaps==='0'&&/save the example/.test(d0.next)&&/Jira story/.test(d0.next),JSON.stringify(d0));
  for(const [w,h] of [[1280,800],[375,812]]){
    await page.setViewport({width:w,height:h});await page.reload({waitUntil:'load'});
    const m=await page.evaluate(()=>{const r=document.querySelector('.dash').getBoundingClientRect();const s=document.getElementById('submitBtn').getBoundingClientRect();return {dashTop:Math.round(r.top+scrollY),dashBottom:Math.round(r.bottom+scrollY),saveBottom:Math.round(s.bottom+scrollY),vh:innerHeight,shown:document.querySelector('.dash').offsetParent!==null};});
    rec('D3 dashboard fully visible at load, and Save still inside the window, at '+w+'x'+h,m.shown&&m.dashBottom<=m.vh&&m.saveBottom<=m.vh,JSON.stringify(m));
    await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','dash-empty-'+w)});
  }
  await page.setViewport({width:1280,height:800});await page.reload({waitUntil:'load'});
  await page.click('#submitBtn');
  let d1=await dash();
  rec('D4 after saving the complete example: 1 saved, 0 missing, next step says write the next intent',d1.saved==='1'&&d1.gaps==='0'&&/write your next intent/.test(d1.next),JSON.stringify(d1));
  await saveWith({outcome:'No constraints or stop'});
  let d2=await dash();
  rec('D5a an intent with no constraints and no stop: 2 saved, 1 missing, next step says edit the 1 intent',d2.saved==='2'&&d2.gaps==='1'&&/edit the 1 intent missing a constraint or stop condition/.test(d2.next),JSON.stringify(d2));
  await saveWith({outcome:'Constraints but no stop',constraints:'Must be under 1s'});
  await saveWith({outcome:'Stop but no constraints',stop:'Stop when done'});
  let d3=await dash();
  rec('D5b an intent with only one of the two also counts as missing: 4 saved, 3 missing, plural wording',d3.saved==='4'&&d3.gaps==='3'&&/edit the 3 intents missing/.test(d3.next),JSON.stringify(d3));
  await saveWith({outcome:'Whitespace constraints',constraints:'   ',stop:'Stop'});
  let d3b=await dash();
  rec('D5c whitespace-only constraints count as missing: 5 saved, 4 missing',d3b.saved==='5'&&d3b.gaps==='4',JSON.stringify(d3b));
  // edit one to complete it
  await page.click('#intentList li:nth-child(2) > button');
  await page.$eval('#constraints',e=>{e.value='Now has a constraint';});await page.$eval('#stop',e=>{e.value='Now has a stop';});
  await page.click('#submitBtn');
  let d4=await dash();
  rec('D6 completing an intent by editing it lowers the missing count (5 saved, 3 missing)',d4.saved==='5'&&d4.gaps==='3',JSON.stringify(d4));
  await page.reload({waitUntil:'load'});
  let d5=await dash();
  rec('D7 numbers and next step are the same after a reload',JSON.stringify(d5)===JSON.stringify(d4),JSON.stringify(d5));
  // complete the rest -> all complete
  for(const n of [5,4,3]){ // edit remaining incomplete ones (list order: 1 example, 2 done, 3 constraints-only, 4 stop-only, 5 whitespace, 6? none)
  }
  const stored5=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).intents,KEY);
  const incompleteIdx=stored5.map((x,i)=>(!x.constraints.trim()||!x.stop.trim())?i:-1).filter(i=>i>=0);
  for(const i of incompleteIdx){
    await page.click('#intentList li:nth-child('+(i+1)+') > button');
    await page.$eval('#constraints',e=>{if(!e.value.trim())e.value='fixed constraint';});await page.$eval('#stop',e=>{if(!e.value.trim())e.value='fixed stop';});
    await page.click('#submitBtn');
  }
  let d6=await dash();
  rec('D8 when every intent is complete: 0 missing and the next step says write the next intent',d6.saved==='5'&&d6.gaps==='0'&&/write your next intent/.test(d6.next),JSON.stringify(d6));
  // other views
  for(const v of ['references','about']){await page.goto(URL+'#'+v,{waitUntil:'load'});
    rec('D9 dashboard is not shown on the '+v+' view',await page.$eval('.dash',d=>d.offsetParent===null),'');}
  // pure function
  const pure=await page.evaluate(()=>{const input=[{constraints:'x',stop:'y'},{constraints:'',stop:'y'}];const copy=JSON.stringify(input);const a=dashboardState(input),b=dashboardState(input);return {same:JSON.stringify(a)===JSON.stringify(b),untouched:JSON.stringify(input)===copy,empty:dashboardState([]).saved===0,missingFields:dashboardState([{}]).gaps===1};});
  rec('D10 dashboardState is pure: same input, same output, input not changed; handles missing fields',pure.same&&pure.untouched&&pure.empty&&pure.missingFields,JSON.stringify(pure));

  // ===== Day 8: context =====
  const CTXDIR=REPO+'/context/';
  const ctxText=Object.fromEntries(CTXF.map(f=>[f,fs.readFileSync(CTXDIR+f,'utf8')]));
  await page.setViewport({width:1280,height:800});await page.goto(URL+'#references',{waitUntil:'load'});
  const pc=await page.evaluate(()=>[...document.querySelectorAll('#contextList li')].map(li=>({href:li.querySelector('a').getAttribute('href'),link:li.querySelector('a').textContent.trim(),target:li.querySelector('a').target,rel:li.querySelector('a').rel,rest:li.textContent.replace(li.querySelector('a').textContent,'').replace(/^:\s*/,'').trim()})));
  rec('G1a "Project context" lists all seven context files, each with a purpose line and a GitHub link opening in a new tab',pc.length===7&&CTXF.every((f,i)=>pc[i].link==='context/'+f&&pc[i].href===CTX[i]&&pc[i].rest.length>=20&&pc[i].target==='_blank'&&/noopener/.test(pc[i].rel)&&/noreferrer/.test(pc[i].rel)),JSON.stringify(pc.map(p=>p.link)));
  rec('G1b every one of those six files exists in the repo folder',CTXF.every(f=>fs.existsSync(CTXDIR+f)),'');
  const heads=await page.$$eval('#view-references h3',h=>h.map(x=>x.textContent));
  rec('G1c the section is titled "Project context"',heads.includes('Project context'),JSON.stringify(heads));
  const codes=[];for(const u of CTX){try{const r=await fetch(u,{redirect:'follow'});codes.push(r.status);}catch(e){codes.push('ERR');}}
  rec('G2 every context link returns a page (HTTP 200)',codes.every(c=>c===200),JSON.stringify(codes));
  // Source lines
  const noteSrc=async(story)=>{await page.goto(URL,{waitUntil:'load'});await page.click('#openJira');await page.$eval('#jiraText',(t,s)=>{t.value=s;t.dispatchEvent(new Event('input'));},story);await page.click('#jiraBuild');return page.$$eval('#jiraNotes li',ls=>ls.map(l=>({tag:l.querySelector('.tag').textContent,body:l.childNodes[1].textContent,src:(l.querySelector('.src')||{}).textContent||''})));};
  const exNotes=await noteSrc(sample);
  const by=(n,t,re)=>n.filter(x=>x.tag===t&&(!re||re.test(x.body)));
  rec('G3a example story: Uncheckable and Ambiguity cite business rule 2; Stop cites rule 3; Suggested-parts note cites the glossary; Limits has no source',
     by(exNotes,'Uncheckable').every(n=>n.src==='Source: context/business-rules.md, rule 2')&&by(exNotes,'Ambiguity').every(n=>n.src==='Source: context/business-rules.md, rule 2')&&by(exNotes,'Stop').every(n=>n.src==='Source: context/business-rules.md, rule 3')&&by(exNotes,'Missing',/^Parts labelled/).every(n=>n.src==='Source: context/glossary.md, Suggested')&&by(exNotes,'Limits').every(n=>n.src===''),JSON.stringify(exNotes.map(n=>n.tag+':'+n.src)));
  const bare=await noteSrc('Make the login page nicer');
  rec('G3b bare story: Missing criteria cite rule 2; Missing constraints cite rule 3; missing outcome-why, inputs, outputs cite the glossary; Scope has no source',
     by(bare,'Missing',/^No acceptance criteria/).every(n=>n.src==='Source: context/business-rules.md, rule 2')&&by(bare,'Missing',/^No constraints/).every(n=>n.src==='Source: context/business-rules.md, rule 3')&&by(bare,'Missing',/^The outcome does not say why/).every(n=>n.src==='Source: context/glossary.md, Intent')&&by(bare,'Missing',/^No inputs/).every(n=>n.src==='Source: context/glossary.md, Inputs')&&by(bare,'Missing',/^No outputs/).every(n=>n.src==='Source: context/glossary.md, Outputs')&&by(bare,'Scope').length===1&&by(bare,'Scope')[0].src==='',JSON.stringify(bare.map(n=>n.tag+':'+n.src)));
  const risky=await noteSrc('PROJ-9: Rotate the key\nAs an admin, I want to rotate the key so that leaks are contained.\nCurrent password: hunter2');
  rec('G3c secret story: Security cites security.md; Consequence cites rule 6 and security.md',by(risky,'Security')[0].src==='Source: context/security.md'&&by(risky,'Consequence')[0].src==='Source: context/business-rules.md, rule 6; context/security.md',JSON.stringify(risky.map(n=>n.tag+':'+n.src)));
  const big=await noteSrc('PROJ-5: Big\nAs a user, I want a so that b.\nAs a user, I want c so that d.\nAcceptance Criteria\n- one shows a\n');
  rec('G3d Size note (several stories in one) has no source',by(big,'Size').length===1&&by(big,'Size')[0].src==='',JSON.stringify(big.map(n=>n.tag+':'+n.src)));
  // cited rules say what the notes claim
  const br=ctxText['business-rules.md'],sec=ctxText['security.md'],gl=ctxText['glossary.md'];
  const rule=n=>(br.split('\n').find(l=>l.startsWith(n+'. '))||'');
  rec('G4 each cited rule, read from the file, says what the note claims',/checkable/i.test(rule(2))&&/constraint/.test(rule(3))&&/stop condition/.test(rule(3))&&/High-consequence/.test(rule(6))&&/human approval/.test(rule(6))&&/secrets, credentials/.test(sec)&&/human-approved/.test(sec)&&/\*\*Intent\*\*: [^\n]*why it matters/.test(gl)&&/\*\*Inputs\*\*: what may be used/.test(gl)&&/\*\*Outputs\*\*: what should be produced/.test(gl)&&/\*\*Suggested\*\*: [^\n]*confirm/.test(gl),'');
  // glossary covers every label and tag
  const appJs=fs.readFileSync(REPO+'/app/app.js','utf8')+'\n'+fs.readFileSync(REPO+'/app/logic.js','utf8'),indexHtml=fs.readFileSync(REPO+'/app/index.html','utf8'),css=fs.readFileSync(REPO+'/app/styles.css','utf8');
  const tags=[...new Set([...appJs.matchAll(/add\('([A-Za-z]+)'/g)].map(m=>m[1]))];
  const labels=Object.values(eval('('+appJs.match(/const SOURCE_LABELS=(\{[^}]*\})/)[1]+')'));
  const need=[...tags,...labels];
  rec('G5 the glossary defines every note tag and source label the app shows ('+need.length+')',tags.length===9&&labels.length===3&&need.every(t=>gl.includes('**'+t+'**')),JSON.stringify(need.filter(t=>!gl.includes('**'+t+'**'))));
  // nothing copied
  const copied=[];
  for(const f of CTXF.filter(x=>x!=='example-intent.md'))for(const raw of ctxText[f].split('\n')){const t=raw.replace(/^\s*(?:[-*]|\d+\.)\s+/,'').replace(/\*\*/g,'').trim();if(t.length>=35&&(appJs.includes(t)||indexHtml.includes(t)))copied.push(f+': '+t.slice(0,50));}
  rec('G6 no context-file sentence (35+ characters) appears in the app code or page',copied.length===0,JSON.stringify(copied));
  // claims in context files, checked against the app
  const arch=ctxText['architecture.md'];
  rec('G7a architecture.md: storage key matches the code',arch.includes('intent-workbench-v1')&&appJs.includes("'intent-workbench-v1'"),'');
  rec('G7b architecture.md: the three named functions exist',['analyzeStory','intentMarkdown','dashboardState'].every(fn=>arch.includes(fn)&&new RegExp('function '+fn+'\\(').test(appJs)),'');
  const viewsBuilt=await page.$$eval('nav a',a=>a.length);
  rec('G7c architecture.md: the views in the nav plus the Jira modal exist',viewsBuilt===EXPECT_NAV.length&&/Intents view/.test(arch)&&/Overview view/.test(arch)&&/References view/.test(arch)&&/About view/.test(arch)&&/Jira story modal/.test(arch)&&indexHtml.includes('id="jiraDialog"'),'');
  rec('G7d architecture.md: static files, no framework or build (no package.json, no script tags except app.js, no http(s) resources)',!fs.existsSync(REPO+'/app/package.json')&&((indexHtml.match(/<script[^>]*>/g)||[]).length===2)&&!/(src|href)="https?:/.test(indexHtml.replace(/<a [^>]*>/g,''))&&!/url\(\s*['"]?https?:/.test(css),'');
  rec('G7e security.md / non-goals.md: no fetch, XHR, WebSocket, or file upload in the app',!/\bfetch\(|XMLHttpRequest|WebSocket|type="file"/.test(appJs+indexHtml),'');
  rec('G7f security.md: links use noopener noreferrer; no third-party script, font, or image in page or stylesheet',/rel="noopener noreferrer"/.test(indexHtml)&&!/<img\b/.test(indexHtml)&&!/@import|fonts\.googleapis/.test(css),'');
  rec('G7g non-goals.md lists the Jira non-goals from the feature intent (no Jira connection, fixed rules not AI, no second-story comparison)',/does not connect to Jira/.test(ctxText['non-goals.md'])&&/not AI/.test(ctxText['non-goals.md'])&&/second story/.test(ctxText['non-goals.md']),'');
  await page.goto(URL+'#references',{waitUntil:'load'});
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','references-context-1280'),fullPage:true});
  await page.setViewport({width:375,height:812});await page.reload({waitUntil:'load'});
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('G8 References (with the new section) has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await page.goto(URL,{waitUntil:'load'});await page.click('#openJira');await page.click('#jiraBuild');
  await page.$eval('#jiraDialog',d=>{d.scrollTop=d.scrollHeight;});
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','notes-source-375')});

  // ===== Day 12: reset to sample data =====
  await page.setViewport({width:1280,height:800});
  await page.goto(URL,{waitUntil:'load'});
  const sampleOutcomes=await page.evaluate(()=>sampleIntents(0).map(x=>x.outcome));
  const seed=async(list)=>{await page.evaluate((k,l)=>{localStorage.clear();localStorage.setItem('other-key','keep');localStorage.setItem(k,JSON.stringify({intents:l}));},KEY,list.map((o,iR)=>({id:1000+iR,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'',outputs:'',constraints:'c',criteria:'',stop:'sR'})));await page.reload({waitUntil:'load'});};
  const stored0=()=>page.evaluate(k=>localStorage.getItem(k),KEY);
  await seed(['Old A','Old B']);
  rec('R0 "Reset to sample data" button is in the Saved intents panel',await page.$eval('#resetSample',b=>b.textContent==='Reset to sample data'&&b.closest('.panel').querySelector('h2').textContent==='Saved intents'),'');
  const before0=await stored0();
  await page.click('#resetSample');
  const dlg=await page.evaluate(()=>({modal:document.getElementById('resetDialog').matches(':modal'),focus:document.activeElement.id,msg:document.getElementById('resetMsg').textContent,btns:[...document.querySelectorAll('#resetDialog button')].map(b=>b.textContent)}));
  rec('R1a confirmation is aR modal, says how many intents will be replaced, has both buttons, and focus starts on Cancel',dlg.modal&&dlg.focus==='resetCancel'&&/Your 2 saved intents will be replaced by 3 sample intents/.test(dlg.msg)&&JSON.stringify(dlg.btns)==='["Replace with sample data","Cancel"]',JSON.stringify(dlg));
  await page.keyboard.press('Escape');
  rec('R1b Esc closes it and changes nothing',!(await page.$eval('#resetDialog',dR=>dR.open))&&(await stored0())===before0&&JSON.stringify(await outcomes())==='["Old A","Old B"]','');
  await page.click('#resetSample');await page.click('#resetCancel');
  rec('R1c Cancel closes it and changes nothing; focus returns to the Reset button',!(await page.$eval('#resetDialog',dR=>dR.open))&&(await stored0())===before0&&(await page.evaluate(()=>document.activeElement.id))==='resetSample','');
  await seed(['Only one']);await page.click('#resetSample');
  const m1=await page.$eval('#resetMsg',eR=>eR.textContent);await page.click('#resetCancel');
  await seed([]);await page.click('#resetSample');
  const m0=await page.$eval('#resetMsg',eR=>eR.textContent);await page.click('#resetCancel');
  rec('R1d message wording for 1 intent (singular) and for none',/^Your 1 saved intent will be replaced/.test(m1)&&/^You have no saved intents/.test(m0),m1+' | '+m0);
  // confirm
  await seed(['Old A','Old B']);
  await page.click('#resetSample');await page.click('#resetConfirm');
  const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  rec('R2a confirming leaves exactly the 3 sample intents in the list',JSON.stringify(await outcomes())===JSON.stringify(sampleOutcomes),JSON.stringify((await outcomes()).map(x=>x.slice(0,28))));
  const dR=await page.evaluate(()=>({saved:document.getElementById('statSaved').textContent,gaps:document.getElementById('statGaps').textContent,next:document.getElementById('nextStep').textContent}));
  rec('R2b dashboard shows 3 saved, 1 missing aR constraint or stop condition, and says to edit the 1 intent',dR.saved==='3'&&dR.gaps==='1'&&/edit the 1 intent/.test(dR.next),JSON.stringify(dR));
  rec('R2c stored data holds exactly those 3 records, each with aR distinct id, aR created date, and the six parts',Array.isArray(after.intents)&&after.intents.length===3&&new Set(after.intents.map(x=>x.id)).size===3&&after.intents.every(x=>x.created&&IDS.every(k=>typeof x[k]==='string')),JSON.stringify(Object.keys(after)));
  await page.reload({waitUntil:'load'});
  rec('R3 after aR reload the sample intents are still there and the old ones are gone',JSON.stringify(await outcomes())===JSON.stringify(sampleOutcomes)&&!(await outcomes()).includes('Old A'),'');
  await page.click('#resetSample');await page.click('#resetConfirm');
  const stR=await page.evaluate(()=>{const eR=document.getElementById('resetStatus');return {t:eR.textContent,role:eR.getAttribute('role'),live:eR.getAttribute('aria-live'),focus:document.activeElement.id};});
  rec('R4 message "Reset to sample data: 3 intents." is in aR polite status region and focus is on the Saved intents heading',stR.t==='Reset to sample data: 3 intents.'&&stR.role==='status'&&stR.live==='polite'&&stR.focus==='savedTitle',JSON.stringify(stR));
  // reset during an edit
  await page.click('#intentList li:nth-child(2) > button');
  await setVal('outcome','stale edit');
  await page.click('#resetSample');await page.click('#resetConfirm');
  const ed=await page.evaluate(()=>({label:document.getElementById('submitBtn').textContent,title:document.getElementById('formTitle').textContent,cancelHidden:document.getElementById('cancelEdit').hidden,outcome:document.getElementById('outcome').value}));
  rec('R5a aR reset during an edit returns the form to create mode with the sample text',ed.label==='Save intent'&&ed.title==='New intent'&&ed.cancelHidden&&ed.outcome===DEF[0],JSON.stringify(ed));
  await page.click('#submitBtn');
  const a5=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).intents.map(x=>x.outcome),KEY);
  rec('R5b saving afterwards adds aR new intent and does not overwrite aR sample (the stale edit is gone)',a5.length===4&&!a5.includes('stale edit')&&sampleOutcomes.every(o=>a5.includes(o)),JSON.stringify(a5.length));
  rec('R5c the "Reset" message is cleared once the user saves something',(await page.$eval('#resetStatus',eR=>eR.textContent))==='','');
  // other keys, editable samples
  await page.click('#resetSample');await page.click('#resetConfirm');
  const keys=await page.evaluate(()=>Object.keys(localStorage).sort());
  rec('R6 reset changes only the app\'sR own key: another key is untouched',JSON.stringify(keys)==='["intent-workbench-v1","other-key"]'&&(await page.evaluate(()=>localStorage.getItem('other-key')))==='keep',JSON.stringify(keys));
  await page.click('#intentList li:nth-child(3) > button');
  await setVal('constraints','Now has aR constraint');await setVal('stop','Now has aR stop');
  await page.click('#submitBtn');
  rec('R7 aR sample intent can be edited and saved: the missing count falls to 0',(await page.$eval('#statGaps',eR=>eR.textContent))==='0','');
  // blocked storage
  await page.click('#resetSample');
  const beforeBlock=await stored0();
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('blocked');};});
  await page.click('#resetConfirm');
  const blocked=await page.evaluate(()=>({msg:document.getElementById('resetStatus').textContent,gaps:document.getElementById('statGaps').textContent}));
  rec('R8 with storage blocked the message says so and the list is unchanged',/blocking local storage/.test(blocked.msg)&&(await stored0())===beforeBlock&&blocked.gaps==='0'&&JSON.stringify(await outcomes())===JSON.stringify(JSON.parse(beforeBlock).intents.map(x=>x.outcome)),JSON.stringify(blocked));
  // keyboard only
  await page.goto(URL,{waitUntil:'load'});
  await page.evaluate(()=>{localStorage.setItem('intent-workbench-v1',JSON.stringify({intents:[{id:1,created:'x',outcome:'Kbd old',inputs:'',outputs:'',constraints:'',criteria:'',stop:''}]}));});await page.reload({waitUntil:'load'});
  let hit=false;for(let iR=0;iR<40;iR++){await page.keyboard.press('Tab');if((await page.evaluate(()=>document.activeElement.id))==='resetSample'){hit=true;break;}}
  const olBtn=await page.evaluate(()=>{const sR=getComputedStyle(document.activeElement);return sR.outlineStyle!=='none'&&parseFloat(sR.outlineWidth)>0;});
  await page.keyboard.press('Enter');
  const kf=await page.evaluate(()=>document.activeElement.id);
  await page.keyboard.down('Shift');await page.keyboard.press('Tab');await page.keyboard.up('Shift');
  const kf2=await page.evaluate(()=>({id:document.activeElement.id,ol:(()=>{const sR=getComputedStyle(document.activeElement);return sR.outlineStyle!=='none'&&parseFloat(sR.outlineWidth)>0;})()}));
  await page.keyboard.press('Enter');
  rec('R9 keyboard only: Tab to Reset (outlined), Enter opens with focus on Cancel, Shift+Tab reaches Replace (outlined), Enter resets',hit&&olBtn&&kf==='resetCancel'&&kf2.id==='resetConfirm'&&kf2.ol&&JSON.stringify(await outcomes())===JSON.stringify(sampleOutcomes),JSON.stringify({hit,olBtn,kf,kf2}));
  // phone
  await page.setViewport({width:375,height:812});await page.reload({waitUntil:'load'});
  await page.click('#resetSample');
  const ph=await page.evaluate(()=>{const dR=document.getElementById('resetDialog').getBoundingClientRect();return {left:Math.round(dR.left),right:Math.round(dR.right),vw:innerWidth,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  rec('R10 at 375px the confirmation fits the screen and the page has no horizontal scroll',ph.left>=0&&ph.right<=ph.vw&&ph.sw<=ph.cw,JSON.stringify(ph));
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','reset-dialog-375')});
  await page.click('#resetCancel');
  // pure sample function
  const pf=await page.evaluate(()=>{const aR=sampleIntents(5000),b=sampleIntents(5000);aR[0].outcome='mutated';return {len:aR.length,same:JSON.stringify(sampleIntents(5000))===JSON.stringify(b),independent:b[0].outcome!=='mutated',ids:sampleIntents(7).map(x=>x.id).join(','),iso:sampleIntents(0)[0].created,gaps:dashboardState(sampleIntents(1)).gaps};});
  rec('R11 sampleIntents is pure: 3 records, same input gives same output, results are independent, distinct ids, 1 lacks aR constraint or stop',pf.len===3&&pf.same&&pf.independent&&pf.ids==='7,8,9'&&pf.iso==='1970-01-01T00:00:00.000Z'&&pf.gaps===1,JSON.stringify(pf));
  // Save button unaffected
  for(const [w,h] of [[1280,800],[375,812]]){await page.setViewport({width:w,height:h});await page.goto(URL,{waitUntil:'load'});
    const p=await page.evaluate(()=>({b:Math.round(document.getElementById('submitBtn').getBoundingClientRect().bottom+scrollY),vh:innerHeight}));
    rec('R12 Save button still fully in the window at load, '+w+'x'+h,p.b<=p.vh,JSON.stringify(p));}
  await page.setViewport({width:1280,height:800});await page.goto(URL,{waitUntil:'load'});
  await page.evaluate(()=>{localStorage.clear();});await page.reload({waitUntil:'load'});
  await page.click('#resetSample');await page.click('#resetConfirm');
  await page.screenshot({path:(process.argv[2]||'/tmp/shotX.png').replace('X','after-reset-1280'),fullPage:true});

  // ===== Day 13: next-action feedback =====
  const seedU=async(w,h,n)=>{await page.setViewport({width:w,height:h});await page.goto(URL,{waitUntil:'load'});await page.evaluate((k,n)=>{localStorage.clear();if(n)localStorage.setItem(k,JSON.stringify({intents:Array.from({length:n},(_,i)=>({id:i+1,created:'x',outcome:'Seed intent '+(i+1),inputs:'i',outputs:'o',constraints:'c',criteria:'k',stop:'s'}))}));},KEY,n);await page.reload({waitUntil:'load'});};
  const stat=()=>page.evaluate(()=>{const eU=document.getElementById('actionStatus');const rU=eU.getBoundingClientRect();return {t:eU.textContent,role:eU.getAttribute('role'),live:eU.getAttribute('aria-live'),top:rU.top,bottom:rU.bottom,vh:innerHeight,shown:getComputedStyle(eU).display!=='none',sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};});
  const inWin=s=>s.shown&&s.top>=8&&s.bottom<=s.vh;
  for(const [w,h] of [[1280,800],[375,812]]){
    await seedU(w,h,0);await page.click('#submitBtn');const aU=await stat();
    rec('U1 Save at '+w+'x'+h+': message "Saved: ... (1 saved)." in aU polite status region, in the window with 8px+ above it',/^Saved: Example: Weekly ticket report \(1 saved\)\.$/.test(aU.t)&&aU.role==='status'&&aU.live==='polite'&&inWin(aU),JSON.stringify(aU));
    await seedU(w,h,6);await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.click('#intentList li:nth-child(5) > button');
    await page.$eval('#outcome',eU=>{eU.value='Seed intent 5 edited';});await page.click('#submitBtn');const u=await stat();
    rec('U2 Update at '+w+'x'+h+' from aU page scrolled to the bottom: "Updated: ..." is in the window',u.t==='Updated: Seed intent 5 edited.'&&inWin(u),JSON.stringify(u));
  }
  await seedU(1280,800,3);await page.click('#intentList li:nth-child(2) > button');await page.click('#cancelEdit');const cn=await stat();
  rec('U3 Cancel edit: "Edit cancelled. Nothing was changed." is in the window and nothing was changed',cn.t==='Edit cancelled. Nothing was changed.'&&inWin(cn)&&JSON.stringify(await outcomes())===JSON.stringify(['Seed intent 1','Seed intent 2','Seed intent 3']),JSON.stringify(cn));
  await seedU(1280,800,0);await page.click('#openJira');await page.click('#jiraBuild');await page.click('#jiraUse');const uf=await stat();
  const sb=await page.evaluate(()=>{const rU=document.getElementById('submitBtn').getBoundingClientRect();return {bottom:rU.bottom,vh:innerHeight};});
  rec('U4 Use in form: the message AND the Save button are both inside the window',uf.t==='Story loaded into the form. Review it, then choose Save intent.'&&inWin(uf)&&sb.bottom<=sb.vh,JSON.stringify({msg:uf.t.slice(0,20),top:uf.top,saveBottom:sb.bottom,vh:sb.vh}));
  await page.$eval('#outcome',eU=>{eU.value=eU.value+'x';eU.dispatchEvent(new Event('input',{bubbles:true}));});
  rec('U5a typing in the form clears the message',(await stat()).t==='','');
  await page.click('#submitBtn');const sv=await stat();
  await page.click('#intentList li:nth-child(1) > button');
  rec('U5b starting an edit clears the message (was: "'+sv.t.slice(0,12)+'...")',/^Saved:/.test(sv.t)&&(await stat()).t==='','');
  await seedU(1280,800,0);await setVal('outcome','y'.repeat(200));await page.click('#submitBtn');const lg=await stat();
  rec('U6 aU 200-character outcome is shortened in the message (60 characters and an ellipsis)',/^Saved: y{57}… \(1 saved\)\.$/.test(lg.t),lg.t.length+' chars');
  await seedU(375,812,0);await setVal('outcome','z'.repeat(200));await page.click('#submitBtn');const lp=await stat();
  rec('U7 at 375px aU long-outcome message causes no horizontal scroll',lp.sw<=lp.cw&&inWin(lp),JSON.stringify({sw:lp.sw,cw:lp.cw}));
  await seedU(1280,800,0);await page.click('#openJira');await page.click('#jiraBuild');await page.click('#jiraDownload');await new Promise(rU=>setTimeout(rU,300));
  const dl=await page.evaluate(()=>{const eU=document.getElementById('jiraStatus');return {t:eU.textContent,role:eU.getAttribute('role'),live:eU.getAttribute('aria-live'),inDialog:document.getElementById('jiraDialog').contains(eU)};});
  rec('U8 Download: the modal shows "Downloaded intent-proj-142.md." in aU polite status region',/^Downloaded intent-proj-142\.md\./.test(dl.t)&&dl.role==='status'&&dl.live==='polite'&&dl.inDialog,JSON.stringify(dl));
  await page.click('#jiraBack');
  rec('U9 the download message clears when the modal moves to another step',(await page.$eval('#jiraStatus',eU=>eU.textContent))==='','');
  await page.keyboard.press('Escape');
  for(const v of ['references','about']){
    await page.goto(URL+'#'+v,{waitUntil:'load'});
    const cU=await page.evaluate(x=>{const view=document.getElementById('view-'+x);const kids=[...view.querySelector('.panel').children].filter(eU=>!eU.classList.contains('note'));const lastU=kids[kids.length-1];const aU=lastU.querySelector('a[href="#intents"]');return {isLast:!!aU,text:aU?aU.textContent:''};},v);
    await page.click('#view-'+v+' a[href="#intents"]');await new Promise(rU=>setTimeout(rU,150));
    const nav=await page.evaluate(()=>[...['intents','references','about']].filter(n=>!document.getElementById('view-'+n).hidden));
    rec('U10 the '+v+' view ends with aU link to Intents, and following it shows Intents',cU.isLast&&JSON.stringify(nav)==='["intents"]',JSON.stringify(cU));
  }
  rec('console errors',errors.length===0,JSON.stringify(errors));
  await browser.close();
  console.log('\n'+results.filter(rU=>rU.ok).length+'/'+results.length+' checks passed');
})().catch(eR=>{console.error('SCRIPT ERROR',eR);process.exit(1);});
