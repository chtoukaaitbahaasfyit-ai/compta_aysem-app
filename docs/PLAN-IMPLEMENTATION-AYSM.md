# Plan d'implémentation AYSM COMPTA

## État exact
- Projet React/TypeScript restauré dans cette archive.
- Migration SQL de base pour profils, rôles et politiques RLS.
- Variables d'environnement Supabase documentées (`VITE_*`).
- Outbox IndexedDB générique ajouté comme fondation du mode hors ligne.
- **Non terminé** : Auth Supabase intégrée à l'écran de connexion, conversion des données des modules vers `app_records`, synchronisation et résolution des conflits, administration des comptes, sauvegardes automatiques et déploiement public.
- Aucun utilisateur créé automatiquement et aucun mot de passe embarqué.

## Ordre obligatoire
1. Créer les comptes réels dans Supabase Auth et appliquer la migration SQL.
2. Activer le premier président uniquement après vérification de son UUID Auth.
3. Remplacer l'authentification locale de démonstration par Supabase Auth et supprimer les sélecteurs de rôle de démonstration.
4. Connecter chaque module avec des règles d'accès serveur; ne pas se fier au masquage de boutons dans React.
5. Synchroniser les opérations hors ligne avec identifiant stable, contrôle de révision et gestion des conflits. Ne retirer une opération de l'outbox qu'après confirmation serveur.
6. Tester avec trois comptes réels et deux navigateurs/téléphones : révocation, mode avion, reprise réseau et historique comptable.
7. Déployer seulement après compilation et tests automatisés.

## Données et sécurité
Ne pas importer les jeux d'essai d'une autre association. Exporter et vérifier les totaux avant toute migration réelle. La clé `publishable` est publique et ne remplace jamais RLS. Ne jamais mettre `service_role`, clé secrète ou mot de passe PostgreSQL dans le navigateur ou Git. Les écritures comptables doivent être archivées, pas supprimées physiquement. Les sauvegardes doivent être chiffrées et leur restauration testée.
