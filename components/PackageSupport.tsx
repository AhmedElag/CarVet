import Link from "@/demo/navigation";
import { ArrowRight, Cable, Check, Headphones, CalendarCheck } from "lucide-react";
import { getPackageSupport } from "@/data/package-support";

export function PackageSupport({ serviceSlug, compact = false }: { serviceSlug: string; compact?: boolean }) {
  const support = getPackageSupport(serviceSlug);
  const benefits = [
    ...(support.scannerIncluded ? [{ Icon: Cable, title: "Scanner included — yours to keep", text: "The plan is to send a compatible OBD scanner with this package. Keep it after your search and use it on future supported test drives." }] : []),
    ...(support.liveSupport ? [{ Icon: Headphones, title: "Online live advisor support", text: "Higher support packages add a planned online session for questions around the viewing and test drive. Service availability and scheduling will be confirmed before launch." }] : []),
    ...(support.buyingDay ? [{ Icon: CalendarCheck, title: "Support for buying day", text: "The highest package brings the planned scanner and online support into one coordinated buying-day journey, with guidance across the agreed viewings." }] : []),
  ];

  if (compact) return <div className="mt-5 rounded-md border border-[#d6e0d0] bg-[#f1f5ed] px-4 py-3">
    <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6e8265]">Planned package benefits</p>
    <ul className="mt-2 space-y-2 text-[11px] leading-6 text-[#4e6948]">
      {benefits.length ? benefits.map(({ title }) => <li key={title} className="flex items-start gap-2"><Check size={13} className="mt-1 shrink-0" /><span>{title}</span></li>) : <li className="flex items-start gap-2"><Check size={13} className="mt-1 shrink-0" /><span>Review & next-step guidance. Scanner not included at this level.</span></li>}
    </ul>
  </div>;

  return <section className="mt-9 overflow-hidden rounded-lg border border-[#cfdcca] bg-[#f0f4eb]" aria-label="Planned scanner and support benefits">
    <div className="border-b border-[#d8e2d1] px-5 py-5 sm:px-7"><p className="cv-eyebrow !mb-2">THE NEXT CHAPTER / PLANNED PACKAGE BENEFITS</p><h2 className="font-serif text-[29px] leading-tight tracking-tight text-[#142f43]">{support.scannerIncluded ? "More context for the test drive." : "A clear review before the next step."}</h2></div>
    <div className="px-5 py-6 sm:px-7">
      {benefits.length ? <div className="space-y-6">{benefits.map(({ Icon, title, text }) => <div key={title} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d1deca] bg-white text-[#6b845e]"><Icon size={17} strokeWidth={1.5} /></span><div><h3 className="text-sm font-semibold text-[#142f43]">{title}</h3><p className="mt-2 text-xs leading-7 text-[#65765c]">{text}</p></div></div>)}</div> : <p className="text-sm leading-7 text-[#65765c]">This starting package focuses on listing review and next-step guidance. A keep-forever scanner starts with the planned diagnostic packages; online live support and buying-day support sit above that.</p>}
      <div className="mt-6 border-t border-[#d8e2d1] pt-5"><p className="text-[11px] leading-7 text-[#6e7e64]">The future CarVet app would read supported codes and test-drive data through a compatible scanner. Access to engine ECU/DME and other manufacturer-specific data depends on the vehicle, adapter, protocol, and software coverage. This demo uses sample data; it does not connect to a car.</p><Link className="cv-text-link mt-4 inline-flex min-h-11 items-center" href={`/test-drive?service=${serviceSlug}`}>Try the scanner & test-drive story <ArrowRight size={14} /></Link><p className="mt-3 text-[10px] leading-6 text-[#829078]">Planned scope only. No hardware is shipped and no live support is booked in this demo. Hardware choice, delivery, support availability, and final pricing will be confirmed before launch.</p></div>
    </div>
  </section>;
}
