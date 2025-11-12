import { Weight } from "lucide-vue-next";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "shadcn-nuxt",
    "@nuxt/image",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Raleway: {
            wght: [300, 400, 700],
            ital: [300],
          },
        },
      },
    ],
    "@pinia/nuxt",
  ],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.NUXT_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.NUXT_APPWRITE_PROJECT_ID,
    },
  },
  pinia: {
    storesDirs: ["./stores/**"],
  },
});
