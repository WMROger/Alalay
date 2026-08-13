import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, FileSearch, LockKeyhole, ShieldCheck, XCircle } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75',
  line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A',
  red: '#A83232', redSoft: '#FFF0F0',
};

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function VerifyReferenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ referenceId?: string; patientId?: string }>();
  const referenceId = singleParam(params.referenceId).toUpperCase();
  const patientId = singleParam(params.patientId);
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const visitLog = useStore((state) => state.visitLog);
  const validFormat = /^(ALA|ALALAY)-[A-Z0-9-]{3,}$/.test(referenceId);
  const beneficiary = beneficiaries.find((item) => item.id === patientId);
  const localPatientName = patientId === 'self'
    ? `${masterProfile.firstName} ${masterProfile.lastName}`.trim()
    : beneficiary
      ? `${beneficiary.firstName} ${beneficiary.lastName}`.trim()
      : visitLog.patientId === patientId
        ? visitLog.patientName
        : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Verify reference</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.resultCard, !validFormat && styles.resultCardInvalid]}>
          <View style={[styles.resultIcon, !validFormat && styles.resultIconInvalid]}>
            {validFormat ? <CheckCircle2 color={COLORS.primary} size={36} /> : <XCircle color={COLORS.red} size={36} />}
          </View>
          <Text style={styles.eyebrow}>{validFormat ? 'REFERENCE FOUND' : 'NOT RECOGNIZED'}</Text>
          <Text style={styles.title}>{validFormat ? 'This is an Alalay reference identifier' : 'This reference ID is not valid'}</Text>
          <Text style={styles.description}>
            {validFormat
              ? 'The identifier format matches an Alalay-generated patient reference in this frontend demo.'
              : 'Check the QR code or reference ID and try again. No patient information was opened.'}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <FileSearch color={COLORS.primary} size={22} />
            <Text style={styles.detailTitle}>Reference details</Text>
          </View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Reference ID</Text><Text style={styles.detailValue}>{referenceId || 'Not provided'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Patient</Text><Text style={styles.detailValue}>{localPatientName || 'Protected on this device'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Issuer</Text><Text style={styles.detailValue}>Alalay demo</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text><Text style={[styles.detailValue, validFormat && styles.validValue]}>{validFormat ? 'Reference available' : 'Invalid format'}</Text></View>
        </View>

        <View style={styles.privacyCard}>
          <LockKeyhole color={COLORS.primary} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Minimal QR data</Text>
            <Text style={styles.privacyText}>The QR contains only the Alalay reference ID and an internal patient profile key—not medical details, a PhilHealth PIN, or eligibility information.</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <ShieldCheck color="#A15C00" size={20} />
          <Text style={styles.warningText}>This verifies an Alalay demo reference identifier only. It does not verify PhilHealth eligibility, hospital approval, identity, or an official government document.</Text>
        </View>

        {validFormat ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/documents')} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Open patient documents</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.surface },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: COLORS.ink },
  headerSpacer: { width: 40 },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 20, paddingBottom: 40 },
  resultCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#B9DED5', borderRadius: 24, padding: 24 },
  resultCardInvalid: { borderColor: '#F0D0D0' },
  resultIcon: { width: 70, height: 70, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  resultIconInvalid: { backgroundColor: COLORS.redSoft },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.3, color: COLORS.primary, marginTop: 15 },
  title: { maxWidth: 450, fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 27, color: COLORS.ink, textAlign: 'center', marginTop: 6 },
  description: { maxWidth: 460, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 18, color: COLORS.muted, textAlign: 'center', marginTop: 7 },
  detailCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, paddingHorizontal: 16, marginTop: 13 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  detailTitle: { fontFamily: 'Sora_700Bold', fontSize: 15, color: COLORS.ink },
  detailRow: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: '#EEF3F1' },
  detailLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: COLORS.muted },
  detailValue: { flexShrink: 1, fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.ink, textAlign: 'right' },
  validValue: { color: COLORS.primary },
  privacyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: COLORS.primarySoft, borderRadius: 17, padding: 14, marginTop: 13 },
  privacyTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.ink },
  privacyText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF3DD', borderRadius: 17, padding: 14, marginTop: 10 },
  warningText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: '#78552D' },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 16, marginTop: 15 },
  primaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
});
