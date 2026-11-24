/* ============================================================
   DIGIT ROLL — RARITY LIST
   Every rarity tier in order. Tiers you have never rolled stay hidden (???).
   Found tiers show how many you rolled, your first and your rarest roll of that tier.
   ============================================================ */
(function () {
  "use strict";
  const G = window;
  const P = G.drProgress;
  if (!P || !P.addTab) return;
  const nf = (v) => Math.round(Number(v) || 0).toLocaleString();
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const KEY = "digitRollRarityDex";
  let D = {};
  try {
    D = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(D));
    } catch (e) {}
  };
  const big = (v) => (v >= 1e12 ? Number(v).toExponential(1).replace("e+", " × 10^") : nf(v));

  P.onRoll((r) => {
    const t = r.rarity;
    if (!t) return;
    const d = (D[t] = D[t] || { first: { roll: r.roll, at: Date.now() }, best: { roll: r.roll, oneIn: Number(r.oneIn) || 0 } });
    if ((Number(r.oneIn) || 0) > (d.best.oneIn || 0)) d.best = { roll: r.roll, oneIn: Number(r.oneIn) || 0 };
    save();
  });

  const hue = (i, n) => `hsl(${Math.round(150 - (i / (n - 1)) * 330)},80%,60%)`;
  let filter = "all";

  function render() {
    const tiers = P.TIERS;
    const s = P.stats();
    const counts = tiers.map((t) => s.rarity[t] || 0);
    const found = counts.filter((c) => c > 0).length;
    const cards = tiers
      .map((t, i) => {
        const c = counts[i];
        if (!c) return filter === "found" ? "" : `<div class="rlCard hid"><span class="rlNo">#${i + 1}</span><b>???</b><small>Not discovered yet</small></div>`;
        const d = D[t];
        const col = hue(i, tiers.length);
        const pct = s.rolls ? ((c / s.rolls) * 100).toFixed(c / s.rolls < 0.01 ? 3 : 1) : "0";
        return `<div class="rlCard" style="--c:${col}"><span class="rlNo">#${i + 1}</span><b style="color:${col}">${esc(t.charAt(0) + t.slice(1).toLowerCase())}</b>
          <small>Rolled <b>${nf(c)}</b>× • ${pct}% of rolls</small>
          ${d ? `<small>First: <b>${esc(d.first.roll)}</b></small><small>Rarest: <b>${esc(d.best.roll)}</b>${d.best.oneIn ? ` (1 in ${big(d.best.oneIn)})` : ""}</small>` : ""}</div>`;
      })
      .join("");
    return `<style>
      .rlGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
      .rlCard{position:relative;display:flex;flex-direction:column;gap:3px;padding:11px 12px;border-radius:14px;background:linear-gradient(160deg,color-mix(in srgb,var(--c,#667) 16%,transparent),rgba(255,255,255,.04));border:1px solid color-mix(in srgb,var(--c,#667) 50%,transparent)}
      .rlCard b{font-size:16px}.rlCard small{color:#aab5ca;font-size:12px}.rlCard small b{font-size:12px;color:#fff}
      .rlCard.hid{opacity:.5;border:1px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.03)}
      .rlNo{position:absolute;top:8px;right:10px;font-size:11px;color:#8391ab}
    </style>
    <div class="pgBanner">📚 Rarity List<br><span class="pgSub">Discovered <b>${found}</b> / ${tiers.length} rarities. The rest stay hidden until you roll them — keep rolling!</span></div>
    <div class="pgTabs" style="margin:10px 0"><button class="pgTab ${filter === "all" ? "on" : ""}" data-rf="all" type="button">All tiers</button><button class="pgTab ${filter === "found" ? "on" : ""}" data-rf="found" type="button">Found only</button></div>
    <div class="rlGrid">${cards}</div>`;
  }
  function bind(root) {
    root.querySelectorAll("[data-rf]").forEach((b) => (b.onclick = () => ((filter = b.dataset.rf), P.rerender())));
  }
  P.addTab("rarities", "📚 Rarities", render, bind);
})();
