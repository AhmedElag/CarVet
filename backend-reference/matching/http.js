import {matchVehicles} from './service.js';

export const MAX_REQUEST_BYTES = 16 * 1024;
const responseHeaders = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (body, status = 200, extra = {}) => Response.json(body, {status, headers:{...responseHeaders,...extra}});

async function readBoundedJSON(request) {
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > MAX_REQUEST_BYTES) return {error:'Keep the request under 16 KB.',status:413};
  if (!request.body) return {error:'Provide your preferences as JSON.',status:400};
  const reader = request.body.getReader();
  const chunks=[];
  let length=0;
  try {
    while(true) {
      const {done,value}=await reader.read();
      if(done) break;
      length+=value.byteLength;
      if(length>MAX_REQUEST_BYTES) {
        await reader.cancel();
        return {error:'Keep the request under 16 KB.',status:413};
      }
      chunks.push(value);
    }
    const bytes=new Uint8Array(length);
    let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return {value:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))};
  } catch {
    return {error:'Provide valid JSON preferences.',status:400};
  } finally {
    reader.releaseLock();
  }
}

export async function handleMatchRequest(request) {
  if(request.method!=='POST') return json({error:'Use POST to submit preferences.'},405,{Allow:'POST'});
  const origin=request.headers.get('origin');
  if(origin) {
    try {if(new URL(origin).origin!==new URL(request.url).origin)return json({error:'Submit preferences from this website.'},403);}
    catch{return json({error:'Invalid request origin.'},403);}
  }
  const contentType=request.headers.get('content-type')||'';
  if(!/^application\/json(?:\s*;|$)/i.test(contentType))return json({error:'Use application/json preferences.'},415);
  const parsed=await readBoundedJSON(request);
  if(parsed.error)return json({error:parsed.error},parsed.status);
  try {return json(matchVehicles(parsed.value));}
  catch(error){return json({error:error instanceof Error?error.message:'Check your preferences and try again.'},400);}
}
