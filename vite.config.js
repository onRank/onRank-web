import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 브랜치별 경로 설정: CloudFront가 S3의 /main 또는 /develop을 서빙하므로 base 필요
  let basePath = "/";
  if (env.VITE_CLOUDFRONT_URL?.includes("dev.onrank.kr")) {
    basePath = "/develop/";
  } else if (env.VITE_CLOUDFRONT_URL?.includes("onrank.kr")) {
    basePath = "/main/";
  }

  return {
    plugins: [react()],
    base: basePath, // ✅ 추가: 브랜치에 맞는 정적 파일 base 경로 지정
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
