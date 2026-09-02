// Permission Guard Component — blocks UI if user lacks permission
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useLanguage } from '../../hooks/useLanguage';
import { AppModule, PermissionAction } from '../../types/permissions';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface PermissionGuardProps {
  module: AppModule;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module, action, children, fallback,
}) => {
  const { can } = usePermissions();
  const { isRTL } = useLanguage();

  if (!can(module, action)) {
    if (fallback) return <>{fallback}</>;
    return (
      <View style={styles.denied}>
        <MaterialIcons name="lock" size={40} color={Colors.textMuted} />
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {isRTL ? 'غير مصرح' : 'Access Denied'}
        </Text>
        <Text style={[styles.desc, isRTL && styles.textRTL]}>
          {isRTL
            ? 'ليس لديك صلاحية للوصول إلى هذا القسم'
            : 'You do not have permission to access this section'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  desc: {
    fontSize: Typography.fontSizeBase,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },
});
