import { config } from "dotenv";
config({ path: "./.env" });

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@/assets/css/global.css"],
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
    redirectOptions: {
      login: "/auth",
      callback: "/callback",
    },
  },
  ssr: false,
});
