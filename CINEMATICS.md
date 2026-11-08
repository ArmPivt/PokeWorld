# Arènes, musique et premières rencontres

Les combats classiques se déroulent dans un stade en pixel art dessiné sur Canvas : murs, entrées, gradins, spectateurs, bannières, éclairage et terrain de combat marqué. Les coordonnées du décor suivent celles des combattants et la place réellement laissée par les commandes, en portrait et en paysage. L’Antre conserve une variante souterraine et les étages nocturnes leur palette. La simulation stratégique et les dégâts restent inchangés.

## Musique

Onze compositions originales sont enregistrées localement en WAV PCM mono 22 050 Hz, 16 bits, boucles de 21 à 37 secondes. Le générateur déterministe `compose-music.cjs` assemble mélodie, arpèges, basse, accords et percussions ; le manifeste donne les titres, durées et tempos. Il n’y a aucun appel à un hébergeur de musique ni extrait de bande originale Pokémon.

L’accueil, les combats, la survie, l’Antre, les invocations, Pokéclick, Conquête, la victoire et les familles de cinématiques ont leurs thèmes. Deux lecteurs au maximum permettent un fondu de 750 ms. La lecture commence après une interaction, s’arrête quand l’onglet est masqué, reprend sans redémarrer le morceau et reste suspendue pendant la pause d’une cinématique. Le raccourci M et le bouton musical permettent de couper la musique ; le volume est réglable séparément des effets dans Réglages. Les préférences sont sauvegardées.

## Rencontres légendaires

`legendary-stories.mjs` définit explicitement 94 scénarios de rareté légendaire, fabuleux compris. Les 87 espèces actuellement disponibles utilisent leur scénario ; les sept espèces écartées par le catalogue de sprites restent indisponibles et ne sont pas proposées. Chaque scénario comprend : titre, lieu, présage, arrivée, effet, palette et thème musical. Les décors communs sont réutilisés avec des détails et signatures propres au scénario. Les films sont des scènes 2D animées en temps réel, pas des vidéos préenregistrées.

La version 0.13 remplace la révélation en quatre phases par des films de six plans, de 19 à 23 secondes. Chaque espèce possède une direction explicite dans legendary-direction.mjs : objet narratif dessiné, entrée, transformation du décor, pouvoir, sortie, axe de caméra et durées. Le moteur partage des outils de dessin ; les objets, trajectoires et événements des 94 films sont distincts. Il n’y a pas de vidéo externe ni de modèle générique de remplacement.

Rayquaza a une scène de 21,5 secondes : confrontation dans la baie, Pilier Céleste, gros plan au travers des nuages, descente dans le faisceau vert, rugissement et retrait de Groudon/Kyogre, puis ciel apaisé. Mewtwo brise sa cuve, les Regis se construisent à partir de fragments, Giratina inverse le décor, Arceus gravit son escalier lumineux. Les variantes shiny suivent la même direction avec leurs propres sprites. Les animations réduites condensent les plans en six secondes et coupent tremblements, pluie et grands panoramiques ; les déplacements d’entrée nécessaires à la narration sont conservés.

Une première évolution vers une espèce légendaire encore inconnue déclenche aussi son film et enregistre la rencontre en attente avant sa lecture. Cela permet aux évolutions de Cosmog, Type:0, Meltan et autres lignées concernées de conserver leur apparition malgré leur retrait des portails.

Le tirage complet est sauvegardé **avant** toute animation. Une seule première rencontre est réservée par espèce, même si la même espèce apparaît plusieurs fois dans un ×10 ou sous deux variantes. Le sprite révélé conserve sa variante shiny. Les Pokémon déjà possédés dans une ancienne sauvegarde ne déclenchent pas automatiquement une nouvelle première obtention.

Après la silhouette d’un nouveau légendaire, la cinématique se joue puis revient à l’écran normal d’obtention. Passer la cinématique revient également à cet écran. Un rechargement conserve la récompense et laisse une rencontre en attente sur la page Invocations, sans nouveau coût en tickets. Passer tout un ×10 conserve les rencontres non regardées ; le récapitulatif et la page du portail proposent de les voir. Le bouton de la fiche du Pokémon permet de revoir son histoire sans tirage ni récompense supplémentaire.

## Vérifications

- `cinema-check.cjs` : couverture des 94 espèces, titres uniques, réservation par espèce, doublons/shiny dans une multi, migration et reprise ; en-têtes et durée des onze WAV, signal non silencieux et absence de saturation.
- `cinema-browser-check.cjs` : lecture audio réelle, volume et muet persistants, stade desktop/mobile, plans de Rayquaza, retour naturel à l’obtention, doublons, shiny, rechargement, mode réduit, ×10 et relecture depuis la collection.
- Les scénarios existants de combats stratégiques, remplacements après K.O., effets, raids et duels restent applicables.

## Références visuelles et narratives

- [Site officiel ORAS : la légende de Rayquaza](https://www.pokemon.co.jp/ex/oras/feature/20.html), consulté pour le conflit entre Groudon et Kyogre et l’intervention venue du ciel.
- [Site officiel : Battle Stadium](https://swordshield.pokemon.com/en-gb/gameplay/pokemon-battle-stadium/), consulté pour l’ambiance d’une enceinte de combat.
- Sprites PMD : ressources existantes et crédits conservés dans `dist/CREDITS.md`.

Les scènes sont des adaptations originales pour PokéWorld. Les règles d’accès du site restent inchangées.

La vidéo de référence [Pokémon Emerald — The Rayquaza Cutscene, EleMira](https://www.youtube.com/watch?v=f98GeQIKJBQ) a été consultée dans le navigateur aux plans de confrontation, gros plan et descente. Aucun extrait ni son de cette vidéo n’est intégré. Tests complémentaires : legendary-films-check.cjs et legendary-films-browser-check.cjs (87 films jouables, 522 plans, galerie de douze légendaires, retour d’obtention, shiny, écran mobile).

## Trio de la création — 8 novembre 2026

Trois nouveaux films MP4 originaux de 32 secondes : Dialga (temps figé puis inversé), Palkia (portails et espace) et Giratina (retournement de 180 degrés dans la scène de la Chaîne Rouge, chute de hauteur musicale, silence de 4 à 6,5 secondes, ténèbres et plusieurs cadrages du Monde Distorsion). Ils reprennent les trois gardiens et les 42 maillons de la scène approuvée. La révélation en couleur arrive à 24 secondes et le cri à 25,4 secondes. Musiques originales « Le Premier Battement », « Au-delà des frontières » et « De l’autre côté ».

Les posters montrent l’ouverture, pour ne pas révéler le Pokémon pendant le chargement. Les trois vidéos sont celles des variantes normales ; les chromatiques conservent leur propre chemin sans reprendre les mauvaises couleurs. Sources, décors générés avec imagegen, scripts de rendu, musique, sprites et crédits : `cinematics/production/creation-trio-v1/`. Les anciennes vidéos v1 des gardiens des lacs sont archivées hors du paquet web, les v2 approuvées restent actives.

### Révision de Dialga et Palkia

Les vidéos v2 remplacent les deux premiers films. Dialga arrête le plan et sa musique, fait apparaître une horloge puis rembobine réellement le début avec son audio inversé avant un flash blanc et sa dimension. Pour Palkia, l’écran se fissure, éclate en 80 éclats sur blanc puis sa dimension se révèle lentement. Les révélations, cris, durées et le film de Giratina restent conservés. Sources et vérifications dans `cinematics/production/creation-trio-v2/`.

## Heatran, Phione, Manaphy et Shaymin — 9 novembre 2026

Quatre nouveaux films MP4 de 28 secondes, cinq plans chacun, musiques originales et cris à 21,7 s. Heatran se révèle dans une grotte volcanique. Phione et Manaphy partagent douze secondes dans une grotte aquatique, puis ont leur propre arrivée : bulle pour Phione, cœur lumineux pour Manaphy. Shaymin apparaît sur une île fleurie après un chemin de pétales et une floraison. Sources, prompts imagegen, partitions et validations dans `cinematics/production/nature-quartet-v1/`. Les posters sont pris avant toute apparition.

## Darkrai et Cresselia — 9 novembre 2026

Deux films de 30 secondes conçus en miroir : même chambre, jardin, pont, bassin, plume et six cadrages. Darkrai corrompt le rêve, Cresselia guérit le cauchemar. Les courbes de transformation et les développements majeur/mineur du motif musical sont opposés. Révélation à 21 s, cri à 22,7 s, posters sans Pokémon. Sources, prompts imagegen et validations dans `cinematics/production/dream-duet-v1/`.

### Darkrai et Cresselia — cauchemar renforcé

Les films v2 rendent le cauchemar explicite : présence derrière la fenêtre, mains et ombres qui approchent, arbres aux visages inquiétants et grande silhouette au fond du jardin. Darkrai comporte une coupure et un retour soudain sur la fenêtre avec bruitage. Le beau rêve contient désormais des îlots fleuris en lévitation et des papillons lumineux. La musique opposée est complétée par des pulsations et des souffles oppressants qui se dissipent chez Cresselia. Sources et validations dans `cinematics/production/dream-duet-v2/`.
