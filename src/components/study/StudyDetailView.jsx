import { useState } from 'react';
import { studyService } from '../../services/api';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '1rem',
    fontSize: '14px',
    color: '#666666'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  contentBox: {
    padding: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    textAlign: 'center',
    minHeight: '50px'
  },
  divider: {
    width: '1px',
    height: '80px',
    backgroundColor: '#FF0000',
    margin: '0 auto'
  },
  imageContainer: {
    width: '100%',
    maxHeight: '300px',
    overflow: 'hidden',
    borderRadius: '4px',
    border: '1px solid #E5E5E5'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImage: {
    padding: '1rem',
    textAlign: 'center',
    color: '#666666'
  },
  formLink: {
    display: 'block',
    padding: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#FF0000',
    textDecoration: 'none'
  },
  noFormLink: {
    padding: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#666666'
  },
  applyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    cursor: 'not-allowed'
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

function StudyDetailView({ study, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleApply = async () => {
    if (!study || !study.id) {
      setError('스터디 정보가 올바르지 않습니다.');
      return;
    }

    if (study.googleFormLink) {
      window.open(study.googleFormLink, '_blank');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const applicationData = {
        studyId: study.id,
        message: '스터디에 참여하고 싶습니다.'
      };
      
      const response = await studyService.applyToStudy(study.id, applicationData);
      console.log('[StudyDetailView] 스터디 참여 신청 성공:', response);
      
      setSuccess('스터디 참여 신청이 완료되었습니다.');
      
      setTimeout(() => {
        if (onBack) onBack();
      }, 3000);
    } catch (error) {
      console.error('[StudyDetailView] 스터디 참여 신청 실패:', error);
      
      if (error.response) {
        setError(error.response.data?.message || error.response.data?.error || '스터디 참여 신청에 실패했습니다.');
      } else if (error.request) {
        setError('서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        setError(error.message || '스터디 참여 신청에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={onBack}
          style={styles.backButton}
        >
          ← 목록으로
        </button>
        <h2 style={styles.title}>스터디 상세</h2>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          ...styles.errorMessage,
          backgroundColor: '#E8F5E9',
          color: '#2E7D32'
        }}>
          {success}
        </div>
      )}

      <div>
        <h3 style={styles.sectionTitle}>
          스터디 이름
        </h3>
        <div style={styles.contentBox}>
          {study.title || study.studyName || '제목 없음'}
        </div>
      </div>

      <div style={styles.divider} />

      <div>
        <h3 style={styles.sectionTitle}>
          스터디 소개
        </h3>
        <div style={{
          ...styles.contentBox,
          minHeight: '200px',
          whiteSpace: 'pre-wrap'
        }}>
          {study.description || study.content || '소개 내용이 없습니다.'}
        </div>
      </div>

      <div style={styles.divider} />

      {study.image && (
        <>
          <div>
            <h3 style={styles.sectionTitle}>
              스터디 이미지
            </h3>
            <div style={styles.imageContainer}>
              <img 
                src={study.image} 
                alt={study.title || study.studyName || '스터디 이미지'} 
                style={styles.image}
              />
            </div>
          </div>
          <div style={styles.divider} />
        </>
      )}

      <div>
        <h3 style={styles.sectionTitle}>
          구글폼링크
        </h3>
        {study.googleFormLink ? (
          <a
            href={study.googleFormLink}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.formLink}
          >
            구글폼 바로가기
          </a>
        ) : (
          <div style={styles.noFormLink}>
            구글폼 링크가 없습니다.
          </div>
        )}
      </div>

      <button
        onClick={handleApply}
        disabled={isSubmitting}
        style={{
          ...styles.applyButton,
          ...(isSubmitting ? styles.buttonDisabled : {})
        }}
      >
        {isSubmitting ? '처리 중...' : study.googleFormLink ? '구글폼으로 신청하기' : '신청하기'}
      </button>
    </div>
  );
}

export default StudyDetailView; 