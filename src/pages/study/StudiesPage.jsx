import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StudyList from "../../components/study/StudyList"
import { studyService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { authService } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"
import StudiesListSidebar from "../../components/study/StudiesListSidebar"

function StudiesPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [studies, setStudies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 인증 상태 확인
    if (!authLoading && !user) {
      navigate('/')
      return
    }

    const fetchStudies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await studyService.getStudies()
        setStudies(data)
      } catch (error) {
        console.error("Error fetching studies:", error)
        setError(error.message)
        // 401 에러인 경우 로그인 페이지로 리다이렉트
        if (error.response?.status === 401) {
          navigate('/')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStudies()
    }
  }, [user, authLoading, navigate])

  const handleLogout = async () => {
    try {
      await authService.logout()
      // 로그아웃 후 자동으로 홈으로 리다이렉트 (api.js에서 처리)
    } catch (error) {
      console.error('Logout failed:', error)
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!user) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 64px)', // Subtract header height
    }}>
      <StudiesListSidebar />
      <main style={{
        flex: 1,
        padding: '2rem',
        backgroundColor: 'var(--main-bg, #ffffff)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              스터디 목록
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  color: 'var(--text-primary)'
                }}>
                  안녕하세요, {user.nickname}님!
                </h2>
                <p style={{
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem'
                }}>
                  학과: {user.department}
                </p>
              </div>
              <button
                style={{
                  backgroundColor: '#2563EB',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}
                onClick={() => {/* TODO: 스터디 생성 페이지로 이동 */}}
              >
                스터디 만들기
              </button>
            </div>
          </div>
          <StudyList studies={studies} />
        </div>
      </main>
    </div>
  )
}

export default StudiesPage 