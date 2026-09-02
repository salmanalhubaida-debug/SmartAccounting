// Users Management — Full CRUD + Role Assignment + Branch Access
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
import { DEMO_COMPANY_USERS } from '../../services/mockData';
import { User, UserRoleType } from '../../types/database';
import { useAlert } from '@/template';

const ROLE_COLORS: Record<string, string> = {
  company_owner: '#7C3AED',
  company_manager: '#1B4FD8',
  accountant: '#0EA5E9',
  sales_employee: '#10B981',
  purchase_employee: '#F59E0B',
  inventory_employee: '#EF4444',
  viewer: '#94A3B8',
};

const ROLE_LABELS_AR: Record<string, string> = {
  company_owner: 'صاحب الشركة',
  company_manager: 'مدير الشركة',
  accountant: 'محاسب',
  sales_employee: 'موظف مبيعات',
  purchase_employee: 'موظف مشتريات',
  inventory_employee: 'موظف مخزون',
  viewer: 'مشاهد',
};

const AVAILABLE_ROLES: UserRoleType[] = [
  'company_manager', 'accountant', 'sales_employee',
  'purchase_employee', 'inventory_employee', 'viewer',
];

type UserForm = {
  full_name: string;
  full_name_ar: string;
  email: string;
  phone: string;
  role: UserRoleType;
  branch_id: string;
};

const EMPTY_FORM: UserForm = {
  full_name: '', full_name_ar: '', email: '',
  phone: '', role: 'viewer', branch_id: '',
};

export default function Users() {
  const { language, isRTL } = useLanguage();
  const { branches, activeCompany } = useCompany();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>(DEMO_COMPANY_USERS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [filterRole, setFilterRole] = useState<string>('all');

  const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name,
      full_name_ar: user.full_name_ar ?? '',
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      branch_id: user.branch_id ?? '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      showAlert(
        language === 'ar' ? 'حقول مطلوبة' : 'Required Fields',
        language === 'ar' ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Name and email are required'
      );
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? {
          ...u,
          full_name: form.full_name,
          full_name_ar: form.full_name_ar || undefined,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          branch_id: form.branch_id || undefined,
          updated_at: new Date().toISOString(),
        } : u
      ));
      log({ action: 'update', module: 'users', record_id: editingUser.id, record_type: 'user',
        previous_data: { role: editingUser.role }, new_data: { role: form.role } });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: form.email,
        full_name: form.full_name,
        full_name_ar: form.full_name_ar || undefined,
        phone: form.phone || undefined,
        role: form.role,
        company_id: activeCompany?.id,
        branch_id: form.branch_id || undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      log({ action: 'create', module: 'users', record_id: newUser.id, record_type: 'user',
        new_data: { email: form.email, role: form.role } });
    }
    setModalVisible(false);
  };

  const handleToggleActive = (user: User) => {
    if (user.role === 'company_owner') {
      showAlert(language === 'ar' ? 'غير مسموح' : 'Not Allowed',
        language === 'ar' ? 'لا يمكن تعطيل حساب صاحب الشركة' : 'Cannot disable the company owner');
      return;
    }
    showAlert(
      user.is_active
        ? (language === 'ar' ? 'تعطيل المستخدم؟' : 'Disable User?')
        : (language === 'ar' ? 'تفعيل المستخدم؟' : 'Activate User?'),
      language === 'ar'
        ? `${user.full_name_ar ?? user.full_name}`
        : user.full_name,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'تأكيد' : 'Confirm',
          style: user.is_active ? 'destructive' : 'default',
          onPress: () => {
            setUsers(prev => prev.map(u =>
              u.id === user.id ? { ...u, is_active: !u.is_active, updated_at: new Date().toISOString() } : u
            ));
            log({ action: 'update', module: 'users', record_id: user.id, record_type: 'user',
              previous_data: { is_active: user.is_active }, new_data: { is_active: !user.is_active } });
          },
        },
      ]
    );
  };

  const roleLabel = (role: string) =>
    language === 'ar' ? (ROLE_LABELS_AR[role] ?? role) : role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const formatLastLogin = (dt?: string) => {
    if (!dt) return language === 'ar' ? 'لم يسجل دخول' : 'Never logged in';
    const d = new Date(dt);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return language === 'ar' ? 'منذ قليل' : 'Just now';
    if (hours < 24) return language === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return language === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const renderUser = ({ item }: { item: User }) => {
    const color = ROLE_COLORS[item.role] ?? Colors.textMuted;
    const branch = branches.find(b => b.id === item.branch_id);

    return (
      <View style={[styles.card, !item.is_active && styles.cardDisabled, isRTL && styles.cardRTL]}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.avatarText, { color }]}>
            {(item.full_name_ar ?? item.full_name).charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
            <Text style={[styles.userName, isRTL && styles.textRTL, !item.is_active && styles.disabledText]}>
              {language === 'ar' ? (item.full_name_ar ?? item.full_name) : item.full_name}
            </Text>
            {!item.is_active ? (
              <View style={styles.disabledBadge}>
                <Text style={styles.disabledBadgeText}>{language === 'ar' ? 'معطل' : 'Disabled'}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.userEmail, isRTL && styles.textRTL]} numberOfLines={1}>{item.email}</Text>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <View style={[styles.roleBadge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
              <Text style={[styles.roleBadgeText, { color }]}>{roleLabel(item.role)}</Text>
            </View>
            {branch ? (
              <Text style={styles.branchLabel}>
                <MaterialIcons name="store" size={10} color={Colors.textMuted} /> {language === 'ar' ? (branch.name_ar ?? branch.name) : branch.name}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.lastLogin, isRTL && styles.textRTL]}>
            {language === 'ar' ? 'آخر دخول: ' : 'Last login: '}{formatLastLogin(item.last_login_at)}
          </Text>
        </View>

        {/* Actions */}
        {can('users', 'edit') ? (
          <View style={[styles.actionsCol, isRTL && styles.actionsColRTL]}>
            <Pressable onPress={() => openEdit(item)} style={styles.actionBtn} hitSlop={6}>
              <MaterialIcons name="edit" size={16} color={Colors.primary} />
            </Pressable>
            {item.role !== 'company_owner' ? (
              <Pressable onPress={() => handleToggleActive(item)} style={styles.actionBtn} hitSlop={6}>
                <MaterialIcons
                  name={item.is_active ? 'block' : 'check-circle-outline'}
                  size={16}
                  color={item.is_active ? Colors.danger : Colors.success}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'المستخدمون والصلاحيات' : 'Users & Permissions'}>
      <PermissionGuard module="users" action="view">
        <View style={styles.root}>
          {/* Role filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {['all', ...AVAILABLE_ROLES, 'company_owner'].map(role => (
                <Pressable
                  key={role}
                  onPress={() => setFilterRole(role)}
                  style={[styles.chip, filterRole === role && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filterRole === role && styles.chipTextActive]}>
                    {role === 'all'
                      ? (language === 'ar' ? 'الكل' : 'All')
                      : roleLabel(role)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Toolbar */}
          <View style={[styles.toolbar, isRTL && styles.toolbarRTL]}>
            <Text style={styles.count}>
              {language === 'ar' ? `${filtered.length} مستخدم` : `${filtered.length} users`}
            </Text>
            {can('users', 'create') ? (
              <Pressable onPress={openAdd} style={styles.addBtn}>
                <MaterialIcons name="person-add" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة مستخدم' : 'Add User'}</Text>
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            renderItem={renderUser}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </PermissionGuard>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalBackdropPress} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
              <Text style={styles.modalTitle}>
                {editingUser ? (language === 'ar' ? 'تعديل المستخدم' : 'Edit User') : (language === 'ar' ? 'إضافة مستخدم' : 'Add User')}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
              <ModalField label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.full_name_ar} onChange={v => setForm(f => ({ ...f, full_name_ar: v }))} isRTL={isRTL} />
              <ModalField label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} value={form.full_name} onChange={v => setForm(f => ({ ...f, full_name: v }))} isRTL={isRTL} required />
              <ModalField label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} isRTL={isRTL} required keyboardType="email-address" />
              <ModalField label={language === 'ar' ? 'الهاتف' : 'Phone'} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} isRTL={isRTL} keyboardType="phone-pad" />

              {/* Role Selector */}
              <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>
                {language === 'ar' ? 'الدور' : 'Role'}<Text style={{ color: Colors.danger }}> *</Text>
              </Text>
              <View style={styles.roleGrid}>
                {AVAILABLE_ROLES.map(role => {
                  const color = ROLE_COLORS[role];
                  const active = form.role === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => setForm(f => ({ ...f, role }))}
                      style={[styles.roleOption, active && { borderColor: color, backgroundColor: `${color}10` }]}
                    >
                      <View style={[styles.roleColorDot, { backgroundColor: color }]} />
                      <Text style={[styles.roleOptionText, active && { color, fontWeight: Typography.fontWeightSemibold }]}>
                        {roleLabel(role)}
                      </Text>
                      {active ? <MaterialIcons name="check" size={14} color={color} /> : null}
                    </Pressable>
                  );
                })}
              </View>

              {/* Branch Selector */}
              <Text style={[mStyles.label, isRTL && mStyles.labelRTL, { marginTop: Spacing.md }]}>
                {language === 'ar' ? 'الفرع (اختياري)' : 'Branch (Optional)'}
              </Text>
              <View style={styles.branchList}>
                <Pressable
                  onPress={() => setForm(f => ({ ...f, branch_id: '' }))}
                  style={[styles.branchOption, !form.branch_id && styles.branchOptionActive]}
                >
                  <Text style={[styles.branchOptionText, !form.branch_id && styles.branchOptionTextActive]}>
                    {language === 'ar' ? 'جميع الفروع' : 'All Branches'}
                  </Text>
                </Pressable>
                {branches.map(b => (
                  <Pressable
                    key={b.id}
                    onPress={() => setForm(f => ({ ...f, branch_id: b.id }))}
                    style={[styles.branchOption, form.branch_id === b.id && styles.branchOptionActive]}
                  >
                    <Text style={[styles.branchOptionText, form.branch_id === b.id && styles.branchOptionTextActive]}>
                      {language === 'ar' ? (b.name_ar ?? b.name) : b.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ height: Spacing.xl }} />
            </ScrollView>

            <View style={[styles.modalFooter, isRTL && styles.modalFooterRTL]}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

const ModalField = ({
  label, value, onChange, isRTL, required, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void;
  isRTL: boolean; required?: boolean; keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>
      {label}{required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
    </Text>
    <TextInput
      style={[mStyles.input, isRTL && mStyles.inputRTL]}
      value={value}
      onChangeText={onChange}
      placeholderTextColor={Colors.textMuted}
      textAlign={isRTL ? 'right' : 'left'}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize="none"
    />
  </View>
);

const mStyles = StyleSheet.create({
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

  chips: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  chipTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm,
  },
  toolbarRTL: { flexDirection: 'row-reverse' },
  count: { fontSize: Typography.fontSizeBase, color: Colors.textSecondary, includeFontPadding: false },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md,
  },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },

  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm,
  },
  cardRTL: { flexDirection: 'row-reverse' },
  cardDisabled: { opacity: 0.65 },

  avatar: {
    width: 46, height: 46, borderRadius: Radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  nameRowRTL: { flexDirection: 'row-reverse' },
  userName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  userEmail: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  roleBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  roleBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  branchLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  lastLogin: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 4, includeFontPadding: false },

  disabledBadge: { backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  disabledBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.danger, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  disabledText: { color: Colors.textMuted },

  actionsCol: { gap: 6 },
  actionsColRTL: {},
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },

  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  roleOption: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  roleColorDot: { width: 8, height: 8, borderRadius: 4 },
  roleOptionText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },

  branchList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  branchOption: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  branchOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  branchOptionText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  branchOptionTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalBackdropPress: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'],
    maxHeight: '90%', ...Shadow.lg,
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
    paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: {
    flex: 2, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary,
  },
  saveBtnText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
