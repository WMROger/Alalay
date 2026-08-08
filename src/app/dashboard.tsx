import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { QrCode, HeartPulse, BrainCircuit, FileText, Users, FileHeart, UserCircle2, LogOut } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  const beneficiaries = useStore(state => state.beneficiaries);
  const addBeneficiary = useStore(state => state.addBeneficiary);
  const logout = useStore(state => state.logout);
  const hasOnboarded = useStore(state => state.hasOnboarded);

  const [modalVisible, setModalVisible] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRel, setNewRel] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newSpecialId, setNewSpecialId] = useState('');

  if (!hasOnboarded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No profile found. Please complete onboarding.</Text>
      </SafeAreaView>
    );
  }

  const initials = masterProfile.firstName && masterProfile.lastName
    ? `${masterProfile.firstName.charAt(0)}${masterProfile.lastName.charAt(0)}`.toUpperCase()
    : 'ME';

  const handleAddBeneficiary = () => {
    if (!newFirstName || !newLastName || !newRel || !newPin) return;
    addBeneficiary({
      id: Math.random().toString(),
      firstName: newFirstName,
      lastName: newLastName,
      relationship: newRel,
      pin: newPin,
      specialId: newSpecialId
    });
    setModalVisible(false);
    setNewFirstName('');
    setNewLastName('');
    setNewRel('');
    setNewPin('');
    setNewSpecialId('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BLUE HEADER */}
      <View style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{masterProfile.firstName || 'User'}!</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity onPress={() => { logout(); router.replace('/login'); }}>
              <LogOut size={24} color="#FFFFFF" opacity={0.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FLOATING ACTION ROW */}
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/admission')}>
            <View style={styles.iconCircle}>
              <HeartPulse size={28} color="#007AFF" />
            </View>
            <Text style={styles.primaryActionTitle}>New Admission</Text>
            <Text style={styles.primaryActionSub}>Fast-track ER forms</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/ai-reader')}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0F0FF' }]}>
              <BrainCircuit size={28} color="#5E5CE6" />
            </View>
            <Text style={styles.primaryActionTitle}>AI Reader</Text>
            <Text style={styles.primaryActionSub}>Explain my bills</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}>
        
        {/* CORE ACTIONS GRID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Documents</Text>
          <View style={styles.grid}>
            
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/reference`)}>
              <View style={[styles.gridIcon, { backgroundColor: '#E5F1FF' }]}>
                <FileText size={24} color="#007AFF" />
              </View>
              <Text style={styles.gridText}>Master{'\n'}Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/reference`)}>
              <View style={[styles.gridIcon, { backgroundColor: '#E6F4EA' }]}>
                <FileHeart size={24} color="#34C759" />
              </View>
              <Text style={styles.gridText}>PhilHealth{'\n'}CF1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/reference`)}>
              <View style={[styles.gridIcon, { backgroundColor: '#FDF1E5' }]}>
                <Users size={24} color="#FF9500" />
              </View>
              <Text style={styles.gridText}>Bereavement{'\n'}LCR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/qr`)}>
              <View style={[styles.gridIcon, { backgroundColor: '#F2F2F7' }]}>
                <QrCode size={24} color="#8E8E93" />
              </View>
              <Text style={styles.gridText}>My QR{'\n'}Token</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* BENEFICIARIES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficiaries</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleScroll}>
            
            <TouchableOpacity style={styles.personCard} onPress={() => router.push(`/reference`)}>
              <View style={[styles.personAvatar, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.personInitials}>{initials}</Text>
              </View>
              <Text style={styles.personName}>Me</Text>
            </TouchableOpacity>

            {beneficiaries.map(b => (
              <TouchableOpacity key={b.id} style={styles.personCard}>
                <View style={[styles.personAvatar, { backgroundColor: '#FF9500' }]}>
                  <Text style={styles.personInitials}>
                    {b.firstName.charAt(0)}{b.lastName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.personName}>{b.firstName}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.personCard} onPress={() => setModalVisible(true)}>
              <View style={[styles.personAvatar, { backgroundColor: '#E5E5EA' }]}>
                <UserCircle2 size={24} color="#8E8E93" />
              </View>
              <Text style={styles.personName}>Add New</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

      </ScrollView>

      {/* ADD BENEFICIARY MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Beneficiary</Text>
            
            <TextInput style={styles.input} placeholder="First Name" value={newFirstName} onChangeText={setNewFirstName} />
            <TextInput style={styles.input} placeholder="Last Name" value={newLastName} onChangeText={setNewLastName} />
            <TextInput style={styles.input} placeholder="Relationship (e.g. Spouse, Child)" value={newRel} onChangeText={setNewRel} />
            <TextInput style={styles.input} placeholder="PhilHealth PIN" value={newPin} onChangeText={setNewPin} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="PWD / Senior Citizen ID (Optional)" value={newSpecialId} onChangeText={setNewSpecialId} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddBeneficiary}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  title: { padding: 24, fontSize: 16, fontFamily: 'Inter_400Regular' },
  headerBackground: { 
    backgroundColor: '#007AFF', 
    paddingTop: 60, 
    paddingHorizontal: 24,
    paddingBottom: 80,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 1,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  name: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#FFFFFF', marginTop: 4 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#007AFF' },
  
  floatingActions: {
    position: 'absolute',
    bottom: -60, // Overlap the bottom of the blue header
    left: 24, right: 24,
    flexDirection: 'row',
    gap: 16,
  },
  primaryAction: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5F1FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  primaryActionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#000000', marginBottom: 4 },
  primaryActionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8E8E93' },

  scrollContent: { flex: 1, zIndex: 0, marginTop: 220 }, // Margin to clear the header
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#000000', marginBottom: 16 },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  gridItem: { alignItems: 'center', width: '20%' },
  gridIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#000000', textAlign: 'center' },

  peopleScroll: { gap: 16 },
  personCard: { alignItems: 'center', width: 72 },
  personAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  personInitials: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#FFFFFF' },
  personName: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#000000' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 },
  modalTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 20, color: '#000000', marginBottom: 24 },
  input: {
    backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16,
    fontFamily: 'Inter_400Regular', fontSize: 16, color: '#000000', marginBottom: 12
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#8E8E93' },
  saveButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
});
