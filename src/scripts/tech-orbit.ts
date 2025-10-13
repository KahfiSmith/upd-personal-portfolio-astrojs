import { gsap } from "gsap";

type OrbitState = {
  rotation: number; // radians
  targetSpeed: number; // radians/sec (sign controls direction)
  lastTime: number;
  dragging: boolean;
  lastDragAngle: number;
  velSamples: Array<{ t: number; a: number }>; // for velocity estimation
};

function initTechOrbit(): void {
  const root = document.querySelector<HTMLElement>('[data-tech-orbit]');
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-tech-item]'));
  if (items.length === 0) return;

  const leftBtn = root.querySelector<HTMLElement>('[data-orbit-left]');
  const rightBtn = root.querySelector<HTMLElement>('[data-orbit-right]');

  const state: OrbitState = {
    rotation: 0,
    targetSpeed: Math.PI / 18, // 10 deg/sec default
    lastTime: performance.now(),
    dragging: false,
    lastDragAngle: 0,
    velSamples: [],
  };

  const getBounds = () => root.getBoundingClientRect();
  const size = () => {
    const b = getBounds();
    const centerEl = root.querySelector<HTMLElement>('[data-orbit-center]');
    const firstItem = root.querySelector<HTMLElement>('[data-tech-item] img');
    const centerHalf = centerEl ? (centerEl.getBoundingClientRect().width / 2) : 0;
    const iconHalf = firstItem ? (firstItem.getBoundingClientRect().width / 2) : 20;
    const margin = 12;
    const safePad = Math.max(centerHalf, iconHalf) + margin;
    const r = Math.max(40, Math.min(b.width, b.height) / 2 - safePad);
    return { r, cx: b.left + b.width / 2, cy: b.top + b.height / 2 };
  };

  // Pre-distribute items evenly unless data-angle provided
  const baseAngles = items.map((el, i) => {
    const a = el.getAttribute('data-angle');
    return a ? (parseFloat(a) * Math.PI) / 180 : (i / items.length) * Math.PI * 2;
  });

  // Positioning tick
  const update = () => {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - state.lastTime) / 1000));
    state.lastTime = now;

    // Smooth auto speed toward target
    const autoSpeed = state.dragging ? 0 : state.targetSpeed;
    // Apply a subtle ease toward 0 when not interacted for long
    state.rotation += autoSpeed * dt;

    const { r } = size();
    items.forEach((el, i) => {
      const ang = baseAngles[i] + state.rotation;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      // Depth scale for faux-3D layering
      const depth = (Math.sin(ang) + 1) / 2; // 0..1 front
      const scale = 0.9 + depth * 0.2; // 0.9..1.1
      const zIndex = 10 + Math.round(depth * 10);
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: x,
        y: y,
        scale,
        zIndex,
        force3D: true,
      });
      // optional: dim back items
      el.style.opacity = String(0.65 + depth * 0.35);
    });
  };

  gsap.ticker.add(update);

  // Drag handling (pointer events)
  const onPointerDown = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { cx, cy } = size();
    const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
    state.dragging = true;
    state.lastDragAngle = ang;
    state.velSamples.length = 0;
    state.velSamples.push({ t: performance.now(), a: ang });
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!state.dragging) return;
    const { cx, cy } = size();
    const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
    // Compute smallest delta angle
    let d = ang - state.lastDragAngle;
    // Wrap to [-PI, PI]
    d = ((d + Math.PI) % (Math.PI * 2)) - Math.PI;
    state.rotation += d;
    state.lastDragAngle = ang;
    state.velSamples.push({ t: performance.now(), a: ang });
    if (state.velSamples.length > 6) state.velSamples.shift();
  };
  const onPointerUp = () => {
    if (!state.dragging) return;
    state.dragging = false;
    // Estimate angular velocity from last samples
    const samples = state.velSamples;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = Math.max(0.001, (last.t - first.t) / 1000);
      // unwrap angles across 2PI to get correct delta
      let da = last.a - first.a;
      da = ((da + Math.PI) % (Math.PI * 2)) - Math.PI;
      const vel = da / dt; // rad/s
      // Continue spin with friction
      const start = { v: vel };
      gsap.to(start, {
        v: 0,
        duration: Math.min(2.0, Math.abs(vel) * 0.6 + 0.6),
        ease: "power3.out",
        onUpdate: () => { state.rotation += start.v * gsap.ticker.deltaRatio() * (1 / 60); },
      });
    }
    state.velSamples.length = 0;
  };
  root.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Buttons spin
  leftBtn?.addEventListener('click', () => {
    gsap.to(state, { rotation: state.rotation - Math.PI / 6, duration: 0.5, ease: 'power2.out' });
  });
  rightBtn?.addEventListener('click', () => {
    gsap.to(state, { rotation: state.rotation + Math.PI / 6, duration: 0.5, ease: 'power2.out' });
  });

  // Wheel adjusts target speed briefly
  root.addEventListener('wheel', (e) => {
    if (e.deltaY === 0) return;
    state.targetSpeed += (e.deltaY > 0 ? 1 : -1) * (Math.PI / 90); // +/- 2 deg/s
    gsap.to(state, { targetSpeed: 0, duration: 1.2, ease: 'power2.out' });
  }, { passive: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechOrbit, { once: true });
  } else {
    initTechOrbit();
  }
}

export {};
