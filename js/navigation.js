/**
 * Navigation Manager
 * Handles SPA routing, active states, and mobile menu
 */

class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.page-section');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navbar = document.getElementById('navbar');

        this.init();
    }

    init() {
        // Handle Hash Change
        window.addEventListener('hashchange', () => this.handleRoute());

        // Handle Initial Load
        this.handleRoute();

        // Mobile Toggle
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => {
                this.navToggle.classList.toggle('active');
                this.navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // If clicking the home link, clear the hash from URL
                if (link.getAttribute('href') === '#home') {
                    history.pushState({}, document.title, window.location.pathname);
                }
                // ✅ FIX: Add null check to prevent errors if elements don't exist
                if (this.navToggle && this.navMenu) {
                    this.navToggle.classList.remove('active');
                    this.navMenu.classList.remove('active');
                }
            });
        });

        // Navbar Scroll Effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(10, 10, 10, 0.98)';
                this.navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            } else {
                this.navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                this.navbar.style.boxShadow = 'none';
            }
        });
    }

    handleRoute() {
        let hash = window.location.hash;
        if (!hash) hash = '#home';

        // Check if this is a category slug (not a section ID)
        const categorySlugs = {
            'arkhitektory-illyuziy': 'schemes',
            'sotsialnye-seti-parazitizma': 'schemes',
            'simulyarkry-yspexa': 'schemes',
            'zony-obmana': 'schemes',
            'etichesky-chertak': 'schemes',
            'psixologiya': 'psychology',
            'gallery': 'gallery',
            'gallery-all': 'gallery',
            'gallery-phishing': 'gallery',
            'gallery-phone_scams': 'gallery',
            'gallery-online_fraud': 'gallery',
            'gallery-identity_theft': 'gallery'
        };
        
        // If the hash is a category slug
        if (categorySlugs[hash.substring(1)]) {
            const targetSectionId = categorySlugs[hash.substring(1)];
            this.activateSection(targetSectionId, hash);
        } else {
            // Handle regular section navigation
            // Remove active class from all
            this.navLinks.forEach(link => link.classList.remove('active'));
            this.sections.forEach(section => section.classList.remove('active'));

            // Activate current
            const currentLink = document.querySelector(`.nav-link[href="${hash}"]`);
            const currentSection = document.querySelector(hash);

            if (currentLink) currentLink.classList.add('active');

            if (currentSection) {
                currentSection.classList.add('active');
                
                // Load content for the section if needed
                this.loadSectionContent(hash);
                
                // Only scroll to top if not on the home page
                if (hash !== '#home') {
                    window.scrollTo(0, 0);
                }
            } else {
                // Fallback to home if 404
                console.warn('Route not found:', hash);
                document.querySelector('#home').classList.add('active');
            }
        }
        
        // Ensure at least one section is always active
        const anyActive = document.querySelector('.page-section.active');
        if (!anyActive) {
            const homeSection = document.querySelector('#home');
            if (homeSection) {
                homeSection.classList.add('active');
            }
        }
    }
    
    activateSection(sectionId, hash) {
        // Remove active class from all nav links and sections
        this.navLinks.forEach(link => link.classList.remove('active'));
        this.sections.forEach(section => section.classList.remove('active'));
        
        // Activate the target section
        const targetSection = document.querySelector(`#${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load content for the section if needed
            this.loadSectionContent(`#${sectionId}`);
            
            // Scroll to top if not on home page
            if (hash !== '#home') {
                window.scrollTo(0, 0);
            }
        } else {
            // Fallback to home if section not found
            const homeSection = document.querySelector('#home');
            if (homeSection) {
                homeSection.classList.add('active');
            }
        }
        
        // Activate the navigation link for the target section
        const targetLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
    
    loadSectionContent(hash) {
        const sectionId = hash.replace('#', '');
        
        if (sectionId === 'schemes' && typeof articlesManager !== 'undefined') {
            articlesManager.loadArticles('all');
        } else if (sectionId === 'psychology' && typeof articlesManager !== 'undefined') {
            articlesManager.loadPsychology();
        } else if (sectionId === 'gallery' && typeof galleryManager !== 'undefined') {
            galleryManager.loadGallery('all');
        } else if (sectionId === 'admin' && typeof adminPanel !== 'undefined') {
            // Admin panel handles its own initialization
            adminPanel.checkInitialAuthStatus();
        }
    }
}

// Initialize
const navigation = new Navigation();
