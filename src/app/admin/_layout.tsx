import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import { BookOpen, Building2, ClipboardList, FileJson, LogOut } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store/useStore';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const hospitalSession = useStore((state) => state.hospitalSession);
  const logoutHospital = useStore((state) => state.logoutHospital);

  if (!hospitalSession.isAuthenticated) {
    return <Redirect href="/hospital-login" />;
  }

  const navItems = [
    { name: 'Identity', path: '/admin', icon: Building2 },
    { name: 'Templates', path: '/admin/templates', icon: FileJson },
    { name: 'AI Dictionary', path: '/admin/dictionary', icon: BookOpen },
    { name: 'Admission Queue', path: '/admin/triage', icon: ClipboardList },
  ];

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>Alalay Admin</Text>
          <Text style={styles.brandSubtitle} numberOfLines={2}>{hospitalSession.hospitalName}</Text>
          <View style={[styles.verificationBadge, hospitalSession.verificationStatus === 'pending_review' && styles.pendingBadge]}>
            <Text style={[styles.verificationText, hospitalSession.verificationStatus === 'pending_review' && styles.pendingText]}>
              {hospitalSession.verificationStatus === 'verified' ? 'VERIFIED FACILITY' : 'PENDING FACILITY REVIEW'}
            </Text>
          </View>
        </View>

        <View style={styles.navContainer}>
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.path as any)}
              >
                <Icon color={isActive ? '#007AFF' : '#718096'} size={20} />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <View style={styles.staffCard}>
            <Text style={styles.staffName}>{hospitalSession.staffName}</Text>
            <Text style={styles.staffRole}>{hospitalSession.role}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { logoutHospital(); router.replace('/hospital-login'); }}>
            <LogOut color="#718096" size={20} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  brandContainer: {
    marginBottom: 48,
  },
  brandTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#2D3748',
  },
  brandSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  verificationBadge: { alignSelf: 'flex-start', backgroundColor: '#E6F5F1', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, marginTop: 10 },
  pendingBadge: { backgroundColor: '#FFF5E5' },
  verificationText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.7, color: '#137A67' },
  pendingText: { color: '#975A16' },
  navContainer: {
    flex: 1,
    gap: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: '#EBF4FF',
  },
  navText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#718096',
  },
  navTextActive: {
    color: '#007AFF',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
  staffCard: { paddingHorizontal: 16, paddingBottom: 10 },
  staffName: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#2D3748' },
  staffRole: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#718096', marginTop: 3 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  logoutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#718096',
  },
  content: {
    flex: 1,
    padding: 40,
    overflow: 'hidden',
  }
});
