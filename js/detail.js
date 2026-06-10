// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 渲染商品详情
function renderProductDetail(product) {
    const detailContent = document.getElementById('detail-content');
    
    if (!product) {
        detailContent.innerHTML = '<p style="text-align: center; padding: 50px;">商品不存在</p>';
        return;
    }
    
    detailContent.innerHTML = `
        <div class="detail-container">
            <div class="product-images">
                <img class="main-image" src="../${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1 class="product-name">${product.name}</h1>
                <p class="product-desc">商品介绍：${product.description}</p>
                <p class="product-price">¥${product.price.toFixed(2)}</p>
                <p class="product-category">分类：${getCategoryName(product.category)}</p>
                
                <div class="quantity-control">
                    <span>数量：</span>
                    <button id="decrease-quantity">-</button>
                    <input type="number" id="quantity" value="1" min="1">
                    <button id="increase-quantity">+</button>
                </div>
                
                <div class="action-buttons">
                    <button class="btn-add-cart" id="add-to-cart">加入购物车</button>
                    <button class="btn-buy-now" id="buy-now">立即购买</button>
                </div>
            </div>
        </div>
        <div class="product-description">
            <h3>商品详情</h3>
            <p>${product.description}</p>
            <p>品质保证，欢迎选购！</p>
        </div>
    `;
    
    // 添加事件监听
    initDetailEvents(product);
}

// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        electronics: '电子产品',
        clothing: '服装服饰',
        books: '图书文具',
        home: '家居用品'
    };
    return categoryMap[category] || category;
}

// 初始化事件
function initDetailEvents(product) {
    // 数量增减
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    
    decreaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
    });
    
    // 加入购物车
    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        Cart.addToCart(product, quantity);
        updateCartCount();
        showToast(`已添加${quantity}件商品到购物车`);
    });
    
    // 立即购买
    const buyNowBtn = document.getElementById('buy-now');
    buyNowBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        Cart.addToCart(product, quantity);
        window.location.href = 'cart.html';
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
    const productId = getUrlParam('id');
    const product = getProductById(productId);
    renderProductDetail(product);
    updateCartCount();
    updateUserStatus();
});