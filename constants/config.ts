// Gulf Embedded Accounting Platform — Config
// Architecture: Modular, API-first, Multi-tenant, Arabic-first, Gulf-ready

export const APP_CONFIG = {
  name: 'Gulf Embedded Accounting',
  nameAr: 'منصة المحاسبة الخليجية',
  taglineAr: 'بنية تحتية محاسبية مدمجة لشركات الخليج',
  taglineEn: 'Embedded Accounting Infrastructure for Gulf Businesses',
  version: '2.0.0',
  defaultCurrency: 'KWD',
  defaultCountry: 'KW',
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'],
};

// ─── USER ROLES ──────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_OWNER: 'company_owner',
  COMPANY_MANAGER: 'company_manager',
  ACCOUNTANT: 'accountant',
  SALES_EMPLOYEE: 'sales_employee',
  PURCHASE_EMPLOYEE: 'purchase_employee',
  INVENTORY_EMPLOYEE: 'inventory_employee',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const MODULES = {
  DASHBOARD: 'dashboard',
  SALES: 'sales',
  PURCHASES: 'purchases',
  EXPENSES: 'expenses',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  ACCOUNTING: 'accounting',
  REPORTS: 'reports',
  AI: 'ai',
  BRANCHES: 'branches',
  USERS: 'users',
  INTEGRATIONS: 'integrations',
  SETTINGS: 'settings',
} as const;

// Default Role Permissions Map
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Partial<Record<string, Permission[]>>> = {
  super_admin: { '*': ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
  company_owner: { '*': ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
  company_manager: {
    dashboard: ['view'],
    sales: ['view', 'create', 'edit', 'approve', 'export'],
    purchases: ['view', 'create', 'edit', 'approve', 'export'],
    expenses: ['view', 'create', 'edit', 'approve', 'export'],
    customers: ['view', 'create', 'edit', 'export'],
    suppliers: ['view', 'create', 'edit', 'export'],
    products: ['view', 'create', 'edit', 'export'],
    inventory: ['view', 'create', 'edit', 'export'],
    accounting: ['view', 'export'],
    reports: ['view', 'export'],
    users: ['view'],
  },
  accountant: {
    dashboard: ['view'],
    sales: ['view', 'create', 'edit', 'export'],
    purchases: ['view', 'create', 'edit', 'export'],
    expenses: ['view', 'create', 'edit', 'export'],
    customers: ['view', 'export'],
    suppliers: ['view', 'export'],
    accounting: ['view', 'create', 'edit', 'export'],
    reports: ['view', 'export'],
  },
  sales_employee: {
    dashboard: ['view'],
    sales: ['view', 'create', 'edit'],
    customers: ['view', 'create', 'edit'],
    products: ['view'],
    inventory: ['view'],
  },
  purchase_employee: {
    dashboard: ['view'],
    purchases: ['view', 'create', 'edit'],
    suppliers: ['view', 'create', 'edit'],
    products: ['view'],
    inventory: ['view'],
  },
  inventory_employee: {
    dashboard: ['view'],
    products: ['view', 'create', 'edit'],
    inventory: ['view', 'create', 'edit'],
  },
  viewer: {
    dashboard: ['view'],
    reports: ['view'],
  },
};

// ─── GULF CURRENCIES ─────────────────────────────────────────────
export const CURRENCIES = [
  { code: 'KWD', name: 'Kuwaiti Dinar',         nameAr: 'دينار كويتي',         symbol: 'د.ك', decimals: 3, country: 'KW' },
  { code: 'SAR', name: 'Saudi Riyal',            nameAr: 'ريال سعودي',           symbol: 'ر.س', decimals: 2, country: 'SA' },
  { code: 'AED', name: 'UAE Dirham',             nameAr: 'درهم إماراتي',         symbol: 'د.إ', decimals: 2, country: 'AE' },
  { code: 'QAR', name: 'Qatari Riyal',           nameAr: 'ريال قطري',            symbol: 'ر.ق', decimals: 2, country: 'QA' },
  { code: 'BHD', name: 'Bahraini Dinar',         nameAr: 'دينار بحريني',         symbol: 'د.ب', decimals: 3, country: 'BH' },
  { code: 'OMR', name: 'Omani Rial',             nameAr: 'ريال عُماني',          symbol: 'ر.ع', decimals: 3, country: 'OM' },
  { code: 'USD', name: 'US Dollar',              nameAr: 'دولار أمريكي',         symbol: '$',   decimals: 2, country: null },
  { code: 'EUR', name: 'Euro',                   nameAr: 'يورو',                 symbol: '€',   decimals: 2, country: null },
  { code: 'GBP', name: 'British Pound',          nameAr: 'جنيه إسترليني',        symbol: '£',   decimals: 2, country: null },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // KWD

// ─── PLATFORM ARCHITECTURE LAYERS ────────────────────────────────
// Documentation of the system architecture for developer reference

export const PLATFORM_ARCHITECTURE = {
  layers: [
    {
      name: 'Company Application / POS / E-commerce / Other Systems',
      nameAr: 'تطبيق الشركة / نقطة البيع / التجارة الإلكترونية',
      description: 'External systems that integrate via API or Embedded SDK',
    },
    {
      name: 'API Gateway',
      nameAr: 'بوابة API',
      description: 'Rate limiting, auth validation, routing, versioning',
    },
    {
      name: 'Authentication & Authorization',
      nameAr: 'المصادقة والتفويض',
      description: 'JWT, API Keys, OAuth, RBAC, Company isolation',
    },
    {
      name: 'Business Logic Layer',
      nameAr: 'طبقة المنطق التجاري',
      description: 'Sales, Purchases, Expenses, Inventory, Customers, Suppliers',
    },
    {
      name: 'Accounting Engine',
      nameAr: 'محرك المحاسبة',
      description: 'Double entry, Chart of accounts, Journal entries, Periods',
    },
    {
      name: 'Gulf Accounting Layer',
      nameAr: 'طبقة المحاسبة الخليجية',
      description: 'Country-specific rules: VAT, compliance, invoice formats',
    },
    {
      name: 'Ledger / Database',
      nameAr: 'قاعدة البيانات / دفتر الأستاذ',
      description: 'Multi-tenant PostgreSQL with row-level security',
    },
    {
      name: 'Reporting Engine',
      nameAr: 'محرك التقارير',
      description: 'P&L, Balance Sheet, Cash Flow, AR/AP Aging, Custom reports',
    },
    {
      name: 'AI Financial Intelligence',
      nameAr: 'الذكاء المالي الاصطناعي',
      description: 'Analysis, insights, anomaly detection, forecasting',
    },
  ],
  principles: [
    'Modular — each layer is independently replaceable',
    'API-first — everything accessible via API',
    'Arabic-first — not just translated, designed for Arabic',
    'Gulf-ready — Kuwait first, expandable to all GCC countries',
    'Multi-tenant — complete data isolation per company',
    'Accounting Engine owns financial truth — AI only reads, never writes',
  ],
};
