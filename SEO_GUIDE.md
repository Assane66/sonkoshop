# Guide SEO & Performance - Sonko Shop

## 🎯 Configuration Google Search Console

### Étape 1 : Créer un compte
1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Ajouter une propriété"

### Étape 2 : Vérifier votre site
**Option A : Vérification DNS (Recommandé)**
1. Choisissez "Préfixe d'URL" : `https://sonko-shop.com`
2. Sélectionnez "Enregistrement DNS"
3. Copiez l'enregistrement TXT fourni
4. Ajoutez-le dans les paramètres DNS de votre domaine
5. Cliquez sur "Vérifier"

**Option B : Balise HTML**
Ajoutez dans `src/app/layout.tsx` :
```tsx
<head>
  <meta name="google-site-verification" content="VOTRE_CODE_ICI" />
</head>
```

### Étape 3 : Soumettre le Sitemap
1. Dans Search Console, allez dans "Sitemaps"
2. Ajoutez l'URL : `https://sonko-shop.com/sitemap.xml`
3. Cliquez sur "Envoyer"

**Vérification** : Votre sitemap est déjà configuré et accessible à `/sitemap.xml`

---

## 📊 Core Web Vitals - Surveillance

### Métriques Importantes

| Métrique | Bon | À améliorer | Mauvais |
|----------|-----|-------------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100-300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

### Comment Surveiller

#### 1. Google Search Console
- Section "Signaux Web essentiels"
- Données réelles des utilisateurs
- Mises à jour tous les 28 jours

#### 2. PageSpeed Insights
```
https://pagespeed.web.dev/
```
- Testez : `https://sonko-shop.com`
- Obtenez des recommandations spécifiques

#### 3. Lighthouse (Chrome DevTools)
1. Ouvrez Chrome DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionnez "Performance" + "SEO"
4. Cliquez sur "Analyze page load"

---

## 🖼️ Optimisation des Images avec Cloudinary

### Configuration Actuelle
Vos images utilisent déjà Cloudinary : `res.cloudinary.com/dm6yuokre`

### Transformations Automatiques

#### Format : Ajoutez `/f_auto/` dans l'URL
```
Avant : https://res.cloudinary.com/dm6yuokre/image/upload/v1751785241/logo_noqoct.png
Après  : https://res.cloudinary.com/dm6yuokre/image/upload/f_auto/v1751785241/logo_noqoct.png
```
**Gain** : Conversion automatique en WebP/AVIF

#### Qualité : Ajoutez `/q_auto/`
```
https://res.cloudinary.com/dm6yuokre/image/upload/f_auto,q_auto/v1751785241/logo_noqoct.png
```
**Gain** : Réduction de 30-50% de la taille

#### Dimensions Responsives : Ajoutez `/w_auto,c_scale/`
```
https://res.cloudinary.com/dm6yuokre/image/upload/f_auto,q_auto,w_800,c_scale/v1751785241/logo_noqoct.png
```
**Gain** : Images adaptées à la taille d'écran

### URL Complète Optimisée
```
https://res.cloudinary.com/dm6yuokre/image/upload/f_auto,q_auto,w_800,c_scale,dpr_auto/v1751785241/logo_noqoct.png
```

### Mise en Place Automatique

Modifiez `next.config.ts` pour ajouter :
```typescript
images: {
  loader: 'cloudinary',
  path: 'https://res.cloudinary.com/dm6yuokre/image/upload/',
  formats: ['image/avif', 'image/webp'],
}
```

---

## ✅ Checklist SEO Complète

### Technique
- [x] Sitemap XML généré (`/sitemap.xml`)
- [x] Robots.txt configuré (`/robots.txt`)
- [x] Meta tags (title, description)
- [x] Open Graph pour réseaux sociaux
- [x] Favicon et PWA icons
- [ ] Google Search Console vérifié
- [ ] Sitemap soumis
- [ ] Schema.org markup (déjà fait pour Organization)

### Performance
- [x] Images optimisées (Next.js Image)
- [x] Compression activée
- [x] Cache headers configurés
- [ ] Cloudinary transformations appliquées
- [ ] Core Web Vitals < seuils recommandés

### Contenu
- [ ] Descriptions produits uniques
- [ ] Alt text sur toutes les images
- [ ] URLs descriptives (slugs)
- [ ] Titres H1 uniques par page

---

## 🚀 Commandes Utiles

### Tester le Sitemap Localement
```bash
curl http://localhost:9002/sitemap.xml
```

### Build de Production
```bash
npm run build
```

### Déployer sur Firebase
```bash
firebase deploy --only hosting
```

### Analyser le Bundle
```bash
npm run build
# Vérifier .next/analyze/
```

---

## 📈 Objectifs de Performance

| Métrique | Objectif | Actuel | Status |
|----------|----------|--------|--------|
| PageSpeed Score | > 90 | À tester | ⏳ |
| LCP | < 2.5s | À tester | ⏳ |
| FID | < 100ms | À tester | ⏳ |
| CLS | < 0.1 | À tester | ⏳ |
| Taille Images | < 200KB | À optimiser | 🔄 |

---

## 🔗 Ressources

- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

## 📝 Notes Importantes

1. **Après déploiement** : Attendez 24-48h pour voir les données dans Search Console
2. **Sitemap** : Se met à jour automatiquement à chaque build
3. **Images** : Utilisez toujours le composant `<Image>` de Next.js
4. **Cache** : Videz le cache navigateur lors des tests de performance
