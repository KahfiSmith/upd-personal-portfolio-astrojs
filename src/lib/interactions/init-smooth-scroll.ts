export function initSmoothScroll(): void {
  const supports = 'scrollBehavior' in document.documentElement.style;
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute('href') || '';
    if (id.length <= 1) return;
    const target = document.querySelector(id) as HTMLElement | null;
    if (!target) return;
    e.preventDefault();
    if (supports) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 24);
      window.scrollTo(0, top);
    }
  }, { passive: false });
}

