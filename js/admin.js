/**
 * Admin Panel Manager
 * Handles CRUD for Articles and Gallery
 */

class AdminPanel {
    constructor() {
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

        // Check if already logged in as admin
        this.checkInitialAuthStatus();

        // Initialize text formatting toolbar
        this.initTextFormattingToolbar();

        // Tabs
        this.tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.tabs.forEach(b => b.classList.remove('active'));
                this.panels.forEach(p => p.classList.remove('active'));

                e.target.classList.add('active');
                const target = document.getElementById(e.target.dataset.tab === 'articles' ? 'adminArticles' : 'adminGallery');
                target.classList.add('active');
            });
        });
    }
    
    async checkInitialAuthStatus() {
        try {
            const isAdmin = await api.isAdminAuthenticated();
            if (isAdmin) {
                this.showAdminContent();
                this.loadArticlesList();
                this.loadGalleryList();
            } else {
                // Ensure login form is visible if not logged in
                if (this.adminLoginForm) {
                    this.adminLoginForm.style.display = 'block';
                }
                if (this.adminContent) {
                    this.adminContent.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error checking initial auth status:', error);
            // Ensure login form is visible on error
            if (this.adminLoginForm) {
                this.adminLoginForm.style.display = 'block';
            }
            if (this.adminContent) {
                this.adminContent.style.display = 'none';
            }
        }

        // --- Article Events ---
        this.newArticleBtn.addEventListener('click', () => this.openArticleModal());
        this.closeArticleModal.addEventListener('click', () => this.closeModal(this.articleModal));
        this.cancelArticleBtn.addEventListener('click', () => this.closeModal(this.articleModal));

        // Add event listener for category change to show/hide subcategory
        const articleCategorySelect = document.getElementById('articleCategory');
        const subcategoryGroup = document.getElementById('subcategoryGroup');
        
        articleCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'architects') {
                subcategoryGroup.style.display = 'block';
            } else {
                subcategoryGroup.style.display = 'none';
                // Reset subcategory when not in architects category
                document.getElementById('articleSubcategory').value = '';
            }
        });
        
        this.articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleArticleSubmit();
        });

        // --- Gallery Events ---
        this.newGalleryBtn.addEventListener('click', () => this.openGalleryModal());
        this.closeGalleryModal.addEventListener('click', () => this.closeModal(this.galleryModal));
        this.cancelGalleryBtn.addEventListener('click', () => this.closeModal(this.galleryModal));

        this.galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleGallerySubmit();
        });
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    async handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        // Basic validation
        if (!email || !password) {
            alert('Пожалуйста, введите email и пароль');
            return;
        }
        


        try {
            await window.loginAdmin(email, password);
            this.resetLoginAttempts();
            this.showAdminContent();
            this.loadArticlesList();
            this.loadGalleryList();
        } catch (error) {
            console.error('Login failed:', error);

            alert('Ошибка входа. Проверьте учетные данные.');
        }
    }
    
    // Rate limiting removed
    isLoginRateLimited() {
        return false;
    }
    
    recordFailedLogin() {
        // Rate limiting removed
    }
    
    resetLoginAttempts() {
        // Rate limiting removed
    }

    showAdminContent() {
        if (this.adminLoginForm) {
            this.adminLoginForm.style.display = 'none';
        }
        if (this.adminContent) {
            this.adminContent.style.display = 'block';
        }
        
        // Add logout button if it doesn't exist
        this.addLogoutButton();
    }
    
    addLogoutButton() {
        // Check if logout button already exists
        if (document.getElementById('adminLogoutBtn')) return;
        
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'adminLogoutBtn';
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Выйти';
            logoutBtn.onclick = () => this.handleLogout();
            
            // Insert at the beginning of admin actions
            adminActions.insertBefore(logoutBtn, adminActions.firstChild);
        }
    }
    
    initTextFormattingToolbar() {
        // Initialize Quill editor if it's not already initialized
        if (window.Quill && document.getElementById('articleContent') && !this.quill) {
            this.quill = new Quill('#articleContent', {
                modules: {
                    toolbar: '#articleContentToolbar'
                },
                theme: 'snow',
                placeholder: 'Введите содержание статьи...'
            });
        }
    }
    
    async handleLogout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            try {
                // Logout from Supabase
                if (window.supabase && window.supabase.auth) {
                    await window.logoutAdmin();
                }
                
                // Reset login attempts
                this.resetLoginAttempts();
                
                // Show login form and hide admin content
                if (this.adminLoginForm) {
                    this.adminLoginForm.style.display = 'block';
                }
                if (this.adminContent) {
                    this.adminContent.style.display = 'none';
                }
                
                // Clear the login form
                if (this.loginForm) {
                    this.loginForm.reset();
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    }

    // --- Articles Logic ---

    async loadArticlesList() {
        // Check if user is logged in and is an admin
        const isAdmin = await api.isAdminAuthenticated();
        if (!isAdmin) {
            console.warn('Admin not logged in, cannot load articles');
            this.articlesList.innerHTML = '<p class="empty-state">Для просмотра статей необходимо авторизоваться.</p>';
            return;
        }
        
        const articles = await api.getArticles({ category: 'all' });

        this.articlesList.innerHTML = articles.map(a => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h4>${a.title}</h4>
                    <span style="color:#666; font-size:0.9rem">${a.category}</span>
                </div>
                <div class="admin-item-controls">
                    <button class="btn-icon" onclick="adminPanel.editArticle('${a.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="adminPanel.deleteArticle('${a.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openArticleModal(article = null) {
        this.articleForm.reset();
        document.getElementById('articleId').value = '';
        document.getElementById('articleModalTitle').innerText = 'Новая статья';

        // Initialize Quill if not done yet
        this.initTextFormattingToolbar();

        if (article) {
            document.getElementById('articleModalTitle').innerText = 'Редактировать статью';
            document.getElementById('articleId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            
            // Check if article category is an architects subcategory
            let mainCategory = article.category;
            let subcategory = '';
            
            if (article.category.startsWith('architects-')) {
                mainCategory = 'architects';
                subcategory = article.category.substring(10); // Remove 'architects-' prefix
            }
            
            document.getElementById('articleCategory').value = mainCategory;
            
            // Show subcategory dropdown if main category is architects
            const subcategoryGroup = document.getElementById('subcategoryGroup');
            if (mainCategory === 'architects') {
                subcategoryGroup.style.display = 'block';
                document.getElementById('articleSubcategory').value = subcategory;
            } else {
                subcategoryGroup.style.display = 'none';
                document.getElementById('articleSubcategory').value = '';
            }
            
            document.getElementById('articleExcerpt').value = article.excerpt;
            
            // Set content in Quill editor if it exists
            if (this.quill) {
                this.quill.setText(''); // Clear existing content
                this.quill.root.innerHTML = article.content; // Set the HTML content
            } else {
                document.getElementById('articleContent').value = article.content;
            }
            
            document.getElementById('articleImage').value = article.image_url || '';
            document.getElementById('articleAuthor').value = article.author;
            document.getElementById('articleTags').value = article.tags;
        } else {
            // For new article, make sure Quill is initialized and cleared
            if (this.quill) {
                this.quill.setText('');
            }
        }

        this.articleModal.classList.add('active');
    }

    async editArticle(id) {
        try {
            console.log('Attempting to edit article with ID:', id);
            // Check if user is logged in and is an admin
            const isAdmin = await api.isAdminAuthenticated();
            console.log('Is admin for edit?', isAdmin);
            if (!isAdmin) {
                alert('Вы должны войти как администратор для выполнения этого действия.');
                return;
            }
            
            const article = await api.getArticleById(id);
            console.log('Fetched article:', article);
            if (article) {
                this.openArticleModal(article);
            } else {
                alert('Статья не найдена');
            }
        } catch (error) {
            console.error('Error fetching article for edit:', error);
            alert('Ошибка при загрузке статьи: ' + error.message);
        }
    }

    async deleteArticle(id) {
        try {
            console.log('Attempting to delete article with ID:', id);
            // Check if user is logged in and is an admin
            const isAdmin = await api.isAdminAuthenticated();
            console.log('Is admin for delete?', isAdmin);
            if (!isAdmin) {
                alert('Вы должны войти как администратор для выполнения этого действия.');
                return;
            }
            
            if (confirm('Вы уверены, что хотите удалить эту статью?')) {
                console.log('Calling API deleteArticle with ID:', id);
                console.log('API object exists:', !!api);
                console.log('API deleteArticle function exists:', typeof api.deleteArticle);
                if (typeof api.deleteArticle !== 'function') {
                    console.error('api.deleteArticle is not a function!');
                    console.log('Available API methods:', Object.keys(api));
                    return;
                }
                await api.deleteArticle(id);
                console.log('Article deleted successfully, reloading lists...');
                this.loadArticlesList();
                // Refresh main grid if present
                if (window.articlesManager) window.articlesManager.loadArticles('all');
                console.log('Lists reloaded after deletion');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Ошибка при удалении статьи: ' + error.message);
        }
    }

    async handleArticleSubmit() {
        // Check if user is logged in and is an admin
        const isAdmin = await api.isAdminAuthenticated();
        if (!isAdmin) {
            alert('Вы должны войти как администратор для выполнения этого действия.');
            return;
        }
        
        const formElements = new FormData(this.articleForm);
        const fileInput = document.getElementById('articleImageFile');
        
        // Get content from Quill editor if it exists, otherwise from textarea
        let content = '';
        if (this.quill) {
            content = this.quill.root.innerHTML;
        } else {
            content = document.getElementById('articleContent').value;
        }
        
        let category = formElements.get('category');
        
        // If category is 'architects' and a subcategory is selected, use the subcategory as additional info
        if (category === 'architects') {
            const subcategory = formElements.get('subcategory');
            if (subcategory) {
                // Store the subcategory as a category_suffix or similar field
                category = `architects-${subcategory}`;
            }
        }
        
        const articleData = {
            id: formElements.get('id') || null,
            title: formElements.get('title'),
            category: category,
            excerpt: formElements.get('excerpt'),
            content: content, // Use content from Quill
            author: formElements.get('author'),
            tags: formElements.get('tags')
        };

        // Get image file if provided
        const imageFile = fileInput.files.length > 0 ? fileInput.files[0] : null;
        
        console.log('Image file selected:', imageFile);
        
        // Preview image if needed
        if (imageFile) {
            try {
                await api.processImagePreview(imageFile);
            } catch (e) {
                console.warn('Could not process image preview:', e);
            }
        }

        try {
            console.log('About to save article with image file:', imageFile);
            await api.saveArticle(articleData, imageFile);
            this.closeModal(this.articleModal);
            this.loadArticlesList();
            if (window.articlesManager) window.articlesManager.loadArticles('all');
            // Optionally show success message
            console.log('Article saved successfully');
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Ошибка при сохранении статьи: ' + error.message);
        }
    }

    // --- Gallery Logic ---

    async loadGalleryList() {
        // Check if user is logged in and is an admin
        const isAdmin = await api.isAdminAuthenticated();
        if (!isAdmin) {
            console.warn('Admin not logged in, cannot load gallery');
            this.galleryList.innerHTML = '<p class="empty-state">Для просмотра галереи необходимо авторизоваться.</p>';
            return;
        }
        
        const items = await api.getGallery({ category: 'all' });

        this.galleryList.innerHTML = items.map(i => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <img src="${i.image_url || 'https://via.placeholder.com/50x30?text=No+Image'}" style="width: 50px; height: 30px; object-fit: cover; vertical-align: middle; margin-right: 10px;">
                    <span style="font-weight:600">${i.title}</span>
                </div>
                <div class="admin-item-controls">
                    <button class="btn-icon delete" onclick="adminPanel.deleteGalleryItem('${i.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openGalleryModal() {
        this.galleryForm.reset();
        this.galleryModal.classList.add('active');
    }

    async deleteGalleryItem(id) {
        // Check if user is logged in and is an admin
        const isAdmin = await api.isAdminAuthenticated();
        if (!isAdmin) {
            alert('Вы должны войти как администратор для выполнения этого действия.');
            return;
        }
        
        if (confirm('Удалить изображение?')) {
            await api.deleteGalleryItem(id);
            this.loadGalleryList();
            if (window.galleryManager) window.galleryManager.loadGallery('all');
        }
    }

    async handleGallerySubmit() {
        // Check if user is logged in and is an admin
        const isAdmin = await api.isAdminAuthenticated();
        if (!isAdmin) {
            alert('Вы должны войти как администратор для выполнения этого действия.');
            return;
        }
        
        const formElements = new FormData(this.galleryForm);
        const fileInput = document.getElementById('galleryImageFile');
        
        const galleryData = {
            id: null, // Always new mostly, simple logic
            title: formElements.get('title'),
            description: formElements.get('description'),
            category: formElements.get('category'),
            order: +formElements.get('order')
        };

        // Get image file if provided
        const imageFile = fileInput.files.length > 0 ? fileInput.files[0] : null;
        
        // Preview image if needed
        if (imageFile) {
            try {
                await api.processImagePreview(imageFile);
            } catch (e) {
                console.warn('Could not process image preview:', e);
            }
        }

        try {
            await api.saveGalleryItem(galleryData, imageFile);
            this.closeModal(this.galleryModal);
            this.loadGalleryList();
            if (window.galleryManager) window.galleryManager.loadGallery('all');
            // Optionally show success message
            console.log('Gallery item saved successfully');
        } catch (error) {
            console.error('Error saving gallery item:', error);
            alert('Ошибка при сохранении изображения: ' + error.message);
        }
    }
}

const adminPanel = new AdminPanel();
