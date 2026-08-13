import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  pin?: string;
  specialId?: string;
  dateOfBirth?: string;
  sex?: string;
  contactNumber?: string;
  knownAllergies?: string[];
  currentMedications?: string[];
  chronicConditions?: string[];
  emergencyContact?: { name: string; relationship: string; phone: string };
  prescriptionPhotoUrl?: string;
  verificationStatus?: 'verified' | 'pending_confirmation' | 'needs_information';
  profileSource?: 'egov' | 'mdr' | 'manual' | 'demo';
}

export interface NotificationPreferences {
  healthOpportunitiesEnabled: boolean;
  seniorWellness: boolean;
  philhealthPrograms: boolean;
  vaccinations: boolean;
  localHealthServices: boolean;
}

export type DocumentVerificationStatus = 'verified' | 'pending' | 'self_declared';
export type PatientDocumentType = 'government_id' | 'prescription' | 'medical_abstract' | 'generated_reference';

export interface PatientDocumentState {
  id: string;
  patientId: string;
  type: PatientDocumentType;
  title: string;
  status: DocumentVerificationStatus;
  source: string;
  uri: string;
  addedAt: string;
}

export type AdmissionStepId =
  | 'check_in'
  | 'room_assignment'
  | 'consent_billing'
  | 'philhealth_eligibility';

export type AdmissionStepStatus = 'done' | 'current' | 'pending';

export interface AdmissionStepState {
  id: AdmissionStepId;
  title: string;
  status: AdmissionStepStatus;
  location: string;
  guidance: string;
  updatedAt: string;
}

export interface VisitContactState {
  name: string;
  relationship: string;
  phone: string;
}

export interface PendingActionState {
  id: string;
  patientId: string;
  kind: 'missing_senior_id' | 'dependent_confirmation' | 'profile_detail';
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'dismissed';
  route: string;
  createdAt: string;
}

export interface HospitalSessionState {
  isAuthenticated: boolean;
  hospitalName: string;
  facilityId: string;
  philhealthAccreditation: string;
  dohFacilityId: string;
  staffName: string;
  email: string;
  role: string;
  verificationStatus: 'verified' | 'pending_review';
  accountMode: 'demo' | 'sign_in' | 'sign_up';
}

export const createInitialAdmissionSteps = (): AdmissionStepState[] => [
  {
    id: 'check_in',
    title: 'Check-In',
    status: 'done',
    location: 'Admission desk',
    guidance: 'Your hospital check-in was received.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_assignment',
    title: 'Room Assignment',
    status: 'pending',
    location: 'Ask the admission desk',
    guidance: 'Hospital staff will update this when a room or care area is assigned.',
    updatedAt: '',
  },
  {
    id: 'consent_billing',
    title: 'Consent & Billing Arrangement',
    status: 'current',
    location: 'Admitting Section, ground floor',
    guidance: 'Please review the consent forms and arrange billing with the Admitting Section.',
    updatedAt: '',
  },
  {
    id: 'philhealth_eligibility',
    title: 'PhilHealth Eligibility Confirmation',
    status: 'pending',
    location: 'PhilHealth or billing desk',
    guidance: 'The hospital will confirm the member or dependent eligibility presented for this visit.',
    updatedAt: '',
  },
];

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
  identitySource: 'egov' | 'mdr' | 'manual' | 'demo' | '';
  notificationPreferences: NotificationPreferences;
}

export interface VisitLogState {
  hospitalName: string;
  deskName: string;
  modeOfAdmission: 'ER' | 'OPD' | 'Transfer';
  visitNote: string;
  matchCode: string;
  status: 'pending' | 'matched' | 'completed';
  dataSharingConsent: boolean;
  supportsLiveStatus: boolean;
  checkedInAt: string;
  admissionSteps: AdmissionStepState[];
  patientId: string;
  patientName: string;
  patientRelationship: string;
  patientDateOfBirth: string;
  patientSex: string;
  patientPin: string;
  patientContactNumber: string;
  patientAllergies: string[];
  patientMedications: string[];
  patientConditions: string[];
  patientPrescriptionPhotoUrl: string;
  savedEmergencyContact: VisitContactState;
  visitEmergencyContact: VisitContactState | null;
  seniorIdAvailable: boolean | null;
  consentAcknowledgedAt: string;
  consentAcknowledgedBy: string;
  generatedDocuments: string[];
  documentsGeneratedAt: string;
}

interface AdmissionStore {
  // Application State
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
  
  // Data State
  masterProfile: MasterProfileState;
  visitLog: VisitLogState;
  beneficiaries: Beneficiary[];
  activePatientId: string;
  pendingActions: PendingActionState[];
  documents: PatientDocumentState[];
  hospitalSession: HospitalSessionState;
  
  // Actions
  updateMasterProfile: (data: Partial<MasterProfileState>) => void;
  updateVisitLog: (data: Partial<VisitLogState>) => void;
  setActivePatient: (id: string) => void;
  addPendingAction: (action: PendingActionState) => void;
  updatePendingAction: (id: string, status: PendingActionState['status']) => void;
  addDocument: (document: PatientDocumentState) => void;
  setHospitalSession: (session: HospitalSessionState) => void;
  logoutHospital: () => void;
  updateAdmissionStep: (id: AdmissionStepId, status: AdmissionStepStatus) => void;
  addBeneficiary: (b: Beneficiary) => void;
  updateBeneficiary: (id: string, data: Partial<Beneficiary>) => void;
  logout: () => void;
  resetDemo: () => void;
}

const initialMasterProfile: MasterProfileState = {
  firstName: '', lastName: '', dateOfBirth: '', sex: '', civilStatus: '',
  address: { street: '', city: '', region: '' }, contactNumber: '',
  philhealthId: '', memberCategory: '', bloodType: '', knownAllergies: [],
  currentMedications: [], chronicConditions: [],
  emergencyContact: { name: '', relationship: '', phone: '' },
  hmoName: '', hmoPolicyNumber: '', secondaryIdPhotoUrl: '',
  identitySource: '',
  notificationPreferences: {
    healthOpportunitiesEnabled: false,
    seniorWellness: true,
    philhealthPrograms: true,
    vaccinations: true,
    localHealthServices: true,
  }
};

const initialVisitLog: VisitLogState = {
  hospitalName: '', deskName: '', modeOfAdmission: 'ER', visitNote: '',
  matchCode: '', status: 'pending', dataSharingConsent: false,
  supportsLiveStatus: false, checkedInAt: '', admissionSteps: [],
  patientId: '', patientName: '', patientRelationship: '', patientDateOfBirth: '',
  patientSex: '', patientPin: '', patientContactNumber: '', patientAllergies: [],
  patientMedications: [], patientConditions: [], patientPrescriptionPhotoUrl: '',
  savedEmergencyContact: { name: '', relationship: '', phone: '' },
  visitEmergencyContact: null, seniorIdAvailable: null,
  consentAcknowledgedAt: '', consentAcknowledgedBy: '',
  generatedDocuments: [], documentsGeneratedAt: '',
};

const initialHospitalSession: HospitalSessionState = {
  isAuthenticated: false,
  hospitalName: '',
  facilityId: '',
  philhealthAccreditation: '',
  dohFacilityId: '',
  staffName: '',
  email: '',
  role: '',
  verificationStatus: 'pending_review',
  accountMode: 'sign_in',
};

const memoryStorage = new Map<string, string>();

// AsyncStorage is unavailable in some web/native preview environments. Keep the
// pitch flow working there while still persisting normally on supported devices.
const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
        return globalThis.localStorage.getItem(name);
      }
      return await AsyncStorage.getItem(name);
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    memoryStorage.set(name, value);
    try {
      if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem(name, value);
        return;
      }
      await AsyncStorage.setItem(name, value);
    } catch {
      // The in-memory copy still keeps this preview session usable.
    }
  },
  removeItem: async (name) => {
    memoryStorage.delete(name);
    try {
      if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.removeItem(name);
        return;
      }
      await AsyncStorage.removeItem(name);
    } catch {
      // Nothing else is required for the in-memory fallback.
    }
  },
};

// 2. Create Store
export const useStore = create<AdmissionStore>()(persist((set) => ({
  hasOnboarded: false,
  setHasOnboarded: (val) => set({ hasOnboarded: val }),
  
  masterProfile: initialMasterProfile,
  visitLog: initialVisitLog,
  beneficiaries: [],
  activePatientId: 'self',
  pendingActions: [],
  documents: [],
  hospitalSession: initialHospitalSession,
  
  updateMasterProfile: (data) => set((state) => ({
    masterProfile: { ...state.masterProfile, ...data }
  })),
  
  updateVisitLog: (data) => set((state) => ({
    visitLog: { ...state.visitLog, ...data }
  })),

  setActivePatient: (id) => set({ activePatientId: id }),

  addPendingAction: (action) => set((state) => ({
    pendingActions: state.pendingActions.some((item) => item.id === action.id)
      ? state.pendingActions.map((item) => item.id === action.id ? action : item)
      : [...state.pendingActions, action],
  })),

  updatePendingAction: (id, status) => set((state) => ({
    pendingActions: state.pendingActions.map((item) => item.id === id ? { ...item, status } : item),
  })),

  addDocument: (document) => set((state) => ({
    documents: state.documents.some((item) => item.id === document.id)
      ? state.documents.map((item) => item.id === document.id ? document : item)
      : [document, ...state.documents],
  })),

  setHospitalSession: (hospitalSession) => set({ hospitalSession }),

  logoutHospital: () => set({ hospitalSession: initialHospitalSession }),

  updateAdmissionStep: (id, status) => set((state) => {
    const admissionSteps = state.visitLog.admissionSteps.map((step) => (
      step.id === id
        ? { ...step, status, updatedAt: new Date().toISOString() }
        : step
    ));
    const journeyComplete = admissionSteps.length > 0 && admissionSteps.every((step) => step.status === 'done');

    return {
      visitLog: {
        ...state.visitLog,
        admissionSteps,
        status: journeyComplete
          ? 'completed'
          : state.visitLog.status === 'completed'
            ? 'matched'
            : state.visitLog.status,
      }
    };
  }),

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
  }),

  resetDemo: () => set({
    hasOnboarded: false,
    masterProfile: initialMasterProfile,
    visitLog: initialVisitLog,
    beneficiaries: [],
    activePatientId: 'self',
    pendingActions: [],
    documents: [],
    hospitalSession: initialHospitalSession,
  })
}), {
  name: 'alalay-demo-state-v2',
  version: 2,
  storage: createJSONStorage(() => safeStorage),
  partialize: (state) => ({
    hasOnboarded: state.hasOnboarded,
    masterProfile: state.masterProfile,
    visitLog: state.visitLog,
    beneficiaries: state.beneficiaries,
    activePatientId: state.activePatientId,
    pendingActions: state.pendingActions,
    documents: state.documents,
    hospitalSession: state.hospitalSession,
  }),
}));
