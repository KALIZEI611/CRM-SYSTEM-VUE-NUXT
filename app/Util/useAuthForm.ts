import { reactive, ref, computed } from 'vue';
import type { ValidationError, LoginForm, RegisterForm } from '~/types/auth.types';
import { AuthValidator } from '~/Util/validators';

export function useAuthForm() {
  const isLoginMode = ref(true);

  const loginForm = reactive<LoginForm>({
    email: '',
    password: ''
  });

  const registerForm = reactive<RegisterForm>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const errors = reactive<{
    login: ValidationError;
    register: ValidationError;
  }>({
    login: {},
    register: {}
  });

  const isLoginFormValid = computed(() => {
    return !AuthValidator.hasErrors(AuthValidator.validateLoginForm(loginForm));
  });

  const isRegisterFormValid = computed(() => {
    return !AuthValidator.hasErrors(AuthValidator.validateRegisterForm(registerForm));
  });

  const clearErrors = (formType: 'login' | 'register') => {
    if (formType === 'login') {
      errors.login = {};
    } else {
      errors.register = {};
    }
  };

  const clearForm = (formType: 'login' | 'register') => {
    if (formType === 'login') {
      Object.assign(loginForm, {
        email: '',
        password: ''
      });
    } else {
      Object.assign(registerForm, {
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
      });
    }
    clearErrors(formType);
  };

  const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
    clearErrors(isLoginMode.value ? 'login' : 'register');
  };

  const setErrors = (formType: 'login' | 'register', newErrors: ValidationError) => {
    if (formType === 'login') {
      errors.login = { ...errors.login, ...newErrors };
    } else {
      errors.register = { ...errors.register, ...newErrors };
    }
  };

  return {
    isLoginMode,
    loginForm,
    registerForm,
    errors,
    isLoginFormValid,
    isRegisterFormValid,
    clearErrors,
    clearForm,
    toggleMode,
    setErrors
  };
}