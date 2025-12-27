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
            const mockGallery = [
                {
                    id: 1,
                    title: "Пример изображения для галереи",
                    description: "Это пример изображения для галереи. В реальной системе здесь будут данные из базы данных.",
                    category: "general",
                    image_url: "https://via.placeholder.com/400x200?text=Gallery+Image",
                    display_order: 1
                },
                {
                    id: 2,
                    title: "Пример изображения фишинга",
                    description: "Пример изображения, демонстрирующего фишинговые схемы.",
                    category: "phishing",
                    image_url: "https://via.placeholder.com/400x200?text=Phishing+Example",
                    display_order: 2
                },
                {
                    id: 3,
                    title: "Защита от мошенничества",
                    description: "Информационная графика о методах защиты от мошенничества.",
                    category: "general",
                    image_url: "https://via.placeholder.com/400x200?text=Fraud+Protection",
                    display_order: 3
                }
            ];

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
        }
    };

    return api;
}

// Make API available globally
window.api = createApiClient();

