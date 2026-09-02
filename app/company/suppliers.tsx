// Suppliers List — Full-featured supplier management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useCustomers } from '../../contexts/CustomersContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { SupplierFull, SupplierStatus, PAYMENT_TERMS_OPTIONS } from '../../types/customers';
import { useAlert } from '@/template';

const STATUS_CONFIG: Record<SupplierStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  active: { labelEn: 'Active', labelAr: 'نشط', color: Colors.success, bg: Colors.successLight },
  inactive: { labelEn: 'Inactive', labelAr: 'غير نشط', color: Colors.textMuted, bg: Colors.background },
  blocked: { labelEn: 'Blocked', labelAr: 'محظور', color: Colors.danger, bg: Colors.dangerLight },
};

const COUNTRY_FLAGS: Record<string, string> = {
  KW: '🇰🇼', SA: '🇸🇦', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', EG: '🇪🇬',
};

type SupplierForm = {
  name: string; name_ar: string; type: 'individual' | 'company';
  status: SupplierStatus;
  phone: string; phone_alt: string; email: string;
  address: string; city: string; country: string;
  tax_number: string; commercial_reg: string;
  credit_limit: string; payment_terms: string;
  opening_balance: string; notes: string;
};

const EMPTY_FORM: SupplierForm = {
  name: '', name_ar: '', type: 'company', status: 'active',
  phone: '', phone_alt: '', email: '', address: '', city: '', country: 'KW',
  tax_number: '', commercial_reg: '',
  credit_limit: '0', payment_terms: 'cash',
  opening_balance: '0', notes: '',
};

export default function Suppliers() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const { suppliers, addSupplier, updateSupplier, archiveSupplier } = useCustomers();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SupplierStatus>('all');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierFull | null>(null);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [formTab, setFormTab] = useState<'basic' | 'contact' | 'financial'>('basic');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'purchases'>('name');

  const filtered = useMemo(() => {
    let result = suppliers.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.name_ar ?? '').includes(search) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone ?? '').includes(search) ||
        (s.email ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchType = filterType === 'all' || s.type === filterType;
      const matchCountry = filterCountry === 'all' || s.country === filterCountry;
      return matchSearch && matchStatus && matchType && matchCountry;
    });
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'balance') result.sort((a, b) => b.balance - a.balance);
    else result.sort((a, b) => b.total_purchases - a.total_purchases);
    return result;
  }, [suppliers, search, filterStatus, filterType, filterCountry, sortBy]);

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    totalPayable: suppliers.reduce((s, sup) => s + sup.balance, 0),
    totalPurchases: suppliers.reduce((s, sup) => s + sup.total_purchases, 0),
  }), [suppliers]);

  const countries = useMemo(() => {
    const c = new Set(suppliers.map(s => s.country));
    return Array.from(c);
  }, [suppliers]);

  const openAdd = () => {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setFormTab('basic');
    setModalVisible(true);
  };

  const openEdit = (s: SupplierFull) => {
    setEditingSupplier(s);
    setForm({
      name: s.name, name_ar: s.name_ar ?? '', type: s.type,
      status: s.status,
      phone: s.phone ?? '', phone_alt: s.phone_alt ?? '',
      email: s.email ?? '', address: s.address ?? '',
      city: s.city ?? '', country: s.country ?? 'KW',
      tax_number: s.tax_number ?? '', commercial_reg: s.commercial_reg ?? '',
      credit_limit: String(s.credit_limit),
      payment_terms: s.payment_terms,
      opening_balance: String(s.opening_balance),
      notes: s.notes ?? '',
    });
    setFormTab('basic');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showAlert(language === 'ar' ? 'حقل مطلوب' : 'Required', language === 'ar' ? 'يرجى إدخال اسم المورد' : 'Supplier name is required');
      return;
    }
    const payload = {
      company_id: 'company-001', name: form.name, name_ar: form.name_ar || undefined,
      type: form.type, status: form.status,
      phone: form.phone || undefined, phone_alt: form.phone_alt || undefined,
      email: form.email || undefined, address: form.address || undefined,
      city: form.city || undefined, country: form.country || 'KW',
      tax_number: form.tax_number || undefined, commercial_reg: form.commercial_reg || undefined,
      credit_limit: parseFloat(form.credit_limit) || 0,
      payment_terms: form.payment_terms as any,
      opening_balance: parseFloat(form.opening_balance) || 0,
      notes: form.notes || undefined, is_active: form.status === 'active',
      created_by: 'user-002',
    };
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, payload);
      log({ action: 'update', module: 'suppliers', record_id: editingSupplier.id, record_type: 'supplier',
        previous_data: { name: editingSupplier.name }, new_data: { name: form.name } });
    } else {
      const ns = addSupplier(payload);
      log({ action: 'create', module: 'suppliers', record_id: ns.id, record_type: 'supplier',
        new_data: { name: form.name, code: ns.code } });
    }
    setModalVisible(false);
  };

  const fmtCurrency = (n: number) => `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;

  const renderItem = ({ item }: { item: SupplierFull }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    const initial = (item.name_ar ?? item.name).charAt(0).toUpperCase();
    const flag = COUNTRY_FLAGS[item.country] ?? '🌍';
    const paymentTerms = PAYMENT_TERMS_OPTIONS.find(p => p.value === item.payment_terms);

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/company/supplier-profile', params: { id: item.id } } as any)}
        style={({ pressed }) => [styles.card, isRTL && styles.cardRTL, pressed && { opacity: 0.92 }]}
      >
        {/* Avatar */}
        <View style={[styles.avatar, item.type === 'company' ? styles.avatarCompany : styles.avatarIndividual]}>
          <Text style={[styles.avatarText, item.type === 'company' ? styles.avatarTextCompany : styles.avatarTextIndividual]}>
            {initial}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
            <Text style={[styles.supplierName, isRTL && styles.textRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.name_ar ?? item.name) : item.name}
            </Text>
            <Text style={styles.flag}>{flag}</Text>
          </View>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <Text style={styles.code}>{item.code}</Text>
            {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
            {paymentTerms ? (
              <View style={styles.termBadge}>
                <Text style={styles.termBadgeText}>{language === 'ar' ? paymentTerms.labelAr : paymentTerms.labelEn}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.statsRow, isRTL && styles.statsRowRTL]}>
            <Text style={styles.statItem}>
              {language === 'ar' ? 'مشتريات: ' : 'Purchases: '}
              <Text style={[styles.statValue, { color: Colors.primary }]}>{fmtCurrency(item.total_purchases)}</Text>
            </Text>
          </View>
        </View>

        {/* Right */}
        <View style={[styles.rightCol, isRTL && styles.rightColRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
            </Text>
          </View>
          {item.balance > 0 ? (
            <Text style={[styles.balance, isRTL && styles.textRTL]}>{fmtCurrency(item.balance)}</Text>
          ) : (
            <Text style={[styles.balanceZero, isRTL && styles.textRTL]}>{fmtCurrency(0)}</Text>
          )}
          {can('suppliers', 'edit') ? (
            <Pressable onPress={() => openEdit(item)} style={styles.editBtn} hitSlop={6}>
              <MaterialIcons name="edit" size={14} color={Colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const FORM_TABS = [
    { key: 'basic', labelAr: 'الأساسي', labelEn: 'Basic', icon: 'business' },
    { key: 'contact', labelAr: 'التواصل', labelEn: 'Contact', icon: 'contact-phone' },
    { key: 'financial', labelAr: 'المالي', labelEn: 'Financial', icon: 'account-balance-wallet' },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? 'الموردون' : 'Suppliers'}>
      <PermissionGuard module="suppliers" action="view">
        <View style={styles.root}>
          {/* Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statsHeaderRow}>
              <StatPill icon="local-shipping" label={language === 'ar' ? 'إجمالي' : 'Total'} value={String(stats.total)} color={Colors.primary} />
              <StatPill icon="check-circle" label={language === 'ar' ? 'نشط' : 'Active'} value={String(stats.active)} color={Colors.success} />
              <StatPill icon="account-balance-wallet" label={language === 'ar' ? 'الذمم الدائنة' : 'Payables'} value={fmtCurrency(stats.totalPayable)} color={Colors.danger} />
              <StatPill icon="shopping-cart" label={language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'} value={fmtCurrency(stats.totalPurchases)} color={Colors.accent} />
            </View>
          </ScrollView>

          {/* Search + Add */}
          <View style={[styles.toolbar, isRTL && styles.toolbarRTL]}>
            <View style={[styles.searchBox, isRTL && styles.searchBoxRTL]}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchInput, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'اسم، كود، هاتف...' : 'Name, code, phone...'}
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                textAlign={isRTL ? 'right' : 'left'}
              />
              {search ? <Pressable onPress={() => setSearch('')}><MaterialIcons name="close" size={16} color={Colors.textMuted} /></Pressable> : null}
            </View>
            {can('suppliers', 'create') ? (
              <Pressable onPress={openAdd} style={styles.addBtn}>
                <MaterialIcons name="add-business" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {(['all', 'active', 'inactive', 'blocked'] as const).map(s => (
                <Pressable key={s} onPress={() => setFilterStatus(s)} style={[styles.chip, filterStatus === s && styles.chipActive]}>
                  <Text style={[styles.chipText, filterStatus === s && styles.chipTextActive]}>
                    {s === 'all' ? (language === 'ar' ? 'الكل' : 'All') :
                      language === 'ar' ? STATUS_CONFIG[s].labelAr : STATUS_CONFIG[s].labelEn}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.filterDivider} />
              {(['all', 'company', 'individual'] as const).map(t => (
                <Pressable key={t} onPress={() => setFilterType(t)} style={[styles.chip, filterType === t && styles.chipActive]}>
                  <MaterialIcons name={t === 'all' ? 'filter-list' : t === 'company' ? 'business' : 'person'} size={12} color={filterType === t ? Colors.textInverse : Colors.textSecondary} />
                  <Text style={[styles.chipText, filterType === t && styles.chipTextActive]}>
                    {t === 'all' ? (language === 'ar' ? 'كل الأنواع' : 'All Types') :
                      t === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'فرد' : 'Individual')}
                  </Text>
                </Pressable>
              ))}
              {countries.length > 1 ? (
                <>
                  <View style={styles.filterDivider} />
                  <Pressable onPress={() => setFilterCountry('all')} style={[styles.chip, filterCountry === 'all' && styles.chipActive]}>
                    <Text style={[styles.chipText, filterCountry === 'all' && styles.chipTextActive]}>{language === 'ar' ? 'كل الدول' : 'All Countries'}</Text>
                  </Pressable>
                  {countries.map(c => (
                    <Pressable key={c} onPress={() => setFilterCountry(filterCountry === c ? 'all' : c)}
                      style={[styles.chip, filterCountry === c && styles.chipActive]}>
                      <Text style={[styles.chipText, filterCountry === c && styles.chipTextActive]}>{COUNTRY_FLAGS[c] ?? c} {c}</Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </View>
          </ScrollView>

          {/* Sort + Count */}
          <View style={[styles.sortRow, isRTL && styles.sortRowRTL]}>
            <Text style={styles.countText}>{language === 'ar' ? `${filtered.length} مورد` : `${filtered.length} suppliers`}</Text>
            <View style={[styles.sortBtns, isRTL && styles.sortBtnsRTL]}>
              {(['name', 'balance', 'purchases'] as const).map(s => (
                <Pressable key={s} onPress={() => setSortBy(s)} style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}>
                  <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                    {s === 'name' ? (language === 'ar' ? 'الاسم' : 'Name') :
                      s === 'balance' ? (language === 'ar' ? 'الرصيد' : 'Balance') : (language === 'ar' ? 'المشتريات' : 'Purchases')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="local-shipping" size={52} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{language === 'ar' ? 'لا توجد نتائج' : 'No suppliers found'}</Text>
              </View>
            }
          />
        </View>
      </PermissionGuard>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setModalVisible(false)} />
          <View style={[mStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[mStyles.header, isRTL && mStyles.headerRTL]}>
              <Text style={mStyles.title}>{editingSupplier ? (language === 'ar' ? 'تعديل المورد' : 'Edit Supplier') : (language === 'ar' ? 'مورد جديد' : 'New Supplier')}</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <View style={mStyles.tabs}>
              {FORM_TABS.map(t => (
                <Pressable key={t.key} onPress={() => setFormTab(t.key as any)} style={[mStyles.tab, formTab === t.key && mStyles.tabActive]}>
                  <MaterialIcons name={t.icon as any} size={14} color={formTab === t.key ? Colors.primary : Colors.textMuted} />
                  <Text style={[mStyles.tabText, formTab === t.key && mStyles.tabTextActive]}>{language === 'ar' ? t.labelAr : t.labelEn}</Text>
                </Pressable>
              ))}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
              {formTab === 'basic' ? (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'نوع المورد' : 'Supplier Type'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['company', 'individual'] as const).map(t => (
                        <Pressable key={t} onPress={() => setForm(f => ({ ...f, type: t }))}
                          style={[mStyles.typeBtn, form.type === t && mStyles.typeBtnActive]}>
                          <MaterialIcons name={t === 'company' ? 'business' : 'person'} size={18} color={form.type === t ? Colors.primary : Colors.textMuted} />
                          <Text style={[mStyles.typeBtnText, form.type === t && mStyles.typeBtnTextActive]}>
                            {t === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'فرد' : 'Individual')}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <MF label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.name_ar} onChange={(v: string) => setForm(f => ({ ...f, name_ar: v }))} isRTL={isRTL} />
                  <MF label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} isRTL={isRTL} required />
                  {form.type === 'company' ? (
                    <MF label={language === 'ar' ? 'السجل التجاري' : 'Commercial Reg.'} value={form.commercial_reg} onChange={(v: string) => setForm(f => ({ ...f, commercial_reg: v }))} isRTL={isRTL} />
                  ) : null}
                  <MF label={language === 'ar' ? 'الرقم الضريبي' : 'Tax Number'} value={form.tax_number} onChange={(v: string) => setForm(f => ({ ...f, tax_number: v }))} isRTL={isRTL} />
                  <MF label={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes} onChange={(v: string) => setForm(f => ({ ...f, notes: v }))} isRTL={isRTL} multiline />
                </View>
              ) : formTab === 'contact' ? (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  <MF label={language === 'ar' ? 'الهاتف' : 'Phone'} value={form.phone} onChange={(v: string) => setForm(f => ({ ...f, phone: v }))} isRTL={isRTL} keyboardType="phone-pad" />
                  <MF label={language === 'ar' ? 'هاتف بديل' : 'Alt. Phone'} value={form.phone_alt} onChange={(v: string) => setForm(f => ({ ...f, phone_alt: v }))} isRTL={isRTL} keyboardType="phone-pad" />
                  <MF label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={(v: string) => setForm(f => ({ ...f, email: v }))} isRTL={isRTL} keyboardType="email-address" />
                  <MF label={language === 'ar' ? 'العنوان' : 'Address'} value={form.address} onChange={(v: string) => setForm(f => ({ ...f, address: v }))} isRTL={isRTL} multiline />
                  <MF label={language === 'ar' ? 'المدينة' : 'City'} value={form.city} onChange={(v: string) => setForm(f => ({ ...f, city: v }))} isRTL={isRTL} />
                  <MF label={language === 'ar' ? 'رمز الدولة' : 'Country Code'} value={form.country} onChange={(v: string) => setForm(f => ({ ...f, country: v.toUpperCase() }))} isRTL={isRTL} />
                </View>
              ) : (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  <MF label={language === 'ar' ? 'الرصيد الافتتاحي (KWD)' : 'Opening Balance (KWD)'} value={form.opening_balance} onChange={(v: string) => setForm(f => ({ ...f, opening_balance: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                  <MF label={language === 'ar' ? 'حد الائتمان (KWD)' : 'Credit Limit (KWD)'} value={form.credit_limit} onChange={(v: string) => setForm(f => ({ ...f, credit_limit: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {PAYMENT_TERMS_OPTIONS.map(opt => (
                        <Pressable key={opt.value} onPress={() => setForm(f => ({ ...f, payment_terms: opt.value }))}
                          style={[mStyles.termBtn, form.payment_terms === opt.value && mStyles.termBtnActive]}>
                          <Text style={[mStyles.termBtnText, form.payment_terms === opt.value && mStyles.termBtnTextActive]}>
                            {language === 'ar' ? opt.labelAr : opt.labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
            <View style={[mStyles.footer, isRTL && mStyles.footerRTL]}>
              <Pressable onPress={() => setModalVisible(false)} style={mStyles.cancelBtn}>
                <Text style={mStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={mStyles.saveBtn}>
                <Text style={mStyles.saveText}>{language === 'ar' ? 'حفظ المورد' : 'Save Supplier'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

const StatPill = ({ icon, label, value, color }: any) => (
  <View style={[spStyles.pill, { borderColor: `${color}30` }]}>
    <View style={[spStyles.iconBg, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={16} color={color} />
    </View>
    <View>
      <Text style={spStyles.label}>{label}</Text>
      <Text style={[spStyles.value, { color }]}>{value}</Text>
    </View>
  </View>
);
const spStyles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.sm },
  iconBg: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  value: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
});

const MF = ({ label, value, onChange, isRTL, required, keyboardType, multiline }: any) => (
  <View>
    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{label}{required ? <Text style={{ color: Colors.danger }}> *</Text> : null}</Text>
    <TextInput
      style={[mStyles.input, isRTL && mStyles.inputRTL, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
      value={value} onChangeText={onChange}
      placeholderTextColor={Colors.textMuted}
      textAlign={isRTL ? 'right' : 'left'}
      keyboardType={keyboardType ?? 'default'}
      multiline={multiline} autoCapitalize="none"
    />
  </View>
);

const mStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '92%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, backgroundColor: Colors.surface, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  typeBtnTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  termBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  termBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  termBtnTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
  footerRTL: { flexDirection: 'row-reverse' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  cancelText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  statsHeaderRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base },
  toolbar: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  toolbarRTL: { flexDirection: 'row-reverse' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, borderWidth: 1.5, borderColor: Colors.border },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  chipTextActive: { color: Colors.textInverse },
  filterDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  sortRowRTL: { flexDirection: 'row-reverse' },
  countText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  sortBtns: { flexDirection: 'row', gap: 4 },
  sortBtnsRTL: { flexDirection: 'row-reverse' },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortBtnText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  sortBtnTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  cardRTL: { flexDirection: 'row-reverse' },
  avatar: { width: 44, height: 44, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  avatarCompany: { backgroundColor: `${Colors.accent}20` },
  avatarIndividual: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  avatarText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  avatarTextCompany: { color: Colors.accent },
  avatarTextIndividual: { color: Colors.textSecondary },
  flag: { fontSize: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  nameRowRTL: { flexDirection: 'row-reverse' },
  supplierName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, flex: 1, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  code: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  meta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  termBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.accentLight },
  termBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.accent, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  statsRow: { flexDirection: 'row', marginTop: 6 },
  statsRowRTL: { flexDirection: 'row-reverse' },
  statItem: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  statValue: { fontWeight: Typography.fontWeightSemibold },
  rightCol: { alignItems: 'flex-end', gap: 5 },
  rightColRTL: { alignItems: 'flex-start' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  balance: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.danger, includeFontPadding: false },
  balanceZero: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  editBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
