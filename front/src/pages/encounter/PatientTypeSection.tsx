import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { SelectField } from "components/form/SelectField";
import { FormFiledTime } from "components/form/FormFieldTime";
import { PatientTypeSegmentItem } from "./schema";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientTypeSegmentSchema } from "./schema";
import { Button } from "components/ui/button";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { formatDate, timeOnly } from "utils/utils";
const defaultSegmentValues: PatientTypeSegmentItem = {
  id: 0,
  patientTypeId: 0,
  transferInDate: "",
  transferInTime: "",
};

interface PatientTypeSectionProps {
  segments: PatientTypeSegmentItem[];
  onAddSegment: (segment: PatientTypeSegmentItem) => void;
  onUpdateSegment: (index: number, segment: PatientTypeSegmentItem) => void;
  onDeleteSegment: (index: number) => void;
  admitDate: string;
  admitTime: string;
  dischargeDate?: string | null;
  dischargeTime?: string | null;
}

export default function PatientTypeSection({
  segments,
  onAddSegment,
  onUpdateSegment,
  onDeleteSegment,
  admitDate,
  admitTime,
  dischargeDate,
  dischargeTime,
}: PatientTypeSectionProps) {
  const LIST_PATIENT_TYPE = useSelector(
    (state: RootState) => state.list.patientType
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    control,
    register,
    formState: { errors },
    reset,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = useForm<PatientTypeSegmentItem>({
    resolver: zodResolver(
      patientTypeSegmentSchema
    ) as Resolver<PatientTypeSegmentItem>,
    mode: "onSubmit",
    defaultValues: defaultSegmentValues,
  });

  const handleAddOrUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    let hasErrors = false;

    if (admitDate && data.transferInDate < admitDate) {
      setError("transferInDate", {
        type: "manual",
        message: "Transfer In Date cannot be before Admit Date",
      });
      hasErrors = true;
    }

    if (dischargeDate && data.transferInDate > dischargeDate) {
      setError("transferInDate", {
        type: "manual",
        message: "Transfer In Date cannot be after Discharge Date",
      });
      hasErrors = true;
    }

    if (segments.length > 0 && editingIndex === null) {
      const lastSegment = segments[segments.length - 1];

      if (data.transferInDate < lastSegment.transferInDate) {
        setError("transferInDate", {
          type: "manual",
          message: "Transfer In Date must be after previous segment",
        });
        hasErrors = true;
      } else if (data.transferInDate === lastSegment.transferInDate) {
        const lastTime = new Date(`1970-01-01T${lastSegment.transferInTime}`);
        const newTime = new Date(`1970-01-01T${data.transferInTime}`);

        if (newTime <= lastTime) {
          setError("transferInTime", {
            type: "manual",
            message: "Transfer In Time must be after previous segment",
          });
          hasErrors = true;
        }
      }
    }

    if (editingIndex !== null) {
      if (editingIndex > 0) {
        const prevSegment = segments[editingIndex - 1];

        if (data.transferInDate < prevSegment.transferInDate) {
          setError("transferInDate", {
            type: "manual",
            message: "Transfer In Date must be after previous segment",
          });
          hasErrors = true;
        } else if (data.transferInDate === prevSegment.transferInDate) {
          const prevTime = new Date(`1970-01-01T${prevSegment.transferInTime}`);
          const newTime = new Date(`1970-01-01T${data.transferInTime}`);

          if (newTime <= prevTime) {
            setError("transferInTime", {
              type: "manual",
              message: "Transfer In Time must be after previous segment",
            });
            hasErrors = true;
          }
        }
      }

      if (editingIndex < segments.length - 1) {
        const nextSegment = segments[editingIndex + 1];

        if (data.transferInDate > nextSegment.transferInDate) {
          setError("transferInDate", {
            type: "manual",
            message: "Transfer In Date must be before next segment",
          });
          hasErrors = true;
        } else if (data.transferInDate === nextSegment.transferInDate) {
          const nextTime = new Date(`1970-01-01T${nextSegment.transferInTime}`);
          const newTime = new Date(`1970-01-01T${data.transferInTime}`);

          if (newTime >= nextTime) {
            setError("transferInTime", {
              type: "manual",
              message: "Transfer In Time must be before next segment",
            });
            hasErrors = true;
          }
        }
      }
    }

    if (admitDate && admitTime && data.transferInDate === admitDate) {
      const admit = new Date(`1970-01-01T${admitTime}`);
      const transferIn = new Date(`1970-01-01T${data.transferInTime}`);

      if (transferIn <= admit) {
        setError("transferInTime", {
          type: "manual",
          message: "Transfer In Time must be after Admit Time",
        });
        hasErrors = true;
      }
    }

    if (
      dischargeDate &&
      dischargeTime &&
      data.transferInDate === dischargeDate
    ) {
      const discharge = new Date(`1970-01-01T${dischargeTime}`);
      const transferIn = new Date(`1970-01-01T${data.transferInTime}`);

      if (transferIn >= discharge) {
        setError("transferInTime", {
          type: "manual",
          message: "Transfer In Time must be before Discharge Time",
        });
        hasErrors = true;
      }
    }

    if (hasErrors) return;

    if (editingIndex !== null) {
      onUpdateSegment(editingIndex, data);
      setEditingIndex(null);
    } else {
      onAddSegment(data);
    }

    clearErrors();
    reset(defaultSegmentValues);
  };

  const handleEdit = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const segment = segments[index];
    reset(segment);
    setEditingIndex(index);
  };

  const handleCancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditingIndex(null);
    clearErrors();
    reset(defaultSegmentValues);
  };

  const handleDelete = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    onDeleteSegment(index);
  };

  const getPatientTypeName = (id: number): string => {
    const patientType = LIST_PATIENT_TYPE.find((pt) => pt.id == id);
    return patientType?.name || "";
  };

  return (
    <div className="mt-6">
      {/* Add/Edit Segment Form */}
      <div className="border border-dashed border-gray-300 p-4 rounded">
        <div className="flex justify-between items-start mb-2">
          <h4 className="mb-4">
            {editingIndex !== null ? "Edit LOC" : "Add LOC"}
          </h4>
          <div className="flex gap-2">
            <Button onClick={handleAddOrUpdate} className="">
              {editingIndex !== null ? "Update LOC" : "Add LOC"}
            </Button>
            {editingIndex !== null && (
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SelectField
            label="Level of Care"
            id="patientTypeId"
            className="w-full"
            options={LIST_PATIENT_TYPE}
            control={control}
            errors={errors}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="transferInDate">
              Transfer In Date
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="transferInDate"
              className={`w-full block ${
                errors.transferInDate ? "border-red-500" : ""
              }`}
              type="date"
              {...register("transferInDate", {
                required: "Transfer In Date is required",
              })}
            />
            {errors.transferInDate && (
              <p className="text-sm text-red-500">
                {errors.transferInDate.message}
              </p>
            )}
          </div>

          <FormFiledTime
            label="Transfer In Time"
            className="w-full"
            id="transferInTime"
            register={register}
            errors={errors}
          />
        </div>
      </div>
      <hr className="mb-4" />
      {/* <h3 className="text-md mb-4">Level of Care</h3> */}

      {/* Existing Segments Table */}
      {segments.length > 0 && (
        <div className="mb-6">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-gray-700">LOC</TableHead>
                <TableHead className="text-gray-700">
                  Transfer In Date
                </TableHead>
                <TableHead className="text-gray-700">
                  Transfer In Time
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment, index) => (
                <TableRow
                  key={index}
                  className={editingIndex === index ? "bg-blue-50" : ""}
                >
                  <TableCell>
                    {getPatientTypeName(segment.patientTypeId)}
                  </TableCell>
                  <TableCell>{formatDate(segment.transferInDate)}</TableCell>
                  <TableCell>{timeOnly(segment.transferInTime)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-end items-center h-full">
                      <button
                        className="text-semibold me-2 rounded bg-gray-100 px-2 py-1.5 font-medium text-gray-600"
                        onClick={(e) => handleEdit(index, e)}
                      >
                        <MdOutlineEdit />
                      </button>

                      <button
                        className="me-2 rounded bg-red-100 px-2 py-1.5 text-sm font-medium text-red-400 dark:bg-red-900 dark:text-red-300"
                        onClick={(e) => handleDelete(index, e)}
                      >
                        <MdOutlineDelete />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
