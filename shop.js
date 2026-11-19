/* ============================================================
   DIGIT ROLL — SHOP (v2)
   Number charms, number upgrades, lucky charm/gloves, XP cap,
   skip wait, auto skip, true rebirth, rolling animation,
   rebirth name colours.
   Loaded after script.js and extras.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;

  /* ==========================================================
     CONFIG
     ========================================================== */

  const KEY = "digitRollShop2";

  const BASE_CAP = 10000;
  const CAP_STEP = 10000;
  const BASE_MAX_CAP = 100000;
  const REBIRTH_STEP = 100000;

  const BASE_LEN = 5;
  const MAX_LEN = 10;

  /* Number charm prices come from a simulation: for each digit, ~120,000
     rolls (5, 7 and 10 digits) with that digit guaranteed, counting how many
     "good" badges (1 in 10,000 or rarer) show up per roll. Prices scale that
     score linearly from 10,000 XP (worst digit) to 90,000 XP (best digit). */
  const CHARM_VALUE = {
    1: 0.933,
    2: 0.898,
    3: 0.817,
    4: 0.817,
    5: 0.7,
    6: 0.93,
    7: 0.749,
    8: 0.686,
    9: 0.766,
  };
  const NUMBER_CHARM_COSTS = {
    1: 90000,
    2: 79000,
    3: 52000,
    4: 52000,
    5: 14000,
    6: 89000,
    7: 30000,
    8: 10000,
    9: 36000,
  };
  const LUCKY_CHARM_COST = 400;
  const SKIP_COST = 1000;
  const AUTO_COST = 10000;
  const AUTO_ROLL_COST = 15000;
  const AUTO_STOP_COST = 5000;
  const HOTKEY_COST = 1500;
  const FAST_REVEAL_COST = 4000;
  const AUTO_ROLL_DELAY = 800; // ms between auto rolls

  const NUM_UPGRADE_COSTS = [500, 1500, 3500, 7000, 10000]; // 5 -> 10 digits

  /* Permanent XP multiplier charms, bought in order. Your multiplier is the
     best one you own (they do not multiply together). */
  const XP_CHARMS = [
    { mult: 1.5, cost: 5000, name: "✨ XP Charm I" },
    { mult: 2, cost: 10000, name: "✨ XP Charm II" },
    { mult: 3, cost: 20000, name: "💫 XP Charm III" },
    { mult: 4, cost: 35000, name: "💫 XP Charm IV" },
    { mult: 5, cost: 50000, name: "🌟 XP Charm V" },
    { mult: 6, cost: 65000, name: "🌟 XP Charm VI" },
    { mult: 8, cost: 85000, name: "⭐ XP Charm VII" },
    { mult: 10, cost: 100000, name: "👑 XP Charm VIII" },
  ];

  const GLOVES = [
    { cost: 20000, name: "🧤 Lucky Gloves I" },
    { cost: 30000, name: "🧤 Lucky Gloves II" },
    { cost: 50000, name: "🥊 Lucky Gloves III" },
    { cost: 75000, name: "🥊 Lucky Gloves IV" },
    { cost: 100000, name: "👑 Lucky Gloves V" },
  ];

  /* rebirth 1..7 = violet, indigo, blue, green, yellow, orange, red.
     8+ = constant smooth rainbow. */
  const REBIRTH_COLORS = [
    ["Purple", "#a855f7"],
    ["Indigo", "#6366f1"],
    ["Blue", "#3b82f6"],
    ["Green", "#22c55e"],
    ["Yellow", "#facc15"],
    ["Orange", "#fb923c"],
    ["Red", "#ef4444"],
  ];

  /* ==========================================================
     STATE
     ========================================================== */

  const fresh = () => ({
    charms: [], // digits 1-9 armed for the next roll
    lucky: 0, // consumable lucky charms in stock
    xpCharm: 0, // permanent XP charm tiers owned (0-8)
    gloves: 0, // permanent lucky gloves level
    numUp: 0, // number upgrades bought
    capLvl: 0, // xp cap upgrades bought
    skip: false,
    autoRoll: false, // auto roll unlocked
    autoRollOn: false,
    autoStop: false, // auto stop unlocked
    autoStopOn: true, // auto stop switch
    hotkey: false, // Space rolls
    fastReveal: false, // digits lock in twice as fast
    auto: false,
    autoOn: false,
    rebirths: 0,
  });

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && typeof raw === "object") return Object.assign(fresh(), raw);
    } catch (e) {}
    return fresh();
  }

  let S = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  }

  /* ---------- derived values ---------- */

  const maxCap = () => BASE_MAX_CAP + REBIRTH_STEP * S.rebirths;
  const getCap = () => Math.min(BASE_CAP + CAP_STEP * S.capLvl, maxCap());
  const capMaxed = () => getCap() >= maxCap();
  const capUpgradePrice = () => getCap() - 5000;
  /* 5 upgrades (5 -> 10 digits) + 1 more per rebirth */
  const maxUpgrades = () => NUM_UPGRADE_COSTS.length + S.rebirths;
  const maxLength = () => BASE_LEN + maxUpgrades();
  const numUpgradeCost = (i) =>
    i < NUM_UPGRADE_COSTS.length
      ? NUM_UPGRADE_COSTS[i]
      : 10000 + 5000 * (i - NUM_UPGRADE_COSTS.length + 1);
  const rollLength = () => Math.min(maxLength(), BASE_LEN + S.numUp);
  const rebirthCost = () => REBIRTH_STEP * (S.rebirths + 1);

  const skipping = () => skipFlag;
  let skipFlag = false;

  /* ---------- globals used by script.js ---------- */

  G.drGetCap = getCap;
  G.drRollLength = rollLength;
  G.drSkipping = skipping;

  /* Called once per roll by applyGuaranteedBadges */
  /* XP multiplier from the best XP charm owned */
  G.drXPMultiplier = function () {
    return S.xpCharm > 0
      ? XP_CHARMS[Math.min(S.xpCharm, XP_CHARMS.length) - 1].mult
      : 1;
  };

  G.drLuckCount = function () {
    const count = S.gloves + (S.lucky > 0 ? 1 : 0);
    if (S.lucky > 0) S.lucky--;
    save();
    return count;
  };

  /* Put armed number charms into the roll */
  G.drApplyCharms = function (chars) {
    const applied = [];
    const left = [];
    const used = new Set();

    for (const d of S.charms) {
      const ch = String(d);
      let idx = chars.findIndex((c, i) => c === ch && !used.has(i));

      if (idx < 0) {
        const free = chars.map((_, i) => i).filter((i) => !used.has(i));
        if (!free.length) {
          left.push(d); // no room: keep it for the next roll
          continue;
        }
        idx = free[Math.floor(Math.random() * free.length)];
        chars[idx] = ch;
      }

      used.add(idx);
      applied.push(d);
    }

    if (applied.length) {
      S.charms = left;
      save();
      toast(
        "🔢 Number charm" +
          (applied.length > 1 ? "s" : "") +
          " used: " +
          applied.join(", "),
      );
    }

    return applied;
  };

  /* ==========================================================
     ROLL FLOW HELPERS
     ========================================================== */

  G.drBeginRoll = function () {
    skipFlag = !!(S.skip && S.auto && S.autoOn);
    const b = $("drSkipBtn");
    if (b) b.disabled = skipFlag;
  };

  G.drEndRoll = function () {
    skipFlag = false;
    const b = $("drSkipBtn");
    if (b) b.disabled = true;

    if (S.autoRoll && S.autoRollOn) {
      const last = typeof history !== "undefined" ? history[0] : null;
      if (
        S.autoStop &&
        S.autoStopOn &&
        last &&
        Number(last.oneIn || 0) >= 10000
      ) {
        S.autoRollOn = false;
        save();
        syncRollUI();
        toast("🛑 Auto roll stopped: good badge found!");
        if (typeof drSfx === "function") drSfx("newbadge");
        if (typeof updateShopUI === "function") updateShopUI();
        return;
      }
      setTimeout(() => {
        if (S.autoRoll && S.autoRollOn && !rolling) performRoll();
      }, AUTO_ROLL_DELAY);
    }
  };

  /* Wait that ends early when skip is pressed */
  G.drWait = function (ms) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const iv = setInterval(() => {
        if (skipFlag || performance.now() - t0 >= ms) {
          clearInterval(iv);
          resolve();
        }
      }, 40);
    });
  };

  /* ==========================================================
     ROLLING ANIMATION
     Unlocked digits spin like a slot machine, locked digits pop.
     ========================================================== */

  G.drRunReveal = function (finalChars) {
    const box = $("number");
    const n = finalChars.length;

    return new Promise((resolve) => {
      box.innerHTML = finalChars
        .map(() => '<span class="dig dSpin">0</span>')
        .join("");
      const spans = Array.from(box.children);
      const locked = new Array(n).fill(false);

      const spin = setInterval(() => {
        for (let i = 0; i < n; i++) {
          if (!locked[i]) spans[i].textContent = Math.floor(Math.random() * 10);
        }
      }, 65);

      let next = 0;
      let last = performance.now();

      const loop = setInterval(() => {
        const fast = skipFlag;
        const gap = fast ? (next === 0 ? 350 : 90) : S.fastReveal ? 450 : 900;

        if (performance.now() - last < gap) return;

        spans[next].textContent = finalChars[next];
        spans[next].className = "dig dLock";
        locked[next] = true;
        next++;
        last = performance.now();

        if (next >= n) {
          clearInterval(spin);
          clearInterval(loop);
          resolve();
        }
      }, 30);
    });
  };

  /* Skip / auto skip / auto roll buttons under the roll button */
  function ensureRollTools() {
    const rb = $("rollBtn");
    if (!rb) return;

    let wrap = $("drRollTools");

    if (!S.skip && !S.autoRoll) {
      if (wrap) wrap.remove();
      return;
    }

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "drRollTools";
      wrap.className = "drRollTools";
      rb.insertAdjacentElement("afterend", wrap);
    }

    wrap.innerHTML =
      (S.skip
        ? '<button id="drSkipBtn" class="drToolBtn" type="button" disabled>⏭ Skip wait</button>'
        : "") +
      (S.skip && S.auto
        ? `<button id="drAutoBtn" class="drToolBtn ${S.autoOn ? "on" : ""}" type="button">⏩ Auto skip: ${S.autoOn ? "ON" : "OFF"}</button>`
        : "") +
      (S.autoRoll && S.autoStop
        ? `<button id="drAutoStopBtn" class="drToolBtn ${S.autoStopOn ? "on" : ""}" type="button">🛑 Auto stop: ${S.autoStopOn ? "ON" : "OFF"}</button>`
        : "") +
      (S.autoRoll
        ? `<button id="drAutoRollBtn" class="drToolBtn ${S.autoRollOn ? "on" : ""}" type="button">🔁 Auto roll: ${S.autoRollOn ? "ON" : "OFF"}</button>`
        : "");

    const sb = $("drSkipBtn");
    if (sb) {
      sb.disabled = !rolling;
      sb.onclick = () => {
        if (!rolling) return;
        skipFlag = true;
        sb.disabled = true;
      };
    }

    const ab = $("drAutoBtn");
    if (ab) ab.onclick = () => G.drToggleAuto();

    const asb = $("drAutoStopBtn");
    if (asb) asb.onclick = () => G.drToggleAutoStop();

    const arb = $("drAutoRollBtn");
    if (arb) arb.onclick = () => G.drToggleAutoRoll();
  }

  function initNumberPlaceholder() {
    const box = $("number");
    if (!box || rolling) return;
    if (/^\?*$/.test(box.textContent.trim())) {
      box.textContent = "?".repeat(rollLength());
    }
  }

  function syncRollUI() {
    ensureRollTools();
    initNumberPlaceholder();
  }

  G.drToggleAutoStop = function () {
    if (!S.autoStop) return;
    S.autoStopOn = !S.autoStopOn;
    save();
    syncRollUI();
    updateShopUI();
    toast("🛑 Auto stop " + (S.autoStopOn ? "enabled" : "disabled"));
  };

  G.drToggleAutoRoll = function () {
    if (!S.autoRoll) return;
    S.autoRollOn = !S.autoRollOn;
    save();
    syncRollUI();
    updateShopUI();
    toast("🔁 Auto roll " + (S.autoRollOn ? "enabled" : "disabled"));
    if (S.autoRollOn && !rolling) performRoll();
  };

  /* Space bar rolls (after buying the hotkey) */
  document.addEventListener("keydown", (e) => {
    if (!S.hotkey || e.code !== "Space" || e.repeat) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;
    const ov = document.querySelector(".open");
    if (ov) return; // a page/modal is open
    e.preventDefault();
    if (!rolling) performRoll();
  });

  G.drToggleAuto = function () {
    if (!S.auto) return;
    S.autoOn = !S.autoOn;
    save();
    syncRollUI();
    updateShopUI();
    toast("⏩ Auto skip " + (S.autoOn ? "enabled" : "disabled"));
  };

  /* ---- exported for part 2 (shop page, buying, names) ---- */
  G.__drShop = {
    get S() {
      return S;
    },
    set S(v) {
      S = v;
    },
    fresh,
    save,
    maxCap,
    getCap,
    capMaxed,
    capUpgradePrice,
    rollLength,
    maxUpgrades,
    maxLength,
    numUpgradeCost,
    rebirthCost,
    syncRollUI,
    CONFIG: {
      NUMBER_CHARM_COSTS,
      CHARM_VALUE,
      LUCKY_CHARM_COST,
      SKIP_COST,
      AUTO_COST,
      AUTO_ROLL_COST,
      AUTO_STOP_COST,
      HOTKEY_COST,
      FAST_REVEAL_COST,
      NUM_UPGRADE_COSTS,
      GLOVES,
      XP_CHARMS,
      REBIRTH_COLORS,
      MAX_LEN,
      BASE_LEN,
    },
  };
})();
