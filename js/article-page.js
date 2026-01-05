// Загрузка утилит для статей
// Функции generateSlug и getCategoryName доступны через window.articlesUtils

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're using slug-based routing or ID-based routing
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    const articleSlug = urlParams.get('slug');
    
    // ✅ ЕДИНЫЙ API
    const api = window.api || createFallbackApi();
    
    let article;

    try {
        // ✅ Умный роутинг
        if (articleSlug) {
            article = await api.getArticleBySlug(articleSlug);
        } else if (articleId) {
            article = await api.getArticleById(articleId);
        } else {
            // No ID or slug provided
            showArticleError();
            return;
        }
    } catch (error) {
        console.error('Article load error:', error);
        showArticleError();
        return; // Exit early if there's an error
    }
    
    if (!article) {
        showArticleError();
        return;
    }
    
    // ✅ Абстракция meta
    const setMeta = (id, value, attr = 'textContent') => {
        const el = document.getElementById(id);
        if (el) {
            if (attr === 'textContent') {
                el.textContent = value;
            } else {
                el.setAttribute(attr, value);
            }
        }
    };
    
    // Используем утилитарную функцию для получения названия категории
    const getCategoryName = (slug) => {
        return window.articlesUtils.getCategoryName(slug);
    };
    
    // Meta + SEO (безопасно)
    setMeta('articleTitle', article.title);
    setMeta('pageTitle', `${article.title} | PARASITE`);
    setMeta('pageDescription', article.excerpt?.substring(0, 155) + '...', 'content');
    setMeta('ogTitle', `${article.title} | PARASITE`, 'content');
    setMeta('ogDescription', article.excerpt || article.title, 'content');
    setMeta('ogUrl', window.location.href, 'content');
    setMeta('twitterTitle', `${article.title} | PARASITE`, 'content');
    setMeta('canonicalLink', window.location.href, 'href'); // ✅ ФИКС
    setMeta('breadcrumbTitle', article.title);
    
    // Остальной код...
    document.getElementById('articleDate').textContent = new Date(article.created_at).toLocaleDateString('ru-RU');
    document.getElementById('articleDate').setAttribute('datetime', article.created_at);
    document.getElementById('articleCategory').textContent = getCategoryName(article.category);
    // Sanitize article content to prevent glitch effects and unwanted text from appearing in wrong places
    let sanitizedContent = article.content;
    // Remove glitch effect elements
    sanitizedContent = sanitizedContent.replace(/<span[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/span>/gi, '');
    sanitizedContent = sanitizedContent.replace(/<div[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/div>/gi, '');
    sanitizedContent = sanitizedContent.replace(/<p[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/p>/gi, '');
    // Remove unwanted text patterns
    sanitizedContent = sanitizedContent.replace(/всего\s+\d+\s+схем/gi, '');
    document.getElementById('articleBody').innerHTML = sanitizedContent;
    
    // Hide the loading spinner after content is loaded
    const loadingSpinner = document.getElementById('articleLoadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (article.image_url) {
        const img = document.getElementById('articleImage');
        img.src = article.image_url;
        img.alt = article.title;
        
        // Show image when loaded
        img.onload = function() {
            img.style.display = 'block';
        };
        
        // Handle image loading errors
        img.onerror = function() {
            console.error('Failed to load image:', article.image_url);
            img.style.display = 'none';
        };
        
        // If image is already cached, set display immediately
        if (img.complete) {
            img.style.display = 'block';
        }
    }
    
    // Tags
    if (article.tags) {
        const tags = article.tags.split(',').map(t => t.trim()).filter(Boolean);
        document.getElementById('articleTags').innerHTML = 
            tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    }
    
    // 🛠️ ФИКС 3: Полный Schema.org (Article + FAQ + Breadcrumb)
    
    // Article Schema
    document.getElementById('schemaArticle').textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt,
        "datePublished": article.created_at,
        "dateModified": article.updated_at || article.created_at,
        "author": { "@type": "Organization", "name": "PARASITE" },
        "image": article.image_url,
        "articleSection": article.category,
        "articleBody": article.content.substring(0, 5000) + '...',
        "publisher": {
            "@type": "Organization",
            "name": "PARASITE",
            "logo": { "@type": "ImageObject", "url": "./img/logo.jpg" }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
    }, null, 2);
    
    // FAQ Schema (если есть FAQ в тексте)
    const faqData = extractFAQFromContent(article.content);
    if (faqData.length > 0) {
        document.getElementById('schemaFAQ').textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData
        }, null, 2);
    }
    
    // Breadcrumb Schema
    const categorySlug = article.category || 'general';
    const categoryName = getCategoryName(categorySlug);
    
    document.getElementById('schemaBreadcrumb').textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": "https://parasite-project.ru/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Схемы мошенничества",
                "item": "https://parasite-project.ru/schemes"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": categoryName,
                "item": `https://parasite-project.ru/schemes#${categorySlug}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": article.title,
                "item": window.location.href
            }
        ]
    }, null, 2);
    
    // Views counter
    if (window.api && window.api.incrementArticleViews) window.api.incrementArticleViews(article.id);
    
    // Set up back button functionality based on ref parameter
    const ref = urlParams.get('ref');
    
    const backBtn = document.getElementById('backToCategory');
    if (backBtn) {
        let backUrl = './schemes.html';
        
        if (ref) {
            // If ref parameter exists, extract category
            if (ref.startsWith('schemes-')) {
                const category = ref.substring(7); // Remove 'schemes-' prefix
                
                // Use the articles manager's slug mapping to get the correct slug
                let slug = category;
                if (window.articlesManager && window.articlesManager.categorySlugs && window.articlesManager.categorySlugs[category]) {
                    slug = window.articlesManager.categorySlugs[category];
                }
                backUrl = `./schemes.html#${slug}`;
            }
        }
        
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = backUrl;
        });
    }
    
    // ✅ Вспомогательные функции
    function createFallbackApi() {
        return {
            async getArticles() {
                try {
                    if (window.api && typeof window.api.getArticles === 'function') {
                        return await window.api.getArticles();
                    } else {
                        // Fallback: make direct fetch request
                        const response = await fetch('/api/articles');
                        if (response.ok) {
                            return await response.json();
                        } else {
                            return [];
                        }
                    }
                } catch (error) {
                    console.error('Error fetching articles:', error);
                    return [];
                }
            },
            async getArticleById(id) {
                try {
                    // Assuming there's a global function to get articles
                    if (typeof getArticleById !== 'undefined') {
                        return await getArticleById(id);
                    } else {
                        // Fallback: make direct fetch request
                        const response = await fetch(`/api/articles/${id}`);
                        if (response.ok) {
                            return await response.json();
                        } else {
                            return null;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching article:', error);
                    return null;
                }
            },
            async getArticleBySlug(slug) {
                try {
                    const articles = await this.getArticles();
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
                    // Try to use the main API if available
                    if (window.api && typeof window.api.incrementArticleViews === 'function') {
                        return await window.api.incrementArticleViews(id);
                    } else {
                        // Fallback: try the global function
                        if (typeof getArticleById !== 'undefined') {
                            // Fetch the article to trigger view increment in getArticleById
                            const article = await getArticleById(id);
                            console.log('Incremented article views for ID:', id);
                            return article;
                        } else {
                            console.log('Incrementing article views for ID (fallback):', id);
                            return true;
                        }
                    }
                } catch (error) {
                    console.error('Error incrementing article views:', error);
                    return false;
                }
            }
        };
    }
    
    // Функция для извлечения FAQ из контента статьи
    function extractFAQFromContent(content) {
        const faqItems = [];
        
        // Ищем FAQ в формате вопрос-ответ
        // Поддерживаемые паттерны:
        // 1. <h3>Вопрос?</h3><p>Ответ</p>
        // 2. <strong>Вопрос?</strong> Ответ
        // 3. <h4>Вопрос?</h4><p>Ответ</p>
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Ищем заголовки h3/h4 с вопросительными знаками
        const questionHeaders = doc.querySelectorAll('h3, h4');
        
        questionHeaders.forEach(header => {
            const questionText = header.textContent.trim();
            
            // Проверяем, является ли это вопросом
            if (questionText.endsWith('?') && questionText.length > 10) {
                // Ищем следующий элемент с ответом
                let answerElement = header.nextElementSibling;
                
                // Если следующий элемент - p, используем его содержимое
                if (answerElement && answerElement.tagName === 'P') {
                    const answerText = answerElement.textContent.trim();
                    if (answerText.length > 20) { // Минимальная длина ответа
                        faqItems.push({
                            "@type": "Question",
                            "name": questionText,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": answerText
                            }
                        });
                    }
                }
            }
        });
        
        // Также ищем strong теги с вопросами
        const strongElements = doc.querySelectorAll('strong');
        strongElements.forEach(strong => {
            const text = strong.textContent.trim();
            if (text.endsWith('?') && text.length > 10) {
                // Ищем текст после strong элемента
                const parent = strong.parentElement;
                if (parent) {
                    const remainingText = parent.textContent.substring(parent.textContent.indexOf(text) + text.length).trim();
                    if (remainingText.length > 20) {
                        // Берем первое предложение как ответ
                        const firstSentence = remainingText.split(/[.!?]+/)[0] + '.';
                        if (firstSentence.length > 20) {
                            faqItems.push({
                                "@type": "Question",
                                "name": text,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": firstSentence
                                }
                            });
                        }
                    }
                }
            }
        });
        
        return faqItems.slice(0, 10); // Ограничиваем 10 вопросами
    }
    
    function showArticleError() {
        document.querySelector('#articleContent').innerHTML = '<h1 class="error">Статья не найдена</h1><a href="./schemes.html" class="btn-parasite">← Все схемы</a>';
    }
});