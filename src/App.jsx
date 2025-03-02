import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { memo, useMemo } from "react";
import LoginPage from "./pages/auth/LoginPage";
import StudiesPage from "./pages/study/StudiesPage";
import CreateJoinPage from "./pages/study/CreateJoinPage";
import OAuthCallback from "./pages/auth/OAuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { tokenUtils } from "./services/api";
import StudyDetailPage from "./pages/study/StudyDetailPage";
import NoticeAddPage from "./pages/study/notice/NoticeAddPage";
import Header from "./components/common/Header";
import MainNavigation from "./components/common/MainNavigation";
import UserInfoForm from './components/auth/UserInfoForm';
import CalendarPage from './pages/calendar/CalendarPage';
import MyPage from './pages/mypage/MyPage';
import AssignmentDetail from './pages/study/assignment/AssignmentDetail';
import "./App.css";
  
// 레이아웃 상수
const HEADER_HEIGHT = "64px";

// 헤더 컴포넌트 메모이제이션
const MemoizedHeader = memo(Header);

// 메인 네비게이션 컴포넌트 메모이제이션
const MemoizedMainNavigation = memo(MainNavigation);

// 스터디 레이아웃 컴포넌트
const StudyLayout = memo(({ children }) => {
  return (
    <div
      style={{
        minHeight: `calc(100vh - ${HEADER_HEIGHT})`,
      }}
    >
      <div
        style={{
          padding: "2rem",
          backgroundColor: "var(--main-bg, #ffffff)",
          overflow: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
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

  // 토큰이 있고 user 정보도 있는 경우에만 /studies로 리다이렉트
  if (token && user) {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenPayload.exp * 1000;
      
      if (expirationTime > Date.now()) {
        return <Navigate to="/studies" replace />;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      tokenUtils.removeToken();
    }
  }

  // 그 외의 경우(토큰이 없거나, user 정보가 없거나, 토큰이 만료된 경우)
  return children;
};

function AppContent() {
  const location = useLocation();

  // showHeader와 showNavigation 조건을 useMemo로 최적화
  const showHeader = useMemo(() => {
    const hideHeaderPaths = ['/', '/auth/callback', '/auth/add'];
    return !hideHeaderPaths.includes(location.pathname);
  }, [location.pathname]);

  const showNavigation = useMemo(() => {
    // 로그인, 콜백 페이지, 회원정보 입력, 스터디 상세 페이지에서 네비게이션 바를 숨김
    const hideNavigationPaths = ['/', '/auth/callback', '/auth/add'];
    const isStudyDetailPage = /^\/studies\/[^/]+/.test(location.pathname);
    return !hideNavigationPaths.includes(location.pathname) && !isStudyDetailPage;
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {showHeader && <MemoizedHeader />}
      {showNavigation && <MemoizedMainNavigation />}
      <main>
        <Routes>
          {/* 스터디 관련 라우트 */}
          <Route
            path="/studies"
            element={
              <StudyLayout>
                <StudiesPage />
              </StudyLayout>
            }
          />
          <Route
            path="/studies/:studyId/*"
            element={
              <StudyLayout>
                <Routes>
                  <Route index element={<StudyDetailPage />} />
                  <Route path="notices" element={<StudyDetailPage />} />
                  <Route path="schedule" element={<StudyDetailPage />} />
                  <Route path="assignment" element={<StudyDetailPage />} />
                  <Route path="assignment/:id" element={<AssignmentDetail />} />
                  <Route path="board" element={<StudyDetailPage />} />
                  <Route path="attendance" element={<StudyDetailPage />} />
                  <Route path="manage" element={<StudyDetailPage />} />
                  <Route path="ranking" element={<StudyDetailPage />} />
                  <Route path="notices/add" element={<NoticeAddPage />} />
                </Routes>
              </StudyLayout>
            }
          />

          {/* 메인 네비게이션 라우트 */}
          <Route
            path="/create"
            element={
              <StudyLayout>
                <CreateJoinPage />
              </StudyLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <StudyLayout>
                <CalendarPage />
              </StudyLayout>
            }
          />
          <Route
            path="/mypage"
            element={
              <StudyLayout>
                <MyPage />
              </StudyLayout>
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
