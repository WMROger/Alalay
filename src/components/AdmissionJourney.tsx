import {
  ArrowRight,
  Building,
  CheckCircle2,
  Circle,
  Clock3,
  FileWarning,
  Info,
  MapPin,
  Radio,
} from 'lucide-react-native';
import { Href, useRouter } from 'expo-router';
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
  const router = useRouter();
  const visitLog = useStore((state) => state.visitLog);
  const pendingActions = useStore((state) => state.pendingActions);
  const isLive = visitLog.supportsLiveStatus;
  const openActions = pendingActions.filter((action) => (
    action.patientId === visitLog.patientId && action.status === 'open'
  ));

  if (!visitLog.hospitalName || visitLog.admissionSteps.length === 0) return null;

  return (
    <View style={styles.section}>
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

        {openActions.length > 0 && (
          <View style={styles.checkInActions}>
            <Text style={styles.checkInEyebrow}>FROM CHECK-IN</Text>
            <Text style={styles.checkInTitle}>Finish when you’re ready</Text>
            {openActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.checkInActionRow, index > 0 && styles.checkInActionDivider]}
                onPress={() => router.push(`/family-profile?person=${visitLog.patientId}` as Href)}
                activeOpacity={0.76}
                accessibilityRole="button"
                accessibilityLabel={`${action.title}. Review patient profile`}
              >
                <View style={styles.checkInActionIcon}><FileWarning color={COLORS.amber} size={20} /></View>
                <View style={styles.checkInActionCopy}>
                  <Text style={styles.checkInActionTitle}>{action.title}</Text>
                  <Text style={styles.checkInActionDescription}>{action.description}</Text>
                </View>
                <ArrowRight color={COLORS.amber} size={18} />
              </TouchableOpacity>
            ))}
          </View>
        )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { marginTop: 1, marginBottom: 13 },
  section: { marginBottom: 29 },
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
  checkInActions: { backgroundColor: COLORS.amberSoft, borderWidth: 1, borderColor: '#F2D6A6', borderRadius: 16, paddingHorizontal: 12, paddingTop: 12, marginBottom: 18 },
  checkInEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.1, color: COLORS.amber },
  checkInTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#744100', marginTop: 3, marginBottom: 5 },
  checkInActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  checkInActionDivider: { borderTopWidth: 1, borderTopColor: '#F0D7AE' },
  checkInActionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  checkInActionCopy: { flex: 1 },
  checkInActionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: '#744100' },
  checkInActionDescription: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#866338', marginTop: 3 },
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
});
