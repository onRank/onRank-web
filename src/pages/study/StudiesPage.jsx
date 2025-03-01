import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import StudyList from "../../components/study/StudyList"
import { studyService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"

function StudiesPage() {
  const navigate = useNavigate()
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
        if (error.response?.status === 401) {
          navigate('/')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [navigate])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            스터디 목록
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <p>안녕하세요, {user?.nickname}님!</p>
            <p style={{ color: '#ABB1B3' }}>학과: {user?.department}</p>
          </div>
        </div>
      </div>
      <StudyList studies={studies} />
    </div>
  )
}

export default StudiesPage 