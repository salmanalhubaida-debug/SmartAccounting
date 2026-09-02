// Products List — Full-featured product management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { useAudit } from '../../contexts/AuditContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { ProductFull, ProductStatus, COSTING_METHOD_OPTIONS, TRACKING_TYPE_OPTIONS } from '../../types/inventory';
import { useAlert } from '@/template';

const STATUS_CONFIG: Record<ProductStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  active:   { labelEn: 'Active',   labelAr: 'نشط',    color: Colors.success, bg: Colors.successLight },
  inactive: { labelEn: 'Inactive', labelAr: 'غير نشط', color: Colors.textMuted, bg: Colors.background },
  archived: { labelEn: 'Archived', labelAr: 'مؤرشف',  color: Colors.textMuted, bg: Colors.borderLight },
};

type FormTab = 'basic' | 'pricing' | 'stock' | 'advanced';

export default function Products() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { log } = useAudit();
  const { can } = usePermissions();
  const { showAlert } = useAlert();
  const {
    products, categories, flatCategories, brands, units,
    addProduct, updateProduct, archiveProduct, generateSKU,
    lowStockAlerts, getProductStock,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ProductStatus>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFull | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('basic');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');

  // Form state
  const emptyForm = () => ({
    name: '', name_ar: '', sku: generateSKU(), barcode: '',
    description: '', description_ar: '',
    type: 'product' as const, unit_id: 'unit-001', unit_symbol: 'PCS',
    category_id: '', brand_id: '',
    cost_price: '0', sale_price: '0', purchase_price: '0',
    tax_rate: '5', tax_included: false,
    track_inventory: true,
    tracking_type: 'none' as const, costing_method: 'weighted_average' as const,
    min_stock: '0', max_stock: '0', reorder_point: '0',
    status: 'active' as ProductStatus,
  });
  const [form, setForm] = useState(emptyForm());

  // Computed
  const lowStockIds = new Set(lowStockAlerts.map(a => a.product_id));

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.name_ar ?? '').includes(search) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode ?? '').includes(search);
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchCat = filterCategory === 'all' || p.category_id === filterCategory;
      const matchStock = filterStock === 'all'
        || (filterStock === 'low' && lowStockIds.has(p.id) && (p.current_stock ?? 0) > 0)
        || (filterStock === 'out' && (p.current_stock ?? 0) === 0 && p.track_inventory);
      return matchSearch && matchStatus && matchCat && matchStock;
    });
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'stock') result.sort((a, b) => (b.current_stock ?? 0) - (a.current_stock ?? 0));
    else result.sort((a, b) => b.sale_price - a.sale_price);
    return result;
  }, [products, search, filterStatus, filterCategory, filterStock, sortBy]);

  const stats = useMemo(() => ({
    total: products.filter(p => p.status !== 'archived').length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: lowStockAlerts.filter(a => a.severity !== 'out_of_stock').length,
    outOfStock: lowStockAlerts.filter(a => a.severity === 'out_of_stock').length,
    totalValue: products.reduce((s, p) => s + (p.stock_value ?? 0), 0),
  }), [products, lowStockAlerts]);

  const fmtCurrency = (n: number) =>
    `${n.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} KWD`;

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setFormTab('basic');
    setModalVisible(true);
  };

  const openEdit = (p: ProductFull) => {
    setEditingProduct(p);
    setForm({
      name: p.name, name_ar: p.name_ar ?? '', sku: p.sku, barcode: p.barcode ?? '',
      description: p.description ?? '', description_ar: p.description_ar ?? '',
      type: p.type, unit_id: p.unit_id, unit_symbol: p.unit_symbol,
      category_id: p.category_id ?? '', brand_id: p.brand_id ?? '',
      cost_price: String(p.cost_price), sale_price: String(p.sale_price),
      purchase_price: String(p.purchase_price),
      tax_rate: String(p.tax_rate * 100), tax_included: p.tax_included,
      track_inventory: p.track_inventory,
      tracking_type: p.tracking_type, costing_method: p.costing_method,
      min_stock: String(p.min_stock), max_stock: String(p.max_stock),
      reorder_point: String(p.reorder_point), status: p.status,
    });
    setFormTab('basic');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showAlert(language === 'ar' ? 'حقل مطلوب' : 'Required',
        language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Product name is required');
      return;
    }
    const unit = units.find(u => u.id === form.unit_id);
    const payload: Omit<ProductFull, 'id' | 'created_at' | 'updated_at' | 'current_stock' | 'stock_value'> = {
      company_id: 'company-001',
      name: form.name, name_ar: form.name_ar || undefined,
      sku: form.sku, barcode: form.barcode || undefined,
      description: form.description || undefined,
      description_ar: form.description_ar || undefined,
      type: form.type, unit_id: form.unit_id,
      unit_symbol: unit?.symbol ?? form.unit_symbol,
      category_id: form.category_id || undefined, brand_id: form.brand_id || undefined,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      purchase_price: parseFloat(form.purchase_price) || 0,
      tax_rate: (parseFloat(form.tax_rate) || 0) / 100,
      tax_included: form.tax_included,
      track_inventory: form.track_inventory,
      tracking_type: form.tracking_type, costing_method: form.costing_method,
      min_stock: parseInt(form.min_stock) || 0,
      max_stock: parseInt(form.max_stock) || 0,
      reorder_point: parseInt(form.reorder_point) || 0,
      status: form.status, is_active: form.status === 'active',
      has_variants: editingProduct?.has_variants ?? false,
      created_by: 'user-002',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      log({ action: 'update', module: 'products', record_id: editingProduct.id, record_type: 'product',
        previous_data: { name: editingProduct.name, sale_price: editingProduct.sale_price },
        new_data: { name: form.name, sale_price: payload.sale_price } });
    } else {
      const np = addProduct(payload);
      log({ action: 'create', module: 'products', record_id: np.id, record_type: 'product',
        new_data: { name: form.name, sku: form.sku } });
    }
    setModalVisible(false);
  };

  const getStockBadge = (p: ProductFull) => {
    if (!p.track_inventory) return null;
    const qty = p.current_stock ?? 0;
    if (qty === 0) return { label: language === 'ar' ? 'نفد' : 'Out', color: Colors.danger, bg: Colors.dangerLight };
    if (lowStockIds.has(p.id)) return { label: language === 'ar' ? 'منخفض' : 'Low', color: Colors.warning, bg: Colors.warningLight };
    return null;
  };

  const getCategoryName = (id?: string) => {
    const cat = flatCategories.find(c => c.id === id);
    return cat ? (language === 'ar' ? (cat.name_ar ?? cat.name) : cat.name) : '';
  };

  const FORM_TABS: { key: FormTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'basic',    labelAr: 'الأساسي', labelEn: 'Basic',    icon: 'info' },
    { key: 'pricing',  labelAr: 'التسعير', labelEn: 'Pricing',  icon: 'attach-money' },
    { key: 'stock',    labelAr: 'المخزون', labelEn: 'Stock',    icon: 'inventory' },
    { key: 'advanced', labelAr: 'متقدم',   labelEn: 'Advanced', icon: 'settings' },
  ];

  const renderItem = ({ item }: { item: ProductFull }) => {
    const stockBadge = getStockBadge(item);
    const catName = getCategoryName(item.category_id);
    const brand = brands.find(b => b.id === item.brand_id);
    const statusCfg = STATUS_CONFIG[item.status];
    const stock = getProductStock(item.id);

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/company/product-detail', params: { id: item.id } } as any)}
        style={({ pressed }) => [styles.card, isRTL && styles.cardRTL, pressed && { opacity: 0.9 }]}
      >
        {/* Product Icon / Color */}
        <View style={[styles.productIcon, { backgroundColor: `${Colors.primary}15` }]}>
          <MaterialIcons
            name={item.type === 'service' ? 'miscellaneous-services' : item.type === 'bundle' ? 'category' : 'inventory-2'}
            size={22} color={Colors.primary}
          />
          {stockBadge ? (
            <View style={[styles.stockDot, { backgroundColor: stockBadge.color }]} />
          ) : null}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
            <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={1}>
              {language === 'ar' ? (item.name_ar ?? item.name) : item.name}
            </Text>
            {item.has_variants ? (
              <View style={styles.variantBadge}>
                <Text style={styles.variantBadgeText}>{language === 'ar' ? 'متعدد' : 'Variants'}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <Text style={styles.sku}>{item.sku}</Text>
            {catName ? <Text style={styles.meta}>· {catName}</Text> : null}
            {brand ? <Text style={styles.meta}>· {brand.name}</Text> : null}
          </View>
          <View style={[styles.priceRow, isRTL && styles.priceRowRTL]}>
            <Text style={styles.price}>{fmtCurrency(item.sale_price)}</Text>
            {item.track_inventory ? (
              <Text style={[styles.stockQty, (item.current_stock ?? 0) === 0 && { color: Colors.danger }]}>
                {language === 'ar' ? `المخزون: ${stock.total}` : `Stock: ${stock.total}`}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right */}
        <View style={[styles.rightCol, isRTL && styles.rightColRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
            </Text>
          </View>
          {stockBadge ? (
            <View style={[styles.alertBadge, { backgroundColor: stockBadge.bg }]}>
              <MaterialIcons name="warning" size={11} color={stockBadge.color} />
              <Text style={[styles.alertBadgeText, { color: stockBadge.color }]}>{stockBadge.label}</Text>
            </View>
          ) : null}
          {can('products', 'edit') ? (
            <Pressable onPress={() => openEdit(item)} style={styles.editBtn} hitSlop={6}>
              <MaterialIcons name="edit" size={14} color={Colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'المنتجات' : 'Products'}>
      <PermissionGuard module="products" action="view">
        <View style={styles.root}>
          {/* Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statsRow}>
              <StatPill icon="inventory-2" label={language === 'ar' ? 'إجمالي' : 'Total'} value={String(stats.total)} color={Colors.primary} />
              <StatPill icon="check-circle" label={language === 'ar' ? 'نشط' : 'Active'} value={String(stats.active)} color={Colors.success} />
              <StatPill icon="warning" label={language === 'ar' ? 'مخزون منخفض' : 'Low Stock'} value={String(stats.lowStock)} color={Colors.warning} />
              <StatPill icon="remove-shopping-cart" label={language === 'ar' ? 'نفد' : 'Out of Stock'} value={String(stats.outOfStock)} color={Colors.danger} />
              <StatPill icon="account-balance-wallet" label={language === 'ar' ? 'قيمة المخزون' : 'Inventory Value'} value={fmtCurrency(stats.totalValue)} color={Colors.accent} />
            </View>
          </ScrollView>

          {/* Toolbar */}
          <View style={[styles.toolbar, isRTL && styles.toolbarRTL]}>
            <View style={[styles.searchBox, isRTL && styles.searchBoxRTL]}>
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.searchInput, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'اسم، SKU، باركود...' : 'Name, SKU, barcode...'}
                placeholderTextColor={Colors.textMuted}
                value={search} onChangeText={setSearch}
                textAlign={isRTL ? 'right' : 'left'}
              />
              {search ? <Pressable onPress={() => setSearch('')}><MaterialIcons name="close" size={16} color={Colors.textMuted} /></Pressable> : null}
            </View>
            {can('products', 'create') ? (
              <Pressable onPress={openAdd} style={styles.addBtn}>
                <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة' : 'Add'}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {(['all', 'active', 'inactive', 'archived'] as const).map(s => (
                <Pressable key={s} onPress={() => setFilterStatus(s)} style={[styles.chip, filterStatus === s && styles.chipActive]}>
                  <Text style={[styles.chipText, filterStatus === s && styles.chipTextActive]}>
                    {s === 'all' ? (language === 'ar' ? 'الكل' : 'All') :
                      language === 'ar' ? STATUS_CONFIG[s].labelAr : STATUS_CONFIG[s].labelEn}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.divider} />
              <Pressable onPress={() => setFilterStock(filterStock === 'low' ? 'all' : 'low')}
                style={[styles.chip, filterStock === 'low' && { backgroundColor: Colors.warning, borderColor: Colors.warning }]}>
                <MaterialIcons name="warning" size={12} color={filterStock === 'low' ? '#FFF' : Colors.warning} />
                <Text style={[styles.chipText, filterStock === 'low' && styles.chipTextActive]}>{language === 'ar' ? 'منخفض' : 'Low Stock'}</Text>
              </Pressable>
              <Pressable onPress={() => setFilterStock(filterStock === 'out' ? 'all' : 'out')}
                style={[styles.chip, filterStock === 'out' && { backgroundColor: Colors.danger, borderColor: Colors.danger }]}>
                <MaterialIcons name="remove-shopping-cart" size={12} color={filterStock === 'out' ? '#FFF' : Colors.danger} />
                <Text style={[styles.chipText, filterStock === 'out' && styles.chipTextActive]}>{language === 'ar' ? 'نفد' : 'Out of Stock'}</Text>
              </Pressable>
              {flatCategories.filter(c => c.level === 0).slice(0, 5).map(cat => (
                <Pressable key={cat.id}
                  onPress={() => setFilterCategory(filterCategory === cat.id ? 'all' : cat.id)}
                  style={[styles.chip, filterCategory === cat.id && { backgroundColor: cat.color ?? Colors.primary, borderColor: cat.color ?? Colors.primary }]}>
                  <Text style={[styles.chipText, filterCategory === cat.id && styles.chipTextActive]}>
                    {language === 'ar' ? (cat.name_ar ?? cat.name) : cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Sort + Count */}
          <View style={[styles.sortRow, isRTL && styles.sortRowRTL]}>
            <Text style={styles.countText}>{language === 'ar' ? `${filtered.length} منتج` : `${filtered.length} products`}</Text>
            <View style={styles.sortBtns}>
              {(['name', 'stock', 'price'] as const).map(s => (
                <Pressable key={s} onPress={() => setSortBy(s)} style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}>
                  <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                    {s === 'name' ? (language === 'ar' ? 'الاسم' : 'Name') :
                      s === 'stock' ? (language === 'ar' ? 'المخزون' : 'Stock') : (language === 'ar' ? 'السعر' : 'Price')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="inventory-2" size={52} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{language === 'ar' ? 'لا توجد منتجات' : 'No products found'}</Text>
              </View>
            }
          />
        </View>
      </PermissionGuard>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setModalVisible(false)} />
          <View style={[mStyles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[mStyles.header, isRTL && mStyles.headerRTL]}>
              <Text style={mStyles.title}>{editingProduct ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'منتج جديد' : 'New Product')}</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}><MaterialIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}>
              <View style={{ flexDirection: 'row' }}>
                {FORM_TABS.map(t => (
                  <Pressable key={t.key} onPress={() => setFormTab(t.key)} style={[mStyles.tab, formTab === t.key && mStyles.tabActive]}>
                    <MaterialIcons name={t.icon as any} size={13} color={formTab === t.key ? Colors.primary : Colors.textMuted} />
                    <Text style={[mStyles.tabText, formTab === t.key && mStyles.tabTextActive]}>{language === 'ar' ? t.labelAr : t.labelEn}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: Spacing.base }}>
              {formTab === 'basic' ? (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  {/* Type */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'نوع المنتج' : 'Product Type'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['product', 'service'] as const).map(t => (
                        <Pressable key={t} onPress={() => setForm(f => ({ ...f, type: t }))}
                          style={[mStyles.typeBtn, form.type === t && mStyles.typeBtnActive]}>
                          <MaterialIcons name={t === 'service' ? 'miscellaneous-services' : 'inventory-2'} size={16}
                            color={form.type === t ? Colors.primary : Colors.textMuted} />
                          <Text style={[mStyles.typeBtnText, form.type === t && mStyles.typeBtnTextActive]}>
                            {t === 'service' ? (language === 'ar' ? 'خدمة' : 'Service') : (language === 'ar' ? 'منتج' : 'Product')}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <MF label={language === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'} value={form.name_ar} onChange={(v: string) => setForm(f => ({ ...f, name_ar: v }))} isRTL={isRTL} />
                  <MF label={language === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'} value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} isRTL={isRTL} required />
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <MF label="SKU" value={form.sku} onChange={(v: string) => setForm(f => ({ ...f, sku: v }))} isRTL={isRTL} required />
                    </View>
                    <View style={{ flex: 1 }}>
                      <MF label={language === 'ar' ? 'باركود' : 'Barcode'} value={form.barcode} onChange={(v: string) => setForm(f => ({ ...f, barcode: v }))} isRTL={isRTL} />
                    </View>
                  </View>
                  {/* Category */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'التصنيف' : 'Category'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable onPress={() => setForm(f => ({ ...f, category_id: '' }))}
                          style={[mStyles.chip, !form.category_id && mStyles.chipActive]}>
                          <Text style={[mStyles.chipText, !form.category_id && mStyles.chipTextActive]}>{language === 'ar' ? 'بدون' : 'None'}</Text>
                        </Pressable>
                        {flatCategories.map(cat => (
                          <Pressable key={cat.id} onPress={() => setForm(f => ({ ...f, category_id: cat.id }))}
                            style={[mStyles.chip, form.category_id === cat.id && { backgroundColor: cat.color ?? Colors.primary, borderColor: cat.color ?? Colors.primary }]}>
                            <Text style={{ marginLeft: cat.level > 0 ? 8 : 0 }}>
                              {cat.level > 0 ? '└ ' : ''}
                            </Text>
                            <Text style={[mStyles.chipText, form.category_id === cat.id && { color: '#FFF' }]}>
                              {language === 'ar' ? (cat.name_ar ?? cat.name) : cat.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  {/* Brand */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'الماركة' : 'Brand'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable onPress={() => setForm(f => ({ ...f, brand_id: '' }))}
                          style={[mStyles.chip, !form.brand_id && mStyles.chipActive]}>
                          <Text style={[mStyles.chipText, !form.brand_id && mStyles.chipTextActive]}>{language === 'ar' ? 'بدون' : 'None'}</Text>
                        </Pressable>
                        {brands.map(b => (
                          <Pressable key={b.id} onPress={() => setForm(f => ({ ...f, brand_id: b.id }))}
                            style={[mStyles.chip, form.brand_id === b.id && mStyles.chipActive]}>
                            <Text style={[mStyles.chipText, form.brand_id === b.id && mStyles.chipTextActive]}>
                              {language === 'ar' ? (b.name_ar ?? b.name) : b.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  {/* Unit */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'وحدة القياس' : 'Unit of Measure'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {units.map(u => (
                          <Pressable key={u.id} onPress={() => setForm(f => ({ ...f, unit_id: u.id, unit_symbol: u.symbol }))}
                            style={[mStyles.chip, form.unit_id === u.id && mStyles.chipActive]}>
                            <Text style={[mStyles.chipText, form.unit_id === u.id && mStyles.chipTextActive]}>
                              {language === 'ar' ? u.name_ar : u.name} ({u.symbol})
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              ) : formTab === 'pricing' ? (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  <MF label={language === 'ar' ? 'سعر التكلفة (KWD)' : 'Cost Price (KWD)'} value={form.cost_price} onChange={(v: string) => setForm(f => ({ ...f, cost_price: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                  <MF label={language === 'ar' ? 'سعر الشراء (KWD)' : 'Purchase Price (KWD)'} value={form.purchase_price} onChange={(v: string) => setForm(f => ({ ...f, purchase_price: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                  <MF label={language === 'ar' ? 'سعر البيع (KWD)' : 'Sale Price (KWD)'} value={form.sale_price} onChange={(v: string) => setForm(f => ({ ...f, sale_price: v }))} isRTL={isRTL} keyboardType="decimal-pad" required />
                  <MF label={language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'} value={form.tax_rate} onChange={(v: string) => setForm(f => ({ ...f, tax_rate: v }))} isRTL={isRTL} keyboardType="decimal-pad" />
                  {/* Margin preview */}
                  {form.cost_price && form.sale_price ? (
                    <View style={[mStyles.marginPreview, isRTL && mStyles.marginPreviewRTL]}>
                      <MaterialIcons name="trending-up" size={16} color={Colors.success} />
                      <Text style={[mStyles.marginText, isRTL && { textAlign: 'right' }]}>
                        {language === 'ar' ? 'هامش الربح: ' : 'Margin: '}
                        <Text style={{ color: Colors.success, fontWeight: Typography.fontWeightBold }}>
                          {(((parseFloat(form.sale_price) - parseFloat(form.cost_price)) / parseFloat(form.sale_price)) * 100).toFixed(1)}%
                        </Text>
                        {' — '}
                        {fmtCurrency(parseFloat(form.sale_price) - parseFloat(form.cost_price))}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : formTab === 'stock' ? (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  {/* Track Inventory toggle */}
                  <View style={[mStyles.toggleRow, isRTL && mStyles.toggleRowRTL]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[mStyles.toggleLabel, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'تتبع المخزون' : 'Track Inventory'}</Text>
                      <Text style={[mStyles.toggleDesc, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'متابعة الكميات تلقائياً' : 'Automatically track quantities'}</Text>
                    </View>
                    <Pressable onPress={() => setForm(f => ({ ...f, track_inventory: !f.track_inventory }))}
                      style={[mStyles.toggle, form.track_inventory && mStyles.toggleOn]}>
                      <View style={[mStyles.toggleKnob, form.track_inventory && mStyles.toggleKnobOn]} />
                    </Pressable>
                  </View>
                  {form.track_inventory ? (
                    <>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <MF label={language === 'ar' ? 'الحد الأدنى' : 'Min Stock'} value={form.min_stock} onChange={(v: string) => setForm(f => ({ ...f, min_stock: v }))} isRTL={isRTL} keyboardType="number-pad" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <MF label={language === 'ar' ? 'نقطة إعادة الطلب' : 'Reorder Point'} value={form.reorder_point} onChange={(v: string) => setForm(f => ({ ...f, reorder_point: v }))} isRTL={isRTL} keyboardType="number-pad" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <MF label={language === 'ar' ? 'الحد الأقصى' : 'Max Stock'} value={form.max_stock} onChange={(v: string) => setForm(f => ({ ...f, max_stock: v }))} isRTL={isRTL} keyboardType="number-pad" />
                        </View>
                      </View>
                      {/* Tracking type */}
                      <View>
                        <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'نوع التتبع' : 'Tracking Type'}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {TRACKING_TYPE_OPTIONS.map(opt => (
                            <Pressable key={opt.value} onPress={() => setForm(f => ({ ...f, tracking_type: opt.value as any }))}
                              style={[mStyles.chip, form.tracking_type === opt.value && mStyles.chipActive]}>
                              <Text style={[mStyles.chipText, form.tracking_type === opt.value && mStyles.chipTextActive]}>
                                {language === 'ar' ? opt.labelAr : opt.labelEn}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={mStyles.infoBox}>
                      <MaterialIcons name="info" size={16} color={Colors.info} />
                      <Text style={[mStyles.infoText, isRTL && { textAlign: 'right' }]}>
                        {language === 'ar' ? 'لن يتم تتبع كميات هذا المنتج في المخزون.' : 'This product will not track inventory quantities.'}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ gap: Spacing.md, paddingTop: Spacing.md }}>
                  {/* Costing Method */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'طريقة احتساب التكلفة' : 'Costing Method'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {COSTING_METHOD_OPTIONS.map(opt => (
                        <Pressable key={opt.value} onPress={() => setForm(f => ({ ...f, costing_method: opt.value as any }))}
                          style={[mStyles.typeBtn, form.costing_method === opt.value && mStyles.typeBtnActive]}>
                          <Text style={[mStyles.typeBtnText, form.costing_method === opt.value && mStyles.typeBtnTextActive]}>
                            {language === 'ar' ? opt.labelAr : opt.labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  {/* Status */}
                  <View>
                    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{language === 'ar' ? 'الحالة' : 'Status'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['active', 'inactive'] as ProductStatus[]).map(s => (
                        <Pressable key={s} onPress={() => setForm(f => ({ ...f, status: s }))}
                          style={[mStyles.typeBtn, form.status === s && { borderColor: STATUS_CONFIG[s].color, backgroundColor: STATUS_CONFIG[s].bg }]}>
                          <Text style={[mStyles.typeBtnText, form.status === s && { color: STATUS_CONFIG[s].color }]}>
                            {language === 'ar' ? STATUS_CONFIG[s].labelAr : STATUS_CONFIG[s].labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <MF label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'} value={form.description_ar} onChange={(v: string) => setForm(f => ({ ...f, description_ar: v }))} isRTL={isRTL} multiline />
                  <MF label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'} value={form.description} onChange={(v: string) => setForm(f => ({ ...f, description: v }))} isRTL={isRTL} multiline />
                </View>
              )}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
            <View style={[mStyles.footer, isRTL && mStyles.footerRTL]}>
              <Pressable onPress={() => setModalVisible(false)} style={mStyles.cancelBtn}>
                <Text style={mStyles.cancelText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={mStyles.saveBtn}>
                <Text style={mStyles.saveText}>{language === 'ar' ? 'حفظ المنتج' : 'Save Product'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CompanyLayout>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

const MF = ({ label, value, onChange, isRTL, required, keyboardType, multiline }: any) => (
  <View>
    <Text style={[mStyles.label, isRTL && mStyles.labelRTL]}>{label}{required ? <Text style={{ color: Colors.danger }}> *</Text> : null}</Text>
    <TextInput
      style={[mStyles.input, isRTL && mStyles.inputRTL, multiline && { minHeight: 64, textAlignVertical: 'top' }]}
      value={value} onChangeText={onChange}
      placeholderTextColor={Colors.textMuted}
      textAlign={isRTL ? 'right' : 'left'}
      keyboardType={keyboardType ?? 'default'}
      multiline={multiline} autoCapitalize="none"
    />
  </View>
);

const mStyles = StyleSheet.create({
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '92%', ...Shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  label: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, marginBottom: 6, includeFontPadding: false },
  labelRTL: { textAlign: 'right' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.fontSizeBase, color: Colors.text, backgroundColor: Colors.surface, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  typeBtnTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background, flexDirection: 'row', alignItems: 'center' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  chipTextActive: { color: '#FFF', fontWeight: Typography.fontWeightSemibold },
  marginPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.successLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.success },
  marginPreviewRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.success },
  marginText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.text, includeFontPadding: false },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md },
  toggleRowRTL: { flexDirection: 'row-reverse' },
  toggleLabel: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  toggleDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md },
  infoText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.info, lineHeight: 20, includeFontPadding: false },
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
  toolbar: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  toolbarRTL: { flexDirection: 'row-reverse' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, borderWidth: 1.5, borderColor: Colors.border },
  searchBoxRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  inputRTL: { textAlign: 'right' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: Spacing.base, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  chipTextActive: { color: Colors.textInverse },
  divider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  sortRowRTL: { flexDirection: 'row-reverse' },
  countText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  sortBtns: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortBtnText: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  sortBtnTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  cardRTL: { flexDirection: 'row-reverse' },
  productIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  stockDot: { position: 'absolute', top: 4, right: 4, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.surface },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  nameRowRTL: { flexDirection: 'row-reverse' },
  productName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, flex: 1, includeFontPadding: false },
  variantBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight },
  variantBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  metaRowRTL: { flexDirection: 'row-reverse' },
  sku: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  meta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  priceRowRTL: { flexDirection: 'row-reverse' },
  price: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  stockQty: { fontSize: Typography.fontSizeXS, color: Colors.textSecondary, includeFontPadding: false },
  rightCol: { alignItems: 'flex-end', gap: 5 },
  rightColRTL: { alignItems: 'flex-start' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  alertBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  editBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
