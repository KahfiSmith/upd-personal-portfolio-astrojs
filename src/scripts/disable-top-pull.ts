function boot() {
  const root = (document.scrollingElement || document.documentElement) as HTMLElement;
  let startY = 0;
  let startTop = 0;

  function onTouchStart(e: TouchEvent) {
    startY = e.touches[0]?.clientY ?? 0;
    startTop = root.scrollTop;
  }

  function onTouchMove(e: TouchEvent) {
    const currentY = e.touches[0]?.clientY ?? 0;
    const deltaY = currentY - startY;
    // If at the very top and user pulls down, prevent overscroll/pull-to-refresh
    if (startTop <= 0 && deltaY > 0) {
      e.preventDefault();
    }
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};

