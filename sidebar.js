/* Sidebar: every menu button lives in one expandable drawer. Other modules keep adding buttons to
   #digitRollNav; we simply move that container into the drawer, so late/updated buttons just work. */
(function () {
  "use strict";
  const KEY = "digitRollSidebar";
  let open = false;
  try { open = localStorage.getItem(KEY) === "1" && innerWidth > 800; } catch (e) {}

  const css = document.createElement("style");
  css.textContent = `
  #drSideToggle{position:fixed;left:14px;bottom:14px;z-index:10001;width:48px;height:48px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(18,23,34,.92);color:#fff;font-size:22px;cursor:pointer;backdrop-filter:blur(10px);box-shadow:0 8px 26px rgba(0,0,0,.4);transition:transform .2s,left .25s}
  #drSideToggle:hover{transform:scale(1.07)}
  #drSideToggle .dot{position:absolute;top:-4px;right:-4px;min-width:14px;height:14px;border-radius:99px;background:#ff5d73;display:none;box-shadow:0 0 8px #ff5d73}
  #drSideToggle.hasNew .dot{display:block}
  #drSidebar{position:fixed;top:0;left:0;bottom:0;width:236px;z-index:10000;display:flex;flex-direction:column;padding:16px 12px 76px;background:rgba(14,18,28,.96);border-right:1px solid rgba(255,255,255,.1);backdrop-filter:blur(14px);box-shadow:12px 0 50px rgba(0,0,0,.45);transform:translateX(-105%);transition:transform .28s cubic-bezier(.2,.8,.2,1);overflow-y:auto}
  body.drSideOpen #drSidebar{transform:none}
  #drSideToggle{left:14px}
  body.drSideOpen #drSideToggle{left:178px}
  #drSidebar .sbHead{display:flex;align-items:center;gap:8px;font-weight:900;font-size:18px;margin:2px 4px 14px;color:#fff}
  #drSidebar .sbHead small{color:#8e9ab3;font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-left:auto}
  #drSidebar #digitRollNav{position:static!important;display:flex!important;flex-direction:column;flex-wrap:nowrap!important;gap:6px!important;max-width:none!important;z-index:auto}
  #drSidebar .drNavBtn{width:100%;text-align:left;padding:11px 13px;border-radius:11px;background:rgba(255,255,255,.045);position:relative;transition:background .15s,transform .15s}
  #drSidebar .drNavBtn:hover{background:rgba(142,230,173,.14);transform:translateX(3px)}
  #drSidebar .drNavBtn .nbDot{position:absolute;right:10px;top:50%;margin-top:-5px;width:10px;height:10px;border-radius:99px;background:#ff5d73;box-shadow:0 0 8px #ff5d73}
  #drSideScrim{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:none}
  @media(max-width:800px){body.drSideOpen #drSideScrim{display:block}body.drSideOpen #drSideToggle{left:178px}}
  @media(prefers-reduced-motion:reduce){#drSidebar{transition:none}}
  `;
  document.head.appendChild(css);

  const side = document.createElement("aside");
  side.id = "drSidebar";
  side.setAttribute("aria-label", "Game menu");
  side.innerHTML = '<div class="sbHead">🎲 Menu<small>Digit Roll</small></div><div id="drSideList"></div>';
  const tog = document.createElement("button");
  tog.id = "drSideToggle";
  tog.type = "button";
  tog.title = "Menu";
  tog.innerHTML = '☰<span class="dot"></span>';
  const scrim = document.createElement("div");
  scrim.id = "drSideScrim";
  document.body.append(scrim, side, tog);

  function set(v) {
    open = !!v;
    document.body.classList.toggle("drSideOpen", open);
    tog.firstChild.nodeValue = open ? "✕" : "☰";
    tog.setAttribute("aria-expanded", open ? "true" : "false");
    try { localStorage.setItem(KEY, open ? "1" : "0"); } catch (e) {}
  }
  tog.onclick = () => set(!open);
  scrim.onclick = () => set(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open && innerWidth <= 800) set(false); });
  /* on small screens, picking an entry closes the drawer */
  side.addEventListener("click", (e) => { if (innerWidth <= 800 && e.target.closest(".drNavBtn")) set(false); });

  function adopt() {
    const nav = document.getElementById("digitRollNav");
    if (nav && nav.parentNode !== document.getElementById("drSideList")) document.getElementById("drSideList").appendChild(nav);
  }
  adopt();
  setInterval(adopt, 500);
  set(open);

  window.drSidebar = {
    open: () => set(true),
    close: () => set(false),
    toggle: () => set(!open),
    isOpen: () => open,
    badge: (on) => tog.classList.toggle("hasNew", !!on),
  };
})();
