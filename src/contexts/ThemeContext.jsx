import React, { createContext, useState, useContext, useEffect } from 'react';

// ThemeContext 생성
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 초기 테마를 결정하는 함수
  const getInitialTheme = () => {
    // 세션 스토리지에서 테마 설정 가져오기
    const savedTheme = sessionStorage.getItem("theme");
    
    // 세션 스토리지에 테마 설정이 없으면 기본값 설정
    if (!savedTheme) {
      sessionStorage.setItem("theme", "light");
      return false; // false는 라이트 모드
    }
    
    // 저장된 테마에 따라 초기값 설정
    return savedTheme === "dark";
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // 테마 변경 함수
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // localStorage.setItem("theme", newMode ? "dark" : "light");
      sessionStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // 라이트모드 컬러 정의
  const lightColors = {
    background: "#f8f9fa",
    cardBackground: "#ffffff",
    textPrimary: "#333333",
    text: "#333333",
    textSecondary: "#666666",
    border: "#dddddd",
    hoverBackground: "#f1f3f5",
    buttonBackground: "#f1f1f1",
    buttonText: "#333333",
    primary: "#E50011",
    inputBackground: "#ffffff",
    error: "#e74c3c",
    errorBackground: "#fdecea",
    success: "#2ecc71",
    warning: "#f39c12",
    shadowColor: "rgba(0, 0, 0, 0.1)"
  };
  
  // 다크모드 컬러 정의
  const darkColors = {
    background: "#1a1c23",
    cardBackground: "#2d3748",
    textPrimary: "#f8f9fa",
    text: "#f8f9fa",
    textSecondary: "#a0aec0",
    border: "#4a5568",
    hoverBackground: "#3a4a5e",
    buttonBackground: "#3a4a5e",
    buttonText: "#f8f9fa",
    primary: "#ff6b6b",
    inputBackground: "#2d3748",
    error: "#fc8181",
    errorBackground: "#553c3c",
    success: "#68d391",
    warning: "#f6ad55",
    shadowColor: "rgba(0, 0, 0, 0.3)"
  };
  
  // 현재 테마에 맞는 색상 설정
  const colors = isDarkMode ? darkColors : lightColors;

  // 테마 변경 시 localStorage 업데이트 및 CSS 변수 적용
  useEffect(() => {
    // localStorage 저장
    // localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    
    // 다크모드 클래스 적용
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    
    // 메타 테마 컬러 변경 (모바일 브라우저 테마 색상)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDarkMode ? darkColors.background : lightColors.background);
    }
    
    // CSS 변수 설정
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // 최상위 data-theme 속성 설정 (외부 라이브러리용)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // 스타일 처리를 위한 짧은 딜레이 (트랜지션 효과 적용을 위함)
    setTimeout(() => {
      document.body.style.transition = "background-color 0.3s, color 0.3s";
    }, 100);
  }, [isDarkMode, colors]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = e => {
      if (sessionStorage.getItem("theme") === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 사용을 위한 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 