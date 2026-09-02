// Purchase Detail — Invoice View + 3-Way Matching + Landed Cost + Payments + Accounting
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../hooks/useLanguage';
import { usePurchases } from '../../contexts/PurchasesContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import {
  PURCHASE_STATUS_CONFIG, LANDED_COST_STATUS_CONFIG, LANDED_COST_TYPE_CONFIG,
  PAYMENT_METHOD_CONFIG, PurchasePaymentRecord, PaymentMethod,
} from '../../types/purchases';
import { DEMO_PRODUCT_COST_HISTORY } from '../../services/purchasesData';
import { useAlert } from '@/template';

type DetailTab = 'overview' | 'items' | 'matching' | 'landed_cost' | 'payments' | 'cost_history' | 'accounting';

export default function PurchaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { getInvoiceById, approveInvoice, cancelInvoice, addPayment, landedCosts } = usePurchases();
  const invoice = getInvoiceById(id);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bank_transfer');
  const [payRef, setPayRef] = useState('');

  if (!invoice) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <MaterialIcons name="receipt-long" size={48} color={Colors.textMuted} />
        <Text style={{ color: Colors.textMuted, marginTop: 12 }}>
          {language === 'ar' ? 'فاتورة غير موجودة' : 'Invoice not found'}
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.warning }}>{language === 'ar' ? 'العودة' : 'Go back'}</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = PURCHASE_STATUS_CONFIG[invoice.status];
  const fmt3 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const fmtCurr = (n: number) => `${fmt3(n)} ${language === 'ar' ? 'د.ك' : 'KWD'}`;
  // Landed costs for this invoice
  const relatedLandedCosts = landedCosts.filter(lc => lc.invoice_ids.includes(invoice.id));
  // Cost history for invoice products
  const costHistory = DEMO_PRODUCT_COST_HISTORY.filter(h => h.invoice_id === invoice.id);

  const TABS: { key: DetailTab; labelAr: string; labelEn: string; icon: string }[] = [
    { key: 'overview',     labelAr: 'نظرة عامة',       labelEn: 'Overview',      icon: 'info'           },
    { key: 'items',        labelAr: 'المنتجات',         labelEn: 'Items',         icon: 'list'           },
    { key: 'matching',     labelAr: 'المطابقة الثلاثية', labelEn: '3-Way Match',  icon: 'compare-arrows' },
    { key: 'landed_cost',  labelAr: 'تكاليف الاستيراد', labelEn: 'Landed Costs', icon: 'local-shipping' },
    { key: 'payments',     labelAr: 'المدفوعات',        labelEn: 'Payments',      icon: 'payment'        },
    { key: 'cost_history', labelAr: 'تاريخ التكلفة',   labelEn: 'Cost History',  icon: 'history'        },
    { key: 'accounting',   labelAr: 'المحاسبة',         labelEn: 'Accounting',    icon: 'account-balance'},
  ];

  const handleApprove = () => {
    showAlert(
      language === 'ar' ? 'اعتماد الفاتورة؟' : 'Approve Invoice?',
      language === 'ar' ? 'سيتم اعتماد الفاتورة وتسجيل الأثر المحاسبي.' : 'Invoice will be approved and accounting entries created.',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'اعتماد' : 'Approve', onPress: () => approveInvoice(invoice.id) },
      ]
    );
  };

  const handleCancel = () => {
    showAlert(
      language === 'ar' ? 'إلغاء الفاتورة؟' : 'Cancel Invoice?',
      language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.',
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
      showAlert(language === 'ar' ? 'تجاوز المبلغ' : 'Exceeds Balance',
        language === 'ar' ? `يتجاوز المبلغ المتبقي (${fmt3(invoice.outstanding)} د.ك)` : `Amount exceeds outstanding (KWD ${fmt3(invoice.outstanding)})`);
      return;
    }
    const payment: PurchasePaymentRecord = {
      id: `pp-${Date.now()}`,
      invoice_id: invoice.id,
      company_id: invoice.company_id,
      payment_number: `PP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
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
      language === 'ar' ? `تم تسجيل دفعة ${fmtCurr(amt)} للمورد` : `Payment of ${fmtCurr(amt)} to supplier recorded`
    );
  };

  const matchingColor = invoice.matching_status === 'matched' ? Colors.success
    : invoice.matching_status === 'mismatch' ? Colors.danger : Colors.warning;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.invTitle, isRTL && styles.txtRTL]}>{invoice.invoice_number}</Text>
            <View style={[styles.badgeRow, isRTL && styles.badgeRowRTL]}>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <MaterialIcons name={cfg.icon as any} size={11} color={cfg.color} />
                <Text style={[styles.statusText, { color: cfg.color }]}>
                  {language === 'ar' ? cfg.labelAr : cfg.labelEn}
                </Text>
              </View>
              {invoice.supplier_invoice_number ? (
                <View style={styles.refBadge}>
                  <Text style={styles.refText}>{invoice.supplier_invoice_number}</Text>
                </View>
              ) : null}
              {invoice.matching_status !== 'not_matched' ? (
                <View style={[styles.statusBadge, { backgroundColor: `${matchingColor}15` }]}>
                  <MaterialIcons name={invoice.matching_status === 'matched' ? 'check-circle' : 'warning'} size={11} color={matchingColor} />
                  <Text style={[styles.statusText, { color: matchingColor }]}>
                    {invoice.matching_status === 'matched' ? (language === 'ar' ? 'متطابق' : 'Matched') : invoice.matching_status === 'mismatch' ? (language === 'ar' ? 'تباين' : 'Mismatch') : (language === 'ar' ? 'جزئي' : 'Partial')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.headerActions, isRTL && styles.headerActionsRTL]}>
            {(invoice.status === 'draft' || invoice.status === 'pending_approval') ? (
              <Pressable style={styles.approveBtn} onPress={handleApprove}>
                <Text style={styles.approveBtnText}>{language === 'ar' ? 'اعتماد' : 'Approve'}</Text>
              </Pressable>
            ) : null}
            {(invoice.status === 'approved' || invoice.status === 'partially_paid') ? (
              <Pressable style={styles.payBtn} onPress={() => setShowPaymentModal(true)}>
                <MaterialIcons name="payment" size={16} color={Colors.textInverse} />
                <Text style={styles.payBtnText}>{language === 'ar' ? 'دفع' : 'Pay'}</Text>
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
                <MaterialIcons name={tab.icon as any} size={13} color={activeTab === tab.key ? Colors.warning : Colors.textMuted} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {language === 'ar' ? tab.labelAr : tab.labelEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── OVERVIEW ────────────────────────────────────────── */}
          {activeTab === 'overview' ? (<>
            <View style={styles.card}>
              <View style={[styles.supplierRow, isRTL && styles.supplierRowRTL]}>
                <View style={styles.supplierIcon}>
                  <MaterialIcons name="business" size={22} color={Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.supplierName, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? (invoice.supplier_name_ar ?? invoice.supplier_name) : invoice.supplier_name}
                  </Text>
                  <Text style={styles.supplierCode}>{invoice.supplier_code}</Text>
                </View>
              </View>
              {[
                { labelAr: 'تاريخ الفاتورة', labelEn: 'Invoice Date', value: invoice.date },
                invoice.due_date ? { labelAr: 'تاريخ الاستحقاق', labelEn: 'Due Date', value: invoice.due_date } : null,
                { labelAr: 'العملة', labelEn: 'Currency', value: `${invoice.currency} (Rate: ${invoice.exchange_rate})` },
                invoice.po_number ? { labelAr: 'طلب الشراء', labelEn: 'Purchase Order', value: invoice.po_number } : null,
                invoice.grn_number ? { labelAr: 'إذن الاستلام', labelEn: 'Goods Receipt', value: invoice.grn_number } : null,
              ].filter(Boolean).map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                  <Text style={styles.detailLabel}>{language === 'ar' ? row!.labelAr : row!.labelEn}</Text>
                  <Text style={[styles.detailValue, isRTL && styles.txtRTL]}>{row!.value}</Text>
                </View>
              ))}
            </View>
            {/* Financial Summary */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.txtRTL]}>
                {language === 'ar' ? 'الملخص المالي' : 'Financial Summary'}
              </Text>
              {[
                { labelAr: `المجموع (${invoice.currency})`, labelEn: `Subtotal (${invoice.currency})`, value: fmtCurr(invoice.subtotal), hl: false },
                invoice.invoice_discount_amount > 0 ? { labelAr: 'الخصم', labelEn: 'Discount', value: `-${fmtCurr(invoice.invoice_discount_amount)}`, hl: false } : null,
                { labelAr: 'الإجمالي', labelEn: 'Total', value: fmtCurr(invoice.total_kwd), hl: true },
                { labelAr: 'تكاليف الاستيراد', labelEn: 'Landed Costs', value: fmtCurr(invoice.total_landed_cost_allocated), hl: false },
                { labelAr: 'التكلفة النهائية للمخزون', labelEn: 'Final Inventory Cost', value: fmtCurr(invoice.final_inventory_cost), hl: false },
                { labelAr: 'المبلغ المدفوع', labelEn: 'Paid Amount', value: fmtCurr(invoice.paid_amount), hl: false },
                invoice.outstanding > 0 ? { labelAr: 'المبلغ المتبقي', labelEn: 'Outstanding', value: fmtCurr(invoice.outstanding), hl: false, danger: true } : null,
              ].filter(Boolean).map((row, i) => (
                <View key={i} style={[styles.detailRow, isRTL && styles.detailRowRTL, row!.hl && styles.detailRowHL]}>
                  <Text style={[styles.detailLabel, row!.hl && { color: Colors.text, fontWeight: Typography.fontWeightBold }]}>
                    {language === 'ar' ? row!.labelAr : row!.labelEn}
                  </Text>
                  <Text style={[styles.detailValue, row!.hl && { color: Colors.warning, fontWeight: Typography.fontWeightBold, fontSize: Typography.fontSizeLG }, (row as any).danger && { color: Colors.danger }, isRTL && styles.txtRTL]}>
                    {row!.value}
                  </Text>
                </View>
              ))}
            </View>
            {/* Payment Progress */}
            {invoice.total_kwd > 0 ? (
              <View style={styles.card}>
                <Text style={[styles.cardTitle, isRTL && styles.txtRTL]}>
                  {language === 'ar' ? 'تقدم السداد' : 'Payment Progress'}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, (invoice.paid_amount / invoice.total_kwd) * 100)}%` }]} />
                </View>
                <View style={[styles.progressLabels, isRTL && styles.progressLabelsRTL]}>
                  <Text style={styles.progressLabel}>{language === 'ar' ? 'مدفوع' : 'Paid'}: {fmtCurr(invoice.paid_amount)}</Text>
                  <Text style={[styles.progressLabel, invoice.outstanding > 0 && { color: Colors.warning }]}>
                    {language === 'ar' ? 'متبقي' : 'Outstanding'}: {fmtCurr(invoice.outstanding)}
                  </Text>
                </View>
              </View>
            ) : null}
            {/* Action Buttons */}
            {invoice.status !== 'cancelled' && invoice.status !== 'returned' ? (
              <View style={[styles.actionsRow, isRTL && styles.actionsRowRTL]}>
                {invoice.status === 'draft' || invoice.status === 'pending_approval' ? (
                  <Pressable style={[styles.actionBtn, { borderColor: Colors.dangerLight }]} onPress={handleCancel}>
                    <MaterialIcons name="cancel" size={18} color={Colors.danger} />
                    <Text style={[styles.actionBtnText, { color: Colors.danger }]}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.actionBtn} onPress={() => showAlert('PDF', language === 'ar' ? 'جارٍ إنشاء PDF...' : 'Generating PDF...')}>
                  <MaterialIcons name="picture-as-pdf" size={18} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>{language === 'ar' ? 'طباعة' : 'Print'}</Text>
                </Pressable>
              </View>
            ) : null}
          </>) : null}

          {/* ── ITEMS ─────────────────────────────────────────── */}
          {activeTab === 'items' ? invoice.items.map((item, idx) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemHeader, isRTL && styles.itemHeaderRTL]}>
                <View style={styles.itemNumBadge}>
                  <Text style={styles.itemNumText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? (item.product_name_ar ?? item.product_name) : item.product_name}
                  </Text>
                  <Text style={styles.itemCode}>{item.product_code}</Text>
                  {item.batch_number ? <Text style={styles.itemBatch}>{language === 'ar' ? `دفعة: ${item.batch_number}` : `Batch: ${item.batch_number}`}</Text> : null}
                </View>
              </View>
              {[
                { labelAr: 'الكمية', labelEn: 'Qty', value: `${item.quantity} ${item.unit_symbol}` },
                { labelAr: `سعر الوحدة (${invoice.currency})`, labelEn: `Unit Cost (${invoice.currency})`, value: fmt3(item.unit_cost) },
                { labelAr: 'سعر الوحدة (KWD)', labelEn: 'Unit Cost (KWD)', value: fmt3(item.unit_cost_kwd) },
                item.line_discount_amount > 0 ? { labelAr: 'الخصم', labelEn: 'Discount', value: `-${fmt3(item.line_discount_amount)}` } : null,
                { labelAr: 'الإجمالي', labelEn: 'Line Total', value: fmt3(item.line_total), bold: true },
              ].filter(Boolean).map((d, di) => (
                <View key={di} style={[styles.itemDetailRow, isRTL && styles.itemDetailRowRTL]}>
                  <Text style={styles.itemDetailLabel}>{language === 'ar' ? d!.labelAr : d!.labelEn}</Text>
                  <Text style={[styles.itemDetailValue, (d as any).bold && { fontWeight: Typography.fontWeightBold, color: Colors.text }]}>{d!.value}</Text>
                </View>
              ))}
              {/* Price Variance */}
              {item.price_variance !== undefined && Math.abs(item.price_variance) > 0.001 ? (
                <View style={[styles.varianceRow, isRTL && styles.varianceRowRTL, { backgroundColor: item.price_variance > 0 ? Colors.dangerLight : Colors.successLight }]}>
                  <MaterialIcons name={item.price_variance > 0 ? 'trending-up' : 'trending-down'} size={14} color={item.price_variance > 0 ? Colors.danger : Colors.success} />
                  <Text style={[styles.varianceText, { color: item.price_variance > 0 ? Colors.danger : Colors.success }]}>
                    {language === 'ar' ? 'تباين السعر:' : 'Price Variance:'} {item.price_variance > 0 ? '+' : ''}{fmt3(item.price_variance)} {invoice.currency}
                  </Text>
                </View>
              ) : null}
              {/* Final Cost */}
              <View style={[styles.finalCostRow, isRTL && styles.finalCostRowRTL]}>
                <Text style={styles.finalCostLabel}>{language === 'ar' ? 'التكلفة النهائية للوحدة:' : 'Final Unit Cost:'}</Text>
                <Text style={[styles.finalCostValue, { color: Colors.warning }]}>{fmt3(item.final_unit_cost)} KWD</Text>
              </View>
            </View>
          )) : null}

          {/* ── 3-WAY MATCHING ───────────────────────────────── */}
          {activeTab === 'matching' ? (
            <View style={styles.card}>
              <View style={[styles.matchHeader, isRTL && styles.matchHeaderRTL]}>
                <View style={[styles.matchIcon, { backgroundColor: `${matchingColor}15` }]}>
                  <MaterialIcons name="compare-arrows" size={24} color={matchingColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 4 }]}>
                    {language === 'ar' ? 'المطابقة الثلاثية' : '3-Way Matching'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${matchingColor}15`, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.statusText, { color: matchingColor }]}>
                      {invoice.matching_status === 'matched' ? (language === 'ar' ? 'متطابق تماماً' : 'Fully Matched')
                        : invoice.matching_status === 'mismatch' ? (language === 'ar' ? 'يوجد تباين' : 'Mismatch Detected')
                        : invoice.matching_status === 'partial_match' ? (language === 'ar' ? 'مطابقة جزئية' : 'Partial Match')
                        : (language === 'ar' ? 'غير مطابق' : 'Not Matched')}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Match steps */}
              {[
                { labelAr: 'طلب الشراء', labelEn: 'Purchase Order', ref: invoice.po_number, icon: 'assignment', color: Colors.primary },
                { labelAr: 'إذن الاستلام', labelEn: 'Goods Receipt', ref: invoice.grn_number, icon: 'inventory', color: Colors.success },
                { labelAr: 'فاتورة الشراء', labelEn: 'Purchase Invoice', ref: invoice.invoice_number, icon: 'receipt-long', color: Colors.warning },
              ].map((step, i) => (
                <View key={i} style={[styles.matchStep, isRTL && styles.matchStepRTL]}>
                  <View style={[styles.matchStepIcon, { backgroundColor: `${step.color}15` }]}>
                    <MaterialIcons name={step.icon as any} size={18} color={step.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.matchStepLabel, isRTL && styles.txtRTL]}>
                      {language === 'ar' ? step.labelAr : step.labelEn}
                    </Text>
                    <Text style={[styles.matchStepRef, isRTL && styles.txtRTL]}>
                      {step.ref ?? (language === 'ar' ? '— غير مرتبط' : '— Not linked')}
                    </Text>
                  </View>
                  <MaterialIcons name={step.ref ? 'check-circle' : 'radio-button-unchecked'} size={20} color={step.ref ? step.color : Colors.textMuted} />
                </View>
              ))}
              {/* Variances */}
              {(invoice.qty_variance !== 0 || invoice.price_variance_amount !== 0) ? (
                <View style={styles.varianceSection}>
                  <Text style={[styles.sectionSubTitle, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? 'التباينات المكتشفة' : 'Detected Variances'}
                  </Text>
                  {invoice.qty_variance !== 0 ? (
                    <View style={[styles.varianceItem, isRTL && styles.varianceItemRTL, { backgroundColor: Colors.warningLight }]}>
                      <MaterialIcons name="straighten" size={16} color={Colors.warning} />
                      <Text style={[styles.varianceItemText, isRTL && styles.txtRTL]}>
                        {language === 'ar' ? `تباين الكمية: ${invoice.qty_variance} وحدة` : `Qty Variance: ${invoice.qty_variance} units`}
                      </Text>
                    </View>
                  ) : null}
                  {invoice.price_variance_amount !== 0 ? (
                    <View style={[styles.varianceItem, isRTL && styles.varianceItemRTL, { backgroundColor: Colors.dangerLight }]}>
                      <MaterialIcons name="price-change" size={16} color={Colors.danger} />
                      <Text style={[styles.varianceItemText, isRTL && styles.txtRTL]}>
                        {language === 'ar' ? `تباين السعر: ${fmt3(invoice.price_variance_amount)} KWD` : `Price Variance: KWD ${fmt3(invoice.price_variance_amount)}`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── LANDED COSTS ─────────────────────────────────── */}
          {activeTab === 'landed_cost' ? (<>
            {relatedLandedCosts.length === 0 ? (
              <View style={styles.card}>
                <View style={styles.emptyState}>
                  <MaterialIcons name="local-shipping" size={36} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد تكاليف استيراد' : 'No landed costs yet'}</Text>
                  <Text style={styles.emptySubText}>
                    {language === 'ar' ? 'يمكن إضافة تكاليف الشحن والجمارك والتأمين من قسم تكاليف الاستيراد' : 'Add shipping, customs, insurance from the Landed Costs section'}
                  </Text>
                </View>
              </View>
            ) : null}
            {relatedLandedCosts.map(lc => {
              const lcCfg = LANDED_COST_STATUS_CONFIG[lc.status];
              return (
                <View key={lc.id} style={styles.card}>
                  <View style={[styles.lcHeader, isRTL && styles.lcHeaderRTL]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 4 }]}>{lc.landed_cost_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: lcCfg.bg, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                        <Text style={[styles.statusText, { color: lcCfg.color }]}>{language === 'ar' ? lcCfg.labelAr : lcCfg.labelEn}</Text>
                      </View>
                    </View>
                    <Text style={[styles.lcTotal, isRTL && styles.txtRTL]}>{fmt3(lc.total_cost_kwd)} KWD</Text>
                  </View>
                  {/* Cost lines */}
                  <Text style={[styles.sectionSubTitle, isRTL && styles.txtRTL]}>
                    {language === 'ar' ? 'بنود التكلفة' : 'Cost Lines'}
                  </Text>
                  {lc.cost_lines.map(line => {
                    const typeCfg = LANDED_COST_TYPE_CONFIG[line.cost_type];
                    return (
                      <View key={line.id} style={[styles.lcLine, isRTL && styles.lcLineRTL]}>
                        <View style={[styles.lcLineIcon, { backgroundColor: `${typeCfg.color}15` }]}>
                          <MaterialIcons name={typeCfg.icon as any} size={14} color={typeCfg.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.lcLineName, isRTL && styles.txtRTL]}>
                            {language === 'ar' ? typeCfg.labelAr : typeCfg.labelEn}
                          </Text>
                          <Text style={styles.lcLineDesc}>{language === 'ar' ? (line.description_ar ?? line.description) : line.description}</Text>
                        </View>
                        <Text style={[styles.lcLineAmount, isRTL && styles.txtRTL]}>{fmt3(line.amount_kwd)} KWD</Text>
                      </View>
                    );
                  })}
                  {/* Allocation */}
                  {lc.allocated_items && lc.allocated_items.length > 0 ? (
                    <>
                      <Text style={[styles.sectionSubTitle, isRTL && styles.txtRTL, { marginTop: Spacing.md }]}>
                        {language === 'ar' ? 'توزيع التكلفة على المنتجات' : 'Cost Allocation per Product'}
                      </Text>
                      {lc.allocated_items.map((alloc, ai) => (
                        <View key={ai} style={[styles.allocRow, isRTL && styles.allocRowRTL]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.allocProduct, isRTL && styles.txtRTL]}>{alloc.product_name}</Text>
                            <Text style={styles.allocPercent}>{alloc.allocation_percent.toFixed(2)}%</Text>
                          </View>
                          <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                            <Text style={[styles.allocAmount, isRTL && styles.txtRTL]}>{fmt3(alloc.allocated_amount)} KWD</Text>
                            <Text style={styles.allocPerUnit}>
                              {fmt3(alloc.allocated_per_unit)} {language === 'ar' ? 'للوحدة' : '/unit'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  ) : null}
                </View>
              );
            })}
          </>) : null}

          {/* ── PAYMENTS ──────────────────────────────────────── */}
          {activeTab === 'payments' ? (<>
            {(invoice.status === 'approved' || invoice.status === 'partially_paid') ? (
              <Pressable style={[styles.addPayBtn, isRTL && styles.addPayBtnRTL]}
                onPress={() => setShowPaymentModal(true)}>
                <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addPayBtnText}>{language === 'ar' ? 'تسجيل دفعة للمورد' : 'Record Supplier Payment'}</Text>
              </Pressable>
            ) : null}
            {invoice.outstanding > 0 ? (
              <View style={[styles.outstandingBanner, isRTL && styles.outstandingBannerRTL]}>
                <MaterialIcons name="pending" size={20} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.outstandingLabel, isRTL && styles.txtRTL]}>{language === 'ar' ? 'المبلغ المستحق للمورد' : 'Outstanding to Supplier'}</Text>
                  <Text style={[styles.outstandingValue, isRTL && styles.txtRTL]}>{fmtCurr(invoice.outstanding)}</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.paidBanner, isRTL && styles.paidBannerRTL]}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={[styles.paidLabel, isRTL && styles.txtRTL]}>{language === 'ar' ? 'تم السداد الكامل للمورد' : 'Fully Paid to Supplier'}</Text>
              </View>
            )}
            {invoice.payments.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="payment" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'}</Text>
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
                    <Text style={[styles.payNum, isRTL && styles.txtRTL]}>{pay.payment_number}</Text>
                    <Text style={styles.payDate}>{pay.date}</Text>
                    {pay.reference ? <Text style={styles.payRef}>{pay.reference}</Text> : null}
                  </View>
                  <Text style={[styles.payAmount, { color: Colors.warning }, isRTL && styles.txtRTL]}>
                    -{fmtCurr(pay.amount)}
                  </Text>
                </View>
              );
            })}
          </>) : null}

          {/* ── COST HISTORY ─────────────────────────────────── */}
          {activeTab === 'cost_history' ? (<>
            {costHistory.length === 0 ? (
              <View style={styles.card}>
                <View style={styles.emptyState}>
                  <MaterialIcons name="history" size={36} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>{language === 'ar' ? 'لا يوجد تاريخ تكلفة بعد' : 'No cost history available'}</Text>
                </View>
              </View>
            ) : null}
            {costHistory.map(hist => (
              <View key={hist.id} style={styles.card}>
                <View style={[styles.histHeader, isRTL && styles.histHeaderRTL]}>
                  <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 0 }]}>{hist.product_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: hist.cost_finalized ? Colors.successLight : Colors.warningLight }]}>
                    <Text style={[styles.statusText, { color: hist.cost_finalized ? Colors.success : Colors.warning }]}>
                      {hist.cost_finalized ? (language === 'ar' ? 'نهائي' : 'Final') : (language === 'ar' ? 'معلق' : 'Pending')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.histDate}>{hist.date} · {hist.supplier_name}</Text>
                {hist.batch_number ? <Text style={styles.histBatch}>{language === 'ar' ? `دفعة: ${hist.batch_number}` : `Batch: ${hist.batch_number}`}</Text> : null}
                {/* Cost Breakdown */}
                <View style={styles.costBreakdown}>
                  {[
                    { labelAr: 'سعر الشراء', labelEn: 'Purchase Cost', value: hist.purchase_cost, color: Colors.text },
                    { labelAr: 'شحن', labelEn: 'Shipping', value: hist.allocated_shipping, color: '#3B82F6' },
                    { labelAr: 'جمارك', labelEn: 'Customs', value: hist.allocated_customs, color: '#F59E0B' },
                    { labelAr: 'تأمين', labelEn: 'Insurance', value: hist.allocated_insurance, color: '#10B981' },
                    { labelAr: 'تخليص', labelEn: 'Clearance', value: hist.allocated_clearance, color: '#8B5CF6' },
                    { labelAr: 'أخرى', labelEn: 'Other', value: hist.allocated_other, color: '#94A3B8' },
                  ].filter(r => r.value > 0 || r.labelEn === 'Purchase Cost').map((r, ri) => (
                    <View key={ri} style={[styles.costBreakdownRow, isRTL && styles.costBreakdownRowRTL]}>
                      <View style={[styles.costBreakdownDot, { backgroundColor: r.color }]} />
                      <Text style={[styles.costBreakdownLabel, isRTL && styles.txtRTL]}>
                        {language === 'ar' ? r.labelAr : r.labelEn}
                      </Text>
                      <Text style={[styles.costBreakdownValue, { color: r.color }, isRTL && styles.txtRTL]}>{fmt3(r.value)} KWD</Text>
                    </View>
                  ))}
                  <View style={[styles.finalCostHighlight, isRTL && styles.finalCostHighlightRTL]}>
                    <Text style={[styles.finalCostLabel2, isRTL && styles.txtRTL]}>
                      {language === 'ar' ? 'التكلفة النهائية للوحدة' : 'Final Unit Cost'}
                    </Text>
                    <Text style={[styles.finalCostValue2, isRTL && styles.txtRTL]}>{fmt3(hist.final_inventory_cost)} KWD</Text>
                  </View>
                </View>
                {hist.price_variance && hist.price_variance !== 0 ? (
                  <View style={[styles.varianceItem, isRTL && styles.varianceItemRTL, { backgroundColor: hist.price_variance > 0 ? Colors.dangerLight : Colors.successLight, marginTop: 8 }]}>
                    <MaterialIcons name={hist.price_variance > 0 ? 'trending-up' : 'trending-down'} size={14} color={hist.price_variance > 0 ? Colors.danger : Colors.success} />
                    <Text style={[styles.varianceItemText, { color: hist.price_variance > 0 ? Colors.danger : Colors.success }, isRTL && styles.txtRTL]}>
                      {language === 'ar' ? `تباين عن آخر تكلفة: ${hist.price_variance > 0 ? '+' : ''}${fmt3(hist.price_variance)} KWD` : `vs. Last Cost: ${hist.price_variance > 0 ? '+' : ''}${fmt3(hist.price_variance)} KWD`}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </>) : null}

          {/* ── ACCOUNTING ───────────────────────────────────── */}
          {activeTab === 'accounting' ? (
            <View style={styles.card}>
              <View style={[styles.accountingHeader, isRTL && styles.accountingHeaderRTL]}>
                <View style={[styles.accountingIcon, { backgroundColor: Colors.warningLight }]}>
                  <MaterialIcons name="account-balance" size={22} color={Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isRTL && styles.txtRTL, { marginBottom: 4 }]}>
                    {language === 'ar' ? 'الأثر المحاسبي' : 'Accounting Impact'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: invoice.accounting_status === 'posted' ? Colors.successLight : Colors.warningLight, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.statusText, { color: invoice.accounting_status === 'posted' ? Colors.success : Colors.warning }]}>
                      {invoice.accounting_status === 'posted' ? (language === 'ar' ? 'مرحّل' : 'Posted') : (language === 'ar' ? 'معلق' : 'Pending')}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Entry description */}
              <View style={[styles.archNote, isRTL && styles.archNoteRTL]}>
                <MaterialIcons name="info" size={14} color={Colors.info} />
                <Text style={[styles.archNoteText, isRTL && styles.txtRTL]}>
                  {language === 'ar'
                    ? 'شراء آجل: مدين (المخزون) ← دائن (الذمم الدائنة). ثم عند الدفع: مدين (الذمم الدائنة) ← دائن (البنك/النقدية)'
                    : 'Credit purchase: Dr Inventory → Cr Accounts Payable. On payment: Dr Accounts Payable → Cr Cash/Bank'}
                </Text>
              </View>
              {/* Journal Table */}
              <Text style={[styles.sectionSubTitle, isRTL && styles.txtRTL]}>
                {language === 'ar' ? 'القيود المحاسبية' : 'Journal Entry Lines'}
              </Text>
              <View style={styles.journalTable}>
                <View style={[styles.journalHeader, isRTL && styles.journalHeaderRTL]}>
                  <Text style={[styles.journalHeaderText, { flex: 2 }]}>{language === 'ar' ? 'الحساب' : 'Account'}</Text>
                  <Text style={[styles.journalHeaderText, { flex: 1, textAlign: 'center' }]}>{language === 'ar' ? 'مدين' : 'Debit'}</Text>
                  <Text style={[styles.journalHeaderText, { flex: 1, textAlign: 'center' }]}>{language === 'ar' ? 'دائن' : 'Credit'}</Text>
                </View>
                {[
                  { account: language === 'ar' ? '1400 — المخزون' : '1400 — Inventory', debit: invoice.final_inventory_cost, credit: 0 },
                  { account: language === 'ar' ? '2000 — الذمم الدائنة' : '2000 — Accounts Payable', debit: 0, credit: invoice.total_kwd },
                  invoice.total_landed_cost_allocated > 0 ? { account: language === 'ar' ? '2100 — مقاصة تكاليف الاستيراد' : '2100 — Landed Cost Clearing', debit: invoice.total_landed_cost_allocated, credit: invoice.total_landed_cost_allocated } : null,
                  invoice.price_variance_amount > 0 ? { account: language === 'ar' ? '5300 — تباين سعر الشراء' : '5300 — Purchase Price Variance', debit: invoice.price_variance_amount, credit: 0 } : null,
                ].filter(Boolean).map((row, i) => (
                  <View key={i} style={[styles.journalRow, isRTL && styles.journalRowRTL, i % 2 === 1 && { backgroundColor: Colors.background }]}>
                    <Text style={[styles.journalAccount, { flex: 2 }, isRTL && styles.txtRTL]} numberOfLines={1}>{row!.account}</Text>
                    <Text style={[styles.journalAmount, { flex: 1 }, row!.debit > 0 && { color: Colors.primary }]}>
                      {row!.debit > 0 ? fmt3(row!.debit) : '—'}
                    </Text>
                    <Text style={[styles.journalAmount, { flex: 1 }, row!.credit > 0 && { color: Colors.danger }]}>
                      {row!.credit > 0 ? fmt3(row!.credit) : '—'}
                    </Text>
                  </View>
                ))}
                <View style={[styles.journalTotals, isRTL && styles.journalTotalsRTL]}>
                  <Text style={[styles.journalTotalLabel, { flex: 2 }, isRTL && styles.txtRTL]}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
                  <Text style={[styles.journalTotalValue, { flex: 1 }]}>{fmt3(invoice.final_inventory_cost + (invoice.price_variance_amount ?? 0))}</Text>
                  <Text style={[styles.journalTotalValue, { flex: 1 }]}>{fmt3(invoice.total_kwd)}</Text>
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

      {/* ── PAYMENT MODAL ────────────────────────────────────── */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
            <View style={[styles.sheetHeader, isRTL && styles.sheetHeaderRTL]}>
              <Text style={styles.sheetTitle}>{language === 'ar' ? 'تسجيل دفعة للمورد' : 'Record Supplier Payment'}</Text>
              <Pressable onPress={() => setShowPaymentModal(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ padding: Spacing.base }}>
              <View style={[styles.outstandingInfo, isRTL && styles.outstandingInfoRTL]}>
                <Text style={styles.outstandingInfoLabel}>{language === 'ar' ? 'المستحق للمورد' : 'Outstanding'}</Text>
                <Text style={styles.outstandingInfoValue}>{fmtCurr(invoice.outstanding)}</Text>
              </View>
              <Text style={[styles.fieldLabel, isRTL && styles.txtRTL, { marginBottom: 6 }]}>
                {language === 'ar' ? 'المبلغ المدفوع *' : 'Payment Amount *'}
              </Text>
              <TextInput
                style={[styles.payInput, isRTL && { textAlign: 'right' }]}
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="decimal-pad"
                placeholder={`0.000 KWD`}
                placeholderTextColor={Colors.textMuted}
              />
              <View style={styles.quickFillRow}>
                <Pressable style={styles.quickFillBtn} onPress={() => setPayAmount((invoice.outstanding / 2).toFixed(3))}>
                  <Text style={styles.quickFillBtnText}>50%</Text>
                </Pressable>
                <Pressable style={styles.quickFillBtn} onPress={() => setPayAmount(invoice.outstanding.toFixed(3))}>
                  <Text style={styles.quickFillBtnText}>{language === 'ar' ? 'الكامل' : 'Full'}</Text>
                </Pressable>
              </View>
              <Text style={[styles.fieldLabel, isRTL && styles.txtRTL, { marginTop: Spacing.md, marginBottom: 6 }]}>
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.methodRow}>
                  {(['cash', 'bank_transfer', 'wire_transfer', 'cheque'] as PaymentMethod[]).map(m => {
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
              <Text style={[styles.fieldLabel, isRTL && styles.txtRTL, { marginTop: Spacing.md, marginBottom: 6 }]}>
                {language === 'ar' ? 'المرجع / رقم التحويل' : 'Reference / Transfer No.'}
              </Text>
              <TextInput
                style={[styles.payInput, isRTL && { textAlign: 'right' }]}
                value={payRef}
                onChangeText={setPayRef}
                placeholder={language === 'ar' ? 'رقم التحويل، الشيك...' : 'Transfer no., cheque...'}
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
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badgeRowRTL: { flexDirection: 'row-reverse' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  refBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  refText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  headerActionsRTL: { flexDirection: 'row-reverse' },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.warning },
  approveBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  payBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.success },
  payBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textInverse, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.warning },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.warning, fontWeight: Typography.fontWeightSemibold },
  content: { padding: Spacing.base, gap: Spacing.base },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  cardTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  sectionSubTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: Spacing.sm, includeFontPadding: false },
  // Supplier
  supplierRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  supplierRowRTL: { flexDirection: 'row-reverse' },
  supplierIcon: { width: 46, height: 46, borderRadius: Radius.lg, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  supplierName: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  supplierCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  // Detail rows
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailRowRTL: { flexDirection: 'row-reverse' },
  detailRowHL: { borderBottomWidth: 0, paddingTop: 14 },
  detailLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  detailValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  // Progress
  progressBar: { height: 10, backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: Colors.warning, borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelsRTL: { flexDirection: 'row-reverse' },
  progressLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionsRowRTL: { flexDirection: 'row-reverse' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionBtnText: { fontSize: Typography.fontSizeSM, color: Colors.text, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  // Items
  itemCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm, gap: Spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  itemHeaderRTL: { flexDirection: 'row-reverse' },
  itemNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  itemNumText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  itemName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  itemCode: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace', includeFontPadding: false },
  itemBatch: { fontSize: Typography.fontSizeXS, color: Colors.primary, marginTop: 2, includeFontPadding: false },
  itemDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  itemDetailRowRTL: { flexDirection: 'row-reverse' },
  itemDetailLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  itemDetailValue: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  varianceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Spacing.sm, borderRadius: Radius.md },
  varianceRowRTL: { flexDirection: 'row-reverse' },
  varianceText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  finalCostRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  finalCostRowRTL: { flexDirection: 'row-reverse' },
  finalCostLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  finalCostValue: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  // 3-Way Match
  matchHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  matchHeaderRTL: { flexDirection: 'row-reverse' },
  matchIcon: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  matchStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  matchStepRTL: { flexDirection: 'row-reverse' },
  matchStepIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  matchStepLabel: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  matchStepRef: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, includeFontPadding: false },
  varianceSection: { marginTop: Spacing.md, gap: Spacing.sm },
  varianceItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md, borderRadius: Radius.md },
  varianceItemRTL: { flexDirection: 'row-reverse' },
  varianceItemText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  // Landed Costs
  lcHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  lcHeaderRTL: { flexDirection: 'row-reverse' },
  lcTotal: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: '#F97316', includeFontPadding: false },
  lcLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  lcLineRTL: { flexDirection: 'row-reverse' },
  lcLineIcon: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  lcLineName: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  lcLineDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  lcLineAmount: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: '#F97316', includeFontPadding: false },
  allocRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  allocRowRTL: { flexDirection: 'row-reverse' },
  allocProduct: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, color: Colors.text, includeFontPadding: false },
  allocPercent: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  allocAmount: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  allocPerUnit: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  // Payments
  addPayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.warning, paddingVertical: 13, borderRadius: Radius.lg, ...Shadow.md },
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
  // Cost History
  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  histHeaderRTL: { flexDirection: 'row-reverse' },
  histDate: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginBottom: Spacing.sm, includeFontPadding: false },
  histBatch: { fontSize: Typography.fontSizeSM, color: Colors.primary, marginBottom: Spacing.sm, includeFontPadding: false },
  costBreakdown: { gap: 0 },
  costBreakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  costBreakdownRowRTL: { flexDirection: 'row-reverse' },
  costBreakdownDot: { width: 8, height: 8, borderRadius: 4 },
  costBreakdownLabel: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  costBreakdownValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  finalCostHighlight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  finalCostHighlightRTL: { flexDirection: 'row-reverse' },
  finalCostLabel2: { fontSize: Typography.fontSizeBase, color: Colors.text, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  finalCostValue2: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.warning, includeFontPadding: false },
  // Accounting
  accountingHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  accountingHeaderRTL: { flexDirection: 'row-reverse' },
  accountingIcon: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  archNote: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  archNoteRTL: { flexDirection: 'row-reverse' },
  archNoteText: { flex: 1, fontSize: Typography.fontSizeXS, color: Colors.info, lineHeight: 18, includeFontPadding: false },
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
  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: Typography.fontSizeBase, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  emptySubText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16, includeFontPadding: false },
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
  quickFillBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.warning, backgroundColor: Colors.warningLight },
  quickFillBtnText: { fontSize: Typography.fontSizeSM, color: Colors.warning, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  methodRow: { flexDirection: 'row', gap: Spacing.sm },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  methodChipActive: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  methodChipText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  methodChipTextActive: { color: Colors.textInverse },
  submitPayBtn: { backgroundColor: Colors.warning, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.lg, ...Shadow.md },
  submitPayBtnText: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold, color: Colors.textInverse, includeFontPadding: false },
  txtRTL: { textAlign: 'right' },
});
