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

  /* ---------- boss materials (exclusive drops) ---------- */
  const BOSS_MAT_DEF = {
    golem: ["Golem Core", "🪨"],
    mimic: ["Vault Key", "🗝️"],
    drake: ["Drake Scale", "🐲"],
    wraith: ["Time Sand", "⏳"],
    kraken: ["Kraken Ink", "🦑"],
    titan: ["Titan Bolt", "🔩"],
    hydra: ["Hydra Fang", "🐍"],
    reality: ["Reality Shard", "🔮"],
    voidking: ["Crown Gem", "💠"],
    eternal: ["Eternal Link", "⛓️"],
    omega: ["Omega Core", "🔋"],
    devourer: ["Void Heart", "🕳️"],
    author: ["Final Ink", "✒️"],
  };
  const BOSS_KEYS = Object.keys(BOSS_MAT_DEF);
  const bm = (k) => "bm_" + k;
  const bossMats0 = {};
  BOSS_KEYS.forEach((k) => (bossMats0[bm(k)] = 0));

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
      ...bossMats0,
    },
    items: {
      bomb: 0,
      nuke: 0,
      scroll: 0,
      tonic: 0,
      cell: 0,
      lucky: 0,
      seer: 0,
      elixir: 0,
      mark: 0,
      magnet: 0,
      sing: 0,
      phoenix: 0,
      chrono: 0,
    },
    totems: {}, // boss totems crafted, by boss key
    seerLeft: 0,
    chronoLeft: 0,
    bossTrades: 0,
    elixirLeft: 0,
    markLeft: 0,
    magnetLeft: 0,
    summons: 0,
    trades: 0,
    bossDrops: 0,
    patterns: [], // [{ parts: ["123"] }]  placed into the next roll, first in line first
    pocket: [], // charms stored safely: never used by rolls until you take them out
    seen: {}, // materials you have ever found (journal)
    patternsUsed: 0,
    fused: 0,
    perks: {
      edge: 0,
      crit: 0,
      combo: 0,
      will: 0,
      ult: 0,
      exec: 0,
      might: 0,
      hunter: 0,
      scav: 0,
      bane: 0,
      harvest: 0,
      echo: 0,
      ascend: 0,
    },
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
        totems: Object.assign({}, raw.totems),
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
  MATS.star = {
    name: "Prestige Stars",
    icon: "★",
    from: "true rebirths & daily challenges (shared with the Prestige shop)",
  };
  BOSS_KEYS.forEach(
    (k) =>
      (MATS[bm(k)] = {
        name: BOSS_MAT_DEF[k][0],
        icon: BOSS_MAT_DEF[k][1],
        from: "defeating the " + k + " boss",
      }),
  );
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
  /* Forge mastery: every few crafts raises your level; each level shaves 2% off every cost (max 40%, Prestige Stars are never discounted) */
  const forgeLvl = () =>
    Math.min(
      25,
      Math.floor(Math.sqrt(F.crafted + (F.trades + F.bossTrades) / 4)),
    );
  const forgeDisc = () => Math.min(0.4, 0.02 * forgeLvl());
  const eff = (c) => {
    const o = {};
    Object.keys(c).forEach(
      (k) =>
        (o[k] =
          k === "star"
            ? c[k]
            : Math.max(1, Math.ceil(c[k] * (1 - forgeDisc())))),
    );
    return o;
  };
  const have = (k) => (k === "star" ? P.points() : F.mats[k] || 0);
  const matCost = (c0) => {
    const c = eff(c0);
    return Object.keys(c)
      .map((k) => `${MATS[k].icon} ${c[k]}`)
      .join(" ");
  };
  const canPay = (c0) => {
    const c = eff(c0);
    return Object.keys(c).every((k) => have(k) >= c[k]);
  };
  const pay = (c0) => {
    const c = eff(c0);
    Object.keys(c).forEach((k) => {
      if (k === "star") P.spendPoints(c[k]);
      else F.mats[k] -= c[k];
    });
  };

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
      id: "seer",
      icon: "🧿",
      name: "Seer's Eye",
      cost: { clover: 8, lore: 5, prism: 1 },
      desc: "Use it: your next <b>5 rolls</b> each get <b>+1 guaranteed badge</b>.",
    },
    {
      id: "elixir",
      icon: "🍯",
      name: "Golden Elixir",
      cost: { ember: 4, formula: 6, dust: 100 },
      desc: "Drink it: <b>×2 XP</b> for your next 10 rolls (stacks with Fortune Tonic).",
    },
    {
      id: "mark",
      icon: "🎯",
      name: "Hunter's Mark",
      cost: { spark: 12, twin: 6, mirror: 6 },
      desc: "Use it: your next <b>10 boss hits</b> deal <b>×2</b> damage.",
    },
    {
      id: "magnet",
      icon: "🧲",
      name: "Material Magnet",
      cost: { dust: 150, chain: 6, twin: 6, formula: 6 },
      desc: "Use it: <b>×2 materials</b> from your next 20 rolls.",
    },
    {
      id: "sing",
      icon: "🕳️",
      name: "Singularity Bomb",
      late: true,
      cost: { void: 6, bm_reality: 4, bm_voidking: 2, star: 2 },
      desc: "Late game. Arm it: your next boss hit deals <b>×500</b> damage (still soft-capped by the boss).",
    },
    {
      id: "phoenix",
      icon: "🪶",
      name: "Phoenix Feather",
      late: true,
      cost: { prism: 8, bm_titan: 6, bm_hydra: 3, star: 1 },
      desc: "Late game. Use it: the next <b>10 curses</b> cost you only 1 XP each.",
    },
    {
      id: "chrono",
      icon: "⏳",
      name: "Chrono Draught",
      late: true,
      cost: { void: 4, ember: 20, bm_wraith: 6, bm_kraken: 4 },
      desc: "Late game. Drink it: <b>×4 XP</b> for your next 5 rolls (stacks with the other brews).",
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
  const rebirths = () =>
    G.__drShop && G.__drShop.S ? Number(G.__drShop.S.rebirths) || 0 : 0;
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
      id: "exec",
      icon: "🪓",
      name: "Executioner",
      max: 5,
      desc: (l) => `+${20 * l}% damage while the boss is under 25% HP`,
      cost: (n) => ({ bm_golem: 2 * n, ember: 2 * n }),
    },
    {
      id: "hunter",
      icon: "🏹",
      name: "Trophy Hunter",
      max: 5,
      desc: (l) => `+${10 * l}% boss material drops from every victory`,
      cost: (n) => ({ bm_mimic: n + 1, spark: 5 * n }),
    },
    {
      id: "might",
      icon: "★",
      name: "Prestige Might",
      max: 5,
      desc: (l) => `+${10 * l}% boss damage, powered by your Prestige Stars`,
      cost: (n) => ({ star: 2 * n, prism: n }),
    },
    {
      id: "scav",
      icon: "🦝",
      name: "Scavenger",
      max: 5,
      desc: (l) => `+${10 * l}% materials from every roll`,
      cost: (n) => ({ star: n, dust: 150 * n }),
    },
    {
      id: "bane",
      icon: "☠️",
      name: "Boss Bane",
      late: true,
      max: 10,
      desc: (l) => `+${12 * l}% boss damage`,
      cost: (n) => ({ bm_hydra: 3 * n, bm_voidking: n + 1, star: n }),
    },
    {
      id: "harvest",
      icon: "🌾",
      name: "Soul Harvest",
      late: true,
      max: 5,
      desc: (l) => `+${20 * l}% XP from boss victories`,
      cost: (n) => ({ bm_reality: 2 * n + 2, bm_eternal: n, star: n }),
    },
    {
      id: "echo",
      icon: "🔊",
      name: "Rebirth Echo",
      late: true,
      max: 5,
      desc: (l) =>
        `+${2 * l}% materials per rebirth you have done (now +${2 * l * rebirths()}%)`,
      cost: (n) => ({ bm_voidking: 2 * n, bm_omega: n, prism: 4 * n }),
    },
    {
      id: "ascend",
      icon: "🌠",
      name: "Ascension",
      late: true,
      max: 10,
      desc: (l) => `+${4 * l}% XP on every roll, forever`,
      cost: (n) => ({ star: 3 * n, bm_omega: 2 * n, void: 3 * n }),
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
      let v =
        d[k] *
        (1 + 0.2 * gl + 0.1 * F.perks.scav + 0.02 * F.perks.echo * rebirths()) *
        (windfall ? 3 : 1) *
        (F.magnetLeft > 0 ? 2 : 1);
      v = Math.floor(v) + (Math.random() < v - Math.floor(v) ? 1 : 0);
      d[k] = v;
      F.mats[k] = (F.mats[k] || 0) + v;
      if (v > 0) F.seen[k] = true;
    });
    const show = fmtDrop(d);
    if (windfall) say("🧤 WINDFALL! Drops tripled " + show);
    else if (show) say("🔨 " + show);
    if (F.tonicLeft > 0) F.tonicLeft--;
    if (F.elixirLeft > 0) F.elixirLeft--;
    if (F.chronoLeft > 0) F.chronoLeft--;
    if (F.magnetLeft > 0) F.magnetLeft--;
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
    if (F.seerLeft > 0) {
      F.seerLeft--;
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
  const maxPat = () => Math.min(8, Math.max(5, rollLen()));
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
    if (q.length < 2 || q.length > maxPat())
      return say(`Patterns are 2–${maxPat()} digits long.`);
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
  function pocketPattern(i) {
    const p = F.patterns[i];
    if (!p) return;
    F.patterns.splice(i, 1);
    F.pocket.push(p);
    sel = [];
    save();
    sfx("click");
    rerender();
  }
  function takeOut(j) {
    const p = F.pocket[j];
    if (!p) return;
    F.pocket.splice(j, 1);
    F.patterns.push(p);
    save();
    sfx("click");
    rerender();
  }
  function discardPocket(j) {
    F.pocket.splice(j, 1);
    save();
    rerender();
  }
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
    d *= 1 + 0.08 * F.perks.edge + 0.1 * F.perks.might + 0.12 * F.perks.bane;
    try {
      const bb = G.drBoss;
      if (
        F.perks.exec > 0 &&
        bb &&
        bb.ev &&
        Number(bb.hp()) < Number(bb.ev.max_hp) * 0.25
      )
        d *= 1 + 0.2 * F.perks.exec;
    } catch (e) {}
    if (F.markLeft > 0) {
      F.markLeft--;
      d *= 2;
    }
    if (F.perks.crit > 0 && Math.random() < 0.06 * F.perks.crit) {
      d *= 4;
      say("🎯 CRITICAL HIT ×4!");
      sfx("buy");
    }
    if (F.armed === "bomb" || F.armed === "nuke" || F.armed === "sing") {
      d *= F.armed === "bomb" ? 8 : F.armed === "nuke" ? 40 : 500;
      say(
        F.armed === "bomb"
          ? "💣 RIFT BOMB detonated ×8!"
          : F.armed === "nuke"
            ? "🌌 VOID NUKE ×40!"
            : "🕳️ SINGULARITY ×500!",
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
    return (
      (b == null ? 1 : b) *
      (F.tonicLeft > 0 ? 1.5 : 1) *
      (F.elixirLeft > 0 ? 2 : 1) *
      (F.chronoLeft > 0 ? 4 : 1) *
      (1 + 0.04 * F.perks.ascend)
    );
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
    if (id === "bomb" || id === "nuke" || id === "sing") {
      if (!bossLive()) return say("Bombs only work while a boss is alive.");
      if (F.armed) return say("A bomb is already armed.");
      F.armed = id;
    } else if (id === "scroll") {
      F.scrollLeft += 3;
    } else if (id === "tonic") {
      F.tonicLeft += 25;
    } else if (id === "cell") {
      F.charge = 100;
    } else if (id === "phoenix") {
      F.scrollLeft += 10;
    } else if (id === "chrono") {
      F.chronoLeft += 5;
    } else if (id === "seer") {
      F.seerLeft += 5;
    } else if (id === "elixir") {
      F.elixirLeft += 10;
    } else if (id === "mark") {
      if (!bossLive())
        return say("Hunter's Mark only works while a boss is alive.");
      F.markLeft += 10;
    } else if (id === "magnet") {
      F.magnetLeft += 20;
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

  /* ---------- boss drops, totems, transmuting ---------- */
  const bossApi = () => G.drBoss || null;
  const bossCfg = (k) => (bossApi() && bossApi().BOSSES[k]) || null;
  const bossOrder = () => (bossApi() && bossApi().ORDER) || BOSS_KEYS;
  const bossOpen = (k) => !bossApi() || bossApi().unlocked(bossCfg(k));
  const bossTier = (k) => {
    const c = bossCfg(k);
    return c && typeof c.tier === "number" ? c.tier : 0;
  };

  /* called when you beat a boss: exclusive material of that boss (+ a bit of Stars from the hardest ones) */
  function bossDrop(type) {
    if (BOSS_KEYS.indexOf(type) < 0) return "";
    const t = bossTier(type);
    const n = Math.round(
      (3 + 2 * t + Math.floor(Math.random() * 3)) *
        (1 + 0.1 * F.perks.hunter) *
        (1 + BOSS_KEYS.indexOf(type) * 0.12),
    );
    const k = bm(type);
    F.mats[k] = (F.mats[k] || 0) + n;
    F.seen[k] = true;
    F.bossDrops++;
    let txt = `+${n} ${MATS[k].icon} ${MATS[k].name}`;
    /* an extra ordinary drop: a stack of tier materials */
    const extra = { spark: 4 + 3 * t, ember: 1 + 2 * t };
    if (t >= 3) extra.prism = t - 1;
    Object.keys(extra).forEach((x) => {
      F.mats[x] += extra[x];
      txt += ` +${extra[x]} ${MATS[x].icon}`;
    });
    const cfg = bossCfg(type);
    if (cfg && cfg.minRebirth) {
      P.addPoints(cfg.minRebirth);
      txt += ` +${cfg.minRebirth} ★`;
    }
    save();
    return txt;
  }

  /* totem cost: its own boss material, the previous boss's material, Stars and a tier material */
  function totemCost(type) {
    const order = bossOrder();
    const i = Math.max(0, order.indexOf(type));
    const c = {
      [bm(type)]: 4 + i,
      star: 1 + Math.floor(i / 2),
      dust: 100 * (i + 1),
    };
    if (i > 0) c[bm(order[i - 1])] = 3;
    if (i < 3) c.spark = 5 * (i + 1);
    else if (i < 6) c.ember = 4 * (i - 2);
    else if (i < 9) c.prism = 3 * (i - 5);
    else c.void = 2 * (i - 8);
    return c;
  }
  function craftTotem(type) {
    if (!bossOpen(type))
      return say("🔒 You can't forge this totem until you've rebirthed more.");
    const c = totemCost(type);
    if (!canPay(c)) return say("Not enough materials.");
    pay(c);
    F.totems[type] = (F.totems[type] || 0) + 1;
    F.crafted++;
    save();
    sfx("buy");
    say(`🗿 ${bossCfg(type) ? bossCfg(type).short : type} Totem crafted!`);
    rerender();
  }
  let summoning = false;
  async function summon(type) {
    if (summoning || !(F.totems[type] > 0)) return;
    if (!bossOpen(type)) return say("🔒 Rebirth more times to use this totem.");
    if (bossLive()) return say("A boss is already alive.");
    const c = typeof supabaseClient !== "undefined" ? supabaseClient : null;
    if (!c || (typeof currentUser !== "undefined" && !currentUser))
      return say("Sign in to summon bosses.");
    summoning = true;
    try {
      const { data, error } = await c.rpc("boss_summon_totem", {
        p_type: type,
      });
      if (error) {
        say(
          /does not exist|schema cache|could not find/i.test(
            error.message || "",
          )
            ? "Run boss-totem-setup.sql in Supabase first."
            : error.message,
        );
      } else if (data && data.error) {
        say("🗿 " + data.error);
      } else {
        F.totems[type]--;
        F.summons++;
        save();
        sfx("curse");
        say("🗿 The totem shatters... the boss answers the call!");
        try {
          if (G.drBoss && G.drBoss.refresh) G.drBoss.refresh();
        } catch (e) {}
      }
    } catch (e) {
      say("Could not reach the server.");
    }
    summoning = false;
    rerender();
  }

  /* transmuting: climb the tier ladder, melt Stars, or swap digit / pattern materials */
  const LADDER = [
    ["dust", "spark", 40],
    ["spark", "ember", 6],
    ["ember", "prism", 6],
    ["prism", "void", 5],
  ];
  const SWAPPABLE = DIGIT_MATS.concat(PAT_MATS);
  function trade(from, to, times) {
    const rate = from === "star" ? 1 : 4;
    const cost = from === "star" ? 1 : rate;
    const lad = LADDER.find((x) => x[0] === from && x[1] === to);
    const need = (lad ? lad[2] : cost) * times;
    if (have(from) < need) return say("Not enough " + MATS[from].name + ".");
    if (from === "star") {
      if (!P.spendPoints(need)) return;
      const d = { dust: 30, spark: 8, ember: 2 };
      Object.keys(d).forEach((k) => (F.mats[k] += d[k] * times));
      say(`★ Melted ${need} Star${need > 1 ? "s" : ""} into materials.`);
    } else {
      F.mats[from] -= need;
      F.mats[to] = (F.mats[to] || 0) + times;
      F.seen[to] = true;
      say(
        `⚗️ Transmuted ${need} ${MATS[from].icon} into ${times} ${MATS[to].icon}.`,
      );
    }
    F.trades += times;
    save();
    sfx("click");
    rerender();
  }
  /* boss materials: climb to a stronger boss's material (costs more) or step down (cheap) */
  function bossTrade(from, to) {
    const order = bossOrder();
    const i = order.indexOf(from);
    const j = order.indexOf(to);
    if (i < 0 || j < 0 || i === j) return;
    const rate = j > i ? 4 + 2 * (j - i) : 2;
    const kf = bm(from);
    const kt = bm(to);
    if ((F.mats[kf] || 0) < rate)
      return say("Not enough " + MATS[kf].name + ".");
    F.mats[kf] -= rate;
    F.mats[kt] = (F.mats[kt] || 0) + 1;
    F.seen[kt] = true;
    F.bossTrades++;
    save();
    sfx("click");
    say(`⚗️ ${rate} ${MATS[kf].icon} → 1 ${MATS[kt].icon}`);
    rerender();
  }
  /* XP -> Dust: 20 XP per Dust */
  const XP_PER_DUST = 20;
  const xpNow = () => (typeof getXPBalance === "function" ? getXPBalance() : 0);
  function xpToDust(amount) {
    const dust = amount === "max" ? Math.floor(xpNow() / XP_PER_DUST) : amount;
    const cost = dust * XP_PER_DUST;
    if (dust < 1 || xpNow() < cost) return say("Not enough XP.");
    xpBalance = xpNow() - cost;
    xpSpent += cost;
    try {
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
      localStorage.setItem("digitRollXPSpent", String(xpSpent));
    } catch (e) {}
    F.mats.dust += dust;
    F.seen.dust = true;
    F.trades += Math.ceil(dust / 50);
    save();
    sfx("click");
    say(`✨ ${nf(cost)} XP → ${nf(dust)} Dust`);
    try {
      if (typeof updateShopUI === "function") updateShopUI();
    } catch (e) {}
    rerender();
  }
  /* Void Shards -> boss material: 2 + 1 per step up the boss ladder, per material */
  let vBoss = "golem";
  const voidRate = (k) => 2 + Math.max(0, bossOrder().indexOf(k));
  function voidTrade(k, times) {
    const need = voidRate(k) * times;
    if ((F.mats.void || 0) < need) return say("Not enough Void Shards.");
    F.mats.void -= need;
    F.mats[bm(k)] = (F.mats[bm(k)] || 0) + times;
    F.seen[bm(k)] = true;
    F.bossTrades += times;
    save();
    sfx("click");
    say(
      `🌑 ${need} Void Shards → ${times} ${MATS[bm(k)].icon} ${MATS[bm(k)].name}`,
    );
    rerender();
  }
  let bFrom = "golem";
  let bTo = "mimic";
  let swapFrom = "d0";
  let swapTo = "d1";

  /* ---------- Forge tab ---------- */
  const chip = (k) =>
    `<div class="frgMat" title="${MATS[k].from}"><span>${MATS[k].icon}</span><b>${nf(have(k))}</b><small>${MATS[k].name}</small></div>`;

  function renderPatterns() {
    const rl = rollLen();
    const inv = F.patterns.length
      ? F.patterns
          .map((p, i) => {
            const on = sel.indexOf(i);
            const tooLong = patLen(p) > rl;
            return `<div class="frgPat ${on >= 0 ? "on" : ""}" data-sel="${i}"><span class="frgPatNo">${i === 0 ? "NEXT" : "#" + (i + 1)}</span><b>${p.fused ? "🔗 " : "🧩 "}${patLabel(p)}</b>${on >= 0 ? `<i>${on + 1}</i>` : ""}${tooLong ? `<small class="pgSub"> needs ${patLen(p)} digits</small>` : ""}<button class="frgX" data-pocket="${i}" title="Put in your pocket (keeps it safe, no roll will use it)">👝</button><button class="frgX" data-del="${i}" title="Discard" style="margin-left:6px">✕</button></div>`;
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
    return `<div class="pgBanner" style="font-weight:600">🧩 <b>Pattern charms</b> work like number charms, but the digits go in a <b>specific order</b>, side by side, so you can aim for a badge. One charm is used per roll, first in line first. Craft any 2–${maxPat()} digit sequence (longer ones unlock as your rolls get longer). <b>The rarer the pattern is as a roll, the more it costs</b> (all costs scale up, and the rarest patterns also eat Sparks, Embers, Prisms or Void Shards). <b>Fusing</b> charms makes longer or double patterns for much rarer rolls: <b>Chain</b> joins them into one long sequence, <b>Split</b> places all of them in the same roll.</div>
      <h3 class="frgH">🎒 Your charms <small class="pgSub">(your rolls are ${rl} digits)</small></h3>
      <div class="frgInv">${inv}</div>
      <h3 class="frgH">👝 Charm pocket <small class="pgSub">(${F.pocket.length} stored — rolls never touch these)</small></h3>
      <div class="frgInv">${
        F.pocket.length
          ? F.pocket
              .map(
                (p, j) =>
                  `<div class="frgPat" style="cursor:default"><span class="frgPatNo">stored</span><b>${p.fused ? "🔗 " : "🧩 "}${patLabel(p)}</b><button class="frgX" data-take="${j}" title="Move to the end of the roll queue">▶ Take out</button><button class="frgX" data-delp="${j}" title="Discard" style="margin-left:6px">✕</button></div>`,
              )
              .join("")
          : '<div class="pgSub">Empty. Press 👝 on a queued charm to save it for later instead of using it on a roll.</div>'
      }</div>
      <div class="frgRow" style="margin:10px 0 4px"><button class="drBuy" data-fuse="chain" ${canFuse ? "" : "disabled"}>🔗 Fuse: Chain</button><button class="drBuy" data-fuse="split" ${canFuse ? "" : "disabled"}>✂️ Fuse: Split</button></div>
      <p class="pgSub">${fuseHint}</p>
      <h3 class="frgH">🛠️ Craft a pattern charm</h3>
      <div class="frgRow" style="flex-wrap:wrap;margin-bottom:8px">${PRESETS.map(([n2, q]) => `<button class="drBuy frgPre" data-pre="${q}">${n2} ${q} <small>· ${patRarity(q).name.toLowerCase()}</small></button>`).join("")}</div>
      <div class="frgRow"><input id="frgIn" class="frgIn" inputmode="numeric" maxlength="${maxPat()}" placeholder="type 2–${maxPat()} digits, e.g. 1337" value="${draft}"><button class="drBuy" id="frgMake" disabled>Craft</button></div>
      <p class="pgSub" id="frgCost">Cost: —</p>`;
  }

  function renderGear() {
    const items = ITEMS.map((it) => {
      const can = canPay(it.cost);
      const have = F.items[it.id];
      return `<div class="pgCard"><h3>${it.icon} ${it.name} ${it.late ? '<small class="pgSub">🌌 LATE GAME</small>' : ""} <small class="pgSub">owned: ${have}</small></h3><p>${it.desc}</p><p>Cost: ${matCost(it.cost)}</p>
        <div class="frgRow"><button class="drBuy" data-craft="${it.id}" ${can ? "" : "disabled"}>${can ? "Craft" : "Need materials"}</button>
        ${it.auto ? "" : `<button class="drBuy" data-use="${it.id}" ${have > 0 ? "" : "disabled"}>${it.id === "bomb" || it.id === "nuke" || it.id === "sing" ? "Arm" : "Use"}</button>`}</div></div>`;
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
      return `<div class="pgCard"><h3>${p.icon} ${p.name} ${p.late ? '<small class="pgSub">🌌 LATE GAME</small>' : ""} <small class="pgSub">Lv ${l}/${p.max}</small></h3>
        <p>${l ? p.desc(l) : "Not learned yet"}${!maxed ? `<br><span class="pgSub">Next: ${p.desc(l + 1)}</span>` : ""}</p>
        ${maxed ? "<p><b>MAX</b></p>" : `<p>Cost: ${matCost(c)}</p>`}
        <button class="drBuy" data-perk="${p.id}" ${can ? "" : "disabled"}>${maxed ? "Maxed" : can ? "Upgrade" : "Need materials"}</button></div>`;
    }).join("")}</div>`;
  }

  function renderTotems() {
    const live = bossLive();
    const cards = bossOrder()
      .map((k) => {
        const cfg = bossCfg(k);
        if (!cfg) return "";
        const open = bossOpen(k);
        if (!open && !(F.totems[k] > 0)) {
          return `<div class="pgCard frgJ unk"><h3>🔒 ??? Totem</h3><p>A totem for a boss that only <b>veterans who rebirthed ${cfg.minRebirth}+ time${cfg.minRebirth > 1 ? "s" : ""}</b> can face.</p></div>`;
        }
        const c = totemCost(k);
        const owned = F.totems[k] || 0;
        return `<div class="pgCard" style="border-color:${cfg.color}55"><h3>${cfg.icon} ${cfg.short} Totem <small class="pgSub">owned: ${owned}</small></h3>
          <p class="pgSub">${nf(cfg.hp).length > 14 ? cfg.hp.toExponential(0).replace("e+", " × 10^") : nf(cfg.hp)} HP • ${cfg.count} cursed roll${cfg.count > 1 ? "s" : ""} of ${cfg.size}${cfg.minRebirth ? ` • <b>Rebirth ${cfg.minRebirth}+</b>` : ""}</p>
          <p>Cost: ${matCost(c)}</p>
          <div class="frgRow"><button class="drBuy" data-totem="${k}" ${canPay(c) ? "" : "disabled"}>${canPay(c) ? "Craft" : "Need materials"}</button>
          <button class="drBuy" data-summon="${k}" ${owned > 0 && !live ? "" : "disabled"}>🗿 Summon</button></div></div>`;
      })
      .join("");
    return `<div class="pgBanner" style="font-weight:600">🗿 <b>Boss Totems</b> — craft a totem from a boss's own drops, then smash it to <b>summon that boss for everyone</b> (20 minutes). Needs no boss alive, and a totem can be used once every 5 minutes. Beat bosses to collect their exclusive materials, and use ★ Prestige Stars to bind them. Summons so far: <b>${F.summons}</b></div>
      <div class="frgGrid">${cards}</div>`;
  }

  function renderTrade() {
    const chain = LADDER.map(([a, b, n]) => {
      const row = (t) =>
        `<button class="drBuy" data-trade="${a}:${b}:${t}" ${have(a) >= n * t ? "" : "disabled"}>×${t}</button>`;
      return `<div class="pgCard"><h3>${MATS[a].icon} ${MATS[a].name} → ${MATS[b].icon} ${MATS[b].name}</h3><p class="pgSub">${n} ${MATS[a].name} → 1 ${MATS[b].name}</p><div class="frgRow">${row(1)}${row(10)}</div></div>`;
    }).join("");
    const star = `<div class="pgCard"><h3>★ Star Melt</h3><p class="pgSub">1 Prestige Star → 30 ✨ + 8 ⚡ + 2 🔥. Stars are shared with the Prestige shop, so melt carefully.</p>
      <div class="frgRow"><button class="drBuy" data-trade="star:dust:1" ${have("star") >= 1 ? "" : "disabled"}>Melt 1</button></div></div>`;
    const opt = (sel) =>
      SWAPPABLE.map(
        (k) =>
          `<option value="${k}" ${k === sel ? "selected" : ""}>${MATS[k].icon} ${MATS[k].name} (${nf(F.mats[k])})</option>`,
      ).join("");
    const swap = `<div class="pgCard"><h3>🔁 Shard Swap</h3><p class="pgSub">4 of any digit shard or pattern material → 1 of another.</p>
      <div class="frgRow"><select id="frgSwF" class="frgIn" style="font-size:14px;letter-spacing:0">${opt(swapFrom)}</select><span>→</span><select id="frgSwT" class="frgIn" style="font-size:14px;letter-spacing:0">${opt(swapTo)}</select></div>
      <div class="frgRow" style="margin-top:8px"><button class="drBuy" data-swap="1" ${swapFrom !== swapTo && have(swapFrom) >= 4 ? "" : "disabled"}>Swap</button></div></div>`;
    const open = bossOrder().filter(bossOpen);
    if (open.indexOf(bFrom) < 0) bFrom = open[0];
    if (open.indexOf(bTo) < 0) bTo = open[1] || open[0];
    const bo = (sel) =>
      open
        .map(
          (k) =>
            `<option value="${k}" ${k === sel ? "selected" : ""}>${MATS[bm(k)].icon} ${MATS[bm(k)].name} (${nf(F.mats[bm(k)])})</option>`,
        )
        .join("");
    const bi = bossOrder().indexOf(bFrom);
    const bj = bossOrder().indexOf(bTo);
    const brate = bj > bi ? 4 + 2 * (bj - bi) : 2;
    if (open.indexOf(vBoss) < 0) vBoss = open[0];
    const vr = voidRate(vBoss);
    const xpCard = `<div class="pgCard"><h3>🪙 XP → Dust</h3><p class="pgSub">Spend XP for Dust: <b>${XP_PER_DUST} XP → 1 ✨</b>. You have ${nf(xpNow())} XP.</p>
      <div class="frgRow">${[100, 500].map((t) => `<button class="drBuy" data-xpd="${t}" ${xpNow() >= t * XP_PER_DUST ? "" : "disabled"}>${nf(t)} ✨</button>`).join("")}<button class="drBuy" data-xpd="max" ${xpNow() >= XP_PER_DUST ? "" : "disabled"}>Max</button></div></div>`;
    const voidCard = `<div class="pgCard"><h3>🌑 Void Shards → Boss Material</h3><p class="pgSub">Pick any boss material you've unlocked. Costs <b>2 Void Shards + 1 per step up the boss ladder</b> for each one. Now: <b>${vr} 🌑 → 1</b>. You have ${nf(F.mats.void)} 🌑.</p>
      <div class="frgRow"><select id="frgVB" class="frgIn" style="font-size:14px;letter-spacing:0">${bo(vBoss)}</select></div>
      <div class="frgRow" style="margin-top:8px">${[1, 5, 10].map((t) => `<button class="drBuy" data-vtrade="${t}" ${(F.mats.void || 0) >= vr * t ? "" : "disabled"}>×${t}</button>`).join("")}</div></div>`;
    const bossSwap = `<div class="pgCard"><h3>👑 Boss Material Transmute</h3><p class="pgSub">Step down to a weaker boss's material at <b>2 → 1</b>. Climb to a stronger boss's material for <b>4 + 2 per step</b> up the boss ladder → 1. Shown rate now: <b>${brate} → 1</b>.</p>
      <div class="frgRow"><select id="frgBF" class="frgIn" style="font-size:14px;letter-spacing:0">${bo(bFrom)}</select><span>→</span><select id="frgBT" class="frgIn" style="font-size:14px;letter-spacing:0">${bo(bTo)}</select></div>
      <div class="frgRow" style="margin-top:8px"><button class="drBuy" data-bswap="1" ${bFrom !== bTo && (F.mats[bm(bFrom)] || 0) >= brate ? "" : "disabled"}>Transmute</button></div></div>`;
    return `<div class="pgBanner" style="font-weight:600">⚗️ <b>Transmute</b> — climb the material ladder, melt Stars or swap shards. Transmutes also raise your Forge level. Done so far: <b>${F.trades}</b></div>
      <div class="frgGrid">${chain}${star}${xpCard}${swap}${voidCard}${bossSwap}</div>`;
  }

  const JOURNAL = {
    dust: [
      "Every roll, always.",
      "1 Dust per roll, plus 1 more for every 4 rarity tiers (a Mythic-tier roll drops about 4).",
      "Everything: patterns, fusion, gear, skills, gloves.",
    ],
    spark: [
      "Rolls of Rare tier or better.",
      "Starts at 1 and grows by 1 every 3 tiers above Rare.",
      "Rift Bomb, Fortune Tonic, Sharpened Edge, Critical Eye, gloves, and the price of rarer patterns.",
    ],
    ember: [
      "Rolls of Legendary tier or better.",
      "Starts at 1 and grows by 1 every 3 tiers above Legendary.",
      "Warding Scroll, Overcharge Cell, most boss skills, gloves III+, and the price of rare patterns.",
    ],
    prism: [
      "Rolls of Divine tier or better.",
      "Starts at 1 and grows by 1 every 2 tiers above Divine.",
      "Fusing charms, Void Nuke, Overcharge Cell, Combo Engine, Ultimate Mastery, Gloves IV+, and very rare patterns.",
    ],
    void: [
      "Rolls of Omnipotent tier or better (the rarest drop in the game).",
      "Starts at 1 and grows by 1 every 2 tiers above Omnipotent.",
      "Fusion (one fewer than the charms fused), Void Nuke, Ultimate Mastery, Gloves V, and the rarest patterns.",
    ],
    chain: [
      "Hit a sequence-type badge: Rising Sequence, Counting Up, Staircase, Pyramid, Wave, Mountain, Valley, arithmetic and quadratic patterns…",
      "1 per badge, 2 if that badge is rarer than 1 in 1,000.",
      "Straight and countdown pattern charms (1 per digit), Gloves III+.",
    ],
    twin: [
      "Hit a repeat-type badge: Double, Triple, Quad, Quint, Stack, Repeater, Loop, Monochrome, ‘six ones’ and friends…",
      "1 per badge, 2 if rarer than 1 in 1,000.",
      "Pattern charms of one repeated digit (777, 8888…), Gloves III+.",
    ],
    mirror: [
      "Hit a mirror-type badge: Palindromes, Reverse badges, Centered, Echo…",
      "1 per badge, 2 if rarer than 1 in 1,000.",
      "Palindrome pattern charms (1221, 12321…), Gloves III+.",
    ],
    clover: [
      "Hit a lucky-type badge: anything with 7s, Lucky 7s, JACKPOT, Lucky Root…",
      "1 per badge, 2 if rarer than 1 in 1,000.",
      "Lucky Charms, one for every 7 in a pattern charm, Gloves I+.",
    ],
    formula: [
      "Hit a math-type badge: Prime Chain, Euler’s Number, Golden Ratio, Binary/Hex Vibes, sums and roots…",
      "1 per badge, 2 if rarer than 1 in 1,000.",
      "Gatherer’s Gloves only (every level).",
    ],
    lore: [
      "Hit any other badge: the pop-culture and meme numbers (games, movies, internet…).",
      "1 per badge, 2 if rarer than 1 in 1,000.",
      "Custom pattern charms that aren’t a straight, a repeat or a palindrome, Gloves I+.",
    ],
  };
  JOURNAL.star = [
    "Every true rebirth (rebirth #N gives N stars) and by clearing all three daily challenges; the hardest bosses also drop some.",
    "Shown as your current Prestige Stars, the same balance as the Prestige shop.",
    "Boss totems, Prestige Might, Scavenger, Star Melt. Spending one here means it is gone from the Prestige shop too.",
  ];
  BOSS_KEYS.forEach(
    (k) =>
      (JOURNAL[bm(k)] = [
        `Defeat the ${k === "golem" ? "Stonebound Golem" : bossCfg(k) ? bossCfg(k).short : k} (as a surviving participant).`,
        "3–15 per victory, more for stronger bosses (+10% per Trophy Hunter level).",
        "Its own totem, the next boss's totem, and some boss skills.",
      ]),
  );
  for (let i = 0; i < 10; i++)
    JOURNAL["d" + i] = [
      `Any roll that shows a ${i} (at most one per roll, however many ${i}s it has).`,
      `1 ${i}-Shard per roll containing a ${i}.`,
      `Pattern charms: 2 shards for every ${i} in the sequence.`,
    ];
  const journalOrder = () =>
    TIER_MATS.concat(
      ["star"],
      PAT_MATS,
      BOSS_KEYS.filter(bossOpen).map(bm),
      DIGIT_MATS,
    );

  function renderJournal() {
    const sample = [
      "COMMON",
      "RARE",
      "EPIC",
      "LEGENDARY",
      "MYTHIC",
      "DIVINE",
      "TRANSCENDENT",
      "OMNIPOTENT",
      "ABSOLUTE",
      "OMEGA",
    ];
    const rows = sample
      .map((t) => {
        const d = drops(TI(t));
        return `<tr><td>${t.charAt(0) + t.slice(1).toLowerCase()}</td>${TIER_MATS.map((k) => `<td>${d[k] ? d[k] : "—"}</td>`).join("")}</tr>`;
      })
      .join("");
    const gl = gloveLvl();
    const entries = journalOrder()
      .map((k) => {
        const j = JOURNAL[k];
        const found = k === "star" || F.seen[k] || F.mats[k] > 0;
        return `<div class="pgCard frgJ ${found ? "" : "unk"}"><h3>${MATS[k].icon} ${MATS[k].name} <small class="pgSub">${found ? "✓ found • you have " + nf(have(k)) : "not found yet"}</small></h3>
        <p><b>Where from:</b> ${j[0]}</p><p><b>How much:</b> ${j[1]}</p><p><b>Used for:</b> ${j[2]}</p></div>`;
      })
      .join("");
    return `<div class="pgBanner" style="font-weight:600">📖 <b>Forge Journal</b> — every material and where it comes from.${gl ? ` Your Gatherer's Gloves (Lv ${gl}) add +${20 * gl}% to everything below and a ${5 * gl}% chance of a ×3 windfall per roll.` : " Gatherer's Gloves (Gear tab) add +20% per level to all drops, plus a chance of a ×3 windfall."}</div>
      <h3 class="frgH">Tier drops per roll <small class="pgSub">(by the rarity of the roll)</small></h3>
      <div style="overflow-x:auto"><table class="frgTbl"><tr><th>Roll</th>${TIER_MATS.map((k) => `<th>${MATS[k].icon}</th>`).join("")}</tr>${rows}</table></div>
      <p class="pgSub">Digit shards and pattern mats come on top of these, from the digits and badges in the same roll. Tip: pattern mats come from badges, so aim at badges to craft pattern charms and gloves.</p>
      <div class="frgGrid" style="margin-top:12px">${entries}</div>`;
  }

  function renderForge() {
    const subs = [
      ["patterns", "🧩 Pattern Charms"],
      ["gear", "🧰 Gear & Gloves"],
      ["skills", "⚔️ Boss Skills"],
      ["totems", "🗿 Boss Totems"],
      ["trade", "⚗️ Transmute"],
      ["journal", "📖 Journal"],
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
      .frgX:first-of-type{margin-left:auto}.frgX{border:0;background:rgba(255,255,255,.08);color:#fff;border-radius:8px;cursor:pointer;padding:3px 8px}
      .frgIn{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font:700 18px monospace;letter-spacing:3px}
      .frgRow .drBuy{width:auto;flex:1}
      .frgPre{padding:6px 10px!important;font-size:13px;flex:0 0 auto!important}
      .frgIn{min-width:0}
      .frgJ.unk{opacity:.72}
      .frgTbl{border-collapse:collapse;width:100%;text-align:center}.frgTbl th,.frgTbl td{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.08)}.frgTbl td:first-child{text-align:left}
    </style>
    <div class="pgBanner">🔨 The Forge<br><span class="pgSub">Rolls drop materials: Dust, Sparks, Embers, Prisms and Void Shards by rarity, <b>digit shards</b> for every different digit you roll, and <b>pattern mats</b> from the badges you hit. Forge level <b>${forgeLvl()}</b> (−${Math.round(forgeDisc() * 100)}% costs) • Crafted: <b>${F.crafted}</b> • Charms used: <b>${F.patternsUsed}</b> • Fusions: <b>${F.fused}</b> • Ultimates: <b>${F.ults}</b>${F.tonicLeft ? ` • 🧪 ${F.tonicLeft} rolls` : ""}${F.elixirLeft ? ` • 🍯 ${F.elixirLeft}` : ""}${F.seerLeft ? ` • 🧿 ${F.seerLeft}` : ""}${F.magnetLeft ? ` • 🧲 ${F.magnetLeft}` : ""}${F.markLeft ? ` • 🎯 ${F.markLeft}` : ""}${F.scrollLeft ? ` • 📜 ${F.scrollLeft} curses` : ""}${F.armed ? ` • ${F.armed === "bomb" ? "💣" : F.armed === "sing" ? "🕳️" : "🌌"} ARMED` : ""}</span></div>
    <div class="frgMats">${TIER_MATS.concat(["star"], PAT_MATS).map(chip).join("")}</div>
    ${
      BOSS_KEYS.filter(
        (k) => bossOpen(k) && (F.seen[bm(k)] || F.mats[bm(k)] > 0),
      ).length
        ? `<div class="frgMats">${BOSS_KEYS.filter(
            (k) => bossOpen(k) && (F.seen[bm(k)] || F.mats[bm(k)] > 0),
          )
            .map((k) => chip(bm(k)))
            .join("")}</div>`
        : ""
    }
    <div class="frgMats dig">${DIGIT_MATS.map(chip).join("")}</div>
    <div class="pgTabs" style="margin:14px 0">${subs.map(([k, l]) => `<button class="pgTab ${sub === k ? "on" : ""}" data-sub="${k}" type="button">${l}</button>`).join("")}</div>
    ${sub === "patterns" ? renderPatterns() : sub === "gear" ? renderGear() : sub === "journal" ? renderJournal() : sub === "totems" ? renderTotems() : sub === "trade" ? renderTrade() : renderSkills()}`;
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
      .querySelectorAll("[data-totem]")
      .forEach((b) => (b.onclick = () => craftTotem(b.dataset.totem)));
    root
      .querySelectorAll("[data-summon]")
      .forEach((b) => (b.onclick = () => summon(b.dataset.summon)));
    root.querySelectorAll("[data-trade]").forEach((b) => {
      const [a, c, t] = b.dataset.trade.split(":");
      b.onclick = () => trade(a, c, +t || 1);
    });
    root
      .querySelectorAll("[data-xpd]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            xpToDust(b.dataset.xpd === "max" ? "max" : +b.dataset.xpd)),
      );
    const vB = root.querySelector("#frgVB");
    if (vB) vB.onchange = () => ((vBoss = vB.value), rerender());
    root
      .querySelectorAll("[data-vtrade]")
      .forEach((b) => (b.onclick = () => voidTrade(vBoss, +b.dataset.vtrade)));
    const bF = root.querySelector("#frgBF");
    const bT = root.querySelector("#frgBT");
    if (bF && bT) {
      bF.onchange = () => ((bFrom = bF.value), rerender());
      bT.onchange = () => ((bTo = bT.value), rerender());
      const bb = root.querySelector("[data-bswap]");
      if (bb) bb.onclick = () => bossTrade(bFrom, bTo);
    }
    const swF = root.querySelector("#frgSwF");
    const swT = root.querySelector("#frgSwT");
    if (swF && swT) {
      swF.onchange = () => ((swapFrom = swF.value), rerender());
      swT.onchange = () => ((swapTo = swT.value), rerender());
      const sb2 = root.querySelector("[data-swap]");
      if (sb2) sb2.onclick = () => trade(swapFrom, swapTo, 1);
    }
    root
      .querySelectorAll("[data-gloves]")
      .forEach((b) => (b.onclick = buyGloves));
    root
      .querySelectorAll("[data-fuse]")
      .forEach((b) => (b.onclick = () => fuse(b.dataset.fuse)));
    root
      .querySelectorAll("[data-pocket]")
      .forEach(
        (b) =>
          (b.onclick = (e) => (
            e.stopPropagation(),
            pocketPattern(+b.dataset.pocket)
          )),
      );
    root
      .querySelectorAll("[data-take]")
      .forEach((b) => (b.onclick = () => takeOut(+b.dataset.take)));
    root
      .querySelectorAll("[data-delp]")
      .forEach((b) => (b.onclick = () => discardPocket(+b.dataset.delp)));
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
        draft = inp.value.replace(/\D/g, "").slice(0, maxPat());
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
    bossDrop,
    bossXPMult: () => 1 + 0.2 * F.perks.harvest,
    totems: () => F.totems,
    forgeLevel: forgeLvl,
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
