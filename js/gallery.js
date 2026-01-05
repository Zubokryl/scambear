/**
 * Gallery Manager
 * Handles gallery rendering and lightbox
 */

class GalleryManager {
    constructor(apiClient) {
        if (!apiClient) throw new Error('API client must be provided');
        this.api = apiClient;
        
        this.grid = document.getElementById('galleryGrid');
        this.filterBtns = document.querySelectorAll('.gallery-filter-btn');

        // Lightbox elements
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImage');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxDesc = document.getElementById('lightboxDescription');
        this.closeBtn = document.getElementById('lightboxClose');
        this.prevBtn = document.getElementById('lightboxPrev');
        this.nextBtn = document.getElementById('lightboxNext');

        this.currentItems = [];
        this.currentIndex = 0;
        this.currentPage = 1;
        this.itemsPerPage = 10; // Show 10 items per page with pagination
        this.isRefreshing = false; // Flag to prevent multiple simultaneous refreshes
        
        // Define category slugs for URL routing
        this.categorySlugs = {
            'gallery-all': 'gallery',
            'gallery-phishing': 'gallery',
            'gallery-phone_scams': 'gallery',
            'gallery-online_fraud': 'gallery',
            'gallery-identity_theft': 'gallery'
        };
        
        // Reverse mapping for hash lookup
        this.slugToCategory = {};
        for (const [category, slug] of Object.entries(this.categorySlugs)) {
            this.slugToCategory[slug] = category;
        };

        this.init();
        
        // Load gallery content initially - REMOVED to avoid navigation conflicts
        // this.loadGallery('all');
        
        // Handle initial URL if page loads with a category slug in the hash
        // NOTE: This is handled by navigation.js now to avoid conflicts
        // if (window.location.hash) {
        //     setTimeout(() => {
        //         this.handleInitialUrl();
        //     }, 100);
        // }
        

    }
    
    handleInitialUrl() {
        // Check if there's a hash in the URL on page load
        const hash = window.location.hash.substring(1);
        
        // Check if the hash is a gallery category slug
        if (this.slugToCategory[hash]) {
            const category = this.slugToCategory[hash].replace('gallery-', '');
            
            // Find the corresponding filter button and click it
            const filterBtn = document.querySelector(`button[data-filter="${category}"]`);
            if (filterBtn) {
                // Remove active class from all buttons
                this.filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to the selected button
                filterBtn.classList.add('active');
                
                // Trigger the filter
                this.filterBtns.forEach(btn => {
                    if (btn.dataset.filter === category) {
                        btn.click();
                    }
                });
            }
        }
    }
    
    updateUrl(category) {
        // Create a slug for the gallery category
        const slug = `gallery-${category}`;
        
        // Update the URL without page reload
        const newUrl = `${window.location.pathname}#${slug}`;
        window.history.pushState({}, '', newUrl);
    }

    init() {


        // Filters
        if (this.filterBtns && this.filterBtns.length > 0) {
            this.filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.loadGallery(e.target.dataset.filter);
                });
            });
        }

        // Lightbox Controls
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeLightbox());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.navigate(1));
        }

        // Keyboard Nav
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox || !this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });

        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) this.closeLightbox();
            });
        }
    }

    async loadGallery(category) {
        if (!this.grid) return;
        
        // Prevent multiple simultaneous refreshes
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        this.currentCategory = category;
        this.currentPage = 1;  // Reset to first page when loading a new category

        this.grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            this.currentItems = await this.api.getGallery({ category });
            this.renderGrid(1);  // Render first page
            
            // Update URL for gallery section
            this.updateUrl(category);
        } catch (err) {
            console.error(err);
        } finally {
            // Reset the refresh flag
            this.isRefreshing = false;
        }
    }

    renderGrid(page = 1) {
        if (this.currentItems.length === 0) {
            this.grid.innerHTML = '<p class="empty-state">Изображения не найдены<br>Попробуйте изменить параметры поиска или зайти позже.</p>';
            return;
        }
        
        // Filter out items that don't have valid image URLs
        const validItems = this.currentItems.filter(item => item.image_url && item.image_url.trim() !== '');
        
        if (validItems.length === 0) {
            // If all items are invalid (no image URLs), show empty state
            this.grid.innerHTML = '<p class="empty-state">Изображения не найдены<br>Попробуйте изменить параметры поиска или зайти позже.</p>';
            return;
        }
        
        // Calculate pagination based on valid items only
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const itemsToShow = validItems.slice(startIndex, endIndex);
        const totalPages = Math.ceil(validItems.length / this.itemsPerPage);
        
        this.grid.innerHTML = itemsToShow.map((item, index) => `
            <figure class="gallery-item" itemscope itemtype="https://schema.org/ImageObject" onclick="galleryManager.openLightboxWithValidItems(${startIndex + index})">
                <img itemprop="contentUrl image" src="${item.image_url}" 
                     alt="${item.title} — ${this.getCategoryName(item.category)}. ${item.description ? item.description.substring(0,50) : 'Пример мошенничества'}" 
                     loading="lazy">
                <div class="admin-controls" style="position: absolute; top: 10px; right: 10px; display: none; z-index: 10;">
                    <button class="btn-icon" onclick="event.stopPropagation(); adminPanel.openGalleryModalForEdit('${item.id}');" title="Редактировать" style="background: rgba(0,0,0,0.7); border: 1px solid #fff;">
                        <i class="fas fa-edit" style="color: white;"></i>
                    </button>
                    <button class="btn-icon delete" onclick="event.stopPropagation(); adminPanel.deleteGalleryItem('${item.id}');" title="Удалить" style="background: rgba(0,0,0,0.7); border: 1px solid #fff;">
                        <i class="fas fa-trash" style="color: white;"></i>
                    </button>
                </div>
                <figcaption itemprop="name description">
                    <h3 itemprop="headline">${item.title}</h3>
                    <p itemprop="caption">${this.getCategoryName(item.category)}</p>
                </figcaption>
            </figure>
        `).join('');
        
        // Add admin controls script
        this.addAdminControls();
        
        // Add pagination controls
        if (totalPages > 1) {
            const paginationHtml = this.createPaginationHtml(page, totalPages);
            this.grid.innerHTML += paginationHtml;
        }
    }

    getCategoryName(slug) {
        const names = {
            'phishing': 'Фишинг',
            'phone_scams': 'Телефон',
            'online_fraud': 'Онлайн',
            'identity_theft': 'Кража личности',
            'general': 'Общее',
            'all': 'Все'
        };
        return names[slug] || slug;
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightboxContent();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    openLightboxWithValidItems(index) {
        // Get the actual item from the valid items array
        const validItems = this.currentItems.filter(item => item.image_url && item.image_url.trim() !== '');
        if (validItems[index]) {
            // Find the index of this item in the original array
            const originalIndex = this.currentItems.findIndex(item => item.id === validItems[index].id);
            this.openLightbox(originalIndex);
        }
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    navigate(dir) {
        // Get valid items for navigation
        const validItems = this.currentItems.filter(item => item.image_url && item.image_url.trim() !== '');
        
        // Find the current item's index in the valid items array
        const currentItem = this.currentItems[this.currentIndex];
        let currentValidIndex = validItems.findIndex(item => item.id === currentItem.id);
        
        // If current item is not in valid items, start from first valid item
        if (currentValidIndex === -1) {
            currentValidIndex = 0;
        }
        
        // Navigate in the valid items array
        currentValidIndex += dir;
        if (currentValidIndex < 0) currentValidIndex = validItems.length - 1;
        if (currentValidIndex >= validItems.length) currentValidIndex = 0;
        
        // Find the index of this valid item in the original array
        this.currentIndex = this.currentItems.findIndex(item => item.id === validItems[currentValidIndex].id);
        
        this.updateLightboxContent();
    }

    updateLightboxContent() {
        const item = this.currentItems[this.currentIndex];
        
        // Only update if the item has a valid image URL
        if (item.image_url && item.image_url.trim() !== '') {
            this.lightboxImg.src = item.image_url;
            this.lightboxImg.style.display = 'block';
        } else {
            this.lightboxImg.style.display = 'none';
        }
        
        this.lightboxTitle.innerText = item.title;
        this.lightboxDesc.innerText = item.description || item.desc || ''; // Use description if available, fallback to empty string
    }
    
    createPaginationHtml(currentPage, totalPages) {
        let paginationHtml = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHtml += `<button onclick="galleryManager.goToPage('${this.currentCategory}', ${currentPage - 1})">&laquo; Назад</button>`;
        } else {
            paginationHtml += `<button disabled>&laquo; Назад</button>`;
        }
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHtml += `<button class="active" onclick="galleryManager.goToPage('${this.currentCategory}', ${i})">${i}</button>`;
            } else {
                paginationHtml += `<button onclick="galleryManager.goToPage('${this.currentCategory}', ${i})">${i}</button>`;
            }
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `<button onclick="galleryManager.goToPage('${this.currentCategory}', ${currentPage + 1})">Вперед &raquo;</button>`;
        } else {
            paginationHtml += `<button disabled>Вперед &raquo;</button>`;
        }
        
        paginationHtml += '</div>';
        return paginationHtml;
    }
    
    goToPage(category, page) {
        this.currentPage = page;  // Store current page
        this.currentCategory = category;  // Update current category
        
        if (!this.grid) return;
        
        // Prevent multiple simultaneous refreshes
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;

        this.grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            // Re-render with the specific page
            this.renderGrid(page);
            
            // Update URL for gallery section
            this.updateUrl(category);
        } catch (err) {
            console.error(err);
        } finally {
            // Reset the refresh flag
            this.isRefreshing = false;
        }
    }
    
    async addAdminControls() {
        // Check if user is an admin
        try {
            const isAdmin = await this.api.isAdminAuthenticated();
            if (isAdmin) {
                // Show admin controls
                const adminControls = document.querySelectorAll('.admin-controls');
                adminControls.forEach(control => {
                    control.style.display = 'block';
                });
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }
}

// GalleryManager is initialized in main.js with dependency injection
// const galleryManager = new GalleryManager(window.api);
