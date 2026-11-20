/* ============================================================
   DIGIT ROLL — SHOP UI, BUYING, REBIRTH, NAME COLOURS
   Loaded after shop.js
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const SH = G.__drShop;
  if (!SH) return;

  const C = SH.CONFIG;
  const S = () => SH.S;
  const n = (v) => Number(v).toLocaleString();

  /* ==========================================================
     SHOP PAGE
     ========================================================== */

  function card(title, desc, priceLine, btn) {
    return `<div class="drShopItem">
      <h3>${title}</h3>
      <p>${desc}</p>
      ${priceLine ? `<p>${priceLine}</p>` : ""}
      ${btn}
    </div>`;
  }

  function buyBtn(label, kind, arg, disabled) {
    const a = arg === undefined ? "" : "," + JSON.stringify(arg);
    return `<button class="drBuy" ${disabled ? "disabled" : ""} onclick='drBuy(${JSON.stringify(kind)}${a})'>${label}</button>`;
  }

  const section = (title, sub, body) =>
    `<h3 class="drSection">${title}</h3>${sub ? `<div class="drSectionSub">${sub}</div>` : ""}<div class="drShopGrid">${body}</div>`;

  G.drRenderShop = function (content) {
    const s = S();
    const balance = getXPBalance();
    const cap = SH.getCap();
    const afford = (cost) => balance >= cost;
    const len = SH.rollLength();

    let html = `<div class="drBalance">
      💰 XP: ${n(balance)} / ${n(cap)}${balance >= cap ? " (full)" : ""}<br>
      <span class="drBalanceSub">🔢 ${len} digits per roll • 🧤 Gloves ${s.gloves}/${C.GLOVES.length} • 🍀 Lucky charms ${s.lucky} • ✨ XP ×${drXPMultiplier()} • 🔄 Rebirths ${s.rebirths}</span>
    </div>`;

    const disc =
      typeof G.drEventCharmDiscount === "function"
        ? G.drEventCharmDiscount()
        : 1;
    const sale =
      disc < 1
        ? ` <b style="color:#8ee6ad">(${Math.round((1 - disc) * 100)}% off event!)</b>`
        : "";
    const cp = (p) => Math.round(p * disc);

    /* ---- number charms ---- */
    let charms = "";
    for (let d = 1; d <= 9; d++) {
      const armed = s.charms.filter((x) => x === d).length;
      const price = cp(C.NUMBER_CHARM_COSTS[d]);
      charms += card(
        `<span class="drBigDigit">${d}</span> Number Charm`,
        `Guarantees a <b>${d}</b> on your next roll. Stack several to guarantee several <b>${d}</b>s. Armed: <b>${armed}</b>.<br><span class="drBalanceSub">Strong badges per roll with this digit: ~${C.CHARM_VALUE[d].toFixed(2)}</span>`,
        `Cost: <b>${n(price)} XP</b> each${sale}`,
        buyBtn(
          afford(price)
            ? armed
              ? "Buy another"
              : "Buy"
            : balance < price && cap < price
              ? "Raise your XP cap first"
              : "Not enough XP",
          "charm",
          d,
          !afford(price),
        ),
      );
    }
    html += section(
      "🔢 Number Charms",
      "One use each, and they stack: two 7 charms guarantee two 7s. Priced by how many strong badges (1 in 10,000 or rarer) each digit tends to produce. Prices above your XP cap need cap upgrades first.",
      charms,
    );

    /* ---- xp charms ---- */
    let xpc = "";
    C.XP_CHARMS.forEach((c, i) => {
      const lvl = i + 1;
      const owned = s.xpCharm >= lvl;
      const next = lvl === s.xpCharm + 1;
      const label = owned
        ? "✓ Purchased"
        : !next
          ? "Buy the previous XP charm first"
          : afford(c.cost)
            ? "Buy"
            : balance < c.cost && cap < c.cost
              ? "Raise your XP cap first"
              : "Not enough XP";
      xpc += card(
        c.name,
        `Permanent. Every roll earns <b>${c.mult}×</b> XP.`,
        `Cost: <b>${n(c.cost)} XP</b>`,
        buyBtn(label, "xpcharm", lvl, owned || !next || !afford(c.cost)),
      );
    });
    html += section(
      "✨ XP Charms",
      "Permanent XP multipliers from 1.5× up to 10×. Buy them in order. Your multiplier is the best one you own (they don't multiply together).",
      xpc,
    );

    /* ---- number upgrades ---- */
    const nu = s.numUp;
    const nuMax = nu >= SH.maxUpgrades();
    const nuCost = nuMax ? 0 : SH.numUpgradeCost(nu);
    html += section(
      "🔠 Number Upgrades",
      `You start with ${C.BASE_LEN} digits. Each upgrade adds 1, up to ${SH.maxLength()} (each rebirth raises the limit by 1).`,
      card(
        `Number Upgrade ${nuMax ? "(MAX)" : nu + 1 + "/" + SH.maxUpgrades()}`,
        `Currently rolling <b>${len}</b> digits.${nuMax ? "" : ` Next: <b>${len + 1}</b> digits.`}`,
        nuMax ? "" : `Cost: <b>${n(nuCost)} XP</b>`,
        buyBtn(
          nuMax ? "✓ Maxed" : afford(nuCost) ? "Buy" : "Not enough XP",
          "numUp",
          undefined,
          nuMax || !afford(nuCost),
        ),
      ),
    );

    /* ---- luck ---- */
    let luck = card(
      "🍀 Lucky Charm",
      `One extra guaranteed badge on your next roll. In stock: <b>${s.lucky}</b>.`,
      `Cost: <b>${n(cp(C.LUCKY_CHARM_COST))} XP</b>${sale}`,
      buyBtn(
        afford(cp(C.LUCKY_CHARM_COST)) ? "Buy" : "Not enough XP",
        "lucky",
        undefined,
        !afford(cp(C.LUCKY_CHARM_COST)),
      ),
    );
    luck += card(
      `🍀 Lucky Charm Bundle (×${C.LUCKY_BUNDLE_QTY})`,
      `${C.LUCKY_BUNDLE_QTY} lucky charms for 10% less than buying them one by one.`,
      `Cost: <b>${n(cp(C.LUCKY_BUNDLE_COST))} XP</b>${sale}`,
      buyBtn(
        afford(cp(C.LUCKY_BUNDLE_COST))
          ? "Buy bundle"
          : balance < cp(C.LUCKY_BUNDLE_COST) && cap < cp(C.LUCKY_BUNDLE_COST)
            ? "Raise your XP cap first"
            : "Not enough XP",
        "luckyBundle",
        undefined,
        !afford(cp(C.LUCKY_BUNDLE_COST)),
      ),
    );
    luck += card(
      "🔁 Auto Charm",
      "Before each roll, automatically re-buys the number charms you used on your last roll (if you can afford them). Has an on/off switch.",
      s.autoCharm
        ? `Status: <b>${s.autoCharmOn ? "ON" : "OFF"}</b>`
        : `Cost: <b>${n(C.AUTO_CHARM_COST)} XP</b>`,
      s.autoCharm
        ? `<button class="drBuy" onclick="drToggleAutoCharm()">${s.autoCharmOn ? "Turn OFF" : "Turn ON"}</button>`
        : buyBtn(
            afford(C.AUTO_CHARM_COST)
              ? "Buy"
              : balance < C.AUTO_CHARM_COST && cap < C.AUTO_CHARM_COST
                ? "Raise your XP cap first"
                : "Not enough XP",
            "autoCharm",
            undefined,
            !afford(C.AUTO_CHARM_COST),
          ),
    );
    C.GLOVES.forEach((g, i) => {
      const lvl = i + 1;
      const owned = s.gloves >= lvl;
      const next = lvl === s.gloves + 1;
      const label = owned
        ? "✓ Purchased"
        : !next
          ? "Buy the previous gloves first"
          : afford(g.cost)
            ? "Buy"
            : "Not enough XP";
      luck += card(
        g.name,
        "Permanent lucky charm: <b>+1</b> guaranteed badge on <b>every</b> roll.",
        `Cost: <b>${n(g.cost)} XP</b>`,
        buyBtn(label, "gloves", lvl, owned || !next || !afford(g.cost)),
      );
    });
    html += section(
      "🧤 Luck",
      "Charms are single use. Gloves are permanent and stack.",
      luck,
    );

    /* ---- xp cap ---- */
    const capMaxed = SH.capMaxed();
    const capPrice = SH.capUpgradePrice();
    html += section(
      "📦 XP Cap",
      `Your XP balance can't go above the cap. Each upgrade adds ${n(10000)} and costs 5,000 less than your current cap. Max cap right now: ${n(SH.maxCap())}.`,
      card(
        "XP Cap Upgrade",
        `Cap: <b>${n(cap)}</b>${capMaxed ? "" : ` → <b>${n(Math.min(cap + 10000, SH.maxCap()))}</b>`}`,
        capMaxed ? "" : `Cost: <b>${n(capPrice)} XP</b>`,
        buyBtn(
          capMaxed
            ? "✓ Max for now"
            : afford(capPrice)
              ? "Buy"
              : "Not enough XP",
          "cap",
          undefined,
          capMaxed || !afford(capPrice),
        ),
      ),
    );

    /* ---- speed ---- */
    let speed = card(
      "⏭ Skip Wait",
      "Adds a Skip button under the roll button. Press it mid-roll to skip waiting.",
      `Cost: <b>${n(C.SKIP_COST)} XP</b>`,
      buyBtn(
        s.skip ? "✓ Purchased" : afford(C.SKIP_COST) ? "Buy" : "Not enough XP",
        "skip",
        undefined,
        s.skip || !afford(C.SKIP_COST),
      ),
    );
    speed += card(
      "⏩ Auto Skip",
      "A switch that skips every wait automatically. Needs Skip Wait.",
      s.auto
        ? `Status: <b>${s.autoOn ? "ON" : "OFF"}</b>`
        : `Cost: <b>${n(C.AUTO_COST)} XP</b>`,
      s.auto
        ? `<button class="drBuy" onclick="drToggleAuto()">${s.autoOn ? "Turn OFF" : "Turn ON"}</button>`
        : buyBtn(
            !s.skip
              ? "Buy Skip Wait first"
              : afford(C.AUTO_COST)
                ? "Buy"
                : "Not enough XP",
            "auto",
            undefined,
            !s.skip || !afford(C.AUTO_COST),
          ),
    );
    speed += card(
      "🔁 Auto Roll",
      "A switch that keeps rolling for you, one roll after another.",
      s.autoRoll
        ? `Status: <b>${s.autoRollOn ? "ON" : "OFF"}</b>`
        : `Cost: <b>${n(C.AUTO_ROLL_COST)} XP</b>`,
      s.autoRoll
        ? `<button class="drBuy" onclick="drToggleAutoRoll()">${s.autoRollOn ? "Turn OFF" : "Turn ON"}</button>`
        : buyBtn(
            afford(C.AUTO_ROLL_COST)
              ? "Buy"
              : balance < C.AUTO_ROLL_COST && cap < C.AUTO_ROLL_COST
                ? "Raise your XP cap first"
                : "Not enough XP",
            "autoRoll",
            undefined,
            !afford(C.AUTO_ROLL_COST),
          ),
    );
    speed += card(
      "🛑 Auto Stop",
      "Auto roll pauses by itself when you land a good badge (1 in 10,000 or rarer). Needs Auto Roll.",
      s.autoStop
        ? `Status: <b>${s.autoStopOn ? "ON" : "OFF"}</b>`
        : `Cost: <b>${n(C.AUTO_STOP_COST)} XP</b>`,
      s.autoStop
        ? `<button class="drBuy" onclick="drToggleAutoStop()">${s.autoStopOn ? "Turn OFF" : "Turn ON"}</button>`
        : buyBtn(
            !s.autoRoll
              ? "Buy Auto Roll first"
              : afford(C.AUTO_STOP_COST)
                ? "Buy"
                : "Not enough XP",
            "autoStop",
            undefined,
            !s.autoRoll || !afford(C.AUTO_STOP_COST),
          ),
    );
    speed += card(
      "⚡ Fast Reveal",
      "Digits lock in twice as fast during a normal roll (0.45s instead of 0.9s).",
      `Cost: <b>${n(C.FAST_REVEAL_COST)} XP</b>`,
      buyBtn(
        s.fastReveal
          ? "✓ Purchased"
          : afford(C.FAST_REVEAL_COST)
            ? "Buy"
            : "Not enough XP",
        "fastReveal",
        undefined,
        s.fastReveal || !afford(C.FAST_REVEAL_COST),
      ),
    );
    speed += card(
      "⌨️ Space Hotkey",
      "Press the Space bar to roll.",
      `Cost: <b>${n(C.HOTKEY_COST)} XP</b>`,
      buyBtn(
        s.hotkey
          ? "✓ Purchased"
          : afford(C.HOTKEY_COST)
            ? "Buy"
            : "Not enough XP",
        "hotkey",
        undefined,
        s.hotkey || !afford(C.HOTKEY_COST),
      ),
    );
    html += section("⚡ Speed & Quality of Life", "", speed);

    /* ---- rebirth ---- */
    const rc = rebirthColorInfo(s.rebirths + 1);
    const rCost = SH.rebirthCost();
    html += `<h3 class="drSection">🔄 True Rebirth</h3>
      <div class="drRebirth">
        <p>Resets <b>everything</b> in the shop and your XP back to the start. You keep your account, name and rolls.</p>
        <p>Your leaderboard name becomes <b style="color:${rc.color}">${rc.label}</b>. From the 8th rebirth on, a rainbow gradient moves across it forever.</p>
        <p>Each rebirth makes the next one ${n(100000)} XP more expensive and raises the XP cap limit by ${n(100000)} and the number upgrade limit by 1.</p>
        <p>Cost: <b>${n(rCost)} XP</b> • Rebirths so far: <b>${s.rebirths}</b> • Needs an XP cap of at least ${n(rCost)}.</p>
        <button class="drBuy drRebirthBtn" ${afford(rCost) ? "" : "disabled"} onclick="drBuy('rebirth')">${afford(rCost) ? "Rebirth" : balance < rCost && SH.getCap() < rCost ? "Raise your XP cap first" : "Not enough XP"}</button>
      </div>`;

    content.innerHTML = html;
  };

  /* ==========================================================
     BUYING
     ========================================================== */

  function spend(cost) {
    if (getXPBalance() < cost) {
      toast("Not enough XP.");
      return false;
    }
    xpBalance = getXPBalance() - cost;
    xpSpent += cost;
    localStorage.setItem("digitRollXPBalance", String(xpBalance));
    return true;
  }

  function refresh() {
    SH.save();
    SH.syncRollUI();
    updateShopUI();
  }

  G.drBuy = function (kind, arg) {
    if (rolling) {
      toast("Wait for the roll to finish.");
      return;
    }

    const s = S();

    switch (kind) {
      case "charm": {
        if (arg < 1 || arg > 9) return;
        const dc =
          typeof G.drEventCharmDiscount === "function"
            ? G.drEventCharmDiscount()
            : 1;
        if (!spend(Math.round(C.NUMBER_CHARM_COSTS[arg] * dc))) return;
        s.charms.push(arg);
        toast(
          `🔢 Number charm ${arg} armed (${s.charms.filter((x) => x === arg).length} for your next roll).`,
        );
        break;
      }

      case "lucky": {
        const dc =
          typeof G.drEventCharmDiscount === "function"
            ? G.drEventCharmDiscount()
            : 1;
        if (!spend(Math.round(C.LUCKY_CHARM_COST * dc))) return;
        s.lucky++;
        toast("🍀 Lucky charm ready for your next roll.");
        break;
      }

      case "luckyBundle": {
        const dc =
          typeof G.drEventCharmDiscount === "function"
            ? G.drEventCharmDiscount()
            : 1;
        if (!spend(Math.round(C.LUCKY_BUNDLE_COST * dc))) return;
        s.lucky += C.LUCKY_BUNDLE_QTY;
        toast("🍀 " + C.LUCKY_BUNDLE_QTY + " lucky charms added.");
        break;
      }

      case "autoCharm": {
        if (s.autoCharm || !spend(C.AUTO_CHARM_COST)) return;
        s.autoCharm = true;
        s.autoCharmOn = true;
        toast("🔁 Auto charm unlocked.");
        break;
      }

      case "gloves": {
        if (arg !== s.gloves + 1 || arg > C.GLOVES.length) {
          toast("Buy the previous gloves first.");
          return;
        }
        if (!spend(C.GLOVES[arg - 1].cost)) return;
        s.gloves = arg;
        toast(
          `${C.GLOVES[arg - 1].name} equipped. +${arg} guaranteed badge${arg === 1 ? "" : "s"} per roll.`,
        );
        break;
      }

      case "xpcharm": {
        if (arg !== s.xpCharm + 1 || arg > C.XP_CHARMS.length) {
          toast("Buy the previous XP charm first.");
          return;
        }
        if (!spend(C.XP_CHARMS[arg - 1].cost)) return;
        s.xpCharm = arg;
        toast(
          `${C.XP_CHARMS[arg - 1].name}: all XP is now ×${C.XP_CHARMS[arg - 1].mult}.`,
        );
        break;
      }

      case "numUp": {
        if (s.numUp >= SH.maxUpgrades()) return;
        if (!spend(SH.numUpgradeCost(s.numUp))) return;
        s.numUp++;
        toast(`🔠 You now roll ${SH.rollLength()} digits.`);
        {
          const box = $("number");
          if (box) box.textContent = "?".repeat(SH.rollLength());
        }
        break;
      }

      case "cap": {
        if (SH.capMaxed()) return;
        if (!spend(SH.capUpgradePrice())) return;
        s.capLvl++;
        toast(`📦 XP cap raised to ${n(SH.getCap())}.`);
        break;
      }

      case "skip": {
        if (s.skip || !spend(C.SKIP_COST)) return;
        s.skip = true;
        toast("⏭ Skip button unlocked.");
        break;
      }

      case "auto": {
        if (!s.skip) {
          toast("Buy Skip Wait first.");
          return;
        }
        if (s.auto || !spend(C.AUTO_COST)) return;
        s.auto = true;
        s.autoOn = true;
        toast("⏩ Auto skip unlocked and turned on.");
        break;
      }

      case "autoRoll": {
        if (s.autoRoll || !spend(C.AUTO_ROLL_COST)) return;
        s.autoRoll = true;
        toast("🔁 Auto roll unlocked. Use the switch under the roll button.");
        break;
      }

      case "autoStop": {
        if (!s.autoRoll) {
          toast("Buy Auto Roll first.");
          return;
        }
        if (s.autoStop || !spend(C.AUTO_STOP_COST)) return;
        s.autoStop = true;
        s.autoStopOn = true;
        toast("🛑 Auto roll will now stop on good badges.");
        break;
      }

      case "fastReveal": {
        if (s.fastReveal || !spend(C.FAST_REVEAL_COST)) return;
        s.fastReveal = true;
        toast("⚡ Digits now lock in faster.");
        break;
      }

      case "hotkey": {
        if (s.hotkey || !spend(C.HOTKEY_COST)) return;
        s.hotkey = true;
        toast("⌨️ Press Space to roll.");
        break;
      }

      case "rebirth":
        return doRebirth();

      default:
        return;
    }

    refresh();
  };

  function doRebirth() {
    const cost = SH.rebirthCost();
    if (getXPBalance() < cost) {
      toast("Not enough XP to rebirth.");
      return;
    }

    const next = S().rebirths + 1;
    const info = rebirthColorInfo(next);

    if (
      !confirm(
        `True Rebirth #${next} costs ${n(cost)} XP.\n\n` +
          "This resets ALL shop upgrades and your XP. You keep your account, name and rolls.\n" +
          `Your name becomes ${info.label}.\n\nContinue?`,
      )
    )
      return;

    const oldXP = getXPBalance();
    const fresh = SH.fresh();
    fresh.rebirths = next;
    if (typeof G.drPrestigeOnRebirth === "function")
      G.drPrestigeOnRebirth(fresh, next);
    SH.S = fresh;

    xpBalance = 0;
    xpSpent = 0;
    shopLuckLevel = 0;
    localStorage.setItem("digitRollXPBalance", "0");
    saveShopState();
    SH.save();

    pushRebirths();
    refresh();
    updateAccountUI();
    if (typeof loadLeaderboard === "function") loadLeaderboard();

    toast(`🔄 Rebirth ${next} complete! Your name is now ${info.label}.`);

    if (typeof G.drRebirthScene === "function") {
      const inClose = typeof closeDigitRollPages === "function";
      if (inClose) closeDigitRollPages();
      const isRainbow = next > C.REBIRTH_COLORS.length;
      let hue = 280;
      if (!isRainbow) {
        const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
          info.color,
        );
        if (m) {
          const r = parseInt(m[1], 16) / 255,
            g = parseInt(m[2], 16) / 255,
            b = parseInt(m[3], 16) / 255;
          const mx = Math.max(r, g, b),
            mn = Math.min(r, g, b),
            d = mx - mn;
          if (d) {
            let h =
              mx === r
                ? ((g - b) / d) % 6
                : mx === g
                  ? (b - r) / d + 2
                  : (r - g) / d + 4;
            hue = (h * 60 + 360) % 360;
          }
        }
      }
      G.drRebirthScene({
        count: next,
        oldXP,
        hue,
        rainbow: isRainbow,
        label: isRainbow
          ? "Your name is now a moving rainbow"
          : "Your name is now " + info.label,
      });
    }
  }

  /* ==========================================================
     REBIRTH NAME COLOURS
     ========================================================== */

  function rebirthColorInfo(count) {
    if (count <= 0) return { label: "plain", color: "#fff" };
    if (count > C.REBIRTH_COLORS.length)
      return { label: "a rainbow gradient moving across it", color: "#fff" };
    const [label, color] = C.REBIRTH_COLORS[count - 1];
    return { label, color };
  }

  function styledName(name, count) {
    const safe = escapeHTML(name);
    if (!count || count <= 0) return safe;
    const cls =
      count > C.REBIRTH_COLORS.length ? "drRainbow" : "drName-" + count;
    return `<span class="drName ${cls}" title="${count} rebirth${count === 1 ? "" : "s"}">${safe}</span>`;
  }

  const rebirthCache = new Map();

  function rebirthsFor(id) {
    if (
      typeof currentUser !== "undefined" &&
      currentUser &&
      id === currentUser.id
    )
      return S().rebirths;
    return rebirthCache.get(id) || 0;
  }

  G.drNameHTML = (row) =>
    styledName(row.player_name || "Player", rebirthsFor(row.player_id));

  G.drLoadRebirths = async function (rows) {
    try {
      const ids = [
        ...new Set((rows || []).map((r) => r.player_id).filter(Boolean)),
      ];
      if (!ids.length) return;
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("id,rebirths")
        .in("id", ids);
      if (error || !data) return;
      data.forEach((p) => rebirthCache.set(p.id, Number(p.rebirths) || 0));
    } catch (e) {}
  };

  /* ==========================================================
     CLOUD SYNC (profiles.rebirths, see shop-setup.sql)
     ========================================================== */

  async function pushRebirths() {
    if (typeof currentUser === "undefined" || !currentUser) return;
    try {
      await supabaseClient
        .from("profiles")
        .update({ rebirths: S().rebirths })
        .eq("id", currentUser.id);
    } catch (e) {}
  }

  async function pullRebirths() {
    if (typeof currentUser === "undefined" || !currentUser) return;
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("rebirths")
        .eq("id", currentUser.id)
        .maybeSingle();
      if (error || !data) return;
      const cloud = Number(data.rebirths) || 0;
      if (cloud > S().rebirths) {
        S().rebirths = cloud;
        SH.save();
        refresh();
      } else if (cloud < S().rebirths) {
        pushRebirths();
      }
    } catch (e) {}
  }

  /* ==========================================================
     HOOKS INTO EXISTING FUNCTIONS
     ========================================================== */

  const baseUpdateAccountUI = G.updateAccountUI;
  G.updateAccountUI = function () {
    baseUpdateAccountUI();
    try {
      if (currentUser) {
        const name =
          profile?.username || currentUser.user_metadata?.username || "Player";
        $("userPill").innerHTML = "👤 " + styledName(name, S().rebirths);
      }
    } catch (e) {}
  };

  const prevAuth = G.drOnAuthChange;
  G.drOnAuthChange = function () {
    if (typeof prevAuth === "function") prevAuth();
    pullRebirths().then(() => G.updateAccountUI());
  };

  /* ==========================================================
     BOOT
     ========================================================== */

  SH.syncRollUI();
  G.updateAccountUI();
  if (typeof currentUser !== "undefined" && currentUser) pullRebirths();
})();

/* ============================================================
   TRUE REBIRTH SCENE
   Full-screen cinematic: the old self is sucked into a singularity,
   a flash and shockwaves hit on the sound's boom (~2.2s), then a
   phoenix-style ember rise with the new rebirth number.
   ============================================================ */
(function () {
  "use strict";

  const TOTAL = 6.4;
  const G_drSfx = (...a) =>
    typeof window.drSfx === "function" ? window.drSfx(...a) : undefined;
  const BOOM = 2.2;

  function injectCSS() {
    if (document.getElementById("drRbCSS")) return;
    const st = document.createElement("style");
    st.id = "drRbCSS";
    st.textContent = `
      #drRbScene{position:fixed;inset:0;z-index:100000;background:#000;opacity:0;transition:opacity .45s ease;overflow:hidden;cursor:pointer}
      #drRbScene.on{opacity:1}
      #drRbScene.out{opacity:0;transition:opacity .9s ease}
      #drRbCanvas{position:absolute;inset:0;width:100%;height:100%}
      #drRbFlash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
      .drRbText{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:min(92vw,900px);pointer-events:none;color:#fff;font-family:inherit}
      .drRbSmall{font-size:clamp(13px,2.2vw,20px);letter-spacing:.35em;text-transform:uppercase;opacity:.85;min-height:1.5em}
      .drRbXP{font-size:clamp(28px,6vw,64px);font-weight:900;font-variant-numeric:tabular-nums;margin-top:10px;text-shadow:0 0 24px rgba(255,80,80,.8)}
      .drRbBig{font-size:clamp(40px,11vw,120px);font-weight:900;line-height:1;letter-spacing:.02em;opacity:0;transform:scale(2.6);filter:blur(14px)}
      .drRbBig.show{opacity:1;transform:scale(1);filter:blur(0);transition:transform .9s cubic-bezier(.12,1.2,.3,1),opacity .5s ease,filter .8s ease}
      .drRbBig.rainbow{background:linear-gradient(90deg,#f33,#fa3,#ff3,#3f6,#3af,#63f,#f3c,#f33);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:drRbRb 2s linear infinite}
      @keyframes drRbRb{to{background-position:-300% 0}}
      .drRbSub{margin-top:16px;font-size:clamp(14px,2.6vw,24px);font-weight:700;opacity:0;transform:translateY(14px);transition:opacity .7s ease .5s,transform .7s ease .5s}
      .drRbSub.show{opacity:.95;transform:none}
      #drRbScene.shake{animation:drRbShake .09s linear infinite}
      @keyframes drRbShake{0%{transform:translate(0,0)}25%{transform:translate(var(--sx,3px),calc(var(--sx,3px)*-1))}50%{transform:translate(calc(var(--sx,3px)*-1),var(--sx,3px))}75%{transform:translate(var(--sx,3px),var(--sx,3px))}100%{transform:translate(0,0)}}
      @media (prefers-reduced-motion:reduce){#drRbScene.shake{animation:none}}
    `;
    document.head.appendChild(st);
  }

  const fmt = (v) => Number(v).toLocaleString();

  window.drRebirthScene = function (opts) {
    opts = opts || {};
    const count = opts.count || 1;
    const rainbow = !!opts.rainbow;
    const baseHue = opts.hue == null ? 280 : opts.hue;
    const oldXP = Math.max(0, Number(opts.oldXP) || 0);
    const label = opts.label || "";
    const reduced =
      window.matchMedia &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof G_drSfx === "function")
      G_drSfx("rebirthScene", { count, rainbow });
    injectCSS();
    const old = document.getElementById("drRbScene");
    if (old) old.remove();

    const root = document.createElement("div");
    root.id = "drRbScene";
    root.innerHTML =
      '<canvas id="drRbCanvas"></canvas><div id="drRbFlash"></div>' +
      '<div class="drRbText"><div class="drRbSmall" id="drRbSmall"></div>' +
      '<div class="drRbXP" id="drRbXP"></div>' +
      '<div class="drRbBig' +
      (rainbow ? " rainbow" : "") +
      '" id="drRbBig"></div>' +
      '<div class="drRbSub" id="drRbSub"></div></div>';
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add("on"));

    const cv = root.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const flash = root.querySelector("#drRbFlash");
    const small = root.querySelector("#drRbSmall");
    const xpEl = root.querySelector("#drRbXP");
    const big = root.querySelector("#drRbBig");
    const sub = root.querySelector("#drRbSub");

    let W = 0,
      H = 0,
      dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      W = innerWidth;
      H = innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const hueAt = (t, i) =>
      rainbow ? (t * 120 + i * 37) % 360 : baseHue + ((i * 13) % 50) - 25;
    const R = Math.random;
    const cx = () => W / 2;
    const cy = () => H / 2;

    /* implosion particles */
    const sucked = [];
    for (let i = 0; i < (reduced ? 60 : 320); i++) {
      sucked.push({
        a: R() * Math.PI * 2,
        d: Math.max(W, H) * (0.55 + R() * 0.6),
        spin: (R() < 0.5 ? -1 : 1) * (1.2 + R() * 2),
        size: 1 + R() * 2.6,
        k: R(),
        delay: R() * 0.9,
      });
    }

    /* embers rising after the boom */
    const embers = [];
    function spawnEmbers(n, t) {
      for (let i = 0; i < n; i++) {
        embers.push({
          x: R() * W,
          y: H + 10,
          vy: 90 + R() * 260,
          sway: R() * 40 + 10,
          ph: R() * 6.28,
          size: 1.5 + R() * 3.5,
          life: 0,
          max: 2.2 + R() * 2,
          hue:
            (rainbow ? (t * 140 + R() * 120) % 360 : baseHue + R() * 70 - 25) |
            0,
        });
      }
    }

    /* feathers / phoenix wing arcs */
    const rings = [];
    let boomed = false;

    let start = performance.now();
    let raf = 0;
    let done = false;
    let textShown = false;
    let canClose = false;

    const stages = [
      [0, "Unraveling everything…"],
      [0.9, "Your power collapses…"],
      [1.7, "Into a single point…"],
    ];
    let stageIdx = -1;

    function finish() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      root.classList.add("out");
      setTimeout(() => root.remove(), 950);
    }

    root.addEventListener("click", () => {
      if (canClose) finish();
    });

    function frame(now) {
      const t = (now - start) / 1000;
      if (t >= TOTAL) return finish();

      /* ---------------- shake ---------------- */
      if (!reduced) {
        if (t < BOOM) {
          root.style.setProperty(
            "--sx",
            (1 + (t / BOOM) * 9).toFixed(1) + "px",
          );
          root.classList.add("shake");
        } else if (t < BOOM + 0.8) {
          root.style.setProperty(
            "--sx",
            (14 * (1 - (t - BOOM) / 0.8)).toFixed(1) + "px",
          );
          root.classList.add("shake");
        } else root.classList.remove("shake");
      }

      /* ---------------- text, phase A ---------------- */
      if (t < BOOM) {
        while (stageIdx + 1 < stages.length && t >= stages[stageIdx + 1][0]) {
          stageIdx++;
          small.textContent = stages[stageIdx][1];
        }
        const p = Math.min(1, t / (BOOM - 0.2));
        xpEl.textContent = "XP " + fmt(Math.round(oldXP * (1 - p * p)));
        xpEl.style.opacity = String(1 - Math.max(0, (t - (BOOM - 0.5)) / 0.5));
      } else {
        xpEl.style.display = "none";
      }

      /* ---------------- canvas ---------------- */
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = t < BOOM ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      if (t < BOOM) {
        const prog = t / BOOM;
        /* spiral suction */
        for (const s of sucked) {
          const tt = Math.max(0, t - s.delay * 0.5);
          const e = Math.min(1, tt / (BOOM - 0.1 - s.delay * 0.5));
          const ease = e * e * e;
          const dist = s.d * (1 - ease);
          const ang = s.a + s.spin * ease * 6;
          const x = cx() + Math.cos(ang) * dist;
          const y = cy() + Math.sin(ang) * dist;
          ctx.fillStyle = `hsla(${hueAt(t, s.k * 10)},100%,${55 + s.k * 25}%,${0.35 + 0.5 * e})`;
          ctx.beginPath();
          ctx.arc(x, y, s.size * (1 + ease), 0, 6.283);
          ctx.fill();
        }
        /* singularity */
        const r = 8 + prog * prog * 70;
        const g = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), r * 3.2);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, `hsla(${hueAt(t, 0)},100%,65%,0.7)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx(), cy(), r * 3.2, 0, 6.283);
        ctx.fill();
        /* converging ring pulses */
        for (let k = 0; k < 3; k++) {
          const q = (t * 0.9 + k / 3) % 1;
          ctx.strokeStyle = `hsla(${hueAt(t, k * 4)},100%,70%,${(1 - q) * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx(), cy(), (1 - q) * Math.max(W, H) * 0.5, 0, 6.283);
          ctx.stroke();
        }
      }

      /* ---------------- boom ---------------- */
      if (!boomed && t >= BOOM) {
        boomed = true;
        for (let k = 0; k < 4; k++)
          rings.push({ born: t + k * 0.13, hue: k * 50 });
        flash.style.transition = "none";
        flash.style.opacity = "1";
        requestAnimationFrame(() => {
          flash.style.transition = "opacity 1.1s ease-out";
          flash.style.opacity = "0";
        });
        small.textContent = "";
        setTimeout(() => {
          if (done) return;
          small.textContent = "TRUE REBIRTH";
          big.textContent = "#" + count;
          big.classList.add("show");
          sub.textContent = label;
          sub.classList.add("show");
          textShown = true;
        }, 450);
      }

      if (t >= BOOM) {
        const bt = t - BOOM;

        /* rotating rays */
        const rayA = Math.min(1, bt / 0.5) * Math.max(0, 1 - bt / 3.6);
        if (rayA > 0.01) {
          ctx.save();
          ctx.translate(cx(), cy());
          ctx.rotate(bt * 0.5);
          const L = Math.max(W, H);
          for (let i = 0; i < 18; i++) {
            ctx.rotate(Math.PI / 9);
            const g = ctx.createLinearGradient(0, 0, L, 0);
            g.addColorStop(0, `hsla(${hueAt(t, i)},100%,70%,${0.32 * rayA})`);
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(L, -L * 0.045);
            ctx.lineTo(L, L * 0.045);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        /* light pillar */
        const pa = Math.max(0, 1 - bt / 2.4) * Math.min(1, bt / 0.2);
        if (pa > 0.01) {
          const pw = 40 + bt * 60;
          const g = ctx.createLinearGradient(cx() - pw, 0, cx() + pw, 0);
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(0.5, `hsla(${hueAt(t, 0)},100%,80%,${0.55 * pa})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(cx() - pw, 0, pw * 2, H);
        }

        /* shockwave rings */
        for (const rg of rings) {
          const q = (t - rg.born) / 1.8;
          if (q < 0 || q > 1) continue;
          const rr = q * Math.hypot(W, H) * 0.62;
          ctx.strokeStyle = `hsla(${rainbow ? (t * 120 + rg.hue) % 360 : baseHue + rg.hue * 0.3},100%,${70}%,${(1 - q) * 0.9})`;
          ctx.lineWidth = 14 * (1 - q) + 1;
          ctx.beginPath();
          ctx.arc(cx(), cy(), rr, 0, 6.283);
          ctx.stroke();
        }

        /* orbiting glyph ring around the number */
        if (bt > 0.6) {
          const ra =
            Math.min(1, (bt - 0.6) / 0.6) * Math.max(0, 1 - (bt - 3) / 0.8);
          const R2 = Math.min(W, H) * 0.3;
          for (let i = 0; i < 14; i++) {
            const a = bt * 0.9 + (i / 14) * 6.283;
            ctx.fillStyle = `hsla(${hueAt(t, i)},100%,72%,${0.9 * ra})`;
            ctx.beginPath();
            ctx.arc(
              cx() + Math.cos(a) * R2 * 1.4,
              cy() + Math.sin(a) * R2 * 0.55,
              4 + (i % 3),
              0,
              6.283,
            );
            ctx.fill();
          }
        }

        /* rising embers */
        if (bt < 3.4) spawnEmbers(reduced ? 1 : 7, t);
        for (let i = embers.length - 1; i >= 0; i--) {
          const e = embers[i];
          e.life += 1 / 60;
          if (e.life > e.max) {
            embers.splice(i, 1);
            continue;
          }
          e.y -= e.vy / 60;
          const x = e.x + Math.sin(e.life * 2.5 + e.ph) * e.sway;
          const a = Math.sin((e.life / e.max) * Math.PI);
          ctx.fillStyle = `hsla(${e.hue},100%,62%,${a * 0.9})`;
          ctx.beginPath();
          ctx.arc(x, e.y, e.size, 0, 6.283);
          ctx.fill();
        }
      }

      if (t > 2.6 && !canClose) canClose = true;
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    setTimeout(
      () => window.removeEventListener("resize", resize),
      (TOTAL + 1) * 1000,
    );
  };
})();
