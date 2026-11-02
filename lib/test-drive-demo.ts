export type DriveFrame = { second:number; speedKph:number; rpm:number|null; coolantC:number|null; auxiliaryVolts:number|null };
export type DriveScenario = {
  id:string; title:string; subtitle:string; vehicle:string; powertrain:'petrol'|'electric';
  label:string; code:{code:string;description:string;status:string}|null;
  readiness:{ready:number;incomplete:number;unsupported:number}|null;
  question:string; frames:DriveFrame[];
};
const speeds=[0,12,28,44,57,67,61,42,25,8,0];
const petrol=speeds.map((speedKph,index)=>({second:index*60,speedKph,rpm:[820,1450,1850,2180,2420,2650,2370,1950,1580,1050,830][index],coolantC:[71,74,78,82,85,88,90,91,91,90,89][index],auxiliaryVolts:[14.2,14.1,14.3,14.2,14.1,14.2,14.2,14.1,14.2,14.2,14.1][index]}));
export const driveScenarios:DriveScenario[]=[
  {id:'everyday',title:'The everyday petrol car',subtitle:'A simple first look at a sample drive.',vehicle:'Sample petrol crossover',powertrain:'petrol',label:'No code in this sample',code:null,readiness:{ready:6,incomplete:1,unsupported:1},question:'Can you provide the service records and arrange an independent inspection?',frames:petrol},
  {id:'engine-question',title:'An engine question',subtitle:'A sample code that deserves follow-up.',vehicle:'Sample petrol car · engine-controller example',powertrain:'petrol',label:'A code to investigate',code:{code:'P0300',description:'Random / multiple cylinder misfire detected',status:'Stored · illustrative code'},readiness:{ready:5,incomplete:2,unsupported:1},question:'Has the stored misfire code been diagnosed, and is there a repair invoice or technician’s report?',frames:petrol.map((frame,index)=>({...frame,rpm:index===6?2720:frame.rpm}))},
  {id:'electric',title:'The electric daily driver',subtitle:'Keep the missing evidence visible.',vehicle:'Sample electric hatchback',powertrain:'electric',label:'Battery evidence still needed',code:null,readiness:null,question:'Can a qualified EV technician provide a battery health assessment and demonstrate charging?',frames:speeds.map((speedKph,index)=>({second:index*60,speedKph,rpm:null,coolantC:null,auxiliaryVolts:[13.4,13.5,13.4,13.5,13.6,13.5,13.5,13.5,13.4,13.5,13.4][index]}))},
];
export function sampleClock(second:number){return `${Math.floor(second/60).toString().padStart(2,'0')}:${(second%60).toString().padStart(2,'0')}`;}
export function buildDriveExport(scenario:DriveScenario,serviceSlug:string){return {schema:'carvet.test-drive-demo.v1',sample:true,source:'Preloaded illustrative recording. No vehicle or scanner was connected.',serviceSlug,scenario:scenario.id,vehicle:scenario.vehicle,frames:scenario.frames,diagnosticCode:scenario.code,emissionsReadiness:scenario.readiness,notProvided:['Actual vehicle identity','Confirmed hardware compatibility','Manufacturer-specific module coverage','EV battery state of health'],sellerQuestion:scenario.question};}
