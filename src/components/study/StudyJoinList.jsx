import { useState, useEffect } from 'react';
import { studyService } from '../../services/api';
import StudyDetailView from './StudyDetailView';

// 스타일 객체
const styles = {
  container: {
    width: '100%'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    fontSize: '14px'
  },
  studyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  studyCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden'
  },
  studyCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
  },
  studyImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '12px'
  },
  studyName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  studyDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '20px',
    color: 'red'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  },
  debugInfo: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
    whiteSpace: 'pre-wrap'
  }
};

/**
 * 스터디 참여 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.studies - 초기 스터디 목록 (선택적)
 */
function StudyJoinList({ studies: initialStudies = [] }) {
  // 상태 관리
  const [studies, setStudies] = useState(initialStudies);
  const [filteredStudies, setFilteredStudies] = useState(initialStudies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(initialStudies.length === 0);
  const [error, setError] = useState(null);
  const [hoveredStudyId, setHoveredStudyId] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // 초기 스터디 목록이 없을 경우 API에서 가져오기
  useEffect(() => {
    if (initialStudies.length === 0) {
      fetchStudies();
    }
  }, [initialStudies]);

  // 검색어에 따른 스터디 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudies(studies);
    } else {
      const filtered = studies.filter(study => 
        study.studyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.studyContent.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudies(filtered);
    }
  }, [searchTerm, studies]);

  // 스터디 목록 가져오기
  const fetchStudies = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('[StudyJoinList] 스터디 목록 조회 요청');
      const response = await studyService.getStudies();
      console.log('[StudyJoinList] API 응답:', response);
      
      if (response && response.data) {
        // 디버깅 정보 설정
        setDebugInfo(JSON.stringify({
          responseStatus: response.status,
          responseData: response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        }, null, 2));
        
        // 백엔드 응답 데이터를 그대로 사용
        setStudies(response.data);
        setFilteredStudies(response.data);
        
        console.log('[StudyJoinList] 스터디 목록 설정 완료:', response.data);
      } else {
        console.log('[StudyJoinList] 응답 데이터가 없거나 형식이 잘못됨');
        setStudies([]);
        setFilteredStudies([]);
      }
    } catch (err) {
      console.error('[StudyJoinList] 스터디 목록 조회 실패:', err);
      setError('스터디 목록을 불러오는데 실패했습니다.');
      setDebugInfo(JSON.stringify({
        errorMessage: err.message,
        errorStack: err.stack
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // 스터디 클릭 핸들러
  const handleStudyClick = (study) => {
    setSelectedStudy(study);
  };

  // 목록으로 돌아가기 핸들러
  const handleBackToList = () => {
    setSelectedStudy(null);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchStudies();
  };

  // 선택된 스터디가 있으면 상세 보기 표시
  if (selectedStudy) {
    return <StudyDetailView study={selectedStudy} onBack={handleBackToList} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="스터디 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        <button 
          onClick={handleRefresh}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          새로고침
        </button>
      </div>

      {loading && (
        <div style={styles.loadingMessage}>스터디 목록을 불러오는 중...</div>
      )}

      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      {!loading && !error && filteredStudies.length === 0 && (
        <div style={styles.emptyMessage}>
          참여 중인 스터디가 없습니다.<br />
          <small style={{ fontSize: '14px', marginTop: '10px', display: 'block' }}>
            스터디에 참여하려면 스터디 목록에서 스터디를 선택하고 참여 신청을 해주세요.
          </small>
        </div>
      )}

      {!loading && !error && filteredStudies.length > 0 && (
        <div style={styles.studyGrid}>
          {filteredStudies.map(study => (
            <div
              key={study.studyId}
              style={{
                ...styles.studyCard,
                ...(hoveredStudyId === study.studyId ? styles.studyCardHover : {})
              }}
              onClick={() => handleStudyClick(study)}
              onMouseEnter={() => setHoveredStudyId(study.studyId)}
              onMouseLeave={() => setHoveredStudyId(null)}
            >
              {study.studyImage && (
                <img
                  src={study.studyImage}
                  alt={study.studyName}
                  style={styles.studyImage}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                  }}
                />
              )}
              {!study.studyImage && (
                <div style={{
                  ...styles.studyImage,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0'
                }}>
                  이미지 없음
                </div>
              )}
              <h3 style={styles.studyName}>{study.studyName}</h3>
              <p style={styles.studyDescription}>{study.studyContent}</p>
            </div>
          ))}
        </div>
      )}

      {debugInfo && (
        <div style={styles.debugInfo}>
          <h4>디버그 정보:</h4>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default StudyJoinList; 