// Ensure custom cursor code is actually executed when this file is loaded.
// This file is referenced with `?url` and injected via a <script type="module" src=...>,
// so any top-level imports here will run in the browser.

import "@/scripts/custom-cursor-gsap.ts";

// Keep as an ES module (no exports needed)
export {};
