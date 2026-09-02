// Customers & Suppliers — Extended Types
// Builds on top of base Customer/Supplier types in database.ts

export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type SupplierStatus = 'active' | 'inactive' | 'blocked';
export type EntityType = 'individual' | 'company';

export type PaymentTermsType =
  | 'cash'
  | 'immediate'
  | '7_days'
  | '15_days'
  | '30_days'
  | '60_days'
  | 'custom';

export type CreditLimitBehavior = 'allow' | 'warn' | 'require_approval' | 'block';

// Extended Customer with all fields
export interface CustomerFull {
  id: string;
  company_id: string;
  branch_id?: string;
  code: string;
  name: string;
  name_ar?: string;
  type: EntityType;
  status: CustomerStatus;
  group_id?: string;
  // Contact
  phone?: string;
  phone_alt?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  // Financial / Tax
  tax_number?: string;
  civil_id?: string;
  commercial_reg?: string;
  // Accounting
  receivable_account_id?: string;
  credit_limit: number;
  credit_limit_behavior: CreditLimitBehavior;
  payment_terms: PaymentTermsType;
  payment_terms_days?: number;     // for 'custom'
  opening_balance: number;
  // Calculated (from transactions)
  total_sales: number;
  total_paid: number;
  total_returns: number;
  balance: number;                 // opening + sales - paid - returns
  // Meta
  notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  contacts?: Contact[];
}

// Extended Supplier with all fields
export interface SupplierFull {
  id: string;
  company_id: string;
  branch_id?: string;
  code: string;
  name: string;
  name_ar?: string;
  type: EntityType;
  status: SupplierStatus;
  // Contact
  phone?: string;
  phone_alt?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  // Financial / Tax
  tax_number?: string;
  commercial_reg?: string;
  // Accounting
  payable_account_id?: string;
  credit_limit: number;
  payment_terms: PaymentTermsType;
  payment_terms_days?: number;
  opening_balance: number;
  // Calculated
  total_purchases: number;
  total_paid: number;
  total_returns: number;
  balance: number;
  // Meta
  notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  contacts?: Contact[];
}

// Contact person under customer/supplier
export interface Contact {
  id: string;
  entity_type: 'customer' | 'supplier';
  entity_id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  position?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

// Customer Group
export interface CustomerGroup {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  color?: string;
  discount_percent?: number;
  is_system: boolean;
  created_at: string;
}

// Transaction line for statements
export interface StatementLine {
  id: string;
  date: string;
  reference: string;
  description: string;
  description_ar?: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note' | 'opening' | 'adjustment';
  debit: number;
  credit: number;
  balance: number;
  branch_id?: string;
}

// Credit summary
export interface CreditSummary {
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  overdue_amount: number;
  status: 'ok' | 'warning' | 'exceeded' | 'blocked';
}

// Payment terms display
export const PAYMENT_TERMS_OPTIONS: { value: PaymentTermsType; labelEn: string; labelAr: string; days: number }[] = [
  { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي', days: 0 },
  { value: 'immediate', labelEn: 'Immediate', labelAr: 'فوري', days: 0 },
  { value: '7_days', labelEn: '7 Days', labelAr: '7 أيام', days: 7 },
  { value: '15_days', labelEn: '15 Days', labelAr: '15 يوم', days: 15 },
  { value: '30_days', labelEn: '30 Days', labelAr: '30 يوم', days: 30 },
  { value: '60_days', labelEn: '60 Days', labelAr: '60 يوم', days: 60 },
  { value: 'custom', labelEn: 'Custom', labelAr: 'مخصص', days: 0 },
];

export const CREDIT_BEHAVIOR_OPTIONS: { value: CreditLimitBehavior; labelEn: string; labelAr: string; color: string }[] = [
  { value: 'allow', labelEn: 'Allow', labelAr: 'السماح', color: '#10B981' },
  { value: 'warn', labelEn: 'Warn', labelAr: 'تحذير', color: '#F59E0B' },
  { value: 'require_approval', labelEn: 'Require Approval', labelAr: 'يحتاج موافقة', color: '#3B82F6' },
  { value: 'block', labelEn: 'Block', labelAr: 'منع', color: '#EF4444' },
];
