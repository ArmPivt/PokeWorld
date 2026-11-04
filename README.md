# La Tour Infernale

Jeu de fans gratuit en HTML, CSS et JavaScript. Le Site existant est configuré dans `.openai/hosting.json`.

## Jouer en local

Depuis ce dossier : `node preview.cjs`, puis http://127.0.0.1:4173 .

## Règles

- Première visite : choix obligatoire du starter parmi 27 starters, Pikachu et Évoli. Le choix et la progression sont sauvegardés localement.
- Survie : un Pokémon, une forêt de 6144 × 6144 unités, caméra suiveuse et vision limitée. ZQSD, WASD, flèches ou glisser sur mobile. E ou le bouton pour ouvrir un coffre à proximité. Échap pour la pause. Un ticket régional toutes les 20 secondes ; les objets sont sauvegardés dès l’ouverture du coffre.
- Objets : commun 55 %, rare 28 %, épique 14 %, légendaire 3 %. Un objet par Pokémon ; une instance d’objet ne peut être équipée que sur un Pokémon. Équipement au camp. Les bonus s’appliquent à la survie et aux combats de la tour.
- Tour : jusqu’à 6 Pokémon par joueur, un actif et cinq réservistes. Le boss attaque un seul actif. Animations par événement du tour, y compris lors des synchronisations coopératives.
- Multijoueur : PeerJS, jusqu’à quatre joueurs. Le Site conserve son audience privée. Les invités doivent disposer d’un accès au Site et d’un réseau compatible avec WebRTC.

## Vérifications

`node check.cjs` vérifie les règles et les récompenses.
`node browser-check.cjs` lance Edge via Playwright du runtime Codex pour vérifier le parcours utilisateur et produire des captures locales. L’aperçu doit être démarré. Les données de combat y sont contrôlées pour rendre le test déterministe ; le service multijoueur réel n’est pas couvert.

## Fichiers

- `dist/app.js` : progression, gacha, données de combat, types et salons.
- `dist/pixel.js` : interface pixel art, animations PMD, survie, caméra, coffres et équipements.
- `dist/assets` : sprites, animations et police conservés localement. Les autres Pokémon chargent leurs planches PMD à la demande, avec repli si la ressource manque.
- `dist/CREDITS.md` : sources, artistes et licences.

Aucun compte serveur ni synchronisation de sauvegarde entre appareils. Les données Pokémon et les connexions multijoueurs nécessitent Internet.
