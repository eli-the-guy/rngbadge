/* ============================================================
   DIGIT ROLL — DUELS (PvP boss fight)
   Open someone's profile → "Challenge to a duel". They get a notification and can accept.
   Both players have 5,000 HP. After a 5 second countdown you fight for up to 2 minutes:
     🎲 ROLL   a plain 5-digit roll hits the other player: damage = 30 + 25 × log10(1 in N)
     🛡️ GUARD  4 seconds of only 30% damage taken (12s cooldown)
     💚 MEND   heal 600 HP (twice per fight, 16s cooldown)
     ⚡ ULTIMATE  charges as you roll; 700 damage that ignores guard
   KO the other player, or have more HP when the clock runs out. Rolls ignore charms and upgrades.
   Needs duel-setup.sql AND duel-pvp-setup.sql. Loaded after social.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const $id = (id) => document.getElementById(id);
  const n = (v) => Number(v || 0).toLocaleString();
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
  const sfx = (a) => typeof G.drSfx === "function" && G.drSfx(a);
  const me = () => (typeof currentUser !== "undefined" ? currentUser : null);
  const sb = () =>
    typeof supabaseClient !== "undefined" ? supabaseClient : null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const big = (v) =>
    v >= 1e15 ? Number(v).toExponential(2).replace("e+", " × 10^") : n(v);
  const MAXHP = 5000;
  const ROLL_CD = 1300; // ms between your rolls (server minimum is 1000)

  /* ---------- styles ---------- */
  const st = document.createElement("style");
  st.textContent = `
  #duelInvite{position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:9800;width:min(420px,94vw);padding:16px;border-radius:18px;background:linear-gradient(135deg,#1c1230,#0d1a30);border:2px solid #ffb52e;box-shadow:0 0 40px rgba(255,181,46,.45);color:#fff;font:600 15px system-ui,sans-serif;animation:dlPop .35s ease-out}
  @keyframes dlPop{from{transform:translateX(-50%) scale(.7);opacity:0}}
  #duelInvite h3{margin:0 0 6px;font-size:18px}
  #duelInvite .row{display:flex;gap:10px;margin-top:12px}
  .dlBtn{flex:1;border:0;border-radius:12px;padding:11px 14px;font:800 15px system-ui,sans-serif;cursor:pointer;color:#fff;background:#3a4570}
  .dlBtn.go{background:linear-gradient(90deg,#ff4fd8,#ffb52e);color:#210}
  .dlBtn:disabled{opacity:.5;cursor:default}
  #duelWait{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:9800;padding:10px 16px;border-radius:99px;background:rgba(14,18,34,.95);border:2px solid #ffb52e;color:#fff;font:700 14px system-ui,sans-serif;display:flex;gap:12px;align-items:center}
  #duelWait button{border:0;border-radius:99px;padding:5px 12px;background:#3a4570;color:#fff;font-weight:800;cursor:pointer}
  #duelArena{position:fixed;inset:0;z-index:9900;background:radial-gradient(circle at 50% 10%,#33165e,#080a18 70%);color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;gap:12px;padding:14px 14px 20px;overflow:auto;user-select:none}
  #duelArena.shake{animation:dlShake .35s}
  @keyframes dlShake{20%{transform:translate(-9px,4px)}40%{transform:translate(8px,-5px)}60%{transform:translate(-6px,3px)}80%{transform:translate(4px,-2px)}}
  #duelArena .dlTitle{font:900 clamp(18px,3.4vw,28px) system-ui;letter-spacing:3px;text-shadow:0 0 22px #ffb52e}
  #duelArena .dlClock{font:900 22px monospace;opacity:.9}
  #duelArena .dlBars{display:flex;gap:18px;width:min(900px,100%)}
  #duelArena .dlSide{flex:1;min-width:0}
  #duelArena .dlSide.opp{text-align:right}
  #duelArena .dlName{font-weight:800;font-size:15px;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #duelArena .dlHp{position:relative;height:26px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;border:1px solid rgba(255,255,255,.2);margin:4px 0}
  #duelArena .dlHp .tr{position:absolute;inset:0 auto 0 0;background:#ffd36b;opacity:.7;transition:width .9s .25s}
  #duelArena .dlHp .fl{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#34d399,#a3e635);transition:width .25s}
  #duelArena .dlSide.opp .dlHp .tr,#duelArena .dlSide.opp .dlHp .fl{inset:0 0 0 auto}
  #duelArena .dlSide.opp .dlHp .fl{background:linear-gradient(270deg,#fb7185,#f43f5e)}
  #duelArena .dlHp b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 13px system-ui;text-shadow:0 1px 3px #000}
  #duelArena .dlCh{height:8px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
  #duelArena .dlCh i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7cf7ff,#ff4fd8);transition:width .25s}
  #duelArena .dlCh.full i{animation:dlPulse .5s infinite alternate}
  @keyframes dlPulse{to{filter:brightness(1.8)}}
  #duelArena .dlCards{display:flex;gap:clamp(10px,3vw,40px);flex-wrap:wrap;justify-content:center}
  #duelArena .dlCard{position:relative;width:min(330px,44vw);min-width:150px;padding:14px;border-radius:20px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.14);text-align:center;transition:box-shadow .2s,border-color .2s}
  #duelArena .dlCard.hit{border-color:#ff4d6d;box-shadow:0 0 30px rgba(255,77,109,.6)}
  #duelArena .dlCard.deal{border-color:#7cf7ff;box-shadow:0 0 30px rgba(124,247,255,.5)}
  #duelArena .dlCard.guard::after{content:"🛡️";position:absolute;top:-14px;right:-8px;font-size:30px;filter:drop-shadow(0 0 8px #7cf7ff)}
  #duelArena .dlDigits{font:900 clamp(30px,7vw,56px) monospace;letter-spacing:5px;margin:6px 0}
  #duelArena .dlRar{font-weight:900;font-size:16px;min-height:22px}
  #duelArena .dlOne{font-size:12px;opacity:.75;min-height:16px}
  #duelArena .dlDmg{position:absolute;left:50%;top:10px;font:900 30px system-ui;pointer-events:none;animation:dlFloat 1.1s ease-out forwards;text-shadow:0 0 10px #000}
  @keyframes dlFloat{from{transform:translate(-50%,0) scale(.6);opacity:1}to{transform:translate(-50%,-70px) scale(1.2);opacity:0}}
  #duelArena .dlMsg{font:800 clamp(18px,3.4vw,28px) system-ui;min-height:36px;text-align:center}
  #duelArena .dlCtl{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:min(900px,100%)}
  #duelArena .dlRoll{position:relative;overflow:hidden;flex:2 1 220px;min-height:68px;border:0;border-radius:18px;font:900 24px system-ui;color:#210;background:linear-gradient(90deg,#ff4fd8,#ffb52e);cursor:pointer}
  #duelArena .dlRoll i{position:absolute;inset:0;background:rgba(0,0,0,.5);transform-origin:left;transform:scaleX(0);pointer-events:none}
  #duelArena .dlRoll:disabled{filter:grayscale(.6);cursor:default}
  #duelArena .dlAb{position:relative;overflow:hidden;flex:1 1 100px;min-height:68px;border:2px solid rgba(255,255,255,.2);border-radius:18px;background:rgba(255,255,255,.07);color:#fff;font:800 14px system-ui;cursor:pointer;line-height:1.25}
  #duelArena .dlAb i{position:absolute;inset:0;background:rgba(0,0,0,.55);transform-origin:left;transform:scaleX(0);pointer-events:none}
  #duelArena .dlAb:disabled{opacity:.55;cursor:default}
  #duelArena .dlAb.ready{border-color:#7cf7ff;box-shadow:0 0 16px rgba(124,247,255,.5)}
  #duelArena .dlAb small{display:block;font-weight:600;opacity:.7;font-size:11px}
  #duelArena .dlFeed{width:min(900px,100%);font-size:13px;opacity:.85;display:flex;flex-direction:column;gap:3px;min-height:60px}
  #duelArena .dlFeed div.me{color:#8ee6ad}#duelArena .dlFeed div.him{color:#ff8aa0}
  #duelArena .dlCount{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font:900 clamp(70px,22vw,200px) system-ui;color:#ffb52e;text-shadow:0 0 50px #ff4fd8;pointer-events:none;z-index:2}
  #duelArena table{border-collapse:collapse;font-size:14px}
  #duelArena td,#duelArena th{padding:5px 12px;border-bottom:1px solid rgba(255,255,255,.1);text-align:center}
  .dlRec{display:flex;gap:10px;margin:12px 0;flex-wrap:wrap}
  .dlRec .drProfTile{flex:1;min-width:90px}`;
  document.head.appendChild(st);

  /* ==========================================================
     STATE + SYNC
     ========================================================== */
  let cur = null; // my current duel row
  let curId = null;
  const notified = new Set();
  let busy = false;
  let arenaLocked = false; // keeps the result screen up until closed

  async function fetchLatest() {
    const c = sb();
    const u = me();
    if (!c || !u) return null;
    try {
      if (curId) {
        const r = await c
          .from("duels")
          .select("*")
          .eq("id", curId)
          .maybeSingle();
        if (r.data) return r.data;
      }
      const r = await c
        .from("duels")
        .select("*")
        .or(`challenger_id.eq.${u.id},opponent_id.eq.${u.id}`)
        .in("status", ["pending", "active"])
        .order("id", { ascending: false })
        .limit(1);
      return (r.data && r.data[0]) || null;
    } catch (e) {
      return null;
    }
  }

  async function poll() {
    if (busy || !me() || !sb()) return;
    busy = true;
    try {
      const row = await fetchLatest();
      if (!row) {
        if (
          curId &&
          cur &&
          (cur.status === "pending" || cur.status === "active")
        ) {
          cur = null;
          curId = null;
          clearUI();
        }
        return;
      }
      applyRow(row);
    } finally {
      busy = false;
    }
  }
  function applyRow(row) {
    const prev = cur && cur.id === row.id ? cur : null;
    cur = row;
    curId = row.id;
    render(row, prev);
  }
  /* poll fast while a fight is on, slowly otherwise */
  (function loop() {
    poll().finally(() =>
      setTimeout(loop, cur && cur.status === "active" ? 450 : 1500),
    );
  })();

  /* realtime nudge (the poll above is the fallback) */
  let chan = null;
  function subscribe() {
    const c = sb();
    if (chan || !c || !me()) return;
    try {
      chan = c
        .channel("duels-" + me().id)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "duels" },
          () => poll(),
        )
        .subscribe();
    } catch (e) {}
  }
  setInterval(subscribe, 4000);

  const amChallenger = (d) => me() && d.challenger_id === me().id;
  const oppName = (d) =>
    amChallenger(d) ? d.opponent_name : d.challenger_name;
  /* my / their view of the row */
  const side = (d, mine) => {
    const c = mine ? amChallenger(d) : !amChallenger(d);
    const k = c ? "c" : "o";
    return {
      hp: d["hp_" + k],
      charge: d["charge_" + k],
      guard: d["guard_" + k],
      guardCd: d["guard_cd_" + k],
      mendCd: d["mend_cd_" + k],
      mends: d["mends_" + k],
      last: d["last_" + k],
      dealt: d["dealt_" + k],
    };
  };

  function clearUI() {
    ["duelInvite", "duelWait"].forEach((i) => $id(i) && $id(i).remove());
    if ($id("duelArena") && !arenaLocked) closeArena();
  }

  function render(d, prev) {
    if (d.status === "pending") {
      if (amChallenger(d)) showWait(d);
      else showInvite(d);
      if (new Date(d.expires_at) < Date.now())
        call("duel_tick", { p_id: d.id });
      return;
    }
    $id("duelInvite") && $id("duelInvite").remove();
    $id("duelWait") && $id("duelWait").remove();
    if (d.status === "active" || d.status === "finished") return arena(d, prev);
    /* declined / expired / cancelled */
    if (prev && prev.status === "pending" && amChallenger(d)) {
      say(
        d.status === "declined"
          ? `❌ ${d.opponent_name} declined your duel.`
          : `⌛ Your duel challenge to ${d.opponent_name} ${d.status === "cancelled" ? "was cancelled" : "expired"}.`,
      );
    }
    cur = null;
    curId = null;
  }

  async function call(fn, args) {
    const c = sb();
    if (!c) return { error: { message: "Not connected." } };
    try {
      const r = await c.rpc(fn, args);
      return r || {};
    } catch (e) {
      return { error: { message: String((e && e.message) || e) } };
    }
  }

  /* ---------- invite / waiting ---------- */
  function showInvite(d) {
    let box = $id("duelInvite");
    if (!notified.has(d.id)) {
      notified.add(d.id);
      sfx("open");
      say(`⚔️ ${d.challenger_name} challenged you to a duel!`);
      if (typeof G.drShowAnnouncement === "function")
        G.drShowAnnouncement(
          `⚔️ ${d.challenger_name} challenges you to a PvP duel!`,
          { icon: "⚔️", color: "#ffb52e", glow: true },
        );
    }
    if (!box) {
      box = document.createElement("div");
      box.id = "duelInvite";
      document.body.appendChild(box);
    }
    const secs = Math.max(
      0,
      Math.round((new Date(d.expires_at) - Date.now()) / 1000),
    );
    box.innerHTML = `<h3>⚔️ Duel challenge!</h3><div><b>${esc(d.challenger_name)}</b> wants a <b>PvP boss fight</b>: 5,000 HP each, roll to hit, guard, mend and unleash an ultimate. <span style="opacity:.7">(${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} left)</span></div>
      <div class="row"><button class="dlBtn go" id="dlAcc">Accept</button><button class="dlBtn" id="dlDec">Decline</button></div>`;
    $id("dlAcc").onclick = async () => {
      $id("dlAcc").disabled = true;
      const r = await call("duel_respond", { p_id: d.id, p_accept: true });
      if (r.error) say("⚠️ " + r.error.message);
      poll();
    };
    $id("dlDec").onclick = async () => {
      await call("duel_respond", { p_id: d.id, p_accept: false });
      box.remove();
      cur = null;
      curId = null;
    };
  }
  function showWait(d) {
    let box = $id("duelWait");
    if (!box) {
      box = document.createElement("div");
      box.id = "duelWait";
      document.body.appendChild(box);
    }
    box.innerHTML = `<span>⚔️ Waiting for <b>${esc(d.opponent_name)}</b> to accept…</span><button id="dlCancel">Cancel</button>`;
    $id("dlCancel").onclick = async () => {
      await call("duel_respond", { p_id: d.id, p_accept: false });
      box.remove();
      cur = null;
      curId = null;
    };
  }

  /* ==========================================================
     ARENA
     ========================================================== */
  const rarityHTML = (r) =>
    `<span class="rarity" data-r="${esc(r || "")}">${esc(r || "")}</span>`;
  const colorRarity = (root) =>
    root.querySelectorAll("[data-r]").forEach((e) => {
      if (typeof applyRarityColor === "function")
        applyRarityColor(e, e.dataset.r);
    });

  let A = null; // arena runtime state
  const newA = () => ({
    readyAt: 0,
    guardCdAt: 0,
    mendCdAt: 0,
    lastMine: 0,
    lastHis: 0,
    hpMe: MAXHP,
    hpHim: MAXHP,
    feed: [],
    myRolls: 0,
    bestHit: 0,
    auto: false,
    finished: false,
    lastKey: "",
    ticking: false,
    skew: 0,
  });

  function ensureArena() {
    let a = $id("duelArena");
    if (a) return a;
    A = newA();
    a = document.createElement("div");
    a.id = "duelArena";
    a.innerHTML = `<div class="dlTitle">⚔️ DUEL</div><div class="dlClock" id="dlClock">2:00</div>
      <div class="dlBars">
        <div class="dlSide"><div class="dlName" id="dlN1">You</div><div class="dlHp"><div class="tr" id="dlT1"></div><div class="fl" id="dlF1"></div><b id="dlH1"></b></div><div class="dlCh" id="dlCh1"><i></i></div></div>
        <div class="dlSide opp"><div class="dlName" id="dlN2"></div><div class="dlHp"><div class="tr" id="dlT2"></div><div class="fl" id="dlF2"></div><b id="dlH2"></b></div><div class="dlCh" id="dlCh2"><i></i></div></div>
      </div>
      <div class="dlCards">
        <div class="dlCard" id="dlC1"><div class="dlName">You</div><div class="dlDigits" id="dlD1">?????</div><div class="dlRar" id="dlR1"></div><div class="dlOne" id="dlO1"></div></div>
        <div class="dlCard" id="dlC2"><div class="dlName" id="dlCn2"></div><div class="dlDigits" id="dlD2">?????</div><div class="dlRar" id="dlR2"></div><div class="dlOne" id="dlO2"></div></div>
      </div>
      <div class="dlMsg" id="dlMsg"></div>
      <div class="dlCtl" id="dlCtl">
        <button class="dlRoll" id="dlRoll" type="button"><i></i><span>🎲 ROLL <small style="font-size:12px">(Space)</small></span></button>
        <button class="dlAb" id="dlGuard" type="button"><i></i>🛡️ Guard<small>Q • 70% less dmg, 4s</small></button>
        <button class="dlAb" id="dlMend" type="button"><i></i>💚 Mend<small id="dlMendS">W • +600 HP</small></button>
        <button class="dlAb" id="dlUlt" type="button"><i></i>⚡ Ultimate<small>E • 700 dmg, ignores guard</small></button>
      </div>
      <label style="font-size:13px;opacity:.85"><input type="checkbox" id="dlAuto"> Auto-roll whenever ready</label>
      <div class="dlFeed" id="dlFeed"></div>
      <div id="dlFoot"></div>`;
    document.body.appendChild(a);
    $id("dlRoll").onclick = doRoll;
    $id("dlGuard").onclick = () => ability("duel_guard", "guard");
    $id("dlMend").onclick = () => ability("duel_mend", "mend");
    $id("dlUlt").onclick = () => ability("duel_ult", "ult");
    $id("dlAuto").onchange = (e) => (A.auto = e.target.checked);
    const foot = document.createElement("div");
    foot.id = "dlGiveUp";
    foot.innerHTML = `<button class="dlBtn" id="dlFold" style="padding:6px 14px;font-size:12px;opacity:.7">🏳️ Give up</button>`;
    a.appendChild(foot);
    $id("dlFold").onclick = async () => {
      if (!$id("dlFold").dataset.sure) {
        $id("dlFold").dataset.sure = 1;
        $id("dlFold").textContent = "Click again to forfeit";
        setTimeout(
          () =>
            $id("dlFold") &&
            (delete $id("dlFold").dataset.sure,
            ($id("dlFold").textContent = "🏳️ Give up")),
          3000,
        );
        return;
      }
      await call("duel_forfeit", { p_id: cur.id });
      poll();
    };
    document.addEventListener("keydown", keys);
    A.timer = setInterval(tickUI, 100);
    return a;
  }
  function closeArena() {
    const a = $id("duelArena");
    if (a) a.remove();
    document.removeEventListener("keydown", keys);
    if (A) clearInterval(A.timer);
    A = null;
  }
  function keys(e) {
    if (!$id("duelArena") || !cur || cur.status !== "active") return;
    if (
      e.target &&
      /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) &&
      e.target.type !== "checkbox"
    )
      return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "enter") {
      e.preventDefault();
      doRoll();
    } else if (k === "q" || k === "1") ability("duel_guard", "guard");
    else if (k === "w" || k === "2") ability("duel_mend", "mend");
    else if (k === "e" || k === "3") ability("duel_ult", "ult");
  }

  const now = () => Date.now() + (A ? A.skew : 0);
  const ms = (t) => (t ? new Date(t).getTime() : 0);
  const started = (d) => now() >= ms(d.round_at);

  function pop(slot, text, color) {
    const c = $id("dlC" + slot);
    if (!c) return;
    const p = document.createElement("div");
    p.className = "dlDmg";
    p.style.color = color;
    p.textContent = text;
    c.appendChild(p);
    setTimeout(() => p.remove(), 1200);
    c.classList.add(slot === 1 ? "hit" : "deal");
    setTimeout(() => c.classList.remove("hit", "deal"), 350);
  }
  function feed(text, cls) {
    A.feed.unshift([text, cls]);
    A.feed = A.feed.slice(0, 5);
    const f = $id("dlFeed");
    if (f)
      f.innerHTML = A.feed
        .map(([t, c]) => `<div class="${c}">${t}</div>`)
        .join("");
  }
  function showRoll(slot, roll, rarity, oneIn) {
    $id("dlD" + slot).textContent = roll || "?????";
    $id("dlR" + slot).innerHTML = rarity ? rarityHTML(rarity) : "";
    colorRarity($id("dlR" + slot));
    $id("dlO" + slot).textContent = oneIn ? `1 in ${big(Number(oneIn))}` : "";
  }

  /* apply a new row to the arena: bars, hit effects, their last move */
  function arena(d, prev) {
    const a = ensureArena();
    if (!A) return;
    const m = side(d, true);
    const h = side(d, false);
    $id("dlN1").textContent = "You";
    $id("dlN2").textContent = oppName(d);
    $id("dlCn2").textContent = oppName(d);
    /* hp bars */
    const setHp = (slot, hp) => {
      const pct = Math.max(0, Math.min(100, (hp / MAXHP) * 100));
      $id("dlF" + slot).style.width = pct + "%";
      $id("dlT" + slot).style.width = pct + "%";
      $id("dlH" + slot).textContent = `${n(hp)} / ${n(MAXHP)}`;
    };
    setHp(1, m.hp);
    setHp(2, h.hp);
    /* damage effects (compare with what we showed last) */
    if (m.hp < A.hpMe) {
      const lost = A.hpMe - m.hp;
      pop(1, "-" + n(lost), "#ff6b81");
      if (lost >= 200) {
        a.classList.remove("shake");
        void a.offsetWidth;
        a.classList.add("shake");
      }
      sfx("curse");
    } else if (m.hp > A.hpMe && A.hpMe < MAXHP)
      pop(1, "+" + n(m.hp - A.hpMe), "#8ee6ad");
    if (h.hp < A.hpHim) pop(2, "-" + n(A.hpHim - h.hp), "#7cf7ff");
    else if (h.hp > A.hpHim && A.hpHim < MAXHP)
      pop(2, "+" + n(h.hp - A.hpHim), "#8ee6ad");
    A.hpMe = m.hp;
    A.hpHim = h.hp;
    /* charge */
    [
      [1, m.charge],
      [2, h.charge],
    ].forEach(([s, c]) => {
      $id("dlCh" + s).firstElementChild.style.width = Math.min(100, c) + "%";
      $id("dlCh" + s).classList.toggle("full", c >= 100);
    });
    /* their newest move */
    const hl = h.last;
    if (hl && hl.at && hl.at !== A.lastHis) {
      A.lastHis = hl.at;
      if (hl.ult) {
        showRoll(2, "⚡⚡⚡⚡⚡", "ULTIMATE", 0);
        feed(
          `⚡ ${esc(oppName(d))} unleashed their ULTIMATE for ${n(hl.dmg)}!`,
          "him",
        );
        sfx("buy");
      } else {
        showRoll(2, hl.roll, hl.rarity, hl.one_in);
        feed(
          `${esc(oppName(d))} rolled <b>${esc(hl.roll)}</b> (${esc(hl.rarity)}) for ${n(hl.dmg)}${hl.guarded ? " 🛡️ guarded" : ""}`,
          "him",
        );
      }
    }
    /* guard visuals */
    $id("dlC1").classList.toggle("guard", ms(m.guard) > now());
    $id("dlC2").classList.toggle("guard", ms(h.guard) > now());
    if (d.status === "finished") return finish(d, m, h);
    /* clock nudge */
    if (d.ends_at && now() > ms(d.ends_at) + 800 && !A.ticking) {
      A.ticking = true;
      call("duel_tick", { p_id: d.id }).finally(() => (A.ticking = false));
    }
  }

  /* 10x a second: countdown, timer, cooldown overlays */
  function tickUI() {
    const d = cur;
    if (!A || !d || !$id("duelArena") || d.status !== "active") return;
    const m = side(d, true);
    const t0 = ms(d.round_at) - now();
    const msg = $id("dlMsg");
    let cd = $id("dlCount");
    if (t0 > 0) {
      const k = Math.ceil(t0 / 1000);
      if (!cd) {
        cd = document.createElement("div");
        cd.id = "dlCount";
        cd.className = "dlCount";
        $id("duelArena").appendChild(cd);
      }
      cd.textContent = k;
      msg.textContent = "Get ready…";
    } else {
      if (cd) {
        cd.textContent = "FIGHT!";
        setTimeout(() => cd.remove(), 600);
        cd.id = "";
        sfx("open");
      }
      msg.textContent = "";
    }
    const left = Math.max(0, ms(d.ends_at) - now());
    $id("dlClock").textContent =
      t0 > 0
        ? "2:00"
        : `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`;
    const go = t0 <= 0;
    const rc = Math.max(0, A.readyAt - Date.now());
    $id("dlRoll").disabled = !go || (rc > 0 && false);
    $id("dlRoll").firstElementChild.style.transform =
      `scaleX(${Math.min(1, rc / ROLL_CD)})`;
    const gcd = Math.max(ms(m.guardCd) - now(), A.guardCdAt - Date.now());
    const mcd = Math.max(ms(m.mendCd) - now(), A.mendCdAt - Date.now());
    const set = (id, cdMs, total, ok) => {
      const b = $id(id);
      b.firstElementChild.style.transform = `scaleX(${Math.max(0, Math.min(1, cdMs / total))})`;
      b.disabled = !go || cdMs > 0 || !ok;
      b.classList.toggle("ready", !b.disabled);
    };
    set("dlGuard", gcd, 12000, true);
    set("dlMend", mcd, 16000, m.mends < 2 && m.hp < MAXHP);
    $id("dlMendS").textContent = `W • +600 HP (${2 - m.mends} left)`;
    set("dlUlt", 0, 1, m.charge >= 100);
    if (go && A.auto && rc <= 0) doRoll();
  }

  /* ---------- actions ---------- */
  let acting = false;
  function adopt(row) {
    if (row && row.id && cur && row.id === cur.id) {
      /* the rpc returns the fresh row: sync our clock from the move we just made */
      const mine = amChallenger(row) ? row.last_c : row.last_o;
      if (mine && mine.at && A)
        A.skew = Math.round(mine.at * 1000 - Date.now());
      applyRow(row);
    }
  }
  async function doRoll() {
    const d = cur;
    if (
      !d ||
      d.status !== "active" ||
      !A ||
      acting ||
      !started(d) ||
      Date.now() < A.readyAt
    )
      return;
    acting = true;
    A.readyAt = Date.now() + ROLL_CD;
    const buf = new Uint32Array(5);
    (G.crypto || window.crypto).getRandomValues(buf);
    const chars = Array.from(buf, (v) => String(v % 10));
    let an = { rarity: "", oneIn: 1 };
    try {
      an = analyze(chars);
    } catch (e) {}
    const roll = chars.join("");
    const rarity = String(an.rarity || "");
    const oneIn = Number(an.oneIn) || 1;
    sfx("click");
    showRoll(1, roll, rarity, oneIn);
    const r = await call("duel_attack", {
      p_id: d.id,
      p_roll: roll,
      p_one_in: oneIn,
      p_rarity: rarity,
    });
    acting = false;
    if (r.error) {
      if (!/Too fast|not started/i.test(r.error.message))
        say("⚠️ " + r.error.message);
      A.readyAt = Date.now() + 400;
      return;
    }
    const row = r.data;
    const mine = row && (amChallenger(row) ? row.last_c : row.last_o);
    if (mine && mine.at !== A.lastMine) {
      A.lastMine = mine.at;
      A.myRolls++;
      A.bestHit = Math.max(A.bestHit, mine.dmg || 0);
      pop(2, "-" + n(mine.dmg), mine.raw >= 150 ? "#ffd36b" : "#7cf7ff");
      feed(
        `You rolled <b>${esc(roll)}</b> (${esc(rarity)}) for ${n(mine.dmg)}${mine.guarded ? " 🛡️ guarded" : ""}`,
        "me",
      );
      if (!mine.guarded && mine.raw >= 150) sfx("buy");
    }
    adopt(row);
  }
  async function ability(fn, name) {
    const d = cur;
    if (!d || d.status !== "active" || !A || !started(d)) return;
    const m = side(d, true);
    if (name === "ult" && m.charge < 100) return;
    if (name === "guard") A.guardCdAt = Date.now() + 12000;
    if (name === "mend") A.mendCdAt = Date.now() + 16000;
    const r = await call(fn, { p_id: d.id });
    if (r.error) {
      if (name === "guard") A.guardCdAt = 0;
      if (name === "mend") A.mendCdAt = 0;
      say("⚠️ " + r.error.message);
      return;
    }
    if (name === "guard") {
      feed("🛡️ You raised your guard!", "me");
      sfx("buy");
    }
    if (name === "mend") {
      feed("💚 You mended 600 HP", "me");
      sfx("buy");
    }
    if (name === "ult") {
      feed("⚡ You unleashed your ULTIMATE for 700!", "me");
      showRoll(1, "⚡⚡⚡⚡⚡", "ULTIMATE", 0);
      pop(2, "-700", "#ff4fd8");
      sfx("curse");
      A.bestHit = Math.max(A.bestHit, 700);
    }
    adopt(r.data);
  }

  /* ---------- rewards: small Forge materials for finishing a duel (max 10 rewarded duels a day) ---------- */
  function duelReward(d, won, streak) {
    try {
      const day = new Date().toISOString().slice(0, 10);
      const rec = JSON.parse(localStorage.getItem("digitRollDuelRew") || "{}");
      if (rec.day !== day) {
        rec.day = day;
        rec.n = 0;
        rec.ids = [];
      }
      if ((rec.ids || []).indexOf(d.id) >= 0 || rec.n >= 10) return "";
      rec.n++;
      rec.ids.push(d.id);
      localStorage.setItem("digitRollDuelRew", JSON.stringify(rec));
      const F = G.drForge;
      if (!F) return "";
      const dust = won ? 60 + 10 * Math.min(10, streak) : 15;
      F.addMat("dust", dust);
      let t = `+${dust} ✨`;
      if (won) {
        F.addMat("spark", 4);
        t += " +4 ⚡";
        if (streak >= 3) {
          F.addMat("ember", 1 + Math.floor(streak / 5));
          t += ` +${1 + Math.floor(streak / 5)} 🔥`;
        }
      }
      return t;
    } catch (e) {
      return "";
    }
  }

  async function finish(d, m, h) {
    if (!A || A.finished) return;
    A.finished = true;
    arenaLocked = true;
    const won = d.winner_id === me().id;
    const draw = !d.winner_id;
    const why =
      {
        ko: won ? "KO!" : "KO'd",
        time: "on time (more HP)",
        forfeit: won ? "opponent gave up" : "you gave up",
      }[d.note] || "";
    $id("dlMsg").innerHTML = draw
      ? '🤝 <span style="color:#ffd36b">DRAW</span>'
      : won
        ? `🏆 <span style="color:#7cf7ff">YOU WON THE DUEL!</span> <small style="opacity:.7">${esc(why)}</small>`
        : `💀 <span style="color:#ff6b81">${esc(oppName(d))} won the duel</span> <small style="opacity:.7">${esc(why)}</small>`;
    sfx(won ? "buy" : "curse");
    $id("dlRoll").disabled = true;
    ["dlGuard", "dlMend", "dlUlt"].forEach((i) => {
      $id(i).disabled = true;
      $id(i).classList.remove("ready");
    });
    $id("dlGiveUp") && $id("dlGiveUp").remove();
    let rec = "";
    let streak = 0;
    try {
      const r = await sb()
        .from("duel_stats")
        .select("*")
        .eq("player_id", me().id)
        .maybeSingle();
      if (r.data) {
        streak = r.data.streak || 0;
        rec = `<div style="opacity:.8">Your record: <b>${r.data.wins}W – ${r.data.losses}L</b> • streak ${r.data.streak} (best ${r.data.best_streak})</div>`;
      }
    } catch (e) {}
    const rew = draw ? "" : duelReward(d, won, streak);
    const oppId = amChallenger(d) ? d.opponent_id : d.challenger_id;
    $id("dlFoot").innerHTML =
      `<table><tr><th></th><th>You</th><th>${esc(oppName(d))}</th></tr>
      <tr><td>HP left</td><td>${n(m.hp)}</td><td>${n(h.hp)}</td></tr>
      <tr><td>Damage dealt</td><td>${n(m.dealt)}</td><td>${n(h.dealt)}</td></tr>
      <tr><td>Your rolls / best hit</td><td colspan="2">${A.myRolls} / ${n(A.bestHit)}</td></tr></table>${rec}${rew ? `<div style="margin-top:8px">🔨 Duel reward: <b>${rew}</b></div>` : ""}
      <div style="margin-top:12px;display:flex;gap:10px;justify-content:center"><button class="dlBtn" id="dlRe" style="min-width:150px">🔁 Rematch</button><button class="dlBtn go" id="dlClose" style="min-width:150px">Close</button></div><div id="dlReErr" style="color:#ff8aa0;font-size:13px;margin-top:6px"></div>`;
    const done = () => {
      closeArena();
      arenaLocked = false;
      cur = null;
      curId = null;
    };
    $id("dlClose").onclick = done;
    $id("dlRe").onclick = async () => {
      $id("dlRe").disabled = true;
      const r3 = await call("duel_challenge", {
        p_opponent: oppId,
        p_best_of: 3,
      });
      if (r3.error) {
        $id("dlReErr").textContent = r3.error.message;
        $id("dlRe").disabled = false;
        return;
      }
      say("⚔️ Rematch sent!");
      done();
      poll();
    };
  }

  /* ==========================================================
     PROFILE INTEGRATION (called from social.js openProfile)
     ========================================================== */
  G.drDuelProfile = async function (body, pid, isMe) {
    const holder = document.createElement("div");
    body.appendChild(holder);
    let stats = null;
    try {
      const r = await sb()
        .from("duel_stats")
        .select("*")
        .eq("player_id", pid)
        .maybeSingle();
      stats = r.data;
    } catch (e) {}
    const w = stats ? stats.wins : 0;
    const l = stats ? stats.losses : 0;
    const tile = (lab, v) =>
      `<div class="drProfTile"><span>${lab}</span><b>${v}</b></div>`;
    let h2h = "";
    if (!isMe && me()) {
      try {
        const r = await sb()
          .from("duels")
          .select("challenger_id,opponent_id,winner_id")
          .eq("status", "finished")
          .or(`challenger_id.eq.${pid},opponent_id.eq.${pid}`)
          .order("id", { ascending: false })
          .limit(50);
        const mine = (r.data || []).filter(
          (x) => x.challenger_id === me().id || x.opponent_id === me().id,
        );
        const mw = mine.filter((x) => x.winner_id === me().id).length;
        h2h = tile(
          "🤝 You vs them",
          mine.length ? `${mw}W – ${mine.length - mw}L` : "never met",
        );
      } catch (e) {}
    }
    const wr = w + l ? Math.round((w / (w + l)) * 100) + "%" : "—";
    let html = `<div class="dlRec">${tile("⚔️ Duels", `${w}W – ${l}L`)}${tile("Win rate", wr)}${h2h}${tile("Win streak", stats ? `${stats.streak} (best ${stats.best_streak})` : "0")}</div>`;
    if (!isMe && me()) {
      html += `<button class="dlBtn go" id="dlGo" type="button" style="width:100%">⚔️ Challenge to a PvP duel</button><div id="dlErr" style="color:#ff8aa0;margin-top:6px;font-size:13px"></div>`;
    } else if (!isMe) {
      html += `<div style="opacity:.7">Log in to challenge this player to a duel.</div>`;
    }
    holder.innerHTML = html;
    const go = holder.querySelector("#dlGo");
    if (go)
      go.onclick = async () => {
        go.disabled = true;
        const r = await call("duel_challenge", {
          p_opponent: pid,
          p_best_of: 3,
        });
        go.disabled = false;
        if (r.error) {
          holder.querySelector("#dlErr").textContent = r.error.message;
          return;
        }
        say("⚔️ Challenge sent!");
        const ov = $id("drProfOv");
        if (ov) ov.classList.remove("open");
        poll();
      };
  };

  /* ==========================================================
     PROGRESS TAB: my record, recent duels and the top duelists
     ========================================================== */
  let dash = null;
  let dashAt = 0;
  async function loadDash() {
    const c = sb();
    const u = me();
    if (!c || !u) return;
    dashAt = Date.now();
    const out = { mine: null, top: [], recent: [], names: {} };
    try {
      out.mine = (
        await c
          .from("duel_stats")
          .select("*")
          .eq("player_id", u.id)
          .maybeSingle()
      ).data;
      out.top =
        (
          await c
            .from("duel_stats")
            .select("*")
            .order("wins", { ascending: false })
            .limit(10)
        ).data || [];
      out.recent =
        (
          await c
            .from("duels")
            .select("*")
            .eq("status", "finished")
            .or(`challenger_id.eq.${u.id},opponent_id.eq.${u.id}`)
            .order("id", { ascending: false })
            .limit(10)
        ).data || [];
      const ids = out.top.map((t) => t.player_id);
      if (ids.length) {
        const r = await c.from("profiles").select("id,username").in("id", ids);
        (r.data || []).forEach((p) => (out.names[p.id] = p.username));
      }
    } catch (e) {}
    dash = out;
    if (G.drProgress && G.drProgress.isOpen()) G.drProgress.rerender();
  }
  function renderDuelTab() {
    if (!me())
      return '<div class="pgBanner">⚔️ Duels<br><span class="pgSub">Log in to duel other players. Open any player\'s profile and press “Challenge to a PvP duel”.</span></div>';
    if (!dash || Date.now() - dashAt > 30000) loadDash();
    const d = dash || { mine: null, top: [], recent: [], names: {} };
    const m = d.mine || { wins: 0, losses: 0, streak: 0, best_streak: 0 };
    const tot = m.wins + m.losses;
    const tile = (lab, v) =>
      `<div class="pgCard" style="text-align:center"><div class="pgSub">${lab}</div><b style="font-size:22px">${v}</b></div>`;
    const recent = d.recent
      .map((x) => {
        const won = x.winner_id === me().id;
        const draw = !x.winner_id;
        const c = x.challenger_id === me().id;
        const op = c ? x.opponent_name : x.challenger_name;
        const dealt = c ? x.dealt_c : x.dealt_o;
        const left = c ? x.hp_c : x.hp_o;
        return `<div class="pgCard" style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><b style="color:${draw ? "#ffd36b" : won ? "#8ee6ad" : "#ff6b7a"}">${draw ? "DRAW" : won ? "WIN" : "LOSS"}</b><span style="flex:1">vs ${esc(op)}</span><span class="pgSub">${n(dealt || 0)} dmg • ${n(left || 0)} HP left${x.note ? " • " + esc(x.note) : ""}</span></div>`;
      })
      .join("");
    const top = d.top
      .map(
        (t, i) =>
          `<div class="pgCard" style="display:flex;gap:10px;margin-bottom:6px"><b>#${i + 1}</b><span style="flex:1">${esc(d.names[t.player_id] || "Player")}${t.player_id === me().id ? " (you)" : ""}</span><span>${t.wins}W – ${t.losses}L</span><span class="pgSub">best streak ${t.best_streak}</span></div>`,
      )
      .join("");
    return `<div class="pgBanner">⚔️ PvP Duels<br><span class="pgSub">Open a player's profile (click a name on the leaderboard) → Challenge. A duel is a live boss fight against that player: 5,000 HP each, roll to hit, 🛡️ guard, 💚 mend and ⚡ ultimate. Finishing a duel drops Forge materials (up to 10 rewarded duels a day, win streaks add more).</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:10px 0">${tile("Record", `${m.wins}W – ${m.losses}L`)}${tile("Win rate", tot ? Math.round((m.wins / tot) * 100) + "%" : "—")}${tile("Streak", m.streak)}${tile("Best streak", m.best_streak)}</div>
      <h3>🕘 Recent duels</h3>${recent || '<div class="pgSub">No finished duels yet.</div>'}
      <h3>🏆 Top duelists</h3>${top || '<div class="pgSub">Nobody has won a duel yet.</div>'}`;
  }
  if (G.drProgress && G.drProgress.addTab)
    G.drProgress.addTab("duels", "⚔️ Duels", renderDuelTab);

  window.drDuelPoll = poll;
  setTimeout(poll, 1200);
})();
