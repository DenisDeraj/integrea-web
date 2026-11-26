// Galaxia na pozadí: znak „i“ v úvode sa pri scrolle rozplynie do galaxie,
// tá sa stále točí pod textom (scroll ju roztáča rýchlejšie) a na konci
// stránky sa celá zloží do loga Integrea Works.
const O = "#F0582B";
// 0–2 sivé, 3 biela, 4 oranžová, 5 čierna
const COLORS = ["#5A5C66", "#7E808A", "#B4B6BE", "#FFFFFF", O, "#0B0C0F"];

// tvar znaku v súradniciach viewBoxu (rovnaký ako SVG v HTML)
const MARK_LEFT = "M8,64 A34,34 0 0 1 42,30 H44 V92 H8 Z";
function drawMark(c: CanvasRenderingContext2D, x: number, y: number, s: number, white: string) {
  c.save();
  c.translate(x, y); c.scale(s, s);
  c.fillStyle = O; c.fill(new Path2D(MARK_LEFT)); c.fillRect(44, 8, 12, 12);
  c.fillStyle = white; c.fillRect(56, 30, 36, 62);
  c.restore();
}

type Pt = { x: number; y: number; c: number; g?: number };

export function initParticles(reduced: boolean) {
  const cv = document.createElement("canvas");
  cv.className = "cells";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d")!;
  let W = 0, H = 0, dpr = 1;
  const mobile = () => window.innerWidth < 700;
  const count = () => (mobile() ? 1500 : 3600);
  let N = 0;
  let px: Float32Array, py: Float32Array, r1: Float32Array, r2: Float32Array, r3: Float32Array, r4: Float32Array, sz: Float32Array;
  let col: Uint8Array;
  let markPts: Pt[] = [];
  let lastStep = 1, logoStep = 2; // znak v jednotkových súradniciach viewBoxu
  let logoPts: Pt[] = []; // logo na konci v pixeloch obrazovky
  const mouse = { x: -9999, y: -9999 };
  let heroP = 0; // priebeh úvodu 0–1 (nastavuje main.ts)
  let finA = 0, finB = 1; // scroll, kde sa začne a dokončí skladanie loga
  let solid = 0;
  let spin = 0, lastScroll = window.scrollY;

  function alloc() {
    N = count();
    px = new Float32Array(N); py = new Float32Array(N);
    r1 = new Float32Array(N); r2 = new Float32Array(N); r3 = new Float32Array(N); r4 = new Float32Array(N);
    sz = new Float32Array(N); col = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      r1[i] = Math.random(); r2[i] = Math.random(); r3[i] = Math.random(); r4[i] = Math.random();
      px[i] = W / 2; py[i] = H / 2;
      const c = Math.random();
      col[i] = c < 0.12 ? 4 : c < 0.22 ? 5 : c < 0.45 ? 0 : c < 0.7 ? 1 : c < 0.92 ? 2 : 3;
      // oranžové a čierne bodky sú výraznejšie
      const big = col[i] === 4 || col[i] === 5 ? Math.random() < 0.35 : Math.random() < 0.05;
      sz[i] = big ? 3 + Math.random() * 2.5 : 1 + Math.random() * 1.6;
    }
  }

  // vzorkovanie: vykresli, prečítaj pixely, vráť body s farbou
  function sample(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, target: number): Pt[] {
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const c = off.getContext("2d", { willReadFrequently: true })!;
    draw(c);
    const data = c.getImageData(0, 0, w, h).data;
    let filled = 0;
    for (let k = 3; k < data.length; k += 16) if (data[k] > 128) filled++;
    let step = Math.max(1, Math.ceil(Math.sqrt((filled * 4) / target)));
    lastStep = step;
    const pts: Pt[] = [];
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
      const k = (y * w + x) * 4;
      if (data[k + 3] > 128) pts.push({ x, y, c: data[k] > 200 && data[k + 1] < 150 ? 4 : 3 });
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts;
  }

  function sampleShapes() {
    // znak v úvode: viewBox -30 -60 160 160, vzorkujeme v mierke 3
    const S = 3;
    markPts = sample(160 * S, 160 * S, (c) => drawMark(c, 30 * S, 60 * S, S, "#fff"), N * 0.9)
      .map((p) => {
        const vx = p.x / S - 30, vy = p.y / S - 60;
        return { x: p.x / (160 * S), y: p.y / (160 * S), c: p.c, g: vy < 25 ? 2 : vx < 50 ? 0 : 1 };
      });

    // logo na konci: znak nad nápisom „Integrea Works“
    logoPts = sample(W, H, drawLogo, N);
    logoStep = lastStep;
    // ostrá verzia loga v plnom rozlíšení – bodky sa do nej na konci zlejú
    solidCv.width = W * dpr; solidCv.height = H * dpr;
    const sc2 = solidCv.getContext("2d")!;
    sc2.setTransform(dpr, 0, 0, dpr, 0, 0);
    sc2.clearRect(0, 0, W, H);
    drawLogo(sc2);
  }

  const solidCv = document.createElement("canvas");
  let logoBox = { x: 0, y: 0, w: 0, h: 0 };
  function drawLogo(c: CanvasRenderingContext2D) {
      const two = W < 700;
      const lines = two ? ["Integrea", "Works"] : ["Integrea Works"];
      const font = (n: number) => `700 ${n}px "Schibsted Grotesk", system-ui, sans-serif`;
      c.font = font(100);
      const wide = Math.max(...lines.map((l) => c.measureText(l).width));
      let fs = (100 * W * (two ? 0.84 : 0.7)) / wide;
      fs = Math.min(fs, H * (two ? 0.2 : 0.22));
      let lh = fs * 1.02;
      let markS = (fs * (two ? 1.5 : 1.7)) / 84; // výška znaku ~ 1,7 riadku
      let markH = 84 * markS, gap = fs * 0.35;
      let total = markH + gap + lines.length * lh;
      // celé logo sa musí vojsť do viditeľnej časti sekcie nad pätou
      const lim = window.innerHeight * (two ? 0.46 : 0.5);
      if (total > lim) {
        const q = lim / total;
        fs *= q; lh *= q; markS *= q; markH *= q; gap *= q; total = lim;
      }
      let y = H / 2 - total / 2;
      c.font = font(fs);
      const tw = Math.max(...lines.map((l) => c.measureText(l).width));
      logoBox = { x: W / 2 - tw / 2, y, w: tw, h: total };
      drawMark(c, W / 2 - 50 * markS, y - 8 * markS, markS, "#fff");
      y += markH + gap;
      c.font = font(fs); c.textBaseline = "top";
      lines.forEach((l, k) => {
        const lw = c.measureText(l).width, x0 = W / 2 - lw / 2, yy = y + k * lh;
        if (k === 0) { // oranžové I
          c.fillStyle = O; c.fillText("I", x0, yy);
          c.fillStyle = "#fff"; c.fillText(l.slice(1), x0 + c.measureText("I").width, yy);
        } else { c.fillStyle = "#fff"; c.fillText(l, x0, yy); }
      });
  }

  let finEl: HTMLElement | null = null;
  const vh = () => window.innerHeight;
  function measure() {
    const f = document.querySelector(".finale") as HTMLElement | null;
    finEl = f;
    if (!f) return;
    const top = f.getBoundingClientRect().top + window.scrollY;
    const v = vh();
    const max = document.documentElement.scrollHeight - v;
    finA = top - v * 0.9;
    finB = max;
    if (finB - finA < v * 0.4) finA = finB - v * 0.4;
  }

  let lastW = -1;
  function resize() {
    // na mobile sa pri scrolle mení výška (lišta prehliadača) – vtedy nič neprepočítavaj,
    // inak by sa celé logo znova vzorkovalo a stránka by sa sekala
    if (window.innerWidth === lastW && H > 0) return;
    lastW = window.innerWidth;
    dpr = Math.min(window.devicePixelRatio || 1, mobile() ? 1.5 : 2);
    W = window.innerWidth; H = mobile() ? Math.max(window.innerHeight, screen.height) : window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!px || px.length !== count()) alloc();
    sampleShapes();
    measure();
  }

  const TAU = Math.PI * 2;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // galaxia: dve ramená špirály, jadro a hviezdy okolo, stále sa točí
  function galaxy(i: number, t: number, out: number[]) {
    const a = r1[i], b = r2[i], c = r3[i], d = r4[i];
    const m = mobile();
    const cx = W * 0.5, cy = H * 0.52;
    const R = Math.max(W, H) * (m ? 0.62 : 0.5);
    const tilt = m ? 0.9 : 0.58;
    let rr: number, ang: number;
    if (d < 0.12) { // rozptýlené hviezdy
      rr = (0.35 + a * 0.9) * R; ang = b * TAU;
    } else if (d < 0.27) { // jadro
      rr = Math.pow(a, 1.6) * R * 0.18; ang = b * TAU;
    } else { // ramená
      const arm = c < 0.5 ? 0 : 1;
      rr = (0.06 + Math.pow(a, 0.85) * 0.94) * R;
      ang = arm * Math.PI + (rr / R) * 4.2 + (b - 0.5) * (0.35 + (rr / R) * 0.5);
    }
    // vnútro sa točí rýchlejšie ako okraj
    const w = 0.05 + 0.1 * (1 - rr / R);
    ang += t * w + spin * (0.4 + (1 - rr / R) * 0.6);
    const wob = Math.sin(t * 0.7 + a * 40) * 3;
    out[0] = cx + Math.cos(ang) * (rr + wob);
    out[1] = cy + Math.sin(ang) * (rr + wob) * tilt;
  }

  let markRect = { x: 0, y: 0, w: 0, h: 0 };
  const svgEl = () => document.querySelector(".hero-mark svg") as SVGSVGElement | null;
  function readMark() {
    const s = svgEl();
    if (!s) return;
    const r = s.getBoundingClientRect();
    markRect = { x: r.left, y: r.top, w: r.width, h: r.height };
    // posun jednotlivých častí znaku (polovice sa v úvode zbiehajú, bodka padá)
    const nat = [[8, 30], [56, 30], [44, 8]];
    [".hm-left", ".hm-right", ".hm-dot"].forEach((sel, k) => {
      const g = s.querySelector(sel);
      if (!g) return;
      const q = g.getBoundingClientRect();
      partOff[k][0] = (q.left - r.left) / r.width - (nat[k][0] + 30) / 160;
      partOff[k][1] = (q.top - r.top) / r.height - (nat[k][1] + 60) / 160;
    });
  }
  const partOff = [[0, 0], [0, 0], [0, 0]];
  const heroMarkEl = () => document.querySelector(".hero-mark") as HTMLElement | null;
  let brkHero = 0, brkFin = 0, idleHero = 99, idleFin = 99;

  const tg = [0, 0], tl = [0, 0];
  let last = performance.now();
  const t0 = last;
  const buckets: number[][] = [[], [], [], [], [], []];

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    const sc = window.scrollY;
    // scroll roztáča galaxiu
    spin += (sc - lastScroll) * 0.0009; lastScroll = sc;

    // úvod: body ležia na znaku, pri konci úvodu sa rozletia do galaxie
    const inHero = heroP < 1 && sc < H * 3;
    if (inHero) readMark();
    const fromMark = inHero ? 1 - ease(clamp((heroP - 0.84) / 0.16)) : 0;
    // myš nad znakom ho rozbije na bodky, po odchode sa znova zloží
    const pad = 40;
    const overHero = inHero && mouse.x > markRect.x - pad && mouse.x < markRect.x + markRect.w + pad && mouse.y > markRect.y - pad && mouse.y < markRect.y + markRect.h + pad;
    idleHero = overHero ? 0 : idleHero + dt;
    brkHero += ((overHero || idleHero < 0.5 ? (brkHero > 0.01 || overHero ? 1 : 0) : 0) - brkHero) * Math.min(1, dt * (overHero ? 10 : 2.5));
    if (brkHero < 0.002) brkHero = 0;
    const hm = heroMarkEl();
    if (hm) hm.classList.toggle("broken", brkHero > 0.15);
    const heroAlpha = inHero ? Math.max(clamp((heroP - 0.78) / 0.1), brkHero) : 1;
    // koniec: galaxia sa zloží do loga
    const toLogo = ease(clamp((sc - finA) / Math.max(1, finB - finA)));
    const logoMode = toLogo > 0.55;
    // keď sú bodky na mieste, zlejú sa do plného loga
    let ldy = 0;
    if (toLogo > 0 && finEl) { const r = finEl.getBoundingClientRect(); const a = Math.max(r.top, 64), b = Math.min(r.bottom, vh()); ldy = (a + b) / 2 - H / 2; }
    const bx = logoBox.x - 30, by = logoBox.y + ldy - 30;
    const overFin = toLogo > 0.5 && mouse.x > bx && mouse.x < bx + logoBox.w + 60 && mouse.y > by && mouse.y < by + logoBox.h + 60;
    idleFin = overFin ? 0 : idleFin + dt;
    brkFin += ((overFin || (idleFin < 0.6 && brkFin > 0.01) ? 1 : 0) - brkFin) * Math.min(1, dt * (overFin ? 12 : 3));
    const want = toLogo > 0.96 && brkFin < 0.5 ? 1 : 0;
    solid += (want - solid) * Math.min(1, dt * (want ? 1.6 : 14));
    if (solid < 0.001) solid = 0;
    // logo sa drží v strede sekcie .finale, takže ho päta neprekryje a pri scrolle ide so stránkou

    ctx.clearRect(0, 0, W, H);
    for (const b of buckets) b.length = 0;
    const k = 1 - Math.pow(0.002, dt);
    const nm = markPts.length, nl = logoPts.length;
    for (let i = 0; i < N; i++) {
      galaxy(i, t, tg);
      let x = tg[0], y = tg[1];
      if (fromMark > 0 && nm) {
        const p = markPts[i % nm];
        const o = partOff[p.g ?? 0];
        tl[0] = markRect.x + (p.x + o[0]) * markRect.w; tl[1] = markRect.y + (p.y + o[1]) * markRect.h;
        // každá bunka sa odlepí v trochu inom čase
        const f = clamp(fromMark * 1.6 - r3[i] * 0.6);
        x += (tl[0] - x) * f; y += (tl[1] - y) * f;
        if (fromMark >= 0.999 && brkHero === 0) { px[i] = tl[0]; py[i] = tl[1]; }
      }
      if (toLogo > 0 && nl) {
        const p = logoPts[i % nl];
        const f = clamp(toLogo * 1.5 - r4[i] * 0.5);
        const jx = p.x + Math.sin(t * 1.4 + i) * 0.6, jy = p.y + ldy + Math.cos(t * 1.2 + i) * 0.6;
        x += (jx - x) * f; y += (jy - y) * f;
      }
      const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900 && solid < 0.3) { const q = (1 - d2 / 16900) * 46 / Math.sqrt(d2 + 1); x += dx * q; y += dy * q; }
      const kk = fromMark >= 0.999 && brkHero === 0 ? 1 : k * (0.7 + r3[i] * 0.6);
      px[i] += (x - px[i]) * kk;
      py[i] += (y - py[i]) * kk;
      let cc = col[i];
      if (fromMark > 0.5 && nm) cc = markPts[i % nm].c;
      else if (logoMode && nl) cc = logoPts[i % nl].c;
      buckets[cc].push(i);
    }
    const shape = fromMark > 0.5 || logoMode;
    for (let c = 0; c < 6; c++) {
      const b = buckets[c];
      if (!b.length) continue;
      ctx.fillStyle = COLORS[c];
      ctx.globalAlpha = heroAlpha * (1 - solid) * (c === 3 ? 0.85 : c >= 4 ? 0.95 : 0.75);
      for (let j = 0; j < b.length; j++) {
        const i = b[j], s = shape ? Math.max(1.8, Math.min(2.6, sz[i])) : sz[i];
        ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s);
      }
    }
    if (solid > 0) { ctx.globalAlpha = Math.min(1, solid * 1.15); ctx.drawImage(solidCv, 0, ldy, W, H); }
    ctx.globalAlpha = 1;
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  let raf = 0;
  resize();
  window.addEventListener("resize", resize);
  // len myš; prst na mobile by bunky odtláčal aj po zdvihnutí a rozhádzal písmená
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") { mouse.x = mouse.y = -9999; return; }
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  document.fonts?.ready.then(() => { sampleShapes(); measure(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  if (reduced) { heroP = 1; frame(performance.now()); window.addEventListener("scroll", () => frame(performance.now()), { passive: true }); }
  else raf = requestAnimationFrame(frame);

  return {
    refresh: measure,
    hero: (p: number) => { heroP = p; },
  };
}
