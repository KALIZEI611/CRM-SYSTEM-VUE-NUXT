import { EMAIL_REGEX, PASSWORD_MIN_LENGTH, NAME_MIN_LENGTH } from '~/constants/auth.constants';
import type { ValidationError, LoginForm, RegisterForm } from '~/types/auth.types';

export class AuthValidator {
  static validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
  }

  static validatePassword(password: string): boolean {
    return password.length >= PASSWORD_MIN_LENGTH;
  }

  static validateName(name: string): boolean {
    return name.trim().length >= NAME_MIN_LENGTH;
  }

  static validateLoginForm(form: LoginForm): ValidationError {
    const errors: ValidationError = {};

    if (!form.email.trim()) {
      errors.email = "Email обязателен";
    } else if (!this.validateEmail(form.email)) {
      errors.email = "Введите корректный email";
    }

    if (!form.password) {
      errors.password = "Пароль обязателен";
    } else if (!this.validatePassword(form.password)) {
      errors.password = `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`;
    }

    return errors;
  }

  static validateRegisterForm(form: RegisterForm): ValidationError {
    const errors: ValidationError = {};

    if (!form.name.trim()) {
      errors.name = "Имя обязательно";
    } else if (!this.validateName(form.name)) {
      errors.name = `Имя должно содержать минимум ${NAME_MIN_LENGTH} символа`;
    }

    if (!form.email.trim()) {
      errors.email = "Email обязателен";
    } else if (!this.validateEmail(form.email)) {
      errors.email = "Введите корректный email";
    }

    if (!form.password) {
      errors.password = "Пароль обязателен";
    } else if (!this.validatePassword(form.password)) {
      errors.password = `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`;
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Подтверждение пароля обязательно";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают";
    }

    return errors;
  }

  static hasErrors(errors: ValidationError): boolean {
    return Object.keys(errors).length > 0;
  }
}