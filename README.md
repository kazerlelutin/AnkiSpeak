# ROADCAST OVERLAY

Système de gestion d'overlays pour la diffusion en direct (streaming/broadcasting). Application web locale permettant de contrôler des éléments visuels en temps réel via une interface simple et intuitive.

## 🚀 Lancement

### Version exécutable (recommandée)

```bash
./roadcast_layout.exe
```

### Mode développement

```bash
# Installation des dépendances
bun install

# Lancement en mode développement
bun run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure des overlays

### Templates personnalisés

Placez vos overlays personnalisés dans le dossier `data/custom/`. Les templates dans `data/templates/` sont uniquement des exemples.

### Structure d'un overlay

Chaque fichier HTML d'overlay doit contenir :

```html
<div
  class="mon-overlay"
  description="Description de l'overlay"
  title="Nom de l'overlay"
  script="start_mon_overlay, stop_mon_overlay, action_mon_overlay"
  tag="tag1, tag2, tag3"
  inputs="text:nom_input,number:valeur_input"
>
  <!-- Contenu HTML de l'overlay -->
</div>

<script>
  function start_mon_overlay() {
    // Fonction de démarrage
  }

  function stop_mon_overlay() {
    // Fonction d'arrêt
  }

  function action_mon_overlay() {
    // Autres actions
  }

  // Exposer les fonctions globalement
  globalThis.start_mon_overlay = start_mon_overlay
  globalThis.stop_mon_overlay = stop_mon_overlay
  globalThis.action_mon_overlay = action_mon_overlay
</script>

<style>
  /* Styles CSS - Utilisez "em" pour garantir la compatibilité preview */
  .mon-overlay {
    font-size: 1em;
    /* ... */
  }
</style>
```

## 🎯 Bonnes pratiques

### Nommage des fonctions

- **Utilisez un suffixe unique** pour vos fonctions (ex: `start_mon_overlay`, `stop_mon_overlay`)
- L'interface n'affiche que la première partie avant le `_` pour éviter les conflits
- Exemple : `start_breaking_news` → affiché comme "start" dans l'interface

### Unités CSS

- **Utilisez "em"** pour toutes les tailles afin de garantir la compatibilité avec la preview
- Le système s'adapte automatiquement à différentes résolutions (base 1920x1080)

### Métadonnées

- `title` : Nom affiché dans l'interface
- `description` : Description de l'overlay
- `script` : Liste des fonctions disponibles (séparées par des virgules)
- `tag` : Tags pour le filtrage (séparés par des virgules)
- `inputs` : Liste des inputs disponibles (format: `type:nom_input`, séparés par des virgules)

### Gestion des inputs

Les inputs sont stockés dans des fichiers texte dans le dossier `data/inputs/` :

- **Nom du fichier** : `nom_input.txt` (basé sur le nom dans les métadonnées)
- **Contenu** : La valeur de l'input
- **Modification** : Éditable manuellement ou via l'interface

**Exemple :**

```html
inputs="text:titre_breaking_news,number:temps_countdown"
```

Créera les fichiers :

- `data/inputs/titre_breaking_news.txt`
- `data/inputs/temps_countdown.txt`

**Avantage :** Compatible avec OBS et navigateurs classiques (pas de localStorage partagé).

### Utilisation dans les scripts

Pour récupérer les valeurs des inputs dans vos scripts JavaScript :

```javascript
async function start_mon_overlay() {
  // Récupérer la valeur d'un input
  const response = await fetch(`/api/actions/input/nom_input`)
  const value = await response.text()

  // Utiliser la valeur
  const element = document.getElementById('mon-element')
  element.textContent = value
}
```

**Types d'inputs supportés :**

- `text` : Texte libre
- `number` : Valeur numérique
- `color` : Sélecteur de couleur
- `select` : Liste déroulante
- `boolean` : Case à cocher

## ⚙️ Paramètres globaux

### Configuration de la taille de police et du nom de chaîne

Les paramètres suivants sont disponibles sur la **page principale** (`/`) et la **page commands** (`/commands`) :

- **Taille de police** : Contrôle la taille globale des textes dans les overlays
- **Nom de chaîne Twitch** : Définit le nom de votre chaîne pour les fonctionnalités liées à Twitch

Ces paramètres sont stockés dans les fichiers :

- `data/inputs/font-size.txt` : Taille de police (ex: 1.4)
- `data/inputs/channel-name.txt` : Nom de votre chaîne Twitch

## 💬 Chat Twitch

### Configuration

1. Accédez à `http://localhost:3000/chat`
2. Le chat affichera les 20 derniers messages en temps réel

### Fonctionnalités

- **Messages en temps réel** : Connexion directe à Twitch via TMI.js
- **Limitation** : Stockage des 20 derniers messages uniquement
- **Alertes** : Système d'alertes intégré via WebSocket

## 🎛️ Page de commandes

### Accès

- **URL** : `http://localhost:3000/commands`
- **Usage** : Contrôle rapide des overlays depuis OBS

### Fonctionnalités

- **Boutons d'action** : Démarrage/arrêt des overlays
- **Interface simplifiée** : Optimisée pour l'intégration OBS
- **Popup d'édition** : Ouverture d'onglets pour modifier les inputs
- **Paramètres globaux** : Configuration de la taille de police et du nom de chaîne Twitch
- **Sélecteur d'overlay** : Choix entre Alpha, Tango et Charlie pour chaque action

## 🎯 Sélecteur d'overlays

### Fonctionnement

Le système propose un **sélecteur d'overlays** qui permet de choisir entre 3 overlays distincts :

- **Alpha** : Overlay par défaut
- **Tango** : Overlay secondaire
- **Charlie** : Overlay tertiary

### Utilisation

#### Dans la preview

- Le sélecteur est disponible dans la zone de preview de la page principale
- Permet de tester les overlays en temps réel
- Changement instantané de l'overlay affiché

#### Dans les actions

- Chaque action dispose de son propre sélecteur d'overlay
- Permet de spécifier quel overlay utiliser pour chaque action
- Les actions sont exécutées sur l'overlay sélectionné

### URLs des overlays

- **Alpha** : `http://localhost:3000/alpha`
- **Tango** : `http://localhost:3000/tango`
- **Charlie** : `http://localhost:3000/charlie`

## 🎮 Intégration OBS

### Overlays disponibles

Le système propose maintenant **3 overlays distincts** avec leurs propres URLs :

- **Alpha** : `http://localhost:3000/alpha`
- **Tango** : `http://localhost:3000/tango`
- **Charlie** : `http://localhost:3000/charlie`

### Configuration OBS

1. Ajoutez une source "Navigateur Web"
2. Choisissez l'URL de l'overlay souhaité :
   - Alpha : `http://localhost:3000/alpha`
   - Tango : `http://localhost:3000/tango`
   - Charlie : `http://localhost:3000/charlie`
3. Résolution : 1920x1080 (recommandé)
4. FPS : 30

### Page de commandes (optionnelle)

Pour contrôler les overlays depuis OBS :

1. Ajoutez une source "Navigateur Web"
2. URL : `http://localhost:3000/commands`
3. Résolution : 800x600 (recommandé)
4. FPS : 30

### Chat Twitch

Pour afficher le chat Twitch :

1. Ajoutez une source "Navigateur Web"
2. URL : `http://localhost:3000/chat?channel=VOTRE_CHANNEL`
3. Résolution : 400x600 (recommandé)
4. FPS : 30

## 🏗️ Architecture

- **Backend** : Serveur Bun avec API REST et WebSocket
- **Frontend** : Interface SPA avec router côté client
- **Overlays** : Templates HTML avec scripts intégrés
- **Communication** : WebSocket temps réel entre interface et overlay

## 🎨 Fonctionnalités

- ✅ Gestion d'overlays en temps réel
- ✅ Interface de contrôle intuitive
- ✅ Filtrage par tags
- ✅ Aperçu en direct
- ✅ Animations CSS
- ✅ Scripts JavaScript intégrés
- ✅ Responsive design
- ✅ Intégration OBS
- ✅ Gestion d'inputs via fichiers texte
- ✅ Chat Twitch intégré
- ✅ Page de commandes dédiée
- ✅ Système d'alertes
- ✅ Sélecteur d'overlays (Alpha, Tango, Charlie)
- ✅ URLs dédiées pour chaque overlay

## 🔧 Développement

Ce système est conçu pour être **simple et local**. Les métadonnées sont intégrées directement dans les fichiers HTML pour éviter la complexité d'un système d'éditeur externe.

**Technologies utilisées :**

- Bun (runtime JavaScript)
- TypeScript
- WebSocket
- CSS Animations
- SPA Router
