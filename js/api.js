/**
 * Supabase API Client
 * Backend for the Parasite platform using Supabase
 */

function createApiClient(dependencies = {}) {
    const {
        getArticles = window.getArticles,
        getArticleById = window.getArticleById,
        getGalleryItemById = window.getGalleryItemById,
        saveArticle = window.saveArticle,
        deleteArticle = window.deleteArticle,
        getGallery = window.getGallery,
        saveGalleryItem = window.saveGalleryItem,
        deleteGalleryItem = window.deleteGalleryItem,
        uploadFile = window.uploadFile,
        getCurrentUserAdminStatus = window.getCurrentUserAdminStatus,
        loginAdmin = window.loginAdmin,
        logoutAdmin = window.logoutAdmin
    } = dependencies;

    const api = {
        // --- Login ---
        loginAdmin: async (email, password) => loginAdmin(email, password),
        
        logoutAdmin: async () => logoutAdmin(),

        // --- Articles ---
        async getArticles(filter = {}) {
            try {
                const articles = await getArticles();
                const filteredArticles = api.filterByCategory(articles, filter.category);

                filteredArticles.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

                return filteredArticles || [];
            } catch (error) {
                console.error('Error fetching articles:', error);
                return [];
            }
        },

        async getArticleById(id) {
            try {
                return await getArticleById(id);
            } catch (error) {
                console.error('Error fetching article:', error);
                return null;
            }
        },

        async getGalleryItemById(id) {
            try {
                return await getGalleryItemById(id);
            } catch (error) {
                console.error('Error fetching gallery item:', error);
                return null;
            }
        },

        async saveArticle(article, imageFile = null) {
            try {
                const imageUrl = await api.uploadImageIfExists(imageFile, article.image_url);
                const articleData = { ...article, image_url: imageUrl };
                return await saveArticle(articleData, imageFile);
            } catch (error) {
                console.error('Error saving article:', error);
                throw error;
            }
        },

        async deleteArticle(id) {
            try {
                await api.requireAdmin();
                await deleteArticle(id);
                return true;
            } catch (error) {
                console.error('Error deleting article:', error);
                throw error;
            }
        },

        // --- Gallery ---
        async getGallery(filter = {}) {
            try {
                const items = await getGallery(filter);
                const filteredItems = api.filterByCategory(items, filter.category);

                if (!filteredItems || filteredItems.length === 0) {
                    // fallback to mock data
                    return api.getMockGallery(filter);
                }

                return filteredItems;
            } catch (error) {
                console.error('Error fetching gallery items:', error);
                return api.getMockGallery(filter);
            }
        },

        getMockGallery(filter = {}) {
            const mockGallery = [];

            return api.filterByCategory(mockGallery, filter.category);
        },

        async saveGalleryItem(item, imageFile = null) {
            try {
                const imageUrl = await api.uploadImageIfExists(imageFile, item.image_url);
                const itemData = { ...item, image_url: imageUrl };
                return await saveGalleryItem(itemData);
            } catch (error) {
                console.error('Error saving gallery item:', error);
                throw error;
            }
        },

        async deleteGalleryItem(id) {
            try {
                await api.requireAdmin();
                await deleteGalleryItem(id);
                return true;
            } catch (error) {
                console.error('Error deleting gallery item:', error);
                throw error;
            }
        },

        // --- Utils ---
        async processImagePreview(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = e => reject(e);
                reader.readAsDataURL(file);
            });
        },
        
        async requireAdmin() {
            const isAdmin = await api.isAdminAuthenticated();
            if (!isAdmin) throw new Error('Admin authentication required');
        },

        async uploadImageIfExists(imageFile, fallbackUrl) {
            if (imageFile) {
                return await uploadFile(imageFile);
            }
            return fallbackUrl;
        },

        filterByCategory(items, category) {
            if (!category || category === 'all') return items;
            return items.filter(item => item.category === category);
        },

        async getArticleBySlug(slug) {
            try {
                const articles = await api.getArticles();
                // Find article that matches the slug
                return articles.find(a => {
                    const articleSlug = window.articlesUtils.generateSlug(a.title);
                    return articleSlug === slug;
                });
            } catch (error) {
                console.error('Error fetching article by slug:', error);
                return null;
            }
        },
        
        async incrementArticleViews(id) {
            try {
                // Increment article views by calling the backend function
                // This will update the view count in the database
                if (typeof window.getArticleById !== 'undefined') {
                    // The view count is incremented in getArticleById, 
                    // so we just need to fetch the article to trigger the increment
                    const article = await getArticleById(id);
                    console.log('Article views incremented for ID:', id);
                    return article;
                } else {
                    console.error('getArticleById function not available');
                    return null;
                }
            } catch (error) {
                console.error('Error incrementing article views:', error);
                throw error;
            }
        },
            
        async isAdminAuthenticated() {
            try {
                return await getCurrentUserAdminStatus();
            } catch (error) {
                console.error('Error checking admin status:', error);
                return false;
            }
        }
    }

    return api;
}

// Make API available globally
window.api = createApiClient();


