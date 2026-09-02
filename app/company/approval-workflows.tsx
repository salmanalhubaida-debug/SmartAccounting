// Approval Workflows — Visual workflow builder
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLayout } from '../../components/layout/CompanyLayout';
import { PermissionGuard } from '../../components/feature/PermissionGuard';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { ApprovalWorkflow } from '../../types/permissions';

// Demo workflows
const DEMO_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: 'wf-001',
    company_id: 'company-001',
    name: 'Expense Approval',
    name_ar: 'اعتماد المصروفات',
    module: 'expenses',
    is_active: true,
    steps: [
      { id: 's1', workflow_id: 'wf-001', step_order: 1, name: 'Manager Review', name_ar: 'مراجعة المدير', approver_role: 'company_manager', is_required: true },
      { id: 's2', workflow_id: 'wf-001', step_order: 2, name: 'Accountant Verification', name_ar: 'تحقق المحاسب', approver_role: 'accountant', is_required: true },
    ],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wf-002',
    company_id: 'company-001',
    name: 'Journal Entry Approval',
    name_ar: 'اعتماد القيود اليومية',
    module: 'accounting',
    is_active: true,
    steps: [
      { id: 's3', workflow_id: 'wf-002', step_order: 1, name: 'Senior Review', name_ar: 'مراجعة المحاسب الأول', approver_role: 'accountant', is_required: true },
      { id: 's4', workflow_id: 'wf-002', step_order: 2, name: 'Manager Approval', name_ar: 'اعتماد المدير', approver_role: 'company_manager', is_required: false },
    ],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wf-003',
    company_id: 'company-001',
    name: 'Purchase Order Approval',
    name_ar: 'اعتماد أوامر الشراء',
    module: 'purchases',
    is_active: false,
    steps: [
      { id: 's5', workflow_id: 'wf-003', step_order: 1, name: 'Purchase Manager', name_ar: 'مدير المشتريات', approver_role: 'purchase_employee', is_required: true },
    ],
    created_at: '2024-02-01T00:00:00Z',
  },
];

const MODULE_LABELS_AR: Record<string, string> = {
  expenses: 'المصروفات', accounting: 'المحاسبة', purchases: 'المشتريات',
  sales: 'المبيعات', inventory: 'المخزون',
};

const ROLE_LABELS_AR: Record<string, string> = {
  company_owner: 'صاحب الشركة', company_manager: 'مدير الشركة',
  accountant: 'محاسب', sales_employee: 'موظف مبيعات',
  purchase_employee: 'موظف مشتريات',
};

const STATUS_FLOW = ['draft', 'pending', 'approved', 'rejected', 'posted'];
const STATUS_COLORS: Record<string, string> = {
  draft: Colors.textMuted, pending: Colors.warning,
  approved: Colors.success, rejected: Colors.danger, posted: Colors.primary,
};
const STATUS_LABELS_AR: Record<string, string> = {
  draft: 'مسودة', pending: 'في الانتظار', approved: 'معتمد', rejected: 'مرفوض', posted: 'مرحّل',
};

export default function ApprovalWorkflows() {
  const { language, isRTL } = useLanguage();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(DEMO_WORKFLOWS);
  const [selected, setSelected] = useState<ApprovalWorkflow | null>(null);
  const insets = useSafeAreaInsets();

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w));
  };

  return (
    <CompanyLayout title={language === 'ar' ? 'سير العمل والاعتماد' : 'Approval Workflows'}>
      <PermissionGuard module="settings" action="view">
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Approval status flow visualization */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'حالات الاعتماد' : 'Approval Status Flow'}
            </Text>
            <View style={styles.statusFlow}>
              {STATUS_FLOW.map((status, i) => (
                <React.Fragment key={status}>
                  <View style={styles.statusNode}>
                    <View style={[styles.statusCircle, { backgroundColor: `${STATUS_COLORS[status]}20`, borderColor: STATUS_COLORS[status] }]}>
                      <Text style={[styles.statusCircleText, { color: STATUS_COLORS[status] }]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[styles.statusLabel, { color: STATUS_COLORS[status] }]}>
                      {language === 'ar' ? STATUS_LABELS_AR[status] : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                  {i < STATUS_FLOW.length - 1 ? (
                    <View style={styles.statusArrow}>
                      <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.border} />
                    </View>
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Workflows */}
          <Text style={[styles.sectionHeader, isRTL && styles.textRTL]}>
            {language === 'ar' ? 'مسارات الاعتماد' : 'Workflow Definitions'}
          </Text>

          {workflows.map(wf => (
            <Pressable
              key={wf.id}
              onPress={() => setSelected(wf)}
              style={({ pressed }) => [styles.wfCard, isRTL && styles.wfCardRTL, pressed && { opacity: 0.9 }]}
            >
              {/* Card header */}
              <View style={[styles.wfHeader, isRTL && styles.wfHeaderRTL]}>
                <View style={[styles.wfModuleBadge, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={styles.wfModuleText}>
                    {language === 'ar'
                      ? (MODULE_LABELS_AR[wf.module] ?? wf.module)
                      : wf.module.charAt(0).toUpperCase() + wf.module.slice(1)}
                  </Text>
                </View>
                <View style={[styles.wfRight, isRTL && styles.wfRightRTL]}>
                  <View style={[styles.activeBadge, wf.is_active ? styles.activeBadgeOn : styles.activeBadgeOff]}>
                    <Text style={[styles.activeBadgeText, wf.is_active ? styles.activeBadgeTextOn : styles.activeBadgeTextOff]}>
                      {wf.is_active ? (language === 'ar' ? 'مفعّل' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleWorkflow(wf.id)}
                    style={styles.toggleBtn}
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name={wf.is_active ? 'toggle-on' : 'toggle-off'}
                      size={28}
                      color={wf.is_active ? Colors.success : Colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.wfName, isRTL && styles.textRTL]}>
                {language === 'ar' ? wf.name_ar : wf.name}
              </Text>

              {/* Steps preview */}
              <View style={styles.stepsRow}>
                {wf.steps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <View style={styles.stepNode}>
                      <View style={[styles.stepCircle, { backgroundColor: Colors.primaryLight }]}>
                        <Text style={styles.stepNum}>{i + 1}</Text>
                      </View>
                      <Text style={styles.stepName} numberOfLines={1}>
                        {language === 'ar' ? step.name_ar : step.name}
                      </Text>
                      <Text style={styles.stepRole}>
                        {language === 'ar'
                          ? (ROLE_LABELS_AR[step.approver_role] ?? step.approver_role)
                          : step.approver_role.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    {i < wf.steps.length - 1 ? (
                      <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.border} style={{ marginTop: 8 }} />
                    ) : null}
                  </React.Fragment>
                ))}
              </View>

              <View style={[styles.wfFooter, isRTL && styles.wfFooterRTL]}>
                <Text style={styles.wfFooterText}>
                  {language === 'ar' ? `${wf.steps.length} خطوات` : `${wf.steps.length} steps`}
                  {' · '}
                  {language === 'ar' ? 'انقر للتفاصيل' : 'Tap for details'}
                </Text>
                <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.textMuted} />
              </View>
            </Pressable>
          ))}

          <View style={[styles.futureNote, isRTL && styles.futureNoteRTL]}>
            <MaterialIcons name="rocket-launch" size={16} color={Colors.primary} />
            <Text style={[styles.futureNoteText, isRTL && styles.textRTL]}>
              {language === 'ar'
                ? 'إنشاء وتخصيص مسارات الاعتماد سيكون متاحًا في المرحلة القادمة مع ربطها بعمليات المبيعات والمشتريات'
                : 'Creating and customizing approval workflows will be available in the next phase, linked to sales and purchase operations'}
            </Text>
          </View>
        </ScrollView>
      </PermissionGuard>
    </CompanyLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['3xl'] },

  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemibold, color: Colors.text, marginBottom: Spacing.md, includeFontPadding: false },
  sectionHeader: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },

  statusFlow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  statusNode: { alignItems: 'center', gap: 4 },
  statusCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  statusCircleText: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, includeFontPadding: false },
  statusLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium, includeFontPadding: false },
  statusArrow: { marginBottom: 16 },

  wfCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm,
  },
  wfCardRTL: {},
  wfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wfHeaderRTL: { flexDirection: 'row-reverse' },
  wfModuleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  wfModuleText: { fontSize: Typography.fontSizeSM, color: Colors.primary, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  wfRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  wfRightRTL: { flexDirection: 'row-reverse' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  activeBadgeOn: { backgroundColor: Colors.successLight },
  activeBadgeOff: { backgroundColor: Colors.dangerLight },
  activeBadgeText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, includeFontPadding: false },
  activeBadgeTextOn: { color: Colors.success },
  activeBadgeTextOff: { color: Colors.danger },
  toggleBtn: { padding: 2 },

  wfName: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, includeFontPadding: false },

  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', paddingTop: Spacing.sm },
  stepNode: { alignItems: 'center', gap: 4, maxWidth: 80 },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, color: Colors.primary, includeFontPadding: false },
  stepName: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemibold, color: Colors.text, textAlign: 'center', includeFontPadding: false },
  stepRole: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },

  wfFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  wfFooterRTL: { flexDirection: 'row-reverse' },
  wfFooterText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, includeFontPadding: false },

  futureNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  futureNoteRTL: { flexDirection: 'row-reverse', borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: Colors.primary },
  futureNoteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20, includeFontPadding: false },
  textRTL: { textAlign: 'right' },
});
