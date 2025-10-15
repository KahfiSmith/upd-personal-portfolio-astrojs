// Boot Footer Enhancements
import { initFooterEnhancements } from './footer-enhancements';

// Initialize footer enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFooterEnhancements();
});

// Also initialize on route changes for SPA behavior
window.addEventListener('astro:page-load', () => {
  initFooterEnhancements();
});