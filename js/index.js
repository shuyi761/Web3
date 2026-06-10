// 轮播图功能
function initCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicators span');
    
    let currentIndex = 0;
    const itemCount = items.length;
    
    function showSlide(index) {
        currentIndex = (index + itemCount) % itemCount;
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentIndex);
        });
    }
    
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
    
    indicators.forEach((indicator, i) => {
        indicator.addEventListener('click', () => showSlide(i));
    });
    
    // 自动轮播
    setInterval(() => showSlide(currentIndex + 1), 4000);
}

// 渲染商品列表
function renderProducts(products) {
    const productGrid = document.getElementById('product-grid');
    
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<p class="no-products">暂无商品</p>';
        return;
    }
    
    productGrid.innerHTML = products.map(product => `
        <div class="product-item" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">¥${product.price.toFixed(2)}</p>
            <p class="product-desc">${product.description}</p>
            <button class="add-to-cart-btn" data-id="${product.id}">加入购物车</button>
        </div>
    `).join('');
    
    // 添加点击事件
    document.querySelectorAll('.product-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
                const productId = item.dataset.id;
                window.location.href = `./html/goodsDetail.html?id=${productId}`;
            }
        });
    });
    
    // 添加到购物车事件
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.id);
            const product = getProductById(productId);
            
            if (product) {
                Cart.addToCart(product, 1);
                updateCartCount();
                showToast('已添加到购物车');
            }
        });
    });
}

// 更新购物车数量显示
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = Cart.getTotalCount();
    }
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 分类筛选
function initCategoryFilter() {
    const navItems = document.querySelectorAll('.nav-list a, .category-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 更新导航状态
            document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
            if (item.tagName === 'A') {
                item.classList.add('active');
            } else {
                document.querySelector(`.nav-list a[data-category="${item.dataset.category}"]`).classList.add('active');
            }
            
            const category = item.dataset.category;
            const products = getProducts(category);
            renderProducts(products);
        });
    });
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const suggestions = document.getElementById('search-suggestions');
    
    // 确保元素存在
    if (!searchInput || !searchBtn) {
        console.error('搜索框或按钮未找到');
        return;
    }
    
    function handleSearch() {
        const keyword = searchInput.value.trim();
        suggestions.classList.remove('show');
        
        if (keyword) {
            const results = searchProducts(keyword);
            renderProducts(results);
            // 更新页面标题提示
            const productsSection = document.querySelector('.products h2');
            if (productsSection) {
                productsSection.textContent = `搜索结果: "${keyword}"`;
            }
        } else {
            renderProducts(getProducts('all'));
            const productsSection = document.querySelector('.products h2');
            if (productsSection) {
                productsSection.textContent = '热门商品';
            }
        }
    }
    
    function showSuggestions() {
        const keyword = searchInput.value.trim();
        
        if (!keyword) {
            // 显示热门搜索推荐
            const hotProducts = getProducts('all').slice(0, 6);
            suggestions.innerHTML = hotProducts.map(product => `
                <div class="suggestion-item" data-id="${product.id}">
                    <i class="fas fa-search"></i>
                    <span>${product.name}</span>
                </div>
            `).join('');
            suggestions.classList.add('show');
            return;
        }
        
        const matchedProducts = searchProducts(keyword);
        if (matchedProducts.length > 0) {
            suggestions.innerHTML = matchedProducts.slice(0, 6).map(product => `
                <div class="suggestion-item" data-id="${product.id}">
                    <i class="fas fa-search"></i>
                    <span>${product.name}</span>
                </div>
            `).join('');
            suggestions.classList.add('show');
        } else {
            suggestions.classList.remove('show');
        }
    }
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleSearch();
    });
    
    // 回车键搜索
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
    
    // 输入时显示推荐
    searchInput.addEventListener('keyup', function(e) {
        if (e.key !== 'Enter') {
            showSuggestions();
        }
    });
    
    // 聚焦时显示推荐
    searchInput.addEventListener('focus', showSuggestions);
    
    // 点击推荐项跳转
    suggestions.addEventListener('click', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const productId = item.dataset.id;
            window.location.href = `./html/goodsDetail.html?id=${productId}`;
        }
    });
    
    // 点击页面其他地方关闭推荐
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.remove('show');
        }
    });
}

// 返回顶部
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 更新用户状态
function updateUserStatus() {
    const user = User.getCurrentUser();
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const profileLink = document.getElementById('profile-link');
    const userName = document.getElementById('user-name');
    
    if (user) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        profileLink.style.display = 'inline';
        userName.style.display = 'inline';
        userName.textContent = `欢迎, ${user.username}`;
    } else {
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        profileLink.style.display = 'none';
        userName.style.display = 'none';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化模拟数据
    if (!Storage.get('users')) {
        Storage.set('users', []);
    }
    
    initCarousel();
    renderProducts(getProducts('all'));
    updateCartCount();
    initCategoryFilter();
    initSearch();
    initBackToTop();
    updateUserStatus();
});