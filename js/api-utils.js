/**
 * API Utilities
 * Shared utility functions for API operations
 */

window.apiUtils = {
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
            return await window.getCurrentUserAdminStatus();
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    async requireAdmin() {
        const isAdmin = await this.isAdminAuthenticated();
        if (!isAdmin) throw new Error('Admin authentication required');
    },

    async uploadImageIfExists(imageFile, fallbackUrl) {
        if (imageFile) {
            return await window.uploadFile(imageFile);
        }
        return fallbackUrl;
    },

    filterByCategory(items, category) {
        if (!category || category === 'all') return items;
        return items.filter(item => item.category === category);
    }
};