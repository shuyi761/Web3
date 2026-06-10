// 渲染购物车
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const cart = Cart.getCart();
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<tr><td colspan="6" class="empty-cart">购物车为空</td></tr>';
        cartTotal.textContent = '¥0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <tr data-id="${item.id}">
            <td><input type="checkbox" class="select-item" checked></td>
            <td><img src="../${item.image}" alt="${item.name}" class="cart-product-image"></td>
            <td>${item.name}</td>
            <td>¥${item.price.toFixed(2)}</td>
            <td>
                <button class="quantity-btn" data-action="decrease">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                <button class="quantity-btn" data-action="increase">+</button>
            </td>
            <td>¥${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="remove-btn" data-id="${item.id}">删除</button></td>
        </tr>
    `).join('');
    
    cartTotal.textContent = '¥' + Cart.getTotalPrice().toFixed(2);
    checkoutBtn.disabled = false;
    
    // 添加事件监听
    initCartEvents();
}

// 初始化购物车事件
function initCartEvents() {
    // 数量增减
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const productId = parseInt(row.dataset.id);
            const input = row.querySelector('.quantity-input');
            const currentQuantity = parseInt(input.value);
            const action = btn.dataset.action;
            
            let newQuantity = currentQuantity;
            if (action === 'increase') {
                newQuantity++;
            } else if (action === 'decrease' && currentQuantity > 1) {
                newQuantity--;
            }
            
            if (newQuantity !== currentQuantity) {
                Cart.updateQuantity(productId, newQuantity);
                input.value = newQuantity;
                updateRowTotal(row);
                updateCartTotal();
            }
        });
    });
    
    // 数量输入
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', () => {
            const row = input.closest('tr');
            const productId = parseInt(row.dataset.id);
            let quantity = parseInt(input.value) || 1;
            
            if (quantity < 1) quantity = 1;
            input.value = quantity;
            
            Cart.updateQuantity(productId, quantity);
            updateRowTotal(row);
            updateCartTotal();
        });
    });
    
    // 删除商品
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            if (confirm('确定要删除该商品吗？')) {
                Cart.removeFromCart(productId);
                renderCart();
                updateCartCount();
            }
        });
    });
    
    // 全选功能
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            document.querySelectorAll('.select-item').forEach(item => {
                item.checked = e.target.checked;
            });
        });
    }
}

// 更新行小计
function updateRowTotal(row) {
    const price = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('¥', ''));
    const quantity = parseInt(row.querySelector('.quantity-input').value);
    const total = price * quantity;
    row.querySelector('td:nth-child(6)').textContent = '¥' + total.toFixed(2);
}

// 更新购物车总价
function updateCartTotal() {
    const cartTotal = document.getElementById('cart-total');
    cartTotal.textContent = '¥' + Cart.getTotalPrice().toFixed(2);
}

// 更新购物车数量显示
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = Cart.getTotalCount();
    }
}

// 结算功能
function initCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    checkoutBtn.addEventListener('click', () => {
        const user = User.getCurrentUser();
        
        if (!user) {
            alert('请先登录');
            window.location.href = 'login.html';
            return;
        }
        
        const cart = Cart.getCart();
        if (cart.length === 0) {
            alert('购物车为空');
            return;
        }
        
        // 先跳转到结算页面，在结算页面创建订单
        window.location.href = 'settle.html';
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
    renderCart();
    updateCartCount();
    updateUserStatus();
    initCheckout();
});