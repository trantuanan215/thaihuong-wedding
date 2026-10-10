// Theme 2 only: animated cover envelope with our invitation letter, and venue shortcuts.
(function () {
  function node(nid) { return document.querySelector('[data-node-id="' + nid + '"]'); }
  function clickable(el, fn) {
    if (!el) return;
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    el.addEventListener('click', fn);
  }

  // ---------- Cover envelope: tap to open / close ----------
  var envelope = document.querySelector('.envelope-container');
  if (envelope) {
    var letter = envelope.querySelector('.letter');
    letter.innerHTML =
      '<div class="invite-letter">' +
      '  <p class="invite-kicker">Thiệp mời cưới</p>' +
      '  <p class="invite-names">Quốc Thái &amp; Lan Hương</p>' +
      '  <p class="invite-date">25.10.2026</p>' +
      '  <p class="invite-guest">Trân trọng mời Bạn &amp; người thương</p>' +
      '</div>';
    var hint = node('cr7lopk2bC');
    var hintText = hint && hint.querySelector('[contenteditable="false"]');
    var toggle = function () {
      var open = envelope.classList.contains('close');
      envelope.classList.toggle('open', open);
      envelope.classList.toggle('close', !open);
      if (hintText) hintText.textContent = open ? 'Chạm để đóng thiệp' : 'Chạm để mở thiệp';
    };
    clickable(node('FlIA12U-JR'), toggle);
    clickable(hint, toggle);
  }

  // ---------- "CHỈ ĐƯỜNG": hand-drawn venue map popup ----------
  var directions = node('MXcj3JAluy');
  if (directions) directions.classList.add('venue-anchor');
  clickable(directions, function () { if (window.openVenueMap) window.openVenueMap(); });
})();
