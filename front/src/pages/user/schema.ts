import { User } from "hooks/types/user";
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\d{10}$/, {
      message: "Phone number must be exactly 10 digits",
    }),
  role: z.string().min(1, { message: "Role is required" }),
});

export type UserFormData = z.infer<typeof userSchema>;

export const defaultValues: User = {
  id: "",
  name: "",
  email: "",
  phoneNumber: "",
  emailConfirmed: false,
  role: "",
};
