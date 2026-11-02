import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {initializeEngine,recommend,parseCatalogCSV,inferConstraints} from '../lib/matching/engine.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=async name=>JSON.parse(await readFile(path.join(root,name),'utf8'));
const model=await json('lib/matching/model.json'),catalog=await json('lib/matching/catalog.json');
initializeEngine(model,catalog);
const fixtures=await json('tests/engine-fixtures.json');
let checks=0,maxError=0;
for(const {request,expected}of fixtures){
  const actual=recommend(request);
  assert.deepEqual(actual.constraints,expected.constraints);checks++;
  assert.deepEqual(actual.funnel,expected.funnel);checks++;
  assert.deepEqual(actual.results.map(v=>v.id),expected.results.map(v=>v.id));checks++;
  assert.equal(actual.total_matches,expected.total_matches);checks++;
  for(const field of ['intent','policy_intent','lm_intent'])for(const name of Object.keys(expected[field])){
    const delta=Math.abs(actual[field][name]-expected[field][name]);
    maxError=Math.max(maxError,delta);
    assert.ok(delta<0.00003,`${field}.${name}: ${actual[field][name]} != ${expected[field][name]}`);checks++;
  }
  for(let i=0;i<actual.results.length;i++){
    assert.equal(actual.results[i].score,expected.results[i].score);checks++;
    assert.deepEqual(actual.results[i].breakdown,expected.results[i].breakdown);checks++;
  }
}
for(const budget of [10000,20000,30000,40000,50000])for(const min_seats of [2,5,7])for(const powertrain of ['any','gas','hybrid','electric'])for(const awd of [false,true]){
  const raw={text:'family efficient city',budget,min_seats,powertrain,awd,max_mileage:80000};
  const result=recommend(raw);
  for(const car of result.results){
    assert.ok(car.price_cad<=budget&&car.seats>=min_seats&&car.mileage_km<=80000);
    assert.ok(powertrain==='any'||car.powertrain===powertrain);
    assert.ok(!awd||['AWD','4WD'].includes(car.drivetrain));checks+=3;
  }
}
assert.throws(()=>recommend({text:'SUV under $35k with no electric',powertrain:'electric'}),/requirements/);checks++;
assert.equal(recommend({text:'car under $100'}).results.length,0);checks++;
assert.ok(recommend({text:'no electric, family SUV under $35k'}).results.every(v=>v.powertrain!=='electric'));checks++;
assert.equal(recommend({text:'under $35k',budget:20000}).constraints.budget,20000);checks++;
assert.deepEqual(inferConstraints('under 80000 km'),{max_mileage:80000});checks++;
for(const bad of [NaN,Infinity,-1,true,{},'abc']){assert.throws(()=>recommend({budget:bad}));checks++;}
assert.throws(()=>recommend({min_seats:2.5}));checks++;
assert.throws(()=>recommend({awd:'true'}));checks++;
const csv=await readFile(path.join(root,'lib/matching/demo-inventory.csv'),'utf8');
assert.deepEqual(parseCatalogCSV(csv),catalog);checks++;
assert.throws(()=>parseCatalogCSV(csv.replace('DEMO-002','DEMO-001')),/duplicate/);checks++;
assert.throws(()=>parseCatalogCSV(csv.replace('17900','-3')),/price_cad/);checks++;
assert.throws(()=>parseCatalogCSV('id,price\n1,5'));checks++;
// An imported session catalog is a pure override: it changes results without
// silently changing the bundled catalog used by later default recommendations.
const custom=[{...catalog[0],id:'CLIENT-ONLY-001',make:'Client',model:'Example',price_cad:15000}];
const imported=recommend({budget:20000,min_seats:5},custom);
assert.equal(imported.inventory_count,1);checks++;
assert.equal(imported.results[0].id,'CLIENT-ONLY-001');checks++;
assert.equal(imported.catalog_label,'Imported inventory');checks++;
assert.equal(recommend({budget:20000}).inventory_count,28);checks++;
assert.throws(()=>parseCatalogCSV(csv.replace('17900','NaN')));checks++;
assert.equal(recommend({budget:20000}).inventory_count,28);checks++;
console.log(JSON.stringify({status:'passed',python_parity_cases:fixtures.length,generated_filter_combinations:120,assertions:checks,max_neural_probability_error:maxError,catalog_rows:catalog.length}));
