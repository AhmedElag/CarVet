/** Browser-local demonstration data. Never used for real orders or access control. */
export type DemoVehicle = {
  id: string; year: number; make: string; model: string; price_cad: number;
  mileage_km: number; seats: number; body: string; powertrain: string;
  drivetrain: string; accident_history: string; range_km: number;
  score: number; reasons: string[]; tradeoff?: string;
};
export type DemoStatus = "draft" | "reviewing" | "action-needed" | "ready";
export type DemoRequest = {
  id: string; serviceSlug: string; createdAt: string; updatedAt: string;
  status: DemoStatus; brief: Record<string, unknown>; vehicle: DemoVehicle;
  results: DemoVehicle[]; checks: boolean[]; notes: string; advisorNote: string;
};
export type SaveDemoRequestInput = {
  serviceSlug: string; brief: Record<string, unknown>; vehicle: DemoVehicle;
  results: DemoVehicle[]; checks: boolean[]; notes: string;
};
const KEY = "carvet-demo-workspace-v1";
const EVENT = "carvet-demo-workspace-changed";
const statuses: DemoStatus[] = ["draft", "reviewing", "action-needed", "ready"];
let memory: DemoRequest[] | null = null;
let preferMemory = false;
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const vehicleName = (v: DemoVehicle) => `${v.year} ${v.make} ${v.model}`;
const base = { seats:5, range_km:0, accident_history:"none_reported", reasons:["Within the sample buyer’s stated vehicle-price limit."], tradeoff:"Review condition and ownership costs before deciding." };
const family: DemoVehicle = { ...base,id:"DEMO-010",year:2023,make:"Mazda",model:"CX-5",price_cad:26900,mileage_km:59000,body:"suv",powertrain:"gas",drivetrain:"AWD",score:65.5 };
const city: DemoVehicle = { ...base,id:"DEMO-007",year:2020,make:"Honda",model:"Fit",price_cad:12900,mileage_km:118000,body:"hatchback",powertrain:"gas",drivetrain:"FWD",score:68.7 };
const electric: DemoVehicle = { ...base,id:"DEMO-022",year:2020,make:"Chevrolet",model:"Bolt",price_cad:22900,mileage_km:61000,body:"hatchback",powertrain:"electric",drivetrain:"FWD",range_km:350,score:71.2 };
function samples(): DemoRequest[] {
  return [
    {id:"CV-SAMPLE-01",serviceSlug:"find-me-options",createdAt:"2026-11-02T12:00:00.000Z",updatedAt:"2026-11-02T12:30:00.000Z",status:"ready",brief:{text:"A family SUV for school runs, snowy roads, and weekends away.",budget:"35000",awd:true,min_seats:"5"},vehicle:family,results:[family],checks:[true,false,false,false],notes:"Ask about the service records before booking a viewing.",advisorNote:"Sample guidance: the car fits the brief. Request service receipts and arrange an independent inspection before deciding."},
    {id:"CV-SAMPLE-02",serviceSlug:"listing-risk-scan",createdAt:"2026-11-01T15:00:00.000Z",updatedAt:"2026-11-02T11:30:00.000Z",status:"action-needed",brief:{text:"An affordable first car for an efficient daily city commute.",budget:"22000",min_seats:"5"},vehicle:city,results:[city],checks:[false,false,false,false],notes:"Confirm whether the seller has maintenance invoices.",advisorNote:"Sample request for information: ask for the current vehicle history report and dated maintenance invoices. The example review has evidence gaps."},
    {id:"CV-SAMPLE-03",serviceSlug:"serious-candidate-review",createdAt:"2026-11-02T11:00:00.000Z",updatedAt:"2026-11-02T11:00:00.000Z",status:"reviewing",brief:{text:"An electric daily driver with home charging and a clear battery story.",budget:"40000",powertrain:"electric",min_seats:"5"},vehicle:electric,results:[electric],checks:[false,false,false,false],notes:"Ask for battery health information.",advisorNote:"Sample review in progress. Battery health evidence has not been provided."}
  ];
}
function record(value: unknown): value is Record<string,unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function isVehicle(value: unknown): value is DemoVehicle {
  return record(value) && ["id","make","model","body","powertrain","drivetrain","accident_history"].every(k=>typeof value[k] === "string")
    && ["year","price_cad","mileage_km","seats","range_km","score"].every(k=>typeof value[k] === "number" && Number.isFinite(value[k]))
    && Array.isArray(value.reasons) && value.reasons.every(x=>typeof x === "string");
}
function isRequest(value: unknown): value is DemoRequest {
  return record(value) && ["id","serviceSlug","createdAt","updatedAt","notes","advisorNote"].every(k=>typeof value[k] === "string")
    && statuses.includes(value.status as DemoStatus) && record(value.brief) && isVehicle(value.vehicle)
    && Array.isArray(value.results) && value.results.every(isVehicle) && Array.isArray(value.checks) && value.checks.every(x=>typeof x === "boolean");
}
function persist(requests: DemoRequest[]) {
  memory = copy(requests);
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(requests)); preferMemory = false; } catch { preferMemory = true; /* Keep newer session data instead of reading stale browser storage. */ }
  window.dispatchEvent(new Event(EVENT));
}
export function getDemoRequests(): DemoRequest[] {
  if (typeof window === "undefined") return [];
  if (preferMemory && memory) return copy(memory);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isRequest)) { memory = parsed.slice(0,40); return copy(memory); }
    }
  } catch { /* Read the in-memory fallback below. */ }
  if (memory) return copy(memory);
  const seeded = samples(); persist(seeded); return copy(seeded);
}
export function saveDemoRequest(input: SaveDemoRequestInput): string {
  if (!isVehicle(input.vehicle)) throw new Error("Choose a sample vehicle before saving your plan.");
  const now = new Date().toISOString();
  const id = `CV-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0,8).toUpperCase() : Date.now().toString(36).toUpperCase()}`;
  const request: DemoRequest = { id,serviceSlug:input.serviceSlug,createdAt:now,updatedAt:now,status:"reviewing",brief:copy(input.brief),vehicle:copy(input.vehicle),results:copy(input.results.slice(0,5)),checks:input.checks.slice(0,4).map(Boolean),notes:input.notes.slice(0,4000),advisorNote:"Your sample request is ready for the advisor preview. No real order has been submitted." };
  persist([request,...getDemoRequests()].slice(0,40)); return id;
}
export function updateDemoRequest(id: string, patch: Partial<Pick<DemoRequest,"status"|"checks"|"notes"|"advisorNote">>): DemoRequest | null {
  let updated: DemoRequest | null = null;
  const requests = getDemoRequests().map(request=>{
    if (request.id !== id) return request;
    const next = { ...request,updatedAt:new Date().toISOString() };
    if (patch.status && statuses.includes(patch.status)) next.status=patch.status;
    if (patch.checks) next.checks=patch.checks.slice(0,4).map(Boolean);
    if (typeof patch.notes === "string") next.notes=patch.notes.slice(0,4000);
    if (typeof patch.advisorNote === "string") next.advisorNote=patch.advisorNote.slice(0,4000);
    updated=next; return next;
  });
  if (updated) persist(requests);
  return updated;
}
export function removeDemoRequest(id: string): void { persist(getDemoRequests().filter(request=>request.id !== id)); }
export function resetDemoWorkspace(): void { persist(samples()); }
export function subscribeDemoRequests(listener: ()=>void): ()=>void {
  if (typeof window === "undefined") return ()=>{};
  const storage = (event: StorageEvent) => {if(event.key===KEY) listener();};
  window.addEventListener(EVENT,listener); window.addEventListener("storage",storage);
  return ()=>{window.removeEventListener(EVENT,listener);window.removeEventListener("storage",storage);};
}
export function demoRequestLabel(request: DemoRequest): string { return vehicleName(request.vehicle); }
