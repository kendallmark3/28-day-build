require('./h.js')('day09',async c=>{
  const {page,rec,REPO,fs}=c;const ctx=f=>fs.readFileSync(REPO+'/context/'+f,'utf8');
  await c.start(null);
  const ux=ctx('ux-standard.md');
  const vague=await page.evaluate(t=>findVague(t),ux);
  const rules=ux.split('\n').filter(l=>l.startsWith('- '));
  rec('D9-1 ux-standard.md has no vague word from the app\'s list',vague.length===0,JSON.stringify(vague));
  rec('D9-2 ux-standard.md has 6 rules and each names a check (a number, "at most", "every", "each", or a named message/link)',rules.length===6&&rules.every(r=>/\d|at most|every|each|no horizontal scroll|says|secondary/i.test(r)),rules.length);
  // example matches the app's first sample intent
  const ex=ctx('example-intent.md');
  const part=h=>{const m=ex.match(new RegExp('## '+h+'\\n([\\s\\S]*?)(?=\\n## |$)'));return m?m[1].trim():null;};
  const fromFile={outcome:part('Intent'),inputs:part('Inputs'),outputs:part('Outputs'),constraints:part('Constraints'),criteria:part('Success criteria'),stop:part('Stop when')};
  for(const k of Object.keys(fromFile)){if(k!=='outcome')fromFile[k]=fromFile[k].split('\n').map(l=>l.replace(/^- /,'')).join('\n');}
  const sample=await page.evaluate(()=>{const s=sampleIntents(0)[0];return {outcome:s.outcome,inputs:s.inputs,outputs:s.outputs,constraints:s.constraints,criteria:s.criteria,stop:s.stop};});
  const diff=Object.keys(sample).filter(k=>sample[k]!==fromFile[k]);
  rec('D9-3 example-intent.md\'s six parts equal the app\'s first sample intent (drift guard)',diff.length===0,JSON.stringify(diff));
  const why=part('Why this works')||'';
  const whyLines=why.split('\n').filter(l=>l.startsWith('- **'));
  rec('D9-4 "Why this works" has one line for each of the six parts',['Intent','Inputs','Outputs','Constraints','Success criteria','Stop when'].every(n=>whyLines.some(l=>l.startsWith('- **'+n+':**'))),whyLines.length);
  // smaller
  const six=['architecture.md','business-rules.md','glossary.md','non-goals.md','security.md','ux-standard.md'];
  const lines=six.reduce((a,f)=>a+ctx(f).replace(/\n$/,'').split('\n').length,0);
  rec('D9-5 the six existing context files have fewer lines than the 97 before',lines<97,lines+' lines');
  const ng=ctx('non-goals.md');
  rec('D9-6 removed duplicates are gone and the merged non-goal is present',!/should demonstrate the method before adding platform complexity/.test(ng)&&!/does not store credentials/.test(ng)&&/not a Claude chat clone, an autonomous agent platform, or an enterprise workflow engine/.test(ng),'');
  rec('D9-7 the References view lists example-intent.md with a purpose line',await (async()=>{await c.go('#references');return page.$$eval('#contextList li',ls=>ls.some(l=>/example-intent\.md/.test(l.textContent)&&/worked example/.test(l.textContent)));})(),'');
});
