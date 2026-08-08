import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { ChevronLeft } from 'lucide-react-native';

export default function AdmissionScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  const updateVisitLog = useStore(state => state.updateVisitLog);
  
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [admissionType, setAdmissionType] = useState('Emergency');
  const [emName, setEmName] = useState('');
  const [emRel, setEmRel] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [roomPref, setRoomPref] = useState('Ward');
  const [consent, setConsent] = useState(false);

  const handleGenerateQR = () => {
    updateVisitLog({
      chiefComplaint,
      admissionType,
      emergencyContact: { name: emName, relationship: emRel, phone: emPhone },
      roomPreference: roomPref,
      dataSharingConsent: consent
    });
    router.push(`/qr`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Admission</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <Text style={styles.description}>
            Add immediate clinical details for this visit. This data will be securely bundled with your Master Profile.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient</Text>
            <View style={styles.pillContainer}>
                <TouchableOpacity style={[styles.pill, styles.pillActive]}>
                  <Text style={[styles.pillText, styles.pillTextActive]}>
                    {masterProfile.firstName} {masterProfile.lastName} (Me)
                  </Text>
                </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chief Complaint</Text>
              <TextInput 
                style={[styles.input, { height: 80 }]} 
                placeholder="Why are you at the hospital today?" 
                placeholderTextColor="#C7C7CC"
                value={chiefComplaint} 
                onChangeText={setChiefComplaint}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Admission Type</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['Emergency', 'Outpatient', 'Inpatient'].map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeButton, admissionType === type && styles.typeButtonActive]}
                    onPress={() => setAdmissionType(type)}
                  >
                    <Text style={[styles.typeButtonText, admissionType === type && styles.typeButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Room Preference</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['Ward', 'Semi-Private', 'Private'].map(room => (
                  <TouchableOpacity 
                    key={room} 
                    style={[styles.typeButton, roomPref === room && styles.typeButtonActive]}
                    onPress={() => setRoomPref(room)}
                  >
                    <Text style={[styles.typeButtonText, roomPref === room && styles.typeButtonTextActive]}>{room}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.inputGroup}>
              <TextInput style={styles.input} placeholder="Name" value={emName} onChangeText={setEmName} />
            </View>
            <View style={styles.inputGroup}>
              <TextInput style={styles.input} placeholder="Relationship (e.g. Spouse)" value={emRel} onChangeText={setEmRel} />
            </View>
            <View style={styles.inputGroup}>
              <TextInput style={styles.input} placeholder="Phone Number" value={emPhone} onChangeText={setEmPhone} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={styles.consentBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.consentText}>
                I consent to sharing my Master Profile and these admission details with the scanning hospital.
              </Text>
              <Switch value={consent} onValueChange={setConsent} />
            </View>
          </View>

          <TouchableOpacity style={[styles.generateButton, !consent && { opacity: 0.5 }]} onPress={handleGenerateQR} disabled={!consent}>
            <Text style={styles.generateButtonText}>Generate QR Token</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA'
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#007AFF', fontFamily: 'Inter_500Medium', fontSize: 17, marginLeft: -4 },
  headerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#000000' },
  
  content: { padding: 24 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#8E8E93', marginBottom: 32, lineHeight: 22 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#000000', marginBottom: 16 },
  
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pill: { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E5E5EA' },
  pillActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#000000' },
  pillTextActive: { color: '#FFFFFF' },

  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#8E8E93', marginBottom: 8, marginLeft: 16 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    fontFamily: 'Inter_400Regular', fontSize: 17, color: '#000000',
    borderWidth: 1, borderColor: '#E5E5EA',
  },
  
  typeButton: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#E5F1FF', borderColor: '#007AFF' },
  typeButtonText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#000000' },
  typeButtonTextActive: { color: '#007AFF' },

  consentBox: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#E5E5EA' },
  consentText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#000000', lineHeight: 18, marginRight: 16 },

  generateButton: { backgroundColor: '#007AFF', padding: 20, borderRadius: 24, alignItems: 'center' },
  generateButtonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 17 },
});
