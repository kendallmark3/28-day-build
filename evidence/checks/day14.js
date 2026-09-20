// Day 14 adversarial probes. node probe14.js <out.json>
const h=require('./h.js');
const rows=[];
h('day14',async c=>{
  const {page,rec,fs,KEY}=c;
  const row=(id,attack,expected,ok,got)=>{rows.push({id,attack,expected,result:ok?'HOLDS':'BREAKS',got:String(got).slice(0,200)});rec(id+' '+attack,ok,got);};
  const seed=(n)=>({intents:Array.from({length:n},(_,i)=>({id:i+1,created:'x',outcome:'Seed '+(i+1),inputs:'',outputs:'',constraints:'c',criteria:'k',stop:'s'}))});
  // A1 hostile text in every field, list, edit, aria-label, dashboard, message
  await c.start(null);
  const evil=['<script>window.__x=1</script>','"><img src=x onerror=window.__x=1>','<svg onload=window.__x=1>','javascript:alert(1)','</textarea><script>window.__x=1</script>'];
  for(const e of evil){for(const f of ['outcome','inputs','outputs','constraints','criteria','stop'])await page.$eval('#'+f,(el,v)=>{el.value=v;},e);await page.click('#submitBtn');}
  await page.click('#intentList li:nth-child(1) > button');await page.click('#cancelEdit');
  let x=await page.evaluate(()=>({flag:window.__x||null,imgs:document.querySelectorAll('#intentList img,#actionStatus img,#view-intents svg').length,scripts:document.querySelectorAll('#intentList script,#actionStatus script').length}));
  row('A1','hostile HTML/JS in all six fields, saved, listed, edited','no script runs; nothing is parsed as markup',x.flag===null&&x.imgs===0&&x.scripts===0,JSON.stringify(x));
  // A2 same via Jira story + markdown download filename safety
  const nameSafe=await page.evaluate(()=>intentFileName('../../etc/passwd','<b>x</b>','a/b\\c:d'));
  const nameSafe2=await page.evaluate(()=>intentFileName('','','報告 レポート'));
  row('A2','path traversal / odd characters in the download file name','name has only a-z 0-9 - and ends .md',/^intent-[a-z0-9-]+\.md$/.test(nameSafe)&&/^intent-[a-z0-9-]+\.md$/.test(nameSafe2),nameSafe+' | '+nameSafe2);
  // A3 duplicate ids: two submits in the same tick
  await c.start(null);
  await page.evaluate(()=>{const f=document.getElementById('intentForm');for(const n of ['a','b','c']){document.getElementById('outcome').value='Same tick '+n;f.requestSubmit();}});
  const ids=(await c.stored()).intents.map(i=>i.id);
  row('A3','three Save submits in the same millisecond','3 intents with 3 distinct ids',ids.length===3&&new Set(ids).size===3,JSON.stringify(ids));
  // A4 storage full
  await c.start(null);
  const big='x'.repeat(1200000);let msgs=[];
  for(let i=0;i<6;i++){await page.$eval('#outcome',(e,v)=>{e.value=v;},big+i);await page.click('#submitBtn');const m=await c.text('#formError');const vis=await page.$eval('#formError',e=>!e.hidden);if(vis){msgs.push(m);break;}}
  const after=await c.stored();
  row('A4','fill localStorage with 1.2MB intents until it is full','a clear "storage is full" message; earlier data intact',msgs.length===1&&/full/i.test(msgs[0])&&after&&after.intents.length>=1,JSON.stringify({msg:msgs[0],saved:after&&after.intents.length}));
  // A5 dialog open across a view change
  await c.start(null);await page.click('#openJira');await page.evaluate(()=>{location.hash='#references';});await c.wait(200);
  const dlgOpen=await page.$eval('#jiraDialog',d=>d.open);
  row('A5','Back/forward (view change) while the Jira modal is open','the modal closes when the view changes',!dlgOpen,'modal open after view change: '+dlgOpen);
  // A6 huge story: time
  await c.start(null);
  const times=await page.evaluate(()=>{const t=(s)=>{const a=performance.now();analyzeStory(s);return Math.round(performance.now()-a);};
    return {asA:t('As a b, I want '.repeat(8000)),noPeriods:t('word '.repeat(60000)),manyLines:t(('- item '+'y'.repeat(30)+'\n').repeat(8000)),wide:t('As a '+'x'.repeat(200000))};});
  row('A6','story text of 100-300 KB that could trigger regex backtracking','each analysis finishes in under 2000 ms',Object.values(times).every(v=>v<2000),JSON.stringify(times));
  // A7 two tabs: stale view
  await c.start(seed(1));
  const p2=await c.browser.newPage();await p2.goto(c.URL,{waitUntil:'load'});
  await p2.$eval('#outcome',e=>{e.value='Saved in tab two';});await p2.click('#submitBtn');await c.wait(300);
  const list1=await page.$$eval('#intentList li > span',l=>l.map(x=>x.textContent));
  row('A7','save in a second tab while the first tab is open','the first tab shows the new intent without a reload',list1.includes('Saved in tab two'),JSON.stringify(list1));
  await p2.close();
  // A8 long unbroken token in Jira notes on a phone
  await c.start(null,375,812);await page.click('#openJira');await page.$eval('#jiraText',t=>{t.value='PROJ-1: '+'Q'.repeat(400)+'\nAcceptance Criteria\n- '+'W'.repeat(400)+'\n';});await page.click('#jiraBuild');
  const ov=await page.evaluate(()=>({dsw:document.getElementById('jiraDialog').scrollWidth,dcw:document.getElementById('jiraDialog').clientWidth,psw:document.documentElement.scrollWidth,pcw:document.documentElement.clientWidth}));
  row('A8','400-character unbroken words in a Jira story, on a phone','no horizontal scroll in the modal or the page',ov.dsw<=ov.dcw&&ov.psw<=ov.pcw,JSON.stringify(ov));
  // A9 many intents
  await c.start(seed(2000));
  const t0=Date.now();await page.$eval('#outcome',e=>{e.value='one more';});await page.click('#submitBtn');const dt=Date.now()-t0;
  const cnt=await page.$$eval('#intentList li',l=>l.length);
  row('A9','2000 saved intents, then save one more','under 2000 ms and all listed',dt<2000&&cnt===2001,dt+' ms, '+cnt+' listed');
  // A11 bad hashes
  const hs=[];for(const hsh of ['#intents?x=1','#REFERENCES','#__proto__','#%E0%A4%A','#overview#about','#constructor']){await c.go(hsh);const v=await page.evaluate(()=>['intents','overview','references','about'].filter(n=>!document.getElementById('view-'+n).hidden));hs.push(v.length===1);}
  row('A11','odd URL fragments (#__proto__, #constructor, bad encoding, double hash)','exactly one view is shown each time, no error',hs.every(Boolean),JSON.stringify(hs));
  // A12 Save clicked while an edit target vanished (reset in other tab)
  await c.start(seed(3));await page.click('#intentList li:nth-child(2) > button');
  const p3=await c.browser.newPage();await p3.goto(c.URL,{waitUntil:'load'});await p3.evaluate(k=>{localStorage.setItem(k,JSON.stringify({intents:[]}));},KEY);await p3.close();
  await page.$eval('#outcome',e=>{e.value='edit of a vanished intent';});await page.click('#submitBtn');
  const after12=await c.stored();
  row('A12','edit an intent that another tab has since removed, then Update','it is not silently lost or duplicated: the user is told, or it is saved as a new intent',after12.intents.some(i=>i.outcome==='edit of a vanished intent')||(await page.$eval('#actionStatus',e=>/no longer/i.test(e.textContent))),JSON.stringify({saved:after12.intents.map(i=>i.outcome),status:await c.text('#actionStatus')}));
});
