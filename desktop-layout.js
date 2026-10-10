// Desktop version: a full-height photo panel beside the invitation card.
// Hidden by CSS below 1024px, so mobile keeps the plain card.
(function () {
  var container = document.querySelector('.pc-container');
  var card = document.querySelector('.pc-content');
  if (!container || !card) return;

  var hero = document.createElement('aside');
  hero.className = 'desktop-hero';
  hero.innerHTML =
    '<div class="hero-slides"></div>' +
    '<div class="hero-shade"></div>' +
    '<div class="hero-content">' +
    '  <p class="hero-kicker">Wedding Invitation</p>' +
    '  <h1 class="hero-names"><b>Quốc Thái</b> <span>&amp;</span> <b>Lan Hương</b></h1>' +
    '  <div class="hero-date">' +
    '    <span>Chủ Nhật</span><strong>25 · 10 · 2026</strong><span>11:00 AM</span>' +
    '  </div>' +
    '  <p class="hero-lunar">Nhằm ngày 16 tháng 09 năm Bính Ngọ</p>' +
    '  <p class="hero-venue">Tư gia · Trường Ân · P. Long Hoa · Tây Ninh</p>' +
    '  <div class="hero-actions">' +
    '    <button class="hero-btn hero-album">Xem album ảnh</button>' +
    '    <button class="hero-btn ghost hero-map">Chỉ đường</button>' +
    '  </div>' +
    '</div>';
  container.insertBefore(hero, card);
  container.classList.add('has-desktop-hero');

  // Crossfade through the landscape shots
  var slides = hero.querySelector('.hero-slides');
  var names = window.ALBUM_HERO || [];
  names.forEach(function (n, i) {
    var s = document.createElement('div');
    s.className = 'hero-slide' + (i === 0 ? ' on' : '');
    s.style.backgroundImage = 'url(assets/album/large/' + n + '.jpg)';
    slides.appendChild(s);
  });
  var idx = 0;
  if (names.length > 1) {
    setInterval(function () {
      slides.children[idx].classList.remove('on');
      idx = (idx + 1) % names.length;
      slides.children[idx].classList.add('on');
    }, 6000);
  }

  hero.querySelector('.hero-map').onclick = function () {
    if (window.openVenueMap) window.openVenueMap();
  };

  hero.querySelector('.hero-album').onclick = function () {
    if (window.openAlbumLightbox) window.openAlbumLightbox(0);
  };
})();
