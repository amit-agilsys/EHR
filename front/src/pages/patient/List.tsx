import ConfirmDelete from "components/ConfirmDelete";
import { usePatient } from "hooks/api/usePatient";
import { useEffect, useState } from "react";
import { Gender } from "constants/enum";
import EditDeleteTemplate from "components/EditDeleteTemplate";
import { Patient } from "hooks/types/patient";
import { useNavigate } from "react-router-dom";
import AddItemTemplate from "components/addItem/AddItemTemplate";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { GET_ALL_PATIENTS, PATIENTS } from "constants/endPoints";
import { useDispatch } from "react-redux";
import { editPatient, resetPatient } from "slices/patient.slice";
import { useInitLists } from "hooks/useInitLists";
import { formatDate } from "utils/utils";
import { usePermission } from "hooks/usePermission ";

export default function List() {
  useInitLists();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const { deletePatient } = usePatient(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasAnyPermission, hasPermission } = usePermission("patients");

  const { mutate: deleteExistingPatient, isSuccess, isPending } = deletePatient;

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

  const handleEdit = (patient: Patient) => {
    const id = patient.id;
    dispatch(editPatient(patient));
    navigate(`/patients/add/${id}`, { state: { patientId: id } });
  };

  const handleDelete = () => {
    deleteExistingPatient(deleteId);
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorFn: (row) => row.patientInsurances?.[0]?.insuranceNumber,
      header: "Insurance No",
    },
    {
      accessorKey: "mrn",
      header: "MRN",
    },
    {
      accessorKey: "dob",
      header: "DOB",
      cell: ({ row }) => formatDate(row.original.dob),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => Gender[row.original.gender as keyof typeof Gender],
    },
    {
      accessorKey: "financialName",
      header: "Financial Class",
      cell: ({ row }) =>
        row.original.patientInsurances?.[0]?.financialName || "-",
    },
    {
      id: "actions",
      header: () => {
        return hasAnyPermission(["edit", "delete"]) ? (
          <div className="text-right mr-4">Actions</div>
        ) : null;
      },
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex justify-end">
            <EditDeleteTemplate
              id={patient.id.toString()}
              _edit={hasPermission("edit")}
              _delete={hasPermission("delete")}
              handleEdit={() => handleEdit(patient)}
              handleDelete={confirmDelete}
            />
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const handleOpen = () => {
    navigate("/patients/add");
    dispatch(resetPatient());
  };

  return (
    <>
      <AddItemTemplate
        title="Patient"
        canAdd={hasPermission("add")}
        handleAdd={handleOpen}
      />
      <ConfirmDelete
        open={confirmDialog}
        openChange={setConfirmDialog}
        handleClose={handleClose}
        handleDelete={handleDelete}
        deleteStatus={isPending}
      />

      <PaginatedDataTable<Patient>
        columns={columns}
        endpoint={GET_ALL_PATIENTS}
        queryKey={PATIENTS}
        searchPlaceholder="Search"
        searchFields={["name", "dob", "gender", "financialClassId"]}
        defaultPageSize={15}
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />
    </>
  );
}
