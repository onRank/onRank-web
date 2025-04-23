import { api, tokenUtils } from "./api";
import studyContextService from "./studyContext";
import { uploadFileToS3, extractUploadUrlFromResponse, uploadFilesWithPresignedUrls } from "../utils/fileUtils";

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
      
      // 파일 객체가 있고 응답에 uploadUrl이 있는 경우 파일 업로드
      if (assignmentData.files && assignmentData.files.length > 0) {
        // 업데이트된 함수 사용: extractMultiple=true로 모든 uploadUrl 추출
        const uploadUrls = extractUploadUrlFromResponse(response.data, 'uploadUrl', true);
        
        if (uploadUrls && Array.isArray(uploadUrls) && uploadUrls.length > 0) {
          console.log('[AssignmentService] 업로드 URL 배열 발견:', uploadUrls.length);
          
          // 새로 만든 함수를 사용하여 파일 업로드
          const uploadResults = await uploadFilesWithPresignedUrls(assignmentData.files, uploadUrls);
          console.log('[AssignmentService] 파일 업로드 결과:', uploadResults);
          
          // 업로드 실패 발생 시 경고
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn('[AssignmentService] 일부 파일 업로드 실패:', failedUploads);
          }
        } else {
          console.warn('[AssignmentService] 업로드 URL을 찾을 수 없거나 파일이 없음');
        }
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
        `/studies/${studyId}/assignments/${assignmentId}`, 
        submissionData,
        {
          withCredentials: true
        }
      );
      
      console.log("[AssignmentService] 과제 제출 응답:", response.data);
      
      if (submissionData.files && submissionData.files.length > 0) {
        const uploadUrls = extractUploadUrlFromResponse(response.data, 'uploadUrl', true);
        if (uploadUrls && Array.isArray(uploadUrls) && uploadUrls.length > 0) {
          const uploadResults = await uploadFilesWithPresignedUrls(submissionData.files, uploadUrls);
          console.log('[AssignmentService] 파일 업로드 결과:', uploadResults);

          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn('[AssignmentService] 일부 파일 업로드 실패:', failedUploads);
          }
          else {
            console.log('AssignmentService] 업로드 URL을 찾을 수 없거나 파일이 없음');
          }
        }
      }

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);
      
      return response.data;
    } catch (error) {
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