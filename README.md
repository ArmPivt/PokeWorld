# PokéWorld

Portail de mini-jeux Pokémon en pixel art. Le projet reste dans ce dossier, et le Site existant est conservé. La sauvegarde locale précédente est migrée sans perte de monnaie ni d’objets.

## Lancer le jeu

Node.js 22 ou plus récent suffit : `node preview.cjs`, puis http://127.0.0.1:4173 . Aucun téléchargement de dépendances n’est nécessaire pour le jeu ou les tests de règles.

- `node pokeworld-check.cjs` : catalogue, entraînement, invocations, tours de dresseurs et résolution des duels.
- `node pokeworld-browser-check.cjs` : parcours et interface dans le navigateur, avec Edge et le Playwright du runtime Codex local.
- `node effects-browser-check.cjs` : les 22 familles d’effets et les dégâts des quatre attaques de survie.
- `node raid-network-check.cjs` : raid coopératif réel, profils et équipes synchronisés.
- `node pvp-network-check.cjs` : deux sessions de navigateur et véritables connexions WebRTC, duel six contre six et file mondiale. Nécessite Internet et l’accès au service PeerJS.

## Conquête

Interface simplifiée : clic gauche pour attaquer ou débarquer, clic droit/appui long pour les actions, roue de construction locale et carte plein écran. Les boutons restent stables pendant les ticks ; confirmations d’ordres immédiates et fronts à 20 Hz.

Nouveau mode de stratégie territoriale : neuf régions redessinées, onze factions et leurs légendaires, constructions, production de Poké Balls, convois, flottes, diplomatie et assauts. Solo ou salon jusqu’à quatre amis, neuf teams au total. Les ressources de guerre sont séparées de la collection ; les campagnes terminées accordent des récompenses. Voir [les règles et la correspondance complète des mécaniques](CONQUEST.md).

Tests : `node conquest-controls-check.cjs`, `node conquest-check.cjs`, `node conquest-logistics-check.cjs`, `node conquest-browser-check.cjs`, `node conquest-network-check.cjs`.

## Mini-jeux

- Conquête : place ton QG, développe ta team et contrôle 80 % de la région. Cartes de Kanto à Paldea, économie, commerce, navigation, diplomatie et légendaires.
- Tour Infernale : dresseurs IA, équipes de plusieurs Pokémon, changements après K.O., étages croissants. L’IA choisit ses attaques en fonction des types.
- L’Antre : boss géants, solo ou coopération à quatre. Chaque joueur apporte jusqu’à six Pokémon. Une seule cible du boss par attaque.
- Survie : un Pokémon, quatre attaques sélectionnables, exploration, coffres et équipements. Les récompenses donnent de l’XP et des bonbons.
- Pokéclick : Poké Ball à cliquer, installations, boutique, succès, prestige. La production est strictement limitée à ce mini-jeu visible : aucune production dans les autres modes, dans un onglet masqué ou après fermeture. Aucun rattrapage hors ligne. Le minuteur est arrêté à la sortie.
- Combats Pokémon : duels amicaux six contre six, niveau normalisé à 50, natures et entraînement conservés. Création/rejoindre par code ou file mondiale entre vrais joueurs.
- Portails : neuf générations, tirages ×1/×10, tickets universels, révélations et shinys. Taux de rareté : commun 65 %, rare 25 %, épique 8 %, légendaire 2 %. Le tirage shiny indépendant à 1 % choisit uniquement une espèce avec variante PMD vérifiée. Les taux détaillés incluent cette condition.

## Centre Pokémon

La fiche affiche un sprite animé à gauche et six onglets à droite : statistiques, capacités, nature/talent, niveau/évolution, IV/capsules. Sur mobile, le portrait est placé au-dessus des onglets défilants.

Chaque compagnon possède un niveau de 5 à 100 et son XP. Un bonbon apporte 100 XP ; les mini-jeux donnent aussi de l’expérience. La monnaie existante est conservée sous le nom **poussière d’étoiles** (clé de sauvegarde historique coins).

- EV : curseur et saisie numérique, 10 poussières par EV ajouté ; réduction gratuite sans remboursement. Maximum 252 par statistique et 510 au total. L’aperçu montre la statistique calculée avant validation.
- Nature : un aromate par changement, 25 natures disponibles.
- Talents : une pilule pour passer entre les talents classiques de l’espèce, un patch pour accéder au talent caché ou en revenir. Aucune consommation si la sélection ne change pas.
- Capacités : quatre emplacements offensifs. Les listes d’apprentissage de la version disponible la plus récente indiquent les niveaux de déblocage. Chaque emplacement modifié consomme une écaille cœur. Une capacité encore verrouillée est refusée aussi par les règles, pas seulement par le menu. Lutte sert de secours lorsque le Pokémon ne connaît pas encore quatre attaques.
- IV : au niveau 100 uniquement, une capsule d’argent maximise un IV à 31 ; une capsule d’or maximise les six. Une statistique déjà maximale ne consomme pas de capsule.
- Évolutions par niveau compatibles avec les sprites ; l’entraînement et les trois objets équipés sont conservés.

Les effets communs de talents (Brasier, Torrent, Engrais, Essaim, Lévitation, absorptions, Adaptabilité, Technicien, Coloforce, Puissance Pure, Isograisse) sont gérés par le moteur ; toutes les mécaniques des jeux officiels ne sont pas reproduites.

## Survie, profils et animations

La survie utilise des fenêtres sombres, y compris pour les montées de niveau et le butin. Le Pokémon du joueur est agrandi de 62 à 94 pixels logiques. Il y a 32 coffres au lieu de 90, davantage espacés. Chaque coffre donne 25 à 100 poussières puis, avec 65 % de probabilité, un objet de progression ; sinon un équipement avec ses taux habituels. Parmi les objets de progression : écaille cœur ×2 (40 %), aromate (30 %), pilule (17 %), patch (7 %), capsule d’argent (5 %), capsule d’or (1 %). Le butin est enregistré à l’ouverture et conservé après un K.O.

L’onglet Profil propose un nom de 20 caractères et 14 sprites de dresseurs locaux. Le nom et l’avatar sont transmis en duel et en coopération. Les combats de dresseurs commencent par « veut se battre ! », puis les Poké Balls sont lancées et les partenaires apparaissent. Les remplacements utilisent aussi cette animation. L’Antre conserve ses boss géants ; les adversaires des dresseurs ont une taille classique.

attack-fx.mjs dessine des effets Canvas selon l’identifiant/la famille de chaque capacité du catalogue : sphères, rayons, vagues, flammes, éclairs, glace, feuilles, lianes, griffes, poings, crocs, séismes, rochers, météores, tourbillons, essaims, anneaux, explosions et étincelles. Éco-Sphère projette une sphère verte, Ultralaser un large rayon blanc et Surf un front d’eau avec écume. Les rayons et les vagues de survie ont des collisions adaptées à leur forme. Plusieurs capacités partagent une famille d’effet ; le moteur complet Showdown n’est pas embarqué. Les préférences d’animations réduites sont respectées.

## Catalogue homogène

`dist/data/supported.json` contient les espèces pour lesquelles Idle, Walk et Attack sont vérifiées dans PMD SpriteCollab, avec les icônes locales correspondantes et un indicateur de variante shiny. Craparoi et les autres espèces sans animations compatibles sont exclus du catalogue jouable. Les anciens compagnons incompatibles sont conservés dans `archivedRoster` de la sauvegarde plutôt que détruits. Les sprites statiques frontaux PokéAPI ne sont plus utilisés comme repli visuel.

`prepare-supported.cjs`, `prepare-shiny.cjs`, `prepare-training.cjs` puis `prepare-progression.cjs` (niveaux d’apprentissage et talents cachés) permettent de reconstruire les données et les icônes depuis leurs sources publiques. Voir les crédits et licences dans `dist/CREDITS.md`.

## Réseau et accès

Le Site reste privé, comme demandé. La file mondiale fonctionne pour les joueurs autorisés qui ont accès au jeu. La signalisation et les connexions directes dépendent de PeerJS/WebRTC ; certains réseaux restrictifs peuvent bloquer les connexions. Le premier client en attente héberge le coordinateur temporaire de la file ; les clients tentent une nouvelle élection si le coordinateur disparaît. Les duels sont amicaux, sans classement ni économie serveur sécurisée ; l’un des joueurs est l’hôte autoritaire.

Les sauvegardes restent sur le navigateur et peuvent être exportées depuis les réglages. Il n’y a pas de compte joueur ni de sauvegarde synchronisée entre appareils.

## Modules

`main.mjs` orchestre l’application. `world-ui.mjs` contient le hub ; `pokemon-lab.mjs` le Centre Pokémon, `resources.mjs` les objets, `player-profile.mjs` les profils et `battle-presentation.mjs` les entrées en combat. `training.mjs` gère la progression, `duel.mjs` les duels et la file, `duel-model.mjs` la résolution joueur contre joueur, `battle.mjs` la tour et l’Antre. Les modules de survie, invocations et Pokéclick conservent leur économie et partagent la collection.

Conquête : vagues organiques sur toute la frontière, emblèmes propres aux onze teams sur leurs territoires et atouts automatiques distincts (commerce, conquête, défense, industrie ou soutien). L’emblème du HUD ouvre la fiche d’atout. Voir les valeurs et tests dans [CONQUEST.md](CONQUEST.md).

## Combats stratégiques et Arène 2D

Le choix Classique / Arène 2D est disponible dans Combats de dresseurs. Le moteur partagé des duels, de la Tour et de l’Antre inclut statuts, paliers, priorités, soins, météo, pièges et une IA tactique inspirée des principes étudiés dans Hope/PSDK. L’arène est jouable contre l’IA, par code ou via sa propre file mondiale, avec quatre terrains en pixel art, déplacements, visée, esquives, caisses destructibles, recul, rayons opposés et impacts persistants au sol. Le format Escouade permet trois actifs par équipe et la vue Cinéma masque l’interface. Après un K.O. classique, le joueur choisit son remplaçant sans tour supplémentaire ; les PV baissent à l’impact visuel. Chaque Pokémon peut équiper trois objets différents dans son onglet Objets. Les effets de soutien sont aussi adaptés à la survie. Voir [COMBAT.md](COMBAT.md) pour les règles, commandes, limites et tests.

La version 0.10 lisse Pokémon, projectiles et caméra entre les pas de simulation, y compris chez les invités réseau. Les animations d’attaque utilisent des atlas pixel art locaux réutilisés, des traînées et des impacts synchronisés ; les poses PMD gardent la même échelle et la même ancre. La survie affiche désormais ses véritables projectiles de collision et ses rayons progressifs. Tests ciblés : `npm run test:animation`, `npm run test:animation-browser`, `npm run test:animation-network`.

Version 0.11 : arènes classiques avec gradins, tribunes, maçonnerie, bannières, entrées de dresseurs et terrain marqué ; onze musiques chiptune originales avec fondu entre les modes, volume indépendant et raccourci M. Les 87 Pokémon de rareté légendaire disposant de sprites validés ont un scénario de première rencontre (94 scénarios définis, dont sept désactivés avec leurs espèces) ; Rayquaza possède une scène en quatre plans avec le Pilier Céleste, Groudon et Kyogre. Les doublons ne relancent pas la scène ; les interruptions restent récupérables et les rencontres peuvent être revues depuis la fiche du Pokémon. Voir CINEMATICS.md.

## Version 0.12 — Collection et progression

Les pages Collection, Survie et Équipe partagent les filtres génération, rareté, obtention, variante chromatique, type, recherche et tri (numéro, nom, niveau, somme des IV). Pagination de 36 cartes, critères conservés par page ; les espèces non obtenues restent non sélectionnables.

Les six IV d’une invocation sont indépendants et uniformes entre 0 et 31. Chaque doublon conserve le maximum statistique par statistique de sa variante ; les valeurs entraînées par capsules sont aussi conservées. Les doublons normaux donnent 25 / 75 / 200 / 600 poussières selon leur rareté. Chaque chromatique est conservé dans un compteur d’exemplaires par variante et n’est jamais converti ; ces exemplaires partagent leur profil entraîné. La première obtention d’une variante porte la mention Nouveau.

Un cadeau de migration de 1 000 tickets est ajouté une fois aux sauvegardes existantes de version 8 ou antérieure ayant un starter, puis mémorisé dans claimedGifts. Les nouvelles sauvegardes de version 9 gardent leur économie initiale. La sauvegarde existante n’est pas remplacée.

Boutique : dix lots déterministes par jour (quatre CT, trois objets d’évolution, deux matériaux, un équipement), renouvelés à minuit Europe/Paris. Chaque lot est achetable une fois pour des poussières. Les achats sont persistants et protégés contre une double consommation simultanée entre onglets par Web Locks. Cette économie reste locale au navigateur, sans validation serveur ni protection contre l’édition de sauvegarde ou de l’horloge. CT à usage unique au premier apprentissage compatible (union des compatibilités officielles disponibles) ; rééquiper une capacité connue utilise une écaille cœur.

Évolutions : 440 règles entre 418 espèces de départ disposant de sprites compatibles. Les évolutions par niveau sont proposées automatiquement après un gain de niveau, hors combat, avec animation annulable. Les embranchements demandent un choix. Les fiches permettent aussi de faire évoluer un ancien compagnon déjà au niveau requis. Objets, jour/nuit de Paris, capacités connues, présence d’un partenaire et relation attaque/défense sont vérifiés. Échanges remplacés par Câble Liaison ; amitié par Grelot Zen ; conditions inhabituelles par Pierre d’évolution avec niveau requis affiché. Les formes régionales non présentes dans le catalogue ne sont pas ajoutées. L’XP, les IV, EV, nature, capacités connues, statut de talent caché et équipements sont conservés ; un résultat déjà possédé fusionne ses meilleurs IV sans dupliquer les objets.

Les trois emplacements d’objets ouvrent une grille avec icône, effets et quantités, permettant un remplacement direct sans perdre l’ancien objet. Les quatre capacités ouvrent une liste avec type, catégorie, effets, puissance, précision, PP, niveau requis, coût et recharge réelle en Arène 2D. Terrain agrandi à 1 440 × 900, six obstacles et caméra dézoomée ; les contrôles et collisions utilisent les nouvelles dimensions.

Reconstruction : node prepare-progression-v15.cjs (révision PokéAPI épinglée dans le cache). Tests : npm run test:progression et npm run test:progression-browser.

## Version 0.13 — Apparitions et premières formes

Les portails n’invoquent que les 510 premières formes disponibles et les espèces sans pré-évolution. La génération correspond à celle de la première forme : Pichu appartient ainsi à Johto et Pikachu ne tombe plus dans Kanto. Les Pokémon déjà possédés restent inchangés. La rareté de base est conservée, avec potentiel épique dès la première forme pour les lignées non légendaires dont le total maximal des statistiques de base atteint 600 (ex. Draby, Terhal, Griknot) ; les lignées légendaires restent légendaires. Les quatre taux 65/25/8/2 restent valides dans chaque génération et les taux individuels utilisent exactement le catalogue des tirages. prepare-summon.cjs reconstruit ce catalogue à partir de progression.json, dont la révision PokéAPI est épinglée.

Chaque légendaire a un film de six plans dirigés séparément (94 définis, 87 espèces avec sprites jouables), avec objet narratif, entrée, action sur le décor, pouvoir et caméra. Rayquaza possède une séquence de 21,5 secondes inspirée de la référence Émeraude : confrontation, tour, nuages, descente, rugissement et apaisement. Les films restent récupérables après interruption et rejouables depuis la fiche ; ils se jouent aussi lors d’une première évolution vers un légendaire. Voir CINEMATICS.md.

En Arène 2D, cliquer une capacité ou presser 1–4 lance automatiquement l’attaque vers l’ennemi vivant le plus proche. L’hôte choisit la cible au moment de traiter la commande, pour les deux joueurs. Le projectile garde sa trajectoire et sa portée : il est esquivable et les obstacles continuent de le bloquer. La souris n’est plus nécessaire pour viser.

Tests ciblés : npm run test:legendary-films, npm run test:legendary-films-browser, npm run test:cinema-browser, npm run test:animation-network.
