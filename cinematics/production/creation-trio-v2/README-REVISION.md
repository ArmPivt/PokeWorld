# Dialga et Palkia — transitions révisées

Deux films de 32 secondes, version 2. Les décors, sprites et plans finaux sont conservés ; Giratina conserve intégralement son film v1.

## Dialga

- 0–4,25 s : rituel de la Chaîne Rouge.
- 4,25–5,25 s : image arrêtée, musique coupée.
- 5,25–6,25 s : apparition de l’horloge, tic-tac discret.
- 6,25–10,5 s : la scène parcourt réellement son temps à rebours de 4,25 à 0 ; les échantillons audio du début sont joués dans l’ordre inverse, à vitesse normale. Les aiguilles tournent à l’envers.
- 10,5–11 s : flash blanc.
- Dès 11 s : arrivée dans la dimension de Dialga, sans retour au rituel.

## Palkia

- Dès 4,25 s : fissures ramifiées à la surface de l’image.
- 6,3–8 s : le plan éclate en 80 fragments triangulaires qui s’écartent et tournent sur fond blanc.
- 8–8,5 s : blanc pur.
- 8,5–11 s : la dimension spatiale se révèle par un fondu lent depuis le blanc, avec reprise progressive du thème.

Les deux apparitions restent à 24 s, suivies du cri à 25,4 s. Les MP4 sont encodés en 960×540, 24 images/s, H.264/AAC stéréo. Les posters restent dans le début de la Chaîne Rouge, sans révéler le légendaire.

Les décors sont ceux générés avec imagegen pour creation-trio-v1 ; prompts et crédits y sont conservés. Aucun nouveau décor généré dans cette révision.

`transitions-check.cjs` vérifie l’égalité pixel à pixel des images arrêtées, les temps décroissants jusqu’à zéro, la présence de l’horloge et du blanc pur, les fragments mobiles, le fondu progressif et la continuité de la dimension. `encode_revision.py` vérifie les 768 images décodées, le silence réel de Dialga, la corrélation de l’audio inversé, les cris et l’absence de saturation. `revision_audio.py` génère ce dernier script de manière reproductible à partir de l’encodeur v1.
