const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

const cursorGlow = document.querySelector(".cursor-glow");
const cursorRing = document.querySelector(".cursor-ring");
const cards = document.querySelectorAll(".card-surface");
const magneticTargets = document.querySelectorAll("[data-magnetic]");

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;

function animateCursorRing() {
  if (!cursorRing || isCoarsePointer) {
    return;
  }

  ringX += (pointerX - ringX) * 0.18;
  ringY += (pointerY - ringY) * 0.18;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
  requestAnimationFrame(animateCursorRing);
}

function updateCursor(clientX, clientY) {
  pointerX = clientX;
  pointerY = clientY;

  document.body.classList.add("has-pointer");

  if (cursorGlow) {
    cursorGlow.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  }
}

if (!isCoarsePointer) {
  document.addEventListener("pointermove", (event) => {
    updateCursor(event.clientX, event.clientY);
  });

  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("has-pointer");
  });

  animateCursorRing();
}

function setupCardTilt(card) {
  const maxRotate = 7;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    card.style.setProperty("--spotlight-x", `${px * 100}%`);
    card.style.setProperty("--spotlight-y", `${py * 100}%`);
    card.classList.add("is-active");

    if (reduceMotion || isCoarsePointer) {
      return;
    }

    const rotateY = (px - 0.5) * maxRotate;
    const rotateX = (0.5 - py) * maxRotate;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.classList.remove("is-active");
    card.style.removeProperty("--spotlight-x");
    card.style.removeProperty("--spotlight-y");
    card.style.transform = "";
  });
}

function setupMagneticTarget(target) {
  const strength = target.classList.contains("header-cta") ? 0.22 : 0.18;

  target.addEventListener("pointermove", (event) => {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const moveX = (x - rect.width / 2) * strength;
    const moveY = (y - rect.height / 2) * strength;

    target.classList.add("is-hovered");
    target.style.setProperty("--magnet-x", `${(x / rect.width) * 100}%`);
    target.style.setProperty("--magnet-y", `${(y / rect.height) * 100}%`);

    if (!reduceMotion && !isCoarsePointer) {
      target.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }
  });

  target.addEventListener("pointerleave", () => {
    target.classList.remove("is-hovered");
    target.style.removeProperty("--magnet-x");
    target.style.removeProperty("--magnet-y");
    target.style.transform = "";
  });
}

cards.forEach(setupCardTilt);
magneticTargets.forEach(setupMagneticTarget);

const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-visual, .impact-card, .project-card, .service-highlight, .service-card, .about-gallery, .about-copy, .contact-card, .proof-card"
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    observer.observe(target);
  });
}
