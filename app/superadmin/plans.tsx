import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

const PLANS = [
  {
    name: language => language === 'ar' ? 'الباقة الأساسية' : 'Starter',
    priceMonthly: 15, priceYearly: 150,
    maxBranches: 1, maxUsers: 3,
    color: '#10B981',
    features: {
      ar: ['فرع واحد', '3 مستخدمين', 'مبيعات ومشتريات', 'تقارير أساسية'],
      en: ['1 Branch', '3 Users', 'Sales & Purchases', 'Basic Reports'],
    },
  },
  {
    name: language => language === 'ar' ? 'الباقة المتوسطة' : 'Business',
    priceMonthly: 35, priceYearly: 350,
    maxBranches: 3, maxUsers: 10,
    color: '#1B4FD8',
    features: {
      ar: ['3 فروع', '10 مستخدمين', 'جميع الوحدات', 'تقارير متكاملة', 'دعم API'],
      en: ['3 Branches', '10 Users', 'All Modules', 'Full Reports', 'API Support'],
    },
  },
  {
    name: language => language === 'ar' ? 'الباقة المتقدمة' : 'Enterprise',
    priceMonthly: 75, priceYearly: 750,
    maxBranches: 999, maxUsers: 999,
    color: '#7C3AED',
    features: {
      ar: ['فروع غير محدودة', 'مستخدمون غير محدودون', 'ذكاء اصطناعي متكامل', 'دعم مخصص', 'تكاملات متقدمة'],
      en: ['Unlimited Branches', 'Unlimited Users', 'Full AI Integration', 'Dedicated Support', 'Advanced Integrations'],
    },
  },
];

export default function Plans() {
  const { language, isRTL } = useLanguage();

  return (
    <SuperAdminLayout title={language === 'ar' ? 'إدارة الباقات' : 'Plans'}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {PLANS.map((plan, i) => (
          <View key={i} style={[styles.planCard, { borderTopColor: plan.color, borderTopWidth: 4 }]}>
            <View style={[styles.planHeader, isRTL && styles.planHeaderRTL]}>
              <View style={[styles.planIconBg, { backgroundColor: `${plan.color}18` }]}>
                <MaterialIcons name="star" size={24} color={plan.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planName, isRTL && styles.textRTL]}>{plan.name(language)}</Text>
                <Text style={[styles.planLimits, isRTL && styles.textRTL]}>
                  {language === 'ar'
                    ? `${plan.maxBranches === 999 ? 'غير محدود' : plan.maxBranches} فرع · ${plan.maxUsers === 999 ? 'غير محدود' : plan.maxUsers} مستخدم`
                    : `${plan.maxBranches === 999 ? 'Unlimited' : plan.maxBranches} branches · ${plan.maxUsers === 999 ? 'Unlimited' : plan.maxUsers} users`}
                </Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={[styles.price, { color: plan.color }]}>{plan.priceMonthly}</Text>
                <Text style={styles.priceCurrency}>KWD/mo</Text>
              </View>
            </View>
            <View style={styles.featuresList}>
              {(language === 'ar' ? plan.features.ar : plan.features.en).map((f, fi) => (
                <View key={fi} style={[styles.featureRow, isRTL && styles.featureRowRTL]}>
                  <MaterialIcons name="check-circle" size={16} color={plan.color} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <Pressable style={[styles.editBtn, { borderColor: plan.color }]}>
              <MaterialIcons name="edit" size={16} color={plan.color} />
              <Text style={[styles.editBtnText, { color: plan.color }]}>
                {language === 'ar' ? 'تعديل الباقة' : 'Edit Plan'}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SuperAdminLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['3xl'] },
  planCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, gap: Spacing.base, ...Shadow.md,
    overflow: 'hidden',
  },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  planHeaderRTL: { flexDirection: 'row-reverse' },
  planIconBg: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },
  planLimits: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2, includeFontPadding: false },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: Typography.fontSize3XL, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  priceCurrency: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },
  featuresList: { gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureRowRTL: { flexDirection: 'row-reverse' },
  featureText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, includeFontPadding: false },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 10,
  },
  editBtnText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
