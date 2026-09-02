// Accounting Engine Types — Double Entry, Chart of Accounts, Ledger
// Rule: Total Debit MUST equal Total Credit — no exceptions

// ═══════════════════════════════════════════════════════════════════
// CHART OF ACCOUNTS
// ═══════════════════════════════════════════════════════════════════

export type AccountType =
  | 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost_of_goods';

export type AccountNature = 'debit' | 'credit';   // Normal balance side

export type AccountCategory =
  // Assets
  | 'current_asset' | 'fixed_asset' | 'other_asset'
  | 'bank_account' | 'cash_account' | 'accounts_receivable' | 'inventory_account'
  // Liabilities
  | 'current_liability' | 'long_term_liability' | 'accounts_payable' | 'tax_payable'
  // Equity
  | 'owner_equity' | 'retained_earnings' | 'capital'
  // Revenue
  | 'sales_revenue' | 'service_revenue' | 'other_revenue' | 'discount'
  // Expenses
  | 'operating_expense' | 'administrative_expense' | 'selling_expense'
  | 'depreciation' | 'tax_expense' | 'interest_expense' | 'other_expense'
  // COGS
  | 'cost_of_goods_sold' | 'purchase_returns';

export interface Account {
  id: string;
  company_id: string;
  code: string;                   // e.g. '1100', '4000'
  name: string;
  nameAr: string;
  type: AccountType;
  nature: AccountNature;
  category: AccountCategory;
  parent_id?: string;
  level: number;                  // 0=root, 1=group, 2=sub, 3=detail
  is_detail: boolean;             // Only detail accounts accept journal entries
  is_system: boolean;             // System accounts cannot be deleted
  is_active: boolean;
  allow_manual_entry: boolean;
  currency?: string;              // If null, uses company default
  description?: string;
  descriptionAr?: string;
  current_balance: number;
  opening_balance: number;
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// JOURNAL ENTRIES — DOUBLE ENTRY BOOKKEEPING
// ═══════════════════════════════════════════════════════════════════

export type JournalStatus = 'draft' | 'pending_review' | 'posted' | 'reversed' | 'voided';
export type JournalSourceType =
  | 'manual' | 'sale' | 'sale_return' | 'purchase' | 'purchase_return'
  | 'payment_received' | 'payment_made' | 'expense' | 'inventory_adjustment'
  | 'stock_transfer' | 'depreciation' | 'opening_balance' | 'closing_entry'
  | 'adjustment' | 'reversal';

export interface JournalEntry {
  id: string;
  company_id: string;
  branch_id?: string;
  entry_number: string;           // JE-2024-0001
  reference?: string;
  description: string;
  descriptionAr?: string;
  date: string;
  period_id: string;
  fiscal_year: number;
  status: JournalStatus;
  source_type: JournalSourceType;
  source_id?: string;             // Sale ID, Purchase ID, etc.
  lines: JournalLine[];
  total_debit: number;            // Must equal total_credit
  total_credit: number;           // Must equal total_debit
  is_balanced: boolean;           // total_debit === total_credit
  currency: string;
  exchange_rate?: number;
  tags?: string[];
  attachment_url?: string;
  reversed_entry_id?: string;
  reversal_of_id?: string;
  posted_at?: string;
  posted_by?: string;
  reviewed_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  line_number: number;
  account_id: string;
  account_code: string;
  account_name: string;
  account_name_ar: string;
  description?: string;
  descriptionAr?: string;
  debit: number;
  credit: number;
  // Debit XOR Credit — never both
  currency?: string;
  exchange_rate?: number;
  branch_id?: string;
  cost_center?: string;
  partner_id?: string;            // Customer or Supplier ID
  partner_type?: 'customer' | 'supplier';
}

// ═══════════════════════════════════════════════════════════════════
// FISCAL PERIODS
// ═══════════════════════════════════════════════════════════════════

export type PeriodStatus = 'open' | 'locked' | 'closed' | 'archived';

export interface FiscalYear {
  id: string;
  company_id: string;
  year: number;
  start_date: string;
  end_date: string;
  status: PeriodStatus;
  closing_entry_id?: string;
  closed_at?: string;
  closed_by?: string;
}

export interface AccountingPeriod {
  id: string;
  company_id: string;
  fiscal_year_id: string;
  year: number;
  month: number;                  // 1–12
  name: string;                   // 'Jan 2024'
  nameAr: string;                 // 'يناير 2024'
  start_date: string;
  end_date: string;
  status: PeriodStatus;
  locked_at?: string;
  locked_by?: string;
}

// ═══════════════════════════════════════════════════════════════════
// LEDGER & REPORTS
// ═══════════════════════════════════════════════════════════════════

export interface LedgerEntry {
  journal_entry_id: string;
  entry_number: string;
  date: string;
  description: string;
  descriptionAr?: string;
  source_type: JournalSourceType;
  debit: number;
  credit: number;
  balance: number;
  running_balance: number;
}

export interface AccountBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_name_ar: string;
  account_type: AccountType;
  account_nature: AccountNature;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  debit_balance: number;
  credit_balance: number;
}

export interface TrialBalance {
  company_id: string;
  period_id: string;
  as_of_date: string;
  accounts: AccountBalance[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// AUTOMATIC ACCOUNTING RULES
// ═══════════════════════════════════════════════════════════════════

export interface AccountingRule {
  id: string;
  company_id: string;
  trigger: JournalSourceType;
  nameAr: string;
  nameEn: string;
  is_active: boolean;
  lines: AccountingRuleLine[];
}

export interface AccountingRuleLine {
  sequence: number;
  side: 'debit' | 'credit';
  account_id: string;
  account_code: string;
  description_template: string;  // e.g. 'Sale to {customer_name}'
  amount_formula: string;         // e.g. 'total', 'tax_amount', 'subtotal'
}

// ═══════════════════════════════════════════════════════════════════
// ACCOUNTS RECEIVABLE / PAYABLE
// ═══════════════════════════════════════════════════════════════════

export type AgingBucket = '0-30' | '31-60' | '61-90' | '91-120' | '120+';

export interface AgingReport {
  company_id: string;
  report_type: 'receivable' | 'payable';
  as_of_date: string;
  entries: AgingEntry[];
  totals: Record<AgingBucket, number>;
  grand_total: number;
}

export interface AgingEntry {
  partner_id: string;
  partner_name: string;
  partner_name_ar?: string;
  partner_code: string;
  buckets: Record<AgingBucket, number>;
  total: number;
  credit_limit?: number;
  overdue_amount: number;
}

// ═══════════════════════════════════════════════════════════════════
// ACCOUNTING TERMINOLOGY — ARABIC / GULF STANDARD
// ═══════════════════════════════════════════════════════════════════

export const ACCOUNTING_TERMS = {
  ar: {
    chartOfAccounts: 'دليل الحسابات',
    journalEntry: 'قيد يومي',
    journalEntries: 'القيود اليومية',
    generalLedger: 'دفتر الأستاذ العام',
    trialBalance: 'ميزان المراجعة',
    profitAndLoss: 'قائمة الدخل',
    balanceSheet: 'الميزانية العمومية',
    cashFlowStatement: 'قائمة التدفق النقدي',
    accountsReceivable: 'الذمم المدينة',
    accountsPayable: 'الذمم الدائنة',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    assets: 'الأصول',
    liabilities: 'المطلوبات',
    equity: 'حقوق الملكية',
    debit: 'مدين',
    credit: 'دائن',
    fiscalYear: 'السنة المالية',
    accountingPeriod: 'الفترة المحاسبية',
    closingPeriod: 'إقفال الفترة',
    openingBalance: 'الرصيد الافتتاحي',
    closingBalance: 'الرصيد الختامي',
    costOfGoodsSold: 'تكلفة البضاعة المباعة',
    grossProfit: 'مجمل الربح',
    netProfit: 'صافي الربح',
    depreciation: 'الاستهلاك',
    retainedEarnings: 'الأرباح المحتجزة',
    auditTrail: 'سجل المراجعة المالية',
    reversal: 'قيد عكسي',
    adjustment: 'قيد تسوية',
    accrual: 'مستحق',
    prepaid: 'مدفوع مقدمًا',
  },
  en: {
    chartOfAccounts: 'Chart of Accounts',
    journalEntry: 'Journal Entry',
    journalEntries: 'Journal Entries',
    generalLedger: 'General Ledger',
    trialBalance: 'Trial Balance',
    profitAndLoss: 'Profit & Loss',
    balanceSheet: 'Balance Sheet',
    cashFlowStatement: 'Cash Flow Statement',
    accountsReceivable: 'Accounts Receivable',
    accountsPayable: 'Accounts Payable',
    revenue: 'Revenue',
    expenses: 'Expenses',
    assets: 'Assets',
    liabilities: 'Liabilities',
    equity: 'Equity',
    debit: 'Debit',
    credit: 'Credit',
    fiscalYear: 'Fiscal Year',
    accountingPeriod: 'Accounting Period',
    closingPeriod: 'Period Closing',
    openingBalance: 'Opening Balance',
    closingBalance: 'Closing Balance',
    costOfGoodsSold: 'Cost of Goods Sold',
    grossProfit: 'Gross Profit',
    netProfit: 'Net Profit',
    depreciation: 'Depreciation',
    retainedEarnings: 'Retained Earnings',
    auditTrail: 'Audit Trail',
    reversal: 'Reversal Entry',
    adjustment: 'Adjusting Entry',
    accrual: 'Accrual',
    prepaid: 'Prepaid',
  },
} as const;
