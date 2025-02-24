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
import OAuthCallback from "./pages/auth/OAuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import StudyDetailPage from "./pages/study/StudyDetailPage";
import NoticeAddPage from "./pages/study/notice/NoticeAddPage";
import Header from "./components/common/Header";
import SideBar from "./components/study/layout/SideBar";
import UserInfoForm from './components/auth/UserInfoForm';
import "./App.css";

// 레이아웃 상수
const HEADER_HEIGHT = "64px";

// 헤더 컴포넌트 메모이제이션
const MemoizedHeader = memo(Header);

// 사이드바 컴포넌트 메모이제이션
const MemoizedSideBar = memo(() => <SideBar />);

MemoizedSideBar.displayName = "MemoizedSideBar";

// 스터디 레이아웃 컴포넌트
const StudyLayout = memo(({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: `calc(100vh - ${HEADER_HEIGHT})`,
      }}
    >
      <MemoizedSideBar />
      <div
        style={{
          flex: 1,
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

function AppContent() {
  const location = useLocation();

  // showHeader 조건을 useMemo로 최적화
  const showHeader = useMemo(() => {
    return location.pathname.includes("/studies");
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {showHeader && <MemoizedHeader />}
      <main>
        <Routes>
          {/* 스터디 관련 라우트 */}
          <Route
            path="/studies/:studyId/*"
            element={
              <StudyLayout>
                <Routes>
                  <Route index element={<StudyDetailPage />} />
                  <Route path="notices" element={<StudyDetailPage />} />
                  <Route path="schedule" element={<StudyDetailPage />} />
                  <Route path="assignment" element={<StudyDetailPage />} />
                  <Route path="board" element={<StudyDetailPage />} />
                  <Route path="attendance" element={<StudyDetailPage />} />
                  <Route path="manage" element={<StudyDetailPage />} />
                  <Route path="ranking" element={<StudyDetailPage />} />
                  <Route path="notices/add" element={<NoticeAddPage />} />
                </Routes>
              </StudyLayout>
            }
          />

          {/* 회원가입 라우트 */}
          <Route path="/auth/add" element={<UserInfoForm />} />

          {/* 기타 라우트 */}
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/studies" element={<StudiesPage />} />
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
