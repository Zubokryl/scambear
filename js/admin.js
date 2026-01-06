/**
 * Admin Panel Manager
 * Handles CRUD for Articles and Gallery
 */

class AdminPanel {
    constructor(apiClient) {
        if (!apiClient) throw new Error('API client must be provided');
        this.api = apiClient;
        
        // Tabs
        this.tabs = document.querySelectorAll('.admin-tab-btn');
        this.panels = document.querySelectorAll('.admin-panel');

        // Login UI
        this.loginForm = document.getElementById('loginForm');
        this.adminLoginForm = document.getElementById('adminLoginForm');
        this.adminContent = document.getElementById('adminContent');

        // Articles UI
        this.articlesList = document.getElementById('articlesList');
        this.articleModal = document.getElementById('articleModal');
        this.articleForm = document.getElementById('articleForm');
        this.newArticleBtn = document.getElementById('newArticleBtn');
        this.closeArticleModal = document.getElementById('closeArticleModal');
        this.cancelArticleBtn = document.getElementById('cancelArticleBtn');

        // Gallery UI
        this.galleryList = document.getElementById('galleryList');
        this.galleryModal = document.getElementById('galleryModal');
        this.galleryForm = document.getElementById('galleryForm');
        this.newGalleryBtn = document.getElementById('newGalleryBtn');
        this.closeGalleryModal = document.getElementById('closeGalleryModal');
        this.cancelGalleryBtn = document.getElementById('cancelGalleryBtn');
        
        

        this.isSubmitting = false;

        this.init();
    }

    init() {
        // Login form handler
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // Check auth status
        this.checkInitialAuthStatus();

        // Initialize Quill toolbar
        this.initTextFormattingToolbar();

        // Tabs
        this.tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.tabs.forEach(b => b.classList.remove('active'));
                this.panels.forEach(p => p.classList.remove('active'));

                e.target.classList.add('active');
                let targetId;
                if (e.target.dataset.tab === 'articles') {
                    targetId = 'adminArticles';
                } else if (e.target.dataset.tab === 'gallery') {
                    targetId = 'adminGallery';

                }
                const target = document.getElementById(targetId);
                if (target) target.classList.add('active');
            });
        });

        // Article buttons
        if (this.newArticleBtn) this.newArticleBtn.addEventListener('click', () => this.openArticleModal());
        if (this.closeArticleModal) this.closeArticleModal.addEventListener('click', () => this.closeModal(this.articleModal));
        if (this.cancelArticleBtn) this.cancelArticleBtn.addEventListener('click', () => this.closeModal(this.articleModal));

        // Article form submit
        if (this.articleForm) this.articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleArticleSubmit();
        });

        // Gallery buttons
        if (this.newGalleryBtn) this.newGalleryBtn.addEventListener('click', () => this.openGalleryModal());
        if (this.closeGalleryModal) this.closeGalleryModal.addEventListener('click', () => this.closeModal(this.galleryModal));
        if (this.cancelGalleryBtn) this.cancelGalleryBtn.addEventListener('click', () => this.closeModal(this.galleryModal));

        // Gallery form submit
        if (this.galleryForm) this.galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleGallerySubmit();
        });
        


        // Article category change
        const articleCategorySelect = document.getElementById('articleCategory');
        const subcategoryGroup = document.getElementById('subcategoryGroup');
        if (articleCategorySelect && subcategoryGroup) {
            articleCategorySelect.addEventListener('change', (e) => {
                if (e.target.value === 'architects') {
                    subcategoryGroup.style.display = 'block';
                } else {
                    subcategoryGroup.style.display = 'none';
                    const subcategoryInput = document.getElementById('articleSubcategory');
                    if (subcategoryInput) subcategoryInput.value = '';
                }
            });
        }
    }

    closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    async handleLogin() {
        const emailInput = document.getElementById('adminEmail');
        const passwordInput = document.getElementById('adminPassword');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert('Пожалуйста, введите email и пароль');
            return;
        }

        try {
            await this.api.loginAdmin(email, password);
            this.showAdminContent();
            this.loadArticlesList();
            this.loadGalleryList();
        } catch (error) {
            console.error('Login failed:', error);
            alert('Ошибка входа. Проверьте учетные данные.');
        }
    }

    showAdminContent() {
        if (this.adminLoginForm) this.adminLoginForm.style.display = 'none';
        if (this.adminContent) this.adminContent.style.display = 'block';
    }

    async handleLogout() {
        if (!confirm('Вы уверены, что хотите выйти?')) return;
        try {
            await this.api.requireAdmin(); // Just to validate
            await this.api.logoutAdmin(); // Actually logout from Supabase
            if (this.loginForm) this.loginForm.reset();
            if (this.adminContent) this.adminContent.style.display = 'none';
            if (this.adminLoginForm) this.adminLoginForm.style.display = 'block';
        } catch (error) {
            console.error('Logout error:', error);
            // Still reset UI even if logout fails
            if (this.loginForm) this.loginForm.reset();
            if (this.adminContent) this.adminContent.style.display = 'none';
            if (this.adminLoginForm) this.adminLoginForm.style.display = 'block';
        }
    }

    initTextFormattingToolbar() {
        if (window.Quill && document.getElementById('articleContent') && !this.quill) {
            this.quill = new Quill('#articleContent', {
                modules: { toolbar: '#articleContentToolbar' },
                theme: 'snow',
                placeholder: 'Введите содержание статьи...'
            });
        }
    }

    async requireAdmin() {
        const isAdmin = await this.api.isAdminAuthenticated();
        if (!isAdmin) {
            alert('Вы должны войти как администратор для выполнения этого действия.');
            throw new Error('Not admin');
        }
    }

    // --- Articles ---
    async loadArticlesList() {
        try {
            await this.requireAdmin();
        } catch (error) {
            if (this.articlesList) {
                this.articlesList.innerHTML = '<p class="empty-state">Для просмотра статей необходимо авторизоваться.</p>';
            }
            return;
        }
        if (this.articlesList) {
            this.articlesList.innerHTML = '<p class="empty-state">Редактирование и удаление статей осуществляется непосредственно на странице статьи.</p>';
        }
    }

    openArticleModal(article = null) {
        if (!this.articleForm) return;
        this.articleForm.reset();
        const articleModalTitle = document.getElementById('articleModalTitle');
        if (articleModalTitle) articleModalTitle.innerText = article ? 'Редактировать статью' : 'Новая статья';

        this.initTextFormattingToolbar();

        if (article) {
            document.getElementById('articleId').value = article.id || '';
            document.getElementById('articleTitle').value = article.title || '';
            let category = article.category || '';
            let subcategory = '';
            if (category.startsWith('architects-')) {
                subcategory = category.replace('architects-', '');
                category = 'architects';
            }
            const categorySelect = document.getElementById('articleCategory');
            const subcategoryInput = document.getElementById('articleSubcategory');
            const subcategoryGroup = document.getElementById('subcategoryGroup');
            if (categorySelect) categorySelect.value = category;
            if (subcategoryGroup) subcategoryGroup.style.display = category === 'architects' ? 'block' : 'none';
            if (subcategoryInput) subcategoryInput.value = subcategory;

            document.getElementById('articleExcerpt').value = article.excerpt || '';
            document.getElementById('articleAuthor').value = article.author || '';
            document.getElementById('articleTags').value = article.tags || '';
            document.getElementById('articleImage').value = article.image_url || '';

            if (this.quill) this.quill.root.innerHTML = article.content || '';
        } else if (this.quill) {
            this.quill.setText('');
        }

        if (this.articleModal) this.articleModal.classList.add('active');
    }

    async handleArticleSubmit() {
        if (!this.articleForm) return;
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            await this.requireAdmin();

            const formData = new FormData(this.articleForm);
            let category = formData.get('category');
            const subcategory = formData.get('subcategory');
            if (category === 'architects' && subcategory) category = `architects-${subcategory}`;

            const articleData = {
                id: formData.get('id') || null,
                title: this.sanitizeInput(formData.get('title')),
                category,
                excerpt: this.sanitizeInput(formData.get('excerpt')),
                content: this.sanitizeInput(this.quill ? this.quill.root.innerHTML : formData.get('content')),
                author: this.sanitizeInput(formData.get('author')),
                tags: this.sanitizeInput(formData.get('tags'))
            };

            const imageFileInput = document.getElementById('articleImageFile');
            const imageFile = imageFileInput && imageFileInput.files.length > 0 ? imageFileInput.files[0] : null;

            await this.api.saveArticle(articleData, imageFile);
            this.closeModal(this.articleModal);
            this.loadArticlesList();
            if (window.articlesManager) window.articlesManager.loadArticles('all');

        } catch (error) {
            console.error('Error saving article:', error);
            alert('Ошибка при сохранении статьи: ' + error.message);
        } finally {
            this.isSubmitting = false;
        }
    }

    async deleteArticle(id) {
        if (!id) return;
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            await this.requireAdmin();
            if (confirm('Удалить статью?')) {
                await this.api.deleteArticle(id);
                this.loadArticlesList();
                if (window.articlesManager) window.articlesManager.loadArticles('all');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Ошибка при удалении статьи: ' + error.message);
        } finally {
            this.isSubmitting = false;
        }
    }

    // --- Gallery ---
    async loadGalleryList() {
        try {
            await this.requireAdmin();
        } catch (error) {
            if (this.galleryList) {
                this.galleryList.innerHTML = '<p class="empty-state">Для просмотра галереи необходимо авторизоваться.</p>';
            }
            return;
        }
        if (this.galleryList) {
            this.galleryList.innerHTML = '<p class="empty-state">Редактирование и удаление изображений осуществляется непосредственно на странице галереи.</p>';
        }
    }

    openGalleryModal(galleryItem = null) {
        if (this.galleryForm) this.galleryForm.reset();
        const galleryModalTitle = document.getElementById('galleryModalTitle');
        if (galleryModalTitle) galleryModalTitle.innerText = galleryItem ? 'Редактировать изображение' : 'Новое изображение';

        if (galleryItem) {
            document.getElementById('galleryId').value = galleryItem.id || '';
            document.getElementById('galleryTitle').value = galleryItem.title || '';
            document.getElementById('galleryImageUrl').value = galleryItem.image_url || '';
            document.getElementById('galleryCategory').value = galleryItem.category || 'general';
            document.getElementById('galleryOrder').value = galleryItem.display_order || 0;
        }

        if (this.galleryModal) this.galleryModal.classList.add('active');
    }

    async handleGallerySubmit() {
        if (!this.galleryForm || this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            await this.requireAdmin();

            const formData = new FormData(this.galleryForm);
            const galleryData = {
                id: formData.get('id') || null,
                title: this.sanitizeInput(formData.get('title')),
                category: this.sanitizeInput(formData.get('category')),
                display_order: +formData.get('order') || 0
            };

            const imageFileInput = document.getElementById('galleryImageFile');
            const imageFile = imageFileInput && imageFileInput.files.length > 0 ? imageFileInput.files[0] : null;

            await this.api.saveGalleryItem(galleryData, imageFile);
            this.closeModal(this.galleryModal);
            this.loadGalleryList();
            if (window.galleryManager) window.galleryManager.loadGallery('all');
        } catch (error) {
            console.error('Error saving gallery item:', error);
            alert('Ошибка при сохранении изображения: ' + error.message);
        } finally {
            this.isSubmitting = false;
        }
    }

    async deleteGalleryItem(id) {
        if (!id || this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            await this.requireAdmin();
            if (confirm('Удалить изображение?')) {
                await this.api.deleteGalleryItem(id);
                this.loadGalleryList();
                if (window.galleryManager) window.galleryManager.loadGallery('all');
            }
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            alert('Ошибка при удалении изображения: ' + error.message);
        } finally {
            this.isSubmitting = false;
        }
    }
    



    
    async checkInitialAuthStatus() {
        try {
            const isAdmin = await this.api.isAdminAuthenticated();
            if (isAdmin) {
                this.showAdminContent();
                this.loadArticlesList();
                this.loadGalleryList();
            } else {
                if (this.adminLoginForm) this.adminLoginForm.style.display = 'block';
                if (this.adminContent) this.adminContent.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking initial auth status:', error);
            if (this.adminLoginForm) this.adminLoginForm.style.display = 'block';
            if (this.adminContent) this.adminContent.style.display = 'none';
        }
    }
    
    // Methods to support inline editing from articles and gallery views
    async openArticleModalForEdit(id) {
        try {
            await this.requireAdmin();
            const article = await this.api.getArticleById(id);
            if (article) {
                this.openArticleModal(article);
            }
        } catch (error) {
            console.error('Error opening article modal for edit:', error);
        }
    }
    
    async openGalleryModalForEdit(id) {
        try {
            await this.requireAdmin();
            const galleryItem = await this.api.getGalleryItemById(id);
            if (galleryItem) {
                this.openGalleryModal(galleryItem);
            }
        } catch (error) {
            console.error('Error opening gallery modal for edit:', error);
        }
    }
    
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        // Remove dangerous characters and patterns while preserving allowed HTML for content
        let sanitized = input;
        
        // For content fields, allow some HTML but sanitize dangerous elements
        if (input.includes('<')) {
            // Remove dangerous HTML tags and attributes
            sanitized = sanitized
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<object[^>]*>.*?<\/object>/gi, '')
                .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
                .replace(/<link[^>]*>/gi, '')
                .replace(/<meta[^>]*>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/vbscript:/gi, '')
                .replace(/onload=/gi, 'on_load=')
                .replace(/onerror=/gi, 'on_error=')
                .replace(/onmouseover=/gi, 'on_mouseover=')
                .replace(/onmouseout=/gi, 'on_mouseout=');
        } else {
            // For non-HTML fields, remove all HTML tags
            sanitized = sanitized
                .replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/vbscript:/gi, '')
                .replace(/onload=/gi, 'on_load=')
                .replace(/onerror=/gi, 'on_error=');
        }
        
        // Remove control characters
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        return sanitized.trim();
    }
}

// AdminPanel is initialized in main.js with dependency injection
// const adminPanel = new AdminPanel(window.api);
