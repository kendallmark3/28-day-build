/* logic.js: pure functions only. They take data in and return data out, and never touch the page or storage. */

const FIELDS=['outcome','inputs','outputs','constraints','criteria','stop'];
function dashboardState(intents){
  const saved=intents.length;
  const gaps=intents.filter(i=>!(i.constraints||'').trim()||!(i.stop||'').trim()).length;
  let next='Next step: write your next intent, or start from a Jira story.';
  if(saved===0)next='Next step: save the example below, or start from a Jira story.';
  else if(gaps>0)next='Next step: edit the '+gaps+(gaps===1?' intent':' intents')+' missing a constraint or stop condition.';
  return {saved,gaps,next};
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
  const add=(tag,msg,source)=>notes.push({tag,text:msg,source:source||''});
  const secret=text.match(SECRET_RE);
  if(secret)add('Security','This story appears to contain a secret or credential ("'+secret[0].slice(0,40)+'"). Remove it from the story and from anything you share. Keep credentials out of intent files.','context/security.md');
  const critItems=fields.criteria.source==='found'?fields.criteria.text.split('\n'):[];
  if(!critItems.length)add('Missing','No acceptance criteria were found. Without them nothing tells you when the work is right. Add 3 to 6 statements that someone could mark pass or fail.','context/business-rules.md, rule 2');
  const flagged=new Set();
  critItems.forEach(c=>{
    if(!isCheckable(c)){
      const v=findVague(c);
      v.forEach(w=>flagged.add(w));
      add('Uncheckable','"'+c+'" cannot be marked pass or fail as written.'+(v.length?' "'+v[0]+'" is not measurable: say how much, and how someone would check it (for example a number, a limit, or something visible on screen).':' Say what someone would see, or measure, when it is true.'),'context/business-rules.md, rule 2');
    }
  });
  const otherVague=[];
  lines.forEach(l=>{if(!critItems.includes(l.text))findVague(l.text).forEach(w=>{if(!flagged.has(w)&&!otherVague.includes(w))otherVague.push(w);});});
  if(want)findVague(want+' '+why).forEach(w=>{if(!flagged.has(w)&&!otherVague.includes(w))otherVague.push(w);});
  if(otherVague.length)add('Ambiguity','Vague words in the story: '+otherVague.map(w=>'"'+w+'"').join(', ')+'. Each can mean different things to different people. Replace it with a check someone can perform, and put that check in the success criteria.','context/business-rules.md, rule 2');
  if(fields.stop.source==='missing')add('Stop','No stop condition was found, and there are no criteria to base one on. Say exactly what has to be true for the work to be finished.','context/business-rules.md, rule 3');
  else if(fields.stop.source==='suggested')add('Stop','The story has no definition of done, so a stop condition was suggested from the criteria. Edit it so it names the criteria that end the work, and says what to do when one fails.','context/business-rules.md, rule 3');
  if(fields.outcome.source!=='missing'&&!why)add('Missing','The outcome does not say why it matters (no "so that" reason). Add it. It is what lets a reviewer judge whether the result is good.','context/glossary.md, Intent');
  if(fields.inputs.source==='missing')add('Missing','No inputs were found. Say what may be used: data, files, links, other tickets, or systems.','context/glossary.md, Inputs');
  if(fields.outputs.source==='missing')add('Missing','No outputs were found. Say what will exist when this is done, and where.','context/glossary.md, Outputs');
  if(fields.constraints.source==='missing')add('Missing','No constraints were found. Add at least one boundary that must hold (limits on data, time, technology, or who is affected).','context/business-rules.md, rule 3');
  if(!hasOutOfScope)add('Scope','Nothing says what is out of scope. Add at least one non-goal so helpful extras do not creep in.');
  const words=(text.match(/\S+/g)||[]).length;
  if(storyCount>1)add('Size','This looks like '+storyCount+' stories in one. Consider one intent per story.');
  else if(critItems.length>8||words>400)add('Size','This story is large ('+critItems.length+' criteria, '+words+' words). Consider splitting it into smaller intents. Prefer the smallest useful change.');
  const cons2=[...new Set((text.match(CONSEQUENCE_RE)||[]).map(w=>w.toLowerCase()))];
  if(cons2.length)add('Consequence','The story mentions '+cons2.map(w=>'"'+w+'"').join(', ')+'. Decide whether the consequence of a mistake is low, medium, or high, and name who approves the change before it ships. High-consequence work needs explicit human approval.','context/business-rules.md, rule 6; context/security.md');
  const sugg=Object.keys(fields).filter(k=>fields[k].source==='suggested').map(k=>FIELD_LABELS[k]);
  if(sugg.length)add('Missing','Parts labelled "Suggested" ('+sugg.join(', ')+') were filled in by the app, not taken from your story. Confirm each one.','context/glossary.md, Suggested');
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
function sampleIntents(now){
  const parts=[
    {consequence:'medium',outcome:'Export a monthly usage report as a CSV so that I can share it with customers without asking an engineer',
     inputs:'Usage data from the analytics database\nDesign mockup: https://example.com/mockups/142',
     outputs:'A CSV export of the monthly usage report',
     constraints:'Out of scope: PDF export',
     criteria:'The Reports page has an "Export CSV" button\nThe CSV contains one row per user with columns: user, logins, last_seen\nThe export finishes in under 5 seconds for 10,000 rows\nShows an error message if the month has no data',
     stop:'Stop when every success criterion passes and each result is recorded.'},
    {consequence:'low',outcome:'Example: Weekly ticket report',
     inputs:"Last week's ticket export (CSV)",
     outputs:'One-page summary (summary.md)',
     constraints:'No customer names; <300 words',
     criteria:'Top 3 issues; counts match CSV',
     stop:'Stop when top 3 issues verified'},
    {outcome:'Draft: onboarding checklist for new engineers',
     inputs:'Current onboarding wiki page',
     outputs:'',constraints:'',criteria:'',stop:''}
  ];
  return parts.map((p,i)=>Object.assign({id:now+i,projectId:DEFAULT_PROJECT_ID,created:new Date(now).toISOString(),consequence:'',approver:''},p));
}

/* ---- Domain model: projects, intents, evidence, reviews, capabilities ---- */
const STATE_VERSION=2;
const DEFAULT_PROJECT_ID='project-1';
const LABELS=['observed','inferred','assumed'];
const STATUSES=['met','unmet','untested'];
const LEVELS=['prompt','skill','trigger','workflow','business'];
const LEVEL_NAMES={prompt:'Prompt',skill:'Skill',trigger:'Trigger',workflow:'Workflow',business:'Business capability'};
const CONSEQUENCES=['low','medium','high'];
const PROMOTE_AFTER=2;
const DAY_TITLES=['Baseline & product outcome','Prompt-to-intent','Success criteria','Constraints','Stop conditions','Intent check','First usable slice','Context map','Curated context','Progressive intent','Data model','Persistence','Usability','Challenge pass','Fresh-session review','Evidence labels','Deterministic checks','Guardrails','Failure handling','Architecture view','Reusable skill','Review skill','Capability ladder','Metrics','Onboarding','Polish','Final adversarial review','Release'];

const str=v=>typeof v==='string'?v:'';
const iso=now=>new Date(now).toISOString();

function builtInCapabilities(){
  return [
    {id:'cap-intent-check',name:'Intent check',level:'skill',file:'skills/intent-check.md',
     purpose:'Use before implementation to find weaknesses in an intent.',
     procedure:'Read the intent. Do not perform the task. List, in order of importance:\nAmbiguity or multiple interpretations\nMissing inputs, constraints, outputs, or success criteria\nContradictions\nCriteria that cannot actually be checked\nMissing stop condition\nThen propose only the smallest edits needed.',
     output:'A short ordered list followed by a minimally revised intent.',
     checks:'Do not add features or implementation details that are not necessary to remove ambiguity.',
     owner:'Project owner',version:'1.0',uses:[],promoted:false,builtIn:true},
    {id:'cap-evidence-review',name:'Evidence-first review',level:'skill',file:'skills/evidence-first-review.md',
     purpose:"Review completed work against its intent without inheriting the builder's assumptions.",
     procedure:'Read the stated intent first.\nInspect the resulting change.\nMark every success criterion: met / unmet / untested.\nReport findings with direct evidence.\nIdentify what was not checked.\nChallenge likely failure modes without inventing defects.',
     output:'Structured findings plus a gap statement.',
     checks:'Review only. Do not modify the work while reviewing it.',
     owner:'Project owner',version:'1.0',uses:[],promoted:false,builtIn:true}
  ];
}
function emptyState(now){
  return {version:STATE_VERSION,projects:[{id:DEFAULT_PROJECT_ID,name:'My project',created:iso(now)}],intents:[],evidence:[],reviews:[],capabilities:builtInCapabilities(),progress:{}};
}

// Constructors: the caller supplies the id and the time, so the same input always gives the same record.
function makeIntent(f,c){
  return {id:c.id,projectId:c.projectId||DEFAULT_PROJECT_ID,created:iso(c.now),
    outcome:str(f.outcome).trim(),inputs:str(f.inputs).trim(),outputs:str(f.outputs).trim(),constraints:str(f.constraints).trim(),criteria:str(f.criteria).trim(),stop:str(f.stop).trim(),
    consequence:CONSEQUENCES.includes(f.consequence)?f.consequence:'',approver:str(f.approver).trim()};
}
function makeEvidence(f,c){
  return {id:c.id,intentId:f.intentId,claim:str(f.claim).trim(),label:f.label,source:str(f.source).trim(),created:iso(c.now)};
}
function makeReview(f,c){
  return {id:c.id,intentId:f.intentId,created:iso(c.now),
    criteria:(Array.isArray(f.criteria)?f.criteria:[]).map(x=>({text:str(x&&x.text),status:x&&x.status})),
    findings:(Array.isArray(f.findings)?f.findings:[]).map(x=>({text:str(x&&x.text),label:x&&x.label})),
    notChecked:str(f.notChecked).trim(),summary:str(f.summary).trim()};
}
function makeCapability(f,c){
  return {id:c.id,name:str(f.name).trim(),purpose:str(f.purpose).trim(),procedure:str(f.procedure),output:str(f.output),checks:str(f.checks),
    owner:str(f.owner).trim()||'You',version:str(f.version).trim()||'0.1',level:f.level,file:str(f.file),uses:[],promoted:false,builtIn:false};
}

// Validators: return a list of problems (an empty list means the record is valid).
function problemsIntent(i){
  if(!i||typeof i!=='object')return ['not an object'];
  const p=[];
  if(typeof i.id!=='number'&&typeof i.id!=='string')p.push('no id');
  if(!str(i.outcome).trim())p.push('no outcome');
  return p;
}
function problemsEvidence(e,intentIds){
  if(!e||typeof e!=='object')return ['not an object'];
  const p=[];
  if(!str(e.claim).trim())p.push('no claim');
  if(!LABELS.includes(e.label))p.push('label is not observed, inferred, or assumed');
  if(!intentIds.includes(e.intentId))p.push('intent does not exist');
  return p;
}
function problemsReview(r,intentIds){
  if(!r||typeof r!=='object')return ['not an object'];
  const p=[];
  if(!intentIds.includes(r.intentId))p.push('intent does not exist');
  if(!Array.isArray(r.criteria)||r.criteria.some(x=>!x||!STATUSES.includes(x.status)))p.push('a criterion status is not met, unmet, or untested');
  if(r.findings!==undefined&&(!Array.isArray(r.findings)||r.findings.some(x=>!x||!str(x.text).trim()||!LABELS.includes(x.label))))p.push('a finding has no text or a label that is not observed, inferred, or assumed');
  return p;
}
function problemsCapability(c){
  if(!c||typeof c!=='object')return ['not an object'];
  const p=[];
  if(!str(c.id)||!str(c.name).trim())p.push('no id or name');
  if(!LEVELS.includes(c.level))p.push('level is not prompt, skill, trigger, workflow, or business');
  if(!Array.isArray(c.uses)||c.uses.some(u=>!u||typeof u.success!=='boolean'))p.push('a use has no success flag');
  return p;
}

// Turn whatever was stored (old shape, new shape, or damage) into a valid state, counting what was dropped.
function normalizeState(raw,now){
  const base=emptyState(now);
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {state:base,skipped:0};
  const list=v=>Array.isArray(v)?v:[];
  let skipped=0;
  ['projects','intents','evidence','reviews','capabilities'].forEach(k=>{if(raw[k]!==undefined&&!Array.isArray(raw[k]))skipped++;});
  if(raw.progress!==undefined&&(raw.progress===null||typeof raw.progress!=='object'||Array.isArray(raw.progress)))skipped++;
  const keep=(arr,bad,fix)=>list(arr).filter(x=>{if(bad(x).length){skipped++;return false;}return true;}).map(fix||(x=>x));
  const projects=list(raw.projects).filter(p=>p&&typeof p.id==='string'&&str(p.name).trim()).map(p=>({id:p.id,name:p.name,created:str(p.created)}));
  const intents=keep(raw.intents,problemsIntent,i=>Object.assign({},i,{
    projectId:str(i.projectId)||DEFAULT_PROJECT_ID,
    outcome:str(i.outcome),inputs:str(i.inputs),outputs:str(i.outputs),constraints:str(i.constraints),criteria:str(i.criteria),stop:str(i.stop),
    consequence:CONSEQUENCES.includes(i.consequence)?i.consequence:'',approver:str(i.approver)}));
  const ids=intents.map(i=>i.id);
  const evidence=keep(raw.evidence,e=>problemsEvidence(e,ids));
  const reviews=keep(raw.reviews,r=>problemsReview(r,ids),r=>Object.assign({},r,{findings:Array.isArray(r.findings)?r.findings:[]}));
  const stored=keep(raw.capabilities,problemsCapability,c=>Object.assign({},c,{uses:c.uses.map(u=>({date:str(u.date),success:u.success})),promoted:c.promoted===true}));
  const builtIns=builtInCapabilities().map(b=>{
    const s=stored.find(c=>c.id===b.id);
    return s?Object.assign({},b,{level:s.level,uses:s.uses,promoted:s.promoted}):b;
  });
  const capabilities=builtIns.concat(stored.filter(c=>!builtIns.some(b=>b.id===c.id)));
  const progress={};
  if(raw.progress&&typeof raw.progress==='object'&&raw.progress.days&&typeof raw.progress.days==='object'){
    progress.days={};
    for(let d=1;d<=28;d++){if(raw.progress.days[d]===true)progress.days[d]=true;}
  }
  return {state:{version:STATE_VERSION,projects:projects.length?projects:base.projects,intents,evidence,reviews,capabilities,progress},skipped};
}

// The sample project: every record type, so a new user can see the whole model at once.
function sampleState(now){
  const intents=sampleIntents(now);
  const first=intents[0];
  const ev=(n,label,claim,source)=>makeEvidence({intentId:first.id,claim,label,source},{id:'ev-'+now+'-'+n,now});
  const evidence=[
    ev(0,'observed','The Reports page shows an "Export CSV" button.','Checked in the running app'),
    ev(1,'inferred','The 5-second target is reachable because the query filters by user and month.','Reasoned from the query plan'),
    ev(2,'assumed','Customers open the CSV in a spreadsheet application.','Not yet confirmed with a customer')
  ];
  const criteria=first.criteria.split('\n');
  const statuses=['met','met','untested','unmet'];
  const reviews=[makeReview({intentId:first.id,
    criteria:criteria.map((text,i)=>({text,status:statuses[i]})),
    findings:[{text:'The Reports page shows an "Export CSV" button.',label:'observed'},{text:'The export is probably fast enough because the query filters by user and month.',label:'inferred'},{text:'Customers can open the CSV in a spreadsheet application.',label:'assumed'}],
    notChecked:'Behavior with more than 10,000 rows.',
    summary:'Two of four criteria are met. The error message is not shown when the month has no data.'},{id:'rv-'+now+'-0',now})];
  const day=iso(now);
  const capabilities=builtInCapabilities().map((b,i)=>Object.assign({},b,i===0
    ?{uses:[{date:day,success:true},{date:day,success:true}],promoted:true}
    :{uses:[{date:day,success:true}],promoted:false}));
  const days={};for(let d=1;d<=8;d++)days[d]=true;
  return {version:STATE_VERSION,projects:[{id:DEFAULT_PROJECT_ID,name:'My project',created:day}],intents,evidence,reviews,capabilities,progress:{days}};
}

// A new intent id: never equal to an existing numeric id, even when two intents are saved in the same millisecond.
function nextIntentId(intents,now){
  return intents.reduce((m,i)=>typeof i.id==='number'&&i.id>=m?i.id+1:m,now);
}

// Epistemic status: how many claims are observed, inferred, or assumed, and how many assumptions still need confirming.
function labelCounts(evidence){
  const c={observed:0,inferred:0,assumed:0};
  evidence.forEach(e=>{if(c[e.label]!==undefined)c[e.label]++;});
  return c;
}
function epistemicSummary(evidence){
  const n=evidence.length;
  if(!n)return 'No claims recorded yet.';
  const c=labelCounts(evidence);
  const many=(k,w)=>k+' '+w+(k===1?'':'s');
  let t=many(n,'claim')+': '+c.observed+' observed, '+c.inferred+' inferred, '+c.assumed+' assumed.';
  if(c.assumed>0)t+=' '+many(c.assumed,'assumed claim')+' still '+(c.assumed===1?'needs':'need')+' confirming.';
  return t;
}
// A new evidence id that no existing record has.
function nextEvidenceId(evidence,now){
  let n=0;
  while(evidence.some(e=>e.id==='ev-'+now+'-'+n))n++;
  return 'ev-'+now+'-'+n;
}

// Readiness: eight deterministic checks. Nothing is stored; the score is worked out from the intent each time.
const CHECK_RULES={
  outcome:'context/business-rules.md, rule 1',inputs:'context/glossary.md, Inputs',outputs:'context/glossary.md, Outputs',
  constraints:'context/business-rules.md, rule 3',criteria:'context/business-rules.md, rule 2',stop:'context/business-rules.md, rule 3',
  checkable:'context/business-rules.md, rule 2',clear:'context/business-rules.md, rule 2'
};
const REQUIRED_CHECKS=['outcome','constraints','criteria','stop','checkable'];
function checkIntent(intent){
  const i=intent&&typeof intent==='object'?intent:{};
  const t=k=>(typeof i[k]==='string'?i[k]:(i[k]==null?'':String(i[k]))).trim();
  const lines=t('criteria').split('\n').map(l=>l.trim()).filter(Boolean);
  const bad=lines.filter(l=>!isCheckable(l));
  const vague=[...new Set(findVague(t('outcome')+' '+t('stop')))];
  const quote=l=>'"'+(l.length>60?l.slice(0,57)+'…':l)+'"';
  const has=(k,label,fix)=>({id:k,label,pass:t(k)!=='',message:t(k)!==''?'Present.':fix});
  const checks=[
    has('outcome','Outcome','Say what will be true when this is done, and why it matters.'),
    has('inputs','Inputs','Name what may be used: data, files, links, or systems.'),
    has('outputs','Outputs','Name what will exist when this is done, and where.'),
    has('constraints','Constraints','Add at least one boundary that must hold.'),
    has('criteria','Success criteria','Add success criteria that someone can mark pass or fail.'),
    has('stop','Stop condition','Say exactly when the work is finished.'),
    {id:'checkable',label:'Every criterion can be checked',pass:lines.length>0&&bad.length===0,
     message:lines.length===0?'Add success criteria first.':bad.length===0?'Every criterion can be marked pass or fail.':'Cannot be marked pass or fail as written: '+bad.slice(0,3).map(quote).join('; ')+(bad.length>3?' and '+(bad.length-3)+' more':'')+'.'},
    {id:'clear',label:'No vague words in the outcome or stop condition',pass:vague.length===0,
     message:vague.length===0?'No vague words found.':'Vague words: '+vague.map(w=>'"'+w+'"').join(', ')+'. Replace each with a check someone can perform.'}
  ].map(c=>Object.assign(c,{required:REQUIRED_CHECKS.includes(c.id),source:CHECK_RULES[c.id]}));
  const passed=checks.filter(c=>c.pass).length;
  return {checks,score:Math.round(100*passed/checks.length),ready:checks.every(c=>!c.required||c.pass)};
}

// Guardrails: the minimum checks expected at each consequence level. Each level adds to the one below.
const GUARDRAIL_MINIMUMS={
  low:[
    {id:'self',kind:'manual',text:'Check the result against the success criteria yourself.'},
    {id:'evidence',kind:'auto',text:'Record at least one evidence claim.'}],
  medium:[
    {id:'ready',kind:'auto',text:'The readiness check passes (Ready).'},
    {id:'review',kind:'auto',text:'Record a review of the result, with each success criterion marked met, unmet, or untested.'}],
  high:[
    {id:'assumed',kind:'auto',text:'Confirm every assumed claim, so none is left labelled assumed.'},
    {id:'approval',kind:'approval',text:'A named person approves before the change ships.'}]
};
const GUARDRAIL_SOURCE='context/business-rules.md, rule 6; context/glossary.md, Guardrail';
function guardrailStatus(intent,state){
  const level=intent&&CONSEQUENCES.includes(intent.consequence)?intent.consequence:'';
  if(!level)return {level:'',items:[],openCount:0,allMet:false};
  const mine=e=>String(e.intentId)===String(intent.id);
  const evidence=state.evidence.filter(mine);
  const facts={
    evidence:evidence.length>0,
    ready:checkIntent(intent).ready,
    review:state.reviews.some(mine),
    assumed:labelCounts(evidence).assumed===0,
    approval:str(intent.approver).trim()!==''};
  const items=[];
  CONSEQUENCES.slice(0,CONSEQUENCES.indexOf(level)+1).forEach(l=>GUARDRAIL_MINIMUMS[l].forEach(m=>{
    items.push({id:m.id,level:l,kind:m.kind,text:m.text,met:m.kind==='manual'?null:facts[m.id]});
  }));
  const openCount=items.filter(x=>x.met===false).length;
  return {level,items,openCount,allMet:openCount===0};
}

// Failures: what happened, what to do, and which recovery actions to offer. Pure, so it can be tested without a page.
function describeProblem(info){
  const i=info||{};
  if(i.failed)return {kind:'failed',text:'Something went wrong in the app. Reload the page. If it happens again, download a copy of your data first.',actions:['download','dismiss']};
  if(i.blocked)return {kind:'blocked',text:'This browser is blocking local storage, so nothing you do here will be saved. Allow site data for this page, or try another browser.',actions:['dismiss']};
  if(i.corrupt)return {kind:'corrupt',text:'Your saved data could not be read, so the app started with an empty project. A copy of the unreadable data was kept. Download it, or start with an empty project.',actions:['download','empty','dismiss']};
  if(i.skipped>0)return {kind:'skipped',text:(i.skipped===1?'1 saved record was':i.skipped+' saved records were')+' invalid and left out. A copy of your original data was kept. Download it if you need '+(i.skipped===1?'that record':'those records')+'.',actions:['download','dismiss']};
  return null;
}

// The operating model shown on the Overview view: six stages, each with a live count from the stored data.
// `count` is the number shown large; `rest` is the words that follow it ("3" + " saved, 2 ready").
function flowStages(state,contextCount){
  const ready=state.intents.filter(i=>checkIntent(i).ready).length;
  const assumed=labelCounts(state.evidence).assumed;
  const days=Object.keys((state.progress&&state.progress.days)||{}).length;
  const promoted=state.capabilities.filter(c=>c.promoted).length;
  const one=(n,w)=>n===1?w:w+'s';
  return [
    {id:'intent',name:'Intent',what:'Write what you want, and how you will know it is done.',count:state.intents.length,rest:' saved, '+ready+' ready',view:'intents'},
    {id:'context',name:'Context',what:'Keep the rules and terms the work follows in files.',count:contextCount,rest:' '+one(contextCount,'file')+' the app follows',view:'references'},
    {id:'build',name:'Build',what:'Do the work the intent asks for, and nothing more.',count:days,rest:' of 28 days done',view:'progress'},
    {id:'evidence',name:'Evidence',what:'Record what happened, and label each claim.',count:state.evidence.length,rest:' '+one(state.evidence.length,'claim')+', '+assumed+' assumed',view:'review'},
    {id:'review',name:'Review',what:'Check the result against the intent.',count:state.reviews.length,rest:' '+one(state.reviews.length,'review')+' recorded',view:'review'},
    {id:'capability',name:'Capability',what:'Keep what you repeat, once it has worked more than once.',count:promoted,rest:' of '+state.capabilities.length+' promoted',view:'capabilities'}
  ];
}

// Reviews: a new id, a one-line description of a review, and the worked examples shown on capability cards.
function nextReviewId(reviews,now){
  let n=0;
  while(reviews.some(r=>r.id==='rv-'+now+'-'+n))n++;
  return 'rv-'+now+'-'+n;
}
function clip(t,n){
  const x=str(t);
  return x.length>n?x.slice(0,n-3)+'…':x;
}
function describeReview(review,intent){
  const n=s=>review.criteria.filter(c=>c.status===s).length;
  const f=labelCounts((review.findings||[]).map(x=>({label:x.label})));
  const total=(review.findings||[]).length;
  return 'Review of "'+clip(intent&&intent.outcome,60)+'": '+n('met')+' met, '+n('unmet')+' unmet, '+n('untested')+' untested. '
    +total+' '+(total===1?'finding':'findings')+' ('+f.observed+' observed, '+f.inferred+' inferred, '+f.assumed+' assumed). Not checked: '+str(review.notChecked);
}
function sampleUsage(capId){
  const st=sampleState(0);
  if(capId==='cap-evidence-review'){
    const r=st.reviews[0];
    return describeReview(r,st.intents.find(i=>i.id===r.intentId));
  }
  if(capId==='cap-intent-check'){
    const d=st.intents[2],r=checkIntent(d);
    const todo=r.checks.filter(c=>c.required&&!c.pass).map(c=>c.label.toLowerCase());
    return 'Run on "'+clip(d.outcome,60)+'": '+r.score+'%, '+(r.ready?'ready':'not ready')+'.'+(todo.length?' Fix '+todo.length+' required '+(todo.length===1?'item':'items')+': '+todo.join(', ')+'.':'');
  }
  return '';
}

// The capability ladder, and the rule for promotion (business rule 5: only after repeated successful use).
const LADDER=[
  {id:'prompt',what:'A request you typed once.'},
  {id:'skill',what:'A written procedure you can reuse.'},
  {id:'trigger',what:'A skill that starts when a condition is met.'},
  {id:'workflow',what:'Several skills and triggers chained to finish a job.'},
  {id:'business',what:'A workflow the organisation relies on and owns.'}
];
function ladderCounts(capabilities){
  const c={};
  LEVELS.forEach(l=>{c[l]=0;});
  capabilities.forEach(x=>{if(c[x.level]!==undefined)c[x.level]++;});
  return c;
}
function promotionStatus(cap){
  const successes=cap.uses.filter(u=>u.success).length;
  const missing=Math.max(0,PROMOTE_AFTER-successes);
  return {successes,failures:cap.uses.length-successes,needed:PROMOTE_AFTER,missing,can:missing===0&&!cap.promoted};
}
function withUse(cap,success,now){
  return Object.assign({},cap,{uses:cap.uses.concat({date:iso(now),success:success===true})});
}
function tryPromote(cap){
  if(cap.promoted)return {cap,ok:false,message:'Already promoted.'};
  const s=promotionStatus(cap);
  if(s.missing>0)return {cap,ok:false,message:'Promotion needs '+PROMOTE_AFTER+' successful uses. '+s.missing+' more '+(s.missing===1?'use is':'uses are')+' needed. Source: context/business-rules.md, rule 5.'};
  return {cap:Object.assign({},cap,{promoted:true}),ok:true,message:'Promoted: '+clip(cap.name,60)+'.'};
}
function nextCapabilityId(capabilities,now){
  let n=0;
  while(capabilities.some(c=>c.id==='cap-user-'+now+'-'+n))n++;
  return 'cap-user-'+now+'-'+n;
}

// Outcome metrics: four counts that show results, not activity. Nothing here counts views, clicks, time, or saves.
function metrics(state){
  const ready=state.intents.filter(i=>checkIntent(i).ready).length;
  const promoted=state.capabilities.filter(c=>c.promoted).length;
  const days=Object.keys((state.progress&&state.progress.days)||{}).length;
  return [
    {id:'ready',label:'Intents ready',value:ready,of:state.intents.length,why:'A ready intent can be built and checked without guessing.'},
    {id:'reviews',label:'Reviews completed',value:state.reviews.length,of:null,why:'A review is a result checked against its intent.'},
    {id:'promoted',label:'Capabilities promoted',value:promoted,of:state.capabilities.length,why:'Promoted work has been reused successfully more than once.'},
    {id:'progress',label:'28-day progress',value:days,of:28,why:'The days of the plan you have finished.'}
  ];
}
