import { useRouter } from 'expo-router';
import { ChevronLeft, QrCode, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdmissionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Check-In</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <QrCode color="#007AFF" size={48} />
        </View>
        <Text style={styles.title}>Scan the admission desk QR</Text>
        <Text style={styles.description}>
          The hospital and desk will be identified first. You will review exactly what is shared before a check-in is created.
        </Text>

        <View style={styles.notice}>
          <ShieldCheck color="#276749" size={22} />
          <Text style={styles.noticeText}>
            The QR contains no patient data. It is only a secure pointer to the hospital admission desk.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/qr')}>
          <Text style={styles.primaryButtonText}>Scan Hospital QR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#007AFF', fontFamily: 'Inter_500Medium', fontSize: 17, marginLeft: -4 },
  headerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#000000' },
  content: { flex: 1, padding: 28, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 88, height: 88, borderRadius: 28, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#1A202C', textAlign: 'center', marginBottom: 12 },
  description: { maxWidth: 520, fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#4A5568', textAlign: 'center' },
  notice: { maxWidth: 520, flexDirection: 'row', gap: 12, backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#C6F6D5', borderRadius: 16, padding: 16, marginVertical: 28 },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: '#276749' },
  primaryButton: { width: '100%', maxWidth: 520, backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 17, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
});
