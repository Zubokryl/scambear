// Articles utility functions
window.articlesUtils = {
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
    },
    
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
};