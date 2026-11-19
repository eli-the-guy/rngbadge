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
      <span class="drBalanceSub">🔢 ${len} digits per roll • 🧤 Gloves ${s.gloves}/${C.GLOVES.length} • 🍀 Lucky charms ${s.lucky} • 🔄 Rebirths ${s.rebirths}</span>
    </div>`;

    /* ---- number charms ---- */
    let charms = "";
    for (let d = 1; d <= 9; d++) {
      const armed = s.charms.includes(d);
      charms += card(
        `<span class="drBigDigit">${d}</span> Number Charm`,
        `Guarantees a <b>${d}</b> on your next roll.`,
        `Cost: <b>${n(C.NUMBER_CHARM_COST)} XP</b>`,
        buyBtn(armed ? "✓ Armed for next roll" : afford(C.NUMBER_CHARM_COST) ? "Buy" : "Not enough XP", "charm", d, armed || !afford(C.NUMBER_CHARM_COST)),
      );
    }
    html += section("🔢 Number Charms", "One use each. Armed charms are used up on your next roll.", charms);

    /* ---- number upgrades ---- */
    const nu = s.numUp;
    const nuMax = nu >= C.NUM_UPGRADE_COSTS.length;
    const nuCost = nuMax ? 0 : C.NUM_UPGRADE_COSTS[nu];
    html += section(
      "🔠 Number Upgrades",
      `You start with ${C.BASE_LEN} digits. Each upgrade adds 1, up to ${C.MAX_LEN}.`,
      card(
        `Number Upgrade ${nuMax ? "(MAX)" : nu + 1 + "/" + C.NUM_UPGRADE_COSTS.length}`,
        `Currently rolling <b>${len}</b> digits.${nuMax ? "" : ` Next: <b>${len + 1}</b> digits.`}`,
        nuMax ? "" : `Cost: <b>${n(nuCost)} XP</b>`,
        buyBtn(nuMax ? "✓ Maxed" : afford(nuCost) ? "Buy" : "Not enough XP", "numUp", undefined, nuMax || !afford(nuCost)),
      ),
    );

    /* ---- luck ---- */
    let luck = card(
      "🍀 Lucky Charm",
      `One extra guaranteed badge on your next roll. In stock: <b>${s.lucky}</b>.`,
      `Cost: <b>${n(C.LUCKY_CHARM_COST)} XP</b>`,
      buyBtn(afford(C.LUCKY_CHARM_COST) ? "Buy" : "Not enough XP", "lucky", undefined, !afford(C.LUCKY_CHARM_COST)),
    );
    C.GLOVES.forEach((g, i) => {
      const lvl = i + 1;
      const owned = s.gloves >= lvl;
      const next = lvl === s.gloves + 1;
      const label = owned ? "✓ Purchased" : !next ? "Buy the previous gloves first" : afford(g.cost) ? "Buy" : "Not enough XP";
      luck += card(
        g.name,
        "Permanent lucky charm: <b>+1</b> guaranteed badge on <b>every</b> roll.",
        `Cost: <b>${n(g.cost)} XP</b>`,
        buyBtn(label, "gloves", lvl, owned || !next || !afford(g.cost)),
      );
    });
    html += section("🧤 Luck", "Charms are single use. Gloves are permanent and stack.", luck);

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
        buyBtn(capMaxed ? "✓ Max for now" : afford(capPrice) ? "Buy" : "Not enough XP", "cap", undefined, capMaxed || !afford(capPrice)),
      ),
    );

    /* ---- speed ---- */
    let speed = card(
      "⏭ Skip Wait",
      "Adds a Skip button under the roll button. Press it mid-roll to skip waiting.",
      `Cost: <b>${n(C.SKIP_COST)} XP</b>`,
      buyBtn(s.skip ? "✓ Purchased" : afford(C.SKIP_COST) ? "Buy" : "Not enough XP", "skip", undefined, s.skip || !afford(C.SKIP_COST)),
    );
    speed += card(
      "⏩ Auto Skip",
      "A switch that skips every wait automatically. Needs Skip Wait.",
      s.auto ? `Status: <b>${s.autoOn ? "ON" : "OFF"}</b>` : `Cost: <b>${n(C.AUTO_COST)} XP</b>`,
      s.auto
        ? `<button class="drBuy" onclick="drToggleAuto()">${s.autoOn ? "Turn OFF" : "Turn ON"}</button>`
        : buyBtn(!s.skip ? "Buy Skip Wait first" : afford(C.AUTO_COST) ? "Buy" : "Not enough XP", "auto", undefined, !s.skip || !afford(C.AUTO_COST)),
    );
    html += section("⚡ Speed", "", speed);

    /* ---- rebirth ---- */
    const rc = rebirthColorInfo(s.rebirths + 1);
    const rCost = SH.rebirthCost();
    html += `<h3 class="drSection">🔄 True Rebirth</h3>
      <div class="drRebirth">
        <p>Resets <b>everything</b> in the shop and your XP back to the start. You keep your account, name and rolls.</p>
        <p>Your leaderboard name becomes <b style="color:${rc.color}">${rc.label}</b>. After red, it cycles through the rainbow forever.</p>
        <p>Each rebirth makes the next one ${n(100000)} XP more expensive and raises the XP cap limit by ${n(100000)}.</p>
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
        if (arg < 1 || arg > 9 || s.charms.includes(arg)) return;
        if (!spend(C.NUMBER_CHARM_COST)) return;
        s.charms.push(arg);
        toast(`🔢 Number charm ${arg} armed for your next roll.`);
        break;
      }

      case "lucky": {
        if (!spend(C.LUCKY_CHARM_COST)) return;
        s.lucky++;
        toast("🍀 Lucky charm ready for your next roll.");
        break;
      }

      case "gloves": {
        if (arg !== s.gloves + 1 || arg > C.GLOVES.length) {
          toast("Buy the previous gloves first.");
          return;
        }
        if (!spend(C.GLOVES[arg - 1].cost)) return;
        s.gloves = arg;
        toast(`${C.GLOVES[arg - 1].name} equipped. +${arg} guaranteed badge${arg === 1 ? "" : "s"} per roll.`);
        break;
      }

      case "numUp": {
        if (s.numUp >= C.NUM_UPGRADE_COSTS.length) return;
        if (!spend(C.NUM_UPGRADE_COSTS[s.numUp])) return;
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

    const fresh = SH.fresh();
    fresh.rebirths = next;
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
  }

  /* ==========================================================
     REBIRTH NAME COLOURS
     ========================================================== */

  function rebirthColorInfo(count) {
    if (count <= 0) return { label: "plain", color: "#fff" };
    if (count > C.REBIRTH_COLORS.length) return { label: "a smooth rainbow", color: "#fff" };
    const [label, color] = C.REBIRTH_COLORS[count - 1];
    return { label, color };
  }

  function styledName(name, count) {
    const safe = escapeHTML(name);
    if (!count || count <= 0) return safe;
    const cls = count > C.REBIRTH_COLORS.length ? "drRainbow" : "drName-" + count;
    return `<span class="drName ${cls}" title="${count} rebirth${count === 1 ? "" : "s"}">${safe}</span>`;
  }

  const rebirthCache = new Map();

  function rebirthsFor(id) {
    if (typeof currentUser !== "undefined" && currentUser && id === currentUser.id) return S().rebirths;
    return rebirthCache.get(id) || 0;
  }

  G.drNameHTML = (row) => styledName(row.player_name || "Player", rebirthsFor(row.player_id));

  G.drLoadRebirths = async function (rows) {
    try {
      const ids = [...new Set((rows || []).map((r) => r.player_id).filter(Boolean))];
      if (!ids.length) return;
      const { data, error } = await supabaseClient.from("profiles").select("id,rebirths").in("id", ids);
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
      await supabaseClient.from("profiles").update({ rebirths: S().rebirths }).eq("id", currentUser.id);
    } catch (e) {}
  }

  async function pullRebirths() {
    if (typeof currentUser === "undefined" || !currentUser) return;
    try {
      const { data, error } = await supabaseClient.from("profiles").select("rebirths").eq("id", currentUser.id).maybeSingle();
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
        const name = profile?.username || currentUser.user_metadata?.username || "Player";
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
