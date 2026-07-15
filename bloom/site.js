/* ATAMIS — shared behaviour for the bloom-layout site.
   Modules guard on element presence, so one file serves all pages. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

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

  /* ---------- header: white logo/burger while over dark or photo surfaces ----------
     Surfaces are marked with [data-header="dark"]. Rects are cached and
     re-read only on resize; scroll work is transform-free class toggling. */
  var header = document.querySelector('.site-header');
  var darkSurfaces = Array.prototype.slice.call(document.querySelectorAll('[data-header="dark"]'));
  if (header && darkSurfaces.length) {
    var zones = [], probeY = 44, hTicking = false;
    function measure() {
      var sy = window.scrollY;
      zones = darkSurfaces.map(function (el) {
        var r = el.getBoundingClientRect();
        return [r.top + sy, r.bottom + sy];
      });
    }
    function probe() {
      var y = window.scrollY + probeY;
      var onDark = zones.some(function (z) { return y >= z[0] && y <= z[1]; });
      header.classList.toggle('header-on-dark', onDark);
    }
    function onScroll() {
      if (hTicking) return;
      hTicking = true;
      requestAnimationFrame(function () { probe(); hTicking = false; });
    }
    measure(); probe();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); probe(); });
    window.addEventListener('load', function () { measure(); probe(); });
  }

  /* ---------- menu overlay ---------- */
  var overlay = document.querySelector('.menu-overlay');
  if (overlay) {
    var lastFocus = null;
    function setOpen(on) {
      overlay.classList.toggle('open', on);
      document.body.style.overflow = on ? 'hidden' : '';
      if (on) {
        lastFocus = document.activeElement;
        var f = overlay.querySelector('a,button');
        if (f) setTimeout(function () { f.focus(); }, 150);
      } else if (lastFocus) { lastFocus.focus(); }
    }
    document.querySelectorAll('.burger').forEach(function (b) {
      b.addEventListener('click', function () { setOpen(true); });
    });
    var closer = overlay.querySelector('.menu-close');
    if (closer) closer.addEventListener('click', function () { setOpen(false); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) setOpen(false);
    });
    var sub = overlay.querySelector('.menu-sub');
    if (sub) {
      sub.querySelector('.menu-sub-toggle').addEventListener('click', function () {
        sub.classList.toggle('open-sub');
      });
    }
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

  /* ---------- hero entrance + video economy ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () { hero.classList.add('hero-in'); });
    var vid = hero.querySelector('video');
    if (vid && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { vid.play().catch(function () {}); }
        else { vid.pause(); }
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  /* ---------- horizontal services strip (scroll-driven) ---------- */
  var strip = document.querySelector('.hstrip');
  if (strip && !reduced) {
    var track = strip.querySelector('.hstrip-track');
    var sTicking = false, max = 0, top = 0, span = 1;
    var mql = window.matchMedia('(max-width: 860px)');
    function sMeasure() {
      if (mql.matches) { max = 0; track.style.transform = ''; return; }
      var sy = window.scrollY;
      var r = strip.getBoundingClientRect();
      top = r.top + sy;
      span = strip.offsetHeight - window.innerHeight;
      max = track.scrollWidth + (parseFloat(getComputedStyle(track).paddingLeft) || 0) - window.innerWidth;
      if (max < 0) max = 0;
    }
    function sApply() {
      if (!max) return;
      var p = (window.scrollY - top) / span;
      p = Math.max(0, Math.min(1, p));
      track.style.transform = 'translateX(' + (-p * max).toFixed(1) + 'px)';
    }
    function sScroll() {
      if (sTicking) return;
      sTicking = true;
      requestAnimationFrame(function () { sApply(); sTicking = false; });
    }
    sMeasure(); sApply();
    window.addEventListener('scroll', sScroll, { passive: true });
    window.addEventListener('resize', function () { sMeasure(); sApply(); });
    window.addEventListener('load', function () { sMeasure(); sApply(); });
  }

  /* ---------- numbered accordions: single-open + image swap ---------- */
  document.querySelectorAll('.nacc').forEach(function (acc) {
    var items = acc.querySelectorAll('details');
    var swapTargets = null;
    var mediaSel = acc.dataset.media;
    if (mediaSel) {
      var media = document.querySelector(mediaSel);
      if (media) swapTargets = media.querySelectorAll('.swap');
    }
    items.forEach(function (d, i) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
        if (swapTargets) {
          swapTargets.forEach(function (im, k) { im.classList.toggle('active', k === i); });
        }
      });
    });
  });

  /* ---------- portfolio filter + bloom-style row rhythm (2/3/2/3…) ---------- */
  var grid = document.querySelector('[data-portfolio]');
  if (grid) {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll('.ph[data-cat]'));
    var chips = document.querySelectorAll('.filters .chip');
    var cat = 'all';
    function layout() {
      var vis = tiles.filter(function (t) {
        return cat === 'all' || (t.dataset.cat || '').split('|').indexOf(cat) !== -1;
      });
      tiles.forEach(function (t) { if (t.parentNode) t.parentNode.removeChild(t); });
      Array.prototype.slice.call(grid.querySelectorAll('.mosaic')).forEach(function (r) { r.remove(); });
      grid.classList.add('pf-rows');
      var i = 0, three = false;
      while (i < vis.length) {
        var left = vis.length - i;
        var n = three ? 3 : 2;
        if (left <= 2) n = left;                 // finish with a clean 2-col row
        else if (n === 3 && left === 4) n = 2;   // avoid a dangling single tile
        var row = document.createElement('div');
        row.className = 'mosaic mosaic-' + (n === 3 ? 3 : 2);
        for (var k = 0; k < n && i < vis.length; k++, i++) row.appendChild(vis[i]);
        grid.appendChild(row);
        three = !three;
      }
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        cat = chip.dataset.cat;
        layout();
      });
    });
    layout();
  }

  /* ---------- contact form → prefilled mailto (works from file://) ---------- */
  var cform = document.querySelector('.cform');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { var f = cform.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ''; };
      var en = document.body.classList.contains('en');
      var subject = (en ? 'Inquiry — ' : 'Užklausa — ') + v('subject');
      var body = v('message') + '\n\n' + v('name') + (v('company') ? ', ' + v('company') : '') + '\n' + v('email');
      window.location.href = 'mailto:info@atamis.lt?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
