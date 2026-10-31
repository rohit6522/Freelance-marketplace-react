import api from "./api";

export const reviewService = {
  async list(params) {
    const { data } = await api.get("/reviews", { params });
    return data; // { summary, reviews, pagination }
  },
  async create(payload) {
    const { data } = await api.post("/reviews", payload);
    return data.review;
  },
  async reply(id, text) {
    const { data } = await api.post(`/reviews/${id}/reply`, { text });
    return data.review;
  },
  async report(id, reason) {
    await api.post(`/reviews/${id}/report`, { reason });
  },
};