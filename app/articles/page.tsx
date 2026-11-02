import type { Metadata } from "@/demo/types";
import Link from "@/demo/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { ArticleExplorer } from "@/components/ArticleExplorer";

export const metadata: Metadata = {
  title: "The Review Desk | CarVet",
  description: "Buyer notes, inspection tips, and practical questions to bring to your next used-car search.",
};

export default function ArticlesPage() {
  return <main>
    <section className="cv-container pb-12 pt-10 sm:pb-16 sm:pt-14">
      <nav aria-label="Breadcrumb" className="mb-10 text-xs text-[#7d8983]"><Link href="/" className="hover:text-[#0B3D91]">Home</Link><span className="mx-3">/</span><span className="text-[#142f43]">The Review Desk</span></nav>
      <div className="grid items-end gap-9 lg:grid-cols-[1.5fr_1fr] lg:gap-20"><div><p className="cv-eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</p><h1 className="cv-title max-w-3xl">Read the story.<br /><em className="text-[#5a795d]">Ask better questions.</em></h1><p className="cv-lede mt-6 max-w-xl">Buyer notes, inspection tips, and practical context for the decisions ahead.</p></div><div className="rounded-md border border-[#dce0dc] bg-[#edf1e7] p-7"><BookOpen size={24} strokeWidth={1.4} className="text-[#58715a]" /><p className="mt-5 font-serif text-2xl leading-snug tracking-tight text-[#142f43]">Good questions are something you can bring to every viewing.</p><p className="mt-4 text-xs leading-7 text-[#61707a]">Start with the notes below, then use a CarVet package to explore how guidance fits a particular car.</p></div></div>
    </section>
    <section className="cv-container pb-16 sm:pb-24"><ArticleExplorer /></section>
    <section className="border-t border-[#dce0dc] bg-[#edf0e9]"><div className="cv-container grid gap-6 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="cv-eyebrow">PUT THE QUESTIONS TO WORK</p><h2 className="cv-heading">Have a car in mind?</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#61707a]">See a sample buyer review, or find the right level of support for your search.</p></div><div className="flex flex-wrap gap-3"><Link href="/sample-report" className="cv-button-outline">Read a sample report <ArrowRight size={15} /></Link><Link href="/services" className="cv-button">Explore packages <ArrowRight size={15} /></Link></div></div></section>
  </main>;
}
