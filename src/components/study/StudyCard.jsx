import PropTypes from 'prop-types'

function StudyCard({ study, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-lg shadow hover:shadow-md cursor-pointer"
    >
      <h3 className="text-lg font-semibold">{study.name}</h3>
      <p className="text-gray-600">{study.description}</p>
      <div className="mt-2 text-sm text-gray-500">
        <span>멤버: {study.memberCount}명</span>
        <span className="ml-4">상태: {study.status}</span>
      </div>
    </div>
  )
}

StudyCard.propTypes = {
  study: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    memberCount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
}

export default StudyCard 