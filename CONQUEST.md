# Conquête

Mini-jeu de stratégie territoriale en temps réel ajouté à PokéWorld. Il adapte les principales mécaniques d’[OpenFront](https://openfront.io/) à l’univers Pokémon avec ses propres règles, son moteur et ses dessins. Aucun code OpenFront n’est embarqué.

## Régions et factions

Neuf cartes stratégiques originales redessinées : Kanto, Johto, Hoenn, Sinnoh, Unys, Kalos, Alola, Galar et Paldea. Les côtes, îles, reliefs et 116 lieux français servent de repères. Elles sont volontairement schématiques et ne reproduisent pas exactement les cartes officielles. Données et sources : `dist/assets/conquest/`.

| Faction | Légendaire d’assaut |
| --- | --- |
| Team Rocket | Mewtwo |
| Team Aqua | Kyogre |
| Team Magma | Groudon |
| Team Galaxie | Giratina |
| Team Plasma | Kyurem |
| Team Flare | Yveltal |
| Fondation Æther | Necrozma |
| Macro Cosmos | Éthernatos |
| Team Skull | Lunala |
| Team Yell | Zacian |
| Team Star | Koraidon |

Les trois dernières associations sont des réinterprétations pour ce mini-jeu. Les onze légendaires et tous les Pokémon affichés possèdent les sprites PMD compatibles avec le catalogue du jeu. Les factions prêtent leurs unités pour la campagne ; elles ne sont pas ajoutées à la collection permanente.

## Correspondance des mécaniques

| Principe stratégique | Conquête |
| --- | --- |
| Départ et frontières | QG librement placé sur terre, repaire initial offert, neutralité des territoires restants. Départ automatique après 20 s si nécessaire. |
| Force disponible | Poké Balls prêtes : réserve mobilisable pour les escouades Pokémon. Recrutement continu, ralentissement près du plafond. |
| Monnaie | Pokédollars de campagne, séparés des tickets et des poussières permanentes. Revenus passifs et commerciaux. |
| Engagement des troupes | Curseur de 5 à 100 %, jusqu’à trois fronts, coût variable selon terrain et défense. Rappel : 85 % de la réserve restante. |
| Villes | Repaires : capacité +650 par niveau et recrutement accru. |
| Usines et chemins de fer | Usines de Poké Balls : production de base +18/s par niveau. Réseau de rails automatique et convois Magnéti entre bâtiments reliés par des terres contrôlées ou alliées. Les convois arrivés rapportent des Pokédollars. |
| Ports et commerce | Bases maritimes : cargos Bekipan entre ports étrangers reliés par la même mer. Les deux camps gagnent des Pokédollars à l’arrivée, sauf embargo. |
| Transports | Lokhlass : réserve engagée, trajet réel sur l’eau et débarquement côtier. La réserve restante poursuit l’expansion depuis la tête de pont. |
| Flottes de guerre | Léviator : patrouille et repositionnement, interception de cargos/transports, combats navals, gains de niveaux jusqu’à 3, récupération près d’un port. |
| Fortifications | Bastions Ronflex : défense renforcée dans la zone voisine, portée et puissance accrues par niveau. |
| Silo et rechargement | Sanctuaire : préparation et recharge du légendaire associé à la faction. |
| Frappe ciblée | Attaque signature : sanctuaire niveau 1, 850 ₽, rayon 4 cases. |
| Frappe lourde | Déchaînement : sanctuaire niveau 2, 2 300 ₽, rayon 8 cases et trois charges de résistance aux interceptions. |
| Frappe multiple | Assaut multiple : sanctuaire niveau 3, 4 500 ₽, cinq assauts sur des positions distinctes de la team ciblée lorsque son territoire le permet. |
| Défense anti-frappes | Stations Gardevoir : interception automatique en portée, recharge, portée/puissance améliorées avec le niveau. |
| Dégâts de zone | Bâtiments détruits, cases neutralisées, unités navales exposées détruites, perturbation de 28 s qui gêne construction et conquête. L’attaque signature est visible : vague de Kyogre, séisme de Groudon, rayon, etc. |
| Améliorations | Six types de bâtiments, trois niveaux, coûts croissants et construction différée. Les structures conquises changent de camp. |
| Diplomatie | Propositions de pactes de 3 minutes, deux pactes simultanés, dons de 20 % des réserves ou Pokédollars, embargos, rupture avec défense affaiblie 45 s. |
| Communication | Signaux de position visibles sur la carte et journal des événements. |
| Victoire | 80 % des terres, seul ou avec les alliés directs. À la limite de temps, la team qui possède le plus de terres gagne. |

## Solo, amis et progression

Solo contre IA ou salon privé par code : jusqu’à quatre humains, neuf teams au total, chacune unique. L’hôte sélectionne carte, difficulté et limite de 10, 20 ou 30 minutes. Les humains posent leur QG puis les IA s’installent. Les IA conquièrent, construisent, améliorent, débarquent et utilisent leurs légendaires.

L’hôte simule la campagne ; les invités envoient des ordres validés et reçoivent une carte compressée cinq fois par seconde via PeerJS/WebRTC. Une team invitée passe à l’IA si son joueur se déconnecte. La session se ferme si l’hôte quitte. Le Site reste privé ; chaque participant doit y avoir accès. Les limites habituelles des connexions directes et de l’économie locale s’appliquent : ce mode amical ne possède pas de classement sécurisé ni de serveur mondial persistant.

Une campagne solo se sauvegarde toutes les six secondes, à la sortie et à la fermeture de l’onglet. Elle se reprend sur ce navigateur. Les campagnes en salon ne se reprennent pas après fermeture de l’hôte. Le mode se met en pause lorsque l’hôte masque l’onglet ; il n’y a aucun rattrapage hors ligne. La pause de l’hôte est propagée aux invités.

Après une campagne d’au moins 45 secondes : victoire = 5 tickets, 3 bonbons, 300 poussières et 150 XP par membre de l’équipe permanente ; défaite = 1 ticket, 1 bonbon, 75 poussières et 50 XP. L’identifiant de campagne empêche de réclamer deux fois les récompenses. Une sortie volontaire sauvegarde le solo, sans attribuer de récompense de fin.

## Commandes simplifiées

La préparation tient sur un écran : région, team et difficulté. Les options supplémentaires et les salons sont repliés.

- Clic gauche sur une terre neutre ou ennemie : attaque directe lorsque la frontière le permet. Sinon, un transport Lokhlass est choisi automatiquement si une côte et une base maritime sont reliées.
- Clic sur une de ses cases : roue de construction à cet endroit, puis un clic sur le bâtiment. Clic sur un bâtiment existant : amélioration.
- Clic droit ou pression longue tactile de 750 ms : menu contextuel. Les coûts, raisons de blocage et actions utiles sont affichés sur les boutons.
- Sur une cible adverse, le menu Légendaire propose les trois puissances et lance l’assaut immédiatement sur cette position. Le menu Diplomatie permet pactes, dons et embargos.
- Le curseur de réserve reste visible en bas à gauche. Les fronts actifs ont un bouton de rappel direct. Des clics répétés renforcent un même front.
- Glisser pour déplacer, molette ou pincement pour zoomer ; le deuxième doigt annule toute pression longue ou action résiduelle. Les bâtiments ont une zone de sélection tolérante et le QG est agrandi automatiquement sur mobile.
- Échap ferme le menu ou la visée avant de mettre en pause ; Ctrl+clic ouvre les constructions ; B choisit une case à bâtir ; N choisit une cible légendaire ; R rappelle les fronts.

La carte occupe tout l’écran. Classement, journal et options s’ouvrent à la demande. Un seul clic ne change pas durablement de mode : après une construction, le clic suivant reprend l’action normale.

Les boutons sont conservés pendant les mises à jour ; seuls leurs textes, états et coûts changent. Les clics secondaires ne sont jamais interprétés comme un clic d’attaque. Chaque ordre reçoit un retour visuel immédiat ; en multijoueur, l’hôte confirme son acceptation ou son refus. Les fronts avancent à 20 Hz avec une progression proportionnelle au temps afin de conserver le rythme initial. Les sprites sont interpolés entre les états reçus et le fond de carte réutilise ses pixels mis en cache.

## Modules et vérification

`conquest-controls.mjs` contient l’interface contextuelle, les gestes et les retours de clic. `conquest-data.mjs` contient les factions et règles affichées. `conquest-model.mjs` gère le terrain et la simulation sans DOM. `conquest-render.mjs` dessine la carte et les unités ; `conquest-network.mjs` gère les salons ; `conquest.mjs` intègre les commandes, sauvegardes, récompenses et écrans.

- `node conquest-check.cjs` : neuf cartes, factions, économie, frontières, constructions, diplomatie, trajets maritimes, débarquements, légendaires, interceptions, IA et sauvegardes.
- `node conquest-logistics-check.cjs` : revenus effectifs des convois et cargos, rails persistants, embargo, niveaux de sanctuaire, frappe multiple et victoire au temps.
- `node conquest-controls-check.cjs` : invariance de vitesse à 20 Hz, renforcement de fronts et reprise des fronts actifs.
- `node conquest-browser-check.cjs` : commandes réelles dans Edge, clic droit isolé, clics maintenus pendant les ticks, constructions/améliorations, attaque et transport automatiques, visée légendaire, sauvegarde/reprise et gestes tactiles réels.
- `node conquest-network-check.cjs` : deux contextes de navigateur indépendants reliés réellement en WebRTC, commandes d’invité, territoires synchronisés, pause de l’hôte et reprise IA.

Références primaires consultées : [dépôt officiel OpenFront](https://github.com/openfrontio/OpenFrontIO), [terminologie/aide française](https://github.com/openfrontio/OpenFrontIO/blob/main/resources/lang/fr.json), [moteur](https://github.com/openfrontio/OpenFrontIO/tree/main/packages/engine/src/execution). Les valeurs et variantes exactes d’OpenFront évoluent ; Conquête applique les règles décrites ci-dessus.
