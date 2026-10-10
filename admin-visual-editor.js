// Visual photo editor for the admin page: clickable slot overlays on the embedded invitation,
// a library picker, and a crop frame (drag to pan, slider/wheel to zoom) with live preview.
window.AdminVisual = (function () {
  var D = window.AdminData, ctx = null;   // { frame, themeId, groups, state, onChange }
  var $ = function (s) { return document.querySelector(s); };
  var natural = {};                       // photo name -> width / height

  function slotsOf(themeId) { return ctx.state.config[themeId] || (ctx.state.config[themeId] = {}); }
  function groupOf(nid) { return ctx.groups.filter(function (g) { return g.nids.indexOf(nid) >= 0; })[0]; }
  function current(nid) {
    var g = groupOf(nid), o = slotsOf(ctx.themeId)[nid] || {}, def = g.sizes[nid];
    return { photo: o.photo || g.photo, x: o.x != null ? o.x : 50, y: o.y != null ? o.y : (o.pos != null ? o.pos : def.pos), size: o.size || null };
  }
  function preview() {
    var w = ctx.frame.contentWindow;
    if (w && w.applyPhotoConfig) w.applyPhotoConfig(ctx.state.config);
  }
  function aspect(name) {
    if (natural[name]) return Promise.resolve(natural[name]);
    var p = (window.ALBUM_PHOTOS || []).filter(function (a) { return a.name === name; })[0];
    if (p) return Promise.resolve(natural[name] = p.w / p.h);
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () { res(natural[name] = img.naturalWidth / img.naturalHeight); };
      img.onerror = function () { res(natural[name] = 1.5); };
      img.src = D.photoUrl(name);
    });
  }

  // ---------- overlays inside the embedded invitation ----------
  function attach(frame, themeId, groups, state, onChange) {
    ctx = { frame: frame, themeId: themeId, groups: groups, state: state, onChange: onChange };
    var doc = frame.contentDocument;
    var style = doc.createElement('style');
    style.textContent = '.admin-hit{position:absolute;inset:0;z-index:9999;pointer-events:auto!important;cursor:pointer;' +
      'outline:2px dashed rgba(181,72,90,.85);outline-offset:-2px;background:rgba(181,72,90,.06);transition:background .15s}' +
      '.admin-hit:hover{background:rgba(181,72,90,.22)}.admin-hit span{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:12px;' +
      'background:#b5485a;color:#fff;font:600 12px/1.6 -apple-system,sans-serif;white-space:nowrap}';
    doc.head.appendChild(style);
    groups.forEach(function (g) {
      g.nids.forEach(function (nid) {
        var host = nid === 'letter' ? doc.querySelector('.envelope-container .letter') : doc.querySelector('[data-node-id="' + nid + '"]');
        if (!host) return;
        var hit = doc.createElement('div');
        hit.className = 'admin-hit';
        var tag = doc.createElement('span');
        tag.textContent = '✎ ' + (g.label || 'Ảnh #' + g.index);
        hit.appendChild(tag);
        hit.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pick(nid); });
        host.appendChild(hit);
      });
    });
    preview();
  }

  // ---------- step 1: choose a photo ----------
  function pick(nid) {
    var cur = current(nid), grid = $('#picker-grid');
    grid.textContent = '';
    ctx.state.library.forEach(function (name) {
      var b = document.createElement('button');
      b.className = 'pick' + (name === cur.photo ? ' selected' : '');
      b.style.backgroundImage = 'url("' + D.thumbUrl(name) + '")';
      b.title = name;
      b.onclick = function () { $('#picker').hidden = true; choosePhoto(nid, name); };
      grid.appendChild(b);
    });
    $('#picker-keep').onclick = function () { $('#picker').hidden = true; crop(nid); };
    $('#picker').hidden = false;
  }
  function choosePhoto(nid, name) {
    var g = groupOf(nid), slots = slotsOf(ctx.themeId);
    // the photo goes to every slot of the group; framing restarts from "fill the frame, centred"
    g.nids.forEach(function (n) {
      if (name === g.photo) delete slots[n];
      else slots[n] = { photo: name, x: 50, y: 50 };
    });
    ctx.onChange(); preview();
    crop(nid);
  }

  // ---------- step 2: frame / zoom ----------
  function crop(nid) {
    var g = groupOf(nid), size = g.sizes[nid], cur = current(nid), before = JSON.stringify(slotsOf(ctx.themeId)[nid] || null);
    var box = $('#crop-frame'), zoom = $('#crop-zoom');
    var maxW = Math.min(440, window.innerWidth - 48), maxH = window.innerHeight * 0.55;
    var fw = maxW, fh = fw * size.h / size.w;
    if (fh > maxH) { fh = maxH; fw = fh * size.w / size.h; }
    box.style.width = fw + 'px'; box.style.height = fh + 'px';
    box.style.backgroundImage = 'url("' + D.photoUrl(cur.photo) + '")';
    $('#crop-title').textContent = g.label || ('Ảnh #' + g.index);
    $('#crop').hidden = false;

    aspect(cur.photo).then(function (ar) {
      var cover = Math.max(1, ar / (size.w / size.h)) * 100;          // width % that just fills the frame
      var st = { x: cur.x, y: cur.y, z: cur.size ? cur.size / cover : 1 };
      function draw(save) {
        box.style.backgroundSize = (cover * st.z) + '% auto';
        box.style.backgroundPosition = st.x + '% ' + st.y + '%';
        zoom.value = Math.round(st.z * 100);
        if (!save) return;
        var o = slotsOf(ctx.themeId)[nid] = Object.assign(slotsOf(ctx.themeId)[nid] || { photo: cur.photo }, { x: +st.x.toFixed(1), y: +st.y.toFixed(1), size: +(cover * st.z).toFixed(2) });
        delete o.pos;
        ctx.onChange(); preview();
      }
      draw(false);
      // drag: background-position % moves the image by (frame - image) * % / 100
      var drag = null;
      box.onpointerdown = function (e) { drag = { x: e.clientX, y: e.clientY, sx: st.x, sy: st.y }; box.setPointerCapture(e.pointerId); };
      box.onpointermove = function (e) {
        if (!drag) return;
        var iw = fw * cover * st.z / 100, ih = iw / ar;
        if (iw > fw) st.x = Math.min(100, Math.max(0, drag.sx - (e.clientX - drag.x) / (iw - fw) * 100));
        if (ih > fh) st.y = Math.min(100, Math.max(0, drag.sy - (e.clientY - drag.y) / (ih - fh) * 100));
        draw(false);
      };
      box.onpointerup = box.onpointercancel = function () { if (drag) { drag = null; draw(true); } };
      box.onwheel = function (e) { e.preventDefault(); st.z = Math.min(3, Math.max(1, st.z - e.deltaY * 0.002)); draw(true); };
      zoom.oninput = function () { st.z = zoom.value / 100; draw(false); };
      zoom.onchange = function () { draw(true); };
      $('#crop-center').onclick = function () { st.x = 50; st.y = 50; st.z = 1; draw(true); };
      $('#crop-change').onclick = function () { $('#crop').hidden = true; pick(nid); };
      $('#crop-cancel').onclick = function () {
        var prev = JSON.parse(before), slots = slotsOf(ctx.themeId);
        if (prev) slots[nid] = prev; else delete slots[nid];
        $('#crop').hidden = true; ctx.onChange(); preview();
      };
      $('#crop-done').onclick = function () { draw(true); $('#crop').hidden = true; };
      $('#crop-reset').onclick = function () {
        g.nids.forEach(function (n) { delete slotsOf(ctx.themeId)[n]; });
        $('#crop').hidden = true; ctx.onChange(); preview();
      };
    });
  }

  return { attach: attach };
})();
