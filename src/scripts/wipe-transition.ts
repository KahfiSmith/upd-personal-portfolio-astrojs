import { gsap } from "gsap";

type WipeOverlay = {
  root: HTMLElement;
  overlay: HTMLElement;
  backdrop: HTMLElement;
  title: HTMLElement;
  decorationTop: HTMLElement;
  decorationBottom: HTMLElement;
};

// Mapping path ke judul halaman
const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/blog": "Blog",
  "/works": "Works",
  "/contact": "Contact",
};

console.log('🎬 Wipe Transition Script Loaded');

function getPageTitle(href: string): string {
  try {
    const url = new URL(href, window.location.origin);
    const pathname = url.pathname;
    
    // Cek exact match
    if (PAGE_TITLES[pathname]) {
      return PAGE_TITLES[pathname];
    }
    
    // Cek partial match untuk nested routes
    for (const [path, title] of Object.entries(PAGE_TITLES)) {
      if (pathname.startsWith(path) && path !== "/") {
        return title;
      }
    }
    
    // Fallback: ambil dari pathname
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1]
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    
    return "Home";
  } catch {
    return "Home";
  }
}

function buildWipeOverlay(): WipeOverlay | null {
  const root = document.getElementById("wipe-transition-overlay") as HTMLElement | null;
  if (!root) return null;
  
  const backdrop = root.querySelector<HTMLElement>(".wipe-backdrop");
  const overlay = root.querySelector<HTMLElement>(".wipe-overlay");
  const title = root.querySelector<HTMLElement>(".wipe-title");
  const decorationTop = root.querySelector<HTMLElement>(".wipe-decoration.top");
  const decorationBottom = root.querySelector<HTMLElement>(".wipe-decoration.bottom");
  
  if (!backdrop || !overlay || !title || !decorationTop || !decorationBottom) return null;
  return { root, backdrop, overlay, title, decorationTop, decorationBottom };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' 
    && window.matchMedia 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let transitioning = false;

async function navigateTo(href: string) {
  try {
    // @ts-ignore - virtual module provided by Astro; ignore TS resolution
    const mod: any = await import(/* @vite-ignore */ 'astro:transitions/client');
    if (mod && typeof mod.navigate === 'function') {
      await mod.navigate(href);
      return;
    }
  } catch (_) {}
  window.location.href = href;
}


// Animasi wipe out (halaman menghilang dengan overlay naik dari bawah)
function wipeOut(wipe: WipeOverlay, targetHref: string) {
  if (transitioning) {
    console.log('⚠️ Already transitioning, ignoring');
    return;
  }
  
  console.log('🎬 Starting wipe out to:', targetHref);
  transitioning = true;
  
  // STEP 1: FREEZE CURRENT PAGE - Capture screen as snapshot
  const appContent = document.getElementById('app-content');
  if (appContent) {
    // Force GPU rendering and lock current state
    appContent.style.willChange = 'auto';
    appContent.style.transform = 'translateZ(0)';
    
    // Take snapshot by cloning visible state (no interaction)
    const contentRect = appContent.getBoundingClientRect();
    console.log('📸 Freezing current page state', contentRect);
    
    // Immediately hide real content but keep frozen snapshot visible via overlay
    requestAnimationFrame(() => {
      appContent.style.opacity = '0';
      appContent.style.pointerEvents = 'none';
      console.log('🔒 Real content hidden, frozen snapshot active');
    });
  }
  
  const pageTitle = getPageTitle(targetHref);
  console.log('🎬 Wipe Out Animation Start - Target:', pageTitle);
  
  if (prefersReducedMotion()) {
    console.log('♿ Reduced motion preferred, skipping animation');
    navigateTo(targetHref);
    return;
  }
  
  wipe.root.classList.add('is-active');
  wipe.title.textContent = pageTitle;
  
  // CRITICAL: Show backdrop IMMEDIATELY to cover content
  gsap.set(wipe.backdrop, { opacity: 1 });
  console.log('🛡️ Backdrop activated - content now covered');
  
  // Note: We add 'wipe-transitioning' AFTER backdrop is visible
  document.documentElement.classList.add('wipe-transitioning');
  
  // Hide cursor during transition
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    cursor.style.opacity = '0';
    cursor.style.visibility = 'hidden';
  }
  
  // Reset posisi awal semua elemen
  gsap.set(wipe.overlay, { 
    y: '100%'
  });
  gsap.set(wipe.title, { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  });
  gsap.set([wipe.decorationTop, wipe.decorationBottom], {
    opacity: 0,
    scaleX: 0
  });
  
  const tl = gsap.timeline({});
  
  // Fase 1: Overlay wipe dari bawah ke atas dengan ease yang lebih smooth
  tl.to(wipe.overlay, {
    y: '0%',
    duration: 1.2,
    ease: 'power4.inOut', // Lebih smooth dari power3
    onStart: () => console.log('▶️ Phase 1: Overlay sliding up (backdrop already covering)...'),
    onComplete: () => {
      console.log('✅ Phase 1 complete - screen fully covered');
    }
  });
  
  // Fase 2a: Decoration top muncul
  tl.to(wipe.decorationTop, {
    opacity: 1,
    scaleX: 1,
    duration: 0.6,
    ease: 'power2.out',
    onStart: () => console.log('▶️ Phase 2a: Top decoration appearing...')
  }, '-=0.4'); // Mulai sebelum overlay selesai
  
  // Fase 2b: Judul muncul dengan bounce effect
  tl.to(wipe.title, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.0,
    ease: 'back.out(1.4)', // Bounce effect lebih kuat untuk interaktif
    onStart: () => console.log('▶️ Phase 2b: Title appearing...'),
    onComplete: () => console.log('✅ Phase 2b complete')
  }, '-=0.4'); // Overlap dengan decoration
  
  // Fase 2c: Decoration bottom muncul
  tl.to(wipe.decorationBottom, {
    opacity: 1,
    scaleX: 1,
    duration: 0.6,
    ease: 'power2.out',
    onStart: () => console.log('▶️ Phase 2c: Bottom decoration appearing...')
  }, '-=0.8'); // Overlap dengan title
  
  // Fase 3: Hold title sebentar (biarkan user lihat)
  tl.to({}, { 
    duration: 0.8, // Hold for 0.8 seconds
    onStart: () => console.log('⏸️ Phase 3: Holding title display...')
  });
  
  // Fase 4: Fade out title dan decorations
  tl.to(wipe.title, {
    opacity: 0,
    y: -20,
    scale: 0.95,
    duration: 0.5,
    ease: 'power2.in',
    onStart: () => console.log('▶️ Phase 4a: Title fading out...')
  });
  
  tl.to([wipe.decorationTop, wipe.decorationBottom], {
    opacity: 0,
    scaleX: 0,
    duration: 0.4,
    ease: 'power2.in'
  }, '-=0.4'); // Overlap dengan title fade
  
  // Fase 5: Wipe overlay COMPLETE ke atas untuk fully cover
  tl.to(wipe.overlay, {
    y: '-100%',
    duration: 0.8,
    ease: 'power3.inOut',
    onStart: () => {
      console.log('▶️ Phase 5: Overlay wiping up completely...');
      console.log('⏱️ Total duration until navigation:', tl.duration());
      
      // CRITICAL: Add wipe-transitioning class to hide content IMMEDIATELY
      // This prevents any flicker of old content
      document.documentElement.classList.add('wipe-transitioning');
      console.log('🔒 Content hidden - safe to animate overlay');
    },
    onUpdate: function() {
      // Navigate saat overlay HAMPIR SELESAI (95% = overlay at -95%)
      // Ini memastikan layar benar-benar tertutup sebelum navigate
      if (this.progress() > 0.95 && !this.vars.navigated) {
        this.vars.navigated = true;
        console.log('✅ Overlay 95% wiped (fully covering) - NOW navigating');
        console.log('🚀 Navigating to:', targetHref);
        
        // Set overlay position untuk ensure coverage
        gsap.set(wipe.overlay, { y: '-100%', force3D: true });
        
        // Navigate sekarang - layar benar-benar tertutup!
        void navigateTo(targetHref);
      }
    },
    onComplete: () => {
      console.log('✅ Wipe out animation fully complete');
    }
  }, '-=0.15'); // Overlap sedikit dengan fade untuk smooth
}

// Animasi wipe in (halaman baru muncul dengan overlay turun)
function wipeIn(wipe: WipeOverlay) {
  console.log('🎬 Wipe In Animation Start');
  
  if (prefersReducedMotion()) {
    console.log('♿ Reduced motion preferred, skipping animation');
    wipe.root.classList.remove('is-active');
    transitioning = false;
    document.documentElement.classList.remove('wipe-transitioning');
    
    // Hide backdrop
    gsap.set(wipe.backdrop, { opacity: 0 });
    
    // Ensure content is visible
    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.style.opacity = '1';
      appContent.style.visibility = 'visible';
    }
    
    // Restore cursor
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
      cursor.style.opacity = '';
      cursor.style.visibility = '';
    }
    return;
  }
  
  // CRITICAL: Backdrop stays visible during entire wipe in
  gsap.set(wipe.backdrop, { opacity: 1 });
  console.log('🛡️ Backdrop still covering - prevents any flicker');
  
  // CRITICAL: Start with overlay at 0% (full screen) for smooth entry
  gsap.set(wipe.overlay, { y: '0%', scale: 1, opacity: 1, force3D: true, immediateRender: true });
  
  // Show title immediately untuk continuity dari wipe out
  gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 });
  gsap.set([wipe.decorationTop, wipe.decorationBottom], { opacity: 1, scaleX: 1 });
  
  // Small delay to ensure overlay is rendered
  setTimeout(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Wipe in complete - resetting state');
        wipe.root.classList.remove('is-active');
        transitioning = false;
        console.log('🔓 Transitioning flag reset to:', transitioning);
      }
    });
    
    // Fase 1: Hold title sebentar untuk continuity (0.6s)
    tl.to({}, { 
      duration: 0.6,
      onStart: () => console.log('⏸️ Phase 1: Holding title for smooth transition...')
    });
    
    // Fase 2: Title dan decorations dramatic exit (0.7s)
    tl.to(wipe.title, {
      opacity: 0,
      scale: 1.5,
      y: -50,
      duration: 0.7,
      ease: 'power2.inOut',
      onStart: () => console.log('▶️ Phase 2: Title dramatic exit...')
    });
    
    // Decorations expand dan fade bersamaan
    tl.to(wipe.decorationTop, {
      opacity: 0,
      scaleX: 2,
      y: -30,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');
    
    tl.to(wipe.decorationBottom, {
      opacity: 0,
      scaleX: 2,
      y: 30,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');
    
    // Fase 3: Small pause before reveal
    tl.to({}, { 
      duration: 0.1,
      onStart: () => {
        console.log('▶️ Phase 3: Preparing dramatic reveal...');
        // Remove transitioning class early to show content behind overlay
        document.documentElement.classList.remove('wipe-transitioning');
        
        // Force restore body background to cream
        document.documentElement.style.backgroundColor = '#f4f3ed';
        document.body.style.backgroundColor = '#f4f3ed';
        
        // Also remove any lingering dark classes
        document.documentElement.classList.remove('is-reload');
        
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.style.visibility = 'visible';
          // Set initial state for content animation
          gsap.set(appContent, { 
            opacity: 0,
            scale: 0.95,
            force3D: true
          });
        }
      }
    });
    
    // Fase 4: Overlay scale + fade untuk dramatic reveal (1.2s)
    tl.to(wipe.overlay, {
      scale: 1.5,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.inOut',
      onStart: () => {
        console.log('▶️ Phase 4: Overlay dramatic reveal...');
        // Start content animation
        const appContent = document.getElementById('app-content');
        if (appContent) {
          gsap.to(appContent, {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            force3D: true,
            onStart: () => {
              console.log('✅ App content animating in');
            }
          });
        }
      },
      onComplete: () => {
        console.log('✅ Overlay animation complete');
        
        // CRITICAL: Fade out backdrop AFTER overlay is gone
        gsap.to(wipe.backdrop, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            console.log('🛡️ Backdrop hidden - content fully revealed');
          }
        });
        
        // Final check and cleanup
        document.documentElement.classList.remove('wipe-transitioning');
        document.documentElement.classList.remove('is-reload');
        
        // Clear inline background styles to let CSS take over
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
        
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.style.opacity = '1';
          appContent.style.visibility = 'visible';
          // Clear inline transforms
          gsap.set(appContent, { clearProps: 'all' });
        }
        
        // Now it's safe to restore cursor visibility
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
          cursor.style.opacity = '';
          cursor.style.visibility = '';
        }
        
        // Remove all force styles after overlay fully off-screen
        const forceStyle = document.getElementById('wipe-transition-force');
        if (forceStyle) forceStyle.remove();
        const cursorHideStyle = document.getElementById('wipe-cursor-hide');
        if (cursorHideStyle) cursorHideStyle.remove();
        
        console.log('✅ Background cleanup complete, should be cream now');
      }
    }, '-=0.2'); // Mulai sedikit sebelum title fade selesai untuk transisi yang lebih smooth
  }, 100); // Small delay to ensure render
}

function isInternalNav(a: HTMLAnchorElement): boolean {
  if (a.target && a.target === '_blank') return false;
  if (a.hasAttribute('download')) return false;
  if (a.getAttribute('rel')?.includes('external')) return false;
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#')) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch { 
    return false; 
  }
}

function setupLinkInterception(wipe: WipeOverlay) {
  console.log('🔗 Setting up link interception...');
  
  // Remove existing listener if any to prevent duplicates
  const existingListener = (window as any).__wipeTransitionClickListener;
  if (existingListener) {
    console.log('🧹 Removing existing click listener');
    document.removeEventListener('click', existingListener, true);
  }
  
  const clickListener = (e: MouseEvent) => {
    // Respect modifier keys/middle clicks
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    
    const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
    if (!a) return;
    
    console.log('🖱️ Link clicked:', a.href, 'Transitioning:', transitioning);
    
    if (a.hasAttribute('data-no-transition')) {
      console.log('⏭️ Link has data-no-transition, skipping');
      return;
    }
    
    if (!isInternalNav(a)) {
      console.log('🌐 External link, skipping');
      return;
    }

    const href = a.href;
    if (!href || href === window.location.href) {
      console.log('⚠️ Same page or no href, skipping');
      return;
    }
    
    // Check if already transitioning
    if (transitioning) {
      console.warn('⚠️ Navigation blocked: already transitioning');
      return;
    }
    
    console.log('✨ Starting wipe transition to:', href);
    e.preventDefault();
    
    // Set flag untuk page berikutnya
    sessionStorage.setItem('wipe-navigating', 'true');
    
    wipeOut(wipe, href);
  };
  
  // Store listener reference for later removal
  (window as any).__wipeTransitionClickListener = clickListener;
  
  document.addEventListener('click', clickListener, true); // Use capture phase
  console.log('✅ Click listener attached');
}

function boot() {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;
  
  console.log('🚀 Booting Wipe Transition...');
  
  const wipe = buildWipeOverlay();
  if (!wipe) {
    console.error('❌ Wipe overlay not found!');
    return;
  }
  
  console.log('✅ Wipe overlay found:', wipe);
  
  // Cek apakah ini page load setelah navigation
  const isNavigating = sessionStorage.getItem('wipe-navigating');
  
  // Detect if this is a refresh/reload vs navigation
  // performance.navigation is deprecated but still works as fallback
  const perfEntries = performance.getEntriesByType('navigation');
  const isReload = perfEntries.length > 0 && 
    (perfEntries[0] as PerformanceNavigationTiming).type === 'reload';
  
  // Detect browser back/forward navigation
  const isBackForward = perfEntries.length > 0 && 
    (perfEntries[0] as PerformanceNavigationTiming).type === 'back_forward';
  
  console.log('Navigation type:', {
    isNavigating,
    isReload,
    isBackForward,
    perfEntries: perfEntries[0]
  });
  
  // Clear flag if it's a reload
  if (isReload && isNavigating === 'true') {
    console.log('🔄 Detected page reload, clearing navigation flag');
    sessionStorage.removeItem('wipe-navigating');
  }
  
  // If browser back/forward, treat as navigation
  if (isBackForward) {
    console.log('◀️ Detected browser back/forward navigation');
    sessionStorage.setItem('wipe-navigating', 'true');
  }
  
  const shouldAnimate = (isNavigating === 'true' || isBackForward) && !isReload;
  
  if (shouldAnimate) {
    console.log('🎬 Running wipe-in animation...');
    
    // Add transitioning class IMMEDIATELY to hide content
    document.documentElement.classList.add('wipe-transitioning');
    
    // Hide cursor during page load
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
      cursor.style.opacity = '0';
      cursor.style.visibility = 'hidden';
    }
    
    sessionStorage.removeItem('wipe-navigating');
    
    // Set initial state - overlay at 0% (full screen) with title visible
    gsap.set(wipe.overlay, { y: '0%', scale: 1, opacity: 1, force3D: true });
    gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 }); // Title visible immediately!
    gsap.set([wipe.decorationTop, wipe.decorationBottom], { opacity: 1, scaleX: 1 });
    wipe.root.classList.add('is-active');
    
    // Force cream background immediately
    document.documentElement.style.backgroundColor = '#f4f3ed';
    document.body.style.backgroundColor = '#f4f3ed';
    document.documentElement.classList.remove('is-reload');
    
    // Delay lebih lama untuk memastikan:
    // 1. DOM fully loaded
    // 2. CSS applied
    // 3. Images loaded (jika ada)
    // 4. Scripts initialized
    const startWipeIn = () => {
      // Double check initial state - overlay at full screen with title
      gsap.set(wipe.overlay, { y: '0%', scale: 1, opacity: 1, force3D: true });
      gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 });
      
      // Ensure cream background
      document.documentElement.style.backgroundColor = '#f4f3ed';
      document.body.style.backgroundColor = '#f4f3ed';
      
      wipeIn(wipe);
    };
    
    // Wait for everything to be ready
    if (document.readyState === 'complete') {
      console.log('📄 Document already complete, starting wipe in with delay');
      setTimeout(startWipeIn, 300); // Small delay to ensure render
    } else {
      console.log('⏳ Waiting for document load...');
      window.addEventListener('load', () => {
        console.log('✅ Document loaded, starting wipe in');
        setTimeout(startWipeIn, 200);
      }, { once: true });
    }
  } else {
    console.log('📍 First load or refresh - no animation, show content immediately');
    
    // Remove any loading classes and show content immediately
    document.documentElement.classList.remove('wipe-initial-load');
    document.documentElement.classList.remove('wipe-transitioning');
    
    // Remove any force styles that might have been left over
    const forceStyle = document.getElementById('wipe-transition-force');
    if (forceStyle) {
      forceStyle.remove();
      console.log('🧹 Removed leftover force style');
    }
    
    // Ensure content is visible
    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.style.opacity = '1';
      appContent.style.visibility = 'visible';
    }
    
    // Ensure cursor is visible
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
      cursor.style.opacity = '';
      cursor.style.visibility = '';
    }
  }
  
  setupLinkInterception(wipe);
  console.log('✅ Link interception setup complete');
  
  // Safety fallback: ensure content is visible after a timeout
  // This catches any edge cases where animation might fail
  setTimeout(() => {
    if (document.documentElement.classList.contains('wipe-transitioning')) {
      console.warn('⚠️ Wipe transition stuck, forcing content visibility');
      document.documentElement.classList.remove('wipe-transitioning');
      
      const appContent = document.getElementById('app-content');
      if (appContent) {
        appContent.style.opacity = '1';
        appContent.style.visibility = 'visible';
      }
      
      const cursor = document.getElementById('custom-cursor');
      if (cursor) {
        cursor.style.opacity = '';
        cursor.style.visibility = '';
      }
      
      if (wipe.root.classList.contains('is-active')) {
        wipe.root.classList.remove('is-active');
      }
    }
    
    // Always reset transitioning flag after timeout as safety measure
    if (transitioning) {
      console.warn('⚠️ Transitioning flag still true after 5s, forcing reset');
      transitioning = false;
    }
  }, 5000); // 5 second safety timeout
}

if (typeof document !== 'undefined') {
  // Boot setelah DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  
  // Handle Astro View Transitions
  // These events fire when using browser back/forward with Astro
  document.addEventListener('astro:before-preparation', () => {
    console.log('🔄 Astro: before-preparation');
    // Set flag bahwa kita sedang navigating
    sessionStorage.setItem('wipe-navigating', 'true');
  });
  
  document.addEventListener('astro:after-swap', () => {
    console.log('🔄 Astro: after-swap - re-booting wipe transition');
    // Re-run boot after Astro swaps the page content
    setTimeout(() => {
      boot();
    }, 100);
  });
  
  document.addEventListener('astro:page-load', () => {
    console.log('✅ Astro: page-load complete');
    
    // Reset transitioning flag untuk allow next navigation
    transitioning = false;
    console.log('🔓 Transitioning flag reset after page-load');
    
    // Ensure content is visible after Astro finishes loading
    setTimeout(() => {
      const appContent = document.getElementById('app-content');
      if (appContent && appContent.style.visibility === 'hidden') {
        console.log('🔧 Forcing content visibility after Astro page-load');
        appContent.style.opacity = '1';
        appContent.style.visibility = 'visible';
        document.documentElement.classList.remove('wipe-transitioning');
      }
    }, 100);
  });
}

export {};
