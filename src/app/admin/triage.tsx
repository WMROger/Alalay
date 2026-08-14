import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, TextInput } from 'react-native';
import { CheckCircle2, ClipboardList, Contact, FileCheck, KeyRound, Pill, ShieldCheck, UserPlus, Smartphone } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { createInitialAdmissionSteps, useStore } from '../../store/useStore';
import { StaffStatusBoard } from '../../components/StaffStatusBoard';

type PreviewTab = 'admission' | 'cf1' | 'consent';

const DOCUMENT_TEMPLATES: { name: string; previewTab: PreviewTab; meta: string }[] = [
  { name: 'PhilHealth MDR-equivalent', previewTab: 'admission', meta: 'Patient-authorized membership reference' },
  { name: 'VSMMC Admission Form', previewTab: 'admission', meta: 'Hospital admission details' },
  { name: 'PhilHealth CF1', previewTab: 'cf1', meta: 'Member and patient claim information' },
  { name: 'Patient Consent', previewTab: 'consent', meta: 'Visit-sharing consent and signature record' },
];

const PREVIEW_TABS: { id: PreviewTab; label: string }[] = [
  { id: 'admission', label: 'ADMISSION FORM' },
  { id: 'cf1', label: 'CF1' },
  { id: 'consent', label: 'CONSENT' },
];

export default function AdmissionQueueScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preview?: string }>();
  const openedTemplatePreview = useRef(false);
  const [scanState, setScanState] = useState<'listening' | 'receiving' | 'pending' | 'matched'>('listening');
  const [enteredCode, setEnteredCode] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>('admission');
  const masterProfile = useStore(state => state.masterProfile);
  const visitLog = useStore(state => state.visitLog);
  const beneficiaries = useStore(state => state.beneficiaries);
  const updateVisitLog = useStore(state => state.updateVisitLog);
  const updateMasterProfile = useStore(state => state.updateMasterProfile);
  const addBeneficiary = useStore(state => state.addBeneficiary);
  const setActivePatient = useStore(state => state.setActivePatient);
  const addPendingAction = useStore(state => state.addPendingAction);
  const setHasOnboarded = useStore(state => state.setHasOnboarded);
  
  // Radar Animation
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (scanState === 'listening') {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // color/scale needs false for some web setups, but opacity is fine
        })
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [scanState]);

  const simulateIncomingScan = (openPreview?: PreviewTab) => {
    setHasOnboarded(true);
    if (!masterProfile.firstName) {
      updateMasterProfile({
        firstName: 'Elena',
        lastName: 'Cruz',
        dateOfBirth: '04/15/1984',
        sex: 'Female',
        civilStatus: 'Married',
        address: { street: '142 Magsaysay Street', city: 'Cebu City', region: 'Central Visayas' },
        contactNumber: '0917 555 0142',
        philhealthId: '12-094382743-1',
        memberCategory: 'Formal Economy',
        bloodType: 'O+',
        knownAllergies: ['None known'],
        currentMedications: [],
        chronicConditions: [],
        emergencyContact: { name: 'Marco Cruz', relationship: 'Brother', phone: '0917 555 0199' },
        identitySource: 'demo',
      });
    }
    if (!beneficiaries.some((beneficiary) => beneficiary.id === 'beneficiary-ben-cruz')) {
      addBeneficiary({
        id: 'beneficiary-ben-cruz',
        firstName: 'Ben',
        lastName: 'Cruz',
        relationship: 'Father',
        pin: '12-987654321-0',
        specialId: '',
        dateOfBirth: '03/09/1958',
        sex: 'Male',
        contactNumber: '0917 123 4567',
        knownAllergies: ['None known'],
        currentMedications: ['Amlodipine 5 mg'],
        chronicConditions: ['Hypertension'],
        emergencyContact: { name: 'Marco Cruz', relationship: 'Son', phone: '0917 555 0199' },
        prescriptionPhotoUrl: 'seeded-demo-prescription',
        verificationStatus: 'verified',
        profileSource: 'demo',
      });
    }
    setActivePatient('beneficiary-ben-cruz');
    addPendingAction({
      id: 'missing-senior-id-beneficiary-ben-cruz',
      patientId: 'beneficiary-ben-cruz',
      kind: 'missing_senior_id',
      title: 'Add Ben Cruz’s Senior Citizen ID',
      description: 'The ID was not available during check-in. Admission continued, but the hospital may need it before applying a senior discount.',
      status: 'open',
      route: '/profile',
      createdAt: new Date().toISOString(),
    });
    if (!visitLog.hospitalName) {
      updateVisitLog({
        hospitalName: 'Vicente Sotto Memorial Medical Center',
        deskName: 'Main Admission Desk',
        modeOfAdmission: 'ER',
        matchCode: '428',
        status: 'pending',
        dataSharingConsent: true,
        supportsLiveStatus: true,
        checkedInAt: new Date().toISOString(),
        admissionSteps: createInitialAdmissionSteps(),
        patientId: 'beneficiary-ben-cruz',
        patientName: 'Ben Cruz',
        patientRelationship: 'Father',
        patientDateOfBirth: '03/09/1958',
        patientSex: 'Male',
        patientPin: '12-987654321-0',
        patientContactNumber: '0917 123 4567',
        patientAllergies: ['None known'],
        patientMedications: ['Amlodipine 5 mg'],
        patientConditions: ['Hypertension'],
        patientPrescriptionPhotoUrl: 'seeded-demo-prescription',
        savedEmergencyContact: { name: 'Marco Cruz', relationship: 'Son', phone: '0917 555 0199' },
        visitEmergencyContact: { name: 'Rosa Santos', relationship: 'Neighbor', phone: '0917 555 0166' },
        seniorIdAvailable: false,
        consentAcknowledgedAt: new Date().toISOString(),
        consentAcknowledgedBy: 'Elena Cruz',
      });
    }
    if (openPreview) {
      const template = DOCUMENT_TEMPLATES.find((item) => item.previewTab === openPreview)?.name || 'VSMMC Admission Form';
      const generatedAt = new Date().toISOString();
      updateVisitLog({ status: 'matched', generatedDocuments: [template], documentsGeneratedAt: generatedAt });
      setSelectedDocuments([template]);
      setActivePreviewTab(openPreview);
      setPreviewGenerated(true);
      setScanState('matched');
    } else {
      setScanState('receiving');
      setTimeout(() => {
        setScanState('pending');
      }, 1500);
    }
  };

  useEffect(() => {
    if (openedTemplatePreview.current) return;
    if (params.preview !== 'cf1' && params.preview !== 'consent') return;
    openedTemplatePreview.current = true;
    simulateIncomingScan(params.preview);
  }, [params.preview]);

  const handleReject = () => {
    setScanState('listening');
    setEnteredCode('');
  };

  const expectedMatchCode = visitLog.matchCode || '428';

  const confirmMatchCode = () => {
    if (enteredCode === expectedMatchCode) {
      updateVisitLog({ status: 'matched' });
      setSelectedDocuments([]);
      setPreviewGenerated(false);
      setScanState('matched');
    }
  };

  const handleAdmit = () => {
    setScanState('listening');
    router.push('/reference');
  };

  const toggleDocument = (document: string) => {
    setSelectedDocuments((current) => current.includes(document)
      ? current.filter((item) => item !== document)
      : [...current, document]);
    setPreviewGenerated(false);
  };

  const generatePreview = () => {
    const generatedAt = new Date().toISOString();
    updateVisitLog({ generatedDocuments: selectedDocuments, documentsGeneratedAt: generatedAt });
    const firstSelectedTemplate = DOCUMENT_TEMPLATES.find((template) => selectedDocuments.includes(template.name));
    setActivePreviewTab(firstSelectedTemplate?.previewTab || 'admission');
    setPreviewGenerated(true);
  };

  const pName = visitLog.patientName ? visitLog.patientName.toUpperCase() : masterProfile.firstName ? `${masterProfile.lastName.toUpperCase()}, ${masterProfile.firstName.toUpperCase()}` : 'DELA CRUZ, JUAN, M';
  const pAddress = masterProfile.address && typeof masterProfile.address === 'object' && masterProfile.address.city ? `${masterProfile.address.street}, ${masterProfile.address.city}, ${masterProfile.address.region}` : '142 MAGSAYSAY ST, CEBU CITY, CEBU';
  const pTel = visitLog.patientContactNumber || masterProfile.contactNumber || '0917-555-0192';
  const pSex = (visitLog.patientSex || masterProfile.sex || 'Male').toUpperCase();
  const sourceBirthday = visitLog.patientDateOfBirth || masterProfile.dateOfBirth;
  const pBday = sourceBirthday ? new Date(sourceBirthday).toLocaleDateString() : '04/15/1988';
  
  let pAge = '38';
  if (sourceBirthday) {
    const dob = new Date(sourceBirthday);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    pAge = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  }
  
  const pBlood = masterProfile.bloodType || 'O+';
  const pPhil = visitLog.patientPin || masterProfile.philhealthId || '12-094382743-1';
  const pAllergy = visitLog.patientAllergies.length > 0 ? visitLog.patientAllergies.join(', ').toUpperCase() : (masterProfile.knownAllergies.length > 0 ? masterProfile.knownAllergies.join(', ').toUpperCase() : 'NONE KNOWN');
  const documentReferenceId = `ALALAY-${(visitLog.patientName || 'BEN-CRUZ').replace(/[^a-z0-9]/gi, '-').toUpperCase()}-${visitLog.matchCode || '428'}`;
  const documentQrPayload = JSON.stringify({
    type: 'alalay-reference',
    referenceId: documentReferenceId,
    patientId: visitLog.patientId || 'beneficiary-ben-cruz',
  });
  const isSelfVisit = visitLog.patientId === 'self' || visitLog.patientRelationship === 'My profile';
  const approvingPerson = visitLog.consentAcknowledgedBy
    || (isSelfVisit ? visitLog.patientName : `${masterProfile.firstName} ${masterProfile.lastName}`.trim())
    || 'Account holder';
  const consentStatement = isSelfVisit
    ? `I confirm that this is my information and agree to share the details shown above with ${visitLog.hospitalName || 'the hospital'} for this visit.`
    : `I confirm that I am assisting ${visitLog.patientName || 'the selected patient'} and agree to share the information shown above with ${visitLog.hospitalName || 'the hospital'} for this visit.`;
  const hasIncomingPatient = scanState !== 'listening';
  const queueEntries = [
    ...(hasIncomingPatient ? [{
      id: 'current-arrival',
      name: visitLog.patientName || 'Ben Cruz',
      detail: `${visitLog.modeOfAdmission || 'ER'} · ${visitLog.patientRelationship || 'Father'}`,
      arrived: 'Just now',
      status: scanState === 'matched' ? 'Record open' : scanState === 'pending' ? 'Needs match code' : 'Receiving',
      tone: scanState === 'matched' ? 'matched' : 'new',
      isNew: true,
    }] : []),
    {
      id: 'seeded-maria',
      name: 'Maria Santos',
      detail: 'OPD · My profile',
      arrived: '11:26 AM',
      status: 'Waiting for registrar',
      tone: 'waiting',
      isNew: false,
    },
    {
      id: 'seeded-joel',
      name: 'Joel Ramos',
      detail: 'Transfer · My profile',
      arrived: '11:18 AM',
      status: 'Matched',
      tone: 'matched',
      isNew: false,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <ClipboardList color="#007AFF" size={32} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Admission Queue</Text>
          <Text style={styles.subtitle}>Live administrative check-ins from admission desk QR codes.</Text>
        </View>
        
        {/* Hidden Simulation Button for Pitch */}
        <TouchableOpacity style={styles.simBtn} onPress={() => simulateIncomingScan()} accessibilityRole="button" accessibilityLabel="Add sample check-in">
          <Smartphone color="#718096" size={16} />
          <Text style={styles.simBtnText}>Add sample check-in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.queueCard}>
          <View style={styles.queueHeader}>
            <View>
              <Text style={styles.queueEyebrow}>LIVE INCOMING QUEUE</Text>
              <Text style={styles.queueTitle}>{queueEntries.length} administrative check-ins</Text>
            </View>
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveBadgeText}>LIVE DEMO</Text></View>
          </View>
          <Text style={styles.queueNotice}>Arrival order only. Alalay does not rank medical urgency.</Text>
          <View style={styles.queueList}>
            {queueEntries.map((entry) => (
              <View key={entry.id} style={[styles.queueRow, entry.isNew && styles.queueRowNew]}>
                <View style={[styles.queueAvatar, entry.isNew && styles.queueAvatarNew]}>
                  <Text style={[styles.queueAvatarText, entry.isNew && styles.queueAvatarTextNew]}>{entry.name.charAt(0)}</Text>
                </View>
                <View style={styles.queuePatientCopy}>
                  <View style={styles.queueNameRow}>
                    <Text style={styles.queuePatientName}>{entry.name}</Text>
                    {entry.isNew ? <Text style={styles.queueNewLabel}>NEW ARRIVAL</Text> : null}
                  </View>
                  <Text style={styles.queuePatientMeta}>{entry.detail} · Arrived {entry.arrived}</Text>
                </View>
                <View style={[
                  styles.queueStatus,
                  entry.tone === 'matched' && styles.queueStatusMatched,
                  entry.tone === 'new' && styles.queueStatusNew,
                ]}>
                  <Text style={[
                    styles.queueStatusText,
                    entry.tone === 'matched' && styles.queueStatusTextMatched,
                    entry.tone === 'new' && styles.queueStatusTextNew,
                  ]}>{entry.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {scanState === 'listening' && (
          <View style={styles.listeningArea}>
            <Animated.View style={[
              styles.radarCircle, 
              {
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }]
              }
            ]} />
            <ClipboardList color="#007AFF" size={48} style={{ zIndex: 10 }} />
            <Text style={styles.listeningTitle}>Waiting for Check-Ins</Text>
            <Text style={styles.listeningDesc}>New patient check-ins will appear here in arrival order. This queue does not assess urgency.</Text>
          </View>
        )}

        {scanState === 'receiving' && (
          <View style={[styles.listeningArea, { backgroundColor: '#F0FFF4', borderColor: '#C6F6D5' }]}>
            <UserPlus color="#38A169" size={48} />
            <Text style={[styles.listeningTitle, { color: '#276749' }]}>Incoming Check-In: {visitLog.patientName || 'Ben Cruz'}</Text>
            <Text style={styles.listeningDesc}>Receiving the patient-authorized profile for registrar review...</Text>
          </View>
        )}

        {scanState === 'pending' && (
          <View style={styles.matchCard}>
            <View style={styles.newArrivalBadge}><Text style={styles.newArrivalText}>NEW ARRIVAL · JUST NOW</Text></View>
            <View style={styles.matchIcon}><KeyRound color="#2B6CB0" size={30} /></View>
            <Text style={styles.matchTitle}>Confirm patient match code</Text>
            <Text style={styles.matchDescription}>Ask the patient for the 3-digit code shown on their phone before opening the record.</Text>
            <View style={styles.checkInSummary}>
              <Text style={styles.summaryName}>{visitLog.patientName || 'Ben Cruz'}</Text>
              <Text style={styles.summaryMeta}>Arrival: {visitLog.modeOfAdmission || 'ER'} · Status: Pending</Text>
              {!!visitLog.visitNote && <Text style={styles.summaryNote}>Patient note: {visitLog.visitNote}</Text>}
              {!!visitLog.consentAcknowledgedAt && <Text style={styles.consentLogged}>Sharing acknowledged · {new Date(visitLog.consentAcknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
              {visitLog.modeOfAdmission === 'Transfer' && <Text style={styles.referralReminder}>Request referral letter or transfer summary.</Text>}
            </View>
            <TextInput
              style={styles.codeInput}
              value={enteredCode}
              onChangeText={setEnteredCode}
              placeholder="3-digit code"
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.demoHint}>Patient match code: {expectedMatchCode}</Text>
            <View style={styles.matchActions}>
              <TouchableOpacity style={styles.closeQueueButton} onPress={handleReject}>
                <Text style={styles.closeQueueButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmMatchButton, enteredCode !== expectedMatchCode && { opacity: 0.45 }]}
                onPress={confirmMatchCode}
                disabled={enteredCode !== expectedMatchCode}
              >
                <Text style={styles.confirmMatchButtonText}>Confirm & Open Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {scanState === 'matched' && (
          <View style={styles.completeArea}>
            <View style={styles.patientRecordCard}>
              <View style={styles.patientRecordHeader}>
                <View>
                  <Text style={styles.patientRecordEyebrow}>MATCHED PATIENT</Text>
                  <Text style={styles.patientRecordName}>{visitLog.patientName || 'Ben Cruz'}</Text>
                  <Text style={styles.patientRecordMeta}>{visitLog.patientRelationship || 'Dependent'} · {visitLog.modeOfAdmission} · Checked in {visitLog.checkedInAt ? new Date(visitLog.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}</Text>
                </View>
                <View style={styles.matchedBadge}><CheckCircle2 color="#137A67" size={15} /><Text style={styles.matchedBadgeText}>MATCHED</Text></View>
              </View>
              <View style={styles.patientSignals}>
                <View style={styles.signalCard}><Pill color="#246BCE" size={18} /><Text style={styles.signalTitle}>Medication</Text><Text style={styles.signalValue}>{visitLog.patientMedications.join(', ') || 'None listed'}</Text></View>
                <View style={styles.signalCard}><FileCheck color="#137A67" size={18} /><Text style={styles.signalTitle}>Prescription</Text><Text style={styles.signalValue}>{visitLog.patientPrescriptionPhotoUrl ? 'Attached' : 'Not attached'}</Text></View>
                <View style={styles.signalCard}><Contact color="#A05A16" size={18} /><Text style={styles.signalTitle}>Visit contact</Text><Text style={styles.signalValue}>{visitLog.visitEmergencyContact ? `${visitLog.visitEmergencyContact.name} · ${visitLog.visitEmergencyContact.relationship}` : visitLog.savedEmergencyContact.name || 'Not provided'}</Text></View>
              </View>
              {visitLog.visitEmergencyContact && (
                <Text style={styles.visitContactNotice}>Visit-only contact. Saved profile contact: {visitLog.savedEmergencyContact.name} · Hospital staff cannot edit either contact.</Text>
              )}
            </View>

            <View style={styles.documentPickerCard}>
              <View style={styles.documentPickerHeader}>
                <View><Text style={styles.documentPickerTitle}>Generate admission documents</Text><Text style={styles.documentPickerText}>Select the templates needed for this patient, then preview the populated result.</Text></View>
                <Text style={styles.selectedCount}>{selectedDocuments.length} SELECTED</Text>
              </View>
              <View style={styles.documentChoicesRow}>
                {DOCUMENT_TEMPLATES.map((template) => {
                  const selected = selectedDocuments.includes(template.name);
                  return (
                    <TouchableOpacity key={template.name} style={[styles.documentTemplateChoice, selected && styles.documentTemplateChoiceSelected]} onPress={() => toggleDocument(template.name)}>
                      <View style={[styles.documentCheckbox, selected && styles.documentCheckboxSelected]}>{selected && <Text style={styles.documentCheckmark}>✓</Text>}</View>
                      <View style={{ flex: 1 }}><Text style={styles.documentTemplateTitle}>{template.name}</Text><Text style={styles.documentTemplateMeta}>{template.meta}</Text></View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={[styles.generateButton, selectedDocuments.length === 0 && styles.generateButtonDisabled]} onPress={generatePreview} disabled={selectedDocuments.length === 0}>
                  <FileCheck color="#FFFFFF" size={17} /><Text style={styles.generateButtonText}>{previewGenerated ? 'Preview generated' : 'Generate preview'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {previewGenerated && (
            <View style={styles.pdfViewerContainer}>
            <View style={styles.pdfViewerHeader}>
              <TouchableOpacity onPress={handleReject} style={{ padding: 8 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
              
              <View style={styles.pdfViewerTabs}>
                {PREVIEW_TABS.map((tab) => {
                  const active = activePreviewTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[styles.pdfViewerTab, active && styles.pdfViewerTabActive]}
                      onPress={() => setActivePreviewTab(tab.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.pdfViewerTabText, active && styles.pdfViewerTabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={handleAdmit} style={styles.pdfViewerActionBtn}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 13 }}>Share / Print PDF</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.pdfViewerBody} style={{ flex: 1 }}>
              {activePreviewTab === 'admission' && (
              <View style={styles.mdrForm}>
                
                {/* Header */}
                <View style={styles.mdrHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mdrHeaderTiny}>Republic of the Philippines</Text>
                    <Text style={styles.mdrHeaderTitle}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
                    <Text style={styles.mdrHeaderTiny}>Corporate Action Center Hotline : (02) 441-7442</Text>
                    <Text style={styles.mdrHeaderTiny}>www.philhealth.gov.ph</Text>
                  </View>
                  <View style={styles.documentQrBlock}>
                    <QRCode value={documentQrPayload} size={64} color="#000000" backgroundColor="#FFFFFF" />
                    <Text style={styles.documentQrReference}>{documentReferenceId}</Text>
                  </View>
                </View>

                <Text style={styles.mdrMainTitle}>MEMBER DATA RECORD</Text>

                {/* Section 1 */}
                <View style={styles.mdrSectionBox}>
                  <Text style={styles.mdrSectionTitle}>MEMBER BASIC INFORMATION</Text>
                  
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>PhilHealth Identification Number (PIN)</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={[styles.mdrValue, { fontWeight: '700' }]}>{pPhil}</Text>
                  </View>

                  <View style={styles.mdrRow}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <Text style={styles.mdrLabel}>Member Category</Text>
                      <Text style={styles.mdrColon}>:</Text>
                      <Text style={styles.mdrValue}>FORMAL ECONOMY</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <Text style={styles.mdrLabel}>PhilSys Number</Text>
                      <Text style={styles.mdrColon}>:</Text>
                      <Text style={styles.mdrValue}>NA</Text>
                    </View>
                  </View>

                  <View style={[styles.mdrRow, { marginTop: 16, marginBottom: 8 }]}>
                    <Text style={[styles.mdrValue, { fontWeight: '700', fontSize: 14 }]}>{pName}</Text>
                  </View>

                  <View style={styles.mdrRow}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <Text style={styles.mdrLabel}>Permanent Address</Text>
                      <Text style={styles.mdrColon}>:</Text>
                      <Text style={[styles.mdrValue, { flex: 1 }]} numberOfLines={2}>{pAddress}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.mdrRow}><Text style={styles.mdrLabel}>Sex</Text><Text style={styles.mdrColon}>:</Text><Text style={styles.mdrValue}>{pSex}</Text></View>
                        <View style={styles.mdrRow}><Text style={styles.mdrLabel}>Date of Birth</Text><Text style={styles.mdrColon}>:</Text><Text style={styles.mdrValue}>{pBday}</Text></View>
                        <View style={styles.mdrRow}><Text style={styles.mdrLabel}>Age</Text><Text style={styles.mdrColon}>:</Text><Text style={styles.mdrValue}>{pAge}</Text></View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Contact No.</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{pTel}</Text>
                  </View>
                </View>

                {/* Section 2 */}
                <View style={styles.mdrSectionBox}>
                  <Text style={styles.mdrSectionTitle}>ENTITY INFORMATION</Text>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>PhilHealth Number (PEN/POGN)</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>NA</Text>
                  </View>
                </View>

                {/* Medical Data (Custom added to MDR for demo) */}
                <View style={styles.mdrSectionBox}>
                  <Text style={styles.mdrSectionTitle}>CLINICAL ALERTS</Text>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Blood Type</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{pBlood}</Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Known Allergies</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={[styles.mdrValue, { color: '#E53E3E', fontWeight: '700' }]}>{pAllergy}</Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Current Medications</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{visitLog.patientMedications.join(', ').toUpperCase() || 'NONE LISTED'}</Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Prescription Attachment</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{visitLog.patientPrescriptionPhotoUrl ? 'ATTACHED TO VISIT SNAPSHOT' : 'NONE'}</Text>
                  </View>
                </View>

                <View style={styles.mdrSectionBox}>
                  <Text style={styles.mdrSectionTitle}>VISIT-SPECIFIC ADMISSION DETAILS</Text>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Emergency Contact for this Visit</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>
                      {visitLog.visitEmergencyContact
                        ? `${visitLog.visitEmergencyContact.name.toUpperCase()} / ${visitLog.visitEmergencyContact.relationship.toUpperCase()} / ${visitLog.visitEmergencyContact.phone}`
                        : `${visitLog.savedEmergencyContact.name.toUpperCase()} / ${visitLog.savedEmergencyContact.relationship.toUpperCase()} / ${visitLog.savedEmergencyContact.phone}`}
                    </Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Contact Ownership</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{visitLog.visitEmergencyContact ? 'VISIT ONLY - SAVED PROFILE UNCHANGED' : 'SAVED PROFILE CONTACT'}</Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Senior Citizen ID</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{visitLog.seniorIdAvailable === false ? 'NOT AVAILABLE NOW - NON-BLOCKING FOLLOW-UP' : 'AVAILABLE'}</Text>
                  </View>
                  <View style={styles.mdrRow}>
                    <Text style={styles.mdrLabel}>Sharing Acknowledgment</Text>
                    <Text style={styles.mdrColon}>:</Text>
                    <Text style={styles.mdrValue}>{visitLog.consentAcknowledgedAt ? `LOGGED ${new Date(visitLog.consentAcknowledgedAt).toLocaleString()}` : 'NOT LOGGED'}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 60, alignItems: 'flex-end', paddingRight: 32 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, textAlign: 'center' }}>HENRY V. ALMANON</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, textAlign: 'center' }}>REGIONAL VICE PRESIDENT</Text>
                </View>

              </View>
              )}

              {activePreviewTab === 'cf1' && (
                <View style={styles.previewDocument}>
                  <View style={styles.previewDocHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.previewRepublic}>Republic of the Philippines</Text>
                      <Text style={styles.previewAgency}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
                      <Text style={styles.previewReference}>CF1 · MEMBER AND PATIENT INFORMATION</Text>
                    </View>
                    <View style={styles.documentQrBlock}>
                      <QRCode value={documentQrPayload} size={64} color="#1A202C" backgroundColor="#FFFFFF" />
                      <Text style={styles.documentQrReference}>{documentReferenceId}</Text>
                    </View>
                  </View>
                  <View style={styles.prototypeBanner}><Text style={styles.prototypeBannerText}>POPULATED REFERENCE PREVIEW · NOT YET SUBMITTED TO PHILHEALTH</Text></View>

                  <Text style={styles.previewSectionTitle}>I. MEMBER INFORMATION</Text>
                  <View style={styles.previewGrid}>
                    <View style={styles.previewFieldWide}><Text style={styles.previewFieldLabel}>PhilHealth Identification Number</Text><Text style={styles.previewFieldValue}>{pPhil}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Member name</Text><Text style={styles.previewFieldValue}>ELENA CRUZ</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Member category</Text><Text style={styles.previewFieldValue}>FORMAL ECONOMY</Text></View>
                  </View>

                  <Text style={styles.previewSectionTitle}>II. PATIENT INFORMATION</Text>
                  <View style={styles.previewGrid}>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Patient name</Text><Text style={styles.previewFieldValue}>{visitLog.patientName.toUpperCase() || 'BEN CRUZ'}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Relationship to member</Text><Text style={styles.previewFieldValue}>{visitLog.patientRelationship.toUpperCase() || 'FATHER'}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Date of birth</Text><Text style={styles.previewFieldValue}>{pBday}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Sex</Text><Text style={styles.previewFieldValue}>{pSex}</Text></View>
                  </View>

                  <Text style={styles.previewSectionTitle}>III. CONFINEMENT INFORMATION</Text>
                  <View style={styles.previewGrid}>
                    <View style={styles.previewFieldWide}><Text style={styles.previewFieldLabel}>Health care institution</Text><Text style={styles.previewFieldValue}>{visitLog.hospitalName.toUpperCase()}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Admission type</Text><Text style={styles.previewFieldValue}>{visitLog.modeOfAdmission}</Text></View>
                    <View style={styles.previewField}><Text style={styles.previewFieldLabel}>Check-in date</Text><Text style={styles.previewFieldValue}>{visitLog.checkedInAt ? new Date(visitLog.checkedInAt).toLocaleDateString() : '—'}</Text></View>
                  </View>

                  <View style={styles.certificationBox}>
                    <Text style={styles.certificationTitle}>MEMBER CERTIFICATION</Text>
                    <Text style={styles.certificationText}>The information above was populated from the patient-authorized Alalay visit snapshot. Hospital staff must verify it against official records before using an official PhilHealth claim form.</Text>
                    <View style={styles.signatureRow}>
                      <View style={styles.signatureBlock}><View style={styles.signatureLine} /><Text style={styles.signatureLabel}>Member / authorized representative</Text></View>
                      <View style={styles.signatureBlock}><View style={styles.signatureLine} /><Text style={styles.signatureLabel}>Date signed</Text></View>
                    </View>
                  </View>
                </View>
              )}

              {activePreviewTab === 'consent' && (
                <View style={styles.previewDocument}>
                  <View style={styles.consentHeader}>
                    <View style={styles.consentMark}><Text style={styles.consentMarkText}>A</Text></View>
                    <View style={{ flex: 1 }}><Text style={styles.consentBrand}>ALALAY</Text><Text style={styles.previewReference}>VISIT INFORMATION SHARING ACKNOWLEDGMENT</Text></View>
                    <View style={styles.consentQrColumn}>
                      <QRCode value={documentQrPayload} size={58} color="#173B4A" backgroundColor="#FFFFFF" />
                      <View style={styles.timestampBadge}><Text style={styles.timestampBadgeText}>TIMESTAMPED</Text></View>
                    </View>
                  </View>

                  <Text style={styles.consentTitle}>Patient-authorized sharing record</Text>
                  <Text style={styles.consentIntro}>This page records the information {approvingPerson} reviewed and approved for this hospital visit.</Text>

                  <View style={styles.consentStatement}>
                    <CheckCircle2 color="#137A67" size={22} />
                    <Text style={styles.consentStatementText}>{consentStatement}</Text>
                  </View>

                  <Text style={styles.previewSectionTitle}>SHARING DETAILS</Text>
                  <View style={styles.consentDetailRow}><Text style={styles.consentDetailLabel}>Patient</Text><Text style={styles.consentDetailValue}>{visitLog.patientName || 'Ben Cruz'} · {visitLog.patientRelationship || 'Father'}</Text></View>
                  <View style={styles.consentDetailRow}><Text style={styles.consentDetailLabel}>Approved by</Text><Text style={styles.consentDetailValue}>{approvingPerson}</Text></View>
                  <View style={styles.consentDetailRow}><Text style={styles.consentDetailLabel}>Hospital desk</Text><Text style={styles.consentDetailValue}>{visitLog.hospitalName} · {visitLog.deskName}</Text></View>
                  <View style={styles.consentDetailRow}><Text style={styles.consentDetailLabel}>Recorded at</Text><Text style={styles.consentDetailValue}>{visitLog.consentAcknowledgedAt ? new Date(visitLog.consentAcknowledgedAt).toLocaleString() : 'Not recorded'}</Text></View>
                  <View style={styles.consentDetailRow}><Text style={styles.consentDetailLabel}>Visit contact</Text><Text style={styles.consentDetailValue}>{visitLog.visitEmergencyContact ? `${visitLog.visitEmergencyContact.name} · ${visitLog.visitEmergencyContact.relationship} · Visit only` : `${visitLog.savedEmergencyContact.name} · Saved profile contact`}</Text></View>

                  <Text style={styles.previewSectionTitle}>INFORMATION INCLUDED</Text>
                  <View style={styles.includedGrid}>
                    {['Identity and contact details', 'PhilHealth membership details', 'Clinical alerts and medications', 'Visit-specific emergency contact', 'Attached prescription reference', 'Missing-document follow-up status'].map((item) => (
                      <View key={item} style={styles.includedItem}><CheckCircle2 color="#137A67" size={15} /><Text style={styles.includedText}>{item}</Text></View>
                    ))}
                  </View>

                  <View style={styles.legalWarning}>
                    <ShieldCheck color="#975A16" size={19} />
                    <Text style={styles.legalWarningText}>This acknowledgment does not replace the hospital’s official treatment, admission, billing, or informed-consent forms. It records only the Alalay information-sharing action for this visit.</Text>
                  </View>

                  <View style={styles.signatureRow}>
                    <View style={styles.signatureBlock}><Text style={styles.digitalSignature}>{approvingPerson}</Text><View style={styles.signatureLine} /><Text style={styles.signatureLabel}>Digitally acknowledged by</Text></View>
                    <View style={styles.signatureBlock}><Text style={styles.digitalSignature}>{visitLog.consentAcknowledgedAt ? new Date(visitLog.consentAcknowledgedAt).toLocaleDateString() : '—'}</Text><View style={styles.signatureLine} /><Text style={styles.signatureLabel}>Date</Text></View>
                  </View>
                </View>
              )}
              </ScrollView>
            </View>
            )}

            <StaffStatusBoard />
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageContent: { flexGrow: 1, paddingBottom: 44 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#2D3748', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096' },
  
  simBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#EDF2F7', borderRadius: 8 },
  simBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096' },

  content: { flex: 1 },

  queueCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE7E3', borderRadius: 18, padding: 18, marginBottom: 18 },
  queueHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  queueEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.1, color: '#137A67' },
  queueTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#1A202C', marginTop: 4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#137A67' },
  liveBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.7, color: '#137A67' },
  queueNotice: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#718096', marginTop: 5, marginBottom: 13 },
  queueList: { gap: 8 },
  queueRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 13, padding: 11 },
  queueRowNew: { backgroundColor: '#F0FFF8', borderColor: '#9ED6C9' },
  queueAvatar: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EEF2' },
  queueAvatarNew: { backgroundColor: '#137A67' },
  queueAvatarText: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#4A6170' },
  queueAvatarTextNew: { color: '#FFFFFF' },
  queuePatientCopy: { flex: 1 },
  queueNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  queuePatientName: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#2D3748' },
  queueNewLabel: { fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.7, color: '#137A67' },
  queuePatientMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#718096', marginTop: 4 },
  queueStatus: { borderRadius: 999, backgroundColor: '#FFF3DD', paddingHorizontal: 9, paddingVertical: 6 },
  queueStatusNew: { backgroundColor: '#E6F5F1' },
  queueStatusMatched: { backgroundColor: '#EAF2FF' },
  queueStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#975A16' },
  queueStatusTextNew: { color: '#137A67' },
  queueStatusTextMatched: { color: '#246BCE' },

  listeningArea: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  radarCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#EBF4FF' },
  listeningTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 24, color: '#2D3748', marginTop: 32, zIndex: 10 },
  listeningDesc: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096', marginTop: 12, zIndex: 10 },

  matchCard: { width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 32, alignItems: 'center' },
  matchIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  matchTitle: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#1A202C', textAlign: 'center' },
  matchDescription: { maxWidth: 460, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: '#718096', textAlign: 'center', marginTop: 8 },
  checkInSummary: { width: '100%', backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, marginVertical: 20 },
  newArrivalBadge: { alignSelf: 'flex-start', backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 14 },
  newArrivalText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: '#137A67' },
  summaryName: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#2D3748' },
  summaryMeta: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096', marginTop: 5 },
  summaryNote: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#4A5568', marginTop: 10 },
  consentLogged: { fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 17, color: '#137A67', marginTop: 9 },
  referralReminder: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#975A16', backgroundColor: '#FFFAF0', padding: 10, borderRadius: 8, marginTop: 10 },
  codeInput: { width: 180, borderWidth: 2, borderColor: '#CBD5E0', borderRadius: 12, padding: 14, textAlign: 'center', fontFamily: 'Sora_700Bold', fontSize: 26, letterSpacing: 8, color: '#1A202C' },
  demoHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#A0AEC0', marginTop: 8 },
  matchActions: { width: '100%', flexDirection: 'row', gap: 12, marginTop: 22 },
  closeQueueButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  closeQueueButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#4A5568' },
  confirmMatchButton: { flex: 2, backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  confirmMatchButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },

  completeArea: { flex: 1 },
  successBanner: { backgroundColor: '#38A169', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  successBannerText: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  patientRecordCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE8E5', borderRadius: 16, padding: 20, marginBottom: 18 },
  patientRecordHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  patientRecordEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: '#137A67', marginBottom: 5 },
  patientRecordName: { fontFamily: 'Sora_700Bold', fontSize: 21, color: '#1A202C' },
  patientRecordMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096', marginTop: 5 },
  matchedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  matchedBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7, color: '#137A67' },
  patientSignals: { flexDirection: 'row', gap: 10, marginTop: 17 },
  signalCard: { flex: 1, minWidth: 0, backgroundColor: '#F7FAFC', borderRadius: 12, padding: 13 },
  signalTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#718096', marginTop: 8 },
  signalValue: { fontFamily: 'Sora_600SemiBold', fontSize: 11, lineHeight: 16, color: '#2D3748', marginTop: 3 },
  visitContactNotice: { fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 16, color: '#975A16', backgroundColor: '#FFFAF0', borderRadius: 9, padding: 10, marginTop: 11 },

  documentPickerCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE8E5', borderRadius: 16, padding: 20, marginBottom: 18 },
  documentPickerHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 },
  documentPickerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#1A202C' },
  documentPickerText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#718096', marginTop: 4 },
  selectedCount: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8, color: '#246BCE', backgroundColor: '#EBF4FF', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  documentChoicesRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 10 },
  documentTemplateChoice: { flexGrow: 1, flexBasis: 220, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 11, padding: 12, backgroundColor: '#F8FAFC' },
  documentTemplateChoiceSelected: { borderColor: '#7EB5F8', backgroundColor: '#F0F6FF' },
  documentCheckbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#A0AEC0', borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  documentCheckboxSelected: { borderColor: '#246BCE', backgroundColor: '#246BCE' },
  documentCheckmark: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#FFFFFF' },
  documentTemplateTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, lineHeight: 16, color: '#2D3748' },
  documentTemplateMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#718096', marginTop: 3 },
  generateButton: { minWidth: 170, minHeight: 58, flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#246BCE', borderRadius: 10, paddingHorizontal: 14 },
  generateButtonDisabled: { backgroundColor: '#A0AEC0' },
  generateButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFFFFF' },

  mdrForm: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 800, minHeight: 1000, padding: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginBottom: 32 },
  mdrHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  documentQrBlock: { width: 116, alignItems: 'center', gap: 5 },
  documentQrReference: { width: 116, fontFamily: 'Inter_500Medium', fontSize: 6, lineHeight: 9, color: '#4A5568', textAlign: 'center' },
  mdrHeaderTiny: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A202C' },
  mdrHeaderTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A202C' },
  mdrMainTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A202C', textAlign: 'center', textDecorationLine: 'underline', marginBottom: 24 },
  
  mdrSectionBox: { marginBottom: 16 },
  mdrSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 10, backgroundColor: '#E2E8F0', paddingHorizontal: 4, paddingVertical: 2, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1A202C', marginBottom: 8 },
  mdrRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  mdrLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, width: 200, color: '#1A202C' },
  mdrColon: { fontFamily: 'Inter_400Regular', fontSize: 9, width: 16, color: '#1A202C' },
  mdrValue: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A202C' },

  pdfViewerContainer: { height: 720, backgroundColor: '#323639', borderRadius: 8, overflow: 'hidden', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  pdfViewerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#202124', paddingHorizontal: 16, height: 48 },
  pdfViewerTabs: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  pdfViewerTabActive: { borderBottomWidth: 3, borderBottomColor: '#8AB4F8', height: 48, justifyContent: 'center' },
  pdfViewerTab: { height: 48, justifyContent: 'center', paddingHorizontal: 4 },
  pdfViewerTabText: { color: '#9AA0A6', fontFamily: 'Inter_500Medium', fontSize: 13 },
  pdfViewerTabTextActive: { color: '#8AB4F8', fontFamily: 'Inter_600SemiBold' },
  pdfViewerActionBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  pdfViewerBody: { padding: 32, alignItems: 'center' },

  previewDocument: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 800, minHeight: 920, padding: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginBottom: 32 },
  previewDocHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 22 },
  previewRepublic: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#4A5568' },
  previewAgency: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#1A202C', marginTop: 3 },
  previewReference: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, color: '#4A5568', marginTop: 5 },
  prototypeBanner: { backgroundColor: '#EBF4FF', borderWidth: 1, borderColor: '#BFD4F3', borderRadius: 7, padding: 9, marginBottom: 24 },
  prototypeBannerText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.7, color: '#246BCE', textAlign: 'center' },
  previewSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, color: '#FFFFFF', backgroundColor: '#334E68', paddingHorizontal: 10, paddingVertical: 7, marginTop: 8, marginBottom: 10 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  previewField: { flexGrow: 1, flexBasis: '47%', minHeight: 58, borderWidth: 1, borderColor: '#CBD5E0', padding: 10 },
  previewFieldWide: { width: '100%', minHeight: 58, borderWidth: 1, borderColor: '#CBD5E0', padding: 10 },
  previewFieldLabel: { fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 0.5, color: '#718096', textTransform: 'uppercase' },
  previewFieldValue: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A202C', marginTop: 7 },
  certificationBox: { borderWidth: 1, borderColor: '#A0AEC0', padding: 16, marginTop: 12 },
  certificationTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#1A202C' },
  certificationText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: '#4A5568', marginTop: 7 },
  signatureRow: { flexDirection: 'row', gap: 34, marginTop: 45 },
  signatureBlock: { flex: 1, alignItems: 'center' },
  signatureLine: { width: '100%', height: 1, backgroundColor: '#4A5568', marginTop: 5 },
  signatureLabel: { fontFamily: 'Inter_400Regular', fontSize: 8, color: '#718096', marginTop: 6, textAlign: 'center' },
  digitalSignature: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#173B4A' },

  consentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#CBD5E0', paddingBottom: 17, marginBottom: 26 },
  consentMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#137A67', alignItems: 'center', justifyContent: 'center' },
  consentMarkText: { fontFamily: 'Sora_700Bold', fontSize: 21, color: '#FFFFFF' },
  consentBrand: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#173B4A' },
  consentQrColumn: { alignItems: 'center', gap: 6 },
  timestampBadge: { backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  timestampBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 6, letterSpacing: 0.6, color: '#137A67' },
  consentTitle: { fontFamily: 'Sora_700Bold', fontSize: 23, color: '#173B4A' },
  consentIntro: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 18, color: '#667B75', marginTop: 7, marginBottom: 20 },
  consentStatement: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#E6F5F1', borderWidth: 1, borderColor: '#B9DED5', borderRadius: 12, padding: 16, marginBottom: 24 },
  consentStatementText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 18, color: '#173B4A' },
  consentDetailRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 10 },
  consentDetailLabel: { width: 150, fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#4A5568' },
  consentDetailValue: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#1A202C' },
  includedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  includedItem: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F7FAFC', borderRadius: 8, padding: 10 },
  includedText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 8, lineHeight: 12, color: '#4A5568' },
  legalWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFAF0', borderWidth: 1, borderColor: '#FEEBC8', borderRadius: 11, padding: 13, marginTop: 8 },
  legalWarningText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: '#744210' },
});
