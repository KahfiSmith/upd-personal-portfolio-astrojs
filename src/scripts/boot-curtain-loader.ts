import { gsap } from "gsap";

interface CurtainElements {
  loader: HTMLElement;
  curtainTop: HTMLElement;
  curtainBottom: HTMLElement;
  brandLetters: NodeListOf<HTMLElement>;
  brandSubtitle: HTMLElement;
  loadingProgress: HTMLElement;
  progressFill: HTMLElement;
  loadingDots: NodeListOf<HTMLElement>;
  statusMessage: HTMLElement;
  percentage: HTMLElement;
  decorativeShapes: NodeListOf<HTMLElement>;
}

class CurtainLoaderAnimation {
  private elements: CurtainElements;
  private timeline: gsap.core.Timeline;
  private progressValue: number = 0;
  private isFirstVisit: boolean;
  
  private statusMessages: string[] = [
    'Loading...',
    'Preparing assets...',
    'Almost ready...',
    'Welcome!'
  ];

  constructor() {
    this.isFirstVisit = !localStorage.getItem('hasVisited');
    this.elements = this.getElements();
    this.timeline = gsap.timeline();
    
    if (this.elements.loader) {
      this.init();
    }
  }

  private getElements(): CurtainElements {
    return {
      loader: document.querySelector('#curtain-loader') as HTMLElement,
      curtainTop: document.querySelector('.curtain-top') as HTMLElement,
      curtainBottom: document.querySelector('.curtain-bottom') as HTMLElement,
      brandLetters: document.querySelectorAll('.brand-letter') as NodeListOf<HTMLElement>,
      brandSubtitle: document.querySelector('.brand-subtitle') as HTMLElement,
      loadingProgress: document.querySelector('.loading-progress') as HTMLElement,
      progressFill: document.querySelector('.progress-fill') as HTMLElement,
      loadingDots: document.querySelectorAll('.dot') as NodeListOf<HTMLElement>,
      statusMessage: document.querySelector('.status-message') as HTMLElement,
      percentage: document.querySelector('.percentage') as HTMLElement,
      decorativeShapes: document.querySelectorAll('.deco-shape') as NodeListOf<HTMLElement>,
    };
  }

  private init(): void {
    // Set initial states
    this.setInitialStates();
    
    // Start entrance animation
    this.animateEntrance();
    
    // Start progress animation
    this.animateProgress();
    
    // Wait for content load, then exit
    this.waitForContentLoad().then(() => {
      this.animateExit();
    });
  }

  private setInitialStates(): void {
    const { 
      loader, curtainTop, curtainBottom, brandLetters, 
      brandSubtitle, loadingProgress, progressFill, 
      loadingDots, decorativeShapes 
    } = this.elements;

    // Show loader
    gsap.set(loader, { 
      opacity: 1 
    });

    // Curtains start closed (covering full screen)
    gsap.set([curtainTop, curtainBottom], {
      y: 0,
      scaleY: 1
    });

    // Brand elements hidden initially
    gsap.set(brandLetters, {
      opacity: 0,
      y: 50,
      scale: 0.8
    });

    gsap.set([brandSubtitle, loadingProgress], {
      opacity: 0,
      y: 30
    });

    // Progress bar starts empty
    gsap.set(progressFill, {
      x: '-100%'
    });

    // Loading dots start small
    gsap.set(loadingDots, {
      scale: 0.5,
      opacity: 0.3
    });

    // Decorative shapes start invisible
    gsap.set(decorativeShapes, {
      opacity: 0,
      scale: 0.5
    });

    // Prevent body scroll
    document.body.classList.add('overflow-hidden');
  }

  private animateEntrance(): void {
    this.timeline
      // Show decorative elements first
      .to(this.elements.decorativeShapes, {
        opacity: 0.1,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2
      })
      
      // Animate brand letters in
      .to(this.elements.brandLetters, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1
      }, "-=0.5")
      
      // Show subtitle
      .to(this.elements.brandSubtitle, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.3")
      
      // Show loading progress
      .to(this.elements.loadingProgress, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.2");
  }

  private animateProgress(): void {
    // Animate loading dots
    const dotsAnimation = gsap.timeline({ repeat: -1 });
    dotsAnimation
      .to(this.elements.loadingDots, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1
      })
      .to(this.elements.loadingDots, {
        scale: 0.5,
        opacity: 0.3,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.1
      });

    // Animate progress bar
    const duration = this.isFirstVisit ? 3 : 1.5;
    gsap.to(this.elements.progressFill, {
      x: '0%',
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        // Calculate progress percentage
        const progress = (gsap.getProperty(this.elements.progressFill, "x") as number + 100) / 100;
        this.progressValue = Math.round(progress * 100);
        
        // Update percentage display
        this.elements.percentage.textContent = `${Math.min(this.progressValue, 100)}%`;
        
        // Update status message based on progress
        const messageIndex = Math.floor(progress * (this.statusMessages.length - 1));
        this.elements.statusMessage.textContent = this.statusMessages[messageIndex] || this.statusMessages[0];
      }
    });
  }

  private async waitForContentLoad(): Promise<void> {
    const minLoadTime = this.isFirstVisit ? 2000 : 800;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkComplete = () => {
        const elapsedTime = Date.now() - startTime;
        const imagesLoaded = this.areImagesLoaded();
        const fontsLoaded = document.fonts ? document.fonts.ready : Promise.resolve();
        
        Promise.all([fontsLoaded]).then(() => {
          if (elapsedTime >= minLoadTime && imagesLoaded) {
            resolve();
          } else {
            setTimeout(checkComplete, 100);
          }
        });
      };
      
      checkComplete();
    });
  }

  private areImagesLoaded(): boolean {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  }

  private animateExit(): void {
    const exitTimeline = gsap.timeline({
      onComplete: () => {
        // Mark as visited and cleanup
        localStorage.setItem('hasVisited', 'true');
        document.body.classList.remove('overflow-hidden');
        this.elements.loader.remove();
      }
    });

    exitTimeline
      // Complete progress
      .to(this.elements.progressFill, {
        x: '0%',
        duration: 0.3,
        ease: "power2.out"
      })
      .to(this.elements.percentage, {
        textContent: '100%',
        duration: 0.1
      })
      .to(this.elements.statusMessage, {
        textContent: 'Welcome!',
        duration: 0.1
      })
      
      // Wait longer to ensure loading text is seen
      .to({}, { duration: 1.2 })
      
      // Hide loading elements COMPLETELY FIRST
      .to(this.elements.loadingProgress, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power2.in"
      })
      
      // Animate brand out COMPLETELY (no overlap timing)
      .to(this.elements.brandLetters, {
        opacity: 0,
        y: -40,
        scale: 0.8,
        duration: 0.8,
        ease: "power2.in",
        stagger: 0.02
      })
      .to(this.elements.brandSubtitle, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: "power2.in"
      }, "-=0.4")
      
      // EXTRA wait to ensure EVERYTHING is completely hidden
      .to({}, { duration: 0.8 })
      
      // NOW reveal - curtains open up and down
      .to(this.elements.curtainTop, {
        y: '-100%',
        duration: 1.2,
        ease: "power3.inOut"
      })
      .to(this.elements.curtainBottom, {
        y: '100%',
        duration: 1.2,
        ease: "power3.inOut"
      }, "-=1.2")
      
      // Final cleanup (only after curtains are almost done)
      .to(this.elements.loader, {
        opacity: 0,
        duration: 0.1,
        ease: "power2.inOut"
      }, "-=0.1");
  }
}

// Initialize when DOM is ready
function initCurtainLoader(): void {
  const loader = document.querySelector('#curtain-loader');
  if (loader) {
    new CurtainLoaderAnimation();
  }
}

// Boot the loader
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCurtainLoader, { once: true });
} else {
  initCurtainLoader();
}

export default initCurtainLoader;