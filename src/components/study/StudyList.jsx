import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import StudyCard from './StudyCard'

function StudyList({ studies }) {
  const navigate = useNavigate()

  if (!studies.length) {
    return <p>등록된 스터디가 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          onClick={() => navigate(`/studies/${study.id}`)}
        />
      ))}
    </div>
  )
}

StudyList.propTypes = {
  studies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      memberCount: PropTypes.number,
    })
  ).isRequired
}

export default StudyList 