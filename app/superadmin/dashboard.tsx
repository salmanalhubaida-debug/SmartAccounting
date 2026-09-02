import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { StatsCard } from '../../components/feature/StatsCard';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { DEMO_ADMIN_STATS, DEMO_COMPANIES } from '../../services/mockData';

export default function SuperAdminDashboard() {
  const { language, isRTL } = useLanguage();
  const s = DEMO_ADMIN_STATS;
  const fmt = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: 3 })} KWD`;

  const kpis = [
    { title: language === 'ar' ? 'إجمالي الشركات' : 'Total Companies', value: String(s.totalCompanies), icon: 'business' as const, iconColor: Colors.primary, iconBg: Colors.primaryLight },
    { title: language === 'ar' ? 'الشركات النشطة' : 'Active Companies', value: String(s.activeCompanies), icon: 'check-circle' as const, iconColor: Colors.success, iconBg: Colors.successLight },
    { title: language === 'ar' ? 'الشركات الموقوفة' : 'Suspended', value: String(s.suspendedCompanies), icon: 'block' as const, iconColor: Colors.danger, iconBg: Colors.dangerLight },
    { title: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: String(s.totalUsers), icon: 'people' as const, iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
    { title: language === 'ar' ? 'إيرادات الشهر' : 'Monthly Revenue', value: fmt(s.monthlyRevenue), icon: 'monetization-on' as const, iconColor: Colors.accent, iconBg: Colors.accentLight },
    { title: language === 'ar' ? 'شركات جديدة' : 'New Companies', value: String(s.newCompaniesThisMonth), icon: 'add-business' as const, iconColor: Colors.warning, iconBg: Colors.warningLight },
  ];

  const statusColor = (status: string) => {
    if (status === 'active') return Colors.success;
    if (status === 'suspended') return Colors.danger;
    return Colors.warning;
  };
  const statusLabel = (status: string) => {
    if (language === 'ar') {
      return status === 'active' ? 'نشط' : status === 'suspended' ? 'موقوف' : 'تجريبي';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <SuperAdminLayout title={language === 'ar' ? 'لوحة الإدارة العليا' : 'Super Admin Dashboard'}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((k, i) => (
            <View key={i} style={styles.kpiItem}><StatsCard {...k} isRTL={isRTL} /></View>
          ))}
        </View>

        {/* Recent Companies */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'الشركات الأخيرة' : 'Recent Companies'}
            </Text>
            <Pressable onPress={() => router.push('/superadmin/companies')} style={styles.viewAll}>
              <Text style={styles.viewAllText}>{language === 'ar' ? 'عرض الكل' : 'View All'}</Text>
              <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.primary} />
            </Pressable>
          </View>
          {DEMO_COMPANIES.map(company => (
            <Pressable key={company.id} style={[styles.companyRow, isRTL && styles.companyRowRTL]}>
              <View style={styles.companyAvatar}>
                <Text style={styles.companyAvatarText}>
                  {(language === 'ar' ? company.name_ar : company.name).charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.companyName, isRTL && styles.textRTL]} numberOfLines={1}>
                  {language === 'ar' ? company.name_ar : company.name}
                </Text>
                <Text style={[styles.companyEmail, isRTL && styles.textRTL]} numberOfLines={1}>
                  {company.email}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: `${statusColor(company.status)}22` }]}>
                <Text style={[styles.statusText, { color: statusColor(company.status) }]}>
                  {statusLabel(company.status)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-business', labelAr: 'إضافة شركة', labelEn: 'Add Company', color: Colors.primary, route: '/superadmin/companies' },
              { icon: 'person-add', labelAr: 'إضافة مستخدم', labelEn: 'Add User', color: Colors.accent, route: '/superadmin/users' },
              { icon: 'card-membership', labelAr: 'الاشتراكات', labelEn: 'Subscriptions', color: '#8B5CF6', route: '/superadmin/subscriptions' },
              { icon: 'tune', labelAr: 'الإعدادات', labelEn: 'Settings', color: Colors.warning, route: '/superadmin/settings' },
            ].map((action, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(action.route as any)}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {language === 'ar' ? action.labelAr : action.labelEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['3xl'] },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiItem: { flexBasis: '48%', flexGrow: 1, minWidth: 140 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.base,
  },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  sectionTitle: {
    fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightSemibold,
    color: Colors.text, includeFontPadding: false,
  },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  companyRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  companyRowRTL: { flexDirection: 'row-reverse' },
  companyAvatar: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold,
    color: Colors.primary, includeFontPadding: false,
  },
  companyName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  companyEmail: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 1, includeFontPadding: false },
  statusDot: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: {
    flex: 1, minWidth: 80, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.base, borderRadius: Radius.md,
    backgroundColor: Colors.background, gap: 8,
  },
  actionIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, textAlign: 'center', includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
