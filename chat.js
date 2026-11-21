/* ============================================================
   DIGIT ROLL — PUBLIC CHAT
   A live chat panel placed next to the leaderboard.
   Needs chat-setup.sql. Loaded after announce.js.
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
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const me = () => (typeof currentUser !== "undefined" ? currentUser : null);
  const isAdmin = () => typeof G.drIsAdmin === "function" && G.drIsAdmin();
  const MAX_LEN = 200;
  const KEEP = 80;

  /* ==========================================================
     AUTO-MOD (mirrors the server-side trigger in chat-setup.sql)
     ========================================================== */

  const DEFAULT_WORDS = [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "dick",
    "pussy",
    "bastard",
    "whore",
    "slut",
    "retard",
    "porn",
  ];
  let words = DEFAULT_WORDS.slice();
  let wordsFromDb = false;
  const LEET = {
    0: "o",
    1: "i",
    3: "e",
    4: "a",
    5: "s",
    7: "t",
    "@": "a",
    $: "s",
    "!": "i",
  };
  const collapse = (s) => s.replace(/(.)\1+/g, "$1");

  function tokensOf(text) {
    const t = text
      .toLowerCase()
      .replace(/[013457@$!]/g, (ch) => LEET[ch])
      .replace(/[^a-z]+/g, " ")
      .trim();
    const joined = t.replace(/\b([a-z]) (?=[a-z]\b)/g, "$1"); // "f u c k" -> "fuck"
    return t.split(" ").concat(joined.split(" ")).filter(Boolean);
  }
  function hasBadLanguage(text) {
    const toks = tokensOf(text).map(collapse);
    return words.some((w) => {
      const cw = collapse(w);
      return toks.some(
        (t) =>
          t === cw ||
          (t.startsWith(cw) &&
            /^(s|es|ed|ing|er|in|y)$/.test(t.slice(cw.length))),
      );
    });
  }
  const LINK_RE =
    /(https?:\/\/|www\.|discord\.gg|\b[a-z0-9-]+\.(com|net|org|gg|io|ly|xyz|me|co)\b)/i;
  let lastText = "";
  let lastTextAt = 0;
  let strikes = [];
  let muteUntil = 0;

  /* returns "" when ok, otherwise a reason */
  function checkMessage(text) {
    if (hasBadLanguage(text)) return "language";
    if (LINK_RE.test(text)) return "links";
    const letters = text.replace(/[^A-Za-z]/g, "").length;
    const upper = text.replace(/[^A-Z]/g, "").length;
    if (letters >= 12 && upper / letters > 0.7) return "caps";
    if (/(.)\1{7,}/.test(text)) return "spam";
    if (text.toLowerCase() === lastText && Date.now() - lastTextAt < 30000)
      return "duplicate";
    return "";
  }
  const REASON_TEXT = {
    language: "Please keep the chat clean.",
    links: "Links aren't allowed in chat.",
    caps: "Please don't shout (too many capital letters).",
    spam: "That looks like spam.",
    duplicate: "You already sent that.",
    slow: "Slow down a little.",
  };

  async function loadWords() {
    if (typeof supabaseClient === "undefined") return;
    try {
      const { data, error } = await supabaseClient
        .from("chat_blocked_words")
        .select("word")
        .order("word");
      if (!error && data) {
        words = data.map((r) => r.word);
        wordsFromDb = true;
        if (typeof G.drProgress !== "undefined" && G.drProgress.isOpen())
          G.drProgress.rerender();
        render();
      }
    } catch (e) {}
  }

  let messages = []; // oldest -> newest
  let offline = false;
  let lastSend = 0;
  let wasAtBottom = true;

  function injectCSS() {
    if ($id("drChatCSS")) return;
    const st = document.createElement("style");
    st.id = "drChatCSS";
    st.textContent = `
      .drBoardRow{display:grid;grid-template-columns:1fr;gap:18px;margin-bottom:22px}
      .drBoardRow>section{margin-bottom:0!important}
      .drChatPanel{position:relative;border:1px solid rgba(255,255,255,.12);border-radius:26px;padding:22px;background:rgba(18,23,34,.72);display:flex;flex-direction:column;min-height:420px;color:#fff}
      .drChatHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .drChatHead h2{margin:0;font-size:22px}
      .drChatList{flex:1;min-height:260px;max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;padding-right:4px}
      .drChatMsg{padding:8px 11px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);line-height:1.4;word-break:break-word;position:relative}
      .drChatMsg.mine{background:rgba(122,162,255,.14);border-color:rgba(122,162,255,.3)}
      .drChatName{font-weight:850;margin-right:6px}
      .drChatTime{color:#8391ab;font-size:11px;margin-left:6px}
      .drChatDel{position:absolute;top:5px;right:6px;border:0;background:rgba(0,0,0,.3);color:#fff;border-radius:7px;width:22px;height:22px;cursor:pointer;opacity:0;font-size:13px;line-height:1}
      .drChatMsg:hover .drChatDel{opacity:1}
      @media(hover:none){.drChatDel{opacity:.7}}
      .drChatForm{display:flex;gap:8px;margin-top:12px}
      .drChatForm input{flex:1;min-width:0;padding:11px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;font:inherit}
      .drChatForm button{border:0;border-radius:12px;padding:0 16px;font-weight:850;cursor:pointer;background:rgba(142,230,173,.2);color:#fff}
      .drChatForm button:disabled,.drChatForm input:disabled{opacity:.5;cursor:not-allowed}
      .drChatNote{color:#8391ab;font-size:13px;margin-top:8px}
      .drChatEmpty{color:#8391ab;text-align:center;padding:30px 10px}
    `;
    document.head.appendChild(st);
  }

  function buildPanel() {
    injectCSS();
    if ($id("drChatPanel")) return true;
    const rows = $id("globalRows");
    const lbSection = rows && rows.closest("section");
    if (!lbSection) return false;

    const wrap = document.createElement("div");
    wrap.className = "drBoardRow";
    lbSection.parentNode.insertBefore(wrap, lbSection);
    wrap.appendChild(lbSection);

    const panel = document.createElement("section");
    panel.id = "drChatPanel";
    panel.className = "drChatPanel";
    panel.innerHTML = `<div class="drChatHead"><h2>💬 Public Chat</h2><span class="drChatNote" id="drChatCount"></span></div>
      <div class="drChatList" id="drChatList" aria-live="polite"></div>
      <form class="drChatForm" id="drChatForm" autocomplete="off">
        <input id="drChatInput" type="text" maxlength="${MAX_LEN}" placeholder="Say something…" />
        <button id="drChatSend" type="submit">Send</button>
      </form>
      <div class="drChatNote" id="drChatNote"></div>`;
    wrap.appendChild(panel);

    $id("drChatForm").addEventListener("submit", (e) => {
      e.preventDefault();
      send();
    });
    $id("drChatList").addEventListener("scroll", () => {
      const l = $id("drChatList");
      wasAtBottom = l.scrollHeight - l.scrollTop - l.clientHeight < 40;
    });
    $id("drChatList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-del]");
      if (b) remove(b.dataset.del);
    });
    syncForm();
    return true;
  }

  function syncForm() {
    const input = $id("drChatInput");
    const btn = $id("drChatSend");
    const note = $id("drChatNote");
    if (!input) return;
    const u = me();
    const off = offline;
    const muted = Date.now() < muteUntil;
    input.disabled = !u || off || muted;
    btn.disabled = !u || off || muted;
    input.placeholder = off
      ? "Chat is offline"
      : u
        ? "Say something…"
        : "Log in to chat";
    note.textContent = off
      ? "Chat isn't set up yet (run chat-setup.sql)."
      : muted
        ? "🛡️ Auto-mod: you're muted for " +
          Math.ceil((muteUntil - Date.now()) / 1000) +
          "s."
        : u
          ? "Be kind. Messages are public. Max " + MAX_LEN + " characters."
          : "You can read the chat, but you need an account to post.";
  }

  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  function render() {
    const list = $id("drChatList");
    if (!list) return;
    const u = me();
    if (!messages.length) {
      list.innerHTML = `<div class="drChatEmpty">${offline ? "Chat is offline." : "No messages yet. Say hi! 👋"}</div>`;
      return;
    }
    list.innerHTML = messages
      .map((m) => {
        const name =
          typeof G.drNameHTML === "function"
            ? G.drNameHTML({ player_name: m.username, player_id: m.user_id })
            : esc(m.username);
        const mine = u && m.user_id === u.id;
        const canDel = mine || isAdmin();
        return `<div class="drChatMsg ${mine ? "mine" : ""}"><span class="drChatName">${name}</span><span class="drChatTime">${fmtTime(m.created_at)}</span><div>${
          hasBadLanguage(m.message)
            ? isAdmin()
              ? esc(m.message) + ' <i style="color:#f59e0b">🛡️ flagged</i>'
              : '<i style="color:#8391ab">🛡️ message removed by auto-mod</i>'
            : esc(m.message)
        }</div>${
          canDel
            ? `<button class="drChatDel" type="button" title="Delete" data-del="${esc(m.id)}">×</button>`
            : ""
        }</div>`;
      })
      .join("");
    if (wasAtBottom) list.scrollTop = list.scrollHeight;
  }

  function merge(rows) {
    const byId = new Map(messages.map((m) => [String(m.id), m]));
    rows.forEach((r) => byId.set(String(r.id), r));
    messages = [...byId.values()]
      .sort(
        (a, b) =>
          new Date(a.created_at) - new Date(b.created_at) ||
          Number(a.id) - Number(b.id),
      )
      .slice(-KEEP);
  }

  async function fetchLatest() {
    if (typeof supabaseClient === "undefined") return;
    try {
      const { data, error } = await supabaseClient
        .from("chat_messages")
        .select("id,user_id,username,message,created_at")
        .order("created_at", { ascending: false })
        .limit(KEEP);
      if (error) {
        if (/does not exist|relation|schema cache/i.test(error.message || "")) {
          offline = true;
          syncForm();
          render();
        }
        return;
      }
      offline = false;
      const ids = new Set((data || []).map((m) => String(m.id)));
      /* drop messages that were deleted elsewhere */
      messages = messages.filter(
        (m) =>
          ids.has(String(m.id)) ||
          new Date(m.created_at) <
            new Date((data[data.length - 1] || {}).created_at || 0),
      );
      merge(data || []);
      if (typeof G.drLoadRebirths === "function")
        await G.drLoadRebirths(messages.map((m) => ({ player_id: m.user_id })));
      syncForm();
      render();
    } catch (e) {}
  }

  async function send() {
    const input = $id("drChatInput");
    const u = me();
    if (!u || !input) return;
    const text = input.value.replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
    if (!text) return;
    if (Date.now() < muteUntil) return syncForm();
    if (!isAdmin()) {
      const why = checkMessage(text);
      if (why) {
        strikes = strikes.filter((t) => Date.now() - t < 60000);
        strikes.push(Date.now());
        say("🛡️ Auto-mod: " + REASON_TEXT[why]);
        if (strikes.length >= 3) {
          muteUntil = Date.now() + 60000;
          strikes = [];
          say("🛡️ Too many blocked messages — muted for 60 seconds.");
          syncForm();
        }
        return;
      }
    }
    if (Date.now() - lastSend < 2000) return say("⏳ Slow down a little.");
    lastSend = Date.now();
    const username =
      (typeof profile !== "undefined" && profile && profile.username) ||
      (u.user_metadata && u.user_metadata.username) ||
      "Player";
    input.value = "";
    wasAtBottom = true;
    try {
      const { error } = await supabaseClient
        .from("chat_messages")
        .insert({ user_id: u.id, username, message: text });
      if (error) {
        input.value = text;
        const m = /automod: (\w+)/.exec(error.message || "");
        if (m)
          return say(
            "🛡️ Auto-mod: " + (REASON_TEXT[m[1]] || "message blocked."),
          );
        return say("❌ " + (error.message || "Couldn't send"));
      }
      lastText = text.toLowerCase();
      lastTextAt = Date.now();
      fetchLatest();
    } catch (e) {
      input.value = text;
    }
  }

  async function remove(id) {
    try {
      const { error } = await supabaseClient
        .from("chat_messages")
        .delete()
        .eq("id", id);
      if (error) return say("❌ " + error.message);
      messages = messages.filter((m) => String(m.id) !== String(id));
      render();
    } catch (e) {}
  }

  function subscribe() {
    if (typeof supabaseClient === "undefined" || !supabaseClient.channel)
      return;
    try {
      supabaseClient
        .channel("digit-chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages" },
          (p) => {
            merge([p.new]);
            render();
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "chat_messages" },
          (p) => {
            if (p.old && p.old.id != null) {
              messages = messages.filter(
                (m) => String(m.id) !== String(p.old.id),
              );
              render();
            }
          },
        )
        .subscribe();
    } catch (e) {}
  }

  /* ---------- admin: Chat Mod tab ---------- */
  function renderMod() {
    const chips = words
      .map(
        (w) =>
          `<span class="pgTag" style="margin:3px;font-size:13px;text-transform:none;letter-spacing:0">${esc(w)} <a href="#" data-rmword="${esc(w)}" style="color:#f87171;text-decoration:none;margin-left:6px" title="Remove">×</a></span>`,
      )
      .join("");
    return `<div class="pgBanner">🛡️ Chat auto-mod is <b>on</b>.<br><span class="pgSub">Blocked automatically (server-side, admins are exempt): blocked words (also catches l33t speak, repeated letters and spaced-out words), links, shouting in ALL CAPS, repeated-character spam, duplicate messages within 30s, and more than 1 message per 2s. Three blocked messages in a minute mutes a player for 60s. Blocked words in old messages are hidden for non-admins.</span></div>
      <div class="pgSub" style="margin-bottom:8px">Word list: <b>${wordsFromDb ? "✅ loaded from database" : "⚠️ using built-in list (run chat-setup.sql to manage it here)"}</b> — ${words.length} words</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <input id="modAdd" type="text" placeholder="Add words, separated by commas" style="flex:1;min-width:200px;padding:10px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#161c2a;color:#fff">
        <button class="pgBtn" id="modAddBtn" style="width:auto;margin:0;padding:10px 18px" ${wordsFromDb ? "" : "disabled"}>Add</button></div>
      <div>${chips || '<span class="pgSub">No words.</span>'}</div>`;
  }
  function bindMod(root) {
    const add = root.querySelector("#modAddBtn");
    if (add)
      add.onclick = async () => {
        const list = [
          ...new Set(
            root
              .querySelector("#modAdd")
              .value.toLowerCase()
              .split(/[,\s]+/)
              .map((w) => w.replace(/[^a-z]/g, ""))
              .filter((w) => w.length >= 2 && w.length <= 30),
          ),
        ];
        if (!list.length) return;
        const { error } = await supabaseClient
          .from("chat_blocked_words")
          .upsert(list.map((word) => ({ word })));
        if (error) return say("❌ " + error.message);
        say("🛡️ Added " + list.length + " word(s).");
        loadWords();
      };
    root.querySelectorAll("[data-rmword]").forEach((a) => {
      a.onclick = async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient
          .from("chat_blocked_words")
          .delete()
          .eq("word", a.dataset.rmword);
        if (error) return say("❌ " + error.message);
        loadWords();
      };
    });
  }
  if (G.drProgress)
    G.drProgress.addTab("chatmod", "🛡️ Chat Mod", renderMod, bindMod, isAdmin);

  /* ---------- boot ---------- */
  let lastUser = null;
  function boot() {
    if (!buildPanel()) return setTimeout(boot, 400);
    render();
    loadWords();
    setInterval(loadWords, 300000);
    setInterval(syncForm, 1000);
    fetchLatest();
    subscribe();
    setInterval(fetchLatest, 15000);
    setInterval(() => {
      const id = me() ? me().id : null;
      if (id !== lastUser) {
        lastUser = id;
        syncForm();
        render();
      }
    }, 1500);
  }
  setTimeout(boot, 900);
})();
