// Audit Log Screen — Full audit trail viewer
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { AuditLog } from '../../types/database';

const ACTION_COLORS: Record<string, string> = {
  create: Colors.success,
  update: Colors.info,
  delete: Colors.danger,
  approve: '#7C3AED',
  void: Colors.warning,
  login: Colors.textMuted,
  logout: Colors.textMuted,
};

const ACTION_ICONS: Record<string, string> = {
  create: 'add-circle',
  update: 'edit',
  delete: 'delete',
  approve: 'check-circle',
  void: 'cancel',
  login: 'login',
  logout: 'logout',
};

const ACTION_LABELS_AR: Record<string, string> = {
  create: 'إنشاء', update: 'تعديل', delete: 'حذف',
  approve: 'اعتماد', void: 'إلغاء', login: 'دخول', logout: 'خروج',
};

const MODULE_LABELS_AR: Record<string, string> = {
  sales: 'المبيعات', purchases: 'المشتريات', expenses: 'المصروفات',
  customers: 'العملاء', suppliers: 'الموردون', products: 'المنتجات',
  inventory: 'المخزون', accounting: 'المحاسبة', reports: 'التقارير',
  branches: 'الفروع', users: 'المستخدمون', settings: 'الإعدادات', auth: 'المصادقة',
};

export default function AuditLogs() {
  const { language, isRTL } = useLanguage();
  const { logs } = useAudit();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const ACTION_FILTERS = ['all', 'create', 'update', 'delete', 'approve', 'login'];

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      (log.record_id ?? '').toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return language === 'ar' ? 'منذ قليل' : 'Just now';
    if (hours < 24) return language === 'ar' ? `${hours} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return language === 'ar' ? `${days} يوم` : `${days}d ago`;
    return d.toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const renderLog = ({ item }: { item: AuditLog }) => {
    const color = ACTION_COLORS[item.action] ?? Colors.textMuted;
    const icon = ACTION_ICONS[item.action] ?? 'info';
    const isExpanded = expanded === item.id;
    const moduleName = language === 'ar'
      ? (MODULE_LABELS_AR[item.module] ?? item.module)
      : item.module.charAt(0).toUpperCase() + item.module.slice(1);

    return (
      <Pressable
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        style={[styles.logCard, isRTL && styles.logCardRTL]}
      >
        <View style={[styles.logIcon, { backgroundColor: `${color}15` }]}>
          <MaterialIcons name={icon as any} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.logTop, isRTL && styles.logTopRTL]}>
            <Text style={[styles.logUser, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.user_name}
            </Text>
            <Text style={styles.logTime}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={[styles.logDesc, isRTL && styles.textRTL]}>
            <Text style={[styles.logAction, { color }]}>
              {language === 'ar' ? (ACTION_LABELS_AR[item.action] ?? item.action) : item.action}
            </Text>
            {' · '}
            {moduleName}
            {item.record_id ? ` · #${item.record_id.slice(-6)}` : ''}
          </Text>

          {/* Expanded detail */}
          {isExpanded && (item.previous_data || item.new_data) ? (
            <View style={[styles.expandedData, isRTL && styles.expandedDataRTL]}>
              {item.previous_data ? (
                <View style={styles.dataBlock}>
                  <Text style={[styles.dataLabel, { color: Colors.danger }]}>
                    {language === 'ar' ? 'قبل:' : 'Before:'}
                  </Text>
                  <Text style={styles.dataValue}>{JSON.stringify(item.previous_data, null, 2)}</Text>
                </View>
              ) : null}
              {item.new_data ? (
                <View style={styles.dataBlock}>
                  <Text style={[styles.dataLabel, { color: Colors.success }]}>
                    {language === 'ar' ? 'بعد:' : 'After:'}
                  </Text>
                  <Text style={styles.dataValue}>{JSON.stringify(item.new_data, null, 2)}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={16}
          color={Colors.textMuted}
        />
      </Pressable>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'سجل المراجعة' : 'Audit Log'}>
      <PermissionGuard module="settings" action="view">
        <View style={styles.root}>
          {/* Search */}
          <View style={[styles.searchRow, isRTL && styles.searchRowRTL]}>
            <View style={[styles.searchBox, isRTL && styles.searchBoxRTL]}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchInput, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'بحث في السجل...' : 'Search logs...'}
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          {/* Action filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {ACTION_FILTERS.map(action => (
                <Pressable
                  key={action}
                  onPress={() => setFilterAction(action)}
                  style={[
                    styles.chip,
                    filterAction === action && styles.chipActive,
                    action !== 'all' && filterAction === action && { backgroundColor: `${ACTION_COLORS[action]}15`, borderColor: ACTION_COLORS[action] },
                  ]}
                >
                  {action !== 'all' ? (
                    <View style={[styles.chipDot, { backgroundColor: ACTION_COLORS[action] }]} />
                  ) : null}
                  <Text style={[
                    styles.chipText,
                    filterAction === action && action !== 'all' && { color: ACTION_COLORS[action] },
                    filterAction === action && action === 'all' && styles.chipTextActive,
                  ]}>
                    {action === 'all'
                      ? (language === 'ar' ? 'الكل' : 'All')
                      : (language === 'ar' ? (ACTION_LABELS_AR[action] ?? action) : action.charAt(0).toUpperCase() + action.slice(1))}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Count */}
          <View style={[styles.countRow, isRTL && styles.countRowRTL]}>
            <Text style={styles.countText}>
              {language === 'ar' ? `${filtered.length} سجل` : `${filtered.length} entries`}
            </Text>
          </View>

          <FlatList
            data={filtered}
            renderItem={renderLog}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="history" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد سجلات' : 'No log entries found'}</Text>
              </View>
            }
          />
        </View>
      </PermissionGuard>
    </CompanyLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  searchRow: { flexDirection: 'row', padding: Spacing.base, paddingBottom: Spacing.sm },
  searchRowRTL: { flexDirection: 'row-reverse' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, height: 44,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },

  chips: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipDot: { width: 7, height: 7, borderRadius: 3.5 },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  chipTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },

  countRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  countRowRTL: { flexDirection: 'row-reverse' },
  countText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },

  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  logCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm,
  },
  logCardRTL: { flexDirection: 'row-reverse' },
  logIcon: {
    width: 36, height: 36, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  logTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  logTopRTL: { flexDirection: 'row-reverse' },
  logUser: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, flex: 1, includeFontPadding: false },
  logTime: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  logDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  logAction: { fontWeight: Typography.fontWeightSemibold },

  expandedData: { marginTop: Spacing.sm, gap: 8 },
  expandedDataRTL: {},
  dataBlock: {},
  dataLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, marginBottom: 2, includeFontPadding: false },
  dataValue: {
    fontSize: Typography.fontSizeXS, color: Colors.textSecondary,
    backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 8,
    fontFamily: 'monospace', includeFontPadding: false,
  },

  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
