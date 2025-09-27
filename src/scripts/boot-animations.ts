import { initAnimations } from "@/lib/animations/index.ts";

function boot() {
  initAnimations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

