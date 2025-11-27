# Guide SEO - Maillots Sénégal CAN 2025

## Objectif
Faire apparaître "Maillot Sénégal Blanc CAN 2025" et "Maillot Sénégal Vert CAN 2025" dans les sitelinks Google.

## ✅ Optimisations Techniques Complétées

### 1. Sitemap (Automatique)
Le sitemap donne maintenant une priorité de **0.95** aux produits Sénégal (vs 0.8 pour les autres).
- Détection automatique basée sur le nom du produit ou le slug
- Google verra ces pages comme plus importantes

## 📝 Actions Requises dans Firestore

### Étape 1: Vérifier/Créer les Produits
Dans Firebase Console → Firestore → Collection `products`:

#### Produit 1: Maillot Sénégal Blanc CAN 2025
```json
{
  "name": "Maillot Sénégal Blanc CAN 2025",
  "slug": "maillot-senegal-blanc-can-2025",
  "category": "MAILLOT",
  "description": "Maillot officiel de l'équipe nationale du Sénégal pour la CAN 2025. Couleur blanche, qualité premium.",
  "price": 8000,
  "promotionPrice": 6000,
  "stock": 50,
  "featured": true,
  "isBonPlan": true,
  "imageUrls": ["URL_de_votre_image"],
  "imageAiHint": "senegal white jersey"
}
```

#### Produit 2: Maillot Sénégal Vert CAN 2025
```json
{
  "name": "Maillot Sénégal Vert CAN 2025",
  "slug": "maillot-senegal-vert-can-2025",
  "category": "MAILLOT",
  "description": "Maillot officiel de l'équipe nationale du Sénégal pour la CAN 2025. Couleur verte, qualité premium.",
  "price": 8000,
  "promotionPrice": 6000,
  "stock": 50,
  "featured": true,
  "isBonPlan": true,
  "imageUrls": ["URL_de_votre_image"],
  "imageAiHint": "senegal green jersey"
}
```

### Étape 2: Optimiser les Produits Existants
Si ces produits existent déjà, assurez-vous qu'ils ont:

1. **`featured: true`** - Pour apparaître sur la page d'accueil
2. **`slug`** optimisé - Doit contenir "senegal" et être descriptif
3. **`name`** exact - Utilisez le nom que vous voulez voir dans Google
4. **`description`** riche - Incluez "CAN 2025", "Sénégal", "maillot officiel"

## 🔗 Prochaines Étapes

### 1. Soumettre le Sitemap à Google
1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez votre propriété (sonkoshop.com)
3. Menu → Sitemaps
4. Ajoutez: `https://sonkoshop.com/sitemap.xml`
5. Cliquez "Envoyer"

### 2. Créer des Liens Internes
Ajoutez des liens vers ces maillots depuis:
- Page d'accueil (section "Produits Vedettes")
- Menu de navigation
- Footer
- Autres pages produits

### 3. Attendre l'Indexation
- **1-2 semaines**: Google re-crawle le site
- **2-4 semaines**: Les sitelinks se mettent à jour
- Vérifiez dans Search Console → Couverture

## 📊 Comment Vérifier

### Dans Search Console
1. Performance → Requêtes
2. Cherchez "maillot sénégal"
3. Vérifiez les impressions et clics

### Dans Google
1. Recherchez: `site:sonkoshop.com maillot sénégal`
2. Vérifiez que vos pages apparaissent
3. Dans 2-4 semaines, cherchez juste "sonkoshop" et vérifiez les sitelinks

## ⚠️ Important

Les sitelinks sont **automatiques** - Google les choisit basé sur:
- Popularité des pages (trafic)
- Structure du site
- Qualité du contenu
- Comportement des utilisateurs

Vous ne pouvez pas les forcer, mais ces optimisations augmentent fortement les chances!
