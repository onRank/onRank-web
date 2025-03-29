import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import NotificationPopover from "./NotificationPopover";

function Header() {
  const styles = {
    header: {
      backgroundColor: "#fff",
      borderBottom: "1px solid #ddd",
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
    },
    nav: {
      display: "flex",
      gap: "16px",
    },
    navLink: {
      textDecoration: "none",
      color: "#333",
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
      border: "1px solid #ccc",
      borderRadius: "6px",
      backgroundColor: "#f5f5f5",
      cursor: "pointer",
      fontSize: "14px",
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

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.logo}>onRank</span>
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
        <button onClick={handleLogout} style={styles.logoutBtn}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
