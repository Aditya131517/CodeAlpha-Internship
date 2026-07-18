// Thin wrapper around fetch that attaches the auth token and parses JSON.
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('fm_token');
}

function getStoredUser() {
  const raw = localStorage.getItem('fm_user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('fm_token', token);
  localStorage.setItem('fm_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('fm_token');
  localStorage.removeItem('fm_user');
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

const api = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  me: () => apiRequest('/auth/me'),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => apiRequest(`/products/${id}`),

  getCart: () => apiRequest('/cart'),
  addToCart: (productId, quantity) => apiRequest('/cart', { method: 'POST', body: { productId, quantity } }),
  updateCartItem: (productId, quantity) => apiRequest(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),
  removeCartItem: (productId) => apiRequest(`/cart/${productId}`, { method: 'DELETE' }),

  placeOrder: (payload) => apiRequest('/orders', { method: 'POST', body: payload }),
  getOrders: () => apiRequest('/orders'),
  getOrder: (id) => apiRequest(`/orders/${id}`),
};
