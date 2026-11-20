/* ============================================================
   DIGIT ROLL — FEATURES 2
   Timed events, achievements + titles, badge collection rewards,
   cosmetics (themes, digit fonts, name effects), full roll log.
   Loaded after features.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const P = G.drProgress;
  if (!P) return;

  const $id = (id) => document.getElementById(id);
  const n = (v) => Number(v || 0).toLocaleString();
  const esc = (s) => (typeof escapeHTML === "function" ? escapeHTML(String(s)) : String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (a, b) => typeof G.drSfx === "function" && G.drSfx(a, b);

  function load(key, fb) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      if (v && typeof v === "object") return Object.assign(fb, v);
    } catch (e) {}
    return fb;
  }
  const save = (key, v) => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  const pushProfile = () => typeof G.drPushProfile === "function" && G.drPushProfile();

  /* ==========================================================
     TIMED EVENTS (every weekend, rotating)
     ========================================================== */

  const EVENTS = [
    { id: "xp2", name: "⚡ Double XP Weekend", desc: "All XP from rolls is doubled.", xp: 2 },
    { id: "sale", name: "🏷️ Charm Sale", desc: "Number charms and lucky charms are 50% off.", charm: 0.5 },
    { id: "luck", name: "🍀 Lucky Weekend", desc: "Every roll gets +1 guaranteed badge.", luck: 1 },
    { id: "rush", name: "🎯 Daily Rush", desc: "Daily challenge XP rewards are doubled.", daily: 2 },
  ];

  const weekIndex = (d) => Math.floor((Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + 3) / 7);

  function startOfNextWeekend(from) {
    const d = new Date(from);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d;
  }
  function nextMonday(from) {
    const d = new Date(from);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    return d;
  }

  function currentEvent() {
    let forced = null;
    try {
      forced = localStorage.getItem("digitRollEventForce");
    } catch (e) {}
    if (forced) {
      const ev = EVENTS.find((e) => e.id === forced);
      if (ev) return { ev, ends: null, forced: true };
    }
    const now = new Date();
    const dow = now.getDay();
    if (dow === 6 || dow === 0) return { ev: EVENTS[weekIndex(now) % EVENTS.length], ends: nextMonday(now) };
    return null;
  }
  function nextEvent() {
    const now = new Date();
    const start = startOfNextWeekend(now);
    return { ev: EVENTS[weekIndex(start) % EVENTS.length], starts: start };
  }
  G.drForceEvent = function (id) {
    try {
      if (id) localStorage.setItem("digitRollEventForce", id);
      else localStorage.removeItem("digitRollEventForce");
    } catch (e) {}
    updateBanner();
    if (typeof G.updateShopUI === "function") updateShopUI();
  };

  const evVal = (key, dflt) => {
    const c = currentEvent();
    return c && c.ev[key] != null ? c.ev[key] : dflt;
  };
  G.drEventXP = () => evVal("xp", 1);
  G.drEventCharmDiscount = () => evVal("charm", 1);
  G.drEventLuck = () => evVal("luck", 0);
  G.drEventDaily = () => evVal("daily", 1);

  const dur = (ms) => {
    const m = Math.max(0, Math.floor(ms / 60000));
    const d = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    return d ? `${d}d ${h}h` : h ? `${h}h ${m % 60}m` : `${m}m`;
  };

  function updateBanner() {
    let bar = $id("drEventBanner");
    const cur = currentEvent();
    if (!cur) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      const st = document.createElement("style");
      st.textContent = `#drEventBanner{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9000;padding:8px 16px;border-radius:999px;background:linear-gradient(90deg,rgba(122,162,255,.92),rgba(142,230,173,.92));color:#0b1020;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.4);white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis}
      @media(max-width:650px){#drEventBanner{top:auto;bottom:70px;font-size:12px}}`;
      document.head.appendChild(st);
      bar = document.createElement("div");
      bar.id = "drEventBanner";
      bar.onclick = () => P.open("events");
      document.body.appendChild(bar);
    }
    bar.textContent = `${cur.ev.name} — ${cur.ev.desc}${cur.ends ? " • ends in " + dur(cur.ends - Date.now()) : ""}`;
  }
  setInterval(updateBanner, 30000);

  function renderEvents() {
    const cur = currentEvent();
    const nx = nextEvent();
    const list = EVENTS.map((e) => `<div class="pgCard ${cur && cur.ev.id === e.id ? "done" : ""}"><h3>${e.name}</h3><p>${e.desc}</p></div>`).join("");
    return `<div class="pgBanner">${
      cur
        ? `Active now: <b>${cur.ev.name}</b><br><span class="pgSub">${cur.ev.desc}${cur.ends ? " Ends in " + dur(cur.ends - Date.now()) + "." : ""}</span>`
        : `No event right now.<br><span class="pgSub">Next: <b>${nx.ev.name}</b> starts Saturday (in ${dur(nx.starts - Date.now())}).</span>`
    }</div>
    <p class="pgSub">A different event runs every weekend and rotates through this list.</p>
    <div class="pgGrid">${list}</div>`;
  }
  P.addTab("events", "📅 Events", renderEvents);

  /* ==========================================================
     COSMETICS
     ========================================================== */

  const COS_KEY = "digitRollCosmetics";
  const cos = load(COS_KEY, { owned: {}, eq: { theme: "", font: "", fx: "" } });
  cos.eq = Object.assign({ theme: "", font: "", fx: "" }, cos.eq);

  const COSMETICS = {
    theme: [
      { id: "neon", name: "Neon Grid", cost: 3000 },
      { id: "sunset", name: "Sunset", cost: 3000 },
      { id: "matrix", name: "Matrix", cost: 4000 },
      { id: "ice", name: "Ice", cost: 4000 },
      { id: "gold", name: "Gold", cost: 6000 },
    ],
    font: [
      { id: "mono", name: "Typewriter", cost: 1500 },
      { id: "serif", name: "Classic Serif", cost: 1500 },
      { id: "round", name: "Rounded", cost: 2000 },
      { id: "impact", name: "Heavy", cost: 2500 },
      { id: "script", name: "Script", cost: 3000 },
    ],
    fx: [
      { id: "glow", name: "Glow", cost: 2500 },
      { id: "pulse", name: "Pulse", cost: 2500 },
      { id: "sparkle", name: "Sparkle", cost: 4000 },
      { id: "glitch", name: "Glitch", cost: 4000 },
      { id: "aura", name: "Aura", cost: 6000 },
    ],
  };
  const KIND_LABEL = { theme: "🖼️ Roll Box Themes", font: "🔤 Digit Fonts", fx: "✨ Name Effects" };

  function injectCosCSS() {
    if ($id("cosCSS")) return;
    const st = document.createElement("style");
    st.id = "cosCSS";
    st.textContent = `
      body.drTheme-neon .number{border-color:#22d3ee!important;box-shadow:0 0 0 1px #22d3ee,0 0 30px rgba(34,211,238,.45),inset 0 0 40px rgba(34,211,238,.12)!important;background-image:linear-gradient(rgba(34,211,238,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.08) 1px,transparent 1px)!important;background-size:26px 26px!important}
      body.drTheme-sunset .number{border-color:#fb923c!important;background-image:linear-gradient(135deg,rgba(251,146,60,.25),rgba(236,72,153,.22),rgba(99,102,241,.22))!important;box-shadow:0 0 30px rgba(236,72,153,.3)!important}
      body.drTheme-matrix .number{border-color:#22c55e!important;background-color:#020a04!important;background-image:repeating-linear-gradient(0deg,rgba(34,197,94,.08) 0 2px,transparent 2px 5px)!important;box-shadow:0 0 28px rgba(34,197,94,.35)!important}
      body.drTheme-ice .number{border-color:#bae6fd!important;background-image:linear-gradient(160deg,rgba(186,230,253,.22),rgba(125,211,252,.06) 60%,rgba(255,255,255,.14))!important;box-shadow:0 0 30px rgba(125,211,252,.35)!important}
      body.drTheme-gold .number{border-color:#facc15!important;background-image:linear-gradient(120deg,rgba(250,204,21,.22),rgba(255,255,255,.08),rgba(250,204,21,.22))!important;box-shadow:0 0 34px rgba(250,204,21,.4)!important;animation:drGoldSheen 4s linear infinite;background-size:220% 100%!important}
      @keyframes drGoldSheen{to{background-position:-220% 0}}
      body.drFont-mono .number{font-family:"Courier New",ui-monospace,monospace!important}
      body.drFont-serif .number{font-family:Georgia,"Times New Roman",serif!important}
      body.drFont-round .number{font-family:"Trebuchet MS","Arial Rounded MT Bold",sans-serif!important}
      body.drFont-impact .number{font-family:Impact,"Arial Black",sans-serif!important;letter-spacing:.06em}
      body.drFont-script .number{font-family:"Brush Script MT","Segoe Script",cursive!important}
      .drFx{display:inline-block}
      .drFx-glow{text-shadow:0 0 8px currentColor,0 0 18px currentColor}
      .drFx-pulse{animation:drFxPulse 1.6s ease-in-out infinite}
      @keyframes drFxPulse{0%,100%{text-shadow:0 0 2px currentColor}50%{text-shadow:0 0 14px currentColor,0 0 26px currentColor}}
      .drFx-sparkle{position:relative}
      .drFx-sparkle::after{content:"✦";position:absolute;right:-.9em;top:-.3em;font-size:.8em;color:#fde68a;animation:drFxSpark 1.4s ease-in-out infinite}
      @keyframes drFxSpark{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1.1) rotate(90deg)}}
      .drFx-glitch{animation:drFxGlitch 2.4s steps(1) infinite}
      @keyframes drFxGlitch{0%,90%,100%{text-shadow:none}92%{text-shadow:2px 0 #f0f,-2px 0 #0ff}95%{text-shadow:-2px 1px #f0f,2px -1px #0ff}}
      .drFx-aura{text-shadow:0 0 6px currentColor,0 0 14px currentColor,0 0 30px currentColor;animation:drFxAura 3s ease-in-out infinite}
      @keyframes drFxAura{50%{text-shadow:0 0 10px currentColor,0 0 24px currentColor,0 0 46px currentColor}}
      .pgSw{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .pgSw .pgBtn{margin:0;flex:1;min-width:100px}
      .pgBtn.on{background:rgba(122,162,255,.3);outline:1px solid rgba(122,162,255,.7)}
      @media (prefers-reduced-motion:reduce){.drFx{animation:none!important}.drFx-sparkle::after{animation:none;opacity:1}}
    `;
    document.head.appendChild(st);
  }

  function applyCosmetics() {
    injectCosCSS();
    const cl = document.body.classList;
    [...cl].filter((c) => /^dr(Theme|Font)-/.test(c)).forEach((c) => cl.remove(c));
    if (cos.eq.theme) cl.add("drTheme-" + cos.eq.theme);
    if (cos.eq.font) cl.add("drFont-" + cos.eq.font);
  }
  G.drGetNameFx = () => cos.eq.fx || "";

  function spendXP(cost) {
    if (getXPBalance() < cost) {
      say("Not enough XP.");
      sfx("error");
      return false;
    }
    xpBalance = getXPBalance() - cost;
    xpSpent += cost;
    saveShopState();
    localStorage.setItem("digitRollXPBalance", String(xpBalance));
    if (typeof G.updateShopUI === "function") updateShopUI();
    return true;
  }

  const ownedCount = () => Object.keys(cos.owned).length;

  function renderCosmetics() {
    const bal = getXPBalance();
    const cap = typeof G.drGetCap === "function" ? G.drGetCap() : 0;
    let html = `<div class="pgBanner">💰 XP: ${n(bal)} / ${n(cap)}<br><span class="pgSub">Cosmetics are permanent and are not reset by rebirth. Name effects are shown to everyone on the leaderboard (needs features-setup.sql for other players to see them).</span></div>`;
    Object.keys(COSMETICS).forEach((kind) => {
      const cards = COSMETICS[kind]
        .map((it) => {
          const key = kind + ":" + it.id;
          const owned = !!cos.owned[key];
          const eq = cos.eq[kind] === it.id;
          const btn = owned
            ? `<button class="pgBtn ${eq ? "on" : ""}" data-eq="${kind}:${it.id}">${eq ? "✓ Equipped" : "Equip"}</button>`
            : `<button class="pgBtn" data-buy="${kind}:${it.id}" ${bal >= it.cost ? "" : "disabled"}>${bal >= it.cost ? "Buy" : bal < it.cost && cap < it.cost ? "Raise your XP cap first" : "Not enough XP"}</button>`;
          const demo = kind === "fx" ? `<p>Preview: <span class="drFx drFx-${it.id}" style="color:#a855f7;font-weight:900">PlayerName</span></p>` : "";
          return `<div class="pgCard ${eq ? "done" : ""}"><h3>${it.name}</h3>${demo}<p>${owned ? "Owned" : "Cost: <b>" + n(it.cost) + " XP</b>"}</p>${btn}</div>`;
        })
        .join("");
      const none = cos.eq[kind] ? `<button class="pgBtn" data-eq="${kind}:" style="max-width:220px">Remove ${kind === "fx" ? "effect" : kind === "font" ? "font" : "theme"}</button>` : "";
      html += `<div class="pgH">${KIND_LABEL[kind]}</div><div class="pgGrid">${cards}</div>${none}`;
    });
    return html;
  }

  function bindCosmetics(root) {
    root.querySelectorAll("[data-buy]").forEach((b) => {
      b.onclick = () => {
        const [kind, id] = b.dataset.buy.split(":");
        const it = COSMETICS[kind].find((x) => x.id === id);
        if (!it || cos.owned[b.dataset.buy] || !spendXP(it.cost)) return;
        cos.owned[b.dataset.buy] = true;
        cos.eq[kind] = id;
        save(COS_KEY, cos);
        applyCosmetics();
        sfx("buy");
        say("🎨 " + it.name + " bought and equipped.");
        if (kind === "fx") pushProfile();
        checkAll();
        P.rerender();
      };
    });
    root.querySelectorAll("[data-eq]").forEach((b) => {
      b.onclick = () => {
        const [kind, id] = b.dataset.eq.split(":");
        cos.eq[kind] = id || "";
        save(COS_KEY, cos);
        applyCosmetics();
        sfx("click");
        if (kind === "fx") pushProfile();
        if (typeof G.loadLeaderboard === "function") G.loadLeaderboard();
        P.rerender();
      };
    });
  }
  P.addTab("style", "🎨 Style", renderCosmetics, bindCosmetics);

  /* ==========================================================
     ACHIEVEMENTS, TITLES, COLLECTION MILESTONES
     ========================================================== */

  const ACH_KEY = "digitRollAch";
  const ach = load(ACH_KEY, { done: {}, title: "", milestones: {} });

  const maxTier = (s) => Object.keys(s.rarity || {}).reduce((m, k) => (s.rarity[k] > 0 ? Math.max(m, P.tierOf(k)) : m), 0);
  const ctx = () => {
    const s = P.stats();
    return {
      s,
      rolls: s.rolls,
      xp: s.xp,
      tier: maxTier(s),
      rb: G.__drShop ? G.__drShop.S.rebirths : 0,
      sh: G.__drShop ? G.__drShop.S : {},
      unl: typeof getUnlockedBadgeNames === "function" ? getUnlockedBadgeNames().size : 0,
      cat: typeof staticBadgeCatalog !== "undefined" ? Object.keys(staticBadgeCatalog).length : 0,
      streak: Math.max(P.currentStreak(), P.daily().streak || 0),
    };
  };

  const ACHS = [
    ["rookie", "Rookie", "Roll 100 times", (c) => c.rolls >= 100, 0],
    ["veteran", "Veteran", "Roll 1,000 times", (c) => c.rolls >= 1000, 1],
    ["grinder", "Grinder", "Roll 10,000 times", (c) => c.rolls >= 10000, 2],
    ["rich", "Rich", "Earn 100,000 XP in total", (c) => c.xp >= 100000, 1],
    ["tycoon", "Tycoon", "Earn 1,000,000 XP in total", (c) => c.xp >= 1000000, 2],
    ["epic", "Epic Finder", "Roll an Epic", (c) => c.tier >= 6, 0],
    ["legend", "Legend", "Roll a Legendary", (c) => c.tier >= 7, 0],
    ["myth", "Mythbreaker", "Roll a Mythic", (c) => c.tier >= 8, 1],
    ["divine", "Blessed", "Roll a Divine", (c) => c.tier >= 9, 2],
    ["trans", "Transcendent", "Roll a Transcendent", (c) => c.tier >= 10, 3],
    ["beyond", "Beyond Reason", "Roll an Ascended or higher", (c) => c.tier >= 12, 3],
    ["absolute", "The Absolute", "Roll an Absolute", (c) => c.tier >= 16, 5],
    ["reborn", "Reborn", "Do 1 true rebirth", (c) => c.rb >= 1, 0],
    ["phoenix", "Phoenix", "Do 3 true rebirths", (c) => c.rb >= 3, 2],
    ["rainbow", "Rainbow Soul", "Do 8 true rebirths", (c) => c.rb >= 8, 5],
    ["collector", "Collector", "Unlock 25 badges", (c) => c.unl >= 25, 0],
    ["hoarder", "Hoarder", "Unlock 100 badges", (c) => c.unl >= 100, 1],
    ["complete", "Completionist", "Unlock every badge", (c) => c.cat > 0 && c.unl >= c.cat, 5],
    ["streak3", "Dedicated", "Reach a 3-day daily streak", (c) => c.streak >= 3, 0],
    ["streak7", "Devoted", "Reach a 7-day daily streak", (c) => c.streak >= 7, 2],
    ["streak30", "Unstoppable", "Reach a 30-day daily streak", (c) => c.streak >= 30, 5],
    ["multi", "Multiplier", "Own XP Charm VIII (×10)", (c) => c.sh.xpCharm >= 8, 1],
    ["gloves", "Lucky One", "Own Lucky Gloves V", (c) => c.sh.gloves >= 5, 1],
    ["stylist", "Stylist", "Own 3 cosmetics", () => ownedCount() >= 3, 0],
  ];

  const MILESTONES = [
    { pct: 25, pts: 1, boost: 0.05 },
    { pct: 50, pts: 2, boost: 0.05 },
    { pct: 75, pts: 3, boost: 0.05 },
    { pct: 100, pts: 5, boost: 0.1 },
  ];
  G.drMilestoneBoost = () => 1 + MILESTONES.reduce((s, m) => s + (ach.milestones[m.pct] ? m.boost : 0), 0);
  G.drGetTitle = () => (ach.title && ach.done[ach.title] ? ACHS.find((a) => a[0] === ach.title)[1] : "");

  let checking = false;
  function checkAll() {
    if (checking) return;
    checking = true;
    try {
      const c = ctx();
      let changed = false;
      ACHS.forEach(([id, title, desc, test, pts]) => {
        if (ach.done[id]) return;
        let ok = false;
        try {
          ok = test(c);
        } catch (e) {}
        if (!ok) return;
        ach.done[id] = Date.now();
        changed = true;
        if (pts) P.addPoints(pts);
        say(`🏆 Achievement: ${title}${pts ? " (+" + pts + " ★)" : ""} — title unlocked!`);
        sfx("newbadge");
      });
      const pct = c.cat ? (c.unl / c.cat) * 100 : 0;
      MILESTONES.forEach((m) => {
        if (ach.milestones[m.pct] || pct < m.pct) return;
        ach.milestones[m.pct] = Date.now();
        changed = true;
        P.addPoints(m.pts);
        say(`🏅 Badge collection ${m.pct}%! +${m.pts} ★ and +${Math.round(m.boost * 100)}% XP forever.`);
        sfx("rebirth");
      });
      if (changed) {
        save(ACH_KEY, ach);
        pushProfile();
        if (P.isOpen()) P.rerender();
        if (typeof G.updateShopUI === "function") updateShopUI();
      }
    } finally {
      checking = false;
    }
  }
  P.onRoll(checkAll);
  setInterval(checkAll, 15000);

  function renderGoals() {
    checkAll();
    const c = ctx();
    const pct = c.cat ? Math.min(100, (c.unl / c.cat) * 100) : 0;
    const ms = MILESTONES.map((m) => {
      const got = !!ach.milestones[m.pct];
      return `<div class="pgCard ${got ? "done" : ""}"><span class="pgTag">${m.pct}% of badges</span><h3>${got ? "✓ Reached" : "Locked"}</h3><p>Reward: +${m.pts} ★ and +${Math.round(m.boost * 100)}% XP permanently.</p></div>`;
    }).join("");
    const cards = ACHS.map(([id, title, desc, , pts]) => {
      const done = !!ach.done[id];
      const eq = ach.title === id;
      return `<div class="pgCard ${done ? "done" : ""}"><h3>${done ? "🏆" : "🔒"} ${esc(title)}</h3><p>${esc(desc)}${pts ? ` • +${pts} ★` : ""}</p>${
        done ? `<button class="pgBtn ${eq ? "on" : ""}" data-title="${id}">${eq ? "✓ Title equipped" : "Equip title"}</button>` : ""
      }</div>`;
    }).join("");
    return `<div class="pgBanner">Badge collection: <b>${n(c.unl)} / ${n(c.cat)}</b> (${pct.toFixed(1)}%) • Achievements: <b>${Object.keys(ach.done).length} / ${ACHS.length}</b><br>
      <span class="pgSub">Equip a title to show it next to your name on the leaderboard.</span>
      <div class="pgBar"><i style="width:${pct}%"></i></div></div>
      ${ach.title ? `<button class="pgBtn" data-title="" style="max-width:220px;margin:0 0 14px">Remove title</button>` : ""}
      <div class="pgH">Collection milestones</div><div class="pgGrid">${ms}</div>
      <div class="pgH">Achievements</div><div class="pgGrid">${cards}</div>`;
  }
  function bindGoals(root) {
    root.querySelectorAll("[data-title]").forEach((b) => {
      b.onclick = () => {
        ach.title = b.dataset.title;
        save(ACH_KEY, ach);
        sfx("click");
        pushProfile();
        if (typeof G.loadLeaderboard === "function") G.loadLeaderboard();
        P.rerender();
      };
    });
  }
  P.addTab("goals", "🏆 Goals", renderGoals, bindGoals);

  /* ==========================================================
     FULL ROLL LOG (last 500 rolls, paged)
     ========================================================== */

  const LOG_KEY = "digitRollLog";
  let log = [];
  try {
    const raw = JSON.parse(localStorage.getItem(LOG_KEY));
    if (Array.isArray(raw)) log = raw;
  } catch (e) {}

  function seedLog() {
    if (log.length || !Array.isArray(history)) return;
    log = history.map((r) => ({ r: r.roll, o: r.oneIn, k: r.rarity, x: r.xp, t: r.time || Date.now(), b: (r.badges || []).map((b) => (typeof b === "string" ? b : b.name)).slice(0, 8) }));
  }
  seedLog();

  P.onRoll((r) => {
    log.unshift({ r: r.roll, o: r.oneIn, k: r.rarity, x: r.xp, t: r.time || Date.now(), b: (r.badges || []).map((b) => (typeof b === "string" ? b : b.name)).slice(0, 8) });
    if (log.length > 500) log.length = 500;
    save(LOG_KEY, log);
  });
  G.drGetLog = () => log;

  const logState = { page: 0, min: 0 };
  const PAGE = 20;

  function renderLog() {
    const rows = log.filter((e) => P.tierOf(e.k) >= logState.min);
    const pages = Math.max(1, Math.ceil(rows.length / PAGE));
    logState.page = Math.min(logState.page, pages - 1);
    const slice = rows.slice(logState.page * PAGE, logState.page * PAGE + PAGE);
    const opts = ["All rarities"].concat(P.TIERS.slice(3, 17).map((t) => t + "+"));
    const sel = `<select id="pgLogMin" style="padding:9px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#161c2a;color:#fff">${opts
      .map((o, i) => `<option value="${i === 0 ? 0 : i + 2}" ${logState.min === (i === 0 ? 0 : i + 2) ? "selected" : ""}>${o}</option>`)
      .join("")}</select>`;
    const list = slice
      .map(
        (e) => `<div class="pgCard" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-bottom:8px">
          <div><b style="font-size:20px;letter-spacing:.06em">${esc(e.r)}</b> <span class="rarity ${typeof rarityClass === "function" ? rarityClass(e.k) : ""}">${esc(e.k)}</span>
          <div class="pgSub">1 in ${n(e.o)} • +${n(e.x)} XP • ${new Date(e.t).toLocaleString()}${e.b && e.b.length ? " • 🏅 " + e.b.map(esc).join(", ") : ""}</div></div>
          <button class="pgBtn" style="margin:0;width:auto;padding:9px 14px" data-share="${log.indexOf(e)}">📤 Share</button></div>`,
      )
      .join("");
    return `<div class="pgBanner" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">Showing ${rows.length} of your last ${log.length} rolls ${sel}</div>
      ${list || '<p class="pgSub">No rolls match.</p>'}
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:12px">
        <button class="pgBtn" id="pgLogPrev" style="width:auto;margin:0;padding:9px 18px" ${logState.page <= 0 ? "disabled" : ""}>← Prev</button>
        <span class="pgSub">Page ${logState.page + 1} / ${pages}</span>
        <button class="pgBtn" id="pgLogNext" style="width:auto;margin:0;padding:9px 18px" ${logState.page >= pages - 1 ? "disabled" : ""}>Next →</button></div>`;
  }
  function bindLog(root) {
    const sel = root.querySelector("#pgLogMin");
    if (sel)
      sel.onchange = () => {
        logState.min = Number(sel.value);
        logState.page = 0;
        P.rerender();
      };
    const pv = root.querySelector("#pgLogPrev");
    const nx = root.querySelector("#pgLogNext");
    if (pv) pv.onclick = () => (logState.page--, P.rerender());
    if (nx) nx.onclick = () => (logState.page++, P.rerender());
    root.querySelectorAll("[data-share]").forEach((b) => {
      b.onclick = () => {
        const e = log[Number(b.dataset.share)];
        if (e && typeof G.drShareRoll === "function") G.drShareRoll(e);
        else say("Share isn't available yet.");
      };
    });
  }
  P.addTab("log", "📜 Log", renderLog, bindLog);

  /* ---------- boot ---------- */
  applyCosmetics();
  updateBanner();
  setTimeout(checkAll, 1500);
})();
