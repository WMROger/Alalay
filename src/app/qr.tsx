import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import QRCode from 'react-native-qrcode-svg';

export default function QRScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  const visitLog = useStore(state => state.visitLog);

  // Mock token based on the implementation plan design
  const mockToken = JSON.stringify({
    v: `mock_visit_${Math.floor(Math.random() * 10000)}`,
    u: `mock_user_${masterProfile.philhealthId}`
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Admission QR</Text>
          <Text style={styles.subtitle}>{masterProfile.firstName} {masterProfile.lastName}</Text>
          <Text style={styles.subtitleSub}>{visitLog.admissionType} Admission</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={mockToken}
            size={250}
            color="#2D3748"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.helpText}>
          Scan this QR code at the admission desk to securely transfer your Master Profile and current clinical details.
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/dashboard')}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF0EE' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#2D3748', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 18, color: '#4A5568' },
  subtitleSub: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#007AFF', marginTop: 8 },
  qrContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    marginBottom: 32,
  },
  helpText: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 48, paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', width: '100%'
  },
  buttonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
});
