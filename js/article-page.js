// Загрузка утилит для статей
// Функции generateSlug и getCategoryName доступны через window.articlesUtils

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're using slug-based routing or ID-based routing
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    let articleSlug = urlParams.get('slug');
    
    // Extract slug from URL path if not in query parameter
    if (!articleSlug) {
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart !== 'article.html') {
            articleSlug = lastPart.replace(/\.html$/, '');
        }
    }
    
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
    
    // Generate SEO-friendly canonical URL first
    const canonicalUrl = generateCanonicalUrl(article);
    
    // Meta + SEO (безопасно)
    setMeta('articleTitle', article.title);
    setMeta('pageTitle', `${article.title} | PARASITE`);
    setMeta('pageDescription', article.excerpt?.substring(0, 155) + '...', 'content');
    setMeta('ogTitle', `${article.title} | PARASITE`, 'content');
    setMeta('ogDescription', article.excerpt || article.title, 'content');
    setMeta('ogUrl', canonicalUrl, 'content');
    setMeta('twitterTitle', `${article.title} | PARASITE`, 'content');
    setMeta('canonicalLink', canonicalUrl, 'href'); // ✅ ФИКС
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
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
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
                "item": canonicalUrl
            }
        ]
    }, null, 2);
    
    // Views counter - the view count is incremented when the article is loaded via getArticleById
    // This is handled in the backend API when fetching the article
    console.log('Article loaded, view should be incremented in getArticleById:', article.id);
    
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
                        const article = await getArticleById(id);
                        // Try to increment views
                        try {
                            if (window.api && typeof window.api.incrementArticleViews === 'function') {
                                await window.api.incrementArticleViews(id);
                            } else {
                                // As a fallback, try to call the increment function directly
                                await this.incrementArticleViews(id);
                            }
                        } catch (viewError) {
                            console.error('Error incrementing views in getArticleById:', viewError);
                        }
                        return article;
                    } else {
                        // Fallback: make direct fetch request
                        const response = await fetch(`/api/articles/${id}`);
                        if (response.ok) {
                            const article = await response.json();
                            // Try to increment views via a separate API call
                            try {
                                await fetch(`/api/articles/${id}/incrementViews`, { method: 'POST' });
                            } catch (viewError) {
                                console.error('Error incrementing views via fallback API:', viewError);
                            }
                            return article;
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
                    const article = articles.find(a => {
                        const articleSlug = window.articlesUtils.generateSlug(a.title);
                        return articleSlug === slug;
                    });
                    
                    // If we found the article by slug, try to increment its views
                    if (article && article.id) {
                        try {
                            // Use the main API if available, otherwise use our own increment method
                            if (window.api && typeof window.api.getArticleById === 'function') {
                                // Call getArticleById to increment views properly
                                const updatedArticle = await window.api.getArticleById(article.id);
                                return updatedArticle;
                            } else {
                                await this.incrementArticleViews(article.id);
                            }
                        } catch (viewError) {
                            console.error('Error incrementing views for article by slug:', viewError);
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
                    // Try to use the main API if available
                    if (window.api && typeof window.api.incrementArticleViews === 'function') {
                        return await window.api.incrementArticleViews(id);
                    } else {
                        // Try to call the Supabase function directly if available
                        if (window.supabase) {
                            try {
                                // Get the current article to get its current view count
                                const { data: currentArticle, error } = await window.supabase
                                    .from('articles')
                                    .select('views')
                                    .eq('id', id)
                                    .single();
                                
                                if (!error && currentArticle) {
                                    // Update the view count by incrementing it
                                    const newViewCount = (currentArticle.views || 0) + 1;
                                    const { error: updateError } = await window.supabase
                                        .from('articles')
                                        .update({ views: newViewCount })
                                        .eq('id', id);
                                    
                                    if (updateError) {
                                        console.error('Error updating views in incrementArticleViews:', updateError);
                                        return false;
                                    } else {
                                        console.log('Article views updated to:', newViewCount);
                                        return true;
                                    }
                                } else {
                                    console.error('Could not fetch current article views:', error);
                                    return false;
                                }
                            } catch (supabaseError) {
                                console.error('Supabase error in incrementArticleViews:', supabaseError);
                                return false;
                            }
                        } else {
                            // In fallback mode without Supabase, we can't actually update the database
                            // But we can at least log that the view should be incremented
                            console.log('View increment called for article ID:', id, '(using fallback - not persisted)');
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
    
    // Function to generate SEO-friendly canonical URL
    function generateCanonicalUrl(article) {
        const articleSlug = window.articlesUtils.generateSlug(article.title);
        const domain = window.location.origin;
        
        // Use clean URL structure
        return `${domain}/articles/${articleSlug}`;
    }
    
    function showArticleError() {
        document.querySelector('#articleContent').innerHTML = '<h1 class="error">Статья не найдена</h1><a href="./schemes.html" class="btn-parasite">← Все схемы</a>';
    }
});