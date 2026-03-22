import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import DatabaseClass from 'better-sqlite3';
const Database = (DatabaseClass as any).default || DatabaseClass;
import { v4 as uuidv4 } from 'uuid';
import { getDatabaseService } from './src/services/dbService';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './src/services/supabaseClient';
import { apiLimiter, authenticate, errorHandler } from './src/middleware/api';
import { z } from 'zod';
import { accountSchema, stockSchema, jobSchema } from './src/middleware/validation';

const validate = (schema: z.ZodObject<any>) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error: any) {
    return res.status(400).json({ status: 400, message: 'Validation Error', errors: error.errors });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'local.db');
let db: any;

// Diagnostic logs for API keys
console.log("[System] Checking API Keys...");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
console.log("- PERPLEXITY_API_KEY:", process.env.PERPLEXITY_API_KEY ? "Set" : "Not Set");
console.log("- GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Set" : "Not Set");
console.log("- API_KEY:", process.env.API_KEY ? "Set" : "Not Set");

// Helper functions for notifications and events
const createNotification = (title: string, message: string, type: 'alert' | 'success' | 'info' | 'system', related_id?: string) => {
  if (!db) return null;
  const id = uuidv4();
  const date = new Date().toISOString();
  try {
    db.prepare('INSERT INTO notifications (id, title, message, date, type, related_id) VALUES (?, ?, ?, ?, ?, ?)').run(id, title, message, date, type, related_id || null);
    return id;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

const createEvent = (title: string, date: string, type: 'meeting' | 'deadline' | 'reminder' | 'production', time?: string, location?: string, description?: string, related_id?: string) => {
  if (!db) return null;
  const id = uuidv4();
  try {
    db.prepare(`
      INSERT INTO events (id, title, date, time, location, type, description, related_id, attendees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, date, time || null, location || null, type, description || null, related_id || null, 0);
    return id;
  } catch (err) {
    console.error('Error creating event:', err);
    return null;
  }
};

async function startServer() {
  console.log('Starting server...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Database path:', dbPath);
  // Initialize Database
  try {
    console.log('Attempting to initialize database...');
    const fs = await import('fs');
    console.log('Checking database path:', dbPath);
    if (fs.existsSync(dbPath)) {
      console.log('Database file exists.');
    } else {
      console.log('Database file does not exist, will be created.');
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        console.log('Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    db = new Database(dbPath);
    console.log('Database initialized successfully.');
    // Initialize DB schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        series TEXT,
        status TEXT DEFAULT 'Aktif'
      );

      CREATE TABLE IF NOT EXISTS stocks (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        status TEXT DEFAULT 'Aktif'
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        receipt_no TEXT NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'OUTGOING' or 'INCOMING'
        status TEXT DEFAULT 'Açık', -- 'Açık', 'Kısmi', 'Tamamlandı'
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS job_items (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price REAL DEFAULT 0,
        received_qty INTEGER DEFAULT 0,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        job_item_id TEXT,
        stock_id TEXT NOT NULL,
        account_id TEXT,
        type TEXT NOT NULL, -- 'OUT' (to supplier) or 'IN' (from supplier)
        qty INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(job_item_id) REFERENCES job_items(id),
        FOREIGN KEY(stock_id) REFERENCES stocks(id),
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'INCOMING' (Tahsilat) or 'OUTGOING' (Tediye)
        description TEXT,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        attendees INTEGER,
        type TEXT NOT NULL, -- 'meeting', 'deadline', 'reminder', 'production'
        description TEXT,
        related_id TEXT, -- ID of related job or account
        is_completed INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        total_budget REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        model TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id)
      );

      CREATE TABLE IF NOT EXISTS ai_memories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        category TEXT,
        last_accessed TEXT
      );

      CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        title TEXT,
        content TEXT,
        data TEXT,
        priority TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        description TEXT,
        due_at TEXT,
        status TEXT,
        action_type TEXT,
        action_payload TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_system_snapshots (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        snapshot_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_action_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT,
        target_table TEXT,
        target_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_learning_data (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        data_type TEXT,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        personality TEXT,
        learning_level INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'completed'
        priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
        related_id TEXT,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        target_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS daily_planner (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        item_key TEXT NOT NULL,
        time_range TEXT,
        morning_status INTEGER DEFAULT 0, -- 0: empty, 1: completed, 2: partial
        evening_status INTEGER DEFAULT 0, -- 0: empty, 1: completed, 2: partial
        description TEXT,
        detail TEXT,
        sort_order INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        related_id TEXT NOT NULL,
        related_type TEXT NOT NULL, -- 'task', 'note', 'planner', 'reminder'
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_data TEXT NOT NULL, -- Base64 data
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_summaries (
        date TEXT PRIMARY KEY,
        summary TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL, -- 'alert', 'success', 'info', 'system'
        is_read INTEGER DEFAULT 0,
        related_id TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase_requests (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, ordered, received, cancelled
        requested_by TEXT,
        department TEXT,
        priority TEXT DEFAULT 'normal',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_request_items (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        estimated_price REAL,
        supplier_id TEXT,
        FOREIGN KEY (request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id),
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_plans (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft', -- draft, confirmed, ordered, cancelled
        title TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchase_plan_items (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        request_item_id TEXT, -- Optional, can be linked to a specific request item
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        estimated_price REAL,
        supplier_id TEXT,
        FOREIGN KEY (plan_id) REFERENCES purchase_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (request_item_id) REFERENCES purchase_request_items(id),
        FOREIGN KEY (stock_id) REFERENCES stocks(id),
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_quotes (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        date TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES purchase_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_quote_items (
        id TEXT PRIMARY KEY,
        quote_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES purchase_quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open', -- open, completed, cancelled
        supplier_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES accounts(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        qty REAL NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );

      CREATE TABLE IF NOT EXISTS system_logs (
        id TEXT PRIMARY KEY,
        level TEXT NOT NULL,
        module TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        user_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflow_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        module TEXT NOT NULL,
        config TEXT NOT NULL,
        status TEXT DEFAULT 'Draft',
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflow_instances (
        id TEXT PRIMARY KEY,
        definition_id TEXT NOT NULL,
        current_state TEXT NOT NULL,
        context TEXT,
        history TEXT,
        started_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (definition_id) REFERENCES workflow_definitions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        recipient_name TEXT NOT NULL,
        delivery_address TEXT,
        invoice_address TEXT,
        carrier_name TEXT,
        vehicle_info TEXT,
        logistics_cost_amount REAL,
        logistics_cost_currency TEXT,
        departure_date TEXT,
        delivery_date TEXT,
        scheduled_date TEXT,
        priority TEXT,
        status TEXT,
        transport_method TEXT,
        shipment_type TEXT,
        extra_details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shipment_movements (
        id TEXT PRIMARY KEY,
        shipment_id TEXT NOT NULL,
        status TEXT NOT NULL,
        location TEXT,
        description TEXT,
        movement_date TEXT,
        file_paths TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
      );
    `);

    // Migrations / Column Checks
    const shipmentsTableInfo = db.prepare("PRAGMA table_info(shipments)").all() as any[];
    
    // Force migration if it's the old schema
    if (shipmentsTableInfo.some(c => c.name === 'job_id')) {
        // Rename the old table
        db.exec("ALTER TABLE shipments RENAME TO shipments_old");
        // Create the new table
        db.exec(`
          CREATE TABLE shipments (
            id TEXT PRIMARY KEY,
            recipient_name TEXT NOT NULL,
            delivery_address TEXT,
            invoice_address TEXT,
            carrier_name TEXT,
            vehicle_info TEXT,
            logistics_cost_amount REAL,
            logistics_cost_currency TEXT,
            departure_date TEXT,
            delivery_date TEXT,
            scheduled_date TEXT,
            priority TEXT,
            status TEXT,
            transport_method TEXT,
            shipment_type TEXT,
            extra_details TEXT,
            pallets TEXT,
            products TEXT,
            notes TEXT,
            documents TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("Renamed shipments table to shipments_old and created new shipments table.");
    }

    const shipmentColumns = [
      { name: 'pallets', type: 'TEXT' },
      { name: 'products', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'documents', type: 'TEXT' }
    ];

    const shipmentTableInfo = db.prepare("PRAGMA table_info(shipments)").all() as any[];
    const existingShipmentColumns = shipmentTableInfo.map(c => c.name);

    shipmentColumns.forEach(col => {
      if (!existingShipmentColumns.includes(col.name)) {
        try {
          db.exec(`ALTER TABLE shipments ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to shipments table`);
        } catch (err) {
          console.error(`Error adding column ${col.name}:`, err);
        }
      }
    });

    const columns = [
      { name: 'address', type: 'TEXT' },
      { name: 'tax_office', type: 'TEXT' },
      { name: 'tax_number', type: 'TEXT' },
      { name: 'authorized_person', type: 'TEXT' },
      { name: 'website', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'payment_term_days', type: 'INTEGER DEFAULT 0' }
    ];

    const tableInfo = db.prepare("PRAGMA table_info(accounts)").all() as any[];
    const existingColumns = tableInfo.map(c => c.name);

    columns.forEach(col => {
      if (!existingColumns.includes(col.name)) {
        try {
          db.exec(`ALTER TABLE accounts ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to accounts table`);
        } catch (err) {
          console.error(`Error adding column ${col.name}:`, err);
        }
      }
    });

    const stockColumns = [
      { name: 'critical_level', type: 'INTEGER DEFAULT 0' },
      { name: 'barcode', type: 'TEXT' },
      { name: 'brand', type: 'TEXT' },
      { name: 'model', type: 'TEXT' },
      { name: 'purchase_price', type: 'REAL DEFAULT 0' },
      { name: 'sale_price', type: 'REAL DEFAULT 0' },
      { name: 'tax_rate', type: 'INTEGER DEFAULT 18' },
      { name: 'location', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'status', type: "TEXT DEFAULT 'Aktif'" }
    ];

    const stockTableInfo = db.prepare("PRAGMA table_info(stocks)").all() as any[];
    const existingStockColumns = stockTableInfo.map(c => c.name);

    stockColumns.forEach(col => {
      if (!existingStockColumns.includes(col.name)) {
        try {
          db.exec(`ALTER TABLE stocks ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to stocks table`);
        } catch (err) {
          console.error(`Error adding column ${col.name} to stocks:`, err);
        }
      }
    });

    try { db.prepare('ALTER TABLE daily_planner ADD COLUMN time_range TEXT').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE notes ADD COLUMN target_date TEXT').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE tasks ADD COLUMN sort_order INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE tasks ADD COLUMN is_archived INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE notes ADD COLUMN sort_order INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE notes ADD COLUMN is_archived INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE daily_planner ADD COLUMN sort_order INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE daily_planner ADD COLUMN is_archived INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE events ADD COLUMN sort_order INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE events ADD COLUMN is_archived INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }
    try { db.prepare('ALTER TABLE events ADD COLUMN is_completed INTEGER DEFAULT 0').run(); } catch (e: any) { if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message); }

    const plannerColumnsToAdd = [
      { name: 'priority', type: 'INTEGER DEFAULT 0' },
      { name: 'category', type: 'TEXT' },
      { name: 'estimated_time', type: 'TEXT' },
      { name: 'actual_time', type: 'TEXT' },
      { name: 'assigned_to', type: 'TEXT' },
      { name: 'recurrence', type: 'TEXT' },
      { name: 'color_tag', type: 'TEXT' },
      { name: 'sub_tasks', type: 'TEXT' },
      { name: 'comments', type: 'TEXT' },
      { name: 'url', type: 'TEXT' }
    ];

    const plannerTableInfo = db.prepare("PRAGMA table_info(daily_planner)").all() as any[];
    const existingPlannerColumns = plannerTableInfo.map(c => c.name);

    for (const col of plannerColumnsToAdd) {
      if (!existingPlannerColumns.includes(col.name)) {
        try {
          db.prepare(`ALTER TABLE daily_planner ADD COLUMN ${col.name} ${col.type}`).run();
        } catch (e: any) {
          if (!e.message.includes('duplicate column name')) console.error('Migration error:', e.message);
        }
      }
    }

    // Seed initial data if empty
    const countSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
    if (countSettings.count === 0) {
      const defaultSettings = [
        { key: 'user_name', value: 'Engin Nalbant' },
        { key: 'user_email', value: 'enginnalbant9@gmail.com' },
        { key: 'user_phone', value: '+90 555 000 00 00' },
        { key: 'user_dept', value: 'Yönetim' },
        { key: 'user_bio', value: 'Sistem Yöneticisi ve Nexus OS Kurucusu.' },
        { key: 'theme', value: 'dark' },
        { key: 'accent_color', value: '#00F2FF' },
        { key: 'sidebar_default', value: 'expanded' },
        { key: 'font_size', value: 'medium' },
        { key: 'compact_mode', value: 'false' },
        { key: 'glass_intensity', value: 'medium' },
        { key: 'notif_email', value: 'true' },
        { key: 'notif_push', value: 'true' },
        { key: 'notif_sound', value: 'true' },
        { key: 'notif_stock', value: 'true' },
        { key: 'notif_job', value: 'true' },
        { key: 'notif_payment', value: 'true' },
        { key: 'security_2fa', value: 'false' },
        { key: 'security_timeout', value: '30' },
        { key: 'security_login_emails', value: 'true' },
        { key: 'sys_currency', value: 'TRY' },
        { key: 'sys_date_format', value: 'DD.MM.YYYY' },
        { key: 'sys_lang', value: 'tr' },
        { key: 'sys_autosave', value: '60' },
        { key: 'border_radius', value: 'medium' },
        { key: 'sidebar_style', value: 'glass' },
        { key: 'card_style', value: 'glass' },
        { key: 'animation_speed', value: 'normal' },
        { key: 'background_pattern', value: 'mesh' },
        { key: 'font_family', value: 'sans' },
        { key: 'high_contrast', value: 'false' },
        { key: 'sidebar_position', value: 'left' },
        { key: 'header_style', value: 'glass' },
        { key: 'content_width', value: 'full' },
        { key: 'shadow_intensity', value: 'soft' },
        { key: 'glow_effects', value: 'true' }
      ];
      const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
      defaultSettings.forEach(s => insertSetting.run(s.key, s.value));
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
  console.log('Starting server...');
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting (Cloud Run/Nginx environment)
  app.set('trust proxy', 1);

  // Security & Logging Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development/iframe compatibility
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  
  // Rate Limiting for API
  app.use('/api/', apiLimiter);

  // API Routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/docs', (req, res) => res.sendFile(path.join(__dirname, 'public', 'api-docs.json')));

  app.get('/api/schema', (req, res) => {
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const schema: any = {};
      for (const table of tables as any[]) {
        schema[table.name] = db.prepare(`PRAGMA table_info(${table.name})`).all();
      }
      res.json(schema);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/debug/shipments-schema', (req, res) => {
    try {
      const schema = db.prepare("PRAGMA table_info(shipments)").all();
      res.json(schema);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Shipments
  app.get('/api/shipments', (req, res) => {
    try {
      const shipments = db.prepare('SELECT * FROM shipments').all();
      const shipmentsWithMovements = shipments.map((s: any) => ({
        ...s,
        recipient: { name: s.recipient_name, deliveryAddress: s.delivery_address, invoiceAddress: s.invoice_address },
        carrier: { name: s.carrier_name, vehicleInfo: s.vehicle_info },
        logisticsCost: { amount: s.logistics_cost_amount, currency: s.logistics_cost_currency },
        pallets: s.pallets ? JSON.parse(s.pallets) : [],
        products: s.products ? JSON.parse(s.products) : [],
        notes: s.notes ? JSON.parse(s.notes) : [],
        documents: s.documents ? JSON.parse(s.documents) : [],
        movements: db.prepare('SELECT * FROM shipment_movements WHERE shipment_id = ? ORDER BY created_at DESC').all(s.id)
      }));
      res.json(shipmentsWithMovements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/shipments', (req, res) => {
    const { 
      id, recipient, carrier, logisticsCost, departureDate, deliveryDate, scheduledDate, 
      priority, status, transportMethod, shipmentType, extraDetails, 
      pallets, products, notes, documents 
    } = req.body;
    const shipmentId = id || uuidv4();
    try {
      db.prepare(`
        INSERT INTO shipments (
          id, recipient_name, delivery_address, invoice_address, carrier_name, vehicle_info,
          logistics_cost_amount, logistics_cost_currency, departure_date, delivery_date, scheduled_date,
          priority, status, transport_method, shipment_type, extra_details,
          pallets, products, notes, documents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shipmentId, recipient.name, recipient.deliveryAddress, recipient.invoiceAddress, carrier.name, carrier.vehicleInfo,
        logisticsCost.amount, logisticsCost.currency, departureDate, deliveryDate, scheduledDate,
        priority, status, transportMethod, shipmentType, extraDetails,
        JSON.stringify(pallets || []), JSON.stringify(products || []), JSON.stringify(notes || []), JSON.stringify(documents || [])
      );
      res.json({ success: true, id: shipmentId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shipments/:id/movements', (req, res) => {
    const { status, location, description, movementDate, filePaths } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO shipment_movements (id, shipment_id, status, location, description, movement_date, file_paths)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.params.id, status, location, description, movementDate, JSON.stringify(filePaths || []));
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/shipments/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare(`UPDATE shipments SET status = ? WHERE id = ?`).run(status, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.all('/api/events/:id', (req, res, next) => {
    console.log(`REQUEST to /api/events/${req.params.id} [${req.method}]`);
    next();
  });

  app.get('/api/events', (req, res) => {
    console.log('Fetching all events');
    try {
      const events = db.prepare('SELECT * FROM events').all();
      console.log('Fetched events:', events);
      res.json(events);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events/:id', (req, res) => {
    try {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
      if (event) res.json(event);
      else res.status(404).json({ error: 'Event not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/events', (req, res) => {
    const { title, date, time, location, attendees, type, description, related_id } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO events (id, title, date, time, location, attendees, type, description, related_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, date, time || null, location || null, attendees || null, type, description || null, related_id || null);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/events/:id', (req, res) => {
    const { title, date, time, location, attendees, type, description, is_completed, sort_order, is_archived } = req.body;
    try {
      db.prepare(`
        UPDATE events 
        SET title = COALESCE(?, title), 
            date = COALESCE(?, date), 
            time = COALESCE(?, time), 
            location = COALESCE(?, location), 
            attendees = COALESCE(?, attendees), 
            type = COALESCE(?, type), 
            description = COALESCE(?, description),
            is_completed = COALESCE(?, is_completed),
            sort_order = COALESCE(?, sort_order),
            is_archived = COALESCE(?, is_archived)
        WHERE id = ?
      `).run(title, date, time, location, attendees, type, description, is_completed, sort_order, is_archived, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/events/:id', (req, res) => {
    console.log(`DELETE /api/events/${req.params.id}`);
    try {
      db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error deleting event ${req.params.id}:`, err);
      res.status(400).json({ error: err.message });
    }
  });
  
  // Accounts
  app.get('/api/accounts', async (req, res) => {
    console.log('GET /api/accounts');
    try {
      const service = getDatabaseService();
      const accounts = await service.getAccounts();
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/accounts', validate(accountSchema), async (req, res) => {
    try {
      const service = getDatabaseService();
      const id = await service.createAccount(req.body);
      res.status(201).json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/dashboard/summary', (req, res) => {
    console.log('GET /api/dashboard/summary');
    try {
      // Accounts Summary
      const accounts = db.prepare('SELECT id, payment_term_days FROM accounts').all();
      let totalCost = 0;
      let totalPayment = 0;
      let totalOverdue = 0;
      const now = new Date();

      for (const a of accounts) {
        const termDays = a.payment_term_days || 0;
        const jobs = db.prepare(`
          SELECT j.date, COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
          GROUP BY j.id
        `).all(a.id);

        const paymentsRow = db.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id) as any;
        const accountPayment = paymentsRow ? paymentsRow.total_payment : 0;
        
        let accountCost = 0;
        let sumOverdueCosts = 0;
        for (const job of jobs) {
          accountCost += job.cost;
          const dueDate = new Date(new Date(job.date).getTime() + termDays * 24 * 60 * 60 * 1000);
          if (dueDate <= now) sumOverdueCosts += job.cost;
        }

        totalCost += accountCost;
        totalPayment += accountPayment;
        totalOverdue += Math.max(0, sumOverdueCosts - accountPayment);
      }

      // Stocks Summary
      const totalStocks = db.prepare('SELECT COUNT(*) as count FROM stocks').get() as any;
      const criticalStocks = db.prepare(`
        SELECT COUNT(*) as count FROM (
          SELECT s.id, s.critical_level, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
          FROM stocks s
          LEFT JOIN stock_movements sm ON s.id = sm.stock_id
          GROUP BY s.id
          HAVING balance <= s.critical_level
        )
      `).get() as any;

      // Jobs Summary
      const openJobs = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status != 'Tamamlandı'").get() as any;
      const completedJobs = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'Tamamlandı'").get() as any;

      // Recent Activities
      const recentMovements = db.prepare(`
        SELECT sm.*, s.name as stock_name, a.name as account_name
        FROM stock_movements sm
        JOIN stocks s ON sm.stock_id = s.id
        LEFT JOIN accounts a ON sm.account_id = a.id
        ORDER BY sm.date DESC LIMIT 5
      `).all();

      const recentPayments = db.prepare(`
        SELECT p.*, a.name as account_name
        FROM payments p
        JOIN accounts a ON p.account_id = a.id
        ORDER BY p.date DESC LIMIT 5
      `).all();

      // Top Accounts by Balance
      const topAccounts = db.prepare('SELECT id, name, type FROM accounts').all().map((a: any) => {
        const cost = db.prepare(`
          SELECT COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
        `).get(a.id) as any;
        
        const payment = db.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id) as any;
        
        return {
          ...a,
          balance: (cost?.cost || 0) - (payment?.total_payment || 0)
        };
      }).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 5);

      // Top Stocks by Movement
      const topStocks = db.prepare(`
        SELECT s.id, s.name, s.code, COUNT(sm.id) as movement_count
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
        ORDER BY movement_count DESC LIMIT 5
      `).all();

      // Category Distribution
      const categoryDistribution = db.prepare(`
        SELECT category as name, COUNT(*) as value
        FROM stocks
        GROUP BY category
      `).all();

      // Monthly Trends (Last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
        const monthYear = d.toISOString().slice(0, 7); // YYYY-MM
        
        const completedCount = db.prepare(`
          SELECT COUNT(*) as count FROM jobs 
          WHERE status = 'Tamamlandı' AND date LIKE ?
        `).get(`${monthYear}%`) as any;
        
        const openCount = db.prepare(`
          SELECT COUNT(*) as count FROM jobs 
          WHERE status != 'Tamamlandı' AND date LIKE ?
        `).get(`${monthYear}%`) as any;

        monthlyTrends.push({
          name: monthName,
          completed: completedCount.count,
          open: openCount.count
        });
      }

      // Upcoming Deadlines / Overdue Jobs
      const upcomingDeadlines = db.prepare(`
        SELECT j.receipt_no, j.date, a.name as supplier_name, j.status
        FROM jobs j
        JOIN accounts a ON j.account_id = a.id
        WHERE j.status != 'Tamamlandı'
        ORDER BY j.date ASC LIMIT 5
      `).all();

      // Account Type Distribution
      const accountTypeDistribution = db.prepare(`
        SELECT type as name, COUNT(*) as value
        FROM accounts
        GROUP BY type
      `).all();

      // Total Stock Value (Estimate)
      const totalStockValue = db.prepare(`
        SELECT SUM(balance * purchase_price) as value FROM (
          SELECT s.purchase_price, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
          FROM stocks s
          LEFT JOIN stock_movements sm ON s.id = sm.stock_id
          GROUP BY s.id
        )
      `).get() as any;

      // Check for critical stocks and create notifications
      const criticalStockItems = db.prepare(`
        SELECT s.id, s.name, s.critical_level, COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE -sm.qty END), 0) as balance
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
        HAVING balance <= s.critical_level
      `).all() as any[];

      for (const stock of criticalStockItems) {
        const existingNotif = db.prepare('SELECT id FROM notifications WHERE related_id = ? AND is_read = 0').get(stock.id);
        if (!existingNotif) {
          createNotification(
            'Kritik Stok Uyarısı',
            `${stock.name} stok miktarı kritik seviyenin (${stock.critical_level}) altına düştü! Güncel: ${stock.balance}`,
            'alert',
            stock.id
          );
        }
      }

      // Purchasing Summary
      const pendingPurchaseRequests = db.prepare("SELECT COUNT(*) as count FROM purchase_requests WHERE status = 'pending'").get() as any;
      const openPurchaseOrders = db.prepare("SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'open'").get() as any;
      const totalPurchaseSpend = db.prepare(`
        SELECT SUM(poi.qty * poi.price) as total
        FROM purchase_orders po
        JOIN purchase_order_items poi ON po.id = poi.order_id
        WHERE po.status != 'cancelled'
      `).get() as any;

      // Shipments Summary
      const activeShipments = db.prepare("SELECT COUNT(*) as count FROM shipments WHERE status NOT IN ('Teslim Edildi', 'İptal')").get() as any;

      // Tasks Summary
      const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed' AND is_archived = 0").get() as any;

      // Budget Summary
      const activeBudget = db.prepare("SELECT * FROM budgets WHERE period_start <= ? AND period_end >= ? ORDER BY period_start DESC LIMIT 1").get(new Date().toISOString(), new Date().toISOString()) as any;
      let budgetSpent = 0;
      if (activeBudget) {
        const spent = db.prepare(`
          SELECT SUM(amount) as total
          FROM payments
          WHERE type = 'OUTGOING' AND date >= ? AND date <= ?
        `).get(activeBudget.period_start, activeBudget.period_end) as any;
        budgetSpent = spent?.total || 0;
      }

      res.json({
        accounts: {
          total: accounts.length,
          totalCost,
          totalPayment,
          netBalance: totalCost - totalPayment,
          totalOverdue,
          top: topAccounts,
          distribution: accountTypeDistribution
        },
        stocks: {
          total: totalStocks.count,
          critical: criticalStocks.count,
          top: topStocks,
          distribution: categoryDistribution,
          totalValue: totalStockValue.value || 0
        },
        jobs: {
          open: openJobs.count,
          completed: completedJobs.count,
          trends: monthlyTrends,
          upcoming: upcomingDeadlines
        },
        purchasing: {
          pendingRequests: pendingPurchaseRequests?.count || 0,
          openOrders: openPurchaseOrders?.count || 0,
          totalSpend: totalPurchaseSpend?.total || 0
        },
        shipments: {
          active: activeShipments?.count || 0
        },
        tasks: {
          pending: pendingTasks?.count || 0
        },
        budget: {
          active: activeBudget || null,
          spent: budgetSpent
        },
        recentActivities: {
          movements: recentMovements,
          payments: recentPayments
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts', async (req, res) => {
    const { 
      name, type, phone, email, series, 
      address, tax_office, tax_number, authorized_person, 
      website, description, payment_term_days 
    } = req.body;
    const id = uuidv4();
    const paymentTermDays = parseInt(String(payment_term_days)) || 0;
    try {
      db.prepare(`
        INSERT INTO accounts (
          id, name, type, phone, email, series, 
          address, tax_office, tax_number, authorized_person, 
          website, description, payment_term_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, name, type, phone, email, series,
        address || null, tax_office || null, tax_number || null,
        authorized_person || null, website || null, description || null,
        paymentTermDays
      );
      
      if (supabase) {
        try {
          await supabase.from('accounts').insert([{ 
            id, name, type, phone, email, series, status: 'Aktif',
            address, tax_office, tax_number, authorized_person, 
            website, description, payment_term_days: payment_term_days || 0
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      
      res.json({ id, name, type, phone, email, series, status: 'Aktif' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/accounts/:id', async (req, res) => {
    const { 
      name, type, phone, email, series, status,
      address, tax_office, tax_number, authorized_person, 
      website, description, payment_term_days
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const paymentTermDays = parseInt(String(payment_term_days)) || 0;

    try {
      const info = db.prepare(`
        UPDATE accounts SET 
          name = ?, type = ?, phone = ?, email = ?, series = ?, status = ?,
          address = ?, tax_office = ?, tax_number = ?, authorized_person = ?, 
          website = ?, description = ?, payment_term_days = ?
        WHERE id = ?
      `).run(
        name, type, phone || null, email || null, series || null, status || 'Aktif',
        address || null, tax_office || null, tax_number || null,
        authorized_person || null, website || null, description || null,
        paymentTermDays,
        req.params.id
      );
      
      if (info.changes === 0) {
        return res.status(404).json({ error: 'Account not found or no changes made' });
      }
      
      if (supabase) {
        try {
          await supabase.from('accounts').update({ 
            name, type, phone, email, series, status,
            address, tax_office, tax_number, authorized_person, 
            website, description, payment_term_days: payment_term_days || 0
          }).eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      // Check if account has related jobs or payments
      const jobsCount = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE account_id = ?').get(req.params.id) as any;
      const paymentsCount = db.prepare('SELECT COUNT(*) as count FROM payments WHERE account_id = ?').get(req.params.id) as any;
      
      if (jobsCount.count > 0 || paymentsCount.count > 0) {
        return res.status(400).json({ error: 'Bu cari hesaba bağlı işlemler (iş emirleri veya ödemeler) bulunduğu için silinemez. Lütfen önce bağlı işlemleri silin veya cariyi arşivleyin.' });
      }

      db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
      if (supabase) {
        try {
          await supabase.from('accounts').delete().eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/:id/archive', async (req, res) => {
    try {
      db.prepare("UPDATE accounts SET status = 'Arşivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from('accounts').update({ status: 'Arşivlendi' }).eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/bulk', async (req, res) => {
    const accounts = req.body;
    const results = [];
    const insert = db.prepare(`
      INSERT INTO accounts (
        id, name, type, phone, email, series, 
        address, tax_office, tax_number, authorized_person, 
        website, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((items) => {
      for (const item of items) {
        const id = uuidv4();
        insert.run(
          id, item.name, item.type, item.phone, item.email, item.series,
          item.address || null, item.tax_office || null, item.tax_number || null,
          item.authorized_person || null, item.website || null, item.description || null
        );
        results.push({ ...item, id });
      }
    });

    try {
      transaction(accounts);
      if (supabase) {
        try {
          await supabase.from('accounts').insert(results.map(r => ({
            id: r.id, name: r.name, type: r.type, phone: r.phone, email: r.email, series: r.series,
            address: r.address, tax_office: r.tax_office, tax_number: r.tax_number,
            authorized_person: r.authorized_person, website: r.website, description: r.description
          })));
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true, count: results.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/accounts/summary', (req, res) => {
    try {
      const accounts = db.prepare('SELECT * FROM accounts').all();
      
      const result = accounts.map((a: any) => {
        const termDays = a.payment_term_days || 0;
        
        // Get all OUTGOING jobs for this account (Products sent for processing = Cost we owe)
        const jobs = db.prepare(`
          SELECT j.date, COALESCE(SUM(ji.qty * ji.price), 0) as cost
          FROM jobs j
          LEFT JOIN job_items ji ON j.id = ji.job_id
          WHERE j.account_id = ? AND j.type = 'OUTGOING'
          GROUP BY j.id
        `).all(a.id);
        
        // Get total payments made to this account (Net Payment = Tediye - Tahsilat)
        const paymentsRow = db.prepare(`
          SELECT COALESCE(SUM(CASE WHEN type = 'OUTGOING' THEN amount ELSE -amount END), 0) as total_payment
          FROM payments
          WHERE account_id = ?
        `).get(a.id) as any;
        const total_payment = paymentsRow ? paymentsRow.total_payment : 0;
        
        let total_cost = 0;
        let sum_overdue_costs = 0;
        const now = new Date();
        
        for (const job of jobs) {
          total_cost += job.cost;
          const jobDate = new Date(job.date);
          const dueDate = new Date(jobDate.getTime() + termDays * 24 * 60 * 60 * 1000);
          if (dueDate <= now) {
            sum_overdue_costs += job.cost;
          }
        }
        
        const balance = total_cost - total_payment;
        const overdue_debt = Math.max(0, sum_overdue_costs - total_payment);
        
        return {
          ...a,
          total_cost,
          total_payment,
          balance,
          overdue_debt
        };
      });
      
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/accounts/:id/transactions', (req, res) => {
    try {
      const transactions = db.prepare(`
        SELECT 
          j.date, 
          j.receipt_no as document_no, 
          'JOB_ITEM' as record_type,
          j.type as job_type,
          s.name as description,
          ji.qty,
          ji.price,
          (ji.qty * ji.price) as amount
        FROM job_items ji
        JOIN jobs j ON ji.job_id = j.id
        JOIN stocks s ON ji.stock_id = s.id
        WHERE j.account_id = ? AND j.type = 'OUTGOING'
        
        UNION ALL
        
        SELECT 
          date,
          id as document_no,
          'PAYMENT' as record_type,
          type as job_type,
          description,
          1 as qty,
          amount as price,
          amount
        FROM payments
        WHERE account_id = ?
        
        ORDER BY date ASC
      `).all(req.params.id, req.params.id);

      let balance = 0;
      const result = transactions.map((t: any) => {
        // Cost (Tutar): OUTGOING job (İşleme gönderilen ürün)
        // Payment (Ödeme): PAYMENT
        if (t.record_type === 'JOB_ITEM') {
          balance += t.amount; // Borcumuz artar
        } else if (t.record_type === 'PAYMENT') {
          if (t.job_type === 'OUTGOING') {
            balance -= t.amount; // Ödeme yaptık (Tediye), borcumuz azalır
          } else {
            balance += t.amount; // Ödeme aldık (Tahsilat), borcumuz artar (veya alacağımız azalır)
          }
        }
        return {
          ...t,
          balance
        };
      });

      res.json(result.reverse());
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/:id/payments', async (req, res) => {
    const { amount, type, description, date } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO payments (id, account_id, date, amount, type, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, req.params.id, date || new Date().toISOString(), amount, type, description || null);
      
      if (supabase) {
        try {
          await supabase.from('payments').insert([{
            id, account_id: req.params.id, date: date || new Date().toISOString(), amount, type, description
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });



  // Stocks
  app.get('/api/stocks', (req, res) => {
    try {
      const stocks = db.prepare('SELECT * FROM stocks').all();
      res.json(stocks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/stocks', async (req, res) => {
    const { 
      code, name, category, unit, critical_level, 
      barcode, brand, model, purchase_price, sale_price, 
      tax_rate, location, description 
    } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO stocks (
          id, code, name, category, unit, critical_level, 
          barcode, brand, model, purchase_price, sale_price, 
          tax_rate, location, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, code, name, category, unit, critical_level || 0,
        barcode || null, brand || null, model || null, 
        purchase_price || 0, sale_price || 0, tax_rate || 18, 
        location || null, description || null
      );
      
      if (supabase) {
        try {
          await supabase.from('stocks').insert([{ 
            id, code, name, category, unit, critical_level: critical_level || 0,
            barcode, brand, model, purchase_price, sale_price, 
            tax_rate, location, description
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      
      res.json({ id, code, name, category, unit, critical_level });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/bulk', async (req, res) => {
    const stocks = req.body; // Array of stocks
    const results = [];
    
    const insert = db.prepare(`
      INSERT INTO stocks (
        id, code, name, category, unit, critical_level,
        barcode, brand, model, purchase_price, sale_price,
        tax_rate, location, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((items) => {
      for (const item of items) {
        const id = uuidv4();
        insert.run(
          id, item.code, item.name, item.category, item.unit, item.minStock || 0,
          item.barcode || null, item.brand || null, item.model || null,
          item.purchasePrice || 0, item.salePrice || 0, item.taxRate || 18,
          item.location || null, item.description || null
        );
        results.push({ ...item, id });
      }
    });

    try {
      transaction(stocks);
      
      if (supabase) {
        try {
          await supabase.from('stocks').insert(results.map(r => ({
            id: r.id, 
            code: r.code, 
            name: r.name, 
            category: r.category, 
            unit: r.unit, 
            critical_level: r.minStock || 0,
            barcode: r.barcode || null,
            brand: r.brand || null,
            model: r.model || null,
            purchase_price: r.purchasePrice || 0,
            sale_price: r.salePrice || 0,
            tax_rate: r.taxRate || 18,
            location: r.location || null,
            description: r.description || null
          })));
        } catch (err) {
          console.error(err);
        }
      }
      
      res.json({ success: true, count: results.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/stocks/:id', async (req, res) => {
    const { 
      code, name, category, unit, critical_level, 
      barcode, brand, model, purchase_price, sale_price, 
      tax_rate, location, description 
    } = req.body;
    try {
      db.prepare(`
        UPDATE stocks SET 
          code = ?, name = ?, category = ?, unit = ?, critical_level = ?, 
          barcode = ?, brand = ?, model = ?, purchase_price = ?, sale_price = ?, 
          tax_rate = ?, location = ?, description = ?
        WHERE id = ?
      `).run(
        code, name, category, unit, critical_level || 0,
        barcode || null, brand || null, model || null, 
        purchase_price || 0, sale_price || 0, tax_rate || 18, 
        location || null, description || null,
        req.params.id
      );
      
      if (supabase) {
        try {
          await supabase.from('stocks').update({ 
            code, name, category, unit, critical_level: critical_level || 0,
            barcode, brand, model, purchase_price, sale_price, 
            tax_rate, location, description
          }).eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/stocks/:id', async (req, res) => {
    try {
      // Check if stock has movements
      const movementsCount = db.prepare('SELECT COUNT(*) as count FROM stock_movements WHERE stock_id = ?').get(req.params.id) as any;
      if (movementsCount.count > 0) {
        return res.status(400).json({ error: 'Bu stoğa bağlı hareketler bulunduğu için silinemez. Lütfen önce hareketleri silin veya stoğu arşivleyin.' });
      }

      db.prepare('DELETE FROM stocks WHERE id = ?').run(req.params.id);
      if (supabase) {
        try {
          await supabase.from('stocks').delete().eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/:id/archive', async (req, res) => {
    try {
      db.prepare("UPDATE stocks SET status = 'Arşivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from('stocks').update({ status: 'Arşivlendi' }).eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/:id/adjust', async (req, res) => {
    const { qty, type } = req.body; // type: 'IN' or 'OUT'
    const id = uuidv4();
    const date = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO stock_movements (id, stock_id, type, qty, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, req.params.id, type, qty, date);
      
      if (supabase) {
        try {
          await supabase.from('stock_movements').insert([{
            id, stock_id: req.params.id, type, qty, date
          }]);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Jobs
  app.get('/api/jobs', (req, res) => {
    try {
      const jobs = db.prepare(`
        SELECT j.*, a.name as supplier_name, a.series as supplier_series 
        FROM jobs j 
        JOIN accounts a ON j.account_id = a.id
        ORDER BY j.date DESC
      `).all();
      
      const items = db.prepare(`
        SELECT ji.*, s.name as stock_name, s.code as stock_code 
        FROM job_items ji 
        JOIN stocks s ON ji.stock_id = s.id
      `).all();

      const jobsWithItems = jobs.map((j: any) => ({
        ...j,
        items: items.filter((i: any) => i.job_id === j.id)
      }));

      res.json(jobsWithItems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/jobs/open', (req, res) => {
    try {
      const jobs = db.prepare(`
        SELECT j.*, a.name as supplier_name, a.series as supplier_series 
        FROM jobs j 
        JOIN accounts a ON j.account_id = a.id
        WHERE j.status IN ('Açık', 'Kısmi') AND j.type = 'OUTGOING'
        ORDER BY j.date DESC
      `).all();
      
      const items = db.prepare(`
        SELECT ji.*, s.name as stock_name, s.code as stock_code 
        FROM job_items ji 
        JOIN stocks s ON ji.stock_id = s.id
      `).all();

      const jobsWithItems = jobs.map((j: any) => ({
        ...j,
        items: items.filter((i: any) => i.job_id === j.id)
      }));

      res.json(jobsWithItems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/jobs/:id', async (req, res) => {
    try {
      const transaction = db.transaction(() => {
        db.prepare('DELETE FROM stock_movements WHERE job_id = ?').run(req.params.id);
        db.prepare('DELETE FROM job_items WHERE job_id = ?').run(req.params.id);
        db.prepare('DELETE FROM events WHERE related_id = ?').run(req.params.id);
        db.prepare('DELETE FROM notifications WHERE related_id = ?').run(req.params.id);
        db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
      });
      transaction();

      if (supabase) {
        try {
          await supabase.from('stock_movements').delete().eq('job_id', req.params.id);
          await supabase.from('job_items').delete().eq('job_id', req.params.id);
          await supabase.from('jobs').delete().eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/jobs/:id/archive', async (req, res) => {
    try {
      db.prepare("UPDATE jobs SET status = 'Arşivlendi' WHERE id = ?").run(req.params.id);
      if (supabase) {
        try {
          await supabase.from('jobs').update({ status: 'Arşivlendi' }).eq('id', req.params.id);
        } catch (err) {
          console.error(err);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Create Outgoing Job (Ürün Gidişi)
  app.post('/api/jobs/outgoing', async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv4();
    
    const insertJob = db.prepare('INSERT INTO jobs (id, receipt_no, date, account_id, type, status) VALUES (?, ?, ?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO job_items (id, job_id, stock_id, qty, price, received_qty) VALUES (?, ?, ?, ?, ?, ?)');
    const insertMovement = db.prepare('INSERT INTO stock_movements (id, job_id, job_item_id, stock_id, account_id, type, qty, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertEvent = db.prepare('INSERT INTO events (id, title, date, time, type, related_id) VALUES (?, ?, ?, ?, ?, ?)');
    const insertNotification = db.prepare('INSERT INTO notifications (id, title, message, date, type, related_id) VALUES (?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      insertJob.run(jobId, receiptNo, date, accountId, 'OUTGOING', 'Açık');
      
      for (const item of items) {
        const itemId = uuidv4();
        insertItem.run(itemId, jobId, item.stockId, item.qty, item.price || 0, 0);
        insertMovement.run(uuidv4(), jobId, itemId, item.stockId, accountId, 'OUT', item.qty, date);
      }

      // Automatically add to calendar (Deadline based on account payment terms)
      const account = db.prepare('SELECT name, payment_term_days FROM accounts WHERE id = ?').get(accountId) as any;
      const termDays = account?.payment_term_days || 0;
      const dueDate = new Date(new Date(date).getTime() + termDays * 24 * 60 * 60 * 1000).toISOString();
      
      insertEvent.run(uuidv4(), `${receiptNo} - Termin`, dueDate, '17:00', 'deadline', jobId);
      
      // Automatically add notification
      insertNotification.run(uuidv4(), 'Yeni İş Emri', `${receiptNo} numaralı iş emri oluşturuldu. Termin: ${dueDate.split('T')[0]}`, new Date().toISOString(), 'info', jobId);
    });

    transaction();
    
    if (supabase) {
      try {
        await supabase.from('jobs').insert([{ id: jobId, receipt_no: receiptNo, date, account_id: accountId, type: 'OUTGOING', status: 'Açık' }]);
        const jobItemsToInsert = items.map((item: any) => ({
          id: uuidv4(), job_id: jobId, stock_id: item.stockId, qty: item.qty, price: item.price || 0, received_qty: 0
        }));
        await supabase.from('job_items').insert(jobItemsToInsert);
        const movementsToInsert = jobItemsToInsert.map((item: any) => ({
          id: uuidv4(), job_id: jobId, job_item_id: item.id, stock_id: item.stock_id, account_id: accountId, type: 'OUT', qty: item.qty, date
        }));
        await supabase.from('stock_movements').insert(movementsToInsert);
      } catch (err) {
        console.error('Supabase sync error:', err);
      }
    }
    
    res.json({ success: true, jobId });
  });

  // Create Incoming Job (Ürün Gelişi)
  app.post('/api/jobs/incoming', async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv4();
    
    const insertJob = db.prepare('INSERT INTO jobs (id, receipt_no, date, account_id, type, status) VALUES (?, ?, ?, ?, ?, ?)');
    const insertMovement = db.prepare('INSERT INTO stock_movements (id, job_id, job_item_id, stock_id, account_id, type, qty, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const updateJobItem = db.prepare('UPDATE job_items SET received_qty = received_qty + ? WHERE id = ?');
    const checkJobStatus = db.prepare('SELECT SUM(qty) as total_qty, SUM(received_qty) as total_received FROM job_items WHERE job_id = ?');
    const updateJobStatus = db.prepare('UPDATE jobs SET status = ? WHERE id = ?');

    const transaction = db.transaction(() => {
      insertJob.run(jobId, receiptNo, date, accountId, 'INCOMING', 'Tamamlandı');
      
      const updatedOriginalJobIds = new Set<string>();

      for (const item of items) {
        // item contains: originalJobId, originalJobItemId, stockId, qty, price
        insertMovement.run(uuidv4(), jobId, null, item.stockId, accountId, 'IN', item.qty, date);
        
        if (item.originalJobItemId) {
          updateJobItem.run(item.qty, item.originalJobItemId);
          updatedOriginalJobIds.add(item.originalJobId);
        }
      }

      // Update status of original jobs
      for (const origJobId of updatedOriginalJobIds) {
        const statusCheck = checkJobStatus.get(origJobId) as { total_qty: number, total_received: number };
        if (statusCheck.total_received >= statusCheck.total_qty) {
          updateJobStatus.run('Tamamlandı', origJobId);
        } else if (statusCheck.total_received > 0) {
          updateJobStatus.run('Kısmi', origJobId);
        }
      }
    });

    transaction();
    
    if (supabase) {
      try {
        await supabase.from('jobs').insert([{ id: jobId, receipt_no: receiptNo, date, account_id: accountId, type: 'INCOMING', status: 'Tamamlandı' }]);
        const movementsToInsert = items.map((item: any) => ({
          id: uuidv4(), job_id: jobId, job_item_id: null, stock_id: item.stockId, account_id: accountId, type: 'IN', qty: item.qty, date
        }));
        await supabase.from('stock_movements').insert(movementsToInsert);
        
        // Note: Updating original job items and statuses in Supabase would require additional queries here.
        // For simplicity in this demo, we'll just log it.
        console.log('Incoming job synced to Supabase. Original job updates pending.');
      } catch (err) {
        console.error('Supabase sync error:', err);
      }
    }
    
    res.json({ success: true, jobId });
  });

  // Stock Summary
  app.get('/api/stocks/summary', (req, res) => {
    try {
      const summary = db.prepare(`
        SELECT 
          s.id, s.code, s.name, s.category, s.unit, s.critical_level,
          COALESCE(SUM(CASE WHEN sm.type = 'OUT' THEN sm.qty ELSE 0 END), 0) as total_outgoing,
          COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.qty ELSE 0 END), 0) as total_incoming
        FROM stocks s
        LEFT JOIN stock_movements sm ON s.id = sm.stock_id
        GROUP BY s.id
      `).all();

      const result = summary.map((s: any) => ({
        ...s,
        balance: s.total_incoming - s.total_outgoing
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Requests
  app.get('/api/purchase-requests', (req, res) => {
    try {
      const requests = db.prepare(`
        SELECT pr.*, 
          (SELECT COUNT(*) FROM purchase_request_items pri WHERE pri.request_id = pr.id) as item_count
        FROM purchase_requests pr 
        ORDER BY pr.created_at DESC
      `).all();
      
      const result = requests.map((req: any) => {
        const items = db.prepare(`
          SELECT pri.*, s.name as stock_name, s.code as stock_code, s.unit, a.name as supplier_name
          FROM purchase_request_items pri
          LEFT JOIN stocks s ON pri.stock_id = s.id
          LEFT JOIN accounts a ON pri.supplier_id = a.id
          WHERE pri.request_id = ?
        `).all(req.id);
        return { ...req, items };
      });
      
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-requests', (req, res) => {
    const { id, date, status, requested_by, department, priority, notes, items } = req.body;
    
    try {
      db.transaction(() => {
        db.prepare(`
          INSERT INTO purchase_requests (id, date, status, requested_by, department, priority, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, date, status || 'pending', requested_by, department, priority || 'normal', notes);

        const insertItem = db.prepare(`
          INSERT INTO purchase_request_items (id, request_id, stock_id, qty, estimated_price, supplier_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(
            Math.random().toString(36).substr(2, 9),
            id,
            item.stock_id,
            item.qty,
            item.estimated_price || null,
            item.supplier_id || null
          );
        }
      })();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-requests/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE purchase_requests SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/purchase-requests/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM purchase_requests WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Plans
  app.get('/api/purchase-plans', (req, res) => {
    try {
      const plans = db.prepare(`
        SELECT pp.*, 
          (SELECT COUNT(*) FROM purchase_plan_items ppi WHERE ppi.plan_id = pp.id) as item_count
        FROM purchase_plans pp 
        ORDER BY pp.created_at DESC
      `).all();
      
      const result = plans.map((plan: any) => {
        const items = db.prepare(`
          SELECT ppi.*, s.name as stock_name, s.code as stock_code, s.unit, a.name as supplier_name,
                 pri.request_id as source_request_id
          FROM purchase_plan_items ppi
          LEFT JOIN stocks s ON ppi.stock_id = s.id
          LEFT JOIN accounts a ON ppi.supplier_id = a.id
          LEFT JOIN purchase_request_items pri ON ppi.request_item_id = pri.id
          WHERE ppi.plan_id = ?
        `).all(plan.id);
        return { ...plan, items };
      });
      
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-plans', (req, res) => {
    const { id, date, status, title, notes, items } = req.body;
    const planId = id || uuidv4();
    
    try {
      db.transaction(() => {
        db.prepare(`
          INSERT INTO purchase_plans (id, date, status, title, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(planId, date, status || 'draft', title, notes);

        const insertItem = db.prepare(`
          INSERT INTO purchase_plan_items (id, plan_id, request_item_id, stock_id, qty, estimated_price, supplier_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(
            uuidv4(),
            planId,
            item.request_item_id || null,
            item.stock_id,
            item.qty,
            item.estimated_price || null,
            item.supplier_id || null
          );
        }
      })();
      res.json({ success: true, id: planId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-plans/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE purchase_plans SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/purchase-plans/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM purchase_plans WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Quotes
  app.get('/api/purchase-quotes', (req, res) => {
    try {
      const quotes = db.prepare(`
        SELECT pq.*, a.name as supplier_name, pp.title as plan_title
        FROM purchase_quotes pq
        LEFT JOIN accounts a ON pq.supplier_id = a.id
        LEFT JOIN purchase_plans pp ON pq.plan_id = pp.id
        ORDER BY pq.created_at DESC
      `).all();
      
      const result = quotes.map((quote: any) => {
        const items = db.prepare(`
          SELECT pqi.*, s.name as stock_name, s.code as stock_code, s.unit
          FROM purchase_quote_items pqi
          LEFT JOIN stocks s ON pqi.stock_id = s.id
          WHERE pqi.quote_id = ?
        `).all(quote.id);
        return { ...quote, items };
      });
      
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-quotes', (req, res) => {
    const { plan_id, date, supplier_id, notes, items } = req.body;
    const quoteId = uuidv4();
    
    try {
      db.transaction(() => {
        db.prepare(`
          INSERT INTO purchase_quotes (id, plan_id, date, supplier_id, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(quoteId, plan_id, date, supplier_id, notes);

        const insertItem = db.prepare(`
          INSERT INTO purchase_quote_items (id, quote_id, stock_id, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(uuidv4(), quoteId, item.stock_id, item.qty, item.price);
        }
      })();
      res.json({ success: true, id: quoteId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Orders
  app.get('/api/purchase-orders', (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT po.*, a.name as supplier_name
        FROM purchase_orders po
        LEFT JOIN accounts a ON po.supplier_id = a.id
        ORDER BY po.created_at DESC
      `).all();
      
      const result = orders.map((order: any) => {
        const items = db.prepare(`
          SELECT poi.*, s.name as stock_name, s.code as stock_code, s.unit
          FROM purchase_order_items poi
          LEFT JOIN stocks s ON poi.stock_id = s.id
          WHERE poi.order_id = ?
        `).all(order.id);
        return { ...order, items };
      });
      
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-orders', (req, res) => {
    const { date, supplier_id, notes, items } = req.body;
    const orderId = uuidv4();
    
    try {
      db.transaction(() => {
        db.prepare(`
          INSERT INTO purchase_orders (id, date, status, supplier_id, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(orderId, date, 'open', supplier_id, notes);

        const insertItem = db.prepare(`
          INSERT INTO purchase_order_items (id, order_id, stock_id, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(uuidv4(), orderId, item.stock_id, item.qty, item.price);
        }
      })();
      res.json({ success: true, id: orderId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-orders/generate', (req, res) => {
    const { plan_id, orders } = req.body;
    try {
      db.transaction(() => {
        for (const order of orders) {
          const orderId = uuidv4();
          db.prepare(`
            INSERT INTO purchase_orders (id, date, status, supplier_id, notes)
            VALUES (?, ?, ?, ?, ?)
          `).run(orderId, new Date().toISOString().split('T')[0], 'open', order.supplier_id, order.notes || '');

          const insertItem = db.prepare(`
            INSERT INTO purchase_order_items (id, order_id, stock_id, qty, price)
            VALUES (?, ?, ?, ?, ?)
          `);

          for (const item of order.items) {
            insertItem.run(uuidv4(), orderId, item.stock_id, item.qty, item.price);
          }
        }
        if (plan_id) {
          db.prepare('UPDATE purchase_plans SET status = ? WHERE id = ?').run('ordered', plan_id);
        }
      })();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-orders/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. PAYMENTS (Ödemeler/Tahsilatlar)
  app.get('/api/payments', (req, res) => {
    try {
      const payments = db.prepare('SELECT p.*, a.name as account_name FROM payments p LEFT JOIN accounts a ON p.account_id = a.id ORDER BY p.date DESC').all();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/payments', (req, res) => {
    try {
      const { account_id, date, amount, type, description, category } = req.body;
      const id = uuidv4();
      db.prepare('INSERT INTO payments (id, account_id, date, amount, type, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, account_id, date, amount, type, description, category);
      res.json({ id, account_id, date, amount, type, description, category });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // 6. BUDGET (Bütçe/Finans)
  app.get('/api/budgets', (req, res) => {
    try {
      const budgets = db.prepare('SELECT * FROM budgets ORDER BY period_start DESC').all();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/budgets', (req, res) => {
    try {
      const { name, period_start, period_end, total_budget } = req.body;
      const id = uuidv4();
      db.prepare('INSERT INTO budgets (id, name, period_start, period_end, total_budget) VALUES (?, ?, ?, ?, ?)').run(id, name, period_start, period_end, total_budget);
      res.json({ id, name, period_start, period_end, total_budget });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    try {
      const notifications = db.prepare('SELECT * FROM notifications ORDER BY date DESC').all();
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    try {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/read-all', (req, res) => {
    try {
      db.prepare('UPDATE notifications SET is_read = 1').run();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/notifications', (req, res) => {
    try {
      db.prepare('DELETE FROM notifications').run();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    try {
      const settings = db.prepare('SELECT * FROM settings').all();
      const settingsMap = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    const settings = req.body; // Object with key-value pairs
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        upsert.run(key, String(value));
      }
    });
    try {
      transaction(settings);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Attachments
  app.get('/api/attachments/:related_id', (req, res) => {
    try {
      const attachments = db.prepare('SELECT id, file_name, file_type, created_at FROM attachments WHERE related_id = ?').all(req.params.related_id);
      res.json(attachments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attachments/download/:id', (req, res) => {
    try {
      const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
      if (!attachment) return res.status(404).json({ error: 'Not found' });
      res.json(attachment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/attachments', (req, res) => {
    const { related_id, related_type, file_name, file_type, file_data } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO attachments (id, related_id, related_type, file_name, file_type, file_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, related_id, related_type, file_name, file_type, file_data, now);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/attachments/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Daily Planner
  app.get('/api/planner', (req, res) => {
    try {
      const planner = db.prepare('SELECT * FROM daily_planner WHERE is_archived = 0 ORDER BY sort_order ASC').all();
      res.json(planner);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/planner/summaries', (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      const summaries = db.prepare('SELECT date, summary FROM daily_summaries WHERE date BETWEEN ? AND ?').all(start_date, end_date);
      res.json(summaries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/planner/:date', (req, res) => {
    console.log('Fetching planner for date:', req.params.date);
    if (!db) {
      console.error('Database not initialized');
      return res.status(500).json({ error: 'Database not initialized' });
    }
    try {
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_planner'").get();
      if (!tableExists) {
        console.error('Table daily_planner does not exist');
        return res.status(500).json({ error: 'Table daily_planner does not exist' });
      }
      const planner = db.prepare('SELECT * FROM daily_planner WHERE date = ? AND is_archived = 0 ORDER BY sort_order ASC').all(req.params.date);
      console.log('Fetched planner:', planner);
      res.json(planner);
    } catch (err: any) {
      console.error('Error fetching planner:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/planner', (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    try {
      const existing = db.prepare('SELECT id FROM daily_planner WHERE date = ? AND item_key = ?').get(date, item_key) as any;
      const id = existing ? existing.id : uuidv4();
      
      if (existing) {
        db.prepare(`
          UPDATE daily_planner 
          SET time_range = ?, morning_status = ?, evening_status = ?, description = ?, detail = ?, sort_order = ?, priority = ?, category = ?, estimated_time = ?, actual_time = ?, assigned_to = ?, recurrence = ?, color_tag = ?, sub_tasks = ?, comments = ?, url = ?, is_archived = 0
          WHERE id = ?
        `).run(time_range || '', morning_status || 0, evening_status || 0, description || '', detail || '', sort_order || 0, priority || 0, category || '', estimated_time || '', actual_time || '', assigned_to || '', recurrence || '', color_tag || '', sub_tasks || '', comments || '', url || '', existing.id);
      } else {
        db.prepare(`
          INSERT INTO daily_planner (id, date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, date, item_key, time_range || '', morning_status || 0, evening_status || 0, description || '', detail || '', sort_order || 0, priority || 0, category || '', estimated_time || '', actual_time || '', assigned_to || '', recurrence || '', color_tag || '', sub_tasks || '', comments || '', url || '');
      }
      
      // Sync to calendar
      createEvent(item_key, date, 'production', time_range, null, description, id);
      createNotification('Planlayıcı Kaydı', `${item_key} planlayıcıya eklendi.`, 'info', id);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/planner/:id', (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    try {
      db.prepare(`
        UPDATE daily_planner 
        SET date = COALESCE(?, date), 
            item_key = COALESCE(?, item_key), 
            time_range = COALESCE(?, time_range), 
            morning_status = COALESCE(?, morning_status), 
            evening_status = COALESCE(?, evening_status), 
            description = COALESCE(?, description), 
            detail = COALESCE(?, detail), 
            sort_order = COALESCE(?, sort_order), 
            is_archived = COALESCE(?, is_archived),
            priority = COALESCE(?, priority),
            category = COALESCE(?, category),
            estimated_time = COALESCE(?, estimated_time),
            actual_time = COALESCE(?, actual_time),
            assigned_to = COALESCE(?, assigned_to),
            recurrence = COALESCE(?, recurrence),
            color_tag = COALESCE(?, color_tag),
            sub_tasks = COALESCE(?, sub_tasks),
            comments = COALESCE(?, comments),
            url = COALESCE(?, url)
        WHERE id = ?
      `).run(date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url, req.params.id);
      
      // Sync to calendar
      if (date || item_key || time_range || description) {
        db.prepare('UPDATE events SET title = COALESCE(?, title), date = COALESCE(?, date), time = COALESCE(?, time), description = COALESCE(?, description) WHERE related_id = ?')
          .run(item_key, date, time_range, description, req.params.id);
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/planner/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM daily_planner WHERE id = ?').run(req.params.id);
      db.prepare('DELETE FROM events WHERE related_id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Daily Summaries
  app.get('/api/planner/summary/:date', (req, res) => {
    try {
      const summary = db.prepare('SELECT summary FROM daily_summaries WHERE date = ?').get(req.params.date);
      res.json({ summary: summary ? (summary as any).summary : '' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/planner/summary', (req, res) => {
    const { date, summary } = req.body;
    try {
      db.prepare(`
        INSERT OR REPLACE INTO daily_summaries (date, summary)
        VALUES (?, ?)
      `).run(date, summary || '');
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    try {
      const tasks = db.prepare('SELECT * FROM tasks WHERE is_archived = 0 ORDER BY sort_order ASC, due_date ASC').all();
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', (req, res) => {
    const { title, description, due_date, priority, related_id, sort_order } = req.body;
    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO tasks (id, title, description, due_date, priority, related_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description || null, due_date || null, priority || 'medium', related_id || null, sort_order || 0);
      
      // Sync to calendar
      if (due_date) {
        createEvent(title, due_date, 'deadline', null, null, description, id);
        createNotification('Yeni Görev', `${title} görevi oluşturuldu.`, 'info', id);
      }
      
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { title, description, due_date, status, priority, sort_order, is_archived } = req.body;
    try {
      db.prepare(`
        UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, priority = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, description, due_date, status, priority, sort_order || 0, is_archived || 0, req.params.id);
      
      // Update calendar event
      db.prepare('UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?').run(title, due_date, description, req.params.id);
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
      db.prepare('DELETE FROM events WHERE related_id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Notes
  app.get('/api/notes', (req, res) => {
    try {
      const notes = db.prepare('SELECT * FROM notes WHERE is_archived = 0 ORDER BY sort_order ASC, updated_at DESC').all();
      res.json(notes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notes', (req, res) => {
    const { title, content, target_date, sort_order } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO notes (id, title, content, target_date, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, content || null, target_date || null, now, now, sort_order || 0);
      
      // Sync to calendar
      if (target_date) {
        createEvent(title, target_date, 'reminder', null, null, content, id);
      }
      
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/notes/:id', (req, res) => {
    const { title, content, target_date, sort_order, is_archived } = req.body;
    const now = new Date().toISOString();
    try {
      db.prepare(`
        UPDATE notes SET title = ?, content = ?, target_date = ?, updated_at = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, content, target_date || null, now, sort_order || 0, is_archived || 0, req.params.id);
      
      // Update calendar event
      db.prepare('UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?').run(title, target_date, content, req.params.id);
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/notes/:id', (req, res) => {
    const { title, content, target_date, sort_order, is_archived } = req.body;
    const now = new Date().toISOString();
    try {
      db.prepare(`
        UPDATE notes SET title = ?, content = ?, target_date = ?, updated_at = ?, sort_order = ?, is_archived = ?
        WHERE id = ?
      `).run(title, content, target_date, now, sort_order || 0, is_archived || 0, req.params.id);
      
      // Sync to calendar
      db.prepare('UPDATE events SET title = ?, date = ?, description = ? WHERE related_id = ?').run(title, target_date, content, req.params.id);
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/notes/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
      db.prepare('DELETE FROM events WHERE related_id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // AI Assistant Routes
  app.get('/api/ai/conversations', async (req, res) => {
    try {
      const service = getDatabaseService();
      const conversations = await service.getAIConversations();
      res.json(conversations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/conversations/:id/messages', async (req, res) => {
    try {
      const service = getDatabaseService();
      const messages = await service.getAIMessages(req.params.id);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    const { userId, conversationId, message, modelType } = req.body;
    try {
      const { nexusAI } = await import('./src/services/aiAssistantService');
      const response = await nexusAI.processMessage(userId || 'default-user', conversationId, message, modelType);
      res.json({ response });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/memories', async (req, res) => {
    try {
      const service = getDatabaseService();
      const memories = await service.getAIMemories();
      res.json(memories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/insights', async (req, res) => {
    try {
      const service = getDatabaseService();
      const insights = await service.getAIInsights();
      res.json(insights);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/insights/generate', async (req, res) => {
    const { userId } = req.body;
    try {
      const { nexusAI } = await import('./src/services/aiAssistantService');
      await nexusAI.generateInsight(userId || 'default-user');
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/tasks', async (req, res) => {
    try {
      const service = getDatabaseService();
      const tasks = await service.getAITasks();
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 404 for unknown API routes
  app.all('/api/*', (req, res) => {
    console.log(`404 - Unknown API Route: ${req.method} ${req.originalUrl || req.url}`);
    res.status(404).json({ error: 'API Route Not Found', method: req.method, url: req.originalUrl || req.url });
  });

  // Serve frontend
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const basePath = process.env.APP_PATH || __dirname;
    const distPath = path.join(basePath, 'dist');
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      console.log('Serving index.html for:', req.url);
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  // AI Heartbeat - Periodically generate insights
  setInterval(async () => {
    try {
      const { nexusAI } = await import('./src/services/aiAssistantService');
      console.log('AI Heartbeat: Generating insights...');
      await nexusAI.generateInsight('default-user');
    } catch (err) {
      console.error('AI Heartbeat Error:', err);
    }
  }, 1000 * 60 * 5); // Every 5 minutes

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
