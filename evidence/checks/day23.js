require('./h.js')('day23',async c=>{
  const {page,rec,fs,REPO}=c;
  const cap=(o)=>Object.assign({id:'c1',name:'Thing',level:'skill',purpose:'',procedure:'',output:'',checks:'',owner:'You',version:'0.1',uses:[],promoted:false,builtIn:false},o||{});
  await c.start(null);
  // ---- pure
  const p=await page.evaluate(()=>{
    const deep=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(deep);}return o;};
    const mk=(s,f)=>({id:'x',name:'N',level:'skill',promoted:false,uses:[].concat(Array(s).fill({date:'d',success:true}),Array(f).fill({date:'d',success:false}))});
    const st=(s,f)=>promotionStatus(mk(s,f));
    const c0=deep(mk(1,0));const w=withUse(c0,true,0);const w2=withUse(c0,'yes',0);
    const t=(s,f)=>tryPromote(mk(s,f));
    return {ladder:LADDER.map(r=>r.id),levels:LEVELS,counts:ladderCounts([{level:'skill'},{level:'skill'},{level:'workflow'},{level:'bogus'}]),
      s:[st(0,0),st(1,0),st(2,0),st(0,5),st(2,3)].map(x=>[x.successes,x.failures,x.missing,x.can]),
      w:[w.uses.length,w.uses[1].success,w.uses[1].date,c0.uses.length,w2.uses[1].success],
      t0:t(0,0),t1:t(1,0),t2:t(2,0),tf:t(0,4),tp:tryPromote(Object.assign(mk(2,0),{promoted:true})),
      ids:[nextCapabilityId([],7),nextCapabilityId([{id:'cap-user-7-0'}],7)],
      same:JSON.stringify(tryPromote(mk(2,0)))===JSON.stringify(tryPromote(mk(2,0)))};});
  rec('L1a the ladder has five rungs in order: prompt, skill, trigger, workflow, business; ladderCounts counts each rung and ignores an unknown level',p.ladder.join()==='prompt,skill,trigger,workflow,business'&&p.levels.join()===p.ladder.join()&&JSON.stringify(p.counts)==='{"prompt":0,"skill":2,"trigger":0,"workflow":1,"business":0}',JSON.stringify(p.counts));
  rec('L1b promotionStatus counts only successful uses: (0,0) needs 2; (1,0) needs 1; (2,0) can promote; five failures still need 2; (2 successes, 3 failures) can promote',JSON.stringify(p.s)==='[[0,0,2,false],[1,0,1,false],[2,0,0,true],[0,5,2,false],[2,3,0,true]]',JSON.stringify(p.s));
  rec('L1c withUse adds a dated use without changing its (frozen) input, and only the value true counts as success',p.w[0]===2&&p.w[1]===true&&p.w[2]==='1970-01-01T00:00:00.000Z'&&p.w[3]===1&&p.w[4]===false,JSON.stringify(p.w));
  rec('L1d tryPromote refuses with the number missing and the rule: 0 uses "2 more uses are needed", 1 use "1 more use is needed", four failures "2 more"; promotes at 2; says "Already promoted."',!p.t0.ok&&/2 more uses are needed\. Source: context\/business-rules\.md, rule 5\./.test(p.t0.message)&&!p.t1.ok&&/1 more use is needed/.test(p.t1.message)&&p.t2.ok&&p.t2.cap.promoted===true&&/^Promoted: N\./.test(p.t2.message)&&!p.tf.ok&&/2 more uses are needed/.test(p.tf.message)&&!p.tp.ok&&p.tp.message==='Already promoted.',JSON.stringify([p.t0.message,p.t1.message]));
  rec('L1e nextCapabilityId never repeats; tryPromote is deterministic; logic.js has no page, storage, clock, or random use',p.ids.join()==='cap-user-7-0,cap-user-7-1'&&p.same&&!/\bdocument\b|\bwindow\b|\blocalStorage\b|Date\.now\(|Math\.random/.test(fs.readFileSync(REPO+'/app/logic.js','utf8')),'');
  // ---- ladder and sample
  await page.click('#resetSample');await page.click('#resetConfirm');await c.view('capabilities');
  const lad=()=>page.$$eval('#ladder > li',ls=>ls.map(l=>({id:l.dataset.rung,name:l.querySelector('h4').textContent,what:l.querySelector('p').textContent,n:l.querySelector('.flowcount').textContent})));
  const l0=await lad();
  rec('L2a the ladder shows the five rungs in order with a meaning each, and the sample counts (Skill 2 items, the rest 0 items)',l0.map(x=>x.name).join()==='Prompt,Skill,Trigger,Workflow,Business capability'&&l0.every(x=>x.what.length>15)&&l0.map(x=>x.n).join()==='0 items,2 items,0 items,0 items,0 items',JSON.stringify(l0.map(x=>x.n)));
  const cards=await page.$$eval('#capList > li',ls=>ls.map(l=>({badges:[...l.querySelectorAll('.badge')].map(b=>b.textContent),uses:l.querySelector('.uses').textContent})));
  rec('L2b the sample shows the rule: the intent check has the Promoted badge (2 successful uses) and the review skill "Promotion needs 1 more successful use."',cards[0].badges.includes('Promoted')&&/Successful uses: 2\. Unsuccessful: 0\. Promoted\./.test(cards[0].uses)&&!cards[1].badges.includes('Promoted')&&/Successful uses: 1\. Unsuccessful: 0\. Promotion needs 1 more successful use\./.test(cards[1].uses),JSON.stringify(cards));
  // ---- classify
  await page.select('#capList > li:nth-child(1) label select','workflow');await c.wait(150);
  const l1=await lad();const st1=await c.stored();
  rec('L3a classifying the intent check as a Workflow updates its badge, the ladder (Skill 1, Workflow 1), the stored level, and says so',l1.map(x=>x.n).join()==='0 items,1 item,0 items,1 item,0 items'&&st1.capabilities[0].level==='workflow'&&(await page.$eval('#capList > li:nth-child(1) .badge',b=>b.textContent))==='Workflow'&&(await c.text('#capStatus'))==='Classified as Workflow: Intent check.',JSON.stringify(l1.map(x=>x.n)));
  await page.reload({waitUntil:'load'});await c.view('capabilities');
  rec('L3b the classification and the promoted state survive a reload',(await lad()).map(x=>x.n).join()==='0 items,1 item,0 items,1 item,0 items'&&(await c.stored()).capabilities[0].promoted===true,'');
  // ---- add item
  await page.click('#capAdd');
  const n0=(await c.stored()).capabilities.length;
  rec('L4a adding without a name is refused with a message, focus moves to the name, and nothing is stored',/Give the item a name first/.test(await c.text('#capError'))&&(await page.evaluate(()=>document.activeElement.id))==='capName'&&(await c.stored()).capabilities.length===n0,'');
  await page.$eval('#capName',e=>{e.value='Weekly triage';});await page.select('#capLevel','trigger');await page.$eval('#capPurpose',e=>{e.value='Sort new tickets every Monday';});await page.click('#capAdd');await c.wait(150);
  const st2=await c.stored();const mine=st2.capabilities[st2.capabilities.length-1];
  const skipped=await page.evaluate(k=>normalizeState(JSON.parse(localStorage.getItem(k)),0).skipped,c.KEY);
  rec('L4b the new item is stored valid (not built in, no uses, not promoted, level trigger, purpose kept), listed, counted in the ladder (Trigger 1 item), and announced',mine.name==='Weekly triage'&&mine.level==='trigger'&&mine.builtIn===false&&mine.uses.length===0&&mine.promoted===false&&mine.purpose==='Sort new tickets every Monday'&&skipped===0&&(await lad())[2].n==='1 item'&&(await c.text('#capStatus'))==='Added: Weekly triage (Trigger).'&&(await page.$$eval('#capList > li',l=>l.length))===3,JSON.stringify(mine).slice(0,100));
  // ---- uses and promotion on the new item (card 3)
  const card3='#capList > li:nth-child(3)';
  const uses=()=>page.$eval(card3+' .uses',e=>e.textContent);
  await page.click(card3+' button[aria-label^="Record a successful use"]');await c.wait(120);
  const u1=await uses();const s1=(await c.stored()).capabilities[2];
  rec('L5a recording a successful use updates the counts ("Successful uses: 1. Unsuccessful: 0. Promotion needs 1 more successful use.") and stores a dated use',/^Successful uses: 1\. Unsuccessful: 0\. Promotion needs 1 more successful use\.$/.test(u1)&&s1.uses.length===1&&s1.uses[0].success===true&&/^\d{4}-\d\d-\d\dT/.test(s1.uses[0].date)&&/Successful use recorded: Weekly triage \(1 successful\)\./.test(await c.text('#capStatus')),u1);
  await page.click(card3+' button[aria-label^="Record an unsuccessful use"]');await c.wait(120);
  rec('L5b an unsuccessful use is recorded but does not count: "Successful uses: 1. Unsuccessful: 1." and the message says so',/^Successful uses: 1\. Unsuccessful: 1\. Promotion needs 1 more/.test(await uses())&&/does not count toward promotion/.test(await c.text('#capStatus')),await uses());
  await page.click(card3+' button[aria-label^="Promote"]');await c.wait(120);
  const refused=await c.text('#capStatus');
  rec('L5c Promote with only 1 successful use is refused: "Promotion needs 2 successful uses. 1 more use is needed." citing business rule 5, and the capability is not promoted',/^Promotion needs 2 successful uses\. 1 more use is needed\. Source: context\/business-rules\.md, rule 5\.$/.test(refused)&&(await c.stored()).capabilities[2].promoted===false&&!(await page.$eval(card3,l=>[...l.querySelectorAll('.badge')].some(b=>b.textContent==='Promoted'))),refused);
  await page.click(card3+' button[aria-label^="Record a successful use"]');await c.wait(120);
  const ready=await uses();
  await page.click(card3+' button[aria-label^="Promote"]');await c.wait(150);
  rec('L5d with 2 successful uses (and 1 unsuccessful) it says "Ready to promote." and Promote succeeds: stored promoted, the Promoted badge, "Promoted: Weekly triage."',/Successful uses: 2\. Unsuccessful: 1\. Ready to promote\./.test(ready)&&(await c.stored()).capabilities[2].promoted===true&&(await page.$eval(card3,l=>[...l.querySelectorAll('.badge')].some(b=>b.textContent==='Promoted')))&&(await c.text('#capStatus'))==='Promoted: Weekly triage.'&&/Promoted\.$/.test(await uses()),ready);
  await c.view('overview');const flow=await page.$eval('#flow li[data-stage="capability"] .flowcount',e=>e.textContent);
  rec('L5e the Overview flow counts it: the Capability stage now reads "2 of 3 promoted"',/^2 of 3 promoted$/.test(flow),flow);
  // failures never count
  await c.start({intents:[],capabilities:[cap({id:'f1',name:'Only failures',uses:[{date:'d',success:false},{date:'d',success:false},{date:'d',success:false}]})]},1280,800,'#capabilities');
  await page.click('#capList > li:nth-child(3) button[aria-label^="Promote"]');await c.wait(100);
  rec('L5f three unsuccessful uses do not allow promotion: "2 more uses are needed"',/2 more uses are needed/.test(await c.text('#capStatus')),await c.text('#capStatus'));
  // ---- hostile text, phone, keyboard, one filled button
  await c.start(null,375,812,'#capabilities');
  await page.$eval('#capName',e=>{e.value='<img src=x onerror=window.__l=1>'+'Q'.repeat(250);});await page.$eval('#capPurpose',e=>{e.value='<svg onload=window.__l=1>';});await page.click('#capAdd');await c.wait(150);
  const hz=await page.evaluate(()=>({flag:window.__l||null,bad:document.querySelectorAll('#capList img,#capList svg,#capStatus img').length,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,txt:document.querySelector('#capList > li:nth-child(3) .capname').textContent.startsWith('<img'),msg:document.getElementById('capStatus').textContent}));
  rec('L6a a hostile, 250-character-unbroken name and purpose are shown as text, nothing runs, there is no horizontal scroll at 375px, and the status message shortens the name to 60 characters like every other message',hz.flag===null&&hz.bad===0&&hz.txt&&hz.sw<=hz.cw&&hz.msg.length<=60+22,JSON.stringify(hz));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','ladder-375'));
  await c.start(null,1280,800,'#capabilities');
  await page.focus('#capName');await page.keyboard.type('By keyboard');await page.keyboard.press('Tab');await page.keyboard.type('w');
  const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {id:document.activeElement.id,v:document.activeElement.value,ol:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0};});
  await page.focus('#capName');await page.keyboard.press('Enter');await c.wait(150);
  const kc=(await c.stored()).capabilities.slice(-1)[0];
  rec('L6b keyboard only: type a name, Tab to the rung and type "w" for Workflow (outlined), back in the name press Enter: a Workflow item is stored',ol.id==='capLevel'&&ol.v==='workflow'&&ol.ol&&kc.name==='By keyboard'&&kc.level==='workflow',JSON.stringify(ol));
  const prim=await page.$$eval('#view-capabilities button:not(.secondary)',b=>b.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
  rec('L6c the Capabilities view has exactly one filled button (Add item)',prim.length===1&&prim[0]==='Add item',JSON.stringify(prim));
});
