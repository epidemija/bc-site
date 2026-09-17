/**
 * All client-side behaviour on the site, in one small file.
 *
 * This is progressive enhancement, not rendering: every element it touches is
 * already present and visible in the HTML that the server sent. If this script
 * fails to load, the site still reads and navigates correctly — only the
 * conveniences (theme switch, slider arrows, counter) are missing.
 */

/* ------------------------------------------------------------------ theme */
const THEME_KEY = "bc-theme";
const root = document.documentElement;

// More than one switch can be on the page at once (header + footer). All of
// them must agree on the current state, so clicking one has to update every
// other one too — not just re-sync the button that was clicked.
const themeToggles = [...document.querySelectorAll("[data-theme-toggle]")];
const syncThemeToggle = (btn) => {
  const dark = root.classList.contains("dark");
  btn.setAttribute("aria-pressed", String(dark));
  btn.setAttribute(
    "aria-label",
    dark ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln"
  );
  btn.querySelector("[data-icon-sun]")?.toggleAttribute("hidden", !dark);
  btn.querySelector("[data-icon-moon]")?.toggleAttribute("hidden", dark);
};
const syncAllThemeToggles = () => themeToggles.forEach(syncThemeToggle);
syncAllThemeToggles();
for (const btn of themeToggles) {
  btn.addEventListener("click", () => {
    const dark = root.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* storage blocked — the choice still applies to this page view */
    }
    syncAllThemeToggles();
  });
}

/* ----------------------------------------------------------------- header */
const dropdown = document.querySelector("[data-dropdown]");
if (dropdown) {
  const button = dropdown.querySelector("[data-dropdown-button]");
  const panel = dropdown.querySelector("[data-dropdown-panel]");
  let closeTimer;

  const setOpen = (open) => {
    clearTimeout(closeTimer);
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  };

  dropdown.addEventListener("mouseenter", () => setOpen(true));
  // A short grace period lets the pointer travel from the button to the panel
  // without the menu closing underneath it.
  dropdown.addEventListener("mouseleave", () => {
    closeTimer = setTimeout(() => setOpen(false), 200);
  });
  dropdown.addEventListener("focusin", () => setOpen(true));
  dropdown.addEventListener("focusout", (e) => {
    if (!dropdown.contains(e.relatedTarget)) setOpen(false);
  });
  button.addEventListener("click", () => setOpen(panel.hidden));
}

/*
 * Mobile menu.
 *
 * The panel covers the viewport, so while it is open the page behind it must
 * not scroll and focus must stay inside it: the cross is focused on opening
 * and the burger gets focus back on closing, which is what a keyboard or
 * screen-reader user expects.
 */
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.getElementById("mobile-navigation");
const menuClose = mobileNav?.querySelector("[data-menu-close]");

const setMenu = (open) => {
  if (!menuButton || !mobileNav) return;
  mobileNav.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  menuButton.classList.toggle("is-open", open);
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) menuClose?.focus();
  else menuButton.focus({ preventScroll: true });
};

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => setMenu(mobileNav.hidden));
  menuClose?.addEventListener("click", () => setMenu(false));

  // Same-page links would otherwise leave the panel covering the target.
  for (const link of mobileNav.querySelectorAll("a[href]")) {
    link.addEventListener("click", () => {
      document.documentElement.style.overflow = "";
    });
  }

  // Keep focus inside the panel while it is the only thing on screen.
  mobileNav.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = [...mobileNav.querySelectorAll("a[href], button")].filter(
      (el) => el.offsetParent !== null
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Escape closes whatever is open — keyboard users cannot "mouse away".
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const panel = document.querySelector("[data-dropdown-panel]");
  if (panel && !panel.hidden) {
    panel.hidden = true;
    document.querySelector("[data-dropdown-button]")?.setAttribute("aria-expanded", "false");
  }
  if (mobileNav && !mobileNav.hidden) setMenu(false);
});

/* ------------------------------------------------------- header on scroll */
const header = document.querySelector("[data-header]");
if (header) {
  // The bar only turns solid-and-blurred once the page has actually moved, so
  // the hero photograph is unobstructed at the top. rAF keeps the handler off
  // the scroll thread.
  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    ticking = false;
  };
  update();
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
}

/* ----------------------------------------------------------------- slider */
const track = document.getElementById("leistungen-track");
if (track) {
  const progress = document.querySelector("[data-slider-progress]");
  const stepSize = () => {
    const card = track.querySelector("[data-card]");
    return card ? card.offsetWidth + 24 : 460;
  };

  // There are two sets of controls — beside the heading on desktop, under the
  // track on phones — and both drive the same scroller.
  for (const btn of document.querySelectorAll("[data-slider-prev]")) {
    btn.addEventListener("click", () => track.scrollBy({ left: -stepSize(), behavior: "smooth" }));
  }
  for (const btn of document.querySelectorAll("[data-slider-next]")) {
    btn.addEventListener("click", () => track.scrollBy({ left: stepSize(), behavior: "smooth" }));
  }

  track.addEventListener(
    "scroll",
    () => {
      if (!progress) return;
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      progress.style.width = `${Math.max(ratio * 100, 8)}%`;
    },
    { passive: true }
  );

  // A horizontally-scrollable track under the cursor makes browsers
  // redirect a plain vertical mouse-wheel scroll into the track instead of
  // the page — the visitor has to "empty out" that horizontal scroll first
  // before the page continues, which reads as the section being stuck. The
  // track already has dedicated prev/next controls for horizontal movement,
  // so a wheel gesture that is mostly vertical is never meant for it: hand
  // it back to the page. A gesture that is mostly horizontal (a trackpad
  // swipe, or Shift+wheel) is left alone and still scrolls the track.
  track.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY });
    },
    { passive: false }
  );
}

/* ------------------------------------------- scroll reveals and the counter */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      observer.unobserve(el);

      if (el.hasAttribute("data-count-to")) {
        const target = Number(el.dataset.countTo);
        if (reduceMotion) {
          el.textContent = String(target);
          continue;
        }
        const started = performance.now();
        const tick = (now) => {
          const p = Math.min((now - started) / 1500, 1);
          // easeOutCubic, matching the previous animation curve
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } else {
        el.classList.add("is-visible");
      }
    }
  },
  { rootMargin: "0px 0px -60px 0px" }
);

for (const el of document.querySelectorAll("[data-reveal], [data-count-to]")) {
  observer.observe(el);
}

/* ----------------------------------------------------------------- mosaic */
const cells = document.querySelectorAll("[data-mosaic-cell]");
if (cells.length && !reduceMotion) {
  const sources = JSON.parse(document.getElementById("mosaic-sources")?.textContent || "[]");
  if (sources.length) {
    setInterval(() => {
      for (let i = 0; i < 5; i++) {
        const cell = cells[Math.floor(Math.random() * cells.length)];
        const img = cell.querySelector("img");
        if (!img) continue;
        const next = sources[Math.floor(Math.random() * sources.length)];
        img.style.opacity = "0";
        setTimeout(() => {
          img.src = next.src;
          if (next.srcset) img.srcset = next.srcset;
          img.style.opacity = "1";
        }, 400);
      }
    }, 2000);
  }
}

/* -------------------------------------------------------------- accordion */
/*
 * FAQ accordions. One answer open at a time within a group; clicking the open
 * question closes it, leaving the group with nothing open.
 *
 * The open state lives in a `data-open` attribute rather than a class or a JS
 * variable, because the server already renders it on the first item — so the
 * correct panel is painted before this file is fetched, and there is no flash
 * of an all-open or all-closed list. This code only takes over from there.
 *
 * Panels are shown and hidden by CSS reacting to `data-open` (display, not
 * height), so a closed answer leaves the accessibility tree entirely.
 */
for (const group of document.querySelectorAll("[data-accordion]")) {
  group.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-accordion-toggle]");
    if (!toggle || !group.contains(toggle)) return;

    const item = toggle.closest("[data-accordion-item]");
    const wasOpen = item.hasAttribute("data-open");

    for (const other of group.querySelectorAll("[data-accordion-item]")) {
      other.removeAttribute("data-open");
      other.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", "false");
    }

    if (!wasOpen) {
      item.setAttribute("data-open", "");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
}

/*
 * Deep link support: /faq/#aufmass-q-2 should arrive with that answer open.
 * The browser scrolls to the element on its own; all this does is make sure the
 * panel it scrolled to is not collapsed.
 */
const openFromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id)?.closest("[data-accordion-item]");
  if (!target) return;
  const group = target.closest("[data-accordion]");
  for (const other of group.querySelectorAll("[data-accordion-item]")) {
    other.removeAttribute("data-open");
    other.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", "false");
  }
  target.setAttribute("data-open", "");
  target.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", "true");
};
openFromHash();
window.addEventListener("hashchange", openFromHash);

/* ------------------------------------------------------------ legal accordion */
/*
 * Impressum / Datenschutzerklärung. Unlike the FAQ accordion above, items
 * here toggle independently — a visitor comparing two sections (e.g.
 * "Hosting" and "Empfänger von Daten") should be able to hold both open.
 * Same server-rendered `data-open` + display:none approach, own hook so it
 * never interferes with the exclusive FAQ behaviour.
 */
for (const root of document.querySelectorAll("[data-legal-accordion]")) {
  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-legal-accordion-toggle]");
    if (!toggle || !root.contains(toggle)) return;

    const item = toggle.closest("[data-legal-accordion-item]");
    const isOpen = item.hasAttribute("data-open");

    if (isOpen) {
      item.removeAttribute("data-open");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      item.setAttribute("data-open", "");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
}

/*
 * Deep link support: /datenschutz/#externe-inhalte should arrive with that
 * section already open, same idea as the FAQ's openFromHash above but
 * additive — opening one legal section must not close any others, matching
 * the independent-toggle behaviour of this accordion.
 */
const openLegalFromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(`legal-q-${id}`)?.closest("[data-legal-accordion-item]");
  if (!target) return;
  target.setAttribute("data-open", "");
  target.querySelector("[data-legal-accordion-toggle]")?.setAttribute("aria-expanded", "true");
};
openLegalFromHash();
window.addEventListener("hashchange", openLegalFromHash);

/* ------------------------------------------------------------------ vtabs */
/*
 * Vertical feature tabs (Dienstleistungen, "Wann diese Unterlagen den
 * Unterschied machen"). Exactly one tab active at a time — same exclusive-
 * open idea as the accordion above, just swapping which single panel is
 * shown instead of collapsing to nothing.
 *
 * The open tab is rendered server-side via data-open (see .bc-vtabs__tab and
 * .bc-vtabs__panel[data-open] in global.css), so the right panel is already
 * showing before this file loads.
 */
for (const root of document.querySelectorAll("[data-vtabs]")) {
  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-vtabs-tab]");
    if (!tab || !root.contains(tab) || tab.hasAttribute("data-open")) return;

    for (const other of root.querySelectorAll("[data-vtabs-tab]")) {
      other.removeAttribute("data-open");
      other.setAttribute("aria-selected", "false");
    }
    tab.setAttribute("data-open", "");
    tab.setAttribute("aria-selected", "true");

    const targetId = tab.getAttribute("aria-controls");
    for (const panel of root.querySelectorAll("[data-vtabs-panel]")) {
      panel.toggleAttribute("data-open", panel.id === targetId);
    }
  });
}

/* ------------------------------------------------------------- faq scroll */
/*
 * Scroll-spy for the FAQ category navigation. The links are ordinary anchors
 * and work without any of this; the observer only moves the `aria-current`
 * marker so the sidebar reflects where the visitor is.
 */
const faqLinks = document.querySelectorAll("[data-faq-link]");
if (faqLinks.length) {
  const byId = new Map();
  for (const link of faqLinks) {
    const id = link.getAttribute("href")?.slice(1);
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(link);
  }

  const sections = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setCurrent = (id) => {
    for (const link of faqLinks) {
      const active = link.getAttribute("href") === `#${id}`;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    // Keep the active chip in view on the mobile row.
    //
    // NOT scrollIntoView: that walks up every scrollable ancestor, including
    // the document, so nudging a chip sideways scrolled the whole page 28px to
    // the right. Setting scrollLeft on the row itself cannot escape the row.
    const chip = document.querySelector(".bc-faq-chip[aria-current='true']");
    const row = chip?.parentElement;
    if (chip && row) {
      const target = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
      row.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
  };

  const spy = new IntersectionObserver(
    (entries) => {
      // The topmost section currently intersecting wins, so scrolling up and
      // down both land on the heading the visitor is actually reading.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setCurrent(visible[0].target.id);
    },
    // The band sits just below the fixed header and covers the upper third of
    // the viewport; a section counts as "current" once its heading reaches it.
    { rootMargin: "-120px 0px -66% 0px", threshold: 0 }
  );
  for (const section of sections) spy.observe(section);
  if (sections[0]) setCurrent(sections[0].id);
}

/* ---------------------------------------------------- external-content consent
 * Nothing from a third party loads on this site until the visitor opts in
 * here. The banner itself only appears on a page that actually has a
 * `[data-external-embed]` element waiting on it — so this stays inert
 * everywhere until a real embed (e.g. Lordicon's animated icons) is wired
 * in behind it. Consent is remembered in localStorage; a decline sticks just
 * as durably as an accept, so nobody is asked twice.
 */
const CONSENT_KEY = "bc-consent-external";
const consentBanner = document.querySelector("[data-consent-banner]");

// Any component that gates a third-party embed calls this once consent is
// granted (either just now, or already stored from a previous visit) and
// reacts to the event to load its own script/element — this file has no
// opinion on what that embed is.
function grantExternalConsent() {
  document.dispatchEvent(new CustomEvent("bc:external-consent-granted"));
}

/* Google Analytics (GA4) — the one embed this gate currently guards. Only
 * present at all when BaseLayout rendered the marker below, which only
 * happens when PUBLIC_GA4_MEASUREMENT_ID was set at build time. The
 * listener is registered here, before the gate below can synchronously
 * dispatch bc:external-consent-granted for a returning visitor whose
 * consent is already stored — registering it after that block would miss
 * that first, synchronous firing. */
const gaMarker = document.querySelector("[data-external-embed][data-ga4-id]");
if (gaMarker) {
  const gaId = gaMarker.dataset.ga4Id;
  document.addEventListener("bc:external-consent-granted", () => {
    if (window.__bcGaLoaded) return;
    window.__bcGaLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
  });
}

// The auto-popup-on-load stays gated on an embed actually being present on
// this page, so the banner never appears uninvited when there is nothing to
// consent to. The accept/decline listeners, and the /cookies/ page's own
// "revisit my choice" controls below, are wired unconditionally — Astro
// renders <ConsentBanner /> on every page via BaseLayout, and once
// PUBLIC_GA4_MEASUREMENT_ID is set the embed marker appears on every page
// too, so this is really one site-wide toggle rather than a per-page one.
if (consentBanner) {
  const hasEmbedHere = !!document.querySelector("[data-external-embed]");
  let storedConsent = null;
  try {
    storedConsent = localStorage.getItem(CONSENT_KEY);
  } catch (e) {}

  if (storedConsent === "granted") {
    grantExternalConsent();
  } else if (hasEmbedHere && storedConsent !== "declined") {
    consentBanner.hidden = false;
  }

  consentBanner.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
    consentBanner.hidden = true;
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
    } catch (e) {}
    grantExternalConsent();
  });

  consentBanner.querySelector("[data-consent-decline]")?.addEventListener("click", () => {
    consentBanner.hidden = true;
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch (e) {}
  });

  // /cookies/ page: let a visitor reopen the same banner to reconsider, or
  // revoke an earlier "granted" outright. A reload after revoke is the
  // simplest correct way to make sure nothing already injected (e.g. the
  // GA4 script tag) stays active — everything on this site checks
  // localStorage fresh on each page load, never mid-session.
  document.querySelector("[data-cookie-reopen]")?.addEventListener("click", () => {
    consentBanner.hidden = false;
  });
  document.querySelector("[data-cookie-revoke]")?.addEventListener("click", () => {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch (e) {}
    location.reload();
  });
}

/* --------------------------------------------------------- PDF lightbox */
// A link marked data-pdf-trigger opens its same-origin PDF here instead of a
// new tab. Progressive enhancement only: without this script the trigger is
// a plain link with a real href and opens the PDF directly.
const pdfLightbox = document.querySelector("[data-pdf-lightbox]");
if (pdfLightbox) {
  const pdfFrame = pdfLightbox.querySelector("[data-pdf-lightbox-frame]");
  const pdfBackdrop = pdfLightbox.querySelector("[data-pdf-lightbox-backdrop]");
  const pdfClose = pdfLightbox.querySelector("[data-pdf-lightbox-close]");
  let pdfOpener = null;

  const openPdf = (href, opener) => {
    pdfOpener = opener ?? null;
    pdfFrame.src = href;
    pdfLightbox.hidden = false;
    document.documentElement.style.overflow = "hidden";
    pdfClose.focus();
  };
  const closePdf = () => {
    pdfLightbox.hidden = true;
    document.documentElement.style.overflow = "";
    pdfFrame.src = "";
    pdfOpener?.focus({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-pdf-trigger]");
    if (!trigger) return;
    e.preventDefault();
    openPdf(trigger.href, trigger);
  });
  pdfClose.addEventListener("click", closePdf);
  pdfBackdrop.addEventListener("click", closePdf);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pdfLightbox.hidden) closePdf();
  });
}
