import {
  Admission,
  DailyCensus,
  Discharge,
  InpatientCensusDays,
  ObservationHours,
  ReAdmission,
} from "hooks/types/reports";
import { createColumns } from "./columnsBuilder";
import {
  admissionsFields,
  dailyCensusFields,
  dischargeFields,
  inpatientCensusDaysFields,
  observationHoursFields,
  reAdmissionsFields,
} from "./schema";

export const dailyCensusColumns = createColumns<DailyCensus>(
  dailyCensusFields,
  [
    "mrn",
    "patientName",
    "doctorName",
    "admitDate",
    "dischargeDate",
    "dob",
    "age",
    "financialClass",
  ],
  {
    dischargeDate: { enableSorting: false },
    age: { enableSorting: false },
  }
);

export const admissionColumns = createColumns<Admission>(
  admissionsFields,
  [
    "mrn",
    "patientName",
    "doctorName",
    "admitDate",
    "patientType",
    "dob",
    "age",
    "financialClass",
  ],
  {
    age: { enableSorting: false },
  }
);

export const dischargeColumns = createColumns<Discharge>(
  dischargeFields,
  [
    "mrn",
    "patientName",
    "doctorName",
    "dischargeDate",
    "patientType",
    "dob",
    "age",
    "financialClass",
  ],
  {
    age: { enableSorting: false },
  }
);

export const reAdmissionColumns = createColumns<ReAdmission>(
  reAdmissionsFields,
  [
    "mrn",
    "patientName",
    "dob",
    "admitDate",
    "dischargeDate",
    "timeSinceReadmission",
    "lengthOfStay",
    "doctorName",
  ],
  {
    lengthOfStay: {
      cell: ({ row }) => {
        const value = row.original.lengthOfStay;
        const displayValue = value == null ? "-" : `${value} Days`;
        return <div className="text-sm">{displayValue}</div>;
      },
    },
    timeSinceReadmission: {
      cell: ({ row }) => {
        const value = row.original.timeSinceReadmission;
        const displayValue = value == null ? "-" : `${value} Days`;
        return <div className="text-sm">{displayValue}</div>;
      },
    },
  }
);

export const observationHoursColumns = createColumns<ObservationHours>(
  observationHoursFields,
  [
    "mrn",
    "patientName",
    "dob",
    "admitDate",
    "admitTime",
    "dischargeDate",
    "dischargeTime",
    "lengthOfStay",
  ],
  {
    admitTime: { enableSorting: false },
    dischargeTime: { enableSorting: false },
    lengthOfStay: {
      cell: ({ row }) => {
        const value = row.original.lengthOfStay;
        const displayValue = value == null ? "-" : `${value} Hours`;
        return <div className="text-sm">{displayValue}</div>;
      },
    },
  }
);

export const inpatientCensusDaysColumns = createColumns<InpatientCensusDays>(
  inpatientCensusDaysFields,
  [
    "mrn",
    "patientName",
    "dob",
    "patientType",
    "admitDate",
    "admitTime",
    "dischargeDate",
    "financialClass",
    "lengthOfStay",
    "patientDays",
  ],
  {
    admitTime: { enableSorting: false },
    lengthOfStay: {
      cell: ({ row }) => {
        const value = row.original.lengthOfStay;
        const displayValue = value == null ? "-" : `${value} Hours`;
        return <div className="text-sm">{displayValue}</div>;
      },
    },
    patientDays: {
      cell: ({ row }) => {
        const value = row.original.patientDays;
        const displayValue = value == null ? "-" : `${value} Days`;
        return <div className="text-sm">{displayValue}</div>;
      },
    },
  }
);
