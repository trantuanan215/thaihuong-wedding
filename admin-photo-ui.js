// Admin photo layout UI: login, per-theme photo slots with a library picker + focus slider, album ordering.
(function () {
  var D = window.AdminData, $ = function (s) { return document.querySelector(s); };
  var state = { key: '', config: {}, slots: {}, library: [], album: [], tab: 'theme2', dirty: false };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function status(msg, kind) { var s = $('#status'); s.textContent = msg || ''; s.className = 'status ' + (kind || ''); }
  function markDirty() { state.dirty = true; status('Có thay đổi chưa lưu', 'warn'); }

  // ---------- login ----------
  function login(ev) {
    ev.preventDefault();
    var key = $('#key').value.trim();
    if (!key) return;
    status('Đang kiểm tra mật khẩu…');
    D.checkKey(key).then(function () {
      state.key = key;
      D.setKey(key, $('#remember').checked);
      $('#login').hidden = true;
      start();
    }).catch(function (err) { status(err.message, 'err'); });
  }

  // ---------- load everything ----------
  function start() {
    status('Đang tải cấu hình và các khung ảnh…');
    Promise.all([D.loadConfig()].concat(D.THEMES.map(D.discoverSlots))).then(function (res) {
      state.config = res[0] || {};
      D.THEMES.forEach(function (t, i) { state.slots[t.id] = res[i + 1]; });
      state.library = D.buildLibrary(state.slots);
      var def = window.ALBUM_PHOTOS.map(function (p) { return p.name; });
      var saved = (state.config.album || []).filter(function (n) { return def.indexOf(n) >= 0; });
      state.album = saved.concat(def.filter(function (n) { return saved.indexOf(n) < 0; }));
      $('#app').hidden = false;
      status('Sẵn sàng');
      render();
    }).catch(function (err) { status('Không tải được: ' + err.message, 'err'); });
  }

  // ---------- tabs ----------
  function render() {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === state.tab); });
    var panel = $('#panel');
    panel.textContent = '';
    if (state.tab === 'album') return renderAlbum(panel);
    renderSlots(panel, state.tab);
  }

  // current choice for a slot group: saved override (first nid of the group) or the default
  function choice(themeId, g) {
    var o = (state.config[themeId] || {})[g.nids[0]];
    return { photo: (o && o.photo) || g.photo, pos: o && o.pos != null ? o.pos : g.pos };
  }
  function setChoice(themeId, g, photo, pos) {
    var t = state.config[themeId] || (state.config[themeId] = {});
    g.nids.forEach(function (nid) {
      if (photo === g.photo && pos === g.pos) delete t[nid];
      else t[nid] = { photo: photo, pos: pos };
    });
    markDirty();
  }

  function renderSlots(panel, themeId) {
    var theme = D.THEMES.filter(function (t) { return t.id === themeId; })[0];
    var head = el('div', 'panel-head');
    head.appendChild(el('p', 'hint', 'Bấm "Đổi ảnh" để chọn ảnh khác từ thư viện. Kéo thanh trượt để chỉnh phần ảnh được hiển thị (trên ↔ dưới).'));
    var view = el('a', 'btn ghost', 'Xem trang ↗'); view.href = theme.page; view.target = '_blank';
    head.appendChild(view);
    panel.appendChild(head);
    var grid = el('div', 'slot-grid');
    state.slots[themeId].forEach(function (g) {
      var c = choice(themeId, g);
      var card = el('div', 'slot');
      var box = el('div', 'slot-preview');
      box.style.aspectRatio = g.w + ' / ' + g.h;
      box.style.backgroundImage = 'url("' + D.photoUrl(c.photo) + '")';
      box.style.backgroundPosition = 'center ' + c.pos + '%';
      card.appendChild(box);
      card.appendChild(el('p', 'slot-title', g.label || ('Khung #' + g.index + (g.nids.length > 1 ? ' (' + g.nids.length + ' chỗ)' : ''))));
      card.appendChild(el('p', 'slot-meta', Math.round(g.w) + '×' + Math.round(g.h) + ' · ' + (g.w > g.h * 1.15 ? 'ngang' : g.h > g.w * 1.15 ? 'dọc' : 'vuông') +
        (g.top != null ? ' · cách đầu thiệp ' + Math.round(g.top) + 'px' : '')));
      var range = el('input'); range.type = 'range'; range.min = 0; range.max = 100; range.value = c.pos;
      range.oninput = function () { box.style.backgroundPosition = 'center ' + range.value + '%'; };
      range.onchange = function () { setChoice(themeId, g, choice(themeId, g).photo, +range.value); };
      card.appendChild(range);
      var row = el('div', 'slot-actions');
      var change = el('button', 'btn', 'Đổi ảnh');
      change.onclick = function () { pick(function (name) { setChoice(themeId, g, name, choice(themeId, g).pos); render(); }); };
      var reset = el('button', 'btn ghost', 'Mặc định');
      reset.onclick = function () { setChoice(themeId, g, g.photo, g.pos); render(); };
      row.appendChild(change); row.appendChild(reset);
      card.appendChild(row);
      grid.appendChild(card);
    });
    panel.appendChild(grid);
  }

  // ---------- library picker ----------
  function pick(onPick) {
    var modal = $('#picker'), grid = $('#picker-grid');
    grid.textContent = '';
    state.library.forEach(function (name) {
      var b = el('button', 'pick');
      b.style.backgroundImage = 'url("' + D.thumbUrl(name) + '")';
      b.title = name;
      b.onclick = function () { modal.hidden = true; onPick(name); };
      grid.appendChild(b);
    });
    modal.hidden = false;
  }

  // ---------- album order ----------
  function renderAlbum(panel) {
    var head = el('div', 'panel-head');
    head.appendChild(el('p', 'hint', 'Kéo thả (máy tính) hoặc dùng ◀ ▶ để đổi thứ tự ảnh trong album của cả 2 theme.'));
    var reset = el('button', 'btn ghost', 'Thứ tự mặc định');
    reset.onclick = function () { state.album = window.ALBUM_PHOTOS.map(function (p) { return p.name; }); delete state.config.album; markDirty(); render(); };
    head.appendChild(reset);
    panel.appendChild(head);
    var grid = el('div', 'album-grid'), dragFrom = null;
    state.album.forEach(function (name, i) {
      var item = el('div', 'album-item');
      item.draggable = true;
      item.style.backgroundImage = 'url("' + D.thumbUrl(name) + '")';
      item.appendChild(el('span', 'album-no', String(i + 1)));
      var prev = el('button', 'mv', '◀'), next = el('button', 'mv', '▶');
      prev.onclick = function () { move(i, i - 1); };
      next.onclick = function () { move(i, i + 1); };
      var bar = el('div', 'album-mv'); bar.appendChild(prev); bar.appendChild(next); item.appendChild(bar);
      item.addEventListener('dragstart', function () { dragFrom = i; item.classList.add('dragging'); });
      item.addEventListener('dragend', function () { item.classList.remove('dragging'); });
      item.addEventListener('dragover', function (e) { e.preventDefault(); });
      item.addEventListener('drop', function (e) { e.preventDefault(); if (dragFrom !== null) move(dragFrom, i); });
      grid.appendChild(item);
    });
    panel.appendChild(grid);
  }
  function move(from, to) {
    if (to < 0 || to >= state.album.length || from === to) return;
    state.album.splice(to, 0, state.album.splice(from, 1)[0]);
    state.config.album = state.album.slice();
    markDirty();
    render();
  }

  // ---------- save ----------
  function save() {
    status('Đang lưu…');
    D.saveConfig(state.key, state.config).then(function () {
      state.dirty = false;
      status('Đã lưu ✓ Khách mở thiệp sẽ thấy thay đổi ngay.', 'ok');
    }).catch(function (err) { status('Lưu không thành công: ' + err.message, 'err'); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('#login-form').addEventListener('submit', login);
    $('#save').onclick = save;
    $('#picker-close').onclick = function () { $('#picker').hidden = true; };
    document.querySelectorAll('.tab').forEach(function (b) { b.onclick = function () { state.tab = b.dataset.tab; render(); }; });
    window.addEventListener('beforeunload', function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
    var saved = D.getKey();
    if (saved) { $('#key').value = saved; $('#remember').checked = true; }
  });
})();
