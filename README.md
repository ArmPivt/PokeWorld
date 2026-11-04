# PokéWorld

Portail de mini-jeux Pokémon en pixel art. Le projet reste dans ce dossier, et le Site existant est conservé. La sauvegarde locale précédente est migrée sans perte de monnaie ni d’objets.

## Lancer le jeu

Node.js 22 ou plus récent suffit : `node preview.cjs`, puis http://127.0.0.1:4173 . Aucun téléchargement de dépendances n’est nécessaire pour le jeu ou les tests de règles.

- `node pokeworld-check.cjs` : catalogue, entraînement, invocations, tours de dresseurs et résolution des duels.
- `node pokeworld-browser-check.cjs` : parcours et interface dans le navigateur, avec Edge et le Playwright du runtime Codex local.
- `node pvp-network-check.cjs` : deux sessions de navigateur et véritables connexions WebRTC, duel six contre six et file mondiale. Nécessite Internet et l’accès au service PeerJS.

## Mini-jeux

- Tour Infernale : dresseurs IA, équipes de plusieurs Pokémon, changements après K.O., étages croissants. L’IA choisit ses attaques en fonction des types.
- L’Antre : boss géants, solo ou coopération à quatre. Chaque joueur apporte jusqu’à six Pokémon. Une seule cible du boss par attaque.
- Survie : un Pokémon, quatre attaques sélectionnables, exploration, coffres et équipements. Les récompenses donnent de l’XP et des bonbons.
- Pokéclick : Poké Ball à cliquer, installations, boutique, succès, prestige. La production est strictement limitée à ce mini-jeu visible : aucune production dans les autres modes, dans un onglet masqué ou après fermeture. Aucun rattrapage hors ligne. Le minuteur est arrêté à la sortie.
- Combats Pokémon : duels amicaux six contre six, niveau normalisé à 50, natures et entraînement conservés. Création/rejoindre par code ou file mondiale entre vrais joueurs.
- Portails : neuf générations, tirages ×1/×10, tickets universels, révélations et shinys. Taux de rareté : commun 65 %, rare 25 %, épique 8 %, légendaire 2 %. Le tirage shiny indépendant à 1 % choisit uniquement une espèce avec variante PMD vérifiée. Les taux détaillés incluent cette condition.

## Centre Pokémon

Chaque compagnon possède un niveau de 5 à 100 et son XP. Un bonbon apporte 100 XP. Les mini-jeux donnent aussi de l’expérience. Entraînement EV (+10 pour 100 fragments, 252 par stat et 510 au total), IV (+1 pour 300 fragments, maximum 31), natures, talents disponibles, quatre attaques offensives personnalisables et évolutions par niveau dont le sprite est disponible. Une évolution conserve la progression et l’objet tenu. Les effets communs de talents (Brasier, Torrent, Engrais, Essaim, Lévitation, absorptions, Adaptabilité, Technicien, Coloforce, Puissance Pure, Isograisse) sont gérés par le moteur ; toutes les mécaniques des jeux officiels ne sont pas reproduites.

## Catalogue homogène

`dist/data/supported.json` contient les espèces pour lesquelles Idle, Walk et Attack sont vérifiées dans PMD SpriteCollab, avec les icônes locales correspondantes et un indicateur de variante shiny. Craparoi et les autres espèces sans animations compatibles sont exclus du catalogue jouable. Les anciens compagnons incompatibles sont conservés dans `archivedRoster` de la sauvegarde plutôt que détruits. Les sprites statiques frontaux PokéAPI ne sont plus utilisés comme repli visuel.

`prepare-supported.cjs`, `prepare-shiny.cjs`, `prepare-training.cjs` et `prepare-learnsets.cjs` permettent de reconstruire les données et les icônes depuis leurs sources publiques. Voir les crédits et licences dans `dist/CREDITS.md`.

## Réseau et accès

Le Site reste privé, comme demandé. La file mondiale fonctionne pour les joueurs autorisés qui ont accès au jeu. La signalisation et les connexions directes dépendent de PeerJS/WebRTC ; certains réseaux restrictifs peuvent bloquer les connexions. Le premier client en attente héberge le coordinateur temporaire de la file ; les clients tentent une nouvelle élection si le coordinateur disparaît. Les duels sont amicaux, sans classement ni économie serveur sécurisée ; l’un des joueurs est l’hôte autoritaire.

Les sauvegardes restent sur le navigateur et peuvent être exportées depuis les réglages. Il n’y a pas de compte joueur ni de sauvegarde synchronisée entre appareils.

## Modules

`main.mjs` orchestre l’application. `world-ui.mjs` contient le hub et le Centre Pokémon. `training.mjs` gère la progression, `duel.mjs` les duels et la file, `duel-model.mjs` la résolution joueur contre joueur, `battle.mjs` la tour et l’Antre. Les modules de survie, invocations et Pokéclick conservent leur économie et partagent la collection.
