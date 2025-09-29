import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type InitOptions = {
  revealSelector?: string;
  magneticSelector?: string;
};

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(opts: InitOptions = {}): void {
  const revealSel = opts.revealSelector ?? "[data-animate]";
  const magneticSel = opts.magneticSelector ?? "[data-magnetic]";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // On-scroll reveals (clean, futuristic feel)
  gsap.utils.toArray<HTMLElement>(revealSel).forEach((el) => {
    const type = el.getAttribute("data-animate") || "fade-up";
    const delay = parseFloat(el.getAttribute("data-delay") || "0");
    const base: gsap.TweenVars = {
      opacity: 0,
      filter: "blur(8px)",
      duration: prefersReduced ? 0 : 0.9,
      ease: "power3.out",
      delay,
      scrollTrigger: prefersReduced ? undefined : { trigger: el, start: "top 85%" },
      onStart: () => { el.style.willChange = "transform, opacity, filter"; },
      onComplete: () => { el.style.willChange = "auto"; },
    };
    if (type === "fade-up") {
      gsap.from(el, { y: 24, ...base });
    } else if (type === "fade-in") {
      gsap.from(el, { ...base });
    } else if (type === "scale-in") {
      gsap.from(el, { scale: 0.92, ...base });
    }
  });

  // Magnetic hover (gentle, 8–12px nudge)
  document.querySelectorAll<HTMLElement>(magneticSel).forEach((el) => {
    const bounds = () => el.getBoundingClientRect();
    const strength = 12; // px
    const relax = 0.18;

    let over = false;
    const enter = () => { over = true; el.style.willChange = "transform"; };
    const leave = () => {
      over = false;
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out", onComplete: () => { el.style.willChange = "auto"; } });
    };
    const move = (e: MouseEvent) => {
      if (!over) return;
      const r = bounds();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 60);
      gsap.to(el, { x: (dx / d) * strength * k, y: (dy / d) * strength * k, duration: relax, ease: "power3.out" });
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    window.addEventListener("mousemove", move, { passive: true });
  });

  // Index page: Hero fade-in if present
  const hero = document.getElementById("hero");
  if (hero && !prefersReduced) {
    gsap.fromTo(hero, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
  }

  // Index page: Get in Touch pill interactions if present
  const getInTouchBtn = document.querySelector<HTMLElement>("[data-get-in-touch]");
  const circleBackground = document.querySelector<HTMLElement>("[data-circle-bg]");
  const ripple = document.querySelector<HTMLElement>("[data-ripple]");
  if (getInTouchBtn && circleBackground && ripple) {
    gsap.set(circleBackground, { x: "-100%" });
    if (!prefersReduced) {
      gsap.to(getInTouchBtn, { y: -2, duration: 4, repeat: -1, yoyo: true, ease: "power2.inOut" });
    }
    getInTouchBtn.addEventListener("mouseenter", () => {
      gsap.to(circleBackground, { x: 0, duration: 0.4, ease: "power2.out" });
      gsap.to(getInTouchBtn, { y: -3, duration: 0.3, ease: "power2.out" });
      if (!prefersReduced) {
        gsap.fromTo(ripple, { scale: 1, opacity: 0.5 }, { scale: 1.1, opacity: 0, duration: 0.6, ease: "power2.out" });
      }
    });
    getInTouchBtn.addEventListener("mouseleave", () => {
      gsap.to(circleBackground, { x: "-100%", duration: 0.4, ease: "power2.out" });
      gsap.to(getInTouchBtn, { y: -2, duration: 0.3, ease: "power2.out" });
    });
    getInTouchBtn.addEventListener("click", () => {
      gsap.fromTo(getInTouchBtn, { scale: 1 }, { scale: 0.95, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 });
    });
  }

  // Index page: Scroll down by one screen when clicking indicator
  const scrollNext = document.querySelector<HTMLElement>("[data-scroll-next]");
  if (scrollNext) {
    scrollNext.addEventListener("click", () => {
      window.scrollTo({ top: window.innerHeight, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
}

export function teardownAnimations(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}
