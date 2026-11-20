/* ============================================================
   DIGIT ROLL — ANNOUNCEMENTS
   Admins can broadcast a message to every player's screen.
   Two admin-only tabs in the Progress window:
     📢 Announce   — write + send, recent announcements
     ✨ Message FX — customize how the message looks (live preview)
   Needs announcements-setup.sql (and admin-setup.sql for is_admin()).
   Loaded after social.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const P = G.drProgress;
  const $id = (id) => document.getElementById(id);
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (a, b) => typeof G.drSfx === "function" && G.drSfx(a, b);
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
  const isAdmin = () => typeof G.drIsAdmin === "function" && G.drIsAdmin();

  /* ==========================================================
     STYLE OPTIONS (also the whitelist used when displaying)
     ========================================================== */

  const OPT = {
    anim: [
      ["slide", "Slide in"],
      ["bounce", "Bounce"],
      ["zoom", "Zoom"],
      ["fade", "Fade"],
      ["typewriter", "Typewriter"],
      ["shake", "Shake"],
      ["glitch", "Glitch"],
      ["flip", "Flip"],
    ],
    bg: [
      ["dark", "Midnight"],
      ["aurora", "Aurora"],
      ["sunset", "Sunset"],
      ["ocean", "Ocean"],
      ["lava", "Lava"],
      ["gold", "Gold"],
      ["mint", "Mint"],
      ["glass", "Glass"],
    ],
    font: [
      ["sans", "Clean"],
      ["serif", "Serif"],
      ["mono", "Typewriter"],
      ["impact", "Heavy"],
      ["script", "Script"],
    ],
    size: [
      ["s", "Small"],
      ["m", "Medium"],
      ["l", "Large"],
      ["xl", "Huge"],
    ],
    pos: [
      ["top", "Top banner"],
      ["center", "Center of screen"],
      ["bottom", "Bottom banner"],
    ],
    icon: [
      ["📢", "📢"],
      ["🎉", "🎉"],
      ["⚠️", "⚠️"],
      ["🔥", "🔥"],
      ["⭐", "⭐"],
      ["🚀", "🚀"],
      ["🎁", "🎁"],
      ["🛠️", "🛠️"],
      ["", "None"],
    ],
    sound: [
      ["none", "None"],
      ["chime", "Chime"],
      ["fanfare", "Fanfare"],
      ["alert", "Alert"],
    ],
    particles: [
      ["none", "None"],
      ["confetti", "Confetti"],
      ["stars", "Stars"],
      ["embers", "Embers"],
      ["hearts", "Hearts"],
    ],
  };
  const ok = (key, v) => OPT[key].some((o) => o[0] === v);
  const DEFAULT_FX = {
    anim: "slide",
    bg: "dark",
    font: "sans",
    size: "m",
    pos: "top",
    icon: "📢",
    sound: "chime",
    particles: "none",
    color: "#ffffff",
    glow: true,
    rainbow: false,
    secs: 10,
  };

  function clean(raw) {
    const s = Object.assign(
      {},
      DEFAULT_FX,
      raw && typeof raw === "object" ? raw : {},
    );
    Object.keys(OPT).forEach((k) => {
      if (!ok(k, s[k])) s[k] = DEFAULT_FX[k];
    });
    if (!/^#[0-9a-f]{6}$/i.test(String(s.color))) s.color = DEFAULT_FX.color;
    s.glow = !!s.glow;
    s.rainbow = !!s.rainbow;
    s.secs = Math.min(30, Math.max(3, Math.round(Number(s.secs)) || 10));
    return s;
  }

  /* admin's saved settings + unsent draft */
  const FX_KEY = "digitRollMsgFx";
  const DRAFT_KEY = "digitRollMsgDraft";
  let fx = DEFAULT_FX;
  try {
    fx = clean(JSON.parse(localStorage.getItem(FX_KEY)));
  } catch (e) {
    fx = clean(null);
  }
  let draft = "";
  try {
    draft = localStorage.getItem(DRAFT_KEY) || "";
  } catch (e) {}
  const saveFx = () => {
    try {
      localStorage.setItem(FX_KEY, JSON.stringify(fx));
    } catch (e) {}
  };

  /* ==========================================================
     DISPLAY (what every player sees)
     ========================================================== */

  const PARTICLE_CHARS = {
    confetti: ["🎊", "🎉", "✨", "🟡", "🟣", "🔵"],
    stars: ["⭐", "✨", "🌟", "💫"],
    embers: ["🔥", "✨", "🧡"],
    hearts: ["💖", "💜", "💙", "💗"],
  };

  function injectCSS() {
    if ($id("drAnnCSS")) return;
    const st = document.createElement("style");
    st.id = "drAnnCSS";
    st.textContent = `
      #drAnnHost{position:fixed;inset:0;z-index:10080;pointer-events:none}
      .drAnn{position:absolute;left:0;right:0;display:flex;justify-content:center;padding:14px;pointer-events:none}
      .drAnn.pos-top{top:0}
      .drAnn.pos-bottom{bottom:0}
      .drAnn.pos-center{top:0;bottom:0;align-items:center;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);pointer-events:auto}
      .drAnnBox{position:relative;max-width:min(900px,96vw);padding:16px 44px 16px 20px;border-radius:20px;border:1px solid rgba(255,255,255,.22);box-shadow:0 20px 70px rgba(0,0,0,.55);display:flex;gap:14px;align-items:center;pointer-events:auto;cursor:pointer;overflow:hidden}
      .drAnn.pos-center .drAnnBox{padding:30px 54px 30px 30px;flex-direction:column;text-align:center;max-width:min(820px,94vw)}
      .drAnnIcon{font-size:1.6em;line-height:1;flex:none}
      .drAnnText{font-weight:800;line-height:1.35;word-break:break-word}
      .drAnnX{position:absolute;top:8px;right:10px;border:0;background:rgba(0,0,0,.28);color:#fff;width:26px;height:26px;border-radius:9px;cursor:pointer;font-size:16px;line-height:1}
      .drAnnBar{position:absolute;left:0;bottom:0;height:4px;background:rgba(255,255,255,.7);transform-origin:left;animation:annXBar linear forwards}
      @keyframes annXBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
      .annBg-dark{background:linear-gradient(135deg,#0f172a,#1e1b4b)}
      .annBg-aurora{background:linear-gradient(120deg,#0f766e,#4f46e5,#9333ea);background-size:200% 200%;animation:annXShift 6s ease infinite}
      .annBg-sunset{background:linear-gradient(120deg,#f97316,#ec4899,#6366f1)}
      .annBg-ocean{background:linear-gradient(120deg,#0369a1,#0891b2,#0f766e)}
      .annBg-lava{background:linear-gradient(120deg,#7f1d1d,#dc2626,#f97316)}
      .annBg-gold{background:linear-gradient(120deg,#78350f,#d97706,#fde047);color:#111}
      .annBg-mint{background:linear-gradient(120deg,#065f46,#10b981,#a7f3d0)}
      .annBg-glass{background:rgba(255,255,255,.12);backdrop-filter:blur(14px)}
      @keyframes annXShift{50%{background-position:100% 50%}}
      .annFont-sans{font-family:inherit}
      .annFont-serif{font-family:Georgia,"Times New Roman",serif}
      .annFont-mono{font-family:"Courier New",ui-monospace,monospace}
      .annFont-impact{font-family:Impact,"Arial Black",sans-serif;letter-spacing:.03em}
      .annFont-script{font-family:"Brush Script MT","Segoe Script",cursive}
      .annSz-s .drAnnText{font-size:15px}.annSz-m .drAnnText{font-size:19px}.annSz-l .drAnnText{font-size:27px}.annSz-xl .drAnnText{font-size:40px}
      .annGlow .drAnnText{text-shadow:0 0 10px currentColor,0 0 24px currentColor}
      .annRainbow .drAnnText{background:linear-gradient(90deg,#f33,#fa3,#ff3,#3f6,#3af,#63f,#f3c,#f33);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;text-shadow:none;animation:annXRb 3s linear infinite}
      @keyframes annXRb{to{background-position:-300% 0}}
      .annIn-slide.pos-top .drAnnBox{animation:annXSlideT .6s cubic-bezier(.2,1.1,.3,1) both}
      .annIn-slide.pos-bottom .drAnnBox{animation:annXSlideB .6s cubic-bezier(.2,1.1,.3,1) both}
      .annIn-slide.pos-center .drAnnBox{animation:annXSlideT .6s cubic-bezier(.2,1.1,.3,1) both}
      @keyframes annXSlideT{from{transform:translateY(-140%);opacity:0}}
      @keyframes annXSlideB{from{transform:translateY(140%);opacity:0}}
      .annIn-bounce .drAnnBox{animation:annXBounce .9s cubic-bezier(.28,.84,.42,1) both}
      @keyframes annXBounce{0%{transform:scale(.3) translateY(-60px);opacity:0}50%{transform:scale(1.08) translateY(8px);opacity:1}70%{transform:scale(.96)}100%{transform:none}}
      .annIn-zoom .drAnnBox{animation:annXZoom .5s ease-out both}
      @keyframes annXZoom{from{transform:scale(2.4);opacity:0;filter:blur(10px)}}
      .annIn-fade .drAnnBox{animation:annXFade 1s ease both}
      @keyframes annXFade{from{opacity:0}}
      .annIn-shake .drAnnBox{animation:annXShake .7s ease both}
      @keyframes annXShake{0%{opacity:0;transform:scale(.8)}20%{opacity:1;transform:translateX(-14px)}40%{transform:translateX(12px)}60%{transform:translateX(-8px)}80%{transform:translateX(5px)}100%{transform:none}}
      .annIn-glitch .drAnnBox{animation:annXGlitch 1.1s steps(1) both}
      @keyframes annXGlitch{0%{opacity:0;transform:translateX(-10px) skewX(10deg)}10%{opacity:1;transform:translateX(8px) skewX(-8deg);filter:hue-rotate(90deg)}20%{transform:translateX(-5px);filter:hue-rotate(-60deg)}30%{transform:translateX(4px) skewX(5deg)}45%{transform:none;filter:none}60%{transform:translateX(-3px);filter:hue-rotate(40deg)}70%,100%{transform:none;filter:none}}
      .annIn-flip .drAnnBox{animation:annXFlip .8s ease both;transform-origin:center}
      @keyframes annXFlip{from{transform:perspective(700px) rotateX(-90deg);opacity:0}}
      .drAnn.leaving .drAnnBox{animation:annXLeave .45s ease both!important}
      .drAnn.pos-center.leaving{animation:annXFade .45s ease reverse both}
      @keyframes annXLeave{to{opacity:0;transform:translateY(-30px) scale(.96)}}
      .annP{position:fixed;top:-30px;pointer-events:none;animation:annXFall linear forwards;z-index:10081}
      @keyframes annXFall{to{transform:translateY(112vh) rotate(540deg)}}
      .annTyping::after{content:"▌";margin-left:2px;animation:annXBlink .6s steps(1) infinite}
      @keyframes annXBlink{50%{opacity:0}}
      @media (prefers-reduced-motion:reduce){.drAnnBox,.annP,.annRainbow .drAnnText,.annBg-aurora{animation:none!important}.annP{display:none}}
      /* admin tabs */
      .annField{display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin:9px 0}
      .annField label{font-weight:800;color:#aab5ca;font-size:13px}
      .annField select,.annField input[type=number],.annField textarea{width:100%;padding:10px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#161c2a;color:#fff;font:inherit}
      .annField input[type=color]{width:60px;height:36px;border:0;background:none;padding:0}
      .annField textarea{min-height:90px;resize:vertical}
      @media(max-width:650px){.annField{grid-template-columns:1fr}}
    `;
    document.head.appendChild(st);
  }

  function host() {
    injectCSS();
    let h = $id("drAnnHost");
    if (!h) {
      h = document.createElement("div");
      h.id = "drAnnHost";
      document.body.appendChild(h);
    }
    return h;
  }

  const queue = [];
  let showing = false;

  function dropParticles(kind) {
    const chars = PARTICLE_CHARS[kind];
    if (!chars) return;
    const h = host();
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("span");
      s.className = "annP";
      s.textContent = chars[i % chars.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = 16 + Math.random() * 18 + "px";
      s.style.animationDuration = 2.6 + Math.random() * 2.6 + "s";
      s.style.animationDelay = Math.random() * 1.4 + "s";
      h.appendChild(s);
      setTimeout(() => s.remove(), 8000);
    }
  }

  function playSound(kind) {
    if (kind === "chime") sfx("newbadge");
    else if (kind === "fanfare") sfx("rebirth");
    else if (kind === "alert") sfx("error");
  }

  function display(message, rawStyle, done) {
    const s = clean(rawStyle);
    const h = host();
    const wrap = document.createElement("div");
    wrap.className = `drAnn pos-${s.pos} annIn-${s.anim}`;
    const reduced =
      window.matchMedia &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrap.innerHTML = `<div class="drAnnBox annBg-${s.bg} annFont-${s.font} annSz-${s.size} ${s.glow ? "annGlow" : ""} ${s.rainbow ? "annRainbow" : ""}" style="color:${s.color}" role="alert">
        ${s.icon ? `<span class="drAnnIcon"></span>` : ""}<span class="drAnnText"></span>
        <button class="drAnnX" type="button" aria-label="Dismiss">×</button>
        <span class="drAnnBar" style="animation-duration:${s.secs}s"></span></div>`;
    if (s.icon) wrap.querySelector(".drAnnIcon").textContent = s.icon;
    const textEl = wrap.querySelector(".drAnnText");
    h.appendChild(wrap);

    let typer = 0;
    const full = String(message);
    if (s.anim === "typewriter" && !reduced) {
      let i = 0;
      textEl.classList.add("annTyping");
      typer = setInterval(
        () => {
          i++;
          textEl.textContent = full.slice(0, i);
          if (i >= full.length) {
            clearInterval(typer);
            textEl.classList.remove("annTyping");
          }
        },
        Math.max(15, Math.min(60, 1800 / full.length)),
      );
    } else textEl.textContent = full;

    playSound(s.sound);
    if (s.particles !== "none") dropParticles(s.particles);

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      clearInterval(typer);
      clearTimeout(timer);
      wrap.classList.add("leaving");
      setTimeout(() => {
        wrap.remove();
        done && done();
      }, 480);
    };
    const timer = setTimeout(close, s.secs * 1000);
    wrap.querySelector(".drAnnX").onclick = (e) => {
      e.stopPropagation();
      close();
    };
    wrap.querySelector(".drAnnBox").onclick = close;
    if (s.pos === "center")
      wrap.addEventListener("click", (e) => {
        if (e.target === wrap) close();
      });
  }

  function enqueue(message, style) {
    queue.push([message, style]);
    next();
  }
  function next() {
    if (showing || !queue.length) return;
    showing = true;
    const [m, s] = queue.shift();
    display(m, s, () => {
      showing = false;
      next();
    });
  }
  G.drShowAnnouncement = (m, s) => enqueue(m, s);

  /* ==========================================================
     RECEIVING (realtime + polling fallback)
     ========================================================== */

  const SEEN_KEY = "digitRollAnnSeen";
  let seen = [];
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || [];
  } catch (e) {}
  const markSeen = (id) => {
    if (seen.includes(id)) return;
    seen.push(id);
    seen = seen.slice(-60);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch (e) {}
  };

  function receive(row, maxAgeMs) {
    if (!row || !row.id || seen.includes(row.id)) return;
    const age = Date.now() - new Date(row.created_at || Date.now()).getTime();
    if (age > maxAgeMs) return markSeen(row.id);
    markSeen(row.id);
    enqueue(row.message, row.style);
  }

  let tableMissing = false;
  let live = "";
  let tableState = "unknown"; // unknown | ok | missing | blocked
  async function poll(firstLoad) {
    if (tableMissing || typeof supabaseClient === "undefined") return;
    try {
      const { data, error } = await supabaseClient
        .from("announcements")
        .select("id,message,style,created_at")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) {
        if (/does not exist|relation|schema cache/i.test(error.message || "")) {
          tableMissing = true;
          tableState = "missing";
        } else tableState = "blocked";
        return;
      }
      tableState = "ok";
      if (data && data[0])
        receive(data[0], firstLoad ? 15 * 60000 : 10 * 60000);
    } catch (e) {}
  }

  function subscribe() {
    if (typeof supabaseClient === "undefined" || !supabaseClient.channel)
      return;
    try {
      supabaseClient
        .channel("digit-announcements")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "announcements" },
          (payload) => receive(payload.new, Infinity),
        )
        .subscribe((status) => {
          live = status;
          if (P && P.isOpen()) P.rerender();
        });
    } catch (e) {}
  }

  /* ==========================================================
     ADMIN TABS
     ========================================================== */

  let lastError = "";
  let recent = [];
  let recentLoaded = false;

  async function loadRecent() {
    try {
      const { data, error } = await supabaseClient
        .from("announcements")
        .select("id,message,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) {
        recent = [];
        recentLoaded = "error:" + error.message;
      } else {
        recent = data || [];
        recentLoaded = true;
      }
    } catch (e) {
      recentLoaded = "error:unavailable";
    }
    if (P && P.isOpen()) P.rerender();
  }

  function renderAnnounce() {
    if (!recentLoaded) loadRecent();
    if (tableState === "unknown") poll(false);
    const err = typeof recentLoaded === "string" ? recentLoaded.slice(6) : "";
    const list = recent
      .map(
        (
          r,
        ) => `<div class="pgCard" style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><div style="flex:1"><b>${esc(r.message)}</b><div class="pgSub">${new Date(r.created_at).toLocaleString()}</div></div>
        <button class="pgBtn" style="width:auto;margin:0;padding:8px 12px" data-ann-resend="${r.id}">Resend</button>
        <button class="pgBtn" style="width:auto;margin:0;padding:8px 12px" data-ann-del="${r.id}">Delete</button></div>`,
      )
      .join("");
    const status = `<div class="pgSub" style="margin-bottom:10px">Database table: <b>${tableState === "ok" ? "✅ connected" : tableState === "missing" ? "❌ missing — run announcements-setup.sql" : tableState === "blocked" ? "⚠️ blocked (check policies)" : "checking…"}</b> • Live updates: <b>${live === "SUBSCRIBED" ? "✅ on" : live ? "⚠️ " + esc(live) + " (players get it within ~12s instead)" : "connecting…"}</b>${lastError ? `<br>Last error: ${esc(lastError)}` : ""}</div>`;
    return `<div class="pgBanner">📢 Broadcast a message to every player's screen.<br><span class="pgSub">It appears instantly for everyone who has the game open, and for anyone who opens it in the next 15 minutes. Change how it looks in the ✨ Message FX tab.</span></div>
      ${status}
      <div class="annField" style="grid-template-columns:1fr"><textarea id="annText" maxlength="280" placeholder="Type your announcement… (max 280 characters)">${esc(draft)}</textarea></div>
      <div class="pgSub" id="annCount">${draft.length} / 280</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="pgBtn" id="annPreview" style="flex:1">▶ Preview on my screen</button>
        <button class="pgBtn" id="annSend" style="flex:1;background:rgba(122,162,255,.3)">📡 Send to everyone</button></div>
      <div class="pgH">Recent announcements</div>
      ${err ? `<p class="pgSub">Couldn't load announcements: ${esc(err)}. Have you run announcements-setup.sql?</p>` : list || '<p class="pgSub">Nothing sent yet.</p>'}`;
  }

  async function send(message, style) {
    let res;
    try {
      res = await supabaseClient
        .from("announcements")
        .insert({ message, style })
        .select("id")
        .single();
    } catch (e) {
      res = { error: { message: String(e && e.message ? e.message : e) } };
    }
    const { data, error } = res;
    if (error) {
      let why = error.message || "error";
      if (/does not exist|schema cache|relation/i.test(why))
        why =
          "the announcements table doesn't exist yet — run announcements-setup.sql in Supabase.";
      else if (/row-level security|policy|permission/i.test(why))
        why =
          "your account isn't recognised as an admin by the database. Run admin-setup.sql (and add your user id to the admins table if you aren't elicole613@gmail.com).";
      say("❌ Couldn't send: " + why);
      lastError = why;
      sfx("error");
      if (P && P.isOpen()) P.rerender();
      return false;
    }
    lastError = "";
    if (data && data.id) markSeen(data.id);
    enqueue(message, style); // sender sees it immediately
    sfx("admin");
    say("📡 Announcement sent to everyone!");
    recentLoaded = false;
    return true;
  }

  function bindAnnounce(root) {
    const ta = root.querySelector("#annText");
    const count = root.querySelector("#annCount");
    ta.oninput = () => {
      draft = ta.value;
      count.textContent = draft.length + " / 280";
      try {
        localStorage.setItem(DRAFT_KEY, draft);
      } catch (e) {}
    };
    root.querySelector("#annPreview").onclick = () => {
      if (!draft.trim()) return say("Type a message first.");
      enqueue(draft.trim(), fx);
    };
    root.querySelector("#annSend").onclick = async () => {
      const msg = draft.trim();
      if (!msg) return say("Type a message first.");
      if (!confirm("Send this announcement to EVERY player?\n\n" + msg)) return;
      if (await send(msg, fx)) {
        draft = "";
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}
        P.rerender();
      }
    };
    root.querySelectorAll("[data-ann-del]").forEach((b) => {
      b.onclick = async () => {
        const { error } = await supabaseClient
          .from("announcements")
          .delete()
          .eq("id", b.dataset.annDel);
        if (error) return say("❌ " + error.message);
        recentLoaded = false;
        P.rerender();
      };
    });
    root.querySelectorAll("[data-ann-resend]").forEach((b) => {
      b.onclick = async () => {
        const r = recent.find((x) => String(x.id) === b.dataset.annResend);
        if (
          !r ||
          !confirm("Send this announcement again to everyone?\n\n" + r.message)
        )
          return;
        if (await send(r.message, fx)) P.rerender();
      };
    });
  }

  const sel = (key, label) =>
    `<div class="annField"><label for="annfx_${key}">${label}</label><select id="annfx_${key}" data-fx="${key}">${OPT[key].map(([v, l]) => `<option value="${esc(v)}" ${fx[key] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`;

  function renderFx() {
    return `<div class="pgBanner">✨ Customize how your announcements look. Settings are saved on this device and sent with each announcement.</div>
      ${sel("anim", "Entrance")}${sel("pos", "Position")}${sel("bg", "Background")}${sel("font", "Font")}${sel("size", "Text size")}${sel("icon", "Icon")}${sel("particles", "Particles")}${sel("sound", "Sound")}
      <div class="annField"><label for="annfx_color">Text color</label><input type="color" id="annfx_color" data-fx="color" value="${fx.color}"></div>
      <div class="annField"><label for="annfx_secs">Seconds on screen</label><input type="number" id="annfx_secs" data-fx="secs" min="3" max="30" value="${fx.secs}"></div>
      <div class="annField"><label>Glowing text</label><input type="checkbox" id="annfx_glow" data-fx="glow" ${fx.glow ? "checked" : ""}></div>
      <div class="annField"><label>Rainbow text</label><input type="checkbox" id="annfx_rainbow" data-fx="rainbow" ${fx.rainbow ? "checked" : ""}></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <button class="pgBtn" id="annfxPreview" style="flex:1">▶ Preview</button>
        <button class="pgBtn" id="annfxReset" style="flex:1">Reset to default</button></div>`;
  }

  function bindFx(root) {
    root.querySelectorAll("[data-fx]").forEach((el) => {
      el.onchange = () => {
        const k = el.dataset.fx;
        fx[k] =
          el.type === "checkbox"
            ? el.checked
            : el.type === "number"
              ? Number(el.value)
              : el.value;
        fx = clean(fx);
        saveFx();
      };
    });
    root.querySelector("#annfxPreview").onclick = () =>
      enqueue(
        (draft || "This is how your announcement will look!").slice(0, 280),
        fx,
      );
    root.querySelector("#annfxReset").onclick = () => {
      fx = clean(null);
      saveFx();
      P.rerender();
    };
  }

  if (P) {
    P.addTab("announce", "📢 Announce", renderAnnounce, bindAnnounce, isAdmin);
    P.addTab("msgfx", "✨ Message FX", renderFx, bindFx, isAdmin);
  }

  /* admin-only nav button that opens the Announce tab directly */
  function ensureAdminButton() {
    const nav = $id("digitRollNav");
    if (!nav) return;
    let b = $id("drAnnNavButton");
    if (!b) {
      b = document.createElement("button");
      b.id = "drAnnNavButton";
      b.className = "drNavBtn";
      b.type = "button";
      b.textContent = "📢 Announce";
      b.onclick = () => P && P.open("announce");
      nav.appendChild(b);
    }
    b.style.display = isAdmin() ? "" : "none";
  }
  setInterval(ensureAdminButton, 1000);

  /* ---------- boot ---------- */
  setTimeout(() => {
    subscribe();
    poll(true);
  }, 2500);
  setInterval(() => poll(false), 12000);
})();
