/** Private server inference adapter using the original trained policy and language model. */
export const CLASSES = ['economy', 'family', 'sport', 'electric'];
export const FEATURES = ['budget', 'space', 'performance', 'electric', 'efficiency', 'cargo', 'awd', 'city'];
export let catalog = [];
let model = null;
let lookup = null;

export function initializeEngine(weights, vehicles) {
  if (!weights?.policy || !weights?.lm || !Array.isArray(vehicles)) throw new Error('Invalid model or inventory.');
  model = weights;
  lookup = Object.fromEntries(weights.vocab.map((word, i) => [word, i]));
  catalog = vehicles;
  return {catalog, version: model.version};
}


const WORDS = [
  /\b(cheap|budget|affordable|economy|inexpensive|save|saving|value)\b/,
  /\b(family|children|kids|seats|spacious|space|passengers|stroller|seven|six)\b/,
  /\b(sport|sports|sporty|performance|fast|fun|powerful|acceleration|enthusiast|handling)\b/,
  /\b(electric|ev|charging|battery|emissions)\b/,
  /\b(efficient|efficiency|fuel|economical|commute|commuting|hybrid|mileage)\b/,
  /\b(cargo|trunk|camping|gear|luggage|hauling|truck|stroller)\b/,
  /\b(awd|4wd|snow|winter|traction|all wheel)\b/,
  /\b(city|compact|parking|urban|small|downtown)\b/
];
const NEG_EV = /\b(no|not|avoid|without)\s+(an?\s+)?(electric|ev)\b/;
const sum = a => a.reduce((s,v) => s+v,0);
// Match Python's round-to-even on the exact binary float, including .125 ties.
const rounded = (value,digits=1) => {
  if(!value)return value;
  const bytes=new DataView(new ArrayBuffer(8));bytes.setFloat64(0,Math.abs(value));
  const hi=bytes.getUint32(0),lo=bytes.getUint32(4),exponent=(hi>>>20)&2047;
  let numerator=(BigInt(hi&1048575)<<32n)|BigInt(lo);
  if(exponent)numerator|=1n<<52n;
  const shift=(exponent?exponent-1023:-1022)-52;
  numerator*=10n**BigInt(digits);
  const denominator=shift<0?1n<<BigInt(-shift):1n;
  if(shift>0)numerator<<=BigInt(shift);
  let quotient=numerator/denominator;const remainder=numerator%denominator;
  if(remainder*2n>denominator||(remainder*2n===denominator&&quotient%2n===1n))quotient++;
  return Math.sign(value)*Number(quotient)/(10**digits);
};
const dict = (names, values) => Object.fromEntries(names.map((name,i) => [name,values[i]]));
const money = value => '$'+Number(value).toLocaleString('en-CA',{maximumFractionDigits:0});
const softmax = a => {const max=Math.max(...a), exp=a.map(v=>Math.exp(v-max)), total=sum(exp);return exp.map(v=>v/total);};
const linear = (x,w,b) => b.map((bias,j) => x.reduce((acc,v,i)=>acc+v*w[i][j],bias));
const tokenize = text => text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?|[0-9]+|[.:!?]/g)||[];
const number = s => Number(s.replace(/[, $]/g,'').replace(/k$/,''))*(s.trim().endsWith('k')?1000:1);

export function textFeatures(text) {
  const t=text.toLowerCase(), x=WORDS.map(pattern=>Number(pattern.test(t)));
  if(NEG_EV.test(t)) x[3]=0;
  if(sum(x.slice(0,4))===0){x[0]=0.4;x[1]=0.3;}
  return x;
}

export function inferConstraints(text) {
  const t=text.toLowerCase(), c={};
  const budget=/(?:budget(?:\s+(?:is|of))?|under|below|up to|max(?:imum)?|less than)\s*\$?\s*([\d,]+(?:\.\d+)?\s*k?)(?![\w\d])/.exec(t);
  if(budget&&!/^\s*(?:km|kilomet|miles)/.test(t.slice(budget.index+budget[0].length)))c.budget=number(budget[1]);
  const km=/(?:under|below|max(?:imum)?|less than|up to)\s*([\d,]+(?:\.\d+)?\s*k?)\s*(?:km|kilomet)/.exec(t);
  if(km)c.max_mileage=number(km[1]);
  const seats=/\b([2-9]|10|11|12)\s*(?:seats|seat|seater|passengers)\b/.exec(t);
  if(seats)c.min_seats=Number(seats[1]);
  for(const [word,n] of [['five',5],['six',6],['seven',7],['eight',8]])if(new RegExp(`\\b${word}\\s*(?:seats|seater|passengers)\\b`).test(t))c.min_seats=n;
  if(/\b(awd|4wd|all[ -]wheel drive|four[ -]wheel drive)\b/.test(t)&&!/\b(no|not|without)\s+(awd|4wd|all[ -]wheel)/.test(t))c.awd=true;
  if(NEG_EV.test(t))c.exclude_electric=true;
  else if(/\b(electric|ev)\b/.test(t))c.powertrain='electric';
  else if(/\bhybrid\b/.test(t))c.powertrain='hybrid';
  if(/\b(no accidents|accident free|clean history)\b/.test(t))c.clean_only=true;
  for(const body of ['sedan','hatchback','suv','truck','wagon','coupe','minivan'])if(new RegExp(`\\b${body}s?\\b`).test(t)){c.body=body;break;}
  return c;
}

export function validateRequest(raw) {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Request must be an object.');
  const text=raw.text??'';
  if(typeof text!=='string'||text.length>4000)throw new Error('Describe your needs in 4,000 characters or fewer.');
  const constraints=inferConstraints(text), sources=Object.fromEntries(Object.keys(constraints).map(k=>[k,'text']));
  for(const [key,min,max,defaultValue] of [['budget',1,2000000,50000],['max_mileage',0,2000000,200000],['min_seats',1,12,2]]){
    const value=raw[key];
    if(value!==undefined&&value!==null&&value!==''){
      if(typeof value==='boolean'||!['number','string'].includes(typeof value))throw new Error(`${key} must be numeric.`);
      constraints[key]=Number(value);sources[key]='form';
    }else if(!(key in constraints)){constraints[key]=defaultValue;sources[key]='default';}
    if(!Number.isFinite(constraints[key])||constraints[key]<min||constraints[key]>max||(key!=='budget'&&!Number.isInteger(constraints[key])))throw new Error(`${key} must be between ${min} and ${max}; seats and km must be whole numbers.`);
  }
  for(const [key,allowed] of [['powertrain',['any','gas','hybrid','electric','diesel']],['body',['any','sedan','hatchback','suv','truck','wagon','coupe','minivan']],['priority',['auto',...CLASSES]]]){
    const value=raw[key];
    if(value!=null&&value!==''&&value!=='any'&&value!=='auto'){
      if(!allowed.includes(value))throw new Error(`Invalid ${key}.`);
      constraints[key]=value;sources[key]='form';
    }
  }
  for(const key of ['awd','clean_only','exclude_electric'])if(raw[key]!=null){
    if(typeof raw[key]!=='boolean')throw new Error(`${key} must be true or false.`);
    constraints[key]=raw[key];sources[key]='form';
  }
  if(constraints.exclude_electric&&constraints.powertrain==='electric')throw new Error('Your requirements ask for electric and no electric. Change one to continue.');
  return {text,constraints,sources};
}

function policyPredict(x){const p=model.policy;return softmax(linear(linear(x,p.W1,p.b1).map(v=>Math.max(0,v)),p.W2,p.b2));}
function lmIntent(text){
  const p=model.lm, ids=[...Array(model.context).fill(lookup['<pad>']),...tokenize(text+' recommend').map(w=>lookup[w]??lookup['<unk>'])].slice(-model.context);
  const flat=ids.flatMap(i=>p.E[i]);
  const hidden=linear(flat,p.W,p.b).map(Math.tanh);
  const logits=linear(hidden,p.U,p.c);
  // Conditioning the next-token distribution on four classes equals a softmax
  // over those logits; it avoids unnecessary exponentials for the other tokens.
  const intent=softmax(CLASSES.map(name=>logits[lookup[name]]));
  const words=tokenize(text).filter(w=>/^[a-z]+$/.test(w));
  return {intent,coverage:words.filter(w=>Object.hasOwn(lookup,w)).length/Math.max(1,words.length)};
}

export function recommend(raw, inventory=catalog) {
  if(!model)throw new Error('Load the recommendation engine first.');
  const start=globalThis.performance?.now()??Date.now();
  const {text,constraints:c,sources}=validateRequest(raw), x=textFeatures(text);
  if(c.min_seats>=6)x[1]=1;
  if(c.powertrain==='electric')x[3]=1;
  if(c.awd)x[6]=1;
  if(['suv','minivan','wagon'].includes(c.body)){x[1]=1;x[5]=1;}
  if(c.priority){x.fill(0.1,0,4);x[CLASSES.indexOf(c.priority)]=1;}
  const policy=policyPredict(x), lm=text.trim()?lmIntent(text):{intent:[.25,.25,.25,.25],coverage:0};
  const weight=text.trim()?0.3*lm.coverage:0;
  let pref=policy.map((v,i)=>(1-weight)*v+weight*lm.intent[i]);
  if(c.priority){pref=pref.map(v=>v*.25);pref[CLASSES.indexOf(c.priority)]+=.75;}
  const checks=[
    ['Within budget',v=>v.price_cad<=c.budget],
    ['Within mileage',v=>v.mileage_km<=c.max_mileage],
    ['Enough seats',v=>v.seats>=c.min_seats],
    ['Powertrain',v=>!c.powertrain||c.powertrain==='any'||v.powertrain===c.powertrain],
    ['Body style',v=>!c.body||c.body==='any'||v.body===c.body],
    ['Drivetrain',v=>!c.awd||['AWD','4WD'].includes(v.drivetrain)],
    ['History',v=>!c.clean_only||v.accident_history==='none_reported'],
    ['EV exclusion',v=>!c.exclude_electric||v.powertrain!=='electric']
  ];
  let candidates=[...inventory];
  const funnel=[{stage:'Inventory',remaining:candidates.length}];
  for(const [stage,check]of checks){candidates=candidates.filter(check);funnel.push({stage,remaining:candidates.length});}
  const leading=CLASSES[pref.indexOf(Math.max(...pref))];
  const results=candidates.map(v=>{
    const semantic=[1-Math.min(v.price_cad/80000,1),v.practicality_score,v.performance_score,Number(v.powertrain==='electric'),v.efficiency_score,v.practicality_score,Number(['AWD','4WD'].includes(v.drivetrain)),Number(['sedan','hatchback'].includes(v.body))];
    const fit=sum(x.map((value,i)=>value*semantic[i]))/Math.max(sum(x),1);
    const parts={neural_category:45*pref[CLASSES.indexOf(v.category)],preference_fit:20*fit,budget_headroom:20*(1-v.price_cad/c.budget),mileage_headroom:15*(1-v.mileage_km/Math.max(c.max_mileage,1))};
    const reasons=[`${money(v.price_cad)} CAD is within your ${money(c.budget)} budget.`,`${v.seats} seats; ${v.mileage_km.toLocaleString('en-CA')} km in this inventory row.`];
    if(c.awd)reasons.push(`${v.drivetrain} meets the requested drivetrain filter.`);
    if(v.powertrain==='electric')reasons.push(`Electric; ${v.range_km} km of supplied range.`);
    if(v.accident_history!=='none_reported')reasons.push('History field: '+v.accident_history.replaceAll('_',' ')+'.');
    return {...v,score:rounded(sum(Object.values(parts))),breakdown:Object.fromEntries(Object.entries(parts).map(([key,value])=>[key,rounded(value,2)])),reasons,tradeoff:v.category!==leading?'Less aligned with the leading preference category.':'Compare condition and ownership costs before choosing.'};
  }).sort((a,b)=>b.score-a.score||a.price_cad-b.price_cad||a.id.localeCompare(b.id));
  return {
    message:results.length?`${results.length} vehicles satisfy every active filter. Ranked by your preferences and inventory.`:'No vehicles satisfy every active filter. Adjust a requirement; no constraints were relaxed.',
    results:results.slice(0,5),total_matches:results.length,inventory_count:inventory.length,catalog_label:inventory===catalog?'Bundled synthetic demo inventory':'Imported inventory',constraints:c,constraint_sources:sources,funnel,
    features:dict(FEATURES,x),intent:dict(CLASSES,pref),policy_intent:dict(CLASSES,policy),lm_intent:dict(CLASSES,lm.intent),lm_vocabulary_coverage:rounded(lm.coverage,3),
    lm_note:'Original trained model weights run on your CPU. Preference points do not measure vehicle condition or purchase probability.',
    latency_ms:rounded((globalThis.performance?.now()??Date.now())-start,2),runtime:'CPU / JavaScript / server',model_version:model.version
  };
}

const FIELDS='id year make model price_cad mileage_km seats body powertrain drivetrain efficiency_score practicality_score performance_score range_km accident_history category'.split(' ');
const ENUMS={body:['sedan','hatchback','suv','truck','wagon','coupe','minivan'],powertrain:['gas','hybrid','electric','diesel'],drivetrain:['FWD','RWD','AWD','4WD'],accident_history:['none_reported','reported','unknown'],category:CLASSES};
const BOUNDS={year:[1980,2100],price_cad:[1,2000000],mileage_km:[0,2000000],seats:[1,12],efficiency_score:[0,1],practicality_score:[0,1],performance_score:[0,1],range_km:[0,2000]};
const INTS=new Set(['year','mileage_km','seats','range_km']);

export function parseCatalogCSV(text){
  if(typeof text!=='string'||new TextEncoder().encode(text).length>2000000)throw new Error('CSV must be text under 2 MB.');
  const rows=[], row=[];let field='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!quoted&&field==='')quoted=true;else if(quoted)quoted=false;else throw new Error('Malformed CSV quoting.');}
    else if(ch===','&&!quoted){row.push(field);field='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push([...row]);row.length=0;field='';}
    else field+=ch;
  }
  if(quoted)throw new Error('CSV has an unclosed quote.');
  if(field||row.length){row.push(field);if(row.some(v=>v.trim()))rows.push([...row]);}
  const headers=rows.shift()?.map(v=>v.trim());
  if(!headers||headers.length!==FIELDS.length||new Set(headers).size!==FIELDS.length||FIELDS.some(k=>!headers.includes(k)))throw new Error('CSV headers must match the inventory template.');
  if(!rows.length)throw new Error('CSV contains no vehicles.');
  if(rows.length>5000)throw new Error('At most 5,000 vehicles supported.');
  const ids=new Set();
  return rows.map((row,i)=>{
    const n=i+2;if(row.length!==headers.length)throw new Error(`Row ${n}: wrong number of columns.`);
    const v=Object.fromEntries(headers.map((key,j)=>[key,row[j].trim()]));
    for(const key of ['id','make','model'])if(!v[key]||v[key].length>120)throw new Error(`Row ${n}: ${key} needs 1–120 characters.`);
    if(ids.has(v.id))throw new Error(`Row ${n}: duplicate id.`);ids.add(v.id);
    for(const [key,allowed]of Object.entries(ENUMS))if(!allowed.includes(v[key]))throw new Error(`Row ${n}: invalid ${key}.`);
    for(const [key,[min,max]]of Object.entries(BOUNDS)){
      if(v[key]==='')throw new Error(`Row ${n}: ${key} must be numeric.`);
      const num=Number(v[key]);if(!Number.isFinite(num)||num<min||num>max||(INTS.has(key)&&!Number.isInteger(num)))throw new Error(`Row ${n}: invalid ${key}.`);v[key]=num;
    }
    if(v.powertrain!=='electric'&&v.range_km!==0)throw new Error(`Row ${n}: range_km must be 0 for non-EVs.`);
    return v;
  });
}
