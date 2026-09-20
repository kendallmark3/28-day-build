const KEY='intent-workbench-v1';
const FIELDS=['outcome','inputs','outputs','constraints','criteria','stop'];
const form=document.getElementById('intentForm');
const errorEl=document.getElementById('formError');
const listEl=document.getElementById('intentList');
const emptyEl=document.getElementById('emptyState');
const titleEl=document.getElementById('formTitle');
const submitBtn=document.getElementById('submitBtn');
const cancelBtn=document.getElementById('cancelEdit');
let editingId=null;

function load(){
  try{const data=JSON.parse(localStorage.getItem(KEY));return Array.isArray(data&&data.intents)?data.intents:[];}
  catch(e){return [];}
}
function save(intents){
  try{localStorage.setItem(KEY,JSON.stringify({intents}));return true;}
  catch(e){return false;}
}
function setMode(id){
  editingId=id;
  const editing=id!==null;
  titleEl.textContent=editing?'Edit intent':'New intent';
  submitBtn.textContent=editing?'Update intent':'Save intent';
  cancelBtn.hidden=!editing;
}
function render(){
  const intents=load();
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
  setMode(id);
  form.elements.outcome.focus();
}
cancelBtn.addEventListener('click',()=>{
  form.reset();
  unfitFields();
  clearError();
  setMode(null);
  form.elements.outcome.focus();
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
  form.reset();
  unfitFields();
  setMode(null);
  render();
  form.elements.outcome.focus();
});
render();

const VIEWS=['intents','references','about'];
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

/* ---- Jira story analysis: rule-based, runs in the browser, no network, no AI ---- */
const STORY_SAMPLE=`PROJ-142: Export monthly usage report

As an account manager, I want to export a monthly usage report as a CSV so that I can share it with customers without asking an engineer.

Description
Customers keep asking for their usage numbers. Right now an engineer runs a query by hand. The export should be fast and easy to use.

Acceptance Criteria
- The Reports page has an "Export CSV" button
- The CSV contains one row per user with columns: user, logins, last_seen
- The export should be fast
- Shows an error message if the month has no data

Dependencies
- Usage data from the analytics database
- Design mockup: https://example.com/mockups/142

Out of scope
- PDF export`;
const SECTION_WORDS={
  description:['description','background','context','overview','details','story','user story','problem','problem statement','notes'],
  criteria:['acceptance criteria','acceptance','ac','criteria','success criteria'],
  stop:['definition of done','dod','done when','exit criteria'],
  constraints:['constraints','assumptions','non-functional requirements','nfr','nfrs','technical notes','technical constraints','restrictions','limitations','guardrails','business rules'],
  outofscope:['out of scope','non-goals','non goals','not in scope','exclusions'],
  inputs:['inputs','dependencies','prerequisites','attachments','links','references','resources','data sources','environment','linked issues'],
  outputs:['outputs','deliverables','deliverable','expected result','expected results','expected output']
};
const VAGUE_WORDS=['easy','easily','simple','simply','fast','quick','quickly','good','better','best','nice','clean','intuitive','intuitively','user-friendly','user friendly','robust','seamless','smooth','scalable','flexible','modern','professional','polished','efficient','performant','appropriate','proper','properly','reasonable','as needed','and so on','etc','improve','improved','optimize','optimized','reliable','secure'];
const BULLET_RE=/^([-*•▪◦]|\d+[.)])\s+/;
const KEY_RE=/\b[A-Z][A-Z0-9]+-\d+\b/g;
const INLINE_HEADING_RE=/^(?:h[1-6]\.\s*|#{1,6}\s*)?[*_]*([A-Za-z][A-Za-z\- ]{1,30}?)[*_]*\s*[:：]\s*[*_]*\s*(\S.*)$/;
const STORY_RE=/\bas an?\s+([^,.]+?),?\s+i\s+(?:want|need|would like)\s+(?:to\s+)?([^.]*?)(?:,?\s+so that\s+([^.]*))?(?:\.|$)/i;
const GWT_RE=/^(given|when|then)\b/i;
const DONE_RE=/\b(done when|complete when|finished when|definition of done)\b/i;
const CONSTRAINT_RE=/\b(must not|should not|shall not|cannot|can't|do not|don't|never|only|no more than|at most|within \d|under \d|less than|fewer than|without|limited to|limit to|maximum|minimum)\b/i;
const URL_RE=/https?:\/\/[^\s)>\]]+/i;
const FILE_RE=/\b[\w.-]+\.(?:csv|xlsx?|json|ya?ml|md|pdf|png|jpe?g|sql|txt|docx?)\b/i;
const OBSERVABLE_RE=/\b(shows?|displays?|returns?|contains?|saves?|redirects?|sends?|receives?|creates?|deletes?|updates?|lists?|has|includes?|equals?|matches?|appears?|visible|hidden|disabled|enabled|error|message|button|page|column|row|field|status|code)\b/i;
const CONSEQUENCE_RE=/\b(production|payments?|billing|credit card|pii|personal data|customer data|delete|deletion|drop table|migration|security|credentials?|password|permissions?|admin)\b/gi;
const SECRET_RE=/((?:password|passwd|secret|api[_-]?key|access[_-]?key|token)\s*[:=]\s*\S+)|(AKIA[0-9A-Z]{16})|(Bearer\s+[A-Za-z0-9._-]{20,})/i;
const VAGUE_RE=new RegExp('(^|[^\\w-])('+VAGUE_WORDS.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\w-])','gi');
const FIELD_LABELS={outcome:'Outcome',inputs:'Inputs',outputs:'Outputs',constraints:'Constraints',criteria:'Success criteria',stop:'Stop condition'};
const SOURCE_LABELS={found:'From your story',suggested:'Suggested',missing:'Not found'};

function cap(t){return t?t.charAt(0).toUpperCase()+t.slice(1):t;}
function stripMarks(t){return t.replace(/^[*_\s]+|[*_\s]+$/g,'');}
function stripHeading(t){
  return stripMarks(stripMarks(t.replace(/^h[1-6]\.\s*/i,'').replace(/^#{1,6}\s*/,'')).replace(/[:：]\s*$/,''));
}
function sectionFor(word){
  for(const name in SECTION_WORDS){if(SECTION_WORDS[name].includes(word))return name;}
  return null;
}
function cleanTitle(t){
  return stripMarks(t.replace(/^\s*[A-Z][A-Z0-9]+-\d+\s*[:\-–—]?\s*/,'')).trim();
}
function findVague(t){
  const found=[];let m;
  VAGUE_RE.lastIndex=0;
  while((m=VAGUE_RE.exec(t))){found.push(m[2].toLowerCase());}
  return found;
}
function isCheckable(line){
  if(findVague(line).length)return false;
  return GWT_RE.test(line)||/\d/.test(line)||/["'`]/.test(line)||OBSERVABLE_RE.test(line);
}

function analyzeStory(raw){
  const text=String(raw||'').replace(/\r\n?/g,'\n');
  const keys=text.match(KEY_RE)||[];
  const key=keys[0]||'';
  const lines=[];
  let section='description',title='',seenFirst=false;
  text.split('\n').forEach(rawLine=>{
    const t=rawLine.trim();
    if(!t)return;
    const first=!seenFirst;
    seenFirst=true;
    const bullet=BULLET_RE.test(t);
    if(!bullet){
      const head=stripHeading(t);
      const sec=head.length<=40?sectionFor(head.toLowerCase()):null;
      if(sec){section=sec;return;}
      const m=t.match(INLINE_HEADING_RE);
      if(m){
        const g=m[1].trim().toLowerCase();
        if((g==='summary'||g==='title')&&!title){title=cleanTitle(m[2]);return;}
        const s2=sectionFor(g);
        if(s2){section=s2;lines.push({text:m[2].trim(),section,used:false});return;}
      }
      if(first&&!title&&!/^as an?\b/i.test(t)&&t.length<=140){title=cleanTitle(t);return;}
    }
    lines.push({text:t.replace(BULLET_RE,'').trim(),section,used:false});
  });
  const take=pred=>lines.filter(l=>!l.used&&pred(l)).map(l=>{l.used=true;return l.text;});

  // user story: "As a <role>, I want <thing> so that <why>"
  const desc=lines.filter(l=>l.section==='description');
  const flat=desc.map(l=>l.text).join(' ');
  const sm=flat.match(STORY_RE);
  const storyCount=(flat.match(/\bas an?\s+[^,.]+?,?\s+i\s+(?:want|need|would like)\b/gi)||[]).length;
  let want='',why='';
  if(sm){
    want=sm[2].trim();why=(sm[3]||'').trim();
    desc.forEach(l=>{if(/^as an?\b|\bi (?:want|need|would like)\b|\bso that\b/i.test(l.text))l.used=true;});
  }

  const fields={};
  const put=(name,items,source)=>{fields[name]={text:items.join('\n'),source:items.length?source:'missing'};};

  // outcome
  if(want){fields.outcome={text:cap(want)+(why?' so that '+why:''),source:'found'};}
  else if(title){fields.outcome={text:title,source:'found'};}
  else if(desc.length){
    desc[0].used=true;
    fields.outcome={text:desc[0].text.split(/[.!?](?:\s|$)/)[0],source:'found'};
  }else{fields.outcome={text:'',source:'missing'};}

  // success criteria: the acceptance criteria section, plus Given/When/Then lines anywhere
  put('criteria',take(l=>l.section==='criteria'||GWT_RE.test(l.text)),'found');
  // stop: a definition-of-done section, or a "done when" line
  put('stop',take(l=>l.section==='stop'||DONE_RE.test(l.text)),'found');
  // constraints: constraint sections, out-of-scope items, and "must not / only / without" lines in the description
  const cons=take(l=>l.section==='constraints');
  const oos=take(l=>l.section==='outofscope').map(t=>'Out of scope: '+t);
  const limits=take(l=>l.section==='description'&&CONSTRAINT_RE.test(l.text));
  put('constraints',cons.concat(oos,limits),'found');
  const hasOutOfScope=oos.length>0;
  // inputs: dependency sections, plus lines in the description that name a link, file or other ticket
  const inputs=take(l=>l.section==='inputs');
  const mentions=take(l=>l.section==='description'&&(URL_RE.test(l.text)||FILE_RE.test(l.text)||(l.text.match(KEY_RE)||[]).some(k=>k!==key)));
  put('inputs',inputs.concat(mentions),'found');
  // outputs: a deliverables section; otherwise suggested from the "I want" clause
  put('outputs',take(l=>l.section==='outputs'),'found');
  if(fields.outputs.source==='missing'&&want){fields.outputs={text:cap(want),source:'suggested'};}
  // stop condition suggested from the criteria
  if(fields.stop.source==='missing'&&fields.criteria.source==='found'){
    fields.stop={text:'Stop when every success criterion above passes and each result is recorded.',source:'suggested'};
  }

  const unmatched=lines.filter(l=>!l.used).map(l=>l.text);

  // notes: the intent-check questions, most important first
  const notes=[];
  const add=(tag,msg)=>notes.push({tag,text:msg});
  const secret=text.match(SECRET_RE);
  if(secret)add('Security','This story appears to contain a secret or credential ("'+secret[0].slice(0,40)+'"). Remove it from the story and from anything you share. Keep credentials out of intent files.');
  const critItems=fields.criteria.source==='found'?fields.criteria.text.split('\n'):[];
  if(!critItems.length)add('Missing','No acceptance criteria were found. Without them nothing tells you when the work is right. Add 3 to 6 statements that someone could mark pass or fail.');
  const flagged=new Set();
  critItems.forEach(c=>{
    if(!isCheckable(c)){
      const v=findVague(c);
      v.forEach(w=>flagged.add(w));
      add('Uncheckable','"'+c+'" cannot be marked pass or fail as written.'+(v.length?' "'+v[0]+'" is not measurable: say how much, and how someone would check it (for example a number, a limit, or something visible on screen).':' Say what someone would see, or measure, when it is true.'));
    }
  });
  const otherVague=[];
  lines.forEach(l=>{if(!critItems.includes(l.text))findVague(l.text).forEach(w=>{if(!flagged.has(w)&&!otherVague.includes(w))otherVague.push(w);});});
  if(want)findVague(want+' '+why).forEach(w=>{if(!flagged.has(w)&&!otherVague.includes(w))otherVague.push(w);});
  if(otherVague.length)add('Ambiguity','Vague words in the story: '+otherVague.map(w=>'"'+w+'"').join(', ')+'. Each can mean different things to different people. Replace it with a check someone can perform, and put that check in the success criteria.');
  if(fields.stop.source==='missing')add('Stop','No stop condition was found, and there are no criteria to base one on. Say exactly what has to be true for the work to be finished.');
  else if(fields.stop.source==='suggested')add('Stop','The story has no definition of done, so a stop condition was suggested from the criteria. Edit it so it names the criteria that end the work, and says what to do when one fails.');
  if(fields.outcome.source!=='missing'&&!why)add('Missing','The outcome does not say why it matters (no "so that" reason). Add it. It is what lets a reviewer judge whether the result is good.');
  if(fields.inputs.source==='missing')add('Missing','No inputs were found. Say what may be used: data, files, links, other tickets, or systems.');
  if(fields.outputs.source==='missing')add('Missing','No outputs were found. Say what will exist when this is done, and where.');
  if(fields.constraints.source==='missing')add('Missing','No constraints were found. Add at least one boundary that must hold (limits on data, time, technology, or who is affected).');
  if(!hasOutOfScope)add('Scope','Nothing says what is out of scope. Add at least one non-goal so helpful extras do not creep in.');
  const words=(text.match(/\S+/g)||[]).length;
  if(storyCount>1)add('Size','This looks like '+storyCount+' stories in one. Consider one intent per story.');
  else if(critItems.length>8||words>400)add('Size','This story is large ('+critItems.length+' criteria, '+words+' words). Consider splitting it into smaller intents. Prefer the smallest useful change.');
  const cons2=[...new Set((text.match(CONSEQUENCE_RE)||[]).map(w=>w.toLowerCase()))];
  if(cons2.length)add('Consequence','The story mentions '+cons2.map(w=>'"'+w+'"').join(', ')+'. Decide whether the consequence of a mistake is low, medium, or high, and name who approves the change before it ships. High-consequence work needs explicit human approval.');
  const sugg=Object.keys(fields).filter(k=>fields[k].source==='suggested').map(k=>FIELD_LABELS[k]);
  if(sugg.length)add('Missing','Parts labelled "Suggested" ('+sugg.join(', ')+') were filled in by the app, not taken from your story. Confirm each one.');
  add('Limits','This is a rule-based check running in your browser. It cannot tell whether the criteria are correct, whether parts of the story contradict each other, or whether the story matches what the business wants. Have a person, or a review in a fresh session, check those.');
  return {key,title,fields,unmatched,notes};
}

function intentMarkdown(values,key,title){
  const missing=[];
  if(!values.outcome)missing.push('outcome');
  if(!values.constraints)missing.push('constraints');
  if(!values.criteria)missing.push('success criteria');
  if(!values.stop)missing.push('stop condition');
  const bullets=t=>t?t.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>'- '+l.replace(BULLET_RE,'')).join('\n'):'- TODO: not found in the Jira story';
  const name=title||(values.outcome||'Untitled intent').slice(0,80);
  return '# Intent: '+name+'\n\n'
    +(key?'Source: Jira story '+key+'\n':'')
    +'Status: DRAFT'+(missing.length?'. Still missing: '+missing.join(', ')+'.':'. All six parts are present; run the intent check before building.')+'\n\n'
    +'## Intent\n'+(values.outcome||'TODO: not found in the Jira story')+'\n\n'
    +'## Inputs\n'+bullets(values.inputs)+'\n\n'
    +'## Outputs\n'+bullets(values.outputs)+'\n\n'
    +'## Constraints\n'+bullets(values.constraints)+'\n\n'
    +'## Success criteria\n'+bullets(values.criteria)+'\n\n'
    +'## Stop when\n'+bullets(values.stop)+'\n';
}
function intentFileName(key,title,outcome){
  const base=(key||title||outcome||'draft').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'draft';
  return 'intent-'+base+'.md';
}

/* ---- Jira modal wiring ---- */
const jiraDialog=document.getElementById('jiraDialog');
const jiraText=document.getElementById('jiraText');
const jiraErr=document.getElementById('jiraError');
const jiraFieldsEl=document.getElementById('jiraFields');
let jiraDraft=null;
let jiraResult=null;

function jiraStep(n){
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
  res.notes.forEach(n=>{const li=document.createElement('li');const tag=document.createElement('span');tag.className='tag';tag.textContent=n.tag;li.append(tag,document.createTextNode(n.text));notes.appendChild(li);});
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
});
