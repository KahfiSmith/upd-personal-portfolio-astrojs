import { initCustomCursor } from "@/lib/interactions/init-custom-cursor";

function boot() {
  initCustomCursor();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export {};

