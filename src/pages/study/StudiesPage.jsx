import { useEffect, useState } from "react"
import StudyList from "../../components/study/StudyList"
import { studyService } from "../../services/api"

function StudiesPage() {
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

  if (loading) {
    return <div>Loading studies...</div>
  }

  return (
    <div className="studies-container">
      <h2>스터디 목록</h2>
      {error && <div className="error-message">{error}</div>}
      <StudyList studies={studies} />
    </div>
  )
}

export default StudiesPage 