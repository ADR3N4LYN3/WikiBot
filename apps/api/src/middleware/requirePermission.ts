import { Permission } from '@wikibot/shared';
import { Request, Response, NextFunction } from 'express';

import * as permissionService from '../services/permissionService';

import { AuthenticatedRequest } from './auth';
import { AppError } from './errorHandler';

/**
 * Middleware factory to require a specific permission
 * Bot requests bypass permission checks
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Bot bypass - bot has all permissions
      if (authReq.isBot) {
        return next();
      }

      // User authentication required
      if (!authReq.user) {
        throw new AppError(401, 'Unauthorized', 'Authentication required');
      }

      if (!authReq.serverId) {
        throw new AppError(400, 'Bad Request', 'Server ID is required');
      }

      // Check permission
      const hasAccess = await permissionService.hasPermission(
        authReq.serverId,
        authReq.user.id,
        permission
      );

      if (!hasAccess) {
        throw new AppError(403, 'Forbidden', `Permission required: ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware factory to require ALL of the specified permissions
 * Bot requests bypass permission checks
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Bot bypass
      if (authReq.isBot) {
        return next();
      }

      if (!authReq.user) {
        throw new AppError(401, 'Unauthorized', 'Authentication required');
      }

      if (!authReq.serverId) {
        throw new AppError(400, 'Bad Request', 'Server ID is required');
      }

      const hasAccess = await permissionService.hasAllPermissions(
        authReq.serverId,
        authReq.user.id,
        permissions
      );

      if (!hasAccess) {
        throw new AppError(403, 'Forbidden', `Permissions required: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware factory to require ANY of the specified permissions
 * Bot requests bypass permission checks
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Bot bypass
      if (authReq.isBot) {
        return next();
      }

      if (!authReq.user) {
        throw new AppError(401, 'Unauthorized', 'Authentication required');
      }

      if (!authReq.serverId) {
        throw new AppError(400, 'Bad Request', 'Server ID is required');
      }

      const hasAccess = await permissionService.hasAnyPermission(
        authReq.serverId,
        authReq.user.id,
        permissions
      );

      if (!hasAccess) {
        throw new AppError(403, 'Forbidden', `One of these permissions required: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to require user authentication (not bot)
 * Use when an action must be performed by a human user
 */
export function requireUserAuth(req: Request, _res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    throw new AppError(401, 'Unauthorized', 'User authentication required');
  }

  if (authReq.isBot) {
    throw new AppError(403, 'Forbidden', 'This action requires user authentication');
  }

  next();
}

/**
 * Middleware to check if user is a server member (with any role)
 * Bot requests bypass this check
 */
export function requireMembership() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Bot bypass
      if (authReq.isBot) {
        return next();
      }

      if (!authReq.user) {
        throw new AppError(401, 'Unauthorized', 'Authentication required');
      }

      if (!authReq.serverId) {
        throw new AppError(400, 'Bad Request', 'Server ID is required');
      }

      const isMember = await permissionService.isServerMember(authReq.serverId, authReq.user.id);

      if (!isMember) {
        throw new AppError(403, 'Forbidden', 'You are not a member of this server');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
