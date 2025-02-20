import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import StudyCard from './StudyCard'

function StudyList({ studies }) {
  const navigate = useNavigate()

  if (!studies.length) {
    return <p>등록된 스터디가 없습니다.</p>
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '2rem',
      padding: '1rem'
    }}>
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
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      currentMembers: PropTypes.number.isRequired,
      maxMembers: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired
}

export default StudyList 