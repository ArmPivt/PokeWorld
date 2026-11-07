# Les gardiens des lacs et la Chaîne Rouge

Cinématiques normales de **Créhelf (480), Créfollet (481), Créfadet (482)**. Chaque vidéo : **30 secondes, 960 × 540, 24 images/s**, musique originale, effets stéréo et vrai cri intégrés.

## Scénario

| Temps | Plan |
| --- | --- |
| 0–2 s | Lac Savoir enneigé, une lueur dorée s’élève près de la caverne. |
| 2–4 s | Lac Vérité au crépuscule, lueur rose et reflets paisibles. |
| 4–6 s | Lac Courage dans le vent, lueur bleue sur les vagues. |
| 6–11 s | Les trois silhouettes convergent vers des ruines de montagne. Leurs lueurs assemblent une Chaîne Rouge à 42 maillons entrelacés. |
| 11–16 s | Retour au lac du Pokémon obtenu, approche de sa caverne et dernière résonance de la chaîne. |
| 16–21 s | Créhelf : ombre et signes géométriques dorés ; Créfollet : ombre et reflets roses pulsants ; Créfadet : ombre et colonne de lumière bleue traversant les courants. |
| 21–30 s | Révélation du gardien en couleurs, animation native, aura propre à chacun et vrai cri à 22,7 s. |

Les onze premières secondes ont des images et un master PCM identiques dans les trois films. Les trois silhouettes du plan commun sont entièrement teintées ; la révélation colorée du Pokémon obtenu commence après 21,2 s. Les yeux fermés de Créhelf restent ceux du sprite d’origine, sans remplacement. Les ancrages corporels sont stables entre les huit poses et les deux queues restent dans le cadre.

## Références

- [Présentation officielle de Sinnoh](https://diamondpearl.pokemon.com/fr-fr/story/) : trois lacs, Créhelf être du savoir, Créfollet être de l’émotion, Créfadet être de la volonté.
- [Les gardiens des lacs, Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lake_guardians) : Créhelf au lac Savoir, Créfollet au lac Vérité, Créfadet au lac Courage.
- [La Chaîne Rouge, Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Red_Chain) : lien avec les trois gardiens ; fabrication à partir de leurs dons dans Légendes Pokémon : Arceus.

La convergence des lueurs aux ruines et la résonance dans les lacs sont une **adaptation originale pour PokéWorld**, pas une scène revendiquée comme canonique. Aucun extrait vidéo ou musical officiel repris. Détails dans `references.json`.

## Décors et sprites

Quatre décors générés avec **ImageGen intégré** : `acuity.png`, `verity.png`, `valor.png`, `pillar.png`. Prompts exacts `*-prompt.txt` et provenance `backdrops.json`. Les décors sont dépourvus de Pokémon et de chaîne peinte ; tout est animé par-dessus en Canvas.

Sprites natifs : [PMDCollab / SpriteCollab](https://github.com/PMDCollab/SpriteCollab), espèces 0480, 0481 et 0482. Atlases `Idle-Anim.png` et `Walk-Anim.png` enregistrés sous leurs noms courts ; XML des durées et crédits dans `characters/`. La Chaîne Rouge utilise des maillons biseautés, avec alternance de faces et d’arêtes, ordre de profondeur et assemblage progressif. Les lueurs, neige, eaux, signes, reflets, courants, colonne bleue, éclats et révélations sont animés en Canvas. `film.mjs` concatène `prefix.mjs`, `shared.mjs`, `scenes.mjs`.

## Musiques et effets

Trois partitions originales avec un même motif d’introduction :

- **Les Liens du savoir** : célesta, harpe, flûte et cordes calmes.
- **Le Reflet de l’émotion** : harpe, flûte, cordes, chœur et pulsations douces.
- **La Force de la volonté** : cordes rythmiques, cuivres, percussions et souffle d’eau.

Vents, eaux, tintements des maillons et pulsations magiques synthétisés localement. Sources éditables : `*-score.mid`, `*-score.json`, masters `*-soundtrack.wav`, script `compose_and_encode.py`. Banque **GeneralUser GS 2.0.3** et licence partagées dans `../rayquaza/v4-musique-originale/`. Vrais cris : [PokéAPI / cries](https://github.com/PokeAPI/cries), inclus dans `audio/` avec documentation. La musique et les effets s’atténuent sous le cri. Aucune mélodie ou prise musicale officielle copiée.

## Reproduction et contrôles

1. `node server.cjs` sert `http://127.0.0.1:4202/?id=480` (ou 481, 482).
2. `node render.cjs 480 all` produit 720 images temporaires ; répéter pour chaque espèce. Sans `all`, plans de contrôle.
3. `python compose_and_encode.py 480` compose et encode le film ; répéter pour 481 et 482. Python : PyAV, NumPy, Pillow, banque partagée.
4. `python contact.py` produit les planches depuis les images réellement décodées.

Adapter les chemins Playwright et Edge dans le script de rendu selon la machine. Les dossiers temporaires `frames/` ne sont pas archivés. Les rapports `*-render-info.json`, `*-validation.json` et `shared-intro-validation.json` contrôlent sept plans, chaîne complète de 42 maillons, bon lac personnel, silhouette avant couleur, toutes les poses et queues dans le cadre, 720 images décodées à horodatages croissants, audio stéréo sans saturation et cris par corrélation. L’introduction commune est comparée sur 264 images et onze secondes de PCM. Les tests du jeu couvrent invocation, récompense, audio, fin native, retour à l’obtention, relecture et affichage mobile. Seules les variantes normales sont enregistrées.
