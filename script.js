/* ============================================================
   DIGIT ROLL — SCRIPT.JS
   PART 1/5
   ============================================================ */

/* ============================================================
   SUPABASE
   ============================================================ */

const SUPABASE_URL = "https://xuofbnghqcktlsmjgfbj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXAiLCJyZWYiOiJ4dW9mYmdocWNrdGxzbWpnZmJqIiwicm9sZCI6ImFub24iLCJpYXQiOjE3ODc4NTk5NjQsImV4cCI6MjEwMzQzNTk2OX0.T-hifShe3Q9kl4hJroq8Td09LKS0mUblswA281h9A6s";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

/* ============================================================
   REFERENCES
   ============================================================ */

const references = {
  911: ["🚨 Emergency 911", "The famous emergency telephone number.", 100000],

  "007": ["🕵️ Agent 007", "The iconic code name of James Bond.", 100000],

  420: ["🌿 420", "A famous number from popular culture.", 80000],

  404: ["🌐 404 Not Found", "The familiar web error code.", 90000],

  1337: ["💻 LEET", "Classic internet/gaming slang for 'leet'.", 120000],

  666: [
    "😈 The Number",
    "A famously recognizable number with cultural significance.",
    150000,
  ],

  777: [
    "🎰 Lucky 7s",
    "Three 7s are a classic lucky-slot-machine pattern.",
    180000,
  ],

  42: [
    "🌌 The Answer",
    "The famously celebrated answer to life, the universe, and everything.",
    70000,
  ],

  101: [
    "📚 101",
    "A common shorthand for an introductory course or beginner's guide.",
    35000,
  ],

  123: [
    "🔢 Counting Up",
    "The first three digits of the familiar counting sequence.",
    45000,
  ],

  321: ["🚀 Countdown", "A classic countdown fragment.", 45000],

  314: ["🥧 Pi", "The first three digits of pi.", 55000],

  1984: [
    "📖 1984",
    "A recognizable reference to George Orwell's novel.",
    90000,
  ],

  2001: ["🚀 2001", "A recognizable science-fiction reference.", 90000],

  69: ["😎 Nice", "A widely recognized internet-number joke/reference.", 40000],

  67: ["🔢 67", "A special 67 reference hidden inside the roll.", 25000],

  55: ["⚔️ 55 — Kingsammelot", "A Kingsammelot reference.", 25000],
};

/* ============================================================
   BADGE RARITY
   ============================================================ */

const BADGE_RARITY = {
  COMMON: {
    label: "COMMON",
    className: "rarity-common",
    score: 1,
  },

  UNCOMMON: {
    label: "UNCOMMON",
    className: "rarity-uncommon",
    score: 2,
  },

  RARE: {
    label: "RARE",
    className: "rarity-rare",
    score: 3,
  },

  EPIC: {
    label: "EPIC",
    className: "rarity-epic",
    score: 4,
  },

  LEGENDARY: {
    label: "LEGENDARY",
    className: "rarity-legendary",
    score: 5,
  },

  MYTHIC: {
    label: "MYTHIC",
    className: "rarity-mythic",
    score: 6,
  },

  DIVINE: {
    label: "DIVINE",
    className: "rarity-divine",
    score: 7,
  },

  TRANSCENDENT: {
    label: "TRANSCENDENT",
    className: "rarity-transcendent",
    score: 8,
  },
};

/* ============================================================
   BADGE RARITY CALCULATOR
   ============================================================ */

function getBadgeRarity(oneIn) {
  const chance = Number(oneIn);

  if (!Number.isFinite(chance) || chance <= 10) {
    return BADGE_RARITY.COMMON;
  }

  if (chance <= 50) {
    return BADGE_RARITY.UNCOMMON;
  }

  if (chance <= 250) {
    return BADGE_RARITY.RARE;
  }

  if (chance <= 1000) {
    return BADGE_RARITY.EPIC;
  }

  if (chance <= 10000) {
    return BADGE_RARITY.LEGENDARY;
  }

  if (chance <= 100000) {
    return BADGE_RARITY.MYTHIC;
  }

  if (chance <= 1000000) {
    return BADGE_RARITY.DIVINE;
  }

  return BADGE_RARITY.TRANSCENDENT;
}

/* ============================================================
   PERIODIC TABLE
   FIRST 9 ELEMENTS ONLY
   ============================================================ */

const ELEMENTS = [
  {
    number: 1,
    symbol: "H",
    name: "Hydrogen",
  },

  {
    number: 2,
    symbol: "He",
    name: "Helium",
  },

  {
    number: 3,
    symbol: "Li",
    name: "Lithium",
  },

  {
    number: 4,
    symbol: "Be",
    name: "Beryllium",
  },

  {
    number: 5,
    symbol: "B",
    name: "Boron",
  },

  {
    number: 6,
    symbol: "C",
    name: "Carbon",
  },

  {
    number: 7,
    symbol: "N",
    name: "Nitrogen",
  },

  {
    number: 8,
    symbol: "O",
    name: "Oxygen",
  },

  {
    number: 9,
    symbol: "F",
    name: "Fluorine",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

const $ = (id) => document.getElementById(id);

let history = [];
let personalBest = null;
let allTimeBest = null;
let currentUser = null;
let profile = null;
let rolling = false;
let realtimeChannel = null;

/* ============================================================
   TOAST
   ============================================================ */

function toast(message) {
  const element = $("toast");

  if (!element) return;

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 3000);
}

/* ============================================================
   NUMBER FORMATTING
   ============================================================ */

function fmt(n) {
  const value = Number(n);

  if (!Number.isFinite(value)) {
    return "1 in —";
  }

  return "1 in " + value.toLocaleString();
}

/* ============================================================
   META
   ============================================================ */

function meta(x) {
  if (!x) {
    return "No rolls yet";
  }

  return `${x.rarity} • ${fmt(x.oneIn)} • ${x.shown}/10 digits`;
}

/* ============================================================
   BEST ROLL COMPARISON
   ============================================================ */

function better(a, b) {
  return !b || Number(a.oneIn) > Number(b.oneIn);
}

/* ============================================================
   RARITY CLASSES
   ============================================================ */

function rarityClass(rarity) {
  const classes = {
    COMMON: "rarity-common",
    UNCOMMON: "rarity-uncommon",
    RARE: "rarity-rare",
    EPIC: "rarity-epic",
    LEGENDARY: "rarity-legendary",
    MYTHIC: "rarity-mythic",
    DIVINE: "rarity-divine",
    TRANSCENDENT: "rarity-transcendent",
    "???": "rarity-unknown",
  };

  return classes[rarity] || "rarity-common";
}

/* ============================================================
   APPLY RARITY COLOR
   ============================================================ */

function applyRarityColor(element, rarity) {
  if (!element) return;

  element.classList.remove(
    "rarity-common",
    "rarity-uncommon",
    "rarity-rare",
    "rarity-epic",
    "rarity-legendary",
    "rarity-mythic",
    "rarity-divine",
    "rarity-transcendent",
    "rarity-unknown",
  );

  element.classList.add(rarityClass(rarity));
}

/* ============================================================
   GET BADGE RARITY FROM BADGE
   ============================================================ */

function applyBadgeRarity(badge) {
  if (!badge) return badge;

  const rarity = getBadgeRarity(badge.oneIn);

  return {
    ...badge,
    badgeRarity: rarity.label,
    badgeRarityClass: rarity.className,
    badgeRarityScore: rarity.score,
  };
}

/* ============================================================
   RANDOM ROLL
   ============================================================ */

function randomRoll() {
  const chars = [];

  let blanks = 0;

  for (let i = 0; i < 10; i++) {
    if (Math.random() < 0.055) {
      chars.push("_");

      blanks++;
    } else {
      chars.push(String(Math.floor(Math.random() * 10)));
    }
  }

  /*
   * Never allow all ten positions to be blank.
   */

  if (blanks === 10) {
    const index = Math.floor(Math.random() * 10);

    chars[index] = String(Math.floor(Math.random() * 10));
  }

  return chars;
}

/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   BADGE INFO MODAL
   ============================================================ */

function showBadgeInfo(name, explanation, oneIn, badgeRarity = "COMMON") {
  if ($("badgeModalName")) {
    $("badgeModalName").textContent = name;
  }

  if ($("badgeModalExplanation")) {
    $("badgeModalExplanation").textContent = explanation;
  }

  if ($("badgeModalChance")) {
    const rarity = getBadgeRarity(oneIn);

    $("badgeModalChance").textContent = "Badge rarity: " + rarity.label;

    applyRarityColor($("badgeModalChance"), rarity.label);
  }

  $("badgeModal")?.classList.add("open");
}

function closeBadgeInfo() {
  $("badgeModal")?.classList.remove("open");
}

window.closeBadgeInfo = closeBadgeInfo;
window.showBadgeInfo = showBadgeInfo;

/* ============================================================
   PART 1 END
   ============================================================ */
/* ============================================================
   RARITY HELPERS
   ============================================================ */

function rarityClass(rarity) {
  const classes = {
    COMMON: "rarity-common",
    UNCOMMON: "rarity-uncommon",
    RARE: "rarity-rare",
    EPIC: "rarity-epic",
    LEGENDARY: "rarity-legendary",
    MYTHIC: "rarity-mythic",
    DIVINE: "rarity-divine",
    TRANSCENDENT: "rarity-transcendent",
    "???": "rarity-unknown",
  };

  return classes[rarity] || "rarity-common";
}

function applyRarityColor(element, rarity) {
  if (!element) return;

  element.classList.remove(
    "rarity-common",
    "rarity-uncommon",
    "rarity-rare",
    "rarity-epic",
    "rarity-legendary",
    "rarity-mythic",
    "rarity-divine",
    "rarity-transcendent",
    "rarity-unknown",
  );

  element.classList.add(rarityClass(rarity));
}

/* ============================================================
   BADGE RARITY
   ============================================================ */

function badgeRarity(oneIn) {
  const chance = Number(oneIn) || 1;

  if (chance >= 1000000000) return "???";
  if (chance >= 100000000) return "TRANSCENDENT";
  if (chance >= 10000000) return "DIVINE";
  if (chance >= 1000000) return "MYTHIC";
  if (chance >= 100000) return "LEGENDARY";
  if (chance >= 10000) return "EPIC";
  if (chance >= 1000) return "RARE";
  if (chance >= 100) return "UNCOMMON";

  return "COMMON";
}

/* ============================================================
   BADGE CREATOR
   ============================================================ */

function makeBadge(name, explanation, oneIn) {
  const rarity = badgeRarity(oneIn);

  return {
    name,
    explanation,
    oneIn,
    rarity,
  };
}

/* ============================================================
   PERIODIC TABLE — FIRST 9 ELEMENTS
   ============================================================ */

const elementBadges = [
  {
    atomicNumber: 1,
    symbol: "H",
    name: "Hydrogen",
    explanation:
      "The roll contains at least one 1, matching hydrogen's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 2,
    symbol: "He",
    name: "Helium",
    explanation:
      "The roll contains at least one 2, matching helium's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 3,
    symbol: "Li",
    name: "Lithium",
    explanation:
      "The roll contains at least one 3, matching lithium's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 4,
    symbol: "Be",
    name: "Beryllium",
    explanation:
      "The roll contains at least one 4, matching beryllium's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 5,
    symbol: "B",
    name: "Boron",
    explanation:
      "The roll contains at least one 5, matching boron's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 6,
    symbol: "C",
    name: "Carbon",
    explanation:
      "The roll contains at least one 6, matching carbon's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 7,
    symbol: "N",
    name: "Nitrogen",
    explanation:
      "The roll contains at least one 7, matching nitrogen's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 8,
    symbol: "O",
    name: "Oxygen",
    explanation:
      "The roll contains at least one 8, matching oxygen's atomic number.",
    oneIn: 10,
  },

  {
    atomicNumber: 9,
    symbol: "F",
    name: "Fluorine",
    explanation:
      "The roll contains at least one 9, matching fluorine's atomic number.",
    oneIn: 10,
  },
];

/* ============================================================
   ELEMENT BADGE DETECTOR
   ============================================================ */

function detectElementBadges(digits) {
  const badges = [];

  for (const element of elementBadges) {
    const target = String(element.atomicNumber);

    if (digits.includes(target)) {
      badges.push(
        makeBadge(
          `⚛️ ${element.symbol} — ${element.name}`,
          element.explanation,
          element.oneIn,
        ),
      );
    }
  }

  return badges;
}

/* ============================================================
   RANDOM ROLL
   ============================================================ */

function randomRoll() {
  const chars = [];
  let blanks = 0;

  for (let i = 0; i < 10; i++) {
    if (Math.random() < 0.055) {
      chars.push("_");
      blanks++;
    } else {
      chars.push(String(Math.floor(Math.random() * 10)));
    }
  }

  if (blanks === 10) {
    const index = Math.floor(Math.random() * 10);

    chars[index] = String(Math.floor(Math.random() * 10));
  }

  return chars;
}

/* ============================================================
   ADVANCED PATTERN DETECTOR
   ============================================================ */

function analyze(chars) {
  const digits = chars.filter((x) => x !== "_");

  const compact = digits.join("");

  const badges = [];

  /* ============================================================
     REFERENCES
     ============================================================ */

  for (const [key, [name, explanation, oneIn]] of Object.entries(references)) {
    if (compact.includes(key)) {
      badges.push(makeBadge(name, explanation, oneIn));
    }
  }

  /* ============================================================
     PERIODIC TABLE ELEMENTS
     ============================================================ */

  const elementResults = detectElementBadges(digits);

  badges.push(...elementResults);

  /* ============================================================
     DIGIT COUNTS
     ============================================================ */

  const counts = {};

  digits.forEach((d) => {
    counts[d] = (counts[d] || 0) + 1;
  });

  const maxCount = Math.max(0, ...Object.values(counts));

  /* ============================================================
     REPEATER
     ============================================================ */

  if (maxCount >= 2) {
    badges.push(
      makeBadge(
        "🔁 Repeater",
        "At least one visible digit appears more than once.",
        5,
      ),
    );
  }

  /* ============================================================
     TRIPLES
     ============================================================ */

  if (maxCount >= 3) {
    badges.push(
      makeBadge(
        "🔥 Triple Digit",
        "A visible digit appears three or more times.",
        100,
      ),
    );
  }

  /* ============================================================
     QUADS
     ============================================================ */

  if (maxCount >= 4) {
    badges.push(
      makeBadge(
        "💥 Quad Digit",
        "A visible digit appears four or more times.",
        1000,
      ),
    );
  }

  /* ============================================================
     QUINTS
     ============================================================ */

  if (maxCount >= 5) {
    badges.push(
      makeBadge(
        "☢️ Quint Digit",
        "The same visible digit appears at least five times.",
        10000,
      ),
    );
  }

  /* ============================================================
     SIX OF A KIND
     ============================================================ */

  if (maxCount >= 6) {
    badges.push(
      makeBadge(
        "👹 Hex Digit",
        "One digit dominates the roll with six or more appearances.",
        100000,
      ),
    );
  }

  /* ============================================================
     SEVEN OF A KIND
     ============================================================ */

  if (maxCount >= 7) {
    badges.push(
      makeBadge(
        "👑 Sevenfold",
        "The same digit appears at least seven times.",
        1000000,
      ),
    );
  }

  /* ============================================================
     EIGHT OF A KIND
     ============================================================ */

  if (maxCount >= 8) {
    badges.push(
      makeBadge(
        "💎 Octa Stack",
        "Eight or more visible digits are identical.",
        10000000,
      ),
    );
  }

  /* ============================================================
     NINE OF A KIND
     ============================================================ */

  if (maxCount >= 9) {
    badges.push(
      makeBadge("🌟 Ninefold", "Nine visible digits are identical.", 100000000),
    );
  }

  /* ============================================================
     TEN OF A KIND
     ============================================================ */

  if (maxCount === 10) {
    badges.push(
      makeBadge(
        "👑 Perfect Ten",
        "All ten visible digits are identical.",
        10000000000,
      ),
    );
  }

  /* ============================================================
     MONOCHROME
     ============================================================ */

  if (digits.length > 1 && new Set(digits).size === 1) {
    badges.push(
      makeBadge("👑 Monochrome", "Every visible digit is identical.", 1000000),
    );
  }

  /* ============================================================
     ALL TEN DIGITS
     ============================================================ */

  if (digits.length === 10 && new Set(digits).size === 10) {
    badges.push(
      makeBadge(
        "🌈 All Ten Digits",
        "Every digit from 0 through 9 appears exactly once.",
        3628800,
      ),
    );
  }

  /* ============================================================
     DOUBLES
     ============================================================ */

  if (/00|11|22|33|44|55|66|77|88|99/.test(compact)) {
    badges.push(
      makeBadge(
        "👯 Double",
        "Two identical digits appear directly beside each other.",
        100,
      ),
    );
  }

  /* ============================================================
     TRIPLE STACK
     ============================================================ */

  if (/000|111|222|333|444|555|666|777|888|999/.test(compact)) {
    badges.push(
      makeBadge(
        "🔥 Triple Stack",
        "Three identical digits appear consecutively.",
        1000,
      ),
    );
  }

  /* ============================================================
     QUAD STACK
     ============================================================ */

  if (/0000|1111|2222|3333|4444|5555|6666|7777|8888|9999/.test(compact)) {
    badges.push(
      makeBadge(
        "💥 Quad Stack",
        "Four identical digits appear consecutively.",
        10000,
      ),
    );
  }

  /* ============================================================
     RISING
     ============================================================ */

  if (/012|123|234|345|456|567|678|789/.test(compact)) {
    badges.push(
      makeBadge(
        "📈 Rising Sequence",
        "Three consecutive digits appear in ascending order.",
        100,
      ),
    );
  }

  /* ============================================================
     STAIRCASE
     ============================================================ */

  if (/0123|1234|2345|3456|4567|5678|6789/.test(compact)) {
    badges.push(
      makeBadge(
        "🪜 Staircase",
        "Four consecutive digits climb steadily upward.",
        1000,
      ),
    );
  }

  /* ============================================================
     MEGA STAIRCASE
     ============================================================ */

  if (/01234|12345|23456|34567|45678|56789/.test(compact)) {
    badges.push(
      makeBadge(
        "🚀 Mega Staircase",
        "Five consecutive digits rise steadily upward.",
        10000,
      ),
    );
  }

  /* ============================================================
     FALLING
     ============================================================ */

  if (/987|876|765|654|543|432|321|210/.test(compact)) {
    badges.push(
      makeBadge(
        "📉 Falling Sequence",
        "Three consecutive digits appear in descending order.",
        100,
      ),
    );
  }

  /* ============================================================
     REVERSE STAIRCASE
     ============================================================ */

  if (/9876|8765|7654|6543|5432|4321|3210/.test(compact)) {
    badges.push(
      makeBadge(
        "🪜 Reverse Staircase",
        "Four consecutive digits descend steadily.",
        1000,
      ),
    );
  }

  /* ============================================================
     MEGA REVERSE STAIRCASE
     ============================================================ */

  if (/98765|87654|76543|65432|54321|43210/.test(compact)) {
    badges.push(
      makeBadge(
        "🚀 Mega Reverse Staircase",
        "Five consecutive digits fall steadily downward.",
        10000,
      ),
    );
  }
  /* ============================================================
   MOUNTAINS
   ============================================================ */

  const mountainPatterns = [
    "01210",
    "12321",
    "23432",
    "34543",
    "45654",
    "56765",
    "67876",
    "78987",

    "0123210",
    "1234321",
    "2345432",
    "3456543",
    "4567654",
    "5678765",
  ];

  if (mountainPatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "⛰️ Mountain",
        "Numbers rise to a peak in order, then fall back down.",
        10000,
      ),
    );
  }

  /* ============================================================
   VALLEYS
   ============================================================ */

  const valleyPatterns = [
    "21012",
    "32123",
    "43234",
    "54345",
    "65456",
    "76567",
    "87678",
    "98789",

    "2101234",
    "3212345",
    "4323456",
    "5434567",
    "6545678",
    "7656789",
  ];

  if (valleyPatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🏞️ Valley",
        "Numbers fall to a low point in order, then rise again.",
        10000,
      ),
    );
  }

  /* ============================================================
   WAVES
   ============================================================ */

  const wavePatterns = [
    "121",
    "232",
    "343",
    "454",
    "565",
    "676",
    "787",
    "898",

    "12321",
    "23432",
    "34543",
    "45654",
    "56765",
    "67876",
    "78987",
  ];

  if (wavePatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🌊 Wave",
        "The digits repeatedly rise and fall, creating a wave-like pattern.",
        15000,
      ),
    );
  }

  /* ============================================================
   LONGER WAVES
   ============================================================ */

  const longWavePatterns = [
    "1232123",
    "2343234",
    "3454345",
    "4565456",
    "5676567",
    "6787678",
    "7898789",

    "3210123",
    "4321234",
    "5432345",
    "6543456",
    "7654567",
    "8765678",
  ];

  if (longWavePatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🌊 Mega Wave",
        "A long repeating rise-and-fall pattern creates a larger wave.",
        100000,
      ),
    );
  }

  /* ============================================================
   MIRRORS
   ============================================================ */

  for (let len = 3; len <= 7; len++) {
    let foundMirror = false;

    for (let i = 0; i <= compact.length - len; i++) {
      const part = compact.slice(i, i + len);

      if (part.length < 3) continue;

      const reversed = part.split("").reverse().join("");

      if (part === reversed) {
        badges.push(
          makeBadge(
            "🪞 Mirror",
            "A sequence reads the same forward and backward.",
            Math.pow(10, len),
          ),
        );

        foundMirror = true;
        break;
      }
    }

    if (foundMirror) break;
  }

  /* ============================================================
   PERFECT MIRROR
   ============================================================ */

  if (compact.length >= 4 && compact === compact.split("").reverse().join("")) {
    badges.push(
      makeBadge(
        "🪞 Perfect Mirror",
        "The entire visible number reads identically forward and backward.",
        100000,
      ),
    );
  }

  /* ============================================================
   ALTERNATORS
   ============================================================ */

  if (/0101|1212|2323|3434|4545|5656|6767|7878|8989/.test(compact)) {
    badges.push(
      makeBadge(
        "⚡ Alternator",
        "Two digits repeatedly alternate back and forth.",
        5000,
      ),
    );
  }

  /* ============================================================
   LONG ALTERNATORS
   ============================================================ */

  if (
    /010101|121212|232323|343434|454545|565656|676767|787878|898989/.test(
      compact,
    )
  ) {
    badges.push(
      makeBadge(
        "⚡ Mega Alternator",
        "Two digits alternate repeatedly across a long section of the roll.",
        500000,
      ),
    );
  }

  /* ============================================================
   DIGIT LOOPS
   ============================================================ */

  const loopPatterns = ["0123456789", "1234567890", "9876543210", "0987654321"];

  if (loopPatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🔄 Digit Loop",
        "The digits travel through a complete numeric cycle.",
        100000,
      ),
    );
  }

  /* ============================================================
   PARTIAL LOOPS
   ============================================================ */

  const partialLoops = [
    "012345678",
    "123456789",
    "234567890",
    "987654321",
    "876543210",
  ];

  if (partialLoops.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🔁 Partial Loop",
        "The roll contains most of a complete ascending or descending digit cycle.",
        25000,
      ),
    );
  }

  /* ============================================================
   PYRAMIDS
   ============================================================ */

  const pyramidPatterns = [
    "1234321",
    "2345432",
    "3456543",
    "4567654",
    "5678765",

    "11211",
    "22322",
    "33433",
    "44544",
    "55655",
    "66766",
    "77877",
    "88988",
  ];

  if (pyramidPatterns.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🔺 Pyramid",
        "Digits expand toward a center and then contract, creating a pyramid-like pattern.",
        20000,
      ),
    );
  }

  /* ============================================================
   LARGE PYRAMIDS
   ============================================================ */

  const largePyramids = [
    "123454321",
    "234565432",
    "345676543",
    "456787654",
    "567898765",
  ];

  if (largePyramids.some((pattern) => compact.includes(pattern))) {
    badges.push(
      makeBadge(
        "🔺 Mega Pyramid",
        "A large mirrored sequence expands toward a central peak before contracting.",
        1000000,
      ),
    );
  }

  /* ============================================================
   DOUBLE PAIRS
   ============================================================ */

  if (/0011|1122|2233|3344|4455|5566|6677|7788|8899|9900/.test(compact)) {
    badges.push(
      makeBadge(
        "👯 Double Pair",
        "Two different digits each appear twice in a structured pair.",
        10000,
      ),
    );
  }

  /* ============================================================
   DOUBLE DOUBLE
   ============================================================ */

  if (/0011|1100|2233|3322|4455|5544|6677|7766|8899|9988/.test(compact)) {
    badges.push(
      makeBadge(
        "🔗 Double Double",
        "Two consecutive pairs form a repeating two-by-two pattern.",
        10000,
      ),
    );
  }

  /* ============================================================
   TRIPLE PAIRS
   ============================================================ */

  if (/001122|112233|223344|334455|445566|556677|667788|778899/.test(compact)) {
    badges.push(
      makeBadge(
        "🔥 Triple Pair",
        "Three adjacent digit pairs form an ordered pattern.",
        100000,
      ),
    );
  }

  /* ============================================================
   DESCENDING DOUBLE PAIRS
   ============================================================ */

  if (/998877|887766|776655|665544|554433|443322|332211/.test(compact)) {
    badges.push(
      makeBadge(
        "📉 Reverse Double Pair",
        "Paired digits descend in a structured sequence.",
        100000,
      ),
    );
  }

  /* ============================================================
   ARITHMETIC PATTERNS
   ============================================================ */

  if (digits.length >= 4) {
    const diffs = [];

    for (let i = 1; i < digits.length; i++) {
      diffs.push(Number(digits[i]) - Number(digits[i - 1]));
    }

    if (
      diffs.length >= 3 &&
      diffs.every((d) => d === diffs[0]) &&
      diffs[0] !== 0
    ) {
      badges.push(
        makeBadge(
          "📐 Arithmetic Pattern",
          "The visible digits change by the same amount each step.",
          20000,
        ),
      );
    }
  }

  /* ============================================================
   STEP +2
   ============================================================ */

  if (/02468|13579|024680|135791/.test(compact)) {
    badges.push(
      makeBadge(
        "➕ Even Step Pattern",
        "Digits repeatedly increase by two, forming an even or odd stepping pattern.",
        10000,
      ),
    );
  }

  /* ============================================================
   PRIME DIGIT PATTERN
   ============================================================ */

  const primeDigits = new Set(["2", "3", "5", "7"]);

  const primeOnly =
    digits.length >= 4 && digits.every((d) => primeDigits.has(d));

  if (primeOnly) {
    badges.push(
      makeBadge(
        "🔬 Prime Digits",
        "Every visible digit is a prime digit: 2, 3, 5, or 7.",
        625,
      ),
    );
  }

  /* ============================================================
   PALINDROME BY PAIRS
   ============================================================ */

  if (compact.length >= 4 && compact.length % 2 === 0) {
    const half = compact.length / 2;

    const left = compact.slice(0, half);

    const right = compact.slice(half);

    if (left === right.split("").reverse().join("")) {
      badges.push(
        makeBadge(
          "🪞 Split Mirror",
          "The second half mirrors the first half.",
          10000,
        ),
      );
    }
  }

  /* ============================================================
   REPEATING BLOCK
   ============================================================ */

  for (let size = 1; size <= 3; size++) {
    if (compact.length < size * 3) {
      continue;
    }

    const block = compact.slice(0, size);

    const repeated = block.repeat(Math.floor(compact.length / size));

    if (repeated === compact.slice(0, repeated.length)) {
      badges.push(
        makeBadge(
          "🔂 Repeating Block",
          "A short group of digits repeats across the roll.",
          50000,
        ),
      );

      break;
    }
  }

  /* ============================================================
   ZERO BOOKENDS
   ============================================================ */

  if (compact.length >= 3 && compact.startsWith("0") && compact.endsWith("0")) {
    badges.push(
      makeBadge(
        "⭕ Zero Bookends",
        "The visible sequence begins and ends with zero.",
        100,
      ),
    );
  }

  /* ============================================================
   NINE BOOKENDS
   ============================================================ */

  if (compact.length >= 3 && compact.startsWith("9") && compact.endsWith("9")) {
    badges.push(
      makeBadge(
        "9️⃣ Nine Bookends",
        "The visible sequence begins and ends with nine.",
        100,
      ),
    );
  }

  /* ============================================================
   SAME FIRST + LAST
   ============================================================ */

  if (compact.length >= 3 && compact[0] === compact[compact.length - 1]) {
    badges.push(
      makeBadge(
        "🔗 Matching Ends",
        "The first and last visible digits are identical.",
        10,
      ),
    );
  }

  /* ============================================================
   PARITY CHAIN
   ============================================================ */

  if (digits.length >= 5) {
    const parity = digits.map((d) => Number(d) % 2);

    if (parity.every((x) => x === parity[0])) {
      badges.push(
        makeBadge(
          "⚫⚪ Parity Chain",
          "Every visible digit has the same odd/even parity.",
          32,
        ),
      );
    }
  }

  /* ============================================================
   ALL EVEN
   ============================================================ */

  if (digits.length >= 5 && digits.every((d) => Number(d) % 2 === 0)) {
    badges.push(makeBadge("⚪ Even Roll", "Every visible digit is even.", 32));
  }

  /* ============================================================
   ALL ODD
   ============================================================ */

  if (digits.length >= 5 && digits.every((d) => Number(d) % 2 === 1)) {
    badges.push(makeBadge("⚫ Odd Roll", "Every visible digit is odd.", 32));
  }

  /* ============================================================
   BALANCED PARITY
   ============================================================ */

  if (digits.length >= 6) {
    const evens = digits.filter((d) => Number(d) % 2 === 0).length;

    const odds = digits.length - evens;

    if (evens === odds) {
      badges.push(
        makeBadge(
          "⚖️ Balanced Parity",
          "The visible digits contain an equal number of even and odd digits.",
          100,
        ),
      );
    }
  }

  /* ============================================================
   DIGIT SUM
   ============================================================ */

  if (digits.length >= 4) {
    const sum = digits.reduce((total, d) => total + Number(d), 0);

    if (sum === 42) {
      badges.push(
        makeBadge("🌌 Sum of 42", "The visible digits add up to 42.", 1000),
      );
    }

    if (sum === 55) {
      badges.push(
        makeBadge(
          "⚔️ Sum of 55",
          "The visible digits add up to 55 — a Kingsammelot reference.",
          1000,
        ),
      );
    }

    if (sum === 67) {
      badges.push(
        makeBadge("🔢 Sum of 67", "The visible digits add up to 67.", 1000),
      );
    }
  }

  /* ============================================================
   LUCKY 7
   ============================================================ */

  if (compact.includes("7")) {
    badges.push(
      makeBadge("🍀 Lucky 7", "The roll contains at least one 7.", 10),
    );
  }

  /* ============================================================
   DOUBLE 7
   ============================================================ */

  if (compact.includes("77")) {
    badges.push(
      makeBadge(
        "🍀🍀 Double 7",
        "Two 7s appear directly beside each other.",
        100,
      ),
    );
  }

  /* ============================================================
   TRIPLE 7
   ============================================================ */

  if (compact.includes("777")) {
    badges.push(
      makeBadge(
        "🎰 Lucky 777",
        "Three 7s appear consecutively — the classic jackpot pattern.",
        1000,
      ),
    );
  }

  /* ============================================================
   DOUBLE 5 — KINGSAMMELOT
   ============================================================ */

  if (compact.includes("55")) {
    badges.push(
      makeBadge("⚔️ 55 — Kingsammelot", "A Kingsammelot reference.", 100),
    );
  }

  /* ============================================================
   SORT BADGES
   ============================================================ */

  badges.sort((a, b) => Number(a.oneIn) - Number(b.oneIn));

  /* ============================================================
   BADGE CHANCE
   ============================================================ */

  let badgeChance = 1;

  for (const badge of badges) {
    badgeChance *= Number(badge.oneIn) || 1;

    if (badgeChance > 1e100) {
      badgeChance = 1e100;
      break;
    }
  }

  /* ============================================================
   BLANKS
   ============================================================ */

  const blanks = chars.filter((x) => x === "_").length;

  const blankMultiplier = Math.pow(10, blanks);

  /* ============================================================
   TOTAL CHANCE
   ============================================================ */

  const totalChance = badgeChance * blankMultiplier;

  /* ============================================================
   ROLL RARITY
   ============================================================ */

  let rarity = "COMMON";

  if (badges.length || blanks >= 1) {
    rarity = "UNCOMMON";
  }

  if (totalChance >= 100) {
    rarity = "RARE";
  }

  if (totalChance >= 1000) {
    rarity = "EPIC";
  }

  if (totalChance >= 10000) {
    rarity = "LEGENDARY";
  }

  if (totalChance >= 1000000) {
    rarity = "MYTHIC";
  }

  if (totalChance >= 100000000) {
    rarity = "DIVINE";
  }

  if (totalChance >= 10000000000) {
    rarity = "TRANSCENDENT";
  }

  if (totalChance >= 1000000000000) {
    rarity = "???";
  }

  /* ============================================================
   XP
   ============================================================ */

  const badgeXP = badges.reduce(
    (sum, badge) =>
      sum + Math.max(1, Math.round(Math.log10(Number(badge.oneIn) + 1) * 20)),
    0,
  );

  const blankXP = blanks * 100;

  const rarityXP = Math.max(
    0,
    Math.floor(Math.log10(Math.max(1, totalChance)) * 5),
  );

  const xp = Math.max(5, badgeXP + blankXP + rarityXP);

  /* ============================================================
   ANALYSIS RESULT
   ============================================================ */

  return {
    badges,

    badgeChance,

    blankMultiplier,

    oneIn: totalChance,

    rarity,

    shown: digits.length,

    blanks,

    xp,
  };
}
/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function saveLocal() {
  try {
    localStorage.setItem("digitRollHistory", JSON.stringify(history));

    localStorage.setItem("digitRollPersonal", JSON.stringify(personalBest));

    localStorage.setItem("digitRollAll", JSON.stringify(allTimeBest));
  } catch (e) {
    console.warn("Local save unavailable:", e);
  }
}

function loadLocal() {
  try {
    history = JSON.parse(localStorage.getItem("digitRollHistory")) || [];

    personalBest =
      JSON.parse(localStorage.getItem("digitRollPersonal")) || null;

    allTimeBest = JSON.parse(localStorage.getItem("digitRollAll")) || null;
  } catch (e) {
    history = [];
    personalBest = null;
    allTimeBest = null;
  }

  renderHistory();
}

/* ============================================================
   HISTORY
   ============================================================ */

function renderHistory() {
  const count = history.length;

  $("historyCount").textContent = count + (count === 1 ? " roll" : " rolls");

  if (!count) {
    $("history").innerHTML = '<span class="empty">No rolls yet.</span>';

    return;
  }

  $("history").innerHTML = history
    .slice(0, 30)
    .map((x) => {
      return `
        <div class="historyrow">

          <span class="historynum">
            ${escapeHTML(x.roll)}
          </span>

          <span
            class="rarity ${rarityClass(x.rarity)}"
          >
            ${escapeHTML(x.rarity)}
          </span>

          <span class="xp">
            +${Number(x.xp) || 0} XP
          </span>

        </div>
      `;
    })
    .join("");
}

/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   BADGE INFORMATION MODAL
   ============================================================ */

function showBadgeInfo(name, explanation, rarity) {
  $("badgeModalName").textContent = name;

  $("badgeModalExplanation").textContent = explanation;

  $("badgeModalChance").textContent = "Badge rarity: " + rarity;

  applyRarityColor($("badgeModalChance"), rarity);

  $("badgeModal").classList.add("open");
}

function closeBadgeInfo() {
  $("badgeModal").classList.remove("open");
}

window.showBadgeInfo = showBadgeInfo;

window.closeBadgeInfo = closeBadgeInfo;

/* ============================================================
   AUTH UI
   ============================================================ */

function openAuth() {
  $("authModal").classList.add("open");
}

function closeAuth() {
  $("authModal").classList.remove("open");
}

window.closeAuth = closeAuth;

let authMode = "login";

$("loginTab").onclick = () => {
  authMode = "login";

  $("loginTab").classList.add("active");

  $("signupTab").classList.remove("active");

  $("authTitle").textContent = "🔐 Login";

  $("authSubmit").textContent = "Login";

  $("authUsername").style.display = "none";

  $("authStatus").textContent = "";
};

$("signupTab").onclick = () => {
  authMode = "signup";

  $("signupTab").classList.add("active");

  $("loginTab").classList.remove("active");

  $("authTitle").textContent = "✨ Create Account";

  $("authSubmit").textContent = "Create Account";

  $("authUsername").style.display = "block";

  $("authStatus").textContent = "";
};

$("authButton").onclick = openAuth;

/* ============================================================
   SIGNUP / LOGIN
   ============================================================ */

$("authSubmit").onclick = async () => {
  const email = $("authEmail").value.trim();

  const password = $("authPassword").value;

  const username = $("authUsername").value.trim();

  if (!email || !password) {
    $("authStatus").textContent = "Please enter an email and password.";

    return;
  }

  $("authSubmit").disabled = true;

  $("authStatus").textContent =
    authMode === "login" ? "Logging in..." : "Creating account...";

  try {
    if (authMode === "signup") {
      if (!username) {
        $("authStatus").textContent = "Please choose a username.";

        $("authSubmit").disabled = false;

        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,

        password,

        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (data.session) {
          await ensureProfile(data.user, username);
        }

        $("authStatus").textContent = data.session
          ? "Account created!"
          : "Account created! Check your email to confirm it.";
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,

        password,
      });

      if (error) throw error;

      if (data.user) {
        currentUser = data.user;

        await ensureProfile(data.user);

        closeAuth();

        toast("Welcome back!");
      }
    }
  } catch (error) {
    console.error(error);

    $("authStatus").textContent = friendlyAuthError(error);
  }

  $("authSubmit").disabled = false;
};

/* ============================================================
   FRIENDLY AUTH ERRORS
   ============================================================ */

function friendlyAuthError(error) {
  const msg = String(error?.message || error || "");

  const lower = msg.toLowerCase();

  if (lower.includes("email not confirmed")) {
    return (
      "Your email is not confirmed yet. " +
      "Check your email, then try logging in again."
    );
  }

  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (lower.includes("user already registered")) {
    return "That email already has an account. " + "Try logging in.";
  }

  if (lower.includes("password") && lower.includes("characters")) {
    return "Your password does not meet the required length.";
  }

  return msg || "Authentication failed.";
}

/* ============================================================
   PROFILE
   ============================================================ */

async function ensureProfile(user, suppliedUsername = "") {
  if (!user) return null;

  const username = suppliedUsername || user.user_metadata?.username || "Player";

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id,username,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Profile lookup:", error);
  }

  if (data) {
    profile = data;

    return data;
  }

  const { data: created, error: createError } = await supabaseClient
    .from("profiles")
    .insert({
      id: user.id,

      username,
    })
    .select()
    .single();

  if (createError) {
    console.warn("Profile creation:", createError);

    const { data: retry } = await supabaseClient
      .from("profiles")
      .select("id,username,created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (retry) {
      profile = retry;

      return retry;
    }

    return null;
  }

  profile = created;

  return created;
}

/* ============================================================
   ACCOUNT UI
   ============================================================ */

function updateAccountUI() {
  if (currentUser) {
    const name =
      profile?.username || currentUser.user_metadata?.username || "Player";

    $("userPill").textContent = "👤 " + name;

    $("authButton").style.display = "none";

    $("profileButton").style.display = "inline-block";

    $("logoutButton").style.display = "inline-block";

    $("profileSection").style.display = "block";

    $("profileEmail").textContent = currentUser.email || "";

    $("profileUsername").textContent = name;

    $("usernameInput").value = name;
  } else {
    $("userPill").textContent = "Guest";

    $("authButton").style.display = "inline-block";

    $("profileButton").style.display = "none";

    $("logoutButton").style.display = "none";

    $("profileSection").style.display = "none";
  }
}

/* ============================================================
   PERSONAL STATS
   ============================================================ */

async function loadPersonalStats() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("rolls")
    .select("roll,one_in,xp,badges,rarity,shown,blanks,created_at")
    .eq("player_id", currentUser.id)
    .order("one_in", {
      ascending: false,
    });

  if (error) {
    console.warn("Personal stats unavailable:", error);

    return;
  }

  const rows = data || [];

  const totalXP = rows.reduce((sum, row) => sum + Number(row.xp || 0), 0);

  const best = rows.length ? rows[0] : null;

  $("profileRolls").textContent = rows.length.toLocaleString();

  $("profileXP").textContent = totalXP.toLocaleString();

  $("profileBest").textContent = best ? best.roll : "—";

  $("profileBestMeta").textContent = best
    ? `${best.rarity} • ${fmt(best.one_in)}`
    : "No rolls yet";

  if (best) {
    applyRarityColor($("profileBestMeta"), best.rarity);
  }
}

/* ============================================================
   CHANGE USERNAME
   ============================================================ */

$("saveUsername").onclick = async () => {
  if (!currentUser) {
    toast("You need to be logged in.");

    return;
  }

  const newUsername = $("usernameInput").value.trim();

  if (!newUsername) {
    $("usernameStatus").textContent = "Username cannot be empty.";

    return;
  }

  if (newUsername.length > 24) {
    $("usernameStatus").textContent = "Username must be 24 characters or less.";

    return;
  }

  $("saveUsername").disabled = true;

  $("usernameStatus").textContent = "Saving...";

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({
        username: newUsername,
      })
      .eq("id", currentUser.id)
      .select()
      .single();

    if (error) throw error;

    profile = data;

    await supabaseClient.auth.updateUser({
      data: {
        username: newUsername,
      },
    });

    updateAccountUI();

    await updateExistingRollNames(newUsername);

    $("usernameStatus").textContent = "Username updated!";

    toast("Username changed to " + newUsername);
  } catch (error) {
    console.error(error);

    $("usernameStatus").textContent =
      error.message || "Unable to change username.";
  }

  $("saveUsername").disabled = false;
};

async function updateExistingRollNames(newUsername) {
  if (!currentUser) return;

  try {
    const { error } = await supabaseClient
      .from("rolls")
      .update({
        player_name: newUsername,
      })
      .eq("player_id", currentUser.id);

    if (error) {
      console.warn("Could not update old roll names:", error);
    }
  } catch (e) {
    console.warn(e);
  }
}

/* ============================================================
   SAVE CLOUD ROLL
   ============================================================ */

async function saveCloudRoll(result) {
  if (!currentUser) return null;

  const username =
    profile?.username || currentUser.user_metadata?.username || "Player";

  const row = {
    roll: result.roll,

    rarity: result.rarity,

    one_in: result.oneIn,

    shown: result.shown,

    blanks: result.blanks,

    xp: result.xp,

    badges: result.badges || [],

    player_id: currentUser.id,

    player_name: username,
  };

  try {
    const { data, error } = await supabaseClient
      .from("rolls")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Cloud roll error:", error);

      toast("Roll saved locally, but cloud save failed.");

      return null;
    }

    return data;
  } catch (error) {
    console.error("Cloud roll exception:", error);

    return null;
  }
}

/* ============================================================
   LEADERBOARD
   ============================================================ */

async function loadLeaderboard() {
  const { data, error } = await supabaseClient
    .from("rolls")
    .select("id,roll,rarity,one_in,shown,xp,player_id,player_name,created_at")
    .order("one_in", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error("Leaderboard error:", error);

    $("globalRows").innerHTML = `
      <span class="empty">
        Leaderboard unavailable:
        ${escapeHTML(error.message)}
      </span>
    `;

    return;
  }

  const rows = data || [];

  if (!rows.length) {
    $("globalRows").innerHTML =
      '<span class="empty">No global rolls yet.</span>';

    $("todayBest").textContent = "—";

    $("allBest").textContent = "—";

    $("todayBestMeta").textContent = "No rolls today";

    $("allBestMeta").textContent = "No rolls yet";

    return;
  }

  const best = rows[0];

  $("allBest").textContent = best.roll;

  $("allBestMeta").textContent =
    `${best.player_name || "Player"} • ${best.rarity} • ${fmt(best.one_in)}`;

  applyRarityColor($("allBestMeta"), best.rarity);

  const todayStart = new Date();

  todayStart.setHours(0, 0, 0, 0);

  const todayRows = rows.filter(
    (x) => x.created_at && new Date(x.created_at) >= todayStart,
  );

  if (todayRows.length) {
    const todayBest = todayRows[0];

    $("todayBest").textContent = todayBest.roll;

    $("todayBestMeta").textContent =
      `${todayBest.player_name || "Player"} • ${todayBest.rarity} • ${fmt(todayBest.one_in)}`;

    applyRarityColor($("todayBestMeta"), todayBest.rarity);
  } else {
    $("todayBest").textContent = "—";

    $("todayBestMeta").textContent = "No rolls today";
  }

  $("globalRows").innerHTML = rows
    .map(
      (row, index) => `
          <div class="globalRow">

            <div class="rank">
              #${index + 1}
            </div>

            <div>

              <div class="globalPlayer">
                ${escapeHTML(row.player_name || "Player")}
              </div>

              <div class="small">
                ${
                  row.created_at
                    ? escapeHTML(new Date(row.created_at).toLocaleString())
                    : ""
                }
              </div>

            </div>

            <div class="globalRoll">
              ${escapeHTML(row.roll)}
            </div>

            <div>

              <div
                class="rarity ${rarityClass(row.rarity)}"
              >
                ${escapeHTML(row.rarity)}
              </div>

              <div class="small">
                ${fmt(row.one_in)}
              </div>

            </div>

          </div>
        `,
    )
    .join("");
}

/* ============================================================
   REALTIME
   ============================================================ */

function setupRealtime() {
  if (realtimeChannel) {
    try {
      supabaseClient.removeChannel(realtimeChannel);
    } catch (e) {}
  }

  realtimeChannel = supabaseClient
    .channel("digit-rolls-global")

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "rolls",
      },
      (payload) => {
        console.log("Realtime new roll:", payload.new);

        toast("🌎 New global roll!");

        loadLeaderboard();

        if (currentUser) {
          loadPersonalStats();
        }
      },
    )

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
      },
      (payload) => {
        if (currentUser && payload.new && payload.new.id === currentUser.id) {
          profile = payload.new;

          updateAccountUI();
        }
      },
    )

    .subscribe((status) => {
      console.log("Realtime status:", status);

      if (status === "SUBSCRIBED") {
        $("realtimeDot").classList.add("on");

        $("realtimeDot").classList.remove("off");

        $("realtimeText").textContent = "Realtime Online";
      } else {
        $("realtimeDot").classList.remove("on");

        $("realtimeDot").classList.add("off");

        $("realtimeText").textContent = "Realtime Offline";
      }
    });
}

/* ============================================================
   PART 4 END
   ============================================================ */
/* ============================================================
   PATTERN DETECTOR — PART 5
   ADVANCED MATHEMATICAL + STRUCTURAL PATTERNS
   ============================================================ */

/* ------------------------------------------------------------
   DIGIT SUM
   ------------------------------------------------------------ */

function digitSum(digits) {
  return digits.reduce((sum, d) => sum + Number(d), 0);
}

function digitalRoot(digits) {
  if (!digits.length) return 0;

  let n = digitSum(digits);

  while (n >= 10) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }

  return n;
}

/* ------------------------------------------------------------
   PERFECT DIGITAL ROOTS
   ------------------------------------------------------------ */

const root = digitalRoot(digits);

if (digits.length >= 4 && root === 7) {
  badges.push({
    name: "🍀 Lucky Root 7",
    explanation: "The visible digits reduce to the lucky digital root of 7.",
    rarity: "UNCOMMON",
    rarityScore: 2,
  });
}

if (digits.length >= 4 && root === 9) {
  badges.push({
    name: "🔮 Root 9",
    explanation: "The visible digits reduce to a digital root of 9.",
    rarity: "UNCOMMON",
    rarityScore: 2,
  });
}

/* ------------------------------------------------------------
   REPEATED PAIRS
   ------------------------------------------------------------ */

const pairs = [];

for (let i = 0; i < compact.length - 1; i++) {
  pairs.push(compact.slice(i, i + 2));
}

const pairCounts = {};

pairs.forEach((pair) => {
  pairCounts[pair] = (pairCounts[pair] || 0) + 1;
});

if (Object.values(pairCounts).some((count) => count >= 2)) {
  badges.push({
    name: "🔁 Pair Echo",
    explanation: "The same two-digit pair appears more than once.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   DOUBLE DOUBLE
   ------------------------------------------------------------ */

if (
  /(00|11|22|33|44|55|66|77|88|99)(00|11|22|33|44|55|66|77|88|99)/.test(compact)
) {
  badges.push({
    name: "👯 Double Double",
    explanation:
      "Two consecutive double-digit groups appear next to each other.",
    rarity: "EPIC",
    rarityScore: 4,
  });
}

/* ------------------------------------------------------------
   ABAB PATTERNS
   ------------------------------------------------------------ */

for (let i = 0; i <= compact.length - 4; i++) {
  const a = compact[i];
  const b = compact[i + 1];

  if (a !== b && compact[i + 2] === a && compact[i + 3] === b) {
    badges.push({
      name: "⚡ ABAB Pattern",
      explanation:
        "Two different digits alternate in a repeating ABAB pattern.",
      rarity: "RARE",
      rarityScore: 3,
    });

    break;
  }
}

/* ------------------------------------------------------------
   ABCABC PATTERN
   ------------------------------------------------------------ */

for (let i = 0; i <= compact.length - 6; i++) {
  const first = compact.slice(i, i + 3);
  const second = compact.slice(i + 3, i + 6);

  if (first.length === 3 && first === second && new Set(first).size >= 2) {
    badges.push({
      name: "🔄 ABCABC",
      explanation: "A three-digit sequence repeats immediately.",
      rarity: "EPIC",
      rarityScore: 4,
    });

    break;
  }
}

/* ------------------------------------------------------------
   THREE IDENTICAL PAIRS
   ------------------------------------------------------------ */

for (let i = 0; i <= compact.length - 6; i++) {
  const a = compact.slice(i, i + 2);
  const b = compact.slice(i + 2, i + 4);
  const c = compact.slice(i + 4, i + 6);

  if (a === b && b === c) {
    badges.push({
      name: "👑 Triple Pair",
      explanation: "The same two-digit pair appears three times consecutively.",
      rarity: "LEGENDARY",
      rarityScore: 6,
    });

    break;
  }
}

/* ------------------------------------------------------------
   EVEN / ODD ALTERNATION
   ------------------------------------------------------------ */

if (digits.length >= 6) {
  let alternating = true;

  for (let i = 1; i < digits.length; i++) {
    const previous = Number(digits[i - 1]) % 2;
    const current = Number(digits[i]) % 2;

    if (previous === current) {
      alternating = false;
      break;
    }
  }

  if (alternating) {
    badges.push({
      name: "⚡ Even-Odd Wave",
      explanation:
        "The visible digits alternate perfectly between even and odd.",
      rarity: "RARE",
      rarityScore: 3,
    });
  }
}

/* ------------------------------------------------------------
   ALL EVEN
   ------------------------------------------------------------ */

if (digits.length >= 6 && digits.every((d) => Number(d) % 2 === 0)) {
  badges.push({
    name: "🔵 All Even",
    explanation: "Every visible digit is even.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   ALL ODD
   ------------------------------------------------------------ */

if (digits.length >= 6 && digits.every((d) => Number(d) % 2 === 1)) {
  badges.push({
    name: "🔴 All Odd",
    explanation: "Every visible digit is odd.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   SUM OF 10
   ------------------------------------------------------------ */

if (digits.length >= 5 && digitSum(digits) === 10) {
  badges.push({
    name: "🔟 Perfect Sum 10",
    explanation: "All visible digits add up to exactly 10.",
    rarity: "EPIC",
    rarityScore: 4,
  });
}

/* ------------------------------------------------------------
   SUM OF 55
   ------------------------------------------------------------ */

if (digits.length >= 8 && digitSum(digits) === 55) {
  badges.push({
    name: "⚔️ Sum of 55",
    explanation:
      "The visible digits add up to 55 — another hidden Kingsammelot connection.",
    rarity: "LEGENDARY",
    rarityScore: 6,
  });
}

/* ------------------------------------------------------------
   ZERO BALANCE
   ------------------------------------------------------------ */

if (digits.length >= 6) {
  const evens = digits.filter((d) => Number(d) % 2 === 0).length;

  const odds = digits.filter((d) => Number(d) % 2 === 1).length;

  if (evens === odds) {
    badges.push({
      name: "⚖️ Perfect Balance",
      explanation:
        "The roll contains exactly the same number of even and odd digits.",
      rarity: "UNCOMMON",
      rarityScore: 2,
    });
  }
}

/* ------------------------------------------------------------
   CENTER MATCH
   ------------------------------------------------------------ */

if (compact.length >= 5) {
  const middle = Math.floor(compact.length / 2);

  if (
    compact[middle] === compact[middle - 1] ||
    compact[middle] === compact[middle + 1]
  ) {
    badges.push({
      name: "🎯 Center Match",
      explanation:
        "The center of the visible number contains matching neighboring digits.",
      rarity: "UNCOMMON",
      rarityScore: 2,
    });
  }
}

/* ------------------------------------------------------------
   OUTER MATCH
   ------------------------------------------------------------ */

if (compact.length >= 4) {
  if (compact[0] === compact[compact.length - 1]) {
    badges.push({
      name: "⭕ Outer Match",
      explanation: "The first and last visible digits are identical.",
      rarity: "UNCOMMON",
      rarityScore: 2,
    });
  }
}

/* ------------------------------------------------------------
   DOUBLE ENDS
   ------------------------------------------------------------ */

if (compact.length >= 6) {
  if (
    compact[0] === compact[1] &&
    compact[compact.length - 1] === compact[compact.length - 2]
  ) {
    badges.push({
      name: "🔒 Double Ends",
      explanation: "Both ends of the visible number contain matching pairs.",
      rarity: "EPIC",
      rarityScore: 4,
    });
  }
}

/* ------------------------------------------------------------
   EDGE MIRROR
   ------------------------------------------------------------ */

if (compact.length >= 6) {
  const left = compact.slice(0, 3);
  const right = compact.slice(-3);

  if (left === right.split("").reverse().join("")) {
    badges.push({
      name: "🪞 Edge Mirror",
      explanation: "The first three digits mirror the final three digits.",
      rarity: "EPIC",
      rarityScore: 4,
    });
  }
}

/* ------------------------------------------------------------
   UNIQUE DIGIT RUN
   ------------------------------------------------------------ */

if (digits.length >= 6 && new Set(digits).size === digits.length) {
  badges.push({
    name: "💎 No Repeats",
    explanation:
      "Every visible digit is different from every other visible digit.",
    rarity: "EPIC",
    rarityScore: 4,
  });
}

/* ------------------------------------------------------------
   HALF MIRROR
   ------------------------------------------------------------ */

if (compact.length === 6) {
  const firstHalf = compact.slice(0, 3);
  const secondHalf = compact.slice(3);

  if (
    firstHalf === secondHalf ||
    firstHalf === secondHalf.split("").reverse().join("")
  ) {
    badges.push({
      name: "🪞 Half Mirror",
      explanation:
        "The two halves of the six-digit roll mirror or duplicate each other.",
      rarity: "EPIC",
      rarityScore: 4,
    });
  }
}

/* ------------------------------------------------------------
   CONSECUTIVE DIFFERENCE OF 2
   ------------------------------------------------------------ */

if (digits.length >= 4) {
  const nums = digits.map(Number);

  for (let i = 0; i <= nums.length - 4; i++) {
    const diff1 = nums[i + 1] - nums[i];
    const diff2 = nums[i + 2] - nums[i + 1];
    const diff3 = nums[i + 3] - nums[i + 2];

    if (Math.abs(diff1) === 2 && diff1 === diff2 && diff2 === diff3) {
      badges.push({
        name: "📐 Double-Step",
        explanation: "A sequence moves by exactly two digits at every step.",
        rarity: "RARE",
        rarityScore: 3,
      });

      break;
    }
  }
}

/* ------------------------------------------------------------
   TRIANGLE NUMBER DIGITS
   ------------------------------------------------------------ */

const triangleNumbers = [
  "136",
  "610",
  "153",
  "210",
  "325",
  "456",
  "666",
  "789",
];

if (triangleNumbers.some((pattern) => compact.includes(pattern))) {
  badges.push({
    name: "🔺 Number Triangle",
    explanation:
      "A recognizable triangular-number sequence appears inside the roll.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   FIBONACCI-LIKE DIGITS
   ------------------------------------------------------------ */

const fibonacciPatterns = [
  "112",
  "123",
  "235",
  "358",
  "134",
  "145",
  "224",
  "347",
];

if (fibonacciPatterns.some((pattern) => compact.includes(pattern))) {
  badges.push({
    name: "🌀 Fibonacci Echo",
    explanation:
      "A short digit pattern resembling a Fibonacci sequence appears.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   55 SPECIAL
   ------------------------------------------------------------ */

if (compact.includes("55")) {
  badges.push({
    name: "⚔️ 55 — Kingsammelot",
    explanation: "A special Kingsammelot reference hidden inside the roll.",
    rarity: "RARE",
    rarityScore: 3,
  });
}

/* ------------------------------------------------------------
   LUCKY 777
   ------------------------------------------------------------ */

if (compact.includes("777")) {
  badges.push({
    name: "🎰 777",
    explanation: "Three 7s appear consecutively — the classic jackpot pattern.",
    rarity: "LEGENDARY",
    rarityScore: 6,
  });
}

/* ------------------------------------------------------------
   67 SPECIAL
   ------------------------------------------------------------ */

if (compact.includes("67")) {
  badges.push({
    name: "🔢 67",
    explanation: "The special 67 sequence appears inside the roll.",
    rarity: "UNCOMMON",
    rarityScore: 2,
  });
}

/* ------------------------------------------------------------
   SORT BADGES BY RARITY
   ------------------------------------------------------------ */

const rarityOrder = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
  DIVINE: 7,
  TRANSCENDENT: 8,
  "???": 9,
};

badges.sort(
  (a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0),
);
/* ============================================================
   PART 6 — FINALIZATION / EVENTS / INITIALIZATION
   ============================================================ */

/* ============================================================
   ROLL BUTTON
   ============================================================ */

$("rollBtn").onclick = performRoll;

/* ============================================================
   PROFILE BUTTON
   ============================================================ */

$("profileButton").onclick = () => {
  $("profileSection").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

/* ============================================================
   LOGOUT
   ============================================================ */

$("logoutButton").onclick = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      toast("Unable to log out.");
      return;
    }

    currentUser = null;
    profile = null;

    updateAccountUI();

    toast("Logged out.");
  } catch (error) {
    console.error("Logout exception:", error);
    toast("Unable to log out.");
  }
};

/* ============================================================
   REFRESH LEADERBOARD
   ============================================================ */

$("refreshLeaderboard").onclick = async () => {
  if ($("refreshLeaderboard").disabled) return;

  $("refreshLeaderboard").disabled = true;

  try {
    await loadLeaderboard();
    toast("Leaderboard refreshed.");
  } catch (error) {
    console.error("Leaderboard refresh error:", error);
    toast("Unable to refresh leaderboard.");
  }

  $("refreshLeaderboard").disabled = false;
};

/* ============================================================
   AUTH STATE
   ============================================================ */

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth state:", event);

  /*
   * Supabase can fire INITIAL_SESSION and SIGNED_IN
   * very close together.
   *
   * Delay the database work so the auth state has settled.
   */

  if (session?.user) {
    currentUser = session.user;

    setTimeout(async () => {
      if (!currentUser) return;

      try {
        await ensureProfile(currentUser);

        updateAccountUI();

        await loadPersonalStats();

        await loadLeaderboard();
      } catch (error) {
        console.error("Auth initialization error:", error);
      }
    }, 0);
  } else {
    currentUser = null;
    profile = null;

    updateAccountUI();
  }
});

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  console.log("🚀 Digit Roll initializing...");

  /*
   * Load local data first so the UI works even if
   * Supabase is unavailable.
   */

  loadLocal();

  updateAccountUI();

  /* ----------------------------------------------------------
     RESTORE SESSION
     ---------------------------------------------------------- */

  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.warn("Session error:", error);
    }

    if (data?.session?.user) {
      currentUser = data.session.user;

      await ensureProfile(currentUser);

      updateAccountUI();

      await loadPersonalStats();
    }
  } catch (error) {
    console.warn("Initial auth check failed:", error);
  }

  /* ----------------------------------------------------------
     GLOBAL LEADERBOARD
     ---------------------------------------------------------- */

  try {
    await loadLeaderboard();
  } catch (error) {
    console.warn("Initial leaderboard load failed:", error);
  }

  /* ----------------------------------------------------------
     REALTIME
     ---------------------------------------------------------- */

  try {
    setupRealtime();
  } catch (error) {
    console.warn("Realtime setup failed:", error);

    if ($("realtimeDot")) {
      $("realtimeDot").classList.remove("on");
      $("realtimeDot").classList.add("off");
    }

    if ($("realtimeText")) {
      $("realtimeText").textContent = "Realtime Offline";
    }
  }

  /* ----------------------------------------------------------
     READY
     ---------------------------------------------------------- */

  console.log("✅ Digit Roll ready!");
}

/* ============================================================
   START APP
   ============================================================ */

init();
