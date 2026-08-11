import {
  Briefcase,
  Building,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  HeartHandshake,
  Info,
  MapPin,
  Radio,
  ShieldCheck,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdmissionStepState, useStore } from '../store/useStore';

const COLORS = {
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  amber: '#A85D00',
  amberSoft: '#FFF3DD',
  blue: '#246BCE',
  blueSoft: '#EAF2FF',
};

type FollowUpAction = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  tag: string;
  tone: 'urgent' | 'benefit' | 'support';
};

function StepIcon({ step, live }: { step: AdmissionStepState; live: boolean }) {
  if (step.status === 'done') {
    return <CheckCircle2 color={COLORS.primary} fill={COLORS.primarySoft} size={24} />;
  }
  if (live && step.status === 'current') {
    return <Clock3 color={COLORS.amber} size={23} />;
  }
  return <Circle color="#B5C4C0" size={22} />;
}

export function AdmissionJourney() {
  const visitLog = useStore((state) => state.visitLog);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const isLive = visitLog.supportsLiveStatus;

  const currentStep = useMemo(() => (
    visitLog.admissionSteps.find((step) => step.status === 'current')
      || visitLog.admissionSteps.find((step) => step.status === 'pending')
  ), [visitLog.admissionSteps]);

  const followUpActions = useMemo<FollowUpAction[]>(() => {
    const actions: FollowUpAction[] = [];

    if (currentStep?.id === 'consent_billing') {
      actions.push({
        id: 'billing-arrangement',
        title: isLive ? 'Finish consent and billing arrangement' : 'Ask about consent and billing',
        summary: isLive ? currentStep.location : 'Ask the front desk where the Admitting Section is located.',
        detail: isLive
          ? 'Bring the patient or authorized representative, a valid ID, and any HMO or PhilHealth documents requested by the hospital.'
          : 'The office, floor, and document requirements vary by hospital. Confirm all three with the front desk before leaving the admission area.',
        tag: 'NEEDS YOU',
        tone: 'urgent',
      });
    }

    actions.push(
      {
        id: 'work-absence',
        title: 'Check work-absence support',
        summary: 'You may need an employer, SSS, or GSIS checklist if hospitalization caused missed work.',
        detail: 'Keep the medical certificate or discharge summary, proof of confinement, employment details, and your SSS or GSIS membership information. The applicable benefit and eligibility depend on who was hospitalized and your employment status.',
        tag: 'SUGGESTED',
        tone: 'benefit',
      },
      {
        id: 'medical-cost',
        title: 'Explore help with medical costs',
        summary: 'Review PhilHealth billing assistance and DSWD AICS if the remaining cost is difficult.',
        detail: 'Ask the hospital billing or medical social service desk for the current document list. Programs commonly request a bill or statement of account, medical records, IDs, and proof of financial need.',
        tag: 'SUGGESTED',
        tone: 'support',
      },
    );

    return actions;
  }, [currentStep, isLive]);

  if (!visitLog.hospitalName || visitLog.admissionSteps.length === 0) return null;

  const toggleAction = (id: string) => {
    setExpandedAction((current) => current === id ? null : id);
  };

  return (
    <>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionEyebrow}>CURRENT VISIT</Text>
        <Text style={styles.sectionTitle}>What happens next</Text>
      </View>

      <View style={styles.journeyCard}>
        <View style={styles.journeyHeader}>
          <View style={styles.hospitalIcon}><Building color={COLORS.navy} size={23} /></View>
          <View style={styles.hospitalCopy}>
            <Text style={styles.hospitalName}>{visitLog.hospitalName}</Text>
            <Text style={styles.deskName}>{visitLog.deskName}</Text>
          </View>
          <View style={[styles.modeBadge, !isLive && styles.guideBadge]}>
            {isLive ? <Radio color={COLORS.primary} size={13} /> : <Info color={COLORS.blue} size={13} />}
            <Text style={[styles.modeBadgeText, !isLive && styles.guideBadgeText]}>{isLive ? 'LIVE' : 'GUIDE'}</Text>
          </View>
        </View>

        <View style={[styles.modeNotice, !isLive && styles.guideNotice]}>
          <Text style={[styles.modeNoticeTitle, !isLive && styles.guideNoticeTitle]}>
            {isLive ? 'Updated by participating hospital staff' : 'This hospital does not share live status yet'}
          </Text>
          <Text style={styles.modeNoticeText}>
            {isLive
              ? 'A staff update appears here when they complete a hospital step.'
              : 'These are typical next steps only. Ask the front desk for the correct office and floor.'}
          </Text>
        </View>

        <View style={styles.timeline}>
          {visitLog.admissionSteps.map((step, index) => {
            const isCurrent = isLive && step.status === 'current';
            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <StepIcon step={step} live={isLive} />
                  {index < visitLog.admissionSteps.length - 1 && (
                    <View style={[styles.connector, step.status === 'done' && styles.connectorDone]} />
                  )}
                </View>
                <View style={[styles.stepCopy, isCurrent && styles.stepCopyCurrent]}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTitle, isCurrent && styles.stepTitleCurrent]}>{step.title}</Text>
                    <Text style={[
                      styles.stepStatus,
                      step.status === 'done' && styles.stepStatusDone,
                      isCurrent && styles.stepStatusCurrent,
                    ]}>
                      {step.status === 'done' ? 'Done' : isCurrent ? 'Needs you' : isLive ? 'Waiting' : 'Typical step'}
                    </Text>
                  </View>
                  {(isCurrent || (!isLive && step.status !== 'done')) && (
                    <Text style={styles.stepGuidance}>{step.guidance}</Text>
                  )}
                  {isLive && step.status === 'done' && step.id !== 'check_in' && !!step.updatedAt && (
                    <Text style={styles.stepUpdated}>Updated moments ago by hospital staff</Text>
                  )}
                  {isCurrent && (
                    <View style={styles.locationRow}>
                      <MapPin color={COLORS.amber} size={14} />
                      <Text style={styles.locationText}>{step.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeadingActions}>
        <View>
          <Text style={styles.sectionEyebrow}>PENDING ACTIONS</Text>
          <Text style={styles.sectionTitle}>Things worth checking</Text>
        </View>
        <Text style={styles.actionCount}>{followUpActions.length}</Text>
      </View>

      <View style={styles.actionsCard}>
        {followUpActions.map((action, index) => {
          const expanded = expandedAction === action.id;
          const Icon = action.tone === 'urgent' ? Clock3 : action.tone === 'benefit' ? Briefcase : HeartHandshake;
          const iconStyle = action.tone === 'urgent'
            ? styles.actionIconUrgent
            : action.tone === 'benefit'
              ? styles.actionIconBenefit
              : styles.actionIconSupport;
          const iconColor = action.tone === 'urgent' ? COLORS.amber : action.tone === 'benefit' ? COLORS.blue : COLORS.primary;

          return (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionRow, index > 0 && styles.actionDivider]}
              onPress={() => toggleAction(action.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <View style={[styles.actionIcon, iconStyle]}><Icon color={iconColor} size={20} /></View>
              <View style={styles.actionCopy}>
                <View style={styles.actionTitleRow}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={[styles.actionTag, action.tone === 'urgent' && styles.actionTagUrgent]}>{action.tag}</Text>
                </View>
                <Text style={styles.actionSummary}>{action.summary}</Text>
                {expanded && (
                  <View style={styles.actionDetailBox}>
                    <Text style={styles.actionDetail}>{action.detail}</Text>
                  </View>
                )}
              </View>
              {expanded ? <ChevronUp color={COLORS.muted} size={18} /> : <ChevronDown color={COLORS.muted} size={18} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.honestyNote}>
          <ShieldCheck color={COLORS.primary} size={16} />
          <Text style={styles.honestyText}>Suggestions are based on this hospital visit. Alalay has not checked eligibility or filed an application for you.</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { marginTop: 1, marginBottom: 13 },
  sectionHeadingActions: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 27, marginBottom: 13 },
  sectionEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: COLORS.primary, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 19, color: COLORS.ink },
  journeyCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 24, padding: 17 },
  journeyHeader: { flexDirection: 'row', alignItems: 'center' },
  hospitalIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  hospitalCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  hospitalName: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  deskName: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: 3 },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  guideBadge: { backgroundColor: COLORS.blueSoft },
  modeBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.8, color: COLORS.primary },
  guideBadgeText: { color: COLORS.blue },
  modeNotice: { backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 12, marginTop: 15, marginBottom: 18 },
  guideNotice: { backgroundColor: COLORS.blueSoft },
  modeNoticeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.primary },
  guideNoticeTitle: { color: COLORS.blue },
  modeNoticeText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
  timeline: { paddingHorizontal: 2 },
  stepRow: { flexDirection: 'row', minHeight: 68 },
  stepRail: { width: 34, alignItems: 'center' },
  connector: { width: 2, flex: 1, minHeight: 31, backgroundColor: '#DCE7E3', marginVertical: 3 },
  connectorDone: { backgroundColor: '#9ED6C9' },
  stepCopy: { flex: 1, paddingLeft: 7, paddingRight: 3, paddingBottom: 17 },
  stepCopyCurrent: { backgroundColor: COLORS.amberSoft, borderRadius: 13, padding: 11, marginLeft: 0, marginBottom: 12 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  stepTitle: { flex: 1, fontFamily: 'Sora_600SemiBold', fontSize: 12, lineHeight: 17, color: COLORS.ink },
  stepTitleCurrent: { color: '#744100' },
  stepStatus: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: COLORS.muted, backgroundColor: '#EEF3F1', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 },
  stepStatusDone: { color: COLORS.primary, backgroundColor: COLORS.primarySoft },
  stepStatusCurrent: { color: COLORS.amber, backgroundColor: '#FFFFFF' },
  stepGuidance: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 5 },
  stepUpdated: { fontFamily: 'Inter_500Medium', fontSize: 9, color: COLORS.primary, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  locationText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.amber },
  actionCount: { minWidth: 27, height: 27, borderRadius: 14, backgroundColor: COLORS.primarySoft, color: COLORS.primary, textAlign: 'center', textAlignVertical: 'center', paddingTop: 6, fontFamily: 'Inter_600SemiBold', fontSize: 11, overflow: 'hidden' },
  actionsCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, paddingHorizontal: 15, paddingTop: 3, marginBottom: 29, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 15 },
  actionDivider: { borderTopWidth: 1, borderTopColor: '#E8EFED' },
  actionIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionIconUrgent: { backgroundColor: COLORS.amberSoft },
  actionIconBenefit: { backgroundColor: COLORS.blueSoft },
  actionIconSupport: { backgroundColor: COLORS.primarySoft },
  actionCopy: { flex: 1 },
  actionTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  actionTitle: { flex: 1, fontFamily: 'Sora_600SemiBold', fontSize: 12, lineHeight: 17, color: COLORS.ink },
  actionTag: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.5, color: COLORS.primary, backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 4 },
  actionTagUrgent: { color: COLORS.amber, backgroundColor: COLORS.amberSoft },
  actionSummary: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted, marginTop: 4 },
  actionDetailBox: { backgroundColor: '#F5F8F7', borderRadius: 11, padding: 10, marginTop: 9 },
  actionDetail: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.ink },
  honestyNote: { flexDirection: 'row', gap: 8, backgroundColor: '#F5F8F7', borderTopWidth: 1, borderTopColor: COLORS.line, marginHorizontal: -15, paddingHorizontal: 15, paddingVertical: 12 },
  honestyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted },
});
