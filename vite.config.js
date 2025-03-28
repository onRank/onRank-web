import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    port: 3000
=======
    port: 3000,
    //   proxy: {
    //     '/auth': {
    //       target: 'http://localhost:8080',
    //       changeOrigin: true
    //     }
    //   }
>>>>>>> 96f9e71c1f17906bd3302f5a528987539e3b41fd
  },
  publicDir: "public",
});
