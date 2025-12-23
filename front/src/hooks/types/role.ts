export interface RolePermissionItem {
  screenId: number;
  actionId: number;
}

export interface Role {
  roleId: string;
  roleName: string;
  isActive: boolean;
  permissions: RolePermissionItem[];
}

export interface RoleList {
  roleId: string;
  roleName: string;
}
