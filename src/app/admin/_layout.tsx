import { Slot, usePathname, useRouter } from 'expo-router';
import { Activity, BookOpen, Building2, FileJson, LogOut } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Identity', path: '/admin', icon: Building2 },
    { name: 'Templates', path: '/admin/templates', icon: FileJson },
    { name: 'AI Dictionary', path: '/admin/dictionary', icon: BookOpen },
    { name: 'Triage Hub', path: '/admin/triage', icon: Activity },
  ];

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>Alalay Admin</Text>
          <Text style={styles.brandSubtitle}>Hospital Portal</Text>
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
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
            <LogOut color="#718096" size={20} />
            <Text style={styles.logoutText}>Exit Portal</Text>
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
