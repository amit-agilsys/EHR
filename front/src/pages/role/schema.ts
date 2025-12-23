import { z } from "zod";

export const roleSchema = z.object({
  roleId: z.string(),
  roleName: z.string().min(1, { message: "Name is required" }),
  isActive: z.boolean(),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const defaultValues: RoleFormData = {
  roleId: "0",
  roleName: "",
  isActive: true,
};

export interface RolePermissionItem {
  screenId: number;
  screenActionId: number;
}

export interface Role {
  roleId: string;
  roleName: string;
  isActive: boolean;
  permissions: RolePermissionItem[];
}
