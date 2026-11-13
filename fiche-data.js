/* Shared data + helpers for the Etherium "fiche de présentation" editor — v2 layout (thème V2).
   Exposes everything on window.FICHE.
   Récupération = scan of a pasted/fetched fiche DOM (no base64 blob):
   every field lives in a semantic class or a data-* attribute so the sheet
   can be re-read even if the CSS changes.
   CSS : la fiche exportée ne contient PLUS de <style>. Le style vit dans la feuille
   du forum (fiche-forum.css). Pour l'aperçu du générateur, FICHE_CSS est injecté
   une seule fois dans la page qui charge ce script. */
(function () {
  /* ---- groups (les statuts du jeu) ---- */
  const GROUPS = ["Couronne de cendre", "Vigile du Seuil", "Colporteur de l'ombre", "Arpenteur du vide", "Heraut silencieux"];
  const GROUP_META = {
    'Couronne de cendre': { color: '#D43535', tag: "Le pouvoir comme unique vérité" },
    'Vigile du Seuil':     { color: '#6E93B8', tag: "L'ordre comme rédemption" },
    "Colporteur de l'ombre":     { color: '#8E7BB0', tag: 'Tout se négocie, y compris la loyauté' },
    'Arpenteur du vide':   { color: '#4F8A5B', tag: 'La vérité est ailleurs, plus loin' },
    'Heraut silencieux':    { color: '#4A5C8F', tag: 'Ceux qui écoutent ce que le monde tait' }
  };
  function groupColor(g) { return (GROUP_META[g] || {}).color || '#4C6CAD'; }
  function groupTag(g) { return (GROUP_META[g] || {}).tag || ''; }

  /* couleurs d'accent proposées — palette V2 (bleu acier en premier) */
  const DEFAULT_ACCENT = '#4C6CAD';
  const ACCENTS = ['#4C6CAD', '#3A5590', '#6E93B8', '#8FAEE0', '#8E7BB0', '#4F8A5B', '#C99A3B', '#D06060'];

  /* type colours — reuse TCARD if present, else a local table */
  const TYPE = (window.TCARD && window.TCARD.TYPE) || {
    'Normal': '#9FA39B', 'Feu': '#E84C3D', 'Eau': '#3C8FE0', 'Plante': '#4BAE4F',
    'Électrik': '#F2C94C', 'Glace': '#56CCE0', 'Combat': '#E0762B', 'Poison': '#A052C8',
    'Sol': '#C08A3E', 'Vol': '#88AEE8', 'Psy': '#EC5C8E', 'Insecte': '#9AAB2A',
    'Roche': '#BBA968', 'Spectre': '#6E5A9B', 'Dragon': '#5763E0', 'Ténèbres': '#4E4A57',
    'Acier': '#6BA7B8', 'Fée': '#EE8FCB'
  };
  const TYPE_LIST = Object.keys(TYPE);
  function typeColor(t) { return TYPE[t] || '#9AA2B0'; }
  const NATURES = (window.TCARD && window.TCARD.NATURES) || ['Assuré', 'Modeste', 'Timide', 'Calme', 'Sérieux', 'Relax', 'Pressé', 'Jovial'];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* rich text <-> plain text (paragraphs on blank line, <br> on single newline) */
  function textToHtml(txt) {
    const paras = String(txt == null ? '' : txt).replace(/\r\n/g, '\n').split(/\n{2,}/);
    return paras.filter(function (p) { return p.trim() !== ''; })
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function htmlToText(html) {
    let s = String(html == null ? '' : html);
    s = s.replace(/<\s*br\s*\/?>/gi, '\n')
         .replace(/<\/\s*p\s*>\s*<\s*p[^>]*>/gi, '\n\n')
         .replace(/<\/?[^>]+>/g, '');
    const d = document.createElement('textarea'); d.innerHTML = s;
    return d.value.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').trim();
  }

  const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta leo vel bibendum feugiat. Quisque venenatis lacinia augue ut placerat. Cras sodales enim in metus rhoncus, quis dictum felis molestie. Maecenas eu quam consectetur, tristique velit ac, semper lectus. Morbi in consectetur nunc, a mollis ex. Donec sem tortor, pretium eu eleifend a, tincidunt et arcu. Nam aliquet odio et metus maximus, a pellentesque purus finibus. Pellentesque non ullamcorper dolor. Sed leo odio, varius sit amet tempor in, luctus eget nulla. Sed ac ornare felis. Nunc velit velit, eleifend vitae placerat eget, vestibulum eget odio. Praesent nec metus et dui accumsan mattis. Cras tempus ante sit amet ultrices convallis. Morbi in dui eget nunc hendrerit lobortis vitae a odio.";

  const DEFAULT_FICHE = {
    accent: DEFAULT_ACCENT,
    name: 'PRENOM NOM',
    alias: 'LE GARS TROP COOL',
    banner: '',
    portrait: '',
    photo: '',
    age: '27 ans',
    sexe: '',
    birthday: '',
    occupation: '',
    group: 'Ancrés',
    traits: ['Débrouillard', 'Bavard', 'Méfiant', 'Loyal', 'Opportuniste', 'Protecteur'],
    realWorld: LOREM,
    personality: LOREM,
    pokemon: { sprite: '', name: 'Braise', species: 'Goupix', types: ['Feu'], level: 22, nature: 'Assuré', desc: LOREM },
    history: LOREM,
    player: { pseudo: 'kylas', age: '', country: 'FUSEAU HORAIRE', note: "J'adore Mirabelle" }
  };

  function normalize(d) {
    d = d || {};
    const p = d.pokemon || {};
    const pl = d.player || {};
    return {
      accent: d.accent || DEFAULT_ACCENT,
      name: d.name != null ? d.name : '',
      alias: d.alias != null ? d.alias : '',
      banner: d.banner || '',
      portrait: d.portrait || '',
      photo: d.photo || '',
      age: d.age != null ? d.age : '',
      sexe: d.sexe != null ? d.sexe : '',
      birthday: d.birthday != null ? d.birthday : '',
      occupation: d.occupation != null ? d.occupation : '',
      group: GROUPS.indexOf(d.group) >= 0 ? d.group : 'Ancrés',
      traits: (Array.isArray(d.traits) ? d.traits : []).map(function (t) { return t == null ? '' : String(t); }),
      realWorld: d.realWorld != null ? d.realWorld : '',
      personality: d.personality != null ? d.personality : '',
      pokemon: {
        sprite: p.sprite || '', name: p.name != null ? p.name : '', species: p.species != null ? p.species : '',
        types: (Array.isArray(p.types) && p.types.length ? p.types : ['Normal']).slice(0, 2),
        level: (p.level != null && p.level !== '') ? p.level : '', nature: p.nature != null ? p.nature : '',
        desc: p.desc != null ? p.desc : ''
      },
      history: d.history != null ? d.history : '',
      player: {
        pseudo: pl.pseudo != null ? pl.pseudo : '', age: pl.age != null ? pl.age : '',
        country: pl.country != null ? pl.country : '', note: pl.note != null ? pl.note : ''
      }
    };
  }

  /* ================= CSS (identique à fiche-forum.css) ================= */
  const FICHE_CSS = "body .aeth-fiche{--f-encre:#161D2A;--f-encre2:#1F2838;--f-carte:#FFFFFF;--f-beige:#F1F4FA;--f-bord:#D3DBE6;--f-filet:#E8ECF3;--f-titre:#18222E;--f-texte:#435063;--f-muet:#7F8EA0;--f-clair:#AFC4E8;width:650px;max-width:100%;margin:0 auto;font-family:'Karla','Helvetica Neue',Arial,sans-serif;background:var(--f-carte);border:1px solid var(--f-bord);border-radius:20px;overflow:hidden;box-shadow:0 26px 54px -30px rgba(10,16,30,.55);color:var(--f-texte);text-align:left}body .aeth-fiche *{box-sizing:border-box}body .aeth-fiche .ph{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--f-muet)}body .aeth-fiche .af-banner{position:relative;height:240px;overflow:hidden;background-color:var(--f-encre);background-image:radial-gradient(ellipse 70% 120% at 80% 30%,color-mix(in srgb,var(--acc) 40%,transparent),transparent 70%)}body .aeth-fiche .af-banner::before{content:\"\";position:absolute;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(64deg,rgba(255,255,255,.05) 0 2px,transparent 2px 14px)}body .aeth-fiche .af-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}body .aeth-fiche .af-banner-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,238,247,.35)}body .aeth-fiche .af-banner-grad{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(22,29,42,.35) 0%,rgba(22,29,42,0) 30%,rgba(22,29,42,.92) 100%)}body .aeth-fiche .af-kick{position:absolute;z-index:2;left:24px;top:20px;display:flex;align-items:center;gap:10px;font-size:9.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,238,247,.8)}body .aeth-fiche .af-kick::before{content:\"\";width:7px;height:7px;transform:rotate(45deg);background:var(--acc);box-shadow:0 0 10px var(--acc)}body .aeth-fiche .af-groupchip{position:absolute;z-index:2;right:24px;top:15px;display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:99px;background:rgba(22,29,42,.55);border:1px solid var(--gc);backdrop-filter:blur(6px);color:#fff}body .aeth-fiche .af-groupchip::before{content:\"\";width:7px;height:7px;border-radius:50%;background:var(--gc);box-shadow:0 0 8px var(--gc)}body .aeth-fiche .af-groupname{font-size:9.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}body .aeth-fiche .af-headline{position:absolute;z-index:2;left:274px;right:24px;bottom:20px}body .aeth-fiche .af-name{font-size:34px;font-weight:800;line-height:1;letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45)}body .aeth-fiche .af-alias{margin-top:8px;font-size:12.5px;font-style:italic;line-height:1.5;color:rgba(232,238,247,.8)}body .aeth-fiche .af-aliastxt{font-style:normal;font-weight:800;letter-spacing:.08em;color:var(--f-clair)}body .aeth-fiche .af-grouptag{font-style:normal;font-weight:700;color:#fff}body .aeth-fiche .af-accentbar{height:3px;background:linear-gradient(90deg,var(--gc) 0 250px,var(--acc) 250px)}body .aeth-fiche .af-body{display:flex;align-items:stretch}body .aeth-fiche .af-side{position:relative;width:250px;flex:none;display:flex;flex-direction:column;background-color:var(--f-encre);background-image:radial-gradient(ellipse 90% 40% at 50% 0%,color-mix(in srgb,var(--gc) 30%,transparent),transparent 70%)}body .aeth-fiche .af-portrait{position:relative;z-index:3;width:226px;height:316px;margin:-130px 12px 0;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--f-encre2);border:3px solid var(--f-encre);box-shadow:0 0 0 1px color-mix(in srgb,var(--gc) 60%,transparent),0 24px 40px -20px rgba(0,0,0,.8)}body .aeth-fiche .af-portrait img{width:100%;height:100%;object-fit:cover;display:block}body .aeth-fiche .af-portrait .ph{color:rgba(232,238,247,.35)}body .aeth-fiche .af-idlist{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:14px 12px 0}body .aeth-fiche .af-idlist>div{padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);min-width:0}body .aeth-fiche .af-idlist>div:nth-child(2){order:2;grid-column:1/-1}body .aeth-fiche .af-idlist>div:nth-child(3){order:1}body .aeth-fiche .af-idlist>div:nth-child(4){order:3;grid-column:1/-1}body .aeth-fiche .af-idlabel{font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--f-clair)}body .aeth-fiche .af-idval{margin-top:3px;font-size:13px;font-weight:800;color:#fff;overflow-wrap:anywhere}body .aeth-fiche .af-sidetraits{padding:16px 12px 18px}body .aeth-fiche .af-sidetraits .af-idlabel{display:flex;align-items:center;gap:8px;margin-bottom:9px}body .aeth-fiche .af-sidetraits .af-idlabel::after{content:\"\";flex:1;height:1px;background:rgba(255,255,255,.1)}body .aeth-fiche .af-traits{display:flex;flex-wrap:wrap;gap:5px}body .aeth-fiche .af-trait{padding:5px 11px;border-radius:99px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);font-size:11px;font-weight:700;color:#E8EEF7}body .aeth-fiche .af-trait:nth-child(odd){border-color:color-mix(in srgb,var(--acc) 55%,transparent)}body .aeth-fiche .af-main{flex:1;min-width:0;padding:24px 24px 22px;display:grid;gap:24px;align-content:start;background:var(--f-carte)}body .aeth-fiche .af-sech{display:flex;align-items:center;gap:11px;margin-bottom:12px;font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--f-titre)}body .aeth-fiche .af-sech::before{content:\"\";flex:none;width:8px;height:8px;transform:rotate(45deg);background:var(--acc)}body .aeth-fiche .af-sech::after{content:\"\";flex:1;height:1px;background:var(--f-filet)}body .aeth-fiche .af-scroll{max-height:290px;overflow-y:auto;padding-right:10px;scrollbar-width:thin;scrollbar-color:var(--acc) transparent}body .aeth-fiche .af-scroll::-webkit-scrollbar{width:5px}body .aeth-fiche .af-scroll::-webkit-scrollbar-thumb{background:var(--acc);border-radius:3px}body .aeth-fiche .af-txt p{margin:0 0 12px;font-size:13px;line-height:1.75;text-align:justify;color:var(--f-texte)}body .aeth-fiche .af-txt p:last-child{margin-bottom:0}body .aeth-fiche .af-histsec{padding:24px;border-top:1px solid var(--f-filet);background:var(--f-beige)}body .aeth-fiche .af-histrow{display:flex;gap:22px;align-items:flex-start}body .aeth-fiche .af-photo{position:relative;width:220px;height:220px;flex:none;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--f-carte);border:1px solid var(--f-bord);box-shadow:8px 8px 0 -1px color-mix(in srgb,var(--acc) 22%,transparent)}body .aeth-fiche .af-photo img{width:100%;height:100%;object-fit:cover;display:block}body .aeth-fiche .af-histtxt{flex:1;min-width:0;max-height:220px}body .aeth-fiche .af-pkmn{position:relative;display:flex;gap:20px;align-items:center;padding:22px 24px;overflow:hidden;background-color:var(--f-encre);background-image:radial-gradient(ellipse 50% 120% at 12% 50%,color-mix(in srgb,var(--acc) 35%,transparent),transparent 70%)}body .aeth-fiche .af-pkmn::before{content:\"\";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(64deg,rgba(255,255,255,.035) 0 2px,transparent 2px 14px)}body .aeth-fiche .af-pkmn-sprite{position:relative;width:96px;height:96px;flex:none;margin:6px;display:flex;align-items:center;justify-content:center;border-radius:22px;transform:rotate(45deg);background:rgba(255,255,255,.05);border:1px solid color-mix(in srgb,var(--acc) 60%,transparent)}body .aeth-fiche .af-pkmn-sprite img,body .aeth-fiche .af-pkmn-sprite .ph{transform:rotate(-45deg)}body .aeth-fiche .af-pkmn-sprite img{max-width:118%;max-height:118%;object-fit:contain;image-rendering:pixelated}body .aeth-fiche .af-pkmn-sprite .ph{color:rgba(232,238,247,.35)}body .aeth-fiche .af-pkmn-body{position:relative;flex:1;min-width:0}body .aeth-fiche .af-pkmn-kick{margin-bottom:6px;font-size:9px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--f-clair)}body .aeth-fiche .af-pkmn-top{display:flex;align-items:center;gap:6px 10px;flex-wrap:wrap}body .aeth-fiche .af-pkmn-name{font-size:22px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff}body .aeth-fiche .af-pkmn-meta{font-size:11.5px;font-weight:700;color:rgba(232,238,247,.6)}body .aeth-fiche .af-pkmn-meta span{color:#E8EEF7}body .aeth-fiche .af-pkmn-type{padding:3px 10px;border-radius:99px;font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff}body .aeth-fiche .af-pkmn-desc{margin:10px 0 0;padding-left:12px;border-left:2px solid var(--acc);font-size:12.5px;line-height:1.65;font-style:italic;color:rgba(232,238,247,.78);max-height:150px;overflow-y:auto}body .aeth-fiche .af-player{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:16px 24px;background:var(--f-carte);border-top:3px solid var(--acc)}body .aeth-fiche .af-player-kick{margin-right:6px;display:flex;align-items:center;gap:8px;font-size:9.5px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--f-titre)}body .aeth-fiche .af-player-kick::before{content:\"\";width:6px;height:6px;transform:rotate(45deg);border:1.5px solid var(--acc)}body .aeth-fiche .af-plc{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;background:var(--f-beige);border:1px solid var(--f-bord);font-size:12px;color:var(--f-titre)}body .aeth-fiche .af-plc .l{font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--f-muet)}body .aeth-fiche .af-player-note{width:100%;margin:4px 0 0;font-size:12px;line-height:1.6;font-style:italic;color:var(--f-texte)}body .aeth-fiche .af-empty{font-size:12px;font-style:italic;color:var(--f-muet)}@media (max-width:660px){body .aeth-fiche .af-body,body .aeth-fiche .af-histrow{flex-direction:column}body .aeth-fiche .af-side{width:100%}body .aeth-fiche .af-portrait{margin:-110px auto 0}body .aeth-fiche .af-headline{left:24px;bottom:120px}body .aeth-fiche .af-photo{width:100%;height:200px}body .aeth-fiche .af-histtxt{max-height:none}}body .aeth-fiche [class]{font-family:inherit}body .aeth-fiche .af-side{border:0}body .aeth-fiche :is(.af-kick,.af-alias){opacity:1}body .aeth-fiche .af-sech::after{opacity:1;border-radius:0}body .aeth-fiche .af-sidetraits{margin-top:0}body .aeth-fiche .af-pkmn-sprite{overflow:visible}body .aeth-fiche .af-plc .l{margin-right:0}";

  /* aperçu du générateur : on injecte le CSS une fois dans la page.
     Sur le forum, c'est la feuille de style qui s'en charge. */
  function injectCss() {
    if (typeof document === 'undefined' || document.getElementById('aeth-fiche-css')) return;
    const st = document.createElement('style');
    st.id = 'aeth-fiche-css';
    st.textContent = "@import url('https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,400;0,500;0,700;0,800;1,400&display=swap');" + FICHE_CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  injectCss();

  /* ================= BUILD ================= */
  /* inlineCss : ignoré par défaut (la fiche exportée ne porte plus de <style>).
     Passe 'force' pour retrouver l'ancien comportement (CSS intégré à la fiche). */
  function buildFicheHTML(d, inlineCss) {
    d = normalize(d);
    const withCss = inlineCss === 'force';
    const acc = d.accent || DEFAULT_ACCENT;
    const gc = groupColor(d.group);
    const tag = groupTag(d.group);

    const banner = d.banner
      ? '<img class="af-banner-img" src="' + esc(d.banner) + '" alt="">'
      : '<span class="af-banner-ph">[ bannière · 650 × 240 ]</span>';

    const portrait = d.portrait
      ? '<img src="' + esc(d.portrait) + '" alt="">'
      : '<span class="ph">[ avatar · 250 × 350 ]</span>';

    const photo = d.photo
      ? '<img src="' + esc(d.photo) + '" alt="">'
      : '<span class="ph">[ image · 220 × 220 ]</span>';

    let aliasLine = '';
    if (d.alias || tag) {
      aliasLine = '<div class="af-alias">' +
        (d.alias ? '« <span class="af-aliastxt">' + esc(d.alias) + '</span> »' : '') +
        (d.alias && tag ? ' — ' : '') +
        (tag ? '<span class="af-grouptag">' + esc(tag) + '</span>' : '') +
      '</div>';
    }

    const traits = d.traits.filter(function (t) { return t && t.trim(); })
      .map(function (t) { return '<span class="af-trait">' + esc(t) + '</span>'; }).join('')
      || '<span class="af-empty">Aucun trait renseigné</span>';

    const p = d.pokemon;
    const pkmnSprite = p.sprite ? '<img src="' + esc(p.sprite) + '" alt="">' : '<span class="ph">[ sprite ]</span>';
    const pkmnTypes = (p.types || []).map(function (t) {
      return '<span class="af-pkmn-type" style="background:' + typeColor(t) + '" data-type="' + esc(t) + '">' + esc(t) + '</span>';
    }).join('');
    const pkmnMetaBits = [];
    if (p.species) pkmnMetaBits.push('<span class="af-pkmn-species">' + esc(p.species) + '</span>');
    if (p.level !== '' && p.level != null) pkmnMetaBits.push('Niv. <span class="af-pkmn-level">' + esc(p.level) + '</span>');
    if (p.nature) pkmnMetaBits.push('Nature <span class="af-pkmn-nature">' + esc(p.nature) + '</span>');

    const idCell = function (k, label, val) {
      return '<div><div class="af-idlabel">' + label + '</div><div class="af-idval af-' + k + '">' + esc(val || '—') + '</div></div>';
    };

    const secMain = function (title, cls, txt) {
      return '<div><div class="af-sech"><span>' + title + '</span></div>' +
        '<div class="af-txt af-scroll ' + cls + '">' + txt + '</div></div>';
    };
    const mainSecs =
      (d.realWorld.trim() ? secMain('Qui étais-tu dans le vrai monde ?', 'af-realworld', textToHtml(d.realWorld)) : '') +
      secMain('Personnalité', 'af-personality', d.personality.trim() ? textToHtml(d.personality) : '<p class="af-empty">Personnalité à compléter.</p>');

    const histSec = (d.history.trim() || d.photo)
      ? '<div class="af-histsec"><div class="af-sech"><span>L’histoire</span></div>' +
        '<div class="af-histrow"><div class="af-photo">' + photo + '</div>' +
        '<div class="af-histtxt af-txt af-scroll af-history">' + (d.history.trim() ? textToHtml(d.history) : '<p class="af-empty">Histoire à compléter.</p>') + '</div></div></div>'
      : '';

    const plc = function (k, label, val) {
      return val ? '<span class="af-plc"><span class="l">' + label + '</span><b class="af-pl-' + k + '">' + esc(val) + '</b></span>' : '';
    };

    return '<div class="aeth-fiche" data-accent="' + esc(acc) + '" data-group="' + esc(d.group) + '" style="--acc:' + esc(acc) + ';--gc:' + gc + '">' +
      (withCss ? '<style>' + FICHE_CSS + '</style>' : '') +
      '<div class="af-banner">' + banner +
        '<div class="af-banner-grad"></div>' +
        '<div class="af-kick">Etherium · Fiche de présentation</div>' +
        '<div class="af-groupchip"><span class="af-groupname">' + esc(d.group) + '</span></div>' +
        '<div class="af-headline"><div class="af-name">' + esc(d.name || 'Sans nom') + '</div>' + aliasLine + '</div>' +
      '</div>' +
      '<div class="af-accentbar"></div>' +
      '<div class="af-body">' +
        '<div class="af-side">' +
          '<div class="af-portrait">' + portrait + '</div>' +
          '<div class="af-idlist">' +
            idCell('age', 'Âge', d.age) + idCell('birthday', 'Anniversaire', d.birthday) +
            idCell('sexe', 'Sexe', d.sexe) + idCell('occupation', 'Occupation dans le jeu', d.occupation) +
          '</div>' +
          '<div class="af-sidetraits"><div class="af-idlabel">Traits de caractère</div><div class="af-traits">' + traits + '</div></div>' +
        '</div>' +
        '<div class="af-main">' + mainSecs + '</div>' +
      '</div>' +
      histSec +
      '<div class="af-pkmn"><div class="af-pkmn-sprite">' + pkmnSprite + '</div>' +
        '<div class="af-pkmn-body"><div class="af-pkmn-kick">Pokémon fétiche</div>' +
          '<div class="af-pkmn-top"><span class="af-pkmn-name">' + esc(p.name || 'Sans nom') + '</span>' +
          (pkmnMetaBits.length ? '<span class="af-pkmn-meta">' + pkmnMetaBits.join(' · ') + '</span>' : '') +
          pkmnTypes + '</div>' +
          (p.desc ? '<p class="af-pkmn-desc">' + esc(p.desc) + '</p>' : '') +
        '</div></div>' +
      '<div class="af-player"><span class="af-player-kick">Derrière l’écran</span>' +
        plc('pseudo', 'Pseudo', d.player.pseudo) + plc('age', 'Âge', d.player.age) + plc('country', 'Pays', d.player.country) +
        (d.player.note ? '<p class="af-player-note af-pl-note">' + esc(d.player.note) + '</p>' : '') +
      '</div>' +
    '</div>';
  }

  /* ================= SCAN (récupération) ================= */
  function scanRoot(root) {
    if (!root) throw new Error('Aucune fiche trouvée');
    const txt = function (sel) { const el = root.querySelector(sel); return el ? el.textContent.trim() : ''; };
    const rich = function (sel) { const el = root.querySelector(sel); return el ? htmlToText(el.innerHTML) : ''; };
    const attr = function (sel, a) { const el = root.querySelector(sel); return el ? (el.getAttribute(a) || '') : ''; };

    const traits = Array.prototype.map.call(root.querySelectorAll('.af-trait'), function (el) { return el.textContent.trim(); })
      .filter(function (t) { return t; });
    const pkmnTypes = Array.prototype.map.call(root.querySelectorAll('.af-pkmn-type'), function (el) {
      return el.getAttribute('data-type') || el.textContent.trim();
    }).filter(Boolean);

    const groupAttr = root.getAttribute('data-group') || txt('.af-groupname');
    const idval = function (k) { const el = root.querySelector('.af-' + k); return el ? el.textContent.trim().replace(/^—$/, '') : ''; };

    return normalize({
      accent: root.getAttribute('data-accent') || (root.style && root.style.getPropertyValue('--acc')) || DEFAULT_ACCENT,
      name: txt('.af-name'),
      alias: txt('.af-aliastxt'),
      banner: attr('.af-banner-img', 'src') || attr('.af-banner img', 'src'),
      portrait: attr('.af-portrait img', 'src'),
      photo: attr('.af-photo img', 'src'),
      age: idval('age'), sexe: idval('sexe'), birthday: idval('birthday'), occupation: idval('occupation'),
      group: GROUPS.indexOf(groupAttr) >= 0 ? groupAttr : 'Ancrés',
      traits: traits,
      realWorld: rich('.af-realworld'),
      personality: rich('.af-personality'),
      pokemon: {
        sprite: attr('.af-pkmn-sprite img', 'src'),
        name: txt('.af-pkmn-name'), species: txt('.af-pkmn-species'),
        types: pkmnTypes.length ? pkmnTypes : ['Normal'],
        level: txt('.af-pkmn-level'), nature: txt('.af-pkmn-nature'),
        desc: rich('.af-pkmn-desc')
      },
      history: rich('.af-history'),
      player: {
        pseudo: idorpl('pseudo', root), age: idorpl('age', root, true), country: idorpl('country', root), note: rich('.af-pl-note')
      }
    });
  }
  function idorpl(k, root, isAge) {
    const el = root.querySelector('.af-pl-' + k);
    if (!el) return '';
    const v = el.textContent.trim();
    return v === '—' ? '' : v;
  }

  function scanFiche(htmlOrEl) {
    if (htmlOrEl && htmlOrEl.nodeType === 1) {
      return scanRoot(htmlOrEl.classList.contains('aeth-fiche') ? htmlOrEl : htmlOrEl.querySelector('.aeth-fiche') || htmlOrEl);
    }
    const doc = new DOMParser().parseFromString(String(htmlOrEl || ''), 'text/html');
    const root = doc.querySelector('.aeth-fiche');
    if (!root) throw new Error('Aucune fiche Etherium détectée dans ce code');
    return scanRoot(root);
  }

  window.FICHE = {
    GROUPS: GROUPS, GROUP_META: GROUP_META, groupColor: groupColor, groupTag: groupTag,
    ACCENTS: ACCENTS, TYPE: TYPE, TYPE_LIST: TYPE_LIST, typeColor: typeColor, NATURES: NATURES,
    clone: clone, normalize: normalize, DEFAULT_FICHE: DEFAULT_FICHE,
    buildFicheHTML: buildFicheHTML,
    FICHE_CSS: FICHE_CSS,
    scanFiche: scanFiche
  };
})();
