# Invocations, variantes et thèmes

## Présentation

Les invocations occupent le viewport et demandent aussi le plein écran natif lorsque le navigateur l'autorise. La fermeture restaure la musique précédente et ne ferme que le plein écran ouvert par l'invocation. Le décor pixel art est dessiné localement par `dist/js/summon-scene.mjs`. Les particules, anneaux, silhouette noire tournante et révélation utilisent la couleur de rareté : commun argenté, rare bleu, épique violet, légendaire or. Les chromatiques ont un indicateur distinct.

Référence de mise en scène consultée : « Pokémon Champions - Shiny Pokémon Recruitment Animation », EagleOne_hl, 22 secondes, https://www.youtube.com/watch?v=rp7KdOqaIxE . Clairière, silhouette et éclats ont servi de référence visuelle ; aucun extrait vidéo, audio ou asset de cette vidéo n'est distribué.

## Récompenses et passage

Les résultats, tickets, IV et réservations légendaires sont sauvegardés avant la présentation. Passer les révélations ordinaires ne saute jamais les premières rencontres légendaires réservées. Les rencontres différentes d'un même ×10 sont jouées dans l'ordre, une seule fois par espèce. Le propre bouton de passage de la cinématique reste disponible. Un échec vidéo conserve la rencontre en attente. Les récompenses restent acquises, même après rechargement.

## Variantes et thèmes

La bibliothèque affiche une carte par espèce. La fiche permet de sélectionner normal ou chromatique, avec aperçu en lecture seule pour une variante non obtenue. La préférence est sauvegardée ; IV, entraînement, objets et propriété restent séparés entre variantes. Une espèce possédée uniquement en chromatique reste sélectionnable dans les menus de partenaires.

Réglages propose Clair, Nuit étoilée, Tour Infernale et Forêt ancienne. Le thème est appliqué avant le premier rendu et persisté dans la sauvegarde ; les décors des modes et cinématiques conservent leur propre présentation.

## Musique originale

« Sous une pluie d'étoiles », 28 s, 120 BPM, WAV PCM stéréo 48 kHz 16 bits. Composition et enregistrement originaux : celesta, harpe, flûte, cordes, chœur et taiko léger, avec GeneralUser GS 2.0.3 déjà utilisé dans le projet. Aucune mélodie ni aucun enregistrement de la référence n'a été repris.

Sources reproductibles : `compose_music.py`, `sample_renderer.py`, `invocation.mid`, `music.json`. Lancer le script avec NumPy et le SoundFont conservé dans `cinematics/production/rayquaza/v4-musique-originale/GeneralUser-GS.sf2`. Le script écrit le WAV dans ce dossier ; le fichier distribué est `dist/assets/music/invocation.wav`. Le volume, le bouton musique, l'onglet masqué et l'exclusivité sonore des vidéos sont respectés.

## Validation

- `npm run test:ui-refresh` : regroupement, filtres, préférence, IV distincts, migration et musique.
- `npm run test:ui-refresh-browser` : bureau/mobile, plein écran, thèmes persistants, changement de variante, aperçu manquant, passage de tirages simples et ×10, plusieurs premiers légendaires, doublons, passage au milieu d'un lot, animations réduites et restauration sonore.
- Régressions : progression, lecteur vidéo natif, catalogue média et fin native d'une cinématique suivie de sa récompense.
