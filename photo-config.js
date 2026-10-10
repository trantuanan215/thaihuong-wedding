// Applies the photo layout saved from the admin page: which library photo fills each photo slot
// of this theme (plus its vertical focus) and the album order. The last config is cached locally
// so returning guests see it instantly; the latest one is fetched from the Apps Script backend.
(function () {
  var THEME = /theme-1\.html$/.test(location.pathname) ? 'theme1' : 'theme2';
  var CACHE = 'wedding-photo-config';
  var API = (window.GUESTBOOK_API_URL || '').trim();

  function photoUrl(name) { return name.indexOf('/') >= 0 ? name : 'assets/album/large/' + name + '.jpg'; }
  function setBackground(el, url) {
    // keep a darkening gradient layer if the slot has one (e.g. the theme 2 calendar photo)
    var bg = el.style.backgroundImage || '';
    var overlay = /^linear-gradient/.test(bg) ? bg.split(/,\s*url\(/)[0] + ', ' : '';
    el.style.backgroundImage = overlay + 'url("' + url + '")';
  }

  // original slot styles, so a slot reset to default on the admin page can be restored in place
  var originals = {};
  function slotEl(nid) {
    if (nid === 'letter') return document.querySelector('.envelope-container .letter');
    var node = document.querySelector('[data-node-id="' + nid + '"]');
    return node && node.querySelector('.photo-bg-wrap');
  }
  function restore(nid) {
    var el = slotEl(nid), o = originals[nid];
    if (!el || !o) return;
    el.style.backgroundImage = o.image; el.style.backgroundSize = o.size; el.style.backgroundPosition = o.pos;
    delete originals[nid];
  }

  function apply(cfg) {
    var slots = (cfg && cfg[THEME]) || {};
    Object.keys(originals).forEach(function (nid) { if (!slots[nid]) restore(nid); });
    if (window.setAlbumOrder) window.setAlbumOrder((cfg && cfg.album) || []);
    Object.keys(slots).forEach(function (nid) {
      var s = slots[nid];
      if (!s || !s.photo) return;
      var url = photoUrl(s.photo), el = slotEl(nid);
      if (!el) return;
      if (!originals[nid]) originals[nid] = { image: el.style.backgroundImage, size: el.style.backgroundSize, pos: el.style.backgroundPosition };
      if (nid === 'letter') { el.style.backgroundImage = 'url("' + url + '")'; return; }   // theme 2 envelope letter
      el.style.backgroundImage = originals[nid].image;
      setBackground(el, url);
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center ' + (s.pos != null ? s.pos : 50) + '%';
    });
  }

  var cachedText = null;
  try { cachedText = localStorage.getItem(CACHE); } catch (e) {}
  if (cachedText) { try { apply(JSON.parse(cachedText)); } catch (e) {} }

  if (!API) return;
  fetch(API + '?type=config')
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var text = JSON.stringify(res && res.config || null);
      if (text === cachedText) return;
      try { localStorage.setItem(CACHE, text); } catch (e) {}
      cachedText = text;
      apply(res.config);
    })
    .catch(function () {});
})();
