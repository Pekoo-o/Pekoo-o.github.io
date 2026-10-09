// Procedural placeholder "photos": draw a grayscale scene, then Atkinson-dither it to 1-bit.
// Usage: <canvas data-scene="wires" data-seed="3" data-res="240" data-fg="#111111" data-bg="#efeee8"></canvas>
// data-bg="none" -> transparent background; data-smear="N" -> N pixel-sort streaks.
(function () {
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hex = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const lin = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const glow = (c, x, y, r, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const wire = (c, x0, y0, x1, y1, s) => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + s, x1, y1); c.stroke();
    return t => [x0 + (x1 - x0) * t, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * ((y0 + y1) / 2 + s) + t * t * y1]; };
  const person = (c, x, y, s) => { c.beginPath(); c.arc(x, y - s * 1.7, s * .26, 0, 7); c.fill(); c.fillRect(x - s * .24, y - s * 1.45, s * .48, s * 1.45); };

  const scenes = {
    wires(c, w, h, R) {
      c.fillStyle = lin(c, 0, h, [[0, '#a4a4a4'], [.55, '#e8e8e8'], [1, '#fbfbfb']]); c.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) glow(c, R() * w, R() * h * .6, w * (.12 + R() * .2), .5);
      const P = [w * (.1 + R() * .12), w * (.58 + R() * .14)], T = [h * (.08 + R() * .08), h * (.18 + R() * .1)];
      c.fillStyle = '#0a0a0a'; c.strokeStyle = '#0a0a0a';
      P.forEach((x, k) => { const t = T[k], pw = Math.max(2, w * .012); c.fillRect(x - pw / 2, t, pw, h); c.fillRect(x - w * .07, t + h * .04, w * .14, Math.max(2, h * .012)); c.fillRect(x - w * .05, t + h * .1, w * .1, Math.max(2, h * .01)); });
      c.lineWidth = Math.max(1, w * .0035); let first;
      [[-.065, .04], [-.025, .04], [.025, .04], [.065, .04], [-.045, .1], [.045, .1]].forEach(([dx, dy], k) => {
        const b = [P[0] + dx * w, T[0] + h * dy], d = [P[1] + dx * w, T[1] + h * dy];
        wire(c, -w * .05, T[0] + h * (dy + .14), b[0], b[1], h * .05);
        const f = wire(c, b[0], b[1], d[0], d[1], h * .12); if (k === 1) first = f;
        wire(c, d[0], d[1], w * 1.05, T[1] + h * (dy + .1), h * .06);
      });
      const n = 1 + (R() * 3 | 0);
      for (let i = 0; i < n; i++) { const [x, y] = first(.3 + R() * .4), s = Math.max(2, w * .012); c.beginPath(); c.ellipse(x, y - s * .8, s, s * .7, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x + s * .8, y - s * 1.5, s * .5, 0, 7); c.fill(); }
      for (let x = 0; x < w; x += w * .035) { const r = h * (.03 + R() * .07); c.beginPath(); c.arc(x, h * .98, r, 0, 7); c.fill(); }
    },
    window(c, w, h, R) {
      c.fillStyle = '#161616'; c.fillRect(0, 0, w, h);
      const wx = w * (.28 + R() * .24), wy = h * (.12 + R() * .08), ww = w * .26, wh = h * .42;
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx + ww, wy + wh); c.lineTo(wx + ww + w * .3, h); c.lineTo(wx + w * .02, h); c.fill();
      glow(c, wx + ww / 2, wy + wh / 2, ww * 1.3, .25);
      c.fillStyle = lin(c, wy, wy + wh, [[0, '#ffffff'], [1, '#bdbdbd']]); c.fillRect(wx, wy, ww, wh);
      c.fillStyle = 'rgba(20,20,20,.75)'; const bl = h * .024; for (let y = wy; y < wy + wh * (.35 + R() * .4); y += bl) c.fillRect(wx, y, ww, bl * .45);
      c.fillStyle = '#161616'; c.fillRect(wx + ww / 2 - w * .004, wy, w * .008, wh); c.fillRect(wx - w * .01, wy + wh, ww + w * .02, h * .02);
    },
    street(c, w, h, R) {
      c.fillStyle = lin(c, 0, h, [[0, '#050505'], [.7, '#1e1e1e'], [1, '#3a3a3a']]); c.fillRect(0, 0, w, h);
      const x = w * (.35 + R() * .3), y = h * .22;
      glow(c, x, y + h * .02, h * .7, .3); glow(c, x, y + h * .02, h * .16, .95);
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(x - w * .02, y); c.lineTo(x + w * .02, y); c.lineTo(x + w * .25, h); c.lineTo(x - w * .25, h); c.fill();
      c.fillStyle = '#000'; c.fillRect(x + w * .03, y - h * .02, Math.max(2, w * .012), h); c.fillRect(x - w * .01, y - h * .035, w * .05, Math.max(2, h * .012));
      c.fillStyle = '#fff'; c.fillRect(x - w * .025, y - h * .02, w * .035, h * .022);
    },
    crowd(c, w, h, R) {
      c.fillStyle = lin(c, 0, h, [[0, '#1a1a1a'], [.45, '#8f8f8f'], [1, '#2a2a2a']]); c.fillRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) { const x = w * (.2 + i * .3); c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(x - w * .02, 0); c.lineTo(x + w * .02, 0); c.lineTo(x + w * .2 * (R() + .2), h * .85); c.lineTo(x - w * .2 * (R() + .2), h * .85); c.fill(); }
      glow(c, w / 2, h * .12, w * .35, .6);
      const ppl = []; for (let i = 0; i < 26; i++) ppl.push([R() * w, h * (.5 + R() * .42)]); ppl.sort((a, b) => a[1] - b[1]);
      c.fillStyle = '#050505'; c.strokeStyle = '#050505'; c.lineCap = 'round';
      ppl.forEach(([x, y]) => { const s = h * (.045 + (y / h - .5) * .14);
        c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.beginPath(); c.ellipse(x, y + s * 2.3, s * 2.1, s * 1.6, 0, 0, 7); c.fill(); c.fillRect(x - s * 2.1, y + s * 2.3, s * 4.2, h);
        if (R() < .3) { c.lineWidth = s * .7; const sx = x + (R() < .5 ? -1 : 1) * s * 1.6; c.beginPath(); c.moveTo(sx, y + s * 1.8); c.lineTo(sx + (R() - .5) * s * 2, y - s * (2.5 + R() * 2)); c.stroke(); } });
    },
    corridor(c, w, h, R) {
      const cx = w * (.45 + R() * .1), cy = h * .5;
      for (let k = 0; k < 16; k++) { const t = k / 16, s = 1 - t * .93, x0 = cx - cx * s, x1 = cx + (w - cx) * s, y0 = cy - cy * s, y1 = cy + (h - cy) * s, v = Math.round(30 + t * 130);
        c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        if (k % 2 === 0) { c.fillStyle = 'rgba(255,255,255,.95)'; c.fillRect(cx - (x1 - x0) * .07, y0 + (y1 - y0) * .015, (x1 - x0) * .14, Math.max(1, (y1 - y0) * .014)); } }
      const dw = w * .06, dh = h * .15; c.fillStyle = '#fff'; c.fillRect(cx - dw / 2, cy - dh * .5, dw, dh);
      c.fillStyle = '#000'; person(c, cx, cy + dh * .5, dh * .5);
    },
    field(c, w, h, R) {
      const hz = h * (.6 + R() * .12);
      c.fillStyle = lin(c, 0, hz, [[0, '#707070'], [1, '#f2f2f2']]); c.fillRect(0, 0, w, hz);
      glow(c, w * (.2 + R() * .6), hz, h * .4, .8);
      c.fillStyle = lin(c, hz, h, [[0, '#2a2a2a'], [1, '#0a0a0a']]); c.fillRect(0, hz, w, h - hz);
      c.fillStyle = '#000'; person(c, w * (.3 + R() * .4), hz + h * .01, h * .09);
    },
    sea(c, w, h, R) {
      const hz = h * (.45 + R() * .1);
      c.fillStyle = lin(c, 0, hz, [[0, '#8a8a8a'], [1, '#ececec']]); c.fillRect(0, 0, w, hz);
      c.fillStyle = lin(c, hz, h, [[0, '#6a6a6a'], [1, '#161616']]); c.fillRect(0, hz, w, h - hz);
      const sx = w * (.3 + R() * .4); glow(c, sx, hz - h * .06, h * .12, 1);
      c.fillStyle = 'rgba(255,255,255,.55)'; for (let y = hz + 2; y < h; y += h * .03) { const l = w * (.04 + R() * .12) * (1 - (y - hz) / h); c.fillRect(sx - l / 2 + (R() - .5) * w * .04, y, l, Math.max(1, h * .006)); }
    },
    parking(c, w, h, R) {
      const hz = h * .55;
      c.fillStyle = lin(c, 0, hz, [[0, '#5a5a5a'], [1, '#d4d4d4']]); c.fillRect(0, 0, w, hz);
      c.fillStyle = lin(c, hz, h, [[0, '#606060'], [1, '#2a2a2a']]); c.fillRect(0, hz, w, h - hz);
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(1, w * .006);
      for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(w / 2 + i * w * .04, hz + h * .08); c.lineTo(w / 2 + i * w * .2, h); c.stroke(); }
      const lx = w * (.15 + R() * .7); c.fillStyle = '#111'; c.fillRect(lx, h * .15, Math.max(2, w * .01), hz - h * .09); c.fillRect(lx - w * .04, h * .15, w * .05, Math.max(2, h * .012));
    },
    house(c, w, h, R) {
      c.fillStyle = lin(c, 0, h, [[0, '#262626'], [.7, '#8f8f8f'], [1, '#d0d0d0']]); c.fillRect(0, 0, w, h);
      const g = h * .85, x = w * (.3 + R() * .15), hw = w * .38, hh = h * .3; c.fillStyle = '#0a0a0a';
      c.fillRect(x, g - hh, hw, hh); c.beginPath(); c.moveTo(x - w * .03, g - hh + 1); c.lineTo(x + hw / 2, g - hh - h * .22); c.lineTo(x + hw + w * .03, g - hh + 1); c.fill(); c.fillRect(0, g, w, h);
      const wx = x + hw * .15, wy = g - hh + hh * .18; glow(c, wx + hw * .08, wy + hh * .12, hw * .4, .35); c.fillStyle = '#fff'; c.fillRect(wx, wy, hw * .16, hh * .26);
    },
    speaker(c, w, h, R) {
      c.fillStyle = '#202020'; c.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * .42;
      for (let k = 0; k < 6; k++) { const rr = r * (1 - k * .15), g = c.createRadialGradient(cx - rr * .3, cy - rr * .3, 0, cx, cy, rr); g.addColorStop(0, `rgba(255,255,255,${.5 - k * .05})`); g.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rr, 0, 7); c.fill(); }
      c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, r * .15, 0, 7); c.fill();
    },
    chip(c, w, h, R) {
      c.fillStyle = '#9a9a9a'; c.fillRect(0, 0, w, h);
      const m = Math.min(w, h) * .08; c.fillStyle = '#454545'; c.fillRect(m, m, w - 2 * m, h - 2 * m);
      c.fillStyle = '#ececec'; const ps = m * .55; for (let x = m * 1.5; x < w - m * 1.5; x += m * 1.1) { c.fillRect(x, m * .22, ps, ps); c.fillRect(x, h - m * .22 - ps, ps, ps); }
      for (let i = 0; i < 9; i++) { const bw = w * (.08 + R() * .2), bh = h * (.08 + R() * .2), bx = m * 1.3 + R() * (w - 2.6 * m - bw), by = m * 1.3 + R() * (h - 2.6 * m - bh), v = 60 + R() * 120 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(bx, by, bw, bh); }
      c.strokeStyle = '#eee'; c.lineWidth = Math.max(1, w * .006);
      for (let k = 0; k < 3; k++) { const cx = w * (.25 + k * .25), cy = h * (.35 + R() * .3), s = Math.min(w, h) * .14; for (let j = 0; j < 4; j++) { const q = s * (1 - j * .22); c.strokeRect(cx - q / 2, cy - q / 2, q, q); } }
      c.strokeStyle = '#ddd'; c.lineWidth = Math.max(1, w * .004);
      for (let i = 0; i < 8; i++) { c.beginPath(); let x = m * 1.5 + R() * (w - 3 * m), y = m * 1.5 + R() * (h - 3 * m); c.moveTo(x, y); for (let j = 0; j < 3; j++) { if (j % 2) y = m * 1.5 + R() * (h - 3 * m); else x = m * 1.5 + R() * (w - 3 * m); c.lineTo(x, y); } c.stroke(); }
    },
  };

  function render(cv, o = {}) {
    const d = cv.dataset, scene = o.scene || d.scene, seed = +(o.seed ?? d.seed ?? 1), res = +(o.res || d.res || 200);
    const r = cv.getBoundingClientRect(), ratio = r.width ? r.height / r.width : (+d.ratio || .7);
    const w = res, h = Math.max(8, Math.round(res * ratio)); cv.width = w; cv.height = h;
    const c = cv.getContext('2d', { willReadFrequently: true }), R = rng(seed * 9301 + 7);
    c.save(); scenes[scene](c, w, h, R); c.restore();
    const fgS = o.fg || d.fg || '#111111', bgS = o.bg || d.bg || '#efeee8', fg = hex(fgS), clear = bgS === 'none', bg = clear ? [0, 0, 0] : hex(bgS);
    const con = +(o.contrast || d.contrast || 1.15), nz = +(o.noise ?? d.noise ?? .14);
    const id = c.getImageData(0, 0, w, h), p = id.data, g = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { const v = (p[i * 4] * .3 + p[i * 4 + 1] * .59 + p[i * 4 + 2] * .11) / 255; g[i] = (v - .5) * con + .5 + (R() - .5) * nz; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, q = g[i] < .5 ? 0 : 1, e = (g[i] - q) / 8; g[i] = q;
      if (x + 1 < w) g[i + 1] += e; if (x + 2 < w) g[i + 2] += e;
      if (y + 1 < h) { if (x > 0) g[i + w - 1] += e; g[i + w] += e; if (x + 1 < w) g[i + w + 1] += e; }
      if (y + 2 < h) g[i + 2 * w] += e;
    }
    const sm = +(o.smear || d.smear || 0);
    for (let k = 0; k < sm; k++) { const x0 = R() * w | 0, wd = 1 + (R() * w * .05 | 0), y0 = R() * h | 0, L = h * (.1 + R() * .55) | 0;
      for (let x = x0; x < Math.min(w, x0 + wd); x++) { const v = g[y0 * w + x]; for (let y = y0; y < Math.min(h, y0 + L); y++) g[y * w + x] = v; } }
    for (let i = 0; i < w * h; i++) { const on = g[i] < .5, col = on ? fg : bg; p[i * 4] = col[0]; p[i * 4 + 1] = col[1]; p[i * 4 + 2] = col[2]; p[i * 4 + 3] = (!on && clear) ? 0 : 255; }
    c.putImageData(id, 0, 0);
  }
  window.Dither = { render, scenes, auto: (root = document) => root.querySelectorAll('canvas[data-scene]').forEach(cv => render(cv)) };
})();
