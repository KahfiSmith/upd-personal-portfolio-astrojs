// Ensure custom cursor code is actually executed when this file is loaded.
// This file is referenced with `?url` and injected via a <script type="module" src=...>,
// so any top-level imports here will run in the browser.

// Library-facing stub for compatibility with barrels.
// Intentionally no side-effects here; use scripts/custom-cursor.ts for init.
export default function initCustomCursor(): void {
  // intentionally empty
}
