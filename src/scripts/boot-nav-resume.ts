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

  // Reset Get in Touch pill visual state to avoid stuck fill after BFCache
  try {
    const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
    const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
    if (pill && circleBg) {
      // Temporarily disable transition to force visual reset
      const prev = circleBg.style.transition;
      circleBg.style.transition = 'none';
      circleBg.style.transform = 'translateX(-100%)';
      circleBg.style.opacity = '0';
      pill.style.transform = 'translate(0px, 0px)';
      pill.classList.remove('has-fill');
      pill.classList.remove('is-active');
      requestAnimationFrame(() => {
        circleBg.style.transition = prev || 'transform 220ms ease-out, background-color 220ms ease-out, opacity 220ms ease-out';
      });
    }
  } catch {}
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
