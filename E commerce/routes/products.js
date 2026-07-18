const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/products?search=&category=
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  query += ' ORDER BY created_at DESC';

  const products = db.prepare(query).all(...params);
  const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();

  res.json({ products, categories: categories.map((c) => c.category) });
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json({ product });
});

module.exports = router;
