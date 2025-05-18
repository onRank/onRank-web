// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  // GitHub Actions에서 주입한 환경변수들 사용 (process.env.*)
  const apiUrl = process.env.VITE_API_URL || "http://localhost:8080";
  const frontendURL = process.env.VITE_FRONTEND_URL || "";
  const cloudfrontURL = process.env.VITE_CLOUDFRONT_URL || "";
  const mswEnabled = process.env.VITE_MSW_ENABLED || "false";

  let basePath = "/";
  if (frontendURL.includes("dev.onrank.kr")) {
    basePath = "/develop/";
  }

  return {
    plugins: [react()],
    base: basePath,
    server: { port: 3000 },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(frontendURL),
      "import.meta.env.VITE_CLOUDFRONT_URL": JSON.stringify(cloudfrontURL),
      "import.meta.env.VITE_MSW_ENABLED": JSON.stringify(mswEnabled),
    },
  };
});
