// Purchases Hub — Dashboard + Invoices + POs + GRNs + Landed Costs + Returns
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { usePurchases } from '../../contexts/PurchasesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  PURCHASE_STATUS_CONFIG, PO_STATUS_CONFIG, LANDED_COST_STATUS_CONFIG,
  PurchaseInvoiceFull, PurchaseOrder, LandedCost,
} from '../../types/purchases';

type PurchasesTab = 'dashboard' | 'invoices' | 'orders' | 'receipts' | 'landed_costs' | 'returns';

const STATUS_FILTERS = [
  { key: 'all',           labelAr: 'الكل',         labelEn: 'All'       },
  { key: 'draft',         labelAr: 'مسودة',        labelEn: 'Draft'     },
  { key: 'approved',      labelAr: 'معتمدة',       labelEn: 'Approved'  },
  { key: 'partially_paid',labelAr: 'جزئي',         labelEn: 'Partial'   },
  { key: 'paid',          labelAr: 'مدفوعة',       labelEn: 'Paid'      },
  { key: 'overdue',       labelAr: 'متأخرة',       labelEn: 'Overdue'   },
];

export default function Purchases() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const {
    stats, getFilteredInvoices, purchaseOrders, goodsReceipts, landedCosts,
    returns, supplierCreditNotes, filterStatus, setFilterStatus,
    searchQuery, setSearchQuery, activeTab, setActiveTab,
  } = usePurchases();

  const invoices = getFilteredInvoices();

  const fmt3 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(3);
  const curr = language === 'ar' ? 'د.ك' : 'KWD';

  const TABS: { key: PurchasesTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'dashboard',    labelAr: 'الإحصاءات',    labelEn: 'Dashboard',     icon: 'dashboard'       },
    { key: 'invoices',     labelAr: 'الفواتير',      labelEn: 'Invoices',      icon: 'receipt-long'    },
    { key: 'orders',       labelAr: 'طلبات الشراء',  labelEn: 'Orders',        icon: 'assignment'      },
    { key: 'receipts',     labelAr: 'الاستلام',      labelEn: 'Receipts',      icon: 'inventory'       },
    { key: 'landed_costs', labelAr: 'تكاليف الاستيراد', labelEn: 'Landed Costs', icon: 'local-shipping' },
    { key: 'returns',      labelAr: 'المرتجعات',     labelEn: 'Returns',       icon: 'undo'            },
  ];

  // ── INVOICE ROW ────────────────────────────────────────────────
  const renderInvoiceRow = ({ item }: { item: PurchaseInvoiceFull }) => {
    const cfg = PURCHASE_STATUS_CONFIG[item.status];
    const hasMismatch = item.matching_status === 'mismatch';
    return (
      <Pressable
        style={({ pressed }) => [styles.listRow, isRTL && styles.listRowRTL, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: '/company/purchase-detail', params: { id: item.id } } as any)}
      >
        <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.warningLight }]}>
            <MaterialIcons name="receipt-long" size={16} color={Colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.rowTopLine, isRTL && styles.rowTopLineRTL]}>
              <Text style={[styles.rowNumber, isRTL && styles.txtRTL]}>{item.invoice_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>
                  {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                </Text>
              </View>
              {hasMismatch ? (
                <View style={styles.mismatchBadge}>
                  <MaterialIcons name="warning" size={10} color={Colors.danger} />
                  <Text style={styles.mismatchText}>
                    {language === 'ar' ? 'تباين' : 'Mismatch'}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.rowSub, isRTL && styles.txtRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.supplier_name_ar ?? item.supplier_name) : item.supplier_name}
            </Text>
            <View style={[styles.rowMeta, isRTL && styles.rowMetaRTL]}>
              <Text style={styles.rowDate}>{item.date}</Text>
              {item.supplier_invoice_number ? (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.rowDate}>{item.supplier_invoice_number}</Text>
                </>
              ) : null}
            </View>
          </View>
        </View>
        <View style={[styles.rowRight, isRTL && styles.rowRightRTL]}>
          <Text style={[styles.rowTotal, isRTL && styles.txtRTL]}>{fmt3(item.total)}</Text>
          <Text style={styles.rowCurr}>{curr}</Text>
          {item.outstanding > 0 ? (
            <Text style={[styles.rowBal, isRTL && styles.txtRTL]}>
              {language === 'ar' ? `متبقي: ${fmt3(item.outstanding)}` : `Bal: ${fmt3(item.outstanding)}`}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  // ── PO ROW ─────────────────────────────────────────────────────
  const renderPORow = ({ item }: { item: PurchaseOrder }) => {
    const cfg = PO_STATUS_CONFIG[item.status];
    const pct = item.total_ordered_qty > 0 ? (item.total_received_qty / item.total_ordered_qty) * 100 : 0;
    return (
      <View style={[styles.listRow, isRTL && styles.listRowRTL]}>
        <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.primaryLight }]}>
            <MaterialIcons name="assignment" size={16} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.rowTopLine, isRTL && styles.rowTopLineRTL]}>
              <Text style={[styles.rowNumber, isRTL && styles.txtRTL]}>{item.po_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>{language === 'ar' ? cfg.labelAr : cfg.labelEn}</Text>
              </View>
            </View>
            <Text style={[styles.rowSub, isRTL && styles.txtRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.supplier_name_ar ?? item.supplier_name) : item.supplier_name}
            </Text>
            <View style={[styles.rowMeta, isRTL && styles.rowMetaRTL]}>
              <Text style={styles.rowDate}>{item.date}</Text>
              {item.expected_delivery_date ? (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.rowDate}>{language === 'ar' ? `تسليم: ${item.expected_delivery_date}` : `ETA: ${item.expected_delivery_date}`}</Text>
                </>
              ) : null}
            </View>
            {/* Receiving progress */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%`, backgroundColor: pct >= 100 ? Colors.success : Colors.primary }]} />
              </View>
              <Text style={styles.progressText}>
                {item.total_received_qty}/{item.total_ordered_qty} {language === 'ar' ? 'مستلم' : 'received'}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.rowRight, isRTL && styles.rowRightRTL]}>
          <Text style={[styles.rowTotal, isRTL && styles.txtRTL]}>{fmt3(item.total_company_currency)}</Text>
          <Text style={styles.rowCurr}>{curr}</Text>
          <Text style={[styles.rowDate, { color: Colors.textMuted }]}>{item.currency}</Text>
        </View>
      </View>
    );
  };

  // ── LANDED COST ROW ────────────────────────────────────────────
  const renderLCRow = ({ item }: { item: LandedCost }) => {
    const cfg = LANDED_COST_STATUS_CONFIG[item.status];
    const totalLines = item.cost_lines.length;
    return (
      <View style={[styles.listRow, isRTL && styles.listRowRTL]}>
        <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
          <View style={[styles.rowIcon, { backgroundColor: '#FFF7ED' }]}>
            <MaterialIcons name="local-shipping" size={16} color="#F97316" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.rowTopLine, isRTL && styles.rowTopLineRTL]}>
              <Text style={[styles.rowNumber, isRTL && styles.txtRTL]}>{item.landed_cost_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>{language === 'ar' ? cfg.labelAr : cfg.labelEn}</Text>
              </View>
            </View>
            <Text style={[styles.rowSub, isRTL && styles.txtRTL]} numberOfLines={1}>
              {item.vendor_name ?? (language === 'ar' ? 'مورد الشحن' : 'Freight Vendor')}
            </Text>
            <View style={[styles.rowMeta, isRTL && styles.rowMetaRTL]}>
              <Text style={styles.rowDate}>{item.date}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.rowDate}>
                {totalLines} {language === 'ar' ? 'بنود تكلفة' : 'cost lines'}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.rowRight, isRTL && styles.rowRightRTL]}>
          <Text style={[styles.rowTotal, { color: '#F97316' }, isRTL && styles.txtRTL]}>{fmt3(item.total_cost_kwd)}</Text>
          <Text style={styles.rowCurr}>{curr}</Text>
        </View>
      </View>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'المشتريات' : 'Purchases'}>
      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <MaterialIcons name={tab.icon as any} size={14} color={activeTab === tab.key ? Colors.warning : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {language === 'ar' ? tab.labelAr : tab.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ── DASHBOARD ───────────────────────────────────────────── */}
      {activeTab === 'dashboard' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* New Invoice CTA */}
          <Pressable style={[styles.newBtn, isRTL && styles.newBtnRTL]}
            onPress={() => router.push('/company/purchase-create' as any)}>
            <MaterialIcons name="add" size={20} color={Colors.textInverse} />
            <Text style={styles.newBtnText}>{language === 'ar' ? 'فاتورة شراء جديدة' : 'New Purchase Invoice'}</Text>
          </Pressable>

          {/* KPI Row */}
          <View style={styles.kpiGrid}>
            {[
              { labelAr: 'إجمالي المشتريات', labelEn: 'Total Purchases', value: stats.total_purchases, icon: 'shopping-cart', color: Colors.warning, bg: Colors.warningLight },
              { labelAr: 'مدفوعة', labelEn: 'Paid', value: stats.total_paid, icon: 'check-circle', color: Colors.success, bg: Colors.successLight },
              { labelAr: 'مستحقة', labelEn: 'Payable', value: stats.outstanding_payables, icon: 'pending', color: Colors.primary, bg: Colors.primaryLight },
              { labelAr: 'متأخرة', labelEn: 'Overdue', value: stats.overdue_payables, icon: 'warning', color: Colors.danger, bg: Colors.dangerLight },
            ].map((kpi, i) => (
              <View key={i} style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.bg }]}>
                  <MaterialIcons name={kpi.icon as any} size={20} color={kpi.color} />
                </View>
                <Text style={[styles.kpiLabel, isRTL && styles.txtRTL]} numberOfLines={1}>
                  {language === 'ar' ? kpi.labelAr : kpi.labelEn}
                </Text>
                <Text style={[styles.kpiValue, { color: kpi.color }, isRTL && styles.txtRTL]}>
                  {fmtK(kpi.value)}
                </Text>
                <Text style={styles.kpiCurr}>{curr}</Text>
              </View>
            ))}
          </View>

          {/* Pending Work */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.txtRTL]}>
              {language === 'ar' ? 'العمليات المعلقة' : 'Pending Operations'}
            </Text>
            {[
              { labelAr: 'طلبات شراء معلقة', labelEn: 'Pending POs', value: stats.pending_pos, icon: 'assignment', color: Colors.primary },
              { labelAr: 'استلام بضاعة معلق', labelEn: 'Pending Receipts', value: stats.pending_receipts, icon: 'inventory', color: Colors.warning },
              { labelAr: 'تكاليف استيراد إجمالية', labelEn: 'Total Landed Costs', value: stats.landed_costs_total, icon: 'local-shipping', color: '#F97316', isMoney: true },
              { labelAr: 'تباين في الأسعار', labelEn: 'Price Variance', value: stats.purchase_price_variance, icon: 'compare-arrows', color: Colors.danger, isMoney: true },
            ].map((row, i) => (
              <View key={i} style={[styles.pendingRow, isRTL && styles.pendingRowRTL]}>
                <View style={[styles.pendingIcon, { backgroundColor: `${row.color}15` }]}>
                  <MaterialIcons name={row.icon as any} size={16} color={row.color} />
                </View>
                <Text style={[styles.pendingLabel, isRTL && styles.txtRTL]}>
                  {language === 'ar' ? row.labelAr : row.labelEn}
                </Text>
                <Text style={[styles.pendingValue, { color: row.color }]}>
                  {row.isMoney ? `${fmt3(row.value)} ${curr}` : row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Invoice Status Summary */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.txtRTL]}>
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
          <View style={styles.card}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 0 }]}>
                {language === 'ar' ? 'آخر الفواتير' : 'Recent Invoices'}
              </Text>
              <Pressable onPress={() => setActiveTab('invoices')}>
                <Text style={styles.viewAll}>{language === 'ar' ? 'عرض الكل' : 'View all'}</Text>
              </Pressable>
            </View>
            {invoices.slice(0, 4).map(inv => {
              const cfg = PURCHASE_STATUS_CONFIG[inv.status];
              return (
                <Pressable key={inv.id}
                  style={[styles.recentRow, isRTL && styles.recentRowRTL]}
                  onPress={() => router.push({ pathname: '/company/purchase-detail', params: { id: inv.id } } as any)}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentNum, isRTL && styles.txtRTL]}>{inv.invoice_number}</Text>
                    <Text style={[styles.recentSub, isRTL && styles.txtRTL]} numberOfLines={1}>
                      {language === 'ar' ? (inv.supplier_name_ar ?? inv.supplier_name) : inv.supplier_name}
                    </Text>
                  </View>
                  <View style={[styles.recentRight, isRTL && styles.recentRightRTL]}>
                    <Text style={styles.recentTotal}>{fmt3(inv.total)} {curr}</Text>
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

          {/* Landed Costs Summary */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 0 }]}>
                {language === 'ar' ? 'تكاليف الاستيراد' : 'Landed Costs'}
              </Text>
              <Pressable onPress={() => setActiveTab('landed_costs')}>
                <Text style={styles.viewAll}>{language === 'ar' ? 'عرض الكل' : 'View all'}</Text>
              </Pressable>
            </View>
            {landedCosts.slice(0, 3).map(lc => {
              const cfg = LANDED_COST_STATUS_CONFIG[lc.status];
              return (
                <View key={lc.id} style={[styles.recentRow, isRTL && styles.recentRowRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentNum, isRTL && styles.txtRTL]}>{lc.landed_cost_number}</Text>
                    <Text style={[styles.recentSub, isRTL && styles.txtRTL]}>{lc.vendor_name}</Text>
                  </View>
                  <View style={[styles.recentRight, isRTL && styles.recentRightRTL]}>
                    <Text style={[styles.recentTotal, { color: '#F97316' }]}>{fmt3(lc.total_cost_kwd)} {curr}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>
                        {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      ) : null}

      {/* ── INVOICES ────────────────────────────────────────────── */}
      {activeTab === 'invoices' ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <View style={[styles.searchInput, isRTL && styles.searchInputRTL]}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchText, isRTL && { textAlign: 'right' }]}
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable style={styles.addBtn}
              onPress={() => router.push('/company/purchase-create' as any)}>
              <MaterialIcons name="add" size={18} color={Colors.textInverse} />
            </Pressable>
          </View>
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

      {/* ── PURCHASE ORDERS ─────────────────────────────────────── */}
      {activeTab === 'orders' ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }, isRTL && styles.txtRTL]}>
              {language === 'ar' ? `${purchaseOrders.length} طلب شراء` : `${purchaseOrders.length} Purchase Orders`}
            </Text>
            <Pressable style={styles.addBtn}>
              <MaterialIcons name="add" size={18} color={Colors.textInverse} />
            </Pressable>
          </View>
          <FlatList
            data={purchaseOrders}
            keyExtractor={i => i.id}
            renderItem={renderPORow}
            contentContainerStyle={{ padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : null}

      {/* ── GOODS RECEIPTS ──────────────────────────────────────── */}
      {activeTab === 'receipts' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {goodsReceipts.map(grn => (
            <View key={grn.id} style={[styles.listRow, isRTL && styles.listRowRTL]}>
              <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={[styles.rowIcon, { backgroundColor: Colors.successLight }]}>
                  <MaterialIcons name="inventory" size={16} color={Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.rowTopLine, isRTL && styles.rowTopLineRTL]}>
                    <Text style={[styles.rowNumber, isRTL && styles.txtRTL]}>{grn.grn_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: grn.status === 'approved' ? Colors.successLight : grn.status === 'rejected' ? Colors.dangerLight : Colors.warningLight }]}>
                      <Text style={[styles.statusText, { color: grn.status === 'approved' ? Colors.success : grn.status === 'rejected' ? Colors.danger : Colors.warning }]}>
                        {grn.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : grn.status === 'rejected' ? (language === 'ar' ? 'مرفوض' : 'Rejected') : (language === 'ar' ? 'بانتظار الاعتماد' : 'Pending')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.rowSub, isRTL && styles.txtRTL]}>{grn.supplier_name}</Text>
                  <View style={[styles.rowMeta, isRTL && styles.rowMetaRTL]}>
                    <Text style={styles.rowDate}>{grn.receipt_date}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={[styles.rowDate, grn.total_damaged > 0 && { color: Colors.danger }]}>
                      {language === 'ar'
                        ? `مستلم: ${grn.total_received} | تالف: ${grn.total_damaged}`
                        : `Received: ${grn.total_received} | Damaged: ${grn.total_damaged}`}
                    </Text>
                  </View>
                  {grn.po_number ? (
                    <Text style={[styles.rowDate, { color: Colors.primary }]}>
                      {language === 'ar' ? `طلب: ${grn.po_number}` : `PO: ${grn.po_number}`}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={[styles.rowRight, isRTL && styles.rowRightRTL]}>
                <Text style={[styles.rowTotal, isRTL && styles.txtRTL]}>{grn.total_received}</Text>
                <Text style={styles.rowCurr}>{language === 'ar' ? 'وحدة' : 'units'}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      ) : null}

      {/* ── LANDED COSTS ────────────────────────────────────────── */}
      {activeTab === 'landed_costs' ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }, isRTL && styles.txtRTL]}>
              {language === 'ar' ? `${landedCosts.length} تكاليف استيراد` : `${landedCosts.length} Landed Costs`}
            </Text>
          </View>
          <FlatList
            data={landedCosts}
            keyExtractor={i => i.id}
            renderItem={renderLCRow}
            contentContainerStyle={{ padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : null}

      {/* ── RETURNS ─────────────────────────────────────────────── */}
      {activeTab === 'returns' ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {returns.map(ret => (
            <View key={ret.id} style={[styles.listRow, isRTL && styles.listRowRTL]}>
              <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={[styles.rowIcon, { backgroundColor: Colors.dangerLight }]}>
                  <MaterialIcons name="undo" size={16} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowNumber, isRTL && styles.txtRTL]}>{ret.return_number}</Text>
                  <Text style={[styles.rowSub, isRTL && styles.txtRTL]}>{ret.supplier_name}</Text>
                  <Text style={styles.rowDate}>{ret.date}</Text>
                  <Text style={[styles.rowDate, { color: Colors.textMuted }]}>
                    {language === 'ar' ? `الفاتورة: ${ret.original_invoice_number}` : `Ref: ${ret.original_invoice_number}`}
                  </Text>
                </View>
              </View>
              <View style={[styles.rowRight, isRTL && styles.rowRightRTL]}>
                <Text style={[styles.rowTotal, { color: Colors.danger }, isRTL && styles.txtRTL]}>-{fmt3(ret.total)}</Text>
                <Text style={styles.rowCurr}>{curr}</Text>
                <View style={[styles.statusBadge, { backgroundColor: ret.status === 'completed' ? Colors.successLight : Colors.warningLight }]}>
                  <Text style={[styles.statusText, { color: ret.status === 'completed' ? Colors.success : Colors.warning }]}>
                    {ret.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Done') : (language === 'ar' ? 'معلق' : 'Pending')}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base },
  // Tabs
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.warning },
  tabText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.warning, fontWeight: Typography.fontWeightSemibold },
  // New button
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.warning, paddingVertical: 13, borderRadius: Radius.lg, ...Shadow.md },
  newBtnRTL: { flexDirection: 'row-reverse' },
  newBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // KPI
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiCard: { flex: 1, minWidth: 140, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: 4, ...Shadow.sm },
  kpiIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  kpiLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  kpiValue: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  kpiCurr: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Cards
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  cardTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  cardHeaderRTL: { flexDirection: 'row-reverse' },
  viewAll: { fontSize: Typography.fontSizeSM, color: Colors.warning, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Pending rows
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  pendingRowRTL: { flexDirection: 'row-reverse' },
  pendingIcon: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  pendingLabel: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  pendingValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  // Status summary
  statusRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statusItem: { alignItems: 'center', gap: 4 },
  statusCount: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  statusLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Recent rows
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  recentRowRTL: { flexDirection: 'row-reverse' },
  recentRight: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  recentRightRTL: { alignItems: 'flex-start' },
  recentNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  recentSub: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  recentTotal: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  // List rows
  listRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  listRowRTL: { flexDirection: 'row-reverse' },
  rowLeft: { flex: 1, flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  rowLeftRTL: { flexDirection: 'row-reverse' },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 },
  rowTopLineRTL: { flexDirection: 'row-reverse' },
  rowNumber: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  rowSub: { fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rowMetaRTL: { flexDirection: 'row-reverse' },
  rowDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  metaDot: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  rowRight: { alignItems: 'flex-end', gap: 4, minWidth: 80 },
  rowRightRTL: { alignItems: 'flex-start' },
  rowTotal: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  rowCurr: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  rowBal: { fontSize: Typography.fontSizeXS, color: Colors.warning, includeFontPadding: false },
  // Status badges
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  mismatchBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.dangerLight },
  mismatchText: { fontSize: 10, color: Colors.danger, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // PO Progress
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Search bar
  searchBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  searchBarRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  searchInputRTL: { flexDirection: 'row-reverse' },
  searchText: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  addBtn: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: 10 },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  filterChipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  txtRTL: { textAlign: 'right' },
});
