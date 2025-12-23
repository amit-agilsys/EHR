import { lazy } from "react";

const Login = lazy(() => import("pages/login/Login"));
const Logout = lazy(() => import("components/Logout"));
const ForgotPassword = lazy(() => import("pages/ForgotPassword"));
const ResetPassword = lazy(() => import("pages/resetPassword/ResetPassword"));

const Users = lazy(() => import("pages/user/List"));
const Patients = lazy(() => import("pages/patient/List"));
const AddEditPatient = lazy(() => import("pages/patient/PatientTabsWrapper"));
const Encounters = lazy(() => import("pages/encounter/EncounterList"));
const Doctors = lazy(() => import("pages/doctor/List"));
const Role = lazy(() => import("pages/role/List"));

// Reports
const DailyCensusReport = lazy(() => import("pages/reports/DailyCensus"));
const AdmissionReport = lazy(() => import("pages/reports/Admission"));
const DischargeReport = lazy(() => import("pages/reports/Discharge"));
const ReAdmissionReport = lazy(() => import("pages/reports/ReAdmission"));
const ObservationReport = lazy(() => import("pages/reports/ObservationHour"));
const InpatientCensusReport = lazy(
  () => import("pages/reports/InpatientCensusDay")
);

// public routes
export const publicRoutes = [
  { path: "/", component: Login },
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
  { path: "/set-password/:token", component: ResetPassword },
];

// private routes
export const privateRoutes = [
  { path: "/users", component: Users },
  { path: "/patients", component: Patients },
  { path: "/patients/add", component: AddEditPatient },
  { path: "/patients/add/:id", component: AddEditPatient },
  { path: "/encounters", component: Encounters },
  { path: "/doctors", component: Doctors },
  { path: "/roles", component: Role },

  // Reports
  { path: "/reports/daily-census", component: DailyCensusReport },
  { path: "/reports/admission", component: AdmissionReport },
  { path: "/reports/discharge", component: DischargeReport },
  { path: "/reports/re-admission", component: ReAdmissionReport },
  { path: "/reports/observation-hours", component: ObservationReport },
  { path: "/reports/inpatient-census", component: InpatientCensusReport },
];
