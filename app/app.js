const KEY='intent-workbench-v1';
const form=document.getElementById('intentForm');
const errorEl=document.getElementById('formError');
const listEl=document.getElementById('intentList');
const emptyEl=document.getElementById('emptyState');
const titleEl=document.getElementById('formTitle');
const submitBtn=document.getElementById('submitBtn');
const cancelBtn=document.getElementById('cancelEdit');
const actionStatus=document.getElementById('actionStatus');
let editingId=null;

function shorten(t){return t.length>60?t.slice(0,57)+'…':t;}
function announce(text,revealSave){
  actionStatus.textContent=text;
  actionStatus.scrollIntoView({block:'nearest'});
  if(revealSave)submitBtn.scrollIntoView({block:'nearest'});
}
function clearAnnouncement(){actionStatus.textContent='';}

const BACKUP_KEY='intent-workbench-v1-backup';
const storageBlocked=(()=>{
  try{localStorage.setItem('intent-workbench-probe','1');localStorage.removeItem('intent-workbench-probe');return false;}
  catch(e){return !(e&&/quota/i.test(e.name));}
})();
let appFailed=false;
let bannerDismissed=false;
// Reads the stored data without changing it. If it is unreadable or has invalid records, a copy of the original text is kept first.
function readState(){
  let text=null,raw=null,corrupt=false;
  try{text=localStorage.getItem(KEY);}catch(e){text=null;}
  if(text!==null){
    try{raw=JSON.parse(text);}catch(e){corrupt=true;}
    if(!corrupt&&raw!==null&&(typeof raw!=='object'||Array.isArray(raw)))corrupt=true;
  }
  const result=normalizeState(corrupt?null:raw,Date.now());
  if(text!==null&&(corrupt||result.skipped>0)){
    try{if(localStorage.getItem(BACKUP_KEY)!==text)localStorage.setItem(BACKUP_KEY,text);}catch(e){}
  }
  return {state:result.state,skipped:result.skipped,corrupt,text};
}
function loadState(){return readState().state;}
let lastSaveError='';
function saveState(state){
  try{localStorage.setItem(KEY,JSON.stringify(state));lastSaveError='';return true;}
  catch(e){lastSaveError=(e&&(/quota/i.test(e.name)||e.code===22||e.code===1014))?'full':'blocked';return false;}
}
function storageProblem(verb){
  return lastSaveError==='full'?'Could not '+verb+': this browser\'s storage is full. Remove data or reset to sample data.':'Could not '+verb+': this browser is blocking local storage.';
}
function load(){return loadState().intents;}
function save(intents){return saveState(Object.assign({},loadState(),{intents}));}
function setMode(id){
  editingId=id;
  const editing=id!==null;
  titleEl.textContent=editing?'Edit intent':'New intent';
  submitBtn.textContent=editing?'Update intent':'Save intent';
  cancelBtn.hidden=!editing;
}
function renderDashboard(intents){
  const d=dashboardState(intents);
  document.getElementById('statSaved').textContent=d.saved;
  document.getElementById('statGaps').textContent=d.gaps;
  document.getElementById('nextStep').textContent=d.next;
}
function renderProblem(info){
  const p=describeProblem({corrupt:info.corrupt,skipped:info.skipped,blocked:storageBlocked,failed:appFailed});
  const box=document.getElementById('problemBanner');
  box.hidden=!p||bannerDismissed;
  if(!p)return;
  document.getElementById('problemText').textContent=p.text;
  document.getElementById('problemDownload').hidden=!p.actions.includes('download');
  document.getElementById('problemEmpty').hidden=!p.actions.includes('empty');
}
function dataCopyText(){
  try{return localStorage.getItem(BACKUP_KEY)||localStorage.getItem(KEY)||'';}catch(e){return '';}
}
function renderOverview(state){
  const rows=[['Projects',state.projects.length],['Intents',state.intents.length],['Evidence records',state.evidence.length],['Reviews',state.reviews.length],['Capabilities',state.capabilities.length]];
  const el=document.getElementById('modelCounts');
  el.textContent='';
  rows.forEach(([name,n])=>{const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=n;const span=document.createElement('span');span.textContent=name;li.append(strong,span);el.appendChild(li);});
}
function render(){
  const info=readState();
  renderProblem(info);
  const state=info.state;
  const intents=state.intents;
  renderDashboard(intents);
  renderOverview(state);
  renderReview(state);
  listEl.textContent='';
  emptyEl.hidden=intents.length>0;
  intents.forEach(item=>{
    const li=document.createElement('li');
    const text=document.createElement('span');
    text.textContent=item.outcome;
    const edit=document.createElement('button');
    edit.type='button';
    edit.className='secondary edit';
    edit.textContent='Edit';
    edit.setAttribute('aria-label','Edit intent: '+item.outcome);
    edit.addEventListener('click',()=>startEdit(item.id));
    li.append(text,edit);
    listEl.appendChild(li);
  });
}
function clearError(){
  errorEl.hidden=true;
  form.elements.outcome.removeAttribute('aria-invalid');
}
function startEdit(id){
  const item=load().find(i=>i.id===id);
  if(!item)return;
  FIELDS.forEach(f=>{form.elements[f].value=item[f]||'';});
  fitFields();
  clearError();
  clearAnnouncement();
  resetStatus.textContent='';
  setMode(id);
  form.elements.outcome.focus();
}
form.addEventListener('input',clearAnnouncement);
cancelBtn.addEventListener('click',()=>{
  form.reset();
  unfitFields();
  clearError();
  setMode(null);
  form.elements.outcome.focus();
  announce('Edit cancelled. Nothing was changed.');
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const values={};
  FIELDS.forEach(f=>{values[f]=form.elements[f].value.trim();});
  if(!values.outcome){
    errorEl.textContent='Outcome is required. Describe what you want to accomplish.';
    errorEl.hidden=false;
    form.elements.outcome.setAttribute('aria-invalid','true');
    form.elements.outcome.focus();
    return;
  }
  clearError();
  const intents=load();
  let vanished=false;
  const at=editingId!==null?intents.findIndex(x=>x.id===editingId):-1;
  if(at>=0)intents[at]=Object.assign({},intents[at],values,{updated:new Date().toISOString()});
  else{
    vanished=editingId!==null;
    const now=Date.now();
    intents.push(makeIntent(values,{id:nextIntentId(intents,now),now}));
  }
  if(!save(intents)){
    errorEl.textContent=storageProblem('save');
    errorEl.hidden=false;
    return;
  }
  const wasEditing=editingId!==null;
  form.reset();
  unfitFields();
  resetStatus.textContent='';
  setMode(null);
  render();
  form.elements.outcome.focus();
  announce(vanished?'The intent you were editing no longer exists, so this was saved as a new intent: '+shorten(values.outcome)+' ('+intents.length+' saved).':wasEditing?'Updated: '+shorten(values.outcome)+'.':'Saved: '+shorten(values.outcome)+' ('+intents.length+' saved).');
});

const VIEWS=['intents','review','overview','references','about'];
function currentView(){
  const name=location.hash.replace('#','');
  return VIEWS.includes(name)?name:'intents';
}
function showView(name,moveFocus){
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  VIEWS.forEach(v=>{
    document.getElementById('view-'+v).hidden=v!==name;
    const link=document.querySelector('nav a[href="#'+v+'"]');
    if(v===name)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if(moveFocus){
    const heading=document.querySelector('#view-'+name+' h2');
    heading.tabIndex=-1;
    heading.focus();
  }
}
window.addEventListener('hashchange',()=>showView(currentView(),true));
showView(currentView(),false);

function fitFields(){
  FIELDS.slice(1).forEach(f=>{const el=form.elements[f];el.style.height='auto';el.style.height=(el.scrollHeight+2)+'px';});
}
function unfitFields(){
  FIELDS.forEach(f=>{form.elements[f].style.height='';});
}


/* ---- Jira modal wiring ---- */
const jiraDialog=document.getElementById('jiraDialog');
const jiraText=document.getElementById('jiraText');
const jiraErr=document.getElementById('jiraError');
const jiraFieldsEl=document.getElementById('jiraFields');
let jiraDraft=null;
let jiraResult=null;

function jiraStep(n){
  document.getElementById('jiraStatus').textContent='';
  document.getElementById('jiraStep1').hidden=n!==1;
  document.getElementById('jiraStep2').hidden=n!==2;
}
function syncExampleTag(){
  document.getElementById('jiraExampleTag').hidden=jiraText.value!==STORY_SAMPLE;
}
function focusStory(){
  jiraText.focus();
  jiraText.setSelectionRange(0,0);
  jiraText.scrollTop=0;
}
function openJira(){
  jiraText.value=jiraDraft===null?STORY_SAMPLE:jiraDraft;
  jiraErr.hidden=true;
  syncExampleTag();
  jiraStep(1);
  jiraDialog.showModal();
  focusStory();
}
function readJiraFields(){
  const v={};
  FIELDS.forEach(f=>{v[f]=document.getElementById('jf-'+f).value.trim();});
  return v;
}
function renderJiraResult(res){
  jiraResult=res;
  jiraFieldsEl.textContent='';
  FIELDS.forEach(f=>{
    const box=document.createElement('div');box.className='rf';
    const head=document.createElement('div');head.className='rfhead';
    const label=document.createElement('label');label.htmlFor='jf-'+f;label.textContent=FIELD_LABELS[f];
    const badge=document.createElement('span');badge.className='badge '+res.fields[f].source;badge.id='jb-'+f;badge.textContent=SOURCE_LABELS[res.fields[f].source];
    head.append(label,badge);
    const area=document.createElement('textarea');area.id='jf-'+f;area.rows=2;area.value=res.fields[f].text;
    box.append(head,area);jiraFieldsEl.appendChild(box);
  });
  const nofit=document.getElementById('jiraNofit');nofit.textContent='';
  if(!res.unmatched.length){const li=document.createElement('li');li.textContent='Every line of your story was placed.';nofit.appendChild(li);}
  res.unmatched.forEach(t=>{const li=document.createElement('li');li.textContent=t;nofit.appendChild(li);});
  const notes=document.getElementById('jiraNotes');notes.textContent='';
  res.notes.forEach(n=>{const li=document.createElement('li');const tag=document.createElement('span');tag.className='tag';tag.textContent=n.tag;li.append(tag,document.createTextNode(n.text));if(n.source){const src=document.createElement('span');src.className='src';src.textContent='Source: '+n.source;li.append(src);}notes.appendChild(li);});
  jiraStep(2);
  FIELDS.forEach(f=>{const a=document.getElementById('jf-'+f);a.style.height='auto';a.style.height=(a.scrollHeight+2)+'px';});
  document.getElementById('jiraResultTitle').focus();
}
document.getElementById('openJira').addEventListener('click',openJira);
jiraText.addEventListener('input',()=>{jiraDraft=jiraText.value;syncExampleTag();});
document.getElementById('jiraClose1').addEventListener('click',()=>jiraDialog.close());
document.getElementById('jiraClose2').addEventListener('click',()=>jiraDialog.close());
document.getElementById('jiraBack').addEventListener('click',()=>{jiraStep(1);focusStory();});
document.getElementById('jiraBuild').addEventListener('click',()=>{
  if(!jiraText.value.trim()){
    jiraErr.textContent='Paste a Jira story first, or close this window.';
    jiraErr.hidden=false;
    jiraText.focus();
    return;
  }
  jiraErr.hidden=true;
  renderJiraResult(analyzeStory(jiraText.value));
});
document.getElementById('jiraDownload').addEventListener('click',()=>{
  const v=readJiraFields();
  const md=intentMarkdown(v,jiraResult.key,jiraResult.title);
  const url=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));
  const a=document.createElement('a');
  a.href=url;a.download=intentFileName(jiraResult.key,jiraResult.title,v.outcome);
  document.body.appendChild(a);a.click();a.remove();
  document.getElementById('jiraStatus').textContent='Downloaded '+a.download+'. To keep it in this app too, choose "Use in form".';
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.getElementById('jiraUse').addEventListener('click',()=>{
  const v=readJiraFields();
  setMode(null);
  clearError();
  FIELDS.forEach(f=>{form.elements[f].value=v[f];});
  fitFields();
  jiraDialog.close();
  form.elements.outcome.focus();
  announce('Story loaded into the form. Review it, then choose Save intent.',true);
});

/* ---- Reset to sample data ---- */
const resetDialog=document.getElementById('resetDialog');
const resetStatus=document.getElementById('resetStatus');
document.getElementById('resetSample').addEventListener('click',()=>{
  const n=load().length;
  document.getElementById('resetMsg').textContent=n
    ?'Your '+n+(n===1?' saved intent':' saved intents')+' will be replaced by 3 sample intents. Evidence, reviews, and capability records are replaced too. This cannot be undone.'
    :'You have no saved intents. 3 sample intents will be added, and any evidence, reviews, capability uses, and progress will be replaced by sample records.';
  resetDialog.showModal();
});
document.getElementById('resetCancel').addEventListener('click',()=>resetDialog.close());
document.getElementById('resetConfirm').addEventListener('click',()=>{
  const ok=saveState(sampleState(Date.now()));
  resetDialog.close();
  if(!ok){
    resetStatus.textContent=storageProblem('reset');
    return;
  }
  form.reset();
  unfitFields();
  clearError();
  clearAnnouncement();
  setMode(null);
  render();
  resetStatus.textContent='Reset to sample data: 3 intents.';
  document.getElementById('savedTitle').focus();
});

/* ---- Another tab changed the stored data: show it here too ---- */
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)render();});

/* ---- Review view: evidence labels ---- */
let reviewIntentId=null;
const LABEL_BADGE={observed:'found',inferred:'suggested',assumed:'missing'};
const LABEL_TEXT={observed:'Observed',inferred:'Inferred',assumed:'Assumed'};
const evidenceStatus=document.getElementById('evidenceStatus');
function badgeEl(label){
  const b=document.createElement('span');
  b.className='badge '+LABEL_BADGE[label];
  b.textContent=LABEL_TEXT[label];
  return b;
}
function line(tag,cls,text){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  el.textContent=text;
  return el;
}
function renderReview(state){
  const intents=state.intents;
  const none=intents.length===0;
  document.getElementById('reviewEmpty').hidden=!none;
  document.getElementById('reviewBody').hidden=none;
  if(none){reviewIntentId=null;return;}
  if(!intents.some(i=>String(i.id)===String(reviewIntentId)))reviewIntentId=intents[0].id;
  const sel=document.getElementById('reviewIntent');
  sel.textContent='';
  intents.forEach(i=>{const o=document.createElement('option');o.value=String(i.id);o.textContent=shorten(i.outcome);sel.appendChild(o);});
  sel.value=String(reviewIntentId);
  const chosen=intents.find(i=>String(i.id)===String(reviewIntentId));
  const ready=checkIntent(chosen);
  document.getElementById('readinessSummary').textContent='Readiness: '+ready.score+'%. '+(ready.ready?'Ready.':'Not ready yet.');
  const rlist=document.getElementById('readinessList');
  rlist.textContent='';
  ready.checks.forEach(c=>{
    const li=document.createElement('li');
    li.className='claim';
    const b=document.createElement('span');
    b.className='badge '+(c.pass?'found':'missing');
    b.textContent=c.pass?'Pass':'Fix';
    li.append(b,document.createTextNode(' '+c.label+(c.required?' (required)':'')),line('p','claimtext',c.message),line('span','src','Source: '+c.source));
    rlist.appendChild(li);
  });
  const todo=ready.checks.filter(c=>c.required&&!c.pass);
  document.getElementById('readinessNext').textContent=todo.length?'Fix '+todo.length+' required '+(todo.length===1?'item':'items')+': '+todo.map(c=>c.label.toLowerCase()).join(', ')+'.':'All required checks pass. Record evidence below, then review the result.';
  const g=guardrailStatus(chosen,state);
  document.getElementById('consequence').value=g.level;
  document.getElementById('guardrailEmpty').hidden=g.level!=='';
  const glist=document.getElementById('guardrailList');
  glist.textContent='';
  g.items.forEach(m=>{
    const li=document.createElement('li');
    li.className='claim';
    const b=document.createElement('span');
    b.className='badge '+(m.met===null?'info':m.met?'found':'missing');
    b.textContent=m.met===null?'Check yourself':m.met?'Met':'Open';
    li.append(b,document.createTextNode(' '+m.text),line('span','src','From the '+m.level+' level'));
    glist.appendChild(li);
  });
  const checked=g.items.filter(m=>m.met!==null).length;
  document.getElementById('guardrailSummary').textContent=g.level?(g.allMet?'Guardrail: all minimums for '+g.level+' consequence are met.':'Guardrail: '+g.openCount+' of '+checked+' minimums for '+g.level+' consequence are open.')+' Source: '+GUARDRAIL_SOURCE+'.':'';
  document.getElementById('approvalBox').hidden=g.level!=='high';
  const approverInput=document.getElementById('approver');
  if(document.activeElement!==approverInput)approverInput.value=chosen.approver||'';
  const ev=state.evidence.filter(e=>String(e.intentId)===String(reviewIntentId));
  document.getElementById('epistemic').textContent=epistemicSummary(ev);
  document.getElementById('evidenceEmpty').hidden=ev.length>0;
  const list=document.getElementById('evidenceList');
  list.textContent='';
  ev.forEach(e=>{
    const li=document.createElement('li');
    li.className='claim';
    const head=document.createElement('div');
    head.className='claimhead';
    const change=document.createElement('select');
    change.setAttribute('aria-label','Change label of claim: '+shorten(e.claim));
    LABELS.forEach(l=>{const o=document.createElement('option');o.value=l;o.textContent=LABEL_TEXT[l];if(l===e.label)o.selected=true;change.appendChild(o);});
    change.addEventListener('change',()=>changeLabel(e.id,change.value));
    head.append(badgeEl(e.label),change);
    li.append(head,line('p','claimtext',e.claim));
    if(e.source)li.appendChild(line('p','note','Source: '+e.source));
    list.appendChild(li);
  });
  const rv=state.reviews.filter(r=>String(r.intentId)===String(reviewIntentId));
  document.getElementById('reviewsEmpty').hidden=rv.length>0;
  const rl=document.getElementById('reviewList');
  rl.textContent='';
  rv.forEach(r=>{
    const li=document.createElement('li');
    li.className='claim';
    const n=s=>r.criteria.filter(c=>c.status===s).length;
    li.appendChild(line('p','claimtext','Review of '+(r.created||'').slice(0,10)+': '+n('met')+' met, '+n('unmet')+' unmet, '+n('untested')+' untested.'));
    const crit=document.createElement('ul');
    r.criteria.forEach(c=>crit.appendChild(line('li','',c.status+': '+c.text)));
    li.appendChild(crit);
    (r.findings||[]).forEach(f=>{const p=document.createElement('p');p.append(badgeEl(f.label),document.createTextNode(' '+f.text));li.appendChild(p);});
    if(r.notChecked)li.appendChild(line('p','note','Not checked: '+r.notChecked));
    if(r.summary)li.appendChild(line('p','',r.summary));
    rl.appendChild(li);
  });
}
function evidenceMessage(text){
  evidenceStatus.textContent=text;
  evidenceStatus.scrollIntoView({block:'nearest'});
}
function changeLabel(id,label){
  const state=loadState();
  const at=state.evidence.findIndex(e=>e.id===id);
  if(at<0)return;
  const evidence=state.evidence.slice();
  evidence[at]=Object.assign({},evidence[at],{label});
  if(!saveState(Object.assign({},state,{evidence}))){evidenceMessage(storageProblem('change the label'));render();return;}
  render();
  evidenceMessage('Label changed to '+label+': '+shorten(evidence[at].claim)+'.');
}
function guardrailMessage(text){
  const el=document.getElementById('guardrailStatus');
  el.textContent=text;
  el.scrollIntoView({block:'nearest'});
}
function updateChosenIntent(patch,failVerb){
  const state=loadState();
  const at=state.intents.findIndex(i=>String(i.id)===String(reviewIntentId));
  if(at<0)return null;
  const intents=state.intents.slice();
  intents[at]=Object.assign({},intents[at],patch);
  if(!saveState(Object.assign({},state,{intents}))){guardrailMessage(storageProblem(failVerb));render();return null;}
  render();
  return intents[at];
}
document.getElementById('consequence').addEventListener('change',e=>{
  const level=e.target.value;
  const it=updateChosenIntent({consequence:level},'set the consequence');
  if(it)guardrailMessage(level?'Consequence set to '+level+': '+shorten(it.outcome)+'.':'Consequence cleared: '+shorten(it.outcome)+'.');
});
document.getElementById('recordApproval').addEventListener('click',()=>{
  const name=document.getElementById('approver').value.trim();
  if(!name){guardrailMessage('Type the approver\'s name first.');document.getElementById('approver').focus();return;}
  const it=updateChosenIntent({approver:name},'record the approval');
  if(it)guardrailMessage('Approval recorded: '+name+'.');
});
document.getElementById('editFromReview').addEventListener('click',()=>{
  const chosen=load().find(i=>String(i.id)===String(reviewIntentId));
  if(!chosen)return;
  window.addEventListener('hashchange',()=>startEdit(chosen.id),{once:true});
  location.hash='#intents';
});
document.getElementById('reviewIntent').addEventListener('change',e=>{reviewIntentId=e.target.value;render();});
document.getElementById('evidenceForm').addEventListener('submit',e=>{
  e.preventDefault();
  const claim=document.getElementById('claimText').value.trim();
  const label=document.getElementById('claimLabel').value;
  const err=document.getElementById('evidenceError');
  if(!claim||!label){
    err.textContent=!claim?'Write the claim first.':'Choose whether this claim is observed, inferred, or assumed.';
    err.hidden=false;
    (!claim?document.getElementById('claimText'):document.getElementById('claimLabel')).focus();
    return;
  }
  err.hidden=true;
  const state=loadState();
  const now=Date.now();
  const record=makeEvidence({intentId:state.intents.find(i=>String(i.id)===String(reviewIntentId)).id,claim,label,source:document.getElementById('claimSource').value},{id:nextEvidenceId(state.evidence,now),now});
  if(!saveState(Object.assign({},state,{evidence:state.evidence.concat(record)}))){err.textContent=storageProblem('save');err.hidden=false;return;}
  document.getElementById('evidenceForm').reset();
  render();
  document.getElementById('claimText').focus();
  evidenceMessage('Evidence saved: '+shorten(claim)+' ('+LABEL_TEXT[label]+').');
});

/* ---- Failures: banner actions and unexpected errors ---- */
document.getElementById('problemDownload').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([dataCopyText()],{type:'text/plain'}));
  const a=document.createElement('a');
  a.href=url;a.download='intent-workbench-data-copy.txt';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.getElementById('problemEmpty').addEventListener('click',()=>{
  try{localStorage.removeItem(KEY);}catch(e){}
  bannerDismissed=false;
  render();
  announce('Started with an empty project. A copy of the old data is still kept.');
});
document.getElementById('problemDismiss').addEventListener('click',()=>{bannerDismissed=true;document.getElementById('problemBanner').hidden=true;});
function showFailure(){appFailed=true;bannerDismissed=false;try{render();}catch(e){const b=document.getElementById('problemBanner');b.hidden=false;document.getElementById('problemText').textContent=describeProblem({failed:true}).text;}}
window.addEventListener('error',showFailure);
window.addEventListener('unhandledrejection',showFailure);

/* ---- First render: everything above is defined by now ---- */
render();
