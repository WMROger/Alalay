import { Href, useRouter } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  FileText,
  FlaskConical,
  HeartHandshake,
  MapPin,
  Plus,
  QrCode,
  Radio,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomNav } from '../components/AppBottomNav';
import { useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  aqua: '#80D7C5',
  blue: '#246BCE',
  blueSoft: '#EAF2FF',
  amber: '#AD6500',
  amberSoft: '#FFF3DD',
  purple: '#7655B5',
  purpleSoft: '#F1ECFB',
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBackground: string;
  onPress: () => void;
  wide: boolean;
}

function QuickAction({ title, description, icon, iconBackground, onPress, wide }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, wide && styles.quickActionWide]}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={[styles.quickIcon, { backgroundColor: iconBackground }]}>{icon}</View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const visitLog = useStore((state) => state.visitLog);
  const activePatientId = useStore((state) => state.activePatientId);
  const setActivePatient = useStore((state) => state.setActivePatient);

  const firstName = masterProfile.firstName || 'Juan';
  const profileChecks = [
    masterProfile.firstName,
    masterProfile.lastName,
    masterProfile.dateOfBirth,
    masterProfile.sex,
    masterProfile.contactNumber,
    masterProfile.philhealthId,
    masterProfile.address.street,
    masterProfile.emergencyContact.name,
    masterProfile.emergencyContact.phone,
  ];
  const completedChecks = profileChecks.filter(Boolean).length;
  const completion = Math.round((completedChecks / profileChecks.length) * 100);
  const hasStarted = completedChecks > 0;
  const isReady = completion === 100;
  const selectedBeneficiary = beneficiaries.find((beneficiary) => beneficiary.id === activePatientId);
  const hasSelectedVisit = visitLog.patientId === activePatientId
    && Boolean(visitLog.hospitalName)
    && visitLog.admissionSteps.length > 0;
  const previewStep = hasSelectedVisit
    ? visitLog.admissionSteps.find((step) => step.status === 'current')
      || visitLog.admissionSteps.find((step) => step.status === 'pending')
      || visitLog.admissionSteps[visitLog.admissionSteps.length - 1]
    : null;
  const totalJourneySteps = hasSelectedVisit ? visitLog.admissionSteps.length : 3;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isWide && styles.contentWide, { paddingBottom: Math.max(52, insets.bottom + 36) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <ShieldCheck color={COLORS.primary} size={17} />
              <Text style={styles.brand}>ALALAY</Text>
            </View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subGreeting}>Let’s get you hospital-ready.</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/benefits' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Notifications, one unread"
          >
            <Bell color={COLORS.navy} size={22} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {!isReady && <View style={styles.formCard}>
          <View style={styles.formTopRow}>
            <View style={[styles.formBadge, isReady && styles.formBadgeReady]}>
              {isReady && <CheckCircle2 color="#FFFFFF" size={14} />}
              <Text style={styles.formBadgeText}>{isReady ? 'READY' : 'PRE-ADMISSION'}</Text>
            </View>
            <ClipboardCheck color={COLORS.aqua} size={27} />
          </View>

          <Text style={styles.formTitle}>
            {isReady ? 'Your pre-admission profile is ready.' : hasStarted ? 'Continue your pre-admission form.' : 'Complete your pre-admission form.'}
          </Text>
          <Text style={styles.formDescription}>
            Fill it out once, review before sharing, and spend less time repeating details at the hospital.
          </Text>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{isReady ? 'Profile complete' : 'Profile progress'}</Text>
            <Text style={styles.progressValue}>{completion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.formButton}
            onPress={() => router.push((isReady ? '/profile' : '/onboarding') as Href)}
            activeOpacity={0.84}
            accessibilityRole="button"
          >
            <Text style={styles.formButtonText}>{isReady ? 'Review profile' : hasStarted ? 'Continue form' : 'Start form'}</Text>
            <ArrowRight color={COLORS.navy} size={19} />
          </TouchableOpacity>
        </View>}

        <View style={styles.nextSectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>{hasSelectedVisit ? 'CURRENT VISIT' : 'HOSPITAL PREPARATION'}</Text>
            <Text style={styles.sectionTitle}>What happens next</Text>
          </View>
          <Text style={styles.nextCount}>{totalJourneySteps}</Text>
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextCardHeader}>
            <View style={styles.nextHospitalIcon}>
              {hasSelectedVisit ? <Building2 color={COLORS.navy} size={22} /> : <ClipboardCheck color={COLORS.navy} size={22} />}
            </View>
            <View style={styles.nextHospitalCopy}>
              <Text style={styles.nextHospitalName}>{hasSelectedVisit ? visitLog.hospitalName : `Preparing for ${selectedBeneficiary?.firstName || firstName}`}</Text>
              <Text style={styles.nextHospitalMeta}>{hasSelectedVisit ? visitLog.deskName : 'Nothing is shared until you approve'}</Text>
            </View>
            <View style={styles.nextModeBadge}>
              {hasSelectedVisit && visitLog.supportsLiveStatus
                ? <Radio color={COLORS.primary} size={13} />
                : <Clock3 color={COLORS.primary} size={13} />}
              <Text style={styles.nextModeText}>{hasSelectedVisit && visitLog.supportsLiveStatus ? 'LIVE' : 'GUIDE'}</Text>
            </View>
          </View>

          <View style={styles.nextNotice}>
            <Text style={styles.nextNoticeTitle}>
              {hasSelectedVisit && visitLog.supportsLiveStatus
                ? 'Updated by participating hospital staff'
                : 'A simple guide for your next hospital step'}
            </Text>
            <Text style={styles.nextNoticeText}>
              {hasSelectedVisit && visitLog.supportsLiveStatus
                ? 'A staff update appears here when they complete a hospital step.'
                : 'Review the patient profile before scanning the hospital desk QR.'}
            </Text>
          </View>

          <View style={[styles.nextStepPreview, previewStep?.status === 'current' && styles.nextStepCurrent]}>
            <View style={styles.nextStepRail}>
              {previewStep?.status === 'done'
                ? <CheckCircle2 color={COLORS.primary} size={23} />
                : previewStep?.status === 'current'
                  ? <Clock3 color={COLORS.amber} size={23} />
                  : <Circle color={hasSelectedVisit ? '#AEBDB9' : COLORS.blue} size={22} />}
            </View>
            <View style={styles.nextStepCopy}>
              <View style={styles.nextStepTitleRow}>
                <Text style={[styles.nextStepTitle, previewStep?.status === 'current' && styles.nextStepTitleCurrent]} numberOfLines={2}>
                  {previewStep?.title || 'Choose the patient profile'}
                </Text>
                <Text style={[styles.nextStepStatus, previewStep?.status === 'current' && styles.nextStepStatusCurrent]}>
                  {previewStep?.status === 'done' ? 'DONE' : previewStep?.status === 'current' ? 'NEEDS YOU' : hasSelectedVisit ? 'WAITING' : 'NEXT'}
                </Text>
              </View>
              <Text style={styles.nextStepGuidance} numberOfLines={2}>
                {previewStep?.guidance || `Open ${selectedBeneficiary?.firstName || firstName}'s profile to review documents before check-in.`}
              </Text>
              {!!previewStep?.location && previewStep.status === 'current' && (
                <View style={styles.nextStepLocation}>
                  <MapPin color={COLORS.amber} size={13} />
                  <Text style={styles.nextStepLocationText}>{previewStep.location}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.nextSeeMore} onPress={() => router.push('/admission')} accessibilityRole="button">
            <Text style={styles.nextSeeMoreText}>{hasSelectedVisit ? `See all ${totalJourneySteps} steps and actions` : 'See the full preparation guide'}</Text>
            <ArrowRight color={COLORS.primary} size={17} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionEyebrow}>FAMILY</Text>
            <Text style={styles.sectionTitle}>Choose who you’re preparing for</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/family' as Href)} accessibilityRole="button">
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.peopleRow}
        >
          <TouchableOpacity
            style={[styles.personCard, activePatientId === 'self' && styles.personCardSelected]}
            onPress={() => setActivePatient('self')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Select ${firstName} for admission`}
          >
            <View style={styles.personTopRow}>
              <View style={styles.personAvatar}><Text style={styles.personInitial}>{firstName.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.qrMini}><QrCode color={COLORS.primary} size={17} /></View>
            </View>
            <Text style={styles.personName} numberOfLines={1}>{firstName}</Text>
            <Text style={styles.personRelationship}>My profile</Text>
            <Text style={styles.personStatus}>{activePatientId === 'self' ? 'Selected' : masterProfile.philhealthId ? 'QR ready' : 'Complete profile'}</Text>
          </TouchableOpacity>

          {beneficiaries.slice(0, 3).map((beneficiary) => (
            <TouchableOpacity
              key={beneficiary.id}
              style={[styles.personCard, activePatientId === beneficiary.id && styles.personCardSelected]}
              onPress={() => setActivePatient(beneficiary.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Select ${beneficiary.firstName} for admission`}
            >
              <View style={styles.personTopRow}>
                <View style={[styles.personAvatar, styles.personAvatarAlt]}>
                  <Text style={[styles.personInitial, styles.personInitialAlt]}>{beneficiary.firstName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.qrMini}><QrCode color={COLORS.primary} size={17} /></View>
              </View>
              <Text style={styles.personName} numberOfLines={1}>{beneficiary.firstName}</Text>
              <Text style={styles.personRelationship} numberOfLines={1}>{beneficiary.relationship}</Text>
              <Text style={styles.personStatus}>{activePatientId === beneficiary.id ? 'Selected' : beneficiary.pin ? 'QR ready' : 'Needs PIN'}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.personCard, styles.addPersonCard]}
            onPress={() => router.push('/family?add=1' as Href)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add beneficiary"
          >
            <View style={styles.addPersonIcon}><Plus color={COLORS.primary} size={24} /></View>
            <Text style={styles.addPersonTitle}>Add person</Text>
            <Text style={styles.addPersonText}>Prepare for someone you assist.</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.askAlalayCard, isWide && styles.askAlalayCardWide]}>
          <View style={[styles.askAlalayIcon, isWide && styles.askAlalayIconWide]}>
            <Sparkles color="#FFFFFF" size={23} />
          </View>
          <View style={styles.askAlalayCopy}>
            <Text style={styles.askAlalayEyebrow}>ASK ALALAY</Text>
            <Text style={styles.askAlalayTitle}>Not sure where to start?</Text>
            <Text style={styles.askAlalayText}>Describe what you need and Alalay will route you to the right feature.</Text>
          </View>
          <TouchableOpacity
            style={[styles.askAlalayButton, isWide && styles.askAlalayButtonWide]}
            onPress={() => router.push('/ask-alalay' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Ask Alalay a question"
          >
            <Text style={styles.askAlalayButtonText}>{isWide ? 'Ask a question' : 'Ask'}</Text>
            <ArrowRight color="#FFFFFF" size={17} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionEyebrow}>QUICK ACTIONS</Text>
          <Text style={styles.sectionTitle}>Features</Text>
        </View>

        <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
          <QuickAction
            wide={isWide}
            title="Hospital bill"
            description="Understand charges"
            iconBackground={COLORS.amberSoft}
            icon={<ReceiptText color={COLORS.amber} size={23} />}
            onPress={() => router.push('/scan-doc?type=bill')}
          />
          <QuickAction
            wide={isWide}
            title="Lab result"
            description="Explain test values"
            iconBackground={COLORS.blueSoft}
            icon={<FlaskConical color={COLORS.blue} size={23} />}
            onPress={() => router.push('/scan-doc?type=lab')}
          />
          <QuickAction
            wide={isWide}
            title="Health benefits"
            description="Benefits and reminders"
            iconBackground={COLORS.blueSoft}
            icon={<HeartHandshake color={COLORS.blue} size={23} />}
            onPress={() => router.push('/benefits' as Href)}
          />
          <QuickAction
            wide={isWide}
            title="Documents"
            description="View patient files"
            iconBackground={COLORS.primarySoft}
            icon={<FileText color={COLORS.primary} size={23} />}
            onPress={() => router.push('/documents' as Href)}
          />
          <QuickAction
            wide={isWide}
            title="Check-in"
            description={visitLog.hospitalName ? 'View recent visit' : 'Admission overview'}
            iconBackground={COLORS.purpleSoft}
            icon={<UsersRound color={COLORS.purple} size={23} />}
            onPress={() => router.push('/admission')}
          />
        </View>

        <Text style={styles.privacyNote}>Nothing is shared with a hospital until you review and approve its request.</Text>
      </ScrollView>

      <AppBottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 960, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34 },
  contentWide: { paddingHorizontal: 38, paddingTop: 28, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  brand: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.7, color: COLORS.primary },
  greeting: { fontFamily: 'Sora_700Bold', fontSize: 25, lineHeight: 31, color: COLORS.ink },
  subGreeting: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.muted, marginTop: 2 },
  notificationButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E05252', borderWidth: 2, borderColor: '#FFFFFF' },

  nextSectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, marginBottom: 13 },
  nextCount: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primarySoft, color: COLORS.primary, textAlign: 'center', textAlignVertical: 'center', paddingTop: 6, fontFamily: 'Inter_600SemiBold', fontSize: 11, overflow: 'hidden' },
  nextCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 23, padding: 16, marginBottom: 28 },
  nextCardHeader: { flexDirection: 'row', alignItems: 'center' },
  nextHospitalIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF3F1' },
  nextHospitalCopy: { flex: 1, marginLeft: 11, marginRight: 8 },
  nextHospitalName: { fontFamily: 'Sora_600SemiBold', fontSize: 13, lineHeight: 17, color: COLORS.ink },
  nextHospitalMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted, marginTop: 3 },
  nextModeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  nextModeText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.7, color: COLORS.primary },
  nextNotice: { backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 11, marginTop: 14 },
  nextNoticeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary },
  nextNoticeText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted, marginTop: 3 },
  nextStepPreview: { minHeight: 82, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#E4ECE9', borderRadius: 16, padding: 12, marginTop: 13 },
  nextStepCurrent: { backgroundColor: COLORS.amberSoft, borderColor: '#F2D6A6' },
  nextStepRail: { width: 28, alignItems: 'center', paddingTop: 1 },
  nextStepCopy: { flex: 1 },
  nextStepTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  nextStepTitle: { flex: 1, fontFamily: 'Sora_600SemiBold', fontSize: 12, lineHeight: 17, color: COLORS.ink },
  nextStepTitleCurrent: { color: '#744100' },
  nextStepStatus: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.45, color: COLORS.muted, backgroundColor: '#EDF2F0', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 5 },
  nextStepStatusCurrent: { color: COLORS.amber, backgroundColor: '#FFFFFF' },
  nextStepGuidance: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted, marginTop: 5 },
  nextStepLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  nextStepLocationText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 9, color: COLORS.amber },
  nextSeeMore: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.primarySoft, borderRadius: 14, marginTop: 12 },
  nextSeeMoreText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.primary },

  formCard: { backgroundColor: COLORS.navy, borderRadius: 27, padding: 22, marginBottom: 29, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 7 },
  formTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 },
  formBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#315565', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  formBadgeReady: { backgroundColor: COLORS.primary },
  formBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1, color: '#FFFFFF' },
  formTitle: { maxWidth: 590, fontFamily: 'Sora_700Bold', fontSize: 23, lineHeight: 30, color: '#FFFFFF' },
  formDescription: { maxWidth: 640, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: '#C9DADF', marginTop: 7 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 7 },
  progressLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#D4E2E5' },
  progressValue: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.aqua },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#345562', overflow: 'hidden' },
  progressFill: { minWidth: 5, height: '100%', borderRadius: 3, backgroundColor: COLORS.aqua },
  formButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 17, marginTop: 18 },
  formButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.navy },

  sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 13 },
  sectionHeadingCopy: { flex: 1, paddingRight: 12 },
  sectionHeading: { marginTop: 29, marginBottom: 13 },
  sectionEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: COLORS.primary, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 19, color: COLORS.ink },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.primary, paddingVertical: 5 },
  peopleRow: { gap: 11, paddingRight: 8 },
  personCard: { width: 140, minHeight: 156, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, padding: 14 },
  personCardSelected: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: '#F4FBF8' },
  personTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  personAvatar: { width: 43, height: 43, borderRadius: 15, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  personAvatarAlt: { backgroundColor: COLORS.blueSoft },
  personInitial: { fontFamily: 'Sora_700Bold', fontSize: 16, color: COLORS.primary },
  personInitialAlt: { color: COLORS.blue },
  qrMini: { width: 31, height: 31, borderRadius: 10, backgroundColor: '#F1F7F5', alignItems: 'center', justifyContent: 'center' },
  personName: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  personRelationship: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.muted, marginTop: 3 },
  personStatus: { alignSelf: 'flex-start', fontFamily: 'Inter_600SemiBold', fontSize: 9, color: COLORS.primary, backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, marginTop: 10 },
  addPersonCard: { alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', backgroundColor: '#F8FBFA' },
  addPersonIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  addPersonTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.primary },
  addPersonText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, textAlign: 'center', marginTop: 4 },
  askAlalayCard: { backgroundColor: COLORS.navy, borderRadius: 20, padding: 16, marginTop: 13 },
  askAlalayCardWide: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 20 },
  askAlalayIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  askAlalayIconWide: { marginBottom: 0 },
  askAlalayCopy: { flex: 1 },
  askAlalayEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: COLORS.aqua },
  askAlalayTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#FFFFFF', marginTop: 3 },
  askAlalayText: { maxWidth: 560, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#C9DADF', marginTop: 4 },
  askAlalayButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.primary, borderRadius: 13, paddingHorizontal: 15, marginTop: 14 },
  askAlalayButtonWide: { marginTop: 0 },
  askAlalayButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  quickGridWide: { flexWrap: 'nowrap' },
  quickAction: { width: '48.3%', minHeight: 130, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 15 },
  quickActionWide: { flex: 1, width: undefined },
  quickIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  quickTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  quickDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 4 },
  privacyNote: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, textAlign: 'center', marginTop: 22, paddingHorizontal: 18 },
});
