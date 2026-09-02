// Purchases Module — Complete Types
// Architecture: PurchaseRequest → PO → GoodsReceipt → Invoice → LandedCost → InventoryCost → AP → Accounting

// ═══════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export type PurchaseStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'returned';

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'fully_received' | 'closed' | 'cancelled';
export type GRNStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type LandedCostStatus = 'draft' | 'pending' | 'allocated' | 'approved' | 'finalized';
export type PurchaseReturnStatus = 'draft' | 'pending_approval' | 'approved' | 'completed' | 'rejected';
export type SupplierCreditNoteStatus = 'draft' | 'approved' | 'applied' | 'voided';

export type LandedCostType =
  | 'shipping'
  | 'customs'
  | 'insurance'
  | 'port_fees'
  | 'clearance'
  | 'handling'
  | 'import_fees'
  | 'other';

export type LandedCostAllocationMethod = 'value' | 'weight' | 'quantity' | 'volume' | 'custom_percent';
export type LandedCostAccountingTreatment = 'inventory_cost' | 'period_expense' | 'management_cost';

export type PaymentMethod =
  | 'cash' | 'bank_transfer' | 'card' | 'cheque'
  | 'letter_of_credit' | 'wire_transfer' | 'credit' | 'other';

export type DiscountType = 'percentage' | 'fixed';

export type Currency = 'KWD' | 'SAR' | 'AED' | 'QAR' | 'BHD' | 'OMR' | 'USD' | 'EUR' | 'GBP' | 'CNY';

// ═══════════════════════════════════════════════════════════════════
// PURCHASE REQUEST
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseRequest {
  id: string;
  company_id: string;
  branch_id: string;
  request_number: string;
  requested_by: string;
  requested_by_name: string;
  date: string;
  required_date?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'converted' | 'rejected';
  notes?: string;
  items: PurchaseRequestItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestItem {
  id: string;
  request_id: string;
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  quantity: number;
  unit_id: string;
  unit_symbol: string;
  estimated_cost?: number;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE ORDER
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseOrder {
  id: string;
  company_id: string;
  branch_id: string;
  po_number: string;
  request_id?: string;
  // Supplier
  supplier_id: string;
  supplier_name: string;
  supplier_name_ar?: string;
  supplier_code?: string;
  // Dates
  date: string;
  expected_delivery_date?: string;
  // Currency
  currency: Currency;
  exchange_rate: number; // to company currency (KWD)
  // Warehouse
  warehouse_id: string;
  warehouse_name?: string;
  // Items
  items: PurchaseOrderItem[];
  // Financial
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  total_company_currency: number; // converted to KWD
  // Status & Receiving
  status: POStatus;
  total_received_qty: number;
  total_ordered_qty: number;
  receipt_count: number;
  // Accounting
  accounting_status: 'pending' | 'posted' | 'reversed';
  // Meta
  notes?: string;
  terms?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  quantity: number;
  unit_id: string;
  unit_symbol: string;
  unit_cost: number;              // in order currency
  unit_cost_kwd?: number;         // in company currency
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  line_subtotal: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  // Receiving
  received_qty: number;
  outstanding_qty: number;
  // Notes
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════
// GOODS RECEIPT NOTE (GRN)
// ═══════════════════════════════════════════════════════════════════

export interface GoodsReceiptNote {
  id: string;
  company_id: string;
  branch_id: string;
  grn_number: string;
  po_id?: string;
  po_number?: string;
  // Supplier
  supplier_id: string;
  supplier_name: string;
  supplier_name_ar?: string;
  // Warehouse
  warehouse_id: string;
  warehouse_name?: string;
  // Dates
  receipt_date: string;
  // Items
  items: GRNItem[];
  // Totals
  total_ordered: number;
  total_received: number;
  total_damaged: number;
  total_short: number;
  // Status
  status: GRNStatus;
  // Matching
  matched_to_invoice_id?: string;
  // Notes
  notes?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GRNItem {
  id: string;
  grn_id: string;
  po_item_id?: string;
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  ordered_qty: number;
  received_qty: number;
  damaged_qty: number;
  short_qty: number;
  accepted_qty: number; // received - damaged
  unit_id: string;
  unit_symbol: string;
  unit_cost: number;
  // Batch / Serial
  batch_number?: string;
  lot_number?: string;
  production_date?: string;
  expiry_date?: string;
  serial_numbers?: string[];
  // Notes
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE INVOICE
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseInvoiceFull {
  id: string;
  company_id: string;
  branch_id: string;
  invoice_number: string;    // Our internal reference
  supplier_invoice_number?: string; // Supplier's invoice number
  // References
  po_id?: string;
  po_number?: string;
  grn_id?: string;
  grn_number?: string;
  // Supplier
  supplier_id: string;
  supplier_name: string;
  supplier_name_ar?: string;
  supplier_code?: string;
  supplier_tax_number?: string;
  // Dates
  date: string;
  due_date?: string;
  // Currency
  currency: Currency;
  exchange_rate: number;
  // Warehouse
  warehouse_id: string;
  warehouse_name?: string;
  // Items
  items: PurchaseInvoiceItemFull[];
  // Financial
  subtotal: number;
  invoice_discount_type: DiscountType;
  invoice_discount_value: number;
  invoice_discount_amount: number;
  tax_amount: number;
  total: number;              // In invoice currency
  total_kwd: number;          // In company currency (KWD)
  // Payments
  paid_amount: number;
  outstanding: number;
  payments: PurchasePaymentRecord[];
  payment_method?: PaymentMethod;
  // Matching
  matching_status: 'matched' | 'partial_match' | 'mismatch' | 'not_matched';
  qty_variance: number;
  price_variance: number;
  price_variance_amount: number;
  // Status
  status: PurchaseStatus;
  // Landed Cost
  landed_cost_ids?: string[];
  total_landed_cost_allocated: number;
  final_inventory_cost: number;   // subtotal + allocated landed costs
  // Accounting
  journal_entry_id?: string;
  accounting_status: 'pending' | 'posted' | 'reversed';
  // Audit
  notes?: string;
  internal_notes?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseInvoiceItemFull {
  id: string;
  invoice_id: string;
  line_number: number;
  // Product
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  product_code?: string;
  // Quantity
  quantity: number;
  unit_id: string;
  unit_symbol: string;
  // Pricing
  unit_cost: number;               // Invoice price in invoice currency
  unit_cost_kwd: number;           // In company currency
  po_unit_cost?: number;           // PO price (for variance)
  price_variance?: number;         // unit_cost - po_unit_cost
  line_discount_type: DiscountType;
  line_discount_value: number;
  line_discount_amount: number;
  line_subtotal: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  // Landed cost allocation (per item)
  allocated_shipping: number;
  allocated_customs: number;
  allocated_insurance: number;
  allocated_other: number;
  total_landed_cost: number;
  final_unit_cost: number;         // unit_cost_kwd + (total_landed_cost / quantity)
  // Receiving
  received_qty?: number;
  qty_variance?: number;
  // Batch
  batch_number?: string;
  expiry_date?: string;
}

// ═══════════════════════════════════════════════════════════════════
// LANDED COST
// ═══════════════════════════════════════════════════════════════════

export interface LandedCost {
  id: string;
  company_id: string;
  landed_cost_number: string;
  // Links
  po_ids: string[];
  invoice_ids: string[];
  shipment_id?: string;
  // Provider
  vendor_name?: string;
  vendor_invoice_number?: string;
  // Date
  date: string;
  // Cost items
  cost_lines: LandedCostLine[];
  // Totals
  total_cost: number;
  total_cost_kwd: number;
  // Allocation
  allocation_method: LandedCostAllocationMethod;
  allocation_base_value: number;   // Total value of goods for allocation
  // Status
  status: LandedCostStatus;
  // Accounting
  accounting_treatment: LandedCostAccountingTreatment;
  journal_entry_id?: string;
  // Notes
  notes?: string;
  created_by: string;
  approved_by?: string;
  finalized_by?: string;
  finalized_at?: string;
  created_at: string;
  updated_at: string;
  // Allocated items (after allocation)
  allocated_items?: LandedCostAllocationItem[];
}

export interface LandedCostLine {
  id: string;
  landed_cost_id: string;
  cost_type: LandedCostType;
  description: string;
  description_ar?: string;
  currency: Currency;
  exchange_rate: number;
  amount: number;          // in cost currency
  amount_kwd: number;      // in KWD
  vendor_invoice?: string;
  date?: string;
  accounting_treatment: LandedCostAccountingTreatment;
}

export interface LandedCostAllocationItem {
  product_id: string;
  product_name: string;
  invoice_id: string;
  base_value: number;     // Value used for allocation (quantity or cost)
  allocation_percent: number;
  allocated_amount: number;
  allocated_per_unit: number;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE PAYMENT
// ═══════════════════════════════════════════════════════════════════

export interface PurchasePaymentRecord {
  id: string;
  invoice_id: string;
  company_id: string;
  payment_number: string;
  date: string;
  amount: number;
  amount_kwd?: number;
  currency?: Currency;
  exchange_rate?: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  bank_account?: string;
  cheque_number?: string;
  is_reversed: boolean;
  reversed_at?: string;
  reversed_by?: string;
  journal_entry_id?: string;
  created_by: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE RETURN
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseReturn {
  id: string;
  company_id: string;
  branch_id: string;
  return_number: string;
  original_invoice_id: string;
  original_invoice_number: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  return_type: 'full' | 'partial';
  items: PurchaseReturnItem[];
  subtotal: number;
  total: number;
  refund_method: PaymentMethod;
  reason: string;
  reason_ar?: string;
  status: PurchaseReturnStatus;
  approved_by?: string;
  approved_at?: string;
  inventory_removed: boolean;
  journal_entry_id?: string;
  credit_note_id?: string;
  created_by: string;
  created_at: string;
}

export interface PurchaseReturnItem {
  id: string;
  return_id: string;
  original_item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
  remove_from_inventory: boolean;
  warehouse_id: string;
}

// ═══════════════════════════════════════════════════════════════════
// SUPPLIER CREDIT NOTE
// ═══════════════════════════════════════════════════════════════════

export interface SupplierCreditNote {
  id: string;
  company_id: string;
  credit_note_number: string;
  original_invoice_id: string;
  original_invoice_number: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  amount: number;
  reason: string;
  reason_ar?: string;
  items?: SupplierCreditNoteItem[];
  status: SupplierCreditNoteStatus;
  applied_to_invoice_id?: string;
  created_by: string;
  created_at: string;
}

export interface SupplierCreditNoteItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  amount: number;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE COST HISTORY (per product)
// ═══════════════════════════════════════════════════════════════════

export interface ProductCostHistory {
  id: string;
  company_id: string;
  product_id: string;
  product_name: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  invoice_id: string;
  invoice_number: string;
  warehouse_id: string;
  batch_number?: string;
  quantity: number;
  unit_symbol: string;
  // Cost breakdown
  purchase_cost: number;       // Invoice cost in KWD
  allocated_shipping: number;
  allocated_customs: number;
  allocated_insurance: number;
  allocated_clearance: number;
  allocated_other: number;
  total_landed_cost: number;
  final_inventory_cost: number; // purchase_cost + total_landed_cost (per unit)
  // Variance
  previous_cost?: number;
  price_variance?: number;
  // Status
  cost_finalized: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseDashboardStats {
  period: string;
  total_purchases: number;
  total_invoices: number;
  total_paid: number;
  outstanding_payables: number;
  overdue_payables: number;
  total_returns: number;
  landed_costs_total: number;
  pending_pos: number;
  pending_receipts: number;
  count_paid: number;
  count_unpaid: number;
  count_overdue: number;
  count_draft: number;
  count_returns: number;
  purchase_price_variance: number;
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE ACCOUNTING MAPPING
// ═══════════════════════════════════════════════════════════════════

export interface PurchaseAccountingMapping {
  company_id: string;
  inventory_account: string;           // '1400'
  accounts_payable_account: string;    // '2000'
  cash_account: string;                // '1100'
  bank_account: string;                // '1110'
  purchase_returns_account: string;    // '5100'
  purchase_discount_account: string;   // '5200'
  landed_cost_clearing_account: string; // '2100'
  ppv_account: string;                 // '5300' Purchase Price Variance
  shipping_expense_account: string;    // '6200'
  customs_expense_account: string;     // '6210'
  other_import_expense_account: string; // '6220'
}

// ═══════════════════════════════════════════════════════════════════
// COMPANY PURCHASE POLICY
// ═══════════════════════════════════════════════════════════════════

export interface PurchasePolicy {
  company_id: string;
  require_purchase_request: boolean;
  require_purchase_order: boolean;
  require_goods_receipt: boolean;
  require_3way_match: boolean;
  allow_price_variance_percent: number; // e.g. 5 for 5%
  price_variance_action: 'allow' | 'warn' | 'require_approval' | 'block';
  qty_variance_action: 'allow' | 'warn' | 'require_approval' | 'block';
  allow_direct_invoice: boolean;        // Skip PO+GRN
  require_approval_before_payment: boolean;
  auto_calculate_due_date: boolean;
  invoice_prefix: string;
  invoice_next_number: number;
  po_prefix: string;
  po_next_number: number;
  grn_prefix: string;
  grn_next_number: number;
}

// ═══════════════════════════════════════════════════════════════════
// SUPPLIER PERFORMANCE
// ═══════════════════════════════════════════════════════════════════

export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  total_purchases: number;
  total_invoices: number;
  total_paid: number;
  outstanding_balance: number;
  total_returns: number;
  return_rate_percent: number;
  avg_purchase_price_change: number;    // % change over periods
  on_time_delivery_rate: number;        // %
  quantity_accuracy_rate: number;       // %
  avg_lead_time_days: number;
  price_stability_score: number;        // 0-100
  overall_score: number;               // 0-100
  last_purchase_date?: string;
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════
// CONFIG LABELS
// ═══════════════════════════════════════════════════════════════════

export const PURCHASE_STATUS_CONFIG: Record<PurchaseStatus, { labelEn: string; labelAr: string; color: string; bg: string; icon: string }> = {
  draft:            { labelEn: 'Draft',            labelAr: 'مسودة',            color: '#94A3B8', bg: '#F1F5F9', icon: 'edit'             },
  pending_approval: { labelEn: 'Pending Approval', labelAr: 'بانتظار الاعتماد', color: '#F59E0B', bg: '#FFFBEB', icon: 'hourglass-empty'  },
  approved:         { labelEn: 'Approved',         labelAr: 'معتمدة',           color: '#3B82F6', bg: '#EFF6FF', icon: 'check-circle'     },
  partially_paid:   { labelEn: 'Partially Paid',   labelAr: 'مدفوعة جزئياً',   color: '#F59E0B', bg: '#FFFBEB', icon: 'payment'          },
  paid:             { labelEn: 'Paid',             labelAr: 'مدفوعة',           color: '#10B981', bg: '#ECFDF5', icon: 'check-circle'     },
  overdue:          { labelEn: 'Overdue',          labelAr: 'متأخرة',           color: '#EF4444', bg: '#FEF2F2', icon: 'warning'          },
  cancelled:        { labelEn: 'Cancelled',        labelAr: 'ملغاة',            color: '#64748B', bg: '#F8FAFC', icon: 'cancel'           },
  returned:         { labelEn: 'Returned',         labelAr: 'مرتجعة',           color: '#8B5CF6', bg: '#F5F3FF', icon: 'undo'             },
};

export const PO_STATUS_CONFIG: Record<POStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  draft:              { labelEn: 'Draft',              labelAr: 'مسودة',          color: '#94A3B8', bg: '#F1F5F9' },
  sent:               { labelEn: 'Sent',               labelAr: 'مرسل',           color: '#3B82F6', bg: '#EFF6FF' },
  confirmed:          { labelEn: 'Confirmed',          labelAr: 'مؤكد',           color: '#6366F1', bg: '#EEF2FF' },
  partially_received: { labelEn: 'Partially Received', labelAr: 'مستلم جزئياً',  color: '#F59E0B', bg: '#FFFBEB' },
  fully_received:     { labelEn: 'Fully Received',     labelAr: 'مستلم بالكامل', color: '#10B981', bg: '#ECFDF5' },
  closed:             { labelEn: 'Closed',             labelAr: 'مغلق',           color: '#10B981', bg: '#ECFDF5' },
  cancelled:          { labelEn: 'Cancelled',          labelAr: 'ملغي',           color: '#EF4444', bg: '#FEF2F2' },
};

export const LANDED_COST_TYPE_CONFIG: Record<LandedCostType, { labelEn: string; labelAr: string; icon: string; color: string }> = {
  shipping:    { labelEn: 'Shipping',     labelAr: 'شحن',           icon: 'local-shipping', color: '#3B82F6' },
  customs:     { labelEn: 'Customs',      labelAr: 'جمارك',         icon: 'gavel',          color: '#F59E0B' },
  insurance:   { labelEn: 'Insurance',    labelAr: 'تأمين',         icon: 'security',       color: '#10B981' },
  port_fees:   { labelEn: 'Port Fees',    labelAr: 'رسوم ميناء',    icon: 'anchor',         color: '#6366F1' },
  clearance:   { labelEn: 'Clearance',    labelAr: 'تخليص جمركي',  icon: 'task-alt',       color: '#8B5CF6' },
  handling:    { labelEn: 'Handling',     labelAr: 'مناولة',        icon: 'handshake',      color: '#F97316' },
  import_fees: { labelEn: 'Import Fees',  labelAr: 'رسوم استيراد',  icon: 'input',          color: '#EF4444' },
  other:       { labelEn: 'Other',        labelAr: 'أخرى',          icon: 'more-horiz',     color: '#94A3B8' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { labelEn: string; labelAr: string; icon: string; color: string }> = {
  cash:             { labelEn: 'Cash',              labelAr: 'نقدي',          icon: 'payments',           color: '#10B981' },
  bank_transfer:    { labelEn: 'Bank Transfer',     labelAr: 'تحويل بنكي',   icon: 'account-balance',    color: '#3B82F6' },
  card:             { labelEn: 'Card',              labelAr: 'بطاقة',         icon: 'credit-card',        color: '#6366F1' },
  cheque:           { labelEn: 'Cheque',            labelAr: 'شيك',           icon: 'receipt',            color: '#F59E0B' },
  letter_of_credit: { labelEn: 'Letter of Credit',  labelAr: 'اعتماد مستندي', icon: 'description',       color: '#8B5CF6' },
  wire_transfer:    { labelEn: 'Wire Transfer',     labelAr: 'حوالة',         icon: 'swap-horiz',         color: '#0EA5E9' },
  credit:           { labelEn: 'Credit',            labelAr: 'آجل',           icon: 'pending',            color: '#EF4444' },
  other:            { labelEn: 'Other',             labelAr: 'أخرى',          icon: 'more-horiz',         color: '#94A3B8' },
};

export const LANDED_COST_STATUS_CONFIG: Record<LandedCostStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  draft:     { labelEn: 'Draft',     labelAr: 'مسودة',          color: '#94A3B8', bg: '#F1F5F9' },
  pending:   { labelEn: 'Pending',   labelAr: 'معلق',           color: '#F59E0B', bg: '#FFFBEB' },
  allocated: { labelEn: 'Allocated', labelAr: 'موزع',           color: '#3B82F6', bg: '#EFF6FF' },
  approved:  { labelEn: 'Approved',  labelAr: 'معتمد',          color: '#6366F1', bg: '#EEF2FF' },
  finalized: { labelEn: 'Finalized', labelAr: 'نهائي',          color: '#10B981', bg: '#ECFDF5' },
};

export const ALLOCATION_METHOD_CONFIG: Record<LandedCostAllocationMethod, { labelEn: string; labelAr: string; icon: string }> = {
  value:          { labelEn: 'By Value',     labelAr: 'بالقيمة',    icon: 'attach-money'      },
  weight:         { labelEn: 'By Weight',    labelAr: 'بالوزن',     icon: 'fitness-center'    },
  quantity:       { labelEn: 'By Quantity',  labelAr: 'بالكمية',    icon: 'tag'               },
  volume:         { labelEn: 'By Volume',    labelAr: 'بالحجم',     icon: 'view-in-ar'        },
  custom_percent: { labelEn: 'Custom %',     labelAr: 'نسبة مخصصة', icon: 'percent'           },
};
