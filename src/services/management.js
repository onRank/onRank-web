import { api, tokenUtils } from "./api";

// 관리 페이지 서비스
export const managementService = {
  // 스터디 관리 데이터 조회
  getManagementData: async (studyId) => {
    try {
      console.log(`[ManagementService] 스터디 관리 데이터 조회 요청: ${studyId}`);
      const response = await api.get(`/studies/${studyId}/management`, {
        withCredentials: true,
      });
      console.log("[ManagementService] 스터디 관리 데이터 조회 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 스터디 관리 데이터 조회 오류:", error);
      throw error;
    }
  },

  // 스터디 정보 수정 (파일 업로드 포함)
  updateStudyInfo: async (studyId, formData) => {
    try {
      console.log(`[ManagementService] 스터디 정보 수정 요청: ${studyId}`);
      
      // 필수 입력 항목 검증
      if (!formData.get('studyName')) {
        throw new Error('스터디 이름은 필수 항목입니다.');
      }
      
      // 출석 점수 검증
      const presentPoint = formData.get('presentPoint');
      const absentPoint = formData.get('absentPoint');
      const latePoint = formData.get('latePoint');
      
      if (presentPoint === null || absentPoint === null || latePoint === null) {
        throw new Error('출석, 결석, 지각 점수는 필수 항목입니다.');
      }
      
      const response = await api.put(`/studies/${studyId}/management`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log("[ManagementService] 스터디 정보 수정 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 스터디 정보 수정 오류:", error);
      throw error;
    }
  },

  // 회원 목록 조회
  getMembers: async (studyId) => {
    try {
      console.log(`[ManagementService] 회원 목록 조회 요청: ${studyId}`);
      const response = await api.get(`/studies/${studyId}/management/members`, {
        withCredentials: true
      });
      console.log("[ManagementService] 회원 목록 조회 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 회원 목록 조회 오류:", error);
      throw error;
    }
  },

  // 회원 추가
  addMember: async (studyId, memberData) => {
    try {
      console.log(`[ManagementService] 회원 추가 요청: ${studyId}, 이메일 ${memberData.studentEmail}`);
      
      // API 요청 데이터 준비 (이메일만 필요)
      const requestData = {
        studentEmail: memberData.studentEmail,
      };

      const response = await api.post(
        `/studies/${studyId}/management/members/add`,
        requestData,
        { withCredentials: true }
      );

      console.log("[ManagementService] 회원 추가 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 회원 추가 오류:", error);
      
      // 404 에러인 경우 회원가입하지 않은 이메일 메시지 반환
      if (error.response && error.response.status === 404) {
        throw new Error("회원가입 하지 않은 이메일입니다.");
      }
      
      // 그 외 오류 메시지 반환
      throw error;
    }
  },

  // 회원 역할 변경
  changeMemberRole: async (studyId, memberId, roleData) => {
    try {
      console.log(
        `[ManagementService] 회원 역할 변경 요청: 스터디 ${studyId}, 회원 ${memberId}, 역할 ${typeof roleData === 'string' ? roleData : JSON.stringify(roleData)}`
      );
      
      // 요청 데이터는 memberRole만 필요
      const requestData = typeof roleData === 'string' 
        ? { memberRole: roleData } 
        : { memberRole: roleData.memberRole };

      const response = await api.put(
        `/studies/${studyId}/management/members/${memberId}/role`,
        requestData,
        { withCredentials: true }
      );

      console.log("[ManagementService] 회원 역할 변경 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 회원 역할 변경 오류:", error);
      throw error;
    }
  },

  // 회원 삭제
  removeMember: async (studyId, memberId) => {
    try {
      console.log(`[ManagementService] 회원 삭제 요청: 스터디 ${studyId}, 회원 ${memberId}`);
      
      await api.delete(`/studies/${studyId}/management/members/${memberId}`, {
        withCredentials: true
      });
      
      console.log("[ManagementService] 회원 삭제 성공");
      return true;
    } catch (error) {
      console.error("[ManagementService] 회원 삭제 오류:", error);
      throw error;
    }
  },
  
  // 스터디 삭제
  deleteStudy: async (studyId) => {
    try {
      console.log(`[ManagementService] 스터디 삭제 요청: ${studyId}`);
      
      await api.delete(`/studies/${studyId}/management`, {
        withCredentials: true
      });
      
      console.log("[ManagementService] 스터디 삭제 성공");
      return true;
    } catch (error) {
      console.error("[ManagementService] 스터디 삭제 오류:", error);
      throw error;
    }
  }
}; 