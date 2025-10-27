// Admin JavaScript functionality

// Sample data structure for posts
let posts = [
    {
        id: 1,
        title: "SnapTik: The Best No-Watermark TikTok Video Downloader",
        slug: "snaptik-best-no-watermark-tiktok-downloader",
        category: "guide",
        status: "published",
        excerpt: "Welcome to SnapTik, the leading solution for downloading high-quality TikTok videos without watermarks.",
        content: "Full content here...",
        image: "https://via.placeholder.com/800x400/667eea/ffffff?text=SnapTik+Guide",
        tags: ["TikTok Downloader", "No Watermark", "SnapTik"],
        metaDescription: "Welcome to SnapTik, the leading solution for downloading high-quality TikTok videos without watermarks.",
        metaKeywords: "tiktok downloader, no watermark, snaptik",
        date: "2025-10-27",
        author: "Admin"
    },
    {
        id: 2,
        title: "Top 10 Hottest TikTok Trends in October 2025",
        slug: "top-tiktok-trends-october-2025",
        category: "trends",
        status: "published",
        excerpt: "Stay updated with the latest viral challenges, hashtags, and trends taking over TikTok.",
        content: "Content about trends...",
        image: "https://via.placeholder.com/400x250/4ecdc4/ffffff?text=TikTok+Trends",
        tags: ["TikTok Trends", "Viral", "October 2025"],
        metaDescription: "Discover the hottest TikTok trends and viral challenges in October 2025.",
        metaKeywords: "tiktok trends, viral challenges, october 2025",
        date: "2025-10-26",
        author: "Admin"
    }
];

let currentEditingPost = null;
let nextPostId = 3;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initializing...');
    
    // Force hide loading screen after max 3 seconds
    const forceHideLoading = setTimeout(() => {
        const adminLoading = document.getElementById('adminLoading');
        if (adminLoading) {
            adminLoading.style.display = 'none';
            console.log('Force hiding loading screen');
        }
    }, 3000);
    
    // Hide initial loading after a short delay
    setTimeout(() => {
        const adminLoading = document.getElementById('adminLoading');
        if (adminLoading) {
            adminLoading.classList.add('fade-out');
            setTimeout(() => {
                adminLoading.style.display = 'none';
                clearTimeout(forceHideLoading); // Clear force timeout
            }, 500);
        }
    }, 1000); // Reduced from 1500 to 1000
    
    // Initialize admin components
    setTimeout(() => {
        try {
            initializeAdmin();
            loadPosts();
            updateDashboardStats();
            setupEventListeners();
            
            console.log('Admin panel initialized successfully');
        } catch (error) {
            console.error('Admin initialization error:', error);
            // Hide loading even if there's an error
            const adminLoading = document.getElementById('adminLoading');
            if (adminLoading) {
                adminLoading.style.display = 'none';
            }
        }
    }, 200); // Much faster initialization
});

function initializeAdmin() {
    try {
        // Load posts from localStorage if available
        const savedPosts = localStorage.getItem('snaptik_blog_posts');
        if (savedPosts) {
            posts = JSON.parse(savedPosts);
            nextPostId = Math.max(...posts.map(p => p.id)) + 1;
        }
        console.log('Admin initialized with', posts.length, 'posts');
    } catch (error) {
        console.error('Error initializing admin:', error);
        // Fallback: use default posts if localStorage fails
        console.log('Using default posts as fallback');
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
        btn.addEventListener('click', function() {
            showSection(this.dataset.section);
            
            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Form listeners
    const postTitle = document.getElementById('postTitle');
    const postSlug = document.getElementById('postSlug');
    
    postTitle.addEventListener('input', function() {
        if (!postSlug.value || postSlug.value === generateSlug(postTitle.dataset.oldValue || '')) {
            postSlug.value = generateSlug(this.value);
        }
        postTitle.dataset.oldValue = this.value;
    });

    // Meta description character count
    const metaDescription = document.getElementById('metaDescription');
    metaDescription.addEventListener('input', function() {
        const charCount = this.value.length;
        const counter = this.parentNode.querySelector('.char-count');
        counter.textContent = `${charCount}/160 characters`;
        
        if (charCount > 160) {
            counter.style.color = '#dc3545';
        } else {
            counter.style.color = '#666';
        }
    });

    // File import
    document.getElementById('importFile').addEventListener('change', handleFileImport);

    // Filter listeners
    document.getElementById('filterCategory').addEventListener('change', filterPosts);
    document.getElementById('filterStatus').addEventListener('change', filterPosts);
    document.getElementById('searchPosts').addEventListener('input', filterPosts);
}

function initializeTinyMCE() {
    // Check if TinyMCE is already initialized
    if (typeof tinymce !== 'undefined' && tinymce.get('postContent')) {
        console.log('TinyMCE already initialized');
        return;
    }

    // Wait for TinyMCE to be available
    if (typeof tinymce === 'undefined') {
        console.log('TinyMCE not loaded yet, retrying...');
        setTimeout(initializeTinyMCE, 1000);
        return;
    }

    try {
        tinymce.init({
            selector: '#postContent',
            height: 600,
            menubar: 'file edit view insert format tools table help',
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
                'quickbars', 'accordion'
            ],
            toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
            toolbar2: 'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | blockquote hr pagebreak',
            toolbar3: 'link image media table emoticons charmap | insertdatetime | code codesample | fullscreen preview | help',
            
            // Enhanced formatting options
            block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Quote=blockquote',
            
            font_family_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times; Verdana=verdana,geneva',
            
            font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
            
            // Simplified content styling
            content_style: `
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
                    font-size: 14px; 
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1, h2, h3, h4, h5, h6 { 
                    color: #333; 
                    margin-top: 1.5em; 
                    margin-bottom: 0.5em; 
                }
                p { margin-bottom: 1em; }
                blockquote { 
                    border-left: 4px solid #ddd; 
                    margin-left: 0; 
                    padding-left: 1em; 
                    color: #666; 
                    font-style: italic; 
                }
                code { 
                    background-color: #f4f4f4; 
                    padding: 2px 4px; 
                    border-radius: 3px; 
                    font-family: Consolas, Monaco, 'Courier New', monospace; 
                }
                img { 
                    max-width: 100%; 
                    height: auto; 
                    border-radius: 5px; 
                }
                table { 
                    border-collapse: collapse; 
                    width: 100%; 
                    margin: 1em 0; 
                }
                table th, table td { 
                    border: 1px solid #ddd; 
                    padding: 8px 12px; 
                    text-align: left; 
                }
                table th { 
                    background-color: #f8f9fa; 
                    font-weight: 600; 
                }
            `,
            
            // Basic settings to avoid loading issues
            promotion: false,
            branding: false,
            resize: false,
            elementpath: false,
            statusbar: false,
            
            setup: function(editor) {
                editor.on('init', function() {
                    console.log('TinyMCE initialized successfully');
                });
                
                editor.on('change', function() {
                    editor.save();
                });
                
                // Custom button for inserting current date
                editor.ui.registry.addButton('insertdate', {
                    text: 'Date',
                    tooltip: 'Insert current date',
                    onAction: function() {
                        const now = new Date();
                        const dateString = now.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        editor.insertContent(dateString);
                    }
                });
                
                // Add custom buttons to toolbar
                editor.settings.toolbar3 += ' | insertdate';
            }
        });
    } catch (error) {
        console.error('TinyMCE initialization error:', error);
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Refresh data for specific sections
    if (sectionId === 'posts') {
        loadPosts();
    } else if (sectionId === 'dashboard') {
        updateDashboardStats();
    } else if (sectionId === 'add-post') {
        // Initialize TinyMCE when Add New Post section is shown
        setTimeout(() => {
            if (!tinymce.get('postContent')) {
                initializeTinyMCE();
            }
        }, 100);
    }
}

function updateDashboardStats() {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const draftPosts = posts.filter(p => p.status === 'draft').length;
    const categories = [...new Set(posts.map(p => p.category))].length;
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('publishedPosts').textContent = publishedPosts;
    document.getElementById('draftPosts').textContent = draftPosts;
    document.getElementById('categoriesCount').textContent = categories;
}

function loadPosts() {
    const tbody = document.getElementById('postsTableBody');
    tbody.innerHTML = '';
    
    let filteredPosts = [...posts];
    
    // Apply filters
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchPosts').value.toLowerCase();
    
    if (categoryFilter !== 'all') {
        filteredPosts = filteredPosts.filter(p => p.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredPosts = filteredPosts.filter(p => p.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.excerpt.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredPosts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="post-title">${post.title}</div>
            </td>
            <td>
                <span class="post-category">${post.category}</span>
            </td>
            <td>
                <span class="post-status ${post.status}">${post.status}</span>
            </td>
            <td>${formatDate(post.date)}</td>
            <td>
                <div class="post-actions">
                    <button class="action-btn edit" onclick="editPost(${post.id})">Edit</button>
                    <button class="action-btn delete" onclick="deletePost(${post.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterPosts() {
    loadPosts();
}

function showAddPostForm() {
    currentEditingPost = null;
    document.getElementById('formTitle').textContent = 'Add New Post';
    clearForm();
    showSection('add-post');
    
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-section="add-post"]').classList.add('active');
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    currentEditingPost = post;
    document.getElementById('formTitle').textContent = 'Edit Post';
    
    // Fill form with post data
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postSlug').value = post.slug;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postStatus').value = post.status;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postTags').value = post.tags.join(', ');
    document.getElementById('metaDescription').value = post.metaDescription || '';
    document.getElementById('metaKeywords').value = post.metaKeywords || '';
    document.getElementById('postId').value = post.id;
    document.getElementById('postDate').value = post.date;
    
    // Set TinyMCE content
    if (tinymce.get('postContent')) {
        tinymce.get('postContent').setContent(post.content);
    }
    
    showSection('add-post');
    
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-section="add-post"]').classList.add('active');
}

function deletePost(postId) {
    currentEditingPost = posts.find(p => p.id === postId);
    showModal('deleteModal');
}

function confirmDelete() {
    if (currentEditingPost) {
        posts = posts.filter(p => p.id !== currentEditingPost.id);
        savePosts();
        loadPosts();
        updateDashboardStats();
        closeModal('deleteModal');
        showNotification('Post deleted successfully', 'success');
    }
}

function saveDraft() {
    savePost('draft');
}

function publishPost() {
    savePost('published');
}

function savePost(status) {
    const form = document.getElementById('postForm');
    
    // Validation
    if (!form.postTitle.value.trim()) {
        showNotification('Title is required', 'error');
        return;
    }
    
    if (!form.postCategory.value) {
        showNotification('Category is required', 'error');
        return;
    }
    
    if (!form.postExcerpt.value.trim()) {
        showNotification('Excerpt is required', 'error');
        return;
    }
    
    // Get TinyMCE content
    const content = tinymce.get('postContent') ? tinymce.get('postContent').getContent() : '';
    if (!content.trim()) {
        showNotification('Content is required', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate save delay
    setTimeout(() => {
        const postData = {
            title: form.postTitle.value.trim(),
            slug: form.postSlug.value.trim() || generateSlug(form.postTitle.value),
            category: form.postCategory.value,
            status: status,
            excerpt: form.postExcerpt.value.trim(),
            content: content,
            image: form.postImage.value.trim(),
            tags: form.postTags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            metaDescription: form.metaDescription.value.trim(),
            metaKeywords: form.metaKeywords.value.trim(),
            author: 'Admin'
        };
        
        if (currentEditingPost) {
            // Edit existing post
            const index = posts.findIndex(p => p.id === currentEditingPost.id);
            posts[index] = { ...posts[index], ...postData };
            showNotification('Post updated successfully', 'success');
        } else {
            // Add new post
            postData.id = nextPostId++;
            postData.date = new Date().toISOString().split('T')[0];
            posts.push(postData);
            showNotification('Post saved successfully', 'success');
        }
        
        savePosts();
        updateDashboardStats();
        
        if (status === 'published') {
            generateStaticFiles(postData);
        }
        
        showLoading(false);
        
        // Return to posts list
        showSection('posts');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.nav-btn[data-section="posts"]').classList.add('active');
        
    }, 1000);
}

function generateStaticFiles(post) {
    // Generate static files using BlogGenerator
    if (window.BlogGenerator) {
        const generator = new window.BlogGenerator();
        generator.generateAllFiles().then(files => {
            console.log('Generated static files:', Object.keys(files));
            
            // In a real implementation, you would save these files to your server
            // For now, we'll just log them
            showNotification('Static files generated successfully', 'success');
        }).catch(error => {
            console.error('Error generating static files:', error);
            showNotification('Error generating static files', 'error');
        });
    } else {
        console.log('BlogGenerator not available, skipping static file generation');
    }
}

function clearForm() {
    document.getElementById('postForm').reset();
    if (tinymce.get('postContent')) {
        tinymce.get('postContent').setContent('');
    }
    document.querySelector('.char-count').textContent = '0/160 characters';
}

function cancelForm() {
    showSection('posts');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-section="posts"]').classList.add('active');
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function savePosts() {
    localStorage.setItem('snaptik_blog_posts', JSON.stringify(posts));
}

function exportPosts() {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'snaptik_blog_posts.json';
    link.click();
    
    showNotification('Posts exported successfully', 'success');
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPosts = JSON.parse(e.target.result);
            
            if (Array.isArray(importedPosts)) {
                posts = importedPosts;
                nextPostId = Math.max(...posts.map(p => p.id)) + 1;
                savePosts();
                loadPosts();
                updateDashboardStats();
                showNotification('Posts imported successfully', 'success');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            showNotification('Error importing file', 'error');
        }
    };
    reader.readAsText(file);
}

function addCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    const categoryName = newCategoryInput.value.trim();
    
    if (!categoryName) {
        showNotification('Category name is required', 'error');
        return;
    }
    
    // Add to select options
    const selects = document.querySelectorAll('#postCategory, #filterCategory');
    selects.forEach(select => {
        const option = document.createElement('option');
        option.value = categoryName.toLowerCase();
        option.textContent = categoryName;
        select.appendChild(option);
    });
    
    // Add to categories list
    const categoriesList = document.getElementById('categoriesList');
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
        <span>${categoryName}</span>
        <button class="btn-danger-sm" onclick="removeCategory(this, '${categoryName.toLowerCase()}')">Delete</button>
    `;
    categoriesList.appendChild(categoryItem);
    
    newCategoryInput.value = '';
    showNotification('Category added successfully', 'success');
}

function removeCategory(button, categoryValue) {
    // Remove from UI
    button.parentElement.remove();
    
    // Remove from select options
    const selects = document.querySelectorAll('#postCategory, #filterCategory');
    selects.forEach(select => {
        const option = select.querySelector(`option[value="${categoryValue}"]`);
        if (option) option.remove();
    });
    
    showNotification('Category removed successfully', 'success');
}

function saveSettings() {
    const settings = {
        blogTitle: document.getElementById('blogTitle').value,
        blogDescription: document.getElementById('blogDescription').value,
        postsPerPage: document.getElementById('postsPerPage').value
    };
    
    localStorage.setItem('snaptik_blog_settings', JSON.stringify(settings));
    showNotification('Settings saved successfully', 'success');
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1500;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#admin-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 15px;
                padding: 0;
                line-height: 1;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Click outside modal to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});