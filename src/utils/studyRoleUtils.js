/**
 * 스터디 역할 관련 유틸리티 함수
 * 백엔드 API 응답에서 memberContext 정보를 추출하여 권한을 확인합니다.
 */

/**
 * 호스트 역할(CREATOR, ADMIN) 여부 확인
 * @param {Object} apiResponse - API 응답 객체 (memberContext 포함)
 * @returns {boolean} 호스트 역할 여부
 */
export const isStudyHost = (apiResponse) => {
  // memberContext에서 역할 추출
  const memberRole = apiResponse?.memberContext?.memberRole;
  
  // 역할이 CREATOR 또는 ADMIN인 경우 호스트로 간주
  return memberRole === 'CREATOR' || memberRole === 'ADMIN';
};

/**
 * 특정 역할 여부 확인
 * @param {Object} apiResponse - API 응답 객체 (memberContext 포함)
 * @param {string} role - 확인할 역할 (CREATOR, ADMIN, PARTICIPANT 등)
 * @returns {boolean} 해당 역할 여부
 */
export const hasStudyRole = (apiResponse, role) => {
  const memberRole = apiResponse?.memberContext?.memberRole;
  return memberRole === role;
};

/**
 * 멤버 역할 추출
 * @param {Object} apiResponse - API 응답 객체 (memberContext 포함)
 * @returns {string|null} 역할 문자열 또는 없을 경우 null
 */
export const getStudyRole = (apiResponse) => {
  return apiResponse?.memberContext?.memberRole || null;
};

/**
 * 스터디 이름 추출
 * @param {Object} apiResponse - API 응답 객체 (memberContext 포함)
 * @returns {string} 스터디 이름 또는 기본값
 */
export const getStudyName = (apiResponse) => {
  return apiResponse?.memberContext?.studyName || '스터디';
};

/**
 * 권한 수준 비교 (높은 권한일수록 높은 수치 반환)
 * @param {string} role - 역할 문자열
 * @returns {number} 권한 수준 (CREATOR: 3, ADMIN: 2, PARTICIPANT: 1, 기타: 0)
 */
export const getRoleLevel = (role) => {
  switch (role) {
    case 'CREATOR': return 3;
    case 'ADMIN': return 2;
    case 'PARTICIPANT': return 1;
    default: return 0;
  }
};

/**
 * 특정 작업 수행에 필요한 최소 권한을 가지고 있는지 확인
 * @param {Object} apiResponse - API 응답 객체 (memberContext 포함)
 * @param {string} requiredRole - 필요한 최소 권한 (CREATOR, ADMIN, PARTICIPANT)
 * @returns {boolean} 권한 보유 여부
 */
export const hasPermission = (apiResponse, requiredRole) => {
  const currentRole = getStudyRole(apiResponse);
  return getRoleLevel(currentRole) >= getRoleLevel(requiredRole);
};

/**
 * 관리자(매니저) 권한 여부 확인 - 직접 역할 문자열 사용
 * @param {string} role - 역할 문자열
 * @returns {boolean} 관리자 권한 여부
 */
export const isManagerRole = (role) => {
  return ['CREATOR', 'HOST', 'ADMIN'].includes(role);
};

/**
 * 역할 코드를 읽기 쉬운 이름으로 변환
 * @param {string} role - 역할 문자열
 * @returns {string} 읽기 쉬운 역할 이름
 */
export const getReadableRoleName = (role) => {
  const roleMap = {
    'CREATOR': '생성자',
    'HOST': '호스트',
    'ADMIN': '관리자',
    'PARTICIPANT': '참여자'
  };
  return roleMap[role] || '일반 회원';
};