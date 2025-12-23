import { z } from "zod";
import { parse, format, isAfter } from "date-fns";

const getTodayDate = () => format(new Date(), "yyyy-MM-dd");
const getNowTime = () => format(new Date(), "HH:mm:ss");

const makeDT = (date: string, time: string) =>
  parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());

export const patientTypeSegmentSchema = z
  .object({
    id: z.number().default(0),
    patientTypeId: z.coerce.number().default(0),
    transferInDate: z
      .string()
      .min(1, { message: "Transfer In Date is required" }),
    transferInTime: z
      .string()
      .min(1, { message: "Transfer In Time is required" }),
  })
  .refine((data) => data.patientTypeId > 0, {
    message: "Level of Care is required",
    path: ["patientTypeId"],
  })
  .superRefine((data, ctx) => {
    const today = getTodayDate();

    if (data.transferInDate > today) {
      ctx.addIssue({
        path: ["transferInDate"],
        code: z.ZodIssueCode.custom,
        message: "Transfer In Date cannot be in the future",
      });
    }
  });

export const encounterItemSchema = z
  .object({
    id: z.number().optional(),

    patientId: z.coerce
      .number({ message: "Patient is required" })
      .min(1, { message: "Patient is required" }),
    patientName: z.string().optional(),

    admitDate: z.string().min(1, { message: "Admit Date is required" }),
    admitTime: z.string().min(1, { message: "Admit Time is required" }),

    dischargeDate: z.string().nullable().optional(),
    dischargeTime: z.string().nullable().optional().default(""),

    doctorId: z.coerce
      .number({ message: "Doctor is required" })
      .min(1, { message: "Doctor is required" }),
    doctorName: z.string().optional(),

    patientTypeId: z.coerce
      .number({ message: "Level of Care is required" })
      .min(1, { message: "Level of Care is required" }),

    roomTypeId: z.coerce.number({ message: "Room Type is required" }).min(1, {
      message: "Room Type is required",
    }),
    patientTypeSegments: z.array(patientTypeSegmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const today = getTodayDate();
    const nowTime = getNowTime();

    if (data.admitDate > today) {
      ctx.addIssue({
        path: ["admitDate"],
        code: z.ZodIssueCode.custom,
        message: "Admit Date cannot be in the future",
      });
    }

    if (data.admitDate === today && data.admitTime > nowTime) {
      ctx.addIssue({
        path: ["admitTime"],
        code: z.ZodIssueCode.custom,
        message: "Admit Time cannot be in the future",
      });
    }

    if (data.dischargeDate && data.dischargeDate.split("T")[0] > today) {
      ctx.addIssue({
        path: ["dischargeDate"],
        code: z.ZodIssueCode.custom,
        message: "Discharge Date cannot be in the future",
      });
    }

    if (data.dischargeDate && data.dischargeDate > today) {
      ctx.addIssue({
        path: ["dischargeDate"],
        code: z.ZodIssueCode.custom,
        message: "Discharge Date cannot be in the future",
      });
    }

    if (data.dischargeDate && !data.dischargeTime) {
      ctx.addIssue({
        path: ["dischargeTime"],
        code: z.ZodIssueCode.custom,
        message: "Discharge Time is required",
      });
    }

    if (
      (data.dischargeDate && !data.dischargeTime) ||
      (!data.dischargeDate && data.dischargeTime)
    ) {
      ctx.addIssue({
        path: ["dischargeTime"],
        code: z.ZodIssueCode.custom,
        message: "Discharge Date & Time must both be provided",
      });
    }

    if (data.dischargeTime) {
      if (data.dischargeDate === today && data.dischargeTime > nowTime) {
        ctx.addIssue({
          path: ["dischargeTime"],
          code: z.ZodIssueCode.custom,
          message: "Discharge Time cannot be in the future",
        });
      }
    }

    if (data.dischargeDate && data.dischargeTime) {
      const dischargeDT = makeDT(data.dischargeDate, data.dischargeTime);

      if (isAfter(dischargeDT, new Date())) {
        ctx.addIssue({
          path: ["dischargeTime"],
          code: z.ZodIssueCode.custom,
          message: "Discharge datetime cannot be in the future",
        });
      }
    }
    if (data.dischargeDate && data.admitDate) {
      if (data.dischargeDate < data.admitDate) {
        ctx.addIssue({
          path: ["dischargeDate"],
          code: z.ZodIssueCode.custom,
          message: "Discharge Date must be later than Admit Date",
        });
        return;
      }

      if (data.dischargeDate === data.admitDate) {
        const admitT = data.admitTime || "00:00";
        const dischargeT = data.dischargeTime || "00:00";

        if (dischargeT <= admitT) {
          ctx.addIssue({
            path: ["dischargeTime"],
            code: z.ZodIssueCode.custom,
            message: "Discharge Time must be later than Admit Time",
          });
          return;
        }
      }
    }
  });

export type EncounterItem = z.output<typeof encounterItemSchema>;
export type PatientTypeSegmentItem = z.output<typeof patientTypeSegmentSchema>;

export const defaultValues: EncounterItem = {
  id: 0,
  admitDate: "",
  admitTime: "",
  dischargeDate: "",
  dischargeTime: "",
  doctorId: 0,
  patientTypeId: 0,
  roomTypeId: 0,
  patientId: 0,
  patientName: "",
  doctorName: "",
  patientTypeSegments: [],
};
