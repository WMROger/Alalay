import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileText,
  HelpCircle,
  Link2,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react-native';
import { Beneficiary, NotificationPreferences, useStore } from '../store/useStore';

const COLORS = {
  background: '#F2F6F5',
  surface: '#FFFFFF',
  ink: '#173B4A',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  blue: '#246BCE',
  blueSoft: '#EAF2FF',
  warning: '#A05A16',
  warningSoft: '#FFF7E8',
  danger: '#C23D4B',
};

const TOTAL_STEPS = 8;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  healthOpportunitiesEnabled: false,
  seniorWellness: true,
  philhealthPrograms: true,
  vaccinations: true,
  localHealthServices: true,
};

const EMPTY_BENEFICIARY_FORM = {
  firstName: '',
  lastName: '',
  relationship: '',
  dateOfBirth: '',
  sex: '',
  contactNumber: '',
  pin: '',
  specialId: '',
  knownAllergies: '',
  currentMedications: '',
  chronicConditions: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  prescriptionPhotoUrl: '',
};

type BeneficiaryForm = typeof EMPTY_BENEFICIARY_FORM;
type IdentitySource = 'egov' | 'mdr' | 'manual' | 'demo' | '';

const ELENA_IDENTITY = {
  pin: '12-345678901-2',
  fullName: 'Elena Cruz',
  dateOfBirth: '05/18/1984',
  sex: 'Female',
  civilStatus: 'Single',
  address: 'Cebu City, Cebu',
  contactNumber: '0917 555 0142',
  memberCategory: 'Formal Economy',
};

const ELENA_EMERGENCY_CONTACT = {
  name: 'Marco Cruz',
  relationship: 'Brother',
  phone: '0917 555 0199',
};

const createSeededBen = (source: 'egov' | 'mdr' | 'demo'): Beneficiary => ({
  id: 'beneficiary-ben-cruz',
  firstName: 'Ben',
  lastName: 'Cruz',
  relationship: 'Father',
  dateOfBirth: '03/09/1958',
  sex: 'Male',
  contactNumber: '0917 123 4567',
  pin: '12-987654321-0',
  specialId: '',
  knownAllergies: [],
  currentMedications: source === 'demo' || source === 'egov' ? ['Amlodipine 5 mg'] : [],
  chronicConditions: source === 'demo' || source === 'egov' ? ['Hypertension'] : [],
  emergencyContact: { name: 'Marco Cruz', relationship: 'Son', phone: '0917 555 0199' },
  prescriptionPhotoUrl: source === 'demo' || source === 'egov' ? 'seeded-demo-prescription' : '',
  verificationStatus: source === 'egov' ? 'verified' : 'pending_confirmation',
  profileSource: source,
});

const toList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const listText = (values?: string[]) => values?.length ? values.join(', ') : '';

function RequiredLabel({ text }: { text: string }) {
  return (
    <Text style={styles.label}>
      {text} <Text style={styles.required}>*</Text>
    </Text>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.choiceChip, value === option && styles.choiceChipActive]}
          onPress={() => onChange(option)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
        >
          <Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewCard({
  number,
  title,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>{number}. {title.toUpperCase()}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editLink} accessibilityLabel={`Edit ${title}`}>
          <Text style={styles.editLinkText}>Edit</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string; source?: string }>();
  const masterProfile = useStore((state) => state.masterProfile);
  const storedBeneficiaries = useStore((state) => state.beneficiaries);
  const updateMasterProfile = useStore((state) => state.updateMasterProfile);
  const addBeneficiary = useStore((state) => state.addBeneficiary);
  const updateBeneficiary = useStore((state) => state.updateBeneficiary);
  const setHasOnboarded = useStore((state) => state.setHasOnboarded);
  const addPendingAction = useStore((state) => state.addPendingAction);
  const isEditing = params.edit === '1';
  const enteredWithEgov = params.source === 'egov' && !isEditing;

  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [identitySource, setIdentitySource] = useState<IdentitySource>(enteredWithEgov ? 'egov' : masterProfile.identitySource || '');
  const [importingSource, setImportingSource] = useState<IdentitySource>('');
  const [mdrImageUri, setMdrImageUri] = useState('');
  const [showPinGuide, setShowPinGuide] = useState(false);

  const [pin, setPin] = useState(enteredWithEgov ? ELENA_IDENTITY.pin : masterProfile.philhealthId);
  const [fullName, setFullName] = useState(enteredWithEgov ? ELENA_IDENTITY.fullName : `${masterProfile.firstName} ${masterProfile.lastName}`.trim());
  const [dob, setDob] = useState(enteredWithEgov ? ELENA_IDENTITY.dateOfBirth : masterProfile.dateOfBirth);
  const [sex, setSex] = useState(enteredWithEgov ? ELENA_IDENTITY.sex : masterProfile.sex);
  const [civilStatus, setCivilStatus] = useState(enteredWithEgov ? ELENA_IDENTITY.civilStatus : masterProfile.civilStatus);
  const [address, setAddress] = useState(enteredWithEgov ? ELENA_IDENTITY.address : masterProfile.address.street);
  const [contactNumber, setContactNumber] = useState(enteredWithEgov ? ELENA_IDENTITY.contactNumber : masterProfile.contactNumber);
  const [memberCategory, setMemberCategory] = useState(enteredWithEgov ? ELENA_IDENTITY.memberCategory : masterProfile.memberCategory);

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    masterProfile.notificationPreferences || DEFAULT_PREFERENCES,
  );

  const [bloodType, setBloodType] = useState(masterProfile.bloodType);
  const [allergies, setAllergies] = useState(masterProfile.knownAllergies.join(', '));
  const [medications, setMedications] = useState(masterProfile.currentMedications.join(', '));
  const [chronicConditions, setChronicConditions] = useState(masterProfile.chronicConditions.join(', '));
  const [emergencyName, setEmergencyName] = useState(enteredWithEgov ? ELENA_EMERGENCY_CONTACT.name : masterProfile.emergencyContact.name);
  const [emergencyRelationship, setEmergencyRelationship] = useState(enteredWithEgov ? ELENA_EMERGENCY_CONTACT.relationship : masterProfile.emergencyContact.relationship);
  const [emergencyPhone, setEmergencyPhone] = useState(enteredWithEgov ? ELENA_EMERGENCY_CONTACT.phone : masterProfile.emergencyContact.phone);
  const [hmoName, setHmoName] = useState(masterProfile.hmoName);
  const [hmoPolicyNumber, setHmoPolicyNumber] = useState(masterProfile.hmoPolicyNumber);
  const [secondaryIdUri, setSecondaryIdUri] = useState(masterProfile.secondaryIdPhotoUrl);

  const [onboardingBeneficiaries, setOnboardingBeneficiaries] = useState<Beneficiary[]>(
    isEditing ? storedBeneficiaries : enteredWithEgov ? [createSeededBen('egov')] : [],
  );
  const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
  const [editingBeneficiaryId, setEditingBeneficiaryId] = useState<string | null>(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState<BeneficiaryForm>(EMPTY_BENEFICIARY_FORM);
  const [beneficiaryError, setBeneficiaryError] = useState('');

  const progressPercentage = Math.round((step / TOTAL_STEPS) * 100);
  const isIdentityComplete = Boolean(pin && fullName && dob && sex && address && contactNumber);
  const isEmergencyComplete = Boolean(emergencyName && emergencyRelationship && emergencyPhone);
  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(fullName && dob && sex),
      Boolean(pin && address && contactNumber),
      Boolean(bloodType || allergies || medications || chronicConditions),
      isEmergencyComplete,
      Boolean(hmoName || secondaryIdUri),
      true,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [address, allergies, bloodType, chronicConditions, contactNumber, dob, fullName, hmoName, isEmergencyComplete, medications, pin, secondaryIdUri, sex]);

  const canContinue = step === 2 ? isIdentityComplete : step === 5 ? isEmergencyComplete : true;

  const applyElenaIdentity = (source: Exclude<IdentitySource, ''>) => {
    setIdentitySource(source);
    setPin(ELENA_IDENTITY.pin);
    setFullName(ELENA_IDENTITY.fullName);
    setDob(ELENA_IDENTITY.dateOfBirth);
    setSex(ELENA_IDENTITY.sex);
    setCivilStatus(ELENA_IDENTITY.civilStatus);
    setAddress(ELENA_IDENTITY.address);
    setContactNumber(ELENA_IDENTITY.contactNumber);
    setMemberCategory(ELENA_IDENTITY.memberCategory);
  };

  const uploadPreparedMdr = () => {
    setImportingSource('demo');
    setTimeout(() => {
      applyElenaIdentity('mdr');
      setMdrImageUri('seeded-demo-mdr');
      setBloodType('O+');
      setAllergies('Penicillin');
      setMedications('');
      setChronicConditions('');
      setEmergencyName('Marco Cruz');
      setEmergencyRelationship('Brother');
      setEmergencyPhone('0917 555 0199');
      setHmoName('Maxicare');
      setHmoPolicyNumber('MXC-ELENA-2048');
      setOnboardingBeneficiaries([createSeededBen('demo')]);
      setImportingSource('');
      setStep(2);
    }, 450);
  };

  const useBenDemoDetails = () => {
    setBeneficiaryForm((current) => ({
      ...current,
      firstName: current.firstName || 'Ben',
      lastName: current.lastName || 'Cruz',
      relationship: current.relationship || 'Father',
      dateOfBirth: current.dateOfBirth || '03/09/1958',
      sex: current.sex || 'Male',
      contactNumber: current.contactNumber || '0917 123 4567',
      pin: current.pin || '12-987654321-0',
      specialId: '',
      knownAllergies: current.knownAllergies || 'None known',
      currentMedications: 'Amlodipine 5 mg',
      chronicConditions: 'Hypertension',
      emergencyName: 'Marco Cruz',
      emergencyRelationship: 'Son',
      emergencyPhone: '0917 555 0199',
      prescriptionPhotoUrl: 'seeded-demo-prescription',
    }));
  };

  const handleMDRUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    setMdrImageUri(result.assets[0].uri);
    setImportingSource('mdr');
    setTimeout(() => {
      applyElenaIdentity('mdr');
      setOnboardingBeneficiaries([createSeededBen('mdr')]);
      setImportingSource('');
      setStep(2);
    }, 700);
  };

  const handleMDRCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph the MDR, or choose an existing photo instead.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    setMdrImageUri(result.assets[0].uri);
    setImportingSource('mdr');
    setTimeout(() => {
      applyElenaIdentity('mdr');
      setOnboardingBeneficiaries([createSeededBen('mdr')]);
      setImportingSource('');
      setStep(2);
    }, 700);
  };

  const continueManually = () => {
    setIdentitySource('manual');
    setStep(2);
  };

  const pickImage = async (onSelected: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) onSelected(result.assets[0].uri);
  };

  const captureImage = async (onSelected: (uri: string) => void) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to take a document photo, or choose an existing image instead.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) onSelected(result.assets[0].uri);
  };

  const openNewBeneficiary = () => {
    setEditingBeneficiaryId(null);
    setBeneficiaryForm(EMPTY_BENEFICIARY_FORM);
    setBeneficiaryError('');
    setIsAddingBeneficiary(true);
  };

  const openBeneficiary = (beneficiary: Beneficiary) => {
    setEditingBeneficiaryId(beneficiary.id);
    setBeneficiaryForm({
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      relationship: beneficiary.relationship,
      dateOfBirth: beneficiary.dateOfBirth || '',
      sex: beneficiary.sex || '',
      contactNumber: beneficiary.contactNumber || '',
      pin: beneficiary.pin || '',
      specialId: beneficiary.specialId || '',
      knownAllergies: listText(beneficiary.knownAllergies),
      currentMedications: listText(beneficiary.currentMedications),
      chronicConditions: listText(beneficiary.chronicConditions),
      emergencyName: beneficiary.emergencyContact?.name || '',
      emergencyRelationship: beneficiary.emergencyContact?.relationship || '',
      emergencyPhone: beneficiary.emergencyContact?.phone || '',
      prescriptionPhotoUrl: beneficiary.prescriptionPhotoUrl || '',
    });
    setBeneficiaryError('');
    setIsAddingBeneficiary(true);
  };

  const saveBeneficiary = () => {
    const values = beneficiaryForm;
    if (!values.firstName.trim() || !values.lastName.trim() || !values.relationship.trim() || !values.dateOfBirth.trim() || !values.contactNumber.trim()) {
      setBeneficiaryError('Complete the name, relationship, birthday, and mobile number. PhilHealth PIN can be added later.');
      return;
    }

    const existing = onboardingBeneficiaries.find((item) => item.id === editingBeneficiaryId);
    const nextBeneficiary: Beneficiary = {
      id: existing?.id || `beneficiary-${Date.now()}`,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      relationship: values.relationship.trim(),
      dateOfBirth: values.dateOfBirth.trim(),
      sex: values.sex,
      contactNumber: values.contactNumber.trim(),
      pin: values.pin.trim(),
      specialId: values.specialId.trim(),
      knownAllergies: toList(values.knownAllergies),
      currentMedications: toList(values.currentMedications),
      chronicConditions: toList(values.chronicConditions),
      emergencyContact: {
        name: values.emergencyName.trim(),
        relationship: values.emergencyRelationship.trim(),
        phone: values.emergencyPhone.trim(),
      },
      prescriptionPhotoUrl: values.prescriptionPhotoUrl,
      verificationStatus: existing?.verificationStatus === 'verified' ? 'verified' : 'pending_confirmation',
      profileSource: existing?.profileSource || 'manual',
    };

    setOnboardingBeneficiaries((current) => (
      existing
        ? current.map((item) => item.id === existing.id ? nextBeneficiary : item)
        : [...current, nextBeneficiary]
    ));
    setIsAddingBeneficiary(false);
    setEditingBeneficiaryId(null);
    setBeneficiaryForm(EMPTY_BENEFICIARY_FORM);
    setBeneficiaryError('');
  };

  const handleFinish = () => {
    const names = fullName.trim().split(/\s+/);
    const firstName = names.length > 1 ? names.slice(0, -1).join(' ') : names[0] || '';
    const lastName = names.length > 1 ? names[names.length - 1] : '';

    updateMasterProfile({
      firstName,
      lastName,
      dateOfBirth: dob,
      sex,
      civilStatus,
      address: { street: address, city: '', region: '' },
      contactNumber,
      philhealthId: pin,
      memberCategory,
      bloodType,
      knownAllergies: toList(allergies),
      currentMedications: toList(medications),
      chronicConditions: toList(chronicConditions),
      emergencyContact: { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone },
      hmoName,
      hmoPolicyNumber,
      secondaryIdPhotoUrl: secondaryIdUri,
      identitySource,
      notificationPreferences: preferences,
    });

    onboardingBeneficiaries.forEach((beneficiary) => {
      if (storedBeneficiaries.some((item) => item.id === beneficiary.id)) {
        updateBeneficiary(beneficiary.id, beneficiary);
      } else {
        addBeneficiary(beneficiary);
      }

      if (beneficiary.verificationStatus === 'pending_confirmation') {
        addPendingAction({
          id: `dependent-confirmation-${beneficiary.id}`,
          patientId: beneficiary.id,
          kind: 'dependent_confirmation',
          title: `Confirm ${beneficiary.firstName}’s linked profile`,
          description: 'This dependent was added using family-provided details and is waiting for confirmation through their own mobile number.',
          status: 'open',
          route: '/family',
          createdAt: new Date().toISOString(),
        });
      }
    });

    setHasOnboarded(true);
    router.replace('/dashboard');
  };

  const nextStep = () => setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  const previousStep = () => {
    if (enteredWithEgov && step === 1) {
      router.replace('/login');
      return;
    }
    if (step === 1 || (isEditing && step === 2)) {
      router.back();
      return;
    }
    setStep((current) => Math.max(1, current - 1));
  };

  const sourceLabel = identitySource === 'egov'
    ? 'Verified through eGov PH'
    : identitySource === 'mdr'
      ? 'Imported from PhilHealth MDR'
      : identitySource === 'demo'
        ? 'Seeded persona profile'
        : 'Entered manually';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={previousStep} accessibilityLabel="Go back">
            <ChevronLeft size={23} color={COLORS.primary} />
            <Text style={styles.navText}>Back</Text>
          </TouchableOpacity>
          {isEditing && <View style={styles.editingBadge}><Text style={styles.editingBadgeText}>EDITING PROFILE</Text></View>}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Step {step} of {TOTAL_STEPS}</Text>
            <Text style={styles.progressPercent}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerArea}>
            <Text style={styles.eyebrow}>{isEditing ? 'UPDATE YOUR DETAILS' : 'ALALAY PROFILE SETUP'}</Text>
            <Text style={styles.heroTitle}>
              {step === 1 && (enteredWithEgov ? 'Your verified account is connected.' : 'Start with information you already have.')}
              {step === 2 && 'Review your identity and PhilHealth details.'}
              {step === 3 && 'Choose the updates that are useful to you.'}
              {step === 4 && 'Add the health information hospitals usually ask for.'}
              {step === 5 && 'Who should the hospital contact in an emergency?'}
              {step === 6 && 'Prepare profiles for the people you assist.'}
              {step === 7 && 'Add optional coverage and identification.'}
              {step === 8 && 'Review everything before finishing.'}
            </Text>
            <Text style={styles.heroSub}>
              {step === 1
                ? enteredWithEgov
                  ? 'Review all eight setup steps before anything is saved or shared.'
                  : 'Import your MDR or enter the information manually. You can review every field before saving.'
                : 'You can return and update this information whenever something changes.'}
            </Text>
          </View>

          {step === 1 && (
            <View style={styles.entryStack}>
              {enteredWithEgov ? (
                <>
                  <View style={styles.egovConnectedCard}>
                    <View style={styles.egovConnectedIcon}><ShieldCheck color="#FFFFFF" size={27} /></View>
                    <View style={styles.entryCopy}>
                      <Text style={styles.egovTitle}>eGov PH identity connected</Text>
                      <Text style={styles.egovText}>Identity, contact and available PhilHealth information are ready for your review.</Text>
                    </View>
                    <CheckCircle2 color="#8FE0CD" size={24} />
                  </View>
                  <View style={styles.sourcePreviewCard}>
                    <Text style={styles.sourcePreviewLabel}>INFORMATION RECEIVED</Text>
                    <Text style={styles.sourcePreviewName}>Elena Cruz</Text>
                    <Text style={styles.sourcePreviewText}>Cebu City · PhilHealth record found · 1 listed dependent</Text>
                  </View>
                </>
              ) : (
                <>
              <TouchableOpacity style={styles.egovCard} onPress={uploadPreparedMdr} disabled={Boolean(importingSource)} accessibilityRole="button">
                <View style={styles.entryIcon}><UploadCloud color="#FFFFFF" size={25} /></View>
                <View style={styles.entryCopy}>
                  <Text style={styles.egovTitle}>Upload PhilHealth MDR</Text>
                  <Text style={styles.egovText}>Import identity and dependent information from your Member Data Record.</Text>
                </View>
                {importingSource === 'demo' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.entryArrow}>›</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={handleMDRUpload} disabled={Boolean(importingSource)} accessibilityRole="button">
                <View style={[styles.entryIcon, styles.entryIconSoft]}><FileText color={COLORS.blue} size={24} /></View>
                <View style={styles.entryCopy}>
                  <Text style={styles.optionTitle}>Choose another MDR photo</Text>
                  <Text style={styles.optionText}>Use the photo picker if you have a different MDR available.</Text>
                </View>
                {importingSource === 'mdr' ? <ActivityIndicator color={COLORS.blue} /> : <Text style={[styles.entryArrow, styles.entryArrowDark]}>›</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cameraOptionCard} onPress={handleMDRCapture} disabled={Boolean(importingSource)} accessibilityRole="button">
                <View style={[styles.entryIcon, styles.entryIconCamera]}><Camera color={COLORS.primary} size={24} /></View>
                <View style={styles.entryCopy}>
                  <Text style={styles.optionTitle}>Take an MDR photo</Text>
                  <Text style={styles.optionText}>Open the camera and keep all four corners visible.</Text>
                </View>
                <Text style={[styles.entryArrow, styles.entryArrowDark]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoButton} onPress={continueManually} disabled={Boolean(importingSource)} accessibilityRole="button">
                <Smartphone color={COLORS.primary} size={20} />
                <Text style={styles.demoButtonText}>Enter details manually instead</Text>
              </TouchableOpacity>
                </>
              )}

              <View style={styles.privacyNotice}>
                <ShieldCheck color={COLORS.primary} size={20} />
                <Text style={styles.privacyNoticeText}>Nothing is shared with a hospital until you scan its QR and approve the named consent screen.</Text>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <View style={styles.sourceBanner}>
                <CheckCircle2 color={COLORS.primary} size={20} />
                <View style={styles.sourceCopy}>
                  <Text style={styles.sourceTitle}>{sourceLabel}</Text>
                  <Text style={styles.sourceText}>Check every field and correct anything that does not match your records.</Text>
                </View>
              </View>

              {!!mdrImageUri && (
                <View style={styles.attachmentRow}>
                  <FileText color={COLORS.blue} size={20} />
                  <Text style={styles.attachmentText}>{mdrImageUri === 'seeded-demo-mdr' ? 'Sample MDR uploaded and processed' : 'MDR image uploaded and processed'}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <RequiredLabel text="PhilHealth PIN" />
                  <TouchableOpacity style={styles.helpButton} onPress={() => setShowPinGuide(true)} accessibilityRole="button">
                    <HelpCircle color={COLORS.blue} size={17} />
                    <Text style={styles.helpButtonText}>Where is this?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="12-345678901-2" keyboardType="numeric" />
              </View>

              <View style={styles.inputGroup}>
                <RequiredLabel text="Full legal name" />
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Elena Cruz" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Date of birth" />
                <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="MM/DD/YYYY" keyboardType="numbers-and-punctuation" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Sex" />
                <ChoiceRow options={['Female', 'Male', 'Prefer not to say']} value={sex} onChange={setSex} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Civil status</Text>
                <TextInput style={styles.input} value={civilStatus} onChangeText={setCivilStatus} placeholder="Single, married, widowed" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PhilHealth member category</Text>
                <TextInput style={styles.input} value={memberCategory} onChangeText={setMemberCategory} placeholder="Formal Economy" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Address" />
                <TextInput style={[styles.input, styles.multilineInput]} value={address} onChangeText={setAddress} multiline placeholder="Complete home address" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Mobile number" />
                <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} placeholder="0917 555 0142" keyboardType="phone-pad" />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <View style={styles.preferenceHero}>
                <View style={styles.preferenceIcon}><Bell color={COLORS.primary} size={25} /></View>
                <View style={styles.preferenceHeroCopy}>
                  <Text style={styles.cardTitleCompact}>Health Opportunity Notifications</Text>
                  <Text style={styles.cardSubCompact}>Receive occasional, relevant reminders based on the profile information you choose to provide.</Text>
                </View>
                <Switch
                  accessibilityLabel="Health Opportunity Notifications"
                  value={preferences.healthOpportunitiesEnabled}
                  onValueChange={(healthOpportunitiesEnabled) => setPreferences((current) => ({ ...current, healthOpportunitiesEnabled }))}
                  trackColor={{ false: '#C9D5D2', true: '#8FD1C3' }}
                  thumbColor={preferences.healthOpportunitiesEnabled ? COLORS.primary : '#FFFFFF'}
                />
              </View>

              <Text style={styles.preferenceSectionTitle}>Choose categories</Text>
              {[
                ['seniorWellness', 'Senior & caregiver wellness', 'Checkups and age-relevant programs for linked family profiles such as Ben'],
                ['philhealthPrograms', 'PhilHealth programs', 'Eligibility and coverage reminders'],
                ['vaccinations', 'Vaccination', 'Optional vaccination announcements'],
                ['localHealthServices', 'Local health services', 'Partner and local-service announcements'],
              ].map(([key, title, description]) => (
                <View style={[styles.preferenceRow, !preferences.healthOpportunitiesEnabled && styles.preferenceRowDisabled]} key={key}>
                  <View style={styles.preferenceCopy}>
                    <Text style={styles.preferenceTitle}>{title}</Text>
                    <Text style={styles.preferenceText}>{description}</Text>
                  </View>
                  <Switch
                    accessibilityLabel={title}
                    value={preferences[key as keyof NotificationPreferences] as boolean}
                    disabled={!preferences.healthOpportunitiesEnabled}
                    onValueChange={(value) => setPreferences((current) => ({ ...current, [key]: value }))}
                    trackColor={{ false: '#D5DEDC', true: '#8FD1C3' }}
                    thumbColor={preferences[key as keyof NotificationPreferences] ? COLORS.primary : '#FFFFFF'}
                  />
                </View>
              ))}

              <View style={styles.infoCard}>
                <ShieldCheck color={COLORS.primary} size={19} />
                <Text style={styles.infoCardText}>This is optional. You can turn off the entire feature or individual categories from Profile at any time.</Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Medical basics</Text>
              <Text style={styles.cardSub}>Use “None known” when that is the accurate answer. Avoid guessing.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood type</Text>
                <ChoiceRow options={['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-', 'Unknown']} value={bloodType} onChange={setBloodType} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Known allergies</Text>
                <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="Penicillin, shrimp, or None known" />
                <Text style={styles.helperText}>Separate multiple entries with commas.</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current medications</Text>
                <TextInput style={styles.input} value={medications} onChangeText={setMedications} placeholder="Amlodipine 5 mg, Metformin" />
                <Text style={styles.helperText}>Include the dose when you know it.</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Chronic conditions</Text>
                <TextInput style={styles.input} value={chronicConditions} onChangeText={setChronicConditions} placeholder="Hypertension, diabetes, or None known" />
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Emergency contact</Text>
              <Text style={styles.cardSub}>This is the only required health-profile section because it is immediately useful during an urgent visit.</Text>

              {enteredWithEgov && (
                <View style={styles.sourceBanner}>
                  <CheckCircle2 color={COLORS.primary} size={20} />
                  <View style={styles.sourceCopy}>
                    <Text style={styles.sourceTitle}>Saved emergency contact loaded</Text>
                    <Text style={styles.sourceText}>This is Elena’s editable Alalay contact. It is saved in her profile and is not claimed to come from eGov PH.</Text>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <RequiredLabel text="Contact name" />
                <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} placeholder="Marco Cruz" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Relationship" />
                <TextInput style={styles.input} value={emergencyRelationship} onChangeText={setEmergencyRelationship} placeholder="Brother" />
              </View>
              <View style={styles.inputGroup}>
                <RequiredLabel text="Mobile number" />
                <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="0917 555 0199" keyboardType="phone-pad" />
              </View>

              <View style={styles.infoCard}>
                <Smartphone color={COLORS.primary} size={19} />
                <Text style={styles.infoCardText}>A hospital can view this contact only after you approve sharing for a specific visit.</Text>
              </View>
            </View>
          )}

          {step === 6 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Family and dependent profiles</Text>
              <Text style={styles.cardSub}>Prepare information for a parent, child, spouse, or anyone you may assist at the hospital.</Text>

              {onboardingBeneficiaries.map((beneficiary) => {
                const statusText = beneficiary.verificationStatus === 'verified'
                  ? 'Verified dependent'
                  : beneficiary.verificationStatus === 'needs_information'
                    ? 'Needs information'
                    : `Self-declared by ${fullName.split(' ')[0] || 'you'} · Pending confirmation`;
                return (
                  <View style={styles.beneficiaryCard} key={beneficiary.id}>
                    <View style={styles.beneficiaryTopRow}>
                      <View style={styles.beneficiaryAvatar}><Text style={styles.beneficiaryAvatarText}>{beneficiary.firstName.charAt(0)}</Text></View>
                      <View style={styles.beneficiaryCopy}>
                        <Text style={styles.beneficiaryName}>{beneficiary.firstName} {beneficiary.lastName}</Text>
                        <Text style={styles.beneficiaryRelationship}>{beneficiary.relationship} · {beneficiary.dateOfBirth || 'Birthday needed'}</Text>
                      </View>
                      <TouchableOpacity style={styles.smallEditButton} onPress={() => openBeneficiary(beneficiary)}>
                        <Text style={styles.smallEditText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.statusBadge, beneficiary.verificationStatus === 'verified' && styles.statusBadgeVerified]}>
                      {beneficiary.verificationStatus === 'verified' ? <CheckCircle2 color={COLORS.primary} size={14} /> : <Link2 color={COLORS.warning} size={14} />}
                      <Text style={[styles.statusBadgeText, beneficiary.verificationStatus === 'verified' && styles.statusBadgeTextVerified]}>{statusText}</Text>
                    </View>
                    <View style={styles.beneficiaryMetaRow}>
                      <Text style={styles.beneficiaryMeta}>{beneficiary.contactNumber || 'Mobile needed'}</Text>
                      <Text style={styles.beneficiaryMeta}>{beneficiary.prescriptionPhotoUrl === 'seeded-demo-prescription' ? 'Sample prescription' : beneficiary.prescriptionPhotoUrl ? 'Prescription attached' : 'No prescription attached'}</Text>
                    </View>
                  </View>
                );
              })}

              {isAddingBeneficiary ? (
                <View style={styles.beneficiaryForm}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>{editingBeneficiaryId ? 'Complete dependent profile' : 'Add a dependent'}</Text>
                    <TouchableOpacity onPress={() => setIsAddingBeneficiary(false)} accessibilityLabel="Close dependent form"><X color={COLORS.muted} size={20} /></TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.demoButton} onPress={useBenDemoDetails} accessibilityRole="button">
                    <UserPlus color={COLORS.primary} size={19} />
                    <Text style={styles.demoButtonText}>Restore Ben’s sample details</Text>
                  </TouchableOpacity>
                  <Text style={styles.demoHelper}>Prepared profile information for the sample MDR. You can still edit every field.</Text>

                  <Text style={styles.formSectionTitle}>Identity</Text>
                  <TextInput style={styles.input} value={beneficiaryForm.firstName} onChangeText={(firstName) => setBeneficiaryForm((current) => ({ ...current, firstName }))} placeholder="First name *" />
                  <TextInput style={styles.input} value={beneficiaryForm.lastName} onChangeText={(lastName) => setBeneficiaryForm((current) => ({ ...current, lastName }))} placeholder="Last name *" />
                  <TextInput style={styles.input} value={beneficiaryForm.relationship} onChangeText={(relationship) => setBeneficiaryForm((current) => ({ ...current, relationship }))} placeholder="Relationship *" />
                  <TextInput style={styles.input} value={beneficiaryForm.dateOfBirth} onChangeText={(dateOfBirth) => setBeneficiaryForm((current) => ({ ...current, dateOfBirth }))} placeholder="Birthday (MM/DD/YYYY) *" keyboardType="numbers-and-punctuation" />
                  <Text style={styles.label}>Sex</Text>
                  <ChoiceRow options={['Female', 'Male', 'Prefer not to say']} value={beneficiaryForm.sex} onChange={(sexValue) => setBeneficiaryForm((current) => ({ ...current, sex: sexValue }))} />
                  <TextInput style={styles.input} value={beneficiaryForm.contactNumber} onChangeText={(nextContactNumber) => setBeneficiaryForm((current) => ({ ...current, contactNumber: nextContactNumber }))} placeholder="Their mobile number *" keyboardType="phone-pad" />

                  <View style={styles.reconciliationCard}>
                    <Link2 color={COLORS.blue} size={19} />
                    <Text style={styles.reconciliationText}>If this person creates their own Alalay account using this number, Alalay can connect the profiles instead of creating a duplicate.</Text>
                  </View>

                  <TextInput style={styles.input} value={beneficiaryForm.pin} onChangeText={(nextPin) => setBeneficiaryForm((current) => ({ ...current, pin: nextPin }))} placeholder="PhilHealth PIN (can be added later)" keyboardType="numeric" />
                  <TextInput style={styles.input} value={beneficiaryForm.specialId} onChangeText={(specialId) => setBeneficiaryForm((current) => ({ ...current, specialId }))} placeholder="Senior / PWD ID (optional)" />

                  <Text style={styles.formSectionTitle}>Health information</Text>
                  <TextInput style={styles.input} value={beneficiaryForm.knownAllergies} onChangeText={(knownAllergies) => setBeneficiaryForm((current) => ({ ...current, knownAllergies }))} placeholder="Known allergies" />
                  <TextInput style={styles.input} value={beneficiaryForm.currentMedications} onChangeText={(currentMedications) => setBeneficiaryForm((current) => ({ ...current, currentMedications }))} placeholder="Current medications" />
                  <TextInput style={styles.input} value={beneficiaryForm.chronicConditions} onChangeText={(nextChronicConditions) => setBeneficiaryForm((current) => ({ ...current, chronicConditions: nextChronicConditions }))} placeholder="Chronic conditions" />

                  <TouchableOpacity
                    style={styles.compactUpload}
                    onPress={() => pickImage((prescriptionPhotoUrl) => setBeneficiaryForm((current) => ({ ...current, prescriptionPhotoUrl })))}
                  >
                    <UploadCloud color={COLORS.blue} size={21} />
                    <View style={styles.compactUploadCopy}>
                      <Text style={styles.compactUploadTitle}>{beneficiaryForm.prescriptionPhotoUrl === 'seeded-demo-prescription' ? 'Sample prescription attached' : beneficiaryForm.prescriptionPhotoUrl ? 'Prescription attached' : 'Choose a prescription photo'}</Text>
                      <Text style={styles.compactUploadText}>{beneficiaryForm.prescriptionPhotoUrl === 'seeded-demo-prescription' ? 'Prepared sample · Tap to replace with another photo' : 'Photo of a current prescription or medicine list'}</Text>
                    </View>
                    {beneficiaryForm.prescriptionPhotoUrl && <CheckCircle2 color={COLORS.primary} size={20} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.compactCameraButton}
                    onPress={() => captureImage((prescriptionPhotoUrl) => setBeneficiaryForm((current) => ({ ...current, prescriptionPhotoUrl })))}
                    accessibilityRole="button"
                  >
                    <Camera color={COLORS.blue} size={17} />
                    <Text style={styles.compactCameraText}>Take prescription photo</Text>
                  </TouchableOpacity>

                  <Text style={styles.formSectionTitle}>Emergency contact</Text>
                  <TextInput style={styles.input} value={beneficiaryForm.emergencyName} onChangeText={(emergencyNameValue) => setBeneficiaryForm((current) => ({ ...current, emergencyName: emergencyNameValue }))} placeholder="Contact name" />
                  <TextInput style={styles.input} value={beneficiaryForm.emergencyRelationship} onChangeText={(nextEmergencyRelationship) => setBeneficiaryForm((current) => ({ ...current, emergencyRelationship: nextEmergencyRelationship }))} placeholder="Relationship" />
                  <TextInput style={styles.input} value={beneficiaryForm.emergencyPhone} onChangeText={(nextEmergencyPhone) => setBeneficiaryForm((current) => ({ ...current, emergencyPhone: nextEmergencyPhone }))} placeholder="Mobile number" keyboardType="phone-pad" />

                  {!!beneficiaryError && <Text style={styles.errorText}>{beneficiaryError}</Text>}
                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.cancelFormButton} onPress={() => setIsAddingBeneficiary(false)}><Text style={styles.cancelFormText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.saveFormButton} onPress={saveBeneficiary}><Text style={styles.saveFormText}>Save profile</Text></TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBeneficiaryButton} onPress={openNewBeneficiary} accessibilityRole="button">
                  <UserPlus color={COLORS.primary} size={21} />
                  <Text style={styles.addBeneficiaryText}>Add another person</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 7 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Insurance and secondary ID</Text>
              <Text style={styles.cardSub}>These fields are optional. Missing documents become reminders, never blockers.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>HMO or private insurer</Text>
                <TextInput style={styles.input} value={hmoName} onChangeText={setHmoName} placeholder="Maxicare" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Policy number</Text>
                <TextInput style={styles.input} value={hmoPolicyNumber} onChangeText={setHmoPolicyNumber} placeholder="Optional" />
              </View>

              <TouchableOpacity style={styles.largeUpload} onPress={() => pickImage(setSecondaryIdUri)}>
                {secondaryIdUri && secondaryIdUri !== 'seeded-demo-id' ? (
                  <Image source={{ uri: secondaryIdUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.largeUploadIcon}><UploadCloud color={COLORS.blue} size={31} /></View>
                )}
                <Text style={styles.largeUploadTitle}>{secondaryIdUri ? 'Secondary ID attached' : 'Upload a secondary government ID'}</Text>
                <Text style={styles.largeUploadText}>Optional photo upload · You can complete this later</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureIdButton} onPress={() => captureImage(setSecondaryIdUri)} accessibilityRole="button">
                <Camera color={COLORS.blue} size={18} />
                <Text style={styles.captureIdText}>Take ID photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.notNowButton} onPress={() => setSecondaryIdUri('')}>
                <Text style={styles.notNowText}>I don’t have this right now</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 8 && (
            <View>
              <View style={styles.completionCard}>
                <View style={styles.completionRing}><Text style={styles.completionNumber}>{profileCompletion}%</Text></View>
                <View style={styles.completionCopy}>
                  <Text style={styles.completionTitle}>{isIdentityComplete && isEmergencyComplete ? 'Check-in ready' : 'Required details needed'}</Text>
                  <Text style={styles.completionText}>Optional information can be completed later without blocking hospital check-in.</Text>
                </View>
              </View>

              <ReviewCard number={1} title="Identity and PhilHealth" onEdit={() => setStep(2)}>
                <ReviewRow label="Name" value={fullName || 'Not provided'} />
                <ReviewRow label="Birthday" value={dob || 'Not provided'} />
                <ReviewRow label="PhilHealth PIN" value={pin || 'Not provided'} />
                <ReviewRow label="Source" value={sourceLabel} />
              </ReviewCard>

              <ReviewCard number={2} title="Notification preferences" onEdit={() => setStep(3)}>
                <ReviewRow label="Health opportunities" value={preferences.healthOpportunitiesEnabled ? 'Enabled' : 'Off'} />
              </ReviewCard>

              <ReviewCard number={3} title="Health profile" onEdit={() => setStep(4)}>
                <ReviewRow label="Blood type" value={bloodType || 'Not provided'} />
                <ReviewRow label="Allergies" value={allergies || 'None declared'} />
                <ReviewRow label="Medications" value={medications || 'None declared'} />
                <ReviewRow label="Conditions" value={chronicConditions || 'None declared'} />
              </ReviewCard>

              <ReviewCard number={4} title="Emergency contact" onEdit={() => setStep(5)}>
                <ReviewRow label="Name" value={emergencyName || 'Not provided'} />
                <ReviewRow label="Relationship" value={emergencyRelationship || 'Not provided'} />
                <ReviewRow label="Mobile" value={emergencyPhone || 'Not provided'} />
              </ReviewCard>

              <ReviewCard number={5} title="Family profiles" onEdit={() => setStep(6)}>
                {onboardingBeneficiaries.length ? onboardingBeneficiaries.map((beneficiary) => (
                  <ReviewRow
                    key={beneficiary.id}
                    label={`${beneficiary.firstName} · ${beneficiary.relationship}`}
                    value={beneficiary.verificationStatus === 'verified' ? 'Verified dependent' : 'Pending confirmation'}
                  />
                )) : <ReviewRow label="Managed profiles" value="None added" />}
              </ReviewCard>

              <ReviewCard number={6} title="Insurance and ID" onEdit={() => setStep(7)}>
                <ReviewRow label="HMO" value={hmoName || 'Not provided'} />
                <ReviewRow label="Policy" value={hmoPolicyNumber || 'Not provided'} />
                <ReviewRow label="Secondary ID" value={secondaryIdUri ? 'Attached' : 'Pending · Optional'} />
              </ReviewCard>

              {onboardingBeneficiaries.some((beneficiary) => beneficiary.verificationStatus === 'pending_confirmation') && (
                <View style={styles.pendingCard}>
                  <Text style={styles.pendingEyebrow}>PENDING ACTIONS</Text>
                  <Text style={styles.pendingTitle}>Dependent confirmation</Text>
                  <Text style={styles.pendingText}>A manually created family profile remains clearly labeled until that person confirms it using their own mobile number. This does not block check-in.</Text>
                </View>
              )}

              <View style={styles.consentReminder}>
                <ShieldCheck color={COLORS.primary} size={21} />
                <Text style={styles.consentReminderText}>Finishing creates a reusable profile. You will still review and approve exactly what is shared during every hospital check-in.</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {(step > 1 || enteredWithEgov) && !isAddingBeneficiary && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
              onPress={step < TOTAL_STEPS ? nextStep : handleFinish}
              disabled={!canContinue}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{step < TOTAL_STEPS ? 'Continue' : isEditing ? 'Save changes' : 'Complete setup'}</Text>
            </TouchableOpacity>
            {!canContinue && <Text style={styles.requiredHint}>Complete the required fields above to continue.</Text>}
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal visible={showPinGuide} transparent animationType="fade" onRequestClose={() => setShowPinGuide(false)}>
        <View style={styles.guideRoot}>
          <TouchableOpacity style={styles.guideBackdrop} activeOpacity={1} onPress={() => setShowPinGuide(false)} />
          <View style={styles.guideSheet}>
            <TouchableOpacity style={styles.guideClose} onPress={() => setShowPinGuide(false)} accessibilityLabel="Close PIN guide">
              <X color={COLORS.muted} size={21} />
            </TouchableOpacity>
            <Text style={styles.guideEyebrow}>PHILHEALTH MDR GUIDE</Text>
            <Text style={styles.guideTitle}>Find your PIN near the top of your MDR.</Text>
            <Text style={styles.guideText}>Look for “PhilHealth Identification Number (PIN)” under Member Basic Information.</Text>

            <View style={styles.mdrSample}>
              <Text style={styles.mdrRepublic}>Republic of the Philippines</Text>
              <Text style={styles.mdrHeading}>PHILIPPINE HEALTH INSURANCE CORPORATION</Text>
              <Text style={styles.mdrTitle}>MEMBER DATA RECORD</Text>
              <View style={styles.mdrSection}><Text style={styles.mdrSectionText}>MEMBER BASIC INFORMATION</Text></View>
              <View style={styles.pinHighlight}>
                <Text style={styles.pinLabel}>PhilHealth Identification Number (PIN)</Text>
                <Text style={styles.pinValue}>12-345678901-2</Text>
              </View>
              <View style={styles.fakeRow}><View style={styles.fakeLabel} /><View style={styles.fakeValue} /></View>
              <View style={styles.fakeRow}><View style={styles.fakeLabelShort} /><View style={styles.fakeValueLong} /></View>
              <View style={styles.fakeRow}><View style={styles.fakeLabel} /><View style={styles.fakeValue} /></View>
            </View>

            <View style={styles.pinTip}>
              <HelpCircle color={COLORS.danger} size={19} />
              <Text style={styles.pinTipText}>Enter the PIN exactly as printed. Do not use the number from an employer or hospital card.</Text>
            </View>
            <TouchableOpacity style={styles.guideDoneButton} onPress={() => setShowPinGuide(false)} accessibilityRole="button">
              <Text style={styles.guideDoneText}>I found it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navBar: { width: '100%', maxWidth: 800, alignSelf: 'center', minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  navButton: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 44 },
  navText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.primary },
  editingBadge: { backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  editingBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1, color: COLORS.primary },
  progressContainer: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.ink },
  progressPercent: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.muted },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#DDE7E4', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.primary },
  content: { flex: 1 },
  scrollContent: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 42 },
  headerArea: { marginTop: 9, marginBottom: 22 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, color: COLORS.primary, marginBottom: 7 },
  heroTitle: { maxWidth: 660, fontFamily: 'Sora_700Bold', fontSize: 25, lineHeight: 33, color: COLORS.ink },
  heroSub: { maxWidth: 650, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: COLORS.muted, marginTop: 7 },
  entryStack: { gap: 12 },
  egovCard: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.navy, borderRadius: 22, padding: 18 },
  egovConnectedCard: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.navy, borderRadius: 22, padding: 18 },
  egovConnectedIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  sourcePreviewCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 16 },
  sourcePreviewLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: COLORS.primary },
  sourcePreviewName: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: COLORS.ink, marginTop: 6 },
  sourcePreviewText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 3 },
  entryIcon: { width: 49, height: 49, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  entryIconSoft: { backgroundColor: COLORS.blueSoft },
  entryCopy: { flex: 1 },
  egovTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  egovText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#C9DADF', marginTop: 4 },
  entryArrow: { fontFamily: 'Inter_400Regular', fontSize: 30, color: '#FFFFFF' },
  entryArrowDark: { color: COLORS.muted },
  optionCard: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, padding: 16 },
  cameraOptionCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F3FBF8', borderWidth: 1, borderColor: '#BFE4DB', borderRadius: 20, padding: 16 },
  entryIconCamera: { backgroundColor: COLORS.primarySoft },
  optionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  optionText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 4 },
  demoButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: '#BFE4DB', borderRadius: 16 },
  demoButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.primary },
  demoHelper: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, color: COLORS.muted, textAlign: 'center', marginTop: -5, marginBottom: 15 },
  privacyNotice: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginTop: 3 },
  privacyNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 23, padding: 20 },
  cardTitle: { fontFamily: 'Sora_700Bold', fontSize: 19, color: COLORS.ink, marginBottom: 7 },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, color: COLORS.muted, marginBottom: 21 },
  cardTitleCompact: { fontFamily: 'Sora_700Bold', fontSize: 15, color: COLORS.ink },
  cardSubCompact: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 3 },
  sourceBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 15, padding: 13, marginBottom: 18 },
  sourceCopy: { flex: 1 },
  sourceTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.primary },
  sourceText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 2 },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.blueSoft, borderRadius: 12, padding: 11, marginBottom: 15 },
  attachmentText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.blue },
  inputGroup: { marginBottom: 17 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.ink, marginBottom: 7 },
  required: { color: COLORS.danger },
  input: { minHeight: 50, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E1DE', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.ink, marginBottom: 11 },
  multilineInput: { minHeight: 82, textAlignVertical: 'top' },
  helpButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 30 },
  helpButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.blue },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { minHeight: 40, justifyContent: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 13, paddingHorizontal: 13, backgroundColor: '#F9FBFA' },
  choiceChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  choiceText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.muted },
  choiceTextActive: { fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  helperText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: -5 },
  preferenceHero: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 19, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  preferenceIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  preferenceHeroCopy: { flex: 1 },
  preferenceSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1, color: COLORS.muted, marginTop: 19, marginBottom: 8 },
  preferenceRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F0' },
  preferenceRowDisabled: { opacity: 0.48 },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.ink },
  preferenceText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
  infoCard: { flexDirection: 'row', gap: 9, backgroundColor: '#F4F9F7', borderRadius: 14, padding: 12, marginTop: 17 },
  infoCardText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted },
  beneficiaryCard: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 17, padding: 14, marginBottom: 11 },
  beneficiaryTopRow: { flexDirection: 'row', alignItems: 'center' },
  beneficiaryAvatar: { width: 43, height: 43, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  beneficiaryAvatarText: { fontFamily: 'Sora_700Bold', fontSize: 16, color: COLORS.primary },
  beneficiaryCopy: { flex: 1, marginLeft: 11 },
  beneficiaryName: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  beneficiaryRelationship: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: 3 },
  smallEditButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 10 },
  smallEditText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.primary },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.warningSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, marginTop: 12 },
  statusBadgeVerified: { backgroundColor: COLORS.primarySoft },
  statusBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: COLORS.warning },
  statusBadgeTextVerified: { color: COLORS.primary },
  beneficiaryMetaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginTop: 11 },
  beneficiaryMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted },
  addBeneficiaryButton: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#AFD3CA', borderRadius: 16, backgroundColor: '#F7FBF9' },
  addBeneficiaryText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: COLORS.primary },
  beneficiaryForm: { backgroundColor: '#F7FAF9', borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 15, marginTop: 8 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  formTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: COLORS.ink },
  formSectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2, color: COLORS.primary, marginTop: 7, marginBottom: 10 },
  reconciliationCard: { flexDirection: 'row', gap: 9, backgroundColor: COLORS.blueSoft, borderRadius: 13, padding: 11, marginBottom: 12 },
  reconciliationText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#466379' },
  compactUpload: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#BCD3DE', borderRadius: 14, padding: 12, marginBottom: 13 },
  compactCameraButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.blueSoft, borderRadius: 12, marginTop: -5, marginBottom: 13 },
  compactCameraText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.blue },
  compactUploadCopy: { flex: 1 },
  compactUploadTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.blue },
  compactUploadText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.muted, marginTop: 2 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, color: COLORS.danger, backgroundColor: '#FFF0F2', borderRadius: 10, padding: 10, marginBottom: 10 },
  formActions: { flexDirection: 'row', gap: 9 },
  cancelFormButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 14 },
  cancelFormText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.muted },
  saveFormButton: { flex: 1.5, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14 },
  saveFormText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  largeUpload: { minHeight: 170, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9CFD9', borderRadius: 18, padding: 17, overflow: 'hidden' },
  captureIdButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blueSoft, borderRadius: 14, marginTop: 9 },
  captureIdText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.blue },
  largeUploadIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  largeUploadTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink, marginTop: 8 },
  largeUploadText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted, marginTop: 4 },
  previewImage: { width: '100%', height: 145, borderRadius: 13, resizeMode: 'cover' },
  notNowButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  notNowText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.muted },
  completionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.navy, borderRadius: 22, padding: 18, marginBottom: 13 },
  completionRing: { width: 67, height: 67, borderRadius: 34, borderWidth: 5, borderColor: '#5BC3AD', alignItems: 'center', justifyContent: 'center' },
  completionNumber: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },
  completionCopy: { flex: 1 },
  completionTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },
  completionText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#C9DADF', marginTop: 4 },
  reviewCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 15, marginBottom: 11 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  reviewTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.1, color: COLORS.muted },
  editLink: { minHeight: 32, justifyContent: 'center', paddingLeft: 12 },
  editLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 8 },
  reviewLabel: { flex: 0.8, fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.muted },
  reviewValue: { flex: 1.2, fontFamily: 'Inter_600SemiBold', fontSize: 10, lineHeight: 15, color: COLORS.ink, textAlign: 'right' },
  pendingCard: { backgroundColor: COLORS.warningSoft, borderWidth: 1, borderColor: '#F0D7AF', borderRadius: 17, padding: 15, marginBottom: 11 },
  pendingEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.3, color: COLORS.warning },
  pendingTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#784717', marginTop: 5 },
  pendingText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: '#8A633C', marginTop: 4 },
  consentReminder: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: 16, padding: 14 },
  consentReminderText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, color: COLORS.muted },
  bottomBar: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 25 : 15, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.background },
  primaryButton: { minHeight: 53, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 16 },
  primaryButtonDisabled: { backgroundColor: '#A7B9B5' },
  primaryButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  requiredHint: { fontFamily: 'Inter_400Regular', fontSize: 9, color: COLORS.danger, textAlign: 'center', marginTop: 7 },
  guideRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  guideBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10, 28, 34, 0.62)' },
  guideSheet: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 21 },
  guideClose: { position: 'absolute', top: 13, right: 13, width: 40, height: 40, borderRadius: 14, backgroundColor: '#F0F4F3', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  guideEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: COLORS.blue, marginBottom: 7 },
  guideTitle: { maxWidth: 350, fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 27, color: COLORS.ink },
  guideText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 6, marginBottom: 16 },
  mdrSample: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BCC8C5', borderRadius: 8, padding: 13 },
  mdrRepublic: { fontFamily: 'Inter_400Regular', fontSize: 7, color: '#3F4F4B', textAlign: 'center' },
  mdrHeading: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#253D37', textAlign: 'center', marginTop: 2 },
  mdrTitle: { fontFamily: 'Sora_700Bold', fontSize: 11, color: '#253D37', textAlign: 'center', marginVertical: 10 },
  mdrSection: { backgroundColor: '#274F70', padding: 5 },
  mdrSectionText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, color: '#FFFFFF' },
  pinHighlight: { borderWidth: 2, borderColor: COLORS.danger, backgroundColor: '#FFF4F5', borderRadius: 5, padding: 9, marginTop: 8 },
  pinLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#74404A' },
  pinValue: { fontFamily: 'Sora_700Bold', fontSize: 14, color: COLORS.danger, marginTop: 4 },
  fakeRow: { flexDirection: 'row', gap: 9, marginTop: 10 },
  fakeLabel: { width: '38%', height: 6, borderRadius: 3, backgroundColor: '#D9E1DF' },
  fakeLabelShort: { width: '24%', height: 6, borderRadius: 3, backgroundColor: '#D9E1DF' },
  fakeValue: { width: '32%', height: 6, borderRadius: 3, backgroundColor: '#BFCBC8' },
  fakeValueLong: { width: '54%', height: 6, borderRadius: 3, backgroundColor: '#BFCBC8' },
  pinTip: { flexDirection: 'row', gap: 9, backgroundColor: '#FFF4F5', borderRadius: 13, padding: 12, marginTop: 13 },
  pinTipText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, color: '#74404A' },
  guideDoneButton: { minHeight: 49, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 14 },
  guideDoneText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#FFFFFF' },
});
