const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelectorAll(".nav-menu a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("[data-contact-form]");
const feedback = document.querySelector("[data-form-feedback]");
const hero = document.querySelector(".hero");
const heroCanvas = document.querySelector("[data-hero-canvas]");
const tiltCard = document.querySelector("[data-tilt-card]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  menu.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeader);
updateHeader();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim();
  const message = String(formData.get("message")).trim();

  if (!name || !email || !message) {
    feedback.textContent = "Preencha todos os campos para enviar sua mensagem.";
    return;
  }

  feedback.textContent = "Mensagem pronta para envio. Configure seu e-mail ou backend para receber contatos.";
  contactForm.reset();
});

if (hero && heroCanvas && !prefersReducedMotion.matches) {
  const context = heroCanvas.getContext("2d");
  const pointer = { x: 0, y: 0, active: false };
  let particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resizeHeroCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = hero.getBoundingClientRect();
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    heroCanvas.width = Math.floor(width * ratio);
    heroCanvas.height = Math.floor(height * ratio);
    heroCanvas.style.width = `${width}px`;
    heroCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const particleCount = Math.min(88, Math.max(36, Math.floor(width / 18)));
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      size: Math.random() * 1.7 + 0.7
    }));
  }

  function drawHeroCanvas() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(190, 131, 97, 0.85)";
    context.strokeStyle = "rgba(153, 71, 36, 0.2)";
    context.lineWidth = 1;

    particles.forEach((particle, index) => {
      if (pointer.active) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 170) {
          const force = (170 - distance) / 170;
          particle.x -= dx * force * 0.012;
          particle.y -= dy * force * 0.012;
        }
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const distance = Math.hypot(particle.x - next.x, particle.y - next.y);

        if (distance < 116) {
          context.globalAlpha = (116 - distance) / 116;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    });

    animationFrame = requestAnimationFrame(drawHeroCanvas);
  }

  function updatePointer(event) {
    const bounds = hero.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    pointer.x = point.clientX - bounds.left;
    pointer.y = point.clientY - bounds.top;
    pointer.active = true;
  }

  hero.addEventListener("pointermove", updatePointer);
  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  hero.addEventListener("touchmove", updatePointer, { passive: true });
  window.addEventListener("resize", resizeHeroCanvas);

  resizeHeroCanvas();
  drawHeroCanvas();

  prefersReducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      cancelAnimationFrame(animationFrame);
      context.clearRect(0, 0, width, height);
    }
  });
}

if (tiltCard && !prefersReducedMotion.matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const bounds = tiltCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltCard.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  });

  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "";
  });
}
