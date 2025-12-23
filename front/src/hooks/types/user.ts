export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleId?: string;
  emailConfirmed?: boolean;
}
