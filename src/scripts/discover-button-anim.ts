// Lightweight hover/click micro-interactions for the "Discover My Story" button
// - Translate X/Y following cursor
// - Simple slide-in charcoal fill on hover
// - Ripple on click
// Same behavior as Get in Touch button

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const initDiscoverButtonAnim = () => {
  const button = document.querySelector<HTMLElement>('[data-discover-button]');
  if (!button) return;

  // Clean up any existing initialization
  if ((button as any)._disc_cleanup) {
    (button as any)._disc_cleanup();
  }

  const circleBg = button.querySelector<HTMLElement>('[data-circle-bg]');
  const ripple = button.querySelector<HTMLElement>('[data-ripple]');
  const buttonText = button.querySelector<HTMLElement>('[data-button-text]');

  // Prepare styles
  button.style.willChange = 'transform';
  button.style.transition = 'transform 180ms ease-out';

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
    (button as HTMLElement).classList.add('is-active');
    (button as HTMLElement).classList.add('has-fill');
    bgVisible = true;
    
    // Change text color to white/cream on hover
    if (buttonText) {
      buttonText.style.transition = 'color 300ms ease-out';
      buttonText.style.color = '#f4f3ed'; // cream
    }
  };

  const onMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (x / rect.width) * 2 - 1; // -1..1
    const ry = (y / rect.height) * 2 - 1; // -1..1

    // Max 8px horizontal, 6px vertical movement
    const tx = clamp(rx * 8, -8, 8);
    const ty = clamp(ry * 6, -6, 6);
    button.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  const onLeave = () => {
    // Always revert to initial state (no persistent fill)
    button.style.transform = 'translate(0px, 0px)';
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
    (button as HTMLElement).classList.remove('has-fill');
    (button as HTMLElement).classList.remove('is-active');
    bgVisible = false;
    
    // Revert text color back to charcoal
    if (buttonText) {
      buttonText.style.transition = 'color 300ms ease-out';
      buttonText.style.color = ''; // Reset to default (charcoal/60)
    }
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

  button.addEventListener('mouseenter', onEnter);
  button.addEventListener('mousemove', onMove);
  button.addEventListener('mouseleave', onLeave);
  button.addEventListener('click', onClick);

  // Clean up if needed (Astro HMR safety)
  const cleanup = () => {
    button.removeEventListener('mouseenter', onEnter);
    button.removeEventListener('mousemove', onMove);
    button.removeEventListener('mouseleave', onLeave);
    button.removeEventListener('click', onClick);
    (button as any)._disc_cleanup = null;
  };
  
  // Store cleanup function on element
  (button as any)._disc_cleanup = cleanup;
  
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
    if ((e as any).persisted) {
      // Force visual reset before re-init
      const button = document.querySelector<HTMLElement>('[data-discover-button]');
      const circleBg = button?.querySelector<HTMLElement>('[data-circle-bg]');
      if (button && circleBg) {
        const prev = circleBg.style.transition;
        circleBg.style.transition = 'none';
        circleBg.style.transform = 'translateX(-100%)';
        circleBg.style.opacity = '0';
        button.style.transform = 'translate(0px, 0px)';
        button.classList.remove('has-fill');
        button.classList.remove('is-active');
        requestAnimationFrame(() => {
          circleBg.style.transition = prev || 'transform 280ms ease-out';
        });
      }
      start();
    }
  });

  // Re-run on Astro page navigation
  document.addEventListener('astro:page-load', () => {
    start();
  });
}

export {};
