# Fieldstone Market

A basic full-stack e-commerce site: product listings, product detail pages,
shopping cart, user registration/login, and order processing.

**Stack**
- Backend: Node.js + Express.js, JWT auth, bcrypt password hashing
- Database: SQLite (via `better-sqlite3`) — file-based, no separate DB server needed
- Frontend: Plain HTML, CSS, and vanilla JavaScript (no framework/build step)

## Setup

```bash
npm install
npm run seed    # populates the database with 9 sample products (skips if already seeded)
npm start        # starts the server at http://localhost:3000
```

Then open **http://localhost:3000** in a browser.

To reset the data, delete `data/store.db*` and run `npm run seed` again.

## Project structure

```
server.js            Express app entry point, mounts routes + serves /public
db.js                 SQLite connection + schema (users, products, cart_items, orders, order_items)
seed.js               Sample product data loader
middleware/auth.js    JWT verification middleware
routes/auth.js        POST /api/auth/register, /login, GET /me
routes/products.js    GET /api/products (search/category filter), GET /api/products/:id
routes/cart.js        GET/POST /api/cart, PUT/DELETE /api/cart/:productId
routes/orders.js      POST /api/orders (checkout), GET /api/orders, GET /api/orders/:id
public/               Static frontend (index, product, cart, login, register, orders pages)
```

## Features

- **Product listings** — homepage grid with live search and category filtering.
- **Product detail page** — full description, stock level, quantity picker.
- **Shopping cart** — persisted server-side per logged-in user; quantity update and remove.
- **User registration / login** — bcrypt-hashed passwords, JWT issued on login and stored
  in `localStorage`, sent as a `Bearer` token on subsequent API calls.
- **Order processing** — checkout captures shipping name/address, validates stock,
  decrements inventory, clears the cart, and creates an order + order line items
  in a single DB transaction. Order history page lists past orders with line items.
- **Database** — SQLite file at `data/store.db` with five tables: `users`, `products`,
  `cart_items`, `orders`, `order_items`.

## Notes / things to know

- This is a demo: no real payment processing, no email verification, no HTTPS enforcement.
- The JWT secret defaults to a dev value; set `JWT_SECRET` in a `.env` file for anything
  beyond local testing.
- Cart actions require being logged in — adding to cart while signed out redirects to
  the login page and returns you to where you were.
- Stock is checked both when adding to cart and again at checkout, so it can't go negative
  even with concurrent requests.
