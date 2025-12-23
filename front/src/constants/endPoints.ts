const ROLES = "/role";
const ACCOUNT = "/account";
const LIST = "/list";
const USERS = "/user";
const PATIENTS = "/patient";
const DOCTOR = "/doctor";
const SCREEN = "/Screens";
const INSURANCE = "/insurance";
const FINANCIAL_CLASS = "/FinancialClass";
const PATIENT_TYPE = "/PatientType/GetAllPatientTypes";
const ROOM_TYPE = "/RoomType";
const GET_ALL_DOCTORS = "/Doctor/GetAllDoctors";
const GET_ALL_USERS = "/User/GetAllUsers";
const GET_ALL_ENCOUNTERS = "/patient/GetAllEncounters";
const GET_ENCOUNTER_BY_ID = "/patient/GetEncountersByPatientId";
const GET_ALL_PATIENTS = "/Patient/GetAllPatients";
const DAILY_CENSUS_REPORT = "/Report/GetAllReports";
const ADMISSIONS_REPORT = "/Report/GetAdmissionsReport";
const DISCHARGE_REPORT = "/Report/GetDischargesReport";
const RE_ADMISSIONS_REPORT = "/Report/GetReadmissionsReport";
const OBSERVATION_HOURS_REPORT = "/Report/GetObservationHoursReport";
const INPATIENT_CENSUS_REPORT = "/Report/GetInpatientCensusReport";
const GET_ALL_ROLES = `${ROLES}/GetAllRoles`;

const DOWNLOAD_DAILY_CENSUS_PDF = "/Report/GenerateDailyCensusPdf";
const DOWNLOAD_ADMISSIONS_PDF = "/Report/GenerateAdmissionPdf";
const DOWNLOAD_DISCHARGE_PDF = "/Report/GenerateDischargePdf";
const DOWNLOAD_RE_ADMISSIONS_PDF = "/Report/GenerateReadmissionsPdf";
const DOWNLOAD_OBSERVATION_HOURS_PDF = "/Report/GenerateObservationHoursPdf";
const DOWNLOAD_INPATIENT_CENSUS_PDF = "/Report/GenerateInpatientCensusPdf";

export {
  ROLES,
  USERS,
  ACCOUNT,
  LIST,
  PATIENTS,
  DOCTOR,
  SCREEN,
  INSURANCE,
  FINANCIAL_CLASS,
  PATIENT_TYPE,
  ROOM_TYPE,
  GET_ALL_DOCTORS,
  GET_ALL_USERS,
  GET_ALL_ENCOUNTERS,
  GET_ENCOUNTER_BY_ID,
  GET_ALL_PATIENTS,
  DAILY_CENSUS_REPORT,
  ADMISSIONS_REPORT,
  DISCHARGE_REPORT,
  GET_ALL_ROLES,
  RE_ADMISSIONS_REPORT,
  OBSERVATION_HOURS_REPORT,
  INPATIENT_CENSUS_REPORT,
  DOWNLOAD_ADMISSIONS_PDF,
  DOWNLOAD_DAILY_CENSUS_PDF,
  DOWNLOAD_DISCHARGE_PDF,
  DOWNLOAD_RE_ADMISSIONS_PDF,
  DOWNLOAD_OBSERVATION_HOURS_PDF,
  DOWNLOAD_INPATIENT_CENSUS_PDF,
};
