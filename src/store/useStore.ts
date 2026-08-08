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
  address: { street: string; city: string; region: string };
  contactNumber: string;
  philhealthId: string;
  bloodType: string;
  knownAllergies: string[];
  chronicConditions: string[];
}

export interface VisitLogState {
  chiefComplaint: string;
  admissionType: string;
  emergencyContact: { name: string; relationship: string; phone: string };
  roomPreference: string;
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
  logout: () => void;
}

const initialMasterProfile: MasterProfileState = {
  firstName: '', lastName: '', dateOfBirth: '', sex: '', 
  address: { street: '', city: '', region: '' }, contactNumber: '',
  philhealthId: '', bloodType: '', knownAllergies: [], chronicConditions: []
};

const initialVisitLog: VisitLogState = {
  chiefComplaint: '', admissionType: 'Emergency', 
  emergencyContact: { name: '', relationship: '', phone: '' }, 
  roomPreference: 'Ward', dataSharingConsent: false
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
  
  logout: () => set({ 
    hasOnboarded: false,
    masterProfile: initialMasterProfile, 
    visitLog: initialVisitLog,
    beneficiaries: []
  })
}));
