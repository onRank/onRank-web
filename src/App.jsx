import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { memo, useMemo, useEffect, useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import StudiesPage from "./pages/study/StudiesPage";
import CreateStudyPage from "./pages/study/CreateStudyPage";
import OAuthCallback from "./pages/auth/OAuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { tokenUtils } from "./services/api";
import StudyDetailPage from "./pages/study/StudyDetailPage";
import NoticeFormPage from "./pages/study/notice/NoticeFormPage";
import NoticeUserPage from "./pages/study/notice/NoticeUserPage";
import NoticeManagerPage from "./pages/study/notice/NoticeManagerPage";
import NoticeDetailUserPage from "./pages/study/notice/NoticeDetailUserPage";
import NoticeDetailManagerPage from "./pages/study/notice/NoticeDetailManagerPage";
import Header from "./components/common/Header";
import UserInfoForm from "./components/auth/UserInfoForm";
import CalendarPage from "./pages/calendar/CalendarPage";
import MyPage from "./pages/user/MyPage";
import AssignmentDetail from "./pages/study/assignment/AssignmentDetail";
import ScheduleAddPage from "./pages/study/ScheduleAddPage";
import AttendanceEditPage from "./pages/study/AttendanceEditPage";
import "./App.css";

// 레이아웃 상수
const HEADER_HEIGHT = "64px";

// 헤더 컴포넌트 메모이제이션
const MemoizedHeader = memo(Header);

// 스터디 레이아웃 컴포넌트
const StudyLayout = memo(({ children }) => {
  return (
    <div
      style={{
        minHeight: `calc(100vh - ${HEADER_HEIGHT})`,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "2rem",
          backgroundColor: "var(--main-bg, #ffffff)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

StudyLayout.displayName = "StudyLayout";

// 기본 레이아웃 컴포넌트
const DefaultLayout = memo(() => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <Outlet />
  </div>
));

DefaultLayout.displayName = "DefaultLayout";

// PublicRoute 컴포넌트 - 로그인한 사용자는 /studies로 리다이렉트
const PublicRoute = ({ children }) => {
  const token = tokenUtils.getToken();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // 토큰이 있는 경우 토큰 유효성 검사
  if (token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = tokenPayload.exp * 1000;

      if (expirationTime > Date.now()) {
        // 토큰이 유효하면 /studies로 리다이렉트
        console.log("[PublicRoute] 유효한 토큰 발견, /studies로 리다이렉트");
        return <Navigate to="/studies" replace />;
      } else {
        // 토큰이 만료된 경우 제거
        console.log("[PublicRoute] 만료된 토큰 발견, 제거");
        tokenUtils.removeToken(true);
        sessionStorage.removeItem("cachedUserInfo");
      }
    } catch (error) {
      console.error("[PublicRoute] 토큰 검증 오류:", error);
      tokenUtils.removeToken(true);
      sessionStorage.removeItem("cachedUserInfo");
    }
  }

  // 토큰이 없거나 유효하지 않은 경우 로그인 페이지 표시
  return children;
};

function AppContent() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // 페이지 로드 시 관리자 권한 확인
  useEffect(() => {
    // TODO: 실제 관리자 권한 확인 로직 구현 필요
    const checkAdminStatus = async () => {
      try {
        const response = await api.get("/auth/check-role");
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error("권한 확인 중 오류:", error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  // 페이지 로드 시 토큰 확인 (한 번만 실행)
  useEffect(() => {
    // 추가: 새로고침 감지 플래그
    const isPageRefresh =
      window.performance &&
      window.performance.navigation &&
      window.performance.navigation.type === 1;

    // 새로고침 시 즉시 액세스 토큰 설정
    if (isPageRefresh) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        console.log("[App] 페이지 새로고침 감지, 글로벌 Fetch 인터셉터 설정");

        // 모든 fetch 요청에 토큰 자동 적용 (axios 외 요청용)
        const originalFetch = window.fetch;
        window.fetch = function (url, options = {}) {
          console.log("[App] Fetch 인터셉터 실행:", url);
          options = options || {};
          options.headers = options.headers || {};

          // 이미 Authorization 헤더가 없을 때만 추가
          if (
            !options.headers.Authorization &&
            !options.headers.authorization
          ) {
            options.headers.Authorization = accessToken.startsWith("Bearer ")
              ? accessToken
              : `Bearer ${accessToken}`;
            console.log("[App] Fetch 요청에 토큰 추가됨:", url);
          }

          return originalFetch(url, options);
        };

        // XHR 요청에도 토큰 자동 적용 (일부 라이브러리 호환성)
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
          const xhrInstance = this;
          const originalSend = this.send;

          this.send = function (body) {
            try {
              if (!this.getRequestHeader) {
                // getRequestHeader 메서드가 없는 경우 안전하게 처리
                console.log(
                  "[App] XHR에 getRequestHeader 메서드가 없음, 토큰 추가 생략"
                );
              } else if (!this.getRequestHeader("Authorization")) {
                this.setRequestHeader(
                  "Authorization",
                  accessToken.startsWith("Bearer ")
                    ? accessToken
                    : `Bearer ${accessToken}`
                );
                console.log("[App] XHR 요청에 토큰 추가됨");
              }
            } catch (e) {
              console.warn("[App] XHR 토큰 추가 중 오류:", e);
            }
            return originalSend.apply(this, arguments);
          };

          return originalXhrOpen.apply(this, arguments);
        };

        // 쿠키 존재 여부를 주기적으로 확인
        console.log("[App] 리프레시 토큰 쿠키 상태 모니터링 시작");
        const cookieCheckInterval = setInterval(() => {
          try {
            // 모든 쿠키를 로깅 (HttpOnly 쿠키는 보이지 않음)
            const allCookies = document.cookie;
            console.log("[App] 쿠키 상태 체크:", allCookies || "(쿠키 없음)");

            // 새로운 요청을 보내 서버 측 세션 상태 확인
            const statusCheckUrl = `${
              import.meta.env.VITE_API_URL || "http://localhost:8080"
            }/auth/validate`;
            fetch(statusCheckUrl, {
              method: "GET",
              credentials: "include", // 쿠키 포함
              headers: {
                Authorization: accessToken.startsWith("Bearer ")
                  ? accessToken
                  : `Bearer ${accessToken}`,
                "X-Session-Check": "true",
              },
            })
              .then((response) => {
                console.log("[App] 세션 상태 확인 응답:", response.status);
                if (response.status === 401) {
                  console.warn("[App] 세션이 유효하지 않음, 인터벌 정지");
                  clearInterval(cookieCheckInterval);
                }
              })
              .catch((error) => {
                console.warn("[App] 세션 상태 확인 오류:", error);
              });
          } catch (e) {
            console.warn("[App] 쿠키 체크 오류:", e);
          }
        }, 30000); // 30초마다 확인

        // 컴포넌트 언마운트 시 인터벌 정리
        return () => {
          clearInterval(cookieCheckInterval);
        };
      }
    }

    // 기존 코드: API 모듈을 가져와서 토큰 유틸리티에 접근
    import("./services/api")
      .then(({ api, tokenUtils }) => {
        console.log("[App] 앱 시작 시 시간:", new Date().toISOString());
        const accessToken = localStorage.getItem("accessToken");
        console.log("[App] 앱 시작 시 액세스 토큰 존재 여부:", !!accessToken);

        // 앱 시작 시 토큰 확인
        const checkToken = async () => {
          try {
            // 액세스 토큰이 있는 경우
            if (accessToken) {
              try {
                // 액세스 토큰 유효성 확인
                const tokenPayload = JSON.parse(
                  atob(accessToken.split(".")[1])
                );
                const expirationTime = tokenPayload.exp * 1000;
                const timeToExpiration = expirationTime - Date.now();

                console.log(
                  "[App] 토큰 확인됨:",
                  accessToken.substring(0, 10) + "...",
                  "만료 시간까지:",
                  Math.round(timeToExpiration / 60000) + "분"
                );

                // 토큰이 유효한 경우 (만료되지 않음)
                if (timeToExpiration > 0) {
                  console.log(
                    "[App] 유효한 토큰이 있어 reissue 요청 생략 (만료까지: " +
                      Math.round(timeToExpiration / 60000) +
                      "분)"
                  );
                  return; // 유효한 토큰이 있으면 절대 재발급 요청 안함 (중요)
                }

                // 여기까지 실행되면 토큰이 만료된 상태
                console.log("[App] 토큰이 만료되어 새 토큰 요청 필요");
                localStorage.removeItem("accessToken"); // 만료된 토큰 제거
              } catch (error) {
                console.warn("[App] 토큰 검증 실패:", error);
                localStorage.removeItem("accessToken");
              }
            }

            // 이 지점까지 실행되면 액세스 토큰이 없거나 만료된 상태
            // 액세스 토큰이 없는 경우, 서버와 통신하여 리프레시 토큰 유효성 확인
            console.log(
              "[App] 액세스 토큰이 없거나 만료됨, 리프레시 토큰으로 새 토큰 요청 시도"
            );

            try {
              // 리프레시 토큰으로 새 액세스 토큰 요청
              const response = await api.get("/auth/reissue", {
                withCredentials: true,
              });
              const newToken =
                response.headers["authorization"] ||
                response.headers["Authorization"];
              if (newToken) {
                console.log("[App] 새 토큰 요청 성공, 토큰 저장");
                tokenUtils.setToken(newToken);
              } else {
                console.log("[App] 토큰 요청 응답에 새 토큰이 없음");
              }
            } catch (error) {
              console.error("[App] 토큰 갱신 실패:", error.message);
              // 에러 메시지에 따라 다르게 대응할 수 있음
              if (
                error.response?.data &&
                typeof error.response.data === "string"
              ) {
                console.log("[App] 서버 응답 메시지:", error.response.data);
              }
            }
          } catch (error) {
            console.error("[App] 토큰 확인 중 오류:", error);
          }
        };

        // 토큰 확인 실행
        checkToken();
      })
      .catch((error) => {
        console.error("[App] API 모듈 로드 실패:", error);
      });
  }, []);

  // showHeader와 showNavigation 조건을 useMemo로 최적화
  const showHeader = useMemo(() => {
    const hideHeaderPaths = ["/", "/auth/callback", "/auth/add"];
    return !hideHeaderPaths.includes(location.pathname);
  }, [location.pathname]);

  const showNavigation = useMemo(() => {
    // 로그인, 콜백 페이지, 회원정보 입력, 스터디 상세 페이지에서 네비게이션 바를 숨김
    const hideNavigationPaths = ["/", "/auth/callback", "/auth/add"];

    // /studies/add 경로는 제외하고 스터디 상세 페이지 패턴 확인
    const isStudyDetailPage =
      /^\/studies\/[^/]+/.test(location.pathname) &&
      location.pathname !== "/studies/add";

    return (
      !hideNavigationPaths.includes(location.pathname) && !isStudyDetailPage
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {showHeader && <MemoizedHeader />}
      <main>
        <Routes>
          {/* 스터디 관련 라우트 */}
          <Route
            path="/studies"
            element={
              <ProtectedRoute>
                <StudyLayout>
                  <StudiesPage />
                </StudyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/studies/:studyId/*"
            element={
              <ProtectedRoute>
                <StudyLayout>
                  <Routes>
                    <Route index element={<StudyDetailPage />} />
                    <Route path="notices" element={<NoticeManagerPage />} />
                    <Route path="notices/add" element={<NoticeFormPage />} />
                    <Route
                      path="notices/:noticeId"
                      element={<NoticeDetailManagerPage />}
                    />
                    <Route
                      path="notices/:noticeId/edit"
                      element={<NoticeEditPage />}
                    />

                    <Route path="schedules" element={<StudyDetailPage />} />
                    <Route path="schedules/add" element={<ScheduleAddPage />} />
                    <Route path="assignment" element={<StudyDetailPage />} />
                    <Route
                      path="assignment/:id"
                      element={<AssignmentDetail />}
                    />
                    <Route path="board" element={<StudyDetailPage />} />
                    <Route path="attendance" element={<StudyDetailPage />} />
                    <Route path="management" element={<StudyDetailPage />} />
                    <Route path="ranking" element={<StudyDetailPage />} />
                    <Route path="attendances" element={<StudyDetailPage />} />
                    <Route
                      path="attendances/:scheduleId"
                      element={<AttendanceEditPage />}
                    />
                  </Routes>
                </StudyLayout>
              </ProtectedRoute>
            }
          />

          {/* 메인 네비게이션 라우트 */}
          <Route
            path="/studies/add"
            element={
              <ProtectedRoute>
                <StudyLayout>
                  <CreateStudyPage />
                </StudyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <StudyLayout>
                  <CalendarPage />
                </StudyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <StudyLayout>
                  <MyPage />
                </StudyLayout>
              </ProtectedRoute>
            }
          />

          {/* 회원가입 라우트 */}
          <Route path="/auth/add" element={<UserInfoForm />} />

          {/* Public routes */}
          <Route element={<DefaultLayout />}>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/oauth2/callback/google" element={<OAuthCallback />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
