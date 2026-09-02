// Bar Chart Component (pure RN - no external chart lib needed)
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { ChartDataPoint } from '../../types/database';

interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  color?: string;
  isRTL?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 160,
  color = Colors.primary,
  isRTL = false,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.titleRTL]}>{title}</Text>
      <View style={[styles.chart, { height }]}>
        {data.map((item, index) => {
          const barHeight = Math.max(4, (item.value / maxValue) * (height - 40));
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color ?? color,
                    }
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Horizontal bar for categories/breakdown
interface HorizontalBarProps {
  data: ChartDataPoint[];
  title: string;
  isRTL?: boolean;
}

export const HorizontalBar: React.FC<HorizontalBarProps> = ({ data, title, isRTL = false }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.titleRTL]}>{title}</Text>
      {data.map((item, index) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <View key={index} style={[styles.hRow, isRTL && styles.hRowRTL]}>
            <View style={[styles.hDot, { backgroundColor: item.color ?? Colors.primary }]} />
            <Text style={styles.hLabel} numberOfLines={1}>{item.label}</Text>
            <View style={styles.hBarBg}>
              <View style={[styles.hBar, { width: `${pct}%`, backgroundColor: item.color ?? Colors.primary }]} />
            </View>
            <Text style={styles.hPct}>{pct.toFixed(0)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    includeFontPadding: false,
  },
  titleRTL: { textAlign: 'right' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    borderRadius: Radius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // Horizontal
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  hRowRTL: { flexDirection: 'row-reverse' },
  hDot: { width: 8, height: 8, borderRadius: 4 },
  hLabel: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    width: 70,
    includeFontPadding: false,
  },
  hBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  hBar: {
    height: '100%',
    borderRadius: Radius.full,
  },
  hPct: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    width: 32,
    textAlign: 'right',
    includeFontPadding: false,
  },
});
