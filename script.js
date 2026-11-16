/* ==========================================================================
   CHÂTEAU ROUGE — behaviour
   Three small jobs, no dependencies:
     1. Sticky masthead state
     2. Full-screen mobile navigation
     3. Reveal-on-scroll, and the "copy address" confirmation

   Everything degrades gracefully: with JS off, the page still reads top to
   bottom and the phone links still work.
   ========================================================================== */

/* ====== QUICK SETTINGS — edit these, don't touch below ====== */
const SETTINGS = {
  stuckAfter: 8,          // px scrolled before the header gains its hairline
  revealMargin: '0px 0px -8% 0px', // how early a section reveals
  copyResetMs: 4000       // how long "Address copied" stays on screen
};

/* --------------------------------------------------------------------------
   1. Masthead: add .is-stuck once the page has moved, remove at the top.
   -------------------------------------------------------------------------- */
(function mastheadState() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;

  function update() {
    header.classList.toggle('is-stuck', window.scrollY > SETTINGS.stuckAfter);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  update();
})();

/* --------------------------------------------------------------------------
   2. Mobile navigation — full-screen overlay, Esc to close, focus returned.
   -------------------------------------------------------------------------- */
(function mobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('nav-panel');
  if (!toggle || !panel) return;

  const firstLink = panel.querySelector('a');

  function open() {
    panel.hidden = false;
    // next frame, so the opening transition actually runs
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('is-locked');
      if (firstLink) firstLink.focus();
    });
  }

  function close(returnFocus = true) {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
    if (returnFocus) toggle.focus();

    // wait for the fade before removing from the tab order
    const finish = () => { if (!panel.classList.contains('is-open')) panel.hidden = true; };
    panel.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 400); // fallback when transitions are disabled
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  // following a link closes the overlay first
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) close(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
    }
  });

  // if the viewport grows to desktop, reset the overlay state
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches && toggle.getAttribute('aria-expanded') === 'true') close(false);
  });
})();

/* --------------------------------------------------------------------------
   3a. Reveal on scroll — once per element, skipped under reduced motion.
   -------------------------------------------------------------------------- */
(function revealOnScroll() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: SETTINGS.revealMargin });

  items.forEach((item) => observer.observe(item));
})();

/* --------------------------------------------------------------------------
   3b. Copy address — click, write to clipboard, confirm in a live region.
   -------------------------------------------------------------------------- */
(function copyAddress() {
  const button = document.querySelector('[data-copy-address]');
  const status = document.querySelector('[data-copy-status]');
  if (!button || !status) return;

  let resetTimer = null;

  button.addEventListener('click', async () => {
    const address = button.getAttribute('data-copy-address');

    try {
      await navigator.clipboard.writeText(address);
      button.dataset.state = 'done';
      button.textContent = 'Address copied';
      status.textContent = 'Château Rouge, Kindaruma Road, Kilimani — copied to your clipboard.';
    } catch (error) {
      button.dataset.state = 'error';
      status.textContent = 'Copying failed — the address is Kindaruma Road, Kilimani, Nairobi.';
    }

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.dataset.state = '';
      button.textContent = 'Copy address';
      status.textContent = '';
    }, SETTINGS.copyResetMs);
  });
})();
