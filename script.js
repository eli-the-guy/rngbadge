/* ============================================================
   DIGIT ROLL — PART 1/2
   6-DIGIT CORE + ADVANCED PATTERN DETECTOR
   ============================================================ */

/* ============================================================
   SUPABASE
   ============================================================ */

const SUPABASE_URL =
  "https://xuofbnghqcktlsmjgfbj.supabase.co";

const SUPABASE_ANON_KEY =
  "YOUR_SUPABASE_ANON_KEY";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* ============================================================
   REFERENCES
   ============================================================ */

const references = {

  "911": {
    name: "🚨 Emergency 911",
    explanation:
      "The famous emergency telephone number.",
    rarity: "Legendary",
    score: 85
  },

  "007": {
    name: "🕵️ Agent 007",
    explanation:
      "The iconic code name of James Bond.",
    rarity: "Epic",
    score: 65
  },

  "420": {
    name: "🌿 420",
    explanation:
      "A famous number from popular culture.",
    rarity: "Rare",
    score: 40
  },

  "404": {
    name: "🌐 404 Not Found",
    explanation:
      "The familiar web error code.",
    rarity: "Rare",
    score: 45
  },

  "1337": {
    name: "💻 LEET",
    explanation:
      "Classic internet and gaming slang for 'leet'.",
    rarity: "Epic",
    score: 70
  },

  "666": {
    name: "😈 The Number",
    explanation:
      "A famously recognizable number with cultural significance.",
    rarity: "Legendary",
    score: 90
  },

  "777": {
    name: "🎰 Lucky 7s",
    explanation:
      "Three 7s are a classic lucky-slot-machine pattern.",
    rarity: "Legendary",
    score: 95
  },

  "42": {
    name: "🌌 The Answer",
    explanation:
      "The famously celebrated answer to life, the universe, and everything.",
    rarity: "Rare",
    score: 35
  },

  "101": {
    name: "📚 101",
    explanation:
      "A common shorthand for an introductory course or beginner's guide.",
    rarity: "Uncommon",
    score: 20
  },

  "123": {
    name: "🔢 Counting Up",
    explanation:
      "The first three digits of the familiar counting sequence.",
    rarity: "Uncommon",
    score: 18
  },

  "321": {
    name: "🚀 Countdown",
    explanation:
      "A classic countdown fragment.",
    rarity: "Uncommon",
    score: 18
  },

  "314": {
    name: "🥧 Pi",
    explanation:
      "The first three digits of pi.",
    rarity: "Rare",
    score: 30
  },

  "1984": {
    name: "📖 1984",
    explanation:
      "A recognizable reference to George Orwell's novel.",
    rarity: "Epic",
    score: 65
  },

  "2001": {
    name: "🚀 2001",
    explanation:
      "A recognizable science-fiction reference.",
    rarity: "Epic",
    score: 65
  },

  "69": {
    name: "😎 Nice",
    explanation:
      "A widely recognized internet-number joke/reference.",
    rarity: "Uncommon",
    score: 15
  },

  "67": {
    name: "🔢 67",
    explanation:
      "A special 67 reference hidden inside the roll.",
    rarity: "Uncommon",
    score: 15
  },

  "55": {
    name: "⚔️ 55 — Kingsammelot",
    explanation:
      "A Kingsammelot reference.",
    rarity: "Uncommon",
    score: 15
  }

};


/* ============================================================
   PERIODIC TABLE — FIRST 9 ELEMENTS
   ============================================================ */

const elements = {

  "1": {
    symbol: "H",
    name: "Hydrogen",
    rarity: "Common",
    score: 2
  },

  "2": {
    symbol: "He",
    name: "Helium",
    rarity: "Common",
    score: 2
  },

  "3": {
    symbol: "Li",
    name: "Lithium",
    rarity: "Uncommon",
    score: 4
  },

  "4": {
    symbol: "Be",
    name: "Beryllium",
    rarity: "Rare",
    score: 7
  },

  "5": {
    symbol: "B",
    name: "Boron",
    rarity: "Rare",
    score: 7
  },

  "6": {
    symbol: "C",
    name: "Carbon",
    rarity: "Uncommon",
    score: 4
  },

  "7": {
    symbol: "N",
    name: "Nitrogen",
    rarity: "Common",
    score: 2
  },

  "8": {
    symbol: "O",
    name: "Oxygen",
    rarity: "Common",
    score: 2
  },

  "9": {
    symbol: "F",
    name: "Fluorine",
    rarity: "Uncommon",
    score: 4
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


/* ============================================================
   TOAST
   ============================================================ */

function toast(message) {

  const element = $("toast");

  if (!element) return;

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {
      element.classList.remove("show");
    }, 3000);

}


/* ============================================================
   FORMAT
   ============================================================ */

function fmt(n) {

  const value = Number(n);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return "1 in " +
    Math.max(1, Math.round(value))
      .toLocaleString();

}


function meta(x) {

  if (!x) {
    return "No rolls yet";
  }

  return (
    `${x.rarity} • ${fmt(x.oneIn)} • ` +
    `${x.shown}/6 digits`
  );

}


function better(a, b) {

  return (
    !b ||
    Number(a.score || 0) >
    Number(b.score || 0)
  );

}


/* ============================================================
   RARITY
   ============================================================ */

const RARITIES = [
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


function rarityClass(rarity) {

  const classes = {

    COMMON:
      "rarity-common",

    UNCOMMON:
      "rarity-uncommon",

    RARE:
      "rarity-rare",

    EPIC:
      "rarity-epic",

    LEGENDARY:
      "rarity-legendary",

    MYTHIC:
      "rarity-mythic",

    DIVINE:
      "rarity-divine",

    TRANSCENDENT:
      "rarity-transcendent",

    "???":
      "rarity-unknown"

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
   BADGE RARITY COLORS
   ============================================================ */

function badgeRarityClass(rarity) {

  const map = {

    Common:
      "badge-common",

    Uncommon:
      "badge-uncommon",

    Rare:
      "badge-rare",

    Epic:
      "badge-epic",

    Legendary:
      "badge-legendary",

    Mythic:
      "badge-mythic",

    Divine:
      "badge-divine",

    Transcendent:
      "badge-transcendent"

  };

  return (
    map[rarity] ||
    "badge-common"
  );

}


/* ============================================================
   BADGE OBJECT
   ============================================================ */

function makeBadge(
  name,
  explanation,
  rarity,
  score
) {

  return {

    name,

    explanation,

    rarity,

    score: Number(score) || 0

  };

}


/* ============================================================
   RANDOM 6-DIGIT ROLL
   ============================================================ */

function randomRoll() {

  const chars = [];

  let blanks = 0;

  for (
    let i = 0;
    i < 6;
    i++
  ) {

    /*
     * Blank chance remains fairly low.
     */

    if (
      Math.random() < 0.055
    ) {

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
   * Never allow all six positions
   * to become blank.
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
   PERIODIC TABLE BADGES
   ============================================================ */

function detectElementBadges(
  digits,
  badges
) {

  const found = new Set();

  for (const digit of digits) {

    if (
      elements[digit] &&
      !found.has(digit)
    ) {

      found.add(digit);

      const element =
        elements[digit];

      badges.push(
        makeBadge(

          `🧪 ${element.name} (${element.symbol})`,

          `The roll contains at least one ${digit}, the atomic number of ${element.name}.`,

          element.rarity,

          element.score

        )
      );

    }

  }

}


/* ============================================================
   ADVANCED PATTERN ANALYSIS
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
     REFERENCES
     ========================================================== */

  for (
    const [key, data]
    of Object.entries(references)
  ) {

    if (
      compact.includes(key)
    ) {

      badges.push(
        makeBadge(
          data.name,
          data.explanation,
          data.rarity,
          data.score
        )
      );

    }

  }


  /* ==========================================================
     ELEMENTS
     ========================================================== */

  detectElementBadges(
    digits,
    badges
  );


  /* ==========================================================
     DIGIT COUNTS
     ========================================================== */

  const counts = {};

  for (const digit of digits) {

    counts[digit] =
      (counts[digit] || 0) + 1;

  }

  const maxCount =
    Math.max(
      0,
      ...Object.values(counts)
    );


  /* ==========================================================
     REPEATER
     ========================================================== */

  if (maxCount >= 2) {

    badges.push(
      makeBadge(
        "🔁 Repeater",
        "At least one visible digit appears more than once.",
        "Common",
        4
      )
    );

  }


  /* ==========================================================
     DOUBLE
     ========================================================== */

  if (
    /00|11|22|33|44|55|66|77|88|99/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "👯 Double",
        "Two identical digits appear directly beside each other.",
        "Uncommon",
        10
      )
    );

  }


  /* ==========================================================
     TRIPLE
     ========================================================== */

  if (
    /000|111|222|333|444|555|666|777|888|999/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "🔥 Triple Stack",
        "Three identical digits appear consecutively.",
        "Rare",
        30
      )
    );

  }


  /* ==========================================================
     QUAD
     ========================================================== */

  if (
    /0000|1111|2222|3333|4444|5555|6666|7777|8888|9999/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "💥 Quad Stack",
        "Four identical digits appear consecutively.",
        "Epic",
        55
      )
    );

  }


  /* ==========================================================
     QUINT
     ========================================================== */

  if (
    /00000|11111|22222|33333|44444|55555|66666|77777|88888|99999/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "☢️ Quint Stack",
        "Five identical digits appear consecutively.",
        "Legendary",
        80
      )
    );

  }


  /* ==========================================================
     SIX OF A KIND
     ========================================================== */

  if (
    digits.length === 6 &&
    new Set(digits).size === 1
  ) {

    badges.push(
      makeBadge(
        "👑 Monochrome",
        "All six digits are identical.",
        "Mythic",
        100
      )
    );

  }


  /* ==========================================================
     ALL SIX UNIQUE
     ========================================================== */

  if (
    digits.length === 6 &&
    new Set(digits).size === 6
  ) {

    badges.push(
      makeBadge(
        "🌈 Six Unique",
        "All six visible digits are different.",
        "Rare",
        25
      )
    );

  }


  /* ==========================================================
     RISING SEQUENCES
     ========================================================== */

  if (
    /012|123|234|345|456|567|678|789/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "📈 Rising Sequence",
        "Three consecutive digits appear in ascending order.",
        "Uncommon",
        10
      )
    );

  }


  if (
    /0123|1234|2345|3456|4567|5678|6789/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "🪜 Staircase",
        "Four consecutive digits climb steadily upward.",
        "Rare",
        30
      )
    );

  }


  if (
    /01234|12345|23456|34567|45678|56789/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "🚀 Mega Staircase",
        "Five consecutive digits rise steadily upward.",
        "Epic",
        55
      )
    );

  }


  /* ==========================================================
     FALLING SEQUENCES
     ========================================================== */

  if (
    /987|876|765|654|543|432|321|210/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "📉 Falling Sequence",
        "Three consecutive digits appear in descending order.",
        "Uncommon",
        10
      )
    );

  }


  if (
    /9876|8765|7654|6543|5432|4321|3210/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "🪜 Reverse Staircase",
        "Four consecutive digits descend steadily.",
        "Rare",
        30
      )
    );

  }


  if (
    /98765|87654|76543|65432|54321|43210/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "🚀 Mega Reverse Staircase",
        "Five consecutive digits fall steadily downward.",
        "Epic",
        55
      )
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
    "78987"

  ];

  if (
    mountainPatterns.some(
      x => compact.includes(x)
    )
  ) {

    badges.push(
      makeBadge(
        "⛰️ Mountain",
        "Numbers rise to a peak in order, then fall back down.",
        "Epic",
        45
      )
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
    "98789"

  ];

  if (
    valleyPatterns.some(
      x => compact.includes(x)
    )
  ) {

    badges.push(
      makeBadge(
        "🏞️ Valley",
        "Numbers fall to a low point in order, then rise again.",
        "Epic",
        45
      )
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
    "898"

  ];

  if (
    wavePatterns.some(
      x => compact.includes(x)
    )
  ) {

    badges.push(
      makeBadge(
        "🌊 Wave",
        "The digits repeatedly rise and fall, creating a wave-like pattern.",
        "Rare",
        25
      )
    );

  }


  /* ==========================================================
     ALTERNATOR
     ========================================================== */

  if (
    /0101|1212|2323|3434|4545|5656|6767|7878|8989/
      .test(compact)
  ) {

    badges.push(
      makeBadge(
        "⚡ Alternator",
        "Two digits repeatedly alternate back and forth.",
        "Epic",
        45
      )
    );

  }


  /* ==========================================================
     MIRROR
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

      const reversed =
        part
          .split("")
          .reverse()
          .join("");

      if (
        part === reversed
      ) {

        badges.push(
          makeBadge(
            "🪞 Mirror",
            "A sequence reads the same forward and backward.",
            len >= 5
              ? "Epic"
              : "Rare",
            len >= 5
              ? 50
              : 25
          )
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
    digits.length === 6 &&
    compact ===
      compact
        .split("")
        .reverse()
        .join("")
  ) {

    badges.push(
      makeBadge(
        "🪞 Perfect Mirror",
        "The entire six-digit roll reads identically forward and backward.",
        "Legendary",
        75
      )
    );

  }


  /* ==========================================================
     SIX-DIGIT LOOPS
     ========================================================== */

  const loopPatterns = [

    "012345",
    "123450",
    "234501",
    "345012",
    "450123",
    "501234",

    "543210",
    "432105",
    "321054",
    "210543",
    "105432",
    "054321"

  ];

  if (
    loopPatterns.includes(
      compact
    )
  ) {

    badges.push(
      makeBadge(
        "🔄 Digit Loop",
        "The six visible digits follow a continuous numeric cycle.",
        "Legendary",
        80
      )
    );

  }


  /* ==========================================================
     PYRAMID
     ========================================================== */

  const pyramidPatterns = [

    "12321",
    "23432",
    "34543",
    "45654",
    "56765",

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
    pyramidPatterns.some(
      x => compact.includes(x)
    )
  ) {

    badges.push(
      makeBadge(
        "🔺 Pyramid",
        "Digits expand toward a center and then contract.",
        "Epic",
        50
      )
    );

  }


  /* ==========================================================
     ARITHMETIC PATTERN
     ========================================================== */

  if (
    digits.length >= 4
  ) {

    const nums =
      digits.map(Number);

    const diffs = [];

    for (
      let i = 1;
      i < nums.length;
      i++
    ) {

      diffs.push(
        nums[i] - nums[i - 1]
      );

    }

    if (
      diffs.length >= 3 &&
      diffs.every(
        d => d === diffs[0]
      ) &&
      diffs[0] !== 0
    ) {

      badges.push(
        makeBadge(
          "📐 Arithmetic Pattern",
          "The visible digits change by the same amount each step.",
          "Epic",
          45
        )
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
        d => Number(d) % 2
      );

    if (
      parity.every(
        x => x === parity[0]
      )
    ) {

      badges.push(
        makeBadge(
          "⚫⚪ Parity Chain",
          "Every visible digit has the same odd/even parity.",
          "Uncommon",
          8
        )
      );

    }

  }


  /* ==========================================================
     SORT BADGES
     ========================================================== */

  badges.sort(
    (a, b) =>
      b.score - a.score
  );


  /* ==========================================================
     REMOVE DUPLICATES
     ========================================================== */

  const unique = [];

  const seen =
    new Set();

  for (
    const badge of badges
  ) {

    const key =
      badge.name;

    if (
      !seen.has(key)
    ) {

      seen.add(key);

      unique.push(
        badge
      );

    }

  }


  /* ==========================================================
     SANER RARITY SCORE
     ========================================================== */

  let score = 0;

  for (
    let i = 0;
    i < unique.length;
    i++
  ) {

    const badge =
      unique[i];

    /*
     * Strongest badge gets full value.
     *
     * Every additional badge has
     * progressively less influence.
     */

    const multiplier =
      Math.pow(
        0.55,
        i
      );

    score +=
      badge.score *
      multiplier;

  }


  /* ==========================================================
     BLANK BONUS
     ========================================================== */

  const blanks =
    chars.filter(
      x => x === "_"
    ).length;

  /*
   * Blanks are rare, but their bonus
   * is deliberately capped.
   */

  const blankBonus =
    blanks * 8;

  score += blankBonus;


  /* ==========================================================
     NO-BADGE ROLLS
     ========================================================== */

  if (
    unique.length === 0 &&
    blanks === 0
  ) {

    score = 0;

  }


  /* ==========================================================
     FINAL RARITY
     ========================================================== */

  let rarity = "COMMON";

  if (score >= 8)
    rarity = "UNCOMMON";

  if (score >= 20)
    rarity = "RARE";

  if (score >= 40)
    rarity = "EPIC";

  if (score >= 65)
    rarity = "LEGENDARY";

  if (score >= 95)
    rarity = "MYTHIC";

  if (score >= 135)
    rarity = "DIVINE";

  if (score >= 180)
    rarity = "TRANSCENDENT";

  if (score >= 240)
    rarity = "???";


  /* ==========================================================
     ESTIMATED ODDS
     ========================================================== */

  /*
   * This is intentionally an estimate rather than
   * multiplying every badge probability together.
   */

  let oneIn;

  if (score <= 0) {

    oneIn = 1;

  } else {

    oneIn =
      Math.max(
        1,
        Math.round(
          Math.pow(
            10,
            score / 18
          )
        )
      );

  }


  /* ==========================================================
     XP
     ========================================================== */

  const badgeXP =
    unique.reduce(
      (sum, badge) =>
        sum +
        Math.max(
          1,
          Math.round(
            badge.score * 0.75
          )
        ),
      0
    );

  const blankXP =
    blanks * 20;

  const rarityXP =
    Math.max(
      0,
      Math.floor(
        score * 0.35
      )
    );

  const xp =
    Math.max(
      5,
      badgeXP +
      blankXP +
      rarityXP
    );


  /* ==========================================================
     RESULT
     ========================================================== */

  return {

    badges: unique,

    score,

    oneIn,

    rarity,

    shown: digits.length,

    blanks,

    blankMultiplier:
      1 + blanks * 0.5,

    xp

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

  if (count) {

    count.textContent =
      history.length +
      (
        history.length === 1
          ? " roll"
          : " rolls"
      );

  }


  const historyElement =
    $("history");

  if (!historyElement)
    return;


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
              class="rarity ${rarityClass(x.rarity)}"
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
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ============================================================
   BADGE INFO
   ============================================================ */

function showBadgeInfo(
  name,
  explanation,
  rarity
) {

  if ($("badgeModalName")) {

    $("badgeModalName").textContent =
      name;

  }

  if ($("badgeModalExplanation")) {

    $("badgeModalExplanation")
      .textContent =
      explanation;

  }

  if ($("badgeModalChance")) {

    $("badgeModalChance").textContent =
      "Badge rarity: " +
      rarity;

  }

  if ($("badgeModal")) {

    $("badgeModal")
      .classList
      .add("open");

  }

}


function closeBadgeInfo() {

  if ($("badgeModal")) {

    $("badgeModal")
      .classList
      .remove("open");

  }

}


window.showBadgeInfo =
  showBadgeInfo;

window.closeBadgeInfo =
  closeBadgeInfo;


/* ============================================================
   AUTH MODAL
   ============================================================ */

let authMode = "login";


function openAuth() {

  if ($("authModal")) {

    $("authModal")
      .classList
      .add("open");

  }

}


function closeAuth() {

  if ($("authModal")) {

    $("authModal")
      .classList
      .remove("open");

  }

}


window.closeAuth =
  closeAuth;


if ($("loginTab")) {

  $("loginTab").onclick = () => {

    authMode = "login";

    $("loginTab")
      .classList
      .add("active");

    $("signupTab")
      .classList
      .remove("active");

    $("authTitle")
      .textContent =
      "🔐 Login";

    $("authSubmit")
      .textContent =
      "Login";

    $("authUsername")
      .style.display =
      "none";

    $("authStatus")
      .textContent = "";

  };

}


if ($("signupTab")) {

  $("signupTab").onclick = () => {

    authMode = "signup";

    $("signupTab")
      .classList
      .add("active");

    $("loginTab")
      .classList
      .remove("active");

    $("authTitle")
      .textContent =
      "✨ Create Account";

    $("authSubmit")
      .textContent =
      "Create Account";

    $("authUsername")
      .style.display =
      "block";

    $("authStatus")
      .textContent = "";

  };

}


if ($("authButton")) {

  $("authButton").onclick =
    openAuth;

}


/* ============================================================
   FRIENDLY AUTH ERRORS
   ============================================================ */

function friendlyAuthError(
  error
) {

  const msg =
    String(
      error?.message ||
      error ||
      ""
    );

  const lower =
    msg.toLowerCase();


  if (
    lower.includes(
      "email not confirmed"
    )
  ) {

    return (
      "Your email is not confirmed yet. " +
      "Check your email, then try logging in again."
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
      "That email already has an account. " +
      "Try logging in."
    );

  }


  if (
    lower.includes(
      "invalid api key"
    )
  ) {

    return (
      "Supabase configuration error: " +
      "check your public anon/publishable key."
    );

  }


  return msg ||
    "Authentication failed.";

}


/* ============================================================
   PROFILE
   ============================================================ */

async function ensureProfile(
  user,
  suppliedUsername = ""
) {

  if (!user)
    return null;


  const username =
    suppliedUsername ||
    user.user_metadata?.username ||
    "Player";


  try {

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

      return null;

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

      return null;

    }


    profile = created;

    return created;

  } catch (error) {

    console.warn(
      "Profile exception:",
      error
    );

    return null;

  }

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

      $("userPill")
        .textContent =
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
        currentUser.email ||
        "";

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
   END OF PART 1/2
   ============================================================ */

/*
 * PART 2 continues with:
 *
 * - Login / signup submission
 * - Username changing
 * - Personal stats
 * - Cloud roll saving
 * - Leaderboard
 * - Realtime
 * - Roll animation
 * - Final badge rendering
 * - Buttons
 * - Initialization
 */
```javascript
/* ============================================================
   ROLL DISPLAY
   ============================================================ */

async function performRoll() {
  if (rolling) return;

  rolling = true;
  $("rollBtn").disabled = true;
  $("rollLabel").textContent = "ROLLING...";

  $("rarity").textContent = "—";
  $("chance").textContent = "—";
  $("liveRarity").textContent = "RARITY: ???";
  $("shown").textContent = "—";
  $("xp").textContent = "—";
  $("blankBonus").textContent = "—";

  $("badges").innerHTML =
    '<span class="empty">Generating your 6-digit roll...</span>';

  $("number").classList.add("rolling");

  applyRarityColor($("liveRarity"), "COMMON");
  applyRarityColor($("rarity"), "COMMON");
  applyRarityColor($("number"), "COMMON");

  const finalChars = randomRoll();

  const visible = Array(6).fill("?");

  let i = 0;

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      visible[i] = finalChars[i];

      $("number").textContent = visible.join("");

      i++;

      if (i >= 6) {
        clearInterval(timer);
        resolve();
      }
    }, 650);
  });

  $("number").classList.remove("rolling");

  const analysis = analyze(finalChars);
  const roll = finalChars.join("");

  const result = {
    roll,
    ...analysis,
    time: Date.now(),
  };

  /* ============================================================
     BADGE REVEAL
     ============================================================ */

  const badges = analysis.badges;

  $("rollLabel").textContent = badges.length
    ? "ANALYZING BADGES..."
    : "NO BADGES FOUND...";

  $("liveRarity").textContent = "RARITY: ???";

  const focusMs = badges.length
    ? Math.max(
        900,
        Math.min(3500, Math.round(5000 / badges.length))
      )
    : 2000;

  let bIndex = 0;

  await new Promise((resolve) => {
    const revealBadge = () => {
      if (bIndex < badges.length) {
        const b = badges[bIndex];

        $("badges").innerHTML = `
          <button
            class="badgeFocus"
            type="button"
            onclick='showBadgeInfo(
              ${JSON.stringify(b.name)},
              ${JSON.stringify(b.explanation)},
              ${JSON.stringify(b.badgeRarity)}
            )'
          >
            <div
              style="
                font-size:27px;
                font-weight:850;
                margin-bottom:7px
              "
            >
              ${escapeHTML(b.name)}
            </div>

            <div
              style="
                color:#aab5ca;
                line-height:1.45
              "
            >
              ${escapeHTML(b.explanation)}
            </div>

            <div
              class="rarity ${rarityClass(b.badgeRarity)}"
              style="
                display:inline-block;
                margin-top:10px;
              "
            >
              ${escapeHTML(b.badgeRarity)}
            </div>

            <div
              class="small"
              style="margin-top:7px"
            >
              ${bIndex + 1} of ${badges.length}
            </div>

            <div
              class="small"
              style="margin-top:4px"
            >
              Click to view this badge again
            </div>
          </button>
        `;

        bIndex++;

        setTimeout(revealBadge, focusMs);
      } else {
        resolve();
      }
    };

    setTimeout(revealBadge, 400);
  });

  /* ============================================================
     FINAL RESULT
     ============================================================ */

  $("rollLabel").textContent = "FINAL RESULT";

  $("liveRarity").textContent =
    "RARITY: " + analysis.rarity;

  $("rarity").textContent = analysis.rarity;

  $("chance").textContent = fmt(analysis.oneIn);

  $("shown").textContent =
    analysis.shown + "/6";

  $("blankBonus").textContent =
    "×" + analysis.blankMultiplier.toLocaleString();

  $("xp").textContent =
    "+" + analysis.xp;

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

  /* ============================================================
     FINAL BADGES
     ============================================================ */

  if (!badges.length) {
    $("badges").innerHTML =
      '<span class="empty">No badges. A completely ordinary roll.</span>';
  } else {
    $("badges").innerHTML = badges
      .map(
        (b) => `
          <button
            class="badge badgeButton"
            type="button"
            onclick='showBadgeInfo(
              ${JSON.stringify(b.name)},
              ${JSON.stringify(b.explanation)},
              ${JSON.stringify(b.badgeRarity)}
            )'
          >
            <span>${escapeHTML(b.name)}</span>

            <span
              class="rarity ${rarityClass(b.badgeRarity)}"
              style="
                margin-left:7px;
                font-size:11px;
              "
            >
              ${escapeHTML(b.badgeRarity)}
            </span>
          </button>
        `
      )
      .join("");
  }

  /* ============================================================
     LOCAL HISTORY
     ============================================================ */

  history.unshift(result);

  history = history.slice(0, 30);

  if (better(result, personalBest)) {
    personalBest = result;
  }

  if (better(result, allTimeBest)) {
    allTimeBest = result;
  }

  saveLocal();
  renderHistory();

  /* ============================================================
     CLOUD
     ============================================================ */

  if (currentUser) {
    await saveCloudRoll(result);
    await loadPersonalStats();
    await loadLeaderboard();
  }

  $("rollBtn").disabled = false;
  rolling = false;
}


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
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.error(error);
  }
};


/* ============================================================
   REFRESH LEADERBOARD
   ============================================================ */

$("refreshLeaderboard").onclick = async () => {
  $("refreshLeaderboard").disabled = true;

  await loadLeaderboard();

  $("refreshLeaderboard").disabled = false;

  toast("Leaderboard refreshed.");
};


/* ============================================================
   AUTH STATE
   ============================================================ */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    console.log("Auth state:", event);

    if (session?.user) {

      currentUser = session.user;

      /*
       * Delay database work slightly so Supabase's
       * auth initialization can finish cleanly.
       */

      setTimeout(async () => {

        await ensureProfile(currentUser);

        updateAccountUI();

        await loadPersonalStats();

        await loadLeaderboard();

      }, 0);

    } else {

      currentUser = null;
      profile = null;

      updateAccountUI();
    }
  }
);


/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {

  loadLocal();

  updateAccountUI();

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.warn(
        "Session error:",
        error
      );
    }

    if (data?.session?.user) {

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
