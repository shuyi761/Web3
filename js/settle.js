// 渲染订单商品
function renderOrderItems() {
    const orderItems = document.getElementById('order-items');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const total = document.getElementById('total');
    
    const cart = Cart.getCart();
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">购物车为空</td></tr>';
        subtotal.textContent = '¥0.00';
        shipping.textContent = '¥0.00';
        total.textContent = '¥0.00';
        return;
    }
    
    orderItems.innerHTML = cart.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
            <td>${item.name}</td>
            <td>¥${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>¥${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    const cartTotal = Cart.getTotalPrice();
    const shippingFee = cartTotal >= 99 ? 0 : 10;
    const finalTotal = cartTotal + shippingFee;
    
    subtotal.textContent = '¥' + cartTotal.toFixed(2);
    shipping.textContent = shippingFee === 0 ? '免运费' : '¥' + shippingFee.toFixed(2);
    total.textContent = '¥' + finalTotal.toFixed(2);
}

// 提交订单
function initSubmitOrder() {
    const submitBtn = document.getElementById('submit-order');
    
    submitBtn.addEventListener('click', () => {
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
        
        const shippingFee = Cart.getTotalPrice() >= 99 ? 0 : 10;
        const finalTotal = Cart.getTotalPrice() + shippingFee;
        
        const orderData = {
            userId: user.id,
            items: cart,
            totalPrice: finalTotal,
            address: '北京市朝阳区xxx街道xxx小区1号楼101室',
            paymentMethod: document.querySelector('input[name="payment"]:checked').value
        };
        
        const result = Order.createOrder(orderData);
        
        if (result.success) {
            alert(`订单提交成功！\n订单号：${result.order.id}\n应付金额：¥${finalTotal.toFixed(2)}`);
            window.location.href = 'user.html';
        } else {
            alert('订单提交失败');
        }
    });
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
    renderOrderItems();
    updateCartCount();
    initSubmitOrder();
});