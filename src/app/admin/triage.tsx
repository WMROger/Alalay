import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Activity, UserPlus, CheckCircle2, ShieldAlert, FileText, Smartphone, QrCode } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function AdminTriageScreen() {
  const router = useRouter();
  const [scanState, setScanState] = useState<'listening' | 'receiving' | 'complete'>('listening');
  const masterProfile = useStore(state => state.masterProfile);
  
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
      setScanState('complete');
    }, 1500);
  };

  const handleReject = () => {
    setScanState('listening');
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
          <Activity color="#007AFF" size={32} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Triage Hub</Text>
          <Text style={styles.subtitle}>Live monitoring of patient intakes via Alalay QR.</Text>
        </View>
        
        {/* Hidden Simulation Button for Pitch */}
        <TouchableOpacity style={styles.simBtn} onPress={simulateIncomingScan}>
          <Smartphone color="#718096" size={16} />
          <Text style={styles.simBtnText}>[Demo: Trigger Patient Scan]</Text>
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
            <Activity color="#007AFF" size={48} style={{ zIndex: 10 }} />
            <Text style={styles.listeningTitle}>Waiting for Patient Scan</Text>
            <Text style={styles.listeningDesc}>The system is securely listening for incoming payloads from the triage QR code.</Text>
          </View>
        )}

        {scanState === 'receiving' && (
          <View style={[styles.listeningArea, { backgroundColor: '#F0FFF4', borderColor: '#C6F6D5' }]}>
            <UserPlus color="#38A169" size={48} />
            <Text style={[styles.listeningTitle, { color: '#276749' }]}>Incoming Intake: {masterProfile.firstName} {masterProfile.lastName}</Text>
            <Text style={styles.listeningDesc}>Decrypting and mapping payload to hospital schema...</Text>
          </View>
        )}

        {scanState === 'complete' && (
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
