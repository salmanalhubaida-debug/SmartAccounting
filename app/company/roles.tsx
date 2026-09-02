// Roles & Permissions Management — Visual permission matrix
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Switch, Modal, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  Role, ModulePermission, AppModule, PermissionAction,
  SYSTEM_ROLE_TEMPLATES,
} from '../../types/permissions';

const ROLE_COLORS: Record<string, string> = {
  company_owner: '#7C3AED',
  company_manager: '#1B4FD8',
  accountant: '#0EA5E9',
  sales_employee: '#10B981',
  purchase_employee: '#F59E0B',
  inventory_employee: '#EF4444',
  viewer: '#94A3B8',
};

const SYSTEM_ROLES: Role[] = [
  { id: 'role-owner', company_id: 'company-001', name: 'Company Owner', name_ar: 'صاحب الشركة', is_system: true, color: '#7C3AED', permissions: SYSTEM_ROLE_TEMPLATES['company_owner'], created_at: '', updated_at: '' },
  { id: 'role-manager', company_id: 'company-001', name: 'Company Manager', name_ar: 'مدير الشركة', is_system: true, color: '#1B4FD8', permissions: SYSTEM_ROLE_TEMPLATES['company_manager'], created_at: '', updated_at: '' },
  { id: 'role-accountant', company_id: 'company-001', name: 'Accountant', name_ar: 'محاسب', is_system: true, color: '#0EA5E9', permissions: SYSTEM_ROLE_TEMPLATES['accountant'], created_at: '', updated_at: '' },
  { id: 'role-sales', company_id: 'company-001', name: 'Sales Employee', name_ar: 'موظف مبيعات', is_system: true, color: '#10B981', permissions: SYSTEM_ROLE_TEMPLATES['sales_employee'], created_at: '', updated_at: '' },
  { id: 'role-purchase', company_id: 'company-001', name: 'Purchase Employee', name_ar: 'موظف مشتريات', is_system: true, color: '#F59E0B', permissions: SYSTEM_ROLE_TEMPLATES['purchase_employee'], created_at: '', updated_at: '' },
  { id: 'role-inventory', company_id: 'company-001', name: 'Inventory Employee', name_ar: 'موظف مخزون', is_system: true, color: '#EF4444', permissions: SYSTEM_ROLE_TEMPLATES['inventory_employee'], created_at: '', updated_at: '' },
  { id: 'role-viewer', company_id: 'company-001', name: 'Viewer', name_ar: 'مشاهد', is_system: true, color: '#94A3B8', permissions: SYSTEM_ROLE_TEMPLATES['viewer'], created_at: '', updated_at: '' },
];

const MODULES_INFO: Record<AppModule, { labelAr: string; labelEn: string; icon: string }> = {
  dashboard: { labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: 'dashboard' },
  sales: { labelAr: 'المبيعات', labelEn: 'Sales', icon: 'point-of-sale' },
  purchases: { labelAr: 'المشتريات', labelEn: 'Purchases', icon: 'shopping-cart' },
  expenses: { labelAr: 'المصروفات', labelEn: 'Expenses', icon: 'receipt-long' },
  customers: { labelAr: 'العملاء', labelEn: 'Customers', icon: 'people' },
  suppliers: { labelAr: 'الموردون', labelEn: 'Suppliers', icon: 'local-shipping' },
  products: { labelAr: 'المنتجات', labelEn: 'Products', icon: 'inventory-2' },
  inventory: { labelAr: 'المخزون', labelEn: 'Inventory', icon: 'warehouse' },
  accounting: { labelAr: 'المحاسبة', labelEn: 'Accounting', icon: 'account-balance' },
  reports: { labelAr: 'التقارير', labelEn: 'Reports', icon: 'assessment' },
  branches: { labelAr: 'الفروع', labelEn: 'Branches', icon: 'store' },
  users: { labelAr: 'المستخدمون', labelEn: 'Users', icon: 'manage-accounts' },
  settings: { labelAr: 'الإعدادات', labelEn: 'Settings', icon: 'settings' },
};

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
const ACTION_LABELS_AR: Record<PermissionAction, string> = {
  view: 'عرض', create: 'إنشاء', edit: 'تعديل', delete: 'حذف', approve: 'اعتماد', export: 'تصدير',
};

export default function RolesPermissions() {
  const { language, isRTL } = useLanguage();
  const { can } = usePermissions();
  const insets = useSafeAreaInsets();

  const [roles, setRoles] = useState<Role[]>(SYSTEM_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(SYSTEM_ROLES[0]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingPerms, setEditingPerms] = useState<ModulePermission[]>([]);

  const openDetail = (role: Role) => {
    setSelectedRole(role);
    setEditingPerms(JSON.parse(JSON.stringify(role.permissions)));
    setDetailVisible(true);
  };

  const togglePerm = (module: AppModule, action: PermissionAction) => {
    setEditingPerms(prev => prev.map(p =>
      p.module === module ? { ...p, [action]: !p[action] } : p
    ));
  };

  const savePerms = () => {
    setRoles(prev => prev.map(r =>
      r.id === selectedRole.id ? { ...r, permissions: editingPerms } : r
    ));
    setDetailVisible(false);
  };

  const getAccessSummary = (perms: ModulePermission[]) => {
    const fullAccess = perms.filter(p => p.view && p.create && p.edit && p.delete).length;
    const viewOnly = perms.filter(p => p.view && !p.create && !p.edit && !p.delete).length;
    const noAccess = perms.filter(p => !p.view).length;
    return { fullAccess, viewOnly, noAccess };
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}>
      <PermissionGuard module="users" action="view">
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header note */}
          <View style={[styles.infoBox, isRTL && styles.infoBoxRTL]}>
            <MaterialIcons name="info-outline" size={18} color={Colors.info} />
            <Text style={[styles.infoText, isRTL && styles.textRTL]}>
              {language === 'ar'
                ? 'الأدوار النظامية قابلة للتعديل ولكن لا يمكن حذفها. يمكن إضافة أدوار مخصصة في المرحلة القادمة.'
                : 'System roles can be edited but not deleted. Custom roles can be added in a future phase.'}
            </Text>
          </View>

          {/* Roles list */}
          {roles.map(role => {
            const summary = getAccessSummary(role.permissions);
            const color = role.color ?? Colors.primary;
            return (
              <Pressable
                key={role.id}
                onPress={() => openDetail(role)}
                style={({ pressed }) => [styles.roleCard, isRTL && styles.roleCardRTL, pressed && styles.cardPressed]}
              >
                <View style={[styles.roleIcon, { backgroundColor: `${color}15` }]}>
                  <MaterialIcons name="shield" size={22} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleName, isRTL && styles.textRTL]}>
                    {language === 'ar' ? role.name_ar : role.name}
                  </Text>
                  <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                    <SummaryPill label={language === 'ar' ? 'وصول كامل' : 'Full'} count={summary.fullAccess} color={Colors.success} />
                    <SummaryPill label={language === 'ar' ? 'عرض فقط' : 'View'} count={summary.viewOnly} color={Colors.info} />
                    <SummaryPill label={language === 'ar' ? 'محجوب' : 'None'} count={summary.noAccess} color={Colors.textMuted} />
                  </View>
                </View>
                <View style={[styles.roleRight, isRTL && styles.roleRightRTL]}>
                  {role.is_system ? (
                    <View style={styles.systemBadge}>
                      <Text style={styles.systemBadgeText}>{language === 'ar' ? 'نظام' : 'System'}</Text>
                    </View>
                  ) : null}
                  <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </PermissionGuard>

      {/* Permission Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <View style={[styles.detailRoot, { paddingTop: insets.top }]}>
          {/* Detail header */}
          <View style={[styles.detailHeader, isRTL && styles.detailHeaderRTL]}>
            <Pressable onPress={() => setDetailVisible(false)} style={styles.backBtn} hitSlop={8}>
              <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
            </Pressable>
            <Text style={styles.detailTitle} numberOfLines={1}>
              {language === 'ar' ? selectedRole.name_ar : selectedRole.name}
            </Text>
            {can('users', 'edit') ? (
              <Pressable onPress={savePerms} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            ) : <View style={{ width: 60 }} />}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Permission matrix header */}
            <View style={[styles.matrixHeader, isRTL && styles.matrixHeaderRTL]}>
              <Text style={[styles.matrixModuleCol, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'القسم' : 'Module'}
              </Text>
              {ACTIONS.map(action => (
                <Text key={action} style={styles.matrixActionCol}>
                  {language === 'ar' ? ACTION_LABELS_AR[action] : action.charAt(0).toUpperCase() + action.slice(1)}
                </Text>
              ))}
            </View>

            {editingPerms.map((perm) => {
              const moduleInfo = MODULES_INFO[perm.module];
              return (
                <View key={perm.module} style={[styles.matrixRow, isRTL && styles.matrixRowRTL]}>
                  <View style={[styles.matrixModuleCell, isRTL && styles.matrixModuleCellRTL]}>
                    <MaterialIcons name={moduleInfo.icon as any} size={14} color={Colors.textSecondary} />
                    <Text style={[styles.matrixModuleText, isRTL && styles.textRTL]}>
                      {language === 'ar' ? moduleInfo.labelAr : moduleInfo.labelEn}
                    </Text>
                  </View>
                  {ACTIONS.map(action => (
                    <Pressable
                      key={action}
                      onPress={() => can('users', 'edit') ? togglePerm(perm.module, action) : null}
                      style={styles.matrixCheckCell}
                      hitSlop={4}
                    >
                      <View style={[styles.checkbox, perm[action] && styles.checkboxChecked]}>
                        {perm[action] ? <MaterialIcons name="check" size={12} color={Colors.textInverse} /> : null}
                      </View>
                    </Pressable>
                  ))}
                </View>
              );
            })}

            <View style={{ height: insets.bottom + Spacing['3xl'] }} />
          </ScrollView>
        </View>
      </Modal>
    </CompanyLayout>
  );
}

const SummaryPill = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
    <View style={[pillStyles.dot, { backgroundColor: color }]} />
    <Text style={[pillStyles.text, { color }]}>{count} {label}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md,
    borderLeftWidth: 3, borderLeftColor: Colors.info,
  },
  infoBoxRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.info },
  infoText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.info, lineHeight: 20, includeFontPadding: false },

  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm,
  },
  roleCardRTL: { flexDirection: 'row-reverse' },
  cardPressed: { opacity: 0.85 },
  roleIcon: {
    width: 46, height: 46, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  roleName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: 4, includeFontPadding: false },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  summaryRowRTL: { flexDirection: 'row-reverse' },
  roleRight: { alignItems: 'flex-end', gap: 6 },
  roleRightRTL: { alignItems: 'flex-start' },

  systemBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  systemBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },

  // Detail modal
  detailRoot: { flex: 1, backgroundColor: Colors.background },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailHeaderRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { flex: 1, textAlign: 'center', fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  saveBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },

  // Permission matrix
  matrixHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  matrixHeaderRTL: { flexDirection: 'row-reverse' },
  matrixModuleCol: {
    width: 110, fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false,
  },
  matrixActionCol: {
    flex: 1, textAlign: 'center', fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false,
  },

  matrixRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  matrixRowRTL: { flexDirection: 'row-reverse' },
  matrixModuleCell: { width: 110, flexDirection: 'row', alignItems: 'center', gap: 6 },
  matrixModuleCellRTL: { flexDirection: 'row-reverse' },
  matrixModuleText: { fontSize: Typography.fontSizeSM, color: Colors.text, includeFontPadding: false },
  matrixCheckCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  textRTL: { textAlign: 'right' },
});
