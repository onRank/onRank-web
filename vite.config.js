import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 기본 base 경로 설정
  let basePath = "/";

  // 개발 서버일 경우만 /develop/로 변경
  if (env.VITE_CLOUDFRONT_URL?.includes("dev.onrank.kr")) {
    basePath = "/develop/";
  }

  return {
    base: basePath,
    plugins: [react()],
    server: {
      port: 3000,
    },
    publicDir: "public",
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(env.VITE_FRONTEND_URL),
      "import.meta.env.VITE_CLOUDFRONT_URL": JSON.stringify(env.VITE_CLOUDFRONT_URL),
      "import.meta.env.VITE_MSW_ENABLED": JSON.stringify(env.VITE_MSW_ENABLED),
    },
  };
});
