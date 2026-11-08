import api from "./api";

export const adminService = {
  async stats() {
    const { data } = await api.get("/admin/stats");
    return data.stats;
  },
  async reviews(params) {
    const { data } = await api.get("/admin/reviews", { params });
    return data; // { reviews, pagination }
  },
  async setReviewHidden(id, hidden, reason) {
    const { data } = await api.patch(`/admin/reviews/${id}/visibility`, { hidden, reason });
    return data.review;
  },
  async dismissReports(id, reason) {
    const { data } = await api.post(`/admin/reviews/${id}/dismiss-reports`, { reason });
    return data.review;
  },
  async users(params) {
    const { data } = await api.get("/admin/users", { params });
    return data; // { users, pagination }
  },
  async setUserActive(id, isActive, reason) {
    const { data } = await api.patch(`/admin/users/${id}/status`, { isActive, reason });
    return data; // { isActive, pausedGigs }
  },
  async log(params) {
    const { data } = await api.get("/admin/log", { params });
    return data; // { logs, pagination }
  },
};