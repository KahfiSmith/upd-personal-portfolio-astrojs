import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Initialize GSAP animations for What Drives Me section
export function initDrivesMeAnimations() {
  // Set initial states
  gsap.set("[data-drives-title]", { 
    opacity: 0, 
    y: 50,
    rotationX: -15
  });
  
  gsap.set("[data-drives-line-left], [data-drives-line-right]", {
    scaleX: 0,
    opacity: 0
  });
  
  gsap.set("[data-drives-dot]", {
    scale: 0,
    rotation: -180
  });

  gsap.set(".drives-item", {
    opacity: 0,
    y: 100,
    transformOrigin: "center center"
  });

  // Title animation sequence
  const titleTl = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-drives-title]",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play none none reverse"
    }
  });

  titleTl
    .to("[data-drives-title]", {
      duration: 1.2,
      opacity: 1,
      y: 0,
      rotationX: 0,
      ease: "power3.out"
    })
    .to("[data-drives-line-left]", {
      duration: 0.8,
      scaleX: 1,
      opacity: 1,
      transformOrigin: "right center",
      ease: "power2.out"
    }, "-=0.6")
    .to("[data-drives-line-right]", {
      duration: 0.8,
      scaleX: 1,
      opacity: 1,
      transformOrigin: "left center",
      ease: "power2.out"
    }, "-=0.8")
    .to("[data-drives-dot]", {
      duration: 0.6,
      scale: 1,
      rotation: 0,
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

    // Item entrance animation
    itemTl.to(item, {
      duration: 1.4,
      opacity: 1,
      y: 0,
      ease: "power3.out",
      delay: index * 0.2
    });

    // Setup hover animations for each item
    setupItemHoverAnimations(item, index);
  });

  // Setup scroll-triggered reveals for card elements
  setupScrollRevealAnimations();
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

function setupScrollRevealAnimations() {
  // Animate numbers on scroll
  gsap.utils.toArray('.drives-number').forEach((number: any) => {
    gsap.fromTo(number, 
      { 
        opacity: 0, 
        scale: 0.8,
        rotationY: -90 
      },
      {
        duration: 1.2,
        opacity: 1,
        scale: 1,
        rotationY: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: number,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Animate descriptions with typewriter effect
  gsap.utils.toArray('.drives-description').forEach((desc: any) => {
    gsap.fromTo(desc,
      {
        opacity: 0,
        y: 30
      },
      {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: desc,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

}





function getGradientColor(index: number): string {
  const colors = [
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#a855f7'  // purple
  ];
  return colors[index] || colors[0];
}

// Auto-initialize when DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initDrivesMeAnimations);
}