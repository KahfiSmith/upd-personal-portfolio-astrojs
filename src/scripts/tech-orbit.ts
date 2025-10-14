import { gsap } from "gsap";

let isInitialized = false;

function initTechOrbit(): void {
  const root = document.querySelector<HTMLElement>('[data-tech-orbit]');
  if (!root || isInitialized) return;
  
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-tech-item]'));
  if (items.length === 0) return;

  isInitialized = true;

  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  let loaded = 0;
  
  const checkImages = () => {
    loaded++;
    if (loaded >= images.length) {
      setTimeout(() => startOrbit(), 200);
    }
  };

  const startOrbit = () => {
    let rotation = 0;
    const speed = Math.PI / 18;
    let lastTime = performance.now();

    const getBounds = () => root.getBoundingClientRect();
    const getRadius = () => {
      const b = getBounds();
      return Math.min(b.width, b.height) / 2 - 50;
    };

    const baseAngles = items.map((_, i) => (i / items.length) * Math.PI * 2);

    const animate = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      rotation += speed * dt;

      const r = getRadius();
      items.forEach((el, i) => {
        const angle = baseAngles[i] + rotation;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const depth = (Math.sin(angle) + 1) / 2;
        
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: x,
          y: y,
          scale: 0.9 + depth * 0.2,
          force3D: true,
        });
        
        el.style.opacity = String(0.6 + depth * 0.4);
      });
    };

    gsap.ticker.add(animate);
    root.classList.add('orbit-initialized');

    (window as any).__techOrbitCleanup = () => {
      gsap.ticker.remove(animate);
      root.classList.remove('orbit-initialized');
      isInitialized = false;
    };
  };

  if (images.length === 0) {
    setTimeout(() => startOrbit(), 100);
  } else {
    images.forEach(img => {
      if (img.complete) checkImages();
      else {
        img.addEventListener('load', checkImages);
        img.addEventListener('error', checkImages);
      }
    });
  }
}

function init() {
  if ((window as any).__techOrbitCleanup) {
    try { 
      (window as any).__techOrbitCleanup(); 
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  setTimeout(() => initTechOrbit(), 150);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('astro:page-load', init);
  
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) init();
  });
}

export {};
