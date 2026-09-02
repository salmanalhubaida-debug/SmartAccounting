// Module Placeholder Screen — Used for all not-yet-built modules
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { useLanguage } from '../../hooks/useLanguage';

interface PlaceholderScreenProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
  accentColor?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  icon,
  titleAr,
  titleEn,
  descAr,
  descEn,
  accentColor = Colors.primary,
}) => {
  const { language, isRTL } = useLanguage();
  const title = language === 'ar' ? titleAr : titleEn;
  const desc = language === 'ar' ? descAr : descEn;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}15` }]}>
        <MaterialIcons name={icon} size={52} color={accentColor} />
      </View>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      {desc ? (
        <Text style={[styles.desc, isRTL && styles.textRTL]}>{desc}</Text>
      ) : null}
      <View style={styles.badge}>
        <MaterialIcons name="schedule" size={14} color={Colors.warning} />
        <Text style={styles.badgeText}>
          {language === 'ar' ? 'سيتم بناؤه في المرحلة القادمة' : 'Will be built in the next phase'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    backgroundColor: Colors.background,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  desc: {
    fontSize: Typography.fontSizeBase,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    includeFontPadding: false,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.warning,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },
});
