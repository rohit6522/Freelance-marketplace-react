import api from "./api";

export const gigService = {
  async list(params) {
    const { data } = await api.get("/gigs", { params });
    return data; // { gigs, pagination }
  },
  async get(id) {
    const { data } = await api.get(`/gigs/${id}`);
    return data; // { gig, seller }
  },

  async mine() {
    const { data } = await api.get("/gigs/mine");
    return data.gigs;
  },
  async create(payload) {
    const { data } = await api.post("/gigs", payload);
    return data.gig;
  },
  async update(id, payload) {
    const { data } = await api.put(`/gigs/${id}`, payload);
    return data.gig;
  },
  async setStatus(id, status) {
    const { data } = await api.patch(`/gigs/${id}/status`, { status });
    return data.gig;
  },
  async remove(id) {
    await api.delete(`/gigs/${id}`);
  },
};