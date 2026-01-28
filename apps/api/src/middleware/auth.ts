import { Request, Response, NextFunction } from 'express';

import { AppError } from './errorHandler';

// Simple auth middleware - In production, verify JWT from NextAuth
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Unauthorized', 'No authentication token provided');
  }

  // TODO: Verify JWT token from NextAuth
  // For now, we'll just extract the token
  const token = authHeader.substring(7);

  if (!token) {
    throw new AppError(401, 'Unauthorized', 'Invalid authentication token');
  }

  // Attach user info to request (after JWT verification)
  // req.user = decodedToken;

  next();
}

// Middleware to extract serverId from request
export function requireServerId(req: Request, res: Response, next: NextFunction) {
  const serverId = req.headers['x-server-id'] as string || req.query.serverId as string;

  if (!serverId) {
    throw new AppError(400, 'Bad Request', 'Server ID is required');
  }

  // Attach serverId to request
  (req as any).serverId = serverId;

  next();
}
