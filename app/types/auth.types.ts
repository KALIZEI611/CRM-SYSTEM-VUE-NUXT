export interface User {
  id?: string;
  email: string;
  name: string;
  status: boolean;
}

export interface ValidationError {
  [key: string]: string | undefined;
  form?: string;
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  errors?: ValidationError;
} 