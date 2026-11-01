import api from "./api";

export const portfolioService = {
  async mine() {
    const { data } = await api.get("/portfolio/mine");
    return data.projects;
  },
  async create(payload) {
    const { data } = await api.post("/portfolio", payload);
    return data.project;
  },
  async update(id, payload) {
    const { data } = await api.put(`/portfolio/${id}`, payload);
    return data.project;
  },
  async remove(id) {
    await api.delete(`/portfolio/${id}`);
  },
};