import { api, tokenUtils } from "./api";

const calendarService = {
  getCalendarEvents: async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await api.get("/auth/calendar", {
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