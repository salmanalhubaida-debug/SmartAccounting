// Supplier Profile — Full profile with statement and contacts
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useCustomers } from '../../contexts/CustomersContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { Contact, PAYMENT_TERMS_OPTIONS } from '../../types/customers';
import { generateSupplierStatement } from '../../services/customersData';
import { useAlert } from '@/template';

type ProfileTab = 'overview' | 'statement' | 'contacts';

const STATEMENT_TYPE_COLORS: Record<string, string> = {
  invoice: Colors.danger, payment: Colors.success,
  credit_note: Colors.success, debit_note: Colors.warning,
  opening: Colors.primary, adjustment: Colors.warning,
};
const STATEMENT_LABELS_AR: Record<string, string> = {
  invoice: 'فاتورة مشتريات', payment: 'دفعة',
  credit_note: 'إشعار دائن', debit_note: 'إشعار مدين',
  opening: 'رصيد افتتاحي', adjustment: 'تسوية',
};
const COUNTRY_FLAGS: Record<string, string> = {
  KW: '🇰🇼', SA: '🇸🇦', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', EG: '🇪🇬',
};

export default function SupplierProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const { getSupplier, getContactsFor, addContact, deleteContact } = useCustomers();

  const supplier = getSupplier(id ?? '');
  const contacts = getContactsFor('supplier', id ?? '');
  const paymentTermsLabel = PAYMENT_TERMS_OPTIONS.find(p => p.value === supplier?.payment_terms);

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [contactModal, setContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', name_ar: '', position: '', phone: '', email: '', notes: '' });

  const statement = useMemo(() => id ? generateSupplierStatement(id) : [], [id]);

  const fmtCurrency = (n: number) =>
    `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (!supplier) {
    return (
      <CompanyLayout title={language === 'ar' ? 'بيانات المورد' : 'Supplier Profile'}>
        <View style={styles.notFound}>
          <MaterialIcons name="local-shipping" size={52} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>{language === 'ar' ? 'المورد غير موجود' : 'Supplier not found'}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{language === 'ar' ? 'عودة' : 'Go Back'}</Text>
          </Pressable>
        </View>
      </CompanyLayout>
    );
  }

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) return;
    addContact({
      entity_type: 'supplier', entity_id: supplier.id,
      company_id: supplier.company_id,
      name: contactForm.name, name_ar: contactForm.name_ar || undefined,
      position: contactForm.position || undefined,
      phone: contactForm.phone || undefined, email: contactForm.email || undefined,
      is_primary: contacts.length === 0,
    });
    log({ action: 'create', module: 'suppliers', record_id: supplier.id, record_type: 'supplier_contact', new_data: { contact: contactForm.name } });
    setContactForm({ name: '', name_ar: '', position: '', phone: '', email: '', notes: '' });
    setContactModal(false);
  };

  const handleDeleteContact = (contact: Contact) => {
    if (contact.is_primary) { showAlert(language === 'ar' ? 'غير مسموح' : 'Not Allowed', language === 'ar' ? 'لا يمكن حذف جهة الاتصال الرئيسية' : 'Cannot delete primary contact'); return; }
    showAlert(
      language === 'ar' ? 'حذف جهة الاتصال؟' : 'Delete Contact?', contact.name,
      [{ text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteContact(contact.id) }]
    );
  };

  const TABS: { key: ProfileTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'dashboard' },
    { key: 'statement', labelAr: 'كشف الحساب', labelEn: 'Statement', icon: 'receipt-long' },
    { key: 'contacts', labelAr: 'جهات الاتصال', labelEn: 'Contacts', icon: 'contact-phone' },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? (supplier.name_ar ?? supplier.name) : supplier.name}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
            <View style={[styles.avatar, supplier.type === 'company' ? styles.avatarCompany : styles.avatarIndividual]}>
              <Text style={[styles.avatarText, supplier.type === 'company' ? styles.avatarTextCompany : styles.avatarTextIndividual]}>
                {(supplier.name_ar ?? supplier.name).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
                <Text style={[styles.headerName, isRTL && styles.textRTL]} numberOfLines={2}>
                  {language === 'ar' ? (supplier.name_ar ?? supplier.name) : supplier.name}
                </Text>
                <Text style={styles.flag}>{COUNTRY_FLAGS[supplier.country] ?? '🌍'}</Text>
              </View>
              <Text style={[styles.code, isRTL && styles.textRTL]}>{supplier.code}</Text>
              <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
                {supplier.phone ? (
                  <View style={styles.metaChip}>
                    <MaterialIcons name="phone" size={11} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{supplier.phone}</Text>
                  </View>
                ) : null}
                {paymentTermsLabel ? (
                  <View style={[styles.metaChip, { backgroundColor: Colors.accentLight }]}>
                    <Text style={[styles.metaChipText, { color: Colors.accent }]}>
                      {language === 'ar' ? paymentTermsLabel.labelAr : paymentTermsLabel.labelEn}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Balance summary */}
          <View style={styles.balanceRow}>
            <BalItem label={language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'} value={fmtCurrency(supplier.total_purchases)} color={Colors.primary} />
            <View style={styles.balDivider} />
            <BalItem label={language === 'ar' ? 'المدفوع' : 'Paid'} value={fmtCurrency(supplier.total_paid)} color={Colors.success} />
            <View style={styles.balDivider} />
            <BalItem label={language === 'ar' ? 'المستحق' : 'Balance Due'} value={fmtCurrency(supplier.balance)} color={supplier.balance > 0 ? Colors.danger : Colors.success} highlight />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsBar}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <MaterialIcons name={tab.icon as any} size={15} color={activeTab === tab.key ? Colors.accent : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {language === 'ar' ? tab.labelAr : tab.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' ? (
            <View style={styles.tabContent}>
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'الملخص المالي' : 'Financial Summary'}</Text>
                <InfoRow labelAr="شروط الدفع" labelEn="Payment Terms" isRTL={isRTL} language={language} value={language === 'ar' ? (paymentTermsLabel?.labelAr ?? '') : (paymentTermsLabel?.labelEn ?? '')} />
                <InfoRow labelAr="الرصيد الافتتاحي" labelEn="Opening Balance" isRTL={isRTL} language={language} value={fmtCurrency(supplier.opening_balance)} />
                <InfoRow labelAr="إجمالي المشتريات" labelEn="Total Purchases" isRTL={isRTL} language={language} value={fmtCurrency(supplier.total_purchases)} />
                <InfoRow labelAr="إجمالي المدفوعات" labelEn="Total Paid" isRTL={isRTL} language={language} value={fmtCurrency(supplier.total_paid)} />
                <InfoRow labelAr="إجمالي المرتجعات" labelEn="Total Returns" isRTL={isRTL} language={language} value={fmtCurrency(supplier.total_returns)} />
                <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                  <Text style={[styles.totalLabel, isRTL && styles.textRTL]}>{language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}</Text>
                  <Text style={[styles.totalValue, { color: supplier.balance > 0 ? Colors.danger : Colors.success }]}>{fmtCurrency(supplier.balance)}</Text>
                </View>
              </View>

              {supplier.credit_limit > 0 ? (
                <View style={styles.sectionCard}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'معلومات الائتمان' : 'Credit Info'}</Text>
                  <InfoRow labelAr="حد الائتمان" labelEn="Credit Limit" isRTL={isRTL} language={language} value={fmtCurrency(supplier.credit_limit)} />
                  <InfoRow labelAr="المتاح" labelEn="Available" isRTL={isRTL} language={language} value={fmtCurrency(Math.max(0, supplier.credit_limit - supplier.balance))} />
                </View>
              ) : null}

              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'معلومات التواصل' : 'Contact Info'}</Text>
                {supplier.address ? <InfoRow labelAr="العنوان" labelEn="Address" isRTL={isRTL} language={language} value={supplier.address} /> : null}
                {supplier.city ? <InfoRow labelAr="المدينة" labelEn="City" isRTL={isRTL} language={language} value={supplier.city} /> : null}
                {supplier.commercial_reg ? <InfoRow labelAr="السجل التجاري" labelEn="Commercial Reg." isRTL={isRTL} language={language} value={supplier.commercial_reg} /> : null}
                {supplier.tax_number ? <InfoRow labelAr="الرقم الضريبي" labelEn="Tax Number" isRTL={isRTL} language={language} value={supplier.tax_number} /> : null}
              </View>

              {supplier.notes ? (
                <View style={styles.sectionCard}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Text>
                  <Text style={[styles.notesText, isRTL && styles.textRTL]}>{supplier.notes}</Text>
                </View>
              ) : null}

              <View style={[styles.accountingNote, isRTL && styles.accountingNoteRTL]}>
                <MaterialIcons name="account-balance" size={16} color={Colors.accent} />
                <Text style={[styles.accountingNoteText, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'ستظهر هنا تفاصيل حساب الدائنين وقيود اليومية عند تفعيل محرك المحاسبة'
                    : 'Accounts Payable details and journal entries will appear here when the Accounting Engine is activated'}
                </Text>
              </View>
            </View>
          ) : activeTab === 'statement' ? (
            <View style={styles.tabContent}>
              <View style={styles.sectionCard}>
                <View style={[styles.stmtHeader, isRTL && styles.stmtHeaderRTL]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'كشف الحساب' : 'Account Statement'}</Text>
                  {can('suppliers', 'export') ? (
                    <Pressable style={styles.exportBtn}>
                      <MaterialIcons name="file-download" size={14} color={Colors.accent} />
                      <Text style={[styles.exportBtnText, { color: Colors.accent }]}>{language === 'ar' ? 'تصدير' : 'Export'}</Text>
                    </Pressable>
                  ) : null}
                </View>

                <View style={[styles.stmtHeaderRow, isRTL && styles.stmtHeaderRowRTL]}>
                  <Text style={styles.stmtColDate}>{language === 'ar' ? 'التاريخ' : 'Date'}</Text>
                  <Text style={styles.stmtColRef}>{language === 'ar' ? 'المرجع' : 'Ref'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.success }]}>{language === 'ar' ? 'مدين' : 'Debit'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.danger }]}>{language === 'ar' ? 'دائن' : 'Credit'}</Text>
                  <Text style={styles.stmtColBal}>{language === 'ar' ? 'الرصيد' : 'Balance'}</Text>
                </View>

                {statement.map((line, idx) => (
                  <View key={line.id} style={[styles.stmtRow, idx % 2 === 0 && styles.stmtRowAlt, isRTL && styles.stmtRowRTL]}>
                    <Text style={styles.stmtColDate}>{fmtDate(line.date)}</Text>
                    <View style={{ flex: 1.5 }}>
                      <Text style={[styles.stmtRef, isRTL && styles.textRTL]} numberOfLines={1}>{line.reference}</Text>
                      <Text style={[styles.stmtDesc, isRTL && styles.textRTL]} numberOfLines={1}>
                        <Text style={{ color: STATEMENT_TYPE_COLORS[line.type] }}>
                          {language === 'ar' ? STATEMENT_LABELS_AR[line.type] : line.type.replace(/_/g, ' ')}
                        </Text>
                      </Text>
                    </View>
                    <Text style={[styles.stmtColAmt, line.debit > 0 ? styles.stmtCredit : styles.stmtZero]}>{line.debit > 0 ? line.debit.toFixed(3) : '-'}</Text>
                    <Text style={[styles.stmtColAmt, line.credit > 0 ? styles.stmtDebit : styles.stmtZero]}>{line.credit > 0 ? line.credit.toFixed(3) : '-'}</Text>
                    <Text style={[styles.stmtColBal, line.balance > 0 && styles.stmtDebit]}>{line.balance.toFixed(3)}</Text>
                  </View>
                ))}

                <View style={[styles.stmtTotals, isRTL && styles.stmtTotalsRTL]}>
                  <Text style={styles.stmtTotalsLabel}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.success, fontWeight: Typography.fontWeightBold }]}>{statement.reduce((s, l) => s + l.debit, 0).toFixed(3)}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.danger, fontWeight: Typography.fontWeightBold }]}>{statement.reduce((s, l) => s + l.credit, 0).toFixed(3)}</Text>
                  <Text style={[styles.stmtColBal, { color: Colors.danger, fontWeight: Typography.fontWeightBold }]}>{supplier.balance.toFixed(3)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <View style={[styles.contactsHeader, isRTL && styles.contactsHeaderRTL]}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? `جهات الاتصال (${contacts.length})` : `Contacts (${contacts.length})`}</Text>
                {can('suppliers', 'edit') ? (
                  <Pressable onPress={() => setContactModal(true)} style={[styles.addBtn, { backgroundColor: Colors.accent }]}>
                    <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                    <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
                  </Pressable>
                ) : null}
              </View>
              {contacts.length === 0 ? (
                <View style={styles.empty}>
                  <MaterialIcons name="contact-phone" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد جهات اتصال' : 'No contacts added'}</Text>
                </View>
              ) : contacts.map(contact => (
                <View key={contact.id} style={[styles.contactCard, isRTL && styles.contactCardRTL]}>
                  <View style={[styles.contactAvatar, contact.is_primary && styles.contactAvatarPrimary]}>
                    <Text style={[styles.contactAvatarText, contact.is_primary && { color: Colors.accent }]}>
                      {(contact.name_ar ?? contact.name).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.contactNameRow, isRTL && styles.contactNameRowRTL]}>
                      <Text style={[styles.contactName, isRTL && styles.textRTL]}>{language === 'ar' ? (contact.name_ar ?? contact.name) : contact.name}</Text>
                      {contact.is_primary ? (
                        <View style={[styles.primaryBadge, { backgroundColor: Colors.accentLight }]}>
                          <Text style={[styles.primaryBadgeText, { color: Colors.accent }]}>{language === 'ar' ? 'رئيسي' : 'Primary'}</Text>
                        </View>
                      ) : null}
                    </View>
                    {contact.position ? <Text style={[styles.contactPosition, isRTL && styles.textRTL]}>{contact.position}</Text> : null}
                    {contact.phone ? (
                      <View style={[styles.contactMeta, isRTL && styles.contactMetaRTL]}>
                        <MaterialIcons name="phone" size={12} color={Colors.textMuted} />
                        <Text style={styles.contactMetaText}>{contact.phone}</Text>
                      </View>
                    ) : null}
                    {contact.email ? (
                      <View style={[styles.contactMeta, isRTL && styles.contactMetaRTL]}>
                        <MaterialIcons name="email" size={12} color={Colors.textMuted} />
                        <Text style={styles.contactMetaText}>{contact.email}</Text>
                      </View>
                    ) : null}
                  </View>
                  {!contact.is_primary && can('suppliers', 'edit') ? (
                    <Pressable onPress={() => handleDeleteContact(contact)} style={styles.deleteBtn} hitSlop={8}>
                      <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </View>

      {/* Add Contact Modal */}
      <Modal visible={contactModal} transparent animationType="slide" onRequestClose={() => setContactModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={[cStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[cStyles.header, isRTL && cStyles.headerRTL]}>
              <Text style={cStyles.title}>{language === 'ar' ? 'إضافة جهة اتصال' : 'Add Contact'}</Text>
              <Pressable onPress={() => setContactModal(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
              {[
                { key: 'name_ar', labelAr: 'الاسم (عربي)', labelEn: 'Name (Arabic)' },
                { key: 'name', labelAr: 'الاسم (إنجليزي)', labelEn: 'Name (English)', required: true },
                { key: 'position', labelAr: 'المسمى الوظيفي', labelEn: 'Position' },
                { key: 'phone', labelAr: 'الهاتف', labelEn: 'Phone', type: 'phone-pad' },
                { key: 'email', labelAr: 'البريد', labelEn: 'Email', type: 'email-address' },
              ].map(field => (
                <View key={field.key} style={{ marginBottom: Spacing.md }}>
                  <Text style={[cStyles.label, isRTL && cStyles.labelRTL]}>
                    {language === 'ar' ? field.labelAr : field.labelEn}
                    {field.required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
                  </Text>
                  <TextInput
                    style={[cStyles.input, isRTL && cStyles.inputRTL]}
                    value={(contactForm as any)[field.key]}
                    onChangeText={v => setContactForm(f => ({ ...f, [field.key]: v }))}
                    textAlign={isRTL ? 'right' : 'left'}
                    keyboardType={(field.type as any) ?? 'default'}
                    autoCapitalize="none"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ))}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
            <View style={[cStyles.footer, isRTL && cStyles.footerRTL]}>
              <Pressable onPress={() => setContactModal(false)} style={cStyles.cancelBtn}>
                <Text style={cStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSaveContact} style={[cStyles.saveBtn, { backgroundColor: Colors.accent }]}>
                <Text style={cStyles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </CompanyLayout>
  );
}

const BalItem = ({ label, value, color, highlight }: any) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 3, includeFontPadding: false }}>{label}</Text>
    <Text style={{ fontSize: highlight ? Typography.fontSizeMD : Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color, includeFontPadding: false }}>{value}</Text>
  </View>
);

const InfoRow = ({ labelAr, labelEn, isRTL, language, value }: any) => (
  <View style={[{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }]}>
    <Text style={{ fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false }}>{language === 'ar' ? labelAr : labelEn}</Text>
    <Text style={{ fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, flex: 1, textAlign: isRTL ? 'left' : 'right', includeFontPadding: false }}>{value}</Text>
  </View>
);

const cStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '70%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
  footerRTL: { flexDirection: 'row-reverse' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  cancelText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: Typography.fontSizeLG, color: Colors.textMuted, includeFontPadding: false },
  backBtn: { paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.accent },
  backBtnText: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  headerCard: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.base, ...Shadow.sm },
  headerTop: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  headerTopRTL: { flexDirection: 'row-reverse' },
  avatar: { width: 54, height: 54, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  avatarCompany: { backgroundColor: `${Colors.accent}20` },
  avatarIndividual: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  avatarText: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  avatarTextCompany: { color: Colors.accent },
  avatarTextIndividual: { color: Colors.textSecondary },
  flag: { fontSize: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  nameRowRTL: { flexDirection: 'row-reverse' },
  headerName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, flex: 1, includeFontPadding: false },
  code: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  metaChipText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  balanceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  balDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  tabsBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.accent, fontWeight: Typography.fontWeightSemibold },
  tabContent: { padding: Spacing.base, gap: Spacing.base },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: 1.5, borderTopColor: Colors.border },
  totalRowRTL: { flexDirection: 'row-reverse' },
  totalLabel: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  totalValue: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  notesText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  accountingNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.accentLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  accountingNoteRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.accent },
  accountingNoteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.accent, lineHeight: 20, includeFontPadding: false },
  stmtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  stmtHeaderRTL: { flexDirection: 'row-reverse' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.accent },
  exportBtnText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  stmtHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: Colors.border, backgroundColor: Colors.background, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm, marginBottom: 4 },
  stmtHeaderRowRTL: { flexDirection: 'row-reverse' },
  stmtRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  stmtRowAlt: { backgroundColor: Colors.background },
  stmtRowRTL: { flexDirection: 'row-reverse' },
  stmtColDate: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, width: 72, includeFontPadding: false },
  stmtColRef: { flex: 1.5, fontSize: Typography.fontSizeXS, color: Colors.textSecondary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  stmtColAmt: { width: 72, textAlign: 'right', fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  stmtColBal: { width: 72, textAlign: 'right', fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  stmtRef: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  stmtDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  stmtDebit: { color: Colors.danger },
  stmtCredit: { color: Colors.success },
  stmtZero: { color: Colors.borderLight },
  stmtTotals: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.sm, marginTop: 4 },
  stmtTotalsRTL: { flexDirection: 'row-reverse' },
  stmtTotalsLabel: { flex: 1, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  contactsHeaderRTL: { flexDirection: 'row-reverse' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md },
  addBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  contactCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.sm, ...Shadow.sm },
  contactCardRTL: { flexDirection: 'row-reverse' },
  contactAvatar: { width: 40, height: 40, borderRadius: Radius.xl, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  contactAvatarPrimary: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  contactAvatarText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textSecondary, includeFontPadding: false },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactNameRowRTL: { flexDirection: 'row-reverse' },
  contactName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  contactPosition: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  contactMetaRTL: { flexDirection: 'row-reverse' },
  contactMetaText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  primaryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  primaryBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  textRTL: { textAlign: 'right' },
});
