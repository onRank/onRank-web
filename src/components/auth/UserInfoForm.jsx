import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService, tokenUtils } from '../../services/api';

function UserInfoForm() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    studentSchool: '',
    studentDepartment: '',
    studentPhoneNumber: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 페이지 새로고침이나 창 닫기 시 토큰 제거 (단, 제출 중이 아닐 때만)
    const handleBeforeUnload = (e) => {
      if (!isSubmitting) {
        tokenUtils.removeToken();
      }
    };

    // 페이지 이동 시 토큰 제거 (단, 제출 중이 아닐 때만)
    const handleNavigate = () => {
      if (!isSubmitting) {
        tokenUtils.removeToken();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigate);

    // cleanup 함수
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigate);
      // 컴포넌트 언마운트 시 토큰 제거 (단, 제출 중이 아닐 때만)
      if (!isSubmitting) {
        tokenUtils.removeToken();
      }
    };
  }, [isSubmitting]);

  useEffect(() => {
    // 토큰에서 사용자 정보 추출
    const token = tokenUtils.getToken();
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setFormData(prev => ({
        ...prev,
        email: tokenPayload.email || ''
      }));
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      tokenUtils.removeToken();
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // 입력값 검증
    const trimmedName = formData.studentName.trim();
    const trimmedPhone = formData.studentPhoneNumber.trim();

    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!trimmedPhone) {
      setError('전화번호를 입력해주세요.');
      return;
    }
    if (!/^[0-9]{11}$/.test(trimmedPhone)) {
      setError('전화번호는 11자리 숫자여야 합니다.');
      return;
    }

    try {
      const token = tokenUtils.getToken();
      if (!token) {
        setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
        navigate('/');
        return;
      }

      const submitData = {
        ...formData,
        studentName: trimmedName,
        studentPhoneNumber: trimmedPhone,
        studentSchool: formData.studentSchool.trim(),
        studentDepartment: formData.studentDepartment.trim()
      };

      console.log('회원정보 등록 시도:', submitData);
      const response = await authService.addUserInfo(submitData);

      // 201 상태코드면 성공으로 처리
      if (response.status === 201) {
        console.log('회원정보 등록 성공');
        navigate('/studies');
        return;
      }

      if (!response.data) {
        throw new Error('서버 응답이 올바르지 않습니다');
      }

      console.log('회원정보 등록 성공:', response);
      setUser(response.data);
      navigate('/studies');
    } catch (error) {
      console.error('회원정보 등록 실패:', error);
      setIsSubmitting(false);
      
      if (error.message === '서버와 통신할 수 없습니다' || error.message === 'Network Error') {
        setError('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      if (error.message === '인증이 만료되었습니다') {
        setError(error.message);
        navigate('/');
        return;
      }

      setError(error.message || '회원정보 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="oauth-add-container">
      <h2>회원정보입력</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="disabled-input"
          />
        </div>

        <div className="form-group">
          <label>
            이름 <span className="required">(필수)</span>
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({
              ...formData,
              studentName: e.target.value
            })}
            placeholder="이름을 입력해주세요"
            required
          />
        </div>

        <div className="form-group">
          <label>
            전화번호 <span className="required">(필수)</span>
          </label>
          <input
            type="tel"
            value={formData.studentPhoneNumber}
            onChange={(e) => {
              // 숫자만 입력 가능하도록
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                studentPhoneNumber: value
              });
            }}
            placeholder="01012345678 형식으로 입력해주세요"
            required
            pattern="[0-9]{11}"
            maxLength={11}
          />
        </div>

        <div className="form-section">
          <h3>소속(선택)</h3>
          
          <div className="form-group">
            <label>학교</label>
            <input
              type="text"
              value={formData.studentSchool}
              onChange={(e) => setFormData({
                ...formData,
                studentSchool: e.target.value
              })}
              placeholder="학교를 입력해주세요"
            />
          </div>

          <div className="form-group">
            <label>학과</label>
            <input
              type="text"
              value={formData.studentDepartment}
              onChange={(e) => setFormData({
                ...formData,
                studentDepartment: e.target.value
              })}
              placeholder="학과를 입력해주세요"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={!formData.studentName.trim() || !/^[0-9]{11}$/.test(formData.studentPhoneNumber)}
        >
          완료
        </button>
      </form>
    </div>
  );
}

export default UserInfoForm; 