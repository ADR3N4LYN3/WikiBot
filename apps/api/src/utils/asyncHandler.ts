import { Request, Response, NextFunction } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Wrapper to handle async middleware with proper typing.
 * Catches errors and forwards them to Express error handler.
 */
export const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};
