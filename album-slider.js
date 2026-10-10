// Album section appended after the invitation canvas: swipeable slider,
// thumbnail strip and a fullscreen lightbox (also used by the desktop panel).
(function () {
  var photos = window.ALBUM_PHOTOS || [];
  if (!photos.length) return;
  var large = function (p) { return 'assets/album/large/' + p.name + '.jpg'; };
  var thumb = function (p) { return 'assets/album/thumb/' + p.name + '.jpg'; };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  // ---------- Lightbox ----------
  var lb = el('div', 'album-lightbox', '<button class="lb-close" aria-label="Đóng">&times;</button>' +
    '<button class="lb-nav lb-prev" aria-label="Ảnh trước">&#8249;</button>' +
    '<img class="lb-img" alt=""/>' +
    '<button class="lb-nav lb-next" aria-label="Ảnh sau">&#8250;</button>' +
    '<div class="lb-count"></div>');
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('.lb-img'), lbCount = lb.querySelector('.lb-count'), lbIndex = 0;

  function lbShow(i) {
    lbIndex = (i + photos.length) % photos.length;
    lbImg.src = large(photos[lbIndex]);
    lbCount.textContent = (lbIndex + 1) + ' / ' + photos.length;
    new Image().src = large(photos[(lbIndex + 1) % photos.length]); // preload next
  }
  function lbOpen(i) { lbShow(i || 0); lb.classList.add('open'); document.body.classList.add('lb-lock'); }
  function lbClose() { lb.classList.remove('open'); document.body.classList.remove('lb-lock'); }
  window.openAlbumLightbox = lbOpen;

  lb.querySelector('.lb-close').onclick = lbClose;
  lb.querySelector('.lb-prev').onclick = function () { lbShow(lbIndex - 1); };
  lb.querySelector('.lb-next').onclick = function () { lbShow(lbIndex + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // ---------- Slider section ----------
  var root = document.getElementById('root-page-container');
  if (!root) return;
  var section = el('section', 'album-section',
    '<p class="album-kicker">Our moments</p>' +
    '<h2 class="album-title">Album ảnh cưới</h2>' +
    '<div class="album-stage">' +
    '  <div class="album-track"></div>' +
    '  <button class="album-nav album-prev" aria-label="Ảnh trước">&#8249;</button>' +
    '  <button class="album-nav album-next" aria-label="Ảnh sau">&#8250;</button>' +
    '  <div class="album-count"></div>' +
    '</div>' +
    '<div class="album-thumbs"></div>' +
    '<button class="album-all">Xem toàn màn hình</button>');
  root.parentNode.insertBefore(section, root.nextSibling);

  var track = section.querySelector('.album-track');
  var thumbs = section.querySelector('.album-thumbs');
  var count = section.querySelector('.album-count');
  photos.forEach(function (p, i) {
    var slide = el('div', 'album-slide');
    var img = el('img');
    img.src = large(p);
    img.loading = 'lazy';
    img.alt = 'Ảnh cưới ' + (i + 1);
    if (p.w > p.h) {
      img.className = 'landscape';
      slide.className += ' blur-bg';
      slide.style.backgroundImage = 'url(' + thumb(p) + ')';
    }
    slide.appendChild(img);
    slide.onclick = function () { lbOpen(i); };
    track.appendChild(slide);

    var t = el('button', 'album-thumb');
    t.style.backgroundImage = 'url(' + thumb(p) + ')';
    t.setAttribute('aria-label', 'Ảnh ' + (i + 1));
    t.onclick = function () { stopAuto(); go(i); };
    thumbs.appendChild(t);
  });

  var current = 0;
  function go(i) {
    i = (i + photos.length) % photos.length;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }
  function update() {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i === current && count.textContent) return;
    current = i;
    count.textContent = (i + 1) + ' / ' + photos.length;
    Array.prototype.forEach.call(thumbs.children, function (t, k) { t.classList.toggle('active', k === i); });
    var active = thumbs.children[i];
    thumbs.scrollTo({ left: active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
  }
  track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
  section.querySelector('.album-prev').onclick = function () { stopAuto(); go(current - 1); };
  section.querySelector('.album-next').onclick = function () { stopAuto(); go(current + 1); };
  section.querySelector('.album-all').onclick = function () { lbOpen(current); };
  update();

  // Autoplay only while the slider is on screen; any manual interaction stops it
  var timer = null, stopped = false;
  function stopAuto() { stopped = true; clearInterval(timer); }
  track.addEventListener('touchstart', stopAuto, { passive: true });
  track.addEventListener('wheel', stopAuto, { passive: true });
  new IntersectionObserver(function (entries) {
    clearInterval(timer);
    if (entries[0].isIntersecting && !stopped) timer = setInterval(function () { go(current + 1); }, 3500);
  }, { threshold: 0.5 }).observe(track);
})();
