import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import DeviceInfoBar from "./DeviceInfoBar";

function Layout() {
  const { colors } = useTheme();
  const { isLoggedIn, validateToken } = useAuth();
  const location = useLocation();
  
  // 헤더를 표시하지 않을 경로 목록
  const hideHeaderPaths = ['/', '/login', '/auth/callback', '/oauth/callback', '/auth/add'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

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
      {shouldShowHeader && (
        <>
          <DeviceInfoBar />
          <Header />
          <MobileHeader />
        </>
      )}
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