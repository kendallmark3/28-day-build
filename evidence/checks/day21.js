require('./h.js')('day21',async c=>{
  const {page,rec,fs,REPO}=c;
  const md=f=>fs.readFileSync(REPO+'/'+f,'utf8');
  const sec=(t,h)=>{const m=t.match(new RegExp('## '+h+'\\n([\\s\\S]*?)(?=\\n## |$)'));return m?m[1].trim():null;};
  const lines=(t,strip)=>t.split('\n').map(l=>l.replace(strip,'').trim()).filter(Boolean);
  const intentFile=md('skills/intent-check.md'),reviewFile=md('skills/evidence-first-review.md');
  // what the files say
  const fileSpec={
    'cap-intent-check':{purpose:sec(intentFile,'Purpose'),procedure:lines(sec(intentFile,'Procedure'),/^\d+\.\s+/),output:sec(intentFile,'Output'),checks:sec(intentFile,'Check'),owner:sec(intentFile,'Owner'),version:sec(intentFile,'Version')},
    'cap-evidence-review':{purpose:sec(reviewFile,'Purpose'),procedure:lines(sec(reviewFile,'Procedure'),/^- /),output:sec(reviewFile,'Output'),checks:sec(reviewFile,'Guardrail'),owner:sec(reviewFile,'Owner'),version:sec(reviewFile,'Version')}};
  await c.start(null);
  rec('K1a both skills files have Owner and Version sections ("Project owner", "1.0")',['cap-intent-check','cap-evidence-review'].every(k=>fileSpec[k].owner==='Project owner'&&fileSpec[k].version==='1.0'),JSON.stringify([fileSpec['cap-intent-check'].owner,fileSpec['cap-intent-check'].version]));
  // pure records equal the files
  const rec0=await page.evaluate(()=>builtInCapabilities().map(b=>({id:b.id,purpose:b.purpose,procedure:b.procedure.split('\n'),output:b.output,checks:b.checks,owner:b.owner,version:b.version,file:b.file,level:b.level})));
  const drift=[];for(const b of rec0){const f=fileSpec[b.id];for(const k of ['purpose','output','checks','owner','version']){if(b[k]!==f[k])drift.push(b.id+'.'+k);}if(JSON.stringify(b.procedure)!==JSON.stringify(f.procedure))drift.push(b.id+'.procedure');}
  rec('K1b the built-in capability records equal the skills files word for word (purpose, every procedure line, output, checks, owner, version): no drift',rec0.length===2&&drift.length===0,JSON.stringify(drift));
  // the view
  await c.view('capabilities');
  const nav=await page.$$eval('nav a',a=>a.map(x=>x.textContent));
  const cards=await page.evaluate(()=>[...document.querySelectorAll('#capList > li')].map(li=>({id:li.dataset.cap,name:li.querySelector('.capname').textContent,badge:li.querySelector('.badge').textContent,purpose:li.querySelector('.claimtext').textContent,steps:[...li.querySelectorAll('ol li')].map(x=>x.textContent),h4:[...li.querySelectorAll('h4')].map(x=>x.textContent),paras:[...li.querySelectorAll(':scope > p')].map(x=>x.textContent),src:(()=>{const a=li.querySelector('a[target]');return a?{href:a.href,text:a.textContent,rel:a.rel}:null;})(),use:[...li.querySelectorAll('a:not([target])')].map(a=>({href:a.getAttribute('href'),text:a.textContent}))})));
  rec('K2a a Capabilities item is in the nav and the view shows two cards, Intent check then Evidence-first review, each labelled Skill',nav.includes('Capabilities')&&cards.length===2&&cards[0].name==='Intent check'&&cards[1].name==='Evidence-first review'&&cards.every(k=>k.badge==='Skill'),JSON.stringify(cards.map(k=>[k.name,k.badge])));
  const shown=[];for(const k of cards){const f=fileSpec[k.id];
    if(k.purpose!==f.purpose)shown.push(k.id+' purpose');if(JSON.stringify(k.steps)!==JSON.stringify(f.procedure))shown.push(k.id+' procedure');
    if(!k.paras.includes(f.output))shown.push(k.id+' output');if(!k.paras.includes(f.checks))shown.push(k.id+' checks');
    if(!k.paras.includes('Owner: '+f.owner+'. Version: '+f.version+'.'))shown.push(k.id+' owner/version');
    if(JSON.stringify(k.h4)!=='["Procedure","Output","Checks","Sample usage"]')shown.push(k.id+' headings');}
  rec('K2b what each card shows equals the skills file: purpose, all procedure steps (7 and 6) as an ordered list, output, checks, owner and version, under Procedure, Output, and Checks headings, then Sample usage (Day 22)',shown.length===0&&cards[0].steps.length===7&&cards[1].steps.length===6,JSON.stringify(shown));
  rec('K2c each card links to its file in the project repository (new tab, noopener noreferrer) and to where it is used',cards.every(k=>k.src&&k.src.href.startsWith('https://github.com/kendallmark3/28-day-build/blob/main/skills/')&&/noopener/.test(k.src.rel)&&/noreferrer/.test(k.src.rel)&&k.use.length===1&&k.use[0].href==='#review'),JSON.stringify(cards.map(k=>[k.src&&k.src.text,k.use[0]&&k.use[0].text])));
  await page.click('#capList li:nth-child(1) a[href="#review"]');await c.wait(150);
  rec('K2d the use link opens the Review view',(await page.evaluate(()=>!document.getElementById('view-review').hidden)),'');
  // stale text in stored data is refreshed
  await c.start({intents:[],capabilities:[{id:'cap-intent-check',name:'Intent check',level:'skill',purpose:'STALE',procedure:'x',output:'x',checks:'x',owner:'nobody',version:'0.0',uses:[],promoted:false}]},1280,800,'#capabilities');
  const stale=await page.evaluate(()=>document.querySelector('#capList li .claimtext').textContent);
  rec('K3 an older stored copy of a built-in capability is shown with the current file text, not the stale text',stale===fileSpec['cap-intent-check'].purpose,stale);
  // flow link
  await c.start(null);await c.view('overview');
  const hrefs=await page.$$eval('#flow li a',a=>a.map(x=>x.getAttribute('href')));
  await page.click('#flow li[data-stage="capability"] a');await c.wait(150);
  rec('K4 the Overview flow\'s Capability stage links to the Capabilities view, and the link opens it',hrefs.includes('#capabilities')&&(await page.evaluate(()=>!document.getElementById('view-capabilities').hidden)),JSON.stringify(hrefs));
  // end link, keyboard, phone
  const endLink=await page.evaluate(()=>{const ch=[...document.querySelector('#view-capabilities .panel').children];const l=ch[ch.length-1];return l.querySelector('a[href="#overview"]')?l.textContent:'';});
  rec('K5a the view ends with a link to the next action',/^Next: see how capabilities fit/.test(endLink),endLink);
  await c.view('capabilities');
  const tab=[];for(let i=0;i<30&&tab.length<4;i++){await page.keyboard.press('Tab');const r=await page.evaluate(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {in:!!e.closest('#capList')&&e.tagName==='A',t:e.textContent,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};});if(r.in)tab.push(r);}
  rec('K5b the four links on the cards are reachable by keyboard in order (file, use, file, use), each with a visible outline',tab.length===4&&tab.every(x=>x.ol)&&/skills\/intent-check\.md/.test(tab[0].t)&&/Check a saved intent/.test(tab[1].t)&&/skills\/evidence-first-review\.md/.test(tab[2].t),JSON.stringify(tab.map(x=>x.t)));
  await c.start(null,375,812,'#capabilities');
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('K5c the Capabilities view has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','capabilities-375'));
  const prim=await page.$$eval('#view-capabilities button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).length);
  rec('K5d the view shows no filled button (at most one per view)',prim<=1,String(prim));
});
