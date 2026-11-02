"use client";

import Link from "@/demo/navigation";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { services } from "@/data/services";
import { PackageSupport } from "@/components/PackageSupport";

const stages = [
  { key: "all", label: "All packages" },
  { key: "Tier 1", label: "I found a listing" },
  { key: "Tier 2", label: "I have serious options" },
  { key: "Tier 3", label: "I need help searching" },
  { key: "Tier 4", label: "I’m ready to view" },
];
const chapters = [
  { tier: "Tier 1", number: "01", title: "Before you chase the listing.", copy: "A little context before you invest more time." },
  { tier: "Tier 2", number: "02", title: "Before it becomes a serious decision.", copy: "Look closer at the cars that made the cut." },
  { tier: "Tier 3", number: "03", title: "Before you search alone.", copy: "Turn your needs into a more focused search." },
  { tier: "Tier 4", number: "04", title: "Before you meet the car.", copy: "Arrive with better questions and a clear plan." },
];

export function PackageExplorer() {
  const [stage, setStage] = useState("all");
  const count = services.filter(s => stage === "all" || s.tier === stage).length;
  return <section className="cv-container pb-20" aria-label="Explore CarVet packages">
    <div className="sticky top-[76px] z-10 -mx-1 border-y border-[#dce0dc] bg-[#fafaf7]/95 px-1 py-4 backdrop-blur-md md:top-[84px]">
      <div className="flex flex-wrap gap-2" aria-label="Choose your buying stage">
        {stages.map(item => <button key={item.key} type="button" onClick={() => setStage(item.key)} aria-pressed={stage === item.key} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition ${stage === item.key ? "border-[#142f43] bg-[#142f43] text-white" : "border-[#d8ded5] bg-transparent text-[#61707a] hover:border-[#142f43] hover:text-[#142f43]"}`}>{item.label}</button>)}
      </div>
    </div>
    <p className="mt-5 text-xs text-[#61707a]" role="status">{count} packages for this stage. Original concept prices; new scanner and support benefits are planned.</p>
    <div className="space-y-14 pt-7">
      {chapters.filter(chapter => stage === "all" || chapter.tier === stage).map(chapter => <section key={chapter.tier} className="grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <div className="pt-1">
          <p className="cv-eyebrow">{chapter.number} / {chapter.tier}</p>
          <h2 className="cv-heading mt-4 text-[30px] leading-tight">{chapter.title}</h2>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#61707a]">{chapter.copy}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {services.filter(service => service.tier === chapter.tier).map(service => <article key={service.slug} className="flex flex-col overflow-hidden rounded-lg border border-[#dce0dc] bg-white">
            <div className={`flex items-center justify-between border-b border-[#dce0dc] px-6 py-3 text-[10px] font-semibold tracking-[.14em] ${service.label === "VALUE" ? "bg-[#e7eddf] text-[#42634d]" : "bg-[#f1f3f0] text-[#61707a]"}`}><span>{service.label}</span><span>{service.coverage}</span></div>
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <h3 className="text-xl font-semibold tracking-tight text-[#142f43]">{service.title}</h3>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="text-[30px] font-semibold tracking-[-.05em] text-[#142f43]">{service.price}</p><span className="text-[11px] text-[#61707a]">{service.turnaround}</span></div>
              <p className="mt-4 text-sm leading-7 text-[#61707a]">{service.shortDescription}</p>
              <PackageSupport serviceSlug={service.slug} compact />
              <ul className="mb-7 mt-5 space-y-3 text-xs leading-6 text-[#405564]">{service.bullets.map(item => <li key={item} className="flex items-start gap-2.5"><Check size={14} strokeWidth={1.5} className="mt-1 shrink-0 text-[#62816a]" /><span>{item}</span></li>)}</ul>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e8e3] pt-4"><Link className="cv-text-link min-h-11 items-center text-xs" href={`/services/${service.slug}`}>Explore package <ArrowRight size={14} /></Link><Link className="inline-flex min-h-11 items-center text-xs font-semibold text-[#0B3D91] underline underline-offset-4" href={`/demo?service=${service.slug}`}>Try the demo</Link></div>
            </div>
          </article>)}
        </div>
      </section>)}
    </div>
  </section>;
}
