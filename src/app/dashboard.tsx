import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight, FileText, Fingerprint, FolderHeart, Home, Pill, Plus, QrCode, Settings, X, Camera } from 'lucide-react-native';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const masterProfile = useStore(state => state.masterProfile);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {masterProfile.firstName || 'Juan'}</Text>
            <Text style={styles.subGreeting}>Your Health Vault is Secure</Text>
          </View>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
            style={styles.avatar} 
          />
        </View>


        {/* PhilSys Integration */}
        <View style={styles.philsysContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1}}>
            <Fingerprint color="#A0AEC0" size={24} />
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.philsysTitle}>Biometric Link (PhilSys)</Text>
                <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>COMING SOON</Text></View>
              </View>
              <Text style={styles.philsysSub}>Link National ID for verification</Text>
            </View>
          </View>
          <View style={styles.toggleTrack}>
            <View style={styles.toggleThumb} />
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All {'>'}</Text></TouchableOpacity>
        </View>

        <View style={styles.documentsList}>
          {/* Doc 1 */}
          <TouchableOpacity style={styles.docCard} onPress={() => router.push('/bill')}>
            <View style={[styles.docIconBox, { backgroundColor: '#E6FFFA' }]}>
              <FileText color="#319795" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>AI Bill Analysis</Text>
              <Text style={styles.docSub}>St. Luke's Medical Center</Text>
            </View>
            <View style={styles.docRight}>
              <Text style={styles.docDate}>OCT 12</Text>
              <ChevronRight color="#CBD5E0" size={16} />
            </View>
          </TouchableOpacity>

          {/* Doc 2 */}
          <TouchableOpacity style={styles.docCard} onPress={() => router.push('/document')}>
            <View style={[styles.docIconBox, { backgroundColor: '#EBF8FF' }]}>
              <FileText color="#3182CE" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Lab Results Translation</Text>
              <Text style={styles.docSub}>Makati Medical Center</Text>
            </View>
            <View style={styles.docRight}>
              <Text style={styles.docDate}>SEP 28</Text>
              <ChevronRight color="#CBD5E0" size={16} />
            </View>
          </TouchableOpacity>

          {/* Doc 3 */}
          <TouchableOpacity style={styles.docCard}>
            <View style={[styles.docIconBox, { backgroundColor: '#FFFAF0' }]}>
              <Pill color="#DD6B20" size={20} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Prescription Record</Text>
              <Text style={styles.docSub}>The Medical City</Text>
            </View>
            <View style={styles.docRight}>
              <Text style={styles.docDate}>AUG 15</Text>
              <ChevronRight color="#CBD5E0" size={16} />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Home color="#FFFFFF" size={24} />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FolderHeart color="#A0AEC0" size={24} />
            <Text style={[styles.navText, { color: '#A0AEC0' }]}>Vault</Text>
          </TouchableOpacity>
          {/* Action Menu overlay */}
          {showMenu && (
            <View style={styles.actionMenu}>
              <TouchableOpacity style={styles.actionMenuItem} onPress={() => { setShowMenu(false); router.push('/scan-doc'); }}>
                <View style={styles.actionMenuIcon}><Camera color="#007AFF" size={20} /></View>
                <Text style={styles.actionMenuText}>Scan Medical Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionMenuItem} onPress={() => { setShowMenu(false); router.push('/qr'); }}>
                <View style={styles.actionMenuIcon}><QrCode color="#007AFF" size={20} /></View>
                <Text style={styles.actionMenuText}>Scan Hospital QR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FAB Action */}
          <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fab} onPress={() => setShowMenu(!showMenu)}>
              {showMenu ? <X color="#FFFFFF" size={24} /> : <Plus color="#FFFFFF" size={24} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navItem}>
            <Building2 color="#A0AEC0" size={24} />
            <Text style={[styles.navText, { color: '#A0AEC0' }]}>Clinics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Settings color="#A0AEC0" size={24} />
            <Text style={[styles.navText, { color: '#A0AEC0' }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greeting: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#1A202C', marginBottom: 4 },
  subGreeting: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#718096' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0' },


  reasonSection: { marginBottom: 24 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#A0AEC0', letterSpacing: 1, marginBottom: 12 },
  inputContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2D3748' },

  philsysContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  philsysTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#4A5568' },
  comingSoonBadge: { backgroundColor: '#F7FAFC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  comingSoonText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#A0AEC0', letterSpacing: 0.5 },
  philsysSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  toggleTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#EDF2F7', justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#2D3748' },
  seeAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#3182CE' },

  documentsList: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  docCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  docIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  docInfo: { flex: 1 },
  docTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#2D3748', marginBottom: 4 },
  docSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#A0AEC0' },
  docRight: { alignItems: 'flex-end', justifyContent: 'center' },
  docDate: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#A0AEC0', marginBottom: 8, letterSpacing: 0.5 },

  bottomNavContainer: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  bottomNav: { 
    backgroundColor: '#1A202C', 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingVertical: 2,
    shadowColor: '#1A202C', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#FFFFFF' },
  
  actionMenu: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    width: 240,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 12,
  },
  actionMenuIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center'
  },
  actionMenuText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2D3748'
  },
  fabContainer: { position: 'relative', top: -16, alignItems: 'center', justifyContent: 'center' },
  fab: { 
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#3182CE', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 6, borderColor: '#F7FAFC',
    shadowColor: '#3182CE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
  }
});
