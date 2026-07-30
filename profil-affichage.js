/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  AFFICHAGE DU PROFIL — remplit la coquille avec les champs du forum   ║
   ╠══════════════════════════════════════════════════════════════════════╣
   ║  Forumactif imprime tous les champs dans un bloc « .profile-infos ».  ║
   ║  Ce script le CACHE et recopie chaque champ dans la bonne case de la  ║
   ║  coquille (team, talents, RP, à propos, mini-cartes, etc.).           ║
   ║                                                                       ║
   ║  ▼ TOUT SE RÈGLE DANS LE BLOC CI-DESSOUS.                             ║
   ║    Le « numéro de champ » est la classe que met le forum :             ║
   ║    <div class="info field-1"> → on écrit 'field-1'.                    ║
   ║    Pour déplacer un champ, change juste sa ligne de place.             ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

var PA_REGLAGES = {

  /* — Grandes cartes : champ du forum → zone de la coquille — */
  team:      'field-1',    /* TEAM (les 6 icônes)          → #pr_team_corps    */
  talents:   'field-13',   /* Talents                      → #pr_talents_corps */
  rp:        'field-11',   /* RP en cours                  → #pr_rps_corps     */
  apropos:   'field-3',    /* RESUME PERSONNAGE            → #pr_apropos_corps */
  /* ICONE 195x100 : non utilisée (la colonne de gauche n'affiche que l'avatar).
     Pour l'afficher un jour, remets un <div id="pr_illu"></div> dans la
     coquille et écris ci-dessous : illustration: 'field-5', */
  illustration: '',

  /* — Mini-cartes de la colonne de gauche (dans l'ordre d'affichage) —
       [ numéro de champ, titre affiché ] */
  minis: [
    ['field-2',   'Pokédollars'],
    ['field--13', 'Expérience'],
    ['field--6',  'Messages'],
    ['field--4',  'Inscrit le']
  ],

  /* — Cartes de champs à droite (dans l'ordre d'affichage) —
       [ numéro de champ, titre affiché, 'large' pour une case double ] */
  champs: [
    ['field-4', 'Faceclaim'],
    ['field-6', 'Âge'],
    ['field-7', 'Sexe'],
    ['field-8', 'Métier']
  ],

  /* Texte affiché quand un champ est vide. */
  vide: '—'
};

/* ────────────────────────────────────────────────────────────────────────
   Mécanique — normalement rien à modifier en dessous.
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  var source = document.querySelector('.profile-infos');
  if (!source || source.getAttribute('data-pa')) return;
  source.setAttribute('data-pa', '1');

  /* on garde le bloc d'origine dans la page (l'édition en ligne du forum
     continue de fonctionner) mais on ne l'affiche plus */
  source.style.display = 'none';

  /* — lecture d'un champ : « field-1 », « field--6 »… — */
  function bloc(num) {
    return source.querySelector('div.info.' + CSS.escape(num));
  }
  function valeurHtml(num) {
    var n = bloc(num);
    if (!n) return '';
    var v = n.querySelector('.field_uneditable');
    var html = (v ? v.innerHTML : '').trim();
    if (!html || html === '-' || html === '&nbsp;-' || /^\s*(&nbsp;)?-\s*$/.test(html)) return '';
    return html;
  }
  function valeurTexte(num) {
    var n = bloc(num);
    if (!n) return '';
    var v = n.querySelector('.field_uneditable');
    var t = (v ? v.textContent : '').replace(/\s+/g, ' ').trim();
    return (t === '-' || t === '') ? '' : t;
  }
  function poser(id, html) {
    var cible = document.getElementById(id);
    if (!cible) return;
    if (html) { cible.innerHTML = html; }
    else {
      var carte = cible.closest('.pr-carte');
      if (carte) carte.style.display = 'none'; else cible.innerHTML = PA_REGLAGES.vide;
    }
  }

  /* — couleur du groupe : le forum la met en style sur les champs — */
  var teinte = source.querySelector('.info[style*="border-color"]');
  if (teinte) {
    var couleur = teinte.style.borderColor || teinte.style.backgroundColor;
    var racine = document.getElementById('wombat');
    if (couleur && racine) racine.style.setProperty('--groupe', couleur);
  }

  /* — 1. Team Pokémon : on reprend les images telles quelles — */
  poser('pr_team_corps', valeurHtml(PA_REGLAGES.team));

  /* — 2. Talents : table BBCode déjà rendue par le forum — */
  poser('pr_talents_corps', valeurHtml(PA_REGLAGES.talents));

  /* — 3. À propos — */
  poser('pr_apropos_corps', valeurHtml(PA_REGLAGES.apropos));

  /* — 4. RP en cours : une ligne .pr-rp par ligne de tableau —
         (si le champ n'est pas un tableau, on recopie tel quel) */
  (function () {
    var html = valeurHtml(PA_REGLAGES.rp);
    if (!html) { poser('pr_rps_corps', ''); return; }
    var tampon = document.createElement('div');
    tampon.innerHTML = html;
    var lignes = tampon.querySelectorAll('tr');
    if (!lignes.length) { poser('pr_rps_corps', html); return; }
    var out = '';
    lignes.forEach(function (tr) {
      var td = tr.querySelectorAll('td');
      var titre = td[0] ? td[0].innerHTML.trim() : '';
      var avec = td[1] ? td[1].textContent.trim() : '';
      var etat = td[2] ? td[2].textContent.trim() : '';
      if (!titre) return;
      out += '<div class="pr-rp">' + titre +
             (avec ? '<span class="avec">' + avec + '</span>' : '') +
             (etat ? '<span class="etat">' + etat + '</span>' : '') + '</div>';
    });
    poser('pr_rps_corps', out);
  })();

  /* — 5. Illustration (ICONE) — ne fait rien si non réglée ou absente — */
  (function () {
    var zone = document.getElementById('pr_illu');
    if (!zone || !PA_REGLAGES.illustration) return;
    var html = valeurHtml(PA_REGLAGES.illustration);
    if (html && html.indexOf('<img') !== -1) zone.innerHTML = html;
    else zone.style.display = 'none';
  })();

  /* — 6. Mini-cartes de gauche — */
  (function () {
    var zone = document.getElementById('pr_minis');
    if (!zone) return;
    var out = '';
    PA_REGLAGES.minis.forEach(function (m) {
      var v = valeurTexte(m[0]);
      if (!v) return;
      out += '<div class="pr-mini"><b>' + m[1] + '</b><span>' + v + '</span></div>';
    });
    zone.innerHTML = out;
  })();

  /* — 7. Cartes de champs à droite — */
  (function () {
    var zone = document.getElementById('pr_champs');
    if (!zone) return;
    var out = '';
    PA_REGLAGES.champs.forEach(function (c) {
      var v = valeurHtml(c[0]);
      if (!v) return;
      out += '<div class="pr-champ' + (c[2] === 'large' ? ' large' : '') + '"><b>' + c[1] + '</b><span>' + v + '</span></div>';
    });
    zone.innerHTML = out;
  })();

  /* — 8. Statut en ligne — */
  (function () {
    var statut = document.querySelector('.pr-statut');
    var src = source.querySelector('.online-statut .user-online-status');
    if (!statut) return;
    if (!src) { statut.style.display = 'none'; return; }
    statut.textContent = src.textContent.trim();
    statut.classList.toggle('on', src.classList.contains('is-online'));
  })();

  /* — 9. Bouton MP et liens « sujets / messages » — */
  (function () {
    var contact = document.querySelector('.profile_contact');
    var mp = source.querySelector('.mp-button a');
    if (contact && mp) {
      var a = mp.cloneNode(true);
      a.removeAttribute('style');
      a.title = 'Envoyer un message privé';
      contact.innerHTML = '';
      contact.appendChild(a);
    } else if (contact) contact.style.display = 'none';

    var liens = document.getElementById('pr_liens');
    var stats = source.querySelectorAll('.profile-stats-post a');
    if (liens) {
      if (!stats.length) { liens.style.display = 'none'; return; }
      liens.innerHTML = '';
      stats.forEach(function (s) {
        var a = document.createElement('a');
        a.href = s.getAttribute('href');
        a.textContent = s.textContent.replace(/\s+/g, ' ').trim();
        liens.appendChild(a);
      });
    }
  })();
})();
