import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("save2get.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    occupation TEXT,
    balance REAL DEFAULT 0.0,
    tier INTEGER DEFAULT 1,
    account_number TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'credit', 'debit'
    amount REAL,
    description TEXT,
    category TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    target_amount REAL,
    current_amount REAL DEFAULT 0.0,
    recurring_amount REAL DEFAULT 0.0,
    schedule TEXT, -- 'daily', 'weekly', 'monthly'
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS crypto_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    currency TEXT, -- 'BTC', 'ETH', 'USDT'
    address TEXT,
    balance REAL DEFAULT 0.0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    image TEXT,
    description TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS product_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    total_price REAL,
    paid_amount REAL DEFAULT 0.0,
    status TEXT, -- 'pending', 'completed', 'installments'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed products if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const seedProducts = [
    { name: 'iPhone 15 Pro', price: 1200000, image: 'https://picsum.photos/seed/iphone/400/400', description: 'Latest Apple iPhone', category: 'Electronics' },
    { name: 'MacBook Air M2', price: 950000, image: 'https://picsum.photos/seed/macbook/400/400', description: 'Powerful and portable', category: 'Electronics' },
    { name: 'Samsung S24 Ultra', price: 1100000, image: 'https://picsum.photos/seed/samsung/400/400', description: 'AI powered smartphone', category: 'Electronics' },
    { name: 'PS5 Console', price: 650000, image: 'https://picsum.photos/seed/ps5/400/400', description: 'Next-gen gaming', category: 'Gaming' }
  ];
  const insertProduct = db.prepare('INSERT INTO products (name, price, image, description, category) VALUES (?, ?, ?, ?, ?)');
  seedProducts.forEach(p => insertProduct.run(p.name, p.price, p.image, p.description, p.category));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/register", (req, res) => {
    const { firstName, lastName, email, phone, occupation } = req.body;
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    try {
      const info = db.prepare(`
        INSERT INTO users (first_name, last_name, email, phone, occupation, account_number, balance)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(firstName, lastName, email, phone, occupation, accountNumber, 0.0);
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { phone } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/transactions/:userId", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
    res.json(transactions);
  });

  app.get("/api/savings/:userId", (req, res) => {
    const savings = db.prepare("SELECT * FROM savings WHERE user_id = ?").all(req.params.userId);
    res.json(savings);
  });

  app.post("/api/savings", (req, res) => {
    const { userId, title, targetAmount, recurringAmount, schedule } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO savings (user_id, title, target_amount, recurring_amount, schedule)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, title, targetAmount, recurringAmount, schedule);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/crypto/:userId", (req, res) => {
    const wallets = db.prepare("SELECT * FROM crypto_wallets WHERE user_id = ?").all(req.params.userId);
    res.json(wallets);
  });

  app.post("/api/crypto/convert", (req, res) => {
    const { userId, amount, currency, rate } = req.body;
    const nairaAmount = amount * rate;
    try {
      db.transaction(() => {
        db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(nairaAmount, userId);
        db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description, category)
          VALUES (?, 'credit', ?, ?, 'crypto')
        `).run(userId, nairaAmount, `Converted ${amount} ${currency} to Naira`);
      })();
      res.json({ success: true, newBalance: nairaAmount });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/user/:id", (req, res) => {
    const { firstName, lastName, email, occupation } = req.body;
    try {
      db.prepare(`
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, occupation = ?
        WHERE id = ?
      `).run(firstName, lastName, email, occupation, req.params.id);
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Store Endpoints
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/store/order", (req, res) => {
    const { userId, productId, amount, type } = req.body; // type: 'full' or 'installment'
    try {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as any;
      if (!product) return res.status(404).json({ error: "Product not found" });

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

      db.transaction(() => {
        db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
        db.prepare(`
          INSERT INTO product_orders (user_id, product_id, total_price, paid_amount, status)
          VALUES (?, ?, ?, ?, ?)
        `).run(userId, productId, product.price, amount, type === 'full' ? 'completed' : 'installments');
        
        db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description, category)
          VALUES (?, 'debit', ?, ?, 'store')
        `).run(userId, amount, `Payment for ${product.name}`);
      })();

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Bills Endpoints
  app.post("/api/bills/pay", (req, res) => {
    const { userId, amount, category, description } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

      db.transaction(() => {
        db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
        db.prepare(`
          INSERT INTO transactions (user_id, type, amount, description, category)
          VALUES (?, 'debit', ?, ?, ?)
        `).run(userId, amount, description, category);
      })();

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
