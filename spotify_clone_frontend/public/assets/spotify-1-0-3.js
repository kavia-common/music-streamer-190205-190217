(function () {
  'use strict';

  // Add a11y-visible focus ring helper
  function applyFocusVisiblePolyfill() {
    var hadKeyboardEvent = false;
    function onKeyDown(e) {
      var keys = ['Tab', 'Shift', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
      if (keys.indexOf(e.key) !== -1) hadKeyboardEvent = true;
    }
    function onMouseDown() { hadKeyboardEvent = false; }
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('focusin', function (e) {
      if (hadKeyboardEvent) e.target.classList.add('focus-visible');
    });
    document.addEventListener('focusout', function (e) {
      e.target.classList.remove('focus-visible');
    });
  }

  function addClickFeedback() {
    var clickableSelectors = [
      '.btn-accent',
      '.btn-login',
      '.circle-btn',
      '.sb-row-btn',
      '.sec-link',
      '.sb-link'
    ];
    clickableSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.addEventListener('click', function () {
          el.style.transform = 'scale(0.98)';
          el.style.transition = 'transform 100ms ease';
          window.setTimeout(function () { el.style.transform = ''; }, 120);
        });
      });
    });
  }

  function markResponsive() {
    var screen = document.getElementById('screen');
    if (!screen) return;
    function resize() {
      // Keep pixel-perfect at >= 1440, enable fluid width below
      if (window.innerWidth < 1440) {
        screen.style.width = '100%';
      } else {
        screen.style.width = '1440px';
      }
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function validateAssets() {
    // add load/error listeners to images for console diagnostics only
    document.querySelectorAll('img').forEach(function (img) {
      // performance: enable lazy loading for non-critical images
      if (!img.closest('#sidebar .sb-logo')) {
        img.loading = img.loading || 'lazy';
        img.decoding = img.decoding || 'async';
      }
      img.addEventListener('error', function () {
        // Log but do not throw to avoid breaking render
        console.warn('Asset failed to load:', img.src);
      }, { once: true });
    });
  }

  // PUBLIC_INTERFACE
  function initInteractions() {
    applyFocusVisiblePolyfill();
    addClickFeedback();
    markResponsive();
    validateAssets();
  }

  document.addEventListener('DOMContentLoaded', initInteractions);
})();
