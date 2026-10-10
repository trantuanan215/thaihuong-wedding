// Hand-drawn venue map: replaces the Google Maps iframe in the invitation and
// opens a larger popup with step-by-step directions + a Google Maps link.
(function () {
  var MAPS_URL = 'https://maps.app.goo.gl/6CQRCgEmYkjHk59W8?g_st=ic';

  // North-up schematic around Trường Ân (not to scale). viewBox matches the 356x218 card box.
  var SVG =
    '<svg class="vmap" viewBox="0 0 356 218" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sơ đồ đường tới nhà trai">' +
    '<defs><filter id="vmShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".25"/></filter></defs>' +
    '<rect width="356" height="218" fill="#faf6f2"/>' +
    // river bank + river
    '<path d="M0 0H70C58 50 70 95 92 140S108 200 112 218H0Z" fill="#e4f2e3"/>' +
    '<path d="M38 0H82C70 50 84 92 104 138S122 196 128 218H86C82 196 72 170 58 140S28 52 38 0Z" fill="#bfe1ee"/>' +
    '<text class="vm-river" transform="translate(56 150) rotate(-72)">Sông Vàm Cỏ Đông</text>' +
    // side streets
    '<g stroke="#e9e1dc" stroke-width="3" fill="none" stroke-linecap="round">' +
    '<path d="M186 100H300"/><path d="M182 170H330"/><path d="M178 205H356"/><path d="M230 0V60"/><path d="M300 100L330 218"/>' +
    '<path d="M186 30L120 50"/><path d="M184 118L120 112"/></g>' +
    // Nguyễn Lương Bằng (diagonal) and QL22B
    '<path d="M186 136L356 20" stroke="#ddd3cf" stroke-width="7" stroke-linecap="round"/>' +
    '<text class="vm-street" transform="translate(214 116) rotate(-34)">Nguyễn Lương Bằng</text>' +
    '<path d="M176 218L186 66Q190 30 160 0" stroke="#d6cbc7" stroke-width="11" fill="none" stroke-linecap="round"/>' +
    '<path d="M176 218L186 66Q190 30 160 0" stroke="#fff" stroke-width="1" stroke-dasharray="4 5" fill="none"/>' +
    '<g transform="translate(160 186)"><rect x="-15" y="-7" width="30" height="13" rx="3" fill="#2f6db5"/><text class="vm-badge" y="3">QL22B</text></g>' +
    // alley to the house
    '<path d="M186 62H252" stroke="#e2d8d4" stroke-width="5" stroke-linecap="round"/>' +
    // route
    '<path class="vm-route" d="M176 218L186 66Q187 62 192 62H246" fill="none"/>' +
    // landmarks
    '<g class="vm-poi"><circle cx="158" cy="16" r="4.5"/><text x="150" y="19" text-anchor="end">Thánh thất Trường Ân</text></g>' +
    '<g class="vm-poi"><circle cx="134" cy="84" r="4.5"/><text x="128" y="96" text-anchor="end">Đình Trường Ân</text></g>' +
    '<g class="vm-poi vm-red"><circle cx="176" cy="137" r="4.5"/><text x="169" y="135" text-anchor="end">Nhà thuốc</text><text x="169" y="145" text-anchor="end">FPT Long Châu</text></g>' +
    '<g class="vm-poi"><circle cx="196" cy="186" r="4.5"/><text x="204" y="184">Điện thờ Phật Mẫu</text><text x="204" y="194">Trường Ân</text></g>' +
    // turn point + house
    '<circle cx="186" cy="62" r="3.5" fill="#fff" stroke="#b5485a" stroke-width="1.6"/>' +
    '<text class="vm-turn" x="180" y="57" text-anchor="end">1168 QL22B · rẽ phải ➜</text>' +
    '<g class="vm-home" transform="translate(256 60)" filter="url(#vmShadow)">' +
    '<circle r="11" fill="#b5485a"/><path d="M0 5C-6 0-7.5-2.5-6-5.2S-1.5-7.4 0-4.4C1.5-7.4 4.5-7.8 6-5.2S6 0 0 5Z" fill="#fff"/></g>' +
    '<g transform="translate(270 47)"><rect width="78" height="27" rx="6" fill="#fff" stroke="#b5485a" stroke-width=".8"/>' +
    '<text class="vm-home-t" x="39" y="11">Nhà trai · Tư gia</text><text class="vm-home-s" x="39" y="21">Lễ cưới 25.10.2026</text></g>' +
    // compass
    '<g transform="translate(336 196)"><circle r="11" fill="#fff" stroke="#d6cbc7"/><path d="M0-8L3.5 2H-3.5Z" fill="#b5485a"/><text class="vm-n" y="8">N</text></g>' +
    '</svg>';

  var STEPS = [
    'Đi theo <b>Quốc lộ 22B</b>, qua <b>Điện thờ Phật Mẫu Trường Ân</b>.',
    'Qua ngã ba <b>Nguyễn Lương Bằng</b> (góc có <b>Nhà thuốc FPT Long Châu</b>), tiếp tục đi thẳng.',
    'Tới số <b>1168 Quốc lộ 22B</b> thì <b>rẽ phải</b> vào hẻm.',
    'Nhà ở cuối hẻm (biểu tượng ♥). Nếu đã thấy <b>Thánh thất Trường Ân</b> là đi quá một đoạn.'
  ];

  // Popup
  var modal = document.createElement('div');
  modal.className = 'vmap-modal';
  modal.innerHTML =
    '<div class="vmap-dialog" role="dialog" aria-label="Chỉ đường tới nhà trai">' +
    '<button class="vmap-close" aria-label="Đóng">&times;</button>' +
    '<h3>Đường tới nhà trai</h3><p class="vmap-addr">Tư gia · Trường Ân, P. Long Hoa, Tây Ninh</p>' +
    SVG +
    '<ol>' + STEPS.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
    '<a class="vmap-go" target="_blank" rel="noopener" href="' + MAPS_URL + '">Mở Google Maps để định vị</a>' +
    '</div>';
  document.body.appendChild(modal);
  function open() { modal.classList.add('open'); document.body.classList.add('lb-lock'); }
  function close() { modal.classList.remove('open'); document.body.classList.remove('lb-lock'); }
  modal.querySelector('.vmap-close').onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.openVenueMap = open;

  // Swap the iframe inside the invitation canvas for the drawn map
  var box = document.querySelector('.simple-map-container');
  if (!box) return;
  box.innerHTML = SVG + '<span class="vmap-hint">Phóng to · Chỉ đường</span>';
  box.classList.add('vmap-card');
  box.style.pointerEvents = 'auto';
  box.onclick = open;
})();
