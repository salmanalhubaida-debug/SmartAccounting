// Permissions & Roles — Full Type System

// ─── MODULES ─────────────────────────────────────────────────────────────────

export type AppModule =
  | 'dashboard'
  | 'sales'
  | 'purchases'
  | 'expenses'
  | 'customers'
  | 'suppliers'
  | 'products'
  | 'inventory'
  | 'accounting'
  | 'reports'
  | 'branches'
  | 'users'
  | 'settings';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

// Per-module permission matrix
export interface ModulePermission {
  module: AppModule;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

// Full role with permission matrix
export interface Role {
  id: string;
  company_id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  is_system: boolean;       // System roles cannot be deleted
  color?: string;           // UI badge color
  permissions: ModulePermission[];
  created_at: string;
  updated_at: string;
}

// ─── DEFAULT ROLE PERMISSIONS ────────────────────────────────────────────────

// Helper to create a blank permission row for a module
const noAccess = (module: AppModule): ModulePermission => ({
  module, view: false, create: false, edit: false, delete: false, approve: false, export: false,
});

const viewOnly = (module: AppModule): ModulePermission => ({
  module, view: true, create: false, edit: false, delete: false, approve: false, export: false,
});

const viewCreate = (module: AppModule): ModulePermission => ({
  module, view: true, create: true, edit: false, delete: false, approve: false, export: false,
});

const fullAccess = (module: AppModule): ModulePermission => ({
  module, view: true, create: true, edit: true, delete: true, approve: true, export: true,
});

const noDelete = (module: AppModule): ModulePermission => ({
  module, view: true, create: true, edit: true, delete: false, approve: true, export: true,
});

const ALL_MODULES: AppModule[] = [
  'dashboard', 'sales', 'purchases', 'expenses', 'customers', 'suppliers',
  'products', 'inventory', 'accounting', 'reports', 'branches', 'users', 'settings',
];

// ─── SYSTEM ROLE TEMPLATES ───────────────────────────────────────────────────

export const SYSTEM_ROLE_TEMPLATES: Record<string, ModulePermission[]> = {
  company_owner: ALL_MODULES.map(m => fullAccess(m)),

  company_manager: ALL_MODULES.map(m => {
    if (m === 'settings') return viewOnly(m);
    return noDelete(m);
  }),

  accountant: ALL_MODULES.map(m => {
    if (['branches', 'users', 'settings'].includes(m)) return viewOnly(m);
    if (m === 'dashboard') return viewOnly(m);
    return noDelete(m);
  }),

  sales_employee: ALL_MODULES.map(m => {
    if (m === 'sales') return noDelete(m);
    if (m === 'customers') return viewCreate(m);
    if (m === 'products' || m === 'inventory') return viewOnly(m);
    if (m === 'dashboard') return viewOnly(m);
    return noAccess(m);
  }),

  purchase_employee: ALL_MODULES.map(m => {
    if (m === 'purchases') return noDelete(m);
    if (m === 'suppliers') return viewCreate(m);
    if (m === 'products' || m === 'inventory') return viewOnly(m);
    if (m === 'dashboard') return viewOnly(m);
    return noAccess(m);
  }),

  inventory_employee: ALL_MODULES.map(m => {
    if (m === 'inventory') return noDelete(m);
    if (m === 'products') return viewOnly(m);
    if (m === 'dashboard') return viewOnly(m);
    return noAccess(m);
  }),

  viewer: ALL_MODULES.map(m => viewOnly(m)),
};

// ─── APPROVAL WORKFLOW ───────────────────────────────────────────────────────

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'posted';

export interface ApprovalStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  name_ar: string;
  approver_role: string;     // Role that can approve this step
  is_required: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  company_id: string;
  name: string;
  name_ar: string;
  module: AppModule;          // Which module triggers this workflow
  is_active: boolean;
  steps: ApprovalStep[];
  created_at: string;
}

export interface ApprovalRecord {
  id: string;
  company_id: string;
  workflow_id: string;
  record_type: string;        // 'expense', 'journal_entry', etc.
  record_id: string;
  current_step: number;
  status: ApprovalStatus;
  submitted_by: string;
  submitted_at: string;
  history: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  id: string;
  approval_record_id: string;
  step: number;
  action: 'approved' | 'rejected' | 'commented';
  user_id: string;
  user_name: string;
  comment?: string;
  created_at: string;
}

// ─── USER-BRANCH ACCESS ──────────────────────────────────────────────────────

export interface UserBranchAccess {
  user_id: string;
  branch_id: string;
  company_id: string;
  granted_by: string;
  granted_at: string;
}

// ─── PERMISSION CHECK RESULT ─────────────────────────────────────────────────

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// Helper: check if a user has a specific permission
export function checkPermission(
  permissions: ModulePermission[],
  module: AppModule,
  action: PermissionAction
): PermissionCheckResult {
  const perm = permissions.find(p => p.module === module);
  if (!perm) return { allowed: false, reason: 'module_not_found' };
  if (!perm[action]) return { allowed: false, reason: 'action_not_permitted' };
  return { allowed: true };
}
