// Inventory Mock Data — DEMO DATA FOR DEVELOPMENT
import {
  ProductFull, ProductCategory, Brand, Warehouse, StockLevel,
  StockMovement, StockTransfer, StockAdjustment, InventoryCount,
  ProductVariant, LowStockAlert, DEFAULT_UNITS,
} from '../types/inventory';

// ═══════════════════════════════════════════════════════════════════
// DEMO DATA — FOR DEVELOPMENT ONLY — CAN BE REPLACED WITH REAL API
// ═══════════════════════════════════════════════════════════════════

export const DEMO_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-001', company_id: 'company-001', branch_id: 'branch-001',
    name: 'Main Warehouse', name_ar: 'المستودع الرئيسي',
    code: 'WH-MAIN', address: 'Shuwaikh Industrial, Block 5',
    phone: '+965 2200 1111', manager_name: 'علي محمد',
    status: 'active', is_default: true,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wh-002', company_id: 'company-001', branch_id: 'branch-002',
    name: 'Salmiya Branch Store', name_ar: 'مخزن فرع السالمية',
    code: 'WH-SAL', address: 'Salmiya, Block 10',
    status: 'active', is_default: false,
    created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'wh-003', company_id: 'company-001',
    name: 'Online Fulfillment', name_ar: 'مستودع الأونلاين',
    code: 'WH-ONLINE',
    status: 'active', is_default: false,
    created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'wh-004', company_id: 'company-001', branch_id: 'branch-003',
    name: 'Hawalli Branch Store', name_ar: 'مخزن فرع حولي',
    code: 'WH-HAW',
    status: 'inactive', is_default: false,
    created_at: '2024-03-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z',
  },
];

export const DEMO_BRANDS: Brand[] = [
  { id: 'brand-001', company_id: 'company-001', name: 'Arabian Oud', name_ar: 'العربية للعود', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'brand-002', company_id: 'company-001', name: 'Kuwait Gold', name_ar: 'الكويت الذهبي', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'brand-003', company_id: 'company-001', name: 'Gulf Essence', name_ar: 'خلاصة الخليج', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'brand-004', company_id: 'company-001', name: 'Premium Care', name_ar: 'بريميوم كير', is_active: true, created_at: '2024-01-01T00:00:00Z' },
];

export const DEMO_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-001', company_id: 'company-001', parent_id: undefined,
    name: 'Perfumes & Fragrances', name_ar: 'العطور والبخور', icon: 'local-florist', color: '#8B5CF6',
    level: 0, is_active: true, created_at: '2024-01-01T00:00:00Z',
    children: [
      { id: 'cat-001-1', company_id: 'company-001', parent_id: 'cat-001', name: 'Oud', name_ar: 'عود', icon: 'spa', color: '#7C3AED', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'cat-001-2', company_id: 'company-001', parent_id: 'cat-001', name: 'Sprays', name_ar: 'بخاخات', icon: 'water-drop', color: '#6D28D9', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'cat-001-3', company_id: 'company-001', parent_id: 'cat-001', name: 'Bakhoor', name_ar: 'بخور', icon: 'smoke-free', color: '#5B21B6', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
    ],
  },
  {
    id: 'cat-002', company_id: 'company-001', parent_id: undefined,
    name: 'Skincare', name_ar: 'العناية بالبشرة', icon: 'face', color: '#EC4899',
    level: 0, is_active: true, created_at: '2024-01-01T00:00:00Z',
    children: [
      { id: 'cat-002-1', company_id: 'company-001', parent_id: 'cat-002', name: 'Moisturizers', name_ar: 'مرطبات', color: '#DB2777', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'cat-002-2', company_id: 'company-001', parent_id: 'cat-002', name: 'Serums', name_ar: 'سيرم', color: '#BE185D', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
    ],
  },
  {
    id: 'cat-003', company_id: 'company-001', parent_id: undefined,
    name: 'Hair Care', name_ar: 'العناية بالشعر', icon: 'content-cut', color: '#F59E0B',
    level: 0, is_active: true, created_at: '2024-01-01T00:00:00Z',
    children: [
      { id: 'cat-003-1', company_id: 'company-001', parent_id: 'cat-003', name: 'Shampoo', name_ar: 'شامبو', color: '#D97706', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'cat-003-2', company_id: 'company-001', parent_id: 'cat-003', name: 'Conditioner', name_ar: 'بلسم', color: '#B45309', level: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
    ],
  },
  {
    id: 'cat-004', company_id: 'company-001', parent_id: undefined,
    name: 'Accessories', name_ar: 'إكسسوارات', icon: 'shopping-bag', color: '#10B981',
    level: 0, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
];

export const DEMO_PRODUCTS: ProductFull[] = [
  {
    id: 'prod-001', company_id: 'company-001', category_id: 'cat-001-1', brand_id: 'brand-001',
    sku: 'OUD-ROYAL-100', barcode: '6291001234567',
    name: 'Royal Oud Premium', name_ar: 'عود ملكي فاخر',
    description: 'Premium aged oud wood from India, hand-selected',
    description_ar: 'عود مسن فاخر من الهند، مختار يدوياً',
    type: 'product', unit_id: 'unit-001', unit_symbol: 'PCS',
    cost_price: 12.500, sale_price: 25.000, purchase_price: 13.000,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 10, max_stock: 200, reorder_point: 25,
    status: 'active', is_active: true, has_variants: true,
    current_stock: 85, stock_value: 1062.5,
    created_by: 'user-002', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prod-002', company_id: 'company-001', category_id: 'cat-001-2', brand_id: 'brand-002',
    sku: 'PERF-GOLD-50', barcode: '6291009876543',
    name: 'Kuwait Gold Spray', name_ar: 'كويت غولد سبراي',
    description: 'Luxury oriental spray, 50ml',
    description_ar: 'بخاخ شرقي فاخر، 50 مل',
    type: 'product', unit_id: 'unit-006', unit_symbol: 'ML',
    cost_price: 6.750, sale_price: 14.500, purchase_price: 7.000,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 20, max_stock: 500, reorder_point: 50,
    status: 'active', is_active: true, has_variants: true,
    current_stock: 42, stock_value: 283.5,
    created_by: 'user-002', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-05-20T00:00:00Z',
  },
  {
    id: 'prod-003', company_id: 'company-001', category_id: 'cat-001-3', brand_id: 'brand-003',
    sku: 'BAK-CLASSIC-250', barcode: '6291005551234',
    name: 'Classic Bakhoor Box', name_ar: 'بخور كلاسيك',
    description: 'Traditional Kuwaiti bakhoor, 250g box',
    description_ar: 'بخور كويتي تقليدي، علبة 250 غرام',
    type: 'product', unit_id: 'unit-003', unit_symbol: 'KG',
    cost_price: 4.200, sale_price: 8.500, purchase_price: 4.500,
    tax_rate: 0, tax_included: false,
    track_inventory: true, tracking_type: 'batch', costing_method: 'fifo',
    min_stock: 15, max_stock: 300, reorder_point: 30,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 8, stock_value: 33.6,  // LOW STOCK
    created_by: 'user-005', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-06-10T00:00:00Z',
  },
  {
    id: 'prod-004', company_id: 'company-001', category_id: 'cat-002-1', brand_id: 'brand-004',
    sku: 'MOIST-DAY-200', barcode: '6291007778889',
    name: 'Premium Day Cream', name_ar: 'كريم نهاري فاخر',
    description: 'Luxury moisturizer with SPF 30, 200ml',
    description_ar: 'مرطب فاخر بعامل حماية 30، 200 مل',
    type: 'product', unit_id: 'unit-006', unit_symbol: 'ML',
    cost_price: 8.500, sale_price: 18.000, purchase_price: 9.000,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'batch', costing_method: 'weighted_average',
    min_stock: 10, max_stock: 200, reorder_point: 20,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 67, stock_value: 569.5,
    created_by: 'user-002', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-05-15T00:00:00Z',
  },
  {
    id: 'prod-005', company_id: 'company-001', category_id: 'cat-002-2', brand_id: 'brand-004',
    sku: 'SER-VITA-30',
    name: 'Vitamin C Serum', name_ar: 'سيرم فيتامين سي',
    description: '20% Vitamin C brightening serum, 30ml',
    description_ar: 'سيرم مضيء بفيتامين سي 20%، 30 مل',
    type: 'product', unit_id: 'unit-006', unit_symbol: 'ML',
    cost_price: 9.800, sale_price: 22.500, purchase_price: 10.500,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 5, max_stock: 100, reorder_point: 15,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 0, stock_value: 0,  // OUT OF STOCK
    created_by: 'user-002', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-06-20T00:00:00Z',
  },
  {
    id: 'prod-006', company_id: 'company-001', category_id: 'cat-003-1', brand_id: 'brand-004',
    sku: 'SHAMP-ARGAN-400',
    name: 'Argan Oil Shampoo', name_ar: 'شامبو زيت الأرغان',
    description: 'Nourishing argan oil shampoo, 400ml',
    description_ar: 'شامبو مغذي بزيت الأرغان، 400 مل',
    type: 'product', unit_id: 'unit-006', unit_symbol: 'ML',
    cost_price: 3.500, sale_price: 7.500, purchase_price: 3.800,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 20, max_stock: 500, reorder_point: 40,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 155, stock_value: 542.5,
    created_by: 'user-005', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'prod-007', company_id: 'company-001', category_id: 'cat-004',
    sku: 'ACC-PERFBAG-001',
    name: 'Perfume Travel Bag', name_ar: 'حقيبة عطور للسفر',
    description: 'Leather perfume travel bag, holds 6 bottles',
    description_ar: 'حقيبة جلدية للعطور، تتسع لـ 6 قوارير',
    type: 'product', unit_id: 'unit-001', unit_symbol: 'PCS',
    cost_price: 7.000, sale_price: 16.000, purchase_price: 7.500,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 5, max_stock: 100, reorder_point: 12,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 11, stock_value: 77.0,
    created_by: 'user-005', created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'prod-008', company_id: 'company-001', category_id: 'cat-001-1', brand_id: 'brand-001',
    sku: 'OUD-CHIPS-100',
    name: 'Oud Wood Chips 100g', name_ar: 'شرائح عود 100 غرام',
    description: 'Natural oud wood chips from Brunei',
    description_ar: 'شرائح عود طبيعية من بروناي',
    type: 'product', unit_id: 'unit-004', unit_symbol: 'GM',
    cost_price: 18.000, sale_price: 38.000, purchase_price: 19.000,
    tax_rate: 0, tax_included: false,
    track_inventory: true, tracking_type: 'batch', costing_method: 'fifo',
    min_stock: 5, max_stock: 50, reorder_point: 10,
    status: 'active', is_active: true, has_variants: false,
    current_stock: 3, stock_value: 54.0,  // CRITICAL LOW
    created_by: 'user-002', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-06-25T00:00:00Z',
  },
  {
    id: 'prod-009', company_id: 'company-001', category_id: 'cat-002-1',
    sku: 'BODY-LOTION-OLD',
    name: 'Rose Body Lotion (Discontinued)', name_ar: 'لوشن الجسم بالورد (مُوقف)',
    type: 'product', unit_id: 'unit-006', unit_symbol: 'ML',
    cost_price: 2.500, sale_price: 5.000, purchase_price: 2.800,
    tax_rate: 0.05, tax_included: false,
    track_inventory: true, tracking_type: 'none', costing_method: 'weighted_average',
    min_stock: 0, max_stock: 0, reorder_point: 0,
    status: 'archived', is_active: false, has_variants: false,
    current_stock: 0, stock_value: 0,
    created_by: 'user-002', created_at: '2023-06-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
];

// Variants for prod-001 (Royal Oud)
export const DEMO_VARIANTS: ProductVariant[] = [
  {
    id: 'var-001-1', product_id: 'prod-001', company_id: 'company-001',
    sku: 'OUD-ROYAL-S', barcode: '6291001234568',
    name: 'Royal Oud — Small Tola', name_ar: 'عود ملكي — تولة صغيرة',
    attributes: { weight: '3 Tola' }, cost_price: 8.500, sale_price: 18.000,
    is_active: true, created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'var-001-2', product_id: 'prod-001', company_id: 'company-001',
    sku: 'OUD-ROYAL-M', barcode: '6291001234569',
    name: 'Royal Oud — Medium', name_ar: 'عود ملكي — متوسط',
    attributes: { weight: '6 Tola' }, cost_price: 12.500, sale_price: 25.000,
    is_active: true, created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'var-001-3', product_id: 'prod-001', company_id: 'company-001',
    sku: 'OUD-ROYAL-L', barcode: '6291001234570',
    name: 'Royal Oud — Large Gift Box', name_ar: 'عود ملكي — علبة هدايا كبيرة',
    attributes: { weight: '12 Tola' }, cost_price: 22.000, sale_price: 48.000,
    is_active: true, created_at: '2024-01-10T00:00:00Z',
  },
  // Kuwait Gold Spray variants (prod-002)
  {
    id: 'var-002-1', product_id: 'prod-002', company_id: 'company-001',
    sku: 'PERF-GOLD-50',
    name: 'Kuwait Gold — 50ml', name_ar: 'كويت غولد — 50 مل',
    attributes: { size: '50ml' }, cost_price: 6.750, sale_price: 14.500,
    is_active: true, created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'var-002-2', product_id: 'prod-002', company_id: 'company-001',
    sku: 'PERF-GOLD-100',
    name: 'Kuwait Gold — 100ml', name_ar: 'كويت غولد — 100 مل',
    attributes: { size: '100ml' }, cost_price: 11.000, sale_price: 23.500,
    is_active: true, created_at: '2024-01-15T00:00:00Z',
  },
];

// Stock levels per warehouse
export const DEMO_STOCK_LEVELS: StockLevel[] = [
  // prod-001 Royal Oud
  { id: 'sl-001', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-001', quantity: 55, reserved_quantity: 5, incoming_quantity: 20, avg_cost: 12.500, available_quantity: 50, stock_value: 687.5, last_updated: '2024-06-25T00:00:00Z' },
  { id: 'sl-002', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-002', quantity: 20, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 12.500, available_quantity: 20, stock_value: 250.0, last_updated: '2024-06-20T00:00:00Z' },
  { id: 'sl-003', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-003', quantity: 10, reserved_quantity: 2, incoming_quantity: 0, avg_cost: 12.500, available_quantity: 8, stock_value: 125.0, last_updated: '2024-06-18T00:00:00Z' },
  // prod-002 Kuwait Gold
  { id: 'sl-004', company_id: 'company-001', product_id: 'prod-002', warehouse_id: 'wh-001', quantity: 30, reserved_quantity: 3, incoming_quantity: 50, avg_cost: 6.750, available_quantity: 27, stock_value: 202.5, last_updated: '2024-06-25T00:00:00Z' },
  { id: 'sl-005', company_id: 'company-001', product_id: 'prod-002', warehouse_id: 'wh-002', quantity: 12, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 6.750, available_quantity: 12, stock_value: 81.0, last_updated: '2024-06-20T00:00:00Z' },
  // prod-003 Bakhoor (low stock)
  { id: 'sl-006', company_id: 'company-001', product_id: 'prod-003', warehouse_id: 'wh-001', quantity: 8, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 4.200, available_quantity: 8, stock_value: 33.6, last_updated: '2024-06-22T00:00:00Z' },
  // prod-004 Day Cream
  { id: 'sl-007', company_id: 'company-001', product_id: 'prod-004', warehouse_id: 'wh-001', quantity: 50, reserved_quantity: 5, incoming_quantity: 0, avg_cost: 8.500, available_quantity: 45, stock_value: 425.0, last_updated: '2024-06-24T00:00:00Z' },
  { id: 'sl-008', company_id: 'company-001', product_id: 'prod-004', warehouse_id: 'wh-002', quantity: 17, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 8.500, available_quantity: 17, stock_value: 144.5, last_updated: '2024-06-20T00:00:00Z' },
  // prod-005 Vitamin C (out of stock)
  { id: 'sl-009', company_id: 'company-001', product_id: 'prod-005', warehouse_id: 'wh-001', quantity: 0, reserved_quantity: 0, incoming_quantity: 30, avg_cost: 9.800, available_quantity: 0, stock_value: 0, last_updated: '2024-06-01T00:00:00Z' },
  // prod-006 Shampoo
  { id: 'sl-010', company_id: 'company-001', product_id: 'prod-006', warehouse_id: 'wh-001', quantity: 100, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 3.500, available_quantity: 100, stock_value: 350.0, last_updated: '2024-06-25T00:00:00Z' },
  { id: 'sl-011', company_id: 'company-001', product_id: 'prod-006', warehouse_id: 'wh-002', quantity: 55, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 3.500, available_quantity: 55, stock_value: 192.5, last_updated: '2024-06-20T00:00:00Z' },
  // prod-007 Travel Bag
  { id: 'sl-012', company_id: 'company-001', product_id: 'prod-007', warehouse_id: 'wh-001', quantity: 11, reserved_quantity: 2, incoming_quantity: 0, avg_cost: 7.000, available_quantity: 9, stock_value: 77.0, last_updated: '2024-06-23T00:00:00Z' },
  // prod-008 Oud Chips (critical)
  { id: 'sl-013', company_id: 'company-001', product_id: 'prod-008', warehouse_id: 'wh-001', quantity: 3, reserved_quantity: 0, incoming_quantity: 0, avg_cost: 18.000, available_quantity: 3, stock_value: 54.0, last_updated: '2024-06-26T00:00:00Z' },
];

// Stock movements history
export const DEMO_MOVEMENTS: StockMovement[] = [
  { id: 'mv-001', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-001', type: 'opening_balance', quantity: 50, unit_id: 'unit-001', unit_cost: 12.500, total_cost: 625.0, qty_before: 0, qty_after: 50, reference_type: 'opening', notes: 'رصيد افتتاحي', created_by: 'user-002', created_at: '2024-01-10T08:00:00Z' },
  { id: 'mv-002', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-001', type: 'purchase', quantity: 40, unit_id: 'unit-001', unit_cost: 12.500, total_cost: 500.0, qty_before: 50, qty_after: 90, reference_type: 'purchase', reference_id: 'po-001', created_by: 'user-005', created_at: '2024-02-15T10:30:00Z' },
  { id: 'mv-003', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-001', type: 'sale', quantity: 25, unit_id: 'unit-001', unit_cost: 12.500, total_cost: 312.5, qty_before: 90, qty_after: 65, reference_type: 'sale', reference_id: 'inv-001', created_by: 'user-004', created_at: '2024-03-05T14:00:00Z' },
  { id: 'mv-004', company_id: 'company-001', product_id: 'prod-001', warehouse_id: 'wh-001', type: 'transfer_out', quantity: 10, unit_id: 'unit-001', unit_cost: 12.500, total_cost: 125.0, qty_before: 65, qty_after: 55, reference_type: 'transfer', reference_id: 'tr-001', notes: 'تحويل لفرع السالمية', created_by: 'user-002', created_at: '2024-04-01T09:00:00Z' },
  { id: 'mv-005', company_id: 'company-001', product_id: 'prod-003', warehouse_id: 'wh-001', type: 'opening_balance', quantity: 40, unit_id: 'unit-003', unit_cost: 4.200, total_cost: 168.0, qty_before: 0, qty_after: 40, reference_type: 'opening', batch_number: 'BATCH-2024-001', created_by: 'user-002', created_at: '2024-01-01T08:00:00Z' },
  { id: 'mv-006', company_id: 'company-001', product_id: 'prod-003', warehouse_id: 'wh-001', type: 'sale', quantity: 32, unit_id: 'unit-003', unit_cost: 4.200, total_cost: 134.4, qty_before: 40, qty_after: 8, reference_type: 'sale', created_by: 'user-004', created_at: '2024-05-20T11:00:00Z' },
  { id: 'mv-007', company_id: 'company-001', product_id: 'prod-008', warehouse_id: 'wh-001', type: 'opening_balance', quantity: 15, unit_id: 'unit-004', unit_cost: 18.000, total_cost: 270.0, qty_before: 0, qty_after: 15, reference_type: 'opening', batch_number: 'BATCH-OUD-001', production_date: '2023-06-01', created_by: 'user-002', created_at: '2024-01-05T08:00:00Z' },
  { id: 'mv-008', company_id: 'company-001', product_id: 'prod-008', warehouse_id: 'wh-001', type: 'sale', quantity: 12, unit_id: 'unit-004', unit_cost: 18.000, total_cost: 216.0, qty_before: 15, qty_after: 3, reference_type: 'sale', created_by: 'user-004', created_at: '2024-06-10T15:00:00Z' },
  { id: 'mv-009', company_id: 'company-001', product_id: 'prod-005', warehouse_id: 'wh-001', type: 'opening_balance', quantity: 25, unit_id: 'unit-006', unit_cost: 9.800, total_cost: 245.0, qty_before: 0, qty_after: 25, reference_type: 'opening', created_by: 'user-002', created_at: '2024-01-01T08:00:00Z' },
  { id: 'mv-010', company_id: 'company-001', product_id: 'prod-005', warehouse_id: 'wh-001', type: 'sale', quantity: 25, unit_id: 'unit-006', unit_cost: 9.800, total_cost: 245.0, qty_before: 25, qty_after: 0, reference_type: 'sale', created_by: 'user-004', created_at: '2024-06-01T10:00:00Z' },
];

// Stock Transfers
export const DEMO_TRANSFERS: StockTransfer[] = [
  {
    id: 'tr-001', company_id: 'company-001', transfer_number: 'TR-2024-0001',
    from_warehouse_id: 'wh-001', to_warehouse_id: 'wh-002',
    status: 'completed', transfer_date: '2024-04-01',
    notes: 'تحويل دوري لتجديد مخزون الفرع',
    approved_by: 'user-002', approved_at: '2024-04-01T09:30:00Z',
    completed_at: '2024-04-01T11:00:00Z',
    created_by: 'user-002', created_at: '2024-04-01T08:00:00Z',
    items: [
      { id: 'tri-001', transfer_id: 'tr-001', product_id: 'prod-001', quantity: 10, unit_id: 'unit-001' },
      { id: 'tri-002', transfer_id: 'tr-001', product_id: 'prod-002', quantity: 15, unit_id: 'unit-006' },
    ],
  },
  {
    id: 'tr-002', company_id: 'company-001', transfer_number: 'TR-2024-0002',
    from_warehouse_id: 'wh-001', to_warehouse_id: 'wh-003',
    status: 'in_transit', transfer_date: '2024-06-25',
    notes: 'تحضير للعروض الأونلاين',
    approved_by: 'user-002', approved_at: '2024-06-25T10:00:00Z',
    created_by: 'user-005', created_at: '2024-06-25T09:00:00Z',
    items: [
      { id: 'tri-003', transfer_id: 'tr-002', product_id: 'prod-004', quantity: 20, unit_id: 'unit-006' },
      { id: 'tri-004', transfer_id: 'tr-002', product_id: 'prod-006', quantity: 30, unit_id: 'unit-006' },
    ],
  },
  {
    id: 'tr-003', company_id: 'company-001', transfer_number: 'TR-2024-0003',
    from_warehouse_id: 'wh-002', to_warehouse_id: 'wh-001',
    status: 'draft', transfer_date: '2024-06-28',
    created_by: 'user-005', created_at: '2024-06-27T14:00:00Z',
    items: [
      { id: 'tri-005', transfer_id: 'tr-003', product_id: 'prod-002', quantity: 5, unit_id: 'unit-006' },
    ],
  },
];

// Stock Adjustments
export const DEMO_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-001', company_id: 'company-001', adjustment_number: 'ADJ-2024-0001',
    warehouse_id: 'wh-001', status: 'applied',
    reason: 'جرد دوري — تسوية فروقات',
    adjustment_date: '2024-03-31',
    approved_by: 'user-002', approved_at: '2024-03-31T15:00:00Z',
    created_by: 'user-003', created_at: '2024-03-31T14:00:00Z',
    items: [
      { id: 'adji-001', adjustment_id: 'adj-001', product_id: 'prod-006', system_quantity: 120, actual_quantity: 115, difference: -5, unit_cost: 3.500, cost_impact: -17.5 },
      { id: 'adji-002', adjustment_id: 'adj-001', product_id: 'prod-004', system_quantity: 55, actual_quantity: 56, difference: 1, unit_cost: 8.500, cost_impact: 8.5 },
    ],
  },
  {
    id: 'adj-002', company_id: 'company-001', adjustment_number: 'ADJ-2024-0002',
    warehouse_id: 'wh-001', status: 'pending_approval',
    reason: 'كسر وتلف في المخزون',
    adjustment_date: '2024-06-20',
    created_by: 'user-005', created_at: '2024-06-20T10:00:00Z',
    items: [
      { id: 'adji-003', adjustment_id: 'adj-002', product_id: 'prod-003', system_quantity: 10, actual_quantity: 8, difference: -2, unit_cost: 4.200, cost_impact: -8.4 },
    ],
  },
];

// Compute low stock alerts
export function computeLowStockAlerts(): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];
  DEMO_PRODUCTS.filter(p => p.track_inventory && p.status === 'active').forEach(product => {
    const stockLevels = DEMO_STOCK_LEVELS.filter(s => s.product_id === product.id);
    const totalQty = stockLevels.reduce((sum, s) => sum + s.quantity, 0);
    const mainWarehouse = DEMO_WAREHOUSES.find(w => w.is_default);
    const mainStock = stockLevels.find(s => s.warehouse_id === 'wh-001');

    if (totalQty === 0) {
      alerts.push({
        product_id: product.id, product_name: product.name, product_name_ar: product.name_ar,
        warehouse_id: 'wh-001', warehouse_name: mainWarehouse?.name ?? 'Main Warehouse',
        current_qty: 0, reorder_point: product.reorder_point, min_stock: product.min_stock,
        severity: 'out_of_stock',
      });
    } else if (product.reorder_point > 0 && totalQty <= product.min_stock) {
      alerts.push({
        product_id: product.id, product_name: product.name, product_name_ar: product.name_ar,
        warehouse_id: 'wh-001', warehouse_name: mainWarehouse?.name ?? 'Main Warehouse',
        current_qty: totalQty, reorder_point: product.reorder_point, min_stock: product.min_stock,
        severity: 'critical',
      });
    } else if (product.reorder_point > 0 && totalQty <= product.reorder_point) {
      alerts.push({
        product_id: product.id, product_name: product.name, product_name_ar: product.name_ar,
        warehouse_id: 'wh-001', warehouse_name: mainWarehouse?.name ?? 'Main Warehouse',
        current_qty: totalQty, reorder_point: product.reorder_point, min_stock: product.min_stock,
        severity: 'low',
      });
    }
  });
  return alerts;
}

// Helper: get all flat categories
export function getFlatCategories(): ProductCategory[] {
  const flat: ProductCategory[] = [];
  DEMO_CATEGORIES.forEach(cat => {
    flat.push({ ...cat, children: undefined });
    if (cat.children) {
      cat.children.forEach(child => flat.push(child));
    }
  });
  return flat;
}

// Helper: get stock for product
export function getProductStock(productId: string): { total: number; byWarehouse: StockLevel[] } {
  const byWarehouse = DEMO_STOCK_LEVELS.filter(s => s.product_id === productId);
  const total = byWarehouse.reduce((sum, s) => sum + s.quantity, 0);
  return { total, byWarehouse };
}
