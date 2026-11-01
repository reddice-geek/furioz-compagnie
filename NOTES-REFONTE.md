# Furioz Compagnie — mise à jour visuelle

## Ce qui a changé
- Refonte de l'accueil dans une direction plus actuelle pour un collectif de streamers : fond sombre, accents orange/ambre, typographies modernisées et ambiance graphique liée au logo existant.
- Cartes de membres retravaillées : hiérarchie visuelle, avatars en dégradé, mise en avant du fondateur, effets lumineux au survol, animations d'apparition et ouverture du profil au clic ou au clavier.
- Compteurs membres / places disponibles calculés à partir des membres visibles réellement chargés.
- Lecteur Twitch et chat présentés dans un espace de diffusion plus abouti.
- Menu mobile déroulant et navigation plus fluide.
- Harmonisation du Livre d'or et des pages légales avec le nouveau thème.

## Éléments préservés
- Structure et sections principales : Accueil, Projet, Équipe, Recrutement.
- API et stockage des membres, données de secours et logique de fusion API/secours.
- Fonctionnement du formulaire de candidature, liens Discord et chaînes Twitch / YouTube.
- Panel Admin, sécurité, endpoints API, configuration Vercel et ressources du projet.

## Fichiers modifiés
- `index.html`
- `css/style.css`
- `js/script.js` (rendu des cartes, compteurs, modale et menu mobile ; les endpoints API ne sont pas modifiés)
- `politique-confidentialite.html` (cohérence visuelle de la carte d'information)
