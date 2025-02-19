import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import OAuthAddPage from "./pages/auth/OAuthAddPage";
import StudiesPage from "./pages/study/StudiesPage";
import OAuthCallback from "./pages/auth/OAuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import StudyDetailPage from './pages/study/StudyDetailPage';
import "./App.css";

function App() {
  console.log('[App] 렌더링 시작')
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>ONRANK</h1>
          </header>
          <main>
            <Routes>
              {console.log('[App] Routes 렌더링')}
              <Route path="/" element={
                <>
                  {console.log('[App] 메인 페이지 라우트 매칭')}
                  <LoginPage />
                </>
              } />
              <Route path="/auth/callback" element={
                <>
                  {console.log('[App] 콜백 라우트 매칭')}
                  <OAuthCallback />
                </>
              } />
              <Route path="/auth/add" element={<OAuthAddPage />} />
              <Route
                path="/studies"
                element={
                  <ProtectedRoute>
                    <StudiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studies/:studyId"
                element={
                  <ProtectedRoute>
                    <StudyDetailPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
