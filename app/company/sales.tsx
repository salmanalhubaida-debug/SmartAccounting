// Sales Hub — Dashboard + Invoice List + Tabs
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useSales } from '../../contexts/SalesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { SALE_STATUS_CONFIG, SALES_CHANNEL_CONFIG, SaleInvoiceFull } from '../../types/sales';

type SalesTab = 'dashboard' | 'invoices' | 'quotations' | 'returns' | 'credit_notes';

const STATUS_FILTERS = [
  { key: 'all',             labelAr: 'الكل',           labelEn: 'All'          },
  { key: 'draft',           labelAr: 'مسودة',          labelEn: 'Draft'        },
  { key: 'approved',        labelAr: 'معتمدة',         labelEn: 'Approved'     },
  { key: 'partially_paid',  labelAr: 'جزئي',           labelEn: 'Partial'      },
  { key: 'paid',            labelAr: 'مدفوعة',         labelEn: 'Paid'         },
  { key: 'overdue',         labelAr: 'متأخرة',         labelEn: 'Overdue'      },
];

export default function Sales() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const {
    stats, getFilteredInvoices, filterStatus, setFilterStatus,
    searchQuery, setSearchQuery, creditNotes, returns,
  } = useSales();
  const [activeTab, setActiveTab] = useState<SalesTab>('dashboard');

  const invoices = getFilteredInvoices();

  const fmt = (n: number) =>
    `${n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${language === 'ar' ? 'د.ك' : 'KWD'}`;
  const fmtShort = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toFixed(3);
  };

  const TABS: { key: SalesTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'dashboard',    labelAr: 'الإحصاءات',     labelEn: 'Dashboard',    icon: 'dashboard'          },
    { key: 'invoices',     labelAr: 'الفواتير',       labelEn: 'Invoices',     icon: 'receipt-long'       },
    { key: 'returns',      labelAr: 'المرتجعات',      labelEn: 'Returns',      icon: 'assignment-return'  },
    { key: 'credit_notes', labelAr: 'إشعارات دائن',  labelEn: 'Credit Notes', icon: 'note-alt'           },
  ];

  const renderInvoiceRow = ({ item }: { item: SaleInvoiceFull }) => {
    const cfg = SALE_STATUS_CONFIG[item.status];
    const chCfg = SALES_CHANNEL_CONFIG[item.channel];
    return (
      <Pressable
        style={({ pressed }) => [styles.invoiceRow, isRTL && styles.invoiceRowRTL, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: '/company/sales-detail', params: { id: item.id } } as any)}
      >
        <View style={[styles.invLeft, isRTL && styles.invLeftRTL]}>
          <View style={[styles.channelDot, { backgroundColor: `${chCfg.color}20` }]}>
            <MaterialIcons name={chCfg.icon as any} size={16} color={chCfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.invTopRow, isRTL && styles.invTopRowRTL]}>
              <Text style={[styles.invNumber, isRTL && styles.textRTL]}>{item.invoice_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>
                  {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                </Text>
              </View>
            </View>
            <Text style={[styles.invCustomer, isRTL && styles.textRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.customer_name_ar ?? item.customer_name) : item.customer_name}
            </Text>
            <View style={[styles.invMeta, isRTL && styles.invMetaRTL]}>
              <Text style={styles.invDate}>{item.date}</Text>
              {item.due_date && item.status !== 'paid' ? (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={[styles.invDue, { color: item.status === 'overdue' ? Colors.danger : Colors.textMuted }]}>
                    {language === 'ar' ? `الاستحقاق: ${item.due_date}` : `Due: ${item.due_date}`}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>
        <View style={[styles.invRight, isRTL && styles.invRightRTL]}>
          <Text style={[styles.invTotal, isRTL && styles.textRTL]}>
            {item.total.toLocaleString('en-US', { minimumFractionDigits: 3 })}
          </Text>
          <Text style={styles.invCurrency}>{language === 'ar' ? 'د.ك' : 'KWD'}</Text>
          {item.outstanding > 0 ? (
            <Text style={[styles.invOutstanding, isRTL && styles.textRTL]}>
              {language === 'ar'
                ? `متبقي: ${item.outstanding.toFixed(3)}`
                : `Bal: ${item.outstanding.toFixed(3)}`}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'المبيعات' : 'Sales'}>
      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <MaterialIcons name={tab.icon as any} size={15} color={activeTab === tab.key ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {language === 'ar' ? tab.labelAr : tab.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ── DASHBOARD TAB ─────────────────────────────────────────── */}
      {activeTab === 'dashboard' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header action */}
          <Pressable style={[styles.newInvBtn, isRTL && styles.newInvBtnRTL]}
            onPress={() => router.push('/company/sales-create' as any)}>
            <MaterialIcons name="add" size={20} color={Colors.textInverse} />
            <Text style={styles.newInvBtnText}>{language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</Text>
          </Pressable>

          {/* KPI Cards */}
          <View style={styles.kpiGrid}>
            {[
              { labelAr: 'إجمالي المبيعات', labelEn: 'Total Revenue', value: stats.total_revenue, icon: 'trending-up', color: Colors.success, bg: Colors.successLight },
              { labelAr: 'الفواتير المدفوعة', labelEn: 'Paid', value: stats.total_paid, icon: 'check-circle', color: Colors.primary, bg: Colors.primaryLight },
              { labelAr: 'غير مدفوعة', labelEn: 'Unpaid', value: stats.total_unpaid, icon: 'pending', color: Colors.warning, bg: Colors.warningLight },
              { labelAr: 'متأخرة', labelEn: 'Overdue', value: stats.total_overdue, icon: 'warning', color: Colors.danger, bg: Colors.dangerLight },
            ].map((kpi, i) => (
              <View key={i} style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.bg }]}>
                  <MaterialIcons name={kpi.icon as any} size={20} color={kpi.color} />
                </View>
                <Text style={[styles.kpiLabel, isRTL && styles.textRTL]} numberOfLines={1}>
                  {language === 'ar' ? kpi.labelAr : kpi.labelEn}
                </Text>
                <Text style={[styles.kpiValue, { color: kpi.color }, isRTL && styles.textRTL]}>
                  {fmtShort(kpi.value)}
                </Text>
                <Text style={styles.kpiCurrency}>{language === 'ar' ? 'د.ك' : 'KWD'}</Text>
              </View>
            ))}
          </View>

          {/* Profitability Summary */}
          <View style={styles.profitCard}>
            <View style={[styles.profitHeader, isRTL && styles.profitHeaderRTL]}>
              <View style={[styles.profitIconBg, { backgroundColor: Colors.primaryLight }]}>
                <MaterialIcons name="insights" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.profitTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'الربحية التجارية' : 'Commercial Profitability'}
              </Text>
            </View>
            <View style={styles.profitGrid}>
              {[
                { labelAr: 'إجمالي الربح', labelEn: 'Gross Profit', value: stats.gross_profit, margin: stats.gross_margin_percent, color: Colors.success },
                { labelAr: 'الربح التجاري', labelEn: 'Commercial Profit', value: stats.commercial_profit, margin: stats.commercial_margin_percent, color: Colors.primary },
                { labelAr: 'تكلفة المبيعات', labelEn: 'COGS', value: stats.total_cogs, margin: null, color: Colors.textMuted },
              ].map((row, i) => (
                <View key={i} style={[styles.profitRow, isRTL && styles.profitRowRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.profitRowLabel, isRTL && styles.textRTL]}>
                      {language === 'ar' ? row.labelAr : row.labelEn}
                    </Text>
                  </View>
                  <View style={[styles.profitRowRight, isRTL && styles.profitRowRightRTL]}>
                    {row.margin !== null ? (
                      <View style={[styles.marginBadge, { backgroundColor: row.margin >= 30 ? Colors.successLight : row.margin >= 15 ? Colors.warningLight : Colors.dangerLight }]}>
                        <Text style={[styles.marginBadgeText, { color: row.margin >= 30 ? Colors.success : row.margin >= 15 ? Colors.warning : Colors.danger }]}>
                          {row.margin.toFixed(1)}%
                        </Text>
                      </View>
                    ) : null}
                    <Text style={[styles.profitRowValue, { color: row.color }, isRTL && styles.textRTL]}>
                      {row.value.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Invoice Status Summary */}
          <View style={styles.statusCard}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'ملخص الفواتير' : 'Invoice Summary'}
            </Text>
            <View style={styles.statusRow}>
              {[
                { labelAr: 'مدفوعة', labelEn: 'Paid', count: stats.count_paid, color: Colors.success },
                { labelAr: 'غير مدفوعة', labelEn: 'Unpaid', count: stats.count_unpaid, color: Colors.warning },
                { labelAr: 'متأخرة', labelEn: 'Overdue', count: stats.count_overdue, color: Colors.danger },
                { labelAr: 'مسودة', labelEn: 'Draft', count: stats.count_draft, color: Colors.textMuted },
              ].map((s, i) => (
                <View key={i} style={styles.statusItem}>
                  <Text style={[styles.statusCount, { color: s.color }]}>{s.count}</Text>
                  <Text style={styles.statusLabel}>{language === 'ar' ? s.labelAr : s.labelEn}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Invoices */}
          <View style={styles.recentCard}>
            <View style={[styles.recentHeader, isRTL && styles.recentHeaderRTL]}>
              <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'آخر الفواتير' : 'Recent Invoices'}
              </Text>
              <Pressable onPress={() => setActiveTab('invoices')}>
                <Text style={styles.viewAllLink}>{language === 'ar' ? 'عرض الكل' : 'View all'}</Text>
              </Pressable>
            </View>
            {getFilteredInvoices().slice(0, 4).map(inv => {
              const cfg = SALE_STATUS_CONFIG[inv.status];
              return (
                <Pressable key={inv.id} style={[styles.recentRow, isRTL && styles.recentRowRTL]}
                  onPress={() => router.push({ pathname: '/company/sales-detail', params: { id: inv.id } } as any)}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentNum, isRTL && styles.textRTL]}>{inv.invoice_number}</Text>
                    <Text style={[styles.recentCust, isRTL && styles.textRTL]} numberOfLines={1}>
                      {language === 'ar' ? (inv.customer_name_ar ?? inv.customer_name) : inv.customer_name}
                    </Text>
                  </View>
                  <View style={[styles.recentRight, isRTL && styles.recentRightRTL]}>
                    <Text style={styles.recentTotal}>
                      {inv.total.toLocaleString('en-US', { minimumFractionDigits: 3 })} {language === 'ar' ? 'د.ك' : 'KWD'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>
                        {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      ) : null}

      {/* ── INVOICES TAB ──────────────────────────────────────────── */}
      {activeTab === 'invoices' ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Search + New Invoice */}
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <View style={[styles.searchInput, isRTL && styles.searchInputRTL]}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchText, isRTL && { textAlign: 'right' }]}
                placeholder={language === 'ar' ? 'بحث في الفواتير...' : 'Search invoices...'}
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable style={styles.addBtn}
              onPress={() => router.push('/company/sales-create' as any)}>
              <MaterialIcons name="add" size={18} color={Colors.textInverse} />
            </Pressable>
          </View>
          {/* Status filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {STATUS_FILTERS.map(f => (
                <Pressable key={f.key} onPress={() => setFilterStatus(f.key)}
                  style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, filterStatus === f.key && styles.filterChipTextActive]}>
                    {language === 'ar' ? f.labelAr : f.labelEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {/* Invoice List */}
          <FlatList
            data={invoices}
            keyExtractor={i => i.id}
            renderItem={renderInvoiceRow}
            contentContainerStyle={{ padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}</Text>
              </View>
            }
          />
        </View>
      ) : null}

      {/* ── RETURNS TAB ───────────────────────────────────────────── */}
      {activeTab === 'returns' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? `${useSales().returns.length} مرتجع` : `${useSales().returns.length} returns`}
            </Text>
          </View>
          {returns.map(ret => (
            <View key={ret.id} style={[styles.returnCard, isRTL && styles.returnCardRTL]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.retNumber, isRTL && styles.textRTL]}>{ret.return_number}</Text>
                <Text style={[styles.retCust, isRTL && styles.textRTL]}>{ret.customer_name}</Text>
                <Text style={styles.retDate}>{ret.date}</Text>
                <Text style={[styles.retRef, isRTL && styles.textRTL]}>
                  {language === 'ar' ? `الفاتورة: ${ret.original_invoice_number}` : `Ref: ${ret.original_invoice_number}`}
                </Text>
              </View>
              <View style={[styles.retRight, isRTL && styles.retRightRTL]}>
                <Text style={[styles.retTotal, isRTL && styles.textRTL]}>
                  {ret.total.toFixed(3)} {language === 'ar' ? 'د.ك' : 'KWD'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: ret.status === 'completed' ? Colors.successLight : Colors.warningLight }]}>
                  <Text style={[styles.statusText, { color: ret.status === 'completed' ? Colors.success : Colors.warning }]}>
                    {ret.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Completed') : (language === 'ar' ? 'معلق' : 'Pending')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      ) : null}

      {/* ── CREDIT NOTES TAB ──────────────────────────────────────── */}
      {activeTab === 'credit_notes' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? `${creditNotes.length} إشعار دائن` : `${creditNotes.length} credit notes`}
            </Text>
          </View>
          {creditNotes.map(cn => (
            <View key={cn.id} style={[styles.returnCard, isRTL && styles.returnCardRTL]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.retNumber, isRTL && styles.textRTL]}>{cn.credit_note_number}</Text>
                <Text style={[styles.retCust, isRTL && styles.textRTL]}>{cn.customer_name}</Text>
                <Text style={styles.retDate}>{cn.date}</Text>
                <Text style={[styles.retRef, isRTL && styles.textRTL]}>
                  {language === 'ar' ? `السبب: ${cn.reason_ar ?? cn.reason}` : `Reason: ${cn.reason}`}
                </Text>
              </View>
              <View style={[styles.retRight, isRTL && styles.retRightRTL]}>
                <Text style={[styles.retTotal, isRTL && styles.textRTL]}>
                  {cn.amount.toFixed(3)} {language === 'ar' ? 'د.ك' : 'KWD'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: Colors.infoLight }]}>
                  <Text style={[styles.statusText, { color: Colors.info }]}>
                    {cn.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : cn.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      ) : null}
    </CompanyLayout>
  );
}

// Helper hook access in render
function useSalesReturns() {
  return useSales().returns;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  // New Invoice button
  newInvBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 13, borderRadius: Radius.lg, ...Shadow.md },
  newInvBtnRTL: { flexDirection: 'row-reverse' },
  newInvBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // KPI Grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiCard: { flex: 1, minWidth: 140, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: 4, ...Shadow.sm },
  kpiIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  kpiLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  kpiValue: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  kpiCurrency: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Profit Card
  profitCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  profitHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  profitHeaderRTL: { flexDirection: 'row-reverse' },
  profitIconBg: { width: 40, height: 40, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  profitTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  profitGrid: { gap: Spacing.sm },
  profitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  profitRowRTL: { flexDirection: 'row-reverse' },
  profitRowLabel: { fontSize: Typography.fontSizeBase, color: Colors.textSecondary, includeFontPadding: false },
  profitRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profitRowRightRTL: { flexDirection: 'row-reverse' },
  profitRowValue: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  marginBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  marginBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  // Status Summary
  statusCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  cardTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  statusRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statusItem: { alignItems: 'center', gap: 4 },
  statusCount: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  statusLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Recent
  recentCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  recentHeaderRTL: { flexDirection: 'row-reverse' },
  viewAllLink: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  recentRowRTL: { flexDirection: 'row-reverse' },
  recentRight: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  recentRightRTL: { alignItems: 'flex-start' },
  recentNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  recentCust: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  recentTotal: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  // Invoice List (Invoices Tab)
  searchBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  searchBarRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  searchInputRTL: { flexDirection: 'row-reverse' },
  searchText: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  addBtn: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: 10 },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  invoiceRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  invoiceRowRTL: { flexDirection: 'row-reverse' },
  invLeft: { flex: 1, flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  invLeftRTL: { flexDirection: 'row-reverse' },
  channelDot: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  invTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 },
  invTopRowRTL: { flexDirection: 'row-reverse' },
  invNumber: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  invCustomer: { fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  invMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  invMetaRTL: { flexDirection: 'row-reverse' },
  invDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  invDue: { fontSize: Typography.fontSizeXS, includeFontPadding: false },
  metaDot: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  invRight: { alignItems: 'flex-end', gap: 4, minWidth: 80 },
  invRightRTL: { alignItems: 'flex-start' },
  invTotal: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  invCurrency: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  invOutstanding: { fontSize: Typography.fontSizeXS, color: Colors.warning, includeFontPadding: false },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  // Returns & Credit Notes
  returnCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  returnCardRTL: { flexDirection: 'row-reverse' },
  retNumber: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  retCust: { fontSize: Typography.fontSizeBase, color: Colors.text, marginTop: 2, includeFontPadding: false },
  retDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  retRef: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  retRight: { alignItems: 'flex-end', gap: 6 },
  retRightRTL: { alignItems: 'flex-start' },
  retTotal: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
