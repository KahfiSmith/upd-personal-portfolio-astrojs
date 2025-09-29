import { gsap } from "gsap";

function bootPageReveal() {
  const overlay = document.getElementById("page-transition-overlay");
  const html = document.documentElement;
  if (!overlay) return;

  const firstVisit = (() => {
    try { return !localStorage.getItem("hasVisited"); } catch { return true; }
  })();

  if (firstVisit) {
    html.classList.add("needs-reveal");
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (prefersReduced) {
        (overlay as HTMLElement).style.display = "none";
      } else {
        gsap.set(overlay, { transformOrigin: "top" });
        gsap.fromTo(
          overlay,
          { scaleY: 1 },
          {
            scaleY: 0,
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => { (overlay as HTMLElement).style.display = "none"; },
          }
        );
      }
      body.style.overflow = prevOverflow;
      try { localStorage.setItem("hasVisited", "1"); } catch {}
      html.classList.remove("needs-reveal");
    };

    if (document.readyState === "loading") {
      window.addEventListener("load", run, { once: true });
    } else {
      setTimeout(run, 50);
    }
  } else {
    (overlay as HTMLElement).style.display = "none";
    html.classList.remove("needs-reveal");
  }
}

bootPageReveal();

export {};

