import React from 'react';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';

export default function AIAssistant() {
  const { language } = useLanguage();
  return (
    <CompanyLayout title={language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}>
      <PlaceholderScreen
        icon="auto-awesome"
        titleAr="المساعد المالي الذكي"
        titleEn="AI Financial Assistant"
        descAr="تحليل البيانات المالية، اكتشاف الشذوذات، وتقديم رؤى تجارية ذكية"
        descEn="Analyze financial data, detect anomalies and provide smart business insights"
        accentColor="#67E8F9"
      />
    </CompanyLayout>
  );
}
