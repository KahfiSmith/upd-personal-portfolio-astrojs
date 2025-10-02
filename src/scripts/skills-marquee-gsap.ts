import { gsap } from "gsap";

function prepareRow(row: HTMLElement, viewport: number): number {
  // If row has no children, nothing to do
  if (!row.firstElementChild) return 0;
  // Measure a single sequence width by cloning current children once
  const clone = row.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.whiteSpace = 'nowrap';
  document.body.appendChild(clone);
  const sequenceWidth = clone.scrollWidth;
  document.body.removeChild(clone);

  // Ensure enough content to cover viewport + one extra sequence for seamless wrap
  const html = row.innerHTML;
  while (row.scrollWidth < viewport + sequenceWidth) {
    row.insertAdjacentHTML('beforeend', html);
  }
  return sequenceWidth || row.scrollWidth;
}

function boot() {
  const row1 = document.querySelector('[data-skills-row="1"]') as HTMLElement | null;
  const row2 = document.querySelector('[data-skills-row="2"]') as HTMLElement | null;
  if (!row1 || !row2) return;
  const r1 = row1 as HTMLElement;
  const r2 = row2 as HTMLElement;

  const vw = window.innerWidth;

  // Prepare content widths and duplicates
  let w1 = prepareRow(r1, vw);
  let w2 = prepareRow(r2, vw);

  // Smooth ticker-based marquee with manual wrap to eliminate jumps
  let dir = 1; // 1 = default (row1 left, row2 right), -1 = reverse
  let offset1 = 0;
  let offset2 = -w2;
  let lastTime = performance.now();
  // Base speed (px/s) — identical for both rows
  let speed1 = 50; // top row
  let speed2 = 50; // bottom row

  function tick() {
    const now = performance.now();
    const dt = Math.max(0.001, Math.min(0.05, (now - lastTime) / 1000)); // clamp 1ms–50ms
    lastTime = now;

    // Update offsets according to direction
    // Row1 default moves left (negative)
    offset1 += -dir * speed1 * dt;
    // Row2 default moves right (increase toward 0)
    offset2 += dir * speed2 * dt;

    // Wrap rows seamlessly
    if (offset1 <= -w1) offset1 += w1;
    if (offset1 > 0) offset1 -= w1;

    if (offset2 >= 0) offset2 -= w2;
    if (offset2 < -w2) offset2 += w2;

    gsap.set(r1, { x: offset1 });
    gsap.set(r2, { x: offset2 });
  }

  gsap.ticker.add(tick);

  // Flip direction based on scroll delta
  let lastY = window.pageYOffset;
  function onScroll() {
    const y = window.pageYOffset;
    const dy = y - lastY;
    lastY = y;
    if (dy === 0) return;
    dir = dy > 0 ? 1 : -1;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Also react to wheel delta (useful when content doesn't move e.g., inertia/top)
  function onWheel(e: WheelEvent) {
    if (e.deltaY === 0) return;
    dir = e.deltaY > 0 ? 1 : -1;
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
    dir = dy < 0 ? 1 : -1; // swipe up -> scroll down -> default dir
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
      offset1 = 0;
      offset2 = -w2;
      resizeRaf = 0;
    });
  }
  window.addEventListener('resize', onResize, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
