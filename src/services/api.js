import axios from "axios";

if (!import.meta.env.VITE_API_URL) {
  console.error("API URL이 설정되지 않았습니다");
}

// API 인스턴스 정의
export const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://onrank.kr"
    : import.meta.env.VITE_API_URL || "https://localhost:8080",
  timeout: 5000,
  withCredentials: true,
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    // 모든 요청 로깅 추가
    console.log(
      `[API Request Debug] ${config.method.toUpperCase()} ${config.url}`,
      {
        headers: config.headers,
        data: config.data,
      }
    );

    // 토큰이 필요한 요청인 경우 헤더에 토큰 추가
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 에러 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 토큰 재발급 로직 등 여기에 추가
      console.log("[API] 401 에러 발생, 토큰 재발급 필요");
    }
    return Promise.reject(error);
  }
);

// 토큰 관련 유틸리티 함수
export const tokenUtils = {
  // 쿠키에서 특정 이름의 쿠키 값을 가져오는 유틸리티 함수
  getCookie: (name) => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // 쿠키 이름이 접두사로 시작하는지 확인
      if (cookie.indexOf(name + "=") === 0) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  },

  // 리프레시 토큰 쿠키 존재 여부 확인 - 비동기 함수로 변경
  hasRefreshToken: async () => {
    // HttpOnly 쿠키는 JavaScript에서 직접 접근할 수 없음
    // 서버에 요청하여 쿠키 유효성 확인
    try {
      console.log("[Token Debug] Validating refresh token with server");
      await api.get("/auth/validate", { withCredentials: true });
      console.log("[Token Debug] Server confirmed refresh token is valid");
      return true;
    } catch (error) {
      // 서버 측에서 403, 401 등 인증 오류가 반환되면 리프레시 토큰이 없거나 유효하지 않은 것
      console.log("[Token Debug] Server validation failed:", error.message);
      return false;
    }
  },

  // 리프레시 토큰 쿠키 존재 여부 확인 - 동기 버전 (기존 코드와 호환성 유지)
  // 주의: HttpOnly 쿠키는 감지할 수 없으므로 이 메소드는 추가 검증 없이 사용 금지
  hasRefreshTokenSync: () => {
    // HttpOnly 쿠키는 직접 접근 불가능, 간접적인 확인 방법 필요
    console.log(
      `[Token Debug] Warning: Synchronous HttpOnly cookie check may be unreliable`
    );

    // 액세스 토큰이 있다면 리프레시 토큰도 있다고 가정 (간접적인 추론)
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        // 토큰 유효성 간단 검사
        const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
        const expirationTime = tokenPayload.exp * 1000;

        // 만료되지 않은 토큰이 있으면 리프레시 토큰도 있다고 간주
        if (expirationTime > Date.now()) {
          console.log(
            "[Token Debug] Valid access token exists, assuming refresh token also exists"
          );
          return true;
        }
      } catch (e) {
        console.warn("[Token Debug] Error checking token format:", e);
      }
    }

    // 실제 백엔드 API 상태에 따라 간접적으로 판단할 수도 있음
    // 예: 최근 API 요청 성공 여부 등

    // 최후의 수단: 불확실한 경우 true 반환 (false positive가 false negative보다 나음)
    return true;
  },

  getToken: () => {
    // 새로고침 감지 - 브라우저 performance API 사용
    const isPageRefresh =
      window.performance &&
      window.performance.navigation &&
      window.performance.navigation.type === 1;

    // 새로고침 시 액세스 토큰 확인
    if (isPageRefresh) {
      console.log(
        "[Token Debug] Page refresh detected, checking token validity"
      );

      const token = localStorage.getItem("accessToken");

      // 토큰이 있으면 유효성 검사
      if (token) {
        try {
          // JWT 토큰 디코딩
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const expirationTime = tokenPayload.exp * 1000;

          // 토큰이 만료됐거나 5분 이내 만료 예정이면 null 반환 (재발급 유도)
          if (Date.now() >= expirationTime - 300000) {
            // 5분 = 300,000ms
            console.log(
              "[Token Debug] Token expired or expiring soon, will request new token"
            );
            return null;
          }

          // 새로고침 후 첫 호출에서 토큰 재검증 요청 필요 플래그 설정
          window._shouldRevalidateToken = true;

          console.log(
            "[Token Debug] Valid token found after refresh:",
            token.substring(0, 15) + "..."
          );
          return token;
        } catch (error) {
          console.error("[Token Debug] Token validation error:", error);
          return null;
        }
      }

      // localStorage에 토큰이 없으면 sessionStorage의 백업 토큰 확인
      const backupToken = sessionStorage.getItem("accessToken_backup");
      if (backupToken) {
        console.log("[Token Debug] Using backup token from sessionStorage");

        // 백업 토큰을 localStorage에 복원
        try {
          localStorage.setItem("accessToken", backupToken);
          console.log("[Token Debug] Backup token restored to localStorage");
          return backupToken;
        } catch (e) {
          console.error("[Token Debug] Failed to restore backup token:", e);
          return backupToken; // 복원 실패해도 백업 토큰 반환
        }
      }

      console.log("[Token Debug] No token found after refresh");
      return null;
    }

    // 일반 요청 시 localStorage에서 토큰 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 토큰 유효성 간단 검사
      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          console.warn(
            "[Token Debug] Invalid token format (not a JWT):",
            token.substring(0, 15) + "..."
          );
          localStorage.removeItem("accessToken"); // 잘못된 형식의 토큰 제거
          return null;
        }
      } catch (e) {
        console.warn("[Token Debug] Error checking token format:", e);
        localStorage.removeItem("accessToken"); // 에러가 발생한 토큰 제거
        return null;
      }

      console.log(
        "[Token Debug] Retrieved token from localStorage:",
        token.substring(0, 15) + "..."
      );
      return token;
    }

    // localStorage에 토큰이 없으면 sessionStorage 백업 확인
    const backupToken = sessionStorage.getItem("accessToken_backup");
    if (backupToken) {
      console.log("[Token Debug] Using backup token from sessionStorage");

      // 가능하다면 localStorage에 복원 시도
      try {
        localStorage.setItem("accessToken", backupToken);
        console.log("[Token Debug] Backup token restored to localStorage");
      } catch (e) {
        console.error(
          "[Token Debug] Failed to restore backup token to localStorage:",
          e
        );
      }

      return backupToken;
    }

    console.log(
      "[Token Debug] No token found in localStorage or sessionStorage"
    );
    return null;
  },

  setToken: (token) => {
    if (!token) {
      console.log(
        "[Token Debug] Attempted to save null/undefined token, ignoring"
      );
      return Promise.reject(new Error("Null or undefined token"));
    }

    return new Promise((resolve, reject) => {
      try {
        // Bearer 접두사가 없는 경우에만 추가
        const tokenWithBearer = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        // 토큰을 저장하기 전에 이벤트 발행
        const storageEvent = new Event("pre-tokensave");
        window.dispatchEvent(storageEvent);

        // localStorage에 저장
        localStorage.setItem("accessToken", tokenWithBearer);

        // sessionStorage에도 백업 저장 (중요)
        try {
          sessionStorage.setItem("accessToken_backup", tokenWithBearer);
          console.log("[Token Debug] Token backup saved to sessionStorage");
        } catch (backupError) {
          console.warn(
            "[Token Debug] Failed to save token backup to sessionStorage:",
            backupError
          );
          // 백업 저장 실패는 치명적이지 않으므로 계속 진행
        }

        // 토큰 저장 후 이벤트 발행
        const postStorageEvent = new Event("post-tokensave");
        window.dispatchEvent(postStorageEvent);

        console.log("[Token Debug] Token saved successfully to localStorage");

        // 토큰이 실제로 저장되었는지 확인
        const savedToken = localStorage.getItem("accessToken");
        if (savedToken) {
          console.log("[Token Debug] Token verified in localStorage");
          resolve(savedToken);
        } else {
          // localStorage 저장에 실패했지만 sessionStorage에 백업이 있는 경우
          const backupToken = sessionStorage.getItem("accessToken_backup");
          if (backupToken) {
            console.log(
              "[Token Debug] Primary storage failed but backup exists in sessionStorage"
            );
            resolve(backupToken);
            return;
          }

          // 저장에 실패한 경우 재시도
          console.warn("[Token Debug] Token not found after save, retrying...");

          // 약간의 지연 후 다시 저장 시도
          setTimeout(() => {
            localStorage.setItem("accessToken", tokenWithBearer);
            // sessionStorage에도 다시 백업 시도
            try {
              sessionStorage.setItem("accessToken_backup", tokenWithBearer);
            } catch (retryBackupError) {
              console.warn(
                "[Token Debug] Retry backup failed:",
                retryBackupError
              );
            }

            const retryToken = localStorage.getItem("accessToken");
            const retryBackupToken =
              sessionStorage.getItem("accessToken_backup");

            if (retryToken) {
              console.log("[Token Debug] Token saved successfully on retry");
              resolve(retryToken);
            } else if (retryBackupToken) {
              console.log("[Token Debug] Using backup token after retry");
              resolve(retryBackupToken);
            } else {
              console.error("[Token Debug] Failed to save token after retry");
              reject(new Error("Failed to save token to localStorage"));
            }
          }, 50);
        }
      } catch (error) {
        console.error("[Token Debug] Error saving token:", error);

        // localStorage 저장 실패 시 sessionStorage에 백업만이라도 시도
        try {
          const tokenWithBearer = token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
          sessionStorage.setItem("accessToken_backup", tokenWithBearer);
          console.log(
            "[Token Debug] Saved backup token to sessionStorage after localStorage failure"
          );

          // 백업 저장 성공했으면 성공 처리
          const backupToken = sessionStorage.getItem("accessToken_backup");
          if (backupToken) {
            resolve(backupToken);
            return;
          }
        } catch (backupError) {
          console.error(
            "[Token Debug] Failed to save backup token:",
            backupError
          );
        }

        reject(error);
      }
    });
  },

  removeToken: () => {
    // localStorage에서 토큰 제거
    localStorage.removeItem("accessToken");

    console.log("[Token Debug] Token removed from localStorage");
  },

  // localStorage에서 accessToken만 제거하고 쿠키(refresh token)는 유지하는 함수
  removeTokenKeepCookies: () => {
    // localStorage의 accessToken만 제거
    localStorage.removeItem("accessToken");

    console.log(
      "[Token Debug] Access token removed from localStorage while keeping cookies (refresh token)"
    );
  },

  isTokenValid: (token) => {
    if (!token) return false;

    try {
      // JWT 토큰 디코딩
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const expirationTime = payload.exp * 1000; // 밀리초로 변환

      // 현재 시간과 비교 (5분 이내로 만료라면 미리 갱신 유도)
      return Date.now() < expirationTime - 300000;
    } catch (error) {
      console.error("[Token Debug] Token validation error:", error);
      return false;
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      // JWT 토큰 디코딩
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const expirationTime = payload.exp * 1000; // 밀리초로 변환

      // 현재 시간과 비교
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error("[Token Debug] Token expiration check error:", error);
      return true;
    }
  },

  // 쿠키 설정 유틸리티 함수
  setCookie: (name, value, options = {}) => {
    const defaultOptions = {
      path: "/",
      sameSite: "Lax",
      // HTTPS 환경에서는 Secure 속성 추가
      ...(window.location.protocol === "https:" ? { secure: true } : {}),
    };

    const cookieOptions = { ...defaultOptions, ...options };
    let cookieString = `${name}=${value}`;

    Object.entries(cookieOptions).forEach(([key, value]) => {
      if (value === true) {
        cookieString += `; ${key}`;
      } else if (value !== false && value != null) {
        cookieString += `; ${key}=${value}`;
      }
    });

    document.cookie = cookieString;
    console.log(
      `[Token Debug] Cookie set: ${name} (options: ${JSON.stringify(
        cookieOptions
      )})`
    );
  },

  // 쿠키 제거 유틸리티 함수
  removeCookie: (name, options = {}) => {
    const defaultOptions = {
      path: "/",
      sameSite: "Lax",
      expires: "Thu, 01 Jan 1970 00:00:01 GMT",
      ...(window.location.protocol === "https:" ? { secure: true } : {}),
    };

    const cookieOptions = { ...defaultOptions, ...options };
    tokenUtils.setCookie(name, "", cookieOptions);
    console.log(`[Token Debug] Cookie removed: ${name}`);
  },

  // 리프레시 토큰 쿠키 제거 유틸리티 함수
  removeRefreshTokenCookie: () => {
    tokenUtils.removeCookie("refresh_token");
  },

  // 로컬 스토리지 토큰 삭제 및 리프레시 토큰 쿠키 삭제
  clearAllTokens: () => {
    // 로컬 스토리지에서 액세스 토큰 제거
    localStorage.removeItem("accessToken");
    // 리프레시 토큰 쿠키 제거
    tokenUtils.removeRefreshTokenCookie();
    console.log("[Token Debug] All tokens cleared (localStorage + cookie)");
  },
};

export const authService = {
  // 회원 정보 등록
  addUserInfo: async (userData) => {
    try {
      console.log("[Auth] 회원정보 등록 시도:", userData);

      // 회원정보 등록 요청 - 토큰을 명시적으로 헤더에 추가
      const token = tokenUtils.getToken();
      const headers = {};

      if (token) {
        const tokenWithBearer = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        headers["Authorization"] = tokenWithBearer;
        console.log("[Auth] Including token in request:", tokenWithBearer);
      } else {
        console.warn("[Auth] No token found for auth/add request");
      }

      // API 경로는 백엔드와 일치시키기: /members -> /auth/add (Swagger UI 기준)
      const response = await api.post(
        "/auth/add",
        {
          studentName: userData.studentName.trim(),
          studentSchool: userData.studentSchool?.trim() || "",
          studentDepartment: userData.studentDepartment?.trim() || "",
          studentPhoneNumber: userData.studentPhoneNumber.trim(),
        },
        { headers }
      );

      console.log("[Auth] 회원정보 등록 성공:", response);

      // 201 상태코드 및 Location 헤더 처리
      if (response.status === 201) {
        const locationUrl = response.headers["location"];
        console.log("[Auth] 생성된 리소스 URL:", locationUrl);
      }

      // 토큰 추출 및 저장
      const newToken =
        response.headers["authorization"] || response.headers["Authorization"];
      if (newToken) {
        console.log("[Auth] Token found in registration response, saving it");

        // 기존 토큰 제거 후 새 토큰 저장 (충돌 방지)
        localStorage.removeItem("accessToken");

        // 약간의 지연 후 새 토큰 저장
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 새 토큰 저장
        tokenUtils.setToken(newToken);

        // 토큰이 localStorage에 완전히 저장되도록 작은 지연 추가
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 토큰이 실제로 저장되었는지 확인
        const savedToken = localStorage.getItem("accessToken");
        if (savedToken) {
          console.log("[Auth] Token successfully saved to localStorage");
        } else {
          console.warn("[Auth] Token was not saved to localStorage");
          // 마지막 시도: 직접 저장
          try {
            const tokenWithBearer = newToken.startsWith("Bearer ")
              ? newToken
              : `Bearer ${newToken}`;
            localStorage.setItem("accessToken", tokenWithBearer);
            console.log("[Auth] Direct token save attempt completed");
          } catch (storageError) {
            console.error("[Auth] Error saving token directly:", storageError);
          }
        }
      }

      return response; // 전체 response 객체 반환
    } catch (error) {
      console.error("[Auth] 회원정보 등록 실패:", error);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      console.log("[Auth] 로그아웃 API 호출");

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.log("[Auth] 토큰 없음, 로그아웃 처리만 수행");
        tokenUtils.removeToken(true); // removeBackup=true로 변경하여 백업 토큰도 제거
        localStorage.removeItem("cachedUserInfo");
        sessionStorage.removeItem("accessToken_backup"); // 백업 토큰 명시적 제거
        sessionStorage.removeItem("cachedUserInfo"); // 세션 스토리지의 사용자 정보도 제거

        // 스터디 관련 캐시 초기화
        studyService.clearCache();

        return { success: true, message: "로그아웃되었습니다." };
      }

      // API 요청
      const response = await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // 토큰 및 관련 데이터 삭제
      tokenUtils.removeToken(true); // removeBackup=true로 변경하여 백업 토큰도 제거
      localStorage.removeItem("cachedUserInfo");
      sessionStorage.removeItem("accessToken_backup"); // 백업 토큰 명시적 제거
      sessionStorage.removeItem("cachedUserInfo"); // 세션 스토리지의 사용자 정보도 제거

      // 스터디 관련 로컬스토리지 데이터 및 캐시 초기화
      studyService.clearCache();

      console.log(
        "[Auth] 로그아웃 후 토큰 존재 여부:",
        !!tokenUtils.getToken()
      );
      console.log(
        "[Auth] 로그아웃 후 세션 백업 토큰 존재 여부:",
        !!sessionStorage.getItem("accessToken_backup")
      );
      console.log(
        "[Auth] 로그아웃 후 리프레시 토큰 존재 여부:",
        await tokenUtils.hasRefreshToken()
      );
      console.log("[Auth] 로그아웃 성공");

      return response.data || { success: true, message: "로그아웃되었습니다." };
    } catch (error) {
      console.error("[Auth] 로그아웃 실패:", error);

      // 에러가 발생해도 클라이언트 쪽에서 토큰 및 캐시 삭제
      tokenUtils.removeToken(true); // removeBackup=true로 변경하여 백업 토큰도 제거
      localStorage.removeItem("cachedUserInfo");
      sessionStorage.removeItem("accessToken_backup"); // 백업 토큰 명시적 제거
      sessionStorage.removeItem("cachedUserInfo"); // 세션 스토리지의 사용자 정보도 제거

      // 스터디 관련 캐시 초기화
      studyService.clearCache();

      throw new Error("로그아웃 중 오류가 발생했습니다.");
    }
  },
};

// 메모리 캐싱을 위한 객체 추가
const memoryCache = {
  studiesList: null,
  studyDetails: {},
};

// 스터디 관련 API 서비스
export const studyService = {
  // 스터디 생성
  createStudy: async (studyData) => {
    try {
      console.log("[StudyService] 스터디 생성 요청:", studyData);

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        studyName: studyData.studyName || "",
        studyContent: studyData.studyContent || "",
        studyImageUrl: studyData.studyImageUrl || null,
        studyGoogleFormUrl: studyData.studyGoogleFormUrl || null,
      };

      console.log("[StudyService] 변환된 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 스터디 생성 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청 - 백엔드와 일치시키기 위해 경로 다시 변경: /studies -> /studies/add (Swagger UI 기준)
      const response = await api.post("/studies/add", requestData, {
        headers: {
          Authorization: tokenWithBearer,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF 방지 및 브라우저 호환성 향상
          Accept: "application/json", // JSON 응답 요청
        },
        withCredentials: true,
      });

      console.log("[StudyService] 스터디 생성 응답:", response.data);

      // 2. Pre-signed URL이 있고 이미지 파일이 있는 경우 S3에 업로드
      if (response.data.uploadUrl && studyData.imageFile) {
        try {
          await studyService.uploadImageToS3(
            response.data.uploadUrl,
            studyData.imageFile
          );
          console.log("[StudyService] 이미지 업로드 성공");
        } catch (uploadError) {
          console.error("[StudyService] 이미지 업로드 실패:", uploadError);
          // 이미지 업로드 실패 시에도 스터디 생성은 완료된 것으로 처리
          return {
            ...response.data,
            warning: "스터디는 생성되었으나 이미지 업로드에 실패했습니다.",
          };
        }
      }

      // 3. 최종 응답 반환
      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 생성 오류:", error);

      // 인증 오류인 경우 (401, 403)
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        console.error("[StudyService] 인증 오류 발생:", error.response.status);

        // 사용자에게 더 명확한 피드백을 제공하기 위한 에러 객체
        const authError = new Error(
          "인증에 실패했습니다. 다시 로그인이 필요합니다."
        );
        authError.type = "AUTH_ERROR";
        authError.requireRelogin = true;

        // 로그인 페이지가 아닐 경우에만 리다이렉트
        if (!window.location.pathname.includes("/login")) {
          console.log("[StudyService] 인증 실패로 로그인 페이지로 리다이렉트");
          const loginUrl = `${window.location.protocol}//${window.location.host}/login`;
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 500);
        }

        throw authError;
      }

      // 네트워크 에러 처리
      if (error.message && error.message.includes("Network Error")) {
        const networkError = new Error(
          "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
        );
        networkError.type = "NETWORK_ERROR";
        throw networkError;
      }

      // 기타 에러
      throw error;
    }
  },

  // 스터디 목록 조회
  getStudies: async () => {
    try {
      console.log("[StudyService] 스터디 목록 조회 요청");

      const response = await api.get("/studies", {
        withCredentials: true,
      });

      console.log("[StudyService] 스터디 목록 조회 성공:", response.data);

      // 응답 데이터가 있는 경우
      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : [];

        // 데이터 형식 통일
        data.forEach((study) => {
          if (!study.file) {
            study.file = { fileId: null, fileName: null, fileUrl: null };
          }
          return study;
        });

        // 메모리에 캐싱 (로컬스토리지 대신)
        memoryCache.studiesList = data;
        console.log("[StudyService] 전체 스터디 목록을 메모리에 캐싱했습니다.");
      }

      return response.data || [];
    } catch (error) {
      console.error("[StudyService] 스터디 목록 조회 오류:", error);

      // API 호출 실패 시 메모리 캐시에서 확인
      if (memoryCache.studiesList) {
        console.log(
          "[StudyService] API 호출 실패로 메모리 캐시에서 스터디 목록 사용"
        );
        return memoryCache.studiesList;
      }

      // 오류 발생 시 빈 배열 반환
      return [];
    }
  },

  // 스터디 상세 조회
  getStudyById: async (studyId) => {
    try {
      console.log(`[StudyService] 스터디 상세 조회 요청: ${studyId}`);

      const response = await api.get(`/studies/${studyId}`, {
        withCredentials: true,
      });

      console.log("[StudyService] 스터디 상세 조회 성공:", response.data);

      // 응답 데이터가 있는 경우
      if (response.data) {
        const data = response.data;

        // file 객체 확인 및 처리
        if (!("file" in data) || !data.file || !data.file.fileUrl) {
          console.log(
            "[StudyService] file 객체가 없거나 fileUrl이 없음, 빈 file 객체 설정"
          );
          data.file = { fileId: null, fileName: null, fileUrl: "" };
        }

        // 스터디 데이터 메모리 캐싱 (로컬스토리지 대신)
        try {
          const mappedData = {
            id: data.studyId,
            title: data.studyName || "제목 없음",
            description: data.studyContent || "설명 없음",
            currentMembers: data.members?.length || 0,
            maxMembers: 10,
            status: "모집중",
            imageUrl: data.file && data.file.fileUrl ? data.file.fileUrl : "",
          };

          memoryCache.studyDetails[studyId] = mappedData;
          console.log("[StudyService] 스터디 데이터를 메모리에 캐싱했습니다.");
        } catch (cacheError) {
          console.warn("[StudyService] 스터디 데이터 캐싱 실패:", cacheError);
        }
      }

      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 상세 조회 오류:", error);

      // API 호출 실패 시 메모리 캐시에서 확인
      const cachedData = memoryCache.studyDetails[studyId];
      if (cachedData) {
        console.log(
          "[StudyService] API 호출 실패로 메모리 캐시에서 캐시된 데이터 사용"
        );

        // 캐시된 데이터를 원래 API 응답 형식으로 변환
        return {
          studyId: cachedData.id,
          studyName: cachedData.title,
          studyContent: cachedData.description,
          file: {
            fileUrl: cachedData.imageUrl,
          },
        };
      }

      // 캐시된 데이터도 없으면 원래 오류 전달
      throw error;
    }
  },

  // 스터디 멤버 조회
  getStudyMembers: async (studyId) => {
    try {
      console.log(`[StudyService] 스터디 멤버 조회 요청: ${studyId}`);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 스터디 멤버 조회 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청
      const response = await api.get(`/studies/${studyId}/management/members`, {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("[StudyService] 스터디 멤버 조회 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 멤버 조회 오류:", error);
      throw error;
    }
  },

  // 스터디 멤버 역할 변경
  changeMemberRole: async (studyId, memberId, roleData) => {
    try {
      console.log(
        `[StudyService] 스터디 멤버 역할 변경 요청: 스터디 ${studyId}, 멤버 ${memberId}, 역할 ${roleData.memberRole}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 스터디 멤버 역할 변경 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 요청 데이터 준비 - API 명세에 맞게 수정
      const requestData = {
        studyName: roleData.studyName || "", // 필요한 경우 전달받아 사용
        memberRole: roleData.memberRole || "PARTICIPANT", // 기본값은 참여자
      };

      // API 요청 - 올바른 경로로 수정
      const response = await api.put(
        `/studies/${studyId}/management/members/${memberId}/role`,
        requestData,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 스터디 멤버 역할 변경 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 멤버 역할 변경 오류:", error);

      // 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message ||
              "스터디 멤버 역할 변경에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 스터디 멤버 삭제
  removeMember: async (studyId, memberId) => {
    try {
      console.log(
        `[StudyService] 스터디 멤버 삭제 요청: 스터디 ${studyId}, 멤버 ${memberId}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 스터디 멤버 삭제 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청 - 올바른 경로로 수정
      const response = await api.delete(
        `/studies/${studyId}/management/members/${memberId}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 스터디 멤버 삭제 성공:", response.status);
      return true; // 삭제 성공 시 true 반환
    } catch (error) {
      console.error("[StudyService] 스터디 멤버 삭제 오류:", error);

      // 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "스터디 멤버 삭제에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 스터디 멤버 추가
  addMember: async (studyId, memberData) => {
    try {
      console.log(
        `[StudyService] 스터디 멤버 추가 요청: 스터디 ${studyId}, 이메일 ${memberData.studentEmail}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 스터디 멤버 추가 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청 데이터 준비 (이메일만 필요)
      const requestData = {
        studentEmail: memberData.studentEmail,
      };

      // API 요청 - 올바른 경로로 수정
      const response = await api.post(
        `/studies/${studyId}/management/members/add`,
        requestData,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // 응답 확인 로그
      console.log("[StudyService] 스터디 멤버 추가 성공:", response.data);

      // 응답 데이터 형식이 { studyName, memberRole }인 경우를 처리
      // 상태 코드가 201 Created이고 응답 본문에 데이터가 있는 경우
      if (response.status === 201 && response.data) {
        // 응답 로깅
        if (
          response.data.studyName !== undefined ||
          response.data.memberRole !== undefined
        ) {
          console.log("[StudyService] 스터디 멤버 추가 응답:", {
            studyName: response.data.studyName,
            memberRole: response.data.memberRole,
          });
        }
      }

      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 멤버 추가 오류:", error);

      // 404 에러인 경우 회원가입하지 않은 이메일 메시지 반환
      if (error.response && error.response.status === 404) {
        throw new Error("회원가입 하지 않은 이메일입니다.");
      }

      // 그 외 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "스터디 멤버 추가에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 일정 목록 조회
  getSchedules: async (studyId) => {
    try {
      console.log(`[StudyService] 일정 목록 조회 요청: 스터디 ${studyId}`);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 일정 목록 조회 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청
      const response = await api.get(`/studies/${studyId}/schedules`, {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("[StudyService] 일정 목록 조회 성공:", response.data);

      // API 응답 형식: { memberContext: {...}, data: [...] }
      // memberContext 정보 로깅
      if (response.data && response.data.memberContext) {
        console.log(
          "[StudyService] 멤버 컨텍스트:",
          response.data.memberContext
        );
      }

      // 전체 응답 객체 그대로 반환 - 컴포넌트에서 data 필드에 접근하도록 함
      return response.data;
    } catch (error) {
      console.error("[StudyService] 일정 목록 조회 오류:", error);
      throw error;
    }
  },

  // 일정 상세 조회
  getScheduleById: async (studyId, scheduleId) => {
    try {
      console.log(
        `[StudyService] 일정 상세 조회 요청: 스터디 ${studyId}, 일정 ${scheduleId}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 일정 상세 조회 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청
      const response = await api.get(
        `/studies/${studyId}/schedules/${scheduleId}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 일정 상세 조회 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[StudyService] 일정 상세 조회 오류:", error);

      // 404 Not Found - 존재하지 않는 일정
      if (error.response && error.response.status === 404) {
        throw new Error("존재하지 않는 일정입니다.");
      }

      throw error;
    }
  },

  // 일정 추가
  addSchedule: async (studyId, scheduleData) => {
    try {
      console.log(`[StudyService] 일정 추가 요청: 스터디 ${studyId}`);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 일정 추가 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 시간 정보를 포함한 날짜 문자열 생성
      let dateTimeString;
      if (scheduleData.date && scheduleData.time) {
        // 시간 정보가 있으면 통합
        dateTimeString = `${scheduleData.date.replace(/\./g, "-")}T${
          scheduleData.time
        }:00`;
      } else if (scheduleData.date && scheduleData.date.includes("T")) {
        // 이미 ISO 형식이면 그대로 사용
        dateTimeString = scheduleData.date.replace(/\./g, "-");
      } else {
        // 날짜만 있고 시간이 없으면 기본값 사용
        dateTimeString = `${scheduleData.date.replace(/\./g, "-")}T00:00:00`;
      }

      // 백엔드 요청 형식에 맞게 변환
      const apiScheduleData = {
        scheduleTitle: scheduleData.title,
        scheduleContent: scheduleData.content,
        scheduleStartingAt: dateTimeString,
      };

      console.log("[StudyService] 일정 추가 요청 데이터:", apiScheduleData);

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/schedules/add`,
        apiScheduleData,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 일정 추가 응답:", response);

      // 응답 형식: { studyName: "...", memberRole: "..." }
      console.log("[StudyService] 응답 데이터:", {
        studyName: response.data?.studyName,
        memberRole: response.data?.memberRole,
      });

      // 201 성공 시 응답 데이터에 scheduleId 정보 추가
      if (response.status === 201) {
        const locationUrl = response.headers["location"];
        let scheduleId = null;

        if (locationUrl) {
          scheduleId = locationUrl.split("/").pop();
          console.log("[StudyService] 생성된 일정 ID:", scheduleId);
        }

        // scheduleId 정보가 있으면 응답 데이터에 추가하여 반환
        return {
          ...response.data,
          scheduleId,
        };
      }

      // 그 외의 경우 응답 데이터 그대로 반환
      return response.data;
    } catch (error) {
      console.error("[StudyService] 일정 추가 오류:", error);

      // 403 Forbidden - 권한 없음
      if (error.response && error.response.status === 403) {
        throw new Error("일정을 추가할 권한이 없습니다.");
      }

      // 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "일정 추가에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 일정 수정
  updateSchedule: async (studyId, scheduleId, scheduleData) => {
    try {
      console.log(
        `[StudyService] 일정 수정 요청: 스터디 ${studyId}, 일정 ${scheduleId}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 일정 수정 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 시간 정보를 포함한 날짜 문자열 생성
      let dateTimeString;
      if (scheduleData.date && scheduleData.time) {
        // 시간 정보가 있으면 통합
        dateTimeString = `${scheduleData.date.replace(/\./g, "-")}T${
          scheduleData.time
        }:00`;
      } else if (scheduleData.date && scheduleData.date.includes("T")) {
        // 이미 ISO 형식이면 그대로 사용
        dateTimeString = scheduleData.date.replace(/\./g, "-");
      } else {
        // 날짜만 있고 시간이 없으면 기본값 사용
        dateTimeString = `${scheduleData.date.replace(/\./g, "-")}T00:00:00`;
      }

      // 백엔드 요청 형식에 맞게 변환
      const apiScheduleData = {
        scheduleTitle: scheduleData.title,
        scheduleContent: scheduleData.content,
        scheduleStartingAt: dateTimeString,
      };

      console.log("[StudyService] 일정 수정 요청 데이터:", apiScheduleData);

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/schedules/${scheduleId}`,
        apiScheduleData,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 일정 수정 응답:", response);

      // 응답 형식: { studyName: "...", memberRole: "..." }
      console.log("[StudyService] 응답 데이터:", {
        studyName: response.data?.studyName,
        memberRole: response.data?.memberRole,
      });

      // 응답 데이터에 scheduleId 추가하여 반환
      return {
        ...response.data,
        scheduleId: scheduleId, // 전달받은 scheduleId 사용
      };
    } catch (error) {
      console.error("[StudyService] 일정 수정 오류:", error);

      // 403 Forbidden - 권한 없음
      if (error.response && error.response.status === 403) {
        throw new Error("일정을 수정할 권한이 없습니다.");
      }

      // 404 Not Found - 존재하지 않는 일정
      if (error.response && error.response.status === 404) {
        throw new Error("존재하지 않는 일정입니다.");
      }

      // 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "일정 수정에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 일정 삭제
  deleteSchedule: async (studyId, scheduleId) => {
    try {
      console.log(
        `[StudyService] 일정 삭제 요청: 스터디 ${studyId}, 일정 ${scheduleId}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 일정 삭제 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청
      const response = await api.delete(
        `/studies/${studyId}/schedules/${scheduleId}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 일정 삭제 응답:", response);

      // 응답 형식: { studyName: "...", memberRole: "..." }
      if (response.data) {
        console.log("[StudyService] 응답 데이터:", {
          studyName: response.data.studyName,
          memberRole: response.data.memberRole,
        });

        // 데이터가 있으면 그대로 반환
        return response.data;
      }

      // 204 No Content 응답은 성공으로 처리
      if (response.status === 204) {
        return { success: true };
      }

      // 기타 성공 응답
      return { success: true };
    } catch (error) {
      console.error("[StudyService] 일정 삭제 오류:", error);

      // 403 Forbidden - 권한 없음
      if (error.response && error.response.status === 403) {
        throw new Error("일정을 삭제할 권한이 없습니다.");
      }

      // 404 Not Found - 존재하지 않는 일정
      if (error.response && error.response.status === 404) {
        throw new Error("존재하지 않는 일정입니다.");
      }

      // 오류 메시지 추출 및 반환
      if (error.response && error.response.data) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "일정 삭제에 실패했습니다.";
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // 출석 목록 조회
  getAttendances: async (studyId) => {
    try {
      // 명시적 디버깅 로그
      console.log(`[StudyService] 출석 목록 조회 요청 시작: ${studyId}`);
      console.log(`[StudyService] 요청 URL: /studies/${studyId}/attendances`);
      console.log("[StudyService] 토큰 상태:", !!tokenUtils.getToken());

      // 네트워크 요청을 직접 fetch로도 시도
      try {
        console.log(`[StudyService] fetch API로 직접 요청 시도`);
        const fetchUrl = `${
          import.meta.env.PROD
            ? "https://onrank.kr"
            : import.meta.env.VITE_API_URL || "http://localhost:8080"
        }/studies/${studyId}/attendances`;
        console.log(`[StudyService] fetch 요청 URL: ${fetchUrl}`);

        const token = tokenUtils.getToken();
        const fetchResponse = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            Authorization: token || "",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        console.log(`[StudyService] fetch 응답 상태:`, fetchResponse.status);
      } catch (fetchError) {
        console.error(`[StudyService] fetch 시도 실패:`, fetchError);
      }

      // 원래 axios 요청 실행
      console.log(`[StudyService] axios로 출석 목록 조회 요청`);
      const response = await api.get(`/studies/${studyId}/attendances`);

      // 응답 구조 로깅
      console.log("[StudyService] 출석 목록 응답 구조:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      // 에러 방지를 위한 안전한 응답 처리
      const responseData = response.data;
      if (!responseData) return [];

      return responseData;
    } catch (error) {
      console.error("[StudyService] 출석 목록 조회 실패:", error);
      console.error("[StudyService] 에러 타입:", error.name);
      console.error("[StudyService] 에러 메시지:", error.message);
      if (error.response) {
        console.error("[StudyService] 에러 응답 데이터:", error.response.data);
        console.error("[StudyService] 에러 응답 상태:", error.response.status);
      }
      console.error("[StudyService] 에러 콜스택:", error.stack);
      return []; // 오류 발생 시 빈 배열 반환
    }
  },

  // 출석 상세 정보 조회
  getAttendanceDetails: async (studyId, scheduleId) => {
    try {
      console.log(
        `[StudyService] 출석 상세 정보 조회 요청: ${studyId}, 일정: ${scheduleId}`
      );

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 토큰 없음, 출석 상세 정보 조회 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // API 요청
      const response = await api.get(
        `/studies/${studyId}/attendances/${scheduleId}`,
        {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[StudyService] 출석 상세 정보 조회 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[API] 출석 상세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 출석 상태 변경 (변경 권한 있는 사용자만 가능)
  updateAttendance: async (studyId, attendanceId, newStatus) => {
    try {
      console.log(
        `[StudyService] 출석 상태 업데이트 요청: ${studyId}, 출석ID: ${attendanceId}, 상태: ${newStatus}`
      );

      // 토큰 가져오기
      const token = tokenUtils.getToken();
      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // 모든 필요한 헤더 포함하여 CORS 해결 시도
      const config = {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      };

      // URL 쿼리 파라미터로 status 전달 (PUT 메서드 사용)
      const response = await api.put(
        `/studies/${studyId}/attendances/${attendanceId}?status=${newStatus}`,
        {}, // 빈 객체 (요청 본문 필요 없음)
        config
      );

      console.log("[StudyService] 출석 상태 업데이트 성공:", response.data);
      return response.data || {};
    } catch (error) {
      console.error("[StudyService] 출석 상태 업데이트 실패:", error);

      // CORS 오류 이슈 감지 및 사용자 친화적 에러 메시지
      if (error.message && error.message.includes("Network Error")) {
        console.error("[StudyService] CORS 또는 네트워크 오류 발생:", error);
        alert(
          "출석 상태 변경에 실패했습니다. 네트워크 연결 또는 서버 설정을 확인해주세요."
        );
      }

      throw error;
    }
  },

  // 스터디 생성 (이미지 업로드 포함)
  createStudyWithImage: async (studyData, imageFile) => {
    try {
      console.log("[StudyService] 스터디 생성 및 이미지 업로드 요청:", {
        studyData,
        imageFileName: imageFile?.name || "이미지 없음",
        hasImage: !!imageFile,
      });

      // 1. 스터디 생성 및 Pre-signed URL 요청
      const requestData = {
        studyName: studyData.studyName || "",
        studyContent: studyData.studyContent || "",
        studyGoogleFormUrl: studyData.studyGoogleFormUrl || null,
        fileName: imageFile?.name || null, // 파일 이름이 없으면 명시적으로 null 전송
        deposit: studyData.deposit || 0, // 보증금 추가 (없으면 0으로 기본값 설정)
      };

      console.log("[StudyService] 백엔드 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[StudyService] 인증 토큰 없음, 스터디 생성 불가");
        const authError = new Error(
          "인증 토큰이 없습니다. 로그인이 필요합니다."
        );
        authError.type = "AUTH_ERROR";

        // 로그인 페이지가 아닐 경우에만 리다이렉트
        if (!window.location.pathname.includes("/login")) {
          console.log("[StudyService] 인증 실패로 로그인 페이지로 리다이렉트");
          const loginUrl = `${window.location.protocol}//${window.location.host}/login`;
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 500);
        }

        throw authError;
      }

      // API 요청
      const response = await api.post("/studies/add", requestData, {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        withCredentials: true,
      });

      console.log("[StudyService] 스터디 생성 응답:", response.data);

      // 2. Pre-signed URL이 있고 이미지 파일이 있는 경우 S3에 업로드
      if (response.data.uploadUrl && imageFile) {
        try {
          await studyService.uploadImageToS3(
            response.data.uploadUrl,
            imageFile
          );
          console.log("[StudyService] 이미지 업로드 성공");
        } catch (uploadError) {
          console.error("[StudyService] 이미지 업로드 실패:", uploadError);
          // 이미지 업로드 실패 시에도 스터디 생성은 완료된 것으로 처리
          return {
            ...response.data,
            warning: "스터디는 생성되었으나 이미지 업로드에 실패했습니다.",
          };
        }
      }

      // 3. 최종 응답 반환
      return response.data;
    } catch (error) {
      console.error("[StudyService] 스터디 생성 오류:", error);

      // 인증 오류인 경우 (401, 403)
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        console.error("[StudyService] 인증 오류 발생:", error.response.status);

        // 사용자에게 더 명확한 피드백을 제공하기 위한 에러 객체
        const authError = new Error(
          "인증에 실패했습니다. 다시 로그인이 필요합니다."
        );
        authError.type = "AUTH_ERROR";
        authError.requireRelogin = true;

        // 로그인 페이지가 아닐 경우에만 리다이렉트
        if (!window.location.pathname.includes("/login")) {
          console.log("[StudyService] 인증 실패로 로그인 페이지로 리다이렉트");
          const loginUrl = `${window.location.protocol}//${window.location.host}/login`;
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 500);
        }

        throw authError;
      }

      // 네트워크 에러 처리
      if (error.message && error.message.includes("Network Error")) {
        const networkError = new Error(
          "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
        );
        networkError.type = "NETWORK_ERROR";
        throw networkError;
      }

      // 기타 에러
      throw error;
    }
  },

  // S3에 이미지 직접 업로드
  uploadImageToS3: async (uploadUrl, imageFile) => {
    try {
      console.log("[StudyService] S3 이미지 업로드 시작:", {
        uploadUrl: uploadUrl.substring(0, 100) + "...",
        fileName: imageFile.name,
        fileSize: imageFile.size,
      });

      await axios.put(uploadUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log("[StudyService] S3 이미지 업로드 완료");
      return true;
    } catch (error) {
      console.error("[StudyService] S3 이미지 업로드 실패:", error);
      throw new Error(
        "이미지 업로드에 실패했습니다: " + (error.message || "알 수 없는 오류")
      );
    }
  },

  // 출석 상태 업데이트
  updateAttendance: async (studyId, attendanceId, newStatus) => {
    try {
      console.log(
        `[StudyService] 출석 상태 업데이트 요청: ${studyId}, 출석ID: ${attendanceId}, 상태: ${newStatus}`
      );

      const response = await api.put(
        `/studies/${studyId}/attendances/${attendanceId}?status=${newStatus}`,
        {}, // 빈 객체 (요청 본문 필요 없음)
        {
          withCredentials: true,
        },
        {
          attendanceStatus: newStatus,
        }
      );

      console.log("[StudyService] 출석 상태 업데이트 성공:", response.data);
      return response.data || {}; // 응답이 없는 경우 빈 객체 반환
    } catch (error) {
      console.error("[StudyService] 출석 상태 업데이트 실패:", error);
      throw error;
    }
  },

  // 로그아웃 시 메모리 캐시 초기화 함수 추가 (외부에서 호출 가능하도록)
  clearCache: () => {
    memoryCache.studiesList = null;
    memoryCache.studyDetails = {};
    console.log("[StudyService] 메모리 캐시가 초기화되었습니다.");
  },
};

export const noticeService = {
  // 공지사항 목록 조회
  getNotices: async (studyId, params = {}) => {
    try {
      console.log("[NoticeService] 공지사항 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[NoticeService] 토큰 없음, 공지사항 목록 조회 시 인증 문제 가능성"
        );
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      const response = await api.get(`/studies/${studyId}/notices`, {
        params,
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[NoticeService] 공지사항 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          console.log("[NoticeService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (responseData.includes("<!DOCTYPE html>")) {
            console.warn("[NoticeService] HTML 응답 감지, 빈 배열 반환");
            return {
              success: false,
              message: "유효하지 않은 응답 형식입니다",
              data: [],
            };
          }

          // JSON 문자열인 경우 파싱 시도
          try {
            responseData = JSON.parse(responseData);
          } catch (parseError) {
            console.error("[NoticeService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[NoticeService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 없거나 유효하지 않은 경우
      if (!responseData) {
        console.warn("[NoticeService] 유효하지 않은 응답 데이터");
        return {
          success: false,
          message: "유효하지 않은 응답 데이터입니다",
          data: [],
        };
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let noticeData = responseData;
      let memberContext = null;

      if (responseData.data !== undefined) {
        console.log(
          "[NoticeService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        noticeData = responseData.data;
        memberContext = responseData.memberContext || null;

        console.log("[NoticeService] 멤버 컨텍스트:", memberContext);
      }

      // 데이터가 배열인지 확인
      let dataArray = Array.isArray(noticeData)
        ? noticeData
        : noticeData
        ? [noticeData]
        : [];

      if (dataArray.length > 0) {
        console.log(
          "[NoticeService] 첫 번째 공지사항 객체 필드:",
          Object.keys(dataArray[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log(
          "[NoticeService] noticeId 존재 여부:",
          "noticeId" in dataArray[0]
        );
        console.log(
          "[NoticeService] noticeTitle 존재 여부:",
          "noticeTitle" in dataArray[0]
        );
        console.log(
          "[NoticeService] noticeContent 존재 여부:",
          "noticeContent" in dataArray[0]
        );

        // 데이터 유효성 검사 및 기본값 설정
        dataArray = dataArray.map((notice) => {
          const processedNotice = { ...notice };

          // noticeId가 없거나 유효하지 않은 경우
          if (!processedNotice.noticeId || isNaN(processedNotice.noticeId)) {
            console.warn(
              "[NoticeService] noticeId 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            processedNotice.noticeId = Math.floor(Math.random() * 10000);
          }

          // 제목이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedNotice.noticeTitle === undefined ||
            processedNotice.noticeTitle === null ||
            processedNotice.noticeTitle.trim() === ""
          ) {
            console.warn(
              "[NoticeService] noticeTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedNotice.noticeTitle = "제목 없음";
          }

          // 내용이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedNotice.noticeContent === undefined ||
            processedNotice.noticeContent === null ||
            processedNotice.noticeContent.trim() === ""
          ) {
            console.warn(
              "[NoticeService] noticeContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedNotice.noticeContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!processedNotice.noticeCreatedAt) {
            console.warn(
              "[NoticeService] noticeCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            processedNotice.noticeCreatedAt = new Date().toISOString();
          }

          // 수정일이 없는 경우
          if (!processedNotice.noticeModifiedAt) {
            console.warn(
              "[NoticeService] noticeModifiedAt 필드 없음, 생성일과 동일하게 설정"
            );
            processedNotice.noticeModifiedAt = processedNotice.noticeCreatedAt;
          }

          // 파일 배열 확인
          if (!processedNotice.files) {
            processedNotice.files = [];
          }

          return processedNotice;
        });
      }

      // 최종 결과 반환
      return {
        success: true,
        data: dataArray,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[NoticeService] 공지사항 목록 조회 오류:", error);
      // 오류 발생 시 오류 정보와 함께 빈 배열 반환
      return {
        success: false,
        message:
          error.message || "공지사항 목록을 불러오는 중 오류가 발생했습니다",
        data: [],
      };
    }
  },

  // 이미지 업로드 함수
  ImageUploadToS3: async (presignedUrl, imageFile) => {
    try {
      console.log("[ImageUploadToS3] 이미지 업로드 시작:", imageFile.name);

      const uploadResponse = await axios.put(presignedUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
        },
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        console.log("[ImageUploadToS3] 이미지 업로드 성공:", imageFile.name);
      } else {
        console.error("[ImageUploadToS3] 이미지 업로드 실패:", imageFile.name);
        throw new Error(`이미지 업로드 실패: ${imageFile.name}`);
      }
    } catch (error) {
      console.error("[ImageUploadToS3] 이미지 업로드 중 오류:", error);
      throw error;
    }
  },

  // 파일 업로드 함수
  FileUploadToS3: async (presignedUrl, file) => {
    try {
      console.log("[FileUploadToS3] 파일 업로드 시작:", file.name);

      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        console.log("[FileUploadToS3] 파일 업로드 성공:", file.name);
      } else {
        console.error("[FileUploadToS3] 파일 업로드 실패:", file.name);
        throw new Error(`파일 업로드 실패: ${file.name}`);
      }
    } catch (error) {
      console.error("[FileUploadToS3] 파일 업로드 중 오류:", error);
      throw error;
    }
  },

  createNotice: async (newNotice) => {
    try {
      console.log("[NoticeService] 공지사항 생성 요청:", newNotice);

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        noticeTitle: newNotice.noticeTitle || "",
        noticeContent: newNotice.noticeContent || "",
        noticeImageUrl: newNotice.noticeImageUrl || null,
      };

      console.log("[NoticeService] 변환된 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[NoticeService] 토큰 없음, 공지사항 생성 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/notices/add`,
        requestData,
        {
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest", // CSRF 방지 및 브라우저 호환성 향상
            Accept: "application/json", // JSON 응답 요청
          },
          withCredentials: true,
        }
      );

      console.log("[NoticeService] 공지사항 생성 응답:", response.data);

      // 기존 코드 제거 및 새로운 파일 업로드 로직 추가
      // 여러 파일 업로드 처리: 이미지 파일 및 일반 파일 모두 지원
      if (response.data) {
        try {
          // 단일 이미지 파일이 있는 경우 (기존 호환성 유지)
          if (response.data.uploadUrl && newNotice.imageFile) {
            console.log(
              "[NoticeService] 이미지 파일 업로드 시작:",
              newNotice.imageFile.name
            );

            if (newNotice.imageFile.type.startsWith("image/")) {
              await noticeService.ImageUploadToS3(
                response.data.uploadUrl,
                newNotice.imageFile
              );
              console.log("[NoticeService] 이미지 업로드 성공");
            } else {
              await noticeService.FileUploadToS3(
                response.data.uploadUrl,
                newNotice.imageFile
              );
              console.log("[NoticeService] 파일 업로드 성공");
            }
          }

          // 여러 파일이 있는 경우 (presignedUrls 또는 uploadUrls 배열)
          if (newNotice.files && newNotice.files.length > 0) {
            let uploadUrls = [];

            // 다양한 응답 구조 지원
            if (
              response.data.presignedUrls &&
              response.data.presignedUrls.length > 0
            ) {
              uploadUrls = response.data.presignedUrls;
              console.log(
                "[NoticeService] presignedUrls 사용:",
                uploadUrls.length
              );
            } else if (
              response.data.uploadUrls &&
              response.data.uploadUrls.length > 0
            ) {
              uploadUrls = response.data.uploadUrls;
              console.log(
                "[NoticeService] uploadUrls 사용:",
                uploadUrls.length
              );
            }

            if (uploadUrls.length > 0) {
              console.log("[NoticeService] 다중 파일 업로드 시작");

              // 각 파일에 대해 업로드 처리
              for (
                let i = 0;
                i < Math.min(newNotice.files.length, uploadUrls.length);
                i++
              ) {
                const file = newNotice.files[i];
                const uploadUrl = uploadUrls[i];

                if (!uploadUrl) {
                  console.warn(
                    `[NoticeService] ${i + 1}번째 파일의 업로드 URL이 없습니다`
                  );
                  continue;
                }

                try {
                  console.log(
                    `[NoticeService] 파일 '${file.name}' 업로드 시작`
                  );

                  // 파일 유형에 따라 적절한 업로드 함수 선택
                  if (file.type.startsWith("image/")) {
                    await noticeService.ImageUploadToS3(uploadUrl, file);
                    console.log(
                      `[NoticeService] 이미지 '${file.name}' 업로드 성공`
                    );
                  } else {
                    await noticeService.FileUploadToS3(uploadUrl, file);
                    console.log(
                      `[NoticeService] 파일 '${file.name}' 업로드 성공`
                    );
                  }
                } catch (individualError) {
                  console.error(
                    `[NoticeService] '${file.name}' 파일 업로드 실패:`,
                    individualError
                  );
                  // 개별 파일 실패 시 다른 파일 업로드는 계속 진행
                }
              }

              console.log("[NoticeService] 모든 파일 업로드 완료");
            } else {
              console.log(
                "[NoticeService] 업로드할 URL이 없어 파일 업로드를 건너뜁니다"
              );
            }
          }
        } catch (uploadError) {
          console.error("[NoticeService] 파일 업로드 중 오류:", uploadError);
          return {
            ...response.data,
            warning: "공지사항는 생성되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      // 3. 최종 응답 반환
      return response.data;
    } catch (error) {
      console.error("[NoticeService] 공지사항 생성 오류:", error);

      // 인증 오류인 경우 (401, 403)
      if (error.response && error.response.status === 403) {
        console.error("[NoticeService] 인증 오류 발생:", error.response.status);

        // 사용자에게 더 명확한 피드백을 제공하기 위한 에러 객체
        const authError = new Error("해당 공지사항에 대한 권한이 없습니다.");
        authError.type = "AUTH_ERROR";
        authError.requireRelogin = true;

        // 로그인 페이지가 아닐 경우에만 리다이렉트
        if (!window.location.pathname.includes("/login")) {
          console.log("[NoticeService] 인증 실패로 로그인 페이지로 리다이렉트");
          const loginUrl = `${window.location.protocol}//${window.location.host}/login`;
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 500);
        }

        throw authError;
      }

      // 네트워크 에러 처리
      if (error.message && error.message.includes("Network Error")) {
        const networkError = new Error(
          "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
        );
        networkError.type = "NETWORK_ERROR";
        throw networkError;
      }

      // 기타 에러
      throw error;
    }
  },

  // 공지사항 상세 조회
  getNoticeById: async (studyId, noticeId) => {
    try {
      console.log(
        `[NoticeService] 공지사항 상세 조회 요청: ${studyId}/notices/${noticeId}`
      );

      const response = await api.get(
        `/studies/${studyId}/notices/${noticeId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[NoticeService] 공지사항 상세 조회 성공:", response.data);

      // 데이터 유효성 검사 추가
      let responseData = response.data;

      // 데이터가 없거나 잘못된 형식인 경우 처리
      if (!responseData) {
        console.warn("[NoticeService] 응답 데이터 없음");
        return {
          success: false,
          message: "공지사항 데이터를 불러올 수 없습니다.",
          data: null,
        };
      }

      // API 응답 구조 분석 (memberContext, data 구조 처리)
      let data = responseData;
      let memberContext = null;

      // 새로운 API 응답 형식 확인 (memberContext/data 구조)
      if (responseData.data !== undefined) {
        console.log(
          "[NoticeService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        data = responseData.data;
        memberContext = responseData.memberContext || null;
      }

      // 백엔드 응답 구조 로깅
      console.log("[NoticeService] 게시판 상세 응답 구조:", {
        hasData: !!data,
        dataType: typeof data,
        fields: data ? Object.keys(data) : [],
      });

      // 데이터가 없는 경우 기본 구조 생성
      if (!data) {
        data = {
          noticeId: noticeId,
          noticeTitle: "제목 없음",
          noticeContent: "내용 없음",
          noticeCreatedAt: new Date().toISOString(),
          noticeModifiedAt: new Date().toISOString(),
          files: [],
        };
      } else {
        // 필수 필드가 없는 경우 기본값 설정
        if (
          data.noticeTitle === undefined ||
          data.noticeTitle === null ||
          data.noticeTitle.trim() === ""
        ) {
          console.warn(
            "[NoticeService] noticeTitle 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.noticeTitle = "제목 없음";
        }

        if (
          data.noticeContent === undefined ||
          data.noticeContent === null ||
          data.noticeContent.trim() === ""
        ) {
          console.warn(
            "[noticeService] noticeContent 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.noticeContent = "내용 없음";
        }

        if (!data.noticeCreatedAt) {
          console.warn(
            "[noticeService] noticeCreatedAt 필드 없음, 현재 시간으로 설정"
          );
          data.noticeCreatedAt = new Date().toISOString();
        }

        if (!data.noticeModifiedAt) {
          console.warn(
            "[noticeService] noticeModifiedAt 필드 없음, 생성일과 동일하게 설정"
          );
          data.noticeModifiedAt = data.noticeCreatedAt;
        }

        // 파일 배열 확인
        if (!data.files) {
          data.files = [];
        }
      }

      console.log("[noticeService] 가공된 공지사항 상세 데이터:", data);

      // memberContext가 있으면 함께 반환
      return {
        success: true,
        data: data,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[NoticeService] 공지사항 상세 조회 오류:", error);
      return {
        success: false,
        message: error.message || "공지사항을 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 공지사항 삭제
  deleteNotice: async (studyId, noticeId) => {
    try {
      console.log(
        `[NoticeService] 공지사항 삭제 요청: /studies/${studyId}/notices/${noticeId}`
      );

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[NoticeService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(
        `/studies/${studyId}/notices/${noticeId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
          },
        }
      );

      console.log("[NoticeService] 공지사항 삭제 성공:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("[NoticeService] 공지사항 삭제 오류:", error);
      if (error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 공지사항을 삭제할 수 없습니다.",
        };
      }
      throw error;
    }
  },
  // 공지사항 수정
  editNotice: async (studyId, noticeId, noticeData, files = []) => {
    try {
      console.log(
        `[NoticeService] 공지사항 수정 요청: /studies/${studyId}/notices/${noticeId}`
      );

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        noticeTitle: noticeData.noticeTitle || "",
        noticeContent: noticeData.noticeContent || "",
        fileNames: noticeData.fileNames || [], // 파일명 목록 추가
      };

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[NoticeService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/notices/${noticeId}`,
        requestData, // 수정할 데이터
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[NoticeService] 공지사항 수정 성공:", response.data);

      // 파일 업로드 처리
      if (files && files.length > 0 && response.data.uploadUrls) {
        try {
          await handleFileUpload(response.data, files);
        } catch (uploadError) {
          console.error("[NoticeService] 파일 업로드 중 오류:", uploadError);
          return {
            success: true,
            data: response.data,
            warning: "공지사항은 수정되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[NoticeService] 공지사항 수정 오류:", error);

      // 권한이 없는 경우 (403)
      if (error.response && error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 공지사항을 수정할 수 없습니다.",
        };
      }
      return {
        success: false,
        message: error.message || "공지사항 수정 중 오류가 발생했습니다.",
      };
    }
  },

  uploadFilesToS3: async (uploadUrl, imageFile) => {
    try {
      console.log("[StudyService] S3 이미지 업로드 시작:", {
        uploadUrl: uploadUrl.substring(0, 100) + "...",
        fileName: imageFile.name,
        fileSize: imageFile.size,
      });

      await axios.put(uploadUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log("[NoticeService] S3 파일 업로드 완료");
      return true;
    } catch (error) {
      console.error("[NoticeService] S3 파일 업로드 실패:", error);
      throw new Error(
        "파일 업로드에 실패했습니다: " + (error.message || "알 수 없는 오류")
      );
    }
  },
};

export const postService = {
  // 게시판 목록 조회
  getPosts: async (studyId, params = {}) => {
    try {
      console.log("[postService] 게시판 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[postService] 토큰 없음, 게시판 목록 조회 시 인증 문제 가능성"
        );
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      const response = await api.get(`/studies/${studyId}/posts`, {
        params,
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[postService] 게시판 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let data = response.data;
      if (typeof data === "string") {
        try {
          console.log("[postService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (data.includes("<!DOCTYPE html>")) {
            console.warn("[postService] HTML 응답 감지, 빈 배열 반환");
            return {
              success: false,
              message: "유효하지 않은 응답 형식입니다",
              data: [],
            };
          }

          // JSON 문자열인 경우 파싱 시도
          try {
            data = JSON.parse(data);
          } catch (parseError) {
            console.error("[postService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[postService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let postData = data;
      let memberContext = null;

      if (data && data.data && Array.isArray(data.data)) {
        console.log("[postService] 새 API 응답 구조 감지 (memberContext/data)");
        postData = data.data;
        memberContext = data.memberContext || null;
      }

      // 기존 data 변수를 postData로 변경
      data = postData;

      // 배열이 아닌 경우 배열로 변환
      if (!Array.isArray(data)) {
        console.warn("[postService] 응답이 배열이 아님, 배열로 변환:", data);
        data = data ? [data] : [];
      }

      if (data.length > 0) {
        console.log(
          "[postService] 첫 번째 게시판 객체 필드:",
          Object.keys(data[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log("[postService] postId 존재 여부:", "postId" in data[0]);
        console.log(
          "[postService] postTitle 존재 여부:",
          "postTitle" in data[0]
        );
        console.log(
          "[postService] postContent 존재 여부:",
          "postContent" in data[0]
        );

        // 데이터 유효성 검사
        data = data.map((post) => {
          // postId가 없거나 유효하지 않은 경우
          if (!post.postId || isNaN(post.postId)) {
            console.warn(
              "[postService] postId 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            post.postId = Math.floor(Math.random() * 10000);
          }

          // 제목이 없거나 빈 문자열인 경우
          if (!post.postTitle || post.postTitle.trim() === "") {
            console.warn(
              "[postService] postTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            post.postTitle = "제목 없음";
          }

          // 내용이 없거나 빈 문자열인 경우
          if (!post.postContent || post.postContent.trim() === "") {
            console.warn(
              "[postService] postContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            post.postContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!post.postCreatedAt) {
            console.warn(
              "[postService] postCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            post.postCreatedAt = new Date().toISOString();
          }

          // 수정일이 없는 경우
          if (!post.postModifiedAt) {
            console.warn(
              "[postService] postModifiedAt 필드 없음, 생성일과 동일하게 설정"
            );
            post.postModifiedAt = post.postCreatedAt;
          }

          // 작성자가 없는 경우
          if (!post.postWritenBy) {
            console.warn("[postService] postWritenBy 필드 없음, 기본값 설정");
            post.postWritenBy = "작성자 없음";
          }

          return post;
        });
      }

      return { success: true, data: data };
    } catch (error) {
      console.error("[postService] 게시판 목록 조회 오류:", error);
      // 오류 발생 시 오류 정보와 함께 빈 배열 반환
      return {
        success: false,
        message:
          error.message || "게시판 목록을 불러오는 중 오류가 발생했습니다",
        data: [],
      };
    }
  },

  // 게시판 생성
  createPost: async (studyId, newPost, files = []) => {
    try {
      console.log("[postService] 게시판 생성 요청:", newPost);
      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        postTitle: newPost.postTitle || "",
        postContent: newPost.postContent || "",
        fileNames: newPost.fileNames || [],
      };

      console.log("[postService] 변환된 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[postService] 토큰 없음, 게시판 생성 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/posts/add`,
        requestData,
        {
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest", // CSRF 방지 및 브라우저 호환성 향상
            Accept: "application/json", // JSON 응답 요청
          },
          withCredentials: true,
        }
      );

      // 응답이 HTML인 경우 (로그인 페이지 등)
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        console.warn(
          "[postService] HTML 응답 감지, 인증 문제 가능성:",
          response.data.substring(0, 100) + "..."
        );

        // 토큰 만료 여부 확인
        const isTokenExpired = tokenUtils.isTokenExpired(token);

        // 토큰이 만료된 경우에만 재발급 시도
        if (isTokenExpired) {
          try {
            console.log("[postService] 토큰 만료됨, 재발급 시도");
            const refreshResponse = await api.get("/auth/reissue");
            const newToken =
              refreshResponse.headers["authorization"] ||
              refreshResponse.headers["Authorization"];

            if (newToken) {
              console.log("[postService] 토큰 재발급 성공, 요청 재시도");
              tokenUtils.setToken(newToken);

              // 새 토큰으로 요청 재시도
              const retryResponse = await api.post(
                `/studies/${studyId}/posts/add`,
                requestData,
                {
                  headers: {
                    Authorization: newToken,
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                  },
                  withCredentials: true,
                }
              );

              console.log(
                "[postService] 게시판 생성 재시도 결과:",
                retryResponse.data
              );

              // 파일 업로드 처리
              await handleFileUpload(retryResponse.data, files);

              return { success: true, data: retryResponse.data };
            }
          } catch (refreshError) {
            console.error("[postService] 토큰 재발급 실패:", refreshError);
            return {
              success: false,
              message: "인증이 만료되었습니다. 다시 로그인해주세요.",
              requireRelogin: true,
            };
          }
        } else {
          console.log(
            "[postService] 토큰이 유효하지만 권한 문제 발생, 로그아웃 후 재로그인 필요"
          );
          // 토큰이 유효하지만 권한 문제가 있는 경우 로그아웃 처리
          tokenUtils.removeToken(true);
          // 로그인 페이지로 리다이렉트하지 않고 오류 메시지 반환
          return {
            success: false,
            message: "권한이 없습니다. 로그아웃 후 다시 로그인해주세요.",
            requireRelogin: true,
          };
        }
      }

      console.log("[postService] 게시판 생성 성공:", response.data);

      // 파일 업로드 처리
      if (files && files.length > 0 && response.data.uploadUrls) {
        try {
          await handleFileUpload(response.data, files);
        } catch (uploadError) {
          console.error("[postService] 파일 업로드 중 오류:", uploadError);
          return {
            success: true,
            data: response.data,
            warning: "게시판은 생성되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[postService] 게시판 생성 오류:", error);

      // 인증 오류인 경우 (403)
      if (error.response && error.response.status === 403) {
        console.error("[postService] 인증 오류:", error.response.status);
        // 토큰만 제거하고 리다이렉트는 하지 않음
        tokenUtils.removeToken(true);
        return {
          success: false,
          message: "인증에 실패했습니다. 다시 로그인해주세요.",
          requireRelogin: true,
        };
      }

      return {
        success: false,
        message: error.message || "게시판 생성 중 오류가 발생했습니다.",
      };
    }
  },

  // 게시판 상세 조회
  getPostById: async (studyId, postId) => {
    try {
      console.log(
        `[postService] 게시판 상세 조회 요청: ${studyId}/posts/${postId}`
      );

      const response = await api.get(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
      });

      console.log("[postService] 게시판 상세 조회 성공:", response.data);

      // 데이터 유효성 검사 추가
      let responseData = response.data;

      // 데이터가 없거나 잘못된 형식인 경우 처리
      if (!responseData) {
        console.warn("[postService] 응답 데이터 없음");
        return {
          success: false,
          message: "게시판 데이터를 불러올 수 없습니다.",
          data: null,
        };
      }

      // API 응답 구조 분석 (memberContext, data 구조 처리)
      let data = responseData;
      let memberContext = null;

      // 새로운 API 응답 형식 확인 (memberContext/data 구조)
      if (responseData.data !== undefined) {
        console.log("[postService] 새 API 응답 구조 감지 (memberContext/data)");
        data = responseData.data;
        memberContext = responseData.memberContext || null;
      }

      // 백엔드 응답 구조 로깅
      console.log("[postService] 게시판 상세 응답 구조:", {
        hasData: !!data,
        dataType: typeof data,
        fields: data ? Object.keys(data) : [],
      });

      // 데이터가 없는 경우 기본 구조 생성
      if (!data) {
        data = {
          postId: postId,
          postTitle: "제목 없음",
          postContent: "내용 없음",
          postCreatedAt: new Date().toISOString(),
          postModifiedAt: new Date().toISOString(),
          postWritenBy: "작성자 없음",
          files: [],
        };
      } else {
        // 필수 필드가 없는 경우 기본값 설정
        if (
          data.postTitle === undefined ||
          data.postTitle === null ||
          data.postTitle.trim() === ""
        ) {
          console.warn(
            "[postService] postTitle 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postTitle = "제목 없음";
        }

        if (
          data.postContent === undefined ||
          data.postContent === null ||
          data.postContent.trim() === ""
        ) {
          console.warn(
            "[postService] postContent 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postContent = "내용 없음";
        }

        if (!data.postCreatedAt) {
          console.warn(
            "[postService] postCreatedAt 필드 없음, 현재 시간으로 설정"
          );
          data.postCreatedAt = new Date().toISOString();
        }

        if (!data.postModifiedAt) {
          console.warn(
            "[postService] postModifiedAt 필드 없음, 생성일과 동일하게 설정"
          );
          data.postModifiedAt = data.postCreatedAt;
        }

        if (!data.postWritenBy || data.postWritenBy.trim() === "") {
          console.warn(
            "[postService] postWritenBy 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postWritenBy = "작성자 없음";
        }

        // 파일 배열 확인
        if (!data.files) {
          data.files = [];
        }
      }

      console.log("[postService] 가공된 게시판 상세 데이터:", data);

      // memberContext가 있으면 함께 반환
      return {
        success: true,
        data: data,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[postService] 게시판 상세 조회 오류:", error);
      return {
        success: false,
        message: error.message || "게시판을 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 게시판 삭제
  deletePost: async (studyId, postId) => {
    try {
      console.log(
        `[postService] 게시판 삭제 요청: /studies/${studyId}/posts/${postId}`
      );

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[postService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
        },
      });

      console.log("[postService] 게시판 삭제 성공:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("[postService] 게시판 삭제 오류:", error);
      if (error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 게시판을 삭제할 수 없습니다.",
        };
      }
      throw error;
    }
  },
  // 게시판 수정
  editPost: async (studyId, postId, postData, files = []) => {
    try {
      console.log(
        `[postService] 게시판 수정 요청: /studies/${studyId}/posts/${postId}`
      );

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        postTitle: postData.postTitle || "",
        postContent: postData.postContent || "",
        fileNames: postData.fileNames || [], // 파일명 목록 추가
      };

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[postService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/posts/${postId}`,
        requestData, // 수정할 데이터
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[postService] 게시판 수정 성공:", response.data);

      // 파일 업로드 처리
      if (files && files.length > 0 && response.data.uploadUrls) {
        try {
          await handleFileUpload(response.data, files);
        } catch (uploadError) {
          console.error("[postService] 파일 업로드 중 오류:", uploadError);
          return {
            success: true,
            data: response.data,
            warning: "게시판은 수정되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[postService] 게시판 수정 오류:", error);

      // 권한이 없는 경우 (403)
      if (error.response && error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 게시판을 수정할 수 없습니다.",
        };
      }
      return {
        success: false,
        message: error.message || "게시판 수정 중 오류가 발생했습니다.",
      };
    }
  },
};

// 멤버 역할 표시명 변환 유틸리티 (CREATOR -> 마스터)
export const getMemberRoleDisplayName = (role) => {
  switch (role) {
    case "CREATOR":
      return "스터디 생성자";
    case "HOST":
      return "관리자";
    case "PARTICIPANT":
      return "참여자";
    default:
      return role || "알 수 없음";
  }
};
