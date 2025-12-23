import ConfirmDelete from "components/ConfirmDelete";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EditDeleteTemplate from "components/EditDeleteTemplate";

import { PatientEncounterList } from "hooks/types/patient";
import { useEncounter } from "hooks/api/useEncounter";
import { RootState } from "store/store";

import { useLocation } from "react-router-dom";
import { PaginatedDataTable } from "components/PaginatedDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { GET_ENCOUNTER_BY_ID } from "constants/endPoints";
import { EncounterItem } from "./schema";
import AddEncounterForm from "./AddEncounterForm";
import { Button } from "components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { formatDate } from "utils/utils";

type ListItem = { id: string | number; name: string };

export default function EncounterList() {
  const location = useLocation();
  const { patientId } = location.state || {};
  const queryKey = GET_ENCOUNTER_BY_ID + patientId;
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editEncounter, setEditEncounter] = useState<EncounterItem | null>(
    null
  );

  const { deleteEncounter } = useEncounter(false, queryKey);

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
      admitTime: encounter.admitTime,
      doctorId: encounter.doctorId,
      doctorName: getNameFromList(encounter.doctorId, doctor),
      patientTypeId: encounter.patientTypeId,
      roomTypeId: encounter.roomTypeId,
      admitDate: encounter.admitDate.toString().split("T")[0],
      dischargeDate: encounter.dischargeDate
        ? encounter.dischargeDate.toString().split("T")[0]
        : null,
      dischargeTime: encounter.dischargeTime ?? null,
      patientTypeSegments: (encounter.patientTypeSegments || []).map(
        (segment) => ({
          id: segment.id,
          patientTypeId: segment.patientTypeId,
          transferInDate: segment.transferInDate.toString().split("T")[0],
          transferInTime: segment.transferInTime,
        })
      ),
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
      accessorKey: "admitDate",
      header: "Admit Date",
      cell: ({ row }) => formatDate(row.original.admitDate),
    },
    {
      accessorKey: "dischargeDate",
      header: "Discharge Date",
      cell: ({ row }) => formatDate(row.original.dischargeDate),
      enableSorting: true,
    },
    {
      accessorKey: "doctorId",
      header: "Doctor",
      cell: ({ row }) => getNameFromList(row.original.doctorId, doctor),
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
        return <div className="text-right mr-4">Actions</div>;
      },
      cell: ({ row }) => {
        const encounter = row.original;
        return (
          <div className="flex justify-end">
            <EditDeleteTemplate
              id={encounter.id}
              _edit
              _delete
              handleEdit={() => handleEdit(encounter)}
              handleDelete={confirmDelete}
            />
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const handleAddEditClose = () => {
    setEditEncounter(null);
    setDialogVisible(false);
  };

  const handleOpen = () => {
    if (!Number(patientId) || Number(patientId) === 0)
      return toast.error("Please add a patient first.");

    setDialogVisible(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-end">
        <Button className="absolute -top-10" onClick={handleOpen}>
          <PlusCircle className="h-4 w-4" />
          Add Encounter
        </Button>
      </div>
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
      {patientId ? (
        <PaginatedDataTable<PatientEncounterList>
          columns={columns}
          endpoint={`${GET_ENCOUNTER_BY_ID}/${patientId}`}
          queryKey={queryKey}
          searchPlaceholder="Admit Number"
          searchFields={[
            "admitNumber",
            "admitDate",
            "dischargeDate",
            "doctorId",
            "patientTypeId",
            "roomTypeId",
          ]}
          defaultPageSize={10}
          defaultSortColumn="Id"
          defaultSortDirection="desc"
        />
      ) : (
        <div className="flex justify-center">
          <h1 className="text-lg font-bold">Please add a patient first.</h1>
        </div>
      )}
    </div>
  );
}

//fix it
