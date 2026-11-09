# Victini — Le Souffle de la Victoire

Cinématique normale uniquement, 30 secondes, 960 × 540, 24 i/s. Neuf plans, musique originale et véritable cri de Victini à 24,9 s. Relecture depuis la fiche sans ticket ; aucune vidéo normale affectée à la variante chromatique.

## Inspiration et récit original
Les synopsis du film *Noir — Victini et Reshiram / Blanc — Victini et Zekrom* ont servi de référence : tournoi à Eindoak, aide de Victini et Épée du Val. [Synopsis M6](https://www.m6.fr/pokemon-le-film-noir-victini-et-reshiram-p_21384) ; [page Pokémon officielle](https://www.pokemon.com/es/dibujos-animados/peliculas/blanco-victini-y-zekrom). Aucun extrait du film, dialogue ni thème officiel redistribué.

- 0–4 s : panorama du château en forme d’épée et de la ville en fête.
- 4–6,5 s : tournoi original, Pikachu encaisse une attaque de Grolem.
- 6,5–9,5 s : énergie mystérieuse, contre-attaque physique Queue de Fer et victoire. Aucun dégât électrique infligé au type Sol.
- 9,5–12 s : les courants du château deviennent instables.
- 12–19 s : chambre des piliers, barrière magique, courants d’énergie opposés et V lumineux qui brise le sceau.
- 19–22 s : retour du soleil sur la vallée et signe de victoire dans le ciel.
- 22–30 s : retour au festival, apparition de Victini à 24,2 s, cri à 24,9 s, petits sauts et confettis.

## Décors et prompts ImageGen
Créés avec l’outil **ImageGen intégré** : [château](494-castle.png), [festival](494-festival.png), [chambre](494-chamber.png). Prompts exacts : [château](494-castle-prompt.txt), [festival](494-festival-prompt.txt), [chambre](494-chamber-prompt.txt). Ces fonds sont indépendants des sprites et des effets animés Canvas.

## Ressources et musique
Sprites : [PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab), sprite/0494, sprite/0025 et sprite/0076. XML d’animation et crédits d’artistes conservés dans characters/. Cri : [PokéAPI/cries](https://github.com/PokeAPI/cries), cries/pokemon/latest/494.ogg. Pokémon © Nintendo / Creatures / GAME FREAK.

**Le Souffle de la Victoire** : composition originale en majeur, cuivres et cordes, passage plus tendu pour la barrière puis fanfare finale. MIDI, score.wav, soundtrack.wav et repères conservés dans 494/. Aucun sample ni transcription d’un thème officiel. Instruments GeneralUser GS 2.0.3, banque et licence partagées dans ../rayquaza/v4-musique-originale/.

## Reproduction et validation
`node server.cjs` (port 4200), `node render.cjs all`, `python compose_and_encode.py`. Les 720 images temporaires sont exclues du dépôt. `494/validation.json` documente le décodage intégral, l’absence de saturation et la corrélation du cri. Les captures encoded-preview proviennent du MP4 final. Les combats, le V, la barrière, la lumière et les confettis sont réellement animés. Le lecteur masque le chargement et se termine sur la fin native de la vidéo.
