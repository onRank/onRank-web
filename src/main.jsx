import "./index.css";
import App from "./App.jsx";
import { React } from "react";
import { createRoot } from "react-dom/client";

async function enableMocking() {
  if (process.env.NODE_ENV === 'development' && 
      import.meta.env.VITE_MSW_ENABLED === 'true' && 
      !window.msw) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    window.msw = true;
  }
}

// MSW 초기화 (development 환경에서만)
// if (import.meta.env.VITE_MSW_ENABLED === 'true' && !window.msw) {
//   const { worker } = await import('./mocks/browser');
//   worker.start();
//   window.msw = true;
// }

enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <App />
  )
})
