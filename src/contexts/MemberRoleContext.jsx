import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import studyContextService from '../services/studyContext';

// 권한 관련 로컬 스토리지 키 형식: memberRole_studyId
const getMemberRoleKey = (studyId) => `memberRole_${studyId}`;

// API 응답으로부터 memberRole 정보를 추출하는 유틸리티 함수
export const extractMemberRole = (response) => {
  if (!response) return null;
  
  console.log('[MemberRoleContext] extractMemberRole 호출됨, 응답:', response);
  
  // Case 1: response.memberContext.memberRole 형태 (공통 패턴)
  if (response.memberContext && response.memberContext.memberRole) {
    console.log('[MemberRoleContext] memberContext.memberRole 발견:', response.memberContext.memberRole);
    return response.memberContext.memberRole;
  }
  
  // Case 2: response.memberRole 형태 (단순 객체)
  if (response.memberRole) {
    console.log('[MemberRoleContext] memberRole 직접 발견:', response.memberRole);
    return response.memberRole;
  }
  
  // Case 3: 중첩 data 객체
  if (response.data && response.data.memberRole) {
    console.log('[MemberRoleContext] data.memberRole 발견:', response.data.memberRole);
    return response.data.memberRole;
  }
  
  // Case 4: data 배열 내부의 memberRole (일부 API 응답)
  if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    const firstItem = response.data[0];
    if (firstItem && firstItem.memberRole) {
      console.log('[MemberRoleContext] data 배열 내부에서 memberRole 발견:', firstItem.memberRole);
      return firstItem.memberRole;
    }
  }
  
  console.log('[MemberRoleContext] 유효한 memberRole 찾지 못함');
  return null;
};

// MemberRole Context 생성
const MemberRoleContext = createContext();

// Context Provider 컴포넌트
export const MemberRoleProvider = ({ children }) => {
  const { studyId } = useParams();
  const [memberRole, setMemberRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 로그 출력
  console.log('[MemberRoleProvider] 초기화, studyId:', studyId);

  // 로컬 스토리지와 studyContextService에서 memberRole 불러오기
  useEffect(() => {
    if (studyId) {
      console.log(`[MemberRoleProvider] studyId 변경 감지: ${studyId}`);
      const storedRole = localStorage.getItem(getMemberRoleKey(studyId));
      
      if (storedRole) {
        console.log(`[MemberRoleProvider] 로컬 스토리지에서 역할 로드: ${storedRole}`);
        setMemberRole(storedRole);
      } else {
        // studyContextService에서 정보 시도
        const cachedContext = studyContextService.getStudyContext(studyId);
        if (cachedContext && cachedContext.memberRole) {
          console.log(`[MemberRoleProvider] studyContextService에서 역할 로드: ${cachedContext.memberRole}`);
          setMemberRole(cachedContext.memberRole);
          // 로컬 스토리지에도 저장
          localStorage.setItem(getMemberRoleKey(studyId), cachedContext.memberRole);
        } else {
          console.log(`[MemberRoleProvider] 역할 정보 찾을 수 없음, studyId: ${studyId}`);
        }
      }
      setIsLoading(false);
    }
  }, [studyId]);

  // memberRole 업데이트 함수
  const updateMemberRole = useCallback((newRole, newStudyId = studyId) => {
    if (!newStudyId) {
      console.log('[MemberRoleProvider] updateMemberRole: studyId가 없어 업데이트 취소');
      return;
    }
    
    console.log(`[MemberRoleProvider] 역할 업데이트: ${newRole} (스터디 ID: ${newStudyId})`);
    
    // 상태 업데이트
    setMemberRole(newRole);
    
    // 로컬 스토리지에 저장
    if (newRole) {
      localStorage.setItem(getMemberRoleKey(newStudyId), newRole);
    } else {
      localStorage.removeItem(getMemberRoleKey(newStudyId));
    }
    
    // studyContextService에도 업데이트 (선택적)
    const cachedContext = studyContextService.getStudyContext(newStudyId);
    if (cachedContext) {
      studyContextService.setStudyContext(newStudyId, { 
        ...cachedContext, 
        memberRole: newRole 
      });
    }
  }, [studyId]);

  // API 응답으로부터 memberRole 추출 후 업데이트
  const updateMemberRoleFromResponse = useCallback((response, newStudyId = studyId) => {
    console.log('[MemberRoleProvider] updateMemberRoleFromResponse 호출:', response);
    
    const role = extractMemberRole(response);
    if (role) {
      console.log(`[MemberRoleProvider] 업데이트할 역할 정보 찾음: ${role}`);
      updateMemberRole(role, newStudyId);
      return true;
    }
    
    console.log('[MemberRoleProvider] 응답에서 역할 정보를 찾을 수 없음');
    return false;
  }, [studyId, updateMemberRole]);

  // 관리자 여부 확인 함수
  const isManager = useCallback(() => {
    console.log('[MemberRoleProvider] isManager 호출, 현재 역할:', memberRole);
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