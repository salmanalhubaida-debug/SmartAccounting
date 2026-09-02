// Super Admin Shell Layout
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const isDesktop = width >= 1024;

const ADMIN_NAV = [
  { key: 'dashboard', icon: 'dashboard' as const, labelAr: 'لوحة التحكم', labelEn: 'Dashboard', route: '/superadmin/dashboard' },
  { key: 'companies', icon: 'business' as const, labelAr: 'الشركات', labelEn: 'Companies', route: '/superadmin/companies' },
  { key: 'users', icon: 'people' as const, labelAr: 'المستخدمون', labelEn: 'Users', route: '/superadmin/users' },
  { key: 'subscriptions', icon: 'card-membership' as const, labelAr: 'الاشتراكات', labelEn: 'Subscriptions', route: '/superadmin/subscriptions' },
  { key: 'plans', icon: 'star' as const, labelAr: 'الباقات', labelEn: 'Plans', route: '/superadmin/plans' },
  { key: 'settings', icon: 'tune' as const, labelAr: 'إعدادات النظام', labelEn: 'System Settings', route: '/superadmin/settings' },
];

const AdminSidebar = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuth();
  const { language, isRTL, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom }]}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoRow}>
          <View style={[styles.logoIcon, { backgroundColor: '#7C3AED' }]}>
            <MaterialIcons name="admin-panel-settings" size={22} color={Colors.textInverse} />
          </View>
          <View>
            <Text style={styles.appName}>{language === 'ar' ? 'المحاسبة الذكية' : 'Smart Accounting'}</Text>
            <Text style={styles.roleBadge}>{language === 'ar' ? 'الإدارة العليا' : 'Super Admin'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {ADMIN_NAV.map(item => {
          const active = pathname === item.route;
          return (
            <Pressable
              key={item.key}
              onPress={() => { router.push(item.route as any); onClose(); }}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
                isRTL && styles.navItemRTL,
              ]}
            >
              <MaterialIcons name={item.icon} size={20} color={active ? Colors.textInverse : Colors.sidebarText} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {language === 'ar' ? item.labelAr : item.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sidebarFooter}>
        <Pressable
          onPress={() => { logout(); router.replace('/login'); }}
          style={[styles.logoutBtn, isRTL && styles.logoutBtnRTL]}
        >
          <MaterialIcons name="logout" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

interface SuperAdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ title, children }) => {
  const { isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isDesktop) {
    return (
      <View style={styles.root}>
        <AdminSidebar onClose={() => {}} />
        <View style={styles.main}>
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }, isRTL && styles.topBarRTL]}>
            <Text style={styles.pageTitle}>{title}</Text>
          </View>
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + 4 }, isRTL && styles.mobileTopBarRTL]}>
        <Pressable onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
          <MaterialIcons name="menu" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.mobileTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerBackdrop} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawerPanel}>
            <AdminSidebar onClose={() => setDrawerOpen(false)} />
          </View>
        </View>
      </Modal>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  sidebar: { width: 260, backgroundColor: '#1A0533', borderRightWidth: 1, borderRightColor: '#2D0A5C' },
  sidebarHeader: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2D0A5C',
    marginBottom: Spacing.sm,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
  roleBadge: {
    fontSize: Typography.fontSizeXS,
    color: '#C4B5FD',
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
  navList: { flex: 1, paddingHorizontal: Spacing.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  navItemRTL: { flexDirection: 'row-reverse' },
  navItemActive: { backgroundColor: '#7C3AED' },
  navItemPressed: { backgroundColor: '#2D0A5C' },
  navLabel: { fontSize: Typography.fontSizeSM, color: '#94A3B8', fontWeight: Typography.fontWeightMedium, flex: 1, includeFontPadding: false },
  navLabelActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: '#2D0A5C', padding: Spacing.md },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.sm },
  logoutBtnRTL: { flexDirection: 'row-reverse' },
  logoutText: { color: Colors.danger, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },

  main: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing.base,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  topBarRTL: { flexDirection: 'row-reverse' },
  pageTitle: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },

  mobileRoot: { flex: 1, backgroundColor: Colors.background },
  mobileTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mobileTopBarRTL: { flexDirection: 'row-reverse' },
  menuBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  mobileTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, flex: 1, textAlign: 'center', includeFontPadding: false },

  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerPanel: { width: 260 },
});
