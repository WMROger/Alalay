import { useRouter } from 'expo-router';
import { ArrowRight, ChevronDown, ChevronUp, CircleDollarSign, HeartHandshake, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

type BenefitSuggestion = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  tag: string;
};

function getAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export function BenefitsBoard() {
  const router = useRouter();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const visitLog = useStore((state) => state.visitLog);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const beneficiary = beneficiaries.find((item) => item.id === activePatientId);
  const firstName = beneficiary?.firstName || masterProfile.firstName || 'Patient';
  const dateOfBirth = beneficiary?.dateOfBirth || masterProfile.dateOfBirth;
  const philhealthPin = beneficiary?.pin || (!beneficiary ? masterProfile.philhealthId : '');
  const age = getAge(dateOfBirth);
  const hasCurrentVisit = visitLog.patientId === activePatientId && Boolean(visitLog.checkedInAt);

  const suggestions = useMemo<BenefitSuggestion[]>(() => {
    const items: BenefitSuggestion[] = [];

    if (age !== null && age >= 60) {
      items.push({
        id: 'senior-discount',
        title: 'Senior Citizen hospital discount documents',
        summary: `${firstName} may be asked for a valid Senior Citizen ID before a discount is applied.`,
        detail: 'Bring the original ID if available and confirm the hospital billing desk’s current requirements. Alalay does not decide eligibility or calculate the discount.',
        tag: 'AGE-BASED',
      });
    }

    items.push({
      id: 'philhealth-support',
      title: philhealthPin ? 'PhilHealth billing assistance' : 'Prepare for PhilHealth review',
      summary: philhealthPin
        ? 'A saved PIN can reduce repeated encoding, but the hospital still confirms eligibility.'
        : 'Adding a PIN and supporting record can make the hospital review easier.',
      detail: 'Ask the hospital PhilHealth or billing desk about applicable case rates, remaining balance, and any documents still needed. This suggestion is not a live PhilHealth result.',
      tag: 'PROFILE-BASED',
    });

    if (hasCurrentVisit) {
      items.push({
        id: 'cost-assistance',
        title: 'Medical-cost assistance checklist',
        summary: 'If the remaining hospital cost is difficult, ask about DSWD AICS or the hospital medical social service desk.',
        detail: 'Commonly requested documents include a statement of account, medical abstract, valid IDs, and proof of financial need. Requirements vary and no application has been filed.',
        tag: 'VISIT-BASED',
      });
    }

    return items.slice(0, 3);
  }, [age, firstName, hasCurrentVisit, philhealthPin]);

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>BENEFITS YOU MIGHT NOT KNOW ABOUT</Text>
          <Text style={styles.title}>Worth asking about for {firstName}</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>{suggestions.length}</Text></View>
      </View>

      <View style={styles.card}>
        {suggestions.map((suggestion, index) => {
          const expanded = expandedId === suggestion.id;
          return (
            <TouchableOpacity
              key={suggestion.id}
              style={[styles.row, index > 0 && styles.divider]}
              onPress={() => setExpandedId(expanded ? null : suggestion.id)}
              activeOpacity={0.76}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <View style={styles.icon}>
                {suggestion.id === 'philhealth-support'
                  ? <CircleDollarSign color="#246BCE" size={21} />
                  : <HeartHandshake color="#137A67" size={21} />}
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{suggestion.title}</Text>
                  <Text style={styles.tag}>{suggestion.tag}</Text>
                </View>
                <Text style={styles.summary}>{suggestion.summary}</Text>
                {expanded ? <Text style={styles.detail}>{suggestion.detail}</Text> : null}
              </View>
              {expanded ? <ChevronUp color="#667B75" size={18} /> : <ChevronDown color="#667B75" size={18} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.honestyNote}>
          <ShieldCheck color="#137A67" size={16} />
          <Text style={styles.honestyText}>Rules-based suggestions only. Agencies and hospital staff make the official eligibility decision.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.moreButton} onPress={() => router.push('/notifications')} accessibilityRole="button">
        <Text style={styles.moreText}>See health opportunities</Text>
        <ArrowRight color="#137A67" size={16} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: '#246BCE', marginBottom: 4 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#18312B' },
  countBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#246BCE' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CFDDF0', borderRadius: 21, paddingHorizontal: 15 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 15 },
  divider: { borderTopWidth: 1, borderTopColor: '#E4ECF5' },
  icon: { width: 41, height: 41, borderRadius: 13, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  itemTitle: { flexShrink: 1, fontFamily: 'Sora_600SemiBold', fontSize: 12, lineHeight: 17, color: '#18312B' },
  tag: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.6, color: '#246BCE', backgroundColor: '#EAF2FF', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 },
  summary: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#667B75', marginTop: 4 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#466379', backgroundColor: '#F3F7FC', borderRadius: 10, padding: 10, marginTop: 9 },
  honestyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E6F5F1', borderRadius: 12, padding: 11, marginBottom: 14 },
  honestyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: '#4F6D65' },
  moreButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 },
  moreText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#137A67' },
});
