// ========================================
// Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTheme();
    initMobileMenu();
    initScrollAnimations();
    initHorizontalWaterfall();
    initPortfolioFilter();
    initLightbox();
    initContactForm();
});

// ========================================
// Theme Toggle (Default: Dark)
// ========================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
        moonIcon.style.display = theme === 'light' ? 'block' : 'none';
    }
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            const theme = document.documentElement.getAttribute('data-theme');
            if (window.scrollY > 50) {
                navbar.style.background = theme === 'dark' 
                    ? 'rgba(10, 10, 10, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'var(--shadow-sm)';
            } else {
                navbar.style.background = theme === 'dark'
                    ? 'rgba(10, 10, 10, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// ========================================
// Horizontal Waterfall Layout (JS计算方案)
// ========================================
function initHorizontalWaterfall() {
    const grid = document.querySelector('.portfolio-grid');
    if (!grid) return;
    
    const items = Array.from(grid.querySelectorAll('.portfolio-item'));
    if (items.length === 0) return;
    
    // 等待所有图片加载完成
    function waitForImages() {
        return new Promise((resolve) => {
            const images = items.map(item => item.querySelector('img')).filter(img => img);
            
            if (images.length === 0) {
                resolve();
                return;
            }
            
            let loadedCount = 0;
            images.forEach(img => {
                if (img.complete && img.naturalWidth > 0) {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        setTimeout(resolve, 100);
                    }
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            setTimeout(resolve, 100);
                        }
                    });
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            setTimeout(resolve, 100);
                        }
                    });
                }
            });
            
            // 超时保护
            setTimeout(resolve, 5000);
        });
    }
    
    // 执行瀑布流布局
    function runLayout() {
        const visibleItems = items.filter(item => item.style.display !== 'none');
        layoutWaterfall(grid, visibleItems);
    }
    
    // 立即执行
    runLayout();
    
    // 图片加载后重新布局
    waitForImages().then(() => {
        setTimeout(runLayout, 100);
    });
    
    // 窗口大小改变时重新布局
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            runLayout();
        }, 200);
    });
}

function layoutWaterfall(grid, items) {
    const containerWidth = grid.offsetWidth;
    const gap = 20;
    
    // 根据容器宽度计算列数
    let columnCount;
    if (containerWidth > 1200) columnCount = 4;
    else if (containerWidth > 900) columnCount = 3;
    else if (containerWidth > 580) columnCount = 2;
    else columnCount = 1;
    
    const columnWidth = (containerWidth - (columnCount - 1) * gap) / columnCount;
    
    // 为每张图片计算实际高度
    const heights = new Array(columnCount).fill(0);
    
    // 先设置所有item为固定宽度
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img) return;
        
        item.style.width = columnWidth + 'px';
        item.style.position = 'absolute';
        item.style.left = '0';
        item.style.top = '0';
        item.style.margin = '0';
    });
    
    // 强制浏览器重新布局，确保图片尺寸已计算
    grid.offsetHeight;
    
    // 计算每个item的位置
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img) return;
        
        // 使用 offsetWidth/offsetHeight（渲染尺寸）而不是 naturalWidth/naturalHeight
        let ratio;
        if (img.offsetWidth > 0 && img.offsetHeight > 0) {
            ratio = img.offsetHeight / img.offsetWidth;
        } else if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            ratio = img.naturalHeight / img.naturalWidth;
        } else {
            ratio = 1.5; // 默认 3:2 比例
        }
        
        // 找到最短的列
        let minHeight = heights[0];
        let minIndex = 0;
        for (let i = 1; i < heights.length; i++) {
            if (heights[i] < minHeight) {
                minHeight = heights[i];
                minIndex = i;
            }
        }
        
        // 计算图片显示高度
        let displayHeight;
        if (img.offsetWidth > 0 && img.offsetHeight > 0) {
            displayHeight = columnWidth * (img.offsetHeight / img.offsetWidth);
        } else {
            displayHeight = columnWidth * ratio;
        }
        
        // 设置位置
        item.style.left = (minIndex * (columnWidth + gap)) + 'px';
        item.style.top = heights[minIndex] + 'px';
        
        // 更新列高度
        heights[minIndex] += displayHeight + gap;
    });
    
    // 设置容器高度
    const maxHeight = Math.max(...heights);
    grid.style.height = maxHeight + 'px';
    grid.style.position = 'relative';
}

// ========================================
// Portfolio Filter
// ========================================
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterButtons.length === 0) return;
    
    // 检查URL参数，自动触发筛选
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilter = urlParams.get('filter');
    
    // 执行筛选的函数
    function applyFilter(filter) {
        portfolioItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // 重新布局
        setTimeout(() => {
            const grid = document.querySelector('.portfolio-grid');
            const visibleItems = Array.from(grid.querySelectorAll('.portfolio-item')).filter(i => i.style.display !== 'none');
            layoutWaterfall(grid, visibleItems);
        }, 350);
    }
    
    // 绑定按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
    
    // 如果有URL参数，自动触发对应筛选
    if (initialFilter) {
        const targetButton = document.querySelector(`.filter-btn[data-filter="${initialFilter}"]`);
        if (targetButton) {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');
            applyFilter(initialFilter);
        }
    }
}

// ========================================
// Lightbox (Simplified & Fixed)
// ========================================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxCategory = lightbox.querySelector('.lightbox-category');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    let currentIndex = 0;
    let visibleItems = [];
    
    // Open lightbox
    portfolioItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Get all visible items
            visibleItems = Array.from(portfolioItems).filter(i => i.style.display !== 'none');
            currentIndex = visibleItems.indexOf(item);
            
            showImage(item);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    function showImage(item) {
        const img = item.querySelector('img');
        if (!img) return;
        
        // Use the actual image source
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || '';
        
        const title = item.querySelector('.portfolio-title');
        const category = item.querySelector('.portfolio-category');
        
        if (title) lightboxTitle.textContent = title.textContent;
        if (category) {
            lightboxCategory.textContent = category.textContent;
            lightboxCategory.style.display = 'block';
        }
    }
    
    function closeLightboxFunc() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showPrev() {
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        showImage(visibleItems[currentIndex]);
    }
    
    function showNext() {
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex + 1) % visibleItems.length;
        showImage(visibleItems[currentIndex]);
    }
    
    // Event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightboxFunc);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPrev();
        });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNext();
        });
    }
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightboxFunc();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const message = form.querySelector('#message').value;
        
        const mailtoLink = `mailto:1812546463@qq.com?subject=Portfolio Contact - ${encodeURIComponent(name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
        
        window.location.href = mailtoLink;
        
        alert('感谢您的留言！我会尽快回复您。');
        form.reset();
    });
}

// ========================================
// Page Loader
// ========================================
window.addEventListener('load', function() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.width = '100%';
        setTimeout(() => {
            loader.style.opacity = '0';
        }, 500);
    }
});

// ========================================
// Card Hover Effects
// ========================================
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.setProperty('--mouse-x', x + '%');
        this.style.setProperty('--mouse-y', y + '%');
    });
});
