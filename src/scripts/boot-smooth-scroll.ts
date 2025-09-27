import { initSmoothScroll } from "@/lib/interactions/init-smooth-scroll";

function boot() {
  initSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};

