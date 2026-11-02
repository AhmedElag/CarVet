import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {matchVehicles} from '../lib/matching/service.js';
import {handleMatchRequest,MAX_REQUEST_BYTES} from '../lib/matching/http.js';

const endpoint='https://carvet.example/api/match';
const post=(body,headers={})=>new Request(endpoint,{method:'POST',headers:{'content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});

test('server matches original Python ranking fixtures without exposing internals',async()=>{
  const fixtures=JSON.parse(await readFile(new URL('./engine-fixtures.json',import.meta.url),'utf8'));
  for(const {request,expected}of fixtures){
    const actual=matchVehicles(request);
    assert.deepEqual(actual.results.map(v=>[v.id,v.score]),expected.results.map(v=>[v.id,v.score]));
    assert.deepEqual(actual.constraints,expected.constraints);
    assert.equal(actual.total_matches,expected.total_matches);
    assert.deepEqual(Object.keys(actual).sort(),['constraints','inventory_count','results','total_matches']);
    for(const vehicle of actual.results){
      for(const privateField of ['category','efficiency_score','practicality_score','performance_score','breakdown','model_version','features','intent'])assert.equal(privateField in vehicle,false);
      assert.equal(typeof vehicle.reasons[0],'string');
    }
    assert.doesNotMatch(JSON.stringify(actual),/NoGPU|policy_intent|lm_intent|weights|neural_category/);
  }
});

test('all returned cars obey hard requirements and empty results retain requested constraints',()=>{
  const requirements={text:'family SUV',budget:35000,max_mileage:80000,min_seats:5,awd:true,body:'suv'};
  const actual=matchVehicles(requirements);
  assert.ok(actual.results.length>0);
  for(const car of actual.results){assert.ok(car.price_cad<=35000);assert.ok(car.mileage_km<=80000);assert.ok(car.seats>=5);assert.ok(['AWD','4WD'].includes(car.drivetrain));assert.equal(car.body,'suv');}
  const impossible=matchVehicles({...requirements,budget:1000});
  assert.equal(impossible.total_matches,0);
  assert.deepEqual(impossible.results,[]);
  assert.equal(impossible.constraints.budget,1000);
  assert.equal(impossible.constraints.awd,true);
});

test('API validates JSON and preferences, and never accepts client model/catalog overrides',async()=>{
  for(const invalid of ['not JSON','[]','null','{"budget":"NaN"}','{"budget":true}','{"min_seats":3.5}','{"catalog":[]}','{"weights":{}}']){
    const response=await handleMatchRequest(post(invalid));
    assert.equal(response.status,400,invalid);
    assert.equal(typeof(await response.json()).error,'string');
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
  const conflict=await handleMatchRequest(post({text:'no electric',powertrain:'electric'}));
  assert.equal(conflict.status,400);
  const response=await handleMatchRequest(post({text:'city car',budget:22000},{origin:'https://carvet.example'}));
  assert.equal(response.status,200);
  assert.ok((await response.json()).results.length>0);
});

test('request boundary rejects other origins, methods, content types, and byte-limit overflow',async()=>{
  assert.equal((await handleMatchRequest(new Request(endpoint))).status,405);
  assert.equal((await handleMatchRequest(post({}, {origin:'https://another.example'}))).status,403);
  assert.equal((await handleMatchRequest(post({}, {origin:'broken-origin'}))).status,403);
  assert.equal((await handleMatchRequest(new Request(endpoint,{method:'POST',body:'{}'}))).status,415);
  assert.equal((await handleMatchRequest(post({}, {'content-length':String(MAX_REQUEST_BYTES+1)}))).status,413);
  // No Content-Length: actual streamed UTF-8 bytes still enforce the bound.
  assert.equal((await handleMatchRequest(post({text:'é'.repeat(MAX_REQUEST_BYTES)}))).status,413);
});
