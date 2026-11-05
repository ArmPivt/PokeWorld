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
| Continuité | Après un K.O., chaque joueur choisit lui-même un réserviste. Le choix ne consomme aucun tour ni PP adverse ; si les pièges mettent ce remplaçant K.O., un nouveau choix est demandé. Seuls les dresseurs IA changent automatiquement. Lutte quand les PP sont épuisés. |

Le boss de l’Antre choisit une seule cible par action, y compris lorsque l’attaque possède une zone dans les jeux officiels. Les soins collectifs pris en charge soignent les partenaires actifs ; Vampigraine rend les PV au dresseur qui l’a posée. Les PP, effets, statuts et événements sont résolus par l’hôte puis transmis aux autres joueurs.

Le bouton **État du combat** montre les paliers, le statut, le talent et les effets des quatre capacités. Les badges PV montrent les statuts majeurs ; les conditions de terrain sont visibles près des commandes. Les effets de soin/boost/affliction ont leurs propres messages et animations.

Il s’agit d’un moteur compact propre à PokéWorld, pas d’un simulateur complet d’une génération officielle : il n’inclut notamment pas toutes les interactions exceptionnelles de talents, les Méga-Évolutions, Dynamax, Téracristal ou les attaques de transformation/copie. Les effets génériques sont partagés ; certaines capacités à puissance variable utilisent une estimation adaptée. Les cas non implémentés ne sont pas proposés dans les nouveaux apprentissages. Trois objets de types différents peuvent être équipés par Pokémon. Les bonus se cumulent, un exemplaire appartient à un seul Pokémon, et les offres réseau transmettent les trois types. Les anciennes sauvegardes à un objet sont migrées ; les exemplaires excédentaires restent dans le sac.

## IA et référence Hope

Le projet local Pokémon Hope charge l’IA de PokémonSDK. Les fichiers `5_Battle_30_AI.rb` et `5_Battle_30_AI_1_MoveHeuristic.rb` ont été consultés en lecture seule. Aucun script de Hope/PSDK n’est embarqué ni modifié.

L’IA JavaScript de PokéWorld reprend des principes : comparer les actions légales, éviter les immunités et les statuts redondants, tenir compte de la catégorie et du STAB, choisir un remplacement utile et mémoriser les capacités observées. Elle ajoute ses propres évaluations des KO/priorités, soins, boosts, météo et pièges. Les changements rapprochés sont limités. Elle ne connaît pas l’action que le joueur vient de sélectionner. Les équipes IA reçoivent une couverture offensive et une capacité de soutien réellement apprenable à leur niveau.

## Arène 2D

Implémentation originale inspirée des [aperçus de Big Kid Nation](https://www.bigkidnation.com/) et de la [bande-annonce longue indiquée par le joueur](https://www.youtube.com/watch?v=J_JhLHfqZXY), visionnée directement. Les mécanismes visibles repris sont le terrain plat vu du dessus, les caisses destructibles, le recul, les traces de glace et de cratères, les grandes attaques directionnelles et les collisions de rayons. Le trailer ne montre pas les commandes ou règles internes ; les contrôles et l’équilibrage sont propres à PokéWorld.

- Solo contre IA ou match réel par code ; files mondiales distinctes du classique et séparées par format. Six Pokémon par équipe, niveau 50 en duel. Format Duel (un actif) ou Escouade (jusqu’à trois actifs par équipe, compagnons assistés par IA). Cliquer un compagnon prend son contrôle ; les doublons de Pokémon actifs sont empêchés.
- Quatre décors en pixel art : prairie, terre battue, dalles anciennes et caverne. Caméra qui suit le combat, proportions différentes selon les espèces, vue Cinéma avec Tab.
- Flèches, ZQSD ou WASD pour bouger ; souris pour viser ; 1–4 pour les capacités ; Espace pour esquiver ; R ou les portraits pour changer de Pokémon.
- Mobile : joystick, quatre boutons, portraits et esquive. La visée suit automatiquement l’adversaire lorsque la souris n’est pas utilisée.
- Deux charges d’esquive, récupération progressive ; PP consommés même si l’attaque manque et récupération indépendante des quatre capacités.
- Projectiles, corps-à-corps, rayons, vagues larges et zones annoncées au sol. La position détermine la touche ; les caisses et rochers bloquent les projectiles et éclatent en débris. Les rayons opposés s’arrêtent au point de collision ; les orbes opposés se neutralisent.
- Les impacts repoussent les Pokémon. Les attaques psy peuvent brièvement soulever leur cible. Les séismes produisent une onde expansive et un cratère. Les sillons de glace font glisser, l’eau ralentit les Pokémon terrestres, les traces brûlantes endommagent les ennemis et le feu évapore l’eau ou la glace.
- Les limites de l’arène sont physiques. Types, statuts et variations de statistiques influencent le combat ; charge/recharge sont adaptées aux délais des attaques. Les effets persistants suivent une cadence de temps réel.
- L’IA se place à portée, vise, strafe, évite les menaces et change de Pokémon selon la situation.
- Fin après élimination d’une équipe ou 180 secondes ; le temps départage les équipes par leur proportion de PV restante.

L’hôte simule à 20 Hz. Le rendu local interpole chaque image entre les deux derniers pas, pour les Pokémon et les projectiles. Les entrées locales sont lues à chaque image. Les instantanés réseau sont envoyés à 10 Hz ; l’invité possède un tampon de présentation d’environ 100 ms qui interpole Pokémon, projectiles et temps des effets ensemble. Les PV et les impacts suivent la même chronologie de présentation. Aucun dégât n’est prédit. La caméra utilise cet état interpolé et un amortissement dépendant du temps écoulé ; les panneaux de PV sont mis à jour sans recréer leurs nœuds. La pause relève de l’hôte. Le mode s’arrête à la sortie ; les matchs ne sont pas sauvegardés en cours. Les récompenses restent locales, comme les autres mini-jeux.

## Présentation et survie

Jardins de combat, arène nocturne et caverne de l’Antre : décors Canvas locaux, terrain marqué, végétation/cristaux, ombres, météo et particules. Les sprites PMD existants utilisent Idle/Walk/Attack/Hurt, les entrées de Poké Ball et les effets de condition. Une échelle commune entre les poses et une ancre de pieds issue des pixels opaques évitent le rétrécissement et les translations internes brutales des planches PMD ; les séquences d’attaque commencent à leur première image et ne tournent pas en boucle. Les attaques sont dessinées dans l’espace : orbes, faisceaux, vagues, impacts et protections, avec animations réduites prises en compte. Les atlas VFX originaux en basse résolution sont préchauffés et réutilisés : flammes, orbes, eau, glace, feuilles, arcs de frappe, rochers, fumée et impacts. Les trajectoires restent continues et les pixels restent nets. L’anticipation, le trajet, le contact et la dissipation sont distincts.

La survie conserve ses commandes et son ambiance sombre. Les capacités de soutien peuvent soigner, protéger, modifier les paliers, poser une zone ou infliger un état aux ennemis ; les attaques offensives peuvent transmettre leur statut secondaire, drainer ou subir le recul. Les PP de survie restent remplacés par les délais d’attaque du mode. Les effets sont adaptés à l’action contre des hordes. La survie interpole également ses pas de 60 Hz à la fréquence d’affichage ; ses projectiles visibles sont ceux qui calculent les collisions. Les rayons et flux ont une courte charge puis une tête qui progresse : ils ne blessent plus à la simple sélection de l’attaque.

## Sources et vérification

- [PokéAPI, capacités](https://pokeapi.co/docs/v2#moves) et [CSV du projet](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) : priorité, catégories, effets, chances, soins, coups multiples, statuts et apprentissages.
- [PokéSurvivor Gameplay, Jim Zark](https://www.youtube.com/watch?v=ypa-PqfiVPA) : référence fournie, visionnée aux séquences initiales et vers 1:08, 2:50 et 4:32 ; petits projectiles de feu orientés, traînées, impacts et lisibilité parmi les ennemis.
- [Pokémon Battle Advanced 0.3.0, Daigan Games](https://www.youtube.com/watch?v=1AXB5waDT2g) : autre référence visionnée, notamment les anneaux de Rafale Psy et les échanges Feu/Eau. Le [devlog du créateur](https://thedaigan.itch.io/pba/devlog/1727487/030-vermilion-the-ss-anne-and-lt-surge) décrit flux continus, interceptions et impacts. Ces références guident la présentation ; aucun média n’est embarqué.
- PMD SpriteCollab : mêmes sprites et crédits que le catalogue existant.
- Les effets Canvas sont écrits pour PokéWorld. Aucun code, effet, son ou média PokéSurvivor/Arena 2D n’a été copié.

`prepare-combat.cjs` reconstruit les métadonnées et apprentissages ; son cache CSV est ignoré par Git. `combat-moves.mjs`, `combat-rules.mjs`, `combat-ai.mjs` et `combat-core.mjs` séparent les données, calculs, décisions et résolution. `arena-model.mjs` reste testable sans DOM ; `arena.mjs` gère commandes et réseau, `arena-visual.mjs` les décors et effets. `equipment.mjs` centralise les trois emplacements et `replacement.mjs` la phase de remplacement.

Les barres de PV suivent l’état de présentation et changent au point d’impact de l’animation, y compris en animations réduites. Le serveur peut déjà avoir résolu le tour sans révéler les dégâts dans l’interface. Les choix reçus durant la lecture des animations sont mis en attente.

Contrôles : `animation-check.cjs`, `animation-browser-check.cjs`, `animation-network-check.cjs`, `revision-check.cjs`, `revision-browser-check.cjs`, `revision-network-check.cjs`, `combat-strategy-check.cjs`, `arena-check.cjs`, `combat-browser-check.cjs`, `arena-network-check.cjs`, plus les scénarios existants de duels, file mondiale, raids, effets, survie et progression. Les tests réseau utilisent deux contextes réels WebRTC ; le mobile utilise de vrais événements tactiles CDP.
