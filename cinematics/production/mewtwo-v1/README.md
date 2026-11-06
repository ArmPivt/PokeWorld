# Mewtwo — Le Projet Origine

Cinématique de 40 secondes en huit plans, pixel art 960 × 540 à 24 images/seconde, film H.264/AAC. Décors ImageGen, sprites Mew / Métamorph / Mewtwo animés, masse violette déformable, musique originale électronique et bruitages synchronisés.

## Découpage demandé

| Temps | Plan |
| --- | --- |
| 0–6 s | Trois scientifiques sur une île étudient une ancienne fresque de Mew. |
| 6–12 s | Mew apparaît, flotte devant eux ; un prélèvement lumineux d’ADN rejoint la fiole du scientifique. Le plan se resserre sur la collecte. |
| 12–19 s | Laboratoire d’études : quatre scientifiques, moniteurs et incubateur central. Une masse violette informe grandit et se déforme dans la cuve. |
| 19–25 s | Fond noir : cinq Métamorph normaux apparaissent successivement, puis un Métamorph chromatique bleu accompagné de scintillements. |
| 25–26 s | Noir complet ; l’explosion se fait entendre à **25,3 s**, avant le retour au laboratoire. |
| 26–32 s | Même laboratoire, détruit : incubateur brisé, écrans fissurés, câbles arrachés, débris et fumée. |
| 32–34 s | Clignotements noirs entre de brefs retours au décor détruit. |
| 34–40 s | Flash violet, apparition de Mewtwo, cri à **35 s**, pose animée et débris en lévitation. Retour à l’écran d’obtention après le film. |

Le Métamorph chromatique appartient à la mise en scène : il n’est pas attribué comme récompense supplémentaire. Le film concerne uniquement Mewtwo normal ; il n’est pas réutilisé pour Mewtwo chromatique.

## Images et animation

Trois décors ont été créés avec **ImageGen intégré** :

- mural.png : fresque et scientifiques sur l’île ;
- lab.png : laboratoire intact et cuve vide ;
- ruins.png : édition du laboratoire précédent, même cadrage et même implantation, avec l’incubateur brisé et les consoles détruites.

Prompts exacts dans mural-prompt.txt, lab-prompt.txt, ruins-prompt.txt et backdrops.json. Les PNG utilisés sont copiés dans ce dossier. Le décor détruit est édité à partir du laboratoire intact pour maintenir la continuité.

Le prélèvement d’ADN est une animation fantastique de lumière entre Mew et une fiole. La masse violette est dessinée et déformée par Canvas, puis découpée aux limites de l’intérieur de la cuve ; elle ne représente pas déjà Mewtwo. Effets de moniteurs, bulles, fumée, étincelles, flash et débris en lévitation animés dans scenes.mjs.

Sprites : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), espèces 0150, 0151 et 0132. Le Métamorph bleu utilise les véritables planches chromatiques du dossier sprite/0132/0000/0001/, sans recoloration de la version normale. Planches, XML de durées, crédits et chemins source conservés dans characters/, sprites.json et sprite-sources.json.

## Musique

**Le Projet Origine** : composition originale avec basses synthétiques, lead électronique, nappes, cordes, célesta, harpe et percussions synthétisées. Début mystérieux sur l’île, tension rythmique dans le laboratoire, phrases électroniques décalées pour les Métamorph, rupture sur l’explosion puis montée vers la révélation.

Référence d’ambiance fournie par l’utilisateur : [Pokemon X and Y — Kanto Legendary Battle Theme (Mewtwo) from the Actual OST](https://www.youtube.com/watch?v=aD0YtmKrX20), Fennekin Mellow, 175 secondes. La composition reprend une ambiance générale de combat électronique tendu ; aucun enregistrement, sample, MIDI ou transcription du thème officiel n’est utilisé. Seules les métadonnées de cette référence sont conservées dans music-reference-metadata.json.

Partition éditable : le-projet-origine.mid. Musique instrumentale : le-projet-origine-score.wav. Mix final complet : mewtwo-soundtrack.wav. Instruments, repères et empreinte de la banque : score.json. Les percussions et les effets sont synthétisés dans compose_and_encode.py.

Banque : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), fichier et licence partagés dans ../rayquaza/v4-musique-originale/. Rendu local NumPy sans abonnement musical.

Cris de Mew et Mewtwo : [PokéAPI / cries](https://github.com/PokeAPI/cries), fichiers cries/pokemon/latest/151.ogg et 150.ogg, conservés dans audio/ avec la documentation et la licence du dépôt. Le niveau musical baisse sous le cri de Mewtwo. L’explosion, le verre, les scanners, les machines et les scintillements sont synthétisés localement.

## Reproduction et validation

1. node server.cjs — aperçu sur 127.0.0.1:4197 ; bouton de lecture du MP4.
2. node render.cjs — plans de contrôle et assertions de séquence.
3. node render.cjs all — les 960 images temporaires.
4. python compose_and_encode.py — musique, MIDI, mixage et MP4.
5. python contact.py — planche de contrôle depuis les images réellement décodées du film.

Python : av, numpy, Pillow, banque SoundFont partagée ci-dessus. Adapter les chemins de Playwright et Edge dans render.cjs selon la machine. Les images temporaires ne sont pas archivées avec les sources.

Le rendu vérifie les cinq Métamorph normaux, les pixels bleus du chromatique, le noir complet sur l’explosion, les clignotements et le violet du flash. L’encodage vérifie les **960 images**, les horodatages croissants, l’audio complet sans saturation, la présence du véritable cri de Mewtwo à 35 s par corrélation, ainsi que le niveau de l’explosion par rapport au silence précédent. Résultats et empreinte SHA-256 dans validation.json ; contrôles visuels dans render-info.json ; captures du MP4 dans encoded-preview/ et story-contact.jpg.

Le contrôle de jeu sélectionne désormais le portail de la génération du Pokémon (Mewtwo est en génération 1), puis vérifie vidéo, audio, récompense à la fin native, affichage mobile, relecture depuis la fiche et solde de tickets.
