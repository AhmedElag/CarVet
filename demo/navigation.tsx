import { forwardRef, useSyncExternalStore, type AnchorHTMLAttributes } from 'react';

export function getRoute(): string {
  return window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/';
}

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function useRoute() {
  return useSyncExternalStore(subscribe, getRoute, () => '/');
}

export function usePathname() {
  return useRoute().split('?')[0];
}

export function routeHref(href: string): string {
  return href.startsWith('/') && !href.startsWith('//') ? `#${href}` : href;
}

export function assetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export class RouteNotFound extends Error {}
export class RouteRedirect extends Error {
  constructor(public destination: string) { super(destination); }
}
export function notFound(): never { throw new RouteNotFound('Page not found'); }
export function redirect(destination: string): never { throw new RouteRedirect(destination); }

// Real anchors preserve open-in-new-tab, copy-link, browser Back and touch behavior.
const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
  function Link({ href, ...props }, ref) {
    return <a ref={ref} href={routeHref(href)} {...props} />;
  },
);
export default Link;
