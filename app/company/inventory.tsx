// Inventory Hub — Warehouses, Transfers, Adjustments, Counts, Alerts
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  TRANSFER_STATUS_CONFIG, ADJUSTMENT_STATUS_CONFIG,
  StockTransfer, StockAdjustment, Warehouse,
} from '../../types/inventory';
import { useAlert } from '@/template';

type InventoryTab = 'warehouses' | 'transfers' | 'adjustments' | 'alerts';

export default function Inventory() {
  const { language, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const {
    warehouses, addWarehouse, updateWarehouse,
    transfers, createTransfer, updateTransferStatus,
    adjustments, approveAdjustment, applyAdjustment, rejectAdjustment,
    lowStockAlerts, products, stockLevels, totalInventoryValue,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<InventoryTab>('warehouses');
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [editingWH, setEditingWH] = useState<Warehouse | null>(null);
  const [whForm, setWhForm] = useState({ name: '', name_ar: '', code: '', address: '', phone: '', manager_name: '' });

  const fmtCurrency = (n: number) => `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Stats
  const stats = useMemo(() => ({
    activeWarehouses: warehouses.filter(w => w.status === 'active').length,
    pendingTransfers: transfers.filter(t => t.status === 'in_transit').length,
    pendingAdjustments: adjustments.filter(a => a.status === 'pending_approval').length,
    totalAlerts: lowStockAlerts.length,
    outOfStock: lowStockAlerts.filter(a => a.severity === 'out_of_stock').length,
  }), [warehouses, transfers, adjustments, lowStockAlerts]);

  const handleSaveWarehouse = () => {
    if (!whForm.name.trim()) return;
    const data = {
      company_id: 'company-001', name: whForm.name, name_ar: whForm.name_ar || undefined,
      code: whForm.code, address: whForm.address || undefined,
      phone: whForm.phone || undefined, manager_name: whForm.manager_name || undefined,
      status: 'active' as const, is_default: false,
    };
    if (editingWH) {
      updateWarehouse(editingWH.id, data);
      log({ action: 'update', module: 'inventory', record_id: editingWH.id, record_type: 'warehouse', new_data: { name: whForm.name } });
    } else {
      addWarehouse(data);
      log({ action: 'create', module: 'inventory', record_id: `wh-new`, record_type: 'warehouse', new_data: { name: whForm.name, code: whForm.code } });
    }
    setWarehouseModal(false);
  };

  const openAddWH = () => {
    setEditingWH(null);
    setWhForm({ name: '', name_ar: '', code: `WH-${String(warehouses.length + 1).padStart(3, '0')}`, address: '', phone: '', manager_name: '' });
    setWarehouseModal(true);
  };

  const openEditWH = (wh: Warehouse) => {
    setEditingWH(wh);
    setWhForm({ name: wh.name, name_ar: wh.name_ar ?? '', code: wh.code, address: wh.address ?? '', phone: wh.phone ?? '', manager_name: wh.manager_name ?? '' });
    setWarehouseModal(true);
  };

  const handleTransferAction = (transfer: StockTransfer) => {
    const actions: { text: string; action: string }[] = [];
    if (transfer.status === 'draft') actions.push({ text: language === 'ar' ? 'اعتماد' : 'Approve', action: 'approved' });
    if (transfer.status === 'approved') actions.push({ text: language === 'ar' ? 'تحديد في الطريق' : 'Mark In Transit', action: 'in_transit' });
    if (transfer.status === 'in_transit') actions.push({ text: language === 'ar' ? 'إتمام التحويل' : 'Complete Transfer', action: 'completed' });

    if (actions.length === 0) return;
    showAlert(
      language === 'ar' ? 'إجراء على التحويل' : 'Transfer Action',
      transfer.transfer_number,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        ...actions.map(a => ({
          text: a.text,
          onPress: () => {
            updateTransferStatus(transfer.id, a.action as any, 'user-002');
            log({ action: 'update', module: 'inventory', record_id: transfer.id, record_type: 'transfer', new_data: { status: a.action } });
          },
        })),
      ]
    );
  };

  const handleAdjustmentAction = (adj: StockAdjustment) => {
    if (adj.status === 'pending_approval') {
      showAlert(
        language === 'ar' ? 'التعديل المعلق' : 'Pending Adjustment',
        adj.adjustment_number,
        [
          { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
          { text: language === 'ar' ? 'رفض' : 'Reject', style: 'destructive', onPress: () => { rejectAdjustment(adj.id); log({ action: 'update', module: 'inventory', record_id: adj.id, record_type: 'adjustment', new_data: { status: 'rejected' } }); } },
          { text: language === 'ar' ? 'موافقة' : 'Approve', onPress: () => { approveAdjustment(adj.id, 'user-002'); log({ action: 'approve', module: 'inventory', record_id: adj.id, record_type: 'adjustment', new_data: { status: 'approved' } }); } },
        ]
      );
    } else if (adj.status === 'approved') {
      showAlert(
        language === 'ar' ? 'تطبيق التعديل؟' : 'Apply Adjustment?',
        language === 'ar' ? 'سيتم تحديث المخزون الفعلي' : 'Actual stock will be updated',
        [
          { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
          { text: language === 'ar' ? 'تطبيق' : 'Apply', onPress: () => { applyAdjustment(adj.id, 'user-002'); log({ action: 'update', module: 'inventory', record_id: adj.id, record_type: 'adjustment', new_data: { status: 'applied' } }); } },
        ]
      );
    }
  };

  const TABS: { key: InventoryTab; labelAr: string; labelEn: string; icon: string; badge?: number }[] = [
    { key: 'warehouses',  labelAr: 'المستودعات', labelEn: 'Warehouses',   icon: 'warehouse',  badge: stats.activeWarehouses },
    { key: 'transfers',   labelAr: 'التحويلات',  labelEn: 'Transfers',    icon: 'compare-arrows', badge: stats.pendingTransfers },
    { key: 'adjustments', labelAr: 'التعديلات',  labelEn: 'Adjustments',  icon: 'tune',       badge: stats.pendingAdjustments },
    { key: 'alerts',      labelAr: 'التنبيهات',  labelEn: 'Stock Alerts', icon: 'notifications', badge: stats.totalAlerts },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? 'المخزون' : 'Inventory'}>
      <PermissionGuard module="inventory" action="view">
        <View style={styles.root}>
          {/* Summary stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statsRow}>
              <StatPill icon="warehouse" label={language === 'ar' ? 'مستودعات نشطة' : 'Active Warehouses'} value={String(stats.activeWarehouses)} color={Colors.primary} />
              <StatPill icon="compare-arrows" label={language === 'ar' ? 'تحويلات جارية' : 'In Transit'} value={String(stats.pendingTransfers)} color={Colors.warning} />
              <StatPill icon="tune" label={language === 'ar' ? 'تعديلات معلقة' : 'Pending Adjustments'} value={String(stats.pendingAdjustments)} color={Colors.info} />
              <StatPill icon="account-balance-wallet" label={language === 'ar' ? 'قيمة المخزون' : 'Total Value'} value={fmtCurrency(totalInventoryValue)} color={Colors.accent} />
              <StatPill icon="warning" label={language === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts'} value={String(stats.totalAlerts)} color={Colors.danger} />
            </View>
          </ScrollView>

          {/* Tab Bar */}
          <View style={styles.tabsBar}>
            {TABS.map(tab => (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
                <MaterialIcons name={tab.icon as any} size={15} color={activeTab === tab.key ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {language === 'ar' ? tab.labelAr : tab.labelEn}
                </Text>
                {tab.badge ? (
                  <View style={[styles.tabBadge, activeTab === tab.key && { backgroundColor: Colors.primary }]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab.key && { color: '#FFF' }]}>{tab.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'warehouses' ? (
              <View style={styles.tabContent}>
                <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                  <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
                    {language === 'ar' ? `${warehouses.length} مستودع` : `${warehouses.length} warehouses`}
                  </Text>
                  {can('inventory', 'create') ? (
                    <Pressable onPress={openAddWH} style={styles.addBtn}>
                      <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                      <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة مستودع' : 'Add Warehouse'}</Text>
                    </Pressable>
                  ) : null}
                </View>
                {warehouses.map(wh => {
                  const whStock = stockLevels.filter(s => s.warehouse_id === wh.id);
                  const totalValue = whStock.reduce((s, sl) => s + sl.stock_value, 0);
                  const productCount = new Set(whStock.filter(s => s.quantity > 0).map(s => s.product_id)).size;
                  return (
                    <Pressable key={wh.id}
                      onPress={() => can('inventory', 'edit') ? openEditWH(wh) : null}
                      style={[styles.whCard, isRTL && styles.whCardRTL]}>
                      <View style={[styles.whIconBg, { backgroundColor: wh.status === 'active' ? Colors.accentLight : Colors.background }]}>
                        <MaterialIcons name="warehouse" size={22} color={wh.status === 'active' ? Colors.accent : Colors.textMuted} />
                        {wh.is_default ? <View style={styles.defaultDot} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={[styles.whNameRow, isRTL && styles.whNameRowRTL]}>
                          <Text style={[styles.whName, isRTL && styles.textRTL]} numberOfLines={1}>
                            {language === 'ar' ? (wh.name_ar ?? wh.name) : wh.name}
                          </Text>
                          {wh.is_default ? (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>{language === 'ar' ? 'رئيسي' : 'Default'}</Text>
                            </View>
                          ) : null}
                          <View style={[styles.whStatusBadge, { backgroundColor: wh.status === 'active' ? Colors.successLight : Colors.background }]}>
                            <Text style={[styles.whStatusText, { color: wh.status === 'active' ? Colors.success : Colors.textMuted }]}>
                              {language === 'ar' ? (wh.status === 'active' ? 'نشط' : 'موقف') : (wh.status === 'active' ? 'Active' : 'Inactive')}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.whCode, isRTL && styles.textRTL]}>{wh.code}</Text>
                        <View style={[styles.whMetaRow, isRTL && styles.whMetaRowRTL]}>
                          {wh.address ? <Text style={styles.whMeta}>{wh.address}</Text> : null}
                          {wh.manager_name ? (
                            <View style={styles.whMetaChip}>
                              <MaterialIcons name="person" size={11} color={Colors.textMuted} />
                              <Text style={styles.whMetaChipText}>{wh.manager_name}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View style={[styles.whStatsRow, isRTL && styles.whStatsRowRTL]}>
                          <Text style={styles.whStat}>
                            {language === 'ar' ? `${productCount} منتج` : `${productCount} products`}
                          </Text>
                          <Text style={[styles.whStat, { color: Colors.accent }]}>
                            {language === 'ar' ? `قيمة: ${fmtCurrency(totalValue)}` : `Value: ${fmtCurrency(totalValue)}`}
                          </Text>
                        </View>
                      </View>
                      {can('inventory', 'edit') ? (
                        <Pressable onPress={() => openEditWH(wh)} style={styles.editBtn} hitSlop={6}>
                          <MaterialIcons name="edit" size={14} color={Colors.primary} />
                        </Pressable>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : activeTab === 'transfers' ? (
              <View style={styles.tabContent}>
                <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                  <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
                    {language === 'ar' ? `${transfers.length} تحويل` : `${transfers.length} transfers`}
                  </Text>
                </View>
                {transfers.map(tr => {
                  const fromWH = warehouses.find(w => w.id === tr.from_warehouse_id);
                  const toWH = warehouses.find(w => w.id === tr.to_warehouse_id);
                  const statusCfg = TRANSFER_STATUS_CONFIG[tr.status];
                  const isActionable = ['draft', 'approved', 'in_transit'].includes(tr.status);
                  return (
                    <Pressable key={tr.id}
                      onPress={() => isActionable && can('inventory', 'edit') ? handleTransferAction(tr) : null}
                      style={[styles.transferCard, isRTL && styles.transferCardRTL]}>
                      <View style={[styles.transferIconBg, { backgroundColor: `${statusCfg.color}15` }]}>
                        <MaterialIcons name="compare-arrows" size={20} color={statusCfg.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={[styles.transferRef, isRTL && styles.transferRefRTL]}>
                          <Text style={[styles.transferNum, isRTL && styles.textRTL]}>{tr.transfer_number}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                              {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.transferRoute, isRTL && styles.transferRouteRTL]}>
                          <Text style={[styles.transferWH, isRTL && styles.textRTL]} numberOfLines={1}>
                            {language === 'ar' ? (fromWH?.name_ar ?? fromWH?.name) : fromWH?.name}
                          </Text>
                          <MaterialIcons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={14} color={Colors.textMuted} />
                          <Text style={[styles.transferWH, isRTL && styles.textRTL]} numberOfLines={1}>
                            {language === 'ar' ? (toWH?.name_ar ?? toWH?.name) : toWH?.name}
                          </Text>
                        </View>
                        <View style={[styles.transferMeta, isRTL && styles.transferMetaRTL]}>
                          <Text style={styles.transferDate}>{fmtDate(tr.transfer_date)}</Text>
                          <Text style={styles.transferItemCount}>
                            {language === 'ar' ? `${tr.items.length} صنف` : `${tr.items.length} items`}
                          </Text>
                        </View>
                      </View>
                      {isActionable && can('inventory', 'edit') ? (
                        <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : activeTab === 'adjustments' ? (
              <View style={styles.tabContent}>
                <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                  <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
                    {language === 'ar' ? `${adjustments.length} تعديل` : `${adjustments.length} adjustments`}
                  </Text>
                </View>
                {adjustments.map(adj => {
                  const statusCfg = ADJUSTMENT_STATUS_CONFIG[adj.status];
                  const wh = warehouses.find(w => w.id === adj.warehouse_id);
                  const isActionable = ['pending_approval', 'approved'].includes(adj.status);
                  const totalImpact = adj.items.reduce((s, i) => s + i.cost_impact, 0);
                  return (
                    <Pressable key={adj.id}
                      onPress={() => isActionable && can('inventory', 'approve') ? handleAdjustmentAction(adj) : null}
                      style={[styles.adjustCard, isRTL && styles.adjustCardRTL]}>
                      <View style={[styles.adjustIconBg, { backgroundColor: `${statusCfg.color}15` }]}>
                        <MaterialIcons name="tune" size={20} color={statusCfg.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={[styles.adjustRef, isRTL && styles.adjustRefRTL]}>
                          <Text style={[styles.adjustNum, isRTL && styles.textRTL]}>{adj.adjustment_number}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                              {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.adjustReason, isRTL && styles.textRTL]} numberOfLines={1}>{adj.reason}</Text>
                        <View style={[styles.adjustMeta, isRTL && styles.adjustMetaRTL]}>
                          <Text style={styles.adjustDate}>{fmtDate(adj.adjustment_date)}</Text>
                          <Text style={styles.adjustWH}>
                            {language === 'ar' ? (wh?.name_ar ?? wh?.name) : wh?.name}
                          </Text>
                          <Text style={[styles.adjustImpact, { color: totalImpact >= 0 ? Colors.success : Colors.danger }]}>
                            {totalImpact >= 0 ? '+' : ''}{fmtCurrency(totalImpact)}
                          </Text>
                        </View>
                        <Text style={[styles.adjustItems, isRTL && styles.textRTL]}>
                          {language === 'ar' ? `${adj.items.length} صنف` : `${adj.items.length} items`}
                          {adj.items.map(i => ` · ${i.difference >= 0 ? '+' : ''}${i.difference}`).join('')}
                        </Text>
                      </View>
                      {isActionable && can('inventory', 'approve') ? (
                        <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              // Stock Alerts
              <View style={styles.tabContent}>
                {lowStockAlerts.length === 0 ? (
                  <View style={styles.noAlerts}>
                    <MaterialIcons name="check-circle" size={52} color={Colors.success} />
                    <Text style={styles.noAlertsTitle}>{language === 'ar' ? 'لا توجد تنبيهات' : 'No Stock Alerts'}</Text>
                    <Text style={styles.noAlertsDesc}>{language === 'ar' ? 'جميع مستويات المخزون ضمن الحدود المقبولة' : 'All stock levels are within acceptable limits'}</Text>
                  </View>
                ) : lowStockAlerts.map(alert => {
                  const product = products.find(p => p.id === alert.product_id);
                  const severityColor = alert.severity === 'out_of_stock' ? Colors.danger : alert.severity === 'critical' ? Colors.danger : Colors.warning;
                  const severityBg = alert.severity === 'out_of_stock' ? Colors.dangerLight : alert.severity === 'critical' ? Colors.dangerLight : Colors.warningLight;
                  return (
                    <View key={alert.product_id} style={[styles.alertCard, { borderLeftColor: severityColor }, isRTL && styles.alertCardRTL]}>
                      <View style={[styles.alertIconBg, { backgroundColor: `${severityColor}15` }]}>
                        <MaterialIcons
                          name={alert.severity === 'out_of_stock' ? 'remove-shopping-cart' : 'warning'}
                          size={20} color={severityColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.alertProductName, isRTL && styles.textRTL]} numberOfLines={1}>
                          {language === 'ar' ? (alert.product_name_ar ?? alert.product_name) : alert.product_name}
                        </Text>
                        <Text style={[styles.alertWarehouse, isRTL && styles.textRTL]}>{alert.warehouse_name}</Text>
                        <View style={[styles.alertStats, isRTL && styles.alertStatsRTL]}>
                          <Text style={[styles.alertStatItem, { color: severityColor }]}>
                            {language === 'ar' ? `المتوفر: ${alert.current_qty}` : `Available: ${alert.current_qty}`}
                          </Text>
                          <Text style={styles.alertStatItem}>
                            {language === 'ar' ? `نقطة الإعادة: ${alert.reorder_point}` : `Reorder: ${alert.reorder_point}`}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.alertSeverityBadge, { backgroundColor: severityBg }]}>
                        <Text style={[styles.alertSeverityText, { color: severityColor }]}>
                          {alert.severity === 'out_of_stock'
                            ? (language === 'ar' ? 'نفد' : 'Out')
                            : alert.severity === 'critical'
                            ? (language === 'ar' ? 'حرج' : 'Critical')
                            : (language === 'ar' ? 'منخفض' : 'Low')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={{ height: Spacing['3xl'] }} />
          </ScrollView>
        </View>
      </PermissionGuard>

      {/* Warehouse Modal */}
      <Modal visible={warehouseModal} transparent animationType="slide" onRequestClose={() => setWarehouseModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setWarehouseModal(false)} />
          <View style={[mStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[mStyles.header, isRTL && mStyles.headerRTL]}>
              <Text style={mStyles.title}>{editingWH ? (language === 'ar' ? 'تعديل المستودع' : 'Edit Warehouse') : (language === 'ar' ? 'مستودع جديد' : 'New Warehouse')}</Text>
              <Pressable onPress={() => setWarehouseModal(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: Spacing.base }}>
              <View style={{ gap: Spacing.md }}>
                {[
                  { key: 'name_ar', label: language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)' },
                  { key: 'name', label: language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)', required: true },
                  { key: 'code', label: language === 'ar' ? 'كود المستودع' : 'Warehouse Code', required: true },
                  { key: 'address', label: language === 'ar' ? 'العنوان' : 'Address' },
                  { key: 'phone', label: language === 'ar' ? 'الهاتف' : 'Phone', type: 'phone-pad' },
                  { key: 'manager_name', label: language === 'ar' ? 'اسم المدير' : 'Manager Name' },
                ].map(f => (
                  <View key={f.key}>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{f.label}{f.required ? <Text style={{ color: Colors.danger }}> *</Text> : null}</Text>
                    <TextInput
                      style={[mStyles.input, isRTL && mStyles.inputRTL]}
                      value={(whForm as any)[f.key]}
                      onChangeText={v => setWhForm(pf => ({ ...pf, [f.key]: v }))}
                      keyboardType={(f.type as any) ?? 'default'}
                      textAlign={isRTL ? 'right' : 'left'}
                      autoCapitalize="none" placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={[mStyles.footer, isRTL && mStyles.footerRTL]}>
              <Pressable onPress={() => setWarehouseModal(false)} style={mStyles.cancelBtn}>
                <Text style={mStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSaveWarehouse} style={mStyles.saveBtn}>
                <Text style={mStyles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

const StatPill = ({ icon, label, value, color }: any) => (
  <View style={[spStyles.pill, { borderColor: `${color}30` }]}>
    <View style={[spStyles.iconBg, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={16} color={color} />
    </View>
    <View><Text style={spStyles.label}>{label}</Text><Text style={[spStyles.value, { color }]}>{value}</Text></View>
  </View>
);
const spStyles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.sm },
  iconBg: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  value: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
});

const mStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '75%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
  footerRTL: { flexDirection: 'row-reverse' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  cancelText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base },
  tabsBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 11 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  tabBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 10, fontWeight: Typography.fontWeightBold, color: Colors.textSecondary, includeFontPadding: false },
  tabContent: { padding: Spacing.base, gap: Spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  actionRowRTL: { flexDirection: 'row-reverse' },
  sectionLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Warehouse cards
  whCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  whCardRTL: { flexDirection: 'row-reverse' },
  whIconBg: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  defaultDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.surface },
  whNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  whNameRowRTL: { flexDirection: 'row-reverse' },
  whName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  defaultBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  defaultBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  whStatusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  whStatusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  whCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  whMetaRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' },
  whMetaRowRTL: { flexDirection: 'row-reverse' },
  whMeta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  whMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  whMetaChipText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  whStatsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  whStatsRowRTL: { flexDirection: 'row-reverse' },
  whStat: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  editBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  // Transfer cards
  transferCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  transferCardRTL: { flexDirection: 'row-reverse' },
  transferIconBg: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  transferRef: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  transferRefRTL: { flexDirection: 'row-reverse' },
  transferNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  transferRoute: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  transferRouteRTL: { flexDirection: 'row-reverse' },
  transferWH: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  transferMeta: { flexDirection: 'row', gap: 12 },
  transferMetaRTL: { flexDirection: 'row-reverse' },
  transferDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  transferItemCount: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Adjustment cards
  adjustCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  adjustCardRTL: { flexDirection: 'row-reverse' },
  adjustIconBg: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  adjustRef: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  adjustRefRTL: { flexDirection: 'row-reverse' },
  adjustNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  adjustReason: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginBottom: 4, includeFontPadding: false },
  adjustMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 2 },
  adjustMetaRTL: { flexDirection: 'row-reverse' },
  adjustDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  adjustWH: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  adjustImpact: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  adjustItems: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Status common
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Alerts
  noAlerts: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.md },
  noAlertsTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  noAlertsDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, borderLeftWidth: 3, ...Shadow.sm },
  alertCardRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3 },
  alertIconBg: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  alertProductName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  alertWarehouse: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  alertStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  alertStatsRTL: { flexDirection: 'row-reverse' },
  alertStatItem: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  alertSeverityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md, alignSelf: 'center' },
  alertSeverityText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
