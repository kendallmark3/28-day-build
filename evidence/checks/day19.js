require('./h.js')('day19',async c=>{
  const {page,rec,fs,browser}=c;const BK='intent-workbench-v1-backup';
  const ban=()=>page.evaluate(()=>{const b=document.getElementById('problemBanner');const vis=e=>!e.hidden&&e.offsetParent!==null;return {shown:!b.hidden&&b.offsetParent!==null,role:b.getAttribute('role'),text:document.getElementById('problemText').textContent,dl:vis(document.getElementById('problemDownload')),empty:vis(document.getElementById('problemEmpty')),dis:vis(document.getElementById('problemDismiss'))};});
  const raw=k=>page.evaluate(x=>localStorage.getItem(x),k);
  // ---- pure
  await c.start(null);
  const d=await page.evaluate(()=>({none:describeProblem({}),none2:describeProblem(undefined),none3:describeProblem({skipped:0}),corrupt:describeProblem({corrupt:true}),skip1:describeProblem({skipped:1}),skip3:describeProblem({skipped:3}),blocked:describeProblem({blocked:true}),failed:describeProblem({failed:true}),p1:describeProblem({failed:true,blocked:true,corrupt:true,skipped:2}).kind,p2:describeProblem({blocked:true,corrupt:true,skipped:2}).kind,p3:describeProblem({corrupt:true,skipped:2}).kind,same:JSON.stringify(describeProblem({corrupt:true}))===JSON.stringify(describeProblem({corrupt:true}))}));
  rec('P1a describeProblem: nothing when there is no problem (empty, undefined, zero skipped)',d.none===null&&d.none2===null&&d.none3===null,'');
  rec('P1b kinds, actions, and wording: unreadable (download, empty, dismiss), invalid records singular and plural (download, dismiss), blocked (dismiss), unexpected error (download, dismiss)',d.corrupt.kind==='corrupt'&&d.corrupt.actions.join()==='download,empty,dismiss'&&/^1 saved record was invalid and left out\./.test(d.skip1.text)&&/^3 saved records were invalid and left out\./.test(d.skip3.text)&&d.skip3.actions.join()==='download,dismiss'&&d.blocked.actions.join()==='dismiss'&&d.failed.actions.join()==='download,dismiss',JSON.stringify([d.corrupt.kind,d.skip1.text.slice(0,40)]));
  rec('P1c priority: an unexpected error outranks blocked storage, which outranks unreadable data, which outranks invalid records; every message says what to do; the function is pure',d.p1==='failed'&&d.p2==='blocked'&&d.p3==='corrupt'&&d.same&&[d.corrupt,d.skip1,d.blocked,d.failed].every(x=>/Download|Allow|Reload|start with/i.test(x.text)),JSON.stringify([d.p1,d.p2,d.p3]));
  // ---- unreadable JSON (the Day 14 probe A10)
  const bad='{not json,,';
  await c.start(bad);
  const b1=await ban();const ov=await page.evaluate(()=>{location.hash='#overview';return null;});await c.wait(120);const cnt=await page.$$eval('#modelCounts strong',s=>s.map(x=>x.textContent));await c.view('intents');
  rec('F1a unreadable data: the app loads an empty project and shows an alert banner saying it could not be read, with download, start-empty, and dismiss',b1.shown&&b1.role==='alert'&&/could not be read/.test(b1.text)&&b1.dl&&b1.empty&&b1.dis&&JSON.stringify(cnt)==='["1","0","0","0","2"]',JSON.stringify({b1,cnt}).slice(0,200));
  rec('F1b a copy is kept under the backup key and the stored data itself is untouched',(await raw(BK))===bad&&(await raw(c.KEY))===bad,'');
  for(const v of ['[1,2,3]','5','"text"','true']){await c.start(v);const b=await ban();if(!(b.shown&&/could not be read/.test(b.text))){rec('F1c valid JSON that is not an object ('+v+') is treated as unreadable',false,JSON.stringify(b));}}
  await c.start('null');const bn=await ban();
  rec('F1c valid JSON that is not an object ([1,2,3], 5, "text", true) is treated as unreadable; the text null is just an empty store, with no banner',!bn.shown,JSON.stringify(bn));
  // ---- download
  const DL=require('os').tmpdir()+'/day19-dl-'+Date.now();fs.mkdirSync(DL,{recursive:true});
  const cdp=await browser.target().createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL,eventsEnabled:false});
  await c.start(bad);await page.click('#problemDownload');
  let f=null;for(let i=0;i<40&&!f;i++){await c.wait(150);f=fs.readdirSync(DL).find(x=>x.endsWith('.txt'));}
  rec('F2 "Download a copy of the data" gives a file whose text is exactly the original',f==='intent-workbench-data-copy.txt'&&fs.readFileSync(DL+'/'+f,'utf8')===bad,String(f));
  // ---- start empty
  await c.start(bad);await page.click('#problemEmpty');await c.wait(150);
  const b3=await ban();
  rec('F3 "Start with an empty project" clears the stored data, hides the banner, keeps the backup, and says so',(await raw(c.KEY))===null&&(await raw(BK))===bad&&!b3.shown&&/^Started with an empty project\. A copy of the old data is still kept\./.test(await c.text('#actionStatus')),'');
  // ---- save while the banner is showing (A10)
  await c.start(bad);await page.click('#submitBtn');await c.wait(150);
  const st=JSON.parse(await raw(c.KEY));
  rec('F4 saving while the banner shows replaces the data with valid data, hides the banner, and the backup still holds the original (probe A10 from Day 14)',st.version===2&&st.intents.length===1&&!(await ban()).shown&&(await raw(BK))===bad,'');
  // ---- invalid records
  const inv=JSON.stringify({intents:[{id:1,outcome:'Kept one'},{id:2,outcome:''}],evidence:[{id:'e',intentId:1,claim:'c',label:'bogus'}],reviews:'nope',capabilities:{}});
  await c.start(inv);const b4=await ban();
  const listed=await page.$$eval('#intentList li > span',l=>l.map(x=>x.textContent));
  const expected=await page.evaluate(t=>normalizeState(JSON.parse(t),0).skipped,inv);
  rec('F5a invalid records: the banner gives the count that normalizeState reports (4: an empty outcome, a wrong label, a reviews field that is not a list, a capabilities field that is not a list), offers download and dismiss but not start-empty, and the valid record still loads',expected===4&&b4.shown&&/^4 saved records were invalid and left out\./.test(b4.text)&&b4.dl&&b4.dis&&!b4.empty&&JSON.stringify(listed)==='["Kept one"]',JSON.stringify({expected,text:b4.text.slice(0,50),listed}));
  rec('F5b a copy of the original is kept and the stored data is still untouched until a save',(await raw(BK))===inv&&(await raw(c.KEY))===inv,'');
  await c.start(JSON.stringify({intents:[{id:1,outcome:'a'},{id:2,outcome:''}]}));
  rec('F5c one invalid record reads "1 saved record was invalid and left out."',/^1 saved record was invalid and left out\./.test((await ban()).text),'');
  // ---- missing fields
  await c.start({intents:[{id:5,outcome:'Bare'}]});
  const bare=await ban();await page.click('#intentList li:nth-child(1) > button');
  const fv=await page.evaluate(()=>['outcome','inputs','outputs','constraints','criteria','stop'].map(i=>document.getElementById(i).value));
  await page.$eval('#outcome',x=>{x.value='Bare, edited';});await page.click('#submitBtn');await c.wait(100);
  const after=(await c.stored()).intents[0];
  rec('F6 a record with only an id and an outcome loads without a banner, is listed, opens for editing with empty fields, and saves with its other fields as empty text',!bare.shown&&fv[0]==='Bare'&&fv.slice(1).every(x=>x==='')&&after.outcome==='Bare, edited'&&['inputs','outputs','constraints','criteria','stop'].every(k=>after[k]===''),JSON.stringify(fv));
  // ---- blocked storage at load
  const p2=await browser.newPage();await p2.evaluateOnNewDocument(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError');};});
  await p2.goto(c.URL,{waitUntil:'load'});
  const b5=await p2.evaluate(()=>({shown:!document.getElementById('problemBanner').hidden,role:document.getElementById('problemBanner').getAttribute('role'),t:document.getElementById('problemText').textContent,dl:!document.getElementById('problemDownload').hidden,em:!document.getElementById('problemEmpty').hidden}));
  rec('F7a storage blocked at load: an alert banner says nothing will be saved; only dismiss is offered',b5.shown&&b5.role==='alert'&&/blocking local storage, so nothing you do here will be saved/.test(b5.t)&&!b5.dl&&!b5.em,JSON.stringify(b5).slice(0,160));
  await p2.$eval('#submitBtn',b=>b.click());await new Promise(r=>setTimeout(r,150));
  rec('F7b with storage blocked, saving still tells the user it could not save (the banner and the message agree)',/Could not save/.test(await p2.$eval('#formError',e=>e.textContent)),'');
  await p2.close();
  // ---- unexpected error
  await c.start(null);
  await page.evaluate(()=>{setTimeout(()=>{throw new Error('boom from the test');},0);});await c.wait(300);
  const b6=await ban();
  const sawBoom=c.errors.some(e=>/boom from the test/.test(e));c.errors.length=0;
  rec('F8 an unexpected error shows an alert banner "Something went wrong" with download and dismiss, and the app keeps working',b6.shown&&b6.role==='alert'&&/Something went wrong/.test(b6.text)&&b6.dl&&b6.dis&&!b6.empty&&sawBoom,JSON.stringify(b6).slice(0,140));
  await page.click('#problemDismiss');
  rec('F8b after the error banner is dismissed the app still saves',await (async()=>{await page.click('#submitBtn');await c.wait(100);return (await c.stored()).intents.length===1;})(),'');
  // ---- reset recovery
  await c.start(bad);await page.click('#resetSample');await page.click('#resetConfirm');await c.wait(150);
  const rs=await c.stored();
  rec('F9 "Reset to sample data" from an unreadable store gives a valid store, hides the banner, and the backup keeps the original',rs.version===2&&rs.intents.length===3&&!(await ban()).shown&&(await raw(BK))===bad,'');
  // ---- banner everywhere, dismiss, reload
  await c.start(bad);const every=[];for(const v of ['intents','review','overview','references','about']){await c.view(v);every.push((await ban()).shown);}
  rec('F10a the banner is shown on every view',every.every(Boolean),JSON.stringify(every));
  await page.click('#problemDismiss');const gone=!(await ban()).shown;await page.reload({waitUntil:'load'});
  rec('F10b dismiss hides it for now, and it returns after a reload while the data is still unreadable',gone&&(await ban()).shown,'');
  // ---- keyboard, phone, healthy layout
  await c.start(bad);
  let order=[];for(let i=0;i<14;i++){await page.keyboard.press('Tab');const id=await page.evaluate(()=>document.activeElement.id);if(/^problem/.test(id)){order.push(id);const ol=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0;});if(!ol)order.push('NO-OUTLINE');}}
  await page.evaluate(()=>document.getElementById('problemDismiss').focus());await page.keyboard.press('Enter');
  rec('F11 keyboard: the three banner buttons are reachable in order with visible outlines, and Enter on Dismiss hides it',order.join()==='problemDownload,problemEmpty,problemDismiss'&&!(await ban()).shown,order.join());
  await c.start(bad,375,812);
  const ow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  rec('F12a the banner has no horizontal scroll at 375px',ow.sw<=ow.cw,JSON.stringify(ow));
  await c.shot((process.argv[2]||'/tmp/shotX.png').replace('X','problem-375'));
  await c.start(null,375,812);
  const healthy=await page.evaluate(()=>({hidden:document.getElementById('problemBanner').hidden,save:Math.round(document.getElementById('submitBtn').getBoundingClientRect().bottom+scrollY),vh:innerHeight}));
  rec('F12b with nothing wrong the banner is absent and the Save button is still inside the window at 375x812',healthy.hidden&&healthy.save<=healthy.vh,JSON.stringify(healthy));
});
