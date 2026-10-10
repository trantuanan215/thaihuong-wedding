// Theme switch button next to the music toggle: cycles through the invitation designs.
(function () {
  var THEMES = [
    { href: './', file: 'index.html', name: 'Giao diện 1' },
    { href: 'theme-2.html', file: 'theme-2.html', name: 'Giao diện 2' }
  ];
  var app = document.getElementById('app-view-index');
  if (!app) return;
  var path = location.pathname.split('/').pop() || 'index.html';
  var current = 0;
  THEMES.forEach(function (t, i) { if (t.file === path) current = i; });
  var next = THEMES[(current + 1) % THEMES.length];

  var btn = document.createElement('a');
  btn.className = 'theme-switch';
  btn.href = next.href;
  btn.title = 'Đổi giao diện (' + next.name + ')';
  btn.setAttribute('aria-label', btn.title);
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-1.8a1.7 1.7 0 0 0-1.2 2.9 1.7 1.7 0 0 1-1.2 3.1z"/>' +
    '<circle cx="7.5" cy="10.5" r="1.3" fill="currentColor"/><circle cx="11" cy="6.8" r="1.3" fill="currentColor"/>' +
    '<circle cx="15.8" cy="8" r="1.3" fill="currentColor"/></svg>' +
    '<span class="theme-switch-dot">' + (current + 1) + '</span>';
  app.appendChild(btn);
})();
