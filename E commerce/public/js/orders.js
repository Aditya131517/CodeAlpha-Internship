function formatDate(sqliteDate) {
  // sqlite datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC
  const d = new Date(sqliteDate.replace(' ', 'T') + 'Z');
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadOrders() {
  const mount = document.getElementById('orders-mount');
  if (!requireLogin('orders.html')) return;

  const params = new URLSearchParams(window.location.search);
  const justPlaced = params.get('justPlaced');

  try {
    const { orders } = await api.getOrders();

    if (orders.length === 0) {
      mount.innerHTML = `
        <div class="empty-state">
          <h3>No orders yet</h3>
          <p>Once you check out, your orders will show up here.</p>
          <a class="btn btn-primary" href="index.html" style="margin-top:16px;">Browse the shop</a>
        </div>`;
      return;
    }

    if (justPlaced) {
      showToast('Order placed — thank you!');
    }

    // Fetch full detail (with items) for each order
    const detailed = await Promise.all(orders.map((o) => api.getOrder(o.id)));

    mount.innerHTML = detailed
      .map(({ order }) => `
        <div class="order-card">
          <div class="order-head">
            <span class="oid">ORDER #${String(order.id).padStart(4, '0')}</span>
            <span>${formatDate(order.created_at)}</span>
            <span class="order-status">${order.status}</span>
          </div>
          <div class="order-body">
            ${order.items
              .map(
                (i) => `
              <div class="order-line">
                <span class="oname">${i.product_name}</span>
                <span class="oqty">×${i.quantity} @ ${formatPrice(i.price)}</span>
                <span>${formatPrice(i.price * i.quantity)}</span>
              </div>`
              )
              .join('')}
            <div class="order-total-row"><span>Total</span><span>${formatPrice(order.total)}</span></div>
            <div class="order-ship">Shipping to ${order.shipping_name} — ${order.shipping_address}</div>
          </div>
        </div>
      `)
      .join('');
  } catch (err) {
    mount.innerHTML = `<div class="error-text">Couldn't load your orders: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadOrders);
