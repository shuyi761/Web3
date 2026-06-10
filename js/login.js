// 表单验证
function validateForm(type) {
    const errors = [];
    
    if (type === 'login') {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username) {
            errors.push('请输入用户名');
        }
        
        if (!password) {
            errors.push('请输入密码');
        } else if (password.length < 6) {
            errors.push('密码长度不能少于6位');
        }
    } else if (type === 'register') {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const confirmPassword = document.getElementById('reg-confirm-password').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        
        if (!username) {
            errors.push('请输入用户名');
        } else if (username.length < 3) {
            errors.push('用户名长度不能少于3位');
        }
        
        if (!password) {
            errors.push('请输入密码');
        } else if (password.length < 6) {
            errors.push('密码长度不能少于6位');
        }
        
        if (password !== confirmPassword) {
            errors.push('两次输入的密码不一致');
        }
        
        if (!email) {
            errors.push('请输入邮箱');
        } else if (!validateEmail(email)) {
            errors.push('请输入有效的邮箱地址');
        }
        
        if (phone && !validatePhone(phone)) {
            errors.push('请输入有效的手机号码');
        }
    }
    
    return errors;
}

// 显示错误信息
function showErrors(errors) {
    const errorContainer = document.querySelector('.error-messages');
    errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
    errorContainer.style.display = errors.length > 0 ? 'block' : 'none';
}

// 登录功能
function initLogin() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const errors = validateForm('login');
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        const result = User.login(username, password);
        
        if (result.success) {
            showErrors([]);
            alert('登录成功，即将跳转到首页');
            window.location.href = '../index.html';
        } else {
            showErrors([result.message]);
        }
    });
}

// 注册功能
function initRegister() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const errors = validateForm('register');
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        const userData = {
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim()
        };
        
        const result = User.register(userData);
        
        if (result.success) {
            showErrors([]);
            alert('注册成功，即将跳转到登录页');
            document.getElementById('register-tab').click();
        } else {
            showErrors([result.message]);
        }
    });
}

// 切换登录/注册标签
function initTabSwitch() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        showErrors([]);
    });
    
    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        showErrors([]);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化模拟数据
    if (!Storage.get('users')) {
        Storage.set('users', []);
    }
    
    initTabSwitch();
    initLogin();
    initRegister();
});