# Capacités et règles Showdown

## Référence

Le jeu embarque une extraction navigateur du moteur Pokémon Showdown, @pkmn/sim 0.10.15, et ses données. Les dépendances de génération sont figées dans tools/showdown/package.json et pnpm-lock.yaml. Le moteur compilé est dans dist/client/js/vendor/showdown-sim.mjs ; son SHA-256 figure dans data/showdown-sources.json. Le bundle conserve les noms de classes (keepNames) car la sérialisation native les utilise. Les licences MIT sont distribuées dans dist/client/licenses/showdown.

L’extraction comprend 848 capacités standard (hors variantes Z/Max et actions internes), les learnsets de 1 025 espèces, 15 432 entrées par niveau, et les routes CT/tuteurs héritées. Le filtre existant de sprites reste appliqué au jeu : cela n’ajoute pas de Pokémon sans sprite. Les traductions sont conservées en français depuis PokéAPI et figées dans fr-moves.json ; le texte détaillé d’origine Showdown est accessible en anglais, dans un volet séparé des boutons d’apprentissage.

## Apprentissage

Chaque espèce emploie les sources L de la génération la plus récente disponible, avec la lignée des pré-évolutions. Les sources M (CT), T (tuteur), E (reproduction), S (événement), etc. sont distinctes. Les capacités E/S ne sont pas débloquées au niveau 1. Le jeu ne rajoute pas de système de reproduction ou de distribution d’événements. Les routes CT/tuteurs sont celles du National Dex, y compris les transferts historiques. Les niveaux d’une ancienne génération ne sont pas mélangés avec les niveaux récents pour avancer un déblocage.

Les quatre cases de capacités sont sauvegardées. Les cases vides restent vides ; Lutte ne peut pas être apprise ou équipée manuellement. Elle apparaît automatiquement lorsque le moteur impose Lutte faute de PP. Une recharge ou une attaque verrouillée est affichée et peut être confirmée sans bloquer le tour. Les anciens choix non légaux sont retirés, les emplacements signalés, et tous les niveaux/IV/EV/objets sont préservés. Un premier apprentissage CT consomme une CT ; un tuteur consomme une écaille ; rééquiper une capacité connue consomme une écaille. Retirer une capacité est gratuit, en conservant au moins une capacité. Gribouille peut enregistrer définitivement une capacité effectivement copiée en combat pour Queulorior.

## Combat et réseau

L’adaptateur passe les espèces, talents, IV/EV, natures et quatre capacités au moteur. Les statistiques finales propres au jeu (dont les équipements personnalisés) sont conservées. Le moteur résout priorités/Vitesse, chances, PP, conditions, réactions, météo, terrain, immunités, coups multiples, attaques conditionnelles, soins, baisses sur le lanceur, copie/transformation et remplacements. Les estimations de l’IA restent heuristiques ; elles ne remplacent pas le calcul réel des dégâts.

Les états natifs sont sérialisés entre tours et transmis par l’hôte existant ; aucun serveur Showdown externe n’est nécessaire pour combattre. Les logs sont convertis en événements d’animation, avec dégâts à l’impact. Les doubles lignes privée/publique du protocole ne sont comptées qu’une fois. Un remplacement humain obligatoire est demandé ; un remplacement IA est résolu sans consommer une action supplémentaire du joueur. La vue de duel remappe les identifiants en héros/boss.

Le raid est une variante PokéWorld : côté allié de quatre actifs, côté boss d’un actif géant, accessibilité des quatre positions et attaques du boss limitées à une cible. Les soins ciblés sur un allié choisissent automatiquement le partenaire le plus blessé. Les autres attaques de zone conservent leurs cibles natives, ce qui peut inclure les alliés. La limite de 20 tours, les expulsions et les tirages individuels restent appliqués après la résolution native. Bénédiction ne peut pas rappeler un participant expulsé dans le raid ; dans les combats classiques, la sélection d’une cible K.O. est prise en charge. Les échanges de positions entre alliés conservent les commandes propres à chaque dresseur.

Les trois équipements sont les objets personnalisés du jeu, pas trois objets officiels tenus. Les commandes Méga/Dynamax/Téracristal/Z/Max ne sont pas ajoutées. Les modes Arène et Survie restent des adaptations d’action : leurs durées, projectiles et recharges ne sont pas des tours de Showdown. Une capacité sans adaptation est indiquée et désactivée dans ces modes. Les probabilités et effets secondaires génériques pris en charge distinguent la cible du lanceur.

## Régénération

Dans tools/showdown : installer les dépendances figées avec pnpm, puis exécuter `node sync-showdown.cjs ../..`. Le résultat nécessaire au jeu est versionné, donc aucun outil npm n’est nécessaire au navigateur. Le serveur de prévisualisation reste lancé par `node preview.cjs` à la racine.

## Vérifications

showdown-review-check.cjs compare tous les champs majeurs des capacités et les sources de chaque niveau avec la version figée. Il vérifie les routes d’apprentissage, les dépenses, les immunités, Close Combat, Abri, Poudre Dodo, Choc Venin, Riposte, recharge/deux tours, K.O., Clonage, sérialisation déterministe et raid à une cible. showdown-browser-check.cjs couvre les menus, les descriptions sans achat involontaire, le futur niveau verrouillé, CT, mobile, Ultralaser/recharge et persistance. Les contrôles de progression, Arène, vrais duels PeerJS et raids complètent ces cas.
