// Purchases Module — Demo Data
// DEMO DATA FOR DEVELOPMENT — Replace with real API calls

import {
  PurchaseInvoiceFull, PurchaseOrder, GoodsReceiptNote,
  LandedCost, PurchasePaymentRecord, PurchaseReturn, SupplierCreditNote,
  PurchaseDashboardStats, PurchasePolicy, PurchaseAccountingMapping,
  SupplierPerformance, ProductCostHistory,
} from '../types/purchases';

// ═══════════════════════════════════════════════════════════════════
// PURCHASE POLICY
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_POLICY: PurchasePolicy = {
  company_id: 'company-001',
  require_purchase_request: false,
  require_purchase_order: true,
  require_goods_receipt: true,
  require_3way_match: true,
  allow_price_variance_percent: 5,
  price_variance_action: 'warn',
  qty_variance_action: 'warn',
  allow_direct_invoice: true,
  require_approval_before_payment: false,
  auto_calculate_due_date: true,
  invoice_prefix: 'PI',
  invoice_next_number: 156,
  po_prefix: 'PO',
  po_next_number: 88,
  grn_prefix: 'GRN',
  grn_next_number: 72,
};

// ═══════════════════════════════════════════════════════════════════
// ACCOUNTING MAPPING
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_ACCOUNTING: PurchaseAccountingMapping = {
  company_id: 'company-001',
  inventory_account: '1400',
  accounts_payable_account: '2000',
  cash_account: '1100',
  bank_account: '1110',
  purchase_returns_account: '5100',
  purchase_discount_account: '5200',
  landed_cost_clearing_account: '2100',
  ppv_account: '5300',
  shipping_expense_account: '6200',
  customs_expense_account: '6210',
  other_import_expense_account: '6220',
};

// ═══════════════════════════════════════════════════════════════════
// DEMO SUPPLIERS (for purchase forms)
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_SUPPLIERS = [
  { id: 'sup-001', name: 'Al-Ameen Oud Trading', name_ar: 'شركة الأمين للعود', code: 'S-0001', phone: '+968 9900 1001', country: 'Oman', currency: 'OMR', balance: 6200.000, payment_terms: '30_days' },
  { id: 'sup-002', name: 'Gulf Fragrance Factory', name_ar: 'مصنع الخليج للعطور', code: 'S-0002', phone: '+971 4 321 0000', country: 'UAE', currency: 'AED', balance: 14500.000, payment_terms: '60_days' },
  { id: 'sup-003', name: 'Yasmine Perfumes Ltd.', name_ar: 'شركة ياسمين للعطور', code: 'S-0003', phone: '+966 11 456 7890', country: 'Saudi Arabia', currency: 'SAR', balance: 3100.000, payment_terms: '30_days' },
  { id: 'sup-004', name: 'Shanghai Aroma Co.', name_ar: 'شركة شنغهاي للعطور', code: 'S-0004', phone: '+86 21 8888 0001', country: 'China', currency: 'USD', balance: 22400.000, payment_terms: '60_days' },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO PRODUCTS (for purchase forms)
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_PRODUCTS = [
  { id: 'prod-001', name: 'Royal Oud Premium', name_ar: 'عود ملكي فاخر', sku: 'OUD-001', unit_symbol: 'PCS', unit_id: 'unit-001', last_cost: 45.000, current_stock: 87 },
  { id: 'prod-002', name: 'Desert Rose EDP 100ml', name_ar: 'وردة الصحراء عطر 100مل', sku: 'PERF-001', unit_symbol: 'ML', unit_id: 'unit-006', last_cost: 18.500, current_stock: 142 },
  { id: 'prod-003', name: 'Bakhoor Al-Malak', name_ar: 'بخور الملاك', sku: 'BKH-001', unit_symbol: 'PCS', unit_id: 'unit-001', last_cost: 8.250, current_stock: 234 },
  { id: 'prod-004', name: 'Amber Musk 50ml', name_ar: 'عنبر المسك 50مل', sku: 'PERF-002', unit_symbol: 'ML', unit_id: 'unit-006', last_cost: 12.000, current_stock: 8 },
  { id: 'prod-005', name: 'Oud Oil Pure 3ml', name_ar: 'زيت عود أصيل 3مل', sku: 'OIL-001', unit_symbol: 'ML', unit_id: 'unit-006', last_cost: 95.000, current_stock: 0 },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    company_id: 'company-001',
    branch_id: 'branch-001',
    po_number: 'PO-2026-000085',
    supplier_id: 'sup-001',
    supplier_name: 'Al-Ameen Oud Trading',
    supplier_name_ar: 'شركة الأمين للعود',
    supplier_code: 'S-0001',
    date: '2026-08-10',
    expected_delivery_date: '2026-08-25',
    currency: 'OMR',
    exchange_rate: 0.839,
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    items: [
      {
        id: 'poi-001-1', po_id: 'po-001', product_id: 'prod-001',
        product_name: 'Royal Oud Premium', product_name_ar: 'عود ملكي فاخر',
        product_code: 'OUD-001', quantity: 50, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 37.850, unit_cost_kwd: 45.000,
        discount_type: 'percentage', discount_value: 0, discount_amount: 0,
        line_subtotal: 1892.500, tax_rate: 0, tax_amount: 0, line_total: 1892.500,
        received_qty: 50, outstanding_qty: 0,
      },
      {
        id: 'poi-001-2', po_id: 'po-001', product_id: 'prod-005',
        product_name: 'Oud Oil Pure 3ml', product_name_ar: 'زيت عود أصيل 3مل',
        product_code: 'OIL-001', quantity: 20, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 79.800, unit_cost_kwd: 95.000,
        discount_type: 'percentage', discount_value: 0, discount_amount: 0,
        line_subtotal: 1596.000, tax_rate: 0, tax_amount: 0, line_total: 1596.000,
        received_qty: 20, outstanding_qty: 0,
      },
    ],
    subtotal: 3488.500,
    discount_amount: 0,
    tax_amount: 0,
    total: 3488.500,
    total_company_currency: 4155.000,
    status: 'fully_received',
    total_received_qty: 70,
    total_ordered_qty: 70,
    receipt_count: 1,
    accounting_status: 'posted',
    created_by: 'user-002',
    approved_by: 'user-001',
    approved_at: '2026-08-11T10:00:00Z',
    created_at: '2026-08-10T09:00:00Z',
    updated_at: '2026-08-25T15:00:00Z',
  },
  {
    id: 'po-002',
    company_id: 'company-001',
    branch_id: 'branch-001',
    po_number: 'PO-2026-000086',
    supplier_id: 'sup-004',
    supplier_name: 'Shanghai Aroma Co.',
    supplier_name_ar: 'شركة شنغهاي للعطور',
    supplier_code: 'S-0004',
    date: '2026-08-15',
    expected_delivery_date: '2026-09-20',
    currency: 'USD',
    exchange_rate: 3.270,
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    items: [
      {
        id: 'poi-002-1', po_id: 'po-002', product_id: 'prod-002',
        product_name: 'Desert Rose EDP 100ml', product_name_ar: 'وردة الصحراء عطر 100مل',
        product_code: 'PERF-001', quantity: 500, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 5.660, unit_cost_kwd: 18.500,
        discount_type: 'percentage', discount_value: 5, discount_amount: 141.500,
        line_subtotal: 2688.500, tax_rate: 0, tax_amount: 0, line_total: 2688.500,
        received_qty: 300, outstanding_qty: 200,
      },
      {
        id: 'poi-002-2', po_id: 'po-002', product_id: 'prod-003',
        product_name: 'Bakhoor Al-Malak', product_name_ar: 'بخور الملاك',
        product_code: 'BKH-001', quantity: 1000, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 2.524, unit_cost_kwd: 8.250,
        discount_type: 'percentage', discount_value: 3, discount_amount: 75.720,
        line_subtotal: 2448.280, tax_rate: 0, tax_amount: 0, line_total: 2448.280,
        received_qty: 600, outstanding_qty: 400,
      },
    ],
    subtotal: 5136.780,
    discount_amount: 217.220,
    tax_amount: 0,
    total: 5136.780,
    total_company_currency: 16797.27,
    status: 'partially_received',
    total_received_qty: 900,
    total_ordered_qty: 1500,
    receipt_count: 1,
    accounting_status: 'pending',
    created_by: 'user-002',
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO GRNs
// ═══════════════════════════════════════════════════════════════════

export const DEMO_GRNS: GoodsReceiptNote[] = [
  {
    id: 'grn-001',
    company_id: 'company-001',
    branch_id: 'branch-001',
    grn_number: 'GRN-2026-000068',
    po_id: 'po-001',
    po_number: 'PO-2026-000085',
    supplier_id: 'sup-001',
    supplier_name: 'Al-Ameen Oud Trading',
    supplier_name_ar: 'شركة الأمين للعود',
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    receipt_date: '2026-08-25',
    items: [
      {
        id: 'grni-001-1', grn_id: 'grn-001', po_item_id: 'poi-001-1',
        product_id: 'prod-001', product_name: 'Royal Oud Premium', product_name_ar: 'عود ملكي فاخر',
        product_code: 'OUD-001', ordered_qty: 50, received_qty: 50, damaged_qty: 0,
        short_qty: 0, accepted_qty: 50, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 45.000, batch_number: 'BATCH-2026-0089',
      },
      {
        id: 'grni-001-2', grn_id: 'grn-001', po_item_id: 'poi-001-2',
        product_id: 'prod-005', product_name: 'Oud Oil Pure 3ml', product_name_ar: 'زيت عود أصيل 3مل',
        product_code: 'OIL-001', ordered_qty: 20, received_qty: 20, damaged_qty: 0,
        short_qty: 0, accepted_qty: 20, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 95.000, batch_number: 'BATCH-2026-0090',
      },
    ],
    total_ordered: 70,
    total_received: 70,
    total_damaged: 0,
    total_short: 0,
    status: 'approved',
    created_by: 'user-002',
    approved_by: 'user-001',
    approved_at: '2026-08-25T16:00:00Z',
    created_at: '2026-08-25T15:00:00Z',
    updated_at: '2026-08-25T16:00:00Z',
  },
  {
    id: 'grn-002',
    company_id: 'company-001',
    branch_id: 'branch-001',
    grn_number: 'GRN-2026-000069',
    po_id: 'po-002',
    po_number: 'PO-2026-000086',
    supplier_id: 'sup-004',
    supplier_name: 'Shanghai Aroma Co.',
    supplier_name_ar: 'شركة شنغهاي للعطور',
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    receipt_date: '2026-09-01',
    items: [
      {
        id: 'grni-002-1', grn_id: 'grn-002', po_item_id: 'poi-002-1',
        product_id: 'prod-002', product_name: 'Desert Rose EDP 100ml', product_name_ar: 'وردة الصحراء عطر 100مل',
        product_code: 'PERF-001', ordered_qty: 500, received_qty: 300, damaged_qty: 5,
        short_qty: 200, accepted_qty: 295, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 18.500,
      },
      {
        id: 'grni-002-2', grn_id: 'grn-002', po_item_id: 'poi-002-2',
        product_id: 'prod-003', product_name: 'Bakhoor Al-Malak', product_name_ar: 'بخور الملاك',
        product_code: 'BKH-001', ordered_qty: 1000, received_qty: 600, damaged_qty: 0,
        short_qty: 400, accepted_qty: 600, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 8.250,
      },
    ],
    total_ordered: 1500,
    total_received: 900,
    total_damaged: 5,
    total_short: 600,
    status: 'pending_approval',
    created_by: 'user-002',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO PURCHASE INVOICES
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_INVOICES: PurchaseInvoiceFull[] = [
  {
    id: 'pi-001',
    company_id: 'company-001',
    branch_id: 'branch-001',
    invoice_number: 'PI-2026-000148',
    supplier_invoice_number: 'AMN-INV-9821',
    po_id: 'po-001',
    po_number: 'PO-2026-000085',
    grn_id: 'grn-001',
    grn_number: 'GRN-2026-000068',
    supplier_id: 'sup-001',
    supplier_name: 'Al-Ameen Oud Trading',
    supplier_name_ar: 'شركة الأمين للعود',
    supplier_code: 'S-0001',
    date: '2026-08-26',
    due_date: '2026-09-25',
    currency: 'OMR',
    exchange_rate: 0.839,
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    items: [
      {
        id: 'pii-001-1', invoice_id: 'pi-001', line_number: 1,
        product_id: 'prod-001', product_name: 'Royal Oud Premium', product_name_ar: 'عود ملكي فاخر',
        product_code: 'OUD-001', quantity: 50, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 45.000, unit_cost_kwd: 45.000, po_unit_cost: 45.000, price_variance: 0,
        line_discount_type: 'percentage', line_discount_value: 0, line_discount_amount: 0,
        line_subtotal: 2250.000, tax_rate: 0, tax_amount: 0, line_total: 2250.000,
        allocated_shipping: 120.000, allocated_customs: 80.000, allocated_insurance: 25.000, allocated_other: 0,
        total_landed_cost: 225.000, final_unit_cost: 49.500,
        received_qty: 50, qty_variance: 0, batch_number: 'BATCH-2026-0089',
      },
      {
        id: 'pii-001-2', invoice_id: 'pi-001', line_number: 2,
        product_id: 'prod-005', product_name: 'Oud Oil Pure 3ml', product_name_ar: 'زيت عود أصيل 3مل',
        product_code: 'OIL-001', quantity: 20, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 95.000, unit_cost_kwd: 95.000, po_unit_cost: 95.000, price_variance: 0,
        line_discount_type: 'percentage', line_discount_value: 0, line_discount_amount: 0,
        line_subtotal: 1900.000, tax_rate: 0, tax_amount: 0, line_total: 1900.000,
        allocated_shipping: 50.556, allocated_customs: 33.704, allocated_insurance: 10.556, allocated_other: 0,
        total_landed_cost: 94.816, final_unit_cost: 99.741,
        received_qty: 20, qty_variance: 0, batch_number: 'BATCH-2026-0090',
      },
    ],
    subtotal: 4150.000,
    invoice_discount_type: 'percentage',
    invoice_discount_value: 0,
    invoice_discount_amount: 0,
    tax_amount: 0,
    total: 4150.000,
    total_kwd: 4150.000,
    paid_amount: 2000.000,
    outstanding: 2150.000,
    payments: [
      {
        id: 'pp-001-1', invoice_id: 'pi-001', company_id: 'company-001',
        payment_number: 'PP-2026-000055', date: '2026-08-28', amount: 2000.000,
        method: 'bank_transfer', reference: 'TRF-OUT-00121',
        is_reversed: false, created_by: 'user-002', created_at: '2026-08-28T10:00:00Z',
      },
    ],
    payment_method: 'credit',
    matching_status: 'matched',
    qty_variance: 0,
    price_variance: 0,
    price_variance_amount: 0,
    status: 'partially_paid',
    landed_cost_ids: ['lc-001'],
    total_landed_cost_allocated: 319.816,
    final_inventory_cost: 4469.816,
    accounting_status: 'posted',
    created_by: 'user-002',
    approved_by: 'user-001',
    approved_at: '2026-08-26T11:00:00Z',
    created_at: '2026-08-26T10:00:00Z',
    updated_at: '2026-08-28T10:00:00Z',
  },
  {
    id: 'pi-002',
    company_id: 'company-001',
    branch_id: 'branch-001',
    invoice_number: 'PI-2026-000149',
    supplier_invoice_number: 'SHA-INV-40021',
    po_id: 'po-002',
    po_number: 'PO-2026-000086',
    grn_id: 'grn-002',
    grn_number: 'GRN-2026-000069',
    supplier_id: 'sup-004',
    supplier_name: 'Shanghai Aroma Co.',
    supplier_name_ar: 'شركة شنغهاي للعطور',
    supplier_code: 'S-0004',
    date: '2026-09-02',
    due_date: '2026-11-01',
    currency: 'USD',
    exchange_rate: 3.270,
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    items: [
      {
        id: 'pii-002-1', invoice_id: 'pi-002', line_number: 1,
        product_id: 'prod-002', product_name: 'Desert Rose EDP 100ml', product_name_ar: 'وردة الصحراء عطر 100مل',
        product_code: 'PERF-001', quantity: 300, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 18.700, unit_cost_kwd: 18.700, po_unit_cost: 18.500, price_variance: 0.200,
        line_discount_type: 'percentage', line_discount_value: 5, line_discount_amount: 280.500,
        line_subtotal: 5329.500, tax_rate: 0, tax_amount: 0, line_total: 5329.500,
        allocated_shipping: 380.000, allocated_customs: 210.000, allocated_insurance: 95.000, allocated_other: 42.000,
        total_landed_cost: 727.000, final_unit_cost: 21.123,
        received_qty: 295, qty_variance: 5,
      },
      {
        id: 'pii-002-2', invoice_id: 'pi-002', line_number: 2,
        product_id: 'prod-003', product_name: 'Bakhoor Al-Malak', product_name_ar: 'بخور الملاك',
        product_code: 'BKH-001', quantity: 600, unit_id: 'unit-001', unit_symbol: 'PCS',
        unit_cost: 8.250, unit_cost_kwd: 8.250, po_unit_cost: 8.250, price_variance: 0,
        line_discount_type: 'percentage', line_discount_value: 3, line_discount_amount: 148.500,
        line_subtotal: 4801.500, tax_rate: 0, tax_amount: 0, line_total: 4801.500,
        allocated_shipping: 156.000, allocated_customs: 86.000, allocated_insurance: 39.000, allocated_other: 17.000,
        total_landed_cost: 298.000, final_unit_cost: 8.747,
        received_qty: 600, qty_variance: 0,
      },
    ],
    subtotal: 10131.000,
    invoice_discount_type: 'percentage',
    invoice_discount_value: 0,
    invoice_discount_amount: 0,
    tax_amount: 0,
    total: 10131.000,
    total_kwd: 10131.000,
    paid_amount: 0,
    outstanding: 10131.000,
    payments: [],
    payment_method: 'credit',
    matching_status: 'mismatch',
    qty_variance: 5,
    price_variance: 0.200,
    price_variance_amount: 60.000,
    status: 'approved',
    landed_cost_ids: ['lc-002'],
    total_landed_cost_allocated: 1025.000,
    final_inventory_cost: 11156.000,
    accounting_status: 'posted',
    created_by: 'user-002',
    approved_by: 'user-001',
    approved_at: '2026-09-02T14:00:00Z',
    created_at: '2026-09-02T13:00:00Z',
    updated_at: '2026-09-02T14:00:00Z',
  },
  {
    id: 'pi-003',
    company_id: 'company-001',
    branch_id: 'branch-001',
    invoice_number: 'PI-2026-000145',
    supplier_invoice_number: 'YAS-2026-0412',
    supplier_id: 'sup-003',
    supplier_name: 'Yasmine Perfumes Ltd.',
    supplier_name_ar: 'شركة ياسمين للعطور',
    supplier_code: 'S-0003',
    date: '2026-08-01',
    due_date: '2026-08-31',
    currency: 'SAR',
    exchange_rate: 3.975,
    warehouse_id: 'wh-001',
    warehouse_name: 'Main Warehouse',
    items: [
      {
        id: 'pii-003-1', invoice_id: 'pi-003', line_number: 1,
        product_id: 'prod-004', product_name: 'Amber Musk 50ml', product_name_ar: 'عنبر المسك 50مل',
        product_code: 'PERF-002', quantity: 200, unit_id: 'unit-006', unit_symbol: 'ML',
        unit_cost: 12.000, unit_cost_kwd: 12.000, po_unit_cost: 12.000, price_variance: 0,
        line_discount_type: 'percentage', line_discount_value: 0, line_discount_amount: 0,
        line_subtotal: 2400.000, tax_rate: 0, tax_amount: 0, line_total: 2400.000,
        allocated_shipping: 0, allocated_customs: 0, allocated_insurance: 0, allocated_other: 0,
        total_landed_cost: 0, final_unit_cost: 12.000,
        received_qty: 200, qty_variance: 0,
      },
    ],
    subtotal: 2400.000,
    invoice_discount_type: 'percentage',
    invoice_discount_value: 0,
    invoice_discount_amount: 0,
    tax_amount: 0,
    total: 2400.000,
    total_kwd: 2400.000,
    paid_amount: 2400.000,
    outstanding: 0,
    payments: [
      {
        id: 'pp-003-1', invoice_id: 'pi-003', company_id: 'company-001',
        payment_number: 'PP-2026-000048', date: '2026-08-30', amount: 2400.000,
        method: 'bank_transfer', reference: 'TRF-OUT-00112',
        is_reversed: false, created_by: 'user-002', created_at: '2026-08-30T09:00:00Z',
      },
    ],
    payment_method: 'credit',
    matching_status: 'not_matched',
    qty_variance: 0,
    price_variance: 0,
    price_variance_amount: 0,
    status: 'paid',
    total_landed_cost_allocated: 0,
    final_inventory_cost: 2400.000,
    accounting_status: 'posted',
    created_by: 'user-002',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO LANDED COSTS
// ═══════════════════════════════════════════════════════════════════

export const DEMO_LANDED_COSTS: LandedCost[] = [
  {
    id: 'lc-001',
    company_id: 'company-001',
    landed_cost_number: 'LC-2026-000021',
    po_ids: ['po-001'],
    invoice_ids: ['pi-001'],
    vendor_name: 'Gulf Freight & Clearance',
    vendor_invoice_number: 'GFC-INV-7741',
    date: '2026-08-27',
    cost_lines: [
      { id: 'lcl-001-1', landed_cost_id: 'lc-001', cost_type: 'shipping', description: 'Sea Freight from Oman', description_ar: 'شحن بحري من عمان', currency: 'KWD', exchange_rate: 1, amount: 170.556, amount_kwd: 170.556, vendor_invoice: 'GFC-SHP-001', accounting_treatment: 'inventory_cost' },
      { id: 'lcl-001-2', landed_cost_id: 'lc-001', cost_type: 'customs', description: 'Customs Duty', description_ar: 'رسوم جمارك', currency: 'KWD', exchange_rate: 1, amount: 113.704, amount_kwd: 113.704, accounting_treatment: 'inventory_cost' },
      { id: 'lcl-001-3', landed_cost_id: 'lc-001', cost_type: 'insurance', description: 'Cargo Insurance', description_ar: 'تأمين شحنة', currency: 'KWD', exchange_rate: 1, amount: 35.556, amount_kwd: 35.556, accounting_treatment: 'inventory_cost' },
    ],
    total_cost: 319.816,
    total_cost_kwd: 319.816,
    allocation_method: 'value',
    allocation_base_value: 4150.000,
    status: 'finalized',
    accounting_treatment: 'inventory_cost',
    notes: 'Shipment from Muscat - Aug 2026',
    created_by: 'user-002',
    approved_by: 'user-001',
    finalized_by: 'user-001',
    finalized_at: '2026-08-28T09:00:00Z',
    created_at: '2026-08-27T08:00:00Z',
    updated_at: '2026-08-28T09:00:00Z',
    allocated_items: [
      { product_id: 'prod-001', product_name: 'Royal Oud Premium', invoice_id: 'pi-001', base_value: 2250.000, allocation_percent: 54.22, allocated_amount: 173.316, allocated_per_unit: 3.466 },
      { product_id: 'prod-005', product_name: 'Oud Oil Pure 3ml', invoice_id: 'pi-001', base_value: 1900.000, allocation_percent: 45.78, allocated_amount: 146.500, allocated_per_unit: 7.325 },
    ],
  },
  {
    id: 'lc-002',
    company_id: 'company-001',
    landed_cost_number: 'LC-2026-000022',
    po_ids: ['po-002'],
    invoice_ids: ['pi-002'],
    vendor_name: 'China Express Shipping Co.',
    vendor_invoice_number: 'CES-BILL-88214',
    date: '2026-09-03',
    cost_lines: [
      { id: 'lcl-002-1', landed_cost_id: 'lc-002', cost_type: 'shipping', description: 'Ocean Freight from Shanghai', description_ar: 'شحن بحري من شنغهاي', currency: 'USD', exchange_rate: 3.270, amount: 165.749, amount_kwd: 536.000, vendor_invoice: 'CES-SHP-214', accounting_treatment: 'inventory_cost' },
      { id: 'lcl-002-2', landed_cost_id: 'lc-002', cost_type: 'customs', description: 'Kuwait Customs Duty', description_ar: 'جمارك كويتية', currency: 'KWD', exchange_rate: 1, amount: 296.000, amount_kwd: 296.000, accounting_treatment: 'inventory_cost' },
      { id: 'lcl-002-3', landed_cost_id: 'lc-002', cost_type: 'insurance', description: 'Marine Insurance', description_ar: 'تأمين بحري', currency: 'KWD', exchange_rate: 1, amount: 134.000, amount_kwd: 134.000, accounting_treatment: 'inventory_cost' },
      { id: 'lcl-002-4', landed_cost_id: 'lc-002', cost_type: 'clearance', description: 'Customs Clearance & Handling', description_ar: 'تخليص جمركي ومناولة', currency: 'KWD', exchange_rate: 1, amount: 59.000, amount_kwd: 59.000, accounting_treatment: 'inventory_cost' },
    ],
    total_cost: 1025.000,
    total_cost_kwd: 1025.000,
    allocation_method: 'value',
    allocation_base_value: 10131.000,
    status: 'allocated',
    accounting_treatment: 'inventory_cost',
    notes: 'Shipment from Shanghai - Sep 2026',
    created_by: 'user-002',
    created_at: '2026-09-03T09:00:00Z',
    updated_at: '2026-09-03T09:00:00Z',
    allocated_items: [
      { product_id: 'prod-002', product_name: 'Desert Rose EDP 100ml', invoice_id: 'pi-002', base_value: 5329.500, allocation_percent: 52.60, allocated_amount: 539.150, allocated_per_unit: 1.797 },
      { product_id: 'prod-003', product_name: 'Bakhoor Al-Malak', invoice_id: 'pi-002', base_value: 4801.500, allocation_percent: 47.40, allocated_amount: 485.850, allocated_per_unit: 0.810 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO PURCHASE RETURNS
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: 'pr-001',
    company_id: 'company-001',
    branch_id: 'branch-001',
    return_number: 'PR-2026-000011',
    original_invoice_id: 'pi-001',
    original_invoice_number: 'PI-2026-000148',
    supplier_id: 'sup-001',
    supplier_name: 'Al-Ameen Oud Trading',
    date: '2026-09-01',
    return_type: 'partial',
    items: [
      {
        id: 'pri-001-1', return_id: 'pr-001', original_item_id: 'pii-001-1',
        product_id: 'prod-001', product_name: 'Royal Oud Premium',
        quantity: 3, unit_cost: 45.000, line_total: 135.000,
        remove_from_inventory: true, warehouse_id: 'wh-001',
      },
    ],
    subtotal: 135.000,
    total: 135.000,
    refund_method: 'credit',
    reason: 'Defective items found during quality check',
    reason_ar: 'منتجات معيبة تم اكتشافها أثناء الفحص',
    status: 'completed',
    approved_by: 'user-001',
    approved_at: '2026-09-01T14:00:00Z',
    inventory_removed: true,
    created_by: 'user-002',
    created_at: '2026-09-01T11:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO SUPPLIER CREDIT NOTES
// ═══════════════════════════════════════════════════════════════════

export const DEMO_SUPPLIER_CREDIT_NOTES: SupplierCreditNote[] = [
  {
    id: 'scn-001',
    company_id: 'company-001',
    credit_note_number: 'SCN-2026-000008',
    original_invoice_id: 'pi-001',
    original_invoice_number: 'PI-2026-000148',
    supplier_id: 'sup-001',
    supplier_name: 'Al-Ameen Oud Trading',
    date: '2026-09-02',
    amount: 135.000,
    reason: 'Return of 3 defective units — Royal Oud Premium',
    reason_ar: 'إرجاع 3 وحدات معيبة من عود ملكي فاخر',
    status: 'approved',
    created_by: 'user-002',
    created_at: '2026-09-02T09:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO PRODUCT COST HISTORY
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PRODUCT_COST_HISTORY: ProductCostHistory[] = [
  {
    id: 'pch-001', company_id: 'company-001', product_id: 'prod-001',
    product_name: 'Royal Oud Premium', date: '2026-08-26',
    supplier_id: 'sup-001', supplier_name: 'Al-Ameen Oud Trading',
    invoice_id: 'pi-001', invoice_number: 'PI-2026-000148',
    warehouse_id: 'wh-001', batch_number: 'BATCH-2026-0089',
    quantity: 50, unit_symbol: 'PCS',
    purchase_cost: 45.000, allocated_shipping: 2.412, allocated_customs: 1.608, allocated_insurance: 0.503, allocated_clearance: 0, allocated_other: 0,
    total_landed_cost: 4.523, final_inventory_cost: 49.523,
    previous_cost: 43.500, price_variance: 1.500, cost_finalized: true,
    created_at: '2026-08-28T09:00:00Z',
  },
  {
    id: 'pch-002', company_id: 'company-001', product_id: 'prod-002',
    product_name: 'Desert Rose EDP 100ml', date: '2026-09-02',
    supplier_id: 'sup-004', supplier_name: 'Shanghai Aroma Co.',
    invoice_id: 'pi-002', invoice_number: 'PI-2026-000149',
    warehouse_id: 'wh-001',
    quantity: 295, unit_symbol: 'ML',
    purchase_cost: 18.700, allocated_shipping: 1.282, allocated_customs: 0.708, allocated_insurance: 0.320, allocated_clearance: 0.143, allocated_other: 0.044,
    total_landed_cost: 2.497, final_inventory_cost: 21.197,
    previous_cost: 18.500, price_variance: 0.200, cost_finalized: false,
    created_at: '2026-09-03T09:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

export const DEMO_PURCHASE_STATS: PurchaseDashboardStats = {
  period: 'thisMonth',
  total_purchases: 16681.000,
  total_invoices: 11,
  total_paid: 4400.000,
  outstanding_payables: 12281.000,
  overdue_payables: 3100.000,
  total_returns: 135.000,
  landed_costs_total: 1344.816,
  pending_pos: 1,
  pending_receipts: 1,
  count_paid: 3,
  count_unpaid: 5,
  count_overdue: 2,
  count_draft: 1,
  count_returns: 1,
  purchase_price_variance: 60.000,
  currency: 'KWD',
};

// ═══════════════════════════════════════════════════════════════════
// DEMO SUPPLIER PERFORMANCE
// ═══════════════════════════════════════════════════════════════════

export const DEMO_SUPPLIER_PERFORMANCE: SupplierPerformance[] = [
  { supplier_id: 'sup-001', supplier_name: 'Al-Ameen Oud Trading', total_purchases: 12400.000, total_invoices: 8, total_paid: 8200.000, outstanding_balance: 4200.000, total_returns: 135.000, return_rate_percent: 1.09, avg_purchase_price_change: 3.4, on_time_delivery_rate: 92.5, quantity_accuracy_rate: 98.0, avg_lead_time_days: 12, price_stability_score: 85, overall_score: 88, last_purchase_date: '2026-08-26', currency: 'KWD' },
  { supplier_id: 'sup-004', supplier_name: 'Shanghai Aroma Co.', total_purchases: 16797.270, total_invoices: 4, total_paid: 0, outstanding_balance: 16797.270, total_returns: 0, return_rate_percent: 0, avg_purchase_price_change: 1.1, on_time_delivery_rate: 78.5, quantity_accuracy_rate: 94.2, avg_lead_time_days: 35, price_stability_score: 72, overall_score: 74, last_purchase_date: '2026-09-02', currency: 'KWD' },
  { supplier_id: 'sup-003', supplier_name: 'Yasmine Perfumes Ltd.', total_purchases: 5800.000, total_invoices: 5, total_paid: 5800.000, outstanding_balance: 0, total_returns: 0, return_rate_percent: 0, avg_purchase_price_change: 0.5, on_time_delivery_rate: 95.0, quantity_accuracy_rate: 99.0, avg_lead_time_days: 8, price_stability_score: 95, overall_score: 94, last_purchase_date: '2026-08-01', currency: 'KWD' },
];

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

export function generatePurchaseNumber(prefix: string, nextNum: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(nextNum).padStart(6, '0')}`;
}

export function calculateDueDate(invoiceDate: string, paymentTerms: string): string {
  const date = new Date(invoiceDate);
  const termMap: Record<string, number> = { cash: 0, immediate: 0, '7_days': 7, '15_days': 15, '30_days': 30, '60_days': 60 };
  const days = termMap[paymentTerms] ?? 30;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function allocateLandedCost(
  totalCost: number,
  items: { id: string; base_value: number }[],
  method: string,
): { id: string; allocated: number; percent: number }[] {
  const totalBase = items.reduce((s, i) => s + i.base_value, 0);
  if (totalBase === 0) return items.map(i => ({ id: i.id, allocated: 0, percent: 0 }));
  return items.map(i => ({
    id: i.id,
    percent: (i.base_value / totalBase) * 100,
    allocated: (i.base_value / totalBase) * totalCost,
  }));
}
