import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useForm, Resolver } from "react-hook-form";
import { SelectField } from "components/form/SelectField";
import { FormFiledTime } from "components/form/FormFieldTime";
import {
  defaultValues,
  EncounterItem,
  encounterItemSchema,
  PatientTypeSegmentItem,
} from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogBox from "components/dialogBox/DialogBox";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEncounter } from "hooks/api/useEncounter";
import { RootState } from "store/store";
import { useInitLists } from "hooks/useInitLists";
import { PatientEncounter } from "hooks/types/patient";
import { GET_ENCOUNTER_BY_ID } from "constants/endPoints";
import { AsyncSearchFormField } from "pages/encounter/AsyncSearchFormField";
import PatientTypeSection from "pages/encounter/PatientTypeSection";

interface AddEditProps {
  encounterToEdit: EncounterItem | null;
  isDialogVisible: boolean;
  onClose: () => void;
}

export default function AddEncounterForm({
  encounterToEdit,
  isDialogVisible,
  onClose,
}: AddEditProps) {
  const [defaultDoctor, setDefaultDoctor] = useState<{
    value: number;
    label: string;
  } | null>(null);
  useInitLists();
  const location = useLocation();
  const { patientId } = location.state || {};
  const queryKey = GET_ENCOUNTER_BY_ID + patientId;

  const [segments, setSegments] = useState<PatientTypeSegmentItem[]>([]);

  const { addEncounter, editEncounter } = useEncounter(false, queryKey);

  const { mutate: addNewEncounter, isSuccess: addSuccess } = addEncounter;
  const { mutate: editNewEncounter, isSuccess: editSuccess } = editEncounter;

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EncounterItem>({
    resolver: zodResolver(encounterItemSchema) as Resolver<EncounterItem>,
    mode: "onChange",
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (encounterToEdit && encounterToEdit.id) {
      reset(encounterToEdit);
      setSegments(encounterToEdit.patientTypeSegments || []);
      if (encounterToEdit.doctorId && encounterToEdit.doctorName) {
        setDefaultDoctor({
          value: encounterToEdit.doctorId,
          label: encounterToEdit.doctorName,
        });
      }
    }
  }, [encounterToEdit, reset]);

  const watchedValues = watch([
    "admitDate",
    "admitTime",
    "dischargeDate",
    "dischargeTime",
  ]);

  const handleClose = useCallback(() => {
    reset(defaultValues);
    onClose();
  }, [reset, onClose]);

  const onSubmit = (data: EncounterItem) => {
    const payload = {
      ...data,
      admitDate: new Date(data.admitDate),
      dischargeTime: data.dischargeTime ? data.dischargeTime : null,
      dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : null,
      patientId: Number(patientId),
      patientTypeSegments: segments,
    };

    if (data.id) {
      editNewEncounter(payload as PatientEncounter);
    } else {
      addNewEncounter(payload);
    }
  };

  useEffect(() => {
    if (addSuccess || editSuccess) {
      handleClose();
    }
  }, [addSuccess, editSuccess, handleClose]);

  const LIST_PATIENT_TYPE = useSelector(
    (state: RootState) => state.list.patientType
  );
  const LIST_ROOM_TYPE = useSelector((state: RootState) => state.list.roomType);

  const handleAddSegment = (segment: PatientTypeSegmentItem) => {
    setSegments([...segments, segment]);
  };

  const handleUpdateSegment = (
    index: number,
    segment: PatientTypeSegmentItem
  ) => {
    const updatedSegments = [...segments];
    updatedSegments[index] = segment;
    setSegments(updatedSegments);
  };

  const handleDeleteSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  return (
    <>
      <DialogBox
        // heading={userToEdit.id ? "Edit User" : "Add User"}
        heading={encounterToEdit?.id ? "Edit Encounter" : "Add Encounter"}
        isDialogVisible={isDialogVisible}
        key={isDialogVisible ? "open" : "closed"}
        handleClose={onClose}
        handleSubmit={handleSubmit(onSubmit)}
        dialogWidh="max-w-5xl"
      >
        <div className="grid grid-cols-3 gap-4 py-4">
          <AsyncSearchFormField
            label="Doctor"
            id="doctorId"
            control={control}
            errors={errors}
            placeholder="Search doctor..."
            apiEndpoint="/Doctor/SearchDoctorByName"
            defaultOption={defaultDoctor}
          />

          <SelectField
            label="Level of Care"
            id="patientTypeId"
            className={`w-full ${
              encounterToEdit && encounterToEdit.id ? "hidden" : ""
            }`}
            options={LIST_PATIENT_TYPE}
            control={control}
            errors={errors}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="AdmitDate">
              Admit Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admitDate"
              className={`w-full block ${
                errors.admitDate ? "border-red-500" : ""
              }`}
              type="date"
              {...register("admitDate", {
                required: "Admit Date is required",
              })}
            />
            {errors.admitDate && (
              <p className="text-sm text-red-500">{errors.admitDate.message}</p>
            )}
          </div>
          <FormFiledTime
            label="Admit Time"
            className="w-full"
            id="admitTime"
            register={register}
            errors={errors}
          />

          <div className="flex gap-2 flex-col">
            <Label htmlFor="dischargeDate">Discharge Date</Label>
            <Input
              id="dischargeDate"
              type="date"
              {...register("dischargeDate", {
                required: "Discharge Date is required",
              })}
              className={`w-full block ${
                errors.dischargeDate ? "border-red-500" : ""
              }`}
            />
            {errors.dischargeDate && (
              <p className="text-sm text-red-500">
                {errors.dischargeDate.message}
              </p>
            )}
          </div>

          <FormFiledTime
            label="Discharge Time"
            className="w-full"
            id="dischargeTime"
            register={register}
            errors={errors}
            required={false}
          />

          <SelectField
            label="Room Type"
            id="roomTypeId"
            className="w-full"
            options={LIST_ROOM_TYPE}
            control={control}
            errors={errors}
          />
        </div>
        {/* Show segments section only in edit mode */}
        {encounterToEdit && encounterToEdit.id && (
          <PatientTypeSection
            segments={segments}
            onAddSegment={handleAddSegment}
            onUpdateSegment={handleUpdateSegment}
            onDeleteSegment={handleDeleteSegment}
            admitDate={watchedValues[0] || ""}
            admitTime={watchedValues[1] || ""}
            dischargeDate={watchedValues[2] || null}
            dischargeTime={watchedValues[3] || null}
          />
        )}
      </DialogBox>
    </>
  );
}
