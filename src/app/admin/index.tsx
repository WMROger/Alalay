import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Building2, FileCheck, CheckCircle2, QrCode, Lock, ShieldCheck } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../../store/useStore';

export default function AdminIdentityScreen() {
  const hospitalSession = useStore((state) => state.hospitalSession);
  const [isSaved, setIsSaved] = useState(false);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  
  // Provisioned locked attributes from Alalay Super Admin
  const lockedAttributes = {
    hospitalName: hospitalSession.hospitalName,
    philHealthNumber: hospitalSession.philhealthAccreditation,
    dohLicense: hospitalSession.dohFacilityId,
  };

  const [form, setForm] = useState({
    adminEmail: hospitalSession.email,
    adminPhone: '032-253-9891',
    departmentName: 'Main Admission Desk'
  });

  const handleSave = () => {
    setIsSaved(true);
    setFacilityId(hospitalSession.facilityId || 'FACILITY-PENDING-ADM-01');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const printDeskSign = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Building2 color="#007AFF" size={32} />
        </View>
        <View>
          <Text style={styles.title}>Institutional Identity</Text>
          <Text style={styles.subtitle}>Manage your hospital's verified presence on the Alalay platform.</Text>
        </View>
      </View>

      <View style={[styles.statusCard, hospitalSession.verificationStatus === 'pending_review' && styles.statusCardPending]}>
        <ShieldCheck color={hospitalSession.verificationStatus === 'verified' ? '#137A67' : '#975A16'} size={21} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, hospitalSession.verificationStatus === 'pending_review' && styles.statusTitlePending]}>
            {hospitalSession.verificationStatus === 'verified' ? 'Facility identity verified' : 'Facility review pending'}
          </Text>
          <Text style={styles.statusText}>
            {hospitalSession.verificationStatus === 'verified'
              ? 'The facility credentials below are locked to the verified hospital account.'
              : 'You can prepare settings, but production QR activation and patient data access remain unavailable until credential review is complete.'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>System Attributes (Locked)</Text>
          <Text style={styles.helpText}>These credentials were provisioned by Alalay Super Admin. Contact support for modifications.</Text>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Official Legal Entity Name</Text>
              <Lock color="#A0AEC0" size={14} />
            </View>
            <TextInput 
              style={[styles.input, styles.inputLocked]} 
              value={lockedAttributes.hospitalName}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>PhilHealth Accreditation Number</Text>
              <Lock color="#A0AEC0" size={14} />
            </View>
            <TextInput 
              style={[styles.input, styles.inputLocked]} 
              value={lockedAttributes.philHealthNumber}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>DOH Facility ID / LTO</Text>
              <Lock color="#A0AEC0" size={14} />
            </View>
            <TextInput 
              style={[styles.input, styles.inputLocked]} 
              value={lockedAttributes.dohLicense}
              editable={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Self-Service Settings</Text>
          <Text style={styles.helpText}>Manage your specific department and internal routing details.</Text>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department / Station Name</Text>
            <TextInput 
              style={styles.input} 
              value={form.departmentName}
              onChangeText={(t) => setForm({...form, departmentName: t})}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Point of Contact Email</Text>
            <TextInput 
              style={styles.input} 
              value={form.adminEmail}
              onChangeText={(t) => setForm({...form, adminEmail: t})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput 
              style={styles.input} 
              value={form.adminPhone}
              onChangeText={(t) => setForm({...form, adminPhone: t})}
            />
          </View>
        </View>
      </View>

      {/* The Golden QR Code Area */}
      {facilityId && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Station QR Code Deployment</Text>
            <Text style={styles.helpText}>Print this physical QR code and place it at the admission desk. Patients scan it to start a secure check-in.</Text>
          </View>
          
          <View style={styles.goldenQrArea}>
            <View style={styles.qrWrapper}>
              <QRCode value={facilityId} size={180} color="#2D3748" />
              <Text style={styles.qrLabel}>Facility ID: {facilityId}</Text>
            </View>
            <View style={styles.qrActionArea}>
              <Text style={styles.qrActionTitle}>Admission desk QR ready</Text>
              <Text style={styles.qrActionDesc}>Display or print this static desk code on the hospital laptop. The patient scans it to identify this admission desk before reviewing what will be shared.</Text>
              <TouchableOpacity style={styles.downloadBtn} onPress={printDeskSign} accessibilityRole="button">
                <QrCode color="#FFFFFF" size={16} />
                <Text style={styles.downloadBtnText}>Print desk sign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          {isSaved ? (
            <>
              <CheckCircle2 color="#FFFFFF" size={20} />
              <Text style={styles.saveBtnText}>Saved Successfully</Text>
            </>
          ) : (
            <>
              <FileCheck color="#FFFFFF" size={20} />
              <Text style={styles.saveBtnText}>Save Configuration</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#2D3748',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#718096',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    marginBottom: 24,
  },
  statusCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: '#E6F5F1', borderWidth: 1, borderColor: '#B9DED5', borderRadius: 14, padding: 15, marginBottom: 22 },
  statusCardPending: { backgroundColor: '#FFFAF0', borderColor: '#FEEBC8' },
  statusTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#137A67' },
  statusTitlePending: { color: '#975A16' },
  statusText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#718096', marginTop: 3 },
  cardHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: '#2D3748',
  },
  formRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  inputGroup: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#4A5568',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  inputLocked: {
    backgroundColor: '#EDF2F7',
    color: '#718096',
    borderColor: '#E2E8F0',
  },
  helpText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginBottom: 60,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  saveBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  goldenQrArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    backgroundColor: '#F7FAFC',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrWrapper: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  qrLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#4A5568',
    marginTop: 16,
  },
  qrActionArea: {
    flex: 1,
  },
  qrActionTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: '#2D3748',
    marginBottom: 8,
  },
  qrActionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#718096',
    lineHeight: 22,
    marginBottom: 24,
  },
  downloadBtn: {
    backgroundColor: '#3182CE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  downloadBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  }
});
