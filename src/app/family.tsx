import { useEffect, useMemo, useState } from 'react';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  Edit3,
  Plus,
  QrCode as QrCodeIcon,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNav } from '../components/AppBottomNav';
import { Beneficiary, useStore } from '../store/useStore';

const COLORS = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  blue: '#246BCE',
  blueSoft: '#EAF2FF',
};

type FamilyPerson = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  pin?: string;
  isSelf?: boolean;
};

const emptyForm = {
  firstName: '',
  lastName: '',
  relationship: '',
  pin: '',
  specialId: '',
};

export default function FamilyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ add?: string; person?: string }>();
  const masterProfile = useStore((state) => state.masterProfile);
  const beneficiaries = useStore((state) => state.beneficiaries);
  const addBeneficiary = useStore((state) => state.addBeneficiary);
  const updateBeneficiary = useStore((state) => state.updateBeneficiary);
  const setActivePatient = useStore((state) => state.setActivePatient);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const [showQr, setShowQr] = useState(false);

  const selfPerson = useMemo<FamilyPerson>(() => ({
    id: 'self',
    firstName: masterProfile.firstName || 'Juan',
    lastName: masterProfile.lastName || 'Dela Cruz',
    relationship: 'My profile',
    pin: masterProfile.philhealthId,
    isSelf: true,
  }), [masterProfile.firstName, masterProfile.lastName, masterProfile.philhealthId]);

  const familyPeople = useMemo<FamilyPerson[]>(() => [selfPerson, ...beneficiaries], [selfPerson, beneficiaries]);

  useEffect(() => {
    if (params.add === '1') {
      setEditingId(null);
      setForm(emptyForm);
      setFormError('');
      setFormOpen(true);
    }
  }, [params.add]);

  useEffect(() => {
    if (!params.person) return;
    const person = familyPeople.find((item) => item.id === params.person);
    if (person) {
      setSelectedPerson(person);
      setShowQr(false);
    }
  }, [familyPeople, params.person]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (beneficiary: Beneficiary) => {
    setEditingId(beneficiary.id);
    setForm({
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      relationship: beneficiary.relationship,
      pin: beneficiary.pin || '',
      specialId: beneficiary.specialId || '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const saveBeneficiary = () => {
    const values = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      relationship: form.relationship.trim(),
      pin: form.pin.trim(),
      specialId: form.specialId.trim(),
    };

    if (!values.firstName || !values.lastName || !values.relationship || !values.pin) {
      setFormError('Please complete the name, relationship, and PhilHealth PIN.');
      return;
    }

    if (editingId) {
      updateBeneficiary(editingId, values);
    } else {
      addBeneficiary({
        id: `beneficiary-${Date.now()}`,
        ...values,
        verificationStatus: 'needs_information',
        profileSource: 'manual',
      });
    }

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const openQrConfirmation = (person: FamilyPerson) => {
    setSelectedPerson(person);
    setShowQr(false);
  };

  const closeQr = () => {
    setSelectedPerson(null);
    setShowQr(false);
  };

  const qrValue = selectedPerson
    ? `alalay://admission-profile/demo-${selectedPerson.id}`
    : 'alalay://admission-profile';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BENEFICIARIES</Text>
            <Text style={styles.title}>Family</Text>
            <Text style={styles.subtitle}>Manage the people you assist during admission.</Text>
          </View>
          <TouchableOpacity
            style={styles.addHeaderButton}
            onPress={openAddForm}
            accessibilityRole="button"
            accessibilityLabel="Add beneficiary"
          >
            <Plus color="#FFFFFF" size={23} />
          </TouchableOpacity>
        </View>

        <View style={styles.careBanner}>
          <View style={styles.careIcon}><UsersRound color={COLORS.primary} size={23} /></View>
          <View style={styles.careCopy}>
            <Text style={styles.careTitle}>Caregiver-friendly admission</Text>
            <Text style={styles.careText}>Prepare details for a child, parent, or anyone you assist—then select the correct person before showing a QR.</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Managed profiles</Text>
          <Text style={styles.profileCount}>{familyPeople.length} {familyPeople.length === 1 ? 'profile' : 'profiles'}</Text>
        </View>

        <View style={styles.personList}>
          <View style={styles.personCard}>
            <View style={styles.personMain}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{selfPerson.firstName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.personCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.personName}>{selfPerson.firstName} {selfPerson.lastName}</Text>
                  <View style={styles.youBadge}><Text style={styles.youBadgeText}>YOU</Text></View>
                </View>
                <Text style={styles.relationship}>My pre-admission profile</Text>
                <View style={styles.statusRow}>
                  {selfPerson.pin ? <CheckCircle2 color={COLORS.primary} size={14} /> : <UserRound color={COLORS.muted} size={14} />}
                  <Text style={[styles.statusText, !selfPerson.pin && styles.statusTextMuted]}>{selfPerson.pin ? 'Admission QR ready' : 'Complete profile to enable QR'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/profile' as Href)} accessibilityRole="button">
                <Text style={styles.secondaryActionText}>View details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.qrAction, !selfPerson.pin && styles.actionDisabled]}
                onPress={() => openQrConfirmation(selfPerson)}
                disabled={!selfPerson.pin}
                accessibilityRole="button"
              >
                <QrCodeIcon color="#FFFFFF" size={18} />
                <Text style={styles.qrActionText}>View QR</Text>
              </TouchableOpacity>
            </View>
          </View>

          {beneficiaries.map((beneficiary, index) => {
            const status = beneficiary.verificationStatus === 'verified'
              ? 'Verified dependent'
              : beneficiary.verificationStatus === 'pending_confirmation'
                ? 'Pending their confirmation'
                : beneficiary.pin
                  ? 'Admission QR ready'
                  : 'Needs more information';
            const hasReadyProfile = Boolean(beneficiary.pin);

            return (
            <View style={styles.personCard} key={beneficiary.id}>
              <View style={styles.personMain}>
                <View style={[styles.avatar, index % 2 === 0 && styles.avatarBlue]}>
                  <Text style={[styles.avatarText, index % 2 === 0 && styles.avatarTextBlue]}>{beneficiary.firstName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.personCopy}>
                  <Text style={styles.personName}>{beneficiary.firstName} {beneficiary.lastName}</Text>
                  <Text style={styles.relationship}>{beneficiary.relationship}{beneficiary.dateOfBirth ? ` · ${beneficiary.dateOfBirth}` : ''}</Text>
                  <View style={styles.statusRow}>
                    {beneficiary.verificationStatus === 'verified' ? <CheckCircle2 color={COLORS.primary} size={14} /> : <UserRound color={COLORS.muted} size={14} />}
                    <Text style={[styles.statusText, beneficiary.verificationStatus !== 'verified' && styles.statusTextMuted]}>{status}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditForm(beneficiary)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${beneficiary.firstName}`}
                >
                  <Edit3 color={COLORS.muted} size={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => {
                    setActivePatient(beneficiary.id);
                    router.push(`/family-profile?person=${beneficiary.id}` as Href);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryActionText}>View profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qrAction, !hasReadyProfile && styles.actionDisabled]}
                  onPress={() => openQrConfirmation(beneficiary)}
                  disabled={!hasReadyProfile}
                  accessibilityRole="button"
                >
                  <QrCodeIcon color="#FFFFFF" size={18} />
                  <Text style={styles.qrActionText}>View QR</Text>
                </TouchableOpacity>
              </View>
            </View>
            );
          })}

          <TouchableOpacity style={styles.addCard} onPress={openAddForm} activeOpacity={0.8}>
            <View style={styles.addCardIcon}><Plus color={COLORS.primary} size={24} /></View>
            <View style={styles.addCardCopy}>
              <Text style={styles.addCardTitle}>Add a beneficiary</Text>
              <Text style={styles.addCardText}>Create a profile for someone you help.</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyCard}>
          <ShieldCheck color={COLORS.primary} size={20} />
          <Text style={styles.privacyText}>A QR is shown only after you confirm the selected person's name. Hospital sharing still requires your consent.</Text>
        </View>
      </ScrollView>

      <AppBottomNav active="family" />

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setFormOpen(false)} />
          <View style={styles.formSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingId ? 'Edit beneficiary' : 'Add beneficiary'}</Text>
                <Text style={styles.modalSubtitle}>Use the details the hospital will verify.</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setFormOpen(false)} accessibilityLabel="Close">
                <X color={COLORS.muted} size={21} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>First name</Text>
              <TextInput style={styles.input} value={form.firstName} onChangeText={(firstName) => setForm((current) => ({ ...current, firstName }))} placeholder="Maria" placeholderTextColor="#91A29E" />
              <Text style={styles.inputLabel}>Last name</Text>
              <TextInput style={styles.input} value={form.lastName} onChangeText={(lastName) => setForm((current) => ({ ...current, lastName }))} placeholder="Santos" placeholderTextColor="#91A29E" />
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput style={styles.input} value={form.relationship} onChangeText={(relationship) => setForm((current) => ({ ...current, relationship }))} placeholder="Mother, child, spouse" placeholderTextColor="#91A29E" />
              <Text style={styles.inputLabel}>PhilHealth PIN</Text>
              <TextInput style={styles.input} value={form.pin} onChangeText={(pin) => setForm((current) => ({ ...current, pin }))} placeholder="1234-5678-9012" placeholderTextColor="#91A29E" keyboardType="numeric" />
              <Text style={styles.inputLabel}>PWD / Senior ID <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput style={styles.input} value={form.specialId} onChangeText={(specialId) => setForm((current) => ({ ...current, specialId }))} placeholder="ID number" placeholderTextColor="#91A29E" />

              {!!formError && <Text style={styles.formError}>{formError}</Text>}
              <TouchableOpacity style={styles.saveButton} onPress={saveBeneficiary} accessibilityRole="button">
                <Text style={styles.saveButtonText}>{editingId ? 'Save changes' : 'Add beneficiary'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={Boolean(selectedPerson)} transparent animationType="fade" onRequestClose={closeQr}>
        <View style={styles.qrModalRoot}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeQr} />
          <View style={styles.qrSheet}>
            <TouchableOpacity style={styles.closeButtonQr} onPress={closeQr} accessibilityLabel="Close QR">
              <X color={COLORS.muted} size={21} />
            </TouchableOpacity>

            {!showQr ? (
              <>
                <View style={styles.confirmIcon}><UserRound color={COLORS.primary} size={30} /></View>
                <Text style={styles.confirmEyebrow}>CONFIRM PATIENT</Text>
                <Text style={styles.confirmTitle}>Show {selectedPerson?.firstName} {selectedPerson?.lastName}’s admission QR?</Text>
                <Text style={styles.confirmText}>Check the name carefully before presenting this screen at the hospital.</Text>
                <View style={styles.confirmPerson}>
                  <Text style={styles.confirmPersonName}>{selectedPerson?.firstName} {selectedPerson?.lastName}</Text>
                  <Text style={styles.confirmPersonRelationship}>{selectedPerson?.relationship}</Text>
                </View>
                <TouchableOpacity style={styles.showQrButton} onPress={() => setShowQr(true)}>
                  <QrCodeIcon color="#FFFFFF" size={20} />
                  <Text style={styles.showQrButtonText}>Yes, show this QR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelQrButton} onPress={closeQr}>
                  <Text style={styles.cancelQrText}>Choose someone else</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.qrReadyBadge}>
                  <CheckCircle2 color={COLORS.primary} size={15} />
                  <Text style={styles.qrReadyText}>PATIENT CONFIRMED</Text>
                </View>
                <Text style={styles.qrTitle}>{selectedPerson?.firstName} {selectedPerson?.lastName}</Text>
                <Text style={styles.qrRelationship}>{selectedPerson?.relationship}</Text>
                <View style={styles.qrCodeCard}>
                  <QRCode value={qrValue} size={196} color={COLORS.navy} backgroundColor="#FFFFFF" />
                </View>
                <Text style={styles.qrInstruction}>Present this demo QR only to the hospital admission desk.</Text>
                <View style={styles.qrPrivacyRow}>
                  <ShieldCheck color={COLORS.primary} size={18} />
                  <Text style={styles.qrPrivacyText}>The hospital must still request and receive consent before accessing profile data.</Text>
                </View>
                <TouchableOpacity style={styles.doneButton} onPress={closeQr}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 21 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, color: COLORS.primary, marginBottom: 5 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 28, color: COLORS.ink },
  subtitle: { maxWidth: 290, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: COLORS.muted, marginTop: 4 },
  addHeaderButton: { width: 48, height: 48, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  careBanner: { flexDirection: 'row', gap: 13, backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: '#CBE9E2', borderRadius: 20, padding: 16, marginBottom: 27 },
  careIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  careCopy: { flex: 1 },
  careTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink, marginBottom: 4 },
  careText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: COLORS.muted },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink },
  profileCount: { fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.muted },
  personList: { gap: 12 },
  personCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 21, padding: 16 },
  personMain: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 51, height: 51, borderRadius: 17, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarBlue: { backgroundColor: COLORS.blueSoft },
  avatarText: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.primary },
  avatarTextBlue: { color: COLORS.blue },
  personCopy: { flex: 1, marginLeft: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  personName: { flexShrink: 1, fontFamily: 'Sora_600SemiBold', fontSize: 15, color: COLORS.ink },
  youBadge: { backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  youBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.8, color: COLORS.primary },
  relationship: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.primary },
  statusTextMuted: { color: COLORS.muted },
  editButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F4', alignItems: 'center', justifyContent: 'center', marginLeft: 7 },
  cardActions: { flexDirection: 'row', gap: 9, marginTop: 15 },
  secondaryAction: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: COLORS.line, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  secondaryActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.primary },
  qrAction: { flex: 1.25, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.primary, borderRadius: 13 },
  qrActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  actionDisabled: { backgroundColor: '#A8BBB6' },
  addCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FBFA', borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9D4CD', borderRadius: 20, padding: 15 },
  addCardIcon: { width: 47, height: 47, borderRadius: 16, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  addCardCopy: { flex: 1, marginLeft: 13 },
  addCardTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.primary },
  addCardText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.muted, marginTop: 3 },
  privacyCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginTop: 22 },
  privacyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15, 38, 47, 0.55)' },
  formSheet: { maxHeight: '88%', backgroundColor: COLORS.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 28 : 20 },
  sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#C8D6D2', marginTop: 10, marginBottom: 15 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  modalTitle: { fontFamily: 'Sora_700Bold', fontSize: 20, color: COLORS.ink },
  modalSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 3 },
  closeButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#E8EFED', alignItems: 'center', justifyContent: 'center' },
  formContent: { paddingTop: 17, paddingBottom: 8 },
  inputLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.ink, marginBottom: 7 },
  optional: { fontFamily: 'Inter_400Regular', color: COLORS.muted },
  input: { height: 49, borderRadius: 14, borderWidth: 1, borderColor: '#D4E1DD', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.ink, marginBottom: 14 },
  formError: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, color: '#B33A3A', backgroundColor: '#FFF0F0', borderRadius: 10, padding: 10, marginBottom: 12 },
  saveButton: { minHeight: 51, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 2 },
  saveButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },

  qrModalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  qrSheet: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, paddingHorizontal: 23, paddingTop: 28, paddingBottom: 23 },
  closeButtonQr: { position: 'absolute', top: 14, right: 14, width: 38, height: 38, borderRadius: 14, backgroundColor: '#F0F4F3', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  confirmIcon: { width: 66, height: 66, borderRadius: 22, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  confirmEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.5, color: COLORS.primary, marginBottom: 7 },
  confirmTitle: { maxWidth: 340, fontFamily: 'Sora_700Bold', fontSize: 21, lineHeight: 28, color: COLORS.ink, textAlign: 'center' },
  confirmText: { maxWidth: 330, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  confirmPerson: { width: '100%', backgroundColor: COLORS.background, borderRadius: 16, padding: 14, alignItems: 'center', marginVertical: 18 },
  confirmPersonName: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: COLORS.ink },
  confirmPersonRelationship: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 3 },
  showQrButton: { width: '100%', minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 15 },
  showQrButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  cancelQrButton: { padding: 14 },
  cancelQrText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.muted },
  qrReadyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12 },
  qrReadyText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1, color: COLORS.primary },
  qrTitle: { fontFamily: 'Sora_700Bold', fontSize: 22, color: COLORS.ink },
  qrRelationship: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 3 },
  qrCodeCard: { padding: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, marginVertical: 18 },
  qrInstruction: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.ink, textAlign: 'center' },
  qrPrivacyRow: { width: '100%', flexDirection: 'row', gap: 9, backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 12, marginTop: 15 },
  qrPrivacyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted },
  doneButton: { width: '100%', minHeight: 49, backgroundColor: COLORS.navy, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  doneButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#FFFFFF' },
});
