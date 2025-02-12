import PropTypes from 'prop-types'
import StudyCard from './StudyCard'

function StudyList({ studies }) {
  if (!studies.length) {
    return <p>등록된 스터디가 없습니다.</p>
  }

  return (
    <div className="studies-list">
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}

StudyList.propTypes = {
  studies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      members: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired
}

export default StudyList 