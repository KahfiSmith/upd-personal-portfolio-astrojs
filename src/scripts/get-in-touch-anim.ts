// Lightweight hover/click micro-interactions for the "Get in Touch" pill
// - Translate X/Y following cursor
// - Simple slide-in charcoal fill on hover
// - Ripple on click

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const initGetInTouchAnim = () => {
  const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
  if (!pill) return;

  // Idempotent guard across HMR/nav restores
  if ((pill as any)._gi_inited) return;
  (pill as any)._gi_inited = true;

  const circleBg = pill.querySelector<HTMLElement>('[data-circle-bg]');
  const ripple = pill.querySelector<HTMLElement>('[data-ripple]');

  // Prepare styles
  pill.style.willChange = 'transform';
  pill.style.transition = 'transform 180ms ease-out';

  let hasShown = false;
  let bgVisible = false;
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
    if (circleBg) {
      hasShown = true;
      // Enable transition only when revealing
      circleBg.style.transition = 'transform 220ms ease-out, background-color 220ms ease-out, opacity 220ms ease-out';
      circleBg.style.opacity = '1';
      circleBg.style.transform = 'translateX(0)';
      (pill as HTMLElement).classList.add('is-active');
      (pill as HTMLElement).classList.add('has-fill');
      bgVisible = true;
    }
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
    // Always revert to initial (no persistent fill)
    pill.style.transform = 'translate(0px, 0px)';
    if (circleBg) {
      circleBg.style.transform = 'translateX(-100%)';
      circleBg.style.opacity = '0';
      (pill as HTMLElement).classList.remove('has-fill');
      (pill as HTMLElement).classList.remove('is-active');
      bgVisible = false;
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
  };
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
      // Force visual reset so it doesn't remain filled
      const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
      const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
      if (pill && circleBg) {
        circleBg.style.transition = 'none';
        circleBg.style.transform = 'translateX(-100%)';
        circleBg.style.opacity = '0';
        pill.style.transform = 'translate(0px, 0px)';
        pill.classList.remove('has-fill');
        pill.classList.remove('is-active');
        // Re-enable transitions after a tick
        requestAnimationFrame(() => {
          circleBg.style.transition = 'transform 220ms ease-out, background-color 220ms ease-out, opacity 220ms ease-out';
        });
      }
      start();
    }
  });
  // Re-run on Astro swap
  document.addEventListener('astro:after-swap', () => {
    const pill = document.querySelector<HTMLElement>('[data-get-in-touch]');
    const circleBg = pill?.querySelector<HTMLElement>('[data-circle-bg]');
    if (pill && circleBg) {
      circleBg.style.transition = 'none';
      circleBg.style.transform = 'translateX(-100%)';
      circleBg.style.opacity = '0';
      pill.style.transform = 'translate(0px, 0px)';
      pill.classList.remove('has-fill');
      pill.classList.remove('is-active');
      requestAnimationFrame(() => {
        circleBg.style.transition = 'transform 220ms ease-out, background-color 220ms ease-out, opacity 220ms ease-out';
      });
    }
    start();
  });
}

export {};
