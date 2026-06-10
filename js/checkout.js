// ==================== 全局变量 ====================
let selectedAddress = null;
let addresses = [
    { id: 1, name: '张三', phone: '13800138000', address: '北京市朝阳区xxx街道xxx小区xx号楼xxx室', isDefault: true },
    { id: 2, name: '李四', phone: '13900139000', address: '上海市浦东新区xxx路xxx号', isDefault: false }
];

// ==================== 地址管理模块 ====================
/**
 * 渲染收货地址列表
 */
function renderAddresses() {
    const container = document.getElementById('address-options');
    
    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="add-address-btn" onclick="showAddAddressModal()">
                <i class="fas fa-plus"></i>
                <span>添加收货地址</span>
            </div>
        `;
        return;
    }
    
    let html = addresses.map(addr => `
        <div class="address-item ${selectedAddress === addr.id ? 'selected' : ''}" onclick="selectAddress(${addr.id})">
            ${addr.isDefault ? '<span style="background:#ff6b35;color:white;padding:2px 8px;border-radius:4px;font-size:12px;">默认</span>' : ''}
            <div style="margin-top:10px;"><strong>${addr.name}</strong> ${addr.phone}</div>
            <div style="color:#666;font-size:14px;">${addr.address}</div>
        </div>
    `).join('');
    
    html += `
        <div class="add-address-btn" onclick="showAddAddressModal()">
            <i class="fas fa-plus"></i>
            <span>添加收货地址</span>
        </div>
    `;
    
    container.innerHTML = html;
    
    // 默认选中第一个地址或默认地址
    if (!selectedAddress) {
        const defaultAddr = addresses.find(a => a.isDefault);
        selectedAddress = (defaultAddr || addresses[0]).id;
    }
}

/**
 * 选择收货地址
 * @param {number} addressId - 地址ID
 */
function selectAddress(addressId) {
    selectedAddress = addressId;
    document.querySelectorAll('.address-item').forEach(el => el.classList.remove('selected'));
    const index = addresses.findIndex(a => a.id === addressId);
    if (index >= 0) {
        document.querySelectorAll('.address-item')[index]?.classList.add('selected');
    }
}

/**
 * 显示添加地址弹窗
 */
function showAddAddressModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>添加收货地址</h3>
            <form id="add-address-form">
                <div class="form-group">
                    <label>收货人姓名 *</label>
                    <input type="text" id="addr-name" required>
                </div>
                <div class="form-group">
                    <label>手机号码 *</label>
                    <input type="tel" id="addr-phone" required>
                </div>
                <div class="form-group">
                    <label>详细地址 *</label>
                    <textarea id="addr-address" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">取消</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('add-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('addr-name').value;
        const phone = document.getElementById('addr-phone').value;
        const address = document.getElementById('addr-address').value;
        
        // 手机号验证
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        
        // 添加新地址
        addresses.push({ id: Date.now(), name, phone, address, isDefault: false });
        selectedAddress = addresses[addresses.length - 1].id;
        closeModal();
        renderAddresses();
    });
}

/**
 * 关闭弹窗
 */
function closeModal() {
    document.querySelector('.modal-overlay')?.remove();
}

// ==================== 商品渲染模块 ====================
/**
 * 渲染商品清单
 */
function renderProducts() {
    const cart = Cart.getCart();
    const tbody = document.getElementById('product-list-body');
    
    // 检查购物车是否为空
    if (!cart || cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">购物车为空，请先到首页添加商品</td></tr>';
        return;
    }
    
    // 渲染商品列表
    tbody.innerHTML = cart.map(item => {
        // 构建图片路径（相对路径，checkout.html 在 html/ 目录下）
        let imageSrc = '../images/实验1-小兔鲜儿所用图片/goods1.png'; // 默认图片
        if (item.image && item.image.trim()) {
            imageSrc = '../' + item.image;
        }
        
        return `
            <tr>
                <td>
                    <div style="display:flex;gap:15px;">
                        <img 
                            src="${imageSrc}" 
                            alt="${item.name}" 
                            onerror="this.src='../images/实验1-小兔鲜儿所用图片/goods1.png'"
                            style="width:100px;height:100px;object-fit:cover;border-radius:8px;background:#f5f5f5;">
                        <div>
                            <h4 style="margin:0 0 10px;">${item.name}</h4>
                            <p style="color:#999;font-size:14px;margin:0;">${item.description}</p>
                        </div>
                    </div>
                </td>
                <td style="color:#ff6b35;font-weight:bold;vertical-align:top;padding-top:20px;">¥${item.price.toFixed(2)}</td>
                <td style="vertical-align:top;padding-top:20px;">${item.quantity}</td>
                <td style="vertical-align:top;padding-top:20px;">¥${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    }).join('');
    
    // 更新订单摘要
    updateSummary();
}

// ==================== 订单摘要模块 ====================
/**
 * 更新订单摘要信息
 */
function updateSummary() {
    const cart = Cart.getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 99 ? 0 : 10; // 满99免运费
    const total = subtotal + shipping;
    
    document.getElementById('summary-subtotal').textContent = '¥' + subtotal.toFixed(2);
    document.getElementById('summary-shipping').textContent = shipping === 0 ? '免运费' : '¥' + shipping.toFixed(2);
    document.getElementById('summary-total').textContent = '¥' + total.toFixed(2);
}

// ==================== 订单提交模块 ====================
/**
 * 初始化订单提交功能
 */
function initSubmitOrder() {
    const submitBtn = document.getElementById('submit-order');
    if (!submitBtn) return;
    
    submitBtn.addEventListener('click', () => {
        // 验证登录状态
        const user = User.getCurrentUser();
        if (!user) {
            alert('请先登录');
            window.location.href = 'login.html';
            return;
        }
        
        // 验证收货地址
        if (!selectedAddress) {
            alert('请选择收货地址');
            return;
        }
        
        // 验证购物车
        const cart = Cart.getCart();
        if (!cart || cart.length === 0) {
            alert('购物车为空');
            return;
        }
        
        // 获取订单数据
        const address = addresses.find(a => a.id === selectedAddress);
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'alipay';
        
        // 构建订单数据
        const orderData = {
            userId: user.id,
            userName: user.username,
            addressId: selectedAddress,
            addressName: address.name,
            addressPhone: address.phone,
            addressText: address.address,
            paymentMethod: paymentMethod,
            items: cart,
            totalPrice: Cart.getTotalPrice() + (Cart.getTotalPrice() >= 99 ? 0 : 10),
            status: 'pending',
            createTime: new Date().toISOString()
        };
        
        // 创建订单
        const result = Order.createOrder(orderData);
        if (result.success) {
            // 清空购物车
            Cart.clearCart();
            // 跳转到订单详情页
            window.location.href = 'order-detail.html?id=' + result.order.id;
        }
    });
}

// ==================== 用户状态模块 ====================
/**
 * 更新用户登录状态显示
 */
function updateUserStatus() {
    const user = User.getCurrentUser();
    
    // 隐藏/显示相关链接
    document.getElementById('login-link').style.display = user ? 'none' : 'inline';
    document.getElementById('register-link').style.display = user ? 'none' : 'inline';
    document.getElementById('profile-link').style.display = user ? 'inline' : 'none';
    document.getElementById('user-name').style.display = user ? 'inline' : 'none';
    
    // 显示用户名
    if (user) {
        document.getElementById('user-name').textContent = `欢迎, ${user.username}`;
    }
}

/**
 * 更新购物车数量显示
 */
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = Cart.getTotalCount();
    }
}

// ==================== 页面初始化 ====================
/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== 结算页面初始化 ===');
    
    // 检查必要的DOM元素
    const productListBody = document.getElementById('product-list-body');
    const addressOptions = document.getElementById('address-options');
    
    console.log('product-list-body元素:', productListBody);
    console.log('address-options元素:', addressOptions);
    
    // 检查Cart对象是否存在
    console.log('Cart对象:', typeof Cart);
    console.log('购物车数据:', Cart.getCart());
    
    renderAddresses();      // 渲染收货地址
    renderProducts();       // 渲染商品清单
    updateUserStatus();     // 更新用户状态
    updateCartCount();      // 更新购物车数量
    initSubmitOrder();      // 初始化订单提交
});