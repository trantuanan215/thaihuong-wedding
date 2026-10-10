// Tap the wedding-gift QR in the card to open it large, with save + copy-account actions.
(function () {
  var ACCOUNT = '34628747';
  var IMG = 'assets/qr/qr-thai-cropped.jpg';
  var qr = document.querySelector('.gift-qr-image');
  if (!qr) return;

  var modal = document.createElement('div');
  modal.className = 'qr-modal';
  modal.innerHTML =
    '<div class="qr-dialog" role="dialog" aria-label="Mã QR mừng cưới">' +
    '<button class="qr-close" aria-label="Đóng">&times;</button>' +
    '<h3>Mừng cưới</h3>' +
    '<img src="' + IMG + '" alt="Mã QR chuyển khoản ACB - Nguyễn Quốc Thái - 34628747"/>' +
    '<p class="qr-bank">Ngân hàng ACB · STK <b>' + ACCOUNT + '</b></p>' +
    '<div class="qr-actions">' +
    '  <button class="qr-copy">Sao chép số TK</button>' +
    '  <a class="qr-save" href="' + IMG + '" download="qr-mung-cuoi-nguyen-quoc-thai.jpg">Lưu ảnh QR</a>' +
    '</div></div>';
  document.body.appendChild(modal);

  function open() { modal.classList.add('open'); document.body.classList.add('lb-lock'); }
  function close() { modal.classList.remove('open'); document.body.classList.remove('lb-lock'); }
  modal.querySelector('.qr-close').onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  var copyBtn = modal.querySelector('.qr-copy');
  copyBtn.onclick = function () {
    var done = function () { copyBtn.textContent = 'Đã sao chép ✓'; setTimeout(function () { copyBtn.textContent = 'Sao chép số TK'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(ACCOUNT).then(done, function () { prompt('Số tài khoản:', ACCOUNT); });
    else prompt('Số tài khoản:', ACCOUNT);
  };

  // The canvas wrappers disable pointer events; re-enable them on the QR only
  var node = qr.closest('[style*="position:absolute"]');
  [qr, qr.parentNode, node].forEach(function (n) { if (n) n.style.pointerEvents = 'auto'; });
  qr.style.cursor = 'zoom-in';
  qr.title = 'Bấm để phóng to mã QR';
  qr.addEventListener('click', open);
})();
