import React from 'react';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';

export default function Subscriptions() {
  const { language } = useLanguage();
  return (
    <SuperAdminLayout title={language === 'ar' ? 'الاشتراكات' : 'Subscriptions'}>
      <PlaceholderScreen
        icon="card-membership"
        titleAr="إدارة الاشتراكات"
        titleEn="Subscription Management"
        descAr="متابعة اشتراكات الشركات والباقات المفعلة"
        descEn="Monitor company subscriptions and active plans"
        accentColor="#F59E0B"
      />
    </SuperAdminLayout>
  );
}
