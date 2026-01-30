// Permission system types and constants

/**
 * All available permissions in WikiBot
 */
export const PERMISSIONS = {
  // Articles
  'articles:read': 'View articles',
  'articles:write': 'Create and edit articles',
  'articles:delete': 'Delete articles',
  'articles:publish': 'Publish/unpublish articles',

  // Categories
  'categories:read': 'View categories',
  'categories:write': 'Create and edit categories',
  'categories:delete': 'Delete categories',

  // Settings
  'settings:read': 'View server settings',
  'settings:manage': 'Modify server settings',

  // Members
  'members:read': 'View member list',
  'members:manage': 'Add/remove/modify members',

  // Logs
  'logs:read': 'View audit logs',

  // Stats/Analytics
  'stats:read': 'View analytics and statistics',

  // Billing
  'billing:read': 'View subscription info',
  'billing:manage': 'Manage subscription and billing',
} as const;

/**
 * Permission type - one of the available permission keys
 */
export type Permission = keyof typeof PERMISSIONS;

/**
 * All permission keys as an array
 */
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

/**
 * Member role type
 */
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Role hierarchy - higher number = more power
 */
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Default permissions for each role
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: ALL_PERMISSIONS,

  admin: [
    'articles:read',
    'articles:write',
    'articles:delete',
    'articles:publish',
    'categories:read',
    'categories:write',
    'categories:delete',
    'settings:read',
    'settings:manage',
    'members:read',
    'members:manage',
    'logs:read',
    'stats:read',
    'billing:read',
  ],

  editor: [
    'articles:read',
    'articles:write',
    'articles:publish',
    'categories:read',
    'categories:write',
    'settings:read',
    'members:read',
    'stats:read',
  ],

  viewer: [
    'articles:read',
    'categories:read',
    'settings:read',
    'stats:read',
  ],
};

/**
 * Member source - how the member was added
 */
export type MemberSource = 'discord' | 'wikibot' | 'invite';

/**
 * Custom permission overrides stored in database
 * - true: permission explicitly granted
 * - false: permission explicitly denied
 * - null/undefined: use role default
 */
export type PermissionOverrides = Partial<Record<Permission, boolean>>;

/**
 * Effective permissions for a member
 */
export interface EffectivePermissions {
  permissions: Permission[];
  role: MemberRole;
  source: 'role' | 'custom' | 'mixed';
  overrides: PermissionOverrides;
}

/**
 * Permission check result with context
 */
export interface PermissionCheckResult {
  allowed: boolean;
  permission: Permission;
  role: MemberRole;
  isOverride: boolean;
}

/**
 * Check if a role has permission to manage another role
 */
export function canManageRole(actorRole: MemberRole, targetRole: MemberRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get permissions for a role (without overrides)
 */
export function getDefaultPermissions(role: MemberRole): Permission[] {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
}

/**
 * Calculate effective permissions from role and overrides
 */
export function calculateEffectivePermissions(
  role: MemberRole,
  overrides: PermissionOverrides = {}
): Permission[] {
  const rolePermissions = new Set(getDefaultPermissions(role));

  for (const [perm, value] of Object.entries(overrides)) {
    if (value === true) {
      rolePermissions.add(perm as Permission);
    } else if (value === false) {
      rolePermissions.delete(perm as Permission);
    }
  }

  return Array.from(rolePermissions);
}

/**
 * Check if a permission is valid
 */
export function isValidPermission(permission: string): permission is Permission {
  return permission in PERMISSIONS;
}

/**
 * Group permissions by category
 */
export function getPermissionsByCategory(): Record<string, { key: Permission; label: string }[]> {
  const categories: Record<string, { key: Permission; label: string }[]> = {};

  for (const [key, label] of Object.entries(PERMISSIONS)) {
    const category = key.split(':')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key: key as Permission, label });
  }

  return categories;
}
