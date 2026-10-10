// Theme 2 only: make the template's "Chỉ đường" text and the cover envelope interactive.
(function () {
  function clickable(nid, fn) {
    var node = document.querySelector('[data-node-id="' + nid + '"]');
    if (!node) return;
    node.style.pointerEvents = 'auto';
    node.style.cursor = 'pointer';
    node.addEventListener('click', fn);
  }
  // "CHỈ ĐƯỜNG" opens the hand-drawn venue map
  clickable('MXcj3JAluy', function () { if (window.openVenueMap) window.openVenueMap(); });
  // Cover envelope + "Chạm để mở thiệp": glide to the first photo
  var openCard = function () {
    if (window.stopAutoScroll) window.stopAutoScroll();
    var target = document.querySelector('[data-node-id="rsvOw_oKRb"]');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  clickable('NXo_uTrFXa', openCard);
  clickable('cr7lopk2bC', openCard);
})();
