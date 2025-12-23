import {
  Calendar1,
  Repeat,
  UserCog,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { FaHospitalUser, FaUserShield } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { ImUserCheck } from "react-icons/im";
import { IoMdTime } from "react-icons/io";

export const mainPages = [
  {
    title: "Patients",
    url: "/patients",
    icon: FaHospitalUser,
    slug: "patients",
  },
  {
    title: "Encounters",
    url: "/encounters",
    icon: ImUserCheck,
    slug: "encounters",
  },
];

export const setupPages = [
  { title: "Users", url: "/users", icon: UserCog, slug: "users" },
  { title: "Doctors", url: "/doctors", icon: FaUserDoctor, slug: "doctors" },
  { title: "Roles", url: "/roles", icon: FaUserShield, slug: "roles" },
];

export const reportsPages = [
  {
    title: "Daily Census",
    url: "/reports/daily-census",
    icon: Calendar1,
    slug: "Daily-Census",
  },
  {
    title: "Admissions",
    url: "/reports/admission",
    icon: UserRoundPlus,
    slug: "Admission",
  },
  {
    title: "Discharges",
    url: "/reports/discharge",
    icon: UserRoundMinus,
    slug: "Discharge",
  },
  {
    title: "Re-Admissions",
    url: "/reports/re-admission",
    icon: Repeat,
    slug: "Re-Admission",
  },
  {
    title: "Observation Hours",
    url: "/reports/observation-hours",
    icon: IoMdTime,
    slug: "Observation-Hours",
  },
  {
    title: "Inpatient Census",
    url: "/reports/inpatient-census",
    icon: UserRound,
    slug: "Inpatient-Census",
  },
];
