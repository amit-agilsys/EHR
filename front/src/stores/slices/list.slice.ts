import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RoomType } from "hooks/types/roomType";
import { PatientType } from "hooks/types/PatientType";
import { DoctorList } from "hooks/types/doctors";
import { FinancialClass } from "hooks/types/financialClass";
import { Insurance } from "hooks/types/insurance";
import { Gender } from "hooks/types/gender";

const genderList = [
  { id: "F", name: "Female" },
  { id: "M", name: "Male" },
  { id: "O", name: "Other" },
];

type ListState = {
  patientType: PatientType[];
  roomType: RoomType[];
  doctor: DoctorList[];
  financialClass: FinancialClass[];
  insurance: Insurance[];
  gender: Gender[];
};

const defaultState: ListState = {
  patientType: [],
  roomType: [],
  doctor: [],
  financialClass: [],
  insurance: [],
  gender: genderList,
};

// Define a dynamic payload type
type SetListPayload = Partial<{
  doctorList: DoctorList[];
  levelOfCareList: PatientType[];
  roomTypeList: RoomType[];
  financialClassList: FinancialClass[];
  insuranceList: Insurance[];
}>;

const listSlice = createSlice({
  name: "list",
  initialState: defaultState,
  reducers: {
    editLevelOfCare(state, action: PayloadAction<PatientType[]>) {
      state.patientType = action.payload;
    },
    editRoomType(state, action: PayloadAction<RoomType[]>) {
      state.roomType = action.payload;
    },
    editDoctor(state, action: PayloadAction<DoctorList[]>) {
      state.doctor = action.payload;
    },
    editFinancialClass(state, action: PayloadAction<FinancialClass[]>) {
      state.financialClass = action.payload;
    },
    editInsurance(state, action: PayloadAction<Insurance[]>) {
      state.insurance = action.payload;
    },
    setList(state, action: PayloadAction<SetListPayload>) {
      const {
        doctorList,
        levelOfCareList,
        roomTypeList,
        financialClassList,
        insuranceList,
      } = action.payload;

      if (doctorList) state.doctor = doctorList;
      if (levelOfCareList) state.patientType = levelOfCareList;
      if (roomTypeList) state.roomType = roomTypeList;
      if (financialClassList) state.financialClass = financialClassList;
      if (insuranceList) state.insurance = insuranceList;
    },
  },
});

export const {
  editLevelOfCare,
  editRoomType,
  editDoctor,
  setList,
  editFinancialClass,
  editInsurance,
} = listSlice.actions;
export default listSlice.reducer;
