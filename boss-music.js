/* ============================================================
   DIGIT ROLL — BOSS MUSIC
   Three synthesized battle themes, one per boss. No audio files:
   everything is generated live with the Web Audio API.
   Exposes window.drBossMusic = { start(type), stop(win), toggle(), isOn() }.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const KEY = "digitRollBossMusic";
  let muted = false;
  try {
    muted = localStorage.getItem(KEY) === "off";
  } catch (e) {}

  let ctx = null;
  let master = null;
  let comp = null;
  let timer = null;
  let song = null;
  let step = 0;
  let nextTime = 0;
  let noiseBuf = null;
  let dist = null;

  const soundOk = () =>
    typeof G.drSoundEnabled === "function" ? G.drSoundEnabled() : true;
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function ensure() {
    if (ctx) return ctx;
    const AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 5;
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(comp);
    comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = i / 128 - 1;
      curve[i] = Math.tanh(x * 6);
    }
    dist.curve = curve;
    dist.oversample = "2x";
    dist.connect(master);
    return ctx;
  }

  /* ---------- instruments ---------- */

  function tone(f, t, dur, type, vol, opts) {
    opts = opts || {};
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (opts.slideTo)
      o.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.slideTo),
        t + dur,
      );
    if (opts.detune) o.detune.value = opts.detune;
    const a = opts.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (opts.lp) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(opts.lp, t);
      if (opts.lpTo)
        lp.frequency.exponentialRampToValueAtTime(opts.lpTo, t + dur);
      o.connect(lp);
      node = lp;
    }
    node.connect(g);
    g.connect(opts.dest || master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(t, dur, vol, hp, lp, dest) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = s;
    if (hp) {
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = hp;
      node.connect(f);
      node = f;
    }
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = lp;
      node.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(dest || master);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  const kick = (t, v) => {
    tone(150, t, 0.22, "sine", v || 0.9, { slideTo: 42 });
    noise(t, 0.02, 0.25, 800, null);
  };
  const snare = (t, v) => {
    noise(t, 0.16, v || 0.4, 1500, null);
    tone(190, t, 0.1, "triangle", (v || 0.4) * 0.6, { slideTo: 120 });
  };
  const hat = (t, v, open) =>
    noise(t, open ? 0.12 : 0.035, v || 0.12, 7000, null);
  const boom = (t, v) => {
    tone(55, t, 1.4, "sine", v || 0.9, { slideTo: 28 });
    noise(t, 1.0, 0.3, null, 500);
  };

  /* ==========================================================
     SONG 1 — GOLEM: slow, grinding, stone-heavy (D minor, 66 BPM)
     ========================================================== */

  const golem = {
    bpm: 66,
    play(s, t, sd) {
      const bar = Math.floor(s / 16) % 8;
      const k = s % 16;
      if (k === 0 || k === 10) kick(t, 1);
      if (k === 8 && bar % 2 === 1) boom(t, 0.5);
      if (k === 4 || k === 12) {
        if (bar >= 2) snare(t, 0.32);
      }
      if (k % 4 === 2 && bar >= 4) hat(t, 0.07);
      // grinding drone
      const root = [38, 38, 41, 38, 36, 36, 34, 33][bar]; // D, D, F, D, C, C, Bb, A
      if (k === 0) {
        tone(hz(root), t, sd * 15, "sawtooth", 0.22, {
          lp: 260,
          lpTo: 90,
          attack: 0.08,
        });
        tone(hz(root - 12), t, sd * 15, "sine", 0.4, { attack: 0.05 });
        tone(hz(root + 7), t, sd * 12, "square", 0.05, {
          lp: 400,
          attack: 0.2,
        });
      }
      // slow pentatonic lament over the top
      const mel = {
        0: 62,
        3: 65,
        6: 69,
        10: 72,
        13: 69,
      };
      if (bar >= 1 && mel[k] !== undefined) {
        const n = mel[k] + [0, 0, -2, 0, -2, -2, -4, -5][bar];
        tone(hz(n), t, sd * 3.2, "triangle", 0.16, { lp: 1800, attack: 0.02 });
        if (bar >= 5) tone(hz(n - 12), t, sd * 3, "sine", 0.1);
      }
      // stone "clanks"
      if (k === 6 && bar % 2 === 0) {
        tone(hz(75), t, 0.35, "square", 0.06, { lp: 2500, slideTo: hz(70) });
      }
    },
  };

  /* ==========================================================
     SONG 2 — TITAN: driving metal-march (E phrygian, 112 BPM)
     ========================================================== */

  const titan = {
    bpm: 112,
    play(s, t, sd) {
      const bar = Math.floor(s / 16) % 8;
      const k = s % 16;
      if (k % 4 === 0) kick(t, 0.95);
      if (k === 4 || k === 12) snare(t, 0.42);
      if (k % 2 === 0) hat(t, 0.09, k === 14);
      if (k === 15 && bar % 4 === 3) snare(t, 0.3);
      const root = [28, 28, 29, 28, 31, 31, 29, 33][bar]; // E E F E G G F A (low)
      // pumping saw bass in 16ths with accents
      if (k % 2 === 0 || k === 7 || k === 11) {
        const acc = k % 4 === 0 ? 0.3 : 0.2;
        tone(
          hz(root + (k === 7 || k === 11 ? 12 : 0)),
          t,
          sd * 1.7,
          "sawtooth",
          acc,
          { lp: 700, lpTo: 200, dest: dist },
        );
      }
      // power-chord stabs
      if (k === 0 || k === 6 || k === 10) {
        [0, 7, 12].forEach((iv) =>
          tone(hz(root + 24 + iv), t, sd * 2.6, "sawtooth", 0.07, {
            lp: 2400,
            dest: dist,
          }),
        );
      }
      // heroic-menacing lead in the second half of the loop
      const leadSeq = [
        64,
        null,
        65,
        null,
        67,
        null,
        65,
        null,
        64,
        null,
        61,
        null,
        62,
        null,
        64,
        null,
      ];
      if (bar >= 4 && leadSeq[k] != null) {
        tone(
          hz(leadSeq[k] + (bar === 7 ? 5 : 0)),
          t,
          sd * 1.9,
          "square",
          0.09,
          { lp: 3000, attack: 0.01 },
        );
        tone(hz(leadSeq[k] + 12), t, sd * 1.4, "triangle", 0.05, { detune: 7 });
      }
      // riser into the loop restart
      if (bar === 7 && k === 0) {
        noise(t, sd * 16, 0.12, 1000, null);
      }
      if (bar === 0 && k === 0) boom(t, 0.55);
    },
  };

  /* ==========================================================
     SONG 3 — REALITY BREAKER: glitchy, frantic, tritone chaos (150 BPM)
     ========================================================== */

  const reality = {
    bpm: 150,
    play(s, t, sd) {
      const bar = Math.floor(s / 16) % 8;
      const k = s % 16;
      const crazy = bar >= 4;
      if (k === 0 || k === 6 || k === 8 || (crazy && k === 14)) kick(t, 1);
      if (k === 4 || k === 12) snare(t, 0.5);
      if (k % 2 === 1 || crazy) hat(t, 0.1, k === 13);
      // offbeat bitcrushed bass (tritone wobble)
      const root = [26, 26, 32, 26, 27, 33, 26, 32][bar];
      if (k % 4 === 2 || (crazy && k % 2 === 0)) {
        const f = hz(root + (Math.random() < 0.15 ? 12 : 0));
        tone(f, t, sd * 1.5, "sawtooth", 0.24, {
          lp: 1200,
          lpTo: 150,
          dest: dist,
        });
        tone(f * 1.4142, t, sd * 1.5, "square", 0.08, { lp: 900, dest: dist });
      }
      // glitch arpeggios (random picks from a tritone/chromatic pool)
      const pool = [62, 63, 66, 68, 69, 72, 74, 75, 78];
      if (
        (k % 2 === 0 && Math.random() < (crazy ? 0.85 : 0.6)) ||
        (crazy && Math.random() < 0.25)
      ) {
        const n =
          pool[Math.floor(Math.random() * pool.length)] +
          (Math.random() < 0.1 ? 12 : 0);
        tone(
          hz(n),
          t,
          sd * (Math.random() < 0.2 ? 0.4 : 1.1),
          Math.random() < 0.5 ? "square" : "sawtooth",
          0.06,
          { lp: 4500, detune: (Math.random() - 0.5) * 60 },
        );
      }
      // random digital shrieks and sweeps
      if (Math.random() < 0.06) {
        tone(
          hz(90 + Math.floor(Math.random() * 20)),
          t,
          0.18,
          "sawtooth",
          0.05,
          { slideTo: hz(50), lp: 6000 },
        );
      }
      if (Math.random() < 0.05) noise(t, 0.08, 0.2, 3000, null);
      if (k === 0 && bar % 4 === 3) {
        // pitch-dive riser
        tone(hz(60), t, sd * 16, "sawtooth", 0.1, {
          slideTo: hz(108),
          lp: 5000,
          attack: 0.5,
        });
      }
      if (k === 0 && bar === 0) boom(t, 0.7);
      // cursed choir: a stuck diminished chord
      if (k === 0 && bar % 2 === 0) {
        [0, 3, 6, 9].forEach((iv, i) =>
          tone(hz(root + 36 + iv), t, sd * 30, "sine", 0.04, { detune: i * 9 }),
        );
      }
    },
  };

  /* ==========================================================
     SONG 4 — VAULT MIMIC: bouncy, sneaky heist theme (A minor, 124 BPM)
     ========================================================== */

  const mimic = {
    bpm: 124,
    play(s, t, sd) {
      const bar = Math.floor(s / 16) % 8;
      const k = s % 16;
      if (k % 4 === 0) kick(t, 0.85);
      if (k === 4 || k === 12) snare(t, 0.3);
      if (k % 2 === 1) hat(t, 0.07);
      const root = [33, 33, 36, 33, 31, 31, 36, 28][bar]; // A A C A G G C E (low)
      // walking bass
      const walk = [
        0,
        null,
        0,
        7,
        null,
        5,
        null,
        3,
        0,
        null,
        7,
        null,
        5,
        3,
        null,
        0,
      ];
      if (walk[k] != null)
        tone(hz(root + walk[k]), t, sd * 1.8, "triangle", 0.3, { lp: 900 });
      // coin pings: tiny bright arpeggio
      const ping = [
        76,
        null,
        81,
        null,
        84,
        null,
        88,
        null,
        84,
        null,
        81,
        null,
        79,
        null,
        76,
        null,
      ];
      if (bar >= 2 && ping[k] != null) {
        tone(hz(ping[k]), t, sd * 1.2, "square", 0.05, { lp: 5000 });
        tone(hz(ping[k] + 12), t, sd * 0.8, "sine", 0.04);
      }
      // sneaky staccato chords
      if ((k === 2 || k === 6 || k === 10) && bar % 2 === 0) {
        [0, 3, 7].forEach((iv) =>
          tone(hz(root + 24 + iv), t, sd * 0.9, "sawtooth", 0.05, { lp: 2200 }),
        );
      }
      // chomp!
      if (k === 0 && bar === 7) boom(t, 0.5);
    },
  };

  /* ==========================================================
     SONG 5 — CHRONO WRAITH: eerie clockwork (D minor, 92 BPM)
     ========================================================== */

  const wraith = {
    bpm: 92,
    play(s, t, sd) {
      const bar = Math.floor(s / 16) % 8;
      const k = s % 16;
      // clock tick-tock hats
      if (k % 4 === 0)
        tone(k % 8 === 0 ? 1800 : 1300, t, 0.04, "square", 0.09, { lp: 4000 });
      if (k === 0) kick(t, 0.8);
      if (k === 8 && bar >= 2) kick(t, 0.6);
      if (k === 12 && bar >= 4) snare(t, 0.25);
      const root = [38, 36, 34, 33, 38, 41, 40, 33][bar];
      // slow detuned pad
      if (k === 0) {
        [0, 3, 7, 10].forEach((iv, i) =>
          tone(hz(root + 12 + iv), t, sd * 15, "sawtooth", 0.045, {
            lp: 900,
            attack: 0.5,
            detune: (i - 1.5) * 8,
          }),
        );
        tone(hz(root - 12), t, sd * 15, "sine", 0.35, { attack: 0.1 });
      }
      // bell melody that stutters and rewinds
      const bell = [
        74,
        null,
        null,
        77,
        null,
        79,
        null,
        null,
        77,
        null,
        74,
        null,
        72,
        null,
        null,
        null,
      ];
      if (bar >= 1 && bell[k] != null) {
        const n = bell[k] + (bar % 4 === 3 ? -5 : 0);
        tone(hz(n), t, sd * 4, "sine", 0.16, { attack: 0.003 });
        tone(hz(n * 1.5 > 130 ? n + 19 : n), t, sd * 2.5, "triangle", 0.05);
        if (bar >= 5) tone(hz(n), t + sd * 1.5, sd * 3, "sine", 0.06); // echo
      }
      // reversed-swell effect
      if (k === 12 && bar % 2 === 1) noise(t, sd * 4, 0.1, 2000, null);
      if (bar === 7 && k === 0) boom(t, 0.45);
    },
  };

  const SONGS = { golem, titan, reality, mimic, wraith };

  /* ---------- scheduler ---------- */

  function tick() {
    if (!ctx || !song) return;
    const sd = 60 / song.bpm / 4; // seconds per 16th
    while (nextTime < ctx.currentTime + 0.35) {
      try {
        song.play(step, nextTime, sd);
      } catch (e) {}
      step++;
      nextTime += sd;
    }
  }

  function applyVolume(on) {
    if (!master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(on ? 0.5 : 0, t, on ? 0.4 : 0.15);
  }

  function resumeOnGesture() {
    const f = () => {
      if (ctx && ctx.state === "suspended") ctx.resume();
    };
    ["pointerdown", "keydown", "touchstart"].forEach((e) =>
      document.addEventListener(e, f, { passive: true }),
    );
  }
  resumeOnGesture();

  function start(type) {
    stopNow();
    song = SONGS[type];
    if (!song) return;
    if (!ensure()) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) {}
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    applyVolume(!muted && soundOk());
    timer = setInterval(tick, 80);
    tick();
  }

  function stopNow() {
    if (timer) clearInterval(timer);
    timer = null;
    song = null;
  }

  function stop(win) {
    if (!ctx) return stopNow();
    if (timer) {
      stopNow();
      if (!muted && soundOk()) {
        const t = ctx.currentTime + 0.05;
        if (win) {
          // victory fanfare
          [60, 64, 67, 72, 76, 79].forEach((n, i) => {
            tone(hz(n), t + i * 0.12, 1.1, "triangle", 0.18, { attack: 0.01 });
            tone(hz(n + 12), t + i * 0.12, 0.9, "square", 0.05, { lp: 3000 });
          });
          tone(hz(48), t, 2, "sawtooth", 0.15, { lp: 600 });
        } else {
          // fading, defeated drone
          tone(hz(40), t, 2.2, "sawtooth", 0.2, {
            lp: 300,
            lpTo: 60,
            slideTo: hz(33),
          });
        }
      }
    }
  }

  function setMuted(m) {
    muted = !!m;
    try {
      localStorage.setItem(KEY, muted ? "off" : "on");
    } catch (e) {}
    if (ctx && song) applyVolume(!muted && soundOk());
  }

  /* one-shot effects for the cutscene and arena */
  function sfx(name) {
    if (muted || !soundOk()) return;
    if (!ensure()) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      applyVolume(true);
    } catch (e) {}
    const t = ctx.currentTime + 0.01;
    if (name === "thud") {
      boom(t, 0.9);
    } else if (name === "zap") {
      noise(t, 0.35, 0.5, 1500, null);
      tone(2200, t, 0.3, "sawtooth", 0.15, { slideTo: 90, lp: 6000 });
      boom(t + 0.05, 0.6);
    } else if (name === "glitch") {
      for (let i = 0; i < 8; i++)
        tone(200 + Math.random() * 3000, t + i * 0.035, 0.05, "square", 0.1);
      noise(t, 0.3, 0.3, 2000, null);
    } else if (name === "curse") {
      tone(hz(45), t, 0.7, "sawtooth", 0.3, { slideTo: hz(33), lp: 500 });
      tone(hz(63), t, 0.5, "square", 0.08, { slideTo: hz(56) });
    } else if (name === "roar") {
      noise(t, 1.1, 0.4, null, 900);
      tone(hz(36), t, 1.1, "sawtooth", 0.3, { slideTo: hz(30), lp: 400 });
    } else if (name === "warn") {
      for (let i = 0; i < 4; i++)
        tone(hz(i % 2 ? 69 : 76), t + i * 0.28, 0.24, "square", 0.12, {
          lp: 2500,
        });
    }
  }

  G.drBossMusic = {
    sfx,
    start,
    stop,
    toggle() {
      setMuted(!muted);
      return !muted;
    },
    isOn: () => !muted,
    playing: () => !!song,
    _ctx: () => ctx,
  };
})();
