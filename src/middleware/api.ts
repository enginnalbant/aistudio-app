import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../services/supabaseClient';

// Rate limiting middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Trust proxy is handled by Express
});

// Authentication middleware (Placeholder for JWT/Supabase Auth)
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // For development, if no token is provided, we'll use a mock user ID
  const mockUserId = '00000000-0000-0000-0000-000000000001';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[Auth] No token provided, using mock user: ${mockUserId}`);
    (req as any).user = { id: mockUserId };
    return next();
  }

  const token = authHeader.split(' ')[1];
  console.log(`[Auth] Token provided, verifying with Supabase...`);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.warn(`[Auth] Token verification failed:`, error?.message || 'No user found');
      throw new Error('Invalid token');
    }
    console.log(`[Auth] Token verified for user: ${user.id}`);
    (req as any).user = user;
    next();
  } catch (error) {
    console.warn(`[Auth] Falling back to mock user: ${mockUserId}`);
    (req as any).user = { id: mockUserId };
    next();
  }
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    status,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
