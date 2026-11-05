# Combats PokéWorld

Deux modes dans **Combats de dresseurs** : Classique et Arène 2D. La Tour et l’Antre utilisent le moteur classique ; la survie adapte les effets à son action continue. La collection, les IV/EV, les natures et les talents restent communs. Aucun changement d’accès au site.

## Règles classiques

Le moteur partagé `combat-core.mjs` résout les duels, les équipes IA de la Tour et les raids. Les données de capacités viennent des CSV officiels PokéAPI. Les capacités apprenables comprennent désormais les offensives et les soutiens implémentés, avec leur niveau d’apprentissage. Les choix enregistrés restent soumis à ces niveaux et aux écailles cœur.

| Famille | Comportement |
| --- | --- |
| Dégâts | Catégorie physique/spéciale, STAB, double type, immunités, précision/esquive, critiques et talents pris en charge. |
| Statistiques | Paliers de −6 à +6 ; remise à zéro à l’entrée d’un autre Pokémon. |
| Statuts | Brûlure, poison, poison croissant, paralysie, sommeil, gel et confusion ; immunités de type/talent correspondantes. |
| Ordre | Priorité, puis Vitesse modifiée ; Distorsion inverse la Vitesse. |
| Soutien | Soins, drain, recul, Abri, Clonage, Provocation, Vampigraine, Vœu, guérison des statuts et protections d’équipe. |
| Terrain | Piège de Roc, couches de Picots/Pics Toxik, Toile Gluante, Protection et Mur Lumière. |
| Météo | Pluie/soleil modifient Feu/Eau ; sable/neige ont une variante simplifiée de dégâts résiduels. Durée limitée. |
| Attaques particulières | Coups multiples, charge et recharge, pivots, expulsion, dégâts fixes, Riposte/Voile Miroir, Effort, Cognobidon et Malédiction. |
| Continuité | Remplacement automatique après KO, y compris plusieurs KO successifs sur pièges ; Lutte quand les PP sont épuisés. |

Le boss de l’Antre choisit une seule cible par action, y compris lorsque l’attaque possède une zone dans les jeux officiels. Les soins collectifs pris en charge soignent les partenaires actifs ; Vampigraine rend les PV au dresseur qui l’a posée. Les PP, effets, statuts et événements sont résolus par l’hôte puis transmis aux autres joueurs.

Le bouton **État du combat** montre les paliers, le statut, le talent et les effets des quatre capacités. Les badges PV montrent les statuts majeurs ; les conditions de terrain sont visibles près des commandes. Les effets de soin/boost/affliction ont leurs propres messages et animations.

Il s’agit d’un moteur compact propre à PokéWorld, pas d’un simulateur complet d’une génération officielle : il n’inclut notamment pas toutes les interactions exceptionnelles de talents, les Méga-Évolutions, Dynamax, Téracristal ou les attaques de transformation/copie. Les effets génériques sont partagés ; certaines capacités à puissance variable utilisent une estimation adaptée. Les cas non implémentés ne sont pas proposés dans les nouveaux apprentissages. Les objets équipés existants conservent les bonus décrits par PokéWorld.

## IA et référence Hope

Le projet local Pokémon Hope charge l’IA de PokémonSDK. Les fichiers `5_Battle_30_AI.rb` et `5_Battle_30_AI_1_MoveHeuristic.rb` ont été consultés en lecture seule. Aucun script de Hope/PSDK n’est embarqué ni modifié.

L’IA JavaScript de PokéWorld reprend des principes : comparer les actions légales, éviter les immunités et les statuts redondants, tenir compte de la catégorie et du STAB, choisir un remplacement utile et mémoriser les capacités observées. Elle ajoute ses propres évaluations des KO/priorités, soins, boosts, météo et pièges. Les changements rapprochés sont limités. Elle ne connaît pas l’action que le joueur vient de sélectionner. Les équipes IA reçoivent une couverture offensive et une capacité de soutien réellement apprenable à leur niveau.

## Arène 2D

Implémentation originale inspirée des [aperçus de Big Kid Nation](https://www.bigkidnation.com/) et de la [vidéo indiquée par le joueur](https://www.youtube.com/shorts/4nVHNVIhuUo). Ce mode est propre à PokéWorld.

- Solo contre IA ou duel réel par code ; file mondiale séparée de la file classique. Jusqu’à six Pokémon par équipe, niveau 50 en duel.
- Flèches, ZQSD ou WASD pour bouger ; souris pour viser ; 1–4 pour les capacités ; Espace pour esquiver ; R ou les portraits pour changer de Pokémon.
- Mobile : joystick, quatre boutons, portraits et esquive. La visée suit automatiquement l’adversaire lorsque la souris n’est pas utilisée.
- Deux charges d’esquive, récupération progressive ; PP consommés même si l’attaque manque et récupération indépendante des quatre capacités.
- Projectiles, corps-à-corps, rayons, vagues larges et zones annoncées au sol. La position détermine la touche ; les piliers bloquent les projectiles et peuvent être détruits.
- Les limites de l’arène sont physiques. Types, statuts et variations de statistiques influencent le combat ; charge/recharge sont adaptées aux délais des attaques. Les effets persistants suivent une cadence de temps réel.
- L’IA se place à portée, vise, strafe, évite les menaces et change de Pokémon selon la situation.
- Fin après élimination d’une équipe ou 180 secondes ; le temps départage les équipes par leur proportion de PV restante.

L’hôte simule à 20 Hz. Les entrées arrivent directement au propriétaire du match ; les instantanés sont envoyés à 10 Hz. Le client invité interpole l’affichage entre les états reçus ; il ne prédit pas les dégâts. La pause relève de l’hôte. Le mode s’arrête à la sortie ; les matchs ne sont pas sauvegardés en cours. Les récompenses restent locales, comme les autres mini-jeux.

## Présentation et survie

Jardins de combat, arène nocturne et caverne de l’Antre : décors Canvas locaux, terrain marqué, végétation/cristaux, ombres, météo et particules. Les sprites PMD existants utilisent Idle/Walk/Attack/Hurt, les entrées de Poké Ball et les effets de condition. Les attaques sont dessinées dans l’espace : orbes, faisceaux, vagues, impacts et protections, avec animations réduites prises en compte.

La survie conserve ses commandes et son ambiance sombre. Les capacités de soutien peuvent soigner, protéger, modifier les paliers, poser une zone ou infliger un état aux ennemis ; les attaques offensives peuvent transmettre leur statut secondaire, drainer ou subir le recul. Les PP de survie restent remplacés par les délais d’attaque du mode. Les effets sont adaptés à l’action contre des hordes.

## Sources et vérification

- [PokéAPI, capacités](https://pokeapi.co/docs/v2#moves) et [CSV du projet](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) : priorité, catégories, effets, chances, soins, coups multiples, statuts et apprentissages.
- PMD SpriteCollab : mêmes sprites et crédits que le catalogue existant.
- Les effets Canvas sont écrits pour PokéWorld. Aucun code, effet, son ou média PokéSurvivor/Arena 2D n’a été copié.

`prepare-combat.cjs` reconstruit les métadonnées et apprentissages ; son cache CSV est ignoré par Git. `combat-moves.mjs`, `combat-rules.mjs`, `combat-ai.mjs` et `combat-core.mjs` séparent les données, calculs, décisions et résolution. `arena-model.mjs` reste testable sans DOM ; `arena.mjs` gère commandes, rendu et réseau.

Contrôles : `combat-strategy-check.cjs`, `arena-check.cjs`, `combat-browser-check.cjs`, `arena-network-check.cjs`, plus les scénarios existants de duels, file mondiale, raids, effets, survie et progression. Les tests réseau utilisent deux contextes réels WebRTC ; le mobile utilise de vrais événements tactiles CDP.
