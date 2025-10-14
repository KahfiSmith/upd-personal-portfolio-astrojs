import { gsap } from "gsap";

const initDiscoverButtonAnim = () => {
  const button = document.querySelector<HTMLElement>('[data-discover-button]');
  if (!button) return;

  // Idempotent guard across BFCache/HMR
  if ((button as any)._disc_inited) return;
  (button as any)._disc_inited = true;

  const fillBg = button.querySelector<HTMLElement>('[data-fill-bg]');
  const buttonText = button.querySelector<HTMLElement>('[data-button-text]');
  const ripple = button.querySelector<HTMLElement>('[data-ripple]');

  if (!fillBg || !buttonText) return;

  // Set initial states
  gsap.set(fillBg, { 
    scaleX: 0, 
    transformOrigin: "left center",
    backgroundColor: "#111827" // charcoal
  });

  // Hover animations
  const onEnter = () => {
    // Fill background animation
    gsap.to(fillBg, {
      scaleX: 1,
      duration: 0.4,
      ease: "power2.out"
    });

    // Text color change
    gsap.to(buttonText, {
      color: "#f5f5f0", // cream
      duration: 0.3,
      ease: "power2.out"
    });

    // Scale up slightly
    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const onLeave = () => {
    // Fill background animation (reverse)
    gsap.to(fillBg, {
      scaleX: 0,
      duration: 0.4,
      ease: "power2.out"
    });

    // Text color change (reverse)
    gsap.to(buttonText, {
      color: "#111827", // charcoal
      duration: 0.3,
      ease: "power2.out"
    });

    // Scale back to normal
    gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const onClick = () => {
    if (ripple) {
      // Reset ripple
      gsap.set(ripple, { scale: 0, opacity: 0.3 });
      
      // Ripple animation
      gsap.to(ripple, {
        scale: 1.2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    // Click feedback
    gsap.to(button, {
      scale: 0.98,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  };

  // Event listeners
  button.addEventListener('mouseenter', onEnter);
  button.addEventListener('mouseleave', onLeave);
  button.addEventListener('click', onClick);

  // Cleanup function for hot reload
  const cleanup = () => {
    button.removeEventListener('mouseenter', onEnter);
    button.removeEventListener('mouseleave', onLeave);
    button.removeEventListener('click', onClick);
  };

  // @ts-ignore
  if (import.meta && (import.meta as any).hot) {
    // @ts-ignore
    (import.meta as any).hot.dispose(() => cleanup());
  }
};

if (typeof document !== 'undefined') {
  const start = () => initDiscoverButtonAnim();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  // Re-run on BFCache restore
  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    if ((e as any).persisted) start();
  });
  // Re-run on Astro swap
  document.addEventListener('astro:after-swap', start);
}

export {};
