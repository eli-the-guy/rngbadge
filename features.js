/* ============================================================
   DIGIT ROLL — PROGRESS (daily challenges, stats, prestige shop)
   Loaded after shop-ui.js and sound.js.
   Adds a "🎯 Progress" button to the nav with three tabs.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const $id = (id) => document.getElementById(id);
  const n = (v) => Number(v || 0).toLocaleString();
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];

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
  const tierOf = (r) => Math.max(0, TIERS.indexOf(r));

  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      if (v && typeof v === "object") return Object.assign(fallback, v);
    } catch (e) {}
    return fallback;
  }
  function save(key, v) {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  }
  const sfx = (name, arg) => {
    if (typeof G.drSfx === "function") G.drSfx(name, arg);
  };
  const say = (msg) => {
    if (typeof G.toast === "function") G.toast(msg);
  };

  const dayKey = (d) => {
    d = d || new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };
  /* Daily challenges reset at the same moment for everyone: 00:00 UTC */
  const utcKey = (d) => (d || new Date()).toISOString().slice(0, 10);
  const yesterdayKey = () => utcKey(new Date(Date.now() - 86400000));
  const resetTimeText = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  /* ==========================================================
     STATS (permanent, not limited to the 30-roll history)
     ========================================================== */

  const STATS_KEY = "digitRollStats2";
  let stats = load(STATS_KEY, {
    rolls: 0,
    xp: 0,
    badgeRolls: 0,
    best: null,
    rarity: {},
    days: {},
    first: null,
    seeded: false,
  });

  function seedStats() {
    if (stats.seeded) return;
    stats.seeded = true;
    try {
      (Array.isArray(history) ? history : []).forEach((r) =>
        addToStats(r, true),
      );
    } catch (e) {}
    save(STATS_KEY, stats);
  }

  function addToStats(r, seed) {
    stats.rolls++;
    stats.xp += Number(r.xp || 0);
    if (r.badges && r.badges.length) stats.badgeRolls++;
    stats.rarity[r.rarity] = (stats.rarity[r.rarity] || 0) + 1;
    if (!stats.best || Number(r.oneIn || 0) > Number(stats.best.oneIn || 0)) {
      stats.best = { oneIn: r.oneIn, roll: r.roll, rarity: r.rarity };
    }
    const day = seed && r.time ? dayKey(new Date(r.time)) : dayKey();
    if (!stats.first || day < stats.first) stats.first = day;
    const d = (stats.days[day] = stats.days[day] || { rolls: 0, xp: 0 });
    d.rolls++;
    d.xp += Number(r.xp || 0);
  }

  /* ==========================================================
     DAILY CHALLENGES
     ========================================================== */

  const DAILY_KEY = "digitRollDaily";
  let daily = load(DAILY_KEY, {
    date: "",
    p: [0, 0, 0],
    done: [false, false, false],
    names: [],
    streak: 0,
    lastClear: "",
    cleared: false,
  });

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };

  const maxCount = (roll) => {
    const c = {};
    let m = 0;
    for (const ch of String(roll)) m = Math.max(m, (c[ch] = (c[ch] || 0) + 1));
    return m;
  };

  /* How rarity really behaves (simulated, 15,000 rolls per length):
     every extra digit pushes the whole curve up. From 7 digits on, Legendary is the most common
     tier, Mythic is common, and at 10 digits every roll has a badge. So tier goals can't be fixed
     numbers: they are chosen from the table below so the expected effort stays about the same
     for every roll length.
     CUM[len][tier] = chance a roll is at least that tier, for tiers RARE (index 5) .. "???" (index 17). */
  const CUM = {
    5: [
      0.46, 0.33, 0.2, 0.11, 0.054, 0.027, 0.014, 0.0057, 0.0027, 0.0013,
      0.00093, 0.0002, 0.0002,
    ],
    6: [
      0.58, 0.44, 0.29, 0.16, 0.086, 0.045, 0.023, 0.011, 0.0052, 0.0024,
      0.0011, 0.00027, 0.00005,
    ],
    7: [
      0.68, 0.53, 0.38, 0.23, 0.13, 0.071, 0.037, 0.019, 0.0092, 0.0052, 0.0021,
      0.0012, 0.00033,
    ],
    8: [
      0.78, 0.63, 0.49, 0.32, 0.19, 0.11, 0.063, 0.032, 0.014, 0.0067, 0.0037,
      0.0019, 0.0008,
    ],
    9: [
      0.85, 0.72, 0.59, 0.41, 0.25, 0.15, 0.085, 0.047, 0.026, 0.013, 0.0062,
      0.0029, 0.00087,
    ],
    10: [
      0.9, 0.81, 0.69, 0.5, 0.33, 0.21, 0.12, 0.072, 0.04, 0.02, 0.011, 0.0053,
      0.0022,
    ],
    11: [
      0.93, 0.86, 0.76, 0.59, 0.42, 0.27, 0.17, 0.1, 0.06, 0.031, 0.015, 0.0081,
      0.0031,
    ],
  };
  const curLen = () =>
    Math.min(
      11,
      Math.max(5, typeof G.drRollLength === "function" ? G.drRollLength() : 5),
    );
  const RARE_I = TIERS.indexOf("RARE");
  const pTier = (len, tier) => CUM[len][tier - RARE_I] || 1e-9;

  /* pick the tier whose chance x effort is closest to the wanted goal */
  function pickTier(effort, goal, len) {
    let best = TIERS.indexOf("MYTHIC");
    let bestErr = Infinity;
    for (let t = RARE_I + 1; t <= TIERS.indexOf("ABSOLUTE"); t++) {
      const err = Math.abs(Math.log((pTier(len, t) * effort) / goal));
      if (err < bestErr) {
        bestErr = err;
        best = t;
      }
    }
    return best;
  }
  const tierLabel = (t) => TIERS[t].charAt(0) + TIERS[t].slice(1).toLowerCase();
  const xpMult = () =>
    Math.max(
      1,
      typeof G.drXPMultiplier === "function" ? G.drXPMultiplier() : 1,
    );

  /* kinds: tier = "roll <tier> or better N times" (tier chosen from your roll length),
     rolls, xp (scaled by your XP multiplier), unique badges */
  const POOLS = {
    easy: [
      { kind: "tier", effort: 100, goals: [15, 20, 25] },
      { kind: "tier", effort: 120, goals: [18, 24] },
      { kind: "rolls", goals: [60, 90, 120] },
      { kind: "xp", goals: [8000, 12000] },
    ],
    medium: [
      { kind: "tier", effort: 300, goals: [8, 12] },
      { kind: "tier", effort: 350, goals: [10, 14] },
      { kind: "rolls", goals: [250, 350] },
      { kind: "xp", goals: [30000, 45000] },
      { kind: "unique", goals: [30, 40] },
    ],
    hard: [
      { kind: "tier", effort: 800, goals: [6, 9] },
      { kind: "tier", effort: 1000, goals: [8, 12] },
      { kind: "unique", goals: [55, 70] },
      { kind: "xp", goals: [100000, 150000] },
      { kind: "rolls", goals: [600, 900] },
    ],
  };
  const REWARDS = [750, 2500, 7000];
  const LABELS = ["Easy", "Medium", "Hard"];

  /* Seeded picks are the same for everybody; tier / XP goals are fitted to your roll length. */
  function buildCfg(i, def, rng) {
    const goal = def.goals[Math.floor(rng() * def.goals.length)];
    if (def.kind === "tier")
      return {
        kind: "tier",
        v: 2,
        tier: pickTier(def.effort, goal, curLen()),
        goal,
        len: curLen(),
        mult: xpMult(),
      };
    if (def.kind === "xp")
      return {
        kind: "xp",
        goal: Math.round(goal * xpMult()),
        len: curLen(),
        mult: xpMult(),
      };
    return { kind: def.kind, goal, len: curLen(), mult: xpMult() };
  }

  function todaysChallenges() {
    ensureDay();
    const rng = mulberry(hash("digitroll-" + utcKey()));
    const picks = ["easy", "medium", "hard"].map((tier) => {
      const pool = POOLS[tier];
      const def = pool[Math.floor(rng() * pool.length)];
      return { def, rng: mulberry(Math.floor(rng() * 4294967296)) };
    });
    if (!Array.isArray(daily.cfg) || daily.cfg.length !== 3)
      daily.cfg = [null, null, null];
    picks.forEach((p, i) => {
      /* (re)fit while you haven't made progress, so upgrading before you start is fair */
      const c0 = daily.cfg[i];
      if (c0 && c0.kind === "tier" && c0.v !== 2) {
        c0.tier += 1; // a tier was added below NOVICE
        c0.v = 2;
      }
      const stale =
        !c0 ||
        (daily.p[i] === 0 &&
          !daily.done[i] &&
          (c0.len !== curLen() || c0.mult !== xpMult()));
      if (stale) daily.cfg[i] = buildCfg(i, p.def, p.rng);
    });
    save(DAILY_KEY, daily);
    return picks.map((p, i) => {
      const c = daily.cfg[i];
      const base = {
        tier: LABELS[i],
        goal: c.goal,
        reward: REWARDS[i],
        unique: c.kind === "unique",
      };
      if (c.kind === "tier")
        return Object.assign(base, {
          text: `Roll ${tierLabel(c.tier)} or better ${c.goal} times`,
          inc: (r) => (tierOf(r.rarity) >= c.tier ? 1 : 0),
        });
      if (c.kind === "rolls")
        return Object.assign(base, {
          text: `Roll ${c.goal} times`,
          inc: () => 1,
        });
      if (c.kind === "xp")
        return Object.assign(base, {
          text: `Earn ${n(c.goal)} XP`,
          inc: (r) => Number(r.xp || 0),
        });
      return Object.assign(base, {
        text: `Find ${c.goal} different badges today`,
        inc: () => 0,
      });
    });
  }

  function ensureDay() {
    const today = utcKey();
    if (daily.date !== today) {
      daily.date = today;
      daily.p = [0, 0, 0];
      daily.done = [false, false, false];
      daily.names = [];
      daily.cfg = null;
      daily.cleared = false;
      save(DAILY_KEY, daily);
    }
  }

  function currentStreak() {
    return daily.lastClear === utcKey() || daily.lastClear === yesterdayKey()
      ? daily.streak
      : 0;
  }

  function giveXP(amount) {
    try {
      const cap = typeof G.drGetCap === "function" ? G.drGetCap() : Infinity;
      xpBalance = Math.min(cap, getXPBalance() + amount);
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
      if (typeof G.updateShopUI === "function") updateShopUI();
    } catch (e) {}
  }

  function updateDaily(r) {
    ensureDay();
    const ch = todaysChallenges();
    ch.forEach((c, i) => {
      if (daily.done[i]) return;
      if (c.unique) {
        (r.badges || []).forEach((b) => {
          const nm = typeof b === "string" ? b : b.name;
          if (!daily.names.includes(nm)) daily.names.push(nm);
        });
        daily.p[i] = daily.names.length;
      } else {
        daily.p[i] += c.inc(r) || 0;
      }
      if (daily.p[i] >= c.goal) {
        daily.p[i] = c.goal;
        daily.done[i] = true;
        const reward =
          c.reward *
          (typeof G.drEventDaily === "function" ? G.drEventDaily() : 1);
        giveXP(reward);
        say(`🎯 Daily challenge complete: ${c.text} (+${n(reward)} XP)`);
        sfx("newbadge");
      }
    });

    if (!daily.cleared && daily.done.every(Boolean)) {
      daily.cleared = true;
      daily.streak = daily.lastClear === yesterdayKey() ? daily.streak + 1 : 1;
      daily.lastClear = utcKey();
      prestige.earned += 1;
      save(PRESTIGE_KEY, prestige);
      say(
        `🔥 All daily challenges cleared! +1 ★ prestige point • ${daily.streak}-day streak`,
      );
      sfx("rebirth");
    }
    save(DAILY_KEY, daily);
  }

  /* ==========================================================
     PRESTIGE SHOP (points survive true rebirths)
     ========================================================== */

  const PRESTIGE_KEY = "digitRollPrestige";
  let prestige = load(PRESTIGE_KEY, {
    earned: 0,
    spent: 0,
    credited: 0,
    perks: {},
  });
  prestige.perks = prestige.perks || {};

  const PERKS = [
    {
      id: "head",
      name: "🚀 Head Start",
      costs: [2, 4, 8],
      desc: (l) =>
        `Every rebirth starts with XP Charm ${ROMAN[l]} (×${[1.5, 2, 3][l - 1]}) already owned.`,
    },
    {
      id: "capmem",
      name: "📦 Cap Memory",
      costs: [3, 6, 10],
      desc: (l) =>
        `Every rebirth starts with ${l} XP cap upgrade${l > 1 ? "s" : ""} already bought.`,
    },
    {
      id: "digmem",
      name: "🔢 Digit Memory",
      costs: [3, 6],
      desc: (l) =>
        `Every rebirth starts with ${l} number upgrade${l > 1 ? "s" : ""} already bought.`,
    },
    {
      id: "skipmem",
      name: "⏭ Skip Memory",
      costs: [2],
      desc: () => "Keep Skip Wait after every rebirth.",
    },
    {
      id: "boost",
      name: "💎 Prestige Boost",
      costs: [2, 3, 4, 5, 6],
      desc: (l) =>
        `+${l * 10}% XP on every roll, forever (stacks with XP charms).`,
    },
  ];
  const perkLvl = (id) => Number(prestige.perks[id] || 0);
  const points = () => prestige.earned - prestige.spent;

  /* credit points for rebirths done so far (rebirth #k gives k points) */
  function creditRebirths(count) {
    let changed = false;
    while (prestige.credited < count) {
      prestige.credited++;
      prestige.earned += prestige.credited;
      changed = true;
    }
    if (changed) save(PRESTIGE_KEY, prestige);
    return changed;
  }

  G.drPrestigeBoost = function () {
    const ms =
      typeof G.drMilestoneBoost === "function" ? G.drMilestoneBoost() : 1;
    return (1 + 0.1 * perkLvl("boost")) * ms;
  };

  /* called by shop-ui when a true rebirth happens */
  G.drPrestigeOnRebirth = function (fresh, next) {
    const before = prestige.earned;
    creditRebirths(next);
    const gained = prestige.earned - before;
    fresh.xpCharm = Math.min(3, perkLvl("head"));
    fresh.capLvl = perkLvl("capmem");
    fresh.numUp = perkLvl("digmem");
    fresh.skip = perkLvl("skipmem") > 0;
    if (gained)
      say(
        `★ +${gained} prestige point${gained > 1 ? "s" : ""} for rebirth #${next}`,
      );
  };

  function buyPerk(id) {
    const p = PERKS.find((x) => x.id === id);
    if (!p) return;
    const lvl = perkLvl(id);
    if (lvl >= p.costs.length) return;
    const cost = p.costs[lvl];
    if (points() < cost) {
      say("Not enough prestige points.");
      sfx("error");
      return;
    }
    prestige.spent += cost;
    prestige.perks[id] = lvl + 1;
    save(PRESTIGE_KEY, prestige);
    sfx("buy");
    say(`★ ${p.name} ${ROMAN[lvl + 1] || lvl + 1} bought.`);
    /* perks that matter right now */
    if (id === "boost" && typeof G.updateShopUI === "function") updateShopUI();
    render();
  }

  /* ==========================================================
     RECORDING (called from script.js for every roll)
     ========================================================== */

  G.drRecordRoll = function (result) {
    try {
      seedStats();
      addToStats(result, false);
      save(STATS_KEY, stats);
      updateDaily(result);
      rollHooks.forEach((fn) => {
        try {
          fn(result);
        } catch (e) {}
      });
      if (open) render();
    } catch (e) {
      console.warn("progress tracking failed", e);
    }
  };

  /* ==========================================================
     UI
     ========================================================== */

  let open = false;
  let tab = "daily";
  const extraTabs = [];
  const rollHooks = [];

  function injectCSS() {
    if ($id("pgCSS")) return;
    const st = document.createElement("style");
    st.id = "pgCSS";
    st.textContent = `
      .pgOv{position:fixed;inset:0;z-index:9997;display:none;padding:30px 18px;overflow:auto;background:rgba(0,0,0,.76);backdrop-filter:blur(12px)}
      .pgOv.open{display:block}
      .pgPage{width:min(960px,100%);margin:50px auto;background:rgba(18,23,34,.97);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:26px;box-shadow:0 30px 100px rgba(0,0,0,.55);color:#fff}
      .pgHead{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:16px}
      .pgTitle{font-size:28px;font-weight:900}
      .pgClose{border:0;background:rgba(255,255,255,.08);color:#fff;width:40px;height:40px;border-radius:12px;cursor:pointer;font-size:22px}
      .pgTabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
      .pgTab{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;padding:9px 16px;border-radius:12px;cursor:pointer;font-weight:800}
      .pgTab.on{background:rgba(142,230,173,.18);border-color:rgba(142,230,173,.5)}
      .pgBanner{padding:14px 16px;border-radius:16px;background:rgba(142,230,173,.08);border:1px solid rgba(142,230,173,.18);margin-bottom:16px;font-weight:800;line-height:1.5}
      .pgSub{color:#aab5ca;font-weight:600;font-size:14px}
      .pgGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
      .pgCard{padding:16px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08)}
      .pgCard h3{margin:0 0 6px;font-size:17px}
      .pgCard p{margin:6px 0;color:#aab5ca;line-height:1.45}
      .pgCard.done{border-color:rgba(142,230,173,.5);background:rgba(142,230,173,.07)}
      .pgTag{display:inline-block;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.1);margin-bottom:8px}
      .pgBar{height:10px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin:10px 0 4px}
      .pgBar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7aa2ff,#8ee6ad)}
      .pgBtn{width:100%;border:0;border-radius:11px;padding:11px;cursor:pointer;font-weight:850;background:rgba(142,230,173,.16);color:#fff;margin-top:10px}
      .pgBtn:disabled{opacity:.45;cursor:not-allowed}
      .pgH{margin:24px 0 10px;font-size:18px;font-weight:900}
      .pgTiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
      .pgTile{padding:14px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08)}
      .pgTile b{display:block;font-size:22px;margin-top:4px}
      .pgTile span{color:#aab5ca;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .pgChart{width:100%;height:150px;display:block}
      .pgRow{display:grid;grid-template-columns:120px 1fr 70px;gap:10px;align-items:center;margin:5px 0;font-size:13px;font-weight:700}
      @media(max-width:650px){.pgPage{margin:20px auto;padding:18px}.pgRow{grid-template-columns:90px 1fr 56px}}
    `;
    document.head.appendChild(st);
  }

  function ensureOverlay() {
    injectCSS();
    if ($id("pgOverlay")) return;
    const ov = document.createElement("div");
    ov.id = "pgOverlay";
    ov.className = "pgOv";
    ov.innerHTML = `<div class="pgPage" role="dialog" aria-modal="true">
        <div class="pgHead"><div class="pgTitle">🎯 Progress</div><button class="pgClose" id="pgClose" type="button">×</button></div>
        <div class="pgTabs" id="pgTabs"></div>
        <div id="pgBody"></div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
    $id("pgClose").onclick = close;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
    });
  }

  function openPage(t) {
    ensureOverlay();
    if (t) tab = t;
    open = true;
    creditRebirths(
      typeof G.__drShop !== "undefined" ? G.__drShop.S.rebirths : 0,
    );
    $id("pgOverlay").classList.add("open");
    sfx("open");
    render();
  }
  function close() {
    open = false;
    const ov = $id("pgOverlay");
    if (ov) ov.classList.remove("open");
    sfx("close");
  }
  G.drOpenProgress = openPage;

  function render() {
    if (!open) return;
    ensureDay();
    const tabs = [
      ["daily", "🎯 Daily"],
      ["stats", "📈 Stats"],
      ["prestige", "★ Prestige"],
    ].concat(
      extraTabs
        .filter((t) => !t.visible || t.visible())
        .map((t) => [t.key, t.label]),
    );
    if (!tabs.some((t) => t[0] === tab)) tab = "daily";
    $id("pgTabs").innerHTML = tabs
      .map(
        ([k, l]) =>
          `<button class="pgTab ${tab === k ? "on" : ""}" data-t="${k}" type="button">${l}${k === "prestige" ? ` (${points()})` : ""}</button>`,
      )
      .join("");
    $id("pgTabs")
      .querySelectorAll(".pgTab")
      .forEach((b) => {
        b.onclick = () => {
          tab = b.dataset.t;
          sfx("click");
          render();
        };
      });
    const extra = extraTabs.find((t) => t.key === tab);
    $id("pgBody").innerHTML = extra
      ? extra.render()
      : tab === "daily"
        ? renderDaily()
        : tab === "stats"
          ? renderStats()
          : renderPrestige();
    $id("pgBody")
      .querySelectorAll("[data-perk]")
      .forEach((b) => (b.onclick = () => buyPerk(b.dataset.perk)));
    if (extra && extra.bind) extra.bind($id("pgBody"));
  }

  function renderDaily() {
    const ch = todaysChallenges();
    const streak = currentStreak();
    const cards = ch
      .map((c, i) => {
        const pct = Math.min(100, Math.round((daily.p[i] / c.goal) * 100));
        return `<div class="pgCard ${daily.done[i] ? "done" : ""}">
          <span class="pgTag">${c.tier}</span>
          <h3>${c.text}</h3>
          <div class="pgBar"><i style="width:${pct}%"></i></div>
          <p>${n(daily.p[i])} / ${n(c.goal)} ${daily.done[i] ? "✓ Complete" : ""}</p>
          <p>Reward: <b>${n(c.reward)} XP</b> (limited by your XP cap)</p>
        </div>`;
      })
      .join("");
    return `<div class="pgBanner">New challenges every day at <b>${resetTimeText()}</b> your time (00:00 UTC, same moment for everyone).<br>
        <span class="pgSub">Clear all three for +1 ★ prestige point. 🔥 Streak: <b>${streak}</b> day${streak === 1 ? "" : "s"}${daily.cleared ? " • Today cleared ✓" : ""}</span></div>
      <div class="pgGrid">${cards}</div>`;
  }

  function lineChart(values, color) {
    const W = 600,
      H = 150,
      pad = 18;
    const max = Math.max(1, ...values);
    const bw = (W - pad * 2) / values.length;
    const bars = values
      .map((v, i) => {
        const h = (v / max) * (H - pad * 2);
        return `<rect x="${(pad + i * bw + 3).toFixed(1)}" y="${(H - pad - h).toFixed(1)}" width="${(bw - 6).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${color}"><title>${n(v)}</title></rect>`;
      })
      .join("");
    return `<svg class="pgChart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="rgba(255,255,255,.2)"/>
      <text x="${pad}" y="12" fill="#aab5ca" font-size="11">max ${n(max)}</text>${bars}</svg>`;
  }

  function renderStats() {
    seedStats();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(dayKey(d));
    }
    const rollsSeries = days.map((d) =>
      stats.days[d] ? stats.days[d].rolls : 0,
    );
    const xpSeries = days.map((d) => (stats.days[d] ? stats.days[d].xp : 0));
    const played = Object.keys(stats.days).length;
    const unlocked =
      typeof getUnlockedBadgeNames === "function"
        ? getUnlockedBadgeNames().size
        : 0;
    const catalog =
      typeof staticBadgeCatalog !== "undefined"
        ? Object.keys(staticBadgeCatalog).length
        : 0;
    const rb = G.__drShop ? G.__drShop.S.rebirths : 0;

    const tile = (l, v) =>
      `<div class="pgTile"><span>${l}</span><b>${v}</b></div>`;
    const tiles = [
      tile("Total rolls", n(stats.rolls)),
      tile("Total XP earned", n(stats.xp)),
      tile(
        "Avg XP / roll",
        stats.rolls ? n(Math.round(stats.xp / stats.rolls)) : "—",
      ),
      tile(
        "Rolls with badges",
        stats.rolls
          ? Math.round((stats.badgeRolls / stats.rolls) * 100) + "%"
          : "—",
      ),
      tile("Badges unlocked", `${n(unlocked)} / ${n(catalog)}`),
      tile("Days played", n(played)),
      tile("Rebirths", n(rb)),
      tile("Daily streak", n(currentStreak())),
    ].join("");

    const best = stats.best
      ? `<div class="pgBanner">🏆 Rarest roll: <b>${stats.best.roll}</b> — ${stats.best.rarity} • 1 in ${n(stats.best.oneIn)}</div>`
      : "";

    const rar = Object.entries(stats.rarity).sort(
      (a, b) => tierOf(b[0]) - tierOf(a[0]),
    );
    const top = Math.max(1, ...rar.map((r) => r[1]));
    const rows = rar
      .map(
        ([name, c]) =>
          `<div class="pgRow"><span>${name}</span><div class="pgBar" style="margin:0"><i style="width:${Math.max(2, (c / top) * 100)}%"></i></div><span>${n(c)}</span></div>`,
      )
      .join("");

    return `${best}<div class="pgTiles">${tiles}</div>
      <div class="pgH">Rolls per day (last 14 days)</div>${lineChart(rollsSeries, "#7aa2ff")}
      <div class="pgH">XP earned per day (last 14 days)</div>${lineChart(xpSeries, "#8ee6ad")}
      <div class="pgH">Rarity breakdown</div>${rows || '<p class="pgSub">Roll a few times to see your breakdown.</p>'}`;
  }

  function renderPrestige() {
    const cards = PERKS.map((p) => {
      const lvl = perkLvl(p.id);
      const maxed = lvl >= p.costs.length;
      const cost = p.costs[lvl];
      const can = !maxed && points() >= cost;
      return `<div class="pgCard ${maxed ? "done" : ""}">
        <h3>${p.name}</h3>
        <p>${p.desc(maxed ? lvl : lvl + 1)}</p>
        <p>Level <b>${lvl}</b> / ${p.costs.length}${maxed ? "" : ` • Cost: <b>${cost} ★</b>`}</p>
        <button class="pgBtn" data-perk="${p.id}" ${can ? "" : "disabled"}>${maxed ? "✓ Maxed" : can ? "Buy" : "Not enough ★"}</button>
      </div>`;
    }).join("");
    return `<div class="pgBanner">★ Prestige points: <b>${points()}</b><br>
      <span class="pgSub">Earn them from true rebirths (rebirth #N gives N points) and by clearing all three daily challenges (+1). Perks are permanent and are <b>not</b> reset by rebirth.</span></div>
      <div class="pgGrid">${cards}</div>`;
  }

  /* ---------- extension API for other scripts ---------- */
  G.drProgress = {
    addTab: (key, label, renderFn, bindFn, visibleFn) =>
      extraTabs.push({
        key,
        label,
        render: renderFn,
        bind: bindFn,
        visible: visibleFn,
      }),
    onRoll: (fn) => rollHooks.push(fn),
    rerender: () => render(),
    isOpen: () => open,
    close: () => close(),
    stats: () => stats,
    daily: () => daily,
    currentStreak,
    addPoints: (v) => {
      prestige.earned += v;
      save(PRESTIGE_KEY, prestige);
    },
    open: openPage,
    tierOf,
    TIERS,
    dayKey,
  };

  /* ---------- nav button ---------- */

  function ensureButton() {
    const nav = $id("digitRollNav");
    if (!nav) return false;
    if (!$id("pgNavButton")) {
      const b = document.createElement("button");
      b.id = "pgNavButton";
      b.className = "drNavBtn";
      b.type = "button";
      b.textContent = "🎯 Progress";
      b.onclick = () => openPage();
      nav.insertBefore(b, nav.children[2] || null);
    }
    return true;
  }

  let tries = 0;
  const boot = setInterval(() => {
    tries++;
    if (ensureButton() || tries > 40) clearInterval(boot);
  }, 150);

  /* make sure nothing breaks when other pages close */
  seedStats();
  ensureDay();
  creditRebirths(G.__drShop ? G.__drShop.S.rebirths : 0);
})();
