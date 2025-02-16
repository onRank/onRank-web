import "./index.css";
import App from "./App.jsx";
import { React } from "react";
import { createRoot } from "react-dom/client";

async function enableMocking() {
  if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_MSW_ENABLED === 'true') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <App />
  )
})
