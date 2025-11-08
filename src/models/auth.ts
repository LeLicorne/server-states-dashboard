export interface Auth {
  access: string;
  refresh: string;
}

export interface AuthCreate {
  username: string;
  password: string;
}
