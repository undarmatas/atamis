/* ATAMIS — shared behaviour for the burohappold-layout site.
   Modules guard on element presence, so one file serves all pages. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n (LT default, EN via data-en swaps) ---------- */
  var LANG_KEY = 'atamis-lang';
  function applyLang(lang) {
    var en = lang === 'en';
    document.body.classList.toggle('en', en);
    document.documentElement.lang = en ? 'en' : 'lt';
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.lt) el.dataset.lt = el.innerHTML;
      el.innerHTML = en ? el.dataset.en : el.dataset.lt;
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      if (!el.dataset.ltPlaceholder) el.dataset.ltPlaceholder = el.placeholder;
      el.placeholder = en ? el.dataset.enPlaceholder : el.dataset.ltPlaceholder;
    });
    document.querySelectorAll('[data-en-aria]').forEach(function (el) {
      if (!el.dataset.ltAria) el.dataset.ltAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', en ? el.dataset.enAria : el.dataset.ltAria);
    });
    document.querySelectorAll('[data-en-alt]').forEach(function (el) {
      if (!el.dataset.ltAlt) el.dataset.ltAlt = el.getAttribute('alt') || '';
      el.setAttribute('alt', en ? el.dataset.enAlt : el.dataset.ltAlt);
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.textContent = en ? 'LT' : 'EN'; });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { en: en } }));
  }
  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (savedLang === 'en') applyLang('en');
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = document.body.classList.contains('en') ? 'lt' : 'en';
      try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
      applyLang(next);
    });
  });

  /* ---------- header: shadow + hide on scroll down / reveal up ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        header.classList.toggle('scrolled', y > 8);
        if (y > 160 && y > lastY + 4) header.classList.add('sleep');
        else if (y < lastY - 4 || y < 160) header.classList.remove('sleep');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- overlays (menu + search) ---------- */
  function bindOverlay(openSel, overlaySel, closeSel, focusSel) {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return;
    var openers = document.querySelectorAll(openSel);
    function setOpen(on) {
      overlay.classList.toggle('open', on);
      document.body.style.overflow = on ? 'hidden' : '';
      if (on && focusSel) {
        var f = overlay.querySelector(focusSel);
        if (f) setTimeout(function () { f.focus(); }, 120);
      }
    }
    openers.forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
    var closer = overlay.querySelector(closeSel);
    if (closer) closer.addEventListener('click', function () { setOpen(false); });
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) setOpen(false); });
    return setOpen;
  }
  bindOverlay('.burger-btn', '.menu-overlay', '.menu-close');
  bindOverlay('.search-btn', '.search-overlay', '.search-close', '.search-input');

  var searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = (searchInput.dataset.target || 'projektai.html') + '?q=' + encodeURIComponent(searchInput.value.trim());
      }
    });
  }

  /* ---------- scroll reveals ---------- */
  var rvEls = document.querySelectorAll('.rv');
  if (rvEls.length && 'IntersectionObserver' in window && !reduced) {
    var groups = new Map();
    rvEls.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      el.style.setProperty('--d', (groups.get(parent) * 0.08) + 's');
      groups.set(parent, groups.get(parent) + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- back to top ---------- */
  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 900);
    }, { passive: true });
    backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  }

  /* ---------- hero carousel (home) ---------- */
  var hero = document.querySelector('.hero-wrap');
  if (hero) {
    var slides = hero.querySelectorAll('.hc-slide');
    var imgs = hero.querySelectorAll('.hc-media img');
    var pages = hero.querySelectorAll('.hc-page');
    var idx = 0, n = slides.length, heroTimer = null;
    function goHero(i) {
      idx = (i + n) % n;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === idx); });
      imgs.forEach(function (im, k) { im.classList.toggle('active', k === idx); });
      pages.forEach(function (p, k) { p.classList.toggle('active', k === idx); });
    }
    function heroPlay() {
      if (reduced) return;
      clearInterval(heroTimer);
      heroTimer = setInterval(function () { goHero(idx + 1); }, 5000);
    }
    hero.querySelector('.hc-prev').addEventListener('click', function () { goHero(idx - 1); heroPlay(); });
    hero.querySelector('.hc-next').addEventListener('click', function () { goHero(idx + 1); heroPlay(); });
    pages.forEach(function (p, k) { p.addEventListener('click', function () { goHero(k); heroPlay(); }); });
    hero.addEventListener('mouseenter', function () { clearInterval(heroTimer); });
    hero.addEventListener('mouseleave', heroPlay);
    goHero(0);
    heroPlay();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) heroPlay(); else clearInterval(heroTimer);
      }).observe(hero);
    }
  }

  /* ---------- expanding projects carousel ---------- */
  var xc = document.querySelector('.xc-viewport');
  if (xc) {
    var track = xc.querySelector('.xc-track');
    var units = track.querySelectorAll('.xc-unit');
    var xi = 0, xn = units.length, xcTimer = null;
    function goXc(i) {
      xi = Math.max(0, Math.min(i, xn - 1));
      units.forEach(function (u, k) { u.classList.toggle('active', k === xi); });
      var offset = 0;
      for (var k = 0; k < xi; k++) offset += units[k].getBoundingClientRect().width + 12;
      track.style.transform = 'translateX(' + (-offset) + 'px)';
      var prev = document.querySelector('.xc-arrows .prev');
      var next = document.querySelector('.xc-arrows .next');
      if (prev) prev.disabled = xi === 0;
      if (next) next.disabled = xi === xn - 1;
    }
    function xcPlay() {
      if (reduced) return;
      clearInterval(xcTimer);
      xcTimer = setInterval(function () { goXc(xi + 1 > xn - 1 ? 0 : xi + 1); }, 8000);
    }
    var xcPrev = document.querySelector('.xc-arrows .prev');
    var xcNext = document.querySelector('.xc-arrows .next');
    if (xcPrev) xcPrev.addEventListener('click', function () { goXc(xi - 1); xcPlay(); });
    if (xcNext) xcNext.addEventListener('click', function () { goXc(xi + 1); xcPlay(); });
    xc.addEventListener('mouseenter', function () { clearInterval(xcTimer); });
    xc.addEventListener('mouseleave', xcPlay);
    /* recompute offset after the width transition settles or on resize */
    window.addEventListener('resize', function () { goXc(xi); });
    track.addEventListener('transitionend', function (e) { if (e.propertyName === 'width') goXc(xi); });
    goXc(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) xcPlay(); else clearInterval(xcTimer);
      }).observe(xc);
    } else xcPlay();
  }

  /* ---------- explore-more carousel (apie) ---------- */
  var em = document.querySelector('.em-viewport');
  if (em) {
    var emTrack = em.querySelector('.em-track');
    var emCards = emTrack.querySelectorAll('.em-card');
    var ei = 0;
    function emPer() { return window.innerWidth <= 820 ? 1 : 4; }
    function goEm(i) {
      var maxI = Math.max(0, emCards.length - emPer());
      ei = Math.max(0, Math.min(i, maxI));
      var w = emCards[0].getBoundingClientRect().width + 26;
      emTrack.style.transform = 'translateX(' + (-ei * w) + 'px)';
      var p = document.querySelector('.em-arrows .prev');
      var nx = document.querySelector('.em-arrows .next');
      if (p) p.disabled = ei === 0;
      if (nx) nx.disabled = ei === maxI;
    }
    var emPrev = document.querySelector('.em-arrows .prev');
    var emNext = document.querySelector('.em-arrows .next');
    if (emPrev) emPrev.addEventListener('click', function () { goEm(ei - 1); });
    if (emNext) emNext.addEventListener('click', function () { goEm(ei + 1); });
    window.addEventListener('resize', function () { goEm(ei); });
    goEm(0);
  }

  /* ---------- values scroll (apie) ---------- */
  var valuesScroll = document.querySelector('.values-scroll');
  if (valuesScroll) {
    var words = valuesScroll.querySelectorAll('.value-word');
    var panels = valuesScroll.querySelectorAll('.value-panel');
    var active = -1, vTicking = false;
    function setValue(i) {
      if (i === active) return;
      active = i;
      words.forEach(function (w, k) { w.classList.toggle('active', k === i); });
      panels.forEach(function (p, k) { p.classList.toggle('active', k === i); });
    }
    window.addEventListener('scroll', function () {
      if (vTicking) return;
      vTicking = true;
      requestAnimationFrame(function () {
        var r = valuesScroll.getBoundingClientRect();
        var progress = -r.top / (r.height - window.innerHeight);
        if (progress >= -0.05 && progress <= 1.05) {
          setValue(Math.max(0, Math.min(words.length - 1, Math.floor(progress * words.length))));
        }
        vTicking = false;
      });
    }, { passive: true });
    setValue(0);
    words.forEach(function (w, k) { w.addEventListener('click', function () { setValue(k); }); });
  }

  /* ---------- tab nav active state (kontaktai) ---------- */
  var tabNav = document.querySelector('.tab-nav');
  if (tabNav && 'IntersectionObserver' in window) {
    var tabLinks = tabNav.querySelectorAll('a');
    var sections = [];
    tabLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) sections.push([t, a]);
    });
    var tabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tabLinks.forEach(function (a) { a.classList.remove('active'); });
          var hit = sections.find(function (s) { return s[0] === en.target; });
          if (hit) hit[1].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { tabIo.observe(s[0]); });
  }

  /* ---------- listing filter + search + pagination ---------- */
  var listing = document.querySelector('[data-listing]');
  if (listing) {
    var cards = Array.prototype.slice.call(listing.querySelectorAll('.tile'));
    var chips = document.querySelectorAll('.filter-chips .chip');
    var searchBox = document.querySelector('.listing-search');
    var metaEl = document.querySelector('.results-meta');
    var pagEl = document.querySelector('.pagination');
    var PER = 16, page = 1, cat = 'all', q = '';

    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && searchBox) { q = params.get('q').toLowerCase(); searchBox.value = params.get('q'); }

    var filterToggle = document.querySelector('.filter-btn');
    var chipsRow = document.querySelector('.filter-chips');
    if (filterToggle && chipsRow) {
      filterToggle.addEventListener('click', function () { chipsRow.hidden = !chipsRow.hidden; });
      if (q) chipsRow.hidden = false;
    }

    function matches(card) {
      var okCat = cat === 'all' || (card.dataset.cat || '').split('|').indexOf(cat) !== -1;
      var okQ = !q || (card.dataset.search || card.textContent).toLowerCase().indexOf(q) !== -1;
      return okCat && okQ;
    }
    function render() {
      var vis = cards.filter(matches);
      var pageCount = Math.max(1, Math.ceil(vis.length / PER));
      page = Math.min(page, pageCount);
      cards.forEach(function (c) { c.style.display = 'none'; });
      vis.slice((page - 1) * PER, page * PER).forEach(function (c) { c.style.display = ''; });
      if (metaEl) {
        var en = document.body.classList.contains('en');
        metaEl.textContent = vis.length + (en ? ' results' : (vis.length % 10 === 1 && vis.length % 100 !== 11 ? ' rezultatas' : ' rezultatai'));
      }
      if (pagEl) {
        pagEl.innerHTML = '';
        if (pageCount > 1) {
          for (var i = 1; i <= pageCount; i++) {
            var b = document.createElement('button');
            b.textContent = i;
            if (i === page) b.className = 'active';
            b.addEventListener('click', function (e) {
              page = parseInt(e.target.textContent, 10);
              render();
              listing.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            });
            pagEl.appendChild(b);
          }
          var nx = document.createElement('button');
          nx.innerHTML = document.body.classList.contains('en') ? 'Next' : 'Kitas';
          nx.addEventListener('click', function () {
            if (page < pageCount) { page++; render(); listing.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
          });
          pagEl.appendChild(nx);
        }
      }
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        cat = chip.dataset.cat;
        page = 1;
        render();
      });
    });
    if (searchBox) {
      searchBox.addEventListener('input', function () {
        q = searchBox.value.trim().toLowerCase();
        page = 1;
        render();
      });
    }
    document.addEventListener('langchange', render);
    render();
  }
})();
