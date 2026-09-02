// Smart Accounting Platform — Database Types & Schema
// Represents the full data model for Multi-Tenant Architecture

// ─── TENANT / COMPANY ───────────────────────────────────────────────────────

export interface Company {
  id: string;                    // UUID Primary Key
  name: string;                  // Company name
  name_ar: string;               // Arabic name
  logo_url?: string;
  commercial_registration?: string;
  tax_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  country: string;
  currency: string;              // Default: KWD
  fiscal_year_start: string;    // MM-DD
  status: 'active' | 'suspended' | 'trial' | 'expired';
  subscription_plan_id?: string;
  subscription_expires_at?: string;
  invoice_prefix?: string;
  invoice_number_start?: number;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── BRANCHES ────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  company_id: string;            // FK → Company
  name: string;
  name_ar?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_main: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ─── USERS & AUTH ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  full_name_ar?: string;
  avatar_url?: string;
  phone?: string;
  role: UserRoleType;
  company_id?: string;           // null for super_admin
  branch_id?: string;            // optional branch restriction
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type UserRoleType =
  | 'super_admin'
  | 'company_owner'
  | 'company_manager'
  | 'accountant'
  | 'sales_employee'
  | 'purchase_employee'
  | 'inventory_employee'
  | 'viewer';

// ─── ROLES & PERMISSIONS ─────────────────────────────────────────────────────

export interface Role {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  is_system: boolean;            // System roles can't be deleted
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

// ─── CHART OF ACCOUNTS ───────────────────────────────────────────────────────

export interface Account {
  id: string;
  company_id: string;
  parent_id?: string;            // For nested accounts
  code: string;                  // e.g. 1010
  name: string;
  name_ar?: string;
  type: AccountType;
  subtype?: string;
  is_cash: boolean;
  is_bank: boolean;
  is_receivable: boolean;
  is_payable: boolean;
  currency?: string;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

// ─── FISCAL PERIODS ──────────────────────────────────────────────────────────

export interface FiscalYear {
  id: string;
  company_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  closed_by?: string;
  closed_at?: string;
  created_at: string;
}

export interface AccountingPeriod {
  id: string;
  company_id: string;
  fiscal_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  closed_by?: string;
  closed_at?: string;
}

// ─── JOURNAL ENTRIES (Core Accounting Engine) ────────────────────────────────

export interface JournalEntry {
  id: string;
  company_id: string;
  branch_id?: string;
  period_id?: string;
  entry_number: string;          // e.g. JE-2024-0001
  date: string;
  description: string;
  description_ar?: string;
  source_type?: string;          // 'sale', 'purchase', 'expense', 'payment', 'manual'
  source_id?: string;            // FK to source record
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  reversed_by?: string;          // JE that reversed this
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  description?: string;
  debit: number;
  credit: number;
  // Must always: sum(debit) = sum(credit) across all lines
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  company_id: string;
  code?: string;
  name: string;
  name_ar?: string;
  type: 'individual' | 'company';
  tax_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  receivable_account_id?: string; // Default AR account
  credit_limit?: number;
  balance: number;               // Current balance
  is_active: boolean;
  created_at: string;
}

// ─── SUPPLIERS ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  company_id: string;
  code?: string;
  name: string;
  name_ar?: string;
  type: 'individual' | 'company';
  tax_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  payable_account_id?: string;  // Default AP account
  balance: number;
  is_active: boolean;
  created_at: string;
}

// ─── PRODUCTS / INVENTORY ────────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  parent_id?: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id?: string;
  code?: string;
  barcode?: string;
  name: string;
  name_ar?: string;
  type: 'product' | 'service';
  unit: string;
  cost_price: number;
  sale_price: number;
  tax_rate?: number;
  inventory_account_id?: string;
  revenue_account_id?: string;
  cogs_account_id?: string;
  track_inventory: boolean;
  reorder_point?: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export interface InventoryStock {
  id: string;
  company_id: string;
  product_id: string;
  branch_id: string;
  quantity: number;
  avg_cost: number;
  last_updated: string;
}

export interface InventoryMovement {
  id: string;
  company_id: string;
  product_id: string;
  branch_id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  cost: number;
  source_type: string;
  source_id: string;
  created_at: string;
}

// ─── SALES ───────────────────────────────────────────────────────────────────

export interface SaleInvoice {
  id: string;
  company_id: string;
  branch_id?: string;
  invoice_number: string;
  date: string;
  due_date?: string;
  customer_id?: string;
  customer_name?: string;
  status: 'draft' | 'issued' | 'paid' | 'partial' | 'void' | 'overdue';
  payment_method?: string;
  subtotal: number;
  discount: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  balance_due: number;
  notes?: string;
  journal_entry_id?: string;    // Auto-generated
  created_by: string;
  created_at: string;
  items?: SaleInvoiceItem[];
  payments?: Payment[];
}

export interface SaleInvoiceItem {
  id: string;
  sale_invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  line_total: number;
}

// ─── PURCHASES ───────────────────────────────────────────────────────────────

export interface PurchaseInvoice {
  id: string;
  company_id: string;
  branch_id?: string;
  invoice_number: string;
  supplier_invoice_number?: string;
  date: string;
  due_date?: string;
  supplier_id: string;
  status: 'draft' | 'received' | 'paid' | 'partial' | 'void';
  subtotal: number;
  discount: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  balance_due: number;
  notes?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
  items?: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceItem {
  id: string;
  purchase_invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  tax_rate: number;
  line_total: number;
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export interface ExpenseCategory {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  account_id?: string;
  color?: string;
}

export interface Expense {
  id: string;
  company_id: string;
  branch_id?: string;
  category_id?: string;
  expense_number: string;
  date: string;
  description: string;
  amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_account_id?: string;
  expense_account_id?: string;
  vendor_name?: string;
  receipt_url?: string;
  status: 'draft' | 'approved' | 'paid' | 'void';
  approved_by?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  company_id: string;
  branch_id?: string;
  payment_number: string;
  date: string;
  type: 'receipt' | 'payment';
  entity_type: 'customer' | 'supplier';
  entity_id: string;
  amount: number;
  method: string;
  account_id: string;
  reference?: string;
  notes?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  company_id?: string;
  branch_id?: string;
  user_id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'void' | 'login' | 'logout';
  module: string;
  record_id?: string;
  record_type?: string;
  previous_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ─── API KEYS & INTEGRATIONS ─────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  company_id: string;
  name: string;
  key_prefix: string;           // First 8 chars for display
  key_hash: string;             // Hashed - never store plain
  scopes: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface Integration {
  id: string;
  company_id: string;
  type: 'ecommerce' | 'pos' | 'payment_gateway' | 'bank' | 'hr' | 'other';
  name: string;
  config?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_branches: number;
  max_users: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  billing_cycle: 'monthly' | 'yearly';
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
}

// ─── DASHBOARD SUMMARY TYPES ─────────────────────────────────────────────────

export interface DashboardSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventoryValue: number;
  currency: string;
  period: string;
  previousPeriod?: {
    totalSales: number;
    netProfit: number;
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
