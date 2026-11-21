/* ============================================================
   DIGIT ROLL — BOSSES (core)
   Needs boss-setup.sql. Loaded after chat.js; boss-fx.js and
   boss-music.js (loaded after this file) draw and play the show.
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
  const me = () => (typeof currentUser !== "undefined" ? currentUser : null);
  const isAdmin = () => typeof G.drIsAdmin === "function" && G.drIsAdmin();
  const P = G.drProgress;
  const sb = () =>
    typeof supabaseClient !== "undefined" ? supabaseClient : null;

  /* ==========================================================
     CONFIG
     ========================================================== */

  const BOSSES = {
    golem: {
      key: "golem",
      name: "THE STONEBOUND GOLEM",
      short: "Golem",
      icon: "🗿",
      hp: 1000000000000,
      color: "#d6a273",
      size: 4,
      count: 1,
      blurb: "1 cursed roll of 4 digits",
    },
    titan: {
      key: "titan",
      name: "TITAN OF THE ABYSS",
      short: "TITAN",
      icon: "⚡",
      hp: 10000000000000000,
      color: "#38bdf8",
      size: 3,
      count: 3,
      blurb: "3 cursed rolls of 3 digits",
    },
    reality: {
      key: "reality",
      name: "REALITY BREAKER",
      short: "Reality Breaker",
      icon: "🌀",
      hp: 10000000000000000000,
      color: "#f43f5e",
      size: 3,
      count: 5,
      blurb: "5 cursed rolls of 3 digits",
    },
  };
  const ORDER = ["golem", "titan", "reality"];
  const DEFAULT_D = 1000000000000;

  const WEAPONS = [
    {
      id: "gun",
      icon: "🔫",
      name: "Stormcaller Repeater",
      d: 100000000000,
      cost: 5000,
      tag: "Rolls hit 1/100,000,000,000 as hard",
    },
    {
      id: "sword",
      icon: "🗡️",
      name: "Dawnbreaker Blade",
      d: 1000000000000,
      cost: 10000,
      tag: "Rolls hit 1/1,000,000,000,000 as hard",
    },
    {
      id: "laser",
      icon: "🔆",
      name: "Solar Lance (Hyper Laser)",
      d: 10000000000,
      cost: 50000,
      tag: "Rolls hit 1/10,000,000,000 as hard",
    },
    {
      id: "slayr",
      icon: "☄️",
      name: "GOD SLAYR",
      d: 5000000000,
      cost: 100000,
      tag: "Rolls hit 1/5,000,000,000 as hard",
    },
    {
      id: "tooth",
      icon: "🦷",
      name: "BREAKER'S TOOTH",
      d: 1000,
      cost: 1000000,
      tag: "Rolls hit 1/1,000 as hard",
    },
  ];
  const WARD_COST = 25000;
  const WIND_COST = 40000;

  /* ==========================================================
     LOCAL STATE
     ========================================================== */

  const KEY = "digitRollBoss";
  const fresh = () => ({
    weapons: [],
    ward: false,
    wind: false,
    joined: [],
    wins: { golem: 0, titan: 0, reality: 0 },
    seen: 0,
    dq: {},
    windUsed: {},
    dmg: {},
  });
  let B = fresh();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object")
      B = Object.assign(fresh(), raw, {
        wins: Object.assign(fresh().wins, raw.wins || {}),
      });
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(B));
    } catch (e) {}
  };

  const equipped = () => {
    let best = null;
    B.weapons.forEach((id) => {
      const w = WEAPONS.find((x) => x.id === id);
      if (w && (!best || w.d < best.d)) best = w;
    });
    return best;
  };
  const divisor = () => {
    const w = equipped();
    return w ? (w.d === 0 ? 1 : w.d) : DEFAULT_D;
  };

  /* ==========================================================
     EVENT STATE
     ========================================================== */

  let ev = null; // current active boss row
  let pendingDmg = 0; // damage not yet reported
  let pendingDq = false;
  let lastOutcome = null;
  let tableState = "unknown"; // unknown | ok | missing
  let flushing = false;
  let channel = null;

  const cfgOf = (e) => (e ? BOSSES[e.boss_type] : null);
  const msLeft = () =>
    ev ? Math.max(0, new Date(ev.ends_at).getTime() - Date.now()) : 0;
  const shownHp = () =>
    ev ? Math.max(0, Number(ev.hp) - Math.floor(pendingDmg)) : 0;
  const amDq = () => !!(ev && B.dq[ev.id]);

  const FX = () => G.drBossFx || {};
  const MUSIC = () => G.drBossMusic || {};

  function notifyFx(kind, arg) {
    try {
      const f = FX()[kind];
      if (typeof f === "function") f(arg);
    } catch (e) {
      console.warn("boss fx", kind, e);
    }
  }

  G.drBoss = {
    BOSSES,
    ORDER,
    get ev() {
      return ev;
    },
    cfg: () => cfgOf(ev),
    hp: shownHp,
    msLeft,
    dq: amDq,
    divisor,
    equipped,
    outcome: () => lastOutcome,
    myDamage: () => (ev ? Number(B.dmg[ev.id] || 0) : 0),
    state: () => B,
  };

  G.drBossStats = () => ({
    joined: B.joined.length,
    golem: B.wins.golem || 0,
    titan: B.wins.titan || 0,
    reality: B.wins.reality || 0,
    total: (B.wins.golem || 0) + (B.wins.titan || 0) + (B.wins.reality || 0),
  });

  /* ==========================================================
     FETCH / SYNC
     ========================================================== */

  async function fetchActive() {
    const c = sb();
    if (!c) return;
    try {
      await c.rpc("boss_tick");
    } catch (e) {}
    try {
      const { data, error } = await c
        .from("boss_events")
        .select("*")
        .eq("status", "active")
        .order("id", { ascending: false })
        .limit(1);
      if (error) {
        tableState =
          /relation|does not exist|schema cache|could not find/i.test(
            error.message || "",
          )
            ? "missing"
            : tableState;
        return;
      }
      tableState = "ok";
      const row = data && data[0];
      if (row) adopt(row);
      else if (ev) await finishCurrent();
    } catch (e) {}
  }

  function adopt(row) {
    if (ev && ev.id === row.id) {
      // hp only ever goes down; keep the lowest we know about
      ev.hp = Math.min(Number(ev.hp), Number(row.hp));
      ev.ends_at = row.ends_at;
      if (row.status !== "active") return void finishCurrent();
      notifyFx("update");
      return;
    }
    if (row.status !== "active") return;
    if (new Date(row.ends_at).getTime() < Date.now()) return;
    ev = row;
    pendingDmg = 0;
    lastOutcome = null;
    const fresh = B.seen !== row.id;
    B.seen = row.id;
    save();
    startEvent(fresh);
  }

  function startEvent(withCutscene) {
    const cfg = cfgOf(ev);
    if (!cfg) return;
    // everybody goes to the leaderboard, on the Boss victors tab
    try {
      if (typeof G.closeDigitRollPages === "function") G.closeDigitRollPages();
      if (P && P.isOpen && P.isOpen() && typeof P.close === "function")
        P.close();
      if (typeof G.drSelectLeaderboardTab === "function")
        G.drSelectLeaderboardTab("boss", true);
    } catch (e) {}
    notifyFx("start", { ev, cfg, cutscene: withCutscene });
    try {
      const m = MUSIC();
      if (typeof m.start === "function") m.start(cfg.key);
    } catch (e) {}
    if (withCutscene && typeof G.drShowAnnouncement === "function") {
      const mins = Math.max(1, Math.round(msLeft() / 60000));
      setTimeout(
        () =>
          G.drShowAnnouncement(
            `⚠️ ${cfg.name} has awoken! Defeat it within ${mins} minute${mins === 1 ? "" : "s"} — beware its cursed rolls!`,
            { icon: cfg.icon, color: cfg.color, glow: true },
          ),
        600,
      );
    }
    refreshAll();
  }

  async function finishCurrent() {
    const done = ev;
    if (!done) return;
    let row = done;
    const c = sb();
    try {
      const { data } = await c
        .from("boss_events")
        .select("*")
        .eq("id", done.id)
        .limit(1);
      if (data && data[0]) row = data[0];
    } catch (e) {}
    await flush(true);
    let won = false;
    if (
      row.status === "defeated" &&
      me() &&
      !B.dq[done.id] &&
      (B.dmg[done.id] || 0) > 0
    ) {
      won = true;
      B.wins[done.boss_type] = (B.wins[done.boss_type] || 0) + 1;
      save();
    }
    if (row.status === "defeated") {
      try {
        const u = me();
        if (u) {
          const { data } = await c
            .from("boss_victories")
            .select("boss_type,wins")
            .eq("user_id", u.id);
          (data || []).forEach((r) => {
            if (BOSSES[r.boss_type])
              B.wins[r.boss_type] = Math.max(
                B.wins[r.boss_type] || 0,
                Number(r.wins) || 0,
              );
          });
          save();
        }
      } catch (e) {}
    }
    const outcome = {
      status: row.status,
      won,
      dq: !!B.dq[done.id],
      cfg: cfgOf(done),
      ev: done,
      damage: B.dmg[done.id] || 0,
    };
    lastOutcome = outcome;
    ev = null;
    pendingDmg = 0;
    pendingDq = false;
    try {
      const m = MUSIC();
      if (typeof m.stop === "function") m.stop(row.status === "defeated");
    } catch (e) {}
    notifyFx("end", outcome);
    refreshAll();
    if (typeof G.loadLeaderboard === "function")
      setTimeout(() => G.loadLeaderboard(), 800);
  }

  function refreshAll() {
    if (P && P.isOpen && P.isOpen()) P.rerender();
    if (typeof G.updateShopUI === "function")
      try {
        G.updateShopUI();
      } catch (e) {}
  }

  function listen() {
    const c = sb();
    if (!c || channel) return;
    try {
      channel = c
        .channel("boss-events")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "boss_events" },
          (p) => {
            const row = p.new;
            if (!row || !row.id) return;
            if (row.status === "active") adopt(row);
            else if (ev && ev.id === row.id) finishCurrent();
          },
        )
        .subscribe();
    } catch (e) {}
  }

  /* ==========================================================
     REPORTING DAMAGE
     ========================================================== */

  async function flush(force) {
    const c = sb();
    if (!ev || !c || !me() || flushing) return;
    const whole = Math.floor(pendingDmg);
    if (whole < 1 && !pendingDq) return;
    if (!force && whole < 1 && !pendingDq) return;
    flushing = true;
    const id = ev.id;
    pendingDmg -= whole;
    const dq = pendingDq || !!B.dq[id];
    try {
      const { data, error } = await c.rpc("boss_report", {
        p_event: id,
        p_damage: whole,
        p_dq: dq,
      });
      if (error) throw error;
      pendingDq = false;
      if (data && ev && ev.id === id) {
        if (typeof data.hp !== "undefined")
          ev.hp = Math.min(Number(ev.hp), Number(data.hp));
        if (data.status && data.status !== "active") {
          flushing = false;
          await finishCurrent();
          return;
        }
        notifyFx("update");
      }
    } catch (e) {
      pendingDmg += whole; // try again next time
    }
    flushing = false;
  }
  setInterval(() => flush(false), 1500);

  /* ==========================================================
     ROLLS: DAMAGE + CURSES
     ========================================================== */

  function digitsOf(roll) {
    return String(roll || "").replace(/[^0-9]/g, "");
  }

  function applyCurse(loss) {
    const before = typeof getXPBalance === "function" ? getXPBalance() : 0;
    let after = Math.max(0, before - loss);
    let revived = false;
    if (after <= 0 && B.wind && ev && !B.windUsed[ev.id]) {
      B.windUsed[ev.id] = true;
      const cap = typeof G.drGetCap === "function" ? G.drGetCap() : 1000;
      after = Math.min(1000, cap);
      revived = true;
      save();
    }
    xpBalance = after;
    try {
      localStorage.setItem("digitRollXPBalance", String(after));
    } catch (e) {}
    return { after, revived };
  }

  function onRoll(result) {
    if (!ev || ev.status !== "active" || msLeft() <= 0) return;
    const cfg = cfgOf(ev);
    const rollDigits = digitsOf(result && result.roll);
    const id = ev.id;

    if (B.joined.indexOf(id) < 0) {
      B.joined.push(id);
      B.joined = B.joined.slice(-200);
      save();
    }

    /* damage */
    const oneIn = Number(result && result.oneIn) || 0;
    if (oneIn > 0 && !B.dq[id]) {
      const dmg = oneIn / divisor();
      const capped = Math.min(dmg, Number(ev.hp));
      pendingDmg += capped;
      B.dmg[id] = (B.dmg[id] || 0) + capped;
      notifyFx("damage", {
        amount: capped,
        hp: shownHp(),
        crit: capped >= Number(ev.max_hp) * 0.02,
      });
      if (!me()) {
        if (!G.__drBossSignin) {
          G.__drBossSignin = true;
          say("🔒 Sign in to deal damage to the boss.");
        }
      }
    }

    /* curses: a roll that contains every digit of a cursed combo is hit */
    const hits = [];
    (ev.combos || []).forEach((combo, i) => {
      const digs = (combo || []).map(String);
      if (digs.length && digs.every((d) => rollDigits.indexOf(d) >= 0))
        hits.push(i);
    });
    if (hits.length) {
      setTimeout(() => {
        if (!ev || ev.id !== id) return;
        let total = 0;
        let last = null;
        hits.forEach(() => {
          const bal = typeof getXPBalance === "function" ? getXPBalance() : 0;
          let loss = Math.max(100, Math.floor(bal / 100));
          if (B.ward) loss = Math.max(50, Math.floor(loss / 2));
          total += loss;
          last = applyCurse(loss);
        });
        sfx("curse");
        notifyFx("curse", {
          loss: total,
          hits,
          after: last ? last.after : 0,
          revived: last && last.revived,
        });
        if (last && last.revived)
          say("💫 Second Wind! Your Phoenix Ember pulled you back from 0 XP.");
        if (last && last.after <= 0 && !B.dq[id]) {
          B.dq[id] = true;
          pendingDq = true;
          save();
          say(
            "☠️ Your XP hit 0 — you are disqualified from winning this boss.",
          );
          notifyFx("dq", { cfg });
          flush(true);
        }
        if (typeof G.updateShopUI === "function")
          try {
            G.updateShopUI();
          } catch (e) {}
      }, 40);
    }
    save();
  }
  if (P && typeof P.onRoll === "function") P.onRoll(onRoll);

  /* ==========================================================
     SHOP SECTION: BOSS ITEMS
     ========================================================== */

  function shopSection() {
    const balance = typeof getXPBalance === "function" ? getXPBalance() : 0;
    const cap = typeof G.drGetCap === "function" ? G.drGetCap() : Infinity;
    const eq = equipped();
    let h = `<h3 class="drSection">💀 BOSS ITEMS</h3>
      <div class="drSectionSub">Your rolls deal <b>(1 in N) ÷ D</b> damage to bosses. Default D is <b>${nf(DEFAULT_D)}</b>; weapons lower it. The best weapon you own is used automatically. Weapons survive true rebirth.${eq ? ` Equipped: <b>${eq.icon} ${esc(eq.name)}</b>` : ""}</div><div class="drShopGrid">`;
    const card = (title, desc, price, btn) =>
      `<div class="drShopItem"><h3>${title}</h3><p>${desc}</p><p>${price}</p>${btn}</div>`;
    WEAPONS.forEach((w) => {
      const owned = B.weapons.indexOf(w.id) >= 0;
      const can = balance >= w.cost;
      const label = owned
        ? "✓ Owned"
        : can
          ? "Buy"
          : w.cost > cap
            ? "Raise your XP cap first"
            : "Not enough XP";
      h += card(
        `${w.icon} ${esc(w.name)}`,
        `D = <b>${w.d === 0 ? "none" : nf(w.d)}</b>. ${esc(w.tag)}.`,
        `Cost: <b>${nf(w.cost)} XP</b>`,
        `<button class="drBuy" ${owned || !can ? "disabled" : ""} onclick="drBossBuy('${w.id}')">${label}</button>`,
      );
    });
    h += card(
      "🛡️ Hex Ward",
      "Curses drain only <b>half</b> as much XP (minimum 50).",
      `Cost: <b>${nf(WARD_COST)} XP</b>`,
      `<button class="drBuy" ${B.ward || balance < WARD_COST ? "disabled" : ""} onclick="drBossBuy('ward')">${B.ward ? "✓ Owned" : balance >= WARD_COST ? "Buy" : "Not enough XP"}</button>`,
    );
    h += card(
      "🔥 Phoenix Ember",
      "Once per boss fight, if a curse would drop you to 0 XP, you're pulled back to 1,000 XP and stay in the fight.",
      `Cost: <b>${nf(WIND_COST)} XP</b>`,
      `<button class="drBuy" ${B.wind || balance < WIND_COST ? "disabled" : ""} onclick="drBossBuy('wind')">${B.wind ? "✓ Owned" : balance >= WIND_COST ? "Buy" : "Not enough XP"}</button>`,
    );
    return h + "</div>";
  }

  G.drBossBuy = function (id) {
    const w = WEAPONS.find((x) => x.id === id);
    const cost = w
      ? w.cost
      : id === "ward"
        ? WARD_COST
        : id === "wind"
          ? WIND_COST
          : 0;
    if (!cost) return;
    if (
      (w && B.weapons.indexOf(id) >= 0) ||
      (id === "ward" && B.ward) ||
      (id === "wind" && B.wind)
    )
      return;
    if (typeof getXPBalance !== "function" || getXPBalance() < cost)
      return say("Not enough XP.");
    xpBalance = getXPBalance() - cost;
    xpSpent += cost;
    try {
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
      localStorage.setItem("digitRollXPSpent", String(xpSpent));
    } catch (e) {}
    if (w) B.weapons.push(id);
    else if (id === "ward") B.ward = true;
    else B.wind = true;
    save();
    sfx("buy");
    say(
      w
        ? `${w.icon} ${w.name} acquired! Boss damage divisor is now ${w.d === 0 ? "none" : nf(w.d)}.`
        : id === "ward"
          ? "🛡️ Hex Ward acquired."
          : "🔥 Phoenix Ember acquired.",
    );
    if (typeof G.updateShopUI === "function") G.updateShopUI();
  };

  /* wrap the shop renderer so the new section is appended */
  (function hookShop() {
    const base = G.drRenderShop;
    if (typeof base !== "function") return;
    G.drRenderShop = function (content) {
      base(content);
      try {
        content.insertAdjacentHTML("beforeend", shopSection());
      } catch (e) {}
    };
  })();

  /* ==========================================================
     BOSS VICTORS (leaderboard tab)
     ========================================================== */

  G.drRenderBossVictors = async function (box, stale) {
    const c = sb();
    if (!c) return;
    try {
      const { data, error } = await c
        .from("boss_victories")
        .select("user_id,boss_type,username,wins")
        .order("wins", { ascending: false })
        .limit(300);
      if (stale && stale()) return;
      if (error) {
        box.innerHTML =
          /relation|does not exist|schema cache|could not find/i.test(
            error.message || "",
          )
            ? '<span class="empty">Bosses need the database update (boss-setup.sql).</span>'
            : `<span class="empty">${esc(error.message)}</span>`;
        return;
      }
      const by = { golem: [], titan: [], reality: [] };
      (data || []).forEach((r) => by[r.boss_type] && by[r.boss_type].push(r));
      const live = ev ? ev.boss_type : "";
      const cols = ORDER.map((k) => {
        const cfg = BOSSES[k];
        const rows = by[k]
          .slice(0, 25)
          .map((r, i) => {
            const nm =
              typeof G.drNameHTML === "function"
                ? G.drNameHTML({
                    player_name: r.username || "Player",
                    player_id: r.user_id,
                  })
                : esc(r.username);
            return `<div class="drBvRow"><span class="drBvRank">#${i + 1}</span><span class="drBvName">${nm}</span><b>×${nf(r.wins)}</b></div>`;
          })
          .join("");
        return `<div class="drBvCol ${live === k ? "live" : ""}" style="--bc:${cfg.color}">
          <div class="drBvHead"><span>${cfg.icon}</span><b>${esc(cfg.short)}</b>${live === k ? "<em>LIVE</em>" : ""}</div>
          <div class="drBvSub">${by[k].length} survivor${by[k].length === 1 ? "" : "s"} • ${nf(cfg.hp)} HP</div>
          ${rows || '<div class="empty" style="padding:10px 4px">Nobody has survived this boss yet.</div>'}</div>`;
      }).join("");
      box.innerHTML = `<div class="drBvGrid">${cols}</div><div class="small" style="padding:8px 4px;color:#8391ab">Numbers show how many times each player survived that boss and landed the win.</div>`;
    } catch (e) {
      box.innerHTML = '<span class="empty">Boss victors unavailable.</span>';
    }
  };

  function injectCSS() {
    if ($id("drBossCSS")) return;
    const st = document.createElement("style");
    st.id = "drBossCSS";
    st.textContent = `
      .drBvGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      @media(max-width:720px){.drBvGrid{grid-template-columns:1fr}}
      .drBvCol{border:1px solid color-mix(in srgb,var(--bc) 45%,transparent);background:linear-gradient(180deg,color-mix(in srgb,var(--bc) 14%,transparent),rgba(255,255,255,.03));border-radius:16px;padding:12px;min-width:0}
      .drBvCol.live{box-shadow:0 0 22px color-mix(in srgb,var(--bc) 55%,transparent);animation:drBvPulse 1.4s ease-in-out infinite}
      @keyframes drBvPulse{50%{box-shadow:0 0 38px color-mix(in srgb,var(--bc) 85%,transparent)}}
      .drBvHead{display:flex;align-items:center;gap:8px;font-size:17px;color:var(--bc)}
      .drBvHead em{margin-left:auto;font-style:normal;font-size:11px;font-weight:900;background:var(--bc);color:#000;padding:2px 7px;border-radius:999px}
      .drBvSub{color:#8391ab;font-size:12px;margin:2px 0 8px}
      .drBvRow{display:flex;gap:8px;align-items:center;padding:6px 4px;border-top:1px solid rgba(255,255,255,.06)}
      .drBvRank{color:#8391ab;font-size:12px;width:30px}
      .drBvName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .drStatLine{display:flex;gap:16px;flex-wrap:wrap;margin:0 0 10px;font-size:13px;font-weight:800;color:#b9c4da}
      .drStatLine i{font-style:normal;color:#8ee6ad}
      .drBossAdm{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0}
      @media(max-width:720px){.drBossAdm{grid-template-columns:1fr}}
      .drBossPick{cursor:pointer;text-align:left;border:2px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;border-radius:14px;padding:12px;font:inherit}
      .drBossPick.on{border-color:var(--bc);box-shadow:0 0 14px color-mix(in srgb,var(--bc) 60%,transparent)}
      .drBossPick b{display:block;font-size:15px}
    `;
    document.head.appendChild(st);
  }
  injectCSS();

  /* ==========================================================
     ADMIN TAB
     ========================================================== */

  let pick = "golem";
  let minutes = 15;
  let adminMsg = "";

  function renderAdmin() {
    const cur = ev;
    const cfg = cfgOf(cur);
    const live = cur
      ? `<div class="pgCard"><b>${cfg.icon} ${esc(cfg.name)} is LIVE</b><div class="pgSub">${nf(shownHp())} / ${nf(cur.max_hp)} HP • ${Math.ceil(msLeft() / 60000)} min left • cursed rolls: ${(cur.combos || []).map((c) => (c || []).join("")).join(", ")}</div>
         <button class="pgBtn" id="bossCancel" style="width:auto;margin-top:8px">⛔ End the event now</button></div>`
      : '<div class="pgSub">No boss is active.</div>';
    return `<div class="pgCard"><b>💀 Release a boss</b>
      <div class="pgSub">Pick a boss, set how long the event lasts, then Release. Every player's screen jumps to the leaderboard's Boss victors tab, an announcement plays and the cutscene starts. The event ends when the boss dies or the timer runs out.</div>
      <div class="drBossAdm">${ORDER.map((k) => {
        const c = BOSSES[k];
        return `<button type="button" class="drBossPick ${pick === k ? "on" : ""}" data-boss="${k}" style="--bc:${c.color}"><b>${c.icon} ${esc(c.short)}</b><span class="pgSub">${nf(c.hp)} HP<br>${esc(c.blurb)}</span></button>`;
      }).join("")}</div>
      <label class="pgSub">Event time (minutes, 1–240)</label>
      <input id="bossMin" type="number" min="1" max="240" value="${minutes}" style="width:120px;margin:0 8px 8px 0;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.3);color:#fff">
      <button class="pgBtn" id="bossGo" style="width:auto;margin:0">🚨 Release</button>
      <button class="pgBtn" id="bossPrev" style="width:auto;margin:0 0 0 6px">👁️ Preview cutscene (only me)</button>
      ${adminMsg ? `<div class="pgSub" style="margin-top:8px">${esc(adminMsg)}</div>` : ""}
      ${tableState === "missing" ? '<div class="pgSub" style="color:#fda4af;margin-top:8px">Run boss-setup.sql in Supabase first.</div>' : ""}
    </div>${live}`;
  }

  function bindAdmin(root) {
    root.querySelectorAll("[data-boss]").forEach((b) => {
      b.onclick = () => {
        pick = b.dataset.boss;
        P.rerender();
      };
    });
    const m = root.querySelector("#bossMin");
    if (m)
      m.oninput = () =>
        (minutes = Math.max(1, Math.min(240, Number(m.value) || 15)));
    const go = root.querySelector("#bossGo");
    if (go)
      go.onclick = async () => {
        const c = sb();
        if (!c) return;
        go.disabled = true;
        adminMsg = "Releasing…";
        const { error } = await c.rpc("boss_spawn", {
          p_type: pick,
          p_minutes: minutes,
          p_cap: 100,
        });
        adminMsg = error
          ? "Could not release: " + error.message
          : "Released! Players are being pulled in.";
        await fetchActive();
        P.rerender();
      };
    const pv = root.querySelector("#bossPrev");
    if (pv) pv.onclick = () => G.drBossPreview(pick);
    const cn = root.querySelector("#bossCancel");
    if (cn)
      cn.onclick = async () => {
        const c = sb();
        const { error } = await c.rpc("boss_cancel");
        adminMsg = error ? error.message : "Event ended.";
        await fetchActive();
        P.rerender();
      };
  }
  if (P && typeof P.addTab === "function")
    P.addTab("boss", "💀 Boss", renderAdmin, bindAdmin, isAdmin);

  /* local-only preview of a cutscene for admins */
  G.drBossPreview = function (type) {
    const cfg = BOSSES[type];
    if (!cfg) return;
    if (P && P.close) P.close();
    const fake = {
      id: -1,
      boss_type: type,
      max_hp: cfg.hp,
      hp: cfg.hp,
      combos: Array.from({ length: cfg.count }, () => {
        const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
          () => Math.random() - 0.5,
        );
        return pool.slice(0, cfg.size);
      }),
      status: "active",
      ends_at: new Date(Date.now() + 25000).toISOString(),
      preview: true,
    };
    notifyFx("start", { ev: fake, cfg, cutscene: true, preview: true });
    try {
      const m = MUSIC();
      if (typeof m.start === "function") m.start(type);
      setTimeout(() => m.stop && m.stop(false), 25000);
    } catch (e) {}
    setTimeout(
      () =>
        notifyFx("end", { status: "preview", preview: true, cfg, ev: fake }),
      25000,
    );
  };

  /* ==========================================================
     ONLINE PLAYERS + TOTAL ACCOUNTS
     ========================================================== */

  let online = 0;
  let accounts = null;

  function paintStats() {
    const lb = $id("drLbTabs");
    if (!lb) return;
    let el = $id("drStatLine");
    if (!el) {
      el = document.createElement("div");
      el.id = "drStatLine";
      el.className = "drStatLine";
      lb.parentNode.insertBefore(el, lb);
    }
    el.innerHTML = `<span>🟢 <i>${nf(online)}</i> online now</span><span>👥 <i>${accounts == null ? "…" : nf(accounts)}</i> accounts</span>`;
  }

  async function loadAccounts() {
    const c = sb();
    if (!c) return;
    try {
      const { count, error } = await c
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (!error && typeof count === "number") accounts = count;
    } catch (e) {}
    paintStats();
  }

  function startPresence() {
    const c = sb();
    if (!c) return;
    try {
      const key =
        (me() && me().id) || "anon-" + Math.random().toString(36).slice(2, 10);
      const ch = c.channel("digitroll-online", {
        config: { presence: { key } },
      });
      ch.on("presence", { event: "sync" }, () => {
        try {
          online = Object.keys(ch.presenceState()).length;
        } catch (e) {}
        paintStats();
      });
      ch.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await ch.track({ at: Date.now() });
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  /* ==========================================================
     BOOT
     ========================================================== */

  function boot() {
    if (!sb()) return;
    listen();
    fetchActive();
    setInterval(fetchActive, 5000);
    startPresence();
    loadAccounts();
    setInterval(loadAccounts, 60000);
    setInterval(paintStats, 3000);
    // a repeating clock for timer/HP displays
    setInterval(() => ev && notifyFx("tick"), 1000);
  }
  setTimeout(boot, 1200);
})();
