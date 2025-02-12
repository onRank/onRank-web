import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import StudiesPage from './pages/study/StudiesPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/studies" 
                element={
                  <ProtectedRoute>
                    <StudiesPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
