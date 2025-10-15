// Enhanced Footer Interactive Effects
export function initFooterEnhancements() {
  const footer = document.querySelector('footer');
  if (!footer) return;

  // Magnetic Effect for Buttons and Social Icons
  const magneticElements = footer.querySelectorAll('.magnetic-button, .magnetic-social');
  
  magneticElements.forEach(element => {
    let magneticTimer: number;
    
    element.addEventListener('mouseenter', (e) => {
      const target = e.currentTarget as HTMLElement;
      target.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
    });
    
    element.addEventListener('mousemove', (e) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (mouseEvent.clientX - centerX) * 0.15;
      const deltaY = (mouseEvent.clientY - centerY) * 0.15;
      
      clearTimeout(magneticTimer);
      target.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    });
    
    element.addEventListener('mouseleave', (e) => {
      const target = e.currentTarget as HTMLElement;
      
      magneticTimer = window.setTimeout(() => {
        target.style.transform = 'translate(0px, 0px) scale(1)';
      }, 50);
    });
  });

  // Parallax Effect for Floating Orbs
  const floatingOrbs = footer.querySelectorAll('.floating-orb');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const footerRect = footer.getBoundingClientRect();
    const footerInView = footerRect.top < window.innerHeight && footerRect.bottom > 0;
    
    if (footerInView) {
      floatingOrbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        const yPos = scrolled * speed * 0.1;
        (orb as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    }
  });

  // Interactive Sparkles on Hover
  const sparkleContainers = footer.querySelectorAll('.sparkles');
  
  sparkleContainers.forEach(container => {
    const parent = container.parentElement;
    
    parent?.addEventListener('mouseenter', () => {
      createSparkles(container as HTMLElement);
    });
  });

  // Dynamic Gradient Background
  let gradientAnimation: number;
  
  const animateGradient = () => {
    const gradientOverlay = footer.querySelector('[class*="bg-gradient-to-br"]') as HTMLElement;
    if (!gradientOverlay) return;
    
    const time = Date.now() * 0.001;
    const opacity = 0.1 + Math.sin(time) * 0.05;
    gradientOverlay.style.opacity = opacity.toString();
    
    gradientAnimation = requestAnimationFrame(animateGradient);
  };
  
  // Start gradient animation when footer is in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateGradient();
      } else {
        cancelAnimationFrame(gradientAnimation);
      }
    });
  });
  
  observer.observe(footer);

  // Ripple Effect on Button Click
  const buttons = footer.querySelectorAll('.magnetic-button');
  
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      createRipple(e as MouseEvent, button as HTMLElement);
    });
  });
}

// Create Sparkles Function
function createSparkles(container: HTMLElement) {
  const sparkleCount = 5;
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-ping';
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    sparkle.style.left = `${x}%`;
    sparkle.style.top = `${y}%`;
    sparkle.style.animationDelay = `${Math.random() * 1000}ms`;
    
    container.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 1500);
  }
}

// Create Ripple Effect Function
function createRipple(event: MouseEvent, button: HTMLElement) {
  const ripple = document.createElement('div');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.className = 'absolute rounded-full bg-white/20 animate-ping pointer-events-none';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

// Initialize on DOM load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFooterEnhancements);
}