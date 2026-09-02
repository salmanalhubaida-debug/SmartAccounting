// Gulf Embedded Accounting Platform — Integrations & Developer Hub
// API Keys, Webhooks, Embedded Mode, White Label, Sandbox, Developer Portal
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { DEMO_API_KEYS, DEMO_WEBHOOKS, DEMO_SANDBOX, INDUSTRY_TEMPLATES } from '../../services/platformData';
import { ApiKey, Webhook, WebhookEvent, PlatformMode } from '../../types/platform';
import { useAlert } from '@/template';

type IntTab = 'api' | 'webhooks' | 'embedded' | 'sandbox' | 'marketplace';

const WEBHOOK_EVENT_GROUPS = [
  {
    groupAr: 'المبيعات', groupEn: 'Sales',
    events: ['sale.created', 'sale.updated', 'sale.cancelled', 'sale.paid'] as WebhookEvent[],
  },
  {
    groupAr: 'المشتريات', groupEn: 'Purchases',
    events: ['purchase.created', 'purchase.updated', 'purchase.cancelled'] as WebhookEvent[],
  },
  {
    groupAr: 'المدفوعات', groupEn: 'Payments',
    events: ['payment.created', 'payment.voided'] as WebhookEvent[],
  },
  {
    groupAr: 'المصروفات', groupEn: 'Expenses',
    events: ['expense.created', 'expense.approved', 'expense.rejected'] as WebhookEvent[],
  },
  {
    groupAr: 'المخزون', groupEn: 'Inventory',
    events: ['inventory.updated', 'inventory.low_stock', 'inventory.out_of_stock'] as WebhookEvent[],
  },
  {
    groupAr: 'المحاسبة', groupEn: 'Accounting',
    events: ['journal.posted', 'journal.reversed', 'period.closed'] as WebhookEvent[],
  },
  {
    groupAr: 'الفواتير', groupEn: 'Invoices',
    events: ['invoice.sent', 'invoice.paid', 'invoice.overdue'] as WebhookEvent[],
  },
];

const MARKETPLACE_INTEGRATIONS = [
  { icon: 'storefront',     nameAr: 'التجارة الإلكترونية', nameEn: 'E-Commerce',        descAr: 'Shopify, WooCommerce, Magento',    color: '#F59E0B', status: 'soon'      },
  { icon: 'point-of-sale',  nameAr: 'نقاط البيع (POS)',    nameEn: 'POS Systems',        descAr: 'Square, Lightspeed, Custom POS',  color: '#10B981', status: 'soon'      },
  { icon: 'credit-card',    nameAr: 'بوابات الدفع',        nameEn: 'Payment Gateways',   descAr: 'KNET, MyFatoorah, Tap Payments',  color: '#1B4FD8', status: 'soon'      },
  { icon: 'account-balance',nameAr: 'البنوك الخليجية',     nameEn: 'Gulf Banking',       descAr: 'NBK, BURGAN, KFH, QNB',          color: '#8B5CF6', status: 'soon'      },
  { icon: 'local-shipping', nameAr: 'الشحن والتوصيل',      nameEn: 'Delivery & Shipping', descAr: 'Aramex, DHL, Fetchr',            color: '#EF4444', status: 'soon'      },
  { icon: 'people-alt',     nameAr: 'نظام الموارد البشرية', nameEn: 'HR & Payroll',      descAr: 'SAP, Oracle, Custom HR',         color: '#F97316', status: 'soon'      },
  { icon: 'receipt-long',   nameAr: 'الفواتير الإلكترونية', nameEn: 'E-Invoicing',       descAr: 'ZATCA (KSA), FTA (UAE)',          color: '#0EA5E9', status: 'available' },
  { icon: 'api',            nameAr: 'API مخصص',            nameEn: 'Custom API',          descAr: 'اربط أي نظام عبر REST API',      color: '#64748B', status: 'available' },
];

export default function Integrations() {
  const { language, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<IntTab>('api');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(DEMO_API_KEYS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(DEMO_WEBHOOKS);
  const [newWebhookModal, setNewWebhookModal] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: [] as WebhookEvent[] });

  const TABS: { key: IntTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'api',         labelAr: 'API Keys',      labelEn: 'API Keys',       icon: 'vpn-key'        },
    { key: 'webhooks',    labelAr: 'Webhooks',      labelEn: 'Webhooks',       icon: 'webhook'        },
    { key: 'embedded',    labelAr: 'Embedded',      labelEn: 'Embedded',       icon: 'integration-instructions' },
    { key: 'sandbox',     labelAr: 'Sandbox',       labelEn: 'Sandbox',        icon: 'science'        },
    { key: 'marketplace', labelAr: 'السوق',         labelEn: 'Marketplace',    icon: 'store'          },
  ];

  const handleRevokeKey = (keyId: string) => {
    showAlert(
      language === 'ar' ? 'إلغاء المفتاح؟' : 'Revoke API Key?',
      language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'إلغاء المفتاح' : 'Revoke Key',
          style: 'destructive',
          onPress: () => setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k)),
        },
      ]
    );
  };

  const handleAddWebhook = () => {
    if (!webhookForm.name || !webhookForm.url || webhookForm.events.length === 0) {
      showAlert(language === 'ar' ? 'حقول مطلوبة' : 'Required Fields',
        language === 'ar' ? 'يرجى ملء جميع الحقول واختيار حدث واحد على الأقل' : 'Please fill all fields and select at least one event');
      return;
    }
    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`, company_id: 'company-001',
      name: webhookForm.name, url: webhookForm.url,
      secret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
      events: webhookForm.events, status: 'active', failure_count: 0,
      created_by: 'user-002', created_at: new Date().toISOString(),
    };
    setWebhooks(prev => [newWebhook, ...prev]);
    setWebhookForm({ name: '', url: '', events: [] });
    setNewWebhookModal(false);
  };

  const toggleWebhookEvent = (event: WebhookEvent) => {
    setWebhookForm(f => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter(e => e !== event) : [...f.events, event],
    }));
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'التكاملات والمطورون' : 'Integrations & Developer'}>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <MaterialIcons name={tab.icon as any} size={15} color={activeTab === tab.key ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {language === 'ar' ? tab.labelAr : tab.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── API KEYS ──────────────────────────────────────────────── */}
        {activeTab === 'api' ? (
          <>
            {/* Intro banner */}
            <View style={[styles.introBanner, isRTL && styles.introBannerRTL]}>
              <View style={styles.introBannerIcon}>
                <MaterialIcons name="vpn-key" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.introBannerTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'API-first Architecture' : 'API-first Architecture'}
                </Text>
                <Text style={[styles.introBannerDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'اربط تطبيقاتك الخارجية بمنصة المحاسبة مباشرة عبر REST API آمن ومتحكم به.'
                    : 'Connect your external apps directly to the accounting platform via a secure, controlled REST API.'}
                </Text>
              </View>
            </View>

            {/* Architecture note */}
            <View style={[styles.archNote, isRTL && styles.archNoteRTL]}>
              <MaterialIcons name="account-tree" size={14} color={Colors.info} />
              <Text style={[styles.archNoteText, isRTL && styles.textRTL]}>
                {language === 'ar'
                  ? 'كل طلب API يمر عبر: Authentication → Authorization → Company Isolation → Business Logic → Accounting Engine'
                  : 'Every API call goes through: Authentication → Authorization → Company Isolation → Business Logic → Accounting Engine'}
              </Text>
            </View>

            {/* Action row */}
            <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
              <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
                {language === 'ar' ? `${apiKeys.length} مفتاح` : `${apiKeys.length} keys`}
              </Text>
              <Pressable style={styles.addBtn}>
                <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'مفتاح جديد' : 'New Key'}</Text>
              </Pressable>
            </View>

            {apiKeys.map(key => (
              <View key={key.id} style={[styles.keyCard, isRTL && styles.keyCardRTL]}>
                <View style={[styles.keyTypeBadge, { backgroundColor: key.type === 'live' ? Colors.successLight : Colors.warningLight }]}>
                  <MaterialIcons name={key.type === 'live' ? 'lock' : 'science'} size={14}
                    color={key.type === 'live' ? Colors.success : Colors.warning} />
                  <Text style={[styles.keyTypeText, { color: key.type === 'live' ? Colors.success : Colors.warning }]}>
                    {key.type === 'live' ? 'LIVE' : 'SANDBOX'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.keyName, isRTL && styles.textRTL]}>
                    {language === 'ar' ? (key.nameAr ?? key.name) : key.name}
                  </Text>
                  <View style={[styles.keyCodeRow, isRTL && styles.keyCodeRowRTL]}>
                    <Text style={styles.keyCode}>{key.key_prefix}{'•'.repeat(20)}</Text>
                    <Pressable style={styles.copyBtn} hitSlop={8}
                      onPress={() => showAlert(language === 'ar' ? 'الأمان' : 'Security', language === 'ar' ? 'لا يمكن عرض المفتاح الكامل مرة أخرى بعد الإنشاء.' : 'Full key cannot be shown again after creation.')}>
                      <MaterialIcons name="content-copy" size={14} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                  <View style={[styles.keyMeta, isRTL && styles.keyMetaRTL]}>
                    <Text style={styles.keyMetaText}>
                      {language === 'ar' ? `${key.permissions.length} صلاحية` : `${key.permissions.length} permissions`}
                    </Text>
                    <Text style={styles.keyMetaText}>·</Text>
                    <Text style={styles.keyMetaText}>
                      {language === 'ar' ? `${key.rate_limit} طلب/دقيقة` : `${key.rate_limit} req/min`}
                    </Text>
                    {key.last_used_at ? (
                      <>
                        <Text style={styles.keyMetaText}>·</Text>
                        <Text style={styles.keyMetaText}>
                          {language === 'ar' ? 'آخر استخدام: ' : 'Last used: '}
                          {new Date(key.last_used_at).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US')}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.keyActions, isRTL && styles.keyActionsRTL]}>
                  <View style={[styles.keyStatusBadge, { backgroundColor: key.status === 'active' ? Colors.successLight : Colors.dangerLight }]}>
                    <Text style={[styles.keyStatusText, { color: key.status === 'active' ? Colors.success : Colors.danger }]}>
                      {key.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'ملغى' : 'Revoked')}
                    </Text>
                  </View>
                  {key.status === 'active' ? (
                    <Pressable onPress={() => handleRevokeKey(key.id)} style={styles.revokeBtn} hitSlop={6}>
                      <MaterialIcons name="block" size={16} color={Colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        ) : null}

        {/* ── WEBHOOKS ──────────────────────────────────────────────── */}
        {activeTab === 'webhooks' ? (
          <>
            <View style={[styles.introBanner, isRTL && styles.introBannerRTL]}>
              <View style={[styles.introBannerIcon, { backgroundColor: '#8B5CF620' }]}>
                <MaterialIcons name="webhook" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.introBannerTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'إشعارات الأحداث الفورية' : 'Real-time Event Notifications'}
                </Text>
                <Text style={[styles.introBannerDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'اشترك في أحداث المنصة وستصلك إشعارات HTTP فورية لأنظمتك الخارجية.'
                    : 'Subscribe to platform events and receive instant HTTP notifications to your external systems.'}
                </Text>
              </View>
            </View>

            <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
              <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
                {language === 'ar' ? `${webhooks.length} Webhook` : `${webhooks.length} webhooks`}
              </Text>
              <Pressable style={styles.addBtn} onPress={() => setNewWebhookModal(true)}>
                <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'Webhook جديد' : 'New Webhook'}</Text>
              </Pressable>
            </View>

            {webhooks.map(wh => (
              <View key={wh.id} style={[styles.webhookCard, isRTL && styles.webhookCardRTL]}>
                <View style={[styles.webhookStatusDot, {
                  backgroundColor: wh.status === 'active' ? Colors.success : wh.status === 'failing' ? Colors.danger : Colors.textMuted,
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.webhookName, isRTL && styles.textRTL]}>{wh.name}</Text>
                  <Text style={[styles.webhookUrl, isRTL && styles.textRTL]} numberOfLines={1}>{wh.url}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                      {wh.events.map(ev => (
                        <View key={ev} style={styles.eventBadge}>
                          <Text style={styles.eventBadgeText}>{ev}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  {wh.status === 'failing' ? (
                    <View style={[styles.failureRow, isRTL && styles.failureRowRTL]}>
                      <MaterialIcons name="error" size={12} color={Colors.danger} />
                      <Text style={styles.failureText}>{wh.last_failure_message}</Text>
                      <Text style={styles.failureCount}>
                        ({language === 'ar' ? `${wh.failure_count} فشل` : `${wh.failure_count} failures`})
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.webhookStatusBadge}>
                  <Text style={[styles.webhookStatusText, {
                    color: wh.status === 'active' ? Colors.success : wh.status === 'failing' ? Colors.danger : Colors.textMuted,
                  }]}>
                    {wh.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') :
                      wh.status === 'failing' ? (language === 'ar' ? 'خلل' : 'Failing') : (language === 'ar' ? 'متوقف' : 'Inactive')}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {/* ── EMBEDDED MODE ─────────────────────────────────────────── */}
        {activeTab === 'embedded' ? (
          <>
            <View style={[styles.modeCard, { borderColor: `${Colors.primary}30` }]}>
              <View style={[styles.modeHeader, isRTL && styles.modeHeaderRTL]}>
                <View style={[styles.modeIcon, { backgroundColor: Colors.primaryLight }]}>
                  <MaterialIcons name="integration-instructions" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeTitle, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'وضع المحاسبة المدمجة' : 'Embedded Accounting Mode'}
                  </Text>
                  <Text style={[styles.modeDesc, isRTL && styles.textRTL]}>
                    {language === 'ar'
                      ? 'أضف المحاسبة الكاملة داخل تطبيقك أو موقعك دون مغادرة منصتك.'
                      : 'Add full accounting inside your app or website without leaving your platform.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Mode options */}
            {([
              { mode: 'standalone', titleAr: 'Standalone', titleEn: 'Standalone Mode', descAr: 'استخدم المنصة مباشرة كتطبيق مستقل', descEn: 'Use the platform directly as a standalone app', icon: 'laptop', color: Colors.primary },
              { mode: 'embedded', titleAr: 'Embedded', titleEn: 'Embedded Mode', descAr: 'دمج المحاسبة داخل تطبيقك الخاص', descEn: 'Embed accounting inside your own app', icon: 'integration-instructions', color: '#8B5CF6' },
              { mode: 'api_only', titleAr: 'API Only', titleEn: 'API Only Mode', descAr: 'استخدم API فقط وبنِ واجهتك الخاصة', descEn: 'Use API only and build your own UI', icon: 'code', color: '#10B981' },
            ] as const).map(opt => (
              <View key={opt.mode} style={[styles.modeOption, isRTL && styles.modeOptionRTL]}>
                <View style={[styles.modeOptionIcon, { backgroundColor: `${opt.color}15` }]}>
                  <MaterialIcons name={opt.icon as any} size={22} color={opt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeOptionTitle, isRTL && styles.textRTL]}>{opt.titleEn}</Text>
                  <Text style={[styles.modeOptionDesc, isRTL && styles.textRTL]}>
                    {language === 'ar' ? opt.descAr : opt.descEn}
                  </Text>
                </View>
                <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
              </View>
            ))}

            {/* White Label */}
            <View style={[styles.wlCard, isRTL && styles.wlCardRTL]}>
              <View style={[styles.wlIcon, { backgroundColor: `${'#F59E0B'}15` }]}>
                <MaterialIcons name="palette" size={22} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.wlTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'White Label' : 'White Label Accounting'}
                </Text>
                <Text style={[styles.wlDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'خصص المنصة باسم وعلامتك التجارية. Logo، الألوان، الدومين، الفواتير.'
                    : 'Brand the platform with your identity. Logo, colors, domain, invoice branding.'}
                </Text>
                {[
                  language === 'ar' ? 'اسم الشركة وشعارها' : 'Company name & logo',
                  language === 'ar' ? 'ألوان مخصصة' : 'Custom colors',
                  language === 'ar' ? 'دومين مخصص' : 'Custom domain',
                  language === 'ar' ? 'فواتير بهويتك' : 'Branded invoices',
                  language === 'ar' ? 'إخفاء اسم المنصة' : 'Hide platform branding',
                ].map((feat, i) => (
                  <View key={i} style={[styles.wlFeat, isRTL && styles.wlFeatRTL]}>
                    <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                    <Text style={styles.wlFeatText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {/* ── SANDBOX ───────────────────────────────────────────────── */}
        {activeTab === 'sandbox' ? (
          <>
            <View style={[styles.sandboxHeader, isRTL && styles.sandboxHeaderRTL]}>
              <View style={[styles.sandboxIcon, { backgroundColor: `${'#10B981'}15` }]}>
                <MaterialIcons name="science" size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }]}>
                  <Text style={[styles.sandboxTitle, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'بيئة Sandbox' : 'Sandbox Environment'}
                  </Text>
                  <View style={styles.sandboxActiveBadge}>
                    <Text style={styles.sandboxActiveBadgeText}>{language === 'ar' ? 'نشط' : 'Active'}</Text>
                  </View>
                </View>
                <Text style={[styles.sandboxDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'اختبر جميع وظائف API دون التأثير على البيانات الحقيقية.'
                    : 'Test all API functionality without affecting real data.'}
                </Text>
              </View>
            </View>

            <View style={styles.sandboxKeyCard}>
              <Text style={[styles.sandboxKeyLabel, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'Sandbox API Key' : 'Sandbox API Key'}
              </Text>
              <View style={[styles.sandboxKeyRow, isRTL && styles.sandboxKeyRowRTL]}>
                <Text style={styles.sandboxKey}>{DEMO_SANDBOX.api_key_sandbox}</Text>
                <Pressable style={styles.copyBtn} hitSlop={8}>
                  <MaterialIcons name="content-copy" size={14} color={Colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'سيناريوهات الاختبار' : 'Test Scenarios'}
            </Text>
            {[
              { ar: 'إنشاء عميل', en: 'Create Customer', method: 'POST', endpoint: '/api/v1/customers', color: '#10B981' },
              { ar: 'إضافة منتج', en: 'Create Product', method: 'POST', endpoint: '/api/v1/products', color: '#10B981' },
              { ar: 'إنشاء فاتورة مبيعات', en: 'Create Sales Invoice', method: 'POST', endpoint: '/api/v1/sales', color: '#10B981' },
              { ar: 'تسجيل دفعة', en: 'Record Payment', method: 'POST', endpoint: '/api/v1/payments', color: '#10B981' },
              { ar: 'جلب القيد المحاسبي', en: 'Get Journal Entry', method: 'GET', endpoint: '/api/v1/accounting/journal-entries/{id}', color: '#3B82F6' },
              { ar: 'تقرير الربح والخسارة', en: 'P&L Report', method: 'GET', endpoint: '/api/v1/reports/profit-loss', color: '#3B82F6' },
            ].map((s, i) => (
              <View key={i} style={[styles.scenarioCard, isRTL && styles.scenarioCardRTL]}>
                <View style={[styles.methodBadge, { backgroundColor: s.method === 'POST' ? Colors.successLight : Colors.infoLight }]}>
                  <Text style={[styles.methodText, { color: s.method === 'POST' ? Colors.success : Colors.info }]}>{s.method}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scenarioName, isRTL && styles.textRTL]}>{language === 'ar' ? s.ar : s.en}</Text>
                  <Text style={styles.scenarioEndpoint}>{s.endpoint}</Text>
                </View>
                <Pressable style={styles.runBtn}>
                  <MaterialIcons name="play-arrow" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            ))}

            <Pressable style={[styles.resetBtn, isRTL && styles.resetBtnRTL]}
              onPress={() => showAlert(language === 'ar' ? 'إعادة تعيين Sandbox؟' : 'Reset Sandbox?',
                language === 'ar' ? 'ستُحذف جميع بيانات Sandbox وتُعاد زراعتها من القالب.' : 'All sandbox data will be deleted and re-seeded from the template.',
                [{ text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                 { text: language === 'ar' ? 'إعادة تعيين' : 'Reset', style: 'destructive' }])}>
              <MaterialIcons name="refresh" size={18} color={Colors.danger} />
              <Text style={styles.resetBtnText}>{language === 'ar' ? 'إعادة تعيين Sandbox' : 'Reset Sandbox'}</Text>
            </Pressable>
          </>
        ) : null}

        {/* ── MARKETPLACE ───────────────────────────────────────────── */}
        {activeTab === 'marketplace' ? (
          <>
            <Text style={[styles.marketDesc, isRTL && styles.textRTL]}>
              {language === 'ar'
                ? 'اربط منصتك مع الأنظمة والتطبيقات الخارجية في الخليج'
                : 'Connect your platform with external systems and Gulf applications'}
            </Text>
            <View style={styles.grid}>
              {MARKETPLACE_INTEGRATIONS.map((item, i) => (
                <View key={i} style={styles.intCard}>
                  <View style={[styles.intIconBg, { backgroundColor: `${item.color}18` }]}>
                    <MaterialIcons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={[styles.intName, isRTL && styles.textRTL]}>
                    {language === 'ar' ? item.nameAr : item.nameEn}
                  </Text>
                  <Text style={[styles.intDesc, isRTL && styles.textRTL]}>{item.descAr}</Text>
                  <View style={[styles.intBadge, item.status === 'available' ? styles.intBadgeAvail : styles.intBadgeSoon]}>
                    <Text style={[styles.intBadgeText, item.status === 'available' ? styles.intBadgeTextAvail : styles.intBadgeTextSoon]}>
                      {item.status === 'available' ? (language === 'ar' ? 'متاح' : 'Available') : (language === 'ar' ? 'قريباً' : 'Coming Soon')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      {/* New Webhook Modal */}
      <Modal visible={newWebhookModal} transparent animationType="slide" onRequestClose={() => setNewWebhookModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setNewWebhookModal(false)} />
          <View style={[mStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[mStyles.header, isRTL && mStyles.headerRTL]}>
              <Text style={mStyles.title}>{language === 'ar' ? 'Webhook جديد' : 'New Webhook'}</Text>
              <Pressable onPress={() => setNewWebhookModal(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: Spacing.base }}>
              <View style={{ gap: Spacing.md }}>
                {[
                  { key: 'name', label: language === 'ar' ? 'اسم Webhook' : 'Webhook Name', required: true },
                  { key: 'url', label: language === 'ar' ? 'Endpoint URL' : 'Endpoint URL', required: true },
                ].map(f => (
                  <View key={f.key}>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{f.label}{f.required ? <Text style={{ color: Colors.danger }}> *</Text> : null}</Text>
                    <TextInput
                      style={[mStyles.input, isRTL && mStyles.inputRTL]}
                      value={(webhookForm as any)[f.key]}
                      onChangeText={v => setWebhookForm(pf => ({ ...pf, [f.key]: v }))}
                      placeholder={f.key === 'url' ? 'https://your-app.com/webhook' : ''}
                      placeholderTextColor={Colors.textMuted}
                      textAlign={isRTL ? 'right' : 'left'}
                      autoCapitalize="none"
                      keyboardType={f.key === 'url' ? 'url' : 'default'}
                    />
                  </View>
                ))}
                <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'الأحداث' : 'Events'}<Text style={{ color: Colors.danger }}> *</Text></Text>
                {WEBHOOK_EVENT_GROUPS.map(group => (
                  <View key={group.groupEn} style={{ gap: 6 }}>
                    <Text style={[mStyles.groupLabel, isRTL && mStyles.labelRTL]}>{language === 'ar' ? group.groupAr : group.groupEn}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {group.events.map(ev => (
                        <Pressable key={ev} onPress={() => toggleWebhookEvent(ev)}
                          style={[mStyles.eventChip, webhookForm.events.includes(ev) && mStyles.eventChipActive]}>
                          <Text style={[mStyles.eventChipText, webhookForm.events.includes(ev) && mStyles.eventChipTextActive]}>{ev}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={[mStyles.footer, isRTL && mStyles.footerRTL]}>
              <Pressable onPress={() => setNewWebhookModal(false)} style={mStyles.cancelBtn}>
                <Text style={mStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleAddWebhook} style={mStyles.saveBtn}>
                <Text style={mStyles.saveText}>{language === 'ar' ? 'إنشاء Webhook' : 'Create Webhook'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

const mStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '85%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  groupLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontWeight: Typography.fontWeightSemibold, textTransform: 'uppercase', letterSpacing: 0.5, includeFontPadding: false },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  eventChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  eventChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  eventChipText: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'monospace', includeFontPadding: false },
  eventChipTextActive: { color: '#FFF', fontWeight: Typography.fontWeightSemibold },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
  footerRTL: { flexDirection: 'row-reverse' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  cancelText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['3xl'] },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  introBanner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  introBannerRTL: { flexDirection: 'row-reverse' },
  introBannerIcon: { width: 46, height: 46, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  introBannerTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  introBannerDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 4, lineHeight: 20, includeFontPadding: false },
  archNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md },
  archNoteRTL: { flexDirection: 'row-reverse' },
  archNoteText: { flex: 1, fontSize: Typography.fontSizeXS, color: Colors.info, lineHeight: 18, includeFontPadding: false },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionRowRTL: { flexDirection: 'row-reverse' },
  sectionLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  sectionTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  // API Keys
  keyCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, alignItems: 'flex-start', ...Shadow.sm },
  keyCardRTL: { flexDirection: 'row-reverse' },
  keyTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  keyTypeText: { fontSize: 10, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  keyName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  keyCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  keyCodeRowRTL: { flexDirection: 'row-reverse' },
  keyCode: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  copyBtn: { width: 28, height: 28, borderRadius: Radius.sm, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  keyMeta: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  keyMetaRTL: { flexDirection: 'row-reverse' },
  keyMetaText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  keyActions: { alignItems: 'flex-end', gap: 8 },
  keyActionsRTL: { alignItems: 'flex-start' },
  keyStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  keyStatusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  revokeBtn: { width: 28, height: 28, borderRadius: 7, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  // Webhooks
  webhookCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, alignItems: 'flex-start', ...Shadow.sm },
  webhookCardRTL: { flexDirection: 'row-reverse' },
  webhookStatusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  webhookName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  webhookUrl: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  eventBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  eventBadgeText: { fontSize: 10, color: Colors.textSecondary, fontFamily: 'monospace', includeFontPadding: false },
  failureRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  failureRowRTL: { flexDirection: 'row-reverse' },
  failureText: { fontSize: Typography.fontSizeXS, color: Colors.danger, includeFontPadding: false },
  failureCount: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  webhookStatusBadge: { alignSelf: 'flex-start' },
  webhookStatusText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Embedded Mode
  modeCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1.5, ...Shadow.sm },
  modeHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  modeHeaderRTL: { flexDirection: 'row-reverse' },
  modeIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  modeTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  modeDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 4, lineHeight: 20, includeFontPadding: false },
  modeOption: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  modeOptionRTL: { flexDirection: 'row-reverse' },
  modeOptionIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  modeOptionTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  modeOptionDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  wlCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1.5, borderColor: `${'#F59E0B'}30`, ...Shadow.sm },
  wlCardRTL: { flexDirection: 'row-reverse' },
  wlIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  wlTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  wlDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 4, marginBottom: 8, lineHeight: 20, includeFontPadding: false },
  wlFeat: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  wlFeatRTL: { flexDirection: 'row-reverse' },
  wlFeatText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  // Sandbox
  sandboxHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sandboxHeaderRTL: { flexDirection: 'row-reverse' },
  sandboxIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  sandboxTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  sandboxActiveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.successLight },
  sandboxActiveBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.success, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  sandboxDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 4, includeFontPadding: false },
  sandboxKeyCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, gap: 8, ...Shadow.sm },
  sandboxKeyLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  sandboxKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sandboxKeyRowRTL: { flexDirection: 'row-reverse' },
  sandboxKey: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.text, fontFamily: 'monospace', includeFontPadding: false },
  scenarioCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, ...Shadow.sm },
  scenarioCardRTL: { flexDirection: 'row-reverse' },
  methodBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, minWidth: 50, alignItems: 'center' },
  methodText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  scenarioName: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  scenarioEndpoint: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  runBtn: { width: 32, height: 32, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  resetBtnRTL: { flexDirection: 'row-reverse' },
  resetBtnText: { fontSize: Typography.fontSizeSM, color: Colors.danger, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Marketplace
  marketDesc: { fontSize: Typography.fontSizeBase, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  intCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, flex: 1, minWidth: 140, gap: 8, alignItems: 'flex-start', ...Shadow.sm },
  intIconBg: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  intName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  intDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false, flex: 1 },
  intBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  intBadgeAvail: { backgroundColor: Colors.successLight },
  intBadgeSoon: { backgroundColor: Colors.warningLight },
  intBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  intBadgeTextAvail: { color: Colors.success },
  intBadgeTextSoon: { color: Colors.warning },
  textRTL: { textAlign: 'right' },
});
