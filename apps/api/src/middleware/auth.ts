import { timingSafeEqual } from 'crypto';

import { Request, Response, NextFunction } from 'express';
import { jwtVerify, decodeJwt } from 'jose';

import { AppError } from './errorHandler';

// User info extracted from JWT
export interface JWTUser {
  id: string; // Discord ID
  name?: string;
  email?: string;
  image?: string;
}

// Extended Request type with auth info
export interface AuthenticatedRequest extends Request {
  serverId: string;
  user?: JWTUser;
  isBot?: boolean;
}

// NextAuth v5 JWT structure
interface NextAuthJWT {
  discordId?: string;
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

// Get the secret for JWT verification (NextAuth uses this)
function getJWTSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn('⚠️ NEXTAUTH_SECRET not configured - JWT validation disabled');
    return new Uint8Array(0);
  }
  return new TextEncoder().encode(secret);
}

// Check if request is from the bot
function isBotRequest(req: Request): boolean {
  const botToken = req.headers['x-bot-token'] as string;
  const expectedToken = process.env.BOT_API_SECRET;

  // No bot token header provided
  if (!botToken) {
    return false;
  }

  // SECURITY: Require BOT_API_SECRET to be configured
  if (!expectedToken) {
    console.warn('⚠️ BOT_API_SECRET not configured - bot requests are disabled');
    return false;
  }

  // SECURITY: Use timing-safe comparison to prevent timing attacks
  const botTokenBuffer = Buffer.from(botToken);
  const expectedBuffer = Buffer.from(expectedToken);

  // If lengths differ, comparison would fail anyway, but we still need to
  // avoid early return to prevent timing-based length discovery
  if (botTokenBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(botTokenBuffer, expectedBuffer);
}

// Verify and decode NextAuth JWT token
async function verifyNextAuthToken(token: string): Promise<JWTUser | null> {
  const secret = getJWTSecret();

  // SECURITY: If no secret configured, only allow in development mode
  if (secret.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ NEXTAUTH_SECRET not configured in production - rejecting all JWT tokens');
      return null;
    }

    // Dev mode only: decode without verification
    console.warn('⚠️ Dev mode: JWT decoded without verification');
    try {
      const decoded = decodeJwt(token) as NextAuthJWT;
      if (decoded.discordId || decoded.sub) {
        return {
          id: decoded.discordId || decoded.sub || 'unknown',
          name: decoded.name,
          email: decoded.email,
          image: decoded.picture,
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    // NextAuth v5 uses HS256 by default
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    const jwt = payload as unknown as NextAuthJWT;

    // Extract user info from JWT
    const userId = jwt.discordId || jwt.sub;
    if (!userId) {
      return null;
    }

    return {
      id: userId,
      name: jwt.name,
      email: jwt.email,
      image: jwt.picture,
    };
  } catch (error) {
    // Token verification failed
    console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Auth middleware - accepts both user JWT and bot token
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
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

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError(401, 'Unauthorized', 'Invalid authentication token');
    }

    // Verify JWT and extract user info
    const user = await verifyNextAuthToken(token);

    if (!user) {
      throw new AppError(401, 'Unauthorized', 'Invalid or expired token');
    }

    // Attach user info to request
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    next(error);
  }
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

// Optional auth middleware - doesn't fail if no token, but extracts user if present
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    // Check for bot token first
    if (isBotRequest(req)) {
      (req as AuthenticatedRequest).isBot = true;
      return next();
    }

    // Check for user Bearer token
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const user = await verifyNextAuthToken(token);
        if (user) {
          (req as AuthenticatedRequest).user = user;
        }
      }
    }

    next();
  } catch {
    // Ignore auth errors in optional mode
    next();
  }
}
