import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CheckCircle2, ClipboardCheck, Clock3, IdCard, QrCode, ShieldCheck, UserRound, X } from 'lucide-react-native';
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
import { createInitialAdmissionSteps, useStore } from '../store/useStore';

type AdmissionMode = 'ER' | 'OPD' | 'Transfer';
type CheckInStep = 'patient' | 'visit' | 'documents' | 'consent';

interface HospitalDesk {
  hospitalId: string;
  deskId: string;
  hospitalName: string;
  deskName: string;
  supportsLiveStatus: boolean;
}

const DEMO_DESKS: Record<'general' | 'specialist', HospitalDesk> = {
  general: {
    hospitalId: 'vsmmc-demo',
    deskId: 'main-admissions',
    hospitalName: 'Vicente Sotto Memorial Medical Center',
    deskName: 'Main Admission Desk',
    supportsLiveStatus: true,
  },
  specialist: {
    hospitalId: 'non-partner-demo',
    deskId: 'general-admissions',
    hospitalName: 'Cebu Community Hospital',
    deskName: 'General Admission Desk',
    supportsLiveStatus: false,
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
  const addPendingAction = useStore((state) => state.addPendingAction);
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const selectedBeneficiary = beneficiaries.find((beneficiary) => beneficiary.id === activePatientId);
  const isSelfPatient = !selectedBeneficiary;
  const patient = selectedBeneficiary ? {
    id: selectedBeneficiary.id,
    name: `${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}`,
    relationship: selectedBeneficiary.relationship,
    dateOfBirth: selectedBeneficiary.dateOfBirth || '',
    sex: selectedBeneficiary.sex || '',
    pin: selectedBeneficiary.pin || '',
    contactNumber: selectedBeneficiary.contactNumber || '',
    allergies: selectedBeneficiary.knownAllergies || [],
    medications: selectedBeneficiary.currentMedications || [],
    conditions: selectedBeneficiary.chronicConditions || [],
    prescriptionPhotoUrl: selectedBeneficiary.prescriptionPhotoUrl || '',
    emergencyContact: selectedBeneficiary.emergencyContact || { name: '', relationship: '', phone: '' },
  } : {
    id: 'self',
    name: `${masterProfile.firstName || 'Juan'} ${masterProfile.lastName}`.trim(),
    relationship: 'My profile',
    dateOfBirth: masterProfile.dateOfBirth,
    sex: masterProfile.sex,
    pin: masterProfile.philhealthId,
    contactNumber: masterProfile.contactNumber,
    allergies: masterProfile.knownAllergies,
    medications: masterProfile.currentMedications,
    conditions: masterProfile.chronicConditions,
    prescriptionPhotoUrl: '',
    emergencyContact: masterProfile.emergencyContact,
  };
  const [permission, requestPermission] = useCameraPermissions();
  const [sampleMode, setSampleMode] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [activeDesk, setActiveDesk] = useState<HospitalDesk | null>(null);
  const [modeOfAdmission, setModeOfAdmission] = useState<AdmissionMode>('ER');
  const [visitNote, setVisitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchCode, setMatchCode] = useState('');
  const [checkInStep, setCheckInStep] = useState<CheckInStep>('patient');
  const [useTemporaryContact, setUseTemporaryContact] = useState(true);
  const [temporaryContact, setTemporaryContact] = useState({ name: 'Rosa Santos', relationship: 'Neighbor', phone: '0917 555 0166' });
  const [seniorIdAvailable, setSeniorIdAvailable] = useState<boolean | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const patientBirthDate = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
  const patientAge = patientBirthDate && !Number.isNaN(patientBirthDate.getTime())
    ? new Date(Date.now() - patientBirthDate.getTime()).getUTCFullYear() - 1970
    : null;
  const requiresSeniorId = patientAge !== null && patientAge >= 60;

  const showConsentForDesk = (desk: HospitalDesk) => {
    setScanned(true);
    setActiveDesk(desk);
    setCheckInStep('patient');
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    try {
      const payload = JSON.parse(data) as { type?: string; referenceId?: string; patientId?: string };
      if (payload.type === 'alalay-reference' && payload.referenceId) {
        setScanned(true);
        router.push({
          pathname: '/verify-reference',
          params: { referenceId: payload.referenceId, patientId: payload.patientId || '' },
        });
        return;
      }
    } catch {
      // Hospital desk codes are not required to use the reference JSON format.
    }

    // The production backend will validate the signed URL before returning desk data.
    // For the hackathon frontend demo, known QR content selects one of two seeded desks.
    const desk = data.toLowerCase().includes('non-partner') ? DEMO_DESKS.specialist : DEMO_DESKS.general;
    showConsentForDesk(desk);
  };

  const cancelCheckIn = () => {
    setActiveDesk(null);
    setScanned(false);
    setVisitNote('');
    setModeOfAdmission('ER');
    setSeniorIdAvailable(null);
    setConsentAccepted(false);
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
        supportsLiveStatus: activeDesk.supportsLiveStatus,
        checkedInAt: new Date().toISOString(),
        admissionSteps: createInitialAdmissionSteps(),
        patientId: patient.id,
        patientName: patient.name,
        patientRelationship: patient.relationship,
        patientDateOfBirth: patient.dateOfBirth,
        patientSex: patient.sex,
        patientPin: patient.pin,
        patientContactNumber: patient.contactNumber,
        patientAllergies: patient.allergies,
        patientMedications: patient.medications,
        patientConditions: patient.conditions,
        patientPrescriptionPhotoUrl: patient.prescriptionPhotoUrl,
        savedEmergencyContact: patient.emergencyContact,
        visitEmergencyContact: useTemporaryContact ? temporaryContact : null,
        seniorIdAvailable: requiresSeniorId ? seniorIdAvailable : null,
        consentAcknowledgedAt: new Date().toISOString(),
        consentAcknowledgedBy: masterProfile.firstName ? `${masterProfile.firstName} ${masterProfile.lastName}`.trim() : patient.name,
        generatedDocuments: [],
        documentsGeneratedAt: '',
      });
      if (requiresSeniorId && seniorIdAvailable === false) {
        addPendingAction({
          id: `missing-senior-id-${patient.id}`,
          patientId: patient.id,
          kind: 'missing_senior_id',
          title: `Add ${patient.name}’s Senior Citizen ID`,
          description: 'The ID was not available during check-in. Admission continued, but the hospital may need it before applying a senior discount.',
          status: 'open',
          route: `/family-profile?person=${patient.id}`,
          createdAt: new Date().toISOString(),
        });
      }
      setMatchCode(code);
      setIsSubmitting(false);
    }, 900);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted && !sampleMode) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <QrCode color="#4A5568" size={58} />
        <Text style={styles.permissionTitle}>Camera access required</Text>
        <Text style={styles.permissionText}>Allow camera access to scan the hospital admission desk QR code.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Allow Camera</Text>
        </TouchableOpacity>
        <Text style={styles.demoDivider}>CAMERA NOT AVAILABLE?</Text>
        <TouchableOpacity style={styles.sampleDeskButton} onPress={() => { setSampleMode(true); showConsentForDesk(DEMO_DESKS.general); }}>
          <Text style={styles.sampleDeskButtonText}>Continue with sample admission desk</Text>
        </TouchableOpacity>
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
          <View style={styles.sampleCameraBackground}><QrCode color="#718096" size={72} /></View>
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
          <Text style={styles.scanHelper}>Scan the admission desk QR displayed on the hospital laptop.</Text>
        </View>
      </View>

      {activeDesk && !matchCode && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  {checkInStep === 'patient' ? <UserRound color="#276749" size={26} /> : checkInStep === 'documents' ? <IdCard color="#276749" size={26} /> : <ShieldCheck color="#276749" size={26} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>
                    {checkInStep === 'patient' && 'Confirm patient'}
                    {checkInStep === 'visit' && 'Visit details'}
                    {checkInStep === 'documents' && 'Documents for this visit'}
                    {checkInStep === 'consent' && 'Review and acknowledge'}
                  </Text>
                  <Text style={styles.verifiedText}>Step {(['patient', 'visit', 'documents', 'consent'] as CheckInStep[]).indexOf(checkInStep) + 1} of 4 · {activeDesk.deskName}</Text>
                </View>
              </View>

              {checkInStep === 'patient' && (
                <>
                  <Text style={styles.stepPrompt}>You are checking in:</Text>
                  <View style={styles.patientConfirmCard}>
                    <View style={styles.patientAvatar}><Text style={styles.patientAvatarText}>{patient.name.charAt(0)}</Text></View>
                    <View style={styles.patientConfirmCopy}>
                      <Text style={styles.patientConfirmName}>{patient.name}</Text>
                      <Text style={styles.patientConfirmMeta}>{patient.relationship} · {patient.dateOfBirth || 'Birthday not provided'}</Text>
                      <Text style={styles.patientConfirmStatus}>{patient.pin ? 'PhilHealth profile ready' : 'PhilHealth PIN can be added later'}</Text>
                    </View>
                  </View>
                  <View style={styles.hospitalConfirmCard}>
                    <CheckCircle2 color="#137A67" size={19} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hospitalConfirmTitle}>{activeDesk.hospitalName}</Text>
                      <Text style={styles.hospitalConfirmText}>{activeDesk.supportsLiveStatus ? 'Sample participating hospital · live status available' : 'General next-step guide only'}</Text>
                    </View>
                  </View>
                  <Text style={styles.nonClinicalNote}>Check the patient name carefully. The selected profile will be shared only after the final acknowledgment.</Text>
                </>
              )}

              {checkInStep === 'visit' && (
                <>
                  <Text style={styles.sectionLabel}>How are you arriving today?</Text>
                  <View style={styles.modeList}>
                    {ADMISSION_MODES.map((mode) => (
                      <TouchableOpacity key={mode.value} style={[styles.modeButton, modeOfAdmission === mode.value && styles.modeButtonActive]} onPress={() => setModeOfAdmission(mode.value)}>
                        <View style={[styles.radio, modeOfAdmission === mode.value && styles.radioActive]} />
                        <Text style={[styles.modeLabel, modeOfAdmission === mode.value && styles.modeLabelActive]}>{mode.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {modeOfAdmission === 'Transfer' && (
                    <View style={styles.transferNotice}><ClipboardCheck color="#975A16" size={20} /><Text style={styles.transferNoticeText}>Please have the referral letter or transfer summary ready for the registrar.</Text></View>
                  )}
                  <Text style={styles.sectionLabel}>Reason for visit or registration note (optional)</Text>
                  <TextInput style={styles.noteInput} value={visitNote} onChangeText={setVisitNote} placeholder="One short note" placeholderTextColor="#A0AEC0" maxLength={160} />
                  <Text style={styles.nonClinicalNote}>This does not assess urgency or determine clinical queue order.</Text>

                  <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Emergency contact for this visit</Text>
                  <View style={styles.savedContactCard}>
                    <Text style={styles.savedContactLabel}>SAVED PROFILE CONTACT</Text>
                    <Text style={styles.savedContactName}>{patient.emergencyContact.name || 'No saved contact'}{patient.emergencyContact.relationship ? ` · ${patient.emergencyContact.relationship}` : ''}</Text>
                    <Text style={styles.savedContactPhone}>{patient.emergencyContact.phone || 'Phone not provided'}</Text>
                  </View>
                  <TouchableOpacity style={[styles.overrideToggle, useTemporaryContact && styles.overrideToggleActive]} onPress={() => setUseTemporaryContact((value) => !value)}>
                    <View style={[styles.checkbox, useTemporaryContact && styles.checkboxChecked]}>{useTemporaryContact && <Text style={styles.checkmark}>✓</Text>}</View>
                    <Text style={styles.overrideToggleText}>Use a different contact for this admission</Text>
                  </TouchableOpacity>
                  {useTemporaryContact && (
                    <View style={styles.temporaryForm}>
                      <TextInput style={styles.compactInput} value={temporaryContact.name} onChangeText={(name) => setTemporaryContact((current) => ({ ...current, name }))} placeholder="Contact name" />
                      <TextInput style={styles.compactInput} value={temporaryContact.relationship} onChangeText={(relationship) => setTemporaryContact((current) => ({ ...current, relationship }))} placeholder="Relationship" />
                      <TextInput style={styles.compactInput} value={temporaryContact.phone} onChangeText={(phone) => setTemporaryContact((current) => ({ ...current, phone }))} placeholder="Mobile number" keyboardType="phone-pad" />
                      <Text style={styles.temporaryNote}>Temporary for this admission only. {patient.name}’s saved contact stays unchanged and hospital staff cannot edit it.</Text>
                    </View>
                  )}
                </>
              )}

              {checkInStep === 'documents' && (
                <>
                  {requiresSeniorId ? (
                    <>
                      <Text style={styles.stepPrompt}>{patient.name}, age {patientAge}, is recognized as eligible for senior-related admission requirements.</Text>
                      <Text style={styles.sectionLabel}>Do you have {patient.name}’s Senior Citizen ID with you?</Text>
                      <TouchableOpacity style={[styles.documentChoice, seniorIdAvailable === true && styles.documentChoiceActive]} onPress={() => setSeniorIdAvailable(true)}>
                        <View style={[styles.radio, seniorIdAvailable === true && styles.radioActive]} />
                        <View style={{ flex: 1 }}><Text style={styles.documentChoiceTitle}>Yes, I have it</Text><Text style={styles.documentChoiceText}>The hospital can verify it during admission.</Text></View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.documentChoice, seniorIdAvailable === false && styles.documentChoiceActive]} onPress={() => setSeniorIdAvailable(false)}>
                        <View style={[styles.radio, seniorIdAvailable === false && styles.radioActive]} />
                        <View style={{ flex: 1 }}><Text style={styles.documentChoiceTitle}>I don’t have it with me right now</Text><Text style={styles.documentChoiceText}>Continue check-in and remind me later.</Text></View>
                      </TouchableOpacity>
                      {seniorIdAvailable === false && (
                        <View style={styles.missingDocumentNotice}>
                          <IdCard color="#A05A16" size={21} />
                          <View style={{ flex: 1 }}><Text style={styles.missingDocumentTitle}>Admission will continue</Text><Text style={styles.missingDocumentText}>The discount is not yet applied. A non-blocking reminder will appear on the Dashboard for {patient.name}.</Text></View>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={styles.missingDocumentNotice}>
                      <IdCard color="#137A67" size={21} />
                      <View style={{ flex: 1 }}><Text style={[styles.missingDocumentTitle, { color: '#137A67' }]}>No Senior Citizen ID required</Text><Text style={styles.missingDocumentText}>{patient.name} is not being checked in as a senior citizen. Continue without this document.</Text></View>
                    </View>
                  )}
                </>
              )}

              {checkInStep === 'consent' && (
                <>
                  <Text style={styles.consentCopy}>
                    {isSelfPatient ? 'You are checking in as ' : 'You are assisting '}
                    <Text style={styles.bold}>{patient.name}</Text> at <Text style={styles.bold}>{activeDesk.hospitalName}</Text>. Alalay will share {isSelfPatient ? 'your' : 'their'} identity, PhilHealth details, health alerts, medications, and the visit contact shown in this flow with the hospital’s registration desk.
                  </Text>
                  <View style={styles.shareSummary}>
                    <Text style={styles.shareSummaryTitle}>VISIT SHARING SUMMARY</Text>
                    <Text style={styles.shareSummaryLine}>Patient · {patient.name}</Text>
                    <Text style={styles.shareSummaryLine}>PhilHealth · {patient.pin || 'Not provided'}</Text>
                    <Text style={styles.shareSummaryLine}>Visit contact · {useTemporaryContact ? `${temporaryContact.name} (${temporaryContact.relationship})` : patient.emergencyContact.name || 'Not provided'}</Text>
                    <Text style={styles.shareSummaryLine}>Senior ID · {requiresSeniorId ? (seniorIdAvailable ? `Available for ${patient.name}` : `${patient.name} will provide it later`) : 'Not applicable to this patient'}</Text>
                  </View>
                  <TouchableOpacity style={styles.consentCheckboxRow} onPress={() => setConsentAccepted((value) => !value)}>
                    <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}>{consentAccepted && <Text style={styles.checkmark}>✓</Text>}</View>
                    <Text style={styles.consentCheckboxText}>
                      {isSelfPatient
                        ? `I confirm that this is my information and agree to share it with ${activeDesk.hospitalName} for this visit.`
                        : `I confirm that I am assisting ${patient.name} and agree to share the information shown above with ${activeDesk.hospitalName} for this visit.`}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.legalNote}>This acknowledgment is timestamped. It does not replace the hospital’s official treatment, admission, or consent forms.</Text>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => checkInStep === 'patient' ? cancelCheckIn() : setCheckInStep((current) => current === 'visit' ? 'patient' : current === 'documents' ? 'visit' : 'documents')} disabled={isSubmitting}>
                  <Text style={styles.cancelButtonText}>{checkInStep === 'patient' ? 'Cancel' : 'Back'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, ((checkInStep === 'documents' && requiresSeniorId && seniorIdAvailable === null) || (checkInStep === 'consent' && !consentAccepted)) && styles.confirmButtonDisabled]}
                  onPress={() => checkInStep === 'patient' ? setCheckInStep('visit') : checkInStep === 'visit' ? setCheckInStep('documents') : checkInStep === 'documents' ? setCheckInStep('consent') : confirmCheckIn()}
                  disabled={isSubmitting || (checkInStep === 'documents' && requiresSeniorId && seniorIdAvailable === null) || (checkInStep === 'consent' && !consentAccepted)}
                >
                  {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>{checkInStep === 'consent' ? 'Acknowledge & Check In' : 'Continue'}</Text>}
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
            <Text style={styles.successTitle}>{patient.name} is checked in</Text>
            <Text style={styles.successSubtitle}>{activeDesk.hospitalName} - {activeDesk.deskName}</Text>
            <View style={[styles.statusAvailability, !activeDesk.supportsLiveStatus && styles.statusAvailabilityGuide]}>
              <Text style={[styles.statusAvailabilityText, !activeDesk.supportsLiveStatus && styles.statusAvailabilityTextGuide]}>
                {activeDesk.supportsLiveStatus ? 'Live hospital status available' : 'General next-step guide available'}
              </Text>
            </View>
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
  sampleDeskButton: { width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  sampleDeskButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2D3748' },
  scannerWrapper: { flex: 1 },
  sampleCameraBackground: { ...StyleSheet.absoluteFill, backgroundColor: '#1A202C', alignItems: 'center', justifyContent: 'center' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', paddingTop: 48, paddingHorizontal: 24 },
  closeHeaderButton: { position: 'absolute', top: 44, left: 20, zIndex: 10, padding: 10 },
  scannerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  overlayMiddle: { flexDirection: 'row', height: 270 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  scanFrame: { width: 270, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 24 },
  overlayBottom: { flex: 1.8, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  scanInstruction: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  scanHelper: { maxWidth: 330, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#CBD5E0', textAlign: 'center', marginTop: 9 },
  modalOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10,20,30,0.62)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalContent: { padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  modalIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#1A202C' },
  verifiedText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#38A169', marginTop: 2 },
  consentCopy: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, color: '#4A5568', backgroundColor: '#F7FAFC', borderRadius: 14, padding: 16, marginBottom: 22 },
  bold: { fontFamily: 'Inter_600SemiBold', color: '#1A202C' },
  stepPrompt: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 20, color: '#4A5568', marginBottom: 12 },
  patientConfirmCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 17, padding: 16 },
  patientAvatar: { width: 53, height: 53, borderRadius: 17, backgroundColor: '#E6F5F1', alignItems: 'center', justifyContent: 'center' },
  patientAvatarText: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#137A67' },
  patientConfirmCopy: { flex: 1 },
  patientConfirmName: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#1A202C' },
  patientConfirmMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096', marginTop: 3 },
  patientConfirmStatus: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#137A67', marginTop: 7 },
  hospitalConfirmCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F0FFF4', borderRadius: 14, padding: 13, marginTop: 13 },
  hospitalConfirmTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#276749' },
  hospitalConfirmText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: '#4A5568', marginTop: 3 },
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
  savedContactCard: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 13, padding: 13 },
  savedContactLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1, color: '#718096' },
  savedContactName: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#2D3748', marginTop: 5 },
  savedContactPhone: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#718096', marginTop: 2 },
  overrideToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 13, marginTop: 9 },
  overrideToggleActive: { borderColor: '#90CDF4', backgroundColor: '#EBF8FF' },
  overrideToggleText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#2D3748' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#A0AEC0', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: '#137A67', backgroundColor: '#137A67' },
  checkmark: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  temporaryForm: { backgroundColor: '#F7FAFC', borderRadius: 13, padding: 12, marginTop: 9 },
  compactInput: { minHeight: 44, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#1A202C', marginBottom: 8 },
  temporaryNote: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#2B6CB0', marginTop: 2 },
  documentChoice: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 15, marginBottom: 9 },
  documentChoiceActive: { borderColor: '#007AFF', backgroundColor: '#EBF4FF' },
  documentChoiceTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#2D3748' },
  documentChoiceText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: '#718096', marginTop: 3 },
  missingDocumentNotice: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF7E8', borderWidth: 1, borderColor: '#F0D7AF', borderRadius: 14, padding: 13, marginTop: 6 },
  missingDocumentTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#784717' },
  missingDocumentText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: '#8A633C', marginTop: 3 },
  shareSummary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 14, marginBottom: 14 },
  shareSummaryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1, color: '#718096', marginBottom: 7 },
  shareSummaryLine: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 18, color: '#2D3748' },
  consentCheckboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, borderWidth: 1, borderColor: '#B9DED5', backgroundColor: '#F0FFF4', borderRadius: 14, padding: 14 },
  consentCheckboxText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 19, color: '#2D3748' },
  legalNote: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#718096', marginTop: 10 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  cancelButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#4A5568' },
  confirmButton: { flex: 2, backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.42 },
  confirmButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  successSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center' },
  successTitle: { fontFamily: 'Sora_700Bold', fontSize: 27, color: '#1A202C', marginTop: 16 },
  successSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: '#718096', textAlign: 'center', marginTop: 6 },
  statusAvailability: { backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, marginTop: 11 },
  statusAvailabilityGuide: { backgroundColor: '#EAF2FF' },
  statusAvailabilityText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#137A67' },
  statusAvailabilityTextGuide: { color: '#246BCE' },
  codeCard: { width: '100%', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 22, alignItems: 'center', marginVertical: 24 },
  codeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096', letterSpacing: 1.4 },
  codeValue: { width: 220, alignSelf: 'center', textAlign: 'center', fontFamily: 'Sora_700Bold', fontSize: 56, color: '#007AFF', letterSpacing: 4, marginVertical: 6 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  expiryText: { flexShrink: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#718096', textAlign: 'center' },
  queueNote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 20 },
});
