import { Href, useRouter } from 'expo-router';
import { Home, MessageCircle, QrCode, UserRound, UsersRound } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AppTab = 'home' | 'family' | 'messages' | 'profile';

interface AppBottomNavProps {
  active: AppTab;
}

const COLORS = {
  active: '#137A67',
  muted: '#879A95',
  navy: '#173B4A',
  line: '#DDE8E4',
};

export function AppBottomNav({ active }: AppBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 8);

  const tabColor = (tab: AppTab) => active === tab ? COLORS.active : COLORS.muted;

  return (
    <View style={[styles.shell, { height: 68 + safeBottom, paddingBottom: safeBottom }]}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.replace('/dashboard')}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <Home color={tabColor('home')} size={22} strokeWidth={active === 'home' ? 2.5 : 2} />
        <Text style={[styles.label, active === 'home' && styles.labelActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.replace('/family' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Family"
      >
        <UsersRound color={tabColor('family')} size={22} strokeWidth={active === 'family' ? 2.5 : 2} />
        <Text style={[styles.label, active === 'family' && styles.labelActive]}>Family</Text>
      </TouchableOpacity>

      <View style={styles.scanSlot}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/qr')}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel="Scan hospital QR"
        >
          <QrCode color="#FFFFFF" size={27} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.scanLabel}>Scan</Text>
      </View>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.replace('/messages' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Messages"
      >
        <MessageCircle color={tabColor('messages')} size={22} strokeWidth={active === 'messages' ? 2.5 : 2} />
        <Text style={[styles.label, active === 'messages' && styles.labelActive]}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.replace('/profile' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <UserRound color={tabColor('profile')} size={22} strokeWidth={active === 'profile' ? 2.5 : 2} />
        <Text style={[styles.label, active === 'profile' && styles.labelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: 6,
    shadowColor: '#173B4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 14,
  },
  item: { flex: 1, height: 68, alignItems: 'center', justifyContent: 'center', gap: 5 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 10, color: COLORS.muted },
  labelActive: { color: COLORS.active, fontFamily: 'Inter_600SemiBold' },
  scanSlot: { flex: 1.14, height: 68, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9 },
  scanButton: {
    position: 'absolute',
    top: -24,
    width: 60,
    height: 60,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderWidth: 5,
    borderColor: '#F4F7F6',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 12,
  },
  scanLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.navy },
});
