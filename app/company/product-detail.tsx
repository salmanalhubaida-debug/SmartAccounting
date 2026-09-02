// Product Detail — Full product view with variants, stock, movements
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { MOVEMENT_TYPE_CONFIG, ProductVariant } from '../../types/inventory';
import { useAlert } from '@/template';

type DetailTab = 'overview' | 'stock' | 'variants' | 'movements';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const {
    getProduct, getProductStock, getMovementsForProduct, getVariantsForProduct,
    warehouses, flatCategories, brands, units, archiveProduct,
    addVariant, deleteVariant, recordMovement,
  } = useInventory();

  const product = getProduct(id ?? '');
  const stockData = useMemo(() => id ? getProductStock(id) : { total: 0, available: 0, byWarehouse: [] }, [id, getProductStock]);
  const productMovements = useMemo(() => id ? getMovementsForProduct(id) : [], [id, getMovementsForProduct]);
  const productVariants = useMemo(() => id ? getVariantsForProduct(id) : [], [id, getVariantsForProduct]);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [variantModal, setVariantModal] = useState(false);
  const [variantForm, setVariantForm] = useState({ name: '', name_ar: '', sku: '', cost_price: '0', sale_price: '0', attr_key: '', attr_value: '' });
  const [openingModal, setOpeningModal] = useState(false);
  const [openingForm, setOpeningForm] = useState({ warehouse_id: '', quantity: '', cost: '' });

  const fmtCurrency = (n: number) => `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!product) {
    return (
      <CompanyLayout title={language === 'ar' ? 'المنتج' : 'Product'}>
        <View style={styles.notFound}>
          <MaterialIcons name="inventory-2" size={52} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>{language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{language === 'ar' ? 'عودة' : 'Go Back'}</Text>
          </Pressable>
        </View>
      </CompanyLayout>
    );
  }

  const category = flatCategories.find(c => c.id === product.category_id);
  const brand = brands.find(b => b.id === product.brand_id);
  const unit = units.find(u => u.id === product.unit_id);

  const stockStatusColor = stockData.total === 0
    ? Colors.danger
    : stockData.total <= product.min_stock
    ? Colors.danger
    : stockData.total <= product.reorder_point
    ? Colors.warning
    : Colors.success;

  const handleAddVariant = () => {
    if (!variantForm.name.trim() || !variantForm.sku.trim()) return;
    addVariant({
      product_id: product.id, company_id: product.company_id,
      sku: variantForm.sku, name: variantForm.name, name_ar: variantForm.name_ar || undefined,
      attributes: variantForm.attr_key ? { [variantForm.attr_key]: variantForm.attr_value } : {},
      cost_price: parseFloat(variantForm.cost_price) || 0,
      sale_price: parseFloat(variantForm.sale_price) || 0,
      is_active: true,
    });
    log({ action: 'create', module: 'products', record_id: product.id, record_type: 'variant', new_data: { sku: variantForm.sku, name: variantForm.name } });
    setVariantForm({ name: '', name_ar: '', sku: '', cost_price: '0', sale_price: '0', attr_key: '', attr_value: '' });
    setVariantModal(false);
  };

  const handleOpeningBalance = () => {
    if (!openingForm.warehouse_id || !openingForm.quantity) return;
    recordMovement({
      company_id: product.company_id, product_id: product.id,
      warehouse_id: openingForm.warehouse_id, type: 'opening_balance',
      quantity: parseFloat(openingForm.quantity) || 0,
      unit_id: product.unit_id,
      unit_cost: parseFloat(openingForm.cost) || product.cost_price,
      total_cost: (parseFloat(openingForm.quantity) || 0) * (parseFloat(openingForm.cost) || product.cost_price),
      notes: 'رصيد افتتاحي', created_by: 'user-002',
    });
    log({ action: 'create', module: 'inventory', record_id: product.id, record_type: 'opening_balance', new_data: { quantity: openingForm.quantity, warehouse: openingForm.warehouse_id } });
    setOpeningForm({ warehouse_id: '', quantity: '', cost: '' });
    setOpeningModal(false);
  };

  const TABS: { key: DetailTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'overview',  labelAr: 'نظرة عامة',  labelEn: 'Overview',  icon: 'info' },
    { key: 'stock',     labelAr: 'المخزون',     labelEn: 'Stock',     icon: 'inventory' },
    { key: 'variants',  labelAr: 'المتغيرات',   labelEn: 'Variants',  icon: 'category' },
    { key: 'movements', labelAr: 'الحركات',     labelEn: 'Movements', icon: 'sync-alt' },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? (product.name_ar ?? product.name) : product.name}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
            <View style={styles.productIconBg}>
              <MaterialIcons name={product.type === 'service' ? 'miscellaneous-services' : 'inventory-2'} size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerName, isRTL && styles.textRTL]} numberOfLines={2}>
                {language === 'ar' ? (product.name_ar ?? product.name) : product.name}
              </Text>
              <View style={[styles.headerMeta, isRTL && styles.headerMetaRTL]}>
                <Text style={styles.skuText}>{product.sku}</Text>
                {product.barcode ? <Text style={styles.skuText}>· {product.barcode}</Text> : null}
                {category ? (
                  <View style={[styles.catBadge, { backgroundColor: `${category.color ?? Colors.primary}15` }]}>
                    <Text style={[styles.catBadgeText, { color: category.color ?? Colors.primary }]}>
                      {language === 'ar' ? (category.name_ar ?? category.name) : category.name}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Key metrics */}
          <View style={styles.metricsRow}>
            <MetricItem label={language === 'ar' ? 'سعر البيع' : 'Sale Price'} value={fmtCurrency(product.sale_price)} color={Colors.primary} />
            <View style={styles.metricDivider} />
            <MetricItem label={language === 'ar' ? 'تكلفة' : 'Cost'} value={fmtCurrency(product.cost_price)} color={Colors.textSecondary} />
            <View style={styles.metricDivider} />
            <MetricItem label={language === 'ar' ? 'المخزون الكلي' : 'Total Stock'} value={`${stockData.total} ${unit?.symbol ?? ''}`} color={stockStatusColor} highlight />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsBar}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <MaterialIcons name={tab.icon as any} size={14} color={activeTab === tab.key ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {language === 'ar' ? tab.labelAr : tab.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' ? (
            <View style={styles.tabContent}>
              {/* Pricing */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'التسعير' : 'Pricing'}</Text>
                <InfoRow labelAr="سعر البيع" labelEn="Sale Price" isRTL={isRTL} language={language} value={fmtCurrency(product.sale_price)} />
                <InfoRow labelAr="سعر التكلفة" labelEn="Cost Price" isRTL={isRTL} language={language} value={fmtCurrency(product.cost_price)} />
                <InfoRow labelAr="سعر الشراء" labelEn="Purchase Price" isRTL={isRTL} language={language} value={fmtCurrency(product.purchase_price)} />
                {product.sale_price > 0 && product.cost_price > 0 ? (
                  <View style={[styles.marginRow, isRTL && styles.marginRowRTL]}>
                    <Text style={styles.marginLabel}>{language === 'ar' ? 'هامش الربح' : 'Profit Margin'}</Text>
                    <Text style={[styles.marginValue, { color: Colors.success }]}>
                      {(((product.sale_price - product.cost_price) / product.sale_price) * 100).toFixed(1)}%
                      {' — '}{fmtCurrency(product.sale_price - product.cost_price)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Product Info */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'معلومات المنتج' : 'Product Info'}</Text>
                <InfoRow labelAr="النوع" labelEn="Type" isRTL={isRTL} language={language} value={product.type === 'service' ? (language === 'ar' ? 'خدمة' : 'Service') : (language === 'ar' ? 'منتج' : 'Product')} />
                <InfoRow labelAr="وحدة القياس" labelEn="Unit" isRTL={isRTL} language={language} value={`${unit?.name ?? ''} (${unit?.symbol ?? ''})`} />
                {brand ? <InfoRow labelAr="الماركة" labelEn="Brand" isRTL={isRTL} language={language} value={language === 'ar' ? (brand.name_ar ?? brand.name) : brand.name} /> : null}
                <InfoRow labelAr="تتبع المخزون" labelEn="Track Inventory" isRTL={isRTL} language={language} value={product.track_inventory ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No')} />
                {product.track_inventory ? (
                  <>
                    <InfoRow labelAr="طريقة التكلفة" labelEn="Costing Method" isRTL={isRTL} language={language} value={product.costing_method === 'fifo' ? 'FIFO' : (language === 'ar' ? 'متوسط مرجح' : 'Weighted Average')} />
                    <InfoRow labelAr="نوع التتبع" labelEn="Tracking" isRTL={isRTL} language={language} value={product.tracking_type === 'none' ? (language === 'ar' ? 'بدون' : 'None') : product.tracking_type === 'batch' ? (language === 'ar' ? 'دفعة' : 'Batch/Lot') : (language === 'ar' ? 'رقم تسلسلي' : 'Serial')} />
                    <InfoRow labelAr="نقطة إعادة الطلب" labelEn="Reorder Point" isRTL={isRTL} language={language} value={`${product.reorder_point} ${unit?.symbol ?? ''}`} />
                    <InfoRow labelAr="الحد الأدنى" labelEn="Min Stock" isRTL={isRTL} language={language} value={`${product.min_stock} ${unit?.symbol ?? ''}`} />
                  </>
                ) : null}
                {product.tax_rate > 0 ? (
                  <InfoRow labelAr="الضريبة" labelEn="Tax Rate" isRTL={isRTL} language={language} value={`${(product.tax_rate * 100).toFixed(0)}%`} />
                ) : null}
              </View>

              {product.description || product.description_ar ? (
                <View style={styles.sectionCard}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'الوصف' : 'Description'}</Text>
                  <Text style={[styles.descText, isRTL && styles.textRTL]}>
                    {language === 'ar' ? (product.description_ar ?? product.description ?? '') : (product.description ?? product.description_ar ?? '')}
                  </Text>
                </View>
              ) : null}

              {/* Accounting prep note */}
              <View style={[styles.accountingNote, isRTL && styles.accountingNoteRTL]}>
                <MaterialIcons name="account-balance" size={16} color={Colors.primary} />
                <Text style={[styles.accountingNoteText, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'سيتم ربط حسابات المخزون وتكلفة البضاعة المباعة تلقائياً عند تفعيل محرك المحاسبة.'
                    : 'Inventory and COGS accounts will be automatically linked when the Accounting Engine is activated.'}
                </Text>
              </View>
            </View>
          ) : activeTab === 'stock' ? (
            <View style={styles.tabContent}>
              {/* Stock summary */}
              <View style={styles.sectionCard}>
                <View style={[styles.stockHeaderRow, isRTL && styles.stockHeaderRowRTL]}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'المخزون حسب المستودع' : 'Stock by Warehouse'}</Text>
                  {can('inventory', 'create') ? (
                    <Pressable onPress={() => setOpeningModal(true)} style={styles.addStockBtn}>
                      <MaterialIcons name="add" size={15} color={Colors.textInverse} />
                      <Text style={styles.addStockBtnText}>{language === 'ar' ? 'إضافة رصيد' : 'Add Stock'}</Text>
                    </Pressable>
                  ) : null}
                </View>
                {stockData.byWarehouse.length === 0 ? (
                  <View style={styles.stockEmpty}>
                    <MaterialIcons name="inventory" size={36} color={Colors.textMuted} />
                    <Text style={styles.stockEmptyText}>{language === 'ar' ? 'لا يوجد مخزون' : 'No stock records'}</Text>
                  </View>
                ) : (
                  stockData.byWarehouse.map(sl => {
                    const wh = warehouses.find(w => w.id === sl.warehouse_id);
                    const pct = product.max_stock > 0 ? (sl.quantity / product.max_stock) * 100 : 0;
                    return (
                      <View key={sl.id} style={styles.whRow}>
                        <View style={[styles.whInfo, isRTL && styles.whInfoRTL]}>
                          <View style={styles.whIconBg}>
                            <MaterialIcons name="warehouse" size={16} color={Colors.accent} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.whName, isRTL && styles.textRTL]}>{language === 'ar' ? (wh?.name_ar ?? wh?.name) : wh?.name}</Text>
                            <Text style={[styles.whCode, isRTL && styles.textRTL]}>{wh?.code}</Text>
                            {product.max_stock > 0 ? (
                              <View style={styles.whBar}>
                                <View style={[styles.whBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 80 ? Colors.success : pct > 30 ? Colors.primary : Colors.warning }]} />
                              </View>
                            ) : null}
                          </View>
                        </View>
                        <View style={[styles.whMetrics, isRTL && styles.whMetricsRTL]}>
                          <View style={styles.whMetricItem}>
                            <Text style={styles.whMetricLabel}>{language === 'ar' ? 'إجمالي' : 'Total'}</Text>
                            <Text style={[styles.whMetricValue, { color: Colors.text }]}>{sl.quantity} {product.unit_symbol}</Text>
                          </View>
                          <View style={styles.whMetricItem}>
                            <Text style={styles.whMetricLabel}>{language === 'ar' ? 'متاح' : 'Available'}</Text>
                            <Text style={[styles.whMetricValue, { color: Colors.success }]}>{sl.available_quantity} {product.unit_symbol}</Text>
                          </View>
                          {sl.reserved_quantity > 0 ? (
                            <View style={styles.whMetricItem}>
                              <Text style={styles.whMetricLabel}>{language === 'ar' ? 'محجوز' : 'Reserved'}</Text>
                              <Text style={[styles.whMetricValue, { color: Colors.warning }]}>{sl.reserved_quantity}</Text>
                            </View>
                          ) : null}
                          <View style={styles.whMetricItem}>
                            <Text style={styles.whMetricLabel}>{language === 'ar' ? 'القيمة' : 'Value'}</Text>
                            <Text style={[styles.whMetricValue, { color: Colors.accent }]}>{fmtCurrency(sl.stock_value)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}

                {/* Summary row */}
                <View style={[styles.stockTotalRow, isRTL && styles.stockTotalRowRTL]}>
                  <Text style={styles.stockTotalLabel}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={[styles.stockTotalValue, { color: stockStatusColor }]}>{stockData.total} {product.unit_symbol}</Text>
                  <Text style={[styles.stockTotalValue, { color: Colors.accent, marginLeft: 12 }]}>
                    {fmtCurrency(stockData.byWarehouse.reduce((s, sl) => s + sl.stock_value, 0))}
                  </Text>
                </View>
              </View>

              {/* Reorder alert */}
              {product.track_inventory && stockData.total <= product.reorder_point && product.reorder_point > 0 ? (
                <View style={[styles.alertBox, isRTL && styles.alertBoxRTL]}>
                  <MaterialIcons name="warning" size={18} color={stockData.total === 0 ? Colors.danger : Colors.warning} />
                  <Text style={[styles.alertText, { color: stockData.total === 0 ? Colors.danger : Colors.warning }, isRTL && styles.textRTL]}>
                    {stockData.total === 0
                      ? (language === 'ar' ? 'نفد المخزون — يرجى إصدار طلب شراء' : 'Out of Stock — Please issue a purchase order')
                      : (language === 'ar' ? `المخزون منخفض — نقطة إعادة الطلب: ${product.reorder_point} ${product.unit_symbol}` : `Low Stock — Reorder point: ${product.reorder_point} ${product.unit_symbol}`)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : activeTab === 'variants' ? (
            <View style={styles.tabContent}>
              <View style={[styles.variantsHeader, isRTL && styles.variantsHeaderRTL]}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? `المتغيرات (${productVariants.length})` : `Variants (${productVariants.length})`}
                </Text>
                {can('products', 'edit') ? (
                  <Pressable onPress={() => setVariantModal(true)} style={styles.addVariantBtn}>
                    <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                    <Text style={styles.addVariantBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
                  </Pressable>
                ) : null}
              </View>
              {productVariants.length === 0 ? (
                <View style={styles.emptyVariants}>
                  <MaterialIcons name="category" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyVariantsText}>{language === 'ar' ? 'لا توجد متغيرات' : 'No variants yet'}</Text>
                  <Text style={styles.emptyVariantsDesc}>
                    {language === 'ar' ? 'أضف متغيرات للمنتج مثل الأحجام والألوان' : 'Add variants like sizes and colors'}
                  </Text>
                </View>
              ) : productVariants.map(v => (
                <View key={v.id} style={[styles.variantCard, isRTL && styles.variantCardRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.variantName, isRTL && styles.textRTL]}>{language === 'ar' ? (v.name_ar ?? v.name) : v.name}</Text>
                    <Text style={[styles.variantSku, isRTL && styles.textRTL]}>{v.sku}</Text>
                    {Object.entries(v.attributes).map(([k, val]) => (
                      <Text key={k} style={[styles.variantAttr, isRTL && styles.textRTL]}>{k}: {val}</Text>
                    ))}
                  </View>
                  <View style={[styles.variantPrices, isRTL && styles.variantPricesRTL]}>
                    <Text style={styles.variantSalePrice}>{fmtCurrency(v.sale_price)}</Text>
                    <Text style={styles.variantCost}>{fmtCurrency(v.cost_price)}</Text>
                  </View>
                  {can('products', 'edit') ? (
                    <Pressable onPress={() => deleteVariant(v.id)} style={styles.deleteBtn} hitSlop={8}>
                      <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.tabContent}>
              <View style={[styles.movementsHeader, isRTL && styles.movementsHeaderRTL]}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? `حركات المخزون (${productMovements.length})` : `Stock Movements (${productMovements.length})`}
                </Text>
              </View>
              {productMovements.length === 0 ? (
                <View style={styles.emptyVariants}>
                  <MaterialIcons name="sync-alt" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyVariantsText}>{language === 'ar' ? 'لا توجد حركات' : 'No movements yet'}</Text>
                </View>
              ) : productMovements.map(mv => {
                const config = MOVEMENT_TYPE_CONFIG[mv.type];
                const wh = warehouses.find(w => w.id === mv.warehouse_id);
                return (
                  <View key={mv.id} style={[styles.mvRow, isRTL && styles.mvRowRTL]}>
                    <View style={[styles.mvIcon, { backgroundColor: `${config.color}15` }]}>
                      <MaterialIcons name={config.icon as any} size={18} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mvType, isRTL && styles.textRTL]}>
                        {language === 'ar' ? config.labelAr : config.labelEn}
                      </Text>
                      <Text style={[styles.mvWarehouse, isRTL && styles.textRTL]}>
                        {language === 'ar' ? (wh?.name_ar ?? wh?.name) : wh?.name}
                        {mv.batch_number ? ` · ${mv.batch_number}` : ''}
                      </Text>
                      <Text style={[styles.mvDate, isRTL && styles.textRTL]}>{fmtDate(mv.created_at)}</Text>
                    </View>
                    <View style={[styles.mvQty, isRTL && styles.mvQtyRTL]}>
                      <Text style={[styles.mvQtyText, { color: config.direction === 'in' ? Colors.success : Colors.danger }]}>
                        {config.direction === 'in' ? '+' : '-'}{mv.quantity}
                      </Text>
                      <Text style={styles.mvBalance}>{language === 'ar' ? `الرصيد: ${mv.qty_after}` : `Bal: ${mv.qty_after}`}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </View>

      {/* Add Opening Balance Modal */}
      <Modal visible={openingModal} transparent animationType="slide" onRequestClose={() => setOpeningModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={[modalStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[modalStyles.header, isRTL && modalStyles.headerRTL]}>
              <Text style={modalStyles.title}>{language === 'ar' ? 'إضافة رصيد مخزون' : 'Add Stock Balance'}</Text>
              <Pressable onPress={() => setOpeningModal(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <View style={{ padding: Spacing.base, gap: Spacing.md }}>
              <View>
                <Text style={[modalStyles.label, isRTL && modalStyles.labelRTL]}>{language === 'ar' ? 'المستودع' : 'Warehouse'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {warehouses.filter(w => w.status === 'active').map(wh => (
                      <Pressable key={wh.id} onPress={() => setOpeningForm(f => ({ ...f, warehouse_id: wh.id }))}
                        style={[modalStyles.chip, openingForm.warehouse_id === wh.id && modalStyles.chipActive]}>
                        <Text style={[modalStyles.chipText, openingForm.warehouse_id === wh.id && modalStyles.chipTextActive]}>
                          {language === 'ar' ? (wh.name_ar ?? wh.name) : wh.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View>
                <Text style={[modalStyles.label, isRTL && modalStyles.labelRTL]}>{language === 'ar' ? `الكمية (${product.unit_symbol})` : `Quantity (${product.unit_symbol})`}</Text>
                <TextInput style={[modalStyles.input, isRTL && modalStyles.inputRTL]} value={openingForm.quantity} onChangeText={v => setOpeningForm(f => ({ ...f, quantity: v }))} keyboardType="decimal-pad" textAlign={isRTL ? 'right' : 'left'} placeholderTextColor={Colors.textMuted} />
              </View>
              <View>
                <Text style={[modalStyles.label, isRTL && modalStyles.labelRTL]}>{language === 'ar' ? 'التكلفة للوحدة (KWD)' : 'Unit Cost (KWD)'}</Text>
                <TextInput style={[modalStyles.input, isRTL && modalStyles.inputRTL]} value={openingForm.cost} onChangeText={v => setOpeningForm(f => ({ ...f, cost: v }))} keyboardType="decimal-pad" placeholder={String(product.cost_price)} textAlign={isRTL ? 'right' : 'left'} placeholderTextColor={Colors.textMuted} />
              </View>
            </View>
            <View style={[modalStyles.footer, isRTL && modalStyles.footerRTL]}>
              <Pressable onPress={() => setOpeningModal(false)} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleOpeningBalance} style={modalStyles.saveBtn}>
                <Text style={modalStyles.saveText}>{language === 'ar' ? 'تسجيل' : 'Record'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Variant Modal */}
      <Modal visible={variantModal} transparent animationType="slide" onRequestClose={() => setVariantModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={[modalStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[modalStyles.header, isRTL && modalStyles.headerRTL]}>
              <Text style={modalStyles.title}>{language === 'ar' ? 'إضافة متغير' : 'Add Variant'}</Text>
              <Pressable onPress={() => setVariantModal(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: Spacing.base }}>
              <View style={{ gap: Spacing.md }}>
                {[
                  { key: 'name_ar', label: language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)' },
                  { key: 'name', label: language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)', required: true },
                  { key: 'sku', label: 'SKU', required: true },
                  { key: 'attr_key', label: language === 'ar' ? 'خاصية (مثال: الحجم)' : 'Attribute (e.g. Size)' },
                  { key: 'attr_value', label: language === 'ar' ? 'قيمة الخاصية (مثال: 100ml)' : 'Attribute Value (e.g. 100ml)' },
                  { key: 'cost_price', label: language === 'ar' ? 'التكلفة (KWD)' : 'Cost (KWD)', type: 'decimal-pad' },
                  { key: 'sale_price', label: language === 'ar' ? 'سعر البيع (KWD)' : 'Sale Price (KWD)', type: 'decimal-pad' },
                ].map(f => (
                  <View key={f.key}>
                    <Text style={[modalStyles.label, isRTL && modalStyles.labelRTL]}>{f.label}{f.required ? <Text style={{ color: Colors.danger }}> *</Text> : null}</Text>
                    <TextInput
                      style={[modalStyles.input, isRTL && modalStyles.inputRTL]}
                      value={(variantForm as any)[f.key]} onChangeText={v => setVariantForm(pf => ({ ...pf, [f.key]: v }))}
                      keyboardType={(f.type as any) ?? 'default'}
                      textAlign={isRTL ? 'right' : 'left'} autoCapitalize="none"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={[modalStyles.footer, isRTL && modalStyles.footerRTL]}>
              <Pressable onPress={() => setVariantModal(false)} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleAddVariant} style={modalStyles.saveBtn}>
                <Text style={modalStyles.saveText}>{language === 'ar' ? 'إضافة' : 'Add Variant'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </CompanyLayout>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const MetricItem = ({ label, value, color, highlight }: any) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 3, includeFontPadding: false }}>{label}</Text>
    <Text style={{ fontSize: highlight ? Typography.fontSizeMD : Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color, includeFontPadding: false }}>{value}</Text>
  </View>
);

const InfoRow = ({ labelAr, labelEn, isRTL, language, value }: any) => (
  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
    <Text style={{ fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false }}>{language === 'ar' ? labelAr : labelEn}</Text>
    <Text style={{ fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false }}>{value}</Text>
  </View>
);

const modalStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '75%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  chipTextActive: { color: '#FFF', fontWeight: Typography.fontWeightSemibold },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
  footerRTL: { flexDirection: 'row-reverse' },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  cancelText: { fontSize: Typography.fontSizeMD, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  saveText: { fontSize: Typography.fontSizeMD, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: Typography.fontSizeLG, color: Colors.textMuted, includeFontPadding: false },
  backBtn: { paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.primary },
  backBtnText: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  header: { backgroundColor: Colors.surface, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadow.sm },
  headerTop: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  headerTopRTL: { flexDirection: 'row-reverse' },
  productIconBg: { width: 54, height: 54, borderRadius: Radius.xl, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  headerMeta: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' },
  headerMetaRTL: { flexDirection: 'row-reverse' },
  skuText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  catBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  metricsRow: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  metricDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  tabsBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  tabContent: { padding: Spacing.base, gap: Spacing.base },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  marginRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1.5, borderTopColor: Colors.border },
  marginRowRTL: { flexDirection: 'row-reverse' },
  marginLabel: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  marginValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  descText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  accountingNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  accountingNoteRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.primary },
  accountingNoteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20, includeFontPadding: false },
  stockHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  stockHeaderRowRTL: { flexDirection: 'row-reverse' },
  addStockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md },
  addStockBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  stockEmpty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  stockEmptyText: { color: Colors.textMuted, includeFontPadding: false },
  whRow: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingVertical: Spacing.md },
  whInfo: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  whInfoRTL: { flexDirection: 'row-reverse' },
  whIconBg: { width: 32, height: 32, borderRadius: Radius.md, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  whName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  whCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  whBar: { height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden', marginTop: 6 },
  whBarFill: { height: '100%', borderRadius: 2 },
  whMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  whMetricsRTL: { flexDirection: 'row-reverse' },
  whMetricItem: { alignItems: 'center', minWidth: 70 },
  whMetricLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  whMetricValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  stockTotalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: 1.5, borderTopColor: Colors.border },
  stockTotalRowRTL: { flexDirection: 'row-reverse' },
  stockTotalLabel: { flex: 1, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  stockTotalValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  alertBox: { flexDirection: 'row', gap: 10, backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  alertBoxRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3 },
  alertText: { flex: 1, fontSize: Typography.fontSizeSM, lineHeight: 20, includeFontPadding: false },
  variantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  variantsHeaderRTL: { flexDirection: 'row-reverse' },
  addVariantBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md },
  addVariantBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  emptyVariants: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.sm },
  emptyVariantsText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  emptyVariantsDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  variantCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  variantCardRTL: { flexDirection: 'row-reverse' },
  variantName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  variantSku: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  variantAttr: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  variantPrices: { alignItems: 'flex-end' },
  variantPricesRTL: { alignItems: 'flex-start' },
  variantSalePrice: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  variantCost: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  movementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  movementsHeaderRTL: { flexDirection: 'row-reverse' },
  mvRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  mvRowRTL: { flexDirection: 'row-reverse' },
  mvIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  mvType: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  mvWarehouse: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, marginTop: 2, includeFontPadding: false },
  mvDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  mvQty: { alignItems: 'flex-end' },
  mvQtyRTL: { alignItems: 'flex-start' },
  mvQtyText: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  mvBalance: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
