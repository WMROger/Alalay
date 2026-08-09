import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, CheckCircle2, ShieldCheck, Database, CameraOff, QrCode } from 'lucide-react-native';

type HospitalType = 'general' | 'specialist';

interface HospitalTemplate {
  name: string;
  type: HospitalType;
  requiredData: string[];
}

const templates: Record<HospitalType, HospitalTemplate> = {
  general: {
    name: 'General Hospital',
    type: 'general',
    requiredData: ['PhilHealth PIN', 'Basic Personal Info', 'Blood Type', 'Beneficiaries/Dependents', 'Emergency Contact', 'Chief Complaint']
  },
  specialist: {
    name: 'Specialist Clinic',
    type: 'specialist',
    requiredData: ['PhilHealth PIN', 'Basic Personal Info', 'Blood Type', 'Chronic Conditions', 'Beneficiaries/Dependents']
  }
};

export default function QRScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  // Modals / Overlays
  const [activeTemplate, setActiveTemplate] = useState<HospitalTemplate | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    // Simulate detecting a general hospital QR code
    setActiveTemplate(templates.general);
  };

  const simulateScan = (type: HospitalType) => {
    if (scanned) return;
    setScanned(true);
    setActiveTemplate(templates[type]);
  };

  const cancelTransfer = () => {
    setActiveTemplate(null);
    setScanned(false);
  };

  const confirmAndTransfer = () => {
    setIsUploading(true);
    
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);
      
    }, 1500);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContent}>
          <CameraOff color="#4A5568" size={64} style={{ marginBottom: 24 }} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>We need access to your camera so you can scan the hospital's admission QR code.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Scanner View */}
      <View style={styles.scannerWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Overlay cutouts and styling */}
        <View style={styles.overlayTop}>
          <TouchableOpacity style={styles.closeHeaderBtn} onPress={() => router.back()}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Scan Hospital QR</Text>
        </View>
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanInstruction}>Align the hospital's QR code within the frame to securely transfer your data.</Text>
          
          {/* SIMULATION BUTTONS */}
          <View style={styles.simulationContainer}>
            <Text style={styles.simLabel}>[Simulation Tools]</Text>
            <TouchableOpacity style={styles.simBtn} onPress={() => simulateScan('general')}>
              <QrCode color="#2D3748" size={16} /><Text style={styles.simBtnText}>Simulate: General Hospital</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simBtn} onPress={() => simulateScan('specialist')}>
              <QrCode color="#2D3748" size={16} /><Text style={styles.simBtnText}>Simulate: Specialist Clinic</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Review Modal */}
      {activeTemplate && !isUploading && !isSuccess && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <ShieldCheck color="#38A169" size={28} />
              <Text style={styles.modalTitle}>Data Request</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#2D3748' }}>{activeTemplate.name}</Text> is requesting the following information for your admission:
            </Text>

            <ScrollView style={styles.dataList}>
              {activeTemplate.requiredData.map((item, idx) => (
                <View key={idx} style={styles.dataItem}>
                  <Database color="#718096" size={16} />
                  <Text style={styles.dataItemText}>{item}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelTransfer}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmAndTransfer}>
                <Text style={styles.modalConfirmText}>Confirm & Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Uploading State */}
      {isUploading && (
        <View style={styles.modalOverlay}>
          <View style={styles.statusSheet}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Securely uploading data to hospital...</Text>
          </View>
        </View>
      )}

      {/* Success State */}
      {isSuccess && (
        <View style={styles.modalOverlay}>
          <View style={styles.statusSheet}>
            <CheckCircle2 color="#38A169" size={64} />
            <Text style={styles.statusTitle}>Transfer Complete</Text>
            <Text style={styles.statusSub}>Your data has been successfully received by the hospital.</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  permissionContent: { flex: 1, backgroundColor: '#EAF0EE', padding: 24, justifyContent: 'center', alignItems: 'center' },
  permissionTitle: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#2D3748', marginBottom: 12, textAlign: 'center' },
  permissionText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 32 },
  permissionBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  permissionBtnText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  cancelBtn: { padding: 16, width: '100%', alignItems: 'center' },
  cancelBtnText: { color: '#718096', fontFamily: 'Inter_500Medium', fontSize: 16 },
  
  scannerWrapper: { flex: 1 },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 60, paddingHorizontal: 24 },
  closeHeaderBtn: { position: 'absolute', top: 60, left: 24, zIndex: 10, padding: 8 },
  headerText: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  
  overlayMiddle: { flexDirection: 'row', height: 250 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanFrame: { width: 250, height: 250, backgroundColor: 'transparent' },
  
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderColor: '#FFFFFF', borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderColor: '#FFFFFF', borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderColor: '#FFFFFF', borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderColor: '#FFFFFF', borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  
  overlayBottom: { flex: 2, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  scanInstruction: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFFFFF', textAlign: 'center', opacity: 0.8 },
  
  simulationContainer: { marginTop: 40, width: '100%', alignItems: 'center', gap: 12 },
  simLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#A0AEC0', marginBottom: 4 },
  simBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 100, width: '90%', justifyContent: 'center', gap: 8 },
  simBtnText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#2D3748' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 100 },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, minHeight: 400 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#2D3748' },
  modalSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4A5568', marginBottom: 24, lineHeight: 20 },
  
  dataList: { backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, maxHeight: 200, marginBottom: 24 },
  dataItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  dataItemText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2D3748' },
  
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 16, backgroundColor: '#EDF2F7', borderRadius: 12, alignItems: 'center' },
  modalCancelText: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#4A5568' },
  modalConfirmBtn: { flex: 2, padding: 16, backgroundColor: '#007AFF', borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#FFFFFF' },

  statusSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 40, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#4A5568', marginTop: 24 },
  statusTitle: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#2D3748', marginTop: 24, marginBottom: 8 },
  statusSub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#718096', textAlign: 'center' },
});
