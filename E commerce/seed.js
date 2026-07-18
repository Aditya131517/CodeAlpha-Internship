const db = require('./db');

const products = [
  {
    name: 'Cast Iron Skillet, 10"',
    description: 'Pre-seasoned cast iron skillet built to last generations. Even heat retention, oven-safe, and gets better with every use.',
    price: 34.5,
    image_url: 'https://images.unsplash.com/photo-1584990347449-a8dbf2e21c65?w=600&q=80',
    category: 'Kitchen',
    stock: 24
  },
  {
    name: 'Waxed Canvas Tool Bag',
    description: 'Rugged waxed canvas bag with leather straps and reinforced base. Water-resistant and built for daily hauling.',
    price: 58.0,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    category: 'Bags',
    stock: 15
  },
  {
    name: 'Hand-Thrown Ceramic Mug',
    description: 'Stoneware mug thrown and glazed by hand. Each piece is one of a kind, holds 12oz, dishwasher safe.',
    price: 22.0,
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    category: 'Kitchen',
    stock: 40
  },
  {
    name: 'Merino Wool Beanie',
    description: 'Tightly knit merino wool beanie. Warm without the itch, folds flat for travel, one size fits most.',
    price: 28.0,
    image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80',
    category: 'Apparel',
    stock: 32
  },
  {
    name: 'Oiled Leather Notebook Cover',
    description: 'Full-grain leather cover fitted for standard A5 notebooks. Develops a rich patina with age and use.',
    price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80',
    category: 'Stationery',
    stock: 18
  },
  {
    name: 'Enamel Camp Percolator',
    description: '9-cup enamel-coated percolator for camp or stovetop coffee. Durable steel construction, cool-touch handle.',
    price: 39.0,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    category: 'Kitchen',
    stock: 20
  },
  {
    name: 'Cotton Canvas Work Apron',
    description: 'Heavyweight cotton canvas apron with adjustable neck strap and three tool pockets. Built for the shop or kitchen.',
    price: 32.0,
    image_url: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=600&q=80',
    category: 'Apparel',
    stock: 27
  },
  {
    name: 'Hand-Forged Kitchen Knife',
    description: 'Carbon steel blade forged and ground by hand, fitted with a walnut handle. Ships with a leather sheath.',
    price: 89.0,
    image_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80',
    category: 'Kitchen',
    stock: 12
  },
  {
    name: 'Wool Blend Throw Blanket',
    description: 'Woven wool-blend throw in a classic plaid. Soft, warm, and substantial — 50x60 inches.',
    price: 64.0,
    image_url: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=600&q=80',
    category: 'Home',
    stock: 16
  }
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image_url, category, stock)
  VALUES (@name, @description, @price, @image_url, @category, @stock)
`);

const existing = db.prepare('SELECT COUNT(*) AS c FROM products').get();
if (existing.c === 0) {
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log(`Products table already has ${existing.c} rows — skipping seed.`);
}
