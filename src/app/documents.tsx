import * as ImagePicker from 'expo-image-picker';
import { Href, useRouter } from 'expo-router';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileCheck2,
  FilePlus2,
  FileText,
  ShieldCheck,
  Upload,
} from 'lucide-react-native';
import { ReactNode, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  DocumentVerificationStatus,
  PatientDocumentState,
  useStore,
} from '../store/useStore';

const COLORS = {
  background: '#F4F7F6', surface: '#FFFFFF', ink: '#18312B', muted: '#667B75',
  line: '#DCE7E3', primary: '#137A67', primarySoft: '#E6F5F1', navy: '#173B4A',
  amber: '#A15C00', amberSoft: '#FFF3DD', blue: '#246BCE', blueSoft: '#EAF2FF',
};

type DocumentCard = {
  id: string;
  title: string;
  description: string;
  status: DocumentVerificationStatus;
  icon: ReactNode;
  route?: Href;
};

const statusCopy: Record<DocumentVerificationStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  self_declared: 'Self-declared',
};

export default function DocumentsScreen() {
  const router = useRouter();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const activePatientId = useStore((state) => state.activePatientId);
  const visitLog = useStore((state) => state.visitLog);
  const storedDocuments = useStore((state) => state.documents);
  const addDocument = useStore((state) => state.addDocument);
  const [uploadError, setUploadError] = useState('');

  const beneficiary = beneficiaries.find((item) => item.id === activePatientId);
  const patientName = beneficiary
    ? `${beneficiary.firstName} ${beneficiary.lastName}`.trim()
    : `${masterProfile.firstName || 'Elena'} ${masterProfile.lastName || 'Cruz'}`;
  const patientDocuments = storedDocuments.filter((item) => item.patientId === activePatientId);

  const cards = useMemo<DocumentCard[]>(() => {
    const philhealthPin = beneficiary?.pin || (!beneficiary ? masterProfile.philhealthId : '');
    const identityVerified = beneficiary
      ? beneficiary.verificationStatus === 'verified'
      : masterProfile.identitySource === 'egov';
    const prescription = beneficiary?.prescriptionPhotoUrl;
    const generatedForPatient = visitLog.patientId === activePatientId
      ? visitLog.generatedDocuments
      : [];

    const builtIn: DocumentCard[] = [
      {
        id: 'philhealth-reference',
        title: 'PhilHealth reference sheet',
        description: philhealthPin
          ? `PIN ending in ${philhealthPin.replace(/\D/g, '').slice(-4)} · Alalay reference only`
          : 'Add a PhilHealth PIN to prepare this reference.',
        status: identityVerified ? 'verified' : philhealthPin ? 'self_declared' : 'pending',
        icon: <ShieldCheck color={COLORS.primary} size={22} />,
        route: '/reference',
      },
    ];

    if (prescription) {
      builtIn.push({
        id: 'prescription',
        title: 'Prescription / medicine list',
        description: prescription === 'seeded-demo-prescription'
          ? 'Prepared sample for the pitch flow'
          : 'Photo supplied by the patient',
        status: 'self_declared',
        icon: <FileCheck2 color={COLORS.blue} size={22} />,
      });
    }

    generatedForPatient.forEach((title, index) => builtIn.push({
      id: `generated-${index}`,
      title,
      description: `Generated ${visitLog.documentsGeneratedAt ? new Date(visitLog.documentsGeneratedAt).toLocaleDateString() : 'for this visit'}`,
      status: 'self_declared',
      icon: <FileText color={COLORS.primary} size={22} />,
      route: '/reference',
    }));

    return [
      ...builtIn,
      ...patientDocuments.map((document) => ({
        id: document.id,
        title: document.title,
        description: `${document.source} · Added ${new Date(document.addedAt).toLocaleDateString()}`,
        status: document.status,
        icon: <FileCheck2 color={COLORS.blue} size={22} />,
      })),
    ];
  }, [activePatientId, beneficiary, masterProfile, patientDocuments, visitLog]);

  const saveDocument = (document: PatientDocumentState) => {
    addDocument(document);
    setUploadError('');
  };

  const uploadMedicalAbstract = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      saveDocument({
        id: `medical-abstract-${activePatientId}`,
        patientId: activePatientId,
        type: 'medical_abstract',
        title: 'Medical abstract',
        status: 'pending',
        source: 'Uploaded photo · awaiting review',
        uri: result.assets[0].uri,
        addedAt: new Date().toISOString(),
      });
    } catch {
      setUploadError('The photo picker is unavailable in this preview. You can use the prepared sample instead.');
    }
  };

  const captureMedicalAbstract = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setUploadError('Camera access is needed to photograph a medical abstract. You can still choose an existing photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      saveDocument({
        id: `medical-abstract-${activePatientId}`,
        patientId: activePatientId,
        type: 'medical_abstract',
        title: 'Medical abstract',
        status: 'pending',
        source: 'Camera photo · awaiting review',
        uri: result.assets[0].uri,
        addedAt: new Date().toISOString(),
      });
    } catch {
      setUploadError('The camera is unavailable in this preview. Choose an existing photo or use the prepared sample.');
    }
  };

  const addSampleAbstract = () => saveDocument({
    id: `medical-abstract-${activePatientId}`,
    patientId: activePatientId,
    type: 'medical_abstract',
    title: 'Medical abstract',
    status: 'self_declared',
    source: 'Prepared sample document',
    uri: 'seeded-demo-medical-abstract',
    addedAt: new Date().toISOString(),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft color={COLORS.navy} size={23} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.patientCard}>
          <View style={styles.patientIcon}><FileText color="#FFFFFF" size={23} /></View>
          <View style={styles.patientCopy}>
            <Text style={styles.eyebrow}>DOCUMENTS FOR</Text>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>{beneficiary ? beneficiary.relationship : 'My profile'} · Selected patient</Text>
          </View>
        </View>

        <View style={styles.infoNote}>
          <ShieldCheck color={COLORS.primary} size={18} />
          <Text style={styles.infoText}>Statuses show where information came from. Hospital staff still verify official documents during admission.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Patient documents</Text>
            <Text style={styles.sectionText}>{cards.length} {cards.length === 1 ? 'item' : 'items'} linked to {patientName}</Text>
          </View>
        </View>

        <View style={styles.list}>
          {cards.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={styles.documentCard}
              onPress={document.route ? () => router.push(document.route!) : undefined}
              disabled={!document.route}
              accessibilityRole={document.route ? 'button' : undefined}
            >
              <View style={styles.documentIcon}>{document.icon}</View>
              <View style={styles.documentCopy}>
                <View style={styles.documentTitleRow}>
                  <Text style={styles.documentTitle}>{document.title}</Text>
                  <View style={[styles.status, styles[`status_${document.status}`]]}>
                    <Text style={[styles.statusText, styles[`statusText_${document.status}`]]}>{statusCopy[document.status]}</Text>
                  </View>
                </View>
                <Text style={styles.documentDescription}>{document.description}</Text>
              </View>
              {document.route ? <ArrowRight color={COLORS.muted} size={18} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.uploadCard}>
          <View style={styles.uploadIcon}><FilePlus2 color={COLORS.primary} size={25} /></View>
          <Text style={styles.uploadTitle}>Add a medical abstract</Text>
          <Text style={styles.uploadText}>Take a clear photo, choose one from the device, or use the prepared sample during the pitch.</Text>
          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={captureMedicalAbstract} accessibilityRole="button">
            <Camera color="#FFFFFF" size={18} />
            <Text style={styles.primaryButtonText}>Take a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={uploadMedicalAbstract} accessibilityRole="button">
            <Upload color="#FFFFFF" size={18} />
            <Text style={styles.secondaryButtonText}>Choose from device</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sampleButton} onPress={addSampleAbstract} accessibilityRole="button">
            <CheckCircle2 color={COLORS.primary} size={17} />
            <Text style={styles.sampleButtonText}>Use prepared sample</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.switchLink} onPress={() => router.push('/dashboard' as Href)}>
          <Text style={styles.switchLinkText}>Switch the selected patient from Home</Text>
          <ArrowRight color={COLORS.primary} size={17} />
        </TouchableOpacity>
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
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, paddingBottom: 40 },
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: COLORS.navy, borderRadius: 22, padding: 17 },
  patientIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5667' },
  patientCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.25, color: '#9FD8CD' },
  patientName: { fontFamily: 'Sora_700Bold', fontSize: 19, color: '#FFFFFF', marginTop: 3 },
  patientMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#C8D9DE', marginTop: 3 },
  infoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 16, padding: 13, marginTop: 13 },
  infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.ink },
  sectionHeader: { marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: COLORS.ink },
  sectionText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: 3 },
  list: { gap: 9 },
  documentCard: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 13 },
  documentIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F6F4' },
  documentCopy: { flex: 1 },
  documentTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  documentTitle: { flexShrink: 1, fontFamily: 'Sora_600SemiBold', fontSize: 12, color: COLORS.ink },
  documentDescription: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted, marginTop: 4 },
  status: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 },
  status_verified: { backgroundColor: COLORS.primarySoft },
  status_pending: { backgroundColor: COLORS.amberSoft },
  status_self_declared: { backgroundColor: COLORS.blueSoft },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 8 },
  statusText_verified: { color: COLORS.primary },
  statusText_pending: { color: COLORS.amber },
  statusText_self_declared: { color: COLORS.blue },
  uploadCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 20, marginTop: 22 },
  uploadIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  uploadTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: COLORS.ink, marginTop: 12 },
  uploadText: { maxWidth: 400, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, textAlign: 'center', color: COLORS.muted, marginTop: 5 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 14, textAlign: 'center', color: '#A83232', marginTop: 8 },
  primaryButton: { width: '100%', minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 15 },
  primaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  secondaryButton: { width: '100%', minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blue, borderRadius: 15, marginTop: 8 },
  secondaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  sampleButton: { width: '100%', minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#B9DED5', borderRadius: 15, marginTop: 8 },
  sampleButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: COLORS.primary },
  switchLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 18 },
  switchLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary },
});
