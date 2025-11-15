# Echo.ly

**Slogan :** "Là où chaque rencontre résonne"

Echo.ly est une application de partage de savoir communautaire entre étudiants à Lyon. Elle facilite l’échange de connaissances et la création de connexions entre étudiants autour de sujets variés.

## Démonstration

Le site est accessible ici : [https://m2-application-savoir-dcve.vercel.app/](https://m2-application-savoir-dcve.vercel.app/)

## Technologies utilisées

### Frontend
- **React** : Framework principal pour le développement de l’interface utilisateur.
- **MUI (Material-UI)** : Composants graphiques et design system pour l’interface.

### Backend
- **Node.js** : Serveur et logique métier côté backend.
- **Firebase** : Authentification, base de données, Cloud Functions pour les notifications et hébergement.
- **Swagger** : Documentation interactive de l’API pour tester et comprendre les endpoints.
- **Google Maps API** : Intégration pour cartes interactives, calcul de distances et géolocalisation des activités.

## Objectif du projet

Créer une application intuitive, performante et centrée sur l’utilisateur, combinant UX design et fonctionnalités techniques robustes pour un partage de savoir fluide entre étudiants.

## Fonctionnalités principales

- **CRUD complet des posts de savoir** : création, consultation, modification, suppression.
- **Interactions communautaires** : commentaires, likes, et partage de contenus.
- **Gestion des notifications** : 
  - Notifications en temps réel via Firebase Cloud Functions.
  - Gestion des tokens utilisateurs pour l’envoi et le filtrage des notifications.
- **Authentification** : via Firebase Authentication, sécurisation des données utilisateur.
- **Interface responsive** : adaptée aux mobiles, tablettes et desktop.

## Node.js : commandes principales

Pour installer et lancer le projet en local :  

```bash
# Installer les dépendances
npm install

# Lancer l’application en mode développement
npm start

# Compiler pour la production
npm run build
