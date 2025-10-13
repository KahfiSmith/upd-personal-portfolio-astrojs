import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function initAboutMeAnimations() {
  const aboutSection = document.querySelector('#about');
  const aboutContainer = document.querySelector('.about-container');
  if (!aboutSection || !aboutContainer) return;

  // Get all elements we need
  const skillCards = document.querySelectorAll('.skill-card');
  const ctaButtons = document.querySelectorAll('[data-about-cta] a');
  const profileCard = document.querySelector('[data-profile-card]');
  const floatingDots = document.querySelectorAll('[data-floating-dot-1], [data-floating-dot-2]');

  // Set initial states
  gsap.set('[data-about-title]', { y: 100, opacity: 0 });
  gsap.set('[data-about-subtitle]', { y: 60, opacity: 0 });
  gsap.set('[data-story-title]', { y: 40, opacity: 0 });
  gsap.set('[data-about-text-1], [data-about-text-2]', { y: 30, opacity: 0 });
  gsap.set('[data-philosophy-card]', { y: 50, opacity: 0, scale: 0.95 });
  gsap.set('[data-skills-title]', { y: 30, opacity: 0 });
  gsap.set('.skill-card', { y: 40, opacity: 0, scale: 0.9, rotationY: -15 });
  gsap.set('[data-about-cta] a', { y: 30, opacity: 0, scale: 0.95 });
  gsap.set('[data-profile-card]', { x: 50, opacity: 0, scale: 0.95 });
  gsap.set('[data-timeline-card]', { x: 30, opacity: 0 });
  gsap.set('[data-quote-card]', { x: 40, opacity: 0, rotationX: 10 });

  // Main timeline
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: aboutSection,
      start: 'top 70%',
      end: 'bottom 30%',
      toggleActions: 'play none none reverse',
    }
  });

  // 1. Header animations
  masterTl
    .to('[data-about-title]', {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power4.out',
    }, 0)
    .to('[data-about-subtitle]', {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    }, 0.2);

  // 2. Left column content
  masterTl
    .to('[data-story-title]', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 0.4)
    .to('[data-about-text-1], [data-about-text-2]', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
    }, 0.5)
    .to('[data-philosophy-card]', {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'back.out(1.7)',
    }, 0.7);

  // 3. Skills section
  masterTl
    .to('[data-skills-title]', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 0.8)
    .to('.skill-card', {
      y: 0,
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: {
        amount: 0.6,
        grid: [2, 3],
        from: 'start'
      }
    }, 0.9);

  // 4. CTA buttons
  masterTl
    .to('[data-about-cta] a', {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.1,
    }, 1.1);

  // 5. Right column cards
  masterTl
    .to('[data-profile-card]', {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
    }, 0.6)
    .to('[data-timeline-card]', {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    }, 0.8)
    .to('[data-quote-card]', {
      x: 0,
      opacity: 1,
      rotationX: 0,
      duration: 1,
      ease: 'power3.out',
    }, 1.0);

  // Parallax Background Elements
  const parallaxElements = {
    slow: document.querySelectorAll('[data-parallax-bg="slow"]'),
    medium: document.querySelectorAll('[data-parallax-bg="medium"]'),
    fast: document.querySelectorAll('[data-parallax-bg="fast"]')
  };

  Object.entries(parallaxElements).forEach(([speed, elements]) => {
    if (elements.length) {
      const factor = speed === 'slow' ? 0.3 : speed === 'medium' ? 0.5 : 0.7;
      gsap.to(elements, {
        y: -100 * factor,
        scrollTrigger: {
          trigger: aboutContainer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }
  });

  // Interactive Hover Effects for Skills
  if (skillCards.length) {
    skillCards.forEach((skillCard: Element) => {
      skillCard.addEventListener('mouseenter', () => {
        gsap.to(skillCard, {
          scale: 1.05,
          y: -3,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });

      skillCard.addEventListener('mouseleave', () => {
        gsap.to(skillCard, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  // Interactive Card Tilt Effect
  if (profileCard) {
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = profileCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (mouseEvent.clientY - centerY) / 15;
      const rotateY = (centerX - mouseEvent.clientX) / 15;
      
      gsap.to(profileCard, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(profileCard, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    profileCard.addEventListener('mousemove', handleMouseMove);
    profileCard.addEventListener('mouseleave', handleMouseLeave);

    // Clean up on HMR
    // @ts-ignore
    if (import.meta && (import.meta as any).hot) {
      // @ts-ignore
      (import.meta as any).hot.dispose(() => {
        profileCard.removeEventListener('mousemove', handleMouseMove);
        profileCard.removeEventListener('mouseleave', handleMouseLeave);
      });
    }
  }

  // Magnetic effect for CTA buttons
  if (ctaButtons.length) {
    ctaButtons.forEach((button: Element) => {
      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (mouseEvent.clientX - centerX) * 0.15;
        const deltaY = (mouseEvent.clientY - centerY) * 0.15;
        
        gsap.to(button, {
          x: deltaX,
          y: deltaY,
          duration: 0.5,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      };

      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  // Floating dots animation
  if (floatingDots.length) {
    floatingDots.forEach((dot: Element, index: number) => {
      gsap.to(dot, {
        y: -15,
        duration: 2.5 + index * 0.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: index * 0.3,
      });
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutMeAnimations, { once: true });
} else {
  initAboutMeAnimations();
}

export {};