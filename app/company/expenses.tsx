import React from 'react';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors } from '../../constants/theme';

export default function Expenses() {
  const { language } = useLanguage();
  return (
    <CompanyLayout title={language === 'ar' ? 'المصروفات' : 'Expenses'}>
      <PlaceholderScreen
        icon="receipt-long"
        titleAr="إدارة المصروفات"
        titleEn="Expense Management"
        descAr="تسجيل المصروفات وتصنيفها ومتابعة الفئات المختلفة"
        descEn="Record, categorize and track all business expenses"
        accentColor={Colors.danger}
      />
    </CompanyLayout>
  );
}
