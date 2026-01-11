import { account } from '~/Util/appwrite';
import type { User, AuthResponse, LoginForm, RegisterForm } from '~/types/auth.types';
import { AuthValidator } from '~/Util/validators';
import { v4 as uuid } from 'uuid';

export class AuthService {
  // Вход пользователя
  static async login(form: LoginForm): Promise<AuthResponse> {
    try {
      // Валидация
      const errors = AuthValidator.validateLoginForm(form);
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors
        };
      }

      // Создание сессии
      await account.createEmailPasswordSession(
        form.email.trim(),
        form.password
      );

      // Получение данных пользователя
      const user = await account.get();

      if (!user) {
        return {
          success: false,
          errors: {
            form: "Не удалось получить данные пользователя"
          }
        };
      }

      return {
        success: true,
        user: {
          email: user.email,
          name: user.name || user.email,
          status: true
        }
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return this.handleAuthError(error, 'login');
    }
  }

  // Регистрация пользователя
  static async register(form: RegisterForm): Promise<AuthResponse> {
    try {
      // Валидация
      const errors = AuthValidator.validateRegisterForm(form);
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors
        };
      }

      // Создание аккаунта
      await account.create(
        uuid(),
        form.email.trim(),
        form.password,
        form.name.trim()
      );

      // Автоматический вход после регистрации
      const loginResponse = await this.login({
        email: form.email,
        password: form.password
      });

      return loginResponse;
    } catch (error: any) {
      console.error("Registration error:", error);
      return this.handleAuthError(error, 'register');
    }
  }

  // Выход пользователя
  static async logout(): Promise<boolean> {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  // Проверка текущей сессии
  static async checkSession(): Promise<User | null> {
    try {
      const user = await account.get();
      return user ? {
        email: user.email,
        name: user.name || user.email,
        status: true
      } : null;
    } catch (error) {
      return null;
    }
  }

  // Проверка доступности email (опционально, но аккуратно)
  static async checkEmailAvailability(email: string): Promise<{ available: boolean; message?: string }> {
    try {
      // Пробуем зарегистрировать временного пользователя
      const tempId = `temp_${Date.now()}`;
      const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
      
      await account.create(tempId, email, tempPassword, 'Temp User');
      
      // Если удалось создать, удаляем сессию (если она создалась)
      try {
        await account.deleteSession('current');
      } catch {}
      
      return { available: true };
    } catch (error: any) {
      if (error.code === 409) {
        return { 
          available: false, 
          message: "Пользователь с таким email уже существует" 
        };
      }
      // Для других ошибок считаем email доступным
      // (чтобы не блокировать регистрацию из-за проблем сети и т.д.)
      return { available: true };
    }
  }

  // Обработка ошибок аутентификации
  private static handleAuthError(error: any, type: 'login' | 'register'): AuthResponse {
    console.log(`Auth error (${type}):`, error.code, error.message);
    
    const errors: Record<string, string> = {};
    let suggestion = '';

    switch (error.code) {
      case 401:
        if (type === 'login') {
          errors.form = "Неверный email или пароль";
          errors.email = "Проверьте правильность email";
          errors.password = "Проверьте правильность пароля";
        } else {
          // При регистрации 401 может возникнуть при проверке
          errors.form = "Ошибка при регистрации";
        }
        break;
      
      case 409:
        if (type === 'register') {
          errors.form = "Пользователь с таким email уже существует";
          errors.email = "Этот email уже зарегистрирован";
          suggestion = "Войдите в систему, если у вас уже есть аккаунт";
        }
        break;
      
      case 400:
        errors.form = "Некорректные данные";
        if (error.message?.includes('password')) {
          errors.password = "Пароль должен быть не менее 6 символов";
        }
        if (error.message?.includes('email')) {
          errors.email = "Введите корректный email";
        }
        break;
      
      case 429:
        errors.form = "Слишком много попыток. Попробуйте позже";
        break;
      
      default:
        errors.form = type === 'login' 
          ? "Ошибка при входе. Попробуйте снова" 
          : "Ошибка при регистрации. Попробуйте снова";
        
        // Если это сетевая ошибка
        if (!navigator.onLine) {
          errors.form = "Проверьте подключение к интернету";
        }
        break;
    }

    return {
      success: false,
      errors,
      ...(suggestion && { suggestion })
    };
  }
}