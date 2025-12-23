import { useEffect, useState } from "react";
import EditDeleteTemplate from "components/EditDeleteTemplate";
import ConfirmDelete from "components/ConfirmDelete";
import { Doctor } from "hooks/types/doctors";
import { useDoctor } from "hooks/api/useDoctor";
import AddEdit from "./AddEdit";
import { defaultValues } from "./schema";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatPhoneNumber } from "utils/utils";
import { DOCTOR, GET_ALL_DOCTORS } from "constants/endPoints";
import AddItemTemplate from "components/addItem/AddItemTemplate";
import { usePermission } from "hooks/usePermission ";

export default function List() {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor>(defaultValues);
  const [deleteId, setDeleteId] = useState(0);

  const { hasPermission, hasAnyPermission } = usePermission("Doctors");

  const { deleteDoctor } = useDoctor(false);
  const { mutate: deleteExistingDoctor, isSuccess, isPending } = deleteDoctor;

  const confirmDelete = (id: number) => {
    setConfirmDialog(true);
    setDeleteId(id);
  };

  const handleDeleteDialogClose = () => {
    setConfirmDialog(false);
    setDeleteId(0);
  };

  const handleAddEditClose = () => {
    setEditDoctor(defaultValues);
    setDialogVisible(false);
  };

  useEffect(() => {
    handleDeleteDialogClose();
  }, [isSuccess]);

  const handleEdit = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setDialogVisible(true);
  };

  const handleDelete = () => {
    deleteExistingDoctor(deleteId);
  };

  const handleOpen = () => {
    setDialogVisible(true);
  };

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "name",
      header: "Name",
      id: "name",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      id: "email",
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      id: "phone",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="text-sm">
            {formatPhoneNumber(doctor.phone) || "-"}
          </div>
        );
      },
      enableSorting: false,
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
              _edit={hasPermission("edit")}
              _delete={hasPermission("delete")}
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
        title="Doctor"
        canAdd={hasPermission("add")}
        handleAdd={handleOpen}
      />

      {dialogVisible && (
        <AddEdit
          doctorToEdit={editDoctor}
          isDialogVisible={dialogVisible}
          onClose={handleAddEditClose}
        />
      )}

      <ConfirmDelete
        open={confirmDialog}
        openChange={setConfirmDialog}
        handleClose={handleDeleteDialogClose}
        handleDelete={handleDelete}
        deleteStatus={isPending}
      />

      <PaginatedDataTable<Doctor>
        columns={columns}
        endpoint={GET_ALL_DOCTORS}
        queryKey={DOCTOR}
        searchPlaceholder="Search"
        searchFields={["name", "email", "phone"]}
        defaultPageSize={10}
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />
    </>
  );
}
