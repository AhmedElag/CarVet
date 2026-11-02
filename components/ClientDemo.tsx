"use client";

import Link from "@/demo/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Car, Check, ClipboardList, Download, FileText, Scale, ShieldCheck, X } from "lucide-react";
import { services } from "@/data/services";
import { saveDemoRequest, updateDemoRequest } from "@/lib/demo-store";
import { getPackageSupport } from "@/data/package-support";
import { PackageSupport } from "@/components/PackageSupport";
import { requestSampleMatch } from "@/demo/sample-match";

type Vehicle = {
  id: string; year: number; make: string; model: string; price_cad: number;
  mileage_km: number; seats: number; body: string; powertrain: string;
  drivetrain: string; accident_history: string; range_km: number;
  score: number; reasons: string[]; tradeoff?: string;
};
type MatchResult = {
  results: Vehicle[]; total_matches: number; inventory_count: number;
  constraints: { budget: number; max_mileage: number; min_seats: number; body?: string; powertrain?: string; awd?: boolean; clean_only?: boolean; exclude_electric?: boolean };
};
type Brief = { text: string; budget: string; max_mileage: string; min_seats: string; body: string; powertrain: string; awd: boolean; clean_only: boolean };
const emptyBrief: Brief = { text: "", budget: "35000", max_mileage: "120000", min_seats: "5", body: "any", powertrain: "any", awd: false, clean_only: false };
const sampleBriefs: Record<string, { name: string; caption: string; brief: Brief }> = {
  family: { name: "Maya & Omar", caption: "Room for a growing family", brief: { ...emptyBrief, text: "We need a family SUV for school runs, snowy roads, and weekend camping. Space for kids and cargo matters most.", body: "suv", awd: true } },
  commute: { name: "Alex", caption: "A better everyday commute", brief: { ...emptyBrief, text: "I am buying my first car for an efficient daily city commute. I want something affordable and easy to park.", budget: "22000", max_mileage: "150000" } },
  electric: { name: "Sam", caption: "Ready for an electric daily driver", brief: { ...emptyBrief, text: "I want an electric daily driver with useful range. I can charge at home and would like help checking the battery evidence.", budget: "40000", powertrain: "electric" } },
};
const currency = (n: number) => `C$${n.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
const kilometres = (n: number) => `${n.toLocaleString("en-CA")} km`;
const vehicleName = (v: Vehicle) => `${v.year} ${v.make} ${v.model}`;
const readable = (text: string) => text.replaceAll("_", " ").replace(/^./, char => char.toUpperCase());
const button = "cv-button disabled:cursor-wait disabled:opacity-50";
const secondary = "cv-button-outline";
const input = "mt-2 w-full rounded-md border border-[#ccd3cd] bg-white px-3.5 py-3 text-base text-[#142f43] focus:border-[#0B3D91] focus:outline-2 focus:outline-offset-2 focus:outline-[#0B3D91]";
const label = "block text-xs font-semibold text-[#142f43]";
function reviewEvidence(v: Vehicle) {
  const ev = v.powertrain === "electric";
  const history = v.accident_history === "reported"
    ? "The sample catalog records an accident. Repair details and supporting documents are missing. Ask for the full history report and repair invoices."
    : v.accident_history === "unknown"
      ? "History is unknown in the sample catalog. Request a current vehicle history report before drawing conclusions."
      : "The sample catalog says no accidents reported. Confirm this with a current history report and repair records; the catalog field is not independent verification.";
  return [
    { title: "The listing, at a glance", source: "Sample catalog", note: `${currency(v.price_cad)} asking price · ${kilometres(v.mileage_km)} · ${v.seats} seats · ${v.drivetrain}. These supplied fields have not been independently verified.`, status: "Provided" },
    { title: "The history so far", source: "Sample history field", note: history, status: v.accident_history === "reported" ? "Follow up" : "Confirm" },
    { title: ev ? "The battery question" : "The maintenance gap", source: "Illustrative evidence gap", note: ev ? "A battery health assessment is missing. The catalog range is a supplied value, not measured current range. Ask a qualified EV technician to check battery condition." : "In this sample review, the service history is incomplete. Ask for dated invoices and confirmation of any work that is due.", status: "Missing" },
    { title: "Before the next step", source: "Sample inspection checklist", note: ev ? "Inspect tire condition, test charging, and confirm the included equipment. Arrange a qualified EV inspection. No physical inspection has taken place in this demo." : "Ask for a cold start, check tire wear, and arrange an independent inspection with a diagnostic scan. No physical inspection or scan has taken place in this demo.", status: "Next step" },
  ];
}
function nextSteps(v: Vehicle) {
  const ev = v.powertrain === "electric";
  return [
    { title: "Ask for the missing records", text: ev ? "Request a current history report, battery health information, and service records." : "Request a current history report, dated service invoices, and repair documentation." },
    { title: "Prepare for the viewing", text: ev ? "Confirm charging works and check which charging equipment is included." : "Arrange a cold start and ask about warning lights, tire wear, and recent repairs." },
    { title: "Arrange an independent inspection", text: ev ? "Choose a qualified EV technician and include battery diagnostics." : "Use an independent mechanic and include a diagnostic scan." },
    { title: "Review the evidence before deciding", text: "Confirm total cost and unresolved findings before considering an offer or deposit." },
  ];
}

function TestDriveBridge({ serviceSlug }: { serviceSlug: string }) {
  const support = getPackageSupport(serviceSlug);
  return <section className="mt-6 rounded-lg border border-[#d4dfce] bg-[#edf2e7] p-5 sm:p-6 print:hidden" aria-label="Planned test-drive support">
    <p className="cv-eyebrow !mb-3 !text-[9px]">THE NEXT CHAPTER / PLANNED PACKAGE EXPERIENCE</p>
    <h3 className="font-serif text-[28px] leading-tight tracking-tight">{support.scannerIncluded ? "Your scanner. Your test drives." : "See what a test drive could reveal."}</h3>
    <p className="mt-3 text-xs leading-7 text-[#60735b]">{support.scannerIncluded ? "A scanner would be shipped with this package and stay yours to keep. The future CarVet app would record supported vehicle data during your test drives." : "This review package does not include the planned scanner. You can still explore the test-drive concept before choosing more support."}</p>
    <p className="mt-3 text-[11px] leading-6 text-[#74816c]">Try a recorded sample session now. Actual scanner connection and ECU/DME coverage come later, with compatible hardware, software, and vehicles.</p>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link href={`/test-drive?service=${serviceSlug}`} className="cv-button min-h-11">Try the test-drive demo <ArrowRight size={15} /></Link>
      {support.liveSupport && <Link href={`/test-drive?service=${serviceSlug}&tab=support`} className="cv-button-outline min-h-11">Preview online support <ArrowRight size={15} /></Link>}
      {support.buyingDay && <Link href={`/test-drive?service=${serviceSlug}&tab=buying-day`} className="cv-button-outline min-h-11">Explore the buying day <ArrowRight size={15} /></Link>}
    </div>
    {(support.liveSupport || support.buyingDay) && <p className="mt-3 text-[10px] leading-6 text-[#74816c]">{support.buyingDay ? "Planned: buying-day guidance, with online support included. The preview is scripted; no booking or live advisor connection is made." : "Planned: online live customer support for the viewing and test-drive questions. The preview is scripted; no live advisor connection is made."}</p>}
  </section>;
}

export function ClientDemo({ initialService, initialScenario }: { initialService?: string; initialScenario?: string }) {
  const startingScenario = initialScenario && Object.hasOwn(sampleBriefs, initialScenario) ? initialScenario : "";
  const [serviceSlug, setServiceSlug] = useState(initialService || "find-me-options");
  const [step, setStep] = useState(initialService || startingScenario ? 1 : 0);
  const [brief, setBrief] = useState<Brief>({ ...(startingScenario ? sampleBriefs[startingScenario].brief : emptyBrief) });
  const [activeSample, setActiveSample] = useState(startingScenario);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareNotice, setCompareNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [notes, setNotes] = useState("");
  const [savedId, setSavedId] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const reportRef = useRef<HTMLElement>(null);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const service = services.find(item => item.slug === serviceSlug) || services[4];
  const shortlistFlow = ["find-me-options", "30-day-market-watch", "listing-shortlist-scan", "top-3-decision-review"].includes(service.slug);
  const steps = ["Your package", "Your story", shortlistFlow ? "Your shortlist" : "Your review", "Your next move"];
  const shownResults = result ? shortlistFlow ? result.results.slice(0, service.slug === "top-3-decision-review" ? 3 : 5) : selected ? [selected] : [] : [];
  const comparisonVehicles = result?.results.filter(vehicle => compared.includes(vehicle.id)) || [];
  function move(next: number) { setStep(next); setError(""); window.scrollTo({ top: 0, behavior: "instant" }); }
  function clearSelection() {
    setResult(null); setSelected(null); setCompared([]); setCompareNotice(""); setChecks([false, false, false, false]); setNotes(""); setSavedId(""); setSaveNotice("");
  }
  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief(old => ({ ...old, [key]: value })); clearSelection(); setActiveSample("");
  }
  function sample(key: string) { setBrief({ ...sampleBriefs[key].brief }); setActiveSample(key); clearSelection(); setError(""); }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const body = await requestSampleMatch(brief);
      setResult(body); setSelected(body.results[0] || null); setCompared([]); setChecks([false, false, false, false]); setNotes(""); setSavedId(""); setSaveNotice(""); move(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t prepare the sample options. Please try again.");
    } finally { setBusy(false); }
  }
  function choose(v: Vehicle) {
    if (selected?.id !== v.id) { setSelected(v); setChecks([false, false, false, false]); setNotes(""); setSavedId(""); setSaveNotice(""); }
    comparisonDialog.current?.close();
    requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function toggleCompare(id: string) {
    if (compared.includes(id)) { setCompared(old => old.filter(value => value !== id)); setCompareNotice(""); }
    else if (compared.length < 3) { setCompared(old => [...old, id]); setCompareNotice(""); }
    else setCompareNotice("Choose up to three cars. Remove one to compare another.");
  }
  function saveWorkspace() {
    if (!selected || !result) return;
    try {
      if (!savedId || !updateDemoRequest(savedId, { checks, notes })) {
        setSavedId(saveDemoRequest({ serviceSlug, brief: { ...brief }, vehicle: selected, results: result.results, checks, notes }));
      }
      setSaveNotice("Saved on this browser. Open the demo workspace to follow this sample request.");
    } catch { setSaveNotice("This browser couldn’t save the plan. You can still download or print it."); }
  }
  function savePlan() {
    if (!selected) return;
    const content = `CARVET — SAMPLE DECISION PLAN\n\nPackage: ${service.title} (${service.price})\nVehicle: ${vehicleName(selected)}\n${currency(selected.price_cad)} | ${kilometres(selected.mileage_km)} | ${selected.drivetrain}\n\nYOUR STORY\n${brief.text || "Sample buyer request"}\n\nSAMPLE REVIEW\n${reviewEvidence(selected).map(item => `${item.title} [${item.source}]\n${item.note}`).join("\n\n")}\n\nYOUR NEXT STEPS\n${nextSteps(selected).map((item, i) => `[${checks[i] ? "x" : " "}] ${item.title}\n${item.text}`).join("\n\n")}\n\nYOUR NOTES\n${notes || "No notes added."}\n\nDEMO ONLY: Synthetic inventory and illustrative evidence. No real inspection, advisor submission, payment, or booking has taken place.\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `CarVet-${selected.id}-Sample-Plan.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="text-[#142f43]">
    <div className="border-b border-[#dce2d8] bg-[#eaf0e4] px-5 py-3 text-center text-[11px] leading-5 text-[#50654c] print:hidden"><strong>Interactive demo</strong> · Sample vehicles, browser-only filtering, and illustrative reviews. No payment or booking.</div>
    <div className="cv-container py-9 sm:py-14 print:p-0">
      <div className="mb-9 flex flex-wrap items-start justify-between gap-5 print:hidden">
        <div><p className="cv-eyebrow">A LITTLE GUIDANCE. A CLEARER ROAD.</p><h1 className="cv-title mt-3 max-w-3xl">Let’s start with<br className="hidden sm:block" /> your next chapter.</h1><p className="cv-lede mt-5 max-w-xl">A package that fits your situation. A review you understand. One practical step at a time.</p></div>
        <Link href="/workspace" className="cv-text-link mt-2">Explore the demo workspace <ArrowRight size={15} /></Link>
      </div>
      <nav className="mb-9 grid grid-cols-4 gap-2 border-b border-[#d5dcd3] print:hidden" aria-label="Request stages">
        {steps.map((text, i) => <button key={text} type="button" onClick={() => move(i)} disabled={busy || (i >= 2 && !result) || (i === 3 && !selected)} aria-current={step === i ? "step" : undefined} className={`flex min-h-20 flex-col items-start gap-2 border-b-2 px-1 pb-4 pt-2 text-left text-[10px] font-semibold sm:flex-row sm:items-center sm:gap-3 sm:px-2 sm:text-xs ${step === i ? "border-[#142f43] text-[#142f43]" : "border-transparent text-[#768179]"} disabled:cursor-not-allowed disabled:opacity-40`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${step === i ? "border-[#142f43] bg-[#142f43] text-white" : i < step ? "border-[#d2dec9] bg-[#e7eddf] text-[#56714e]" : "border-[#cbd2ca]"}`}>{i < step ? <Check size={13} /> : i + 1}</span>{text}</button>)}
      </nav>

      {step === 0 && <section>
        <div className="mb-8 max-w-2xl"><p className="cv-eyebrow">CHAPTER 01 / THE RIGHT SUPPORT</p><h2 className="cv-heading mt-3">Where are you in your search?</h2><p className="mt-4 text-sm leading-7 text-[#67756d]">Start with the stage you’re at. Every package below opens a sample client journey, without a checkout.</p></div>
        {["Tier 1", "Tier 2", "Tier 3", "Tier 4"].map(tier => <div key={tier} className="mb-9 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="pt-3"><p className="cv-eyebrow">{tier}</p><h3 className="mt-3 font-serif text-2xl leading-tight tracking-tight">{services.find(item => item.tier === tier)?.tierSubtitle}</h3></div>
          <div className="grid gap-4 md:grid-cols-2">{services.filter(item => item.tier === tier).map(item => <button type="button" key={item.slug} onClick={() => { setServiceSlug(item.slug); clearSelection(); move(1); }} className="group overflow-hidden rounded-lg border border-[#d9dfd5] bg-white text-left transition hover:border-[#9cad9c] hover:shadow-sm"><div className="flex items-center justify-between border-b border-[#e5e9e0] bg-[#f0f3ec] px-5 py-2.5"><span className="text-[9px] font-semibold tracking-[.13em] text-[#56714e]">{item.label}</span><span className="text-xs font-semibold">{item.price}</span></div><div className="p-6"><h4 className="font-serif text-2xl tracking-tight">{item.title}</h4><p className="mt-3 text-xs leading-6 text-[#67756d]">{item.shortDescription}</p><p className="mt-6 inline-flex items-center gap-3 text-xs font-semibold text-[#0B3D91]">Try this package <ArrowRight size={14} /></p></div></button>)}</div>
        </div>)}
      </section>}

      {step > 0 && <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 print:block">
        <aside className="print:hidden"><div className="overflow-hidden rounded-lg border border-[#d9dfd5] bg-white"><div className="border-b border-[#e0e7db] bg-[#eaf0e4] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.13em] text-[#56714e]">Your selected package</div><div className="p-6"><h2 className="font-serif text-2xl leading-snug tracking-tight">{service.title}</h2><p className="mt-4 text-2xl font-semibold tracking-tight text-[#0B3D91]">{service.price}</p><p className="mt-4 text-xs leading-6 text-[#67756d]">{service.shortDescription}</p><div className="mt-5 border-t border-[#e0e6dc] pt-4 text-[11px] text-[#67756d]"><p className="font-semibold text-[#142f43]">{service.coverage}</p><p className="mt-2">{service.turnaround}</p></div><button type="button" onClick={() => move(0)} disabled={busy} className="cv-text-link mt-5 min-h-11 text-xs">Change package <ArrowLeft size={13} /></button></div></div><div className="mt-5 flex items-start gap-3 px-1 text-[11px] leading-6 text-[#67756d]"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#6e8a64]" /><p>A car that meets your requirements still deserves a careful review. Demo results are ordered by asking price; they do not rate vehicle condition.</p></div><div className="mt-6"><PackageSupport serviceSlug={service.slug} compact /></div></aside>
        <div className="min-w-0">
          {step === 1 && <section>
            <p className="cv-eyebrow">CHAPTER 02 / YOUR STORY</p><h2 className="cv-heading mt-3">Start with your life.</h2><p className="mt-4 text-sm leading-7 text-[#67756d]">{shortlistFlow ? "School runs, city commutes, or weekends away. Tell us what your next car needs to make possible." : "Try a sample buyer request. A suitable sample car will show how the review unfolds."}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Sample requests">{Object.entries(sampleBriefs).map(([key, value]) => <button key={key} type="button" aria-pressed={activeSample === key} disabled={busy} onClick={() => sample(key)} className={`rounded-md border px-4 py-3 text-left ${activeSample === key ? "border-[#a7bba0] bg-[#e7eddf]" : "border-[#d9dfd5] bg-white hover:border-[#a7bba0]"}`}><span className="block text-xs font-semibold">{value.name}</span><span className="mt-1 block text-[10px] leading-5 text-[#67756d]">{value.caption}</span></button>)}</div>
            <form onSubmit={submit} className="mt-5 rounded-lg border border-[#d9dfd5] bg-white p-5 sm:p-7" aria-busy={busy}><fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
              <label className={label} htmlFor="buyer-story">What’s your next chapter?<span className="mt-1 block text-[11px] font-normal leading-6 text-[#67756d]">Everyday needs, weekend plans, or what matters most.</span></label><textarea id="buyer-story" maxLength={4000} value={brief.text} onChange={e => update("text", e.target.value)} className={`${input} min-h-28`} placeholder="I’m looking for a family car for school runs and weekend trips…" />
              <p className="mt-5 text-[11px] leading-6 text-[#67756d]">The fields below set your requirements and take priority over your story. Vehicle prices are before taxes and fees.</p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className={label}>Maximum vehicle price · CAD<input className={input} type="number" min="1" max="2000000" step="1" inputMode="numeric" required value={brief.budget} onChange={e => update("budget", e.target.value)} /></label>
                <label className={label}>Maximum odometer · km<input className={input} type="number" min="0" max="2000000" step="1" inputMode="numeric" required value={brief.max_mileage} onChange={e => update("max_mileage", e.target.value)} /></label>
                <label className={label}>Seats needed<select className={input} value={brief.min_seats} onChange={e => update("min_seats", e.target.value)}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option value={n} key={n}>At least {n}</option>)}</select></label>
                <label className={label}>Body style<select className={input} value={brief.body} onChange={e => update("body", e.target.value)}>{[["any", "Any / from your story"], ["suv", "SUV"], ["sedan", "Sedan"], ["hatchback", "Hatchback"], ["wagon", "Wagon"], ["minivan", "Minivan"], ["truck", "Truck"], ["coupe", "Coupe"]].map(([key, text]) => <option value={key} key={key}>{text}</option>)}</select></label>
                <label className={`${label} sm:col-span-2`}>Powertrain<select className={input} value={brief.powertrain} onChange={e => update("powertrain", e.target.value)}>{[["any", "Any / from your story"], ["gas", "Gas"], ["hybrid", "Hybrid"], ["electric", "Electric"], ["diesel", "Diesel"]].map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3"><label className="flex items-start gap-2 text-xs leading-6 text-[#52645b]"><input className="mt-1 h-4 w-4 accent-[#142f43]" type="checkbox" checked={brief.awd} onChange={e => update("awd", e.target.checked)} />AWD / 4WD required</label><label className="flex items-start gap-2 text-xs leading-6 text-[#52645b]"><input className="mt-1 h-4 w-4 accent-[#142f43]" type="checkbox" checked={brief.clean_only} onChange={e => update("clean_only", e.target.checked)} />No accidents reported in catalog</label></div>
              {error && <p role="alert" className="mt-5 rounded-md border border-[#e4c8bb] bg-[#fff2e9] p-4 text-xs leading-6 text-[#8e472c]">{error}</p>}
              <div className="mt-7 flex flex-col justify-between gap-4 border-t border-[#e0e6dc] pt-5 sm:flex-row sm:items-center"><p className="max-w-xs text-[10px] leading-6 text-[#67756d]">Browser-only sample inventory. Nothing is sent to an advisor. Your limits stay in place until you change them. Eligible cars appear by lowest asking price, then lower odometer.</p><button className={button} type="submit" disabled={busy}>{busy ? "Preparing your options…" : shortlistFlow ? "Find my sample options" : "See a sample review"}<ArrowRight size={15} /></button></div>
            </fieldset></form>
          </section>}

          {step === 2 && result && <section>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="cv-eyebrow">CHAPTER 03 / {shortlistFlow ? "YOUR POSSIBILITIES" : "THE CAR’S STORY"}</p><h2 className="cv-heading mt-3">{result.results.length ? shortlistFlow ? "A shortlist. A clear reason." : "Know what to check next." : "Let’s rethink the search."}</h2></div><button type="button" onClick={() => move(1)} className="cv-text-link text-xs">Edit requirements <ArrowLeft size={13} /></button></div>
            <p className="mt-4 text-sm leading-7 text-[#67756d]">{shortlistFlow ? `${result.total_matches} of ${result.inventory_count} sample cars meet every active requirement.${result.total_matches > shownResults.length ? ` Showing the top ${shownResults.length}.` : ""}` : result.results.length ? "A sample candidate prepared from your request. No real listing has been imported or inspected." : "No sample candidate meets every requirement."}</p>
            <div className="mt-4 flex flex-wrap gap-2">{[`${currency(result.constraints.budget)} maximum`, `${kilometres(result.constraints.max_mileage)} maximum`, `${result.constraints.min_seats}+ seats`, ...(result.constraints.body ? [result.constraints.body.toUpperCase()] : []), ...(result.constraints.powertrain ? [readable(result.constraints.powertrain)] : []), ...(result.constraints.awd ? ["AWD / 4WD"] : []), ...(result.constraints.clean_only ? ["No accidents reported"] : []), ...(result.constraints.exclude_electric ? ["No electric"] : [])].map(text => <span key={text} className="cv-pill">{text}</span>)}</div>
            {service.slug === "30-day-market-watch" && <p className="mt-5 rounded-md border border-[#d4dfcd] bg-[#edf2e7] p-4 text-xs leading-6 text-[#56714e]">This is a sample first shortlist. A recurring market watch is not running in this demo.</p>}
            {!result.results.length ? <div className="mt-6 rounded-lg border border-dashed border-[#becbbc] bg-white p-8 text-center"><h3 className="font-serif text-3xl tracking-tight">Your limits stay in place.</h3><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#67756d]">No sample car meets every requirement. Change one limit or try a different sample story to continue.</p><button type="button" className={`${button} mt-6`} onClick={() => move(1)}>Edit my story <ArrowLeft size={15} /></button></div> : <>
              <div className="mt-6 grid gap-4">{shownResults.map((v, i) => <article key={v.id} className={`overflow-hidden rounded-lg border bg-white ${selected?.id === v.id ? "border-[#a7b99e]" : "border-[#d9dfd5]"}`}>
                <div className="grid gap-5 p-5 sm:grid-cols-[90px_minmax(0,1fr)] sm:p-6"><div className={`flex min-h-20 items-center justify-center rounded-md ${v.powertrain === "electric" ? "bg-[#e4edf0] text-[#6e8d96]" : "bg-[#e7eddf] text-[#819374]"}`}><Car size={49} strokeWidth={1.2} aria-hidden="true" /></div><div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#7a877e]">{shortlistFlow ? i === 0 ? "First to explore" : `Another possibility` : "Sample candidate"} · {v.id}</p><h3 className="mt-2 text-lg font-semibold tracking-tight">{vehicleName(v)}</h3><p className="mt-2 text-[11px] text-[#67756d]">{kilometres(v.mileage_km)} · {v.seats} seats · {v.drivetrain} · {readable(v.powertrain)}</p></div><p className="text-xl font-semibold tracking-tight text-[#0B3D91]">{currency(v.price_cad)}<span className="mt-1 block text-[9px] font-normal tracking-normal text-[#7a877e]">before taxes & fees</span></p></div><p className="mt-4 text-xs leading-6 text-[#67756d]">{v.reasons?.slice(0, 2).join(" ")}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e8df] pt-3"><span className="text-[10px] text-[#67805d]">{v.score}% of your price limit remains · sample only</span><button className="cv-text-link min-h-11 text-xs" type="button" onClick={() => choose(v)}>{selected?.id === v.id ? "View selected review" : "Read this car’s story"}<ArrowRight size={13} /></button></div></div></div>
                {shortlistFlow && <label className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-[#e3e8df] bg-[#f8f9f5] px-5 py-3 text-[10px] text-[#67756d]"><input className="h-5 w-5 shrink-0 accent-[#142f43]" type="checkbox" checked={compared.includes(v.id)} onChange={() => toggleCompare(v.id)} />Compare {vehicleName(v)}</label>}
              </article>)}</div>
              {shortlistFlow && <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5dfcf] bg-[#e7eddf] px-5 py-3 print:hidden"><p className="text-[11px] text-[#56714e]">{compared.length ? `${compared.length} of 3 cars selected` : "A little perspective helps. Compare up to three cars."}</p><button type="button" className="cv-text-link min-h-11 text-xs disabled:cursor-not-allowed disabled:opacity-40" disabled={comparisonVehicles.length < 2} onClick={() => comparisonDialog.current?.showModal()}><Scale size={14} /> Compare side by side</button></div>}
              {compareNotice && <p role="status" className="mt-3 text-xs text-[#8e612f]">{compareNotice}</p>}
              <section ref={reportRef} className="mt-9 scroll-mt-24 overflow-hidden rounded-lg border border-[#d9dfd5] bg-white" aria-label="Selected sample vehicle review">{selected && <>
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#dce4d5] bg-[#eaf0e4] p-6 sm:p-7"><div><p className="cv-eyebrow">SAMPLE CARVET BUYER REPORT</p><h3 className="mt-3 font-serif text-3xl tracking-tight">{vehicleName(selected)}</h3><p className="mt-3 text-xs text-[#67756d]">{currency(selected.price_cad)} · {kilometres(selected.mileage_km)} · {selected.drivetrain}</p></div><span className="rounded-md border border-[#e5d3a1] bg-[#fff2c9] px-3 py-2 text-[10px] font-semibold text-[#77612d]">More evidence needed</span></div>
                <div className="p-6 sm:p-7"><p className="text-sm leading-7 text-[#67756d]">This car fits your stated requirements. Now we ask a different question: what evidence would help you decide?</p><div className="mt-7 space-y-6">{reviewEvidence(selected).map((item, i) => <div key={item.title} className="flex gap-4"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${item.status === "Missing" ? "border-[#dedbc9] bg-[#f8f2df] text-[#8e794b]" : "border-[#d7e1cf] bg-[#edf3e8] text-[#6a825f]"}`}>{i + 1}</span><div><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">{item.title}</h4><span className="text-[9px] uppercase tracking-[.08em] text-[#7c8c80]">{item.status}</span></div><p className="mt-1 text-[10px] text-[#8b978e]">{item.source}</p><p className="mt-2 text-xs leading-7 text-[#67756d]">{item.note}</p></div></div>)}</div><div className="mt-7 border-t border-[#e0e6dc] pt-5"><p className="text-[10px] leading-6 text-[#7a877e]">Illustrative review only. It is not a completed inspection, verified history report, or assurance about a real car.</p><TestDriveBridge serviceSlug={service.slug} /><button type="button" className={`${button} mt-5`} onClick={() => move(3)}>Build my next steps <ArrowRight size={15} /></button></div></div>
              </>}</section>
            </>}
          </section>}

          {step === 3 && selected && <section>
            <div className="mb-6"><p className="cv-eyebrow">CHAPTER 04 / THE ROAD AHEAD</p><h2 className="cv-heading mt-3">Clarity for your next move.</h2><p className="mt-4 text-sm leading-7 text-[#67756d]">{vehicleName(selected)} · {service.title}</p></div>
            <div className="rounded-lg border border-[#d9dfd5] bg-white p-5 sm:p-7"><div className="mb-4 flex items-center gap-3"><ClipboardList size={24} className="text-[#6e8a64]" /><h3 className="font-serif text-2xl tracking-tight">First, close the gaps.</h3></div><p className="text-xs leading-7 text-[#67756d]">Bring these questions to the seller and your independent inspector.</p><div className="mt-4">{nextSteps(selected).map((item, i) => <label key={item.title} className="flex cursor-pointer items-start gap-3 border-b border-[#e3e8df] py-5 last:border-0"><input className="mt-1 h-5 w-5 shrink-0 accent-[#56714e]" type="checkbox" checked={checks[i]} onChange={e => { setChecks(old => old.map((value, index) => index === i ? e.target.checked : value)); setSaveNotice(""); }} /><span><strong className={`block text-xs font-semibold ${checks[i] ? "text-[#8b978e] line-through" : "text-[#142f43]"}`}>{item.title}</strong><span className="mt-2 block text-xs leading-6 text-[#67756d]">{item.text}</span></span></label>)}</div><p className="mt-4 text-[11px] font-semibold text-[#67805d]" aria-live="polite">{checks.filter(Boolean).length} of 4 next steps checked</p><label className={`${label} mt-6`}>Your notes<textarea className={`${input} min-h-24 print:hidden`} maxLength={4000} value={notes} onChange={e => { setNotes(e.target.value); setSaveNotice(""); }} placeholder="Questions to ask, records to request, or anything to remember…" /><span className="hidden whitespace-pre-wrap pt-3 text-sm font-normal print:block">{notes || "No notes added."}</span></label></div>
            <TestDriveBridge serviceSlug={service.slug} /><div className="hidden print:block"><h3 className="mt-7 text-xl font-semibold">Sample evidence review</h3>{reviewEvidence(selected).map(item => <div key={item.title} className="mt-4"><strong className="text-sm">{item.title} · {item.source}</strong><p className="mt-1 text-xs leading-6">{item.note}</p></div>)}</div>
            <div className="mt-5 rounded-lg border border-[#d7e1cf] bg-[#eaf0e4] p-5 print:hidden"><p className="text-xs font-semibold">Keep the story together.</p><p className="mt-2 text-[11px] leading-6 text-[#67756d]">Explicitly save this sample plan to your demo workspace. It stays on this browser, where you can preview client and advisor views.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={button} onClick={saveWorkspace}><Bookmark size={14} />{savedId ? "Update saved plan" : "Save to demo workspace"}</button>{savedId && <Link href={`/workspace?request=${encodeURIComponent(savedId)}`} className={secondary}>Open saved request <ArrowRight size={14} /></Link>}</div>{saveNotice && <p className="mt-3 text-[11px] leading-6 text-[#56714e]" role="status">{saveNotice}</p>}</div>
            <div className="mt-5 flex flex-wrap gap-3 print:hidden"><button type="button" className={secondary} onClick={savePlan}>Download plan <Download size={14} /></button><button type="button" className={secondary} onClick={() => window.print()}>Print / save PDF <FileText size={14} /></button><button type="button" className="cv-text-link min-h-11 text-xs" onClick={() => move(2)}>Back to review <ArrowLeft size={13} /></button></div>
            <p className="mt-5 text-[10px] leading-6 text-[#7a877e]">Demo only: synthetic inventory and illustrative evidence. Checked boxes record your progress, not vehicle verification. No real advisor submission, payment, booking, or live market watch has taken place.</p>
            <button type="button" className="cv-text-link mt-5 min-h-11 text-xs print:hidden" onClick={() => { clearSelection(); setBrief({ ...emptyBrief }); setActiveSample(""); move(0); }}>Start another sample request <ArrowRight size={13} /></button>
          </section>}
        </div>
      </div>}
    </div>

    <dialog ref={comparisonDialog} aria-labelledby="comparison-title" className="w-[calc(100%_-_32px)] max-h-[calc(100dvh_-_32px)] max-w-4xl overflow-auto rounded-xl border border-[#d9dfd5] bg-[#fafaf7] p-5 text-[#142f43] shadow-2xl backdrop:bg-[#142f4380] sm:p-8" onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) comparisonDialog.current?.close(); } }}>
      <div className="flex items-start justify-between gap-5"><div><p className="cv-eyebrow">YOUR SHORTLIST / SIDE BY SIDE</p><h2 id="comparison-title" className="cv-heading mt-3">A little perspective.</h2></div><button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d4dcd0]" aria-label="Close comparison" onClick={() => comparisonDialog.current?.close()}><X size={16} /></button></div>
      <p className="mt-4 max-w-xl text-xs leading-7 text-[#67756d]">Every car meets your requirements. Compare the tradeoffs, then read the evidence about the one you want to explore.</p>
      <p className="mt-5 text-[11px] leading-6 text-[#75836e] sm:hidden">Swipe the comparison table sideways to see every car.</p><div className="mt-3 overflow-x-auto overscroll-x-contain rounded-md focus-visible:outline-2 focus-visible:outline-[#0B3D91]" tabIndex={0} role="region" aria-label="Scrollable vehicle comparison"><table className="w-full min-w-[550px] border-collapse text-left text-xs"><thead><tr><th scope="col" className="border-b border-[#dce2d8] p-3 text-[10px] font-normal text-[#7a877e]">Sample cars</th>{comparisonVehicles.map(v => <th key={v.id} scope="col" className="border-b border-[#dce2d8] p-3 font-semibold">{vehicleName(v)}</th>)}</tr></thead><tbody>
        {[
          ["Asking price", (v: Vehicle) => currency(v.price_cad)],
          ["Odometer", (v: Vehicle) => kilometres(v.mileage_km)],
          ["Seats / body", (v: Vehicle) => `${v.seats} · ${v.body.toUpperCase()}`],
          ["Powertrain", (v: Vehicle) => `${readable(v.powertrain)} · ${v.drivetrain}`],
          ["Supplied EV range", (v: Vehicle) => v.powertrain === "electric" ? `${v.range_km} km` : "Not applicable"],
          ["Budget room", (v: Vehicle) => `${v.score}% below price limit`],
          ["History field", (v: Vehicle) => readable(v.accident_history)],
          ["Evidence to request", (v: Vehicle) => v.powertrain === "electric" ? "Battery assessment & records" : "Service & repair records"],
        ].map(([heading, value]) => <tr key={heading as string}><th scope="row" className="border-b border-[#dce2d8] p-3 text-[11px] font-normal text-[#67756d]">{heading as string}</th>{comparisonVehicles.map(v => <td key={v.id} className="border-b border-[#dce2d8] p-3 leading-6">{(value as (v: Vehicle) => string)(v)}</td>)}</tr>)}
        <tr><th scope="row" className="p-3 font-normal text-[#67756d]">Next step</th>{comparisonVehicles.map(v => <td key={v.id} className="p-3"><button type="button" className="cv-text-link min-h-11 text-[11px]" onClick={() => choose(v)}>Read car’s story <ArrowRight size={12} /></button></td>)}</tr>
      </tbody></table></div><p className="mt-5 text-[10px] leading-6 text-[#7a877e]">All entries are sample data. Results are ordered by lowest asking price, then lower odometer. Budget room is the percentage of your price limit left; it is not a condition, safety, or reliability score.</p>
    </dialog>
  </main>;
}
