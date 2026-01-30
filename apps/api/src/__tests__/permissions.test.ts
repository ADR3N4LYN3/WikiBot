import {
  calculateEffectivePermissions,
  canManageRole,
  getDefaultPermissions,
  isValidPermission,
  getPermissionsByCategory,
  PERMISSIONS,
  ROLE_HIERARCHY,
} from '@wikibot/shared';

describe('Permission System', () => {
  describe('PERMISSIONS', () => {
    it('should have all expected permission categories', () => {
      const categories = ['articles', 'categories', 'settings', 'members', 'logs', 'stats', 'billing'];
      const permissionKeys = Object.keys(PERMISSIONS);

      categories.forEach((category) => {
        const hasCategory = permissionKeys.some((key) => key.startsWith(`${category}:`));
        expect(hasCategory).toBe(true);
      });
    });
  });

  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy order', () => {
      expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
      expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
    });
  });

  describe('canManageRole', () => {
    it('should allow owner to manage all other roles', () => {
      expect(canManageRole('owner', 'admin')).toBe(true);
      expect(canManageRole('owner', 'editor')).toBe(true);
      expect(canManageRole('owner', 'viewer')).toBe(true);
    });

    it('should not allow owner to manage another owner', () => {
      expect(canManageRole('owner', 'owner')).toBe(false);
    });

    it('should allow admin to manage editor and viewer', () => {
      expect(canManageRole('admin', 'editor')).toBe(true);
      expect(canManageRole('admin', 'viewer')).toBe(true);
    });

    it('should not allow admin to manage owner or admin', () => {
      expect(canManageRole('admin', 'owner')).toBe(false);
      expect(canManageRole('admin', 'admin')).toBe(false);
    });

    it('should not allow editor to manage anyone except viewer', () => {
      expect(canManageRole('editor', 'owner')).toBe(false);
      expect(canManageRole('editor', 'admin')).toBe(false);
      expect(canManageRole('editor', 'editor')).toBe(false);
      expect(canManageRole('editor', 'viewer')).toBe(true);
    });

    it('should not allow viewer to manage anyone', () => {
      expect(canManageRole('viewer', 'owner')).toBe(false);
      expect(canManageRole('viewer', 'admin')).toBe(false);
      expect(canManageRole('viewer', 'editor')).toBe(false);
      expect(canManageRole('viewer', 'viewer')).toBe(false);
    });
  });

  describe('getDefaultPermissions', () => {
    it('should return all permissions for owner', () => {
      const ownerPerms = getDefaultPermissions('owner');
      expect(ownerPerms).toContain('articles:read');
      expect(ownerPerms).toContain('billing:manage');
      expect(ownerPerms).toContain('settings:manage');
    });

    it('should return limited permissions for viewer', () => {
      const viewerPerms = getDefaultPermissions('viewer');
      expect(viewerPerms).toContain('articles:read');
      expect(viewerPerms).not.toContain('articles:write');
      expect(viewerPerms).not.toContain('billing:manage');
    });
  });

  describe('calculateEffectivePermissions', () => {
    it('should return role defaults when no overrides', () => {
      const perms = calculateEffectivePermissions('viewer', {});
      expect(perms).toEqual(getDefaultPermissions('viewer'));
    });

    it('should add granted permissions via overrides', () => {
      const perms = calculateEffectivePermissions('viewer', {
        'articles:write': true,
      });
      expect(perms).toContain('articles:read');
      expect(perms).toContain('articles:write');
    });

    it('should remove denied permissions via overrides', () => {
      const perms = calculateEffectivePermissions('editor', {
        'articles:write': false,
      });
      expect(perms).not.toContain('articles:write');
      expect(perms).toContain('articles:read');
    });

    it('should handle mixed overrides', () => {
      const perms = calculateEffectivePermissions('viewer', {
        'articles:write': true,
        'articles:read': false,
      });
      expect(perms).toContain('articles:write');
      expect(perms).not.toContain('articles:read');
    });
  });

  describe('isValidPermission', () => {
    it('should return true for valid permissions', () => {
      expect(isValidPermission('articles:read')).toBe(true);
      expect(isValidPermission('billing:manage')).toBe(true);
    });

    it('should return false for invalid permissions', () => {
      expect(isValidPermission('invalid:permission')).toBe(false);
      expect(isValidPermission('')).toBe(false);
      expect(isValidPermission('articles')).toBe(false);
    });
  });

  describe('getPermissionsByCategory', () => {
    it('should group permissions by category', () => {
      const categories = getPermissionsByCategory();

      expect(categories).toHaveProperty('articles');
      expect(categories).toHaveProperty('settings');
      expect(categories).toHaveProperty('billing');

      expect(categories.articles.some((p) => p.key === 'articles:read')).toBe(true);
      expect(categories.billing.some((p) => p.key === 'billing:manage')).toBe(true);
    });
  });
});
