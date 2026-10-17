// Chibi bride & groom mascots built from pose sprites: a run-meet-hug loop above the toolbar,
// a thank-you scene after a guest sends a wish or RSVP, and an ending scene at the bottom.
(function () {
  var app = document.getElementById('app-view-index');
  if (!app) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // <div class="mascot ..."><div class="mascot-flip"><img class="mascot-img"></div></div>
  // translate goes on the outer box, mirroring on .mascot-flip, bobbing on the img
  function sprite(pose, cls) {
    var box = document.createElement('div');
    box.className = 'mascot ' + (cls || '');
    var flip = document.createElement('div');
    flip.className = 'mascot-flip';
    var img = document.createElement('img');
    img.className = 'mascot-img';
    img.src = 'assets/mascot/' + pose + '.webp';
    img.alt = '';
    img.draggable = false;
    flip.appendChild(img);
    box.appendChild(flip);
    return box;
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  function hearts(parent, count, spread) {
    for (var i = 0; i < count; i++) {
      var h = el('span', 'mascot-heart', '❤');
      h.style.left = (50 + (Math.random() - 0.5) * spread) + '%';
      h.style.animationDelay = (Math.random() * 1.2) + 's';
      h.style.fontSize = (12 + Math.random() * 14) + 'px';
      parent.appendChild(h);
    }
  }
  function move(node, fromX, toX, ms, easing) {
    return node.animate([{ transform: 'translateX(' + fromX + 'px)' }, { transform: 'translateX(' + toX + 'px)' }],
      { duration: ms, easing: easing || 'linear', fill: 'forwards' });
  }
  function show(node, on) { node.style.visibility = on ? 'visible' : 'hidden'; }

  // ---------- 1. Run, meet, hug, run off — above the toolbar ----------
  var lane = el('div', 'mascot-lane');
  lane.setAttribute('aria-hidden', 'true');
  var gRun = sprite('groom-run', 'running'), bRun = sprite('bride-run', 'running');
  var hug = sprite('pair-hug', 'pair');
  var meetHeart = el('span', 'mascot-meet-heart', '❤');
  [bRun, gRun, hug, meetHeart].forEach(function (n) { lane.appendChild(n); show(n, false); });
  app.appendChild(lane);

  var busy = false;
  function runOnce() {
    if (busy || document.hidden) return;
    busy = true;
    var W = lane.clientWidth, cx = W / 2;
    var gw = gRun.offsetWidth, bw = bRun.offsetWidth, hw = hug.offsetWidth;
    // meet in the middle: groom from the left, bride from the right (mirrored to face left)
    bRun.classList.add('mirrored');
    show(gRun, true); show(bRun, true);
    move(gRun, -gw, cx - gw + 12, 2000, 'ease-out');
    move(bRun, W, cx - 12, 2000, 'ease-out');
    setTimeout(function () {
      show(gRun, false); show(bRun, false);
      hug.style.transform = 'translateX(' + (cx - hw / 2) + 'px)';
      show(hug, true); hug.classList.add('pop');
      show(meetHeart, true); meetHeart.classList.add('pop');
    }, 2000);
    // run off together to the right, bride following behind the groom
    setTimeout(function () {
      show(hug, false); hug.classList.remove('pop');
      show(meetHeart, false); meetHeart.classList.remove('pop');
      bRun.classList.remove('mirrored');
      show(gRun, true); show(bRun, true);
      move(gRun, cx - gw / 2 + 20, W + bw + 10, 2300, 'ease-in');
      move(bRun, cx - gw / 2 - bw * 0.75, W + 10, 2300, 'ease-in');
    }, 3900);
    setTimeout(function () { show(gRun, false); show(bRun, false); busy = false; }, 6300);
  }
  if (!reduced && !window.WEDDING_EDIT_MODE) {
    if (window.WEDDING_GATE_OPEN === false) document.addEventListener('wedding:opened', function () { setTimeout(runOnce, 2500); });
    else setTimeout(runOnce, 2500);
    setInterval(runOnce, 40000);
  }

  // ---------- 2. Thank-you scene after a wish / RSVP ----------
  var thanks = el('div', 'mascot-thanks',
    '<div class="mascot-thanks-stage"><p class="mascot-thanks-text">Thank You for Celebrating With Us!</p>' +
    '<div class="mascot-thanks-hearts"></div></div>');
  var tStage = thanks.querySelector('.mascot-thanks-stage');
  var tGroom = sprite('groom-run', 'running in-left'), tBride = sprite('bride-run', 'running mirrored in-right');
  var tPair = sprite('pair-thanks', 'pair together');
  [tGroom, tBride, tPair].forEach(function (n) { tStage.appendChild(n); });
  document.body.appendChild(thanks);
  var thanksTimers = [];
  function showThanks() {
    thanksTimers.forEach(clearTimeout);
    var box = thanks.querySelector('.mascot-thanks-hearts');
    box.textContent = '';
    thanks.classList.remove('show', 'met');
    void thanks.offsetWidth; // restart the CSS animations
    thanks.classList.add('show');
    thanksTimers = [
      setTimeout(function () { thanks.classList.add('met'); hearts(box, 14, 70); }, 950),
      setTimeout(function () { thanks.classList.remove('show', 'met'); }, 5600)
    ];
  }
  thanks.addEventListener('click', function () { thanks.classList.remove('show', 'met'); });
  document.addEventListener('wedding:thanks', showThanks);
  window.showMascotThanks = showThanks;

  // ---------- 3. Ending scene at the bottom of the invitation ----------
  var root = document.getElementById('root-page-container');
  var scroller = root && root.parentNode;
  if (!scroller) return;
  var ending = el('section', 'mascot-ending',
    '<p class="mascot-ending-kicker">Thank you</p>' +
    '<p class="mascot-ending-text">Cảm ơn bạn đã ghé thăm thiệp cưới của chúng mình.<br/>Hẹn gặp bạn ngày 25.10.2026 nhé!</p>' +
    '<div class="mascot-ending-stage"><div class="mascot-ending-float"></div></div>');
  var eStage = ending.querySelector('.mascot-ending-stage');
  var eGroom = sprite('groom-run', 'running in-left'), eBride = sprite('bride-run', 'running mirrored in-right');
  var eJump = sprite('pair-jump', 'pair together jump'), eWave = sprite('pair-wave', 'pair together waving');
  [eGroom, eBride, eJump, eWave].forEach(function (n) { eStage.appendChild(n); });
  var floaters = ending.querySelector('.mascot-ending-float');
  ['❤', '🌸', '❤', '🌷', '❤', '🌸', '❤', '🌼', '❤', '🌸'].forEach(function (c, i) {
    var f = el('span', 'mascot-floater', c);
    f.style.left = (5 + i * 9.5) + '%';
    f.style.animationDelay = (i * 0.45) + 's';
    f.style.animationDuration = (4 + (i % 3)) + 's';
    floaters.appendChild(f);
  });
  scroller.appendChild(ending);
  var endTimers = [], swap = null;
  function playEnding() {
    endTimers.forEach(clearTimeout); clearInterval(swap);
    ending.classList.remove('play', 'met', 'wave');
    void ending.offsetWidth;
    ending.classList.add('play');
    endTimers = [setTimeout(function () {
      ending.classList.add('met');
      swap = setInterval(function () { ending.classList.toggle('wave'); }, 2600);
    }, 1500)];
  }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) playEnding();
      else { clearInterval(swap); }
    });
  }, { root: scroller, threshold: 0.45 }).observe(eStage);
})();
