'use client';

import useSWR from 'swr';

import { permissionsApi } from '@/lib/api';

// Permission type - matches backend
export type Permission =
  | 'articles:read'
  | 'articles:write'
  | 'articles:delete'
  | 'articles:publish'
  | 'categories:read'
  | 'categories:write'
  | 'categories:delete'
  | 'settings:read'
  | 'settings:manage'
  | 'members:read'
  | 'members:manage'
  | 'logs:read'
  | 'stats:read'
  | 'billing:read'
  | 'billing:manage';

interface PermissionsData {
  isMember: boolean;
  role: string | null;
  permissions: Permission[];
  source: 'role' | 'custom' | 'mixed' | 'bot' | null;
  overrides: Partial<Record<Permission, boolean>>;
}

/**
 * Hook to get current user's permissions for the selected server
 */
export function usePermissions() {
  const { data, error, isLoading, mutate } = useSWR<PermissionsData>(
    'permissions-me',
    () => permissionsApi.getMe().then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!data?.permissions) return false;
    return data.permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!data?.permissions) return false;
    return permissions.some((p) => data.permissions.includes(p));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!data?.permissions) return false;
    return permissions.every((p) => data.permissions.includes(p));
  };

  /**
   * Check if user is at least editor (can write)
   */
  const canWrite = hasAnyPermission(['articles:write', 'categories:write']);

  /**
   * Check if user is at least admin (can manage)
   */
  const canManage = hasAnyPermission(['members:manage', 'settings:manage']);

  /**
   * Check if user is owner
   */
  const isOwner = data?.role === 'owner';

  return {
    // Raw data
    permissions: data?.permissions || [],
    role: data?.role,
    isMember: data?.isMember ?? false,
    source: data?.source,
    overrides: data?.overrides || {},

    // Loading state
    isLoading,
    error,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Convenience checks
    canWrite,
    canManage,
    isOwner,

    // Refresh function
    refresh: mutate,
  };
}
