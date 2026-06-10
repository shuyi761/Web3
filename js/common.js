// 本地存储封装
const Storage = {
    // 获取数据
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    // 存储数据
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    // 清空所有数据
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// 用户管理
const User = {
    // 获取当前用户
    getCurrentUser() {
        return Storage.get('currentUser');
    },

    // 登录
    login(username, password) {
        const users = Storage.get('users') || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            Storage.set('currentUser', user);
            return { success: true, message: '登录成功' };
        }
        return { success: false, message: '用户名或密码错误' };
    },

    // 注册
    register(userData) {
        const users = Storage.get('users') || [];
        const exists = users.find(u => u.username === userData.username || u.email === userData.email);
        if (exists) {
            return { success: false, message: '用户名或邮箱已存在' };
        }
        userData.id = Date.now();
        userData.avatar = '';
        userData.createdAt = new Date().toISOString();
        users.push(userData);
        Storage.set('users', users);
        return { success: true, message: '注册成功' };
    },

    // 登出
    logout() {
        Storage.remove('currentUser');
    },

    // 更新用户信息
    updateUser(userData) {
        const users = Storage.get('users') || [];
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            Storage.set('users', users);
            Storage.set('currentUser', users[index]);
            return { success: true, message: '更新成功' };
        }
        return { success: false, message: '用户不存在' };
    }
};

// 购物车管理
const Cart = {
    // 获取购物车
    getCart() {
        return Storage.get('cart') || [];
    },

    // 添加商品到购物车
    addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        Storage.set('cart', cart);
        return { success: true, message: '添加成功' };
    },

    // 更新购物车商品数量
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                Storage.set('cart', cart);
            }
            return { success: true };
        }
        return { success: false, message: '商品不存在' };
    },

    // 从购物车删除商品
    removeFromCart(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        Storage.set('cart', cart);
        return { success: true };
    },

    // 清空购物车
    clearCart() {
        Storage.set('cart', []);
        return { success: true };
    },

    // 获取购物车总数
    getTotalCount() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },

    // 获取购物车总金额
    getTotalPrice() {
        return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
};

// 订单管理
const Order = {
    // 创建订单
    createOrder(orderData) {
        const orders = Storage.get('orders') || [];
        const order = {
            id: 'ORD' + Date.now(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        orders.push(order);
        Storage.set('orders', orders);
        Cart.clearCart();
        return { success: true, order };
    },

    // 获取订单列表
    getOrders(userId) {
        const orders = Storage.get('orders') || [];
        return userId ? orders.filter(o => o.userId === userId) : orders;
    },

    // 获取单个订单
    getOrder(orderId) {
        const orders = Storage.get('orders') || [];
        return orders.find(o => o.id === orderId);
    },

    // 更新订单状态
    updateStatus(orderId, status) {
        const orders = Storage.get('orders') || [];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            Storage.set('orders', orders);
            return { success: true };
        }
        return { success: false };
    }
};

// 商品数据
const products = [
    // ============ 服装服饰 (clothing) ============
    // 上衣裙装
    { id: 1, name: '时尚连衣裙', price: 299, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes2.png', description: '时尚设计，优雅气质' },
    { id: 2, name: '休闲外套', price: 349, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes3.png', description: '轻便舒适，日常必备' },
    { id: 3, name: '优雅长裙', price: 499, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes5.png', description: '优雅设计，气质出众' },
    { id: 4, name: '女装大牌直降', price: 599, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/hot1.png', description: '女装大牌，限时特惠' },
    { id: 5, name: '春季新款女装', price: 399, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/hot2.png', description: '早春上新，时尚之选' },
    { id: 6, name: '服饰品牌折扣', price: 459, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/hot4.png', description: '品牌折扣，超值优惠' },
    { id: 7, name: '限时特惠服饰', price: 299, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/hot5.png', description: '限时特惠，先到先得' },
    
    // 鞋履
    { id: 8, name: '运动鞋', price: 259, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes1.png', description: '舒适透气，运动必备' },
    
    // 裤装
    { id: 9, name: '休闲长裤', price: 179, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes8.png', description: '舒适面料，百搭款式' },
    
    // 配饰小件
    { id: 10, name: '精美袜子', price: 39, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes4.png', description: '纯棉材质，舒适透气' },
    { id: 11, name: '时尚皮带', price: 129, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes6.png', description: '优质材质，时尚百搭' },
    { id: 12, name: '精美发饰', price: 29, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/home4.png', description: '精美发饰，点缀美丽' },
    { id: 13, name: '男装外套', price: 459, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/hot3.png', description: '品牌折扣，限时特惠' },
    { id: 14, name: '女装上衣', price: 199, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/clothes7.png', description: '时尚女装，优雅大方' },
    { id: 15, name: '女装套装', price: 399, category: 'clothing', image: 'images/实验1-小兔鲜儿所用图片/colthes_left.png', description: '时尚套装，气质优雅' },
    
    // ============ 生鲜食品 (fresh) ============
    // 烘焙面点甜品
    { id: 16, name: '手抓饼', price: 28, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh1.png', description: '方便快捷，美味早餐' },
    { id: 17, name: '红糖馒头', price: 18, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh2.png', description: '香甜可口，营养健康' },
    { id: 18, name: '奶油小蛋糕', price: 38, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh3.png', description: '细腻口感，甜蜜享受' },
    { id: 19, name: '新鲜面包', price: 25, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh4.png', description: '新鲜出炉，香气扑鼻' },
    { id: 20, name: '麻薯', price: 22, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh5.png', description: '软糯Q弹，回味无穷' },
    { id: 21, name: '蜂蜜罐头', price: 48, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh6.png', description: '天然蜂蜜，营养丰富' },
    { id: 22, name: '巧克力礼盒', price: 88, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh7.png', description: '精选巧克力，送礼佳品' },
    { id: 23, name: '抹茶蛋糕', price: 58, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh8.png', description: '清新抹茶，口感细腻' },
    { id: 24, name: '板栗', price: 45, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh_left.png', description: '精选板栗，营养健康' },
    { id: 25, name: '白酒', price: 198, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/fresh_goods_cover.png', description: '优质白酒，宴请佳品' },
    { id: 26, name: '香辣贝类', price: 88, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/topic1.png', description: '香辣可口，回味无穷' },
    { id: 27, name: '橙子', price: 25, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/topic2.png', description: '新鲜多汁，维C丰富' },
    { id: 28, name: '食用油', price: 58, category: 'fresh', image: 'images/实验1-小兔鲜儿所用图片/recommend3.png', description: '粮油团购，企业优选' },
    
    // ============ 家居用品 (home) ============
    // 家纺寝具
    { id: 40, name: '床品四件套', price: 399, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home1.png', description: '纯棉面料，舒适睡眠' },
    { id: 41, name: '凉席枕头', price: 159, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home8.png', description: '清凉舒适，夏日必备' },
    
    // 绿植花艺
    { id: 42, name: '水培绿植', price: 45, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home3.png', description: '清新空气，美化家居' },
    { id: 43, name: '黄玫瑰鲜花', price: 99, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home5.png', description: '浪漫花语，表达爱意' },
    { id: 44, name: '室内盆栽', price: 68, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home7.png', description: '绿色植物，净化空气' },
    { id: 45, name: '鲜花花束', price: 128, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/recommend4.png', description: '鲜花低价，限时特惠' },
    
    // 家居软装家具
    { id: 46, name: '实木收纳盒', price: 79, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/goods2.png', description: '优质实木，收纳整理' },
    { id: 47, name: '布艺沙发', price: 1299, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/goods4.png', description: '舒适布艺，品质生活' },
    { id: 48, name: '折叠置物桌', price: 129, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home6.png', description: '简约设计，实用便捷' },
    { id: 49, name: '卧室家具', price: 2999, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home_left.png', description: '成套家具，温馨卧室' },
    
    // 毛绒摆件饰品
    { id: 50, name: '恐龙毛绒玩偶', price: 89, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/home2.png', description: '可爱造型，孩子最爱' },
    
    // ============ 厨房用具 (kitchen) ============
    { id: 51, name: '禅意陶瓷摆件', price: 129, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen1.png', description: '精美陶瓷，提升格调' },
    { id: 52, name: '玻璃果盘', price: 59, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen2.png', description: '透明玻璃，美观实用' },
    { id: 53, name: '手持搅拌器', price: 199, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen3.png', description: '方便快捷，厨房好帮手' },
    { id: 54, name: '保温水壶', price: 89, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen4.png', description: '长效保温，随时热饮' },
    { id: 55, name: '陶瓷餐盘套装', price: 159, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen5.png', description: '精美陶瓷，送礼首选' },
    { id: 56, name: '陶瓷方盘', price: 45, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen7.png', description: '简约设计，实用美观' },
    { id: 57, name: '便携随行杯', price: 59, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen8.png', description: '便携设计，出行必备' },
    { id: 58, name: '厨房整体橱柜', price: 5999, category: 'home', image: 'images/实验1-小兔鲜儿所用图片/kitchen_left.png', description: '整体定制，品质厨房' },
    
    // ============ 电子产品 (electronics) ============
    // 数码设备
    { id: 59, name: '数码套装', price: 2999, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/recommend2.png', description: '手机相机平板耳机套装' },
    { id: 60, name: '石英腕表', price: 1599, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/new_goods_4.jpg', description: '精致工艺，品质之选' },
    
    // 大小家电
    { id: 61, name: '手持清洁吸尘器', price: 1299, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/new_goods_1.jpg', description: '手持设计，清洁无忧' },
    { id: 62, name: '嵌入式冰箱烤箱', price: 9999, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/new_goods_2.jpg', description: '一体厨电，高端配置' },
    
    // 图书文具
    { id: 63, name: '蒙特梭利童书', price: 88, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/recommend1.png', description: '启蒙教育，亲子共读' },
    { id: 64, name: '精装笔记本', price: 29, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/goods3.png', description: '精美装帧，书写流畅' },
    
    // 防护日用品
    { id: 65, name: 'KN95口罩', price: 35, category: 'electronics', image: 'images/实验1-小兔鲜儿所用图片/goods1.png', description: '防护必备，安心出行' }
];

// 获取商品列表
function getProducts(category = 'all') {
    if (category === 'all') {
        return products;
    }
    return products.filter(p => p.category === category);
}

// 搜索商品
function searchProducts(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerKeyword) || 
        p.description.toLowerCase().includes(lowerKeyword)
    );
}

// 获取商品详情
function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

// 格式化价格
function formatPrice(price) {
    return '¥' + price.toFixed(2);
}

// 验证邮箱
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 验证手机号
function validatePhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        User,
        Cart,
        Order,
        getProducts,
        searchProducts,
        getProductById,
        formatPrice,
        validateEmail,
        validatePhone
    };
}