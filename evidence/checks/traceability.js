// Criteria traceability: every success criterion in the archived and the active intent maps to at least one automated check.
// Usage: node traceability.js [--write]   (no browser needed). Exits 1 if a criterion has no check, or a named check does not exist.
const fs=require('fs'),path=require('path');
const REPO=path.resolve(__dirname,'../..');
const R='regression:',
archive={1:[R+'C1'],2:[R+'C2a',R+'C2b',R+'C3'],3:[R+'C3',R+'S2'],4:[R+'C4'],5:[R+'C5',R+'C5b'],6:[R+'C6a',R+'C6b'],7:[R+'C7a',R+'C7b'],8:[R+'C8'],
 9:[R+'N1a',R+'N2a',R+'N2b',R+'N2c'],10:[R+'N2a',R+'N2b',R+'N2c'],11:[R+'N3a',R+'N3b',R+'N3c',R+'N3d'],12:[R+'N4'],13:[R+'N5',R+'C6a'],14:[R+'N6',R+'N6b'],
 15:[R+'N7a',R+'N7d',R+'G1b'],16:[R+'N7b',R+'N7c',R+'N7e'],17:[R+'S1',R+'S3',R+'S4',R+'C10d',R+'C12c'],18:[R+'S2'],19:[R+'S5'],20:[R+'C9a',R+'C9b',R+'C9c',R+'C9d'],
 21:[R+'C10a',R+'C10b',R+'C10c'],22:[R+'C11'],23:[R+'C12a',R+'C12b',R+'C12c'],24:[R+'J1a',R+'J1b',R+'J1c'],25:[R+'J2a',R+'J2b'],26:[R+'J3a',R+'J3b',R+'J3c',R+'J3d',R+'J3e'],
 27:[R+'J4'],28:[R+'J5a',R+'J5b'],29:[R+'J6a',R+'J6b',R+'J6c',R+'J6d'],30:[R+'J7'],31:[R+'J8a',R+'J8b',R+'J8c',R+'J8d'],32:[R+'J9a',R+'J9b',R+'J9c',R+'J9d'],
 33:[R+'J10a',R+'J10b',R+'J11'],34:[R+'J12',R+'J13'],35:[R+'D1a',R+'D1b',R+'D2',R+'D3'],36:[R+'D2',R+'D4',R+'D5a',R+'D8'],37:[R+'D9'],38:[R+'G1a',R+'G1b',R+'G1c',R+'G2'],
 39:[R+'G3a',R+'G3b',R+'G3c',R+'G3d',R+'G4'],40:[R+'G6'],41:[R+'R0',R+'R1a',R+'R1b',R+'R1c',R+'R1d'],42:[R+'R2a',R+'R2b',R+'R2c',R+'R3'],43:[R+'R4',R+'R8'],44:[R+'R5a',R+'R5b'],
 45:[R+'R6',R+'R7'],46:[R+'R9',R+'R10'],47:[R+'U1',R+'U2',R+'U3',R+'U4'],48:[R+'U4'],49:[R+'U5a',R+'U5b'],50:[R+'U8',R+'U9'],51:[R+'U10'],52:['day09:D9-1','day09:D9-2'],53:['day09:D9-3','day09:D9-4']};
const active={1:['day11:M1'],2:['day11:M2a','day11:M2b','day11:M2c'],3:['day11:M3a','day11:M3b','day11:M3c'],4:['day11:M4a','day11:M4b'],5:['day11:M5a','day11:M5b'],6:['day11:M6a','day11:M6b','day11:M6c','day11:M6d'],7:['day11:M7','day11:M8'],
 8:['day14:A1'],9:['day14:A3'],10:['day14:A4'],11:['day14:A5'],12:['day14:A7'],13:['day14:A12'],
 14:['day16:E1a','day16:E1b'],15:['day16:E2'],16:['day16:E3a','day16:E3b','day16:E3c'],17:['day16:E4'],18:['day16:E6a','day16:E6b','day16:E6c'],19:['day16:E7a','day16:E7b'],20:['day16:E8','day16:E9a','day16:E11'],21:['day16:E12'],22:['day16:E10'],23:['day16:E14'],
 24:['day17:V1a'],25:['day17:V1b','day17:V1c'],26:['day17:V2a','day17:V2b','day17:V2c'],27:['day17:V4a','day17:V4b'],28:['day17:V3'],29:['day17:V5a','day17:V5b'],
 30:['day18:G1a','day18:G1b','day18:G1c'],31:['day18:G3a','day18:G3b','day18:G3c'],32:['day18:G5a','day18:G5b','day18:G5c'],33:['day18:G4a','day18:G4b','day18:G4c','day18:G4d'],34:['day18:G2a','day18:G2b','day18:G2c'],35:['day18:G7','day18:G3b'],
 36:['day19:P1a','day19:P1b','day19:P1c'],37:['day19:F1a','day19:F1b','day19:F1c'],38:['day19:F2','day19:F3'],39:['day19:F4'],40:['day19:F5a','day19:F5b','day19:F5c'],41:['day19:F6'],42:['day19:F7a','day19:F8'],43:['day19:F9','day19:F10a','day19:F11','day19:F12a','day19:F12b'],
 44:['day20:O1a','day20:O2a'],45:['day20:O2b','day20:O4'],46:['day20:O3a','day20:O3b'],47:['day20:O1a','day20:O1b','day20:O1c'],48:['day20:O5a','day20:O5b','day20:O6a'],
 49:['day21:K2a','day21:K2b','day21:K2c'],50:['day21:K1b','day21:K2b','day21:K3'],51:['day21:K1a'],52:['day21:K4','day21:K5a','day21:K5b','day21:K5c'],
 53:['day22:W1a','day22:W1b','day22:W2a','day22:W2b'],54:['day22:W3a'],55:['day22:W3b','day22:W3c','day22:W3d'],56:['day22:W4'],57:['day22:W5','day22:W6a','day22:W6b','day22:W6c'],
 58:['day23:L2a'],59:['day23:L3a','day23:L3b'],60:['day23:L4a','day23:L4b'],61:['day23:L5a','day23:L5b'],62:['day23:L5c','day23:L5d','day23:L5f','day23:L1d'],63:['day23:L1a','day23:L1b','day23:L1c','day23:L1d','day23:L1e'],64:['day23:L6a','day23:L6b','day23:L6c'],
 65:['day24:M2a','day24:M2b','day24:M2c'],66:['day24:M1a','day24:M1b','day24:M3a'],67:['day24:M4a','day24:M4b','day24:M4c'],68:['day24:M5a','day24:M5b'],69:['day24:M1c','day24:M6a','day24:M6b','day24:M6c'],
 70:['day25:B2a','day25:B3a'],71:['day25:B3b','day25:B4a'],72:['day25:B1a','day25:B1b'],73:['day25:B4a','day25:B4b','day25:B4c','day25:B3c'],74:['day25:B2b','day25:B6a','day25:B6b','day25:B6c'],75:['day25:B5'],
 76:['day26:*contrast'],77:['day26:*no horizontal scroll'],78:['day26:*button height'],
 79:['day27:T1'],80:['day27:Q1','day27:Q2','day27:Q3','day27:Q4','day27:Q5'],81:['day27:Q6','day27:Q7'],82:['day27:D1'],83:['day27:D2','day27:D3','day27:D4']};
const file=f=>({regression:'regression.js'}[f]||f+'.js');
function exists(ref){
  const [f,id]=ref.split(':');const src=fs.readFileSync(path.join(__dirname,file(f)),'utf8');
  if(id.startsWith('*'))return src.includes("note('"+id.slice(1));
  return (f==='day14'||f==='day27')&&/^[AQ]\d/.test(id)?src.includes("row('"+id):(src.includes("rec('"+id+" ")||src.includes("rec('"+id+"'"));
}
function count(p,section){const t=fs.readFileSync(path.join(REPO,p),'utf8');const m=t.match(/## Success criteria\n([\s\S]*?)\n## Stop when/);return m[1].split('\n').filter(l=>l.startsWith('- ')).length;}
function verify(){
  const problems=[];
  const nA=count('intent/archive/intent-tracker.md'),nC=count('intent/current-feature.md');
  if(Object.keys(archive).length!==nA)problems.push('archived criteria: '+nA+' in the intent, '+Object.keys(archive).length+' mapped');
  if(Object.keys(active).length!==nC)problems.push('active criteria: '+nC+' in the intent, '+Object.keys(active).length+' mapped');
  for(const [name,map] of [['archived',archive],['active',active]])for(const [n,refs] of Object.entries(map)){
    if(!refs.length)problems.push(name+' criterion '+n+' has no check');
    refs.forEach(r=>{if(!exists(r))problems.push(name+' criterion '+n+': check '+r+' does not exist');});}
  return {problems,nA,nC};
}
module.exports={verify,archive,active};
if(require.main===module){
  const r=verify();
  if(process.argv.includes('--write')){
    const text=(p)=>fs.readFileSync(path.join(REPO,p),'utf8').match(/## Success criteria\n([\s\S]*?)\n## Stop when/)[1].split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2).replace(/\|/g,'/'));
    const rows=(map,list)=>list.map((t,i)=>'| '+(i+1)+' | '+(t.length>110?t.slice(0,107)+'...':t)+' | '+map[i+1].map(x=>'`'+x.replace('*','')+'`').join(', ')+' |').join('\n');
    fs.writeFileSync(path.join(REPO,'evidence/traceability.md'),'# Criteria traceability\n\nEvery success criterion maps to at least one automated check in `evidence/checks/`. Generated and verified by `evidence/checks/traceability.js` (run `node traceability.js`; it fails if a criterion has no check or a named check does not exist). A check is written `file:ID`; `regression` is `regression.js`.\n\n## Archived tracker intent (`intent/archive/intent-tracker.md`, '+r.nA+' criteria)\n\n| # | Criterion | Checks |\n|---|---|---|\n'+rows(archive,text('intent/archive/intent-tracker.md'))+'\n\n## Active intent (`intent/current-feature.md`, '+r.nC+' criteria)\n\n| # | Criterion | Checks |\n|---|---|---|\n'+rows(active,text('intent/current-feature.md'))+'\n');
  }
  console.log(r.problems.length?'PROBLEMS:\n'+r.problems.join('\n'):'OK: all '+r.nA+' archived and '+r.nC+' active criteria map to existing checks');
  process.exit(r.problems.length?1:0);
}
