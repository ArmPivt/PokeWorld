# Dialga, Palkia et Giratina — 32 secondes chacun

Les trois films reprennent la scène de la Chaîne Rouge et des trois Crés déjà approuvée. Dialga développe le temps (figé puis remontant), Palkia les failles de l’espace (traversée et plans cosmiques). Giratina interrompt le rituel : rotation de 180 degrés de 2,4 à 4,7 s, chute de hauteur musicale et silence complet de 4 à 6,5 s, ténèbres puis trois vues du Monde Distorsion avant la silhouette et l’apparition.

Révélation à 24 s, cri natif à 25,4 s. Trois musiques originales composées localement, avec le passage de Chaîne Rouge précédemment composé pour les gardiens des lacs. Aucun enregistrement de musique officielle utilisé.

Rendu Canvas à 480×270, export vidéo 960×540, 24 images/s, H.264 et AAC stéréo. Les images sont réellement animées et encodées dans les MP4. Les sprites sont animés à partir des planches PMDCollab, avec leurs crédits conservés dans characters/. Giratina utilise ici sa forme Alternative correspondant au sprite du jeu, sans substituer une autre forme.

Décors time.png, space.png et distortion.png créés avec l’outil intégré imagegen. Composition : arches antiques et fragments suspendus pour le temps ; porte dimensionnelle violette et espace pour Palkia ; plateformes et cascades impossibles pour Giratina. Les prompts exacts sont dans prompts.json. Le décor pillar.png et la scène de forge proviennent de lake-guardians-v2, les crédits et la direction antérieurs sont conservés.

Reproduction : servir ce dossier avec `node server.cjs`, puis `node render.cjs 483 all` (idem 484 et 487), puis lancer `compose_encode.py` avec Python, PyAV, NumPy et Pillow. Le moteur d’instrumentation utilise GeneralUser-GS.sf2 déjà présent dans la production Rayquaza. Les intermédiaires de 2 304 images et les WAV restent dans le dossier de travail ; ils ne sont pas inclus dans le paquet web.

Référence narrative : https://diamondpearl.pokemon.com/en-us/story/ (temps, espace, Colonnes Lances et gardiens des lacs). L’enchaînement des plans est une adaptation originale suivant la demande du joueur.

Validation : 768 images décodées par film, PNG de contrôle et cadrage complet des poses Idle ; audio stéréo sans saturation, corrélation du cri > 0,99 ; silence de Giratina exactement vérifié ; invocations, retour d’obtention, relecture sans ticket supplémentaire et affichage mobile testés dans le jeu.
