import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Patient, PatientEncounter } from "hooks/types/patient";

const defaultState = {
  patient: {} as Patient,
  encounter: {} as PatientEncounter,
};

const patientSlice = createSlice({
  name: "patient",
  initialState: defaultState,
  reducers: {
    editPatient: (state, action: PayloadAction<Patient>) => {
      state.patient = action.payload;
    },
    editEncounter: (state, action: PayloadAction<PatientEncounter>) => {
      state.encounter = action.payload;
    },
    resetPatient(state) {
      state.patient = {} as Patient;
    },
    resetEncounter(state) {
      state.encounter = {} as PatientEncounter;
    },
  },
});

export const { editPatient, resetPatient, editEncounter, resetEncounter } =
  patientSlice.actions;
export default patientSlice.reducer;
