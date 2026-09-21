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
const lastSave={signature:'',at:0};

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
  const ns=document.getElementById('nextStep');
  ns.textContent=d.next;
  if(d.saved===0){
    const a=document.createElement('a');
    a.href='#start';
    a.textContent='New here? Open Start.';
    ns.append(' ',a);
  }
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
function renderFlow(state){
  const list=document.getElementById('flow');
  list.textContent='';
  flowStages(state,document.querySelectorAll('#contextList li').length).forEach(st=>{
    const li=document.createElement('li');
    li.dataset.stage=st.id;
    const count=document.createElement('p');
    count.className='flowcount';
    const n=document.createElement('strong');
    n.textContent=st.count;
    const d=document.createElement('span');
    d.textContent=st.rest;
    count.append(n,d);
    li.append(line('h4','',st.name),line('p','',st.what),count);
    if(st.view){
      const a=document.createElement('a');
      a.href='#'+st.view;
      a.textContent='Go to '+({intents:'Intents',references:'References',review:'Review',capabilities:'Capabilities',progress:'Progress'}[st.view]);
      li.appendChild(a);
    }
    list.appendChild(li);
  });
}
function renderMetrics(state){
  const ul=document.getElementById('metrics');
  ul.textContent='';
  metrics(state).forEach(m=>{
    const li=document.createElement('li');
    li.dataset.metric=m.id;
    const n=document.createElement('strong');
    n.textContent=m.value+(m.of===null?'':' of '+m.of);
    li.append(n,line('span','',m.label),line('span','note',m.why));
    ul.appendChild(li);
  });
}
function renderDays(state){
  const ol=document.getElementById('days');
  ol.textContent='';
  const done=(state.progress&&state.progress.days)||{};
  DAY_TITLES.forEach((title,i)=>{
    const d=i+1;
    const li=document.createElement('li');
    const label=document.createElement('label');
    const box=document.createElement('input');
    box.type='checkbox';
    box.checked=done[d]===true;
    box.dataset.day=String(d);
    box.addEventListener('change',()=>toggleDay(d,box.checked));
    label.append(box,document.createTextNode(' Day '+d+': '+title));
    li.appendChild(label);
    ol.appendChild(li);
  });
}
function toggleDay(d,on){
  const state=loadState();
  const days=Object.assign({},(state.progress&&state.progress.days)||{});
  if(on)days[d]=true;else delete days[d];
  const el=document.getElementById('progressStatus');
  if(!saveState(Object.assign({},state,{progress:{days}}))){el.textContent=storageProblem('save');render();return;}
  render();
  el.textContent='Day '+d+(on?' marked done. ':' unmarked. ')+Object.keys(days).length+' of 28 days done.';
}
function renderOverview(state){
  renderMetrics(state);
  renderFlow(state);
  renderDays(state);
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
  renderCapabilities(state);
  renderStart(state);
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
    const del=document.createElement('button');
    del.type='button';
    del.className='secondary delete';
    del.textContent='Delete';
    del.setAttribute('aria-label','Delete intent: '+item.outcome);
    del.addEventListener('click',()=>askDelete(item.id));
    li.append(text,edit,del);
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
  const signature=FIELDS.map(f=>values[f]).join('\u0001');
  if(editingId===null&&signature===lastSave.signature&&Date.now()-lastSave.at<1000){announce('That was just saved. Change the text to save another.');return;}
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
  if(!wasEditing){lastSave.signature=signature;lastSave.at=Date.now();}
  form.reset();
  unfitFields();
  resetStatus.textContent='';
  setMode(null);
  render();
  form.elements.outcome.focus();
  announce(vanished?'The intent you were editing no longer exists, so this was saved as a new intent: '+shorten(values.outcome)+' ('+intents.length+' saved).':wasEditing?'Updated: '+shorten(values.outcome)+'.':'Saved: '+shorten(values.outcome)+' ('+intents.length+' saved).');
});

const VIEWS=['start','intents','review','capabilities','overview','references','about'];
function currentView(){
  const name=location.hash.replace('#','');
  if(name==='progress')return 'overview';
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
  if(location.hash==='#progress'){const p=document.getElementById('progress');if(p)p.scrollIntoView();}
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
document.getElementById('loadSample').addEventListener('click',()=>document.getElementById('resetSample').click());
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
  document.getElementById('startStatus').textContent='Sample project loaded. Open each view and look around.';
  document.getElementById('savedTitle').focus();
});

/* ---- Delete one intent, or start with an empty project ---- */
const deleteDialog=document.getElementById('deleteDialog');
const clearDialog=document.getElementById('clearDialog');
let deletingId=null;
function afterRemoval(message){
  form.reset();
  unfitFields();
  clearError();
  clearAnnouncement();
  setMode(null);
  render();
  resetStatus.textContent=message;
  document.getElementById('savedTitle').focus();
}
function askDelete(id){
  const item=load().find(i=>i.id===id);
  if(!item)return;
  deletingId=id;
  const r=removeIntent(loadState(),id).removed;
  const also=[r.evidence&&r.evidence+(r.evidence===1?' evidence record':' evidence records'),r.reviews&&r.reviews+(r.reviews===1?' review':' reviews')].filter(Boolean).join(' and ');
  document.getElementById('deleteMsg').textContent='"'+shorten(item.outcome)+'" will be deleted'+(also?', along with its '+also:'')+'. This cannot be undone.';
  deleteDialog.showModal();
}
document.getElementById('deleteCancel').addEventListener('click',()=>deleteDialog.close());
document.getElementById('deleteConfirm').addEventListener('click',()=>{
  const state=loadState();
  const item=state.intents.find(i=>i.id===deletingId);
  deleteDialog.close();
  if(!item){resetStatus.textContent='That intent was already deleted.';render();return;}
  const result=removeIntent(state,deletingId);
  if(!saveState(result.state)){resetStatus.textContent=storageProblem('delete');return;}
  const wasEditing=editingId===deletingId;
  deletingId=null;
  if(wasEditing)afterRemoval('Deleted: '+shorten(item.outcome)+' ('+result.state.intents.length+' saved).');
  else{render();resetStatus.textContent='Deleted: '+shorten(item.outcome)+' ('+result.state.intents.length+' saved).';document.getElementById('savedTitle').focus();}
});
document.getElementById('clearAll').addEventListener('click',()=>{
  const what=clearSummary(loadState());
  document.getElementById('clearMsg').textContent=what
    ?'This deletes '+what+'. You will have an empty project. This cannot be undone.'
    :'There is nothing saved, so nothing will be deleted.';
  clearDialog.showModal();
});
document.getElementById('clearCancel').addEventListener('click',()=>clearDialog.close());
document.getElementById('clearConfirm').addEventListener('click',()=>{
  const ok=saveState(emptyState(Date.now()));
  clearDialog.close();
  if(!ok){resetStatus.textContent=storageProblem('clear');return;}
  afterRemoval('Project cleared. Write your first intent above.');
  document.getElementById('startStatus').textContent='';
});

/* ---- Another tab changed the stored data: show it here too ---- */
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)render();});

/* ---- Review view: evidence labels ---- */
let reviewIntentId=null;
let reviewFormKey='';
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
  const critLines=chosen.criteria.split('\n').map(l=>l.trim()).filter(Boolean);
  const formKey=String(chosen.id)+'|'+critLines.join('\n');
  document.getElementById('reviewFormNone').hidden=critLines.length>0;
  document.getElementById('reviewForm').hidden=critLines.length===0;
  if(formKey!==reviewFormKey){
    reviewFormKey=formKey;
    const rows=document.getElementById('criteriaRows');
    rows.textContent='';
    const lg=document.createElement('legend');
    lg.textContent='Each success criterion';
    rows.appendChild(lg);
    critLines.forEach((text,i)=>{
      const row=document.createElement('div');
      row.className='crow';
      const lab=document.createElement('label');
      lab.htmlFor='crit-'+i;
      lab.textContent=text;
      const sel=document.createElement('select');
      sel.id='crit-'+i;
      [['untested','Untested'],['met','Met'],['unmet','Unmet']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);});
      row.append(lab,sel);
      rows.appendChild(row);
    });
  }
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

document.getElementById('reviewForm').addEventListener('submit',e=>{
  e.preventDefault();
  const err=document.getElementById('reviewError');
  const notChecked=document.getElementById('notChecked').value.trim();
  if(!notChecked){
    err.textContent='Say what was not checked. A review always names its gaps.';
    err.hidden=false;
    document.getElementById('notChecked').focus();
    return;
  }
  err.hidden=true;
  const state=loadState();
  const intent=state.intents.find(i=>String(i.id)===String(reviewIntentId));
  if(!intent)return;
  const criteria=[...document.querySelectorAll('#criteriaRows .crow')].map(row=>({text:row.querySelector('label').textContent,status:row.querySelector('select').value}));
  const findings=[];
  [['fObserved','observed'],['fInferred','inferred'],['fAssumed','assumed']].forEach(([id,label])=>{
    document.getElementById(id).value.split('\n').map(t=>t.trim()).filter(Boolean).forEach(text=>findings.push({text,label}));
  });
  const now=Date.now();
  const review=makeReview({intentId:intent.id,criteria,findings,notChecked,summary:document.getElementById('reviewSummary').value},{id:nextReviewId(state.reviews,now),now});
  if(!saveState(Object.assign({},state,{reviews:state.reviews.concat(review)}))){err.textContent=storageProblem('save');err.hidden=false;return;}
  document.getElementById('reviewForm').reset();
  reviewFormKey='';
  render();
  const n=s=>criteria.filter(c=>c.status===s).length;
  const st=document.getElementById('reviewStatus');
  st.textContent='Review saved: '+n('met')+' met, '+n('unmet')+' unmet, '+n('untested')+' untested.';
  st.scrollIntoView({block:'nearest'});
});

/* ---- Capabilities view ---- */
const REPO_URL='https://github.com/kendallmark3/28-day-build/blob/main/';
const USE_LINKS={'cap-intent-check':{href:'#review',text:'Check a saved intent on Review'},'cap-evidence-review':{href:'#review',text:'Review an intent on Review'}};
function capMessage(text){
  const el=document.getElementById('capStatus');
  el.textContent=text;
  el.scrollIntoView({block:'nearest'});
}
function changeCapability(id,change,failVerb){
  const state=loadState();
  const at=state.capabilities.findIndex(c=>c.id===id);
  if(at<0)return null;
  const capabilities=state.capabilities.slice();
  capabilities[at]=change(capabilities[at]);
  if(!saveState(Object.assign({},state,{capabilities}))){capMessage(storageProblem(failVerb));render();return null;}
  render();
  return capabilities[at];
}
function recordUse(id,success){
  const now=Date.now();
  const current=loadState().capabilities.find(c=>c.id===id);
  if(!current)return;
  if(isDuplicateUse(current,success,now)){capMessage('That use was just recorded. Wait a moment before recording another.');return;}
  const c=changeCapability(id,x=>withUse(x,success,now),'record the use');
  if(!c)return;
  capMessage(success?'Successful use recorded: '+shorten(c.name)+' ('+promotionStatus(c).successes+' successful).':'Unsuccessful use recorded: '+shorten(c.name)+'. It does not count toward promotion.');
}
function renderLadder(capabilities){
  const counts=ladderCounts(capabilities);
  const ol=document.getElementById('ladder');
  ol.textContent='';
  LADDER.forEach(r=>{
    const li=document.createElement('li');
    li.dataset.rung=r.id;
    const n=counts[r.id];
    li.append(line('h4','',LEVEL_NAMES[r.id]),line('p','',r.what),line('p','flowcount',n+(n===1?' item':' items')));
    ol.appendChild(li);
  });
}
function renderStart(state){
  const steps=onboardingSteps(state);
  const done=steps.filter(s=>s.done).length;
  const next=steps.find(s=>!s.done);
  const sum=document.getElementById('stepsSummary');
  sum.textContent=done===steps.length?'All '+steps.length+' steps done. You have been through the whole loop.':done+' of '+steps.length+' steps done. Next: '+next.title.toLowerCase()+'. ';
  if(next){const a=document.createElement('a');a.href='#'+next.view;a.textContent=next.link;sum.appendChild(a);}
  const ol=document.getElementById('steps');
  ol.textContent='';
  steps.forEach(st=>{
    const li=document.createElement('li');
    li.className='claim';
    li.dataset.step=st.id;
    const head=document.createElement('div');
    head.className='claimhead';
    const b=document.createElement('span');
    b.className='badge '+(st.done?'found':'missing');
    b.textContent=st.done?'Done':'To do';
    head.append(line('h4','capname',st.title),b);
    li.append(head,line('p','claimtext',st.why),line('p','',st.todo));
    const a=document.createElement('a');
    a.href='#'+st.view;
    a.textContent=st.link;
    li.appendChild(a);
    ol.appendChild(li);
  });
  const tour=document.getElementById('tour');
  tour.textContent='';
  sampleTour().forEach(t=>tour.appendChild(line('li','',t)));
}
function renderCapabilities(state){
  renderLadder(state.capabilities);
  const list=document.getElementById('capList');
  list.textContent='';
  state.capabilities.forEach(cap=>{
    const li=document.createElement('li');
    li.className='claim';
    li.dataset.cap=cap.id;
    const head=document.createElement('div');
    head.className='claimhead';
    const b=document.createElement('span');
    b.className='badge info';
    b.textContent=LEVEL_NAMES[cap.level]||cap.level;
    head.append(line('h3','capname',cap.name),b);
    if(cap.promoted){const pb=document.createElement('span');pb.className='badge found';pb.textContent='Promoted';head.appendChild(pb);}
    li.append(head,line('p','claimtext',cap.purpose));
    if(cap.procedure){
      li.appendChild(line('h4','','Procedure'));
      const ol=document.createElement('ol');
      cap.procedure.split('\n').forEach(step=>ol.appendChild(line('li','',step)));
      li.appendChild(ol);
    }
    if(cap.output){li.appendChild(line('h4','','Output'));li.appendChild(line('p','',cap.output));}
    if(cap.checks){li.appendChild(line('h4','','Checks'));li.appendChild(line('p','',cap.checks));}
    li.appendChild(line('p','note','Owner: '+cap.owner+'. Version: '+cap.version+'.'));
    const usage=sampleUsage(cap.id);
    if(usage){li.appendChild(line('h4','','Sample usage'));li.appendChild(line('p','sample',usage));}
    const links=document.createElement('p');
    if(cap.file){
      const f=document.createElement('a');
      f.href=REPO_URL+cap.file;f.target='_blank';f.rel='noopener noreferrer';f.textContent=cap.file;
      links.append(document.createTextNode('Source file: '),f);
    }
    const use=USE_LINKS[cap.id];
    if(use){
      const u=document.createElement('a');
      u.href=use.href;u.textContent=use.text;
      links.append(document.createTextNode(cap.file?' · ':''),u);
    }
    li.appendChild(links);
    const ps=promotionStatus(cap);
    li.appendChild(line('p','uses','Successful uses: '+ps.successes+'. Unsuccessful: '+ps.failures+'. '+(cap.promoted?'Promoted.':ps.missing>0?'Promotion needs '+ps.missing+' more successful '+(ps.missing===1?'use.':'uses.'):'Ready to promote.')));
    const lvlLabel=document.createElement('label');
    lvlLabel.textContent='Rung';
    const lvl=document.createElement('select');
    lvl.setAttribute('aria-label','Rung of '+cap.name);
    LEVELS.forEach(l=>{const o=document.createElement('option');o.value=l;o.textContent=LEVEL_NAMES[l];if(l===cap.level)o.selected=true;lvl.appendChild(o);});
    lvl.addEventListener('change',()=>{const c=changeCapability(cap.id,x=>Object.assign({},x,{level:lvl.value}),'classify it');if(c)capMessage('Classified as '+LEVEL_NAMES[c.level]+': '+shorten(c.name)+'.');});
    lvlLabel.appendChild(lvl);
    const act=document.createElement('div');
    act.className='actions';
    const btn=(text,fn)=>{const x=document.createElement('button');x.type='button';x.className='secondary small';x.textContent=text;x.setAttribute('aria-label',text+': '+cap.name);x.addEventListener('click',fn);return x;};
    act.append(
      btn('Record a successful use',()=>recordUse(cap.id,true)),
      btn('Record an unsuccessful use',()=>recordUse(cap.id,false)),
      btn('Promote',()=>{
        const r=tryPromote(cap);
        if(!r.ok){capMessage(r.message);return;}
        const c=changeCapability(cap.id,x=>tryPromote(x).cap,'promote it');
        if(c)capMessage(r.message);
      }));
    li.append(lvlLabel,act);
    list.appendChild(li);
  });
}

document.getElementById('capForm').addEventListener('submit',e=>{
  e.preventDefault();
  const err=document.getElementById('capError');
  const name=document.getElementById('capName').value.trim();
  if(!name){err.textContent='Give the item a name first.';err.hidden=false;document.getElementById('capName').focus();return;}
  err.hidden=true;
  const state=loadState();
  const now=Date.now();
  const cap=makeCapability({name,level:document.getElementById('capLevel').value,purpose:document.getElementById('capPurpose').value},{id:nextCapabilityId(state.capabilities,now),now});
  if(!saveState(Object.assign({},state,{capabilities:state.capabilities.concat(cap)}))){err.textContent=storageProblem('save');err.hidden=false;return;}
  document.getElementById('capForm').reset();
  render();
  capMessage('Added: '+shorten(cap.name)+' ('+LEVEL_NAMES[cap.level]+').');
  document.getElementById('capName').focus();
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
