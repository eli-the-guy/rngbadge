/* ============================================================
   DIGIT ROLL — CALM / MYSTICAL AMBIENT MUSIC
   A slow generative soundscape (drifting pads, a deep drone and soft bell notes through a big
   reverb) that plays only while nothing crazy is going on: it fades out for bosses, live
   events, duels and cinematics and fades back in afterwards. Everything is synthesised.
   Respects the 🔊 Sound toggle and has its own 🎵 Ambient toggle. Load after sound.js.
   ============================================================ */
(function () {
  "use strict";
  const G = window;
  const KEY = "digitRollAmbient";
  let wanted = true;
  try {
    wanted = localStorage.getItem(KEY) !== "off";
  } catch (e) {}

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const CHORDS = [
    [50, 57, 60, 64, 65], // Dm9
    [46, 53, 57, 60, 62], // Bb maj7
    [43, 50, 55, 58, 62], // Gm
    [45, 52, 57, 60, 64], // Am7
  ];
  const BELLS = [74, 76, 77, 79, 81, 84, 86];

  let ctx = null;
  let master = null;
  let wet = null;
  let analyser = null;
  let level = 0; // current target 0..1
  let chordIdx = -1;
  let nextChord = 0;
  let nextBell = 0;
  let nextWhoosh = 0;
  let drone = null;
  let timer = 0;

  const soundOk = () => (typeof G.drSoundEnabled === "function" ? G.drSoundEnabled() : true);

  /* anything loud or dramatic going on? */
  function calm() {
    try {
      if (!wanted || !soundOk() || document.hidden) return false;
      if (G.drBoss && G.drBoss.ev) return false;
      if (G.drBossMusic && G.drBossMusic.playing && G.drBossMusic.playing()) return false;
      if (G.drEventsDebug && G.drEventsDebug.kinds().length) return false;
      if (document.getElementById("duelArena")) return false;
      if (document.querySelector(".drBsStage, .drBsHud, .rvIntro, .drCine")) return false;
    } catch (e) {}
    return true;
  }

  function build() {
    if (ctx) return ctx;
    const AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 3;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    master.connect(comp);
    comp.connect(analyser);
    comp.connect(ctx.destination);
    /* reverb: 4 second decaying stereo noise */
    const len = Math.floor(ctx.sampleRate * 4);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    wet = ctx.createGain();
    wet.gain.value = 0.85;
    wet.connect(conv);
    conv.connect(master);
    return ctx;
  }

  /* a soft sustained chord voice: two detuned triangles through a low-pass */
  function padVoice(m, t0, dur, vol) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 700 + rnd(0, 500);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    f.connect(g);
    g.connect(master);
    g.connect(wet);
    [-7, 6].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = hz(m);
      o.detune.value = det + rnd(-3, 3);
      o.connect(f);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
    });
  }

  /* a glassy bell / chime note */
  function bell(m, t0, vol) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 5);
    g.connect(master);
    g.connect(wet);
    [[1, 1], [2.01, 0.3], [3.98, 0.12]].forEach(([mul, a]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "sine";
      o.frequency.value = hz(m) * mul;
      og.gain.value = a;
      o.connect(og);
      og.connect(g);
      o.start(t0);
      o.stop(t0 + 5.2);
    });
  }

  function startDrone() {
    if (drone) return;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o2.type = "sine";
    o.frequency.value = hz(38); // D2
    o2.frequency.value = hz(45) * 1.002; // a fifth above, slightly detuned
    g.gain.value = 0.05;
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.07;
    lg.gain.value = 0.025;
    lfo.connect(lg);
    lg.connect(g.gain);
    o.connect(g);
    o2.connect(g);
    g.connect(master);
    [o, o2, lfo].forEach((x) => x.start());
    drone = [o, o2, lfo];
  }
  function stopDrone() {
    if (!drone) return;
    drone.forEach((x) => {
      try {
        x.stop();
      } catch (e) {}
    });
    drone = null;
  }

  /* gentle wind: a filtered noise swell */
  function whoosh(t0) {
    const len = ctx.sampleRate * 4;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource();
    s.buffer = b;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(400, t0);
    f.frequency.linearRampToValueAtTime(1400, t0 + 3.5);
    f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.018, t0 + 1.8);
    g.gain.linearRampToValueAtTime(0.0001, t0 + 4);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    g.connect(wet);
    s.start(t0);
  }

  /* schedule ahead a few seconds so playback never stutters */
  function schedule() {
    const now = ctx.currentTime;
    const ahead = now + 3;
    while (nextChord < ahead) {
      let i;
      do i = Math.floor(Math.random() * CHORDS.length);
      while (i === chordIdx);
      chordIdx = i;
      const t0 = Math.max(nextChord, now);
      const dur = rnd(13, 17);
      CHORDS[i].forEach((m, k) => padVoice(m, t0 + k * 0.4, dur, k === 0 ? 0.028 : 0.016));
      nextChord = t0 + dur * 0.72;
    }
    while (nextBell < ahead) {
      const t0 = Math.max(nextBell, now);
      bell(pick(BELLS), t0, rnd(0.03, 0.06));
      if (Math.random() < 0.3) bell(pick(BELLS), t0 + rnd(0.25, 0.6), rnd(0.02, 0.04));
      nextBell = t0 + rnd(2.2, 6.5);
    }
    if (nextWhoosh < now && Math.random() < 0.02) {
      whoosh(now + 0.1);
      nextWhoosh = now + rnd(25, 50);
    }
  }

  function tick() {
    const want = calm();
    if (want && !ctx) {
      if (!build()) return;
    }
    if (!ctx) return;
    if (want) {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      if (ctx.state !== "running") return; // waiting for the first click/tap
      if (level === 0) {
        nextChord = ctx.currentTime;
        nextBell = ctx.currentTime + 1.5;
        startDrone();
      }
      level = 1;
      schedule();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 1.6);
    } else if (level === 1) {
      level = 0;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.7); // quick, soft fade-out
      setTimeout(() => {
        if (level === 0) {
          stopDrone();
          try {
            ctx.suspend();
          } catch (e) {}
        }
      }, 4500);
    }
  }
  timer = setInterval(tick, 700);

  /* browsers need a click/tap/key before audio may play */
  const unlock = () => {
    if (calm() && build() && ctx.state === "suspended") ctx.resume().catch(() => {});
  };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => G.addEventListener(ev, unlock, { passive: true }));

  /* toggle button next to Sound / Duel */
  const label = () => (wanted ? "🎵 Ambient: On" : "🎵 Ambient: Off");
  let tries = 0;
  const navBoot = setInterval(() => {
    tries++;
    const nav = document.getElementById("digitRollNav");
    if (nav && !document.getElementById("ambNavBtn")) {
      const b = document.createElement("button");
      b.id = "ambNavBtn";
      b.className = "drNavBtn";
      b.type = "button";
      b.textContent = label();
      b.onclick = () => {
        wanted = !wanted;
        try {
          localStorage.setItem(KEY, wanted ? "on" : "off");
        } catch (e) {}
        b.textContent = label();
        unlock();
        tick();
      };
      nav.appendChild(b);
    }
    if (document.getElementById("ambNavBtn") || tries > 40) clearInterval(navBoot);
  }, 250);

  G.drAmbient = { calm, isPlaying: () => level === 1 && !!ctx && ctx.state === "running", rms: () => {
    if (!analyser) return 0;
    const a = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(a);
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.pow((a[i] - 128) / 128, 2);
    return Math.sqrt(s / a.length);
  } };
})();
