# XEN+ — téléchargeur TikTok

Site statique (HTML/CSS/JS vanilla) + une fonction serverless Vercel (`/api/tiktok.js`) qui sert d'intermédiaire vers la source d'extraction. Rien à builder, Vercel détecte le dossier `api/` automatiquement.

## Structure

```
index.html          page principale
privacy.html         politique de confidentialité (à compléter)
terms.html            CGU (à compléter)
favicon.svg          favicon provisoire, à remplacer
css/style.css        styles (glassmorphism, thème sombre)
js/app.js             logique front : appel API, rendu du résultat, historique local
api/tiktok.js          fonction serverless : proxy vers la source d'extraction
vercel.json            config Vercel (URLs propres)
```

## Déploiement sur Vercel

1. Pousse ce dossier vers un dépôt GitHub (via l'appli GitHub ou MT Manager + git).
2. Sur vercel.com, "Add New Project" → importe le dépôt.
3. Framework preset : "Other" (aucun build nécessaire, laisse les commandes vides).
4. Déploie. La fonction `api/tiktok.js` est automatiquement disponible sur `/api/tiktok`.

Aucune variable d'environnement n'est requise pour l'instant (la source d'extraction utilisée est publique et sans clé).

## Avant de lancer publiquement

- [ ] Brancher un nom de domaine perso dans les réglages du projet Vercel.
- [ ] Remplacer `favicon.svg` par un vrai favicon de marque.
- [ ] Compléter `privacy.html` et `terms.html` (contact, réseau publicitaire utilisé une fois choisi).
- [ ] Remplacer les deux blocs `.ad-slot` dans `index.html` par le script du réseau publicitaire retenu.
- [ ] Vérifier la forme réelle de la réponse de la source d'extraction dans `api/tiktok.js` — les noms de champs (`video`, `audio`, `thumbnail`, `title`, `author`) sont lus de façon défensive mais n'ont pas été confirmés contre une réponse réelle en production.

## Historique

L'historique des téléchargements est stocké uniquement dans le `localStorage` du navigateur, par appareil. Il n'y a pas de compte ni de base de données : si tu veux un historique partagé entre appareils plus tard, ça demandera un backend avec une base (MongoDB, comme sur tes autres projets).

## Limite connue

Le téléchargement direct via l'attribut `download` peut ne pas forcer l'enregistrement selon l'origine du fichier vidéo renvoyé par la source (restrictions cross-origin classiques des navigateurs). Si ça arrive, la fonction serverless peut être étendue pour streamer le fichier elle-même plutôt que de renvoyer l'URL source directement.
