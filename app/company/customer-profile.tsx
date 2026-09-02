// Customer Profile — Full profile with statement, contacts, financials
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput, FlatList,
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
import { Contact, StatementLine, PAYMENT_TERMS_OPTIONS } from '../../types/customers';
import { generateCustomerStatement } from '../../services/customersData';
import { useAlert } from '@/template';

type ProfileTab = 'overview' | 'statement' | 'contacts';

const STATEMENT_TYPE_COLORS: Record<string, string> = {
  invoice: Colors.danger,
  payment: Colors.success,
  credit_note: Colors.success,
  debit_note: Colors.danger,
  opening: Colors.primary,
  adjustment: Colors.warning,
};

const STATEMENT_LABELS_AR: Record<string, string> = {
  invoice: 'فاتورة', payment: 'دفعة',
  credit_note: 'إشعار دائن', debit_note: 'إشعار مدين',
  opening: 'رصيد افتتاحي', adjustment: 'تسوية',
};

export default function CustomerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const { getCustomer, getContactsFor, groups, updateCustomer, archiveCustomer, addContact, deleteContact } = useCustomers();

  const customer = getCustomer(id ?? '');
  const contacts = getContactsFor('customer', id ?? '');
  const group = groups.find(g => g.id === customer?.group_id);
  const paymentTermsLabel = PAYMENT_TERMS_OPTIONS.find(p => p.value === customer?.payment_terms);

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [contactModal, setContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', name_ar: '', position: '', phone: '', email: '', notes: '' });

  // Statement
  const statement = useMemo(() => id ? generateCustomerStatement(id) : [], [id]);

  const fmtCurrency = (n: number) =>
    `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (!customer) {
    return (
      <CompanyLayout title={language === 'ar' ? 'بيانات العميل' : 'Customer Profile'}>
        <View style={styles.notFound}>
          <MaterialIcons name="person-off" size={52} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>{language === 'ar' ? 'العميل غير موجود' : 'Customer not found'}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{language === 'ar' ? 'عودة' : 'Go Back'}</Text>
          </Pressable>
        </View>
      </CompanyLayout>
    );
  }

  // Credit limit status
  const creditUsed = customer.credit_limit > 0 ? (customer.balance / customer.credit_limit) * 100 : 0;
  const availableCredit = Math.max(0, customer.credit_limit - customer.balance);
  const creditColor = creditUsed >= 100 ? Colors.danger : creditUsed >= 85 ? Colors.warning : Colors.success;

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) return;
    addContact({
      entity_type: 'customer', entity_id: customer.id,
      company_id: customer.company_id,
      name: contactForm.name, name_ar: contactForm.name_ar || undefined,
      position: contactForm.position || undefined,
      phone: contactForm.phone || undefined, email: contactForm.email || undefined,
      is_primary: contacts.length === 0,
      notes: contactForm.notes || undefined,
    });
    log({ action: 'create', module: 'customers', record_id: customer.id, record_type: 'customer_contact',
      new_data: { contact_name: contactForm.name } });
    setContactForm({ name: '', name_ar: '', position: '', phone: '', email: '', notes: '' });
    setContactModal(false);
  };

  const handleDeleteContact = (contact: Contact) => {
    if (contact.is_primary) {
      showAlert(language === 'ar' ? 'غير مسموح' : 'Not Allowed',
        language === 'ar' ? 'لا يمكن حذف جهة الاتصال الرئيسية' : 'Cannot delete primary contact');
      return;
    }
    showAlert(
      language === 'ar' ? 'حذف جهة الاتصال؟' : 'Delete Contact?',
      contact.name,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteContact(contact.id) },
      ]
    );
  };

  const TABS: { key: ProfileTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'dashboard' },
    { key: 'statement', labelAr: 'كشف الحساب', labelEn: 'Statement', icon: 'receipt-long' },
    { key: 'contacts', labelAr: 'جهات الاتصال', labelEn: 'Contacts', icon: 'contact-phone' },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? (customer.name_ar ?? customer.name) : customer.name}>
      <View style={styles.root}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
            <View style={[styles.headerAvatar, { backgroundColor: group ? `${group.color}20` : Colors.primaryLight }]}>
              <Text style={[styles.headerAvatarText, { color: group?.color ?? Colors.primary }]}>
                {(customer.name_ar ?? customer.name).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.headerNameRow, isRTL && styles.headerNameRowRTL]}>
                <Text style={[styles.headerName, isRTL && styles.textRTL]} numberOfLines={2}>
                  {language === 'ar' ? (customer.name_ar ?? customer.name) : customer.name}
                </Text>
                <View style={[styles.typeBadge]}>
                  <MaterialIcons name={customer.type === 'company' ? 'business' : 'person'} size={12} color={Colors.textSecondary} />
                  <Text style={styles.typeBadgeText}>{customer.type === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'فرد' : 'Individual')}</Text>
                </View>
              </View>
              <Text style={[styles.headerCode, isRTL && styles.textRTL]}>{customer.code}</Text>
              <View style={[styles.headerMeta, isRTL && styles.headerMetaRTL]}>
                {customer.phone ? (
                  <View style={styles.metaChip}>
                    <MaterialIcons name="phone" size={11} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{customer.phone}</Text>
                  </View>
                ) : null}
                {customer.email ? (
                  <View style={styles.metaChip}>
                    <MaterialIcons name="email" size={11} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{customer.email}</Text>
                  </View>
                ) : null}
                {group ? (
                  <View style={[styles.metaChip, { backgroundColor: `${group.color}15` }]}>
                    <Text style={[styles.metaChipText, { color: group.color }]}>{language === 'ar' ? (group.name_ar ?? group.name) : group.name}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Balance summary row */}
          <View style={styles.balanceRow}>
            <BalanceItem label={language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'} value={fmtCurrency(customer.total_sales)} color={Colors.primary} />
            <View style={styles.balanceDivider} />
            <BalanceItem label={language === 'ar' ? 'المدفوع' : 'Paid'} value={fmtCurrency(customer.total_paid)} color={Colors.success} />
            <View style={styles.balanceDivider} />
            <BalanceItem label={language === 'ar' ? 'المستحق' : 'Balance Due'} value={fmtCurrency(customer.balance)} color={customer.balance > 0 ? Colors.danger : Colors.success} highlight />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsBar}>
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

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' ? (
            <View style={styles.tabContent}>
              {/* Credit limit */}
              {customer.credit_limit > 0 ? (
                <View style={styles.sectionCard}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'الائتمان' : 'Credit'}</Text>
                  <View style={[styles.creditRow, isRTL && styles.creditRowRTL]}>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.creditLabelRow, isRTL && styles.creditLabelRowRTL]}>
                        <Text style={styles.creditLabel}>{language === 'ar' ? 'المستخدم' : 'Used'}</Text>
                        <Text style={[styles.creditPct, { color: creditColor }]}>{creditUsed.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.creditBar}>
                        <View style={[styles.creditBarFill, { width: `${Math.min(creditUsed, 100)}%`, backgroundColor: creditColor }]} />
                      </View>
                      <View style={[styles.creditInfoRow, isRTL && styles.creditInfoRowRTL]}>
                        <Text style={styles.creditInfo}>{language === 'ar' ? 'الحد: ' : 'Limit: '}<Text style={styles.creditInfoVal}>{fmtCurrency(customer.credit_limit)}</Text></Text>
                        <Text style={styles.creditInfo}>{language === 'ar' ? 'المتاح: ' : 'Available: '}<Text style={[styles.creditInfoVal, { color: availableCredit > 0 ? Colors.success : Colors.danger }]}>{fmtCurrency(availableCredit)}</Text></Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.behaviorRow, isRTL && styles.behaviorRowRTL]}>
                    <Text style={styles.behaviorLabel}>{language === 'ar' ? 'عند التجاوز:' : 'Over limit:'}</Text>
                    <View style={[styles.behaviorBadge, { backgroundColor: `${CREDIT_BEHAVIOR_OPTIONS_MAP[customer.credit_limit_behavior]}15` }]}>
                      <Text style={[styles.behaviorBadgeText, { color: CREDIT_BEHAVIOR_OPTIONS_MAP[customer.credit_limit_behavior] }]}>
                        {language === 'ar' ? CREDIT_BEHAVIOR_LABELS_AR[customer.credit_limit_behavior] : customer.credit_limit_behavior.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Financial summary */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'الملخص المالي' : 'Financial Summary'}</Text>
                <InfoRow labelAr="شروط الدفع" labelEn="Payment Terms" isRTL={isRTL} language={language}
                  value={language === 'ar' ? (paymentTermsLabel?.labelAr ?? '') : (paymentTermsLabel?.labelEn ?? '')} />
                <InfoRow labelAr="الرصيد الافتتاحي" labelEn="Opening Balance" isRTL={isRTL} language={language}
                  value={fmtCurrency(customer.opening_balance)} />
                <InfoRow labelAr="إجمالي المبيعات" labelEn="Total Sales" isRTL={isRTL} language={language}
                  value={fmtCurrency(customer.total_sales)} />
                <InfoRow labelAr="إجمالي المدفوعات" labelEn="Total Paid" isRTL={isRTL} language={language}
                  value={fmtCurrency(customer.total_paid)} />
                <InfoRow labelAr="إجمالي المرتجعات" labelEn="Total Returns" isRTL={isRTL} language={language}
                  value={fmtCurrency(customer.total_returns)} />
                <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                  <Text style={[styles.totalLabel, isRTL && styles.textRTL]}>{language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}</Text>
                  <Text style={[styles.totalValue, { color: customer.balance > 0 ? Colors.danger : Colors.success }]}>{fmtCurrency(customer.balance)}</Text>
                </View>
              </View>

              {/* Company info */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'معلومات التواصل' : 'Contact Info'}</Text>
                {customer.address ? <InfoRow labelAr="العنوان" labelEn="Address" isRTL={isRTL} language={language} value={customer.address} /> : null}
                {customer.city ? <InfoRow labelAr="المدينة" labelEn="City" isRTL={isRTL} language={language} value={customer.city} /> : null}
                {customer.commercial_reg ? <InfoRow labelAr="السجل التجاري" labelEn="Commercial Reg." isRTL={isRTL} language={language} value={customer.commercial_reg} /> : null}
                {customer.tax_number ? <InfoRow labelAr="الرقم الضريبي" labelEn="Tax Number" isRTL={isRTL} language={language} value={customer.tax_number} /> : null}
                {customer.civil_id ? <InfoRow labelAr="الرقم المدني" labelEn="Civil ID" isRTL={isRTL} language={language} value={customer.civil_id} /> : null}
              </View>

              {customer.notes ? (
                <View style={styles.sectionCard}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Text>
                  <Text style={[styles.notesText, isRTL && styles.textRTL]}>{customer.notes}</Text>
                </View>
              ) : null}

              {/* Accounting integration note */}
              <View style={[styles.accountingNote, isRTL && styles.accountingNoteRTL]}>
                <MaterialIcons name="account-balance" size={16} color={Colors.primary} />
                <Text style={[styles.accountingNoteText, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'ستظهر هنا تفاصيل حساب المدينين وقيود اليومية عند تفعيل محرك المحاسبة'
                    : 'Accounts Receivable details and journal entries will appear here when the Accounting Engine is activated'}
                </Text>
              </View>
            </View>
          ) : activeTab === 'statement' ? (
            <View style={styles.tabContent}>
              <View style={styles.sectionCard}>
                <View style={[styles.statementHeader, isRTL && styles.statementHeaderRTL]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'كشف الحساب' : 'Account Statement'}</Text>
                  {can('customers', 'export') ? (
                    <Pressable style={styles.exportBtn}>
                      <MaterialIcons name="file-download" size={14} color={Colors.primary} />
                      <Text style={styles.exportBtnText}>{language === 'ar' ? 'تصدير' : 'Export'}</Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* Statement table header */}
                <View style={[styles.stmtHeaderRow, isRTL && styles.stmtHeaderRowRTL]}>
                  <Text style={[styles.stmtColDate]}>{language === 'ar' ? 'التاريخ' : 'Date'}</Text>
                  <Text style={[styles.stmtColRef]}>{language === 'ar' ? 'المرجع' : 'Ref'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.danger }]}>{language === 'ar' ? 'مدين' : 'Debit'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.success }]}>{language === 'ar' ? 'دائن' : 'Credit'}</Text>
                  <Text style={[styles.stmtColBal]}>{language === 'ar' ? 'الرصيد' : 'Balance'}</Text>
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
                    <Text style={[styles.stmtColAmt, line.debit > 0 ? styles.stmtDebit : styles.stmtZero]}>
                      {line.debit > 0 ? line.debit.toFixed(3) : '-'}
                    </Text>
                    <Text style={[styles.stmtColAmt, line.credit > 0 ? styles.stmtCredit : styles.stmtZero]}>
                      {line.credit > 0 ? line.credit.toFixed(3) : '-'}
                    </Text>
                    <Text style={[styles.stmtColBal, line.balance > 0 && styles.stmtDebit]}>{line.balance.toFixed(3)}</Text>
                  </View>
                ))}

                {/* Totals */}
                <View style={[styles.stmtTotals, isRTL && styles.stmtTotalsRTL]}>
                  <Text style={styles.stmtTotalsLabel}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.danger, fontWeight: Typography.fontWeightBold }]}>
                    {statement.reduce((s, l) => s + l.debit, 0).toFixed(3)}
                  </Text>
                  <Text style={[styles.stmtColAmt, { color: Colors.success, fontWeight: Typography.fontWeightBold }]}>
                    {statement.reduce((s, l) => s + l.credit, 0).toFixed(3)}
                  </Text>
                  <Text style={[styles.stmtColBal, { color: Colors.danger, fontWeight: Typography.fontWeightBold }]}>
                    {customer.balance.toFixed(3)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <View style={[styles.contactsHeader, isRTL && styles.contactsHeaderRTL]}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? `جهات الاتصال (${contacts.length})` : `Contacts (${contacts.length})`}
                </Text>
                {can('customers', 'edit') ? (
                  <Pressable onPress={() => setContactModal(true)} style={styles.addContactBtn}>
                    <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                    <Text style={styles.addContactBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
                  </Pressable>
                ) : null}
              </View>

              {contacts.length === 0 ? (
                <View style={styles.empty}>
                  <MaterialIcons name="contact-phone" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد جهات اتصال' : 'No contacts added'}</Text>
                </View>
              ) : (
                contacts.map(contact => (
                  <View key={contact.id} style={[styles.contactCard, isRTL && styles.contactCardRTL]}>
                    <View style={[styles.contactAvatar, contact.is_primary && styles.contactAvatarPrimary]}>
                      <Text style={[styles.contactAvatarText, contact.is_primary && { color: Colors.primary }]}>
                        {(contact.name_ar ?? contact.name).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.contactNameRow, isRTL && styles.contactNameRowRTL]}>
                        <Text style={[styles.contactName, isRTL && styles.textRTL]}>
                          {language === 'ar' ? (contact.name_ar ?? contact.name) : contact.name}
                        </Text>
                        {contact.is_primary ? (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>{language === 'ar' ? 'رئيسي' : 'Primary'}</Text>
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
                    {!contact.is_primary && can('customers', 'edit') ? (
                      <Pressable onPress={() => handleDeleteContact(contact)} style={styles.deleteContactBtn} hitSlop={8}>
                        <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                      </Pressable>
                    ) : null}
                  </View>
                ))
              )}
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
                { key: 'notes', labelAr: 'ملاحظات', labelEn: 'Notes', multiline: true },
              ].map(field => (
                <View key={field.key} style={{ marginBottom: Spacing.md }}>
                  <Text style={[cStyles.label, isRTL && cStyles.labelRTL]}>
                    {language === 'ar' ? field.labelAr : field.labelEn}
                    {field.required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
                  </Text>
                  <TextInput
                    style={[cStyles.input, isRTL && cStyles.inputRTL, field.multiline && { minHeight: 60 }]}
                    value={(contactForm as any)[field.key]}
                    onChangeText={v => setContactForm(f => ({ ...f, [field.key]: v }))}
                    textAlign={isRTL ? 'right' : 'left'}
                    keyboardType={(field.type as any) ?? 'default'}
                    multiline={field.multiline}
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
              <Pressable onPress={handleSaveContact} style={cStyles.saveBtn}>
                <Text style={cStyles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </CompanyLayout>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const CREDIT_BEHAVIOR_OPTIONS_MAP: Record<string, string> = {
  allow: Colors.success, warn: Colors.warning,
  require_approval: Colors.info, block: Colors.danger,
};
const CREDIT_BEHAVIOR_LABELS_AR: Record<string, string> = {
  allow: 'السماح', warn: 'تحذير', require_approval: 'يحتاج موافقة', block: 'منع',
};

const BalanceItem = ({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={biStyles.label}>{label}</Text>
    <Text style={[biStyles.value, { color }, highlight && biStyles.highlight]}>{value}</Text>
  </View>
);
const biStyles = StyleSheet.create({
  label: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 3, includeFontPadding: false },
  value: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  highlight: { fontSize: Typography.fontSizeMD },
});

const InfoRow = ({ labelAr, labelEn, isRTL, language, value }: any) => (
  <View style={[irStyles.row, isRTL && irStyles.rowRTL]}>
    <Text style={irStyles.label}>{language === 'ar' ? labelAr : labelEn}</Text>
    <Text style={[irStyles.value, isRTL && irStyles.valueRTL]}>{value}</Text>
  </View>
);
const irStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rowRTL: { flexDirection: 'row-reverse' },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  value: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, flex: 1, textAlign: 'right', includeFontPadding: false },
  valueRTL: { textAlign: 'left' },
});

const cStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '80%', ...Shadow.lg },
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
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: Typography.fontSizeLG, color: Colors.textMuted, includeFontPadding: false },
  backBtn: { paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.primary },
  backBtnText: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  headerCard: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.base, ...Shadow.sm },
  headerTop: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  headerTopRTL: { flexDirection: 'row-reverse' },
  headerAvatar: { width: 54, height: 54, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  headerNameRowRTL: { flexDirection: 'row-reverse' },
  headerName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, flex: 1, includeFontPadding: false },
  headerCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  typeBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  headerMeta: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  headerMetaRTL: { flexDirection: 'row-reverse' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  metaChipText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  balanceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  balanceDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  tabsBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  tabContent: { padding: Spacing.base, gap: Spacing.base },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  creditRow: { flexDirection: 'row', gap: Spacing.md },
  creditRowRTL: { flexDirection: 'row-reverse' },
  creditLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  creditLabelRowRTL: { flexDirection: 'row-reverse' },
  creditLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  creditPct: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  creditBar: { height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden', marginBottom: 8 },
  creditBarFill: { height: '100%', borderRadius: 4 },
  creditInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  creditInfoRowRTL: { flexDirection: 'row-reverse' },
  creditInfo: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  creditInfoVal: { fontWeight: Typography.fontWeightSemibold, color: Colors.text },
  behaviorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  behaviorRowRTL: { flexDirection: 'row-reverse' },
  behaviorLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  behaviorBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  behaviorBadgeText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: 1.5, borderTopColor: Colors.border },
  totalRowRTL: { flexDirection: 'row-reverse' },
  totalLabel: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  totalValue: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  notesText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  accountingNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  accountingNoteRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.primary },
  accountingNoteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20, includeFontPadding: false },
  // Statement
  statementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  statementHeaderRTL: { flexDirection: 'row-reverse' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary },
  exportBtnText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
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
  // Contacts
  contactsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  contactsHeaderRTL: { flexDirection: 'row-reverse' },
  addContactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.primary },
  addContactBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  contactCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.sm, ...Shadow.sm },
  contactCardRTL: { flexDirection: 'row-reverse' },
  contactAvatar: { width: 40, height: 40, borderRadius: Radius.xl, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  contactAvatarPrimary: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  contactAvatarText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textSecondary, includeFontPadding: false },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactNameRowRTL: { flexDirection: 'row-reverse' },
  contactName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  contactPosition: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  contactMetaRTL: { flexDirection: 'row-reverse' },
  contactMetaText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  primaryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  primaryBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  deleteContactBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  textRTL: { textAlign: 'right' },
});
