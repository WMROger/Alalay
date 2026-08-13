import { useRouter } from 'expo-router';
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { HospitalSessionState, useStore } from '../store/useStore';

type AuthMode = 'sign_in' | 'sign_up';

const COLORS = {
  background: '#F2F6FA',
  surface: '#FFFFFF',
  ink: '#1A365D',
  muted: '#64748B',
  line: '#DDE5ED',
  blue: '#246BCE',
  blueSoft: '#EBF4FF',
  green: '#137A67',
  greenSoft: '#E6F5F1',
};

const DEMO_SESSION: HospitalSessionState = {
  isAuthenticated: true,
  hospitalName: 'Vicente Sotto Memorial Medical Center (VSMMC)',
  facilityId: 'FACILITY-VSMMC-ADM-01',
  philhealthAccreditation: 'PAN-07-293-8472',
  dohFacilityId: 'DOH-R7-10923-PUB',
  staffName: 'Ana Reyes',
  email: 'admissions.demo@vsmmc.gov.ph',
  role: 'Admissions Officer',
  verificationStatus: 'verified',
  accountMode: 'demo',
};

export default function HospitalLoginScreen() {
  const router = useRouter();
  const setHospitalSession = useStore((state) => state.setHospitalSession);
  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [dohFacilityId, setDohFacilityId] = useState('');
  const [philhealthAccreditation, setPhilhealthAccreditation] = useState('');
  const [staffName, setStaffName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const openPortal = (session: HospitalSessionState) => {
    setHospitalSession(session);
    router.replace('/admin');
  };

  const useDemoAccount = () => openPortal(DEMO_SESSION);

  const submit = () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      setError('Enter a valid work email and a password with at least 8 characters.');
      return;
    }

    if (mode === 'sign_up') {
      if (!hospitalName.trim() || !dohFacilityId.trim() || !staffName.trim()) {
        setError('Complete the facility name, DOH Facility ID, and administrator name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }
      openPortal({
        isAuthenticated: true,
        hospitalName: hospitalName.trim(),
        facilityId: `FACILITY-${dohFacilityId.trim().replace(/[^a-z0-9]/gi, '-').toUpperCase()}`,
        philhealthAccreditation: philhealthAccreditation.trim() || 'Pending submission',
        dohFacilityId: dohFacilityId.trim(),
        staffName: staffName.trim(),
        email: email.trim(),
        role: 'Hospital Administrator',
        verificationStatus: 'pending_review',
        accountMode: 'sign_up',
      });
      return;
    }

    openPortal({
      ...DEMO_SESSION,
      email: email.trim(),
      staffName: 'Hospital Staff',
      accountMode: 'sign_in',
    });
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.brandColumn}>
            <View style={styles.brandMark}><Building2 color="#FFFFFF" size={29} /></View>
            <Text style={styles.eyebrow}>ALALAY FOR HOSPITALS</Text>
            <Text style={styles.heroTitle}>A calmer admission desk starts here.</Text>
            <Text style={styles.heroText}>Configure your facility, publish a desk QR, and receive patient-authorized pre-admission information.</Text>

            <View style={styles.benefitList}>
              {['Verified facility identity', 'Reusable admission templates', 'Live patient status updates'].map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <CheckCircle2 color={COLORS.green} size={18} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.demoNotice}>
              <ShieldCheck color={COLORS.green} size={18} />
              <Text style={styles.demoNoticeText}><Text style={styles.demoNoticeStrong}>Frontend prototype:</Text> sign-in, account creation, and facility review are simulated. Production requires secure backend authentication and credential verification.</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <View style={styles.modeTabs}>
              <TouchableOpacity style={[styles.modeTab, mode === 'sign_in' && styles.modeTabActive]} onPress={() => switchMode('sign_in')} accessibilityRole="button">
                <Text style={[styles.modeTabText, mode === 'sign_in' && styles.modeTabTextActive]}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeTab, mode === 'sign_up' && styles.modeTabActive]} onPress={() => switchMode('sign_up')} accessibilityRole="button">
                <Text style={[styles.modeTabText, mode === 'sign_up' && styles.modeTabTextActive]}>Create hospital account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardTitle}>{mode === 'sign_in' ? 'Welcome back' : 'Register your facility'}</Text>
            <Text style={styles.cardSubtitle}>{mode === 'sign_in' ? 'Use your authorized hospital staff account.' : 'Submitted credentials are marked pending until facility review is complete.'}</Text>

            {mode === 'sign_up' && (
              <>
                <Field label="Official facility name" value={hospitalName} onChangeText={setHospitalName} placeholder="Cebu Community Hospital" />
                <View style={styles.fieldRow}>
                  <View style={styles.fieldHalf}><Field label="DOH Facility ID / LTO" value={dohFacilityId} onChangeText={setDohFacilityId} placeholder="DOH-R7-00000" /></View>
                  <View style={styles.fieldHalf}><Field label="PhilHealth accreditation" value={philhealthAccreditation} onChangeText={setPhilhealthAccreditation} placeholder="Optional for prototype" /></View>
                </View>
                <Field label="Hospital administrator" value={staffName} onChangeText={setStaffName} placeholder="Full name" />
              </>
            )}

            <Field label="Work email" value={email} onChangeText={setEmail} placeholder="name@hospital.gov.ph" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
            {mode === 'sign_up' && <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry />}

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={submit} accessibilityRole="button">
              <LockKeyhole color="#FFFFFF" size={18} />
              <Text style={styles.submitText}>{mode === 'sign_in' ? 'Sign in to portal' : 'Create account & continue'}</Text>
              <ArrowRight color="#FFFFFF" size={18} />
            </TouchableOpacity>

            {mode === 'sign_in' && (
              <>
                <View style={styles.orRow}><View style={styles.line} /><Text style={styles.orText}>PREPARED ACCOUNT</Text><View style={styles.line} /></View>
                <TouchableOpacity style={styles.demoButton} onPress={useDemoAccount} accessibilityRole="button">
                  <Building2 color={COLORS.blue} size={18} />
                  <View style={styles.demoButtonCopy}>
                    <Text style={styles.demoButtonTitle}>Continue as VSMMC Admissions</Text>
                    <Text style={styles.demoButtonText}>Prepared sample account · Ana Reyes, Admissions Officer</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  page: { flexGrow: 1, width: '100%', maxWidth: 1180, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 70, paddingHorizontal: 42, paddingVertical: 45 },
  brandColumn: { flex: 1, maxWidth: 480 },
  brandMark: { width: 62, height: 62, borderRadius: 19, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, color: COLORS.blue, marginBottom: 9 },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 34, lineHeight: 43, color: COLORS.ink },
  heroText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: COLORS.muted, marginTop: 12 },
  benefitList: { gap: 11, marginTop: 25 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  benefitText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.ink },
  demoNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.greenSoft, borderRadius: 14, padding: 14, marginTop: 28 },
  demoNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted },
  demoNoticeStrong: { fontFamily: 'Inter_600SemiBold', color: COLORS.green },
  authCard: { flex: 1, maxWidth: 560, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 24, padding: 25, shadowColor: '#173B4A', shadowOpacity: 0.07, shadowRadius: 20, elevation: 3 },
  modeTabs: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 23 },
  modeTab: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 9, paddingHorizontal: 8 },
  modeTabActive: { backgroundColor: COLORS.surface, shadowColor: '#173B4A', shadowOpacity: 0.08, shadowRadius: 6, elevation: 1 },
  modeTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.muted, textAlign: 'center' },
  modeTabTextActive: { color: COLORS.blue },
  cardTitle: { fontFamily: 'Sora_700Bold', fontSize: 23, color: COLORS.ink },
  cardSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 5, marginBottom: 19 },
  field: { marginBottom: 13 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldHalf: { flex: 1 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.ink, marginBottom: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: COLORS.line, borderRadius: 11, paddingHorizontal: 13, fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.ink, backgroundColor: '#FFFFFF' },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 16, color: '#B42318', backgroundColor: '#FFF3F1', borderRadius: 10, padding: 10, marginBottom: 12 },
  submitButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blue, borderRadius: 13, marginTop: 3 },
  submitText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 17 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.line },
  orText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1, color: '#94A3B8' },
  demoButton: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: '#BFD4F3', backgroundColor: COLORS.blueSoft, borderRadius: 13, padding: 13 },
  demoButtonCopy: { flex: 1 },
  demoButtonTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.blue },
  demoButtonText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted, marginTop: 3 },
});
