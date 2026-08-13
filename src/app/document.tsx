import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, FileText, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react-native';

export default function DocumentReaderScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  return (
    <View style={styles.container}>
      {/* Offline-safe branded header */}
      <View style={styles.imageHeader}>
        <SafeAreaView>
          <View style={[styles.topBar, isWide && styles.pageWidth]}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <View style={styles.glassPill}>
              <Text style={styles.glassText}>Original Document</Text>
            </View>
            <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>SAMPLE DOCUMENT</Text></View>
          </View>
        </SafeAreaView>
        <View style={[styles.heroCopy, isWide && styles.pageWidth]}>
          <Text style={styles.heroEyebrow}>HOSPITAL-RANGE COMPARISON</Text>
          <Text style={styles.heroTitle}>Your lab result</Text>
          <Text style={styles.heroSubtitle}>Compared only with the ranges shown on this report</Text>
        </View>
      </View>

      {/* Main Content Sheet */}
      <View style={[styles.sheet, isWide && styles.sheetWide]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <FileText color="#FFFFFF" size={24} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Lab Result Explainer</Text>
              <Text style={styles.subtitle}>Cebu sample lab report • 3 values read</Text>
            </View>
          </View>

          <View style={styles.sourceNotice}>
            <ShieldCheck color="#246BCE" size={19} />
            <Text style={styles.sourceNoticeText}>Every label below comes from this report’s printed hospital ranges. Alalay does not infer a diagnosis.</Text>
          </View>

          {/* Metric 1 - High */}
          <View style={[styles.metricCard, styles.metricCardHigh]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>WHITE BLOOD CELLS (WBC)</Text>
              <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>HIGH</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>12.5</Text>
              <Text style={styles.metricUnit}>x10^9/L</Text>
            </View>
            <Text style={styles.metricDesc}>
              12.5 is above the hospital-provided range shown for this report. It is labeled HIGH using that range only.
            </Text>
          </View>

          {/* Metric 2 - Normal */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>HEMOGLOBIN</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>NORMAL</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>14.2</Text>
              <Text style={styles.metricUnit}>g/dL</Text>
            </View>
            <Text style={styles.metricDesc}>
              14.2 falls within the hospital-provided reference range shown for this report.
            </Text>
          </View>

          {/* Metric 3 - Normal */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>PLATELETS</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>NORMAL</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>245</Text>
              <Text style={styles.metricUnit}>x10^9/L</Text>
            </View>
            <Text style={styles.metricDesc}>
              245 falls within the hospital-provided reference range shown for this report.
            </Text>
          </View>

          {/* Overall Summary Callout */}
          <View style={styles.summaryCallout}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12}}>
              <Lightbulb color="#FFFFFF" size={20} />
              <Text style={styles.summaryTitle}>Overall Summary</Text>
            </View>
            <Text style={styles.summaryText}>
              Two displayed values are within the provided ranges and one is above its provided range. Alalay does not infer a cause or diagnosis.
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
              <Text style={styles.saveBtnText}>Save Explanation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recoveryCard}>
            <View style={styles.recoveryCopy}>
              <Text style={styles.recoveryTitle}>Missing or unreadable value?</Text>
              <Text style={styles.recoveryText}>Retake the document with all four corners visible. The existing explanation stays unchanged until a clearer scan is processed.</Text>
            </View>
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => router.replace('/scan-doc?type=lab')}
              accessibilityRole="button"
            >
              <RotateCcw color="#246BCE" size={17} />
              <Text style={styles.rescanButtonText}>Rescan</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
        <View style={styles.disclaimerBanner}>
          <Text style={styles.disclaimer}>This is not medical advice - please discuss with your doctor.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  
  imageHeader: { height: 280, width: '100%', backgroundColor: '#243B68' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
  pageWidth: { width: '100%', maxWidth: 960, alignSelf: 'center' },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  glassPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  glassText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  demoBadge: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  demoBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1, color: '#FFFFFF' },
  heroCopy: { paddingHorizontal: 28, marginTop: 30 },
  heroEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: '#9EC5FF', marginBottom: 7 },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 27, color: '#FFFFFF' },
  heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#D4E1F5', marginTop: 5 },

  sheet: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    marginTop: -40, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10
  },
  sheetWide: { width: '100%', maxWidth: 960, alignSelf: 'center' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  scrollContentWide: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 34 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  headerCopy: { flex: 1 },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#3182CE', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#1A202C', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096' },
  sourceNotice: { flexDirection: 'row', gap: 10, backgroundColor: '#EEF5FF', borderWidth: 1, borderColor: '#CFE0F7', borderRadius: 16, padding: 14, marginTop: -14, marginBottom: 20 },
  sourceNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#4A617B' },

  metricCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 16,
    borderWidth: 1, borderColor: '#EDF2F7',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  metricCardHigh: { borderColor: '#FEB2B2', backgroundColor: '#FFF5F5' },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#718096', letterSpacing: 1 },
  
  badgeHigh: { backgroundColor: '#FED7D7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextHigh: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#C53030', letterSpacing: 0.5 },
  badgeNormal: { backgroundColor: '#C6F6D5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextNormal: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#276749', letterSpacing: 0.5 },

  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  metricValue: { fontFamily: 'Sora_700Bold', fontSize: 32, color: '#1A202C' },
  metricUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#A0AEC0' },
  metricDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4A5568', lineHeight: 22 },

  summaryCallout: { backgroundColor: '#3182CE', borderRadius: 24, padding: 24, marginTop: 16, marginBottom: 24 },
  summaryTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 24 },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  recoveryCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 15, marginBottom: 18 },
  recoveryCopy: { flex: 1 },
  recoveryTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#1A202C' },
  recoveryText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: '#718096', marginTop: 4 },
  rescanButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EAF2FF', borderRadius: 13, paddingHorizontal: 13 },
  rescanButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#246BCE' },

  disclaimerBanner: { backgroundColor: '#FFF5F5', borderTopWidth: 1, borderTopColor: '#FED7D7', paddingHorizontal: 18, paddingVertical: 13 },
  disclaimer: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#9B2C2C', textAlign: 'center', lineHeight: 18 }
});
