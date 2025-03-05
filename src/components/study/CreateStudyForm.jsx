import { useState } from 'react';
import { studyService, tokenUtils } from '../../services/api';
import { validateToken } from '../../utils/authUtils';
import ImageUploader from './ImageUploader';

const styles = {
  container: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '2rem',
    alignItems: 'center'
  },
  title: {
    fontSize: '20px', 
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  formGroup: { 
    width: '100%', 
    maxWidth: '400px' 
  },
  label: { 
    display: 'block', 
    marginBottom: '0.5rem',
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center'
  },
  textarea: {
    width: '100%',
    height: '200px',
    padding: '12px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    resize: 'none',
    fontSize: '14px',
    textAlign: 'center'
  },
  divider: {
    width: '1px',
    height: '80px',
    backgroundColor: '#FF0000'
  },
  button: {
    width: '100%',
    maxWidth: '400px',
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

function CreateStudyForm({ onSuccess, onError }) {
  const [studyName, setStudyName] = useState('');
  const [content, setContent] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 이미지 업로드 핸들러
  const handleImageChange = (newImage, newPreviewUrl) => {
    setImage(newImage);
    setPreviewUrl(newPreviewUrl);
  };

  // 스터디 생성 핸들러
  const handleCreateStudy = async () => {
    console.log('[CreateStudyForm] 스터디 생성 시작');
    
    // 유효성 검사
    if (!studyName.trim()) {
      setError('스터디 이름을 입력해주세요.');
      if (onError) onError('스터디 이름을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      setError('스터디 소개를 입력해주세요.');
      if (onError) onError('스터디 소개를 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 토큰 유효성 검사
      const tokenValidation = validateToken();
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.errorMessage || '인증에 문제가 발생했습니다. 다시 로그인해주세요.');
      }
      
      // API 요청 데이터 준비
      const studyData = {
        studyName: studyName,
        content: content,
        image: previewUrl, // 이미지가 있는 경우 base64 문자열로 전송
        googleFormLink: googleFormLink || null,
        createdAt: new Date().toISOString() // 현재 시간을 ISO 문자열로 변환
      };
      
      console.log('[CreateStudyForm] 요청 데이터:', studyData);
      
      // 스터디 생성 API 호출
      const response = await studyService.createStudy(studyData);
      console.log('[CreateStudyForm] 스터디 생성 성공:', response);
      
      // 성공 콜백 호출
      if (onSuccess) onSuccess(response);
    } catch (error) {
      console.error('[CreateStudyForm] 스터디 생성 실패:', error);
      
      let errorMessage = '스터디 생성에 실패했습니다.';
      
      if (error.response) {
        // 서버 응답이 있는 경우
        console.error('서버 응답:', error.response);
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우
        console.error('요청 정보:', error.request);
        errorMessage = '서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.';
      } else {
        // 요청 설정 중 오류 발생
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={styles.title}>
        스터디 정보를 입력해주세요.
      </h2>

      {/* 에러 메시지 표시 */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <div style={styles.container}>
        {/* 스터디 이름 */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            스터디 이름
          </label>
          <input
            type="text"
            placeholder="스터디 이름을 입력하세요."
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* 구분선 */}
        <div style={styles.divider} />

        {/* 스터디 소개 */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            스터디 소개
          </label>
          <textarea
            placeholder="스터디를 소개해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* 구분선 */}
        <div style={styles.divider} />

        {/* 이미지 업로드 */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            이미지
          </label>
          <ImageUploader 
            onImageChange={handleImageChange}
            initialImage={image}
            initialPreviewUrl={previewUrl}
          />
        </div>

        {/* 구분선 */}
        <div style={styles.divider} />

        {/* 구글 폼 링크 */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            구글폼링크(선택)
          </label>
          <input
            type="url"
            placeholder="구글 폼 링크를 입력하세요."
            value={googleFormLink}
            onChange={(e) => setGoogleFormLink(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* 생성하기 버튼 */}
        <button
          onClick={handleCreateStudy}
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {})
          }}
        >
          {isSubmitting ? '처리 중...' : '생성하기'}
        </button>
      </div>
    </div>
  );
}

export default CreateStudyForm; 