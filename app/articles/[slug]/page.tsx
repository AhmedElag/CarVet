import type { Metadata } from "@/demo/types";
import Link from "@/demo/navigation";
import { notFound } from "@/demo/navigation";
import { ArrowLeft, ArrowRight, Bookmark, Clock3 } from "lucide-react";
import { articles } from "@/data/articles";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return articles.map(article => ({ slug: article.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find(item => item.slug === slug);
  return { title: article ? `${article.title} | CarVet` : "Buyer note not found | CarVet", description: article?.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find(item => item.slug === slug);
  if (!article) notFound();
  const related = articles.filter(item => item.slug !== article.slug);
  const takeaway = article.content[article.content.length - 1];
  return <main>
    <section className="cv-container border-b border-[#dce0dc] pb-12 pt-10 sm:pb-16 sm:pt-14">
      <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-y-2 text-xs text-[#7d8983]"><Link href="/" className="hover:text-[#0B3D91]">Home</Link><span className="mx-3">/</span><Link href="/articles" className="hover:text-[#0B3D91]">The Review Desk</Link><span className="mx-3">/</span><span className="text-[#142f43]">{article.category}</span></nav>
      <div className="max-w-4xl"><p className="cv-eyebrow">THE REVIEW DESK / {article.category.toUpperCase()}</p><h1 className="cv-title">{article.title}</h1><p className="cv-lede mt-6 max-w-3xl">{article.excerpt}</p><div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-[#78857d]"><span>CarVet buyer notes</span><span>{article.date}</span><span className="inline-flex items-center gap-2"><Clock3 size={13} />{article.readTime}</span></div></div>
    </section>
    <section className="cv-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
      <article className="max-w-[740px]">
        {article.content.slice(0, -1).map((paragraph, index) => <p key={paragraph} className={index === 0 ? "mb-8 font-serif text-2xl leading-[1.6] tracking-[-.015em] text-[#243f4c] sm:text-[27px]" : "mb-7 text-[15px] leading-8 text-[#61707a]"}>{paragraph}</p>)}
        <div className="my-10 rounded-r-md border-l-[3px] border-[#94aa8b] bg-[#edf1e7] px-6 py-7 sm:px-8"><p className="cv-eyebrow !mb-4 !text-[9px]">TAKE THIS WITH YOU</p><p className="font-serif text-2xl leading-[1.5] tracking-[-.015em] text-[#2e4b3c]">{takeaway}</p></div>
        <p className="border-t border-[#dce0dc] pt-6 text-[11px] leading-6 text-[#8a948d]">General buyer education. A particular vehicle still needs its own records, context, and an independent inspection where appropriate.</p>
        <Link href="/articles" className="cv-text-link mt-6 inline-flex items-center gap-3"><ArrowLeft size={14} />Back to the Review Desk</Link>
      </article>
      <aside><div className="rounded-md border border-[#dce0dc] bg-white p-6 lg:sticky lg:top-28"><Bookmark size={23} strokeWidth={1.4} className="text-[#6a8668]" /><p className="cv-eyebrow mb-3 mt-5 !text-[9px]">FROM A NOTE TO A NEXT STEP</p><h2 className="font-serif text-[28px] leading-tight tracking-[-.03em] text-[#142f43]">Make it specific<br />to your search.</h2><p className="mt-4 text-xs leading-7 text-[#61707a]">A sample CarVet report shows how findings, missing evidence, and seller questions come together.</p><Link href="/sample-report" className="cv-text-link mt-6 inline-flex items-center gap-3">See a sample report <ArrowRight size={13} /></Link><div className="my-6 border-t border-[#e1e6dc]" /><Link href="/services/serious-candidate-review" className="text-xs font-semibold leading-6 text-[#0B3D91]">Explore Serious Candidate Review →</Link></div></aside>
    </section>
    <section className="border-t border-[#dce0dc] bg-[#edf0e9]"><div className="cv-container py-12 sm:py-16"><p className="cv-eyebrow">KEEP A LITTLE PERSPECTIVE</p><h2 className="cv-heading">More from the Review Desk.</h2><div className="mt-8 grid gap-5 md:grid-cols-2">{related.map(item => <Link key={item.slug} href={`/articles/${item.slug}`} className="group rounded-md border border-[#d6dfd2] bg-[#fafaf7] p-6 transition hover:border-[#a9ba9e] sm:p-8"><div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[.12em] text-[#78857d]"><span>{item.category}</span><span>{item.readTime}</span></div><h3 className="mt-5 max-w-lg font-serif text-[29px] leading-[1.15] tracking-[-.025em] text-[#142f43]">{item.title}</h3><p className="mt-4 text-xs leading-7 text-[#61707a]">{item.excerpt}</p><span className="mt-6 inline-flex items-center gap-3 text-xs font-semibold text-[#0B3D91]">Read note <ArrowRight size={13} /></span></Link>)}</div></div></section>
  </main>;
}
