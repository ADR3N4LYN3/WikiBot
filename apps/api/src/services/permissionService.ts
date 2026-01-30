import { prisma } from '@wikibot/database';
import {
  Permission,
  MemberRole,
  PermissionOverrides,
  EffectivePermissions,
  ROLE_DEFAULT_PERMISSIONS,
  calculateEffectivePermissions,
  isValidPermission,
  canManageRole,
} from '@wikibot/shared';

import { AppError } from '../middleware/errorHandler';

/**
 * Get the effective permissions for a member
 */
export async function getMemberPermissions(
  serverId: string,
  userId: string
): Promise<EffectivePermissions | null> {
  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId } },
    include: { permissions: true },
  });

  if (!member) return null;

  const role = member.role as MemberRole;
  const overrides = (member.permissions?.permissions as PermissionOverrides) || {};
  const permissions = calculateEffectivePermissions(role, overrides);

  const hasOverrides = Object.keys(overrides).length > 0;

  return {
    permissions,
    role,
    source: hasOverrides ? 'mixed' : 'role',
    overrides,
  };
}

/**
 * Check if a member has a specific permission
 */
export async function hasPermission(
  serverId: string,
  userId: string,
  permission: Permission
): Promise<boolean> {
  const perms = await getMemberPermissions(serverId, userId);
  if (!perms) return false;
  return perms.permissions.includes(permission);
}

/**
 * Check if a member has all of the specified permissions
 */
export async function hasAllPermissions(
  serverId: string,
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const perms = await getMemberPermissions(serverId, userId);
  if (!perms) return false;
  return permissions.every((p) => perms.permissions.includes(p));
}

/**
 * Check if a member has any of the specified permissions
 */
export async function hasAnyPermission(
  serverId: string,
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const perms = await getMemberPermissions(serverId, userId);
  if (!perms) return false;
  return permissions.some((p) => perms.permissions.includes(p));
}

/**
 * Update custom permission overrides for a member
 */
export async function updateMemberPermissions(
  serverId: string,
  targetUserId: string,
  overrides: Partial<Record<string, boolean | null>>,
  actorId: string
): Promise<EffectivePermissions> {
  // Get actor's permissions and role
  const actorMember = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId: actorId } },
    include: { permissions: true },
  });

  if (!actorMember) {
    throw new AppError(403, 'Forbidden', 'You are not a member of this server');
  }

  const actorRole = actorMember.role as MemberRole;
  const actorPerms = await getMemberPermissions(serverId, actorId);

  // Check if actor can manage members
  if (!actorPerms?.permissions.includes('members:manage')) {
    throw new AppError(403, 'Forbidden', 'Permission required: members:manage');
  }

  // Get target member
  const targetMember = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId: targetUserId } },
    include: { permissions: true },
  });

  if (!targetMember) {
    throw new AppError(404, 'Not Found', 'Member not found');
  }

  const targetRole = targetMember.role as MemberRole;

  // Cannot modify owner's permissions
  if (targetRole === 'owner') {
    throw new AppError(403, 'Forbidden', 'Cannot modify owner permissions');
  }

  // Can only modify members with lower role
  if (!canManageRole(actorRole, targetRole)) {
    throw new AppError(403, 'Forbidden', 'Cannot modify this member');
  }

  // Validate permissions and build new overrides
  const currentOverrides = (targetMember.permissions?.permissions as PermissionOverrides) || {};
  const newOverrides: PermissionOverrides = { ...currentOverrides };

  for (const [perm, value] of Object.entries(overrides)) {
    // Validate permission key
    if (!isValidPermission(perm)) {
      throw new AppError(400, 'Bad Request', `Invalid permission: ${perm}`);
    }

    // Actor cannot grant permissions they don't have
    if (value === true && !actorPerms.permissions.includes(perm as Permission)) {
      throw new AppError(403, 'Forbidden', `Cannot grant permission you don't have: ${perm}`);
    }

    if (value === null) {
      // Reset to role default
      delete newOverrides[perm as Permission];
    } else {
      newOverrides[perm as Permission] = value;
    }
  }

  // Upsert permissions
  await prisma.memberPermission.upsert({
    where: { memberId: targetMember.id },
    create: {
      memberId: targetMember.id,
      permissions: newOverrides,
    },
    update: {
      permissions: newOverrides,
    },
  });

  // Return updated permissions
  const updated = await getMemberPermissions(serverId, targetUserId);
  if (!updated) {
    throw new AppError(500, 'Internal Error', 'Failed to retrieve updated permissions');
  }

  return updated;
}

/**
 * Reset all custom permissions to role defaults
 */
export async function resetMemberPermissions(
  serverId: string,
  targetUserId: string,
  actorId: string
): Promise<void> {
  const actorPerms = await getMemberPermissions(serverId, actorId);

  if (!actorPerms?.permissions.includes('members:manage')) {
    throw new AppError(403, 'Forbidden', 'Permission required: members:manage');
  }

  const targetMember = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId: targetUserId } },
  });

  if (!targetMember) {
    throw new AppError(404, 'Not Found', 'Member not found');
  }

  // Delete custom permissions if they exist
  await prisma.memberPermission.deleteMany({
    where: { memberId: targetMember.id },
  });
}

/**
 * Get all servers where a user is a member (for dashboard access)
 */
export async function getUserServers(userId: string) {
  const memberships = await prisma.serverMember.findMany({
    where: { userId },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          premiumTier: true,
        },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.server.id,
    name: m.server.name,
    role: m.role,
    source: m.source,
    premiumTier: m.server.premiumTier,
    joinedAt: m.joinedAt,
  }));
}

/**
 * Check if a user is a member of a server (either via Discord or WikiBot)
 */
export async function isServerMember(serverId: string, userId: string): Promise<boolean> {
  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId } },
    select: { id: true },
  });
  return !!member;
}

/**
 * Get default permissions for a role
 */
export function getRolePermissions(role: MemberRole): Permission[] {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
}
