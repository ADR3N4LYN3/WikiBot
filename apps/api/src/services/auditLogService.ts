import { prisma } from '@wikibot/database';

export type AuditAction =
  | 'article_create'
  | 'article_update'
  | 'article_delete'
  | 'category_create'
  | 'category_update'
  | 'category_delete'
  | 'category_reorder'
  | 'settings_update'
  | 'member_add'
  | 'member_update'
  | 'member_remove'
  | 'ownership_transfer'
  | 'import_articles'
  | 'export_articles';

export type EntityType = 'article' | 'category' | 'settings' | 'member' | 'server';

interface CreateAuditLogInput {
  serverId: string;
  actorId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Create an audit log entry
export async function createAuditLog(input: CreateAuditLogInput) {
  const log = await prisma.auditLog.create({
    data: {
      serverId: input.serverId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details ? JSON.stringify(input.details) : null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  return log;
}

// Get audit logs for a server
export async function getAuditLogs(
  serverId: string,
  options: {
    limit?: number;
    offset?: number;
    entityType?: EntityType;
    action?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const {
    limit = 50,
    offset = 0,
    entityType,
    action,
    actorId,
    startDate,
    endDate,
  } = options;

  const where: Record<string, unknown> = { serverId };

  if (entityType) {
    where.entityType = entityType;
  }

  if (action) {
    where.action = action;
  }

  if (actorId) {
    where.actorId = actorId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      (where.createdAt as Record<string, Date>).gte = startDate;
    }
    if (endDate) {
      (where.createdAt as Record<string, Date>).lte = endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Parse details JSON
  const parsedLogs = logs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
  }));

  return {
    logs: parsedLogs,
    total,
    limit,
    offset,
  };
}

// Get audit log by ID
export async function getAuditLogById(serverId: string, logId: string) {
  const log = await prisma.auditLog.findFirst({
    where: { id: logId, serverId },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });

  if (log && log.details) {
    return {
      ...log,
      details: JSON.parse(log.details),
    };
  }

  return log;
}

// Helper to log article actions
export async function logArticleAction(
  serverId: string,
  actorId: string,
  action: 'article_create' | 'article_update' | 'article_delete',
  articleId: string,
  details?: { title?: string; slug?: string; changes?: Record<string, unknown> },
  request?: { ip?: string; userAgent?: string }
) {
  return createAuditLog({
    serverId,
    actorId,
    action,
    entityType: 'article',
    entityId: articleId,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}

// Helper to log category actions
export async function logCategoryAction(
  serverId: string,
  actorId: string,
  action: 'category_create' | 'category_update' | 'category_delete' | 'category_reorder',
  categoryId: string,
  details?: { name?: string; slug?: string; changes?: Record<string, unknown> },
  request?: { ip?: string; userAgent?: string }
) {
  return createAuditLog({
    serverId,
    actorId,
    action,
    entityType: 'category',
    entityId: categoryId,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}

// Helper to log member actions
export async function logMemberAction(
  serverId: string,
  actorId: string,
  action: 'member_add' | 'member_update' | 'member_remove' | 'ownership_transfer',
  memberId: string,
  details?: { username?: string; oldRole?: string; newRole?: string },
  request?: { ip?: string; userAgent?: string }
) {
  return createAuditLog({
    serverId,
    actorId,
    action,
    entityType: 'member',
    entityId: memberId,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}

// Helper to log settings changes
export async function logSettingsChange(
  serverId: string,
  actorId: string,
  changes: Record<string, { old: unknown; new: unknown }>,
  request?: { ip?: string; userAgent?: string }
) {
  return createAuditLog({
    serverId,
    actorId,
    action: 'settings_update',
    entityType: 'settings',
    entityId: serverId,
    details: { changes },
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}
