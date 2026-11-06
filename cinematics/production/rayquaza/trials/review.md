# Essai vidéo local — 6 novembre 2026

Verdict : refusé pour la production. Le moteur produit une vraie vidéo animée, mais cet essai ne conserve pas suffisamment la forme des Pokémon ni la netteté du pixel art.

## Résultat examiné

Fichier : wan22-v2-motion-trial.mp4. 768 × 448, 49 images, 24 i/s, 2,04 secondes, sans audio. Rendu terminé avec succès en 107,73 secondes. La planche de contrôle échantillonne huit moments du début à la fin ; les images 0, 24 et 48 sont également conservées.

L'océan, la pluie et l'orage s'animent. Groudon change légèrement de pose. Kyogre subit une déformation importante : ses nageoires s'allongent et son corps devient difficile à reconnaître. Les détails passent d'un pixel art net à un rendu plus lisse et instable. Aucune apparition de Rayquaza n'a été produite : ce test ne couvre que le plan d'ouverture.

Le premier essai, 512 × 288 avec conversion du modèle en FP8 et décodage en blocs, présentait de gros artefacts colorés. Le second utilise les poids de diffusion FP16 d'origine et le décodage natif : les artefacts disparaissent largement, mais la fidélité des créatures reste insuffisante. Ces changements ont été faits ensemble ; ce test ne permet pas d'attribuer chaque amélioration à un seul réglage.

## Reproduction

ComfyUI 0.44.0, commit 2f8943324e1eae89a5ee6c7db93602299246b5f1 ; PyTorch 2.14.1+cu130 ; NVIDIA RTX 5060 Laptop 8 Go ; Wan 2.2 TI2V 5B FP16 ; UMT5 XXL FP8 officiel ; Wan 2.2 VAE BF16. 20 étapes, CFG 5, uni_pc/simple, shift 8, seed 3842026. Le workflow exact et les empreintes des modèles accompagnent cet essai.

Sources officielles : https://docs.comfy.org/tutorials/video/wan/wan2_2 ; https://github.com/Comfy-Org/ComfyUI ; https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json

## Statut

Essai local uniquement, absent du catalogue de cinématiques. Aucun déploiement, aucun achat, aucun crédit Runway consommé. Le site reste privé. Ce résultat ne valide pas la production des cinématiques légendaires demandées.
