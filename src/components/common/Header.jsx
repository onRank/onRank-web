import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import NotificationIcon from "../notification/NotificationIcon";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "./Button";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { setUser } = useAuth();

  const handleHomeClick = () => {
    navigate("/studies");
  };

  const handleStudylistClick = () => {
    navigate("/studies");
  };

  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  const handleProfileClick = () => {
    navigate("/mypage");
  };

  const handleLogout = async () => {
    try {
      console.log("[Header] 로그아웃 시도");

      // API 로그아웃 요청
      await authService.logout();

      // 추가: localStorage에서 스터디 관련 데이터 정리
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("study_") || key === "studies_list") {
          keysToRemove.push(key);
        }
      }

      // 수집된 키 삭제
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`[Header] localStorage에서 ${key} 삭제`);
      });

      // 세션 스토리지 클리어
      sessionStorage.removeItem("accessToken_backup");
      sessionStorage.removeItem("cachedUserInfo");
      console.log("[Header] sessionStorage에서 토큰 및 사용자 정보 삭제");

      console.log("[Header] 로그아웃 API 호출 성공");
      navigate("/");
    } catch (error) {
      console.error("[Header] 로그아웃 오류:", error);
      // 오류 발생해도 sessionStorage 클리어
      sessionStorage.removeItem("accessToken_backup");
      sessionStorage.removeItem("cachedUserInfo");
      navigate("/");
    }
  };

  return (
    <header
      style={{
        backgroundColor: "white",
        color: "#333",
        padding: "0.5rem 1rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "60px",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      {/* 로고 영역 */}
      <div
        onClick={handleHomeClick}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          marginRight: "3rem",
        }}
      >
        <img
          src="/new-logo.png"
          alt="onRank 로고"
          style={{ height: "32px", cursor: "pointer" }}
        />
      </div>

      {/* 네비게이션 링크 영역 */}
      <nav
        style={{
          display: "flex",
          gap: "2rem",
          flex: 1,
        }}
      >
        <div
          onClick={handleStudylistClick}
          style={{
            cursor: "pointer",
            color: pathname.includes("/studies") ? "#000" : "#555",
            fontWeight: pathname.includes("/studies") ? "bold" : "normal",
            fontSize: "15px",
          }}
        >
          스터디 목록
        </div>
        <div
          onClick={handleCalendarClick}
          style={{
            cursor: "pointer",
            color: pathname.includes("/calendar") ? "#000" : "#555",
            fontWeight: pathname.includes("/calendar") ? "bold" : "normal",
            fontSize: "15px",
          }}
        >
          캘린더
        </div>
        <div
          onClick={handleProfileClick}
          style={{
            cursor: "pointer",
            color: pathname.includes("/mypage") ? "#000" : "#555",
            fontWeight: pathname.includes("/mypage") ? "bold" : "normal",
            fontSize: "15px",
          }}
        >
          마이페이지
        </div>
      </nav>

      {/* 우측 유틸리티 영역 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* 알림 아이콘 - 새 컴포넌트로 교체 */}
        <NotificationIcon />

        {/* 로그아웃 버튼 */}
        <Button onClick={handleLogout} variant="logout" />
      </div>
    </header>
  );
};

export default Header;
