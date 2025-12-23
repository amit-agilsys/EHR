// schema.ts
import {
  Admission,
  BasePatientInfo,
  DailyCensus,
  Discharge,
  InpatientCensusDays,
  ObservationHours,
  ReAdmission,
} from "hooks/types/reports";

const baseFields: Record<keyof BasePatientInfo, string> = {
  mrn: "MRN",
  patientName: "Patient Name",
  doctorName: "Doctor Name",
  dob: "DOB",
  age: "Age",
  financialClass: "Financial Class",
};

export const dailyCensusFields: Record<keyof DailyCensus, string> = {
  ...baseFields,
  admitDate: "Admit Date",
  dischargeDate: "Discharge Date",
};

export const admissionsFields: Record<keyof Admission, string> = {
  ...baseFields,
  admitDate: "Admit Date",
  patientType: "LOC",
};

export const dischargeFields: Record<keyof Discharge, string> = {
  ...baseFields,
  dischargeDate: "Discharge Date",
  patientType: "LOC",
};

export const reAdmissionsFields: Record<keyof ReAdmission, string> = {
  ...baseFields,
  admitDate: "Admit Date",
  dischargeDate: "Discharge Date",
  timeSinceReadmission: "Time Since Readmission",
  lengthOfStay: "Length of Stay",
};

export const observationHoursFields: Record<keyof ObservationHours, string> = {
  ...baseFields,
  admitDate: "Admit Date",
  dischargeDate: "Discharge Date",
  admitTime: "Admit Time",
  dischargeTime: "Discharge Time",
  lengthOfStay: "Length of Stay",
};

export const inpatientCensusDaysFields: Record<
  keyof InpatientCensusDays,
  string
> = {
  ...baseFields,
  admitDate: "Admit Date",
  dischargeDate: "Discharge Date",
  admitTime: "Admit Time",
  lengthOfStay: "Length of Stay",
  patientDays: "Patient Days",
  financialClass: "Financial Class",
  patientType: "LOC",
};
