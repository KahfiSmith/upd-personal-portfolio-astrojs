import { gsap } from "gsap";

interface SimpleLoaderElements {
  loader: HTMLElement;
  curtainTop: HTMLElement;
  curtainBottom: HTMLElement;
  brandName: HTMLElement;
  brandSubtitle: HTMLElement;
  floatingOrb: HTMLElement;
  decorativeBg: HTMLElement;
  progressContainer: HTMLElement;
  progressBar: HTMLElement;
  progressNumber: HTMLElement;
}

class SimpleCurtainLoaderAnimation {
  private elements: SimpleLoaderElements;
  private timeline: gsap.core.Timeline;
  // Delay antara progress 100% dan mulai buka tirai (detik)
  private curtainOpenDelay: number = 0.35;
  private exitStarted: boolean = false;
  private isReloadVisit: boolean = false;

  constructor() {
    this.elements = this.getElements();
    this.timeline = gsap.timeline();
    this.isReloadVisit = this.detectReload();
    
    if (this.elements.loader) {
      if (!this.isReloadVisit) {
        // Not a reload: remove loader immediately and skip
        try { document.body.classList.remove('overflow-hidden'); } catch (e) {}
        this.elements.loader.remove();
        return;
      }
      this.init();
    }
  }

  private detectReload(): boolean {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav && 'type' in nav) {
        return nav.type === 'reload';
      }
      // Fallback for deprecated API
      // @ts-ignore
      if (performance && performance.navigation) {
        // 1 === TYPE_RELOAD
        // @ts-ignore
        return performance.navigation.type === 1;
      }
    } catch {}
    return false;
  }

  private getElements(): SimpleLoaderElements {
    return {
      loader: document.querySelector('#simple-curtain-loader') as HTMLElement,
      curtainTop: document.querySelector('.curtain-top') as HTMLElement,
      curtainBottom: document.querySelector('.curtain-bottom') as HTMLElement,
      brandName: document.querySelector('.brand-name') as HTMLElement,
      brandSubtitle: document.querySelector('.brand-subtitle') as HTMLElement,
      floatingOrb: document.querySelector('.floating-orb') as HTMLElement,
      decorativeBg: document.querySelector('.decorative-bg') as HTMLElement,
      progressContainer: document.querySelector('.progress-container') as HTMLElement,
      progressBar: document.querySelector('.progress-bar') as HTMLElement,
      progressNumber: document.querySelector('.progress-number') as HTMLElement,
    };
  }

  private init(): void {
    // Set initial states
    this.setInitialStates();
    
    // Start entrance animation
    this.animateEntrance();
    
    // Exit akan dipicu saat progress mencapai 100% (lihat onComplete di animateProgress)
  }

  private setInitialStates(): void {
    const { 
      loader, curtainTop, curtainBottom, brandName, 
      brandSubtitle, floatingOrb, progressContainer,
      progressBar, progressNumber
    } = this.elements;

    // Show loader
    gsap.set(loader, { 
      opacity: 1 
    });

    // Curtains start closed
    gsap.set([curtainTop, curtainBottom], {
      y: 0
    });

    // Brand elements hidden initially
    gsap.set([brandName, brandSubtitle, progressContainer], {
      opacity: 0,
      y: 50
    });

    // Progress bar starts empty
    gsap.set(progressBar, {
      width: "0%"
    });

    // Progress number starts at 0
    if (progressNumber) {
      progressNumber.textContent = "0";
    }

    // Floating orb starts invisible
    gsap.set(floatingOrb, {
      opacity: 0,
      scale: 0.5
    });

    // Prevent body scroll
    document.body.classList.add('overflow-hidden');
  }

  private animateEntrance(): void {
    this.timeline
      // Show floating orb
      .to(this.elements.floatingOrb, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out"
      })
      
      // Animate brand name
      .to(this.elements.brandName, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=1")
      
      // Show subtitle
      .to(this.elements.brandSubtitle, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4")
      
      // Show progress container
      .to(this.elements.progressContainer, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.2")
      
      // Start progress animation
      .call(() => this.animateProgress(), [], "-=0.2");
  }

  private animateProgress(): void {
    const progressObj = { value: 0 };
    const targetProgress = 100;
    const duration = 2500; // 2.5 seconds
    
    gsap.to(progressObj, {
      value: targetProgress,
      duration: duration / 1000,
      ease: "power2.out",
      onUpdate: () => {
        const currentProgress = Math.round(progressObj.value);
        
        // Update progress bar width
        gsap.set(this.elements.progressBar, {
          width: `${currentProgress}%`
        });
        
        // Update progress number
        if (this.elements.progressNumber) {
          this.elements.progressNumber.textContent = currentProgress.toString();
        }
      },
      onComplete: () => {
        if (!this.exitStarted) {
          const delayMs = Math.max(0, this.curtainOpenDelay) * 1000;
          if (delayMs > 0) setTimeout(() => this.animateExit(), delayMs);
          else this.animateExit();
        }
      }
    });
  }

  private async waitForContentLoad(): Promise<void> {
    const minLoadTime = 2500; // Consistent duration when animation actually runs
    
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
    if (this.exitStarted) return;
    this.exitStarted = true;
    const exitTimeline = gsap.timeline({
      onComplete: () => {
        // Cleanup only (no visit flag; index always shows curtain)
        document.body.classList.remove('overflow-hidden');
        try {
          document.documentElement.classList.remove('needs-reveal');
          document.documentElement.classList.remove('loader-active');
        } catch (e) {}
        this.elements.loader.remove();
      }
    });

    exitTimeline
      .add('openNow')
      // Fade brand/progress quickly
      .to([this.elements.brandName, this.elements.brandSubtitle, this.elements.progressContainer], {
        opacity: 0,
        y: -16,
        duration: 0.35,
        ease: "power2.in",
        stagger: 0.05
      }, 'openNow')
      // Fade orb
      .to(this.elements.floatingOrb, {
        opacity: 0,
        scale: 0.5,
        duration: 0.3,
        ease: "power2.in"
      }, 'openNow')
      // Fade decorative background
      .to(this.elements.decorativeBg, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      }, 'openNow')
      // Release body bg and make loader bg transparent immediately
      .call(() => { try { document.documentElement.classList.remove('loader-active'); } catch (e) {} }, [], 'openNow')
      .to(this.elements.loader, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.01, ease: 'none' }, 'openNow')
      // Open curtains immediately
      .to(this.elements.curtainTop, { y: '-100%', duration: 1.25, ease: "power3.inOut" }, 'openNow')
      .to(this.elements.curtainBottom, { y: '100%', duration: 1.25, ease: "power3.inOut" }, 'openNow')
      // Final cleanup
      .to(this.elements.loader, { opacity: 0, duration: 0.1, ease: "power2.inOut" }, 'openNow+=0.85');
  }
}

// Initialize when DOM is ready
function initSimpleCurtainLoader(): void {
  const loader = document.querySelector('#simple-curtain-loader');
  if (loader) {
    new SimpleCurtainLoaderAnimation();
  }
}

// Boot the loader
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSimpleCurtainLoader, { once: true });
} else {
  initSimpleCurtainLoader();
}

export default initSimpleCurtainLoader;
