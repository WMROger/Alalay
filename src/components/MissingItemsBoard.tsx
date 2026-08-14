import { useRouter } from 'expo-router';
import { ArrowRight, CheckCircle2, FileWarning } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

export function MissingItemsBoard() {
  const router = useRouter();
  const pendingActions = useStore((state) => state.pendingActions);
  const activePatientId = useStore((state) => state.activePatientId);
  const updatePendingAction = useStore((state) => state.updatePendingAction);
  const openItems = pendingActions.filter((action) => action.patientId === activePatientId && action.status === 'open');

  if (openItems.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>WHAT YOU’RE MISSING</Text>
          <Text style={styles.title}>Finish when you’re ready</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>{openItems.length}</Text></View>
      </View>

      <View style={styles.card}>
        {openItems.map((action, index) => (
          <View key={action.id} style={[styles.item, index > 0 && styles.itemDivider]}>
            <View style={styles.icon}><FileWarning color="#A05A16" size={20} /></View>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>{action.title}</Text>
              <Text style={styles.itemText}>{action.description}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.resumeButton} onPress={() => router.push(action.route as never)}>
                  <Text style={styles.resumeText}>Add or review</Text>
                  <ArrowRight color="#137A67" size={15} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resolveButton} onPress={() => updatePendingAction(action.id, 'resolved')}>
                  <CheckCircle2 color="#667B75" size={14} />
                  <Text style={styles.resolveText}>Mark resolved</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: '#A05A16', marginBottom: 4 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 19, color: '#18312B' },
  countBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF3DD', alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#A05A16' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6D6BC', borderRadius: 21, paddingHorizontal: 15 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 15 },
  itemDivider: { borderTopWidth: 1, borderTopColor: '#EEE6DA' },
  icon: { width: 41, height: 41, borderRadius: 13, backgroundColor: '#FFF3DD', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  itemTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 12, lineHeight: 17, color: '#18312B' },
  itemText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#667B75', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 },
  resumeButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6F5F1', borderRadius: 10, paddingHorizontal: 10 },
  resumeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#137A67' },
  resolveButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8 },
  resolveText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#667B75' },
});
