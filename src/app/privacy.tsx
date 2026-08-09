import { useRouter } from 'expo-router';
import { ChevronLeft, LockKeyhole, ShieldCheck, Trash2, Users } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyConsentScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#007AFF" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Consent</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}><ShieldCheck color="#276749" size={36} /></View>
        <Text style={styles.title}>Your data stays under your control</Text>
        <Text style={styles.intro}>Before we collect your PhilHealth and health-profile information, please review how Alalay uses it.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <LockKeyhole color="#2B6CB0" size={22} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>What we collect</Text>
              <Text style={styles.rowBody}>Identity and PhilHealth details from your MDR, plus the health-profile information you choose to provide.</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Users color="#2B6CB0" size={22} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>When it is shared</Text>
              <Text style={styles.rowBody}>Your data is shared with a hospital registration desk only after you scan its QR code and approve the named consent screen.</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Trash2 color="#2B6CB0" size={22} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Your choices</Text>
              <Text style={styles.rowBody}>You can review and correct imported details, skip optional fields, and request deletion of your account and stored data.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAccepted((value) => !value)}>
          <View style={[styles.checkbox, accepted && styles.checkboxAccepted]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I understand and agree to the collection and use described above.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, !accepted && styles.continueButtonDisabled]}
          onPress={() => router.replace('/onboarding')}
          disabled={!accepted}
        >
          <Text style={styles.continueButtonText}>Agree & Set Up Profile</Text>
        </TouchableOpacity>
        <Text style={styles.legalNote}>Plain-language consent for the Alalay prototype. Production legal copy must be reviewed for compliance with the Data Privacy Act of 2012 (RA 10173).</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#007AFF', fontFamily: 'Inter_500Medium', fontSize: 16, marginLeft: -4 },
  headerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#1A202C' },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24, paddingBottom: 44 },
  iconWrap: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 20 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, lineHeight: 36, color: '#1A202C', marginBottom: 10 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#4A5568', marginBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 20, gap: 22 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2D3748', marginBottom: 4 },
  rowBody: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: '#718096' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginVertical: 24 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#A0AEC0', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxAccepted: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  checkboxLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 21, color: '#4A5568' },
  continueButton: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 17, alignItems: 'center' },
  continueButtonDisabled: { opacity: 0.45 },
  continueButtonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  legalNote: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#A0AEC0', textAlign: 'center', marginTop: 16 },
});
