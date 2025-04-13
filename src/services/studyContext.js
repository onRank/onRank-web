// studyContext.js - 스터디 컨텍스트 정보 관리 서비스

// 스터디 컨텍스트 정보 캐시
let studyContextCache = {}; // { studyId: { studyName, memberRole, studyImageUrl } }

// 스터디 컨텍스트 관리 서비스
export const studyContextService = {
  // 스터디 컨텍스트 정보 저장
  setStudyContext: (studyId, contextData) => {
    if (!studyId || !contextData) return;
    
    console.log('[디버깅] studyContextService.setStudyContext 호출:', studyId, contextData);
    
    // memberContext 데이터 구조 확인
    const { studyName, memberRole, file } = contextData;
    console.log('[디버깅] memberRole:', memberRole);
    
    const studyImageUrl = file?.fileUrl || null;
    
    // 캐시 업데이트 (기존 데이터와 병합)
    studyContextCache[studyId] = {
      ...studyContextCache[studyId],
      studyName: studyName || studyContextCache[studyId]?.studyName,
      memberRole: memberRole || studyContextCache[studyId]?.memberRole,
      studyImageUrl: studyImageUrl || studyContextCache[studyId]?.studyImageUrl,
      lastUpdated: new Date().getTime()
    };
    
    console.log(`[StudyContextService] 스터디 ${studyId} 컨텍스트 정보 업데이트:`, studyContextCache[studyId]);
  },
  
  // 스터디 컨텍스트 정보 가져오기
  getStudyContext: (studyId) => {
    if (!studyId) return null;
    return studyContextCache[studyId] || null;
  },
  
  // API 응답에서 studyContext 정보 추출 및 저장
  updateFromApiResponse: (studyId, response) => {
    if (!studyId || !response) return;
    
    console.log('[디버깅] updateFromApiResponse:', studyId, response);
    
    // API 응답에서 memberContext 추출 (구조가 다를 수 있음)
    const { memberContext } = response;
    
    if (memberContext) {
      // memberContext 객체가 있는 경우 (일반적인 API 응답)
      console.log('[디버깅] API 응답에서 memberContext 발견:', memberContext);
      studyContextService.setStudyContext(studyId, memberContext);
    } else if (response.memberRole) {
      // memberRole이 최상위에 있는 경우 (일부 API 응답)
      console.log('[디버깅] API 응답에서 최상위 memberRole 발견:', response.memberRole);
      studyContextService.setStudyContext(studyId, response);
    }
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
      if (response.data && response.data.memberContext) {
        studyContextService.updateFromApiResponse(studyId, response.data);
      }
      return response;
    };
    
    return { studyId, responseInterceptor };
  }
  
  return null;
};

export default studyContextService; 