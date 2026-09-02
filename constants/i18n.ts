// Gulf Embedded Accounting Platform — i18n Translations
// Arabic-first: Not just translation, designed for Arabic Gulf business context
export type Language = 'ar' | 'en';

const translations = {
  ar: {
    // App
    appName: 'منصة المحاسبة الخليجية',
    tagline: 'بنية تحتية محاسبية مدمجة لشركات الخليج',

    // Auth
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    loginButton: 'دخول',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    passwordPlaceholder: 'أدخل كلمة المرور',
    forgotPasswordTitle: 'استعادة كلمة المرور',
    forgotPasswordDesc: 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة',
    sendResetLink: 'إرسال رابط الاستعادة',
    backToLogin: 'العودة لتسجيل الدخول',

    // Validation
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    invalidCredentials: 'بيانات الدخول غير صحيحة',

    // Navigation
    dashboard: 'لوحة التحكم',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    expenses: 'المصروفات',
    customers: 'العملاء',
    suppliers: 'الموردون',
    products: 'المنتجات',
    inventory: 'المخزون',
    accounting: 'المحاسبة',
    reports: 'التقارير',
    aiAssistant: 'المساعد المالي الذكي',
    branches: 'الفروع',
    usersPermissions: 'المستخدمون والصلاحيات',
    integrations: 'التكاملات والمطورون',
    settings: 'الإعدادات',

    // Super Admin
    companies: 'الشركات',
    subscriptions: 'الاشتراكات',
    plans: 'الباقات',
    systemSettings: 'إعدادات النظام',
    superAdminPanel: 'لوحة الإدارة العليا',

    // Dashboard KPIs
    totalSales: 'إجمالي المبيعات',
    totalPurchases: 'إجمالي المشتريات',
    totalExpenses: 'إجمالي المصروفات',
    netProfit: 'صافي الربح',
    cash: 'النقدية',
    bankBalance: 'رصيد البنك',
    accountsReceivable: 'الذمم المدينة',
    accountsPayable: 'الذمم الدائنة',
    inventoryValue: 'قيمة المخزون',

    // Periods
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام',
    customRange: 'نطاق مخصص',

    // Company Stats
    totalCompanies: 'إجمالي الشركات',
    activeCompanies: 'الشركات النشطة',
    suspendedCompanies: 'الشركات الموقوفة',
    totalUsers: 'إجمالي المستخدمين',
    totalRevenue: 'إجمالي الإيرادات',
    newCompanies: 'شركات جديدة',

    // Actions
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    approve: 'اعتماد',
    suspend: 'إيقاف',
    activate: 'تفعيل',

    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    suspended: 'موقوف',
    pending: 'معلق',
    approved: 'معتمد',
    draft: 'مسودة',
    paid: 'مدفوع',
    partial: 'جزئي',
    overdue: 'متأخر',

    // Common
    name: 'الاسم',
    code: 'الكود',
    date: 'التاريخ',
    amount: 'المبلغ',
    currency: 'العملة',
    notes: 'ملاحظات',
    status: 'الحالة',
    actions: 'الإجراءات',
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    comingSoon: 'قريباً',
    underDevelopment: 'قيد التطوير',

    // Company Settings
    companyName: 'اسم الشركة',
    commercialReg: 'السجل التجاري',
    taxNumber: 'الرقم الضريبي',
    companySettings: 'إعدادات الشركة',
    fiscalYear: 'السنة المالية',

    // Language
    changeLanguage: 'English',
    language: 'اللغة',

    // ── ACCOUNTING TERMS (Arabic-first) ──
    chartOfAccounts: 'دليل الحسابات',
    journalEntry: 'قيد يومي',
    journalEntries: 'القيود اليومية',
    generalLedger: 'دفتر الأستاذ العام',
    trialBalance: 'ميزان المراجعة',
    profitAndLoss: 'قائمة الدخل',
    balanceSheet: 'الميزانية العمومية',
    cashFlowStatement: 'قائمة التدفق النقدي',
    revenue: 'الإيرادات',
    expenses2: 'المصروفات',
    assets: 'الأصول',
    liabilities: 'المطلوبات',
    equity: 'حقوق الملكية',
    debit: 'مدين',
    credit: 'دائن',
    accountingPeriod: 'الفترة المحاسبية',
    closingPeriod: 'إقفال الفترة',
    openingBalance: 'الرصيد الافتتاحي',
    closingBalance: 'الرصيد الختامي',
    costOfGoodsSold: 'تكلفة البضاعة المباعة',
    grossProfit: 'مجمل الربح',
    depreciation: 'الاستهلاك',
    retainedEarnings: 'الأرباح المحتجزة',
    auditTrail: 'سجل المراجعة المالية',
    reversalEntry: 'قيد عكسي',
    adjustingEntry: 'قيد تسوية',

    // ── GULF LAYER ──
    gulfCountry: 'الدولة الخليجية',
    vatRate: 'نسبة ضريبة القيمة المضافة',
    taxAuthority: 'الجهة الضريبية',
    invoiceCompliance: 'متطلبات الفاتورة',
    eInvoicing: 'الفوترة الإلكترونية',

    // ── PLATFORM FEATURES ──
    financialHealth: 'الصحة المالية',
    financialHealthScore: 'مؤشر الصحة المالية',
    aiInsights: 'التحليل الذكي',
    automatedInsights: 'تحليلات تلقائية',
    embeddedMode: 'وضع المدمج',
    whiteLabel: 'العلامة البيضاء',
    apiAccess: 'وصول API',
    webhooks: 'إشعارات الأحداث',
    sandboxEnv: 'بيئة الاختبار',
    developerPortal: 'بوابة المطورين',
    industryTemplate: 'قالب الصناعة',
  },

  en: {
    // App
    appName: 'Gulf Embedded Accounting',
    tagline: 'Embedded Accounting Infrastructure for Gulf Businesses',

    // Auth
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    loginButton: 'Sign In',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    forgotPasswordTitle: 'Reset Password',
    forgotPasswordDesc: 'Enter your email and we will send you a reset link',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',

    // Validation
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmail: 'Invalid email address',
    invalidCredentials: 'Invalid credentials',

    // Navigation
    dashboard: 'Dashboard',
    sales: 'Sales',
    purchases: 'Purchases',
    expenses: 'Expenses',
    customers: 'Customers',
    suppliers: 'Suppliers',
    products: 'Products',
    inventory: 'Inventory',
    accounting: 'Accounting',
    reports: 'Reports',
    aiAssistant: 'AI Financial Assistant',
    branches: 'Branches',
    usersPermissions: 'Users & Permissions',
    integrations: 'Integrations & Developer',
    settings: 'Settings',

    // Super Admin
    companies: 'Companies',
    subscriptions: 'Subscriptions',
    plans: 'Plans',
    systemSettings: 'System Settings',
    superAdminPanel: 'Super Admin Panel',

    // Dashboard KPIs
    totalSales: 'Total Sales',
    totalPurchases: 'Total Purchases',
    totalExpenses: 'Total Expenses',
    netProfit: 'Net Profit',
    cash: 'Cash',
    bankBalance: 'Bank Balance',
    accountsReceivable: 'Accounts Receivable',
    accountsPayable: 'Accounts Payable',
    inventoryValue: 'Inventory Value',

    // Periods
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    customRange: 'Custom Range',

    // Company Stats
    totalCompanies: 'Total Companies',
    activeCompanies: 'Active Companies',
    suspendedCompanies: 'Suspended Companies',
    totalUsers: 'Total Users',
    totalRevenue: 'Total Revenue',
    newCompanies: 'New Companies',

    // Actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    approve: 'Approve',
    suspend: 'Suspend',
    activate: 'Activate',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
    approved: 'Approved',
    draft: 'Draft',
    paid: 'Paid',
    partial: 'Partial',
    overdue: 'Overdue',

    // Common
    name: 'Name',
    code: 'Code',
    date: 'Date',
    amount: 'Amount',
    currency: 'Currency',
    notes: 'Notes',
    status: 'Status',
    actions: 'Actions',
    noData: 'No data available',
    loading: 'Loading...',
    comingSoon: 'Coming Soon',
    underDevelopment: 'Under Development',

    // Company Settings
    companyName: 'Company Name',
    commercialReg: 'Commercial Registration',
    taxNumber: 'Tax Number',
    companySettings: 'Company Settings',
    fiscalYear: 'Fiscal Year',

    // Language
    changeLanguage: 'عربي',
    language: 'Language',

    // ── ACCOUNTING TERMS ──
    chartOfAccounts: 'Chart of Accounts',
    journalEntry: 'Journal Entry',
    journalEntries: 'Journal Entries',
    generalLedger: 'General Ledger',
    trialBalance: 'Trial Balance',
    profitAndLoss: 'Profit & Loss',
    balanceSheet: 'Balance Sheet',
    cashFlowStatement: 'Cash Flow Statement',
    revenue: 'Revenue',
    expenses2: 'Expenses',
    assets: 'Assets',
    liabilities: 'Liabilities',
    equity: 'Equity',
    debit: 'Debit',
    credit: 'Credit',
    accountingPeriod: 'Accounting Period',
    closingPeriod: 'Period Closing',
    openingBalance: 'Opening Balance',
    closingBalance: 'Closing Balance',
    costOfGoodsSold: 'Cost of Goods Sold',
    grossProfit: 'Gross Profit',
    depreciation: 'Depreciation',
    retainedEarnings: 'Retained Earnings',
    auditTrail: 'Audit Trail',
    reversalEntry: 'Reversal Entry',
    adjustingEntry: 'Adjusting Entry',

    // ── GULF LAYER ──
    gulfCountry: 'Gulf Country',
    vatRate: 'VAT Rate',
    taxAuthority: 'Tax Authority',
    invoiceCompliance: 'Invoice Requirements',
    eInvoicing: 'E-Invoicing',

    // ── PLATFORM FEATURES ──
    financialHealth: 'Financial Health',
    financialHealthScore: 'Financial Health Score',
    aiInsights: 'AI Insights',
    automatedInsights: 'Automated Insights',
    embeddedMode: 'Embedded Mode',
    whiteLabel: 'White Label',
    apiAccess: 'API Access',
    webhooks: 'Event Webhooks',
    sandboxEnv: 'Sandbox Environment',
    developerPortal: 'Developer Portal',
    industryTemplate: 'Industry Template',
  },
};

export type TranslationKey = keyof typeof translations.ar;

export function t(key: TranslationKey, language: Language = 'ar'): string {
  return translations[language][key] ?? key;
}

export default translations;
