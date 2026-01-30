import { Router, Request, Response, NextFunction } from 'express';

import { requireAuth, requireServerId, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as auditLogService from '../services/auditLogService';
import * as memberService from '../services/memberService';

export const auditLogsRouter = Router();

// Wrapper to handle async middleware with proper typing
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

// Apply auth and serverId middleware to all routes
auditLogsRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
auditLogsRouter.use(requireServerId);

// Get audit logs for a server (admin only)
auditLogsRouter.get('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  // Check if user has at least admin role
  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to view audit logs');
  }

  const {
    limit = '50',
    offset = '0',
    entityType,
    action,
    actorId,
    startDate,
    endDate,
  } = req.query;

  const result = await auditLogService.getAuditLogs(serverId, {
    limit: Number(limit),
    offset: Number(offset),
    entityType: entityType as auditLogService.EntityType,
    action: action as string,
    actorId: actorId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.json(result);
}));

// Get a specific audit log entry
auditLogsRouter.get('/:logId', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const { logId } = req.params;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  // Check if user has at least admin role
  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to view audit logs');
  }

  const log = await auditLogService.getAuditLogById(serverId, logId);

  if (!log) {
    throw new AppError(404, 'Not Found', 'Audit log not found');
  }

  res.json(log);
}));
