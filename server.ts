import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  supabase as supabaseClient, 
  supabaseAdmin as supabaseAdminRaw, 
  mapAccountData, 
  mapStockData,
  TABLE_MAP
} from './src/services/supabaseClient';
const supabase = supabaseClient as any;
const supabaseAdmin = supabaseAdminRaw as any;
import { apiLimiter, authenticate, errorHandler } from './src/middleware/api';
import { z } from 'zod';
import { accountSchema, stockSchema, jobSchema } from './src/middleware/validation';
import { createClient } from '@supabase/supabase-js';

const getScopedSupabase = (req: express.Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (token && supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  return supabase;
};

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

// Diagnostic logs for API keys
console.log("[System] Checking API Keys...");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
console.log("- PERPLEXITY_API_KEY:", process.env.PERPLEXITY_API_KEY ? "Set" : "Not Set");
console.log("- GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Set" : "Not Set");
console.log("- API_KEY:", process.env.API_KEY ? "Set" : "Not Set");

// Helper functions for notifications and events
const createNotification = async (params: {
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info' | 'system';
  related_id?: string;
} | string, title?: string, message?: string, type?: 'alert' | 'success' | 'info' | 'system', related_id?: string) => {
  let user_id: string;
  let finalTitle: string;
  let finalMessage: string;
  let finalType: 'alert' | 'success' | 'info' | 'system';
  let finalRelatedId: string | undefined;

  if (typeof params === 'object') {
    user_id = params.user_id;
    finalTitle = params.title;
    finalMessage = params.message;
    finalType = params.type;
    finalRelatedId = params.related_id;
  } else {
    user_id = params;
    finalTitle = title!;
    finalMessage = message!;
    finalType = type!;
    finalRelatedId = related_id;
  }

  const id = uuidv4();
  const date = new Date().toISOString();
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{ 
        id, 
        user_id,
        title: finalTitle, 
        message: finalMessage, 
        date, 
        type: finalType, 
        related_id: finalRelatedId || null,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return id;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

const createEvent = async (params: {
  user_id: string;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'production';
  time?: string;
  location?: string;
  description?: string;
  related_id?: string;
} | string, title?: string, date?: string, type?: 'meeting' | 'deadline' | 'reminder' | 'production', time?: string, location?: string, description?: string, related_id?: string) => {
  let user_id: string;
  let finalTitle: string;
  let finalDate: string;
  let finalType: 'meeting' | 'deadline' | 'reminder' | 'production';
  let finalTime: string | undefined;
  let finalLocation: string | undefined;
  let finalDescription: string | undefined;
  let finalRelatedId: string | undefined;

  if (typeof params === 'object') {
    user_id = params.user_id;
    finalTitle = params.title;
    finalDate = params.date;
    finalType = params.type;
    finalTime = params.time;
    finalLocation = params.location;
    finalDescription = params.description;
    finalRelatedId = params.related_id;
  } else {
    user_id = params;
    finalTitle = title!;
    finalDate = date!;
    finalType = type!;
    finalTime = time;
    finalLocation = location;
    finalDescription = description;
    finalRelatedId = related_id;
  }

  const id = uuidv4();
  try {
    const { error } = await supabase
      .from('calendar_events')
      .insert([{
        id, 
        user_id,
        title: finalTitle, 
        date: finalDate, 
        time: finalTime || null, 
        location: finalLocation || null, 
        type: finalType, 
        description: finalDescription || null, 
        related_id: finalRelatedId || null, 
        attendees: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return id;
  } catch (err) {
    console.error('Error creating event:', err);
    return null;
  }
};

async function startServer() {
  console.log('Starting server...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  

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

  // Shipments
  app.get('/api/shipments', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', userId);
      
      if (shipmentsError) throw shipmentsError;

      const { data: movements, error: movementsError } = await supabase
        .from('shipment_movements')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (movementsError) throw movementsError;

      const shipmentsWithMovements = (shipments || []).map((s: any) => ({
        ...s,
        recipient: { name: s.recipient_name, deliveryAddress: s.delivery_address, invoiceAddress: s.invoice_address },
        carrier: { name: s.carrier_name, vehicleInfo: s.vehicle_info },
        logisticsCost: { amount: s.logistics_cost_amount, currency: s.logistics_cost_currency },
        pallets: s.pallets || [],
        products: s.products || [],
        notes: s.notes || [],
        documents: s.documents || [],
        movements: (movements || []).filter((m: any) => m.shipment_id === s.id)
      }));
      res.json(shipmentsWithMovements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/shipments', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    const { 
      id, recipient, carrier, logisticsCost, departureDate, deliveryDate, scheduledDate, 
      priority, status, transportMethod, shipmentType, extraDetails, 
      pallets, products, notes, documents 
    } = req.body;
    const shipmentId = id || uuidv4();
    try {
      const { error } = await supabase
        .from('shipments')
        .insert([{
          id: shipmentId, 
          user_id: userId,
          recipient_name: recipient.name, 
          delivery_address: recipient.deliveryAddress, 
          invoice_address: recipient.invoiceAddress, 
          carrier_name: carrier.name, 
          vehicle_info: carrier.vehicleInfo,
          logistics_cost_amount: logisticsCost.amount, 
          logistics_cost_currency: logisticsCost.currency, 
          departure_date: departureDate, 
          delivery_date: deliveryDate, 
          scheduled_date: scheduledDate,
          priority, 
          status, 
          transport_method: transportMethod, 
          shipment_type: shipmentType, 
          extra_details: extraDetails,
          pallets: pallets || [], 
          products: products || [], 
          notes: notes || [], 
          documents: documents || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      res.json({ success: true, id: shipmentId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shipments/:id/movements', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    const { status, location, description, movementDate, filePaths } = req.body;
    const id = uuidv4();
    try {
      const { error } = await supabase
        .from('shipment_movements')
        .insert([{
          id, 
          user_id: userId,
          shipment_id: req.params.id, 
          status, 
          location, 
          notes: description, 
          timestamp: movementDate || new Date().toISOString()
        }]);
      
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/shipments/:id/status', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    const { status } = req.body;
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/events', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: event, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      if (event) res.json(event);
      else res.status(404).json({ error: 'Event not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/events', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    const { title, date, time, location, attendees, type, description, related_id } = req.body;
    const id = uuidv4();
    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          id, 
          user_id: userId,
          title, 
          date, 
          time: time || null, 
          location: location || null, 
          attendees: attendees || null, 
          type, 
          description: description || null, 
          related_id: related_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/events/:id', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    const { title, date, time, location, attendees, type, description, is_completed, sort_order, is_archived } = req.body;
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title, 
          date, 
          time, 
          location, 
          attendees, 
          type, 
          description,
          is_completed,
          sort_order,
          is_archived,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/events/:id', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Accounts
  app.get('/api/accounts', authenticate, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .order('name');
      if (error) throw error;
      res.json((data || []).map(mapAccountData));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/accounts', authenticate, validate(accountSchema), async (req, res) => {
    try {
      const id = uuidv4();
      const { error } = await supabaseAdmin
        .from('accounts')
        .insert([{ 
          id, 
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.status(201).json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Notes
  app.get('/api/notes', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notes', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('notes')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/notes/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('notes')
        .update({
          ...req.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/notes/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Tasks
  app.get('/api/tasks', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('tasks')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('tasks')
        .update({
          ...req.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Documents
  app.get('/api/documents', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/documents', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('documents')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Templates
  app.get('/api/templates', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/templates', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('templates')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Media Items
  app.get('/api/media', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/media', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('media_items')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // News Subscriptions
  app.get('/api/news', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('news_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/news', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('news_subscriptions')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Daily Plans
  app.get('/api/daily-plans', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/daily-plans', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('daily_plans')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Reminders
  app.get('/api/reminders', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reminders', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('reminders')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Wishlists
  app.get('/api/wishlists', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/wishlists', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('wishlists')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Subscriptions
  app.get('/api/subscriptions', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_billing_date', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/subscriptions', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('subscriptions')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Investments
  app.get('/api/investments', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/investments', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('investments')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Budget Incomes
  app.get('/api/budget/incomes', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('budget_incomes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/budget/incomes', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('budget_incomes')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Budget Expenses
  app.get('/api/budget/expenses', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('budget_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/budget/expenses', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const id = uuidv4();
      const { error } = await supabase
        .from('budget_expenses')
        .insert([{ 
          id, 
          user_id: userId,
          ...req.body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/dashboard/summary', authenticate, async (req, res) => {
    console.log('GET /api/dashboard/summary');
    try {
      const userId = (req as any).user.id;
      // 1. Accounts & Payments Data
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, name, type, payment_term_days')
        .eq('user_id', userId);
      if (accountsError && accountsError.code !== 'PGRST205') throw accountsError;

      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, account_id, date, type, status')
        .eq('user_id', userId);
      if (jobsError && jobsError.code !== 'PGRST205') throw jobsError;

      const { data: jobItems, error: jobItemsError } = await supabase
        .from('job_items')
        .select('job_id, qty, price')
        .eq('user_id', userId);
      if (jobItemsError && jobItemsError.code !== 'PGRST205') throw jobItemsError;

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('account_id, amount, type, date')
        .eq('user_id', userId);
      if (paymentsError && paymentsError.code !== 'PGRST205') throw paymentsError;

      // 2. Stocks Data
      const { data: stocks, error: stocksError } = await supabase
        .from('stock')
        .select('id, name, code, critical_level, category, purchase_price')
        .eq('user_id', userId);
      if (stocksError && stocksError.code !== 'PGRST205') throw stocksError;

      const { data: stockMovements, error: stockMovementsError } = await supabase
        .from('stock_movements')
        .select('id, stock_id, qty, type, date')
        .eq('user_id', userId);
      if (stockMovementsError && stockMovementsError.code !== 'PGRST205') throw stockMovementsError;

      // 3. Other Modules Data
      const { count: openJobsCount, error: openJobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'Tamamlandı');
      if (openJobsError && openJobsError.code !== 'PGRST205') throw openJobsError;

      const { count: completedJobsCount, error: completedJobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Tamamlandı');
      if (completedJobsError && completedJobsError.code !== 'PGRST205') throw completedJobsError;

      const { count: pendingPurchaseRequests, error: prError } = await supabase
        .from('purchase_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');
      if (prError && prError.code !== 'PGRST205') throw prError;

      const { count: openPurchaseOrders, error: poError } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'open');
      if (poError && poError.code !== 'PGRST205') throw poError;

      const { data: poItems, error: poiError } = await supabase
        .from('purchase_order_items')
        .select('qty, price, purchase_orders!inner(status)')
        .eq('user_id', userId)
        .neq('purchase_orders.status', 'cancelled');
      if (poiError && poiError.code !== 'PGRST205') throw poiError;

      const { count: activeShipments, error: shipError } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('status', 'in', '("Teslim Edildi", "İptal")');
      if (shipError && shipError.code !== 'PGRST205') throw shipError;

      const { count: pendingTasks, error: taskError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'completed')
        .eq('is_archived', false);
      if (taskError && taskError.code !== 'PGRST205') throw taskError;

      // --- Aggregations ---
      const now = new Date();
      let totalCost = 0;
      let totalPayment = 0;
      let totalOverdue = 0;

      const accountBalances = (accounts || []).map(a => {
        const accountJobs = (jobs || []).filter(j => j.account_id === a.id && j.type === 'OUTGOING');
        const accountPayments = (payments || []).filter(p => p.account_id === a.id);
        
        const totalAccountPayment = accountPayments.reduce((sum, p) => sum + (p.type === 'OUTGOING' ? p.amount : -p.amount), 0);
        
        let accountCost = 0;
        let sumOverdueCosts = 0;
        const termDays = a.payment_term_days || 0;

        for (const job of accountJobs) {
          const items = (jobItems || []).filter(ji => ji.job_id === job.id);
          const jobCost = items.reduce((sum, ji) => sum + (ji.qty * ji.price), 0);
          accountCost += jobCost;
          
          const dueDate = new Date(new Date(job.date).getTime() + termDays * 24 * 60 * 60 * 1000);
          if (dueDate <= now) sumOverdueCosts += jobCost;
        }

        totalCost += accountCost;
        totalPayment += totalAccountPayment;
        totalOverdue += Math.max(0, sumOverdueCosts - totalAccountPayment);

        return { ...a, balance: accountCost - totalAccountPayment };
      });

      const topAccounts = accountBalances.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 5);

      const stockBalances = (stocks || []).map(s => {
        const movements = (stockMovements || []).filter(sm => sm.stock_id === s.id);
        const balance = movements.reduce((sum, sm) => sum + (sm.type === 'IN' ? sm.qty : -sm.qty), 0);
        return { ...s, balance };
      });

      const criticalStocksCount = stockBalances.filter(s => s.balance <= (s.critical_level || 0)).length;
      const totalStockValue = stockBalances.reduce((sum, s) => sum + (s.balance * (s.purchase_price || 0)), 0);

      const topStocks = (stocks || []).map(s => ({
        ...s,
        movement_count: (stockMovements || []).filter(sm => sm.stock_id === s.id).length
      })).sort((a, b) => b.movement_count - a.movement_count).slice(0, 5);

      const categoryDistributionMap: Record<string, number> = {};
      (stocks || []).forEach(s => {
        const cat = s.category || 'Diğer';
        categoryDistributionMap[cat] = (categoryDistributionMap[cat] || 0) + 1;
      });
      const categoryDistribution = Object.entries(categoryDistributionMap).map(([name, value]) => ({ name, value }));

      const accountTypeDistributionMap: Record<string, number> = {};
      (accounts || []).forEach(a => {
        const type = a.type || 'Diğer';
        accountTypeDistributionMap[type] = (accountTypeDistributionMap[type] || 0) + 1;
      });
      const accountTypeDistribution = Object.entries(accountTypeDistributionMap).map(([name, value]) => ({ name, value }));

      const recentMovements = (stockMovements || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(sm => ({
        ...sm,
        stock_name: (stocks || []).find(s => s.id === sm.stock_id)?.name,
        account_name: (accounts || []).find(a => a.id === sm.account_id)?.name
      }));

      const recentPayments = (payments || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(p => ({
        ...p,
        account_name: (accounts || []).find(a => a.id === p.account_id)?.name
      }));

      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
        const monthYear = d.toISOString().slice(0, 7);
        
        const monthJobs = (jobs || []).filter(j => j.date.startsWith(monthYear));
        monthlyTrends.push({
          name: monthName,
          completed: monthJobs.filter(j => j.status === 'Tamamlandı').length,
          open: monthJobs.filter(j => j.status !== 'Tamamlandı').length
        });
      }

      const upcomingDeadlines = (jobs || []).filter(j => j.status !== 'Tamamlandı').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map(j => ({
        ...j,
        supplier_name: (accounts || []).find(a => a.id === j.account_id)?.name
      }));

      const totalPurchaseSpend = (poItems || []).reduce((sum, poi) => sum + (poi.qty * poi.price), 0);

      // Notifications for critical stocks
      for (const stock of stockBalances) {
        if (stock.balance <= (stock.critical_level || 0)) {
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('related_id', stock.id)
            .eq('is_read', false)
            .eq('user_id', userId)
            .maybeSingle();
          if (!existingNotif) {
            await createNotification({
              user_id: userId,
              title: 'Kritik Stok Uyarısı',
              message: `${stock.name} stok miktarı kritik seviyenin (${stock.critical_level}) altına düştü! Güncel: ${stock.balance}`,
              type: 'alert',
              related_id: stock.id
            });
          }
        }
      }

      res.json({
        accounts: {
          total: (accounts || []).length,
          totalCost,
          totalPayment,
          netBalance: totalCost - totalPayment,
          totalOverdue,
          top: topAccounts,
          distribution: accountTypeDistribution
        },
        stocks: {
          total: (stocks || []).length,
          critical: criticalStocksCount,
          top: topStocks,
          distribution: categoryDistribution,
          totalValue: totalStockValue
        },
        jobs: {
          open: openJobsCount || 0,
          completed: completedJobsCount || 0,
          trends: monthlyTrends,
          upcoming: upcomingDeadlines
        },
        purchasing: {
          pendingRequests: pendingPurchaseRequests || 0,
          openOrders: openPurchaseOrders || 0,
          totalSpend: totalPurchaseSpend
        },
        shipments: {
          active: activeShipments || 0
        },
        tasks: {
          pending: pendingTasks || 0
        },
        recent: {
          movements: recentMovements,
          payments: recentPayments
        }
      });
    } catch (err: any) {
      console.error('Error in /api/dashboard/summary:', err);
      res.status(500).json({ error: err.message });
    }
  });


  app.put('/api/accounts/:id', authenticate, async (req, res) => {
    const { 
      name, type, phone, email, series, status,
      address, tax_office, tax_number, authorized_person, 
      website, description, payment_term_days
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const paymentTermDays = parseInt(String(payment_term_days)) || 0;
    const userId = (req as any).user.id;
    const scopedSupabase = getScopedSupabase(req);

    try {
      const { error } = await scopedSupabase
        .from('accounts')
        .update({ 
          name, type, phone, email, series, status,
          address, tax_office, tax_number, authorized_person, 
          website, description, payment_term_days: paymentTermDays,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/accounts/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      // Check if account has related jobs or payments
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', req.params.id)
        .eq('user_id', userId);
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', req.params.id)
        .eq('user_id', userId);
      
      if ((jobsCount || 0) > 0 || (paymentsCount || 0) > 0) {
        return res.status(400).json({ error: 'Bu cari hesaba bağlı işlemler (iş emirleri veya ödemeler) bulunduğu için silinemez. Lütfen önce bağlı işlemleri silin veya cariyi arşivleyin.' });
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/:id/archive', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('accounts')
        .update({ status: 'Arşivlendi', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/bulk', async (req, res) => {
    const accounts = req.body;
    const results = accounts.map((item: any) => ({
      id: uuidv4(),
      name: item.name,
      type: item.type,
      phone: item.phone,
      email: item.email,
      series: item.series,
      address: item.address || null,
      tax_office: item.tax_office || null,
      tax_number: item.tax_number || null,
      authorized_person: item.authorized_person || null,
      website: item.website || null,
      description: item.description || null,
      status: 'Aktif'
    }));
    
    try {
      const scopedSupabase = getScopedSupabase(req);
      const { error } = await scopedSupabase.from('accounts').insert(results);
      if (error) throw error;
      res.json({ success: true, count: results.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/accounts/summary', async (req, res) => {
    try {
      const { search, limit, offset } = req.query;
      let query = supabaseAdmin.from('accounts').select('*');
      
      if (search) {
        query = query.or(`"Cari İsmi".ilike.%${search}%,company_name.ilike.%${search}%,"Cari Kodu".ilike.%${search}%,code.ilike.%${search}%,"Vergi Numarası".ilike.%${search}%,tax_number.ilike.%${search}%`);
      }
      
      if (limit) query = query.limit(Number(limit));
      if (offset) query = query.range(Number(offset), Number(offset) + Number(limit || 10) - 1);

      const { data: accounts, error: accountsError } = await query;
      
      if (accountsError) {
        if (accountsError.code === 'PGRST205') {
          return res.json([]); 
        }
        throw accountsError;
      }
      
      const { data: jobs, error: jobsError } = await supabaseAdmin.from('jobs').select('id, account_id, date, type');
      const { data: jobItems, error: jobItemsError } = await supabaseAdmin.from('job_items').select('job_id, qty, price');
      const { data: payments, error: paymentsError } = await supabaseAdmin.from('payments').select('account_id, amount, type');
      
      const now = new Date();
      
      const result = (accounts || []).map((rawAccount: any) => {
        const a = mapAccountData(rawAccount);
        const termDays = a.payment_days || 0;
        
        const accountJobs = (jobs || []).filter(j => j.account_id === a.id && j.type === 'OUTGOING');
        const accountPayments = (payments || []).filter(p => p.account_id === a.id);
        
        const total_payment = accountPayments.reduce((sum, p) => sum + (p.type === 'OUTGOING' ? p.amount : -p.amount), 0);
        
        let total_cost = 0;
        let sum_overdue_costs = 0;
        
        for (const job of accountJobs) {
          const items = (jobItems || []).filter(ji => ji.job_id === job.id);
          const jobCost = items.reduce((sum, ji) => sum + (ji.qty * ji.price), 0);
          total_cost += jobCost;
          
          const dueDate = new Date(new Date(job.date).getTime() + termDays * 24 * 60 * 60 * 1000);
          if (dueDate <= now) {
            sum_overdue_costs += jobCost;
          }
        }
        
        const balance = total_cost - total_payment;
        return {
          ...a,
          balance,
          overdue_debt: Math.max(0, sum_overdue_costs - total_payment),
          total_jobs: accountJobs.length
        };
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/accounts/summary:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/accounts/:id/transactions', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      // 1. Fetch job items for outgoing jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, receipt_no, date, type')
        .eq('account_id', req.params.id)
        .eq('user_id', userId)
        .eq('type', 'OUTGOING');
      if (jobsError) throw jobsError;

      const jobIds = jobs.map(j => j.id);
      const { data: jobItems, error: jobItemsError } = await supabase
        .from('job_items')
        .select('id, job_id, stock_id, qty, price, stocks(name, code)')
        .in('job_id', jobIds);
      if (jobItemsError) throw jobItemsError;

      const jobTransactions = (jobItems || []).map(ji => {
        const job = jobs.find(j => j.id === ji.job_id);
        return {
          id: ji.id,
          date: job?.date,
          document_no: job?.receipt_no,
          record_type: 'JOB_ITEM',
          job_type: job?.type,
          description: `${(ji.stocks as any)?.name} (${(ji.stocks as any)?.code})`,
          qty: ji.qty,
          price: ji.price,
          amount: ji.qty * ji.price
        };
      });

      // 2. Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, date, amount, type, description')
        .eq('account_id', req.params.id)
        .eq('user_id', userId);
      if (paymentsError) throw paymentsError;

      const paymentTransactions = (payments || []).map(p => ({
        id: p.id,
        date: p.date,
        document_no: p.id,
        record_type: 'PAYMENT',
        job_type: p.type,
        description: p.description,
        qty: 1,
        price: p.amount,
        amount: p.amount
      }));

      // 3. Combine and sort
      const allTransactions = [...jobTransactions, ...paymentTransactions].sort((a, b) => 
        new Date(a.date!).getTime() - new Date(b.date!).getTime()
      );

      let balance = 0;
      const result = allTransactions.map(t => {
        if (t.record_type === 'JOB_ITEM') {
          balance += t.amount;
        } else if (t.record_type === 'PAYMENT') {
          if (t.job_type === 'OUTGOING') {
            balance -= t.amount;
          } else {
            balance += t.amount;
          }
        }
        return { ...t, balance };
      });

      res.json(result.reverse());
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/accounts/:id/payments', authenticate, async (req, res) => {
    const { amount, type, description, date } = req.body;
    const id = uuidv4();
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase.from('payments').insert([{
        id, 
        user_id: userId,
        account_id: req.params.id, 
        date: date || new Date().toISOString(), 
        amount, 
        type, 
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });



  // Stocks
  app.get('/api/stocks', authenticate, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('stock')
        .select('*')
        .order('"Stok İsmi"');
      if (error) throw error;
      res.json((data || []).map(mapStockData));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/stocks', authenticate, async (req, res) => {
    const { 
      code, name, category, unit, critical_level, 
      barcode, brand, model, purchase_price, sale_price, 
      tax_rate, location, description 
    } = req.body;
    const id = uuidv4();
    try {
      const { error } = await supabaseAdmin.from('stock').insert([{ 
        "Stok Kodu": code || id, 
        "Stok İsmi": name, 
        quantity: 0,
        updated_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      res.json({ id, code, name, category, unit, critical_level });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/bulk', authenticate, async (req, res) => {
    const stocks = req.body;
    const results = stocks.map((item: any) => ({
      "Stok Kodu": item.code || uuidv4(),
      "Stok İsmi": item.name,
      quantity: item.quantity || 0,
      updated_at: new Date().toISOString()
    }));
    
    try {
      const { error } = await supabaseAdmin.from('stock').insert(results);
      if (error) throw error;
      res.json({ success: true, count: results.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/stocks/:id', authenticate, async (req, res) => {
    const { 
      code, name, category, unit, critical_level, 
      barcode, brand, model, purchase_price, sale_price, 
      tax_rate, location, description 
    } = req.body;
    try {
      const { error } = await supabaseAdmin
        .from('stock')
        .update({ 
          "Stok Kodu": code, 
          "Stok İsmi": name,
          updated_at: new Date().toISOString()
        })
        .or(`"Stok Kodu".eq.${req.params.id},"Stok İsmi".eq.${req.params.id}`);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/stocks/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      // Check if stock has movements
      const { count } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact', head: true })
        .eq('stock_id', req.params.id)
        .eq('user_id', userId);
      if ((count || 0) > 0) {
        return res.status(400).json({ error: 'Bu stoğa bağlı hareketler bulunduğu için silinemez. Lütfen önce hareketleri silin veya stoğu arşivleyin.' });
      }

      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/:id/archive', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('stock')
        .update({ status: 'Arşivlendi', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/stocks/:id/adjust', authenticate, async (req, res) => {
    const { qty, type } = req.body;
    const id = uuidv4();
    const date = new Date().toISOString();
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase.from('stock_movements').insert([{
        id, 
        user_id: userId,
        stock_id: req.params.id, 
        type, 
        qty, 
        date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Jobs
  app.get('/api/jobs', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*, accounts(name, series)')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (jobsError) throw jobsError;

      const { data: items, error: itemsError } = await supabase
        .from('job_items')
        .select('*, stocks(name, code)')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const jobsWithItems = (jobs || []).map(j => ({
        ...j,
        supplier_name: (j.accounts as any)?.name,
        supplier_series: (j.accounts as any)?.series,
        items: (items || []).filter(i => i.job_id === j.id).map(i => ({
          ...i,
          stock_name: (i.stocks as any)?.name,
          stock_code: (i.stocks as any)?.code
        }))
      }));

      res.json(jobsWithItems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/jobs/open', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: jobs, error: jobsError } = await supabaseAdmin
        .from('jobs')
        .select('*, accounts("Cari İsmi", "Cari Kodu")')
        .eq('user_id', userId)
        .in('status', ['Açık', 'Kısmi'])
        .eq('type', 'OUTGOING')
        .order('date', { ascending: false });
      if (jobsError) throw jobsError;

      const { data: items, error: itemsError } = await supabaseAdmin
        .from('job_items')
        .select('*, stock("Stok İsmi", "Stok Kodu")')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const jobsWithItems = (jobs || []).map(j => ({
        ...j,
        supplier_name: (j.accounts as any)?.["Cari İsmi"],
        supplier_series: (j.accounts as any)?.["Cari Kodu"],
        items: (items || []).filter(i => i.job_id === j.id).map(i => ({
          ...i,
          stock_name: (i.stock as any)?.["Stok İsmi"],
          stock_code: (i.stock as any)?.["Stok Kodu"]
        }))
      }));

      res.json(jobsWithItems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/jobs/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      await supabase.from('stock_movements').delete().eq('job_id', req.params.id).eq('user_id', userId);
      await supabase.from('job_items').delete().eq('job_id', req.params.id).eq('user_id', userId);
      await supabase.from('calendar_events').delete().eq('related_id', req.params.id).eq('user_id', userId);
      await supabase.from('notifications').delete().eq('related_id', req.params.id).eq('user_id', userId);
      const { error } = await supabase.from('jobs').delete().eq('id', req.params.id).eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/jobs/:id/archive', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'Arşivlendi', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Create Outgoing Job (Ürün Gidişi)
  app.post('/api/jobs/outgoing', authenticate, async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv4();
    const userId = (req as any).user.id;
    const scopedSupabase = getScopedSupabase(req);
    
    try {
      // 1. Insert Job
      const { error: jobError } = await scopedSupabase.from('jobs').insert([{ 
        id: jobId, 
        user_id: userId,
        receipt_no: receiptNo, 
        date, 
        account_id: accountId, 
        type: 'OUTGOING', 
        status: 'Açık',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (jobError) throw jobError;

      // 2. Insert Job Items
      const jobItemsToInsert = items.map((item: any) => ({
        id: uuidv4(), 
        user_id: userId,
        job_id: jobId, 
        stock_id: item.stockId, 
        qty: item.qty, 
        price: item.price || 0, 
        received_qty: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: itemsError } = await supabaseAdmin.from('job_items').insert(jobItemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Insert Stock Movements
      const movementsToInsert = jobItemsToInsert.map((item: any) => ({
        id: uuidv4(), 
        user_id: userId,
        job_id: jobId, 
        job_item_id: item.id, 
        stock_id: item.stock_id, 
        type: 'OUT', 
        qty: item.qty, 
        date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: movementsError } = await scopedSupabase.from('stock_movements').insert(movementsToInsert);
      if (movementsError) throw movementsError;

      // 4. Automatically add to calendar (Deadline based on account payment terms)
      const { data: account, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('"Cari İsmi", "Vade Günü"')
        .eq('id', accountId)
        .single();
      
      if (accountError && accountError.code !== 'PGRST116') throw accountError;

      const termDays = account?.["Vade Günü"] || 0;
      const dueDate = new Date(new Date(date).getTime() + termDays * 24 * 60 * 60 * 1000).toISOString();
      
      await createEvent({
        user_id: userId,
        title: `${receiptNo} - Termin`,
        date: dueDate,
        time: '17:00',
        type: 'deadline',
        related_id: jobId,
        description: `${account?.["Cari İsmi"] || ''} için ${receiptNo} nolu iş emri teslim tarihi.`
      });
      
      // 5. Automatically add notification
      await createNotification({
        title: 'Yeni İş Emri',
        message: `${receiptNo} numaralı iş emri oluşturuldu. Termin: ${dueDate.split('T')[0]}`,
        type: 'info',
        related_id: jobId,
        user_id: userId
      });

      res.json({ success: true, jobId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Create Incoming Job (Ürün Gelişi)
  app.post('/api/jobs/incoming', authenticate, async (req, res) => {
    const { date, receiptNo, accountId, items } = req.body;
    const jobId = uuidv4();
    const userId = (req as any).user.id;
    const scopedSupabase = getScopedSupabase(req);
    
    try {
      // 1. Insert Incoming Job
      const { error: jobError } = await scopedSupabase.from('jobs').insert([{ 
        id: jobId, 
        user_id: userId,
        receipt_no: receiptNo, 
        date, 
        account_id: accountId, 
        type: 'INCOMING', 
        status: 'Tamamlandı',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (jobError) throw jobError;

      const updatedOriginalJobIds = new Set<string>();

      for (const item of items) {
        // 2. Insert Stock Movement
        await scopedSupabase.from('stock_movements').insert([{
          id: uuidv4(), 
          user_id: userId,
          job_id: jobId, 
          job_item_id: null, 
          stock_id: item.stockId, 
          type: 'IN', 
          qty: item.qty, 
          date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
        // 3. Update Original Job Item
        if (item.originalJobItemId) {
          const { data: currentItem } = await scopedSupabase
            .from('job_items')
            .select('received_qty')
            .eq('id', item.originalJobItemId)
            .eq('user_id', userId)
            .single();
          const newReceivedQty = (currentItem?.received_qty || 0) + item.qty;
          await scopedSupabase
            .from('job_items')
            .update({ received_qty: newReceivedQty, updated_at: new Date().toISOString() })
            .eq('id', item.originalJobItemId)
            .eq('user_id', userId);
          updatedOriginalJobIds.add(item.originalJobId);
        }
      }

      // 4. Update status of original jobs
      for (const origJobId of Array.from(updatedOriginalJobIds)) {
        const { data: statusCheck } = await scopedSupabase
          .from('job_items')
          .select('qty, received_qty')
          .eq('job_id', origJobId)
          .eq('user_id', userId);
        if (statusCheck) {
          const totalQty = statusCheck.reduce((sum, i) => sum + i.qty, 0);
          const totalReceived = statusCheck.reduce((sum, i) => sum + i.received_qty, 0);
          
          let newStatus = 'Açık';
          if (totalReceived >= totalQty) {
            newStatus = 'Tamamlandı';
          } else if (totalReceived > 0) {
            newStatus = 'Kısmi';
          }
          await scopedSupabase
            .from('jobs')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', origJobId)
            .eq('user_id', userId);
        }
      }

      res.json({ success: true, jobId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Stock Summary
  app.get('/api/stocks/summary', async (req, res) => {
    try {
      const { search, limit, offset } = req.query;
      let query = supabaseAdmin.from('stock').select('*');
      
      if (search) {
        query = query.or(`"Stok İsmi".ilike.%${search}%,"Stok Kodu".ilike.%${search}%`);
      }
      
      if (limit) query = query.limit(Number(limit));
      if (offset) query = query.range(Number(offset), Number(offset) + Number(limit || 10) - 1);

      const { data: stocks, error: stocksError } = await query;
      if (stocksError) throw stocksError;

      const { data: movements, error: movementsError } = await supabaseAdmin.from('stock_movements').select('stock_id, type, qty');
      
      const result = (Array.isArray(stocks) ? stocks : []).map(rawStock => {
        const s = mapStockData(rawStock);
        const stockMovements = (movements || []).filter(m => m.stock_id === s.id || m.stock_id === s["Stok Kodu"]);
        const totalOutgoing = stockMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.qty, 0);
        const totalIncoming = stockMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.qty, 0);
        
        return {
          ...s,
          total_outgoing: totalOutgoing,
          total_incoming: totalIncoming,
          balance: (s.balance || 0) + totalIncoming - totalOutgoing
        };
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/stocks/summary:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Requests
  app.get('/api/purchase-requests', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: requests, error: requestsError } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (requestsError) throw requestsError;

      const { data: items, error: itemsError } = await supabase
        .from('purchase_request_items')
        .select('*, stocks(name, code, unit), accounts(name)')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const result = (requests || []).map(r => ({
        ...r,
        item_count: (items || []).filter(i => i.request_id === r.id).length,
        items: (items || []).filter(i => i.request_id === r.id).map(i => ({
          ...i,
          stock_name: (i.stocks as any)?.name,
          stock_code: (i.stocks as any)?.code,
          unit: (i.stocks as any)?.unit,
          supplier_name: (i.accounts as any)?.name
        }))
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-requests', authenticate, async (req, res) => {
    const { id, date, status, requested_by, department, priority, notes, items } = req.body;
    const requestId = id || uuidv4();
    const userId = (req as any).user.id;
    try {
      const { error: requestError } = await supabase.from('purchase_requests').insert([{
        id: requestId, 
        user_id: userId,
        date, 
        status: status || 'pending', 
        requested_by, 
        department, 
        priority: priority || 'normal', 
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (requestError) throw requestError;

      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(),
        user_id: userId,
        request_id: requestId,
        stock_id: item.stock_id,
        qty: item.qty,
        estimated_price: item.estimated_price || null,
        supplier_id: item.supplier_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: itemsError } = await supabase.from('purchase_request_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      res.json({ success: true, id: requestId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-requests/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase
        .from('purchase_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/purchase-requests/:id', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    try {
      await supabase.from('purchase_request_items').delete().eq('request_id', req.params.id).eq('user_id', userId);
      const { error } = await supabase.from('purchase_requests').delete().eq('id', req.params.id).eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Plans
  app.get('/api/purchase-plans', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: plans, error: plansError } = await supabase
        .from('purchase_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (plansError) throw plansError;

      const { data: items, error: itemsError } = await supabase
        .from('purchase_plan_items')
        .select('*, stocks(name, code, unit), accounts(name), purchase_request_items(request_id)')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const result = (plans || []).map(p => ({
        ...p,
        item_count: (items || []).filter(i => i.plan_id === p.id).length,
        items: (items || []).filter(i => i.plan_id === p.id).map(i => ({
          ...i,
          stock_name: (i.stocks as any)?.name,
          stock_code: (i.stocks as any)?.code,
          unit: (i.stocks as any)?.unit,
          supplier_name: (i.accounts as any)?.name,
          source_request_id: (i.purchase_request_items as any)?.request_id
        }))
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-plans', authenticate, async (req, res) => {
    const { id, date, status, title, notes, items } = req.body;
    const planId = id || uuidv4();
    const userId = (req as any).user.id;
    try {
      const { error: planError } = await supabase.from('purchase_plans').insert([{
        id: planId, 
        user_id: userId,
        date, 
        status: status || 'draft', 
        title, 
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (planError) throw planError;

      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(),
        user_id: userId,
        plan_id: planId,
        request_item_id: item.request_item_id || null,
        stock_id: item.stock_id,
        qty: item.qty,
        estimated_price: item.estimated_price || null,
        supplier_id: item.supplier_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: itemsError } = await supabase.from('purchase_plan_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      res.json({ success: true, id: planId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-plans/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase
        .from('purchase_plans')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/purchase-plans/:id', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    try {
      await supabase.from('purchase_plan_items').delete().eq('plan_id', req.params.id).eq('user_id', userId);
      const { error } = await supabase.from('purchase_plans').delete().eq('id', req.params.id).eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Quotes
  app.get('/api/purchase-quotes', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: quotes, error: quotesError } = await supabase
        .from('purchase_quotes')
        .select('*, accounts(name), purchase_plans(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (quotesError) throw quotesError;

      const { data: items, error: itemsError } = await supabase
        .from('purchase_quote_items')
        .select('*, stocks(name, code, unit)')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const result = (quotes || []).map(q => ({
        ...q,
        supplier_name: (q.accounts as any)?.name,
        plan_title: (q.purchase_plans as any)?.title,
        items: (items || []).filter(i => i.quote_id === q.id).map(i => ({
          ...i,
          stock_name: (i.stocks as any)?.name,
          stock_code: (i.stocks as any)?.code,
          unit: (i.stocks as any)?.unit
        }))
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-quotes', authenticate, async (req, res) => {
    const { plan_id, date, supplier_id, notes, items } = req.body;
    const quoteId = uuidv4();
    const userId = (req as any).user.id;
    try {
      const { error: quoteError } = await supabase.from('purchase_quotes').insert([{
        id: quoteId, 
        user_id: userId,
        plan_id, 
        date, 
        supplier_id, 
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (quoteError) throw quoteError;

      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(), 
        user_id: userId,
        quote_id: quoteId, 
        stock_id: item.stock_id, 
        qty: item.qty, 
        price: item.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: itemsError } = await supabase.from('purchase_quote_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      res.json({ success: true, id: quoteId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Purchase Orders
  app.get('/api/purchase-orders', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data: orders, error: ordersError } = await supabase
        .from('purchase_orders')
        .select('*, accounts(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;

      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*, stocks(name, code, unit)')
        .eq('user_id', userId);
      if (itemsError) throw itemsError;

      const result = (orders || []).map(o => ({
        ...o,
        supplier_name: (o.accounts as any)?.name,
        items: (items || []).filter(i => i.order_id === o.id).map(i => ({
          ...i,
          stock_name: (i.stocks as any)?.name,
          stock_code: (i.stocks as any)?.code,
          unit: (i.stocks as any)?.unit
        }))
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-orders', authenticate, async (req, res) => {
    const { date, supplier_id, notes, items } = req.body;
    const orderId = uuidv4();
    const userId = (req as any).user.id;
    try {
      const { error: orderError } = await supabase.from('purchase_orders').insert([{
        id: orderId, 
        user_id: userId,
        date, 
        status: 'open', 
        supplier_id, 
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (orderError) throw orderError;

      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(), 
        user_id: userId,
        order_id: orderId, 
        stock_id: item.stock_id, 
        qty: item.qty, 
        price: item.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      res.json({ success: true, id: orderId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/purchase-orders/generate', authenticate, async (req, res) => {
    const { plan_id, orders } = req.body;
    const userId = (req as any).user.id;
    try {
      for (const order of orders) {
        const orderId = uuidv4();
        const { error: orderError } = await supabase.from('purchase_orders').insert([{
          id: orderId, 
          user_id: userId,
          date: new Date().toISOString().split('T')[0], 
          status: 'open', 
          supplier_id: order.supplier_id, 
          notes: order.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        if (orderError) throw orderError;

        const itemsToInsert = order.items.map((item: any) => ({
          id: uuidv4(), 
          user_id: userId,
          order_id: orderId, 
          stock_id: item.stock_id, 
          qty: item.qty, 
          price: item.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
      if (plan_id) {
        await supabase
          .from('purchase_plans')
          .update({ status: 'ordered', updated_at: new Date().toISOString() })
          .eq('id', plan_id)
          .eq('user_id', userId);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/purchase-orders/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. PAYMENTS (Ödemeler/Tahsilatlar)
  app.get('/api/payments', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('payments')
        .select('*, accounts(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      
      const result = (data || []).map(p => ({
        ...p,
        account_name: (p.accounts as any)?.name
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/payments', authenticate, async (req, res) => {
    try {
      const { account_id, date, amount, type, description, category } = req.body;
      const id = uuidv4();
      const userId = (req as any).user.id;
      const { error } = await supabase.from('payments').insert([{
        id, 
        user_id: userId,
        account_id, 
        date, 
        amount, 
        type, 
        description, 
        category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (error) throw error;
      res.json({ id, account_id, date, amount, type, description, category });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // 6. BUDGET (Bütçe/Finans)
  app.get('/api/budgets', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/budgets', authenticate, async (req, res) => {
    try {
      const { name, period_start, period_end, total_budget } = req.body;
      const id = uuidv4();
      const userId = (req as any).user.id;
      const { error } = await supabase.from('budgets').insert([{
        id, 
        user_id: userId,
        name, 
        period_start, 
        period_end, 
        total_budget,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (error) throw error;
      res.json({ id, name, period_start, period_end, total_budget });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Notifications
  app.get('/api/notifications', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/read-all', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('is_read', false)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/notifications', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      const settingsMap = (data || []).reduce((acc: any, s: any) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', authenticate, async (req, res) => {
    const settings = req.body; // Object with key-value pairs
    const userId = (req as any).user.id;
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('settings').upsert({ 
          user_id: userId,
          key, 
          value: String(value),
          updated_at: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Attachments
  app.get('/api/attachments/:related_id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('attachments')
        .select('id, file_name, file_type, created_at')
        .eq('related_id', req.params.related_id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attachments/download/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/attachments', authenticate, async (req, res) => {
    const { related_id, related_type, file_name, file_type, file_data } = req.body;
    const id = uuidv4();
    const userId = (req as any).user.id;
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('attachments').insert([{
        id, 
        user_id: userId,
        related_id, 
        related_type, 
        file_name, 
        file_type, 
        file_data, 
        created_at: now,
        updated_at: now
      }]);
      if (error) throw error;
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/attachments/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Daily Planner
  app.get('/api/planner', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('daily_planner')
        .select('*')
        .eq('is_archived', false)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/planner/summaries', authenticate, async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('date, summary')
        .eq('user_id', userId)
        .gte('date', start_date)
        .lte('date', end_date);
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/planner/:date', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('daily_planner')
        .select('*')
        .eq('date', req.params.date)
        .eq('is_archived', false)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/planner', authenticate, async (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    const userId = (req as any).user.id;
    try {
      const { data: existing } = await supabase
        .from('daily_planner')
        .select('id')
        .eq('date', date)
        .eq('item_key', item_key)
        .eq('user_id', userId)
        .single();
      
      const id = existing ? existing.id : uuidv4();
      
      const { error } = await supabase.from('daily_planner').upsert({
        id, 
        user_id: userId,
        date, 
        item_key, 
        time_range: time_range || '', 
        morning_status: morning_status || 0, 
        evening_status: evening_status || 0, 
        description: description || '', 
        detail: detail || '', 
        sort_order: sort_order || 0, 
        priority: priority || 0, 
        category: category || '', 
        estimated_time: estimated_time || '', 
        actual_time: actual_time || '', 
        assigned_to: assigned_to || '', 
        recurrence: recurrence || '', 
        color_tag: color_tag || '', 
        sub_tasks: sub_tasks || '', 
        comments: comments || '', 
        url: url || '', 
        is_archived: false,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      
      // Sync to calendar
      await createEvent({
        user_id: userId,
        title: item_key,
        date,
        type: 'production',
        time: time_range,
        description,
        related_id: id
      });
      await createNotification({
        user_id: userId,
        title: 'Planlayıcı Kaydı',
        message: `${item_key} planlayıcıya eklendi.`,
        type: 'info',
        related_id: id
      });

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/planner/:id', authenticate, async (req, res) => {
    const { date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url } = req.body;
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase.from('daily_planner').update({
        date, item_key, time_range, morning_status, evening_status, description, detail, sort_order, is_archived, priority, category, estimated_time, actual_time, assigned_to, recurrence, color_tag, sub_tasks, comments, url,
        updated_at: new Date().toISOString()
      }).eq('id', req.params.id).eq('user_id', userId);
      if (error) throw error;
      
      // Sync to calendar
      if (date || item_key || time_range || description) {
        await supabase.from('calendar_events').update({
          title: item_key, date, time: time_range, description, updated_at: new Date().toISOString()
        }).eq('related_id', req.params.id).eq('user_id', userId);
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/planner/:id', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      await supabase.from('daily_planner').delete().eq('id', req.params.id).eq('user_id', userId);
      await supabase.from('calendar_events').delete().eq('related_id', req.params.id).eq('user_id', userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Daily Summaries
  app.get('/api/planner/summary/:date', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('summary')
        .eq('date', req.params.date)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json({ summary: data ? data.summary : '' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/planner/summary', authenticate, async (req, res) => {
    const { date, summary } = req.body;
    const userId = (req as any).user.id;
    try {
      const { error } = await supabase.from('daily_summaries').upsert({ 
        user_id: userId,
        date, 
        summary: summary || '',
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });


  // AI Assistant Routes
  app.get('/api/ai/conversations', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/conversations/:id/messages', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', req.params.id)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/chat', authenticate, async (req, res) => {
    const { conversationId, message, modelType } = req.body;
    const userId = (req as any).user.id;
    try {
      const { nexusAI } = await import('./src/services/aiAssistantService');
      const response = await nexusAI.processMessage(userId, conversationId, message, modelType);
      res.json({ response });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/memories', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('ai_memories')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/insights', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/insights/generate', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    try {
      const { nexusAI } = await import('./src/services/aiAssistantService');
      await nexusAI.generateInsight(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/tasks', authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase
        .from('ai_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_at', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Generic CRUD helper for simple tables
  const registerCrud = (tableName: string, routeName: string, isPublic = false) => {
    const client = isPublic ? supabaseAdmin : supabase;

    app.get(`/api/${routeName}`, authenticate, async (req, res) => {
      try {
        const userId = (req as any).user.id;
        let query = client.from(tableName).select('*');
        
        if (!isPublic) {
          query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        
        let mappedData = data;
        if (tableName === TABLE_MAP.accounts) {
          mappedData = (data || []).map(mapAccountData);
        } else if (tableName === TABLE_MAP.stock) {
          mappedData = (data || []).map(mapStockData);
        }
        
        res.json(mappedData);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post(`/api/${routeName}`, authenticate, async (req, res) => {
      try {
        const userId = (req as any).user.id;
        const id = req.body.id || uuidv4();
        const payload = {
          ...req.body,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (!isPublic) {
          (payload as any).user_id = userId;
        }

        const { error } = await client.from(tableName).insert([payload]);
        if (error) throw error;
        res.json({ success: true, id });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });

    app.put(`/api/${routeName}/:id`, authenticate, async (req, res) => {
      try {
        const userId = (req as any).user.id;
        let query = client.from(tableName).update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id);
        
        if (!isPublic) {
          query = query.eq('user_id', userId);
        }

        const { error } = await query;
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete(`/api/${routeName}/:id`, authenticate, async (req, res) => {
      try {
        const userId = (req as any).user.id;
        let query = client.from(tableName).delete().eq('id', req.params.id);
        
        if (!isPublic) {
          query = query.eq('user_id', userId);
        }

        const { error } = await query;
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });
  };

  // Register CRUD for tables
  registerCrud(TABLE_MAP.accounts, 'accounts', true);
  registerCrud(TABLE_MAP.stock, 'stocks', true);
  registerCrud('documents', 'documents');
  registerCrud('templates', 'templates');
  registerCrud('media_items', 'media-items');
  registerCrud('news_subscriptions', 'news-subscriptions');
  registerCrud('reminders', 'reminders');
  registerCrud('subscriptions', 'subscriptions');
  registerCrud('investments', 'investments');
  registerCrud('wishlists', 'wishlists');
  registerCrud('answers', 'answers');
  registerCrud('budget_incomes', 'budget-incomes');
  registerCrud('budget_expenses', 'budget-expenses');
  registerCrud('ai_knowledge_base', 'ai/knowledge-base');
  registerCrud('ai_agent_configs', 'ai/agent-configs');

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

  // AI Heartbeat - Periodically generate insights for all users
  const runHeartbeat = async () => {
    try {
      console.log('Testing query to ai_profiles...');
      const { data, error } = await supabase.from('ai_profiles').select('*').limit(1);
      console.log('Result:', { data, error });
      
      const { nexusAI } = await import('./src/services/aiAssistantService');
      console.log('AI Heartbeat: Generating insights for all users...');
      
      // Diagnostic: Check if table exists
      const { data: tables, error: tableError } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public').eq('table_name', 'ai_profiles');
      if (tableError) {
        console.warn('Diagnostic: Could not check ai_profiles table existence:', tableError.message);
      } else if (!tables || tables.length === 0) {
        console.warn('Diagnostic: ai_profiles table does not exist.');
      }

      try {
        const { data: profiles, error: profilesError } = await supabase.from('ai_profiles').select('user_id');
        
        if (profilesError) {
          if (profilesError.code === 'PGRST205') {
            console.warn('AI Heartbeat skipped: "ai_profiles" table not found in Supabase. Please run the SQL schema migrations.');
            return; // Exit heartbeat gracefully
          }
          throw profilesError;
        }

        if (profiles) {
          for (const profile of profiles) {
            if (profile.user_id) {
              try {
                await nexusAI.generateInsight(profile.user_id);
              } catch (userErr) {
                console.error(`AI Heartbeat Error for user ${profile.user_id}:`, userErr instanceof Error ? userErr.message : JSON.stringify(userErr));
              }
            }
          }
        }
      } catch (profilesErr) {
        console.error('AI Heartbeat Error (profiles fetch):', profilesErr instanceof Error ? profilesErr.message : JSON.stringify(profilesErr));
      }
    } catch (err) {
      console.error('AI Heartbeat Error:', err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  runHeartbeat();
  setInterval(runHeartbeat, 1000 * 60 * 5); // Every 5 minutes

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
