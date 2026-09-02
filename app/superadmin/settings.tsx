import React from 'react';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { PlaceholderScreen } from '../../components/feature/PlaceholderScreen';
import { useLanguage } from '../../hooks/useLanguage';

export default function SystemSettings() {
  const { language } = useLanguage();
  return (
    <SuperAdminLayout title={language === 'ar' ? 'إعدادات النظام' : 'System Settings'}>
      <PlaceholderScreen
        icon="tune"
        titleAr="إعدادات النظام العامة"
        titleEn="System Settings"
        descAr="إعدادات المنصة العامة، الإشعارات، البريد الإلكتروني والأمان"
        descEn="Global platform settings, notifications, email and security"
        accentColor="#64748B"
      />
    </SuperAdminLayout>
  );
}
