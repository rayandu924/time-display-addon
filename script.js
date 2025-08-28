/**
 * Time Display Addon - Simple Responsive Approach
 * Affichage de l'heure en temps réel avec taille basée sur les dimensions de la fenêtre
 * Approche ultra-simple et stable pour les iframes
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
        this.dimensions = { width: 0, height: 0 };
        
        this.init();
    }

    init() {
        const initializeAddon = () => {
            this.timeElement = document.getElementById('currentTime');
            if (this.timeElement) {
                console.log('🚀 Time Display - Initialisation de l\'addon');
                this.updateDimensions();
                this.setupEventListeners();
                this.loadCustomFont();
                this.startTimeUpdates();
                this.applyResponsiveSize();
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
        this.applyResponsiveSize();
    }

    applyChangedSettings(oldSettings, newSettings) {
        if (!this.timeElement) return;

        // Couleur du texte
        if (oldSettings.textColor !== newSettings.textColor) {
            this.timeElement.style.color = newSettings.textColor;
        }
        
        // Famille de fonte
        if (oldSettings.fontFamily !== newSettings.fontFamily) {
            this.timeElement.style.fontFamily = newSettings.fontFamily;
        }
        
        // URL de fonte
        if (oldSettings.fontUrl !== newSettings.fontUrl) {
            this.loadCustomFont();
        }
    }

    applySettings() {
        if (!this.timeElement) return;

        this.timeElement.style.fontFamily = this.settings.fontFamily;
        this.timeElement.style.color = this.settings.textColor;
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

        fontLink.onload = () => {
            this.applyResponsiveSize();
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

    updateDimensions() {
        this.dimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        console.log(`📏 Dimensions mises à jour: ${this.dimensions.width}x${this.dimensions.height}`);
    }
    
    applyResponsiveSize() {
        if (!this.timeElement) return;
        
        // 100% de la plus petite dimension
        const fontSize = Math.min(this.dimensions.width, this.dimensions.height);
        
        this.timeElement.style.fontSize = `${fontSize}px`;
        
        console.log(`📏 Taille responsive appliquée: ${fontSize}px`);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.applyResponsiveSize();
        });
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