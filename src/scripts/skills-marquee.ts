function boot() {
  const row1El = document.querySelector('[data-skills-row="1"]') as HTMLElement | null;
  const row2El = document.querySelector('[data-skills-row="2"]') as HTMLElement | null;
  if (!row1El || !row2El) return;

  const row1 = row1El;
  const row2 = row2El;

  let lastY = window.pageYOffset;
  let raf = 0;
  let offset1 = 0;
  let offset2 = 0;

  const speed1 = 0.6; // slower
  const speed2 = 1.0; // faster

  function apply() {
    row1.style.transform = `translate3d(${offset1}px,0,0)`;
    row2.style.transform = `translate3d(${offset2}px,0,0)`;
    raf = 0;
  }

  function onScroll() {
    const y = window.pageYOffset;
    const dy = y - lastY; // positive when scrolling down
    lastY = y;

    // Move inverse of scroll for row1, same direction for row2
    offset1 -= dy * speed1;
    offset2 += dy * speed2;

    if (!raf) raf = requestAnimationFrame(apply);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
