import { prisma } from '@wikibot/database';

import { AppError } from '../middleware/errorHandler';

export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

// Check if a role has permission to perform an action on another role
export function canManageRole(actorRole: MemberRole, targetRole: MemberRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

// Get all members of a server
export async function getServerMembers(serverId: string) {
  const members = await prisma.serverMember.findMany({
    where: { serverId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' },
      { joinedAt: 'asc' },
    ],
  });

  return members;
}

// Get a specific member
export async function getServerMember(serverId: string, userId: string) {
  const member = await prisma.serverMember.findUnique({
    where: {
      serverId_userId: { serverId, userId },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });

  return member;
}

// Get user's role in a server
export async function getUserRole(serverId: string, userId: string): Promise<MemberRole | null> {
  const member = await prisma.serverMember.findUnique({
    where: {
      serverId_userId: { serverId, userId },
    },
    select: { role: true },
  });

  return member?.role as MemberRole | null;
}

// Check if user has at least the specified role
export async function hasRole(serverId: string, userId: string, minRole: MemberRole): Promise<boolean> {
  const role = await getUserRole(serverId, userId);
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

// Add a member to a server
export async function addServerMember(
  serverId: string,
  userId: string,
  role: MemberRole = 'viewer',
  userData?: { username: string; discriminator: string; avatar?: string }
) {
  // Ensure user exists
  if (userData) {
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
      },
      update: {
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
      },
    });
  }

  const member = await prisma.serverMember.upsert({
    where: {
      serverId_userId: { serverId, userId },
    },
    create: {
      serverId,
      userId,
      role,
    },
    update: {
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });

  return member;
}

// Update a member's role
export async function updateMemberRole(
  serverId: string,
  userId: string,
  newRole: MemberRole,
  actorId: string
) {
  // Get actor's role
  const actorRole = await getUserRole(serverId, actorId);
  if (!actorRole) {
    throw new AppError(403, 'Forbidden', 'You are not a member of this server');
  }

  // Get target's current role
  const targetRole = await getUserRole(serverId, userId);
  if (!targetRole) {
    throw new AppError(404, 'Not Found', 'Member not found');
  }

  // Check permissions
  if (!canManageRole(actorRole, targetRole)) {
    throw new AppError(403, 'Forbidden', 'You cannot modify this member\'s role');
  }

  if (!canManageRole(actorRole, newRole) && actorRole !== newRole) {
    throw new AppError(403, 'Forbidden', 'You cannot assign this role');
  }

  // Cannot change owner role (must transfer ownership separately)
  if (targetRole === 'owner') {
    throw new AppError(403, 'Forbidden', 'Cannot change owner role. Use transfer ownership instead.');
  }

  const member = await prisma.serverMember.update({
    where: {
      serverId_userId: { serverId, userId },
    },
    data: { role: newRole },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });

  return member;
}

// Remove a member from a server
export async function removeServerMember(serverId: string, userId: string, actorId: string) {
  // Get actor's role
  const actorRole = await getUserRole(serverId, actorId);
  if (!actorRole) {
    throw new AppError(403, 'Forbidden', 'You are not a member of this server');
  }

  // Get target's role
  const targetRole = await getUserRole(serverId, userId);
  if (!targetRole) {
    throw new AppError(404, 'Not Found', 'Member not found');
  }

  // Cannot remove owner
  if (targetRole === 'owner') {
    throw new AppError(403, 'Forbidden', 'Cannot remove the server owner');
  }

  // Check permissions (can only remove members with lower role)
  if (!canManageRole(actorRole, targetRole) && actorId !== userId) {
    throw new AppError(403, 'Forbidden', 'You cannot remove this member');
  }

  await prisma.serverMember.delete({
    where: {
      serverId_userId: { serverId, userId },
    },
  });
}

// Transfer ownership to another member
export async function transferOwnership(serverId: string, newOwnerId: string, currentOwnerId: string) {
  // Verify current owner
  const currentRole = await getUserRole(serverId, currentOwnerId);
  if (currentRole !== 'owner') {
    throw new AppError(403, 'Forbidden', 'Only the owner can transfer ownership');
  }

  // Verify new owner exists as member
  const newOwnerRole = await getUserRole(serverId, newOwnerId);
  if (!newOwnerRole) {
    throw new AppError(404, 'Not Found', 'New owner must be a member of the server');
  }

  // Perform transfer in transaction
  await prisma.$transaction([
    // Demote current owner to admin
    prisma.serverMember.update({
      where: { serverId_userId: { serverId, userId: currentOwnerId } },
      data: { role: 'admin' },
    }),
    // Promote new owner
    prisma.serverMember.update({
      where: { serverId_userId: { serverId, userId: newOwnerId } },
      data: { role: 'owner' },
    }),
  ]);
}

// Ensure a server has an owner (used when creating/syncing servers)
export async function ensureServerOwner(serverId: string, ownerId: string, ownerData?: { username: string; discriminator: string; avatar?: string }) {
  const existingOwner = await prisma.serverMember.findFirst({
    where: { serverId, role: 'owner' },
  });

  if (!existingOwner) {
    await addServerMember(serverId, ownerId, 'owner', ownerData);
  }
}
