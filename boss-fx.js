/* ============================================================
   DIGIT ROLL — BOSS SHOW
   The breakthrough cutscene, the boss HUD (figure, health bar,
   timer, cursed rolls beside it) and the random stunts each boss
   pulls for the rest of the event. Everything is canvas + CSS.
   Exposes window.drBossFx, which boss.js calls.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const $id = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const nf = (v) => {
    v = Number(v) || 0;
    if (Math.abs(v) >= 1e15) return v.toExponential(2).replace("e+", " × 10^");
    return Math.round(v).toLocaleString();
  };
  const RM = () =>
    !!(
      G.matchMedia && G.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const M = () => G.drBossMusic || {};
  const msfx = (n) => {
    try {
      M().sfx && M().sfx(n);
    } catch (e) {}
  };

  const FIG = {
    golem: "🗿",
    titan: "🤖",
    reality: "👁️",
    mimic: "🧰",
    wraith: "🕰️",
  };
  const TAUNTS = {
    golem: [
      "GRRRMMMM…",
      "CRUSH.",
      "YOU ARE PEBBLES.",
      "STONE DOES NOT FORGET.",
      "ROLL AND BE BROKEN.",
    ],
    titan: [
      "KNEEL.",
      "BEHOLD THE ABYSS.",
      "I AM THE STORM.",
      "YOUR DIGITS ARE DUST.",
      "COUNT YOUR LAST XP.",
    ],
    mimic: [
      "CHOMP!",
      "SHINY, ISN'T IT?",
      "LOOT ME. I DARE YOU.",
      "THE TREASURE BITES BACK.",
      "GOLD... FOR ME.",
    ],
    wraith: [
      "TICK. TOCK.",
      "YOUR TIME IS UP.",
      "I'VE SEEN THIS ROLL BEFORE.",
      "REWIND. AGAIN.",
      "EVERY SECOND IS MINE.",
    ],
    reality: [
      "1 + 1 = ?",
      "NUMBERS ARE LIES.",
      "I UNMAKE THE DIGITS.",
      "THERE IS NO ROLL.",
      "NaN NaN NaN",
    ],
  };

  let ev = null;
  let cfg = null;
  let hud = null;
  let stage = null;
  let cv = null;
  let cx = null;
  let W = 0;
  let H = 0;
  let parts = [];
  let fxs = [];
  let raf = 0;
  let stuntTimer = null;
  let introTimers = [];
  let cracks = null;
  let boardEl = null;
  let curseFlashT = 0;
  let lastHpShown = -1;
  let lastEndAt = 0;
  let running = false;

  /* ==========================================================
     CSS
     ========================================================== */

  function injectCSS() {
    if ($id("drBsCSS")) return;
    const st = document.createElement("style");
    st.id = "drBsCSS";
    st.textContent = `
      #drBsCanvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:10090;pointer-events:none}
      .drBsStage{position:fixed;inset:0;z-index:10095;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:auto;background:rgba(0,0,0,0);transition:background .8s,opacity .9s;text-align:center;color:#fff}
      .drBsStage.dark{background:rgba(2,3,8,.82)}
      .drBsStage.out{opacity:0;pointer-events:none}
      .drBsWarn{position:absolute;top:12vh;font:900 clamp(20px,4vw,42px)/1 system-ui,sans-serif;letter-spacing:.3em;color:#ff4d5e;text-shadow:0 0 18px #ff1030;animation:drBsBlink .45s steps(2) infinite}
      @keyframes drBsBlink{50%{opacity:.15}}
      .drBsTitle{position:absolute;bottom:14vh;left:0;right:0;padding:0 16px;font:900 clamp(30px,7vw,82px)/1.02 system-ui,sans-serif;letter-spacing:.04em;color:var(--bc);text-shadow:0 0 30px var(--bc),0 6px 0 rgba(0,0,0,.6);animation:drBsSlam .55s cubic-bezier(.2,1.6,.4,1) both}
      .drBsSub{position:absolute;bottom:9vh;left:0;right:0;font:800 clamp(13px,2vw,20px)/1.2 system-ui,sans-serif;color:#fff;letter-spacing:.14em;text-transform:uppercase;opacity:.85;animation:drBsFade .8s .5s both}
      @keyframes drBsSlam{0%{transform:scale(3.4);opacity:0}60%{opacity:1}100%{transform:scale(1)}}
      @keyframes drBsFade{from{opacity:0}to{opacity:.85}}
      .drBsSkip{position:absolute;right:16px;bottom:14px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.5);color:#fff;border-radius:10px;padding:7px 12px;font-weight:800;cursor:pointer;z-index:2}
      .drBsFlash{position:fixed;inset:0;z-index:10092;pointer-events:none;opacity:0}
      .drBsInvert{position:fixed;inset:0;z-index:10092;pointer-events:none;background:#fff;mix-blend-mode:difference}

      .drBsHud{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9500;width:min(760px,96vw);display:flex;gap:12px;align-items:stretch;padding:10px 12px;border-radius:18px;color:#fff;pointer-events:none;
        background:linear-gradient(135deg,rgba(8,10,18,.94),color-mix(in srgb,var(--bc) 22%,rgba(8,10,18,.94)));border:2px solid var(--bc);box-shadow:0 0 28px color-mix(in srgb,var(--bc) 55%,transparent),0 14px 40px rgba(0,0,0,.55);animation:drBsHudIn .7s cubic-bezier(.2,1.4,.4,1) both}
      @keyframes drBsHudIn{from{transform:translate(-50%,-140%) scale(1.1);opacity:0}}
      .drBsHud.hit{animation:drBsHudHit .5s}
      @keyframes drBsHudHit{0%,100%{transform:translateX(-50%)}20%{transform:translateX(calc(-50% - 9px))}40%{transform:translateX(calc(-50% + 9px))}60%{transform:translateX(calc(-50% - 5px))}}
      .drBsFig{position:relative;width:78px;min-width:78px;display:flex;align-items:center;justify-content:center;font-size:58px;line-height:1}
      .drBsFig span{display:block;filter:drop-shadow(0 0 12px var(--bc))}
      .drBsHud.golem .drBsFig span{animation:drBsBreathe 3s ease-in-out infinite}
      .drBsHud.titan .drBsFig span{animation:drBsHover 2.2s ease-in-out infinite}
      .drBsHud.reality .drBsFig span{animation:drBsJit .35s steps(2) infinite,drBsHue 4s linear infinite}
      @keyframes drBsBreathe{50%{transform:scale(1.1) translateY(2px)}}
      @keyframes drBsHover{50%{transform:translateY(-6px) rotate(3deg)}}
      @keyframes drBsJit{0%{transform:translate(0,0)}50%{transform:translate(2px,-2px) skewX(6deg)}100%{transform:translate(-2px,1px)}}
      @keyframes drBsHue{to{filter:drop-shadow(0 0 12px #f0f) hue-rotate(360deg)}}
      .drBsMain{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px}
      .drBsName{display:flex;justify-content:space-between;gap:8px;font:900 15px/1.1 system-ui,sans-serif;letter-spacing:.06em;color:var(--bc)}
      .drBsTime{color:#fff;font-variant-numeric:tabular-nums}
      .drBsHp{position:relative;height:22px;border-radius:999px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);overflow:hidden}
      .drBsHpTrail{position:absolute;inset:0 auto 0 0;background:rgba(255,255,255,.55);transition:width 1.1s .25s}
      .drBsHpFill{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--bc),color-mix(in srgb,var(--bc) 50%,#fff));transition:width .35s}
      .drBsHpTxt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 12px system-ui,sans-serif;text-shadow:0 1px 3px #000}
      .drBsMeta{font:700 12px/1.3 system-ui,sans-serif;color:#c7d0e4}
      .drBsMeta b{color:#fff}
      .drBsTop{font:700 11px/1.3 system-ui,sans-serif;color:#ffd98a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .drBsTop b{color:#fff}
      .drBsMeta .dq{color:#ff6b7a;font-weight:900}
      .drBsCurse{min-width:104px;display:flex;flex-direction:column;justify-content:center;gap:4px;padding-left:10px;border-left:1px solid rgba(255,255,255,.14)}
      .drBsCurseT{font:900 9px system-ui,sans-serif;letter-spacing:.14em;color:#ff7a8a}
      .drBsCombo{display:flex;gap:3px}
      .drBsChip{width:19px;height:23px;border-radius:5px;background:#1b0f16;border:1px solid #ff5470;color:#ffd3da;font:900 14px/21px ui-monospace,monospace;text-align:center;box-shadow:0 0 8px rgba(255,60,90,.45)}
      .drBsHud.cursedHit .drBsChip{animation:drBsChipHit .6s}
      @keyframes drBsChipHit{30%{background:#ff3355;color:#fff;transform:translateY(-4px) scale(1.2)}}
      .drBsMute{pointer-events:auto;position:absolute;right:8px;top:-12px;border:1px solid rgba(255,255,255,.25);background:rgba(8,10,18,.95);color:#fff;border-radius:999px;width:28px;height:28px;cursor:pointer;font-size:13px}
      .drBsSay{position:absolute;left:8px;top:calc(100% + 6px);max-width:80%;padding:5px 10px;border-radius:10px;background:var(--bc);color:#000;font:900 13px system-ui,sans-serif;animation:drBsSay 2.4s both;pointer-events:none}
      @keyframes drBsSay{0%{opacity:0;transform:translateY(-6px) scale(.8)}12%,80%{opacity:1;transform:none}100%{opacity:0}}
      .drBsFloat{position:fixed;z-index:9600;pointer-events:none;font:900 18px system-ui,sans-serif;color:#fff;text-shadow:0 0 8px var(--bc),0 2px 2px #000;animation:drBsFloat 1.2s ease-out both}
      @keyframes drBsFloat{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-60px) scale(1.25)}}
      .drBsCurseTxt{position:fixed;left:50%;top:34%;z-index:9700;transform:translateX(-50%);pointer-events:none;font:900 clamp(22px,4vw,44px) system-ui,sans-serif;color:#ff4d6a;text-shadow:0 0 20px #f03,0 3px 0 #000;animation:drBsCurseTxt 1.6s both}
      @keyframes drBsCurseTxt{0%{opacity:0;transform:translateX(-50%) scale(2.2)}15%{opacity:1;transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
      .drBsRock{position:fixed;z-index:9400;pointer-events:none;font-size:64px;will-change:transform}
      .drBsErr{position:fixed;z-index:9650;pointer-events:none;min-width:210px;background:#c0c0c0;color:#000;border:2px solid #fff;border-right-color:#555;border-bottom-color:#555;font:12px Tahoma,sans-serif;box-shadow:4px 4px 0 rgba(0,0,0,.5);animation:drBsErr 3s both}
      .drBsErr b{display:block;background:linear-gradient(90deg,#000080,#1084d0);color:#fff;padding:3px 6px}
      .drBsErr p{margin:0;padding:10px}
      @keyframes drBsErr{0%{opacity:0}8%,88%{opacity:1}100%{opacity:0}}
      .drBsRes{position:fixed;inset:0;z-index:10080;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);animation:drBsFade 0s}
      .drBsResBox{width:min(460px,92vw);text-align:center;padding:26px;border-radius:22px;color:#fff;border:2px solid var(--bc);background:rgba(10,12,20,.97);box-shadow:0 0 50px color-mix(in srgb,var(--bc) 60%,transparent);animation:drBsSlam .6s both}
      .drBsResBox h2{margin:0 0 6px;font:900 30px system-ui,sans-serif;color:var(--bc)}
      .drBsResBox button{margin-top:14px;border:0;border-radius:12px;padding:10px 22px;font-weight:900;cursor:pointer;background:var(--bc);color:#000}
      .drBsBroken{animation:drBsRumble 4.5s ease-in-out infinite}
      @keyframes drBsRumble{0%,92%,100%{transform:none}94%{transform:translate(2px,-1px) rotate(.12deg)}96%{transform:translate(-2px,1px) rotate(-.12deg)}98%{transform:translate(1px,0)}}
      .drBsCracks{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;overflow:visible}
      .drBsCracks path{fill:none;stroke:var(--bc);stroke-width:2.4;stroke-linecap:round;filter:drop-shadow(0 0 5px var(--bc));stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:drBsDraw 1.2s ease-out forwards}
      @keyframes drBsDraw{to{stroke-dashoffset:0}}
      @media(max-width:640px){.drBsHud{flex-wrap:wrap}.drBsCurse{border-left:0;padding-left:0;flex-direction:row;align-items:center;flex-wrap:wrap;width:100%}.drBsFig{width:54px;min-width:54px;font-size:40px}}
    `;
    document.head.appendChild(st);
  }

  /* ==========================================================
     CANVAS ENGINE
     ========================================================== */

  function ensureCanvas() {
    injectCSS();
    if (!cv) {
      cv = document.createElement("canvas");
      cv.id = "drBsCanvas";
      document.body.appendChild(cv);
      cx = cv.getContext("2d");
      G.addEventListener("resize", sizeCanvas);
    }
    sizeCanvas();
  }
  function sizeCanvas() {
    if (!cv) return;
    W = cv.width = G.innerWidth;
    H = cv.height = G.innerHeight;
  }

  function add(p) {
    if (parts.length > 700) parts.shift();
    parts.push(
      Object.assign(
        {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          g: 0,
          life: 1,
          max: 1,
          size: 6,
          color: "#fff",
          rot: 0,
          vr: 0,
          shape: "rect",
          drag: 1,
          alpha: 1,
        },
        p,
        { max: p.life || 1 },
      ),
    );
  }
  function fx(dur, draw, delay) {
    const o = {
      t0: performance.now() + (delay || 0) * 1000,
      dur: dur * 1000,
      draw,
    };
    fxs.push(o);
    loop();
    return o;
  }

  function loop() {
    if (raf) return;
    let last = performance.now();
    const frame = (now) => {
      raf = 0;
      if (!cx) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cx.clearRect(0, 0, W, H);
      fxs = fxs.filter((f) => now - f.t0 < f.dur);
      fxs.forEach((f) => {
        if (now < f.t0) return;
        cx.save();
        try {
          f.draw(cx, (now - f.t0) / f.dur, W, H, (now - f.t0) / 1000);
        } catch (e) {}
        cx.restore();
      });
      parts = parts.filter((p) => (p.life -= dt) > 0);
      parts.forEach((p) => {
        p.vy += p.g * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        const a =
          Math.max(0, Math.min(1, p.life / Math.min(0.6, p.max))) * p.alpha;
        cx.save();
        cx.globalAlpha = a;
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.fillStyle = p.color;
        cx.strokeStyle = p.color;
        if (p.shape === "circle") {
          cx.beginPath();
          cx.arc(0, 0, p.size, 0, 7);
          cx.fill();
        } else if (p.shape === "tri") {
          cx.beginPath();
          cx.moveTo(0, -p.size);
          cx.lineTo(p.size * 0.9, p.size * 0.7);
          cx.lineTo(-p.size * 0.9, p.size * 0.5);
          cx.closePath();
          cx.fill();
        } else if (p.shape === "text") {
          cx.font = `900 ${p.size}px ui-monospace,monospace`;
          cx.textAlign = "center";
          cx.fillText(p.text, 0, 0);
        } else {
          cx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
        }
        cx.restore();
      });
      if (parts.length || fxs.length) raf = requestAnimationFrame(frame);
      else cx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(frame);
  }

  /* ---------- reusable visuals ---------- */

  function burst(x, y, n, o) {
    o = o || {};
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      const sp = rnd(o.min || 120, o.max || 520);
      add({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (o.up || 0),
        g: o.g === undefined ? 900 : o.g,
        life: rnd(o.l0 || 0.8, o.l1 || 1.8),
        size: rnd(o.s0 || 4, o.s1 || 16),
        color: pick(o.colors || ["#d6a273"]),
        rot: rnd(0, 6),
        vr: rnd(-8, 8),
        shape: o.shape || "rect",
        drag: o.drag || 0.99,
      });
    }
  }

  function bolt(x1, y1, x2, y2, color, life, width) {
    const pts = [[x1, y1]];
    const segs = 14;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      pts.push([
        x1 + (x2 - x1) * t + rnd(-38, 38),
        y1 + (y2 - y1) * t + rnd(-14, 14),
      ]);
    }
    pts.push([x2, y2]);
    fx(life || 0.35, (c, p) => {
      c.globalAlpha = 1 - p;
      c.lineCap = "round";
      c.strokeStyle = color || "#bfe6ff";
      c.shadowColor = color || "#38bdf8";
      c.shadowBlur = 24;
      c.lineWidth = width || 5;
      c.beginPath();
      pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
      c.stroke();
      c.strokeStyle = "#fff";
      c.lineWidth = (width || 5) / 3;
      c.stroke();
    });
  }

  function ring(x, y, color, dur, maxR, delay) {
    fx(
      dur,
      (c, p) => {
        c.globalAlpha = 1 - p;
        c.strokeStyle = color;
        c.lineWidth = 12 * (1 - p) + 2;
        c.shadowColor = color;
        c.shadowBlur = 20;
        c.beginPath();
        c.arc(x, y, maxR * p, 0, 7);
        c.stroke();
      },
      delay,
    );
  }

  function flash(color, a, ms) {
    const d = document.createElement("div");
    d.className = "drBsFlash";
    d.style.background = color;
    document.body.appendChild(d);
    d.animate([{ opacity: a }, { opacity: 0 }], {
      duration: ms,
      easing: "ease-out",
    }).onfinish = () => d.remove();
  }

  function invert(ms) {
    const d = document.createElement("div");
    d.className = "drBsInvert";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
  }

  function shake(el, ms, amp) {
    if (!el || RM() || !el.animate) return;
    const f = [];
    for (let i = 0; i < 10; i++)
      f.push({
        transform: `translate(${rnd(-amp, amp)}px,${rnd(-amp, amp)}px) rotate(${rnd(-amp / 14, amp / 14)}deg)`,
      });
    f.push({ transform: "none" });
    el.animate(f, { duration: ms, easing: "ease-out" });
  }
  const shakeAll = (ms, amp) => {
    shake(boardEl, ms, amp);
    shake(hud, ms, amp / 2);
  };

  function hugeText(text, x0, y0, x1, y1, size, dur, color, delay, shakeAmt) {
    return fx(
      dur,
      (c, p, w, h, t) => {
        const e = 1 - Math.pow(1 - Math.min(1, p * 1.6), 3);
        const x = (x0 + (x1 - x0) * e) * w;
        const y = (y0 + (y1 - y0) * e) * h;
        c.globalAlpha = Math.min(1, p * 5) * (p > 0.9 ? (1 - p) * 10 : 1);
        c.font = `${size}px serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.shadowColor = color;
        c.shadowBlur = 60;
        const sx = shakeAmt ? rnd(-shakeAmt, shakeAmt) : 0;
        const sy = shakeAmt ? rnd(-shakeAmt, shakeAmt) : 0;
        c.fillText(text, x + sx, y + sy);
      },
      delay,
    );
  }

  function boardShards(colors, reverse, n) {
    const r = boardEl
      ? boardEl.getBoundingClientRect()
      : { left: W * 0.15, top: H * 0.2, width: W * 0.7, height: H * 0.5 };
    for (let i = 0; i < (n || 46); i++) {
      add({
        x: r.left + Math.random() * r.width,
        y: r.top + Math.random() * Math.min(r.height, H),
        vx: rnd(-220, 220),
        vy: reverse ? rnd(-520, -120) : rnd(-260, 80),
        g: reverse ? -260 : 1100,
        life: rnd(1.6, 3),
        size: rnd(16, 52),
        color: pick(colors),
        rot: rnd(0, 6),
        vr: rnd(-6, 6),
        shape: Math.random() < 0.5 ? "tri" : "rect",
      });
    }
  }

  function addCracks(color) {
    removeCracks();
    const panel = boardEl;
    if (!panel) return;
    if (getComputedStyle(panel).position === "static")
      panel.style.position = "relative";
    const rect = panel.getBoundingClientRect();
    const w = rect.width;
    const h = Math.min(rect.height, 520);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "drBsCracks");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.setProperty("--bc", color);
    svg.style.height = h + "px";
    const cx0 = w * rnd(0.35, 0.65);
    const cy0 = h * rnd(0.3, 0.6);
    for (let i = 0; i < 9; i++) {
      let x = cx0;
      let y = cy0;
      let a = (i / 9) * Math.PI * 2 + rnd(-0.3, 0.3);
      let d = `M${x},${y}`;
      let len = 0;
      for (let s = 0; s < 8; s++) {
        const st = rnd(30, 80);
        a += rnd(-0.55, 0.55);
        x += Math.cos(a) * st;
        y += Math.sin(a) * st;
        len += st;
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      path.style.setProperty("--l", Math.ceil(len * 1.4));
      path.style.animationDelay = (i * 0.05).toFixed(2) + "s";
      svg.appendChild(path);
    }
    panel.appendChild(svg);
    cracks = svg;
    panel.classList.add("drBsBroken");
  }
  function removeCracks() {
    if (cracks) cracks.remove();
    cracks = null;
    if (boardEl) boardEl.classList.remove("drBsBroken");
  }

  /* ==========================================================
     CUTSCENES (one per boss)
     ========================================================== */

  function later(ms, fn) {
    const id = setTimeout(() => {
      if (running) fn();
    }, ms);
    introTimers.push(id);
  }

  const SCENES = {
    golem(S) {
      later(0, () => msfx("warn"));
      // ground cracks creeping up the screen
      later(1000, () => {
        for (let k = 0; k < 7; k++) {
          const sx = W * (0.1 + k * 0.13);
          const pts = [[sx, H]];
          let x = sx;
          let y = H;
          while (y > H * rnd(0.25, 0.6)) {
            x += rnd(-40, 40);
            y -= rnd(30, 70);
            pts.push([x, y]);
          }
          fx(
            2.4,
            (c, p) => {
              c.strokeStyle = "#ffcf94";
              c.shadowColor = "#ff9a3c";
              c.shadowBlur = 14;
              c.lineWidth = 4;
              c.globalAlpha = p > 0.85 ? (1 - p) * 6 : 1;
              c.beginPath();
              const n = Math.max(
                2,
                Math.floor(pts.length * Math.min(1, p * 1.6)),
              );
              for (let i = 0; i < n; i++)
                i
                  ? c.lineTo(pts[i][0], pts[i][1])
                  : c.moveTo(pts[i][0], pts[i][1]);
              c.stroke();
            },
            k * 0.08,
          );
        }
      });
      const punch = (xf, big) => {
        const x = W * xf;
        msfx("thud");
        shakeAll(700, big ? 26 : 16);
        flash("#fff2dc", big ? 0.5 : 0.3, 380);
        burst(x, H * 0.9, big ? 130 : 80, {
          colors: ["#8a6a4a", "#6b5238", "#b48a5d", "#3d2f22"],
          up: 700,
          min: 120,
          max: 700,
        });
        burst(x, H * 0.85, 22, {
          colors: ["rgba(214,170,120,.5)"],
          shape: "circle",
          g: -30,
          s0: 24,
          s1: 56,
          l0: 1.2,
          l1: 2.4,
          min: 20,
          max: 160,
          drag: 0.97,
        });
        // stone slab thrusting up
        fx(1.1, (c, p) => {
          const rise =
            Math.sin(Math.min(1, p * 1.5) * Math.PI) *
            (big ? H * 0.5 : H * 0.34);
          c.fillStyle = "#6b5238";
          c.strokeStyle = "#2c2118";
          c.lineWidth = 5;
          const wd = big ? 190 : 130;
          c.beginPath();
          c.moveTo(x - wd / 2, H);
          c.lineTo(x - wd / 2 + 10, H - rise);
          c.lineTo(x - wd / 4, H - rise - 28);
          c.lineTo(x + wd / 4, H - rise - 20);
          c.lineTo(x + wd / 2 - 8, H - rise);
          c.lineTo(x + wd / 2, H);
          c.closePath();
          c.fill();
          c.stroke();
        });
      };
      later(2300, () => punch(0.28, false));
      later(3100, () => punch(0.72, false));
      later(3900, () => {
        punch(0.5, true);
        boardShards(["#3a3128", "#59463a", "#7d6650", "#1c1814"], false, 60);
        addCracks(cfg.color);
      });
      later(4300, () =>
        hugeText(
          FIG.golem,
          0.5,
          1.2,
          0.5,
          0.46,
          Math.min(W, H) * 0.7,
          3.4,
          "#ffb35c",
          0,
          4,
        ),
      );
    },

    titan(S) {
      later(0, () => msfx("warn"));
      const strike = () => {
        msfx("zap");
        const x = rnd(W * 0.1, W * 0.9);
        bolt(x, 0, x + rnd(-80, 80), H * rnd(0.5, 1), "#bfe6ff", 0.4, 6);
        flash("#cfeaff", 0.55, 260);
        shakeAll(380, 10);
      };
      [500, 1300, 2000].forEach((t) => later(t, strike));
      // the sky tears open
      later(2400, () => {
        msfx("thud");
        shakeAll(1600, 20);
        fx(2.6, (c, p, w, h) => {
          const open = Math.min(1, p * 2.2) * w * 0.28;
          // blinding light
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(200,235,255,.95)");
          g.addColorStop(1, "rgba(56,189,248,0)");
          c.fillStyle = g;
          c.globalAlpha = p > 0.8 ? (1 - p) * 5 : 0.9;
          c.beginPath();
          c.moveTo(w / 2 - open * 0.4, 0);
          c.lineTo(w / 2 + open * 0.4, 0);
          c.lineTo(w / 2 + open * 1.4, h);
          c.lineTo(w / 2 - open * 1.4, h);
          c.fill();
          c.globalAlpha = p > 0.8 ? (1 - p) * 5 : 1;
          c.fillStyle = "#1d2433";
          c.strokeStyle = "#7f8ba3";
          c.lineWidth = 4;
          [-1, 1].forEach((s) => {
            c.beginPath();
            c.moveTo(w / 2 + s * open * 0.4, 0);
            c.lineTo(w / 2 + s * w * 0.6, 0);
            c.lineTo(w / 2 + s * w * 0.6, h * 0.12);
            c.lineTo(w / 2 + s * open * 0.4 + s * 34, h * 0.12 - 18);
            c.closePath();
            c.fill();
            c.stroke();
          });
        });
        burst(W / 2, H * 0.12, 90, {
          colors: ["#bfe6ff", "#38bdf8", "#fff"],
          shape: "circle",
          s0: 2,
          s1: 6,
          up: 100,
          g: 700,
          min: 80,
          max: 600,
        });
      });
      later(3500, () => {
        msfx("zap");
        [0, 0.18, 0.36].forEach((d, i) =>
          ring(
            W / 2,
            H * 0.5,
            i === 1 ? "#fff" : "#38bdf8",
            1.4,
            Math.max(W, H) * 0.75,
            d,
          ),
        );
        bolt(W / 2, 0, W / 2, H * 0.55, "#fff", 0.6, 10);
        flash("#fff", 0.8, 500);
        boardShards(["#0f2438", "#1d4a6e", "#7fcaff", "#e8f6ff"], false, 60);
        addCracks(cfg.color);
        shakeAll(1000, 24);
      });
      later(4100, () =>
        hugeText(
          FIG.titan,
          0.5,
          -0.2,
          0.5,
          0.46,
          Math.min(W, H) * 0.65,
          3.2,
          "#38bdf8",
          0,
          2,
        ),
      );
    },

    mimic(S) {
      later(0, () => msfx("warn"));
      // a treasure chest "appears" and shines, coins spill
      later(900, () => {
        fx(2.2, (c, p, w, h) => {
          const g = c.createRadialGradient(
            w / 2,
            h * 0.6,
            10,
            w / 2,
            h * 0.6,
            h * 0.6,
          );
          g.addColorStop(0, "rgba(255,225,120,.75)");
          g.addColorStop(1, "rgba(255,200,60,0)");
          c.globalAlpha = Math.sin(Math.min(1, p) * Math.PI);
          c.fillStyle = g;
          c.fillRect(0, 0, w, h);
        });
        for (let i = 0; i < 40; i++)
          add({
            x: rnd(0, W),
            y: -rnd(20, 300),
            vy: rnd(250, 600),
            g: 500,
            life: rnd(2, 3.5),
            size: rnd(10, 22),
            color: pick(["#f5c542", "#ffe08a", "#d19a1c"]),
            shape: "circle",
          });
        loop();
      });
      const chomp = (big) => {
        msfx("thud");
        shakeAll(500, big ? 22 : 12);
        flash("#fff1b8", big ? 0.5 : 0.3, 300);
        fx(0.7, (c, p, w, h) => {
          const e = Math.sin(Math.min(1, p) * Math.PI);
          c.fillStyle = "#0b0814";
          c.strokeStyle = "#f5c542";
          c.lineWidth = 4;
          [-1, 1].forEach((s) => {
            c.beginPath();
            const y = s < 0 ? 0 : h;
            c.moveTo(0, y);
            for (let i = 0; i <= 12; i++) {
              const x = (w / 12) * i;
              c.lineTo(x, y - s * -(h * 0.32 * e) * (i % 2 ? 1 : 0.6));
            }
            c.lineTo(w, y);
            c.closePath();
            c.fill();
            c.stroke();
          });
        });
      };
      later(2300, () => chomp(false));
      later(3200, () => chomp(false));
      later(4000, () => {
        chomp(true);
        burst(W / 2, H * 0.5, 150, {
          colors: ["#f5c542", "#ffe08a", "#fff", "#d19a1c"],
          shape: "circle",
          s0: 5,
          s1: 14,
          g: 800,
          min: 200,
          max: 900,
        });
        boardShards(["#2b2210", "#6b5416", "#f5c542", "#fff1b8"], false, 60);
        addCracks(cfg.color);
      });
      later(4300, () =>
        hugeText(
          FIG.mimic,
          0.5,
          1.2,
          0.5,
          0.46,
          Math.min(W, H) * 0.65,
          3.2,
          "#f5c542",
          0,
          5,
        ),
      );
    },

    wraith(S) {
      later(0, () => msfx("warn"));
      // a giant clock face ticks backwards
      later(900, () => {
        fx(5.2, (c, p, w, h, t) => {
          const R = Math.min(w, h) * (0.12 + 0.3 * Math.min(1, p * 1.5));
          c.translate(w / 2, h / 2);
          c.globalAlpha = p > 0.85 ? (1 - p) * 6 : 0.9;
          c.strokeStyle = "#c4b5fd";
          c.shadowColor = "#a78bfa";
          c.shadowBlur = 24;
          c.lineWidth = 5;
          c.beginPath();
          c.arc(0, 0, R, 0, 7);
          c.stroke();
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            c.beginPath();
            c.moveTo(Math.cos(a) * R * 0.88, Math.sin(a) * R * 0.88);
            c.lineTo(Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98);
            c.stroke();
          }
          const hand = (ang, len, wd) => {
            c.lineWidth = wd;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(ang) * R * len, Math.sin(ang) * R * len);
            c.stroke();
          };
          hand(-t * 2.4 - Math.PI / 2, 0.85, 4);
          hand(-t * 0.2 - 1, 0.55, 8);
        });
      });
      [1800, 2600, 3400].forEach((tm, i) =>
        later(tm, () => {
          msfx("glitch");
          ring(
            W / 2,
            H / 2,
            i === 1 ? "#fff" : "#a78bfa",
            1.5,
            Math.max(W, H) * 0.8,
            0,
          );
          shakeAll(400, 8 + i * 4);
          // digits rewind upward
          for (let k = 0; k < 40; k++)
            add({
              x: rnd(0, W),
              y: H + 10,
              vy: -rnd(300, 800),
              life: rnd(1, 2),
              size: rnd(14, 30),
              color: pick(["#c4b5fd", "#7dd3fc", "#fff"]),
              shape: "text",
              text: String(Math.floor(rnd(0, 10))),
            });
        }),
      );
      later(4000, () => {
        msfx("zap");
        flash("#fff", 0.8, 500);
        boardShards(["#171028", "#3b2a6b", "#a78bfa", "#e9e1ff"], true, 60);
        addCracks(cfg.color);
        shakeAll(900, 20);
      });
      later(4300, () =>
        hugeText(
          FIG.wraith,
          0.5,
          0.5,
          0.5,
          0.46,
          Math.min(W, H) * 0.65,
          3.2,
          "#a78bfa",
          0,
          2,
        ),
      );
    },

    reality(S) {
      later(0, () => msfx("glitch"));
      // continuous glitch bars that get worse over time
      fx(6.8, (c, p, w, h) => {
        const n = Math.floor(2 + p * 26);
        for (let i = 0; i < n; i++) {
          const y = Math.random() * h;
          const bh = rnd(3, 28 + p * 40);
          const off = rnd(-1, 1) * (20 + p * 160);
          c.globalAlpha = rnd(0.1, 0.5);
          c.fillStyle = pick(["#ff00aa", "#00ffe1", "#ffffff", "#7a00ff"]);
          c.fillRect(off, y, w * rnd(0.2, 1), bh);
        }
        if (Math.random() < 0.08 + p * 0.2) {
          c.globalAlpha = 0.9;
          c.fillStyle = "#000";
          c.fillRect(0, rnd(0, h), w, rnd(2, 14));
        }
      });
      later(1100, () => {
        msfx("glitch");
        // the rift opens in the middle of the screen
        fx(5.6, (c, p, w, h) => {
          const o = Math.min(1, p * 2.4);
          const rw = 6 + o * w * 0.12 + Math.sin(p * 40) * 3;
          const rh = h * (0.1 + o * 0.9);
          const gr = c.createLinearGradient(0, 0, w, 0);
          c.shadowColor = "#ff00aa";
          c.shadowBlur = 40;
          c.fillStyle = "#050008";
          c.strokeStyle = "#ff39c8";
          c.lineWidth = 3;
          c.globalAlpha = p > 0.9 ? (1 - p) * 10 : 1;
          c.beginPath();
          c.moveTo(w / 2, h / 2 - rh / 2);
          c.lineTo(w / 2 + rw, h / 2 - rh * 0.12);
          c.lineTo(w / 2 + rw * 0.4, h / 2 + rh * 0.2);
          c.lineTo(w / 2, h / 2 + rh / 2);
          c.lineTo(w / 2 - rw * 0.6, h / 2 + rh * 0.1);
          c.lineTo(w / 2 - rw, h / 2 - rh * 0.15);
          c.closePath();
          c.fill();
          c.stroke();
        });
      });
      later(2800, () => {
        msfx("thud");
        invert(90);
        setTimeout(() => invert(70), 180);
        setTimeout(() => invert(60), 320);
        flash("#ff39c8", 0.5, 500);
        shakeAll(1200, 22);
        // glass shards of reality fly out
        burst(W / 2, H / 2, 120, {
          colors: ["#ff39c8", "#00ffe1", "#ffffff", "#7a00ff"],
          shape: "tri",
          s0: 8,
          s1: 34,
          g: 0,
          min: 150,
          max: 900,
          l0: 1.4,
          l1: 3,
          drag: 0.992,
        });
        // the board's pieces float upward - gravity is broken
        boardShards(["#1a1030", "#3b1a5c", "#ff39c8", "#00ffe1"], true, 70);
        addCracks(cfg.color);
      });
      later(3900, () => {
        msfx("glitch");
        hugeText(
          FIG.reality,
          0.5,
          0.5,
          0.5,
          0.46,
          Math.min(W, H) * 0.75,
          3.2,
          "#ff00aa",
          0,
          8,
        );
        // digit rain made of the digits it will curse
        for (let i = 0; i < 90; i++) {
          add({
            x: rnd(0, W),
            y: rnd(-H * 0.4, 0),
            vx: 0,
            vy: rnd(300, 900),
            g: 0,
            life: rnd(1.2, 2.4),
            size: rnd(14, 34),
            color: pick(["#00ffe1", "#ff39c8", "#ffffff"]),
            shape: "text",
            text: String(Math.floor(rnd(0, 10))),
          });
        }
      });
    },
  };

  function scrambleTitle(el, text, ms) {
    const chars = "0123456789#%&@?!<>";
    const t0 = performance.now();
    const step = () => {
      if (!el.isConnected) return;
      const p = Math.min(1, (performance.now() - t0) / ms);
      el.textContent = text
        .split("")
        .map((ch, i) =>
          ch === " " || i < text.length * p
            ? ch
            : chars[Math.floor(Math.random() * chars.length)],
        )
        .join("");
      if (p < 1) requestAnimationFrame(step);
    };
    step();
  }

  function playIntro(ev0, cfg0, preview) {
    const reduced = RM();
    stage = document.createElement("div");
    stage.className = "drBsStage";
    stage.style.setProperty("--bc", cfg0.color);
    stage.innerHTML = `<div class="drBsWarn">⚠ WARNING ⚠</div><button class="drBsSkip" type="button">Skip ▸</button>`;
    document.body.appendChild(stage);
    requestAnimationFrame(() => stage && stage.classList.add("dark"));
    const total = reduced ? 3000 : 7600;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      introTimers.forEach(clearTimeout);
      introTimers = [];
      if (stage) {
        stage.classList.add("out");
        const s = stage;
        setTimeout(() => s.remove(), 1000);
        stage = null;
      }
      fxs = [];
      parts = [];
      showHud(true);
    };
    stage.querySelector(".drBsSkip").onclick = () => {
      finish();
      if (preview) setTimeout(() => endAll(), 100);
    };
    if (!reduced) {
      running = true;
      try {
        SCENES[cfg0.key](stage);
      } catch (e) {
        console.warn("scene failed", e);
      }
    }
    later(reduced ? 300 : 5200, () => {
      const t = document.createElement("div");
      t.className = "drBsTitle";
      t.textContent = cfg0.name;
      const s = document.createElement("div");
      s.className = "drBsSub";
      s.textContent = `${nf(cfg0.hp)} HP • ${cfg0.blurb}`;
      stage.appendChild(t);
      stage.appendChild(s);
      if (cfg0.key === "reality") scrambleTitle(t, cfg0.name, 1100);
      msfx("roar");
      shakeAll(500, 12);
    });
    later(total, finish);
    running = true;
  }

  /* ==========================================================
     HUD
     ========================================================== */

  function showHud(animate) {
    if (!ev || !cfg) return;
    if (hud) hud.remove();
    hud = document.createElement("div");
    hud.className = `drBsHud ${cfg.key}`;
    hud.style.setProperty("--bc", cfg.color);
    if (!animate) hud.style.animationDuration = ".01s";
    const combos = (ev.combos || [])
      .map(
        (c) =>
          `<div class="drBsCombo">${(c || []).map((d) => `<span class="drBsChip">${esc(d)}</span>`).join("")}</div>`,
      )
      .join("");
    hud.innerHTML = `
      <div class="drBsFig"><span>${FIG[cfg.key]}</span></div>
      <div class="drBsMain">
        <div class="drBsName"><span>${esc(cfg.name)}</span><span class="drBsTime">--:--</span></div>
        <div class="drBsHp"><div class="drBsHpTrail"></div><div class="drBsHpFill"></div><div class="drBsHpTxt"></div></div>
        <div class="drBsMeta"></div>
        <div class="drBsTop"></div>
      </div>
      <div class="drBsCurse"><div class="drBsCurseT">☠ CURSED ROLLS</div>${combos}</div>
      <button class="drBsMute" type="button" title="Boss music on/off">🔊</button>`;
    document.body.appendChild(hud);
    const mb = hud.querySelector(".drBsMute");
    const syncMute = () =>
      (mb.textContent = M().isOn && M().isOn() ? "🔊" : "🔇");
    syncMute();
    mb.onclick = () => {
      M().toggle && M().toggle();
      syncMute();
    };
    lastHpShown = -1;
    tick();
  }

  function fmtTime(ms) {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function tick() {
    if (!hud || !ev) return;
    const B = G.drBoss;
    const preview = !!ev.preview;
    const hp = preview ? ev.hp : B.hp();
    const left = preview
      ? Math.max(0, new Date(ev.ends_at).getTime() - Date.now())
      : B.msLeft();
    const pct = Math.max(0, Math.min(100, (hp / ev.max_hp) * 100));
    const fill = hud.querySelector(".drBsHpFill");
    const trail = hud.querySelector(".drBsHpTrail");
    fill.style.width = pct + "%";
    trail.style.width = pct + "%";
    hud.querySelector(".drBsHpTxt").textContent =
      `${nf(hp)} / ${nf(ev.max_hp)}  (${pct < 1 && pct > 0 ? "<1" : Math.round(pct)}%)`;
    hud.querySelector(".drBsTime").textContent = fmtTime(left);
    const meta = hud.querySelector(".drBsMeta");
    if (preview) meta.innerHTML = "<b>Preview</b> — only you can see this.";
    else {
      const w = B.equipped();
      meta.innerHTML = `You dealt <b>${nf(B.myDamage())}</b> • weapon: <b>${w ? w.icon + " D=" + (w.d || "none") : "bare hands D=1,000,000,000,000"}</b>${B.dq() ? ' • <span class="dq">☠ DISQUALIFIED (no win)</span>' : ""}`;
    }
    const topEl = hud.querySelector(".drBsTop");
    if (topEl) {
      const tp = !preview && B.top ? B.top() : [];
      topEl.innerHTML = tp.length
        ? "⚔ " +
          tp
            .map(
              (p, i) =>
                `${["🥇", "🥈", "🥉"][i]} ${esc(p.username || "Player")} <b>${fmtBig(p.damage)}</b>`,
            )
            .join(" • ")
        : "";
    }
    lastHpShown = hp;
  }

  function say(text) {
    if (!hud) return;
    const old = hud.querySelector(".drBsSay");
    if (old) old.remove();
    const d = document.createElement("div");
    d.className = "drBsSay";
    d.textContent = text;
    hud.appendChild(d);
    setTimeout(() => d.remove(), 2500);
  }

  function fmtBig(n) {
    n = Math.round(n);
    if (n >= 1e15) return n.toExponential(1).replace("e+", "e");
    if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
    return nf(n);
  }

  let floatCount = 0;
  function floater(amount) {
    if (!hud || floatCount > 6) return;
    floatCount++;
    const r = hud.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "drBsFloat";
    d.style.setProperty("--bc", cfg.color);
    d.textContent = "−" + fmtBig(amount);
    d.style.left = r.left + r.width * rnd(0.25, 0.7) + "px";
    d.style.top = r.bottom - 6 + "px";
    document.body.appendChild(d);
    setTimeout(() => {
      d.remove();
      floatCount--;
    }, 1200);
  }

  /* ==========================================================
     RANDOM STUNTS (the rest of the event)
     ========================================================== */

  const STUNTS = {
    golem: [
      () => {
        // stomp
        msfx("thud");
        shakeAll(800, 18);
        burst(rnd(W * 0.2, W * 0.8), H - 10, 40, {
          colors: ["#8a6a4a", "#b48a5d"],
          up: 500,
          s0: 4,
          s1: 14,
        });
        burst(W / 2, H - 20, 12, {
          colors: ["rgba(214,170,120,.4)"],
          shape: "circle",
          g: -20,
          s0: 22,
          s1: 50,
          l0: 1.4,
          l1: 2.4,
          min: 30,
          max: 200,
          drag: 0.97,
        });
        say(pick(TAUNTS.golem));
      },
      () => {
        // boulders thrown across the screen
        msfx("roar");
        for (let i = 0; i < 4; i++) {
          const r = document.createElement("div");
          r.className = "drBsRock";
          r.textContent = "🪨";
          const fromLeft = Math.random() < 0.5;
          const y0 = rnd(H * 0.2, H * 0.8);
          r.style.left = "0";
          r.style.top = "0";
          document.body.appendChild(r);
          const anim = r.animate(
            [
              {
                transform: `translate(${fromLeft ? -100 : W + 100}px,${y0}px) rotate(0deg) scale(.8)`,
              },
              {
                transform: `translate(${W / 2 + rnd(-200, 200)}px,${y0 - rnd(120, 300)}px) rotate(${fromLeft ? 360 : -360}deg) scale(1.3)`,
                offset: 0.5,
              },
              {
                transform: `translate(${fromLeft ? W + 100 : -100}px,${y0 + rnd(0, 200)}px) rotate(${fromLeft ? 720 : -720}deg) scale(.9)`,
              },
            ],
            {
              duration: 1700 + i * 240,
              delay: i * 320,
              easing: "ease-in-out",
              fill: "both",
            },
          );
          anim.onfinish = () => r.remove();
        }
        say(pick(TAUNTS.golem));
      },
      () => {
        // rockfall from the ceiling
        for (let i = 0; i < 40; i++)
          add({
            x: rnd(0, W),
            y: rnd(-200, 0),
            vy: rnd(200, 500),
            g: 900,
            life: rnd(1.4, 2.4),
            size: rnd(8, 26),
            color: pick(["#8a6a4a", "#6b5238", "#3d2f22"]),
            rot: rnd(0, 6),
            vr: rnd(-5, 5),
          });
        loop();
        msfx("thud");
        shake(boardEl, 700, 10);
      },
      () => {
        // the golem's eyes flare
        flash("#ff9a3c", 0.25, 700);
        say("MY EYES SEE YOUR NUMBERS");
        shake(hud, 500, 8);
      },
    ],
    titan: [
      () => {
        // lightning storm
        for (let i = 0; i < 3; i++)
          setTimeout(() => {
            if (!running) return;
            const x = rnd(W * 0.05, W * 0.95);
            bolt(x, 0, x + rnd(-100, 100), H * rnd(0.4, 1), "#bfe6ff", 0.4, 5);
            flash("#cfeaff", 0.4, 220);
            msfx("zap");
          }, i * 260);
        shake(boardEl, 600, 10);
      },
      () => {
        // sweeping eye beam
        const dir = Math.random() < 0.5 ? 1 : -1;
        msfx("zap");
        fx(1.6, (c, p, w, h) => {
          const y = h * (dir > 0 ? p : 1 - p);
          c.globalAlpha = Math.sin(p * Math.PI);
          c.shadowColor = "#ff3355";
          c.shadowBlur = 30;
          c.fillStyle = "rgba(255,60,90,.35)";
          c.fillRect(0, y - 22, w, 44);
          c.fillStyle = "#fff";
          c.fillRect(0, y - 3, w, 6);
        });
        say(pick(TAUNTS.titan));
      },
      () => {
        // shockwave
        msfx("thud");
        ring(W / 2, H * 0.1, "#38bdf8", 1.5, Math.max(W, H), 0);
        ring(W / 2, H * 0.1, "#fff", 1.5, Math.max(W, H), 0.2);
        shakeAll(700, 14);
      },
      () => {
        // spark storm
        burst(rnd(0, W), rnd(0, H * 0.5), 60, {
          colors: ["#bfe6ff", "#38bdf8", "#fff"],
          shape: "circle",
          s0: 2,
          s1: 5,
          g: 500,
        });
        say(pick(TAUNTS.titan));
        flash("#7fcaff", 0.18, 400);
      },
    ],
    mimic: [
      () => {
        // coin shower
        msfx("thud");
        for (let i = 0; i < 70; i++)
          add({
            x: rnd(0, W),
            y: -rnd(10, 300),
            vy: rnd(250, 600),
            g: 500,
            life: rnd(1.6, 3),
            size: rnd(8, 20),
            color: pick(["#f5c542", "#ffe08a", "#d19a1c"]),
            shape: "circle",
          });
        loop();
        say(pick(TAUNTS.mimic));
      },
      () => {
        // jaws snap shut across the screen
        msfx("thud");
        fx(0.8, (c, p, w, h) => {
          const e = Math.sin(Math.min(1, p) * Math.PI) * h * 0.28;
          c.fillStyle = "#0b0814";
          c.strokeStyle = "#f5c542";
          c.lineWidth = 3;
          [0, 1].forEach((s) => {
            c.beginPath();
            const y = s ? h : 0;
            c.moveTo(0, y);
            for (let i = 0; i <= 14; i++)
              c.lineTo((w / 14) * i, y + (s ? -1 : 1) * e * (i % 2 ? 1 : 0.7));
            c.lineTo(w, y);
            c.closePath();
            c.fill();
            c.stroke();
          });
        });
        shakeAll(500, 12);
        say(pick(TAUNTS.mimic));
      },
      () => {
        // chests spill out
        for (let i = 0; i < 3; i++) {
          const r = document.createElement("div");
          r.className = "drBsRock";
          r.textContent = "🧰";
          r.style.left = "0";
          r.style.top = "0";
          document.body.appendChild(r);
          const x = rnd(W * 0.1, W * 0.9);
          r.animate(
            [
              { transform: `translate(${x}px,-80px) rotate(0deg)` },
              {
                transform: `translate(${x + rnd(-120, 120)}px,${H + 80}px) rotate(${rnd(-360, 360)}deg)`,
              },
            ],
            {
              duration: 1800 + i * 300,
              delay: i * 250,
              easing: "cubic-bezier(.4,0,1,1)",
              fill: "both",
            },
          ).onfinish = () => {
            burst(x, H - 20, 24, {
              colors: ["#f5c542", "#ffe08a"],
              shape: "circle",
              s0: 4,
              s1: 9,
            });
            loop();
            r.remove();
          };
        }
        msfx("roar");
      },
      () => {
        flash("#f5c542", 0.25, 600);
        say("ALL THAT GLITTERS…");
        shake(hud, 500, 8);
      },
    ],
    wraith: [
      () => {
        // time ripple
        msfx("glitch");
        [0, 0.25, 0.5].forEach((d) =>
          ring(W / 2, H / 2, "#a78bfa", 1.6, Math.max(W, H) * 0.8, d),
        );
        say(pick(TAUNTS.wraith));
      },
      () => {
        // digits rewind upward
        for (let k = 0; k < 70; k++)
          add({
            x: rnd(0, W),
            y: H + rnd(0, 100),
            vy: -rnd(300, 800),
            life: rnd(1.4, 2.6),
            size: rnd(14, 32),
            color: pick(["#c4b5fd", "#7dd3fc", "#fff"]),
            shape: "text",
            text: String(Math.floor(rnd(0, 10))),
          });
        loop();
        invert(60);
      },
      () => {
        // hourglass sand
        const x = rnd(W * 0.2, W * 0.8);
        for (let k = 0; k < 90; k++)
          add({
            x: x + rnd(-6, 6),
            y: -rnd(0, 200),
            vx: rnd(-20, 20),
            vy: rnd(200, 400),
            g: 400,
            life: rnd(1.6, 2.8),
            size: rnd(2, 5),
            color: pick(["#e9d5ff", "#c4b5fd"]),
            shape: "circle",
          });
        loop();
        say("THE SANDS RUN OUT.");
      },
      () => {
        // freeze flash
        flash("#e9e1ff", 0.45, 900);
        invert(80);
        shake(boardEl, 400, 6);
        say(pick(TAUNTS.wraith));
        msfx("zap");
      },
    ],
    reality: [
      () => {
        // glitch burst
        msfx("glitch");
        fx(0.8, (c, p, w, h) => {
          for (let i = 0; i < 24; i++) {
            c.globalAlpha = rnd(0.2, 0.6) * (1 - p);
            c.fillStyle = pick(["#ff00aa", "#00ffe1", "#fff", "#7a00ff"]);
            c.fillRect(
              rnd(-60, 60),
              Math.random() * h,
              w * rnd(0.2, 1),
              rnd(3, 30),
            );
          }
        });
        invert(70);
        shake(boardEl, 500, 12);
      },
      () => {
        // digit rain of the cursed digits
        const digs = (ev.combos || []).flat().map(String);
        for (let i = 0; i < 70; i++)
          add({
            x: rnd(0, W),
            y: rnd(-H * 0.3, 0),
            vy: rnd(300, 800),
            life: rnd(1.4, 2.6),
            size: rnd(14, 34),
            color: pick(["#00ffe1", "#ff39c8", "#fff"]),
            shape: "text",
            text: digs.length ? pick(digs) : "?",
          });
        loop();
        say(pick(TAUNTS.reality));
      },
      () => {
        // fake error dialogs
        const msgs = [
          "REALITY.EXE has stopped responding",
          "XP = NaN",
          "Cannot find your digits",
          "Division by zero: 1 / 0",
          "Unexpected 7 at line ∞",
        ];
        for (let i = 0; i < 3; i++)
          setTimeout(() => {
            if (!running) return;
            const d = document.createElement("div");
            d.className = "drBsErr";
            d.style.left = rnd(4, Math.max(5, W - 260)) + "px";
            d.style.top = rnd(80, Math.max(90, H - 140)) + "px";
            d.innerHTML = `<b>⚠ Error</b><p>${esc(pick(msgs))}</p>`;
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 3000);
          }, i * 350);
        msfx("glitch");
      },
      () => {
        // the screen briefly rips open
        const y = rnd(H * 0.2, H * 0.8);
        fx(1.1, (c, p, w, h) => {
          const o = Math.sin(Math.min(1, p) * Math.PI);
          c.fillStyle = "#050008";
          c.shadowColor = "#ff39c8";
          c.shadowBlur = 24;
          c.globalAlpha = 0.95;
          c.fillRect(0, y - 40 * o, w, 80 * o);
          c.fillStyle = "#ff39c8";
          c.fillRect(0, y - 40 * o - 2, w, 3);
          c.fillRect(0, y + 40 * o, w, 3);
        });
        flash("#ff39c8", 0.2, 600);
        msfx("thud");
        say(pick(TAUNTS.reality));
      },
    ],
  };

  function scheduleStunt() {
    clearTimeout(stuntTimer);
    if (!ev || !cfg) return;
    stuntTimer = setTimeout(
      () => {
        if (!ev || !cfg || stage) return scheduleStunt();
        if (!document.hidden && !RM()) {
          try {
            pick(STUNTS[cfg.key])();
          } catch (e) {}
        }
        scheduleStunt();
      },
      rnd(4500, 9500),
    );
  }

  /* ==========================================================
     END / RESULT
     ========================================================== */

  function endAll() {
    running = false;
    clearTimeout(stuntTimer);
    introTimers.forEach(clearTimeout);
    introTimers = [];
    if (stage) {
      stage.remove();
      stage = null;
    }
    if (hud) {
      hud.remove();
      hud = null;
    }
    removeCracks();
    parts = [];
    fxs = [];
    if (cx) cx.clearRect(0, 0, W, H);
    ev = null;
    cfg = null;
  }

  function showResult(o) {
    const c = o.cfg;
    if (!c) return;
    const box = document.createElement("div");
    box.className = "drBsRes";
    box.style.setProperty("--bc", c.color);
    let h2 = "";
    let p = "";
    if (o.status === "defeated") {
      h2 = `${c.icon} ${esc(c.short)} DEFEATED!`;
      p = o.won
        ? `You survived and landed the win! Your victory has been added to the <b>Boss victors</b> board.`
        : o.dq
          ? `The boss fell — but you were <b>disqualified</b> when your XP hit 0, so no win counts for you.`
          : `The boss fell, but you didn't deal any damage, so no win counts.`;
    } else {
      h2 = `${c.icon} ${esc(c.short)} ${o.status === "expired" ? "ESCAPED" : "VANISHED"}`;
      p =
        o.status === "expired"
          ? "Time ran out. The boss slipped away… for now."
          : "An admin ended the event.";
    }
    box.innerHTML = `<div class="drBsResBox"><h2>${h2}</h2><p>${p}</p><p class="small">Total damage you dealt: <b>${nf(o.damage || 0)}</b></p><button type="button">Close</button></div>`;
    document.body.appendChild(box);
    box.querySelector("button").onclick = () => box.remove();
    setTimeout(() => box.isConnected && box.remove(), 14000);
    if (o.status === "defeated") {
      for (let i = 0; i < 160; i++)
        add({
          x: rnd(0, W),
          y: -20,
          vx: rnd(-120, 120),
          vy: rnd(100, 500),
          g: 300,
          life: rnd(2, 4),
          size: rnd(6, 14),
          color: pick([c.color, "#fff", "#ffd54a", "#8ee6ad"]),
          rot: rnd(0, 6),
          vr: rnd(-8, 8),
        });
      loop();
    }
  }

  /* ==========================================================
     API USED BY boss.js
     ========================================================== */

  function findBoard() {
    const rows = $id("globalRows");
    boardEl = rows ? rows.closest(".panel") || rows.parentElement : null;
  }

  G.drBossFx = {
    start(o) {
      endAll();
      ensureCanvas();
      findBoard();
      ev = o.ev;
      cfg = o.cfg;
      running = true;
      if (o.cutscene) {
        playIntro(ev, cfg, !!o.preview);
      } else {
        addCracks(cfg.color);
        showHud(true);
      }
      scheduleStunt();
    },
    update() {
      tick();
    },
    tick() {
      tick();
    },
    damage(o) {
      if (!hud) return;
      floater(o.amount);
      const fill = hud.querySelector(".drBsHpFill");
      if (fill)
        fill.animate([{ filter: "brightness(2.2)" }, { filter: "none" }], {
          duration: 260,
        });
      if (o.crit) {
        shake(hud, 400, 7);
        flash("#fff", 0.12, 200);
      }
      tick();
    },
    curse(o) {
      if (!hud) return;
      hud.classList.remove("cursedHit");
      void hud.offsetWidth;
      hud.classList.add("cursedHit");
      hud.classList.remove("hit");
      void hud.offsetWidth;
      hud.classList.add("hit");
      flash("#ff1030", 0.35, 600);
      const t = document.createElement("div");
      t.className = "drBsCurseTxt";
      t.textContent = `☠ CURSED  −${nf(o.loss)} XP`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 1700);
      const r = hud.getBoundingClientRect();
      burst(r.left + r.width * 0.85, r.top + r.height / 2, 30, {
        colors: ["#ff3355", "#ffb3c0", "#000"],
        shape: "circle",
        s0: 3,
        s1: 8,
        g: 200,
        min: 60,
        max: 300,
      });
      loop();
      msfx("curse");
    },
    dq() {
      say("☠ YOU ARE DISQUALIFIED");
      tick();
    },
    end(o) {
      const prev = ev;
      endAll();
      if (o && o.preview) return;
      if (
        o &&
        o.cfg &&
        (o.status === "defeated" ||
          o.status === "expired" ||
          o.status === "cancelled")
      ) {
        ensureCanvas();
        showResult(o);
      }
    },
    _state: () => ({ hud: !!hud, stage: !!stage, parts: parts.length }),
  };
})();
