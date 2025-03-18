import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import StudyCard from './StudyCard'

function StudyList({ studies }) {
  const navigate = useNavigate()

  // 디버깅 정보 추가
  console.log('[StudyList] 받은 데이터 타입:', typeof studies);
  console.log('[StudyList] 배열 여부:', Array.isArray(studies));
  console.log('[StudyList] 데이터 길이:', studies?.length);
  console.log('[StudyList] 데이터 내용:', studies);
  
  // 첫 번째 스터디 객체의 구조 자세히 로깅
  if (studies && studies.length > 0) {
    console.log('[StudyList] 첫 번째 스터디 객체:', studies[0]);
    console.log('[StudyList] 첫 번째 스터디 필드들:', Object.keys(studies[0]));
    console.log('[StudyList] studyName 존재 여부:', 'studyName' in studies[0]);
    console.log('[StudyList] studyContent 존재 여부:', 'studyContent' in studies[0]);
    console.log('[StudyList] studyImageUrl 존재 여부:', 'studyImageUrl' in studies[0]);
    console.log('[StudyList] studyId 존재 여부:', 'studyId' in studies[0]);
    
    // 추가 디버깅: snake_case 필드명 확인 (DB 필드명과 일치할 수 있음)
    console.log('[StudyList] study_name 존재 여부:', 'study_name' in studies[0]);
    console.log('[StudyList] study_content 존재 여부:', 'study_content' in studies[0]);
    console.log('[StudyList] study_image_url 존재 여부:', 'study_image_url' in studies[0]);
    console.log('[StudyList] study_id 존재 여부:', 'study_id' in studies[0]);
  }
  
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
          onClick={() => navigate('/studies/add')}
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
      {studies.map((study, index) => {
        // 백엔드 필드명을 프론트엔드 필드명으로 매핑
        // studyId가 0인 경우도 유효한 ID로 처리하도록 수정
        const hasValidStudyId = study.studyId !== undefined && study.studyId !== null;
        
        // studyId가 있는지 확인하고 로그
        console.log(`[StudyList] 스터디 ${index}의 studyId:`, study.studyId);
        
        const mappedStudy = {
          // studyId가 0을 포함한 모든 숫자값을 유효한 ID로 처리 (index를 fallback으로 사용하지 않음)
          id: hasValidStudyId ? study.studyId : index,
          title: study.studyName || '제목 없음',
          description: study.studyContent || '설명 없음',
          currentMembers: study.members?.length || 0,
          maxMembers: 10, // 백엔드에서 제공하지 않는 경우 기본값 설정
          status: '모집중', // 백엔드에서 제공하지 않는 경우 기본값 설정
          imageUrl: study.studyImageUrl || '' // studyImageUrl 필드만 사용
        };
        
        // 매핑된 스터디 객체 로깅
        console.log(`[StudyList] 스터디 ${index} 매핑 결과:`, mappedStudy);
        console.log(`[StudyList] 스터디 ${index} 실제 ID:`, study.studyId);
        
        // 고유한 키 생성 (가능하면 studyId 사용, 없으면 인덱스 사용)
        const uniqueKey = hasValidStudyId ? `study-${study.studyId}` : `study-index-${index}`;
        
        return (
          <StudyCard
            key={uniqueKey}
            study={mappedStudy}
            onClick={() => navigate(`/studies/${mappedStudy.id}`, {
              state: { studyData: mappedStudy }
            })}
          />
        );
      })}
    </div>
  )
}

StudyList.propTypes = {
  studies: PropTypes.array.isRequired
}

export default StudyList 