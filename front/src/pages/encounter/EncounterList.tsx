import ConfirmDelete from "components/ConfirmDelete";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EditDeleteTemplate from "components/EditDeleteTemplate";
import { ColumnDef } from "@tanstack/react-table";
import { PatientEncounterList } from "hooks/types/patient";
import { useEncounter } from "hooks/api/useEncounter";
import { RootState } from "store/store";
import AddItemTemplate from "components/addItem/AddItemTemplate";
import AddEncounterForm from "./AddEncounterForm";
import { EncounterItem } from "./schema";
import { useInitLists } from "hooks/useInitLists";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { GET_ALL_ENCOUNTERS } from "constants/endPoints";
import { formatDate } from "utils/utils";
import { usePermission } from "hooks/usePermission ";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "components/ui/tooltip";

type ListItem = { id: string | number; name: string };

export default function EncounterList() {
  useInitLists();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const { hasAnyPermission, hasPermission } = usePermission("encounters");
  const [deleteId, setDeleteId] = useState(0);
  const [editEncounter, setEditEncounter] = useState<EncounterItem | null>(
    null
  );

  const { deleteEncounter } = useEncounter(false, GET_ALL_ENCOUNTERS);

  const { doctor, patientType, roomType } = useSelector(
    (state: RootState) => state.list
  );

  const getNameFromList = (id: string | number, list: ListItem[]): string => {
    const item = list.find((i) => i.id == id);
    return item ? item.name : "Unknown";
  };

  const { isSuccess, isPending } = deleteEncounter;

  const confirmDelete = (id: number) => {
    setConfirmDialog(true);
    setDeleteId(id);
  };

  const handleClose = () => {
    setConfirmDialog(false);
    setDeleteId(0);
  };

  useEffect(() => {
    handleClose();
  }, [isSuccess]);

  const handleEdit = (encounter: PatientEncounterList) => {
    const dataForForm: EncounterItem = {
      id: encounter.id,
      patientId: encounter.patientId,
      patientName: encounter.patientName,
      admitTime: encounter.admitTime,
      doctorId: encounter.doctorId,
      doctorName: getNameFromList(encounter.doctorId, doctor),
      patientTypeId: encounter.patientTypeId,
      roomTypeId: encounter.roomTypeId,
      admitDate: encounter.admitDate.toString().split("T")[0],
      dischargeDate: encounter.dischargeDate?.toString().split("T")[0] ?? null,
      dischargeTime: encounter.dischargeTime ?? null,
      patientTypeSegments: (encounter.patientTypeSegments || []).map(
        (segment) => ({
          id: segment.id,
          patientTypeId: segment.patientTypeId,
          transferInDate: segment.transferInDate.toString().split("T")[0],
          transferInTime: segment.transferInTime,
        })
      ), // Add this
    };
    setEditEncounter(dataForForm);
    setDialogVisible(true);
  };

  const handleDelete = () => {
    deleteEncounter.mutate(deleteId);
  };

  const columns: ColumnDef<PatientEncounterList>[] = [
    {
      accessorKey: "id",
      header: "Admit Number",
      enableSorting: true,
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Link
                to={`/patients/add/${row.original.patientId}`}
                state={{ patientId: row.original.patientId }}
                className="hover:text-blue-600 hover:underline"
              >
                {row.original.patientName}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit {row.original.patientName}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "admitDate",
      header: "Admit Date",
      cell: ({ row }) => formatDate(row.original.admitDate),
      enableSorting: true,
    },
    {
      accessorKey: "dischargeDate",
      header: "Discharge Date",
      cell: ({ row }) => formatDate(row.original.dischargeDate),
      enableSorting: true,
    },
    {
      accessorKey: "doctorName",
      header: "Doctor",
      enableSorting: true,
    },
    {
      accessorKey: "patientTypeId",
      header: "LOC",
      cell: ({ row }) =>
        getNameFromList(row.original.patientTypeId, patientType),
      enableSorting: true,
    },
    {
      accessorKey: "roomTypeId",
      header: "Room Type",
      cell: ({ row }) => getNameFromList(row.original.roomTypeId, roomType),
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => {
        return hasAnyPermission(["edit", "delete"]) ? (
          <div className="text-right mr-4">Actions</div>
        ) : null;
      },
      cell: ({ row }) => {
        const encounter = row.original;
        return (
          <div className="flex justify-end">
            <EditDeleteTemplate
              id={encounter.id}
              _edit={hasPermission("edit")}
              _delete={hasPermission("delete")}
              handleEdit={() => handleEdit(encounter)}
              handleDelete={confirmDelete}
            />
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const handleOpen = () => {
    setDialogVisible(true);
  };

  const handleAddEditClose = () => {
    setEditEncounter(null);
    setDialogVisible(false);
  };

  return (
    <>
      <AddItemTemplate
        title="Encounter"
        canAdd={hasPermission("add")}
        handleAdd={handleOpen}
      />
      {dialogVisible && (
        <AddEncounterForm
          encounterToEdit={editEncounter}
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

      <PaginatedDataTable<PatientEncounterList>
        columns={columns}
        endpoint={GET_ALL_ENCOUNTERS}
        queryKey={GET_ALL_ENCOUNTERS}
        searchPlaceholder="Admit Number"
        searchFields={[
          "admitNumber",
          "patientId",
          "admitDate",
          "dischargeDate",
          "doctorId",
          "patientTypeId",
          "roomTypeId",
        ]}
        defaultPageSize={15}
        defaultSortColumn="admitDate"
        defaultSortDirection="desc"
      />
    </>
  );
}
