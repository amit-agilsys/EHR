import { Doctor } from "hooks/types/doctors";
import { z } from "zod";

export const doctorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\d{10}$/, {
      message: "Phone number must be exactly 10 digits",
    }),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;

export const defaultValues: Doctor = {
  id: 0,
  name: "",
  email: "",
  phone: "",
};
