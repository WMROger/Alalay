import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookOpen, UploadCloud, Database, CheckCircle2, ChevronRight } from 'lucide-react-native';

export default function AdminDictionaryScreen() {
  const [billingState, setBillingState] = useState<'idle' | 'uploading' | 'complete'>('idle');
  const [labState, setLabState] = useState<'idle' | 'uploading' | 'complete'>('idle');

  const handleUpload = (type: 'billing' | 'lab') => {
    if (type === 'billing') {
      setBillingState('uploading');
      setTimeout(() => setBillingState('complete'), 1500);
    } else {
      setLabState('uploading');
      setTimeout(() => setLabState('complete'), 2000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <BookOpen color="#007AFF" size={32} />
        </View>
        <View>
          <Text style={styles.title}>AI Dictionary & Ground Truth</Text>
          <Text style={styles.subtitle}>Upload your localized data files to power the Alalay AI safely.</Text>
        </View>
      </View>

      <View style={styles.layout}>
        {/* Billing Rates */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Billing & Fee Schedules</Text>
            <Text style={styles.cardDesc}>Provide your hospital's current room rates, triage fees, and PhilHealth case rates. This boundaries the AI so it never hallucinates costs.</Text>
          </View>
          
          {billingState === 'idle' && (
            <TouchableOpacity style={styles.uploadArea} onPress={() => handleUpload('billing')}>
              <UploadCloud color="#A0AEC0" size={32} />
              <Text style={styles.uploadBtnText}>Upload Billing Data (.csv, .json)</Text>
            </TouchableOpacity>
          )}

          {billingState === 'uploading' && (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="small" color="#3182CE" />
              <Text style={styles.loadingText}>Processing fee schedules...</Text>
            </View>
          )}

          {billingState === 'complete' && (
            <View style={styles.dataPreview}>
              <View style={styles.dataHeader}>
                <CheckCircle2 color="#38A169" size={20} />
                <Text style={styles.dataTitle}>Billing Data Indexed (3,142 records)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 2, fontFamily: 'Inter_600SemiBold' }]}>Category</Text>
                <Text style={[styles.tableCol, { fontFamily: 'Inter_600SemiBold' }]}>Standard Cost</Text>
                <Text style={[styles.tableCol, { fontFamily: 'Inter_600SemiBold' }]}>PhilHealth Coverage</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 2 }]}>Ward Room (Daily)</Text>
                <Text style={styles.tableCol}>₱1,500.00</Text>
                <Text style={styles.tableCol}>100% (Case dependent)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 2 }]}>ER Consult Fee</Text>
                <Text style={styles.tableCol}>₱800.00</Text>
                <Text style={styles.tableCol}>₱0.00</Text>
              </View>
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableCol, { flex: 2 }]}>Dengue Fever (Case Rate)</Text>
                <Text style={styles.tableCol}>-</Text>
                <Text style={styles.tableCol}>₱10,000.00 max</Text>
              </View>
            </View>
          )}
        </View>

        {/* Lab References */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Laboratory Reference Ranges</Text>
            <Text style={styles.cardDesc}>Upload the specific baseline ranges for your laboratory equipment to ensure accurate AI explanations of test results.</Text>
          </View>

          {labState === 'idle' && (
            <TouchableOpacity style={styles.uploadArea} onPress={() => handleUpload('lab')}>
              <Database color="#A0AEC0" size={32} />
              <Text style={styles.uploadBtnText}>Upload Reference Data (.csv, .json)</Text>
            </TouchableOpacity>
          )}

          {labState === 'uploading' && (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="small" color="#3182CE" />
              <Text style={styles.loadingText}>Mapping clinical boundaries...</Text>
            </View>
          )}

          {labState === 'complete' && (
            <View style={styles.dataPreview}>
              <View style={styles.dataHeader}>
                <CheckCircle2 color="#38A169" size={20} />
                <Text style={styles.dataTitle}>Lab Ranges Indexed (412 biomarkers)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 1.5, fontFamily: 'Inter_600SemiBold' }]}>Biomarker</Text>
                <Text style={[styles.tableCol, { fontFamily: 'Inter_600SemiBold' }]}>Male Range</Text>
                <Text style={[styles.tableCol, { fontFamily: 'Inter_600SemiBold' }]}>Female Range</Text>
                <Text style={[styles.tableCol, { flex: 2, fontFamily: 'Inter_600SemiBold' }]}>AI Layman Term</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 1.5 }]}>HGB (Hemoglobin)</Text>
                <Text style={styles.tableCol}>13.8 - 17.2 g/dL</Text>
                <Text style={styles.tableCol}>12.1 - 15.1 g/dL</Text>
                <Text style={[styles.tableCol, { flex: 2 }]}>Oxygen-carrying protein</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 1.5 }]}>WBC (White Blood Cells)</Text>
                <Text style={styles.tableCol}>4.5 - 11.0 x10^9/L</Text>
                <Text style={styles.tableCol}>4.5 - 11.0 x10^9/L</Text>
                <Text style={[styles.tableCol, { flex: 2 }]}>Infection-fighting cells</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#2D3748', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096' },
  layout: { gap: 24, paddingBottom: 60 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 32 },
  cardHeader: { marginBottom: 24 },
  cardTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: '#2D3748', marginBottom: 8 },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', lineHeight: 20 },
  
  uploadArea: { backgroundColor: '#F7FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 12, padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 },
  uploadBtnText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#4A5568' },
  
  loadingArea: { backgroundColor: '#EBF4FF', borderRadius: 12, padding: 40, alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'row' },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#2B6CB0' },
  
  dataPreview: { backgroundColor: '#F7FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 },
  dataHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  dataTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#276749' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingVertical: 12 },
  tableCol: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#4A5568' },
});
