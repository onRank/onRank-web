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
    gap: '1rem',
    marginTop: '2rem'
  },
  studyCard: {
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backgroundColor: '#FFFFFF'
  },
  studyCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  studyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  studyDescription: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  studyInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  studyStatus: {
    color: '#FF0000'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666666'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#D32F2F'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666666'
  }
};

function StudyJoinList({ studies: initialStudies = [] }) {
  const [studies, setStudies] = useState(initialStudies);
  const [filteredStudies, setFilteredStudies] = useState(initialStudies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredStudyId, setHoveredStudyId] = useState(null);

  // 초기 데이터가 없는 경우 API에서 스터디 목록 가져오기
  useEffect(() => {
    if (initialStudies.length === 0) {
      fetchStudies();
    }
  }, [initialStudies.length]);

  // 검색어에 따라 스터디 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudies(studies);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = studies.filter(study => 
      study.title?.toLowerCase().includes(lowerSearchTerm) || 
      study.description?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredStudies(filtered);
  }, [searchTerm, studies]);

  // 스터디 목록 가져오기
  const fetchStudies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await studyService.getStudies();
      setStudies(response.data || []);
      setFilteredStudies(response.data || []);
    } catch (error) {
      console.error('스터디 목록 조회 실패:', error);
      setError('스터디 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 스터디 카드 클릭 핸들러
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

  // 로딩 중 표시
  if (loading) {
    return <div style={styles.loadingMessage}>스터디 목록을 불러오는 중...</div>;
  }

  // 에러 표시
  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  // 선택된 스터디가 있으면 상세 정보 표시
  if (selectedStudy) {
    return <StudyDetailView study={selectedStudy} onBack={handleBackToList} />;
  }

  return (
    <div style={styles.container}>
      {/* 검색 입력 */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="원하시는 스터디를 검색해주세요."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
      </div>

      {/* 스터디 목록 */}
      {filteredStudies.length > 0 ? (
        <div style={styles.studyGrid}>
          {filteredStudies.map((study) => (
            <div
              key={study.id}
              onClick={() => handleStudyClick(study)}
              onMouseEnter={() => setHoveredStudyId(study.id)}
              onMouseLeave={() => setHoveredStudyId(null)}
              style={{
                ...styles.studyCard,
                ...(hoveredStudyId === study.id ? styles.studyCardHover : {})
              }}
            >
              <h3 style={styles.studyTitle}>
                {study.title || study.studyName}
              </h3>
              <p style={styles.studyDescription}>
                {study.description || study.content}
              </p>
              <div style={styles.studyInfo}>
                <span>멤버: {study.currentMembers || 0}/{study.maxMembers || 10}명</span>
                <span style={styles.studyStatus}>{study.status || '모집중'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyMessage}>
          {searchTerm ? '검색 결과가 없습니다.' : '참여 가능한 스터디가 없습니다.'}
        </div>
      )}
    </div>
  );
}

export default StudyJoinList; 