import { useState } from 'react';
import { Href, useRouter } from 'expo-router';
import { ArrowRight, FileText, HeartPulse, LogOut, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react-native';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppBottomNav } from '../components/AppBottomNav';
import { useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
};

export default function ProfileScreen() {
  const router = useRouter();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const logout = useStore((state) => state.logout);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const firstName = masterProfile.firstName || 'Juan';
  const lastName = masterProfile.lastName || 'Dela Cruz';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.identityCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <Text style={styles.name}>{firstName} {lastName}</Text>
          <Text style={styles.memberType}>{masterProfile.memberCategory || 'Alalay patient profile'}</Text>
          <View style={styles.safeBadge}><ShieldCheck color={COLORS.primary} size={15} /><Text style={styles.safeBadgeText}>Consent protected</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Your information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PhilHealth PIN</Text>
            <Text style={styles.infoValue}>{masterProfile.philhealthId || 'Not added'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blood type</Text>
            <Text style={styles.infoValue}>{masterProfile.bloodType || 'Not added'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency contact</Text>
            <Text style={styles.infoValue}>{masterProfile.emergencyContact.name || 'Not added'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/onboarding?edit=1')}>
            <View style={styles.menuIcon}><UserRound color={COLORS.primary} size={20} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>Pre-admission details</Text><Text style={styles.menuText}>Review or update patient information</Text></View>
            <ArrowRight color={COLORS.muted} size={18} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/reference')}>
            <View style={styles.menuIcon}><FileText color={COLORS.primary} size={20} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>Reference documents</Text><Text style={styles.menuText}>View MDR and CF1 forms</Text></View>
            <ArrowRight color={COLORS.muted} size={18} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/family' as Href)}>
            <View style={styles.menuIcon}><UsersRound color={COLORS.primary} size={20} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>Beneficiaries</Text><Text style={styles.menuText}>{beneficiaries.length} managed {beneficiaries.length === 1 ? 'person' : 'people'}</Text></View>
            <ArrowRight color={COLORS.muted} size={18} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.menuRow}>
            <View style={styles.menuIcon}><HeartPulse color={COLORS.primary} size={20} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>Health details</Text><Text style={styles.menuText}>Allergies, medicines, and conditions</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirmation(true)}
          accessibilityRole="button"
          accessibilityLabel="Log out of Alalay"
        >
          <View style={styles.logoutIcon}><LogOut color="#B33A3A" size={20} /></View>
          <View style={styles.menuCopy}>
            <Text style={styles.logoutTitle}>Log out</Text>
            <Text style={styles.menuText}>Return to the Alalay sign-in screen</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.privacyText}>Alalay keeps patient profiles private until you approve a hospital’s request.</Text>
      </ScrollView>

      <AppBottomNav active="profile" />

      <Modal
        visible={showLogoutConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirmation(false)}
      >
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowLogoutConfirmation(false)} />
          <View style={styles.logoutSheet}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLogoutConfirmation(false)} accessibilityLabel="Close logout confirmation">
              <X color={COLORS.muted} size={20} />
            </TouchableOpacity>
            <View style={styles.logoutModalIcon}><LogOut color="#B33A3A" size={27} /></View>
            <Text style={styles.logoutModalTitle}>Log out of Alalay?</Text>
            <Text style={styles.logoutModalText}>You will return to the sign-in screen. This prototype clears the locally stored demo profile when you log out.</Text>
            <View style={styles.logoutActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLogoutConfirmation(false)} accessibilityRole="button">
                <Text style={styles.cancelButtonText}>Stay signed in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLogoutButton} onPress={handleLogout} accessibilityRole="button">
                <Text style={styles.confirmLogoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 21, paddingBottom: 36 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, color: COLORS.primary, marginBottom: 5 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: COLORS.ink, marginBottom: 20 },
  identityCard: { alignItems: 'center', backgroundColor: COLORS.navy, borderRadius: 25, padding: 22, marginBottom: 27 },
  avatar: { width: 67, height: 67, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Sora_700Bold', fontSize: 21, color: COLORS.primary },
  name: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#FFFFFF', marginTop: 13 },
  memberType: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#C9DADF', marginTop: 4 },
  safeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F7F3', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: 13 },
  safeBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: COLORS.ink, marginBottom: 11, marginTop: 4 },
  infoCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, paddingHorizontal: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 15 },
  infoLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.muted },
  infoValue: { flexShrink: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.ink, textAlign: 'right' },
  divider: { height: 1, backgroundColor: COLORS.line },
  menuCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, paddingHorizontal: 15 },
  menuRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
  menuIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink },
  menuText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
  logoutButton: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0D0D0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11 },
  logoutIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  logoutTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#A83232' },
  privacyText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, textAlign: 'center', marginTop: 20, paddingHorizontal: 15 },
  modalRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  modalBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10, 28, 34, 0.58)' },
  logoutSheet: { width: '100%', maxWidth: 420, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 26, paddingHorizontal: 22, paddingTop: 28, paddingBottom: 22 },
  closeButton: { position: 'absolute', top: 13, right: 13, width: 39, height: 39, borderRadius: 13, backgroundColor: '#F0F4F3', alignItems: 'center', justifyContent: 'center' },
  logoutModalIcon: { width: 61, height: 61, borderRadius: 20, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  logoutModalTitle: { fontFamily: 'Sora_700Bold', fontSize: 20, color: COLORS.ink },
  logoutModalText: { maxWidth: 340, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, color: COLORS.muted, textAlign: 'center', marginTop: 7 },
  logoutActions: { width: '100%', flexDirection: 'row', gap: 9, marginTop: 20 },
  cancelButton: { flex: 1, minHeight: 49, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 15 },
  cancelButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.muted },
  confirmLogoutButton: { flex: 1, minHeight: 49, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B33A3A', borderRadius: 15 },
  confirmLogoutText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
});
