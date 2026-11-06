# Le Sillage Émeraude

Musique originale écrite pour la cinématique Rayquaza de PokéWorld : 21,625 secondes, stéréo 48 kHz. Cordes, contrebasses, cors, chœurs, harpe, timbales et cuivres. Les 240 notes sont conservées en MIDI et dans le script de composition.

## Rendu

- `rayquaza-musique-originale.mp4` : cinématique avec la nouvelle musique, les effets synchronisés et le cri de Rayquaza.
- `le-sillage-emeraude-score.wav` : musique seule.
- `rayquaza-mix-orchestral.wav` : mixage complet avec bruitages et cri.
- `le-sillage-emeraude.mid` : partition MIDI éditable.
- `compose_score.py` : composition et rendu local des zones de samples SoundFont avec NumPy.
- `mix_film.py` : mixage et assemblage de l'audio avec la vidéo précédente.
- `score.json` : instruments, repères musicaux et provenance des sons.
- `validation.json` : contrôles effectués sur le fichier MP4 final.

## Repères

- 0 s : motif orchestral tendu pendant le duel.
- 6 s : retrait des percussions, harpe et chœurs au Pilier Céleste.
- 8,6 s : montée des cordes et des cors ; accélération du roulement des timbales à l'approche de l'arrivée.
- 16,52 s : résolution en ré majeur synchronisée avec le grand flash vert.
- 16,85 s : baisse du mix musical sous le cri de Rayquaza, conservé à son emplacement initial.
- 18,75 s : retour progressif du niveau musical et cadence finale.

## Création et provenance

La vidéo YouTube fournie par l'utilisateur est intitulée « Pokémon Omega Ruby & Alpha Sapphire - Rayquaza's Entrance (HQ) », publiée par Pokeli : https://www.youtube.com/watch?v=8lrMjcNJGfE . Elle sert de référence d'ambiance générale. Aucun audio, sample, MIDI, transcription ou mélodie de cette vidéo n'est utilisé dans cette composition. Il s'agit d'une nouvelle composition, et non d'un remix du thème officiel.

Instruments : GeneralUser GS 2.0.3, S. Christian Collins, https://github.com/mrbumpy409/GeneralUser-GS . Banque et licence complète conservées dans ce dossier. La licence autorise l'emploi dans les créations musicales privées ou commerciales ; se référer au texte complet pour ses conditions et précisions.

Le cri est repris du montage précédent, avec sa provenance PokéAPI/cries et sa documentation dans `../v3-retour-baie/audio/`. La nouvelle musique ne modifie pas les droits éventuels sur les autres éléments Pokémon du projet.

## Reproduction

Python 3 avec `numpy`, `Pillow`, `av` (PyAV). Aucun abonnement ni service de génération musicale payant requis. Aucun binaire FluidSynth requis.

1. `python compose_score.py` : génère la partition MIDI et la musique WAV depuis la banque jointe.
2. `python mix_film.py` : emploie la cinématique et le cri conservés dans `../v3-retour-baie/` pour créer le nouveau MP4.

Le flux H.264 de la vidéo est recopié sans réencodage : sa somme SHA-256 est vérifiée identique, puis le MP4 est intégralement décodé pour contrôler les 519 images et l'audio. La présence du cri à 16,85 s est vérifiée par corrélation avec sa source, après compression AAC.

Cette version est une proposition locale. Elle n'a pas été publiée sur le site.
