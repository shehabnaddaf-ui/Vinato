// ═══════════════════════════════════════════════
//   LENIS & GSAP SETUP
// ═══════════════════════════════════════════════
if (typeof window.__vinatoAnimationsInit === 'undefined') {
  window.__vinatoAnimationsInit = true;

  gsap.registerPlugin(ScrollTrigger);

  let lenis;

  function initLenis() {
    // Disable Lenis entirely on touch devices. Native scrolling is infinitely better 
    // and faster on mobile. This fixes the severe "lag" users report.
    if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
      return;
    }

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // ═══════════════════════════════════════════════
  //   CINEMATIC INTRO (Runs Once)
  // ═══════════════════════════════════════════════
  function playIntro() {
    const introLoader = document.getElementById('introLoader');
    const spinner = document.querySelector('.intro-spinner');
    const logo = document.querySelector('.intro-logo');

    if (!introLoader) return;

    if (window.innerWidth < 768) {
      introLoader.style.display = 'none';
      sessionStorage.setItem('vinatoIntroPlayed', 'true');
      return;
    }

    if (sessionStorage.getItem('vinatoIntroPlayed')) {
      introLoader.style.display = 'none';
      return;
    }

    // Disable scroll during intro
    if (lenis) lenis.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('vinatoIntroPlayed', 'true');
        introLoader.style.pointerEvents = 'none';
        if (lenis) lenis.start();
      }
    });

    // Spinner fades out after 0.2s
    tl.to(spinner, { opacity: 0, duration: 0.3, delay: 0.2 })
      // Logo "draws" in/fades in
      .to(logo, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' })
      // Reduced hold for a moment to feel luxury
      .to(logo, { opacity: 1, duration: 0.2 })
      // Shrink logo to top and fade out overlay
      .to(introLoader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'expo.inOut',
        display: 'none',
        onComplete: () => {
          introLoader.remove(); // Kill it from DOM to avoid any black bars/blocks
        }
      });
  }

  // ═══════════════════════════════════════════════
  //   CUSTOM CURSOR & MAGNETIC BUTTONS (Desktop Only)
  // ═══════════════════════════════════════════════
  function initCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;

    // Check if touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      cursor.style.display = 'none';
      return;
    }

    // Use gsap.quickTo for highly performant follow
    const xTo = gsap.quickTo(cursor, "left", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "top", { duration: 0.2, ease: "power3" });

    window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    // Hover states on links/buttons
    const interactables = document.querySelectorAll('a, button, .product-card, .hl-item');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // Magnetic Buttons
    const magneticEls = document.querySelectorAll('.btn, .nav-icon');
    magneticEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      });
    });
  }

  // ═══════════════════════════════════════════════
  //   FULL SCREEN MENU / MOBILE MENU
  // ═══════════════════════════════════════════════
  function initMenu() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileMenu.classList.toggle('open');
        navToggle.classList.toggle('active');

        if (isOpen && lenis) {
          lenis.stop();
        } else if (lenis) {
          lenis.start();
        }
      });

      const links = mobileMenu.querySelectorAll('.mobile-link');
      links.forEach(l => {
        l.addEventListener('click', (e) => {
          // If it's a dropdown toggle, don't close the menu
          if (l.classList.contains('mobile-dropdown-btn')) return;

          mobileMenu.classList.remove('open');
        });
      });

      // Mobile subcategories toggle
      const dropdownBtns = mobileMenu.querySelectorAll('.mobile-dropdown-btn');
      dropdownBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const parent = btn.parentElement;
          parent.classList.toggle('open');
        });
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
          mobileMenu.classList.remove('open');
          navToggle.classList.remove('active');
          if (lenis) lenis.start();
        }
      });
    }
  }

  // ═══════════════════════════════════════════════
  //   SCROLL ANIMATIONS & HORIZONTAL LOOKBOOK
  // ═══════════════════════════════════════════════
  function initScrollTriggers() {
    // Reveal Up
    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        scrollTrigger: { trigger: el, start: "top 95%" },
        y: 0, opacity: 1, duration: 0.35, ease: "power2.out"
      });
    });

    // Reveal Left/Right
    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.fromTo(el, { x: -30, opacity: 0 }, { scrollTrigger: { trigger: el, start: "top 95%" }, x: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
    });
    gsap.utils.toArray('.reveal-right').forEach(el => {
      gsap.fromTo(el, { x: 30, opacity: 0 }, { scrollTrigger: { trigger: el, start: "top 95%" }, x: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
    });

    // Parallax BGs
    gsap.utils.toArray('.parallax-bg').forEach(bg => {
      gsap.to(bg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: bg.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });



    // Navbar scrolled state
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      ScrollTrigger.create({
        trigger: "body",
        start: "top -50",
        onUpdate: (self) => {
          if (self.direction === 1) {
            navbar.classList.add('scrolled');
            gsap.to(navbar, { yPercent: -100, duration: 0.3 });
          } else {
            gsap.to(navbar, { yPercent: 0, duration: 0.3 });
          }
        },
        onLeaveBack: () => navbar.classList.remove('scrolled')
      });
    }
  }

  // ═══════════════════════════════════════════════
  //   DYNAMIC SORTING & STRIPES (Frontend Prototype)
  // ═══════════════════════════════════════════════
  function initSortingAndBadges() {
    const sortables = document.querySelectorAll('[data-sort]');
    sortables.forEach(el => {
      // Utilize CSS Flex/Grid native order property
      el.style.order = el.getAttribute('data-sort');
    });
  }

  // ═══════════════════════════════════════════════
  //   PRODUCT PAGE INTERACTIONS (product.html)
  // ═══════════════════════════════════════════════
  function initProductInteractions() {
    // 1. Color Swatches
    const swatches = document.querySelectorAll('.color-swatch');
    const colorNameLabel = document.getElementById('currentColorName');
    const gallery = document.getElementById('productGallery');

    if (swatches.length && colorNameLabel && gallery) {
      swatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          const imagesStr = e.currentTarget.getAttribute('data-images');
          const newColor = e.currentTarget.getAttribute('data-color-name');
          window.switchColorGallery(newColor, imagesStr);
        });
      });
    }
  }

  window.switchColorGallery = (newColor, imagesData) => {
    const colorNameLabel = document.getElementById('currentColorName');
    const gallery = document.getElementById('productGallery');
    const swatches = document.querySelectorAll('.color-swatch');

    if (!gallery) return;

    // Update active swatch UI
    swatches.forEach(s => {
      if (s.getAttribute('data-color-name') === newColor) s.classList.add('active');
      else s.classList.remove('active');
    });

    if (colorNameLabel) colorNameLabel.textContent = newColor;

    let imagesArr = [];
    try {
      imagesArr = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
    } catch (e) { console.error('Invalid image data', e); return; }

    if (!imagesArr || imagesArr.length === 0) return;

    // Fade out current gallery
    gsap.to(gallery.children, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        gallery.innerHTML = ''; // clear
        imagesArr.forEach((src, idx) => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = `${newColor} Detail ${idx + 1}`;
          img.className = 'pg-img active';
          img.decoding = 'async';
          gallery.appendChild(img);
        });
        // Fade in new
        gsap.fromTo(gallery.children,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, stagger: 0.1 }
        );
      }
    });
  };

  // 2. Size Guide Modal
  const openBtn = document.getElementById('openSizeGuide');
  const closeBtn = document.getElementById('closeSizeGuide');
  const modalOuter = document.getElementById('sizeGuideModal');

  if (openBtn && closeBtn && modalOuter) {
    // Clone logic prevents multiple event bindings on Barba navigations if element preserves
    const newOpenBtn = openBtn.cloneNode(true);
    openBtn.parentNode.replaceChild(newOpenBtn, openBtn);

    newOpenBtn.addEventListener('click', () => {
      modalOuter.classList.remove('hidden');
      if (lenis) lenis.stop(); // freeze scrolling
      // Animate in
      gsap.fromTo(modalOuter.querySelector('.modal'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    });

    closeBtn.addEventListener('click', () => {
      gsap.to(modalOuter.querySelector('.modal'), {
        y: 20, opacity: 0, duration: 0.3,
        onComplete: () => {
          modalOuter.classList.add('hidden');
          if (lenis) lenis.start();
        }
      });
    });

    modalOuter.addEventListener('click', (e) => {
      if (e.target === modalOuter) closeBtn.click();
    });
  }

  // 3. Accordions
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(acc => {
    // Avoid double bindings
    const newAcc = acc.cloneNode(true);
    acc.parentNode.replaceChild(newAcc, acc);

    newAcc.addEventListener('click', () => {
      const item = newAcc.parentElement;
      item.classList.toggle('active');
    });
  });
}

// ═══════════════════════════════════════════════
//   QUICK VIEW MODAL (shop & index)
// ═══════════════════════════════════════════════
function initQuickView() {
  const quickBtns = document.querySelectorAll('.quick-view-btn');
  const qvModal = document.getElementById('quickViewModal');
  const qvClose = document.getElementById('closeQuickView');
  const qvTitle = document.getElementById('qvTitle');
  const qvImg = document.getElementById('qvImg');
  const qvPrice = document.getElementById('qvPrice');

  if (!quickBtns.length || !qvModal) return;

  if (qvClose) {
    const newClose = qvClose.cloneNode(true);
    qvClose.parentNode.replaceChild(newClose, qvClose);

    newClose.addEventListener('click', () => {
      gsap.to(qvModal.querySelector('.modal'), {
        y: 20, opacity: 0, duration: 0.3,
        onComplete: () => {
          qvModal.classList.add('hidden');
          if (lenis) lenis.start();
        }
      });
    });

    qvModal.addEventListener('click', (e) => {
      if (e.target === qvModal) newClose.click();
    });
  }

  quickBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = newBtn.closest('.product-card') || newBtn.closest('.bs-card');
      if (card) {
        const titleEl = card.querySelector('.product-name') || card.querySelector('.bs-name') || card.querySelector('h3');
        const priceEl = card.querySelector('.product-price') || card.querySelector('.bs-price');
        const imgEl = card.querySelector('img');

        if (titleEl) qvTitle.textContent = titleEl.textContent;
        if (priceEl) qvPrice.textContent = priceEl.textContent;
        if (imgEl) qvImg.src = imgEl.src;
      }

      qvModal.classList.remove('hidden');
      if (lenis) lenis.stop();
      gsap.fromTo(qvModal.querySelector('.modal'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    });
  });
}

// ═══════════════════════════════════════════════
//   LAZY LOADING & BLUR-UP
// ═══════════════════════════════════════════════
function initLazyLoading() {
  const images = document.querySelectorAll('.lazy-image');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');

        if (!src) return;

        const highRes = new Image();
        highRes.src = src;
        highRes.onload = () => {
          img.src = src;
          img.classList.add('loaded');
          const parent = img.closest('.skeleton');
          if (parent) {
            parent.classList.remove('skeleton');
          }
        };

        obs.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01
  });

  images.forEach(img => observer.observe(img));
}

// ═══════════════════════════════════════════════
//   BARBA.JS PAGE TRANSITIONS
// ═══════════════════════════════════════════════
function initBarba() {
  if (typeof barba === 'undefined') return;

  // Enable prefetch plugin if available
  if (typeof barbaPrefetch !== 'undefined') {
    barba.use(barbaPrefetch);
  }

  if (window.innerWidth < 768) {
    return;
  }

  barba.init({
    sync: true,
    transitions: [{
      name: 'fade-transition',
      leave(data) {
        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      },
      enter(data) {
        window.scrollTo(0, 0);
        if (lenis) lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();

        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      }
    }]
  });

  barba.hooks.after(() => {
    initSortingAndBadges();
    initProductInteractions();
    initQuickView();
    initScrollTriggers();
    initCursor();
    initMenu();
    initLazyLoading();
  });
}

// ═══════════════════════════════════════════════
//   IMAGE REPLACEMENTS (From Admin Image Manager)
// ═══════════════════════════════════════════════
function applyImageReplacements() {
  const replacementsStr = localStorage.getItem('vinato_replaced_server_files');
  if (!replacementsStr) return;

  try {
    const replacements = JSON.parse(replacementsStr);
    const SITE_IMAGES = [
      { key: 'hero_bg', path: 'images/optimized/hero_unisex.png.webp' },
      { key: 'new_collection', path: 'images/optimized/new_collection.webp' },
      { key: 'best_sellers', path: 'images/optimized/best_sellers.webp' },
      { key: 'instagram_grid', path: 'images/optimized/instagram_grid.webp' },
      { key: 'prod_coat_men', path: 'images/optimized/prod_coat_men.webp' },
      { key: 'prod_dress_silk', path: 'images/optimized/prod_dress_silk.webp' },
      { key: 'prod_knitwear', path: 'images/optimized/prod_knitwear.webp' },
      { key: 'prod_trousers', path: 'images/optimized/prod_trousers.webp' },
      { key: 'hero_bg_editorial', path: 'images/optimized/hero_bg.webp' },
    ];

    SITE_IMAGES.forEach(imgDef => {
      const replacementUrl = replacements[imgDef.key];
      if (replacementUrl) {
        // 1. Normal <img> tags (src and data-src for lazy loading)
        const imgs = document.querySelectorAll(`img[src*="${imgDef.path}"], img[data-src*="${imgDef.path}"]`);
        imgs.forEach(img => {
          if (img.getAttribute('src')) img.src = replacementUrl;
          if (img.getAttribute('data-src')) img.setAttribute('data-src', replacementUrl);
        });

        // 2. CSS background-images (inline styles)
        const bgEls = document.querySelectorAll(`[style*="${imgDef.path}"]`);
        bgEls.forEach(el => {
          el.style.backgroundImage = `url('${replacementUrl}')`;
        });
      }
    });
  } catch (err) {
    console.error("Failed to apply image replacements", err);
  }
}

// Export to window for access from other scripts
window.applyImageReplacements = applyImageReplacements;

// ═══════════════════════════════════════════════
//   INITIALIZATION
// ═══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  applyImageReplacements(); // Run this first before animations/lazy loading
  initSortingAndBadges();
  initProductInteractions();
  initQuickView();
  initLenis();
  playIntro();
  initCursor();
  initMenu();
  initScrollTriggers();
  initLazyLoading();
  initBarba();
});

} // end __vinatoAnimationsInit guard
