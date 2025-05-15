import "./index.css";
import "./styles/common.css";
import "./utils/setupUrlInterceptor.js";
import App from "./App.jsx";
import { React } from "react";
import { createRoot } from "react-dom/client";

async function enableMocking() {
  if (import.meta.env.VITE_MSW_ENABLED === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
    console.log('[MSW] Mocking enabled - 테스트 모드로 실행됩니다.')
  } else {
    console.log('[API] Real backend - 실제 백엔드와 연동됩니다.')
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <App />
  )
})
