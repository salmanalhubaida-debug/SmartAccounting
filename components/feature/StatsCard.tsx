// KPI Stats Card Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

interface StatsCardProps {
  title: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  trend?: number; // percentage change
  trendLabel?: string;
  isRTL?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconColor = Colors.primary,
  iconBg = Colors.primaryLight,
  trend,
  trendLabel,
  isRTL = false,
}) => {
  const isPositive = trend !== undefined && trend >= 0;
  const trendColor = isPositive ? Colors.positive : Colors.negative;
  const trendIcon = isPositive ? 'trending-up' : 'trending-down';

  return (
    <View style={styles.card}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        {trend !== undefined ? (
          <View style={[styles.trendBadge, { backgroundColor: isPositive ? Colors.successLight : Colors.errorLight }]}>
            <MaterialIcons name={trendIcon} size={12} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {Math.abs(trend).toFixed(1)}%
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.value, isRTL && styles.textRTL]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={1}>{title}</Text>
      {trendLabel ? (
        <Text style={[styles.trendLabel, isRTL && styles.textRTL]}>{trendLabel}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flex: 1,
    minWidth: 140,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 2,
  },
  trendText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemibold,
    includeFontPadding: false,
  },
  value: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 4,
    includeFontPadding: false,
  },
  title: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
  trendLabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 4,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },
});
