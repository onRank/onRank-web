import { api, tokenUtils } from "./api";
import studyContextService from "./studyContext";
import {
  extractUploadUrlFromResponse,
  handleFileUploadWithS3,
  uploadFileToS3
} from "../utils/fileUtils";

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
        withCredentials: true,
      });

      console.log("[AssignmentService] 과제 목록 조회 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 목록 조회 실패:", error);
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
      console.log(
        `[AssignmentService] 과제 상세 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}`
      );
      const response = await api.get(
        `/studies/${studyId}/assignments/${assignmentId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 과제 상세 조회 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 상세 조회 실패:", error);
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

      // FormData 객체인 경우 새 접근 방식 사용
      if (assignmentData instanceof FormData) {
        console.log("[AssignmentService] FormData 객체가 더 이상 지원되지 않습니다. JSON 방식을 사용하세요.");
        throw new Error("FormData 방식이 더 이상 지원되지 않습니다. 파일과 메타데이터를 별도로 처리하는 방식을 사용하세요.");
      }

      // 일반 JSON 객체 방식 - 기존 로직 개선
      // 요청 데이터 검증
      if (!assignmentData.assignmentTitle) {
        throw new Error("과제 제목은 필수 항목입니다.");
      }

      if (!assignmentData.assignmentContent) {
        throw new Error("과제 내용은 필수 항목입니다.");
      }

      if (!assignmentData.assignmentDueDate) {
        throw new Error("과제 마감일은 필수 항목입니다.");
      }

      if (assignmentData.assignmentMaxPoint === undefined) {
        throw new Error("과제 최대 점수는 필수 항목입니다.");
      }

      // 요청 데이터 형식 맞추기 (Swagger 문서 형식에 맞춤)
      const requestData = {
        assignmentTitle: assignmentData.assignmentTitle,
        assignmentContent: assignmentData.assignmentContent,
        assignmentDueDate: assignmentData.assignmentDueDate,
        assignmentMaxPoint: assignmentData.assignmentMaxPoint,
        fileNames: assignmentData.fileNames || [],
      };

      console.log("[AssignmentService] 요청 데이터:", requestData);
      
      // 파일 객체들 임시 저장 (업로드에 사용)
      const files = assignmentData.files || [];

      // API 호출하여 과제 생성 및 preSignedURL 받기
      const response = await api.post(
        `/studies/${studyId}/assignments`,
        requestData,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 과제 생성 성공:", JSON.stringify(response.data, null, 2));

      // 파일 업로드 처리 - 실제 파일이 있는 경우
      if (files.length > 0 && response.data) {
        console.log("[AssignmentService] 파일 업로드 시작, 파일 개수:", files.length);
        
        // handleFileUploadWithS3 함수 사용 - 여러 파일 한번에 처리
        const uploadResults = await handleFileUploadWithS3(response.data, files, 'uploadUrl');
        console.log("[AssignmentService] 파일 업로드 결과:", uploadResults);
        
        // 업로드 실패 발생 시 경고
        const failedUploads = uploadResults.filter(result => !result.success);
        if (failedUploads.length > 0) {
          console.warn("[AssignmentService] 일부 파일 업로드 실패:", failedUploads);
          response.data.warning = "일부 파일 업로드에 실패했습니다.";
        }
      }

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 생성 실패:", error);
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
  updateAssignment: async (studyId, assignmentId, assignmentData) => {
    try {
      console.log(`[AssignmentService] 과제 수정 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
      
      // FormData 객체인 경우 파일 처리를 위해 추출
      if (assignmentData instanceof FormData) {
        console.log(
          "[AssignmentService] FormData 객체 감지, preSignedURL 방식으로 처리"
        );

        // FormData에서 파일들과 다른 데이터 추출
        const files = [];
        const formDataObj = {};
        const remainingFileIds = [];
        const newFileNames = [];

        // FormData 객체에서 파일과 다른 필드 추출
        for (const [key, value] of assignmentData.entries()) {
          if (key === 'files' && value instanceof File) {
            files.push(value);
          } else if (key === 'remainingFileIds') {
            // FormData에서는 모든 값이 문자열로 오므로 숫자로 변환
            remainingFileIds.push(parseInt(value, 10));
          } else if (key === 'newFileNames') {
            newFileNames.push(value);
          } else {
            formDataObj[key] = value;
          }
        }

        console.log("[AssignmentService] 추출된 데이터:", formDataObj);
        console.log("[AssignmentService] 추출된 파일 수:", files.length);
        console.log("[AssignmentService] 남길 파일 ID 목록:", remainingFileIds);
        console.log("[AssignmentService] 새 파일 이름 목록:", newFileNames);

        // API 호출에 필요한 데이터 준비 (API 문서에 맞게 변경)
        const requestData = {
          assignmentTitle: formDataObj.assignmentTitle,
          assignmentContent: formDataObj.assignmentContent,
          assignmentDueDate: formDataObj.assignmentDueDate,
          assignmentMaxPoint: parseInt(formDataObj.assignmentMaxPoint, 10) || 100,
          remainingFileIds: remainingFileIds,
          newFileNames: newFileNames
        };

        console.log("[AssignmentService] API 요청 데이터:", requestData);

        // API 호출하여 과제 수정 및 preSignedURL 받기
        const response = await api.put(
          `/studies/${studyId}/assignments/${assignmentId}/edit`,
          requestData,
          {
            withCredentials: true,
          }
        );

        console.log(
          "[AssignmentService] 과제 수정 성공, 응답 데이터:",
          JSON.stringify(response.data, null, 2)
        );

        // 파일 업로드 처리
        if (files.length > 0 && response.data) {
          console.log("[AssignmentService] 파일 업로드 시작, 파일 개수:", files.length);
          
          // handleFileUploadWithS3 함수 사용 - 여러 파일 한번에 처리
          const uploadResults = await handleFileUploadWithS3(response.data, files, 'uploadUrl');
          console.log("[AssignmentService] 파일 업로드 결과:", uploadResults);
          
          // 업로드 실패 발생 시 경고
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn("[AssignmentService] 일부 파일 업로드 실패:", failedUploads);
          }
        } else {
          console.log("[AssignmentService] 업로드할 새 파일이 없거나 응답 데이터가 없음");
        }

        // 스터디 컨텍스트 정보 업데이트
        studyContextService.updateFromApiResponse(studyId, response.data);

        return response.data;
      }
      
      // 일반 JSON 객체인 경우 기존 로직 사용 (API 문서에 맞게 변경)
      // fileNames 대신 remainingFileIds와 newFileNames를 사용하도록 확인
      if (assignmentData.fileNames !== undefined && !assignmentData.remainingFileIds) {
        // 기존 형식을 새 형식으로 변환
        console.warn("[AssignmentService] fileNames 필드 감지, API 스펙에 맞게 변환합니다");
        assignmentData = {
          ...assignmentData,
          remainingFileIds: [],
          newFileNames: assignmentData.fileNames || [],
        };
        delete assignmentData.fileNames;
      }
      
      console.log("[AssignmentService] JSON 요청 데이터:", assignmentData);
      
      const response = await api.put(`/studies/${studyId}/assignments/${assignmentId}/edit`, assignmentData, {
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

  /**
   * 수정용 과제 조회
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @returns {Promise<Object>} - 수정할 과제 정보
   */
  getAssignmentForEdit: async (studyId, assignmentId) => {
    try {
      console.log(
        `[AssignmentService] 수정용 과제 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}`
      );
      const response = await api.get(
        `/studies/${studyId}/assignments/${assignmentId}/edit`,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 수정용 과제 조회 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 수정용 과제 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 과제 삭제
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @returns {Promise<Object>} - 삭제 결과
   */
  deleteAssignment: async (studyId, assignmentId) => {
    try {
      console.log(`[AssignmentService] 과제 삭제 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
      const response = await api.delete(`/studies/${studyId}/assignments/${assignmentId}`, {
        withCredentials: true
      });

      console.log("[AssignmentService] 과제 삭제 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error('[AssignmentService] 과제 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 과제 제출
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {Object} submissionData - 제출 데이터
   * @returns {Promise<Object>} - 제출 결과 (uploadUrl 포함)
   */
  submitAssignment: async (studyId, assignmentId, submissionData) => {
    try {
      console.log(
        `[AssignmentService] 과제 제출 요청: 스터디 ${studyId}, 과제 ${assignmentId}`,
        submissionData
      );

      // Swagger 문서에 맞는 API 호출
      const response = await api.post(
        `/studies/${studyId}/assignments/${assignmentId}`,
        submissionData,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 과제 제출 응답:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 제출 실패:", error);
      throw error;
    }
  },

  /**
   * 과제 재제출
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {Object} resubmissionData - 재제출 데이터
   * @param {string} resubmissionData.submissionContent - 제출물 본문 내용
   * @param {Array<number>} resubmissionData.remainingFileIds - 유지할 기존 파일 ID 목록
   * @param {Array<string>} resubmissionData.newFileNames - 새로 제출할 파일 이름 목록
   * @returns {Promise<Object>} - 재제출 결과 (uploadUrl 포함)
   */
  resubmitAssignment: async (studyId, assignmentId, resubmissionData) => {
    try {
      console.log(
        `[AssignmentService] 과제 재제출 요청: 스터디 ${studyId}, 과제 ${assignmentId}`,
        resubmissionData
      );

      // API 문서에 맞게 PUT 요청으로 변경
      const response = await api.put(
        `/studies/${studyId}/assignments/${assignmentId}/resubmit`,
        resubmissionData,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 과제 재제출 응답:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 재제출 실패:", error);
      throw error;
    }
  },

  /**
   * 과제 제출물 목록 조회
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @returns {Promise<Object>} - 제출물 목록 및 컨텍스트 정보
   */
  getSubmissions: async (studyId, assignmentId) => {
    try {
      console.log(`[AssignmentService] 과제 제출물 목록 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}`);
      const response = await api.get(
        `/studies/${studyId}/assignments/${assignmentId}/submissions`,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 과제 제출물 목록 조회 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 과제 제출물 목록 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 과제 채점
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {string} submissionId - 제출 ID
   * @param {Object} gradeData - 채점 데이터
   * @param {number} gradeData.submissionScore - 점수
   * @param {string} gradeData.submissionComment - 코멘트 (선택)
   * @returns {Promise<Object>} - 채점 결과
   */
  scoreSubmission: async (studyId, assignmentId, submissionId, gradeData) => {
    try {
      console.log(`[AssignmentService] 과제 채점 요청: 스터디 ${studyId}, 과제 ${assignmentId}, 제출 ${submissionId}`);
      
      const response = await api.post(
        `/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}`,
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
  },

  /**
   * 제출물 상세 조회
   * @param {string} studyId - 스터디 ID
   * @param {string} assignmentId - 과제 ID
   * @param {string} submissionId - 제출물 ID
   * @returns {Promise<Object>} - 제출물 상세 정보
   */
  getSubmissionById: async (studyId, assignmentId, submissionId) => {
    try {
      console.log(`[AssignmentService] 제출물 상세 조회 요청: 스터디 ${studyId}, 과제 ${assignmentId}, 제출물 ${submissionId}`);
      const response = await api.get(
        `/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[AssignmentService] 제출물 상세 조회 성공:", response.data);

      // 스터디 컨텍스트 정보 업데이트
      studyContextService.updateFromApiResponse(studyId, response.data);

      return response.data;
    } catch (error) {
      console.error("[AssignmentService] 제출물 상세 조회 실패:", error);
      throw error;
    }
  }
};

export default assignmentService;
