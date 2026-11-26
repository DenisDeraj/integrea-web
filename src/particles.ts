// Bunky na pozadí: voľne plávajú ako vesmír, pri scrolle sa zhlukujú do tvarov
// a na konci stránky poskladajú nápis „Integrea Works“.
type Anchor = { y: number; s: number };

const O = "#F0582B";
const COLORS = ["#4A4C55", "#6E7079", "#A4A6AE", "#FFFFFF", O];

export function initParticles(reduced: boolean) {
  const cv = document.createElement("canvas");
  cv.className = "cells";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d")!;
  let W = 0, H = 0, dpr = 1;
  const mobile = () => window.innerWidth < 700;
  let N = 0;
  let px: Float32Array, py: Float32Array, r1: Float32Array, r2: Float32Array, r3: Float32Array, r4: Float32Array, sz: Float32Array;
  let col: Uint8Array;
  let textPts: { x: number; y: number; o: boolean }[] = [];
  let anchors: Anchor[] = [];
  const mouse = { x: -9999, y: -9999 };

  function alloc() {
    N = mobile() ? 1100 : 2600;
    px = new Float32Array(N); py = new Float32Array(N);
    r1 = new Float32Array(N); r2 = new Float32Array(N); r3 = new Float32Array(N); r4 = new Float32Array(N);
    sz = new Float32Array(N); col = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      r1[i] = Math.random(); r2[i] = Math.random(); r3[i] = Math.random(); r4[i] = Math.random();
      px[i] = r1[i] * W; py[i] = r2[i] * H;
      sz[i] = 1 + Math.random() * (Math.random() < 0.08 ? 3 : 1.6);
      const c = Math.random();
      col[i] = c < 0.13 ? 4 : c < 0.35 ? 0 : c < 0.7 ? 1 : c < 0.92 ? 2 : 3;
    }
  }

  function sampleText() {
    const off = document.createElement("canvas");
    const twoLines = W < 700;
    const lines = twoLines ? ["Integrea", "Works"] : ["Integrea Works"];
    off.width = W; off.height = H;
    const c = off.getContext("2d")!;
    c.fillStyle = "#fff";
    c.textAlign = "center"; c.textBaseline = "middle";
    const font = (n: number) => `700 ${n}px "Schibsted Grotesk", system-ui, sans-serif`;
    c.font = font(100);
    const wide = Math.max(...lines.map((l) => c.measureText(l).width));
    let fs = (100 * W * (twoLines ? 0.86 : 0.88)) / wide;
    fs = Math.min(fs, H * (twoLines ? 0.3 : 0.42));
    c.font = font(fs);
    const lh = fs * 1.02;
    const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, k) => c.fillText(l, W / 2, y0 + k * lh));
    // hranica písmena I (oranžové)
    const firstW = c.measureText("I").width;
    const lineW = c.measureText(lines[0]).width;
    const iEnd = W / 2 - lineW / 2 + firstW;
    const data = c.getImageData(0, 0, W, H).data;
    const pts: { x: number; y: number; o: boolean }[] = [];
    let step = 2;
    // zvoľ krok tak, aby bodov bolo približne N
    for (let s = 2; s < 20; s++) {
      let n = 0;
      for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) if (data[(y * W + x) * 4 + 3] > 128) n++;
      step = s; if (n <= N * 1.05) break;
    }
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step)
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y, o: x < iEnd && y < y0 + lh / 2 });
    // zamiešaj, aby sa bunky do písmen zlietali z celej plochy
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    textPts = pts;
  }

  function measureAnchors() {
    const list: Anchor[] = [];
    const add = (sel: string, s: number, at = 0.5) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      list.push({ y: r.top + window.scrollY + r.height * at - H / 2, s });
    };
    list.push({ y: 0, s: 0 });
    add("#pribeh", 1, 0.3);
    add("#ukazky", 2, 0.5);
    add("#sluzby", 3, 0.5);
    add("#pre-koho", 4, 0.5);
    add("#postup", 5, 0.5);
    add("#instagram", 0, 0.5);
    add(".finale", 6, 0.5);
    anchors = list.sort((a, b) => a.y - b.y);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!px || px.length !== (mobile() ? 1100 : 2600)) alloc();
    sampleText();
    measureAnchors();
  }

  // cieľové tvary, t = čas v sekundách
  const TAU = Math.PI * 2;
  function target(s: number, i: number, t: number, out: number[]) {
    const a = r1[i], b = r2[i], c = r3[i], d = r4[i];
    const m = mobile();
    switch (s) {
      case 0: { // vesmír: pomalé plávanie
        const x = (a * W + t * (8 + c * 22) * (d < 0.5 ? 1 : -1)) % W;
        out[0] = x < 0 ? x + W : x;
        out[1] = (b * H + Math.sin(t * 0.3 + a * TAU) * 30 + H) % H;
        return;
      }
      case 1: { // galaxia: točiaca sa špirála
        const cx = m ? W * 0.5 : W * 0.27, cy = m ? H * 0.5 : H * 0.66;
        const R = Math.min(W, H) * (m ? 0.42 : 0.36);
        const arm = Math.floor(c * 3);
        const rr = Math.pow(a, 0.7) * R;
        const ang = arm * (TAU / 3) + rr / R * 3.2 + t * 0.12 + (b - 0.5) * 0.5;
        out[0] = cx + Math.cos(ang) * rr; out[1] = cy + Math.sin(ang) * rr * 0.82;
        return;
      }
      case 2: { // poriadok: mriežka údajov
        const cols = m ? 25 : 50, rows = Math.ceil(N / cols);
        const gx = i % cols, gy = Math.floor(i / cols);
        const cw = W * (m ? 0.9 : 0.5) / cols, chh = H * 0.8 / rows;
        const ox = m ? W * 0.05 : W * 0.46;
        out[0] = ox + gx * cw + Math.sin(t * 2 + gy * 0.4) * 1.5;
        out[1] = H * 0.1 + gy * chh;
        return;
      }
      case 3: { // toky: pásy, ktoré tečú do strany
        const lane = Math.floor(b * 7);
        const speed = 40 + lane * 12;
        const x = (a * W * 1.2 + t * speed) % (W * 1.2) - W * 0.1;
        out[0] = x;
        out[1] = H * 0.18 + lane * H * 0.11 + Math.sin(x * 0.01 + lane) * 14 + (c - 0.5) * 10;
        return;
      }
      case 4: { // malá a veľká firma: dva zhluky
        const small = a < 0.22;
        const cx = small ? W * (m ? 0.25 : 0.2) : W * (m ? 0.62 : 0.68);
        const cy = small ? H * 0.62 : H * 0.48;
        const R = (small ? 0.09 : 0.26) * Math.min(W, H) * (m ? 1.2 : 1);
        const ang = b * TAU + t * (small ? 0.5 : 0.18);
        const rr = Math.sqrt(c) * R;
        out[0] = cx + Math.cos(ang) * rr; out[1] = cy + Math.sin(ang) * rr;
        return;
      }
      case 5: { // postup: čiara so štyrmi uzlami
        const node = Math.floor(a * 4);
        const nx = W * (0.14 + node * 0.24);
        if (b < 0.55) { // zhluk v uzle
          const ang = c * TAU + t * 0.6, rr = Math.sqrt(d) * Math.min(W, H) * 0.07;
          out[0] = nx + Math.cos(ang) * rr; out[1] = H * 0.5 + Math.sin(ang) * rr;
        } else { // bunky cestujú po čiare
          const x = (c * W * 0.72 + t * 60) % (W * 0.72) + W * 0.14;
          out[0] = x; out[1] = H * 0.5 + (d - 0.5) * 6;
        }
        return;
      }
      case 6: { // nápis
        const p = textPts[i];
        if (p) { out[0] = p.x + Math.sin(t * 1.5 + i) * 0.6; out[1] = p.y + Math.cos(t * 1.3 + i) * 0.6; }
        else { // nadbytočné bunky ostanú ako hviezdy okolo
          out[0] = a * W; out[1] = b * H;
        }
        return;
      }
    }
  }

  function stateAt(scroll: number) {
    if (!anchors.length) return 0;
    if (scroll <= anchors[0].y) return anchors[0].s;
    for (let k = 0; k < anchors.length - 1; k++) {
      const A = anchors[k], B = anchors[k + 1];
      if (scroll <= B.y) {
        const f = (scroll - A.y) / Math.max(1, B.y - A.y);
        return { a: A.s, b: B.s, f };
      }
    }
    return anchors[anchors.length - 1].s;
  }

  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const ta = [0, 0], tb = [0, 0];
  let last = performance.now();
  const t0 = last;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    const st = stateAt(window.scrollY);
    let sa: number, sb: number, f: number;
    if (typeof st === "number") { sa = sb = st; f = 0; }
    else {
      sa = st.a; sb = st.b;
      // tvar drží v strede úseku, prechod prebieha medzi
      const x = Math.min(1, Math.max(0, (st.f - 0.25) / 0.5));
      f = ease(x);
    }
    const textMode = (sa === 6 && f < 0.5) || (sb === 6 && f > 0.5);
    ctx.clearRect(0, 0, W, H);
    const k = 1 - Math.pow(0.0015, dt); // plynulé dobiehanie
    const buckets: number[][] = [[], [], [], [], []];
    for (let i = 0; i < N; i++) {
      target(sa, i, t, ta);
      if (f > 0) { target(sb, i, t, tb); ta[0] += (tb[0] - ta[0]) * f; ta[1] += (tb[1] - ta[1]) * f; }
      // myš jemne odtláča bunky
      const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14400) { const p = (1 - d2 / 14400) * 40; ta[0] += (dx / Math.sqrt(d2 + 1)) * p; ta[1] += (dy / Math.sqrt(d2 + 1)) * p; }
      // pri prelete cez okraj (vesmír, toky) bunku prenes bez preletu cez celú plochu
      if (Math.abs(ta[0] - px[i]) > W * 0.6) px[i] = ta[0];
      if (Math.abs(ta[1] - py[i]) > H * 0.6 && (sa === 0 || sb === 0)) py[i] = ta[1];
      px[i] += (ta[0] - px[i]) * k * (0.7 + r3[i] * 0.6);
      py[i] += (ta[1] - py[i]) * k * (0.7 + r4[i] * 0.6);
      let cc = col[i];
      if (textMode) { const p = textPts[i]; cc = p ? (p.o ? 4 : 3) : 0; }
      buckets[cc].push(i);
    }
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = COLORS[c];
      ctx.globalAlpha = c === 3 ? 0.85 : c === 4 ? 0.95 : 0.8;
      const b = buckets[c];
      for (let j = 0; j < b.length; j++) {
        const i = b[j], s = textMode ? Math.max(1.6, sz[i] * 0.9) : sz[i];
        ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  let raf = 0;
  resize();
  window.addEventListener("resize", () => { resize(); });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  document.fonts?.ready.then(() => { sampleText(); measureAnchors(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  if (reduced) frame(performance.now());
  else raf = requestAnimationFrame(frame);

  return { refresh: () => { measureAnchors(); } };
}
