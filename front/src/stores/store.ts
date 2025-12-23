import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// slices
import authReducer from "slices/auth.slice";
import roleReducer from "slices/role.slice";
import globalReducer from "slices/global.slice";
import patientReducer from "slices/patient.slice";
import listReducer from "slices/list.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  role: roleReducer,
  global: globalReducer,
  patient: patientReducer,
  list: listReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "patient"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
