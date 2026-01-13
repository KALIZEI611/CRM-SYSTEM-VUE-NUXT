// middleware/auth.global.ts
import { account } from "~/Util/appwrite";
import { navigateTo } from "#imports";

export default defineNuxtRouteMiddleware(async (to) => {
  // Пропускаем страницу входа
  if (to.path === "/login" || to.path === "/register") {
    return;
  }

  try {
    // Проверяем, есть ли активная сессия
    await account.get();
  } catch (error) {
    // Если нет сессии, перенаправляем на страницу входа
    return navigateTo("/login");
  }
});
