import { useEffect, useState } from "react"
import StudyList from "../../components/study/StudyList"
import { studyService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { authService } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"

function StudiesPage() {
  const { user } = useAuth()
  const [studies, setStudies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await studyService.getStudies()
        setStudies(data)
      } catch (error) {
        console.error("Error fetching studies:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      // 로그아웃 후 자동으로 홈으로 리다이렉트 (api.js에서 처리)
    } catch (error) {
      console.error('Logout failed:', error)
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">스터디 목록</h1>
      <div className="studies-container">
        <h2>안녕하세요, {user.nickname}님!</h2>
        <div className="user-info">
          <p>학과: {user.department}</p>
        </div>
        <button onClick={handleLogout}>로그아웃</button>
        <StudyList studies={studies} />
      </div>
    </div>
  )
}

export default StudiesPage 