// Bottom toolbar behaviour: heart burst, jump to gift QR / RSVP form, show-hide guest messages.
(function () {
  var app = document.getElementById('app-view-index');
  if (!app) return;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function jumpTo(target, after) {
    if (!target) return;
    if (window.stopAutoScroll) window.stopAutoScroll();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (after) setTimeout(after, 700);
  }
  function icon(paths) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    paths.forEach(function (d) {
      var p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  }

  // ---------- "Bắn tim": burst of floating hearts from the button ----------
  var layer = document.createElement('div');
  layer.className = 'heart-layer';
  app.appendChild(layer);
  var COLORS = ['#ff4969', '#ff6f91', '#ff8fab', '#e63950', '#ffb3c6', '#d6336c'];
  var HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';

  function burst(from) {
    var a = app.getBoundingClientRect(), b = from.getBoundingClientRect();
    var x0 = b.left + b.width / 2 - a.left, y0 = b.top - a.top;
    for (var i = 0; i < 16; i++) {
      var size = 14 + Math.random() * 22;
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'flying-heart');
      svg.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (x0 - size / 2) + 'px;top:' + (y0 - size / 2) + 'px';
      var p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', HEART);
      p.setAttribute('fill', COLORS[i % COLORS.length]);
      svg.appendChild(p);
      layer.appendChild(svg);

      var rise = 260 + Math.random() * Math.min(340, y0 - 40);
      var drift = (Math.random() - 0.5) * 260, sway = (Math.random() - 0.5) * 60;
      var rot = (Math.random() - 0.5) * 70;
      var anim = svg.animate([
        { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + (drift * 0.3 + sway) + 'px,' + (-rise * 0.35) + 'px) scale(1.1) rotate(' + rot / 2 + 'deg)', opacity: 1, offset: 0.25 },
        { transform: 'translate(' + (drift * 0.7 - sway) + 'px,' + (-rise * 0.75) + 'px) scale(1) rotate(' + rot + 'deg)', opacity: 0.9, offset: 0.7 },
        { transform: 'translate(' + drift + 'px,' + (-rise) + 'px) scale(.8) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 1600 + Math.random() * 1200, delay: Math.random() * 250, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'both' });
      anim.onfinish = (function (n) { return function () { n.remove(); }; })(svg);
    }
  }
  var shoot = document.getElementById('animation-gift-preview-btn');
  if (shoot) {
    shoot.title = 'Bắn tim';
    shoot.setAttribute('aria-label', 'Bắn tim');
    shoot.addEventListener('click', function () { burst(shoot); });
  }

  // ---------- Gift button: jump to the wedding-gift QR card ----------
  var gift = document.getElementById('cinelove-gift-button');
  var qrImage = document.querySelector('.gift-qr-image');
  var qrCard = qrImage && qrImage.closest('[data-node-id]');
  if (gift) {
    // The gift-box slot becomes a directions shortcut: inline map on theme 1, venue + map popup on theme 2
    gift.className = 'map-shortcut';
    gift.title = 'Chỉ đường';
    gift.setAttribute('role', 'button');
    gift.setAttribute('aria-label', 'Chỉ đường');
    gift.appendChild(icon(['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z']));
    gift.addEventListener('click', function () {
      var mapCard = document.querySelector('.vmap-card');
      if (mapCard) return jumpTo(mapCard);
      jumpTo(document.querySelector('.venue-anchor'), window.openVenueMap);
    });

    // Red-envelope shortcut next to the gift box, also jumping to the QR card
    var envelope = document.createElement('div');
    envelope.className = 'money-shortcut';
    envelope.title = 'Gửi tiền mừng';
    envelope.setAttribute('role', 'button');
    envelope.setAttribute('aria-label', 'Gửi tiền mừng');
    envelope.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="4" y="2.5" width="16" height="19" rx="2.2" fill="#d62f45"/>' +
      '<path d="M4 4.7C4 3.5 5 2.5 6.2 2.5h11.6c1.2 0 2.2 1 2.2 2.2V7l-8 4.2L4 7Z" fill="#b51f35"/>' +
      '<circle cx="12" cy="11" r="3.4" fill="#f7c948"/>' +
      '<text x="12" y="12.9" text-anchor="middle" font-size="5.2" font-weight="700" fill="#b51f35" font-family="Arial">₫</text>' +
      '<path d="M8 17h8M9.5 19h5" stroke="#f7c948" stroke-width="1" stroke-linecap="round"/></svg>';
    envelope.addEventListener('click', function () { jumpTo(qrCard); });
    gift.parentNode.insertBefore(envelope, gift);
  }

  // ---------- Like button -> RSVP shortcut ----------
  var like = document.getElementById('cinelove-like-button');
  var rsvpName = document.querySelector('input[name="rsvp-name"]');
  if (like) {
    like.className = 'rsvp-shortcut';
    like.title = 'Xác nhận tham dự';
    like.setAttribute('aria-label', 'Xác nhận tham dự');
    like.textContent = '';
    like.appendChild(icon(['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm9 16 2 2 4-4']));
    like.addEventListener('click', function () {
      jumpTo(rsvpName && rsvpName.form, function () { if (rsvpName) rsvpName.focus({ preventScroll: true }); });
    });
  }

  // ---------- Pill button: show / hide floating guest messages ----------
  var toggle = document.querySelector('.toolbar-toggle-button');
  var box = document.getElementById('blessing-box');
  if (toggle && box) {
    var oldIcon = toggle.querySelector('.icon-svg');
    var closeIcon = icon(['M18 6 6 18', 'm6 6 12 12']);
    var chatIcon = icon(['M21 11.5a8.4 8.4 0 0 1-9 8.3 9 9 0 0 1-3.6-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3.2a8.4 8.4 0 0 1 9 8.3z']);
    [closeIcon, chatIcon].forEach(function (n) { n.setAttribute('class', 'icon-svg'); });
    var hidden = false;
    try { hidden = localStorage.getItem('gb-hidden') === '1'; } catch (e) {}
    function render() {
      box.classList.toggle('gb-hidden', hidden);
      var current = toggle.querySelector('.icon-svg');
      current.parentNode.replaceChild(hidden ? chatIcon : closeIcon, current);
      toggle.setAttribute('aria-label', hidden ? 'Hiện lời chúc' : 'Ẩn lời chúc');
      toggle.title = hidden ? 'Hiện lời chúc' : 'Ẩn lời chúc';
    }
    if (oldIcon) render();
    toggle.addEventListener('click', function () {
      hidden = !hidden;
      try { localStorage.setItem('gb-hidden', hidden ? '1' : '0'); } catch (e) {}
      render();
    });
  }
})();
