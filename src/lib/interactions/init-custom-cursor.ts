// Odama.io style custom cursor - 100% replica
// Single white circle with mix-blend-mode difference
// Smooth trailing animation with subtle hover effects

export function initCustomCursor(): void {
  const root = document.getElementById("custom-cursor");
  if (!root) return;
  
  // Clean up previous initialization if exists
  if ((root as any)._cleanup) {
    (root as any)._cleanup();
  }
  
  if ((root as any)._cursorInitialized) return; // guard against double init
  (root as any)._cursorInitialized = true;

  const cursor = root.querySelector<HTMLDivElement>(".cursor-dot");
  if (!cursor) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cursor properties
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let prevX = 0;
  let prevY = 0;
  let isVisible = false;

  // Smooth trailing animation
  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

  let isHovering = false;
  let hoverScale = 1;
  let currentStretch = 0; // Smooth stretch transition

  // Animation loop
  const animate = () => {
    if (!isVisible) return;

    // Store previous position for velocity calculation
    prevX = cursorX;
    prevY = cursorY;

    // Smooth trailing with slight delay (exact Odama.io timing)
    const ease = prefersReduced ? 1 : 0.12;
    cursorX = lerp(cursorX, mouseX, ease);
    cursorY = lerp(cursorY, mouseY, ease);

    // Calculate velocity for elastic effect
    const velocityX = cursorX - prevX;
    const velocityY = cursorY - prevY;
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    // Elastic effect only kicks in with fast movement
    const velocityThreshold = 3; // Higher threshold - only fast movements
    const targetStretch = velocity > velocityThreshold ? Math.min((velocity - velocityThreshold) * 0.12, 0.35) : 0;

    // Smooth stretch transition to avoid jumpiness
    currentStretch = lerp(currentStretch, targetStretch, 0.2);

    // Calculate rotation based on movement direction (only when stretching significantly)
    const angle = currentStretch > 0.05 ? Math.atan2(velocityY, velocityX) : 0;

    // Apply elastic scaling - stretch in direction of movement
    let scaleX = (1 + currentStretch) * hoverScale;
    let scaleY = Math.max(0.75, 1 - currentStretch * 0.5) * hoverScale;

    // If hovering, reduce elastic effect and keep more circular
    if (isHovering) {
      scaleX = lerp(scaleX, hoverScale, 0.3);
      scaleY = lerp(scaleY, hoverScale, 0.3);
    }

    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) rotate(${angle}rad) scaleX(${scaleX}) scaleY(${scaleY})`;
    requestAnimationFrame(animate);
  };

  // Mouse move handler
  const onMouseMove = (e: MouseEvent) => {
    // Do not show custom cursor during wipe transition
    if (document.documentElement.classList.contains('wipe-transitioning')) {
      cursor.style.opacity = "0";
      return;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Check if hovering over text inputs - hide cursor
    const target = e.target as Element;
    const isTextInput = target?.closest('input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], textarea, [contenteditable="true"]');

    if (isTextInput) {
      cursor.style.opacity = "0";
      return;
    } else {
      // Only allow showing when not in wipe-transition
      if (!document.documentElement.classList.contains('wipe-transitioning')) {
        cursor.style.opacity = "1";
      }
    }

    if (!isVisible) {
      isVisible = true;
      cursorX = mouseX;
      cursorY = mouseY;
      prevX = mouseX;
      prevY = mouseY;
      cursor.style.opacity = "1";
      cursor.style.transition = "opacity 0.2s ease";
      animate();
    } else {
      // Clear transition for smooth elastic movement
      cursor.style.transition = "opacity 0.2s ease";
    }
  };

  // Hover effects for interactive elements
  const hoverSelector = [
    "a",
    "button",
    "input[type=button]",
    "input[type=submit]",
    "[role=button]",
    "[data-cursor]",
    ".cursor-hover",
  ].join(",");
  
  // Elements where cursor might need special handling due to dark background
  const darkElementSelector = [
    "[data-dark-bg]",
    ".dark-bg",
    ".bg-dark",
    ".bg-black",
  ].join(",");
  
  // Elements where cursor might need special handling due to light background
  const lightElementSelector = [
    "[data-light-bg]",
    ".light-bg",
    ".bg-light",
    ".bg-white",
  ].join(",");

  const onMouseEnter = () => {
    isHovering = true;
    hoverScale = 1.2;
    cursor.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  };

  const onMouseLeave = () => {
    isHovering = false;
    hoverScale = 1;
    cursor.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  };
  
  // Handle dark background elements
  const onDarkElementEnter = () => {
    cursor.classList.add("on-dark-element");
    cursor.classList.remove("on-light-element");
  };

  const onDarkElementLeave = () => {
    cursor.classList.remove("on-dark-element");
  };
  
  // Handle light background elements
  const onLightElementEnter = () => {
    cursor.classList.add("on-light-element");
    cursor.classList.remove("on-dark-element");
  };

  const onLightElementLeave = () => {
    cursor.classList.remove("on-light-element");
  };

  const attachHoverListeners = () => {
    // Interactive element hover effects
    document.querySelectorAll<HTMLElement>(hoverSelector).forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });
    
    // Dark background element special handling
    document.querySelectorAll<HTMLElement>(darkElementSelector).forEach((el) => {
      el.addEventListener("mouseenter", onDarkElementEnter);
      el.addEventListener("mouseleave", onDarkElementLeave);
    });
    
    // Light background element special handling
    document.querySelectorAll<HTMLElement>(lightElementSelector).forEach((el) => {
      el.addEventListener("mouseenter", onLightElementEnter);
      el.addEventListener("mouseleave", onLightElementLeave);
    });
  };

  // Initial setup
  attachHoverListeners();

  // Watch for DOM changes to attach listeners to new elements
  const observer = new MutationObserver(attachHoverListeners);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Event listeners
  const onMouseMoveHandler = (e: MouseEvent) => onMouseMove(e);
  const onMouseLeaveHandler = () => {
    cursor.style.opacity = "0";
    isVisible = false;
  };
  const onMouseEnterHandler = () => {
    cursor.style.opacity = "1";
    isVisible = true;
    animate();
  };

  window.addEventListener("mousemove", onMouseMoveHandler, { passive: true });
  window.addEventListener("mouseleave", onMouseLeaveHandler);
  window.addEventListener("mouseenter", onMouseEnterHandler);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener("mousemove", onMouseMoveHandler);
    window.removeEventListener("mouseleave", onMouseLeaveHandler);
    window.removeEventListener("mouseenter", onMouseEnterHandler);
    
    // Remove hover listeners
    document.querySelectorAll<HTMLElement>(hoverSelector).forEach((el) => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    });
    
    document.querySelectorAll<HTMLElement>(darkElementSelector).forEach((el) => {
      el.removeEventListener("mouseenter", onDarkElementEnter);
      el.removeEventListener("mouseleave", onDarkElementLeave);
    });
    
    document.querySelectorAll<HTMLElement>(lightElementSelector).forEach((el) => {
      el.removeEventListener("mouseenter", onLightElementEnter);
      el.removeEventListener("mouseleave", onLightElementLeave);
    });
    
    observer.disconnect();
    
    try { document.documentElement.classList.remove('cursor-hidden'); } catch {}
    try { (root as any)._cursorInitialized = false; } catch {}
  };

  // Store cleanup function for later use
  (root as any)._cleanup = cleanup;

  // Cleanup on unload (ensure system cursor returns promptly on nav)
  // Hide native cursor after script is ready
  try { document.documentElement.classList.add('cursor-hidden'); } catch {}

  const onPageHide = () => {
    cleanup();
  };

  window.addEventListener('pagehide', onPageHide);

  // Ensure cursor re-initializes after BFCache restore (back/forward)
  const onPageShow = (e: PageTransitionEvent) => {
    // Re-run init when page is restored from BFCache
    if ((e as any).persisted) {
      // Small delay to allow layout/painters to resume
      setTimeout(() => {
        try { initCustomCursor(); } catch {}
      }, 30);
    }
  };
  window.addEventListener('pageshow', onPageShow);

  // Listen for Astro View Transitions to reinitialize cursor
  const onAfterSwap = () => {
    // Reset initialization flag to allow reinit
    cleanup();
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      initCustomCursor();
    }, 50);
  };

  // Only add the event listener if it's not already added
  if (!(root as any)._hasAfterSwapListener) {
    (root as any)._hasAfterSwapListener = true;
    document.addEventListener('astro:after-swap', onAfterSwap);
  }
}

