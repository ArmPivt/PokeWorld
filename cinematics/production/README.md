# Production des apparitions légendaires

État du 6 novembre 2026 : deux vrais clips MP4 examinés et intégrés, Rayquaza (384) et Groudon (383), de 5,04 secondes chacun. Ils utilisent le pixel art simple validé dans la conversation. Ils se déclenchent à la première obtention et restent rejouables depuis la fiche du Pokémon. Le retour vers la récompense dépend de la fin native de la vidéo ou du bouton Passer. Les Pokémon et les tickets sont sauvegardés avant la lecture. Le filigrane original PixVerse est conservé.

Les 87 espèces légendaires avec sprites compatibles disposent d'un scénario explicite, d'un décor, d'un mouvement et d'un événement visuel distincts. Leurs 85 variantes chromatiques disponibles ont une référence de couleurs séparée : 172 médias prévus au total. Voir CATALOGUE.md et catalog.json. Deux médias seulement sont actuellement terminés ; les autres entrées ne sont pas présentées comme des vidéos produites.

Sept images de départ sont préparées : Rayquaza, Groudon, Kyogre, Lugia, Ho-Oh, Raikou et Entei. Les consignes exactes d'Imagegen intégré accompagnent chaque image dans species/<id>. Les images de Mewtwo, Mew, Artikodin et Électhor ont été refusées par le générateur ; ces entrées restent explicitement en attente dans generation-issues.json. Les demandes refusées n'ont pas été soumises à un autre fournisseur pour contourner ce refus.

Les deux clips ont utilisé les 60 crédits gratuits initiaux. Le dernier solde observé après Groudon est de 0 crédit. L'utilisateur a annoncé recharger PixVerse ; aucune recharge n'a encore été constatée. Aucun achat n'a été effectué par l'agent. Au tarif observé de 30 crédits par clip, le minimum restant est de 2 550 crédits pour les 85 autres espèces normales et 2 550 pour les chromatiques, hors reprises. Le nombre de crédits ne garantit pas que chaque rendu passera la revue de qualité.

La file est reproductible : node prepare-legendary-production.mjs . reconstruit les plans et les statuts à partir des sprites réellement pris en charge et des médias revus. tools/import_legendary_video.py vérifie le décodage MP4, la durée, l'identifiant, la variante et les empreintes des fichiers avant d'enregistrer un clip explicitement revu. Il nécessite PyAV. La génération et l'import ne sont pas exécutés automatiquement par le jeu.

La correspondance chromatique est stricte : une variante ne réutilise jamais la vidéo de la forme normale. Les anciens rendus Canvas restent disponibles pour les rencontres dont le vrai fichier vidéo n'est pas encore produit.

Vérification : test:legendary-media, test:video-player et test:legendary-media-browser couvrent les vrais fichiers, la séparation des variantes, le déclenchement dans le gacha, la fin native de lecture, la pause, la lecture réduite sur demande, les erreurs sans perte de rencontre, les doublons et le rejeu sans ticket supplémentaire. Les régressions cinéma couvrent aussi les tirages x10, les chromatiques et la reprise après rechargement.

Les essais détaillés de Wan 2.2 restent archivés dans rayquaza/trials pour expliquer le choix du style simplifié. Ils ne sont pas enregistrés comme des vidéos achevées. Aucun changement de l'audience privée du site n'est demandé.

## Rayquaza — cinématique intégrée le 6 novembre 2026

La version normale utilise désormais `assets/cinematics/384-appearance-v2.mp4` : cinq plans, 21,625 secondes, 960 × 540, avec la musique originale « Le Sillage Émeraude » et le cri synchronisé. Sources et partition dans `rayquaza/v3-retour-baie/` et `rayquaza/v4-musique-originale/`. L’ancien plan PixVerse n’est plus référencé par le jeu. Cette version concerne la première obtention et la relecture depuis la fiche du Pokémon ; la variante chromatique conserve sa propre direction.

## Kyogre et Groudon — films narratifs intégrés le 6 novembre 2026

Kyogre normal utilise `382-appearance-v1.mp4` et Groudon normal `383-appearance-v2.mp4` : 26 secondes et cinq plans chacun, avec musiques originales et cris synchronisés. Les sources communes, partitions et validations sont dans `primal-v1/`. L’ancien film de Groudon n’est plus référencé par le jeu. Les variantes chromatiques conservent des médias et une direction distincts.

## Deoxys — film narratif intégré le 6 novembre 2026

Deoxys normal utilise `386-appearance-v1.mp4` : six plans sur 36 secondes, laboratoire, approche de la météorite, attaque de Rayquaza, explosion, mouvements du triangle puis apparition avec son cri et la composition originale « Le Code Delta ». Sources, prompts, partition et validations dans `deoxys-v1/`.
