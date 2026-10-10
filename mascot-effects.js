// Chibi bride & groom mascots: a running loop above the toolbar, a thank-you scene after a guest
// sends a wish or RSVP, and an ending scene when the guest reaches the bottom of the invitation.
(function () {
  var app = document.getElementById('app-view-index');
  if (!app) return;
  var GROOM = 'assets/mascot/thai.webp', BRIDE = 'assets/mascot/huong.webp';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  function mascot(src, cls) {
    var wrap = el('div', 'mascot ' + cls);
    var img = el('img', 'mascot-img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    wrap.appendChild(img);
    return wrap;
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

  // ---------- 1. Running loop above the toolbar ----------
  var lane = el('div', 'mascot-lane');
  lane.setAttribute('aria-hidden', 'true');
  var groom = mascot(GROOM, 'groom'), bride = mascot(BRIDE, 'bride');
  var meetHeart = el('span', 'mascot-meet-heart', '❤');
  lane.appendChild(bride); lane.appendChild(groom); lane.appendChild(meetHeart);
  app.appendChild(lane);

  function runOnce() {
    if (document.hidden) return;
    var W = lane.clientWidth, gw = groom.offsetWidth, bw = bride.offsetWidth, cx = W / 2;
    var opts = { duration: 7000, easing: 'linear', fill: 'both' };
    lane.classList.add('running');
    // groom leads from the left, waits in the middle, then both leave to the right
    groom.animate([
      { transform: 'translateX(' + (-gw) + 'px)', offset: 0 },
      { transform: 'translateX(' + (cx - gw - 2) + 'px)', offset: 0.32 },
      { transform: 'translateX(' + (cx - gw - 2) + 'px)', offset: 0.68 },
      { transform: 'translateX(' + (W + bw + 10) + 'px)', offset: 1 }
    ], opts);
    bride.animate([
      { transform: 'translateX(' + (-bw) + 'px)', offset: 0 },
      { transform: 'translateX(' + (-bw) + 'px)', offset: 0.06 },
      { transform: 'translateX(' + (cx + 2) + 'px)', offset: 0.4 },
      { transform: 'translateX(' + (cx + 2) + 'px)', offset: 0.68 },
      { transform: 'translateX(' + (W + 20) + 'px)', offset: 1 }
    ], opts);
    meetHeart.animate([
      { opacity: 0, transform: 'translate(-50%, 10px) scale(.2)', offset: 0 },
      { opacity: 0, transform: 'translate(-50%, 10px) scale(.2)', offset: 0.4 },
      { opacity: 1, transform: 'translate(-50%, -6px) scale(1.25)', offset: 0.46 },
      { opacity: 1, transform: 'translate(-50%, -10px) scale(1)', offset: 0.62 },
      { opacity: 0, transform: 'translate(-50%, -30px) scale(.8)', offset: 0.7 },
      { opacity: 0, transform: 'translate(-50%, -30px) scale(.8)', offset: 1 }
    ], opts).onfinish = function () { lane.classList.remove('running'); };
  }
  if (!reduced) {
    setTimeout(runOnce, 2500);
    setInterval(runOnce, 40000);
  }

  // ---------- 2. Thank-you scene after a wish / RSVP ----------
  var thanks = el('div', 'mascot-thanks',
    '<div class="mascot-thanks-stage"><p class="mascot-thanks-text">Thank You for Celebrating With Us!</p>' +
    '<div class="mascot-thanks-hearts"></div></div>');
  var stage = thanks.querySelector('.mascot-thanks-stage');
  stage.appendChild(mascot(GROOM, 'groom'));
  stage.appendChild(mascot(BRIDE, 'bride'));
  document.body.appendChild(thanks);
  var thanksTimer = null;
  function showThanks() {
    var box = thanks.querySelector('.mascot-thanks-hearts');
    box.textContent = '';
    hearts(box, 14, 70);
    thanks.classList.remove('show');
    void thanks.offsetWidth; // restart the CSS animations
    thanks.classList.add('show');
    clearTimeout(thanksTimer);
    thanksTimer = setTimeout(function () { thanks.classList.remove('show'); }, 5200);
  }
  thanks.addEventListener('click', function () { thanks.classList.remove('show'); });
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
  var endStage = ending.querySelector('.mascot-ending-stage');
  endStage.appendChild(mascot(GROOM, 'groom'));
  endStage.appendChild(mascot(BRIDE, 'bride'));
  var floaters = ending.querySelector('.mascot-ending-float');
  ['❤', '🌸', '❤', '🌷', '❤', '🌸', '❤', '🌼', '❤', '🌸'].forEach(function (c, i) {
    var f = el('span', 'mascot-floater', c);
    f.style.left = (5 + i * 9.5) + '%';
    f.style.animationDelay = (i * 0.45) + 's';
    f.style.animationDuration = (4 + (i % 3)) + 's';
    floaters.appendChild(f);
  });
  scroller.appendChild(ending);
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        ending.classList.remove('play');
        void ending.offsetWidth;
        ending.classList.add('play');
      }
    });
  }, { root: scroller, threshold: 0.45 }).observe(endStage);
})();
