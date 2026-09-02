// Branches Management — Full CRUD with modal form
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { useCompany } from '../../contexts/CompanyContext';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { Branch } from '../../types/database';
import { useAlert } from '@/template';

type BranchForm = {
  name: string;
  name_ar: string;
  code: string;
  address: string;
  phone: string;
};

const EMPTY_FORM: BranchForm = { name: '', name_ar: '', code: '', address: '', phone: '' };

export default function Branches() {
  const { language, isRTL } = useLanguage();
  const { branches, activeCompany, addBranch, updateBranch, toggleBranchStatus } = useCompany();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(EMPTY_FORM);

  const openAdd = () => {
    setEditingBranch(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      name_ar: branch.name_ar ?? '',
      code: branch.code ?? '',
      address: branch.address ?? '',
      phone: branch.phone ?? '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showAlert(
        language === 'ar' ? 'حقل مطلوب' : 'Required',
        language === 'ar' ? 'يرجى إدخال اسم الفرع' : 'Branch name is required'
      );
      return;
    }
    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: form.name,
        name_ar: form.name_ar || undefined,
        code: form.code || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
      });
      log({ action: 'update', module: 'branches', record_id: editingBranch.id, record_type: 'branch',
        previous_data: { name: editingBranch.name }, new_data: { name: form.name } });
    } else {
      addBranch({
        company_id: activeCompany?.id ?? '',
        name: form.name,
        name_ar: form.name_ar || undefined,
        code: form.code || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        is_main: false,
        status: 'active',
      });
      log({ action: 'create', module: 'branches', record_type: 'branch', new_data: { name: form.name } });
    }
    setModalVisible(false);
  };

  const handleToggleStatus = (branch: Branch) => {
    if (branch.is_main) {
      showAlert(
        language === 'ar' ? 'غير مسموح' : 'Not Allowed',
        language === 'ar' ? 'لا يمكن إيقاف الفرع الرئيسي' : 'The main branch cannot be deactivated'
      );
      return;
    }
    showAlert(
      language === 'ar'
        ? (branch.status === 'active' ? 'إيقاف الفرع؟' : 'تفعيل الفرع؟')
        : (branch.status === 'active' ? 'Deactivate Branch?' : 'Activate Branch?'),
      language === 'ar'
        ? `هل تريد ${branch.status === 'active' ? 'إيقاف' : 'تفعيل'} فرع "${branch.name_ar ?? branch.name}"؟`
        : `Are you sure you want to ${branch.status === 'active' ? 'deactivate' : 'activate'} "${branch.name}"?`,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'تأكيد' : 'Confirm',
          style: branch.status === 'active' ? 'destructive' : 'default',
          onPress: () => {
            toggleBranchStatus(branch.id);
            log({ action: 'update', module: 'branches', record_id: branch.id, record_type: 'branch',
              previous_data: { status: branch.status },
              new_data: { status: branch.status === 'active' ? 'inactive' : 'active' } });
          },
        },
      ]
    );
  };

  const renderBranch = ({ item }: { item: Branch }) => (
    <View style={[styles.card, isRTL && styles.cardRTL]}>
      <View style={[styles.cardLeft, isRTL && styles.cardLeftRTL]}>
        <View style={[styles.iconBg, item.is_main && styles.iconBgMain]}>
          <MaterialIcons
            name={item.is_main ? 'home-work' : 'store'}
            size={22}
            color={item.is_main ? Colors.primary : Colors.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
            <Text style={[styles.branchName, isRTL && styles.textRTL]}>
              {language === 'ar' ? (item.name_ar ?? item.name) : item.name}
            </Text>
            {item.is_main ? (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>{language === 'ar' ? 'رئيسي' : 'Main'}</Text>
              </View>
            ) : null}
            {item.code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{item.code}</Text>
              </View>
            ) : null}
          </View>
          {item.address ? (
            <Text style={[styles.branchMeta, isRTL && styles.textRTL]} numberOfLines={1}>
              <MaterialIcons name="location-on" size={11} color={Colors.textMuted} /> {item.address}
            </Text>
          ) : null}
          {item.phone ? (
            <Text style={[styles.branchMeta, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.phone}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.cardRight, isRTL && styles.cardRightRTL]}>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, item.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
            {item.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'موقوف' : 'Inactive')}
          </Text>
        </View>
        <View style={styles.actions}>
          {can('branches', 'edit') ? (
            <Pressable onPress={() => openEdit(item)} style={styles.actionBtn} hitSlop={8}>
              <MaterialIcons name="edit" size={16} color={Colors.primary} />
            </Pressable>
          ) : null}
          {can('branches', 'edit') && !item.is_main ? (
            <Pressable onPress={() => handleToggleStatus(item)} style={styles.actionBtn} hitSlop={8}>
              <MaterialIcons
                name={item.status === 'active' ? 'block' : 'check-circle-outline'}
                size={16}
                color={item.status === 'active' ? Colors.danger : Colors.success}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <CompanyLayout title={language === 'ar' ? 'الفروع' : 'Branches'}>
      <PermissionGuard module="branches" action="view">
        <View style={styles.root}>
          {/* Toolbar */}
          <View style={[styles.toolbar, isRTL && styles.toolbarRTL]}>
            <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? `${branches.length} فروع` : `${branches.length} branches`}
            </Text>
            {can('branches', 'create') ? (
              <Pressable onPress={openAdd} style={styles.addBtn}>
                <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة فرع' : 'Add Branch'}</Text>
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={branches}
            renderItem={renderBranch}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="store" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد فروع' : 'No branches found'}</Text>
              </View>
            }
          />
        </View>
      </PermissionGuard>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalBackdropPress} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            {/* Modal header */}
            <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
              <Text style={styles.modalTitle}>
                {editingBranch
                  ? (language === 'ar' ? 'تعديل الفرع' : 'Edit Branch')
                  : (language === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch')}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
              <FormField
                label={language === 'ar' ? 'اسم الفرع (عربي)' : 'Branch Name (Arabic)'}
                value={form.name_ar}
                onChangeText={v => setForm(f => ({ ...f, name_ar: v }))}
                placeholder={language === 'ar' ? 'مثال: الفرع الرئيسي' : 'e.g. Main Branch'}
                isRTL={isRTL}
              />
              <FormField
                label={language === 'ar' ? 'اسم الفرع (إنجليزي)' : 'Branch Name (English)'}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                placeholder={language === 'ar' ? 'مثال: Main Branch' : 'e.g. Hawalli Branch'}
                isRTL={isRTL}
                required
              />
              <FormField
                label={language === 'ar' ? 'رمز الفرع' : 'Branch Code'}
                value={form.code}
                onChangeText={v => setForm(f => ({ ...f, code: v.toUpperCase() }))}
                placeholder={language === 'ar' ? 'مثال: MAIN' : 'e.g. SLM'}
                isRTL={isRTL}
              />
              <FormField
                label={language === 'ar' ? 'العنوان' : 'Address'}
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                placeholder={language === 'ar' ? 'عنوان الفرع' : 'Branch address'}
                isRTL={isRTL}
              />
              <FormField
                label={language === 'ar' ? 'الهاتف' : 'Phone'}
                value={form.phone}
                onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                placeholder="+965 XXXX XXXX"
                isRTL={isRTL}
                keyboardType="phone-pad"
              />
            </ScrollView>

            <View style={[styles.modalFooter, isRTL && styles.modalFooterRTL]}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveBtn}>
                <MaterialIcons name="save" size={16} color={Colors.textInverse} />
                <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

const FormField = ({
  label, value, onChangeText, placeholder, isRTL, required, keyboardType,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; isRTL: boolean; required?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
}) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Text style={[fStyles.label, isRTL && fStyles.labelRTL]}>
      {label}{required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
    </Text>
    <TextInput
      style={[fStyles.input, isRTL && fStyles.inputRTL]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      textAlign={isRTL ? 'right' : 'left'}
      keyboardType={keyboardType ?? 'default'}
    />
  </View>
);

const fStyles = StyleSheet.create({
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: Typography.fontSizeBase, color: Colors.text, backgroundColor: Colors.surface,
    includeFontPadding: false,
  },
  inputRTL: { textAlign: 'right' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: Spacing.base,
  },
  toolbarRTL: { flexDirection: 'row-reverse' },
  subtitle: { fontSize: Typography.fontSizeBase, color: Colors.textSecondary, includeFontPadding: false },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.base,
    paddingVertical: 10, borderRadius: Radius.md,
  },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },

  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base,
    ...Shadow.sm,
  },
  cardRTL: { flexDirection: 'row-reverse' },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, flex: 1 },
  cardLeftRTL: { flexDirection: 'row-reverse' },
  cardRight: { alignItems: 'flex-end', gap: Spacing.sm },
  cardRightRTL: { alignItems: 'flex-start' },

  iconBg: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  iconBgMain: { backgroundColor: Colors.primaryLight },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  nameRowRTL: { flexDirection: 'row-reverse' },
  branchName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  branchMeta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 3, includeFontPadding: false },

  mainBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  mainBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  codeBadge: { backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  codeBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusActive: { backgroundColor: Colors.successLight },
  statusInactive: { backgroundColor: Colors.dangerLight },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  statusTextActive: { color: Colors.success },
  statusTextInactive: { color: Colors.danger },

  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalBackdropPress: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'],
    maxHeight: '85%', ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalHeaderRTL: { flexDirection: 'row-reverse' },
  modalTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  modalFooter: {
    flexDirection: 'row', gap: Spacing.sm,
    padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  modalFooterRTL: { flexDirection: 'row-reverse' },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  saveBtnText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
