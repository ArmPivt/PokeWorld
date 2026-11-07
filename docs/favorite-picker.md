# Pokémon préféré : sélection visuelle

Modifier ma carte propose désormais les Pokémon réellement obtenus, avec sprite animé, recherche par nom ou numéro (insensible aux accents), pagination de 24 espèces et une seule carte par espèce. Les boutons Normal et Chromatique ne sont proposés que pour les apparences possédées. La miniature du compagnon choisi est visible dans l’éditeur ; après Enregistrer ma carte, il apparaît sur la grande carte et reste sélectionné au rechargement.

Le choix est validé contre la collection au clic et à l’enregistrement. Une ancienne préférence non obtenue reçoit un choix disponible dans le brouillon, sans modifier le profil enregistré tant que l’utilisateur n’a pas sauvegardé. Annuler conserve l’ancien profil. La recherche et les changements de page/sprite de dresseur préservent le nom et la préférence en cours.

Sources : js/favorite-picker.mjs et player-profile.mjs, styles dans social-profile.css. Aucun nouveau sprite téléchargé, les ressources de la collection existante sont réutilisées. Aucun changement de base de données ou de politique d’accès.

Validation : test:favorite-picker couvre collection obtenue uniquement, variantes groupées et disponibles, recherche accentuée/numérique, absence des Pokémon non obtenus, sauvegarde/rechargement, annulation, pagination et mobile. test:social-profile est adapté à la nouvelle sélection et vérifie aussi carte, amis et réinvocations.
