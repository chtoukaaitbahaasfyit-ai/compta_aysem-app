# AYSM COMPTA — tests Auth/RLS avant mise en production

## Etat de cette livraison
- L'écran de connexion appelle Supabase Auth (`grant_type=password`).
- La session est conservée localement et renouvelée à l'expiration.
- Le profil et le rôle sont lus depuis `public.profiles`; aucun rôle n'est accepté depuis le navigateur.
- Les comptes sans rôle valide ou désactivés sont refusés.
- Les comptes de démonstration et les sélecteurs permettant de changer de rôle ont été retirés.
- Les contrôles d'approbation dans l'interface ne reconnaissent plus de rôle `admin`.

## Prérequis opérateur
1. Appliquer la migration `supabase/migrations/202610300001_aysm_security_foundation.sql` dans le SQL Editor du projet Supabase.
2. Dans Authentication, créer le compte du président avec son adresse réelle.
3. Copier son UUID depuis Authentication > Users et exécuter, en remplaçant la valeur :

```sql
update public.profiles
set role = 'president', is_active = true
where id = '<UUID_AUTH_DU_PRESIDENT>';
```

4. Créer les comptes du trésorier et du responsable administratif dans Auth. Le président leur attribue leur rôle et `is_active=true` dans `public.profiles`.
5. Définir `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans l'environnement de build.

## Matrice de tests manuels RLS
Avec trois comptes réels distincts, vérifier dans l'application et dans l'API REST :
- Président : lecture/écriture des trois familles de modules et gestion des profils.
- Trésorier : accès aux modules financiers; refus de lecture/écriture des modules administratifs.
- Responsable administratif : accès aux modules administratifs; refus de lecture/écriture des modules financiers.
- Compte pending/inactif : aucune lecture de `app_records` et refus d'accès à l'application.
- Anonyme : aucune lecture/écriture des tables privées.
- Aucun utilisateur authentifié ne peut supprimer une écriture ou un événement d'audit.

## Limites bloquantes restantes
La synchronisation des données comptables de l'interface avec `app_records` n'est pas encore intégrée. La file IndexedDB existante n'est pas branchée à un adaptateur Supabase. Les données locales de démonstration ne doivent donc pas être considérées comme sauvegardées dans le cloud. Les tests d'intégration réels restent à exécuter après application de la migration et configuration des comptes.
