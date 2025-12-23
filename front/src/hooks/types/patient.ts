interface PatientInsurance {
  id: number;
  insuranceNumber: string;
  financialId: number;
  financialName: string;
  patientInsurance1Id: number;
  insuranceName1: string;
  patientInsurance2Id?: number;
  insuranceName2?: string;
}

export interface PatientEncounter {
  id: number;
  admitDate: Date;
  admitTime: string;
  dischargeDate?: null | Date;
  dischargeTime?: null | string;
  doctorId: number;
  patientTypeId: number;
  lengthOfStay?: number;
  patientDays?: number;
  roomTypeId: number;
  patientId: number;
}

interface PatientTypeSegment {
  id: number;
  patientEncounterId: number;
  patientTypeId: number;
  transferInDate: Date;
  transferInTime: string;
  transferOutDate?: Date | null;
  transferOutTime?: string | null;
}

export interface Patient {
  id: number;
  mrn: string;
  name: string;
  dob: string;
  gender: string;
  patientInsurances: PatientInsurance[];
}

export type CreateEncounter = Omit<PatientEncounter, "id">;

export interface PatientEncounterList extends PatientEncounter {
  patientName: string;
  doctorName: string;
  patientTypeSegments?: PatientTypeSegment[];
}

// export type PatientList = Omit<
//   Patient,
//   "patientInsurances" | "dob" | "gender" | "mrn"
// >;

export interface PatientSearchItem {
  id: number;
  name: string;
}

export interface PatientOption {
  value: number;
  label: string;
}
