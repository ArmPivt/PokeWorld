# Arènes, musique et premières rencontres

Les combats classiques se déroulent dans un stade en pixel art dessiné sur Canvas : murs, entrées, gradins, spectateurs, bannières, éclairage et terrain de combat marqué. Les coordonnées du décor suivent celles des combattants et la place réellement laissée par les commandes, en portrait et en paysage. L’Antre conserve une variante souterraine et les étages nocturnes leur palette. La simulation stratégique et les dégâts restent inchangés.

## Musique

Onze compositions originales sont enregistrées localement en WAV PCM mono 22 050 Hz, 16 bits, boucles de 21 à 37 secondes. Le générateur déterministe `compose-music.cjs` assemble mélodie, arpèges, basse, accords et percussions ; le manifeste donne les titres, durées et tempos. Il n’y a aucun appel à un hébergeur de musique ni extrait de bande originale Pokémon.

L’accueil, les combats, la survie, l’Antre, les invocations, Pokéclick, Conquête, la victoire et les familles de cinématiques ont leurs thèmes. Deux lecteurs au maximum permettent un fondu de 750 ms. La lecture commence après une interaction, s’arrête quand l’onglet est masqué, reprend sans redémarrer le morceau et reste suspendue pendant la pause d’une cinématique. Le raccourci M et le bouton musical permettent de couper la musique ; le volume est réglable séparément des effets dans Réglages. Les préférences sont sauvegardées.

## Rencontres légendaires

`legendary-stories.mjs` définit explicitement 94 scénarios de rareté légendaire, fabuleux compris. Les 87 espèces actuellement disponibles utilisent leur scénario ; les sept espèces écartées par le catalogue de sprites restent indisponibles et ne sont pas proposées. Chaque scénario comprend : titre, lieu, présage, arrivée, effet, palette et thème musical. Les décors communs sont réutilisés avec des détails et signatures propres au scénario. Les films sont des scènes 2D animées en temps réel, pas des vidéos préenregistrées.

Rayquaza possède une séquence particulière de 16 secondes : plan du Pilier Céleste en mer, affrontement de Groudon et Kyogre, lumière verte et descente depuis les nuages, puis apparition sur le sanctuaire. Les autres rencontres durent 12 secondes et disposent de leur lieu et symbole : cuve de Mewtwo, anneaux du temps de Dialga, faille de Palkia, monde inversé de Giratina, arc-en-ciel de Ho-Oh, etc. Les animations réduites raccourcissent la lecture à six secondes et retirent les grands mouvements de caméra et la pluie.

Le tirage complet est sauvegardé **avant** toute animation. Une seule première rencontre est réservée par espèce, même si la même espèce apparaît plusieurs fois dans un ×10 ou sous deux variantes. Le sprite révélé conserve sa variante shiny. Les Pokémon déjà possédés dans une ancienne sauvegarde ne déclenchent pas automatiquement une nouvelle première obtention.

Après la silhouette d’un nouveau légendaire, la cinématique se joue puis revient à l’écran normal d’obtention. Passer la cinématique revient également à cet écran. Un rechargement conserve la récompense et laisse une rencontre en attente sur la page Invocations, sans nouveau coût en tickets. Passer tout un ×10 conserve les rencontres non regardées ; le récapitulatif et la page du portail proposent de les voir. Le bouton de la fiche du Pokémon permet de revoir son histoire sans tirage ni récompense supplémentaire.

## Vérifications

- `cinema-check.cjs` : couverture des 94 espèces, titres uniques, réservation par espèce, doublons/shiny dans une multi, migration et reprise ; en-têtes et durée des onze WAV, signal non silencieux et absence de saturation.
- `cinema-browser-check.cjs` : lecture audio réelle, volume et muet persistants, stade desktop/mobile, quatre plans de Rayquaza, retour naturel à l’obtention, doublons, shiny, rechargement, mode réduit, ×10 et relecture depuis la collection.
- Les scénarios existants de combats stratégiques, remplacements après K.O., effets, raids et duels restent applicables.

## Références visuelles et narratives

- [Site officiel ORAS : la légende de Rayquaza](https://www.pokemon.co.jp/ex/oras/feature/20.html), consulté pour le conflit entre Groudon et Kyogre et l’intervention venue du ciel.
- [Site officiel : Battle Stadium](https://swordshield.pokemon.com/en-gb/gameplay/pokemon-battle-stadium/), consulté pour l’ambiance d’une enceinte de combat.
- Sprites PMD : ressources existantes et crédits conservés dans `dist/CREDITS.md`.

Les scènes sont des adaptations originales pour PokéWorld. Les règles d’accès du site restent inchangées.
