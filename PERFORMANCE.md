# Guide d'Optimisation des Performances - Sonko Shop

## 🎯 Optimisations Implémentées

### 1. Configuration Next.js (`next.config.ts`)
✅ **Optimisation des images**
- Formats modernes (AVIF, WebP)
- Cache de 1 an pour les images
- Tailles d'images optimisées

✅ **Compression activée**
- Gzip/Brotli automatique

✅ **Headers de cache**
- Cache immutable pour les assets statiques
- Cache long terme pour `_next/static`

✅ **Optimisation des packages**
- Tree-shaking pour `lucide-react` et `recharts`
- Suppression des console.log en production

### 2. Optimisation des Polices (`layout.tsx`)
✅ **Font Display Swap**
- Évite le blocage du rendu
- Améliore le FCP (First Contentful Paint)

## 📊 Gains Attendus

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Images | 3 215 Kio | ~800 Kio | **75%** |
| JavaScript | 155 Kio inutilisé | ~50 Kio | **68%** |
| Cache | 0 ms | 31536000s | **∞** |
| LCP | Lent | Rapide | **40%** |

## 🚀 Prochaines Étapes Recommandées

### Déploiement (CRITIQUE)
```bash
# Option 1: Vercel (Recommandé)
npm install -g vercel
vercel

# Option 2: Firebase
npm run build
firebase deploy --only hosting
```

### Optimisations Supplémentaires

1. **Lazy Loading des composants lourds**
```tsx
const Chart = dynamic(() => import('recharts'), { ssr: false });
```

2. **Preload des ressources critiques**
Ajouter dans `layout.tsx`:
```tsx
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="dns-prefetch" href="https://res.cloudinary.com" />
```

3. **Service Worker pour le cache**
```bash
npm install next-pwa
```

## 🔧 Configuration Firebase (si utilisé)

Créer `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|avif)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

## ✅ Checklist de Déploiement

- [x] Configuration Next.js optimisée
- [x] Polices optimisées
- [ ] Déployer sur Vercel/Firebase
- [ ] Configurer le domaine personnalisé
- [ ] Activer HTTPS
- [ ] Tester avec Lighthouse
- [ ] Configurer Google Analytics (optionnel)

## 📈 Monitoring

Après déploiement, vérifier:
1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

## 🎓 Ressources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Vercel Deployment](https://vercel.com/docs)
