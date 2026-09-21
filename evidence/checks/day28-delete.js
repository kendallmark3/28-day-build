const h=require('./h.js');
// Post-release: delete one intent, and start with an empty project (intent/delete-and-start-over.md)
h('delete+clear',async c=>{
  const {page,rec}=c;
  await c.start(null,1280,800,'#intents');
  await page.evaluate(()=>document.getElementById('loadSample').click());
  await c.wait(200);
  await page.waitForSelector('#resetDialog[open]');
  await page.click('#resetConfirm');await c.wait(200);
  let s=await c.stored();
  const n0=s.intents.length,ev0=s.evidence.length,rv0=s.reviews.length;
  rec('sample has 3 intents, evidence, review',n0===3&&ev0>0&&rv0>0,n0+'/'+ev0+'/'+rv0);
  rec('each row has Delete button',(await page.$$('#intentList .delete')).length===3);
  // cancel leaves data
  await page.click('#intentList li:first-child .delete');
  rec('delete dialog names the intent and the records that go with it',/3 evidence records and 1 review/.test(await c.text('#deleteMsg')));
  rec('cancel focused by default',await page.evaluate(()=>document.activeElement.id==='deleteCancel'));
  await page.click('#deleteCancel');await c.wait(100);
  s=await c.stored();rec('cancel changes nothing',s.intents.length===3&&s.evidence.length===ev0);
  // delete first (has evidence)
  await page.click('#intentList li:first-child .delete');await page.click('#deleteConfirm');await c.wait(200);
  s=await c.stored();
  rec('intent deleted',s.intents.length===2);
  rec('its evidence and reviews removed, none orphaned',s.evidence.length===0&&s.reviews.length===0&&s.evidence.every(e=>s.intents.some(i=>i.id===e.intentId)),s.evidence.length+'/'+s.reviews.length);
  rec('status announced',/^Deleted:/.test(await c.text('#resetStatus')));
  // review view works with remaining
  await c.view('review');
  rec('review view shows remaining intents',(await page.$$('#reviewIntent option')).length===2);
  await c.view('intents');
  // delete the one being edited
  await page.click('#intentList li:first-child .edit');
  await page.click('#intentList li:first-child .delete');await page.click('#deleteConfirm');await c.wait(200);
  rec('deleting the intent being edited resets the form mode',await c.text('#formTitle')==='New intent');
  // clear all
  await page.click('#clearAll');
  await page.click('#clearCancel');await c.wait(100);
  s=await c.stored();rec('clear cancel keeps data',s.intents.length===1);
  await page.click('#clearAll');await page.click('#clearConfirm');await c.wait(200);
  s=await c.stored();
  rec('clear leaves empty project',s.intents.length===0&&s.evidence.length===0&&s.reviews.length===0&&Object.keys(s.progress).length===0&&s.capabilities.every(x=>x.uses.length===0));
  rec('empty state shown',await page.$eval('#emptyState',e=>!e.hidden));
  // new intent all the way through
  await page.$eval('#intentForm [name=outcome]',e=>{e.value='Real work intent';});
  await page.click('#submitBtn');await c.wait(200);
  await c.view('review');
  rec('new intent reviewable',(await page.$$('#reviewIntent option')).length===1);
  await c.view('intents');
  await page.click('#clearAll');
  await page.click('#clearCancel');
  // mobile
  await page.setViewport({width:375,height:800});await c.wait(100);
  rec('no horizontal scroll at 375',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),await page.evaluate(()=>document.documentElement.scrollWidth));
});
