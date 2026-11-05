# AYSM COMPTA — sécurité et état de préparation

## État vérifié au 30 octobre 2026

- Projet Supabase `Aysm compta` actif en région `eu-west-1`.
- Authentification Supabase : compte du président confirmé et profil `president`, actif.
- Tables `profiles`, `app_records` et `audit_events` créées; RLS activé sur chacune.
- Fonctions de contrôle d'accès placées dans le schéma `private`; les politiques des tables publiques utilisent ces fonctions.
- Un test SQL d'upsert sous le rôle `authenticated`, avec l'identité du président, a réussi dans une transaction annulée (`ROLLBACK`); aucune donnée de test n'a été conservée.
- Le projet frontend contient le branchement Supabase Auth et une persistance cloud par module. Le chargement et l'enregistrement réels depuis un navigateur ne sont pas encore testés.
- Vérification syntaxique TypeScript/TSX : 38 fichiers parcourus, aucune erreur de syntaxe. Ce contrôle ne remplace pas `npm run lint` ni `npm run build`.
- Le build complet reste bloqué tant que les dépendances npm ne peuvent pas être installées dans l'environnement de travail.
- Le dépôt GitHub cible et l'hébergement public ne sont pas encore alimentés/déployés.

## Rôles de la première version

- Président : seul rôle actif, accès à tous les modules.
- Trésorier et responsable administratif : reportés à une version ultérieure.
- Nouveaux comptes : rôle `pending`, inactif par défaut.
- Aucun mot de passe n'est stocké dans les tables applicatives; l'authentification passe par Supabase Auth.

## Persistance et fonctionnement

- Les données métier sont stockées dans `public.app_records`, sous forme de documents JSONB par module.
- Le journal d'audit est stocké dans `public.audit_events`.
- L'application est conçue pour fonctionner en ligne uniquement. Aucun enregistrement comptable hors ligne ni synchronisation différée n'est promis.
- Les modules sont envoyés en un seul upsert PostgREST groupé afin de réduire les écritures partielles.

## Points à terminer avant toute utilisation comptable réelle

1. Installer les dépendances et réussir `npm run lint` et `npm run build`.
2. Exécuter les tests navigateur : connexion, restauration de session, chargement, création/modification, rechargement et vérification des données dans Supabase.
3. Tester l'expiration de session, la perte de réseau pendant une sauvegarde et les erreurs RLS.
4. Tester l'installation PWA sur Android et vérifier le comportement réseau.
5. Vérifier les calculs comptables, la cohérence des journaux et les exports avec des données de test dédiées.
6. Configurer les sauvegardes et tester une restauration.
7. Activer la protection Supabase contre les mots de passe compromis (alerte Auth `auth_leaked_password_protection`).
8. Publier le code dans le dépôt GitHub cible et déployer le frontend sur un hébergeur HTTPS.

## Configuration client

Utiliser uniquement la clé publique `publishable` dans l'application cliente, avec RLS activé. Ne jamais intégrer `service_role`, une clé secrète ou un mot de passe de base de données dans le navigateur, le dépôt ou un fichier `.env` livré aux utilisateurs.

## Mise à jour 05 novembre 2026 (revue de code)

- Cache `StorageService` en mémoire uniquement (plus de localStorage ni de données démo pour la comptabilité).
- Sauvegarde par module avec contrôle de `revision` (verrouillage optimiste); conflit → blocage + rechargement.
- Sauvegarde atomique : appliquer `supabase/migrations/202611050001_aysm_atomic_save_and_guards.sql` dans l'éditeur SQL Supabase (après sauvegarde). Sans elle, l'application bascule automatiquement sur l'enregistrement module par module (non atomique).
- Le dernier président actif ne peut plus être rétrogradé/désactivé/supprimé (trigger).
- Renouvellement automatique du jeton de session; ouverture de la connexion si la session est expirée.
- `TreasuryManager.tsx` volontairement non modifié (consigne du propriétaire).
- Variables Vercel : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (jamais `service_role`).
