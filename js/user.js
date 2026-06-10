// 渲染用户信息
function renderUserInfo(user) {
    const notLogin = document.getElementById('not-login');
    const loggedIn = document.getElementById('logged-in');
    const userNameDisplay = document.getElementById('user-name-display');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    
    if (!user) {
        notLogin.style.display = 'block';
        loggedIn.style.display = 'none';
        return;
    }
    
    notLogin.style.display = 'none';
    loggedIn.style.display = 'block';
    
    userNameDisplay.textContent = user.username;
    userEmail.textContent = user.email || '未设置邮箱';
    userPhone.textContent = user.phone || '未设置手机号';
}

// 渲染订单列表
function renderOrders(user) {
    const ordersList = document.getElementById('orders-list');
    
    if (!user) {
        ordersList.innerHTML = '<p class="no-orders">请登录后查看订单</p>';
        return;
    }
    
    const orders = Order.getOrders(user.id);
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">订单号：${order.id}</span>
                <span class="order-status">${getStatusText(order.status)}</span>
            </div>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="../${item.image}" alt="${item.name}">
                        <div class="order-item-info">
                            <p>${item.name}</p>
                            <p>¥${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                合计：¥${order.totalPrice.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        pending: '待付款',
        paid: '已付款',
        shipped: '已发货',
        delivered: '已送达',
        completed: '已完成'
    };
    return statusMap[status] || status;
}

// 初始化事件
function initEvents() {
    // 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                User.logout();
                window.location.reload();
            }
        });
    }
    
    // 收货地址
    const navAddress = document.getElementById('nav-address');
    if (navAddress) {
        navAddress.addEventListener('click', () => {
            showAddressModal();
        });
    }
    
    // 账户设置
    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
        navSettings.addEventListener('click', () => {
            showSettingsModal();
        });
    }
}

// 收货地址数据
let addressList = [
    { id: 1, name: '张三', phone: '13800138000', address: '北京市朝阳区xxx街道xxx小区xx号楼xxx室' },
    { id: 2, name: '李四', phone: '13900139000', address: '上海市浦东新区xxx路xxx号' }
];

// 显示收货地址弹窗
function showAddressModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="width:600px;">
            <div class="modal-header">
                <h3>收货地址</h3>
                <button class="modal-close" style="font-size:24px;cursor:pointer;border:none;background:none;">&times;</button>
            </div>
            <div class="modal-body">
                <div class="address-list" id="address-list">
                    ${renderAddressList()}
                </div>
                <button class="add-address-btn" style="margin-top:20px;padding:10px 20px;background:#ff6b35;color:white;border:none;border-radius:4px;cursor:pointer;">+ 添加新地址</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 关闭弹窗
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 添加新地址
    modal.querySelector('.add-address-btn').addEventListener('click', () => {
        showAddAddressForm(modal);
    });
    
    // 编辑地址
    modal.querySelectorAll('.edit-address').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            showEditAddressForm(modal, id);
        });
    });
    
    // 删除地址
    modal.querySelectorAll('.delete-address').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('确定删除此地址？')) {
                addressList = addressList.filter(a => a.id !== id);
                document.getElementById('address-list').innerHTML = renderAddressList();
                bindAddressEvents(modal);
            }
        });
    });
}

// 渲染地址列表
function renderAddressList() {
    if (addressList.length === 0) {
        return '<p style="text-align:center;color:#999;">暂无地址</p>';
    }
    return addressList.map(item => `
        <div class="address-item" style="border:1px solid #ddd;padding:15px;margin-bottom:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:flex-start;">
            <div class="address-info">
                <p style="font-weight:bold;margin:0;">${item.name} ${item.phone}</p>
                <p style="color:#666;margin:5px 0 0;">${item.address}</p>
            </div>
            <div class="address-actions" style="display:flex;gap:10px;">
                <button class="edit-address" data-id="${item.id}" style="padding:5px 10px;border:none;background:#f0f0f0;border-radius:4px;cursor:pointer;">编辑</button>
                <button class="delete-address" data-id="${item.id}" style="padding:5px 10px;border:none;background:#ff4444;color:white;border-radius:4px;cursor:pointer;">删除</button>
            </div>
        </div>
    `).join('');
}

// 绑定地址事件
function bindAddressEvents(modal) {
    modal.querySelectorAll('.edit-address').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            showEditAddressForm(modal, id);
        });
    });
    
    modal.querySelectorAll('.delete-address').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('确定删除此地址？')) {
                addressList = addressList.filter(a => a.id !== id);
                document.getElementById('address-list').innerHTML = renderAddressList();
                bindAddressEvents(modal);
            }
        });
    });
}

// 显示添加地址表单
function showAddAddressForm(modal) {
    modal.querySelector('.modal-body').innerHTML = `
        <h4 style="margin-top:0;">添加新地址</h4>
        <form id="add-address-form">
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">收货人姓名</label>
                <input type="text" id="add-name" required style="width:100%;padding:8px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">手机号码</label>
                <input type="tel" id="add-phone" required style="width:100%;padding:8px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">详细地址</label>
                <textarea id="add-address" required style="width:100%;padding:8px;box-sizing:border-box;height:80px;"></textarea>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" class="cancel-btn" style="padding:8px 16px;border:none;background:#f0f0f0;border-radius:4px;cursor:pointer;">取消</button>
                <button type="submit" style="padding:8px 16px;border:none;background:#ff6b35;color:white;border-radius:4px;cursor:pointer;">保存</button>
            </div>
        </form>
    `;
    
    document.getElementById('add-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('add-name').value;
        const phone = document.getElementById('add-phone').value;
        const address = document.getElementById('add-address').value;
        
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        
        addressList.push({ id: Date.now(), name, phone, address });
        showAddressModal();
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        showAddressModal();
    });
}

// 显示编辑地址表单
function showEditAddressForm(modal, addressId) {
    const addr = addressList.find(a => a.id === addressId);
    if (!addr) return;
    
    modal.querySelector('.modal-body').innerHTML = `
        <h4 style="margin-top:0;">编辑地址</h4>
        <form id="edit-address-form">
            <input type="hidden" id="edit-id" value="${addr.id}">
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">收货人姓名</label>
                <input type="text" id="edit-name" required value="${addr.name}" style="width:100%;padding:8px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">手机号码</label>
                <input type="tel" id="edit-phone" required value="${addr.phone}" style="width:100%;padding:8px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;">详细地址</label>
                <textarea id="edit-address" required style="width:100%;padding:8px;box-sizing:border-box;height:80px;">${addr.address}</textarea>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" class="cancel-btn" style="padding:8px 16px;border:none;background:#f0f0f0;border-radius:4px;cursor:pointer;">取消</button>
                <button type="submit" style="padding:8px 16px;border:none;background:#ff6b35;color:white;border-radius:4px;cursor:pointer;">保存</button>
            </div>
        </form>
    `;
    
    document.getElementById('edit-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-id').value);
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;
        const address = document.getElementById('edit-address').value;
        
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        
        const index = addressList.findIndex(a => a.id === id);
        if (index !== -1) {
            addressList[index] = { id, name, phone, address };
        }
        showAddressModal();
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        showAddressModal();
    });
}

// 显示账户设置弹窗
function showSettingsModal() {
    const user = User.getCurrentUser();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>账户设置</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="settings-form">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" id="settings-username" value="${user.username || ''}">
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input type="email" id="settings-email" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>手机号</label>
                        <input type="tel" id="settings-phone" value="${user.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label>新密码</label>
                        <input type="password" id="settings-password" placeholder="不修改请留空">
                    </div>
                    <div class="form-group">
                        <label>确认密码</label>
                        <input type="password" id="settings-password-confirm" placeholder="不修改请留空">
                    </div>
                    <button type="submit" class="save-settings-btn">保存设置</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 关闭弹窗
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 保存设置
    modal.querySelector('#settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            id: user.id,
            username: document.getElementById('settings-username').value,
            email: document.getElementById('settings-email').value,
            phone: document.getElementById('settings-phone').value
        };
        const password = document.getElementById('settings-password').value;
        const confirmPassword = document.getElementById('settings-password-confirm').value;
        
        if (password) {
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            formData.password = password;
        }
        
        const result = User.updateUser(formData);
        if (result.success) {
            alert('设置更新成功');
            window.location.reload();
        } else {
            alert('更新失败');
        }
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

// 更新购物车数量显示
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = Cart.getTotalCount();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const user = User.getCurrentUser();
    renderUserInfo(user);
    renderOrders(user);
    initEvents();
    updateUserStatus();
    updateCartCount();
});