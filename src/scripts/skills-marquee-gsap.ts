import { gsap } from "gsap";

// Ensure row contains only the minimal number of copies needed.
// Returns the width of a single sequence (used for wrapping math).
function prepareRow(row: HTMLElement, viewport: number): number {
  if (!row) return 0;
  // Persist the original (single sequence) HTML once
  const DATA_KEY = "marqueeOriginal";
  // @ts-ignore - attach to dataset for idempotence across resizes/HMR
  if (!row.dataset[DATA_KEY]) {
    // @ts-ignore
    row.dataset[DATA_KEY] = row.innerHTML;
  }
  // @ts-ignore
  const baseHtml: string = row.dataset[DATA_KEY] as string;
  if (!baseHtml || baseHtml.trim().length === 0) return 0;

  // Measure a single sequence width using a detached element that mimics the row
  const measurer = document.createElement(row.tagName.toLowerCase());
  measurer.className = row.className;
  measurer.style.position = "absolute";
  measurer.style.left = "-99999px";
  measurer.style.top = "-99999px";
  measurer.style.visibility = "hidden";
  measurer.style.whiteSpace = "nowrap";
  measurer.innerHTML = baseHtml;
  document.body.appendChild(measurer);
  const sequenceWidth = measurer.scrollWidth || 0;
  document.body.removeChild(measurer);

  if (sequenceWidth === 0) return 0;

  // Compute required copies to cover viewport plus one extra for seamless wrap
  const copies = Math.max(2, Math.ceil((viewport + sequenceWidth) / sequenceWidth));
  // Rebuild content deterministically (prevents unbounded growth on repeated resizes)
  // Only re-render if needed to reduce layout thrash
  const desiredHtml = baseHtml.repeat(copies);
  if (row.innerHTML !== desiredHtml) {
    row.innerHTML = desiredHtml;
  }

  return sequenceWidth;
}

type MarqueeController = {
  cleanup: () => void;
};

declare global {
  interface Window { __skillsMarquee?: MarqueeController }
}

function boot() {
  // If an existing marquee is running (e.g., from a previous init), clean it up
  try { window.__skillsMarquee?.cleanup(); } catch {}

  const row1 = document.querySelector('[data-skills-row="1"]') as HTMLElement | null;
  const row2 = document.querySelector('[data-skills-row="2"]') as HTMLElement | null;
  if (!row1 || !row2) return;
  const r1 = row1 as HTMLElement;
  const r2 = row2 as HTMLElement;

  const vw = window.innerWidth;

  // Prepare content widths and duplicates
  let w1 = prepareRow(r1, vw);
  let w2 = prepareRow(r2, vw);

  // Hint GPU compositing for smoother transforms
  r1.style.willChange = 'transform';
  r2.style.willChange = 'transform';
  // Ensure GSAP uses a stable tick
  try { gsap.ticker.fps(60); } catch {}

  // Smooth ticker-based marquee with manual wrap to eliminate jumps
  let dirTarget = 1; // intended direction based on user input
  let dirSmooth = 1; // smoothed direction used by ticker
  let offset1 = 0;
  let offset2 = -w2;
  let lastTime = performance.now();
  // Base speed (px/s) — identical for both rows
  let speed1 = 60; // top row
  let speed2 = 60; // bottom row

  function tick() {
    const now = performance.now();
    const dt = Math.max(0.001, Math.min(0.05, (now - lastTime) / 1000)); // clamp 1ms–50ms
    lastTime = now;

    // Smooth direction transitions to avoid jitter
    dirSmooth += (dirTarget - dirSmooth) * 0.12;

    // Update offsets according to direction
    // Row1 default moves left (negative)
    offset1 += -dirSmooth * speed1 * dt;
    // Row2 default moves right (increase toward 0)
    offset2 += dirSmooth * speed2 * dt;

    // Wrap rows seamlessly
    if (offset1 <= -w1) offset1 += w1;
    if (offset1 > 0) offset1 -= w1;

    if (offset2 >= 0) offset2 -= w2;
    if (offset2 < -w2) offset2 += w2;

    gsap.set(r1, { x: offset1, force3D: true });
    gsap.set(r2, { x: offset2, force3D: true });
  }

  gsap.ticker.add(tick);

  // Flip direction based on scroll delta
  let lastY = window.pageYOffset;
  function onScroll() {
    const y = window.pageYOffset;
    const dy = y - lastY;
    lastY = y;
    if (Math.abs(dy) < 2) return; // ignore micro deltas to prevent flicker
    dirTarget = dy > 0 ? 1 : -1;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Also react to wheel delta (useful when content doesn't move e.g., inertia/top)
  function onWheel(e: WheelEvent) {
    if (Math.abs(e.deltaY) < 2) return;
    dirTarget = e.deltaY > 0 ? 1 : -1;
  }
  window.addEventListener('wheel', onWheel, { passive: true });

  // And touch drags on mobile to determine intended direction
  let touchStartY = 0;
  function onTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0]?.clientY ?? 0;
  }
  function onTouchMove(e: TouchEvent) {
    const cy = e.touches[0]?.clientY ?? 0;
    const dy = cy - touchStartY;
    if (Math.abs(dy) < 2) return;
    dirTarget = dy < 0 ? 1 : -1; // swipe up -> scroll down -> default dir
  }
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Re-prepare on resize to keep seamless wrap
  let resizeRaf = 0;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      const newVw = window.innerWidth;
      w1 = prepareRow(r1, newVw);
      w2 = prepareRow(r2, newVw);
      // Reset offsets to safe ranges
      // Try to keep visual continuity by modding existing offsets
      offset1 = ((offset1 % w1) + w1) % w1 - w1; // keep within [-w1, 0]
      offset2 = ((offset2 % w2) + w2) % w2 - w2; // keep within [-w2, 0]
      resizeRaf = 0;
    });
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Expose cleanup so we can safely re-init (BFCache restore / swaps)
  const cleanup = () => {
    try { gsap.ticker.remove(tick); } catch {}
    window.removeEventListener('scroll', onScroll as any);
    window.removeEventListener('wheel', onWheel as any);
    window.removeEventListener('touchstart', onTouchStart as any);
    window.removeEventListener('touchmove', onTouchMove as any);
    window.removeEventListener('resize', onResize as any);
  };
  window.__skillsMarquee = { cleanup };
}

const start = () => boot();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

// Re-initialize after BFCache restore
window.addEventListener('pageshow', (e: PageTransitionEvent) => {
  // Only when restored from cache
  if ((e as any).persisted) {
    start();
  }
});

// Re-init after Astro swaps if triggered
document.addEventListener('astro:after-swap', () => {
  start();
});

export {};
