# Jirachi — Mille vœux sous les étoiles

Cinématique de 27 secondes en six plans, pixel art 960 × 540 à 24 images/seconde. Film H.264/AAC réel, décors ImageGen intégrés, animation déterministe Canvas, sprites Jirachi animés et musique originale. Version normale uniquement : aucun film normal réutilisé pour la variante chromatique.

## Découpage

| Temps | Plan |
| --- | --- |
| 0–5,5 s | Fin d’un compteur astronomique : 0994, 0995… 0999 puis **1000 à 3,72 s**. Chiffres défilants, éclairage doré et étincelles à l’arrivée. |
| 5,5–11,5 s | Trois habitants sur une colline observent des étoiles filantes, les mains jointes. « Je fais un vœu… ». À 10,6 s, une étoile plus imposante entre dans le ciel. |
| 11,5–16,5 s | Plan large : l’immense étoile traverse le ciel avec une longue traînée lumineuse et des particules. |
| 16,5–20,2 s | La caméra poursuit l’étoile et zoome sur son noyau ; les étoiles environnantes s’étirent et la lumière augmente. |
| 20,2–22 s | Flash blanc puis apparition progressive de Jirachi dans un halo étoilé. |
| 22–27 s | Cri de Jirachi à 22 s, pose animée puis flottement au milieu des scintillements et fondu final. |

## Musique et son

**Mille vœux sous les étoiles** : nouvelle composition originale de 201 notes, harpe, célesta, glockenspiel, flûte, cordes, chœur et nappe douce. Début suspendu pendant le compteur, mélodie du vœu, montée pendant le passage de l’étoile et résolution au flash. Le niveau musical baisse sous le cri à 22 s.

Référence d’ambiance fournie par l’utilisateur : [Jirachi's Theme — The Pokemon Themes](https://www.youtube.com/watch?v=i8mwels9lZ4), 35 secondes. Comme annoncé pendant le travail, le morceau livré est une composition originale dans cette ambiance, **pas un remix du thème officiel**. Aucun audio, sample, MIDI ou transcription de cette vidéo n’est inclus dans le film ni dans les sources du jeu. Les métadonnées de la référence sont conservées dans reference-metadata.json.

Partition éditable : mille-voeux.mid. Musique seule : mille-voeux-score.wav. Mix complet : jirachi-soundtrack.wav. Composition et mixage : compose_and_encode.py. Repères et instruments : score.json.

Instruments : [GeneralUser GS 2.0.3, S. Christian Collins](https://github.com/mrbumpy409/GeneralUser-GS), banque et licence partagées dans ../rayquaza/v4-musique-originale/. Rendu local NumPy ; aucun abonnement ni outil musical payant.

Cri : [PokéAPI / cries](https://github.com/PokeAPI/cries), cries/pokemon/latest/385.ogg, documentation et licence du dépôt conservées dans audio/. Les petits tintements, mouvements et souffle de l’étoile sont synthétisés localement.

## Images et sprites

Décors créés avec **ImageGen intégré**, mode génération : counter.png, watchers.png et sky.png. Prompts exacts dans counter-prompt.txt, watchers-prompt.txt, sky-prompt.txt et backdrops.json. Les chemins historiques de génération sont documentés ; les ressources utilisées sont toutes locales dans ce dossier. Les chiffres, les étoiles filantes, le zoom, le flash et les particules sont animés par Canvas.

Sprites : [PMDCollab / SpriteCollab, espèce 0385](https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0385). Planches originales, XML des durées et crédits conservés dans characters/385/. Le film utilise Idle et Pose, les autres animations téléchargées restent disponibles dans les sources. La pose respecte les dimensions et durées des sprites ; aucune modification de palette n’est appliquée.

## Reproduction et validation

1. node server.cjs — serveur local sur 127.0.0.1:4193 ; la page permet de lire le film encodé.
2. node render.cjs — images de contrôle et assertions du compteur.
3. node render.cjs all — les 648 images temporaires.
4. python compose_and_encode.py — composition, MIDI, mixage, MP4, poster et validation.

Python : av, numpy, Pillow ; banque SoundFont partagée ci-dessus. Adapter les chemins Playwright et Edge dans render.cjs sur une autre machine. Les images temporaires frame par frame ne sont pas archivées.

Les 648 images et l’audio ont été intégralement décodés ; horodatages croissants, pas de saturation, empreinte SHA-256 du MP4, et corrélation du véritable cri à 22 s vérifiés. Résultats dans validation.json. story-contact.jpg montre les plans ; encoded-preview/ contient des captures du MP4 final. Le test de jeu vérifie l’invocation, la récompense après la fin native, le format mobile, la relecture depuis la fiche et l’absence de nouvelle dépense de ticket pour la relecture.
