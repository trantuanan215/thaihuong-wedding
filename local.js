(function () {
  // ?edit=1: the page is embedded in the photo admin, so stay still and silent and show everything
  var EDIT = window.WEDDING_EDIT_MODE = /[?&]edit=1\b/.test(location.search);
  var WEDDING = new Date('2026-10-25T11:00:00+07:00');

  // Fit the fixed 500px canvas to narrow screens. transform: scale() instead of CSS zoom because
  // WebKit (iOS Safari / in-app browsers) does not shrink text with zoom, so text overflowed its boxes.
  var root = document.getElementById('root-page-container');
  function fit() {
    var s = Math.min(window.innerWidth, 500) / 500;
    if (s < 1) {
      root.style.transformOrigin = '0 0';
      root.style.transform = 'scale(' + s + ')';
      // the scaled canvas keeps its unscaled layout height, so pull following content up
      root.style.marginBottom = -(root.offsetHeight * (1 - s)) + 'px';
    } else {
      root.style.transform = root.style.transformOrigin = root.style.marginBottom = '';
    }
  }
  fit();
  window.addEventListener('resize', fit);

  // Scroll-reveal for elements the SSR left at opacity:0
  var targets = document.querySelectorAll('[data-transition-key]');
  if (EDIT) Array.prototype.forEach.call(targets, function (t) { t.classList.add('revealed'); });
  var scroller = root.closest('.styles_customScroll__X5r6w') || null;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { root: scroller, threshold: 0.1 });
  targets.forEach(function (el) { io.observe(el); });

  // Background music toggle (browsers require a user gesture to start audio)
  var audio = document.querySelector('audio');
  var btn = document.getElementById('audio-control-wrapper');
  audio.loop = true;
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  // Music is ON by default. The icon follows the guest's intent, not the element state, because
  // browsers block audible autoplay until the first tap: until then the icon shows ON and the
  // first tap anywhere (or on the button) starts the music.
  var musicOn = true;
  function setUI(on) {
    musicOn = on;
    btn.classList.toggle('paused', !on);
    btn.setAttribute('aria-label', on ? 'Tắt nhạc' : 'Bật nhạc');
    btn.setAttribute('aria-pressed', String(on));
  }
  function play() {
    setUI(true);
    var pending = audio.play();
    if (pending) pending.catch(function () {});   // still blocked: keep ON, the next tap retries
  }
  function pause() { audio.pause(); setUI(false); }
  function toggle(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    // ON but silent (autoplay blocked) -> this tap should start the music, not turn it off
    audio.paused ? play() : pause();
  }
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') toggle(ev); });
  setUI(true);
  // First tap/key anywhere starts the music if the guest has not turned it off.
  // pointerup, not pointerdown: on touch screens the browser grants playback permission on release.
  function firstGesture(ev) {
    if (btn.contains(ev.target)) return;            // the button's own click handles it
    if (!audio.paused || !musicOn) return stopListening();
    var pending = audio.play();
    if (pending) pending.then(stopListening, function () {});
    else stopListening();
  }
  function stopListening() {
    document.removeEventListener('pointerup', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
  }
  if (EDIT) setUI(false);
  else {
    document.addEventListener('pointerup', firstGesture, true);
    document.addEventListener('keydown', firstGesture, true);
    var pendingAutoplay = audio.play();
    if (pendingAutoplay) pendingAutoplay.then(stopListening, function () {});
  }

  // Countdown: days / hours / minutes / seconds until the ceremony
  var cd = document.querySelector('.countdown');
  if (cd) {
    var nums = Array.prototype.map.call(cd.children, function (box) { return box.firstElementChild; });
    (function tick() {
      var s = Math.max(0, Math.floor((WEDDING - Date.now()) / 1000));
      var vals = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      nums.forEach(function (n, i) { if (n) n.textContent = vals[i]; });
      if (s > 0) setTimeout(tick, 1000);
    })();
  }

  // Auto-scroll like the original, stopping as soon as the visitor interacts
  if (scroller && !EDIT) {
    var auto = true, last = performance.now();
    window.stopAutoScroll = function () { auto = false; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (t) {
      scroller.addEventListener(t, function () { auto = false; }, { passive: true });
    });
    (function step(now) {
      if (!auto) return;
      scroller.scrollTop += (now - last) * 0.06;
      last = now;
      if (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1) requestAnimationFrame(step);
    })(last);
  }
})();
