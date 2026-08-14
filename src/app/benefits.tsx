import { useRouter } from 'expo-router';
import { ChevronLeft, HeartHandshake, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BenefitsBoard } from '../components/BenefitsBoard';
import { useStore } from '../store/useStore';

const COLORS = { background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75', line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A' };

export default function BenefitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const beneficiary = beneficiaries.find((item) => item.id === activePatientId);
  const patientName = beneficiary
    ? `${beneficiary.firstName} ${beneficiary.lastName}`.trim()
    : `${masterProfile.firstName || 'Elena'} ${masterProfile.lastName || 'Cruz'}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Health benefits</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.patientCard}>
          <View style={styles.patientIcon}><HeartHandshake color="#FFFFFF" size={24} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SUGGESTIONS FOR</Text>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>{beneficiary ? beneficiary.relationship : 'My profile'} · Selected patient</Text>
          </View>
        </View>

        <BenefitsBoard />

        <View style={styles.noteCard}>
          <ShieldCheck color={COLORS.primary} size={18} />
          <Text style={styles.noteText}>For this build, suggestions are generated from local profile and visit rules. Alalay does not query agency systems or file applications.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.surface },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: COLORS.ink },
  headerSpacer: { width: 40 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 40 },
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.navy, borderRadius: 22, padding: 17, marginBottom: 22 },
  patientIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5667' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.25, color: '#9FD8CD' },
  patientName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#FFFFFF', marginTop: 3 },
  patientMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C8D9DE', marginTop: 3 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 16, padding: 13 },
  noteText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: COLORS.muted },
});
