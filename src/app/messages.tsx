import { useRouter } from 'expo-router';
import { ArrowRight, FlaskConical, MessageCircle, ReceiptText, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppBottomNav } from '../components/AppBottomNav';

const COLORS = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  amber: '#AD6500',
  amberSoft: '#FFF3DD',
  blue: '#246BCE',
  blueSoft: '#EAF2FF',
};

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ALALAY ASSISTANT</Text>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Return to explanations connected to your scanned documents.</Text>

        <View style={styles.notice}>
          <ShieldCheck color={COLORS.primary} size={20} />
          <Text style={styles.noticeText}>These are grounded document explanations—not messages from a doctor or hospital.</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent conversations</Text>

        <TouchableOpacity style={styles.threadCard} onPress={() => router.push('/bill')} activeOpacity={0.8}>
          <View style={[styles.threadIcon, { backgroundColor: COLORS.amberSoft }]}>
            <ReceiptText color={COLORS.amber} size={24} />
          </View>
          <View style={styles.threadCopy}>
            <View style={styles.threadTitleRow}>
              <Text style={styles.threadTitle}>Hospital bill</Text>
              <Text style={styles.threadTime}>Today</Text>
            </View>
            <Text style={styles.threadMeta}>Seeded Cebu hospital bill</Text>
            <Text style={styles.threadPreview} numberOfLines={2}>Ask about the ₱45,200 total, PhilHealth, HMO, or remaining balance.</Text>
          </View>
          <ArrowRight color={COLORS.muted} size={19} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.threadCard} onPress={() => router.push('/document')} activeOpacity={0.8}>
          <View style={[styles.threadIcon, { backgroundColor: COLORS.blueSoft }]}>
            <FlaskConical color={COLORS.blue} size={24} />
          </View>
          <View style={styles.threadCopy}>
            <View style={styles.threadTitleRow}>
              <Text style={styles.threadTitle}>CBC lab result</Text>
              <Text style={styles.threadTime}>Yesterday</Text>
            </View>
            <Text style={styles.threadMeta}>Seeded demonstration result</Text>
            <Text style={styles.threadPreview} numberOfLines={2}>Review which values are inside or outside the hospital-provided ranges.</Text>
          </View>
          <ArrowRight color={COLORS.muted} size={19} />
        </TouchableOpacity>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><MessageCircle color={COLORS.primary} size={25} /></View>
          <Text style={styles.emptyTitle}>New explanations appear here</Text>
          <Text style={styles.emptyText}>Scan a hospital bill or lab result from Home to start another grounded conversation.</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/dashboard')}>
            <Text style={styles.homeButtonText}>Explore features</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppBottomNav active="messages" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 21, paddingBottom: 36 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, color: COLORS.primary, marginBottom: 5 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: COLORS.ink },
  subtitle: { maxWidth: 420, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: COLORS.muted, marginTop: 5 },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: '#CBE9E2', borderRadius: 16, padding: 14, marginTop: 21, marginBottom: 27 },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: COLORS.muted },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink, marginBottom: 12 },
  threadCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, padding: 15, marginBottom: 11 },
  threadIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  threadCopy: { flex: 1 },
  threadTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  threadTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  threadTime: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted },
  threadMeta: { fontFamily: 'Inter_500Medium', fontSize: 10, color: COLORS.primary, marginTop: 3 },
  threadPreview: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 4 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 22, marginTop: 16 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: COLORS.ink, textAlign: 'center', marginTop: 14 },
  emptyText: { maxWidth: 340, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: COLORS.muted, textAlign: 'center', marginTop: 5 },
  homeButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navy, borderRadius: 13, paddingHorizontal: 20, marginTop: 16 },
  homeButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
});
