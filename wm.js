// Outils partagés par toutes les pages Wikimaster : comptes, cartes, booster, style.
const WM = (() => {
  const ok = typeof SUPABASE_URL === "string" && typeof SUPABASE_KEY === "string" && !SUPABASE_URL.includes("VOTRE-PROJET");
  const root = ok ? SUPABASE_URL.replace(/\/$/, "") : "";
  const RAR = { commune: ["Commune", "#8aa0a8"], peu_commune: ["Peu commune", "#2f9e6b"], rare: ["Rare", "#3b82d6"], epique: ["Épique", "#9b59d0"], legendaire: ["Légendaire", "#f0b429"] };
  const ORDER = ["legendaire", "epique", "rare", "peu_commune", "commune"];
  const CATS = { lieu: "Lieu", salle: "Salle", asso: "Asso", evenement: "Événement", tradition: "Tradition", cours: "Cours", autre: "Autre" };
  const COST = 15;
  const CAT_EMO = { lieu: "📍", salle: "🚪", asso: "🤝", evenement: "🎉", tradition: "🎭", cours: "📘", autre: "✨" };

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
  let cards = null;
  async function loadCards() {
    if (cards) return cards;
    try { if (!ok) throw 0; cards = await json("/rest/v1/cards?select=*&approved=eq.true&order=name"); }
    catch { cards = []; }
    return cards;
  }

  function cardEl(c, qty) {
    const d = h("div", "wc"); d.style.setProperty("--rc", RAR[c.rarity][1]);
    const art = h("div", "art");
    if (c.path || c.url) { const i = h("img"); i.src = c.url || root + "/storage/v1/object/public/cards/" + c.path; i.alt = ""; i.loading = "lazy"; art.append(i); }
    else art.append(h("span", "emo", c.emoji || CAT_EMO[c.category] || "❔"));
    const meta = h("div", "meta"); meta.append(h("span", "", CATS[c.category] || ""), h("span", "rar", RAR[c.rarity][0]));
    d.append(art, h("h3", "", c.name), meta, h("p", "", c.description));
    if (qty > 1) d.append(h("b", "qty", "×" + qty));
    return d;
  }

  // ---------- Jetons, collection, booster (tout est calculé côté serveur) ----------
  async function me() {
    if (!S) return null;
    return (await json("/rest/v1/profiles?select=pseudo,tokens&id=eq." + S.id))[0] || null;
  }
  async function owned() {
    if (!S) return {};
    const m = {}; (await json("/rest/v1/collection?select=card_id,qty")).forEach((r) => (m[r.card_id] = r.qty));
    return m;
  }
  const open = () => json("/rest/v1/rpc/open_booster", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });

  // Réduit une photo à 1200 px max et la ré-encode en JPEG (retire aussi les données EXIF)
  async function compress(file) {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    let k = Math.min(1, 1200 / Math.max(bmp.width, bmp.height)), q = 0.82;
    for (let i = 0; ; i++) {
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const b = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (b.size <= 1400000 || i >= 4) return b;
      q = Math.max(0.5, q - 0.1); k *= 0.85;
    }
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
    if (S) { const b = h("button", "ghost", "Quitter"); b.onclick = () => { save(null); location.reload(); }; el.append(b); }
    return p;
  }

  return { h, RAR, ORDER, CATS, COST, loadCards, compress, header, authBox, cardEl, owned, open, user: () => S, api, json, login };
})();
