require('./h.js')('day24',async c=>{
  const {page,rec,fs,REPO}=c;
  const iv=(id,o,rest)=>Object.assign({id,created:'2026-01-01T00:00:00.000Z',outcome:o,inputs:'i',outputs:'o',constraints:'c',criteria:'The page shows a button',stop:'Stop when it shows'},rest||{});
  await c.start(null);
  // ---- pure
  const p=await page.evaluate(()=>{const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};const e=metrics(emptyState(0));const s=metrics(sampleState(1000));const f=deep(sampleState(5));return {e:e.map(x=>[x.id,x.label,x.value,x.of]),s:s.map(x=>[x.id,x.value,x.of]),why:s.every(x=>x.why.length>20),same:JSON.stringify(metrics(f))===JSON.stringify(metrics(f))};});
  rec('M1a metrics: exactly four, in order (Intents ready, Reviews completed, Capabilities promoted, 28-day progress); an empty project reads 0 of 0, 0, 0 of 2, 0 of 28',JSON.stringify(p.e)==='[["ready","Intents ready",0,0],["reviews","Reviews completed",0,null],["promoted","Capabilities promoted",0,2],["progress","28-day progress",0,28]]',JSON.stringify(p.e));
  rec('M1b the sample data reads 2 of 3 ready, 1 review, 1 of 2 promoted, 8 of 28; every metric has a why line; deterministic on frozen input',JSON.stringify(p.s)==='[["ready",2,3],["reviews",1,null],["promoted",1,2],["progress",8,28]]'&&p.why&&p.same,JSON.stringify(p.s));
  const src=fs.readFileSync(REPO+'/app/logic.js','utf8')+fs.readFileSync(REPO+'/app/app.js','utf8');
  rec('M1c no code counts page views, clicks, time spent, or saves (no analytics, timers, visit or click counters), and logic.js has no page, storage, clock, or random use',!/pageview|page_view|analytics\.|\bga\(|gtag|segment\.|visits?\s*[:=+]|clickCount|timeSpent|performance\.now|sessionStorage|navigator\.sendBeacon/i.test(src)&&!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(fs.readFileSync(REPO+'/app/logic.js','utf8')),'');
  // ---- panel
  await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');
  const panel=()=>page.evaluate(()=>({h3:[...document.querySelectorAll('#view-overview h3')].map(h=>h.textContent),note:document.querySelector('#metrics').previousElementSibling.textContent,m:[...document.querySelectorAll('#metrics > li')].map(li=>({id:li.dataset.metric,n:li.querySelector('strong').textContent,label:li.querySelectorAll('span')[0].textContent,why:li.querySelectorAll('span')[1].textContent}))}));
  const v=await panel();
  rec('M2a the Overview has an Outcomes panel, before "How it fits together", with the four metrics in order, each with a number, a label, and a why line',v.h3.indexOf('Outcomes')>=0&&v.h3.indexOf('Outcomes')<v.h3.indexOf('How it fits together')&&v.m.map(x=>x.label).join()==='Intents ready,Reviews completed,Capabilities promoted,28-day progress'&&v.m.map(x=>x.n).join()==='2 of 3,1,1 of 2,8 of 28'&&v.m.every(x=>x.why.length>20),JSON.stringify(v.m.map(x=>x.n)));
  rec('M2b the panel says that page views, clicks, time spent, and number of saves are deliberately not measured because they measure activity, not outcomes',/Not measured, on purpose: page views, clicks, time spent, and number of saves\. They measure activity, not outcomes\./.test(v.note),v.note);
  const flow=await page.$$eval('#flow li',ls=>ls.map(l=>l.querySelector('.flowcount').textContent));
  rec('M2c the metrics agree with the Overview flow and the stored data: 2 ready of 3 saved, 1 review, 1 of 2 promoted, 8 days',flow[0]==='3 saved, 2 ready'&&flow[4]==='1 review recorded'&&flow[5]==='1 of 2 promoted'&&flow[2]==='8 of 28 days done'&&(await c.stored()).reviews.length===1,JSON.stringify(flow));
  // ---- live updates
  await c.view('intents');await page.click('#submitBtn');await c.view('overview');
  const a1=(await panel()).m[0].n;
  await c.view('review');await page.$eval('#notChecked',e=>{e.value='Something';});await page.click('#reviewSave');await c.wait(120);await c.view('overview');
  const a2=(await panel()).m[1].n;
  await c.view('capabilities');await page.click('#capList > li:nth-child(2) button[aria-label^="Record a successful use"]');await c.wait(100);await page.click('#capList > li:nth-child(2) button[aria-label^="Promote"]');await c.wait(120);await c.view('overview');
  const a3=(await panel()).m[2].n;
  rec('M3a without a reload: saving the example intent makes it 3 of 4 ready; recording a review makes 2 reviews; promoting the review skill makes 2 of 2 promoted',a1==='3 of 4'&&a2==='2'&&a3==='2 of 2',[a1,a2,a3].join(' | '));
  // ---- days
  const days=await page.$$eval('#days > li',ls=>ls.map(l=>({t:l.textContent.trim(),on:l.querySelector('input').checked,lab:!!l.querySelector('label input')})));
  const roadmap=fs.readFileSync(REPO+'/ROADMAP.md','utf8').split('\n').filter(l=>/^\| \d+ \|/.test(l)).map(l=>l.split('|').map(x=>x.trim())).map(r=>[+r[1],r[2]]);
  rec('M4a the list has 28 checkboxes labelled "Day N: <title>", with titles equal to the ROADMAP.md focus column (a drift guard), and days 1 to 8 ticked in the sample',days.length===28&&roadmap.length===28&&days.every((d,i)=>d.t==='Day '+roadmap[i][0]+': '+roadmap[i][1]&&d.lab)&&days.slice(0,8).every(d=>d.on)&&days.slice(8).every(d=>!d.on),days[10].t);
  await page.click('#days > li:nth-child(20) input');await c.wait(120);
  const st=await c.stored();
  rec('M4b ticking day 20 saves it, updates the metric to 9 of 28 and the flow Build stage to "9 of 28 days done", and says "Day 20 marked done. 9 of 28 days done."',st.progress.days[20]===true&&(await panel()).m[3].n==='9 of 28'&&(await page.$eval('#flow li[data-stage="build"] .flowcount',e=>e.textContent))==='9 of 28 days done'&&(await c.text('#progressStatus'))==='Day 20 marked done. 9 of 28 days done.',await c.text('#progressStatus'));
  await page.reload({waitUntil:'load'});await c.view('overview');
  const on20=await page.$eval('#days > li:nth-child(20) input',i=>i.checked);
  await page.click('#days > li:nth-child(20) input');await c.wait(120);
  rec('M4c the tick survives a reload; unticking says "Day 20 unmarked. 8 of 28 days done." and removes it from storage',on20&&(await c.text('#progressStatus'))==='Day 20 unmarked. 8 of 28 days done.'&&(await c.stored()).progress.days[20]===undefined,await c.text('#progressStatus'));
  // ---- link to progress
  await c.view('intents');await c.view('overview');
  await page.click('#flow li[data-stage="build"] a');await c.wait(200);
  const nav1=await page.evaluate(()=>({hash:location.hash,view:['intents','review','capabilities','overview','references','about'].filter(n=>!document.getElementById('view-'+n).hidden).join(),top:Math.round(document.getElementById('progress').getBoundingClientRect().top),vh:innerHeight,cur:[...document.querySelectorAll('nav a[aria-current="page"]')].map(a=>a.textContent).join()}));
  rec('M5a the Build stage link goes to #progress: Overview is shown (and marked current in the nav) with the progress heading scrolled into the window',nav1.hash==='#progress'&&nav1.view==='overview'&&nav1.cur==='Overview'&&nav1.top>=0&&nav1.top<nav1.vh,JSON.stringify(nav1));
  await c.go('#progress');
  const nav2=await page.evaluate(()=>({view:['intents','overview'].filter(n=>!document.getElementById('view-'+n).hidden).join(),top:Math.round(document.getElementById('progress').getBoundingClientRect().top),vh:innerHeight}));
  rec('M5b opening the address #progress directly shows Overview scrolled to the list',nav2.view==='overview'&&nav2.top>=0&&nav2.top<nav2.vh,JSON.stringify(nav2));
  // ---- keyboard, phone, buttons
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');
  await page.keyboard.press('Tab');await page.focus('#days > li:nth-child(9) input');
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;});
  await page.keyboard.press('Space');await c.wait(120);
  rec('M6a keyboard: a day checkbox has a visible outline and Space ticks day 9 (stored)',ol&&(await c.stored()).progress.days[9]===true,'');
  const fb=await page.$$eval('#view-overview button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).length);
  rec('M6b the Overview shows no filled button',fb===0,String(fb));
  await c.start(null,375,812,'#overview');
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,tap:Math.round(document.querySelector('#days label').getBoundingClientRect().height)}));
  rec('M6c the Overview with the metrics and the 28-day list has no horizontal scroll at 375px, and each day row is at least 40px tall',ow.sw<=ow.cw&&ow.tap>=40,JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','metrics-375'));
  await c.start(null,1280,800);await page.click('#resetSample');await page.click('#resetConfirm');await c.view('overview');await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','metrics-1280'));
});
