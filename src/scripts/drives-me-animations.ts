import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Initialize GSAP animations for What Drives Me section
let drivesInited = false;

export function initDrivesMeAnimations() {
  if (drivesInited) return;
  drivesInited = true;

  // Title animation sequence — animate from current visible state
  const titleTl = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-drives-title]",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play none none reverse"
    }
  });

  titleTl
    .from("[data-drives-title]", {
      duration: 1.0,
      opacity: 0,
      y: 50,
      rotationX: -15,
      ease: "power3.out"
    })
    .from("[data-drives-line-left]", {
      duration: 0.8,
      scaleX: 0,
      opacity: 0,
      transformOrigin: "right center",
      ease: "power2.out"
    }, "-=0.6")
    .from("[data-drives-line-right]", {
      duration: 0.8,
      scaleX: 0,
      opacity: 0,
      transformOrigin: "left center",
      ease: "power2.out"
    }, "-=0.8")
    .from("[data-drives-dot]", {
      duration: 0.6,
      scale: 0,
      rotation: -180,
      ease: "back.out(1.7)"
    }, "-=0.4");

  // Items animations with stagger effect
  const items = gsap.utils.toArray(".drives-item");
  
  items.forEach((item: any, index) => {
    const itemTl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse"
      }
    });

    // Item entrance animation from a subtle offset
    itemTl.from(item, {
      duration: 1.0,
      opacity: 0,
      y: 100,
      ease: "power3.out",
      delay: index * 0.15
    });

    // Setup hover animations for each item
    setupItemHoverAnimations(item, index);
  });

  // Scroll-triggered reveals are handled globally via data-animate.
  // Keep only hover + title micro-sequence to reduce duplication.
  try { ScrollTrigger.refresh(); } catch {}
}

function setupItemHoverAnimations(item: Element, index: number) {
  const itemElement = item as HTMLElement;
  const numberGradient = itemElement.querySelector('.drives-number-gradient');
  const underline = itemElement.querySelector('.drives-underline');
  const divider = itemElement.querySelector('.drives-divider');
  const description = itemElement.querySelector('.drives-description');
  const title = itemElement.querySelector('.drives-title');

  // Create hover timeline
  const hoverTl = gsap.timeline({ paused: true });
  
  hoverTl
    .to(numberGradient, {
      duration: 0.8,
      opacity: 1,
      scale: 1.1,
      ease: "power2.out"
    })
    .to(underline, {
      duration: 0.8,
      width: "100%",
      ease: "power2.out"
    }, 0.2)
    .to(divider, {
      duration: 0.6,
      height: 80,
      backgroundColor: getGradientColor(index),
      ease: "power2.out"
    }, 0.1)
    .to(description, {
      duration: 0.4,
      color: "#1f2937",
      ease: "power2.out"
    }, 0.2)
    .to(title, {
      duration: 0.4,
      scale: 1.05,
      ease: "power2.out"
    }, 0.2);

  // Mouse enter/leave events
  itemElement.addEventListener('mouseenter', () => {
    hoverTl.play();
  });
  
  itemElement.addEventListener('mouseleave', () => {
    hoverTl.reverse();
  });
}

// Duplicate scroll reveal removed; using global initAnimations instead

// Self-initialize on page load (Astro + normal navigation)
function init() {
  // Defer slightly to ensure DOM is painted
  setTimeout(() => {
    try {
      initDrivesMeAnimations();
    } catch (e) {
      // swallow to avoid runtime breakage
      console.error("drives-me animations init error", e);
    }
  }, 150);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle Astro page transitions
  document.addEventListener('astro:page-load', init);
  
  // Restore after bfcache
  window.addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) init();
  });
}

export {};


function getGradientColor(index: number): string {
  const colors = [
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#a855f7'  // purple
  ];
  return colors[index] || colors[0];
}
