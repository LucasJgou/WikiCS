// Outils partagés par toutes les pages Wikimaster : comptes, cartes, booster, style.
// Tant qu'aucune carte n'est validée dans Supabase, le site tourne en « mode aperçu » avec des cartes inventées.
const WM = (() => {
  const ok = typeof SUPABASE_URL === "string" && typeof SUPABASE_KEY === "string" && !SUPABASE_URL.includes("VOTRE-PROJET");
  const root = ok ? SUPABASE_URL.replace(/\/$/, "") : "";
  const RAR = { commune: ["Commune", "#8aa0a8"], peu_commune: ["Peu commune", "#2f9e6b"], rare: ["Rare", "#3b82d6"], epique: ["Épique", "#9b59d0"], legendaire: ["Légendaire", "#f0b429"] };
  const ORDER = ["legendaire", "epique", "rare", "peu_commune", "commune"];
  const CHANCE = { commune: 60, peu_commune: 25, rare: 10, epique: 4, legendaire: 1 };
  const CATS = { lieu: "Lieu", salle: "Salle", asso: "Asso", evenement: "Événement", tradition: "Tradition", autre: "Autre" };
  const COST = 30;

  // Cartes inventées pour l'aperçu
  const DEMO = [
    ["Le Resto U", "salle", "commune", "🍽️", "Là où tout le monde se retrouve à 12 h 15."],
    ["Amphi 1", "salle", "commune", "🎓", "Le plus grand amphi, et le plus froid."],
    ["La Pelouse", "lieu", "commune", "🌱", "Dès qu'il fait beau, elle se remplit."],
    ["Le Bus du soir", "lieu", "commune", "🚌", "On court toujours pour l'attraper."],
    ["Salle de projet", "salle", "peu_commune", "💡", "Des post-it partout et un tableau jamais effacé."],
    ["La Biblio", "lieu", "peu_commune", "📚", "Silence demandé, sauf avant les partiels."],
    ["Le Foyer", "lieu", "peu_commune", "🛋️", "Canapés, jeux et siestes interdites (mais pratiquées)."],
    ["Le BDE", "asso", "rare", "🎉", "Il organise tout ce qui rend le campus vivant."],
    ["Le Gala", "evenement", "rare", "🕺", "Une soirée par an, des mois de préparation."],
    ["Le toit-terrasse", "lieu", "epique", "🌇", "Le meilleur coucher de soleil, si on connaît le chemin."],
    ["La nuit des projets", "evenement", "epique", "🌙", "Café, code et dernières minutes."],
    ["Le spot secret", "lieu", "legendaire", "🗝️", "Presque personne ne sait où il est."]
  ].map(([name, category, rarity, emoji, description], i) => ({ id: "d" + i, name, category, rarity, emoji, description }));

  // ---------- Petits outils ----------
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  const css = `
:root{--ink:#10252d;--paper:#f5f6f2;--line:#c9d0cb;--signal:#f0b429;--good:#2f9e6b;--bad:#d2493f;--font:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font);background:var(--ink);color:var(--paper);min-height:100vh}
main{max-width:980px;margin:0 auto;padding:max(16px,env(safe-area-inset-top)) 16px 40px}
a{color:var(--signal)}
h1{font-size:1.9rem;font-weight:800;margin:.8rem 0 .25rem}
.lead{color:#c3cec9;max-width:60ch;margin:0 0 1.25rem}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;justify-content:space-between}
.top nav{display:flex;flex-wrap:wrap;gap:.4rem 1rem}
.pill{background:rgba(16,37,45,.85);border:1px solid rgba(245,246,242,.25);border-radius:999px;padding:.4rem .9rem;font-weight:600}
.note{background:rgba(240,180,41,.15);border-left:4px solid var(--signal);padding:.6rem .8rem;border-radius:6px;margin:1rem 0;font-size:.95rem}
.box{background:rgba(255,255,255,.06);border-radius:14px;padding:1rem;max-width:420px;display:grid;gap:.7rem}
.box h2{margin:0;font-size:1.1rem}
label{display:grid;gap:.3rem;font-weight:600}
input,select,textarea{width:100%;padding:.75rem;border-radius:10px;border:2px solid var(--line);font:600 1rem var(--font);background:#fff;color:var(--ink)}
button{font:800 .95rem var(--font);border:0;border-radius:10px;padding:.7rem 1rem;cursor:pointer;background:var(--signal);color:var(--ink)}
button.ghost{background:rgba(255,255,255,.12);color:var(--paper)}
button.good{background:var(--good);color:#fff}
button.bad{background:var(--bad);color:#fff}
button:disabled{opacity:.5;cursor:not-allowed}
:focus-visible{outline:3px solid var(--signal);outline-offset:2px}
.msg{min-height:1.4em;margin:.3rem 0;font-weight:600}
.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.wc{position:relative;background:var(--paper);color:var(--ink);border-radius:16px;padding:.6rem .6rem .9rem;border:4px solid var(--rc,var(--line));display:flex;flex-direction:column;gap:.35rem;height:100%;text-align:left}
.wc .art{aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,var(--ink),var(--rc,#456));display:grid;place-items:center}
.wc .art img{width:100%;height:100%;object-fit:cover;display:block}
.emo{font-size:3rem}
.wc h3{margin:.2rem 0 0;font-size:1.1rem;font-weight:800}
.wc p{margin:0;font-size:.85rem;color:#3b4c47}
.wc .meta{display:flex;justify-content:space-between;gap:.5rem;font-size:.78rem;font-weight:700}
.wc .rar::before{content:"";display:inline-block;width:.65em;height:.65em;border-radius:50%;background:var(--rc);margin-right:.35em}
.wc .qty{position:absolute;top:.8rem;right:.8rem;background:var(--ink);color:var(--signal);border-radius:99px;padding:.1rem .55rem;font-size:.8rem}
.wc.lock{opacity:.55;filter:grayscale(1);justify-content:center;align-items:center;min-height:240px}
.pack{display:grid;place-content:center;gap:.4rem;margin:1.5rem auto;width:200px;height:280px;border-radius:18px;background:linear-gradient(160deg,#1d4552,var(--ink));border:4px solid var(--signal);color:var(--paper);font:800 1.5rem var(--font);text-align:center}
.pack small{font:600 .9rem var(--font);color:var(--signal)}
.shake{animation:sh .9s}
@keyframes sh{0%,100%{transform:rotate(0)}15%{transform:rotate(-6deg)}30%{transform:rotate(6deg)}45%{transform:rotate(-8deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-3deg)}}
.hand{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-top:1rem}
.flip{position:relative;display:block;width:100%;min-height:310px;padding:0;background:none;border-radius:16px;perspective:900px;color:inherit}
.flip .back,.flip .front{position:absolute;inset:0;backface-visibility:hidden;transition:transform .5s}
.flip .back{display:grid;place-items:center;font-size:3rem;background:linear-gradient(160deg,#1d4552,#0a1a20);border:4px solid var(--signal);border-radius:16px;color:var(--signal)}
.flip .front{transform:rotateY(180deg)}
.flip.on .back{transform:rotateY(-180deg)}
.flip.on .front{transform:rotateY(0)}
.flip.on .wc{box-shadow:0 0 28px var(--rc)}
.new{position:absolute;top:-8px;left:-8px;z-index:2;background:var(--good);color:#fff;font-style:normal;font-weight:800;font-size:.75rem;padding:.2rem .6rem;border-radius:99px}
@media (prefers-reduced-motion:reduce){.shake{animation:none}.flip .back,.flip .front{transition:none}}`;
  document.head.append(Object.assign(h("style"), { textContent: css }));
  document.head.append(Object.assign(h("link"), { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" }));

  // ---------- Compte ----------
  let S = null; try { S = JSON.parse(localStorage.getItem("wm_s")); } catch {}
  const save = (s) => { S = s; try { s ? localStorage.setItem("wm_s", JSON.stringify(s)) : localStorage.removeItem("wm_s"); } catch {} };
  const mail = (id) => id.includes("@") ? id.trim() : id.trim().toLowerCase() + "@users.wikimaster.app";
  const keep = (j) => save({ token: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000, id: j.user.id, email: j.user.email });

  async function auth(path, body) {
    const r = await fetch(root + "/auth/v1/" + path, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "HTTP " + r.status);
    return j;
  }
  const login = async (id, pw) => keep(await auth("token?grant_type=password", { email: mail(id), password: pw }));
  async function signup(pseudo, pw) {
    if (!/^[A-Za-z0-9_]{3,16}$/.test(pseudo)) throw new Error("Pseudo : 3 à 16 lettres, chiffres ou _.");
    const j = await auth("signup", { email: mail(pseudo), password: pw, data: { pseudo } });
    if (!j.access_token) throw new Error("Désactive « Confirm email » dans Supabase (Authentication → Providers → Email).");
    keep(j);
  }
  async function token() {
    if (!S) return null;
    if (Date.now() > S.exp) { try { keep(await auth("token?grant_type=refresh_token", { refresh_token: S.refresh })); } catch { save(null); return null; } }
    return S.token;
  }
  async function api(path, o = {}) {
    const t = await token();
    return fetch(root + path, { ...o, headers: { apikey: SUPABASE_KEY, ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } });
  }
  async function json(path, o) {
    const r = await api(path, o);
    if (!r.ok) { let t = ""; try { t = (await r.text()).slice(0, 160); } catch {} throw new Error("HTTP " + r.status + " " + t); }
    return r.status === 204 ? null : r.json();
  }

  function authBox(done, admin) {
    const f = h("form", "box"), id = h("input"), pw = h("input"), msg = h("p", "msg");
    id.placeholder = id.ariaLabel = admin ? "E-mail admin" : "Pseudo"; id.required = true; id.autocomplete = "username";
    pw.type = "password"; pw.placeholder = pw.ariaLabel = "Mot de passe"; pw.required = true; pw.minLength = 6; pw.autocomplete = "current-password";
    const b1 = h("button", "", "Se connecter"); b1.type = "submit";
    f.append(h("h2", "", admin ? "Connexion admin" : "Connecte-toi pour jouer"), id, pw, b1);
    const run = async (fn) => { msg.textContent = "…"; try { await fn(); done(); } catch (e) { msg.textContent = e.message; } };
    f.onsubmit = (e) => { e.preventDefault(); run(() => login(id.value, pw.value)); };
    if (!admin) {
      const b2 = h("button", "ghost", "Créer le compte"); b2.type = "button";
      b2.onclick = () => run(() => signup(id.value.trim(), pw.value));
      f.append(b2);
    }
    f.append(msg);
    return f;
  }

  // ---------- Cartes ----------
  let cards = null, demo = true;
  async function loadCards() {
    if (cards) return cards;
    try {
      if (!ok) throw 0;
      const r = await json("/rest/v1/cards?select=*&approved=eq.true&order=name");
      cards = r.length ? r : null;
    } catch { cards = null; }
    demo = !cards;
    if (demo) cards = DEMO;
    return cards;
  }

  function cardEl(c, qty) {
    const d = h("div", "wc"); d.style.setProperty("--rc", RAR[c.rarity][1]);
    const art = h("div", "art");
    if (c.path || c.url) { const i = h("img"); i.src = c.url || root + "/storage/v1/object/public/cards/" + c.path; i.alt = ""; i.loading = "lazy"; art.append(i); }
    else art.append(h("span", "emo", c.emoji || "❔"));
    const meta = h("div", "meta"); meta.append(h("span", "", CATS[c.category] || ""), h("span", "rar", RAR[c.rarity][0]));
    d.append(art, h("h3", "", c.name), meta, h("p", "", c.description));
    if (qty > 1) d.append(h("b", "qty", "×" + qty));
    return d;
  }

  // ---------- Jetons, collection, booster (mode aperçu = local ; sinon = serveur) ----------
  const D = () => { try { return JSON.parse(localStorage.getItem("wm_demo")) || { tokens: 100, col: {} }; } catch { return { tokens: 100, col: {} }; } };
  const saveD = (d) => { try { localStorage.setItem("wm_demo", JSON.stringify(d)); } catch {} };

  async function me() {
    if (demo) return { pseudo: "Aperçu", tokens: D().tokens };
    if (!S) return null;
    return (await json("/rest/v1/profiles?select=pseudo,tokens&id=eq." + S.id))[0] || null;
  }
  async function owned() {
    if (demo) return D().col;
    if (!S) return {};
    const m = {}; (await json("/rest/v1/collection?select=card_id,qty")).forEach((r) => (m[r.card_id] = r.qty));
    return m;
  }

  function pick(rar) {
    const i = ORDER.indexOf(rar);
    for (const k of [...ORDER.slice(i), ...ORDER.slice(0, i).reverse()]) {
      const l = cards.filter((c) => c.rarity === k);
      if (l.length) return l[Math.floor(Math.random() * l.length)];
    }
  }
  function drawLocal() {
    const out = []; let hi = false;
    for (let i = 0; i < 5; i++) {
      let r = Math.random() * 100; if (i === 4 && !hi) r = 60 + Math.random() * 40;
      let acc = 0, rar = "commune";
      for (const k of ["commune", "peu_commune", "rare", "epique", "legendaire"]) { acc += CHANCE[k]; if (r < acc) { rar = k; break; } }
      const c = pick(rar); if (c.rarity !== "commune") hi = true; out.push(c);
    }
    return out;
  }
  async function open() {
    if (demo) {
      const d = D(); if (d.tokens < COST) throw new Error("Pas assez de jetons.");
      d.tokens -= COST; const out = drawLocal(); out.forEach((c) => (d.col[c.id] = (d.col[c.id] || 0) + 1)); saveD(d); return out;
    }
    return json("/rest/v1/rpc/open_booster", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  }

  // ---------- Barre du haut ----------
  async function header(el) {
    await loadCards();
    el.className = "top"; el.textContent = "";
    const nav = h("nav");
    [["index.html", "Booster"], ["collection.html", "Collection"], ["creer.html", "Proposer une carte"], ["https://lucasjgou.github.io/CSguessr/", "CSguessr"]]
      .forEach(([u, t]) => { const a = h("a", "", t); a.href = u; nav.append(a); });
    el.append(nav);
    const p = await me().catch(() => null);
    el.append(h("span", "pill", p ? p.pseudo + " · " + p.tokens + " jetons" : "Non connecté"));
    if (S && !demo) { const b = h("button", "ghost", "Quitter"); b.onclick = () => { save(null); location.reload(); }; el.append(b); }
    return p;
  }

  return { h, RAR, ORDER, CATS, COST, loadCards, demo: () => demo, header, authBox, cardEl, owned, open, user: () => S, api, json, login };
})();
