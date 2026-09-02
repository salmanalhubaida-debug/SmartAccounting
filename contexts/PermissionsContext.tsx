// Permissions Context — Role-based access control engine
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  AppModule, PermissionAction, ModulePermission,
  SYSTEM_ROLE_TEMPLATES, checkPermission, PermissionCheckResult,
} from '../types/permissions';

interface PermissionsContextType {
  // Core permission check
  can: (module: AppModule, action: PermissionAction) => boolean;
  check: (module: AppModule, action: PermissionAction) => PermissionCheckResult;
  // Current role permissions
  permissions: ModulePermission[];
  // Guard helpers
  isSuperAdmin: boolean;
  isCompanyOwner: boolean;
  isAccountant: boolean;
  canAccessModule: (module: AppModule) => boolean;
  // Branch access
  accessibleBranchIds: string[];
  canAccessBranch: (branchId: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const permissions = useMemo<ModulePermission[]>(() => {
    if (!user) return [];
    if (user.role === 'super_admin') {
      // Super admin has full access to everything
      return SYSTEM_ROLE_TEMPLATES['company_owner'] ?? [];
    }
    return SYSTEM_ROLE_TEMPLATES[user.role] ?? SYSTEM_ROLE_TEMPLATES['viewer'] ?? [];
  }, [user]);

  const isSuperAdmin = user?.role === 'super_admin';
  const isCompanyOwner = user?.role === 'company_owner';
  const isAccountant = user?.role === 'accountant';

  // Branch access — owners can see all, others restricted to their branch
  const accessibleBranchIds = useMemo<string[]>(() => {
    if (!user) return [];
    if (isSuperAdmin || isCompanyOwner || user.role === 'company_manager') {
      return ['*']; // All branches
    }
    return user.branch_id ? [user.branch_id] : [];
  }, [user, isSuperAdmin, isCompanyOwner]);

  const can = (module: AppModule, action: PermissionAction): boolean => {
    if (isSuperAdmin) return true;
    return checkPermission(permissions, module, action).allowed;
  };

  const check = (module: AppModule, action: PermissionAction): PermissionCheckResult => {
    if (isSuperAdmin) return { allowed: true };
    return checkPermission(permissions, module, action);
  };

  const canAccessModule = (module: AppModule): boolean => can(module, 'view');

  const canAccessBranch = (branchId: string): boolean => {
    if (accessibleBranchIds.includes('*')) return true;
    return accessibleBranchIds.includes(branchId);
  };

  return (
    <PermissionsContext.Provider value={{
      can, check, permissions,
      isSuperAdmin, isCompanyOwner, isAccountant,
      canAccessModule, accessibleBranchIds, canAccessBranch,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider');
  return ctx;
}
