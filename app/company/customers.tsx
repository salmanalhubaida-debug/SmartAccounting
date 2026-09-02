// Customers List — Full-featured customer management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Switch,
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
import { useCompany } from '../../contexts/CompanyContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { CustomerFull, CustomerStatus, PAYMENT_TERMS_OPTIONS, CREDIT_BEHAVIOR_OPTIONS } from '../../types/customers';
import { useAlert } from '@/template';

const STATUS_CONFIG: Record<CustomerStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  active: { labelEn: 'Active', labelAr: 'نشط', color: Colors.success, bg: Colors.successLight },
  inactive: { labelEn: 'Inactive', labelAr: 'غير نشط', color: Colors.textMuted, bg: Colors.background },
  blocked: { labelEn: 'Blocked', labelAr: 'محظور', color: Colors.danger, bg: Colors.dangerLight },
};

type CustomerForm = {
  name: string; name_ar: string; type: 'individual' | 'company';
  status: CustomerStatus; group_id: string;
  phone: string; phone_alt: string; email: string;
  address: string; city: string; country: string;
  tax_number: string; civil_id: string; commercial_reg: string;
  credit_limit: string; credit_limit_behavior: string;
  payment_terms: string; opening_balance: string; notes: string;
};

const EMPTY_FORM: CustomerForm = {
  name: '', name_ar: '', type: 'company', status: 'active', group_id: '',
  phone: '', phone_alt: '', email: '', address: '', city: '', country: 'KW',
  tax_number: '', civil_id: '', commercial_reg: '',
  credit_limit: '0', credit_limit_behavior: 'warn',
  payment_terms: 'cash', opening_balance: '0', notes: '',
};

export default function Customers() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const { customers, groups, addCustomer, updateCustomer, archiveCustomer, deleteCustomer } = useCustomers();
  const { branches } = useCompany();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | CustomerStatus>('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFull | null>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [formTab, setFormTab] = useState<'basic' | 'contact' | 'financial'>('basic');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'date'>('name');

  const filtered = useMemo(() => {
    let result = customers.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.name_ar ?? '').includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone ?? '').includes(search) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchGroup = filterGroup === 'all' || c.group_id === filterGroup;
      const matchType = filterType === 'all' || c.type === filterType;
      return matchSearch && matchStatus && matchGroup && matchType;
    });
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'balance') result.sort((a, b) => b.balance - a.balance);
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [customers, search, filterStatus, filterGroup, filterType, sortBy]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalReceivable: customers.reduce((s, c) => s + c.balance, 0),
    totalSales: customers.reduce((s, c) => s + c.total_sales, 0),
  }), [customers]);

  const openAdd = () => {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setFormTab('basic');
    setModalVisible(true);
  };

  const openEdit = (c: CustomerFull) => {
    setEditingCustomer(c);
    setForm({
      name: c.name, name_ar: c.name_ar ?? '', type: c.type,
      status: c.status, group_id: c.group_id ?? '',
      phone: c.phone ?? '', phone_alt: c.phone_alt ?? '',
      email: c.email ?? '', address: c.address ?? '',
      city: c.city ?? '', country: c.country ?? 'KW',
      tax_number: c.tax_number ?? '', civil_id: c.civil_id ?? '',
      commercial_reg: c.commercial_reg ?? '',
      credit_limit: String(c.credit_limit),
      credit_limit_behavior: c.credit_limit_behavior,
      payment_terms: c.payment_terms,
      opening_balance: String(c.opening_balance),
      notes: c.notes ?? '',
    });
    setFormTab('basic');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showAlert(language === 'ar' ? 'حقل مطلوب' : 'Required', language === 'ar' ? 'يرجى إدخال اسم العميل' : 'Customer name is required');
      return;
    }
    const payload = {
      company_id: 'company-001', name: form.name, name_ar: form.name_ar || undefined,
      type: form.type, status: form.status, group_id: form.group_id || undefined,
      phone: form.phone || undefined, phone_alt: form.phone_alt || undefined,
      email: form.email || undefined, address: form.address || undefined,
      city: form.city || undefined, country: form.country || 'KW',
      tax_number: form.tax_number || undefined, civil_id: form.civil_id || undefined,
      commercial_reg: form.commercial_reg || undefined,
      credit_limit: parseFloat(form.credit_limit) || 0,
      credit_limit_behavior: form.credit_limit_behavior as any,
      payment_terms: form.payment_terms as any, opening_balance: parseFloat(form.opening_balance) || 0,
      notes: form.notes || undefined, is_active: form.status === 'active',
      created_by: 'user-002',
    };
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, payload);
      log({ action: 'update', module: 'customers', record_id: editingCustomer.id, record_type: 'customer',
        previous_data: { name: editingCustomer.name, status: editingCustomer.status },
        new_data: { name: form.name, status: form.status } });
    } else {
      const nc = addCustomer(payload);
      log({ action: 'create', module: 'customers', record_id: nc.id, record_type: 'customer',
        new_data: { name: form.name, code: nc.code } });
    }
    setModalVisible(false);
  };

  const handleArchive = (c: CustomerFull) => {
    showAlert(
      language === 'ar' ? 'أرشفة العميل؟' : 'Archive Customer?',
      language === 'ar' ? `سيتم تعيين "${c.name_ar ?? c.name}" كغير نشط` : `"${c.name}" will be set to inactive`,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'أرشفة' : 'Archive', style: 'destructive', onPress: () => {
          archiveCustomer(c.id);
          log({ action: 'update', module: 'customers', record_id: c.id, record_type: 'customer',
            previous_data: { status: c.status }, new_data: { status: 'inactive' } });
        }},
      ]
    );
  };

  const fmtCurrency = (n: number) => `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;

  const renderItem = ({ item }: { item: CustomerFull }) => {
    const group = groups.find(g => g.id === item.group_id);
    const statusCfg = STATUS_CONFIG[item.status];
    const initial = (item.name_ar ?? item.name).charAt(0).toUpperCase();
    const hasBalance = item.balance > 0;

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/company/customer-profile', params: { id: item.id } } as any)}
        style={({ pressed }) => [styles.card, isRTL && styles.cardRTL, pressed && { opacity: 0.92 }]}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: group ? `${group.color}20` : Colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: group?.color ?? Colors.primary }]}>{initial}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
            <Text style={[styles.customerName, isRTL && styles.textRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.name_ar ?? item.name) : item.name}
            </Text>
            {item.type === 'company' ? (
              <MaterialIcons name="business" size={12} color={Colors.textMuted} />
            ) : (
              <MaterialIcons name="person" size={12} color={Colors.textMuted} />
            )}
          </View>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <Text style={styles.code}>{item.code}</Text>
            {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
            {group ? (
              <View style={[styles.groupBadge, { backgroundColor: `${group.color}15` }]}>
                <Text style={[styles.groupBadgeText, { color: group.color }]}>
                  {language === 'ar' ? (group.name_ar ?? group.name) : group.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Right side */}
        <View style={[styles.rightCol, isRTL && styles.rightColRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
            </Text>
          </View>
          {hasBalance ? (
            <Text style={[styles.balance, isRTL && styles.textRTL]}>{fmtCurrency(item.balance)}</Text>
          ) : (
            <Text style={[styles.balanceZero, isRTL && styles.textRTL]}>{fmtCurrency(0)}</Text>
          )}
          {can('customers', 'edit') ? (
            <Pressable onPress={() => openEdit(item)} style={styles.editBtn} hitSlop={6}>
              <MaterialIcons name="edit" size={14} color={Colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'العملاء' : 'Customers'}>
      <PermissionGuard module="customers" action="view">
        <View style={styles.root}>
          {/* Stats Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statsRow}>
              <StatPill icon="people" label={language === 'ar' ? 'إجمالي' : 'Total'} value={String(stats.total)} color={Colors.primary} />
              <StatPill icon="check-circle" label={language === 'ar' ? 'نشط' : 'Active'} value={String(stats.active)} color={Colors.success} />
              <StatPill icon="account-balance-wallet" label={language === 'ar' ? 'المديونيات' : 'Receivables'} value={fmtCurrency(stats.totalReceivable)} color={Colors.warning} />
              <StatPill icon="trending-up" label={language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'} value={fmtCurrency(stats.totalSales)} color={Colors.accent} />
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
            {can('customers', 'create') ? (
              <Pressable onPress={openAdd} style={styles.addBtn}>
                <MaterialIcons name="person-add" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {/* Status */}
              {(['all', 'active', 'inactive', 'blocked'] as const).map(s => (
                <Pressable key={s} onPress={() => setFilterStatus(s)} style={[styles.chip, filterStatus === s && styles.chipActive]}>
                  <Text style={[styles.chipText, filterStatus === s && styles.chipTextActive]}>
                    {s === 'all' ? (language === 'ar' ? 'الكل' : 'All') :
                      language === 'ar' ? STATUS_CONFIG[s].labelAr : STATUS_CONFIG[s].labelEn}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.filterDivider} />
              {/* Type */}
              {(['all', 'company', 'individual'] as const).map(t => (
                <Pressable key={t} onPress={() => setFilterType(t)} style={[styles.chip, filterType === t && styles.chipActive]}>
                  <MaterialIcons
                    name={t === 'all' ? 'filter-list' : t === 'company' ? 'business' : 'person'}
                    size={12} color={filterType === t ? Colors.textInverse : Colors.textSecondary}
                  />
                  <Text style={[styles.chipText, filterType === t && styles.chipTextActive]}>
                    {t === 'all' ? (language === 'ar' ? 'كل الأنواع' : 'All Types') :
                      t === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'فرد' : 'Individual')}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.filterDivider} />
              {/* Groups */}
              {groups.map(g => (
                <Pressable key={g.id} onPress={() => setFilterGroup(filterGroup === g.id ? 'all' : g.id)}
                  style={[styles.chip, filterGroup === g.id && { backgroundColor: g.color, borderColor: g.color }]}>
                  <View style={[styles.groupDot, { backgroundColor: g.color }]} />
                  <Text style={[styles.chipText, filterGroup === g.id && styles.chipTextActive]}>
                    {language === 'ar' ? (g.name_ar ?? g.name) : g.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Sort + Count */}
          <View style={[styles.sortRow, isRTL && styles.sortRowRTL]}>
            <Text style={styles.countText}>
              {language === 'ar' ? `${filtered.length} عميل` : `${filtered.length} customers`}
            </Text>
            <View style={[styles.sortBtns, isRTL && styles.sortBtnsRTL]}>
              {(['name', 'balance', 'date'] as const).map(s => (
                <Pressable key={s} onPress={() => setSortBy(s)} style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}>
                  <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                    {s === 'name' ? (language === 'ar' ? 'الاسم' : 'Name') :
                      s === 'balance' ? (language === 'ar' ? 'الرصيد' : 'Balance') : (language === 'ar' ? 'التاريخ' : 'Date')}
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
                <MaterialIcons name="people-outline" size={52} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{language === 'ar' ? 'لا توجد نتائج' : 'No customers found'}</Text>
                <Text style={styles.emptyDesc}>{language === 'ar' ? 'جرّب تعديل فلاتر البحث' : 'Try adjusting your search filters'}</Text>
              </View>
            }
          />
        </View>
      </PermissionGuard>

      {/* Add/Edit Modal */}
      <CustomerFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        form={form}
        setForm={setForm}
        formTab={formTab}
        setFormTab={setFormTab}
        editing={editingCustomer}
        onSave={handleSave}
        groups={groups}
        insets={insets}
        language={language}
        isRTL={isRTL}
      />
    </CompanyLayout>
  );
}

// ─── STATS PILL ──────────────────────────────────────────────────────────────
const StatPill = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <View style={[spStyles.pill, { borderColor: `${color}30` }]}>
    <View style={[spStyles.iconBg, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon as any} size={16} color={color} />
    </View>
    <View>
      <Text style={spStyles.label}>{label}</Text>
      <Text style={[spStyles.value, { color }]}>{value}</Text>
    </View>
  </View>
);
const spStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.sm,
  },
  iconBg: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  value: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
});

// ─── FORM MODAL ──────────────────────────────────────────────────────────────
const CustomerFormModal = ({
  visible, onClose, form, setForm, formTab, setFormTab, editing, onSave, groups, insets, language, isRTL
}: any) => {
  const TABS = [
    { key: 'basic', labelAr: 'الأساسي', labelEn: 'Basic', icon: 'person' },
    { key: 'contact', labelAr: 'التواصل', labelEn: 'Contact', icon: 'contact-phone' },
    { key: 'financial', labelAr: 'المالي', labelEn: 'Financial', icon: 'account-balance-wallet' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} />
        <View style={[mStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          {/* Header */}
          <View style={[mStyles.header, isRTL && mStyles.headerRTL]}>
            <Text style={mStyles.title}>{editing ? (language === 'ar' ? 'تعديل العميل' : 'Edit Customer') : (language === 'ar' ? 'عميل جديد' : 'New Customer')}</Text>
            <Pressable onPress={onClose} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
          </View>
          {/* Tabs */}
          <View style={mStyles.tabs}>
            {TABS.map(t => (
              <Pressable key={t.key} onPress={() => setFormTab(t.key)} style={[mStyles.tab, formTab === t.key && mStyles.tabActive]}>
                <MaterialIcons name={t.icon as any} size={14} color={formTab === t.key ? Colors.primary : Colors.textMuted} />
                <Text style={[mStyles.tabText, formTab === t.key && mStyles.tabTextActive]}>
                  {language === 'ar' ? t.labelAr : t.labelEn}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
            {formTab === 'basic' ? (
              <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                {/* Type selector */}
                <View>
                  <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'نوع العميل' : 'Customer Type'}</Text>
                  <View style={mStyles.typeRow}>
                    {(['company', 'individual'] as const).map(t => (
                      <Pressable key={t} onPress={() => setForm((f: CustomerForm) => ({ ...f, type: t }))}
                        style={[mStyles.typeBtn, form.type === t && mStyles.typeBtnActive]}>
                        <MaterialIcons name={t === 'company' ? 'business' : 'person'} size={18} color={form.type === t ? Colors.primary : Colors.textMuted} />
                        <Text style={[mStyles.typeBtnText, form.type === t && mStyles.typeBtnTextActive]}>
                          {t === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'فرد' : 'Individual')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <MF label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.name_ar} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, name_ar: v }))} isRTL={isRTL} />
                <MF label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} value={form.name} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, name: v }))} isRTL={isRTL} required />
                {form.type === 'company' ? (
                  <MF label={language === 'ar' ? 'السجل التجاري' : 'Commercial Reg.'} value={form.commercial_reg} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, commercial_reg: v }))} isRTL={isRTL} />
                ) : (
                  <MF label={language === 'ar' ? 'الرقم المدني' : 'Civil ID'} value={form.civil_id} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, civil_id: v }))} isRTL={isRTL} />
                )}
                <MF label={language === 'ar' ? 'الرقم الضريبي' : 'Tax Number'} value={form.tax_number} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, tax_number: v }))} isRTL={isRTL} />
                {/* Group */}
                <View>
                  <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'المجموعة' : 'Group'}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable onPress={() => setForm((f: CustomerForm) => ({ ...f, group_id: '' }))}
                        style={[mStyles.groupChip, !form.group_id && mStyles.groupChipActive]}>
                        <Text style={[mStyles.groupChipText, !form.group_id && mStyles.groupChipTextActive]}>{language === 'ar' ? 'بدون' : 'None'}</Text>
                      </Pressable>
                      {groups.map((g: any) => (
                        <Pressable key={g.id} onPress={() => setForm((f: CustomerForm) => ({ ...f, group_id: g.id }))}
                          style={[mStyles.groupChip, form.group_id === g.id && { backgroundColor: g.color, borderColor: g.color }]}>
                          <Text style={[mStyles.groupChipText, form.group_id === g.id && { color: '#FFF' }]}>
                            {language === 'ar' ? (g.name_ar ?? g.name) : g.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                {/* Status */}
                <View>
                  <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'الحالة' : 'Status'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['active', 'inactive', 'blocked'] as CustomerStatus[]).map(s => (
                      <Pressable key={s} onPress={() => setForm((f: CustomerForm) => ({ ...f, status: s }))}
                        style={[mStyles.statusBtn, form.status === s && { backgroundColor: STATUS_CONFIG[s].bg, borderColor: STATUS_CONFIG[s].color }]}>
                        <Text style={[mStyles.statusBtnText, form.status === s && { color: STATUS_CONFIG[s].color }]}>
                          {language === 'ar' ? STATUS_CONFIG[s].labelAr : STATUS_CONFIG[s].labelEn}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <MF label={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, notes: v }))} isRTL={isRTL} multiline />
              </View>
            ) : formTab === 'contact' ? (
              <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                <MF label={language === 'ar' ? 'الهاتف' : 'Phone'} value={form.phone} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, phone: v }))} isRTL={isRTL} keyboardType="phone-pad" />
                <MF label={language === 'ar' ? 'هاتف بديل' : 'Alt. Phone'} value={form.phone_alt} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, phone_alt: v }))} isRTL={isRTL} keyboardType="phone-pad" />
                <MF label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, email: v }))} isRTL={isRTL} keyboardType="email-address" />
                <MF label={language === 'ar' ? 'العنوان' : 'Address'} value={form.address} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, address: v }))} isRTL={isRTL} multiline />
                <MF label={language === 'ar' ? 'المدينة' : 'City'} value={form.city} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, city: v }))} isRTL={isRTL} />
              </View>
            ) : (
              <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                <MF label={language === 'ar' ? 'الرصيد الافتتاحي (KWD)' : 'Opening Balance (KWD)'} value={form.opening_balance} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, opening_balance: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                <MF label={language === 'ar' ? 'حد الائتمان (KWD) — 0 = غير محدود' : 'Credit Limit (KWD) — 0 = unlimited'} value={form.credit_limit} onChange={(v: string) => setForm((f: CustomerForm) => ({ ...f, credit_limit: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                {/* Credit behavior */}
                <View>
                  <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'سلوك تجاوز الحد' : 'Credit Limit Behavior'}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {CREDIT_BEHAVIOR_OPTIONS.map(opt => (
                      <Pressable key={opt.value} onPress={() => setForm((f: CustomerForm) => ({ ...f, credit_limit_behavior: opt.value }))}
                        style={[mStyles.behaviorBtn, form.credit_limit_behavior === opt.value && { backgroundColor: `${opt.color}15`, borderColor: opt.color }]}>
                        <Text style={[mStyles.behaviorBtnText, form.credit_limit_behavior === opt.value && { color: opt.color }]}>
                          {language === 'ar' ? opt.labelAr : opt.labelEn}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                {/* Payment terms */}
                <View>
                  <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {PAYMENT_TERMS_OPTIONS.map(opt => (
                      <Pressable key={opt.value} onPress={() => setForm((f: CustomerForm) => ({ ...f, payment_terms: opt.value }))}
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

          {/* Footer */}
          <View style={[mStyles.footer, isRTL && mStyles.footerRTL]}>
            <Pressable onPress={onClose} style={mStyles.cancelBtn}>
              <Text style={mStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
            </Pressable>
            <Pressable onPress={onSave} style={mStyles.saveBtn}>
              <Text style={mStyles.saveText}>{language === 'ar' ? 'حفظ العميل' : 'Save Customer'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  typeBtnTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  groupChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  groupChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  groupChipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  groupChipTextActive: { color: Colors.textInverse },
  statusBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  statusBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  behaviorBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  behaviorBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
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
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base },
  toolbar: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  toolbarRTL: { flexDirection: 'row-reverse' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, borderWidth: 1.5, borderColor: Colors.border },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  chipTextActive: { color: Colors.textInverse },
  filterDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  groupDot: { width: 7, height: 7, borderRadius: 3.5 },
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
  avatarText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  nameRowRTL: { flexDirection: 'row-reverse' },
  customerName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, flex: 1, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  code: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  meta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  groupBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  groupBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  rightCol: { alignItems: 'flex-end', gap: 5 },
  rightColRTL: { alignItems: 'flex-start' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  balance: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.danger, includeFontPadding: false },
  balanceZero: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  editBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  emptyDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
