# Time Display Addon 🕐

Addon d'affichage de l'heure en temps réel pour MyWallpaper, basé sur la même structure que le date-display-addon.

## Fonctionnalités

✨ **Affichage temps réel** - Met à jour l'heure chaque seconde
🎯 **Redimensionnement intelligent** - Utilise le même algorithme de recherche binaire que date-display-addon
🎨 **Personnalisation complète** - Fonte, couleur, format d'heure configurable
📱 **Responsive** - S'adapte automatiquement à toutes les tailles d'écran

## Paramètres configurables

### Apparence
- **URL de la fonte** - Google Fonts ou fonte personnalisée
- **Famille de fonte** - Nom de la famille de fonte
- **Couleur du texte** - Couleur de l'affichage

### Format de l'heure
- **24 heures avec secondes** - 14:30:25
- **24 heures sans secondes** - 14:30  
- **12 heures avec secondes** - 2:30:25 PM
- **12 heures sans secondes** - 2:30 PM
- **Afficher/masquer les secondes** - Contrôle indépendant

## Installation

1. Téléchargez tous les fichiers de l'addon
2. Dans MyWallpaper, ajoutez l'addon avec l'URL du fichier `index.html`
3. Configurez les paramètres selon vos préférences

## Fichiers

- `index.html` - Structure HTML de base
- `script.js` - Logique de l'heure et redimensionnement
- `styles.css` - Styles de base
- `addon.json` - Configuration et paramètres
- `README.md` - Documentation

## Algorithme de redimensionnement

Utilise le même algorithme de recherche binaire que le date-display-addon pour trouver la taille de fonte optimale qui remplit parfaitement l'espace disponible sans déborder.

## Compatibilité

- Tous navigateurs modernes
- Responsive design
- Support MyWallpaper
- Mise à jour temps réel