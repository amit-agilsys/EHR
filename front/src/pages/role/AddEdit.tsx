import { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { toggleLoadingState } from "slices/global.slice";
import DialogBox from "components/dialogBox/DialogBox";
import { defaultValues, roleSchema, RoleFormData } from "./schema";
import { FormField } from "components/form/FormField";
import Loader from "components/loader/Loader";
import { Role } from "hooks/types/role";
import { RootState } from "store/store";
import { setName, setPermissions } from "slices/auth.slice";
import useRole from "hooks/api/useRole";
import { Label } from "components/ui/label";
import { Checkbox } from "components/ui/checkbox";
import { useScreens } from "hooks/api/useScreen";
import { PermissionGrid } from "./PermissionGrid";

interface AddEditProps {
  roleToEdit: Role | null;
  isDialogVisible: boolean;
  onClose: () => void;
}

export function AddEdit({
  roleToEdit,
  isDialogVisible,
  onClose,
}: AddEditProps) {
  const dispatch = useDispatch();
  const { addRole, updateRole } = useRole();
  const { getAllScreens } = useScreens(true);
  const { data: screens, isLoading: screensLoading } = getAllScreens;
  const activeUser = useSelector((state: RootState) => state.auth.user);

  const [selectedPermissions, setSelectedPermissions] = useState<
    { screenId: number; screenActionId: number }[]
  >([]);

  const {
    mutate: addNewRole,
    isPending: addPending,
    isSuccess: addSuccess,
  } = addRole;
  const {
    // mutate: editNewRole,
    isPending: editPending,
    isSuccess: editSuccess,
  } = updateRole;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<RoleFormData> = useCallback(
    async (data) => {
      const apiPermissions = selectedPermissions.map((p) => ({
        screenId: p.screenId,
        actionId: p.screenActionId,
      }));

      const payload: Role = {
        roleId: data.roleId,
        roleName: data.roleName,
        isActive: data.isActive,
        permissions: apiPermissions,
      };

      if (roleToEdit?.roleId) {
        const response = await updateRole.mutateAsync(payload);
        if (data.roleName === activeUser.role) {
          dispatch(setPermissions(response.data));
        }
        console.log(response, "response");
      } else {
        addNewRole(payload);
      }
    },
    [
      addNewRole,
      updateRole,
      roleToEdit,
      selectedPermissions,
      activeUser.role,
      dispatch,
    ]
  );

  useEffect(() => {
    if (roleToEdit && roleToEdit.roleId && isDialogVisible) {
      reset({
        roleId: roleToEdit.roleId,
        roleName: roleToEdit.roleName,
        isActive: roleToEdit.isActive,
      });
      setTimeout(() => {
        const nameInput = document.getElementById("name") as HTMLInputElement;
        nameInput?.blur();
      }, 0);

      const mappedPermissions = roleToEdit.permissions.map((p) => ({
        screenId: p.screenId,
        screenActionId: p.actionId,
      }));
      setSelectedPermissions(mappedPermissions);
    } else {
      reset(defaultValues);
      setSelectedPermissions([]);
    }
  }, [reset, roleToEdit, isDialogVisible]);

  useEffect(() => {
    if (editSuccess || addSuccess) {
      if (activeUser?.id === roleToEdit?.roleId) {
        dispatch(setName(watch("roleName")));
      }
      onClose();
    }
  }, [
    editSuccess,
    addSuccess,
    onClose,
    activeUser,
    roleToEdit,
    dispatch,
    watch,
  ]);

  useEffect(() => {
    if (addPending || editPending) dispatch(toggleLoadingState(true));
    else dispatch(toggleLoadingState(false));
  }, [addPending, editPending, dispatch]);

  if (screensLoading) return <Loader />;

  return (
    <>
      <DialogBox
        heading={"Add role"}
        isDialogVisible={isDialogVisible}
        key={isDialogVisible ? "open" : "closed"}
        handleClose={onClose}
        handleSubmit={handleSubmit(onSubmit)}
        dialogWidh="max-w-4xl max-h-[80vh] overflow-y-auto"
      >
        <div className="">
          <div className="flex gap-5 mt-3">
            <FormField
              label="Name"
              id="roleName"
              register={register}
              errors={errors}
            />

            <div className="flex items-end mb-3 gap-2">
              <Checkbox
                id="isActive"
                {...register("isActive")}
                checked={watch("isActive")}
                onCheckedChange={(checked) => {
                  register("isActive").onChange({
                    target: { name: "isActive", value: checked },
                  });
                }}
                className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white dark:data-[state=checked]:border-gray-700 dark:data-[state=checked]:bg-gray-700 border-gray-400"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <div className="my-5">
            {screens && (
              <PermissionGrid
                screens={screens}
                selectedPermissions={selectedPermissions}
                onPermissionsChange={setSelectedPermissions}
              />
            )}
          </div>
        </div>
      </DialogBox>
    </>
  );
}

export default AddEdit;
