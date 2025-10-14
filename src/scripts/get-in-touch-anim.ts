// Lightweight hover/click micro-interactions for the "Get in Touch" pill
// - Translate X/Y following cursor
// - Simple slide-in charcoal fill on hover
// - Ripple on click

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const initGetInTouchAnim = () => {
  const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
  if (!pill) return;

  // Clean up any existing initialization
  if ((pill as any)._gi_cleanup) {
    (pill as any)._gi_cleanup();
  }

  const circleBg = pill.querySelector<HTMLElement>('[data-circle-bg]');
  const ripple = pill.querySelector<HTMLElement>('[data-ripple]');

  // Prepare styles
  pill.style.willChange = 'transform';
  pill.style.transition = 'transform 180ms ease-out';

  // Reset state for this instance
  let bgVisible = false;
  let hasShown = false;
  if (circleBg) {
    // Prevent initial flash-out: no transition during setup
    circleBg.style.transition = 'none';
    circleBg.style.background = '#111827'; // charcoal
    circleBg.style.opacity = '0';
    circleBg.style.transform = 'translateX(-100%)';
  }

  if (ripple) {
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(1)';
    ripple.style.opacity = '0';
    ripple.style.transition = 'transform 450ms ease-out, opacity 450ms ease-out';
  }

  const onEnter = () => {
    if (!circleBg) return;
    hasShown = true;
    // Make fill visible immediately, animate only the slide
    circleBg.style.opacity = '1';
    circleBg.style.transition = 'transform 280ms ease-out';
    circleBg.style.transform = 'translateX(0)';
    (pill as HTMLElement).classList.add('is-active');
    (pill as HTMLElement).classList.add('has-fill');
    bgVisible = true;
  };

  const onMove = (e: MouseEvent) => {
    const rect = pill.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (x / rect.width) * 2 - 1; // -1..1
    const ry = (y / rect.height) * 2 - 1; // -1..1

    // Max 8px horizontal, 6px vertical movement
    const tx = clamp(rx * 8, -8, 8);
    const ty = clamp(ry * 6, -6, 6);
    pill.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  const onLeave = () => {
    // Always revert to initial state (no persistent fill)
    pill.style.transform = 'translate(0px, 0px)';
    if (!circleBg) return;
    // Slide out first (crisp), then hide opacity after transition ends to avoid fade feel
    circleBg.style.transition = 'transform 280ms ease-out';
    const onEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== 'transform') return;
      circleBg.removeEventListener('transitionend', onEnd);
      // Hide without animating opacity to prevent pulsing/fade feel
      const prev = circleBg.style.transition;
      circleBg.style.transition = 'none';
      circleBg.style.opacity = '0';
      // Keep transition setting consistent for next hover
      requestAnimationFrame(() => { circleBg.style.transition = prev || 'transform 280ms ease-out'; });
    };
    circleBg.addEventListener('transitionend', onEnd, { once: true });
    circleBg.style.transform = 'translateX(-100%)';
    (pill as HTMLElement).classList.remove('has-fill');
    (pill as HTMLElement).classList.remove('is-active');
    bgVisible = false;
  };

  const onClick = () => {
    if (!ripple) return;
    // Restart ripple animation
    ripple.style.transition = 'none';
    ripple.style.transform = 'scale(1)';
    ripple.style.opacity = '0.3';
    // Force reflow
    (ripple as HTMLElement).offsetHeight;
    ripple.style.transition = 'transform 450ms ease-out, opacity 450ms ease-out';
    ripple.style.transform = 'scale(1.2)';
    ripple.style.opacity = '0';
  };

  pill.addEventListener('mouseenter', onEnter);
  pill.addEventListener('mousemove', onMove);
  pill.addEventListener('mouseleave', onLeave);
  pill.addEventListener('click', onClick);

  // Clean up if needed (Astro HMR safety)
  const cleanup = () => {
    pill.removeEventListener('mouseenter', onEnter);
    pill.removeEventListener('mousemove', onMove);
    pill.removeEventListener('mouseleave', onLeave);
    pill.removeEventListener('click', onClick);
    (pill as any)._gi_cleanup = null;
  };
  
  // Store cleanup function on element
  (pill as any)._gi_cleanup = cleanup;
  
  // @ts-ignore
  if (import.meta && (import.meta as any).hot) {
    // @ts-ignore
    (import.meta as any).hot.dispose(() => cleanup());
  }
};

if (typeof document !== 'undefined') {
  const start = () => initGetInTouchAnim();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  // Re-run on BFCache restore
  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    if ((e as any).persisted) {
      // Force visual reset before re-init
      const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
      const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
      if (pill && circleBg) {
        const prev = circleBg.style.transition;
        circleBg.style.transition = 'none';
        circleBg.style.transform = 'translateX(-100%)';
        circleBg.style.opacity = '0';
        pill.style.transform = 'translate(0px, 0px)';
        pill.classList.remove('has-fill');
        pill.classList.remove('is-active');
        requestAnimationFrame(() => {
          circleBg.style.transition = prev || 'transform 280ms ease-out';
        });
      }
      start();
    }
  });
  // Re-run on Astro swap
  document.addEventListener('astro:after-swap', () => {
    // Reset button state before re-initialization
    const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
    const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
    if (pill && circleBg) {
      circleBg.style.transition = 'none';
      circleBg.style.transform = 'translateX(-100%)';
      circleBg.style.opacity = '0';
      pill.style.transform = 'translate(0px, 0px)';
      pill.classList.remove('has-fill');
      pill.classList.remove('is-active');
    }
    start();
  });
  
  // Also listen for astro:page-load for additional safety
  document.addEventListener('astro:page-load', () => {
    // Reset button state before re-initialization
    const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
    const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
    if (pill && circleBg) {
      circleBg.style.transition = 'none';
      circleBg.style.transform = 'translateX(-100%)';
      circleBg.style.opacity = '0';
      pill.style.transform = 'translate(0px, 0px)';
      pill.classList.remove('has-fill');
      pill.classList.remove('is-active');
    }
    start();
  });
}

export {};
