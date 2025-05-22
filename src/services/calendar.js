import { api, tokenUtils } from "./api";

const calendarService = {
  getCalendarEvents: async (year, month) => {
    try {
      const token = tokenUtils.getToken();
      let url = "/auth/calendar";
      
      // If both year and month are provided, add query parameters
      if (year && month) {
        url = `/auth/calendar?year=${year}&month=${month}`;
      }
      
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[Calendar Service] API Response:", response);
      return response.data;
    } catch (error) {
      console.error("[Calendar Service] Error fetching calendar data:", error);
      throw error;
    }
  },
};

export default calendarService; 