// Lazy canvas photos: below-the-fold background images carry data-lazy-bg and are applied when they
// come within ~1.5 screens of the visible area, so the first screen and the music load first.
// Everything left is filled in a few seconds after the page has loaded.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lazy-bg]'));
  function load(el) {
    var v = el.getAttribute('data-lazy-bg');
    if (v == null) return;
    el.removeAttribute('data-lazy-bg');
    if (!el.style.backgroundImage) el.style.backgroundImage = v;
  }
  window.loadLazyBackground = load;
  function loadAll() { items.forEach(load); }
  if (window.WEDDING_EDIT_MODE || !('IntersectionObserver' in window)) return loadAll();

  var root = document.getElementById('root-page-container');
  var scroller = root && root.closest('.styles_customScroll__X5r6w');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
  }, { root: scroller || null, rootMargin: '1400px 0px' });
  items.forEach(function (el) { io.observe(el); });
  window.addEventListener('load', function () { setTimeout(loadAll, 6000); });
})();
