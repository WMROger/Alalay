import { useRouter } from 'expo-router';
import { ArrowRight, CheckCircle2, ChevronLeft, ShieldCheck, UserRound } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  background: '#EAF0EE',
  surface: '#FFFFFF',
  ink: '#173B4A',
  muted: '#667B75',
  line: '#D6E2DE',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
};

const sharedFields = [
  'Full legal name and date of birth',
  'Address and registered mobile number',
  'Available PhilHealth membership details',
  'Listed dependent: Ben Cruz (father)',
];

export default function EgovConnectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
          <ChevronLeft color={COLORS.primary} size={20} />
          <Text style={styles.backText}>Back to sign in</Text>
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <View style={styles.govMark}><ShieldCheck color="#FFFFFF" size={24} /></View>
          <View>
            <Text style={styles.govName}>eGov PH</Text>
            <Text style={styles.govSub}>Secure identity handoff · Demo</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>CONTINUE TO ALALAY</Text>
        <Text style={styles.title}>Choose the verified identity to share</Text>
        <Text style={styles.subtitle}>You will review and edit the information inside Alalay before it is saved. Nothing is sent to a hospital at this stage.</Text>

        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.avatar}><UserRound color={COLORS.primary} size={25} /></View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountName}>Elena Cruz</Text>
              <Text style={styles.accountMeta}>Daughter and caregiver · Verified eGov PH demo identity · Cebu City</Text>
            </View>
            <CheckCircle2 color={COLORS.primary} size={22} />
          </View>

          <View style={styles.divider} />
          <Text style={styles.shareHeading}>Alalay will receive:</Text>
          {sharedFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <View style={styles.dot} />
              <Text style={styles.fieldText}>{field}</Text>
            </View>
          ))}
        </View>

        <View style={styles.honestyCard}>
          <ShieldCheck color={COLORS.primary} size={18} />
          <Text style={styles.honestyText}><Text style={styles.honestyStrong}>Hackathon simulation.</Text> A production build would redirect to the official eGov PH authorization service and receive only the fields the user approves.</Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={() => router.replace('/privacy?source=egov')} accessibilityRole="button">
          <Text style={styles.continueText}>Continue as Elena Cruz</Text>
          <ArrowRight color="#FFFFFF" size={19} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', minHeight: 40, marginBottom: 20 },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.primary },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 },
  govMark: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  govName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink },
  govSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: 3 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, color: COLORS.primary, marginBottom: 7 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, lineHeight: 36, color: COLORS.ink },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: COLORS.muted, marginTop: 9, marginBottom: 22 },
  accountCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 19 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  accountCopy: { flex: 1 },
  accountName: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: COLORS.ink },
  accountMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 17 },
  shareHeading: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.ink, marginBottom: 10 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 9 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 5 },
  fieldText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted },
  honestyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 13, marginTop: 16 },
  honestyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted },
  honestyStrong: { fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  continueButton: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: COLORS.primary, borderRadius: 16, marginTop: 20 },
  continueText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#FFFFFF' },
});
