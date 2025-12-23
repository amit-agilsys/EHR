import { useEffect, useState } from "react";
import { useUser } from "hooks/api/useUser";
import EditDeleteTemplate from "components/EditDeleteTemplate";
import ConfirmDelete from "components/ConfirmDelete";
import { User } from "hooks/types/user";
import { VerificationBadge } from "components/VerificationBadge";
import { formatPhoneNumber } from "utils/utils";
import AddItemTemplate from "components/addItem/AddItemTemplate";
import AddEdit from "./AddEdit";
import { defaultValues } from "./schema";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { GET_ALL_USERS, USERS } from "constants/endPoints";
import { ColumnDef } from "@tanstack/react-table";
import { usePermission } from "hooks/usePermission ";

export default function List() {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editUser, setEditUser] = useState<User>(defaultValues);
  const { hasPermission, hasAnyPermission } = usePermission("Users");
  const [deleteId, setDeleteId] = useState("");
  const { deleteUser } = useUser(false);

  const { mutate: deleteExistingUser, isSuccess, isPending } = deleteUser;

  const confirmDelete = (id: string) => {
    setConfirmDialog(true);
    setDeleteId(id);
  };

  const handleClose = () => {
    setConfirmDialog(false);
    setDeleteId("");
  };

  useEffect(() => {
    handleClose();
  }, [isSuccess]);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setDialogVisible(true);
  };

  const handleDelete = () => {
    deleteExistingUser(deleteId);
  };

  const handleOpen = () => {
    setDialogVisible(true);
  };

  const handleAddEditClose = () => {
    setEditUser(defaultValues);
    setDialogVisible(false);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm">
            {formatPhoneNumber(user.phoneNumber) || "-"}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
    },
    {
      accessorKey: "emailConfirmed",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="">
            <VerificationBadge verified={user.emailConfirmed || false} />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => {
        return hasAnyPermission(["Edit", "Delete"]) ? (
          <div className="text-right mr-4">Actions</div>
        ) : null;
      },
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex justify-end">
            <EditDeleteTemplate
              id={doctor.id}
              _edit={hasPermission("Edit")}
              _delete={hasPermission("Delete")}
              handleEdit={() => handleEdit(doctor)}
              handleDelete={confirmDelete}
            />
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <AddItemTemplate
        title="User"
        canAdd={hasPermission("Add")}
        handleAdd={handleOpen}
      />

      {dialogVisible && (
        <AddEdit
          userToEdit={editUser}
          isDialogVisible={dialogVisible}
          onClose={handleAddEditClose}
        />
      )}
      {/* Dialog for stage delete confirmation */}
      <ConfirmDelete
        open={confirmDialog}
        openChange={setConfirmDialog}
        handleClose={handleClose}
        handleDelete={handleDelete}
        deleteStatus={isPending}
      />
      <PaginatedDataTable<User>
        columns={columns}
        endpoint={GET_ALL_USERS}
        queryKey={USERS}
        searchPlaceholder="Search"
        searchFields={["name", "role", "emailConfirmed"]}
        defaultPageSize={10}
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />
    </>
  );
}
