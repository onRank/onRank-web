import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkAuthAndRedirect } from '../../utils/authUtils';
import CreateStudyForm from '../../components/study/CreateStudyForm';
import StudyJoinList from '../../components/study/StudyJoinList';

// 스타일 객체
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '2rem'
  },
  tabButton: {
    padding: '8px 24px',
    borderRadius: '4px',
    border: '1px solid #E5E5E5',
    cursor: 'pointer',
    fontSize: '14px'
  },
  activeTab: {
    backgroundColor: '#FF0000',
    color: '#FFFFFF'
  },
  inactiveTab: {
    backgroundColor: '#FFFFFF',
    color: '#000000'
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '14px'
  }
};

function CreateJoinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [error, setError] = useState(null);
  
  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('[CreateJoinPage] 인증 상태 확인');
    checkAuthAndRedirect(navigate, setError);
  }, [navigate]);

  // 스터디 생성 성공 시 처리
  const handleCreateSuccess = (response) => {
    console.log('[CreateJoinPage] 스터디 생성 성공:', response);
    navigate('/studies');
  };

  // 스터디 생성 실패 시 처리
  const handleCreateError = (errorMessage) => {
    console.error('[CreateJoinPage] 스터디 생성 실패:', errorMessage);
    setError(errorMessage);
  };

  return (
    <div style={styles.container}>
      {/* 탭 버튼 */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'create' ? styles.activeTab : styles.inactiveTab)
          }}
        >
          생성
        </button>
        <button
          onClick={() => setActiveTab('join')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'join' ? styles.activeTab : styles.inactiveTab)
          }}
        >
          참여
        </button>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* 스터디 생성 폼 */}
      {activeTab === 'create' && (
        <CreateStudyForm 
          onSuccess={handleCreateSuccess}
          onError={handleCreateError}
        />
      )}

      {/* 스터디 참여 폼 */}
      {activeTab === 'join' && (
        <StudyJoinList />
      )}
    </div>
  );
}

export default CreateJoinPage; 