/* ============================================================
   DIGIT ROLL — WEEKLY CHALLENGES
   Five bigger goals that reset every Monday 00:00 UTC. Each pays ★ prestige points and Forge
   materials, and clearing all five pays a bonus. Progress is saved in this browser.
   ============================================================ */
(function () {
  "use strict";
  const G = window;
  const P = G.drProgress;
  if (!P || !P.addTab) return;
  const KEY = "digitRollWeekly";
  const nf = (v) => Math.round(Number(v) || 0).toLocaleString();
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (a) => typeof G.drSfx === "function" && G.drSfx(a);

  /* ISO-ish week key: the Monday (UTC) that started this week */
  function weekKey(d) {
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dow = (t.getUTCDay() + 6) % 7; // Monday = 0
    t.setUTCDate(t.getUTCDate() - dow);
    return t.toISOString().slice(0, 10);
  }
  const nextReset = () => {
    const t = new Date(weekKey(new Date()) + "T00:00:00Z");
    t.setUTCDate(t.getUTCDate() + 7);
    return t;
  };
  const xpMult = () => Math.max(1, typeof G.drXPMultiplier === "function" ? G.drXPMultiplier() : 1);
  const tierIdx = (name) => Math.max(0, P.TIERS.indexOf(name));
  const crafted = () => (G.drForge && G.drForge.state ? G.drForge.state().crafted : null);
  const bossWins = () => (typeof G.drBossStats === "function" ? G.drBossStats().all : null);

  const DEFS = [
    { id: "rolls", icon: "🎲", goal: () => 3000, text: (g) => `Roll ${nf(g)} times`, pts: 1, mats: [["dust", 300]] },
    { id: "rare", icon: "💎", goal: () => 12, text: (g) => `Roll ${g} Ascended or better`, pts: 1, mats: [["spark", 20]] },
    { id: "xp", icon: "✨", goal: (m) => Math.round(400000 * m), text: (g) => `Earn ${nf(g)} XP`, pts: 1, mats: [["ember", 6]] },
    { id: "boss", icon: "👹", goal: () => 3, text: (g) => `Defeat ${g} bosses (totems can summon them)`, pts: 2, mats: [["ember", 12]], ext: bossWins },
    { id: "craft", icon: "🔨", goal: () => 30, text: (g) => `Craft ${g} things in the Forge`, pts: 1, mats: [["prism", 6]], ext: crafted },
  ];
  const ALL_BONUS = { pts: 3, mats: [["void", 2]] };

  let W = {};
  try {
    W = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(W));
    } catch (e) {}
  };

  function ensure() {
    const wk = weekKey(new Date());
    if (W.week !== wk) {
      const streak = W.week && W.allDone ? (W.streak || 0) : 0;
      W = { week: wk, p: {}, done: {}, base: {}, goals: {}, allDone: false, streak, totalCleared: W.totalCleared || 0 };
      save();
    }
    DEFS.forEach((d) => {
      /* the goal is fixed when the week starts (XP goals follow your multiplier at that time) */
      if (!W.goals[d.id]) W.goals[d.id] = d.goal(xpMult());
      if (W.p[d.id] == null) W.p[d.id] = 0;
    });
  }

  function reward(d) {
    P.addPoints(d.pts);
    let txt = `+${d.pts} ★`;
    try {
      d.mats.forEach(([k, a]) => {
        if (G.drForge && G.drForge.addMat) {
          G.drForge.addMat(k, a);
          txt += ` +${a} ${k}`;
        }
      });
    } catch (e) {}
    return txt;
  }
  function finish(d) {
    W.done[d.id] = true;
    W.p[d.id] = W.goals[d.id];
    say(`📅 Weekly challenge complete: ${d.text(W.goals[d.id])} (${reward(d)})`);
    sfx("newbadge");
    if (DEFS.every((x) => W.done[x.id]) && !W.allDone) {
      W.allDone = true;
      W.streak = (W.streak || 0) + 1;
      W.totalCleared = (W.totalCleared || 0) + 1;
      say(`🏆 ALL weekly challenges cleared! ${reward(ALL_BONUS)}`);
      sfx("rebirth");
    }
  }

  function syncExt() {
    ensure();
    DEFS.forEach((d) => {
      if (!d.ext || W.done[d.id]) return;
      const now = d.ext();
      if (now == null) return;
      if (W.base[d.id] == null) W.base[d.id] = now;
      W.p[d.id] = Math.min(W.goals[d.id], Math.max(0, now - W.base[d.id]));
      if (W.p[d.id] >= W.goals[d.id]) finish(d);
    });
    save();
  }
  setTimeout(syncExt, 1800);
  setInterval(() => {
    try {
      syncExt();
      if (P.isOpen()) P.rerender();
    } catch (e) {}
  }, 5000);

  P.onRoll((r) => {
    ensure();
    DEFS.forEach((d) => {
      if (W.done[d.id] || d.ext) return;
      let inc = 0;
      if (d.id === "rolls") inc = 1;
      else if (d.id === "rare") inc = P.TIERS.indexOf(r.rarity) >= tierIdx("ASCENDED") ? 1 : 0;
      else if (d.id === "xp") inc = Number(r.xp || 0);
      W.p[d.id] += inc;
      if (W.p[d.id] >= W.goals[d.id]) finish(d);
    });
    syncExt();
  });

  function render() {
    ensure();
    const left = Math.max(0, nextReset() - Date.now());
    const dd = Math.floor(left / 86400000);
    const hh = Math.floor((left % 86400000) / 3600000);
    const cards = DEFS.map((d) => {
      const g = W.goals[d.id];
      const p = Math.min(g, W.p[d.id] || 0);
      const pct = Math.min(100, Math.round((p / g) * 100));
      return `<div class="pgCard ${W.done[d.id] ? "done" : ""}"><span class="pgTag">${d.icon} Weekly</span><h3>${d.text(g)}</h3>
        <div class="pgBar"><i style="width:${pct}%"></i></div>
        <p>${nf(p)} / ${nf(g)} ${W.done[d.id] ? "✓ Complete" : ""}</p>
        <p>Reward: <b>+${d.pts} ★</b> and <b>${d.mats.map(([k, a]) => nf(a) + " " + k).join(", ")}</b></p></div>`;
    }).join("");
    const doneN = DEFS.filter((d) => W.done[d.id]).length;
    return `<div class="pgBanner">📅 Weekly challenges reset in <b>${dd}d ${hh}h</b> (Monday 00:00 UTC).<br>
      <span class="pgSub">${doneN} / ${DEFS.length} done${W.allDone ? " • all cleared ✓" : ""}. Clear all five for a bonus of <b>+${ALL_BONUS.pts} ★ and 2 void shards</b>. Weeks fully cleared: <b>${W.totalCleared || 0}</b> • in a row: <b>${W.streak || 0}</b></span></div>
      <div class="pgGrid">${cards}</div>`;
  }
  P.addTab("weekly", "📅 Weekly", render);
})();
