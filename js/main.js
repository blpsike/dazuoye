// ==================== 电商网站核心JavaScript功能 ====================

/**
 * 电商应用主类
 * 负责管理购物车、商品数据、页面渲染和用户交互
 */
class EcommerceApp {
    /**
     * 构造函数 - 初始化应用
     * 从 localStorage 恢复购物车数据，加载商品，绑定事件
     */
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];  // 从本地存储恢复购物车数据
        this.products = [];                                           // 商品列表
        this.init();                                                  // 执行初始化
    }

    /**
     * 初始化方法
     * 加载商品数据 → 绑定事件 → 更新购物车数量
     */
    init() {
        this.loadProducts();      // 加载商品数据
        this.bindEvents();        // 绑定所有事件监听器
        this.updateCartCount();   // 更新购物车角标数字
    }

    // ==================== 商品数据 ====================

    /**
     * 获取默认商品数据（备用的硬编码数据）
     * 当网络请求失败时使用，确保页面正常显示
     * @returns {Array} 商品对象数组
     */
    getDefaultProducts() {
        return [
            { id: "1", name: "特惠推荐", price: 99, originalPrice: 199, rating: 4.8, sold: 1234, description: "精选特惠商品，限时抢购", image: "img/goods.jpg" },
            { id: "2", name: "爆款好物", price: 199, originalPrice: 399, rating: 4.9, sold: 2345, description: "人气爆款，品质保证", image: "img/recommend1.png" },
            { id: "3", name: "节日礼品", price: 299, originalPrice: 599, rating: 4.7, sold: 987, description: "精美礼品，送礼佳选", image: "img/recommend2.png" },
            { id: "4", name: "鲜花园艺", price: 399, originalPrice: 699, rating: 4.6, sold: 765, description: "鲜花绿植，美化生活", image: "img/recommend3.png" },
            { id: "5", name: "精选商品", price: 499, originalPrice: 899, rating: 4.9, sold: 1543, description: "精选好物，品质生活", image: "img/recommend4.png" },
            { id: "6", name: "品质家电", price: 899, originalPrice: 1299, rating: 4.8, sold: 432, description: "智能家电，便捷生活", image: "img/home5.png" },
            { id: "7", name: "潮流服饰", price: 129, originalPrice: 299, rating: 4.7, sold: 876, description: "时尚穿搭，潮流之选", image: "img/home6.png" },
            { id: "8", name: "美妆个护", price: 89, originalPrice: 199, rating: 4.8, sold: 2341, description: "美妆护肤，焕发光彩", image: "img/home7.png" },
            { id: "9", name: "数码尖货", price: 599, originalPrice: 999, rating: 4.9, sold: 654, description: "数码产品，科技前沿", image: "img/home8.png" },
            { id: "10", name: "扫码下载", price: 0, originalPrice: 0, rating: 5, sold: 9999, description: "扫描二维码下载APP", image: "img/qrcode.png" }
        ];
    }

    /**
     * 异步加载商品数据
     * 优先从 data/products.json 获取，失败则使用默认数据
     * 根据当前页面路径决定渲染哪个页面
     */
    async loadProducts() {
        try {
            // 尝试从 JSON 文件加载商品数据
            const response = await fetch('data/products.json');
            if (response.ok) {
                this.products = await response.json();  // 请求成功，使用远程数据
            } else {
                this.products = this.getDefaultProducts();  // 请求失败，使用默认数据
            }
        } catch (error) {
            // 网络错误或其他异常，使用默认数据
            console.error('加载商品数据失败，使用默认数据:', error);
            this.products = this.getDefaultProducts();
        }
        
        // ===== 根据页面路径渲染对应内容 =====
        
        // 如果在商品详情页（detail.html），渲染商品详情
        if (window.location.pathname.includes('detail.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');  // 从 URL 获取商品 ID
            if (productId) {
                this.renderProductDetail(productId);
            }
        }
        
        // 如果在购物车页（cart.html），渲染购物车列表
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartItems();
        }
        
        // 如果在结算页（checkout.html），渲染订单摘要
        if (window.location.pathname.includes('checkout.html')) {
            this.renderCheckoutItems();
        }
    }

    // ==================== 事件绑定 ====================

    /**
     * 绑定所有页面事件监听器
     * 包括：登录、注册、购物车、结算、数量选择等
     */
    bindEvents() {
        // ----- 登录表单提交 -----
        if (document.getElementById('loginForm')) {
            document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        }

        // ----- 注册表单提交 -----
        if (document.getElementById('registerForm')) {
            document.getElementById('registerForm').addEventListener('submit', this.handleRegister.bind(this));
        }

        // ----- 商品详情页：加入购物车按钮 -----
        if (document.getElementById('add-to-cart')) {
            document.getElementById('add-to-cart').addEventListener('click', this.addToCart.bind(this));
        }

        // ----- 商品详情页：立即购买按钮 -----
        if (document.getElementById('buy-now')) {
            document.getElementById('buy-now').addEventListener('click', this.buyNow.bind(this));
        }

        // ----- 购物车页：结算按钮 -----
        if (document.getElementById('checkout-btn')) {
            document.getElementById('checkout-btn').addEventListener('click', () => {
                // 检查购物车是否为空
                if (this.cart.length === 0) {
                    alert('购物车为空，无法结算');
                    return;
                }
                // 跳转到结算页面
                window.location.href = 'checkout.html';
            });
        }

        // ----- 商品详情页：数量减少按钮 -----
        if (document.getElementById('decrease-qty')) {
            document.getElementById('decrease-qty').addEventListener('click', this.decreaseQuantity.bind(this));
        }
        
        // ----- 商品详情页：数量增加按钮 -----
        if (document.getElementById('increase-qty')) {
            document.getElementById('increase-qty').addEventListener('click', this.increaseQuantity.bind(this));
        }

        // ----- 结算页：提交订单表单 -----
        if (document.getElementById('checkout-form')) {
            document.getElementById('checkout-form').addEventListener('submit', this.handleCheckout.bind(this));
        }
    }

    // ==================== 用户认证功能 ====================

    /**
     * 处理登录表单提交
     * 验证邮箱和密码，保存登录状态，跳转到首页
     */
    handleLogin(e) {
        e.preventDefault();  // 阻止表单默认提交行为
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // 验证邮箱和密码是否为空
        if (!email || !password) {
            alert('请输入邮箱和密码');
            return;
        }
        
        // 保存登录状态到 localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ email, name: email.split('@')[0] }));
        
        alert('登录成功！');
        window.location.href = 'index.html';  // 跳转到首页
    }

    /**
     * 处理注册表单提交
     * 验证用户名、邮箱、密码一致性，保存用户信息，自动登录
     */
    handleRegister(e) {
        e.preventDefault();  // 阻止表单默认提交行为
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // 验证必填字段
        if (!username || !email || !password) {
            alert('请填写完整信息');
            return;
        }
        
        // 验证两次密码是否一致
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        // 保存登录状态
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ email, name: username }));
        
        alert('注册成功！');
        window.location.href = 'index.html';  // 跳转到首页
    }

    // ==================== 购物车核心功能 ====================

    /**
     * 将商品添加到购物车（商品详情页使用）
     * 如果商品已存在，增加数量；否则新增商品
     */
    addToCart(e) {
        // 获取商品ID（从 data-* 属性或 URL 参数）
        const productId = e.target.dataset.productId || this.getCurrentProductId();
        const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
        
        // 检查购物车中是否已有该商品
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            // 已存在 → 增加数量
            existingItem.quantity += quantity;
        } else {
            // 不存在 → 查找商品数据并添加到购物车
            const product = this.products.find(p => p.id == productId);
            if (product) {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
        }
        
        this.saveCart();         // 保存到本地存储
        this.updateCartCount();  // 更新角标数字
        alert('商品已添加到购物车！');  // 提示用户
    }

    /**
     * 立即购买（商品详情页使用）
     * 清空购物车，只放入当前商品，跳转到结算页
     */
    buyNow() {
        const productId = this.getCurrentProductId();
        const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
        
        const product = this.products.find(p => p.id == productId);
        if (product) {
            // 清空购物车，只放入当前商品
            this.cart = [{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            }];
            this.saveCart();
            window.location.href = 'checkout.html';  // 跳转到结算页
        }
    }

    /**
     * 获取当前页面的商品ID（从 URL 参数中读取）
     * @returns {string|null} 商品ID或null
     */
    getCurrentProductId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // ==================== 数量控制 ====================

    /**
     * 减少商品数量（商品详情页）
     * 最小值为1
     */
    decreaseQuantity() {
        const qtyInput = document.getElementById('quantity');
        let currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;  // 数量减1
        }
    }

    /**
     * 增加商品数量（商品详情页）
     */
    increaseQuantity() {
        const qtyInput = document.getElementById('quantity');
        let currentQty = parseInt(qtyInput.value);
        qtyInput.value = currentQty + 1;  // 数量加1
    }

    // ==================== 本地存储操作 ====================

    /**
     * 保存购物车数据到 localStorage
     */
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    /**
     * 更新购物车角标数字（所有 .cart-count 元素）
     * 计算所有商品数量的总和
     */
    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = count;  // 更新显示数字
        });
    }

    // ==================== 结算功能 ====================

    /**
     * 处理结算表单提交
     * 验证收货信息，创建订单，清空购物车，保存订单
     */
    handleCheckout(e) {
        e.preventDefault();  // 阻止表单默认提交
        
        // 检查购物车是否为空
        if (this.cart.length === 0) {
            alert('购物车为空，无法结算');
            return;
        }

        // 获取收货信息
        const receiverName = document.getElementById('receiver-name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;

        // 验证收货信息是否完整
        if (!receiverName || !address || !phone) {
            alert('请填写完整的收货信息');
            return;
        }

        // 创建订单对象
        const order = {
            id: Date.now(),  // 使用时间戳作为订单号
            items: [...this.cart],  // 复制购物车商品列表
            total: this.calculateTotal(),  // 计算总价
            receiverName,
            address,
            phone,
            paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'alipay',
            date: new Date().toISOString()  // 订单创建时间
        };

        // 清空购物车
        this.cart = [];
        this.saveCart();
        this.updateCartCount();

        // 保存订单到 localStorage
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        alert('订单提交成功！我们会尽快为您发货。');
        window.location.href = 'index.html';  // 返回首页
    }

    /**
     * 计算购物车总价
     * @returns {number} 总价
     */
    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // ==================== 页面渲染功能 ====================

    /**
     * 渲染购物车商品列表（购物车页面）
     * 显示商品图片、名称、价格、数量控制、删除按钮
     */
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;  // 页面不存在则退出

        // 购物车为空时的提示
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center;padding:40px;">购物车是空的，去<a href="index.html">逛逛</a>吧~</p>';
            document.getElementById('cart-total').textContent = '0.00';
            return;
        }

        let cartHTML = '';
        let total = 0;

        // 遍历购物车生成 HTML
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;">
                    <div class="item-details" style="flex:1;padding:0 15px;">
                        <h3>${item.name}</h3>
                        <p class="price" style="color:#1677ff;font-weight:bold;">¥${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="app.updateCartItem(${index}, ${item.quantity - 1})">-</button>
                            <span class="quantity" style="margin:0 10px;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="app.updateCartItem(${index}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="app.removeItemFromCart(${index})" style="margin-top:8px;">删除</button>
                    </div>
                    <div class="item-total" style="font-weight:bold;">¥${itemTotal.toFixed(2)}</div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        document.getElementById('cart-total').textContent = total.toFixed(2);
    }

    /**
     * 渲染结算页订单商品摘要
     * 显示商品名称、数量、小计
     */
    renderCheckoutItems() {
        const orderItemsContainer = document.getElementById('order-items');
        if (!orderItemsContainer) return;

        // 购物车为空时的提示
        if (this.cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>购物车为空，无法结算</p>';
            document.getElementById('order-total').textContent = '0.00';
            return;
        }

        let itemsHTML = '';
        let total = 0;

        // 遍历购物车生成摘要 HTML
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsHTML += `
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>¥${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });

        orderItemsContainer.innerHTML = itemsHTML;
        document.getElementById('order-total').textContent = total.toFixed(2);
    }

    // ==================== 购物车管理工具 ====================

    /**
     * 更新购物车中指定商品的数量
     * @param {number} index - 商品在购物车数组中的索引
     * @param {number} newQuantity - 新数量
     */
    updateCartItem(index, newQuantity) {
        if (newQuantity <= 0) {
            // 数量为0或负数 → 删除商品
            this.removeItemFromCart(index);
            return;
        }
        this.cart[index].quantity = newQuantity;  // 更新数量
        this.saveCart();           // 保存到本地
        this.renderCartItems();    // 重新渲染购物车
        this.updateCartCount();    // 更新角标
    }

    /**
     * 从购物车移除商品
     * @param {number} index - 商品在购物车数组中的索引
     */
    removeItemFromCart(index) {
        this.cart.splice(index, 1);  // 从数组中删除
        this.saveCart();             // 保存到本地
        this.renderCartItems();      // 重新渲染购物车
        this.updateCartCount();      // 更新角标
    }

    /**
     * 渲染商品详情页
     * 显示商品图片、名称、价格、描述、评分、销量
     * @param {string} productId - 商品ID
     */
    renderProductDetail(productId) {
        const product = this.products.find(p => p.id == productId);
        if (!product) {
            console.error('未找到商品');
            document.getElementById('product-title').textContent = '商品不存在';
            return;
        }

        // 设置商品图片
        if (document.getElementById('main-product-image')) {
            document.getElementById('main-product-image').src = product.image;
        }
        // 设置商品标题
        if (document.getElementById('product-title')) {
            document.getElementById('product-title').textContent = product.name;
        }
        // 设置当前价格
        if (document.getElementById('product-price')) {
            document.getElementById('product-price').textContent = product.price.toFixed(2);
        }
        // 设置原价（如果没有原价，显示当前价格）
        if (document.getElementById('product-original-price')) {
            document.getElementById('product-original-price').textContent = product.originalPrice ? product.originalPrice.toFixed(2) : product.price.toFixed(2);
        }
        // 设置商品描述
        if (document.getElementById('product-description-text')) {
            document.getElementById('product-description-text').textContent = product.description;
        }
        // 设置评分
        if (document.getElementById('product-rating')) {
            document.getElementById('product-rating').textContent = product.rating;
        }
        // 设置销量
        if (document.getElementById('product-sold')) {
            document.getElementById('product-sold').textContent = product.sold;
        }
        
        // 为"加入购物车"按钮设置商品ID（用于添加时识别）
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.dataset.productId = product.id;
        }
    }
}

// ==================== 应用初始化 ====================

let app;  // 全局变量，便于其他函数调用

/**
 * 页面加载完成后初始化应用
 * 使用 DOMContentLoaded 事件确保 DOM 已完全加载
 */
document.addEventListener('DOMContentLoaded', () => {
    app = new EcommerceApp();
});