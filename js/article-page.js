// Загрузка утилит для статей
// Функции generateSlug и getCategoryName доступны через window.articlesUtils

// Preconnect and preload for performance
(function() {
    // Preconnect to API endpoint
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = '/api';  // Supabase/ваш API
    document.head.appendChild(link);

    // Preload article data if article ID is available
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
    
    if (articleId) {
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'fetch';
        preload.href = `/api/articles/${articleId}?t=${Date.now()}`;
        document.head.appendChild(preload);
    }
})();

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
    
    // Generate dynamic OG image
    const ogImage = `https://parasite-project.ru/og/${articleSlug}?title=${encodeURIComponent(article.title.substring(0,50))}`;
    
    // Meta + SEO (безопасно)
    setMeta('articleTitle', article.title);
    setMeta('pageTitle', `${article.title} | PARASITE`);
    setMeta('pageDescription', article.excerpt?.substring(0, 155) + '...', 'content');
    setMeta('ogTitle', `${article.title} | PARASITE`, 'content');
    setMeta('ogDescription', article.excerpt || article.title, 'content');
    setMeta('ogUrl', canonicalUrl, 'content');
    setMeta('ogImage', ogImage, 'content'); // Dynamic OG image
    setMeta('twitterTitle', `${article.title} | PARASITE`, 'content');
    setMeta('twitterImage', ogImage, 'content'); // Twitter image
    setMeta('canonicalLink', canonicalUrl, 'href'); // ✅ ФИКС
    setMeta('breadcrumbTitle', article.title);
    
    // Остальной код...
    document.getElementById('articleDate').textContent = new Date(article.created_at).toLocaleDateString('ru-RU');
    document.getElementById('articleDate').setAttribute('datetime', article.created_at);
    document.getElementById('articleCategory').textContent = getCategoryName(article.category);
    // More aggressive sanitization using DOMPurify for XSS protection
    let sanitizedContent = DOMPurify.sanitize(article.content);
    
    // Additional sanitization to remove glitch effect elements
    sanitizedContent = sanitizedContent.replace(/<span[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/span>/gi, '');
    sanitizedContent = sanitizedContent.replace(/<div[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/div>/gi, '');
    sanitizedContent = sanitizedContent.replace(/<p[^>]*class=["'][^"']*(glitch|glitch__layer)[^"']*["'][^>]*>.*?<\/p>/gi, '');
    // Remove unwanted text patterns
    sanitizedContent = sanitizedContent.replace(/всего\s+\d+\s+схем/gi, '');
    
    document.getElementById('articleBody').innerHTML = sanitizedContent;
    
    // Implement IntersectionObserver for lazy loading images
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onload = function() {
                        img.style.display = 'block';
                    };
                    imgObserver.unobserve(img); // Stop observing after loading
                }
            }
        });
    });
    
    // Observe all images in the article body that have data-src attribute
    const articleImages = document.querySelectorAll('#articleBody img[data-src]');
    articleImages.forEach(img => {
        imgObserver.observe(img);
    });
    
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
            "logo": { "@type": "ImageObject", "url": "/img/logo.jpg" }
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
        let backUrl = '/schemes.html';
        
        if (ref) {
            // If ref parameter exists, extract category
            if (ref.startsWith('schemes-')) {
                const category = ref.substring(7); // Remove 'schemes-' prefix
                
                // Use the articles manager's slug mapping to get the correct slug
                let slug = category;
                if (window.articlesManager && window.articlesManager.categorySlugs && window.articlesManager.categorySlugs[category]) {
                    slug = window.articlesManager.categorySlugs[category];
                }
                backUrl = `/schemes.html#${slug}`;
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
    
    // Comments functionality
    async function loadComments(articleId) {
        try {
            const commentsList = document.getElementById('comments-list');
            
            if (!window.supabase) {
                commentsList.innerHTML = '<div class="no-comments">Комментарии временно недоступны</div>';
                return;
            }
            
            const { data: comments, error } = await window.supabase
                .from('comments')
                .select('*')
                .eq('article_id', articleId)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error loading comments:', error);
                commentsList.innerHTML = '<div class="no-comments">Ошибка загрузки комментариев</div>';
                return;
            }
            
            if (!comments || comments.length === 0) {
                commentsList.innerHTML = '<div class="no-comments">Пока нет комментариев. Будьте первым!</div>';
                return;
            }
            
            const commentsHTML = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(comment.author_name)}</span>
                        <span class="comment-date">${formatDate(comment.created_at)}</span>
                        <span class="comment-actions">
                            <!-- Delete button will appear for admin users -->
                            <button class="delete-comment-btn" data-comment-id="${comment.id}" title="Удалить комментарий">Удалить</button>
                        </span>
                    </div>
                    <div class="comment-content">${escapeHtml(comment.content)}</div>
                </div>
            `).join('');
            
            commentsList.innerHTML = commentsHTML;
        } catch (error) {
            console.error('Error in loadComments:', error);
            const commentsList = document.getElementById('comments-list');
            commentsList.innerHTML = '<div class="no-comments">Ошибка загрузки комментариев</div>';
        }
    }
    
    async function addComment(articleId) {
        const authorInput = document.getElementById('comment-author');
        const contentInput = document.getElementById('comment-content');
        const submitBtn = document.getElementById('submit-comment');
        
        const authorName = authorInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!authorName || !content) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        if (authorName.length > 50) {
            alert('Имя слишком длинное (максимум 50 символов)');
            return;
        }
        
        if (content.length > 1000) {
            alert('Комментарий слишком длинный (максимум 1000 символов)');
            return;
        }
        
        // Disable submit button to prevent duplicate submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
            if (!window.supabase) {
                alert('Система комментариев временно недоступна');
                return;
            }
            
            const { error } = await window.supabase
                .from('comments')
                .insert([{
                    article_id: articleId,
                    author_name: authorName,
                    content: content
                }]);
            
            if (error) {
                console.error('Error adding comment:', error);
                alert('Ошибка при добавлении комментария');
                return;
            }
            
            // Clear form and reload comments
            authorInput.value = '';
            contentInput.value = '';
            
            // Reload comments to show the new one
            await loadComments(articleId);
            
        } catch (error) {
            console.error('Error in addComment:', error);
            alert('Ошибка при добавлении комментария');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Оставить комментарий';
        }
    }
    
    // Helper function to escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Function to delete a comment
    async function deleteComment(commentId) {
        if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            return;
        }
        
        try {
            if (!window.supabase) {
                alert('Система комментариев временно недоступна');
                return;
            }
            
            // Check if user is an admin before allowing deletion
            let isAdmin = false;
            if (window.api && typeof window.api.isAdminAuthenticated === 'function') {
                isAdmin = await window.api.isAdminAuthenticated();
            } else {
                isAdmin = await getCurrentUserAdminStatus();
            }
            if (!isAdmin) {
                alert('Требуется аутентификация администратора для удаления комментариев');
                return;
            }
            
            const { error } = await window.supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            
            if (error) {
                console.error('Error deleting comment:', error);
                alert('Ошибка при удалении комментария');
                return;
            }
            
            // Reload comments to reflect the deletion
            await loadComments(article.id);
            
        } catch (error) {
            console.error('Error in deleteComment:', error);
            alert('Ошибка при удалении комментария');
        }
    }
    
    // Function to generate static HTML for an article (for SEO purposes)
    function generateStaticArticleHTML(article) {
        // This function would be used server-side to generate static HTML
        // with pre-populated metadata for better SEO
        
        // In a real implementation, this would be handled by a server-side script
        // like the generate-static-articles-node.js we created
        
        // For now, we'll just return the basic structure
        const articleSlug = window.articlesUtils.generateSlug(article.title);
        const canonicalUrl = generateCanonicalUrl(article);
        const categoryName = window.articlesUtils.getCategoryName(article.category);
        
        // Truncate description to 155 characters for meta description
        const description = (article.excerpt || article.title).substring(0, 155) + '...';
        
        // Create structured data
        const schemaArticle = {
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
                "logo": { "@type": "ImageObject", "url": "/img/logo.jpg" }
            },
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
        };
        
        // Extract FAQ if available
        const faqData = extractFAQFromContent(article.content);
        let schemaFAQ = null;
        if (faqData.length > 0) {
            schemaFAQ = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqData
            };
        }
        
        const schemaBreadcrumb = {
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
                    "item": `https://parasite-project.ru/schemes#${article.category}`
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": article.title,
                    "item": canonicalUrl
                }
            ]
        };
        
        // In a real implementation, this would be used to generate static HTML
        console.log('Static HTML would be generated for:', article.title);
        
        return {
            schemaArticle,
            schemaFAQ,
            schemaBreadcrumb,
            canonicalUrl,
            description
        };
    }
    
    // Function to check if user is admin and update UI accordingly
    async function checkAdminStatus() {
        try {
            // Check if admin is authenticated
            let isAdmin = false;
            if (window.api && typeof window.api.isAdminAuthenticated === 'function') {
                isAdmin = await window.api.isAdminAuthenticated();
            } else {
                isAdmin = await getCurrentUserAdminStatus();
            }
            if (isAdmin) {
                // Add admin class to body to show delete buttons
                document.body.classList.add('admin');
                
                // Add event listener for delete buttons once
                document.addEventListener('click', handleDeleteCommentClick, true);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }
    
    // Separate function to handle delete comment clicks
    function handleDeleteCommentClick(e) {
        if (e.target.classList.contains('delete-comment-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const commentId = e.target.getAttribute('data-comment-id');
            if (commentId) {
                deleteComment(commentId);
            }
        }
    }

    // Initialize comments functionality after article is loaded
    if (article && article.id) {
        // Load comments for this article with error boundary
        try { 
            loadComments(article.id); 
        } 
        catch(e) { 
            console.error('Error loading comments:', e);
            showCommentsFallback(); 
        }
        
        // Check if user is admin to show delete buttons
        checkAdminStatus();
        
        // Add event listener for comment submission
        const submitBtn = document.getElementById('submit-comment');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => addComment(article.id));
        }
        
        // Also allow submitting with Enter key in textarea (with Ctrl/Cmd)
        const contentInput = document.getElementById('comment-content');
        if (contentInput) {
            contentInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    addComment(article.id);
                }
            });
        }
    }
    
    // Function to show comments fallback when loading fails
    function showCommentsFallback() {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            const fallbackHTML = `
                <div class="comments-fallback">
                    <p>Комментарии временно недоступны. Пожалуйста, попробуйте позже.</p>
                    <button onclick="location.reload()" class="btn-parasite">Обновить страницу</button>
                </div>
            `;
            commentsSection.innerHTML = fallbackHTML + commentsSection.innerHTML;
        }
    }
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}