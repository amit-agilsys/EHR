export interface User {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  code: number;
  result?: {
    name: string;
    email: string;
    roleName?: string;
    id?: string;
    token?: string;
    permissions: Permission[];
  };
}

export interface ResetPassword {
  password: string;
  token: string;
  email: string;
}

export interface Permission {
  screenName: string;
  actionName: string;
}
