// hooks/types/filters.ts
export type FilterValue =
  | string
  | string[]
  | number
  | number[]
  | Date
  | { from: Date; to: Date } // For date ranges
  | null
  | boolean
  | undefined;

export interface FilterState {
  emailConfirmed: string | null | undefined;
  role: string | null | undefined;
  patientId?: number | string | string[] | null;
  doctorId: string | string[] | null | undefined;
  patientTypeId: string | string[] | null | undefined;
  roomTypeId: string | string[] | null | undefined;
  gender: string | string[] | null | undefined;
  financialClassId: string | string[] | null | undefined;

  // Date fields
  admitDate?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  dob?: Date | string | null;
  reportDate?: Date | string | null;
  dischargeDate?: Date | string | null;

  // Date range fields
  admitDateRange?: { from: Date; to: Date } | null;
  dischargeDateRange?: { from: Date; to: Date } | null;
  startEndDateRange?: { from: Date; to: Date } | null;

  [key: string]: FilterValue;
}
