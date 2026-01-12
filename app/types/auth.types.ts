export interface User {
  email: string;
  name: string;
  status: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  name: string;
  confirmPassword: string;
}

export type ValidationError = Record<string, string>;

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  errors?: ValidationError;
  userMessage?: string;
}
