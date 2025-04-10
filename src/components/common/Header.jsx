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
    try {
      console.log('[Header] 로그아웃 시도');
      
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
        console.log(`[Header] localStorage에서 ${key} 삭제`);
      });
      
      // 세션 스토리지 클리어
      sessionStorage.removeItem('accessToken_backup');
      sessionStorage.removeItem('cachedUserInfo');
      console.log('[Header] sessionStorage에서 토큰 및 사용자 정보 삭제');
      
      console.log('[Header] 로그아웃 API 호출 성공');
      navigate('/');
    } catch (error) {
      console.error('[Header] 로그아웃 오류:', error);
      // 오류 발생해도 sessionStorage 클리어
      sessionStorage.removeItem('accessToken_backup');
      sessionStorage.removeItem('cachedUserInfo');
      navigate('/');
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'white',
        color: '#333',
        padding: '0.5rem 1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px',
        borderBottom: '1px solid #eaeaea'
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
          style={{ height: "32px", cursor: "pointer" }}
        />
      </div>

      {/* 네비게이션 링크 영역 */}
      <nav
        style={{
          display: 'flex',
          gap: '2rem',
        }}
      >
        <div
          onClick={handleStudylistClick}
          style={{
            cursor: 'pointer',
            color: pathname.includes('/studies') ? '#000' : '#555',
            fontWeight: pathname.includes('/studies') ? 'bold' : 'normal',
            fontSize: '15px',
          }}
        >
          스터디 목록
        </div>
        <div
          onClick={handleCalendarClick}
          style={{
            cursor: 'pointer',
            color: pathname.includes('/calendar') ? '#000' : '#555',
            fontWeight: pathname.includes('/calendar') ? 'bold' : 'normal',
            fontSize: '15px',
          }}
        >
          캘린더
        </div>
        <div
          onClick={handleProfileClick}
          style={{
            cursor: 'pointer',
            color: pathname.includes('/mypage') ? '#000' : '#555',
            fontWeight: pathname.includes('/mypage') ? 'bold' : 'normal',
            fontSize: '15px',
          }}
        >
          마이페이지
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
        {/* 알림 아이콘 */}
        <div onClick={handleNotificationToggle} style={{ cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="black"/>
          </svg>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '20px',
            padding: '5px 15px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          logout
        </button>
      </div>
    </header>
  );
};

export default Header;
