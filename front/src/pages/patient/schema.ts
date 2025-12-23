import { format } from "date-fns";
import { z } from "zod";

const getTodayDate = () => format(new Date(), "yyyy-MM-dd");

export const patientSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    mrn: z.string().min(1, { message: "MRN is required" }),
    dob: z.string().min(1, { message: "DOB is required" }),
    gender: z.string().min(1, { message: "Gender is required" }),
    insuranceNumber: z
      .string()
      .min(1, { message: "Insurance Number is required" }),
    financialId: z.coerce
      .number({ message: "Financial Class is required" })
      .min(1, { message: "Financial Class is required" }),
    patientInsurance1Id: z.coerce
      .number({ message: "Primary Insurance is required" })
      .min(1, { message: "Primary Insurance is required" }),
    patientInsurance2Id: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dob.split("T")[0] > getTodayDate()) {
      ctx.addIssue({
        path: ["dob"],
        code: z.ZodIssueCode.custom,
        message: "Date of Birth cannot be in the future",
      });
    }
  });

export type PatientFormData = z.infer<typeof patientSchema>;

export const defaultValues: PatientFormData = {
  name: "",
  mrn: "",
  dob: "",
  gender: "",
  insuranceNumber: "",
  financialId: 0,
  patientInsurance1Id: 0,
  patientInsurance2Id: 0,
};
