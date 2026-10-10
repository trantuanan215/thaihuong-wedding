(function () {
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
  // update the icon immediately on tap; the audio may still be loading on a slow connection
  function setUI(playing) {
    btn.classList.toggle('paused', !playing);
    btn.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
    btn.setAttribute('aria-pressed', String(playing));
  }
  function play() {
    setUI(true);
    var pending = audio.play();
    if (pending) pending.catch(function () { setUI(false); });
  }
  function pause() { audio.pause(); setUI(false); }
  function toggle(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    audio.paused ? play() : pause();
  }
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') toggle(ev); });
  audio.addEventListener('play', function () { setUI(true); });
  audio.addEventListener('pause', function () { setUI(false); });
  setUI(false);
  // Autoplay is usually blocked: start on the first tap/key anywhere, except a tap on the music
  // button itself (its own click handles it; otherwise that tap would start then stop the music).
  // pointerup, not pointerdown: on touch screens the browser grants playback permission on release.
  var pendingAutoplay = audio.play();
  if (pendingAutoplay) pendingAutoplay.then(function () { setUI(true); }, function () {
    function once(ev) {
      document.removeEventListener('pointerup', once, true);
      document.removeEventListener('keydown', once, true);
      if (!btn.contains(ev.target) && audio.paused) play();
    }
    document.addEventListener('pointerup', once, true);
    document.addEventListener('keydown', once, true);
  });

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
  if (scroller) {
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
