# Static Article Page Generator

This project implements a static article page generator that creates individual HTML files for each article with pre-generated metadata to improve SEO and search engine compatibility.

## Overview

The static article generator creates individual HTML files for each article with pre-populated:
- Meta tags (title, description, canonical URL)
- Open Graph tags for social sharing
- Schema.org structured data (Article, FAQ, Breadcrumb)
- Static content that search engines can index properly

## Files Created

1. `generate-static-articles.js` - Client-side version for demonstration
2. `generate-static-articles-node.js` - Server-side version for actual use
3. Updated `js/articles.js` - Modified to generate static URLs
4. Updated `js/article-page.js` - Added static HTML generation function

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
DOMAIN=https://parasite-project.ru
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

### 3. Run the Generator

```bash
node generate-static-articles-node.js
```

This will:
- Connect to your Supabase database
- Fetch all articles
- Generate static HTML files in the `./static-articles` directory
- Create an index page listing all articles

## How It Works

### 1. Metadata Generation

For each article, the generator creates:

- **Meta Title & Description**: SEO-optimized title and description
- **Canonical URL**: Proper canonical URLs for each article
- **Open Graph Tags**: For social media sharing
- **Twitter Cards**: Optimized for Twitter sharing

### 2. Structured Data

The generator creates three types of Schema.org structured data:

- **Article Schema**: Complete article information for search engines
- **FAQ Schema**: Extracts FAQ sections from article content
- **Breadcrumb Schema**: Navigation hierarchy for better SEO

### 3. URL Structure

Generated articles follow a clean URL structure:
- `/articles/article-title.html`

### 4. SEO Improvements

- **Static Content**: Search engines can properly index the content
- **Pre-generated Metadata**: No JavaScript required for metadata
- **Structured Data**: Rich snippets in search results
- **Canonical URLs**: Proper duplicate content handling
- **Breadcrumb Navigation**: Better search result presentation

## Deployment

1. Run the generator to create static files
2. Upload the generated static files to your web server
3. Configure your web server to serve static HTML files
4. Update your sitemap.xml to include the new static article URLs

## Benefits

- **Better SEO**: Search engines can properly index content
- **Faster Loading**: No JavaScript required to load content
- **Improved Caching**: Static files can be cached more efficiently
- **Better Social Sharing**: Proper Open Graph tags for each article
- **Rich Snippets**: Structured data enables rich search results

## Integration

The generator maintains compatibility with the existing system:
- Article links now point to static HTML files
- Dynamic functionality still works for admin features
- Comments system remains dynamic
- Analytics still track page views

## Troubleshooting

### Common Issues:

1. **Supabase Connection**: Ensure your Supabase URL and key are correct
2. **Missing Articles**: Verify your Supabase articles table has data
3. **File Permissions**: Ensure the script has write access to the output directory

### Error Handling:

The generator includes comprehensive error handling and will continue processing even if individual articles fail to generate.