import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  FileText,
  HeartPulse,
  Pencil,
  Phone,
  QrCode,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75',
  line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A',
  amber: '#A15C00', amberSoft: '#FFF3DD', blue: '#246BCE', blueSoft: '#EAF2FF',
};

export default function FamilyProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ person?: string }>();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const setActivePatient = useStore((state) => state.setActivePatient);
  const documents = useStore((state) => state.documents);
  const pendingActions = useStore((state) => state.pendingActions);

  const requestedId = params.person || activePatientId || 'self';
  const beneficiary = beneficiaries.find((item) => item.id === requestedId);
  const isSelf = requestedId === 'self';
  const isValid = isSelf || Boolean(beneficiary);
  const firstName = beneficiary?.firstName || masterProfile.firstName || 'Patient';
  const lastName = beneficiary?.lastName || masterProfile.lastName;
  const fullName = `${firstName} ${lastName || ''}`.trim();
  const relationship = beneficiary?.relationship || 'My profile';
  const philhealthPin = beneficiary?.pin || (isSelf ? masterProfile.philhealthId : '');
  const dateOfBirth = beneficiary?.dateOfBirth || (isSelf ? masterProfile.dateOfBirth : '');
  const emergencyContact = beneficiary?.emergencyContact || (isSelf ? masterProfile.emergencyContact : undefined);
  const prescription = beneficiary?.prescriptionPhotoUrl;
  const savedDocuments = documents.filter((item) => item.patientId === requestedId);
  const openActions = pendingActions.filter((action) => action.patientId === requestedId && action.status === 'open');
  const documentCount = savedDocuments.length + (philhealthPin ? 1 : 0) + (prescription ? 1 : 0);

  useEffect(() => {
    if (isValid && activePatientId !== requestedId) setActivePatient(requestedId);
  }, [activePatientId, isValid, requestedId, setActivePatient]);

  if (!isValid) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <UserRound color={COLORS.muted} size={34} />
          <Text style={styles.notFoundTitle}>Profile not found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/family')}>
            <Text style={styles.primaryButtonText}>Back to Family</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Patient profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(isSelf ? '/profile' : (`/family?person=${requestedId}` as Href))}
          accessibilityLabel={`Edit ${firstName}'s profile`}
        >
          <Pencil color={COLORS.primary} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(38, insets.bottom + 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.identityCopy}>
            <Text style={styles.profileEyebrow}>SELECTED FOR ADMISSION</Text>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.relationship}>{relationship}</Text>
          </View>
          <View style={styles.selectedBadge}><CheckCircle2 color={COLORS.primary} size={13} /><Text style={styles.selectedText}>SELECTED</Text></View>
        </View>

        <Text style={styles.sectionEyebrow}>KEY DETAILS</Text>
        <Text style={styles.sectionTitle}>Review before the hospital</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><ShieldCheck color={COLORS.primary} size={18} /></View>
            <View style={styles.detailCopy}><Text style={styles.detailLabel}>PhilHealth PIN</Text><Text style={styles.detailValue}>{philhealthPin || 'Not added yet'}</Text></View>
          </View>
          <View style={[styles.detailRow, styles.divider]}>
            <View style={[styles.detailIcon, styles.detailIconBlue]}><CalendarDays color={COLORS.blue} size={18} /></View>
            <View style={styles.detailCopy}><Text style={styles.detailLabel}>Date of birth</Text><Text style={styles.detailValue}>{dateOfBirth || 'Not added yet'}</Text></View>
          </View>
          <View style={[styles.detailRow, styles.divider]}>
            <View style={[styles.detailIcon, styles.detailIconAmber]}><Phone color={COLORS.amber} size={18} /></View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>Emergency contact</Text>
              <Text style={styles.detailValue}>{emergencyContact?.name || 'Not added yet'}</Text>
              {!!emergencyContact?.phone && <Text style={styles.detailMeta}>{emergencyContact.relationship} · {emergencyContact.phone}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.reviewHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>BEFORE SCANNING</Text>
            <Text style={styles.sectionTitle}>Documents and check-in</Text>
          </View>
          {openActions.length > 0 && <Text style={styles.actionCount}>{openActions.length}</Text>}
        </View>

        {openActions.length > 0 && (
          <View style={styles.attentionCard}>
            <HeartPulse color={COLORS.amber} size={21} />
            <View style={styles.attentionCopy}>
              <Text style={styles.attentionTitle}>{openActions[0].title}</Text>
              <Text style={styles.attentionText}>{openActions[0].description}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.documentsCard} onPress={() => router.push('/documents')} activeOpacity={0.78} accessibilityRole="button">
          <View style={styles.documentsIcon}><FileText color={COLORS.blue} size={23} /></View>
          <View style={styles.documentsCopy}>
            <Text style={styles.documentsTitle}>Review patient documents</Text>
            <Text style={styles.documentsText}>{documentCount} {documentCount === 1 ? 'item' : 'items'} ready · IDs, prescriptions, and generated forms</Text>
          </View>
          <ArrowRight color={COLORS.blue} size={19} />
        </TouchableOpacity>

        <View style={styles.checkInCard}>
          <View style={styles.checkInIcon}><QrCode color="#FFFFFF" size={24} /></View>
          <View style={styles.checkInCopy}>
            <Text style={styles.checkInEyebrow}>WHEN YOU ARRIVE</Text>
            <Text style={styles.checkInTitle}>Scan the hospital desk QR</Text>
            <Text style={styles.checkInText}>You’ll review the visit questions and sharing consent before check-in.</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/qr')} accessibilityRole="button">
            <QrCode color={COLORS.navy} size={18} />
            <Text style={styles.scanButtonText}>Scan hospital QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <ShieldCheck color={COLORS.primary} size={17} />
          <Text style={styles.privacyText}>Nothing is shared until you scan a hospital code, review the request, and approve it.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.surface },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: COLORS.ink },
  editButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20 },
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.navy, borderRadius: 22, padding: 17, marginBottom: 26 },
  avatar: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#DDF2EC', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.primary },
  identityCopy: { flex: 1 },
  profileEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.1, color: '#8ED3C4' },
  name: { fontFamily: 'Sora_700Bold', fontSize: 19, color: '#FFFFFF', marginTop: 3 },
  relationship: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C9DADF', marginTop: 3 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: '#DDF2EC', paddingHorizontal: 8, paddingVertical: 6 },
  selectedText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.6, color: COLORS.primary },
  sectionEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.25, color: COLORS.primary, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink },
  detailsCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, paddingHorizontal: 14, marginTop: 12, marginBottom: 26 },
  detailRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: '#E8EFED' },
  detailIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  detailIconBlue: { backgroundColor: COLORS.blueSoft },
  detailIconAmber: { backgroundColor: COLORS.amberSoft },
  detailCopy: { flex: 1 },
  detailLabel: { fontFamily: 'Inter_500Medium', fontSize: 9, color: COLORS.muted },
  detailValue: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.ink, marginTop: 3 },
  detailMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted, marginTop: 2 },
  reviewHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  actionCount: { minWidth: 28, height: 28, borderRadius: 14, paddingTop: 6, textAlign: 'center', textAlignVertical: 'center', backgroundColor: COLORS.amberSoft, color: COLORS.amber, fontFamily: 'Inter_600SemiBold', fontSize: 11, overflow: 'hidden' },
  attentionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.amberSoft, borderWidth: 1, borderColor: '#F2D6A6', borderRadius: 17, padding: 13, marginBottom: 11 },
  attentionCopy: { flex: 1 },
  attentionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: '#744100' },
  attentionText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#866338', marginTop: 3 },
  documentsCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#CFDDF0', borderRadius: 18, padding: 14, marginBottom: 12 },
  documentsIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft },
  documentsCopy: { flex: 1 },
  documentsTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: COLORS.ink },
  documentsText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted, marginTop: 3 },
  checkInCard: { backgroundColor: COLORS.navy, borderRadius: 22, padding: 17 },
  checkInIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, marginBottom: 12 },
  checkInCopy: { flex: 1 },
  checkInEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.1, color: '#8ED3C4' },
  checkInTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#FFFFFF', marginTop: 4 },
  checkInText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#C9DADF', marginTop: 5 },
  scanButton: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 16, marginTop: 15 },
  scanButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: COLORS.navy },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 7, marginTop: 14 },
  privacyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink, marginTop: 10 },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 20, marginTop: 18 },
  primaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
});
