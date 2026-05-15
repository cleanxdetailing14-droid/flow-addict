# FL0W.addict — Plateforme de formation

## Structure du projet

```
flow-addict/
├── index.html                          ← Frontend complet (login + admin + étudiant)
├── package.json                        ← Dépendances
├── netlify.toml                        ← Config Netlify
├── drizzle.config.ts                   ← Config base de données
├── db/
│   ├── schema.ts                       ← Schéma tables (students + courses)
│   └── index.ts                        ← Connexion DB
└── netlify/
    ├── functions/
    │   ├── lib/
    │   │   └── auth.ts                 ← JWT + hashage passwords
    │   ├── login.ts                    ← POST /api/login
    │   ├── courses.ts                  ← CRUD /api/courses
    │   └── students.ts                 ← CRUD /api/students
    └── database/
        └── migrations/
            └── 0000_migration.sql      ← Création tables SQL
```

## Déploiement sur Netlify (recommandé)

1. Push ce dossier sur GitHub
2. Connecte le repo sur netlify.com → "Add new site"
3. Dans les variables d'environnement Netlify, ajoute :
   - `JWT_SECRET` → une chaîne aléatoire longue (ex: `mon-secret-super-long-2025`)
   - `ADMIN_EMAIL` → `cleanxdetailing14@gmail.com`
   - `ADMIN_PASSWORD` → ton mot de passe admin
4. Active **Netlify DB** dans l'onglet "Integrations" de ton site
5. Lance la migration SQL depuis l'onglet Database → SQL Editor (colle le contenu de `0000_migration.sql`)
6. Deploy !

## Connexion admin
- Email : `cleanxdetailing14@gmail.com`
- Mot de passe : celui défini dans `ADMIN_PASSWORD`

## Déploiement sur Hostinger

Hostinger ne supporte pas les Netlify Functions nativement.
Pour Hostinger, il faudrait réécrire le backend en PHP ou utiliser un serveur Node.js séparé.
**Netlify est fortement recommandé** — c'est gratuit et tout est préconfiguré.
