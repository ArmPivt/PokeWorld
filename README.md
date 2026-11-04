# La Tour Infernale

Jeu de fans gratuit en pixel art. Projet local : ce dossier. Le Site existant est configuré dans `.openai/hosting.json`.

## Aperçu et vérification

- `node preview.cjs` : http://127.0.0.1:4173
- `node check.cjs` : modèle de sauvegarde, probabilités, équipements et combats.
- `node browser-check.cjs` : parcours dans Edge via le Playwright fourni par le runtime Codex, avec captures locales. Le serveur d’aperçu doit tourner.
- `node prepare-dex.cjs` : reconstruire les données locales depuis les CSV officiels de PokéAPI. Cette opération nécessite Internet.

## Architecture

- `dist/js/model.mjs` : règles pures, migration, tirages, dégâts et résolution d’un tour.
- `dist/js/art.mjs` : sprites PMD, variantes shiny, terrain, tour et effets canvas.
- `dist/js/survival.mjs` : boucle à pas fixe 60 Hz, caméra et contrôles, quatre attaques, coffres, pause et améliorations.
- `dist/js/battle.mjs` : tour par tour, six Pokémon par dresseur, un actif, animations des événements du tour.
- `dist/js/summon.mjs` : portails, animation, historique et détail des taux.
- `dist/js/network.mjs` : salons PeerJS et autorité de l’hôte.
- `dist/js/main.mjs` : navigation, inventaire, collection, dialogues, plein écran, audio et sauvegarde.
- `dist/data` : noms français, types, statistiques, quatre attaques par espèce et table d’efficacité. Aucune requête API n’est nécessaire pour démarrer un combat.

## Règles

La première visite impose le choix d’un starter. La progression reste locale au navigateur, exportable depuis les réglages. La sauvegarde précédente est migrée : tous les tickets régionaux sont additionnés, sans perte, dans le solde de tickets universels.

Survie : un Pokémon, quatre attaques sélectionnables via 1–4 ou les boutons. Les attaques se déclenchent automatiquement sur les ennemis proches. ZQSD, WASD, flèches, déplacement au pointeur ou glissement sur mobile. E ouvre un coffre proche. Échap met en pause. Un ticket universel toutes les 20 secondes, crédits lors de l’extraction ou d’un K.O. Les objets sont conservés dès l’ouverture d’un coffre. Carte de 6144 × 6144 unités, caméra adaptative et visibilité limitée.

Tour : six emplacements par joueur, un actif et cinq réservistes. Les joueurs peuvent commencer avec une équipe incomplète. Le boss ne vise qu’un seul actif par attaque. Les animations suivent les événements du tour. Deux tickets universels et 50 fragments par victoire. Les réseaux WebRTC restrictifs peuvent bloquer les salons ; les tests automatisés couvrent le modèle multijoueur mais ne remplacent pas une partie sur plusieurs réseaux réels.

Tous les modes couvrent 100 % de la fenêtre, avec une demande supplémentaire de plein écran natif lors du lancement. Si le navigateur ou l’application refuse le plein écran natif, le mode couvre quand même la totalité de la fenêtre. Les menus latéraux restent masqués pendant une partie.

Invocations : un ticket universel sur n’importe lequel des neuf portails. Commun 65 %, rare 25 %, épique 8 %, légendaire 2 %. Le shiny est un tirage indépendant à 1 %. Les variantes normales et shiny sont des entrées distinctes de la collection. Les espèces d’une rareté sont équiprobables dans leur génération. Les raretés sont propres au jeu : légendaires/fabuleux selon les données PokéAPI, puis paliers de total de statistiques pour les autres. Les taux individuels sont affichés dans chaque portail. Les doublons donnent 30 fragments, ou 80 pour un doublon shiny.

Objets : commun 55 %, rare 28 %, épique 14 %, légendaire 3 %. Un objet par Pokémon ; chaque instance ne peut être équipée qu’une seule fois. Les bonus s’appliquent en survie et dans la tour. L’hôte utilise les équipements déclarés par chaque allié, sans leur appliquer ceux de sa propre sauvegarde.

## Ressources

Voir `dist/CREDITS.md` et les fichiers de licence. La direction artistique de cette version est propre à La Tour Infernale : pierre sombre, braises, cuivre, ruines et runes. Le pack de sprites PMD est conservé. Les animations des Pokémon non intégrés localement chargent à la demande, avec un sprite statique comme repli.

## Invocations multiples

Le portail propose ×1 pour un ticket ou ×10 pour dix tickets universels. Chaque tirage garde les taux affichés, sans garantie supplémentaire. Le lot complet est sauvegardé avant la première animation. Chaque Pokémon arrive sous forme de silhouette noire tournante, puis se révèle sur un fond de la couleur de sa rareté. En ×10, le joueur peut avancer résultat par résultat ou afficher directement le récapitulatif.

`node multi-check.cjs` vérifie le débit unique, les dix résultats, les doublons, les animations, les tickets insuffisants, le rendu mobile et la persistance après rechargement.

## Zone d’AFK

Accessible depuis le menu, le clicker Pokémon s’ouvre en plein écran. Cliquer la grande Poké Ball génère de l’énergie. Huit installations à coût croissant (+15 % par unité) produisent automatiquement, y compris pendant les autres modes. Achat par lots de 1, 10 ou 100, améliorations de clic et de production, onze succès (+1 % de production chacun), Poké Ball dorée et renaissance (+5 % par étoile).

Le retour hors ligne crédite au maximum huit heures de production selon le dernier état sauvegardé. Aucun serveur ni processus ne tourne réellement quand le jeu est fermé : le gain est calculé au retour, une seule fois. Sauvegarde toutes les cinq secondes, après les achats et à la sortie. Les clics sont sauvegardés au plus tard après une seconde.

Le comptoir échange l’énergie contre un ticket universel (5 000 au départ, +5 % à chaque échange) ou 100 fragments pour 1 000 énergies. La renaissance ne remet à zéro que l’énergie, les installations et les améliorations AFK ; la collection, la tour, les tickets, les fragments, les objets et les succès sont conservés.

Modules : `dist/js/afk-model.mjs` pour les règles pures et `dist/js/afk.mjs` pour l’interface et les animations. `node afk-check.cjs` vérifie l’économie et `node afk-browser-check.cjs` teste le parcours dans le navigateur, dont les gains hors ligne, la renaissance et l’absence de chevauchements sur mobile.
