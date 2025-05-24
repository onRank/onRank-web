import { createContext, useContext, useState, useEffect } from "react";
import { api, tokenUtils } from "../services/api";

const AuthContext = createContext();

// 사용자 정보 캐싱을 위한 유틸리티 함수
const userCache = {
  getUser: () => {
    try {
      const cachedUser = sessionStorage.getItem("cachedUserInfo");
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (error) {
      console.error("[Auth] 캐시된 사용자 정보 파싱 오류:", error);
      return null;
    }
  },
  setUser: (userData) => {
    try {
      if (userData) {
        sessionStorage.setItem("cachedUserInfo", JSON.stringify(userData));
        console.log("[Auth] 사용자 정보 캐시 저장됨");
      }
    } catch (error) {
      console.error("[Auth] 사용자 정보 캐시 저장 오류:", error);
    }
  },
  clearUser: () => {
    sessionStorage.removeItem("cachedUserInfo");
    console.log("[Auth] 사용자 정보 캐시 삭제됨");
  },
};

// 토큰에서 기본 사용자 정보 추출하는 함수
const extractBasicUserInfo = (tokenPayload) => {
  return {
    email: tokenPayload.email || "",
    nickname: tokenPayload.nickname || tokenPayload.name || "사용자",
    department: tokenPayload.department || "학과 정보 없음",
    // JWT 토큰에 포함된 다른 기본 정보가 있다면 여기에 추가
    username: tokenPayload.username || tokenPayload.sub || "",
    // 역할 정보 추가
    role: tokenPayload.role || tokenPayload.roles || "MEMBER",
    isTokenBasedInfo: true, // 이 정보가 토큰에서 추출되었음을 표시
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDetailedUserInfo, setIsDetailedUserInfo] = useState(false);

  // 사용자 정보 설정 함수 (내부 상태와 캐시 모두 업데이트)
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      userCache.setUser(userData);
      setIsDetailedUserInfo(!userData.isTokenBasedInfo);
    } else {
      userCache.clearUser();
      setIsDetailedUserInfo(false);
    }
  };

  // JWT 토큰 유효성 검증 함수
  const validateToken = async () => {
    try {
      // 토큰 만료 체크
      const token = tokenUtils.getToken();
      if (!token) {
        console.log("[Auth] 토큰 없음, 재인증 필요");
        return false;
      }

      // 백엔드로 토큰 유효성 체크 요청
      await api.get("/auth/validate");
      return true;
    } catch (error) {
      console.error("[Auth] 토큰 유효성 검증 실패:", error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("[Auth] useEffect 실행");
      console.log("[Auth] JWT 토큰 확인 시작");

      const token = tokenUtils.getToken();
      console.log("[Auth] 토큰 존재 여부:", !!token);

      if (!token) {
        console.log("[Auth] 토큰 없음");
        setLoading(false);
        return;
      }

      try {
        // JWT 토큰에서 사용자 정보 추출
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        console.log("[Auth] 토큰에서 추출한 사용자 정보:", tokenPayload);

        // 토큰 만료 확인
        const expirationTime = tokenPayload.exp * 1000; // convert to milliseconds
        if (expirationTime <= Date.now()) {
          console.log("[Auth] 토큰이 만료됨, 재발급 시도");

          try {
            // 토큰 재발급 시도
            const response = await api.get("/auth/reissue", {
              withCredentials: true, // HttpOnly 쿠키의 리프레시 토큰을 사용하기 위한 옵션
            });
            const newToken =
              response.headers["authorization"] ||
              response.headers["Authorization"];

            if (newToken) {
              console.log("[Auth] 토큰 재발급 성공");
              tokenUtils.setToken(newToken);

              // 새 토큰에서 페이로드 추출
              const newTokenPayload = JSON.parse(atob(newToken.split(".")[1]));
              // 기본 사용자 정보 설정
              const basicUserInfo = extractBasicUserInfo(newTokenPayload);
              updateUser(basicUserInfo);
            } else {
              console.log("[Auth] 토큰 재발급 실패: 새 토큰 없음");
              tokenUtils.removeToken();
              userCache.clearUser();
              setLoading(false);
              return;
            }
          } catch (refreshError) {
            console.log("[Auth] 토큰 재발급 실패:", refreshError);
            tokenUtils.removeToken();
            userCache.clearUser();
            setLoading(false);
            return;
          }
        }

        // 캐시된 사용자 정보 확인
        const cachedUser = userCache.getUser();
        if (cachedUser) {
          console.log("[Auth] 캐시된 사용자 정보 사용:", cachedUser);
          setUser(cachedUser);
          setIsDetailedUserInfo(!cachedUser.isTokenBasedInfo);
          setLoading(false);
          return;
        }

        // 캐시된 정보가 없는 경우 토큰에서 기본 정보 추출하여 사용
        console.log("[Auth] 캐시된 정보 없음, 토큰에서 기본 정보 사용");
        const basicUserInfo = extractBasicUserInfo(tokenPayload);
        updateUser(basicUserInfo);
        setLoading(false);
      } catch (error) {
        console.error("[Auth] 토큰 처리 중 오류:", error);
        tokenUtils.removeToken();
        updateUser(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 사용자 정보를 강제로 새로고침하는 함수 추가 (프로필 페이지 등에서 사용)
  const refreshUserInfo = async () => {
    try {
      console.log("[Auth] 사용자 정보 강제 새로고침");
      const response = await api.get("/auth/mypage");
      const userData = { ...response.data, isTokenBasedInfo: false };
      updateUser(userData);
      setIsDetailedUserInfo(true);
      return userData;
    } catch (error) {
      console.error("[Auth] 사용자 정보 새로고침 실패:", error);

      // 401 오류인 경우 토큰 재발급 시도
      if (error.response?.status === 401) {
        try {
          // 토큰 재발급 시도
          const response = await api.get("/auth/reissue", {
            withCredentials: true, // HttpOnly 쿠키의 리프레시 토큰을 사용하기 위한 옵션
          });
          const newToken =
            response.headers["authorization"] ||
            response.headers["Authorization"];

          if (newToken) {
            console.log("[Auth] 토큰 재발급 성공, 사용자 정보 재조회");
            tokenUtils.setToken(newToken);

            // 사용자 정보 재조회
            const userResponse = await api.get("/auth/mypage");
            const userData = { ...userResponse.data, isTokenBasedInfo: false };
            updateUser(userData);
            setIsDetailedUserInfo(true);
            return userData;
          }
        } catch (refreshError) {
          console.log("[Auth] 토큰 재발급 실패:", refreshError);
        }

        // 토큰 재발급 실패 또는 사용자 정보 조회 실패
        tokenUtils.removeToken();
        updateUser(null);
      }

      throw error;
    }
  };

  const value = {
    user,
    setUser: updateUser,
    loading,
    refreshUserInfo, // 사용자 정보를 강제로 새로고침하는 함수 노출
    isDetailedUserInfo, // 상세 사용자 정보 여부 (프로필 페이지 등에서 사용)
    isAuthenticated: !!user, // user 객체가 존재하면 true, 아니면 false
    validateToken, // 토큰 유효성 검증 함수 추가
    role: user?.role || "MEMBER", // user 객체에서 역할 정보 추출하여 제공
  };

  console.log("[Auth] Provider 렌더링");
  console.log(
    "[Auth] 현재 상태 - user:",
    user,
    "loading:",
    loading,
    "isDetailedUserInfo:",
    isDetailedUserInfo,
    "isAuthenticated:",
    !!user,
    "role:",
    user?.role || "MEMBER"
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
