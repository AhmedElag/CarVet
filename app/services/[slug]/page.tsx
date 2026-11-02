import type { Metadata } from "@/demo/types";
import Link from "@/demo/navigation";
import { notFound, redirect } from "@/demo/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, FileCheck2 } from "lucide-react";
import { services } from "@/data/services";
import { PackageSupport } from "@/components/PackageSupport";

type Props = { params: Promise<{ slug: string }> };
const aliases: Record<string,string> = { "serious-candidate": "serious-candidate-review", "top-3-decision": "top-3-decision-review" };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const {slug}=await params; const service=services.find(s=>s.slug===(aliases[slug]||slug)); return {title:service ? `${service.title} | CarVet` : "Package not found | CarVet",description:service?.description}; }

export default async function ServicePage({ params }: Props) {
  const {slug}=await params;
  if(aliases[slug]) redirect(`/services/${aliases[slug]}`);
  const service=services.find(s=>s.slug===slug);
  if(!service) notFound();
  const related=services.filter(s=>s.tier===service.tier&&s.slug!==service.slug);
  return <main>
    <section className="cv-container pt-8 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-[#61707a]"><Link href="/" className="hover:text-[#0B3D91]">Home</Link><span>/</span><Link href="/services" className="hover:text-[#0B3D91]">Packages</Link><span>/</span><span className="text-[#142f43]">{service.title}</span></nav>
      <div className="grid gap-9 pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <p className="cv-eyebrow">{service.tier} / {service.tierSubtitle}</p>
          <h1 className="cv-title mt-6 max-w-2xl">{service.title}</h1>
          <p className="mt-6 text-lg leading-8 text-[#405564]">{service.shortDescription}</p>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#61707a]">{service.description}</p>
          <PackageSupport serviceSlug={service.slug} />
          <div className="mt-9 grid gap-4 border-y border-[#dce0dc] py-6 sm:grid-cols-2"><div className="flex items-start gap-3"><FileCheck2 size={19} strokeWidth={1.5} className="mt-1 text-[#5d7d64]"/><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#61707a]">Coverage</p><p className="mt-1 text-sm font-medium text-[#142f43]">{service.coverage}</p></div></div><div className="flex items-start gap-3"><Clock3 size={19} strokeWidth={1.5} className="mt-1 text-[#5d7d64]"/><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#61707a]">Turnaround</p><p className="mt-1 text-sm font-medium text-[#142f43]">{service.turnaround}</p></div></div></div>
          <section className="mt-10"><p className="cv-eyebrow">A CLEAR SCOPE, FROM THE START</p><h2 className="cv-heading mt-3 text-[32px]">What’s included.</h2><ul className="mt-6 grid gap-x-7 gap-y-4 sm:grid-cols-2">{service.included.map(item=><li key={item} className="flex gap-3 text-sm leading-7 text-[#405564]"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e7eddf] text-[#56745d]"><Check size={12}/></span><span>{item}</span></li>)}</ul></section>
          <details className="mt-9 rounded-lg border border-[#dce0dc] bg-white p-5 sm:p-6"><summary className="cursor-pointer text-sm font-semibold text-[#142f43]">What this package does not include</summary><ul className="mt-5 space-y-3 pl-5 text-xs leading-7 text-[#61707a]">{service.notIncluded.map(item=><li className="list-disc" key={item}>{item}</li>)}</ul></details>
          <section className="mt-12"><h2 className="cv-heading text-[32px]">A straightforward next step.</h2><div className="mt-6 grid gap-6 sm:grid-cols-3">{[{n:"01",title:"Share the context",text:"Tell us what you’re considering or what you need."},{n:"02",title:"Understand the evidence",text:"Review the findings, open questions, and priorities."},{n:"03",title:"Decide what comes next",text:"Use your plan to ask, view, inspect, or keep searching."}].map(item=><div key={item.n} className="border-t border-[#cdd7c8] pt-4"><span className="text-[10px] text-[#708475]">{item.n} /</span><h3 className="mt-4 text-sm font-semibold text-[#142f43]">{item.title}</h3><p className="mt-2 text-xs leading-6 text-[#61707a]">{item.text}</p></div>)}</div></section>
        </div>
        <aside className="h-fit lg:sticky lg:top-28"><div className="overflow-hidden rounded-lg border border-[#cfdacc] bg-white"><div className="bg-[#e7eddf] px-6 py-3 text-[10px] font-semibold tracking-[.15em] text-[#42634d]">{service.label} / YOUR PACKAGE</div><div className="p-6 sm:p-7"><p className="text-[36px] font-semibold tracking-[-.05em] text-[#142f43]">{service.price}</p><p className="mt-2 text-xs leading-6 text-[#61707a]">{service.coverage} · {service.turnaround}</p><div className="my-6 border-t border-[#e1e6df]"/><p className="text-sm font-medium leading-6 text-[#142f43]">See how this support would feel.</p><p className="mt-3 text-xs leading-6 text-[#61707a]">Try the complete client journey with a sample request and review.</p><Link href={`/demo?service=${service.slug}`} className="cv-button mt-6 w-full">Try this package <ArrowRight size={15}/></Link><p className="mt-3 text-center text-[10px] text-[#61707a]">Demo intake · no payment taken</p><Link href="/sample-report" className="cv-text-link mt-6 text-xs">Read a sample report <ArrowRight size={13}/></Link></div></div><p className="mt-5 px-1 text-[11px] leading-6 text-[#61707a]">Questions about the right support? <Link href="/contact" className="font-semibold text-[#0B3D91] underline underline-offset-4">Start a conversation.</Link></p></aside>
      </div>
    </section>
    <section className="border-t border-[#dce0dc] bg-[#eef1e9]"><div className="cv-container grid gap-8 py-12 md:grid-cols-[1fr_1fr]"><div><p className="cv-eyebrow">ANOTHER WAY TO APPROACH THIS STAGE</p><h2 className="cv-heading mt-4 text-3xl">A little more perspective.</h2><Link href="/services" className="cv-text-link mt-5 text-xs"><ArrowLeft size={14}/> Back to all packages</Link></div><div>{related.map(item=><Link key={item.slug} href={`/services/${item.slug}`} className="block rounded-lg border border-[#d2dccb] bg-white p-6 transition hover:border-[#0B3D91]"><div className="flex flex-wrap justify-between gap-3"><h3 className="text-lg font-semibold text-[#142f43]">{item.title}</h3><span className="text-sm font-semibold text-[#0B3D91]">{item.price}</span></div><p className="mt-3 text-sm leading-7 text-[#61707a]">{item.shortDescription}</p><span className="mt-5 flex items-center gap-3 text-xs font-semibold text-[#0B3D91]">Explore package <ArrowRight size={14}/></span></Link>)}</div></div></section>
    <div className="cv-container py-7"><p className="text-[11px] leading-6 text-[#61707a]">Demo only. CarVet provides buyer-side guidance. It does not replace a vehicle history report, lien check, test drive, safety certification, or independent mechanic inspection. The final decision stays with you.</p></div>
  </main>;
}
