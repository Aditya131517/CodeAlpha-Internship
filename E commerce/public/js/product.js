function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function stockLabel(stock) {
  if (stock <= 0) return `<span class="stock-badge out">Sold out</span>`;
  if (stock <= 5) return `<span class="stock-badge low">Only ${stock} left</span>`;
  return `<span class="stock-badge">${stock} in stock</span>`;
}

async function loadProduct() {
  const mount = document.getElementById('product-detail-mount');
  const id = getProductId();

  if (!id) {
    mount.innerHTML = `<div class="error-text">No product specified.</div>`;
    return;
  }

  try {
    const { product } = await api.getProduct(id);
    document.title = `${product.name} — Fieldstone Market`;

    mount.innerHTML = `
      <div class="breadcrumb"><a href="index.html">Shop</a> / ${product.category} / ${product.name}</div>
      <div class="product-detail">
        <div class="detail-image">
          <img src="${product.image_url}" alt="${product.name}" />
        </div>
        <div class="detail-info">
          <span class="category-tag">${product.category}</span>
          <h1>${product.name}</h1>
          <div class="detail-price-row">
            <span class="price-tag">${formatPrice(product.price)}</span>
            ${stockLabel(product.stock)}
          </div>
          <p class="detail-description">${product.description}</p>

          <div class="qty-row">
            <label for="qty-input" style="font-size:13px; font-weight:600; color:var(--ink-soft);">Quantity</label>
            <div class="qty-control">
              <button type="button" id="qty-minus" aria-label="Decrease quantity">&minus;</button>
              <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" />
              <button type="button" id="qty-plus" aria-label="Increase quantity">&plus;</button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="add-to-cart-btn" ${product.stock <= 0 ? 'disabled' : ''}>
            ${product.stock <= 0 ? 'Sold out' : 'Add to cart'}
          </button>
          <div class="form-message" id="detail-message"></div>
        </div>
      </div>
    `;

    setupQuantityControls(product.stock);
    document.getElementById('add-to-cart-btn').addEventListener('click', () => handleAddToCart(product));
  } catch (err) {
    mount.innerHTML = `<div class="error-text">Couldn't load this product: ${err.message}</div>`;
  }
}

function setupQuantityControls(maxStock) {
  const input = document.getElementById('qty-input');
  document.getElementById('qty-minus').addEventListener('click', () => {
    input.value = Math.max(1, Number(input.value) - 1);
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    input.value = Math.min(maxStock, Number(input.value) + 1);
  });
  input.addEventListener('change', () => {
    let val = Number(input.value) || 1;
    val = Math.max(1, Math.min(maxStock, val));
    input.value = val;
  });
}

async function handleAddToCart(product) {
  const msg = document.getElementById('detail-message');
  const btn = document.getElementById('add-to-cart-btn');
  const qty = Number(document.getElementById('qty-input').value) || 1;

  if (!getToken()) {
    window.location.href = `login.html?next=${encodeURIComponent(`product.html?id=${product.id}`)}`;
    return;
  }

  btn.disabled = true;
  msg.className = 'form-message';
  try {
    await api.addToCart(product.id, qty);
    msg.textContent = `Added ${qty} to your cart.`;
    msg.className = 'form-message success show';
    showToast('Added to cart.');
    updateCartCount();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-message error show';
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);
