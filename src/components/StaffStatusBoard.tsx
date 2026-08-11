import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, Clock3, Radio, ShieldAlert, Smartphone } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdmissionStepId, useStore } from '../store/useStore';

const ACTION_LABELS: Record<AdmissionStepId, string> = {
  check_in: 'Confirm check-in',
  room_assignment: 'Mark room assigned',
  consent_billing: 'Mark arrangement done',
  philhealth_eligibility: 'Confirm eligibility',
};

export function StaffStatusBoard() {
  const router = useRouter();
  const visitLog = useStore((state) => state.visitLog);
  const updateAdmissionStep = useStore((state) => state.updateAdmissionStep);

  if (!visitLog.supportsLiveStatus) {
    return (
      <View style={styles.unavailableCard}>
        <ShieldAlert color="#975A16" size={22} />
        <View style={styles.unavailableCopy}>
          <Text style={styles.unavailableTitle}>Live patient status is off for this demo facility</Text>
          <Text style={styles.unavailableText}>The patient sees general hospital guidance only. No completion ticks are sent.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.eyebrowRow}>
            <Radio color="#137A67" size={14} />
            <Text style={styles.eyebrow}>PATIENT STATUS BOARD</Text>
          </View>
          <Text style={styles.title}>Update the patient’s admission journey</Text>
          <Text style={styles.subtitle}>Each update appears on the patient Dashboard for this participating hospital.</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE DEMO</Text></View>
          <TouchableOpacity style={styles.patientPreviewButton} onPress={() => router.push('/dashboard')}>
            <Smartphone color="#246BCE" size={15} />
            <Text style={styles.patientPreviewText}>Preview patient view</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stepsRow}>
        {visitLog.admissionSteps.map((step) => {
          const done = step.status === 'done';
          const current = step.status === 'current';

          return (
            <View key={step.id} style={[styles.stepCard, current && styles.stepCardCurrent, done && styles.stepCardDone]}>
              <View style={styles.stepHeader}>
                {done
                  ? <CheckCircle2 color="#137A67" size={22} />
                  : current
                    ? <Clock3 color="#AD6500" size={21} />
                    : <Circle color="#A0AEC0" size={21} />}
                <Text style={[styles.stateLabel, done && styles.stateLabelDone, current && styles.stateLabelCurrent]}>
                  {done ? 'DONE' : current ? 'NEEDS PATIENT' : 'WAITING'}
                </Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepLocation} numberOfLines={2}>{step.location}</Text>
              <TouchableOpacity
                style={[styles.updateButton, done && styles.updateButtonDone]}
                onPress={() => updateAdmissionStep(step.id, done ? 'pending' : 'done')}
                accessibilityRole="button"
                accessibilityLabel={`${done ? 'Undo' : ACTION_LABELS[step.id]} for ${step.title}`}
              >
                <Text style={[styles.updateButtonText, done && styles.updateButtonTextDone]}>
                  {done ? 'Undo update' : ACTION_LABELS[step.id]}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Text style={styles.auditNote}>Demo note: production updates require an authenticated hospital staff account and are audit logged.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBE9E2', borderRadius: 16, padding: 20, marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 17 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2, color: '#137A67' },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: '#1A202C' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#718096', marginTop: 4 },
  liveBadge: { backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  liveBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, color: '#137A67' },
  headerActions: { alignItems: 'flex-end', gap: 8 },
  patientPreviewButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 34, borderWidth: 1, borderColor: '#BFD4F3', borderRadius: 9, paddingHorizontal: 10, backgroundColor: '#F4F8FF' },
  patientPreviewText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#246BCE' },
  stepsRow: { flexDirection: 'row', gap: 10 },
  stepCard: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 13, padding: 13, backgroundColor: '#F8FAFC' },
  stepCardCurrent: { borderColor: '#F1C777', backgroundColor: '#FFFAF0' },
  stepCardDone: { borderColor: '#B9DED5', backgroundColor: '#F0FAF7' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  stateLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.5, color: '#718096' },
  stateLabelDone: { color: '#137A67' },
  stateLabelCurrent: { color: '#AD6500' },
  stepTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, lineHeight: 16, color: '#2D3748', marginTop: 11, minHeight: 32 },
  stepLocation: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 13, color: '#718096', marginTop: 4, minHeight: 26 },
  updateButton: { minHeight: 34, borderRadius: 8, backgroundColor: '#246BCE', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7, marginTop: 11 },
  updateButtonDone: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#B9DED5' },
  updateButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#FFFFFF', textAlign: 'center' },
  updateButtonTextDone: { color: '#137A67' },
  auditNote: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#A0AEC0', marginTop: 12 },
  unavailableCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: '#FFFAF0', borderWidth: 1, borderColor: '#FEEBC8', borderRadius: 14, padding: 16, marginBottom: 18 },
  unavailableCopy: { flex: 1 },
  unavailableTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#744210' },
  unavailableText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#975A16', marginTop: 4 },
});
