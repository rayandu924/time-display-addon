/**
 * Time Display Addon - Basé sur date-display-addon
 * Affichage de l'heure en temps réel avec système de redimensionnement intelligent
 * Utilise le même algorithme de recherche binaire pour le sizing optimal
 */

class TimeDisplayAddon {
    constructor() {
        this.settings = {
            fontUrl: "https://fonts.cdnfonts.com/css/anurati",
            fontFamily: "Anurati, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textColor: "#FFFFFF",
            fontSize: 48,
            timeFormat: "24h",
            showSeconds: true
        };
        
        this.timeElement = null;
        this.timeInterval = null;
        
        this.init();
    }

    init() {
        const initializeAddon = () => {
            this.timeElement = document.getElementById('currentTime');
            if (this.timeElement) {
                console.log('🚀 Time Display - Initialisation de l\'addon');
                this.loadCustomFont();
                this.startTimeUpdates();
                this.setupEventListeners();
                this.calculateOptimalFontSize();
            } else {
                console.error('❌ Time Display - Element currentTime non trouvé');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAddon);
        } else {
            // DOM déjà chargé, initialiser immédiatement
            initializeAddon();
        }

        // Support pour les messages de configuration de MyWallpaperHost
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SETTINGS_UPDATE') {
                this.updateSettings(event.data.settings);
            } else if (event.data && event.data.type === 'CONFIG_UPDATE') {
                this.updateSettings(event.data.config);
            }
        });
    }

    updateSettings(newSettings) {
        console.log('🔧 Time Display - Mise à jour des paramètres:', newSettings);
        
        // Sauvegarder les anciens paramètres pour comparaison
        const oldSettings = { ...this.settings };
        
        // Merger les nouveaux paramètres
        this.settings = { ...this.settings, ...newSettings };
        
        // Appliquer seulement les changements nécessaires
        this.applyChangedSettings(oldSettings, this.settings);
        this.updateTimeDisplay();
        this.calculateOptimalFontSize();
    }

    applyChangedSettings(oldSettings, newSettings) {
        if (!this.timeElement) return;

        let hasChanges = false;

        // Couleur du texte - seulement si changée
        if (oldSettings.textColor !== newSettings.textColor) {
            this.timeElement.style.color = newSettings.textColor;
            console.log('🎨 Couleur mise à jour:', newSettings.textColor);
            hasChanges = true;
        }
        
        // Famille de fonte - seulement si changée
        if (oldSettings.fontFamily !== newSettings.fontFamily) {
            this.timeElement.style.fontFamily = newSettings.fontFamily;
            console.log('🔤 Famille de fonte mise à jour:', newSettings.fontFamily);
            hasChanges = true;
        }
        
        // Taille de fonte - seulement si changée
        if (oldSettings.fontSize !== newSettings.fontSize) {
            this.timeElement.style.fontSize = newSettings.fontSize + 'px';
            console.log('📏 Taille de fonte mise à jour:', newSettings.fontSize + 'px');
            hasChanges = true;
        }
        
        // URL de fonte - seulement si changée (évite rechargement inutile)
        if (oldSettings.fontUrl !== newSettings.fontUrl) {
            this.loadCustomFont();
            console.log('🔗 URL de fonte changée, rechargement:', newSettings.fontUrl);
            hasChanges = true;
        }

        if (!hasChanges) {
            console.log('⚡ Aucun changement visuel, pas de mise à jour CSS');
        }
    }

    // Méthode legacy pour initialisation complète
    applySettings() {
        if (!this.timeElement) return;

        // Appliquer tous les paramètres (pour initialisation)
        this.timeElement.style.color = this.settings.textColor;
        this.timeElement.style.fontFamily = this.settings.fontFamily;
        this.timeElement.style.fontSize = this.settings.fontSize + 'px';
        this.loadCustomFont();
    }

    loadCustomFont() {
        if (!this.settings.fontUrl) return;

        // Supprimer ancien lien de fonte
        const existingFontLink = document.querySelector('link[data-font-link="time-addon"]');
        if (existingFontLink) {
            existingFontLink.remove();
        }

        // Ajouter nouveau lien de fonte
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = this.settings.fontUrl;
        fontLink.setAttribute('data-font-link', 'time-addon');
        document.head.appendChild(fontLink);

        // Attendre que la fonte se charge avant de recalculer
        fontLink.onload = () => {
            setTimeout(() => {
                this.calculateOptimalFontSize();
            }, 100);
        };
    }

    startTimeUpdates() {
        console.log('⏰ Time Display - Démarrage des mises à jour de l\'heure');
        
        // Mettre à jour immédiatement
        this.updateTimeDisplay();
        
        // Puis mettre à jour chaque seconde
        this.timeInterval = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
        
        console.log('✅ Time Display - Interval configuré pour mise à jour chaque seconde');
    }

    updateTimeDisplay() {
        if (!this.timeElement) return;

        const now = new Date();
        let timeString = '';

        switch (this.settings.timeFormat) {
            case '12h':
                timeString = now.toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                    second: this.settings.showSeconds ? '2-digit' : undefined
                });
                break;
            case '12h-no-seconds':
                timeString = now.toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit'
                });
                break;
            case '24h-no-seconds':
                timeString = now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
                break;
            case '24h':
            default:
                timeString = now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: this.settings.showSeconds ? '2-digit' : undefined
                });
                break;
        }

        this.timeElement.textContent = timeString;
        console.log(`🕐 Time Display - Heure mise à jour: "${timeString}"`);
    }

    setupEventListeners() {
        // Pas besoin d'event listeners pour une taille fixe
    }

    calculateOptimalFontSize() {
        if (!this.timeElement) return;
        
        // Utiliser la taille configurée dans les paramètres
        this.timeElement.style.fontSize = this.settings.fontSize + 'px';
        console.log(`📏 Taille de fonte configurée: ${this.settings.fontSize}px`);
    }

    destroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }
}

// Initialiser l'addon quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.timeDisplay = new TimeDisplayAddon();
    });
} else {
    window.timeDisplay = new TimeDisplayAddon();
}