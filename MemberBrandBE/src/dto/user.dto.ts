export enum UserRole {
  MEMBER = "member",
  BRAND = "brand",
}
export class UserResponse {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  role: UserRole;
}

