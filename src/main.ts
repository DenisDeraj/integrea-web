import "@fontsource/schibsted-grotesk/400.css";
import "@fontsource/schibsted-grotesk/500.css";
import "@fontsource/schibsted-grotesk/700.css";
import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initQuiz } from "./quiz";
import { initParticles } from "./particles";

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initQuiz();
const cells = initParticles(reduced);
ScrollTrigger.addEventListener("refresh", () => cells.refresh());

// header border
const top = $(".top");
const onScroll = () => top.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// format number sk
const fmt = (n: number) => Math.round(n).toLocaleString("sk-SK");

if (reduced) {
  $$<HTMLElement>(".typed").forEach((el) => (el.textContent = el.dataset.text || ""));
  $$<HTMLElement>(".num").forEach((el) => (el.textContent = fmt(Number(el.dataset.v))));
  $$(".step").forEach((s) => s.classList.add("is-on"));
  $$(".scene").forEach((s, i) => ((s as HTMLElement).style.opacity = i === 0 ? "1" : "0"));
  $$(".proc li").forEach((l) => l.classList.add("on"));
} else {
  // smooth scroll
  const lenis = new Lenis({ duration: 1.15, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      e.preventDefault();
      lenis.scrollTo(id === "#" ? 0 : id, { offset: -10 });
    })
  );
  motion();
}

function motion() {
  const mm = gsap.matchMedia();

  /* ---------- HERO: pri scrolle dopadne štvorec na znak ---------- */
  gsap.set(".hm-dot", { y: -80 }); // štvorec čaká vysoko nad znakom

  const h1 = $(".hero h1");
  h1.innerHTML = h1.textContent!.trim().split(" ").map((w) => `<span class="wd">${[...w].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ");
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .from(".hero h1 .ch", { yPercent: 110, rotateX: -80, opacity: 0, duration: 1.2, stagger: 0.018, transformOrigin: "50% 100%" })
    .from(".lead, .actions", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, "-=0.8");


  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=110%",
      scrub: 1,
      pin: ".hero-pin",
      onUpdate: (st) => cells.hero(st.progress),
    },
  });
  heroTl
    // polovice znaku sú už spojené, pri scrolle iba dopadne štvorec
    .to(".hm-dot", { y: 0, ease: "power2.in", duration: 1 }, 0.05)
    .to(".hero-text", { opacity: 0.25, y: -30, ease: "none", duration: 0.6 }, 1.25)
    .to(".hero-mark", { scale: 0.9, ease: "none", duration: 0.6 }, 1.25)
    // znak sa rozplynie do galaxie (bunky preberajú jeho tvar)
    .to(".hero-mark svg", { opacity: 0, ease: "power1.in", duration: 0.25 }, 1.58);

  /* ---------- PRÍBEH: slová sa rozsvecujú ---------- */
  $$<HTMLElement>(".story .reveal").forEach((p) => {
    const words = p.textContent!.split(/([ \n\t]+)/);
    p.innerHTML = words.map((w) => (w.trim() ? `<span class="word">${w}</span>` : w)).join("");
    gsap.to($$(".word", p), {
      color: "#FFFFFF",
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 45%", scrub: true },
    });
  });

  /* ---------- UKÁŽKY: agent pracuje ---------- */
  const steps = $$(".step");
  const setStep = (i: number) => steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
  const typed = $(".typed");
  const full = typed.dataset.text || "";
  const typeObj = { p: 0 };
  const nums = $$<HTMLElement>(".scene-sum .num");
  const numObj = nums.map(() => ({ v: 0 }));
  const cnt = $(".tree .cnt");
  const cntObj = { v: 11 };

  gsap.set(".scene-mail, .scene-sum", { autoAlpha: 0 });
  gsap.set(".scene-chat .bot, .file-chip", { autoAlpha: 0, y: 16 });
  gsap.set(".doc", { autoAlpha: 0, scale: 0.85, y: 10 });
  gsap.set(".scene-sum tbody tr", { autoAlpha: 0, x: -20 });

  const demo = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: ".demos",
      start: "top top",
      end: "+=320%",
      scrub: 1,
      pin: ".demos-pin",
      onUpdate: (st) => setStep(st.progress < 0.36 ? 0 : st.progress < 0.68 ? 1 : 2),
    },
  });

  demo
    // 1 chat
    .to(typeObj, {
      p: 1, duration: 1.4, ease: "none",
      onUpdate: () => (typed.textContent = full.slice(0, Math.round(typeObj.p * full.length))),
    })
    .to(".send", { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1 })
    .to(".scene-chat .bubble.bot", { autoAlpha: 1, y: 0, duration: 0.5 }, "+=0.2")
    .to(".file-chip", { autoAlpha: 1, y: 0, duration: 0.5 })
    .to({}, { duration: 0.6 })
    // 2 mail
    .to(".scene-chat", { autoAlpha: 0, y: -20, duration: 0.4 })
    .to(".scene-mail", { autoAlpha: 1, duration: 0.4 }, "<0.1")
    .to(".doc", { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 })
    .to(".hl-1", { backgroundSize: "100% 100%", duration: 0.5, ease: "none" })
    .to(".hl-2", { backgroundSize: "100% 100%", duration: 0.5, ease: "none" })
    .to(".tr.target, .tr.target-in", { color: "#FFFFFF", borderLeftColor: "#F0582B", duration: 0.3 })
    .to(".doc", { x: () => window.innerWidth > 900 ? 170 : 0, y: () => window.innerWidth > 900 ? 40 : 150, scale: 0.12, autoAlpha: 0, duration: 0.8, ease: "power3.in" })
    .to(cntObj, { v: 12, duration: 0.1, onUpdate: () => (cnt.textContent = String(Math.round(cntObj.v))) })
    .to(".tr.target-in", { backgroundColor: "rgba(240,88,43,0.18)", duration: 0.2, yoyo: true, repeat: 1 })
    .to({}, { duration: 0.6 })
    // 3 sum
    .to(".scene-mail", { autoAlpha: 0, y: -20, duration: 0.4 })
    .to(".scene-sum", { autoAlpha: 1, duration: 0.4 }, "<0.1")
    .to(".scene-sum tbody tr", { autoAlpha: 1, x: 0, stagger: 0.35, duration: 0.4 });

  nums.forEach((el, i) => {
    demo.to(numObj[i], {
      v: Number(el.dataset.v), duration: 0.6, ease: "none",
      onUpdate: () => (el.textContent = fmt(numObj[i].v)),
    }, i === 0 ? "-=1.2" : "-=0.35");
  });
  demo.to({}, { duration: 0.6 });

  /* ---------- SLUŽBY: vodorovný posun (počítač) ---------- */
  mm.add("(min-width: 901px)", () => {
    const track = $(".track");
    const dist = () => track.scrollWidth - window.innerWidth + 40;
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: { trigger: ".services", start: "top top", end: () => "+=" + dist(), scrub: 0.6, pin: ".services-pin", invalidateOnRefresh: true },
    });
  });
  mm.add("(max-width: 900px)", () => {
    $$(".svc").forEach((s) =>
      gsap.from(s, { x: -30, opacity: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: s, start: "top 88%" } })
    );
  });

  /* ---------- PRE KOHO: nadpis sa posúva ---------- */
  gsap.fromTo(".who .big", { xPercent: 8 }, { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".who", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- POSTUP: čiara a body ---------- */
  const lis = $$(".proc li");
  gsap.to(".proc-fill", {
    scaleX: 1, ease: "none",
    scrollTrigger: {
      trigger: ".proc", start: "top 75%", end: "bottom 45%", scrub: true,
      onUpdate: (st) => lis.forEach((l, i) => l.classList.toggle("on", st.progress >= i / lis.length + 0.02)),
    },
  });
  lis.forEach((l, i) => gsap.from(l, { y: 30, opacity: 0, duration: 0.8, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: ".proc", start: "top 80%" } }));

  /* ---------- INSTAGRAM ---------- */
  gsap.from(".insta-handle", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".insta-handle", start: "top 90%" } });

  /* ---------- PÄTA: znak sa zloží pri príchode a pri prejdení myšou ---------- */
  const foot = gsap.timeline({ paused: true })
    .fromTo(".fm-left", { x: -30 }, { x: 0, duration: 0.7, ease: "power3.out" }, 0)
    .fromTo(".fm-right", { x: 30 }, { x: 0, duration: 0.7, ease: "power3.out" }, 0)
    .fromTo(".fm-dot", { y: -50 }, { y: 0, duration: 0.8, ease: "bounce.out" }, 0.35);
  ScrollTrigger.create({ trigger: ".foot", start: "top 95%", onEnter: () => foot.restart() });
  $(".foot-mark").addEventListener("mouseenter", () => foot.restart());
  $(".brand").addEventListener("mouseenter", () =>
    gsap.fromTo(".brand-mark rect:last-child", { y: -14 }, { y: 0, duration: 0.6, ease: "bounce.out" })
  );

  /* ---------- KOĽAJNICA: kde sa nachádzate ---------- */
  const label = $(".rail-label");
  gsap.to(".rail-fill", { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
  gsap.to(".rail-dot", { y: 170, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
  $$<HTMLElement>("main section[data-label]").forEach((s) =>
    ScrollTrigger.create({
      trigger: s, start: "top 50%", end: "bottom 50%",
      onToggle: (st) => { if (st.isActive) label.textContent = s.dataset.label || ""; },
    })
  );


  /* ---------- PÁS: beží a zrýchľuje sa podľa scrollu ---------- */
  const track = $(".band-track");
  let bandX = 0, vel = 0;
  const half = () => track.scrollWidth / 2;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { vel = st.getVelocity(); } });
  gsap.ticker.add((_t, dt) => {
    const v = 60 + Math.min(1800, Math.abs(vel)) * 0.6;
    bandX -= ((v * dt) / 1000) * (vel < -5 ? -1 : 1);
    const h = half();
    if (bandX < -h) bandX += h;
    if (bandX > 0) bandX -= h;
    gsap.set(track, { x: bandX, skewX: gsap.utils.clamp(-12, 12, -vel / 220) });
    vel *= 0.92;
  });

  /* ---------- KURZOR a magnetické tlačidlá ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    const cur = $(".cursor");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("pointermove", (e) => { xTo(e.clientX - 7); yTo(e.clientY - 7); });
    $$("a, button, select, input, textarea, label.chk").forEach((el) => {
      el.addEventListener("mouseenter", () => cur.classList.add("big"));
      el.addEventListener("mouseleave", () => cur.classList.remove("big"));
    });
    $$(".btn, .nav-cta").forEach((b) => {
      b.addEventListener("pointermove", (e: Event) => {
        const pe = e as PointerEvent, r = b.getBoundingClientRect();
        gsap.to(b, { x: (pe.clientX - r.left - r.width / 2) * 0.3, y: (pe.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: "power3.out" });
      });
      b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
    });
  }

  /* ---------- NADPISY: písmená sa skladajú pri scrolle ---------- */
  $$<HTMLElement>("main h2:not(.sr)").forEach((h) => {
    if (h.closest(".demos") || h.closest(".services")) return;
    h.innerHTML = h.textContent!.trim().split(" ").map((w) => `<span class="wd" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch" style="display:inline-block">${c}</span>`).join("")}</span>`).join(" ");
    gsap.from($$(".ch", h), {
      yPercent: 100, opacity: 0, rotate: 8, stagger: 0.015, duration: 0.9, ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 85%" },
    });
  });

  /* ---------- SLUŽBY: naklonenie podľa rýchlosti ---------- */
  ScrollTrigger.create({
    trigger: ".services", start: "top bottom", end: "bottom top",
    onUpdate: (st) => gsap.to(".svc", { skewX: gsap.utils.clamp(-8, 8, st.getVelocity() / -300), duration: 0.4, overwrite: true }),
  });

  /* ---------- DOTAZNÍK: biela plocha sa otvorí ako okno ---------- */
  gsap.fromTo(".form-sec", { clipPath: "inset(12% 8% 12% 8%)" }, {
    clipPath: "inset(0% 0% 0% 0%)", ease: "none",
    scrollTrigger: { trigger: ".form-sec", start: "top bottom", end: "top 25%", scrub: true },
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
