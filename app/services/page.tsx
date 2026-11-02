import type { Metadata } from "@/demo/types";
import Link from "@/demo/navigation";
import { ArrowRight, ShieldCheck, MessageSquareText, Route, Cable, Headphones, CalendarCheck, FileCheck2 } from "lucide-react";
import { PackageExplorer } from "@/components/PackageExplorer";

export const metadata: Metadata = { title: "Packages | CarVet", description: "Explore eight CarVet packages for every stage of your used-car search, from a listing review to viewing support." };

export default function ServicesPage() {
  return <main>
    <section className="cv-container cv-section">
      <p className="cv-eyebrow">A LITTLE HELP AT THE RIGHT MOMENT</p>
      <div className="mt-6 grid items-end gap-7 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div><h1 className="cv-title">Your search.<br /><em className="font-normal text-[#56745d]">Your kind of support.</em></h1></div>
        <div className="pb-2"><p className="cv-lede">A listing worth a closer look. A shortlist you can’t choose between. A viewing you’d rather not navigate alone.</p><p className="mt-4 text-sm leading-7 text-[#61707a]">Choose the CarVet package that fits where you are. We help you understand the questions, the gaps, and the next step.</p><Link href="/how-it-works" className="cv-text-link mt-5 text-xs">See the journey <ArrowRight size={14} /></Link></div>
      </div>
      <div className="mt-11 grid gap-5 border-t border-[#dce0dc] pt-6 sm:grid-cols-3">
        {[{Icon:ShieldCheck,title:"On your side",copy:"Buyer-side support, with no dealer commission."},{Icon:MessageSquareText,title:"Plain-language guidance",copy:"Clear questions, practical findings, useful next steps."},{Icon:Route,title:"You make the decision",copy:"Support at each stage, from search to viewing."}].map(({Icon,title,copy})=><div className="flex gap-3" key={title}><Icon size={19} strokeWidth={1.4} className="mt-1 shrink-0 text-[#5d7d64]" /><div><h2 className="text-xs font-semibold text-[#142f43]">{title}</h2><p className="mt-1 text-xs leading-6 text-[#61707a]">{copy}</p></div></div>)}
      </div>
    </section>
    <section className="cv-container pb-12" aria-label="Planned levels of support"><div className="rounded-lg border border-[#d5dfce] bg-[#edf2e7] p-6 sm:p-8"><p className="cv-eyebrow">A SCANNER TO KEEP. MORE SUPPORT WHEN YOU NEED IT.</p><h2 className="cv-heading max-w-3xl">From a first review<br /><em>to support on buying day.</em></h2><div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[{Icon:FileCheck2,title:"01 / Review",copy:"Start with the listing and the questions worth asking."},{Icon:Cable,title:"02 / Scanner to keep",copy:"Selected packages would include a compatible OBD scanner. The client keeps it permanently."},{Icon:Headphones,title:"03 / Online live support",copy:"Higher packages would add an online advisor session around the viewing and test drive."},{Icon:CalendarCheck,title:"04 / Buying day",copy:"The highest package would coordinate support through the agreed buying-day viewings."}].map(({Icon,title,copy})=><div key={title} className="border-t border-[#cbd8c2] pt-4"><Icon size={21} strokeWidth={1.5} className="text-[#6c855e]"/><h3 className="mt-4 text-sm font-semibold text-[#142f43]">{title}</h3><p className="mt-3 text-xs leading-7 text-[#65755c]">{copy}</p></div>)}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#d1ddc8] pt-5"><p className="max-w-2xl text-[11px] leading-7 text-[#718065]">Planned package benefits, shown as a product concept. The future app would read supported diagnostic data; this browser demo does not connect to a scanner or arrange shipping.</p><Link href="/test-drive" className="cv-button-outline">Try the test-drive story <ArrowRight size={15}/></Link></div></div></section>
    <PackageExplorer />
    <section className="border-y border-[#dce0dc] bg-[#edf1e8]"><div className="cv-container grid items-center gap-7 py-12 md:grid-cols-[1fr_auto]"><div><p className="cv-eyebrow">NOT SURE WHERE TO START?</p><h2 className="cv-heading mt-3 text-3xl">Try the journey before you choose.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#61707a]">Explore a sample request, see the review, and build a decision plan. You can switch packages as you go.</p></div><Link href="/demo" className="cv-button">Explore the client demo <ArrowRight size={16} /></Link></div></section>
    <div className="cv-container py-8"><p className="text-[11px] leading-6 text-[#61707a]">This website is an interactive product demo. Displayed prices follow the original CarVet concept; final scanner, delivery, and support pricing is not confirmed. No hardware shipment, live support, payment, booking, market watch, or actual inspection is completed here.</p></div>
  </main>;
}
