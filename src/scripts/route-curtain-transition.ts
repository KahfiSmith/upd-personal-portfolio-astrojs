import { gsap } from "gsap";

type Curtains = {
  root: HTMLElement;
  top: HTMLElement;
  bottom: HTMLElement;
};

function buildCurtains(): Curtains | null {
  let root = document.getElementById("route-curtain-overlay") as HTMLElement | null;
  if (!root) {
    root = document.createElement("div");
    root.id = "route-curtain-overlay";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="rt-curtain rt-top"></div>
      <div class="rt-curtain rt-bottom"></div>
    `;
    document.body.appendChild(root);
  }
  const top = root.querySelector<HTMLElement>(".rt-top");
  const bottom = root.querySelector<HTMLElement>(".rt-bottom");
  if (!top || !bottom) return null;
  return { root, top, bottom };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let transitioning = false;

function openCurtain(c: Curtains) {
  if (prefersReducedMotion()) {
    c.root.classList.remove('is-active');
    return;
  }
  c.root.classList.add('is-active');
  gsap.set([c.top, c.bottom], { y: 0 });
  gsap.to(c.top, { y: '-100%', duration: 1.0, ease: 'power3.inOut' });
  gsap.to(c.bottom, { y: '100%', duration: 1.0, ease: 'power3.inOut', onComplete: () => {
    c.root.classList.remove('is-active');
  }});
}

function closeCurtainAndNavigate(c: Curtains, href: string) {
  if (transitioning) return;
  transitioning = true;
  if (prefersReducedMotion()) {
    window.location.href = href;
    return;
  }
  c.root.classList.add('is-active');
  gsap.set(c.top, { y: '-100%' });
  gsap.set(c.bottom, { y: '100%' });
  const tl = gsap.timeline({
    defaults: { duration: 0.8, ease: 'power3.inOut' },
    onComplete: () => { window.location.href = href; }
  });
  tl.to(c.top, { y: '0%' }, 0).to(c.bottom, { y: '0%' }, 0);
}

function isInternalNav(a: HTMLAnchorElement): boolean {
  if (a.target && a.target === '_blank') return false;
  if (a.hasAttribute('download')) return false;
  if (a.getAttribute('rel')?.includes('external')) return false;
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#')) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch { return false; }
}

function boot() {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;
  
  // Skip if View Transitions API is supported (Astro handles it)
  if ('startViewTransition' in document) {
    // console.log('View Transitions API supported, skipping route curtain');
    return;
  }

  const curtains = buildCurtains();
  if (!curtains) return;

  // Don't show curtains on initial page load (handled by page-transition-overlay)
  // Only handle route transitions between pages for fallback
  // console.log('Route curtain transition fallback initialized');
  
  setupLinkInterception(curtains);
}

function setupLinkInterception(curtains: Curtains) {
  // Intercept link clicks for fallback behavior
  document.addEventListener('click', (e: MouseEvent) => {
    // Respect modifier keys/middle clicks
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
    if (!a) return;
    if (a.hasAttribute('data-no-transition')) return;
    if (!isInternalNav(a)) return;

    const href = a.href;
    if (!href || href === window.location.href) return;
    e.preventDefault();
    closeCurtainAndNavigate(curtains, href);
  });
}

if (typeof document !== 'undefined') {
  boot();
}

export {};

