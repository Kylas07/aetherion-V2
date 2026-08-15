/* Shared data + helpers for the Etheriuù "fiche de présentation" editor — v2 layout.
   Exposes everything on window.FICHE.
   Récupération = scan of a pasted/fetched fiche DOM (no base64 blob):
   every field lives in a semantic class or a data-* attribute so the sheet
   can be re-read even if the CSS changes. */
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
  function groupColor(g) { return (GROUP_META[g] || {}).color || '#C25C3A'; }
  function groupTag(g) { return (GROUP_META[g] || {}).tag || ''; }

  const ACCENTS = ['#C25C3A', '#E07A4E', '#B0492B', '#8A8F98', '#D98C3F', '#5E6B78', '#6E5A9B', '#2FA7A0'];

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
    return d.value.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').trim();
  }

  const DISP = "'Oswald','Arial Narrow',Verdana,sans-serif";
  const BODYF = "'Barlow',Verdana,Geneva,sans-serif";
  const STRIPE_D = 'repeating-linear-gradient(45deg,#2A2420 0 8px,#211C18 8px 16px)';
  const STRIPE_L = 'repeating-linear-gradient(45deg,#F0ECE4 0 7px,#E7E1D8 7px 14px)';

  const DEFAULT_FICHE = {
    accent: '#C25C3A',
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
    realWorld: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta leo vel bibendum feugiat. Quisque venenatis lacinia augue ut placerat. Cras sodales enim in metus rhoncus, quis dictum felis molestie. Maecenas eu quam consectetur, tristique velit ac, semper lectus. Morbi in consectetur nunc, a mollis ex. Donec sem tortor, pretium eu eleifend a, tincidunt et arcu. Nam aliquet odio et metus maximus, a pellentesque purus finibus. Pellentesque non ullamcorper dolor. Sed leo odio, varius sit amet tempor in, luctus eget nulla. Sed ac ornare felis. Nunc velit velit, eleifend vitae placerat eget, vestibulum eget odio. Praesent nec metus et dui accumsan mattis. Cras tempus ante sit amet ultrices convallis. Morbi in dui eget nunc hendrerit lobortis vitae a odio.",
    personality: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta leo vel bibendum feugiat. Quisque venenatis lacinia augue ut placerat. Cras sodales enim in metus rhoncus, quis dictum felis molestie. Maecenas eu quam consectetur, tristique velit ac, semper lectus. Morbi in consectetur nunc, a mollis ex. Donec sem tortor, pretium eu eleifend a, tincidunt et arcu. Nam aliquet odio et metus maximus, a pellentesque purus finibus. Pellentesque non ullamcorper dolor. Sed leo odio, varius sit amet tempor in, luctus eget nulla. Sed ac ornare felis. Nunc velit velit, eleifend vitae placerat eget, vestibulum eget odio. Praesent nec metus et dui accumsan mattis. Cras tempus ante sit amet ultrices convallis. Morbi in dui eget nunc hendrerit lobortis vitae a odio.",
    pokemon: { sprite: '', name: 'Braise', species: 'Goupix', types: ['Feu'], level: 22, nature: 'Assuré', desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta leo vel bibendum feugiat. Quisque venenatis lacinia augue ut placerat. Cras sodales enim in metus rhoncus, quis dictum felis molestie. Maecenas eu quam consectetur, tristique velit ac, semper lectus. Morbi in consectetur nunc, a mollis ex. Donec sem tortor, pretium eu eleifend a, tincidunt et arcu. Nam aliquet odio et metus maximus, a pellentesque purus finibus. Pellentesque non ullamcorper dolor. Sed leo odio, varius sit amet tempor in, luctus eget nulla. Sed ac ornare felis. Nunc velit velit, eleifend vitae placerat eget, vestibulum eget odio. Praesent nec metus et dui accumsan mattis. Cras tempus ante sit amet ultrices convallis. Morbi in dui eget nunc hendrerit lobortis vitae a odio." },
    history: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta leo vel bibendum feugiat. Quisque venenatis lacinia augue ut placerat. Cras sodales enim in metus rhoncus, quis dictum felis molestie. Maecenas eu quam consectetur, tristique velit ac, semper lectus. Morbi in consectetur nunc, a mollis ex. Donec sem tortor, pretium eu eleifend a, tincidunt et arcu. Nam aliquet odio et metus maximus, a pellentesque purus finibus. Pellentesque non ullamcorper dolor. Sed leo odio, varius sit amet tempor in, luctus eget nulla. Sed ac ornare felis. Nunc velit velit, eleifend vitae placerat eget, vestibulum eget odio. Praesent nec metus et dui accumsan mattis. Cras tempus ante sit amet ultrices convallis. Morbi in dui eget nunc hendrerit lobortis vitae a odio.",
    player: { pseudo: 'kylas', age: '', country: 'FUSEAU HORAIRE', note: "J'adore Mirabelle" }
  };

  function normalize(d) {
    d = d || {};
    const p = d.pokemon || {};
    const pl = d.player || {};
    return {
      accent: d.accent || '#C25C3A',
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

  /* ================= BUILD (layout v2 : bannière + portrait latéral + scrolls) ================= */
  // const FICHE_CSS =
  //   "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');" +
  //   '.aeth-fiche{width:650px;max-width:100%;margin:0 auto;font-family:' + BODYF + ';background:#FFFFFF;border:1px solid #E7E2DA;border-radius:16px;overflow:hidden;box-shadow:0 18px 44px -22px rgba(45,38,30,.38);color:#4E483F}' +
  //   '.aeth-fiche *{box-sizing:border-box}' +
  //   '.aeth-fiche .ph{font-family:monospace;font-size:11px;color:#948B7F}' +
  //   /* bannière */
  //   '.aeth-fiche .af-banner{position:relative;height:240px;background:' + STRIPE_D + ';overflow:hidden}' +
  //   '.aeth-fiche .af-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
  //   '.aeth-fiche .af-banner-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:11px;color:#8B837A}' +
  //   '.aeth-fiche .af-banner-grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(33,28,24,.15) 0%,rgba(33,28,24,0) 35%,rgba(33,28,24,.88) 100%)}' +
  //   '.aeth-fiche .af-kick{position:absolute;left:26px;top:18px;font-family:' + DISP + ';font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#FFFFFF;font-weight:600;opacity:.85}' +
  //   '.aeth-fiche .af-groupchip{position:absolute;right:26px;top:14px;background:var(--gc);border-radius:999px;padding:6px 16px;color:#FFFFFF}' +
  //   '.aeth-fiche .af-groupname{font-family:' + DISP + ';letter-spacing:3px;text-transform:uppercase;font-weight:700;font-size:12px}' +
  //   '.aeth-fiche .af-headline{position:absolute;left:26px;right:26px;bottom:18px}' +
  //   '.aeth-fiche .af-name{font-family:' + DISP + ';font-size:40px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.5)}' +
  //   '.aeth-fiche .af-alias{font-style:italic;color:#EDE6DD;font-size:14px;margin-top:7px;opacity:.95}' +
  //   '.aeth-fiche .af-grouptag{font-style:normal;font-weight:600;color:#FFFFFF}' +
  //   '.aeth-fiche .af-accentbar{height:4px;background:linear-gradient(90deg,var(--acc) 0 250px,var(--gc) 250px)}' +
  //   /* corps : colonne portrait + textes */
  //   '.aeth-fiche .af-body{display:flex;align-items:stretch}' +
  //   '.aeth-fiche .af-side{width:250px;flex:none;background:#F8F5F0;border-right:1px solid #ECE6DD;display:flex;flex-direction:column}' +
  //   '.aeth-fiche .af-portrait{width:250px;height:350px;background:' + STRIPE_L + ';display:flex;align-items:center;justify-content:center;border-bottom:1px solid #ECE6DD;overflow:hidden}' +
  //   '.aeth-fiche .af-portrait img{width:100%;height:100%;object-fit:cover;display:block}' +
  //   '.aeth-fiche .af-idlist{padding:16px 20px 6px;display:grid;gap:12px}' +
  //   '.aeth-fiche .af-idlabel{font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#948B7F;font-weight:700}' +
  //   '.aeth-fiche .af-idval{font-size:13.5px;font-weight:600;color:#26221D;margin-top:2px}' +
  //   '.aeth-fiche .af-sidetraits{padding:14px 20px 20px;margin-top:auto}' +
  //   '.aeth-fiche .af-sidetraits .af-idlabel{margin-bottom:8px}' +
  //   '.aeth-fiche .af-traits{display:flex;flex-wrap:wrap;gap:6px}' +
  //   '.aeth-fiche .af-trait{background:#FFFFFF;border:1px solid #ECE6DD;border-radius:6px;padding:4px 10px;font-size:11.5px;font-weight:600;color:#4E483F}' +
  //   '.aeth-fiche .af-main{flex:1;min-width:0;padding:22px 26px;display:grid;gap:22px;align-content:start}' +
  //   /* sections */
  //   '.aeth-fiche .af-sech{font-family:' + DISP + ';font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--acc);font-weight:600;display:flex;align-items:center;gap:12px;margin-bottom:11px}' +
  //   '.aeth-fiche .af-sech::after{content:"";flex:1;height:2px;background:var(--acc);opacity:.28;border-radius:2px}' +
  //   '.aeth-fiche .af-scroll{max-height:300px;overflow-y:auto;padding-right:8px}' +
  //   '.aeth-fiche .af-txt p{margin:0 0 12px;font-size:13.5px;line-height:1.7}.aeth-fiche .af-txt p:last-child{margin-bottom:0}' +
  //   /* histoire : image carrée + texte */
  //   '.aeth-fiche .af-histsec{padding:22px 26px;border-top:1px solid #E7E2DA}' +
  //   '.aeth-fiche .af-histrow{display:flex;gap:20px;align-items:flex-start}' +
  //   '.aeth-fiche .af-photo{width:220px;height:220px;flex:none;border-radius:13px;overflow:hidden;border:1px solid #E7E2DA;background:' + STRIPE_L + ';display:flex;align-items:center;justify-content:center}' +
  //   '.aeth-fiche .af-photo img{width:100%;height:100%;object-fit:cover;display:block}' +
  //   '.aeth-fiche .af-histtxt{flex:1;min-width:0}' +
  //   /* pokémon fétiche */
  //   '.aeth-fiche .af-pkmn{background:#211C18;padding:20px 26px;display:flex;gap:18px;align-items:center}' +
  //   '.aeth-fiche .af-pkmn-sprite{width:104px;height:104px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12)}' +
  //   '.aeth-fiche .af-pkmn-sprite img{max-width:100%;max-height:100%;object-fit:contain;image-rendering:pixelated}' +
  //   '.aeth-fiche .af-pkmn-sprite .ph{font-size:10px;color:#8B837A}' +
  //   '.aeth-fiche .af-pkmn-body{flex:1;min-width:0}' +
  //   '.aeth-fiche .af-pkmn-kick{font-family:' + DISP + ';font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#E8B49A;font-weight:600;margin-bottom:5px}' +
  //   '.aeth-fiche .af-pkmn-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}' +
  //   '.aeth-fiche .af-pkmn-name{font-family:' + DISP + ';font-size:22px;font-weight:700;letter-spacing:.5px;color:var(--acc)}' +
  //   '.aeth-fiche .af-pkmn-meta{font-size:12px;color:#EDE6DD}' +
  //   '.aeth-fiche .af-pkmn-type{color:#fff;font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:6px;letter-spacing:.3px}' +
  //   '.aeth-fiche .af-pkmn-desc{margin:8px 0 0;font-size:12.5px;line-height:1.6;color:#EDE6DD;font-style:italic}' +
  //   /* derrière l'écran */
  //   '.aeth-fiche .af-player{background:#F8F5F0;border-top:1px solid #ECE6DD;padding:16px 26px;display:flex;gap:8px 26px;align-items:baseline;flex-wrap:wrap}' +
  //   '.aeth-fiche .af-player-kick{font-family:' + DISP + ';font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#948B7F;font-weight:600}' +
  //   '.aeth-fiche .af-plc{font-size:13px;color:#26221D}' +
  //   '.aeth-fiche .af-plc .l{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#948B7F;font-weight:700;margin-right:5px}' +
  //   '.aeth-fiche .af-player-note{margin:2px 0 0;font-size:12px;line-height:1.6;color:#4E483F;font-style:italic;width:100%}' +
  //   '.aeth-fiche .af-empty{font-size:12px;color:#948B7F;font-style:italic}';

  function buildFicheHTML(d, inlineCss) {
    d = normalize(d);
    const withCss = inlineCss !== false;
    const acc = d.accent || '#C25C3A';
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
        (d.alias ? '\u00ab\u2009<span class="af-aliastxt">' + esc(d.alias) + '</span>\u2009\u00bb' : '') +
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
      ? '<div class="af-histsec"><div class="af-sech"><span>L\u2019histoire</span></div>' +
        '<div class="af-histrow"><div class="af-photo">' + photo + '</div>' +
        '<div class="af-histtxt af-txt af-scroll af-history">' + (d.history.trim() ? textToHtml(d.history) : '<p class="af-empty">Histoire à compléter.</p>') + '</div></div></div>'
      : '';

    const plc = function (k, label, val) {
      return val ? '<span class="af-plc"><span class="l">' + label + '</span><b class="af-pl-' + k + '">' + esc(val) + '</b></span>' : '';
    };

    return '<div class="aeth-fiche" data-accent="' + esc(acc) + '" data-group="' + esc(d.group) + '" style="--acc:' + esc(acc) + ';--gc:' + gc + '">' +
      // (withCss ? '<style>' + FICHE_CSS + '</style>' : '') +
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
      '<div class="af-player"><span class="af-player-kick">Derrière l\u2019écran</span>' +
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
      accent: root.getAttribute('data-accent') || (root.style && root.style.getPropertyValue('--acc')) || '#C25C3A',
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
     // FICHE_CSS: FICHE_CSS, 
     scanFiche: scanFiche
  };
})();
