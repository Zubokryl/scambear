const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // For environment variables

/**
 * Static Article Page Generator for Node.js environment
 * This script connects to Supabase and generates static HTML pages for each article
 * with pre-generated metadata to improve SEO and search engine compatibility
 */

class StaticArticleGenerator {
    constructor(supabaseUrl, supabaseKey, outputDir = './static-articles') {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.outputDir = outputDir;
        this.supabase = null;
        this.template = null;
    }

    async init() {
        // Dynamically import Supabase client
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

        // Read the article.html template
        try {
            this.template = await fs.readFile('./article.html', 'utf8');
        } catch (error) {
            console.error('Error reading article.html template:', error);
            throw error;
        }

        // Create output directory if it doesn't exist
        await fs.mkdir(this.outputDir, { recursive: true });
    }

    // Utility function for slug generation (same as in articles.utils.js)
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
    }

    // Utility function for category names (same as in articles.utils.js)
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

    // Function to extract FAQ from content
    extractFAQFromContent(content) {
        const faqItems = [];
        
        // Create a simple DOM parser using regex patterns
        // Looking for patterns like <h3>Question?</h3><p>Answer</p>
        const h3Pattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi;
        let match;
        
        while ((match = h3Pattern.exec(content)) !== null) {
            const question = match[1].replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
            const answer = match[2].replace(/<[^>]*>/g, '').trim();
            
            if (question.endsWith('?') && question.length > 10 && answer.length > 20) {
                faqItems.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        }
        
        // Looking for patterns like <h4>Question?</h4><p>Answer</p>
        const h4Pattern = /<h4[^>]*>(.*?)<\/h4>\s*<p[^>]*>(.*?)<\/p>/gi;
        while ((match = h4Pattern.exec(content)) !== null) {
            const question = match[1].replace(/<[^>]*>/g, '').trim();
            const answer = match[2].replace(/<[^>]*>/g, '').trim();
            
            if (question.endsWith('?') && question.length > 10 && answer.length > 20) {
                faqItems.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        }
        
        // Looking for patterns like <strong>Question?</strong> followed by answer
        const strongPattern = /<strong[^>]*>(.*?)\?<\/strong>\s*([^<]+)/gi;
        while ((match = strongPattern.exec(content)) !== null) {
            const question = match[1].replace(/<[^>]*>/g, '').trim() + '?';
            const answer = match[2].trim();
            
            if (question.endsWith('?') && question.length > 10 && answer.length > 20) {
                faqItems.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        }
        
        return faqItems.slice(0, 10); // Limit to 10 questions
    }

    // Generate canonical URL for an article
    generateCanonicalUrl(article, domain = 'https://parasite-project.ru') {
        const articleSlug = this.generateSlug(article.title);
        return `${domain}/articles/${articleSlug}`;
    }

    // Generate all metadata for an article
    generateArticleMetadata(article, domain = 'https://parasite-project.ru') {
        const articleSlug = this.generateSlug(article.title);
        const canonicalUrl = this.generateCanonicalUrl(article, domain);
        const categoryName = this.getCategoryName(article.category);
        
        // Truncate description to 155 characters for meta description
        const description = (article.excerpt || article.title).substring(0, 155) + '...';
        
        // Prepare metadata
        const metadata = {
            title: article.title,
            pageTitle: `${article.title} | PARASITE`,
            description: description,
            canonicalUrl: canonicalUrl,
            ogTitle: `${article.title} | PARASITE`,
            ogDescription: article.excerpt || article.title,
            ogUrl: canonicalUrl,
            ogImage: article.image_url || '/img/og-default.jpg',
            twitterTitle: `${article.title} | PARASITE`,
            categoryName: categoryName,
            // Generate structured data
            schemaArticle: {
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
            },
            schemaFAQ: null,
            schemaBreadcrumb: {
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
            }
        };
        
        // Extract FAQ if available
        const faqData = this.extractFAQFromContent(article.content);
        if (faqData.length > 0) {
            metadata.schemaFAQ = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqData
            };
        }
        
        return metadata;
    }

    // Generate static HTML for an article
    generateStaticArticleHTML(article, domain = 'https://parasite-project.ru') {
        const metadata = this.generateArticleMetadata(article, domain);
        
        // Replace dynamic elements in the template with static content
        let html = this.template;
        
        // Replace title
        html = html.replace(
            /<title id="pageTitle">[^<]*<\/title>/,
            `<title>${this.escapeHtml(metadata.pageTitle)}</title>`
        );
        
        // Replace meta description
        html = html.replace(
            /<meta id="pageDescription" name="description" content="[^"]*">/,
            `<meta id="pageDescription" name="description" content="${this.escapeHtml(metadata.description)}">`
        );
        
        // Replace Open Graph tags
        html = html.replace(
            /<meta property="og:title" id="ogTitle" content="[^"]*">/,
            `<meta property="og:title" id="ogTitle" content="${this.escapeHtml(metadata.ogTitle)}">`
        );
        
        html = html.replace(
            /<meta property="og:description" id="ogDescription" content="[^"]*">/,
            `<meta property="og:description" id="ogDescription" content="${this.escapeHtml(metadata.ogDescription)}">`
        );
        
        html = html.replace(
            /<meta property="og:image" id="ogImage" content="[^"]*">/,
            `<meta property="og:image" id="ogImage" content="${this.escapeHtml(metadata.ogImage)}">`
        );
        
        html = html.replace(
            /<meta property="og:url" id="ogUrl" content="[^"]*">/,
            `<meta property="og:url" id="ogUrl" content="${this.escapeHtml(metadata.ogUrl)}">`
        );
        
        // Replace Twitter title
        html = html.replace(
            /<meta name="twitter:title" id="twitterTitle" content="[^"]*">/,
            `<meta name="twitter:title" id="twitterTitle" content="${this.escapeHtml(metadata.twitterTitle)}">`
        );
        
        // Replace canonical link
        html = html.replace(
            /<link rel="canonical" id="canonicalLink" href="[^"]*">/,
            `<link rel="canonical" id="canonicalLink" href="${this.escapeHtml(metadata.canonicalUrl)}">`
        );
        
        // Replace structured data
        html = html.replace(
            /<script type="application\/ld\+json" id="schemaArticle">\{\}<\/script>/,
            `<script type="application/ld+json" id="schemaArticle">${JSON.stringify(metadata.schemaArticle, null, 2)}</script>`
        );
        
        if (metadata.schemaFAQ) {
            html = html.replace(
                /<script type="application\/ld\+json" id="schemaFAQ">\{\}<\/script>/,
                `<script type="application/ld+json" id="schemaFAQ">${JSON.stringify(metadata.schemaFAQ, null, 2)}</script>`
            );
        } else {
            html = html.replace(
                /<script type="application\/ld\+json" id="schemaFAQ">\{\}<\/script>/,
                `<script type="application/ld+json" id="schemaFAQ">{}</script>`
            );
        }
        
        html = html.replace(
            /<script type="application\/ld\+json" id="schemaBreadcrumb">\{\}<\/script>/,
            `<script type="application/ld+json" id="schemaBreadcrumb">${JSON.stringify(metadata.schemaBreadcrumb, null, 2)}</script>`
        );
        
        // Pre-fill static content in the article body
        html = html.replace(
            /<h1 id="articleTitle" itemprop="headline"><\/h1>/,
            `<h1 id="articleTitle" itemprop="headline">${this.escapeHtml(article.title)}</h1>`
        );
        
        const formattedDate = new Date(article.created_at).toLocaleDateString('ru-RU');
        html = html.replace(
            /<time id="articleDate" itemprop="datePublished"><\/time>/,
            `<time id="articleDate" itemprop="datePublished" datetime="${article.created_at}">${formattedDate}</time>`
        );
        
        html = html.replace(
            /<span id="articleCategory" itemprop="articleSection"><\/span>/,
            `<span id="articleCategory" itemprop="articleSection">${this.escapeHtml(metadata.categoryName)}</span>`
        );
        
        // Update breadcrumb title
        html = html.replace(
            /<li id="breadcrumbTitle" aria-current="page">Загрузка...<\/li>/,
            `<li id="breadcrumbTitle" aria-current="page">${this.escapeHtml(article.title)}</li>`
        );
        
        // Add article content
        html = html.replace(
            /<div id="articleBody" itemprop="articleBody"><\/div>/,
            `<div id="articleBody" itemprop="articleBody">${article.content}</div>`
        );
        
        // Add image if available
        if (article.image_url) {
            html = html.replace(
                /<img id="articleImage" itemprop="image" class="article-hero-img-small" alt="" style="display:none">/,
                `<img id="articleImage" itemprop="image" class="article-hero-img-small" src="${this.escapeHtml(article.image_url)}" alt="${this.escapeHtml(article.title)}" style="display:block">`
            );
        } else {
            // If no image, keep the image tag hidden
            html = html.replace(
                /<img id="articleImage" itemprop="image" class="article-hero-img-small" alt="" style="display:none">/,
                `<img id="articleImage" itemprop="image" class="article-hero-img-small" alt="${this.escapeHtml(article.title)}" style="display:none">`
            );
        }
        
        // Add tags if available
        if (article.tags) {
            const tags = article.tags.split(',').map(t => t.trim()).filter(Boolean);
            const tagsHtml = tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('');
            html = html.replace(
                /<div id="articleTags" class="article-tags"><\/div>/,
                `<div id="articleTags" class="article-tags">${tagsHtml}</div>`
            );
        }
        
        // Remove the loading spinner since content is static
        html = html.replace(
            /<div class="loading-spinner" id="articleLoadingSpinner">[\s\S]*?<\/div>\s*/,
            ''
        );
        
        // Remove the JavaScript that loads the article content since it's already static
        // This is a more complex regex to remove the article loading script
        html = html.replace(
            /<!-- Контент заполняется article-page\.js -->[\s\S]*?<script src="\/js\/article-page\.js"><\/script>/,
            '<!-- Static content already loaded -->'
        );
        
        return html;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (typeof document !== 'undefined') {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        } else {
            // For Node.js environment
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }
    }

    // Fetch all articles from Supabase
    async fetchAllArticles() {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        console.log('Fetching articles from Supabase...');
        const { data, error } = await this.supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching articles:', error);
            throw error;
        }
        
        console.log(`Fetched ${data.length} articles from Supabase`);
        return data;
    }

    // Generate static pages for all articles
    async generateAllStaticArticles(domain = 'https://parasite-project.ru') {
        try {
            console.log('Starting static article generation...');
            
            const articles = await this.fetchAllArticles();
            
            console.log(`Generating static pages for ${articles.length} articles...`);
            
            for (const article of articles) {
                try {
                    const staticHtml = this.generateStaticArticleHTML(article, domain);
                    const slug = this.generateSlug(article.title);
                    const fileName = path.join(this.outputDir, `${slug}.html`);
                    
                    await fs.writeFile(fileName, staticHtml);
                    console.log(`Generated static page for: ${article.title} -> ${fileName}`);
                } catch (error) {
                    console.error(`Error generating static page for article "${article.title}":`, error);
                }
            }
            
            console.log(`Successfully generated static pages for ${articles.length} articles.`);
        } catch (error) {
            console.error('Error generating static articles:', error);
            throw error;
        }
    }

    // Generate a static index file that lists all articles for SEO
    async generateStaticIndex(articles, domain = 'https://parasite-project.ru') {
        // Get the main index.html template
        let indexTemplate;
        try {
            indexTemplate = await fs.readFile('./index.html', 'utf8');
        } catch (error) {
            console.log('index.html not found, creating a basic index page for articles');
            // Create a basic index template
            indexTemplate = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статьи о мошенничестве | PARASITE</title>
    <meta name="description" content="Статьи о мошеннических схемах, психологическом влиянии и защите от обмана">
    <link rel="canonical" href="${domain}/articles/">
</head>
<body>
    <header>
        <h1>Статьи о мошенничестве</h1>
    </header>
    <main>
        <div id="articles-list">
            <h2>Все статьи</h2>
            <ul id="articles-index">
                <!-- Articles will be listed here -->
            </ul>
        </div>
    </main>
</body>
</html>`;
        }
        
        // Generate links to all articles
        const articlesList = articles.map(article => {
            const slug = this.generateSlug(article.title);
            const canonicalUrl = `${domain}/articles/${slug}`;
            return `<li><a href="${slug}.html">${this.escapeHtml(article.title)}</a> - ${this.escapeHtml(article.excerpt || article.title)}</li>`;
        }).join('\n');
        
        // Replace the articles list in the template
        let indexHtml = indexTemplate.replace(
            /<ul id="articles-index">[\s\S]*?<\/ul>/,
            `<ul id="articles-index">\n${articlesList}\n</ul>`
        );
        
        const indexPath = path.join(this.outputDir, 'index.html');
        await fs.writeFile(indexPath, indexHtml);
        console.log(`Generated static index page with ${articles.length} articles`);
        
        // Generate sitemap for the articles
        await this.generateSitemap(articles, domain);
    }
    
    // Generate sitemap for Google Search Console
    async generateSitemap(articles, domain = 'https://parasite-project.ru') {
        const sitemapEntries = articles.map(article => {
            const slug = this.generateSlug(article.title);
            return `  <url>
    <loc>${domain}/articles/${slug}.html</loc>
    <lastmod>${new Date(article.updated_at || article.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }).join('\n');
        
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>`;
        
        const sitemapPath = path.join(this.outputDir, 'sitemap-articles.xml');
        await fs.writeFile(sitemapPath, sitemapContent);
        console.log(`Generated sitemap for ${articles.length} articles: ${sitemapPath}`);
    }
}

// If running this script directly
if (require.main === module) {
    // Get environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL || 'your_supabase_url_here';
    const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your_supabase_key_here';
    const DOMAIN = process.env.DOMAIN || 'https://www.01bearscommunity.at';
    
    if (!SUPABASE_URL || SUPABASE_URL === 'your_supabase_url_here') {
        console.error('Please set SUPABASE_URL environment variable');
        console.error('Create a .env file with: SUPABASE_URL=your_supabase_url SUPABASE_KEY=your_supabase_key');
        process.exit(1);
    }
    
    if (!SUPABASE_KEY || SUPABASE_KEY === 'your_supabase_key_here') {
        console.error('Please set SUPABASE_KEY environment variable');
        console.error('Create a .env file with: SUPABASE_URL=your_supabase_url SUPABASE_KEY=your_supabase_key');
        process.exit(1);
    }
    
    const generator = new StaticArticleGenerator(SUPABASE_URL, SUPABASE_KEY);
    
    // Initialize and run the generator
    (async () => {
        try {
            await generator.init();
            const articles = await generator.fetchAllArticles();
            await generator.generateAllStaticArticles(DOMAIN);
            await generator.generateStaticIndex(articles, DOMAIN);
            console.log('Static article generation completed successfully!');
        } catch (error) {
            console.error('Static article generation failed:', error);
            process.exit(1);
        }
    })();
}

module.exports = StaticArticleGenerator;