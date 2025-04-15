// studyContext.js - 스터디 컨텍스트 정보 관리 서비스

// 스터디 컨텍스트 정보 캐시
let studyContextCache = {}; // { studyId: { studyName, memberRole, studyImageUrl } }

// 스터디 컨텍스트 관리 서비스
export const studyContextService = {
  // 스터디 컨텍스트 정보 저장
  setStudyContext: (studyId, contextData) => {
    if (!studyId || !contextData) return;
    
    console.log('[StudyContextService] setStudyContext 호출:', studyId, contextData);
    
    // memberContext 또는 직접 데이터 처리
    let studyName, memberRole, file;
    
    if (contextData.memberContext) {
      // memberContext가 포함된 경우
      const { memberContext } = contextData;
      studyName = memberContext.studyName;
      memberRole = memberContext.memberRole;
      file = memberContext.file;
      console.log('[StudyContextService] memberContext에서 추출한 memberRole:', memberRole);
    } else {
      // 직접 데이터가 있는 경우
      studyName = contextData.studyName;
      memberRole = contextData.memberRole;
      file = contextData.file;
      console.log('[StudyContextService] 직접 데이터에서 추출한 memberRole:', memberRole);
    }
    
    const studyImageUrl = file?.fileUrl || null;
    
    // 캐시 업데이트 (기존 데이터와 병합)
    studyContextCache[studyId] = {
      ...studyContextCache[studyId],
      studyName: studyName || studyContextCache[studyId]?.studyName,
      memberRole: memberRole || studyContextCache[studyId]?.memberRole,
      studyImageUrl: studyImageUrl || studyContextCache[studyId]?.studyImageUrl,
      memberContext: contextData.memberContext || studyContextCache[studyId]?.memberContext,
      lastUpdated: new Date().getTime()
    };
    
    console.log(`[StudyContextService] 스터디 ${studyId} 컨텍스트 정보 업데이트:`, studyContextCache[studyId]);
    
    // 로컬 스토리지에도 memberRole 저장 (MemberRoleContext와 같은 형식으로)
    if (memberRole) {
      const roleKey = `memberRole_${studyId}`;
      localStorage.setItem(roleKey, memberRole);
      console.log(`[StudyContextService] 로컬 스토리지에 역할 저장 (${roleKey}):`, memberRole);
    }
    
    return studyContextCache[studyId];
  },
  
  // 스터디 컨텍스트 정보 가져오기
  getStudyContext: (studyId) => {
    if (!studyId) return null;
    
    // 캐시된 컨텍스트 가져오기
    const cachedContext = studyContextCache[studyId];
    
    // 캐시가 없으면 로컬 스토리지에서 역할 정보라도 가져오기
    if (!cachedContext) {
      const roleKey = `memberRole_${studyId}`;
      const storedRole = localStorage.getItem(roleKey);
      
      if (storedRole) {
        console.log(`[StudyContextService] 로컬 스토리지에서 역할 정보 복원 (${roleKey}):`, storedRole);
        return {
          memberRole: storedRole,
          lastUpdated: new Date().getTime()
        };
      }
    }
    
    return cachedContext || null;
  },
  
  // API 응답에서 studyContext 정보 추출 및 저장
  updateFromApiResponse: (studyId, response) => {
    if (!studyId || !response) return null;
    
    console.log('[StudyContextService] updateFromApiResponse:', studyId, response);
    
    // 1. memberContext 속성이 있는 경우 (일반적인 API 응답)
    if (response.memberContext) {
      console.log('[StudyContextService] API 응답에서 memberContext 발견:', response.memberContext);
      return studyContextService.setStudyContext(studyId, response);
    } 
    // 2. memberRole이 최상위에 있는 경우 (일부 API 응답)
    else if (response.memberRole) {
      console.log('[StudyContextService] API 응답에서 최상위 memberRole 발견:', response.memberRole);
      return studyContextService.setStudyContext(studyId, response);
    }
    // 3. data 속성 내에 memberRole이 있는 경우
    else if (response.data && response.data.memberRole) {
      console.log('[StudyContextService] API 응답의 data 내에서 memberRole 발견:', response.data.memberRole);
      return studyContextService.setStudyContext(studyId, response.data);
    }
    
    return null;
  },
  
  // 스터디 컨텍스트 초기화
  clearStudyContext: (studyId) => {
    if (studyId) {
      delete studyContextCache[studyId];
    } else {
      studyContextCache = {}; // 모든 캐시 초기화
    }
  }
};

// API 응답 인터셉터 함수 - axios에 추가할 수 있음
export const studyContextInterceptor = (config) => {
  // URL에서 studyId 추출
  const studyIdMatch = config.url.match(/\/studies\/(\d+)/);
  if (studyIdMatch && studyIdMatch[1]) {
    const studyId = studyIdMatch[1];
    
    // 응답 인터셉터에 등록할 함수
    const responseInterceptor = (response) => {
      if (response.data) {
        studyContextService.updateFromApiResponse(studyId, response.data);
      }
      return response;
    };
    
    return { studyId, responseInterceptor };
  }
  
  return null;
};

export default studyContextService; 