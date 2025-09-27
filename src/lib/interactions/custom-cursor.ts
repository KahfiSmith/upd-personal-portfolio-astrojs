// Ensure custom cursor code is actually executed when this file is loaded.
// This file is referenced with `?url` and injected via a <script type="module" src=...>,
// so any top-level imports here will run in the browser.

import "@/scripts/custom-cursor-gsap.ts";

// Provide a default export for barrels expecting it.
// This is a no-op because initialization runs at import time above.
export default function initCustomCursor(): void {
  // intentionally empty
}
