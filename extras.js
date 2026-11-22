/* ============================================================
   DIGIT ROLL — EXTRAS
   1. Extra badges
   2. Rarity effects (simple below TRANSCENDENT, cinematic above)
   3. Admin panel
   Loaded after script.js. Everything here is optional: if this
   file fails to load, the base game still works.
   ============================================================ */

(function () {
  "use strict";

  const G = typeof window !== "undefined" ? window : globalThis;
  const HAS_DOM = typeof document !== "undefined" && !!document.body;

  const register = (name, explanation, oneIn) => {
    if (typeof registerBadgeCatalog === "function") {
      registerBadgeCatalog(name, explanation, oneIn);
    }
  };

  /* ==========================================================
     1. EXTRA BADGES
     ========================================================== */

  /* Famous numbers. Matched anywhere inside the visible digits. */
  const EXTRA_REFERENCES = [
    [
      "1969",
      "🌙 Apollo 11",
      "The year humans first walked on the Moon.",
      90000,
    ],
    [
      "1972",
      "🏓 Pong",
      "Pong arrived in 1972 and kicked off the arcade era.",
      90000,
    ],
    ["1978", "👾 Space Invaders", "Space Invaders hit arcades in 1978.", 90000],
    ["1980", "🟡 Pac-Man", "Pac-Man started chomping in 1980.", 90000],
    [
      "1138",
      "🎬 THX 1138",
      "A number hidden in many science-fiction films.",
      120000,
    ],
    [
      "1701",
      "🖖 NCC-1701",
      "The registry number of a very famous starship.",
      120000,
    ],
    ["2112", "🎸 2112", "A classic progressive-rock number.", 120000],
    [
      "2038",
      "⏳ Year 2038",
      "The year 32-bit Unix timestamps run out.",
      100000,
    ],
    ["2048", "🟧 2048", "The famous sliding-tile puzzle.", 100000],
    ["1024", "💾 1024", "One kibibyte: a very computery number.", 80000],
    ["65535", "🔌 65535", "The largest unsigned 16-bit integer.", 250000],
    [
      "555",
      "📞 Fake Phone Number",
      "The classic movie-and-TV placeholder phone prefix.",
      5000,
    ],
    [
      "299792",
      "⚡ Speed of Light",
      "Roughly 299,792 kilometres per second.",
      300000,
    ],
    [
      "602214",
      "🧪 Avogadro",
      "The leading digits of Avogadro's number.",
      300000,
    ],
    ["112358", "🐚 Fibonacci", "The start of the Fibonacci sequence.", 300000],
    ["8675309", "☎️ 867-5309", "A very catchy phone number.", 5000000],
    /* Ten-digit legends: the entire roll has to line up. */
    [
      "4815162342",
      "🏝️ The Numbers",
      "Six cursed numbers from a certain mysterious island.",
      1e10,
    ],
    ["3141592653", "🥧 Pi: 10 Digits", "Pi, carried to ten digits.", 1e10],
    [
      "2718281828",
      "📐 Euler: 10 Digits",
      "The number e, carried to ten digits.",
      1e10,
    ],
    [
      "1618033988",
      "🌀 Golden Ratio: 10 Digits",
      "Phi, carried to ten digits.",
      1e10,
    ],
    [
      "1123581321",
      "🐚 Fibonacci: 10 Digits",
      "1, 1, 2, 3, 5, 8, 13, 21 — squashed together.",
      1e10,
    ],
    ["1000000000", "💰 One Billion", "A 1 followed by nine zeros.", 1e10],
  ];

  /* ---------- helpers ---------- */

  function runsOf(digits) {
    const runs = [];
    for (let i = 0; i < digits.length; ) {
      let j = i;
      while (j + 1 < digits.length && digits[j + 1] === digits[i]) j++;
      runs.push({ d: digits[i], len: j - i + 1 });
      i = j + 1;
    }
    return runs;
  }

  function longestStep(digits, step) {
    let best = digits.length ? 1 : 0;
    let cur = 1;
    for (let i = 1; i < digits.length; i++) {
      if (Number(digits[i]) - Number(digits[i - 1]) === step) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 1;
    }
    return best;
  }

  function isZigzag(digits) {
    if (digits.length < 3) return false;
    let prev = 0;
    for (let i = 1; i < digits.length; i++) {
      const d = Math.sign(Number(digits[i]) - Number(digits[i - 1]));
      if (d === 0) return false;
      if (prev !== 0 && d === prev) return false;
      prev = d;
    }
    return true;
  }

  /* Pattern badges. `c` = { chars, digits, compact, counts, sum, blanks, runs, distinct } */
  const EXTRA_PATTERNS = [
    {
      name: "⭕ Leading Zero",
      explanation: "The very first digit is a 0.",
      oneIn: 10,
      test: (c) => c.chars[0] === "0",
    },
    {
      name: "🕳️ Zero Bookends",
      explanation: "The first and last positions are both 0.",
      oneIn: 100,
      test: (c) => c.chars[0] === "0" && c.chars[9] === "0",
    },
    {
      name: "🪞 Bookends",
      explanation: "The first and last visible digits match.",
      oneIn: 10,
      test: (c) =>
        c.digits.length >= 4 && c.digits[0] === c.digits[c.digits.length - 1],
    },
    {
      name: "🧊 Triple Zero Tail",
      explanation: "The visible digits finish with 000.",
      oneIn: 1000,
      test: (c) => c.compact.endsWith("000"),
    },
    {
      name: "🧊 Zero Hero",
      explanation: "Five or more of the digits are 0.",
      oneIn: 300,
      test: (c) => (c.counts["0"] || 0) >= 5,
    },
    {
      name: "🧀 Swiss Cheese",
      explanation: "Three or more digits failed to appear at all.",
      oneIn: 60,
      test: (c) => c.blanks >= 3,
    },
    {
      name: "🌑 The Void",
      explanation: "Five or more blank digits. Almost nothing is left.",
      oneIn: 8000,
      test: (c) => c.blanks >= 5,
    },
    {
      name: "👻 Ghost Number",
      explanation: "Seven or more blanks. Barely a number at all.",
      oneIn: 5000000,
      test: (c) => c.blanks >= 7,
    },
    {
      name: "👯‍♂️ Two Pair",
      explanation: "Two different digits each appear doubled side by side.",
      oneIn: 12,
      test: (c) =>
        new Set(c.runs.filter((r) => r.len >= 2).map((r) => r.d)).size >= 2,
    },
    {
      name: "👨‍👩‍👧 Triple Pair",
      explanation: "Three different digits each appear doubled side by side.",
      oneIn: 300,
      test: (c) =>
        new Set(c.runs.filter((r) => r.len >= 2).map((r) => r.d)).size >= 3,
    },
    {
      name: "🔱 Twin Triples",
      explanation: "Two separate digits each appear three times in a row.",
      oneIn: 100000,
      test: (c) =>
        new Set(c.runs.filter((r) => r.len >= 3).map((r) => r.d)).size >= 2,
    },
    {
      name: "🏠 Full House",
      explanation:
        "One digit shows up exactly three times and another exactly twice.",
      oneIn: 8,
      test: (c) => {
        const v = Object.values(c.counts);
        return v.includes(3) && v.includes(2);
      },
    },
    {
      name: "🌈 Near Rainbow",
      explanation: "Nine or more different digits appear.",
      oneIn: 200,
      test: (c) => c.distinct >= 9,
    },
    {
      name: "🏋️ Heavyweight",
      explanation: "The visible digits add up to 70 or more.",
      oneIn: 40,
      test: (c) => c.sum >= 70,
    },
    {
      name: "🪶 Featherweight",
      explanation:
        "Five or more digits showing, yet they add up to 12 or less.",
      oneIn: 200,
      test: (c) => c.digits.length >= 5 && c.sum <= 12,
    },
    {
      name: "⚖️ Balanced Scales",
      explanation:
        "With all ten digits showing, the first five add up to the same total as the last five.",
      oneIn: 55,
      test: (c) =>
        c.blanks === 0 &&
        c.digits.slice(0, 5).reduce((a, b) => a + Number(b), 0) ===
          c.digits.slice(5).reduce((a, b) => a + Number(b), 0),
    },
    {
      name: "🧩 Complement Mirror",
      explanation: "Every digit and its mirror position add up to 9.",
      oneIn: 100000,
      test: (c) =>
        c.blanks === 0 &&
        c.digits.every((d, i) => Number(d) + Number(c.digits[9 - i]) === 9),
    },
    {
      name: "👣 Skip Counting",
      explanation: "Four or more digits in a row step by exactly two.",
      oneIn: 160,
      test: (c) =>
        Math.max(longestStep(c.digits, 2), longestStep(c.digits, -2)) >= 4,
    },
    {
      name: "⚡ Zigzag",
      explanation:
        "At least eight digits in a row alternate up, down, up, down.",
      oneIn: 40,
      test: (c) => c.digits.length >= 8 && isZigzag(c.digits),
    },
    {
      name: "🪙 Coin Flip",
      explanation: "Every visible digit is a 0 or a 1 (six or more shown).",
      oneIn: 20000,
      test: (c) =>
        c.digits.length >= 6 && c.digits.every((d) => d === "0" || d === "1"),
    },
    {
      name: "🎲 Dice Only",
      explanation:
        "Every visible digit is between 1 and 6 (seven or more shown).",
      oneIn: 80,
      test: (c) =>
        c.digits.length >= 7 && c.digits.every((d) => d >= "1" && d <= "6"),
    },
    {
      name: "🟩 Square Digits",
      explanation:
        "Every visible digit is a perfect square: 0, 1, 4 or 9 (six or more shown).",
      oneIn: 300,
      test: (c) =>
        c.digits.length >= 6 && c.digits.every((d) => "0149".includes(d)),
    },
    {
      name: "🕛 Twelve O'Clock",
      explanation: "The digits 1200 appear in a row.",
      oneIn: 1500,
      test: (c) => c.compact.includes("1200"),
    },
  ];

  /* Detector called from analyze() in script.js */
  function drExtraBadges(chars, digits, compact, addBadge) {
    const counts = {};
    digits.forEach((d) => (counts[d] = (counts[d] || 0) + 1));

    const c = {
      chars,
      digits,
      compact,
      counts,
      sum: digits.reduce((a, b) => a + Number(b), 0),
      blanks: chars.filter((x) => x === "_").length,
      runs: runsOf(digits),
      distinct: new Set(digits).size,
    };

    for (const [key, name, explanation, oneIn] of EXTRA_REFERENCES) {
      if (compact.includes(key)) addBadge(name, explanation, oneIn);
    }

    for (const p of EXTRA_PATTERNS) {
      let hit = false;
      try {
        hit = p.test(c);
      } catch (e) {
        hit = false;
      }
      if (hit) addBadge(p.name, p.explanation, p.oneIn);
    }
  }

  EXTRA_REFERENCES.forEach(([, n, e, o]) => register(n, e, o));
  EXTRA_PATTERNS.forEach((p) => register(p.name, p.explanation, p.oneIn));

  G.drExtraBadges = drExtraBadges;
  G.DR_EXTRA = { EXTRA_REFERENCES, EXTRA_PATTERNS };

  /* "New badge!" toast, called before the roll is stored */
  G.drNotifyNewBadges = function (badges) {
    try {
      const known = getUnlockedBadgeNames();
      const fresh = (badges || [])
        .map((b) => b.name)
        .filter((n) => !known.has(n));
      if (!fresh.length) return;
      toast(
        fresh.length === 1
          ? "🆕 New badge unlocked: " + fresh[0]
          : "🆕 " + fresh.length + " new badges, including " + fresh[0],
      );
    } catch (e) {}
  };

  /* Nothing below needs a page (lets the odds be tested in Node). */
  if (!HAS_DOM) return;

  /* ==========================================================
     2. RARITY EFFECTS
     ========================================================== */

  const TIERS = [
    "WORTHLESS",
    "NOVICE",
    "PLAIN",
    "BASIC",
    "COMMON",
    "UNCOMMON",
    "RARE",
    "EPIC",
    "LEGENDARY",
    "MYTHIC",
    "DIVINE",
    "TRANSCENDENT",
    "CELESTIAL",
    "ASCENDED",
    "OMNIPOTENT",
    "INFINITE",
    "BEYOND",
    "ABSOLUTE",
    "???",
    "FORBIDDEN",
    "PARADOX",
    "OBLIVION",
    "GENESIS",
    "OMEGA",
  ];

  const FIRST_CINEMATIC = TIERS.indexOf("TRANSCENDENT");

  const FX_COLORS = {
    WORTHLESS: "#5b6477",
    NOVICE: "#7d879b",
    PLAIN: "#9aa5ba",
    BASIC: "#b0b9c9",
    COMMON: "#b9c1d0",
    UNCOMMON: "#55e68a",
    RARE: "#4da6ff",
    EPIC: "#b66cff",
    LEGENDARY: "#ffb52e",
    MYTHIC: "#ff4fd8",
    DIVINE: "#64f7ff",
    TRANSCENDENT: "#ffffff",
    CELESTIAL: "#a9b2ff",
    ASCENDED: "#ffd36b",
    OMNIPOTENT: "#fff2b8",
    INFINITE: "#7cf7ff",
    BEYOND: "#ff4fe0",
    ABSOLUTE: "#ffffff",
    "???": "#ff2a2a",
    FORBIDDEN: "#b04dff",
    PARADOX: "#ffffff",
    OBLIVION: "#6a5cff",
    GENESIS: "#ffd9a0",
    OMEGA: "#ff9ad5",
  };

  const DURATIONS = [
    3500, 4000, 4500, 5000, 5500, 6000, 6500, 7500, 8000, 8500, 9000, 9500,
    11000,
  ];

  const tierOf = (r) => Math.max(0, TIERS.indexOf(r));
  const fxName = (r) => (r === "???" ? "unknown" : r.toLowerCase());

  const reduced = () =>
    !!(
      G.matchMedia && G.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

  function fxMode() {
    try {
      return localStorage.getItem("digitRollFX") || "full";
    } catch (e) {
      return "full";
    }
  }

  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- spark particles (simple effect) ---------- */

  let sparkCanvas = null;
  let sparks = [];
  let sparkRaf = 0;

  function sparkBurst(el, color, count) {
    if (!sparkCanvas) {
      sparkCanvas = document.createElement("canvas");
      sparkCanvas.id = "drSparkCanvas";
      document.body.appendChild(sparkCanvas);
    }
    const dpr = Math.min(2, G.devicePixelRatio || 1);
    sparkCanvas.width = G.innerWidth * dpr;
    sparkCanvas.height = G.innerHeight * dpr;

    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(2, 7);
      sparks.push({
        x: cx + rand(-r.width / 3, r.width / 3),
        y: cy,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1.5,
        life: 0,
        max: rand(40, 75),
        size: rand(1.5, 3.6),
        color,
      });
    }

    if (!sparkRaf) sparkRaf = requestAnimationFrame(sparkLoop);

    function sparkLoop() {
      const ctx = sparkCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, G.innerWidth, G.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      sparks = sparks.filter((p) => p.life < p.max);
      for (const p of sparks) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.vx *= 0.99;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (sparks.length) sparkRaf = requestAnimationFrame(sparkLoop);
      else {
        sparkRaf = 0;
        ctx.clearRect(0, 0, G.innerWidth, G.innerHeight);
      }
    }
  }

  /* ---------- simple effect: every tier below TRANSCENDENT ---------- */

  function simpleEffect(rarity, tier, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const num = document.getElementById("number");
      if (!num) return resolve();

      const color = FX_COLORS[rarity] || "#fff";
      num.classList.remove("fx-pop");
      void num.offsetWidth;
      num.style.setProperty("--fx-color", color + "88");
      num.style.setProperty(
        "--fx-scale",
        String(1.03 + Math.max(0, Math.min(tier - 1, 9)) * 0.012),
      );
      num.classList.add("fx-pop");

      const count = tier - 1 < 4 ? 0 : Math.min(70, (tier - 1 - 3) * 10);
      if (count && !reduced() && !opts.noSparks) sparkBurst(num, color, count);

      setTimeout(
        () => {
          num.classList.remove("fx-pop");
          resolve();
        },
        tier - 1 >= 7 ? 1300 : 650,
      );
    });
  }

  /* ---------- mid-weight scenes: EPIC, LEGENDARY, MYTHIC, DIVINE ----------
     Each one plays inside the roll card (never full screen) and uses
     shapes, light and motion rather than just particles. */

  const FIRST_MID = TIERS.indexOf("EPIC");

  const MID_DURATION = {
    epic: 2300,
    legendary: 2800,
    mythic: 2600,
    divine: 3000,
  };

  function runeSVG() {
    let ticks = "";
    for (let i = 0; i < 36; i++) {
      const long = i % 3 === 0;
      ticks += `<line x1="0" y1="${-(long ? 188 : 192)}" x2="0" y2="-200" transform="rotate(${i * 10})"/>`;
    }
    const tri = (r, flip) => {
      const pts = [0, 1, 2].map((k) => {
        const a = ((flip ? 60 : 0) + k * 120 - 90) * (Math.PI / 180);
        return (
          (Math.cos(a) * r).toFixed(1) + "," + (Math.sin(a) * r).toFixed(1)
        );
      });
      return pts.join(" ");
    };
    let gems = "";
    for (let i = 0; i < 8; i++) {
      gems += `<path d="M0,-176 l6,8 l-6,8 l-6,-8z" transform="rotate(${i * 45})" class="drRuneGem"/>`;
    }
    return `<svg class="drRune" viewBox="-210 -210 420 420" aria-hidden="true">
      <g class="drRuneSpinA">
        <circle class="drRuneRing" r="180" pathLength="1"/>
        <g class="drRuneTicks">${ticks}</g>
        ${gems}
      </g>
      <g class="drRuneSpinB">
        <circle class="drRuneDash" r="150"/>
        <polygon class="drRuneStar" points="${tri(140, false)}" pathLength="1"/>
        <polygon class="drRuneStar d2" points="${tri(140, true)}" pathLength="1"/>
      </g>
      <circle class="drRuneCore" r="60"/>
    </svg>`;
  }

  const MID_HTML = {
    epic: runeSVG,
    legendary: () =>
      '<div class="drSun"></div>' +
      '<div class="drBanner"><span>★ LEGENDARY ★</span></div>' +
      '<div class="drSweepBox"><div class="drSweep"></div></div>',
    mythic: () =>
      '<div class="drPortal"><i></i><i></i><b></b></div><div class="drRiftLine"></div>',
    divine: () =>
      '<div class="drBeam"></div><div class="drHalo"></div><div class="drRipple"></div><div class="drBloom"></div>',
  };

  function midEffect(rarity, tier) {
    return new Promise((resolve) => {
      const num = document.getElementById("number");
      const card = num && num.closest(".rollCard");
      const kind = fxName(rarity);

      if (!num || !card || reduced() || !MID_HTML[kind]) {
        simpleEffect(rarity, tier).then(resolve);
        return;
      }

      document.querySelectorAll(".drMid").forEach((e) => e.remove());

      const cr = card.getBoundingClientRect();
      const nr = num.getBoundingClientRect();

      const stage = document.createElement("div");
      stage.className = "drMid drMid-" + kind;
      stage.style.setProperty("--c", FX_COLORS[rarity] || "#fff");
      stage.style.setProperty("--cx", nr.left - cr.left + nr.width / 2 + "px");
      stage.style.setProperty("--cy", nr.top - cr.top + nr.height / 2 + "px");
      stage.style.setProperty("--nw", nr.width + "px");
      stage.style.setProperty("--nh", nr.height + "px");
      stage.style.setProperty("--nl", nr.left - cr.left + "px");
      stage.style.setProperty("--nt", nr.top - cr.top + "px");
      stage.innerHTML = MID_HTML[kind]();
      card.appendChild(stage);

      num.classList.add("fx-" + kind);
      simpleEffect(rarity, tier, { noSparks: true });

      setTimeout(() => {
        stage.remove();
        num.classList.remove("fx-" + kind);
        resolve();
      }, MID_DURATION[kind]);
    });
  }

  /* ---------- cinematic engine: TRANSCENDENT and above ---------- */

  let activeFx = null;

  function shakeEls(S, amp) {
    (S.shake || []).forEach((el) => {
      el.style.transform =
        amp > 0.2
          ? `translate(${(Math.random() - 0.5) * amp * 2}px, ${(Math.random() - 0.5) * amp * 2}px)`
          : "";
    });
  }

  function envelope(t) {
    if (t < 0.08) return t / 0.08;
    if (t > 0.82) return Math.max(0, (1 - t) / 0.18);
    return 1;
  }

  /* One draw function per tier. Signature: (ctx, w, h, t, ms, env, S, overlay) */
  const DRAWERS = [
    /* TRANSCENDENT — white light, expanding rings, rising motes */
    (c, w, h, t, ms, env, S) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h) / 2;
      if (!S.init) {
        S.init = 1;
        S.p = Array.from({ length: 150 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          s: 0.5 + Math.random() * 2.5,
          v: 0.3 + Math.random() * 1.4,
          ph: Math.random() * 6.28,
        }));
      }
      c.fillStyle = `rgba(4,8,22,${0.78 * env})`;
      c.fillRect(0, 0, w, h);

      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.9);
      g.addColorStop(0, `rgba(255,255,255,${0.55 * env})`);
      g.addColorStop(0.35, `rgba(150,190,255,${0.22 * env})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);

      c.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const k = (t * 1.6 + i * 0.2) % 1;
        c.strokeStyle = `rgba(210,235,255,${(1 - k) * 0.7 * env})`;
        c.beginPath();
        c.arc(cx, cy, Math.max(0, k * R), 0, 6.283);
        c.stroke();
      }

      c.globalCompositeOperation = "lighter";
      for (const p of S.p) {
        p.y -= p.v * (1 + t * 2);
        if (p.y < -10) p.y = h + 10;
        const a = (0.4 + 0.6 * Math.sin(ms / 300 + p.ph) ** 2) * env;
        c.fillStyle = `rgba(220,240,255,${a})`;
        c.beginPath();
        c.arc(p.x, p.y, p.s, 0, 6.283);
        c.fill();
      }
      c.globalCompositeOperation = "source-over";

      if (t < 0.1) {
        c.fillStyle = `rgba(255,255,255,${1 - t / 0.1})`;
        c.fillRect(0, 0, w, h);
      }
    },

    /* CELESTIAL — nebula, twinkling stars, shooting stars */
    (c, w, h, t, ms, env, S) => {
      if (!S.init) {
        S.init = 1;
        S.stars = Array.from({ length: 240 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          s: Math.random() * 1.8 + 0.3,
          ph: Math.random() * 6.28,
          sp: 0.2 + Math.random() * 0.8,
        }));
        S.shoot = [];
        S.next = 0;
      }
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(6,4,28,${0.92 * env})`);
      g.addColorStop(1, `rgba(26,10,56,${0.92 * env})`);
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);

      c.globalCompositeOperation = "lighter";
      const neb = [
        [0.25, 0.35, "120,90,255"],
        [0.75, 0.6, "60,200,255"],
        [0.5, 0.8, "255,100,220"],
      ];
      neb.forEach((n, i) => {
        const x = w * n[0] + Math.sin(ms / 2000 + i) * 60;
        const y = h * n[1] + Math.cos(ms / 2300 + i) * 40;
        const r = Math.max(w, h) * 0.38;
        const gg = c.createRadialGradient(x, y, 0, x, y, r);
        gg.addColorStop(0, `rgba(${n[2]},${0.28 * env})`);
        gg.addColorStop(1, `rgba(${n[2]},0)`);
        c.fillStyle = gg;
        c.fillRect(0, 0, w, h);
      });

      for (const s of S.stars) {
        const a =
          (0.35 + 0.65 * Math.abs(Math.sin((ms / 700) * s.sp + s.ph))) * env;
        c.fillStyle = `rgba(255,255,255,${a})`;
        c.beginPath();
        c.arc(s.x, (s.y + ms * 0.01 * s.sp) % h, s.s, 0, 6.283);
        c.fill();
      }

      if (ms > S.next) {
        S.next = ms + 250 + Math.random() * 350;
        S.shoot.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.5,
          vx: 9 + Math.random() * 7,
          vy: 4 + Math.random() * 4,
          life: 0,
        });
      }
      S.shoot = S.shoot.filter((s) => s.life < 40);
      for (const s of S.shoot) {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const gl = c.createLinearGradient(
          s.x,
          s.y,
          s.x - s.vx * 8,
          s.y - s.vy * 8,
        );
        gl.addColorStop(0, `rgba(255,255,255,${env})`);
        gl.addColorStop(1, "rgba(255,255,255,0)");
        c.strokeStyle = gl;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(s.x, s.y);
        c.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
        c.stroke();
      }

      const fa = Math.max(0, 1 - Math.abs(t - 0.3) / 0.12) * env;
      if (fa > 0) {
        const fg = c.createRadialGradient(
          w / 2,
          h / 2,
          0,
          w / 2,
          h / 2,
          Math.min(w, h) * 0.5,
        );
        fg.addColorStop(0, `rgba(255,255,255,${fa})`);
        fg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = fg;
        c.fillRect(0, 0, w, h);
      }
      c.globalCompositeOperation = "source-over";
    },

    /* ASCENDED — golden light pillars, embers, halo */
    (c, w, h, t, ms, env, S) => {
      if (!S.init) {
        S.init = 1;
        S.em = Array.from({ length: 160 }, () => ({
          x: Math.random() * w,
          y: h + Math.random() * h,
          v: 0.8 + Math.random() * 2.6,
          s: 0.8 + Math.random() * 2.4,
          ph: Math.random() * 6.28,
        }));
      }
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, `rgba(30,16,2,${0.85 * env})`);
      bg.addColorStop(1, `rgba(80,40,4,${0.85 * env})`);
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      c.globalCompositeOperation = "lighter";
      const n = 7;
      for (let i = 0; i < n; i++) {
        const x = (w * (i + 0.5)) / n;
        const bw = (w / n) * (0.35 + 0.25 * Math.sin(ms / 500 + i * 1.7));
        const grow = Math.max(0, Math.min(1, t * 3 - i * 0.05));
        const gg = c.createLinearGradient(0, h, 0, h * (1 - grow));
        gg.addColorStop(0, `rgba(255,200,80,${0.5 * env})`);
        gg.addColorStop(1, "rgba(255,200,80,0)");
        c.fillStyle = gg;
        c.fillRect(x - bw / 2, 0, bw, h);
      }

      const hr = (0.15 + 0.5 * Math.min(1, t * 1.6)) * Math.min(w, h);
      c.strokeStyle = `rgba(255,226,140,${0.8 * env})`;
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(w / 2, h * 0.28, hr, hr * 0.22, 0, 0, 6.283);
      c.stroke();
      c.beginPath();
      c.ellipse(w / 2, h * 0.28, hr * 0.7, hr * 0.15, 0, 0, 6.283);
      c.stroke();

      for (const p of S.em) {
        p.y -= p.v * (1 + t);
        p.x += Math.sin(ms / 400 + p.ph) * 0.6;
        if (p.y < -10) p.y = h + 10;
        c.fillStyle = `rgba(255,${190 + Math.floor(Math.random() * 50)},90,${(0.5 + 0.5 * Math.sin(ms / 200 + p.ph)) * env})`;
        c.beginPath();
        c.arc(p.x, p.y, p.s, 0, 6.283);
        c.fill();
      }
      c.globalCompositeOperation = "source-over";
      shakeEls(S, t < 0.3 ? (1 - t / 0.3) * 5 : 0);
    },

    /* OMNIPOTENT — rotating sun rays, shockwaves, heavy shake */
    (c, w, h, t, ms, env, S) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h);
      c.fillStyle = `rgba(20,10,0,${0.82 * env})`;
      c.fillRect(0, 0, w, h);

      c.globalCompositeOperation = "lighter";
      const rays = 28;
      const rot = ms / 900;
      for (let i = 0; i < rays; i++) {
        const a0 = rot + i * (6.283 / rays);
        const a1 = a0 + (6.283 / rays) * 0.5;
        c.fillStyle = `rgba(255,${200 + (i % 3) * 18},120,${0.32 * env})`;
        c.beginPath();
        c.moveTo(cx, cy);
        c.arc(cx, cy, R, a0, a1);
        c.closePath();
        c.fill();
      }

      const sr = (60 + 40 * Math.sin(ms / 160)) * (0.5 + env);
      const sg = c.createRadialGradient(cx, cy, 0, cx, cy, sr * 3);
      sg.addColorStop(0, `rgba(255,255,255,${env})`);
      sg.addColorStop(0.3, `rgba(255,230,150,${0.8 * env})`);
      sg.addColorStop(1, "rgba(255,200,80,0)");
      c.fillStyle = sg;
      c.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const k = (ms / 700 + i / 3) % 1;
        c.strokeStyle = `rgba(255,240,200,${(1 - k) * 0.8 * env})`;
        c.lineWidth = 6 * (1 - k) + 1;
        c.beginPath();
        c.arc(cx, cy, k * R * 0.6, 0, 6.283);
        c.stroke();
      }
      c.globalCompositeOperation = "source-over";
      shakeEls(S, (t < 0.75 ? 9 : 0) * env);
    },

    /* INFINITE — hue-cycling tunnel + drawn lemniscate */
    (c, w, h, t, ms, env) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h) / 2;
      c.fillStyle = `rgba(2,6,18,${0.88 * env})`;
      c.fillRect(0, 0, w, h);

      c.globalCompositeOperation = "lighter";
      const n = 26;
      for (let i = 0; i < n; i++) {
        const z = (i / n + ms / 4200) % 1;
        const r = Math.pow(z, 2.3) * R * 1.05;
        const hue = (ms / 12 + i * 14) % 360;
        c.strokeStyle = `hsla(${hue},100%,62%,${Math.sin(z * Math.PI) * 0.75 * env})`;
        c.lineWidth = 1 + z * 5;
        c.save();
        c.translate(cx, cy);
        c.rotate(ms / 2500 + i * 0.05);
        c.strokeRect(-r, -r, r * 2, r * 2);
        c.restore();
      }

      const a = Math.min(w, h) * 0.32;
      c.lineWidth = 6;
      c.shadowBlur = 24;
      c.shadowColor = "#7cf7ff";
      c.strokeStyle = `rgba(180,255,255,${env})`;
      c.beginPath();
      const steps = 240;
      const upto = Math.min(1, t * 2.2) * steps;
      for (let i = 0; i <= upto; i++) {
        const u = (i / steps) * 6.283;
        const d = 1 + Math.sin(u) * Math.sin(u);
        const x = cx + ((a * Math.cos(u)) / d) * 1.6;
        const y = cy + ((a * Math.sin(u) * Math.cos(u)) / d) * 1.6;
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.stroke();
      c.shadowBlur = 0;
      c.globalCompositeOperation = "source-over";
    },

    /* BEYOND — digit rain, dimensional rip, RGB-split glitch */
    (c, w, h, t, ms, env, S) => {
      if (!S.init) {
        S.init = 1;
        S.cols = Array.from({ length: Math.ceil(w / 22) }, () => ({
          y: Math.random() * h,
          v: 3 + Math.random() * 9,
        }));
      }
      c.fillStyle = `rgba(6,0,14,${0.9 * env})`;
      c.fillRect(0, 0, w, h);

      c.font = "16px monospace";
      c.textBaseline = "top";
      S.cols.forEach((col, i) => {
        col.y += col.v;
        if (col.y > h) col.y = -20;
        for (let k = 0; k < 12; k++) {
          c.fillStyle = `rgba(255,79,224,${(1 - k / 12) * 0.55 * env})`;
          c.fillText(
            String(Math.floor(Math.random() * 10)),
            i * 22,
            col.y - k * 18,
          );
        }
      });

      const crack = Math.min(1, t * 2.2);
      const wid =
        (8 + crack * Math.min(w, h) * 0.22) * (0.7 + 0.3 * Math.sin(ms / 60));
      const gg = c.createLinearGradient(w / 2 - wid, 0, w / 2 + wid, 0);
      gg.addColorStop(0, "rgba(120,40,255,0)");
      gg.addColorStop(0.5, `rgba(255,255,255,${0.85 * env})`);
      gg.addColorStop(1, "rgba(120,40,255,0)");
      c.fillStyle = gg;
      c.beginPath();
      c.moveTo(w / 2, 0);
      for (let y = 0; y <= h; y += h / 24)
        c.lineTo(w / 2 + (Math.random() - 0.5) * wid * 0.9, y);
      c.lineTo(w / 2, h);
      for (let y = h; y >= 0; y -= h / 24)
        c.lineTo(w / 2 + (Math.random() - 0.5) * wid * 0.9, y);
      c.closePath();
      c.fill();

      c.globalCompositeOperation = "lighter";
      const tints = [
        "rgba(0,255,255,.22)",
        "rgba(255,0,200,.22)",
        "rgba(255,255,0,.15)",
      ];
      for (let i = 0; i < 14; i++) {
        if (Math.random() < 0.6) {
          c.fillStyle = tints[i % 3];
          c.fillRect(
            (Math.random() - 0.5) * 120,
            Math.random() * h,
            w,
            4 + Math.random() * 50,
          );
        }
      }
      c.globalCompositeOperation = "source-over";

      c.fillStyle = `rgba(0,0,0,${0.18 * env})`;
      for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1);
      shakeEls(S, Math.random() < 0.2 ? 10 * env : 0);
    },

    /* ABSOLUTE — blackout, white-gold detonation, spinning hexagons, white-out */
    (c, w, h, t, ms, env, S, ov) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h) / 2;

      c.fillStyle = `rgba(0,0,0,${Math.min(1, t / 0.12) * 0.96})`;
      c.fillRect(0, 0, w, h);

      if (t > 0.2) {
        const k = Math.min(1, (t - 0.2) / 0.45);
        const e = 1 - Math.pow(1 - k, 3);
        const gg = c.createRadialGradient(cx, cy, 0, cx, cy, R * e * 1.1 + 1);
        gg.addColorStop(0, "rgba(255,255,255,1)");
        gg.addColorStop(0.6, "rgba(255,235,170,.95)");
        gg.addColorStop(1, "rgba(255,200,90,0)");
        c.fillStyle = gg;
        c.fillRect(0, 0, w, h);

        c.globalCompositeOperation = "lighter";
        for (let i = 0; i < 9; i++) {
          const rr = (60 + i * 46) * (0.4 + e) * (Math.min(w, h) / 700 + 0.4);
          c.strokeStyle = `hsla(${(ms / 10 + i * 40) % 360},90%,60%,.55)`;
          c.lineWidth = 2.5;
          c.beginPath();
          for (let s = 0; s <= 6; s++) {
            const a =
              (s / 6) * 6.283 + (ms / 1200) * (i % 2 ? 1 : -1) + i * 0.3;
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;
            if (s) c.lineTo(x, y);
            else c.moveTo(x, y);
          }
          c.stroke();
        }
        c.globalCompositeOperation = "source-over";
      }

      if (t > 0.6) {
        const k = Math.min(1, (t - 0.6) / 0.25);
        c.fillStyle = `rgba(255,255,255,${k})`;
        c.fillRect(0, 0, w, h);
      }

      ov.classList.toggle("dark", t > 0.68);
      ov.style.opacity = t > 0.88 ? String(Math.max(0, (1 - t) / 0.12)) : "1";
    },

    /* ??? — red static, error spam, corrupted screen */
    (c, w, h, t, ms, env, S) => {
      if (!S.init) {
        S.init = 1;
        S.n = document.createElement("canvas");
        S.n.width = Math.ceil(w / 5);
        S.n.height = Math.ceil(h / 5);
        S.nc = S.n.getContext("2d");
        S.words = [
          "NULL",
          "0xDEAD",
          "UNDEFINED",
          "OVERFLOW",
          "???",
          "NaN",
          "SEGFAULT",
          "ERR_RARITY",
        ];
      }
      c.globalAlpha = env;

      const img = S.nc.createImageData(S.n.width, S.n.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 * 0.45;
        d[i] = v;
        d[i + 1] = v * 0.12;
        d[i + 2] = v * 0.12;
        d[i + 3] = 255;
      }
      S.nc.putImageData(img, 0, 0);
      c.imageSmoothingEnabled = false;
      c.drawImage(S.n, 0, 0, w, h);

      const pulse = 0.5 + 0.5 * Math.sin(ms / 180);
      const vg = c.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.2,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.7,
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(160,0,0,${0.55 + 0.3 * pulse})`);
      c.fillStyle = vg;
      c.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i++) {
        if (Math.random() < 0.5) {
          c.fillStyle = `rgba(255,${Math.random() < 0.3 ? 255 : 40},40,.35)`;
          c.fillRect(0, Math.random() * h, w, 2 + Math.random() * 26);
        }
      }

      c.font = "bold 18px monospace";
      c.fillStyle = "rgba(255,70,70,.8)";
      for (let i = 0; i < 8; i++) {
        if (Math.random() < 0.18) {
          c.fillText(
            S.words[Math.floor(Math.random() * S.words.length)],
            Math.random() * w,
            Math.random() * h,
          );
        }
      }
      c.globalAlpha = 1;
      shakeEls(S, (6 + 10 * pulse) * env);
    },

    /* FORBIDDEN — a sealed rune circle; chains snap one by one, violet light pours out */
    (c, w, h, t, ms, env, S) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.34;
      c.fillStyle = `rgba(6,0,14,${Math.min(0.94, t * 8)})`;
      c.fillRect(0, 0, w, h);
      const open = Math.max(0, (t - 0.5) / 0.4);
      // rune circle
      c.save();
      c.translate(cx, cy);
      c.rotate(ms / 1800);
      c.strokeStyle = `rgba(176,77,255,${0.8 * env})`;
      c.shadowColor = "#b04dff";
      c.shadowBlur = 24;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, R * (1 + open * 0.8), 0, 6.283);
      c.stroke();
      c.beginPath();
      c.arc(0, 0, R * 0.78 * (1 + open * 0.8), 0, 6.283);
      c.stroke();
      c.font = `bold ${Math.round(R * 0.16)}px serif`;
      c.fillStyle = `rgba(220,170,255,${env})`;
      c.textAlign = "center";
      const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * 6.283;
        c.fillText(
          runes[i],
          Math.cos(a) * R * 0.89 * (1 + open * 0.8),
          Math.sin(a) * R * 0.89 * (1 + open * 0.8) + R * 0.05,
        );
      }
      // pentagram
      c.beginPath();
      for (let i = 0; i <= 5; i++) {
        const a = ((i * 2) / 5) * 6.283 - 1.5708;
        const x = Math.cos(a) * R * 0.76,
          y = Math.sin(a) * R * 0.76;
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.stroke();
      c.restore();
      // chains that snap
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 6.283 + 0.4;
        const snap = t > 0.3 + i * 0.07;
        c.strokeStyle = snap
          ? `rgba(255,255,255,${Math.max(0, 1 - (t - 0.3 - i * 0.07) * 6)})`
          : "rgba(140,140,160,.9)";
        c.lineWidth = snap ? 2 : 5;
        c.setLineDash(snap ? [4, 14] : [14, 6]);
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * R * 2.2, cy + Math.sin(a) * R * 2.2);
        c.lineTo(
          cx + Math.cos(a) * R * (snap ? 1.5 : 0.95),
          cy + Math.sin(a) * R * (snap ? 1.5 : 0.95),
        );
        c.stroke();
      }
      c.setLineDash([]);
      if (open > 0) {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 2.4 * open);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - open * 0.5)})`);
        g.addColorStop(0.4, `rgba(176,77,255,${0.6 * env})`);
        g.addColorStop(1, "rgba(60,0,110,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      }
      shakeEls(S, open > 0 ? 8 * env : 0);
    },

    /* PARADOX — a mirrored, impossible spiral; the screen keeps inverting */
    (c, w, h, t, ms, env, S, ov) => {
      const cx = w / 2,
        cy = h / 2;
      c.fillStyle = `rgba(0,0,0,${Math.min(0.9, t * 6)})`;
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = "lighter";
      const N = 26;
      for (let i = 0; i < N; i++) {
        const k = i / N;
        const size =
          (Math.min(w, h) * 0.04 + k * Math.min(w, h) * 0.7) *
          (0.6 + 0.4 * Math.sin(ms / 400 + i));
        const a = (ms / 900) * (i % 2 ? 1 : -1) * (1 + k) + k * 5;
        c.save();
        c.translate(cx, cy);
        c.rotate(a);
        c.strokeStyle =
          i % 2
            ? `rgba(255,255,255,${0.5 * env})`
            : `rgba(80,200,255,${0.5 * env})`;
        c.lineWidth = 2.2;
        c.strokeRect(-size / 2, -size / 2, size, size);
        c.restore();
      }
      // two clones of one ring orbit in opposite directions and cross
      for (const s of [1, -1]) {
        const x = cx + Math.cos((ms / 500) * s) * w * 0.25;
        const y = cy + Math.sin((ms / 350) * s) * h * 0.22;
        const g = c.createRadialGradient(x, y, 0, x, y, 90);
        g.addColorStop(
          0,
          s > 0 ? "rgba(255,120,120,.9)" : "rgba(120,160,255,.9)",
        );
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(x - 90, y - 90, 180, 180);
      }
      c.globalCompositeOperation = "source-over";
      // the world flips
      const flip = Math.floor(ms / 330) % 2 === 0 && t > 0.2 && t < 0.85;
      ov.style.filter = flip && Math.random() < 0.5 ? "invert(1)" : "";
      if (t > 0.92) ov.style.filter = "";
      shakeEls(S, 4 * env);
    },

    /* OBLIVION — a black hole drinks the screen */
    (c, w, h, t, ms, env, S) => {
      const cx = w / 2,
        cy = h / 2;
      if (!S.init) {
        S.init = 1;
        S.stars = Array.from({ length: 260 }, () => ({
          a: Math.random() * 6.283,
          r: 0.15 + Math.random() * 0.95,
          s: 0.4 + Math.random() * 1.6,
          c: Math.random(),
        }));
      }
      c.fillStyle = `rgba(0,0,6,${Math.min(0.97, t * 6)})`;
      c.fillRect(0, 0, w, h);
      const R = Math.hypot(w, h) / 2;
      const pull = Math.min(1, t * 1.15);
      // stars spiral inward
      S.stars.forEach((st) => {
        const rr = st.r * R * (1 - (pull * 0.92 * st.s) / 2 - 0.02);
        const ang = st.a + pull * 7 * (1.2 - st.r) + ms / 4000;
        const x = cx + Math.cos(ang) * Math.max(8, rr);
        const y = cy + Math.sin(ang) * Math.max(8, rr) * 0.55;
        c.fillStyle =
          st.c < 0.5
            ? `rgba(160,170,255,${0.8 * env})`
            : `rgba(255,255,255,${0.8 * env})`;
        c.fillRect(x, y, 2 + (1 - st.r) * 3, 2);
      });
      // accretion disc
      c.save();
      c.translate(cx, cy);
      c.scale(1, 0.38);
      c.rotate(ms / 3000);
      for (let i = 0; i < 4; i++) {
        const rr = (90 + i * 55) * (0.5 + pull) * (Math.min(w, h) / 700 + 0.5);
        const g = c.createRadialGradient(0, 0, rr * 0.6, 0, 0, rr);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(
          0.6,
          `rgba(${100 + i * 40},${80 + i * 10},255,${0.35 * env})`,
        );
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, rr, 0, 6.283);
        c.fill();
      }
      c.restore();
      // the hole
      const hr = (40 + pull * 90) * (Math.min(w, h) / 700 + 0.5);
      c.fillStyle = "#000";
      c.shadowColor = "#6a5cff";
      c.shadowBlur = 40;
      c.beginPath();
      c.arc(cx, cy, hr, 0, 6.283);
      c.fill();
      c.shadowBlur = 0;
      // collapse flash
      if (t > 0.86) {
        const k = (t - 0.86) / 0.14;
        c.fillStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * 0.9})`;
        c.fillRect(0, 0, w, h);
      }
      shakeEls(S, (3 + pull * 7) * env);
    },

    /* GENESIS — a single point detonates into a spiral galaxy and newborn stars */
    (c, w, h, t, ms, env, S) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h) / 2;
      if (!S.init) {
        S.init = 1;
        S.pts = Array.from({ length: 420 }, (_, i) => ({
          arm: i % 3,
          d: Math.random(),
          j: (Math.random() - 0.5) * 0.5,
          c: Math.random(),
        }));
      }
      c.fillStyle = `rgba(0,0,0,${t < 0.12 ? 0.97 : 0.88})`;
      c.fillRect(0, 0, w, h);
      if (t < 0.18) {
        // the single point
        const k = t / 0.18;
        c.fillStyle = "#fff";
        c.shadowColor = "#ffd9a0";
        c.shadowBlur = 30 + k * 40;
        c.beginPath();
        c.arc(cx, cy, 2 + k * 4, 0, 6.283);
        c.fill();
        c.shadowBlur = 0;
      } else {
        const k = Math.min(1, (t - 0.18) / 0.4);
        const e = 1 - Math.pow(1 - k, 3);
        const bang = c.createRadialGradient(cx, cy, 0, cx, cy, R * e + 1);
        bang.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k * 0.6)})`);
        bang.addColorStop(0.3, `rgba(255,217,160,${0.6 * (1 - k * 0.5)})`);
        bang.addColorStop(1, "rgba(90,40,160,0)");
        c.fillStyle = bang;
        c.fillRect(0, 0, w, h);
        c.globalCompositeOperation = "lighter";
        S.pts.forEach((p) => {
          const rr = p.d * R * 0.8 * e;
          const a = (p.arm / 3) * 6.283 + p.d * 5 + p.j + ms / 2500;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr * 0.6;
          c.fillStyle =
            p.c < 0.3
              ? `rgba(255,200,120,${0.85 * env})`
              : p.c < 0.7
                ? `rgba(255,255,255,${0.85 * env})`
                : `rgba(150,170,255,${0.85 * env})`;
          c.fillRect(x, y, 2.5, 2.5);
        });
        // shock rings
        for (let i = 0; i < 3; i++) {
          const rr = R * ((t * 1.2 + i * 0.25) % 1);
          c.strokeStyle = `rgba(255,230,180,${0.5 * (1 - rr / R)})`;
          c.lineWidth = 3;
          c.beginPath();
          c.arc(cx, cy, Math.max(0, rr), 0, 6.283);
          c.stroke();
        }
        c.globalCompositeOperation = "source-over";
      }
      shakeEls(S, t > 0.18 && t < 0.5 ? 12 * env : 2);
    },

    /* OMEGA — the final tier: gold-white sunburst, lightning arcs, a huge Ω and rainbow shock */
    (c, w, h, t, ms, env, S, ov) => {
      const cx = w / 2,
        cy = h / 2,
        R = Math.hypot(w, h) / 2;
      c.fillStyle = `rgba(0,0,0,${Math.min(0.96, t * 5)})`;
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = "lighter";
      // spinning rays
      const rays = 28;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * 6.283 + ms / 1400;
        const wd = 0.05 + 0.03 * Math.sin(ms / 300 + i);
        c.fillStyle = `hsla(${(ms / 12 + i * 13) % 360},100%,62%,${0.28 * env})`;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(
          cx + Math.cos(a - wd) * R * 1.2,
          cy + Math.sin(a - wd) * R * 1.2,
        );
        c.lineTo(
          cx + Math.cos(a + wd) * R * 1.2,
          cy + Math.sin(a + wd) * R * 1.2,
        );
        c.fill();
      }
      // rainbow shock rings
      for (let i = 0; i < 6; i++) {
        const k = Math.abs((t * 2.4 + i / 6) % 1);
        c.strokeStyle = `hsla(${(i * 60 + ms / 8) % 360},100%,65%,${0.6 * (1 - k)})`;
        c.lineWidth = 4 + (1 - k) * 10;
        c.beginPath();
        c.arc(cx, cy, Math.max(0, k * R), 0, 6.283);
        c.stroke();
      }
      // lightning arcs
      c.shadowColor = "#fff";
      c.shadowBlur = 18;
      for (let b = 0; b < 3; b++) {
        if (Math.random() < 0.35) continue;
        let x = cx,
          y = cy;
        const a = Math.random() * 6.283;
        c.strokeStyle = `rgba(255,255,255,${0.85 * env})`;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y);
        for (let s = 0; s < 14; s++) {
          x += Math.cos(a + (Math.random() - 0.5) * 1.2) * R * 0.09;
          y += Math.sin(a + (Math.random() - 0.5) * 1.2) * R * 0.09;
          c.lineTo(x, y);
        }
        c.stroke();
      }
      c.shadowBlur = 0;
      c.globalCompositeOperation = "source-over";
      // the Omega
      const sz =
        Math.min(w, h) * (0.35 + 0.1 * Math.sin(ms / 500)) * Math.min(1, t * 3);
      c.font = `900 ${Math.round(sz)}px serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = `rgba(255,255,255,${0.16 * env})`;
      c.strokeStyle = `rgba(255,255,255,${0.7 * env})`;
      c.lineWidth = 3;
      c.fillText("Ω", cx, cy);
      c.strokeText("Ω", cx, cy);
      if (t > 0.86) {
        const k = (t - 0.86) / 0.14;
        c.fillStyle = `rgba(255,255,255,${k})`;
        c.fillRect(0, 0, w, h);
      }
      ov.classList.toggle("dark", t > 0.9);
      shakeEls(S, 14 * env);
    },
  ];

  const GLYPHS = "█▓▒░#%&?@$0123456789";

  function cinematic(rarity, tier, opts) {
    return new Promise((resolve) => {
      if (activeFx) activeFx.end(true);

      const dur = DURATIONS[tier - FIRST_CINEMATIC] || 4000;
      const name = fxName(rarity);

      const overlay = document.createElement("div");
      overlay.className = "drFx drFx-" + name;

      const canvas = document.createElement("canvas");
      overlay.appendChild(canvas);

      const title = document.createElement("div");
      title.className = "drFxTitle";
      title.textContent = rarity;

      const rollEl = document.createElement("div");
      rollEl.className = "drFxRoll";
      rollEl.textContent = opts.roll || "";

      const sub = document.createElement("div");
      sub.className = "drFxSub";
      sub.textContent = Number.isFinite(Number(opts.oneIn))
        ? "1 in " + Number(opts.oneIn).toLocaleString()
        : "";

      const hint = document.createElement("div");
      hint.className = "drFxHint";
      hint.textContent = "click to skip";

      overlay.append(title, rollEl, sub, hint);
      document.body.appendChild(overlay);

      let done = false;
      let raf = 0;
      let showTimer = 0;
      const S = {
        shake: [
          document.querySelector(".rollCard"),
          document.getElementById("number"),
        ].filter(Boolean),
      };

      function end(skipped) {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        clearTimeout(showTimer);
        document.removeEventListener("keydown", onKey);
        shakeEls(S, 0);
        overlay.classList.add("out");
        overlay.style.opacity = "";
        overlay.style.filter = "";
        setTimeout(() => overlay.remove(), 380);
        if (activeFx && activeFx.overlay === overlay) activeFx = null;
        resolve();
      }

      const onKey = (e) => {
        if (e.key === "Escape" || e.key === " " || e.key === "Enter") end(true);
      };

      overlay.addEventListener("click", () => end(true));
      document.addEventListener("keydown", onKey);
      activeFx = { end, overlay };

      /* reduced motion: just a calm title card */
      if (reduced()) {
        overlay.classList.add("reduced");
        canvas.remove();
        requestAnimationFrame(() => overlay.classList.add("show"));
        setTimeout(() => end(false), 1800);
        return;
      }

      const dpr = Math.min(1.5, G.devicePixelRatio || 1);
      const w = G.innerWidth;
      const h = G.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const draw = DRAWERS[tier - FIRST_CINEMATIC];
      const start = performance.now();
      showTimer = setTimeout(() => overlay.classList.add("show"), dur * 0.18);
      let lastScramble = 0;

      function frame(now) {
        if (done) return;
        const ms = now - start;
        const t = Math.min(1, ms / dur);
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h, t, ms, envelope(t), S, overlay);

        if (rarity === "???" && now - lastScramble > 60) {
          lastScramble = now;
          if (t < 0.55) {
            let s = "";
            for (let i = 0; i < 3; i++)
              s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            title.textContent = s;
          } else {
            title.textContent = Math.random() < 0.12 ? "█▒░" : "???";
          }
        }

        if (t >= 1) end(false);
        else raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- public entry point ---------- */

  G.drPlayRarityEffect = function (rarity, opts) {
    opts = opts || {};
    const tier = tierOf(rarity);
    const mode = opts.force ? "full" : fxMode();

    if (mode === "off") return Promise.resolve();
    if (mode === "simple" || tier < FIRST_MID)
      return simpleEffect(rarity, tier);
    if (tier < FIRST_CINEMATIC) return midEffect(rarity, tier);
    return cinematic(rarity, tier, opts);
  };

  /* FX quality switch in the bottom-left nav */
  function setFxMode(mode) {
    try {
      localStorage.setItem("digitRollFX", mode);
    } catch (e) {}
    refreshFxButton();
  }

  function refreshFxButton() {
    const b = document.getElementById("drFxButton");
    if (!b) return;
    const m = fxMode();
    b.textContent =
      m === "full"
        ? "🎬 FX: Full"
        : m === "simple"
          ? "🎬 FX: Simple"
          : "🎬 FX: Off";
  }

  /* ==========================================================
     3. ADMIN PANEL
     ----------------------------------------------------------
     Two ways in:
       • "Verified admin": your account has a row in the Supabase
         `admins` table (see admin-setup.sql). Unlocks the GLOBAL tools.
       • "Local dev mode": open the page with #dev on the end of the
         address (or run drDev(true) in the console). Unlocks the LOCAL
         tools only. They change nothing on the server.
     Forced / admin rolls are never uploaded or added to history.
     ========================================================== */

  const ADMIN_SQL = `-- Run once in the Supabase SQL editor.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

drop policy if exists "admins delete rolls" on public.rolls;
create policy "admins delete rolls" on public.rolls
  for delete using (public.is_admin());

-- Make yourself an admin (replace the id with yours from Authentication > Users):
-- insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000000');`;

  const A = { isAdmin: false, checkedFor: null, rolls: [] };

  const isDev = () => {
    try {
      return localStorage.getItem("digitRollDev") === "1";
    } catch (e) {
      return false;
    }
  };

  G.drDev = function (on) {
    try {
      if (on === false) localStorage.removeItem("digitRollDev");
      else localStorage.setItem("digitRollDev", "1");
    } catch (e) {}
    refreshNav();
    return isDev() ? "Local dev mode ON" : "Local dev mode OFF";
  };

  if (/(^|[#&?])dev($|[&=])/.test(G.location.hash + G.location.search))
    G.drDev(true);

  const OWNER_EMAIL = "elicole613@gmail.com";

  async function checkAdmin() {
    if (typeof currentUser === "undefined" || !currentUser) {
      A.isAdmin = false;
      A.checkedFor = null;
      refreshNav();
      return;
    }
    if (A.checkedFor === currentUser.id) return;
    A.checkedFor = currentUser.id;
    if (String(currentUser.email || "").toLowerCase() === OWNER_EMAIL) {
      A.isAdmin = true;
      refreshNav();
      return;
    }
    try {
      const { data, error } = await supabaseClient
        .from("admins")
        .select("user_id")
        .eq("user_id", currentUser.id)
        .maybeSingle();
      A.isAdmin = !error && !!data;
    } catch (e) {
      A.isAdmin = false;
    }
    refreshNav();
  }

  G.drOnAuthChange = function () {
    checkAdmin();
  };

  /* ---------- nav buttons ---------- */

  function ensureNavButtons() {
    const nav = document.getElementById("digitRollNav");
    if (!nav) return false;

    if (!document.getElementById("drFxButton")) {
      const b = document.createElement("button");
      b.id = "drFxButton";
      b.className = "drNavBtn";
      b.type = "button";
      b.title = "Cycle rarity effects: Full / Simple / Off";
      b.onclick = () => {
        const next =
          { full: "simple", simple: "off", off: "full" }[fxMode()] || "full";
        setFxMode(next);
        toast("🎬 Effects: " + next);
      };
      nav.appendChild(b);
      refreshFxButton();
    }

    if (!document.getElementById("drAdminButton")) {
      const b = document.createElement("button");
      b.id = "drAdminButton";
      b.className = "drNavBtn drAdminBtn";
      b.type = "button";
      b.textContent = "🛠️ Admin";
      b.style.display = "none";
      b.onclick = openAdmin;
      nav.appendChild(b);
    }
    return true;
  }

  G.drIsAdmin = () => A.isAdmin || isDev();

  function refreshNav() {
    if (!ensureNavButtons()) return;
    const b = document.getElementById("drAdminButton");
    if (b) b.style.display = A.isAdmin || isDev() ? "" : "none";
    if (!(A.isAdmin || isDev())) closeAdmin();
  }

  /* ---------- panel shell ---------- */

  function ensureAdminOverlay() {
    let o = document.getElementById("drAdminOverlay");
    if (o) return o;
    o = document.createElement("div");
    o.id = "drAdminOverlay";
    o.className = "drAdminOverlay";
    o.addEventListener("mousedown", (e) => {
      if (e.target === o) closeAdmin();
    });
    o.addEventListener("click", onAdminClick);
    document.body.appendChild(o);
    return o;
  }

  function openAdmin() {
    if (!(A.isAdmin || isDev())) return;
    const o = ensureAdminOverlay();
    renderAdmin();
    o.classList.add("open");
  }

  function closeAdmin() {
    const o = document.getElementById("drAdminOverlay");
    if (o) o.classList.remove("open");
  }

  G.openDigitRollAdmin = openAdmin;

  const esc = (v) =>
    typeof escapeHTML === "function" ? escapeHTML(v) : String(v);
  const q = (id) => document.getElementById(id);

  function setStatus(id, text, isErr) {
    const el = q(id);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("err", !!isErr);
  }

  const PRESETS = [
    ["7777777777", "7s"],
    ["1234567890", "Digit loop"],
    ["4815162342", "The Numbers"],
    ["3141592653", "Pi"],
    ["0000000000", "All zeros"],
    ["1000000000", "One billion"],
    ["__________", "Void*"],
    ["12_45_78_0", "Gaps"],
  ];

  function renderAdmin() {
    const o = ensureAdminOverlay();
    const catalogSize = Object.keys(staticBadgeCatalog).length;
    const unlocked = getUnlockedBadgeNames().size;

    const rarityChips = TIERS.map(
      (r) =>
        `<button class="drChip ${rarityClass(r)}" data-act="preview" data-r="${esc(r)}" type="button">${esc(r)}</button>`,
    ).join("");

    const presetChips = PRESETS.map(
      ([v, l]) =>
        `<button class="drChip" data-act="preset" data-v="${esc(v)}" type="button">${esc(l)}</button>`,
    ).join("");

    const verified = A.isAdmin;

    o.innerHTML = `
    <div class="drAdminPage" role="dialog" aria-modal="true">
      <div class="drAdminHead">
        <div>
          <div class="drAdminTitle">🛠️ Admin Panel</div>
          <span class="drAdminTag ${verified ? "ok" : ""}">${verified ? "Verified admin" : "Local dev mode"}</span>
        </div>
        <button class="drAdminClose" data-act="close" type="button" aria-label="Close">×</button>
      </div>

      <div class="drAdminGrid">

        <div class="drAdminCard">
          <h3>🎯 Roll Controls</h3>
          <p>Force the next roll. Use <b>_</b> for a blank. Forced rolls give no XP and are never saved or uploaded.</p>
          <div class="drRow">
            <input id="drForceInput" maxlength="10" placeholder="10 characters, e.g. 77777_7777" />
            <button class="drBtn" data-act="force" type="button">Set next roll</button>
          </div>
          <div class="drChips" style="margin-bottom:10px">${presetChips}</div>
          <div class="drRow">
            <select id="drSpeed">
              <option value="1">Roll speed: 1× (normal)</option>
              <option value="3">Roll speed: 3×</option>
              <option value="10">Roll speed: 10×</option>
            </select>
          </div>
          <div class="drStatus" id="drForceStatus"></div>
        </div>

        <div class="drAdminCard">
          <h3>🎬 Effects Lab</h3>
          <p>Preview any rarity animation without rolling. Click an overlay (or press Esc) to skip it.</p>
          <div class="drChips">${rarityChips}</div>
        </div>

        <div class="drAdminCard">
          <h3>💰 Economy (this browser only)</h3>
          <p>Balance: <b>${getXPBalance().toLocaleString()} XP</b> · Luck level: <b>${shopLuckLevel}</b></p>
          <div class="drRow">
            <input id="drXpInput" type="number" placeholder="XP amount" value="10000" />
            <button class="drBtn" data-act="addxp" type="button">Add XP</button>
          </div>
          <div class="drRow">
            <select id="drLuck">
              ${Array.from({ length: 11 }, (_, i) => `<option value="${i}" ${i === shopLuckLevel ? "selected" : ""}>Luck level ${i}</option>`).join("")}
            </select>
            <button class="drBtn" data-act="setluck" type="button">Set luck</button>
          </div>
          <div class="drStatus" id="drEconStatus"></div>
        </div>

        <div class="drAdminCard">
          <h3>🏅 Badges (this browser only)</h3>
          <p>Unlocked <b>${unlocked}</b> of <b>${catalogSize}</b> badges in the catalog.</p>
          <div class="drRow">
            <button class="drBtn" data-act="unlockall" type="button">Unlock all</button>
            <button class="drBtn danger" data-act="lockall" type="button">Re-lock all</button>
            <button class="drBtn" data-act="catalog" type="button">Download catalog</button>
          </div>
          <div class="drStatus" id="drBadgeStatus"></div>
        </div>

        <div class="drAdminCard wide">
          <h3>📊 Odds Simulator</h3>
          <p>Runs rolls in memory (nothing is saved) to show how often each rarity and badge really turns up.</p>
          <div class="drRow">
            <select id="drSimCount">
              <option value="1000">1,000 rolls</option>
              <option value="10000" selected>10,000 rolls</option>
              <option value="50000">50,000 rolls</option>
            </select>
            <button class="drBtn" data-act="sim" type="button">Run simulation</button>
          </div>
          <div class="drStatus" id="drSimStatus"></div>
          <div id="drSimOut"></div>
        </div>

        <div class="drAdminCard">
          <h3>💾 Local Save Data</h3>
          <p>Export or restore history, XP, luck and unlocked badges for this browser.</p>
          <div class="drRow">
            <button class="drBtn" data-act="export" type="button">Export save</button>
            <button class="drBtn" data-act="import" type="button">Import save</button>
            <button class="drBtn danger" data-act="wipe" type="button">Wipe local data</button>
          </div>
          <input id="drImportFile" type="file" accept="application/json" style="display:none" />
          <div class="drStatus" id="drSaveStatus"></div>
        </div>

        <div class="drAdminCard">
          <h3>ℹ️ Session</h3>
          <p>
            User: <b>${currentUser ? esc(currentUser.email || currentUser.id) : "not logged in"}</b><br />
            User id: <code>${currentUser ? esc(currentUser.id) : "—"}</code><br />
            Server admin rights: <b>${verified ? "yes" : "no"}</b>
          </p>
          <div class="drRow">
            <button class="drBtn" data-act="copysql" type="button">Copy admin setup SQL</button>
            <button class="drBtn danger" data-act="devoff" type="button" ${isDev() ? "" : "disabled"}>Turn off dev mode</button>
          </div>
          <div class="drStatus" id="drSessionStatus"></div>
        </div>

        <div class="drAdminCard wide">
          <h3>🌎 Global Moderation</h3>
          <p>${
            verified
              ? "Recent rolls from every player. Deleting removes the row for everyone."
              : "Needs a verified admin account. Run the admin setup SQL (button above) and add your user id to the <code>admins</code> table."
          }</p>
          <div class="drRow">
            <button class="drBtn" data-act="loadrolls" type="button" ${verified ? "" : "disabled"}>Load recent rolls</button>
          </div>
          <div class="drStatus" id="drGlobalStatus"></div>
          <div id="drGlobalOut"></div>
        </div>

      </div>
    </div>`;

    q("drSpeed").value = String(G.DR_SPEED || 1);
    q("drSpeed").onchange = (e) => {
      G.DR_SPEED = Number(e.target.value) || 1;
    };

    q("drImportFile").onchange = importSave;
    if (A.rolls.length) renderGlobalRolls();
  }

  /* ---------- click handling ---------- */

  function onAdminClick(e) {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const act = t.dataset.act;

    switch (act) {
      case "close":
        return closeAdmin();

      case "preview":
        return G.drPlayRarityEffect(t.dataset.r, {
          force: true,
          oneIn: Math.pow(10, 6 + tierOf(t.dataset.r) * 2),
          roll: "1234567890",
        });

      case "preset":
        q("drForceInput").value = t.dataset.v;
        return;

      case "force":
        return forceRoll();

      case "addxp": {
        const n = Math.floor(Number(q("drXpInput").value));
        if (!Number.isFinite(n) || n === 0)
          return setStatus("drEconStatus", "Enter an XP amount.", true);
        xpBalance = Math.max(0, getXPBalance() + n);
        localStorage.setItem("digitRollXPBalance", String(xpBalance));
        updateShopUI();
        renderAdmin();
        return setStatus(
          "drEconStatus",
          (n > 0 ? "Added " : "Removed ") +
            Math.abs(n).toLocaleString() +
            " XP.",
        );
      }

      case "setluck": {
        shopLuckLevel = Math.max(
          0,
          Math.min(10, Number(q("drLuck").value) || 0),
        );
        saveShopState();
        updateShopUI();
        renderAdmin();
        return setStatus(
          "drEconStatus",
          "Luck level set to " + shopLuckLevel + ".",
        );
      }

      case "unlockall": {
        localStorage.setItem(
          "digitRollUnlockedBadges",
          JSON.stringify(Object.keys(staticBadgeCatalog)),
        );
        updateShopUI();
        renderAdmin();
        return setStatus("drBadgeStatus", "Every badge unlocked.");
      }

      case "lockall": {
        if (
          !confirm(
            "Re-lock every badge? Badges from your saved roll history will unlock again.",
          )
        )
          return;
        localStorage.setItem("digitRollUnlockedBadges", "[]");
        history = [];
        saveLocal();
        renderHistory();
        updateShopUI();
        renderAdmin();
        return setStatus("drBadgeStatus", "Badge collection reset.");
      }

      case "catalog":
        return downloadJSON(
          "digit-roll-badge-catalog.json",
          Object.values(staticBadgeCatalog).sort((a, b) => a.oneIn - b.oneIn),
        );

      case "sim":
        return runSimulation();

      case "export":
        return exportSave();

      case "import":
        return q("drImportFile").click();

      case "wipe": {
        if (
          !confirm(
            "Delete ALL local Digit Roll data in this browser (history, XP, luck, badges)?",
          )
        )
          return;
        Object.keys(localStorage)
          .filter((k) => k.startsWith("digitRoll") && k !== "digitRollDev")
          .forEach((k) => localStorage.removeItem(k));
        location.reload();
        return;
      }

      case "copysql": {
        const done = () =>
          setStatus(
            "drSessionStatus",
            "SQL copied. Paste it into the Supabase SQL editor.",
          );
        if (navigator.clipboard)
          navigator.clipboard
            .writeText(ADMIN_SQL)
            .then(done, () => fallbackCopy(ADMIN_SQL, done));
        else fallbackCopy(ADMIN_SQL, done);
        return;
      }

      case "devoff":
        G.drDev(false);
        return renderAdmin();

      case "loadrolls":
        return loadGlobalRolls();

      case "delroll":
        return deleteRoll(t.dataset.id);

      case "delplayer":
        return deletePlayerRolls(t.dataset.pid, t.dataset.name);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      setStatus(
        "drSessionStatus",
        "Could not copy. See admin-setup.sql instead.",
        true,
      );
    }
    ta.remove();
  }

  /* ---------- force next roll ---------- */

  function forceRoll() {
    const raw = q("drForceInput").value.trim();
    if (raw.length !== 10 || !/^[0-9_]{10}$/.test(raw)) {
      return setStatus(
        "drForceStatus",
        "Needs exactly 10 characters: digits 0-9 or _ for a blank.",
        true,
      );
    }
    if (/^_+$/.test(raw)) {
      return setStatus(
        "drForceStatus",
        "At least one digit has to show (the game never rolls ten blanks).",
        true,
      );
    }
    G.DR_FORCE = raw.split("");
    setStatus(
      "drForceStatus",
      "Next roll will be " + raw + ". Close this panel and press ROLL.",
    );
  }

  /* ---------- simulator ---------- */

  function runSimulation() {
    const total = Number(q("drSimCount").value) || 10000;
    const rarityCount = {};
    const badgeCount = {};
    let badgeTotal = 0;
    let best = null;
    let done = 0;

    const out = q("drSimOut");
    out.innerHTML = "";
    setStatus("drSimStatus", "Running… 0%");

    function chunk() {
      const n = Math.min(1500, total - done);
      for (let i = 0; i < n; i++) {
        const r = analyze(randomRoll());
        rarityCount[r.rarity] = (rarityCount[r.rarity] || 0) + 1;
        badgeTotal += r.badges.length;
        r.badges.forEach(
          (b) => (badgeCount[b.name] = (badgeCount[b.name] || 0) + 1),
        );
        if (!best || r.oneIn > best.oneIn) best = r;
      }
      done += n;

      if (done < total) {
        setStatus(
          "drSimStatus",
          "Running… " + Math.round((done / total) * 100) + "%",
        );
        setTimeout(chunk, 0);
        return;
      }

      setStatus(
        "drSimStatus",
        `Done. Average ${(badgeTotal / total).toFixed(2)} badges per roll. Best rarity: ${best.rarity} (${fmt(best.oneIn)}).`,
      );

      const rows = TIERS.filter((r) => rarityCount[r])
        .map((r) => {
          const pct = (rarityCount[r] / total) * 100;
          return `<tr>
            <td><span class="rarity ${rarityClass(r)}">${esc(r)}</span></td>
            <td>${rarityCount[r].toLocaleString()}</td>
            <td>${pct < 0.01 ? "<0.01" : pct.toFixed(2)}%</td>
            <td><div class="drBarWrap"><div class="drBar" style="width:${Math.max(2, Math.min(100, pct))}%"></div></div></td>
          </tr>`;
        })
        .join("");

      const topBadges = Object.entries(badgeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(
          ([n, c]) =>
            `<tr><td>${esc(n)}</td><td>${c.toLocaleString()}</td><td>${((c / total) * 100).toFixed(2)}%</td></tr>`,
        )
        .join("");

      out.innerHTML = `
        <table class="drTable"><thead><tr><th>Rarity</th><th>Rolls</th><th>Share</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        <div style="height:14px"></div>
        <table class="drTable"><thead><tr><th>Most common badges</th><th>Hits</th><th>Share</th></tr></thead><tbody>${topBadges}</tbody></table>`;
    }
    chunk();
  }

  /* ---------- save data ---------- */

  const SAVE_KEYS = [
    "digitRollHistory",
    "digitRollPersonal",
    "digitRollAll",
    "digitRollLuckLevel",
    "digitRollXPSpent",
    "digitRollXPBalance",
    "digitRollUnlockedBadges",
    "digitRollFX",
  ];

  function downloadJSON(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function exportSave() {
    const data = {};
    SAVE_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    downloadJSON("digit-roll-save.json", {
      app: "digit-roll",
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    });
    setStatus("drSaveStatus", "Save exported.");
  }

  function importSave(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (
          !parsed ||
          parsed.app !== "digit-roll" ||
          typeof parsed.data !== "object"
        ) {
          throw new Error("That file is not a Digit Roll save.");
        }
        SAVE_KEYS.forEach((k) => {
          if (typeof parsed.data[k] === "string")
            localStorage.setItem(k, parsed.data[k]);
        });
        setStatus("drSaveStatus", "Imported. Reloading…");
        setTimeout(() => location.reload(), 600);
      } catch (err) {
        setStatus(
          "drSaveStatus",
          err.message || "Could not read that file.",
          true,
        );
      }
    };
    reader.readAsText(file);
  }

  /* ---------- global moderation ---------- */

  async function loadGlobalRolls() {
    if (!A.isAdmin) return;
    setStatus("drGlobalStatus", "Loading…");
    const { data, error } = await supabaseClient
      .from("rolls")
      .select("id,roll,rarity,one_in,player_id,player_name,created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return setStatus("drGlobalStatus", error.message, true);
    A.rolls = data || [];
    setStatus("drGlobalStatus", A.rolls.length + " most recent rolls.");
    renderGlobalRolls();
  }

  function renderGlobalRolls() {
    const out = q("drGlobalOut");
    if (!out) return;
    out.innerHTML = `<table class="drTable"><thead><tr><th>Player</th><th>Roll</th><th>Rarity</th><th>When</th><th></th></tr></thead><tbody>${A.rolls
      .map(
        (r) => `<tr>
          <td>${esc(r.player_name || "Player")}</td>
          <td><code>${esc(r.roll)}</code></td>
          <td><span class="rarity ${rarityClass(r.rarity)}">${esc(r.rarity)}</span></td>
          <td>${esc(r.created_at ? new Date(r.created_at).toLocaleString() : "")}</td>
          <td style="white-space:nowrap">
            <button class="drBtn danger" data-act="delroll" data-id="${esc(r.id)}" type="button">Delete</button>
            <button class="drBtn danger" data-act="delplayer" data-pid="${esc(r.player_id)}" data-name="${esc(r.player_name || "Player")}" type="button">All from player</button>
          </td>
        </tr>`,
      )
      .join("")}</tbody></table>`;
  }

  const DENIED =
    "Nothing was deleted. The database refused it — check that the admin setup SQL ran and your user id is in the admins table.";

  async function deleteRoll(id) {
    if (!A.isAdmin || !id) return;
    if (!confirm("Delete this roll for everyone?")) return;
    const { data, error } = await supabaseClient
      .from("rolls")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) return setStatus("drGlobalStatus", error.message, true);
    if (!data || !data.length) return setStatus("drGlobalStatus", DENIED, true);
    A.rolls = A.rolls.filter((r) => String(r.id) !== String(id));
    renderGlobalRolls();
    setStatus("drGlobalStatus", "Roll deleted.");
    loadLeaderboard();
  }

  async function deletePlayerRolls(pid, name) {
    if (!A.isAdmin || !pid) return;
    if (!confirm(`Delete EVERY roll from ${name}? This cannot be undone.`))
      return;
    const { data, error } = await supabaseClient
      .from("rolls")
      .delete()
      .eq("player_id", pid)
      .select("id");
    if (error) return setStatus("drGlobalStatus", error.message, true);
    if (!data || !data.length) return setStatus("drGlobalStatus", DENIED, true);
    A.rolls = A.rolls.filter((r) => r.player_id !== pid);
    renderGlobalRolls();
    setStatus(
      "drGlobalStatus",
      `Deleted ${data.length} roll${data.length === 1 ? "" : "s"} from ${name}.`,
    );
    loadLeaderboard();
  }

  /* ---------- boot ---------- */

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAdmin();
  });

  let tries = 0;
  const boot = setInterval(() => {
    tries++;
    if (ensureNavButtons() || tries > 40) {
      clearInterval(boot);
      refreshNav();
      checkAdmin();
    }
  }, 150);
})();
