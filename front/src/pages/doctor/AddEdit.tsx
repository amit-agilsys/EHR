import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toggleLoadingState } from "slices/global.slice";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogBox from "components/dialogBox/DialogBox";
import { defaultValues, DoctorFormData, doctorSchema } from "./schema";
import { FormField } from "components/form/FormField";
import { Doctor } from "hooks/types/doctors";
import { useDoctor } from "hooks/api/useDoctor";

interface AddEditProps {
  doctorToEdit: Doctor | null;
  isDialogVisible: boolean;
  onClose: () => void;
}

export default function AddEdit({
  doctorToEdit,
  isDialogVisible,
  onClose,
}: AddEditProps) {
  const dispatch = useDispatch();
  const { createDoctor, updateDoctor } = useDoctor();

  const {
    mutate: addDoctor,
    isPending: addPending,
    isSuccess: addSuccess,
  } = createDoctor;
  const {
    mutate: editDoctor,
    isPending: editPending,
    isSuccess: editSuccess,
  } = updateDoctor;

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = useCallback(
    (data: DoctorFormData) => {
      if (doctorToEdit && doctorToEdit.id) {
        editDoctor({ ...data, id: doctorToEdit.id });
      } else {
        addDoctor(data);
      }
    },
    [doctorToEdit, editDoctor, addDoctor]
  );

  useEffect(() => {
    if (doctorToEdit && doctorToEdit.id && isDialogVisible) {
      reset(doctorToEdit);
      setTimeout(() => {
        const nameInput = document.getElementById("name") as HTMLInputElement;
        nameInput?.blur();
      }, 0);
    }
  }, [reset, doctorToEdit, isDialogVisible]);

  useEffect(() => {
    if (editSuccess || addSuccess) onClose();
  }, [editSuccess, addSuccess, onClose]);

  useEffect(() => {
    if (addPending || editPending) dispatch(toggleLoadingState(true));
    else dispatch(toggleLoadingState(false));
  }, [addPending, editPending, dispatch]);

  return (
    <>
      <DialogBox
        heading={doctorToEdit && doctorToEdit.id ? "Edit Doctor" : "Add Doctor"}
        isDialogVisible={isDialogVisible}
        key={isDialogVisible ? "open" : "closed"}
        handleClose={onClose}
        handleSubmit={handleSubmit(onSubmit)}
        dialogWidh="max-w-3xl"
      >
        <div className="flex gap-5 mt-3">
          <FormField
            label="Name"
            id="name"
            register={register}
            errors={errors}
          />
          <FormField
            label="Email"
            id="email"
            type="email"
            register={register}
            errors={errors}
          />
        </div>

        <div className="flex gap-3 justify-between py-3">
          <FormField
            label="Phone Number"
            id="phone"
            type="tel"
            mask="(999) 999-9999"
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>
      </DialogBox>
    </>
  );
}
