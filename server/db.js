import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'pizzoo.db');
export const db = new Database(dbPath);

// Enable Foreign Keys & Write-Ahead Logging for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      italian_title TEXT,
      category TEXT NOT NULL,
      price_reg REAL DEFAULT 0,
      price_med REAL DEFAULT 0,
      price_lrg REAL DEFAULT 0,
      description TEXT,
      image_url TEXT,
      ingredients_json TEXT,
      tags_json TEXT,
      is_veg INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_no TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'DINE_IN',
      customer_name TEXT,
      phone TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'RECEIVED',
      notes TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      is_paid INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      name TEXT NOT NULL,
      size TEXT,
      crust TEXT,
      sauce_level TEXT,
      toppings_json TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      receipt_number TEXT NOT NULL,
      order_id TEXT NOT NULL,
      table_no TEXT NOT NULL,
      type TEXT NOT NULL,
      customer_name TEXT,
      email TEXT,
      items_json TEXT NOT NULL,
      total_price REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec("ALTER TABLE orders ADD COLUMN email TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE receipts ADD COLUMN email TEXT;"); } catch (e) {}

  // Seed Menu Items if empty
  try {
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM menu_items').get().count;
    if (itemCount === 0) {
      seedMenuItems();
    }
  } catch (e) {}
}

function seedMenuItems() {
  const items = [
    {
      id: 'p1',
      name: 'Classic Margherita',
      italian_title: 'Margherita Classica',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 135,
      price_med: 240,
      price_lrg: 390,
      description: 'Sourdough Pizza- Gouda White Cheese,Mozzarella,Orange cheddar...',
      image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['San Marzano Tomato Sauce', 'Fior di Latte Mozzarella', 'Fresh Basil Leaves', 'EVOO']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'Classic Pizza']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p2',
      name: 'Caramelized Onion Pizza',
      italian_title: 'Pizza con Cipolle Dolce',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 140,
      price_med: 280,
      price_lrg: 420,
      description: 'Slow-caramelized sweet red onions paired with tangy tomato sauce and creamy mozzarella on a crisp sourdough base.',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Slow Caramelized Onions', 'Tomato Sauce', 'Creamy Mozzarella', 'Italian Herbs']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'Tomato Base', 'Mozzarella']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p3',
      name: 'Cheese & Sweet Corn',
      italian_title: 'Pizza al Mais Dolce',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 150,
      price_med: 290,
      price_lrg: 440,
      description: 'Sweet golden corn kernels layered under a rich blanket of melted mozzarella and sharp cheddar cheese.',
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Golden Sweet Corn', 'Mozzarella Cheese', 'Cheddar Blend', 'Herbed Tomato Sauce']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'Tomato Base', 'Mozzarella']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p4',
      name: 'Double Cheese Margherita',
      italian_title: 'Margherita col Doppio Formaggio',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 175,
      price_med: 320,
      price_lrg: 480,
      description: 'Double the indulgence! Classic Margherita generously covered with extra layers of premium melted mozzarella.',
      image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Double Mozzarella', 'San Marzano Tomato Sauce', 'Extra Basil']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'San Marzano Sauce', 'Double Mozzarella']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p5',
      name: 'Garden Veg Supreme',
      italian_title: "Pizza dell'Orto Italian",
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 185,
      price_med: 340,
      price_lrg: 510,
      description: 'A garden feast! Crisp capsicum, sweet onions, vine tomatoes, black olives, and Italian herbs over zesty sauce.',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Capsicum', 'Onions', 'Tomatoes', 'Black Olives', 'Mozzarella']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'San Marzano Sauce', 'Mozzarella']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p6',
      name: 'Peppy Spiced Paneer',
      italian_title: 'Paneer Speziato Trattoria',
      category: 'Le Nostre Pizze (Veg)',
      price_reg: 195,
      price_med: 360,
      price_lrg: 540,
      description: 'Marinated paneer chunks tossed in zesty Italian spices, combined with vibrant bell peppers and rich cheese.',
      image_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Spiced Paneer', 'Red & Green Peppers', 'Tomato Sauce', 'Mozzarella']),
      tags_json: JSON.stringify(['00 Wheat Dough', 'Spiced Tomato Base', 'Mozzarella']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 'p7',
      name: 'Pollo Piccante (Spicy Chicken)',
      italian_title: 'Pollo Piccante',
      category: 'Le Nostre Pizze (Non-Veg)',
      price_reg: 220,
      price_med: 390,
      price_lrg: 580,
      description: 'Fiery grilled chicken chunks, sliced jalapeños, red paprika, and smoky mozzarella cheese.',
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Spiced Grilled Chicken', 'Jalapeños', 'Red Paprika', 'Smoky Mozzarella']),
      tags_json: JSON.stringify(['Spicy Non-Veg', 'Woodfired Base']),
      is_veg: 0,
      is_available: 1
    },
    {
      id: 'p8',
      name: 'Salami & Pepperoni Feast',
      italian_title: 'Salame e Pepperoni Supremo',
      category: 'Le Nostre Pizze (Non-Veg)',
      price_reg: 250,
      price_med: 440,
      price_lrg: 640,
      description: 'Authentic sliced chicken salami rounds, spicy pepperoni, EVOO drizzle, and aged Gouda blend.',
      image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Chicken Salami', 'Pepperoni', 'Gouda Blend', 'EVOO Drizzle']),
      tags_json: JSON.stringify(['Non-Veg Supreme', 'Neapolitan Thin']),
      is_veg: 0,
      is_available: 1
    },
    {
      id: 's1',
      name: 'Cheesy Garlic Bread',
      italian_title: 'Pane all’Aglio col Formaggio',
      category: 'Loaded Fries & Sides',
      price_reg: 140,
      price_med: 0,
      price_lrg: 0,
      description: 'Artisanal sourdough baguettes brushed with garlic butter and topped with melted mozzarella.',
      image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Garlic Butter', 'Mozzarella', 'Italian Oregano']),
      tags_json: JSON.stringify(['Sides', 'Chef Favorite']),
      is_veg: 1,
      is_available: 1
    },
    {
      id: 's2',
      name: 'Truffle Parmesan Loaded Fries',
      italian_title: 'Patatine al Tartufo e Parmigiano',
      category: 'Loaded Fries & Sides',
      price_reg: 160,
      price_med: 0,
      price_lrg: 0,
      description: 'Crispy skin-on golden fries tossed in white truffle oil, grated Parmesan cheese, and fresh parsley.',
      image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=800',
      ingredients_json: JSON.stringify(['Skin-on Fries', 'Truffle Oil', 'Grated Parmesan', 'Parsley']),
      tags_json: JSON.stringify(['Sides', 'Gourmet Fries']),
      is_veg: 1,
      is_available: 1
    }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO menu_items (
      id, name, italian_title, category, price_reg, price_med, price_lrg,
      description, image_url, ingredients_json, tags_json, is_veg, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    stmt.run(
      item.id,
      item.name,
      item.italian_title,
      item.category,
      item.price_reg,
      item.price_med,
      item.price_lrg,
      item.description,
      item.image_url,
      item.ingredients_json,
      item.tags_json,
      item.is_veg,
      item.is_available
    );
  }
}

// Initialize on module load
initDb();
