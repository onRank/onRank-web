import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 mode (development, production 등)에 따라 .env 값 로드
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    publicDir: "public",

    // GitHub Actions에서 주입된 환경변수를 Vite 번들에 명시적으로 삽입
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL),
      'import.meta.env.VITE_CLOUDFRONT_URL': JSON.stringify(env.VITE_CLOUDFRONT_URL),
      'import.meta.env.VITE_MSW_ENABLED': JSON.stringify(env.VITE_MSW_ENABLED),
    },
  };
});
