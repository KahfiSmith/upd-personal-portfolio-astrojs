// Odama.io style custom cursor - 100% replica
// Single white circle with mix-blend-mode difference
// Smooth trailing animation with subtle hover effects

export function initCustomCursor(): void {
  const root = document.getElementById("custom-cursor");
  if (!root) return;

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
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Check if hovering over text inputs - hide cursor
    const target = e.target as Element;
    const isTextInput = target?.closest('input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], textarea, [contenteditable="true"]');

    if (isTextInput) {
      cursor.style.opacity = "0";
      return;
    } else {
      cursor.style.opacity = "1";
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

  const attachHoverListeners = () => {
    document.querySelectorAll<HTMLElement>(hoverSelector).forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });
  };

  // Initial setup
  attachHoverListeners();

  // Watch for DOM changes to attach listeners to new elements
  const observer = new MutationObserver(attachHoverListeners);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Event listeners
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  // Hide cursor when leaving window
  window.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    isVisible = false;
  });

  // Show cursor when entering window
  window.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
    isVisible = true;
    animate();
  });
}

