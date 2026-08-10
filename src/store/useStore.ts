import { create } from 'zustand';

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  pin?: string;
  specialId?: string;
}

// 1. Define Types based on Schema
export interface MasterProfileState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  civilStatus: string;
  address: { street: string; city: string; region: string };
  contactNumber: string;
  philhealthId: string;
  memberCategory: string;
  bloodType: string;
  knownAllergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  emergencyContact: { name: string; relationship: string; phone: string };
  hmoName: string;
  hmoPolicyNumber: string;
  secondaryIdPhotoUrl: string;
}

export interface VisitLogState {
  hospitalName: string;
  deskName: string;
  modeOfAdmission: 'ER' | 'OPD' | 'Transfer';
  visitNote: string;
  matchCode: string;
  status: 'pending' | 'matched' | 'completed';
  dataSharingConsent: boolean;
}

interface AdmissionStore {
  // Application State
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
  
  // Data State
  masterProfile: MasterProfileState;
  visitLog: VisitLogState;
  beneficiaries: Beneficiary[];
  
  // Actions
  updateMasterProfile: (data: Partial<MasterProfileState>) => void;
  updateVisitLog: (data: Partial<VisitLogState>) => void;
  addBeneficiary: (b: Beneficiary) => void;
  updateBeneficiary: (id: string, data: Partial<Beneficiary>) => void;
  logout: () => void;
}

const initialMasterProfile: MasterProfileState = {
  firstName: '', lastName: '', dateOfBirth: '', sex: '', civilStatus: '',
  address: { street: '', city: '', region: '' }, contactNumber: '',
  philhealthId: '', memberCategory: '', bloodType: '', knownAllergies: [],
  currentMedications: [], chronicConditions: [],
  emergencyContact: { name: '', relationship: '', phone: '' },
  hmoName: '', hmoPolicyNumber: '', secondaryIdPhotoUrl: ''
};

const initialVisitLog: VisitLogState = {
  hospitalName: '', deskName: '', modeOfAdmission: 'ER', visitNote: '',
  matchCode: '', status: 'pending', dataSharingConsent: false
};

// 2. Create Store
export const useStore = create<AdmissionStore>((set) => ({
  hasOnboarded: false,
  setHasOnboarded: (val) => set({ hasOnboarded: val }),
  
  masterProfile: initialMasterProfile,
  visitLog: initialVisitLog,
  beneficiaries: [],
  
  updateMasterProfile: (data) => set((state) => ({
    masterProfile: { ...state.masterProfile, ...data }
  })),
  
  updateVisitLog: (data) => set((state) => ({
    visitLog: { ...state.visitLog, ...data }
  })),

  addBeneficiary: (b) => set((state) => ({
    beneficiaries: [...state.beneficiaries, b]
  })),

  updateBeneficiary: (id, data) => set((state) => ({
    beneficiaries: state.beneficiaries.map((beneficiary) => (
      beneficiary.id === id ? { ...beneficiary, ...data } : beneficiary
    ))
  })),
  
  logout: () => set({ 
    hasOnboarded: false,
    masterProfile: initialMasterProfile, 
    visitLog: initialVisitLog,
    beneficiaries: []
  })
}));
