import api from "./api";

export const dashboardService = {
  async get(role) {
    const { data } = await api.get(`/dashboard/${role}`);
    return data;
  },
};