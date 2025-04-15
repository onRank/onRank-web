import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

// 권한 관련 로컬 스토리지 키 형식: memberRole_studyId
const getMemberRoleKey = (studyId) => `memberRole_${studyId}`;

// API 응답으로부터 memberRole 정보를 추출하는 유틸리티 함수
export const extractMemberRole = (response) => {
  if (!response) return null;
  
  // Case 1: response.memberContext.memberRole 형태 (공통 패턴)
  if (response.memberContext && response.memberContext.memberRole) {
    return response.memberContext.memberRole;
  }
  
  // Case 2: response.memberRole 형태 (단순 객체)
  if (response.memberRole) {
    return response.memberRole;
  }
  
  // Case 3: 중첩 data 객체
  if (response.data && response.data.memberRole) {
    return response.data.memberRole;
  }
  
  return null;
};

// MemberRole Context 생성
const MemberRoleContext = createContext();

// Context Provider 컴포넌트
export const MemberRoleProvider = ({ children }) => {
  const { studyId } = useParams();
  const [memberRole, setMemberRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 스토리지에서 memberRole 불러오기
  useEffect(() => {
    if (studyId) {
      const storedRole = localStorage.getItem(getMemberRoleKey(studyId));
      if (storedRole) {
        console.log(`[MemberRoleContext] 로컬 스토리지에서 불러온 역할: ${storedRole}`);
        setMemberRole(storedRole);
      }
      setIsLoading(false);
    }
  }, [studyId]);

  // memberRole 업데이트 함수
  const updateMemberRole = useCallback((newRole, newStudyId = studyId) => {
    if (!newStudyId) return;
    
    console.log(`[MemberRoleContext] 역할 업데이트: ${newRole} (스터디 ID: ${newStudyId})`);
    
    // 상태 업데이트
    setMemberRole(newRole);
    
    // 로컬 스토리지에 저장
    if (newRole) {
      localStorage.setItem(getMemberRoleKey(newStudyId), newRole);
    } else {
      localStorage.removeItem(getMemberRoleKey(newStudyId));
    }
  }, [studyId]);

  // API 응답으로부터 memberRole 추출 후 업데이트
  const updateMemberRoleFromResponse = useCallback((response, newStudyId = studyId) => {
    const role = extractMemberRole(response);
    if (role) {
      updateMemberRole(role, newStudyId);
      return true;
    }
    return false;
  }, [studyId, updateMemberRole]);

  // 관리자 여부 확인 함수
  const isManager = useCallback(() => {
    return ['HOST', 'ADMIN', 'OWNER', 'CREATOR'].includes(memberRole);
  }, [memberRole]);

  // Context Provider에 전달할 값
  const contextValue = {
    memberRole,
    updateMemberRole,
    updateMemberRoleFromResponse,
    isManager,
    isLoading
  };

  return (
    <MemberRoleContext.Provider value={contextValue}>
      {children}
    </MemberRoleContext.Provider>
  );
};

// 커스텀 훅: 다른 컴포넌트에서 memberRole 정보 사용
export const useMemberRole = () => {
  const context = useContext(MemberRoleContext);
  if (!context) {
    throw new Error('useMemberRole은 MemberRoleProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};

MemberRoleProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default MemberRoleContext; 