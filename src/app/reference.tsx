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
  
  const [activeTab, setActiveTab] = useState<'MDR' | 'CF1' | 'BEREAVEMENT'>('MDR');
  const viewShotRef = useRef<ViewShot>(null);

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
        <TouchableOpacity style={styles.shareButton} onPress={sharePDF}>
          <Text style={styles.shareText}>Share PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'MDR' && styles.activeTab]} onPress={() => setActiveTab('MDR')}>
          <Text style={[styles.tabText, activeTab === 'MDR' && styles.activeTabText]}>MDR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'CF1' && styles.activeTab]} onPress={() => setActiveTab('CF1')}>
          <Text style={[styles.tabText, activeTab === 'CF1' && styles.activeTabText]}>CF1</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1, result: 'base64' }}>
          
          <View style={[styles.sheet, { minHeight: 600 }]}>
            
            {activeTab === 'MDR' && (
              <View style={[mdrStyles.document, { padding: 16 }]}>
                
                <View style={mdrStyles.headerRow}>
                  <View style={mdrStyles.logoPlaceholder}>
                    <View style={{width: 24, height: 40, backgroundColor: '#D9D9D9'}} />
                  </View>
                  <View style={mdrStyles.headerTextCol}>
                    <Text style={mdrStyles.headerRep}>Republic of the Philippines</Text>
                    <Text style={mdrStyles.headerCorp}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
                    <Text style={mdrStyles.headerSub}>Corporate Action Center Hotline - (02) 441-7442</Text>
                    <Text style={mdrStyles.headerSub}>www.philhealth.gov.ph</Text>
                  </View>
                  <View style={mdrStyles.headerQR}>
                    <QRCode value={`mdr_${masterProfile.philhealthId}`} size={64} />
                  </View>
                </View>

                <Text style={mdrStyles.mainTitle}>MEMBER DATA RECORD</Text>

                {/* SECTION 1 */}
                <View style={mdrStyles.sectionHead}>
                  <Text style={mdrStyles.sectionHeadText}>MEMBER BASIC INFORMATION</Text>
                </View>
                <View style={mdrStyles.grid2Col}>
                  <View style={mdrStyles.colLeft}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>PhilHealth Identification Number (PIN)</Text><Text style={mdrStyles.val}>: {masterProfile.philhealthId || 'N/A'}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Member Category</Text><Text style={mdrStyles.val}>: FORMAL ECONOMY -</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Sub-Category</Text><Text style={mdrStyles.val}>: GOVERNMENT - PERMANENT/REGULAR</Text></View>
                  </View>
                  <View style={mdrStyles.colRight}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>PhilSys Number</Text><Text style={mdrStyles.val}>: </Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>NHTS Coverage</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Validity Period</Text><Text style={mdrStyles.val}>: N/A - N/A</Text></View>
                  </View>
                </View>

                {/* NAME AND ADDRESS */}
                <View style={mdrStyles.nameBlock}>
                  <Text style={mdrStyles.bigName}>{(masterProfile.lastName + ', ' + masterProfile.firstName).toUpperCase()}</Text>
                  <Text style={mdrStyles.bigAddress}>{masterProfile.address.street.toUpperCase()}</Text>
                </View>

                <View style={mdrStyles.grid2Col}>
                  <View style={mdrStyles.colLeft}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Foreign Address</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={[mdrStyles.row, { marginTop: 12 }]}><Text style={mdrStyles.label}>Contact No. (Foreign)</Text><Text style={mdrStyles.val}>: N/A</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>                  (Local)</Text><Text style={mdrStyles.val}>: {masterProfile.contactNumber || 'N/A'}</Text></View>
                  </View>
                  <View style={mdrStyles.colRight}>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Sex</Text><Text style={mdrStyles.val}>: {(masterProfile.sex || '').toUpperCase()}</Text></View>
                    <View style={mdrStyles.row}><Text style={mdrStyles.label}>Date of Birth</Text><Text style={mdrStyles.val}>: {masterProfile.dateOfBirth}</Text></View>
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
                  {beneficiaries.map((b, i) => (
                    <View style={mdrStyles.tableRow} key={i}>
                      <Text style={[mdrStyles.td, { flex: 1.5 }]}>{b.pin || '-'}</Text>
                      <Text style={[mdrStyles.td, { flex: 2 }]}>{b.lastName.toUpperCase()}</Text>
                      <Text style={[mdrStyles.td, { flex: 2 }]}>{b.firstName.toUpperCase()}</Text>
                      <Text style={[mdrStyles.td, { flex: 1 }]}>-</Text>
                      <Text style={[mdrStyles.td, { flex: 1.5 }]}>{b.relationship.toUpperCase()}</Text>
                    </View>
                  ))}
                  <Text style={mdrStyles.nothingFollows}>*** NOTHING FOLLOWS ***</Text>
                </View>
                
                <View style={mdrStyles.signatureBlock}>
                  <Text style={mdrStyles.sigName}>HENRY V. ALMANON</Text>
                  <Text style={mdrStyles.sigTitle}>REGIONAL VICE PRESIDENT</Text>
                  <Text style={mdrStyles.sigTitle}>Philhealth Regional Office</Text>
                </View>

                <Text style={mdrStyles.footerNote}>
                  Paalala: Basahin ang nilalaman ng MDR. Kung may kulang o mali, ibalik agad upang maiwasto. Ingatan ang orihinal na kopya at huwag ibigay kahit kanino...
                </Text>

              </View>
            )}

            {activeTab === 'CF1' && (
              <View style={{ padding: 16 }}>
                <Text style={[styles.alalayBrand, { display: 'flex' }]}>ALALAY</Text>
                <Text style={styles.sheetTitle}>CF1 (Member / Patient Info)</Text>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Part I. Member Information</Text>
                  <View style={styles.row}><Text style={styles.label}>PIN:</Text><Text style={styles.value}>{masterProfile.philhealthId || 'N/A'}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{masterProfile.lastName}, {masterProfile.firstName}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Date of Birth:</Text><Text style={styles.value}>{masterProfile.dateOfBirth}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{masterProfile.address.street}</Text></View>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Part II. Patient Information (if dependent)</Text>
                  <Text style={styles.value}>If the patient is a dependent, their details would be populated here.</Text>
                </View>
                <View style={[styles.section, { marginTop: 40 }]}>
                  <View style={styles.qrContainer}>
                    <QRCode value={`token_expires_in_24h`} size={100} color="#2D3748" backgroundColor="#FFFFFF" />
                    <Text style={styles.qrText}>Scan for real-time verification</Text>
                  </View>
                </View>
              </View>
            )}

          </View>
        </ViewShot>
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
  tabContainer: { flexDirection: 'row', backgroundColor: '#1A202C', paddingHorizontal: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#319795' },
  tabText: { color: '#A0AEC0', fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  activeTabText: { color: '#FFFFFF' },
  content: { padding: 16 },
  sheet: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 0, minHeight: 600, marginBottom: 32 },
  alalayBrand: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#319795', textAlign: 'center', marginBottom: 8, display: 'none' },
  sheetTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#2D3748', textAlign: 'center', marginBottom: 32, textTransform: 'uppercase' },
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
  logoPlaceholder: { width: 40, height: 40, marginRight: 8 },
  headerTextCol: { flex: 1 },
  headerRep: { fontFamily: 'Times New Roman', fontSize: 9, fontStyle: 'italic', marginBottom: 2 },
  headerCorp: { fontFamily: 'Arial', fontSize: 13, fontWeight: 'bold' },
  headerSub: { fontFamily: 'Arial', fontSize: 8 },
  headerQR: { marginLeft: 16 },
  
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
