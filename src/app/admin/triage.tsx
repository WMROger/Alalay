import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, TextInput } from 'react-native';
import { ClipboardList, KeyRound, UserPlus, Smartphone, QrCode } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function AdmissionQueueScreen() {
  const router = useRouter();
  const [scanState, setScanState] = useState<'listening' | 'receiving' | 'pending' | 'matched'>('listening');
  const [enteredCode, setEnteredCode] = useState('');
  const masterProfile = useStore(state => state.masterProfile);
  const visitLog = useStore(state => state.visitLog);
  
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

  const simulateIncomingScan = () => {
    setScanState('receiving');
    setTimeout(() => {
      setScanState('pending');
    }, 1500);
  };

  const handleReject = () => {
    setScanState('listening');
    setEnteredCode('');
  };

  const expectedMatchCode = visitLog.matchCode || '428';

  const confirmMatchCode = () => {
    if (enteredCode === expectedMatchCode) {
      setScanState('matched');
    }
  };

  const handleAdmit = () => {
    setScanState('listening');
    router.push('/reference');
  };

  const pName = masterProfile.firstName ? `${masterProfile.lastName.toUpperCase()}, ${masterProfile.firstName.toUpperCase()}` : 'DELA CRUZ, JUAN, M';
  const pAddress = masterProfile.address && typeof masterProfile.address === 'object' && masterProfile.address.city ? `${masterProfile.address.street}, ${masterProfile.address.city}, ${masterProfile.address.region}` : '142 MAGSAYSAY ST, CEBU CITY, CEBU';
  const pTel = masterProfile.contactNumber || '0917-555-0192';
  const pSex = masterProfile.sex ? masterProfile.sex.toUpperCase() : 'MALE';
  const pBday = masterProfile.dateOfBirth ? new Date(masterProfile.dateOfBirth).toLocaleDateString() : '04/15/1988';
  
  let pAge = '38';
  if (masterProfile.dateOfBirth) {
    const dob = new Date(masterProfile.dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    pAge = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  }
  
  const pBlood = masterProfile.bloodType || 'O+';
  const pPhil = masterProfile.philhealthId || '12-094382743-1';
  const pAllergy = (masterProfile.knownAllergies && masterProfile.knownAllergies.length > 0) ? masterProfile.knownAllergies.join(', ').toUpperCase() : 'PENICILLIN';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <ClipboardList color="#007AFF" size={32} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Admission Queue</Text>
          <Text style={styles.subtitle}>Live administrative check-ins from admission desk QR codes.</Text>
        </View>
        
        {/* Hidden Simulation Button for Pitch */}
        <TouchableOpacity style={styles.simBtn} onPress={simulateIncomingScan}>
          <Smartphone color="#718096" size={16} />
          <Text style={styles.simBtnText}>Demo: Add Check-In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
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
            <Text style={[styles.listeningTitle, { color: '#276749' }]}>Incoming Check-In: {masterProfile.firstName} {masterProfile.lastName}</Text>
            <Text style={styles.listeningDesc}>Receiving the patient-authorized profile for registrar review...</Text>
          </View>
        )}

        {scanState === 'pending' && (
          <View style={styles.matchCard}>
            <View style={styles.matchIcon}><KeyRound color="#2B6CB0" size={30} /></View>
            <Text style={styles.matchTitle}>Confirm patient match code</Text>
            <Text style={styles.matchDescription}>Ask the patient for the 3-digit code shown on their phone before opening the record.</Text>
            <View style={styles.checkInSummary}>
              <Text style={styles.summaryName}>{masterProfile.firstName || 'Juan'} {masterProfile.lastName || 'Dela Cruz'}</Text>
              <Text style={styles.summaryMeta}>Arrival: {visitLog.modeOfAdmission || 'ER'} · Status: Pending</Text>
              {!!visitLog.visitNote && <Text style={styles.summaryNote}>Patient note: {visitLog.visitNote}</Text>}
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
            <Text style={styles.demoHint}>Demo code: {expectedMatchCode}</Text>
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
          <View style={styles.pdfViewerContainer}>
            <View style={styles.pdfViewerHeader}>
              <TouchableOpacity onPress={handleReject} style={{ padding: 8 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
              
              <View style={styles.pdfViewerTabs}>
                <View style={styles.pdfViewerTabActive}>
                  <Text style={{ color: '#8AB4F8', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>ADMISSION FORM</Text>
                </View>
                <View style={styles.pdfViewerTab}>
                  <Text style={{ color: '#9AA0A6', fontFamily: 'Inter_500Medium', fontSize: 13 }}>CF1</Text>
                </View>
                <View style={styles.pdfViewerTab}>
                  <Text style={{ color: '#9AA0A6', fontFamily: 'Inter_500Medium', fontSize: 13 }}>CONSENT</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleAdmit} style={styles.pdfViewerActionBtn}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 13 }}>Share / Print PDF</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.pdfViewerBody} style={{ flex: 1 }}>
              <View style={styles.mdrForm}>
                
                {/* Header */}
                <View style={styles.mdrHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mdrHeaderTiny}>Republic of the Philippines</Text>
                    <Text style={styles.mdrHeaderTitle}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
                    <Text style={styles.mdrHeaderTiny}>Corporate Action Center Hotline : (02) 441-7442</Text>
                    <Text style={styles.mdrHeaderTiny}>www.philhealth.gov.ph</Text>
                  </View>
                  <QrCode size={48} color="#000000" />
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
                </View>

                <View style={{ marginTop: 60, alignItems: 'flex-end', paddingRight: 32 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, textAlign: 'center' }}>HENRY V. ALMANON</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, textAlign: 'center' }}>REGIONAL VICE PRESIDENT</Text>
                </View>

              </View>
            </ScrollView>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#2D3748', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096' },
  
  simBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#EDF2F7', borderRadius: 8 },
  simBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096' },

  content: { flex: 1 },

  listeningArea: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  radarCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#EBF4FF' },
  listeningTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 24, color: '#2D3748', marginTop: 32, zIndex: 10 },
  listeningDesc: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096', marginTop: 12, zIndex: 10 },

  matchCard: { width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 32, alignItems: 'center' },
  matchIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  matchTitle: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#1A202C', textAlign: 'center' },
  matchDescription: { maxWidth: 460, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: '#718096', textAlign: 'center', marginTop: 8 },
  checkInSummary: { width: '100%', backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, marginVertical: 20 },
  summaryName: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#2D3748' },
  summaryMeta: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096', marginTop: 5 },
  summaryNote: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#4A5568', marginTop: 10 },
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

  mdrForm: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 800, minHeight: 1000, padding: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginBottom: 32 },
  mdrHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  mdrHeaderTiny: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A202C' },
  mdrHeaderTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A202C' },
  mdrMainTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A202C', textAlign: 'center', textDecorationLine: 'underline', marginBottom: 24 },
  
  mdrSectionBox: { marginBottom: 16 },
  mdrSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 10, backgroundColor: '#E2E8F0', paddingHorizontal: 4, paddingVertical: 2, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1A202C', marginBottom: 8 },
  mdrRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  mdrLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, width: 200, color: '#1A202C' },
  mdrColon: { fontFamily: 'Inter_400Regular', fontSize: 9, width: 16, color: '#1A202C' },
  mdrValue: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A202C' },

  pdfViewerContainer: { flex: 1, backgroundColor: '#323639', borderRadius: 8, overflow: 'hidden', minHeight: 600, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  pdfViewerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#202124', paddingHorizontal: 16, height: 48 },
  pdfViewerTabs: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  pdfViewerTabActive: { borderBottomWidth: 3, borderBottomColor: '#8AB4F8', height: 48, justifyContent: 'center' },
  pdfViewerTab: { height: 48, justifyContent: 'center' },
  pdfViewerActionBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  pdfViewerBody: { padding: 32, alignItems: 'center' },
});
