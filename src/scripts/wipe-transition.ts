import { gsap } from "gsap";

type WipeOverlay = {
  root: HTMLElement;
  overlay: HTMLElement;
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
  
  const overlay = root.querySelector<HTMLElement>(".wipe-overlay");
  const title = root.querySelector<HTMLElement>(".wipe-title");
  const decorationTop = root.querySelector<HTMLElement>(".wipe-decoration.top");
  const decorationBottom = root.querySelector<HTMLElement>(".wipe-decoration.bottom");
  
  if (!overlay || !title || !decorationTop || !decorationBottom) return null;
  return { root, overlay, title, decorationTop, decorationBottom };
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
  
  const pageTitle = getPageTitle(targetHref);
  console.log('🎬 Wipe Out Animation Start - Target:', pageTitle);
  
  if (prefersReducedMotion()) {
    console.log('♿ Reduced motion preferred, skipping animation');
    navigateTo(targetHref);
    return;
  }
  
  wipe.root.classList.add('is-active');
  wipe.title.textContent = pageTitle;
  
  // Note: We add 'wipe-transitioning' AFTER overlay fully covers the page
  // to avoid any momentary transparency before the overlay is visible.
  
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
    onStart: () => console.log('▶️ Phase 1: Overlay sliding up...'),
    onComplete: () => {
      console.log('✅ Phase 1 complete');
      // Safe to hide the body now (overlay fully covers)
      document.documentElement.classList.add('wipe-transitioning');
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
  
  // Fase 3: Transition to next page immediately after title reveal
  tl.call(() => {
    console.log('🚀 Navigating to:', targetHref);
    gsap.set(wipe.overlay, { y: '0%', opacity: 1, force3D: true });
    void navigateTo(targetHref);
  });
}

// Animasi wipe in (halaman baru muncul dengan overlay turun)
function wipeIn(wipe: WipeOverlay) {
  console.log('🎬 Wipe In Animation Start');
  
  if (prefersReducedMotion()) {
    console.log('♿ Reduced motion preferred, skipping animation');
    wipe.root.classList.remove('is-active');
    transitioning = false;
    document.documentElement.classList.remove('wipe-transitioning');
    
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
  
  // CRITICAL: Force overlay to be at 0% before starting animation
  gsap.set(wipe.overlay, { y: '0%', force3D: true, immediateRender: true });
  
  // Ensure title and decorations are visible at start
  gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 });
  gsap.set([wipe.decorationTop, wipe.decorationBottom], { opacity: 1, scaleX: 1 });
  
  // Small delay to ensure overlay is rendered at full screen
  setTimeout(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Wipe in complete - resetting state');
        wipe.root.classList.remove('is-active');
        transitioning = false;
        console.log('🔓 Transitioning flag reset to:', transitioning);
      }
    });
    
    // Fase 1: Title dan decorations fade out dengan sedikit gerakan ke atas
    tl.to(wipe.title, {
      opacity: 0,
      y: -30,
      scale: 0.9,
      duration: 0.6,
      ease: 'power2.in',
      onStart: () => console.log('▶️ Phase 1: Title fading out...')
    });
    
    // Decorations fade out bersamaan dengan title
    tl.to([wipe.decorationTop, wipe.decorationBottom], {
      opacity: 0,
      scaleX: 0,
      duration: 0.5,
      ease: 'power2.in'
    }, '-=0.5'); // Overlap dengan title fade out
    
    // Fase 2: Animasi overlay wipe ke atas untuk membuka konten
    tl.to(wipe.overlay, {
      y: '-100%',
      duration: 1.2,
      ease: 'power4.inOut', // Sangat smooth
      onStart: () => {
        console.log('▶️ Phase 2: Overlay sliding up (revealing content from top)...');
      },
      onUpdate: function() {
        // Saat overlay sudah setengah jalan ke atas, mulai show content
        if (this.progress() > 0.3) {
          document.documentElement.classList.remove('wipe-transitioning');
          
          // Ensure app content is visible
          const appContent = document.getElementById('app-content');
          if (appContent && appContent.style.opacity !== '1') {
            appContent.style.opacity = '1';
            appContent.style.visibility = 'visible';
            console.log('✅ App content made visible');
          }
        }
      },
      onComplete: () => {
        console.log('✅ Overlay animation complete');
        
        // Final check: make sure content is visible
        document.documentElement.classList.remove('wipe-transitioning');
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.style.opacity = '1';
          appContent.style.visibility = 'visible';
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
    
    // Set posisi overlay untuk animasi masuk - overlay harus FULL SCREEN
    gsap.set(wipe.overlay, { y: '0%', force3D: true });
    gsap.set(wipe.title, { opacity: 1, y: 0, scale: 1 });
    gsap.set([wipe.decorationTop, wipe.decorationBottom], { opacity: 1, scaleX: 1 });
    wipe.root.classList.add('is-active');
    
    // Delay lebih lama untuk memastikan:
    // 1. DOM fully loaded
    // 2. CSS applied
    // 3. Images loaded (jika ada)
    // 4. Scripts initialized
    const startWipeIn = () => {
      // Double check overlay is at 0%
      gsap.set(wipe.overlay, { y: '0%', force3D: true });
      wipeIn(wipe);
    };
    
    // Wait for everything to be ready
    if (document.readyState === 'complete') {
      setTimeout(startWipeIn, 500); // Longer delay when already complete
    } else {
      window.addEventListener('load', () => {
        setTimeout(startWipeIn, 300);
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
