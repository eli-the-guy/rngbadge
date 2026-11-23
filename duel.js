/* ============================================================
   DIGIT ROLL — DUELS
   Open someone's profile → "Challenge to a duel". They get a notification and
   can accept or decline. Best of 1 / 3 / 5 rounds: every round each player gets a
   plain 5-digit duel roll (no charms, gloves or upgrades, so it's fair) and the
   rarer roll wins the round. First to the target wins; exact ties are re-rolled.
   Win/loss record and streak show on profiles.
   Needs duel-setup.sql. Loaded after social.js.
   ============================================================ */

(function () {
  "use strict";

  const G = window;
  const $id = (id) => document.getElementById(id);
  const n = (v) => Number(v || 0).toLocaleString();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sfx = (a) => typeof G.drSfx === "function" && G.drSfx(a);
  const me = () => (typeof currentUser !== "undefined" ? currentUser : null);
  const sb = () => (typeof supabaseClient !== "undefined" ? supabaseClient : null);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const big = (v) => (v >= 1e15 ? Number(v).toExponential(2).replace("e+", " × 10^") : n(v));

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
  #duelArena{position:fixed;inset:0;z-index:9900;background:radial-gradient(circle at 50% 20%,#2a1650,#080a18 70%);color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;overflow:auto}
  #duelArena .dlTitle{font:900 clamp(20px,4vw,32px) system-ui;letter-spacing:3px;text-shadow:0 0 22px #ffb52e}
  #duelArena .dlScore{display:flex;gap:26px;align-items:center;font:900 clamp(18px,3.4vw,28px) system-ui}
  #duelArena .dlPips{display:flex;gap:6px}
  #duelArena .dlPip{width:16px;height:16px;border-radius:50%;border:2px solid #ffb52e}
  #duelArena .dlPip.on{background:#ffb52e;box-shadow:0 0 12px #ffb52e}
  #duelArena .dlCards{display:flex;gap:clamp(10px,3vw,40px);flex-wrap:wrap;justify-content:center}
  #duelArena .dlCard{width:min(330px,90vw);padding:18px;border-radius:20px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.14);text-align:center}
  #duelArena .dlCard.win{border-color:#7cf7ff;box-shadow:0 0 36px rgba(124,247,255,.5)}
  #duelArena .dlCard.lose{opacity:.6}
  #duelArena .dlName{font-weight:800;font-size:16px;opacity:.9}
  #duelArena .dlDigits{font:900 clamp(38px,8vw,64px) monospace;letter-spacing:6px;margin:10px 0}
  #duelArena .dlRar{font-weight:900;font-size:18px;min-height:24px}
  #duelArena .dlOne{font-size:13px;opacity:.75;min-height:18px}
  #duelArena .dlMsg{font:800 clamp(18px,3.6vw,30px) system-ui;min-height:40px;text-align:center}
  #duelArena table{border-collapse:collapse;font-size:14px}
  #duelArena td,#duelArena th{padding:5px 12px;border-bottom:1px solid rgba(255,255,255,.1);text-align:center}
  .dlRec{display:flex;gap:10px;margin:12px 0;flex-wrap:wrap}
  .dlRec .drProfTile{flex:1;min-width:90px}`;
  document.head.appendChild(st);

  /* ==========================================================
     STATE + SYNC
     ========================================================== */
  let cur = null; // my current duel row
  let rounds = []; // duel_rounds rows for cur
  let curId = null;
  const notified = new Set();
  const rolled = new Set(); // "id:round" we already rolled
  const revealed = new Set(); // "id:round" shown
  let busy = false;
  let lastErr = 0;

  async function fetchLatest() {
    const c = sb();
    const u = me();
    if (!c || !u) return null;
    try {
      if (curId) {
        const r = await c.from("duels").select("*").eq("id", curId).maybeSingle();
        if (r.data) return r.data;
      }
      const r = await c.from("duels").select("*").or(`challenger_id.eq.${u.id},opponent_id.eq.${u.id}`).in("status", ["pending", "active"]).order("id", { ascending: false }).limit(1);
      return (r.data && r.data[0]) || null;
    } catch (e) {
      return null;
    }
  }
  async function fetchRounds(id) {
    const c = sb();
    try {
      const r = await c.from("duel_rounds").select("*").eq("duel_id", id).order("round", { ascending: true });
      return r.data || [];
    } catch (e) {
      return [];
    }
  }

  async function poll() {
    if (busy || !me() || !sb()) return;
    busy = true;
    try {
      const row = await fetchLatest();
      if (!row) {
        if (curId && cur && (cur.status === "pending" || cur.status === "active")) {
          cur = null;
          curId = null;
          clearUI();
        }
        return;
      }
      const prev = cur && cur.id === row.id ? cur : null;
      cur = row;
      curId = row.id;
      if (row.status === "active" || row.status === "finished") rounds = await fetchRounds(row.id);
      await render(row, prev);
    } finally {
      busy = false;
    }
  }
  setInterval(() => poll(), 1500);

  /* realtime nudge (the poll above is the fallback) */
  let chan = null;
  function subscribe() {
    const c = sb();
    if (chan || !c || !me()) return;
    try {
      chan = c
        .channel("duels-" + me().id)
        .on("postgres_changes", { event: "*", schema: "public", table: "duels" }, () => poll())
        .on("postgres_changes", { event: "*", schema: "public", table: "duel_rounds" }, () => poll())
        .subscribe();
    } catch (e) {}
  }
  setInterval(subscribe, 4000);

  /* ==========================================================
     RENDER
     ========================================================== */
  const amChallenger = (d) => me() && d.challenger_id === me().id;
  const oppName = (d) => (amChallenger(d) ? d.opponent_name : d.challenger_name);

  function clearUI() {
    ["duelInvite", "duelWait"].forEach((i) => $id(i) && $id(i).remove());
    if ($id("duelArena") && !arenaLocked) $id("duelArena").remove();
  }
  let arenaLocked = false; // keeps the result screen up until closed

  async function render(d, prev) {
    if (d.status === "pending") {
      if (amChallenger(d)) showWait(d);
      else showInvite(d);
      if (new Date(d.expires_at) < Date.now()) call("duel_tick", { p_id: d.id });
      return;
    }
    $id("duelInvite") && $id("duelInvite").remove();
    $id("duelWait") && $id("duelWait").remove();
    if (d.status === "active" || d.status === "finished") return arena(d, prev);
    /* declined / expired / cancelled */
    if (prev && prev.status === "pending" && amChallenger(d)) {
      say(d.status === "declined" ? `❌ ${d.opponent_name} declined your duel.` : `⌛ Your duel challenge to ${d.opponent_name} ${d.status === "cancelled" ? "was cancelled" : "expired"}.`);
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
      if (typeof G.drShowAnnouncement === "function") G.drShowAnnouncement(`⚔️ ${d.challenger_name} challenges you to a duel! (best of ${d.best_of})`, { icon: "⚔️", color: "#ffb52e", glow: true });
    }
    if (!box) {
      box = document.createElement("div");
      box.id = "duelInvite";
      document.body.appendChild(box);
    }
    const secs = Math.max(0, Math.round((new Date(d.expires_at) - Date.now()) / 1000));
    box.innerHTML = `<h3>⚔️ Duel challenge!</h3><div><b>${esc(d.challenger_name)}</b> wants to duel you — <b>best of ${d.best_of}</b>. Each round you both roll a plain 5-digit number; the rarer roll wins. <span style="opacity:.7">(${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} left)</span></div>
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
    box.innerHTML = `<span>⚔️ Waiting for <b>${esc(d.opponent_name)}</b> to accept… (best of ${d.best_of})</span><button id="dlCancel">Cancel</button>`;
    $id("dlCancel").onclick = async () => {
      await call("duel_respond", { p_id: d.id, p_accept: false });
      box.remove();
      cur = null;
      curId = null;
    };
  }

  /* ---------- arena ---------- */
  const rarityHTML = (r) => `<span class="rarity" data-r="${esc(r || "")}">${esc(r || "")}</span>`;
  const colorRarity = (root) =>
    root.querySelectorAll("[data-r]").forEach((e) => {
      if (typeof applyRarityColor === "function") applyRarityColor(e, e.dataset.r);
    });

  function ensureArena() {
    let a = $id("duelArena");
    if (a) return a;
    a = document.createElement("div");
    a.id = "duelArena";
    a.innerHTML = `<div class="dlTitle">⚔️ DUEL</div><div class="dlScore"><span id="dlN1"></span><span class="dlPips" id="dlP1"></span><span>vs</span><span class="dlPips" id="dlP2"></span><span id="dlN2"></span></div>
      <div class="dlMsg" id="dlMsg"></div>
      <div class="dlCards"><div class="dlCard" id="dlC1"><div class="dlName" id="dlCn1"></div><div class="dlDigits" id="dlD1">?????</div><div class="dlRar" id="dlR1"></div><div class="dlOne" id="dlO1"></div></div>
      <div class="dlCard" id="dlC2"><div class="dlName" id="dlCn2"></div><div class="dlDigits" id="dlD2">?????</div><div class="dlRar" id="dlR2"></div><div class="dlOne" id="dlO2"></div></div></div>
      <div id="dlFoot"></div>`;
    document.body.appendChild(a);
    return a;
  }
  const spin = {}; // slot -> interval
  function spinDigits(slot, finalText, ms) {
    return new Promise((res) => {
      const el = $id("dlD" + slot);
      clearInterval(spin[slot]);
      const t0 = performance.now();
      spin[slot] = setInterval(() => {
        const k = (performance.now() - t0) / ms;
        if (k >= 1) {
          clearInterval(spin[slot]);
          el.textContent = finalText;
          return res();
        }
        el.textContent = finalText
          .split("")
          .map((ch, i) => (k > (i + 1) / (finalText.length + 1) ? ch : String(Math.floor(Math.random() * 10))))
          .join("");
      }, 55);
    });
  }
  function setCard(slot, row, win, lose) {
    $id("dlR" + slot).innerHTML = row ? rarityHTML(row.rarity) : "";
    colorRarity($id("dlR" + slot));
    $id("dlO" + slot).textContent = row ? `1 in ${big(Number(row.one_in))}` : "";
    $id("dlC" + slot).classList.toggle("win", !!win);
    $id("dlC" + slot).classList.toggle("lose", !!lose);
  }
  function pips(slot, score, need) {
    $id("dlP" + slot).innerHTML = Array.from({ length: need }, (_, i) => `<i class="dlPip ${i < score ? "on" : ""}"></i>`).join("");
  }

  let ticking = false;
  async function arena(d, prev) {
    const a = ensureArena();
    const mine = amChallenger(d);
    const need = (d.best_of + 1) / 2;
    $id("dlN1").textContent = "You";
    $id("dlN2").textContent = oppName(d);
    $id("dlCn1").textContent = "You";
    $id("dlCn2").textContent = oppName(d);
    pips(1, mine ? d.score_c : d.score_o, need);
    pips(2, mine ? d.score_o : d.score_c, need);
    const msg = $id("dlMsg");
    const foot = $id("dlFoot");

    if (d.status === "finished") return finish(d, need);

    /* timeout nudge */
    const t = new Date(d.round_at).getTime();
    if (Date.now() > t + 36000 && !ticking) {
      ticking = true;
      call("duel_tick", { p_id: d.id }).finally(() => (ticking = false));
    }
    const key = `${d.id}:${d.round}`;
    const myRow = rounds.find((r) => r.round === d.round && r.player_id === me().id);
    const hisRow = rounds.find((r) => r.round === d.round && r.player_id !== me().id);

    /* a tie wiped the round: let us roll again */
    if (rolled.has(key) && !myRow && prev && prev.round_at !== d.round_at) {
      rolled.delete(key);
      $id("dlD1").textContent = $id("dlD2").textContent = "?????";
      setCard(1, null);
      setCard(2, null);
      say("🤝 Exact tie — re-rolling the round!");
    }
    if (prev && d.round > prev.round) await showRoundResult(prev.round, d);

    const wait = t - Date.now();
    if (wait > 0) {
      msg.textContent = `Round ${d.round} — roll in ${Math.ceil(wait / 1000)}…`;
      foot.innerHTML = "";
      if (!myRow) {
        $id("dlD1").textContent = $id("dlD2").textContent = "?????";
        setCard(1, null);
        setCard(2, null);
      }
      return;
    }
    if (!rolled.has(key) && !myRow) {
      rolled.add(key);
      return doRoll(d);
    }
    if (myRow && !hisRow) {
      msg.textContent = `Round ${d.round} — waiting for ${oppName(d)} to roll…`;
      if ($id("dlD1").textContent === "?????") $id("dlD1").textContent = myRow.roll;
      setCard(1, myRow);
    }
    if (myRow && hisRow && !revealed.has(key)) await showRoundResult(d.round, d);
    foot.innerHTML = `<div style="opacity:.6;font-size:13px">Best of ${d.best_of} • first to ${need} • rolls ignore your charms & upgrades</div>`;
  }

  async function doRoll(d) {
    const msg = $id("dlMsg");
    msg.textContent = "ROLLING!";
    const buf = new Uint32Array(5);
    (G.crypto || window.crypto).getRandomValues(buf);
    const chars = Array.from(buf, (v) => String(v % 10));
    let a = { rarity: "", oneIn: 1 };
    try {
      a = analyze(chars);
    } catch (e) {}
    const roll = chars.join("");
    const rarity = String(a.rarity || "");
    const oneIn = Number(a.oneIn) || 1;
    sfx("open");
    spinDigits(1, roll, 1300);
    let err = null;
    for (let i = 0; i < 8; i++) {
      const r = await call("duel_submit", { p_id: d.id, p_round: d.round, p_roll: roll, p_one_in: oneIn, p_rarity: rarity });
      err = r.error;
      if (!err || !/not started/i.test(err.message)) break;
      await sleep(900); // clock skew: wait for the server's round window
    }
    if (err) {
      if (!/Wrong round|not active/i.test(err.message)) say("⚠️ " + err.message);
      rolled.delete(`${d.id}:${d.round}`);
      return;
    }
    await sleep(1350);
    setCard(1, { rarity, one_in: oneIn });
    $id("dlMsg").textContent = "Waiting for " + oppName(d) + "…";
  }

  async function showRoundResult(round, d) {
    const key = `${d.id}:${round}`;
    if (revealed.has(key)) return;
    const rs = rounds.length ? rounds : await fetchRounds(d.id);
    const my = rs.find((r) => r.round === round && r.player_id === me().id);
    const his = rs.find((r) => r.round === round && r.player_id !== me().id);
    if (!my || !his) return;
    revealed.add(key);
    await Promise.all([spinDigits(1, my.roll, 500), spinDigits(2, his.roll, 1300)]);
    const iWon = Number(my.one_in) > Number(his.one_in);
    setCard(1, my, iWon, !iWon);
    setCard(2, his, !iWon, iWon);
    $id("dlMsg").textContent = iWon ? `🏆 You win round ${round}!` : `💀 ${oppName(d)} wins round ${round}`;
    sfx(iWon ? "buy" : "curse");
    await sleep(2200);
  }

  async function finish(d, need) {
    arenaLocked = true;
    const key = `${d.id}:fin`;
    if (revealed.has(key)) return;
    revealed.add(key);
    const rs = rounds.length ? rounds : await fetchRounds(d.id);
    /* show the last round before the verdict */
    const lastRound = rs.length ? Math.max.apply(null, rs.map((r) => r.round)) : 0;
    if (lastRound) await showRoundResult(lastRound, d);
    const won = d.winner_id === me().id;
    const forfeit = d.note === "forfeit";
    $id("dlMsg").innerHTML = won ? `🏆 <span style="color:#7cf7ff">YOU WON THE DUEL!</span>${forfeit ? " (opponent timed out)" : ""}` : `💀 <span style="color:#ff6b81">${esc(oppName(d))} won the duel</span>${forfeit ? " (you timed out)" : ""}`;
    sfx(won ? "buy" : "curse");
    const byRound = {};
    rs.forEach((r) => ((byRound[r.round] = byRound[r.round] || {})[r.player_id === me().id ? "me" : "him"] = r));
    const rows = Object.keys(byRound)
      .map((k) => {
        const o = byRound[k];
        if (!o.me || !o.him) return `<tr><td>${k}</td><td colspan="2">${o.me ? "opponent didn't roll" : "you didn't roll"}</td></tr>`;
        const w = Number(o.me.one_in) > Number(o.him.one_in);
        return `<tr><td>${k}</td><td style="${w ? "color:#7cf7ff;font-weight:800" : ""}">${esc(o.me.roll)} · ${esc(o.me.rarity)}</td><td style="${!w ? "color:#7cf7ff;font-weight:800" : ""}">${esc(o.him.roll)} · ${esc(o.him.rarity)}</td></tr>`;
      })
      .join("");
    let rec = "";
    try {
      const r = await sb().from("duel_stats").select("*").eq("player_id", me().id).maybeSingle();
      if (r.data) rec = `<div style="opacity:.8">Your record: <b>${r.data.wins}W – ${r.data.losses}L</b> • streak ${r.data.streak} (best ${r.data.best_streak})</div>`;
    } catch (e) {}
    $id("dlFoot").innerHTML = `<table><tr><th>Round</th><th>You</th><th>${esc(oppName(d))}</th></tr>${rows}</table>${rec}<div style="margin-top:12px"><button class="dlBtn go" id="dlClose" style="min-width:160px">Close</button></div>`;
    $id("dlClose").onclick = () => {
      $id("duelArena").remove();
      arenaLocked = false;
      cur = null;
      curId = null;
      rounds = [];
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
      const r = await sb().from("duel_stats").select("*").eq("player_id", pid).maybeSingle();
      stats = r.data;
    } catch (e) {}
    const w = stats ? stats.wins : 0;
    const l = stats ? stats.losses : 0;
    const tile = (lab, v) => `<div class="drProfTile"><span>${lab}</span><b>${v}</b></div>`;
    let html = `<div class="dlRec">${tile("⚔️ Duels", `${w}W – ${l}L`)}${tile("Win streak", stats ? `${stats.streak} (best ${stats.best_streak})` : "0")}</div>`;
    if (!isMe && me()) {
      html += `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><select id="dlBest" style="padding:10px;border-radius:10px;background:#1b2238;color:#fff;border:1px solid rgba(255,255,255,.2)"><option value="1">Best of 1</option><option value="3" selected>Best of 3</option><option value="5">Best of 5</option></select><button class="dlBtn go" id="dlGo" type="button" style="flex:1">⚔️ Challenge to a duel</button></div><div id="dlErr" style="color:#ff8aa0;margin-top:6px;font-size:13px"></div>`;
    } else if (!isMe) {
      html += `<div style="opacity:.7">Log in to challenge this player to a duel.</div>`;
    }
    holder.innerHTML = html;
    const go = holder.querySelector("#dlGo");
    if (go)
      go.onclick = async () => {
        go.disabled = true;
        const r = await call("duel_challenge", { p_opponent: pid, p_best_of: Number(holder.querySelector("#dlBest").value) });
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

  window.drDuelPoll = poll;
  setTimeout(poll, 1200);
})();
