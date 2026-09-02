import React from 'react';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';

export default function Reports() {
  const { language } = useLanguage();
  return (
    <CompanyLayout title={language === 'ar' ? 'التقارير' : 'Reports'}>
      <PlaceholderScreen
        icon="bar-chart"
        titleAr="التقارير المالية"
        titleEn="Financial Reports"
        descAr="قائمة الدخل، الميزانية العمومية، التدفقات النقدية والتقارير التحليلية"
        descEn="Income statement, balance sheet, cash flow and analytical reports"
        accentColor="#FCD34D"
      />
    </CompanyLayout>
  );
}
