// Super Admin — User Management
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { DEMO_COMPANY_USERS } from '../../services/mockData';
import { User } from '../../types/database';

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#7C3AED',
  company_owner: '#1B4FD8',
  company_manager: '#0EA5E9',
  accountant: '#10B981',
  sales_employee: '#F59E0B',
  purchase_employee: '#EF4444',
  inventory_employee: '#8B5CF6',
  viewer: '#94A3B8',
};

const ROLE_LABELS_AR: Record<string, string> = {
  super_admin: 'مسؤول المنصة', company_owner: 'صاحب الشركة',
  company_manager: 'مدير الشركة', accountant: 'محاسب',
  sales_employee: 'موظف مبيعات', purchase_employee: 'موظف مشتريات',
  inventory_employee: 'موظف مخزون', viewer: 'مشاهد',
};

export default function AdminUsers() {
  const { language, isRTL } = useLanguage();
  const [search, setSearch] = useState('');

  const allUsers: User[] = [
    {
      id: 'user-001', email: 'admin@smartaccounting.io',
      full_name: 'Super Administrator', full_name_ar: 'المسؤول العام',
      role: 'super_admin', is_active: true,
      created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    },
    ...DEMO_COMPANY_USERS,
  ];

  const filtered = allUsers.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderUser = ({ item }: { item: User }) => {
    const color = ROLE_COLORS[item.role] ?? Colors.textMuted;
    return (
      <View style={[styles.card, isRTL && styles.cardRTL]}>
        <View style={[styles.avatar, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.avatarText, { color }]}>
            {(item.full_name_ar ?? item.full_name).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.userName, isRTL && styles.textRTL]}>
            {language === 'ar' ? (item.full_name_ar ?? item.full_name) : item.full_name}
          </Text>
          <Text style={[styles.userEmail, isRTL && styles.textRTL]}>{item.email}</Text>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <View style={[styles.roleBadge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
              <Text style={[styles.roleBadgeText, { color }]}>
                {language === 'ar' ? (ROLE_LABELS_AR[item.role] ?? item.role) : item.role.replace(/_/g, ' ')}
              </Text>
            </View>
            {!item.is_active ? (
              <View style={styles.disabledBadge}>
                <Text style={styles.disabledBadgeText}>{language === 'ar' ? 'معطل' : 'Disabled'}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actionsCol}>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <MaterialIcons name="edit" size={15} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <MaterialIcons name={item.is_active ? 'block' : 'check-circle-outline'} size={15} color={item.is_active ? Colors.danger : Colors.success} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SuperAdminLayout title={language === 'ar' ? 'إدارة المستخدمين' : 'Users'}>
      <View style={styles.root}>
        <View style={[styles.toolbar, isRTL && styles.toolbarRTL]}>
          <View style={[styles.searchBox, isRTL && styles.searchBoxRTL]}>
            <MaterialIcons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={[styles.searchInput, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'بحث عن مستخدم...' : 'Search users...'}
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          <Pressable style={styles.addBtn}>
            <MaterialIcons name="person-add" size={18} color={Colors.textInverse} />
            <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
          </Pressable>
        </View>
        <FlatList
          data={filtered}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.base },
  toolbarRTL: { flexDirection: 'row-reverse' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border, height: 44,
  },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#7C3AED', paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md,
  },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm,
  },
  cardRTL: { flexDirection: 'row-reverse' },
  avatar: {
    width: 44, height: 44, borderRadius: Radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  userName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  userEmail: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  roleBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  disabledBadge: { backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  disabledBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.danger, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  actionsCol: { gap: 6 },
  actionBtn: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  textRTL: { textAlign: 'right' },
});
