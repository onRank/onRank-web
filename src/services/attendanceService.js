import axios from 'axios';

const BASE_URL = '/api';

export const attendanceService = {
  // 출석 목록 조회
  getAttendances: async (studyId) => {
    const response = await axios.get(`${BASE_URL}/studies/${studyId}/attendances`);
    return response.data;
  },

  // 특정 일정의 출석 상세 조회
  getAttendanceDetail: async (studyId, scheduleId) => {
    const response = await axios.get(`${BASE_URL}/studies/${studyId}/attendances/${scheduleId}`);
    return response.data;
  },

  // 출석 상태 변경
  updateAttendanceStatus: async (studyId, attendanceId, status) => {
    const response = await axios.put(
      `${BASE_URL}/studies/${studyId}/attendances/${attendanceId}`,
      null,
      { params: { status } }
    );
    return response.data;
  }
}; 