/* Patch notes: admins write them, they pop up automatically for anyone who hasn't seen the newest one,
   and every older one stays readable from the sidebar. Storage: public.patch_notes (patchnotes-setup.sql). */
(function () {
  "use strict";
  const G = window;
  const SEEN = "digitRollPatchSeen";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const isAdmin = () => typeof G.drIsAdmin === "function" && G.drIsAdmin();
  const say = (m) => typeof G.toast === "function" && G.toast(m);
  const sb = () => (typeof supabaseClient !== "undefined" ? supabaseClient : null);
  let notes = [], missing = false, loaded = false, editing = null, view = null, auto = false;

  const css = document.createElement("style");
  css.textContent = `
  #pnOv{position:fixed;inset:0;z-index:10050;display:none;padding:26px 14px;overflow:auto;background:rgba(0,0,0,.78);backdrop-filter:blur(10px)}
  #pnOv.open{display:block}
  .pnBox{width:min(760px,100%);margin:30px auto;background:rgba(18,23,34,.98);border:1px solid rgba(255,255,255,.13);border-radius:22px;padding:24px;box-shadow:0 30px 100px rgba(0,0,0,.6);color:#e8edf8;animation:pnIn .35s ease}
  @keyframes pnIn{from{opacity:0;transform:translateY(16px) scale(.98)}}
  .pnHead{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .pnHead h2{margin:0;font-size:26px;flex:1}
  .pnX{border:0;background:rgba(255,255,255,.08);color:#fff;width:38px;height:38px;border-radius:11px;font-size:20px;cursor:pointer}
  .pnTag{display:inline-block;padding:3px 10px;border-radius:99px;background:rgba(142,230,173,.16);color:#8ee6ad;font-weight:850;font-size:12px;margin-right:8px}
  .pnNew{background:rgba(255,93,115,.2);color:#ff8a9a}
  .pnDate{color:#8e9ab3;font-size:13px}
  .pnTitle{font-size:22px;font-weight:900;margin:8px 0 10px}
  .pnBody h4{margin:16px 0 6px;font-size:15px;color:#8ee6ad;text-transform:uppercase;letter-spacing:.08em}
  .pnBody ul{margin:6px 0;padding-left:20px}.pnBody li{margin:5px 0;line-height:1.5}.pnBody p{margin:7px 0;line-height:1.55}
  .pnList{display:grid;gap:9px;margin-top:6px}
  .pnItem{padding:13px 15px;border-radius:13px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);cursor:pointer;text-align:left;color:inherit;font:inherit;width:100%}
  .pnItem:hover{background:rgba(142,230,173,.1)}
  .pnItem b{display:block;margin:5px 0 0;font-size:16px}
  .pnBtn{border:0;border-radius:11px;padding:10px 16px;font-weight:850;cursor:pointer;background:rgba(142,230,173,.2);color:#fff;font-size:14px}
  .pnBtn.alt{background:rgba(255,255,255,.09)}.pnBtn.bad{background:rgba(255,93,115,.22)}
  .pnRow{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .pnForm input,.pnForm textarea{width:100%;box-sizing:border-box;margin:5px 0 10px;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.3);color:#fff;font:inherit}
  .pnForm textarea{min-height:230px;resize:vertical;font-family:ui-monospace,Menlo,monospace;font-size:13px}
  .pnForm label{font-weight:800;font-size:13px;color:#aab5ca}
  .pnHint{color:#8e9ab3;font-size:12px;line-height:1.5}
  `;
  document.head.appendChild(css);

  const ov = document.createElement("div");
  ov.id = "pnOv";
  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("open")) close(); });

  /* tiny markdown: ## heading, - bullets, **bold** */
  function md(src) {
    const out = [];
    let list = false;
    const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    String(src || "").split(/\r?\n/).forEach((raw) => {
      const l = raw.trim();
      const li = /^[-*•]\s+(.*)/.exec(l);
      if (li) { if (!list) { out.push("<ul>"); list = true; } out.push("<li>" + inline(li[1]) + "</li>"); return; }
      if (list) { out.push("</ul>"); list = false; }
      const h = /^#{1,3}\s+(.*)/.exec(l);
      if (h) out.push("<h4>" + inline(h[1]) + "</h4>");
      else if (l) out.push("<p>" + inline(l) + "</p>");
    });
    if (list) out.push("</ul>");
    return out.join("");
  }
  const when = (n) => { try { return new Date(n.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch (e) { return ""; } };
  const seen = () => { try { return Number(localStorage.getItem(SEEN)) || 0; } catch (e) { return 0; } };
  const markSeen = () => { if (notes[0]) { try { localStorage.setItem(SEEN, String(notes[0].id)); } catch (e) {} } badge(); };
  const unseen = () => notes.length && Number(notes[0].id) > seen();

  function badge() {
    const on = unseen();
    if (G.drSidebar) G.drSidebar.badge(on);
    const b = document.getElementById("pnNavBtn");
    if (b) { const d = b.querySelector(".nbDot"); if (on && !d) b.insertAdjacentHTML("beforeend", '<span class="nbDot"></span>'); if (!on && d) d.remove(); }
  }

  async function load() {
    const c = sb();
    if (!c) return false;
    try {
      const r = await c.from("patch_notes").select("*").order("created_at", { ascending: false }).limit(100);
      if (r.error) { missing = true; return false; }
      missing = false; notes = r.data || []; loaded = true;
      badge();
      return true;
    } catch (e) { return false; }
  }

  function card(n, isNew) {
    return `<div class="pnMeta">${isNew ? '<span class="pnTag pnNew">NEW</span>' : ""}${n.version ? `<span class="pnTag">${esc(n.version)}</span>` : ""}<span class="pnDate">${esc(when(n))}</span></div>
      <div class="pnTitle">${esc(n.title)}</div><div class="pnBody">${md(n.body)}</div>`;
  }

  function render() {
    const adm = isAdmin();
    let h = "";
    if (editing) {
      const n = editing;
      h = `<div class="pnHead"><h2>${n.id ? "Edit" : "New"} patch note</h2><button class="pnX" data-a="back">×</button></div>
        <div class="pnForm"><label>Version (optional, e.g. v2.1)</label><input id="pnVer" maxlength="40" value="${esc(n.version)}">
        <label>Title</label><input id="pnTit" maxlength="120" value="${esc(n.title)}" placeholder="What's this update about?">
        <label>Notes</label><textarea id="pnBod" maxlength="8000" placeholder="## New&#10;- **Thing** – what it does&#10;&#10;## Fixed&#10;- ...">${esc(n.body)}</textarea>
        <div class="pnHint">Use <b>## Heading</b>, <b>- bullet</b> and <b>**bold**</b>. A new note pops up for every player the next time they open the game.</div></div>
        <div class="pnRow"><button class="pnBtn" data-a="save">${n.id ? "Save changes" : "Publish"}</button><button class="pnBtn alt" data-a="back">Cancel</button></div>`;
    } else if (view) {
      const n = view;
      h = `<div class="pnHead"><h2>📜 Patch notes</h2><button class="pnX" data-a="${auto ? "close" : "back"}">×</button></div>${card(n, auto)}
        <div class="pnRow">${auto ? '<button class="pnBtn" data-a="close">Got it</button><button class="pnBtn alt" data-a="back">Older notes</button>' : '<button class="pnBtn alt" data-a="back">← All notes</button>'}
        ${adm ? `<button class="pnBtn alt" data-a="edit" data-id="${n.id}">✏️ Edit</button><button class="pnBtn bad" data-a="del" data-id="${n.id}">🗑 Delete</button>` : ""}</div>`;
    } else {
      h = `<div class="pnHead"><h2>📜 Patch notes</h2>${adm ? '<button class="pnBtn" data-a="new">＋ New note</button>' : ""}<button class="pnX" data-a="close">×</button></div>`;
      if (missing) h += '<p class="pnHint">Patch notes aren\'t set up yet. An admin needs to run <b>patchnotes-setup.sql</b> in Supabase.</p>';
      else if (!notes.length) h += '<p class="pnHint">No patch notes yet.' + (adm ? " Hit “New note” to write the first one." : "") + "</p>";
      else h += '<div class="pnList">' + notes.map((n, i) => `<button class="pnItem" data-a="view" data-id="${n.id}">${i === 0 ? '<span class="pnTag pnNew">LATEST</span>' : ""}${n.version ? `<span class="pnTag">${esc(n.version)}</span>` : ""}<span class="pnDate">${esc(when(n))}</span><b>${esc(n.title)}</b></button>`).join("") + "</div>";
    }
    ov.innerHTML = `<div class="pnBox">${h}</div>`;
  }

  ov.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-a]");
    if (!t) return;
    const a = t.dataset.a, id = t.dataset.id;
    const find = () => notes.find((n) => String(n.id) === String(id));
    if (a === "close") return close();
    if (a === "back") { editing = null; view = null; auto = false; return render(); }
    if (a === "view") { view = find(); return render(); }
    if (a === "new") { editing = { version: "", title: "", body: "" }; return render(); }
    if (a === "edit") { editing = Object.assign({}, find()); return render(); }
    if (a === "del") {
      if (!confirm("Delete this patch note for everyone?")) return;
      const r = await sb().from("patch_notes").delete().eq("id", id);
      if (r.error) return say("Couldn't delete: " + r.error.message);
      view = null; await load(); return render();
    }
    if (a === "save") {
      const version = document.getElementById("pnVer").value.trim(), title = document.getElementById("pnTit").value.trim(), body = document.getElementById("pnBod").value;
      if (!title) return say("Give the note a title.");
      const row = { version, title, body };
      const r = editing.id ? await sb().from("patch_notes").update(Object.assign(row, { updated_at: new Date().toISOString() })).eq("id", editing.id) : await sb().from("patch_notes").insert(row);
      if (r.error) return say("Couldn't save: " + r.error.message);
      say(editing.id ? "Patch note updated" : "Patch note published 📜");
      editing = null; view = null; await load(); if (notes[0]) markSeen(); render();
    }
  });

  function close() { ov.classList.remove("open"); editing = null; view = null; if (auto) markSeen(); auto = false; }

  async function openList() {
    editing = null; view = null; auto = false;
    ov.classList.add("open"); render();
    await load(); markSeen(); if (ov.classList.contains("open") && !editing) render();
  }

  async function autoShow() {
    if (!(await load()) || !unseen()) return;
    editing = null; view = notes[0]; auto = true;
    ov.classList.add("open"); render();
    markSeen();
  }

  /* nav button */
  function ensureBtn() {
    const nav = document.getElementById("digitRollNav");
    if (!nav || document.getElementById("pnNavBtn")) return;
    const b = document.createElement("button");
    b.id = "pnNavBtn"; b.type = "button"; b.className = "drNavBtn"; b.textContent = "📜 Patch Notes";
    b.onclick = openList;
    nav.appendChild(b);
    badge();
  }
  ensureBtn();
  setInterval(ensureBtn, 1000);

  /* live: a freshly published note nudges everyone who is online */
  function live() {
    const c = sb();
    if (!c || !c.channel) return setTimeout(live, 2000);
    try {
      c.channel("patch-notes").on("postgres_changes", { event: "*", schema: "public", table: "patch_notes" }, async (p) => {
        const wasOpen = ov.classList.contains("open") && !editing;
        await load();
        if (p.eventType === "INSERT" && !isAdmin()) say("📜 New patch notes just dropped!");
        if (wasOpen && !view) render();
      }).subscribe();
    } catch (e) {}
  }
  live();

  /* automatically open on load (a moment after the game has settled) */
  setTimeout(autoShow, 1800);

  G.drPatchNotes = { open: openList, reload: load, notes: () => notes.slice() };
})();
