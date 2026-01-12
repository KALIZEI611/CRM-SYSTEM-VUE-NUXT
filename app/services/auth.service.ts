import { account } from "~/Util/appwrite";
import type {
  User,
  AuthResponse,
  LoginForm,
  RegisterForm,
} from "~/types/auth.types";
import { AuthValidator } from "~/Util/validators";
import { v4 as uuid } from "uuid";

export class AuthService {
  static async login(form: LoginForm): Promise<AuthResponse> {
    try {
      const errors = AuthValidator.validateLoginForm(form);
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors: {
            form: "Пожалуйста, проверьте введенные данные",
            ...errors,
          },
          message: "Пожалуйста, проверьте введенные данные",
        };
      }

      await account.createEmailPasswordSession(
        form.email.trim(),
        form.password
      );

      const user = await account.get();

      if (!user) {
        return {
          success: false,
          errors: {
            form: "Не удалось получить данные пользователя",
          },
          message: "Ошибка при получении данных пользователя",
        };
      }

      return {
        success: true,
        user: {
          email: user.email,
          name: user.name || user.email,
          status: true,
        },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return this.handleAuthError(error, "login");
    }
  }

  static async register(form: RegisterForm): Promise<AuthResponse> {
    try {
      const errors = AuthValidator.validateRegisterForm(form);
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors: {
            form: "Пожалуйста, проверьте введенные данные",
            ...errors,
          },
          message: "Пожалуйста, проверьте введенные данные",
        };
      }

      await account.create(
        uuid(),
        form.email.trim(),
        form.password,
        form.name.trim()
      );

      const loginResponse = await this.login({
        email: form.email,
        password: form.password,
      });

      return loginResponse;
    } catch (error: any) {
      console.error("Registration error:", error);
      return this.handleAuthError(error, "register");
    }
  }

  static async logout(): Promise<boolean> {
    try {
      await account.deleteSession("current");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  static async checkSession(): Promise<User | null> {
    try {
      const user = await account.get();
      return user
        ? {
            email: user.email,
            name: user.name || user.email,
            status: true,
          }
        : null;
    } catch (error) {
      return null;
    }
  }

  private static handleAuthError(
    error: any,
    type: "login" | "register"
  ): AuthResponse {
    console.log(`Auth error (${type}):`, error.code, error.message);

    const errors: Record<string, string> = {};
    let message = "";

    const errorCode = error.code;

    switch (errorCode) {
      case 401:
        message =
          "Неверный email или пароль. Пожалуйста, проверьте введенные данные.";
        errors.form = message;
        errors.email = "Проверьте правильность email";
        errors.password = "Проверьте правильность пароля";
        break;

      case 409:
        message =
          "Пользователь с таким email уже существует. Войдите в систему или используйте другой email.";
        errors.form = message;
        errors.email = "Этот email уже зарегистрирован";
        break;

      case 400:
        message =
          "Некорректные данные. Пожалуйста, проверьте введенные данные.";
        errors.form = message;

        if (
          error.message?.includes("password") ||
          error.message?.includes("Password")
        ) {
          errors.password = "Пароль должен быть не менее 8 символов";
          message = "Пароль должен содержать минимум 8 символов.";
        }
        if (
          error.message?.includes("email") ||
          error.message?.includes("Email")
        ) {
          errors.email = "Введите корректный email";
          message = "Пожалуйста, введите корректный email адрес.";
        }
        if (
          error.message?.includes("name") ||
          error.message?.includes("Name")
        ) {
          errors.name = "Имя должно содержать минимум 2 символа";
          message = "Имя должно содержать минимум 2 символа.";
        }
        break;

      case 429:
        message =
          "Слишком много попыток. Пожалуйста, подождите несколько минут и попробуйте снова.";
        errors.form = message;
        break;

      case 403:
        message = "Доступ запрещен. Пожалуйста, обратитесь к администратору.";
        errors.form = message;
        break;

      default:
        if (
          error.message?.includes("Failed to fetch") ||
          error.message?.includes("NetworkError") ||
          error.message?.includes("Network request failed")
        ) {
          message =
            "Проблема с подключением к интернету. Проверьте ваше соединение.";
          errors.form = message;
        } else if (
          error.message?.includes("CORS") ||
          error.message?.includes("origin")
        ) {
          message =
            "Проблема с настройками доступа. Пожалуйста, обратитесь к администратору.";
          errors.form = message;
        } else {
          message =
            type === "login"
              ? "Ошибка при входе. Пожалуйста, попробуйте снова."
              : "Ошибка при регистрации. Пожалуйста, попробуйте снова.";
          errors.form = message;
        }
        break;
    }

    return {
      success: false,
      errors,
      message,  
    };
  }
}
