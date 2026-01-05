/**
 * Navigation Manager
 * Handles multi-page navigation, active states, and mobile menu
 */

class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navbar = document.getElementById('navbar');

        this.init();
    }

    init() {
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
                // ✅ FIX: Add null check to prevent errors if elements don't exist
                if (this.navToggle && this.navMenu) {
                    this.navToggle.classList.remove('active');
                    this.navMenu.classList.remove('active');
                }
            });
        });

        // Set active link based on current page
        this.setActiveLink();

        // Navbar Scroll Effect with debounce
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 50) {
                    this.navbar.classList.add('scrolled');
                } else {
                    this.navbar.classList.remove('scrolled');
                }
            }, 10);
        });
        
        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu?.classList.contains('active')) {
                this.navToggle?.classList.remove('active');
                this.navMenu.classList.remove('active');
            }
        });
    }

    setActiveLink() {
        // Get the current page from the URL
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
        
        // Map filenames to navigation links
        const pageToLink = {
            'index_new.html': 'index.html',
            'index.html': 'index.html',
            'schemes.html': 'schemes.html',
            'psychology.html': 'psychology.html',
            'tests.html': 'tests.html',
            'gallery.html': 'gallery.html',
            'contact.html': 'contact.html',
            'admin.html': 'admin.html',
            'article.html': 'schemes.html',  // Articles are related to schemes section
            'psychology-article.html': 'psychology.html'  // Psychology articles are related to psychology section
        };
        
        // Determine the current page
        let currentPage = pageToLink[currentPath] || currentPath;
        
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current page's link
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href').toLowerCase();
            if (href === currentPage || href === './' + currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize
const navigation = new Navigation();
        

