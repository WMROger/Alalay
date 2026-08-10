import { useRouter } from 'expo-router';
import { Bell, CheckCircle2, ChevronLeft, Clock3, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = { background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75', line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A' };

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.notification, styles.unread]}>
          <View style={[styles.icon, { backgroundColor: COLORS.primarySoft }]}><CheckCircle2 color={COLORS.primary} size={22} /></View>
          <View style={styles.copy}>
            <View style={styles.titleRow}><Text style={styles.title}>Profile ready for review</Text><View style={styles.unreadDot} /></View>
            <Text style={styles.text}>Review your pre-admission information before sharing it at the hospital.</Text>
            <View style={styles.timeRow}><Clock3 color={COLORS.muted} size={13} /><Text style={styles.time}>Today</Text></View>
          </View>
        </View>
        <View style={styles.notification}>
          <View style={styles.icon}><ShieldCheck color={COLORS.primary} size={22} /></View>
          <View style={styles.copy}>
            <Text style={styles.title}>Privacy reminder</Text>
            <Text style={styles.text}>Alalay will always show what a hospital is requesting before you consent.</Text>
            <View style={styles.timeRow}><Clock3 color={COLORS.muted} size={13} /><Text style={styles.time}>Yesterday</Text></View>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Bell color={COLORS.primary} size={24} />
          <Text style={styles.emptyText}>You’re all caught up.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.surface },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#EDF3F1', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: COLORS.ink },
  headerSpacer: { width: 40 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, gap: 11 },
  notification: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 15 },
  unread: { borderColor: '#B9DED5' },
  icon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#F0F5F3', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flexShrink: 1, fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E05252' },
  text: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 5 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  time: { fontFamily: 'Inter_500Medium', fontSize: 9, color: COLORS.muted },
  emptyState: { alignItems: 'center', gap: 8, padding: 28 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.muted },
});
