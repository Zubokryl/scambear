/**
 * Articles Manager
 * Handles rendering and filtering of articles
 */

class ArticlesManager {
    constructor(apiClient) {
        if (!apiClient) throw new Error('API client must be provided');
        this.api = apiClient;
        
        this.grid = document.getElementById('articlesGrid');
        this.psychologyGrid = document.getElementById('psychologyGrid');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.modal = document.getElementById('readArticleModal');
        this.modalBody = document.getElementById('readArticleBody');
        this.closeModalBtn = document.getElementById('closeReadModal');

        this.basePath = '#schemes'; // Default section
                
        // Define category slugs for URL routing
        this.categorySlugs = {
            'architects': 'arkhitektory-illyuziy',
            'social_networks': 'sotsialnye-seti-parazitizma',
            'simulacra': 'simulyarkry-yspexa',
            'deception_zones': 'zony-obmana',
            'ethical_wardrobe': 'etichesky-chertak',
            'psychology': 'psixologiya',
            'gallery': 'gallery'
        };
        
        // Reverse mapping for hash lookup
        this.slugToCategory = {};
        for (const [category, slug] of Object.entries(this.categorySlugs)) {
            this.slugToCategory[slug] = category;
        };
                
        // Pagination variables
        this.currentPage = 1;
        this.itemsPerPage = 10; // Show 10 items per page with pagination
        this.currentArticles = [];
        this.currentCategory = 'all';
        
        // Loading state to prevent duplicate requests
        this.isLoading = false;

        this.init();
        
        // Handle initial URL if page loads with a category slug in the hash
        // NOTE: This is handled by navigation.js now to avoid conflicts
        // if (window.location.hash) {
        //     setTimeout(() => {
        //         this.handleInitialUrl();
        //     }, 100);
        // }
    }

    init() {
        this.architectsSchemes = document.getElementById('architectsSchemes');
        this.socialNetworksSchemes = document.getElementById('socialNetworksSchemes');
        this.simulacraSchemes = document.getElementById('simulacraSchemes');
        
        // Don't load articles immediately - navigation.js will handle initial load
        // this.loadArticles('all');
        
        // Removed automatic loading of psychology to avoid navigation conflicts
        // this.loadPsychology();

        // Filters
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                
                // Remove active class
                this.filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                e.target.classList.add('active');
                
                // Show/hide hardcoded schemes based on filter
                if (filter === 'architects' && this.architectsSchemes) {
                    this.architectsSchemes.style.display = 'grid';
                    if (this.socialNetworksSchemes) {
                        this.socialNetworksSchemes.style.display = 'none';
                    }
                    if (this.simulacraSchemes) {
                        this.simulacraSchemes.style.display = 'none';
                    }
                    this.grid.style.display = 'grid';
                    // Load articles for architects category
                    this.loadArticles('architects');
                    // Update URL
                    this.updateUrl('architects');
                } else if (filter === 'social_networks' && this.socialNetworksSchemes) {
                    this.socialNetworksSchemes.style.display = 'grid';
                    if (this.architectsSchemes) {
                        this.architectsSchemes.style.display = 'none';
                    }
                    if (this.simulacraSchemes) {
                        this.simulacraSchemes.style.display = 'none';
                    }
                    this.grid.style.display = 'grid';
                    // Load articles for social networks category
                    this.loadArticles('social_networks');
                    // Update URL
                    this.updateUrl('social_networks');
                } else if (filter === 'simulacra' && this.simulacraSchemes) {
                    this.simulacraSchemes.style.display = 'grid';
                    if (this.architectsSchemes) {
                        this.architectsSchemes.style.display = 'none';
                    }
                    if (this.socialNetworksSchemes) {
                        this.socialNetworksSchemes.style.display = 'none';
                    }
                    this.grid.style.display = 'grid';
                    // Load articles for simulacra category
                    this.loadArticles('simulacra');
                    // Update URL
                    this.updateUrl('simulacra');
                } else {
                    if (this.architectsSchemes) {
                        this.architectsSchemes.style.display = 'none';
                    }
                    if (this.socialNetworksSchemes) {
                        this.socialNetworksSchemes.style.display = 'none';
                    }
                    if (this.simulacraSchemes) {
                        this.simulacraSchemes.style.display = 'none';
                    }
                    this.loadArticles(filter);
                    // Update URL
                    this.updateUrl(filter);
                }
            });
        });

        // Close Modal
        this.closeModalBtn.addEventListener('click', () => {
            this.modal.classList.remove('active');
        });

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.remove('active');
            }
        });
    }
    
    handleInitialUrl() {
        // Check if there's a hash in the URL on page load
        const hash = window.location.hash.substring(1);
        
        // Check if the hash is a category slug
        if (this.slugToCategory[hash]) {
            const category = this.slugToCategory[hash];
            
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

    async loadArticles(category, page = 1) {
        // Prevent multiple simultaneous loads
        if (this.isLoading) return;
        this.isLoading = true;
        
        if (!this.grid) {
            this.isLoading = false;
            return;
        }
        
        this.currentCategory = category;
        this.currentPage = page;

        this.grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            // For the architects category, we need to load articles from all subcategories
            let articles;
            if (category === 'architects') {
                const allArticles = await this.api.getArticles({ category: 'all' });
                // Filter to include only articles with category starting with 'architects'
                articles = allArticles.filter(article => 
                    article.category === 'architects' || 
                    article.category.startsWith('architects-')
                );
            } else {
                articles = await this.api.getArticles({ category });
            }
            
            // Remove duplicates by ID to ensure uniqueness
            const uniqueArticles = Array.from(
                new Map(articles.map(a => [a.id, a])).values()
            );
            
            this.currentArticles = uniqueArticles;
            this.renderGrid(this.grid, uniqueArticles, page);
        } catch (err) {
            console.error(err);
            this.grid.innerHTML = '<p class="error">Ошибка загрузки статей</p>';
        } finally {
            this.isLoading = false;
        }
    }

    async loadPsychology(page = 1) {
        if (!this.psychologyGrid) return;
        
        this.currentCategory = 'psychology';
        this.currentPage = page;

        try {
            // Explicitly fetch psychology
            const articles = await this.api.getArticles({ category: 'psychology' });
            this.renderGrid(this.psychologyGrid, articles, page);
            
            // Update URL for psychology section
            this.updateUrl('psychology');
        } catch (err) {
            console.error(err);
        }
    }

    renderGrid(container, articles, page = 1) {
        // Check if we're rendering in the main grid vs the architects, social networks, or simulacra section
        const isArchitectsSection = container.id === 'articlesGrid' && this.architectsSchemes && this.architectsSchemes.style.display !== 'none';
        const isSocialNetworksSection = container.id === 'articlesGrid' && this.socialNetworksSchemes && this.socialNetworksSchemes.style.display !== 'none';
        const isSimulacraSection = container.id === 'articlesGrid' && this.simulacraSchemes && this.simulacraSchemes.style.display !== 'none';
        
        if (articles.length === 0) {
            if (isArchitectsSection || isSocialNetworksSection || isSimulacraSection) {
                // If we're in the architects, social networks, or simulacra section and no articles found, still show the schemes
                // Just clear the articles area, don't show the empty message
                container.innerHTML = '';
            } else {
                container.innerHTML = '<p class="empty-state">Статьи не найдены<br>Попробуйте изменить параметры поиска или зайти позже.</p>';
            }
            return;
        }
        
        // Calculate pagination
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const articlesToShow = articles.slice(startIndex, endIndex);
        const totalPages = Math.ceil(articles.length / this.itemsPerPage);

        const articlesHtml = articlesToShow.map(article => `
            <div class="article-card" onclick="articlesManager.openArticle('${article.id}')">
                ${article.image_url ? `
                <div class="article-image" style="background-image: url('${article.image_url}')">
                    <span class="article-category">${this.getCategoryName(article.category)}</span>
                    <div class="admin-controls" style="position: absolute; top: 10px; right: 10px; display: none;">
                        <button class="btn-icon" onclick="event.stopPropagation(); adminPanel.openArticleModalForEdit('${article.id}');" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="event.stopPropagation(); adminPanel.deleteArticle('${article.id}');" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span><i class="fas fa-eye"></i> ${article.views}</span>
                        <span>${new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                </div>` : `
                <div class="article-no-image">
                    <span class="article-category">${this.getCategoryName(article.category)}</span>
                    <div class="admin-controls" style="position: absolute; top: 10px; right: 10px; display: none;">
                        <button class="btn-icon" onclick="event.stopPropagation(); adminPanel.openArticleModalForEdit('${article.id}');" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="event.stopPropagation(); adminPanel.deleteArticle('${article.id}');" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="article-no-image-content">
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-excerpt">${article.excerpt}</p>
                        <div class="article-meta">
                            <span><i class="fas fa-eye"></i> ${article.views}</span>
                            <span>${new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>`}
            </div>
        `).join('');
        
        // Add admin controls script
        setTimeout(() => {
            this.addAdminControls();
        }, 100);
        
        if (isArchitectsSection || isSocialNetworksSection || isSimulacraSection) {
            // For architects, social networks, or simulacra section, update the articles area only
            container.innerHTML = articlesHtml;
            
            // Add pagination after articles
            if (totalPages >= 1) { // Show pagination for testing visibility
                const paginationHtml = this.createPaginationHtml(page, totalPages);
                container.innerHTML += paginationHtml;
            }
        } else {
            container.innerHTML = articlesHtml;
            
            // Add pagination controls
            if (totalPages >= 1) { // Show pagination for testing visibility
                const paginationHtml = this.createPaginationHtml(page, totalPages);
                container.innerHTML += paginationHtml;
            }
        }
    }

    createPaginationHtml(currentPage, totalPages) {
        let paginationHtml = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHtml += `<button onclick="articlesManager.goToPage('${this.currentCategory}', ${currentPage - 1})">&laquo; Назад</button>`;
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
                paginationHtml += `<button class="active" onclick="articlesManager.goToPage('${this.currentCategory}', ${i})">${i}</button>`;
            } else {
                paginationHtml += `<button onclick="articlesManager.goToPage('${this.currentCategory}', ${i})">${i}</button>`;
            }
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `<button onclick="articlesManager.goToPage('${this.currentCategory}', ${currentPage + 1})">Вперед &raquo;</button>`;
        } else {
            paginationHtml += `<button disabled>Вперед &raquo;</button>`;
        }
        
        paginationHtml += '</div>';
        return paginationHtml;
    }

    goToPage(category, page) {
        if (category === 'psychology') {
            this.loadPsychology(page);
        } else {
            this.loadArticles(category, page);
        }
        // Scroll to top of articles section
        const container = this.grid;
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    getCategoryName(slug) {
        const names = {
            'architects': 'Архитекторы иллюзий',
            'social_networks': 'Социальные сети паразитизма',
            'simulacra': 'Симулякры успеха',
            'deception_zones': 'Зоны обмана',
            'ethical_wardrobe': 'Этический чердак',
            'fraud_schemes': 'Схема',
            'psychology': 'Психология',
            'prevention': 'Защита',
            'case_studies': 'История',
            'all': 'Все',
            
            // Subcategories for architects
            'architects-finances': 'Финансы',
            'architects-education': 'Образование',
            'architects-entrepreneurship': 'Предпринимательство',
            'architects-network_marketing': 'Сетевой маркетинг',
            'architects-cyber_fraud': 'Кибермошенничество',
            'architects-it_fraud': 'IT-мошенничество',
            
            // Subcategories for simulacra
            'simulacra-instagram': 'Instagram',
            'simulacra-youtube': 'YouTube',
            'simulacra-telegram': 'Telegram'
        };
        return names[slug] || slug;
    }
    
    updateUrl(category) {
        // Get the transliterated slug for the category
        const slug = this.categorySlugs[category] || category;
        
        // Update the URL without page reload
        const newUrl = `${window.location.pathname}#${slug}`;
        window.history.pushState({}, '', newUrl);
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

    async openArticle(id) {
        const article = await this.api.getArticleById(id);
        if (!article) return;

        // Process tags for display
        let tagsHtml = '';
        if (article.tags) {
            const tags = article.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tags.length > 0) {
                tagsHtml = `
                <div class="article-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>`;
            }
        }
        
        this.modalBody.innerHTML = `
            <div class="article-header">
                <h2>${article.title}</h2>
                <div class="meta">
                    <span class="badge">${this.getCategoryName(article.category)}</span>
                    <span class="date">${new Date(article.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            ${article.image_url ? `<img src="${article.image_url}" class="article-hero-img">` : ''}
            <div class="article-text">
                ${article.content}
            </div>
            ${tagsHtml}
        `;

        this.modal.classList.add('active');
        this.modalBody.scrollTop = 0;
    }
}

// ArticlesManager is initialized in main.js with dependency injection
// const articlesManager = new ArticlesManager(window.api);
