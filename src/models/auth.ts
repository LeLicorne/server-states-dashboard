export interface Auth {
  access: string;
  refresh: string;
  uid?: string;
  email?: string;
  isAdmin?: boolean;
  active?: boolean;
}

export interface AuthCreate {
  username: string;
  password: string;
}
