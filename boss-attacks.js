/* ============================================================
   DIGIT ROLL — BOSS ATTACKS
   Desktop: the boss locks onto your CURSOR. A reticle tracks it, then locks;
            move away before it lands or take the hit.
   Phones : the boss spawns 5 seals. Tap all 5 within 5 seconds or take the hit.
   Damage : grows steeply with your XP (1000 × (XP/10,000)², ×boss power), never
            less than 1000 XP and never more than half your XP (unless 1000 is
            more than half). Goes through Hex Ward / Iron Will / Warding Scroll.
   Each boss knows 1 more attack the stronger it is (golem 2 ... reality breaker 6), on both
   PC and mobile; every attack is picked at random from its boss's pool.
   Loaded after boss.js and craft.js. Client-side only (no SQL).
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const B = () => G.drBoss;
  const nf = (v) => Math.round(Number(v) || 0).toLocaleString();
  const sfx = (n) => typeof G.drSfx === "function" && G.drSfx(n);

  const COARSE = () => {
    try {
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches
      );
    } catch (e) {
      return false;
    }
  };

  /* per boss: seconds between attacks [min,max], damage power, shots, lock time (ms) */
  const POWER = {
    golem: {
      gap: [22, 34],
      mult: 1,
      shots: 1,
      track: 1100,
      lock: 800,
      verb: "hurls a boulder",
    },
    mimic: {
      gap: [20, 30],
      mult: 1.1,
      shots: 1,
      track: 1000,
      lock: 700,
      verb: "snaps its jaws",
    },
    wraith: {
      gap: [18, 28],
      mult: 1.2,
      shots: 1,
      track: 950,
      lock: 650,
      verb: "stops time on you",
    },
    titan: {
      gap: [15, 24],
      mult: 1.5,
      shots: 2,
      track: 900,
      lock: 600,
      verb: "calls down lightning",
    },
    reality: {
      gap: [12, 20],
      mult: 2,
      shots: 2,
      track: 850,
      lock: 500,
      verb: "tears reality open",
    },
    drake: {
      gap: [19, 29],
      mult: 1.2,
      shots: 1,
      track: 980,
      lock: 680,
      verb: "breathes fire",
    },
    kraken: {
      gap: [16, 26],
      mult: 1.4,
      shots: 2,
      track: 920,
      lock: 620,
      verb: "lashes its tentacles",
    },
    hydra: {
      gap: [13, 22],
      mult: 1.8,
      shots: 2,
      track: 880,
      lock: 560,
      verb: "strikes with nine heads",
    },
    voidking: {
      gap: [11, 18],
      mult: 2.4,
      shots: 3,
      track: 820,
      lock: 480,
      verb: "decrees your end",
    },
    eternal: {
      gap: [10, 17],
      mult: 2.8,
      shots: 3,
      track: 800,
      lock: 460,
      verb: "chains you down",
    },
    devourer: {
      gap: [8, 14],
      mult: 4.2,
      shots: 3,
      track: 760,
      lock: 420,
      verb: "swallows the sky",
    },
    author: {
      gap: [8, 13],
      mult: 5,
      shots: 3,
      track: 740,
      lock: 400,
      verb: "rewrites your fate",
    },
    omega: {
      gap: [9, 15],
      mult: 3.4,
      shots: 3,
      track: 780,
      lock: 440,
      verb: "runs the final protocol",
    },
  };
  /* attacks come ~40% more often than before */
  const FREQ = 0.6;

  /* ---------- damage ---------- */
  function strikeDamage(mult) {
    const xp = typeof getXPBalance === "function" ? getXPBalance() : 0;
    const raw = 1000 * Math.pow(Math.max(1, xp / 10000), 2) * mult;
    return Math.max(1000, Math.floor(Math.min(raw, xp * 0.5)));
  }

  /* ---------- stats (browser only) ---------- */
  const KEY = "digitRollBossAtk";
  let S = { dodged: 0, hit: 0, blocked: 0, failed: 0 };
  try {
    S = Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {}
  const saveS = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  };
  G.drBossAttackStats = () => Object.assign({}, S);

  /* ---------- styles / layer ---------- */
  const st = document.createElement("style");
  st.textContent = `
  #bsAtk{position:fixed;inset:0;z-index:9400;pointer-events:none;overflow:hidden}
  #bsAtk.touch{pointer-events:none}
  .bsBeam{position:absolute;height:3px;transform-origin:0 50%;background:linear-gradient(90deg,transparent,var(--c),#fff);opacity:.0;box-shadow:0 0 12px var(--c)}
  .bsBeam.on{opacity:.85}
  .bsRet{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:3px dashed var(--c);box-shadow:0 0 18px var(--c),inset 0 0 22px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font:900 13px system-ui;color:#fff}
  .bsRet::before,.bsRet::after{content:"";position:absolute;background:var(--c)}
  .bsRet::before{width:2px;height:150%;left:50%}.bsRet::after{height:2px;width:150%;top:50%}
  .bsRet.lock{border:4px solid #ff2040;background:rgba(255,32,64,.18);animation:bsLock .25s steps(2) infinite}
  .bsRet.lock::before,.bsRet.lock::after{background:#ff2040}
  @keyframes bsLock{50%{transform:scale(.9)}}
  .bsBoom{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:6px solid var(--c);box-shadow:0 0 30px var(--c);animation:bsBoom .5s ease-out forwards}
  @keyframes bsBoom{to{width:340px;height:340px;margin:-170px 0 0 -170px;opacity:0}}
  .bsTxt{position:fixed;left:50%;top:26%;transform:translateX(-50%);z-index:9450;font:900 clamp(22px,5vw,40px) system-ui,sans-serif;letter-spacing:2px;color:#fff;text-shadow:0 0 18px var(--c,#f43f5e),0 3px 0 #000;pointer-events:none;animation:bsTxt 1.5s ease-out forwards;text-align:center;white-space:nowrap}
  @keyframes bsTxt{0%{opacity:0;transform:translateX(-50%) scale(.6)}15%{opacity:1;transform:translateX(-50%) scale(1.08)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
  .bsWarn{position:fixed;left:50%;top:15%;transform:translateX(-50%);z-index:9450;padding:8px 18px;border-radius:99px;background:rgba(10,10,20,.9);border:2px solid var(--c);color:#fff;font:900 14px system-ui;letter-spacing:1px;pointer-events:none;animation:bsWarn .5s ease-in-out infinite alternate}
  @keyframes bsWarn{to{box-shadow:0 0 24px var(--c)}}
  .bsSeal{position:absolute;width:74px;height:74px;margin:-37px 0 0 -37px;border-radius:50%;border:4px solid var(--c);background:radial-gradient(circle,rgba(255,255,255,.25),rgba(0,0,0,.55));box-shadow:0 0 22px var(--c);display:flex;align-items:center;justify-content:center;font-size:30px;pointer-events:auto;touch-action:manipulation;cursor:pointer;animation:bsSealIn .25s ease-out}
  .bsSeal.gone{animation:bsSealOut .3s ease-out forwards;pointer-events:none}
  @keyframes bsSealIn{from{transform:scale(0)}}
  @keyframes bsSealOut{to{transform:scale(1.8);opacity:0}}
  .bsWarn.mob{top:11%;max-width:92vw;white-space:normal;text-align:center;border-radius:18px;font-size:13px;display:flex;flex-direction:column;gap:6px;width:min(340px,92vw)}
  .bsInfo{font-size:18px}
  .bsBar{height:10px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden}
  .bsBar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff2040,#ffb52e);transform-origin:0 50%}
  .bsDanger{position:absolute;inset:0;animation:bsDangerP .5s ease-in-out infinite alternate}
  @keyframes bsDangerP{to{opacity:.55}}
  .bsSafe{position:absolute;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:4px solid #7cf7ff;box-shadow:0 0 30px #7cf7ff,inset 0 0 30px rgba(124,247,255,.4);display:flex;align-items:center;justify-content:center;font:900 20px system-ui;color:#7cf7ff;letter-spacing:3px}
  .bsWall{position:absolute;width:34px;background:linear-gradient(90deg,transparent,var(--c),#fff,var(--c),transparent);box-shadow:0 0 24px var(--c)}
  .bsGap{position:absolute;width:60px;border:3px dashed #7cf7ff;border-radius:10px;background:rgba(124,247,255,.12)}
  .bsSeal.sm{width:54px;height:54px;margin:-27px 0 0 -27px;font-size:22px}
  .bsSeal.big{width:150px;height:150px;margin:-75px 0 0 -75px;font-size:56px}
  .bsSeal.held{background:radial-gradient(circle,#fff6,var(--c));box-shadow:0 0 44px var(--c)}
  .bsFlash{position:fixed;inset:0;z-index:9440;pointer-events:none;background:radial-gradient(circle,transparent 40%,rgba(255,20,50,.55));animation:bsFlash .6s ease-out forwards}
  @keyframes bsFlash{to{opacity:0}}`;
  document.head.appendChild(st);
  const layer = document.createElement("div");
  layer.id = "bsAtk";
  document.body.appendChild(layer);

  /* ---------- cursor tracking ---------- */
  const cur = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    cur.x = e.clientX;
    cur.y = e.clientY;
    cur.seen = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: true });

  /* ---------- helpers ---------- */
  const live = () => {
    const b = B();
    return !!(
      b &&
      b.ev &&
      b.ev.status === "active" &&
      b.msLeft() > 0 &&
      !b.dq()
    );
  };
  const cfg = () =>
    (B() && B().cfg && B().cfg()) || {
      key: "golem",
      color: "#f43f5e",
      icon: "💀",
      name: "THE BOSS",
    };
  const power = () => POWER[cfg().key] || POWER.golem;
  /* strength step of the current boss (new bosses define their own tier) */
  const bossTier = () => {
    const c = cfg();
    return typeof c.tier === "number" ? c.tier : 0;
  };
  let busy = false;

  function say(text, color) {
    const t = document.createElement("div");
    t.className = "bsTxt";
    t.style.setProperty("--c", color || cfg().color);
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }
  function warn(text) {
    const w = document.createElement("div");
    w.className = "bsWarn";
    w.style.setProperty("--c", cfg().color);
    w.textContent = text;
    document.body.appendChild(w);
    return w;
  }
  function takeHit(label, mult) {
    const dmg = strikeDamage(power().mult * (mult || 1));
    const r = typeof G.drBossStrike === "function" ? G.drBossStrike(dmg) : null;
    if (!r) return false;
    S.hit++;
    saveS();
    const f = document.createElement("div");
    f.className = "bsFlash";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
    say(`${label}  −${nf(r.loss)} XP`, "#ff4060");
    return true;
  }

  /* ---------- shared bits ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a, z) => a + Math.random() * (z - a);
  const bossOrigin = () => {
    const hud = document.querySelector(".drBsHud");
    if (hud) {
      const r = hud.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: innerWidth / 2, y: 60 };
  };
  function el(cls, css, parent) {
    const d = document.createElement("div");
    d.className = cls;
    if (css) d.style.cssText = css;
    (parent || layer).appendChild(d);
    return d;
  }
  function boom(x, y, c) {
    const b = el("bsBoom", `left:${x}px;top:${y}px`);
    b.style.setProperty("--c", c);
    setTimeout(() => b.remove(), 600);
  }
  /* run a per-frame function until it returns true or the fight ends */
  function frames(fn) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const f = (now) => {
        if (!live()) return resolve("aborted");
        if (fn(now - t0, now) === true) return resolve("done");
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  }

  /* ==========================================================
     DESKTOP ATTACKS (aim at the cursor)
     ========================================================== */

  /* 1. SNIPE: a reticle chases the cursor, locks, lands */
  function shot(index, total, o) {
    o = o || {};
    return new Promise((resolve) => {
      const p = power();
      const c = cfg().color;
      const track = o.track || p.track;
      const lock = o.lock || p.lock;
      const beam = el("bsBeam on");
      beam.style.setProperty("--c", c);
      const ret = el("bsRet");
      ret.style.setProperty("--c", c);
      ret.textContent = cfg().icon;
      let x = cur.x + (index ? (Math.random() - 0.5) * 300 : 0);
      let y = cur.y + (index ? (Math.random() - 0.5) * 300 : 0);
      const t0 = performance.now();
      let last = t0;
      let locked = false;
      let lockAt = 0;
      const place = () => {
        ret.style.left = x + "px";
        ret.style.top = y + "px";
        const og = bossOrigin();
        const dx = x - og.x;
        const dy = y - og.y;
        beam.style.left = og.x + "px";
        beam.style.top = og.y + "px";
        beam.style.width = Math.hypot(dx, dy) + "px";
        beam.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      };
      place();
      sfx("curse");
      const frame = (now) => {
        if (!live()) {
          beam.remove();
          ret.remove();
          return resolve("aborted");
        }
        const dt = Math.min(64, now - last);
        last = now;
        if (!locked) {
          const k = 1 - Math.pow(0.001, dt / 1000 / 0.35);
          x += (cur.x - x) * k;
          y += (cur.y - y) * k;
          if (now - t0 >= track) {
            locked = true;
            lockAt = now;
            ret.classList.add("lock");
            ret.textContent = "!!";
            sfx("curse");
          }
        } else if (now - lockAt >= lock) {
          const dist = Math.hypot(cur.x - x, cur.y - y);
          boom(x, y, c);
          beam.remove();
          ret.remove();
          if (dist <= 62) {
            takeHit(
              o.label ||
                (total > 1 ? `💥 HIT ${index + 1}/${total}` : "💥 DIRECT HIT"),
              o.mult,
            );
            return resolve("hit");
          }
          if (!o.quiet) {
            S.dodged++;
            saveS();
            say("✨ DODGED!", "#7cf7ff");
          }
          return resolve("dodged");
        }
        place();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }
  async function pcSnipe() {
    const p = power();
    const w = warn(`⚠ ${cfg().name} ${p.verb}! Keep moving your cursor!`);
    await sleep(900);
    w.remove();
    for (let i = 0; i < p.shots; i++) {
      if (!live()) return;
      if ((await shot(i, p.shots)) === "aborted") return;
      await sleep(350);
    }
  }

  /* 2. METEOR SHOWER: six zones, one aimed at you, all land together-ish */
  async function pcMeteor() {
    const c = cfg().color;
    const w = warn(`⚠ ${cfg().name}: METEOR SHOWER! Get out of the circles!`);
    await sleep(700);
    w.remove();
    const zones = [{ x: cur.x, y: cur.y, at: 0 }];
    for (let i = 0; i < 5; i++)
      zones.push({
        x: rnd(80, innerWidth - 80),
        y: rnd(120, innerHeight - 80),
        at: 150 + i * 190,
      });
    const LIFE = 1200;
    let hit = false;
    const els = zones.map((z) => {
      const r = el(
        "bsRet",
        `left:${z.x}px;top:${z.y}px;opacity:0;width:140px;height:140px;margin:-70px 0 0 -70px`,
      );
      r.style.setProperty("--c", c);
      r.textContent = "☄";
      return r;
    });
    const done = zones.map(() => false);
    await frames((t) => {
      zones.forEach((z, i) => {
        if (done[i]) return;
        if (t >= z.at) els[i].style.opacity = 1;
        if (t >= z.at + LIFE * 0.7 && !els[i].classList.contains("lock"))
          els[i].classList.add("lock");
        if (t >= z.at + LIFE) {
          done[i] = true;
          boom(z.x, z.y, c);
          els[i].remove();
          if (!hit && Math.hypot(cur.x - z.x, cur.y - z.y) <= 70) {
            hit = true;
            takeHit("☄ METEOR HIT");
          }
        }
      });
      return done.every(Boolean);
    });
    els.forEach((e) => e.remove());
    if (!hit && live()) {
      S.dodged++;
      saveS();
      say("✨ DODGED!", "#7cf7ff");
    }
  }

  /* 3. SAFE ZONE: everything is deadly except the glowing circle */
  async function pcSafe() {
    const c = cfg().color;
    let x = rnd(160, innerWidth - 160);
    let y = rnd(200, innerHeight - 140);
    let guard = 0;
    while (Math.hypot(x - cur.x, y - cur.y) < 280 && guard++ < 50) {
      x = rnd(160, innerWidth - 160);
      y = rnd(200, innerHeight - 140);
    }
    const w = warn(`⚠ ${cfg().name}: DANGER ZONE! Reach the safe circle!`);
    const danger = el("bsDanger");
    danger.style.setProperty("--c", c);
    const ring = el("bsSafe", `left:${x}px;top:${y}px`);
    ring.style.setProperty("--c", c);
    ring.textContent = "SAFE";
    const R = 100;
    danger.style.background = `radial-gradient(circle at ${x}px ${y}px, transparent ${R}px, rgba(255,20,50,.38) ${R + 3}px)`;
    await frames((t) => t >= 2300);
    w.remove();
    danger.remove();
    ring.remove();
    if (!live()) return;
    boom(x, y, c);
    if (Math.hypot(cur.x - x, cur.y - y) <= R) {
      S.dodged++;
      saveS();
      say("🛡️ SAFE!", "#7cf7ff");
    } else takeHit("💥 CAUGHT IN THE BLAST");
  }

  /* 4. FREEZE: do not move your cursor */
  async function pcFreeze() {
    const c = cfg().color;
    const w = warn(`⚠ ${cfg().name}: FREEZE! Hold your cursor STILL!`);
    await sleep(1100);
    if (!live()) return w.remove();
    const x0 = cur.x;
    const y0 = cur.y;
    w.textContent = "🧊 DON'T MOVE";
    const ring = el("bsRet lock", `left:${x0}px;top:${y0}px;--c:${c}`);
    ring.textContent = "🧊";
    let moved = false;
    await frames((t) => {
      if (Math.hypot(cur.x - x0, cur.y - y0) > 16) {
        moved = true;
        return true;
      }
      return t >= 1500;
    });
    w.remove();
    ring.remove();
    if (!live()) return;
    boom(x0, y0, c);
    if (moved) takeHit("💥 YOU MOVED");
    else {
      S.dodged++;
      saveS();
      say("🧊 STILL AS STONE!", "#7cf7ff");
    }
  }

  /* 5. WALL SWEEP: a wall of energy crosses the screen with one gap */
  async function pcWall() {
    const c = cfg().color;
    const fromLeft = Math.random() < 0.5;
    const GAP = 200;
    const gy = rnd(110, innerHeight - GAP - 30);
    const W = 34;
    const w = warn(`⚠ ${cfg().name}: WALL! Slip through the gap!`);
    const top = el("bsWall", `top:0;height:${gy}px`);
    const bot = el(
      "bsWall",
      `top:${gy + GAP}px;height:${innerHeight - gy - GAP}px`,
    );
    [top, bot].forEach((e) => e.style.setProperty("--c", c));
    const gapMark = el(
      "bsGap",
      `top:${gy}px;height:${GAP}px;${fromLeft ? "left:0" : "right:0"}`,
    );
    const setX = (x) => {
      top.style.left = bot.style.left = x + "px";
    };
    setX(fromLeft ? -W : innerWidth);
    [top, bot].forEach((e) => (e.style.opacity = 0.35));
    await sleep(900);
    w.remove();
    [top, bot].forEach((e) => (e.style.opacity = 1));
    gapMark.remove();
    const DUR = 1700;
    let hit = false;
    await frames((t) => {
      const k = Math.min(1, t / DUR);
      const x = fromLeft
        ? -W + k * (innerWidth + W)
        : innerWidth - k * (innerWidth + W);
      setX(x);
      if (
        !hit &&
        cur.x > x - 24 &&
        cur.x < x + W + 24 &&
        (cur.y < gy || cur.y > gy + GAP)
      ) {
        hit = true;
        boom(cur.x, cur.y, c);
        takeHit("💥 CRUSHED BY THE WALL");
      }
      return k >= 1;
    });
    top.remove();
    bot.remove();
    if (!hit && live()) {
      S.dodged++;
      saveS();
      say("✨ THREADED THE GAP!", "#7cf7ff");
    }
  }

  /* 6. CHAIN LIGHTNING: three fast locks in a row, each one smaller */
  async function pcChain() {
    const w = warn(`⚠ ${cfg().name}: CHAIN LIGHTNING! Never stop moving!`);
    await sleep(800);
    w.remove();
    for (let i = 0; i < 3; i++) {
      if (!live()) return;
      const r = await shot(i, 3, {
        track: 450,
        lock: 320,
        mult: 0.6,
        label: `⚡ ZAP ${i + 1}/3`,
        quiet: true,
      });
      if (r === "aborted") return;
      await sleep(120);
    }
  }

  /* ==========================================================
     MOBILE ATTACKS (tap the seals)
     ========================================================== */

  const MOB = {
    seals: { n: 5, ms: 5000, text: (p) => `${p.verb}! Tap all 5 seals!` },
    swarm: {
      n: 9,
      ms: 6000,
      small: true,
      text: () => "SEAL SWARM! Tap all 9!",
    },
    decoy: {
      n: 5,
      decoys: 4,
      ms: 6000,
      text: () => "DECOYS! Tap the 🔯, avoid the 💀!",
    },
    order: {
      n: 5,
      ms: 6500,
      ordered: true,
      text: () => "RITUAL! Tap 1 → 5 in order!",
    },
    drift: {
      n: 5,
      ms: 5500,
      drift: true,
      text: () => "DRIFTING SEALS! Catch all 5!",
    },
    hold: {
      hold: 3000,
      ms: 6000,
      text: () => "HOLD THE WARD! Press and hold for 3 seconds!",
    },
  };

  function mobileGame(kind) {
    const spec = MOB[kind] || MOB.seals;
    return new Promise((resolve) => {
      const c = cfg().color;
      const p = power();
      const w = warn("");
      w.classList.add("mob");
      w.innerHTML = `<div>⚠ ${cfg().name}: ${spec.text(p)}</div><div class="bsInfo"></div><div class="bsBar"><i></i></div>`;
      const bar = w.querySelector(".bsBar i");
      const info = w.querySelector(".bsInfo");
      const W = innerWidth;
      const H = innerHeight;
      const total = spec.hold ? 1 : spec.n + (spec.decoys || 0);
      const minGap = spec.small ? 68 : 92;
      const pts = [];
      let guard = 0;
      if (spec.hold) pts.push([W / 2, H * 0.58]);
      while (pts.length < total && guard++ < 800) {
        const x = 46 + Math.random() * (W - 92);
        const y = H * 0.3 + Math.random() * (H * 0.55);
        if (pts.every((q) => Math.hypot(q[0] - x, q[1] - y) > minGap))
          pts.push([x, y]);
      }
      while (pts.length < total)
        pts.push([50 + pts.length * 40, H * 0.35 + pts.length * 36]);
      const realCount = spec.hold ? 1 : spec.n;
      const seals = [];
      let left = realCount;
      let nextNo = 1;
      let done = false;
      const t0 = performance.now();
      let holdStart = 0;
      let holdMs = 0;

      const finish = (ok, why) => {
        if (done) return;
        done = true;
        w.remove();
        seals.forEach((s) => s.el.classList.add("gone"));
        setTimeout(() => seals.forEach((s) => s.el.remove()), 400);
        if (ok) {
          S.blocked++;
          saveS();
          say("🛡️ BLOCKED!", "#7cf7ff");
          sfx("buy");
        } else {
          S.failed++;
          saveS();
          takeHit(why || "💥 TOO SLOW");
        }
        resolve();
      };

      pts.forEach(([x, y], i) => {
        const decoy = !spec.hold && i >= realCount;
        const d = el(
          "bsSeal" + (spec.small ? " sm" : "") + (spec.hold ? " big" : ""),
          `left:${x}px;top:${y}px`,
        );
        d.style.setProperty("--c", decoy ? "#ff2040" : c);
        d.textContent = decoy
          ? "💀"
          : spec.ordered
            ? String(i + 1)
            : spec.hold
              ? "✋"
              : "🔯";
        if (spec.ordered) d.style.font = "900 30px system-ui";
        const seal = {
          el: d,
          x,
          y,
          vx: rnd(-70, 70),
          vy: rnd(-70, 70),
          decoy,
          no: i + 1,
        };
        seals.push(seal);
        d.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (done || d.classList.contains("gone")) return;
          if (spec.hold) {
            holdStart = performance.now();
            d.classList.add("held");
            sfx("click");
            return;
          }
          if (decoy) return finish(false, "💀 TOUCHED A DECOY");
          if (spec.ordered && seal.no !== nextNo)
            return finish(false, "💥 WRONG ORDER");
          d.classList.add("gone");
          sfx("click");
          nextNo++;
          left--;
          if (left <= 0) finish(true);
        });
        if (spec.hold) {
          const up = () => {
            if (done || !holdStart) return;
            holdStart = 0;
            d.classList.remove("held");
            finish(false, "💥 LET GO TOO EARLY");
          };
          d.addEventListener("pointerup", up);
          d.addEventListener("pointercancel", up);
          d.addEventListener("pointerleave", up);
        }
      });
      layer.classList.add("touch");

      const tick = (now) => {
        if (done) return;
        if (!live()) {
          done = true;
          w.remove();
          seals.forEach((s) => s.el.remove());
          return resolve();
        }
        const t = now - t0;
        if (spec.drift) {
          seals.forEach((s) => {
            if (s.el.classList.contains("gone")) return;
            s.x += (s.vx * 16) / 1000;
            s.y += (s.vy * 16) / 1000;
            if (s.x < 40 || s.x > W - 40) s.vx *= -1;
            if (s.y < H * 0.26 || s.y > H - 60) s.vy *= -1;
            s.el.style.left = s.x + "px";
            s.el.style.top = s.y + "px";
          });
        }
        if (spec.hold) {
          if (holdStart) {
            holdMs = now - holdStart;
            bar.style.transform = `scaleX(${Math.min(1, holdMs / spec.hold)})`;
            info.textContent = `hold… ${(Math.max(0, spec.hold - holdMs) / 1000).toFixed(1)}s`;
            if (holdMs >= spec.hold) return finish(true);
          } else {
            bar.style.transform = `scaleX(${Math.max(0, 1 - t / 2200)})`;
            info.textContent = "press the ✋ now!";
            if (t >= 2200) return finish(false, "💥 TOO SLOW");
          }
        } else {
          bar.style.transform = `scaleX(${Math.max(0, 1 - t / spec.ms)})`;
          info.textContent =
            `${left} left • ${(Math.max(0, spec.ms - t) / 1000).toFixed(1)}s` +
            (spec.ordered ? ` • next: ${nextNo}` : "");
          if (t >= spec.ms) return finish(false);
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- attack pools: one more attack for every step up in boss strength ---------- */
  const PC_ORDER = ["snipe", "meteor", "safe", "freeze", "wall", "chain"];
  const MOB_ORDER = ["seals", "swarm", "decoy", "order", "drift", "hold"];
  const PC = {
    snipe: pcSnipe,
    meteor: pcMeteor,
    safe: pcSafe,
    freeze: pcFreeze,
    wall: pcWall,
    chain: pcChain,
  };
  const strengthIdx = () => bossTier();
  const poolSize = () => Math.min(6, strengthIdx() + 2); // golem 2, mimic 3, wraith 4, titan 5, reality 6
  let lastKind = "";
  function pickKind(mobile, forced) {
    const list = (mobile ? MOB_ORDER : PC_ORDER).slice(0, poolSize());
    if (forced && (mobile ? MOB_ORDER : PC_ORDER).indexOf(forced) >= 0)
      return forced;
    let k;
    let g = 0;
    do k = list[Math.floor(Math.random() * list.length)];
    while (k === lastKind && list.length > 1 && g++ < 10);
    lastKind = k;
    return k;
  }
  function attack(forced) {
    const mob = COARSE();
    const k = pickKind(mob, forced);
    return mob ? mobileGame(k) : PC[k]();
  }
  G.drBossAttackPool = () => ({
    pc: PC_ORDER.slice(0, poolSize()),
    mobile: MOB_ORDER.slice(0, poolSize()),
  });

  /* ---------- scheduler ---------- */
  let timer = 0;
  let lastEv = null;
  function schedule(first) {
    clearTimeout(timer);
    const p = power();
    const mob = COARSE();
    const gap = (p.gap[0] + Math.random() * (p.gap[1] - p.gap[0])) * FREQ;
    const ms = (first ? 4 + Math.random() * 3 : gap * (mob ? 1.15 : 1)) * 1000;
    timer = setTimeout(run, ms);
  }
  async function run() {
    if (!live()) {
      lastEv = null;
      return;
    }
    if (document.hidden || busy) return schedule(false);
    busy = true;
    try {
      await attack();
    } catch (e) {
      console.warn("boss attack", e);
    }
    busy = false;
    if (live()) schedule(false);
    else lastEv = null;
  }
  /* start the attack timer when a fight begins (or when you join one in progress) */
  setInterval(() => {
    const b = B();
    const id = live() && b.ev ? b.ev.id : null;
    if (id && id !== lastEv) {
      lastEv = id;
      schedule(true);
    } else if (!id && lastEv) {
      lastEv = null;
      clearTimeout(timer);
    }
  }, 1000);

  /* for testing / admin preview */
  G.drBossAttackNow = (kind) =>
    busy
      ? false
      : (clearTimeout(timer),
        (busy = true),
        attack(kind).finally(() => ((busy = false), live() && schedule(false))),
        true);
  G.drBossStrikeDamage = strikeDamage;
})();
