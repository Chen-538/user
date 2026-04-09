const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

const pageLoader = document.querySelector(".page-loader");
const interactionCanvas = document.querySelector(".interaction-canvas");
const cursorGlow = document.querySelector(".cursor-glow");
const cursorRing = document.querySelector(".cursor-ring");
const scrollProgress = document.querySelector(".scroll-progress");
const cards = document.querySelectorAll(".card-surface");
const magneticTargets = document.querySelectorAll("[data-magnetic]");
const parallaxStages = document.querySelectorAll("[data-parallax-stage]");
const splitTargets = document.querySelectorAll("[data-split]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const detailButtons = document.querySelectorAll("[data-project-detail]");
const clickableTargets = document.querySelectorAll(".btn, .header-cta, .project-detail-btn, .project-modal-close");
const countTargets = document.querySelectorAll("[data-countup]");

const modal = document.querySelector(".project-modal");
const modalMedia = document.querySelector("[data-modal-media]");
const modalTag = document.querySelector("[data-modal-tag]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalSummary = document.querySelector("[data-modal-summary]");
const modalPoints = document.querySelector("[data-modal-points]");
const modalLink = document.querySelector("[data-modal-link]");
const modalCloseTargets = document.querySelectorAll("[data-modal-close]");

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;

function setupPageLoader() {
  let hasRevealed = false;

  const revealPage = () => {
    if (hasRevealed) {
      return;
    }

    hasRevealed = true;

    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");

      if (pageLoader) {
        pageLoader.addEventListener(
          "transitionend",
          () => {
            pageLoader.setAttribute("hidden", "");
          },
          { once: true }
        );

        window.setTimeout(() => {
          pageLoader.setAttribute("hidden", "");
        }, 900);
      }
    }, reduceMotion ? 80 : 760);
  };

  if (document.readyState === "interactive" || document.readyState === "complete") {
    revealPage();
    return;
  }

  document.addEventListener("DOMContentLoaded", revealPage, { once: true });
  window.addEventListener("load", revealPage, { once: true });
  window.setTimeout(revealPage, reduceMotion ? 120 : 1400);
}

function setupInteractionCanvas() {
  if (!interactionCanvas || reduceMotion || isCoarsePointer) {
    return;
  }

  const context = interactionCanvas.getContext("2d");
  if (!context) {
    return;
  }

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  const particles = Array.from({ length: 26 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: Math.random() * 1.8 + 0.8,
    alpha: Math.random() * 0.35 + 0.08,
    driftX: (Math.random() - 0.5) * 0.00018,
    driftY: (Math.random() - 0.5) * 0.00018,
  }));
  const trail = [];

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    interactionCanvas.width = width * ratio;
    interactionCanvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawFrame() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.driftX;
      particle.y += particle.driftY;

      if (particle.x < -0.08) particle.x = 1.08;
      if (particle.x > 1.08) particle.x = -0.08;
      if (particle.y < -0.08) particle.y = 1.08;
      if (particle.y > 1.08) particle.y = -0.08;

      const px = particle.x * width;
      const py = particle.y * height;

      context.beginPath();
      context.fillStyle = `rgba(120, 220, 255, ${particle.alpha})`;
      context.shadowColor = "rgba(90, 200, 250, 0.35)";
      context.shadowBlur = 12;
      context.arc(px, py, particle.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.shadowBlur = 0;

    for (let index = trail.length - 1; index >= 0; index -= 1) {
      const point = trail[index];
      point.life -= 0.024;
      point.radius *= 0.988;

      if (point.life <= 0) {
        trail.splice(index, 1);
        continue;
      }

      const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
      gradient.addColorStop(0, `rgba(128, 228, 255, ${point.life * 0.26})`);
      gradient.addColorStop(0.5, `rgba(90, 200, 250, ${point.life * 0.16})`);
      gradient.addColorStop(1, "rgba(90, 200, 250, 0)");

      context.beginPath();
      context.fillStyle = gradient;
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    }

    const pointerGradient = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 180);
    pointerGradient.addColorStop(0, "rgba(120, 226, 255, 0.12)");
    pointerGradient.addColorStop(0.45, "rgba(90, 200, 250, 0.06)");
    pointerGradient.addColorStop(1, "rgba(90, 200, 250, 0)");
    context.beginPath();
    context.fillStyle = pointerGradient;
    context.arc(pointerX, pointerY, 180, 0, Math.PI * 2);
    context.fill();

    animationFrame = window.requestAnimationFrame(drawFrame);
  }

  function addTrailPoint() {
    trail.push({
      x: pointerX,
      y: pointerY,
      radius: 90,
      life: 1,
    });

    if (trail.length > 14) {
      trail.shift();
    }
  }

  resizeCanvas();
  drawFrame();

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("pointermove", addTrailPoint, { passive: true });
  window.addEventListener("beforeunload", () => window.cancelAnimationFrame(animationFrame));
}

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

function setupSplitText() {
  splitTargets.forEach((target) => {
    const type = target.dataset.split;
    const original = target.textContent.trim();
    target.textContent = "";

    if (type === "chars") {
      [...original].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.animationDelay = `${index * 0.06}s`;
        target.append(span);
      });
    } else {
      const segments = original
        .split(/(?<=[，。])/u)
        .map((segment) => segment.trim())
        .filter(Boolean);

      segments.forEach((segment, index) => {
        const span = document.createElement("span");
        span.className = "split-line";
        span.textContent = segment;
        span.style.animationDelay = `${index * 0.12}s`;
        target.append(span);
      });
    }

    requestAnimationFrame(() => target.classList.add("split-ready"));
  });
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

function createRipple(event, target) {
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.append(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
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

function setupParallaxStage(stage) {
  const layers = stage.querySelectorAll("[data-parallax-layer]");
  if (!layers.length) {
    return;
  }

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    layers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth") || "0.15");
      const x = px * depth * 54;
      const y = py * depth * 48;

      if (reduceMotion || isCoarsePointer) {
        layer.style.transform = "";
        return;
      }

      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });

  stage.addEventListener("pointerleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "";
    });
  });
}

function setupRevealObserver() {
  const revealTargets = document.querySelectorAll(
    ".hero-copy, .hero-visual, .impact-card, .project-card, .service-highlight, .service-card, .about-gallery, .about-copy, .contact-card, .proof-card"
  );

  if (!("IntersectionObserver" in window)) {
    return;
  }

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

function setupScrollSpy() {
  if (!navLinks.length || !("IntersectionObserver" in window)) {
    return;
  }

  const sectionMap = Array.from(navLinks)
    .map((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const current = sectionMap.find((item) => item.section === entry.target);
        if (!current || !entry.isIntersecting) {
          return;
        }

        sectionMap.forEach((item) => item.link.classList.remove("is-current"));
        current.link.classList.add("is-current");
      });
    },
    {
      threshold: 0.35,
      rootMargin: "-20% 0px -45% 0px",
    }
  );

  sectionMap.forEach(({ section }) => observer.observe(section));
}

function updateScrollProgress() {
  if (!scrollProgress) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

function setupScrollProgress() {
  if (!scrollProgress) {
    return;
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
}

function animateCount(target) {
  const endValue = Number(target.dataset.countup || target.textContent.trim());
  if (Number.isNaN(endValue)) {
    return;
  }

  if (reduceMotion) {
    target.textContent = endValue.toLocaleString("en-US");
    target.dataset.counted = "true";
    return;
  }

  const duration = Number(target.dataset.duration || 1400);
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(endValue * eased);
    target.textContent = value.toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    target.dataset.counted = "true";
  }

  requestAnimationFrame(frame);
}

function setupCountUp() {
  if (!countTargets.length) {
    return;
  }

  countTargets.forEach((target) => {
    target.textContent = "0";
  });

  if (!("IntersectionObserver" in window)) {
    countTargets.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.counted === "true") {
          return;
        }

        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.55,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  countTargets.forEach((target) => observer.observe(target));
}

function openProjectModal(card) {
  if (!modal || !modalMedia || !modalTag || !modalTitle || !modalSummary || !modalPoints || !modalLink) {
    return;
  }

  const media = card.querySelector(".project-media");
  const tag = card.querySelector(".project-tag");
  const title = card.querySelector("h3");
  const summary = card.querySelector(".project-body p");
  const link = card.querySelector(".project-meta a");
  const points = card.querySelectorAll(".project-points li");

  modalMedia.innerHTML = "";
  if (media) {
    modalMedia.append(media.cloneNode(true));
  }

  modalTag.textContent = tag ? tag.textContent.trim() : "";
  modalTitle.textContent = title ? title.textContent.trim() : "";
  modalSummary.textContent = summary ? summary.textContent.trim() : "";
  modalPoints.innerHTML = "";

  points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point.textContent.trim();
    modalPoints.append(item);
  });

  if (link) {
    modalLink.href = link.href;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setupProjectModal() {
  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-project-card]");
      if (card) {
        openProjectModal(card);
      }
    });
  });

  modalCloseTargets.forEach((target) => {
    target.addEventListener("click", closeProjectModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
    }
  });
}

function setupRipples() {
  clickableTargets.forEach((target) => {
    target.addEventListener("pointerdown", (event) => {
      createRipple(event, target);
    });
  });
}

cards.forEach((card) => {
  if (card.hasAttribute("data-parallax-layer")) {
    return;
  }

  setupCardTilt(card);
});

magneticTargets.forEach(setupMagneticTarget);
parallaxStages.forEach(setupParallaxStage);
setupPageLoader();
setupInteractionCanvas();
setupSplitText();
setupRevealObserver();
setupScrollSpy();
setupScrollProgress();
setupCountUp();
setupProjectModal();
setupRipples();

if (!isCoarsePointer) {
  document.addEventListener("pointermove", (event) => {
    updateCursor(event.clientX, event.clientY);
  });

  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("has-pointer");
  });

  animateCursorRing();
}
