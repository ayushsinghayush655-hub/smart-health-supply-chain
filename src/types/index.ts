export type UserRole = 'PHC_INCHARGE' | 'DISTRICT_MEDICAL_OFFICER' | 'GOVT_HOSPITAL' | 'DMO';

export interface UserSession {
  role: UserRole;
  name: string;
  designation?: string;
  facilityId: string;
  facilityName: string;
  areaType?: 'rural' | 'urban';
  storeId?: string;
  inchargeId?: string;
  attendanceIntervalMinutes?: number;
}

export interface PHCRecord {
  id: string;
  name: string;
  code: string;
  areaType: 'rural' | 'urban';
  storeId: string;
  inchargeId: string;
  inchargeName: string;
  contact: string;
  coordinates: { lat: number; lng: number };
  geofenceRadiusMeters: number;
  attendanceIntervalMinutes: number;
  lastAttendance?: {
    timestamp: string;
    photoUrl?: string;
    verifiedLocation: boolean;
    syncedOffline: boolean;
  };
}

export interface HospitalRecord {
  id: string;
  name: string;
  type: 'District Hospital' | 'Sub-Divisional Hospital' | 'Community Health Centre';
  coordinates: { lat: number; lng: number };
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  icuOccupied: number;
  ventilators: number;
  ventilatorsOccupied: number;
  ventilatorsTotal: number;
  ventilatorsOccupied: number;
  specialistRate: number;
  emergencyResponseMinutes: number;
  activeDoctors: number;
  totalDoctors: number;
  specialistsByDepartment?: Record<string, number>;
}

export interface MedicineStockItem {
  id: string;
  phcId: string;
  medicineName: string;
  genericName: string;
  category: 'Antibiotic' | 'Fluid/Electrolyte' | 'Analgesic' | 'Antimalarial' | 'Antidiabetic' | 'Emergency';
  availableStock: number;
  soldStock: number;
  deliveredStock: number;
  criticalThreshold: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  lastUpdated: string;
}

export interface LedgerExtractionItem {
  id: string;
  phcId: string;
  storeId: string;
  inchargeId: string;
  uploadMethod: 'photo' | 'excel' | 'barcode_scanner';
  rawIdentifier?: string;
  medicineName: string;
  batchNumber: string;
  quantitySold: number;
  dosage: string;
  patientToken?: string;
  timestamp: string;
  syncedOffline: boolean;
  status: 'verified' | 'flagged' | 'pending';
}

export interface StockTransferOrder {
  id: string;
  type: 'AI_REDISTRIBUTION' | 'UCP_ORDER' | 'INTER_PHC';
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  medicineName: string;
  quantity: number;
  unit: string;
  status: 'PENDING_APPROVAL' | 'DISPATCHED' | 'DELIVERED';
  reason: string;
  createdDate: string;
  dispatchedDate?: string;
  urgency: 'HIGH' | 'MEDIUM' | 'EMERGENCY';
}

export interface OutbreakThreat {
  id: string;
  threatType: 'FLOOD' | 'EPIDEMIC_SURGE' | 'HEAVY_RAINFALL' | 'VECTOR_OUTBREAK';
  sourceAgency: 'Epidemiology Centre' | 'CWC' | 'IMD' | 'NDMA';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  affectedZones: string[];
  description: string;
  suggestedMedicines: string[];
  issuedAt: string;
}

export interface PatientAdmission {
  id: string;
  hospitalId: string;
  patientName: string;
  age: number;
  gender: string;
  triagePriority: 'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE';
  department: 'General Medicine' | 'Pediatrics' | 'Cardiology' | 'Trauma & Emergency' | 'Infectious Diseases' | 'ICU';
  bedNumber: string;
  attendingDoctor: string;
  admittedAt: string;
  status: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED';
}

export interface MedPalmAnalysisResult {
  threatAssessment: {
    overallThreatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    primaryDiseases: string[];
    summary: string;
    vulnerablePHCs: string[];
  };
  medicineRequirements: Array<{
    medicineName: string;
    recommendedQuantity: number;
    unit: string;
    urgency: 'CRITICAL' | 'HIGH' | 'ROUTINE';
    clinicalRationale: string;
    recommendedSource: string;
  }>;
  logisticsActions: Array<{
    type: 'INTER_PHC_TRANSFER' | 'UCP_EMERGENCY_ORDER' | 'WAREHOUSE_DISPATCH';
    medicineName: string;
    quantity: number;
    unit: string;
    fromFacilityName: string;
    toFacilityName: string;
    priority: 'EMERGENCY' | 'HIGH';
    justification: string;
  }>;
  generatedAt: string;
}
