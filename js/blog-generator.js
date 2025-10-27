// Blog generator script to create static HTML files from posts data

class BlogGenerator {
    constructor() {
        this.posts = [];
        this.settings = {
            blogTitle: "SnapTik Blog",
            blogDescription: "Latest TikTok news, guides, and tips",
            postsPerPage: 6,
            baseUrl: "https://snaptikks.com"
        };
    }

    async init() {
        try {
            // In a real implementation, this would fetch from your data source
            // For now, we'll use localStorage or the JSON file
            await this.loadPosts();
            await this.loadSettings();
        } catch (error) {
            console.error('Error initializing blog generator:', error);
        }
    }

    async loadPosts() {
        // Try to load from localStorage first (from admin panel)
        const localPosts = localStorage.getItem('snaptik_blog_posts');
        if (localPosts) {
            this.posts = JSON.parse(localPosts);
            return;
        }

        // Fallback to JSON file
        try {
            const response = await fetch('/data/posts.json');
            this.posts = await response.json();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    async loadSettings() {
        const localSettings = localStorage.getItem('snaptik_blog_settings');
        if (localSettings) {
            this.settings = { ...this.settings, ...JSON.parse(localSettings) };
        }
    }

    generateBlogIndex() {
        const publishedPosts = this.posts.filter(post => post.status === 'published');
        const categories = this.getCategoriesWithCounts();
        
        return this.generateBlogIndexHTML(publishedPosts, categories);
    }

    generateBlogIndexHTML(posts, categories) {
        const postsHTML = posts.map(post => this.generatePostCard(post)).join('');
        const categoriesHTML = categories.map(cat => 
            `<li><a href="#" data-category="${cat.slug}">${cat.name}</a> <span>(${cat.count})</span></li>`
        ).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.settings.blogTitle} | Latest TikTok News and Guides</title>
    <meta name="description" content="${this.settings.blogDescription}">
    <meta name="keywords" content="tiktok blog, tiktok news, tiktok guides, tiktok trends, tiktok tips">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/blog.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="/"><h1>SnapTik</h1></a>
            </div>
            <nav class="nav">
                <a href="/">Home</a>
                <a href="/blog.html" class="active">Blog</a>
                <a href="/#features">Features</a>
                <a href="/#how-to">How to use</a>
                <a href="/#faq">FAQ</a>
            </nav>
        </div>
    </header>

    <section class="blog-hero">
        <div class="container">
            <h1 class="blog-title">${this.settings.blogTitle}</h1>
            <p class="blog-subtitle">${this.settings.blogDescription}</p>
        </div>
    </section>

    <section class="blog-content">
        <div class="container">
            <div class="blog-layout">
                <main class="blog-main">
                    <div class="blog-posts" id="blogPosts">
                        ${postsHTML}
                    </div>
                </main>
                
                <aside class="blog-sidebar">
                    <div class="sidebar-widget">
                        <h3 class="widget-title">Categories</h3>
                        <ul class="category-list">
                            <li><a href="#" data-category="all" class="active">All</a> <span>(${posts.length})</span></li>
                            ${categoriesHTML}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <script src="js/config.js"></script>
    <script src="js/blog.js"></script>
</body>
</html>`;
    }

    generatePostCard(post) {
        const isFirstPost = this.posts.indexOf(post) === 0;
        const cardClass = isFirstPost ? 'blog-post featured' : 'blog-post';
        
        return `
        <article class="${cardClass}">
            <div class="post-image">
                <img src="${post.image || 'https://via.placeholder.com/400x250/667eea/ffffff?text=Blog+Post'}" alt="${post.title}">
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-category">${this.capitalizeFirst(post.category)}</span>
                    <span class="post-date">${this.formatDate(post.date)}</span>
                </div>
                <h${isFirstPost ? '2' : '3'} class="post-title">
                    <a href="/blog/${post.slug}.html">${post.title}</a>
                </h${isFirstPost ? '2' : '3'}>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="/blog/${post.slug}.html" class="read-more">Read more</a>
            </div>
        </article>`;
    }

    generatePostPage(post) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | ${this.settings.blogTitle}</title>
    <meta name="description" content="${post.metaDescription || post.excerpt}">
    <meta name="keywords" content="${post.metaKeywords || post.tags.join(', ')}">
    <meta name="author" content="${post.author}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${this.settings.baseUrl}/blog/${post.slug}.html">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.metaDescription || post.excerpt}">
    <meta property="og:image" content="${post.image}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${post.title}">
    <meta property="twitter:description" content="${post.metaDescription || post.excerpt}">
    <meta property="twitter:image" content="${post.image}">
    
    <link rel="canonical" href="${this.settings.baseUrl}/blog/${post.slug}.html">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/blog.css">
    <link rel="stylesheet" href="../css/article.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${post.title}",
      "description": "${post.metaDescription || post.excerpt}",
      "image": "${post.image}",
      "author": {
        "@type": "Person",
        "name": "${post.author}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SnapTik"
      },
      "datePublished": "${post.date}",
      "dateModified": "${post.date}"
    }
    </script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="/"><h1>SnapTik</h1></a>
            </div>
            <nav class="nav">
                <a href="/">Home</a>
                <a href="/blog.html">Blog</a>
                <a href="/#features">Features</a>
                <a href="/#how-to">How to use</a>
                <a href="/#faq">FAQ</a>
            </nav>
        </div>
    </header>

    <nav class="breadcrumb">
        <div class="container">
            <a href="/">Home</a>
            <span class="breadcrumb-separator">›</span>
            <a href="/blog.html">Blog</a>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">${post.title}</span>
        </div>
    </nav>

    <main class="article-main">
        <div class="container">
            <div class="article-layout">
                <article class="article-content">
                    <header class="article-header">
                        <div class="article-meta">
                            <span class="article-category">${this.capitalizeFirst(post.category)}</span>
                            <time class="article-date" datetime="${post.date}">${this.formatDate(post.date)}</time>
                            <span class="article-read-time">${this.calculateReadTime(post.content)} min read</span>
                        </div>
                        <h1 class="article-title">${post.title}</h1>
                        <p class="article-excerpt">${post.excerpt}</p>
                        ${post.image ? `
                        <div class="article-featured-image">
                            <img src="${post.image}" alt="${post.title}">
                        </div>` : ''}
                    </header>

                    <div class="article-body">
                        ${post.content}
                    </div>

                    <footer class="article-footer">
                        <div class="article-tags">
                            <span class="tags-label">Tags:</span>
                            ${post.tags.map(tag => `<a href="#" class="tag">${tag}</a>`).join('')}
                        </div>
                        
                        <div class="article-share">
                            <span class="share-label">Share:</span>
                            <div class="share-buttons">
                                <a href="#" class="share-btn facebook" title="Share on Facebook">📘</a>
                                <a href="#" class="share-btn twitter" title="Share on Twitter">🐦</a>
                                <a href="#" class="share-btn linkedin" title="Share on LinkedIn">💼</a>
                                <a href="#" class="share-btn copy" title="Copy link">📋</a>
                            </div>
                        </div>
                    </footer>
                </article>

                <aside class="article-sidebar">
                    <div class="sidebar-widget">
                        <h3 class="widget-title">Related Posts</h3>
                        <div class="related-posts">
                            ${this.getRelatedPosts(post, 3).map(relatedPost => `
                            <article class="related-post">
                                <img src="${relatedPost.image || 'https://via.placeholder.com/80x60'}" alt="${relatedPost.title}">
                                <div class="related-post-content">
                                    <h4><a href="/blog/${relatedPost.slug}.html">${relatedPost.title}</a></h4>
                                    <span class="related-post-date">${this.formatDate(relatedPost.date)}</span>
                                </div>
                            </article>`).join('')}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </main>

    <script src="../js/config.js"></script>
    <script src="../js/article.js"></script>
</body>
</html>`;
    }

    getCategoriesWithCounts() {
        const categoryMap = new Map();
        
        this.posts.filter(post => post.status === 'published').forEach(post => {
            const category = post.category;
            if (categoryMap.has(category)) {
                categoryMap.set(category, categoryMap.get(category) + 1);
            } else {
                categoryMap.set(category, 1);
            }
        });

        return Array.from(categoryMap.entries()).map(([slug, count]) => ({
            slug,
            name: this.capitalizeFirst(slug),
            count
        }));
    }

    getRelatedPosts(currentPost, limit = 3) {
        return this.posts
            .filter(post => 
                post.status === 'published' && 
                post.id !== currentPost.id &&
                (post.category === currentPost.category || 
                 post.tags.some(tag => currentPost.tags.includes(tag)))
            )
            .slice(0, limit);
    }

    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Method to generate all static files
    async generateAllFiles() {
        try {
            await this.init();
            
            // Generate blog index
            const blogIndexHTML = this.generateBlogIndex();
            
            // Generate individual post pages
            const postPages = this.posts
                .filter(post => post.status === 'published')
                .map(post => ({
                    filename: `blog/${post.slug}.html`,
                    content: this.generatePostPage(post)
                }));

            return {
                'blog.html': blogIndexHTML,
                ...Object.fromEntries(postPages.map(page => [page.filename, page.content]))
            };
            
        } catch (error) {
            console.error('Error generating files:', error);
            return {};
        }
    }

    // Method to save generated files (in a real implementation)
    async saveFiles(files) {
        // In a real implementation, this would save files to the server
        // For demo purposes, we'll log the file structure
        console.log('Generated files:', Object.keys(files));
        
        // You could implement this to:
        // 1. Send files to your server via API
        // 2. Use Node.js fs to write files locally
        // 3. Integrate with a static site generator
        
        return files;
    }
}

// Export for use in admin panel
window.BlogGenerator = BlogGenerator;