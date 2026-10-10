// Gently falling rose petals, leaves and twinkling hearts over the invitation card (lightweight canvas, no library).
(function () {
  var app = document.getElementById('app-view-index');
  if (!app || !window.requestAnimationFrame) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'falling-petals';
  canvas.setAttribute('aria-hidden', 'true');
  app.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, items = [];

  var PETAL = ['#ffd6e0', '#ffc2d1', '#ffb3c6', '#ff9ebb', '#fbe0e6'];
  var LEAF = ['#a8c98f', '#8fbf7a', '#b9d6a0'];
  var HEART = ['#ff6f91', '#ff8fab', '#e64a5f'];

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = app.clientWidth; H = app.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(fromTop) {
    var r = Math.random();
    var kind = r < 0.6 ? 'petal' : r < 0.82 ? 'heart' : 'leaf';
    return {
      kind: kind,
      x: Math.random() * W,
      y: fromTop ? -20 - Math.random() * 40 : Math.random() * H,
      size: kind === 'heart' ? 6 + Math.random() * 6 : 7 + Math.random() * 7,
      vy: 0.25 + Math.random() * 0.45,                 // px per frame at 60fps: slow drift
      swayAmp: 0.4 + Math.random() * 0.9,
      swayFreq: 0.008 + Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI * 2,               // 3D tumble of petals/leaves
      vflip: 0.02 + Math.random() * 0.03,
      color: pick(kind === 'petal' ? PETAL : kind === 'leaf' ? LEAF : HEART),
      alpha: kind === 'heart' ? 0.75 : 0.85
    };
  }
  function drawPetal(p) {
    var s = p.size;
    ctx.scale(Math.max(0.15, Math.abs(Math.cos(p.flip))), 1);
    var g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, '#fff2f5');
    g.addColorStop(1, p.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.8, s * 0.6, 0, s);
    ctx.bezierCurveTo(-s * 0.8, s * 0.6, -s * 0.9, -s * 0.7, 0, -s);
    ctx.fill();
  }
  function drawLeaf(p) {
    var s = p.size * 0.8;
    ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.flip))), 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
  }
  function drawHeart(p, t) {
    var s = p.size / 12;
    ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.004 + p.phase));   // twinkle
    ctx.scale(s, s);
    ctx.fillStyle = p.color;
    ctx.shadowColor = 'rgba(255,111,145,.6)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-10, -4, -6, -12, 0, -6);
    ctx.bezierCurveTo(6, -12, 10, -4, 0, 4);
    ctx.fill();
  }

  var last = 0, running = true;
  function frame(t) {
    if (!running) return;
    var k = last ? Math.min((t - last) / 16.7, 3) : 1;   // frame-rate independent
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < items.length; i++) {
      var p = items[i];
      p.y += p.vy * k;
      p.x += Math.sin(p.y * p.swayFreq + p.phase) * p.swayAmp * k;
      p.rot += p.vrot * k;
      p.flip += p.vflip * k;
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) items[i] = spawn(true);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      if (p.kind === 'petal') drawPetal(p);
      else if (p.kind === 'leaf') drawLeaf(p);
      else drawHeart(p, t);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }

  resize();
  var count = W < 600 ? 18 : 26;
  for (var i = 0; i < count; i++) items.push(spawn(false));
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
})();
