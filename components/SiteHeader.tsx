"use client";
import { assetPath } from "@/demo/navigation";

import Link from "@/demo/navigation";
import { usePathname } from "@/demo/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["/services", "Packages"], ["/how-it-works", "How it works"],
  ["/case-studies", "Client stories"], ["/articles", "Review Desk"], ["/test-drive", "Test-drive demo"],
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header no-print">
    <div className="cv-container header-inner">
      <Link href="/" onClick={() => setOpen(false)} className="site-logo" aria-label="CarVet home"><img src={assetPath("/CarVet/Logo.png")} alt="CarVet" width="142" height="47" /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined} className={path.startsWith(href) ? "current" : ""}>{label}</Link>)}</nav>
      <div className="header-actions"><Link href="/workspace" className="workspace-link">Demo workspace</Link><Link href="/demo" onClick={() => setOpen(false)} className="cv-button compact"><span className="header-cta-full">Try client demo</span><span className="header-cta-short">Demo</span> <ArrowUpRight size={14} /></Link><button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
    {open && <nav className="mobile-navigation cv-container" id="mobile-navigation" aria-label="Mobile navigation">{[...links, ["/sample-report", "Sample report"], ["/workspace", "Demo workspace"], ["/about", "About CarVet"], ["/contact", "Contact"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={15} /></Link>)}</nav>}
  </header>;
}
