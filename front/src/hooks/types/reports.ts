export interface BasePatientInfo {
  mrn: string;
  patientName: string;
  doctorName: string;
  dob: Date;
  age: number;
  financialClass: string;
}

export interface DailyCensus extends BasePatientInfo {
  admitDate: string;
  dischargeDate: string | null;
}

export interface Admission extends BasePatientInfo {
  admitDate: string;
  patientType: string;
}

export interface Discharge extends BasePatientInfo {
  dischargeDate: string;
  patientType: string;
}

export interface ReAdmission
  extends Omit<BasePatientInfo, "financialClass" | "age"> {
  admitDate: string;
  dischargeDate: string;
  timeSinceReadmission: number;
  lengthOfStay: number;
}

export interface ObservationHours
  extends Omit<ReAdmission, "timeSinceReadmission" | "doctorName"> {
  admitTime: string;
  dischargeTime: string;
}

export interface InpatientCensusDays
  extends Omit<BasePatientInfo, "doctorName"> {
  patientType: string;
  admitDate: string;
  admitTime: string;
  dischargeDate: string;
  financialClass: string;
  lengthOfStay: number;
  patientDays: number;
}
