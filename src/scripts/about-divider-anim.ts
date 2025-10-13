import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

function initAboutDivider(): void {
  const root = document.querySelector<HTMLElement>('#about-divider[data-divider]');
  if (!root) return;
  const fill = root.querySelector<HTMLElement>('[data-divider-fill]');
  const knob = root.querySelector<HTMLElement>('[data-divider-knob]');
  const core = knob?.querySelector<HTMLElement>('[data-orb-core]') || null;
  const ring = knob?.querySelector<HTMLElement>('[data-orb-ring]') || null;
  const ripple = knob?.querySelector<HTMLElement>('[data-orb-ripple]') || null;
  if (!fill || !knob) return;

  // Initial state
  gsap.set(fill, { width: '0%' });
  gsap.set(knob, { x: 0 });
  if (core) gsap.set(core, { scale: 1 });
  if (ring) gsap.set(ring, { scale: 1, opacity: 0.6 });
  if (ripple) gsap.set(ripple, { scale: 0, opacity: 0 });

  let isDragging = false;
  let hasUserSet = false;

  const bounds = () => root.getBoundingClientRect();
  const knobRect = () => knob.getBoundingClientRect();

  const percentFromX = (x: number) => {
    const b = bounds();
    const k = knobRect();
    const maxX = Math.max(1, b.width - k.width);
    const clamped = Math.min(maxX, Math.max(0, x));
    return (clamped / maxX) * 100;
  };

  const setByPercent = (pct: number) => {
    const b = bounds();
    const k = knobRect();
    const maxX = Math.max(1, b.width - k.width);
    const x = (Math.min(100, Math.max(0, pct)) / 100) * maxX;
    gsap.set(fill, { width: `${(x / maxX) * 100}%` });
    gsap.set(knob, { x });
    root.setAttribute('aria-valuenow', String(Math.round((x / maxX) * 100)));
  };

  // Orb hover animations (subtle pulse + glow)
  let hoverTl: gsap.core.Timeline | null = null;
  const startHover = () => {
    if (hoverTl || isDragging) return;
    hoverTl = gsap.timeline({ repeat: -1, yoyo: true });
    if (core) hoverTl.to(core, { scale: 1.08, duration: 0.8, ease: 'power2.inOut' }, 0);
    if (ring) hoverTl.to(ring, { scale: 1.1, opacity: 0.9, duration: 0.8, ease: 'power2.inOut' }, 0);
  };
  const stopHover = () => {
    hoverTl?.kill();
    hoverTl = null;
    if (core) gsap.to(core, { scale: 1, duration: 0.25, ease: 'power2.out' });
    if (ring) gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.25, ease: 'power2.out' });
  };

  root.addEventListener('mouseenter', () => { if (!hasUserSet) startHover(); });
  root.addEventListener('mouseleave', () => { if (!hasUserSet) stopHover(); });

  // Track hover demo fill if user hasn't interacted yet
  root.addEventListener('mouseenter', () => {
    if (isDragging || hasUserSet) return;
    gsap.to(fill, { width: '100%', duration: 0.9, ease: 'power3.out' });
    gsap.to(knob, { x: () => {
      const b = bounds();
      const k = knobRect();
      return Math.max(0, b.width - k.width);
    }, duration: 0.9, ease: 'power3.out' });
  });
  root.addEventListener('mouseleave', () => {
    if (isDragging || hasUserSet) return;
    gsap.to(fill, { width: '0%', duration: 0.6, ease: 'power2.out' });
    gsap.to(knob, { x: 0, duration: 0.6, ease: 'power2.out' });
  });

  const playRipple = () => {
    if (!ripple) return;
    gsap.set(ripple, { scale: 0, opacity: 0.25 });
    gsap.to(ripple, { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.out' });
  };

  // Draggable knob with snap and elastic release
  const snapPoints = [0, 50, 100];
  Draggable.create(knob, {
    type: 'x',
    bounds: root,
    onPress() {
      isDragging = true;
      playRipple();
      startHover();
    },
    onDrag() {
      const pct = percentFromX(this.x);
      gsap.set(fill, { width: `${pct}%` });
      root.setAttribute('aria-valuenow', String(Math.round(pct)));
      // tension glow near edges
      const edge = Math.min(pct, 100 - pct);
      const glow = gsap.utils.mapRange(0, 20, 0.6, 1.0, Math.max(0, Math.min(20, edge)));
      if (ring) gsap.set(ring, { opacity: glow });
    },
    onRelease() {
      isDragging = false;
      hasUserSet = true;
      stopHover();
      // Snap to nearest point
      const currentPct = percentFromX(this.x);
      const nearest = snapPoints.reduce((a, b) => Math.abs(b - currentPct) < Math.abs(a - currentPct) ? b : a);
      // Animate to snap with elastic
      const b = bounds();
      const k = knobRect();
      const maxX = Math.max(1, b.width - k.width);
      const targetX = (nearest / 100) * maxX;
      gsap.to(knob, { x: targetX, duration: 0.5, ease: 'back.out(1.4)' });
      gsap.to(fill, { width: `${nearest}%`, duration: 0.5, ease: 'back.out(1.4)' });
      root.setAttribute('aria-valuenow', String(Math.round(nearest)));
    },
  });

  // Click track to jump with ripple + elastic
  root.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-divider-knob]')) return;
    const b = bounds();
    const x = (e as MouseEvent).clientX - b.left;
    const pct = percentFromX(x);
    playRipple();
    const k = knobRect();
    const maxX = Math.max(1, b.width - k.width);
    const targetX = (pct / 100) * maxX;
    gsap.to(fill, { width: `${pct}%`, duration: 0.5, ease: 'back.out(1.4)' });
    gsap.to(knob, { x: targetX, duration: 0.5, ease: 'back.out(1.4)' });
    hasUserSet = true;
    root.setAttribute('aria-valuenow', String(Math.round(pct)));
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutDivider, { once: true });
  } else {
    initAboutDivider();
  }
}

export {};
