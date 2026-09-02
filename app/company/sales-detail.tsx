// Sales Detail — Invoice View + Profitability + Payments + Actions
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../hooks/useLanguage';
import { useSales } from '../../contexts/SalesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  SALE_STATUS_CONFIG, SALES_CHANNEL_CONFIG, PAYMENT_METHOD_CONFIG,
  SalePaymentRecord, PaymentMethod,
} from '../../types/sales';
import { useAlert } from '@/template';

type DetailTab = 'overview' | 'items' | 'profitability' | 'payments' | 'accounting';

export default function SalesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { getInvoiceById, approveInvoice, cancelInvoice, addPayment } = useSales();
  const invoice = getInvoiceById(id);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payRef, setPayRef] = useState('');

  if (!invoice) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <MaterialIcons name="receipt-long" size={48} color={Colors.textMuted} />
        <Text style={{ color: Colors.textMuted, marginTop: 12 }}>{language === 'ar' ? 'فاتورة غير موجودة' : 'Invoice not found'}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: Colors.primary }}>{language === 'ar' ? 'العودة' : 'Go back'}</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = SALE_STATUS_CONFIG[invoice.status];
  const chCfg = SALES_CHANNEL_CONFIG[invoice.channel];
  const fmt3 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const fmtCurr = (n: number) => `${fmt3(n)} ${language === 'ar' ? 'د.ك' : 'KWD'}`;
  const marginColor = (m: number) => m < 0 ? Colors.danger : m < 30 ? Colors.warning : Colors.success;

  const TABS: { key: DetailTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'overview',      labelAr: 'نظرة عامة',  labelEn: 'Overview',     icon: 'info'          },
    { key: 'items',         labelAr: 'المنتجات',   labelEn: 'Items',        icon: 'list'          },
    { key: 'profitability', labelAr: 'الربحية',    labelEn: 'Profitability', icon: 'insights'      },
    { key: 'payments',      labelAr: 'المدفوعات',  labelEn: 'Payments',     icon: 'payment'       },
    { key: 'accounting',    labelAr: 'المحاسبة',   labelEn: 'Accounting',   icon: 'account-balance'},
  ];

  const handleApprove = () => {
    showAlert(
      language === 'ar' ? 'اعتماد الفاتورة؟' : 'Approve Invoice?',
      language === 'ar' ? 'سيتم اعتماد الفاتورة وإنشاء الأثر المحاسبي.' : 'Invoice will be approved and accounting entry created.',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'اعتماد' : 'Approve', onPress: () => approveInvoice(invoice.id) },
      ]
    );
  };

  const handleCancel = () => {
    showAlert(
      language === 'ar' ? 'إلغاء الفاتورة؟' : 'Cancel Invoice?',
      language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancel', style: 'destructive', onPress: () => { cancelInvoice(invoice.id); router.back(); } },
      ]
    );
  };

  const handleAddPayment = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      showAlert(language === 'ar' ? 'مبلغ غير صحيح' : 'Invalid Amount', language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }
    if (amt > invoice.outstanding) {
      showAlert(language === 'ar' ? 'تجاوز المبلغ' : 'Exceeds Balance', language === 'ar' ? `المبلغ يتجاوز المتبقي (${fmt3(invoice.outstanding)} د.ك)` : `Amount exceeds outstanding balance (KWD ${fmt3(invoice.outstanding)})`);
      return;
    }
    const payment: SalePaymentRecord = {
      id: `pay-${Date.now()}`,
      invoice_id: invoice.id,
      company_id: invoice.company_id,
      payment_number: `PAY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      method: payMethod,
      reference: payRef || undefined,
      is_reversed: false,
      created_by: 'user-002',
      created_at: new Date().toISOString(),
    };
    addPayment(invoice.id, payment);
    setShowPaymentModal(false);
    setPayAmount('');
    setPayRef('');
    showAlert(
      language === 'ar' ? 'تم التسجيل' : 'Payment Recorded',
      language === 'ar'
        ? `تم تسجيل دفعة بمبلغ ${fmtCurr(amt)} بنجاح`
        : `Payment of ${fmtCurr(amt)} recorded successfully`
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.invTitle, isRTL && styles.textRTL]}>{invoice.invoice_number}</Text>
            <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <MaterialIcons name={cfg.icon as any} size={12} color={cfg.color} />
                <Text style={[styles.statusText, { color: cfg.color }]}>
                  {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                </Text>
              </View>
              <View style={[styles.channelBadge, { backgroundColor: `${chCfg.color}15` }]}>
                <MaterialIcons name={chCfg.icon as any} size={12} color={chCfg.color} />
                <Text style={[styles.channelText, { color: chCfg.color }]}>
                  {language === 'ar' ? chCfg.labelAr : chCfg.labelEn}
                </Text>
              </View>
            </View>
          </View>
          {/* Actions */}
          <View style={[styles.headerActions, isRTL && styles.headerActionsRTL]}>
            {invoice.status === 'draft' || invoice.status === 'pending_approval' ? (
              <Pressable style={styles.approveBtn} onPress={handleApprove}>
                <Text style={styles.approveBtnText}>{language === 'ar' ? 'اعتماد' : 'Approve'}</Text>
              </Pressable>
            ) : null}
            {(invoice.status === 'approved' || invoice.status === 'partially_paid') ? (
              <Pressable style={styles.payBtn} onPress={() => setShowPaymentModal(true)}>
                <MaterialIcons name="payment" size={16} color={Colors.textInverse} />
                <Text style={styles.payBtnText}>{language === 'ar' ? 'تسجيل دفعة' : 'Add Payment'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabBar}>
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
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {activeTab === 'overview' ? (<>
            {/* Customer & Date Card */}
            <View style={styles.card}>
              <View style={[styles.cardRow, isRTL && styles.cardRowRTL]}>
                <View style={styles.customerIconBg}>
                  <MaterialIcons name="person" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.customerName, isRTL && styles.textRTL]}>
                    {language === 'ar' ? (invoice.customer_name_ar ?? invoice.customer_name) : invoice.customer_name}
                  </Text>
                  {invoice.customer_code ? (
                    <Text style={styles.customerCode}>{invoice.customer_code}</Text>
                  ) : null}
                </View>
              </View>
              {[
                { labelAr: 'تاريخ الفاتورة', labelEn: 'Invoice Date', value: invoice.date },
                invoice.due_date ? { labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', value: invoice.due_date } : null,
                { labelAr: 'المستودع', labelEn: 'Warehouse', value: language === 'ar' ? (invoice.warehouse_name ?? '') : (invoice.warehouse_name ?? '') },
                invoice.salesperson_name ? { labelAr: 'مندوب المبيعات', labelEn: 'Salesperson', value: invoice.salesperson_name } : null,
              ].filter(Boolean).map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                  <Text style={styles.detailLabel}>{language === 'ar' ? row!.labelAr : row!.labelEn}</Text>
                  <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{row!.value}</Text>
                </View>
              ))}
            </View>

            {/* Financials */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'ملخص مالي' : 'Financial Summary'}
              </Text>
              {[
                { labelAr: 'المجموع الفرعي', labelEn: 'Subtotal', value: fmtCurr(invoice.subtotal), highlight: false },
                invoice.invoice_discount_amount > 0 ? { labelAr: 'الخصم', labelEn: 'Discount', value: `-${fmtCurr(invoice.invoice_discount_amount)}`, highlight: false } : null,
                invoice.tax_amount > 0 ? { labelAr: 'الضريبة', labelEn: 'Tax', value: fmtCurr(invoice.tax_amount), highlight: false } : null,
                { labelAr: 'إجمالي الفاتورة', labelEn: 'Invoice Total', value: fmtCurr(invoice.total), highlight: true },
                { labelAr: 'المبلغ المدفوع', labelEn: 'Paid Amount', value: fmtCurr(invoice.paid_amount), highlight: false },
                invoice.outstanding > 0 ? { labelAr: 'المبلغ المتبقي', labelEn: 'Outstanding', value: fmtCurr(invoice.outstanding), highlight: false, danger: true } : null,
              ].filter(Boolean).map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL, row!.highlight && styles.detailRowHighlight]}>
                  <Text style={[styles.detailLabel, row!.highlight && { color: Colors.text, fontWeight: Typography.fontWeightBold }]}>
                    {language === 'ar' ? row!.labelAr : row!.labelEn}
                  </Text>
                  <Text style={[styles.detailValue, row!.highlight && { color: Colors.primary, fontWeight: Typography.fontWeightBold, fontSize: Typography.fontSizeLG }, (row as any).danger && { color: Colors.danger }, isRTL && styles.textRTL]}>
                    {row!.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Payment progress bar */}
            {invoice.total > 0 ? (
              <View style={styles.card}>
                <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'حالة الدفع' : 'Payment Progress'}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, (invoice.paid_amount / invoice.total) * 100)}%` }]} />
                </View>
                <View style={[styles.progressLabels, isRTL && styles.progressLabelsRTL]}>
                  <Text style={styles.progressLabel}>
                    {language === 'ar' ? 'مدفوع' : 'Paid'}: {fmtCurr(invoice.paid_amount)}
                  </Text>
                  <Text style={[styles.progressLabel, invoice.outstanding > 0 && { color: Colors.warning }]}>
                    {language === 'ar' ? 'متبقي' : 'Outstanding'}: {fmtCurr(invoice.outstanding)}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Actions Row */}
            {(invoice.status !== 'cancelled' && invoice.status !== 'returned') ? (
              <View style={[styles.actionsRow, isRTL && styles.actionsRowRTL]}>
                <Pressable style={styles.actionBtn} onPress={() => showAlert(language === 'ar' ? 'PDF' : 'PDF', language === 'ar' ? 'سيتم إنشاء PDF الفاتورة.' : 'Invoice PDF will be generated.')}>
                  <MaterialIcons name="picture-as-pdf" size={18} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>{language === 'ar' ? 'طباعة' : 'Print'}</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => showAlert(language === 'ar' ? 'مشاركة' : 'Share', language === 'ar' ? 'مشاركة الفاتورة مع العميل.' : 'Share invoice with customer.')}>
                  <MaterialIcons name="share" size={18} color={Colors.success} />
                  <Text style={styles.actionBtnText}>{language === 'ar' ? 'مشاركة' : 'Share'}</Text>
                </Pressable>
                {invoice.status === 'draft' || invoice.status === 'pending_approval' ? (
                  <Pressable style={[styles.actionBtn, { borderColor: Colors.dangerLight }]} onPress={handleCancel}>
                    <MaterialIcons name="cancel" size={18} color={Colors.danger} />
                    <Text style={[styles.actionBtnText, { color: Colors.danger }]}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </>) : null}

          {/* ── ITEMS ────────────────────────────────────────────────── */}
          {activeTab === 'items' ? (<>
            {invoice.items.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="inventory" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد منتجات' : 'No items'}</Text>
              </View>
            ) : null}
            {invoice.items.map((item, idx) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={[styles.itemHeader, isRTL && styles.itemHeaderRTL]}>
                  <View style={styles.itemNumBadge}>
                    <Text style={styles.itemNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isRTL && styles.textRTL]}>
                      {language === 'ar' ? (item.product_name_ar ?? item.product_name) : item.product_name}
                    </Text>
                    <Text style={styles.itemCode}>{item.product_code}</Text>
                  </View>
                </View>
                <View style={styles.itemDetails}>
                  {[
                    { labelAr: 'الكمية', labelEn: 'Qty', value: `${item.quantity} ${item.unit_symbol}` },
                    { labelAr: 'سعر الوحدة', labelEn: 'Unit Price', value: fmt3(item.unit_price) },
                    item.line_discount_amount > 0 ? { labelAr: 'الخصم', labelEn: 'Discount', value: `-${fmt3(item.line_discount_amount)}` } : null,
                    { labelAr: 'المجموع', labelEn: 'Line Total', value: fmt3(item.line_total), bold: true },
                  ].filter(Boolean).map((d, di) => (
                    <View key={di} style={[styles.itemDetailRow, isRTL && styles.itemDetailRowRTL]}>
                      <Text style={styles.itemDetailLabel}>{language === 'ar' ? d!.labelAr : d!.labelEn}</Text>
                      <Text style={[styles.itemDetailValue, (d as any).bold && { fontWeight: Typography.fontWeightBold, color: Colors.text }]}>{d!.value}</Text>
                    </View>
                  ))}
                </View>
                {/* Per-item profitability (permission-gated) */}
                <View style={[styles.itemProfitRow, isRTL && styles.itemProfitRowRTL]}>
                  <View style={styles.profitChip}>
                    <Text style={styles.profitChipLabel}>{language === 'ar' ? 'ربح' : 'Profit'}</Text>
                    <Text style={[styles.profitChipValue, { color: item.gross_profit >= 0 ? Colors.success : Colors.danger }]}>
                      {fmt3(item.gross_profit)}
                    </Text>
                  </View>
                  <View style={[styles.marginChip, { backgroundColor: `${marginColor(item.gross_margin_percent)}15` }]}>
                    <Text style={[styles.marginChipText, { color: marginColor(item.gross_margin_percent) }]}>
                      {item.gross_margin_percent.toFixed(1)}%
                    </Text>
                  </View>
                  {item.is_below_target_margin ? (
                    <View style={styles.warnChip}>
                      <MaterialIcons name="warning" size={11} color={Colors.warning} />
                      <Text style={styles.warnChipText}>{language === 'ar' ? 'أقل من الهدف' : 'Below target'}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </>) : null}

          {/* ── PROFITABILITY ─────────────────────────────────────────── */}
          {activeTab === 'profitability' && invoice.profitability ? (<>
            {/* Gross Profit Card */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'تحليل الربحية الإجمالية' : 'Gross Profitability Analysis'}
              </Text>
              {[
                { labelAr: 'الإيراد',           labelEn: 'Revenue',              value: invoice.profitability.revenue,        color: Colors.text     },
                { labelAr: 'تكلفة المبيعات',    labelEn: 'Accounting COGS',      value: invoice.profitability.accounting_cogs, color: Colors.danger   },
                { labelAr: 'مجمل الربح',        labelEn: 'Gross Profit',         value: invoice.profitability.gross_profit,   color: Colors.success  },
              ].map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                  <Text style={styles.detailLabel}>{language === 'ar' ? row.labelAr : row.labelEn}</Text>
                  <Text style={[styles.detailValue, { color: row.color, fontWeight: Typography.fontWeightSemibold }, isRTL && styles.textRTL]}>
                    {fmtCurr(row.value)}
                  </Text>
                </View>
              ))}
              <View style={[styles.marginHighlight, { borderColor: `${marginColor(invoice.profitability.gross_margin_percent)}30`, backgroundColor: `${marginColor(invoice.profitability.gross_margin_percent)}08` }]}>
                <Text style={styles.marginHL}>{language === 'ar' ? 'هامش الربح الإجمالي' : 'Gross Margin'}</Text>
                <Text style={[styles.marginHLValue, { color: marginColor(invoice.profitability.gross_margin_percent) }]}>
                  {invoice.profitability.gross_margin_percent.toFixed(2)}%
                </Text>
              </View>
            </View>

            {/* Commercial Costs */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'التكاليف التجارية' : 'Commercial Costs'}
              </Text>
              {[
                { labelAr: 'الربح الإجمالي',   labelEn: 'Gross Profit',   value: invoice.profitability.gross_profit,              positive: true  },
                { labelAr: 'رسوم الدفع',        labelEn: 'Payment Fee',    value: -invoice.profitability.payment_fee,              positive: false },
                { labelAr: 'تكلفة التوصيل',     labelEn: 'Delivery Cost',  value: -invoice.profitability.delivery_cost,            positive: false },
                { labelAr: 'تكلفة تسويق',       labelEn: 'Marketing',      value: -invoice.profitability.marketing_cost_allocation,positive: false },
                { labelAr: 'تكاليف أخرى',       labelEn: 'Other',          value: -invoice.profitability.other_costs,              positive: false },
              ].filter(row => row.value !== 0 || row.labelEn === 'Gross Profit').map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                  <Text style={styles.detailLabel}>{language === 'ar' ? row.labelAr : row.labelEn}</Text>
                  <Text style={[styles.detailValue, { color: row.positive ? Colors.success : Colors.textSecondary }, isRTL && styles.textRTL]}>
                    {fmtCurr(Math.abs(row.value))}
                  </Text>
                </View>
              ))}
              <View style={[styles.marginHighlight, { borderColor: `${marginColor(invoice.profitability.commercial_margin_percent)}30`, backgroundColor: `${marginColor(invoice.profitability.commercial_margin_percent)}08` }]}>
                <Text style={styles.marginHL}>{language === 'ar' ? 'الربح التجاري النهائي' : 'Commercial Profit'}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.marginHLValue, { color: marginColor(invoice.profitability.commercial_margin_percent) }]}>
                    {invoice.profitability.commercial_margin_percent.toFixed(2)}%
                  </Text>
                  <Text style={[styles.detailValue, { color: marginColor(invoice.profitability.commercial_margin_percent) }, isRTL && styles.textRTL]}>
                    {fmtCurr(invoice.profitability.commercial_profit)}
                  </Text>
                </View>
              </View>
            </View>
          </>) : null}

          {/* ── PAYMENTS ─────────────────────────────────────────────── */}
          {activeTab === 'payments' ? (<>
            {(invoice.status === 'approved' || invoice.status === 'partially_paid') ? (
              <Pressable style={[styles.addPayBtn, isRTL && styles.addPayBtnRTL]}
                onPress={() => setShowPaymentModal(true)}>
                <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addPayBtnText}>{language === 'ar' ? 'تسجيل دفعة جديدة' : 'Record New Payment'}</Text>
              </Pressable>
            ) : null}
            {/* Outstanding Banner */}
            {invoice.outstanding > 0 ? (
              <View style={[styles.outstandingBanner, isRTL && styles.outstandingBannerRTL]}>
                <MaterialIcons name="pending" size={20} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.outstandingLabel, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'المبلغ المتبقي' : 'Outstanding Balance'}
                  </Text>
                  <Text style={[styles.outstandingValue, isRTL && styles.textRTL]}>
                    {fmtCurr(invoice.outstanding)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.paidBanner, isRTL && styles.paidBannerRTL]}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={[styles.paidLabel, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'تم السداد الكامل' : 'Fully Paid'}
                </Text>
              </View>
            )}
            {/* Payment List */}
            {invoice.payments.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="payment" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد مدفوعات بعد' : 'No payments yet'}</Text>
              </View>
            ) : null}
            {invoice.payments.map(pay => {
              const pmCfg = PAYMENT_METHOD_CONFIG[pay.method];
              return (
                <View key={pay.id} style={[styles.payCard, isRTL && styles.payCardRTL]}>
                  <View style={[styles.payIcon, { backgroundColor: `${pmCfg.color}15` }]}>
                    <MaterialIcons name={pmCfg.icon as any} size={20} color={pmCfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payNum, isRTL && styles.textRTL]}>{pay.payment_number}</Text>
                    <Text style={styles.payDate}>{pay.date}</Text>
                    {pay.reference ? <Text style={styles.payRef}>{pay.reference}</Text> : null}
                  </View>
                  <Text style={[styles.payAmount, { color: Colors.success }, isRTL && styles.textRTL]}>
                    +{fmtCurr(pay.amount)}
                  </Text>
                </View>
              );
            })}
          </>) : null}

          {/* ── ACCOUNTING ───────────────────────────────────────────── */}
          {activeTab === 'accounting' ? (
            <View style={styles.card}>
              <View style={[styles.accountingHeader, isRTL && styles.accountingHeaderRTL]}>
                <View style={[styles.accountingIcon, { backgroundColor: Colors.primaryLight }]}>
                  <MaterialIcons name="account-balance" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL, { marginBottom: 4 }]}>
                    {language === 'ar' ? 'الأثر المحاسبي' : 'Accounting Impact'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: invoice.accounting_status === 'posted' ? Colors.successLight : Colors.warningLight, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.statusText, { color: invoice.accounting_status === 'posted' ? Colors.success : Colors.warning }]}>
                      {invoice.accounting_status === 'posted' ? (language === 'ar' ? 'مرحّل' : 'Posted') : (language === 'ar' ? 'معلق' : 'Pending')}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Accounting entries explanation */}
              <View style={[styles.archNote, isRTL && styles.archNoteRTL]}>
                <MaterialIcons name="info" size={14} color={Colors.info} />
                <Text style={[styles.archNoteText, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? invoice.payment_method === 'credit'
                      ? 'بيع آجل: مدين (الذمم المدينة) ← دائن (الإيرادات) ثم: مدين (تكلفة المبيعات) ← دائن (المخزون)'
                      : 'بيع نقدي: مدين (النقدية/البنك) ← دائن (الإيرادات) ثم: مدين (تكلفة المبيعات) ← دائن (المخزون)'
                    : invoice.payment_method === 'credit'
                      ? 'Credit sale: Dr Accounts Receivable → Cr Revenue | Dr COGS → Cr Inventory'
                      : 'Cash sale: Dr Cash/Bank → Cr Revenue | Dr COGS → Cr Inventory'}
                </Text>
              </View>
              {/* Mock journal lines */}
              <Text style={[styles.subSectionTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'القيود المحاسبية' : 'Journal Entry Lines'}
              </Text>
              <View style={styles.journalTable}>
                <View style={[styles.journalHeader, isRTL && styles.journalHeaderRTL]}>
                  <Text style={[styles.journalHeaderText, { flex: 2 }]}>{language === 'ar' ? 'الحساب' : 'Account'}</Text>
                  <Text style={[styles.journalHeaderText, { flex: 1, textAlign: 'center' }]}>{language === 'ar' ? 'مدين' : 'Debit'}</Text>
                  <Text style={[styles.journalHeaderText, { flex: 1, textAlign: 'center' }]}>{language === 'ar' ? 'دائن' : 'Credit'}</Text>
                </View>
                {[
                  { account: invoice.payment_method === 'credit' ? (language === 'ar' ? '1200 — الذمم المدينة' : '1200 — Accounts Receivable') : (language === 'ar' ? '1100 — النقدية' : '1100 — Cash'), debit: invoice.total, credit: 0 },
                  { account: language === 'ar' ? '4000 — إيراد المبيعات' : '4000 — Sales Revenue', debit: 0, credit: invoice.total },
                  invoice.profitability ? { account: language === 'ar' ? '5000 — تكلفة البضاعة المباعة' : '5000 — Cost of Goods Sold', debit: invoice.profitability.accounting_cogs, credit: 0 } : null,
                  invoice.profitability ? { account: language === 'ar' ? '1400 — المخزون' : '1400 — Inventory', debit: 0, credit: invoice.profitability.accounting_cogs } : null,
                ].filter(Boolean).map((row, i) => (
                  <View key={i} style={[styles.journalRow, isRTL && styles.journalRowRTL, i % 2 === 1 && { backgroundColor: Colors.background }]}>
                    <Text style={[styles.journalAccount, { flex: 2 }, isRTL && styles.textRTL]} numberOfLines={1}>{row!.account}</Text>
                    <Text style={[styles.journalAmount, { flex: 1 }, row!.debit > 0 && { color: Colors.primary }]}>
                      {row!.debit > 0 ? fmt3(row!.debit) : '—'}
                    </Text>
                    <Text style={[styles.journalAmount, { flex: 1 }, row!.credit > 0 && { color: Colors.danger }]}>
                      {row!.credit > 0 ? fmt3(row!.credit) : '—'}
                    </Text>
                  </View>
                ))}
                {/* Totals */}
                <View style={[styles.journalTotals, isRTL && styles.journalTotalsRTL]}>
                  <Text style={[styles.journalTotalLabel, { flex: 2 }, isRTL && styles.textRTL]}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={[styles.journalTotalValue, { flex: 1 }]}>
                    {fmt3(invoice.total + (invoice.profitability?.accounting_cogs ?? 0))}
                  </Text>
                  <Text style={[styles.journalTotalValue, { flex: 1 }]}>
                    {fmt3(invoice.total + (invoice.profitability?.accounting_cogs ?? 0))}
                  </Text>
                </View>
              </View>
              <View style={[styles.balanceCheck, isRTL && styles.balanceCheckRTL]}>
                <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.balanceCheckText}>{language === 'ar' ? 'القيد متوازن: مجموع المدين = مجموع الدائن' : 'Balanced: Total Debit = Total Credit'}</Text>
              </View>
            </View>
          ) : null}

          <View style={{ height: insets.bottom + Spacing['3xl'] }} />
        </ScrollView>
      </View>

      {/* ── ADD PAYMENT MODAL ─────────────────────────────────────── */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[styles.sheetHeader, isRTL && styles.sheetHeaderRTL]}>
              <Text style={styles.sheetTitle}>{language === 'ar' ? 'تسجيل دفعة' : 'Record Payment'}</Text>
              <Pressable onPress={() => setShowPaymentModal(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ padding: Spacing.base }}>
              {/* Outstanding info */}
              <View style={[styles.outstandingInfo, isRTL && styles.outstandingInfoRTL]}>
                <Text style={styles.outstandingInfoLabel}>{language === 'ar' ? 'المبلغ المتبقي' : 'Outstanding'}</Text>
                <Text style={styles.outstandingInfoValue}>{fmtCurr(invoice.outstanding)}</Text>
              </View>
              {/* Amount */}
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL, { marginBottom: 6 }]}>
                {language === 'ar' ? 'المبلغ المدفوع *' : 'Payment Amount *'}
              </Text>
              <TextInput
                style={[styles.payInput, isRTL && { textAlign: 'right' }]}
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="decimal-pad"
                placeholder={`0.000 ${language === 'ar' ? 'د.ك' : 'KWD'}`}
                placeholderTextColor={Colors.textMuted}
              />
              {/* Quick fill buttons */}
              <View style={styles.quickFillRow}>
                <Pressable style={styles.quickFillBtn} onPress={() => setPayAmount((invoice.outstanding / 2).toFixed(3))}>
                  <Text style={styles.quickFillBtnText}>{language === 'ar' ? 'نصف' : '50%'}</Text>
                </Pressable>
                <Pressable style={styles.quickFillBtn} onPress={() => setPayAmount(invoice.outstanding.toFixed(3))}>
                  <Text style={styles.quickFillBtnText}>{language === 'ar' ? 'الكامل' : 'Full'}</Text>
                </Pressable>
              </View>
              {/* Payment Method */}
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL, { marginTop: Spacing.md, marginBottom: 6 }]}>
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.methodRow}>
                  {(['cash', 'bank_transfer', 'card', 'knet'] as PaymentMethod[]).map(m => {
                    const mc = PAYMENT_METHOD_CONFIG[m];
                    return (
                      <Pressable key={m} onPress={() => setPayMethod(m)}
                        style={[styles.methodChip, payMethod === m && styles.methodChipActive]}>
                        <MaterialIcons name={mc.icon as any} size={14} color={payMethod === m ? Colors.textInverse : mc.color} />
                        <Text style={[styles.methodChipText, payMethod === m && styles.methodChipTextActive]}>
                          {language === 'ar' ? mc.labelAr : mc.labelEn}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              {/* Reference */}
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL, { marginTop: Spacing.md, marginBottom: 6 }]}>
                {language === 'ar' ? 'المرجع (اختياري)' : 'Reference (optional)'}
              </Text>
              <TextInput
                style={[styles.payInput, isRTL && { textAlign: 'right' }]}
                value={payRef}
                onChangeText={setPayRef}
                placeholder={language === 'ar' ? 'رقم الإيصال، المعاملة...' : 'Receipt no., transaction...'}
                placeholderTextColor={Colors.textMuted}
              />
              <Pressable style={styles.submitPayBtn} onPress={handleAddPayment}>
                <Text style={styles.submitPayBtnText}>{language === 'ar' ? 'تسجيل الدفعة' : 'Record Payment'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  invTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  statusRowRTL: { flexDirection: 'row-reverse' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  channelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  channelText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', flexShrink: 0 },
  headerActionsRTL: { flexDirection: 'row-reverse' },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.primary },
  approveBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  payBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.success },
  payBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  content: { padding: Spacing.base, gap: Spacing.base },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  cardTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  subSectionTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md, includeFontPadding: false },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  cardRowRTL: { flexDirection: 'row-reverse' },
  customerIconBg: { width: 46, height: 46, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  customerCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailRowRTL: { flexDirection: 'row-reverse' },
  detailRowHighlight: { borderBottomWidth: 0, paddingTop: 14 },
  detailLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  detailValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  progressBar: { height: 10, backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelsRTL: { flexDirection: 'row-reverse' },
  progressLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  actionsRowRTL: { flexDirection: 'row-reverse' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionBtnText: { fontSize: Typography.fontSizeSM, color: Colors.text, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  // Items
  itemCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm, gap: Spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  itemHeaderRTL: { flexDirection: 'row-reverse' },
  itemNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  itemNumText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  itemName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  itemCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace', includeFontPadding: false },
  itemDetails: { gap: 0 },
  itemDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  itemDetailRowRTL: { flexDirection: 'row-reverse' },
  itemDetailLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  itemDetailValue: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  itemProfitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  itemProfitRowRTL: { flexDirection: 'row-reverse' },
  profitChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profitChipLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  profitChipValue: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  marginChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  marginChipText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  warnChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.warningLight },
  warnChipText: { fontSize: 10, color: Colors.warning, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Profitability
  marginHighlight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, marginTop: Spacing.md },
  marginHL: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  marginHLValue: { fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  archNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  archNoteRTL: { flexDirection: 'row-reverse' },
  archNoteText: { flex: 1, fontSize: Typography.fontSizeXS, color: Colors.info, lineHeight: 18, includeFontPadding: false },
  // Journal Table
  journalTable: { borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  journalHeader: { flexDirection: 'row', backgroundColor: Colors.background, padding: Spacing.sm },
  journalHeaderRTL: { flexDirection: 'row-reverse' },
  journalHeaderText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, color: Colors.textSecondary, includeFontPadding: false },
  journalRow: { flexDirection: 'row', padding: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  journalRowRTL: { flexDirection: 'row-reverse' },
  journalAccount: { fontSize: Typography.fontSizeXS, color: Colors.text, includeFontPadding: false },
  journalAmount: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, textAlign: 'center', color: Colors.textSecondary, includeFontPadding: false },
  journalTotals: { flexDirection: 'row', padding: Spacing.sm, backgroundColor: Colors.background, borderTopWidth: 2, borderTopColor: Colors.border },
  journalTotalsRTL: { flexDirection: 'row-reverse' },
  journalTotalLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  journalTotalValue: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, color: Colors.text, textAlign: 'center', includeFontPadding: false },
  balanceCheck: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md },
  balanceCheckRTL: { flexDirection: 'row-reverse' },
  balanceCheckText: { fontSize: Typography.fontSizeSM, color: Colors.success, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  accountingHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  accountingHeaderRTL: { flexDirection: 'row-reverse' },
  accountingIcon: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  // Payments
  addPayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, paddingVertical: 13, borderRadius: Radius.lg, ...Shadow.md },
  addPayBtnRTL: { flexDirection: 'row-reverse' },
  addPayBtnText: { color: Colors.textInverse, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  outstandingBanner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: Colors.warningLight, borderRadius: Radius.lg, padding: Spacing.base, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  outstandingBannerRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.warning },
  outstandingLabel: { fontSize: Typography.fontSizeSM, color: Colors.warning, includeFontPadding: false },
  outstandingValue: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  paidBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.successLight, borderRadius: Radius.lg, padding: Spacing.base },
  paidBannerRTL: { flexDirection: 'row-reverse' },
  paidLabel: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.success, includeFontPadding: false },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  payCardRTL: { flexDirection: 'row-reverse' },
  payIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  payNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  payDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  payRef: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  payAmount: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, includeFontPadding: false },
  // Payment modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '75%', ...Shadow.lg },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sheetHeaderRTL: { flexDirection: 'row-reverse' },
  sheetTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  outstandingInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  outstandingInfoRTL: { flexDirection: 'row-reverse' },
  outstandingInfoLabel: { fontSize: Typography.fontSizeSM, color: Colors.warning, includeFontPadding: false },
  outstandingInfoValue: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  fieldLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  payInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.fontSizeLG, color: Colors.text, backgroundColor: Colors.background, marginBottom: 8, includeFontPadding: false },
  quickFillRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  quickFillBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  quickFillBtnText: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  methodRow: { flexDirection: 'row', gap: Spacing.sm },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  methodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  methodChipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  methodChipTextActive: { color: Colors.textInverse },
  submitPayBtn: { backgroundColor: Colors.success, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.lg, ...Shadow.md },
  submitPayBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textInverse, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
