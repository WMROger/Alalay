import { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ReferenceSheetScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  const beneficiaries = useStore(state => state.beneficiaries);
  const activePatientId = useStore(state => state.activePatientId);
  const selectedBeneficiary = beneficiaries.find((beneficiary) => beneficiary.id === activePatientId);
  const selectedPatient = selectedBeneficiary ? {
    id: selectedBeneficiary.id,
    firstName: selectedBeneficiary.firstName,
    lastName: selectedBeneficiary.lastName,
    pin: selectedBeneficiary.pin || '',
    dateOfBirth: selectedBeneficiary.dateOfBirth || '',
    sex: selectedBeneficiary.sex || '',
    contactNumber: selectedBeneficiary.contactNumber || '',
    relationship: selectedBeneficiary.relationship,
    source: selectedBeneficiary.profileSource || 'manual',
  } : {
    id: 'self',
    firstName: masterProfile.firstName,
    lastName: masterProfile.lastName,
    pin: masterProfile.philhealthId,
    dateOfBirth: masterProfile.dateOfBirth,
    sex: masterProfile.sex,
    contactNumber: masterProfile.contactNumber,
    relationship: 'My profile',
    source: masterProfile.identitySource || 'manual',
  };
  const selectedName = `${selectedPatient.firstName || 'Patient'} ${selectedPatient.lastName || ''}`.trim();
  const referenceId = `ALA-${(selectedPatient.pin || selectedPatient.id).replace(/\W/g, '').slice(-6).toUpperCase() || 'DEMO01'}`;
  const referencePayload = JSON.stringify({ type: 'alalay-reference', referenceId, patientId: selectedPatient.id });
  
  const [activeTab, setActiveTab] = useState<'MDR' | 'CF1' | 'BEREAVEMENT'>('MDR');
  const viewShotRef = useRef<any>(null);

  const sharePDF = async () => {
    try {
      const base64Image = await viewShotRef.current?.capture?.();
      if (!base64Image) return;

      const html = `
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="data:image/jpeg;base64,${base64Image}" />
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const file = await Print.printToFileAsync({ html });
      if (!file || !file.uri) {
        Alert.alert('Error', 'Failed to create PDF file.');
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert('Sharing not available', 'Cannot share on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.verifyButton} onPress={() => router.push({ pathname: '/verify-reference', params: { referenceId, patientId: selectedPatient.id } })}>
            <Text style={styles.verifyText}>Verify ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={sharePDF}>
            <Text style={styles.shareText}>Share PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'MDR' && styles.activeTab]} onPress={() => setActiveTab('MDR')}>
          <Text style={[styles.tabText, activeTab === 'MDR' && styles.activeTabText]}>MDR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'CF1' && styles.activeTab]} onPress={() => setActiveTab('CF1')}>
          <Text style={[styles.tabText, activeTab === 'CF1' && styles.activeTabText]}>CF1</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.patientStrip}>
        <Text style={styles.patientStripLabel}>REFERENCE FOR</Text>
        <Text style={styles.patientStripName}>{selectedName} · {selectedPatient.relationship}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1, result: 'base64' }}>
            
            <View style={[styles.sheet, { minHeight: 600 }]}>
            
            {activeTab === 'MDR' && (
              <View style={[mdrStyles.document, { padding: 16 }]}>
                
                <View style={mdrStyles.headerRow}>
                  <View style={mdrStyles.logoPlaceholder}>
                    <Text style={mdrStyles.logoLetter}>A</Text>
                  </View>
                  <View style={mdrStyles.headerTextCol}>
                    <Text style={mdrStyles.headerCorp}>ALALAY PATIENT REFERENCE SHEET</Text>
                    <Text style={mdrStyles.headerSub}>Prepared from patient-authorized profile information</Text>
                    <Text style={mdrStyles.headerSub}>Reference ID: {referenceId}</Text>
                  </View>
                  <View style={mdrStyles.headerQR}>
                    <QRCode value={referencePayload} size={64} />
                  </View>
                </View>

                <View style={mdrStyles.disclaimerBanner}>
                  <Text style={mdrStyles.disclaimerText}>REFERENCE ONLY · NOT ISSUED BY PHILHEALTH · VERIFY AGAINST ORIGINAL RECORDS</Text>
                </View>

                <Text style={mdrStyles.mainTitle}>MDR-EQUIVALENT PATIENT SUMMARY</Text>

                {/* SECTION 1 */}
                <View style={mdrStyles.sectionHead}>
                  <Text style={mdrStyles.sectionHeadText}>MEMBER BASIC INFORMATION</Text>
                </View>
                <View style={mdrStyles.grid2Col}>
                  <View style={mdrStyles.colLeft}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>PhilHealth Identification Number (PIN)</Text><Text style={mdrStyles.val}>: {selectedPatient.pin || 'NOT PROVIDED'}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Profile relationship</Text><Text style={mdrStyles.val}>: {selectedPatient.relationship.toUpperCase()}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Information source</Text><Text style={mdrStyles.val}>: {selectedPatient.source.toUpperCase()}</Text></View>
                  </View>
                  <View style={mdrStyles.colRight}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>PhilSys Number</Text><Text style={mdrStyles.val}>: </Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>NHTS Coverage</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Validity Period</Text><Text style={mdrStyles.val}>: N/A - N/A</Text></View>
                  </View>
                </View>

                {/* NAME AND ADDRESS */}
                <View style={mdrStyles.nameBlock}>
                  <Text style={mdrStyles.bigName}>{`${selectedPatient.lastName}, ${selectedPatient.firstName}`.toUpperCase()}</Text>
                  <Text style={mdrStyles.bigAddress}>{selectedBeneficiary ? `LINKED TO ${masterProfile.firstName || 'ACCOUNT HOLDER'} ${masterProfile.lastName || ''}`.toUpperCase() : `${masterProfile.address.street}, ${masterProfile.address.city}`.toUpperCase()}</Text>
                </View>

                <View style={mdrStyles.grid2Col}>
                  <View style={mdrStyles.colLeft}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Foreign Address</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={[mdrStyles.row, { marginTop: 12 }]}><Text style={mdrStyles.label}>Contact No. (Foreign)</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>                  (Local)</Text><Text style={mdrStyles.val}>: {selectedPatient.contactNumber || 'N/A'}</Text></View>
                  </View>
                  <View style={mdrStyles.colRight}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Sex</Text><Text style={mdrStyles.val}>: {(selectedPatient.sex || 'N/A').toUpperCase()}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Date of Birth</Text><Text style={mdrStyles.val}>: {selectedPatient.dateOfBirth || 'N/A'}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Place of Birth</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Civil Status</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Tax Identification Number</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                  </View>
                </View>

                {/* SECTION 2 */}
                <View style={[mdrStyles.sectionHead, { marginTop: 16 }]}>
                  <Text style={mdrStyles.sectionHeadText}>ENTITY INFORMATION</Text>
                </View>
                <View style={mdrStyles.grid2Col}>
                  <View style={mdrStyles.colLeft}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>PhilHealth Number (PEN/POGN)</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Name of Employer/Organized Group</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={[mdrStyles.row, { marginTop: 12 }]}><Text style={mdrStyles.label}>Business Address</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={[mdrStyles.row, { marginTop: 12 }]}><Text style={mdrStyles.label}>Telephone Number</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Tax Identification Number</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                  </View>
                  <View style={[mdrStyles.colRight, { justifyContent: 'flex-end' }]}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Employment Status</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Date</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                  </View>
                </View>

                {/* SECTION 3 */}
                <View style={[mdrStyles.sectionHead, { marginTop: 16 }]}>
                  <Text style={mdrStyles.sectionHeadText}>DEPENDENT INFORMATION</Text>
                </View>
                <View style={mdrStyles.tableContainer}>
                  <View style={mdrStyles.tableHeader}>
                    <Text style={[mdrStyles.th, { flex: 1.5 }]}>PIN</Text>
                    <Text style={[mdrStyles.th, { flex: 2 }]}>Surname</Text>
                    <Text style={[mdrStyles.th, { flex: 2 }]}>Given Name</Text>
                    <Text style={[mdrStyles.th, { flex: 1 }]}>Sex</Text>
                    <Text style={[mdrStyles.th, { flex: 1.5 }]}>Relation</Text>
                  </View>
                  {(selectedBeneficiary ? [selectedBeneficiary] : beneficiaries).map((b, i) => (
                    <View style={mdrStyles.tableRow} key={i}>
                      <Text style={[mdrStyles.td, { flex: 1.5 }]}>{b.pin || '-'}</Text>
                      <Text style={[mdrStyles.td, { flex: 2 }]}>{b.lastName.toUpperCase()}</Text>
                      <Text style={[mdrStyles.td, { flex: 2 }]}>{b.firstName.toUpperCase()}</Text>
                      <Text style={[mdrStyles.td, { flex: 1 }]}>{(b.sex || '-').slice(0, 1).toUpperCase()}</Text>
                      <Text style={[mdrStyles.td, { flex: 1.5 }]}>{b.relationship.toUpperCase()}</Text>
                    </View>
                  ))}
                  <Text style={mdrStyles.nothingFollows}>*** NOTHING FOLLOWS ***</Text>
                </View>
                
                <View style={mdrStyles.signatureBlock}>
                  <Text style={mdrStyles.sigName}>PREPARED BY ALALAY</Text>
                  <Text style={mdrStyles.sigTitle}>Patient-authorized reference · {referenceId}</Text>
                </View>

                <Text style={mdrStyles.footerNote}>
                  This Alalay reference sheet is not an official MDR, CF1, eligibility result, or hospital record. Confirm all information against original documents and the receiving hospital's requirements.
                </Text>

              </View>
            )}

            {activeTab === 'CF1' && (
              <View style={{ padding: 16 }}>
                <Text style={[styles.alalayBrand, { display: 'flex' }]}>ALALAY</Text>
                <Text style={styles.sheetTitle}>CF1 PREPARATION REFERENCE · {referenceId}</Text>
                <Text style={styles.formDisclaimer}>Reference only. This is not an official PhilHealth CF1 and cannot replace the hospital-issued form.</Text>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Part I. Member Information</Text>
                  <View style={styles.row}><Text style={styles.label}>PIN:</Text><Text style={styles.value}>{masterProfile.philhealthId || 'N/A'}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{masterProfile.lastName}, {masterProfile.firstName}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Date of Birth:</Text><Text style={styles.value}>{masterProfile.dateOfBirth}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{masterProfile.address.street}</Text></View>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Part II. Patient Information (if dependent)</Text>
                  {selectedBeneficiary ? (
                    <>
                      <View style={styles.row}><Text style={styles.label}>PIN:</Text><Text style={styles.value}>{selectedPatient.pin || 'N/A'}</Text></View>
                      <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{selectedPatient.lastName}, {selectedPatient.firstName}</Text></View>
                      <View style={styles.row}><Text style={styles.label}>Relationship:</Text><Text style={styles.value}>{selectedPatient.relationship}</Text></View>
                      <View style={styles.row}><Text style={styles.label}>Date of Birth:</Text><Text style={styles.value}>{selectedPatient.dateOfBirth || 'N/A'}</Text></View>
                    </>
                  ) : (
                    <Text style={styles.value}>The selected patient is the member. No dependent information is required for this reference.</Text>
                  )}
                </View>
                <View style={[styles.section, { marginTop: 40 }]}>
                  <View style={styles.qrContainer}>
                    <QRCode value={referencePayload} size={100} color="#2D3748" backgroundColor="#FFFFFF" />
                    <Text style={styles.qrText}>Reference ID only · contains no medical details</Text>
                  </View>
                </View>
              </View>
            )}

            </View>
          </ViewShot>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2D3748' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#2D3748' },
  backButton: { padding: 8 },
  backText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold' },
  shareButton: { padding: 8, backgroundColor: '#4A5568', borderRadius: 8 },
  shareText: { color: '#FFFFFF', fontFamily: 'Inter_500Medium' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifyButton: { padding: 8, backgroundColor: '#E6F5F1', borderRadius: 8 },
  verifyText: { color: '#137A67', fontFamily: 'Inter_600SemiBold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1A202C', paddingHorizontal: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#319795' },
  tabText: { color: '#A0AEC0', fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  activeTabText: { color: '#FFFFFF' },
  patientStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, backgroundColor: '#243B4A', paddingHorizontal: 16, paddingVertical: 10 },
  patientStripLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.1, color: '#8FD5C7' },
  patientStripName: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  content: { padding: 16, alignItems: 'center' },
  sheet: { 
    backgroundColor: '#FFFFFF', 
    padding: 32, 
    borderRadius: 4, 
    minHeight: 800, 
    minWidth: 750, // Ensures it doesn't get squished on mobile
    width: '100%', 
    maxWidth: 850, 
    marginBottom: 32,
    // Web shadow fallback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
  alalayBrand: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#319795', textAlign: 'center', marginBottom: 8, display: 'none' },
  sheetTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#2D3748', textAlign: 'center', marginBottom: 32, textTransform: 'uppercase' },
  formDisclaimer: { fontFamily: 'Inter_600SemiBold', fontSize: 10, lineHeight: 15, color: '#9C5A00', textAlign: 'center', backgroundColor: '#FFF3DD', borderRadius: 8, padding: 10, marginTop: -20, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#4A5568', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 8, marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096' },
  value: { flex: 2, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#2D3748' },
  qrContainer: { alignItems: 'center', marginVertical: 16 },
  qrText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#718096', marginTop: 8 },
});

// Styles specifically for the MDR exact replica
const mdrStyles = StyleSheet.create({
  document: { backgroundColor: '#FFFFFF' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  logoPlaceholder: { width: 40, height: 40, marginRight: 8, borderRadius: 10, backgroundColor: '#137A67', alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontFamily: 'Arial', fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerTextCol: { flex: 1 },
  headerRep: { fontFamily: 'Times New Roman', fontSize: 9, fontStyle: 'italic', marginBottom: 2 },
  headerCorp: { fontFamily: 'Arial', fontSize: 13, fontWeight: 'bold' },
  headerSub: { fontFamily: 'Arial', fontSize: 8 },
  headerQR: { marginLeft: 16 },
  disclaimerBanner: { backgroundColor: '#FFF3DD', borderWidth: 1, borderColor: '#E4B85C', paddingVertical: 5, paddingHorizontal: 8, marginBottom: 9 },
  disclaimerText: { fontFamily: 'Arial', fontSize: 8, fontWeight: 'bold', color: '#7B4800', textAlign: 'center' },
  
  mainTitle: { textAlign: 'center', fontFamily: 'Arial', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline', marginBottom: 4 },
  
  sectionHead: { backgroundColor: '#D9D9D9', paddingVertical: 2, paddingHorizontal: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#000' },
  sectionHeadText: { fontFamily: 'Arial', fontSize: 10, fontWeight: 'bold' },
  
  grid2Col: { flexDirection: 'row', marginTop: 8 },
  colLeft: { flex: 1.3, paddingRight: 8 },
  colRight: { flex: 1 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { fontFamily: 'Arial', fontSize: 8, width: 140 },
  val: { fontFamily: 'Arial', fontSize: 8, flex: 1 },
  
  nameBlock: { marginTop: 16, marginBottom: 8 },
  bigName: { fontFamily: 'Arial', fontSize: 12, fontWeight: 'bold' },
  bigAddress: { fontFamily: 'Arial', fontSize: 10 },
  
  tableContainer: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#D9D9D9', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#000', paddingVertical: 2 },
  th: { fontFamily: 'Arial', fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 2 },
  td: { fontFamily: 'Arial', fontSize: 8, textAlign: 'center' },
  nothingFollows: { textAlign: 'center', fontFamily: 'Arial', fontSize: 8, marginTop: 8, marginBottom: 16 },
  
  signatureBlock: { alignItems: 'flex-end', marginTop: 32, marginBottom: 32 },
  sigName: { fontFamily: 'Arial', fontSize: 10, fontWeight: 'bold' },
  sigTitle: { fontFamily: 'Arial', fontSize: 9 },
  
  footerNote: { fontFamily: 'Arial', fontSize: 7, textAlign: 'justify', lineHeight: 10 }
});
