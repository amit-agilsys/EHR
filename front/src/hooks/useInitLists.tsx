import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { useLists } from "./api/useList";
import { setList } from "slices/list.slice";

export const useInitLists = () => {
  const dispatch = useDispatch();

  const { doctor, patientType, roomType, financialClass, insurance } =
    useSelector((state: RootState) => state.list);

  const {
    getDoctorsList,
    getPatientTypeList,
    getRoomTypeList,
    getFinancialClassList,
    getInsuranceList,
  } = useLists({
    fetchDoctors: doctor.length === 0,
    fetchLevelOfCare: patientType.length === 0,
    fetchRoomType: roomType.length === 0,
    fetchFinancialClass: financialClass.length === 0,
    fetchInsurance: insurance.length === 0,
  });

  useEffect(() => {
    if (
      getDoctorsList.data ||
      getPatientTypeList.data ||
      getRoomTypeList.data ||
      getFinancialClassList.data ||
      getInsuranceList.data
    ) {
      dispatch(
        setList({
          doctorList: getDoctorsList.data?.data,
          levelOfCareList: getPatientTypeList.data?.data,
          roomTypeList: getRoomTypeList.data?.data,
          financialClassList: getFinancialClassList.data?.data,
          insuranceList: getInsuranceList.data?.data,
        })
      );
    }
  }, [
    getDoctorsList.data,
    getPatientTypeList.data,
    getRoomTypeList.data,
    getFinancialClassList.data,
    getInsuranceList.data,
    dispatch,
  ]);

  const isLoading =
    getDoctorsList.isLoading ||
    getPatientTypeList.isLoading ||
    getRoomTypeList.isLoading ||
    getFinancialClassList.isLoading ||
    getInsuranceList.isLoading;

  return { isLoading };
};
