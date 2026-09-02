// Company Sidebar — Collapsible, RTL-aware
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, Platform, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const isDesktop = width >= 1024;
const isTablet = width >= 768;

interface NavItem {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelAr: string;
  labelEn: string;
  route: string;
  color?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', route: '/company/dashboard', color: '#60A5FA' },
  { key: 'sales', icon: 'point-of-sale', labelAr: 'المبيعات', labelEn: 'Sales', route: '/company/sales', color: '#34D399' },
  { key: 'purchases', icon: 'shopping-cart', labelAr: 'المشتريات', labelEn: 'Purchases', route: '/company/purchases', color: '#F59E0B' },
  { key: 'expenses', icon: 'receipt-long', labelAr: 'المصروفات', labelEn: 'Expenses', route: '/company/expenses', color: '#F87171' },
  { key: 'customers', icon: 'people', labelAr: 'العملاء', labelEn: 'Customers', route: '/company/customers', color: '#A78BFA' },
  { key: 'suppliers', icon: 'local-shipping', labelAr: 'الموردون', labelEn: 'Suppliers', route: '/company/suppliers', color: '#FB923C' },
  { key: 'products', icon: 'inventory-2', labelAr: 'المنتجات', labelEn: 'Products', route: '/company/products', color: '#38BDF8' },
  { key: 'inventory', icon: 'warehouse', labelAr: 'المخزون', labelEn: 'Inventory', route: '/company/inventory', color: '#4ADE80' },
  { key: 'accounting', icon: 'account-balance', labelAr: 'المحاسبة', labelEn: 'Accounting', route: '/company/accounting', color: '#E879F9' },
  { key: 'reports', icon: 'bar-chart', labelAr: 'التقارير', labelEn: 'Reports', route: '/company/reports', color: '#FCD34D' },
  { key: 'ai', icon: 'auto-awesome', labelAr: 'المساعد الذكي', labelEn: 'AI Assistant', route: '/company/ai', color: '#67E8F9' },
  { key: 'branches', icon: 'store', labelAr: 'الفروع', labelEn: 'Branches', route: '/company/branches', color: '#86EFAC' },
  { key: 'users', icon: 'manage-accounts', labelAr: 'المستخدمون', labelEn: 'Users', route: '/company/users', color: '#C4B5FD' },
  { key: 'roles', icon: 'shield', labelAr: 'الأدوار والصلاحيات', labelEn: 'Roles & Permissions', route: '/company/roles', color: '#A5B4FC' },
  { key: 'approval-workflows', icon: 'approval', labelAr: 'سير العمل', labelEn: 'Workflows', route: '/company/approval-workflows', color: '#FDE68A' },
  { key: 'audit-logs', icon: 'manage-search', labelAr: 'سجل المراجعة', labelEn: 'Audit Log', route: '/company/audit-logs', color: '#FCA5A5' },
  { key: 'integrations', icon: 'api', labelAr: 'التكاملات', labelEn: 'Integrations', route: '/company/integrations', color: '#7DD3FC' },
  { key: 'settings', icon: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', route: '/company/settings', color: '#D1D5DB' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState(false);

  const showLabels = !collapsed || isDesktop;
  const sidebarWidth = collapsed && isDesktop ? 68 : 260;

  const handleNav = (route: string) => {
    router.push(route as any);
    if (!isDesktop) onClose();
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={[
      styles.sidebar,
      { width: sidebarWidth, paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom },
      isRTL ? styles.sidebarRTL : styles.sidebarLTR,
    ]}>
      {/* Header */}
      <View style={[styles.sidebarHeader, collapsed && styles.sidebarHeaderCollapsed]}>
        {!collapsed ? (
          <View style={[styles.logoRow, isRTL && styles.logoRowRTL]}>
            <View style={styles.logoIcon}>
              <MaterialIcons name="account-balance" size={22} color={Colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName} numberOfLines={1}>
                {language === 'ar' ? 'المحاسبة الذكية' : 'Smart Accounting'}
              </Text>
              {user?.company_name ? (
                <Text style={styles.companyName} numberOfLines={1}>{user.company_name}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.logoIcon}>
            <MaterialIcons name="account-balance" size={20} color={Colors.textInverse} />
          </View>
        )}
        {isDesktop ? (
          <Pressable onPress={() => setCollapsed(p => !p)} style={styles.collapseBtn} hitSlop={8}>
            <MaterialIcons
              name={collapsed ? (isRTL ? 'chevron-left' : 'chevron-right') : (isRTL ? 'chevron-right' : 'chevron-left')}
              size={20}
              color={Colors.sidebarText}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Nav Items */}
      <ScrollView
        style={styles.navList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.route);
          return (
            <Pressable
              key={item.key}
              onPress={() => handleNav(item.route)}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
                collapsed && styles.navItemCollapsed,
                isRTL && styles.navItemRTL,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={20}
                color={active ? Colors.textInverse : item.color ?? Colors.sidebarText}
              />
              {showLabels ? (
                <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.sidebarFooter, collapsed && styles.sidebarFooterCollapsed]}>
        {!collapsed ? (
          <View style={[styles.userRow, isRTL && styles.userRowRTL]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user?.full_name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{user?.full_name ?? ''}</Text>
              <Text style={styles.userRole} numberOfLines={1}>{user?.role ?? ''}</Text>
            </View>
          </View>
        ) : null}
        <View style={[styles.footerActions, collapsed && styles.footerActionsCollapsed]}>
          <Pressable onPress={toggleLanguage} style={styles.footerBtn} hitSlop={8}>
            <MaterialIcons name="translate" size={18} color={Colors.sidebarText} />
            {!collapsed ? (
              <Text style={styles.footerBtnText}>{language === 'ar' ? 'EN' : 'AR'}</Text>
            ) : null}
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.footerBtn} hitSlop={8}>
            <MaterialIcons name="logout" size={18} color={Colors.danger} />
            {!collapsed ? (
              <Text style={[styles.footerBtnText, { color: Colors.danger }]}>
                {language === 'ar' ? 'خروج' : 'Logout'}
              </Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: Colors.sidebar,
    height: '100%',
    flexDirection: 'column',
  },
  sidebarLTR: { borderRightWidth: 1, borderRightColor: Colors.sidebarBorder },
  sidebarRTL: { borderLeftWidth: 1, borderLeftColor: Colors.sidebarBorder },

  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
    marginBottom: Spacing.sm,
  },
  sidebarHeaderCollapsed: { justifyContent: 'center', paddingHorizontal: Spacing.md },
  logoRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoRowRTL: { flexDirection: 'row-reverse' },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.sidebarActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    includeFontPadding: false,
  },
  companyName: {
    fontSize: Typography.fontSizeXS,
    color: Colors.sidebarText,
    includeFontPadding: false,
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.sidebarHover,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navList: { flex: 1, paddingHorizontal: Spacing.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  navItemRTL: { flexDirection: 'row-reverse' },
  navItemActive: { backgroundColor: Colors.sidebarActive },
  navItemPressed: { backgroundColor: Colors.sidebarHover },
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  navLabel: {
    fontSize: Typography.fontSizeSM,
    color: Colors.sidebarText,
    fontWeight: Typography.fontWeightMedium,
    flex: 1,
    includeFontPadding: false,
  },
  navLabelActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },

  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.sidebarBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sidebarFooterCollapsed: { alignItems: 'center' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  userRowRTL: { flexDirection: 'row-reverse' },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sidebarActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightBold,
    includeFontPadding: false,
  },
  userName: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
  userRole: {
    fontSize: Typography.fontSizeXS,
    color: Colors.sidebarText,
    includeFontPadding: false,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footerActionsCollapsed: { flexDirection: 'column', alignItems: 'center' },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.sidebarHover,
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.sidebarText,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
});
