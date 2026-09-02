// Purchase Create — New Purchase Invoice Form with Cost Engine
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../hooks/useLanguage';
import { usePurchases } from '../../contexts/PurchasesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { PurchaseInvoiceFull, PurchaseInvoiceItemFull, PaymentMethod, DiscountType, Currency } from '../../types/purchases';
import {
  DEMO_PURCHASE_SUPPLIERS, DEMO_PURCHASE_PRODUCTS,
  generatePurchaseNumber, calculateDueDate,
} from '../../services/purchasesData';
import { useAlert } from '@/template';

interface DraftItem {
  id: string;
  product_id: string;
  product_name: string;
  product_name_ar: string;
  product_code: string;
  unit_symbol: string;
  unit_id: string;
  quantity: string;
  unit_cost: string;
  discount_type: DiscountType;
  discount_value: string;
  last_cost: number;
  current_stock: number;
}

const CURRENCIES: { value: Currency; label: string; rate: number }[] = [
  { value: 'KWD', label: 'KWD — د.ك', rate: 1.000 },
  { value: 'SAR', label: 'SAR — ريال', rate: 3.975 },
  { value: 'AED', label: 'AED — درهم', rate: 1.088 },
  { value: 'USD', label: 'USD — دولار', rate: 3.270 },
  { value: 'OMR', label: 'OMR — ريال عماني', rate: 0.839 },
  { value: 'EUR', label: 'EUR — يورو', rate: 3.532 },
];

export default function PurchaseCreate() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { addInvoice, getNextInvoiceNumber, policy } = usePurchases();

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierNameAr, setSupplierNameAr] = useState('');
  const [supplierInvNum, setSupplierInvNum] = useState('');
  const [currency, setCurrency] = useState<Currency>('KWD');
  const [exchangeRate, setExchangeRate] = useState('1.000');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('30_days');
  const [warehouseId] = useState('wh-001');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const dueDate = useMemo(() => calculateDueDate(date, paymentTerms), [date, paymentTerms]);
  const selectedCurrencyData = CURRENCIES.find(c => c.value === currency);
  const rate = parseFloat(exchangeRate) || 1;

  // ── COMPUTED TOTALS ────────────────────────────────────────────
  const computedLines = useMemo(() => {
    return items.map(item => {
      const qty = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.unit_cost) || 0;
      const discVal = parseFloat(item.discount_value) || 0;
      const lineSubtotal = qty * cost;
      const discAmount = item.discount_type === 'percentage'
        ? lineSubtotal * (discVal / 100)
        : discVal;
      const lineAfterDisc = lineSubtotal - discAmount;
      const lineKWD = lineAfterDisc * rate;
      const lastCostKWD = item.last_cost;
      const priceVariance = cost - (lastCostKWD / rate);
      return { ...item, qty, cost, discAmount, lineSubtotal: lineAfterDisc, lineKWD, priceVariance, totalCostKWD: lineKWD };
    });
  }, [items, rate]);

  const totals = useMemo(() => {
    const subtotal = computedLines.reduce((s, l) => s + l.lineSubtotal, 0);
    const subtotalKWD = subtotal * rate;
    return { subtotal, subtotalKWD, total: subtotal, totalKWD: subtotalKWD };
  }, [computedLines, rate]);

  // ── ADD PRODUCT ────────────────────────────────────────────────
  const addProduct = useCallback((prod: typeof DEMO_PURCHASE_PRODUCTS[0]) => {
    const newItem: DraftItem = {
      id: `draft-${Date.now()}-${Math.random()}`,
      product_id: prod.id,
      product_name: prod.name,
      product_name_ar: prod.name_ar,
      product_code: prod.sku,
      unit_symbol: prod.unit_symbol,
      unit_id: prod.unit_id,
      quantity: '1',
      unit_cost: (prod.last_cost / rate).toFixed(3),
      discount_type: 'percentage',
      discount_value: '0',
      last_cost: prod.last_cost,
      current_stock: prod.current_stock,
    };
    setItems(prev => [...prev, newItem]);
    setShowProductModal(false);
  }, [rate]);

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof DraftItem, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ── SUBMIT ────────────────────────────────────────────────────
  const handleSubmit = (asDraft: boolean) => {
    if (!supplierName.trim()) {
      showAlert(language === 'ar' ? 'مطلوب' : 'Required', language === 'ar' ? 'يرجى تحديد المورد' : 'Please select a supplier');
      return;
    }
    if (items.length === 0) {
      showAlert(language === 'ar' ? 'مطلوب' : 'Required', language === 'ar' ? 'أضف منتجًا على الأقل' : 'Add at least one product');
      return;
    }
    const invNumber = getNextInvoiceNumber();
    const now = new Date().toISOString();
    const fullItems: PurchaseInvoiceItemFull[] = computedLines.map((cl, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      invoice_id: 'new',
      line_number: idx + 1,
      product_id: cl.product_id,
      product_name: cl.product_name,
      product_name_ar: cl.product_name_ar,
      product_code: cl.product_code,
      quantity: cl.qty,
      unit_id: cl.unit_id,
      unit_symbol: cl.unit_symbol,
      unit_cost: cl.cost,
      unit_cost_kwd: cl.cost * rate,
      po_unit_cost: cl.last_cost / rate,
      price_variance: cl.priceVariance,
      line_discount_type: cl.discount_type,
      line_discount_value: parseFloat(cl.discount_value) || 0,
      line_discount_amount: cl.discAmount,
      line_subtotal: cl.lineSubtotal,
      tax_rate: 0,
      tax_amount: 0,
      line_total: cl.lineSubtotal,
      allocated_shipping: 0,
      allocated_customs: 0,
      allocated_insurance: 0,
      allocated_other: 0,
      total_landed_cost: 0,
      final_unit_cost: cl.cost * rate,
    }));
    const invoice: PurchaseInvoiceFull = {
      id: `pi-${Date.now()}`,
      company_id: 'company-001',
      branch_id: 'branch-001',
      invoice_number: invNumber,
      supplier_invoice_number: supplierInvNum || undefined,
      supplier_id: supplierId || 'sup-new',
      supplier_name: supplierName,
      supplier_name_ar: supplierNameAr || undefined,
      date,
      due_date: dueDate,
      currency,
      exchange_rate: rate,
      warehouse_id: warehouseId,
      items: fullItems,
      subtotal: totals.subtotal,
      invoice_discount_type: 'percentage',
      invoice_discount_value: 0,
      invoice_discount_amount: 0,
      tax_amount: 0,
      total: totals.total,
      total_kwd: totals.totalKWD,
      paid_amount: 0,
      outstanding: totals.total,
      payments: [],
      payment_method: paymentMethod,
      matching_status: 'not_matched',
      qty_variance: 0,
      price_variance: 0,
      price_variance_amount: 0,
      status: asDraft ? 'draft' : 'approved',
      total_landed_cost_allocated: 0,
      final_inventory_cost: totals.totalKWD,
      accounting_status: asDraft ? 'pending' : 'posted',
      notes: notes || undefined,
      created_by: 'user-002',
      approved_by: asDraft ? undefined : 'user-002',
      approved_at: asDraft ? undefined : now,
      created_at: now,
      updated_at: now,
    };
    addInvoice(invoice);
    showAlert(
      language === 'ar' ? (asDraft ? 'تم الحفظ' : 'تم الاعتماد') : (asDraft ? 'Saved as Draft' : 'Invoice Approved'),
      language === 'ar'
        ? `تم ${asDraft ? 'حفظ' : 'اعتماد'} الفاتورة ${invNumber} بنجاح`
        : `Invoice ${invNumber} ${asDraft ? 'saved as draft' : 'approved'} successfully`,
      [{ text: language === 'ar' ? 'حسناً' : 'OK', onPress: () => router.back() }]
    );
  };

  const fmt3 = (n: number) => n.toFixed(3);
  const varianceColor = (v: number) => Math.abs(v) > 0.5 ? Colors.danger : v > 0 ? Colors.warning : Colors.success;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {language === 'ar' ? 'فاتورة شراء جديدة' : 'New Purchase Invoice'}
          </Text>
          <View style={[styles.headerActions, isRTL && styles.headerActionsRTL]}>
            <Pressable onPress={() => handleSubmit(true)} style={styles.draftBtn}>
              <Text style={styles.draftBtnText}>{language === 'ar' ? 'مسودة' : 'Draft'}</Text>
            </Pressable>
            <Pressable onPress={() => handleSubmit(false)} style={styles.approveBtn}>
              <Text style={styles.approveBtnText}>{language === 'ar' ? 'اعتماد' : 'Approve'}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invoice Number */}
          <View style={[styles.invNumRow, isRTL && styles.invNumRowRTL]}>
            <MaterialIcons name="tag" size={16} color={Colors.warning} />
            <Text style={styles.invNum}>{getNextInvoiceNumber()}</Text>
            <View style={styles.invDateBadge}>
              <Text style={styles.invDateText}>{date}</Text>
            </View>
            {dueDate ? (
              <View style={[styles.dueDateBadge]}>
                <Text style={styles.dueDateText}>
                  {language === 'ar' ? `استحقاق: ${dueDate}` : `Due: ${dueDate}`}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Supplier */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRTL]}>
              {language === 'ar' ? 'المورد' : 'Supplier'}
            </Text>
            <Pressable style={[styles.selectorBtn, isRTL && styles.selectorBtnRTL]}
              onPress={() => setShowSupplierModal(true)}>
              <View style={[styles.selectorLeft, isRTL && styles.selectorLeftRTL]}>
                <MaterialIcons name="business" size={20} color={supplierId ? Colors.warning : Colors.textMuted} />
                <Text style={[styles.selectorText, !supplierName && { color: Colors.textMuted }, isRTL && styles.txtRTL]} numberOfLines={1}>
                  {supplierName || (language === 'ar' ? 'اختر المورد...' : 'Select supplier...')}
                </Text>
              </View>
              <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
            </Pressable>
            {/* Supplier invoice number */}
            <TextInput
              style={[styles.supplierInvInput, isRTL && { textAlign: 'right' }]}
              value={supplierInvNum}
              onChangeText={setSupplierInvNum}
              placeholder={language === 'ar' ? 'رقم فاتورة المورد (اختياري)...' : 'Supplier invoice number (optional)...'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Invoice Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRTL]}>
              {language === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
            </Text>
            <View style={styles.detailsGrid}>
              {/* Currency */}
              <Pressable style={[styles.detailItem, isRTL && styles.detailItemRTL]}
                onPress={() => setShowCurrencyModal(true)}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'العملة' : 'Currency'}</Text>
                <View style={[styles.detailValue, isRTL && styles.detailValueRTL]}>
                  <MaterialIcons name="currency-exchange" size={14} color={Colors.warning} />
                  <Text style={styles.detailValueText}>{currency}</Text>
                </View>
              </Pressable>
              {/* Exchange Rate */}
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'سعر الصرف' : 'Exch. Rate'}</Text>
                <TextInput
                  style={[styles.detailInput, isRTL && { textAlign: 'right' }]}
                  value={exchangeRate}
                  onChangeText={setExchangeRate}
                  keyboardType="decimal-pad"
                />
              </View>
              {/* Payment Terms */}
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'شروط الدفع' : 'Terms'}</Text>
                <Text style={styles.detailValueText} numberOfLines={1}>
                  {paymentTerms === '30_days' ? '30 ' + (language === 'ar' ? 'يوم' : 'Days') : paymentTerms}
                </Text>
              </View>
              {/* Date */}
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'التاريخ' : 'Date'}</Text>
                <TextInput
                  style={[styles.detailInput, isRTL && { textAlign: 'right' }]}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>
          </View>

          {/* Products */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
              <Text style={[styles.sectionTitle, isRTL && styles.txtRTL, { marginBottom: 0 }]}>
                {language === 'ar' ? `المنتجات (${items.length})` : `Items (${items.length})`}
              </Text>
              <Pressable style={styles.addItemBtn} onPress={() => setShowProductModal(true)}>
                <MaterialIcons name="add" size={16} color={Colors.warning} />
                <Text style={styles.addItemBtnText}>{language === 'ar' ? 'إضافة منتج' : 'Add Product'}</Text>
              </Pressable>
            </View>

            {items.length === 0 ? (
              <Pressable style={styles.emptyItems} onPress={() => setShowProductModal(true)}>
                <MaterialIcons name="add-shopping-cart" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyItemsText}>{language === 'ar' ? 'اضغط لإضافة منتجات' : 'Tap to add products'}</Text>
              </Pressable>
            ) : null}

            {computedLines.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={[styles.itemHeader, isRTL && styles.itemHeaderRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isRTL && styles.txtRTL]} numberOfLines={1}>
                      {language === 'ar' ? item.product_name_ar : item.product_name}
                    </Text>
                    <View style={[styles.itemMeta, isRTL && styles.itemMetaRTL]}>
                      <Text style={styles.itemCode}>{item.product_code}</Text>
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>
                          {language === 'ar' ? `مخزون: ${item.current_stock}` : `Stock: ${item.current_stock}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8} style={styles.removeBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
                  </Pressable>
                </View>
                {/* Fields */}
                <View style={styles.itemFields}>
                  <View style={styles.itemField}>
                    <Text style={styles.fieldLabel}>{language === 'ar' ? 'الكمية' : 'Qty'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={item.quantity}
                      onChangeText={v => updateItem(item.id, 'quantity', v)}
                      keyboardType="decimal-pad"
                      textAlign="center"
                    />
                  </View>
                  <View style={styles.itemField}>
                    <Text style={styles.fieldLabel}>{language === 'ar' ? `التكلفة (${currency})` : `Cost (${currency})`}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={item.unit_cost}
                      onChangeText={v => updateItem(item.id, 'unit_cost', v)}
                      keyboardType="decimal-pad"
                      textAlign="center"
                    />
                  </View>
                  <View style={styles.itemField}>
                    <Text style={styles.fieldLabel}>{language === 'ar' ? 'خصم%' : 'Disc%'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={item.discount_value}
                      onChangeText={v => updateItem(item.id, 'discount_value', v)}
                      keyboardType="decimal-pad"
                      textAlign="center"
                    />
                  </View>
                  <View style={[styles.itemField, styles.itemFieldTotal]}>
                    <Text style={styles.fieldLabel}>{language === 'ar' ? `الإجمالي (${currency})` : `Total (${currency})`}</Text>
                    <Text style={styles.fieldTotal}>{fmt3(item.lineSubtotal)}</Text>
                  </View>
                </View>
                {/* Cost analysis */}
                <View style={[styles.costRow, isRTL && styles.costRowRTL]}>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>{language === 'ar' ? 'التكلفة بـ KWD' : 'Cost (KWD)'}</Text>
                    <Text style={styles.costValue}>{fmt3(item.lineKWD)}</Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>{language === 'ar' ? 'آخر تكلفة' : 'Last Cost'}</Text>
                    <Text style={styles.costValue}>{fmt3(item.last_cost)}</Text>
                  </View>
                  {Math.abs(item.priceVariance) > 0.001 ? (
                    <View style={[styles.varianceChip, { backgroundColor: `${varianceColor(item.priceVariance)}15` }]}>
                      <MaterialIcons name={item.priceVariance > 0 ? 'trending-up' : 'trending-down'} size={12} color={varianceColor(item.priceVariance)} />
                      <Text style={[styles.varianceText, { color: varianceColor(item.priceVariance) }]}>
                        {item.priceVariance > 0 ? '+' : ''}{fmt3(item.priceVariance)} {language === 'ar' ? 'تباين' : 'PPV'}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.varianceChip, { backgroundColor: Colors.successLight }]}>
                      <MaterialIcons name="check" size={12} color={Colors.success} />
                      <Text style={[styles.varianceText, { color: Colors.success }]}>{language === 'ar' ? 'لا تباين' : 'No PPV'}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Totals */}
          {items.length > 0 ? (
            <View style={styles.totalsCard}>
              <Text style={[styles.sectionTitle, isRTL && styles.txtRTL]}>
                {language === 'ar' ? 'ملخص الفاتورة' : 'Invoice Summary'}
              </Text>
              {[
                { labelAr: `المجموع (${currency})`, labelEn: `Subtotal (${currency})`, value: totals.subtotal, kwd: false },
                { labelAr: 'الإجمالي بالدينار الكويتي', labelEn: 'Total (KWD)', value: totals.totalKWD, kwd: true },
              ].map((row, i) => (
                <View key={i} style={[styles.totalsRow, isRTL && styles.totalsRowRTL, row.kwd && styles.totalsRowHL]}>
                  <Text style={[styles.totalsLabel, row.kwd && styles.totalsLabelHL, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? row.labelAr : row.labelEn}
                  </Text>
                  <Text style={[styles.totalsValue, row.kwd && styles.totalsValueHL, isRTL && styles.txtRTL]}>
                    {fmt3(row.value)} {row.kwd ? 'KWD' : currency}
                  </Text>
                </View>
              ))}
              {/* Landed Cost Note */}
              <View style={[styles.lcNote, isRTL && styles.lcNoteRTL]}>
                <MaterialIcons name="info" size={14} color={Colors.info} />
                <Text style={[styles.lcNoteText, isRTL && styles.txtRTL]}>
                  {language === 'ar'
                    ? 'يمكن إضافة تكاليف الاستيراد (شحن، جمارك، تأمين) بعد اعتماد الفاتورة من خلال قسم تكاليف الاستيراد.'
                    : 'Landed costs (shipping, customs, insurance) can be added after approving the invoice via the Landed Costs section.'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRTL]}>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Text>
            <TextInput
              style={[styles.notesInput, isRTL && { textAlign: 'right' }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder={language === 'ar' ? 'ملاحظات اختيارية...' : 'Optional notes...'}
              placeholderTextColor={Colors.textMuted}
              textAlignVertical="top"
            />
          </View>

          {/* Submit */}
          <View style={[styles.submitRow, isRTL && styles.submitRowRTL]}>
            <Pressable style={styles.draftSubmitBtn} onPress={() => handleSubmit(true)}>
              <MaterialIcons name="save" size={18} color={Colors.textSecondary} />
              <Text style={styles.draftSubmitBtnText}>{language === 'ar' ? 'حفظ مسودة' : 'Save Draft'}</Text>
            </Pressable>
            <Pressable style={styles.approveSubmitBtn} onPress={() => handleSubmit(false)}>
              <MaterialIcons name="check-circle" size={18} color={Colors.textInverse} />
              <Text style={styles.approveSubmitBtnText}>{language === 'ar' ? 'اعتماد الفاتورة' : 'Approve Invoice'}</Text>
            </Pressable>
          </View>
          <View style={{ height: insets.bottom + Spacing['3xl'] }} />
        </ScrollView>
      </View>

      {/* ── SUPPLIER MODAL ─────────────────────────────────────── */}
      <Modal visible={showSupplierModal} transparent animationType="slide" onRequestClose={() => setShowSupplierModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSupplierModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.txtRTL]}>{language === 'ar' ? 'اختر المورد' : 'Select Supplier'}</Text>
          <FlatList
            data={DEMO_PURCHASE_SUPPLIERS}
            keyExtractor={s => s.id}
            renderItem={({ item }) => (
              <Pressable style={[styles.listItem, isRTL && styles.listItemRTL]}
                onPress={() => {
                  setSupplierId(item.id);
                  setSupplierName(item.name);
                  setSupplierNameAr(item.name_ar);
                  const currData = CURRENCIES.find(c => c.value === item.currency);
                  if (currData) { setCurrency(currData.value); setExchangeRate(currData.rate.toFixed(3)); }
                  setShowSupplierModal(false);
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? item.name_ar : item.name}
                  </Text>
                  <Text style={styles.listItemSub}>{item.code} · {item.country} · {item.currency}</Text>
                </View>
                <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  <Text style={[styles.listItemBal, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? 'الرصيد:' : 'Bal:'} {item.balance.toFixed(3)} KWD
                  </Text>
                  <Text style={styles.listItemSub}>{item.payment_terms}</Text>
                </View>
              </Pressable>
            )}
            style={{ maxHeight: 350 }}
          />
        </View>
      </Modal>

      {/* ── PRODUCT MODAL ──────────────────────────────────────── */}
      <Modal visible={showProductModal} transparent animationType="slide" onRequestClose={() => setShowProductModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowProductModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.txtRTL]}>{language === 'ar' ? 'اختر منتجًا' : 'Select Product'}</Text>
          <FlatList
            data={DEMO_PURCHASE_PRODUCTS}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <Pressable style={[styles.listItem, isRTL && styles.listItemRTL]} onPress={() => addProduct(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? item.name_ar : item.name}
                  </Text>
                  <Text style={styles.listItemSub}>{item.sku}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.listItemPrice}>
                    {(item.last_cost / rate).toFixed(3)} {currency}
                  </Text>
                  <Text style={styles.listItemSub}>
                    {language === 'ar' ? `آخر تكلفة: ${item.last_cost.toFixed(3)} KWD` : `Last: ${item.last_cost.toFixed(3)} KWD`}
                  </Text>
                </View>
              </Pressable>
            )}
            style={{ maxHeight: 400 }}
          />
        </View>
      </Modal>

      {/* ── CURRENCY MODAL ─────────────────────────────────────── */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCurrencyModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.txtRTL]}>{language === 'ar' ? 'اختر العملة' : 'Select Currency'}</Text>
          {CURRENCIES.map(c => (
            <Pressable key={c.value} style={[styles.listItem, isRTL && styles.listItemRTL, currency === c.value && styles.listItemSelected]}
              onPress={() => { setCurrency(c.value); setExchangeRate(c.rate.toFixed(3)); setShowCurrencyModal(false); }}>
              <Text style={[styles.listItemTitle, isRTL && styles.txtRTL]}>{c.label}</Text>
              <Text style={styles.listItemSub}>1 {c.value} = {c.rate.toFixed(3)} KWD</Text>
              {currency === c.value ? <MaterialIcons name="check" size={18} color={Colors.warning} style={{ marginStart: 'auto' }} /> : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerActionsRTL: { flexDirection: 'row-reverse' },
  draftBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  draftBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  approveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.warning },
  approveBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  content: { padding: Spacing.base, gap: Spacing.base },
  // Invoice number
  invNumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.md, flexWrap: 'wrap' },
  invNumRowRTL: { flexDirection: 'row-reverse' },
  invNum: { flex: 1, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  invDateBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.surface, borderRadius: Radius.full },
  invDateText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontFamily: 'monospace', includeFontPadding: false },
  dueDateBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.dangerLight, borderRadius: Radius.full },
  dueDateText: { fontSize: Typography.fontSizeSM, color: Colors.danger, fontFamily: 'monospace', includeFontPadding: false },
  // Sections
  section: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  // Supplier
  selectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  selectorBtnRTL: { flexDirection: 'row-reverse' },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  selectorLeftRTL: { flexDirection: 'row-reverse' },
  selectorText: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
  supplierInvInput: { marginTop: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.fontSizeSM, color: Colors.text, borderWidth: 1, borderColor: Colors.border, includeFontPadding: false },
  // Details grid
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  detailItem: { flex: 1, minWidth: 130, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  detailItemRTL: {},
  detailLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 6, includeFontPadding: false },
  detailValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailValueRTL: { flexDirection: 'row-reverse' },
  detailValueText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  detailInput: { fontSize: Typography.fontSizeSM, color: Colors.text, padding: 0, includeFontPadding: false },
  // Add item
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.warning, backgroundColor: Colors.warningLight },
  addItemBtnText: { fontSize: Typography.fontSizeSM, color: Colors.warning, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Empty items
  emptyItems: { alignItems: 'center', paddingVertical: 32, gap: 8, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: Radius.lg },
  emptyItemsText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  // Item card
  itemCard: { backgroundColor: Colors.background, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  itemHeaderRTL: { flexDirection: 'row-reverse' },
  itemName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  itemMetaRTL: { flexDirection: 'row-reverse' },
  itemCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  removeBtn: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight },
  stockText: { fontSize: 10, fontWeight: Typography.fontWeightSemibold, color: Colors.primary, includeFontPadding: false },
  // Item fields
  itemFields: { flexDirection: 'row', gap: Spacing.sm },
  itemField: { flex: 1, alignItems: 'center' },
  itemFieldTotal: { flex: 1.5 },
  fieldLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 4, includeFontPadding: false, textAlign: 'center' },
  fieldInput: { width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 8, fontSize: Typography.fontSizeSM, color: Colors.text, borderWidth: 1, borderColor: Colors.border, textAlign: 'center', includeFontPadding: false },
  fieldTotal: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  // Cost row
  costRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, flexWrap: 'wrap' },
  costRowRTL: { flexDirection: 'row-reverse' },
  costItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  costValue: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, color: Colors.textSecondary, includeFontPadding: false },
  varianceChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  varianceText: { fontSize: 10, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Totals
  totalsCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  totalsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  totalsRowRTL: { flexDirection: 'row-reverse' },
  totalsRowHL: { borderBottomWidth: 0, paddingTop: 12 },
  totalsLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  totalsLabelHL: { color: Colors.text, fontWeight: Typography.fontWeightBold, fontSize: Typography.fontSizeMD },
  totalsValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  totalsValueHL: { color: Colors.warning, fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold },
  lcNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  lcNoteRTL: { flexDirection: 'row-reverse' },
  lcNoteText: { flex: 1, fontSize: Typography.fontSizeXS, color: Colors.info, lineHeight: 18, includeFontPadding: false },
  // Notes
  notesInput: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.fontSizeBase, color: Colors.text, borderWidth: 1.5, borderColor: Colors.border, minHeight: 80, includeFontPadding: false },
  // Submit
  submitRow: { flexDirection: 'row', gap: Spacing.sm },
  submitRowRTL: { flexDirection: 'row-reverse' },
  draftSubmitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  draftSubmitBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, color: Colors.textSecondary, includeFontPadding: false },
  approveSubmitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.lg, backgroundColor: Colors.warning, ...Shadow.md },
  approveSubmitBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textInverse, includeFontPadding: false },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '70%', ...Shadow.lg },
  sheetTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border, includeFontPadding: false },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listItemRTL: { flexDirection: 'row-reverse' },
  listItemSelected: { backgroundColor: Colors.warningLight },
  listItemTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  listItemSub: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  listItemBal: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  listItemPrice: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  txtRTL: { textAlign: 'right' },
});
