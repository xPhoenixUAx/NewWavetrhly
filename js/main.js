const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

if (window.lucide) {
  window.lucide.createIcons({ strokeWidth: 1.8 });
}

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const menuClose = document.querySelector(".menu-close");
const serviceMenuToggle = document.querySelector(".service-menu-toggle");
const serviceMenuGroup = document.querySelector(".menu-service-group");
const menuLinks = document.querySelectorAll(".overlay-nav a, .menu-overlay .header-cta");
const activePath = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".overlay-nav a, .footer-col a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === activePath || (activePath === "" && href === "index.html")) {
    link.setAttribute("aria-current", "page");
  }
});

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuOverlay?.classList.remove("is-open");
  menuOverlay?.setAttribute("aria-hidden", "true");
  menuToggle?.setAttribute("aria-expanded", "false");
  serviceMenuToggle?.setAttribute("aria-expanded", "false");
  serviceMenuGroup?.classList.remove("is-open");
}

function openMenu() {
  document.body.classList.add("menu-open");
  menuOverlay?.classList.add("is-open");
  menuOverlay?.setAttribute("aria-hidden", "false");
  menuToggle?.setAttribute("aria-expanded", "true");
  setTimeout(() => menuLinks[0]?.focus(), 320);
}

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  expanded ? closeMenu() : openMenu();
});

menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
menuClose?.addEventListener("click", closeMenu);

serviceMenuToggle?.addEventListener("click", () => {
  const expanded = serviceMenuToggle.getAttribute("aria-expanded") === "true";
  serviceMenuToggle.setAttribute("aria-expanded", String(!expanded));
  serviceMenuGroup?.classList.toggle("is-open", !expanded);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const cursor = document.querySelector(".cursor-spot");
if (cursor && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    document.body.style.setProperty("--mx", `${event.clientX}px`);
    document.body.style.setProperty("--my", `${event.clientY}px`);
    cursor.style.opacity = "1";
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll("a, button, .magnetic").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
      el.style.transform = "";
    });
    el.addEventListener("mousemove", (event) => {
      if (!el.classList.contains("magnetic")) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

document.querySelectorAll(".contact-form").forEach((form) => {
  const note = form.querySelector(".form-note");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.querySelector("[name='email']")?.value || "";
    if (note) {
      note.textContent = `Thank you. Your inquiry is ready for NewWavetrhy s.r.o. Please email support@newwavetrhy.com if you would like to attach files from ${email}.`;
    }
    form.reset();
  });
});

document.querySelectorAll(".what-list").forEach((list) => {
  const items = Array.from(list.querySelectorAll(".what-item"));

  items.forEach((item) => {
    const button = item.querySelector("button");
    button?.addEventListener("click", () => {
      if (item.classList.contains("is-open")) return;

      items.forEach((entry) => {
        if (entry === item) return;
        entry.classList.remove("is-open");
        entry.querySelector("button")?.setAttribute("aria-expanded", "false");
      });

      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    });
  });
});

document.querySelectorAll("[data-testimonial-slider]").forEach((slider) => {
  const track = slider.querySelector(".testimonial-track");
  const originals = Array.from(slider.querySelectorAll(".testimonial-card"));
  if (!track || originals.length < 2) return;

  const beforeClones = document.createDocumentFragment();
  originals.forEach((card) => {
    const beforeClone = card.cloneNode(true);
    const afterClone = card.cloneNode(true);
    beforeClone.setAttribute("aria-hidden", "true");
    afterClone.setAttribute("aria-hidden", "true");
    beforeClones.appendChild(beforeClone);
    track.appendChild(afterClone);
  });
  track.insertBefore(beforeClones, originals[0]);

  const cards = Array.from(track.querySelectorAll(".testimonial-card"));
  const loopStart = originals.length;
  const loopEnd = originals.length * 2;
  let index = loopStart;
  let startX = 0;
  let dragX = 0;
  let isDragging = false;
  let autoplayId;

  const getStep = () => {
    const first = cards[0];
    const second = cards[1];
    if (!first || !second) return first?.getBoundingClientRect().width || 0;
    return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  };

  const setTransition = (enabled) => {
    track.style.transition = enabled ? "" : "none";
  };

  const render = (offset = 0) => {
    track.style.transform = `translate3d(${index * -getStep() + offset}px, 0, 0)`;
  };

  const goTo = (nextIndex) => {
    setTransition(true);
    index = nextIndex;
    render();
  };

  const jumpTo = (nextIndex) => {
    setTransition(false);
    index = nextIndex;
    render();
    track.offsetHeight;
    setTransition(true);
  };

  const normalizeIndex = () => {
    if (index >= loopEnd) {
      jumpTo(loopStart + (index - loopEnd));
    } else if (index < loopStart) {
      jumpTo(loopEnd - (loopStart - index));
    }
  };

  const startAutoplay = () => {
    if (prefersReduced) return;
    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => goTo(index + 1), 3600);
  };

  const stopAutoplay = () => window.clearInterval(autoplayId);

  slider.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    dragX = 0;
    slider.classList.add("is-dragging");
    slider.setPointerCapture?.(event.pointerId);
    stopAutoplay();
  });

  slider.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    dragX = event.clientX - startX;
    render(dragX);
  });

  function finishDrag() {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove("is-dragging");
    const threshold = Math.min(120, getStep() * 0.22);
    if (dragX < -threshold) goTo(index + 1);
    else if (dragX > threshold) goTo(index - 1);
    else render();
    startAutoplay();
  }

  slider.addEventListener("pointerup", finishDrag);
  slider.addEventListener("pointercancel", finishDrag);
  track.addEventListener("transitionend", normalizeIndex);
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);
  window.addEventListener("resize", () => {
    const relativeIndex = ((index - loopStart) % originals.length + originals.length) % originals.length;
    jumpTo(loopStart + relativeIndex);
  });

  setTransition(false);
  render();
  track.offsetHeight;
  setTransition(true);
  startAutoplay();
});
