import React, { createContext, useState, useContext, useEffect } from 'react';

// ThemeContext 생성
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 초기 테마를 결정하는 함수
  const getInitialTheme = () => {
    // localStorage에서 테마 가져오기
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    
    // 시스템 설정 확인
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // 테마 변경 함수
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 라이트모드 컬러 정의
  const lightColors = {
    background: "#f8f9fa",
    cardBackground: "#ffffff",
    textPrimary: "#333333",
    textSecondary: "#666666",
    border: "#dddddd",
    hoverBackground: "#f1f3f5",
    buttonBackground: "#f1f1f1",
    buttonText: "#333333",
    primary: "#4a6cf7",
    inputBackground: "#ffffff",
    error: "#e74c3c",
    errorBackground: "#fdecea",
    success: "#2ecc71",
    warning: "#f39c12"
  };
  
  // 다크모드 컬러 정의
  const darkColors = {
    background: "#1a1c23",
    cardBackground: "#2d3748",
    textPrimary: "#f8f9fa",
    textSecondary: "#a0aec0",
    border: "#4a5568",
    hoverBackground: "#3a4a5e",
    buttonBackground: "#3a4a5e",
    buttonText: "#f8f9fa",
    primary: "#4a6cf7",
    inputBackground: "#2d3748",
    error: "#fc8181",
    errorBackground: "#553c3c",
    success: "#68d391",
    warning: "#f6ad55"
  };
  
  // 현재 테마에 맞는 색상 설정
  const colors = isDarkMode ? darkColors : lightColors;

  // 테마 변경 시 localStorage 업데이트 및 CSS 변수 적용
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = e => {
      if (localStorage.getItem("theme") === null) {
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