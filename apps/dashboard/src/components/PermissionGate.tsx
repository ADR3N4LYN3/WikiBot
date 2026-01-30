'use client';

import { ReactNode } from 'react';

import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: Permission;

  /**
   * Multiple permissions to check
   */
  permissions?: Permission[];

  /**
   * Mode for multiple permissions: 'all' requires all, 'any' requires at least one
   * @default 'all'
   */
  mode?: 'all' | 'any';

  /**
   * Content to render when access is denied
   */
  fallback?: ReactNode;

  /**
   * Content to render while loading permissions
   */
  loading?: ReactNode;

  /**
   * Children to render when access is granted
   */
  children: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permission="articles:write">
 *   <CreateButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permissions={['articles:write', 'articles:delete']} mode="all">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="settings:manage" fallback={<UpgradePrompt />}>
 *   <SettingsForm />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  mode = 'all',
  fallback = null,
  loading = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  // Show loading state if provided
  if (isLoading && loading) {
    return <>{loading}</>;
  }

  // Don't render anything while loading if no loading state provided
  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    hasAccess = mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component version of PermissionGate
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission,
  FallbackComponent?: React.ComponentType
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGate
        permission={permission}
        fallback={FallbackComponent ? <FallbackComponent /> : null}
      >
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}
