// Professional Login Screen
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Pressable,
  Dimensions, Image
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const isLarge = width >= 768;

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { t, language, isRTL, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = t('emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('invalidEmail');
    if (!password.trim()) e.password = t('passwordRequired');
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

    const result = await login(email, password);
    if (!result.success) {
      setErrors({ general: t('invalidCredentials') });
      return;
    }
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Language toggle */}
          <View style={[styles.langRow, isRTL && styles.langRowRTL]}>
            <Pressable onPress={toggleLanguage} style={styles.langBtn} hitSlop={8}>
              <MaterialIcons name="translate" size={16} color={Colors.textInverse} />
              <Text style={styles.langBtnText}>{t('changeLanguage')}</Text>
            </Pressable>
          </View>

          <View style={isLarge ? styles.gridLayout : styles.singleLayout}>
            {/* Hero panel */}
            {isLarge ? (
              <View style={styles.heroPanelLarge}>
                <LinearGradient
                  colors={['#0F1E3C', '#1B4FD8']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.heroContent}>
                  <View style={styles.logoCircle}>
                    <MaterialIcons name="account-balance" size={36} color={Colors.textInverse} />
                  </View>
                  <Text style={styles.heroTitle}>{t('appName')}</Text>
                  <Text style={styles.heroTagline}>{t('tagline')}</Text>
                  <View style={styles.heroFeatures}>
                    {[
                      { icon: 'business', textAr: 'إدارة شركات متعددة', textEn: 'Multi-Company Management' },
                      { icon: 'bar-chart', textAr: 'تقارير مالية متكاملة', textEn: 'Integrated Financial Reports' },
                      { icon: 'psychology', textAr: 'مساعد ذكاء اصطناعي', textEn: 'AI-Powered Assistant' },
                      { icon: 'security', textAr: 'أمان وحماية عالية', textEn: 'Enterprise Security' },
                    ].map((f, i) => (
                      <View key={i} style={[styles.featureRow, isRTL && styles.featureRowRTL]}>
                        <View style={styles.featureDot}>
                          <MaterialIcons name={f.icon as any} size={16} color={Colors.primary} />
                        </View>
                        <Text style={styles.featureText}>
                          {language === 'ar' ? f.textAr : f.textEn}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              // Mobile hero
              <View style={styles.mobileHero}>
                <LinearGradient
                  colors={['#0F1E3C', '#1B4FD8']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.mobileHeroContent}>
                  <View style={styles.logoCircle}>
                    <MaterialIcons name="account-balance" size={28} color={Colors.textInverse} />
                  </View>
                  <Text style={styles.mobileHeroTitle}>{t('appName')}</Text>
                  <Text style={styles.mobileHeroSubtitle}>{t('tagline')}</Text>
                </View>
              </View>
            )}

            {/* Login Card */}
            <View style={[styles.loginCard, isLarge && styles.loginCardLarge]}>
              <Text style={[styles.loginTitle, isRTL && styles.textRTL]}>{t('login')}</Text>
              <Text style={[styles.loginSubtitle, isRTL && styles.textRTL]}>
                {language === 'ar'
                  ? 'أدخل بياناتك للوصول إلى حسابك'
                  : 'Enter your credentials to access your account'}
              </Text>

              {/* Demo hint */}
              <View style={[styles.demoHint, isRTL && styles.demoHintRTL]}>
                <MaterialIcons name="info" size={14} color={Colors.info} />
                <Text style={styles.demoText}>
                  {language === 'ar'
                    ? 'تجريبي: admin@smartaccounting.io | 123456'
                    : 'Demo: admin@smartaccounting.io | 123456'}
                </Text>
              </View>

              {errors.general ? (
                <View style={styles.generalError}>
                  <MaterialIcons name="error" size={16} color={Colors.error} />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              ) : null}

              <Input
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
                isRTL={isRTL}
                leftIcon="email"
              />
              <Input
                label={t('password')}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                isRTL={isRTL}
                leftIcon="lock"
              />

              {/* Remember me + Forgot */}
              <View style={[styles.optionsRow, isRTL && styles.optionsRowRTL]}>
                <Pressable
                  onPress={() => setRememberMe(p => !p)}
                  style={[styles.checkRow, isRTL && styles.checkRowRTL]}
                  hitSlop={8}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe ? (
                      <MaterialIcons name="check" size={12} color={Colors.textInverse} />
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>{t('rememberMe')}</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
                  <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                </Pressable>
              </View>

              <Button
                title={t('loginButton')}
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.loginBtn}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sidebar },
  scroll: { flexGrow: 1, minHeight: height },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.base },
  langRowRTL: { flexDirection: 'row-reverse' },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  langBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },

  // Mobile hero
  mobileHero: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mobileHeroContent: { alignItems: 'center', zIndex: 1 },
  mobileHeroTitle: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    marginTop: Spacing.md,
    includeFontPadding: false,
  },
  mobileHeroSubtitle: {
    fontSize: Typography.fontSizeBase,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 6,
    includeFontPadding: false,
  },

  // Layouts
  singleLayout: { flex: 1 },
  gridLayout: { flex: 1, flexDirection: 'row' },

  // Large hero panel
  heroPanelLarge: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing['3xl'],
    overflow: 'hidden',
  },
  heroContent: { zIndex: 1 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: Typography.fontSize4XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    marginBottom: 8,
    includeFontPadding: false,
  },
  heroTagline: {
    fontSize: Typography.fontSizeLG,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing['2xl'],
    lineHeight: 28,
    includeFontPadding: false,
  },
  heroFeatures: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureRowRTL: { flexDirection: 'row-reverse' },
  featureDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },

  // Login Card
  loginCard: {
    backgroundColor: Colors.background,
    padding: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    ...Shadow.lg,
  },
  loginCardLarge: {
    width: 460,
    maxWidth: 460,
    borderRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    flex: 0,
  },
  loginTitle: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 6,
    includeFontPadding: false,
  },
  loginSubtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },

  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
  },
  demoHintRTL: { flexDirection: 'row-reverse' },
  demoText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.info,
    flex: 1,
    includeFontPadding: false,
  },

  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
  },
  generalErrorText: {
    color: Colors.error,
    fontSize: Typography.fontSizeSM,
    flex: 1,
    includeFontPadding: false,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  optionsRowRTL: { flexDirection: 'row-reverse' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkRowRTL: { flexDirection: 'row-reverse' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  forgotText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.primary,
    fontWeight: Typography.fontWeightMedium,
    includeFontPadding: false,
  },
  loginBtn: { marginTop: 4 },
});
