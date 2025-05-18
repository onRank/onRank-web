import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // basePath 정확하게 분기 – dev 먼저 검사해야 충돌 없음
  let basePath = "/";
  if (env.VITE_CLOUDFRONT_URL?.includes("dev.onrank.kr")) {
    basePath = "/develop/";
  } else if (env.VITE_CLOUDFRONT_URL?.includes("onrank.kr")) {
    basePath = "/main/";
  }

  return {
    plugins: [react()],
    base: basePath,
    server: {
      port: 3000,
    },
    publicDir: "public",
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL),
      'import.meta.env.VITE_CLOUDFRONT_URL': JSON.stringify(env.VITE_CLOUDFRONT_URL),
      'import.meta.env.VITE_MSW_ENABLED': JSON.stringify(env.VITE_MSW_ENABLED),
    },
  };
});
