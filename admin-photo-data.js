// Admin photo layout: backend calls, photo-slot discovery in the theme pages, and the photo library.
window.AdminData = (function () {
  var API = (window.GUESTBOOK_API_URL || '').trim();
  var KEY_STORE = 'wedding-admin-key';
  var THEMES = [
    { id: 'theme2', label: 'Theme 2 (mặc định)', page: 'index.html' },
    { id: 'theme1', label: 'Theme 1', page: 'theme-1.html' }
  ];
  // the theme 2 envelope letter photo lives in theme-2.css, not in a canvas node
  var LETTER = { nids: ['letter'], label: 'Lá thư trong phong bì (lúc mở thiệp)', top: 260, w: 331, h: 221,
    photo: 'assets/img/afff8329-cd26-4fc8-abd8-cc74e38a0a26-b49d344f.jpg', pos: 50 };

  function getKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } }
  function setKey(k, remember) { try { remember ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch (e) {} }

  function post(payload) {
    return fetch(API, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'Lỗi không xác định');
        return res;
      });
  }
  function checkKey(key) {
    return post({ type: 'checkKey', key: key, name: 'admin' }).catch(function (err) {
      // an Apps Script deployment without the admin code answers like a guestbook request
      if (/nhập tên|không hợp lệ|lời chúc/i.test(err.message)) throw new Error('Apps Script chưa được cập nhật bản mới (xem HUONG-DAN.md)');
      throw err;
    });
  }
  function loadConfig() {
    return fetch(API + '?type=config').then(function (r) { return r.json(); }).then(function (res) { return res.config || {}; });
  }
  function saveConfig(key, config) { return post({ type: 'config', key: key, name: 'admin', config: config }); }

  // last url(...) in a style attribute (a darkening gradient layer may come before it)
  function cleanUrl(style) {
    var re = /url\(["']?([^"')]+)["']?\)/g, m, last = '';
    while ((m = re.exec(style || ''))) last = m[1];
    return last;
  }
  function px(style, prop) {
    var m = new RegExp('(?:^|;)\\s*' + prop + ':\\s*([\\d.]+)px').exec(style || '');
    return m ? parseFloat(m[1]) : null;
  }

  // Photo slots of a theme page: top-level canvas nodes whose photo is a JPG/WebP couple photo.
  // Nodes sharing the same default photo are grouped so they keep showing the same picture.
  function discoverSlots(theme) {
    return fetch(theme.page, { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var groups = {};
      doc.querySelectorAll('#root-page-container .w-full.h-full > [data-node-id]').forEach(function (node) {
        var wrap = node.querySelector('.photo-bg-wrap');
        if (!wrap || wrap.classList.contains('gift-qr-image')) return;
        var url = cleanUrl(wrap.getAttribute('style'));
        if (!/^assets\/(album\/large|img)\/.+\.(jpe?g|webp)$/i.test(url)) return;
        var st = node.getAttribute('style'), w = px(st, 'width'), h = px(st, 'height');
        if (!w || !h || w < 60 || h < 60) return;
        var pos = /background-position:\s*center\s+([\d.]+)%/.exec(wrap.getAttribute('style') || '');
        var g = groups[url] || (groups[url] = { nids: [], photo: url, pos: pos ? parseFloat(pos[1]) : 50, top: px(st, 'top'), w: w, h: h });
        g.nids.push(node.getAttribute('data-node-id'));
        if (w * h > g.w * g.h) { g.w = w; g.h = h; }        // preview the largest use of the photo
      });
      var list = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return a.top - b.top; });
      if (theme.id === 'theme2') list.unshift(Object.assign({}, LETTER));
      list.forEach(function (g, i) { g.index = i + 1; g.photo = shortName(g.photo); });
      return list;
    });
  }

  // library entries are album names ("dat_0007") or paths for the original theme 1 photos
  function shortName(url) {
    var m = /^assets\/album\/large\/(.+)\.jpg$/.exec(url);
    return m ? m[1] : url;
  }
  function photoUrl(name) { return name.indexOf('/') >= 0 ? name : 'assets/album/large/' + name + '.jpg'; }
  function thumbUrl(name) { return name.indexOf('/') >= 0 ? name : 'assets/album/thumb/' + name + '.jpg'; }
  function buildLibrary(slotsByTheme) {
    var lib = window.ALBUM_PHOTOS.map(function (p) { return p.name; });
    Object.keys(slotsByTheme).forEach(function (t) {
      slotsByTheme[t].forEach(function (g) { if (lib.indexOf(g.photo) < 0) lib.push(g.photo); });
    });
    return lib;
  }

  return { THEMES: THEMES, getKey: getKey, setKey: setKey, checkKey: checkKey, loadConfig: loadConfig, saveConfig: saveConfig,
    discoverSlots: discoverSlots, buildLibrary: buildLibrary, photoUrl: photoUrl, thumbUrl: thumbUrl };
})();
