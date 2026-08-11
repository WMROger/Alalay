import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, Smartphone } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

export default function LoginScreen() {
  const router = useRouter();
  const [mobileFlowOpen, setMobileFlowOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const continueWithEgov = () => {
    router.replace('/privacy?source=egov');
  };

  const continueWithMobile = () => {
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    router.replace('/privacy?source=mobile');
  };

  const resetMobileFlow = () => {
    setMobileFlowOpen(false);
    setOtpSent(false);
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.brandMark}><Text style={styles.brandLetter}>A</Text></View>
          <Text style={styles.eyebrow}>HOSPITAL PRE-ADMISSION</Text>
          <Text style={styles.title}>{mobileFlowOpen ? 'Continue with your number' : 'Welcome to Alalay'}</Text>
          <Text style={styles.subtitle}>
            {mobileFlowOpen
              ? 'We’ll send a one-time code to verify your mobile number. No password needed.'
              : 'Use one verified account to prepare health information for yourself and the people you care for.'}
          </Text>

          {!mobileFlowOpen ? (
            <View style={styles.authStack}>
              <TouchableOpacity
                style={styles.egovButton}
                onPress={continueWithEgov}
                accessibilityRole="button"
                accessibilityLabel="Continue with eGov PH"
              >
                <View style={styles.egovIcon}><ShieldCheck color="#FFFFFF" size={23} /></View>
                <View style={styles.egovCopy}>
                  <Text style={styles.egovTitle}>Continue with eGov PH</Text>
                  <Text style={styles.egovText}>Primary · Use your verified government identity</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.mobileButton}
                onPress={() => setMobileFlowOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Continue with mobile number"
              >
                <View style={styles.mobileIcon}><Smartphone color={COLORS.primary} size={22} /></View>
                <Text style={styles.mobileButtonText}>Continue with mobile number</Text>
              </TouchableOpacity>

              <Text style={styles.authNote}>New to Alalay? Your account will be created after verification.</Text>
            </View>
          ) : (
            <View style={styles.mobileForm}>
              <TouchableOpacity style={styles.backMethodButton} onPress={resetMobileFlow} accessibilityRole="button">
                <ChevronLeft color={COLORS.primary} size={19} />
                <Text style={styles.backMethodText}>Other sign-in options</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Mobile number</Text>
              <TextInput
                style={styles.input}
                placeholder="09XX XXX XXXX"
                placeholderTextColor="#8EA19C"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                editable={!otpSent}
                accessibilityLabel="Mobile number"
              />

              {otpSent && (
                <>
                  <View style={styles.sentCard}>
                    <Text style={styles.sentText}>A one-time code was sent to {mobileNumber}.</Text>
                  </View>
                  <Text style={styles.label}>One-time code</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#8EA19C"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    accessibilityLabel="Six-digit one-time code"
                  />
                  <Text style={styles.demoText}>Demo mode: enter any six digits.</Text>
                </>
              )}

              <TouchableOpacity
                style={[styles.continueButton, (!mobileNumber || (otpSent && otp.length !== 6)) && styles.buttonDisabled]}
                onPress={continueWithMobile}
                disabled={!mobileNumber || (otpSent && otp.length !== 6)}
                accessibilityRole="button"
              >
                <Text style={styles.continueButtonText}>{otpSent ? 'Verify & Continue' : 'Send one-time code'}</Text>
              </TouchableOpacity>

              {otpSent && (
                <TouchableOpacity style={styles.changeNumberButton} onPress={() => { setOtpSent(false); setOtp(''); }} accessibilityRole="button">
                  <Text style={styles.changeNumberText}>Use a different mobile number</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.privacyRow}>
            <ShieldCheck color={COLORS.primary} size={17} />
            <Text style={styles.privacyText}>Your profile stays private until you approve sharing with a hospital.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 28 },
  brandMark: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  brandLetter: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#FFFFFF' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary, letterSpacing: 1.5, marginBottom: 8 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 30, lineHeight: 38, color: COLORS.ink },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: COLORS.muted, marginTop: 8, marginBottom: 29 },
  authStack: { gap: 12 },
  egovButton: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.navy, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14 },
  egovIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  egovCopy: { flex: 1 },
  egovTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  egovText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C9DADF', marginTop: 4 },
  arrow: { fontFamily: 'Inter_400Regular', fontSize: 28, color: '#FFFFFF' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  divider: { flex: 1, height: 1, backgroundColor: '#CBD8D4' },
  dividerText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#82948F', letterSpacing: 1.2 },
  mobileButton: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 17 },
  mobileIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  mobileButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink },
  authNote: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, textAlign: 'center', marginTop: 2 },
  mobileForm: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 18 },
  backMethodButton: { alignSelf: 'flex-start', minHeight: 38, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backMethodText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.primary },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.ink, marginBottom: 7 },
  input: { minHeight: 52, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.ink, marginBottom: 15 },
  otpInput: { fontFamily: 'Sora_600SemiBold', fontSize: 20, letterSpacing: 6, textAlign: 'center' },
  sentCard: { backgroundColor: COLORS.primarySoft, borderRadius: 12, padding: 11, marginBottom: 15 },
  sentText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, color: COLORS.primary },
  demoText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: -7, marginBottom: 13 },
  continueButton: { minHeight: 53, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 15 },
  buttonDisabled: { opacity: 0.42 },
  continueButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  changeNumberButton: { minHeight: 43, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  changeNumberText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.muted },
  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24 },
  privacyText: { flexShrink: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted, textAlign: 'center' },
});
