import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Login from './components/auth/Login'
import Studies from './pages/Studies'  // 이 컴포넌트는 아직 만들어야 합니다
import UserRegistration from './pages/UserRegistration'  // 추가
import './App.css'

function App() {
  console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
  
  return (
    <GoogleOAuthProvider 
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) => console.log('Failed to load Google OAuth script:', error)}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>ONRANK</h1>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/studies" element={<Studies />} />
              <Route path="/register" element={<UserRegistration />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
