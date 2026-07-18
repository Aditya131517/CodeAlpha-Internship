const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getCart(userId) {
  const items = db
    .prepare(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id DESC`
    )
    .all(userId);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, subtotal: Math.round(subtotal * 100) / 100 };
}

router.get('/', (req, res) => {
  res.json(getCart(req.user.id));
});

router.post('/', (req, res) => {
  const { productId, quantity } = req.body || {};
  const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);

  const desiredQty = existing ? existing.quantity + qty : qty;
  if (desiredQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(desiredQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      productId,
      qty
    );
  }

  res.status(201).json(getCart(req.user.id));
});

router.put('/:productId', (req, res) => {
  const { quantity } = req.body || {};
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a positive whole number.' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  const result = db
    .prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')
    .run(quantity, req.user.id, req.params.productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not in cart.' });
  }

  res.json(getCart(req.user.id));
});

router.delete('/:productId', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    req.params.productId
  );
  res.json(getCart(req.user.id));
});

module.exports = router;
