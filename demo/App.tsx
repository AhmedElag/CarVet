import { Component, useEffect, useState, type ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import Home from '@/app/page';
import About from '@/app/about/page';
import Services from '@/app/services/page';
import HowItWorks from '@/app/how-it-works/page';
import Articles from '@/app/articles/page';
import Stories from '@/app/case-studies/page';
import Contact from '@/app/contact/page';
import SampleReport from '@/app/sample-report/page';
import DemoGuide from '@/app/demo-guide/page';
import Privacy from '@/app/privacy/page';
import Terms from '@/app/terms/page';
import NotFound from '@/app/not-found';
import DemoPage from '@/app/demo/page';
import TestDrivePage from '@/app/test-drive/page';
import WorkspacePage from '@/app/workspace/page';
import ServicePage from '@/app/services/[slug]/page';
import ArticlePage from '@/app/articles/[slug]/page';
import StoryPage from '@/app/case-studies/[slug]/page';
import { RouteNotFound, RouteRedirect, useRoute } from './navigation';

const pages: Record<string, { component: () => ReactNode; title: string }> = {
  '/': { component: Home, title: 'CarVet — Don’t buy blind.' },
  '/about': { component: About, title: 'About | CarVet' },
  '/services': { component: Services, title: 'Packages | CarVet' },
  '/how-it-works': { component: HowItWorks, title: 'How it works | CarVet' },
  '/articles': { component: Articles, title: 'From the Review Desk | CarVet' },
  '/case-studies': { component: Stories, title: 'Client stories | CarVet' },
  '/contact': { component: Contact, title: 'Contact | CarVet' },
  '/sample-report': { component: SampleReport, title: 'Sample report | CarVet' },
  '/demo-guide': { component: DemoGuide, title: 'Explore the demo | CarVet' },
  '/privacy': { component: Privacy, title: 'Privacy | CarVet' },
  '/terms': { component: Terms, title: 'Demo scope | CarVet' },
};

export async function loadPage(route: string): Promise<{ content: ReactNode; title: string }> {
  const url = new URL(route, 'https://carvet.example');
  const path = url.pathname.replace(/\/$/, '') || '/';
  const searchParams = Promise.resolve(Object.fromEntries(url.searchParams));
  const staticPage = pages[path];
  if (staticPage) { const Page = staticPage.component; return { content: <Page />, title: staticPage.title }; }
  if (path === '/demo') return { content: await DemoPage({ searchParams }), title: 'Client demo | CarVet' };
  if (path === '/test-drive') return { content: await TestDrivePage({ searchParams }), title: 'Test-drive demo | CarVet' };
  if (path === '/workspace') return { content: await WorkspacePage({ searchParams }), title: 'Your workspace | CarVet' };
  if (path === '/phone-demo') {
    const { PhoneAppDemo } = await import('@/components/PhoneAppDemo');
    return { content: <PhoneAppDemo />, title: 'CarVet companion — Phone app demo' };
  }
  const match = path.match(/^\/(services|articles|case-studies)\/([^/]+)$/);
  if (match) {
    const params = Promise.resolve({ slug: decodeURIComponent(match[2]) });
    const content = match[1] === 'services' ? await ServicePage({ params }) : match[1] === 'articles' ? await ArticlePage({ params }) : await StoryPage({ params });
    return { content, title: `${match[2].replaceAll('-', ' ')} | CarVet` };
  }
  return { content: <NotFound />, title: 'Page not found | CarVet' };
}

class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <main className="cv-container cv-section"><h1 className="cv-heading">Let’s pick the story back up.</h1><p className="cv-lede mt-5">Refresh this demo, or return to the home page.</p><a href="#/" className="cv-button mt-6">Back to CarVet</a></main> : this.props.children;
  }
}

export function App() {
  const route = useRoute();
  const [page, setPage] = useState<{ route: string; content: ReactNode } | null>(null);
  const phoneDemo = route.split('?')[0] === '/phone-demo';
  useEffect(() => {
    let active = true;
    loadPage(route).then(result => {
      if (!active) return;
      document.title = result.title;
      setPage({ route, content: result.content });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }).catch(error => {
      if (!active) return;
      if (error instanceof RouteRedirect) { window.location.replace(`#${error.destination}`); return; }
      document.title = 'Page not found | CarVet';
      setPage({ route, content: error instanceof RouteNotFound ? <NotFound /> : <div className="cv-container cv-section"><h1 className="cv-heading">This step needs a refresh.</h1><p className="cv-lede mt-5">Open another page or reload to continue the demo.</p><a href="#/" className="cv-button mt-6">Back to CarVet</a></div> });
    });
    return () => { active = false; };
  }, [route]);
  return <>
    {!phoneDemo && <><a href="#content" onClick={event => { event.preventDefault(); document.getElementById('content')?.focus(); document.getElementById('content')?.scrollIntoView(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3">Skip to content</a><SiteHeader /></>}
    <div id="content" tabIndex={-1} className={phoneDemo ? 'phone-demo-page' : undefined}>
      {page?.route === route ? <PageBoundary key={route}>{page.content}</PageBoundary> : <div className="cv-container cv-section" role="status">Getting your next chapter ready…</div>}
    </div>
    {!phoneDemo && <SiteFooter />}
  </>;
}
