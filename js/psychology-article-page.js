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
        if (lastPart && lastPart !== 'psychology-article.html') {
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
    
    // 🛠️ ФИКС 3: Полный Schema.org
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
        "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
    }, null, 2);
    
    // Views counter
    if (window.api && window.api.incrementArticleViews) window.api.incrementArticleViews(article.id);
    
    // Set up back button functionality - always go back to psychology page
    const backBtn = document.getElementById('backToCategory');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/psychology.html';
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
    
    function showArticleError() {
        document.querySelector('#articleContent').innerHTML = '<h1 class="error">Статья не найдена</h1><a href="./psychology.html" class="btn-parasite">← Психология</a>';
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
    
    // Function to check if user is admin and update UI accordingly
    async function checkAdminStatus() {
        try {
            // Check if admin is authenticated
            if (window.api && typeof window.api.isAdminAuthenticated === 'function') {
                const isAdmin = await window.api.isAdminAuthenticated();
                if (isAdmin) {
                    // Add admin class to body to show delete buttons
                    document.body.classList.add('admin');
                    
                    // Add event listener for delete buttons
                    document.addEventListener('click', function(e) {
                        if (e.target.classList.contains('delete-comment-btn')) {
                            e.preventDefault();
                            const commentId = e.target.getAttribute('data-comment-id');
                            if (commentId) {
                                deleteComment(commentId);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }
    
    // Initialize comments functionality after article is loaded
    if (article && article.id) {
        // Load comments for this article
        loadComments(article.id);
        
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
});