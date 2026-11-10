import api from "./api";

export const publicService = {
  async stats() {
    const { data } = await api.get("/public/stats");
    return data.stats;
  },
};