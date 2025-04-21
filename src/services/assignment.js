import { api, tokenUtils } from "./api";
import studyContextService from "./studyContext";
import { uploadFileToS3, extractUploadUrlFromResponse, handleFileUploadWithS3 } from "../utils/fileUtils";

/**
 * 과제 관련 API 서비스
 */
const assignmentService = {
  /**
   * 과제 목록 조회
   * @param {string} studyId - 스터디 ID
   * @returns {Promise<Array>} - 과제 목록
   */
  getAssignments: async (studyId) => {
    try {
      console.log(`[AssignmentService] 과제 목록 조회 요청: ${studyId}`);
      const response = await api.get(`/studies/${studyId}/assignments`, {
        withCredentials: true
      });
      
      console.log("[AssignmentService] 과제 목록 조회 성공:", response.data);
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 과제 상세 조회
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @returns {Promise<Object>} - 과제 상세 정보
   */
  getAssignmentById: async (studyId, assignmentId) => {
    try {
      console.log(`[AssignmentService] 과제 상세 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
      const response = await api.get(`/studies/${studyId}/assignments/${assignmentId}`, {
        withCredentials: true
      });
      
      console.log("[AssignmentService] 과제 상세 조회 성공:", response.data);
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 상세 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 과제 생성
   * @param {string} studyId - 스터디 ID
   * @param {Object|FormData} assignmentData - 과제 데이터 또는 FormData 객체
   * @param {string} assignmentData.assignmentTitle - 과제 제목
   * @param {string} assignmentData.assignmentContent - 과제 내용
   * @param {string} assignmentData.assignmentDueDate - 마감일 (ISO 8601 형식 "yyyy-MM-dd'T'HH:mm:ss")
   * @param {number} assignmentData.assignmentMaxPoint - 최대 점수
   * @param {string[]} assignmentData.fileNames - 첨부 파일명 배열
   * @param {File[]} assignmentData.files - 첨부 파일 객체 배열 (FormData 객체에 포함된 경우)
   * @returns {Promise<Object>} - 생성된 과제 정보
   */
  createAssignment: async (studyId, assignmentData) => {
    try {
      console.log(`[AssignmentService] 과제 생성 요청: ${studyId}`);
      
      // FormData 객체인 경우 파일 처리를 위해 추출
      if (assignmentData instanceof FormData) {
        console.log('[AssignmentService] FormData 객체 감지, preSignedURL 방식으로 처리');
        
        // FormData에서 파일들과 다른 데이터 추출
        const files = [];
        const formDataObj = {};
        
        // FormData 객체에서 파일과 다른 필드 추출
        for (const [key, value] of assignmentData.entries()) {
          if (value instanceof File) {
            files.push(value);
          } else {
            formDataObj[key] = value;
          }
        }
        
        console.log('[AssignmentService] 추출된 데이터:', formDataObj);
        console.log('[AssignmentService] 추출된 파일 수:', files.length);
        
        // 1. 파일 이름 배열 만들기
        const fileNames = files.map(file => file.name);
        
        // 2. 기본 데이터 준비 (파일명 포함)
        const requestData = {
          assignmentTitle: formDataObj.assignmentTitle,
          assignmentContent: formDataObj.assignmentContent,
          assignmentDueDate: formDataObj.assignmentDueDate,
          assignmentMaxPoint: parseInt(formDataObj.assignmentMaxPoint, 10),
          fileNames: fileNames
        };
        
        // 3. API 호출하여 과제 생성 및 preSignedURL 받기
        const response = await api.post(`/studies/${studyId}/assignments`, requestData, {
          withCredentials: true
        });
        
        console.log("[AssignmentService] 과제 생성 성공, 응답 데이터:", response.data);
        
        // 4. 파일 업로드 처리 (fileUtils의 공통 함수 사용)
        if (files.length > 0 && response.data) {
          const uploadResults = await handleFileUploadWithS3(response.data, files, 'uploadUrl');
          
          // 업로드 실패 발생 시 경고
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn('[AssignmentService] 일부 파일 업로드 실패:', failedUploads);
          }
        } else {
          console.warn('[AssignmentService] 업로드할 파일이 없거나 응답 데이터가 없음');
        }
        
        // 스터디 컨텍스트 정보 업데이트
        studyContextService.updateFromApiResponse(studyId, response.data);
        
        return response.data;
      }
      
      // 일반 JSON 객체인 경우 기존 로직 사용
      // 요청 데이터 검증
      if (!assignmentData.assignmentTitle) {
        throw new Error('과제 제목은 필수 항목입니다.');
      }
      
      if (!assignmentData.assignmentContent) {
        throw new Error('과제 내용은 필수 항목입니다.');
      }
      
      if (!assignmentData.assignmentDueDate) {
        throw new Error('과제 마감일은 필수 항목입니다.');
      }
      
      if (assignmentData.assignmentMaxPoint === undefined) {
        throw new Error('과제 최대 점수는 필수 항목입니다.');
      }
      
      // 요청 데이터 형식 맞추기 (Swagger 문서 형식에 맞춤)
      const requestData = {
        assignmentTitle: assignmentData.assignmentTitle,
        assignmentContent: assignmentData.assignmentContent,
        assignmentDueDate: assignmentData.assignmentDueDate,
        assignmentMaxPoint: assignmentData.assignmentMaxPoint,
        fileNames: assignmentData.fileNames || []
      };
      
      console.log('[AssignmentService] 요청 데이터:', requestData);
      
      const response = await api.post(`/studies/${studyId}/assignments`, requestData, {
        withCredentials: true
      });
      
      console.log("[AssignmentService] 과제 생성 성공:", response.data);
      
      // 파일 업로드 처리 (fileUtils의 공통 함수 사용)
      if (assignmentData.files && assignmentData.files.length > 0) {
        await handleFileUploadWithS3(response.data, assignmentData.files, 'uploadUrl');
      }
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 과제 수정
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {Object} assignmentData - 수정할 과제 데이터
   * @returns {Promise<Object>} - 수정된 과제 정보
   */
  /*
  updateAssignment: async (studyId, assignmentId, assignmentData) => {
    try {
      console.log(`[AssignmentService] 과제 수정 요청: 스터디 ${studyId}, 과제 ${assignmentId}`, assignmentData);
      const response = await api.put(`/studies/${studyId}/assignments/${assignmentId}`, assignmentData, {
        withCredentials: true
      });
      
      console.log("[AssignmentService] 과제 수정 성공:", response.data);
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 수정 실패:', error);
      throw error;
    }
  },
  */

  /**
  //  * 과제 삭제
  //  * @param {string} studyId - 스터디 ID
  //  * @param {string} assignmentId - 과제 ID
  //  * @returns {Promise<Object>} - 삭제 결과
  //  */
  // deleteAssignment: async (studyId, assignmentId) => {
  //   try {
  //     console.log(`[AssignmentService] 과제 삭제 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
  //     const response = await api.delete(`/studies/${studyId}/assignments/${assignmentId}`, {
  //       withCredentials: true
  //     });
      
  //     console.log("[AssignmentService] 과제 삭제 성공:", response.data);
      
  //     // 스터디 컨텍스트 정보 업데이트
  //     studyContextService.updateFromApiResponse(studyId, response.data);
      
  //     return response.data;
  //   } catch (error) {
  //     console.error('[AssignmentService] 과제 삭제 실패:', error);
  //     throw error;
  //   }
  // },


  /**
   * 과제 제출
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {Object} submissionData - 제출 데이터
   * @returns {Promise<Object>} - 제출 결과 (uploadUrl 포함)
   */
  submitAssignment: async (studyId, assignmentId, submissionData) => {
    try {
      console.log(`[AssignmentService] 과제 제출 요청: 스터디 ${studyId}, 과제 ${assignmentId}`, submissionData);
      
      // Swagger 문서에 맞는 API 호출
      const response = await api.post(
        `/studies/${studyId}/assignments/${assignmentId}/submissions`, 
        submissionData,
        {
          withCredentials: true
        }
      );
      
      console.log("[AssignmentService] 과제 제출 응답:", response.data);
      
      // OAuth 리다이렉트 처리
      if (response.status === 302 || response.headers?.location) {
        const redirectUrl = response.headers?.location;
        console.log("[AssignmentService] 리다이렉트 감지:", redirectUrl);
        return {
          ...response.data,
          redirectUrl,
          isRedirect: true
        };
      }
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      // 오류 응답에서 리다이렉트 감지
      if (error.response?.status === 302 || error.response?.headers?.location) {
        const redirectUrl = error.response.headers.location;
        console.log("[AssignmentService] 오류 응답에서 리다이렉트 감지:", redirectUrl);
        return {
          redirectUrl,
          isRedirect: true
        };
      }
      
      console.error('[AssignmentService] 과제 제출 실패:', error);
      throw error;
    }
  },

  /**
   * 제출 목록 조회 (관리자용)
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @returns {Promise<Array>} - 제출 목록
   */
  /*
  getSubmissions: async (studyId, assignmentId) => {
    try {
      console.log(`[AssignmentService] 제출 목록 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
      const response = await api.get(`/studies/${studyId}/assignments/${assignmentId}/submissions`, {
        withCredentials: true
      });
      
      console.log("[AssignmentService] 제출 목록 조회 성공:", response.data);
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 제출 목록 조회 실패:', error);
      throw error;
    }
  },
  */

  /**
   * 과제 채점
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {string} submissionId - 제출 ID
   * @param {Object} gradeData - 채점 데이터
   * @returns {Promise<Object>} - 채점 결과
   */
  /*
  gradeSubmission: async (studyId, assignmentId, submissionId, gradeData) => {
    try {
      console.log(`[AssignmentService] 과제 채점 요청: 스터디 ${studyId}, 과제 ${assignmentId}, 제출 ${submissionId}`);
      const response = await api.post(
        `/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}/grade`, 
        gradeData,
        { withCredentials: true }
      );
      
      console.log("[AssignmentService] 과제 채점 성공:", response.data);
      
      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 채점 실패:', error);
      throw error;
    }
  }
  */
};

export default assignmentService; 