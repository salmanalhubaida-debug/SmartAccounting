// Sales Module — Complete Types
// Architecture: Sale → Invoice → Payment → Inventory → COGS → Profitability → Accounting

// ═══════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export type SaleStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'returned';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type SalesOrderStatus = 'draft' | 'confirmed' | 'fulfilling' | 'fulfilled' | 'cancelled';
export type CreditNoteStatus = 'draft' | 'approved' | 'applied' | 'voided';
export type ReturnStatus = 'draft' | 'pending_approval' | 'approved' | 'completed' | 'rejected';

export type SalesChannel =
  | 'pos' | 'online_store' | 'mobile_app' | 'website'
  | 'marketplace' | 'delivery_app' | 'manual' | 'other';

export type DiscountType = 'percentage' | 'fixed';

export type PaymentMethod =
  | 'cash' | 'bank_transfer' | 'card' | 'knet'
  | 'payment_gateway' | 'wallet' | 'credit' | 'other';

export type MarginPolicyAction = 'allow' | 'warn' | 'require_approval' | 'block';

// ═══════════════════════════════════════════════════════════════════
// SALES INVOICE (PRIMARY DOCUMENT)
// ═══════════════════════════════════════════════════════════════════

export interface SaleInvoiceFull {
  id: string;
  company_id: string;
  branch_id: string;
  // Numbering
  invoice_number: string;         // e.g. INV-2026-000001
  invoice_series?: string;        // Series per branch/channel/year
  // References
  quotation_id?: string;
  sales_order_id?: string;
  // Parties
  customer_id?: string;
  customer_name: string;
  customer_name_ar?: string;
  customer_code?: string;
  customer_tax_number?: string;
  customer_address?: string;
  // Dates
  date: string;
  due_date?: string;
  // Context
  channel: SalesChannel;
  salesperson_id?: string;
  salesperson_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  // Items
  items: SaleInvoiceItemFull[];
  // Financial Summary
  subtotal: number;               // Sum of line totals before discount/tax
  invoice_discount_type: DiscountType;
  invoice_discount_value: number;
  invoice_discount_amount: number;
  tax_amount: number;
  total: number;                  // Final customer amount
  // Payments
  paid_amount: number;
  outstanding: number;            // total - paid_amount
  payments: SalePaymentRecord[];
  // Payment
  payment_method?: PaymentMethod;
  payment_fee: number;            // Merchant fees (card, gateway)
  payment_fee_rate?: number;
  // Status
  status: SaleStatus;
  // Profitability (computed on approval)
  profitability?: InvoiceProfitability;
  // Accounting
  journal_entry_id?: string;
  accounting_status: 'pending' | 'posted' | 'reversed';
  // Audit
  notes?: string;
  notes_ar?: string;
  internal_notes?: string;
  attachment_url?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// INVOICE LINE ITEM
// ═══════════════════════════════════════════════════════════════════

export interface SaleInvoiceItemFull {
  id: string;
  invoice_id: string;
  line_number: number;
  // Product
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  variant_id?: string;
  variant_name?: string;
  // Quantity & Unit
  quantity: number;
  unit_id: string;
  unit_symbol: string;
  // Pricing
  unit_price: number;             // Selling price
  line_discount_type: DiscountType;
  line_discount_value: number;
  line_discount_amount: number;
  line_subtotal: number;          // qty * unit_price - discount
  tax_rate: number;
  tax_amount: number;
  line_total: number;             // line_subtotal + tax
  // Cost & Profitability (visible per permission)
  unit_cost: number;              // Weighted avg or FIFO cost at time of sale
  total_cost: number;             // unit_cost * quantity
  gross_profit: number;           // line_subtotal - total_cost
  gross_margin_percent: number;   // gross_profit / line_subtotal * 100
  // Commercial Costs allocation
  allocated_payment_fee: number;
  allocated_delivery_cost: number;
  allocated_marketing_cost: number;
  allocated_other_costs: number;
  total_commercial_costs: number;
  commercial_profit: number;      // gross_profit - total_commercial_costs
  commercial_margin_percent: number;
  // Warnings
  is_below_target_margin: boolean;
  is_negative_margin: boolean;
  // Warehouse
  warehouse_id: string;
  // Stock validation
  available_stock: number;
  stock_sufficient: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// INVOICE PROFITABILITY (COMPLETE PICTURE)
// ═══════════════════════════════════════════════════════════════════

export interface InvoiceProfitability {
  invoice_id: string;
  // Revenue
  revenue: number;                // invoice subtotal before tax
  // Accounting COGS
  accounting_cogs: number;        // from inventory valuation
  gross_profit: number;
  gross_margin_percent: number;
  // Commercial Costs
  payment_fee: number;
  delivery_cost: number;
  marketing_cost_allocation: number;
  other_costs: number;
  total_commercial_costs: number;
  // Final Profitability
  commercial_profit: number;
  commercial_margin_percent: number;
  // Per Product
  line_profitability: LineProfitability[];
}

export interface LineProfitability {
  product_id: string;
  product_name: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_percent: number;
  commercial_profit: number;
  commercial_margin_percent: number;
}

// ═══════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════

export interface SalePaymentRecord {
  id: string;
  invoice_id: string;
  company_id: string;
  payment_number: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  is_reversed: boolean;
  reversed_at?: string;
  reversed_by?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// QUOTATION
// ═══════════════════════════════════════════════════════════════════

export interface Quotation {
  id: string;
  company_id: string;
  branch_id: string;
  quotation_number: string;
  customer_id?: string;
  customer_name: string;
  date: string;
  valid_until: string;
  channel: SalesChannel;
  salesperson_id?: string;
  items: SaleInvoiceItemFull[];
  subtotal: number;
  invoice_discount_amount: number;
  tax_amount: number;
  total: number;
  status: QuotationStatus;
  notes?: string;
  converted_to_invoice_id?: string;
  created_by: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// CREDIT NOTE
// ═══════════════════════════════════════════════════════════════════

export interface CreditNote {
  id: string;
  company_id: string;
  branch_id: string;
  credit_note_number: string;
  original_invoice_id: string;
  original_invoice_number: string;
  customer_id?: string;
  customer_name: string;
  date: string;
  amount: number;
  reason: string;
  reason_ar?: string;
  items?: CreditNoteItem[];
  status: CreditNoteStatus;
  applied_to_invoice_id?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

export interface CreditNoteItem {
  id: string;
  credit_note_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ═══════════════════════════════════════════════════════════════════
// SALES RETURN
// ═══════════════════════════════════════════════════════════════════

export interface SalesReturn {
  id: string;
  company_id: string;
  branch_id: string;
  return_number: string;
  original_invoice_id: string;
  original_invoice_number: string;
  customer_id?: string;
  customer_name: string;
  date: string;
  return_type: 'full' | 'partial';
  items: SalesReturnItem[];
  subtotal: number;
  total: number;
  refund_method: PaymentMethod;
  reason: string;
  reason_ar?: string;
  status: ReturnStatus;
  approved_by?: string;
  approved_at?: string;
  inventory_restocked: boolean;
  journal_entry_id?: string;
  credit_note_id?: string;
  created_by: string;
  created_at: string;
}

export interface SalesReturnItem {
  id: string;
  return_id: string;
  original_item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  line_total: number;
  restock: boolean;
  warehouse_id: string;
}

// ═══════════════════════════════════════════════════════════════════
// SALES DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

export interface SalesDashboardStats {
  period: string;
  // Volume
  total_invoices: number;
  total_revenue: number;
  total_paid: number;
  total_unpaid: number;
  total_overdue: number;
  total_returns: number;
  // Profitability
  gross_profit: number;
  gross_margin_percent: number;
  commercial_profit: number;
  commercial_margin_percent: number;
  total_cogs: number;
  // Payment breakdown
  cash_sales: number;
  credit_sales: number;
  // Counts
  count_paid: number;
  count_unpaid: number;
  count_overdue: number;
  count_draft: number;
  count_returns: number;
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════
// ACCOUNTING MAPPING (Company-Configurable)
// ═══════════════════════════════════════════════════════════════════

export interface SalesAccountingMapping {
  company_id: string;
  // Revenue accounts
  cash_sales_account: string;         // e.g. '1100' Cash
  credit_sales_account: string;       // e.g. '1200' Accounts Receivable
  revenue_account: string;            // e.g. '4000' Sales Revenue
  returns_account: string;            // e.g. '4100' Sales Returns
  discount_account: string;           // e.g. '4200' Sales Discounts
  // Inventory accounts
  inventory_account: string;          // e.g. '1400' Inventory
  cogs_account: string;               // e.g. '5000' COGS
  // Tax accounts
  tax_payable_account?: string;       // e.g. '2100' VAT Payable
  // Payment fee
  payment_fee_account: string;        // e.g. '6100' Bank Charges
}

// ═══════════════════════════════════════════════════════════════════
// COMPANY SALES POLICIES
// ═══════════════════════════════════════════════════════════════════

export interface SalesPolicy {
  company_id: string;
  // Margin policies
  target_gross_margin: number;        // e.g. 0.30 = 30%
  below_margin_action: MarginPolicyAction;
  negative_margin_action: MarginPolicyAction;
  // Stock
  allow_negative_stock: boolean;
  negative_stock_action: MarginPolicyAction;
  // Credit
  credit_limit_action: MarginPolicyAction;
  // Discount
  max_line_discount_percent: number;
  max_invoice_discount_percent: number;
  require_approval_above_discount: number;
  // Numbering
  invoice_prefix: string;
  invoice_next_number: number;
  use_branch_prefix: boolean;
  reset_numbering_yearly: boolean;
  // Flow
  require_quotation: boolean;
  require_sales_order: boolean;
  require_approval_before_invoice: boolean;
  allow_partial_payment: boolean;
  // Visibility
  show_cost_to_salesperson: boolean;
  show_margin_to_salesperson: boolean;
  // Commercial costs
  include_payment_fee_in_profitability: boolean;
  include_delivery_in_profitability: boolean;
  include_marketing_allocation: boolean;
  monthly_marketing_budget: number;
}

// ═══════════════════════════════════════════════════════════════════
// CONFIG LABELS
// ═══════════════════════════════════════════════════════════════════

export const SALE_STATUS_CONFIG: Record<SaleStatus, { labelEn: string; labelAr: string; color: string; bg: string; icon: string }> = {
  draft:            { labelEn: 'Draft',            labelAr: 'مسودة',            color: '#94A3B8', bg: '#F1F5F9', icon: 'edit'              },
  pending_approval: { labelEn: 'Pending Approval', labelAr: 'بانتظار الاعتماد', color: '#F59E0B', bg: '#FFFBEB', icon: 'hourglass-empty'   },
  approved:         { labelEn: 'Approved',         labelAr: 'معتمدة',           color: '#3B82F6', bg: '#EFF6FF', icon: 'check-circle'      },
  partially_paid:   { labelEn: 'Partially Paid',   labelAr: 'مدفوعة جزئياً',   color: '#F59E0B', bg: '#FFFBEB', icon: 'payment'           },
  paid:             { labelEn: 'Paid',             labelAr: 'مدفوعة',           color: '#10B981', bg: '#ECFDF5', icon: 'check-circle'      },
  overdue:          { labelEn: 'Overdue',          labelAr: 'متأخرة',           color: '#EF4444', bg: '#FEF2F2', icon: 'warning'           },
  cancelled:        { labelEn: 'Cancelled',        labelAr: 'ملغاة',            color: '#64748B', bg: '#F8FAFC', icon: 'cancel'            },
  returned:         { labelEn: 'Returned',         labelAr: 'مرتجعة',           color: '#8B5CF6', bg: '#F5F3FF', icon: 'assignment-return' },
};

export const SALES_CHANNEL_CONFIG: Record<SalesChannel, { labelEn: string; labelAr: string; icon: string; color: string }> = {
  pos:          { labelEn: 'POS',            labelAr: 'نقطة بيع',       icon: 'point-of-sale',   color: '#10B981' },
  online_store: { labelEn: 'Online Store',   labelAr: 'متجر إلكتروني',  icon: 'storefront',      color: '#3B82F6' },
  mobile_app:   { labelEn: 'Mobile App',     labelAr: 'تطبيق الجوال',   icon: 'phone-iphone',    color: '#8B5CF6' },
  website:      { labelEn: 'Website',        labelAr: 'الموقع',         icon: 'language',        color: '#F59E0B' },
  marketplace:  { labelEn: 'Marketplace',    labelAr: 'سوق إلكتروني',  icon: 'shopping-bag',    color: '#EF4444' },
  delivery_app: { labelEn: 'Delivery App',   labelAr: 'تطبيق توصيل',   icon: 'delivery-dining', color: '#F97316' },
  manual:       { labelEn: 'Manual',         labelAr: 'يدوي',           icon: 'edit-note',       color: '#64748B' },
  other:        { labelEn: 'Other',          labelAr: 'أخرى',           icon: 'more-horiz',      color: '#94A3B8' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { labelEn: string; labelAr: string; icon: string; color: string; hasFee: boolean; defaultFeeRate: number }> = {
  cash:             { labelEn: 'Cash',             labelAr: 'نقدي',           icon: 'payments',      color: '#10B981', hasFee: false, defaultFeeRate: 0    },
  bank_transfer:    { labelEn: 'Bank Transfer',    labelAr: 'تحويل بنكي',    icon: 'account-balance',color: '#3B82F6', hasFee: false, defaultFeeRate: 0    },
  card:             { labelEn: 'Card',             labelAr: 'بطاقة',          icon: 'credit-card',   color: '#6366F1', hasFee: true,  defaultFeeRate: 0.02 },
  knet:             { labelEn: 'KNET',             labelAr: 'كي-نت',          icon: 'credit-card',   color: '#0EA5E9', hasFee: true,  defaultFeeRate: 0.005},
  payment_gateway:  { labelEn: 'Payment Gateway',  labelAr: 'بوابة دفع',      icon: 'payment',       color: '#F59E0B', hasFee: true,  defaultFeeRate: 0.025},
  wallet:           { labelEn: 'Wallet',           labelAr: 'محفظة',          icon: 'account-balance-wallet', color: '#8B5CF6', hasFee: false, defaultFeeRate: 0 },
  credit:           { labelEn: 'Credit',           labelAr: 'آجل',            icon: 'pending',       color: '#EF4444', hasFee: false, defaultFeeRate: 0    },
  other:            { labelEn: 'Other',            labelAr: 'أخرى',           icon: 'more-horiz',    color: '#94A3B8', hasFee: false, defaultFeeRate: 0    },
};
