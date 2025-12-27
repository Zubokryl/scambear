/**
 * Main Application Logic
 * Handles global interactions, Contact Form, and proper initialization of managers with dependency injection
 */

class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.telegramBtn = document.getElementById('telegramBtn');
        this.telegramLink = 'https://t.me/yourscamproof';

        this.init();
    }

    init() {
        // Link Button
        if (this.telegramBtn) {
            this.telegramBtn.href = this.telegramLink;
        }

        // Form Submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    async handleSubmit() {
        const formData = new FormData(this.form);
        const name = formData.get('name');
        const telegram = formData.get('telegram');
        const message = formData.get('message');
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Validate and sanitize inputs to prevent SSRF and other attacks
            if (!this.validateInputs(name, telegram, message)) {
                alert('Некорректные данные в форме. Пожалуйста, проверьте введенные данные.');
                return;
            }
            
            // Sanitize inputs
            const sanitizedData = {
                name: this.sanitizeInput(name),
                telegram: this.sanitizeInput(telegram),
                message: this.sanitizeInput(message),
            };
            
            // Prepare email parameters for EmailJS
            // Make sure these parameter names match your EmailJS template variables
            const templateParams = {
                from_name: sanitizedData.name,
                from_telegram: sanitizedData.telegram,
                message: sanitizedData.message,
                to_email: 'zubokryl@gmail.com',
                subject: '[ПАРАЗИТЫ] Новое сообщение с сайта'
            };
            
            // Send email via EmailJS v4
            const response = await emailjs.send('service_idle3xv', 'template_jtqg11r', templateParams);
            
            console.log('EmailJS response:', response); // Debug logging
            
            // EmailJS v4 returns status 200 on success
            if (response && response.status === 200) {
                alert(`Спасибо, ${sanitizedData.name}! Ваше сообщение отправлено. Мы свяжемся с вами.`);
                this.form.reset();
            } else {
                console.error('Form submission error:', response);
                alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    validateInputs(name, telegram, message) {
        // Basic validation to prevent SSRF and injection attacks
        
        // Name validation: only letters, spaces, hyphens, apostrophes, max 100 chars
        if (!name || name.length > 100 || /[<>"'%;\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(name)) {
            return false;
        }
        
        // Telegram validation: allow any characters, or email, or empty
        if (telegram && telegram.length > 100) {  // Increased max length to accommodate email addresses
            return false;
        }
        
        // Message validation: max length and no dangerous patterns
        if (!message || message.length > 2000 || this.containsDangerousPatterns(message)) {
            return false;
        }
        
        return true;
    }
    
    containsDangerousPatterns(text) {
        // Check for potential SSRF or injection patterns
        const dangerousPatterns = [
            /\b(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)\b/i,
            /\b(ftp|gopher|jar|file|dict)\:\/\//i,
            /\b(\d{1,3}\.){3}\d{1,3}(:\d+)?\b/, // IP addresses
            /\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/, // Private IP ranges
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];
        
        return dangerousPatterns.some(pattern => pattern.test(text));
    }
    
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        // Remove dangerous characters and patterns
        let sanitized = input
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/onload=/gi, 'on_load=')
            .replace(/onerror=/gi, 'on_error=')
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
            .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
            .replace(/<embed[^>]*>.*?<\/embed>/gi, '') // Remove embed tags
            .replace(/<link[^>]*>/gi, '') // Remove link tags
            .replace(/<meta[^>]*>/gi, '') // Remove meta tags
            .trim();
        
        // Additional sanitization based on input type could be added here
        return sanitized;
    }
}

// Filter Handler for both articles and gallery
class FilterHandler {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-tabs .filter-btn');
        this.galleryFilterButtons = document.querySelectorAll('.filter-tabs .gallery-filter-btn');
        this.filterSubtitles = document.querySelectorAll('.filter-subtitle');
        
        this.init();
    }
    
    init() {
        // Set initial active subtitle based on first active filter button
        const activeFilter = document.querySelector('.filter-tabs .filter-btn.active');
        if (activeFilter) {
            this.updateSubtitle(activeFilter.dataset.filter);
        }
        
        // Add event listeners to article filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });
        
        // Add event listeners to gallery filter buttons
        this.galleryFilterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleGalleryFilterClick(e);
            });
        });
    }
    
    handleFilterClick(event) {
        const filterValue = event.target.dataset.filter;
        
        // Update subtitle
        this.updateSubtitle(filterValue);
    }
    
    handleGalleryFilterClick(event) {
        const filterValue = event.target.dataset.filter;
        
        // For gallery, we don't update subtitles, just ensure gallery section is active
        if (typeof galleryManager !== 'undefined' && galleryManager.updateUrl) {
            galleryManager.updateUrl(filterValue);
        }
    }
    
    updateSubtitle(filterValue) {
        // Hide all subtitles
        this.filterSubtitles.forEach(subtitle => {
            subtitle.classList.remove('active');
        });
        
        // Hide simulacra subtitle
        const simulacraSubtitle = document.querySelector('.simulacra-subtitle');
        if (simulacraSubtitle) {
            simulacraSubtitle.style.display = 'none';
        }
        
        // Show subtitle for current filter
        const activeSubtitle = document.querySelector(`.filter-subtitle[data-category="${filterValue}"]`);
        if (activeSubtitle) {
            activeSubtitle.classList.add('active');
        }
        
        // Show simulacra subtitle only for simulacra filter
        if (filterValue === 'simulacra') {
            const simulacraSubtitle = document.querySelector('.simulacra-subtitle');
            if (simulacraSubtitle) {
                simulacraSubtitle.style.display = 'block';
            }
        }
    }
}

// Scroll to Top Handler
class ScrollToTopHandler {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        
        this.init();
    }
    
    init() {
        if (this.scrollToTopBtn) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    this.scrollToTopBtn.classList.add('visible');
                } else {
                    this.scrollToTopBtn.classList.remove('visible');
                }
            });
            
            // Scroll to top when button is clicked
            this.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
}

// Global Error Handler for Images
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/400x300?text=Image';
        e.target.style.opacity = 0.5;
    }
}, true);


// Initialize the application with proper dependency injection
async function initializeApp() {
    // Create API client instance
    const api = window.api || createApiClient();
    
    // Initialize managers with dependency injection
    window.articlesManager = new ArticlesManager(api);
    window.galleryManager = new GalleryManager(api);
    window.adminPanel = new AdminPanel(api);
    
    // Initialize UI components
    new ContactFormHandler();
    new FilterHandler();
    new ScrollToTopHandler();
    
    // Initialize URL routing for articles if the articles manager exists
    // NOTE: This is handled by navigation.js now to avoid conflicts
    // if (typeof articlesManager !== 'undefined' && articlesManager.handleInitialUrl) {
    //     articlesManager.handleInitialUrl();
    // }
}

// Init application when DOM is loaded and API is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for window.api to be available (it should be from api.js)
    // Try immediately, then try again after a short delay if needed
    const attemptInitialization = () => {
        if (window.api) {
            initializeApp();
        } else {
            console.warn('API client not ready yet, waiting...');
            // Try again after a short delay
            setTimeout(() => {
                if (window.api) {
                    initializeApp();
                } else {
                    console.error('API client still not available after delay');
                }
            }, 100);
        }
    };
    
    attemptInitialization();
});
