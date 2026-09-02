// Forgot Password Screen
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Pressable
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, isRTL && styles.backBtnRTL]} hitSlop={8}>
            <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.text} />
          </Pressable>

          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="lock-reset" size={40} color={Colors.primary} />
            </View>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('forgotPasswordTitle')}</Text>
            <Text style={[styles.desc, isRTL && styles.textRTL]}>{t('forgotPasswordDesc')}</Text>

            {sent ? (
              <View style={styles.successBox}>
                <MaterialIcons name="check-circle" size={24} color={Colors.success} />
                <Text style={styles.successText}>
                  {isRTL
                    ? 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني'
                    : 'Reset link has been sent to your email'}
                </Text>
              </View>
            ) : (
              <>
                <Input
                  label={t('email')}
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  isRTL={isRTL}
                  leftIcon="email"
                />
                <Button
                  title={t('sendResetLink')}
                  onPress={handleSend}
                  loading={loading}
                  fullWidth
                  size="lg"
                />
              </>
            )}

            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <MaterialIcons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={styles.backLinkText}>{t('backToLogin')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.base, justifyContent: 'center' },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  backBtnRTL: { alignSelf: 'flex-end' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    ...Shadow.lg,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  desc: {
    fontSize: Typography.fontSizeBase,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.successLight,
    padding: Spacing.base,
    borderRadius: Radius.md,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.fontSizeBase,
    flex: 1,
    includeFontPadding: false,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
});
