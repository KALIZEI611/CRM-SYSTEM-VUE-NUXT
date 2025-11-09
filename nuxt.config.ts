
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "shadcn-nuxt",
    "@nuxt/image",
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
});
