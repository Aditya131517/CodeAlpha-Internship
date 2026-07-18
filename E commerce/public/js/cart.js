async function loadCart() {
  const mount = document.getElementById('cart-mount');

  if (!requireLogin('cart.html')) return;

  try {
    const { items, subtotal } = await api.getCart();
    renderCart(items, subtotal);
  } catch (err) {
    mount.innerHTML = `<div class="error-text">Couldn't load your cart: ${err.message}</div>`;
  }
}

function renderCart(items, subtotal) {
  const mount = document.getElementById('cart-mount');

  if (items.length === 0) {
    mount.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>Your cart is empty</h3>
        <p>Browse the catalog and add something you'll actually use.</p>
        <a class="btn btn-primary" href="index.html" style="margin-top:16px;">Back to shop</a>
      </div>`;
    return;
  }

  const itemsHtml = items
    .map(
      (i) => `
    <div class="cart-item" data-product-id="${i.product_id}">
      <img src="${i.image_url}" alt="${i.name}" />
      <div>
        <p class="name">${i.name}</p>
        <p class="unit-price">${formatPrice(i.price)} each</p>
        <div class="qty-control" style="margin-top:8px;">
          <button type="button" class="cart-qty-minus" aria-label="Decrease quantity">&minus;</button>
          <input type="number" class="cart-qty-input" value="${i.quantity}" min="1" max="${i.stock}" />
          <button type="button" class="cart-qty-plus" aria-label="Increase quantity">&plus;</button>
        </div>
      </div>
      <span class="line-total">${formatPrice(i.price * i.quantity)}</span>
      <button class="btn-danger" type="button" data-action="remove">Remove</button>
    </div>`
    )
    .join('');

  mount.innerHTML = `
    <div class="receipt">
      ${itemsHtml}
    </div>
    <aside class="summary-card">
      <h2>Order summary</h2>
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Free</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(subtotal)}</span></div>

      <div class="field" style="margin-top:20px;">
        <label for="ship-name">Full name</label>
        <input type="text" id="ship-name" placeholder="Jordan Rivera" />
      </div>
      <div class="field">
        <label for="ship-address">Shipping address</label>
        <input type="text" id="ship-address" placeholder="123 Fieldstone Rd, Nashik, MH" />
      </div>
      <div class="form-message" id="checkout-message"></div>
      <button class="btn btn-primary btn-block" id="checkout-btn">Place order</button>
    </aside>
  `;

  mount.querySelectorAll('.cart-item').forEach((row) => {
    const productId = Number(row.dataset.productId);
    const input = row.querySelector('.cart-qty-input');

    row.querySelector('.cart-qty-minus').addEventListener('click', () => {
      const newQty = Math.max(1, Number(input.value) - 1);
      updateQuantity(productId, newQty);
    });
    row.querySelector('.cart-qty-plus').addEventListener('click', () => {
      const max = Number(input.max) || 999;
      const newQty = Math.min(max, Number(input.value) + 1);
      updateQuantity(productId, newQty);
    });
    input.addEventListener('change', () => {
      const max = Number(input.max) || 999;
      const val = Math.max(1, Math.min(max, Number(input.value) || 1));
      updateQuantity(productId, val);
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(productId));
  });

  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

async function updateQuantity(productId, quantity) {
  try {
    const { items, subtotal } = await api.updateCartItem(productId, quantity);
    renderCart(items, subtotal);
    updateCartCount();
  } catch (err) {
    showToast(err.message, 'error');
    loadCart();
  }
}

async function removeItem(productId) {
  try {
    const { items, subtotal } = await api.removeCartItem(productId);
    renderCart(items, subtotal);
    updateCartCount();
    showToast('Item removed.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCheckout() {
  const btn = document.getElementById('checkout-btn');
  const msg = document.getElementById('checkout-message');
  const shippingName = document.getElementById('ship-name').value.trim();
  const shippingAddress = document.getElementById('ship-address').value.trim();

  msg.className = 'form-message';

  if (!shippingName || !shippingAddress) {
    msg.textContent = 'Enter a name and shipping address to place your order.';
    msg.className = 'form-message error show';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Placing order…';

  try {
    const { order } = await api.placeOrder({ shippingName, shippingAddress });
    updateCartCount();
    window.location.href = `orders.html?justPlaced=${order.id}`;
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-message error show';
    btn.disabled = false;
    btn.textContent = 'Place order';
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
