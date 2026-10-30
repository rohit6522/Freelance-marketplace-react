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
};