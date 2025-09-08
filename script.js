// ⏰ TIME DISPLAY ADDON - Ultra-Simple Responsive
class TimeDisplayAddon {
    constructor() {
        this.container = document.getElementById('timeContainer')
        this.timeElement = document.getElementById('currentTime')
        this.dimensions = { width: 0, height: 0 }
        
        // Default settings
        this.settings = {
            fontUrl: 'https://fonts.cdnfonts.com/css/anurati',
            fontFamily: 'Anurati, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textColor: '#FFFFFF',
            language: 'en-US',
            letterSpacingPercent: 8, // Pourcentage d'espacement entre lettres (8% par défaut pour être plus visible)
            timeFormat: '24h' // Format 24h ou 12h
        }
        
        this.updateDimensions()
        this.loadCustomFont()
        this.setupEventListeners()
        this.startUpdating()
        this.applyResponsiveSize()
    }
    
    updateDimensions() {
        this.dimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }
    
    applyResponsiveSize() {
        if (!this.timeElement) return
        
        // Formule magique : 100% de la plus petite dimension
        const fontSize = Math.min(this.dimensions.width, this.dimensions.height)
        
        // Espacement entre lettres responsive : configurable via settings
        const letterSpacing = fontSize * (this.settings.letterSpacingPercent / 100)
        console.log(`💬 Letter spacing calculation: fontSize=${fontSize}px × ${this.settings.letterSpacingPercent}% = ${letterSpacing}px`)
        
        // Pour éviter les limites browser sur font-size, utiliser transform scale pour très petites tailles
        if (fontSize < 12) {
            // Utiliser une taille de base de 12px et scaler vers le bas
            this.timeElement.style.fontSize = '12px'
            const baseLetterSpacing = 12 * (this.settings.letterSpacingPercent / 100)
            this.timeElement.style.letterSpacing = `${baseLetterSpacing}px`
            // Validation immédiate de la propriété appliquée
            const computedSpacing = window.getComputedStyle(this.timeElement).letterSpacing
            console.log(`✅ Tiny mode letterSpacing: ${baseLetterSpacing}px, computed: ${computedSpacing}`)
            
            const scaleFactor = fontSize / 12
            this.timeElement.style.transform = `scale(${scaleFactor})`
            this.timeElement.style.transformOrigin = 'center'
            console.log(`🔽 Tiny scaling: fontSize=12px, letterSpacing=${baseLetterSpacing}px, scale=${scaleFactor}, target=${fontSize}px`)
        } else {
            // Taille normale, pas besoin de transform
            this.timeElement.style.fontSize = `${fontSize}px`
            this.timeElement.style.letterSpacing = `${letterSpacing}px`
            // Validation immédiate de la propriété appliquée
            const computedSpacing = window.getComputedStyle(this.timeElement).letterSpacing
            console.log(`✅ Applied letterSpacing: ${letterSpacing}px, computed: ${computedSpacing}`)
            this.timeElement.style.transform = 'none'
            console.log(`📏 Normal scaling: fontSize=${fontSize}px, letterSpacing=${letterSpacing}px`)
        }
    }
    
    setupEventListeners() {
        // Settings updates from MyWallpaper
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'SETTINGS_UPDATE' && event.data?.settings) {
                this.updateSettings(event.data.settings)
            }
        })
        
        // Window resize listener
        window.addEventListener('resize', () => {
            this.updateDimensions()
            this.applyResponsiveSize()
        })
    }
    
    updateSettings(newSettings) {
        console.log('🔧 Updating settings:', newSettings)
        
        const oldFontUrl = this.settings.fontUrl
        // Merge settings
        Object.assign(this.settings, newSettings)
        
        // Load new font if URL changed
        if (oldFontUrl !== this.settings.fontUrl && this.settings.fontUrl) {
            this.loadCustomFont()
        } else {
            this.updateStyles()
            this.updateDisplay()
            this.applyResponsiveSize() // Recalcule la taille ET l'espacement
        }
    }
    
    loadCustomFont() {
        if (!this.settings.fontUrl) return
        
        // Remove existing font
        const existingLink = document.querySelector('link[data-custom-font]')
        if (existingLink) existingLink.remove()
        
        // Create font link element
        const fontLink = document.createElement('link')
        fontLink.rel = 'stylesheet'
        fontLink.href = this.settings.fontUrl
        fontLink.setAttribute('data-custom-font', 'true')
        
        fontLink.onload = () => {
            this.updateStyles()
            this.applyResponsiveSize()
        }
        
        document.head.appendChild(fontLink)
    }
    
    updateStyles() {
        // Apply only configurable styles
        this.container.style.fontFamily = this.settings.fontFamily
        this.container.style.color = this.settings.textColor
        this.container.setAttribute('lang', this.settings.language)
    }
    
    startUpdating() {
        this.updateDisplay()
        
        // Update every second for time changes
        setInterval(() => {
            this.updateDisplay()
        }, 1000)
    }
    
    updateDisplay() {
        const now = new Date()
        const locale = this.settings.language
        
        try {
            let timeString
            if (this.settings.timeFormat === '12h') {
                timeString = now.toLocaleTimeString(locale, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                })
            } else {
                timeString = now.toLocaleTimeString(locale, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                })
            }
            this.timeElement.textContent = timeString
        } catch (error) {
            console.error('Error updating display:', error)
            let timeString
            if (this.settings.timeFormat === '12h') {
                timeString = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                })
            } else {
                timeString = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                })
            }
            this.timeElement.textContent = timeString
        }
    }
    
    destroy() {
        const fontLink = document.querySelector('link[data-custom-font]')
        if (fontLink) fontLink.remove()
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timeDisplay = new TimeDisplayAddon()
})
