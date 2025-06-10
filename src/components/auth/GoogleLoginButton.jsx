import React, { useState } from "react";

// 구글 로그인 버튼 컴포넌트 - 2024-04-06 수정
function GoogleLoginButton() {
  // 호버 상태 추적을 위한 상태 추가
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // localStorage에서 이전 로그인 정보 제거 (새로운 로그인 시도)
    localStorage.removeItem("accessToken");

    // 디버그 로그 추가
    console.log("[OAuth DEBUG] 구글 로그인 시작 - 버튼 클릭");

    // 개발 환경 체크 (이 부분은 그대로 유지)
    if (
      import.meta.env.MODE === "development" &&
      import.meta.env.VITE_MSW_ENABLED === "true"
    ) {
      window.location.href =
        "http://localhost:3000/auth/callback?code=mock_code";
      return;
    }

    // 순수한 OAuth 엔드포인트 호출 (파라미터 없음)
    console.log("[Auth] 구글 로그인 요청 - 최신 코드 확인용");
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;

  };

  return (
    <button
      onClick={handleLogin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="google-login-button"
      style={{
        padding: "8px 16px",
        backgroundColor: isHovered ? "#f8f8f8" : "#ffffff",
        color: "#000000",
        border: "1px solid #dadce0",
        borderRadius: "24px",
        cursor: "pointer",
        fontSize: "14px",
        fontFamily: "Roboto, Arial, sans-serif",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        transition: "background-color 0.2s ease",
        height: "40px",
        minWidth: "180px",
        outline: "none", // 클릭 시 파란색 테두리 제거
      }}
    >
      {/* 구글 로고로 변경 */}
      <svg
        width="18"
        height="18"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
