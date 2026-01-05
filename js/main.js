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
            // Using requestAnimationFrame to batch DOM operations and prevent layout thrashing
            let ticking = false;
            
            const updateScrollButton = () => {
                const scrollY = window.pageYOffset;
                if (scrollY > 300) {
                    this.scrollToTopBtn.classList.add('visible');
                } else {
                    this.scrollToTopBtn.classList.remove('visible');
                }
                ticking = false;
            };
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollButton);
                    ticking = true;
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

// Search Handler
class SearchHandler {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.articlesGrid = document.getElementById('articlesGrid');
        
        this.init();
    }
    
    init() {
        if (this.searchInput && this.searchButton) {
            // Search on button click
            this.searchButton.addEventListener('click', () => {
                this.performSearch();
            });
            
            // Search on Enter key
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
            
            // Add debounce for search
            let searchTimeout;
            this.searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.performSearch(), 300);
            });
        }
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            // If query is empty, reload default content
            if (typeof window.articlesManager !== 'undefined') {
                const currentPath = window.location.pathname.split('/').pop().toLowerCase();
                if (currentPath.includes('schemes')) {
                    if (typeof window.articlesManager.loadArticlesWithoutUrlUpdate === 'function') {
                        window.articlesManager.loadArticlesWithoutUrlUpdate('all');
                    } else {
                        window.articlesManager.loadArticles('all');
                    }
                } else {
                    window.articlesManager.loadArticles('all');
                }
            }
            return;
        }
        
        if (typeof window.articlesManager !== 'undefined') {
            // Show loading state
            if (this.articlesGrid) {
                this.articlesGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Поиск...</p></div>';
            }
            
            try {
                // Perform search
                const results = await window.articlesManager.searchArticles(query);
                
                // Display results
                if (results && results.length > 0) {
                    window.articlesManager.renderSearchResults(this.articlesGrid, results);
                } else {
                    // Show no results message
                    if (this.articlesGrid) {
                        this.articlesGrid.innerHTML = '<p class="search-no-results">Статьи не найдены по запросу "' + query + '"<br>Попробуйте изменить параметры поиска.</p>';
                    }
                }
            } catch (error) {
                console.error('Search error:', error);
                if (this.articlesGrid) {
                    this.articlesGrid.innerHTML = '<p class="error">Ошибка поиска статей</p>';
                }
            }
        }
    }
}


// Initialize the application with proper dependency injection
async function initializeApp() {
    const api = window.api || createApiClient();
    
    // ✅ ИНИЦИАЛИЗАЦИЯ ТОЛЬКО НА НУЖНЫХ СТРАНИЦАХ!
    if (document.getElementById('articlesGrid') || document.getElementById('psychologyGrid')) {
        window.articlesManager = new ArticlesManager(api);
    }
    if (document.getElementById('galleryGrid')) {
        window.galleryManager = new GalleryManager(api);
    }
    if (document.getElementById('testsGrid')) {
        window.testsManager = new TestsManager(api);
    }
    // Initialize admin panel on all pages so admin functions are available (edit/delete from article pages)
    if (typeof AdminPanel !== 'undefined') {
        window.adminPanel = new AdminPanel(api);
    } else {
        console.warn('AdminPanel not available, admin functionality will be disabled');
        window.adminPanel = null;
    }
    
    new ContactFormHandler();
    new FilterHandler();
    new ScrollToTopHandler();
    new SearchHandler();
    
    // Load content based on current page
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
    
    const managers = {
        articlesManager: window.articlesManager,
        galleryManager: window.galleryManager,
        adminPanel: window.adminPanel
    };
    
    if (currentPath.includes('schemes')) {
        // For schemes page, load articles but only if no hash is present
        // If there's no hash, load architects articles; otherwise let URL hash handling manage it
        if (!window.location.hash) {
            if (managers.articlesManager && typeof managers.articlesManager.loadArticles === 'function') {
                // Use the method that doesn't update URL to avoid adding hash initially
                if (typeof managers.articlesManager.loadArticlesWithoutUrlUpdate === 'function') {
                    managers.articlesManager.loadArticlesWithoutUrlUpdate('architects');
                } else {
                    managers.articlesManager.loadArticles('architects');
                }
            }
        }
    } else if (currentPath.includes('index')) {
        if (managers.articlesManager && typeof managers.articlesManager.loadArticles === 'function') {
            managers.articlesManager.loadArticles('all');
        }
    } else if (currentPath.includes('psychology')) {
        if (managers.articlesManager && typeof managers.articlesManager.loadPsychology === 'function') {
            managers.articlesManager.loadPsychology();
        }
    } else if (currentPath.includes('gallery')) {
        if (managers.galleryManager && typeof managers.galleryManager.loadGallery === 'function') {
            managers.galleryManager.loadGallery('all');
        }
    } else if (currentPath.includes('tests')) {
        if (window.testsManager && typeof window.testsManager.loadTests === 'function') {
            window.testsManager.loadTests();
        }
    } else if (currentPath.includes('admin')) {
        if (managers.adminPanel && typeof managers.adminPanel.checkInitialAuthStatus === 'function') {
            managers.adminPanel.checkInitialAuthStatus();
        }
    }
}

// Init application when DOM is loaded and API is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for window.api to be available
    const checkApiReady = async () => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait time
        
        while (attempts < maxAttempts && !window.api) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.api) {
            initializeApp();
        } else {
            console.error('API client not available after waiting');
            // Initialize with fallback API
            initializeApp();
        }
    };
    
    await checkApiReady();
});
