# AYSM COMPTA

Application web de gestion comptable pour l’association A.Y.S.M à Sidi Bibi.

## Première version — accès président uniquement

- Authentification Supabase Auth.
- Le compte `Lahsencherkaoui2@gmail.com` est activé avec le rôle `president`.
- Le président est le seul rôle actif et dispose de toutes les fonctions de gestion.
- Les rôles trésorier et responsable administratif sont réservés à une phase ultérieure.
- Les nouveaux comptes restent `pending` et inactifs jusqu'à activation par le président.
- Données comptables stockées dans Supabase `public.app_records`, protégées par RLS.
- Journal d'audit dans `public.audit_events`.
- Application en ligne uniquement : les opérations sont refusées quand le navigateur est hors ligne; aucun mécanisme de synchronisation différée n'est prévu.
- PWA installable via le manifeste web; les anciens service workers de mise en cache sont désactivés.

## Configuration

Le projet utilise la clé publishable Supabase (clé publique conçue pour le navigateur). Les autorisations reposent sur RLS. Ne jamais ajouter une clé `service_role` ou une clé secrète dans le frontend.

Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` peuvent remplacer les valeurs par défaut du projet.

## Modules persistés

`association_profile`, `fiscal_years`, `accounts`, `entries`, `recettes`, `depenses`, `disbursements`, `bank_accounts`, `subventions`, `projects`, `budgets`, `immobilisations`, `members`, `documents`, `volunteers`, `in_kind`.

Chaque module est enregistré comme un document JSONB unique dans `app_records`; les modules sont envoyés par un upsert groupé. Les évolutions de schéma métier normalisé et les tests de rapprochement comptable restent à valider avant une mise en production comptable.

## Vérification locale

```bash
npm install
npm run lint
npm run build
```

**État :** la structure Supabase, le rôle président, les politiques RLS et un test SQL d’upsert avec `ROLLBACK` sont vérifiés. Les 38 fichiers TypeScript/TSX passent le contrôle syntaxique. Le build, les tests navigateur et le déploiement restent à effectuer avant toute utilisation de données financières réelles. Voir `docs/SECURITY-AND-DEPLOYMENT-STATUS.md`.
