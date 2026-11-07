# Affichage des sprites, Antre et audio

Antre : identité masquée dans tout le menu tant que la rencontre n’est pas remportée. Seuls les types sont dévoilés. Une rencontre antérieure révèle son nom et son sprite, sans point d’interrogation. Décor CSS original inspiré des rochers et du pilier rouge décrits par la référence officielle : https://swordshield.pokemon.com/en-us/gameplay/max-raid-battles/how-to-max-raid/ . Aucun asset officiel extrait.

Sprites : sprite-display.mjs isole les composantes opaques du sprite, retire les petits pixels de repérage éloignés et recadre les marges transparentes en mémoire. Les images sources et les crédits restent intacts. Les portraits des menus, fiches et invocations disposent d’un rendu centré qui conserve les proportions et toute l’étendue du personnage ; les coordonnées physiques des combats sont conservées. Les icônes HTML sont nettoyées après chargement. Les images inaccessibles en Canvas gardent leur rendu de secours. Alola affiche Necrozma.

Méga-Lucario : variante 0448/0001 de PMD SpriteCollab, animation Idle locale à dix images. Métadonnées, SHA-256, XML et crédits conservés sous dist/assets/pmd/448/mega. Utilisée uniquement comme mascotte des combats, sans modification des Pokémon possédés. Animation réduite respectée.

Audio : éléments Audio préparés en avance pour les menus et réutilisés par piste. Les navigations rapides annulent la transition précédente ; le fondu est réduit à 180 ms, avec une entrée audible dès play(). Un geste utilisateur relance une lecture bloquée. Le navigateur conserve sa politique de lecture automatique : sur un navigateur neuf, un premier clic peut rester nécessaire. Pause quand l’onglet est masqué et réglages musique/volume conservés.

Tests : test:sprite-audio vérifie anonymat/révélation, Meta Mega-Lucario et frames différentes, bornes des portraits sans coupure, réutilisation Audio après aller-retour, navigations rapides, pause et reprise, version mobile. Régressions : Antre, invocations et combats.
