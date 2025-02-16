import { useEffect, useState } from "react"
import StudyList from "../../components/study/StudyList"
import { studyService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { authService } from "../../services/api"

function StudiesPage() {
  const { user } = useAuth()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await studyService.getStudies()
        setStudies(data)
      } catch (error) {
        console.error("Error fetching studies:", error)
        setError("스터디 목록을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
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

  if (loading) {
    return <div>Loading studies...</div>
  }

  return (
    <div className="studies-container">
      <h2>안녕하세요, {user.nickname}님!</h2>
      <div className="user-info">
        <p>학과: {user.department}</p>
      </div>
      <button onClick={handleLogout}>로그아웃</button>
      {error && <div className="error-message">{error}</div>}
      <StudyList studies={studies} />
    </div>
  )
}

export default StudiesPage 