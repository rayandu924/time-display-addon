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
        }, 30000); // Toutes les 30 secondes
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

        // Algorithme de recherche binaire optimisé pour le text fitting
        let minFontSize = 6; // Taille minimum lisible
        let maxFontSize = Math.min(maxWidth, maxHeight); // Limite supérieure raisonnable
        let currentFontSize = (minFontSize + maxFontSize) / 2;
        let iterations = 0;
        const maxIterations = 20; // Limite pour éviter les boucles infinies

        while (iterations < maxIterations) {
            // Appliquer la taille de test
            this.timeElement.style.fontSize = `${currentFontSize}px`;
            
            // Mesurer les dimensions après le changement de font-size
            const textRect = this.timeElement.getBoundingClientRect();
            const widthDifference = maxWidth - textRect.width;
            const heightDifference = maxHeight - textRect.height;

            // Si le texte s'ajuste parfaitement (tolérance de 1px), on arrête
            if (Math.abs(widthDifference) <= 1 && Math.abs(heightDifference) <= 1) {
                break;
            }

            // Si le texte est trop grand, réduire la taille max
            if (widthDifference < 0 || heightDifference < 0) {
                maxFontSize = currentFontSize;
            } 
            // Si le texte est trop petit, augmenter la taille min
            else {
                minFontSize = currentFontSize;
            }

            // Calculer la nouvelle taille à tester
            currentFontSize = (minFontSize + maxFontSize) / 2;
            iterations++;
        }

        // Appliquer la taille optimale trouvée avec marge de sécurité
        const finalSize = Math.max(Math.floor(currentFontSize) - 2, 6);
        this.timeElement.style.fontSize = `${finalSize}px`;

        console.log(`📏 Taille de fonte optimale: ${finalSize}px (${iterations} itérations)`);
        
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