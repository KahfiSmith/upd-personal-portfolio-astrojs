import { gsap } from "gsap";

type WipeOverlay = {
  root: HTMLElement;
  overlay: HTMLElement;
  backdrop: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  decorationTop?: HTMLElement;
  decorationBottom?: HTMLElement;
};

// Mapping path ke judul halaman
const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/blog": "Blog",
  "/works": "Works",
  "/contact": "Contact",
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/": "Recent highlights and featured projects.",
  "/about": "A glimpse into my background and values.",
  "/blog": "Thoughts, notes, and development insights.",
  "/works": "Selected projects and case studies.",
  "/contact": "Let’s collaborate — get in touch.",
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
  const subtitle = root.querySelector<HTMLElement>(".wipe-subtitle");
  
  if (!backdrop || !overlay || !title || !subtitle) return null;
  return { root, backdrop, overlay, title, subtitle };
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
  
  // DON'T hide content immediately - let overlay wipe over it naturally
  const appContent = document.getElementById('app-content');
  if (appContent) {
    // Keep content visible for smooth wipe
    appContent.style.willChange = 'transform, opacity';
    appContent.style.transform = 'translateZ(0)';
    console.log('✅ Content stays visible - overlay will wipe over it');
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
  // Assign page-specific subtitle (English)
  try {
    const url = new URL(targetHref, window.location.origin);
    const p = url.pathname;
    wipe.subtitle.textContent = PAGE_DESCRIPTIONS[p] || `Opening ${pageTitle}`;
    // Apply light theme for home route
    if (p === '/') wipe.root.classList.add('wipe-light');
    else wipe.root.classList.remove('wipe-light');
  } catch {
    wipe.subtitle.textContent = `Opening ${pageTitle}`;
    wipe.root.classList.remove('wipe-light');
  }
  
  // Show backdrop IMMEDIATELY with full opacity (solid cover)
  // This prevents any content flash during wipe-out
  gsap.set(wipe.backdrop, { opacity: 1 });
  console.log('🛡️ Backdrop solid cover activated - no content flash');
  
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
  gsap.set(wipe.subtitle, {
    opacity: 0,
    y: 20
  });
  // No horizontal decorations
  
  const tl = gsap.timeline({});
  
  // Fase 1: Overlay wipe dari bawah ke atas dengan ease yang santai dan smooth
  tl.to(wipe.overlay, {
    y: '0%',
    duration: 1.8, // Lebih santai dan tidak terburu-buru
    ease: 'power2.inOut', // Ease lebih gentle
    onStart: () => console.log('▶️ Phase 1: Overlay sliding up with solid backdrop...'),
    onUpdate: function() {
      // Disable pointer events when overlay is halfway up
      if (this.progress() > 0.5 && !this.vars.contentDisabled) {
        this.vars.contentDisabled = true;
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.style.pointerEvents = 'none';
        }
        console.log('🔒 Content interactions disabled');
      }
    },
    onComplete: () => {
      console.log('✅ Phase 1 complete - screen covered with overlay');
    }
  });
  
  // Fase 2: Judul muncul dengan bounce effect yang lebih gentle
  tl.to(wipe.title, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.2, // Lebih santai
    ease: 'back.out(1.2)', // Bounce lebih subtle
    onStart: () => console.log('▶️ Phase 2: Title appearing gently...'),
    onComplete: () => console.log('✅ Phase 2 complete')
  }, '-=0.4');
  
  // Fase 2b: Subtitle muncul ringan di bawah title
  tl.to(wipe.subtitle, {
    opacity: 1,
    y: 0,
    duration: 0.8, // Lebih santai
    ease: 'power2.out'
  }, '-=0.7');
  
  // No bottom decoration
  
  // Fase 3: Hold title lebih lama agar user bisa lihat dengan nyaman
  tl.to({}, { 
    duration: 1.0, // Hold lebih lama untuk santai
    onStart: () => console.log('⏸️ Phase 3: Holding title display...')
  });
  
  // Fase 4: Fade out title dan subtitle dengan gentle
  tl.to(wipe.title, {
    opacity: 0,
    y: -20,
    scale: 0.95,
    duration: 0.7, // Lebih santai
    ease: 'power2.in',
    onStart: () => console.log('▶️ Phase 4: Title fading out gently...')
  });
  // Subtitle fade out bersamaan
  tl.to(wipe.subtitle, {
    opacity: 0,
    y: -15,
    duration: 0.6, // Lebih santai
    ease: 'power2.in'
  }, '-=0.6');
  
  // No decoration fade
  
  // Fase 5: Wipe overlay keluar dengan santai
  tl.to(wipe.overlay, {
    y: '-100%',
    duration: 1.0, // Lebih santai dari 0.8s
    ease: 'power2.inOut', // Ease lebih gentle
    onStart: () => {
      console.log('▶️ Phase 5: Overlay wiping out gently...');
      console.log('⏱️ Total duration until navigation:', tl.duration());
      
      // Add transitioning class only now for smooth navigation
      document.documentElement.classList.add('wipe-transitioning');
      console.log('🔒 Preparing for navigation - overlay will cover everything');
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
    
    // Ensure backdrop is hidden
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
  
  // NO backdrop for wipe-in - clean reveal without backdrop
  gsap.set(wipe.backdrop, { opacity: 0 });
  console.log('✨ Wipe-in without backdrop - clean content reveal');
  
  // CRITICAL: Start with overlay at 0% (full screen) for smooth entry
  gsap.set(wipe.overlay, { y: '0%', scale: 1, opacity: 1, force3D: true, immediateRender: true });
  
  // Show title/subtitle immediately for continuity from wipe out
  gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 });
  gsap.set(wipe.subtitle, { opacity: 1, y: 0 });
  
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
    // Fase 1: Hold title sebentar untuk continuity (lebih santai)
    tl.to({}, { 
      duration: 0.8, // Lebih santai
      onStart: () => console.log('⏸️ Phase 1: Holding title for smooth transition...')
    });
    
    // Fase 2: Title dan subtitle gentle exit
    tl.to(wipe.title, {
      opacity: 0,
      scale: 1.3, // Tidak terlalu dramatis
      y: -40,
      duration: 0.9, // Lebih santai
      ease: 'power2.inOut',
      onStart: () => console.log('▶️ Phase 2: Title gentle exit...')
    });
    // Subtitle exit ringan
    tl.to(wipe.subtitle, {
      opacity: 0,
      y: -25,
      duration: 0.8, // Lebih santai
      ease: 'power2.inOut'
    }, '-=0.8');
    
    // No decorations to animate
    
    // Fase 3: Pause sebelum reveal
    tl.to({}, { 
      duration: 0.2, // Sedikit pause
      onStart: () => {
        console.log('▶️ Phase 3: Preparing content reveal...');
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
            scale: 0.98, // Lebih subtle
            force3D: true
          });
        }
      }
    });
    
    // Fase 4: Overlay scale + fade untuk gentle reveal
    tl.to(wipe.overlay, {
      scale: 1.3, // Tidak terlalu dramatis
      opacity: 0,
      duration: 1.5, // Lebih santai dan smooth
      ease: 'power2.inOut', // Ease lebih gentle
      onStart: () => {
        console.log('▶️ Phase 4: Overlay gentle reveal...');
        // Start content animation
        const appContent = document.getElementById('app-content');
        if (appContent) {
          gsap.to(appContent, {
            opacity: 1,
            scale: 1,
            duration: 1.5, // Lebih santai
            ease: 'power2.out',
            force3D: true,
            onStart: () => {
              console.log('✅ App content animating in gently');
            }
          });
        }
      },
      onComplete: () => {
        console.log('✅ Overlay animation complete');
        
        // No backdrop to fade out - we're not using it in wipe-in
        
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
  
  // Check if we're on the home/index page
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  
  console.log('Page detection:', {
    isHomePage,
    pathname: window.location.pathname
  });
  
  // For home page: skip wipe-in animation entirely (let SimpleCurtainLoader handle it)
  // For other pages: animate only if navigating from another page (not on reload)
  const shouldAnimate = (isNavigating === 'true' || isBackForward) && !isReload && !isHomePage;
  
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
    
    // Theme: light for home route, dark otherwise
    try {
      const pathname = window.location.pathname;
      if (pathname === '/') wipe.root.classList.add('wipe-light');
      else wipe.root.classList.remove('wipe-light');
    } catch {}

    // Set initial state - overlay at 0% (full screen) with title visible
    gsap.set(wipe.overlay, { y: '0%', scale: 1, opacity: 1, force3D: true });
    gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 }); // Title visible immediately!
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
    if (isHomePage) {
      console.log('🏠 Home page - no wipe animation, letting SimpleCurtainLoader handle reveal');
    } else {
      console.log('📍 First load or refresh - no animation, show content immediately');
    }
    
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
