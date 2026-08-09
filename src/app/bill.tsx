import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Maximize2, Receipt, Lightbulb } from 'lucide-react-native';

export default function BillReaderScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Document Image */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop' }} 
        style={styles.imageHeader}
        imageStyle={{ opacity: 0.4 }}
      >
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()}>
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <View style={styles.glassPill}>
              <Text style={styles.glassText}>Original Bill</Text>
            </View>
            <TouchableOpacity style={styles.glassBtn}>
              <Maximize2 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Main Content Sheet */}
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Receipt color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text style={styles.title}>AI Bill Analysis</Text>
              <Text style={styles.subtitle}>St. Luke's Medical Center • OCT 12</Text>
            </View>
          </View>

          {/* Metric 1 - Total */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>GROSS HOSPITAL CHARGES</Text>
              <View style={styles.badgeNeutral}><Text style={styles.badgeTextNeutral}>TOTAL</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>₱45,200</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is the total cost of your stay before any insurance or PhilHealth deductions were applied.
            </Text>
          </View>

          {/* Metric 2 - PhilHealth */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>PHILHEALTH DEDUCTION (CF1)</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>APPLIED</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={[styles.metricValue, { color: '#38A169' }]}>-₱12,500</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              Your PhilHealth was successfully validated and deducted primarily from your room and board charges.
            </Text>
          </View>

          {/* Metric 3 - HMO */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>HMO / MAXICARE</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>APPLIED</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={[styles.metricValue, { color: '#38A169' }]}>-₱20,000</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              Maxicare covered the diagnostic tests and professional fees up to your policy's limit.
            </Text>
          </View>

          {/* Metric 4 - Due */}
          <View style={[styles.metricCard, styles.metricCardHigh]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>NET AMOUNT PAYABLE</Text>
              <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>DUE NOW</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>₱12,700</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is your final out-of-pocket balance to be settled at the billing counter.
            </Text>
          </View>

          {/* Overall Summary Callout */}
          <View style={styles.summaryCallout}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12}}>
              <Lightbulb color="#FFFFFF" size={20} />
              <Text style={styles.summaryTitle}>AI Summary</Text>
            </View>
            <Text style={styles.summaryText}>
              Your PhilHealth and HMO successfully covered 72% of the total hospital bill. The remaining ₱12,700 is your out-of-pocket maximum.
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
              <Text style={styles.saveBtnText}>Pay via GCash Now</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.disclaimer}>
            🛡️ AI-assisted explanation grounded in St. Luke's billing glossary.{'\n'}Verify amounts with the hospital cashier.
          </Text>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  
  imageHeader: { height: 280, width: '100%' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  glassPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  glassText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },

  sheet: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    marginTop: -40, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10
  },
  scrollContent: { padding: 24, paddingBottom: 60 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#38A169', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#1A202C', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096' },

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
  badgeNeutral: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextNeutral: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#4A5568', letterSpacing: 0.5 },

  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  metricValue: { fontFamily: 'Sora_700Bold', fontSize: 32, color: '#1A202C' },
  metricUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#A0AEC0' },
  metricDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4A5568', lineHeight: 22 },

  summaryCallout: { backgroundColor: '#38A169', borderRadius: 24, padding: 24, marginTop: 16, marginBottom: 24 },
  summaryTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 24 },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#A0AEC0', textAlign: 'center', lineHeight: 18 }
});
