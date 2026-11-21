/* ============================================================
   DIGIT ROLL — SOCIAL
   Multiple leaderboards, player profile pages, titles + name effects
   for everyone, cloud profile sync, share card.
   Loaded after features2.js. Cloud features need features-setup.sql.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const $id = (id) => document.getElementById(id);
  const n = (v) => Number(v || 0).toLocaleString();
  const esc = (s) =>
    typeof escapeHTML === "function"
      ? escapeHTML(String(s))
      : String(s).replace(
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
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const FX_OK = ["glow", "pulse", "sparkle", "glitch", "aura"];

  const me = () => (typeof currentUser !== "undefined" ? currentUser : null);
  const ownTitle = () =>
    typeof G.drGetTitle === "function" ? G.drGetTitle() : "";
  const ownFx = () =>
    typeof G.drGetNameFx === "function" ? G.drGetNameFx() : "";
  const ownBadges = () =>
    typeof getUnlockedBadgeNames === "function"
      ? getUnlockedBadgeNames().size
      : 0;

  /* ==========================================================
     PROFILE CACHE + NAME DISPLAY (titles and name effects)
     ========================================================== */

  const cache = new Map(); // id -> { title, fx, badges }

  const baseNameHTML = G.drNameHTML;
  const baseLoadRebirths = G.drLoadRebirths;

  G.drNameHTML = function (row) {
    const base =
      typeof baseNameHTML === "function"
        ? baseNameHTML(row)
        : esc(row.player_name || "Player");
    const isMe = me() && row.player_id === me().id;
    const info = isMe
      ? { title: ownTitle(), fx: ownFx() }
      : cache.get(row.player_id) || {};
    const fx = FX_OK.includes(info.fx) ? info.fx : "";
    const name = fx ? `<span class="drNm drNm-${fx}">${base}</span>` : base;
    const title = info.title
      ? `<span class="drTitleTag">${esc(info.title)}</span> `
      : "";
    return title + name;
  };

  G.drLoadRebirths = async function (rows) {
    if (typeof baseLoadRebirths === "function") await baseLoadRebirths(rows);
    if (noCols) return;
    try {
      const ids = [
        ...new Set((rows || []).map((r) => r.player_id).filter(Boolean)),
      ];
      if (!ids.length) return;
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("id,title,name_fx,badge_count")
        .in("id", ids);
      if (error) {
        if (/column|does not exist/i.test(error.message || "")) noCols = true;
        return;
      }
      (data || []).forEach((p) =>
        cache.set(p.id, {
          title: p.title || "",
          fx: p.name_fx || "",
          badges: Number(p.badge_count) || 0,
        }),
      );
    } catch (e) {}
  };

  /* ==========================================================
     CLOUD PROFILE SYNC (title, name effect, badge count)
     ========================================================== */

  let noCols = false;
  let lastPushed = "";
  let pushTimer = 0;

  async function pushNow() {
    const u = me();
    if (!u || noCols) return;
    const payload = {
      title: ownTitle(),
      name_fx: ownFx(),
      badge_count: ownBadges(),
    };
    const key = u.id + JSON.stringify(payload);
    if (key === lastPushed) return;
    try {
      const { error } = await supabaseClient
        .from("profiles")
        .update(payload)
        .eq("id", u.id);
      if (error) {
        if (/column|does not exist/i.test(error.message || "")) noCols = true;
        return;
      }
      lastPushed = key;
    } catch (e) {}
  }
  G.drPushProfile = function () {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 1500);
  };
  setInterval(pushNow, 8000);
  setTimeout(pushNow, 3000);

  /* ==========================================================
     LEADERBOARD TABS
     ========================================================== */

  let lbTab = "daily";
  const TABS = [
    ["daily", "📅 Daily"],
    ["top", "🏆 All-time"],
    ["rebirths", "🔄 Most rebirths"],
    ["badges", "🏅 Most badges"],
    ["week", "🗓️ This week"],
  ];

  function injectCSS() {
    if ($id("socCSS")) return;
    const st = document.createElement("style");
    st.id = "socCSS";
    st.textContent = `
      .drLbTabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}
      .drLbTab{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;padding:8px 13px;border-radius:11px;cursor:pointer;font-weight:800;font-size:13px}
      .drLbTab.on{background:rgba(142,230,173,.18);border-color:rgba(142,230,173,.5)}
      .drTitleTag{display:inline-block;font-size:.72em;font-weight:900;letter-spacing:.04em;padding:1px 7px;border-radius:999px;background:rgba(250,204,21,.16);color:#fde68a;border:1px solid rgba(250,204,21,.35);vertical-align:middle}
      .globalPlayer{cursor:pointer}
      .globalPlayer:hover{text-decoration:underline dotted}
      .drProfOv{position:fixed;inset:0;z-index:10050;display:none;padding:30px 18px;overflow:auto;background:rgba(0,0,0,.76);backdrop-filter:blur(12px)}
      .drProfOv.open{display:block}
      .drProf{width:min(560px,100%);margin:60px auto;background:rgba(18,23,34,.98);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:26px;color:#fff;box-shadow:0 30px 100px rgba(0,0,0,.55)}
      .drProf h2{margin:0 0 4px;font-size:28px}
      .drProfGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:16px}
      .drProfTile{padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
      .drProfTile span{display:block;color:#aab5ca;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
      .drProfTile b{display:block;font-size:20px;margin-top:3px;word-break:break-word}
      .drShareBtn{margin-top:12px;width:100%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:11px;font-weight:800;cursor:pointer}
      .drShareBtn:disabled{opacity:.45;cursor:not-allowed}
    `;
    document.head.appendChild(st);
  }

  function ensureTabs() {
    injectCSS();
    const rows = $id("globalRows");
    if (!rows || $id("drLbTabs")) return;
    const bar = document.createElement("div");
    bar.id = "drLbTabs";
    bar.className = "drLbTabs";
    bar.innerHTML = TABS.map(
      ([k, l]) =>
        `<button type="button" class="drLbTab ${k === lbTab ? "on" : ""}" data-k="${k}">${l}</button>`,
    ).join("");
    rows.parentNode.insertBefore(bar, rows);
    bar.querySelectorAll(".drLbTab").forEach((b) => {
      b.onclick = async () => {
        lbTab = b.dataset.k;
        bar
          .querySelectorAll(".drLbTab")
          .forEach((x) => x.classList.toggle("on", x === b));
        if (typeof G.drSfx === "function") G.drSfx("click");
        if (lbTab === "top") await G.loadLeaderboard();
        else await renderAlt();
      };
    });
  }

  const SETUP_MSG =
    '<span class="empty">This leaderboard needs the database update (features-setup.sql).</span>';

  function profileRow(p, i, value, label) {
    const nm = G.drNameHTML({
      player_name: p.username || "Player",
      player_id: p.id,
    });
    return `<button class="globalRow leaderboardClickable" type="button" data-pid="${esc(p.id)}" style="grid-template-columns:60px 1fr auto">
      <div class="rank">#${i + 1}</div>
      <div><div class="globalPlayer">${nm}</div></div>
      <div class="globalRoll" style="text-align:right">${esc(value)}<div class="small">${esc(label)}</div></div></button>`;
  }

  async function renderAlt() {
    const box = $id("globalRows");
    if (!box || lbTab === "top") return;
    box.innerHTML = '<span class="empty">Loading…</span>';
    const mine = lbTab;
    try {
      if (mine === "week" || mine === "daily") {
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        const since = (
          mine === "daily" ? midnight : new Date(Date.now() - 7 * 86400000)
        ).toISOString();
        const { data, error } = await supabaseClient
          .from("rolls")
          .select(
            "id,roll,rarity,one_in,shown,xp,player_id,player_name,badges,created_at",
          )
          .gte("created_at", since)
          .order("one_in", { ascending: false })
          .limit(10);
        if (lbTab !== mine) return;
        if (error)
          return void (box.innerHTML = `<span class="empty">${esc(error.message)}</span>`);
        const rows = data || [];
        window.currentLeaderboardRows = rows;
        if (typeof G.drLoadRebirths === "function")
          await G.drLoadRebirths(rows);
        box.innerHTML =
          rows
            .map(
              (
                r,
                i,
              ) => `<button class="globalRow leaderboardClickable" type="button" onclick="showLeaderboardPlayerByIndex(${i})">
              <div class="rank">#${i + 1}</div>
              <div><div class="globalPlayer">${G.drNameHTML(r)}</div><div class="small">${esc(new Date(r.created_at).toLocaleString())}</div></div>
              <div class="globalRoll">${esc(r.roll)}</div>
              <div><div class="rarity ${rarityClass(r.rarity)}">${esc(r.rarity)}</div><div class="small">${fmt(r.one_in)}</div></div></button>`,
            )
            .join("") ||
          (mine === "daily"
            ? '<span class="empty">No rolls today yet — be the first!</span>'
            : '<span class="empty">No rolls this week yet.</span>');
        return;
      }
      const col = mine === "rebirths" ? "rebirths" : "badge_count";
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("id,username," + col + ",title,name_fx")
        .gt(col, 0)
        .order(col, { ascending: false })
        .limit(10);
      if (lbTab !== mine) return;
      if (error) {
        box.innerHTML = /column|does not exist/i.test(error.message || "")
          ? SETUP_MSG
          : `<span class="empty">${esc(error.message)}</span>`;
        return;
      }
      (data || []).forEach((p) =>
        cache.set(p.id, {
          title: p.title || "",
          fx: p.name_fx || "",
          badges: Number(p.badge_count) || 0,
        }),
      );
      if (typeof baseLoadRebirths === "function")
        await baseLoadRebirths((data || []).map((p) => ({ player_id: p.id })));
      box.innerHTML =
        (data || [])
          .map((p, i) =>
            profileRow(
              p,
              i,
              n(p[col]),
              mine === "rebirths" ? "rebirths" : "badges",
            ),
          )
          .join("") ||
        '<span class="empty">Nobody here yet — be the first!</span>';
    } catch (e) {
      box.innerHTML = '<span class="empty">Leaderboard unavailable.</span>';
    }
  }

  /* wrap the original loader so the chosen tab survives refreshes */
  const baseLoadLeaderboard = G.loadLeaderboard;
  G.loadLeaderboard = async function () {
    ensureTabs();
    await baseLoadLeaderboard();
    if (lbTab !== "top") await renderAlt();
  };

  /* clicking a name opens that player's profile */
  document.addEventListener(
    "click",
    (e) => {
      const nameEl = e.target.closest && e.target.closest(".globalPlayer");
      if (!nameEl || !$id("globalRows") || !$id("globalRows").contains(nameEl))
        return;
      const btn = nameEl.closest("button");
      if (!btn) return;
      let pid = btn.dataset.pid;
      if (!pid) {
        const idx = Array.from(
          $id("globalRows").querySelectorAll(":scope > button"),
        ).indexOf(btn);
        const row = (window.currentLeaderboardRows || [])[idx];
        pid = row && row.player_id;
      }
      if (!pid) return;
      e.stopPropagation();
      e.preventDefault();
      openProfile(pid);
    },
    true,
  );

  /* ==========================================================
     PROFILE PAGE
     ========================================================== */

  function ensureProfileOverlay() {
    injectCSS();
    let ov = $id("drProfOv");
    if (ov) return ov;
    ov = document.createElement("div");
    ov.id = "drProfOv";
    ov.className = "drProfOv";
    ov.innerHTML =
      '<div class="drProf" role="dialog" aria-modal="true"><div id="drProfBody"></div><button class="drShareBtn" id="drProfClose" type="button">Close</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.classList.remove("open");
    });
    $id("drProfClose").onclick = () => ov.classList.remove("open");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") ov.classList.remove("open");
    });
    return ov;
  }

  async function openProfile(pid) {
    const ov = ensureProfileOverlay();
    const body = $id("drProfBody");
    body.innerHTML = '<p style="color:#aab5ca">Loading profile…</p>';
    ov.classList.add("open");
    const isMe = me() && me().id === pid;
    let prof = {
      username: "Player",
      rebirths: 0,
      badge_count: 0,
      title: "",
      name_fx: "",
    };
    let best = null;
    let total = null;
    try {
      let r = await supabaseClient
        .from("profiles")
        .select("id,username,rebirths,badge_count,title,name_fx")
        .eq("id", pid)
        .maybeSingle();
      if (r.error)
        r = await supabaseClient
          .from("profiles")
          .select("id,username,rebirths")
          .eq("id", pid)
          .maybeSingle();
      if (r.data) prof = Object.assign(prof, r.data);
    } catch (e) {}
    try {
      const b = await supabaseClient
        .from("rolls")
        .select("roll,rarity,one_in,badges,player_name")
        .eq("player_id", pid)
        .order("one_in", { ascending: false })
        .limit(1);
      best = b.data && b.data[0];
      if (best && prof.username === "Player" && best.player_name)
        prof.username = best.player_name;
      const c = await supabaseClient
        .from("rolls")
        .select("id", { count: "exact", head: true })
        .eq("player_id", pid);
      total = c.count;
    } catch (e) {}

    const rebirths =
      isMe && G.__drShop ? G.__drShop.S.rebirths : Number(prof.rebirths) || 0;
    const badges = isMe ? ownBadges() : Number(prof.badge_count) || 0;
    const catalog =
      typeof staticBadgeCatalog !== "undefined"
        ? Object.keys(staticBadgeCatalog).length
        : 0;
    cache.set(pid, {
      title: isMe ? ownTitle() : prof.title || "",
      fx: isMe ? ownFx() : prof.name_fx || "",
      badges,
    });
    const nameHTML = G.drNameHTML({
      player_name: prof.username,
      player_id: pid,
    });
    const tile = (l, v) =>
      `<div class="drProfTile"><span>${l}</span><b>${v}</b></div>`;
    body.innerHTML = `<h2>${nameHTML}</h2>
      <div style="color:#aab5ca">${isMe ? "This is you" : "Player profile"}</div>
      <div class="drProfGrid">
        ${tile("Rebirths", n(rebirths))}
        ${tile("Badges", catalog ? `${n(badges)} / ${n(catalog)}` : n(badges))}
        ${tile("Completion", catalog ? Math.min(100, (badges / catalog) * 100).toFixed(1) + "%" : "—")}
        ${tile("Rolls on leaderboard", total == null ? "—" : n(total))}
        <div class="drProfTile" style="grid-column:1/-1"><span>Rarest roll</span><b>${best ? `${esc(best.roll)} <span class="rarity ${rarityClass(best.rarity)}" style="font-size:14px">${esc(best.rarity)}</span>` : "—"}</b>${best ? `<div class="small" style="color:#aab5ca">1 in ${n(best.one_in)}${Array.isArray(best.badges) && best.badges.length ? " • 🏅 " + best.badges.length + " badges" : ""}</div>` : ""}</div>
      </div>`;
  }
  G.drOpenProfile = openProfile;

  /* ==========================================================
     SHARE CARD
     ========================================================== */

  const TIER_COLORS = [
    "#94a3b8",
    "#94a3b8",
    "#a3b18a",
    "#cbd5e1",
    "#4ade80",
    "#38bdf8",
    "#a855f7",
    "#fbbf24",
    "#f87171",
    "#f0abfc",
    "#67e8f9",
    "#818cf8",
    "#fb7185",
    "#facc15",
    "#e879f9",
    "#22d3ee",
    "#ffffff",
    "#ffffff",
  ];

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function makeCard(e) {
    const W = 1200,
      H = 630;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d");
    const tiers = G.drProgress ? G.drProgress.TIERS : [];
    const color = TIER_COLORS[Math.max(0, tiers.indexOf(e.k))] || "#a855f7";

    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b1020");
    bg.addColorStop(1, "#1b1440");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W / 2, 300, 20, W / 2, 300, 520);
    glow.addColorStop(0, color + "55");
    glow.addColorStop(1, "transparent");
    c.fillStyle = glow;
    c.fillRect(0, 0, W, H);

    c.strokeStyle = color;
    c.lineWidth = 4;
    roundRect(c, 30, 30, W - 60, H - 60, 28);
    c.stroke();

    c.textAlign = "center";
    c.fillStyle = "#aab5ca";
    c.font = "700 30px system-ui, sans-serif";
    c.fillText("🎲 DIGIT ROLL", W / 2, 100);

    const digits = String(e.r);
    let fs = 170;
    c.font = `900 ${fs}px system-ui, sans-serif`;
    while (c.measureText(digits).width > W - 160 && fs > 50) {
      fs -= 6;
      c.font = `900 ${fs}px system-ui, sans-serif`;
    }
    c.shadowColor = color;
    c.shadowBlur = 40;
    c.fillStyle = "#fff";
    c.fillText(digits, W / 2, 300);
    c.shadowBlur = 0;

    c.fillStyle = color;
    c.font = "900 54px system-ui, sans-serif";
    c.fillText(String(e.k), W / 2, 390);
    c.fillStyle = "#e5e7eb";
    c.font = "700 34px system-ui, sans-serif";
    c.fillText("1 in " + Number(e.o).toLocaleString(), W / 2, 442);

    const names = (e.b || []).slice(0, 4).join("   •   ");
    if (names) {
      c.fillStyle = "#aab5ca";
      c.font = "600 26px system-ui, sans-serif";
      let t = names;
      while (c.measureText(t).width > W - 140 && t.length > 6)
        t = t.slice(0, -2);
      c.fillText(t === names ? t : t + "…", W / 2, 500);
    }
    const uname =
      (typeof profile !== "undefined" && profile && profile.username) ||
      (me() && me().user_metadata && me().user_metadata.username) ||
      "";
    c.fillStyle = "#6b7790";
    c.font = "600 24px system-ui, sans-serif";
    c.fillText(
      (uname ? uname + " • " : "") +
        new Date(e.t || Date.now()).toLocaleDateString(),
      W / 2,
      566,
    );
    return cv;
  }

  G.drShareRoll = function (e) {
    if (!e) return;
    const cv = makeCard(e);
    cv.toBlob(async (blob) => {
      if (!blob) return say("Couldn't create the share card.");
      const file = new File([blob], "digit-roll-" + e.r + ".png", {
        type: "image/png",
      });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Digit Roll",
            text: `I rolled ${e.r} (${e.k}, 1 in ${Number(e.o).toLocaleString()})!`,
          });
          return;
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      say("📤 Share card downloaded.");
    }, "image/png");
  };

  /* "Share last roll" button under the roll stats */
  function ensureShareButton() {
    injectCSS();
    if ($id("drShareLast")) return;
    const xp = $id("xp");
    const card = xp && xp.closest(".statCard");
    const grid = card && card.parentElement;
    if (!grid) return;
    const b = document.createElement("button");
    b.id = "drShareLast";
    b.type = "button";
    b.className = "drShareBtn";
    b.textContent = "📤 Share last roll";
    b.disabled = true;
    b.onclick = () => {
      const h = typeof history !== "undefined" && history[0];
      if (!h) return;
      G.drShareRoll({
        r: h.roll,
        o: h.oneIn,
        k: h.rarity,
        b: (h.badges || []).map((x) => (typeof x === "string" ? x : x.name)),
        t: h.time,
      });
    };
    grid.insertAdjacentElement("afterend", b);
  }
  function syncShareButton() {
    const b = $id("drShareLast");
    if (b) b.disabled = !(typeof history !== "undefined" && history[0]);
  }
  if (G.drProgress) G.drProgress.onRoll(syncShareButton);

  /* ---------- boot ---------- */
  setTimeout(() => {
    ensureTabs();
    if (lbTab !== "top") G.loadLeaderboard();
    ensureShareButton();
    syncShareButton();
  }, 600);
})();
