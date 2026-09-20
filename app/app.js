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

function readState(){
  let raw=null;
  try{raw=JSON.parse(localStorage.getItem(KEY));}catch(e){raw=null;}
  return normalizeState(raw,Date.now());
}
function loadState(){return readState().state;}
function saveState(state){
  try{localStorage.setItem(KEY,JSON.stringify(state));return true;}
  catch(e){return false;}
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
function renderOverview(state){
  const rows=[['Projects',state.projects.length],['Intents',state.intents.length],['Evidence records',state.evidence.length],['Reviews',state.reviews.length],['Capabilities',state.capabilities.length]];
  const el=document.getElementById('modelCounts');
  el.textContent='';
  rows.forEach(([name,n])=>{const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=n;const span=document.createElement('span');span.textContent=name;li.append(strong,span);el.appendChild(li);});
}
function render(){
  const state=loadState();
  const intents=state.intents;
  renderDashboard(intents);
  renderOverview(state);
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
  if(editingId!==null){
    const i=intents.findIndex(x=>x.id===editingId);
    if(i>=0)intents[i]=Object.assign({},intents[i],values,{updated:new Date().toISOString()});
  }else{
    intents.push(Object.assign({id:Date.now(),created:new Date().toISOString()},values));
  }
  if(!save(intents)){
    errorEl.textContent='Could not save: this browser is blocking local storage.';
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
  announce(wasEditing?'Updated: '+shorten(values.outcome)+'.':'Saved: '+shorten(values.outcome)+' ('+intents.length+' saved).');
});
render();

const VIEWS=['intents','overview','references','about'];
function currentView(){
  const name=location.hash.replace('#','');
  return VIEWS.includes(name)?name:'intents';
}
function showView(name,moveFocus){
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
    :'You have no saved intents. 3 sample intents will be added, with sample evidence, reviews, and capability records.';
  resetDialog.showModal();
});
document.getElementById('resetCancel').addEventListener('click',()=>resetDialog.close());
document.getElementById('resetConfirm').addEventListener('click',()=>{
  const ok=saveState(sampleState(Date.now()));
  resetDialog.close();
  if(!ok){
    resetStatus.textContent='Could not reset: this browser is blocking local storage.';
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
