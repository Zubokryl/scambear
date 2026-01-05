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
            'gallery': 'gallery',
            'all': 'all'
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
        
        // ✅ ГЛАВНЫЙ ФИКС: Загружать ВСЕ статьи по умолчанию на схемах
        // Вызываем сразу, а не через таймаут, чтобы избежать проблем с инициализацией
        this.handleInitialLoad();
        
        // Также добавляем таймаут как резервный вариант
        setTimeout(() => {
            this.handleInitialLoad();
        }, 200);
    }
        
    handleInitialLoad() {
        const articlesGrid = document.getElementById('articlesGrid');
        const psychologyGrid = document.getElementById('psychologyGrid');
            
        // Check if we're on the schemes page
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
            
        if (articlesGrid?.dataset.autoLoad === 'true' && currentPath.includes('schemes') && !window.location.hash) {
            // On schemes page, load ALL articles by default
            // BUT don't update the URL to avoid adding the hash initially
            // Make sure the correct containers are visible
            if (this.grid) {
                // Show the main grid and hide category-specific containers
                this.grid.style.display = 'grid';
                if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
            }
            // Load ALL articles without updating URL
            this.loadArticlesWithoutUrlUpdate('all');
        } else if (psychologyGrid && !window.location.hash) {
            // On psychology page, load psychology articles by default
            this.loadPsychology();
        } else if (window.location.hash) {
            // Only handle initial URL if there's already a hash
            this.handleInitialUrl();
        }
    }
        
    clearHash() {
        if (window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
        
    init() {
        this.architectsSchemes = document.getElementById('architectsSchemes');
        this.socialNetworksSchemes = document.getElementById('socialNetworksSchemes');
        this.simulacraSchemes = document.getElementById('simulacraSchemes');
        
        // Don't load articles immediately - navigation.js will handle initial load
        // this.loadArticles('all');
        
        // Removed automatic loading of psychology to avoid navigation conflicts
        // this.loadPsychology();

        // Filters - only add event listeners if filterBtns exist
        if (this.filterBtns && this.filterBtns.length > 0) {
            this.filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.dataset.filter;
                    
                    // Remove active class
                    this.filterBtns.forEach(b => b.classList.remove('active'));
                    // Add to clicked
                    e.target.classList.add('active');
                    
                    // Update subtitle
                    this.updateSubtitle(filter);
                    
                    // Show/hide hardcoded schemes based on filter
                    if (filter === 'architects' && this.architectsSchemes) {
                        // Show architects section and hide others
                        this.architectsSchemes.style.display = 'grid';
                        if (this.socialNetworksSchemes) {
                            this.socialNetworksSchemes.style.display = 'none';
                        }
                        if (this.simulacraSchemes) {
                            this.simulacraSchemes.style.display = 'none';
                        }
                        if (this.grid) {
                            this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                        }
                        // Load articles for architects category
                        this.loadArticles('architects');
                        // Update URL
                        this.updateUrl('architects');
                    } else if (filter === 'social_networks' && this.socialNetworksSchemes) {
                        // Show social networks section and hide others
                        this.socialNetworksSchemes.style.display = 'grid';
                        if (this.architectsSchemes) {
                            this.architectsSchemes.style.display = 'none';
                        }
                        if (this.simulacraSchemes) {
                            this.simulacraSchemes.style.display = 'none';
                        }
                        if (this.grid) {
                            this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                        }
                        // Load articles for social networks category
                        this.loadArticles('social_networks');
                        // Update URL
                        this.updateUrl('social_networks');
                    } else if (filter === 'simulacra' && this.simulacraSchemes) {
                        // Show simulacra section and hide others
                        this.simulacraSchemes.style.display = 'grid';
                        if (this.architectsSchemes) {
                            this.architectsSchemes.style.display = 'none';
                        }
                        if (this.socialNetworksSchemes) {
                            this.socialNetworksSchemes.style.display = 'none';
                        }
                        if (this.grid) {
                            this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                        }
                        // Load articles for simulacra category
                        this.loadArticles('simulacra');
                        // Update URL
                        this.updateUrl('simulacra');
                    } else {
                        // For other filters, hide category-specific containers
                        if (this.architectsSchemes) {
                            this.architectsSchemes.style.display = 'none';
                        }
                        if (this.socialNetworksSchemes) {
                            this.socialNetworksSchemes.style.display = 'none';
                        }
                        if (this.simulacraSchemes) {
                            this.simulacraSchemes.style.display = 'none';
                        }
                        // Show main grid for other categories
                        if (this.grid) {
                            this.grid.style.display = 'grid';
                        }
                        this.loadArticles(filter);
                        // Update URL
                        this.updateUrl(filter);
                    }
                });
            });
            
            // Only auto-click active filter if there's no hash in URL
            // If there's a hash, the handleInitialUrl will handle the routing
            // On schemes page, avoid auto-clicking to prevent hash from being added initially
            const currentPath = window.location.pathname.split('/').pop().toLowerCase();
            if (!window.location.hash && !currentPath.includes('schemes')) {
                const activeFilterBtn = document.querySelector('.filter-btn.active');
                if (activeFilterBtn) {
                    const initialFilter = activeFilterBtn.dataset.filter;
                    // Simulate a click on the active filter to set the initial display state
                    activeFilterBtn.click();
                }
            }
        }

        // Close Modal
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => {
                this.modal.classList.remove('active');
            });
        }

        // Close on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.modal.classList.remove('active');
                }
            });
        }
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
                
                // Update subtitle
                this.updateSubtitle(category);
                
                // Show/hide hardcoded schemes based on category
                if (category === 'architects' && this.architectsSchemes) {
                    this.architectsSchemes.style.display = 'grid';
                    if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                    if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    if (this.grid) this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                } else if (category === 'social_networks' && this.socialNetworksSchemes) {
                    this.socialNetworksSchemes.style.display = 'grid';
                    if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                    if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    if (this.grid) this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                } else if (category === 'simulacra' && this.simulacraSchemes) {
                    this.simulacraSchemes.style.display = 'grid';
                    if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                    if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                    if (this.grid) this.grid.style.display = 'none'; // Hide main grid when showing category-specific content
                } else {
                    if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                    if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                    if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    if (this.grid) this.grid.style.display = 'grid'; // Show main grid for other categories
                }
                
                // Load articles for the selected category
                this.loadArticles(category);
            }
        } else {
            // If the hash is not recognized, check if it might be an invalid format
            // like '-all' and try to handle it by loading all articles
            if (hash) {
                // Check if removing a potential leading dash gives us a valid category
                const potentialCategory = hash.startsWith('-') ? hash.substring(1) : hash;
                if (potentialCategory === 'all') {
                    // Load all articles
                    if (this.grid) {
                        // Show the main grid and hide category-specific containers
                        this.grid.style.display = 'grid';
                        if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                        if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                        if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    }
                    this.loadArticles('all');
                } else {
                    // For other unrecognized hashes, still try to load all articles by default
                    if (this.grid) {
                        this.grid.style.display = 'grid';
                        if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                        if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                        if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    }
                    this.loadArticles('all');
                }
            }
        }
    }

    async loadArticles(category, page = 1) {
        // Prevent multiple simultaneous loads
        if (this.isLoading) return;
        this.isLoading = true;
        
        // Determine the appropriate container based on category and page
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
        let targetContainer;
        
        // On schemes page, use specific containers for certain categories
        if (currentPath.includes('schemes')) {
            if (category === 'architects' && this.architectsSchemes) {
                // Show architects section and hide others
                this.architectsSchemes.style.display = 'grid';
                if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.architectsSchemes;
            } else if (category === 'social_networks' && this.socialNetworksSchemes) {
                // Show social networks section and hide others
                this.socialNetworksSchemes.style.display = 'grid';
                if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.socialNetworksSchemes;
            } else if (category === 'simulacra' && this.simulacraSchemes) {
                // Show simulacra section and hide others
                this.simulacraSchemes.style.display = 'grid';
                if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.simulacraSchemes;
            } else {
                targetContainer = this.grid;
            }
        } else {
            // For other pages, use the available grid
            targetContainer = this.grid || this.psychologyGrid;
        }
        
        if (!targetContainer) {
            this.isLoading = false;
            return;
        }
        
        this.currentCategory = category;
        this.currentPage = page;

        targetContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            // For the architects category, we need to load articles from all subcategories
            let articles;
            if (category === 'architects') {
                articles = await this.api.getArticles({ category: 'all' });
                // Filter to include only articles with architect-related categories
                // Using exact matches and proper prefixes
                articles = articles.filter(article => 
                    article.category === 'architects' || 
                    article.category === 'Architects' ||
                    article.category === 'архитекторы' ||
                    article.category === 'Архитекторы' ||
                    article.category.startsWith('architects-') ||
                    article.category.startsWith('Architects-') ||
                    article.category.startsWith('архитекторы-') ||
                    article.category.startsWith('Архитекторы-')
                );
            } else {
                articles = await this.api.getArticles({ category });
            }
            
            // Remove duplicates by ID to ensure uniqueness
            const uniqueArticles = Array.from(
                new Map(articles.map(a => [a.id, a])).values()
            );
            
            this.currentArticles = uniqueArticles;
            this.renderGrid(targetContainer, uniqueArticles, page);
        } catch (err) {
            console.error(err);
            targetContainer.innerHTML = '<p class="error">Ошибка загрузки статей</p>';
        } finally {
            this.isLoading = false;
        }
    }

    async loadPsychology(page = 1) {
        if (!this.psychologyGrid) return;
        
        this.currentCategory = 'psychology';
        this.currentPage = page;

        this.psychologyGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            // Get all articles and filter for psychology-related categories
            const articles = await this.api.getArticles({ category: 'all' });
            // Filter to include only articles with psychology-related categories
            const psychologyArticles = articles.filter(article => 
                article.category === 'psychology' || 
                article.category === 'Psychology' ||
                article.category === 'психология' ||
                article.category === 'Психология' ||
                article.category.toLowerCase().includes('psychology') ||
                article.category.toLowerCase().includes('психолог')
            );
            
            this.renderGrid(this.psychologyGrid, psychologyArticles, page);
            
            // Update URL for psychology section
            this.updateUrl('psychology');
        } catch (err) {
            console.error(err);
            this.psychologyGrid.innerHTML = '<p class="error">Ошибка загрузки статей</p>';
        }
    }

    renderGrid(container, articles, page = 1) {
        // Check if we're rendering in the schemes-specific containers
        const isSpecialSection = ['architectsSchemes', 'socialNetworksSchemes', 'simulacraSchemes'].includes(container.id);
        
        if (articles.length === 0) {
            if (isSpecialSection) {
                // If we're in the special sections and no articles found, just clear the area
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
            <article class="article-card" itemscope itemtype="https://schema.org/Article">
                <a href="${this.getArticleLink(article)}" class="article-link" itemprop="url" aria-label="Читать статью: ${article.title}">
                    ${this.renderArticleImage(article)}
                    <div class="article-content">
                        <h2 class="article-title" itemprop="headline">${article.title}</h2>
                        <p class="article-excerpt" itemprop="description">${article.excerpt}</p>
                        <div class="article-meta">
                            <span><i class="fas fa-eye"></i> ${article.views}</span>
                            <span itemprop="datePublished">${new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </a>
                ${this.renderAdminControls(article)}
            </article>
        `).join('');
        
        // Add admin controls script
        this.addAdminControls();
        
        container.innerHTML = articlesHtml;
        
        // Add pagination controls
        if (totalPages >= 1) {
            const paginationHtml = this.createPaginationHtml(page, totalPages);
            container.innerHTML += paginationHtml;
        }
    }
    
    renderArticleImage(article) {
        if (!article.image_url) return '';
        return `
            <img src="${article.image_url}" 
                 alt="${article.title}" 
                 itemprop="image" 
                 loading="lazy" 
                 class="article-image"
                 style="object-fit: cover; width: 100%; height: 200px;">
            <span class="article-category">${window.articlesUtils.getCategoryName(article.category)}</span>`;
    }
    
    renderAdminControls(article) {
        const adminControls = `
            <div class="admin-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000; display: none;">
                <button class="btn-icon" data-action="edit" data-article-id="${article.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" data-action="delete" data-article-id="${article.id}" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
        return article.image_url ? adminControls : adminControls;
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
        
        // Determine which container to scroll to based on category and page
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
        let targetContainer;
        
        if (currentPath.includes('schemes')) {
            if (category === 'architects' && this.architectsSchemes) {
                targetContainer = this.architectsSchemes;
            } else if (category === 'social_networks' && this.socialNetworksSchemes) {
                targetContainer = this.socialNetworksSchemes;
            } else if (category === 'simulacra' && this.simulacraSchemes) {
                targetContainer = this.simulacraSchemes;
            } else {
                targetContainer = this.grid;
            }
        } else {
            // For other pages, use the available grid
            targetContainer = this.grid || this.psychologyGrid;
        }
        
        if (targetContainer) {
            targetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[а-яё]/g, function(match) {
                // Транслитерация кириллических символов
                const cyrillicToLatin = {
                    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
                    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l',
                    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
                    'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
                    'ш': 'sh', 'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
                };
                return cyrillicToLatin[match] || match;
            })
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .split(/\s+/)
            .join('-')
            .substring(0, 80);
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
    
    getArticleLink(article) {
        // For psychology category, use dedicated psychology article page
        if (this.currentCategory === 'psychology') {
            return `./psychology-article.html?slug=${window.articlesUtils.generateSlug(article.title)}`;
        } else {
            // For other categories, use the general article page with ref parameter
            return `./article.html?slug=${window.articlesUtils.generateSlug(article.title)}&ref=schemes-${this.currentCategory}`;
        }
    }
    
    updateSubtitle(filterValue) {
        // Get all filter subtitles
        const filterSubtitles = document.querySelectorAll('.filter-subtitle');
        
        // Hide all subtitles
        filterSubtitles.forEach(subtitle => {
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
            if (simulacraSubtitle) {
                simulacraSubtitle.style.display = 'block';
            }
        }
    }
    
    async loadArticlesWithoutUrlUpdate(category, page = 1) {
        // Same as loadArticles but without calling updateUrl
        // Prevent multiple simultaneous loads
        if (this.isLoading) return;
        this.isLoading = true;
        
        // Determine the appropriate container based on category and page
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
        let targetContainer;
        
        // On schemes page, use specific containers for certain categories
        if (currentPath.includes('schemes')) {
            if (category === 'all') {
                // For 'all' category on schemes page, we want to show all articles
                // Render to the main grid container to show all articles together
                if (this.grid) {
                    // Show the main grid and hide category-specific containers
                    this.grid.style.display = 'grid';
                    if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                    if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                    if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                    targetContainer = this.grid;
                } else {
                    // Fallback to first available container
                    if (this.architectsSchemes) {
                        this.architectsSchemes.style.display = 'grid';
                        if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                        if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                        if (this.grid) this.grid.style.display = 'none';
                        targetContainer = this.architectsSchemes;
                    }
                }
            } else if (category === 'architects' && this.architectsSchemes) {
                // Show architects section and hide others
                this.architectsSchemes.style.display = 'grid';
                if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.architectsSchemes;
            } else if (category === 'social_networks' && this.socialNetworksSchemes) {
                // Show social networks section and hide others
                this.socialNetworksSchemes.style.display = 'grid';
                if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                if (this.simulacraSchemes) this.simulacraSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.socialNetworksSchemes;
            } else if (category === 'simulacra' && this.simulacraSchemes) {
                // Show simulacra section and hide others
                this.simulacraSchemes.style.display = 'grid';
                if (this.architectsSchemes) this.architectsSchemes.style.display = 'none';
                if (this.socialNetworksSchemes) this.socialNetworksSchemes.style.display = 'none';
                // Also hide the general articles grid
                if (this.grid) this.grid.style.display = 'none';
                targetContainer = this.simulacraSchemes;
            } else {
                targetContainer = this.grid;
            }
        } else {
            // For other pages, use the available grid
            targetContainer = this.grid || this.psychologyGrid;
        }
        
        if (!targetContainer) {
            this.isLoading = false;
            return;
        }
        
        this.currentCategory = category;
        this.currentPage = page;

        targetContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка...</p></div>';

        try {
            // For the architects category, we need to load articles from all subcategories
            // For 'all' category, load all articles without filtering
            let articles;
            if (category === 'all') {
                articles = await this.api.getArticles({ category: 'all' });
                // Don't filter, show all articles
            } else if (category === 'architects') {
                articles = await this.api.getArticles({ category: 'all' });
                // Filter to include only articles with architect-related categories
                // Using exact matches and proper prefixes
                articles = articles.filter(article => 
                    article.category === 'architects' || 
                    article.category === 'Architects' ||
                    article.category === 'архитекторы' ||
                    article.category === 'Архитекторы' ||
                    article.category.startsWith('architects-') ||
                    article.category.startsWith('Architects-') ||
                    article.category.startsWith('архитекторы-') ||
                    article.category.startsWith('Архитекторы-')
                );
            } else {
                articles = await this.api.getArticles({ category });
            }
            
            // Remove duplicates by ID to ensure uniqueness
            const uniqueArticles = Array.from(
                new Map(articles.map(a => [a.id, a])).values()
            );
            
            this.currentArticles = uniqueArticles;
            this.renderGrid(targetContainer, uniqueArticles, page);
        } catch (err) {
            console.error(err);
            targetContainer.innerHTML = '<p class="error">Ошибка загрузки статей</p>';
        } finally {
            this.isLoading = false;
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
                
                // Add event listeners for admin controls using event delegation
                // Check if event listener already exists to prevent duplicates
                if (!this.adminControlsBound) {
                    document.addEventListener('click', (e) => {
                        const btn = e.target.closest('button[data-action]');
                        if (btn) {
                            e.stopPropagation();
                            const action = btn.getAttribute('data-action');
                            const articleId = btn.getAttribute('data-article-id');
                            
                            console.log('Admin button clicked:', action, articleId); // Debug log
                            
                            if (action === 'edit' && window.adminPanel) {
                                console.log('Opening edit modal for article:', articleId); // Debug log
                                window.adminPanel.openArticleModalForEdit(articleId);
                            } else if (action === 'delete' && window.adminPanel) {
                                console.log('Deleting article:', articleId); // Debug log
                                window.adminPanel.deleteArticle(articleId);
                            } else if (action === 'edit' && !window.adminPanel) {
                                console.error('Admin panel not available for edit operation');
                                alert('Функция администратора недоступна. Пожалуйста, перезагрузите страницу.');
                            } else if (action === 'delete' && !window.adminPanel) {
                                console.error('Admin panel not available for delete operation');
                                alert('Функция администратора недоступна. Пожалуйста, перезагрузите страницу.');
                            }
                        }
                    });
                    this.adminControlsBound = true; // Mark that the event listener has been bound
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

// Modal functionality removed for SEO optimization - articles now open in separate pages
    
    async searchArticles(query, category = 'all') {
        if (!query || query.trim().length === 0) {
            // If no query, return all articles
            return await this.api.getArticles({ category });
        }
        
        // Get all articles
        const allArticles = await this.api.getArticles({ category: 'all' });
        
        // Normalize the search query
        const normalizedQuery = query.toLowerCase().trim();
        
        // Split query into words for multi-term search
        const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
        
        // Filter articles based on search terms
        const filteredArticles = allArticles.filter(article => {
            // Combine relevant fields for searching
            const searchableText = [
                article.title || '',
                article.excerpt || '',
                article.content || '',
                article.category || '',
                article.tags || ''
            ].join(' ').toLowerCase();
            
            // Check if all search terms exist in the searchable text
            return searchTerms.every(term => searchableText.includes(term));
        });
        
        // Sort results by relevance (how many search terms match)
        filteredArticles.sort((a, b) => {
            const aMatches = searchTerms.filter(term => 
                [
                    a.title || '',
                    a.excerpt || '',
                    a.content || '',
                    a.category || '',
                    a.tags || ''
                ].join(' ').toLowerCase().includes(term)
            ).length;
            
            const bMatches = searchTerms.filter(term => 
                [
                    b.title || '',
                    b.excerpt || '',
                    b.content || '',
                    b.category || '',
                    b.tags || ''
                ].join(' ').toLowerCase().includes(term)
            ).length;
            
            // Sort by number of matches (descending)
            return bMatches - aMatches;
        });
        
        return filteredArticles;
    }
    
    renderSearchResults(container, articles, page = 1) {
        // Use the same rendering logic as renderGrid
        this.renderGrid(container, articles, page);
    }
}

// ArticlesManager is initialized in main.js with dependency injection
// const articlesManager = new ArticlesManager(window.api);
