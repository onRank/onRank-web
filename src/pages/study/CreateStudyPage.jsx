import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkAuthAndRedirect } from '../../utils/authUtils';
import CreateStudyForm from '../../components/study/CreateStudyForm';

// 스타일 객체
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center'
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

function CreateStudyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  
  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('[CreateStudyPage] 인증 상태 확인');
    checkAuthAndRedirect(navigate, setError);
  }, [navigate]);

  // 스터디 생성 성공 시 처리
  const handleCreateSuccess = (response) => {
    console.log('[CreateStudyPage] 스터디 생성 성공:', response);
    // studyId가 있으면 해당 스터디 페이지로, 없으면 목록으로 이동
    if (response && response.studyId) {
      navigate(`/studies/${response.studyId}`);
    } else {
      navigate('/studies');
    }
  };

  // 스터디 생성 실패 시 처리
  const handleCreateError = (errorMessage) => {
    console.error('[CreateStudyPage] 스터디 생성 실패:', errorMessage);
    setError(errorMessage);
  };

  // 페이지 이동 처리
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>스터디 정보를 입력해주세요.</h1>

      {/* 에러 메시지 표시 */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* 스터디 생성 폼 */}
      <CreateStudyForm 
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default CreateStudyPage; 