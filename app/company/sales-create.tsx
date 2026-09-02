// Sales Create — New Invoice Form with Real-time Profitability Engine
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../hooks/useLanguage';
import { useSales } from '../../contexts/SalesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  SaleInvoiceItemFull, PAYMENT_METHOD_CONFIG, SALES_CHANNEL_CONFIG,
  DiscountType, PaymentMethod, SalesChannel, SaleInvoiceFull,
} from '../../types/sales';
import {
  DEMO_SALE_PRODUCTS, DEMO_SALE_CUSTOMERS, DEMO_SALE_WAREHOUSES,
  calculateLineProfitability,
} from '../../services/salesData';
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
  unit_price: string;
  discount_type: DiscountType;
  discount_value: string;
  unit_cost: number;
  available_stock: number;
}

export default function SalesCreate() {
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { addInvoice, getNextInvoiceNumber, policy } = useSales();

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNameAr, setCustomerNameAr] = useState('');
  const [warehouseId, setWarehouseId] = useState(DEMO_SALE_WAREHOUSES[0]?.id ?? '');
  const [channel, setChannel] = useState<SalesChannel>('manual');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [invoiceDiscountType, setInvoiceDiscountType] = useState<DiscountType>('percentage');
  const [invoiceDiscountValue, setInvoiceDiscountValue] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  // Modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const selectedWarehouse = DEMO_SALE_WAREHOUSES.find(w => w.id === warehouseId);
  const paymentCfg = PAYMENT_METHOD_CONFIG[paymentMethod];

  // ── COMPUTED TOTALS ────────────────────────────────────────────
  const computedLines = useMemo(() => {
    return items.map(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discVal = parseFloat(item.discount_value) || 0;
      const lineSubtotal = qty * price;
      const discAmount = item.discount_type === 'percentage'
        ? lineSubtotal * (discVal / 100)
        : discVal;
      const lineAfterDisc = lineSubtotal - discAmount;
      const totalCost = qty * item.unit_cost;
      const pf = calculateLineProfitability(qty, price, discAmount, item.unit_cost, paymentCfg.hasFee ? paymentCfg.defaultFeeRate : 0, 0);
      return {
        ...item,
        qty, price, discAmount,
        lineSubtotal: lineAfterDisc,
        totalCost,
        ...pf,
      };
    });
  }, [items, paymentCfg]);

  const totals = useMemo(() => {
    const subtotal = computedLines.reduce((s, l) => s + l.lineSubtotal, 0);
    const invDiscVal = parseFloat(invoiceDiscountValue) || 0;
    const invDiscAmt = invoiceDiscountType === 'percentage'
      ? subtotal * (invDiscVal / 100)
      : invDiscVal;
    const taxableAmount = subtotal - invDiscAmt;
    const total = taxableAmount;
    const totalCogs = computedLines.reduce((s, l) => s + l.totalCost, 0);
    const payFee = paymentCfg.hasFee ? total * paymentCfg.defaultFeeRate : 0;
    const grossProfit = taxableAmount - totalCogs;
    const grossMargin = taxableAmount > 0 ? (grossProfit / taxableAmount) * 100 : 0;
    const commercialProfit = grossProfit - payFee;
    const commercialMargin = taxableAmount > 0 ? (commercialProfit / taxableAmount) * 100 : 0;
    return { subtotal, invDiscAmt, total, totalCogs, payFee, grossProfit, grossMargin, commercialProfit, commercialMargin };
  }, [computedLines, invoiceDiscountValue, invoiceDiscountType, paymentCfg]);

  // ── ADD PRODUCT TO INVOICE ─────────────────────────────────────
  const addProduct = useCallback((prod: typeof DEMO_SALE_PRODUCTS[0]) => {
    const whStock = prod.warehouse_stock[warehouseId] ?? 0;
    if (whStock === 0 && prod.track_inventory && !policy.allow_negative_stock) {
      showAlert(
        language === 'ar' ? 'مخزون غير كافٍ' : 'Insufficient Stock',
        language === 'ar'
          ? `لا يوجد مخزون كافٍ من "${language === 'ar' ? prod.name_ar : prod.name}" في المستودع المحدد.`
          : `No stock available for "${prod.name}" in the selected warehouse.`,
        [
          { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
          {
            text: language === 'ar' ? 'إضافة على أي حال' : 'Add Anyway',
            onPress: () => doAddProduct(prod, whStock),
          },
        ]
      );
      return;
    }
    doAddProduct(prod, whStock);
    setShowProductModal(false);
  }, [warehouseId, policy, language]);

  const doAddProduct = (prod: typeof DEMO_SALE_PRODUCTS[0], stock: number) => {
    const newItem: DraftItem = {
      id: `draft-${Date.now()}-${Math.random()}`,
      product_id: prod.id,
      product_name: prod.name,
      product_name_ar: prod.name_ar ?? prod.name,
      product_code: prod.sku,
      unit_symbol: prod.unit_symbol,
      unit_id: prod.unit_id,
      quantity: '1',
      unit_price: prod.sale_price.toFixed(3),
      discount_type: 'percentage',
      discount_value: '0',
      unit_cost: prod.cost_price,
      available_stock: stock,
    };
    setItems(prev => [...prev, newItem]);
    setShowProductModal(false);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof DraftItem, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ── SUBMIT ────────────────────────────────────────────────────
  const handleSubmit = (asDraft: boolean) => {
    if (!customerName.trim()) {
      showAlert(language === 'ar' ? 'مطلوب' : 'Required', language === 'ar' ? 'يرجى تحديد العميل' : 'Please select or enter a customer name');
      return;
    }
    if (items.length === 0) {
      showAlert(language === 'ar' ? 'مطلوب' : 'Required', language === 'ar' ? 'أضف منتجًا على الأقل' : 'Add at least one product');
      return;
    }
    // Negative margin check
    if (!asDraft && totals.grossMargin < 0) {
      if (policy.negative_margin_action === 'block') {
        showAlert(language === 'ar' ? 'هامش سالب' : 'Negative Margin', language === 'ar' ? 'لا يمكن اعتماد فاتورة بهامش ربح سالب.' : 'Cannot approve an invoice with a negative margin.');
        return;
      }
    }
    const invNumber = getNextInvoiceNumber();
    const now = new Date().toISOString();
    const fullItems: SaleInvoiceItemFull[] = computedLines.map((cl, idx) => ({
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
      unit_price: cl.price,
      line_discount_type: cl.discount_type,
      line_discount_value: parseFloat(cl.discount_value) || 0,
      line_discount_amount: cl.discAmount,
      line_subtotal: cl.lineSubtotal,
      tax_rate: 0,
      tax_amount: 0,
      line_total: cl.lineSubtotal,
      unit_cost: cl.unit_cost,
      total_cost: cl.totalCost,
      gross_profit: cl.gross_profit,
      gross_margin_percent: cl.gross_margin_percent,
      allocated_payment_fee: cl.lineSubtotal * (paymentCfg.hasFee ? paymentCfg.defaultFeeRate : 0),
      allocated_delivery_cost: 0,
      allocated_marketing_cost: 0,
      allocated_other_costs: 0,
      total_commercial_costs: cl.lineSubtotal * (paymentCfg.hasFee ? paymentCfg.defaultFeeRate : 0),
      commercial_profit: cl.commercial_profit,
      commercial_margin_percent: cl.commercial_margin_percent,
      is_below_target_margin: cl.is_below_target,
      is_negative_margin: cl.is_negative,
      warehouse_id: warehouseId,
      available_stock: cl.available_stock,
      stock_sufficient: cl.available_stock >= cl.qty,
    }));
    const invoice: SaleInvoiceFull = {
      id: `inv-${Date.now()}`,
      company_id: 'company-001',
      branch_id: 'branch-001',
      invoice_number: invNumber,
      customer_id: customerId || undefined,
      customer_name: customerName,
      customer_name_ar: customerNameAr || undefined,
      date,
      channel,
      warehouse_id: warehouseId,
      warehouse_name: selectedWarehouse?.name,
      items: fullItems,
      subtotal: totals.subtotal,
      invoice_discount_type: invoiceDiscountType,
      invoice_discount_value: parseFloat(invoiceDiscountValue) || 0,
      invoice_discount_amount: totals.invDiscAmt,
      tax_amount: 0,
      total: totals.total,
      paid_amount: 0,
      outstanding: totals.total,
      payments: [],
      payment_method: paymentMethod,
      payment_fee: totals.payFee,
      payment_fee_rate: paymentCfg.defaultFeeRate,
      status: asDraft ? 'draft' : 'approved',
      profitability: {
        invoice_id: 'new',
        revenue: totals.total,
        accounting_cogs: totals.totalCogs,
        gross_profit: totals.grossProfit,
        gross_margin_percent: totals.grossMargin,
        payment_fee: totals.payFee,
        delivery_cost: 0,
        marketing_cost_allocation: 0,
        other_costs: 0,
        total_commercial_costs: totals.payFee,
        commercial_profit: totals.commercialProfit,
        commercial_margin_percent: totals.commercialMargin,
        line_profitability: [],
      },
      accounting_status: asDraft ? 'pending' : 'posted',
      notes: notes || undefined,
      created_by: 'user-004',
      created_at: now,
      updated_at: now,
    };
    addInvoice(invoice);
    showAlert(
      language === 'ar' ? (asDraft ? 'تم الحفظ' : 'تم الاعتماد') : (asDraft ? 'Saved as Draft' : 'Invoice Approved'),
      language === 'ar'
        ? `تم ${asDraft ? 'حفظ' : 'اعتماد'} الفاتورة ${invNumber} بنجاح`
        : `Invoice ${invNumber} has been ${asDraft ? 'saved as draft' : 'approved'} successfully`,
      [{ text: language === 'ar' ? 'حسناً' : 'OK', onPress: () => router.back() }]
    );
  };

  const fmt3 = (n: number) => n.toFixed(3);
  const marginColor = (m: number) => m < 0 ? Colors.danger : m < policy.target_gross_margin * 100 ? Colors.warning : Colors.success;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {language === 'ar' ? 'فاتورة مبيعات جديدة' : 'New Sales Invoice'}
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
            <MaterialIcons name="tag" size={16} color={Colors.primary} />
            <Text style={styles.invNum}>{getNextInvoiceNumber()}</Text>
            <View style={styles.invDate}>
              <Text style={styles.invDateText}>{date}</Text>
            </View>
          </View>

          {/* Customer */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'العميل' : 'Customer'}
            </Text>
            <Pressable style={[styles.selectorBtn, isRTL && styles.selectorBtnRTL]}
              onPress={() => setShowCustomerModal(true)}>
              <View style={[styles.selectorLeft, isRTL && styles.selectorLeftRTL]}>
                <MaterialIcons name="person" size={20} color={customerId ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.selectorText, !customerName && { color: Colors.textMuted }, isRTL && styles.textRTL]} numberOfLines={1}>
                  {customerName || (language === 'ar' ? 'اختر العميل...' : 'Select customer...')}
                </Text>
              </View>
              <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Invoice Details Row */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
            </Text>
            <View style={styles.detailsGrid}>
              {/* Channel */}
              <Pressable style={[styles.detailItem, isRTL && styles.detailItemRTL]}
                onPress={() => setShowChannelModal(true)}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'القناة' : 'Channel'}</Text>
                <View style={[styles.detailValue, isRTL && styles.detailValueRTL]}>
                  <MaterialIcons name={SALES_CHANNEL_CONFIG[channel].icon as any} size={14} color={SALES_CHANNEL_CONFIG[channel].color} />
                  <Text style={styles.detailValueText} numberOfLines={1}>
                    {language === 'ar' ? SALES_CHANNEL_CONFIG[channel].labelAr : SALES_CHANNEL_CONFIG[channel].labelEn}
                  </Text>
                </View>
              </Pressable>
              {/* Warehouse */}
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'المستودع' : 'Warehouse'}</Text>
                <Text style={styles.detailValueText} numberOfLines={1}>
                  {language === 'ar' ? (selectedWarehouse?.name_ar ?? selectedWarehouse?.name) : selectedWarehouse?.name}
                </Text>
              </View>
              {/* Payment */}
              <Pressable style={[styles.detailItem, isRTL && styles.detailItemRTL]}
                onPress={() => setShowPaymentModal(true)}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'طريقة الدفع' : 'Payment'}</Text>
                <View style={[styles.detailValue, isRTL && styles.detailValueRTL]}>
                  <MaterialIcons name={paymentCfg.icon as any} size={14} color={paymentCfg.color} />
                  <Text style={styles.detailValueText} numberOfLines={1}>
                    {language === 'ar' ? PAYMENT_METHOD_CONFIG[paymentMethod].labelAr : PAYMENT_METHOD_CONFIG[paymentMethod].labelEn}
                  </Text>
                </View>
              </Pressable>
              {/* Date */}
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Text style={styles.detailLabel}>{language === 'ar' ? 'التاريخ' : 'Date'}</Text>
                <TextInput
                  style={styles.detailInput}
                  value={date}
                  onChangeText={setDate}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? `المنتجات (${items.length})` : `Items (${items.length})`}
              </Text>
              <Pressable style={styles.addItemBtn} onPress={() => setShowProductModal(true)}>
                <MaterialIcons name="add" size={16} color={Colors.primary} />
                <Text style={styles.addItemBtnText}>{language === 'ar' ? 'إضافة منتج' : 'Add Product'}</Text>
              </Pressable>
            </View>

            {items.length === 0 ? (
              <Pressable style={styles.emptyItems} onPress={() => setShowProductModal(true)}>
                <MaterialIcons name="add-shopping-cart" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyItemsText}>{language === 'ar' ? 'اضغط لإضافة منتجات' : 'Tap to add products'}</Text>
              </Pressable>
            ) : null}

            {computedLines.map((item, idx) => (
              <View key={item.id} style={styles.itemCard}>
                {/* Item header */}
                <View style={[styles.itemHeader, isRTL && styles.itemHeaderRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isRTL && styles.textRTL]} numberOfLines={1}>
                      {language === 'ar' ? item.product_name_ar : item.product_name}
                    </Text>
                    <View style={[styles.itemMeta, isRTL && styles.itemMetaRTL]}>
                      <Text style={styles.itemCode}>{item.product_code}</Text>
                      <View style={[styles.stockBadge, { backgroundColor: item.available_stock > 10 ? Colors.successLight : item.available_stock > 0 ? Colors.warningLight : Colors.dangerLight }]}>
                        <Text style={[styles.stockText, { color: item.available_stock > 10 ? Colors.success : item.available_stock > 0 ? Colors.warning : Colors.danger }]}>
                          {language === 'ar' ? `مخزون: ${item.available_stock}` : `Stock: ${item.available_stock}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8} style={styles.removeBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
                  </Pressable>
                </View>
                {/* Qty / Price / Discount */}
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
                    <Text style={styles.fieldLabel}>{language === 'ar' ? 'السعر' : 'Price'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={item.unit_price}
                      onChangeText={v => updateItem(item.id, 'unit_price', v)}
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
                    <Text style={styles.fieldLabel}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                    <Text style={styles.fieldTotal}>{fmt3(item.lineSubtotal)}</Text>
                  </View>
                </View>
                {/* Profitability row */}
                <View style={[styles.profitRow, isRTL && styles.profitRowRTL]}>
                  <View style={[styles.profitItem, isRTL && styles.profitItemRTL]}>
                    <Text style={styles.profitItemLabel}>{language === 'ar' ? 'التكلفة' : 'Cost'}</Text>
                    <Text style={styles.profitItemValue}>{fmt3(item.totalCost)}</Text>
                  </View>
                  <View style={[styles.profitItem, isRTL && styles.profitItemRTL]}>
                    <Text style={styles.profitItemLabel}>{language === 'ar' ? 'الربح الإجمالي' : 'Gross Profit'}</Text>
                    <Text style={[styles.profitItemValue, { color: item.gross_profit >= 0 ? Colors.success : Colors.danger }]}>
                      {fmt3(item.gross_profit)}
                    </Text>
                  </View>
                  <View style={[styles.marginChip, { backgroundColor: `${marginColor(item.gross_margin_percent)}15` }]}>
                    <Text style={[styles.marginChipText, { color: marginColor(item.gross_margin_percent) }]}>
                      {item.gross_margin_percent.toFixed(1)}%
                    </Text>
                  </View>
                  {item.is_below_target ? (
                    <View style={styles.warnChip}>
                      <MaterialIcons name="warning" size={11} color={Colors.warning} />
                      <Text style={styles.warnChipText}>{language === 'ar' ? 'أقل من الهدف' : 'Below target'}</Text>
                    </View>
                  ) : null}
                  {item.is_negative ? (
                    <View style={[styles.warnChip, { backgroundColor: Colors.dangerLight }]}>
                      <MaterialIcons name="error" size={11} color={Colors.danger} />
                      <Text style={[styles.warnChipText, { color: Colors.danger }]}>{language === 'ar' ? 'هامش سالب' : 'Neg. margin'}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {/* Invoice Discount */}
          {items.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'خصم الفاتورة' : 'Invoice Discount'}
              </Text>
              <View style={[styles.discRow, isRTL && styles.discRowRTL]}>
                <View style={styles.discTypeToggle}>
                  {(['percentage', 'fixed'] as DiscountType[]).map(dt => (
                    <Pressable key={dt} onPress={() => setInvoiceDiscountType(dt)}
                      style={[styles.discTypeBtn, invoiceDiscountType === dt && styles.discTypeBtnActive]}>
                      <Text style={[styles.discTypeBtnText, invoiceDiscountType === dt && styles.discTypeBtnTextActive]}>
                        {dt === 'percentage' ? '%' : 'KWD'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={[styles.discInput, isRTL && { textAlign: 'right' }]}
                  value={invoiceDiscountValue}
                  onChangeText={setInvoiceDiscountValue}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          ) : null}

          {/* Totals Summary */}
          {items.length > 0 ? (
            <View style={styles.totalsCard}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'ملخص الفاتورة' : 'Invoice Summary'}
              </Text>
              {[
                { labelAr: 'المجموع الفرعي', labelEn: 'Subtotal', value: totals.subtotal, highlight: false },
                { labelAr: 'الخصم', labelEn: 'Discount', value: -totals.invDiscAmt, highlight: false },
                { labelAr: 'الإجمالي', labelEn: 'Total', value: totals.total, highlight: true },
              ].map((row, i) => row.value !== 0 || row.highlight ? (
                <View key={i} style={[styles.totalsRow, isRTL && styles.totalsRowRTL, row.highlight && styles.totalsRowHighlight]}>
                  <Text style={[styles.totalsLabel, isRTL && styles.textRTL, row.highlight && styles.totalsLabelHL]}>
                    {language === 'ar' ? row.labelAr : row.labelEn}
                  </Text>
                  <Text style={[styles.totalsValue, isRTL && styles.textRTL, row.highlight && styles.totalsValueHL, row.value < 0 && { color: Colors.danger }]}>
                    {row.value >= 0 ? fmt3(row.value) : `-${fmt3(Math.abs(row.value))}`}
                    {' '}{language === 'ar' ? 'د.ك' : 'KWD'}
                  </Text>
                </View>
              ) : null)}
              {/* Profitability Summary */}
              <View style={[styles.profitSummary, isRTL && styles.profitSummaryRTL]}>
                <View style={styles.profitSummaryItem}>
                  <Text style={styles.profitSummaryLabel}>{language === 'ar' ? 'الربح الإجمالي' : 'Gross Profit'}</Text>
                  <Text style={[styles.profitSummaryValue, { color: marginColor(totals.grossMargin) }]}>
                    {fmt3(totals.grossProfit)} ({totals.grossMargin.toFixed(1)}%)
                  </Text>
                </View>
                {paymentCfg.hasFee ? (
                  <View style={styles.profitSummaryItem}>
                    <Text style={styles.profitSummaryLabel}>{language === 'ar' ? 'رسوم الدفع' : 'Payment Fee'}</Text>
                    <Text style={[styles.profitSummaryValue, { color: Colors.danger }]}>
                      -{fmt3(totals.payFee)}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.profitSummaryItem, { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 8 }]}>
                  <Text style={styles.profitSummaryLabel}>{language === 'ar' ? 'الربح التجاري' : 'Commercial Profit'}</Text>
                  <Text style={[styles.profitSummaryValue, { color: marginColor(totals.commercialMargin), fontWeight: Typography.fontWeightBold }]}>
                    {fmt3(totals.commercialProfit)} ({totals.commercialMargin.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Text>
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

          {/* Submit Buttons */}
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

      {/* ── CUSTOMER MODAL ────────────────────────────────────────── */}
      <Modal visible={showCustomerModal} transparent animationType="slide" onRequestClose={() => setShowCustomerModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCustomerModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'اختر العميل' : 'Select Customer'}</Text>
          <FlatList
            data={DEMO_SALE_CUSTOMERS}
            keyExtractor={c => c.id!}
            renderItem={({ item }) => (
              <Pressable style={[styles.listItem, isRTL && styles.listItemRTL]}
                onPress={() => {
                  setCustomerId(item.id!);
                  setCustomerName(item.name!);
                  setCustomerNameAr(item.name_ar ?? '');
                  setShowCustomerModal(false);
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, isRTL && styles.textRTL]}>
                    {language === 'ar' ? (item.name_ar ?? item.name!) : item.name!}
                  </Text>
                  <Text style={styles.listItemSub}>{item.code} · {item.phone}</Text>
                </View>
                <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  <Text style={[styles.listItemBal, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'الرصيد:' : 'Bal:'} {(item.balance ?? 0).toFixed(3)} {language === 'ar' ? 'د.ك' : 'KWD'}
                  </Text>
                </View>
              </Pressable>
            )}
            style={{ maxHeight: 350 }}
          />
          {/* Walk-in option */}
          <Pressable style={[styles.listItem, isRTL && styles.listItemRTL]}
            onPress={() => {
              setCustomerId('');
              setCustomerName(language === 'ar' ? 'عميل نقدي' : 'Walk-in Customer');
              setCustomerNameAr('عميل نقدي');
              setShowCustomerModal(false);
            }}>
            <MaterialIcons name="person-outline" size={20} color={Colors.textMuted} />
            <Text style={[styles.listItemTitle, { color: Colors.textMuted }, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'عميل نقدي (بدون تسجيل)' : 'Walk-in Customer (no account)'}
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── PRODUCT MODAL ─────────────────────────────────────────── */}
      <Modal visible={showProductModal} transparent animationType="slide" onRequestClose={() => setShowProductModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowProductModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'اختر منتجًا' : 'Select Product'}</Text>
          <FlatList
            data={DEMO_SALE_PRODUCTS}
            keyExtractor={p => p.id}
            renderItem={({ item }) => {
              const whStock = item.warehouse_stock[warehouseId] ?? 0;
              const isOutOfStock = whStock === 0 && item.track_inventory;
              return (
                <Pressable style={[styles.listItem, isRTL && styles.listItemRTL]}
                  onPress={() => addProduct(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listItemTitle, isRTL && styles.textRTL, isOutOfStock && { color: Colors.textMuted }]}>
                      {language === 'ar' ? (item.name_ar ?? item.name) : item.name}
                    </Text>
                    <Text style={styles.listItemSub}>{item.sku}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[styles.listItemPrice, isRTL && styles.textRTL]}>
                      {item.sale_price.toFixed(3)} {language === 'ar' ? 'د.ك' : 'KWD'}
                    </Text>
                    <View style={[styles.stockBadge, { backgroundColor: whStock > 10 ? Colors.successLight : whStock > 0 ? Colors.warningLight : Colors.dangerLight }]}>
                      <Text style={[styles.stockText, { color: whStock > 10 ? Colors.success : whStock > 0 ? Colors.warning : Colors.danger }]}>
                        {isOutOfStock ? (language === 'ar' ? 'نفد' : 'Out') : `${whStock} ${item.unit_symbol}`}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            style={{ maxHeight: 400 }}
          />
        </View>
      </Modal>

      {/* ── CHANNEL MODAL ─────────────────────────────────────────── */}
      <Modal visible={showChannelModal} transparent animationType="slide" onRequestClose={() => setShowChannelModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowChannelModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'قناة البيع' : 'Sales Channel'}</Text>
          {(Object.entries(SALES_CHANNEL_CONFIG) as [SalesChannel, typeof SALES_CHANNEL_CONFIG[SalesChannel]][]).map(([key, cfg]) => (
            <Pressable key={key} style={[styles.listItem, isRTL && styles.listItemRTL, channel === key && styles.listItemSelected]}
              onPress={() => { setChannel(key); setShowChannelModal(false); }}>
              <MaterialIcons name={cfg.icon as any} size={20} color={cfg.color} />
              <Text style={[styles.listItemTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? cfg.labelAr : cfg.labelEn}
              </Text>
              {channel === key ? <MaterialIcons name="check" size={18} color={Colors.primary} style={{ marginStart: 'auto' }} /> : null}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* ── PAYMENT METHOD MODAL ──────────────────────────────────── */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)} />
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
          <Text style={[styles.sheetTitle, isRTL && styles.textRTL]}>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</Text>
          {(Object.entries(PAYMENT_METHOD_CONFIG) as [PaymentMethod, typeof PAYMENT_METHOD_CONFIG[PaymentMethod]][]).map(([key, cfg]) => (
            <Pressable key={key} style={[styles.listItem, isRTL && styles.listItemRTL, paymentMethod === key && styles.listItemSelected]}
              onPress={() => { setPaymentMethod(key); setShowPaymentModal(false); }}>
              <MaterialIcons name={cfg.icon as any} size={20} color={cfg.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.listItemTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                </Text>
                {cfg.hasFee ? (
                  <Text style={styles.listItemSub}>
                    {language === 'ar' ? `رسوم: ${(cfg.defaultFeeRate * 100).toFixed(1)}%` : `Fee: ${(cfg.defaultFeeRate * 100).toFixed(1)}%`}
                  </Text>
                ) : null}
              </View>
              {paymentMethod === key ? <MaterialIcons name="check" size={18} color={Colors.primary} /> : null}
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
  approveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.primary },
  approveBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  content: { padding: Spacing.base, gap: Spacing.base },
  // Invoice number
  invNumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md },
  invNumRowRTL: { flexDirection: 'row-reverse' },
  invNum: { flex: 1, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  invDate: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.surface, borderRadius: Radius.full },
  invDateText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontFamily: 'monospace', includeFontPadding: false },
  // Sections
  section: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  // Customer selector
  selectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  selectorBtnRTL: { flexDirection: 'row-reverse' },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  selectorLeftRTL: { flexDirection: 'row-reverse' },
  selectorText: { flex: 1, fontSize: Typography.fontSizeBase, color: Colors.text, includeFontPadding: false },
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
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  addItemBtnText: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
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
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  stockText: { fontSize: 10, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Item fields
  itemFields: { flexDirection: 'row', gap: Spacing.sm },
  itemField: { flex: 1, alignItems: 'center' },
  itemFieldTotal: { flex: 1.3 },
  fieldLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 4, includeFontPadding: false },
  fieldInput: { width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 8, fontSize: Typography.fontSizeSM, color: Colors.text, borderWidth: 1, borderColor: Colors.border, textAlign: 'center', includeFontPadding: false },
  fieldTotal: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  // Item profitability
  profitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  profitRowRTL: { flexDirection: 'row-reverse' },
  profitItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profitItemRTL: { flexDirection: 'row-reverse' },
  profitItemLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  profitItemValue: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  marginChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  marginChipText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  warnChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.warningLight },
  warnChipText: { fontSize: 10, color: Colors.warning, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Invoice discount
  discRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  discRowRTL: { flexDirection: 'row-reverse' },
  discTypeToggle: { flexDirection: 'row', borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden' },
  discTypeBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.background },
  discTypeBtnActive: { backgroundColor: Colors.primary },
  discTypeBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  discTypeBtnTextActive: { color: Colors.textInverse },
  discInput: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, borderWidth: 1.5, borderColor: Colors.border, includeFontPadding: false },
  // Totals
  totalsCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  totalsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  totalsRowRTL: { flexDirection: 'row-reverse' },
  totalsRowHighlight: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4 },
  totalsLabel: { fontSize: Typography.fontSizeBase, color: Colors.textSecondary, includeFontPadding: false },
  totalsLabelHL: { color: Colors.text, fontWeight: Typography.fontWeightBold, fontSize: Typography.fontSizeLG },
  totalsValue: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  totalsValueHL: { color: Colors.primary, fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold },
  profitSummary: { marginTop: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.lg, padding: Spacing.md },
  profitSummaryRTL: {},
  profitSummaryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profitSummaryLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  profitSummaryValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Notes
  notesInput: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.fontSizeBase, color: Colors.text, borderWidth: 1.5, borderColor: Colors.border, minHeight: 80, includeFontPadding: false },
  // Submit
  submitRow: { flexDirection: 'row', gap: Spacing.sm },
  submitRowRTL: { flexDirection: 'row-reverse' },
  draftSubmitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  draftSubmitBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, color: Colors.textSecondary, includeFontPadding: false },
  approveSubmitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.lg, backgroundColor: Colors.primary, ...Shadow.md },
  approveSubmitBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textInverse, includeFontPadding: false },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '70%', ...Shadow.lg },
  sheetTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border, includeFontPadding: false },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  listItemRTL: { flexDirection: 'row-reverse' },
  listItemSelected: { backgroundColor: Colors.primaryLight },
  listItemTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  listItemSub: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  listItemBal: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  listItemPrice: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
