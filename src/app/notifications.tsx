import { Href, useRouter } from 'expo-router';
import {
  Bell,
  CalendarHeart,
  ChevronLeft,
  CircleDollarSign,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Syringe,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75',
  line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A',
  amber: '#A15C00', amberSoft: '#FFF3DD', blue: '#246BCE', blueSoft: '#EAF2FF',
};

type Opportunity = {
  id: string;
  title: string;
  text: string;
  icon: ReactNode;
  accent: string;
};

function ageFromDate(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const parsed = new Date(dateOfBirth);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const beforeBirthday = now.getMonth() < parsed.getMonth()
    || (now.getMonth() === parsed.getMonth() && now.getDate() < parsed.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const visitLog = useStore((state) => state.visitLog);

  const beneficiary = beneficiaries.find((item) => item.id === activePatientId);
  const patientName = beneficiary
    ? `${beneficiary.firstName} ${beneficiary.lastName}`.trim()
    : `${masterProfile.firstName || 'Elena'} ${masterProfile.lastName || 'Cruz'}`;
  const firstName = beneficiary?.firstName || masterProfile.firstName || 'Elena';
  const age = ageFromDate(beneficiary?.dateOfBirth || masterProfile.dateOfBirth);
  const preferences = masterProfile.notificationPreferences;
  const opportunities: Opportunity[] = [];

  if (preferences.healthOpportunitiesEnabled) {
    if (preferences.seniorWellness && age !== null && age >= 60) {
      opportunities.push({
        id: 'senior-wellness',
        title: `Senior wellness check for ${firstName}`,
        text: 'Ask a Cebu City health center about available senior wellness checks. Schedules and eligibility vary by facility.',
        icon: <CalendarHeart color={COLORS.primary} size={22} />,
        accent: COLORS.primarySoft,
      });
    }
    if (preferences.philhealthPrograms) {
      opportunities.push({
        id: 'philhealth',
        title: 'Review PhilHealth coverage before the next visit',
        text: 'Keep the PIN and supporting documents ready. The hospital or PhilHealth desk makes the official eligibility decision.',
        icon: <CircleDollarSign color={COLORS.amber} size={22} />,
        accent: COLORS.amberSoft,
      });
    }
    if (preferences.vaccinations) {
      opportunities.push({
        id: 'vaccinations',
        title: 'Check the recommended vaccination schedule',
        text: `Ask a licensed clinician which vaccines are appropriate for ${firstName}'s age and health history.`,
        icon: <Syringe color={COLORS.blue} size={22} />,
        accent: COLORS.blueSoft,
      });
    }
    if (preferences.localHealthServices) {
      opportunities.push({
        id: 'local-services',
        title: 'Cebu health services near you',
        text: 'Use your barangay or Cebu City health center as a starting point for local program availability and referral requirements.',
        icon: <MapPin color={COLORS.primary} size={22} />,
        accent: COLORS.primarySoft,
      });
    }
    if (visitLog.patientId === activePatientId && Boolean(visitLog.checkedInAt)) {
      opportunities.push({
        id: 'post-hospital',
        title: 'Keep documents for possible assistance',
        text: 'After hospitalization, commonly relevant programs may include PhilHealth assistance, DSWD AICS, or SSS/GSIS claims. Alalay is not confirming eligibility.',
        icon: <HeartPulse color={COLORS.amber} size={22} />,
        accent: COLORS.amberSoft,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Health opportunities</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.patientBanner}>
          <View>
            <Text style={styles.eyebrow}>SHOWING FOR</Text>
            <Text style={styles.patientName}>{patientName}</Text>
          </View>
          <View style={[styles.optInBadge, !preferences.healthOpportunitiesEnabled && styles.optOutBadge]}>
            <Text style={[styles.optInText, !preferences.healthOpportunitiesEnabled && styles.optOutText]}>
              {preferences.healthOpportunitiesEnabled ? 'OPTED IN' : 'OPTED OUT'}
            </Text>
          </View>
        </View>

        {!preferences.healthOpportunitiesEnabled ? (
          <View style={styles.emptyCard}>
            <Bell color={COLORS.primary} size={27} />
            <Text style={styles.emptyTitle}>Health opportunity notifications are off</Text>
            <Text style={styles.emptyText}>Turn them on from Pre-admission details. You choose each category, and Alalay will only show rules-based suggestions.</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/onboarding?edit=1' as Href)}>
              <Text style={styles.settingsButtonText}>Review notification settings</Text>
            </TouchableOpacity>
          </View>
        ) : opportunities.length > 0 ? (
          <View style={styles.list}>
            {opportunities.map((item) => (
              <View key={item.id} style={styles.notification}>
                <View style={[styles.icon, { backgroundColor: item.accent }]}>{item.icon}</View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.text}>{item.text}</Text>
                  <Text style={styles.ruleLabel}>RULES-BASED SUGGESTION</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Bell color={COLORS.primary} size={27} />
            <Text style={styles.emptyTitle}>No suggestions for the selected categories</Text>
            <Text style={styles.emptyText}>You can review the notification categories in Pre-admission details at any time.</Text>
          </View>
        )}

        <View style={styles.privacyCard}>
          <ShieldCheck color={COLORS.primary} size={20} />
          <View style={styles.copy}>
            <Text style={styles.privacyTitle}>Honest by design</Text>
            <Text style={styles.privacyText}>These are local, rules-based reminders—not live eligibility results, medical advice, or confirmation from an agency.</Text>
          </View>
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
  patientBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: COLORS.navy, borderRadius: 20, padding: 17, marginBottom: 13 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.25, color: '#9FD8CD' },
  patientName: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#FFFFFF', marginTop: 3 },
  optInBadge: { borderRadius: 999, backgroundColor: '#DFF5EE', paddingHorizontal: 9, paddingVertical: 6 },
  optOutBadge: { backgroundColor: '#E8EEEC' },
  optInText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.8, color: COLORS.primary },
  optOutText: { color: COLORS.muted },
  list: { gap: 10 },
  notification: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 15 },
  icon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink },
  text: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted, marginTop: 5 },
  ruleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.8, color: COLORS.primary, marginTop: 9 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 24 },
  emptyTitle: { fontFamily: 'Sora_700Bold', fontSize: 15, color: COLORS.ink, textAlign: 'center', marginTop: 11 },
  emptyText: { maxWidth: 410, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted, textAlign: 'center', marginTop: 6 },
  settingsButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 18, marginTop: 15 },
  settingsButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  privacyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: COLORS.primarySoft, borderRadius: 17, padding: 14, marginTop: 13 },
  privacyTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.ink },
  privacyText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
});
