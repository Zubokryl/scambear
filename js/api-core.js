/**
 * Core API Client
 * Main API functionality for articles and gallery management
 */

function createCoreApiClient(dependencies = {}) {
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
        loginAdmin = window.loginAdmin
    } = dependencies;

    const api = {
        // --- Login ---
        loginAdmin: async (email, password) => loginAdmin(email, password),

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

        async isAdminAuthenticated() {
            try {
                return await getCurrentUserAdminStatus();
            } catch (error) {
                console.error('Error checking admin status:', error);
                return false;
            }
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
                const article = articles.find(a => {
                    const articleSlug = window.articlesUtils.generateSlug(a.title);
                    return articleSlug === slug;
                });
                
                // If article is found and has an ID, increment views by calling getArticleById
                if (article && article.id) {
                    try {
                        // Call getArticleById to increment the view count
                        const updatedArticle = await api.getArticleById(article.id);
                        // Return the updated article with incremented view count
                        return updatedArticle;
                    } catch (viewError) {
                        console.error('Error incrementing views for article by slug:', viewError);
                        // Return original article if view incrementing fails
                        return article;
                    }
                }
                
                return article;
            } catch (error) {
                console.error('Error fetching article by slug:', error);
                return null;
            }
        },
        
        async incrementArticleViews(id) {
            try {
                // This function is primarily for backward compatibility
                // The view count is already incremented in getArticleById
                console.log('Incrementing article views for ID:', id);
                return true;
            } catch (error) {
                console.error('Error incrementing article views:', error);
                throw error;
            }
        }
    };

    return api;
}

window.coreApi = createCoreApiClient();