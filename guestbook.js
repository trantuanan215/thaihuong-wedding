// Guestbook (sổ lưu bút) + RSVP, stored in Google Sheets through an Apps Script web app.
// The endpoint URL lives in guestbook-config.js. All guest text is rendered with textContent.
(function () {
  var API = (window.GUESTBOOK_API_URL || '').trim();
  var messages = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function store(key, val) {
    try { return val === undefined ? localStorage.getItem(key) : localStorage.setItem(key, val); } catch (e) { return null; }
  }

  // Apps Script accepts a plain-text JSON body, which avoids a CORS preflight.
  function send(payload) {
    if (!API) return Promise.reject(new Error('Chưa kết nối nơi lưu lời chúc.'));
    return fetch(API, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (res) { if (!res.ok) throw new Error(res.error || 'Gửi không thành công'); return res; });
  }
  function load() {
    if (!API) return Promise.resolve([]);
    return fetch(API).then(function (r) { return r.json(); }).then(function (res) { return res.messages || []; });
  }

  // ---------- Guestbook popup ----------
  var modal = el('div', 'gb-modal');
  var dialog = el('div', 'gb-dialog');
  dialog.setAttribute('role', 'dialog');
  var closeBtn = el('button', 'gb-close', '×');
  closeBtn.setAttribute('aria-label', 'Đóng');
  var form = el('form', 'gb-form');
  var nameIn = el('input'); nameIn.placeholder = 'Tên của bạn'; nameIn.maxLength = 50; nameIn.required = true;
  var msgIn = el('textarea'); msgIn.placeholder = 'Gửi lời chúc tới cô dâu chú rể...'; msgIn.maxLength = 500; msgIn.rows = 4; msgIn.required = true;
  var trap = el('input', 'gb-trap'); trap.tabIndex = -1; trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
  var submit = el('button', 'gb-send', 'Gửi lời chúc'); submit.type = 'submit';
  var status = el('p', 'gb-status');
  var list = el('div', 'gb-list');
  nameIn.value = store('gb-name') || '';
  [nameIn, msgIn, trap, submit, status].forEach(function (n) { form.appendChild(n); });
  [closeBtn, el('h3', null, 'Sổ lưu bút'), el('p', 'gb-sub', 'Cảm ơn bạn đã gửi những lời chúc tốt đẹp nhất ♥'), form, list]
    .forEach(function (n) { dialog.appendChild(n); });
  modal.appendChild(dialog);
  document.body.appendChild(modal);

  function setStatus(text, ok) { status.textContent = text; status.className = 'gb-status' + (ok ? ' ok' : text ? ' err' : ''); }
  function open() {
    modal.classList.add('open'); document.body.classList.add('lb-lock');
    if (!API) setStatus('Chức năng lưu lời chúc chưa được kết nối.', false);
    renderList();
  }
  function close() { modal.classList.remove('open'); document.body.classList.remove('lb-lock'); }
  closeBtn.onclick = close;
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.openGuestbook = open;

  function renderList() {
    list.textContent = '';
    if (!messages.length) { list.appendChild(el('p', 'gb-empty', 'Chưa có lời chúc nào — hãy là người đầu tiên nhé!')); return; }
    messages.forEach(function (m) {
      var item = el('div', 'gb-item');
      var head = el('div', 'gb-head');
      head.appendChild(el('b', null, m.name));
      if (m.time) head.appendChild(el('span', null, new Date(m.time).toLocaleDateString('vi-VN')));
      item.appendChild(head);
      item.appendChild(el('p', null, m.message));
      list.appendChild(item);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameIn.value.trim(), message = msgIn.value.trim();
    if (!name || !message) return setStatus('Vui lòng nhập tên và lời chúc.', false);
    submit.disabled = true; setStatus('Đang gửi...', true);
    send({ type: 'message', name: name, message: message, website: trap.value })
      .then(function () {
        store('gb-name', name);
        var m = { name: name, message: message, time: Date.now() };
        messages.unshift(m); renderList(); bubble(m);
        msgIn.value = ''; setStatus('Đã gửi lời chúc, cảm ơn bạn!', true);
      })
      .catch(function (err) { setStatus(err.message || 'Gửi không thành công, thử lại nhé.', false); })
      .then(function () { submit.disabled = false; });
  });

  var toolbarBtn = document.querySelector('.message-box-button');
  if (toolbarBtn) { toolbarBtn.style.cursor = 'pointer'; toolbarBtn.addEventListener('click', open); }

  // ---------- Floating message bubbles over the card ----------
  var box = document.getElementById('blessing-box');
  function bubble(m) {
    if (!box) return;
    var b = el('div', 'gb-bubble');
    b.appendChild(el('b', null, m.name)); b.appendChild(document.createTextNode(' : '));
    b.appendChild(document.createTextNode(m.message.length > 140 ? m.message.slice(0, 138) + '…' : m.message));
    box.appendChild(b);
    while (box.children.length > 6) box.removeChild(box.firstChild);
    setTimeout(function () { if (b.parentNode) b.classList.add('gone'); }, 15000);
  }
  if (box) box.classList.add('gb-box');
  var cursor = 0;
  setInterval(function () {
    if (messages.length && !document.hidden) bubble(messages[cursor++ % messages.length]);
  }, 3500);
  load().then(function (m) { messages = m; }).catch(function () {});

  // ---------- RSVP form inside the card ----------
  var nameField = document.querySelector('input[name="rsvp-name"]');
  var rsvp = nameField && nameField.form;
  if (!rsvp) return;
  var radios = rsvp.querySelectorAll('input[name="rsvp-attendance"]');
  Array.prototype.forEach.call(radios, function (r) {
    r.addEventListener('change', function () {
      Array.prototype.forEach.call(radios, function (x) {
        x.closest('.ant-radio-wrapper').classList.toggle('ant-radio-wrapper-checked', x.checked);
        x.parentNode.classList.toggle('ant-radio-checked', x.checked);
      });
    });
  });
  var rsvpBtn = rsvp.querySelector('button[type="submit"]');
  var rsvpMsg = el('p', 'gb-rsvp-msg');
  rsvp.appendChild(rsvpMsg);
  rsvp.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameField.value.trim();
    if (!name) { rsvpMsg.textContent = 'Vui lòng nhập tên của bạn.'; return; }
    var checked = rsvp.querySelector('input[name="rsvp-attendance"]:checked');
    rsvpBtn.disabled = true; rsvpMsg.textContent = 'Đang gửi...';
    var count = rsvp.querySelector('#rsvp-attendee-count');
    send({ type: 'rsvp', name: name, attendance: checked ? checked.value : 'yes', guests: count ? count.value : '' })
      .then(function () { rsvpMsg.textContent = 'Cảm ơn ' + name + '! Chúng mình đã nhận được xác nhận.'; store('gb-name', name); })
      .catch(function (err) { rsvpMsg.textContent = err.message || 'Gửi không thành công, thử lại nhé.'; rsvpBtn.disabled = false; });
  });
})();
