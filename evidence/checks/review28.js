// Day 28 release review: fresh checks written from intent/project-intent.md's six success criteria. Reads and drives the app; changes no file.
require('./h.js')('review28',async c=>{
  const {page,rec,fs,REPO,browser}=c;const cp=require('child_process');
  const stored=()=>c.stored();
  // 1. run locally in under 3 minutes
  const readme=fs.readFileSync(REPO+'/README.md','utf8');
  const cmds=(readme.match(/^\.\/run-app\.sh.*$/gm)||[]);
  const PORT=8399;const t0=Date.now();const srv=cp.spawn('bash',[REPO+'/run-app.sh',String(PORT)],{cwd:REPO,stdio:'ignore'});
  let up=0;for(let i=0;i<50&&!up;i++){await c.wait(80);try{const r=await fetch('http://127.0.0.1:'+PORT+'/');if(r.ok)up=Date.now()-t0;}catch(e){}}
  const pg=await browser.newPage();const t1=Date.now();await pg.goto('http://127.0.0.1:'+PORT+'/',{waitUntil:'load'});await pg.waitForSelector('#submitBtn');const ready=Date.now()-t1;await pg.close();srv.kill();try{cp.execSync('pkill -f "http.server '+PORT+'"');}catch(e){}
  rec('P1 criterion 1: one documented command ('+cmds.length+' in the README) starts the app; the server answered in '+up+' ms and the page was usable '+ready+' ms later; the README names Python 3 as the only requirement',cmds.length>=1&&up>0&&up+ready<3000&&/Python 3/.test(readme),up+' + '+ready+' ms');
  // 2. create and edit an intent with six parts
  await c.start(null);
  const vals={outcome:'Release review intent: publish the weekly status page so that managers can see progress',inputs:'Ticket export; team roster',outputs:'status.html',constraints:'No names of customers; one page',criteria:'The page shows 3 sections\nThe page loads in under 2 seconds',stop:'Stop when both criteria pass'};
  for(const [k,v] of Object.entries(vals))await page.$eval('#'+k,(e,x)=>{e.value=x;},v);
  await page.click('#submitBtn');await c.wait(120);
  const s1=(await stored()).intents.find(i=>i.outcome===vals.outcome);
  await page.click('#intentList li:last-child > button');await page.$eval('#outcome',e=>{e.value='Release review intent, edited';});await page.click('#submitBtn');await c.wait(120);
  const s2=(await stored()).intents.find(i=>i.outcome==='Release review intent, edited');
  rec('P2 criterion 2: a new intent typed into all six parts is saved with every part intact, and an edit replaces it in place ('+(await stored()).intents.length+' intents, none duplicated)',!!s1&&Object.keys(vals).every(k=>s1[k]===vals[k].trim())&&!!s2&&s2.criteria===vals.criteria&&(await stored()).intents.filter(i=>/Release review intent/.test(i.outcome)).length===1,'');
  // 3. attach evidence, distinguish observed/inferred/assumed
  await c.view('review');
  for(const [claim,label] of [['The page renders','observed'],['It will load fast on mobile','inferred'],['Managers read it weekly','assumed']]){await page.$eval('#claimText',(e,x)=>{e.value=x;},claim);await page.$eval('#claimLabel',(e,x)=>{e.value=x;},label);await page.click('#claimSave');await c.wait(100);}
  const badges=await page.$$eval('#evidenceList .badge',b=>b.map(x=>x.textContent));
  rec('P3 criterion 3: three claims attached to the intent show three different labels ('+badges.join(', ')+') and the summary counts them ("'+await c.text('#epistemic')+'")',badges.join()==='Observed,Inferred,Assumed'&&/^3 claims: 1 observed, 1 inferred, 1 assumed\. 1 assumed claim still needs confirming\.$/.test(await c.text('#epistemic')),'');
  // 4. readiness check before trusting
  await c.start({intents:[{id:1,created:'x',outcome:'Half written',inputs:'',outputs:'',constraints:'',criteria:'It should be fast and easy',stop:''}]},1280,800,'#review');
  const before=await c.text('#readinessSummary');const next=await c.text('#readinessNext');
  await page.click('#editFromReview');await c.wait(250);
  for(const [k,v] of Object.entries({inputs:'a',outputs:'b',constraints:'c',criteria:'The page shows a button',stop:'Stop when it shows a button'}))await page.$eval('#'+k,(e,x)=>{e.value=x;},v);
  await page.click('#submitBtn');await c.wait(100);await c.view('review');
  const after=await c.text('#readinessSummary');
  rec('P4 criterion 4: a half-written intent reads "'+before+'" with "'+next.slice(0,60)+'..."; after fixing it the same check reads "'+after+'"',/^Readiness: \d+%\. Not ready yet\.$/.test(before)&&/Fix \d required items/.test(next)&&after==='Readiness: 100%. Ready.','');
  // 5. promotion after repeated successful use
  await c.start(null,1280,800,'#capabilities');
  await page.$eval('#capName',e=>{e.value='Release review capability';});await page.click('#capAdd');await c.wait(120);
  const card='#capList > li:nth-child(3)';const promote=card+' button[aria-label^="Promote"]';const use=card+' button[aria-label^="Record a successful use"]';
  await page.click(promote);await c.wait(80);const m0=await c.text('#capStatus');
  await page.click(use);await c.wait(1700);await page.click(promote);await c.wait(80);const m1=await c.text('#capStatus');
  await page.click(use);await c.wait(120);await page.click(promote);await c.wait(120);const promoted=(await stored()).capabilities[2].promoted;
  rec('P5 criterion 5: promotion is refused with 0 uses ("'+m0.slice(0,62)+'...") and with 1 ("'+m1.slice(0,62)+'..."), and succeeds only after the second successful use',/2 more uses are needed/.test(m0)&&/1 more use is needed/.test(m1)&&promoted===true,'');
  // 6. first-time user without help: only a proxy
  await c.start(null,1280,800,'#start');
  await page.click('#steps li[data-step="intent"] a');await c.wait(100);await page.click('#submitBtn');await c.wait(100);
  const proxy=await page.evaluate(()=>({saved:document.querySelectorAll('#intentList li').length,msg:document.getElementById('actionStatus').textContent}));
  rec('P6 criterion 6 (proxy only): from an empty project, following the Start view\'s first link and pressing Save on the example creates an intent with a confirming message ("'+proxy.msg.slice(0,40)+'..."). This does not show that a person can do it unaided',proxy.saved===1&&/^Saved:/.test(proxy.msg),'');
  rec('P7 no request left the app origin during the review',c.reqs.filter(u=>!u.startsWith(c.URL)&&!u.startsWith('http://127.0.0.1:8399')&&!u.startsWith('data:')&&!u.startsWith('blob:')).length===0,'');
});
