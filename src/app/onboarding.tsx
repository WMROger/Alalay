import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { ChevronLeft, UploadCloud, CheckCircle2 } from 'lucide-react-native';

const PRIMARY_BLUE = '#007AFF';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateMasterProfile, addBeneficiary, setHasOnboarded } = useStore();
  
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [hasMDR, setHasMDR] = useState<boolean | null>(null);
  const [mdrImageUri, setMdrImageUri] = useState<string | null>(null);

  // Form Fields
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [complaint, setComplaint] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Bereavement (Optional)
  const [isBereavement, setIsBereavement] = useState<boolean | null>(null);
  const [decLastName, setDecLastName] = useState('');
  const [decFirstName, setDecFirstName] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [deathCertReceived, setDeathCertReceived] = useState<boolean | null>(null);

  // Beneficiaries (Local State)
  const [onboardingBeneficiaries, setOnboardingBeneficiaries] = useState<{firstName: string, lastName: string, relationship: string}[]>([]);
  const [isAddingBen, setIsAddingBen] = useState(false);
  const [benFirstName, setBenFirstName] = useState('');
  const [benLastName, setBenLastName] = useState('');
  const [benRel, setBenRel] = useState('');
  const [benPin, setBenPin] = useState('');
  const [benSpecialId, setBenSpecialId] = useState('');

  const handleMDRUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMdrImageUri(result.assets[0].uri);
      // MOCK OCR PRE-FILL
      setTimeout(() => {
        setPin('1234-5678-9012');
        setFullName('Maria Lourdes Dela Cruz');
        setDob('07/16/1988');
        setSex('Female');
        setAddress('Unit 12B, Alabang Hills, Muntinlupa City, Metro Manila');
        nextStep();
      }, 1000);
    }
  };

  const handleNoMDR = () => {
    setHasMDR(false);
    nextStep();
  };

  const handleFinish = () => {
    const names = fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.length > 1 ? names[names.length - 1] : '';

    updateMasterProfile({
      firstName,
      lastName,
      dateOfBirth: dob,
      sex,
      address: { street: address, city: '', region: '' },
      contactNumber: emergencyPhone, // Mock logic mapping phone to contact
      philhealthId: pin,
      bloodType,
      knownAllergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
      chronicConditions: []
    });

    onboardingBeneficiaries.forEach(b => {
      addBeneficiary({ id: Math.random().toString(), ...b });
    });

    setHasOnboarded(true);
    router.replace('/dashboard');
  };

  const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
  const prevStep = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(s => Math.max(1, s - 1));
    }
  };

  const progressPercentage = Math.round((step / totalSteps) * 100);

  const RequiredLabel = ({ text }: { text: string }) => (
    <Text style={styles.label}>
      {text} <Text style={{ color: '#FF3B30' }}>*</Text>
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            <ChevronLeft size={24} color={PRIMARY_BLUE} />
            <Text style={styles.navText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Step {step} of {totalSteps}</Text>
            <Text style={styles.progressPercent}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerArea}>
            <Text style={styles.heroTitle}>PATIENT ONBOARDING</Text>
            {step === 1 && <Text style={styles.heroSub}>Do you have your PhilHealth MDR on hand?</Text>}
            {step > 1 && <Text style={styles.heroSub}>Complete the profile with the details a clinic would verify at the desk.</Text>}
          </View>

          {step === 1 && (
            <View>
              <TouchableOpacity style={styles.uploadArea} onPress={handleMDRUpload}>
                {mdrImageUri ? (
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <Image source={{ uri: mdrImageUri }} style={styles.previewImage} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                      <CheckCircle2 size={20} color="#34C759" style={{ marginRight: 8 }}/>
                      <Text style={styles.uploadTextSuccess}>MDR attached. Processing...</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <UploadCloud size={48} color={PRIMARY_BLUE} style={{ marginBottom: 16 }} />
                    <Text style={styles.uploadText}>Yes, take a photo or upload</Text>
                    <Text style={styles.uploadSubText}>We will auto-fill your details.</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleNoMDR}>
                <Text style={styles.secondaryButtonText}>No, I'll enter details manually</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>PhilHealth MDR Baseline</Text>
              
              <View style={styles.inputGroup}>
                <RequiredLabel text="PIN" />
                <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="1234-5678-9012" keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Full name" />
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Maria Lourdes Dela Cruz" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Date of birth" />
                <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="MM/DD/YYYY" keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Sex" />
                <TextInput style={styles.input} value={sex} onChangeText={setSex} placeholder="Female" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Address" />
                <TextInput style={[styles.input, { height: 80 }]} value={address} onChangeText={setAddress} multiline placeholder="Unit 12B, Alabang Hills..." />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Medical Baseline</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood type</Text>
                <TextInput style={styles.input} value={bloodType} onChangeText={setBloodType} placeholder="O+" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Allergies" />
                <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="Penicillin, Shrimp" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Current complaint" />
                <TextInput style={styles.input} value={complaint} onChangeText={setComplaint} placeholder="Severe abdominal pain" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Emergency contact name" />
                <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} placeholder="Jose Dela Cruz" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Emergency contact phone" />
                <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="+63 917 555 0188" keyboardType="phone-pad" />
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Beneficiaries (Optional)</Text>
              <Text style={styles.cardSub}>You can skip this and add them later from the dashboard.</Text>
              
              {onboardingBeneficiaries.map((b, i) => (
                <View key={i} style={styles.beneficiaryItem}>
                  <Text style={styles.beneficiaryName}>{b.firstName} {b.lastName}</Text>
                  <Text style={styles.beneficiaryRel}>{b.relationship}</Text>
                </View>
              ))}

              {isAddingBen ? (
                <View style={styles.addBenForm}>
                  <TextInput style={styles.input} placeholder="First Name" value={benFirstName} onChangeText={setBenFirstName} />
                  <View style={{height: 12}} />
                  <TextInput style={styles.input} placeholder="Last Name" value={benLastName} onChangeText={setBenLastName} />
                  <View style={{height: 12}} />
                  <TextInput style={styles.input} placeholder="Relationship" value={benRel} onChangeText={setBenRel} />
                  <View style={{height: 12}} />
                  <TextInput style={styles.input} placeholder="PhilHealth PIN" value={benPin} onChangeText={setBenPin} keyboardType="numeric" />
                  <View style={{height: 12}} />
                  <TextInput style={styles.input} placeholder="PWD / Senior ID (Optional)" value={benSpecialId} onChangeText={setBenSpecialId} />

                  <View style={styles.benActions}>
                    <TouchableOpacity style={styles.benCancel} onPress={() => setIsAddingBen(false)}>
                      <Text style={styles.benCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.benSave} onPress={() => {
                      if (benFirstName && benLastName && benRel && benPin) {
                        setOnboardingBeneficiaries([...onboardingBeneficiaries, { 
                          firstName: benFirstName, 
                          lastName: benLastName, 
                          relationship: benRel,
                          pin: benPin,
                          specialId: benSpecialId
                        }]);
                        setIsAddingBen(false);
                        setBenFirstName(''); setBenLastName(''); setBenRel(''); setBenPin(''); setBenSpecialId('');
                      }
                    }}>
                      <Text style={styles.benSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.skipButton} onPress={() => setIsAddingBen(true)}>
                  <Text style={styles.skipButtonText}>+ Add a Beneficiary</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 5 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bereavement Claim</Text>
              <Text style={styles.cardSub}>Are you filling this out to process a bereavement claim for a deceased family member?</Text>
              
              <TouchableOpacity style={[styles.selectButton, isBereavement === true && styles.selectButtonActive]} onPress={() => setIsBereavement(true)}>
                <Text style={[styles.selectButtonText, isBereavement === true && styles.selectButtonTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectButton, isBereavement === false && styles.selectButtonActive]} onPress={() => setIsBereavement(false)}>
                <Text style={[styles.selectButtonText, isBereavement === false && styles.selectButtonTextActive]}>No, skip this step</Text>
              </TouchableOpacity>

              {isBereavement && (
                <View style={{ marginTop: 24 }}>
                  <View style={styles.inputGroup}>
                    <RequiredLabel text="Decedent Last Name" />
                    <TextInput style={styles.input} value={decLastName} onChangeText={setDecLastName} />
                  </View>
                  <View style={styles.inputGroup}>
                    <RequiredLabel text="Decedent First Name" />
                    <TextInput style={styles.input} value={decFirstName} onChangeText={setDecFirstName} />
                  </View>
                  <View style={styles.inputGroup}>
                    <RequiredLabel text="Date of Death" />
                    <TextInput style={styles.input} value={dateOfDeath} onChangeText={setDateOfDeath} placeholder="MM/DD/YYYY" keyboardType="numeric" />
                  </View>
                  
                  <Text style={styles.label}>Death Certificate Received? <Text style={{ color: '#FF3B30' }}>*</Text></Text>
                  <TouchableOpacity style={[styles.selectButton, deathCertReceived === true && styles.selectButtonActive]} onPress={() => setDeathCertReceived(true)}>
                    <Text style={[styles.selectButtonText, deathCertReceived === true && styles.selectButtonTextActive]}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.selectButton, deathCertReceived === false && styles.selectButtonActive]} onPress={() => setDeathCertReceived(false)}>
                    <Text style={[styles.selectButtonText, deathCertReceived === false && styles.selectButtonTextActive]}>No</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {step === 6 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Preview</Text>
              
              <View style={styles.previewSummaryCard}>
                <Text style={styles.previewSummaryTitle}>1. PROFILE DETAILS</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Full Name</Text><Text style={styles.previewValue}>{fullName || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Date of Birth</Text><Text style={styles.previewValue}>{dob || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Sex</Text><Text style={styles.previewValue}>{sex || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>PhilHealth PIN</Text><Text style={styles.previewValue}>{pin || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Address</Text><Text style={styles.previewValue}>{address || 'N/A'}</Text></View>
              </View>

              <View style={styles.previewSummaryCard}>
                <Text style={styles.previewSummaryTitle}>2. MEDICAL BASELINE</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Blood Type</Text><Text style={styles.previewValue}>{bloodType || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Allergies</Text><Text style={styles.previewValue}>{allergies || 'None declared'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Current Complaint</Text><Text style={styles.previewValue}>{complaint || 'N/A'}</Text></View>
              </View>

              <View style={styles.previewSummaryCard}>
                <Text style={styles.previewSummaryTitle}>3. EMERGENCY CONTACT</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Name</Text><Text style={styles.previewValue}>{emergencyName || 'N/A'}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Phone Number</Text><Text style={styles.previewValue}>{emergencyPhone || 'N/A'}</Text></View>
              </View>

              <View style={styles.previewSummaryCard}>
                <Text style={styles.previewSummaryTitle}>4. BENEFICIARIES</Text>
                {onboardingBeneficiaries.length > 0 ? (
                  onboardingBeneficiaries.map((b, i) => (
                    <View key={i} style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Beneficiary {i + 1}</Text>
                      <Text style={styles.previewValue}>{b.firstName} {b.lastName} ({b.relationship})</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.previewRow}><Text style={styles.previewValue}>None added</Text></View>
                )}
              </View>

              {isBereavement && (
                <View style={styles.previewSummaryCard}>
                  <Text style={styles.previewSummaryTitle}>5. BEREAVEMENT LCR</Text>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Decedent Name</Text><Text style={styles.previewValue}>{decFirstName} {decLastName}</Text></View>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Date of Death</Text><Text style={styles.previewValue}>{dateOfDeath || 'N/A'}</Text></View>
                </View>
              )}

              <View style={styles.previewWhyCard}>
                <Text style={styles.previewWhyTitle}>Why this matters</Text>
                <Text style={styles.previewWhyText}>The hospital sees the exact data the patient entered, not a demo stub.</Text>
              </View>
            </View>
          )}
          
        </ScrollView>

        {/* STICKY BOTTOM BAR */}
        {step > 1 && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.primaryButton} onPress={step < totalSteps ? nextStep : handleFinish}>
              <Text style={styles.primaryButtonText}>
                {step < totalSteps ? `Looks good! Go to Step ${step + 1}` : 'Complete Setup'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' }, // Light gray/blue calm background
  
  navBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0F4F8' },
  navButton: { flexDirection: 'row', alignItems: 'center' },
  navText: { color: PRIMARY_BLUE, fontFamily: 'Inter_500Medium', fontSize: 16 },

  progressContainer: { paddingHorizontal: 24, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1B365D' },
  progressPercent: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#718096' },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: PRIMARY_BLUE, borderRadius: 3 },

  content: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  headerArea: { marginBottom: 24 },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 14, color: '#1B365D', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  heroSub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#4A5568', lineHeight: 22 },

  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#DCE6E2', borderStyle: 'dashed',
    borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center',
  },
  uploadText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: PRIMARY_BLUE, marginTop: 12 },
  uploadSubText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', marginTop: 4 },
  uploadTextSuccess: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#34C759' },
  previewImage: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DCE6E2' },
  dividerText: { marginHorizontal: 16, fontFamily: 'Inter_500Medium', color: '#718096' },

  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE6E2', padding: 20, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#4A5568', fontFamily: 'Sora_600SemiBold', fontSize: 16 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  cardTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: '#1B365D', marginBottom: 24 },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', marginBottom: 16, marginTop: -16 },

  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1B365D', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 16,
    fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1B365D',
  },

  skipButton: { paddingVertical: 12, alignItems: 'flex-start' },
  skipButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: PRIMARY_BLUE },

  selectButton: {
    borderWidth: 2, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 20, marginBottom: 12,
    alignItems: 'center', backgroundColor: '#FFFFFF'
  },
  selectButtonActive: { borderColor: PRIMARY_BLUE, backgroundColor: '#F0F8FF' },
  selectButtonText: { fontFamily: 'Inter_500Medium', fontSize: 17, color: '#1B365D' },
  selectButtonTextActive: { color: PRIMARY_BLUE, fontFamily: 'Inter_600SemiBold' },

  bottomBar: { 
    padding: 24, 
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    backgroundColor: '#F0F4F8'
  },
  primaryButton: {
    backgroundColor: '#1B365D', 
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1B365D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 17 },
  
  beneficiaryItem: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  beneficiaryName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1B365D' },
  beneficiaryRel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096', marginTop: 4 },
  addBenForm: { marginTop: 12, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  benActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  benCancel: { padding: 12 },
  benCancelText: { fontFamily: 'Inter_500Medium', color: '#718096' },
  benSave: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  benSaveText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },

  previewSummaryCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  previewSummaryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#718096', letterSpacing: 1.5, marginBottom: 16 },
  previewRow: { flexDirection: 'column', marginBottom: 12 },
  previewLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#A0AEC0', marginBottom: 4 },
  previewValue: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#1B365D' },

  previewWhyCard: { backgroundColor: '#EBF4FF', padding: 20, borderRadius: 12, marginBottom: 16 },
  previewWhyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1B365D', marginBottom: 8 },
  previewWhyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4A5568', lineHeight: 22 },
});
