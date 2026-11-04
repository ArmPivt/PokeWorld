# PokéWorld

Portail de mini-jeux Pokémon en pixel art. Le projet reste dans ce dossier, et le Site existant est conservé. La sauvegarde locale précédente est migrée sans perte de monnaie ni d’objets.

## Lancer le jeu

Node.js 22 ou plus récent suffit : `node preview.cjs`, puis http://127.0.0.1:4173 . Aucun téléchargement de dépendances n’est nécessaire pour le jeu ou les tests de règles.

- `node pokeworld-check.cjs` : catalogue, entraînement, invocations, tours de dresseurs et résolution des duels.
- `node pokeworld-browser-check.cjs` : parcours et interface dans le navigateur, avec Edge et le Playwright du runtime Codex local.
- `node effects-browser-check.cjs` : les 22 familles d’effets et les dégâts des quatre attaques de survie.
- `node raid-network-check.cjs` : raid coopératif réel, profils et équipes synchronisés.
- `node pvp-network-check.cjs` : deux sessions de navigateur et véritables connexions WebRTC, duel six contre six et file mondiale. Nécessite Internet et l’accès au service PeerJS.

## Mini-jeux

- Tour Infernale : dresseurs IA, équipes de plusieurs Pokémon, changements après K.O., étages croissants. L’IA choisit ses attaques en fonction des types.
- L’Antre : boss géants, solo ou coopération à quatre. Chaque joueur apporte jusqu’à six Pokémon. Une seule cible du boss par attaque.
- Survie : un Pokémon, quatre attaques sélectionnables, exploration, coffres et équipements. Les récompenses donnent de l’XP et des bonbons.
- Pokéclick : Poké Ball à cliquer, installations, boutique, succès, prestige. La production est strictement limitée à ce mini-jeu visible : aucune production dans les autres modes, dans un onglet masqué ou après fermeture. Aucun rattrapage hors ligne. Le minuteur est arrêté à la sortie.
- Combats Pokémon : duels amicaux six contre six, niveau normalisé à 50, natures et entraînement conservés. Création/rejoindre par code ou file mondiale entre vrais joueurs.
- Portails : neuf générations, tirages ×1/×10, tickets universels, révélations et shinys. Taux de rareté : commun 65 %, rare 25 %, épique 8 %, légendaire 2 %. Le tirage shiny indépendant à 1 % choisit uniquement une espèce avec variante PMD vérifiée. Les taux détaillés incluent cette condition.

## Centre Pokémon

La fiche affiche un sprite animé à gauche et cinq onglets à droite : statistiques, capacités, nature/talent, niveau/évolution, IV/capsules. Sur mobile, le portrait est placé au-dessus des onglets défilants.

Chaque compagnon possède un niveau de 5 à 100 et son XP. Un bonbon apporte 100 XP ; les mini-jeux donnent aussi de l’expérience. La monnaie existante est conservée sous le nom **poussière d’étoiles** (clé de sauvegarde historique coins).

- EV : curseur et saisie numérique, 10 poussières par EV ajouté ; réduction gratuite sans remboursement. Maximum 252 par statistique et 510 au total. L’aperçu montre la statistique calculée avant validation.
- Nature : un aromate par changement, 25 natures disponibles.
- Talents : une pilule pour passer entre les talents classiques de l’espèce, un patch pour accéder au talent caché ou en revenir. Aucune consommation si la sélection ne change pas.
- Capacités : quatre emplacements offensifs. Les listes d’apprentissage de la version disponible la plus récente indiquent les niveaux de déblocage. Chaque emplacement modifié consomme une écaille cœur. Une capacité encore verrouillée est refusée aussi par les règles, pas seulement par le menu. Lutte sert de secours lorsque le Pokémon ne connaît pas encore quatre attaques.
- IV : au niveau 100 uniquement, une capsule d’argent maximise un IV à 31 ; une capsule d’or maximise les six. Une statistique déjà maximale ne consomme pas de capsule.
- Évolutions par niveau compatibles avec les sprites ; l’entraînement et l’objet tenu sont conservés.

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
