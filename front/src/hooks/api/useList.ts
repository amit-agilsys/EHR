import { useQuery } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { ApiResponse } from "hooks/types/apiResponse";
import { RoleList } from "hooks/types/role";
import {
  DOCTOR,
  FINANCIAL_CLASS,
  INSURANCE,
  PATIENT_TYPE,
  LIST,
  ROLES,
  ROOM_TYPE,
  USERS,
  PATIENTS,
} from "constants/endPoints";
import { User } from "hooks/types/user";
import { FinancialClass } from "hooks/types/financialClass";
import { Insurance } from "hooks/types/insurance";
import { Doctor } from "hooks/types/doctors";
import { PatientType } from "hooks/types/PatientType";
import { RoomType } from "hooks/types/roomType";

interface UseAllListsOptions {
  fetchRoles?: boolean;
  fetchUsers?: boolean;
  fetchFinancialClass?: boolean;
  fetchInsurance?: boolean;
  fetchDoctors?: boolean;
  fetchLevelOfCare?: boolean;
  fetchRoomType?: boolean;
  fetchPatients?: boolean;
}

const useFetchList = <T>(key: string[], endpoint: string, enabled: boolean) => {
  return useQuery<ApiResponse<T[]>, Error>({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<T[]>>(endpoint);
      return data;
    },
  });
};

export const useLists = ({
  fetchUsers = false,
  fetchRoles = false,
  fetchFinancialClass = false,
  fetchInsurance = false,
  fetchDoctors = false,
  fetchLevelOfCare = false,
  fetchRoomType = false,
  fetchPatients = false,
}: UseAllListsOptions) => {
  const getUserList = useFetchList<User>(
    ["user", "list"],
    `${USERS}${LIST}`,
    fetchUsers
  );

  const getRoleList = useFetchList<RoleList>(
    ["role", "list"],
    `${ROLES}/GetRolesList`,
    fetchRoles
  );

  const getFinancialClassList = useFetchList<FinancialClass>(
    ["financial-class", "list"],
    `${FINANCIAL_CLASS}/GetAllFinancialClasses`,
    fetchFinancialClass
  );

  const getInsuranceList = useFetchList<Insurance>(
    ["insurance", "list"],
    `${INSURANCE}/GetAllInsurances`,
    fetchInsurance
  );

  const getDoctorsList = useFetchList<Doctor>(
    ["doctor", "list"],
    `${DOCTOR}/GetAllDoctors`,
    fetchDoctors
  );

  const getPatientTypeList = useFetchList<PatientType>(
    [PATIENT_TYPE, "list"],
    PATIENT_TYPE,
    fetchLevelOfCare
  );

  const getRoomTypeList = useFetchList<RoomType>(
    ["room-type", "list"],
    `${ROOM_TYPE}/GetAllRoomTypes`,
    fetchRoomType
  );

  const getPatientsList = useFetchList<User>(
    ["patient", "list"],
    `${PATIENTS}/GetAllPatients`,
    fetchPatients
  );

  const actions = {
    getRoleList,
    getUserList,
    getFinancialClassList,
    getInsuranceList,
    getDoctorsList,
    getPatientTypeList,
    getRoomTypeList,
    getPatientsList,
  };

  return actions;
};
