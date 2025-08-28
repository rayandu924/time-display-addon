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
            timeFormat: "24h",
            showSeconds: true
        };
        
        this.timeElement = null;
        this.timeInterval = null;
        this.resizeTimeout = null;
        this.isCalculating = false;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.timeElement = document.getElementById('currentTime');
            if (this.timeElement) {
                this.loadCustomFont();
                this.startTimeUpdates();
                this.setupEventListeners();
                this.calculateOptimalFontSize();
            }
        });

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
        
        // Merger les nouveaux paramètres
        this.settings = { ...this.settings, ...newSettings };
        
        // Appliquer les changements
        this.applySettings();
        this.updateTimeDisplay();
        this.calculateOptimalFontSize();
    }

    applySettings() {
        if (!this.timeElement) return;

        // Couleur du texte
        this.timeElement.style.color = this.settings.textColor;
        
        // Famille de fonte
        this.timeElement.style.fontFamily = this.settings.fontFamily;
        
        // Charger nouvelle fonte si URL changée
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
        // Mettre à jour immédiatement
        this.updateTimeDisplay();
        
        // Puis mettre à jour chaque seconde
        this.timeInterval = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
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
    }

    setupEventListeners() {
        // Redimensionnement avec debounce
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.calculateOptimalFontSize();
            }, 150);
        });

        // Recalcul périodique pour s'assurer que tout est optimal
        setInterval(() => {
            if (!this.isCalculating) {
                this.calculateOptimalFontSize();
            }
        }, 10000); // Toutes les 10 secondes
    }

    calculateOptimalFontSize() {
        if (!this.timeElement || this.isCalculating) return;
        
        this.isCalculating = true;

        const container = this.timeElement.parentElement;
        if (!container) {
            this.isCalculating = false;
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width;
        const maxHeight = containerRect.height;

        if (maxWidth <= 0 || maxHeight <= 0) {
            this.isCalculating = false;
            return;
        }

        // Algorithme de recherche binaire identique à date-display-addon
        let minSize = 1;
        let maxSize = Math.min(maxWidth, maxHeight);
        let optimalSize = minSize;

        const testText = this.timeElement.textContent || "00:00:00";

        // Recherche binaire pour trouver la taille optimale
        while (minSize <= maxSize) {
            const midSize = Math.floor((minSize + maxSize) / 2);
            this.timeElement.style.fontSize = midSize + 'px';

            const textRect = this.timeElement.getBoundingClientRect();
            
            if (textRect.width <= maxWidth && textRect.height <= maxHeight) {
                optimalSize = midSize;
                minSize = midSize + 1;
            } else {
                maxSize = midSize - 1;
            }
        }

        // Appliquer la taille optimale avec une petite marge de sécurité
        const finalSize = Math.max(optimalSize - 2, 1);
        this.timeElement.style.fontSize = finalSize + 'px';

        console.log(`📏 Taille de fonte optimale: ${finalSize}px`);
        
        this.isCalculating = false;
    }

    destroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
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