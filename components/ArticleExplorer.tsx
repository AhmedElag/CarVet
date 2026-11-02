"use client";

import Link from "@/demo/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { articles } from "@/data/articles";

export function ArticleExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All notes");
  const categories = ["All notes", ...new Set(articles.map(article => article.category))];
  const filtered = useMemo(() => articles.filter(article =>
    (category === "All notes" || article.category === category)
    && `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [query, category]);

  return <section aria-label="Browse buyer notes">
    <div className="flex flex-col justify-between gap-5 border-y border-[#dce0dc] py-5 lg:flex-row lg:items-center">
      <div className="flex flex-wrap gap-2" aria-label="Filter articles by category">
        {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-10 rounded-full border px-4 py-2 text-xs transition ${category === item ? "border-[#142f43] bg-[#142f43] text-white" : "border-[#d4dcd3] bg-transparent text-[#61707a] hover:border-[#8b9f8a]"}`}>{item}</button>)}
      </div>
      <label className="relative block w-full lg:w-64"><span className="sr-only">Search buyer notes</span><Search size={15} className="pointer-events-none absolute left-3.5 top-3.5 text-[#6c7c82]" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the Review Desk" className="min-h-11 w-full rounded-sm border border-[#cfd7cf] bg-white py-2.5 pl-10 pr-3 text-xs text-[#142f43] outline-offset-4 placeholder:text-[#8a9699]" /></label>
    </div>
    <div className="my-6 flex items-center justify-between gap-4"><p className="text-xs text-[#718078]" aria-live="polite">{filtered.length} {filtered.length === 1 ? "note" : "notes"} for a more informed next step.</p>{(query || category !== "All notes") && <button type="button" onClick={() => { setQuery(""); setCategory("All notes"); }} className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B3D91]">Clear filters <X size={12} /></button>}</div>
    {filtered.length ? <div className="grid gap-6 md:grid-cols-3">
      {filtered.map(article => <article key={article.slug} className="group flex h-full flex-col overflow-hidden rounded-md border border-[#dce0dc] bg-white transition hover:-translate-y-1 hover:shadow-[0_10px_30px_#142f4308]">
        <Link href={`/articles/${article.slug}`} className={`flex min-h-36 flex-col justify-between border-b border-[#dce0dc] p-6 ${article.category === "Inspection Tips" ? "bg-[#e4ecdf]" : article.category === "Dealer Buying" ? "bg-[#e2e9eb]" : "bg-[#ede8dd]"}`} aria-label={`Read ${article.title}`}><span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#5d6c67]">THE REVIEW DESK</span><span className="font-serif text-4xl italic tracking-tight text-[#38544b]">{article.category === "Inspection Tips" ? "Look closer." : article.category === "Dealer Buying" ? "Ask better." : "Think ahead."}</span></Link>
        <div className="flex flex-1 flex-col p-6"><div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[.1em] text-[#718078]"><span>{article.category}</span><span>{article.readTime}</span></div><h2 className="mt-4 font-serif text-[27px] leading-[1.15] tracking-[-.03em] text-[#142f43]"><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p className="mt-4 text-xs leading-7 text-[#61707a]">{article.excerpt}</p><div className="mt-auto flex items-center justify-between border-t border-[#e4e7e1] pt-5 text-xs"><span className="text-[10px] text-[#87908b]">{article.date}</span><Link href={`/articles/${article.slug}`} className="inline-flex items-center gap-3 font-semibold text-[#0B3D91]">Read note <ArrowRight size={13} /></Link></div></div>
      </article>)}
    </div> : <div className="rounded-md border border-dashed border-[#c3cec0] bg-white px-6 py-14 text-center"><h2 className="font-serif text-3xl tracking-tight text-[#142f43]">No notes on that topic yet.</h2><p className="mt-3 text-sm text-[#61707a]">Try another word or choose a different category.</p><button type="button" onClick={() => { setQuery(""); setCategory("All notes"); }} className="cv-button-outline mt-6">Show all buyer notes <ArrowRight size={14} /></button></div>}
  </section>;
}
