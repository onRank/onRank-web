import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import StudyCard from './StudyCard'

function StudyList({ studies }) {
  const navigate = useNavigate()

  // 디버깅 정보 추가
  console.log('[StudyList] 받은 데이터 타입:', typeof studies);
  console.log('[StudyList] 배열 여부:', Array.isArray(studies));
  console.log('[StudyList] 데이터 길이:', studies?.length);
  
  if (!studies || !studies.length) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '1rem 0'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>등록된 스터디가 없습니다</h3>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          참여할 수 있는 스터디가 없거나 아직 스터디에 참여하지 않았습니다.
        </p>
        <button
          onClick={() => navigate('/studies/create')}
          style={{
            backgroundColor: '#4263eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: '#3b5bdb'
            }
          }}
        >
          스터디 생성하기
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '2rem',
      padding: '1rem'
    }}>
      {studies.map((study) => {
        // 백엔드 필드명을 프론트엔드 필드명으로 매핑
        const mappedStudy = {
          id: study.studyId,
          title: study.studyName,
          description: study.studyContent,
          currentMembers: study.members?.length || 0,
          maxMembers: 10, // 백엔드에서 제공하지 않는 경우 기본값 설정
          status: '모집중', // 백엔드에서 제공하지 않는 경우 기본값 설정
          imageUrl: study.studyImage
        };
        
        return (
          <StudyCard
            key={mappedStudy.id}
            study={mappedStudy}
            onClick={() => navigate(`/studies/${mappedStudy.id}`)}
          />
        );
      })}
    </div>
  )
}

StudyList.propTypes = {
  studies: PropTypes.arrayOf(
    PropTypes.shape({
      studyId: PropTypes.number,
      studyName: PropTypes.string,
      studyContent: PropTypes.string,
      studyImage: PropTypes.string,
      members: PropTypes.array
    })
  ).isRequired
}

export default StudyList 