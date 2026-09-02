// Company + Branch Switcher — header component for multi-company users
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal,
  FlatList, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { Company, Branch } from '../../types/database';

export const CompanySwitcher: React.FC = () => {
  const { user } = useAuth();
  const { activeCompany, activeBranch, companies, branches, switchCompany, switchBranch } = useCompany();
  const { language, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'company' | 'branch'>('company');

  // Only show for super_admin or users with multiple companies
  const showCompanySwitch = user?.role === 'super_admin';
  const showBranchSwitch = !!activeCompany && branches.length > 1;

  if (!showCompanySwitch && !showBranchSwitch) return null;

  const companyName = activeCompany
    ? (language === 'ar' ? activeCompany.name_ar : activeCompany.name)
    : (language === 'ar' ? 'اختر شركة' : 'Select Company');

  const branchName = activeBranch
    ? (language === 'ar' ? (activeBranch.name_ar ?? activeBranch.name) : activeBranch.name)
    : (language === 'ar' ? 'جميع الفروع' : 'All Branches');

  const handleCompanySelect = (company: Company) => {
    switchCompany(company.id);
    setStep('branch');
  };

  const handleBranchSelect = (branch: Branch | null) => {
    switchBranch(branch?.id ?? null);
    setModalVisible(false);
    setStep('company');
  };

  return (
    <>
      <Pressable
        onPress={() => { setModalVisible(true); setStep(showCompanySwitch ? 'company' : 'branch'); }}
        style={[styles.trigger, isRTL && styles.triggerRTL]}
        hitSlop={4}
      >
        <View style={styles.triggerInfo}>
          <Text style={[styles.triggerCompany, isRTL && styles.textRTL]} numberOfLines={1}>
            {companyName}
          </Text>
          <Text style={[styles.triggerBranch, isRTL && styles.textRTL]} numberOfLines={1}>
            {branchName}
          </Text>
        </View>
        <MaterialIcons name="unfold-more" size={16} color={Colors.textMuted} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <View
            style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.base }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={[styles.sheetHeader, isRTL && styles.sheetHeaderRTL]}>
              {step === 'branch' && showCompanySwitch ? (
                <Pressable onPress={() => setStep('company')} hitSlop={8} style={styles.backBtn}>
                  <MaterialIcons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={Colors.text} />
                </Pressable>
              ) : null}
              <Text style={styles.sheetTitle}>
                {step === 'company'
                  ? (language === 'ar' ? 'اختر الشركة' : 'Select Company')
                  : (language === 'ar' ? 'اختر الفرع' : 'Select Branch')}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {step === 'company' ? (
                <View style={styles.listContent}>
                  {companies.map(company => (
                    <Pressable
                      key={company.id}
                      onPress={() => handleCompanySelect(company)}
                      style={[
                        styles.listItem,
                        isRTL && styles.listItemRTL,
                        activeCompany?.id === company.id && styles.listItemActive,
                      ]}
                    >
                      <View style={styles.companyAvatar}>
                        <Text style={styles.companyAvatarText}>
                          {(language === 'ar' ? company.name_ar : company.name).charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listItemName, isRTL && styles.textRTL]}>
                          {language === 'ar' ? company.name_ar : company.name}
                        </Text>
                        <Text style={[styles.listItemSub, isRTL && styles.textRTL]}>
                          {company.currency} · {company.country}
                        </Text>
                      </View>
                      {activeCompany?.id === company.id ? (
                        <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.listContent}>
                  {/* All branches option */}
                  <Pressable
                    onPress={() => handleBranchSelect(null)}
                    style={[styles.listItem, isRTL && styles.listItemRTL, !activeBranch && styles.listItemActive]}
                  >
                    <View style={[styles.branchIcon, { backgroundColor: Colors.primaryLight }]}>
                      <MaterialIcons name="business" size={18} color={Colors.primary} />
                    </View>
                    <Text style={[styles.listItemName, { flex: 1 }, isRTL && styles.textRTL]}>
                      {language === 'ar' ? 'جميع الفروع' : 'All Branches'}
                    </Text>
                    {!activeBranch ? <MaterialIcons name="check-circle" size={20} color={Colors.primary} /> : null}
                  </Pressable>

                  {branches.map(branch => (
                    <Pressable
                      key={branch.id}
                      onPress={() => handleBranchSelect(branch)}
                      style={[
                        styles.listItem,
                        isRTL && styles.listItemRTL,
                        activeBranch?.id === branch.id && styles.listItemActive,
                        branch.status === 'inactive' && styles.listItemDisabled,
                      ]}
                      disabled={branch.status === 'inactive'}
                    >
                      <View style={[styles.branchIcon, branch.is_main && { backgroundColor: Colors.primaryLight }]}>
                        <MaterialIcons
                          name={branch.is_main ? 'home-work' : 'store'}
                          size={18}
                          color={branch.is_main ? Colors.primary : Colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listItemName, isRTL && styles.textRTL, branch.status === 'inactive' && styles.disabledText]}>
                          {language === 'ar' ? (branch.name_ar ?? branch.name) : branch.name}
                        </Text>
                        {branch.code ? (
                          <Text style={[styles.listItemSub, isRTL && styles.textRTL]}>
                            {branch.code}
                            {branch.status === 'inactive' ? ` · ${language === 'ar' ? 'موقوف' : 'Inactive'}` : ''}
                          </Text>
                        ) : null}
                      </View>
                      {activeBranch?.id === branch.id ? (
                        <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  triggerRTL: { flexDirection: 'row-reverse' },
  triggerInfo: { flex: 1 },
  triggerCompany: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.text,
    includeFontPadding: false,
  },
  triggerBranch: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    includeFontPadding: false,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '70%',
    ...Shadow.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  sheetHeaderRTL: { flexDirection: 'row-reverse' },
  sheetTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  backBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
  },

  listContent: { padding: Spacing.base, gap: Spacing.sm },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  listItemRTL: { flexDirection: 'row-reverse' },
  listItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  listItemDisabled: { opacity: 0.5 },

  companyAvatar: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    includeFontPadding: false,
  },
  branchIcon: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },

  listItemName: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.text,
    includeFontPadding: false,
  },
  listItemSub: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  disabledText: { color: Colors.textMuted },
  textRTL: { textAlign: 'right' },
});
