/* ============================================================
   DIGIT ROLL — RANDOM EVENTS
   Twelve random events that start on their own (needs
   events-setup.sql + boss-setup.sql), event clashes, and
   random boss spawns (the Vault Mimic, the Chrono Wraith and,
   very rarely, the real Golem / Titan / Reality Breaker).
   Loaded after bonus.js.
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
  const nf = (v) => Math.round(Number(v) || 0).toLocaleString();
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (n, a) => typeof G.drSfx === "function" && G.drSfx(n, a);
  const P = G.drProgress;
  const sb = () =>
    typeof supabaseClient !== "undefined" ? supabaseClient : null;
  const isAdmin = () => typeof G.drIsAdmin === "function" && G.drIsAdmin();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const RM = () =>
    !!(
      G.matchMedia && G.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  const H = () =>
    G.drBonusHelpers || {
      gainXP: () => 0,
      giveCharm: () => false,
      giveLucky: () => false,
      givePoints: () => {},
    };
  const cap = () => (typeof G.drGetCap === "function" ? G.drGetCap() : 100000);

  /* ==========================================================
     THE TWELVE EVENTS
     ========================================================== */

  const KINDS = {
    goldrush: {
      icon: "💰",
      name: "Gold Rush",
      color: "#facc15",
      desc: "All XP ×3.",
      xp: 3,
      amb: { e: ["🪙", "💰", "✨"], dir: "down", every: 0.8 },
    },
    clover: {
      icon: "🍀",
      name: "Clover Storm",
      color: "#4ade80",
      desc: "Every roll gets +2 guaranteed badges.",
      luck: 2,
      amb: { e: ["🍀", "☘️"], dir: "up", every: 0.8 },
    },
    sale: {
      icon: "🏷️",
      name: "Mega Sale",
      color: "#fb7185",
      desc: "Number charms and lucky charms are 60% off.",
      charm: 0.4,
      amb: { e: ["🏷️", "💸"], dir: "down", every: 0.9 },
    },
    rain: {
      icon: "🌧️",
      name: "Charm Rain",
      color: "#7dd3fc",
      desc: "A free number charm lands in your shop every minute.",
      amb: {
        e: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
        dir: "down",
        every: 0.35,
      },
      minute: true,
    },
    prism: {
      icon: "🌈",
      name: "Prism Hour",
      color: "#c084fc",
      desc: "Each roll has a 12% chance to drop a free number charm.",
      roll: true,
      amb: { e: ["🌈", "💎", "✨"], dir: "up", every: 0.9 },
    },
    lunar: {
      icon: "🌙",
      name: "Lunar Glow",
      color: "#818cf8",
      desc: "All XP ×2 under a night sky.",
      xp: 2,
      amb: { e: ["⭐", "✨", "🌟"], dir: "twinkle", every: 0.5 },
    },
    magnet: {
      icon: "🧲",
      name: "XP Magnet",
      color: "#38bdf8",
      desc: "Every roll pulls in a bonus 1.5% of your XP cap.",
      roll: true,
      amb: { e: ["⚡", "🔹"], dir: "up", every: 0.8 },
    },
    meteor: {
      icon: "☄️",
      name: "Meteor Shower",
      color: "#fb923c",
      desc: "Meteors streak across the sky — click them for charms and XP!",
      pop: [9, 15],
      amb: { e: ["✨", "🔥"], dir: "down", every: 1.4 },
    },
    ghost: {
      icon: "👻",
      name: "Haunted Hour",
      color: "#a5b4fc",
      desc: "Ghosts drift by — click to banish them for XP!",
      pop: [7, 13],
      amb: { e: ["👻", "🕸️", "🎃"], dir: "up", every: 1.4 },
    },
    balloon: {
      icon: "🎈",
      name: "Balloon Festival",
      color: "#f472b6",
      desc: "Balloons float up — pop them for lucky charms and XP!",
      pop: [6, 11],
      amb: { e: ["🎈", "🎉", "🎊"], dir: "up", every: 1.1 },
    },
    jackpot: {
      icon: "🎰",
      name: "Jackpot Fever",
      color: "#fbbf24",
      desc: "Each roll has a 3% chance to hit a ×25 XP jackpot.",
      roll: true,
      amb: { e: ["🎰", "7️⃣", "🪙"], dir: "down", every: 1.2 },
    },
    wisdom: {
      icon: "🔮",
      name: "Wisdom Surge",
      color: "#e879f9",
      desc: "1% chance per roll for a prestige point, and daily challenge XP is doubled.",
      daily: 2,
      roll: true,
      amb: { e: ["🔮", "✴️", "💜"], dir: "up", every: 1 },
    },
  };
  const KIND_IDS = Object.keys(KINDS);
  const BOSS_KINDS = {
    golem: "🗿 Golem",
    mimic: "🧰 Vault Mimic",
    wraith: "🕰️ Chrono Wraith",
    titan: "🤖 Titan",
    reality: "👁️ Reality Breaker",
    drake: "🐉 Ember Drake",
    kraken: "🐙 Deep Kraken",
    hydra: "🐍 Hydra",
    voidking: "👑 Void Emperor",
    eternal: "⛓️ Eternal Warden",
    omega: "⚙️ Omega Engine",
    devourer: "🌌 Cosmic Devourer",
    author: "✒️ Final Author",
  };

  /* ==========================================================
     STATE
     ========================================================== */

  let rows = []; // active rand_events rows
  let prevIds = null;
  let tableState = "unknown";
  let history = [];
  let hist = false;
  const SEEN = "digitRollRevSeen";
  const seenIds = () => {
    try {
      return JSON.parse(localStorage.getItem(SEEN) || "[]");
    } catch (e) {
      return [];
    }
  };
  const markSeen = (id) => {
    try {
      const s = seenIds();
      s.push(id);
      localStorage.setItem(SEEN, JSON.stringify(s.slice(-40)));
    } catch (e) {}
  };

  const live = () =>
    rows.filter((r) => new Date(r.ends_at).getTime() > Date.now());
  const clashRow = () =>
    live().find((r) => r.kind === "clash" || r.kind === "bossclash");
  const isBossClash = () => live().some((r) => r.kind === "bossclash");
  function activeKinds() {
    const out = [];
    live().forEach((r) => {
      if (r.kind === "clash" || r.kind === "bossclash")
        (r.clash_of || []).forEach(
          (k) => KINDS[k] && out.indexOf(k) < 0 && out.push(k),
        );
      else if (KINDS[r.kind] && out.indexOf(r.kind) < 0) out.push(r.kind);
    });
    return out;
  }
  const inClash = () => !!clashRow();

  /* ==========================================================
     EFFECTS (wrapped into the game's event hooks)
     ========================================================== */

  function wrap(name, combine) {
    const base = G[name];
    G[name] = function () {
      const b =
        typeof base === "function" ? base.apply(this, arguments) : undefined;
      return combine(b);
    };
  }
  wrap("drEventXP", (b) => {
    let m = 1;
    activeKinds().forEach((k) => (m *= KINDS[k].xp || 1));
    if (inClash()) m *= 1.5;
    return (b == null ? 1 : b) * m;
  });
  wrap("drEventCharmDiscount", (b) => {
    let m = 1;
    activeKinds().forEach((k) => (m *= KINDS[k].charm || 1));
    return Math.max(0.2, (b == null ? 1 : b) * m);
  });
  wrap("drEventLuck", (b) => {
    let l = 0;
    activeKinds().forEach((k) => (l += KINDS[k].luck || 0));
    if (inClash() && l > 0) l += 1;
    return (b == null ? 0 : b) + l;
  });
  wrap("drEventDaily", (b) => {
    let m = 1;
    activeKinds().forEach((k) => (m *= KINDS[k].daily || 1));
    return (b == null ? 1 : b) * m;
  });

  /* boss clash: the active boss hits harder, and so do its curses */
  (function () {
    const bm = G.drBossMod;
    G.drBossMod = function (d) {
      const v = typeof bm === "function" ? bm(d) : d;
      return isBossClash() ? v * 2 : v;
    };
    G.drBossCurseMod = (loss) => (isBossClash() ? loss * 2 : loss);
  })();

  /* per-roll effects */
  function onRoll(result) {
    const kinds = activeKinds();
    if (!kinds.length) return;
    const boost = inClash() ? 1.5 : 1;
    const xp = Number(result && result.xp) || 0;
    if (kinds.indexOf("prism") >= 0 && Math.random() < 0.12 * boost) {
      const d = 1 + Math.floor(Math.random() * 9);
      if (H().giveCharm(d)) say(`🌈 Prism! A free number charm ${d} dropped.`);
    }
    if (kinds.indexOf("magnet") >= 0) {
      const g = H().gainXP(Math.max(1, Math.round(cap() * 0.015 * boost)));
      if (g > 0) say(`🧲 Magnet pulled in +${nf(g)} XP`);
    }
    if (kinds.indexOf("jackpot") >= 0 && Math.random() < 0.03 * boost) {
      const g = H().gainXP(Math.max(100, xp * 24));
      popText("🎰 JACKPOT! +" + nf(g) + " XP", "#fbbf24");
      sfx("rebirth");
    }
    if (kinds.indexOf("wisdom") >= 0 && Math.random() < 0.01 * boost) {
      H().givePoints(1);
      say("🔮 Wisdom Surge! +1 ★ prestige point.");
    }
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
  }
  if (P && P.onRoll) P.onRoll(onRoll);

  /* ==========================================================
     CSS
     ========================================================== */

  function injectCSS() {
    if ($id("rvCSS")) return;
    const st = document.createElement("style");
    st.id = "rvCSS";
    st.textContent = `
      #drRevStack{position:fixed;left:12px;top:70px;z-index:8500;display:flex;flex-direction:column;gap:6px;pointer-events:none;max-width:min(300px,70vw)}
      .rvChip{pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:14px;color:#fff;font:800 12px/1.25 system-ui,sans-serif;background:rgba(10,13,22,.92);border:1.5px solid var(--c);box-shadow:0 0 16px color-mix(in srgb,var(--c) 45%,transparent);animation:rvChipIn .5s cubic-bezier(.2,1.5,.4,1) both}
      @keyframes rvChipIn{from{transform:translateX(-120%)}}
      .rvChip .ic{font-size:20px}
      .rvChip small{display:block;color:#b9c4da;font-weight:700;font-size:11px}
      .rvChip.clash{background:linear-gradient(100deg,color-mix(in srgb,var(--c) 40%,#0a0d16),color-mix(in srgb,var(--c2) 40%,#0a0d16));animation:rvChipIn .5s both,rvClashPulse 1.1s ease-in-out infinite}
      @keyframes rvClashPulse{50%{box-shadow:0 0 28px var(--c),0 0 28px var(--c2)}}
      @media(max-width:650px){#drRevStack{top:auto;bottom:128px}}
      #drRevTint{position:fixed;inset:0;z-index:7000;pointer-events:none;transition:opacity 1.5s;opacity:0}
      #drRevTint.on{opacity:1}
      #drRevTint.prism{border:5px solid;animation:rvPrism 5s linear infinite}
      @keyframes rvPrism{0%{border-color:#f87171}17%{border-color:#fbbf24}34%{border-color:#4ade80}51%{border-color:#38bdf8}68%{border-color:#a78bfa}85%{border-color:#f472b6}100%{border-color:#f87171}}
      .rvAmb{position:fixed;z-index:7100;pointer-events:none;will-change:transform,opacity}
      .rvPop{position:fixed;left:0;top:0;z-index:9600;cursor:pointer;font-size:54px;line-height:1;padding:12px;margin:-12px 0 0 -12px;touch-action:manipulation;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 0 12px var(--c));will-change:transform}
      .rvPop:hover{filter:drop-shadow(0 0 22px #fff)}
      .rvTxt{position:fixed;z-index:9400;pointer-events:none;font:900 18px system-ui,sans-serif;color:#fff;text-shadow:0 0 10px var(--c),0 2px 2px #000;animation:rvTxt 1.4s ease-out both;white-space:nowrap}
      @keyframes rvTxt{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-70px) scale(1.2)}}
      .rvIntro{position:fixed;inset:0;z-index:10085;pointer-events:none;display:flex;align-items:center;justify-content:center;flex-direction:column;overflow:hidden;color:#fff;text-align:center}
      .rvIntro .bgf{position:absolute;inset:0;background:radial-gradient(circle,color-mix(in srgb,var(--c) 55%,transparent),transparent 65%);animation:rvFlare 3.4s ease-out both}
      @keyframes rvFlare{0%{opacity:0;transform:scale(.3)}25%{opacity:1}100%{opacity:0;transform:scale(1.6)}}
      .rvIntro .big{font-size:min(30vw,190px);line-height:1;animation:rvBig 3.4s cubic-bezier(.2,1.4,.4,1) both;filter:drop-shadow(0 0 30px var(--c))}
      @keyframes rvBig{0%{transform:scale(.1) rotate(-180deg);opacity:0}20%{transform:scale(1.15) rotate(0);opacity:1}80%{opacity:1}100%{transform:scale(1.6);opacity:0}}
      .rvIntro h2{margin:6px 0 0;font:900 clamp(26px,6vw,64px)/1 system-ui,sans-serif;color:var(--c);text-shadow:0 0 24px var(--c),0 4px 0 rgba(0,0,0,.6);animation:rvTitle 3.4s both}
      .rvIntro p{margin:8px 16px 0;font:800 clamp(13px,2.2vw,20px) system-ui,sans-serif;text-shadow:0 2px 6px #000;animation:rvTitle 3.4s .1s both}
      @keyframes rvTitle{0%{opacity:0;transform:translateY(40px) scale(.7)}15%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
      .rvIntro .half{position:absolute;top:0;bottom:0;width:50%;opacity:.85}
      .rvIntro .half.l{left:0;background:linear-gradient(90deg,var(--c),transparent);animation:rvHalfL 3.6s cubic-bezier(.2,.9,.3,1) both}
      .rvIntro .half.r{right:0;background:linear-gradient(270deg,var(--c2),transparent);animation:rvHalfR 3.6s cubic-bezier(.2,.9,.3,1) both}
      @keyframes rvHalfL{0%{transform:translateX(-100%)}30%{transform:translateX(0)}35%{transform:translateX(-4%)}100%{opacity:0;transform:translateX(0)}}
      @keyframes rvHalfR{0%{transform:translateX(100%)}30%{transform:translateX(0)}35%{transform:translateX(4%)}100%{opacity:0;transform:translateX(0)}}
      .rvIntro .vs{display:flex;gap:6vw;font-size:min(22vw,130px);animation:rvBig 3.6s both}
      .rvIntro .flash{position:absolute;inset:0;background:#fff;animation:rvWhite 3.6s both}
      @keyframes rvWhite{0%,28%{opacity:0}30%{opacity:.95}45%,100%{opacity:0}}
      .rvSurge{position:fixed;left:50%;top:26%;transform:translateX(-50%);z-index:10086;pointer-events:none;padding:12px 22px;border-radius:16px;color:#fff;font:900 clamp(16px,3vw,28px) system-ui,sans-serif;background:linear-gradient(90deg,var(--c),var(--c2));box-shadow:0 0 40px var(--c),0 0 40px var(--c2);animation:rvSurge 3s both;text-align:center}
      @keyframes rvSurge{0%{opacity:0;transform:translateX(-50%) scale(.3)}12%{opacity:1;transform:translateX(-50%) scale(1.15)}20%{transform:translateX(-50%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
      .rvGuide{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-top:10px}
      .rvBtnRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0}
      .rvBtnRow .pgBtn{margin:0}
    `;
    document.head.appendChild(st);
  }
  injectCSS();

  /* ==========================================================
     ON-SCREEN: ribbons, tint, ambient, pops
     ========================================================== */

  function fmtLeft(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function paintStack() {
    let el = $id("drRevStack");
    const lv = live();
    if (!lv.length) return void (el && el.remove());
    if (!el) {
      el = document.createElement("div");
      el.id = "drRevStack";
      document.body.appendChild(el);
    }
    const sig = lv.map((r) => r.id).join(",");
    if (el.dataset.sig !== sig) {
      el.dataset.sig = sig;
      el.innerHTML = lv
        .map((r) => {
          if (r.kind === "clash" || r.kind === "bossclash") {
            const ks = (r.clash_of || []).filter((k) => KINDS[k]);
            const a = KINDS[ks[0]] || { color: "#fff", icon: "?" };
            const b = KINDS[ks[1] || ks[0]] || a;
            const boss = r.kind === "bossclash";
            return `<div class="rvChip clash" data-id="${r.id}" style="--c:${a.color};--c2:${boss ? "#ef4444" : b.color}"><span class="ic">⚔️</span><span><b>${boss ? "BOSS CLASH" : "EVENT CLASH"}</b> ${ks.map((k) => KINDS[k].icon).join("×")}${boss ? "×💀" : ""} <span class="rvT"></span><small>${boss ? "Boss takes ×2 damage, curses drain ×2 • " : ""}${ks.map((k) => KINDS[k].name).join(" + ")}</small></span></div>`;
          }
          const k = KINDS[r.kind];
          if (!k) return "";
          return `<div class="rvChip" data-id="${r.id}" style="--c:${k.color}"><span class="ic">${k.icon}</span><span><b>${esc(k.name)}</b> <span class="rvT"></span><small>${esc(k.desc)}</small></span></div>`;
        })
        .join("");
      el.querySelectorAll(".rvChip").forEach(
        (c) => (c.onclick = () => P && P.open("live")),
      );
    }
    lv.forEach((r) => {
      const c = el.querySelector(`[data-id="${r.id}"] .rvT`);
      if (c)
        c.textContent =
          "• " + fmtLeft(new Date(r.ends_at).getTime() - Date.now());
    });
  }

  const TINTS = {
    lunar:
      "radial-gradient(ellipse at 80% 0%,rgba(129,140,248,.28),rgba(10,10,40,.38) 70%)",
    goldrush:
      "radial-gradient(ellipse at 50% 100%,rgba(250,204,21,.16),transparent 65%)",
    clover:
      "radial-gradient(ellipse at 50% 100%,rgba(74,222,128,.14),transparent 65%)",
    ghost:
      "radial-gradient(ellipse at 50% 0%,rgba(100,100,170,.28),rgba(5,5,20,.3) 80%)",
    meteor:
      "radial-gradient(ellipse at 100% 0%,rgba(251,146,60,.2),transparent 60%)",
    magnet:
      "radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(56,189,248,.14))",
    wisdom:
      "radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(232,121,249,.16))",
    jackpot:
      "radial-gradient(ellipse at 50% 0%,rgba(251,191,36,.18),transparent 60%)",
    balloon:
      "radial-gradient(ellipse at 50% 100%,rgba(244,114,182,.15),transparent 65%)",
    sale: "radial-gradient(ellipse at 50% 100%,rgba(251,113,133,.14),transparent 65%)",
    rain: "linear-gradient(180deg,rgba(56,189,248,.14),transparent 55%)",
  };

  function paintTint() {
    let el = $id("drRevTint");
    const ks = activeKinds();
    if (!ks.length) return void (el && el.classList.remove("on"));
    if (!el) {
      el = document.createElement("div");
      el.id = "drRevTint";
      document.body.appendChild(el);
    }
    const cl = clashRow();
    let bg = "";
    if (cl) {
      const a = KINDS[ks[0]].color;
      const b = isBossClash() ? "#ef4444" : KINDS[ks[1] || ks[0]].color;
      bg = `linear-gradient(115deg,color-mix(in srgb,${a} 22%,transparent),transparent 40%,transparent 60%,color-mix(in srgb,${b} 22%,transparent))`;
    } else
      bg = ks
        .map((k) => TINTS[k])
        .filter(Boolean)
        .join(",");
    el.style.background = bg || "none";
    el.classList.toggle("prism", ks.indexOf("prism") >= 0 && !cl);
    el.classList.add("on");
  }

  let ambCount = 0;
  function ambient() {
    if (document.hidden || RM() || ambCount > 22) return;
    const ks = activeKinds();
    const boost = inClash() ? 1.7 : 1;
    ks.forEach((k) => {
      const a = KINDS[k].amb;
      if (!a || Math.random() > (0.5 / a.every) * boost) return;
      ambCount++;
      const d = document.createElement("div");
      d.className = "rvAmb";
      d.textContent = pick(a.e);
      const w = G.innerWidth;
      const h = G.innerHeight;
      const sz = rnd(16, 34);
      d.style.fontSize = sz + "px";
      let keys;
      let dur = rnd(5000, 9000);
      const x = rnd(0, w - 30);
      if (a.dir === "down")
        keys = [
          { transform: `translate(${x}px,-40px) rotate(0)`, opacity: 0.9 },
          {
            transform: `translate(${x + rnd(-80, 80)}px,${h + 40}px) rotate(${rnd(-200, 200)}deg)`,
            opacity: 0.9,
          },
        ];
      else if (a.dir === "up")
        keys = [
          { transform: `translate(${x}px,${h + 40}px)`, opacity: 0.85 },
          { transform: `translate(${x + rnd(-80, 80)}px,-60px)`, opacity: 0 },
        ];
      else {
        dur = rnd(2500, 4500);
        keys = [
          {
            transform: `translate(${x}px,${rnd(0, h * 0.6)}px) scale(.4)`,
            opacity: 0,
          },
          {
            opacity: 1,
            offset: 0.5,
            transform: `translate(${x}px,${rnd(0, h * 0.6)}px) scale(1.2)`,
          },
          {
            transform: `translate(${x}px,${rnd(0, h * 0.6)}px) scale(.4)`,
            opacity: 0,
          },
        ];
      }
      document.body.appendChild(d);
      d.animate(keys, { duration: dur, easing: "linear" }).onfinish = () => {
        d.remove();
        ambCount--;
      };
    });
  }
  setInterval(ambient, 500);

  function popText(text, color, x, y) {
    const d = document.createElement("div");
    d.className = "rvTxt";
    d.style.setProperty("--c", color || "#fff");
    d.textContent = text;
    d.style.left = (x == null ? G.innerWidth / 2 : x) + "px";
    d.style.top = (y == null ? G.innerHeight * 0.35 : y) + "px";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }

  /* clickable meteors / ghosts / balloons */
  let popCount = 0;
  const nextPop = {};
  function spawnPop(kind) {
    if (popCount >= 3 || document.hidden) return;
    const k = KINDS[kind];
    popCount++;
    const el = document.createElement("div");
    el.className = "rvPop";
    el.style.setProperty("--c", k.color);
    const w = G.innerWidth;
    const h = G.innerHeight;
    let keys;
    let dur;
    el.textContent = k.icon;
    if (kind === "meteor") {
      const fromLeft = Math.random() < 0.5;
      const y0 = rnd(0, h * 0.3);
      dur = rnd(3800, 5200);
      keys = [
        {
          transform: `translate(${fromLeft ? -80 : w + 80}px,${y0}px) rotate(${fromLeft ? 0 : 90}deg)`,
        },
        {
          transform: `translate(${fromLeft ? w + 80 : -80}px,${y0 + h * 0.6}px) rotate(${fromLeft ? 0 : 90}deg)`,
        },
      ];
    } else if (kind === "ghost") {
      const x0 = rnd(w * 0.1, w * 0.9);
      dur = rnd(7000, 10000);
      keys = [];
      for (let i = 0; i <= 6; i++)
        keys.push({
          transform: `translate(${x0 + Math.sin(i * 1.7) * 140}px,${h * (0.9 - i * 0.15)}px) scale(${1 + (i % 2) * 0.15})`,
          opacity: i === 0 || i === 6 ? 0 : 0.9,
        });
    } else {
      const x0 = rnd(w * 0.05, w * 0.9);
      dur = rnd(6000, 9000);
      el.textContent = pick(["🎈", "🎈", "🎈"]);
      el.style.filter = `hue-rotate(${Math.floor(rnd(0, 360))}deg) drop-shadow(0 0 12px ${k.color})`;
      keys = [
        { transform: `translate(${x0}px,${h + 60}px)` },
        {
          transform: `translate(${x0 + rnd(-120, 120)}px,${h * 0.5}px)`,
          offset: 0.5,
        },
        { transform: `translate(${x0 + rnd(-160, 160)}px,-80px)` },
      ];
    }
    document.body.appendChild(el);
    const anim = el.animate(keys, { duration: dur, easing: "linear" });
    setTimeout(() => done(), dur + 2000); /* never leak a slot */
    const done = () => {
      if (!el.isConnected) return;
      el.remove();
      popCount--;
    };
    anim.onfinish = done;
    /* react on press, not on click: a moving target slides out from under the cursor before the button comes back up */
    el.onpointerdown = el.onclick = (e) => {
      if (el.dataset.hit) return;
      if (e && e.preventDefault) e.preventDefault();
      el.dataset.hit = 1;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      anim.cancel();
      el.remove();
      popCount--;
      claimPop(kind, x, y);
    };
  }

  function claimPop(kind, x, y) {
    const c = cap();
    const k = KINDS[kind];
    let msg = "";
    if (kind === "meteor") {
      if (Math.random() < 0.65) {
        const d = 1 + Math.floor(Math.random() * 9);
        H().giveCharm(d);
        msg = `☄️ Charm ${d}!`;
      } else msg = `☄️ +${nf(H().gainXP(Math.round(c * 0.03)))} XP`;
    } else if (kind === "ghost") {
      msg = `👻 Banished! +${nf(H().gainXP(Math.round(c * 0.02)))} XP`;
    } else {
      const r = Math.random();
      if (r < 0.03) {
        H().givePoints(1);
        msg = "🎈 +1 ★ point!";
      } else if (r < 0.5) {
        H().giveLucky(1);
        msg = "🎈 Lucky charm!";
      } else msg = `🎈 +${nf(H().gainXP(Math.round(c * 0.015)))} XP`;
    }
    popText(msg, k.color, x, y);
    sfx("newbadge");
    for (let i = 0; i < 10 && !RM(); i++) {
      const p = document.createElement("div");
      p.className = "rvAmb";
      p.textContent = k.icon;
      p.style.fontSize = "16px";
      p.style.left = x + "px";
      p.style.top = y + "px";
      document.body.appendChild(p);
      const a = rnd(0, 6.28);
      p.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          {
            transform: `translate(${Math.cos(a) * 80}px,${Math.sin(a) * 80}px)`,
            opacity: 0,
          },
        ],
        { duration: 700 },
      ).onfinish = () => p.remove();
    }
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
  }

  function popTimers() {
    const now = Date.now();
    popCount =
      document.querySelectorAll(".rvPop").length; /* self-heal the counter */
    const boost = inClash() ? 0.6 : 1;
    activeKinds().forEach((k) => {
      const c = KINDS[k];
      if (!c.pop) return;
      if (!nextPop[k]) nextPop[k] = now + rnd(2000, 5000);
      if (now >= nextPop[k]) {
        spawnPop(k);
        nextPop[k] = now + rnd(c.pop[0], c.pop[1]) * 1000 * boost;
      }
    });
  }

  /* charm rain (once per wall-clock minute) + clash surges (every 45s) */
  let lastRain = 0;
  let lastSurge = 0;
  function timers() {
    const ks = activeKinds();
    const min = Math.floor(Date.now() / 60000);
    if (ks.indexOf("rain") >= 0 && min !== lastRain) {
      const first = lastRain === 0;
      lastRain = min;
      let stored = 0;
      try {
        stored = Number(localStorage.getItem("digitRollRevRain") || 0);
      } catch (e) {}
      if (stored !== min) {
        try {
          localStorage.setItem("digitRollRevRain", String(min));
        } catch (e) {}
        const n = inClash() ? 2 : 1;
        const got = [];
        for (let i = 0; i < n; i++) {
          const d = 1 + Math.floor(Math.random() * 9);
          if (H().giveCharm(d)) got.push(d);
        }
        if (got.length && !first)
          say(`🌧️ Charm Rain: free number charm ${got.join(" & ")}!`);
        else if (got.length)
          say(`🌧️ Charm Rain: free number charm ${got.join(" & ")}!`);
        if (typeof G.updateShopUI === "function")
          try {
            G.updateShopUI();
          } catch (e) {}
      }
    }
    const slot = Math.floor(Date.now() / 45000);
    if (inClash() && slot !== lastSurge) {
      if (lastSurge) surge();
      lastSurge = slot;
    }
    if (!inClash()) lastSurge = 0;
    popTimers();
  }

  function surge() {
    const ks = activeKinds();
    const a = KINDS[ks[0]] || { color: "#fff" };
    const b = isBossClash() ? { color: "#ef4444" } : KINDS[ks[1] || ks[0]] || a;
    const roll = Math.random();
    let text;
    if (roll < 0.4) text = `💥 +${nf(H().gainXP(Math.round(cap() * 0.06)))} XP`;
    else if (roll < 0.75) {
      const ds = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 9));
      ds.forEach((d) => H().giveCharm(d));
      text = `🔢 Charms ${ds.join(", ")}`;
    } else if (roll < 0.95) {
      H().giveLucky(2);
      text = "🍀 2 Lucky Charms";
    } else {
      H().givePoints(1);
      text = "★ +1 prestige point";
    }
    const d = document.createElement("div");
    d.className = "rvSurge";
    d.style.setProperty("--c", a.color);
    d.style.setProperty("--c2", b.color);
    d.innerHTML = `⚡ CLASH SURGE ⚡<br>${esc(text)}`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3100);
    sfx("rebirth");
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
  }
  setInterval(timers, 1000);

  /* ==========================================================
     INTRO ANIMATIONS
     ========================================================== */

  function playIntro(row) {
    const el = document.createElement("div");
    el.className = "rvIntro";
    if (row.kind === "clash" || row.kind === "bossclash") {
      const ks = (row.clash_of || []).filter((k) => KINDS[k]);
      const a = KINDS[ks[0]] || KINDS.goldrush;
      const b =
        row.kind === "bossclash"
          ? { icon: "💀", color: "#ef4444", name: "A BOSS" }
          : KINDS[ks[1] || ks[0]] || a;
      el.style.setProperty("--c", a.color);
      el.style.setProperty("--c2", b.color);
      el.innerHTML = `<div class="half l"></div><div class="half r"></div><div class="vs"><span>${a.icon}</span><span>⚔️</span><span>${b.icon}</span></div><div class="flash"></div><h2 style="color:#fff">${row.kind === "bossclash" ? "BOSS CLASH!" : "EVENT CLASH!"}</h2><p>${ks.map((k) => KINDS[k].name).join(" × ")}${row.kind === "bossclash" ? " × the boss" : ""} collided!</p>`;
      sfx("rebirth");
      if (typeof G.drShowAnnouncement === "function")
        G.drShowAnnouncement(
          `⚔️ EVENT CLASH! ${ks.map((k) => KINDS[k].name).join(" + ")} collided${row.kind === "bossclash" ? " with a boss — boss damage and curses ×2!" : " — bonuses stack, plus surges every 45s!"}`,
          { icon: "⚔️", color: a.color, glow: true },
        );
    } else {
      const k = KINDS[row.kind];
      if (!k) return;
      el.style.setProperty("--c", k.color);
      el.innerHTML = `<div class="bgf"></div><div class="big">${k.icon}</div><h2>${esc(k.name)}</h2><p>${esc(k.desc)}</p>`;
      sfx("newbadge");
      if (typeof G.drShowAnnouncement === "function")
        G.drShowAnnouncement(
          `${k.icon} ${k.name} has begun! ${k.desc} (15 minutes)`,
          { icon: k.icon, color: k.color },
        );
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  /* ==========================================================
     SYNC
     ========================================================== */

  async function fetchEvents() {
    const c = sb();
    if (!c) return;
    try {
      await c.rpc("events_tick");
    } catch (e) {}
    try {
      const { data, error } = await c
        .from("rand_events")
        .select("*")
        .eq("status", "active")
        .order("id", { ascending: true });
      if (error) {
        if (
          /relation|does not exist|schema cache|could not find/i.test(
            error.message || "",
          )
        )
          tableState = "missing";
        return;
      }
      tableState = "ok";
      setRows(data || []);
    } catch (e) {}
  }

  function setRows(next) {
    const prev = prevIds;
    rows = next;
    const ids = next.map((r) => r.id);
    if (prev) {
      next.forEach((r) => {
        if (prev.indexOf(r.id) < 0) onNew(r);
      });
      prev.forEach((id) => {
        if (
          ids.indexOf(id) < 0 &&
          !next.some((r) => (r.clash_of || []).length && r.id > id)
        ) {
          /* an event ended without a clash replacing it */
        }
      });
    } else {
      // first load: play the intro only for very fresh events we have not seen
      next.forEach((r) => {
        if (Date.now() - new Date(r.started_at).getTime() < 120000) onNew(r);
        markSeen(r.id);
      });
    }
    prevIds = ids;
    paintStack();
    paintTint();
    if (P && P.isOpen()) P.rerender();
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
  }

  function onNew(r) {
    if (seenIds().indexOf(r.id) >= 0) return;
    markSeen(r.id);
    playIntro(r);
  }

  function listen() {
    const c = sb();
    if (!c) return;
    try {
      c.channel("rand-events")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rand_events" },
          () => fetchEvents(),
        )
        .subscribe();
    } catch (e) {}
  }

  setInterval(() => {
    paintStack();
    if (!live().length) paintTint();
  }, 1000);

  /* ==========================================================
     TABS
     ========================================================== */

  async function loadHistory() {
    const c = sb();
    if (!c) return;
    try {
      const { data } = await c
        .from("rand_events")
        .select("id,kind,clash_of,status,started_at")
        .neq("status", "active")
        .order("id", { ascending: false })
        .limit(8);
      history = data || [];
      hist = true;
      if (P && P.isOpen()) P.rerender();
    } catch (e) {}
  }

  function nameOf(r) {
    if (r.kind === "clash" || r.kind === "bossclash")
      return `⚔️ ${r.kind === "bossclash" ? "Boss clash" : "Clash"}: ${(r.clash_of || []).map((k) => (KINDS[k] ? KINDS[k].icon : k)).join("×")}`;
    return KINDS[r.kind]
      ? `${KINDS[r.kind].icon} ${KINDS[r.kind].name}`
      : r.kind;
  }

  function renderLive() {
    if (!hist) loadHistory();
    const lv = live();
    const bossLive = G.drBoss && G.drBoss.ev ? G.drBoss.cfg() : null;
    const now = lv
      .map((r) => {
        const isC = r.kind === "clash" || r.kind === "bossclash";
        const ks = isC ? (r.clash_of || []).filter((k) => KINDS[k]) : [r.kind];
        return `<div class="pgCard done"><h3>${nameOf(r)} <span class="pgSub">• ${fmtLeft(new Date(r.ends_at).getTime() - Date.now())} left</span></h3>${isC ? `<p><b>${r.kind === "bossclash" ? "Boss clash!" : "Event clash!"}</b> All effects stack with a ×1.5 bonus and a surprise reward surge every 45 seconds.${r.kind === "bossclash" ? " The boss takes <b>×2 damage</b> but its curses drain <b>×2 XP</b>." : ""}</p>` : ""}${ks.map((k) => `<p>${KINDS[k].icon} <b>${esc(KINDS[k].name)}</b> — ${esc(KINDS[k].desc)}</p>`).join("")}</div>`;
      })
      .join("");
    const banner = `<div class="pgBanner">🎲 Random Events<br><span class="pgSub">Events start on their own, last <b>15 minutes</b> (bosses 30), and are the same for everyone. If a second event starts while one is running, they <b>clash</b> into a stronger combined event.${bossLive ? `<br>💀 Boss alive: <b>${esc(bossLive.name)}</b>` : ""}</span></div>`;
    const guide = KIND_IDS.map(
      (k) =>
        `<div class="pgCard"><h3>${KINDS[k].icon} ${esc(KINDS[k].name)}</h3><p>${esc(KINDS[k].desc)}</p></div>`,
    ).join("");
    const bosses = `<div class="pgCard"><h3>💀 Boss events</h3><p>Sometimes the <b>🧰 Vault Mimic</b> or <b>🕰️ Chrono Wraith</b> appears (30 minutes). Very rarely a real <b>Golem, Titan or Reality Breaker</b> wakes up.</p></div>`;
    const hs = history.length
      ? `<h3 style="margin:16px 0 6px">Recent</h3>` +
        history
          .map(
            (r) =>
              `<div class="pgSub" style="padding:3px 0">${nameOf(r)} • ${new Date(r.started_at).toLocaleString()} • ${esc(r.status)}</div>`,
          )
          .join("")
      : "";
    const miss =
      tableState === "missing"
        ? '<div class="pgSub" style="color:#fda4af">Random events need events-setup.sql in Supabase.</div>'
        : "";
    return `${banner}${miss}${now || '<div class="pgCard"><p>No random event is running right now. The next one could start any minute…</p></div>'}<h3 style="margin:16px 0 6px">All events</h3><div class="rvGuide">${guide}${bosses}</div>${hs}`;
  }

  let adminMsg = "";
  function renderAdmin() {
    const btn = (k, label) =>
      `<button class="pgBtn" data-rv="${k}">${label}</button>`;
    return `<div class="pgCard"><b>🎲 Trigger a random event</b><div class="pgSub">Starts it right now for everyone (15 min). Start a second one while one is running to cause a clash. A boss while an event runs causes a boss clash.</div>
      <div class="rvBtnRow">${KIND_IDS.map((k) => btn(k, `${KINDS[k].icon} ${esc(KINDS[k].name)}`)).join("")}</div>
      <div class="pgSub">Boss events (30 min)</div>
      <div class="rvBtnRow">${Object.keys(BOSS_KINDS)
        .map((k) => btn(k, BOSS_KINDS[k]))
        .join("")}</div>
      <div class="rvBtnRow"><button class="pgBtn" id="rvEnd">⛔ End all events</button><button class="pgBtn" id="rvPrev">👁️ Preview clash intro (me only)</button></div>
      ${adminMsg ? `<div class="pgSub">${esc(adminMsg)}</div>` : ""}</div>`;
  }
  function bindAdmin(root) {
    root.querySelectorAll("[data-rv]").forEach((b) => {
      b.onclick = async () => {
        const c = sb();
        b.disabled = true;
        const { error } = await c.rpc("event_spawn", { p_kind: b.dataset.rv });
        adminMsg = error ? "Could not start: " + error.message : "Started!";
        await fetchEvents();
        if (typeof G.drBoss !== "undefined" && BOSS_KINDS[b.dataset.rv])
          setTimeout(() => G.drBossRefresh && G.drBossRefresh(), 500);
        P.rerender();
      };
    });
    const e = root.querySelector("#rvEnd");
    if (e)
      e.onclick = async () => {
        const { error } = await sb().rpc("event_cancel_all");
        adminMsg = error ? error.message : "All events ended.";
        await fetchEvents();
        P.rerender();
      };
    const pv = root.querySelector("#rvPrev");
    if (pv)
      pv.onclick = () =>
        playIntro({
          id: -1,
          kind: "clash",
          clash_of: [pick(KIND_IDS), pick(KIND_IDS)],
        });
  }

  if (P && P.addTab) {
    P.addTab("live", "🎲 Live Events", renderLive);
    P.addTab("rvadmin", "🎲 Spawn Events", renderAdmin, bindAdmin, isAdmin);
  }

  /* ==========================================================
     BOOT
     ========================================================== */

  G.drEventsDebug = {
    rows: () => rows,
    kinds: activeKinds,
    clash: inClash,
    set: setRows,
    intro: playIntro,
    surge,
  };

  function boot() {
    if (!sb()) return;
    listen();
    fetchEvents();
    setInterval(fetchEvents, 15000);
  }
  setTimeout(boot, 1800);
})();
