/**
 * Time Display Addon - Version simple et robuste
 * Affichage de l'heure en temps réel avec auto-sizing CSS pur
 * Utilise CSS clamp() pour un redimensionnement fluide et compatible avec les iframes
 */

class TimeDisplayAddon {
    constructor() {
        this.settings = {
            fontUrl: "https://fonts.cdnfonts.com/css/anurati",
            fontFamily: "Anurati, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textColor: "#FFFFFF",
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
                this.applySettings();
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
        const needsRecalc = this.applyChangedSettings(oldSettings, this.settings);
        this.updateTimeDisplay();
        
        // Les styles CSS s'occupent automatiquement du sizing
    }

    applyChangedSettings(oldSettings, newSettings) {
        if (!this.timeElement) return false;

        let hasChanges = false;
        let needsFontRecalc = false;

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
            // CSS clamp() gère automatiquement le sizing
        }
        
        
        // URL de fonte - seulement si changée (évite rechargement inutile)
        if (oldSettings.fontUrl !== newSettings.fontUrl) {
            this.loadCustomFont();
            console.log('🔗 URL de fonte changée, rechargement:', newSettings.fontUrl);
            hasChanges = true;
            // CSS clamp() gère automatiquement le sizing
        }

        if (!hasChanges) {
            console.log('⚡ Aucun changement visuel, pas de mise à jour CSS');
        }
        
        return needsFontRecalc;
    }

    // Méthode legacy pour initialisation complète
    applySettings() {
        if (!this.timeElement) return;

        // Appliquer tous les paramètres (pour initialisation)
        this.timeElement.style.color = this.settings.textColor;
        this.timeElement.style.fontFamily = this.settings.fontFamily;
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

        // La fonte se chargera automatiquement avec CSS clamp()
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

    // Plus besoin d'event listeners pour le resize - CSS clamp() gère tout

    // Plus besoin de calcul manuel - CSS clamp() gère l'auto-sizing

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