import { useState } from 'react';
import PropTypes from 'prop-types';

function StudyManagement({ studyData }) {
  const [title, setTitle] = useState(studyData.title || '');
  const [description, setDescription] = useState(studyData.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 정보 수정 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!title.trim()) {
      setErrorMessage('스터디 이름은 필수 입력 항목입니다.');
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // API 호출은 나중에 구현
      console.log('스터디 정보 업데이트 예정:', { title, description });
      
      // API 호출 성공 시뮬레이션
      setTimeout(() => {
        setSuccessMessage('스터디 정보가 성공적으로 업데이트되었습니다.');
        setIsEditing(false);
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('스터디 정보 업데이트 실패:', error);
      setErrorMessage('스터디 정보 업데이트 중 오류가 발생했습니다.');
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>스터디 정보 관리</h3>
      
      {errorMessage && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          border: '1px solid #E5E5E5', 
          borderRadius: '8px', 
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 이름</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing || isSaving}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: !isEditing ? '#f9f9f9' : 'white'
              }} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 설명</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing || isSaving}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                minHeight: '100px',
                backgroundColor: !isEditing ? '#f9f9f9' : 'white'
              }} 
            />
          </div>
          
          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: '#4263eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              정보 수정
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(studyData.title || '');
                  setDescription(studyData.description || '');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                disabled={isSaving}
                style={{
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                취소
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                style={{
                  backgroundColor: '#4263eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          )}
        </div>
      </form>
      
      <div style={{
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fff5f5',
        marginTop: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#e03131'
        }}>
          위험 영역
        </h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          스터디를 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <button 
          type="button"
          style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (window.confirm('정말로 이 스터디를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
              console.log('스터디 삭제 요청:', studyData.id);
              alert('스터디 삭제 기능은 아직 구현되지 않았습니다.');
            }
          }}
        >
          스터디 삭제
        </button>
      </div>
    </div>
  );
}

StudyManagement.propTypes = {
  studyData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default StudyManagement; 