import 'express';

declare global {
  namespace Express {
    interface Request {
      serverId?: string;
      userId?: string;
      user?: {
        id?: string;
      };
    }
  }
}
