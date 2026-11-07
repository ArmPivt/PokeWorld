# Carte de dresseur, amis et hébergement

## Fonctionnement

Le profil affiche une grande carte : sprite du dresseur, nom, Pokémon préféré animé, espèces et chromatiques obtenus, progression dans la tour et l’Antre, expéditions et Pokémon vaincus en survie, campagnes et victoires Conquête, clics et énergie Pokéclick, compteurs de combats classiques et d’arène. Les deux derniers compteurs commencent avec cette version ; aucun historique absent n’est inventé.

Modifier ma carte ouvre un éditeur avec nom, Pokémon préféré, recherche et pagination des 646 sprites de dresseurs. Les 14 choix historiques sont conservés ; 632 sprites canoniques du dépôt Smogon sont ajoutés sans modification. Sources, révision et SHA-256 sont dans assets/trainers/catalog/sources.json. Les sprites sont sous les droits de leurs ayants droit ; la licence du code ne transfère pas leurs droits. La liste générée est dans js/trainer-catalog.mjs. La progression et les choix existants restent dans tour-infernale-v1 ; la carte publique et le carnet sont liés au compte Sites signé.

Mes amis permet de chercher un nom ou un identifiant unique nom#suffixe, de demander en ami, accepter/refuser, retrouver les amis après rechargement et inviter un ami dans un raid PeerJS. Deux homonymes sont distingués par leur identifiant. Un joueur doit avoir ouvert son carnet ou enregistré sa carte pour entrer dans l’annuaire. Le site reste privé ; les deux joueurs doivent avoir accès au site. Pour rejoindre un raid, l’hôte doit laisser le salon ouvert. Les invitations et demandes sont persistantes, mais une ancienne invitation ne maintient pas un salon fermé en vie.

## Serveur et données

Le site utilise désormais un Worker ESM et un binding D1 logique DB. Les identités viennent exclusivement de l’en-tête oai-authenticated-user-id fourni par Sites. Aucun mot de passe, jeton utilisateur ou OAuth séparé n’est ajouté. Les routes écrites vérifient l’identité, la cible, le destinataire, l’origine et les doublons ; le nombre de demandes est limité. Les valeurs sont liées aux requêtes SQL. La première migration est drizzle/0000_social.sql et son journal ; ne pas réécrire une migration déployée.

Tables : pw_trainers (carte publique et identité interne), pw_friendships (relation réciproque), pw_requests (demandes et invitations). Les statistiques publiées sont un instantané déclaratif du profil, sans rôle compétitif ou récompense serveur. Les sauvegardes de jeu ne sont pas déplacées dans D1. GET /api/social/health ne fournit qu’un état technique sans données personnelles.

## Sources et lancement

Le client inchangé est déplacé de dist vers dist/client, disposition standard avec dist/server/index.js pour le Worker. Les utilitaires et contrôles existants sont adaptés à cette disposition. Le serveur source est worker/index.mjs ; npm run build le copie vers dist/server/index.js et prépare le manifeste. Les assets client sont conservés à leur URL habituelle. Le site et sa politique d’accès ne changent pas.

npm run dev utilise Node 24, node:sqlite et un cookie d’identité simulé limité à la prévisualisation loopback. Il retire les en-têtes d’identité entrants avant de poser cette identité de test. La base .preview-social.sqlite est ignorée par Git et n’est pas publiée. Les tests unitaires utilisent SQLite en mémoire et ne créent aucune donnée de test dans la base distante.

## Validation

- test:social-api : identités, homonymes, recherche, doublons, acceptation/refus réservés au destinataire, amis réciproques, renommage, invitation et retrait, protection contre les écritures cross-origin.
- test:social-profile : deux contextes navigateur, vraie demande/acceptation et conservation au rechargement, invitation PeerJS et connexion réelle au salon ; carte, nom/sprite/favori persistants, pagination, mobile ; réinvocations simples et ×10 gardant la même session de plein écran et une seule sortie finale.
- Régressions : progression, invocations et premières cinématiques, Antre, raid, contraste des quatre thèmes et rendu mobile.

Les surfaces restantes du menu Conquête utilisent désormais les couleurs du thème. Réinvoquer remplace le contenu de l’invocation en cours sans fermer le dialogue ni demander à nouveau le plein écran ; la fermeture finale restaure la musique et la fenêtre.
