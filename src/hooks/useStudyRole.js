import { useMemberRole } from '../contexts/MemberRoleContext';
import { isManagerRole, getReadableRoleName } from '../utils/studyRoleUtils';

/**
 * 스터디 역할 관련 기능을 통합해 제공하는 커스텀 훅
 * MemberRoleContext와 studyRoleUtils를 결합해 일관된 인터페이스 제공
 * 
 * @returns {Object} 역할 정보 및 유틸리티 함수
 * @property {string} memberRole - 현재 멤버 역할
 * @property {Function} updateMemberRole - 역할 직접 업데이트 함수
 * @property {Function} updateMemberRoleFromResponse - API 응답에서 역할 업데이트 함수
 * @property {boolean} isManager - 관리자 권한 여부
 * @property {string} roleName - 읽기 쉬운 역할 이름
 * @property {boolean} isLoading - 역할 정보 로딩 중 여부
 */
export const useStudyRole = () => {
  const { 
    memberRole, 
    updateMemberRole, 
    updateMemberRoleFromResponse,
    isLoading 
  } = useMemberRole();
  
  return {
    // MemberRoleContext에서 제공하는 기능
    memberRole,
    updateMemberRole,
    updateMemberRoleFromResponse,
    isLoading,
    
    // studyRoleUtils 기능 통합
    isManager: isManagerRole(memberRole),
    roleName: getReadableRoleName(memberRole),
  };
};

export default useStudyRole; 