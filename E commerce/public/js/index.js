let allCategories = [];
let searchDebounce = null;

function stockBadge(stock) {
  if (stock <= 0) return `<span class="stock-badge out">Sold out</span>`;
  if (stock <= 5) return `<span class="stock-badge low">Only ${stock} left</span>`;
  return `<span class="stock-badge">In stock</span>`;
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Nothing on the shelf</h3>
        <p>Try a different search term or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <article class="product-card">
      <a class="thumb-link" href="product.html?id=${p.id}">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
      </a>
      <div class="card-body">
        <span class="category-tag">${p.category}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="card-footer">
          <span class="price-tag">${formatPrice(p.price)}</span>
          ${stockBadge(p.stock)}
        </div>
        <button class="btn btn-primary add-btn" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
          ${p.stock <= 0 ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </article>`
    )
    .join('');

  grid.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleQuickAdd(btn));
  });
}

async function handleQuickAdd(btn) {
  if (!getToken()) {
    window.location.href = `login.html?next=${encodeURIComponent('index.html')}`;
    return;
  }
  const productId = Number(btn.dataset.id);
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Adding…';
  try {
    await api.addToCart(productId, 1);
    showToast('Added to cart.');
    updateCartCount();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const search = document.getElementById('search-input').value.trim();
  const category = document.getElementById('category-select').value;

  grid.innerHTML = `<div class="loading">Loading catalog…</div>`;

  try {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    const { products, categories } = await api.getProducts(params);
    renderProducts(products);

    if (allCategories.length === 0 && categories.length > 0) {
      allCategories = categories;
      const select = document.getElementById('category-select');
      categories.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    grid.innerHTML = `<div class="error-text">Couldn't load products: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadProducts, 300);
  });

  document.getElementById('category-select').addEventListener('change', loadProducts);
});
