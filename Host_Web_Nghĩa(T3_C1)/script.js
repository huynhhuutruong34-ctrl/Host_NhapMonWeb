const cartCount = document.getElementById('cartCount');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const cartBtn = document.getElementById('cartBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const categoryButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
let selectedType = 'all';

const CART_STORAGE_KEY = 'shopCart';
const USER_STORAGE_KEY = 'shopUsers';
const SESSION_USER_KEY = 'shopSessionUser';

function getCartItems() {
  return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
}

function saveCartItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getSessionUser() {
  return JSON.parse(localStorage.getItem(SESSION_USER_KEY) || 'null');
}

function saveSessionUser(user) {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  localStorage.removeItem(SESSION_USER_KEY);
}

function setActiveButton(buttons, selectedButton) {
  buttons.forEach(button => {
    button.classList.toggle('active', button === selectedButton);
  });
}

function filterProducts() {
  productCards.forEach(card => {
    const typeMatch = selectedType === 'all' || card.dataset.type === selectedType;
    card.style.display = typeMatch ? 'flex' : 'none';
  });
}

function formatCurrency(value) {
  return Number(value).toLocaleString('vi-VN') + '₫';
}

function getQuantityText(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount() {
  cartCount.textContent = getQuantityText(getCartItems());
}

function showModal(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modal.style.display = 'flex';
}

function closeModalWindow() {
  modal.style.display = 'none';
}

function getProductInfo(button) {
  const card = button.closest('.product-card');
  const name = button.dataset.name || card.querySelector('h3')?.textContent || 'Sản phẩm';
  const priceText = button.dataset.price || card.querySelector('.price')?.textContent || '0';
  const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;
  return { name, price };
}

function getProductDetails(card) {
  const name = card.querySelector('h3')?.textContent || 'Sản phẩm';
  const priceText = card.querySelector('.price')?.textContent || '0';
  const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;
  const tag = card.querySelector('.product-tag')?.textContent || '';
  const image = card.querySelector('img')?.src || '';
  const description = card.dataset.description || `${tag ? `${tag} - ` : ''}${card.querySelector('img')?.alt || 'Sản phẩm thời trang'}`;
  return { name, price, priceText: formatCurrency(price), description, image };
}

function addItemToCart(product) {
  const items = getCartItems();
  const existing = items.find(item => item.name === product.name && item.price === product.price);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }
  saveCartItems(items);
  updateCartCount();
}

function renderCart() {
  const items = getCartItems();
  const user = getSessionUser();
  if (!items.length) {
    showModal('Giỏ Hàng', `<p>Giỏ hàng đang trống.</p><button class="btn btn-primary" id="continueShopping">Tiếp tục mua sắm</button>`);
    return;
  }

  const rows = items.map((item, index) => {
    return `
      <div class="cart-row">
        <div>
          <div class="cart-name">${item.name}</div>
          <div class="cart-meta">Giá đơn vị: ${formatCurrency(item.price)}</div>
        </div>
        <div class="cart-qty">
          <button class="btn btn-secondary qty-btn" data-action="decrease" data-index="${index}">−</button>
          <span>${item.quantity}</span>
          <button class="btn btn-secondary qty-btn" data-action="increase" data-index="${index}">+</button>
        </div>
        <div class="cart-price">${formatCurrency(item.price * item.quantity)}</div>
      </div>`;
  }).join('');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const greeting = user ? `<p class="cart-greeting">Xin chào <strong>${user.email}</strong>, đây là giỏ hàng của bạn.</p>` : '<p class="cart-greeting">Bạn chưa đăng nhập. Vẫn có thể xem giỏ hàng và mua sau.</p>';

  showModal('Giỏ Hàng', `
    ${greeting}
    <div class="cart-list">
      ${rows}
    </div>
    <div class="cart-total">Tổng: <strong>${formatCurrency(total)}</strong></div>
    <div class="cart-actions">
      <button class="btn btn-secondary" id="clearCart">Xóa hết</button>
      <button class="btn btn-primary" id="checkoutBtn">Thanh toán</button>
    </div>
  `);
}

function renderLoginForm(message = '') {
  const user = getSessionUser();
  if (user) {
    showModal('Đăng nhập', `<p>Bạn đang đăng nhập với <strong>${user.email}</strong>.</p><button class="btn btn-primary" id="logoutBtn">Đăng xuất</button>`);
    return;
  }

  showModal('Đăng Nhập', `
    <form id="loginForm" class="modal-form">
      ${message ? `<p class="form-message">${message}</p>` : ''}
      <label class="input-label">Email</label>
      <input class="input-field" type="email" id="loginEmail" required>
      <label class="input-label">Mật khẩu</label>
      <input class="input-field" type="password" id="loginPassword" required>
      <button class="btn btn-primary" type="submit">Đăng Nhập</button>
    </form>
  `);
}

function renderRegisterForm(message = '') {
  showModal('Đăng Ký', `
    <form id="registerForm" class="modal-form">
      ${message ? `<p class="form-message">${message}</p>` : ''}
      <label class="input-label">Email</label>
      <input class="input-field" type="email" id="registerEmail" required>
      <label class="input-label">Mật khẩu</label>
      <input class="input-field" type="password" id="registerPassword" required>
      <label class="input-label">Nhập lại mật khẩu</label>
      <input class="input-field" type="password" id="registerConfirmPassword" required>
      <button class="btn btn-primary" type="submit">Đăng Ký</button>
    </form>
  `);
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const users = getUsers();
  const user = users.find(item => item.email === email && item.password === password);
  if (!user) {
    renderLoginForm('Email hoặc mật khẩu không đúng.');
    return;
  }
  saveSessionUser({ email });
  showModal('Đăng Nhập thành công', `<p>Xin chào <strong>${email}</strong>! Bạn đã đăng nhập.</p><button class="btn btn-primary" id="viewCartAfterLogin">Xem giỏ hàng</button>`);
}

function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
  if (password !== confirmPassword) {
    renderRegisterForm('Mật khẩu và xác nhận mật khẩu không khớp.');
    return;
  }
  const users = getUsers();
  if (users.some(user => user.email === email)) {
    renderRegisterForm('Email này đã được sử dụng.');
    return;
  }
  users.push({ email, password });
  saveUsers(users);
  saveSessionUser({ email });
  showModal('Đăng Ký thành công', `<p>Xin chào <strong>${email}</strong>! Bạn đã đăng ký và đăng nhập thành công.</p><button class="btn btn-primary" id="viewCartAfterRegister">Xem giỏ hàng</button>`);
}

function handleModalClick(event) {
  if (event.target.id === 'continueShopping') {
    closeModalWindow();
  }
  if (event.target.id === 'checkoutBtn') {
    showModal('Thanh toán', '<p>Giỏ hàng của bạn đã được chuẩn bị.</p>');
  }
  if (event.target.id === 'clearCart') {
    saveCartItems([]);
    updateCartCount();
    renderCart();
  }
  if (event.target.id === 'logoutBtn') {
    clearSessionUser();
    renderLoginForm('Bạn đã đăng xuất.');
  }
  if (event.target.id === 'viewCartAfterLogin' || event.target.id === 'viewCartAfterRegister' || event.target.id === 'viewCartAfterAdd') {
    renderCart();
  }
  if (event.target.id === 'detailAddToCart') {
    const name = event.target.dataset.name;
    const price = Number(event.target.dataset.price) || 0;
    addItemToCart({ name, price });
    showModal('Đã thêm vào giỏ', `<p>${name} đã được thêm vào giỏ hàng.</p><button class="btn btn-primary" id="viewCartAfterAdd">Xem giỏ hàng</button>`);
    return;
  }
  if (event.target.matches('.qty-btn')) {
    const index = Number(event.target.dataset.index);
    const action = event.target.dataset.action;
    const items = getCartItems();
    const item = items[index];
    if (!item) return;
    if (action === 'increase') {
      item.quantity += 1;
    }
    if (action === 'decrease') {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        items.splice(index, 1);
      }
    }
    saveCartItems(items);
    updateCartCount();
    renderCart();
  }
}

function initPage() {
  updateCartCount();
  if (categoryButtons.length) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        setActiveButton(categoryButtons, button);
        selectedType = button.dataset.type;
        filterProducts();
      });
    });
  }

  addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const product = getProductInfo(button);
      addItemToCart(product);
      showModal('Đã thêm vào giỏ', `<p>${product.name} đã được thêm vào giỏ hàng.</p><button class="btn btn-primary" id="viewCartAfterAdd">Xem giỏ hàng</button>`);
    });
  });

  productCards.forEach(card => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.add-to-cart')) return;
      const details = getProductDetails(card);
      showModal(details.name, `
        <div style="display:grid;gap:1rem;">
          <img src="${details.image}" alt="${details.name}" style="width:100%;border-radius:18px;object-fit:cover;max-height:260px;" />
          <p><strong>Mô tả:</strong> ${details.description}</p>
          <p><strong>Giá:</strong> ${details.priceText}</p>
          <button class="btn btn-primary" id="detailAddToCart" data-name="${details.name}" data-price="${details.price}">Thêm vào giỏ</button>
        </div>
      `);
    });
  });

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderLoginForm();
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      renderRegisterForm();
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', renderCart);
  }

  document.body.addEventListener('click', event => {
    if (event.target.matches('#loginBtn')) renderLoginForm();
    if (event.target.matches('#registerBtn')) renderRegisterForm();
    if (event.target.matches('#cartBtn')) renderCart();
  });

  if (closeModal) {
    closeModal.addEventListener('click', closeModalWindow);
  }
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModalWindow();
    }
  });

  modalBody.addEventListener('submit', (event) => {
    if (event.target.id === 'loginForm') {
      handleLogin(event);
    }
    if (event.target.id === 'registerForm') {
      handleRegister(event);
    }
  });

  modalBody.addEventListener('click', handleModalClick);
}

initPage();
