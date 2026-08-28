```javascript
/* ============================================================
   DIGIT ROLL
   FULL SCRIPT — 6 DIGITS
   ============================================================ */


/* ============================================================
   SUPABASE
   ============================================================ */

const SUPABASE_URL =
  "https://xuofbnghqcktlsmjgfbj.supabase.co";

/*
 * IMPORTANT:
 * Replace this with your CURRENT Supabase publishable/anon key.
 *
 * The key previously being used is returning:
 * 401 Invalid API key
 */

const SUPABASE_ANON_KEY =
  "PASTE_YOUR_CURRENT_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR")
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}


/* ============================================================
   REFERENCES
   ============================================================ */

const references = {

  911: [
    "🚨 Emergency 911",
    "The famous emergency telephone number.",
    "RARE"
  ],

  "007": [
    "🕵️ Agent 007",
    "The iconic code name of James Bond.",
    "RARE"
  ],

  420: [
    "🌿 420",
    "A famous number from popular culture.",
    "UNCOMMON"
  ],

  404: [
    "🌐 404 Not Found",
    "The familiar web error code.",
    "UNCOMMON"
  ],

  1337: [
    "💻 LEET",
    "Classic internet and gaming slang for 'leet'.",
    "EPIC"
  ],

  666: [
    "😈 The Number",
    "A famously recognizable number with cultural significance.",
    "EPIC"
  ],

  777: [
    "🎰 Lucky 7s",
    "Three 7s are a classic lucky-slot-machine pattern.",
    "LEGENDARY"
  ],

  42: [
    "🌌 The Answer",
    "The famously celebrated answer to life, the universe, and everything.",
    "RARE"
  ],

  101: [
    "📚 101",
    "A common shorthand for an introductory course or beginner's guide.",
    "UNCOMMON"
  ],

  123: [
    "🔢 Counting Up",
    "The first three digits of the familiar counting sequence.",
    "UNCOMMON"
  ],

  321: [
    "🚀 Countdown",
    "A classic countdown fragment.",
    "UNCOMMON"
  ],

  314: [
    "🥧 Pi",
    "The first three digits of pi.",
    "RARE"
  ],

  1984: [
    "📖 1984",
    "A recognizable reference to George Orwell's novel.",
    "EPIC"
  ],

  2001: [
    "🚀 2001",
    "A recognizable science-fiction reference.",
    "EPIC"
  ],

  69: [
    "😎 Nice",
    "A widely recognized internet-number joke/reference.",
    "UNCOMMON"
  ],

  67: [
    "🔢 67",
    "A special 67 reference hidden inside the roll.",
    "UNCOMMON"
  ],

  55: [
    "⚔️ 55 — Kingsammelot",
    "A Kingsammelot reference.",
    "UNCOMMON"
  ]
};


/* ============================================================
   PERIODIC TABLE — FIRST 9 ELEMENTS
   ============================================================ */

const elementBadges = {

  "1": {
    name: "⚛️ Hydrogen",
    explanation:
      "The roll contains at least one 1. Hydrogen is element #1.",
    rarity: "COMMON"
  },

  "2": {
    name: "⚛️ Helium",
    explanation:
      "The roll contains at least one 2. Helium is element #2.",
    rarity: "COMMON"
  },

  "3": {
    name: "⚛️ Lithium",
    explanation:
      "The roll contains at least one 3. Lithium is element #3.",
    rarity: "COMMON"
  },

  "4": {
    name: "⚛️ Beryllium",
    explanation:
      "The roll contains at least one 4. Beryllium is element #4.",
    rarity: "COMMON"
  },

  "5": {
    name: "⚛️ Boron",
    explanation:
      "The roll contains at least one 5. Boron is element #5.",
    rarity: "COMMON"
  },

  "6": {
    name: "⚛️ Carbon",
    explanation:
      "The roll contains at least one 6. Carbon is element #6.",
    rarity: "COMMON"
  },

  "7": {
    name: "⚛️ Nitrogen",
    explanation:
      "The roll contains at least one 7. Nitrogen is element #7.",
    rarity: "COMMON"
  },

  "8": {
    name: "⚛️ Oxygen",
    explanation:
      "The roll contains at least one 8. Oxygen is element #8.",
    rarity: "COMMON"
  },

  "9": {
    name: "⚛️ Fluorine",
    explanation:
      "The roll contains at least one 9. Fluorine is element #9.",
    rarity: "COMMON"
  }
};


/* ============================================================
   HELPERS
   ============================================================ */

const $ = (id) =>
  document.getElementById(id);

let history = [];
let personalBest = null;
let allTimeBest = null;

let currentUser = null;
let profile = null;

let rolling = false;
let realtimeChannel = null;


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


function fmt(number) {

  const value = Number(number);

  if (!Number.isFinite(value)) {
    return "1 in —";
  }

  return (
    "1 in " +
    Math.round(value).toLocaleString()
  );
}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function better(a, b) {

  if (!a) return false;

  if (!b) return true;

  return Number(a.oneIn || 0) >
    Number(b.oneIn || 0);
}


/* ============================================================
   RARITY
   ============================================================ */

const RARITY_ORDER = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "DIVINE",
  "TRANSCENDENT",
  "???"
];


const RARITY_SCORE = {

  COMMON: 0,

  UNCOMMON: 1,

  RARE: 2,

  EPIC: 3,

  LEGENDARY: 4,

  MYTHIC: 5,

  DIVINE: 6,

  TRANSCENDENT: 7,

  "???": 8
};


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

    "???": "rarity-unknown"
  };

  return (
    classes[rarity] ||
    "rarity-common"
  );
}


function applyRarityColor(
  element,
  rarity
) {

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
    "rarity-unknown"

  );

  element.classList.add(
    rarityClass(rarity)
  );
}


/* ============================================================
   RARITY HELPERS
   ============================================================ */

function badgeRarityFromDifficulty(
  difficulty
) {

  if (difficulty <= 2)
    return "COMMON";

  if (difficulty <= 5)
    return "UNCOMMON";

  if (difficulty <= 10)
    return "RARE";

  if (difficulty <= 25)
    return "EPIC";

  if (difficulty <= 100)
    return "LEGENDARY";

  if (difficulty <= 500)
    return "MYTHIC";

  if (difficulty <= 2500)
    return "DIVINE";

  return "TRANSCENDENT";
}


function rarityValue(rarity) {

  const values = {

    COMMON: 1,

    UNCOMMON: 3,

    RARE: 8,

    EPIC: 20,

    LEGENDARY: 50,

    MYTHIC: 150,

    DIVINE: 500,

    TRANSCENDENT: 2000,

    "???": 10000
  };

  return values[rarity] || 1;
}


/* ============================================================
   RANDOM ROLL
   ============================================================ */

function randomRoll() {

  const chars = [];

  let blanks = 0;

  /*
   * Exactly SIX positions.
   */

  for (let i = 0; i < 6; i++) {

    if (Math.random() < 0.035) {

      chars.push("_");

      blanks++;

    } else {

      chars.push(
        String(
          Math.floor(
            Math.random() * 10
          )
        )
      );
    }
  }


  /*
   * Never allow an entirely blank roll.
   */

  if (blanks === 6) {

    const index =
      Math.floor(
        Math.random() * 6
      );

    chars[index] =
      String(
        Math.floor(
          Math.random() * 10
        )
      );
  }

  return chars;
}


/* ============================================================
   PATTERN DETECTOR HELPERS
   ============================================================ */

function addBadge(
  badges,
  name,
  explanation,
  rarity,
  score = 1
) {

  badges.push({

    name,

    explanation,

    badgeRarity: rarity,

    score: score
  });
}


function containsAny(
  text,
  patterns
) {

  return patterns.some(
    pattern =>
      text.includes(pattern)
  );
}


/* ============================================================
   ADVANCED ANALYSIS
   ============================================================ */

function analyze(chars) {

  const digits =
    chars.filter(
      x => x !== "_"
    );

  const compact =
    digits.join("");

  const badges = [];


  /* ==========================================================
     PERIODIC TABLE
     ========================================================== */

  const seenElements =
    new Set();

  for (const digit of digits) {

    if (
      elementBadges[digit] &&
      !seenElements.has(digit)
    ) {

      const element =
        elementBadges[digit];

      addBadge(
        badges,
        element.name,
        element.explanation,
        element.rarity,
        1
      );

      seenElements.add(digit);
    }
  }


  /* ==========================================================
     REFERENCES
     ========================================================== */

  for (
    const [
      key,
      [name, explanation, rarity]
    ]
    of Object.entries(references)
  ) {

    if (
      compact.includes(key)
    ) {

      addBadge(
        badges,
        name,
        explanation,
        rarity,
        rarityValue(rarity)
      );
    }
  }


  /* ==========================================================
     DIGIT COUNTS
     ========================================================== */

  const counts = {};

  digits.forEach(digit => {

    counts[digit] =
      (counts[digit] || 0) + 1;
  });

  const maxCount =
    Math.max(
      0,
      ...Object.values(counts)
    );


  /* ==========================================================
     REPEATER
     ========================================================== */

  if (maxCount >= 2) {

    addBadge(

      badges,

      "🔁 Repeater",

      "At least one visible digit appears more than once.",

      "COMMON",

      1
    );
  }


  /* ==========================================================
     DOUBLES
     ========================================================== */

  if (
    /00|11|22|33|44|55|66|77|88|99/
      .test(compact)
  ) {

    addBadge(

      badges,

      "👯 Double",

      "Two identical digits appear directly beside each other.",

      "UNCOMMON",

      3
    );
  }


  /* ==========================================================
     TRIPLES
     ========================================================== */

  if (
    /000|111|222|333|444|555|666|777|888|999/
      .test(compact)
  ) {

    addBadge(

      badges,

      "🔥 Triple Stack",

      "Three identical digits appear consecutively.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     QUADS
     ========================================================== */

  if (
    /0000|1111|2222|3333|4444|5555|6666|7777|8888|9999/
      .test(compact)
  ) {

    addBadge(

      badges,

      "💥 Quad Stack",

      "Four identical digits appear consecutively.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     QUINTS
     ========================================================== */

  if (
    /00000|11111|22222|33333|44444|55555|66666|77777|88888|99999/
      .test(compact)
  ) {

    addBadge(

      badges,

      "☢️ Quint Stack",

      "Five identical digits appear consecutively.",

      "LEGENDARY",

      50
    );
  }


  /* ==========================================================
     SIX OF A KIND
     ========================================================== */

  if (
    /^(.)\1{5}$/.test(compact)
  ) {

    addBadge(

      badges,

      "👑 Six of a Kind",

      "All six visible digits are identical.",

      "MYTHIC",

      150
    );
  }


  /* ==========================================================
     MONOCHROME
     ========================================================== */

  if (
    digits.length >= 2 &&
    new Set(digits).size === 1
  ) {

    addBadge(

      badges,

      "👑 Monochrome",

      "Every visible digit is identical.",

      "MYTHIC",

      150
    );
  }


  /* ==========================================================
     ALL TEN DIGITS
     ========================================================== */

  if (
    digits.length === 10 &&
    new Set(digits).size === 10
  ) {

    addBadge(

      badges,

      "🌈 All Ten Digits",

      "Every digit from 0 through 9 appears exactly once.",

      "TRANSCENDENT",

      2000
    );
  }


  /* ==========================================================
     RISING
     ========================================================== */

  if (
    containsAny(
      compact,
      [
        "012",
        "123",
        "234",
        "345",
        "456",
        "567",
        "678",
        "789"
      ]
    )
  ) {

    addBadge(

      badges,

      "📈 Rising Sequence",

      "Three consecutive digits appear in ascending order.",

      "UNCOMMON",

      3
    );
  }


  /* ==========================================================
     FOUR DIGIT STAIRCASE
     ========================================================== */

  if (
    containsAny(
      compact,
      [
        "0123",
        "1234",
        "2345",
        "3456",
        "4567",
        "5678",
        "6789"
      ]
    )
  ) {

    addBadge(

      badges,

      "🪜 Staircase",

      "Four consecutive digits climb steadily upward.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     FIVE DIGIT STAIRCASE
     ========================================================== */

  if (
    containsAny(
      compact,
      [
        "01234",
        "12345",
        "23456",
        "34567",
        "45678",
        "56789"
      ]
    )
  ) {

    addBadge(

      badges,

      "🚀 Mega Staircase",

      "Five consecutive digits rise steadily upward.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     FALLING
     ========================================================== */

  if (
    containsAny(
      compact,
      [
        "987",
        "876",
        "765",
        "654",
        "543",
        "432",
        "321",
        "210"
      ]
    )
  ) {

    addBadge(

      badges,

      "📉 Falling Sequence",

      "Three consecutive digits appear in descending order.",

      "UNCOMMON",

      3
    );
  }


  /* ==========================================================
     REVERSE STAIRCASE
     ========================================================== */

  if (
    containsAny(
      compact,
      [
        "9876",
        "8765",
        "7654",
        "6543",
        "5432",
        "4321",
        "3210"
      ]
    )
  ) {

    addBadge(

      badges,

      "🪜 Reverse Staircase",

      "Four consecutive digits descend steadily.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     MOUNTAINS
     ========================================================== */

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
    "5678765"
  ];

  if (
    containsAny(
      compact,
      mountainPatterns
    )
  ) {

    addBadge(

      badges,

      "⛰️ Mountain",

      "Numbers rise to a peak in order and then fall back down.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     VALLEYS
     ========================================================== */

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
    "7656789"
  ];

  if (
    containsAny(
      compact,
      valleyPatterns
    )
  ) {

    addBadge(

      badges,

      "🏞️ Valley",

      "Numbers fall to a low point in order and then rise again.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     WAVES
     ========================================================== */

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
    "78987"
  ];

  if (
    containsAny(
      compact,
      wavePatterns
    )
  ) {

    addBadge(

      badges,

      "🌊 Wave",

      "The digits repeatedly rise and fall, creating a wave-like pattern.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     MIRRORS
     ========================================================== */

  for (
    let len = 3;
    len <= 6;
    len++
  ) {

    let found = false;

    for (
      let i = 0;
      i <= compact.length - len;
      i++
    ) {

      const part =
        compact.slice(
          i,
          i + len
        );

      if (
        part ===
        part
          .split("")
          .reverse()
          .join("")
      ) {

        addBadge(

          badges,

          "🪞 Mirror",

          "A sequence reads the same forward and backward.",

          badgeRarityFromDifficulty(
            Math.pow(10, len - 2)
          ),

          Math.pow(10, len - 2)
        );

        found = true;

        break;
      }
    }

    if (found) break;
  }


  /* ==========================================================
     PERFECT PALINDROME
     ========================================================== */

  if (
    compact.length >= 4 &&
    compact ===
      compact
        .split("")
        .reverse()
        .join("")
  ) {

    addBadge(

      badges,

      "🪞 Perfect Mirror",

      "The entire visible number reads identically forward and backward.",

      "LEGENDARY",

      50
    );
  }


  /* ==========================================================
     ALTERNATORS
     ========================================================== */

  if (
    /0101|1212|2323|3434|4545|5656|6767|7878|8989/
      .test(compact)
  ) {

    addBadge(

      badges,

      "⚡ Alternator",

      "Two digits repeatedly alternate back and forth.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     LOOPS
     ========================================================== */

  const loopPatterns = [

    "012345",
    "123450",
    "234501",
    "345012",
    "450123",
    "501234",

    "987654",
    "876543",
    "765432",
    "654321",
    "543210"
  ];

  if (
    containsAny(
      compact,
      loopPatterns
    )
  ) {

    addBadge(

      badges,

      "🔄 Digit Loop",

      "The digits travel through a repeating numeric cycle.",

      "LEGENDARY",

      50
    );
  }


  /* ==========================================================
     PYRAMIDS
     ========================================================== */

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
    "88988"
  ];

  if (
    containsAny(
      compact,
      pyramidPatterns
    )
  ) {

    addBadge(

      badges,

      "🔺 Pyramid",

      "Digits expand toward a center and then contract, creating a pyramid-like pattern.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     ARITHMETIC PATTERN
     ========================================================== */

  if (
    digits.length >= 4
  ) {

    const diffs = [];

    for (
      let i = 1;
      i < digits.length;
      i++
    ) {

      diffs.push(
        Number(digits[i]) -
        Number(digits[i - 1])
      );
    }

    if (
      diffs.length >= 3 &&
      diffs.every(
        difference =>
          difference === diffs[0]
      ) &&
      diffs[0] !== 0
    ) {

      addBadge(

        badges,

        "📐 Arithmetic Pattern",

        "The visible digits change by the same amount at every step.",

        "EPIC",

        20
      );
    }
  }


  /* ==========================================================
     GEOMETRIC-STYLE PATTERN
     ========================================================== */

  if (
    digits.length >= 4
  ) {

    const numbers =
      digits.map(Number);

    let geometric = true;

    let ratio = null;

    for (
      let i = 1;
      i < numbers.length;
      i++
    ) {

      if (
        numbers[i - 1] === 0
      ) {

        geometric = false;

        break;
      }

      const current =
        numbers[i] /
        numbers[i - 1];

      if (ratio === null) {

        ratio = current;

      } else if (
        Math.abs(
          current - ratio
        ) > 0.0001
      ) {

        geometric = false;

        break;
      }
    }

    if (
      geometric &&
      ratio !== null &&
      ratio !== 1
    ) {

      addBadge(

        badges,

        "✖️ Geometric Pattern",

        "The visible digits follow a consistent multiplication ratio.",

        "LEGENDARY",

        50
      );
    }
  }


  /* ==========================================================
     PARITY
     ========================================================== */

  if (
    digits.length >= 5
  ) {

    const parity =
      digits.map(
        digit =>
          Number(digit) % 2
      );

    if (
      parity.every(
        value =>
          value === parity[0]
      )
    ) {

      addBadge(

        badges,

        "⚫⚪ Parity Chain",

        "Every visible digit has the same odd/even parity.",

        "RARE",

        8
      );
    }
  }


  /* ==========================================================
     ODD / EVEN ALTERNATION
     ========================================================== */

  if (
    digits.length >= 4
  ) {

    let alternating = true;

    for (
      let i = 1;
      i < digits.length;
      i++
    ) {

      if (
        Number(digits[i]) % 2 ===
        Number(digits[i - 1]) % 2
      ) {

        alternating = false;

        break;
      }
    }

    if (alternating) {

      addBadge(

        badges,

        "⚡ Odd-Even Alternator",

        "Odd and even digits alternate throughout the visible roll.",

        "UNCOMMON",

        3
      );
    }
  }


  /* ==========================================================
     UNIQUE DIGITS
     ========================================================== */

  if (
    digits.length >= 4 &&
    new Set(digits).size ===
      digits.length
  ) {

    addBadge(

      badges,

      "✨ No Repeats",

      "Every visible digit is different.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     DOUBLE PAIR
     ========================================================== */

  const pairCount =
    Object.values(counts)
      .filter(
        count => count >= 2
      )
      .length;

  if (
    pairCount >= 2
  ) {

    addBadge(

      badges,

      "👯‍♂️ Double Pair",

      "At least two different digits each appear at least twice.",

      "RARE",

      8
    );
  }


  /* ==========================================================
     THREE PAIRS
     ========================================================== */

  if (
    digits.length === 6 &&
    Object.values(counts)
      .filter(
        count => count === 2
      )
      .length === 3
  ) {

    addBadge(

      badges,

      "🎯 Triple Pair",

      "All six positions form three matching pairs.",

      "EPIC",

      20
    );
  }


  /* ==========================================================
     SPLIT MIRROR
     ========================================================== */

  if (
    compact.length === 6 &&
    compact.slice(0, 3) ===
      compact
        .slice(3)
        .split("")
        .reverse()
        .join("")
  ) {

    addBadge(

      badges,

      "🪞 Split Mirror",

      "The second half mirrors the first half.",

      "LEGENDARY",

      50
    );
  }


  /* ==========================================================
     CENTER DOUBLE
     ========================================================== */

  if (
    compact.length === 6 &&
    compact[2] === compact[3]
  ) {

    addBadge(

      badges,

      "🎯 Center Double",

      "The two middle digits are identical.",

      "UNCOMMON",

      3
    );
  }


  /* ==========================================================
     SAME FIRST / LAST
     ========================================================== */

  if (
    compact.length >= 3 &&
    compact[0] ===
      compact[compact.length - 1]
  ) {

    addBadge(

      badges,

      "🔁 Bookend",

      "The first and final visible digits are identical.",

      "UNCOMMON",

      3
    );
  }


  /* ==========================================================
     SORT BADGES
     ========================================================== */

  badges.sort(
    (a, b) =>
      rarityValue(b.badgeRarity) -
      rarityValue(a.badgeRarity)
  );


  /* ==========================================================
     OVERALL RARITY
     ========================================================== */

  let score = 0;

  for (const badge of badges) {

    score +=
      rarityValue(
        badge.badgeRarity
      );
  }


  /*
   * Blank positions contribute a little,
   * but don't completely dominate rarity.
   */

  const blanks =
    chars.filter(
      x => x === "_"
    ).length;

  score += blanks * 3;


  /*
   * Extra rarity for very strong
   * structural patterns.
   */

  if (
    badges.some(
      b =>
        b.badgeRarity ===
        "TRANSCENDENT"
    )
  ) {
    score += 100;
  }

  if (
    badges.some(
      b =>
        b.badgeRarity ===
        "DIVINE"
    )
  ) {
    score += 50;
  }


  let rarity = "COMMON";

  if (score >= 3)
    rarity = "UNCOMMON";

  if (score >= 8)
    rarity = "RARE";

  if (score >= 20)
    rarity = "EPIC";

  if (score >= 50)
    rarity = "LEGENDARY";

  if (score >= 150)
    rarity = "MYTHIC";

  if (score >= 500)
    rarity = "DIVINE";

  if (score >= 2000)
    rarity = "TRANSCENDENT";

  if (score >= 10000)
    rarity = "???";


  /* ==========================================================
     DISPLAY CHANCE
     ========================================================== */

  /*
   * This is now only the overall-roll estimate.
   * Badge rarity itself is no longer represented as a chance.
   */

  let oneIn = 1;

  if (score >= 3)
    oneIn = 5;

  if (score >= 8)
    oneIn = 25;

  if (score >= 20)
    oneIn = 100;

  if (score >= 50)
    oneIn = 500;

  if (score >= 150)
    oneIn = 5000;

  if (score >= 500)
    oneIn = 50000;

  if (score >= 2000)
    oneIn = 500000;

  if (score >= 10000)
    oneIn = 10000000;


  /*
   * Blanks make the result somewhat more unusual.
   */

  if (blanks > 0) {

    oneIn *=
      Math.pow(
        20,
        blanks
      );
  }


  /* ==========================================================
     XP
     ========================================================== */

  const badgeXP =
    badges.reduce(
      (sum, badge) => {

        return (
          sum +
          Math.max(
            5,
            rarityValue(
              badge.badgeRarity
            )
          );
      },
      0
    );

  const blankXP =
    blanks * 40;

  const rarityXP =
    Math.max(
      0,
      Math.floor(
        Math.log10(
          Math.max(
            1,
            oneIn
          )
        ) * 5
      )
    );

  const xp =
    Math.max(
      5,
      badgeXP +
      blankXP +
      rarityXP
    );


  return {

    badges,

    oneIn,

    rarity,

    shown:
      digits.length,

    blanks,

    blankMultiplier:
      Math.pow(
        10,
        blanks
      ),

    xp,

    score
  };
}


/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function saveLocal() {

  try {

    localStorage.setItem(
      "digitRollHistory",
      JSON.stringify(history)
    );

    localStorage.setItem(
      "digitRollPersonal",
      JSON.stringify(personalBest)
    );

    localStorage.setItem(
      "digitRollAll",
      JSON.stringify(allTimeBest)
    );

  } catch (error) {

    console.warn(
      "Local save unavailable",
      error
    );
  }
}


function loadLocal() {

  try {

    history =
      JSON.parse(
        localStorage.getItem(
          "digitRollHistory"
        )
      ) || [];

    personalBest =
      JSON.parse(
        localStorage.getItem(
          "digitRollPersonal"
        )
      ) || null;

    allTimeBest =
      JSON.parse(
        localStorage.getItem(
          "digitRollAll"
        )
      ) || null;

  } catch (error) {

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

  const count =
    $("historyCount");

  const historyElement =
    $("history");

  if (!count || !historyElement)
    return;


  count.textContent =
    history.length +
    (
      history.length === 1
        ? " roll"
        : " rolls"
    );


  if (!history.length) {

    historyElement.innerHTML =
      '<span class="empty">No rolls yet.</span>';

    return;
  }


  historyElement.innerHTML =
    history
      .slice(0, 30)
      .map(
        x => `

          <div class="historyrow">

            <span class="historynum">
              ${escapeHTML(x.roll)}
            </span>

            <span
              class="rarity ${rarityClass(
                x.rarity
              )}"
            >
              ${escapeHTML(x.rarity)}
            </span>

            <span class="xp">
              +${Number(x.xp) || 0} XP
            </span>

          </div>

        `
      )
      .join("");
}


/* ============================================================
   BADGE MODAL
   ============================================================ */

function showBadgeInfo(
  name,
  explanation,
  badgeRarity
) {

  const nameElement =
    $("badgeModalName");

  const explanationElement =
    $("badgeModalExplanation");

  const chanceElement =
    $("badgeModalChance");

  const modal =
    $("badgeModal");


  if (!modal) return;


  if (nameElement) {

    nameElement.textContent =
      name;
  }


  if (explanationElement) {

    explanationElement.textContent =
      explanation;
  }


  if (chanceElement) {

    chanceElement.textContent =
      "Badge rarity: " +
      badgeRarity;

    applyRarityColor(
      chanceElement,
      badgeRarity
    );
  }


  modal.classList.add(
    "open"
  );
}


function closeBadgeInfo() {

  const modal =
    $("badgeModal");

  if (modal) {

    modal.classList.remove(
      "open"
    );
  }
}


window.showBadgeInfo =
  showBadgeInfo;

window.closeBadgeInfo =
  closeBadgeInfo;


/* ============================================================
   AUTH UI
   ============================================================ */

let authMode = "login";


function openAuth() {

  const modal =
    $("authModal");

  if (modal) {

    modal.classList.add(
      "open"
    );
  }
}


function closeAuth() {

  const modal =
    $("authModal");

  if (modal) {

    modal.classList.remove(
      "open"
    );
  }
}


window.closeAuth =
  closeAuth;


if ($("loginTab")) {

  $("loginTab").onclick = () => {

    authMode = "login";

    $("loginTab")
      .classList.add("active");

    $("signupTab")
      ?.classList.remove("active");

    $("authTitle").textContent =
      "🔐 Login";

    $("authSubmit").textContent =
      "Login";

    $("authUsername").style.display =
      "none";

    $("authStatus").textContent =
      "";
  };
}


if ($("signupTab")) {

  $("signupTab").onclick = () => {

    authMode = "signup";

    $("signupTab")
      .classList.add("active");

    $("loginTab")
      ?.classList.remove("active");

    $("authTitle").textContent =
      "✨ Create Account";

    $("authSubmit").textContent =
      "Create Account";

    $("authUsername").style.display =
      "block";

    $("authStatus").textContent =
      "";
  };
}


if ($("authButton")) {

  $("authButton").onclick =
    openAuth;
}


/* ============================================================
   AUTH SUBMIT
   ============================================================ */

if ($("authSubmit")) {

  $("authSubmit").onclick =
    async () => {

      if (!supabaseClient) {

        $("authStatus").textContent =
          "Supabase is not configured. Add your current anon/publishable key.";

        return;
      }


      const email =
        $("authEmail")
          .value
          .trim();

      const password =
        $("authPassword")
          .value;

      const username =
        $("authUsername")
          .value
          .trim();


      if (
        !email ||
        !password
      ) {

        $("authStatus").textContent =
          "Please enter an email and password.";

        return;
      }


      $("authSubmit")
        .disabled = true;


      $("authStatus").textContent =
        authMode === "login"
          ? "Logging in..."
          : "Creating account...";


      try {

        if (
          authMode === "signup"
        ) {

          if (!username) {

            $("authStatus").textContent =
              "Please choose a username.";

            $("authSubmit")
              .disabled = false;

            return;
          }


          const {
            data,
            error
          } =
            await supabaseClient.auth.signUp({

              email,

              password,

              options: {

                data: {
                  username
                }
              }
            });


          if (error)
            throw error;


          if (data?.user) {

            if (data.session) {

              await ensureProfile(
                data.user,
                username
              );
            }

            $("authStatus").textContent =
              data.session
                ? "Account created!"
                : "Account created! Check your email to confirm it.";
          }

        } else {

          const {
            data,
            error
          } =
            await supabaseClient.auth
              .signInWithPassword({

                email,

                password
              });


          if (error)
            throw error;


          if (data?.user) {

            currentUser =
              data.user;

            await ensureProfile(
              data.user
            );

            closeAuth();

            toast(
              "Welcome back!"
            );
          }
        }

      } catch (error) {

        console.error(
          "Authentication error:",
          error
        );

        $("authStatus").textContent =
          friendlyAuthError(
            error
          );
      }


      $("authSubmit")
        .disabled = false;
    };
}


/* ============================================================
   AUTH ERRORS
   ============================================================ */

function friendlyAuthError(
  error
) {

  const message =
    String(
      error?.message ||
      error ||
      ""
    );

  const lower =
    message.toLowerCase();


  if (
    lower.includes(
      "invalid api key"
    )
  ) {

    return (
      "Supabase rejected the API key. Replace the key in script.js with your current anon/publishable key."
    );
  }


  if (
    lower.includes(
      "email not confirmed"
    )
  ) {

    return (
      "Your email is not confirmed yet. Check your email, then try logging in again."
    );
  }


  if (
    lower.includes(
      "invalid login credentials"
    )
  ) {

    return (
      "Incorrect email or password."
    );
  }


  if (
    lower.includes(
      "user already registered"
    )
  ) {

    return (
      "That email already has an account. Try logging in."
    );
  }


  return message;
}


/* ============================================================
   PROFILE
   ============================================================ */

async function ensureProfile(
  user,
  suppliedUsername = ""
) {

  if (
    !user ||
    !supabaseClient
  ) {

    return null;
  }


  const username =
    suppliedUsername ||
    user.user_metadata?.username ||
    "Player";


  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select(
        "id,username,created_at"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (error) {

    console.warn(
      "Profile lookup:",
      error
    );

    if (
      String(error.message)
        .toLowerCase()
        .includes(
          "invalid api key"
        )
    ) {

      return null;
    }
  }


  if (data) {

    profile = data;

    return data;
  }


  const {
    data: created,
    error: createError
  } =
    await supabaseClient
      .from("profiles")
      .insert({

        id: user.id,

        username
      })
      .select()
      .single();


  if (createError) {

    console.warn(
      "Profile creation:",
      createError
    );


    const {
      data: retry
    } =
      await supabaseClient
        .from("profiles")
        .select(
          "id,username,created_at"
        )
        .eq(
          "id",
          user.id
        )
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

  if (
    currentUser
  ) {

    const name =
      profile?.username ||
      currentUser
        .user_metadata
        ?.username ||
      "Player";


    if ($("userPill")) {

      $("userPill").textContent =
        "👤 " + name;
    }


    if ($("authButton")) {

      $("authButton")
        .style.display =
        "none";
    }


    if ($("profileButton")) {

      $("profileButton")
        .style.display =
        "inline-block";
    }


    if ($("logoutButton")) {

      $("logoutButton")
        .style.display =
        "inline-block";
    }


    if ($("profileSection")) {

      $("profileSection")
        .style.display =
        "block";
    }


    if ($("profileEmail")) {

      $("profileEmail")
        .textContent =
        currentUser.email || "";
    }


    if ($("profileUsername")) {

      $("profileUsername")
        .textContent =
        name;
    }


    if ($("usernameInput")) {

      $("usernameInput")
        .value =
        name;
    }

  } else {

    if ($("userPill")) {

      $("userPill")
        .textContent =
        "Guest";
    }


    if ($("authButton")) {

      $("authButton")
        .style.display =
        "inline-block";
    }


    if ($("profileButton")) {

      $("profileButton")
        .style.display =
        "none";
    }


    if ($("logoutButton")) {

      $("logoutButton")
        .style.display =
        "none";
    }


    if ($("profileSection")) {

      $("profileSection")
        .style.display =
        "none";
    }
  }
}


/* ============================================================
   PERSONAL STATS
   ============================================================ */

async function loadPersonalStats() {

  if (
    !currentUser ||
    !supabaseClient
  ) {

    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("rolls")
      .select(
        "roll,one_in,xp,badges,rarity,shown,blanks,created_at"
      )
      .eq(
        "player_id",
        currentUser.id
      )
      .order(
        "one_in",
        {
          ascending: false
        }
      );


  if (error) {

    console.warn(
      "Personal stats unavailable:",
      error
    );

    return;
  }


  const rows =
    data || [];


  const totalXP =
    rows.reduce(
      (
        sum,
        row
      ) =>
        sum +
        Number(
          row.xp || 0
        ),
      0
    );


  const best =
    rows.length
      ? rows[0]
      : null;


  if ($("profileRolls")) {

    $("profileRolls")
      .textContent =
      rows.length.toLocaleString();
  }


  if ($("profileXP")) {

    $("profileXP")
      .textContent =
      totalXP.toLocaleString();
  }


  if ($("profileBest")) {

    $("profileBest")
      .textContent =
      best
        ? best.roll
        : "—";
  }


  if ($("profileBestMeta")) {

    $("profileBestMeta")
      .textContent =
      best
        ? `${best.rarity} • ${fmt(best.one_in)}`
        : "No rolls yet";


    if (best) {

      applyRarityColor(
        $("profileBestMeta"),
        best.rarity
      );
    }
  }
}


/* ============================================================
   CHANGE USERNAME
   ============================================================ */

if ($("saveUsername")) {

  $("saveUsername").onclick =
    async () => {

      if (
        !currentUser ||
        !supabaseClient
      ) {

        toast(
          "You need to be logged in."
        );

        return;
      }


      const newUsername =
        $("usernameInput")
          .value
          .trim();


      if (!newUsername) {

        $("usernameStatus")
          .textContent =
          "Username cannot be empty.";

        return;
      }


      if (
        newUsername.length > 24
      ) {

        $("usernameStatus")
          .textContent =
          "Username must be 24 characters or less.";

        return;
      }


      $("saveUsername")
        .disabled = true;

      $("usernameStatus")
        .textContent =
        "Saving...";


      try {

        const {
          data,
          error
        } =
          await supabaseClient
            .from("profiles")
            .update({
              username:
                newUsername
            })
            .eq(
              "id",
              currentUser.id
            )
            .select()
            .single();


        if (error)
          throw error;


        profile = data;


        await supabaseClient.auth
          .updateUser({

            data: {
              username:
                newUsername
            }
          });


        updateAccountUI();


        await updateExistingRollNames(
          newUsername
        );


        $("usernameStatus")
          .textContent =
          "Username updated!";


        toast(
          "Username changed to " +
          newUsername
        );

      } catch (error) {

        console.error(
          error
        );

        $("usernameStatus")
          .textContent =
          error.message ||
          "Unable to change username.";
      }


      $("saveUsername")
        .disabled = false;
    };
}


async function updateExistingRollNames(
  newUsername
) {

  if (
    !currentUser ||
    !supabaseClient
  ) {

    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("rolls")
        .update({

          player_name:
            newUsername

        })
        .eq(
          "player_id",
          currentUser.id
        );


    if (error) {

      console.warn(
        "Could not update old roll names:",
        error
      );
    }

  } catch (error) {

    console.warn(
      error
    );
  }
}


/* ============================================================
   SAVE CLOUD ROLL
   ============================================================ */

async function saveCloudRoll(
  result
) {

  if (
    !currentUser ||
    !supabaseClient
  ) {

    return null;
  }


  const username =
    profile?.username ||
    currentUser
      .user_metadata
      ?.username ||
    "Player";


  const row = {

    roll:
      result.roll,

    rarity:
      result.rarity,

    one_in:
      result.oneIn,

    shown:
      result.shown,

    blanks:
      result.blanks,

    xp:
      result.xp,

    player_id:
      currentUser.id,

    player_name:
      username
  };


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("rolls")
        .insert(row)
        .select()
        .single();


    if (error) {

      console.error(
        "Cloud roll error:",
        error
      );

      toast(
        "Roll saved locally, but cloud save failed."
      );

      return null;
    }


    return data;

  } catch (error) {

    console.error(
      "Cloud roll exception:",
      error
    );

    return null;
  }
}


/* ============================================================
   LEADERBOARD
   ============================================================ */

async function loadLeaderboard() {

  if (
    !supabaseClient
  ) {

    if ($("globalRows")) {

      $("globalRows").innerHTML =
        '<span class="empty">Cloud leaderboard unavailable until Supabase is configured.</span>';
    }

    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("rolls")
      .select(
        "id,roll,rarity,one_in,shown,xp,player_id,player_name,created_at"
      )
      .order(
        "one_in",
        {
          ascending: false
        }
      )
      .limit(10);


  if (error) {

    console.error(
      "Leaderboard error:",
      error
    );


    if ($("globalRows")) {

      $("globalRows").innerHTML = `

        <span class="empty">
          Leaderboard unavailable:
          ${escapeHTML(error.message)}
        </span>

      `;
    }

    return;
  }


  const rows =
    data || [];


  if (!rows.length) {

    if ($("globalRows")) {

      $("globalRows").innerHTML =
        '<span class="empty">No global rolls yet.</span>';
    }


    if ($("todayBest")) {

      $("todayBest")
        .textContent =
        "—";
    }


    if ($("allBest")) {

      $("allBest")
        .textContent =
        "—";
    }


    return;
  }


  const best =
    rows[0];


  if ($("allBest")) {

    $("allBest")
      .textContent =
      best.roll;
  }


  if ($("allBestMeta")) {

    $("allBestMeta")
      .textContent =
      `${best.player_name || "Player"} • ${best.rarity} • ${fmt(best.one_in)}`;


    applyRarityColor(
      $("allBestMeta"),
      best.rarity
    );
  }


  const todayStart =
    new Date();

  todayStart.setHours(
    0,
    0,
    0,
    0
  );


  const todayRows =
    rows.filter(
      row =>
        row.created_at &&
        new Date(
          row.created_at
        ) >= todayStart
    );


  if (
    todayRows.length
  ) {

    const todayBest =
      todayRows[0];


    if ($("todayBest")) {

      $("todayBest")
        .textContent =
        todayBest.roll;
    }


    if ($("todayBestMeta")) {

      $("todayBestMeta")
        .textContent =
        `${todayBest.player_name || "Player"} • ${todayBest.rarity} • ${fmt(todayBest.one_in)}`;


      applyRarityColor(
        $("todayBestMeta"),
        todayBest.rarity
      );
    }

  } else {

    if ($("todayBest")) {

      $("todayBest")
        .textContent =
        "—";
    }


    if ($("todayBestMeta")) {

      $("todayBestMeta")
        .textContent =
        "No rolls today";
    }
  }


  if ($("globalRows")) {

    $("globalRows").innerHTML =
      rows
        .map(
          (
            row,
            index
          ) => `

            <div class="globalRow">

              <div class="rank">
                #${index + 1}
              </div>

              <div>

                <div class="globalPlayer">
                  ${escapeHTML(
                    row.player_name ||
                    "Player"
                  )}
                </div>

                <div class="small">
                  ${
                    row.created_at
                      ? escapeHTML(
                          new Date(
                            row.created_at
                          ).toLocaleString()
                        )
                      : ""
                  }
                </div>

              </div>

              <div class="globalRoll">
                ${escapeHTML(
                  row.roll
                )}
              </div>

              <div>

                <div
                  class="rarity ${rarityClass(
                    row.rarity
                  )}"
                >
                  ${escapeHTML(
                    row.rarity
                  )}
                </div>

                <div class="small">
                  ${fmt(
                    row.one_in
                  )}
                </div>

              </div>

            </div>

          `
        )
        .join("");
  }
}


/* ============================================================
   REALTIME
   ============================================================ */

function setupRealtime() {

  if (
    !supabaseClient
  ) {

    return;
  }


  if (
    realtimeChannel
  ) {

    try {

      supabaseClient
        .removeChannel(
          realtimeChannel
        );

    } catch (error) {

      console.warn(
        error
      );
    }
  }


  realtimeChannel =
    supabaseClient
      .channel(
        "digit-rolls-global"
      )


      .on(

        "postgres_changes",

        {
          event: "INSERT",
          schema: "public",
          table: "rolls"
        },

        payload => {

          console.log(
            "Realtime new roll:",
            payload.new
          );

          toast(
            "🌎 New global roll!"
          );

          loadLeaderboard();

          if (
            currentUser
          ) {

            loadPersonalStats();
          }
        }
      )


      .on(

        "postgres_changes",

        {
          event: "UPDATE",
          schema: "public",
          table: "profiles"
        },

        payload => {

          if (
            currentUser &&
            payload.new &&
            payload.new.id ===
              currentUser.id
          ) {

            profile =
              payload.new;

            updateAccountUI();
          }
        }
      )


      .subscribe(
        status => {

          console.log(
            "Realtime status:",
            status
          );


          const dot =
            $("realtimeDot");

          const text =
            $("realtimeText");


          if (
            status ===
            "SUBSCRIBED"
          ) {

            dot?.classList
              .add("on");

            dot?.classList
              .remove("off");

            if (text) {

              text.textContent =
                "Realtime Online";
            }

          } else {

            dot?.classList
              .remove("on");

            dot?.classList
              .add("off");

            if (text) {

              text.textContent =
                "Realtime Offline";
            }
          }
        }
      );
}


/* ============================================================
   ROLL DISPLAY
   ============================================================ */

async function performRoll() {

  if (rolling)
    return;


  rolling = true;


  if ($("rollBtn")) {

    $("rollBtn")
      .disabled = true;
  }


  if ($("rollLabel")) {

    $("rollLabel")
      .textContent =
      "ROLLING...";
  }


  if ($("rarity")) {

    $("rarity")
      .textContent =
      "—";
  }


  if ($("chance")) {

    $("chance")
      .textContent =
      "—";
  }


  if ($("liveRarity")) {

    $("liveRarity")
      .textContent =
      "RARITY: ???";
  }


  if ($("shown")) {

    $("shown")
      .textContent =
      "—";
  }


  if ($("xp")) {

    $("xp")
      .textContent =
      "—";
  }


  if ($("blankBonus")) {

    $("blankBonus")
      .textContent =
      "—";
  }


  if ($("badges")) {

    $("badges").innerHTML =
      '<span class="empty">Generating your 6-digit roll...</span>';
  }


  $("number")
    ?.classList
    .add("rolling");


  applyRarityColor(
    $("liveRarity"),
    "COMMON"
  );

  applyRarityColor(
    $("rarity"),
    "COMMON"
  );

  applyRarityColor(
    $("number"),
    "COMMON"
  );


  const finalChars =
    randomRoll();


  const visible =
    Array(6).fill("?");


  let index = 0;


  await new Promise(
    resolve => {

      const timer =
        setInterval(
          () => {

            visible[index] =
              finalChars[index];


            if ($("number")) {

              $("number")
                .textContent =
                visible.join("");
            }


            index++;


            if (
              index >= 6
            ) {

              clearInterval(
                timer
              );

              resolve();
            }

          },
          500
        );
    }
  );


  $("number")
    ?.classList
    .remove("rolling");


  const analysis =
    analyze(
      finalChars
    );


  const roll =
    finalChars.join("");


  const result = {

    roll,

    ...analysis,

    time:
      Date.now()
  };


  /* ==========================================================
     BADGE REVEAL
     ========================================================== */

  const badges =
    analysis.badges;


  if ($("rollLabel")) {

    $("rollLabel")
      .textContent =
      badges.length
        ? "ANALYZING BADGES..."
        : "NO BADGES FOUND...";
  }


  if ($("liveRarity")) {

    $("liveRarity")
      .textContent =
      "RARITY: ???";
  }


  const focusMs =
    badges.length
      ? Math.max(
          700,
          Math.min(
            2500,
            Math.round(
              3500 /
              badges.length
            )
          )
        )
      : 1200;


  let badgeIndex = 0;


  await new Promise(
    resolve => {

      const reveal =
        () => {

          if (
            badgeIndex <
            badges.length
          ) {

            const badge =
              badges[
                badgeIndex
              ];


            if ($("badges")) {

              $("badges").innerHTML = `

                <button
                  class="badgeFocus"
                  type="button"
                  data-badge-index="${badgeIndex}"
                >

                  <div
                    style="
                      font-size:27px;
                      font-weight:850;
                      margin-bottom:7px;
                    "
                  >
                    ${escapeHTML(
                      badge.name
                    )}
                  </div>

                  <div
                    style="
                      color:#aab5ca;
                      line-height:1.45;
                    "
                  >
                    ${escapeHTML(
                      badge.explanation
                    )}
                  </div>

                  <div
                    class="rarity ${rarityClass(
                      badge.badgeRarity
                    )}"
                    style="
                      display:inline-block;
                      margin-top:10px;
                    "
                  >
                    ${escapeHTML(
                      badge.badgeRarity
                    )}
                  </div>

                  <div
                    class="small"
                    style="margin-top:7px;"
                  >
                    Badge
                    ${badgeIndex + 1}
                    of
                    ${badges.length}
                  </div>

                  <div
                    class="small"
                    style="margin-top:4px;"
                  >
                    Click to view this badge again
                  </div>

                </button>

              `;


              const button =
                $("badges")
                  .querySelector(
                    ".badgeFocus"
                  );


              if (button) {

                button.onclick =
                  () => {

                    showBadgeInfo(

                      badge.name,

                      badge.explanation,

                      badge.badgeRarity
                    );
                  };
              }
            }


            badgeIndex++;


            setTimeout(
              reveal,
              focusMs
            );

          } else {

            resolve();
          }
        };


      setTimeout(
        reveal,
        300
      );
    }
  );


  /* ==========================================================
     FINAL RESULT
     ========================================================== */

  if ($("rollLabel")) {

    $("rollLabel")
      .textContent =
      "FINAL RESULT";
  }


  if ($("liveRarity")) {

    $("liveRarity")
      .textContent =
      "RARITY: " +
      analysis.rarity;
  }


  if ($("rarity")) {

    $("rarity")
      .textContent =
      analysis.rarity;
  }


  if ($("chance")) {

    $("chance")
      .textContent =
      fmt(
        analysis.oneIn
      );
  }


  if ($("shown")) {

    $("shown")
      .textContent =
      analysis.shown +
      "/6";
  }


  if ($("blankBonus")) {

    $("blankBonus")
      .textContent =
      "×" +
      analysis.blankMultiplier
        .toLocaleString();
  }


  if ($("xp")) {

    $("xp")
      .textContent =
      "+" +
      analysis.xp;
  }


  applyRarityColor(
    $("liveRarity"),
    analysis.rarity
  );

  applyRarityColor(
    $("rarity"),
    analysis.rarity
  );

  applyRarityColor(
    $("number"),
    analysis.rarity
  );


  /* ==========================================================
     FINAL BADGE LIST
     ========================================================== */

  if ($("badges")) {

    if (!badges.length) {

      $("badges").innerHTML =
        '<span class="empty">No badges. A completely ordinary roll.</span>';

    } else {

      $("badges").innerHTML =
        badges
          .map(
            (
              badge,
              badgeIndex
            ) => `

              <button
                class="badge badgeButton"
                type="button"
                data-badge-index="${badgeIndex}"
              >

                <span>
                  ${escapeHTML(
                    badge.name
                  )}
                </span>

                <span
                  class="rarity ${rarityClass(
                    badge.badgeRarity
                  )}"
                  style="
                    margin-left:7px;
                    font-size:11px;
                  "
                >
                  ${escapeHTML(
                    badge.badgeRarity
                  )}
                </span>

              </button>

            `
          )
          .join("");


      const buttons =
        $("badges")
          .querySelectorAll(
            ".badgeButton"
          );


      buttons.forEach(
        button => {

          const badge =
            badges[
              Number(
                button.dataset
                  .badgeIndex
              )
            ];


          button.onclick =
            () => {

              showBadgeInfo(

                badge.name,

                badge.explanation,

                badge.badgeRarity
              );
            };
        }
      );
    }
  }


  /* ==========================================================
     LOCAL HISTORY
     ========================================================== */

  history.unshift(
    result
  );

  history =
    history.slice(
      0,
      30
    );


  if (
    better(
      result,
      personalBest
    )
  ) {

    personalBest =
      result;
  }


  if (
    better(
      result,
      allTimeBest
    )
  ) {

    allTimeBest =
      result;
  }


  saveLocal();

  renderHistory();


  /* ==========================================================
     CLOUD
     ========================================================== */

  if (
    currentUser &&
    supabaseClient
  ) {

    await saveCloudRoll(
      result
    );

    await loadPersonalStats();

    await loadLeaderboard();
  }


  if ($("rollBtn")) {

    $("rollBtn")
      .disabled = false;
  }


  rolling = false;
}


/* ============================================================
   ROLL BUTTON
   ============================================================ */

if ($("rollBtn")) {

  $("rollBtn").onclick =
    performRoll;
}


/* ============================================================
   PROFILE BUTTON
   ============================================================ */

if ($("profileButton")) {

  $("profileButton").onclick =
    () => {

      $("profileSection")
        ?.scrollIntoView({

          behavior: "smooth",

          block: "center"
        });
    };
}


/* ============================================================
   LOGOUT
   ============================================================ */

if ($("logoutButton")) {

  $("logoutButton").onclick =
    async () => {

      if (
        !supabaseClient
      ) {

        currentUser = null;

        profile = null;

        updateAccountUI();

        return;
      }


      try {

        await supabaseClient
          .auth
          .signOut();

      } catch (error) {

        console.error(
          error
        );
      }
    };
}


/* ============================================================
   REFRESH LEADERBOARD
   ============================================================ */

if ($("refreshLeaderboard")) {

  $("refreshLeaderboard").onclick =
    async () => {

      $("refreshLeaderboard")
        .disabled = true;


      await loadLeaderboard();


      $("refreshLeaderboard")
        .disabled = false;


      toast(
        "Leaderboard refreshed."
      );
    };
}


/* ============================================================
   AUTH STATE
   ============================================================ */

if (
  supabaseClient
) {

  supabaseClient.auth
    .onAuthStateChange(
      (
        event,
        session
      ) => {

        console.log(
          "Auth state:",
          event
        );


        if (
          session?.user
        ) {

          currentUser =
            session.user;


          /*
           * Do database work after the
           * auth event has finished.
           */

          setTimeout(
            async () => {

              await ensureProfile(
                currentUser
              );

              updateAccountUI();

              await loadPersonalStats();

              await loadLeaderboard();

            },
            0
          );

        } else {

          currentUser =
            null;

          profile =
            null;

          updateAccountUI();
        }
      }
    );
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {

  loadLocal();

  updateAccountUI();


  /*
   * If Supabase isn't configured,
   * the actual game still works locally.
   */

  if (
    !supabaseClient
  ) {

    console.warn(
      "Supabase is not configured. Local mode enabled."
    );

    if ($("realtimeDot")) {

      $("realtimeDot")
        .classList
        .remove("on");

      $("realtimeDot")
        .classList
        .add("off");
    }


    if ($("realtimeText")) {

      $("realtimeText")
        .textContent =
        "Local Mode";
    }


    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getSession();


    if (error) {

      console.warn(
        "Session error:",
        error
      );
    }


    if (
      data?.session?.user
    ) {

      currentUser =
        data.session.user;


      await ensureProfile(
        currentUser
      );


      updateAccountUI();


      await loadPersonalStats();
    }

  } catch (error) {

    console.warn(
      "Initial auth check failed:",
      error
    );
  }


  await loadLeaderboard();

  setupRealtime();
}


/* ============================================================
   START
   ============================================================ */

init();
```
