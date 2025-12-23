import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "hooks/api/useUser";
import { toggleLoadingState } from "slices/global.slice";
import { User } from "hooks/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogBox from "components/dialogBox/DialogBox";
import { defaultValues, UserFormData, userSchema } from "./schema";
import { FormField } from "components/form/FormField";
import { useLists } from "hooks/api/useList";
import Loader from "components/loader/Loader";
import { RoleList } from "hooks/types/role";
import { SelectField } from "components/form/SelectField";
import { RootState } from "store/store";
import { setName } from "slices/auth.slice";

interface AddEditProps {
  userToEdit: User | null;
  isDialogVisible: boolean;
  onClose: () => void;
}

export default function AddEdit({
  userToEdit,
  isDialogVisible,
  onClose,
}: AddEditProps) {
  const dispatch = useDispatch();
  const { addUser, editUser } = useUser();
  const { getRoleList } = useLists({ fetchRoles: true });

  const { data: roleData, isLoading: roleListLoading } = getRoleList;
  const activeUser = useSelector((state: RootState) => state.auth.user);

  const {
    mutate: addNewUser,
    isPending: addPending,
    isSuccess: addSuccess,
  } = addUser;
  const {
    mutate: editNewUser,
    isPending: editPending,
    isSuccess: editSuccess,
  } = editUser;

  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = useCallback(
    (data: UserFormData) => {
      if (userToEdit && userToEdit.id) {
        editNewUser({ ...data, id: userToEdit.id });
      } else {
        addNewUser(data);
      }
    },
    [userToEdit, editNewUser, addNewUser]
  );

  useEffect(() => {
    // debugger;
    if (userToEdit && userToEdit.id && isDialogVisible) {
      reset({
        ...userToEdit,
        role: userToEdit.roleId,
      });
      setTimeout(() => {
        const nameInput = document.getElementById("name") as HTMLInputElement;
        nameInput?.blur();
      }, 0);
    }
  }, [reset, userToEdit, isDialogVisible]);

  useEffect(() => {
    if (editSuccess || addSuccess) {
      if (activeUser?.id === userToEdit?.id) {
        dispatch(setName(watch("name")));
      }
      onClose();
    }
  }, [
    editSuccess,
    addSuccess,
    onClose,
    activeUser,
    userToEdit,
    dispatch,
    watch,
  ]);

  useEffect(() => {
    if (addPending || editPending) dispatch(toggleLoadingState(true));
    else dispatch(toggleLoadingState(false));
  }, [addPending, editPending, dispatch]);

  if (roleListLoading) return <Loader />;

  const roleList =
    roleData?.data
      ?.map((r: RoleList) => ({
        id: r.roleId,
        name: r.roleName,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)) || [];

  if (!roleList) return <Loader />;

  return (
    <>
      <DialogBox
        heading={userToEdit && userToEdit.id ? "Edit User" : "Add User"}
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
          <SelectField
            label="Role"
            id="role"
            className="w-1/2"
            options={roleList}
            control={control}
            errors={errors}
          />
          <FormField
            label="Phone Number"
            id="phoneNumber"
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
