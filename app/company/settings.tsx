// Gulf Settings Page — Country, Currency, Gulf Accounting Layer, Industry Template
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { GULF_COUNTRIES, INDUSTRY_TEMPLATES, BILLING_PLANS } from '../../services/platformData';
import { GulfCountry } from '../../types/platform';
import { useAlert } from '@/template';

type SettingsTab = 'company' | 'gulf' | 'accounting' | 'platform' | 'billing';

export default function Settings() {
  const { language, isRTL } = useLanguage();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [selectedCountry, setSelectedCountry] = useState<GulfCountry>('KW');
  const [selectedTemplate, setSelectedTemplate] = useState('tmpl-perfume');

  const [companyForm, setCompanyForm] = useState({
    name: 'شركة الخليج للعطور',
    nameEn: 'Gulf Perfumes Co.',
    legalName: 'شركة الخليج للعطور ذ.م.م',
    crNumber: 'CR-2024-001234',
    taxNumber: '',
    email: 'info@gulfperfumes.kw',
    phone: '+965 2200 5000',
    address: 'الكويت، منطقة السالمية، قطعة 10',
    currency: 'KWD',
    fiscalYearStart: 'Jan',
    invoicePrefix: 'INV',
    invoiceStartNumber: '1001',
    decimalPlaces: '3',
  });

  const [accountingSettings, setAccountingSettings] = useState({
    autoPostJournals: false,
    requireApproval: true,
    allowPastPeriodEntry: false,
    autoGenerateCogsEntry: true,
    enforceBalancedEntries: true,
    defaultCostingMethod: 'weighted_average',
  });

  const country = GULF_COUNTRIES.find(c => c.code === selectedCountry)!;
  const currentTemplate = INDUSTRY_TEMPLATES.find(t => t.id === selectedTemplate);

  const TABS: { key: SettingsTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'company',    labelAr: 'الشركة',        labelEn: 'Company',         icon: 'business'           },
    { key: 'gulf',       labelAr: 'إعدادات الخليج', labelEn: 'Gulf Layer',      icon: 'public'             },
    { key: 'accounting', labelAr: 'المحاسبة',       labelEn: 'Accounting',      icon: 'account-balance'    },
    { key: 'platform',   labelAr: 'النظام',         labelEn: 'Platform',        icon: 'settings-suggest'   },
    { key: 'billing',    labelAr: 'الباقة',         labelEn: 'Billing',         icon: 'credit-card'        },
  ];

  const MF = ({ label, value, onChange, hint, readOnly }: any) => (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{label}</Text>
      <TextInput
        style={[styles.input, isRTL && styles.inputRTL, readOnly && styles.inputReadOnly]}
        value={value} onChangeText={onChange}
        textAlign={isRTL ? 'right' : 'left'}
        placeholderTextColor={Colors.textMuted}
        editable={!readOnly}
      />
      {hint ? <Text style={[styles.fieldHint, isRTL && styles.textRTL]}>{hint}</Text> : null}
    </View>
  );

  const ToggleRow = ({ labelAr, labelEn, descAr, descEn, value, onChange }: any) => (
    <View style={[styles.toggleRow, isRTL && styles.toggleRowRTL]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>{language === 'ar' ? labelAr : labelEn}</Text>
        {descAr ? <Text style={[styles.toggleDesc, isRTL && styles.textRTL]}>{language === 'ar' ? descAr : descEn}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={value ? Colors.textInverse : Colors.textMuted}
      />
    </View>
  );

  return (
    <CompanyLayout title={language === 'ar' ? 'الإعدادات' : 'Settings'}>
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

        {/* ── COMPANY ─────────────────────────────────────────────── */}
        {activeTab === 'company' ? (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'بيانات الشركة' : 'Company Information'}
            </Text>
            <MF label={language === 'ar' ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'} value={companyForm.name} onChange={(v: string) => setCompanyForm(f => ({ ...f, name: v }))} />
            <MF label={language === 'ar' ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'} value={companyForm.nameEn} onChange={(v: string) => setCompanyForm(f => ({ ...f, nameEn: v }))} />
            <MF label={language === 'ar' ? 'الاسم القانوني' : 'Legal Name'} value={companyForm.legalName} onChange={(v: string) => setCompanyForm(f => ({ ...f, legalName: v }))} />
            <MF label={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Registration'} value={companyForm.crNumber} onChange={(v: string) => setCompanyForm(f => ({ ...f, crNumber: v }))} />
            <MF label={language === 'ar' ? 'الرقم الضريبي (إن وجد)' : 'Tax/VAT Number (if applicable)'} value={companyForm.taxNumber} onChange={(v: string) => setCompanyForm(f => ({ ...f, taxNumber: v }))}
              hint={language === 'ar' ? 'مطلوب للشركات المسجلة ضريبياً' : 'Required for VAT-registered companies'} />
            <MF label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={companyForm.email} onChange={(v: string) => setCompanyForm(f => ({ ...f, email: v }))} />
            <MF label={language === 'ar' ? 'الهاتف' : 'Phone'} value={companyForm.phone} onChange={(v: string) => setCompanyForm(f => ({ ...f, phone: v }))} />
            <MF label={language === 'ar' ? 'العنوان' : 'Address'} value={companyForm.address} onChange={(v: string) => setCompanyForm(f => ({ ...f, address: v }))} />

            <Text style={[styles.cardSubTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'إعدادات الفواتير' : 'Invoice Settings'}
            </Text>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: Spacing.sm }}>
              <View style={{ flex: 1 }}>
                <MF label={language === 'ar' ? 'بادئة الفاتورة' : 'Invoice Prefix'} value={companyForm.invoicePrefix} onChange={(v: string) => setCompanyForm(f => ({ ...f, invoicePrefix: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <MF label={language === 'ar' ? 'رقم البداية' : 'Start Number'} value={companyForm.invoiceStartNumber} onChange={(v: string) => setCompanyForm(f => ({ ...f, invoiceStartNumber: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <MF label={language === 'ar' ? 'الخانات العشرية' : 'Decimal Places'} value={companyForm.decimalPlaces}
                  onChange={(v: string) => setCompanyForm(f => ({ ...f, decimalPlaces: v }))}
                  hint={language === 'ar' ? '3 لـ KWD' : '3 for KWD'} />
              </View>
            </View>

            <Pressable style={styles.saveBtn}
              onPress={() => showAlert(language === 'ar' ? 'تم الحفظ' : 'Saved',
                language === 'ar' ? 'تم حفظ إعدادات الشركة بنجاح.' : 'Company settings saved successfully.')}>
              <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── GULF LAYER ──────────────────────────────────────────── */}
        {activeTab === 'gulf' ? (
          <>
            {/* Architecture note */}
            <View style={[styles.archNote, isRTL && styles.archNoteRTL]}>
              <MaterialIcons name="public" size={16} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.archNoteTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'طبقة المحاسبة الخليجية' : 'Gulf Accounting Layer'}
                </Text>
                <Text style={[styles.archNoteDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'كل دولة خليجية لها متطلبات محاسبية وضريبية مختلفة. هذه الطبقة تتكيف تلقائياً مع قوانين كل سوق.'
                    : 'Each Gulf country has different accounting and tax requirements. This layer automatically adapts to each market.'}
                </Text>
              </View>
            </View>

            {/* Country selector */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'اختر الدولة' : 'Select Country'}
            </Text>
            <View style={styles.countryGrid}>
              {GULF_COUNTRIES.map(c => (
                <Pressable key={c.code} onPress={() => setSelectedCountry(c.code)}
                  style={[styles.countryCard, selectedCountry === c.code && styles.countryCardActive]}>
                  <Text style={[styles.countryFlag, isRTL && styles.textRTL]}>
                    {c.code === 'KW' ? '🇰🇼' : c.code === 'SA' ? '🇸🇦' : c.code === 'AE' ? '🇦🇪' : c.code === 'QA' ? '🇶🇦' : c.code === 'BH' ? '🇧🇭' : '🇴🇲'}
                  </Text>
                  <Text style={[styles.countryName, isRTL && styles.textRTL, selectedCountry === c.code && styles.countryNameActive]}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </Text>
                  <Text style={styles.currencyCode}>{c.currency}</Text>
                </Pressable>
              ))}
            </View>

            {/* Country details */}
            <View style={styles.card}>
              <View style={[styles.countryHeaderRow, isRTL && styles.countryHeaderRowRTL]}>
                <Text style={styles.countryFlagLg}>
                  {country.code === 'KW' ? '🇰🇼' : country.code === 'SA' ? '🇸🇦' : country.code === 'AE' ? '🇦🇪' : country.code === 'QA' ? '🇶🇦' : country.code === 'BH' ? '🇧🇭' : '🇴🇲'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{language === 'ar' ? country.nameAr : country.nameEn}</Text>
                  <Text style={[styles.cardDesc, isRTL && styles.textRTL]}>{language === 'ar' ? country.complianceNotesAr : country.complianceNotes}</Text>
                </View>
              </View>
              {[
                { labelAr: 'العملة', labelEn: 'Currency', value: `${country.currency} — ${language === 'ar' ? country.currencyAr : country.currency} (${country.currencySymbol})` },
                { labelAr: 'الخانات العشرية', labelEn: 'Decimal Places', value: String(country.currencyDecimals) },
                { labelAr: 'ضريبة القيمة المضافة', labelEn: 'VAT', value: country.hasVat ? `${(country.vatRate * 100).toFixed(0)}%` : (language === 'ar' ? 'لا تطبق' : 'Not Applicable') },
                { labelAr: 'الجهة الضريبية', labelEn: 'Tax Authority', value: country.taxAuthority },
                { labelAr: 'الاحتفاظ بالسجلات', labelEn: 'Record Retention', value: `${country.invoiceRequirements.retentionYears} ${language === 'ar' ? 'سنوات' : 'years'}` },
              ].map((item, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                  <Text style={styles.detailLabel}>{language === 'ar' ? item.labelAr : item.labelEn}</Text>
                  <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{item.value}</Text>
                </View>
              ))}

              {/* Invoice requirements */}
              <Text style={[styles.cardSubTitle, isRTL && styles.textRTL, { marginTop: Spacing.md }]}>
                {language === 'ar' ? 'متطلبات الفاتورة' : 'Invoice Requirements'}
              </Text>
              {[
                { key: 'requiresCRNumber', labelAr: 'السجل التجاري', labelEn: 'CR Number Required' },
                { key: 'requiresTaxNumber', labelAr: 'الرقم الضريبي', labelEn: 'Tax Number Required' },
                { key: 'requiresQrCode', labelAr: 'QR Code (فوترة إلكترونية)', labelEn: 'QR Code (E-Invoice)' },
                { key: 'digitalSignature', labelAr: 'توقيع رقمي', labelEn: 'Digital Signature' },
                { key: 'reportingToAuthority', labelAr: 'إرسال للجهة الضريبية', labelEn: 'Report to Tax Authority' },
              ].map(req => (
                <View key={req.key} style={[styles.reqRow, isRTL && styles.reqRowRTL]}>
                  <MaterialIcons
                    name={(country.invoiceRequirements as any)[req.key] ? 'check-circle' : 'cancel'}
                    size={18}
                    color={(country.invoiceRequirements as any)[req.key] ? Colors.success : Colors.textMuted}
                  />
                  <Text style={[styles.reqText, isRTL && styles.textRTL]}>{language === 'ar' ? req.labelAr : req.labelEn}</Text>
                  <Text style={[styles.reqStatus, { color: (country.invoiceRequirements as any)[req.key] ? Colors.success : Colors.textMuted }]}>
                    {(country.invoiceRequirements as any)[req.key]
                      ? (language === 'ar' ? 'مطلوب' : 'Required')
                      : (language === 'ar' ? 'غير مطلوب' : 'Not Required')}
                  </Text>
                </View>
              ))}
            </View>

            {/* Industry Template */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'قالب الصناعة' : 'Industry Template'}
            </Text>
            <View style={styles.templateGrid}>
              {INDUSTRY_TEMPLATES.map(tmpl => (
                <Pressable key={tmpl.id} onPress={() => setSelectedTemplate(tmpl.id)}
                  style={[styles.templateCard, selectedTemplate === tmpl.id && { borderColor: tmpl.color, borderWidth: 2 }]}>
                  <View style={[styles.templateIcon, { backgroundColor: `${tmpl.color}15` }]}>
                    <MaterialIcons name={tmpl.icon as any} size={22} color={tmpl.color} />
                  </View>
                  <Text style={[styles.templateName, isRTL && styles.textRTL, selectedTemplate === tmpl.id && { color: tmpl.color }]}>
                    {language === 'ar' ? tmpl.nameAr : tmpl.nameEn}
                  </Text>
                  {selectedTemplate === tmpl.id ? (
                    <MaterialIcons name="check-circle" size={16} color={tmpl.color} style={{ position: 'absolute', top: 6, right: 6 }} />
                  ) : null}
                </Pressable>
              ))}
            </View>
            {currentTemplate ? (
              <View style={[styles.archNote, { borderLeftColor: currentTemplate.color }, isRTL && styles.archNoteRTL]}>
                <MaterialIcons name="info" size={14} color={currentTemplate.color} />
                <Text style={[styles.archNoteDesc, { color: currentTemplate.color }, isRTL && styles.textRTL]}>
                  {language === 'ar' ? currentTemplate.descriptionAr : currentTemplate.descriptionEn}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        {/* ── ACCOUNTING ──────────────────────────────────────────── */}
        {activeTab === 'accounting' ? (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'إعدادات محرك المحاسبة' : 'Accounting Engine Settings'}
            </Text>
            <View style={[styles.ruleNote, isRTL && styles.ruleNoteRTL]}>
              <MaterialIcons name="account-balance" size={16} color={Colors.primary} />
              <Text style={[styles.ruleNoteText, isRTL && styles.textRTL]}>
                {language === 'ar'
                  ? 'القاعدة الأساسية: مجموع المدين = مجموع الدائن في أي قيد. لا يسمح بقيد غير متوازن.'
                  : 'Core Rule: Total Debit = Total Credit in any journal entry. Unbalanced entries are not allowed.'}
              </Text>
            </View>
            <ToggleRow
              labelAr="ترحيل القيود تلقائياً" labelEn="Auto-post Journal Entries"
              descAr="يترحل القيد مباشرة دون مراجعة يدوية" descEn="Entry is posted directly without manual review"
              value={accountingSettings.autoPostJournals}
              onChange={(v: boolean) => setAccountingSettings(s => ({ ...s, autoPostJournals: v }))}
            />
            <ToggleRow
              labelAr="موافقة مطلوبة للقيود" labelEn="Require Approval for Entries"
              descAr="القيود اليدوية تحتاج موافقة قبل الترحيل" descEn="Manual entries require approval before posting"
              value={accountingSettings.requireApproval}
              onChange={(v: boolean) => setAccountingSettings(s => ({ ...s, requireApproval: v }))}
            />
            <ToggleRow
              labelAr="السماح بقيود في فترات مغلقة" labelEn="Allow Past Period Entries"
              descAr="السماح بإدخال قيود في فترات محاسبية مقفلة (خطر)" descEn="Allow entries in closed periods (risky)"
              value={accountingSettings.allowPastPeriodEntry}
              onChange={(v: boolean) => setAccountingSettings(s => ({ ...s, allowPastPeriodEntry: v }))}
            />
            <ToggleRow
              labelAr="توليد قيد تكلفة المبيعات تلقائياً" labelEn="Auto COGS Entry on Sale"
              descAr="ينشئ قيد تكلفة البضاعة المباعة تلقائياً مع كل عملية بيع" descEn="Automatically creates COGS journal entry with each sale"
              value={accountingSettings.autoGenerateCogsEntry}
              onChange={(v: boolean) => setAccountingSettings(s => ({ ...s, autoGenerateCogsEntry: v }))}
            />
            <ToggleRow
              labelAr="فرض توازن القيود" labelEn="Enforce Balanced Entries"
              descAr="لا يمكن حفظ قيد غير متوازن (مدين ≠ دائن). مُوصى به دائماً." descEn="Cannot save unbalanced entries (debit ≠ credit). Always recommended."
              value={accountingSettings.enforceBalancedEntries}
              onChange={(v: boolean) => setAccountingSettings(s => ({ ...s, enforceBalancedEntries: v }))}
            />

            <Text style={[styles.cardSubTitle, isRTL && styles.textRTL, { marginTop: Spacing.md }]}>
              {language === 'ar' ? 'طريقة احتساب تكلفة المخزون' : 'Inventory Costing Method'}
            </Text>
            {[
              { key: 'weighted_average', labelAr: 'المتوسط المرجح (الأكثر شيوعاً)', labelEn: 'Weighted Average (Most common)' },
              { key: 'fifo', labelAr: 'FIFO — الأول دخولاً أول خروجاً', labelEn: 'FIFO — First In, First Out' },
            ].map(opt => (
              <Pressable key={opt.key}
                onPress={() => setAccountingSettings(s => ({ ...s, defaultCostingMethod: opt.key }))}
                style={[styles.costingOption, accountingSettings.defaultCostingMethod === opt.key && styles.costingOptionActive, isRTL && styles.costingOptionRTL]}>
                <View style={[styles.costingRadio, accountingSettings.defaultCostingMethod === opt.key && styles.costingRadioActive]}>
                  {accountingSettings.defaultCostingMethod === opt.key ? (
                    <View style={styles.costingRadioDot} />
                  ) : null}
                </View>
                <Text style={[styles.costingLabel, isRTL && styles.textRTL, accountingSettings.defaultCostingMethod === opt.key && styles.costingLabelActive]}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </Text>
              </Pressable>
            ))}
            <Pressable style={styles.saveBtn}
              onPress={() => showAlert(language === 'ar' ? 'تم الحفظ' : 'Saved', language === 'ar' ? 'تم حفظ إعدادات المحاسبة.' : 'Accounting settings saved.')}>
              <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── PLATFORM MODE ───────────────────────────────────────── */}
        {activeTab === 'platform' ? (
          <>
            {[
              { icon: 'integration-instructions', color: Colors.primary, titleAr: 'وضع الاستخدام', titleEn: 'Platform Mode', descAr: 'حدد كيف تريد استخدام المنصة', descEn: 'Choose how you want to use the platform' },
              { icon: 'palette', color: '#F59E0B', titleAr: 'White Label', titleEn: 'White Label', descAr: 'خصص المنصة بعلامتك التجارية', descEn: 'Brand the platform with your identity' },
              { icon: 'language', color: '#10B981', titleAr: 'اللغة والمنطقة', titleEn: 'Language & Region', descAr: 'اللغة الافتراضية والتنسيقات الإقليمية', descEn: 'Default language and regional formats' },
              { icon: 'security', color: '#8B5CF6', titleAr: 'الأمان', titleEn: 'Security', descAr: 'المصادقة الثنائية وسجلات الأمان', descEn: 'Two-factor auth and security logs' },
              { icon: 'backup', color: '#64748B', titleAr: 'النسخ الاحتياطية', titleEn: 'Backups', descAr: 'جدولة النسخ الاحتياطية وإدارتها', descEn: 'Schedule and manage data backups' },
            ].map((item, i) => (
              <Pressable key={i} style={[styles.platformOption, isRTL && styles.platformOptionRTL]}>
                <View style={[styles.platformOptionIcon, { backgroundColor: `${item.color}15` }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.platformOptionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? item.titleAr : item.titleEn}</Text>
                  <Text style={[styles.platformOptionDesc, isRTL && styles.textRTL]}>{language === 'ar' ? item.descAr : item.descEn}</Text>
                </View>
                <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
              </Pressable>
            ))}
          </>
        ) : null}

        {/* ── BILLING ─────────────────────────────────────────────── */}
        {activeTab === 'billing' ? (
          <>
            <View style={[styles.currentPlanBanner, isRTL && styles.currentPlanBannerRTL]}>
              <MaterialIcons name="business-center" size={24} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.currentPlanLabel, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'الباقة الحالية' : 'Current Plan'}
                </Text>
                <Text style={[styles.currentPlanName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'الأعمال' : 'Business'}
                </Text>
              </View>
              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanBadgeText}>{language === 'ar' ? 'نشط' : 'Active'}</Text>
              </View>
            </View>

            {BILLING_PLANS.filter(p => p.plan !== 'white_label').map(plan => (
              <View key={plan.plan} style={[styles.planCard, plan.isPopular && styles.planCardPopular]}>
                {plan.isPopular ? (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</Text>
                  </View>
                ) : null}
                <View style={[styles.planHeader, isRTL && styles.planHeaderRTL]}>
                  <View style={[styles.planIconBg, { backgroundColor: `${plan.color}15` }]}>
                    <MaterialIcons name={plan.icon as any} size={22} color={plan.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planName, isRTL && styles.textRTL]}>{language === 'ar' ? plan.nameAr : plan.nameEn}</Text>
                    <Text style={[styles.planDesc, isRTL && styles.textRTL]}>{language === 'ar' ? plan.descriptionAr : plan.descriptionEn}</Text>
                  </View>
                  {plan.isEnterprise ? (
                    <View style={[styles.enterpriseBadge, { borderColor: plan.color }]}>
                      <Text style={[styles.enterpriseBadgeText, { color: plan.color }]}>{language === 'ar' ? 'مؤسسات' : 'Enterprise'}</Text>
                    </View>
                  ) : null}
                </View>
                {plan.features.filter(f => f.highlight || f.included).slice(0, 4).map(feat => (
                  <View key={feat.key} style={[styles.planFeat, isRTL && styles.planFeatRTL]}>
                    <MaterialIcons name={feat.included ? 'check' : 'close'} size={15} color={feat.included ? Colors.success : Colors.textMuted} />
                    <Text style={[styles.planFeatText, isRTL && styles.textRTL, { color: feat.included ? Colors.text : Colors.textMuted }]}>
                      {language === 'ar' ? feat.nameAr : feat.nameEn}
                    </Text>
                  </View>
                ))}
                <Pressable style={[styles.planBtn, plan.isPopular && { backgroundColor: Colors.primary }]}
                  onPress={() => showAlert(plan.isEnterprise ? (language === 'ar' ? 'تواصل معنا' : 'Contact Sales') : (language === 'ar' ? 'ترقية' : 'Upgrade'),
                    plan.isEnterprise ? (language === 'ar' ? 'تواصل مع فريق المبيعات للحصول على عرض مخصص.' : 'Contact our sales team for a custom quote.') : (language === 'ar' ? 'سيتم إعادة توجيهك لصفحة الدفع.' : 'You will be redirected to the payment page.'))}>
                  <Text style={[styles.planBtnText, plan.isPopular && { color: Colors.textInverse }]}>
                    {plan.isEnterprise
                      ? (language === 'ar' ? 'تواصل معنا' : 'Contact Sales')
                      : plan.plan === 'business'
                      ? (language === 'ar' ? 'الخطة الحالية' : 'Current Plan')
                      : (language === 'ar' ? 'الترقية' : 'Upgrade')}
                  </Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </CompanyLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  cardTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  cardSubTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm, includeFontPadding: false },
  cardDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 20, marginTop: 4, includeFontPadding: false },
  fieldLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, backgroundColor: Colors.background, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  inputReadOnly: { backgroundColor: Colors.borderLight, color: Colors.textMuted },
  fieldHint: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 4, includeFontPadding: false },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 13, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md },
  saveBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  archNote: { flexDirection: 'row', gap: 10, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  archNoteRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.primary },
  archNoteTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  archNoteDesc: { fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20, marginTop: 2, includeFontPadding: false },
  sectionTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  countryCard: { flex: 1, minWidth: 80, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, gap: 4, ...Shadow.sm },
  countryCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  countryFlag: { fontSize: 22 },
  countryName: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, textAlign: 'center', includeFontPadding: false },
  countryNameActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  currencyCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  countryHeaderRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  countryHeaderRowRTL: { flexDirection: 'row-reverse' },
  countryFlagLg: { fontSize: 36 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailRowRTL: { flexDirection: 'row-reverse' },
  detailLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  detailValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  reqRowRTL: { flexDirection: 'row-reverse' },
  reqText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.text, includeFontPadding: false },
  reqStatus: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  templateCard: { flex: 1, minWidth: 90, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, gap: 6, ...Shadow.sm, position: 'relative' },
  templateIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  templateName: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, textAlign: 'center', fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  toggleRowRTL: { flexDirection: 'row-reverse' },
  toggleLabel: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  toggleDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2, lineHeight: 18, includeFontPadding: false },
  ruleNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  ruleNoteRTL: { flexDirection: 'row-reverse' },
  ruleNoteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20, includeFontPadding: false },
  costingOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  costingOptionRTL: { flexDirection: 'row-reverse' },
  costingOptionActive: { backgroundColor: Colors.primaryLight, marginHorizontal: -Spacing.base, paddingHorizontal: Spacing.base, borderRadius: Radius.md },
  costingRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  costingRadioActive: { borderColor: Colors.primary },
  costingRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  costingLabel: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.textSecondary, includeFontPadding: false },
  costingLabelActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  platformOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  platformOptionRTL: { flexDirection: 'row-reverse' },
  platformOptionIcon: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  platformOptionTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  platformOptionDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  currentPlanBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.base, borderWidth: 1.5, borderColor: `${Colors.primary}30`, ...Shadow.sm },
  currentPlanBannerRTL: { flexDirection: 'row-reverse' },
  currentPlanLabel: { fontSize: Typography.fontSizeXS, color: Colors.primary, includeFontPadding: false },
  currentPlanName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  currentPlanBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.success },
  currentPlanBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textInverse, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  planCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md, borderWidth: 1.5, borderColor: Colors.border, position: 'relative', overflow: 'hidden' },
  planCardPopular: { borderColor: Colors.primary, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: Radius.md },
  popularBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textInverse, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  planHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  planHeaderRTL: { flexDirection: 'row-reverse' },
  planIconBg: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  planDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  enterpriseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1.5, alignSelf: 'flex-start' },
  enterpriseBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  planFeat: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  planFeatRTL: { flexDirection: 'row-reverse' },
  planFeatText: { fontSize: Typography.fontSizeSM, includeFontPadding: false },
  planBtn: { marginTop: Spacing.md, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  planBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, color: Colors.textSecondary, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
