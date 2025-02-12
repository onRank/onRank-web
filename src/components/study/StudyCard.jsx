import PropTypes from 'prop-types'

function StudyCard({ study }) {
  return (
    <div className="study-item">
      <h3>{study.title}</h3>
      <p>참여 인원: {study.members}명</p>
      <p>상태: {study.status}</p>
    </div>
  )
}

StudyCard.propTypes = {
  study: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    members: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired
}

export default StudyCard 