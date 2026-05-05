const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteSettings = window.siteSettings || {};

document.documentElement.classList.add("js");

if (window.lucide) {
  window.lucide.createIcons({ strokeWidth: 1.8 });
}

function applySiteSettings() {
  if (!siteSettings || !Object.keys(siteSettings).length) return;

  const defaults = {
    companyName: "NewWavetrhy s.r.o.",
    companyShortName: "NewWavetrhy",
    companyLegalSuffix: "s.r.o.",
    email: "support@newwavetrhy.com",
    website: "newwavetrhy.com",
  };

  const companyName = siteSettings.companyName || defaults.companyName;
  const companyShortName = siteSettings.companyShortName || companyName;
  const companyLegalSuffix = siteSettings.companyLegalSuffix || "";
  const email = siteSettings.email || defaults.email;
  const website = siteSettings.website || defaults.website;
  const phone = siteSettings.phone || "";
  const phoneButtonLabel = siteSettings.phoneButtonLabel || phone;
  const footerDescription = siteSettings.footerDescription || "";
  const footerBottomLine = siteSettings.footerBottomLine || "";
  const copyrightYear = siteSettings.copyrightYear || new Date().getFullYear();
  const address = siteSettings.companyAddress || "";
  const companyId = siteSettings.companyId || "";
  const brandHtml = `${companyShortName}${companyLegalSuffix ? ` <small>${companyLegalSuffix}</small>` : ""}`;
  const footerCompanyParts = [companyName, address, companyId ? `ID: ${companyId}` : ""].filter(Boolean);
  const configValues = {
    companyName,
    companyShortName,
    companyLegalSuffix,
    companyAddress: address,
    companyId,
    email,
    website,
    phone,
    phoneButtonLabel,
    footerDescription,
    footerBottomLine,
    copyrightYear: String(copyrightYear),
  };

  document.querySelectorAll(".brand-text").forEach((element) => {
    element.innerHTML = brandHtml;
  });

  document.querySelectorAll(".header-contact").forEach((link) => {
    link.href = `mailto:${email}`;
    link.setAttribute("aria-label", `Email ${companyShortName}`);
    link.querySelector("strong") && (link.querySelector("strong").textContent = email);
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${email}`;
    if (link.textContent.trim().includes(defaults.email)) link.textContent = email;
  });

  document.querySelectorAll('a[href^="tel:"], [data-config-phone-link]').forEach((link) => {
    if (!phone) return;
    link.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  });

  document.querySelectorAll("[data-config-phone-label]").forEach((element) => {
    element.textContent = phoneButtonLabel;
  });

  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;
    const value = configValues[key];
    if (!value) return;

    element.textContent = value;

    if (element instanceof HTMLAnchorElement) {
      if (key === "email") element.href = `mailto:${email}`;
      if (key === "phone") element.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
      if (key === "website") {
        const url = website.startsWith("http") ? website : `https://${website}`;
        element.href = url;
      }
    }
  });

  document.querySelectorAll(".menu-footerline div:first-child strong").forEach((element) => {
    element.textContent = email;
  });

  document.querySelectorAll(".menu-footerline div:first-child span").forEach((element) => {
    element.textContent = companyName;
  });

  document.querySelectorAll(".footer-brand p").forEach((element) => {
    if (footerDescription) element.textContent = footerDescription;
  });

  document.querySelectorAll(".footer-col").forEach((column) => {
    const heading = column.querySelector("h3");
    if (heading?.textContent.trim().toLowerCase() !== "contact") return;

    const emailLink = column.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = `mailto:${email}`;
      emailLink.textContent = email;
    }

    const websiteLine = Array.from(column.querySelectorAll("span")).find((span) =>
      span.textContent.includes(defaults.website)
    );
    if (websiteLine) websiteLine.textContent = website;
  });

  document.querySelectorAll(".footer-bottom span:first-child").forEach((element) => {
    element.textContent = `Copyright ${copyrightYear} ${footerCompanyParts.join(" · ")}. All rights reserved.`;
  });

  document.querySelectorAll(".footer-bottom span:last-child").forEach((element) => {
    if (footerBottomLine) element.textContent = footerBottomLine;
  });

  const replacements = [
    [defaults.email, email],
    [defaults.website, website],
    [defaults.companyName, companyName],
  ].filter(([from, to]) => from && to && from !== to);

  if (replacements.length) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("script, style")) return NodeFilter.FILTER_REJECT;
        return replacements.some(([from]) => node.nodeValue.includes(from))
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      replacements.forEach(([from, to]) => {
        node.nodeValue = node.nodeValue.split(from).join(to);
      });
    });
  }
}

applySiteSettings();

function initCookieBanner() {
  const storageKey = "newwavetrhy_cookie_consent";
  const existingConsent = window.localStorage.getItem(storageKey);
  if (existingConsent) return;

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <div class="cookie-banner__copy">
      <span>Cookie preferences</span>
      <p>We use essential cookies to keep the website working. With your consent, we may also use analytics and marketing cookies to understand performance and improve campaigns.</p>
      <a href="cookie-policy.html">Read Cookie Policy</a>
    </div>
    <div class="cookie-banner__choices" hidden>
      <label><input type="checkbox" checked disabled> Essential</label>
      <label><input type="checkbox" data-cookie-category="analytics"> Analytics</label>
      <label><input type="checkbox" data-cookie-category="marketing"> Marketing</label>
    </div>
    <div class="cookie-banner__actions">
      <button class="cookie-btn cookie-btn--ghost" type="button" data-cookie-action="customize">Customize</button>
      <button class="cookie-btn cookie-btn--ghost" type="button" data-cookie-action="reject">Reject</button>
      <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-action="accept">Accept all</button>
      <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-action="save" hidden>Save choices</button>
    </div>
  `;

  const saveConsent = (consent) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...consent,
        essential: true,
        savedAt: new Date().toISOString(),
      })
    );
    banner.classList.add("is-leaving");
    window.setTimeout(() => banner.remove(), 260);
  };

  banner.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cookie-action]");
    if (!button) return;

    const choices = banner.querySelector(".cookie-banner__choices");
    const saveButton = banner.querySelector('[data-cookie-action="save"]');
    const action = button.dataset.cookieAction;

    if (action === "customize") {
      choices.hidden = false;
      saveButton.hidden = false;
      button.hidden = true;
      banner.classList.add("is-customizing");
      return;
    }

    if (action === "accept") {
      saveConsent({ analytics: true, marketing: true });
      return;
    }

    if (action === "reject") {
      saveConsent({ analytics: false, marketing: false });
      return;
    }

    if (action === "save") {
      const analytics = banner.querySelector('[data-cookie-category="analytics"]').checked;
      const marketing = banner.querySelector('[data-cookie-category="marketing"]').checked;
      saveConsent({ analytics, marketing });
    }
  });

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add("is-visible"));
}

initCookieBanner();

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

document.querySelectorAll(".contact-form").forEach((form) => {
  const note = form.querySelector(".form-note");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.querySelector("[name='email']")?.value || "";
    if (note) {
      const companyName = siteSettings.companyName || "NewWavetrhy s.r.o.";
      const contactEmail = siteSettings.email || "support@newwavetrhy.com";
      note.textContent = `Thank you. Your inquiry is ready for ${companyName}. Please email ${contactEmail} if you would like to attach files from ${email}.`;
    }
    form.reset();
  });
});

document.querySelectorAll(".contact-send-form").forEach((form) => {
  const note = form.querySelector(".php-form-note");
  const status = new URLSearchParams(window.location.search).get("form");
  if (!note || !status) return;

  const messages = {
    sent: "Thank you. Your message has been sent.",
    invalid: "Please check the required fields and try again.",
    error: "The message could not be sent. Please email us directly.",
  };

  note.textContent = messages[status] || "";
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

document.querySelectorAll("[data-service-groups]").forEach((group) => {
  const tabs = Array.from(group.querySelectorAll("[data-group]"));
  const images = Array.from(group.querySelectorAll("[data-group-image]"));

  const activate = (key) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.group === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    images.forEach((image) => {
      image.classList.toggle("is-active", image.dataset.groupImage === key);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("mouseenter", () => activate(tab.dataset.group));
    tab.addEventListener("focus", () => activate(tab.dataset.group));
    tab.addEventListener("click", () => activate(tab.dataset.group));
  });
});

document.querySelectorAll(".about-faq-item, .service-faq details").forEach((item) => {
  const summary = item.querySelector("summary");
  const content = item.querySelector("p");
  let animation;

  if (!summary || !content) return;

  const finishAnimation = (open) => {
    item.open = open;
    item.style.height = "";
    item.style.overflow = "";
    animation = null;
  };

  const animateItem = (open) => {
    if (animation) animation.cancel();

    if (open) {
      item.open = true;
      item.style.height = `${summary.offsetHeight}px`;
      item.style.overflow = "hidden";
      const targetHeight = item.scrollHeight;

      animation = item.animate(
        { height: [`${summary.offsetHeight}px`, `${targetHeight}px`] },
        { duration: 360, easing: "cubic-bezier(.22, 1, .36, 1)" }
      );
      animation.onfinish = () => finishAnimation(true);
      animation.oncancel = () => {
        animation = null;
      };
      return;
    }

    item.style.height = `${item.offsetHeight}px`;
    item.style.overflow = "hidden";

    animation = item.animate(
      { height: [`${item.offsetHeight}px`, `${summary.offsetHeight}px`] },
      { duration: 300, easing: "cubic-bezier(.22, 1, .36, 1)" }
    );
    animation.onfinish = () => finishAnimation(false);
    animation.oncancel = () => {
      animation = null;
    };
  };

  summary.addEventListener("click", (event) => {
    if (prefersReduced) return;
    event.preventDefault();
    animateItem(!item.open);
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
