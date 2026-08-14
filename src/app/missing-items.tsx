import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, FileWarning, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MissingItemsBoard } from '../components/MissingItemsBoard';
import { useStore } from '../store/useStore';

const COLORS = { background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75', line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A', amber: '#A15C00', amberSoft: '#FFF3DD' };

export default function MissingItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const pendingActions = useStore((state) => state.pendingActions);
  const beneficiary = beneficiaries.find((item) => item.id === activePatientId);
  const patientName = beneficiary
    ? `${beneficiary.firstName} ${beneficiary.lastName}`.trim()
    : `${masterProfile.firstName || 'Elena'} ${masterProfile.lastName || 'Cruz'}`;
  const openCount = pendingActions.filter((action) => action.patientId === activePatientId && action.status === 'open').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>What you’re missing</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.patientCard}>
          <View style={styles.patientIcon}><FileWarning color="#FFFFFF" size={23} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>REVIEWING FOR</Text>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>{openCount > 0 ? `${openCount} item${openCount === 1 ? '' : 's'} can be completed later` : 'No unresolved items'}</Text>
          </View>
        </View>

        {openCount > 0 ? (
          <MissingItemsBoard />
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><CheckCircle2 color={COLORS.primary} size={29} /></View>
            <Text style={styles.emptyTitle}>Nothing is missing right now</Text>
            <Text style={styles.emptyText}>If a future hospital check-in identifies a document you do not have, it will appear here without blocking admission.</Text>
          </View>
        )}

        <View style={styles.noteCard}>
          <ShieldCheck color={COLORS.primary} size={18} />
          <Text style={styles.noteText}>Alalay treats missing documents as follow-up reminders. The receiving hospital decides its official requirements.</Text>
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
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.navy, borderRadius: 22, padding: 17, marginBottom: 23 },
  patientIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#35596A' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.25, color: '#F3C976' },
  patientName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#FFFFFF', marginTop: 3 },
  patientMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C8D9DE', marginTop: 3 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 25 },
  emptyIcon: { width: 57, height: 57, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  emptyTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: COLORS.ink, textAlign: 'center', marginTop: 13 },
  emptyText: { maxWidth: 410, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted, textAlign: 'center', marginTop: 6 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 16, padding: 13, marginTop: 13 },
  noteText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: COLORS.muted },
});
