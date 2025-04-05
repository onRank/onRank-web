import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import NotificationPopover from './NotificationPopover';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { setUser } = useAuth();

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleHomeClick = () => {
    navigate('/studies');
  };

  const handleStudylistClick = () => {
    navigate('/studies');
  };

  const handleCalendarClick = () => {
    navigate('/calendar');
  };

  const handleProfileClick = () => {
    navigate('/mypage');
  };

  const handleLogout = async () => {
    console.log("[Header] 로그아웃 버튼 클릭됨");

    try {
      console.log("[Header] 로그아웃 API 호출 시작");
      await authService.logout();
      console.log("[Header] 로그아웃 API 호출 성공");

      // 로컬 스토리지 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // 전역 상태 사용자 정보 초기화
      setUser(null);
      
      console.log("[Header] 페이지 이동 전");
      navigate('/');
      console.log("[Header] 페이지 이동 후 (이 로그는 표시되지 않을 수 있음)");
    } catch (error) {
      console.error("[Header] 로그아웃 실패:", error);
      alert("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <header
      style={{
        backgroundColor: `var(--cardBackground)`,
        color: `var(--textPrimary)`,
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* 로고 영역 */}
      <div
        onClick={handleHomeClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <img
          src="/logo1.png"
          alt="onRank 로고"
          style={{ height: "24px", cursor: "pointer" }}
        />
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: `var(--textPrimary)`,
            marginLeft: '0.5rem'
          }}
        >
          OnRank
        </span>
      </div>

      {/* 네비게이션 링크 영역 */}
      <nav
        style={{
          display: 'flex',
          gap: '1.5rem',
        }}
      >
        <div
          onClick={handleStudylistClick}
          style={{
            cursor: 'pointer',
            color: `var(--textPrimary)`,
            fontWeight: pathname.includes('/studies') ? 'bold' : 'normal',
          }}
        >
          스터디
        </div>
        <div
          onClick={handleCalendarClick}
          style={{
            cursor: 'pointer',
            color: `var(--textPrimary)`,
            fontWeight: pathname.includes('/calendar') ? 'bold' : 'normal',
          }}
        >
          캘린더
        </div>
        <div
          onClick={handleProfileClick}
          style={{
            cursor: 'pointer',
            color: `var(--textPrimary)`,
            fontWeight: pathname.includes('/profile') ? 'bold' : 'normal',
          }}
        >
          프로필
        </div>
      </nav>

      {/* 우측 유틸리티 영역 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* 알림 팝오버 */}
        <div onClick={handleNotificationToggle} style={{ cursor: 'pointer', color: `var(--textPrimary)` }}>
          🔔
        </div>
        
        {/* 테마 토글 버튼 */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: `var(--textPrimary)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDarkMode ? '🌞' : '🌙'}
        </button>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: `var(--primary)`,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;
