import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const continueWithOtp = () => {
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    router.replace('/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>HOSPITAL PRE-ADMISSION</Text>
        <Text style={styles.title}>Alalay</Text>
        <Text style={styles.subtitle}>Set up your health profile once. Skip repetitive paperwork at the hospital.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile number or email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com or +63 9..."
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            editable={!otpSent}
          />

          {otpSent && (
            <>
              <Text style={styles.sentText}>A one-time code was sent to {identifier || 'your account'}.</Text>
              <Text style={styles.label}>One-time code</Text>
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.demoText}>Demo mode: enter any 6 digits.</Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, (!identifier || (otpSent && otp.length !== 6)) && styles.buttonDisabled]}
            onPress={continueWithOtp}
            disabled={!identifier || (otpSent && otp.length !== 6)}
          >
            <Text style={styles.buttonText}>{otpSent ? 'Verify & Continue' : 'Send One-Time Code'}</Text>
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity style={styles.changeButton} onPress={() => { setOtpSent(false); setOtp(''); }}>
              <Text style={styles.changeButtonText}>Change mobile number or email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF0EE' },
  content: { flex: 1, padding: 24, justifyContent: 'center', maxWidth: 560, width: '100%', alignSelf: 'center' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#2F855A', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 42, color: '#2D3748', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#4A5568', marginBottom: 40 },
  form: { gap: 12 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#4A5568', marginTop: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE6E2', borderRadius: 12, padding: 16, fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1A202C' },
  sentText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#276749', backgroundColor: '#F0FFF4', borderRadius: 10, padding: 12 },
  demoText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096' },
  button: { backgroundColor: '#2D3748', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  changeButton: { padding: 12, alignItems: 'center' },
  changeButtonText: { color: '#4A5568', fontFamily: 'Inter_500Medium', fontSize: 14 },
});
