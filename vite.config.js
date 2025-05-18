import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 기본값
  let basePath = "/";
  let apiUrl = env.VITE_API_URL;
  const frontendURL = env.VITE_FRONTEND_URL;

  // 명확한 환경 감지: env에서 전달된 URL 기준
  if (frontendURL === "https://dev.onrank.kr") {
    basePath = "/develop/";
    apiUrl = "https://api-dev.onrank.kr";
  } else if (frontendURL === "https://onrank.kr") {
    basePath = "/";
    apiUrl = "https://api.onrank.kr";
  }

  return {
    plugins: [react()],
    base: basePath,
    server: {
      port: 3000,
    },
    publicDir: "public",
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(frontendURL),
      'import.meta.env.VITE_CLOUDFRONT_URL': JSON.stringify(env.VITE_CLOUDFRONT_URL),
      'import.meta.env.VITE_MSW_ENABLED': JSON.stringify(env.VITE_MSW_ENABLED),
    },
  };
});
