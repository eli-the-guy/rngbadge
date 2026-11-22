/* ============================================================
   DIGIT ROLL — THE FORGE
   • 21 crafting materials: tier mats (Dust..Void), digit shards 0-9, pattern mats from badges
   • PATTERN CHARMS: craft an ordered digit sequence that is placed into your next roll; fuse charms
     (chain = one longer sequence, split = several patterns at once) for rarer rolls
   • Lucky Charm (+1 guaranteed badge) and Gatherer's Gloves (permanent drop bonus) live here now
   • Craft consumables: Rift Bomb, Warding Scroll, Fortune Tonic, Overcharge Cell, Void Nuke
   • Permanent boss skills: Sharpened Edge, Critical Eye, Combo Engine, Iron Will, Ultimate Mastery
   • Boss fights get an action bar: combo counter, ULTIMATE button, bomb arming
   Loaded after events.js. Client-side only (no SQL).
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const P = G.drProgress;
  if (!P) return;
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (n, a) => typeof G.drSfx === "function" && G.drSfx(n, a);
  const nf = (v) => Math.round(Number(v) || 0).toLocaleString();
  const big = (v) =>
    v >= 1e12 ? v.toExponential(1).replace("e+", " × 10^") : nf(v);
  const TI = (n) => P.TIERS.indexOf(n);

  /* ---------- state ---------- */
  const KEY = "digitRollForge";
  const fresh = () => ({
    mats: {
      dust: 0,
      spark: 0,
      ember: 0,
      prism: 0,
      void: 0,
      d0: 0,
      d1: 0,
      d2: 0,
      d3: 0,
      d4: 0,
      d5: 0,
      d6: 0,
      d7: 0,
      d8: 0,
      d9: 0,
      chain: 0,
      twin: 0,
      mirror: 0,
      clover: 0,
      formula: 0,
      lore: 0,
    },
    items: { bomb: 0, nuke: 0, scroll: 0, tonic: 0, cell: 0, lucky: 0 },
    patterns: [], // [{ parts: ["123"] }]  placed into the next roll, first in line first
    patternsUsed: 0,
    fused: 0,
    perks: { edge: 0, crit: 0, combo: 0, will: 0, ult: 0 },
    armed: "", // "bomb" | "nuke" — applies to the next boss hit
    scrollLeft: 0, // curses still negated
    tonicLeft: 0, // rolls of Fortune Tonic left
    charge: 0, // ultimate meter 0..100
    crafted: 0,
    ults: 0,
    bestCombo: 0,
  });
  let F = fresh();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object")
      F = Object.assign(fresh(), raw, {
        mats: Object.assign(fresh().mats, raw.mats),
        items: Object.assign(fresh().items, raw.items),
        perks: Object.assign(fresh().perks, raw.perks),
      });
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(F));
    } catch (e) {}
  };
  let combo = 0;
  let sub = "patterns"; // forge sub-tab
  let sel = []; // selected pattern charm indexes (in click order)
  let draft = ""; // pattern being typed

  /* ---------- materials ---------- */
  const MATS = {
    dust: { name: "Dust", icon: "✨", from: "every roll" },
    spark: { name: "Sparks", icon: "⚡", from: "Rare+" },
    ember: { name: "Embers", icon: "🔥", from: "Legendary+" },
    prism: { name: "Prisms", icon: "💎", from: "Divine+" },
    void: { name: "Void Shards", icon: "🌑", from: "Omnipotent+" },
    chain: { name: "Chain Links", icon: "⛓️", from: "sequence badges" },
    twin: { name: "Twin Sparks", icon: "👯", from: "repeat badges" },
    mirror: { name: "Mirror Glass", icon: "🪞", from: "mirror badges" },
    clover: { name: "Clovers", icon: "🍀", from: "lucky badges" },
    formula: { name: "Formula Scraps", icon: "🧮", from: "math badges" },
    lore: { name: "Lore Fragments", icon: "📖", from: "pop-culture badges" },
  };
  for (let i = 0; i < 10; i++)
    MATS["d" + i] = {
      name: `${i}-Shard`,
      icon: ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][i],
      from: `rolls with a ${i}`,
    };
  const TIER_MATS = ["dust", "spark", "ember", "prism", "void"];
  const PAT_MATS = ["chain", "twin", "mirror", "clover", "formula", "lore"];
  const DIGIT_MATS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "d" + i);

  /* which pattern material a badge feeds */
  function badgeMat(name) {
    const n = String(name);
    if (
      /sequence|climb|stair|counting|chain|arithmetic|quadratic|wave|mountain|valley|pyramid|ladder/i.test(
        n,
      )
    )
      return "chain";
    if (
      /double|triple|quad|quint|sept|oct|repeater|loop|stack|monochrome|six|eights|nines|ones|twos|digit/i.test(
        n,
      )
    )
      return "twin";
    if (/mirror|palindrome|reverse|echo|centered/i.test(n)) return "mirror";
    if (/7|lucky|jackpot/i.test(n)) return "clover";
    if (/prime|euler|golden|root|sum|binary|hex|ratio|pi\b/i.test(n))
      return "formula";
    return "lore";
  }
  const matCost = (c) =>
    Object.keys(c)
      .map((k) => `${MATS[k].icon} ${c[k]}`)
      .join(" ");
  const canPay = (c) => Object.keys(c).every((k) => F.mats[k] >= c[k]);
  const pay = (c) => Object.keys(c).forEach((k) => (F.mats[k] -= c[k]));

  function drops(t) {
    const d = { dust: 1 + Math.floor(t / 4) };
    if (t >= TI("RARE")) d.spark = 1 + Math.floor((t - TI("RARE")) / 3);
    if (t >= TI("LEGENDARY"))
      d.ember = 1 + Math.floor((t - TI("LEGENDARY")) / 3);
    if (t >= TI("DIVINE")) d.prism = 1 + Math.floor((t - TI("DIVINE")) / 2);
    if (t >= TI("OMNIPOTENT"))
      d.void = 1 + Math.floor((t - TI("OMNIPOTENT")) / 2);
    return d;
  }

  /* ---------- recipes & skills ---------- */
  const ITEMS = [
    {
      id: "bomb",
      icon: "💣",
      name: "Rift Bomb",
      cost: { dust: 30, spark: 6 },
      desc: "Arm it, then your NEXT boss hit deals <b>×8</b> damage. Save it for a great roll.",
    },
    {
      id: "nuke",
      icon: "🌌",
      name: "Void Nuke",
      cost: { prism: 3, void: 2 },
      desc: "Arm it: your next boss hit deals <b>×40</b> damage (still soft-capped by the boss).",
    },
    {
      id: "scroll",
      icon: "📜",
      name: "Warding Scroll",
      cost: { dust: 40, ember: 2 },
      desc: "Read it: the next <b>3 curses</b> cost you only 1 XP each.",
    },
    {
      id: "tonic",
      icon: "🧪",
      name: "Fortune Tonic",
      cost: { dust: 60, spark: 4 },
      desc: "Drink it: <b>×1.5 XP</b> for your next 25 rolls (works anywhere, not just bosses).",
    },
    {
      id: "cell",
      icon: "⚡",
      name: "Overcharge Cell",
      cost: { ember: 3, prism: 1 },
      desc: "Instantly fills your <b>Ultimate</b> meter.",
    },
    {
      id: "lucky",
      icon: "🍀",
      name: "Lucky Charm",
      cost: { clover: 3, dust: 10 },
      auto: true,
      desc: "One extra <b>guaranteed badge</b> on a roll. Used automatically, one per roll, while you have some.",
    },
  ];
  /* Gatherer's Gloves: permanent, every level +20% materials and +5% chance of a x3 windfall */
  const GLOVES = [
    {
      name: "Gatherer's Gloves I",
      cost: { dust: 100, spark: 5, clover: 5, formula: 3, lore: 3 },
    },
    {
      name: "Gatherer's Gloves II",
      cost: { dust: 200, spark: 10, ember: 3, clover: 10, formula: 6, lore: 6 },
    },
    {
      name: "Gatherer's Gloves III",
      cost: {
        dust: 300,
        ember: 8,
        chain: 10,
        twin: 10,
        mirror: 10,
        clover: 15,
      },
    },
    {
      name: "Gatherer's Gloves IV",
      cost: {
        dust: 400,
        ember: 12,
        prism: 4,
        chain: 20,
        twin: 20,
        mirror: 20,
        formula: 12,
      },
    },
    {
      name: "Gatherer's Gloves V",
      cost: {
        dust: 600,
        prism: 10,
        void: 3,
        chain: 30,
        twin: 30,
        mirror: 30,
        clover: 30,
        formula: 20,
        lore: 20,
      },
    },
  ];
  const shopS = () => (G.__drShop && G.__drShop.S) || null;
  const gloveLvl = () => (shopS() ? Math.min(5, shopS().gloves | 0) : 0);
  const PERKS = [
    {
      id: "edge",
      icon: "⚔️",
      name: "Sharpened Edge",
      max: 10,
      desc: (l) => `+${8 * l}% boss damage (+8% per level)`,
      cost: (n) => ({ dust: 50 * n, spark: 3 * n }),
    },
    {
      id: "crit",
      icon: "🎯",
      name: "Critical Eye",
      max: 6,
      desc: (l) => `${6 * l}% chance for a ×4 critical hit`,
      cost: (n) => ({ spark: 4 * n, ember: n }),
    },
    {
      id: "combo",
      icon: "🔥",
      name: "Combo Engine",
      max: 5,
      desc: (l) =>
        `Epic+ rolls build a combo: +3% damage per stack, up to ${4 + 4 * l} stacks. A weaker roll resets it`,
      cost: (n) => ({ ember: 2 * n, prism: n }),
    },
    {
      id: "will",
      icon: "🛡️",
      name: "Iron Will",
      max: 5,
      desc: (l) => `Curses cost ${12 * l}% less XP`,
      cost: (n) => ({ ember: 2 * n, dust: 80 * n }),
    },
    {
      id: "ult",
      icon: "💥",
      name: "Ultimate Mastery",
      max: 5,
      desc: (l) =>
        `Ultimate hits for ${4 + l}% of the boss's HP and charges ${10 * l}% faster`,
      cost: (n) => ({ prism: 2 * n, void: n }),
    },
  ];

  const bossLive = () => {
    const b = G.drBoss;
    return !!(
      b &&
      b.ev &&
      b.ev.status === "active" &&
      b.msLeft() > 0 &&
      !b.dq()
    );
  };

  /* ---------- roll hook: drops + charge ---------- */
  const fmtDrop = (d) =>
    Object.keys(d)
      .filter((k) => k !== "dust" && !/^d\d$/.test(k))
      .map((k) => `+${d[k]} ${MATS[k].icon}`)
      .join(" ");

  P.onRoll((r) => {
    const t = P.tierOf(r.rarity);
    const d = drops(t);
    /* digit shards: one per different digit in the roll */
    String(r.roll || "")
      .replace(/\D/g, "")
      .split("")
      .forEach((c) => (d["d" + c] = 1));
    /* pattern mats from the badges you hit */
    (r.badges || []).forEach((bd) => {
      const k = badgeMat(bd && bd.name);
      d[k] = (d[k] || 0) + (Number(bd && bd.oneIn) >= 1000 ? 2 : 1);
    });
    /* Gatherer's Gloves: +20% per level, 5% per level windfall (x3) */
    const gl = gloveLvl();
    const windfall = gl > 0 && Math.random() < 0.05 * gl;
    Object.keys(d).forEach((k) => {
      let v = d[k] * (1 + 0.2 * gl) * (windfall ? 3 : 1);
      v = Math.floor(v) + (Math.random() < v - Math.floor(v) ? 1 : 0);
      d[k] = v;
      F.mats[k] = (F.mats[k] || 0) + v;
    });
    const show = fmtDrop(d);
    if (windfall) say("🧤 WINDFALL! Drops tripled " + show);
    else if (show) say("🔨 " + show);
    if (F.tonicLeft > 0) F.tonicLeft--;
    if (bossLive()) {
      const gain = (3 + t * 0.5) * (1 + 0.1 * F.perks.ult);
      F.charge = Math.min(100, F.charge + gain);
    }
    migrateLucky();
    save();
    refreshBar();
  });

  /* old shop lucky charms become Forge lucky charms */
  function migrateLucky() {
    const sh = shopS();
    if (sh && sh.lucky > 0) {
      F.items.lucky += sh.lucky;
      say(
        `🍀 ${sh.lucky} Lucky Charm${sh.lucky > 1 ? "s" : ""} moved to the Forge.`,
      );
      sh.lucky = 0;
      if (G.__drShop.save) G.__drShop.save();
      save();
    }
  }
  setTimeout(migrateLucky, 1200);

  /* guaranteed badges: event luck (shop.js) + a Forge Lucky Charm */
  const prevLuck = G.drLuckCount;
  G.drLuckCount = function () {
    let n = typeof prevLuck === "function" ? prevLuck() : 0;
    if (F.items.lucky > 0) {
      F.items.lucky--;
      n++;
      save();
    }
    return n;
  };

  /* ---------- pattern charms ---------- */
  const rollLen = () =>
    typeof G.drRollLength === "function" ? G.drRollLength() : 5;
  const seqKind = (q) => {
    if (/^(\d)\1+$/.test(q)) return "twin";
    const dd = q.split("").map(Number);
    if (
      dd.length >= 3 &&
      (dd.every((x, i) => i === 0 || x === dd[i - 1] + 1) ||
        dd.every((x, i) => i === 0 || x === dd[i - 1] - 1))
    )
      return "chain";
    if (q.length >= 3 && q === q.split("").reverse().join("")) return "mirror";
    return "lore";
  };
  /* a pattern is priced by how rare it is as a roll: the game's own analyzer rates the sequence,
     every cost is multiplied by 1 + log10(1-in-N)/5 and rare patterns also eat rare tier mats */
  function patRarity(q) {
    try {
      const a = analyze(q.split(""));
      return {
        name: String(a.rarity),
        oneIn: Math.max(1, Number(a.oneIn) || 1),
      };
    } catch (e) {
      return { name: "WORTHLESS", oneIn: 1 };
    }
  }
  const patMult = (q) => 1 + Math.log10(patRarity(q).oneIn) / 5;
  function patternCost(q) {
    const base = { dust: 20 * q.length };
    q.split("").forEach((ch) => (base["d" + ch] = (base["d" + ch] || 0) + 2));
    const k = seqKind(q);
    base[k] =
      (base[k] || 0) + (k === "mirror" ? Math.ceil(q.length / 2) : q.length);
    if (q.indexOf("7") >= 0)
      base.clover = (base.clover || 0) + q.split("7").length - 1;
    const m = patMult(q);
    const c = {};
    Object.keys(base).forEach((x) => (c[x] = Math.ceil(base[x] * m)));
    const d = drops(P.tierOf(patRarity(q).name));
    ["spark", "ember", "prism", "void"].forEach((x) => {
      if (d[x]) c[x] = (c[x] || 0) + d[x] * 3;
    });
    return c;
  }
  const PRESETS = [
    ["Triple", "777"],
    ["Straight", "12345"],
    ["Countdown", "5432"],
    ["Mirror", "1221"],
    ["Quad", "8888"],
    ["Mirror 5", "12321"],
  ];
  function craftPattern(q) {
    q = String(q || "").replace(/\D/g, "");
    if (q.length < 2 || q.length > 5)
      return say("Patterns are 2–5 digits long.");
    const c = patternCost(q);
    if (!canPay(c)) return say("Not enough materials.");
    pay(c);
    draft = "";
    F.patterns.push({ parts: [q] });
    F.crafted++;
    save();
    sfx("charm");
    say(`🧩 Pattern charm ${q} crafted!`);
    rerender();
  }
  const patLen = (p) => p.parts.reduce((n, x) => n + x.length, 0);
  const patLabel = (p) => p.parts.join(" + ");
  function fuse(mode) {
    const idx = sel.filter((i) => F.patterns[i]);
    if (idx.length < 2)
      return say("Select at least two pattern charms to fuse.");
    const ps = idx.map((i) => F.patterns[i]);
    const total = ps.reduce((n, p) => n + patLen(p), 0);
    if (total > 11) return say("Fused charms can be at most 11 digits long.");
    const n = idx.length;
    const c = fuseCost(n);
    if (!canPay(c)) return say("Not enough materials to fuse.");
    pay(c);
    const parts =
      mode === "chain"
        ? [ps.map((p) => p.parts.join("")).join("")]
        : [].concat(...ps.map((p) => p.parts));
    F.patterns = F.patterns.filter((_, i) => idx.indexOf(i) < 0);
    F.patterns.push({ parts, fused: true });
    F.fused++;
    sel = [];
    save();
    sfx("buy");
    say(`🔗 Fused into ${parts.join(" + ")}!`);
    rerender();
  }
  const fuseMult = () => {
    const ps = sel.filter((i) => F.patterns[i]).map((i) => F.patterns[i]);
    if (!ps.length) return 1;
    return ps.reduce((m, p) => m + patMult(p.parts.join("")), 0) / ps.length;
  };
  const fuseCost = (n) => {
    const m = fuseMult();
    return {
      dust: Math.ceil(50 * n * m),
      prism: Math.ceil(n * m),
      void: Math.ceil((n - 1) * m),
    };
  };
  function discardPattern(i) {
    F.patterns.splice(i, 1);
    sel = [];
    save();
    rerender();
  }
  /* wrap the shop's number-charm hook: place the first usable pattern charm into the roll */
  function placeParts(chars, parts) {
    const len = chars.length;
    for (let attempt = 0; attempt < 40; attempt++) {
      const used = [];
      const starts = [];
      let ok = true;
      for (const q of parts.slice().sort(() => Math.random() - 0.5)) {
        const st = Math.floor(Math.random() * (len - q.length + 1));
        if (used.some(([a, b]) => st < b && st + q.length > a)) {
          ok = false;
          break;
        }
        used.push([st, st + q.length]);
        starts.push([q, st]);
      }
      if (ok) {
        starts.forEach(([q, st]) =>
          q.split("").forEach((ch, i) => (chars[st + i] = ch)),
        );
        return true;
      }
    }
    /* crowded: line them up from the left */
    let at = 0;
    parts.forEach((q) => {
      q.split("").forEach((ch, i) => (chars[at + i] = ch));
      at += q.length;
    });
    return true;
  }
  const prevApply = G.drApplyCharms;
  G.drApplyCharms = function (chars) {
    const applied =
      typeof prevApply === "function" ? prevApply.apply(this, arguments) : [];
    const i = F.patterns.findIndex((p) => patLen(p) <= chars.length);
    if (i >= 0) {
      const p = F.patterns.splice(i, 1)[0];
      placeParts(chars, p.parts);
      F.patternsUsed++;
      sel = [];
      save();
      say(`🧩 ${p.fused ? "Fusion" : "Pattern"} charm used: ${patLabel(p)}`);
    }
    return applied;
  };

  /* ---------- hooks into boss damage / curses / xp ---------- */
  const prevMod = G.drBossMod;
  G.drBossMod = function (dmg) {
    let d = typeof prevMod === "function" ? prevMod(dmg) : dmg;
    const r = G.__drBossRoll;
    const t = r ? P.tierOf(r.rarity) : 0;
    if (F.perks.combo > 0) {
      combo = t >= TI("EPIC") ? Math.min(combo + 1, 4 + 4 * F.perks.combo) : 0;
      F.bestCombo = Math.max(F.bestCombo, combo);
      d *= 1 + 0.03 * combo;
    }
    d *= 1 + 0.08 * F.perks.edge;
    if (F.perks.crit > 0 && Math.random() < 0.06 * F.perks.crit) {
      d *= 4;
      say("🎯 CRITICAL HIT ×4!");
      sfx("buy");
    }
    if (F.armed === "bomb" || F.armed === "nuke") {
      d *= F.armed === "bomb" ? 8 : 40;
      say(
        F.armed === "bomb" ? "💣 RIFT BOMB detonated ×8!" : "🌌 VOID NUKE ×40!",
      );
      sfx("curse");
      F.armed = "";
    }
    save();
    refreshBar();
    return d;
  };

  const prevCurse = G.drBossCurseMod;
  G.drBossCurseMod = function (loss) {
    let l = typeof prevCurse === "function" ? prevCurse(loss) : loss;
    l *= 1 - 0.12 * F.perks.will;
    if (F.scrollLeft > 0) {
      F.scrollLeft--;
      l = 1;
      say(`📜 Warding Scroll absorbed the curse! (${F.scrollLeft} left)`);
      save();
      refreshBar();
    }
    return l;
  };

  const prevXP = G.drEventXP;
  G.drEventXP = function () {
    const b = typeof prevXP === "function" ? prevXP() : 1;
    return (b == null ? 1 : b) * (F.tonicLeft > 0 ? 1.5 : 1);
  };

  /* ---------- actions ---------- */
  function craft(id) {
    const it = ITEMS.find((x) => x.id === id);
    if (!it || !canPay(it.cost)) return;
    pay(it.cost);
    F.items[id]++;
    F.crafted++;
    save();
    sfx("buy");
    say(`${it.icon} Crafted ${it.name}!`);
    rerender();
  }
  function use(id) {
    if (F.items[id] <= 0) return;
    if (id === "bomb" || id === "nuke") {
      if (!bossLive()) return say("Bombs only work while a boss is alive.");
      if (F.armed) return say("A bomb is already armed.");
      F.armed = id;
    } else if (id === "scroll") {
      F.scrollLeft += 3;
    } else if (id === "tonic") {
      F.tonicLeft += 25;
    } else if (id === "cell") {
      F.charge = 100;
    }
    F.items[id]--;
    save();
    sfx("open");
    say("Used!");
    rerender();
  }
  function buyGloves() {
    const sh = shopS();
    if (!sh) return;
    const lvl = gloveLvl();
    if (lvl >= GLOVES.length) return;
    const c = GLOVES[lvl].cost;
    if (!canPay(c)) return;
    pay(c);
    sh.gloves = lvl + 1;
    if (G.__drShop.save) G.__drShop.save();
    F.crafted++;
    save();
    sfx("buy");
    say(`🧤 ${GLOVES[lvl].name} crafted!`);
    rerender();
  }
  function levelUp(id) {
    const p = PERKS.find((x) => x.id === id);
    if (!p || F.perks[id] >= p.max) return;
    const c = p.cost(F.perks[id] + 1);
    if (!canPay(c)) return;
    pay(c);
    F.perks[id]++;
    save();
    sfx("buy");
    say(`${p.icon} ${p.name} → level ${F.perks[id]}!`);
    rerender();
  }
  function ultimate() {
    const b = G.drBoss;
    if (F.charge < 100 || !bossLive() || typeof G.drBossHit !== "function")
      return;
    const dealt = G.drBossHit(
      Number(b.ev.max_hp) * (0.04 + 0.01 * F.perks.ult),
    );
    if (!dealt) return;
    F.charge = 0;
    F.ults++;
    save();
    sfx("curse");
    say(`💥 ULTIMATE! ${nf(dealt)} damage!`);
    flash();
    refreshBar();
  }
  function flash() {
    const f = document.createElement("div");
    f.style.cssText =
      "position:fixed;inset:0;z-index:9990;pointer-events:none;background:radial-gradient(circle,#fff,rgba(255,200,120,.5) 50%,transparent 80%);animation:frgFlash .6s ease-out forwards";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
  }

  /* ---------- Forge tab ---------- */
  const chip = (k) =>
    `<div class="frgMat" title="${MATS[k].from}"><span>${MATS[k].icon}</span><b>${nf(F.mats[k])}</b><small>${MATS[k].name}</small></div>`;

  function renderPatterns() {
    const rl = rollLen();
    const inv = F.patterns.length
      ? F.patterns
          .map((p, i) => {
            const on = sel.indexOf(i);
            const tooLong = patLen(p) > rl;
            return `<div class="frgPat ${on >= 0 ? "on" : ""}" data-sel="${i}"><span class="frgPatNo">${i === 0 ? "NEXT" : "#" + (i + 1)}</span><b>${p.fused ? "🔗 " : "🧩 "}${patLabel(p)}</b>${on >= 0 ? `<i>${on + 1}</i>` : ""}${tooLong ? `<small class="pgSub"> needs ${patLen(p)} digits</small>` : ""}<button class="frgX" data-del="${i}" title="Discard">✕</button></div>`;
          })
          .join("")
      : '<div class="pgSub">No pattern charms yet — craft one below.</div>';
    const n = sel.length;
    const fc = n >= 2 ? fuseCost(n) : null;
    const fuseHint =
      n >= 2
        ? `Fuse ${n} charms: ${matCost(fc)}`
        : "Click two or more charms above to select them for fusing (the click order matters for chains).";
    const canFuse = n >= 2 && canPay(fc);
    return `<div class="pgBanner" style="font-weight:600">🧩 <b>Pattern charms</b> work like number charms, but the digits go in a <b>specific order</b>, side by side, so you can aim for a badge. One charm is used per roll, first in line first. Craft any 2–5 digit sequence. <b>The rarer the pattern is as a roll, the more it costs</b> (all costs scale up, and the rarest patterns also eat Sparks, Embers, Prisms or Void Shards). <b>Fusing</b> charms makes longer or double patterns for much rarer rolls: <b>Chain</b> joins them into one long sequence, <b>Split</b> places all of them in the same roll.</div>
      <h3 class="frgH">🎒 Your charms <small class="pgSub">(your rolls are ${rl} digits)</small></h3>
      <div class="frgInv">${inv}</div>
      <div class="frgRow" style="margin:10px 0 4px"><button class="drBuy" data-fuse="chain" ${canFuse ? "" : "disabled"}>🔗 Fuse: Chain</button><button class="drBuy" data-fuse="split" ${canFuse ? "" : "disabled"}>✂️ Fuse: Split</button></div>
      <p class="pgSub">${fuseHint}</p>
      <h3 class="frgH">🛠️ Craft a pattern charm</h3>
      <div class="frgRow" style="flex-wrap:wrap;margin-bottom:8px">${PRESETS.map(([n2, q]) => `<button class="drBuy frgPre" data-pre="${q}">${n2} ${q} <small>· ${patRarity(q).name.toLowerCase()}</small></button>`).join("")}</div>
      <div class="frgRow"><input id="frgIn" class="frgIn" inputmode="numeric" maxlength="5" placeholder="type 2–5 digits, e.g. 1337" value="${draft}"><button class="drBuy" id="frgMake" disabled>Craft</button></div>
      <p class="pgSub" id="frgCost">Cost: —</p>`;
  }

  function renderGear() {
    const items = ITEMS.map((it) => {
      const can = canPay(it.cost);
      const have = F.items[it.id];
      return `<div class="pgCard"><h3>${it.icon} ${it.name} <small class="pgSub">owned: ${have}</small></h3><p>${it.desc}</p><p>Cost: ${matCost(it.cost)}</p>
        <div class="frgRow"><button class="drBuy" data-craft="${it.id}" ${can ? "" : "disabled"}>${can ? "Craft" : "Need materials"}</button>
        ${it.auto ? "" : `<button class="drBuy" data-use="${it.id}" ${have > 0 ? "" : "disabled"}>${it.id === "bomb" || it.id === "nuke" ? "Arm" : "Use"}</button>`}</div></div>`;
    }).join("");
    const gl = gloveLvl();
    const g = gl < GLOVES.length ? GLOVES[gl] : null;
    const gloves = `<div class="pgCard"><h3>🧤 Gatherer's Gloves <small class="pgSub">Lv ${gl}/${GLOVES.length}</small></h3>
      <p>Permanent. Every level: <b>+20% materials</b> from every roll and a <b>5% chance of a ×3 windfall</b>. ${gl ? `Now: +${20 * gl}% / ${5 * gl}% windfall.` : ""}</p>
      ${g ? `<p>Next (${g.name}): ${matCost(g.cost)}</p><button class="drBuy" data-gloves="1" ${canPay(g.cost) ? "" : "disabled"}>${canPay(g.cost) ? "Craft" : "Need materials"}</button>` : "<p><b>MAX</b></p>"}</div>`;
    return `<div class="frgGrid">${gloves}${items}</div>`;
  }

  function renderSkills() {
    return `<div class="frgGrid">${PERKS.map((p) => {
      const l = F.perks[p.id];
      const maxed = l >= p.max;
      const c = maxed ? {} : p.cost(l + 1);
      const can = !maxed && canPay(c);
      return `<div class="pgCard"><h3>${p.icon} ${p.name} <small class="pgSub">Lv ${l}/${p.max}</small></h3>
        <p>${l ? p.desc(l) : "Not learned yet"}${!maxed ? `<br><span class="pgSub">Next: ${p.desc(l + 1)}</span>` : ""}</p>
        ${maxed ? "<p><b>MAX</b></p>" : `<p>Cost: ${matCost(c)}</p>`}
        <button class="drBuy" data-perk="${p.id}" ${can ? "" : "disabled"}>${maxed ? "Maxed" : can ? "Upgrade" : "Need materials"}</button></div>`;
    }).join("")}</div>`;
  }

  function renderForge() {
    const subs = [
      ["patterns", "🧩 Pattern Charms"],
      ["gear", "🧰 Gear & Gloves"],
      ["skills", "⚔️ Boss Skills"],
    ];
    return `<style>
      .frgMats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
      .frgMat{flex:1;min-width:88px;padding:7px 6px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);text-align:center}
      .frgMat span{font-size:18px}.frgMat b{display:block;font-size:16px}.frgMat small{color:#aab5ca;font-size:10px;display:block;line-height:1.2}
      .frgMats.dig .frgMat{min-width:58px;flex:1 1 58px}
      .frgGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-bottom:22px}
      .frgRow{display:flex;gap:8px;align-items:center}.frgH{margin:14px 0 8px}
      .frgInv{display:flex;flex-direction:column;gap:6px}
      .frgPat{display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);cursor:pointer;font-size:17px;letter-spacing:1px}
      .frgPat.on{border-color:#8ee6ad;background:rgba(142,230,173,.14)}
      .frgPat i{font-style:normal;background:#8ee6ad;color:#031;border-radius:99px;min-width:22px;text-align:center;font-weight:900;font-size:13px}
      .frgPatNo{font-size:11px;color:#aab5ca;letter-spacing:0;min-width:40px}
      .frgX{margin-left:auto;border:0;background:rgba(255,255,255,.08);color:#fff;border-radius:8px;cursor:pointer;padding:3px 8px}
      .frgIn{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font:700 18px monospace;letter-spacing:3px}
      .frgRow .drBuy{width:auto;flex:1}
      .frgPre{padding:6px 10px!important;font-size:13px;flex:0 0 auto!important}
      .frgIn{min-width:0}
    </style>
    <div class="pgBanner">🔨 The Forge<br><span class="pgSub">Rolls drop materials: Dust, Sparks, Embers, Prisms and Void Shards by rarity, <b>digit shards</b> for every different digit you roll, and <b>pattern mats</b> from the badges you hit. Crafted: <b>${F.crafted}</b> • Charms used: <b>${F.patternsUsed}</b> • Fusions: <b>${F.fused}</b> • Ultimates: <b>${F.ults}</b>${F.tonicLeft ? ` • 🧪 ${F.tonicLeft} rolls` : ""}${F.scrollLeft ? ` • 📜 ${F.scrollLeft} curses` : ""}${F.armed ? ` • ${F.armed === "bomb" ? "💣" : "🌌"} ARMED` : ""}</span></div>
    <div class="frgMats">${TIER_MATS.concat(PAT_MATS).map(chip).join("")}</div>
    <div class="frgMats dig">${DIGIT_MATS.map(chip).join("")}</div>
    <div class="pgTabs" style="margin:14px 0">${subs.map(([k, l]) => `<button class="pgTab ${sub === k ? "on" : ""}" data-sub="${k}" type="button">${l}</button>`).join("")}</div>
    ${sub === "patterns" ? renderPatterns() : sub === "gear" ? renderGear() : renderSkills()}`;
  }
  function bindForge(root) {
    root
      .querySelectorAll("[data-sub]")
      .forEach((b) => (b.onclick = () => ((sub = b.dataset.sub), rerender())));
    root
      .querySelectorAll("[data-craft]")
      .forEach((b) => (b.onclick = () => craft(b.dataset.craft)));
    root
      .querySelectorAll("[data-use]")
      .forEach((b) => (b.onclick = () => use(b.dataset.use)));
    root
      .querySelectorAll("[data-perk]")
      .forEach((b) => (b.onclick = () => levelUp(b.dataset.perk)));
    root
      .querySelectorAll("[data-gloves]")
      .forEach((b) => (b.onclick = buyGloves));
    root
      .querySelectorAll("[data-fuse]")
      .forEach((b) => (b.onclick = () => fuse(b.dataset.fuse)));
    root
      .querySelectorAll("[data-del]")
      .forEach(
        (b) =>
          (b.onclick = (e) => (
            e.stopPropagation(),
            discardPattern(+b.dataset.del)
          )),
      );
    root.querySelectorAll("[data-sel]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.sel;
          const at = sel.indexOf(i);
          if (at >= 0) sel.splice(at, 1);
          else sel.push(i);
          rerender();
        }),
    );
    const inp = root.querySelector("#frgIn");
    if (inp) {
      const upd = () => {
        draft = inp.value.replace(/\D/g, "").slice(0, 5);
        if (inp.value !== draft) inp.value = draft;
        const ok = draft.length >= 2;
        const c = ok ? patternCost(draft) : null;
        root.querySelector("#frgCost").innerHTML = ok
          ? `Pattern rarity: <b>${patRarity(draft).name}</b> (1 in ${big(patRarity(draft).oneIn)}) • cost ×${patMult(draft).toFixed(1)}<br>Cost: ${matCost(c)}`
          : "Cost: —";
        root.querySelector("#frgMake").disabled = !ok || !canPay(c);
      };
      inp.oninput = upd;
      root.querySelector("#frgMake").onclick = () => {
        craftPattern(draft);
      };
      root.querySelectorAll("[data-pre]").forEach(
        (b) =>
          (b.onclick = () => {
            inp.value = b.dataset.pre;
            upd();
          }),
      );
      upd();
    }
  }
  const rerender = () => P.rerender && P.rerender();
  P.addTab("forge", "🔨 Forge", renderForge, bindForge);

  /* ---------- boss action bar ---------- */
  const st = document.createElement("style");
  st.textContent = `@keyframes frgFlash{from{opacity:1}to{opacity:0}}
  #frgBar{position:fixed;right:14px;bottom:14px;z-index:9000;display:none;flex-direction:column;gap:8px;width:230px;padding:12px;border-radius:16px;background:rgba(14,18,34,.92);border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.5);color:#fff;font:700 13px system-ui,sans-serif}
  #frgBar .frgMeter{height:12px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
  #frgBar .frgMeter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7cf7ff,#ffd36b,#ff4fd8);transition:width .25s}
  #frgBar button{border:0;border-radius:10px;padding:8px 10px;font-weight:900;cursor:pointer;color:#fff;background:#3a4570}
  #frgBar button:disabled{opacity:.4;cursor:default}
  #frgBar .frgUlt:not(:disabled){background:linear-gradient(90deg,#ff4fd8,#ffb52e);animation:frgPulse .8s infinite alternate;color:#210}
  @keyframes frgPulse{to{transform:scale(1.04);box-shadow:0 0 18px #ffb52e}}
  #frgBar .frgTop{display:flex;justify-content:space-between}`;
  document.head.appendChild(st);
  const bar = document.createElement("div");
  bar.id = "frgBar";
  bar.innerHTML = `<div class="frgTop"><span>⚔️ BATTLE BAR</span><span id="frgCombo"></span></div>
    <div class="frgMeter"><i id="frgCharge"></i></div>
    <button class="frgUlt" id="frgUlt" type="button">💥 ULTIMATE</button>
    <div style="display:flex;gap:6px"><button id="frgBomb" type="button" style="flex:1"></button><button id="frgNuke" type="button" style="flex:1"></button></div>
    <button id="frgScroll" type="button"></button>`;
  document.body.appendChild(bar);
  const $ = (id) => document.getElementById(id);
  $("frgUlt").onclick = ultimate;
  $("frgBomb").onclick = () => use("bomb");
  $("frgNuke").onclick = () => use("nuke");
  $("frgScroll").onclick = () => use("scroll");

  function refreshBar() {
    const live = bossLive();
    bar.style.display = live ? "flex" : "none";
    if (!live) {
      combo = 0;
      return;
    }
    $("frgCharge").style.width = F.charge + "%";
    $("frgUlt").disabled = F.charge < 100;
    $("frgUlt").textContent =
      F.charge >= 100
        ? "💥 ULTIMATE — READY!"
        : `💥 Ultimate ${Math.floor(F.charge)}%`;
    $("frgCombo").textContent = F.perks.combo ? `🔥 x${combo}` : "";
    $("frgBomb").textContent =
      F.armed === "bomb" ? "💣 ARMED" : `💣 Bomb (${F.items.bomb})`;
    $("frgBomb").disabled = !!F.armed || F.items.bomb <= 0;
    $("frgNuke").textContent =
      F.armed === "nuke" ? "🌌 ARMED" : `🌌 Nuke (${F.items.nuke})`;
    $("frgNuke").disabled = !!F.armed || F.items.nuke <= 0;
    $("frgScroll").textContent = F.scrollLeft
      ? `📜 Ward active: ${F.scrollLeft}`
      : `📜 Read Scroll (${F.items.scroll})`;
    $("frgScroll").disabled = F.items.scroll <= 0;
  }
  setInterval(refreshBar, 700);
  refreshBar();

  G.drForge = {
    state: () => F,
    drops,
    addItem: (id, n) => {
      F.items[id] = (F.items[id] || 0) + (n || 1);
      save();
    },
    addMat: (k, n) => {
      F.mats[k] = (F.mats[k] || 0) + (n || 1);
      save();
    },
  };
})();
