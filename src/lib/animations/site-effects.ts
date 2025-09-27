import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Reveal overlay if it were visible (defensive)
const overlay = document.querySelector('#page-transition-overlay');
if (overlay) {
  gsap.set(overlay, { transformOrigin: 'top' });
  if (getComputedStyle(overlay).transform.includes('matrix(1') || overlay.classList.contains('scale-y-100')) {
    gsap.to(overlay, { scaleY: 0, duration: 1, ease: 'power4.inOut' });
  }
}

// Small utility animations
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.querySelector('[data-gsap-test]');
  if (badge) {
    gsap.to(badge, {
      scale: 1.4,
      opacity: 0.6,
      duration: 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: 'center center',
    });
  }

  gsap.utils.toArray<HTMLElement>('[data-animate]').forEach((el) => {
    const type = el.getAttribute('data-animate');
    const delay = parseFloat(el.getAttribute('data-delay') || '0');
    if (type === 'fade-up') {
      gsap.from(el, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay, scrollTrigger: { trigger: el, start: 'top 85%' } });
    } else if (type === 'fade-in') {
      gsap.from(el, { opacity: 0, duration: 0.6, ease: 'power2.out', delay, scrollTrigger: { trigger: el, start: 'top 90%' } });
    } else if (type === 'scale-in') {
      gsap.from(el, { scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', delay, scrollTrigger: { trigger: el, start: 'top 85%' } });
    }
  });
});

