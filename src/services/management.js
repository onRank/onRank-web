import { api, tokenUtils } from "./api";

// 관리 페이지 서비스
export const managementService = {
  // 스터디 관리 데이터 조회
  getManagementData: async (studyId) => {
    try {
      console.log(
        `[ManagementService] 스터디 관리 데이터 조회 요청: ${studyId}`
      );
      const response = await api.get(`/studies/${studyId}/management`, {
        withCredentials: true,
      });
      console.log(
        "[ManagementService] 스터디 관리 데이터 조회 성공:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("[ManagementService] 스터디 관리 데이터 조회 오류:", error);
      throw error;
    }
  },

  // 스터디 정보 수정 (파일 업로드 포함)
  updateStudyInfo: async (studyId, requestData) => {
    try {
      console.log(
        `[ManagementService] 스터디 정보 수정 요청: ${studyId}`,
        requestData
      );

      // 필수 입력 항목 검증
      if (!requestData.studyName) {
        throw new Error("스터디 이름은 필수 항목입니다.");
      }

      // 출석 점수 검증
      if (
        requestData.presentPoint === undefined ||
        requestData.absentPoint === undefined ||
        requestData.latePoint === undefined
      ) {
        throw new Error("출석, 결석, 지각 점수는 필수 항목입니다.");
      }

      // studyStatus 필드 확인
      if (!requestData.studyStatus) {
        console.warn(
          "[ManagementService] studyStatus 필드가 누락되었습니다. PROGRESS로 설정합니다."
        );
        requestData.studyStatus = "PROGRESS";
      }

      // 로깅: 전송되는 데이터 내용
      console.log("[ManagementService] 요청 데이터:", requestData);

      const response = await api.put(
        `/studies/${studyId}/management`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

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
        withCredentials: true,
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
      console.log(
        `[ManagementService] 회원 추가 요청: ${studyId}, 이메일 ${memberData.studentEmail}`
      );

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
        `[ManagementService] 회원 역할 변경 요청: 스터디 ${studyId}, 회원 ${memberId}, 역할 ${
          typeof roleData === "string" ? roleData : JSON.stringify(roleData)
        }`
      );

      // 요청 데이터는 memberRole만 필요
      const requestData =
        typeof roleData === "string"
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
      console.log(
        `[ManagementService] 회원 삭제 요청: 스터디 ${studyId}, 회원 ${memberId}`
      );

      await api.delete(`/studies/${studyId}/management/members/${memberId}`, {
        withCredentials: true,
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
      const response = await api.delete(`/studies/${studyId}/management`, {
        withCredentials: true, // 쿠키 기반 인증 사용 시
        headers: {
          Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("[managementService] 스터디 삭제 실패:", error);
      throw error;
    }
  },
};
