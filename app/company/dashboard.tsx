// Gulf Embedded Accounting Platform — Company Dashboard
// Architecture: Business Overview + Financial Health + AI Insights
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { StatsCard } from '../../components/feature/StatsCard';
import { BarChart, HorizontalBar } from '../../components/feature/ChartCard';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { DEMO_DASHBOARD, DEMO_SALES_CHART, DEMO_EXPENSES_CHART } from '../../services/mockData';
import {
  DEMO_FINANCIAL_HEALTH, DEMO_INSIGHTS,
} from '../../services/platformData';
import { FinancialHealthScore, BusinessInsight, HealthScoreLevel } from '../../types/platform';

const { width } = Dimensions.get('window');
const isDesktop = width >= 1024;

const PERIODS = [
  { key: 'today',  labelAr: 'اليوم',        labelEn: 'Today'      },
  { key: 'week',   labelAr: 'هذا الأسبوع',  labelEn: 'This Week'  },
  { key: 'month',  labelAr: 'هذا الشهر',    labelEn: 'This Month' },
  { key: 'year',   labelAr: 'هذا العام',    labelEn: 'This Year'  },
];

const TABS = [
  { key: 'overview',  labelAr: 'نظرة عامة',   labelEn: 'Overview',  icon: 'dashboard' },
  { key: 'health',    labelAr: 'الصحة المالية', labelEn: 'Health',   icon: 'favorite' },
  { key: 'insights',  labelAr: 'التحليل الذكي', labelEn: 'AI Insights', icon: 'auto-awesome' },
];

const HEALTH_COLOR: Record<HealthScoreLevel, string> = {
  excellent: '#10B981',
  good:      '#3B82F6',
  fair:      '#F59E0B',
  poor:      '#EF4444',
  critical:  '#DC2626',
};

const HEALTH_LABEL: Record<HealthScoreLevel, { ar: string; en: string }> = {
  excellent: { ar: 'ممتازة',   en: 'Excellent' },
  good:      { ar: 'جيدة',     en: 'Good'      },
  fair:      { ar: 'متوسطة',   en: 'Fair'      },
  poor:      { ar: 'ضعيفة',    en: 'Poor'      },
  critical:  { ar: 'حرجة',     en: 'Critical'  },
};

const INSIGHT_PRIORITY_COLOR: Record<string, string> = {
  critical: Colors.danger,
  high:     Colors.danger,
  medium:   Colors.warning,
  low:      Colors.info,
  positive: Colors.success,
};

export default function CompanyDashboard() {
  const { t, language, isRTL } = useLanguage();
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const data = DEMO_DASHBOARD;

  const fmt = (n: number) =>
    `${n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${data.currency}`;
  const fmtShort = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toFixed(3);
  };

  const profitTrend = data.previousPeriod
    ? ((data.netProfit - data.previousPeriod.netProfit) / data.previousPeriod.netProfit) * 100 : undefined;
  const salesTrend = data.previousPeriod
    ? ((data.totalSales - data.previousPeriod.totalSales) / data.previousPeriod.totalSales) * 100 : undefined;

  const health = DEMO_FINANCIAL_HEALTH;
  const insights = DEMO_INSIGHTS.filter(i => !i.dismissed);
  const criticalInsights = insights.filter(i => i.priority === 'high' || i.priority === 'critical');

  const kpis = [
    { title: t('totalSales'),       value: fmt(data.totalSales),        icon: 'trending-up'             as const, iconColor: Colors.success,   iconBg: Colors.successLight,   trend: salesTrend  },
    { title: t('totalPurchases'),   value: fmt(data.totalPurchases),    icon: 'shopping-cart'           as const, iconColor: Colors.warning,   iconBg: Colors.warningLight                         },
    { title: t('totalExpenses'),    value: fmt(data.totalExpenses),     icon: 'receipt-long'            as const, iconColor: Colors.danger,    iconBg: Colors.dangerLight                          },
    { title: t('netProfit'),        value: fmt(data.netProfit),         icon: 'account-balance-wallet'  as const, iconColor: Colors.primary,   iconBg: Colors.primaryLight,   trend: profitTrend  },
    { title: t('cash'),             value: fmt(data.cashBalance),       icon: 'payments'                as const, iconColor: Colors.info,      iconBg: Colors.infoLight                            },
    { title: t('bankBalance'),      value: fmt(data.bankBalance),       icon: 'account-balance'         as const, iconColor: '#8B5CF6',        iconBg: '#EDE9FE'                                   },
    { title: t('accountsReceivable'), value: fmt(data.accountsReceivable), icon: 'people'              as const, iconColor: '#F59E0B',        iconBg: '#FFFBEB'                                   },
    { title: t('accountsPayable'),  value: fmt(data.accountsPayable),   icon: 'local-shipping'          as const, iconColor: '#EF4444',        iconBg: '#FEF2F2'                                   },
    { title: t('inventoryValue'),   value: fmt(data.inventoryValue),    icon: 'inventory'               as const, iconColor: '#10B981',        iconBg: '#ECFDF5'                                   },
  ];

  return (
    <CompanyLayout title={language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}>
      <View style={styles.root}>
        {/* Header band: period selector + health badge */}
        <View style={[styles.headerBand, isRTL && styles.headerBandRTL]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={[styles.periodsRow, isRTL && styles.periodsRowRTL]}>
              {PERIODS.map(p => (
                <Pressable key={p.key} onPress={() => setPeriod(p.key)}
                  style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}>
                  <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                    {language === 'ar' ? p.labelAr : p.labelEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {/* Health badge */}
          <Pressable onPress={() => setActiveTab('health')}
            style={[styles.healthBadge, { backgroundColor: `${HEALTH_COLOR[health.level]}15`, borderColor: `${HEALTH_COLOR[health.level]}30` }]}>
            <MaterialIcons name="favorite" size={13} color={HEALTH_COLOR[health.level]} />
            <Text style={[styles.healthBadgeScore, { color: HEALTH_COLOR[health.level] }]}>{health.overall_score}</Text>
            <Text style={[styles.healthBadgeLabel, { color: HEALTH_COLOR[health.level] }]}>
              {language === 'ar' ? HEALTH_LABEL[health.level].ar : HEALTH_LABEL[health.level].en}
            </Text>
            {criticalInsights.length > 0 ? (
              <View style={styles.alertDot}><Text style={styles.alertDotText}>{criticalInsights.length}</Text></View>
            ) : null}
          </Pressable>
        </View>

        {/* Tab nav */}
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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── TAB: OVERVIEW ─────────────────────────────────────── */}
          {activeTab === 'overview' ? (<>
            {/* Quick alerts from insights */}
            {criticalInsights.length > 0 ? (
              <View style={[styles.alertBanner, isRTL && styles.alertBannerRTL]}>
                <MaterialIcons name="warning" size={16} color={Colors.danger} />
                <Text style={[styles.alertBannerText, isRTL && styles.textRTL]} numberOfLines={1}>
                  {criticalInsights.length === 1
                    ? (language === 'ar' ? criticalInsights[0].titleAr : criticalInsights[0].titleEn)
                    : (language === 'ar' ? `${criticalInsights.length} تنبيهات تحتاج مراجعة` : `${criticalInsights.length} alerts need attention`)}
                </Text>
                <Pressable onPress={() => setActiveTab('insights')}>
                  <Text style={styles.alertBannerLink}>{language === 'ar' ? 'عرض' : 'View'}</Text>
                </Pressable>
              </View>
            ) : null}

            {/* KPI Grid */}
            <View style={styles.kpiGrid}>
              {kpis.map((kpi, i) => (
                <View key={i} style={styles.kpiItem}>
                  <StatsCard {...kpi} isRTL={isRTL} />
                </View>
              ))}
            </View>

            {/* Charts */}
            <View style={[styles.chartsRow, isDesktop && styles.chartsRowDesktop]}>
              <View style={styles.chartCard}>
                <BarChart data={DEMO_SALES_CHART.map((d, i) => ({ ...d, label: language === 'ar' ? d.label : ['Jan','Feb','Mar','Apr','May','Jun'][i] }))}
                  title={language === 'ar' ? 'المبيعات الشهرية' : 'Monthly Sales'} color={Colors.primary} isRTL={isRTL} />
              </View>
              <View style={styles.chartCard}>
                <HorizontalBar data={DEMO_EXPENSES_CHART.map((d, i) => ({ ...d, label: language === 'ar' ? d.label : ['Salaries','Rent','Utilities','Marketing','Other'][i] }))}
                  title={language === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'} isRTL={isRTL} />
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'آخر النشاطات' : 'Recent Activity'}
              </Text>
              {[
                { icon: 'point-of-sale', textAr: 'فاتورة مبيعات #INV-0234', textEn: 'Sales Invoice #INV-0234', amountAr: '+250.000 د.ك', amountEn: '+KWD 250.000', color: Colors.success },
                { icon: 'shopping-cart', textAr: 'فاتورة شراء #PUR-0089', textEn: 'Purchase Invoice #PUR-0089', amountAr: '-180.500 د.ك', amountEn: '-KWD 180.500', color: Colors.danger },
                { icon: 'receipt-long', textAr: 'مصروف إيجار - يونيو', textEn: 'Rent Expense - June', amountAr: '-1,800.000 د.ك', amountEn: '-KWD 1,800.000', color: Colors.danger },
                { icon: 'payments', textAr: 'تحصيل من عميل: أحمد محمد', textEn: 'Collection from: Ahmad Mohammed', amountAr: '+500.000 د.ك', amountEn: '+KWD 500.000', color: Colors.success },
              ].map((item, i) => (
                <View key={i} style={[styles.activityRow, isRTL && styles.activityRowRTL]}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons name={item.icon as any} size={18} color={Colors.textSecondary} />
                  </View>
                  <Text style={[styles.activityText, { flex: 1 }]} numberOfLines={1}>
                    {language === 'ar' ? item.textAr : item.textEn}
                  </Text>
                  <Text style={[styles.activityAmount, { color: item.color }]}>
                    {language === 'ar' ? item.amountAr : item.amountEn}
                  </Text>
                </View>
              ))}
            </View>
          </>) : null}

          {/* ── TAB: FINANCIAL HEALTH ──────────────────────────────── */}
          {activeTab === 'health' ? (<>
            {/* Score Card */}
            <View style={styles.scoreCard}>
              <View style={[styles.scoreTop, isRTL && styles.scoreTopRTL]}>
                <View style={[styles.scoreCircle, { borderColor: HEALTH_COLOR[health.level] }]}>
                  <Text style={[styles.scoreNum, { color: HEALTH_COLOR[health.level] }]}>{health.overall_score}</Text>
                  <Text style={[styles.scoreMax, { color: HEALTH_COLOR[health.level] }]}>/100</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scoreTitle, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'الصحة المالية' : 'Financial Health'}
                  </Text>
                  <View style={[styles.scoreLevelRow, isRTL && styles.scoreLevelRowRTL]}>
                    <View style={[styles.scoreLevelBadge, { backgroundColor: `${HEALTH_COLOR[health.level]}15` }]}>
                      <Text style={[styles.scoreLevelText, { color: HEALTH_COLOR[health.level] }]}>
                        {language === 'ar' ? HEALTH_LABEL[health.level].ar : HEALTH_LABEL[health.level].en}
                      </Text>
                    </View>
                    <View style={[styles.trendBadge, health.trend === 'improving' ? styles.trendUp : health.trend === 'declining' ? styles.trendDown : styles.trendStable]}>
                      <MaterialIcons
                        name={health.trend === 'improving' ? 'trending-up' : health.trend === 'declining' ? 'trending-down' : 'trending-flat'}
                        size={13}
                        color={health.trend === 'improving' ? Colors.success : health.trend === 'declining' ? Colors.danger : Colors.textMuted}
                      />
                      <Text style={[styles.trendText, {
                        color: health.trend === 'improving' ? Colors.success : health.trend === 'declining' ? Colors.danger : Colors.textMuted,
                      }]}>
                        {health.trend_change > 0 ? '+' : ''}{health.trend_change}
                        {language === 'ar' ? ' نقطة' : ' pts'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.scoreDesc, isRTL && styles.textRTL]}>
                    {language === 'ar'
                      ? 'مبني على تحليل بياناتك المالية الفعلية'
                      : 'Based on analysis of your actual financial data'}
                  </Text>
                </View>
              </View>

              {/* Score bar */}
              <View style={styles.scoreBarContainer}>
                {[
                  { key: 'critical', color: '#DC2626', label: language === 'ar' ? 'حرج' : 'Critical', range: '0-20' },
                  { key: 'poor',     color: '#EF4444', label: language === 'ar' ? 'ضعيف' : 'Poor',     range: '21-40' },
                  { key: 'fair',     color: '#F59E0B', label: language === 'ar' ? 'متوسط' : 'Fair',    range: '41-60' },
                  { key: 'good',     color: '#3B82F6', label: language === 'ar' ? 'جيد' : 'Good',      range: '61-80' },
                  { key: 'excellent',color: '#10B981', label: language === 'ar' ? 'ممتاز' : 'Excellent', range: '81-100' },
                ].map(zone => (
                  <View key={zone.key} style={[styles.scoreZone, { backgroundColor: `${zone.color}25`, borderColor: health.level === zone.key ? zone.color : 'transparent' }]}>
                    <Text style={[styles.scoreZoneText, { color: zone.color }]}>{zone.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Metrics */}
            {health.metrics.map(metric => (
              <View key={metric.key} style={styles.metricCard}>
                <View style={[styles.metricHeader, isRTL && styles.metricHeaderRTL]}>
                  <Text style={[styles.metricName, isRTL && styles.textRTL]}>
                    {language === 'ar' ? metric.nameAr : metric.nameEn}
                  </Text>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.metricValue, { color: HEALTH_COLOR[metric.status] }]}>{metric.value}</Text>
                    <View style={[styles.metricScore, { backgroundColor: `${HEALTH_COLOR[metric.status]}15` }]}>
                      <Text style={[styles.metricScoreText, { color: HEALTH_COLOR[metric.status] }]}>{metric.score}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${metric.score}%`, backgroundColor: HEALTH_COLOR[metric.status] }]} />
                </View>
                <Text style={[styles.metricDesc, isRTL && styles.textRTL]}>
                  {language === 'ar' ? metric.descriptionAr : metric.descriptionEn}
                  {metric.benchmark ? ` (${language === 'ar' ? 'المعيار' : 'Benchmark'}: ${metric.benchmark})` : ''}
                </Text>
              </View>
            ))}

            {/* Health Insights */}
            {health.insights.map((ins, idx) => (
              <View key={idx} style={[styles.insightCard, { borderLeftColor: ins.color }, isRTL && styles.insightCardRTL]}>
                <View style={[styles.insightIconBg, { backgroundColor: `${ins.color}15` }]}>
                  <MaterialIcons name={ins.icon as any} size={20} color={ins.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.insightTitle, isRTL && styles.textRTL]}>
                    {language === 'ar' ? ins.titleAr : ins.titleEn}
                  </Text>
                  <Text style={[styles.insightDesc, isRTL && styles.textRTL]}>
                    {language === 'ar' ? ins.descriptionAr : ins.descriptionEn}
                  </Text>
                </View>
                <View style={[styles.insightPriorityBadge, {
                  backgroundColor: ins.priority === 'high' ? Colors.dangerLight : ins.priority === 'medium' ? Colors.warningLight : Colors.successLight,
                }]}>
                  <Text style={[styles.insightPriorityText, {
                    color: ins.priority === 'high' ? Colors.danger : ins.priority === 'medium' ? Colors.warning : Colors.success,
                  }]}>
                    {ins.priority === 'high' ? (language === 'ar' ? 'عالي' : 'High') :
                      ins.priority === 'medium' ? (language === 'ar' ? 'متوسط' : 'Med') : (language === 'ar' ? 'منخفض' : 'Low')}
                  </Text>
                </View>
              </View>
            ))}
          </>) : null}

          {/* ── TAB: AI INSIGHTS ──────────────────────────────────── */}
          {activeTab === 'insights' ? (<>
            <View style={[styles.aiHeader, isRTL && styles.aiHeaderRTL]}>
              <View style={styles.aiHeaderIconBg}>
                <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiHeaderTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'التحليل المالي الذكي' : 'AI Financial Intelligence'}
                </Text>
                <Text style={[styles.aiHeaderDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'تحليل مبني على بياناتك الفعلية — لا تخمين، لا افتراضات'
                    : 'Analysis built on your actual data — no guessing, no assumptions'}
                </Text>
              </View>
            </View>

            {/* Disclaimer */}
            <View style={[styles.aiDisclaimer, isRTL && styles.aiDisclaimerRTL]}>
              <MaterialIcons name="info" size={14} color={Colors.info} />
              <Text style={[styles.aiDisclaimerText, isRTL && styles.textRTL]}>
                {language === 'ar'
                  ? 'المساعد الذكي يحلل ويوضح فقط. لا يقوم بتعديل أو حذف البيانات المالية.'
                  : 'AI only analyzes and explains. It cannot modify or delete financial data.'}
              </Text>
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginBottom: 8 }]}>
              {language === 'ar' ? 'تحليلات سريعة' : 'Quick Analysis'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.aiActionsRow}>
                {[
                  { ar: 'صافي الربح هذا الشهر؟', en: 'Net profit this month?', icon: 'trending-up' },
                  { ar: 'لماذا انخفض الربح؟', en: 'Why did profit decline?', icon: 'help' },
                  { ar: 'أعلى المصروفات؟', en: 'Top expenses?', icon: 'receipt-long' },
                  { ar: 'العملاء المتأخرون؟', en: 'Overdue customers?', icon: 'people' },
                  { ar: 'المنتجات الأكثر ربحية؟', en: 'Most profitable products?', icon: 'star' },
                  { ar: 'مقارنة الشهر السابق', en: 'vs last month', icon: 'compare' },
                ].map((q, i) => (
                  <Pressable key={i} style={styles.aiQuickBtn}>
                    <MaterialIcons name={q.icon as any} size={14} color={Colors.primary} />
                    <Text style={styles.aiQuickBtnText}>{language === 'ar' ? q.ar : q.en}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Business Insights */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginTop: Spacing.base }]}>
              {language === 'ar' ? `${insights.length} تحليل تلقائي` : `${insights.length} Automated Insights`}
            </Text>
            {insights.map(ins => (
              <View key={ins.id} style={[styles.insightCard, { borderLeftColor: INSIGHT_PRIORITY_COLOR[ins.priority] }, isRTL && styles.insightCardRTL]}>
                <View style={[styles.insightIconBg, { backgroundColor: `${ins.color}15` }]}>
                  <MaterialIcons name={ins.icon as any} size={20} color={ins.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.insightTitleRow, isRTL && styles.insightTitleRowRTL]}>
                    <Text style={[styles.insightTitle, isRTL && styles.textRTL, { flex: 1 }]}>
                      {language === 'ar' ? ins.titleAr : ins.titleEn}
                    </Text>
                    {ins.change_percent != null ? (
                      <Text style={[styles.insightChange, { color: ins.is_positive ? Colors.success : Colors.danger }]}>
                        {ins.change_percent > 0 ? '+' : ''}{ins.change_percent?.toFixed(1)}%
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.insightDesc, isRTL && styles.textRTL]}>
                    {language === 'ar' ? ins.descriptionAr : ins.descriptionEn}
                  </Text>
                  {ins.actionAr || ins.actionEn ? (
                    <Pressable style={[styles.insightAction, isRTL && styles.insightActionRTL]}>
                      <Text style={styles.insightActionText}>{language === 'ar' ? ins.actionAr : ins.actionEn}</Text>
                      <MaterialIcons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={12} color={Colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}

            {/* AI Assistant Teaser */}
            <Pressable style={[styles.aiChatTeaser, isRTL && styles.aiChatTeaserRTL]}>
              <View style={styles.aiChatIconBg}>
                <MaterialIcons name="chat" size={22} color={Colors.textInverse} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiChatTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'اسأل المساعد المالي' : 'Ask the Financial Assistant'}
                </Text>
                <Text style={[styles.aiChatDesc, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? 'اطرح أي سؤال عن بياناتك المالية...'
                    : 'Ask any question about your financial data...'}
                </Text>
              </View>
              <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={22} color={Colors.textInverse} />
            </Pressable>
          </>) : null}

          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </View>
    </CompanyLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerBand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  headerBandRTL: { flexDirection: 'row-reverse' },
  periodsRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingVertical: 2 },
  periodsRowRTL: { flexDirection: 'row-reverse' },
  periodBtn: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  periodTextActive: { color: Colors.textInverse },
  healthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, position: 'relative' },
  healthBadgeScore: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  healthBadgeLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  alertDot: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.surface },
  alertDotText: { fontSize: 9, color: '#FFF', fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, includeFontPadding: false },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeightSemibold },
  content: { padding: Spacing.base, gap: Spacing.base },

  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dangerLight, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  alertBannerRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.danger },
  alertBannerText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.danger, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  alertBannerLink: { fontSize: Typography.fontSizeSM, color: Colors.danger, fontWeight: Typography.fontWeightBold, textDecorationLine: 'underline', includeFontPadding: false },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiItem: { flexBasis: '48%', flexGrow: 1, minWidth: 140 },

  chartsRow: { gap: Spacing.base },
  chartsRowDesktop: { flexDirection: 'row' },
  chartCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.md },

  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  activityRowRTL: { flexDirection: 'row-reverse' },
  activityIcon: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  activityText: { fontSize: Typography.fontSizeSM, color: Colors.text, includeFontPadding: false },
  activityAmount: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },

  // Health score
  scoreCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md, gap: Spacing.md },
  scoreTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base },
  scoreTopRTL: { flexDirection: 'row-reverse' },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  scoreNum: { fontSize: 26, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  scoreMax: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  scoreTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  scoreLevelRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' },
  scoreLevelRowRTL: { flexDirection: 'row-reverse' },
  scoreLevelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  scoreLevelText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  trendUp: { backgroundColor: Colors.successLight },
  trendDown: { backgroundColor: Colors.dangerLight },
  trendStable: { backgroundColor: Colors.background },
  trendText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  scoreDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginTop: 6, includeFontPadding: false },
  scoreBarContainer: { flexDirection: 'row', gap: 4, height: 28 },
  scoreZone: { flex: 1, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  scoreZoneText: { fontSize: 9, fontWeight: Typography.fontWeightBold, includeFontPadding: false },

  metricCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm, gap: 8 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricHeaderRTL: { flexDirection: 'row-reverse' },
  metricName: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  metricValue: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  metricScore: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  metricScoreText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  metricBar: { height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' },
  metricBarFill: { height: '100%', borderRadius: 3 },
  metricDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, lineHeight: 18, includeFontPadding: false },

  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, borderLeftWidth: 3, ...Shadow.sm },
  insightCardRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3 },
  insightIconBg: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  insightTitleRowRTL: { flexDirection: 'row-reverse' },
  insightTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightSemibold, color: Colors.text, includeFontPadding: false },
  insightChange: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  insightDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 20, includeFontPadding: false },
  insightAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  insightActionRTL: { flexDirection: 'row-reverse' },
  insightActionText: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  insightPriorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start' },
  insightPriorityText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold, includeFontPadding: false },

  // AI Tab
  aiHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  aiHeaderRTL: { flexDirection: 'row-reverse' },
  aiHeaderIconBg: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  aiHeaderTitle: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  aiHeaderDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 4, lineHeight: 20, includeFontPadding: false },
  aiDisclaimer: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md },
  aiDisclaimerRTL: { flexDirection: 'row-reverse' },
  aiDisclaimerText: { flex: 1, fontSize: Typography.fontSizeXS, color: Colors.info, lineHeight: 18, includeFontPadding: false },
  aiActionsRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: 4 },
  aiQuickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.surface, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  aiQuickBtnText: { fontSize: Typography.fontSizeSM, color: Colors.text, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  aiChatTeaser: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.md },
  aiChatTeaserRTL: { flexDirection: 'row-reverse' },
  aiChatIconBg: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiChatTitle: { fontSize: Typography.fontSizeBase, fontWeight: Typography.fontWeightBold, color: Colors.textInverse, includeFontPadding: false },
  aiChatDesc: { fontSize: Typography.fontSizeSM, color: 'rgba(255,255,255,0.75)', marginTop: 2, includeFontPadding: false },

  textRTL: { textAlign: 'right' },
});
