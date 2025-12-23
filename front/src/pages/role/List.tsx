import { useEffect, useState } from "react";
import EditDeleteTemplate from "components/EditDeleteTemplate";
import ConfirmDelete from "components/ConfirmDelete";
import AddItemTemplate from "components/addItem/AddItemTemplate";
import AddEdit from "./AddEdit";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { GET_ALL_ROLES, ROLES } from "constants/endPoints";
import { ColumnDef } from "@tanstack/react-table";
import { ActiveBadge } from "components/ActiveBadge";
import { Role } from "hooks/types/role";
import useRole from "hooks/api/useRole";
import { usePermission } from "hooks/usePermission ";

export default function List() {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const { deleteRole } = useRole(false);
  const { hasAnyPermission, hasPermission } = usePermission("roles");

  const { mutate: deleteExistingRole, isSuccess, isPending } = deleteRole;

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

  const handleEdit = (role: Role) => {
    setEditRole(role);
    setDialogVisible(true);
  };

  const handleDelete = () => {
    deleteExistingRole(deleteId);
  };

  const handleOpen = () => {
    setDialogVisible(true);
  };

  const handleAddEditClose = () => {
    setEditRole(null);
    setDialogVisible(false);
  };

  const columns: ColumnDef<Role>[] = [
    {
      header: "No",
      accessorKey: "index",
      enableSorting: false,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "roleName",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="">
            <ActiveBadge verified={user.isActive || false} />
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
        const role = row.original;
        return (
          <div className="flex justify-end">
            <EditDeleteTemplate
              id={role.roleId}
              _edit={hasPermission("Edit")}
              _delete={hasPermission("Delete")}
              handleEdit={() => handleEdit(role)}
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
        title="Role"
        canAdd={hasPermission("Add")}
        handleAdd={handleOpen}
      />

      {dialogVisible && (
        <AddEdit
          roleToEdit={editRole}
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
      <PaginatedDataTable<Role>
        columns={columns}
        endpoint={GET_ALL_ROLES}
        queryKey={ROLES}
        searchPlaceholder="Search"
        searchFields={["name", "roleStatus"]}
        defaultPageSize={10}
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />
    </>
  );
}
