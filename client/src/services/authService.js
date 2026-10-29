import api from "./api";

export const authService = {
  // Returns the user, or null when not logged in (a 401 here is normal, not an error)
  async me() {
    try {
      const { data } = await api.get("/auth/me");
      return data.user;
    } catch (err) {
      if (err.status === 401) return null;
      throw err;
    }
  },
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data.user;
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data.user;
  },
  async logout() {
    await api.post("/auth/logout");
  },
  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data.message;
  },
  async resetPassword(token, password) {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data.user;
  },
};