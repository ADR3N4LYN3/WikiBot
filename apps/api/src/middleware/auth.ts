import { Request, Response, NextFunction } from 'express';

import { AppError } from './errorHandler';

// Extended Request type with serverId
export interface AuthenticatedRequest extends Request {
  serverId: string;
  userId?: string;
  isBot?: boolean;
}

// Check if request is from the bot
function isBotRequest(req: Request): boolean {
  const botToken = req.headers['x-bot-token'] as string;
  const expectedToken = process.env.BOT_API_SECRET;

  // If no secret is configured, allow bot requests (dev mode)
  if (!expectedToken) {
    return !!botToken;
  }

  return botToken === expectedToken;
}

// Simple auth middleware - accepts both user JWT and bot token
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // Check for bot token first
  if (isBotRequest(req)) {
    (req as AuthenticatedRequest).isBot = true;
    return next();
  }

  // Check for user Bearer token
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
export function requireServerId(req: Request, _res: Response, next: NextFunction) {
  const serverId = req.headers['x-server-id'] as string || req.query.serverId as string;

  if (!serverId) {
    throw new AppError(400, 'Bad Request', 'Server ID is required');
  }

  // Attach serverId to request
  (req as AuthenticatedRequest).serverId = serverId;

  next();
}

// Alias for extractServerId
export const extractServerId = requireServerId;
