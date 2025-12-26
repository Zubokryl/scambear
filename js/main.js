/**
 * Main Application Logic
 * Handles global interactions and Contact Form
 */

class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.telegramBtn = document.getElementById('telegramBtn');
        this.telegramLink = 'https://t.me/parasite_antifraud_demo';

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

    handleSubmit() {
        const formData = new FormData(this.form);
        const name = formData.get('name');

        // In a real app, this would send to Backend or Telegram Bot API
        alert(`Спасибо, ${name}! Ваше сообщение отправлено. Мы свяжемся с вами.`);

        this.form.reset();

        // Auto open Telegram (optional UX choice)
        // window.open(this.telegramLink, '_blank');
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


// Init Contact Form and Filter Handler
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
    new FilterHandler();
    new ScrollToTopHandler();
    
    // Initialize URL routing for articles if the articles manager exists
    // NOTE: This is handled by navigation.js now to avoid conflicts
    // if (typeof articlesManager !== 'undefined' && articlesManager.handleInitialUrl) {
    //     articlesManager.handleInitialUrl();
    // }
});
