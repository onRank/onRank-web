import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const basePath =
    env.VITE_FRONTEND_URL?.includes("dev.onrank.kr") ? "/develop/" : "/";

  return {
    plugins: [react()],
    base: basePath,
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
