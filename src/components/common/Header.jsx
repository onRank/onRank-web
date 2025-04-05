import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import NotificationPopover from "./NotificationPopover";

function Header() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  const styles = {
    header: {
      backgroundColor: colors.headerBackground,
      borderBottom: `1px solid ${colors.border}`,
      padding: "12px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    left: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
    },
    logo: {
      fontWeight: "bold",
      fontSize: "18px",
      color: colors.text,
    },
    nav: {
      display: "flex",
      gap: "16px",
    },
    navLink: {
      textDecoration: "none",
      color: colors.text,
      fontSize: "14px",
      background: "none",
      border: "none",
      padding: "0",
      cursor: "pointer",
    },
    right: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoutBtn: {
      padding: "6px 12px",
      fontFamily: "Lexend",
      border: "none",
      borderRadius: "6px",
      backgroundColor: colors.buttonBackground,
      color: colors.text,
      cursor: "pointer",
      fontSize: "14px",
    },
    themeToggleBtn: {
      padding: "6px 12px",
      fontFamily: "Lexend",
      border: "none",
      borderRadius: "6px",
      backgroundColor: colors.buttonBackground,
      color: colors.text,
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
  };

  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleStudylistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/studies");
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/mypage");
  };

  const handleCalendarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/calendar");
  };

  const handleLogout = async (e) => {
    // 이벤트 전파 중단 및 기본 동작 방지
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("[Header] 로그아웃 버튼 클릭됨");

    try {
      console.log("[Header] authService.logout 호출 전");
      await authService.logout();
      console.log("[Header] authService.logout 호출 후");

      console.log("[Header] setUser(null) 호출 전");
      setUser(null);
      console.log("[Header] setUser(null) 호출 후");

      console.log("[Header] 페이지 이동 전");
      // navigate 대신 window.location 사용
      window.location.href = "/";
      console.log("[Header] 페이지 이동 후 (이 로그는 표시되지 않을 수 있음)");
    } catch (error) {
      console.error("[Header] 로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 테마 아이콘 (라이트/다크모드)
  const ThemeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isDarkMode ? (
        // 다크모드 아이콘 (해)
        <>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </>
      ) : (
        // 라이트모드 아이콘 (달)
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      )}
    </svg>
  );

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <img
          src="/logo1.png"
          alt="onRank 로고"
          style={{ height: "24px", cursor: "pointer" }}
          onClick={() => navigate("/studies")}
        />
        <nav style={styles.nav}>
          <a
            href="/studies"
            style={styles.navLink}
            onClick={handleStudylistClick}
          >
            스터디 목록
          </a>
          <a
            href="/calendar"
            style={styles.navLink}
            onClick={handleCalendarClick}
          >
            캘린더
          </a>
          <a href="/mypage" style={styles.navLink} onClick={handleProfileClick}>
            마이페이지
          </a>
        </nav>
      </div>
      <div style={styles.right}>
        <NotificationPopover
          isOpen={isNotificationOpen}
          setIsOpen={setIsNotificationOpen}
        />
        <button 
          onClick={toggleTheme} 
          style={styles.themeToggleBtn}
          title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          <ThemeIcon />
          {isDarkMode ? "라이트" : "다크"}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
