// Gulf Embedded Accounting Platform — Core Platform Types
// Architecture: Modular, API-first, Multi-tenant, Arabic-first, Gulf-ready

// ═══════════════════════════════════════════════════════════════════
// GULF COUNTRIES & REGIONS
// ═══════════════════════════════════════════════════════════════════

export type GulfCountry = 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';

export interface GulfCountryConfig {
  code: GulfCountry;
  nameAr: string;
  nameEn: string;
  currency: string;
  currencyAr: string;
  currencySymbol: string;
  currencyDecimals: number;
  vatRate: number;
  hasVat: boolean;
  fiscalYearStart: string;        // 'Jan' | 'Apr' | etc.
  invoiceRequirements: InvoiceRequirements;
  taxAuthority: string;
  taxAuthorityAr: string;
  complianceNotes: string;
  complianceNotesAr: string;
  phonePrefix: string;
  supportedPaymentMethods: string[];
}

export interface InvoiceRequirements {
  requiresQrCode: boolean;         // Saudi e-invoice QR requirement
  requiresTaxNumber: boolean;
  requiresCRNumber: boolean;
  requiresSequentialNumber: boolean;
  requiresBuyerDetails: boolean;
  digitalSignature: boolean;
  reportingToAuthority: boolean;
  retentionYears: number;
}

// ═══════════════════════════════════════════════════════════════════
// PLATFORM MODE — STANDALONE vs EMBEDDED vs WHITE LABEL
// ═══════════════════════════════════════════════════════════════════

export type PlatformMode = 'standalone' | 'embedded' | 'white_label' | 'api_only';

export interface PlatformConfig {
  mode: PlatformMode;
  companyId: string;
  country: GulfCountry;
  currency: string;
  language: 'ar' | 'en';
  timezone: string;
  // Embedded settings
  embedConfig?: EmbedConfig;
  // White Label settings
  whiteLabelConfig?: WhiteLabelConfig;
  // API settings
  apiConfig?: ApiConfig;
}

export interface EmbedConfig {
  hostAppName: string;
  hostAppNameAr: string;
  embedOrigin: string;            // Allowed embed domain
  allowedModules: EmbedModule[];
  hideNavigation: boolean;
  hideBranding: boolean;
  customStyles?: Record<string, string>;
  callbackUrls: {
    onSaleCreated?: string;
    onPaymentReceived?: string;
    onInvoiceGenerated?: string;
  };
}

export type EmbedModule =
  | 'dashboard' | 'sales' | 'purchases' | 'expenses'
  | 'customers' | 'suppliers' | 'products' | 'inventory'
  | 'accounting' | 'reports' | 'ai';

// ═══════════════════════════════════════════════════════════════════
// WHITE LABEL
// ═══════════════════════════════════════════════════════════════════

export interface WhiteLabelConfig {
  brandName: string;
  brandNameAr: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain?: string;
  customDomain?: string;
  emailFrom?: string;
  emailFromName?: string;
  supportEmail?: string;
  supportPhone?: string;
  invoiceHeader?: string;
  invoiceFooter?: string;
  invoiceHeaderAr?: string;
  invoiceFooterAr?: string;
  hideAccountingEngineBranding: boolean;
  termsUrl?: string;
  privacyUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════
// API KEYS & DEVELOPER ACCESS
// ═══════════════════════════════════════════════════════════════════

export type ApiKeyType = 'live' | 'sandbox' | 'restricted';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export interface ApiKey {
  id: string;
  company_id: string;
  name: string;
  nameAr?: string;
  key_prefix: string;             // First 8 chars shown
  key_hash: string;               // Hashed — never return full key after creation
  type: ApiKeyType;
  status: ApiKeyStatus;
  permissions: ApiPermission[];
  allowed_ips?: string[];
  rate_limit: number;             // requests per minute
  last_used_at?: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  revoked_at?: string;
  revoked_by?: string;
}

export type ApiPermission =
  | 'customers:read' | 'customers:write'
  | 'suppliers:read' | 'suppliers:write'
  | 'products:read' | 'products:write'
  | 'sales:read' | 'sales:write'
  | 'purchases:read' | 'purchases:write'
  | 'payments:read' | 'payments:write'
  | 'expenses:read' | 'expenses:write'
  | 'inventory:read' | 'inventory:write'
  | 'accounting:read' | 'accounting:write'
  | 'reports:read'
  | 'webhooks:manage';

export interface ApiLog {
  id: string;
  company_id: string;
  api_key_id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status_code: number;
  request_body?: string;
  response_time_ms: number;
  ip_address?: string;
  error_message?: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════════════════════════════

export type WebhookEvent =
  | 'sale.created' | 'sale.updated' | 'sale.cancelled' | 'sale.paid'
  | 'purchase.created' | 'purchase.updated' | 'purchase.cancelled'
  | 'payment.created' | 'payment.voided'
  | 'expense.created' | 'expense.approved' | 'expense.rejected'
  | 'customer.created' | 'customer.updated'
  | 'supplier.created' | 'supplier.updated'
  | 'inventory.updated' | 'inventory.low_stock' | 'inventory.out_of_stock'
  | 'invoice.sent' | 'invoice.paid' | 'invoice.overdue'
  | 'journal.posted' | 'journal.reversed'
  | 'period.closed';

export type WebhookStatus = 'active' | 'inactive' | 'failing';

export interface Webhook {
  id: string;
  company_id: string;
  name: string;
  url: string;
  secret: string;               // HMAC secret for verification
  events: WebhookEvent[];
  status: WebhookStatus;
  failure_count: number;
  last_triggered_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
  last_failure_message?: string;
  created_at: string;
  created_by: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  response_body?: string;
  attempt_count: number;
  next_retry_at?: string;
  delivered_at?: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY TEMPLATES
// ═══════════════════════════════════════════════════════════════════

export type IndustryType =
  | 'retail' | 'restaurant' | 'ecommerce' | 'delivery'
  | 'services' | 'contracting' | 'professional_services'
  | 'perfume_trading' | 'real_estate' | 'healthcare' | 'education';

export interface IndustryTemplate {
  id: string;
  type: IndustryType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  color: string;
  defaultChartOfAccountsKey: string;
  features: IndustryFeature[];
  transactionRules: TransactionRule[];
  inventoryConfig: IndustryInventoryConfig;
  reportingConfig: IndustryReportingConfig;
  dashboardWidgets: string[];
  recommendedModules: EmbedModule[];
}

export interface IndustryFeature {
  key: string;
  nameAr: string;
  nameEn: string;
  enabled: boolean;
  required: boolean;
}

export interface TransactionRule {
  trigger: string;              // 'sale_created' | 'purchase_created' | etc.
  debitAccount: string;         // Account code
  creditAccount: string;        // Account code
  nameAr: string;
  nameEn: string;
  autoPost: boolean;
}

export interface IndustryInventoryConfig {
  trackInventory: boolean;
  valuationMethod: 'weighted_average' | 'fifo' | 'specific_identification';
  trackBatches: boolean;
  trackSerials: boolean;
  allowNegativeStock: boolean;
}

export interface IndustryReportingConfig {
  primaryReports: string[];
  dashboardKpis: string[];
  defaultPeriod: 'daily' | 'weekly' | 'monthly';
}

// ═══════════════════════════════════════════════════════════════════
// DEVELOPER PORTAL
// ═══════════════════════════════════════════════════════════════════

export interface DeveloperApp {
  id: string;
  company_id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  app_type: 'mobile' | 'web' | 'pos' | 'ecommerce' | 'erp' | 'other';
  website_url?: string;
  redirect_uris: string[];
  allowed_scopes: ApiPermission[];
  status: 'active' | 'suspended' | 'pending_review';
  client_id: string;
  api_keys: ApiKey[];
  webhooks: Webhook[];
  usage_stats: AppUsageStats;
  created_at: string;
  created_by: string;
}

export interface AppUsageStats {
  total_api_calls: number;
  calls_today: number;
  calls_this_month: number;
  avg_response_time_ms: number;
  error_rate: number;
  last_active: string;
}

// ═══════════════════════════════════════════════════════════════════
// SANDBOX ENVIRONMENT
// ═══════════════════════════════════════════════════════════════════

export interface SandboxEnvironment {
  id: string;
  company_id: string;
  name: string;
  status: 'active' | 'resetting' | 'suspended';
  data_seeded: boolean;
  seed_template?: IndustryType;
  api_key_sandbox: string;
  created_at: string;
  last_reset_at?: string;
  expiry_date?: string;
}

export interface SandboxScenario {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  steps: SandboxStep[];
  expectedResult: string;
}

export interface SandboxStep {
  order: number;
  action: string;
  endpoint: string;
  method: string;
  payload: Record<string, any>;
  expectedStatusCode: number;
}

// ═══════════════════════════════════════════════════════════════════
// BILLING & SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════

export type BillingPlan = 'starter' | 'business' | 'enterprise' | 'api_plan' | 'white_label';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanConfig {
  plan: BillingPlan;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  color: string;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export interface PlanFeature {
  key: string;
  nameAr: string;
  nameEn: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanLimits {
  companies: number | 'unlimited';
  users: number | 'unlimited';
  branches: number | 'unlimited';
  api_calls_per_month: number | 'unlimited';
  storage_gb: number | 'unlimited';
  webhooks: number | 'unlimited';
  white_label: boolean;
  embedded_mode: boolean;
  sandbox: boolean;
  developer_portal: boolean;
  ai_insights: boolean;
  multi_currency: boolean;
  advanced_reports: boolean;
  api_access: boolean;
  dedicated_support: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// FINANCIAL HEALTH SCORE
// ═══════════════════════════════════════════════════════════════════

export type HealthScoreLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface FinancialHealthScore {
  company_id: string;
  overall_score: number;          // 0–100
  level: HealthScoreLevel;
  calculated_at: string;
  metrics: HealthMetric[];
  insights: HealthInsight[];
  trend: 'improving' | 'stable' | 'declining';
  trend_change: number;           // Points change vs previous period
}

export interface HealthMetric {
  key: string;
  nameAr: string;
  nameEn: string;
  score: number;                  // 0–100
  weight: number;                 // Contribution to overall score
  value: number | string;
  benchmark?: number | string;
  status: HealthScoreLevel;
  descriptionAr: string;
  descriptionEn: string;
}

export interface HealthInsight {
  type: 'alert' | 'recommendation' | 'positive' | 'trend';
  priority: 'high' | 'medium' | 'low';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  metric?: string;
  actionAr?: string;
  actionEn?: string;
  icon: string;
  color: string;
}

// ═══════════════════════════════════════════════════════════════════
// AI FINANCIAL INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════

export type AiAnalysisType =
  | 'profit_analysis' | 'expense_analysis' | 'revenue_trend'
  | 'receivables_aging' | 'payables_aging' | 'cash_flow_forecast'
  | 'anomaly_detection' | 'product_profitability' | 'customer_analysis'
  | 'period_comparison' | 'budget_variance';

export interface AiQuery {
  id: string;
  company_id: string;
  user_id: string;
  question: string;
  question_ar?: string;
  analysis_type: AiAnalysisType;
  context: AiQueryContext;
  response?: AiResponse;
  created_at: string;
}

export interface AiQueryContext {
  period_start?: string;
  period_end?: string;
  compare_period_start?: string;
  compare_period_end?: string;
  branch_id?: string;
  filters?: Record<string, any>;
}

export interface AiResponse {
  summary: string;
  summaryAr?: string;
  insights: AiInsight[];
  data_points: AiDataPoint[];
  recommendations: AiRecommendation[];
  confidence: number;             // 0–1
  data_source: string;
  generated_at: string;
}

export interface AiInsight {
  type: 'finding' | 'anomaly' | 'trend' | 'comparison';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  color: string;
  value?: number | string;
  change?: number;
  isPositive?: boolean;
}

export interface AiDataPoint {
  label: string;
  labelAr?: string;
  value: number;
  unit?: string;
}

export interface AiRecommendation {
  priority: 'high' | 'medium' | 'low';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'cash_flow' | 'profitability' | 'expenses' | 'receivables' | 'inventory';
  actionAr?: string;
  actionEn?: string;
}

// ═══════════════════════════════════════════════════════════════════
// AUTOMATED BUSINESS INSIGHTS
// ═══════════════════════════════════════════════════════════════════

export interface BusinessInsight {
  id: string;
  company_id: string;
  type: InsightType;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'positive';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  metric: string;
  current_value: number | string;
  previous_value?: number | string;
  change_percent?: number;
  is_positive: boolean;
  icon: string;
  color: string;
  action_url?: string;
  actionAr?: string;
  actionEn?: string;
  dismissed: boolean;
  generated_at: string;
  expires_at?: string;
}

export type InsightType =
  | 'sales_increase' | 'sales_decrease' | 'expense_spike' | 'profit_decline'
  | 'profit_increase' | 'cash_low' | 'receivables_overdue' | 'payables_due'
  | 'inventory_low' | 'inventory_out' | 'top_product' | 'top_customer'
  | 'unusual_transaction' | 'period_summary' | 'goal_achieved';
