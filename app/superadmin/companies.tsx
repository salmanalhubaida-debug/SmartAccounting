import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { DEMO_COMPANIES } from '../../services/mockData';
import { Company } from '../../types/database';

export default function Companies() {
  const { language, isRTL } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = DEMO_COMPANIES.filter(c =>
    (language === 'ar' ? c.name_ar : c.name).toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => s === 'active' ? Colors.success : s === 'suspended' ? Colors.danger : Colors.warning;
  const statusLabel = (s: string) => {
    const map: Record<string, string> = { active: language === 'ar' ? 'نشط' : 'Active', suspended: language === 'ar' ? 'موقوف' : 'Suspended', trial: language === 'ar' ? 'تجريبي' : 'Trial' };
    return map[s] ?? s;
  };

  const renderItem = ({ item }: { item: Company }) => (
    <View style={[styles.card, isRTL && styles.cardRTL]}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{(language === 'ar' ? item.name_ar : item.name).charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardName, isRTL && styles.textRTL]} numberOfLines={1}>
          {language === 'ar' ? item.name_ar : item.name}
        </Text>
        <Text style={[styles.cardMeta, isRTL && styles.textRTL]} numberOfLines={1}>
          {item.email} · {item.country}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}18` }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
        </View>
        <View style={[styles.actionsRow, isRTL && styles.actionsRowRTL]}>
          <Pressable style={styles.actionIcon} hitSlop={8}>
            <MaterialIcons name="edit" size={16} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.actionIcon} hitSlop={8}>
            <MaterialIcons name="visibility" size={16} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionIcon} hitSlop={8}>
            <MaterialIcons name={item.status === 'active' ? 'block' : 'check-circle'} size={16} color={item.status === 'active' ? Colors.danger : Colors.success} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SuperAdminLayout title={language === 'ar' ? 'إدارة الشركات' : 'Companies'}>
      <View style={styles.root}>
        <View style={styles.toolbar}>
          <View style={[styles.searchBox, isRTL && styles.searchBoxRTL]}>
            <MaterialIcons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={[styles.searchInput, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'بحث عن شركة...' : 'Search companies...'}
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          <Pressable style={styles.addBtn}>
            <MaterialIcons name="add" size={18} color={Colors.textInverse} />
            <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة شركة' : 'Add Company'}</Text>
          </Pressable>
        </View>
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد شركات' : 'No companies found'}</Text>
            </View>
          }
        />
      </View>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, padding: Spacing.base,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: Colors.surface,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border, height: 44,
  },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.base,
    paddingVertical: 10, borderRadius: Radius.md,
  },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm,
  },
  cardRTL: { flexDirection: 'row-reverse' },
  cardAvatar: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  cardAvatarText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  cardName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  cardMeta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  actionsRow: { flexDirection: 'row', gap: 4 },
  actionsRowRTL: { flexDirection: 'row-reverse' },
  actionIcon: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, marginTop: Spacing.md, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
