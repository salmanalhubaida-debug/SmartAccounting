// Inventory & Products — Extended Types
// Phase 4: Products, Warehouses, Stock Movements

// ─── UNITS OF MEASURE ─────────────────────────────────────────────────────

export interface UnitOfMeasure {
  id: string;
  company_id: string;
  name: string;
  name_ar: string;
  symbol: string;
  is_base: boolean;
  is_system: boolean;
  created_at: string;
}

export interface UnitConversion {
  id: string;
  company_id: string;
  from_unit_id: string;
  to_unit_id: string;
  factor: number; // from_unit * factor = to_unit
}

// ─── BRANDS ───────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

// ─── PRODUCT CATEGORIES ───────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  company_id: string;
  parent_id?: string;
  name: string;
  name_ar?: string;
  icon?: string;
  color?: string;
  level: number; // 0 = root
  is_active: boolean;
  created_at: string;
  children?: ProductCategory[];
}

// ─── PRODUCT VARIANT ──────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  product_id: string;
  company_id: string;
  sku: string;
  barcode?: string;
  name: string;
  name_ar?: string;
  attributes: Record<string, string>; // e.g. { size: '100ml', color: 'Gold' }
  cost_price: number;
  sale_price: number;
  is_active: boolean;
  created_at: string;
}

// ─── PRODUCT ──────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive' | 'archived';
export type ProductType = 'product' | 'service' | 'bundle';
export type CostingMethod = 'weighted_average' | 'fifo' | 'lifo';
export type TrackingType = 'none' | 'batch' | 'serial';

export interface ProductFull {
  id: string;
  company_id: string;
  branch_id?: string;
  category_id?: string;
  brand_id?: string;
  // Identity
  sku: string;
  barcode?: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  // Type & Unit
  type: ProductType;
  unit_id: string;
  unit_symbol: string;
  // Pricing
  cost_price: number;
  sale_price: number;
  purchase_price: number;
  tax_rate: number; // e.g. 0.05 for 5%
  tax_included: boolean;
  // Stock Settings
  track_inventory: boolean;
  tracking_type: TrackingType;
  costing_method: CostingMethod;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  // Accounting Links (future)
  inventory_account_id?: string;
  revenue_account_id?: string;
  cogs_account_id?: string;
  purchase_account_id?: string;
  // Status
  status: ProductStatus;
  is_active: boolean;
  // Images
  image_url?: string;
  // Meta
  has_variants: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed
  current_stock?: number;
  stock_value?: number;
  variants?: ProductVariant[];
}

// ─── WAREHOUSES ───────────────────────────────────────────────────────────

export type WarehouseStatus = 'active' | 'inactive';

export interface Warehouse {
  id: string;
  company_id: string;
  branch_id?: string;
  name: string;
  name_ar?: string;
  code: string;
  address?: string;
  phone?: string;
  manager_name?: string;
  status: WarehouseStatus;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ─── STOCK ────────────────────────────────────────────────────────────────

export interface StockLevel {
  id: string;
  company_id: string;
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;    // for pending orders
  incoming_quantity: number;    // pending transfers/purchases
  avg_cost: number;
  last_updated: string;
  // Computed
  available_quantity: number;   // quantity - reserved
  stock_value: number;          // quantity * avg_cost
}

// ─── STOCK MOVEMENTS ──────────────────────────────────────────────────────

export type MovementType =
  | 'purchase'
  | 'sale'
  | 'sale_return'
  | 'purchase_return'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'opening_balance'
  | 'count_adjustment';

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  type: MovementType;
  quantity: number;       // always positive; direction in type
  unit_id: string;
  unit_cost: number;
  total_cost: number;
  // Before / After
  qty_before: number;
  qty_after: number;
  // Reference
  reference_type?: string; // 'purchase', 'sale', 'transfer', 'adjustment'
  reference_id?: string;
  // Batch / Serial
  batch_number?: string;
  lot_number?: string;
  production_date?: string;
  expiry_date?: string;
  serial_number?: string;
  // Meta
  notes?: string;
  created_by: string;
  created_at: string;
}

// ─── STOCK TRANSFER ───────────────────────────────────────────────────────

export type TransferStatus = 'draft' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

export interface StockTransfer {
  id: string;
  company_id: string;
  transfer_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  status: TransferStatus;
  transfer_date: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_id: string;
  notes?: string;
}

// ─── STOCK ADJUSTMENT ─────────────────────────────────────────────────────

export type AdjustmentStatus = 'draft' | 'pending_approval' | 'approved' | 'applied' | 'rejected';

export interface StockAdjustment {
  id: string;
  company_id: string;
  adjustment_number: string;
  warehouse_id: string;
  status: AdjustmentStatus;
  reason: string;
  notes?: string;
  adjustment_date: string;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  items: StockAdjustmentItem[];
}

export interface StockAdjustmentItem {
  id: string;
  adjustment_id: string;
  product_id: string;
  variant_id?: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number; // actual - system (can be negative)
  unit_cost: number;
  cost_impact: number; // difference * unit_cost
}

// ─── INVENTORY COUNT ──────────────────────────────────────────────────────

export type CountStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'completed';

export interface InventoryCount {
  id: string;
  company_id: string;
  count_number: string;
  warehouse_id: string;
  status: CountStatus;
  count_date: string;
  notes?: string;
  approved_by?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  items: InventoryCountItem[];
}

export interface InventoryCountItem {
  id: string;
  count_id: string;
  product_id: string;
  variant_id?: string;
  system_quantity: number;
  counted_quantity?: number; // null until counted
  difference?: number;
  is_counted: boolean;
}

// ─── LOW STOCK ALERT ──────────────────────────────────────────────────────

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  warehouse_id: string;
  warehouse_name: string;
  current_qty: number;
  reorder_point: number;
  min_stock: number;
  severity: 'low' | 'critical' | 'out_of_stock';
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────

export const MOVEMENT_TYPE_CONFIG: Record<MovementType, { labelEn: string; labelAr: string; color: string; icon: string; direction: 'in' | 'out' }> = {
  purchase:          { labelEn: 'Purchase',          labelAr: 'شراء',             color: '#10B981', icon: 'add-shopping-cart', direction: 'in'  },
  sale:              { labelEn: 'Sale',               labelAr: 'بيع',              color: '#EF4444', icon: 'point-of-sale',     direction: 'out' },
  sale_return:       { labelEn: 'Sale Return',        labelAr: 'مرتجع مبيعات',    color: '#10B981', icon: 'assignment-return', direction: 'in'  },
  purchase_return:   { labelEn: 'Purchase Return',    labelAr: 'مرتجع مشتريات',  color: '#EF4444', icon: 'undo',              direction: 'out' },
  transfer_in:       { labelEn: 'Transfer In',        labelAr: 'تحويل وارد',      color: '#3B82F6', icon: 'call-received',     direction: 'in'  },
  transfer_out:      { labelEn: 'Transfer Out',       labelAr: 'تحويل صادر',      color: '#8B5CF6', icon: 'call-made',         direction: 'out' },
  adjustment_in:     { labelEn: 'Adjustment (+)',     labelAr: 'تعديل (+)',        color: '#10B981', icon: 'add-circle',        direction: 'in'  },
  adjustment_out:    { labelEn: 'Adjustment (-)',     labelAr: 'تعديل (-)',        color: '#F59E0B', icon: 'remove-circle',     direction: 'out' },
  opening_balance:   { labelEn: 'Opening Balance',   labelAr: 'رصيد افتتاحي',    color: '#1B4FD8', icon: 'input',             direction: 'in'  },
  count_adjustment:  { labelEn: 'Count Adjustment',  labelAr: 'تعديل جرد',       color: '#6366F1', icon: 'inventory',         direction: 'in'  },
};

export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  draft:       { labelEn: 'Draft',       labelAr: 'مسودة',       color: '#94A3B8', bg: '#F1F5F9' },
  approved:    { labelEn: 'Approved',    labelAr: 'معتمد',       color: '#3B82F6', bg: '#EFF6FF' },
  in_transit:  { labelEn: 'In Transit',  labelAr: 'في الطريق',   color: '#F59E0B', bg: '#FFFBEB' },
  completed:   { labelEn: 'Completed',   labelAr: 'مكتمل',       color: '#10B981', bg: '#ECFDF5' },
  cancelled:   { labelEn: 'Cancelled',   labelAr: 'ملغي',        color: '#EF4444', bg: '#FEF2F2' },
};

export const ADJUSTMENT_STATUS_CONFIG: Record<AdjustmentStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  draft:            { labelEn: 'Draft',            labelAr: 'مسودة',          color: '#94A3B8', bg: '#F1F5F9' },
  pending_approval: { labelEn: 'Pending Approval', labelAr: 'بانتظار الموافقة', color: '#F59E0B', bg: '#FFFBEB' },
  approved:         { labelEn: 'Approved',         labelAr: 'معتمد',          color: '#3B82F6', bg: '#EFF6FF' },
  applied:          { labelEn: 'Applied',          labelAr: 'مطبّق',          color: '#10B981', bg: '#ECFDF5' },
  rejected:         { labelEn: 'Rejected',         labelAr: 'مرفوض',          color: '#EF4444', bg: '#FEF2F2' },
};

export const COSTING_METHOD_OPTIONS = [
  { value: 'weighted_average', labelEn: 'Weighted Average', labelAr: 'متوسط مرجح' },
  { value: 'fifo',             labelEn: 'FIFO',             labelAr: 'الوارد أولاً صادر أولاً' },
];

export const TRACKING_TYPE_OPTIONS = [
  { value: 'none',   labelEn: 'No Tracking',    labelAr: 'بدون تتبع' },
  { value: 'batch',  labelEn: 'Batch / Lot',    labelAr: 'دفعة / لوت' },
  { value: 'serial', labelEn: 'Serial Number',  labelAr: 'رقم تسلسلي' },
];

export const DEFAULT_UNITS: UnitOfMeasure[] = [
  { id: 'unit-001', company_id: '*', name: 'Piece',      name_ar: 'قطعة',    symbol: 'PCS', is_base: true,  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-002', company_id: '*', name: 'Box',        name_ar: 'كرتون',   symbol: 'BOX', is_base: false, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-003', company_id: '*', name: 'Kilogram',   name_ar: 'كيلوغرام', symbol: 'KG', is_base: true,  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-004', company_id: '*', name: 'Gram',       name_ar: 'غرام',    symbol: 'GM',  is_base: false, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-005', company_id: '*', name: 'Liter',      name_ar: 'لتر',     symbol: 'L',   is_base: true,  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-006', company_id: '*', name: 'Milliliter', name_ar: 'مليلتر',  symbol: 'ML',  is_base: false, is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-007', company_id: '*', name: 'Meter',      name_ar: 'متر',     symbol: 'M',   is_base: true,  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'unit-008', company_id: '*', name: 'Dozen',      name_ar: 'دزينة',   symbol: 'DZ',  is_base: false, is_system: true, created_at: '2024-01-01T00:00:00Z' },
];
