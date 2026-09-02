// Mock Data Service — Demo data clearly labeled
import { AuthUser } from '../types/auth';
import { Company, Branch, DashboardSummary, User } from '../types/database';

// ═══════════════════════════════════════════════════════════════════
// DEMO DATA — FOR DEVELOPMENT ONLY — CAN BE DELETED
// ═══════════════════════════════════════════════════════════════════

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'user-001',
    email: 'admin@smartaccounting.io',
    full_name: 'Super Administrator',
    full_name_ar: 'المسؤول العام',
    role: 'super_admin',
    is_active: true,
  },
  {
    id: 'user-002',
    email: 'owner@alwatangroup.com',
    full_name: 'Ahmad Al-Watan',
    full_name_ar: 'أحمد الوطن',
    role: 'company_owner',
    company_id: 'company-001',
    company_name: 'مجموعة الوطن التجارية',
    is_active: true,
  },
  {
    id: 'user-003',
    email: 'accountant@alwatangroup.com',
    full_name: 'Sara Al-Rashidi',
    full_name_ar: 'سارة الراشدي',
    role: 'accountant',
    company_id: 'company-001',
    company_name: 'مجموعة الوطن التجارية',
    is_active: true,
  },
];

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'company-001',
    name: 'Al-Watan Commercial Group',
    name_ar: 'مجموعة الوطن التجارية',
    commercial_registration: 'CR-2021-001234',
    tax_number: 'TAX-KW-001234',
    phone: '+965 2245 6789',
    email: 'info@alwatangroup.com',
    address: 'Kuwait City, Sharq, Block 1',
    country: 'KW',
    currency: 'KWD',
    fiscal_year_start: '01-01',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-002',
    name: 'Gulf Tech Solutions',
    name_ar: 'حلول الخليج التقنية',
    commercial_registration: 'CR-2022-005678',
    tax_number: 'TAX-KW-005678',
    phone: '+965 2234 5678',
    email: 'info@gulftech.com',
    address: 'Salmiya, Block 12',
    country: 'KW',
    currency: 'KWD',
    fiscal_year_start: '01-01',
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'company-003',
    name: 'Al-Noor Trading Co.',
    name_ar: 'شركة النور للتجارة',
    commercial_registration: 'CR-2023-009876',
    phone: '+965 2256 7890',
    email: 'info@alnoor.com',
    address: 'Hawalli, Block 5',
    country: 'KW',
    currency: 'KWD',
    fiscal_year_start: '01-01',
    status: 'trial',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
];

export const DEMO_BRANCHES: Branch[] = [
  {
    id: 'branch-001',
    company_id: 'company-001',
    name: 'Main Branch',
    name_ar: 'الفرع الرئيسي',
    code: 'MAIN',
    address: 'Kuwait City, Sharq',
    is_main: true,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'branch-002',
    company_id: 'company-001',
    name: 'Salmiya Branch',
    name_ar: 'فرع السالمية',
    code: 'SLM',
    address: 'Salmiya, Block 4',
    is_main: false,
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'branch-003',
    company_id: 'company-001',
    name: 'Hawalli Branch',
    name_ar: 'فرع حولي',
    code: 'HWL',
    address: 'Hawalli, Block 7',
    is_main: false,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'branch-004',
    company_id: 'company-002',
    name: 'Gulf Tech HQ',
    name_ar: 'المقر الرئيسي',
    code: 'HQ',
    address: 'Salmiya, Block 12',
    is_main: true,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
];

// Extended user list for company user management
export const DEMO_COMPANY_USERS: User[] = [
  {
    id: 'user-002',
    email: 'owner@alwatangroup.com',
    full_name: 'Ahmad Al-Watan',
    full_name_ar: 'أحمد الوطن',
    phone: '+965 9901 2345',
    role: 'company_owner',
    company_id: 'company-001',
    is_active: true,
    last_login_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-003',
    email: 'accountant@alwatangroup.com',
    full_name: 'Sara Al-Rashidi',
    full_name_ar: 'سارة الراشدي',
    phone: '+965 9902 3456',
    role: 'accountant',
    company_id: 'company-001',
    branch_id: 'branch-001',
    is_active: true,
    last_login_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-004',
    email: 'sales@alwatangroup.com',
    full_name: 'Khalid Al-Mutairi',
    full_name_ar: 'خالد المطيري',
    phone: '+965 9903 4567',
    role: 'sales_employee',
    company_id: 'company-001',
    branch_id: 'branch-002',
    is_active: true,
    last_login_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-005',
    email: 'purchase@alwatangroup.com',
    full_name: 'Fatima Al-Enezi',
    full_name_ar: 'فاطمة العنزي',
    phone: '+965 9904 5678',
    role: 'purchase_employee',
    company_id: 'company-001',
    branch_id: 'branch-001',
    is_active: true,
    last_login_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'user-006',
    email: 'inventory@alwatangroup.com',
    full_name: 'Mohammed Al-Shammari',
    full_name_ar: 'محمد الشمري',
    phone: '+965 9905 6789',
    role: 'inventory_employee',
    company_id: 'company-001',
    branch_id: 'branch-003',
    is_active: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'user-007',
    email: 'viewer@alwatangroup.com',
    full_name: 'Nour Al-Sabah',
    full_name_ar: 'نور الصباح',
    role: 'viewer',
    company_id: 'company-001',
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z',
  },
];

export const DEMO_DASHBOARD: DashboardSummary = {
  totalSales: 48500.500,
  totalPurchases: 28200.750,
  totalExpenses: 6800.000,
  netProfit: 13499.750,
  cashBalance: 8200.300,
  bankBalance: 24500.000,
  accountsReceivable: 12400.750,
  accountsPayable: 7800.500,
  inventoryValue: 35600.000,
  currency: 'KWD',
  period: 'thisMonth',
  previousPeriod: {
    totalSales: 42000.000,
    netProfit: 11200.000,
  },
};

// Chart mock data
export const DEMO_SALES_CHART = [
  { label: 'يناير', value: 32000 },
  { label: 'فبراير', value: 38500 },
  { label: 'مارس', value: 42000 },
  { label: 'أبريل', value: 36800 },
  { label: 'مايو', value: 45200 },
  { label: 'يونيو', value: 48500 },
];

export const DEMO_EXPENSES_CHART = [
  { label: 'رواتب', value: 3200, color: '#1B4FD8' },
  { label: 'إيجار', value: 1800, color: '#10B981' },
  { label: 'مرافق', value: 600, color: '#F59E0B' },
  { label: 'تسويق', value: 800, color: '#EF4444' },
  { label: 'أخرى', value: 400, color: '#8B5CF6' },
];

// Super Admin stats
export const DEMO_ADMIN_STATS = {
  totalCompanies: 47,
  activeCompanies: 38,
  suspendedCompanies: 5,
  trialCompanies: 4,
  totalUsers: 284,
  monthlyRevenue: 12400.000,
  newCompaniesThisMonth: 6,
  currency: 'KWD',
};

// Helper: get users for a specific company
export function getMockUsersForCompany(companyId: string): User[] {
  return DEMO_COMPANY_USERS.filter(u => u.company_id === companyId);
}

// Helper: get branches for a specific company
export function getMockBranchesForCompany(companyId: string): Branch[] {
  return DEMO_BRANCHES.filter(b => b.company_id === companyId);
}

// Mock auth function
export function mockLogin(email: string, password: string): (typeof DEMO_USERS)[0] | null {
  const user = DEMO_USERS.find(u => u.email === email);
  if (user && password === '123456') return user;
  return null;
}
