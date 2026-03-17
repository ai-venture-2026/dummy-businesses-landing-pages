/* ============================================================
   Diamond Nails — script.js
   Handles: navbar scroll, mobile menu, service tabs,
            gallery slider, membership tabs, booking form
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── Navbar: scroll shadow + hamburger ───────────────── */
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Hamburger toggle
  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });

  // Close mobile menu on link click
  $$('.mobile-menu__link, .mobile-menu__cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });

  /* ── Dropdown nav ────────────────────────────────────── */
  const dropdownTrigger = $('.nav-dropdown__trigger');
  const dropdownMenu = $('.nav-dropdown__menu');

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.toggle('open');
      dropdownTrigger.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
      dropdownTrigger.setAttribute('aria-expanded', 'false');
    });

    // Close on item click
    $$('.nav-dropdown__item').forEach(item => {
      item.addEventListener('click', () => {
        dropdownMenu.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Services Tabs ───────────────────────────────────── */
  const serviceTabs = $$('.services__tab');
  const servicePanels = $$('.services__panel');

  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      serviceTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      servicePanels.forEach(panel => {
        const isActive = panel.id === `tab-panel-${target}`;
        panel.classList.toggle('active', isActive);
      });
    });
  });

  // Keyboard navigation for tabs
  serviceTabs.forEach((tab, i) => {
    tab.addEventListener('keydown', (e) => {
      let next;
      if (e.key === 'ArrowRight') next = serviceTabs[(i + 1) % serviceTabs.length];
      if (e.key === 'ArrowLeft') next = serviceTabs[(i - 1 + serviceTabs.length) % serviceTabs.length];
      if (next) {
        next.focus();
        next.click();
      }
    });
  });

  /* ── Gallery Slider ──────────────────────────────────── */
  const galleryTrack = $('#galleryTrack');
  const prevBtn = $('#galleryPrev');
  const nextBtn = $('#galleryNext');
  const dots = $$('.slider-dot');

  if (galleryTrack) {
    const items = $$('.gallery__item', galleryTrack);
    let currentPage = 0;

    // Calculate items per page based on viewport
    function getItemsPerPage() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 768) return 2;
      return 3;
    }

    function getTotalPages() {
      return Math.ceil(items.length / getItemsPerPage());
    }

    function getItemWidth() {
      if (!items[0]) return 0;
      const gap = 32;
      const perPage = getItemsPerPage();
      const trackWidth = galleryTrack.parentElement.offsetWidth;
      return (trackWidth - gap * (perPage - 1)) / perPage + gap;
    }

    function goTo(page) {
      const totalPages = getTotalPages();
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      const offset = currentPage * getItemsPerPage() * getItemWidth();
      galleryTrack.style.transform = `translateX(-${offset}px)`;

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
      });
    }

    prevBtn && prevBtn.addEventListener('click', () => goTo(currentPage - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(currentPage + 1));

    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    // Touch/swipe support
    let startX = 0;
    galleryTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    galleryTrack.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) {
        goTo(dx < 0 ? currentPage + 1 : currentPage - 1);
      }
    }, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(0), 150);
    }, { passive: true });
  }

  /* ── Membership Tabs ─────────────────────────────────── */
  const memberItems = $$('.membership__item');
  const memberImgs = $$('.membership__img');

  memberItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.member;

      // Update active item
      memberItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');

      // Update image
      memberImgs.forEach(img => {
        img.classList.toggle('active', img.id === `member-img-${target}`);
      });
    });
  });

  /* ── Booking Form ────────────────────────────────────── */
  const bookingForm = $('#bookingForm');
  const formSuccess = $('#formSuccess');

  if (bookingForm) {
    // Set min date to today
    const dateInput = $('#bookDate');
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic client-side validation
      const name = bookingForm.querySelector('[name="name"]').value.trim();
      const email = bookingForm.querySelector('[name="email"]').value.trim();
      const service = bookingForm.querySelector('[name="service"]').value;
      const date = bookingForm.querySelector('[name="date"]').value;

      if (!name || !email || !service || !date) {
        formSuccess.style.color = '#e55';
        formSuccess.textContent = 'Please fill in all fields.';
        return;
      }

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        formSuccess.style.color = '#e55';
        formSuccess.textContent = 'Please enter a valid email address.';
        return;
      }

      // Simulate successful booking
      const submitBtn = bookingForm.querySelector('[type="submit"]');
      submitBtn.textContent = 'Booking...';
      submitBtn.disabled = true;

      setTimeout(() => {
        formSuccess.style.color = '#6ee3a0';
        formSuccess.textContent = `✓ Appointment booked for ${name}! We'll confirm via email shortly.`;
        bookingForm.reset();
        submitBtn.textContent = 'Book My Appointment';
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  /* ── Smooth scroll for anchor links ──────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Active nav link highlight on scroll ─────────────── */
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.navbar__links .nav-link[href^="#"]');

  function highlightNav() {
    const scrollY = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 40;
    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.style.opacity = isActive ? '1' : '';
      link.style.fontWeight = isActive ? '600' : '';
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

})();
