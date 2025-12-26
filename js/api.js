/**
 * Supabase API Client
 * Backend for the Parasite platform using Supabase
 */

// Import Supabase functions
// In a real project with modules, you would use:
// import * as supabaseApi from './supabase.js'

const api = {
    // Expose login function
    loginAdmin: async (email, password) => {
        return await window.loginAdmin(email, password);
    },
    
    // --- Articles ---
    
    /**
     * Get all articles
     */
    async getArticles(filter = {}) {
        try {
            const articles = await window.getArticles();
                
                // Apply client-side filtering if needed
                if (filter.category && filter.category !== 'all') {
                return articles.filter(article => article.category === filter.category) || [];
            }
            
            return articles || [];
        } catch (error) {
            console.error('Error fetching articles:', error);
            // Return empty array if API call fails
            return [];
        }
    },
    

    
    /**
     * Get article by ID
     */
    async getArticleById(id) {
        try {
            const article = await window.getArticleById(id);
            
            // In a real implementation, you would increment views here
            // This would require a separate update call
            
            return article;
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    },
    
    /**
     * Save article (create or update)
     */
    async saveArticle(article, imageFile = null) {
        try {
            // If image file is provided, upload it first
            let imageUrl = article.image_url;
            if (imageFile) {
                imageUrl = await window.uploadFile(imageFile);
            }
            
            // Create a copy of the article with the correct image URL
            const articleData = { ...article, image_url: imageUrl };
            
            return await window.saveArticle(articleData, imageFile);
        } catch (error) {
            console.error('Error saving article:', error);
            throw error;
        }
    },
    
    /**
     * Delete article
     */
    async deleteArticle(id) {
        try {
            console.log('API deleteArticle called with ID:', id);
            // Check if user is admin before attempting to delete
            const isAdmin = await this.isAdminAuthenticated();
            console.log('API level admin check result:', isAdmin);
            if (!isAdmin) {
                throw new Error('Admin authentication required');
            }
            
            console.log('Calling window.deleteArticle with ID:', id);
            await window.deleteArticle(id);
            console.log('Window.deleteArticle completed successfully');
            return true;
        } catch (error) {
            console.error('Error deleting article:', error);
            throw error; // Re-throw to handle in admin.js
        }
    },
    
    // --- Gallery ---
    
    /**
     * Get all gallery items
     */
    async getGallery(filter = {}) {
        try {
            const items = await window.getGallery();
            return items || [];
        } catch (error) {
            console.error('Error fetching gallery items:', error);
            // Return mock data if API call fails
            return this.getMockGallery(filter);
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
        
        if (filter.category && filter.category !== 'all') {
            return mockGallery.filter(item => item.category === filter.category);
        }
        
        return mockGallery;
    },
    

    
    /**
     * Save gallery item (create or update)
     */
    async saveGalleryItem(item, imageFile = null) {
        try {
            // If image file is provided, upload it first
            let imageUrl = item.image_url;
            if (imageFile) {
                imageUrl = await window.uploadFile(imageFile);
            }
            
            // Create a copy of the item with the correct image URL
            const itemData = { ...item, image_url: imageUrl };
            
            return await window.saveGalleryItem(itemData);
        } catch (error) {
            console.error('Error saving gallery item:', error);
            throw error;
        }
    },
    
    /**
     * Delete gallery item
     */
    async deleteGalleryItem(id) {
        try {
            await window.deleteGalleryItem(id);
            return true;
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            return false;
        }
    },
    
    // --- Utils ---
    
    /**
     * Process image file for preview
     * Note: Actual file upload happens when saving records
     */
    async processImagePreview(file) {
        try {
            // Return a data URL for immediate preview purposes
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    },
    
    /**
     * Check if admin is authenticated
     */
    async isAdminAuthenticated() {
        try {
            // Check if user is logged in and is an admin
            const adminStatus = await window.getCurrentUserAdminStatus();
            console.log('Admin status check result:', adminStatus);
            return adminStatus;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
};

// Make api available globally
window.api = api;
