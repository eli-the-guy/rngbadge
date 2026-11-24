/* ============================================================
   DIGIT ROLL — BONUS PACK
   • Daily treasure chest (🎁 Chest tab, UTC reset, streak rewards)
   • Mystery crates (shop section)
   • Boss runes (shop section: crit / damage boosters for boss fights)
   • Boss win rewards, 📜 Boss Log tab
   • 📊 Rarity Codex tab
   Loaded after boss-fx.js. Client-side only (no SQL needed).
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
  const nf = (v) => {
    v = Number(v) || 0;
    if (Math.abs(v) >= 1e15) return v.toExponential(2).replace("e+", " × 10^");
    return Math.round(v).toLocaleString();
  };
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (n, a) => typeof G.drSfx === "function" && G.drSfx(n, a);
  const P = G.drProgress;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const utcKey = (d) => (d || new Date()).toISOString().slice(0, 10);

  /* ==========================================================
     STATE
     ========================================================== */

  const KEY = "digitRollBonus";
  const fresh = () => ({
    chestDay: "",
    chestStreak: 0,
    chestsOpened: 0,
    chestBest: 0,
    crates: { bronze: 0, silver: 0, gold: 0 },
    runes: { zerk: false, exec: false, fury: false },
    bossDmg: 0,
    log: [],
  });
  let B = fresh();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object")
      B = Object.assign(fresh(), raw, {
        crates: Object.assign(fresh().crates, raw.crates || {}),
        runes: Object.assign(fresh().runes, raw.runes || {}),
      });
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(B));
    } catch (e) {}
  };

  G.drBonusStats = () => ({
    chests: B.chestsOpened,
    chestBest: B.chestBest,
    crates: B.crates.bronze + B.crates.silver + B.crates.gold,
    gold: B.crates.gold,
    runes: Object.values(B.runes).filter(Boolean).length,
    bossDmg: B.bossDmg,
  });

  /* ==========================================================
     HELPERS
     ========================================================== */

  const capNow = () =>
    typeof G.drGetCap === "function" ? G.drGetCap() : 100000;

  function gainXP(n) {
    if (typeof getXPBalance !== "function") return 0;
    const b = getXPBalance();
    const nb = Math.min(capNow(), b + Math.max(0, n));
    xpBalance = nb;
    try {
      localStorage.setItem("digitRollXPBalance", String(nb));
    } catch (e) {}
    return nb - b;
  }

  function spend(cost) {
    if (typeof getXPBalance !== "function" || getXPBalance() < cost) {
      say("Not enough XP.");
      return false;
    }
    xpBalance = getXPBalance() - cost;
    xpSpent += cost;
    try {
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
      localStorage.setItem("digitRollXPSpent", String(xpSpent));
    } catch (e) {}
    return true;
  }

  function giveCharm(d) {
    const sh = G.__drShop;
    if (!sh) return false;
    sh.S.charms.push(d);
    sh.save();
    return true;
  }
  function giveLucky(n) {
    if (G.drForge && G.drForge.addItem) {
      G.drForge.addItem("lucky", n);
      return true;
    }
    const sh = G.__drShop;
    if (!sh) return false;
    sh.S.lucky = (sh.S.lucky || 0) + n;
    sh.save();
    return true;
  }
  const givePoints = (n) => P && P.addPoints && P.addPoints(n);

  G.drBonusHelpers = {
    gainXP: (n) => gainXP(n),
    giveCharm: (d) => giveCharm(d),
    giveLucky: (n) => giveLucky(n),
    givePoints: (n) => givePoints(n),
  };

  function refreshUI() {
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
    if (P && P.isOpen()) P.rerender();
    if (G.__drShop && typeof G.__drShop.syncRollUI === "function")
      try {
        G.__drShop.syncRollUI();
      } catch (e) {}
  }

  /* ==========================================================
     CSS + REVEAL MODAL
     ========================================================== */

  function injectCSS() {
    if ($id("bnCSS")) return;
    const st = document.createElement("style");
    st.id = "bnCSS";
    st.textContent = `
      .bnOv{position:fixed;inset:0;z-index:10120;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);animation:bnFade .3s both}
      @keyframes bnFade{from{opacity:0}}
      .bnBox{position:relative;width:min(430px,92vw);text-align:center;padding:26px 22px 22px;border-radius:24px;color:#fff;background:rgba(14,18,28,.98);border:2px solid var(--bc,#8ee6ad);box-shadow:0 0 60px color-mix(in srgb,var(--bc,#8ee6ad) 55%,transparent);overflow:hidden}
      .bnIcon{font-size:84px;line-height:1;display:inline-block}
      .bnIcon.shake{animation:bnShake .9s ease-in-out}
      @keyframes bnShake{0%,100%{transform:rotate(0)}10%{transform:rotate(-14deg) scale(1.05)}25%{transform:rotate(14deg) scale(1.1)}40%{transform:rotate(-18deg) scale(1.15)}55%{transform:rotate(18deg) scale(1.2)}70%{transform:rotate(-10deg) scale(1.3)}85%{transform:rotate(8deg) scale(1.4)}}
      .bnIcon.pop{animation:bnPop .5s cubic-bezier(.2,1.8,.4,1) both}
      @keyframes bnPop{from{transform:scale(.2) rotate(-40deg);opacity:0}}
      .bnBox h2{margin:6px 0 4px;font-size:26px;color:var(--bc,#8ee6ad)}
      .bnLoot{display:flex;flex-direction:column;gap:7px;margin:14px 0 4px;min-height:20px}
      .bnLine{padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.07);font-weight:800;animation:bnLine .45s both}
      .bnLine.big{background:linear-gradient(90deg,rgba(250,204,21,.25),rgba(250,204,21,.08));border:1px solid rgba(250,204,21,.5)}
      @keyframes bnLine{from{opacity:0;transform:translateY(14px) scale(.9)}}
      .bnBtn{margin-top:14px;border:0;border-radius:12px;padding:11px 26px;font-weight:900;cursor:pointer;background:var(--bc,#8ee6ad);color:#06210f}
      .bnConf{position:absolute;top:-10px;width:9px;height:14px;border-radius:2px;animation:bnConf 1.8s ease-out forwards;pointer-events:none}
      @keyframes bnConf{to{transform:translate(var(--dx),420px) rotate(var(--r));opacity:0}}
      .bnBar{display:grid;grid-template-columns:130px 1fr 90px;gap:8px;align-items:center;margin:5px 0;font-size:13px;font-weight:800}
      .bnBar i{display:block;height:15px;border-radius:8px;background:var(--c);min-width:2px;transition:width .6s}
      .bnTrack{background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden}
    `;
    document.head.appendChild(st);
  }
  injectCSS();

  function reveal(opts) {
    // opts: {title, icon, color, lines:[{text,big}], sub, jackpot}
    const ov = document.createElement("div");
    ov.className = "bnOv";
    ov.innerHTML = `<div class="bnBox" style="--bc:${opts.color || "#8ee6ad"}">
      <div class="bnIcon shake">${opts.icon}</div><h2>${esc(opts.title)}</h2>
      <div class="small" style="color:#aab5ca">${esc(opts.sub || "")}</div>
      <div class="bnLoot"></div><button class="bnBtn" type="button" style="display:none">Nice!</button></div>`;
    document.body.appendChild(ov);
    const box = ov.querySelector(".bnBox");
    const loot = ov.querySelector(".bnLoot");
    const btn = ov.querySelector(".bnBtn");
    btn.onclick = () => ov.remove();
    const reduced =
      G.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    sfx("click");
    setTimeout(
      () => {
        const ic = ov.querySelector(".bnIcon");
        if (!ic.isConnected) return;
        ic.classList.remove("shake");
        ic.classList.add("pop");
        ic.textContent = opts.openIcon || "✨";
        sfx(opts.jackpot ? "rebirth" : "newbadge");
        if (!reduced) {
          for (let i = 0; i < (opts.jackpot ? 70 : 36); i++) {
            const c = document.createElement("span");
            c.className = "bnConf";
            c.style.left = rnd(5, 95) + "%";
            c.style.background = pick([
              "#facc15",
              "#8ee6ad",
              "#7dd3fc",
              "#f472b6",
              "#fff",
            ]);
            c.style.setProperty("--dx", rnd(-80, 80) + "px");
            c.style.setProperty("--r", rnd(-540, 540) + "deg");
            c.style.animationDelay = rnd(0, 0.4) + "s";
            box.appendChild(c);
          }
        }
        (opts.lines || []).forEach((l, i) => {
          setTimeout(
            () => {
              if (!loot.isConnected) return;
              const d = document.createElement("div");
              d.className = "bnLine" + (l.big ? " big" : "");
              d.textContent = l.text;
              loot.appendChild(d);
            },
            350 + i * 320,
          );
        });
        setTimeout(
          () => (btn.style.display = ""),
          500 + (opts.lines || []).length * 320,
        );
      },
      reduced ? 100 : 1000,
    );
  }

  /* ==========================================================
     DAILY CHEST
     ========================================================== */

  const chestReady = () => B.chestDay !== utcKey();
  const nextStreak = () =>
    B.chestDay === utcKey(new Date(Date.now() - 86400000))
      ? B.chestStreak + 1
      : chestReady()
        ? 1
        : B.chestStreak;

  function chestPreview(streak) {
    const base = Math.max(300, Math.round(capNow() * 0.04));
    return {
      xp: Math.round(base * (1 + 0.2 * Math.min(streak - 1, 10))),
      bonus: streak % 7 === 0,
    };
  }

  function openChest() {
    if (!chestReady())
      return say("Come back after 00:00 UTC for tomorrow's chest.");
    const streak = nextStreak();
    const pv = chestPreview(streak);
    const lines = [];
    const got = gainXP(pv.xp);
    lines.push({
      text: `💰 +${nf(got)} XP${got < pv.xp ? " (cap reached)" : ""}`,
    });
    const nCharms = pv.bonus ? 3 : Math.random() < 0.35 ? 1 : 0;
    for (let i = 0; i < nCharms; i++) {
      const d = 1 + Math.floor(Math.random() * 9);
      if (giveCharm(d)) lines.push({ text: `🔢 Number Charm ${d}` });
    }
    if (pv.bonus || Math.random() < 0.2) {
      if (giveLucky(1)) lines.push({ text: "🍀 Lucky Charm" });
    }
    if (pv.bonus || Math.random() < 0.05) {
      givePoints(1);
      lines.push({ text: "★ +1 prestige point", big: true });
    }
    B.chestDay = utcKey();
    B.chestStreak = streak;
    B.chestBest = Math.max(B.chestBest, streak);
    B.chestsOpened++;
    save();
    reveal({
      title: pv.bonus ? "Weekly Jackpot Chest!" : "Daily Chest",
      icon: "🎁",
      openIcon: pv.bonus ? "👑" : "🎉",
      color: pv.bonus ? "#facc15" : "#8ee6ad",
      sub: `Day ${streak} of your streak`,
      lines,
      jackpot: pv.bonus,
    });
    refreshUI();
  }

  function renderChest() {
    const ready = chestReady();
    const s = nextStreak();
    const pv = chestPreview(s);
    const days = Array.from({ length: 7 }, (_, i) => {
      const dayNo = i + 1;
      const cur = (((ready ? s : B.chestStreak) - 1) % 7) + 1;
      const done = ready ? dayNo < cur : dayNo <= cur;
      return `<div class="pgCard ${done ? "done" : ""}" style="text-align:center;${dayNo === 7 ? "border-color:rgba(250,204,21,.5)" : ""}"><b>Day ${dayNo}</b><div style="font-size:26px">${dayNo === 7 ? "👑" : done ? "✅" : "🎁"}</div></div>`;
    }).join("");
    return `<div class="pgBanner">🎁 Daily Treasure Chest<br><span class="pgSub">One chest per day (resets 00:00 UTC). Streak: <b>${ready ? (B.chestStreak && nextStreak() > 1 ? nextStreak() - 1 : 0) : B.chestStreak}</b> • Best: <b>${B.chestBest}</b> • Opened: <b>${B.chestsOpened}</b>. Every 7th day is a jackpot with 3 charms, a lucky charm and a prestige point.</span></div>
      <div class="pgGrid" style="grid-template-columns:repeat(7,1fr);margin-bottom:14px">${days}</div>
      <div class="pgCard"><h3>${ready ? "Your chest is ready!" : "Already opened today"}</h3>
        <p>Today's chest: about <b>${nf(pv.xp)} XP</b> plus a chance at number charms, a lucky charm and a prestige point.</p>
        <button class="pgBtn" id="bnOpenChest" ${ready ? "" : "disabled"}>${ready ? "🎁 Open chest" : "Come back tomorrow"}</button></div>`;
  }
  function bindChest(root) {
    const b = root.querySelector("#bnOpenChest");
    if (b) b.onclick = openChest;
  }

  /* ==========================================================
     MYSTERY CRATES
     ========================================================== */

  const CRATES = [
    {
      id: "bronze",
      name: "Bronze Crate",
      icon: "📦",
      cost: 1500,
      color: "#cd7f32",
      xp: [0.4, 1.5],
      charms: [0.25, 1, 1],
      lucky: [0.1, 1],
      pp: 0,
      jackpot: 0,
    },
    {
      id: "silver",
      name: "Silver Crate",
      icon: "🧰",
      cost: 8000,
      color: "#cfd8e3",
      xp: [0.5, 2.0],
      charms: [0.4, 1, 2],
      lucky: [0.2, 1],
      pp: 0.03,
      jackpot: 0.01,
      jm: 6,
    },
    {
      id: "gold",
      name: "Gold Crate",
      icon: "👑",
      cost: 40000,
      color: "#facc15",
      xp: [0.6, 3.0],
      charms: [0.6, 2, 3],
      lucky: [0.3, 2],
      pp: 0.15,
      jackpot: 0.01,
      jm: 10,
    },
  ];

  function openCrate(id) {
    const c = CRATES.find((x) => x.id === id);
    if (!c) return;
    if (!spend(c.cost)) return;
    const lines = [];
    let mul = rnd(c.xp[0], c.xp[1]);
    const jack = c.jackpot && Math.random() < c.jackpot;
    if (jack) mul = c.jm;
    const got = gainXP(Math.round(c.cost * mul));
    lines.push({
      text: `💰 ${nf(got)} XP back (×${mul.toFixed(2)})${jack ? " — JACKPOT!" : ""}`,
      big: jack,
    });
    if (Math.random() < c.charms[0]) {
      const n =
        c.charms[1] +
        Math.floor(Math.random() * (c.charms[2] - c.charms[1] + 1));
      for (let i = 0; i < n; i++) {
        const d = 1 + Math.floor(Math.random() * 9);
        if (giveCharm(d)) lines.push({ text: `🔢 Number Charm ${d}` });
      }
    }
    if (Math.random() < c.lucky[0]) {
      if (giveLucky(c.lucky[1]))
        lines.push({
          text: `🍀 ${c.lucky[1]} Lucky Charm${c.lucky[1] > 1 ? "s" : ""}`,
        });
    }
    if (c.pp && Math.random() < c.pp) {
      givePoints(1);
      lines.push({ text: "★ +1 prestige point", big: true });
    }
    B.crates[c.id]++;
    save();
    reveal({
      title: c.name,
      icon: c.icon,
      openIcon: jack ? "💎" : "✨",
      color: c.color,
      sub: `Cost ${nf(c.cost)} XP`,
      lines,
      jackpot: jack,
    });
    refreshUI();
  }
  G.drBonusCrate = openCrate;

  /* ==========================================================
     BOSS RUNES
     ========================================================== */

  const RUNES = [
    {
      id: "zerk",
      icon: "🩸",
      name: "Berserker Sigil",
      cost: 20000,
      desc: "All boss damage ×1.5.",
    },
    {
      id: "exec",
      icon: "🪓",
      name: "Executioner's Rune",
      cost: 30000,
      desc: "8% chance for a roll to hit ×10 harder.",
    },
    {
      id: "fury",
      icon: "🔥",
      name: "Titan's Fury",
      cost: 75000,
      desc: "Damage ×2 once the boss is below 25% health.",
    },
  ];

  G.drBonusRune = function (id) {
    const r = RUNES.find((x) => x.id === id);
    if (!r || B.runes[id]) return;
    if (!spend(r.cost)) return;
    B.runes[id] = true;
    save();
    sfx("buy");
    say(`${r.icon} ${r.name} acquired!`);
    refreshUI();
  };

  /* called by boss.js for every point of damage */
  G.drBossMod = function (dmg) {
    let m = 1;
    if (B.runes.zerk) m *= 1.5;
    if (B.runes.exec && Math.random() < 0.08) m *= 10;
    if (B.runes.fury) {
      const b = G.drBoss;
      if (b && b.ev && b.hp() < Number(b.ev.max_hp) * 0.25) m *= 2;
    }
    return dmg * m;
  };
  G.drBonusResetBoss = function () {
    B.bossDmg = 0;
    B.log = [];
    save();
  };
  G.drBonusDmg = function (n) {
    B.bossDmg += Number(n) || 0;
    save();
  };

  /* ==========================================================
     SHOP SECTIONS
     ========================================================== */

  function shopSections() {
    const balance = typeof getXPBalance === "function" ? getXPBalance() : 0;
    const cap = capNow();
    const card = (t, d, p, b) =>
      `<div class="drShopItem"><h3>${t}</h3><p>${d}</p><p>${p}</p>${b}</div>`;
    let h = `<h3 class="drSection">🎲 MYSTERY CRATES</h3><div class="drSectionSub">Spend XP for a random haul: XP back (sometimes much more), number charms, lucky charms and rare prestige points. Gold crates have a 1% ×10 jackpot.</div><div class="drShopGrid">`;
    CRATES.forEach((c) => {
      const can = balance >= c.cost;
      h += card(
        `${c.icon} ${c.name}`,
        `XP back ×${c.xp[0]}–${c.xp[1]}${c.jackpot ? `, ${c.jackpot * 100}% jackpot ×${c.jm}` : ""}. Opened: <b>${B.crates[c.id]}</b>`,
        `Cost: <b>${nf(c.cost)} XP</b>`,
        `<button class="drBuy" ${can ? "" : "disabled"} onclick="drBonusCrate('${c.id}')">${can ? "Open" : c.cost > cap ? "Raise your XP cap first" : "Not enough XP"}</button>`,
      );
    });
    h += `</div><h3 class="drSection">🔮 BOSS RUNES</h3><div class="drSectionSub">Permanent boosters for boss fights. They stack with weapons.</div><div class="drShopGrid">`;
    RUNES.forEach((r) => {
      const own = B.runes[r.id];
      const can = balance >= r.cost;
      h += card(
        `${r.icon} ${r.name}`,
        esc(r.desc),
        `Cost: <b>${nf(r.cost)} XP</b>`,
        `<button class="drBuy" ${own || !can ? "disabled" : ""} onclick="drBonusRune('${r.id}')">${own ? "✓ Owned" : can ? "Buy" : r.cost > cap ? "Raise your XP cap first" : "Not enough XP"}</button>`,
      );
    });
    return h + "</div>";
  }

  (function hookShop() {
    const base = G.drRenderShop;
    if (typeof base !== "function") return;
    G.drRenderShop = function (content) {
      base(content);
      try {
        content.insertAdjacentHTML("beforeend", shopSections());
      } catch (e) {}
    };
  })();

  /* ==========================================================
     BOSS REWARDS + LOG
     ========================================================== */

  const REWARD = {
    golem: { pts: 1, frac: 0.25 },
    titan: { pts: 3, frac: 0.5 },
    reality: { pts: 8, frac: 1 },
    mimic: { pts: 2, frac: 0.35 },
    wraith: { pts: 4, frac: 0.6 },
    drake: { pts: 2, frac: 0.4 },
    kraken: { pts: 5, frac: 0.7 },
    hydra: { pts: 6, frac: 0.85 },
    voidking: { pts: 10, frac: 1.5 },
    eternal: { pts: 12, frac: 2 },
    omega: { pts: 15, frac: 3 },
    devourer: { pts: 20, frac: 4 },
    author: { pts: 30, frac: 6 },
  };

  G.drBossWon = function (type) {
    const r = REWARD[type];
    if (!r) return;
    let xm = 1;
    try {
      if (G.drForge && G.drForge.bossXPMult) xm = G.drForge.bossXPMult();
    } catch (e) {}
    const got = gainXP(Math.round(capNow() * r.frac * xm));
    givePoints(r.pts);
    let drop = "";
    try {
      if (G.drForge && G.drForge.bossDrop) drop = G.drForge.bossDrop(type);
    } catch (e) {}
    say(
      `🏆 Boss reward: +${nf(got)} XP and +${r.pts} ★ prestige point${r.pts > 1 ? "s" : ""}!${drop ? " 🔨 Drops: " + drop : ""}`,
    );
  };

  G.drBossLog = function (o) {
    if (!o || !o.cfg || o.status === "preview") return;
    B.log.unshift({
      boss: o.cfg.key,
      status: o.status,
      won: !!o.won,
      dq: !!o.dq,
      dmg: Number(o.damage) || 0,
      at: Date.now(),
    });
    B.log = B.log.slice(0, 60);
    save();
    if (P && P.isOpen()) P.rerender();
  };

  function renderLog() {
    const fights = B.log.length;
    const wins = B.log.filter((x) => x.won).length;
    const rows = B.log
      .map((x) => {
        const names = {
          golem: "🗿 Golem",
          titan: "🤖 Titan",
          reality: "👁️ Reality Breaker",
          mimic: "🧰 Vault Mimic",
          wraith: "🕰️ Chrono Wraith",
        };
        try {
          Object.values(G.drBoss.BOSSES).forEach(
            (c) => (names[c.key] = names[c.key] || `${c.icon} ${c.short}`),
          );
        } catch (e) {}
        const res = x.won
          ? '<b style="color:#8ee6ad">WIN</b>'
          : x.dq
            ? '<b style="color:#ff6b7a">DISQUALIFIED</b>'
            : x.status === "defeated"
              ? "Boss fell (no win)"
              : x.status === "expired"
                ? "Escaped"
                : "Ended early";
        return `<div class="pgCard" style="display:flex;gap:12px;align-items:center;margin-bottom:8px"><div style="flex:1"><b>${names[x.boss] || x.boss}</b><div class="pgSub">${new Date(x.at).toLocaleString()}</div></div><div style="text-align:right">${res}<div class="pgSub">${nf(x.dmg)} dmg</div></div></div>`;
      })
      .join("");
    return `<div class="pgBanner">📜 Boss Log<br><span class="pgSub">Fights joined here: <b>${fights}</b> • Wins: <b>${wins}</b> • Lifetime boss damage: <b>${nf(B.bossDmg)}</b></span></div>${rows || '<div class="pgSub">No boss fights yet. Wait for an admin to release one!</div>'}`;
  }

  /* ==========================================================
     RARITY CODEX
     ========================================================== */

  function renderCodex() {
    const s = P.stats();
    const tiers = P.TIERS;
    const counts = tiers.map((t) => s.rarity[t] || 0);
    const max = Math.max(1, ...counts);
    const found = counts.filter((c) => c > 0).length;
    const bars = tiers
      .map((t, i) => {
        const c = counts[i];
        const pct = s.rolls
          ? ((c / s.rolls) * 100).toFixed(c / s.rolls < 0.01 && c ? 3 : 1)
          : "0";
        const col = `hsl(${Math.round(150 - (i / (tiers.length - 1)) * 330)},80%,60%)`;
        return `<div class="bnBar"><span>${t.charAt(0) + t.slice(1).toLowerCase()}</span><div class="bnTrack"><i style="--c:${col};width:${c ? Math.max(2, (c / max) * 100) : 0}%"></i></div><span>${nf(c)} <span class="pgSub">${pct}%</span></span></div>`;
      })
      .join("");
    const best = s.best
      ? `<br>Rarest roll: <b>${esc(s.best.roll)}</b> — ${esc(s.best.rarity)} (1 in ${nf(s.best.oneIn)})`
      : "";
    return `<div class="pgBanner">📊 Rarity Codex<br><span class="pgSub">Tiers discovered: <b>${found}</b> / ${tiers.length} • Total rolls: <b>${nf(s.rolls)}</b>${best}</span></div>${bars}`;
  }

  /* ==========================================================
     TABS + BOOT
     ========================================================== */

  if (P && P.addTab) {
    P.addTab("chest", "🎁 Chest", renderChest, bindChest);
    P.addTab("codex", "📊 Codex", renderCodex);
    P.addTab("bosslog", "📜 Boss Log", renderLog);
  }

  setTimeout(() => {
    if (chestReady())
      say("🎁 Your daily chest is ready! Open Progress → Chest.");
  }, 5000);
})();
