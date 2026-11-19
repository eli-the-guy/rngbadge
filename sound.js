/* ============================================================
   DIGIT ROLL — SOUND EFFECTS
   All sounds are synthesised with the Web Audio API, so there
   are no audio files. Load after shop.js and shop-ui.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const KEY = "digitRollSound";

  const TIERS = [
    "NOVICE", "PLAIN", "BASIC", "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY",
    "MYTHIC", "DIVINE", "TRANSCENDENT", "CELESTIAL", "ASCENDED", "OMNIPOTENT",
    "INFINITE", "BEYOND", "ABSOLUTE", "???",
  ];

  /* ---------- settings ---------- */

  let enabled = true;
  try {
    enabled = localStorage.getItem(KEY) !== "off";
  } catch (e) {}

  /* ---------- audio context ---------- */

  let ctx = null;
  let master = null;
  let noiseBuf = null;

  function audio() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch (e) {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);

      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  /* ---------- building blocks ---------- */

  /* A pitched note. slideTo glides the pitch. */
  function tone(freq, dur, opts) {
    const c = audio();
    if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + dur);
    if (opts.detune) o.detune.value = opts.detune;

    const vol = opts.vol == null ? 0.25 : opts.vol;
    const attack = opts.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  /* Filtered noise burst (whooshes, static, crashes). */
  function noise(dur, opts) {
    const c = audio();
    if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;

    const f = c.createBiquadFilter();
    f.type = opts.filter || "bandpass";
    f.frequency.setValueAtTime(opts.from || 800, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + dur);
    f.Q.value = opts.q || 1;

    const g = c.createGain();
    const vol = opts.vol == null ? 0.2 : opts.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (opts.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* Rising run of notes through a scale */
  function arp(root, steps, gap, opts) {
    opts = opts || {};
    const scale = opts.scale || [0, 4, 7, 12, 16, 19, 24, 28];
    for (let i = 0; i < steps; i++) {
      tone(midi(root + scale[i % scale.length] + 12 * Math.floor(i / scale.length)), opts.dur || 0.35, {
        type: opts.type || "triangle",
        vol: opts.vol == null ? 0.2 : opts.vol,
        delay: i * gap,
      });
    }
  }

  /* ==========================================================
     RARITY RESULT SOUNDS
     Simple below TRANSCENDENT, big and layered from there up.
     ========================================================== */

  function rarityIndex(r) {
    const i = TIERS.indexOf(String(r || "").toUpperCase());
    return i < 0 ? 3 : i;
  }

  function rarityJingle(rarity) {
    const t = rarityIndex(rarity);

    /* --- simple: one or a few notes --- */
    if (t < 4) {
      tone(midi(60 + t * 2), 0.25, { type: "triangle", vol: 0.16 });
      return;
    }
    if (t < 7) {
      arp(62 + t, t - 1, 0.09, { dur: 0.3, vol: 0.18 });
      return;
    }
    if (t < 10) {
      arp(60 + t, t - 2, 0.085, { dur: 0.4, vol: 0.2 });
      tone(midi(48 + t), 0.9, { type: "sine", vol: 0.18, delay: 0.1 });
      noise(0.5, { from: 3000, to: 9000, vol: 0.05, filter: "highpass" });
      return;
    }

    /* --- cinematic: TRANSCENDENT and above --- */
    const k = t - 10; // 0 for TRANSCENDENT .. 7 for ???
    const len = 2.4 + k * 0.35;

    // sub boom
    tone(70, 1.6, { type: "sine", slideTo: 28, vol: 0.55 });
    noise(0.9, { from: 1400, to: 90, vol: 0.3, filter: "lowpass", q: 0.7 });

    // rising whoosh into the hit
    noise(1.0, { from: 200, to: 5000, vol: 0.14, attack: 0.9, q: 2, delay: 0 });

    // shimmering chord that grows with the tier
    const chord = [0, 7, 12, 16, 19, 24, 28, 31];
    const voices = Math.min(chord.length, 3 + k);
    for (let i = 0; i < voices; i++) {
      tone(midi(48 + chord[i]), len, { type: "sine", vol: 0.12, attack: 0.5, delay: 0.9 });
      tone(midi(48 + chord[i]) * 1.004, len, { type: "triangle", vol: 0.06, attack: 0.6, delay: 0.9 });
    }

    // sparkle run
    arp(72, 8 + k * 2, 0.07, { dur: 0.5, vol: 0.1, type: "sine" });
    for (let i = 0; i < 6 + k; i++) {
      tone(2000 + Math.random() * 3500, 0.25, { vol: 0.04, delay: 1 + i * 0.18 });
    }

    // the last tiers get a darker, stranger layer
    if (k >= 4) {
      tone(55, len, { type: "sawtooth", vol: 0.07, attack: 0.8, delay: 0.5 });
      tone(55 * 1.5, len, { type: "sawtooth", vol: 0.05, attack: 0.8, delay: 0.5 });
    }

    // ??? : glitchy static bursts
    if (k >= 7) {
      for (let i = 0; i < 14; i++) {
        noise(0.06, { from: 400 + Math.random() * 4000, vol: 0.18, q: 6, delay: 0.2 + i * 0.13 });
        tone(100 + Math.random() * 1500, 0.07, { type: "square", vol: 0.08, delay: 0.2 + i * 0.13 });
      }
    }
  }

  /* ==========================================================
     PUBLIC SOUND LIST
     ========================================================== */

  const SOUNDS = {
    click: () => tone(1100, 0.04, { type: "square", vol: 0.06 }),

    open: () => {
      tone(440, 0.09, { type: "triangle", vol: 0.12 });
      tone(660, 0.12, { type: "triangle", vol: 0.12, delay: 0.06 });
    },

    close: () => {
      tone(660, 0.08, { type: "triangle", vol: 0.1 });
      tone(440, 0.12, { type: "triangle", vol: 0.1, delay: 0.06 });
    },

    roll: () => {
      noise(0.5, { from: 300, to: 3500, vol: 0.12, q: 1.5 });
      tone(180, 0.4, { type: "triangle", slideTo: 520, vol: 0.12 });
    },

    tick: () => tone(700 + Math.random() * 500, 0.025, { type: "square", vol: 0.025 }),

    lock: (i) => {
      const step = Number(i) || 0;
      tone(midi(64 + (step % 8) * 2), 0.18, { type: "triangle", vol: 0.2 });
      tone(midi(76 + (step % 8) * 2), 0.1, { type: "sine", vol: 0.1, delay: 0.03 });
    },

    skip: () => {
      noise(0.22, { from: 4000, to: 500, vol: 0.14, q: 1.2 });
      tone(900, 0.15, { type: "triangle", slideTo: 300, vol: 0.1 });
    },

    badge: () => {
      tone(midi(79), 0.18, { type: "sine", vol: 0.14 });
      tone(midi(86), 0.3, { type: "sine", vol: 0.12, delay: 0.07 });
    },

    newbadge: () => arp(72, 4, 0.09, { dur: 0.35, vol: 0.18 }),

    charm: () => {
      arp(76, 5, 0.06, { dur: 0.3, vol: 0.12, type: "sine" });
      noise(0.4, { from: 6000, to: 9000, vol: 0.04, filter: "highpass" });
    },

    buy: () => {
      tone(midi(83), 0.09, { type: "square", vol: 0.1 });
      tone(midi(88), 0.35, { type: "square", vol: 0.1, delay: 0.08 });
    },

    error: () => {
      tone(150, 0.14, { type: "sawtooth", vol: 0.12 });
      tone(120, 0.18, { type: "sawtooth", vol: 0.12, delay: 0.12 });
    },

    cap: () => {
      tone(300, 0.12, { type: "square", vol: 0.1 });
      tone(220, 0.22, { type: "square", vol: 0.1, delay: 0.1 });
    },

    rebirth: () => {
      noise(2.2, { from: 120, to: 7000, vol: 0.18, attack: 1.8, q: 2 });
      tone(60, 2.4, { type: "sawtooth", slideTo: 240, vol: 0.18, attack: 1.5 });
      arp(55, 16, 0.12, { dur: 0.6, vol: 0.14, type: "sine" });
      tone(70, 1.8, { type: "sine", slideTo: 26, vol: 0.5, delay: 2.2 });
      [0, 7, 12, 16, 19].forEach((n) => tone(midi(60 + n), 2.6, { type: "sine", vol: 0.12, attack: 0.4, delay: 2.2 }));
    },

    admin: () => {
      tone(330, 0.08, { type: "square", vol: 0.07 });
      tone(495, 0.12, { type: "square", vol: 0.07, delay: 0.07 });
    },

    rarity: (r) => rarityJingle(r),
  };

  G.drSfx = function (name, arg) {
    if (!enabled) return;
    const fn = SOUNDS[name];
    if (!fn) return;
    try {
      fn(arg);
    } catch (e) {}
  };

  G.drSoundEnabled = () => enabled;
  G.__drSounds = SOUNDS;

  /* ==========================================================
     HOOKS
     ========================================================== */

  function wrap(name, before) {
    const base = G[name];
    if (typeof base !== "function") return;
    G[name] = function () {
      try {
        before.apply(null, arguments);
      } catch (e) {}
      return base.apply(this, arguments);
    };
  }

  wrap("drBeginRoll", () => drSfx("roll"));
  wrap("drPlayRarityEffect", (rarity) => drSfx("rarity", rarity));
  wrap("drNotifyNewBadges", (badges) => {
    try {
      const known = getUnlockedBadgeNames();
      if ((badges || []).some((b) => !known.has(b.name))) drSfx("newbadge");
    } catch (e) {}
  });
  wrap("openDigitRollShop", () => drSfx("open"));
  wrap("openDigitRollBadges", () => drSfx("open"));
  wrap("closeDigitRollPages", () => drSfx("close"));
  wrap("showBadgeInfo", () => drSfx("badge"));
  wrap("drToggleAuto", () => drSfx("click"));

  /* number reveal: spin ticks and lock-in pops */
  const baseReveal = G.drRunReveal;
  if (typeof baseReveal === "function") {
    G.drRunReveal = function (finalChars) {
      let locked = 0;
      const box = $("number");
      let tickN = 0;

      const tickTimer = setInterval(() => {
        if (++tickN % 2 === 0) drSfx("tick");
      }, 65);

      const watch = setInterval(() => {
        if (!box) return;
        const n = box.querySelectorAll(".dLock").length;
        while (locked < n) drSfx("lock", locked++);
      }, 30);

      return baseReveal(finalChars).finally(() => {
        clearInterval(tickTimer);
        clearInterval(watch);
        const n = box ? box.querySelectorAll(".dLock").length : locked;
        if (locked < n) drSfx("lock", locked);
      });
    };
  }

  /* skip button */
  document.addEventListener("click", (e) => {
    const t = e.target.closest ? e.target.closest("#drSkipBtn") : null;
    if (t && !t.disabled) drSfx("skip");
  });

  /* shop purchase result sounds */
  const baseBuy = G.drBuy;
  if (typeof baseBuy === "function") {
    G.drBuy = function (kind, arg) {
      const before = getXPBalance();
      const stateBefore = JSON.stringify(G.__drShop.S);
      const r = baseBuy.apply(this, arguments);
      const changed = JSON.stringify(G.__drShop.S) !== stateBefore;

      if (kind === "rebirth") {
        if (changed) drSfx("rebirth");
        else drSfx("error");
      } else if (changed) {
        drSfx(kind === "charm" || kind === "lucky" ? "charm" : "buy");
      } else {
        drSfx("error");
      }
      return r;
    };
  }

  /* ==========================================================
     SOUND BUTTON (bottom-left nav)
     ========================================================== */

  function refreshButton() {
    const b = document.getElementById("drSoundButton");
    if (b) b.textContent = enabled ? "🔊 Sound: On" : "🔇 Sound: Off";
  }

  function setEnabled(on) {
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch (e) {}
    refreshButton();
    if (on) drSfx("click");
  }

  function ensureButton() {
    const nav = document.getElementById("digitRollNav");
    if (!nav) return false;
    if (!document.getElementById("drSoundButton")) {
      const b = document.createElement("button");
      b.id = "drSoundButton";
      b.className = "drNavBtn";
      b.type = "button";
      b.onclick = () => setEnabled(!enabled);
      nav.appendChild(b);
    }
    refreshButton();
    return true;
  }

  let tries = 0;
  const boot = setInterval(() => {
    tries++;
    if (ensureButton() || tries > 40) clearInterval(boot);
  }, 150);
})();
