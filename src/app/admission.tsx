import { useRouter } from 'expo-router';
import { Building2, ChevronLeft, QrCode, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdmissionJourney } from '../components/AdmissionJourney';
import { useStore } from '../store/useStore';

const COLORS = { background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75', line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A', blue: '#246BCE', blueSoft: '#EAF2FF' };

export default function AdmissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const visitLog = useStore((state) => state.visitLog);
  const activePatientId = useStore((state) => state.activePatientId);
  const hasVisit = Boolean(visitLog.hospitalName) && visitLog.admissionSteps.length > 0;
  const isSelectedVisit = hasVisit && visitLog.patientId === activePatientId;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft size={23} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isSelectedVisit ? 'Admission guide' : 'Hospital check-in'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]} showsVerticalScrollIndicator={false}>
        {isSelectedVisit ? (
          <>
            <View style={styles.patientBanner}>
              <View style={styles.patientIcon}><Building2 color="#FFFFFF" size={23} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>CURRENT HOSPITAL VISIT</Text>
                <Text style={styles.patientName}>{visitLog.patientName}</Text>
                <Text style={styles.patientMeta}>{visitLog.hospitalName} · {visitLog.deskName}</Text>
              </View>
            </View>
            <AdmissionJourney />
          </>
        ) : hasVisit ? (
          <View style={styles.emptyCard}>
            <View style={styles.iconWrap}><Building2 color={COLORS.blue} size={36} /></View>
            <Text style={styles.title}>The recent visit belongs to {visitLog.patientName}</Text>
            <Text style={styles.description}>Select that patient from Home to view their admission steps. This prevents one person’s hospital status from appearing under another profile.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/dashboard')} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.iconWrap}><QrCode color={COLORS.blue} size={42} /></View>
            <Text style={styles.title}>Scan the admission desk QR</Text>
            <Text style={styles.description}>The hospital and desk will be identified first. You will review exactly what is shared before a check-in is created.</Text>
            <View style={styles.notice}>
              <ShieldCheck color={COLORS.primary} size={21} />
              <Text style={styles.noticeText}>The QR contains no patient data. It only identifies the hospital admission desk.</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/qr')} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Scan hospital QR</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.surface },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: COLORS.ink },
  headerSpacer: { width: 40 },
  content: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 40 },
  patientBanner: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.navy, borderRadius: 22, padding: 17, marginBottom: 22 },
  patientIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5667' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.25, color: '#9FD8CD' },
  patientName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#FFFFFF', marginTop: 3 },
  patientMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C8D9DE', marginTop: 3 },
  emptyCard: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 24, padding: 26 },
  iconWrap: { width: 78, height: 78, borderRadius: 25, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { maxWidth: 520, fontFamily: 'Sora_700Bold', fontSize: 23, lineHeight: 30, color: COLORS.ink, textAlign: 'center' },
  description: { maxWidth: 520, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, color: COLORS.muted, textAlign: 'center', marginTop: 9 },
  notice: { width: '100%', maxWidth: 520, flexDirection: 'row', gap: 11, backgroundColor: COLORS.primarySoft, borderRadius: 15, padding: 14, marginTop: 21 },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted },
  primaryButton: { width: '100%', maxWidth: 520, minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 16, marginTop: 21 },
  primaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
});
