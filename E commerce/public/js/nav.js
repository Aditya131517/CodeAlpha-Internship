function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('fm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fm-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function requireLogin(redirectTo) {
  if (!getToken()) {
    const next = encodeURIComponent(redirectTo || window.location.pathname + window.location.search);
    window.location.href = `login.html?next=${next}`;
    return false;
  }
  return true;
}

async function renderNav() {
  const mount = document.getElementById('site-nav');
  if (!mount) return;

  const user = getStoredUser();

  mount.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-mark">&#9670;</span> Fieldstone Market
        <span class="brand-est">EST. 2026 · GENERAL GOODS</span>
      </a>
      <nav class="main-nav">
        <a href="index.html">Shop</a>
        ${user ? '<a href="orders.html">Orders</a>' : ''}
        <a href="cart.html" class="cart-link">Cart <span class="cart-count" id="cart-count">0</span></a>
        ${
          user
            ? `<span class="nav-user">Signed in as ${user.name.split(' ')[0]}</span><button class="btn-link" id="logout-btn">Log out</button>`
            : '<a href="login.html">Log in</a><a href="register.html">Sign up</a>'
        }
      </nav>
    </div>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      showToast('Signed out.');
      setTimeout(() => (window.location.href = 'index.html'), 400);
    });
  }

  updateCartCount();
}

async function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;

  if (!getToken()) {
    countEl.textContent = '0';
    return;
  }

  try {
    const { items } = await api.getCart();
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    countEl.textContent = String(total);
  } catch (e) {
    countEl.textContent = '0';
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
