import React from 'react';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';

export default function Accounting() {
  const { language } = useLanguage();
  return (
    <CompanyLayout title={language === 'ar' ? 'المحاسبة' : 'Accounting'}>
      <PlaceholderScreen
        icon="account-balance"
        titleAr="محرك المحاسبة"
        titleEn="Accounting Engine"
        descAr="دليل الحسابات، القيود اليومية، الميزان، والقوائم المالية"
        descEn="Chart of accounts, journal entries, trial balance and financial statements"
        accentColor="#E879F9"
      />
    </CompanyLayout>
  );
}
