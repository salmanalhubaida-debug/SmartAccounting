// Company Shell Layout — Sidebar + Main content
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  Platform, Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const isDesktop = width >= 1024;
const isTablet = width >= 768;

interface CompanyLayoutProps {
  title: string;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ title, children, rightActions }) => {
  const { isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isDesktop || isTablet) {
    return (
      <View style={styles.desktopRoot}>
        <Sidebar isOpen={true} onClose={() => {}} />
        <View style={styles.mainArea}>
          <View style={[styles.topBar, isRTL && styles.topBarRTL, { paddingTop: insets.top + 8 }]}>
            <Text style={[styles.pageTitle, isRTL && styles.textRTL]}>{title}</Text>
            {rightActions ? <View style={styles.rightActions}>{rightActions}</View> : null}
          </View>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    );
  }

  // Mobile
  return (
    <View style={styles.mobileRoot}>
      {/* Mobile top bar */}
      <View style={[styles.mobileTopBar, isRTL && styles.mobileTopBarRTL, { paddingTop: insets.top + 4 }]}>
        <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuBtn} hitSlop={8}>
          <MaterialIcons name="menu" size={24} color={Colors.text} />
        </Pressable>
        <Text style={[styles.mobileTitle, isRTL && styles.textRTL]} numberOfLines={1}>{title}</Text>
        {rightActions ? <View>{rightActions}</View> : <View style={{ width: 44 }} />}
      </View>

      {/* Mobile drawer */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="none"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={[styles.drawerOverlay, isRTL && styles.drawerOverlayRTL]}>
          <Pressable style={styles.drawerBackdrop} onPress={() => setSidebarOpen(false)} />
          <View style={[styles.drawerPanel, isRTL && styles.drawerPanelRTL]}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </View>
        </View>
      </Modal>

      <View style={styles.mobileContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop/Tablet
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  mainArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  topBarRTL: { flexDirection: 'row-reverse' },
  pageTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    includeFontPadding: false,
  },
  rightActions: { flexDirection: 'row', gap: Spacing.sm },
  content: { flex: 1 },
  textRTL: { textAlign: 'right' },

  // Mobile
  mobileRoot: { flex: 1, backgroundColor: Colors.background },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mobileTopBarRTL: { flexDirection: 'row-reverse' },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  mobileContent: { flex: 1 },

  // Drawer
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerOverlayRTL: { flexDirection: 'row-reverse' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerPanel: { width: 260 },
  drawerPanelRTL: {},
});
