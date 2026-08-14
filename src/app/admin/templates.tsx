import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { FileJson, UploadCloud, CheckCircle2, ChevronLeft, Filter, GripVertical, PlayCircle, Edit2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { Href, useRouter } from 'expo-router';

type TemplatePreset = 'vsmmc' | 'chonghua' | 'consent' | 'cf1';
type DictionaryGroup = { title: string; fields: { id: string; label: string }[] };

const ADMISSION_GROUPS: DictionaryGroup[] = [
  {
    title: 'I. PATIENT INFORMATION',
    fields: [
      { id: 'alalay.lastName', label: 'Last Name' },
      { id: 'alalay.firstName', label: 'First Name' },
      { id: 'alalay.dob', label: 'Date of Birth' },
      { id: 'alalay.sex', label: 'Sex' },
      { id: 'alalay.bloodType', label: 'Blood Type' },
      { id: 'alalay.addressFull', label: 'Full Address' },
      { id: 'alalay.mobileNumber', label: 'Mobile No.' },
      { id: 'alalay.allergies', label: 'Allergies' },
    ]
  },
  {
    title: 'II. EMERGENCY CONTACT',
    fields: [
      { id: 'alalay.emergencyName', label: 'Contact Name' },
      { id: 'alalay.emergencyPhone', label: 'Contact Phone' },
    ]
  },
  {
    title: 'III. INSURANCE INFO',
    fields: [
      { id: 'alalay.philhealthPIN', label: 'PhilHealth PIN' },
      { id: 'alalay.primaryInsurance', label: 'Primary Insurance' },
    ]
  }
];

const CONSENT_GROUPS: DictionaryGroup[] = [
  {
    title: 'I. PATIENT AND VISIT',
    fields: [
      { id: 'consent.patientName', label: 'Patient Name' },
      { id: 'consent.approvedBy', label: 'Approved By' },
      { id: 'consent.hospitalDesk', label: 'Hospital Desk' },
      { id: 'consent.acknowledgedAt', label: 'Acknowledgment Timestamp' },
    ],
  },
];

const CF1_GROUPS: DictionaryGroup[] = [
  {
    title: 'I. MEMBER INFORMATION',
    fields: [
      { id: 'cf1.memberPin', label: 'Member PIN' },
      { id: 'cf1.memberName', label: 'Member Name' },
      { id: 'cf1.memberCategory', label: 'Member Category' },
      { id: 'cf1.memberAddress', label: 'Member Address' },
      { id: 'cf1.memberPhone', label: 'Member Contact Number' },
      { id: 'cf1.employerName', label: 'Employer Name' },
      { id: 'cf1.employerPen', label: 'Employer PEN' },
    ],
  },
  {
    title: 'II. PATIENT INFORMATION',
    fields: [
      { id: 'cf1.patientName', label: 'Patient Name' },
      { id: 'cf1.relationship', label: 'Relationship to Member' },
      { id: 'cf1.patientDob', label: 'Patient Date of Birth' },
      { id: 'cf1.patientSex', label: 'Patient Sex' },
      { id: 'cf1.patientPin', label: 'Patient PIN' },
    ],
  },
  {
    title: 'III. CONFINEMENT INFORMATION',
    fields: [
      { id: 'cf1.hospitalName', label: 'Health Care Institution' },
      { id: 'cf1.admissionType', label: 'Admission Type' },
      { id: 'cf1.admissionDate', label: 'Admission Date' },
      { id: 'cf1.dischargeDate', label: 'Discharge Date' },
    ],
  },
  {
    title: 'IV. CERTIFICATION',
    fields: [
      { id: 'cf1.authorizedRepresentative', label: 'Authorized Representative' },
      { id: 'cf1.signatureDate', label: 'Signature Date' },
    ],
  },
];

const TEMPLATE_GROUPS: Record<TemplatePreset, DictionaryGroup[]> = {
  vsmmc: ADMISSION_GROUPS,
  chonghua: ADMISSION_GROUPS,
  consent: CONSENT_GROUPS,
  cf1: CF1_GROUPS,
};

const TEMPLATE_LABELS: Record<TemplatePreset, string> = {
  vsmmc: 'ER / Walk-in Admission',
  chonghua: 'Specialist Registration',
  consent: 'Patient Consent',
  cf1: 'PhilHealth CF1',
};

const createFieldState = (groups: DictionaryGroup[]) => groups
  .flatMap((group) => group.fields)
  .reduce<Record<string, boolean>>((accumulator, field) => ({ ...accumulator, [field.id]: true }), {});

export default function AdminTemplatesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [viewMode, setViewMode] = useState<'dashboard' | 'studio'>('dashboard');
  const [activePreset, setActivePreset] = useState<TemplatePreset>('vsmmc');
  const [uploadTarget, setUploadTarget] = useState<TemplatePreset>('vsmmc');
  const [availableTemplates, setAvailableTemplates] = useState<('vsmmc' | 'chonghua')[]>(['vsmmc']);
  const [isUploading, setIsUploading] = useState(false);
  const [isStudioUploading, setIsStudioUploading] = useState(false);
  const [fieldsByTemplate, setFieldsByTemplate] = useState<Record<TemplatePreset, Record<string, boolean>>>(() => ({
    vsmmc: createFieldState(ADMISSION_GROUPS),
    chonghua: createFieldState(ADMISSION_GROUPS),
    consent: createFieldState(CONSENT_GROUPS),
    cf1: createFieldState(CF1_GROUPS),
  }));
  const activeFields = fieldsByTemplate[activePreset];
  const activeGroups = TEMPLATE_GROUPS[activePreset];

  const toggleField = (id: string) => {
    setFieldsByTemplate((current) => ({
      ...current,
      [activePreset]: { ...current[activePreset], [id]: !current[activePreset][id] },
    }));
  };

  const openStudio = (preset: TemplatePreset) => {
    setActivePreset(preset);
    setUploadTarget(preset);
    setViewMode('studio');
  };

  const executeUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (!availableTemplates.includes('chonghua')) {
        setAvailableTemplates(['vsmmc', 'chonghua']);
      }
    }, 2000);
  };

  const simulateStudioUpload = (preset: TemplatePreset) => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/*';
      input.onchange = () => {
        setIsStudioUploading(true);
        setTimeout(() => {
          setActivePreset(preset);
          setIsStudioUploading(false);
        }, 1500);
      };
      input.click();
    } else {
      setIsStudioUploading(true);
      setTimeout(() => {
        setActivePreset(preset);
        setIsStudioUploading(false);
      }, 1500);
    }
  };

  const triggerFilePicker = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/*';
      input.onchange = () => executeUpload();
      input.click();
    } else {
      executeUpload();
    }
  };

  const countActiveFields = (preset: TemplatePreset) => Object.values(fieldsByTemplate[preset]).filter(Boolean).length;
  const activeCount = countActiveFields(activePreset);
  const qrPayload = JSON.stringify({
    h: activePreset === 'vsmmc' ? 'Vicente Sotto ER' : activePreset === 'chonghua' ? 'Chong Hua' : 'Vicente Sotto Memorial Medical Center',
    t: activePreset,
    r: Object.entries(activeFields).filter(([k, v]) => v).map(([k]) => k)
  });

  if (viewMode === 'dashboard') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: isMobile ? 64 : 0 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admission Form Templates</Text>
            <Text style={styles.subtitle}>Centralized Management System & Parameter Configuration</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.searchBar}>
              <Text style={{color: '#A0AEC0', fontSize: 13}}>Search templates...</Text>
            </View>
          </View>
        </View>

        <View style={styles.dashboardTopRow}>
          {/* Main Upload Box */}
          <View style={styles.dashUploadBox}>
            {isUploading ? (
              <View style={styles.dashUploadInner}>
                <ActivityIndicator size="large" color="#3182CE" style={{ marginBottom: 16 }} />
                <Text style={styles.dashUploadTitle}>Processing Document...</Text>
                <Text style={styles.dashUploadDesc}>Extracting fields and mapping standard parameters.</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.dashUploadInner} onPress={triggerFilePicker}>
                <UploadCloud color="#3182CE" size={32} />
                <Text style={styles.dashUploadTitle}>Drop your PDF or Image here</Text>
                <Text style={styles.dashUploadDesc}>Upload your hospital's custom forms to configure data parameters.</Text>
                <View style={styles.dashUploadActions}>
                  <View style={styles.dashUploadBtn}><Text style={styles.dashUploadBtnText}>Select Files</Text></View>
                  <View style={styles.dashUploadBadge}><Text style={styles.dashUploadBadgeText}>Max 50MB</Text></View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Active Templates Section */}
        <View style={styles.activeTemplatesHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <Text style={styles.activeTemplatesTitle}>Active Templates</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{availableTemplates.length + 3} TOTAL</Text></View>
          </View>
          <View style={{flexDirection: 'row', gap: 8}}>
            <View style={styles.iconBtn}><Filter color="#718096" size={16} /></View>
            <View style={styles.iconBtn}><GripVertical color="#718096" size={16} /></View>
          </View>
        </View>

        <View style={styles.templatesGrid}>
          {/* VSMMC Card */}
          {availableTemplates.includes('vsmmc') && (
            <View style={styles.templateCard}>
              <View style={styles.templateCardThumbWrapper}>
                <View style={[styles.templateCardThumb, { backgroundColor: '#EBF8FF', alignItems: 'center', justifyContent: 'center' }]}>
                  <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#3182CE', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>V</Text>
                  </View>
                </View>
                <View style={styles.mappedBadge}><Text style={styles.mappedBadgeText}>{countActiveFields('vsmmc')} ACTIVE PARAMS</Text></View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardActionBtn}><PlayCircle color="#4A5568" size={16} /></TouchableOpacity>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => openStudio('vsmmc')}><Edit2 color="#4A5568" size={16} /></TouchableOpacity>
                </View>
              </View>
              <View style={styles.templateCardInfo}>
                <View>
                  <Text style={styles.templateCardTitle}>ER / Walk-in Admission</Text>
                  <Text style={styles.templateCardMeta}>VSMMC General Layout</Text>
                </View>
                <View style={styles.toggleActive}><View style={styles.toggleKnob}/></View>
              </View>
              <View style={styles.templateCardFooter}>
                <CheckCircle2 color="#38A169" size={12} />
                <Text style={styles.templateCardStatus}>Auto-populated from Check-In</Text>
              </View>
            </View>
          )}

          {/* Chong Hua Card */}
          {availableTemplates.includes('chonghua') && (
            <View style={styles.templateCard}>
              <View style={styles.templateCardThumbWrapper}>
                <View style={[styles.templateCardThumb, { backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center' }]}>
                  <View style={{width: 48, height: 48, backgroundColor: '#E53E3E', alignItems: 'center', justifyContent: 'center', transform: [{rotate: '45deg'}]}}>
                    <View style={{width: 48, height: 48, backgroundColor: '#E53E3E', transform: [{rotate: '45deg'}]}} />
                  </View>
                </View>
                <View style={styles.mappedBadge}><Text style={styles.mappedBadgeText}>{countActiveFields('chonghua')} ACTIVE PARAMS</Text></View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardActionBtn}><PlayCircle color="#4A5568" size={16} /></TouchableOpacity>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => openStudio('chonghua')}><Edit2 color="#4A5568" size={16} /></TouchableOpacity>
                </View>
              </View>
              <View style={styles.templateCardInfo}>
                <View>
                  <Text style={styles.templateCardTitle}>Specialist Registration</Text>
                  <Text style={styles.templateCardMeta}>Chong Hua Medical Arts</Text>
                </View>
                <View style={styles.toggleActive}><View style={styles.toggleKnob}/></View>
              </View>
              <View style={styles.templateCardFooter}>
                <CheckCircle2 color="#38A169" size={12} />
                <Text style={styles.templateCardStatus}>Direct App Sync Enabled</Text>
              </View>
            </View>
          )}

          {/* Transfer / Referral Checklist Card */}
          <View style={styles.templateCard}>
            <View style={styles.templateCardThumbWrapper}>
              <View style={[styles.templateCardThumb, { backgroundColor: '#E6FFFA', alignItems: 'center', justifyContent: 'center' }]}>
                <View style={{width: 48, height: 48, borderRadius: 8, backgroundColor: '#319795', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 24}}>R</Text>
                </View>
              </View>
              <View style={styles.mappedBadge}><Text style={styles.mappedBadgeText}>12 ACTIVE PARAMS</Text></View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cardActionBtn}><PlayCircle color="#4A5568" size={16} /></TouchableOpacity>
                <TouchableOpacity style={styles.cardActionBtn}><Edit2 color="#4A5568" size={16} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.templateCardInfo}>
              <View>
                <Text style={styles.templateCardTitle}>Transfer / Referral Checklist</Text>
                <Text style={styles.templateCardMeta}>Registrar Document Checklist</Text>
              </View>
              <View style={styles.toggleActive}><View style={styles.toggleKnob}/></View>
            </View>
            <View style={styles.templateCardFooter}>
              <CheckCircle2 color="#38A169" size={12} />
              <Text style={styles.templateCardStatus}>Prompted for Transfer Check-Ins</Text>
            </View>
          </View>

          {/* Patient Consent Card */}
          <View style={styles.templateCard}>
            <View style={styles.templateCardThumbWrapper}>
              <View style={[styles.templateCardThumb, { backgroundColor: '#FAF5FF', alignItems: 'center', justifyContent: 'center' }]}>
                <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#805AD5', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>C</Text>
                </View>
              </View>
              <View style={styles.mappedBadge}><Text style={styles.mappedBadgeText}>{countActiveFields('consent')} ACTIVE PARAMS</Text></View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() => router.push('/admin/triage?preview=consent' as Href)}
                  accessibilityRole="button"
                  accessibilityLabel="Preview populated Patient Consent"
                ><PlayCircle color="#4A5568" size={16} /></TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() => openStudio('consent')}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Patient Consent template"
                ><Edit2 color="#4A5568" size={16} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.templateCardInfo}>
              <View>
                <Text style={styles.templateCardTitle}>Patient Consent</Text>
                <Text style={styles.templateCardMeta}>Data Privacy Act</Text>
              </View>
              <View style={styles.toggleActive}><View style={styles.toggleKnob}/></View>
            </View>
            <View style={styles.templateCardFooter}>
              <CheckCircle2 color="#38A169" size={12} />
              <Text style={styles.templateCardStatus}>Requires e-Signature</Text>
            </View>
          </View>

          {/* PhilHealth CF1 Card */}
          <View style={styles.templateCard}>
            <View style={styles.templateCardThumbWrapper}>
              <View style={[styles.templateCardThumb, { backgroundColor: '#FFFFF0', alignItems: 'center', justifyContent: 'center' }]}>
                <View style={{width: 48, height: 48, borderRadius: 8, backgroundColor: '#D69E2E', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>P</Text>
                </View>
              </View>
              <View style={styles.mappedBadge}><Text style={styles.mappedBadgeText}>{countActiveFields('cf1')} ACTIVE PARAMS</Text></View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() => router.push('/admin/triage?preview=cf1' as Href)}
                  accessibilityRole="button"
                  accessibilityLabel="Preview populated PhilHealth CF1"
                ><PlayCircle color="#4A5568" size={16} /></TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={() => openStudio('cf1')}
                  accessibilityRole="button"
                  accessibilityLabel="Edit PhilHealth CF1 template"
                ><Edit2 color="#4A5568" size={16} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.templateCardInfo}>
              <View>
                <Text style={styles.templateCardTitle}>PhilHealth CF1</Text>
                <Text style={styles.templateCardMeta}>Claim Form 1</Text>
              </View>
              <View style={styles.toggleActive}><View style={styles.toggleKnob}/></View>
            </View>
            <View style={styles.templateCardFooter}>
              <CheckCircle2 color="#38A169" size={12} />
              <Text style={styles.templateCardStatus}>Direct App Sync Enabled</Text>
            </View>
          </View>

          {/* Upload Card */}
          <TouchableOpacity style={[styles.templateCard, { borderStyle: 'dashed', backgroundColor: '#F7FAFC', alignItems: 'center', justifyContent: 'center' }]} onPress={triggerFilePicker}>
            <UploadCloud color="#A0AEC0" size={32} style={{marginBottom: 16}} />
            <Text style={{fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#4A5568'}}>Upload Custom Form</Text>
            <Text style={{fontFamily: 'Inter_400Regular', fontSize: 12, color: '#A0AEC0', textAlign: 'center', marginTop: 8}}>Supports PDF & Images</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    );
  }

  // --- OLD TEMPLATE STUDIO VIEW (The Toggle Checkbox Version) ---
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: isMobile ? 64 : 0 }}
      scrollEnabled={isMobile}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setViewMode('dashboard')}
          accessibilityRole="button"
          accessibilityLabel="Back to templates"
        >
          <ChevronLeft color="#4A5568" size={24} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <FileJson color="#007AFF" size={32} />
        </View>
        <View>
          <Text style={styles.title}>Smart Template Studio</Text>
          <Text style={styles.subtitle}>Editing {TEMPLATE_LABELS[activePreset]} · toggle the fields included in this template.</Text>
        </View>
      </View>

      <View style={[styles.workspace, isMobile && { flexDirection: 'column' }]}>
        {/* Left Sidebar: Data Dictionary Toggles */}
        <View style={[styles.sidebar, isMobile && { width: '100%' }]}>
          <Text style={styles.sidebarTitle}>Alalay Data Dictionary</Text>
          <Text style={styles.sidebarSub}>Toggle fields to require them in the patient's payload.</Text>
          
            <ScrollView style={styles.dictionaryList} showsVerticalScrollIndicator={false}>
              {activeGroups.map((group, gIdx) => (
                <View key={gIdx} style={{marginBottom: 24}}>
                  <View style={styles.groupHeaderBadge}>
                    <Text style={styles.groupTitleText}>{group.title}</Text>
                  </View>
                  {group.fields.map((field) => (
                    <TouchableOpacity
                      key={field.id}
                      style={styles.toggleRow}
                      onPress={() => toggleField(field.id)}
                      activeOpacity={0.82}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: activeFields[field.id] ?? false }}
                      accessibilityLabel={`Include ${field.label}`}
                    >
                      <View style={{flex: 1}}>
                        <Text style={styles.toggleLabel}>{field.label}</Text>
                        <Text style={styles.toggleId}>{field.id.replace('alalay.', '')}</Text>
                      </View>
                      <Switch 
                        accessible={false}
                        style={{ pointerEvents: 'none' }}
                        value={activeFields[field.id] ?? false}
                        trackColor={{ false: "#E2E8F0", true: "#00A389" }}
                        thumbColor="#FFFFFF"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              
              <View style={styles.qrMiniArea}>
                <QRCode value={qrPayload} size={80} />
                <Text style={styles.qrMiniText}>Live Schema · {activeCount} fields</Text>
              </View>
            </ScrollView>
        </View>


        {/* Right Canvas: Dynamic Mock Form */}
        <View style={styles.studioRight}>
          <View style={[styles.studioHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
              <Text style={styles.studioHeaderTitle}>Upload Source Document:</Text>
              <TouchableOpacity 
                style={[styles.presetBtn, { backgroundColor: '#3182CE' }]}
                onPress={() => simulateStudioUpload(uploadTarget)}
              >
                <UploadCloud color="#FFFFFF" size={16} />
                <Text style={[styles.presetBtnText, { color: '#FFFFFF', fontWeight: 'bold' }]}>Upload PDF</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetToggle}>
              {([
                { id: 'vsmmc', label: 'ER' },
                { id: 'chonghua', label: 'Specialist' },
                { id: 'consent', label: 'Consent' },
                { id: 'cf1', label: 'CF1' },
              ] as { id: TemplatePreset; label: string }[]).map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetBtn, uploadTarget === preset.id && styles.presetBtnActive]}
                  onPress={() => {
                    setUploadTarget(preset.id);
                    setActivePreset(preset.id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activePreset === preset.id }}
                >
                  <Text style={[styles.presetBtnText, uploadTarget === preset.id && styles.presetBtnTextActive]}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.previewContainer, isMobile && { padding: 16 }]}>
            {isStudioUploading ? (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#3182CE" style={{marginBottom: 24, transform: [{scale: 1.5}]}} />
                <Text style={{fontFamily: 'Sora_700Bold', fontSize: 24, color: '#2D3748', textAlign: 'center'}}>Analyzing Document...</Text>
                <Text style={{fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096', marginTop: 12, textAlign: 'center'}}>AI is extracting layout and matching Smart Dictionary fields.</Text>
              </View>
            ) : activePreset === 'vsmmc' ? (
              /* VSMMC Dynamic Layout */
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMobile ? { width: '100%' } : {}}>
              <View style={styles.mockPdfVsmmc}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'center', gap: 16}}>
                  <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#3182CE', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>V</Text>
                  </View>
                  <Text style={styles.pdfTitle}>VICENTE SOTTO MEMORIAL MEDICAL CENTER - ER ADMISSION</Text>
                </View>
                
                {/* Name Row */}
                {(activeFields['alalay.lastName'] || activeFields['alalay.firstName']) && (
                  <View style={styles.pdfRow}>
                    {activeFields['alalay.lastName'] && (
                      <View style={[styles.pdfField, { flex: 2 }]}><Text style={styles.pdfLabel}>LAST NAME</Text><Text style={styles.pdfValue}>lastName</Text></View>
                    )}
                    {activeFields['alalay.firstName'] && (
                      <View style={[styles.pdfField, { flex: 2 }]}><Text style={styles.pdfLabel}>FIRST NAME</Text><Text style={styles.pdfValue}>firstName</Text></View>
                    )}
                  </View>
                )}

                {/* Address Row */}
                {activeFields['alalay.addressFull'] && (
                  <View style={styles.pdfRow}>
                    <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>PERMANENT ADDRESS</Text><Text style={styles.pdfValue}>addressFull</Text></View>
                  </View>
                )}

                {/* Meta Row */}
                {(activeFields['alalay.dob'] || activeFields['alalay.sex'] || activeFields['alalay.bloodType'] || activeFields['alalay.mobileNumber']) && (
                  <View style={styles.pdfRow}>
                    {activeFields['alalay.dob'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>DATE OF BIRTH</Text><Text style={styles.pdfValue}>dob</Text></View>}
                    {activeFields['alalay.sex'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>SEX</Text><Text style={styles.pdfValue}>sex</Text></View>}
                    {activeFields['alalay.bloodType'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>BLOOD TYPE</Text><Text style={styles.pdfValue}>bloodType</Text></View>}
                    {activeFields['alalay.mobileNumber'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>MOBILE NO.</Text><Text style={styles.pdfValue}>mobileNumber</Text></View>}
                  </View>
                )}

                {/* Medical Row */}
                {(activeFields['alalay.philhealthPIN'] || activeFields['alalay.allergies']) && (
                  <View style={styles.pdfRow}>
                    {activeFields['alalay.philhealthPIN'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>PHILHEALTH PIN</Text><Text style={styles.pdfValue}>philhealthPIN</Text></View>}
                    {activeFields['alalay.allergies'] && <View style={[styles.pdfField, { flex: 2 }]}><Text style={styles.pdfLabel}>KNOWN ALLERGIES</Text><Text style={styles.pdfValue}>allergies</Text></View>}
                  </View>
                )}

                {/* Emergency Row */}
                {(activeFields['alalay.emergencyName'] || activeFields['alalay.emergencyPhone']) && (
                  <View style={styles.pdfRow}>
                    {activeFields['alalay.emergencyName'] && <View style={[styles.pdfField, { flex: 2 }]}><Text style={styles.pdfLabel}>EMERGENCY CONTACT NAME</Text><Text style={styles.pdfValue}>emergencyName</Text></View>}
                    {activeFields['alalay.emergencyPhone'] && <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>CONTACT PHONE</Text><Text style={styles.pdfValue}>emergencyPhone</Text></View>}
                  </View>
                )}

                {/* Extra Insurance Row */}
                {activeFields['alalay.primaryInsurance'] && (
                  <View style={[styles.pdfRow, { borderBottomWidth: 0 }]}>
                    <View style={[styles.pdfField, { flex: 1 }]}><Text style={styles.pdfLabel}>PRIMARY INSURANCE PROVIDER</Text><Text style={styles.pdfValue}>primaryInsurance</Text></View>
                  </View>
                )}
              </View>
              </ScrollView>
            ) : activePreset === 'chonghua' ? (
              /* Chong Hua Dynamic Layout */
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMobile ? { width: '100%' } : {}}>
              <View style={styles.mockPdfChonghua}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 32, justifyContent: 'center', gap: 16}}>
                  <View style={{width: 32, height: 32, backgroundColor: '#E53E3E', transform: [{rotate: '45deg'}]}}>
                    <View style={{width: 32, height: 32, backgroundColor: '#E53E3E', transform: [{rotate: '45deg'}]}} />
                  </View>
                  <View>
                    <Text style={styles.chTitle}>CHONG HUA SPECIALIST CLINIC</Text>
                    <Text style={styles.chSubtitle}>Patient Registration & Intake</Text>
                  </View>
                </View>
                
                <View style={styles.chForm}>
                  {(activeFields['alalay.lastName'] || activeFields['alalay.firstName']) && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Patient Name:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>{activeFields['alalay.firstName'] ? 'firstName ' : ''}{activeFields['alalay.lastName'] ? 'lastName' : ''}</Text></View>
                    </View>
                  )}

                  {(activeFields['alalay.dob'] || activeFields['alalay.sex'] || activeFields['alalay.bloodType']) && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>DOB / Sex:</Text>
                      <View style={[styles.chLine, { flex: 0.5 }]}><Text style={styles.pdfValue}>{activeFields['alalay.dob'] ? 'dob' : ''} {activeFields['alalay.sex'] ? '/ sex' : ''}</Text></View>
                      {activeFields['alalay.bloodType'] && (
                        <>
                          <Text style={[styles.chLabel, { marginLeft: 16, width: 80 }]}>Blood Type:</Text>
                          <View style={[styles.chLine, { flex: 0.5 }]}><Text style={styles.pdfValue}>bloodType</Text></View>
                        </>
                      )}
                    </View>
                  )}

                  {activeFields['alalay.addressFull'] && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Home Address:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>addressFull</Text></View>
                    </View>
                  )}

                  {activeFields['alalay.mobileNumber'] && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Mobile No:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>mobileNumber</Text></View>
                    </View>
                  )}

                  {activeFields['alalay.philhealthPIN'] && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>PhilHealth No:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>philhealthPIN</Text></View>
                    </View>
                  )}

                  {activeFields['alalay.primaryInsurance'] && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Insurance Prov:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>primaryInsurance</Text></View>
                    </View>
                  )}

                  {activeFields['alalay.allergies'] && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Allergies:</Text>
                      <View style={styles.chLine}><Text style={styles.pdfValue}>allergies</Text></View>
                    </View>
                  )}

                  {(activeFields['alalay.emergencyName'] || activeFields['alalay.emergencyPhone']) && (
                    <View style={styles.chRow}>
                      <Text style={styles.chLabel}>Emerg. Contact:</Text>
                      <View style={[styles.chLine, { flex: 0.6 }]}><Text style={styles.pdfValue}>{activeFields['alalay.emergencyName'] ? 'emergencyName' : ''}</Text></View>
                      {activeFields['alalay.emergencyPhone'] && (
                        <>
                          <Text style={[styles.chLabel, { marginLeft: 16, width: 50 }]}>Tel:</Text>
                          <View style={[styles.chLine, { flex: 0.4 }]}><Text style={styles.pdfValue}>emergencyPhone</Text></View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
              </ScrollView>
            ) : activePreset === 'consent' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMobile ? { width: '100%' } : {}}>
                <View style={styles.mockPdfConsent}>
                  <View style={styles.consentStudioHeader}>
                    <View style={styles.consentStudioMark}><Text style={styles.consentStudioMarkText}>A</Text></View>
                    <View>
                      <Text style={styles.consentStudioBrand}>ALALAY</Text>
                      <Text style={styles.consentStudioMeta}>VISIT INFORMATION SHARING ACKNOWLEDGMENT</Text>
                    </View>
                  </View>
                  <Text style={styles.studioDocumentTitle}>Patient-authorized sharing record</Text>
                  <Text style={styles.studioDocumentIntro}>Editable fields are highlighted in blue and populated from the patient-authorized visit snapshot.</Text>

                  <Text style={styles.studioSectionBar}>SHARING DETAILS</Text>
                  {CONSENT_GROUPS[0].fields.filter((field) => activeFields[field.id]).map((field) => (
                    <View key={field.id} style={styles.consentStudioRow}>
                      <Text style={styles.consentStudioLabel}>{field.label}</Text>
                      <Text style={styles.consentStudioValue}>{field.id.replace('consent.', '')}</Text>
                    </View>
                  ))}

                  <View style={styles.consentStudioStatement}>
                    <CheckCircle2 color="#137A67" size={18} />
                    <Text style={styles.consentStudioStatementText}>Patient-authorized sharing statement and disclosure list remain required legal copy.</Text>
                  </View>
                  <View style={styles.studioSignatureRow}>
                    <View style={styles.studioSignatureBlock}><View style={styles.studioSignatureLine} /><Text style={styles.studioSignatureLabel}>Digitally acknowledged by</Text></View>
                    <View style={styles.studioSignatureBlock}><View style={styles.studioSignatureLine} /><Text style={styles.studioSignatureLabel}>Date</Text></View>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMobile ? { width: '100%' } : {}}>
                <View style={styles.mockPdfCf1}>
                  <View style={styles.cf1StudioHeader}>
                    <View>
                      <Text style={styles.cf1Republic}>Republic of the Philippines</Text>
                      <Text style={styles.cf1Agency}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
                      <Text style={styles.cf1FormName}>CF1 · MEMBER AND PATIENT INFORMATION</Text>
                    </View>
                    <View style={styles.cf1Badge}><Text style={styles.cf1BadgeText}>CF1</Text></View>
                  </View>
                  <View style={styles.cf1Notice}><Text style={styles.cf1NoticeText}>CONFIGURABLE REFERENCE PREVIEW · OFFICIAL FORM STILL REQUIRES VERIFICATION</Text></View>

                  {CF1_GROUPS.map((group) => {
                    const enabledFields = group.fields.filter((field) => activeFields[field.id]);
                    if (enabledFields.length === 0) return null;
                    return (
                      <View key={group.title} style={styles.cf1StudioSection}>
                        <Text style={styles.studioSectionBar}>{group.title}</Text>
                        <View style={styles.cf1StudioGrid}>
                          {enabledFields.map((field) => (
                            <View key={field.id} style={styles.cf1StudioField}>
                              <Text style={styles.cf1StudioLabel}>{field.label}</Text>
                              <Text style={styles.cf1StudioValue}>{field.id.replace('cf1.', '')}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC', padding: 24 },
  
  /* Dashboard Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#1A202C', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#718096' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  searchBar: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, width: 250 },
  primaryBtn: { backgroundColor: '#3182CE', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryBtnText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  backBtn: { padding: 8, backgroundColor: '#EDF2F7', borderRadius: 8, marginRight: 12 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },

  /* Dashboard Top Row */
  dashboardTopRow: { flexDirection: 'row', gap: 24, marginBottom: 40 },
  dashUploadBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', padding: 40 },
  dashUploadInner: { alignItems: 'center', justifyContent: 'center' },
  dashUploadTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: '#2D3748', marginTop: 16, marginBottom: 8 },
  dashUploadDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  dashUploadActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dashUploadBtn: { backgroundColor: '#EDF2F7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  dashUploadBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#4A5568' },
  dashUploadBadge: { backgroundColor: '#EBF8FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  dashUploadBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#3182CE' },

  /* Active Templates Grid */
  activeTemplatesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  activeTemplatesTitle: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#1A202C' },
  countBadge: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { fontFamily: 'Sora_600SemiBold', fontSize: 10, color: '#4A5568' },
  iconBtn: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },

  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  templateCard: { backgroundColor: '#FFFFFF', width: 340, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  templateCardThumbWrapper: { height: 160, backgroundColor: '#EDF2F7', position: 'relative' },
  templateCardThumb: { width: '100%', height: '100%', opacity: 0.5 },
  mappedBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  mappedBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#4A5568' },
  cardActions: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 },
  cardActionBtn: { backgroundColor: '#FFFFFF', padding: 6, borderRadius: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  
  templateCardInfo: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  templateCardTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#2D3748', marginBottom: 4 },
  templateCardMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#718096' },
  toggleActive: { width: 40, height: 24, backgroundColor: '#38A169', borderRadius: 12, padding: 2, alignItems: 'flex-end', justifyContent: 'center' },
  toggleKnob: { width: 20, height: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
  
  templateCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  templateCardStatus: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#4A5568' },

  /* Studio Layout */
  workspace: { flex: 1, flexDirection: 'row', gap: 24 },
  sidebar: { width: 350, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 },
  sidebarTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: '#1A365D', marginBottom: 4 },
  sidebarSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#718096' },
  dictionaryList: { flex: 1 },
  groupHeaderBadge: { backgroundColor: '#1A202C', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 },
  groupTitleText: { fontFamily: 'Sora_700Bold', fontSize: 11, color: '#FFFFFF', letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  toggleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2D3748', marginBottom: 2 },
  toggleId: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#718096' },

  qrMiniArea: { alignItems: 'center', marginTop: 24, padding: 16, backgroundColor: '#F7FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  qrMiniText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4A5568', marginTop: 8 },

  studioRight: { flex: 1 },
  studioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingBottom: 16 },
  studioHeaderTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#4A5568' },
  presetToggle: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 8, padding: 4, gap: 4 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  presetBtnActive: { backgroundColor: '#3182CE', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  presetBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096' },
  presetBtnTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  previewContainer: { flex: 1, backgroundColor: '#F0F4F8', borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 24 },

  /* VSMMC PDF Mock */
  mockPdfVsmmc: { width: 600, backgroundColor: '#FFFFFF', padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  pdfTitle: { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 16, textAlign: 'center', textDecorationLine: 'underline' },
  pdfRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#A0AEC0', minHeight: 60 },
  pdfField: { borderRightWidth: 1, borderRightColor: '#A0AEC0', padding: 8, justifyContent: 'flex-start' },
  pdfLabel: { fontFamily: 'Arial', fontSize: 9, color: '#718096', marginBottom: 8 },
  pdfValue: { fontFamily: 'Courier New', fontWeight: 'bold', fontSize: 14, color: '#2B6CB0' },
  
  /* Chong Hua PDF Mock */
  mockPdfChonghua: { width: 600, backgroundColor: '#FFFFFF', padding: 32, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  chTitle: { fontFamily: 'Georgia', fontWeight: 'bold', fontSize: 22, color: '#1A365D', textAlign: 'center' },
  chSubtitle: { fontFamily: 'Georgia', fontSize: 14, color: '#4A5568', textAlign: 'center' },
  chForm: { gap: 24 },
  chRow: { flexDirection: 'row', alignItems: 'flex-end' },
  chLabel: { fontFamily: 'Arial', fontSize: 14, color: '#2D3748', width: 120 },
  chLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E0', marginLeft: 8, paddingBottom: 4 },

  /* Patient Consent Studio Mock */
  mockPdfConsent: { width: 650, minHeight: 720, backgroundColor: '#FFFFFF', padding: 38, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  consentStudioHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderBottomColor: '#CBD5E0', paddingBottom: 16, marginBottom: 24 },
  consentStudioMark: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#137A67' },
  consentStudioMarkText: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#FFFFFF' },
  consentStudioBrand: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#173B4A' },
  consentStudioMeta: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.7, color: '#718096', marginTop: 3 },
  studioDocumentTitle: { fontFamily: 'Sora_700Bold', fontSize: 23, color: '#173B4A' },
  studioDocumentIntro: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#718096', marginTop: 7, marginBottom: 20 },
  studioSectionBar: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7, color: '#FFFFFF', backgroundColor: '#334E68', paddingHorizontal: 10, paddingVertical: 7, marginBottom: 8 },
  consentStudioRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 11 },
  consentStudioLabel: { width: 180, fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#4A5568' },
  consentStudioValue: { flex: 1, fontFamily: 'Courier New', fontWeight: 'bold', fontSize: 12, color: '#2B6CB0' },
  consentStudioStatement: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#E6F5F1', borderRadius: 10, padding: 14, marginTop: 20 },
  consentStudioStatementText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 16, color: '#173B4A' },
  studioSignatureRow: { flexDirection: 'row', gap: 28, marginTop: 58 },
  studioSignatureBlock: { flex: 1, alignItems: 'center' },
  studioSignatureLine: { width: '100%', height: 1, backgroundColor: '#4A5568' },
  studioSignatureLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#718096', marginTop: 6 },

  /* CF1 Studio Mock */
  mockPdfCf1: { width: 700, minHeight: 820, backgroundColor: '#FFFFFF', padding: 38, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cf1StudioHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  cf1Republic: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#4A5568' },
  cf1Agency: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#1A202C', marginTop: 3 },
  cf1FormName: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.7, color: '#4A5568', marginTop: 4 },
  cf1Badge: { width: 50, height: 50, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D69E2E' },
  cf1BadgeText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#FFFFFF' },
  cf1Notice: { backgroundColor: '#EBF4FF', borderWidth: 1, borderColor: '#BFD4F3', borderRadius: 7, padding: 9, marginBottom: 18 },
  cf1NoticeText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.6, color: '#246BCE', textAlign: 'center' },
  cf1StudioSection: { marginBottom: 14 },
  cf1StudioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cf1StudioField: { flexGrow: 1, flexBasis: '47%', minHeight: 55, borderWidth: 1, borderColor: '#CBD5E0', padding: 9 },
  cf1StudioLabel: { fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 0.45, color: '#718096', textTransform: 'uppercase' },
  cf1StudioValue: { fontFamily: 'Courier New', fontWeight: 'bold', fontSize: 11, color: '#2B6CB0', marginTop: 7 },
});
