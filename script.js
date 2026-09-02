/* ============================================================
   SUPABASE
   ============================================================ */

const SUPABASE_URL = "https://xuofbnghqcktlsmjgfbj.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_TmDnxgFW6x3odYuOgeb3Og_ofKL4her";

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

  1337: ["💻 LEET", "Classic internet and gaming slang for 'leet'.", 120000],

  666: [
    "😈 The Number",
    "A famously recognizable number with cultural significance.",
    150000,
  ],

  777: [
    "🎰 Lucky 7s",
    "Three 7s are a classic lucky slot-machine pattern.",
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

  41: [
    "🔥 41 Meme",
    "A reference to the viral 41 number meme associated with Blizzi Boi and the 41 trend.",
    25000,
  ],

  1985: [
    "🍄 Super Mario Bros.",
    "The release year of the original Super Mario Bros. on the NES.",
    90000,
  ],
  1986: [
    "🗡️ The Legend of Zelda",
    "A classic year for the original The Legend of Zelda.",
    90000,
  ],
  1989: [
    "🎮 Game Boy Era",
    "The year Nintendo released the original Game Boy in Japan.",
    75000,
  ],
  1991: [
    "💨 Sonic 1991",
    "The year Sonic the Hedgehog first sped onto the scene.",
    85000,
  ],
  1993: ["👹 DOOM", "The iconic year the original DOOM was released.", 100000],
  1994: [
    "🪖 Warcraft / System Shock",
    "1994 was a landmark year for PC gaming, including Warcraft and System Shock.",
    90000,
  ],
  1996: [
    "🦖 Quake / Pokémon",
    "1996 was a huge year for gaming, including Quake and the original Pokémon releases.",
    110000,
  ],
  1997: ["🚗 GTA", "The original Grand Theft Auto arrived in 1997.", 85000],
  2002: [
    "🔑 Kingdom Hearts",
    "Kingdom Hearts released in 2002 and became a major action-RPG series.",
    90000,
  ],
  2008: ["🧟 Left 4 Dead", "The original Left 4 Dead released in 2008.", 95000],
  2014: [
    "📹 Five Nights at Freddy's",
    "The original Five Nights at Freddy's released in 2014.",
    100000,
  ],
  2021: [
    "🤝 It Takes Two",
    "It Takes Two released in 2021 and won Game of the Year.",
    100000,
  ],
  2024: [
    "🤖 Astro Bot",
    "Astro Bot released in 2024 and became a celebrated platforming adventure.",
    90000,
  ],
  1998: [
    "🔬 Half-Life",
    "The year the original Half-Life changed first-person gaming.",
    100000,
  ],
  1999: ["⚡ 1999 Gaming", "A classic late-90s gaming reference year.", 70000],
  2000: [
    "🕹️ Y2K Gaming",
    "A round-number reference to the turn-of-the-millennium gaming era.",
    60000,
  ],
  2004: [
    "🪖 Halo 2",
    "Halo 2 released in 2004 and became a landmark console shooter.",
    100000,
  ],
  2005: [
    "🧟 Resident Evil 4",
    "A legendary survival-horror/action game released in 2005.",
    95000,
  ],
  2006: ["🧱 Roblox Era", "Roblox was founded in 2006.", 90000],
  2007: [
    "🔵 Portal / TF2",
    "2007 was stacked with gaming classics including Portal and Team Fortress 2.",
    110000,
  ],
  2009: ["⛏️ Minecraft", "Minecraft first appeared publicly in 2009.", 120000],
  2011: [
    "🐉 Skyrim / Terraria",
    "2011 gave us major gaming releases including Skyrim and Terraria.",
    110000,
  ],
  2012: [
    "💎 Borderlands 2",
    "A major looter-shooter classic released in 2012.",
    85000,
  ],
  2013: ["🚘 GTA V", "Grand Theft Auto V launched in 2013.", 120000],
  2015: ["❤️ Undertale", "The indie RPG Undertale released in 2015.", 100000],
  2016: ["🦾 Overwatch", "The original Overwatch released in 2016.", 95000],
  2017: [
    "⛏️ Fortnite / Hollow Knight",
    "2017 was a huge year for gaming, including Fortnite and Hollow Knight.",
    105000,
  ],
  2018: [
    "🏔️ Celeste",
    "The acclaimed precision-platformer Celeste released in 2018.",
    90000,
  ],
  2020: [
    "🚀 Among Us",
    "Among Us became a massive gaming phenomenon in 2020.",
    90000,
  ],
  2022: [
    "💍 Elden Ring",
    "Elden Ring released in 2022 and became a landmark action RPG.",
    110000,
  ],
  2023: [
    "⭐ Baldur's Gate 3",
    "Baldur's Gate 3 released in 2023 and became a major RPG hit.",
    100000,
  ],
  2077: [
    "🌃 Night City",
    "Cyberpunk 2077 reference: 2077 is the game's futuristic setting year.",
    150000,
  ],
  64: ["🎮 Nintendo 64", "64 is a classic Nintendo console reference.", 50000],
  360: ["🟢 Xbox 360", "360 is an iconic Xbox console reference.", 45000],
  720: [
    "🎮 720",
    "A gaming-number reference associated with 720-degree spins and classic trick shots.",
    50000,
  ],
  1080: [
    "🖥️ 1080p Gaming",
    "1080 is a classic gaming resolution reference.",
    35000,
  ],
  9001: [
    "💥 OVER 9000",
    "A legendary internet and gaming-culture number reference.",
    70000,
  ],
  "0451": [
    "🔑 0451",
    "A famous immersive-sim door-code reference used across games such as System Shock and Deus Ex.",
    120000,
  ],
  1337: ["💻 LEET", "Classic internet and gaming slang for 'leet'.", 120000],

  /* Internet / meme references */
  21: [
    "🔢 9 + 10 = 21",
    "A classic internet meme based on the famous 9 + 10 joke.",
    60000,
  ],
  42: [
    "🌌 The Answer",
    "The famous answer to life, the universe, and everything.",
    70000,
  ],
  69: ["😎 Nice", "A classic internet-number meme/reference.", 40000],
  420: ["🌿 420", "A widely recognized internet number meme/reference.", 80000],
  1337: ["💻 LEET", "Classic internet and gaming slang for 'leet'.", 120000],
  9001: [
    "💥 OVER 9000",
    "A legendary internet meme reference popularized by Dragon Ball Z.",
    70000,
  ],
  69420: [
    "🔥 69,420",
    "A classic internet meme combination of two famous meme numbers.",
    250000,
  ],
  42069: [
    "🌀 42069",
    "A chaotic combination of two classic internet meme numbers.",
    250000,
  ],
  123456: [
    "🔢 Password Meme",
    "The famous obvious-number-sequence joke used for hilariously weak passwords.",
    100000,
  ],
  111111: [
    "📢 SIX ONES",
    "A perfectly repeated number that became a familiar internet-style pattern.",
    90000,
  ],
  222222: [
    "✌️ DOUBLE TWOS",
    "Six identical 2s — an absurdly clean repeated-number pattern.",
    110000,
  ],
  333333: [
    "3️⃣ TRIPLE THREES",
    "Six 3s in a row — maximum repetition energy.",
    120000,
  ],
  444444: [
    "4️⃣ FOUR FOUR FOUR",
    "Six 4s in a row — an ultra-clean repeated sequence.",
    120000,
  ],
  555555: [
    "5️⃣ FIVE FIVE FIVE",
    "Six 5s in a row — a classic repeated-digit flex.",
    120000,
  ],
  666666: [
    "😈 SIX SIX SIX",
    "Six 6s — an exaggerated version of the famous 666 reference.",
    180000,
  ],
  777777: [
    "🎰 ULTRA LUCKY 7s",
    "Six 7s in a row — a ridiculous jackpot-style pattern.",
    220000,
  ],
  888888: [
    "♾️ INFINITE EIGHTS",
    "Six 8s — an extremely clean repeating pattern.",
    160000,
  ],
  999999: [
    "📈 MAX NINES",
    "Six 9s — the digit maximum repeated across the entire roll.",
    160000,
  ],
  123456789: [
    "📈 The Classic Climb",
    "The familiar 1-through-9 sequence seen everywhere online.",
    350000,
  ],
  987654321: [
    "📉 The Reverse Climb",
    "The 9-through-1 reverse of the classic counting sequence.",
    350000,
  ],
  314159: [
    "🥧 Pi Digits",
    "A longer recognizable sequence from the digits of pi.",
    300000,
  ],
  271828: [
    "📐 Euler's Number",
    "A recognizable sequence from the digits of e.",
    300000,
  ],
  161803: [
    "🌀 Golden Ratio",
    "A recognizable sequence from the digits of the golden ratio.",
    300000,
  ],
  101010: [
    "💾 Binary Vibes",
    "A repeating 1010 pattern that looks like a tiny binary joke.",
    100000,
  ],
  010101: [
    "💾 Reverse Binary Vibes",
    "A repeating 0101 pattern with unmistakable binary aesthetics.",
    120000,
  ],
  2001: [
    "🚀 Space Meme",
    "A recognizable science-fiction number reference.",
    90000,
  ],
  1984: [
    "📖 1984",
    "A famous cultural reference and frequent internet meme number.",
    90000,
  ],
  2012: [
    "🌎 2012",
    "The famous 'end of the world' year that became an enduring meme.",
    80000,
  ],
  2016: [
    "🦍 Harambe Era",
    "A reference to the internet culture surrounding 2016.",
    100000,
  ],
  2020: [
    "🦠 The Year 2020",
    "A hugely recognizable internet-culture reference to the chaotic year 2020.",
    100000,
  ],
  404: [
    "🌐 404",
    "The classic 'not found' internet error turned into a meme.",
    90000,
  ],

  /* Minecraft / gaming easter eggs */
  303: [
    "👁️ Entity 303",
    "A famous Minecraft creepypasta-style myth about the mysterious Entity 303.",
    180000,
  ],
  418: [
    "🎵 C418",
    "Reference to C418, the musician strongly associated with Minecraft's iconic soundtrack.",
    140000,
  ],
  422: [
    "⚠️ Minecraft 422",
    "A reference to the infamous Minecraft Error 422 creepypasta concept.",
    200000,
  ],
  11: [
    "💿 Disc 11",
    "A mysterious Minecraft music-disc reference known for its unsettling audio.",
    160000,
  ],
  13: ["💿 Disc 13", "One of Minecraft's original music-disc numbers.", 120000],
  2010: [
    "🧱 Minecraft Alpha",
    "Minecraft entered its Alpha era in 2010.",
    110000,
  ],
  2011: ["🐉 Minecraft 1.0", "Minecraft officially released in 2011.", 130000],
  12550820: [
    "🌌 Far Lands",
    "A reference to Minecraft's legendary Far Lands distance.",
    5000000,
  ],
  3030: [
    "👁️ Entity 303 Echo",
    "A playful extended Entity 303 number reference.",
    250000,
  ],
  404: [
    "🌐 Missing Chunk",
    "A Minecraft-flavored twist on the classic 404 missing-page number.",
    90000,
  ],
  64: [
    "🧱 64 Stack",
    "64 is the classic Minecraft stack size for many blocks and items.",
    50000,
  ],
  16: [
    "🧱 16 Stack",
    "16 is a classic Minecraft stack size for several items.",
    35000,
  ],
  32: [
    "🧱 32 Stack",
    "32 appears as a familiar stack quantity in Minecraft history.",
    30000,
  ],
  256: [
    "⬆️ Build Height 256",
    "256 was the classic maximum build height in older Minecraft versions.",
    90000,
  ],
  319: [
    "🪨 Minecraft Height",
    "319 is associated with modern Minecraft's expanded build range.",
    80000,
  ],

  /* More gaming easter eggs */
  1986: [
    "🗡️ Zelda 1986",
    "The original The Legend of Zelda launched in 1986.",
    90000,
  ],
  1994: [
    "⚔️ Warcraft 1994",
    "A classic PC-gaming year associated with Warcraft and other landmarks.",
    90000,
  ],
  1996: [
    "⚡ Pokémon 1996",
    "The original Pokémon games launched in Japan in 1996.",
    110000,
  ],
  1998: [
    "🔬 Half-Life 1998",
    "Half-Life released in 1998 and became a landmark first-person game.",
    100000,
  ],
  2004: ["🪖 Halo 2", "Halo 2 released in 2004.", 100000],
  2007: [
    "🔵 Portal Era",
    "2007 was the release year of Portal and Team Fortress 2.",
    110000,
  ],
  2012: ["💎 Borderlands 2", "Borderlands 2 released in 2012.", 85000],
  2015: ["❤️ Undertale", "Undertale released in 2015.", 100000],
  2017: [
    "⛏️ Fortnite / Hollow Knight",
    "2017 was a huge year for gaming, including Fortnite and Hollow Knight.",
    105000,
  ],
  2018: ["🏔️ Celeste", "Celeste released in 2018.", 90000],
  2020: [
    "🚀 Among Us",
    "Among Us became a huge gaming phenomenon in 2020.",
    90000,
  ],
  2022: ["💍 Elden Ring", "Elden Ring released in 2022.", 110000],
  2023: ["⭐ Baldur's Gate 3", "Baldur's Gate 3 released in 2023.", 100000],
  1987: [
    "🦇 Castlevania",
    "A classic Castlevania-era gaming reference.",
    80000,
  ],
  1993: ["👹 DOOM", "The original DOOM released in 1993.", 100000],
  1997: ["🚗 GTA", "The original Grand Theft Auto released in 1997.", 85000],
  1999: ["🌀 Sonic Adventure", "A late-90s Sonic gaming reference.", 80000],
  2001: [
    "🧢 Halo / Xbox Era",
    "2001 was the launch year of the original Halo on Xbox.",
    100000,
  ],
  2006: ["🧱 Roblox Era", "Roblox was founded in 2006.", 90000],
  2008: ["🧟 Left 4 Dead", "Left 4 Dead released in 2008.", 95000],
  2013: ["🚘 GTA V", "Grand Theft Auto V launched in 2013.", 120000],
  2016: ["🦾 Overwatch", "Overwatch released in 2016.", 95000],
  2019: [
    "🔥 Classic 2019",
    "A general late-2010s gaming reference year.",
    60000,
  ],
  2024: ["🤖 Astro Bot", "Astro Bot released in 2024.", 90000],
};

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
   SHOP / BADGE COLLECTION
   ============================================================ */

let charmBonus = Number(localStorage.getItem("digitRollCharmBonus") || 0);
let luckyGlovesLevel = Number(
  localStorage.getItem("digitRollLuckyGlovesLevel") || 0,
);
let xpSpent = Number(localStorage.getItem("digitRollXPSpent") || 0);
let xpBalance =
  localStorage.getItem("digitRollXPBalance") !== null
    ? Number(localStorage.getItem("digitRollXPBalance"))
    : null;
let rollLengthLevel = Number(
  localStorage.getItem("digitRollRollLengthLevel") || 0,
);
const BASE_ROLL_LENGTH = 5;
const MAX_ROLL_LENGTH = 10;
const STARTING_XP_CAP = 10000;
const MAX_XP_CAP = 100000;
const XP_CAP_STEP = 10000;
let xpCapLevel = Math.max(
  0,
  Math.min(9, Number(localStorage.getItem("digitRollXPCapLevel") || 0)),
);

const ROLL_LENGTH_ITEMS = [
  { level: 1, cost: 1000, name: "🔢 Number Upgrade I" },
  { level: 2, cost: 5000, name: "🔢 Number Upgrade II" },
  { level: 3, cost: 25000, name: "🔢 Number Upgrade III" },
  { level: 4, cost: 100000, name: "🔢 Number Upgrade IV" },
  { level: 5, cost: 500000, name: "🔢 Number Upgrade V" },
];

// Number Charms are ONE-TIME-USE. They are stored only until the next roll.
localStorage.removeItem("digitRollNumberCharmCounts");
let numberCharmPending = JSON.parse(
  localStorage.getItem("digitRollNumberCharmPending") || "{}",
);

function saveNumberCharmState() {
  localStorage.setItem(
    "digitRollNumberCharmPending",
    JSON.stringify(numberCharmPending),
  );
}

function getNumberCharmCount(digit) {
  return Math.max(0, Number(numberCharmPending[String(digit)] || 0));
}

function getTotalNumberCharmsPending() {
  return Object.values(numberCharmPending).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0,
  );
}

function consumeNumberCharms() {
  const used = { ...numberCharmPending };
  numberCharmPending = {};
  saveNumberCharmState();
  return used;
}

function getDigitBadgeFrequency(digit) {
  const d = String(digit);
  let frequency = 0;
  for (const [key, value] of Object.entries(references)) {
    if (String(key).includes(d)) frequency += 5;
    if (String(value[0]).includes(d)) frequency += 2;
    if (String(value[1]).includes(d)) frequency += 1;
  }
  for (const [name, explanation] of commonBadgeDefinitions || []) {
    if (String(name).includes(d)) frequency += 2;
    if (String(explanation).includes(d)) frequency += 1;
  }
  return Math.max(1, frequency);
}

function getNumberCharmCost(digit) {
  const frequency = getDigitBadgeFrequency(digit);
  return Math.round((250 + frequency * 175) / 50) * 50;
}

function getNumberCharmCap(digit) {
  return getRollLength();
}

function getNumberCharmHTML(balance) {
  return Array.from({ length: 10 }, (_, digit) => {
    const count = getNumberCharmCount(digit);
    const cap = getNumberCharmCap(digit);
    const cost = getNumberCharmCost(digit);
    const full = getTotalNumberCharmsPending() >= cap;
    const affordable = balance >= cost;
    return `<div class="drShopItem"><h3>🔢 Number Charm ${digit}</h3><p>Next roll only: guarantees <b>+1 ${digit}</b>.</p><p>Ready: <b>${count}/${cap}</b> • Cost: <b>${cost.toLocaleString()} XP</b></p><button class="drBuy" ${full || !affordable ? "disabled" : ""} onclick="buyNumberCharm(${digit},${cost})">${full ? "✓ At Current Cap" : affordable ? "Buy +1 ${digit}" : "Not enough XP"}</button></div>`;
  }).join("");
}

function getRollLength() {
  return Math.min(MAX_ROLL_LENGTH, BASE_ROLL_LENGTH + rollLengthLevel);
}

const LUCK_CHARM_ITEMS = [
  { level: 1, cost: 250, bonus: 1, name: "🍀 Lucky Charm I" },
  { level: 2, cost: 1000, bonus: 2, name: "🍀 Lucky Charm II" },
  { level: 3, cost: 5000, bonus: 3, name: "✨ Lucky Charm III" },
  { level: 4, cost: 25000, bonus: 4, name: "✨ Lucky Charm IV" },
  { level: 5, cost: 100000, bonus: 5, name: "💎 Lucky Charm V" },
  { level: 6, cost: 500000, bonus: 6, name: "💎 Lucky Charm VI" },
  { level: 7, cost: 2500000, bonus: 7, name: "🌟 Lucky Charm VII" },
  { level: 8, cost: 10000000, bonus: 8, name: "🌟 Lucky Charm VIII" },
  { level: 9, cost: 50000000, bonus: 9, name: "👑 Lucky Charm IX" },
  { level: 10, cost: 250000000, bonus: 10, name: "👑 Lucky Charm X" },
];

const LUCKY_GLOVE_ITEMS = [
  { level: 1, cost: 5000000, bonus: 1, name: "🧤 Lucky Gloves I" },
  { level: 2, cost: 25000000, bonus: 2, name: "🧤 Lucky Gloves II" },
  { level: 3, cost: 100000000, bonus: 3, name: "🧤 Lucky Gloves III" },
  { level: 4, cost: 500000000, bonus: 4, name: "🧤 Lucky Gloves IV" },
  { level: 5, cost: 2500000000, bonus: 5, name: "🧤 Lucky Gloves V" },
  { level: 6, cost: 10000000000, bonus: 6, name: "🧤 Lucky Gloves VI" },
];

const staticBadgeCatalog = {};

function registerBadgeCatalog(name, explanation, oneIn) {
  if (!name) return;
  if (!staticBadgeCatalog[name]) {
    staticBadgeCatalog[name] = { name, explanation, oneIn: Number(oneIn) || 1 };
  }
}

for (const [key, [name, explanation, oneIn]] of Object.entries(references)) {
  registerBadgeCatalog(name, explanation, oneIn);
}

const commonBadgeDefinitions = [
  ["🔁 Repeater", "At least one visible digit appears more than once.", 5],
  ["🔥 Triple Digit", "A visible digit appears three or more times.", 100],
  ["💥 Quad Digit", "A visible digit appears four or more times.", 1000],
  [
    "☢️ Quint Digit",
    "The same visible digit appears at least five times.",
    10000,
  ],
  [
    "👹 Hex Digit",
    "One digit dominates the roll with six or more appearances.",
    100000,
  ],
  ["💀 Sept Digit", "Seven copies of the same digit appear.", 1000000],
  ["👑 Oct Digit", "Eight copies of one digit appear.", 10000000],
  ["👑 Monochrome", "Every visible digit is identical.", 1000000],
  [
    "🌈 All Ten Digits",
    "Every digit from 0 through 9 appears exactly once.",
    3628800,
  ],
  ["👯 Double", "Two identical digits appear directly beside each other.", 100],
  ["🔥 Triple Stack", "Three identical digits appear consecutively.", 1000],
  ["💥 Quad Stack", "Four identical digits appear consecutively.", 10000],
  [
    "📈 Rising Sequence",
    "Three consecutive digits appear in ascending order.",
    100,
  ],
  ["🪜 Staircase", "Four consecutive digits climb steadily upward.", 1000],
  ["🚀 Mega Staircase", "Five consecutive digits rise steadily upward.", 10000],
  [
    "🌟 Ultra Staircase",
    "Six consecutive digits climb in perfect order.",
    100000,
  ],
  [
    "📉 Falling Sequence",
    "Three consecutive digits appear in descending order.",
    100,
  ],
  ["🪜 Reverse Staircase", "Four consecutive digits descend steadily.", 1000],
  [
    "🚀 Mega Reverse Staircase",
    "Five consecutive digits fall steadily downward.",
    10000,
  ],
  [
    "⛰️ Mountain",
    "Numbers rise to a peak in order, then fall back down.",
    10000,
  ],
  [
    "🏞️ Valley",
    "Numbers fall to a low point in order, then rise again.",
    10000,
  ],
  [
    "🌊 Wave",
    "The digits repeatedly rise and fall, creating a wave-like pattern.",
    15000,
  ],
  ["🪞 Mirror", "A sequence reads the same forward and backward.", 1000],
  [
    "🪞 Perfect Mirror",
    "The entire visible number reads identically forward and backward.",
    100000,
  ],
  ["⚡ Alternator", "Two digits repeatedly alternate back and forth.", 5000],
  ["🔄 Digit Loop", "The digits travel through a long numeric cycle.", 100000],
  [
    "🔺 Pyramid",
    "Digits expand toward a center and then contract, creating a pyramid-like pattern.",
    20000,
  ],
  ["🎯 Centered", "Matching outer digits surround a centered pair.", 10000],
  [
    "🚀 Long Climb",
    "At least six digits form a continuous ascending sequence.",
    100000,
  ],
  [
    "🛰️ Long Descent",
    "At least six digits form a continuous descending sequence.",
    100000,
  ],
  ["🔁 Looping Block", "A block of digits repeats three times in a row.", 1000],
  [
    "📐 Arithmetic Pattern",
    "The visible digits change by the same amount each step.",
    20000,
  ],
  [
    "📊 Quadratic Pattern",
    "The changes themselves follow a consistent arithmetic pattern.",
    50000,
  ],
  [
    "✖️ Multiplication Chain",
    "Each digit follows a repeating multiplication relationship.",
    50000,
  ],
  [
    "⚫⚪ Parity Chain",
    "Every visible digit has the same odd/even parity.",
    32,
  ],
  [
    "⚡ Odd/Even Alternator",
    "Odd and even digits alternate throughout the visible sequence.",
    100,
  ],
  ["🌌 Sum of 42", "The visible digits add up to the famous number 42.", 5000],
  ["⚔️ Sum of 55", "The visible digits add up to 55.", 6000],
  ["🔢 Sum of 67", "The visible digits add up to 67.", 7000],
  ["🍀 Lucky Root", "The visible digits have a digital root of 7.", 1000],
  [
    "🧮 Math Pattern",
    "A recognizable mathematical square pattern appears inside the roll.",
    12000,
  ],
  [
    "🔬 Prime Chain",
    "Every visible digit is a prime digit: 2, 3, 5, or 7.",
    5000,
  ],
  ["🟦 Even Storm", "Every visible digit is even.", 32],
  ["🟥 Odd Storm", "Every visible digit is odd.", 32],
  [
    "🎰 JACKPOT 777",
    "Three consecutive 7s create the ultimate lucky slot pattern.",
    1000000,
  ],
  ["💎 SUPER JACKPOT", "Four consecutive 7s appear in the roll.", 10000000],
  [
    "🔥 Double 67",
    "The 67 reference appears twice in a repeating pattern.",
    100000,
  ],
  ["⚔️ Kingsammelot MAX", "Four 5s appear together.", 100000],
];

commonBadgeDefinitions.forEach((b) => registerBadgeCatalog(...b));

function getEarnedXP() {
  return history.reduce((sum, row) => sum + Number(row.xp || 0), 0);
}

function ensureXPBalance() {
  if (!Number.isFinite(xpBalance)) {
    xpBalance = clampXP(getEarnedXP() - xpSpent);
    localStorage.setItem("digitRollXPBalance", String(xpBalance));
  }
  return xpBalance;
}

function getXPBalance() {
  return Math.max(0, Number(ensureXPBalance()));
}

async function loadXPWallet() {
  if (!currentUser) return false;
  try {
    const { data, error } = await supabaseClient
      .from("xp_wallets")
      .select("xp_balance")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      xpBalance = clampXP(Number(data.xp_balance) || 0);
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
      return true;
    }
    await syncXPWallet();
    return false;
  } catch (e) {
    console.warn("Could not load XP wallet:", e);
    return false;
  }
}

async function syncXPWallet() {
  if (!currentUser) return;
  try {
    await supabaseClient.rpc("sync_xp_wallet", {
      p_balance: Math.floor(getXPBalance()),
    });
  } catch (e) {
    console.warn("Could not sync XP wallet:", e);
  }
}

function saveShopState() {
  localStorage.setItem("digitRollCharmBonus", String(charmBonus));
  localStorage.setItem("digitRollLuckyGlovesLevel", String(luckyGlovesLevel));
  localStorage.setItem("digitRollRollLengthLevel", String(rollLengthLevel));
  localStorage.setItem("digitRollXPSpent", String(xpSpent));
  saveNumberCharmState();
}

function getUnlockedBadgeNames() {
  const unlocked = new Set();
  history.forEach((row) => {
    if (Array.isArray(row.badges)) {
      row.badges.forEach((b) =>
        unlocked.add(typeof b === "string" ? b : b.name),
      );
    }
  });
  return unlocked;
}

function getGuaranteedBadgeCount() {
  const glove = LUCKY_GLOVE_ITEMS[luckyGlovesLevel - 1];
  return Math.max(0, charmBonus + (glove ? glove.bonus : 0));
}

function applyGuaranteedBadges(result) {
  const count = getGuaranteedBadgeCount();
  if (!count) return result;

  Object.values(result.badges || {}).forEach((b) =>
    registerBadgeCatalog(b.name, b.explanation, b.oneIn),
  );

  const existing = new Set(result.badges.map((b) => b.name));
  const pool = Object.values(staticBadgeCatalog).filter(
    (b) => Number(b.oneIn) <= 10000 && !existing.has(b.name),
  );

  for (let i = 0; i < count && pool.length; i++) {
    const index = Math.floor(Math.random() * pool.length);
    const picked = pool.splice(index, 1)[0];
    result.badges.push({ ...picked, guaranteed: true });
    existing.add(picked.name);
  }

  result.badges.sort((a, b) => Number(a.oneIn) - Number(b.oneIn));
  return result;
}

function consumeCharm() {
  if (charmBonus > 0) {
    const used = charmBonus;
    charmBonus = 0;
    localStorage.setItem("digitRollCharmBonus", "0");
    return used;
  }
  return 0;
}

async function giftDigitRollXP() {
  if (!currentUser) {
    toast("You need to be logged in to gift XP.");
    return;
  }
  const recipientInput = prompt("Enter the player's exact username:");
  if (!recipientInput) return;
  const amount = Number(prompt("How much XP do you want to gift?"));
  if (!Number.isInteger(amount) || amount <= 0) {
    toast("Enter a valid whole XP amount.");
    return;
  }
  if (amount > getXPBalance()) {
    toast("You don't have enough XP.");
    return;
  }
  try {
    const { data, error } = await supabaseClient.rpc("gift_xp", {
      p_recipient_username: recipientInput.trim(),
      p_amount: amount,
    });
    if (error) throw error;
    xpBalance = Math.max(0, getXPBalance() - amount);
    xpSpent += amount;
    localStorage.setItem("digitRollXPBalance", String(xpBalance));
    localStorage.setItem("digitRollXPSpent", String(xpSpent));
    toast(
      `🎁 Gifted ${amount.toLocaleString()} XP to ${recipientInput.trim()}!`,
    );
    updateShopUI();
  } catch (error) {
    console.error("XP gift failed:", error);
    toast(
      error.message ||
        "XP gift failed. Make sure the XP wallet SQL is installed.",
    );
  }
}

function ensureShopUI() {
  if ($("digitRollShopOverlay")) {
    updateShopUI();
    return;
  }

  const style = document.createElement("style");
  style.id = "digitRollShopStyles";
  style.textContent = `
    #digitRollNav { position:fixed; top:18px; right:18px; z-index:10000; display:flex; gap:8px; }
    .drNavBtn { border:1px solid rgba(255,255,255,.12); background:rgba(18,23,34,.88); color:#fff; padding:10px 14px; border-radius:12px; cursor:pointer; font-weight:800; backdrop-filter:blur(10px); }
    .drOverlay { position:fixed; inset:0; z-index:9998; display:none; padding:30px 18px; overflow:auto; background:rgba(0,0,0,.76); backdrop-filter:blur(12px); }
    .drOverlay.open { display:block; }
    .drPage { width:min(1000px,100%); margin:50px auto; background:rgba(18,23,34,.97); border:1px solid rgba(255,255,255,.12); border-radius:24px; padding:26px; box-shadow:0 30px 100px rgba(0,0,0,.55); }
    .drPageHead { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-bottom:20px; }
    .drPageTitle { font-size:28px; font-weight:900; }
    .drClose { border:0; background:rgba(255,255,255,.08); color:#fff; width:40px; height:40px; border-radius:12px; cursor:pointer; font-size:22px; }
    .drBalance { padding:16px; border-radius:16px; background:rgba(142,230,173,.08); border:1px solid rgba(142,230,173,.18); margin-bottom:18px; font-size:18px; font-weight:800; }
    .drShopSection { margin-top:22px; }
    .drShopSection h2 { margin:0 0 10px; }
    .drShopGrid, .drBadgeGrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:12px; }
    .drShopItem, .drBadgeCard { padding:16px; border-radius:16px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.08); }
    .drShopItem h3, .drBadgeCard h3 { margin:0 0 7px; font-size:17px; }
    .drShopItem p, .drBadgeCard p { color:#aab5ca; line-height:1.45; margin:6px 0; }
    .drBuy { width:100%; border:0; border-radius:11px; padding:11px; cursor:pointer; font-weight:850; background:rgba(142,230,173,.16); color:#fff; margin-top:10px; }
    .drBuy:disabled { opacity:.45; cursor:not-allowed; }
    .drRarity { font-weight:850; margin-top:8px; }
    @media(max-width:650px){ #digitRollNav{top:auto;bottom:14px;right:14px;} .drPage{margin:20px auto;padding:18px;} }
  `;
  document.head.appendChild(style);

  const nav = document.createElement("div");
  nav.id = "digitRollNav";
  nav.innerHTML = `
    <button id="drShopBtn" class="drNavBtn" type="button">🛒 Shop</button>
    <button id="drBadgesBtn" class="drNavBtn" type="button">🏅 Badges</button>
    <button id="drGiftBtn" class="drNavBtn" type="button">🎁 Gift XP</button>`;
  document.body.appendChild(nav);
  // Use real event listeners instead of inline onclick handlers so the
  // navigation works even when the page has a strict Content-Security-Policy.
  $("drShopBtn").addEventListener("click", openDigitRollShop);
  $("drBadgesBtn").addEventListener("click", openDigitRollBadges);
  $("drGiftBtn").addEventListener("click", giftDigitRollXP);

  const overlay = document.createElement("div");
  overlay.id = "digitRollShopOverlay";
  overlay.className = "drOverlay";
  overlay.innerHTML = `
    <div class="drPage" role="dialog" aria-modal="true">
      <div class="drPageHead"><div id="drPageTitle" class="drPageTitle">Shop</div><button id="drCloseBtn" class="drClose" type="button">×</button></div>
      <div id="drPageContent"></div>
    </div>`;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDigitRollPages();
  });
  document.body.appendChild(overlay);
  $("drCloseBtn").addEventListener("click", closeDigitRollPages);
  updateShopUI();
}

function updateShopUI() {
  if (!$("digitRollShopOverlay")) return;
  const balance = getXPBalance();
  const content = $("drPageContent");
  if (!content) return;
  if ($("drPageTitle"))
    $("drPageTitle").textContent =
      window.digitRollPage === "badges" ? "Badge Collection" : "XP Shop";
  if (window.digitRollPage === "badges") {
    const unlocked = getUnlockedBadgeNames();
    const catalog = Object.values(staticBadgeCatalog).sort(
      (a, b) => Number(a.oneIn) - Number(b.oneIn),
    );
    content.innerHTML = `<div class="drBalance">🏅 Unlocked: ${unlocked.size} / ${catalog.length}</div><div class="drBadgeGrid">${catalog
      .map((b) => {
        const isUnlocked = unlocked.has(b.name);
        return `<div class="drBadgeCard"><h3>${isUnlocked ? escapeHTML(b.name) : "🔒 Locked Badge"}</h3><div class="drRarity">${fmt(b.oneIn)}</div><p>${isUnlocked ? escapeHTML(b.explanation) : "Unlock this badge to reveal its name and description."}</p></div>`;
      })
      .join("")}</div>`;
    return;
  }

  const activeCharm = charmBonus
    ? `🍀 Active charm: +${charmBonus} badge${charmBonus === 1 ? "" : "s"} on your next roll`
    : "🍀 No charm active";
  const rollLength = getRollLength();
  const nextNumberItem = ROLL_LENGTH_ITEMS[rollLengthLevel];
  const numberUpgradeHTML = ROLL_LENGTH_ITEMS.map((item) => {
    const owned = rollLengthLevel >= item.level;
    const next = item.level === rollLengthLevel + 1;
    const affordable = balance >= item.cost;
    return `<div class="drShopItem"><h3>${item.name}</h3><p>Permanently adds <b>+1 number</b> to every roll.</p><p>Roll length after purchase: <b>${BASE_ROLL_LENGTH + item.level}</b></p><p>Cost: <b>${item.cost.toLocaleString()} XP</b></p><button class="drBuy" ${owned || !next || !affordable ? "disabled" : ""} onclick="buyRollLengthUpgrade(${item.level},${item.cost})">${owned ? "✓ Owned" : !next ? "Locked" : affordable ? "Buy Permanently" : "Not enough XP"}</button></div>`;
  }).join("");
  const glove = LUCKY_GLOVE_ITEMS[luckyGlovesLevel - 1];
  const gloveBonus = glove ? glove.bonus : 0;

  content.innerHTML = `<div class="drBalance">💰 XP Balance: ${balance.toLocaleString()} / ${getMaxXPBalance().toLocaleString()} XP<br>🎁 <button class="drBuy" style="max-width:180px;display:inline-block" onclick="giftDigitRollXP()">Gift XP to Player</button><br>🔢 Roll length: ${rollLength} numbers<br>${activeCharm}<br>🧤 Lucky Gloves: +${gloveBonus} badge${gloveBonus === 1 ? "" : "s"} every roll</div>
    <div class="drShopSection"><h2>🔢 Permanent Number Upgrades</h2><p style="color:#aab5ca">Start with 5 numbers. Each upgrade permanently adds one number, up to 10.</p><div class="drShopGrid">${numberUpgradeHTML}</div></div>
    <div class="drShopSection"><h2>🔢 Number Charms</h2><p style="color:#aab5ca">Number Charms are <b>one-time-use</b>. Each one guarantees one copy of its digit on your next roll, then disappears. You can queue up to your current roll length in total. Digits that appear more often across badge references cost more XP.</p><div class="drShopGrid">${getNumberCharmHTML(balance)}</div></div>
    <div class="drShopSection"><h2>🍀 Lucky Charms</h2><p style="color:#aab5ca">Charms are consumed by your next roll. Higher-level charms guarantee more badges.</p><div class="drShopGrid">${LUCK_CHARM_ITEMS.map(
      (item) => {
        const affordable = balance >= item.cost;
        return `<div class="drShopItem"><h3>${item.name}</h3><p>Next roll only: <b>+${item.bonus}</b> guaranteed badge${item.bonus === 1 ? "" : "s"}.</p><p>Cost: <b>${item.cost.toLocaleString()} XP</b></p><button class="drBuy" ${!affordable ? "disabled" : ""} onclick="buyDigitRollCharm(${item.level},${item.cost},${item.bonus})">${affordable ? "Buy & Activate" : "Not enough XP"}</button></div>`;
      },
    ).join("")}</div></div>
    <div class="drShopSection"><h2>🧤 Lucky Gloves</h2><p style="color:#aab5ca">Lucky Gloves are permanent upgrades. They are intentionally VERY expensive and add badges to every roll.</p><div class="drShopGrid">${LUCKY_GLOVE_ITEMS.map(
      (item) => {
        const owned = luckyGlovesLevel >= item.level;
        const affordable = balance >= item.cost;
        const next = item.level === luckyGlovesLevel + 1;
        return `<div class="drShopItem"><h3>${item.name}</h3><p>Every roll: <b>+${item.bonus}</b> guaranteed badge${item.bonus === 1 ? "" : "s"}.</p><p>Cost: <b>${item.cost.toLocaleString()} XP</b></p><button class="drBuy" ${owned || !next || !affordable ? "disabled" : ""} onclick="buyDigitRollGloves(${item.level},${item.cost})">${owned ? "✓ Owned" : !next ? "Locked" : affordable ? "Buy Permanently" : "Not enough XP"}</button></div>`;
      },
    ).join("")}</div></div>
    <div class="drShopSection"><h2>📈 XP Rebirth</h2><p style="color:#aab5ca">Your current XP Rebirth cap is <b>${getMaxXPBalance().toLocaleString()} XP</b>. Each Rebirth raises your maximum XP balance by 10,000, up to 100,000. <b>Roll XP is a separate upgrade system.</b></p><div class="drShopGrid">${Array.from(
      { length: 9 },
      (_, i) => {
        const level = i + 1;
        const newCap = STARTING_XP_CAP + level * XP_CAP_STEP;
        const cost = STARTING_XP_CAP + i * XP_CAP_STEP;
        const owned = xpCapLevel >= level;
        const next = level === xpCapLevel + 1;
        const maxed = getMaxXPBalance() >= MAX_XP_CAP;
        const affordable = balance >= cost;
        return `<div class="drShopItem"><h3 style="color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,.45)">👑 XP Rebirth ${level}</h3><p>Raises your XP balance cap to <b style="color:#ffd700">${newCap.toLocaleString()} XP</b>.</p><p>Cost: <b style="color:#ffd700">${cost.toLocaleString()} XP</b> — exactly your current maximum XP balance.</p><button class="drBuy" ${owned || !next || !affordable || maxed ? "disabled" : ""} onclick="buyXPCapUpgrade(${level},${cost})" style="border-color:#ffd700;color:#ffd700;box-shadow:0 0 14px rgba(255,215,0,.18)">${owned ? "✓ Owned" : maxed ? "✓ Maximum Reached" : !next ? "Locked" : affordable ? `Buy for ${cost.toLocaleString()} XP` : "Not enough XP"}</button></div>`;
      },
    ).join("")}</div></div>`;
}

function buyXPCapUpgrade(level, cost) {
  level = Number(level);
  cost = Number(cost);
  if (!Number.isInteger(level) || level !== xpCapLevel + 1) return;
  if (getMaxXPBalance() >= MAX_XP_CAP) {
    toast("Your XP cap is already 100,000.");
    return;
  }
  const expectedCost = getMaxXPBalance();
  if (cost !== expectedCost) return;
  if (getXPBalance() < expectedCost) {
    toast(`You need ${expectedCost.toLocaleString()} XP to buy this upgrade.`);
    return;
  }
  xpBalance = clampXP(getXPBalance() - expectedCost);
  xpSpent += expectedCost;
  xpCapLevel = Math.min(9, xpCapLevel + 1);
  saveXPCapState();
  saveShopState();
  toast(
    `👑 XP Rebirth complete! Your XP cap is now ${getMaxXPBalance().toLocaleString()} XP!`,
  );
  updateShopUI();
}

function buyNumberCharm(digit, cost) {
  digit = Number(digit);
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return;
  const expected = getNumberCharmCost(digit);
  if (Number(cost) !== expected) return;
  const current = getNumberCharmCount(digit);
  if (getTotalNumberCharmsPending() >= getNumberCharmCap(digit)) {
    toast(
      `You can only queue ${getNumberCharmCap(digit)} Number Charms for this roll.`,
    );
    return;
  }
  if (getXPBalance() < expected) {
    toast("Not enough XP.");
    return;
  }
  xpBalance = getXPBalance() - expected;
  xpSpent += expected;
  numberCharmPending[String(digit)] = current + 1;
  saveShopState();
  toast(
    `🔢 Number Charm ${digit} activated! Your next roll guarantees ${current + 1} ${digit}${current + 1 === 1 ? "" : "s"}.`,
  );
  updateShopUI();
}

function buyRollLengthUpgrade(level, cost) {
  if (level !== rollLengthLevel + 1) {
    toast("Buy the previous number upgrade first.");
    return;
  }
  if (getRollLength() >= MAX_ROLL_LENGTH) {
    toast("Your rolls are already 10 numbers long.");
    return;
  }
  if (getXPBalance() < cost) {
    toast("Not enough XP.");
    return;
  }
  xpBalance = getXPBalance() - cost;
  xpSpent += cost;
  rollLengthLevel = level;
  saveShopState();
  toast(`🔢 Roll length upgraded! You now roll ${getRollLength()} numbers.`);
  updateShopUI();
}

function openDigitRollShop() {
  ensureShopUI();
  window.digitRollPage = "shop";
  $("digitRollShopOverlay").classList.add("open");
  updateShopUI();
}
function openDigitRollBadges() {
  ensureShopUI();
  window.digitRollPage = "badges";
  $("digitRollShopOverlay").classList.add("open");
  updateShopUI();
}
function closeDigitRollPages() {
  if ($("digitRollShopOverlay"))
    $("digitRollShopOverlay").classList.remove("open");
}

function buyDigitRollCharm(level, cost, bonus) {
  const item = LUCK_CHARM_ITEMS[level - 1];
  if (!item || item.cost !== cost) return;
  if (getXPBalance() < cost) {
    toast("Not enough XP.");
    return;
  }
  xpBalance = getXPBalance() - cost;
  xpSpent += cost;
  charmBonus = Math.max(charmBonus, Number(bonus) || item.bonus);
  saveShopState();
  toast(
    `🍀 ${item.name} activated! +${charmBonus} guaranteed badges on your next roll.`,
  );
  updateShopUI();
}

function buyDigitRollGloves(level, cost) {
  const item = LUCKY_GLOVE_ITEMS[level - 1];
  if (!item || item.cost !== cost) return;
  if (level !== luckyGlovesLevel + 1) {
    toast("Buy the previous Lucky Gloves level first.");
    return;
  }
  if (getXPBalance() < cost) {
    toast("Not enough XP.");
    return;
  }
  xpBalance = getXPBalance() - cost;
  xpSpent += cost;
  luckyGlovesLevel = level;
  saveShopState();
  toast(
    `🧤 Lucky Gloves upgraded! +${item.bonus} guaranteed badge${item.bonus === 1 ? "" : "s"} every roll.`,
  );
  updateShopUI();
}

window.openDigitRollShop = openDigitRollShop;
window.openDigitRollBadges = openDigitRollBadges;
window.closeDigitRollPages = closeDigitRollPages;
window.buyDigitRollCharm = buyDigitRollCharm;
window.buyDigitRollGloves = buyDigitRollGloves;
window.buyRollLengthUpgrade = buyRollLengthUpgrade;
window.buyNumberCharm = buyNumberCharm;
window.buyXPCapUpgrade = buyXPCapUpgrade;
window.giftDigitRollXP = giftDigitRollXP;

function toast(message) {
  if (!$("toast")) return;

  $("toast").textContent = message;

  $("toast").classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 3000);
}

function fmt(n) {
  const value = Number(n);

  if (!Number.isFinite(value)) {
    return "1 in —";
  }

  return "1 in " + value.toLocaleString();
}

function meta(x) {
  if (!x) return "No rolls yet";

  return `${x.rarity} • ${fmt(x.oneIn)} • ${x.shown}/10 digits`;
}

function better(a, b) {
  return !b || Number(a.oneIn) > Number(b.oneIn);
}

/* ============================================================
   RARITY
   ============================================================ */

function rarityClass(rarity) {
  const classes = {
    NOVICE: "rarity-novice",
    PLAIN: "rarity-plain",
    BASIC: "rarity-basic",
    COMMON: "rarity-common",
    UNCOMMON: "rarity-uncommon",
    RARE: "rarity-rare",
    EPIC: "rarity-epic",
    LEGENDARY: "rarity-legendary",
    MYTHIC: "rarity-mythic",
    DIVINE: "rarity-divine",
    TRANSCENDENT: "rarity-transcendent",
    CELESTIAL: "rarity-celestial",
    ASCENDED: "rarity-ascended",
    OMNIPOTENT: "rarity-omnipotent",
    INFINITE: "rarity-infinite",
    BEYOND: "rarity-beyond",
    ABSOLUTE: "rarity-absolute",
    "???": "rarity-unknown",
  };

  return classes[rarity] || "rarity-common";
}

function applyRarityColor(element, rarity) {
  if (!element) return;

  element.classList.remove(
    "rarity-novice",
    "rarity-plain",
    "rarity-basic",
    "rarity-common",
    "rarity-uncommon",
    "rarity-rare",
    "rarity-epic",
    "rarity-legendary",
    "rarity-mythic",
    "rarity-divine",
    "rarity-transcendent",
    "rarity-celestial",
    "rarity-ascended",
    "rarity-omnipotent",
    "rarity-infinite",
    "rarity-beyond",
    "rarity-absolute",
    "rarity-unknown",
  );

  element.classList.add(rarityClass(rarity));
}

/* ============================================================
   RANDOM ROLL
   ============================================================ */

function randomRoll() {
  const rollLength = getRollLength();
  const forcedDigits = [];
  for (let digit = 0; digit <= 9; digit++) {
    for (let i = 0; i < Math.min(getNumberCharmCount(digit), rollLength); i++)
      forcedDigits.push(String(digit));
  }
  const chars = [];
  let blanks = 0;

  // Number Charms take priority. Their guaranteed digits are inserted first.
  while (forcedDigits.length && chars.length < rollLength) {
    const index = Math.floor(Math.random() * forcedDigits.length);
    chars.push(forcedDigits.splice(index, 1)[0]);
  }

  while (chars.length < rollLength) {
    if (Math.random() < 0.055) {
      chars.push("_");
      blanks++;
    } else {
      chars.push(String(Math.floor(Math.random() * 10)));
    }
  }

  // Shuffle so Number Charms do not always appear at the beginning.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  // If every slot became a blank, preserve the old safety behavior.
  if (blanks === rollLength && forcedDigits.length === 0) {
    const index = Math.floor(Math.random() * rollLength);
    chars[index] = String(Math.floor(Math.random() * 10));
  }
  return chars;
}

/* ============================================================
   PATTERN UTILITIES
   ============================================================ */

function containsAny(str, patterns) {
  return patterns.some((pattern) => str.includes(pattern));
}

function countConsecutiveSame(digits) {
  let best = 1;
  let current = 1;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] === digits[i - 1]) {
      current++;

      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return digits.length ? best : 0;
}

function longestAscendingRun(digits) {
  let best = 1;
  let current = 1;

  for (let i = 1; i < digits.length; i++) {
    if (Number(digits[i]) === Number(digits[i - 1]) + 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function longestDescendingRun(digits) {
  let best = 1;
  let current = 1;

  for (let i = 1; i < digits.length; i++) {
    if (Number(digits[i]) === Number(digits[i - 1]) - 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function isPalindrome(str) {
  return str.length >= 3 && str === str.split("").reverse().join("");
}

/* ============================================================
   ADVANCED PATTERN DETECTOR
   ============================================================ */

function analyze(chars) {
  const digits = chars.filter((x) => x !== "_");

  const compact = digits.join("");

  const badges = [];

  const addBadge = (name, explanation, oneIn) => {
    registerBadgeCatalog(name, explanation, oneIn);
    badges.push({
      name,
      explanation,
      oneIn,
    });
  };

  /* ==========================================================
     FAMOUS REFERENCES
     ========================================================== */

  for (const [key, [name, explanation, oneIn]] of Object.entries(references)) {
    if (compact.includes(key)) {
      addBadge(name, explanation, oneIn);
    }
  }

  /* 41 meme bonus badge */
  if (compact.includes("41")) {
    addBadge(
      "🧓 Did Unc Snap?",
      "A playful badge for hitting the viral 41 meme number.",
      40000,
    );
  }

  /* ==========================================================
     DIGIT COUNTS
     ========================================================== */

  const counts = {};

  digits.forEach((d) => {
    counts[d] = (counts[d] || 0) + 1;
  });

  const maxCount = Math.max(0, ...Object.values(counts));

  if (maxCount >= 2) {
    addBadge(
      "🔁 Repeater",
      "At least one visible digit appears more than once.",
      5,
    );
  }

  if (maxCount >= 3) {
    addBadge(
      "🔥 Triple Digit",
      "A visible digit appears three or more times.",
      100,
    );
  }

  if (maxCount >= 4) {
    addBadge(
      "💥 Quad Digit",
      "A visible digit appears four or more times.",
      1000,
    );
  }

  if (maxCount >= 5) {
    addBadge(
      "☢️ Quint Digit",
      "The same visible digit appears at least five times.",
      10000,
    );
  }

  if (maxCount >= 6) {
    addBadge(
      "👹 Hex Digit",
      "One digit dominates the roll with six or more appearances.",
      100000,
    );
  }

  if (maxCount >= 7) {
    addBadge(
      "💀 Sept Digit",
      "Seven copies of the same digit appear.",
      1000000,
    );
  }

  if (maxCount >= 8) {
    addBadge("👑 Oct Digit", "Eight copies of one digit appear.", 10000000);
  }

  if (digits.length > 1 && new Set(digits).size === 1) {
    addBadge("👑 Monochrome", "Every visible digit is identical.", 1000000);
  }

  if (digits.length === 10 && new Set(digits).size === 10) {
    addBadge(
      "🌈 All Ten Digits",
      "Every digit from 0 through 9 appears exactly once.",
      3628800,
    );
  }

  /* ==========================================================
     DOUBLES / TRIPLES / QUADS
     ========================================================== */

  if (/00|11|22|33|44|55|66|77|88|99/.test(compact)) {
    addBadge(
      "👯 Double",
      "Two identical digits appear directly beside each other.",
      100,
    );
  }

  if (/000|111|222|333|444|555|666|777|888|999/.test(compact)) {
    addBadge(
      "🔥 Triple Stack",
      "Three identical digits appear consecutively.",
      1000,
    );
  }

  if (/0000|1111|2222|3333|4444|5555|6666|7777|8888|9999/.test(compact)) {
    addBadge(
      "💥 Quad Stack",
      "Four identical digits appear consecutively.",
      10000,
    );
  }

  /* ==========================================================
     RISING SEQUENCES
     ========================================================== */

  if (
    containsAny(compact, [
      "012",
      "123",
      "234",
      "345",
      "456",
      "567",
      "678",
      "789",
    ])
  ) {
    addBadge(
      "📈 Rising Sequence",
      "Three consecutive digits appear in ascending order.",
      100,
    );
  }

  if (
    containsAny(compact, [
      "0123",
      "1234",
      "2345",
      "3456",
      "4567",
      "5678",
      "6789",
    ])
  ) {
    addBadge(
      "🪜 Staircase",
      "Four consecutive digits climb steadily upward.",
      1000,
    );
  }

  if (
    containsAny(compact, ["01234", "12345", "23456", "34567", "45678", "56789"])
  ) {
    addBadge(
      "🚀 Mega Staircase",
      "Five consecutive digits rise steadily upward.",
      10000,
    );
  }

  if (
    containsAny(compact, ["012345", "123456", "234567", "345678", "456789"])
  ) {
    addBadge(
      "🌟 Ultra Staircase",
      "Six consecutive digits climb in perfect order.",
      100000,
    );
  }

  /* ==========================================================
     FALLING
     ========================================================== */

  if (
    containsAny(compact, [
      "987",
      "876",
      "765",
      "654",
      "543",
      "432",
      "321",
      "210",
    ])
  ) {
    addBadge(
      "📉 Falling Sequence",
      "Three consecutive digits appear in descending order.",
      100,
    );
  }

  if (
    containsAny(compact, [
      "9876",
      "8765",
      "7654",
      "6543",
      "5432",
      "4321",
      "3210",
    ])
  ) {
    addBadge(
      "🪜 Reverse Staircase",
      "Four consecutive digits descend steadily.",
      1000,
    );
  }

  if (
    containsAny(compact, ["98765", "87654", "76543", "65432", "54321", "43210"])
  ) {
    addBadge(
      "🚀 Mega Reverse Staircase",
      "Five consecutive digits fall steadily downward.",
      10000,
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
    "5678765",

    "012343210",
    "123454321",
  ];

  if (containsAny(compact, mountainPatterns)) {
    addBadge(
      "⛰️ Mountain",
      "Numbers rise to a peak in order, then fall back down.",
      10000,
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
    "7656789",
  ];

  if (containsAny(compact, valleyPatterns)) {
    addBadge(
      "🏞️ Valley",
      "Numbers fall to a low point in order, then rise again.",
      10000,
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
    "78987",
  ];

  if (containsAny(compact, wavePatterns)) {
    addBadge(
      "🌊 Wave",
      "The digits repeatedly rise and fall, creating a wave-like pattern.",
      15000,
    );
  }

  /* ==========================================================
     MIRRORS
     ========================================================== */

  let mirrorFound = false;

  for (let len = 3; len <= 8; len++) {
    for (let i = 0; i <= compact.length - len; i++) {
      const part = compact.slice(i, i + len);

      if (isPalindrome(part)) {
        addBadge(
          "🪞 Mirror",
          "A sequence reads the same forward and backward.",
          Math.pow(10, len),
        );

        mirrorFound = true;

        break;
      }
    }

    if (mirrorFound) break;
  }

  /* ==========================================================
     PERFECT MIRROR
     ========================================================== */

  if (compact.length >= 4 && compact === compact.split("").reverse().join("")) {
    addBadge(
      "🪞 Perfect Mirror",
      "The entire visible number reads identically forward and backward.",
      100000,
    );
  }

  /* ==========================================================
     ALTERNATORS
     ========================================================== */

  const alternatorPatterns = [
    "0101",
    "1212",
    "2323",
    "3434",
    "4545",
    "5656",
    "6767",
    "7878",
    "8989",

    "010101",
    "121212",
    "232323",
    "343434",
    "454545",
    "565656",
    "676767",
    "787878",
    "898989",
  ];

  if (containsAny(compact, alternatorPatterns)) {
    addBadge(
      "⚡ Alternator",
      "Two digits repeatedly alternate back and forth.",
      5000,
    );
  }

  /* ==========================================================
     LOOPS
     ========================================================== */

  const loopPatterns = [
    "0123456789",
    "1234567890",
    "9876543210",
    "0987654321",

    "012345678",
    "123456789",
    "234567890",
  ];

  if (containsAny(compact, loopPatterns)) {
    addBadge(
      "🔄 Digit Loop",
      "The digits travel through a long numeric cycle.",
      100000,
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
    "88988",
  ];

  if (containsAny(compact, pyramidPatterns)) {
    addBadge(
      "🔺 Pyramid",
      "Digits expand toward a center and then contract, creating a pyramid-like pattern.",
      20000,
    );
  }

  /* ==========================================================
     CENTERED DOUBLES / SYMMETRY
     ========================================================== */

  const centeredPatterns = [
    "1001",
    "1221",
    "1331",
    "1441",
    "1551",
    "1661",
    "1771",
    "1881",
    "1991",

    "2002",
    "2112",
    "2332",
    "2442",
    "2552",
    "2662",
    "2772",
    "2882",
    "2992",
  ];

  if (containsAny(compact, centeredPatterns)) {
    addBadge(
      "🎯 Centered",
      "Matching outer digits surround a centered pair.",
      10000,
    );
  }

  /* ==========================================================
     LONGEST SEQUENCES
     ========================================================== */

  const ascending = longestAscendingRun(digits);

  const descending = longestDescendingRun(digits);

  if (ascending >= 6) {
    addBadge(
      "🚀 Long Climb",
      "At least six digits form a continuous ascending sequence.",
      100000,
    );
  }

  if (descending >= 6) {
    addBadge(
      "🛰️ Long Descent",
      "At least six digits form a continuous descending sequence.",
      100000,
    );
  }

  /* ==========================================================
     REPEATED BLOCKS
     ========================================================== */

  let repeatedBlock = false;

  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i + len * 3 <= compact.length; i++) {
      const block = compact.slice(i, i + len);

      if (
        compact.slice(i + len, i + len * 2) === block &&
        compact.slice(i + len * 2, i + len * 3) === block
      ) {
        addBadge(
          "🔁 Looping Block",
          `The block "${block}" repeats three times in a row.`,
          Math.pow(10, len * 3),
        );

        repeatedBlock = true;

        break;
      }
    }

    if (repeatedBlock) break;
  }

  /* ==========================================================
     ARITHMETIC PATTERN
     ========================================================== */

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
      addBadge(
        "📐 Arithmetic Pattern",
        "The visible digits change by the same amount each step.",
        20000,
      );
    }
  }

  /* ==========================================================
     SECOND DIFFERENCE
     ========================================================== */

  if (digits.length >= 5) {
    const first = [];

    for (let i = 1; i < digits.length; i++) {
      first.push(Number(digits[i]) - Number(digits[i - 1]));
    }

    const second = [];

    for (let i = 1; i < first.length; i++) {
      second.push(first[i] - first[i - 1]);
    }

    if (
      second.length >= 3 &&
      second.every((x) => x === second[0]) &&
      second[0] !== 0
    ) {
      addBadge(
        "📊 Quadratic Pattern",
        "The changes themselves follow a consistent arithmetic pattern.",
        50000,
      );
    }
  }

  /* ==========================================================
     MULTIPLICATIVE-STYLE PATTERNS
     ========================================================== */

  if (digits.length >= 4) {
    let alternatingDouble = true;

    for (let i = 1; i < digits.length; i++) {
      const a = Number(digits[i - 1]);

      const b = Number(digits[i]);

      if (!((a * 2) % 10 === b || (a * 3) % 10 === b)) {
        alternatingDouble = false;

        break;
      }
    }

    if (alternatingDouble) {
      addBadge(
        "✖️ Multiplication Chain",
        "Each digit follows a repeating multiplication relationship.",
        50000,
      );
    }
  }

  /* ==========================================================
     PARITY
     ========================================================== */

  if (digits.length >= 5) {
    const parity = digits.map((d) => Number(d) % 2);

    if (parity.every((x) => x === parity[0])) {
      addBadge(
        "⚫⚪ Parity Chain",
        "Every visible digit has the same odd/even parity.",
        32,
      );
    }

    let alternatingParity = true;

    for (let i = 1; i < parity.length; i++) {
      if (parity[i] === parity[i - 1]) {
        alternatingParity = false;

        break;
      }
    }

    if (alternatingParity) {
      addBadge(
        "⚡ Odd/Even Alternator",
        "Odd and even digits alternate throughout the visible sequence.",
        100,
      );
    }
  }

  /* ==========================================================
     SUM PATTERNS
     ========================================================== */

  if (digits.length >= 4) {
    const sum = digits.reduce((a, b) => a + Number(b), 0);

    if (sum === 42) {
      addBadge(
        "🌌 Sum of 42",
        "The visible digits add up to the famous number 42.",
        5000,
      );
    }

    if (sum === 55) {
      addBadge(
        "⚔️ Sum of 55",
        "The visible digits add up to 55 — another Kingsammelot connection.",
        6000,
      );
    }

    if (sum === 67) {
      addBadge("🔢 Sum of 67", "The visible digits add up to 67.", 7000);
    }
  }

  /* ==========================================================
     DIGITAL ROOT
     ========================================================== */

  if (digits.length >= 3) {
    const sum = digits.reduce((a, b) => a + Number(b), 0);

    const digitalRoot = sum === 0 ? 0 : 1 + ((sum - 1) % 9);

    if (digitalRoot === 7) {
      addBadge(
        "🍀 Lucky Root",
        "The visible digits have a digital root of 7.",
        1000,
      );
    }
  }

  /* ==========================================================
     SQUARES
     ========================================================== */

  const squarePatterns = [
    "149",
    "169",
    "196",
    "256",
    "361",
    "441",
    "529",
    "625",
    "729",
    "841",

    "144",
    "121",
    "100",
  ];

  if (containsAny(compact, squarePatterns)) {
    addBadge(
      "🧮 Math Pattern",
      "A recognizable mathematical square pattern appears inside the roll.",
      12000,
    );
  }

  /* ==========================================================
     PRIME DIGITS
     ========================================================== */

  if (digits.length >= 5) {
    const primeDigits = digits.filter((d) => ["2", "3", "5", "7"].includes(d));

    if (primeDigits.length === digits.length) {
      addBadge(
        "🔬 Prime Chain",
        "Every visible digit is a prime digit: 2, 3, 5, or 7.",
        5000,
      );
    }
  }

  /* ==========================================================
     ALL SAME PARITY
     ========================================================== */

  if (digits.length >= 5 && digits.every((d) => Number(d) % 2 === 0)) {
    addBadge("🟦 Even Storm", "Every visible digit is even.", 32);
  }

  if (digits.length >= 5 && digits.every((d) => Number(d) % 2 === 1)) {
    addBadge("🟥 Odd Storm", "Every visible digit is odd.", 32);
  }

  /* ==========================================================
     PERFECT 7s
     ========================================================== */

  if (compact.includes("777")) {
    addBadge(
      "🎰 JACKPOT 777",
      "Three consecutive 7s create the ultimate lucky slot pattern.",
      1000000,
    );
  }

  if (compact.includes("7777")) {
    addBadge(
      "💎 SUPER JACKPOT",
      "Four consecutive 7s appear in the roll.",
      10000000,
    );
  }

  /* ==========================================================
     SPECIAL 67 / 55
     ========================================================== */

  if (compact.includes("6767")) {
    addBadge(
      "🔥 Double 67",
      "The 67 reference appears twice in a repeating pattern.",
      100000,
    );
  }

  if (compact.includes("5555")) {
    addBadge(
      "⚔️ Kingsammelot MAX",
      "Four 5s appear together — an extreme 55/Kingsammelot pattern.",
      100000,
    );
  }

  /* ==========================================================
     SORT BADGES
     ========================================================== */

  badges.sort((a, b) => Number(a.oneIn) - Number(b.oneIn));

  /* ==========================================================
     BADGE CHANCE
     ========================================================== */

  let badgeChance = 1;

  for (const badge of badges) {
    badgeChance *= Number(badge.oneIn);

    if (badgeChance > 1e100) {
      badgeChance = 1e100;

      break;
    }
  }

  const blanks = chars.filter((x) => x === "_").length;

  const blankMultiplier = Math.pow(10, blanks);

  const totalChance = badgeChance * blankMultiplier;

  /* ==========================================================
     RARITY
     ========================================================== */

  let rarity = "NOVICE";

  // More granular tiers below the old COMMON range.
  if (totalChance >= 10) {
    rarity = "PLAIN";
  }

  if (totalChance >= 100) {
    rarity = "BASIC";
  }

  if (totalChance >= 1000) {
    rarity = "COMMON";
  }

  if (badges.length || blanks >= 1) {
    rarity = totalChance >= 10000 ? "UNCOMMON" : rarity;
  }

  if (totalChance >= 100000) {
    rarity = "RARE";
  }

  if (totalChance >= 10000000) {
    rarity = "EPIC";
  }

  if (totalChance >= 1000000000) {
    rarity = "LEGENDARY";
  }

  if (totalChance >= 1000000000000) {
    rarity = "MYTHIC";
  }

  if (totalChance >= 1000000000000000) {
    rarity = "DIVINE";
  }

  if (totalChance >= 1000000000000000000) {
    rarity = "TRANSCENDENT";
  }

  if (totalChance >= 1e21) {
    rarity = "CELESTIAL";
  }

  if (totalChance >= 1e24) {
    rarity = "ASCENDED";
  }

  if (totalChance >= 1e27) {
    rarity = "OMNIPOTENT";
  }

  if (totalChance >= 1e30) {
    rarity = "INFINITE";
  }

  if (totalChance >= 1e33) {
    rarity = "BEYOND";
  }

  if (totalChance >= 1e36) {
    rarity = "ABSOLUTE";
  }

  if (totalChance >= 1e40) {
    rarity = "???";
  }

  /* ==========================================================
     XP
     ========================================================== */

  /* ==========================================================
     XP — ~5% OF THE ROLL'S "1 IN X" RARITY
     ========================================================== */

  // The roll's XP is tied directly to its final rarity.
  // Example: 1 in 100 = about 5 XP, 1 in 1,000 = about 50 XP,
  // 1 in 1,000,000 = about 50,000 XP.
  // This makes rarer rolls dramatically more rewarding.
  /* ==========================================================
     XP
     Stable rarity-based XP curve:
     XP = 5 × sqrt(1 in X)

     This keeps common rolls from exploding in XP while still
     giving dramatically better rewards for extremely rare rolls.
     ========================================================== */
  const rarityBase = Math.max(1, Number(totalChance) || 1);
  const xp = Math.max(5, Math.round(5 * Math.sqrt(rarityBase)));

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

    saveShopState();
    if (Number.isFinite(xpBalance)) {
      localStorage.setItem("digitRollXPBalance", String(xpBalance));
    }
  } catch (e) {
    console.warn("Local save unavailable", e);
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
  if (!$("history")) return;

  $("historyCount").textContent =
    history.length + (history.length === 1 ? " roll" : " rolls");

  if (!history.length) {
    $("history").innerHTML = '<span class="empty">No rolls yet.</span>';

    return;
  }

  $("history").innerHTML = history
    .slice(0, 30)
    .map(
      (x) => `

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

      `,
    )
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
   BADGE MODAL
   ============================================================ */

function showBadgeInfo(name, explanation, oneIn) {
  $("badgeModalName").textContent = name;

  $("badgeModalExplanation").textContent = explanation;

  $("badgeModalChance").textContent =
    "Badge chance: 1 in " + Number(oneIn).toLocaleString();

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

let authMode = "login";

function openAuth() {
  $("authModal").classList.add("open");
}

function closeAuth() {
  $("authModal").classList.remove("open");
}

window.closeAuth = closeAuth;

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

  if (msg.toLowerCase().includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your email, then try logging in again.";
  }

  if (msg.toLowerCase().includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (msg.toLowerCase().includes("user already registered")) {
    return "That email already has an account. Try logging in.";
  }

  return msg;
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
  window.currentLeaderboardRows = rows;

  const totalXP = rows.reduce((sum, row) => sum + Number(row.xp || 0), 0);

  if (!Number.isFinite(xpBalance)) {
    xpBalance = clampXP(totalXP - xpSpent);
    localStorage.setItem("digitRollXPBalance", String(xpBalance));
  }

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
   USERNAME
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
   CLOUD SAVE
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

    player_id: currentUser.id,

    player_name: username,

    badges: result.badges.map((b) => b.name),
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
    .select(
      "id,roll,rarity,one_in,shown,xp,player_id,player_name,badges,created_at",
    )
    .order("one_in", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error("Leaderboard error:", error);

    $("globalRows").innerHTML = `<span class="empty">
        Leaderboard unavailable:
        ${escapeHTML(error.message)}
      </span>`;

    return;
  }

  const rows = data || [];

  if (!rows.length) {
    $("globalRows").innerHTML =
      '<span class="empty">No global rolls yet.</span>';

    $("todayBest").textContent = "—";

    $("allBest").textContent = "—";

    return;
  }

  const best = rows[0];

  $("allBest").textContent = best.roll;

  $("allBestMeta").textContent =
    `${best.player_name || "Player"} • ${best.rarity} • ${fmt(best.one_in)}`;

  applyRarityColor($("allBestMeta"), best.rarity);

  const todayStart = new Date();

  todayStart.setHours(0, 0, 0, 0);

  const todayRows = rows.filter((x) => new Date(x.created_at) >= todayStart);

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

        <button
          class="globalRow leaderboardClickable"
          type="button"
          onclick="showLeaderboardPlayerByIndex(${index})"
          title="Click to view this roll's badges"
        >

          <div class="rank">
            #${index + 1}
          </div>

          <div>

            <div class="globalPlayer">
              ${escapeHTML(row.player_name || "Player")}
            </div>

            <div class="small">
              ${escapeHTML(
                row.created_at ? new Date(row.created_at).toLocaleString() : "",
              )}
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

            <div class="small leaderboardBadgeHint">
              ${Array.isArray(row.badges) && row.badges.length ? `🏅 ${row.badges.length} badge${row.badges.length === 1 ? "" : "s"}` : "No badges"}
            </div>

          </div>

        </button>

      `,
    )
    .join("");
}

/* ============================================================
   LEADERBOARD BADGE VIEWER
   ============================================================ */

function ensureLeaderboardBadgeModal() {
  if ($("leaderboardBadgeModal")) return;

  const style = document.createElement("style");
  style.id = "leaderboardBadgeViewerStyles";
  style.textContent = `
    .leaderboardClickable {
      width: 100%;
      border: 0;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: transform .16s ease, filter .16s ease, background .16s ease;
    }

    .leaderboardClickable:hover {
      transform: translateY(-2px);
      filter: brightness(1.08);
    }

    .leaderboardClickable:focus-visible {
      outline: 2px solid #8ee6ad;
      outline-offset: 2px;
    }

    .leaderboardBadgeHint {
      color: #8ee6ad;
      margin-top: 3px;
    }

    .leaderboardBadgeModal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(10px);
    }

    .leaderboardBadgeModal.open {
      display: flex;
    }

    .leaderboardBadgeCard {
      width: min(620px, 100%);
      max-height: min(760px, 90vh);
      overflow: auto;
      padding: 26px;
      border-radius: 22px;
      background: rgba(19,24,35,.96);
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 24px 80px rgba(0,0,0,.55);
    }

    .leaderboardBadgeHeader {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
    }

    .leaderboardBadgeTitle {
      font-size: 25px;
      font-weight: 850;
    }

    .leaderboardBadgeSubtitle {
      margin-top: 5px;
      color: #aab5ca;
      font-size: 14px;
    }

    .leaderboardBadgeClose {
      border: 0;
      background: rgba(255,255,255,.08);
      color: #fff;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 20px;
    }

    .leaderboardBadgeList {
      display: grid;
      gap: 10px;
    }

    .leaderboardBadgeItem {
      padding: 14px 16px;
      border-radius: 14px;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(255,255,255,.08);
    }

    .leaderboardBadgeItemName {
      font-weight: 800;
      font-size: 16px;
    }

    .leaderboardBadgeEmpty {
      color: #aab5ca;
      padding: 20px;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "leaderboardBadgeModal";
  modal.className = "leaderboardBadgeModal";
  modal.innerHTML = `
    <div class="leaderboardBadgeCard" role="dialog" aria-modal="true" aria-labelledby="leaderboardBadgeTitle">
      <div class="leaderboardBadgeHeader">
        <div>
          <div id="leaderboardBadgeTitle" class="leaderboardBadgeTitle">Player Badges</div>
          <div id="leaderboardBadgeSubtitle" class="leaderboardBadgeSubtitle"></div>
        </div>
        <button class="leaderboardBadgeClose" type="button" aria-label="Close" onclick="closeLeaderboardPlayer()">×</button>
      </div>
      <div id="leaderboardBadgeList" class="leaderboardBadgeList"></div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeLeaderboardPlayer();
  });

  document.body.appendChild(modal);
}

function showLeaderboardPlayerByIndex(index) {
  const rows = Array.isArray(window.currentLeaderboardRows)
    ? window.currentLeaderboardRows
    : [];

  const row = rows[index];
  if (!row) return;

  showLeaderboardPlayer(row);
}

function showLeaderboardPlayer(row) {
  ensureLeaderboardBadgeModal();

  const badges = Array.isArray(row?.badges) ? row.badges : [];
  const name = row?.player_name || "Player";

  $("leaderboardBadgeTitle").textContent = `${name}'s Badges`;
  $("leaderboardBadgeSubtitle").textContent =
    `${row?.roll || "—"} • ${row?.rarity || "COMMON"} • ${fmt(row?.one_in || 1)}`;

  const list = $("leaderboardBadgeList");

  if (!badges.length) {
    list.innerHTML =
      '<div class="leaderboardBadgeEmpty">This roll had no badges.</div>';
  } else {
    list.innerHTML = badges
      .map(
        (badge, index) => `
        <div class="leaderboardBadgeItem">
          <div class="leaderboardBadgeItemName">🏅 ${index + 1}. ${escapeHTML(badge)}</div>
        </div>
      `,
      )
      .join("");
  }

  $("leaderboardBadgeModal").classList.add("open");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLeaderboardPlayer();
  }
});

function closeLeaderboardPlayer() {
  const modal = $("leaderboardBadgeModal");
  if (modal) modal.classList.remove("open");
}

window.showLeaderboardPlayer = showLeaderboardPlayer;
window.closeLeaderboardPlayer = closeLeaderboardPlayer;

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLeaderboardPlayer();
});

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
    '<span class="empty">The number is being generated...</span>';

  $("number").classList.add("rolling");

  applyRarityColor($("liveRarity"), "COMMON");

  applyRarityColor($("rarity"), "COMMON");

  applyRarityColor($("number"), "COMMON");

  const finalChars = randomRoll();

  const visible = Array(finalChars.length).fill("?");

  let i = 0;

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      visible[i] = finalChars[i];

      $("number").textContent = visible.join("");

      i++;

      if (i >= finalChars.length) {
        clearInterval(timer);

        resolve();
      }
    }, 900);
  });

  $("number").classList.remove("rolling");

  const analysis = analyze(finalChars);

  applyGuaranteedBadges(analysis);
  const usedCharmBonus = consumeCharm();
  const usedNumberCharms = consumeNumberCharms();
  if (usedCharmBonus) saveShopState();
  xpBalance = clampXP(getXPBalance() + Number(analysis.xp || 0));
  localStorage.setItem("digitRollXPBalance", String(xpBalance));
  await syncXPWallet();

  const roll = finalChars.join("");

  const result = {
    roll,

    ...analysis,

    time: Date.now(),
  };

  /* ==========================================================
     BADGE REVEAL
     ========================================================== */

  const badges = analysis.badges;

  const focusMs = badges.length
    ? Math.max(1000, Math.min(10000, Math.round(10000 / badges.length)))
    : 3000;

  $("rollLabel").textContent = badges.length
    ? "ANALYZING BADGES..."
    : "NO BADGES FOUND...";

  $("liveRarity").textContent = "RARITY: ???";

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
                  ${Number(b.oneIn)}
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
                  style="
                    margin-top:9px;
                    color:#8ee6ad;
                    font-weight:750
                  "
                >
                  Badge chance:
                  1 in
                  ${Number(b.oneIn).toLocaleString()}
                </div>

                <div
                  class="small"
                  style="margin-top:7px"
                >
                  Click to view this badge again
                </div>

                <div
                  class="small"
                  style="margin-top:4px"
                >
                  Badge
                  ${bIndex + 1}
                  of
                  ${badges.length}
                  • Blank bonus ×
                  ${analysis.blankMultiplier.toLocaleString()}
                </div>

              </button>

            `;

        bIndex++;

        setTimeout(revealBadge, focusMs);
      } else {
        resolve();
      }
    };

    setTimeout(revealBadge, 450);
  });

  /* ==========================================================
     FINAL RESULT
     ========================================================== */

  $("rollLabel").textContent = "FINAL RESULT";

  $("liveRarity").textContent = "RARITY: " + analysis.rarity;

  $("rarity").textContent = analysis.rarity;

  $("chance").textContent = fmt(analysis.oneIn);

  $("shown").textContent = analysis.shown + "/" + getRollLength();

  $("blankBonus").textContent = "×" + analysis.blankMultiplier.toLocaleString();

  $("xp").textContent = "+" + analysis.xp;

  updateShopUI();

  applyRarityColor($("liveRarity"), analysis.rarity);

  applyRarityColor($("rarity"), analysis.rarity);

  applyRarityColor($("number"), analysis.rarity);

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
              ${Number(b.oneIn)}
            )'
          >
            ${escapeHTML(b.name)}
          </button>

        `,
      )
      .join("");
  }

  /* ==========================================================
     LOCAL HISTORY
     ========================================================== */

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

  /* ==========================================================
     CLOUD
     ========================================================== */

  if (currentUser) {
    await saveCloudRoll(result);

    await loadPersonalStats();

    await loadLeaderboard();
  }

  $("rollBtn").disabled = false;

  rolling = false;
}

/* ============================================================
   BUTTONS
   ============================================================ */

$("rollBtn").onclick = performRoll;

$("profileButton").onclick = () => {
  $("profileSection").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

$("logoutButton").onclick = async () => {
  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.error(error);
  }
};

$("refreshLeaderboard").onclick = async () => {
  $("refreshLeaderboard").disabled = true;

  await loadLeaderboard();

  $("refreshLeaderboard").disabled = false;

  toast("Leaderboard refreshed.");
};

/* ============================================================
   AUTH STATE
   ============================================================ */

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth state:", event);

  if (session?.user) {
    currentUser = session.user;

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
});

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  loadLocal();

  ensureShopUI();

  updateAccountUI();

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

  await loadLeaderboard();

  setupRealtime();
}

/* ============================================================
   START
   ============================================================ */

init();
