// Day 28 release checks: links, demo rehearsal, release documents, and the release review.
require('./h.js')('day28',async c=>{
  const {page,rec,fs,REPO}=c;const doc=f=>fs.readFileSync(REPO+'/'+f,'utf8');
  const VIEWS=['start','intents','review','capabilities','overview','references','about'];
  const shown=()=>page.evaluate(v=>v.filter(n=>!document.getElementById('view-'+n).hidden),VIEWS);
  // ---- R1: every link
  await c.start(null);await page.click('#resetSample');await page.click('#resetConfirm');await c.wait(150);
  const hrefs=new Set(),ext=[];
  for(const v of VIEWS){await c.view(v);const links=await page.$$eval('#view-'+v+' a,nav a',as=>as.map(a=>({h:a.getAttribute('href'),t:a.target,r:a.rel,x:a.textContent.trim()})));links.forEach(l=>{if(l.h&&l.h.startsWith('#'))hrefs.add(l.h);else if(l.h)ext.push(l);});}
  const bad=[];
  for(const h of hrefs){await c.view('about');await c.go(h);await c.wait(120);const s=await shown();const want=h==='#progress'?'overview':h.slice(1);if(s.length!==1||s[0]!==want)bad.push(h+' -> '+s.join());}
  const badExt=ext.filter(l=>!(l.t==='_blank'&&/noopener/.test(l.r)&&/noreferrer/.test(l.r)&&/^https:\/\//.test(l.h)));
  rec('R1 every internal link ('+[...hrefs].sort().join(' ')+') opens exactly the view it names, and all '+ext.length+' external links are https, open in a new tab, and carry noopener noreferrer',bad.length===0&&badExt.length===0&&hrefs.size>=8,JSON.stringify({bad,badExt:badExt.map(l=>l.h)}));
  // ---- R2/R3: the demo script, rehearsed
  const script=doc('docs/DEMO-SCRIPT.md');
  const steps=[...script.matchAll(/^(\d+)\. \*\*(.+?) \((\d+) sec\):\*\* (.+)$/gm)].map(m=>({n:+m[1],title:m[2],secs:+m[3],words:m[4].trim().split(/\s+/).length}));
  const total=steps.reduce((a,s)=>a+s.secs,0),words=steps.reduce((a,s)=>a+s.words,0);
  const tooFast=steps.filter(s=>s.words/s.secs>2.7).map(s=>s.title+' '+(s.words/s.secs).toFixed(2));
  rec('R3 the demo script has seven steps totalling 180 seconds, each spoken at no more than 2.7 words per second ('+words+' spoken words in all)',steps.length===7&&total===180&&tooFast.length===0,JSON.stringify({steps:steps.length,total,tooFast,words}));
  const log=[];const stepMs=[];let mark=Date.now();const tick=(n)=>{stepMs.push(Date.now()-mark);mark=Date.now();};
  const facts=[];const fact=(ok,what)=>{facts.push({ok,what});};
  await c.start(null,1280,800,'#start');
  await page.click('#loadSample');await page.click('#resetConfirm');await c.wait(200);
  // step 1
  fact(/Prompt to explore\. Write intent to repeat\./.test(await page.evaluate(()=>document.getElementById('view-start').innerText)),'1: the Start view shows the rule');tick();
  // step 2
  await c.view('intents');
  const six=await page.$$eval('#intentForm label[for]',ls=>ls.length);
  fact(six===6,'2: six labelled parts');
  fact((await page.$eval('#outcome',e=>e.value)).startsWith('Example:'),'2: the form starts with an example');
  await page.click('#submitBtn');await c.wait(150);fact((await page.$$eval('#intentList li',l=>l.length))===4,'2: the first save works (3 sample + 1)');
  await page.click('#openJira');await page.click('#jiraBuild');await c.wait(120);
  const notes=await page.$$eval('#jiraNotes li',ls=>ls.map(l=>({t:l.querySelector('.tag').textContent,src:!!l.querySelector('.src')})));
  fact(notes.some(n=>n.t==='Ambiguity')&&notes.some(n=>n.t==='Uncheckable'),'2: notes say what is vague (Ambiguity, Uncheckable)');
  fact((await page.$$eval('#jiraFields textarea',t=>t.length))===6,'2: the story fills six parts');
  fact(notes.some(n=>n.src),'3: the notes cite the rule they come from (a Source line)');
  await page.keyboard.press('Escape');tick();
  // step 3
  await c.view('references');fact((await page.$$eval('#contextList li',l=>l.length))===7,'3: References lists 7 context files');tick();
  // step 4
  await c.view('review');const ids=(await c.stored()).intents.map(i=>i.id);
  await page.select('#reviewIntent',String(ids[0]));await c.wait(120);
  const badges=await page.$$eval('#evidenceList .badge',b=>b.map(x=>x.textContent));
  fact(badges.includes('Observed')&&badges.includes('Inferred')&&badges.includes('Assumed')&&/1 assumed claim still needs confirming/.test(await c.text('#epistemic')),'4: three labels shown and one assumption still needs confirming');
  fact((await c.text('#readinessSummary'))==='Readiness: 100%. Ready.','4: the first intent scores one hundred percent');
  await page.select('#reviewIntent',String(ids[2]));await c.wait(120);
  fact((await c.text('#readinessSummary'))==='Readiness: 38%. Not ready yet.'&&/Fix 4 required items/.test(await c.text('#readinessNext')),'4: the draft scores thirty-eight and lists what to fix');tick();
  // step 5
  await page.select('#consequence','low');await c.wait(100);const low=await page.$$eval('#guardrailList li',l=>l.length);
  await page.select('#consequence','high');await c.wait(100);const high=await page.$$eval('#guardrailList li',l=>l.length);
  fact(low===2&&high===6&&/named person approves/.test(await c.text('#guardrailList')),'5: low asks for two checks, high for six including a named approver');
  await c.view('intents');fact(await page.$eval('#submitBtn',b=>!b.disabled),'5: nothing is blocked (Save intent still enabled)');tick();
  // step 6
  await c.view('capabilities');const promote='#capList > li:nth-child(2) button[aria-label^="Promote"]';
  await page.click(promote);await c.wait(100);
  fact(/1 more use is needed/.test(await c.text('#capStatus')),'6: promoting too early is refused and says how many uses are missing');
  await c.wait(1700);await page.click('#capList > li:nth-child(2) button[aria-label^="Record a successful use"]');await c.wait(120);await page.click(promote);await c.wait(150);
  fact((await c.stored()).capabilities[1].promoted===true,'6: after the second success it promotes');tick();
  // step 7
  await c.view('overview');
  fact((await page.$$eval('#metrics > li',l=>l.length))===4&&await page.$eval('#flow',f=>!!f),'7: four outcome metrics and the flow are shown');
  fact(/Intent, Result, Evidence, Refined Intent, Better Result/.test(await page.evaluate(()=>document.getElementById('view-start').textContent)),'7: the loop is written on the Start view');tick();
  const failed=facts.filter(f=>!f.ok).map(f=>f.what);
  rec('R2 the demo rehearsed in the app: all '+facts.length+' claims the seven steps make are true on screen (machine time per step in ms: '+stepMs.join(', ')+')',failed.length===0&&facts.length>=17,JSON.stringify(failed));
  // ---- R4: the checklist
  const lines=doc('docs/RELEASE-CHECKLIST.md').split('\n').filter(l=>/^- \[[ x]\]/.test(l));
  const bads=[];let done=0,notDone=0;
  for(const l of lines){if(l.startsWith('- [x]')){done++;const paths=[...l.matchAll(/`([^`]+)`/g)].map(m=>m[1]).filter(p=>/[\/.]/.test(p));if(!paths.length||!paths.every(p=>fs.existsSync(REPO+'/'+p.split(' ')[0])))bads.push('done item without existing evidence: '+l.slice(6,50));}else{notDone++;if(l.length<80||!/not done|partly|not run/i.test(l))bads.push('not-done item without a reason: '+l.slice(6,50));}}
  rec('R4 the release checklist has 15 items ('+done+' done with evidence paths that all exist, '+notDone+' not done with the reason stated)',lines.length===15&&bads.length===0&&notDone===1,JSON.stringify(bads));
  // ---- R5: the next intent passes the app's own check
  const ni=doc('docs/NEXT-INTENT.md');const part=h=>{const m=ni.match(new RegExp('\\n## '+h+'\\n([\\s\\S]*?)(?=\\n## |\\n# |$)'));return m?m[1].trim():'';};
  const list=t=>t.split('\n').map(l=>l.replace(/^- /,'').trim()).filter(Boolean).join('\n');
  const next={outcome:part('Intent'),inputs:list(part('Inputs')),outputs:list(part('Outputs')),constraints:list(part('Constraints')),criteria:list(part('Success criteria')),stop:list(part('Stop when'))};
  const chk=await page.evaluate(i=>{const r=checkIntent(i);return {score:r.score,ready:r.ready,fails:r.checks.filter(x=>!x.pass).map(x=>x.id+': '+x.message.slice(0,90))};},next);
  rec('R5 docs/NEXT-INTENT.md has one next intent with the six parts, and the app\'s own readiness check scores it '+chk.score+'% and Ready ('+Object.values(next).filter(Boolean).length+' of 6 parts present)',Object.values(next).every(Boolean)&&chk.ready&&chk.score===100&&/^#\s+Intent:/m.test(ni)&&(ni.match(/^# Intent:/gm)||[]).length===1,JSON.stringify(chk.fails));
  // ---- R6: notes and reflection
  const notesT=doc('docs/RELEASE-NOTES.md'),refl=doc('docs/REFLECTION.md');
  const need=['What it is','What is included','How to run it','What was verified','Known limitations','Not included'].filter(h=>!notesT.includes('## '+h));
  rec('R6 release notes have all six sections, name the run script, and state the limits (no person has used it, no independent review, Chrome only); the reflection says Claude wrote it and names what became reusable',need.length===0&&/run-app\.sh/.test(notesT)&&/No person has used it/.test(notesT)&&/No independent review/.test(notesT)&&/Chrome only/.test(notesT)&&!/\{\{/.test(notesT)&&/Who wrote this:\*\* Claude/.test(refl)&&/## What became reusable/.test(refl)&&/## Your notes/.test(refl),JSON.stringify(need));
  // ---- R7/R8: the release review
  const RV='reviews/day-28-release-review.md';
  const has=fs.existsSync(REPO+RV.replace(/^/,'/'));
  const rv=has?doc(RV):'';
  const pc=(fs.readFileSync(REPO+'/intent/project-intent.md','utf8').match(/## Success criteria\n([\s\S]*?)\n## Stop when/)[1].split('\n').filter(l=>l.startsWith('- '))).length;
  const stat=[...rv.matchAll(/^\| (\d) \|.*\|\s*\*\*(Met|Unmet|Untested)[^|]*\|/gm)].map(m=>m[1]+':'+m[2]);
  rec('R7 the release review gives each of the '+pc+' project success criteria a status (Met, Unmet, or Untested) with evidence, and has sections for blockers, non-blocking improvements, and what was not checked',has&&pc===6&&stat.length===6&&/## Blockers/.test(rv)&&/## Non-blocking improvements/.test(rv)&&/## Not checked/.test(rv)&&/Independence/.test(rv),stat.join(' '));
  const crypto=require('crypto');const files=[];const walk=d=>{for(const f of fs.readdirSync(REPO+'/'+d)){const p=d+'/'+f;if(fs.statSync(REPO+'/'+p).isDirectory())walk(p);else files.push(p);}};
  ['app','context','skills'].forEach(walk);files.push('intent/project-intent.md');files.sort();
  const h=crypto.createHash('sha256');files.forEach(f=>{h.update(f+'\0');h.update(fs.readFileSync(REPO+'/'+f));});const fp=h.digest('hex').slice(0,16);
  const m=rv.match(/Fingerprint of app\/, context\/, skills\/, and intent\/project-intent\.md: before `([0-9a-f]{16})`, after `([0-9a-f]{16})`/);
  rec('R8 the review changed nothing under review: the recorded fingerprints before and after are equal, and equal to the files as they are now ('+fp+')',!!m&&m[1]===m[2]&&m[2]===fp,m?m.slice(1).join(' / '):'no fingerprint recorded');
});
