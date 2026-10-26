# MonBudget — guide d'usage du logo

## 1. Le logo

**Idée.** Le m de « Mon » se lit comme deux mois : le premier jambage descend jusqu'en bas (mois bouclé), le second s'arrête en route (mois en cours), et le point vert marque où vous en êtes.

| Version | Fichier | Quand l'utiliser |
|---|---|---|
| Horizontale (principale) | `final/monbudget-horizontal.svg` | En-têtes, site, documents |
| Empilée | `final/monbudget-stacked.svg` | Formats carrés, écran d'accueil, réseaux sociaux |
| Symbole seul | `final/monbudget-symbol.svg` | Avatar, petits espaces, quand le nom est écrit à côté |
| Nom seul | `final/monbudget-wordmark.svg` | Quand le symbole est déjà présent ailleurs sur la page |
| Petite taille | `final/monbudget-symbol-small.svg` | 32 px et moins : trait plus épais, espace plus large avant le point |
| Icône d'app | `final/monbudget-app-icon.svg` | Tuile indigo, m blanc |

Chaque version existe en couleur, `-reversed` (sur fond sombre), `-black` et `-white`. Les PNG sont dans `png/` et les icônes web dans `web/`.

## 2. Zone de protection

Laissez tout autour du logo un espace vide égal à **1 diamètre du point vert**. Cet espace grandit avec le logo : ne le fixez jamais en pixels.

## 3. Tailles minimales

| Version | Écran | Impression |
|---|---|---|
| Horizontale | 96 px de large | 25 mm |
| Empilée | 64 px de large | 18 mm |
| Symbole | 16 px (utilisez la version petite taille) | 6 mm |

## 4. Couleurs

| Nom | HEX | RGB | CMJN (approx.) | Usage |
|---|---|---|---|---|
| Indigo | `#4f46e5` | 79 70 229 | 66 69 0 10 | Le m, « budget », les tuiles |
| Vert (fond clair) | `#10b981` | 16 185 129 | 91 0 30 27 | Le point sur fond clair |
| Vert (fond sombre) | `#34d399` | 52 211 153 | 75 0 27 17 | Le point sur indigo ou sur fond sombre |
| Encre | `#0f172a` | 15 23 42 | 64 45 0 84 | « mon » sur fond clair |
| Indigo clair | `#818cf8` | 129 140 248 | 48 44 0 3 | « budget » sur fond sombre |

Les valeurs CMJN sont des conversions mathématiques. Faites-les valider par l'imprimeur, avec une référence Pantone, avant toute impression.

**Associations validées :** couleur sur blanc ou `#f8fafc` · version `-reversed` sur `#0f172a` ou sur indigo · noir sur blanc · blanc sur photo, sur une zone calme.

Le point vert sur fond blanc a un contraste de 2,5:1. C'est suffisant pour un élément décoratif, mais l'identification repose sur la forme du m, qui fonctionne aussi en une seule couleur.

## 5. Typographie

Le nom « monbudget » n'utilise aucune police : chaque lettre est construite en tracés (trait de 18 unités, terminaisons rondes), donc aucune licence n'est en jeu. Les fichiers SVG gardent des traits (`stroke`). Pour un usage en découpe ou en broderie, vectorisez les contours dans un logiciel de dessin.

## 6. À ne pas faire

Ne pas déformer, pivoter ni recolorer hors palette. Ne pas ajouter d'ombre, de contour ni de dégradé. Ne pas déplacer le point ni le coller au jambage. Ne pas réécrire le nom avec une police. Ne pas poser le logo sur un fond chargé sans tuile.

## 7. Animation

Le loader de `app.html` (CSS, dans `style.css`) et les fichiers Lottie de `motion/` suivent la même chronologie :

| Temps | Ce qui se passe | Easing |
|---|---|---|
| 0,08 → 0,68 s | Le 1er mois se trace en entier | `cubic-bezier(0.65, 0, 0.35, 1)` |
| 0,48 → 0,86 s | Le 2e mois se trace et s'arrête en cours | `cubic-bezier(0.33, 0, 0.2, 1)` |
| 0,82 → 1,34 s | Le point se détache du trait, tombe, s'écrase un peu, se pose | gravité puis `cubic-bezier(0.2, 0, 0, 1)` |
| 1,00 → 1,42 s | Le nom monte de 8 px en apparaissant | `cubic-bezier(0.2, 0, 0, 1)` |
| 1,22 s → fin | Une onde part du point, en boucle tant que l'app charge | `cubic-bezier(0.2, 0, 0, 1)` |
| Sortie | Fondu de 0,38 s, le symbole avance légèrement | `cubic-bezier(0.4, 0, 1, 1)` |

L'easing signature est `cubic-bezier(0.2, 0, 0, 1)`. Avec « réduire les animations » activé dans le système, le logo apparaît directement, sans tracé ni boucle.

Fichiers Lottie : `motion/monbudget-loader.json` (fond clair) et `motion/monbudget-loader-dark.json` (fond sombre). Aperçu : `motion/index.html`.

## 8. Avant un dépôt de marque

Faites une recherche d'antériorité (INPI, EUIPO, recherche d'image inversée). Ce kit ne garantit pas que le logo est libre de droits.
