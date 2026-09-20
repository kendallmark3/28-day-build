// Day 26 polish audit: measures ux-standard.md and related rules on every view, dialog, and the banner.
// It is also the permanent check: every rule must pass. Set AUDIT_JSON=<file> to save the results as JSON.
require('./h.js')('day26',async c=>{
  const {page,rec,fs}=c;
  const VIEWS=['start','intents','review','capabilities','overview','references','about'];
  const results=[];const note=(rule,where,ok,detail)=>{results.push({rule,where,ok,detail});};
  const measure=()=>page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);const p=m[1].split(',').map(x=>parseFloat(x));return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
    const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
    const bgOf=e=>{let x=e;while(x){const c=parse(getComputedStyle(x).backgroundColor);if(c.a>0.5)return c;x=x.parentElement;}return {r:255,g:255,b:255,a:1};};
    const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
    const scope=document.querySelector('dialog[open]')||document.body;
    const inScope=e=>scope===document.body?true:scope.contains(e);
    const shown=e=>vis(e)&&inScope(e)&&!e.closest('[hidden]');
    const out={contrast:[],small:[],fonts:new Set(),noname:[],headings:[],filled:[],ids:[]};
    // contrast
    document.querySelectorAll('body *').forEach(e=>{
      if(!shown(e))return;
      if(['SCRIPT','STYLE','OPTION'].includes(e.tagName))return;
      const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
      const control=['INPUT','TEXTAREA','SELECT'].includes(e.tagName)&&!['checkbox'].includes(e.type);
      if(!own&&!control)return;
      const s=getComputedStyle(e);const fg=parse(s.color);const bg=bgOf(e);const px=parseFloat(s.fontSize);const bold=parseInt(s.fontWeight)>=700;
      const large=px>=24||(px>=18.66&&bold);const need=large?3:4.5;const r=ratio(fg,bg);
      if(r<need)out.contrast.push((e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ')[0]:''))+' '+r.toFixed(2)+' (needs '+need+') "'+(e.textContent||e.value||'').trim().slice(0,24)+'"');
      if(!e.closest('code,pre,#jiraText'))out.fonts.add(s.fontFamily.split(',')[0].replace(/["']/g,'').trim());
    });
    // buttons
    document.querySelectorAll('button').forEach(b=>{if(!shown(b))return;const h=b.getBoundingClientRect().height;if(h<40)out.small.push((b.id?'#'+b.id:b.textContent.trim().slice(0,24))+' '+Math.round(h)+'px');});
    document.querySelectorAll('button:not(.secondary):not(.danger)').forEach(b=>{if(shown(b))out.filled.push(b.textContent.trim());});
    // names
    document.querySelectorAll('input,textarea,select').forEach(f=>{if(!shown(f)||f.type==='hidden')return;const named=(f.labels&&f.labels.length)||f.getAttribute('aria-label')||f.getAttribute('aria-labelledby')||f.closest('label');if(!named)out.noname.push(f.id||f.name||f.tagName);});
    // headings
    let last=0;document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{if(!shown(h))return;const n=+h.tagName[1];if(last&&n>last+1)out.headings.push(h.tagName+' after h'+last+': '+h.textContent.slice(0,24));last=n;});
    // links use the app link colour (#a4400f, navigation excepted) (the navigation is excepted)
    const lc={};document.querySelectorAll('a').forEach(a=>{if(!shown(a)||a.closest('nav'))return;const col=getComputedStyle(a).color;if(col!=='rgb(164, 64, 15)')(lc[col]=lc[col]||[]).push(a.textContent.trim().slice(0,24));});out.linkColours=Object.entries(lc).map(([k,v])=>k+' '+v.join(','));
    // ids
    const seen={};document.querySelectorAll('[id]').forEach(e=>{seen[e.id]=(seen[e.id]||0)+1;});Object.keys(seen).filter(k=>seen[k]>1).forEach(k=>out.ids.push(k));
    out.fonts=[...out.fonts];
    return out;
  });
  const focusRing=async(limit)=>{const bad=[];const seen=new Set();await page.evaluate(()=>{document.activeElement&&document.activeElement.blur();});
    for(let i=0;i<limit;i++){await page.keyboard.press('Tab');const r=await page.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {k:(e.id||e.tagName+'.'+String(e.className).split(' ')[0]+':'+(e.textContent||'').trim().slice(0,16)),ok:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2,vis:r.width>0&&r.height>0};});
      if(!r||!r.vis)continue;if(seen.has(r.k))break;seen.add(r.k);if(!r.ok)bad.push(r.k);}
    return {n:seen.size,bad};};
  for(const w of [375,1280]){
    const h=w===375?812:800;
    await c.start(null,w,h);await page.click('#resetSample');await page.click('#resetConfirm');await c.wait(120);
    for(const v of VIEWS){
      await c.view(v);await c.wait(100);
      const m=await measure();const where=v+'@'+w;
      note('contrast',where,m.contrast.length===0,m.contrast.join('; '));
      note('button height >= 40px',where,m.small.length===0,m.small.join('; '));
      note('one font family',where,m.fonts.length===1,m.fonts.join(' | '));
      note('fields have names',where,m.noname.length===0,m.noname.join(', '));
      note('heading levels do not skip',where,m.headings.length===0,m.headings.join('; '));
      note('at most one filled button',where,m.filled.length<=1,m.filled.join(', '));
      note('no duplicate ids',where,m.ids.length===0,m.ids.join(', '));
      note('links use the app link colour (#a4400f, navigation excepted)',where,m.linkColours.length===0,m.linkColours.join(' | '));
      const f=await focusRing(70);note('focus outline >= 2px',where,f.bad.length===0,f.bad.join(', ')+' ('+f.n+' focusable checked)');
    }
    // empty-state screens (a fresh project shows different elements than the sample project)
    await c.start(null,w,h);
    for(const v of ['intents','review','capabilities','overview']){
      await c.view(v);await c.wait(80);
      const m2=await measure();const where2='empty '+v+'@'+w;
      note('contrast',where2,m2.contrast.length===0,m2.contrast.join('; '));
      note('button height >= 40px',where2,m2.small.length===0,m2.small.join('; '));
      note('one font family',where2,m2.fonts.length===1,m2.fonts.join(' | '));
      note('fields have names',where2,m2.noname.length===0,m2.noname.join(', '));
      note('at most one filled button',where2,m2.filled.length<=1,m2.filled.join(', '));
      note('links use the app link colour (#a4400f, navigation excepted)',where2,m2.linkColours.length===0,m2.linkColours.join(' | '));
    }
    await c.start(null,w,h);await page.click('#resetSample');await page.click('#resetConfirm');await c.wait(120);
    // dialogs
    await c.view('intents');
    await page.click('#openJira');await c.wait(100);
    let m=await measure();note('contrast',"jira dialog step 1@"+w,m.contrast.length===0,m.contrast.join('; '));note('button height >= 40px',"jira dialog step 1@"+w,m.small.length===0,m.small.join('; '));note('fields have names',"jira dialog step 1@"+w,m.noname.length===0,m.noname.join(', '));
    await page.click('#jiraBuild');await c.wait(100);m=await measure();note('contrast',"jira dialog step 2@"+w,m.contrast.length===0,m.contrast.join('; '));note('button height >= 40px',"jira dialog step 2@"+w,m.small.length===0,m.small.join('; '));note('fields have names',"jira dialog step 2@"+w,m.noname.length===0,m.noname.join(', '));note('at most one filled button','jira dialog step 2@'+w,m.filled.length<=1,m.filled.join(', '));
    await page.keyboard.press('Escape');
    await page.click('#resetSample');await c.wait(100);m=await measure();note('contrast','reset dialog@'+w,m.contrast.length===0,m.contrast.join('; '));note('button height >= 40px','reset dialog@'+w,m.small.length===0,m.small.join('; '));
    await page.keyboard.press('Escape');
    // banner
    await c.start('{not json',w,h);m=await measure();note('contrast','error banner@'+w,m.contrast.length===0,m.contrast.join('; '));note('button height >= 40px','error banner@'+w,m.small.length===0,m.small.join('; '));
  }
  // horizontal scroll at four widths, every view, sample data
  for(const w of [320,375,768,1280]){
    await c.start(null,w,w<500?700:800);await page.click('#resetSample');await page.click('#resetConfirm');await c.wait(120);
    const bad=[];for(const v of VIEWS){await c.view(v);await c.wait(60);const s=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(s>0)bad.push(v+' (+'+s+'px)');}
    note('no horizontal scroll',w+'px, all views',bad.length===0,bad.join(', '));
  }
  // report
  const rules=[...new Set(results.map(r=>r.rule))];
  for(const rule of rules){const rs=results.filter(r=>r.rule===rule);const bad=rs.filter(r=>!r.ok);
    rec('P '+rule+' ('+rs.length+' places measured)',bad.length===0,bad.length?bad.slice(0,6).map(b=>b.where+': '+b.detail).join(' || '):'');}
  if(process.env.AUDIT_JSON)fs.writeFileSync(process.env.AUDIT_JSON,JSON.stringify(results,null,1));
});
