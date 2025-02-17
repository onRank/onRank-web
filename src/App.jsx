import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import OAuthAddPage from './pages/auth/OAuthAddPage'
import StudiesPage from './pages/study/StudiesPage'
import OAuthCallback from './pages/auth/OAuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>ONRANK</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/add" element={<OAuthAddPage />} />
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
  )
}

export default App
