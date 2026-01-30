import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { requireAuth, requireServerId, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as memberService from '../services/memberService';

export const membersRouter = Router();

// Wrapper to handle async middleware with proper typing
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

// Validation schemas
const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
  username: z.string().optional(),
  discriminator: z.string().optional(),
  avatar: z.string().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});

// Apply auth and serverId middleware to all routes
membersRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
membersRouter.use(requireServerId);

// Get all members of a server
membersRouter.get('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Check if user has at least viewer role
  if (user && !req.isBot) {
    const hasAccess = await memberService.hasRole(serverId, user.id, 'viewer');
    if (!hasAccess) {
      throw new AppError(403, 'Forbidden', 'You do not have access to this server');
    }
  }

  const members = await memberService.getServerMembers(serverId);
  res.json(members);
}));

// Get current user's role
membersRouter.get('/me', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const member = await memberService.getServerMember(serverId, user.id);

  if (!member) {
    res.json({ role: null, isMember: false });
    return;
  }

  res.json({
    role: member.role,
    isMember: true,
    user: member.user,
  });
}));

// Get a specific member
membersRouter.get('/:userId', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const { userId } = req.params;
  const user = req.user;

  // Check if user has at least viewer role
  if (user && !req.isBot) {
    const hasAccess = await memberService.hasRole(serverId, user.id, 'viewer');
    if (!hasAccess) {
      throw new AppError(403, 'Forbidden', 'You do not have access to this server');
    }
  }

  const member = await memberService.getServerMember(serverId, userId);

  if (!member) {
    throw new AppError(404, 'Not Found', 'Member not found');
  }

  res.json(member);
}));

// Add a member to the server
membersRouter.post('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  // Check if user has at least admin role
  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to add members');
  }

  const input = addMemberSchema.parse(req.body);

  const userData = input.username && input.discriminator
    ? { username: input.username, discriminator: input.discriminator, avatar: input.avatar }
    : undefined;

  const member = await memberService.addServerMember(
    serverId,
    input.userId,
    input.role as memberService.MemberRole,
    userData
  );

  res.status(201).json(member);
}));

// Update a member's role
membersRouter.put('/:userId/role', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const { userId } = req.params;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const input = updateRoleSchema.parse(req.body);

  const member = await memberService.updateMemberRole(
    serverId,
    userId,
    input.role as memberService.MemberRole,
    user.id
  );

  res.json(member);
}));

// Remove a member from the server
membersRouter.delete('/:userId', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const { userId } = req.params;
  const user = req.user;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  await memberService.removeServerMember(serverId, userId, user.id);

  res.status(204).send();
}));

// Transfer server ownership
membersRouter.post('/transfer-ownership', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;
  const { newOwnerId } = req.body;

  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  if (!newOwnerId) {
    throw new AppError(400, 'Bad Request', 'newOwnerId is required');
  }

  await memberService.transferOwnership(serverId, newOwnerId, user.id);

  res.json({ success: true, message: 'Ownership transferred successfully' });
}));
