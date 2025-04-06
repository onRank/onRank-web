import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { authService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

function MobileHeader() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const styles = {
    header: {
      display: "none",
      backgroundColor: colors.headerBackground,
      borderBottom: `1px solid ${colors.border}`,
      padding: "12px 16px",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      zIndex: 1000,
      "@media (max-width: 768px)": {
        display: "flex",
      },
    },
    menuButton: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: colors.text,
    },
    logo: {
      height: "24px",
    },
    menu: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: colors.headerBackground,
      borderBottom: `1px solid ${colors.border}`,
      padding: "16px",
      display: isMenuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "16px",
    },
    menuItem: {
      textDecoration: "none",
      color: colors.text,
      fontSize: "16px",
      background: "none",
      border: "none",
      padding: "8px 0",
      textAlign: "left",
      cursor: "pointer",
    },
    themeToggleBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: colors.text,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "8px 0",
      fontSize: "16px",
    },
  };

  const responsiveStyles = `
    @media (min-width: 769px) {
      .mobile-header {
        display: none;
      }
    }
    @media (max-width: 768px) {
      .mobile-header {
        display: flex;
      }
    }
  `;

  const handleStudylistClick = () => {
    navigate("/studies");
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/mypage");
    setIsMenuOpen(false);
  };

  const handleCalendarClick = () => {
    navigate("/calendar");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // 메뉴 닫기
      setIsMenuOpen(false);
      
      // API 로그아웃 요청
      await authService.logout();
      
      // 추가: localStorage에서 스터디 관련 데이터 정리
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('study_') || key === 'studies_list') {
          keysToRemove.push(key);
        }
      }
      
      // 수집된 키 삭제
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`[MobileHeader] localStorage에서 ${key} 삭제`);
      });
      
      // 세션 스토리지 클리어
      sessionStorage.removeItem('accessToken_backup');
      sessionStorage.removeItem('cachedUserInfo');
      console.log('[MobileHeader] sessionStorage에서 토큰 및 사용자 정보 삭제');
      
      // 홈으로 이동
      navigate('/');
    } catch (error) {
      console.error('[MobileHeader] 로그아웃 오류:', error);
      // 오류 발생해도 sessionStorage 클리어
      sessionStorage.removeItem('accessToken_backup');
      sessionStorage.removeItem('cachedUserInfo');
      navigate('/');
    }
  };

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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      )}
    </svg>
  );

  return (
    <>
      <style>{responsiveStyles}</style>
      <header className="mobile-header" style={styles.header}>
        <button
          style={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <img
          src="/logo1.png"
          alt="onRank 로고"
          style={styles.logo}
          onClick={() => navigate("/studies")}
        />
        <div style={{ width: "24px" }}></div>

        {isMenuOpen && (
          <div style={styles.menu}>
            <button style={styles.menuItem} onClick={handleStudylistClick}>
              스터디 목록
            </button>
            <button style={styles.menuItem} onClick={handleCalendarClick}>
              캘린더
            </button>
            <button style={styles.menuItem} onClick={handleProfileClick}>
              마이페이지
            </button>
            <button 
              style={styles.themeToggleBtn} 
              onClick={toggleTheme}
            >
              <ThemeIcon />
              {isDarkMode ? "라이트모드" : "다크모드"}
            </button>
            <button style={styles.menuItem} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </header>
    </>
  );
}

export default MobileHeader; 