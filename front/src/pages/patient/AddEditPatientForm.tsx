import Loader from "components/loader/Loader";
import { usePatient } from "hooks/api/usePatient";
import { Patient } from "hooks/types/patient";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { FormField } from "components/form/FormField";
import { SelectField } from "components/form/SelectField";
import { Button } from "components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultValues, PatientFormData, patientSchema } from "./schema";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
// import { useInitLists } from "hooks/useInitLists";
import { editPatient as editPatientAction } from "slices/patient.slice";
// Import your hook
import { useGetPatientById } from "hooks/api/usePatient";
import { useInitLists } from "hooks/useInitLists";

export default function AddEditPatientForm() {
  useInitLists();
  // const { isLoading: isListsLoading } = useInitLists();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addPatient, editPatient } = usePatient();
  const location = useLocation();

  // 1. Get ID from location state (or you could use useParams from react-router)
  const { patientId } = location.state || {};

  // 2. Fetch Patient Data using the hook
  // We convert patientId to string if it exists, otherwise null to disable the query
  const { data: apiResponse, isLoading: isPatientLoading } = useGetPatientById(
    patientId ? String(patientId) : null
  );

  // Lists
  const fincialClassList = useSelector(
    (state: RootState) => state.list.financialClass
  );
  const insuranceList = useSelector((state: RootState) => state.list.insurance);
  const genderList = useSelector((state: RootState) => state.list.gender);

  // Extract the actual patient object from the API response structure
  const patientToEdit = apiResponse?.data;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema) as Resolver<PatientFormData>,
    defaultValues: defaultValues,
    mode: "onChange",
  });

  // 3. Populate form when data arrives from the API
  useEffect(() => {
    if (patientToEdit) {
      const insuranceDetails = patientToEdit.patientInsurances[0];

      const transformedData: PatientFormData = {
        name: patientToEdit.name,
        mrn: patientToEdit.mrn,
        dob: new Date(patientToEdit.dob).toISOString().split("T")[0],
        gender: patientToEdit.gender,
        // Handle potential undefined insurance details safely
        insuranceNumber: insuranceDetails?.insuranceNumber || "",
        financialId: insuranceDetails?.financialId || 0,
        patientInsurance1Id: insuranceDetails?.patientInsurance1Id || 0,
        patientInsurance2Id: insuranceDetails?.patientInsurance2Id || 0,
      };

      reset(transformedData);

      // Optional: Keep logic to blur field if strictly necessary
      setTimeout(() => {
        const nameInput = document.getElementById("name") as HTMLInputElement;
        nameInput?.blur();
      }, 0);
    }
  }, [reset, patientToEdit]);

  const onSubmit = async (data: PatientFormData) => {
    // Determine if we are editing based on if we fetched data
    const isEditMode = !!patientToEdit?.id;

    const transformedData: Patient = {
      id: patientToEdit?.id || 0,
      mrn: data.mrn,
      name: data.name,
      dob: new Date(data.dob).toISOString().split("T")[0],
      gender: data.gender,
      patientInsurances: [
        {
          id:
            isEditMode && patientToEdit?.patientInsurances?.[0]
              ? patientToEdit.patientInsurances[0].id
              : 0,
          insuranceNumber: data.insuranceNumber,
          financialId: data.financialId,
          financialName: "",
          patientInsurance1Id: data.patientInsurance1Id,
          insuranceName1: "",
          patientInsurance2Id: data.patientInsurance2Id
            ? data.patientInsurance2Id
            : 0,
          insuranceName2: "",
        },
      ],
    };

    if (isEditMode) {
      await editPatient.mutateAsync({
        ...transformedData,
        id: patientToEdit!.id,
      });
      // Update redux store if necessary for list views
      dispatch(
        editPatientAction({ ...transformedData, id: patientToEdit!.id })
      );
    } else {
      const response = await addPatient.mutateAsync(transformedData);
      const id = response.data.id;
      const newPatient = response.data;

      dispatch(editPatientAction(newPatient));
      navigate(`/patients/add/${id}`, { state: { patientId: id } });
    }
  };

  // 4. Add isPatientLoading to the loader condition
  if (addPatient.isPending || editPatient.isPending || isPatientLoading) {
    return <Loader />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="flex justify-end">
        <Button className="absolute -top-10" type="submit">
          Save
        </Button>
      </div>
      {/* ================= Patient Details ================= */}
      <p className="text-sm text-gray-600 mmt-2">Patient details</p>
      <div className="border border-gray-200 p-4 rounded">
        <div className="flex gap-5">
          <FormField
            label="Name"
            id="name"
            className="w-full"
            register={register}
            errors={errors}
          />
          <FormField
            label="MRN"
            id="mrn"
            className="w-full"
            register={register}
            errors={errors}
          />
        </div>

        <div className="flex gap-5 mt-4">
          <div className="flex flex-col w-full">
            <Label htmlFor="dob" className="mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              id="dob"
              className={`w-full ${errors.dob ? "border-red-500" : ""}`}
              {...register("dob", { required: "Date of Birth is required" })}
            />
            {errors.dob && (
              <p className="text-sm text-red-500 mt-2">{errors.dob.message}</p>
            )}
          </div>

          <SelectField
            label="Gender"
            id="gender"
            className="w-full"
            options={genderList}
            control={control}
            errors={errors}
          />
        </div>
      </div>

      {/* ================= Insurance Details ================= */}
      <p className="text-sm text-gray-600 mt-5">Insurance details</p>
      <div className="border border-gray-200 p-4 rounded">
        <div className="flex gap-5">
          <FormField
            label="Insurance Number"
            id="insuranceNumber"
            className="w-1/2"
            register={register}
            errors={errors}
          />
          <SelectField
            label="Financial Class"
            id="financialId"
            className="w-1/2"
            options={fincialClassList}
            control={control}
            errors={errors}
          />
        </div>
        <div className="flex gap-5 mt-4">
          <SelectField
            label="Primary Insurance"
            id="patientInsurance1Id"
            className="w-1/2"
            options={insuranceList}
            control={control}
            errors={errors}
          />
          <SelectField
            label="Secondary Insurance"
            id="patientInsurance2Id"
            className="w-1/2"
            options={insuranceList}
            control={control}
            errors={errors}
            required={false}
          />
        </div>
      </div>
    </form>
  );
}
