// Opening screen: dismiss on the first tap. That same tap is the user gesture the browser needs to
// start the music (local.js plays on the first pointerup); other effects wait for 'wedding:opened'.
(function () {
  var gate = document.getElementById('opening-gate');
  window.WEDDING_GATE_OPEN = !gate;
  if (!gate) return;
  if (window.WEDDING_EDIT_MODE) { gate.classList.add('edit-mode'); window.WEDDING_GATE_OPEN = true; return; }
  var opened = false;
  function open() {
    if (opened) return;
    opened = true;
    var audio = document.querySelector('audio');
    var btn = document.getElementById('audio-control-wrapper');
    // music is ON by default; play inside the tap handler so the browser allows it
    if (audio && audio.paused && !(btn && btn.classList.contains('paused'))) {
      var p = audio.play();
      if (p) p.catch(function () {});
    }
    gate.classList.add('closing');
    setTimeout(function () { gate.remove(); }, 650);
    window.WEDDING_GATE_OPEN = true;
    document.dispatchEvent(new CustomEvent('wedding:opened'));
  }
  gate.addEventListener('click', open);
  gate.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  var b = gate.querySelector('.opening-gate-btn');
  if (b) b.focus({ preventScroll: true });
})();
