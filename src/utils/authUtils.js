import { tokenUtils } from '../services/api';

/**
 * 토큰 유효성을 검사하는 함수
 * @returns {Object} 검증 결과 객체 { isValid, error, payload }
 */
export const validateToken = () => {
  try {
    // 토큰 확인
    const token = tokenUtils.getToken();
    
    if (!token) {
      return {
        isValid: false,
        error: '인증 토큰이 없습니다. 로그인이 필요합니다.',
        payload: null
      };
    }
    
    // 토큰 유효성 검사
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenPayload.exp * 1000;
      
      if (expirationTime <= Date.now()) {
        return {
          isValid: false,
          error: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.',
          payload: null
        };
      }
      
      return {
        isValid: true,
        error: null,
        payload: tokenPayload
      };
    } catch (tokenError) {
      console.error('[AuthUtils] 토큰 검증 오류:', tokenError);
      return {
        isValid: false,
        error: '인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
        payload: null
      };
    }
  } catch (error) {
    console.error('[AuthUtils] 인증 확인 중 오류:', error);
    return {
      isValid: false,
      error: '인증에 문제가 발생했습니다. 다시 로그인해주세요.',
      payload: null
    };
  }
};

/**
 * 인증 상태를 확인하고 필요한 경우 리다이렉션하는 함수
 * @param {Function} navigate - 리다이렉션을 위한 함수
 * @param {Function} setError - 에러 메시지 설정 함수
 * @returns {Object} 검증 결과 객체 { isValid, error, payload }
 */
export const checkAuthAndRedirect = (navigate, setError) => {
  const result = validateToken();
  
  if (!result.isValid) {
    console.log('[AuthUtils] 인증 실패:', result.error);
    
    if (setError) {
      setError(result.error);
    }
    
    if (navigate) {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }
  
  return result;
};

export default {
  validateToken,
  checkAuthAndRedirect
}; 