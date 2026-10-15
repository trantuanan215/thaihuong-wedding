// Wedding-gift QR codes for the groom and the bride, side by side in the card's QR frame.
// Tapping one opens it large with copy-account and save-image actions.
(function () {
  var GIFTS = [
    { role: 'Chú rể', name: 'Nguyễn Quốc Thái', bank: 'ACB', account: '34628747',
      code: 'assets/qr/qr-thai-code.jpg', card: 'assets/qr/qr-thai-cropped.jpg', file: 'qr-mung-cuoi-nguyen-quoc-thai.jpg' },
    { role: 'Cô dâu', name: 'Trần Thị Lan Hương', bank: 'MSB', account: '04101017748719',
      code: 'assets/qr/qr-huong-code.jpg', card: 'assets/qr/qr-huong-cropped.jpg', file: 'qr-mung-cuoi-tran-thi-lan-huong.jpg' }
  ];
  // the single-QR slot of each theme is widened to fit two codes (canvas px)
  var GEOMETRY = { 'YMjUyf_ZYA': { left: '112px', width: '284px' }, 'xpY8BPcCJh': { left: '95px', width: '310px', height: '200px' } };

  var host = document.querySelector('.gift-qr-image');
  if (!host) return;
  var node = host.closest('[style*="position:absolute"]');

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  // ---------- two codes in the card ----------
  var geo = node && GEOMETRY[node.getAttribute('data-node-id')];
  if (geo) Object.keys(geo).forEach(function (k) { node.style[k] = geo[k]; });
  host.style.backgroundImage = 'none';
  // theme 2 keeps the template's single QR in an inner layer, and pulses the whole frame
  Array.prototype.forEach.call(host.querySelectorAll('.photo-bg-wrap'), function (w) { w.style.display = 'none'; });
  if (host.parentNode) host.parentNode.style.animation = 'none';
  var pair = el('div', 'qr-pair');
  GIFTS.forEach(function (g, i) {
    var card = el('button', 'qr-card');
    card.type = 'button';
    card.setAttribute('aria-label', 'Phóng to mã QR mừng cưới ' + g.role.toLowerCase() + ' ' + g.name);
    var img = el('img');
    img.src = g.code;
    img.alt = 'Mã QR ' + g.bank + ' - ' + g.name;
    card.appendChild(img);
    card.appendChild(el('span', 'qr-role', g.role));
    card.appendChild(el('span', 'qr-name', g.name));
    card.addEventListener('click', function (e) { e.stopPropagation(); open(i); });
    pair.appendChild(card);
  });
  host.appendChild(pair);
  // the canvas wrappers disable pointer events; re-enable them on the QR block only
  [host, host.parentNode, node].forEach(function (n) { if (n) n.style.pointerEvents = 'auto'; });

  // ---------- zoom popup ----------
  var modal = el('div', 'qr-modal');
  var dialog = el('div', 'qr-dialog');
  dialog.setAttribute('role', 'dialog');
  var closeBtn = el('button', 'qr-close', '×');
  closeBtn.setAttribute('aria-label', 'Đóng');
  var title = el('h3', null, 'Mừng cưới');
  var who = el('p', 'qr-who');
  var big = el('img');
  var bankLine = el('p', 'qr-bank');
  var actions = el('div', 'qr-actions');
  var copyBtn = el('button', 'qr-copy', 'Sao chép số TK');
  var saveLink = el('a', 'qr-save', 'Lưu ảnh QR');
  actions.appendChild(copyBtn); actions.appendChild(saveLink);
  [closeBtn, title, who, big, bankLine, actions].forEach(function (n) { dialog.appendChild(n); });
  modal.appendChild(dialog);
  document.body.appendChild(modal);

  var current = GIFTS[0];
  function open(i) {
    current = GIFTS[i];
    who.textContent = current.role + ' · ' + current.name;
    big.src = current.card;
    big.alt = 'Mã QR chuyển khoản ' + current.bank + ' - ' + current.name + ' - ' + current.account;
    bankLine.textContent = 'Ngân hàng ' + current.bank + ' · STK ';
    bankLine.appendChild(el('b', null, current.account));
    saveLink.href = current.card;
    saveLink.setAttribute('download', current.file);
    copyBtn.textContent = 'Sao chép số TK';
    modal.classList.add('open'); document.body.classList.add('lb-lock');
  }
  function close() { modal.classList.remove('open'); document.body.classList.remove('lb-lock'); }
  closeBtn.onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  copyBtn.onclick = function () {
    var acc = current.account;
    var done = function () { copyBtn.textContent = 'Đã sao chép ✓'; setTimeout(function () { copyBtn.textContent = 'Sao chép số TK'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(acc).then(done, function () { prompt('Số tài khoản:', acc); });
    else prompt('Số tài khoản:', acc);
  };
})();
