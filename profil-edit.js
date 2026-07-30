/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  ÉDITION DU PROFIL — habillage du formulaire Forumactif              ║
   ╠══════════════════════════════════════════════════════════════════════╣
   ║  Ce script ne change PAS les champs du forum : il les garde tels      ║
   ║  quels (donc l'enregistrement fonctionne comme avant) et ajoute :     ║
   ║   · des ONGLETS pour ranger les panneaux,                             ║
   ║   · des ÉDITEURS À BOUTONS pour les champs remplis en BBCode           ║
   ║     (Team Pokémon, Talents, RP en cours),                             ║
   ║   · un APERÇU du profil tel qu'il s'affichera.                        ║
   ║                                                                       ║
   ║  ▼ POUR MODIFIER SANS CODER, tout est dans le bloc RÉGLAGES ci-dessous ║
   ║    (noms des champs, image de Pokéball vide, niveaux de talent…).      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

var EP_REGLAGES = {

  /* Image utilisée quand un emplacement de Pokémon est vide. */
  pokeballVide: 'https://www.pokepedia.fr/images/0/07/Miniature_Pok%C3%A9_Ball_HOME.png',

  /* Nombre d'emplacements dans la team. */
  nbPokemon: 6,

  /* Niveaux de talent : libellé + couleur (repris dans le profil). */
  talents: [
    { code: 'T1', nom: 'Bronze', couleur: '#B0804A' },
    { code: 'T2', nom: 'Argent', couleur: '#8A857C' },
    { code: 'T3', nom: 'Or',     couleur: '#D99A2B' }
  ],

  /* États possibles d'un RP en cours. */
  etatsRp: ['En cours', 'En attente', 'Terminé'],

  /* Reconnaissance des champs : si le libellé du champ contient un de ces
     mots, on lui donne l'éditeur correspondant. */
  reconnaissance: {
    team:    ['team', 'équipe', 'equipe', 'pokémon', 'pokemon'],
    talents: ['talent'],
    rp:      ['rp en cours', 'rps en cours', 'rp'],
    texte:   ['resume', 'résumé', 'propos', 'commentaire', 'présentation', 'presentation', 'histoire']
  },

  /* Onglet supplémentaire d'aperçu. */
  ongletApercu: 'Aperçu du profil'
};

/* ────────────────────────────────────────────────────────────────────────
   Mécanique — normalement rien à modifier en dessous.
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  var form = document.getElementById('ucp');
  if (!form || form.getAttribute('data-ep')) return;
  form.setAttribute('data-ep', '1');

  function el(tag, classe, texte) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte !== undefined) n.textContent = texte;
    return n;
  }
  function sansAccent(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* ═ 1. Onglets : un titre <h1> + son panneau = un onglet ═ */
  var groupes = [];
  var titres = form.querySelectorAll('h1.page-title');
  titres.forEach(function (h1) {
    var groupe = el('div', 'ep-groupe');
    var nom = h1.textContent.trim();
    var noeud = h1.nextSibling;
    form.insertBefore(groupe, h1);
    groupe.appendChild(h1);
    while (noeud && !(noeud.nodeType === 1 && (noeud.tagName === 'H1' || noeud.classList.contains('submit-buttons')))) {
      var suivant = noeud.nextSibling;
      groupe.appendChild(noeud);
      noeud = suivant;
    }
    groupes.push({ nom: nom, noeud: groupe });
  });
  if (!groupes.length) return;

  var barre = el('div', 'ep-onglets');
  form.insertBefore(barre, form.firstChild);

  /* panneau d'aperçu, ajouté en dernier onglet */
  var apercu = el('div', 'ep-groupe');
  var boutonsEnvoi = form.querySelector('.submit-buttons');
  if (boutonsEnvoi) form.insertBefore(apercu, boutonsEnvoi); else form.appendChild(apercu);
  groupes.push({ nom: EP_REGLAGES.ongletApercu, noeud: apercu, apercu: true });

  var boutons = [];
  groupes.forEach(function (g, i) {
    var b = el('button', '', g.nom);
    b.type = 'button';
    b.addEventListener('click', function () {
      groupes.forEach(function (x, j) {
        x.noeud.classList.toggle('actif', i === j);
        boutons[j].classList.toggle('actif', i === j);
      });
      if (g.apercu) rafraichirApercu();
    });
    barre.appendChild(b);
    boutons.push(b);
  });
  groupes[0].noeud.classList.add('actif');
  boutons[0].classList.add('actif');

  /* ═ 2. Éditeurs BBCode ═ */
  var editeurs = [];

  function typeDeChamp(libelle) {
    var t = sansAccent(libelle);
    var r = EP_REGLAGES.reconnaissance;
    for (var cle in r) {
      for (var i = 0; i < r[cle].length; i++) {
        if (t.indexOf(sansAccent(r[cle][i])) !== -1) return cle;
      }
    }
    return null;
  }

  /* On accepte les deux mises en page de Forumactif :
     · page « Modifier mon profil » : <dl><dt>libellé</dt><dd>champ</dd></dl>
     · édition en ligne du profil   : <div class="info field-N"><span>libellé</span>… */
  form.querySelectorAll('dl, .info').forEach(function (dl) {
    var zone = dl.querySelector('textarea');
    if (!zone) return;
    var dt = dl.querySelector('dt') || dl.querySelector(':scope > span');
    var libelle = dt ? dt.textContent.replace(/[:*\s\u00a0]+$/, '').trim() : '';
    var type = typeDeChamp(libelle);
    if (!type) return;

    var dd = zone.parentNode;
    zone.style.display = 'none';                        /* le champ d'origine reste, invisible */
    var cadre = el('div', 'ep-editeur');
    var tete = el('header');
    tete.appendChild(el('b', '', libelle));
    var outils = el('div', 'ep-outils');
    tete.appendChild(outils);
    cadre.appendChild(tete);
    var corps = el('div', 'ep-corps');
    cadre.appendChild(corps);
    dd.insertBefore(cadre, zone);

    var editeur = { type: type, zone: zone, corps: corps, outils: outils, tete: tete };
    if (type === 'team') monterTeam(editeur);
    else if (type === 'talents') monterTalents(editeur);
    else if (type === 'rp') monterRp(editeur);
    else monterTexte(editeur);
    editeurs.push(editeur);
  });

  /* — code généré, repliable — */
  function ajouterCode(editeur) {
    var d = el('details', 'ep-code');
    d.appendChild(el('summary', '', 'Voir le code BBCode généré'));
    var pre = el('pre');
    d.appendChild(pre);
    editeur.corps.appendChild(d);
    editeur.pre = pre;
  }
  function ecrire(editeur, valeur) {
    editeur.zone.value = valeur;
    if (editeur.pre) editeur.pre.textContent = valeur || '(vide)';
  }

  /* ═ 2a. Team Pokémon : N emplacements d'images ═ */
  function monterTeam(e) {
    var urls = [];
    (e.zone.value.match(/\[img\][^\[]*\[\/img\]/gi) || []).forEach(function (m) {
      urls.push(m.replace(/\[\/?img\]/gi, '').trim());
    });

    var grille = el('div', 'ep-team');
    e.corps.appendChild(grille);
    var champs = [];

    for (var i = 0; i < EP_REGLAGES.nbPokemon; i++) {
      var slot = el('div', 'ep-slot');
      var vignette = el('div', 'vignette');
      var img = document.createElement('img');
      vignette.appendChild(img);
      var champ = el('div', 'champ');
      champ.appendChild(el('b', '', 'Pokémon ' + (i + 1)));
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'ep-input';
      input.placeholder = 'Adresse de l’icône (https://…)';
      input.value = urls[i] || '';
      champ.appendChild(input);
      slot.appendChild(vignette);
      slot.appendChild(champ);
      grille.appendChild(slot);
      champs.push({ input: input, img: img });
      input.addEventListener('input', maj);
    }

    var vider = el('button', 'ep-btn sup', 'Tout vider');
    vider.type = 'button';
    vider.addEventListener('click', function () {
      champs.forEach(function (c) { c.input.value = ''; });
      maj();
    });
    var remplir = el('button', 'ep-btn', 'Remplir de Pokéballs');
    remplir.type = 'button';
    remplir.addEventListener('click', function () {
      champs.forEach(function (c) { if (!c.input.value.trim()) c.input.value = EP_REGLAGES.pokeballVide; });
      maj();
    });
    e.outils.appendChild(remplir);
    e.outils.appendChild(vider);
    ajouterCode(e);

    function maj() {
      var bb = '';
      champs.forEach(function (c) {
        var v = c.input.value.trim() || EP_REGLAGES.pokeballVide;
        c.img.src = v;
        bb += '[img]' + v + '[/img]';
      });
      ecrire(e, bb);
      rafraichirApercu();
    }
    maj();
  }

  /* ═ 2b. Talents : lignes nom + niveau ═ */
  function monterTalents(e) {
    var lignes = [];
    var conteneur = el('div', 'ep-lignes');
    e.corps.appendChild(conteneur);
    var vide = el('div', 'ep-vide', 'Aucun talent pour le moment — clique sur « Ajouter un talent ».');
    e.corps.appendChild(vide);

    /* lecture de l'existant : [tr][td]Nom [color=#…]T1[/color][/td][/tr] */
    var re = /\[tr\]\[td\](.*?)\[color=(#[0-9A-Fa-f]{3,6})\](T\d)\[\/color\]\[\/td\]\[\/tr\]/gi;
    var m;
    var lus = [];
    while ((m = re.exec(e.zone.value)) !== null) lus.push({ nom: m[1].trim(), code: m[3] });

    var ajouter = el('button', 'ep-btn primaire', '+ Ajouter un talent');
    ajouter.type = 'button';
    ajouter.addEventListener('click', function () { creer('', EP_REGLAGES.talents[0].code); maj(); });
    e.outils.appendChild(ajouter);
    ajouterCode(e);

    function creer(nom, code) {
      var ligne = el('div', 'ep-ligne talent');
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'ep-input';
      input.placeholder = 'Nom du talent';
      input.value = nom;
      var select = document.createElement('select');
      select.className = 'ep-input';
      EP_REGLAGES.talents.forEach(function (t) {
        var o = document.createElement('option');
        o.value = t.code;
        o.textContent = t.code + ' · ' + t.nom;
        if (t.code === code) o.selected = true;
        select.appendChild(o);
      });
      var sup = el('button', 'ep-btn sup', '×');
      sup.type = 'button';
      sup.title = 'Supprimer ce talent';
      sup.addEventListener('click', function () {
        conteneur.removeChild(ligne);
        lignes.splice(lignes.indexOf(obj), 1);
        maj();
      });
      ligne.appendChild(input);
      ligne.appendChild(select);
      ligne.appendChild(sup);
      conteneur.appendChild(ligne);
      var obj = { ligne: ligne, input: input, select: select };
      lignes.push(obj);
      input.addEventListener('input', maj);
      select.addEventListener('change', maj);
      return obj;
    }

    (lus.length ? lus : []).forEach(function (t) { creer(t.nom, t.code); });

    function maj() {
      vide.style.display = lignes.length ? 'none' : '';
      var corps = '';
      lignes.forEach(function (l) {
        var t = EP_REGLAGES.talents.filter(function (x) { return x.code === l.select.value; })[0] || EP_REGLAGES.talents[0];
        l.ligne.className = 'ep-ligne talent ep-' + t.code.toLowerCase();
        if (l.input.value.trim()) {
          corps += '[tr][td]' + l.input.value.trim() + ' [color=' + t.couleur + ']' + t.code + '[/color][/td][/tr]\n';
        }
      });
      ecrire(e, corps ? '[table class="nom"]\n' + corps + '[/table]' : '');
      rafraichirApercu();
    }
    maj();
  }

  /* ═ 2c. RP en cours : lignes titre + lien + partenaire + état ═ */
  function monterRp(e) {
    var lignes = [];
    var conteneur = el('div', 'ep-lignes');
    e.corps.appendChild(conteneur);
    var vide = el('div', 'ep-vide', 'Aucun RP listé — clique sur « Ajouter un RP ».');
    e.corps.appendChild(vide);

    /* lecture : [tr][td][url=lien]Titre[/url][/td][td]avec X[/td][td]État[/td][/tr] */
    var re = /\[tr\]\[td\](?:\[url=([^\]]*)\])?(.*?)(?:\[\/url\])?\[\/td\]\[td\](.*?)\[\/td\]\[td\](.*?)\[\/td\]\[\/tr\]/gi;
    var m, lus = [];
    while ((m = re.exec(e.zone.value)) !== null) {
      lus.push({ lien: m[1] || '', titre: m[2].trim(), avec: m[3].replace(/^avec\s*/i, '').trim(), etat: m[4].trim() });
    }

    var ajouter = el('button', 'ep-btn primaire', '+ Ajouter un RP');
    ajouter.type = 'button';
    ajouter.addEventListener('click', function () { creer({}); maj(); });
    e.outils.appendChild(ajouter);
    ajouterCode(e);

    function creer(rp) {
      var ligne = el('div', 'ep-ligne rp');
      function champ(placeholder, valeur) {
        var i = document.createElement('input');
        i.type = 'text';
        i.className = 'ep-input';
        i.placeholder = placeholder;
        i.value = valeur || '';
        i.addEventListener('input', maj);
        ligne.appendChild(i);
        return i;
      }
      var titre = champ('Titre du RP', rp.titre);
      var lien = champ('Lien du sujet', rp.lien);
      var avec = champ('Avec qui ?', rp.avec);
      var select = document.createElement('select');
      select.className = 'ep-input';
      EP_REGLAGES.etatsRp.forEach(function (etat) {
        var o = document.createElement('option');
        o.value = o.textContent = etat;
        if (etat === rp.etat) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', maj);
      ligne.appendChild(select);
      var sup = el('button', 'ep-btn sup', '×');
      sup.type = 'button';
      sup.title = 'Supprimer ce RP';
      sup.addEventListener('click', function () {
        conteneur.removeChild(ligne);
        lignes.splice(lignes.indexOf(obj), 1);
        maj();
      });
      ligne.appendChild(sup);
      conteneur.appendChild(ligne);
      var obj = { titre: titre, lien: lien, avec: avec, select: select };
      lignes.push(obj);
      return obj;
    }

    lus.forEach(creer);

    function maj() {
      vide.style.display = lignes.length ? 'none' : '';
      var corps = '';
      lignes.forEach(function (l) {
        if (!l.titre.value.trim()) return;
        var titre = l.lien.value.trim()
          ? '[url=' + l.lien.value.trim() + ']' + l.titre.value.trim() + '[/url]'
          : l.titre.value.trim();
        corps += '[tr][td]' + titre + '[/td][td]' + (l.avec.value.trim() ? 'avec ' + l.avec.value.trim() : '') +
                 '[/td][td]' + l.select.value + '[/td][/tr]\n';
      });
      ecrire(e, corps ? '[table class="rp"]\n' + corps + '[/table]' : '');
      rafraichirApercu();
    }
    maj();
  }

  /* ═ 2d. Texte libre : zone + balises cliquables ═ */
  function monterTexte(e) {
    var balises = el('div', 'ep-balises');
    [['Gras', 'b'], ['Italique', 'i'], ['Souligné', 'u'], ['Centrer', 'center'], ['Citation', 'quote']].forEach(function (b) {
      var bouton = el('button', 'ep-balise', b[0]);
      bouton.type = 'button';
      bouton.addEventListener('click', function () { entourer('[' + b[1] + ']', '[/' + b[1] + ']'); });
      balises.appendChild(bouton);
    });
    var lien = el('button', 'ep-balise', 'Lien');
    lien.type = 'button';
    lien.addEventListener('click', function () {
      var url = window.prompt('Adresse du lien :', 'https://');
      if (url) entourer('[url=' + url + ']', '[/url]');
    });
    balises.appendChild(lien);
    var image = el('button', 'ep-balise', 'Image');
    image.type = 'button';
    image.addEventListener('click', function () {
      var url = window.prompt('Adresse de l’image :', 'https://');
      if (url) inserer('[img]' + url + '[/img]');
    });
    balises.appendChild(image);
    e.corps.appendChild(balises);

    var zone = document.createElement('textarea');
    zone.className = 'ep-input';
    zone.value = e.zone.value;
    zone.placeholder = 'Écris ici. Les boutons au-dessus ajoutent la mise en forme.';
    zone.addEventListener('input', function () { ecrire(e, zone.value); rafraichirApercu(); });
    e.corps.appendChild(zone);
    ajouterCode(e);
    ecrire(e, zone.value);
    e.libre = zone;

    function inserer(texte) {
      var d = zone.selectionStart, f = zone.selectionEnd;
      zone.value = zone.value.slice(0, d) + texte + zone.value.slice(f);
      zone.focus();
      zone.selectionStart = zone.selectionEnd = d + texte.length;
      ecrire(e, zone.value);
      rafraichirApercu();
    }
    function entourer(avant, apres) {
      var d = zone.selectionStart, f = zone.selectionEnd;
      var choisi = zone.value.slice(d, f);
      zone.value = zone.value.slice(0, d) + avant + choisi + apres + zone.value.slice(f);
      zone.focus();
      zone.selectionStart = d + avant.length;
      zone.selectionEnd = d + avant.length + choisi.length;
      ecrire(e, zone.value);
      rafraichirApercu();
    }
  }

  /* ═ 3. Aperçu du profil ═ */
  function bbEnHtml(t) {
    return (t || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/\[b\](.*?)\[\/b\]/gis, '<b>$1</b>')
      .replace(/\[i\](.*?)\[\/i\]/gis, '<i>$1</i>')
      .replace(/\[u\](.*?)\[\/u\]/gis, '<u>$1</u>')
      .replace(/\[center\](.*?)\[\/center\]/gis, '<div style="text-align:center">$1</div>')
      .replace(/\[quote\](.*?)\[\/quote\]/gis, '<blockquote>$1</blockquote>')
      .replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gis, '<a href="$1">$2</a>')
      .replace(/\[img\](.*?)\[\/img\]/gis, '<img src="$1" alt="">')
      .replace(/\n/g, '<br>');
  }

  apercu.innerHTML =
    '<h1 class="page-title">' + EP_REGLAGES.ongletApercu + '</h1>' +
    '<div class="ep-apercu-note">Voici comment ton profil s’affichera. Rien n’est enregistré tant que tu ne cliques pas sur « Enregistrer » en bas de page.</div>' +
    '<div class="panel"><div class="ep-apercu">' +
      '<div class="pr-essentiels">' +
        '<div class="pr-carte"><div class="pr-carte-tete"><span>Team <em>Pokémon</em></span></div>' +
        '<div class="pr-carte-corps" id="ep_ap_team"></div></div>' +
        '<div class="pr-carte"><div class="pr-carte-tete"><span>Talents</span></div>' +
        '<div class="pr-carte-corps" id="ep_ap_talents"></div></div>' +
      '</div>' +
      '<div class="pr-carte pr-apropos" id="ep_ap_apropos_carte"><div class="pr-carte-tete"><span>À <em>propos</em></span></div>' +
      '<div class="pr-carte-corps" id="ep_ap_apropos"></div></div>' +
      '<div class="pr-carte pr-rps" id="ep_ap_rps_carte"><div class="pr-carte-tete"><span>RP <em>en cours</em></span></div>' +
      '<div class="pr-carte-corps" id="ep_ap_rps"></div></div>' +
    '</div></div>';

  function rafraichirApercu() {
    var zTeam = document.getElementById('ep_ap_team');
    var zTal = document.getElementById('ep_ap_talents');
    var zApr = document.getElementById('ep_ap_apropos');
    var zRps = document.getElementById('ep_ap_rps');
    if (!zTeam) return;

    editeurs.forEach(function (e) {
      var v = e.zone.value;
      if (e.type === 'team') {
        zTeam.innerHTML = bbEnHtml(v);
      } else if (e.type === 'talents') {
        var re = /\[tr\]\[td\](.*?)\[color=(#[0-9A-Fa-f]{3,6})\](T\d)\[\/color\]\[\/td\]\[\/tr\]/gi, m, html = '';
        while ((m = re.exec(v)) !== null) {
          html += '<tr><td>' + m[1] + '<font color="' + m[2] + '">' + m[3] + '</font></td></tr>';
        }
        zTal.innerHTML = html ? '<table class="nom"><tbody>' + html + '</tbody></table>' : '<span style="opacity:.5">—</span>';
      } else if (e.type === 'rp') {
        var reRp = /\[tr\]\[td\](?:\[url=([^\]]*)\])?(.*?)(?:\[\/url\])?\[\/td\]\[td\](.*?)\[\/td\]\[td\](.*?)\[\/td\]\[\/tr\]/gi, r, out = '';
        while ((r = reRp.exec(v)) !== null) {
          out += '<div class="pr-rp"><a href="' + (r[1] || '#') + '">' + r[2] + '</a>' +
                 (r[3] ? '<span class="avec">' + r[3] + '</span>' : '') +
                 '<span class="etat">' + r[4] + '</span></div>';
        }
        zRps.innerHTML = out || '<span style="opacity:.5">Aucun RP en cours.</span>';
      } else {
        zApr.innerHTML = bbEnHtml(v) || '<span style="opacity:.5">—</span>';
      }
    });
  }
  rafraichirApercu();
})();
