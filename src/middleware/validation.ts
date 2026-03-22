import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['Tedarikçi', 'Müşteri', 'Personel', 'Ortak', 'Diğer']),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const stockSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(2).max(100),
  category: z.string().optional().nullable(),
  unit: z.string().min(1),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional(),
  critical_level: z.number().min(0).optional(),
});

export const jobSchema = z.object({
  account_id: z.string().uuid(),
  receipt_no: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string(),
  status: z.enum(['Açık', 'Kısmi', 'Tamamlandı', 'İptal', 'Beklemede']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().optional().nullable(),
});
