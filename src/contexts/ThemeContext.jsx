import { createContext, useState, useContext, useEffect } from 'react';

// ThemeContext 생성
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 시스템 설정 또는 localStorage에서 다크모드 설정 가져오기
  const getInitialTheme = () => {
    // localStorage에 저장된 테마 설정 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // 시스템 테마 설정 확인
    return window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // 다크모드 설정 변경 시 localStorage 업데이트 및 CSS 변수 적용
  useEffect(() => {
    // localStorage에 테마 설정 저장
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // HTML 태그에 data-theme 속성 추가
    const html = document.documentElement;
    if (isDarkMode) {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark-mode');
    } else {
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark-mode');
    }
    
    // CSS 변수 업데이트
    document.body.style.setProperty('--is-dark-mode', isDarkMode ? 1 : 0);
  }, [isDarkMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // localStorage에 저장된 설정이 없을 때만 시스템 설정 따르기
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    
    // 이벤트 리스너 등록 (브라우저 호환성 고려)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Safari 14 미만 버전 지원
      mediaQuery.addListener(handleChange);
    }
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // 테마 전환 함수
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 테마별 색상 정의
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // 다크모드 색상
      background: '#0f172a',      // 메인 배경
      cardBackground: '#1f2937',  // 카드 배경
      surface: '#242F3F',         // 표면
      surfaceHover: '#2c3a4d',    // 표면 호버
      border: '#374151',          // 경계선
      text: '#E5E7EB',            // 기본 텍스트
      textSecondary: '#9CA3AF',   // 보조 텍스트
      primary: '#FF6B6B',         // 주요 색상
      secondary: '#4F46E5',       // 보조 색상
      accent: '#60A5FA',          // 강조 색상
      error: '#EF4444',           // 오류
      success: '#10B981',         // 성공
      warning: '#FBBF24',         // 경고
      info: '#3B82F6',            // 정보
      divider: '#1F2937',         // 구분선
      headerBackground: '#1f2937',// 헤더 배경
      sidebarBackground: '#111827',// 사이드바 배경
      buttonBackground: '#374151',// 버튼 배경
      buttonHover: '#4B5563',     // 버튼 호버
      timelineMarker: '#FF6B6B',  // 타임라인 마커
      shadowColor: 'rgba(0, 0, 0, 0.3)', // 그림자
      codeBackground: '#282c34',  // 코드 배경
      tooltip: '#4B5563',         // 툴팁
      selection: '#2563EB',       // 선택 배경
      overlay: 'rgba(0, 0, 0, 0.7)', // 오버레이
      focus: '#2563EB'           // 포커스
    } : {
      // 라이트모드 색상
      background: '#FFFFFF',      // 메인 배경
      cardBackground: '#FFFFFF',  // 카드 배경
      surface: '#F9FAFB',         // 표면
      surfaceHover: '#F3F4F6',    // 표면 호버
      border: '#E5E7EB',          // 경계선
      text: '#111827',            // 기본 텍스트
      textSecondary: '#6B7280',   // 보조 텍스트
      primary: '#FF0000',         // 주요 색상 
      secondary: '#4338CA',       // 보조 색상
      accent: '#3B82F6',          // 강조 색상
      error: '#DC2626',           // 오류
      success: '#059669',         // 성공
      warning: '#D97706',         // 경고
      info: '#2563EB',            // 정보
      divider: '#E5E7EB',         // 구분선
      headerBackground: '#FFFFFF',// 헤더 배경
      sidebarBackground: '#F9FAFB',// 사이드바 배경
      buttonBackground: '#F3F4F6',// 버튼 배경
      buttonHover: '#E5E7EB',     // 버튼 호버
      timelineMarker: '#FF0000',  // 타임라인 마커
      shadowColor: 'rgba(0, 0, 0, 0.1)', // 그림자
      codeBackground: '#F3F4F6',  // 코드 배경
      tooltip: '#E5E7EB',         // 툴팁
      selection: '#BFDBFE',       // 선택 배경
      overlay: 'rgba(0, 0, 0, 0.5)', // 오버레이
      focus: '#3B82F6'           // 포커스
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 사용을 위한 커스텀 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 