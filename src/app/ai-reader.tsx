import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, FileText, BrainCircuit, Activity } from 'lucide-react-native';

export default function AIReaderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#007AFF" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Lab Reader</Text>
        <View style={{ width: 100 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* Intro */}
        <View style={{ marginBottom: 24, paddingHorizontal: 8 }}>
          <Text style={styles.title}>CBC Results</Text>
          <Text style={styles.subtitle}>Analyzed 2 mins ago by ALALAY AI</Text>
        </View>

        <View style={styles.bentoContainer}>
          
          {/* LEFT/TOP PANE: Original Complex Data */}
          <View style={[styles.bentoBox, styles.originalDataBox]}>
            <View style={styles.bentoHeader}>
              <FileText size={20} color="#8E8E93" />
              <Text style={styles.bentoHeaderTitle}>Raw Laboratory Document</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>TEST</Text>
              <Text style={styles.tableCol2}>RESULT</Text>
              <Text style={styles.tableCol3}>REF. RANGE</Text>
            </View>
            <View style={styles.tableDivider} />

            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>Erythrocytes</Text>
              <Text style={[styles.tableCol2, { color: '#FF3B30' }]}>3.9 x10^12/L</Text>
              <Text style={styles.tableCol3}>4.2 - 5.4</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>Leukocytes</Text>
              <Text style={styles.tableCol2}>6.5 x10^9/L</Text>
              <Text style={styles.tableCol3}>4.0 - 10.0</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>Thrombocytes</Text>
              <Text style={styles.tableCol2}>250 x10^9/L</Text>
              <Text style={styles.tableCol3}>150 - 450</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>Hemoglobin (HGB)</Text>
              <Text style={[styles.tableCol2, { color: '#FF3B30' }]}>11.2 g/dL</Text>
              <Text style={styles.tableCol3}>12.0 - 15.5</Text>
            </View>
          </View>

          {/* RIGHT/BOTTOM PANE: AI Explanation */}
          <View style={[styles.bentoBox, styles.aiBox]}>
            <View style={styles.bentoHeader}>
              <BrainCircuit size={20} color="#5E5CE6" />
              <Text style={[styles.bentoHeaderTitle, { color: '#5E5CE6' }]}>AI Breakdown</Text>
            </View>

            <Text style={styles.aiGreeting}>Here is what your CBC means in plain English:</Text>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Activity size={18} color="#FF3B30" />
                <Text style={styles.insightTitle}>Slight Anemia Detected</Text>
              </View>
              <Text style={styles.insightText}>
                Your <Text style={styles.boldText}>Erythrocytes (Red Blood Cells)</Text> and <Text style={styles.boldText}>Hemoglobin</Text> are slightly below normal. This usually means you might feel a bit more tired than usual.
              </Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: '#E6F4EA' }]}>
              <View style={styles.insightHeader}>
                <Info size={18} color="#34C759" />
                <Text style={[styles.insightTitle, { color: '#34C759' }]}>Good News</Text>
              </View>
              <Text style={styles.insightText}>
                Your <Text style={styles.boldText}>Leukocytes (White Blood Cells)</Text> and <Text style={styles.boldText}>Thrombocytes (Platelets)</Text> are perfectly normal. This indicates your body is not fighting an active infection right now.
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              ALALAY AI is a guide, not a doctor. Always consult your attending physician for a formal diagnosis.
            </Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA'
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#007AFF', fontFamily: 'Inter_500Medium', fontSize: 17, marginLeft: -4 },
  headerTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#000000' },
  
  content: { flex: 1 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#000000', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#8E8E93' },

  bentoContainer: { gap: 16 },
  
  bentoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  originalDataBox: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E5EA' },
  aiBox: { backgroundColor: '#F9F9FF', borderWidth: 1, borderColor: '#E5E5FE' },

  bentoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  bentoHeaderTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#8E8E93', textTransform: 'uppercase' },

  // Table Styles
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  tableDivider: { height: 1, backgroundColor: '#E5E5EA', my: 4 },
  tableCol1: { flex: 2, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#4A5568' },
  tableCol2: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', textAlign: 'right' },
  tableCol3: { flex: 1.5, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8E8E93', textAlign: 'right' },

  // AI Styles
  aiGreeting: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#2D3748', marginBottom: 20 },
  insightCard: { backgroundColor: '#FFF0F0', padding: 16, borderRadius: 16, marginBottom: 12 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#FF3B30' },
  insightText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2D3748', lineHeight: 22 },
  boldText: { fontFamily: 'Inter_600SemiBold' },

  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8E8E93', textAlign: 'center', marginTop: 16, fontStyle: 'italic' }
});
