import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CheckCircle2, ClipboardCheck, Clock3, QrCode, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore } from '../store/useStore';

type AdmissionMode = 'ER' | 'OPD' | 'Transfer';

interface HospitalDesk {
  hospitalId: string;
  deskId: string;
  hospitalName: string;
  deskName: string;
}

const DEMO_DESKS: Record<'general' | 'specialist', HospitalDesk> = {
  general: {
    hospitalId: 'vsmmc',
    deskId: 'main-admissions',
    hospitalName: 'Vicente Sotto Memorial Medical Center',
    deskName: 'Main Admission Desk',
  },
  specialist: {
    hospitalId: 'chong-hua',
    deskId: 'medical-arts',
    hospitalName: 'Chong Hua Hospital',
    deskName: 'Medical Arts Admission Desk',
  },
};

const ADMISSION_MODES: { value: AdmissionMode; label: string }[] = [
  { value: 'ER', label: 'Emergency / Walk-in' },
  { value: 'OPD', label: 'Scheduled visit' },
  { value: 'Transfer', label: 'Coming from another hospital' },
];

export default function QRScreen() {
  const router = useRouter();
  const updateVisitLog = useStore((state) => state.updateVisitLog);
  const [permission, requestPermission] = useCameraPermissions();
  const [demoMode, setDemoMode] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [activeDesk, setActiveDesk] = useState<HospitalDesk | null>(null);
  const [modeOfAdmission, setModeOfAdmission] = useState<AdmissionMode>('ER');
  const [visitNote, setVisitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchCode, setMatchCode] = useState('');

  const showConsentForDesk = (desk: HospitalDesk) => {
    setScanned(true);
    setActiveDesk(desk);
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    // The production backend will validate the signed URL before returning desk data.
    // For the hackathon frontend demo, known QR content selects one of two seeded desks.
    const desk = data.toLowerCase().includes('chong') ? DEMO_DESKS.specialist : DEMO_DESKS.general;
    showConsentForDesk(desk);
  };

  const cancelCheckIn = () => {
    setActiveDesk(null);
    setScanned(false);
    setVisitNote('');
    setModeOfAdmission('ER');
  };

  const confirmCheckIn = () => {
    if (!activeDesk) return;

    // Fixed for the hackathon demo so the separate patient and registrar views match.
    // Production should replace this with a backend-generated random 3-digit code.
    const code = '428';
    setIsSubmitting(true);

    setTimeout(() => {
      updateVisitLog({
        hospitalName: activeDesk.hospitalName,
        deskName: activeDesk.deskName,
        modeOfAdmission,
        visitNote: visitNote.trim(),
        matchCode: code,
        status: 'pending',
        dataSharingConsent: true,
      });
      setMatchCode(code);
      setIsSubmitting(false);
    }, 900);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted && !demoMode) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <QrCode color="#4A5568" size={58} />
        <Text style={styles.permissionTitle}>Camera access required</Text>
        <Text style={styles.permissionText}>Allow camera access to scan the hospital admission desk QR code.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Allow Camera</Text>
        </TouchableOpacity>
        <Text style={styles.demoDivider}>OR USE A SEEDED DEMO DESK</Text>
        <View style={styles.permissionDemoRow}>
          <TouchableOpacity style={styles.permissionDemoButton} onPress={() => { setDemoMode(true); showConsentForDesk(DEMO_DESKS.general); }}>
            <Text style={styles.permissionDemoButtonText}>VSMMC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionDemoButton} onPress={() => { setDemoMode(true); showConsentForDesk(DEMO_DESKS.specialist); }}>
            <Text style={styles.permissionDemoButtonText}>Chong Hua</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.textButton} onPress={() => router.back()}>
          <Text style={styles.textButtonLabel}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scannerWrapper}>
        {permission.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        ) : (
          <View style={styles.demoCameraBackground}><QrCode color="#718096" size={72} /></View>
        )}

        <View style={styles.overlayTop}>
          <TouchableOpacity style={styles.closeHeaderButton} onPress={() => router.back()}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scan Hospital QR</Text>
        </View>
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanInstruction}>Align the admission desk QR code inside the frame.</Text>
          <View style={styles.demoTools}>
            <Text style={styles.demoLabel}>Seeded demo desks</Text>
            <View style={styles.demoActions}>
              <TouchableOpacity style={styles.demoButton} onPress={() => showConsentForDesk(DEMO_DESKS.general)}>
                <Text style={styles.demoButtonText}>VSMMC desk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.demoButton} onPress={() => showConsentForDesk(DEMO_DESKS.specialist)}>
                <Text style={styles.demoButtonText}>Chong Hua desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {activeDesk && !matchCode && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <ShieldCheck color="#276749" size={26} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Review and consent</Text>
                  <Text style={styles.verifiedText}>Admission desk identified</Text>
                </View>
              </View>

              <Text style={styles.consentCopy}>
                You're checking in at <Text style={styles.bold}>{activeDesk.hospitalName}</Text> - <Text style={styles.bold}>{activeDesk.deskName}</Text>. We'll share: your identity info, PhilHealth details, and your health profile (allergies, emergency contact, etc.) with this hospital's registration desk.
              </Text>

              <Text style={styles.sectionLabel}>How are you arriving today?</Text>
              <View style={styles.modeList}>
                {ADMISSION_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.value}
                    style={[styles.modeButton, modeOfAdmission === mode.value && styles.modeButtonActive]}
                    onPress={() => setModeOfAdmission(mode.value)}
                  >
                    <View style={[styles.radio, modeOfAdmission === mode.value && styles.radioActive]} />
                    <Text style={[styles.modeLabel, modeOfAdmission === mode.value && styles.modeLabelActive]}>{mode.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modeOfAdmission === 'Transfer' && (
                <View style={styles.transferNotice}>
                  <ClipboardCheck color="#975A16" size={20} />
                  <Text style={styles.transferNoticeText}>Please have the referral letter or transfer summary ready for the registrar.</Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>Anything you'd like the registrar to know? (optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={visitNote}
                onChangeText={setVisitNote}
                placeholder="One short note"
                placeholderTextColor="#A0AEC0"
                maxLength={160}
              />

              <Text style={styles.nonClinicalNote}>This information is for registration context only. It does not assess urgency or change queue order.</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelCheckIn} disabled={isSubmitting}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmCheckIn} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Share & Check In</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {!!matchCode && activeDesk && (
        <View style={styles.modalOverlay}>
          <View style={styles.successSheet}>
            <CheckCircle2 color="#38A169" size={58} />
            <Text style={styles.successTitle}>You're checked in</Text>
            <Text style={styles.successSubtitle}>{activeDesk.hospitalName} - {activeDesk.deskName}</Text>
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>YOUR MATCH CODE</Text>
              <Text style={styles.codeValue}>{matchCode}</Text>
              <View style={styles.expiryRow}>
                <Clock3 color="#718096" size={16} />
                <Text style={styles.expiryText}>Tell this code to the registrar. It expires in 10 minutes.</Text>
              </View>
            </View>
            <Text style={styles.queueNote}>This is an admission queue, not a clinical priority assessment.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/dashboard')}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  permissionContainer: { flex: 1, backgroundColor: '#F7FAFC', padding: 28, justifyContent: 'center', alignItems: 'center' },
  permissionTitle: { fontFamily: 'Sora_700Bold', fontSize: 25, color: '#1A202C', marginTop: 20, marginBottom: 10 },
  permissionText: { maxWidth: 440, fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 28 },
  primaryButton: { width: '100%', backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  textButton: { padding: 16 },
  textButtonLabel: { color: '#718096', fontFamily: 'Inter_500Medium', fontSize: 16 },
  demoDivider: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#A0AEC0', letterSpacing: 1.1, marginTop: 24, marginBottom: 12 },
  permissionDemoRow: { width: '100%', flexDirection: 'row', gap: 10 },
  permissionDemoButton: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  permissionDemoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2D3748' },
  scannerWrapper: { flex: 1 },
  demoCameraBackground: { ...StyleSheet.absoluteFill, backgroundColor: '#1A202C', alignItems: 'center', justifyContent: 'center' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', paddingTop: 48, paddingHorizontal: 24 },
  closeHeaderButton: { position: 'absolute', top: 44, left: 20, zIndex: 10, padding: 10 },
  scannerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  overlayMiddle: { flexDirection: 'row', height: 270 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  scanFrame: { width: 270, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 24 },
  overlayBottom: { flex: 1.8, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  scanInstruction: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  demoTools: { marginTop: 28, alignItems: 'center' },
  demoLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#CBD5E0', textTransform: 'uppercase', letterSpacing: 1 },
  demoActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  demoButton: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  demoButtonText: { color: '#2D3748', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  modalOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10,20,30,0.62)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalContent: { padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  modalIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#1A202C' },
  verifiedText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#38A169', marginTop: 2 },
  consentCopy: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, color: '#4A5568', backgroundColor: '#F7FAFC', borderRadius: 14, padding: 16, marginBottom: 22 },
  bold: { fontFamily: 'Inter_600SemiBold', color: '#1A202C' },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2D3748', marginBottom: 10 },
  modeList: { gap: 8, marginBottom: 18 },
  modeButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
  modeButtonActive: { borderColor: '#007AFF', backgroundColor: '#EBF4FF' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#A0AEC0' },
  radioActive: { borderWidth: 5, borderColor: '#007AFF', backgroundColor: '#FFFFFF' },
  modeLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#4A5568' },
  modeLabelActive: { color: '#2B6CB0' },
  transferNotice: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFAF0', borderWidth: 1, borderColor: '#FEEBC8', padding: 13, borderRadius: 12, marginBottom: 18 },
  transferNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#975A16' },
  noteInput: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 12, padding: 14, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1A202C' },
  nonClinicalNote: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#718096', marginTop: 10 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  cancelButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#4A5568' },
  confirmButton: { flex: 2, backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  successSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center' },
  successTitle: { fontFamily: 'Sora_700Bold', fontSize: 27, color: '#1A202C', marginTop: 16 },
  successSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: '#718096', textAlign: 'center', marginTop: 6 },
  codeCard: { width: '100%', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 22, alignItems: 'center', marginVertical: 24 },
  codeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096', letterSpacing: 1.4 },
  codeValue: { width: 220, alignSelf: 'center', textAlign: 'center', fontFamily: 'Sora_700Bold', fontSize: 56, color: '#007AFF', letterSpacing: 4, marginVertical: 6 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  expiryText: { flexShrink: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#718096', textAlign: 'center' },
  queueNote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 20 },
});
