import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for menu image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'item-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Server-Sent Events (SSE) Client Connections
let sseClients = [];

function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// SSE Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// =========================================
// MENU ITEMS API
// =========================================

// 1. Get all menu items
app.get('/api/menu', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM menu_items ORDER BY category ASC, name ASC').all();
    const items = rows.map(r => ({
      ...r,
      is_veg: Boolean(r.is_veg),
      is_available: Boolean(r.is_available),
      ingredients: JSON.parse(r.ingredients_json || '[]'),
      tags: JSON.parse(r.tags_json || '[]')
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create menu item
app.post('/api/menu', (req, res) => {
  try {
    const {
      name, italian_title, category, price_reg, price_med, price_lrg,
      description, image_url, ingredients, tags, is_veg, is_available
    } = req.body;

    const id = 'item-' + Date.now();
    const stmt = db.prepare(`
      INSERT INTO menu_items (
        id, name, italian_title, category, price_reg, price_med, price_lrg,
        description, image_url, ingredients_json, tags_json, is_veg, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, name, italian_title || '', category || 'Le Nostre Pizze (Veg)',
      Number(price_reg) || 0, Number(price_med) || 0, Number(price_lrg) || 0,
      description || '', image_url || '',
      JSON.stringify(ingredients || []),
      JSON.stringify(tags || []),
      is_veg ? 1 : 0,
      is_available !== undefined ? (is_available ? 1 : 0) : 1
    );

    const newItem = {
      id, name, italian_title, category,
      price_reg, price_med, price_lrg, description, image_url,
      ingredients, tags, is_veg: Boolean(is_veg), is_available: Boolean(is_available ?? true)
    };

    broadcastEvent('UPDATE_MENU', { action: 'ADD', item: newItem });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update menu item
app.put('/api/menu/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, italian_title, category, price_reg, price_med, price_lrg,
      description, image_url, ingredients, tags, is_veg, is_available
    } = req.body;

    const stmt = db.prepare(`
      UPDATE menu_items SET
        name = ?, italian_title = ?, category = ?, price_reg = ?, price_med = ?, price_lrg = ?,
        description = ?, image_url = ?, ingredients_json = ?, tags_json = ?, is_veg = ?, is_available = ?
      WHERE id = ?
    `);

    stmt.run(
      name, italian_title || '', category, Number(price_reg) || 0, Number(price_med) || 0, Number(price_lrg) || 0,
      description || '', image_url || '', JSON.stringify(ingredients || []), JSON.stringify(tags || []),
      is_veg ? 1 : 0, is_available ? 1 : 0, id
    );

    const updatedItem = {
      id, name, italian_title, category, price_reg, price_med, price_lrg,
      description, image_url, ingredients, tags, is_veg: Boolean(is_veg), is_available: Boolean(is_available)
    };

    broadcastEvent('UPDATE_MENU', { action: 'UPDATE', item: updatedItem });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Toggle item availability (Sold Out status)
app.patch('/api/menu/:id/availability', (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, id);
    broadcastEvent('UPDATE_MENU', { action: 'TOGGLE_AVAILABILITY', id, is_available: Boolean(is_available) });
    res.json({ id, is_available: Boolean(is_available) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete single menu item
app.delete('/api/menu/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    broadcastEvent('UPDATE_MENU', { action: 'DELETE', id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Delete all custom database menu items
app.post('/api/menu/clear-all', (req, res) => {
  try {
    db.prepare('DELETE FROM menu_items').run();
    broadcastEvent('UPDATE_MENU', { action: 'CLEAR_ALL' });
    res.json({ success: true, message: 'All custom database menu items deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// ORDERS & KDS API
// =========================================

// Helper to fetch orders with nested items
function fetchAllOrders() {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const getItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  return orders.map(ord => {
    const rawItems = getItemsStmt.all(ord.id);
    const items = rawItems.map(it => ({
      ...it,
      toppings: JSON.parse(it.toppings_json || '[]')
    }));

    return {
      id: ord.id,
      tableNo: ord.table_no,
      type: ord.type,
      customerName: ord.customer_name,
      phone: ord.phone,
      email: ord.email || '',
      status: ord.status,
      notes: ord.notes,
      totalAmount: ord.total_amount,
      isPaid: Boolean(ord.is_paid),
      createdAt: ord.created_at,
      items
    };
  });
}

// 1. Get all active orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = fetchAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit new order (Order Placed & Confirmed)
app.post('/api/orders', (req, res) => {
  try {
    const { tableNo, type, customerName, phone, email, notes, items, totalAmount } = req.body;

    const orderId = req.body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (id, table_no, type, customer_name, phone, email, status, notes, total_amount, is_paid, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, 1, ?, ?)
    `);

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, name, size, crust, sauce_level, toppings_json, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertReceiptStmt = db.prepare(`
      INSERT INTO receipts (id, receipt_number, order_id, table_no, type, customer_name, email, items_json, total_price, payment_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createTransaction = db.transaction(() => {
      insertOrderStmt.run(
        orderId,
        tableNo || 'COUNTER',
        type || 'DINE_IN',
        customerName || 'Customer',
        phone || '',
        email || '',
        notes || '',
        Number(totalAmount) || 0,
        createdAt,
        createdAt
      );

      const itemsForReceipt = [];

      for (const item of (items || [])) {
        const itemPrice = Number(item.price || item.unit_price) || 0;
        const qty = Number(item.quantity) || 1;
        const subtotal = itemPrice * qty;

        insertItemStmt.run(
          orderId,
          item.name || 'Pizza Item',
          item.size || '',
          item.crust || '',
          item.sauceLevel || item.sauce_level || '',
          JSON.stringify(item.toppings || []),
          qty,
          itemPrice,
          subtotal
        );

        itemsForReceipt.push({
          name: item.name || 'Pizza Item',
          size: item.size || '',
          crust: item.crust || '',
          sauceLevel: item.sauceLevel || item.sauce_level || '',
          toppings: item.toppings || [],
          quantity: qty,
          price: itemPrice,
          subtotal
        });
      }

      insertReceiptStmt.run(
        `REC-${orderId}`,
        `REC-${orderId}`,
        orderId,
        tableNo || 'COUNTER',
        type || 'DINE_IN',
        customerName || 'Customer',
        email || '',
        JSON.stringify(itemsForReceipt),
        Number(totalAmount) || 0,
        'PAID',
        createdAt
      );
    });

    createTransaction();

    const createdOrder = {
      id: orderId,
      tableNo: tableNo || 'COUNTER',
      type: type || 'DINE_IN',
      customerName: customerName || 'Customer',
      phone: phone || '',
      email: email || '',
      status: 'RECEIVED',
      notes: notes || '',
      totalAmount: Number(totalAmount) || 0,
      isPaid: true,
      createdAt,
      items
    };

    broadcastEvent('NEW_ORDER', createdOrder);
    res.status(201).json(createdOrder);
  } catch (err) {
    console.error('API /api/orders Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Advance / Update order status ('RECEIVED' -> 'IN_OVEN' -> 'READY' -> 'SERVED')
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedAt = new Date().toISOString();

    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id);

    if (status === 'SERVED') {
      db.prepare("UPDATE receipts SET payment_status = 'PAID' WHERE order_id = ?").run(id);
      db.prepare("UPDATE orders SET is_paid = 1 WHERE id = ?").run(id);
    }

    const updatedOrders = fetchAllOrders();
    broadcastEvent('UPDATE_ORDER', { orderId: id, status, orders: updatedOrders });
    res.json({ id, status, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin Confirm Payment Endpoint
app.patch('/api/orders/:id/confirm-payment', (req, res) => {
  try {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    db.prepare("UPDATE orders SET is_paid = 1, status = 'IN_OVEN', updated_at = ? WHERE id = ?").run(updatedAt, id);
    db.prepare("UPDATE receipts SET payment_status = 'PAID' WHERE order_id = ?").run(id);

    const updatedOrders = fetchAllOrders();
    broadcastEvent('UPDATE_ORDER', { orderId: id, status: 'IN_OVEN', isPaid: true, orders: updatedOrders });
    res.json({ id, success: true, status: 'IN_OVEN', isPaid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update order payment status
app.patch('/api/orders/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    const paymentStatus = isPaid ? 'PAID' : 'UNPAID';
    db.prepare('UPDATE orders SET is_paid = ? WHERE id = ?').run(isPaid ? 1 : 0, id);
    db.prepare('UPDATE receipts SET payment_status = ? WHERE order_id = ?').run(paymentStatus, id);

    const updatedOrders = fetchAllOrders();
    broadcastEvent('UPDATE_ORDER', { orderId: id, isPaid, orders: updatedOrders });
    res.json({ id, isPaid, paymentStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Delete / Archive order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);

    const updatedOrders = fetchAllOrders();
    broadcastEvent('UPDATE_ORDER', { action: 'DELETE', orderId: id, orders: updatedOrders });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// CUSTOMER CRM & MARKETING EXCEL EXPORT API
// =========================================

// Helper to get aggregated customer list
function getAggregatedCustomers() {
  const orders = db.prepare('SELECT customer_name, phone, email, total_amount, type, created_at FROM orders ORDER BY created_at DESC').all();

  const customerMap = {};

  orders.forEach(ord => {
    const phoneKey = (ord.phone && ord.phone.trim()) ? ord.phone.trim() : (ord.customer_name || 'Walk-in Customer');
    const name = ord.customer_name || 'Customer';
    const amount = Number(ord.total_amount) || 0;

    if (!customerMap[phoneKey]) {
      customerMap[phoneKey] = {
        name,
        phone: ord.phone || 'N/A',
        email: ord.email || 'N/A',
        totalOrders: 0,
        totalSpent: 0,
        lastVisit: ord.created_at,
        lastType: ord.type
      };
    }

    customerMap[phoneKey].totalOrders += 1;
    customerMap[phoneKey].totalSpent += amount;
  });

  return Object.values(customerMap);
}

// 1. Get Customer Directory List
app.get('/api/customers', (req, res) => {
  try {
    const customers = getAggregatedCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Export Customer Contacts to Excel Compatible CSV File
app.get('/api/customers/export', (req, res) => {
  try {
    const customers = getAggregatedCustomers();

    let csvContent = 'Customer Name,Mobile Phone Number,Email Address,Total Orders Placed,Total Spent (INR),Last Visit Date,Last Order Type\n';

    customers.forEach(c => {
      const cleanName = `"${(c.name || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const cleanEmail = `"${(c.email || '').replace(/"/g, '""')}"`;
      const dateStr = new Date(c.lastVisit).toLocaleString();
      csvContent += `${cleanName},${cleanPhone},${cleanEmail},${c.totalOrders},${c.totalSpent},"${dateStr}",${c.lastType}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pizzoo_customer_contacts.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).send('Error generating customer CSV export: ' + err.message);
  }
});

// =========================================
// SYSTEM BACKUP & RESET ALL DATA API
// =========================================

// 1. Export Complete Sales & Receipts Backup CSV File
app.get('/api/export-all-data', (req, res) => {
  try {
    const allOrders = fetchAllOrders();

    let csv = 'Invoice ID,Table / Location,Order Type,Customer Name,Mobile Phone,Email Address,Order Status,Payment Status,Total Bill Amount (INR),Order Date & Time,Purchased Items Summary\n';

    allOrders.forEach(o => {
      const itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.name} (${i.size || 'Standard'})`).join(' | ');
      const cleanName = `"${(o.customerName || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(o.phone || '').replace(/"/g, '""')}"`;
      const cleanEmail = `"${(o.email || '').replace(/"/g, '""')}"`;
      const cleanItems = `"${itemsSummary.replace(/"/g, '""')}"`;
      const dateStr = new Date(o.createdAt).toLocaleString();

      csv += `${o.id},${o.tableNo},${o.type},${cleanName},${cleanPhone},${cleanEmail},${o.status},${o.isPaid ? 'PAID' : 'PENDING'},${o.totalAmount},"${dateStr}",${cleanItems}\n`;
    });

    const filename = `pizzoo_full_sales_backup_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).send('Error exporting full sales backup: ' + err.message);
  }
});

// 2. Reset System - Wipe Orders & Receipts to Fresh 0 Start
app.post('/api/reset-all-data', (req, res) => {
  try {
    const clearTransaction = db.transaction(() => {
      db.prepare('DELETE FROM order_items').run();
      db.prepare('DELETE FROM orders').run();
      db.prepare('DELETE FROM receipts').run();
    });

    clearTransaction();

    broadcastEvent('UPDATE_ORDER', { action: 'RESET_ALL', orders: [] });
    res.json({ success: true, message: 'All sales data, receipts, and active kitchen orders have been reset to 0 for a fresh start!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// RECEIPTS & SALES ANALYTICS API
// =========================================

// 1. Get Receipts Archive with filters
app.get('/api/receipts', (req, res) => {
  try {
    const { search, date } = req.query;

    let query = 'SELECT * FROM receipts';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(receipt_number LIKE ? OR order_id LIKE ? OR table_no LIKE ? OR customer_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (date) {
      conditions.push("date(created_at) = date(?)");
      params.push(date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    const receipts = rows.map(r => ({
      id: r.id,
      receiptNumber: r.receipt_number,
      orderId: r.order_id,
      tableNo: r.table_no,
      type: r.type,
      customerName: r.customer_name,
      email: r.email || '',
      items: JSON.parse(r.items_json || '[]'),
      totalPrice: r.total_price,
      paymentStatus: r.payment_status,
      createdAt: r.created_at
    }));

    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Sales Analytics Dashboard Metrics
app.get('/api/analytics', (req, res) => {
  try {
    const allReceipts = db.prepare('SELECT * FROM receipts ORDER BY created_at DESC').all();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;

    let dineInCount = 0;
    let takeoutCount = 0;

    const itemSalesMap = {};
    const toppingSalesMap = {};

    allReceipts.forEach(rec => {
      const price = Number(rec.total_price) || 0;
      const recDateStr = rec.created_at.split('T')[0];

      if (recDateStr === todayStr) {
        revenueToday += price;
      }
      if (rec.created_at >= sevenDaysAgo) {
        revenueWeek += price;
      }
      if (rec.created_at >= thirtyDaysAgo) {
        revenueMonth += price;
      }

      if (rec.type === 'DINE_IN') dineInCount++;
      else takeoutCount++;

      // Parse items
      try {
        const items = JSON.parse(rec.items_json || '[]');
        items.forEach(it => {
          const name = it.name || 'Unknown Pizza';
          const qty = Number(it.quantity) || 1;
          const subtotal = Number(it.subtotal || (it.price * qty)) || 0;

          if (!itemSalesMap[name]) {
            itemSalesMap[name] = { name, totalQty: 0, totalRevenue: 0 };
          }
          itemSalesMap[name].totalQty += qty;
          itemSalesMap[name].totalRevenue += subtotal;

          // Count toppings
          if (Array.isArray(it.toppings)) {
            it.toppings.forEach(top => {
              toppingSalesMap[top] = (toppingSalesMap[top] || 0) + qty;
            });
          }
        });
      } catch (e) {}
    });

    const topPizzas = Object.values(itemSalesMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    const topToppings = Object.entries(toppingSalesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      revenueToday,
      revenueWeek,
      revenueMonth,
      totalOrders: allReceipts.length,
      dineInCount,
      takeoutCount,
      topPizzas,
      topToppings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🍕 Pizzoo Italian Pizzeria Backend running at http://localhost:${PORT}`);
});
