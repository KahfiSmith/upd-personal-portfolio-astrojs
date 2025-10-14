function resetOverlays() {
  try {
    const pageOverlay = document.getElementById('page-transition-overlay');
    if (pageOverlay) {
      (pageOverlay as HTMLElement).style.display = 'none';
      (pageOverlay as HTMLElement).style.transform = 'scaleY(0)';
    }
  } catch {}

  try {
    const routeCurtain = document.getElementById('route-curtain-overlay');
    if (routeCurtain) routeCurtain.classList.remove('is-active');
  } catch {}

  try { document.body.classList.remove('overflow-hidden'); } catch {}
  try { document.documentElement.classList.add('cursor-hidden'); } catch {}
}

function boot() {
  // Ensure overlays don’t block interaction after back/forward restore
  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    if ((e as any).persisted) resetOverlays();
  });

  // Also on Astro swaps as a safety net
  document.addEventListener('astro:after-swap', resetOverlays);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

export {};

