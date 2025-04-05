import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import DeviceInfoBar from "./DeviceInfoBar";

function Layout() {
  const { colors } = useTheme();
  const { isLoggedIn, validateToken } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      validateToken();
    }
  }, [isLoggedIn, validateToken]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <DeviceInfoBar />
      <Header />
      <MobileHeader />
      <main
        style={{
          flex: 1,
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout; 