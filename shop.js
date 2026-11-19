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

  const NUMBER_CHARM_COST = 250;
  const LUCKY_CHARM_COST = 400;
  const SKIP_COST = 1000;
  const AUTO_COST = 10000;

  const NUM_UPGRADE_COSTS = [500, 1500, 3500, 7000, 10000]; // 5 -> 10 digits

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
    gloves: 0, // permanent lucky gloves level
    numUp: 0, // number upgrades bought
    capLvl: 0, // xp cap upgrades bought
    skip: false,
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
        const gap = fast ? (next === 0 ? 350 : 90) : 900;

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

  /* Skip button + auto skip switch under the roll button */
  function ensureRollTools() {
    const rb = $("rollBtn");
    if (!rb) return;

    let wrap = $("drRollTools");

    if (!S.skip) {
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
      '<button id="drSkipBtn" class="drToolBtn" type="button" disabled>⏭ Skip wait</button>' +
      (S.auto
        ? `<button id="drAutoBtn" class="drToolBtn ${S.autoOn ? "on" : ""}" type="button">⏩ Auto skip: ${S.autoOn ? "ON" : "OFF"}</button>`
        : "");

    const sb = $("drSkipBtn");
    sb.disabled = !rolling;
    sb.onclick = () => {
      if (!rolling) return;
      skipFlag = true;
      sb.disabled = true;
    };

    const ab = $("drAutoBtn");
    if (ab) ab.onclick = () => G.drToggleAuto();
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
      NUMBER_CHARM_COST,
      LUCKY_CHARM_COST,
      SKIP_COST,
      AUTO_COST,
      NUM_UPGRADE_COSTS,
      GLOVES,
      REBIRTH_COLORS,
      MAX_LEN,
      BASE_LEN,
    },
  };
})();
